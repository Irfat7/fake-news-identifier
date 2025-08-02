const axios = require('axios');
const catchAsync = require("../utils/catchAsync")
require('dotenv').config()
const jwt = require('jsonwebtoken');
const dbOpsQueue = require('../queues/dbOpsQueue');
const Feedback = require('../models/feedback.model');
const News = require('../models/news.model');
const CircuitBreaker = require('../utils/circuitBreaker');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { LRUCache } = require('lru-cache')
const flaskClient = require('../services/flaskClient');
const { totalPredictions, predictionLatency, predictionLabelCount, feedbackTotal } = require('../utils/metrics');

const MAX_FEEDBACKS_PER_DAY = 5;

const newsCache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 10,
})

const createCacheKey = (news) => {
    return crypto.createHash('md5').update(news.toLowerCase().trim()).digest('hex');
};

const flaskCircuitBreaker = new CircuitBreaker(5, 30000); // 5 failures, 30s timeout

const predictNews = catchAsync(async (req, res, next) => {
    const start = Date.now();
    const news = req.body.news;
    const cacheKey = createCacheKey(news);

    // 🚀 OPTIMIZATION 5: Check cache first
    const cachedResult = newsCache.get(cacheKey);
    if (cachedResult) {
        console.log('Cache hit for news prediction');

        // Still generate token and queue DB operation
        const token = jwt.sign({
            news: cachedResult.cleaned_news,
            userId: req.user.userId,
            prediction: cachedResult.prediction,
            timestamp: Date.now()
        }, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Queue DB operation asynchronously (don't wait)
        dbOpsQueue.add('db-task', {
            task: "store-news",
            payload: {
                news: cachedResult.cleaned_news,
                prediction: cachedResult.prediction
            }
        }).catch(err => console.error('Queue error:', err));


        predictionLabelCount.inc({ label: cachedResult.prediction })
        predictionLatency.observe((Date.now() - start) / 1000);
        totalPredictions.inc()
        return res.success({
            ...cachedResult,
            token,
            cached: true
        });
    }

    try {
        // 🚀 OPTIMIZATION 6: Use circuit breaker for Flask calls
        const response = await flaskCircuitBreaker.call(async () => {
            return await flaskClient.post('/predict',
                { news },
                {
                    headers: {
                        'Authorization': `Bearer ${req.token}`,
                        'Content-Type': 'application/json'
                    },
                    // Add request-specific timeout
                    timeout: 15000 // 15s for individual requests
                }
            );
        });

        const predictionResult = {
            cleaned_news: response.data.cleaned_news,
            prediction: response.data.prediction
        };

        // 🚀 OPTIMIZATION 7: Cache the result for future requests
        newsCache.set(cacheKey, predictionResult);

        // 🚀 OPTIMIZATION 8: Generate token synchronously but queue DB asynchronously
        const token = jwt.sign({
            news: response.data.cleaned_news,
            userId: req.user.userId,
            prediction: response.data.prediction,
            timestamp: Date.now()
        }, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Queue DB operation without waiting (fire and forget)
        dbOpsQueue.add('db-task', {
            task: "store-news",
            payload: {
                news: response.data.cleaned_news,
                prediction: response.data.prediction
            }
        }, {
            // Add job options for better queue management
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: 100, // Keep only last 100 completed jobs
            removeOnFail: 50, // Keep only last 50 failed jobs
        }).catch(err => console.error('Queue error:', err));

        predictionLabelCount.inc({ label: response.data.prediction })
        predictionLatency.observe((Date.now() - start) / 1000);
        totalPredictions.inc()
        return res.success({
            ...predictionResult,
            token
        });

    } catch (err) {
        console.error("Flask API Error:", err.message);

        // 🚀 OPTIMIZATION 9: Better error handling with specific error types
        if (err.message === 'Circuit breaker is OPEN') {
            return res.error(503, "Service temporarily unavailable. Please try again later.");
        }

        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            return res.error(504, "Request timeout. Please try again.");
        }

        if (err.response) {
            return res.error(
                err.response.status,
                err.response.data?.error || "Flask API Error"
            );
        }

        return next(err);
    }
});

// 🚀 OPTIMIZATION 10: Optimize feedback storage with better querying
const storeFeedback = catchAsync(async (req, res) => {
    const { news, label } = req.body;
    const userId = req.user.userId;

    try {
        // Use Promise.all for parallel database operations
        const [feedbackCount, newsEntry] = await Promise.all([
            // More efficient count query with indexed fields
            Feedback.count({
                where: {
                    userId,
                    createdAt: {
                        [Op.gte]: new Date().setHours(0, 0, 0, 0)
                    }
                }
            }),
            // Find news entry
            News.findOne({
                where: { news },
                attributes: ['id'] // Only fetch id to reduce data transfer
            })
        ]);

        if (feedbackCount >= MAX_FEEDBACKS_PER_DAY) {
            return res.error(429, "You've reached your daily feedback limit. Try again tomorrow.");
        }

        if (!newsEntry) {
            return res.error(404, "News entry not found.");
        }

        // Use upsert efficiently
        await Feedback.upsert({
            userId,
            newsId: newsEntry.id,
            label
        });

        feedbackTotal.inc();
        res.success(null, 200, "Feedback submitted successfully");
    } catch (error) {
        console.error('Feedback storage error:', error);
        return next(error);
    }
});

module.exports = {
    predictNews,
    storeFeedback
};