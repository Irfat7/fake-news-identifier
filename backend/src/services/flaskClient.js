const axios = require('axios');
require('dotenv').config()

const flaskClient = axios.create({
    baseURL: process.env.FLASK_URL,
    timeout: parseInt(process.env.FLASK_TIMEOUT) || 30000,
    maxRedirects: 0,
    httpAgent: new (require('http').Agent)({
        keepAlive: true,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 30000,
        freeSocketTimeout: 4000,
    }),
    httpsAgent: new (require('https').Agent)({
        keepAlive: true,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 30000,
        freeSocketTimeout: 4000,
    })
});

module.exports = flaskClient;