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
class SyllabusCreate(BaseModel):
    branch: str
    semester: str
    year: str
    file_url: Optional[str] = None


class SyllabusUpdate(BaseModel):
    branch: Optional[str] = None
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

# ---------------- GET All Syllabus ----------------
@router.get("/")
async def get_all_syllabus():
    """Fetch all syllabus from the database"""
    try:
        syllabus = list(db.syllabus.find({}))
        # Convert _id to id for consistency
        for syl in syllabus:
            if "_id" in syl:
                syl["id"] = syl["_id"]
                del syl["_id"]
        return {"success": True, "syllabus": syllabus, "count": len(syllabus)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching syllabus: {str(e)}")


# ---------------- POST Add New Syllabus ----------------
@router.post("/")
async def add_syllabus(syllabus: SyllabusCreate, request: Request):
    """Add a new syllabus (Admin only)"""
    verify_admin(request)
    
    try:
        syllabus_id = str(uuid.uuid4())
        syllabus_data = {
            "_id": syllabus_id,
            "branch": syllabus.branch,
            "semester": syllabus.semester,
            "year": syllabus.year,
            "file_url": syllabus.file_url,
            "uploaded_by": request.headers.get("Authorization", "").split(" ")[1] if "Authorization" in request.headers else None,
            "created_at": datetime.utcnow(),
        }
        
        db.syllabus.insert_one(syllabus_data)
        
        # Return with id instead of _id
        syllabus_data["id"] = syllabus_data["_id"]
        del syllabus_data["_id"]
        
        return {
            "success": True,
            "message": "Syllabus added successfully",
            "syllabus": syllabus_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding syllabus: {str(e)}")


# ---------------- PUT Update Syllabus ----------------
@router.put("/{syllabus_id}")
async def update_syllabus(syllabus_id: str, syllabus: SyllabusUpdate, request: Request):
    """Update an existing syllabus by ID (Admin only)"""
    verify_admin(request)
    
    try:
        # Check if syllabus exists
        existing_syllabus = db.syllabus.find_one({"_id": syllabus_id})
        if not existing_syllabus:
            raise HTTPException(status_code=404, detail="Syllabus not found")
        
        # Build update data (only include provided fields)
        update_data = {k: v for k, v in syllabus.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the syllabus
        result = db.syllabus.update_one({"_id": syllabus_id}, {"$set": update_data})
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Syllabus not found")
        
        # Fetch updated syllabus
        updated_syllabus = db.syllabus.find_one({"_id": syllabus_id})
        if updated_syllabus:
            updated_syllabus["id"] = updated_syllabus["_id"]
            del updated_syllabus["_id"]
        
        return {
            "success": True,
            "message": "Syllabus updated successfully",
            "syllabus": updated_syllabus
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating syllabus: {str(e)}")


# ---------------- DELETE Syllabus ----------------
@router.delete("/{syllabus_id}")
async def delete_syllabus(syllabus_id: str, request: Request):
    """Delete a syllabus by ID (Admin only)"""
    verify_admin(request)
    
    try:
        # Check if syllabus exists
        syllabus = db.syllabus.find_one({"_id": syllabus_id})
        if not syllabus:
            raise HTTPException(status_code=404, detail="Syllabus not found")
        
        # Delete from database
        result = db.syllabus.delete_one({"_id": syllabus_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Syllabus not found")
        
        return {
            "success": True,
            "message": "Syllabus deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting syllabus: {str(e)}")
