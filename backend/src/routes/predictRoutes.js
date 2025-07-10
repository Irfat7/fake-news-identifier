const express = require("express")
const { predictNews } = require("../controllers/predictController");
const authMiddleware = require("../middlewares/authMiddleware");
const { newsValidator } = require("../validators/newsValidator");
const validate = require("../middlewares/validate");
const router = express.Router()

router.post("/predict"/* , authMiddleware */, newsValidator, validate, predictNews);

module.exports = router