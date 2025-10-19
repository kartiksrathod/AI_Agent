#!/bin/bash
# Startup script for backend - ensures everything is ready before starting server

echo "🚀 Starting Academic Resources Backend..."

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

# CRITICAL: Ensure data persistence - RESTORE DATA IF NEEDED
echo "🔐 Ensuring data persistence..."
/app/scripts/ensure_data_persistence.sh

# Initialize database with admin user (only if needed)
echo "📊 Checking database initialization..."
cd /app/backend
/root/.venv/bin/python init_db.py

# Start auto-backup cron job in background (every 5 minutes)
echo "🔄 Starting automatic backup system..."
(while true; do /app/scripts/auto_backup.sh; sleep 300; done) &

# Start the FastAPI server
echo "🌐 Starting FastAPI server..."
exec /root/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1 --reload
