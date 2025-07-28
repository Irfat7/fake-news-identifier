import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export let responseTime = new Trend('response_time');

export const options = {
    stages: [
        { duration: '1s', target: 20 },    // Start smaller since no cache
        { duration: '30s', target: 50 },    // Gradually increase
        { duration: '30s', target: 100 },   // Test real ML capacity
        { duration: '30s', target: 150 },   // Push further
        { duration: '30s', target: 200 },   // Find breaking point
        { duration: '30s', target: 0 },     // Ramp down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<2000'],     // More realistic threshold for ML processing
        'checks': ['rate>0.95'],                 // 95% of requests should pass
        'response_time': ['avg<1000'],           // Expect slower responses without cache
    },
};

// 🚀 SOLUTION 1: Generate unique news content to bypass cache
function generateUniqueNews() {
    const templates = [
        "Breaking news in {city}: {event} reported by local authorities at {time}.",
        "Scientists at {university} discover {discovery} in recent {field} research study.",
        "Local {business} in {city} wins {award} for outstanding {category} performance.",
        "{company} announces breakthrough in {technology} development after {duration} research.",
        "Weather forecast for {city} predicts {weather} conditions for {day}.",
        "New study by {university} reveals {finding} benefits for {demographic} population.",
        "{authority} approves funding for new {project} system in {city} area.",
        "Celebrity chef {name} opens restaurant featuring {cuisine} ingredients in {location}."
    ];

    const cities = ["New York", "London", "Tokyo", "Sydney", "Mumbai", "Cairo", "Berlin", "Rio"];
    const events = ["flooding", "earthquake", "festival", "protest", "celebration", "accident"];
    const universities = ["Harvard", "MIT", "Stanford", "Oxford", "Cambridge", "Yale"];
    const companies = ["Microsoft", "Google", "Apple", "Tesla", "Amazon", "Meta"];
    const technologies = ["AI", "quantum computing", "robotics", "biotechnology", "renewable energy"];
    const weathers = ["sunny", "rainy", "cloudy", "stormy", "snowy", "windy"];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);

    return template
        .replace('{city}', cities[Math.floor(Math.random() * cities.length)])
        .replace('{event}', events[Math.floor(Math.random() * events.length)])
        .replace('{time}', new Date().toLocaleTimeString())
        .replace('{university}', universities[Math.floor(Math.random() * universities.length)])
        .replace('{discovery}', `discovery-${randomId}`)
        .replace('{field}', "scientific")
        .replace('{business}', `business-${randomId}`)
        .replace('{award}', "prestigious award")
        .replace('{category}', "innovation")
        .replace('{company}', companies[Math.floor(Math.random() * companies.length)])
        .replace('{technology}', technologies[Math.floor(Math.random() * technologies.length)])
        .replace('{duration}', "5 years")
        .replace('{weather}', weathers[Math.floor(Math.random() * weathers.length)])
        .replace('{day}', "weekend")
        .replace('{finding}', `finding-${randomId}`)
        .replace('{demographic}', "general")
        .replace('{authority}', "City council")
        .replace('{project}', "transportation")
        .replace('{name}', `Chef-${randomId}`)
        .replace('{cuisine}', "sustainable")
        .replace('{location}', cities[Math.floor(Math.random() * cities.length)])
        + ` [ID:${timestamp}-${randomId}]`; // Ensure uniqueness
}

export default function () {
    const url = 'http://localhost:5000/api/model/predict';

    // 🎯 Generate completely unique news for each request
    const uniqueNews = generateUniqueNews();

    const payload = JSON.stringify({
        news: uniqueNews
    });

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOTBmN2MwOS0wZTkyLTQ3OTUtYjY3Ny1iNDM5ZmU0NjliYWIiLCJlbWFpbCI6ImltaXJmYXQ3QGdtYWlsLmNvbSIsImlhdCI6MTc1MzcyMDM0NywiZXhwIjoxNzUzNzIzOTQ3fQ.eYiPido_4pqRPyJ-EGB7_rhmekbZVZJy9Q7FfT6UtUc'
    };

    const startTime = Date.now();
    const res = http.post(url, payload, { headers });
    const endTime = Date.now();

    responseTime.add(res.timings.duration);

    // Enhanced checks to verify we're not hitting cache
    const checkResult = check(res, {
        '✅ status is 200': (r) => r.status === 200,
        '⚡ under 2s': (r) => r.timings.duration < 2000,
        '🔍 has prediction': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.data && body.data.hasOwnProperty('prediction');
            } catch (e) {
                return false;
            }
        },
        '🚫 not cached response': (r) => {
            try {
                const body = JSON.parse(r.body);
                return !body.cached; // Ensure we're not getting cached responses
            } catch (e) {
                return true; // If no cached field, assume it's fresh
            }
        }
    });

    // Log slow requests for analysis
    if (res.timings.duration > 1000) {
        console.log(`🐌 Slow request: ${res.timings.duration}ms - Status: ${res.status}`);
    }

    // Log failures for debugging
    if (res.status !== 200) {
        console.log(`❌ Failed request: Status ${res.status}, Body: ${res.body}`);
    }

    sleep(0.5); // Reduce sleep to increase load
}