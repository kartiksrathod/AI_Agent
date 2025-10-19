#!/bin/bash
# BULLETPROOF Startup script - ensures data NEVER gets lost

set -e

echo "🚀 Starting BULLETPROOF Academic Resources Backend..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
for i in {1..30}; do
    if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✓ MongoDB is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "✗ MongoDB connection timeout"
        exit 1
    fi
    sleep 1
done

# CRITICAL: Auto-restore data if database is empty
echo "📦 Checking data integrity..."
TOTAL_RECORDS=$(mongosh academic_resources --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null || echo "0")

if [ "$TOTAL_RECORDS" = "0" ] || [ -z "$TOTAL_RECORDS" ]; then
    echo "⚠️  DATABASE IS EMPTY! Auto-restoring from latest backup..."
    
    LATEST_BACKUP=$(ls -td /app/backups/backup_* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/academic_resources" ]; then
        echo "📦 Restoring from: $LATEST_BACKUP"
        mongorestore --db academic_resources "$LATEST_BACKUP/academic_resources" --drop --quiet 2>&1 | grep -v "deprecated" || true
        
        RESTORED_RECORDS=$(mongosh academic_resources --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null)
        echo "✅ RESTORATION COMPLETE! Restored $RESTORED_RECORDS records"
    else
        echo "⚠️  No backup found to restore from"
    fi
else
    echo "✅ Database has $TOTAL_RECORDS records - all good!"
fi

# Initialize database with admin user (only if needed)
echo "👤 Checking admin user..."
cd /app/backend
/root/.venv/bin/python init_db.py

# Start continuous backup system (every 3 minutes in background)
echo "🛡️  Starting CONTINUOUS backup system..."
/app/scripts/continuous_backup.sh > /var/log/backup.log 2>&1 &
BACKUP_PID=$!
echo "   Backup process running (PID: $BACKUP_PID)"

# Log current data stats
echo "📊 Current database:"
mongosh academic_resources --quiet --eval "printjson({users: db.users.countDocuments(), papers: db.papers.countDocuments(), notes: db.notes.countDocuments(), syllabus: db.syllabus.countDocuments()})"

# Start the FastAPI server
echo "🌐 Starting FastAPI server..."
exec /root/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1 --reload
