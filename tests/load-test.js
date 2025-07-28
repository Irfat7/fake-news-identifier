// enhanced-load-test.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const responseTime = new Trend('response_time');
const errorRate = new Rate('error_rate');
const requestCount = new Counter('request_count');

// Test scenarios - you can choose one or run multiple
export const options = {
    // Scenario 1: Gradual ramp-up test
    scenarios: {
        ramp_up_test: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '30s', target: 10 },   // Ramp up to 10 users
                { duration: '1m', target: 20 },    // Stay at 20 users
                { duration: '30s', target: 50 },   // Ramp up to 50 users
                { duration: '1m', target: 50 },    // Stay at 50 users
                { duration: '30s', target: 100 },  // Ramp up to 100 users
                { duration: '1m', target: 100 },   // Stay at 100 users
                { duration: '30s', target: 0 },    // Ramp down
            ],
        },

        // Scenario 2: Spike test (uncomment to use)
        // spike_test: {
        //   executor: 'ramping-vus',
        //   startVUs: 1,
        //   stages: [
        //     { duration: '10s', target: 10 },
        //     { duration: '10s', target: 200 }, // Sudden spike
        //     { duration: '30s', target: 200 },
        //     { duration: '10s', target: 10 },
        //   ],
        // },

        // Scenario 3: Constant load test (uncomment to use)
        // constant_load: {
        //   executor: 'constant-vus',
        //   vus: 50,
        //   duration: '2m',
        // },
    },

    // Performance thresholds
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
        http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
        response_time: ['p(90)<800'],      // 90% of responses under 800ms
        error_rate: ['rate<0.05'],         // Custom error rate under 5%
    },
};

// Test data variants
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

    // Randomly select test data for variety
    const randomNews = testNews[Math.floor(Math.random() * testNews.length)];

    const payload = JSON.stringify({
        news: randomNews
    });

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTBmN2MwOS0wZTkyLTQ3OTUtYjY3Ny1iNDM5ZmU0NjliYWIiLCJlbWFpbCI6ImltaXJmYXQ3QGdtYWlsLmNvbSIsImlhdCI6MTc1MzYxNzI5NywiZXhwIjoxNzUzNjIwODk3fQ.D7LSeeRCDAJmHnlt4YxYT1XK9YimQYLnTNKqEfw2uHQ'
    };

    const startTime = new Date().getTime();
    const res = http.post(url, payload, { headers });
    const endTime = new Date().getTime();

    // Record custom metrics
    const duration = endTime - startTime;
    responseTime.add(duration);
    requestCount.add(1);

    // Enhanced checks
    const checkResults = check(res, {
        '✅ Status is 200': (r) => r.status === 200,
        '⚡ Response time < 1000ms': (r) => r.timings.duration < 1000,
        '📊 Response time < 500ms (fast)': (r) => r.timings.duration < 500,
        '🔍 Has prediction field': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.hasOwnProperty('prediction') || body.hasOwnProperty('result');
            } catch (e) {
                console.log(`❌ JSON Parse Error: ${e.message}, Body: ${r.body}`);
                return false;
            }
        },
        '📝 Response body is not empty': (r) => r.body && r.body.length > 0,
        '🚫 No server errors': (r) => r.status < 500,
    });

    // Track error rate - only consider critical checks
    const isSuccess = res.status === 200 && res.body && res.body.length > 0;
    errorRate.add(!isSuccess);

    // Log detailed info for failed requests
    if (res.status !== 200) {
        console.log(`❌ Request failed: Status ${res.status}, Body: ${res.body}`);
    }

    // Variable sleep time to simulate real user behavior
    sleep(Math.random() * 2 + 0.5); // Sleep between 0.5-2.5 seconds
}

// Setup function (runs once at the beginning)
export function setup() {
    console.log('🚀 Starting load test for News Prediction API');
    console.log('📊 Testing endpoint: http://localhost:5000/predict');
    return {};
}

// Teardown function (runs once at the end)
export function teardown(data) {
    console.log('✅ Load test completed');
}