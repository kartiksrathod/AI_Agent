from fastapi import APIRouter, HTTPException, Request, Depends
from jose import jwt, JWTError
from bson import ObjectId
from config import db, JWT_SECRET_KEY, JWT_ALGORITHM

router = APIRouter(prefix="/api/syllabus", tags=["Syllabus"])

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

# ---------------- Get Syllabus ----------------
@router.get("/")
async def get_syllabus():
    syllabus = list(db.syllabus.find({}, {"_id": 0}))
    return {"syllabus": syllabus}

# ---------------- Add Syllabus ----------------
@router.post("/", dependencies=[Depends(verify_admin)])
async def add_syllabus(syllabus: dict):
    db.syllabus.insert_one(syllabus)
    return {"message": "Syllabus added successfully"}

# ---------------- Update Syllabus ----------------
@router.put("/{syllabus_id}", dependencies=[Depends(verify_admin)])
async def update_syllabus(syllabus_id: str, syllabus: dict):
    result = db.syllabus.update_one({"_id": ObjectId(syllabus_id)}, {"$set": syllabus})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Syllabus not found")
    return {"message": "Syllabus updated successfully"}

# ---------------- Delete Syllabus ----------------
@router.delete("/{syllabus_id}", dependencies=[Depends(verify_admin)])
async def delete_syllabus(syllabus_id: str):
    result = db.syllabus.delete_one({"_id": ObjectId(syllabus_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Syllabus not found")
    return {"message": "Syllabus deleted successfully"}
