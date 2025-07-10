const express = require("express")
const { predictNews } = require("../controllers/predictController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router()

router.get("/predict", authMiddleware, predictNews);

module.exports = router