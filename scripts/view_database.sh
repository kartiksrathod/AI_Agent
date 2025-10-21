#!/bin/bash
# Database Viewer Script for EduResources Platform
# This script helps you view all data in your MongoDB database

echo "=========================================="
echo "    EDURESOURCES DATABASE VIEWER"
echo "=========================================="
echo ""

DB_NAME="eduresources_db"
MONGO_URL="mongodb://localhost:27017"

# Function to display menu
show_menu() {
    echo ""
    echo "What would you like to view?"
    echo "1) All Users"
    echo "2) All Papers"
    echo "3) All Notes"
    echo "4) All Syllabus"
    echo "5) Forum Posts"
    echo "6) Bookmarks"
    echo "7) Achievements"
    echo "8) Learning Goals"
    echo "9) Database Statistics"
    echo "10) Real-time User Activity"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice: " choice
}

# Function to view all users
view_users() {
    echo ""
    echo "=== ALL REGISTERED USERS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.users.find({}, {
        name: 1, 
        email: 1, 
        usn: 1, 
        course: 1, 
        semester: 1, 
        is_admin: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to view papers
view_papers() {
    echo ""
    echo "=== ALL QUESTION PAPERS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.papers.find({}, {
        title: 1, 
        branch: 1, 
        description: 1, 
        tags: 1, 
        uploaded_by: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to view notes
view_notes() {
    echo ""
    echo "=== ALL STUDY NOTES ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.notes.find({}, {
        title: 1, 
        branch: 1, 
        description: 1, 
        tags: 1, 
        uploaded_by: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to view syllabus
view_syllabus() {
    echo ""
    echo "=== ALL SYLLABUS DOCUMENTS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.syllabus.find({}, {
        title: 1, 
        branch: 1, 
        year: 1, 
        description: 1, 
        tags: 1, 
        uploaded_by: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to view forum posts
view_forum() {
    echo ""
    echo "=== ALL FORUM POSTS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.forum_posts.find({}, {
        title: 1, 
        content: 1, 
        category: 1, 
        author_id: 1, 
        views: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to view bookmarks
view_bookmarks() {
    echo ""
    echo "=== ALL BOOKMARKS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.bookmarks.find({}, {
        user_id: 1, 
        resource_type: 1, 
        resource_id: 1, 
        category: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to view achievements
view_achievements() {
    echo ""
    echo "=== ALL ACHIEVEMENTS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.achievements.find({}, {
        user_id: 1, 
        name: 1, 
        description: 1, 
        icon: 1, 
        earned_at: 1
    }).sort({earned_at: -1}).pretty()
    "
}

# Function to view learning goals
view_goals() {
    echo ""
    echo "=== ALL LEARNING GOALS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    db.learning_goals.find({}, {
        user_id: 1, 
        title: 1, 
        description: 1, 
        progress: 1, 
        completed: 1, 
        target_date: 1, 
        created_at: 1
    }).sort({created_at: -1}).pretty()
    "
}

# Function to show database statistics
view_stats() {
    echo ""
    echo "=== DATABASE STATISTICS ==="
    mongosh $MONGO_URL/$DB_NAME --quiet --eval "
    print('Total Users: ' + db.users.countDocuments({}));
    print('Total Papers: ' + db.papers.countDocuments({}));
    print('Total Notes: ' + db.notes.countDocuments({}));
    print('Total Syllabus: ' + db.syllabus.countDocuments({}));
    print('Total Forum Posts: ' + db.forum_posts.countDocuments({}));
    print('Total Forum Replies: ' + db.forum_replies.countDocuments({}));
    print('Total Bookmarks: ' + db.bookmarks.countDocuments({}));
    print('Total Achievements: ' + db.achievements.countDocuments({}));
    print('Total Learning Goals: ' + db.learning_goals.countDocuments({}));
    print('Total Downloads: ' + db.downloads.countDocuments({}));
    print('');
    print('=== USER BREAKDOWN ===');
    print('Admin Users: ' + db.users.countDocuments({is_admin: true}));
    print('Regular Users: ' + db.users.countDocuments({is_admin: false}));
    print('');
    print('=== RECENT ACTIVITY (Last 24 hours) ===');
    var yesterday = new Date(Date.now() - 24*60*60*1000);
    print('New Users: ' + db.users.countDocuments({created_at: {\$gte: yesterday}}));
    print('New Papers: ' + db.papers.countDocuments({created_at: {\$gte: yesterday}}));
    print('New Notes: ' + db.notes.countDocuments({created_at: {\$gte: yesterday}}));
    "
}

# Function to watch real-time changes
view_realtime() {
    echo ""
    echo "=== REAL-TIME USER ACTIVITY ==="
    echo "Showing latest 5 users (refresh every 3 seconds)..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        clear
        echo "=== LATEST USERS (Auto-refresh) ==="
        mongosh $MONGO_URL/$DB_NAME --quiet --eval "
        db.users.find({}, {
            name: 1, 
            email: 1, 
            course: 1, 
            created_at: 1
        }).sort({created_at: -1}).limit(5).pretty()
        "
        echo ""
        echo "Refreshing in 3 seconds... (Press Ctrl+C to exit)"
        sleep 3
    done
}

# Main menu loop
while true; do
    show_menu
    
    case $choice in
        1) view_users ;;
        2) view_papers ;;
        3) view_notes ;;
        4) view_syllabus ;;
        5) view_forum ;;
        6) view_bookmarks ;;
        7) view_achievements ;;
        8) view_goals ;;
        9) view_stats ;;
        10) view_realtime ;;
        0) 
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
