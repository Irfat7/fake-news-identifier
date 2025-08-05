const { Queue } = require('bullmq');
const { bullMQRedis } = require('../config/redisConnection');

const emailQueue = new Queue('emailQueue', { connection: bullMQRedis });

module.exports = emailQueue;