#!/bin/bash
# CONTINUOUS BACKUP SCRIPT
# Backs up database every 3 minutes

set -e

BACKUP_DIR="/app/backups"
DB_NAME="academic_resources"
MAX_BACKUPS=10

echo "🔄 Starting continuous backup system..."

while true; do
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    
    # Create backup
    mongodump --db $DB_NAME --out "$BACKUP_PATH" --quiet 2>&1 | grep -v "deprecated" || true
    
    if [ -d "$BACKUP_PATH/$DB_NAME" ]; then
        # Create 'latest' symlink
        ln -sfn "$BACKUP_PATH" "$BACKUP_DIR/latest"
        
        # Count records
        RECORD_COUNT=$(mongosh $DB_NAME --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null || echo "0")
        echo "✅ [$TIMESTAMP] Backup created ($RECORD_COUNT records)"
        
        # Keep only last N backups
        ls -t $BACKUP_DIR/backup_* 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -I {} rm -rf {} 2>/dev/null || true
    fi
    
    # Wait 3 minutes
    sleep 180
done
