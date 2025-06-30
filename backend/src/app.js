const express = require('express');
const app = express();
const routes = require("./routes")

app.use(express.json());
app.use("/api", routes)
//app.use(errorHandler);

module.exports = app;