const axios = require('axios');
const catchAsync = require("../utils/catchAsync")
require('dotenv').config()

const predictNews = catchAsync(async (req, res, next) => {
    const flaskUrl = process.env.FLASK_URL;

    try {
        const response = await axios.post(`${flaskUrl}/predict`, {
            news: req.body.news
        });

        return res.success(response.data);

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

module.exports = {
    predictNews
}