const express = require('express');
const app = express();
const routes = require('./routes');
const globalErrorHandler = require('./middlewares/errorhandler');
const responseFormatter = require('./middlewares/responseFormatter');
const cors = require('cors');
const httpLogger = require('./middlewares/httpLogger');
const performanceLogger = require('./middlewares/performanceLogger');
const httpRequestTracker = require('./middlewares/httpRequestTracker');
const { generalRateLimit } = require('./middlewares/rateLimiter');
require('dotenv').config()

// Load models to register with Sequelize
require('./models/user.model');
require('./models/news.model');

// Middlewares (synchronous setup)
app.use(responseFormatter);

/* app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.FRONTEND_URL.replace(/\/$/, '');
    if (origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
})); */
app.use(cors());

app.use(generalRateLimit)
app.use(httpLogger);
app.use(performanceLogger);
app.use(httpRequestTracker);
app.use(express.json());
app.get("/health", (req, res) => {
  res.success({ status: 'ok' });
});
app.use('/api', routes);
app.use(globalErrorHandler);

module.exports = app;