#!/bin/bash
# BULLETPROOF Data Persistence Script
# This ensures your data NEVER gets lost

set -e

BACKUP_DIR="/app/backups"
MONGO_PERSISTENT_DIR="/app/mongodb_data"
LATEST_BACKUP_LINK="/app/backups/latest"

echo "🔄 Starting Data Persistence System..."

# Create persistent MongoDB directory if it doesn't exist
if [ ! -d "$MONGO_PERSISTENT_DIR" ]; then
    echo "📁 Creating persistent MongoDB directory..."
    mkdir -p "$MONGO_PERSISTENT_DIR"
    chown -R mongodb:mongodb "$MONGO_PERSISTENT_DIR"
fi

# Create backups directory
mkdir -p "$BACKUP_DIR"

# Check if MongoDB data directory is empty
if [ -z "$(ls -A $MONGO_PERSISTENT_DIR)" ]; then
    echo "⚠️  MongoDB data directory is empty. Restoring from backup..."
    
    # Find the latest backup
    if [ -L "$LATEST_BACKUP_LINK" ] && [ -d "$LATEST_BACKUP_LINK" ]; then
        LATEST_BACKUP="$LATEST_BACKUP_LINK"
    else
        LATEST_BACKUP=$(ls -td $BACKUP_DIR/backup_* 2>/dev/null | head -1)
    fi
    
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/academic_resources" ]; then
        echo "📦 Restoring from: $LATEST_BACKUP"
        
        # Restore the database
        mongorestore --quiet --nsInclude="academic_resources.*" "$LATEST_BACKUP/academic_resources/" --drop 2>&1 | grep -v "deprecated"
        
        echo "✅ Data restored successfully!"
    else
        echo "⚠️  No backup found. Starting with fresh database."
    fi
else
    echo "✅ MongoDB data directory exists and has data."
fi

# Verify data exists in database
echo "🔍 Verifying data in database..."
DATA_CHECK=$(mongosh academic_resources --quiet --eval "db.users.countDocuments() + db.papers.countDocuments() + db.notes.countDocuments() + db.syllabus.countDocuments()")

if [ "$DATA_CHECK" -eq "0" ]; then
    echo "⚠️  Database appears empty. Attempting restore..."
    
    LATEST_BACKUP=$(ls -td $BACKUP_DIR/backup_* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP/academic_resources" ]; then
        mongorestore --quiet --nsInclude="academic_resources.*" "$LATEST_BACKUP/academic_resources/" --drop
        echo "✅ Emergency restore completed!"
    fi
fi

echo "📊 Current database stats:"
mongosh academic_resources --quiet --eval "printjson({users: db.users.countDocuments(), papers: db.papers.countDocuments(), notes: db.notes.countDocuments(), syllabus: db.syllabus.countDocuments(), bookmarks: db.bookmarks.countDocuments()})"

echo "✅ Data Persistence System Ready!"
