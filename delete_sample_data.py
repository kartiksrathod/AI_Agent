#!/usr/bin/env python3
"""Delete all sample test data from the academic resources platform"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]

# Collections
papers_collection = db.papers
notes_collection = db.notes
syllabus_collection = db.syllabus
forum_posts_collection = db.forum_posts
forum_replies_collection = db.forum_replies
bookmarks_collection = db.bookmarks
achievements_collection = db.achievements
learning_goals_collection = db.learning_goals
downloads_collection = db.downloads
chat_messages_collection = db.chat_messages

print("🗑️  DELETING ALL SAMPLE DATA...")
print("="*60)

# Delete papers
papers_count = papers_collection.count_documents({})
if papers_count > 0:
    papers_collection.delete_many({})
    print(f"✓ Deleted {papers_count} papers")
else:
    print("✓ No papers to delete")

# Delete notes
notes_count = notes_collection.count_documents({})
if notes_count > 0:
    notes_collection.delete_many({})
    print(f"✓ Deleted {notes_count} notes")
else:
    print("✓ No notes to delete")

# Delete syllabus
syllabus_count = syllabus_collection.count_documents({})
if syllabus_count > 0:
    syllabus_collection.delete_many({})
    print(f"✓ Deleted {syllabus_count} syllabus documents")
else:
    print("✓ No syllabus to delete")

# Delete forum replies first (foreign key dependency)
replies_count = forum_replies_collection.count_documents({})
if replies_count > 0:
    forum_replies_collection.delete_many({})
    print(f"✓ Deleted {replies_count} forum replies")
else:
    print("✓ No forum replies to delete")

# Delete forum posts
posts_count = forum_posts_collection.count_documents({})
if posts_count > 0:
    forum_posts_collection.delete_many({})
    print(f"✓ Deleted {posts_count} forum posts")
else:
    print("✓ No forum posts to delete")

# Optional: Clean up user-related data (uncomment if needed)
# print("\n🧹 Cleaning up user data...")
# bookmarks_collection.delete_many({})
# achievements_collection.delete_many({})
# learning_goals_collection.delete_many({})
# downloads_collection.delete_many({})
# chat_messages_collection.delete_many({})
# print("✓ Cleaned up user bookmarks, achievements, goals, downloads, and chat history")

print("\n" + "="*60)
print("✅ ALL SAMPLE DATA DELETED SUCCESSFULLY!")
print("="*60)
print("\n📝 The database is now clean and ready for production use.")
print("💡 Admin user is preserved. You can now add real data.")
print(f"\n👤 Admin Login:")
print(f"   Email: kartiksrathod07@gmail.com")
print(f"   Password: Sheshi@1234")
