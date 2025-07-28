import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export let responseTime = new Trend('response_time');

export const options = {
    stages: [
        { duration: '30s', target: 50 },    // ramp-up to 50 VUs
        { duration: '30s', target: 100 },   // ramp-up to 100 VUs
        { duration: '30s', target: 200 },   // ramp-up to 200 VUs
        { duration: '30s', target: 300 },   // ramp-up to 300 VUs
        { duration: '30s', target: 400 },   // ramp-up to 400 VUs
        { duration: '30s', target: 500 },   // ramp-up to 500 VUs
        { duration: '30s', target: 0 },     // ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'],     // 95% should be under 1s
        'checks': ['rate>0.95'],                 // 95% of requests should pass
        'response_time': ['avg<800'],            // Optional: average response time under 800ms
    },
};

const testNews = [
    "Breaking news: Heavy flooding reported in several areas.",
    "Scientists discover new species of marine life in deep ocean.",
    "Local bakery wins national award for best croissant recipe.",
    "Technology company announces breakthrough in quantum computing.",
    "Weather forecast predicts sunny skies for the weekend.",
    "New study reveals benefits of daily exercise for mental health.",
    "City council approves funding for new public transportation system.",
    "Celebrity chef opens restaurant featuring sustainable ingredients."
];

export default function () {
    const url = 'http://localhost:5000/api/model/predict';
    const randomNews = testNews[Math.floor(Math.random() * testNews.length)];

    const payload = JSON.stringify({
        news: randomNews
    });

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTBmN2MwOS0wZTkyLTQ3OTUtYjY3Ny1iNDM5ZmU0NjliYWIiLCJlbWFpbCI6ImltaXJmYXQ3QGdtYWlsLmNvbSIsImlhdCI6MTc1MzYzNjM2MSwiZXhwIjoxNzUzNjM5OTYxfQ.R2W83JKxdmE_1Z-6Lt7SknvbPi7_RCwQ60cf1aJjuGw'
    };
    const res = http.post(url, payload, { headers });

    responseTime.add(res.timings.duration);

    check(res, {
        '✅ status is 200': (r) => r.status === 200,
        '⚡ under 1s': (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
