require("./dbOpsWorker");
require("./emailWorker")

// Dummy express server to satisfy Render Web Service
const express = require('express');
const app = express();
const port = 3000

app.listen(port, () => {
    console.log(`Dummy server running`);
});