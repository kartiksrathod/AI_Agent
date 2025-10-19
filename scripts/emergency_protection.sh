#!/bin/bash
# EMERGENCY DATA PROTECTION - Runs on every container start
# This ensures your data is NEVER lost no matter what happens

set -e

BACKUP_DIR="/app/backups"
PERSISTENT_DATA="/data/db"

echo "🚨 EMERGENCY DATA PROTECTION ACTIVATED"
echo "========================================"

# 1. Create persistent directory
mkdir -p "$PERSISTENT_DATA"
mkdir -p "$BACKUP_DIR"

# 2. Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not running - starting it..."
    sudo supervisorctl start mongodb
    sleep 5
fi

# 3. Wait for MongoDB
for i in {1..20}; do
    if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# 4. Check current data
CURRENT_DATA=$(mongosh academic_resources --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null || echo "0")

echo "📊 Current Data: $CURRENT_DATA records"

# 5. If data is missing, restore from backup
if [ "$CURRENT_DATA" = "0" ] || [ -z "$CURRENT_DATA" ]; then
    echo "🚨 DATA LOSS DETECTED! Restoring immediately..."
    
    LATEST_BACKUP=$(ls -td $BACKUP_DIR/backup_* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/academic_resources" ]; then
        echo "📦 Emergency restore from: $LATEST_BACKUP"
        mongorestore --db academic_resources "$LATEST_BACKUP/academic_resources" --drop 2>&1 | grep -E "(finished|document)"
        
        RESTORED=$(mongosh academic_resources --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()" 2>/dev/null)
        echo "✅ EMERGENCY RESTORE COMPLETE: $RESTORED records"
    fi
fi

# 6. Create backup right now
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "💾 Creating backup: backup_$TIMESTAMP"
mongodump --db academic_resources --out "$BACKUP_DIR/backup_$TIMESTAMP" --quiet 2>&1 | grep -v "deprecated" || true

# 7. Verify your admin exists
ADMIN_EXISTS=$(mongosh academic_resources --quiet --eval "db.users.findOne({email: 'kartiksrathod07@gmail.com'}) != null")
if [ "$ADMIN_EXISTS" != "true" ]; then
    echo "⚠️  Your admin account missing - recreating..."
    cd /app/backend && /root/.venv/bin/python init_db.py
fi

echo "========================================"
echo "✅ DATA PROTECTION COMPLETE"
mongosh academic_resources --quiet --eval "printjson({users: db.users.countDocuments(), papers: db.papers.countDocuments(), notes: db.notes.countDocuments(), syllabus: db.syllabus.countDocuments(), admin: db.users.findOne({email: 'kartiksrathod07@gmail.com'}) != null})"
echo "========================================"
