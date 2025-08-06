require("./dbOpsWorker");
require("./emailWorker")

// Dummy express server to satisfy Render Web Service
const express = require('express');
const app = express();


app.listen(PORT, () => {
  console.log(`Dummy server running`);
});