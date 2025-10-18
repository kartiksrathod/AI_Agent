# 📚 Academic Resources Platform - Admin Guide

## 🎯 Production Ready Status

✅ **FULLY OPERATIONAL** - All features tested and working!

---

## 👤 Admin Credentials

```
Email: kartiksrathod07@gmail.com
Password: Sheshi@1234
Role: Administrator
```

⚠️ **IMPORTANT**: Change this password after first login in production!

---

## 🚀 Quick Start Guide

### Step 1: Login as Admin
1. Open the website
2. Click **"Login"** in the navbar
3. Enter your admin credentials
4. Click **"Sign In"**

### Step 2: Access Admin Features
Once logged in as admin, you'll see special controls:
- ✅ **Green "Add" buttons** on Papers, Notes, and Syllabus pages
- ✅ **Red trash icons** to delete any resource
- ✅ **Checkboxes** for bulk delete operations

---

## 📋 Features Overview

### 1. 📄 Papers Management

**Location**: Navigate to "Papers" from navbar

**Admin Capabilities**:
- Upload question papers (PDF only)
- Delete any paper
- Bulk delete multiple papers

**How to Add a Paper**:
1. Go to Papers page
2. Click green **"Add Paper"** button (top section)
3. Fill in the form:
   - **Title**: e.g., "Data Structures Mid-Term 2024"
   - **Branch**: Select from dropdown (CSE, ECE, ISE, etc.)
   - **Description**: Optional brief description
   - **Tags**: Comma-separated (e.g., "dsa, exam, algorithms")
   - **PDF File**: Upload the question paper (PDF only)
4. Click **"Upload"**
5. Done! Paper appears immediately on the page

**How to Delete a Paper**:
- **Single Delete**: Click red trash icon on any paper card
- **Bulk Delete**: 
  1. Check boxes of papers to delete
  2. Click **"Delete Selected"** button
  3. Confirm deletion

---

### 2. 📝 Notes Management

**Location**: Navigate to "Notes" from navbar

**How to Add Notes**:
1. Go to Notes page
2. Click green **"Add Notes"** button
3. Fill in the form:
   - **Title**: e.g., "Object-Oriented Programming Notes"
   - **Branch**: Select branch
   - **Description**: Optional
   - **Tags**: Comma-separated (e.g., "oop, java, concepts")
   - **PDF File**: Upload notes PDF
4. Click **"Upload"**

**How to Delete Notes**:
- Same as papers (single or bulk delete)

---

### 3. 📚 Syllabus Management

**Location**: Navigate to "Syllabus" from navbar

**How to Add Syllabus**:
1. Go to Syllabus page
2. Click green **"Add Syllabus"** button
3. Fill in the form:
   - **Title**: e.g., "CSE 2024 Complete Syllabus"
   - **Branch**: Select branch
   - **Year**: e.g., "2024"
   - **Description**: Optional
   - **Tags**: Comma-separated
   - **PDF File**: Upload syllabus PDF
4. Click **"Upload"**

**How to Delete Syllabus**:
- Same as papers (single or bulk delete)

---

### 4. 💬 Forum Management (NEW!)

**Location**: Navigate to "Forum" from navbar

**Features**:
- Real database-backed forum (no more mock data!)
- Create discussion posts
- Reply to posts
- Delete posts and replies

**How to Create a Forum Post**:
1. Go to Forum page
2. Click **"New Post"** button
3. Fill in:
   - **Title**: Discussion topic
   - **Category**: Select branch
   - **Content**: Your question or discussion
   - **Tags**: Optional comma-separated tags
4. Click **"Create Post"**

