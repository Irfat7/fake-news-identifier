const app = require('./app');
const dbService = require('./services/db.service');
const sequelize = require('./config/db');
const { totalPredictions, feedbackTotal } = require('./utils/metrics');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Connect to DB
        await dbService.connect();
        console.log('✅ Database connection established');

        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');

        // Start metrics reset interval
        setInterval(() => {
            totalPredictions.inc(0);
            feedbackTotal.inc(0);
        }, 60 * 1000);

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Server startup failed:', err);
        process.exit(1);
    }
}

startServer();