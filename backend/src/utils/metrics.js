const client = require('prom-client');
client.collectDefaultMetrics();


const totalPredictions = new client.Counter({
    name: 'total_predictions',
    help: 'Total number of predictions served',
});

const predictionLatency = new client.Histogram({
    name: 'prediction_latency_seconds',
    help: 'Prediction latency in seconds',
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

const predictionLabelCount = new client.Counter({
    name: 'prediction_label_count',
    help: 'Count of predictions per label',
    labelNames: ['label'],
});

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['route', 'method', 'status_code'],
});

const feedbackTotal = new client.Counter({
    name: 'feedback_total',
    help: 'Total number of user feedback entries received',
});

module.exports = {
    totalPredictions,
    predictionLatency,
    predictionLabelCount,
    httpRequestsTotal,
    feedbackTotal,
    register: client.register,
};
