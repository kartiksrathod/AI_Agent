#!/bin/bash
# AUTOMATIC DATA RESTORATION SCRIPT
# Runs every time the backend starts

set -e

BACKUP_DIR="/app/backups"
DB_NAME="academic_resources"

echo "🔍 Checking if data restoration is needed..."

# Wait for MongoDB to be ready
for i in {1..30}; do
    if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Check if database has data
TOTAL_RECORDS=$(mongosh $DB_NAME --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null || echo "0")

if [ "$TOTAL_RECORDS" = "0" ] || [ -z "$TOTAL_RECORDS" ]; then
    echo "⚠️  Database is empty! Restoring from latest backup..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -td $BACKUP_DIR/backup_* 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/$DB_NAME" ]; then
        echo "📦 Restoring from: $LATEST_BACKUP"
        mongorestore --db $DB_NAME "$LATEST_BACKUP/$DB_NAME" --drop --quiet 2>&1 | grep -v "deprecated" || true
        
        # Verify restoration
        RESTORED_RECORDS=$(mongosh $DB_NAME --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null)
        echo "✅ Restored $RESTORED_RECORDS records!"
    else
        echo "⚠️  No backup found to restore from"
    fi
else
    echo "✅ Database has $TOTAL_RECORDS records - no restoration needed"
fi
