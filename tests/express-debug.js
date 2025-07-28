// express-debug.js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 1,
    duration: '10s',
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

    console.log('🔍 Making request to Express API:', url);

    const res = http.post(url, payload, { headers });

    // Detailed logging
    console.log('📊 Express API Response:');
    console.log('   Status:', res.status);
    console.log('   Status Text:', res.status_text || 'N/A');
    console.log('   Body:', res.body);
    console.log('   Response Time:', res.timings.duration, 'ms');
    console.log('   Error:', res.error || 'None');

    // Check headers for more info
    if (res.headers) {
        console.log('   Content-Type:', res.headers['Content-Type'] || res.headers['content-type'] || 'N/A');
    }

    // If it's an error, log more details
    if (res.status >= 400) {
        console.log('❌ EXPRESS API ERROR DETAILS:');
        console.log('   This is likely an Express API issue, not Flask');

        try {
            const errorBody = JSON.parse(res.body);
            console.log('   Parsed Error:', JSON.stringify(errorBody, null, 2));
        } catch (e) {
            console.log('   Raw Error Body:', res.body);
        }
    }

    console.log('═══════════════════════════════════════');
    sleep(1);
}