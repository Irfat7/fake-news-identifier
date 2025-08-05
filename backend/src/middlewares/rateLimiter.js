// rateLimiter.js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const logger = require('../utils/logger');
const { rateLimiterRedis } = require('../config/redisConnection');

// Different rate limiters for different endpoints
const createRateLimiter = (keyPrefix, points, duration, blockDuration = duration) => {
    return new RateLimiterRedis({
        storeClient: rateLimiterRedis,
        keyPrefix: keyPrefix,
        points: points, // Number of requests
        duration: duration, // Per duration in seconds
        blockDuration: blockDuration, // Block for duration in seconds
        execEvenly: true,
        // timeout to prevent hanging
        execTimeoutMs: 5000
    });
};

// Rate limiters for different operations
const rateLimiters = {
    signin: createRateLimiter('signin', 5, 60, 300), // 5 attempts per minute, block for 5 minutes
    prediction: createRateLimiter('prediction', 20, 60), // 20 predictions per minute
    feedback: createRateLimiter('feedback', 5, 86400), // 5 feedbacks per day
    general: createRateLimiter('general', 100, 60), // 100 requests per minute
    signup: createRateLimiter('signup', 3, 3600) // 3 registrations per hour
};

// Middleware factory with improved error handling
const createRateLimitMiddleware = (limiterType) => {
    return async (req, res, next) => {
        const limiter = rateLimiters[limiterType];
        const key = req.ip;

        try {
            const consumePromise = limiter.consume(key);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Rate limiter timeout')), 5000);
            });

            await Promise.race([consumePromise, timeoutPromise]);
            next();
        } catch (error) {
            // Handle different types of errors
            if (error.message === 'Rate limiter timeout') {
                logger.error('Rate limiter timeout', {
                    type: 'rate-limit-timeout',
                    limiterType: limiterType,
                    ip: req.ip,
                    userId: req.user?.userId
                });

                // If Redis is having issues, allow the request to continue
                // but log the issue for monitoring
                console.warn('Rate limiter timeout - allowing request to continue');
                return next();
            }

            // Check if it's a rate limit exceeded error
            if (error.remainingHits !== undefined || error.msBeforeNext !== undefined) {
                // This is a rate limit exceeded error
                const secs = Math.round(error.msBeforeNext / 1000) || 1;

                logger.warn('Rate limit exceeded', {
                    type: 'rate-limit',
                    limiterType: limiterType,
                    ip: req.ip,
                    userId: req.user?.userId,
                    resetTime: secs,
                    remainingHits: error.remainingHits,
                    totalHits: error.totalHits
                });

                res.set('Retry-After', String(secs));
                return res.error(429, "Too many requests");
            }

            // Handle Redis connection errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                logger.error('Redis connection error in rate limiter', {
                    type: 'redis-connection-error',
                    limiterType: limiterType,
                    ip: req.ip,
                    error: error.message,
                    code: error.code
                });

                // If Redis is down, allow the request to continue
                // but log the issue for monitoring
                console.warn('Redis connection error - allowing request to continue');
                return next();
            }

            // For any other unexpected errors
            logger.error('Unexpected rate limiter error', {
                type: 'rate-limit-error',
                limiterType: limiterType,
                ip: req.ip,
                error: error.message,
                stack: error.stack
            });

            console.warn('Unexpected rate limiter error - allowing request to continue');
            next();
        }
    };
};

module.exports = {
    signinRateLimit: createRateLimitMiddleware('signin'),
    predictionRateLimit: createRateLimitMiddleware('prediction'),
    feedbackRateLimit: createRateLimitMiddleware('feedback'),
    signupRateLimit: createRateLimitMiddleware('signup'),
};