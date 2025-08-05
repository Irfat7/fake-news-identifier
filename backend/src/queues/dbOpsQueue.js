const { Queue } = require('bullmq');
const { bullMQRedis } = require('../config/redisConnection');

const dbOpsQueue = new Queue('db-ops-queue', { connection: bullMQRedis });

module.exports = dbOpsQueue;