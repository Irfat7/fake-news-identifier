const { Worker } = require('bullmq');
const { bullMQRedis } = require('../config/redisConnection');
const News = require('../models/news.model');
const sequelize = require('../config/db');

sequelize.authenticate()
    .then(() => console.log('DB connected in worker'))
    .catch(err => console.error('DB connection failed in worker:', err));

const dbOpsWorker = new Worker('db-ops-queue', async job => {
    const { task, payload } = job.data;
    switch (task) {
        case "store-news":
            await News.create(payload);
            break;
    }

}, {
    connection: bullMQRedis
});

dbOpsWorker.on('failed', (job, err) => {
    console.error(`Db job failed ${job.id}:`, err);
});