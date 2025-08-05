const express = require('express');
const app = express();
const routes = require("./routes")
const dbService = require("./services/db.service");
const sequelize = require('./config/db');
const globalErrorHandler = require('./middlewares/errorhandler');
const responseFormatter = require('./middlewares/responseFormatter');
const cors = require('cors');
const httpLogger = require('./middlewares/httpLogger');
const performanceLogger = require('./middlewares/performanceLogger');
const httpRequestTracker = require('./middlewares/httpRequestTracker');
const { totalPredictions, feedbackTotal } = require('./utils/metrics');
require('./models/user.model');
require('./models/news.model');

dbService.connect()
  .then(() => {
    console.log("Redis connections established");
    sequelize.sync({ alter: true })
      .then(() => console.log('Database synced'))
      .catch(() => console.log('Database sync failed'));
    // Database connected successfully
    setInterval(() => {
      totalPredictions.inc(0);
      feedbackTotal.inc(0);
    }, 60 * 1000);
    app.use(cors({
      origin: 'http://localhost:5173', // your frontend's URL
      credentials: true               // if you're using cookies or auth headers
    }));
    app.use(httpLogger);
    app.use(performanceLogger);
    app.use(httpRequestTracker)
    app.use(express.json());
    app.use(responseFormatter);
    app.use("/api", routes);
    app.use(globalErrorHandler);
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;