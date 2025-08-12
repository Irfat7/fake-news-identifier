require("./dbOpsWorker");
require("./emailWorker")

// Dummy express server to satisfy Render Web Service
const express = require('express');
const app = express();
const port = 3000

app.get("/health", (req, res) => {
    res.status(200).json({ status: "worker-ok" });
});

app.listen(port, () => {
    console.log(`Dummy server running`);
});