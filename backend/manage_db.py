#!/usr/bin/env python3
"""
Database Management Utility for EduResources
View and manage users, data, and statistics
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import sys

load_dotenv()

def get_db():
    """Get database connection"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DATABASE_NAME", "academic_resources")
    client = MongoClient(mongo_url)
    return client[db_name], client

def view_all_users():
    """Display all registered users"""
    db, client = get_db()
    
    print("\n" + "="*70)
    print("👥 ALL REGISTERED USERS")
    print("="*70)
    
    users = db.users.find()
    count = 0
    
    for user in users:
        count += 1
        print(f"\n{count}. {user.get('name')}")
        print(f"   📧 Email: {user.get('email')}")
        print(f"   🎓 Course: {user.get('course', 'N/A')}")
        print(f"   🆔 USN: {user.get('usn', 'N/A')}")
        print(f"   👑 Admin: {'Yes' if user.get('is_admin') else 'No'}")
        print(f"   📅 Joined: {user.get('created_at', 'N/A')}")
        print(f"   📷 Photo: {'Yes' if user.get('profile_photo') else 'No'}")
    
    if count == 0:
        print("\n❌ No users found!")
    else:
        print(f"\n📊 Total Users: {count}")
    
    print("="*70 + "\n")
    client.close()

def view_statistics():
    """Display database statistics"""
    db, client = get_db()
    
    print("\n" + "="*70)
    print("📊 DATABASE STATISTICS")
    print("="*70)
    
    stats = {
        "👥 Total Users": db.users.count_documents({}),
        "👑 Admin Users": db.users.count_documents({"is_admin": True}),
        "📄 Total Papers": db.papers.count_documents({}),
        "📝 Total Notes": db.notes.count_documents({}),
        "📚 Total Syllabus": db.syllabus.count_documents({}),
        "💬 Forum Posts": db.forum_posts.count_documents({}),
        "💭 Forum Replies": db.forum_replies.count_documents({}),
        "🔖 Total Bookmarks": db.bookmarks.count_documents({}),
        "🎯 Learning Goals": db.learning_goals.count_documents({}),
        "🏆 Achievements Earned": db.achievements.count_documents({}),
        "📥 Total Downloads": db.downloads.count_documents({}),
        "📢 Announcements": db.cms_content.count_documents({}),
    }
    
    for label, count in stats.items():
        print(f"{label}: {count}")
    
    print("="*70 + "\n")
    client.close()

def make_user_admin():
    """Make a user admin by email"""
    db, client = get_db()
    
    email = input("\n📧 Enter user email to make admin: ").strip()
    
    if not email:
        print("❌ Email cannot be empty!")
        client.close()
        return
    
    user = db.users.find_one({"email": email})
    
    if not user:
        print(f"❌ User with email '{email}' not found!")
        client.close()
        return
    
    if user.get("is_admin"):
        print(f"ℹ️  User '{user['name']}' is already an admin!")
        client.close()
        return
    
    db.users.update_one(
        {"email": email},
        {"$set": {"is_admin": True}}
    )
    
    print(f"✅ Successfully made '{user['name']}' an admin!")
    client.close()

def view_recent_uploads():
    """View recent uploads"""
    db, client = get_db()
    
    print("\n" + "="*70)
    print("📤 RECENT UPLOADS (Last 10)")
    print("="*70)
    
    print("\n📄 Recent Papers:")
    for paper in db.papers.find().sort("created_at", -1).limit(5):
        print(f"  • {paper.get('title')} [{paper.get('branch')}]")
    
    print("\n📝 Recent Notes:")
    for note in db.notes.find().sort("created_at", -1).limit(5):
        print(f"  • {note.get('title')} [{note.get('branch')}]")
    
    print("\n📚 Recent Syllabus:")
    for syl in db.syllabus.find().sort("created_at", -1).limit(5):
        print(f"  • {syl.get('title')} [{syl.get('branch')} - {syl.get('year')}]")
    
    print("="*70 + "\n")
    client.close()

def main_menu():
    """Display main menu"""
    while True:
        print("\n" + "="*70)
        print("🎓 EduResources Database Manager")
        print("="*70)
        print("\n1. View All Users")
        print("2. View Statistics")
        print("3. Make User Admin")
        print("4. View Recent Uploads")
        print("5. Exit")
        print("\n" + "="*70)
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            view_all_users()
        elif choice == "2":
            view_statistics()
        elif choice == "3":
            make_user_admin()
        elif choice == "4":
            view_recent_uploads()
        elif choice == "5":
            print("\n👋 Goodbye!\n")
            break
        else:
            print("\n❌ Invalid choice! Please try again.")

if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)
