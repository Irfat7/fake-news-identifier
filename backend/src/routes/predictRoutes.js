const express = require("express")
const { predictNews } = require("../controllers/predictController")
const router = express.Router()

router.get("/predict", predictNews);

module.exports = router