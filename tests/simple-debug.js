// simple-debug.js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 1,
    duration: '5s',
};

export default function () {
    const url = 'http://localhost:5000/api/model/predict';

    const payload = JSON.stringify({
        news: "Breaking news: Heavy flooding reported in several areas."
    });

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTBmN2MwOS0wZTkyLTQ3OTUtYjY3Ny1iNDM5ZmU0NjliYWIiLCJlbWFpbCI6ImltaXJmYXQ3QGdtYWlsLmNvbSIsImlhdCI6MTc1MzYxNzY3MywiZXhwIjoxNzUzNjIxMjczfQ.DwIoeu9dmmV3tWtQEVE3M6-9IMOdsexxL0EA6h30zIw'
    };

    const res = http.post(url, payload, { headers });

    // Force console output with error details
    if (res.status !== 200) {
        console.error(`❌ FAILED REQUEST:`);
        console.error(`   Status: ${res.status}`);
        console.error(`   Status Text: ${res.status_text || 'N/A'}`);
        console.error(`   Body: ${res.body}`);
        console.error(`   Error: ${res.error || 'N/A'}`);
        console.error(`   URL: ${res.url}`);
    } else {
        console.log(`✅ SUCCESS: ${res.status} - ${res.body}`);
    }

    sleep(1);
}