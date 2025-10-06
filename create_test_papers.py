#!/usr/bin/env python3

import os
import uuid
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# Configuration
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
papers_collection = db.papers
notes_collection = db.notes
syllabus_collection = db.syllabus

def create_test_papers():
    # Test papers with existing files
    test_papers = [
        {
            "_id": str(uuid.uuid4()),
            "title": "Data Structures and Algorithms",
            "branch": "Computer Science & Engineering",
            "description": "Previous year question paper on DSA concepts",
            "tags": ["algorithms", "data-structures", "computer-science"],
            "file_path": "uploads/papers/f8f9f4e2-553b-406d-a747-66af79122771-test_paper.pdf",
            "uploaded_by": "4b04a3c6-087a-4f98-ae7a-ed667cccf868",  # Admin ID
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Digital Electronics",
            "branch": "Electronics & Communication",
            "description": "Digital circuits and logic design question paper",
            "tags": ["digital", "electronics", "circuits"],
            "file_path": "uploads/papers/7da478b1-e07e-45ab-af13-e67bc56d042f-test_upload.pdf",
            "uploaded_by": "4b04a3c6-087a-4f98-ae7a-ed667cccf868",  # Admin ID
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Mathematics for Engineers",
            "branch": "Common for All",
            "description": "Engineering mathematics question paper",
            "tags": ["mathematics", "calculus", "linear-algebra"],
            "file_path": "uploads/papers/801303cf-1dd3-400c-9e4c-be39602eed14-test.pdf",
            "uploaded_by": "4b04a3c6-087a-4f98-ae7a-ed667cccf868",  # Admin ID
            "created_at": datetime.utcnow()
        }
    ]
    
    for paper in test_papers:
        existing = papers_collection.find_one({"title": paper["title"]})
        if existing:
            print(f"✅ Paper already exists: {paper['title']}")
            continue
            
        papers_collection.insert_one(paper)
        print(f"✅ Created paper: {paper['title']} ({paper['branch']})")

def create_test_notes():
    # Create test notes files 
    notes_dir = "/app/backend/uploads/notes/"
    
    # Create some dummy note files
    test_files = [
        "programming-fundamentals-notes.pdf",
        "engineering-physics-notes.pdf", 
        "circuit-analysis-notes.pdf"
    ]
    
    for filename in test_files:
        filepath = os.path.join(notes_dir, filename)
        if not os.path.exists(filepath):
            with open(filepath, 'w') as f:
                f.write("This is a sample note file for " + filename.replace('-', ' ').replace('.pdf', ''))
    
    test_notes = [
        {
            "_id": str(uuid.uuid4()),
            "title": "Programming Fundamentals",
            "branch": "Computer Science & Engineering", 
            "description": "Complete notes on programming basics and concepts",
            "tags": ["programming", "fundamentals", "coding"],
            "file_path": "uploads/notes/programming-fundamentals-notes.pdf",
            "uploaded_by": "4b04a3c6-087a-4f98-ae7a-ed667cccf868",
            "created_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "title": "Engineering Physics",
            "branch": "Common for All",
            "description": "Physics notes covering mechanics, waves, and optics",
            "tags": ["physics", "mechanics", "waves"],
            "file_path": "uploads/notes/engineering-physics-notes.pdf",
            "uploaded_by": "4b04a3c6-087a-4f98-ae7a-ed667cccf868",
            "created_at": datetime.utcnow()
        }
    ]
    
    for note in test_notes:
        existing = notes_collection.find_one({"title": note["title"]})
        if existing:
            print(f"✅ Note already exists: {note['title']}")
            continue
            
        notes_collection.insert_one(note)
        print(f"✅ Created note: {note['title']} ({note['branch']})")

if __name__ == "__main__":
    print("Creating test papers...")
    create_test_papers()
    print("\nCreating test notes...")
    create_test_notes()
    print("\n🎉 Test resources setup complete!")