from fastapi import APIRouter, HTTPException, Request, Depends
from jose import jwt, JWTError
from bson import ObjectId
from config import db, JWT_SECRET_KEY, JWT_ALGORITHM

router = APIRouter(prefix="/api/notes", tags=["Notes"])

# ---------------- Admin Verification ----------------
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

# ---------------- Get Notes ----------------
@router.get("/")
async def get_notes():
    notes = list(db.notes.find({}, {"_id": 0}))
    return {"notes": notes}

# ---------------- Add Notes ----------------
@router.post("/", dependencies=[Depends(verify_admin)])
async def add_note(note: dict):
    db.notes.insert_one(note)
    return {"message": "Note added successfully"}

# ---------------- Update Notes ----------------
@router.put("/{note_id}", dependencies=[Depends(verify_admin)])
async def update_note(note_id: str, note: dict):
    result = db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": note})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note updated successfully"}

# ---------------- Delete Notes ----------------
@router.delete("/{note_id}", dependencies=[Depends(verify_admin)])
async def delete_note(note_id: str):
    result = db.notes.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}
