const { Queue } = require('bullmq');
const connection = require('../config/redisConnection');

const emailQueue = new Queue('emailQueue', { connection });

module.exports = emailQueue;