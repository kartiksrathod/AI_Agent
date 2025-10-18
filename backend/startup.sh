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

# Initialize database with admin user
echo "📊 Initializing database..."
cd /app/backend
/root/.venv/bin/python init_db.py

# Start the FastAPI server
echo "🌐 Starting FastAPI server..."
exec /root/.venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 1 --reload
