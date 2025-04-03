#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.staging

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required commands
for cmd in npm node; do
  if ! command_exists $cmd; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run tests
echo "Running tests..."
npm test

# Run linting
echo "Running linting..."
npm run lint

# Build application
echo "Building application..."
npm run build

# Start application in staging mode
echo "Starting staging server..."
NODE_ENV=staging npm start &

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Run staging tests
echo "Running staging tests..."
npm run test:staging

# Check application health
echo "Checking application health..."
curl -s http://localhost:3000/api/health | grep "ok" || {
  echo "Application health check failed"
  exit 1
}

# Check database connection
echo "Checking database connection..."
curl -s http://localhost:3000/api/db/health | grep "ok" || {
  echo "Database health check failed"
  exit 1
}

# Check storage connection
echo "Checking storage connection..."
curl -s http://localhost:3000/api/storage/health | grep "ok" || {
  echo "Storage health check failed"
  exit 1
}

# Run load tests
echo "Running load tests..."
npm run test:load

# Stop staging server
echo "Stopping staging server..."
pkill -f "node.*start"

echo "Staging tests complete!" 