const axios = require('axios');
const catchAsync = require("../utils/catchAsync")
require('dotenv').config()
const jwt = require('jsonwebtoken');
const dbOpsQueue = require('../queues/dbOpsQueue');

const predictNews = catchAsync(async (req, res, next) => {
    const flaskUrl = process.env.FLASK_URL;
    const news = req.body.news;
    try {
        const response = await axios.post(`${flaskUrl}/predict`, {
            news
        });

        const token = jwt.sign({
            news,
            prediction: response.data.prediction,
            timestamp: Date.now()
        },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        await dbOpsQueue.add('db-task', {
            task: "store-news",
            payload: { news, prediction: response.data.prediction }
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


})

module.exports = {
    predictNews,
    storeFeedback
}