#!/bin/bash
# Automatic Database Backup Script
# Backs up the database every hour and keeps last 24 backups

BACKUP_DIR="/app/backups"
DATABASE_NAME="academic_resources_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database has any data before backing up
RECORD_COUNT=$(mongosh --quiet --eval "db.users.countDocuments({})" "$DATABASE_NAME" 2>/dev/null || echo "0")

if [ "$RECORD_COUNT" -gt "0" ]; then
    # Perform backup
    mongodump --db "$DATABASE_NAME" --out "$BACKUP_PATH" --quiet 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "$(date): ✅ Backup created: $BACKUP_PATH"
        
        # Keep only the last 24 backups (24 hours worth)
        cd "$BACKUP_DIR"
        ls -t | grep "backup_" | tail -n +25 | xargs -r rm -rf
        
        echo "$(date): 🧹 Old backups cleaned up"
    else
        echo "$(date): ⚠️  Backup failed"
    fi
else
    echo "$(date): ℹ️  Skipping backup - database is empty"
fi
