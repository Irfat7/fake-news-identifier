require('dotenv').config()
const IORedis = require('ioredis');

const rateLimiterRedis = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    retryDelayOnFailover: 50,
    enableReadyCheck: true,
    maxLoadingTimeout: 5000,
    lazyConnect: false,
    connectTimeout: 5000,
    commandTimeout: 2000,
    keepAlive: 30000,
    family: 4,
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
    },
    db: 0,
    enableAutoPipelining: true
});

const bullMQRedis = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 100,
    enableReadyCheck: true
});

rateLimiterRedis.on('connect', () => {
    console.log('Rate Limiter Redis connected');
});

rateLimiterRedis.on('error', (err) => {
    console.error('Rate Limiter Redis error:', err);
});

bullMQRedis.on('connect', () => {
    console.log('BullMQ Redis connected');
});

bullMQRedis.on('error', (err) => {
    console.error('BullMQ Redis error:', err);
});

module.exports = {
    rateLimiterRedis,
    bullMQRedis
};