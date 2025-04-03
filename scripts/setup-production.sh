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
for cmd in supabase psql; do
  if ! command_exists $cmd; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Create production project
echo "Creating production Supabase project..."
supabase projects create event-venue-prod \
  --db-password "$SUPABASE_DB_PASSWORD" \
  --region us-east-1 \
  --plan pro

# Wait for project to be ready
echo "Waiting for project to be ready..."
sleep 30

# Link to production project
echo "Linking to production project..."
supabase link --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID"

# Apply migrations
echo "Applying migrations to production..."
supabase db push

# Set up storage buckets
echo "Setting up storage buckets..."
supabase storage create-bucket venues --public
supabase storage create-bucket assets --public
supabase storage create-bucket avatars --public
supabase storage create-bucket backups --private

# Set up Row Level Security
echo "Setting up Row Level Security..."
supabase db reset --db-url "$SUPABASE_DB_URL"

# Set up API endpoints
echo "Setting up API endpoints..."
supabase functions deploy api --project-ref "$NEXT_PUBLIC_SUPABASE_PROJECT_ID"

# Set up monitoring
echo "Setting up monitoring..."
supabase monitoring enable

# Set up backups
echo "Setting up backups..."
supabase backups enable

# Verify setup
echo "Verifying setup..."
supabase status

echo "Production setup complete!" 