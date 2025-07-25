const axios = require('axios');
const catchAsync = require("../utils/catchAsync")
require('dotenv').config()
const jwt = require('jsonwebtoken');
const dbOpsQueue = require('../queues/dbOpsQueue');
const Feedback = require('../models/feedback.model');
const News = require('../models/news.model');
const { Op } = require('sequelize');
const MAX_FEEDBACKS_PER_DAY = 5

const predictNews = catchAsync(async (req, res, next) => {
    const flaskUrl = process.env.FLASK_URL;
    const news = req.body.news;
    try {
        const response = await axios.post(`${flaskUrl}/predict`, {
            news
        });

        console.log(response.data.cleaned_news)
        const token = jwt.sign({
            news: response.data.cleaned_news,
            userId: req.user.userId,
            prediction: response.data.prediction,
            timestamp: Date.now()
        },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        await dbOpsQueue.add('db-task', {
            task: "store-news",
            payload: { news: response.data.cleaned_news, prediction: response.data.prediction }
        });

        return res.success({
            ...response.data,
            token
        });

    } catch (err) {
        if (err.response) {
            return res.error(
                err.response.status,
                err.response.data?.error || "Flask API Error"
            )
        }

        return next(err);
    }
});

const storeFeedback = catchAsync(async (req, res) => {
    const { news, label } = req.body

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const feedbackCount = await Feedback.count({
        where: {
            userId: req.user.userId,
            createdAt: {
                [Op.gte]: startOfDay,
            },
        },
    });

    if (feedbackCount >= MAX_FEEDBACKS_PER_DAY) {
        return res.error(429, "You’ve reached your daily feedback limit. Try again tomorrow.")
    }

    const newsEntry = await News.findOne({ where: { news } });

    if (!newsEntry) {
        return res.error(404, "News entry not found.");
    }

    await Feedback.upsert({
        userId: req.user.userId,
        newsId: newsEntry.id,
        label
    });
    res.success(null, 200, "Feedback submitted successfully");
})

module.exports = {
    predictNews,
    storeFeedback
}