const express = require("express")
const { predictNews, storeFeedback } = require("../controllers/predictController");
const authMiddleware = require("../middlewares/authMiddleware");
const { newsValidator, feedbackValidator } = require("../validators/newsValidator");
const validate = require("../middlewares/validate");
const verifyPredictionToken = require("../middlewares/verifyPredictionToken");
const router = express.Router()

router.post("/predict", authMiddleware, newsValidator, validate, predictNews);
router.post(
    "/feedback",
    feedbackValidator,
    validate,
    authMiddleware,
    verifyPredictionToken,
    storeFeedback
);

module.exports = router