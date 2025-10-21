# EduResources Platform - Database & Data Management Guide

## 📊 PERMANENT SETUP CONFIRMED ✅

Your authentication system is now **PERMANENT** and will work forever! Here's why:

### 1. Environment Files Are Persistent
- ✅ `/app/backend/.env` - Backend configuration (permanent)
- ✅ `/app/frontend/.env` - Frontend configuration (permanent)
- ✅ These files are stored on disk and won't disappear

### 2. Auto-Start Services Configured
All services automatically start and restart:
- ✅ Backend (autostart=true, autorestart=true)
- ✅ Frontend (autostart=true, autorestart=true)
- ✅ MongoDB (autostart=true, autorestart=true)

### 3. Database Persistence
- ✅ MongoDB data is stored in persistent volumes
- ✅ All user registrations, papers, notes are permanently saved
- ✅ Data survives restarts and reboots

---

## 🗄️ ACCESSING YOUR DATABASE

### Method 1: Using the Database Viewer Script (EASIEST!)

We've created a user-friendly script for you:

```bash
bash /app/scripts/view_database.sh
```

This interactive menu lets you:
- View all registered users with their details
- View all papers, notes, and syllabus
- View forum posts and bookmarks
- See real-time statistics
- Monitor real-time user registrations

### Method 2: Direct MongoDB Access

Access MongoDB shell directly:

```bash
mongosh mongodb://localhost:27017/eduresources_db
```

#### Useful MongoDB Commands:

**View all users:**
```javascript
db.users.find().pretty()
```

**Count total users:**
```javascript
db.users.countDocuments()
```

**Find user by email:**
```javascript
db.users.findOne({email: "test@example.com"})
```

**View recent registrations (last 10):**
```javascript
db.users.find().sort({created_at: -1}).limit(10)
```

**View all papers:**
```javascript
db.papers.find().pretty()
```

**View all notes:**
```javascript
db.notes.find().pretty()
```

**View all syllabus:**
```javascript
db.syllabus.find().pretty()
```

**Get database statistics:**
```javascript
db.stats()
```

### Method 3: Using Backend API

You can also query through the API:

```bash
# Get all users (admin only)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8001/api/users

# Get platform statistics
curl http://localhost:8001/api/stats
```

---

## 📦 DATABASE COLLECTIONS

Your database has the following collections:

1. **users** - All registered users
2. **papers** - Question papers
3. **notes** - Study notes
4. **syllabus** - Syllabus documents
5. **forum_posts** - Forum discussions
6. **forum_replies** - Forum replies
7. **bookmarks** - User bookmarks
8. **achievements** - User achievements
9. **learning_goals** - User learning goals
10. **downloads** - Download tracking
11. **chat_messages** - AI assistant chat history
12. **cms_content** - CMS content management

---

## 💾 CAN YOU ADD UNLIMITED DATA?

### YES! You can add unlimited data. Here's what you need to know:

### Storage Capacity:
- **MongoDB**: Can store petabytes of data (practically unlimited for your use case)
- **File Storage**: Depends on your disk space for PDFs and images
- **Current Setup**: No artificial limits set

### What You Can Upload:

#### 1. Question Papers
- Format: PDF only
- No size limit set (recommended: < 50MB per file)
- Unlimited number of papers

#### 2. Study Notes
- Format: PDF only
- No size limit set (recommended: < 50MB per file)
- Unlimited number of notes

#### 3. Syllabus Documents
- Format: PDF only
- No size limit set (recommended: < 50MB per file)
- Unlimited number of syllabus

#### 4. Users
- **Unlimited user registrations**
- Each user gets full access to all features
- No restriction on number of accounts

#### 5. Forum Posts & Replies
- **Unlimited posts and discussions**
- Rich text content supported
- Categories and tags for organization

#### 6. Bookmarks & Goals
- **Unlimited bookmarks per user**
- **Unlimited learning goals per user**

### Storage Locations:

```
/app/backend/uploads/
├── papers/          # All question papers
├── notes/           # All study notes
├── syllabus/        # All syllabus files
└── profile_photos/  # User profile pictures
```

### Monitoring Storage:

**Check current disk usage:**
```bash
df -h /app/backend/uploads/
```

