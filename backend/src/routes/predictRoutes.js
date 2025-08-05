const express = require("express")
const { predictNews, storeFeedback } = require("../controllers/predictController");
const authMiddleware = require("../middlewares/authMiddleware");
const { newsValidator, feedbackValidator } = require("../validators/newsValidator");
const validate = require("../middlewares/validate");
const verifyPredictionToken = require("../middlewares/verifyPredictionToken");
const { feedbackRateLimit, predictionRateLimit } = require("../middlewares/rateLimiter");
const router = express.Router()

router.post("/predict", predictionRateLimit, authMiddleware, newsValidator, validate, predictNews);
router.post(
    "/feedback",
    feedbackRateLimit,
    feedbackValidator,
    validate,
    authMiddleware,
    verifyPredictionToken,
    storeFeedback
);

module.exports = router