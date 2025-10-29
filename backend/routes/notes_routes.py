from fastapi import APIRouter, HTTPException, Request, Depends
from jose import jwt, JWTError
from config import db, JWT_SECRET_KEY, JWT_ALGORITHM
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import uuid

# Remove prefix - let server.py handle it via auto_include_routers
router = APIRouter()


# Pydantic Models for Request Validation
class NoteCreate(BaseModel):
    title: str
    description: str
    subject: str
    semester: str
    file_url: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    semester: Optional[str] = None
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

# ---------------- GET All Notes ----------------
@router.get("/")
async def get_all_notes():
    """Fetch all notes from the database"""
    try:
        notes = list(db.notes.find({}))
        # Convert _id to id for consistency
        for note in notes:
            if "_id" in note:
                note["id"] = note["_id"]
                del note["_id"]
        return {"success": True, "notes": notes, "count": len(notes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notes: {str(e)}")


# ---------------- POST Add New Note ----------------
@router.post("/")
async def add_note(note: NoteCreate, request: Request):
    """Add a new note (Admin only)"""
    verify_admin(request)
    
    try:
        note_id = str(uuid.uuid4())
        note_data = {
            "_id": note_id,
            "title": note.title,
            "description": note.description,
            "subject": note.subject,
            "semester": note.semester,
            "file_url": note.file_url,
            "uploaded_by": request.headers.get("Authorization", "").split(" ")[1] if "Authorization" in request.headers else None,
            "created_at": datetime.utcnow(),
        }
        
        db.notes.insert_one(note_data)
        
        # Return with id instead of _id
        note_data["id"] = note_data["_id"]
        del note_data["_id"]
        
        return {
            "success": True,
            "message": "Note added successfully",
            "note": note_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding note: {str(e)}")


# ---------------- PUT Update Note ----------------
@router.put("/{note_id}")
async def update_note(note_id: str, note: NoteUpdate, request: Request):
    """Update an existing note by ID (Admin only)"""
    verify_admin(request)
    
    try:
        # Check if note exists
        existing_note = db.notes.find_one({"_id": note_id})
        if not existing_note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Build update data (only include provided fields)
        update_data = {k: v for k, v in note.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the note
        result = db.notes.update_one({"_id": note_id}, {"$set": update_data})
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Fetch updated note
        updated_note = db.notes.find_one({"_id": note_id})
        if updated_note:
            updated_note["id"] = updated_note["_id"]
            del updated_note["_id"]
        
        return {
            "success": True,
            "message": "Note updated successfully",
            "note": updated_note
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating note: {str(e)}")


# ---------------- DELETE Note ----------------
@router.delete("/{note_id}")
async def delete_note(note_id: str, request: Request):
    """Delete a note by ID (Admin only)"""
    verify_admin(request)
    
    try:
        # Check if note exists
        note = db.notes.find_one({"_id": note_id})
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Delete from database
        result = db.notes.delete_one({"_id": note_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        
        return {
            "success": True,
            "message": "Note deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting note: {str(e)}")
