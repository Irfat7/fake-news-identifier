require('dotenv').config()
const IORedis = require('ioredis');

const rateLimiterRedis = new IORedis(process.env.REDIS_URL, {
    enableReadyCheck: true,       // Wait for Redis to be ready
    connectTimeout: 5000,         // Timeout for initial connection
    commandTimeout: 1000,         // Limit each command execution to 1s
    maxRetriesPerRequest: 1,      // Try only once per request
    retryDelayOnFailover: 100,    // Delay between reconnects
    enableAutoPipelining: true,   // Improve performance under load
    enableOfflineQueue: false,    // Don't queue commands while offline
    lazyConnect: false,           // Fail fast if not connected at startup
    db: 0                         // Use default DB
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