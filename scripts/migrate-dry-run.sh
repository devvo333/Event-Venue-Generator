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
for cmd in psql pg_dump; do
  if ! command_exists $cmd; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Create backup of current production database
echo "Creating backup of current production database..."
pg_dump -U postgres -d event_venue_prod > backup_prod.sql

# Create temporary database for dry run
echo "Creating temporary database for dry run..."
psql -U postgres -c "CREATE DATABASE event_venue_dry_run;"

# Restore backup to temporary database
echo "Restoring backup to temporary database..."
psql -U postgres -d event_venue_dry_run < backup_prod.sql

# Apply migrations to temporary database
echo "Applying migrations to temporary database..."
for migration in supabase/migrations/*.sql; do
  echo "Applying $migration..."
  psql -U postgres -d event_venue_dry_run -f "$migration"
done

# Verify tables
echo "Verifying tables..."
psql -U postgres -d event_venue_dry_run -c "\dt"

# Verify functions
echo "Verifying functions..."
psql -U postgres -d event_venue_dry_run -c "\df"

# Verify RLS policies
echo "Verifying RLS policies..."
psql -U postgres -d event_venue_dry_run -c "SELECT * FROM pg_policies;"

# Test database functions
echo "Testing database functions..."
psql -U postgres -d event_venue_dry_run -c "SELECT * FROM initialize_tenant('test-tenant', 'Test Tenant', 'test@example.com');"
psql -U postgres -d event_venue_dry_run -c "SELECT * FROM check_tenant_permission('test-tenant', 'test@example.com', 'admin');"
psql -U postgres -d event_venue_dry_run -c "SELECT * FROM generate_api_key('test-tenant', 'Test Key', '{}');"

# Clean up
echo "Cleaning up..."
psql -U postgres -c "DROP DATABASE event_venue_dry_run;"

echo "Dry run complete! Check the output above for any errors or warnings." 