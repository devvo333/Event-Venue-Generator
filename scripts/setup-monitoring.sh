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
for cmd in supabase; do
  if ! command_exists $cmd; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Set up database monitoring
echo "Setting up database monitoring..."
supabase monitoring enable \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --metrics cpu,memory,connections,queries

# Set up alerting
echo "Setting up alerting..."
supabase monitoring alerts create \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --name "high-cpu" \
  --condition "cpu_usage > 85" \
  --severity critical \
  --notification email,slack

supabase monitoring alerts create \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --name "high-memory" \
  --condition "memory_usage > 90" \
  --severity critical \
  --notification email,slack

supabase monitoring alerts create \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --name "high-connections" \
  --condition "connection_count > 90" \
  --severity warning \
  --notification email,slack

# Set up logging
echo "Setting up logging..."
supabase logging enable \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --level info

# Set up performance monitoring
echo "Setting up performance monitoring..."
supabase monitoring metrics enable \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --metrics request_latency,error_rate,active_users

# Set up backup monitoring
echo "Setting up backup monitoring..."
supabase monitoring alerts create \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --name "backup-failure" \
  --condition "backup_status != success" \
  --severity critical \
  --notification email,slack

# Set up storage monitoring
echo "Setting up storage monitoring..."
supabase monitoring metrics enable \
  --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID" \
  --metrics storage_usage,upload_count,download_count

# Verify monitoring setup
echo "Verifying monitoring setup..."
supabase monitoring status

echo "Monitoring setup complete!" 