#!/bin/bash
# CONTINUOUS BACKUP SCRIPT
# Backs up database every 5 minutes (when data exists)

set -e

BACKUP_DIR="/app/backups"
DB_NAME="academic_resources"
MAX_BACKUPS=10

echo "🔄 Starting continuous backup system..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

while true; do
    # Check if database has data before backing up
    RECORD_COUNT=$(mongosh $DB_NAME --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null || echo "0")
    
    if [ "$RECORD_COUNT" != "0" ] && [ -n "$RECORD_COUNT" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
        
        # Create backup
        mongodump --db $DB_NAME --out "$BACKUP_PATH" --quiet 2>&1 | grep -v "deprecated" || true
        
        if [ -d "$BACKUP_PATH/$DB_NAME" ]; then
            # Create 'latest' symlink
            ln -sfn "$BACKUP_PATH" "$BACKUP_DIR/latest"
            
            echo "✅ [$TIMESTAMP] Backup created ($RECORD_COUNT records)"
            
            # Keep only last N backups
            ls -t $BACKUP_DIR/backup_* 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -I {} rm -rf {} 2>/dev/null || true
        fi
    else
        echo "⏭️  Skipping backup - database is empty"
    fi
    
    # Wait 5 minutes (300 seconds)
    sleep 300
done
