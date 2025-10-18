#!/usr/bin/env python3
"""Create sample test data for the academic resources platform"""

from pymongo import MongoClient
import uuid
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
papers_collection = db.papers
notes_collection = db.notes
syllabus_collection = db.syllabus
forum_posts_collection = db.forum_posts
forum_replies_collection = db.forum_replies

# Get admin user
admin = users_collection.find_one({"email": "kartiksrathod07@gmail.com"})
if not admin:
    print("❌ Admin user not found!")
    exit(1)

admin_id = admin["_id"]
print(f"✓ Using admin user: {admin['email']}")

# Sample data
branches = [
    "Computer Science Engineering",
    "Electronics & Communication Engineering",
    "Information Science & Technology",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering"
]

# Create sample papers
print("\n📄 Creating sample papers...")
sample_papers = [
    {
        "title": "Data Structures and Algorithms - Mid Term Exam 2024",
        "branch": "Computer Science Engineering",
        "description": "Mid-term examination questions covering arrays, linked lists, stacks, and queues",
        "tags": ["dsa", "mid-term", "algorithms"]
    },
    {
        "title": "Digital Electronics - Final Exam 2023",
        "branch": "Electronics & Communication Engineering",
        "description": "Final examination covering boolean algebra, logic gates, and sequential circuits",
        "tags": ["digital-electronics", "final-exam", "circuits"]
    },
    {
        "title": "Database Management Systems - Practice Paper",
        "branch": "Information Science & Technology",
        "description": "Practice questions on SQL, normalization, and transaction management",
        "tags": ["dbms", "sql", "practice"]
    }
]

paper_ids = []
for paper_data in sample_papers:
    paper_id = str(uuid.uuid4())
    paper_doc = {
        "_id": paper_id,
        "title": paper_data["title"],
        "branch": paper_data["branch"],
        "description": paper_data["description"],
        "tags": paper_data["tags"],
        "file_path": f"uploads/papers/{paper_id}-sample.pdf",  # Dummy path
        "uploaded_by": admin_id,
        "created_at": datetime.utcnow() - timedelta(days=5)
    }
    papers_collection.insert_one(paper_doc)
    paper_ids.append(paper_id)
    print(f"  ✓ Created paper: {paper_data['title']}")

# Create sample notes
print("\n📝 Creating sample notes...")
sample_notes = [
    {
        "title": "Object-Oriented Programming Concepts",
        "branch": "Computer Science Engineering",
        "description": "Comprehensive notes on OOP principles, inheritance, polymorphism, and encapsulation",
        "tags": ["oop", "java", "concepts"]
    },
    {
        "title": "Signals and Systems - Unit 3",
        "branch": "Electronics & Communication Engineering",
        "description": "Detailed notes on Fourier transforms and signal processing",
        "tags": ["signals", "fourier", "dsp"]
    },
    {
        "title": "Web Technologies Complete Notes",
        "branch": "Information Science & Technology",
        "description": "HTML, CSS, JavaScript, and React fundamentals",
        "tags": ["web", "html", "react"]
    }
]

note_ids = []
for note_data in sample_notes:
    note_id = str(uuid.uuid4())
    note_doc = {
        "_id": note_id,
        "title": note_data["title"],
        "branch": note_data["branch"],
        "description": note_data["description"],
        "tags": note_data["tags"],
        "file_path": f"uploads/notes/{note_id}-sample.pdf",  # Dummy path
        "uploaded_by": admin_id,
        "created_at": datetime.utcnow() - timedelta(days=3)
    }
    notes_collection.insert_one(note_doc)
    note_ids.append(note_id)
    print(f"  ✓ Created note: {note_data['title']}")

# Create sample syllabus
print("\n📋 Creating sample syllabus...")
sample_syllabus = [
    {
        "title": "Computer Science Engineering - 2024 Syllabus",
        "branch": "Computer Science Engineering",
        "year": "2024",
        "description": "Complete syllabus for all semesters of CSE program",
        "tags": ["cse", "syllabus", "2024"]
    },
    {
        "title": "Electronics & Communication - 2024 Curriculum",
        "branch": "Electronics & Communication Engineering",
        "year": "2024",
        "description": "Updated curriculum for ECE program with new subjects",
        "tags": ["ece", "curriculum", "2024"]
    }
]

syllabus_ids = []
for syl_data in sample_syllabus:
    syl_id = str(uuid.uuid4())
    syl_doc = {
        "_id": syl_id,
        "title": syl_data["title"],
        "branch": syl_data["branch"],
        "year": syl_data["year"],
        "description": syl_data["description"],
        "tags": syl_data["tags"],
        "file_path": f"uploads/syllabus/{syl_id}-sample.pdf",  # Dummy path
        "uploaded_by": admin_id,
        "created_at": datetime.utcnow() - timedelta(days=7)
    }
    syllabus_collection.insert_one(syl_doc)
    syllabus_ids.append(syl_id)
    print(f"  ✓ Created syllabus: {syl_data['title']}")

# Create sample forum posts
print("\n💬 Creating sample forum posts...")
sample_forum_posts = [
    {
        "title": "Need help understanding recursion in C++",
        "content": "I'm having trouble understanding how recursion works, especially with tree traversal. Can someone explain with examples?",
        "category": "Computer Science Engineering",
        "tags": ["recursion", "cpp", "help"]
    },
    {
        "title": "Best resources for learning React",
        "content": "I want to learn React for my final year project. What are the best tutorials or courses you would recommend?",
        "category": "Information Science & Technology",
        "tags": ["react", "resources", "web-dev"]
    },
    {
        "title": "Study group for DBMS exam",
        "content": "Looking to form a study group for the upcoming DBMS exam. We can meet online twice a week. Who's interested?",
        "category": "Computer Science Engineering",
        "tags": ["dbms", "study-group", "exam"]
    }
]

post_ids = []
for i, post_data in enumerate(sample_forum_posts):
    post_id = str(uuid.uuid4())
    now = datetime.utcnow() - timedelta(days=2-i)
    
    post_doc = {
        "_id": post_id,
        "title": post_data["title"],
        "content": post_data["content"],
        "category": post_data["category"],
        "tags": post_data["tags"],
        "author_id": admin_id,
        "views": (i + 1) * 15,
        "created_at": now,
        "updated_at": now,
        "last_activity": now
    }
    forum_posts_collection.insert_one(post_doc)
    post_ids.append(post_id)
    print(f"  ✓ Created post: {post_data['title']}")
    
    # Add a sample reply to first post
    if i == 0:
        reply_id = str(uuid.uuid4())
        reply_doc = {
            "_id": reply_id,
            "post_id": post_id,
            "author_id": admin_id,
            "content": "Recursion is like a function calling itself. Think of it like looking into two mirrors facing each other - you see infinite reflections. Each call to the function creates a new 'frame' on the call stack.",
            "created_at": now + timedelta(hours=2)
        }
        forum_replies_collection.insert_one(reply_doc)
        print(f"    ✓ Added reply to post")

print("\n" + "="*60)
print("✅ SAMPLE DATA CREATED SUCCESSFULLY!")
print("="*60)
print(f"\n📊 Summary:")
print(f"  • Papers: {len(paper_ids)}")
print(f"  • Notes: {len(note_ids)}")
print(f"  • Syllabus: {len(syllabus_ids)}")
print(f"  • Forum Posts: {len(post_ids)}")
print(f"\n⚠️  Note: PDF files are dummy paths. Real file upload will be needed for download functionality.")
print(f"💡 Use this data to test all features, then delete it using delete_sample_data.py")
