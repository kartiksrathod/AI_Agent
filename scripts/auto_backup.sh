#!/bin/bash
# AUTO-BACKUP Script - Runs every 5 minutes to backup MongoDB data
# This ensures you NEVER lose data

BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
LATEST_LINK="$BACKUP_DIR/latest"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Backup MongoDB database
mongodump --quiet --db=academic_resources --out="$BACKUP_PATH" 2>/dev/null

# Update latest link
rm -f "$LATEST_LINK"
ln -s "$BACKUP_PATH" "$LATEST_LINK"

# Keep only last 10 backups to save space
cd "$BACKUP_DIR"
ls -t | grep "backup_" | tail -n +11 | xargs -r rm -rf

echo "✅ Backup created: $BACKUP_PATH"
