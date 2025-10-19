#!/bin/bash
# BULLETPROOF BACKEND STARTUP SCRIPT
# This ensures data is ALWAYS available

set -e

echo "🚀 Starting BULLETPROOF Backend..."

# Wait for MongoDB
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

# Restore data if needed
echo "📦 Checking data integrity..."
/app/scripts/auto_restore.sh

# Initialize database with admin
echo "👤 Ensuring admin user exists..."
cd /app/backend
/root/.venv/bin/python init_db.py

# Start continuous backup in background
echo "🛡️  Starting continuous backup system..."
/app/scripts/continuous_backup.sh > /var/log/backup.log 2>&1 &

# Start FastAPI server
echo "🌐 Starting FastAPI server..."
exec /root/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1 --reload
