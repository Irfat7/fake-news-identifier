require('dotenv').config();
const { Worker } = require('bullmq');
const transporter = require('../utils/email');
const IORedis = require('ioredis');

const connection = new IORedis({ maxRetriesPerRequest: null });

const emailWorker = new Worker('emailQueue', async job => {
    const { from, to, subject, text, html } = job.data;

    console.log(123)
    await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    });

    console.log(`Email sent to ${to}`);
}, {
    connection
});

emailWorker.on('failed', (job, err) => {
    console.error(`Email job failed for ${job.id}:`, err);
});