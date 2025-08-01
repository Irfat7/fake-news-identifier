const logger = require('../utils/logger');

const performanceLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;

        logger.info('Request Performance', {
            type: 'performance',
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });

        // Log slow requests
        if (duration > 1000) {
            logger.warn('Slow Request Detected', {
                type: 'slow-request',
                method: req.method,
                url: req.originalUrl,
                duration: `${duration}ms`,
                userId: req.user?.id
            });
        }
    });

    next();
};

module.exports = performanceLogger;