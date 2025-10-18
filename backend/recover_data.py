#!/usr/bin/env python3
"""
Data Recovery Script - Recover uploaded files and create database entries
This helps recover files when database records are lost
"""
import os
import uuid
from datetime import datetime
from pymongo import MongoClient
from pathlib import Path
import re
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academic_resources")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

def recover_files():
    """Scan upload directories and create database entries for orphaned files"""
    client = MongoClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    # Get admin user to assign as uploader
    admin = db.users.find_one({"is_admin": True})
    if not admin:
        print("✗ No admin user found. Cannot recover files.")
        return
    
    admin_id = admin["_id"]
    recovered = {"papers": 0, "notes": 0, "syllabus": 0}
    
    # Recover papers
    papers_dir = Path(f"{UPLOAD_DIR}/papers")
    if papers_dir.exists():
        for file_path in papers_dir.glob("*.pdf"):
            file_str = str(file_path)
            
            # Check if already in database
            existing = db.papers.find_one({"file_path": file_str})
            if existing:
                continue
            
            # Extract title from filename (remove UUID prefix)
            filename = file_path.name
            title = re.sub(r'^[a-f0-9\-]+-', '', filename).replace('.pdf', '').replace('_', ' ').title()
            
            # Create database entry
            paper_doc = {
                "_id": str(uuid.uuid4()),
                "title": title,
                "branch": "Computer Science",  # Default
                "description": "Recovered file from uploads",
                "tags": ["recovered"],
                "file_path": file_str,
                "uploaded_by": admin_id,
                "created_at": datetime.fromtimestamp(file_path.stat().st_mtime)
            }
            
            db.papers.insert_one(paper_doc)
            recovered["papers"] += 1
            print(f"✓ Recovered paper: {title}")
    
    # Recover notes
    notes_dir = Path(f"{UPLOAD_DIR}/notes")
    if notes_dir.exists():
        for file_path in notes_dir.glob("*.pdf"):
            file_str = str(file_path)
            
            existing = db.notes.find_one({"file_path": file_str})
            if existing:
                continue
            
            filename = file_path.name
            title = re.sub(r'^[a-f0-9\-]+-', '', filename).replace('.pdf', '').replace('_', ' ').title()
            
            note_doc = {
                "_id": str(uuid.uuid4()),
                "title": title,
                "branch": "Computer Science",
                "description": "Recovered file from uploads",
                "tags": ["recovered"],
                "file_path": file_str,
                "uploaded_by": admin_id,
                "created_at": datetime.fromtimestamp(file_path.stat().st_mtime)
            }
            
            db.notes.insert_one(note_doc)
            recovered["notes"] += 1
            print(f"✓ Recovered note: {title}")
    
    # Recover syllabus
    syllabus_dir = Path(f"{UPLOAD_DIR}/syllabus")
    if syllabus_dir.exists():
        for file_path in syllabus_dir.glob("*.pdf"):
            file_str = str(file_path)
            
            existing = db.syllabus.find_one({"file_path": file_str})
            if existing:
                continue
            
            filename = file_path.name
            title = re.sub(r'^[a-f0-9\-]+-', '', filename).replace('.pdf', '').replace('_', ' ').title()
            
            syllabus_doc = {
                "_id": str(uuid.uuid4()),
                "title": title,
                "branch": "Computer Science",
                "year": "2024",
                "description": "Recovered file from uploads",
                "tags": ["recovered"],
                "file_path": file_str,
                "uploaded_by": admin_id,
                "created_at": datetime.fromtimestamp(file_path.stat().st_mtime)
            }
            
            db.syllabus.insert_one(syllabus_doc)
            recovered["syllabus"] += 1
            print(f"✓ Recovered syllabus: {title}")
    
    print(f"\n📊 Recovery Summary:")
    print(f"   Papers: {recovered['papers']}")
    print(f"   Notes: {recovered['notes']}")
    print(f"   Syllabus: {recovered['syllabus']}")
    print(f"   Total: {sum(recovered.values())} files recovered")

if __name__ == "__main__":
    print("🔄 Starting file recovery...")
    recover_files()
    print("✅ Recovery complete!")
