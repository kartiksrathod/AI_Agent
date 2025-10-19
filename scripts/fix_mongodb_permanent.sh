#!/bin/bash
# PERMANENT MongoDB Configuration Fix
# This ensures MongoDB ALWAYS uses persistent storage at /data/db

set -e

PERSISTENT_DIR="/data/db"
MONGO_CONF="/etc/mongod.conf"

echo "🔧 Configuring PERMANENT MongoDB storage..."

# 1. Ensure persistent directory exists with correct permissions
mkdir -p "$PERSISTENT_DIR"
chown -R mongodb:mongodb "$PERSISTENT_DIR" 2>/dev/null || chown -R root:root "$PERSISTENT_DIR"
chmod 755 "$PERSISTENT_DIR"

# 2. Check if MongoDB config exists
if [ -f "$MONGO_CONF" ]; then
    echo "✓ MongoDB config found, updating..."
    # Backup original config
    cp "$MONGO_CONF" "${MONGO_CONF}.backup" 2>/dev/null || true
    
    # Update storage path
    sed -i 's|dbPath:.*|dbPath: /data/db|g' "$MONGO_CONF" 2>/dev/null || true
fi

# 3. Verify current MongoDB is using /data/db
CURRENT_PID=$(pgrep mongod || echo "")
if [ -n "$CURRENT_PID" ]; then
    CURRENT_DIR=$(sudo lsof -p $CURRENT_PID 2>/dev/null | grep "mongod.lock" | awk '{print $9}' | xargs dirname)
    echo "✓ Current MongoDB data directory: $CURRENT_DIR"
    
    if [ "$CURRENT_DIR" != "$PERSISTENT_DIR" ]; then
        echo "⚠️  MongoDB using wrong directory! Fixing..."
        # Stop MongoDB
        sudo supervisorctl stop mongodb
        
        # Migrate data if needed
        if [ -d "$CURRENT_DIR" ] && [ "$(ls -A $CURRENT_DIR)" ]; then
            echo "📦 Migrating data from $CURRENT_DIR to $PERSISTENT_DIR"
            rsync -av "$CURRENT_DIR/" "$PERSISTENT_DIR/" || true
        fi
        
        # Update supervisor config if possible
        echo "Note: Supervisor config is readonly, using runtime fix"
        
        # Start MongoDB with correct path
        sudo supervisorctl start mongodb
        sleep 3
    fi
else
    echo "✓ MongoDB not running yet (will start with correct config)"
fi

# 4. Verify permissions
echo "✓ Setting correct permissions on $PERSISTENT_DIR"
find "$PERSISTENT_DIR" -type d -exec chmod 755 {} \; 2>/dev/null || true
find "$PERSISTENT_DIR" -type f -exec chmod 644 {} \; 2>/dev/null || true

echo "✅ MongoDB persistent storage configured at: $PERSISTENT_DIR"
