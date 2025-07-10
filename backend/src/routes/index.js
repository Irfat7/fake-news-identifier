const express = require("express")
const router = express.Router()
const authRoutes = require("./authRoutes")
const predictRoutes = require("./predictRoutes")


router.use("/auth", authRoutes);
router.use("/model", predictRoutes);

module.exports = router