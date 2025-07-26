const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config()

cron.schedule('0 4 * * 6', async () => {
    console.log("📦 Running training job...");
    try {
        const response = await axios.post(`${process.env.FLASK_URL}/train`);
        console.log("✅ Training complete:", response.data);
    } catch (err) {
        console.error("❌ Training error:", err.message);
    }
});