const express = require("express")
const router = express.Router()
const authRoutes = require("./authRoutes")
const predictRoutes = require("./predictRoutes")
const { register } = require("../utils/metrics");

router.use("/auth", authRoutes);
router.use("/model", predictRoutes);

router.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err.message);
    }
});

module.exports = router