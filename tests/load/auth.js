import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 }, // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

export default function () {
  const baseUrl = __ENV.API_URL;

  // Test login endpoint
  const loginPayload = JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword',
  });

  const loginRes = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // If login successful, test protected endpoints
  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Test profile endpoint
    const profileRes = http.get(`${baseUrl}/api/auth/profile`, { headers });
    check(profileRes, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 500ms': (r) => r.timings.duration < 500,
    });

    // Test refresh token endpoint
    const refreshRes = http.post(
      `${baseUrl}/api/auth/refresh`,
      JSON.stringify({ refreshToken: loginRes.json('refreshToken') }),
      { headers }
    );
    check(refreshRes, {
      'refresh status is 200': (r) => r.status === 200,
      'refresh response time < 500ms': (r) => r.timings.duration < 500,
    });
  }

  sleep(1);
} 