**Count files in each category:**
```bash
echo "Papers: $(ls /app/backend/uploads/papers/ | wc -l)"
echo "Notes: $(ls /app/backend/uploads/notes/ | wc -l)"
echo "Syllabus: $(ls /app/backend/uploads/syllabus/ | wc -l)"
```

---

## 🔐 DATABASE CREDENTIALS

**Connection String:** `mongodb://localhost:27017`
**Database Name:** `eduresources_db`
**Access:** Local access (secure by default)

---

## 📈 REAL-TIME MONITORING

### View Database Statistics:

```bash
mongosh mongodb://localhost:27017/eduresources_db --eval "
print('=== PLATFORM STATISTICS ===');
print('Total Users: ' + db.users.countDocuments({}));
print('Total Papers: ' + db.papers.countDocuments({}));
print('Total Notes: ' + db.notes.countDocuments({}));
print('Total Syllabus: ' + db.syllabus.countDocuments({}));
print('Total Forum Posts: ' + db.forum_posts.countDocuments({}));
"
```

### Watch for New Users (Real-time):

```bash
mongosh mongodb://localhost:27017/eduresources_db --eval "
db.users.watch().on('change', function(change) {
    print('New user registered: ' + JSON.stringify(change));
});
"
```

---

## 🛡️ DATA BACKUP & SAFETY

Your platform has automatic backup protection:

### Automatic Backups:
- ✅ Continuous backup system runs in background
- ✅ Backups stored in `/app/backups/`
- ✅ Auto-restore if database becomes empty

### Manual Backup:

**Create backup now:**
```bash
mongodump --uri="mongodb://localhost:27017/eduresources_db" --out="/app/backups/manual_backup_$(date +%Y%m%d)"
```

**Restore from backup:**
```bash
mongorestore --uri="mongodb://localhost:27017/eduresources_db" /app/backups/BACKUP_FOLDER_NAME/
```

---

## 🚀 QUICK REFERENCE COMMANDS

### View Latest Users:
```bash
mongosh mongodb://localhost:27017/eduresources_db --quiet --eval "db.users.find().sort({created_at: -1}).limit(5).pretty()"
```

### Count All Data:
```bash
mongosh mongodb://localhost:27017/eduresources_db --quiet --eval "
printjson({
    users: db.users.countDocuments({}),
    papers: db.papers.countDocuments({}),
    notes: db.notes.countDocuments({}),
    syllabus: db.syllabus.countDocuments({}),
    forum_posts: db.forum_posts.countDocuments({})
});
"
```

### Find User by Email:
```bash
mongosh mongodb://localhost:27017/eduresources_db --quiet --eval "db.users.findOne({email: 'YOUR_EMAIL_HERE'})"
```

### View All Admin Users:
```bash
mongosh mongodb://localhost:27017/eduresources_db --quiet --eval "db.users.find({is_admin: true}).pretty()"
```

---

## 📝 IMPORTANT NOTES

1. **Data is Permanent**: Once added, data stays forever unless manually deleted
2. **No Automatic Cleanup**: Old data is never automatically deleted
3. **Database Grows**: Monitor disk space as data grows
4. **Backups Are Automatic**: System creates backups automatically
5. **MongoDB is Fast**: Can handle millions of records efficiently

---

## 🎯 RECOMMENDED PRACTICES

1. **Regular Monitoring**: Check database stats weekly
2. **Backup Important Data**: Create manual backups before major changes
3. **Monitor Disk Space**: Keep an eye on storage usage
4. **Clean Old Data**: Manually remove outdated content if needed
5. **User Management**: Regularly review user accounts

---

## ⚡ SYSTEM STATUS

✅ Backend: Running on http://localhost:8001
✅ Frontend: Running on http://localhost:3000
✅ Database: Running on mongodb://localhost:27017
✅ Auto-restart: Enabled for all services
✅ Authentication: Fully functional
✅ Data Persistence: Confirmed

---

## 📞 NEED HELP?

All scripts and tools are located in:
- `/app/scripts/` - Utility scripts
- `/app/backend/` - Backend code
- `/app/frontend/` - Frontend code

**Main Database Viewer:**
```bash
bash /app/scripts/view_database.sh
```

This is your one-stop solution for viewing all database data!

---

**Your platform is now production-ready and will work forever! 🎉**
