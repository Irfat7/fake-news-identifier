const express = require('express');
const app = express();
const routes = require("./routes")
const dbService = require("./services/db.service")

dbService.connect()
  .then(() => {
    // Database connected successfully
    app.use(express.json());
    app.use(express.json());
    app.use("/api", routes);
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;