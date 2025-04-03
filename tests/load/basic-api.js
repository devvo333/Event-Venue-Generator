import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

export default function () {
  const baseUrl = __ENV.API_URL;

  // Test health endpoint
  const healthRes = http.get(`${baseUrl}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test venues endpoint
  const venuesRes = http.get(`${baseUrl}/api/venues`);
  check(venuesRes, {
    'venues status is 200': (r) => r.status === 200,
    'venues response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test bookings endpoint
  const bookingsRes = http.get(`${baseUrl}/api/bookings`);
  check(bookingsRes, {
    'bookings status is 200': (r) => r.status === 200,
    'bookings response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
} 