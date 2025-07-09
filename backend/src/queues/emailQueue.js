const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
    host: 'redis',
    port: 6379,
    maxRetriesPerRequest: null,
});

const emailQueue = new Queue('emailQueue', { connection });

module.exports = emailQueue;