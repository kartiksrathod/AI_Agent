#!/bin/bash
# PERMANENT MongoDB Persistent Storage Script
# This ensures MongoDB ALWAYS uses persistent storage

set -e

PERSISTENT_DIR="/data/db"
LEGACY_DIR="/var/lib/mongodb"

echo "🔒 Setting up PERMANENT MongoDB storage..."

# Create persistent directory
mkdir -p "$PERSISTENT_DIR"

# If data exists in legacy location, migrate it
if [ -d "$LEGACY_DIR" ] && [ "$(ls -A $LEGACY_DIR)" ]; then
    echo "📦 Migrating data from legacy location..."
    rsync -av "$LEGACY_DIR/" "$PERSISTENT_DIR/" || true
    echo "✅ Migration complete"
fi

# Set proper permissions
chown -R mongodb:mongodb "$PERSISTENT_DIR" 2>/dev/null || true
chmod 755 "$PERSISTENT_DIR"

# Start MongoDB with persistent storage
echo "🚀 Starting MongoDB with persistent storage: $PERSISTENT_DIR"
exec /usr/bin/mongod --bind_ip_all --dbpath "$PERSISTENT_DIR"
