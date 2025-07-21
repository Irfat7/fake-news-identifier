const { Queue } = require('bullmq');
const connection = require('../config/redisConnection');

const dbOpsQueue = new Queue('db-ops-queue', { connection });

module.exports = dbOpsQueue;