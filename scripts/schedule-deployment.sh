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
for cmd in gh; do
  if ! command_exists $cmd; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Get deployment date
read -p "Enter deployment date (YYYY-MM-DD): " DEPLOY_DATE
read -p "Enter deployment time (HH:MM): " DEPLOY_TIME

# Create deployment issue
echo "Creating deployment issue..."
gh issue create \
  --title "Production Deployment - $DEPLOY_DATE $DEPLOY_TIME" \
  --body "## Production Deployment Plan

### Pre-deployment Checklist
- [ ] Verify all tests pass
- [ ] Complete staging deployment
- [ ] Perform database migration dry run
- [ ] Set up monitoring and alerting
- [ ] Complete load testing
- [ ] Backup current production environment

### Deployment Steps
1. Stop production services
2. Backup production database
3. Apply database migrations
4. Deploy application code
5. Start production services
6. Verify deployment
7. Monitor for issues

### Rollback Plan
If issues occur:
1. Stop production services
2. Restore from backup
3. Revert application code
4. Start production services
5. Verify rollback

### Post-deployment Checklist
- [ ] Verify all services are running
- [ ] Check monitoring and alerting
- [ ] Test critical functionality
- [ ] Update documentation
- [ ] Notify stakeholders

### Deployment Team
- @team-lead
- @dev-ops
- @qa-lead

### Timeline
- Start: $DEPLOY_DATE $DEPLOY_TIME
- Expected Duration: 2 hours
- Maintenance Window: 4 hours" \
  --label "deployment" \
  --assignee "@team-lead,@dev-ops,@qa-lead"

# Create deployment branch
echo "Creating deployment branch..."
DEPLOY_BRANCH="deploy/production-$DEPLOY_DATE"
git checkout -b "$DEPLOY_BRANCH"

# Update version
echo "Updating version..."
npm version patch

# Commit changes
echo "Committing changes..."
git add .
git commit -m "Prepare for production deployment"

# Push branch
echo "Pushing branch..."
git push origin "$DEPLOY_BRANCH"

# Create pull request
echo "Creating pull request..."
gh pr create \
  --title "Production Deployment - $DEPLOY_DATE" \
  --body "Production deployment preparation for $DEPLOY_DATE $DEPLOY_TIME" \
  --base main \
  --head "$DEPLOY_BRANCH" \
  --label "deployment"

echo "Deployment scheduled for $DEPLOY_DATE $DEPLOY_TIME!" 