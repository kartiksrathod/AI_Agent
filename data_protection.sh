#!/bin/bash
# DATA PROTECTION & BACKUP SCRIPT
# This ensures your data is NEVER lost

BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🛡️  DATA PROTECTION CHECK - $TIMESTAMP"
echo "=========================================="

# 1. Verify MongoDB is using persistent storage
MONGO_DATADIR=$(ps aux | grep mongod | grep -o '\--dbpath [^ ]*' | cut -d' ' -f2)
echo "✓ MongoDB Data Directory: $MONGO_DATADIR"

if [ "$MONGO_DATADIR" != "/data/db" ]; then
    echo "⚠️  WARNING: MongoDB is NOT using /data/db!"
    echo "   Fixing configuration..."
    sudo supervisorctl stop mongodb
    sudo sed -i 's|command=/usr/bin/mongod --bind_ip_all.*|command=/usr/bin/mongod --bind_ip_all --dbpath /data/db|g' /etc/supervisor/conf.d/supervisord.conf
    sudo supervisorctl reload
    sudo supervisorctl start mongodb
    sleep 5
fi

# 2. Check if your admin exists
ADMIN_EXISTS=$(mongosh academic_resources --quiet --eval "db.users.findOne({email: 'kartiksrathod07@gmail.com'}) != null" 2>/dev/null)
if [ "$ADMIN_EXISTS" = "true" ]; then
    echo "✓ Your admin account exists: kartiksrathod07@gmail.com"
else
    echo "⚠️  WARNING: Your admin account NOT FOUND!"
    echo "   Recreating your admin..."
    /root/.venv/bin/python /app/backend/create_your_admin.py
fi

# 3. Backup database
echo "📦 Creating database backup..."
mongodump --db academic_resources --out "$BACKUP_DIR/backup_$TIMESTAMP" --quiet 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Backup created: $BACKUP_DIR/backup_$TIMESTAMP"
    
    # Keep only last 5 backups
    ls -t $BACKUP_DIR | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}" 2>/dev/null
else
    echo "⚠️  Backup failed (database might be empty)"
fi

# 4. Verify data counts
USER_COUNT=$(mongosh academic_resources --quiet --eval "db.users.countDocuments({})" 2>/dev/null)
PAPER_COUNT=$(mongosh academic_resources --quiet --eval "db.papers.countDocuments({})" 2>/dev/null)
NOTE_COUNT=$(mongosh academic_resources --quiet --eval "db.notes.countDocuments({})" 2>/dev/null)
SYLLABUS_COUNT=$(mongosh academic_resources --quiet --eval "db.syllabus.countDocuments({})" 2>/dev/null)

echo ""
echo "📊 Current Data:"
echo "   Users: $USER_COUNT"
echo "   Papers: $PAPER_COUNT"
echo "   Notes: $NOTE_COUNT"
echo "   Syllabus: $SYLLABUS_COUNT"

# 5. Verify services are running
echo ""
echo "🔄 Service Status:"
sudo supervisorctl status | grep -E "(backend|frontend|mongodb)" | while read line; do
    if echo "$line" | grep -q "RUNNING"; then
        echo "   ✓ $line"
    else
        echo "   ✗ $line"
    fi
done

echo ""
echo "=========================================="
echo "✅ Data Protection Check Complete"
echo ""
