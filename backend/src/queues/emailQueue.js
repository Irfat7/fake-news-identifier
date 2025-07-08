const { Queue } = require('bullmq');

const emailQueue = new Queue('emailQueue');

module.exports = emailQueue;