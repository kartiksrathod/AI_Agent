from fastapi import APIRouter, Depends, HTTPException, status, Body
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from config import SECRET_KEY, ALGORITHM
from database import db


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ----------------------------
# Helper - Get Current User
# ----------------------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token or expired")

# ----------------------------
# Admin Dashboard
# ----------------------------
@router.get("/dashboard")
async def admin_dashboard(current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")

    total_users = db.users.count_documents({})
    total_admins = db.users.count_documents({"role": "admin"})
    total_students = db.users.count_documents({"role": "student"})
    return {
        "message": f"Welcome Admin {current_user['name']}",
        "stats": {
            "total_users": total_users,
            "total_admins": total_admins,
            "total_students": total_students
        }
    }

# ----------------------------
# Admin - Add Notes
# ----------------------------
@router.post("/notes")
async def add_notes(
    current_user=Depends(get_current_user),
    data: dict = Body(...)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    if not data.get("title") or not data.get("content"):
        raise HTTPException(status_code=400, detail="Missing title or content")

    note = {
        "title": data["title"],
        "content": data["content"],
        "created_by": current_user["email"]
    }
    db.notes.insert_one(note)
    return {"message": "Note added successfully", "note": note}

# ----------------------------
# Admin - Add Syllabus
# ----------------------------
@router.post("/syllabus")
async def add_syllabus(
    current_user=Depends(get_current_user),
    data: dict = Body(...)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    if not data.get("course") or not data.get("semester") or not data.get("topics"):
        raise HTTPException(status_code=400, detail="Missing syllabus details")

    syllabus = {
        "course": data["course"],
        "semester": data["semester"],
        "topics": data["topics"],
        "created_by": current_user["email"]
    }
    db.syllabus.insert_one(syllabus)
    return {"message": "Syllabus added successfully", "syllabus": syllabus}
