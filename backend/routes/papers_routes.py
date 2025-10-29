from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from jose import jwt, JWTError
from config import db, JWT_SECRET_KEY, JWT_ALGORITHM
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import uuid
import os

# Remove prefix - let server.py handle it via auto_include_routers
router = APIRouter()

UPLOAD_DIR = "uploads/papers"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Pydantic Models for Request Validation
class PaperCreate(BaseModel):
    title: str
    subject: str
    semester: str
    year: Optional[str] = None
    file_url: Optional[str] = None


class PaperUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[str] = None
    file_url: Optional[str] = None


# Admin Verification via Authorization Header
def verify_admin(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing or invalid")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Only admin can perform this action")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ============================================================
# CRUD Operations
# ============================================================

# ---------------- GET All Papers ----------------
@router.get("/")
async def get_all_papers():
    """Fetch all papers from the database"""
    try:
        papers = list(db.papers.find({}))
        # Convert _id to id for consistency
        for paper in papers:
            if "_id" in paper:
                paper["id"] = paper["_id"]
                del paper["_id"]
        return {"success": True, "papers": papers, "count": len(papers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching papers: {str(e)}")


# ---------------- POST Add New Paper ----------------
@router.post("/")
async def add_paper(paper: PaperCreate, request: Request):
    """Add a new paper (Admin only)"""
    verify_admin(request)
    
    try:
        paper_id = str(uuid.uuid4())
        paper_data = {
            "_id": paper_id,
            "title": paper.title,
            "subject": paper.subject,
            "semester": paper.semester,
            "year": paper.year,
            "file_url": paper.file_url,
            "uploaded_by": request.headers.get("Authorization", "").split(" ")[1] if "Authorization" in request.headers else None,
            "created_at": datetime.utcnow(),
        }
        
        db.papers.insert_one(paper_data)
        
        # Return with id instead of _id
        paper_data["id"] = paper_data["_id"]
        del paper_data["_id"]
        
        return {
            "success": True,
            "message": "Paper added successfully",
            "paper": paper_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding paper: {str(e)}")


# ---------------- PUT Update Paper ----------------
@router.put("/{paper_id}")
async def update_paper(paper_id: str, paper: PaperUpdate, request: Request):
    """Update an existing paper by ID (Admin only)"""
    verify_admin(request)
    
    try:
        # Check if paper exists
        existing_paper = db.papers.find_one({"_id": paper_id})
        if not existing_paper:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        # Build update data (only include provided fields)
        update_data = {k: v for k, v in paper.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the paper
        result = db.papers.update_one({"_id": paper_id}, {"$set": update_data})
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        # Fetch updated paper
        updated_paper = db.papers.find_one({"_id": paper_id})
        if updated_paper:
            updated_paper["id"] = updated_paper["_id"]
            del updated_paper["_id"]
        
        return {
            "success": True,
            "message": "Paper updated successfully",
            "paper": updated_paper
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating paper: {str(e)}")


# ---------------- DELETE Paper ----------------
@router.delete("/{paper_id}")
async def delete_paper(paper_id: str, request: Request):
    """Delete a paper by ID (Admin only)"""
    verify_admin(request)
    
    try:
        # Check if paper exists
        paper = db.papers.find_one({"_id": paper_id})
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        # Delete associated file if exists
        file_path = paper.get("file_url", "").lstrip("/")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not delete file {file_path}: {e}")
        
        # Delete from database
        result = db.papers.delete_one({"_id": paper_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        return {
            "success": True,
            "message": "Paper deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting paper: {str(e)}")


# ============================================================
# File Upload Endpoint (Optional - for file-based uploads)
# ============================================================
@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form(...),
    semester: str = Form(...),
    year: str = Form(None),
    token: str = Form(...)
):
    """Upload a paper with file (Admin only)"""
    # Verify admin via token
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Only admin can upload papers")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    try:
        # Save file
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(await file.read())
        
        # Create paper record
        paper_id = str(uuid.uuid4())
        paper_data = {
            "_id": paper_id,
            "title": title,
            "subject": subject,
            "semester": semester,
            "year": year,
            "file_url": f"/{filepath}",
            "uploaded_by": payload.get("sub"),
            "created_at": datetime.utcnow(),
        }
        
        db.papers.insert_one(paper_data)
        
        # Return with id instead of _id
        paper_data["id"] = paper_data["_id"]
        del paper_data["_id"]
        
        return {
            "success": True,
            "message": "Paper uploaded successfully",
            "paper": paper_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading paper: {str(e)}")
