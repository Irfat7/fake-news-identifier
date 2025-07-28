// debug-load-test.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    vus: 1, // Start with just 1 user for debugging
    duration: '10s', // Short test for debugging
};

export default function () {
    const url = 'http://localhost:5000/api/model/predict';

    const payload = JSON.stringify({
        news: "Breaking news: Heavy flooding reported in several areas."
    });

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTBmN2MwOS0wZTkyLTQ3OTUtYjY3Ny1iNDM5ZmU0NjliYWIiLCJlbWFpbCI6ImltaXJmYXQ3QGdtYWlsLmNvbSIsImlhdCI6MTc1MzYxNzI5NywiZXhwIjoxNzUzNjIwODk3fQ.D7LSeeRCDAJmHnlt4YxYT1XK9YimQYLnTNKqEfw2uHQ'
    };

    console.log('🔍 Making request to:', url);
    console.log('📝 Payload:', payload);

    const res = http.post(url, payload, { headers });

    // Debug output
    console.log('📊 Response Status:', res.status);
    console.log('⏱️  Response Time:', res.timings.duration, 'ms');
    console.log('📄 Response Body:', res.body);
    console.log('🔗 Response Headers:', JSON.stringify(res.headers));

    // Test each check individually
    console.log('✅ Status is 200:', res.status === 200);
    console.log('⚡ Response time < 1000ms:', res.timings.duration < 1000);
    console.log('📝 Response body not empty:', res.body && res.body.length > 0);
    console.log('🚫 No server errors:', res.status < 500);

    // Test JSON parsing
    try {
        const body = JSON.parse(res.body);
        console.log('🔍 Parsed body:', JSON.stringify(body));
        console.log('🎯 Has prediction field:', body.hasOwnProperty('prediction') || body.hasOwnProperty('result'));
    } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
    }

    // Simple check
    const simpleCheck = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    console.log('🎯 Simple check result:', simpleCheck);
    console.log('═══════════════════════════════════════');

    sleep(1);
}