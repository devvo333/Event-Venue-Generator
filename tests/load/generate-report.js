import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://jslib.k6.io/k6-html/0.0.1/index.js';

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'reports/load-test-report.html': htmlReport(data),
  };
}

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
};

export default function () {
  // This is a placeholder function as the actual test data will be provided
  // by the k6 cloud execution
  return;
} 