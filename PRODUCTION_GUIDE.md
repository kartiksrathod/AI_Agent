# 📚 Production Guide - How to Add Real Data

This guide explains how to populate your Academic Resources platform with real data so users can see and interact with actual content.

---

## 🔐 Admin Access

Your admin account is already created:
- **Email:** kartiksrathod07@gmail.com
- **Password:** Sheshi@1234

**⚠️ IMPORTANT:** Change this password after first login for security!

---

## 📋 Table of Contents

1. [Adding Papers (Past Question Papers)](#1-adding-papers)
2. [Adding Notes (Study Notes)](#2-adding-notes)
3. [Adding Syllabus](#3-adding-syllabus)
4. [Creating Forum Posts](#4-creating-forum-posts)
5. [User Management](#5-user-management)
6. [Best Practices](#6-best-practices)

---

## 1. 📄 Adding Papers

### Via Web Interface (Recommended)

1. **Login as Admin**
   - Go to your website
   - Click "Login" and use admin credentials
   - You'll see "Admin Dashboard" option in navbar

2. **Navigate to Papers Section**
   - Click on "Papers" in the navigation menu
   - You'll see an "Upload Paper" button (visible to all logged-in users)

3. **Upload a Paper**
   - Click "Upload Paper" or "+" button
   - Fill in the form:
     - **Title:** e.g., "Data Structures - Mid Term 2024"
     - **Branch:** Select from dropdown (CSE, ECE, ISE, etc.)
     - **Description:** Brief description of the paper
     - **Tags:** Comma-separated (e.g., "dsa, mid-term, algorithms")
     - **File:** Upload PDF file (only PDFs accepted)
   - Click "Upload"

4. **Paper is Now Visible**
   - All users can now see, view, and download this paper
   - It appears in the Papers section, sorted by newest first

### Via API (Advanced)

```bash
curl -X POST "https://your-domain.com/api/papers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Data Structures Mid Term 2024" \
  -F "branch=Computer Science Engineering" \
  -F "description=Mid-term exam questions covering arrays and linked lists" \
  -F "tags=dsa,mid-term,algorithms" \
  -F "file=@/path/to/paper.pdf"
```

---

## 2. 📝 Adding Notes

### Via Web Interface (Recommended)

1. **Login** (admin or any user)
2. **Go to Notes Section**
   - Click "Notes" in navigation
3. **Upload Notes**
   - Click "Upload Notes" button
   - Fill in the form:
     - **Title:** e.g., "OOP Concepts - Complete Notes"
     - **Branch:** Select branch
     - **Description:** What topics are covered
     - **Tags:** e.g., "oop, java, concepts"
     - **File:** Upload PDF
   - Click "Upload"

### Example Good Note Titles
- "Database Management Systems - Unit 1 to 5"
- "Digital Electronics - Complete Handwritten Notes"
- "Web Technologies - HTML, CSS, JavaScript Basics"
- "Operating Systems - Process Management Notes"

---

## 3. 📋 Adding Syllabus

### Via Web Interface (Recommended)

1. **Login** (admin or any user)
2. **Go to Syllabus Section**
   - Click "Syllabus" in navigation
3. **Upload Syllabus**
   - Click "Upload Syllabus" button
   - Fill in the form:
     - **Title:** e.g., "CSE - 2024 Complete Syllabus"
     - **Branch:** Select branch
     - **Year:** e.g., "2024"
     - **Description:** Overview of syllabus
     - **Tags:** e.g., "cse, syllabus, 2024"
     - **File:** Upload PDF
   - Click "Upload"

### Example Syllabus Titles
- "Computer Science Engineering - 2024 Curriculum"
- "ECE Semester 5 Syllabus - 2024"
- "Mechanical Engineering - Complete Syllabus 2023-24"

---

## 4. 💬 Creating Forum Posts

### Via Web Interface

1. **Login** (any user can create posts)
2. **Go to Forum Section**
   - Click "Forum" in navigation
3. **Create New Post**
   - Click "New Discussion" or "Create Post"
   - Fill in the form:
     - **Title:** Clear, descriptive title
     - **Content:** Your question or discussion topic
     - **Category:** Select branch/topic
     - **Tags:** Relevant tags
   - Click "Post"

### Example Good Forum Posts
- "Need help with Recursion in C++ - Tree Traversal"
- "Study Group for DBMS Final Exam - Join Us!"
- "Best Resources for Learning React and Web Development"
- "Clarification on Digital Logic Gates - Help Needed"

### Users Can:
- Reply to posts
- View all discussions
- Search and filter by category/tags

---

## 5. 👥 User Management

### Creating Additional Admin Users

If you need more admin users:

1. **Via Script**
   ```bash
   cd /app
   python3 create_new_admin.py
   ```
   Follow the prompts to create a new admin user.

2. **Via Database (Advanced)**
   ```python
   # Connect to MongoDB and update user
   users_collection.update_one(
       {"email": "user@example.com"},
       {"$set": {"is_admin": True}}
   )
   ```

### Regular User Registration

Users can self-register:
1. Go to website
2. Click "Register"
3. Fill in: Name, Email, Password
4. They can immediately start using the platform

---

## 6. ✨ Best Practices

### For Papers
- ✅ Use clear, descriptive titles with year
- ✅ Include exam type (mid-term, final, practice)
- ✅ Add relevant tags for easy searching
- ✅ Organize by branch and subject
- ❌ Don't upload copyrighted material without permission

### For Notes
- ✅ Mention units/topics covered
- ✅ Indicate if handwritten or typed
- ✅ Add author/source if applicable
- ✅ Keep file sizes reasonable (compress PDFs if needed)

### For Syllabus
- ✅ Include academic year
- ✅ Specify semester if applicable
- ✅ Mention if it's official or reference
- ✅ Update when curriculum changes

### For Forum
- ✅ Use descriptive titles
- ✅ Be specific in your questions
- ✅ Add relevant tags and categories
- ✅ Reply to help others
- ❌ Don't spam or post off-topic content

---

## 📊 Monitoring Your Platform

### Check Stats
Visit the home page to see:
- Total Papers uploaded
- Total Notes available
- Total Syllabus documents
- Total registered Users

### Database Health
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Check backend API
curl https://your-domain.com/health
```

---

## 🔒 Security Recommendations

1. **Change Admin Password**
   - Login as admin
   - Go to Profile → Change Password
   - Use a strong password

2. **Regular Backups**
   ```bash
   # Backup MongoDB
   mongodump --uri="mongodb://localhost:27017/academic_resources" --out=/backups/$(date +%Y%m%d)
   ```

3. **Monitor User Uploads**
   - Regularly review uploaded content
   - Remove inappropriate or copyrighted material
   - Admin can delete any resource

4. **File Storage**
   - Uploaded files are stored in `/app/backend/uploads/`
   - Papers: `/app/backend/uploads/papers/`
   - Notes: `/app/backend/uploads/notes/`
   - Syllabus: `/app/backend/uploads/syllabus/`
   - Profile Photos: `/app/backend/uploads/profile_photos/`

---

## 🚀 Quick Start Checklist

- [ ] Login as admin
- [ ] Change admin password
- [ ] Upload 5-10 papers for different branches
- [ ] Upload 5-10 notes for popular subjects
- [ ] Upload current syllabus for all branches
- [ ] Create 2-3 sample forum posts
- [ ] Test as regular user (register new account)
- [ ] Verify download functionality works
- [ ] Check search and filtering works
- [ ] Test AI Assistant with a question

---

## 📞 Support

If you encounter any issues:

1. **Check Logs**
   ```bash
   # Backend logs
   tail -f /var/log/supervisor/backend.*.log
   
   # Frontend logs
   tail -f /var/log/supervisor/frontend.*.log
   ```

2. **Restart Services**
   ```bash
   sudo supervisorctl restart all
   ```

3. **Database Issues**
   ```bash
   # Check MongoDB
   sudo supervisorctl status mongodb
   
   # Restart MongoDB
   sudo supervisorctl restart mongodb
   ```

---

## 🎯 Success Metrics

Your platform is ready when:
- ✅ At least 10+ papers uploaded across different branches
- ✅ At least 10+ notes for popular subjects
- ✅ Current syllabus for all branches available
- ✅ 3-5 active forum discussions
- ✅ Multiple users registered and active
- ✅ Users can download resources successfully
- ✅ Search and filtering works smoothly
- ✅ AI Assistant responds correctly

---

**🎉 Congratulations! Your platform is now production-ready!**

Users can now:
- 📚 Browse and download papers, notes, and syllabus
- 💬 Participate in forum discussions
- 🤖 Get help from AI study assistant
- 📊 Track their learning progress
- 🏆 Earn achievements
- 🔖 Bookmark important resources
- 👤 Manage their profile

Start by uploading real academic content, and encourage users to contribute!
