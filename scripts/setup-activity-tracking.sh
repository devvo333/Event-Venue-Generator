#!/bin/bash

# Script to set up the activity tracking tables in Supabase

echo "Setting up activity tracking tables in Supabase..."

# Load environment variables
source .env.local

# Check if Supabase URL and Key are available
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Supabase URL or Service Role Key not found in .env.local"
  echo "Please ensure these variables are set:"
  echo "  NEXT_PUBLIC_SUPABASE_URL"
  echo "  SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Run the schema SQL file
echo "Creating activity tracking tables and policies..."
supabase_url=$NEXT_PUBLIC_SUPABASE_URL
service_key=$SUPABASE_SERVICE_ROLE_KEY

curl -X POST \
  "${supabase_url}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${service_key}" \
  -H "Authorization: Bearer ${service_key}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(cat scripts/supabase-schema-activity.sql | tr -d '\n' | sed 's/"/\\"/g')\"}"

result=$?

if [ $result -eq 0 ]; then
  echo "✅ Activity tracking setup completed successfully!"
else
  echo "❌ Activity tracking setup failed with exit code $result"
  exit $result
fi

echo "You can now use activity tracking in the application." 