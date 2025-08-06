require('dotenv').config();
const { Worker } = require('bullmq');
const transporter = require('../utils/email');
const { bullMQRedis } = require('../config/redisConnection');

const emailWorker = new Worker('emailQueue', async job => {
    const { from, to, subject, text, html } = job.data;

    await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    });

}, {
    connection: bullMQRedis
});

emailWorker.on('ready', () => {
    console.log('Email Worker is ready and connected to Redis.');
});

emailWorker.on('failed', (job, err) => {
    console.error(`Email job failed for ${job.id}:`, err);
});

module.exports = emailWorker