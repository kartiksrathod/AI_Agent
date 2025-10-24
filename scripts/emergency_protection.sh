#!/bin/bash
# Emergency Database Protection and Restore Script
# This script restores the database from the most recent backup

set -e

BACKUP_DIR="/app/backups"
DATABASE_NAME="academic_resources_db"

echo "🔄 Emergency Database Restore"
echo "=============================="

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Find the most recent backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backups found in $BACKUP_DIR"
    exit 1
fi

echo "📦 Found backup: $LATEST_BACKUP"
echo "🔄 Restoring database..."

# Restore using mongorestore
mongorestore --drop --db "$DATABASE_NAME" "$LATEST_BACKUP/$DATABASE_NAME" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully from backup!"
    echo "📊 Restored from: $LATEST_BACKUP"
else
    echo "❌ Failed to restore database"
    exit 1
fi

exit 0
