# Backup Strategy

## Overview
This document outlines the backup strategy for the Event Venue Generator application, including database, storage, and configuration backups.

## Database Backups

### Automated Backups
```sql
-- Create backup role
CREATE ROLE backup_role WITH LOGIN PASSWORD 'secure_password';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE event_venue TO backup_role;
GRANT USAGE ON SCHEMA public TO backup_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_role;

-- Create backup script
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U backup_role -d event_venue > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
```

### Backup Schedule
- Daily incremental backups
- Weekly full database dumps
- Monthly backup verification
- Quarterly backup restoration testing

## Storage Backups

### Supabase Storage
```bash
# Backup script for storage buckets
#!/bin/bash
BACKUP_DIR="/backups/storage"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup each bucket
for bucket in venues assets avatars; do
  mkdir -p $BACKUP_DIR/$bucket
  supabase storage download $bucket $BACKUP_DIR/$bucket/$DATE
done

# Compress backups
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz $BACKUP_DIR/*/$DATE

# Cleanup old backups
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Backup Schedule
- Daily incremental backups
- Weekly full storage dumps
- Monthly backup verification

## Configuration Backups

### Environment Files
```bash
# Backup script for configuration
#!/bin/bash
BACKUP_DIR="/backups/config"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup environment files
cp .env* $BACKUP_DIR/
cp supabase/config.toml $BACKUP_DIR/

# Backup migration files
cp -r supabase/migrations $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR/config_$DATE.tar.gz $BACKUP_DIR/*

# Cleanup
find $BACKUP_DIR -type f -mtime +90 -delete
```

## Recovery Procedures

### Database Recovery
1. Stop application services
2. Restore from backup:
```bash
# Restore full backup
psql -U postgres -d event_venue < backup_full.sql

# Apply incremental backups if needed
psql -U postgres -d event_venue < backup_incremental.sql
```
3. Verify database state
4. Restart application services

### Storage Recovery
1. Stop application services
2. Restore from backup:
```bash
# Restore storage buckets
for bucket in venues assets avatars; do
  supabase storage upload $bucket $BACKUP_DIR/$bucket/latest/*
done
```
3. Verify storage state
4. Restart application services

## Monitoring and Alerts

### Backup Monitoring
- Daily backup status checks
- Weekly backup verification
- Monthly backup restoration testing
- Alert on backup failures
- Monitor backup storage usage

### Alert Configuration
```yaml
alerts:
  - name: backup-failure
    condition: backup_status != "success"
    severity: critical
    notification: email,slack
    
  - name: storage-low
    condition: backup_storage_used > 90%
    severity: warning
    notification: email,slack
    
  - name: backup-old
    condition: last_backup_age > 24h
    severity: critical
    notification: email,slack
```

## Maintenance Schedule
- Daily: Verify backup completion
- Weekly: Test backup restoration
- Monthly: Review backup strategy
- Quarterly: Update backup procedures
- Annually: Full backup strategy review 