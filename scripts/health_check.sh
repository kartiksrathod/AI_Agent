#!/bin/bash
# Comprehensive System Health Check Script

echo "======================================"
echo "🏥 SYSTEM HEALTH CHECK"
echo "======================================"
echo ""

# Check MongoDB
echo "1️⃣  MongoDB Status:"
if mongosh --quiet --eval "db.adminCommand('ping')" academic_resources_db >/dev/null 2>&1; then
    USERS=$(mongosh --quiet --eval "db.users.countDocuments({})" academic_resources_db 2>/dev/null)
    PAPERS=$(mongosh --quiet --eval "db.papers.countDocuments({})" academic_resources_db 2>/dev/null)
    NOTES=$(mongosh --quiet --eval "db.notes.countDocuments({})" academic_resources_db 2>/dev/null)
    echo "   ✅ MongoDB is running"
    echo "   📊 Users: $USERS | Papers: $PAPERS | Notes: $NOTES"
else
    echo "   ❌ MongoDB is NOT running"
fi
echo ""

# Check Backend
echo "2️⃣  Backend API Status:"
if curl -s http://localhost:8001/api/stats >/dev/null 2>&1; then
    echo "   ✅ Backend API is responding"
    STATS=$(curl -s http://localhost:8001/api/stats)
    echo "   📊 $STATS"
else
    echo "   ❌ Backend API is NOT responding"
fi
echo ""

# Check Frontend
echo "3️⃣  Frontend Status:"
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "   ✅ Frontend is serving"
else
    echo "   ❌ Frontend is NOT serving"
fi
echo ""

# Check Environment Files
echo "4️⃣  Configuration Files:"
if [ -f "/app/backend/.env" ]; then
    echo "   ✅ Backend .env exists"
else
    echo "   ❌ Backend .env missing"
fi

if [ -f "/app/frontend/.env" ]; then
    echo "   ✅ Frontend .env exists"
else
    echo "   ❌ Frontend .env missing"
fi
echo ""

# Check Supervisor Services
echo "5️⃣  Supervisor Services:"
sudo supervisorctl status | while read line; do
    SERVICE=$(echo "$line" | awk '{print $1}')
    STATUS=$(echo "$line" | awk '{print $2}')
    if [ "$STATUS" = "RUNNING" ]; then
        echo "   ✅ $SERVICE"
    else
        echo "   ❌ $SERVICE ($STATUS)"
    fi
done
echo ""

# Check Backups
echo "6️⃣  Backup Status:"
BACKUP_COUNT=$(ls -1 /app/backups 2>/dev/null | grep "backup_" | wc -l)
if [ "$BACKUP_COUNT" -gt "0" ]; then
    LATEST_BACKUP=$(ls -t /app/backups/backup_* 2>/dev/null | head -1)
    echo "   ✅ $BACKUP_COUNT backup(s) available"
    echo "   📦 Latest: $(basename "$LATEST_BACKUP")"
else
    echo "   ⚠️  No backups found"
fi
echo ""

echo "======================================"
echo "✅ Health Check Complete"
echo "======================================"
