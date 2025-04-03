#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.production

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required commands
for cmd in k6; do
  if ! command_exists $cmd; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Run load tests
echo "Running load tests..."

# Test 1: Basic API Endpoints
echo "Testing basic API endpoints..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/basic-api.js

# Test 2: Authentication
echo "Testing authentication..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/auth.js

# Test 3: Venue Management
echo "Testing venue management..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/venues.js

# Test 4: Booking System
echo "Testing booking system..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/bookings.js

# Test 5: Analytics
echo "Testing analytics..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/analytics.js

# Test 6: Reporting
echo "Testing reporting..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/reports.js

# Test 7: Multi-tenant
echo "Testing multi-tenant..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/tenants.js

# Test 8: API Integration
echo "Testing API integration..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/api.js

# Generate report
echo "Generating load test report..."
k6 run --env API_URL="$NEXT_PUBLIC_API_URL" tests/load/generate-report.js

echo "Load testing complete! Check the reports directory for results." 