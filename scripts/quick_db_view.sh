#!/bin/bash
# Quick Database Viewer for EduResources

echo "=========================================="
echo "  📊 EDURESOURCES DATABASE - QUICK VIEW"
echo "=========================================="
echo ""

mongosh mongodb://localhost:27017/eduresources_db --quiet --eval "
print('✅ Database: CONNECTED');
print('');
print('📈 STATISTICS:');
print('├── Users: ' + db.users.countDocuments({}));
print('├── Papers: ' + db.papers.countDocuments({}));
print('├── Notes: ' + db.notes.countDocuments({}));
print('├── Syllabus: ' + db.syllabus.countDocuments({}));
print('├── Forum Posts: ' + db.forum_posts.countDocuments({}));
print('└── Bookmarks: ' + db.bookmarks.countDocuments({}));
print('');
print('👥 ALL REGISTERED USERS:');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
db.users.find({}, {name: 1, email: 1, usn: 1, course: 1, semester: 1, is_admin: 1, created_at: 1}).sort({created_at: -1}).forEach(function(user) {
    print('');
    print('👤 Name: ' + user.name);
    print('   Email: ' + user.email);
    print('   USN: ' + user.usn);
    print('   Course: ' + user.course + ' | Semester: ' + user.semester);
    print('   Admin: ' + (user.is_admin ? 'Yes' : 'No'));
    print('   Registered: ' + user.created_at.toISOString().split('T')[0]);
});
print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
"
