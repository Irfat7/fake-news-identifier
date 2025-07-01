const express = require('express');
const app = express();
const routes = require("./routes")
const dbService = require("./services/db.service");
const sequelize = require('./config/db');
const globalErrorHandler = require('./middlewares/errorhandler');

dbService.connect()
  .then(() => {
    sequelize.sync()
    .then(()=>console.log('Database synced'))
    .catch(()=> console.log('Database sync failed'));
    // Database connected successfully
    app.use(express.json());
    app.use("/api", routes);
    app.use(globalErrorHandler);
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;