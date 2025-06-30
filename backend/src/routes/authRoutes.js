const express = require("express")
const router = express.Router()
const {signin} = require("../controllers/authController")

router.get("/signin", signin)

module.exports = router