require('dotenv').config();
const { Worker } = require('bullmq');
const transporter = require('../utils/email');
const connection = require('../config/redisConnection');

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
    connection
});

emailWorker.on('failed', (job, err) => {
    console.error(`Email job failed for ${job.id}:`, err);
});