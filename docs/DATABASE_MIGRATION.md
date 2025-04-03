# Database Migration Plan

## Overview
This document outlines the process for migrating the Event Venue Generator database from development to production environments.

## Pre-Migration Checklist
- [ ] Backup development database
- [ ] Verify all migrations are in version control
- [ ] Test migrations in staging environment
- [ ] Document current database state
- [ ] Schedule migration during low-traffic period

## Migration Steps

### 1. Preparation
```bash
# Create backup of development database
pg_dump -U postgres -d event_venue_dev > backup_dev.sql

# Create backup of production database
pg_dump -U postgres -d event_venue_prod > backup_prod.sql
```

### 2. Migration
```bash
# Apply migrations to production
psql -U postgres -d event_venue_prod -f migrations/20240320000001_create_auth_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000002_create_venue_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000003_create_booking_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000004_create_analytics_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000005_create_roi_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000006_create_report_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000007_create_tenant_tables.sql
psql -U postgres -d event_venue_prod -f migrations/20240320000008_create_api_tables.sql
```

### 3. Post-Migration Verification
- [ ] Verify all tables exist
- [ ] Check RLS policies
- [ ] Test database functions
- [ ] Verify data integrity
- [ ] Test application functionality

## Rollback Plan
If issues occur during migration:

1. Stop application services
2. Restore from backup:
```bash
psql -U postgres -d event_venue_prod -f backup_prod.sql
```
3. Verify database state
4. Restart application services

## Backup Strategy
- Daily automated backups
- Weekly full database dumps
- Monthly backup verification
- Quarterly backup restoration testing

## Monitoring
- Set up database monitoring
- Configure alerts for:
  - High CPU usage
  - Slow queries
  - Connection issues
  - Disk space
  - Backup failures

## Maintenance Schedule
- Weekly: Vacuum analyze
- Monthly: Statistics update
- Quarterly: Major version updates
- Annually: Full database optimization 