**Admin Privileges**:
- Delete any post (even if you didn't create it)
- Delete any reply
- Full moderation control

---

### 5. 🤖 AI Study Assistant

**Location**: Chat icon in bottom-right corner

**Features**:
- Powered by GPT-4o-mini via Emergent LLM
- Helps with engineering topics
- Contextual study assistance
- Available to all users (not just admin)

**How to Use**:
1. Click the chat bubble icon
2. Type your engineering question
3. Get instant AI-powered answers

---

### 6. 👤 Profile Features

**Your Profile Dashboard**:
- View statistics (downloads, bookmarks, goals)
- Upload profile photo
- Update name and password
- Track achievements
- Manage bookmarks
- Set learning goals

**How to Access**:
1. Click your profile icon in navbar
2. Select "Profile" from dropdown

---

## 🎨 User Interface Features

### For All Users:
- ✅ **Light/Dark Mode**: Toggle in navbar
- ✅ **Search**: Find papers, notes, and syllabus
- ✅ **Filter by Branch**: Quick category filtering
- ✅ **Download/View**: Preview or download resources
- ✅ **Bookmarks**: Save favorite resources
- ✅ **Achievements**: Earn badges for activities
- ✅ **Learning Goals**: Track study progress

### Admin-Only Features:
- ✅ **Upload Controls**: Green "Add" buttons
- ✅ **Delete Controls**: Red trash icons everywhere
- ✅ **Bulk Actions**: Select multiple items
- ✅ **Forum Moderation**: Delete any post/reply

---

## 📊 Testing & Sample Data

### Current Status:
✅ Sample data is loaded for testing
- 3 Sample Papers
- 3 Sample Notes  
- 2 Sample Syllabus
- 3 Sample Forum Posts

### To Delete Sample Data:
```bash
cd /app
python3 delete_sample_data.py
```

This will clean the database completely, ready for production use.

---

## 🔧 Technical Details

### Tech Stack:
- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Emergent LLM (GPT-4o-mini)

### File Storage:
- Papers: `/app/backend/uploads/papers/`
- Notes: `/app/backend/uploads/notes/`
- Syllabus: `/app/backend/uploads/syllabus/`
- Profile Photos: `/app/backend/uploads/profile_photos/`

### API Endpoints:
All admin endpoints require authentication token.

**Papers**:
- GET `/api/papers` - List all papers
- POST `/api/papers` - Upload paper (admin only)
- DELETE `/api/papers/{id}` - Delete paper (admin/owner)
- GET `/api/papers/{id}/download` - Download paper

**Notes**:
- GET `/api/notes` - List all notes
- POST `/api/notes` - Upload note (admin only)
- DELETE `/api/notes/{id}` - Delete note (admin/owner)

**Syllabus**:
- GET `/api/syllabus` - List all syllabus
- POST `/api/syllabus` - Upload syllabus (admin only)
- DELETE `/api/syllabus/{id}` - Delete syllabus (admin/owner)

**Forum**:
- GET `/api/forum/posts` - List all posts
- POST `/api/forum/posts` - Create post (logged-in users)
- GET `/api/forum/posts/{id}` - Get single post
- DELETE `/api/forum/posts/{id}` - Delete post (admin/owner)
- GET `/api/forum/posts/{id}/replies` - Get replies
- POST `/api/forum/posts/{id}/replies` - Add reply
- DELETE `/api/forum/replies/{id}` - Delete reply (admin/owner)

---

## 🚨 Important Notes

### Security:
- ⚠️ Change admin password immediately in production
- ⚠️ All file uploads are validated (PDF only)
- ⚠️ JWT tokens expire after 30 minutes
- ⚠️ Only admin can upload/delete resources

### Best Practices:
1. **Test all features** with sample data first
2. **Delete sample data** before going live
3. **Backup database** regularly
4. **Monitor file storage** space
5. **Keep admin credentials secure**

### File Upload Guidelines:
- **Format**: PDF only
- **Size**: No hard limit (but keep reasonable < 50MB)
- **Naming**: System auto-generates unique names
- **Organization**: Files stored by type in separate folders

---

## 🎓 For Regular Users

Regular users (non-admin) can:
- ✅ Register and create account
- ✅ Login/Logout
- ✅ View all resources (papers, notes, syllabus)
- ✅ Download/Preview PDFs
- ✅ Search and filter content
- ✅ Use AI Study Assistant
- ✅ Create forum posts and replies
- ✅ Bookmark resources
- ✅ Set learning goals
- ✅ Earn achievements
- ✅ Update profile

Regular users **cannot**:
- ❌ Upload papers, notes, or syllabus
- ❌ Delete resources (except their own forum posts)
- ❌ See admin controls

---

## 📞 Support & Maintenance

### To Create Additional Admins:
```bash
cd /app/backend
python3 make_admin.py <user_email>
```

Example:
```bash
python3 make_admin.py newadmin@example.com
```

### To Check Database Status:
```bash
curl http://localhost:8001/health
```

### To View Statistics:
```bash
curl http://localhost:8001/api/stats
```

---

## ✅ Production Checklist

Before going live:

- [ ] Test all features with sample data
- [ ] Delete sample data: `python3 delete_sample_data.py`
- [ ] Change admin password
- [ ] Upload real papers, notes, syllabus
- [ ] Create welcome forum posts
- [ ] Test user registration
- [ ] Test file downloads
- [ ] Verify AI assistant works
- [ ] Check mobile responsiveness
- [ ] Set up regular backups
- [ ] Monitor storage space

---

## 🎉 You're Ready!

The platform is fully operational and production-ready. All features work end-to-end:

✅ User Authentication
✅ Resource Management (Papers, Notes, Syllabus)
✅ Real Forum System
✅ AI Study Assistant
✅ Profile Management
✅ Achievements & Goals
✅ Bookmarks
✅ Search & Filter
✅ Dark Mode
✅ Mobile Responsive

**Happy managing! 🚀**

---

**Created by**: Kartik S Rathod
**Platform**: Academic Resources - Engineering Student Portal
**Version**: Production v1.0
**Last Updated**: October 2025
