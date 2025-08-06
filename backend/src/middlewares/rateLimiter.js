const { rateLimiterRedis } = require('../config/redisConnection')
const { RateLimiterRedis } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

const createRateLimiter = (keyPrefix, points, duration, blockDuration = duration) => {
    return new RateLimiterRedis({
        storeClient: rateLimiterRedis,
        points,
        duration,
        blockDuration,
        keyPrefix
    })
}

const allRateLimiters = {
    signin: createRateLimiter('signin', 5, 60, 300), // 5 attempts per minute, block for 5 minutes
    prediction: createRateLimiter('prediction', 20, 60),
    feedback: createRateLimiter('feedback', 5, 86400),
    general: createRateLimiter('general', 100, 60),
    signup: createRateLimiter('signup', 3, 3600)
}

const createRateLimitMiddleware = (limiterType) => {
    return async (req, res, next) => {
        const limiter = allRateLimiters[limiterType]
        const key = req.ip
        try {
            const consumePromise = limiter.consume(key);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Rate limiter timeout')), 5000);
            });

            await Promise.race([consumePromise, timeoutPromise]);
            next();
        } catch (error) {
            if (error.message === 'Rate limiter timeout') {
                logger.error('Rate limiter timeout', {
                    type: 'rate-limit-timeout',
                    limiterType: limiterType,
                    ip: req.ip,
                    userId: req.user?.userId
                });
                console.warn('Rate limiter timeout - allowing request to continue');
                return next();
            }

            if (!error.remainingPoints) {
                const secs = Math.round(error.msBeforeNext / 1000) || 1;
                logger.warn('Rate limit exceeded', {
                    type: 'rate-limit',
                    limiterType,
                    ip: req.ip,
                    userId: req.user?.userId,
                    resetTime: secs,
                    remainingHits: error.remainingHits,
                    totalHits: error.totalHits
                });

                res.set('Retry-After', String(secs));
                return res.error(429, "Too many requests. Please try again later");
            }
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                logger.error('Redis connection error in rate limiter', {
                    type: 'redis-connection-error',
                    limiterType: limiterType,
                    ip: req.ip,
                    error: error.message,
                    code: error.code
                });
                console.warn('Redis connection error - allowing request to continue');
                return next();
            }

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

    }
}


module.exports = {
    signinRateLimit: createRateLimitMiddleware('signin'),
    signupRateLimit: createRateLimitMiddleware('signup'),
    predictionRateLimit: createRateLimitMiddleware('prediction'),
    feedbackRateLimit: createRateLimitMiddleware('feedback'),
    generalRateLimit: createRateLimitMiddleware('general'),
}