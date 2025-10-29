from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from jose import jwt, JWTError
from config import db, JWT_SECRET_KEY, JWT_ALGORITHM
from datetime import datetime
from bson import ObjectId
import uuid
import os

router = APIRouter(prefix="/api/papers", tags=["Papers"])

UPLOAD_DIR = "uploads/papers"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_current_user(token: str = Form(...)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user = db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def is_admin_user(user: dict):
    return bool(user.get("is_admin", False) or user.get("role") == "admin")


# ---------------- Upload Paper ----------------
@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form(...),
    semester: str = Form(...),
    token: str = Form(...)
):
    user = get_current_user(token)
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admins only")

    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    paper_data = {
        "_id": str(ObjectId()),
        "title": title,
        "subject": subject,
        "semester": semester,
        "file_url": f"/{filepath}",
        "uploaded_by": user["email"],
        "uploaded_at": datetime.utcnow(),
    }
    db.papers.insert_one(paper_data)

    return {"message": "Paper uploaded successfully", "paper": paper_data}


# ---------------- Get All Papers ----------------
@router.get("/")
async def get_all_papers():
    papers = list(db.papers.find({}, {"_id": 0}))
    return {"papers": papers}


# ---------------- Delete Paper ----------------
@router.delete("/{paper_id}")
async def delete_paper(paper_id: str, token: str = Form(...)):
    user = get_current_user(token)
    if not is_admin_user(user):
        raise HTTPException(status_code=403, detail="Admins only")

    paper = db.papers.find_one({"_id": paper_id})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    file_path = paper.get("file_url", "").lstrip("/")
    if os.path.exists(file_path):
        os.remove(file_path)

    db.papers.delete_one({"_id": paper_id})
    return {"message": "Paper deleted successfully"}
