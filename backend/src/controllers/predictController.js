const axios = require('axios');
const catchAsync = require("../utils/catchAsync")
require('dotenv').config()
const jwt = require('jsonwebtoken');
const dbOpsQueue = require('../queues/dbOpsQueue');
const Feedback = require('../models/feedback.model');
const News = require('../models/news.model');

const predictNews = catchAsync(async (req, res, next) => {
    const flaskUrl = process.env.FLASK_URL;
    const news = req.body.news;
    try {
        const response = await axios.post(`${flaskUrl}/predict`, {
            news
        });

        console.log(response.data.cleaned_news)
        const token = jwt.sign({
            news: response.data.cleaned_news,
            userId: req.user.userId,
            prediction: response.data.prediction,
            timestamp: Date.now()
        },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        await dbOpsQueue.add('db-task', {
            task: "store-news",
            payload: { news: response.data.cleaned_news, prediction: response.data.prediction }
        });

        return res.success({
            ...response.data,
            token
        });

    } catch (err) {
        if (err.response) {
            return res.error(
                err.response.status,
                err.response.data?.error || "Flask API Error"
            )
        }

        return next(err);
    }
});

const storeFeedback = catchAsync(async (req, res) => {
    const { news, label } = req.body
    const newsEntry = await News.findOne({ where: { news } });

    if (!newsEntry) {
        return res.error(404, "News entry not found.");
    }

    await Feedback.upsert({
        userId: req.user.userId,
        newsId: newsEntry.id,
        label
    });
    res.success(null, 200, "Feedback submitted successfully");
})

module.exports = {
    predictNews,
    storeFeedback
}