from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List, Union
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
import os
import uuid
import shutil
from pathlib import Path
import aiofiles
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI(title="Academic Resources API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")

# Create upload directory
Path(UPLOAD_DIR).mkdir(exist_ok=True)
for folder in ["papers", "notes", "syllabus"]:
    Path(f"{UPLOAD_DIR}/{folder}").mkdir(exist_ok=True)

# MongoDB setup
try:
    client = MongoClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    # Collections
    users_collection = db.users
    papers_collection = db.papers
    notes_collection = db.notes
    syllabus_collection = db.syllabus
    chat_messages_collection = db.chat_messages
    
    # Test connection
    client.admin.command('ping')
    print("MongoDB connection successful!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ResourceBase(BaseModel):
    title: str
    branch: str
    description: Optional[str] = None
    tags: List[str] = []

class PaperResponse(ResourceBase):
    id: str
    file_path: str
    uploaded_by: str
    created_at: datetime

class NoteResponse(ResourceBase):
    id: str
    file_path: str
    uploaded_by: str
    created_at: datetime

class SyllabusResponse(ResourceBase):
    id: str
    year: str
    file_path: str
    uploaded_by: str
    created_at: datetime

class Stats(BaseModel):
    total_papers: int
    total_notes: int
    total_syllabus: int
    total_users: int

class ChatMessage(BaseModel):
    message: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

# Utility Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    
    return User(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        is_admin=user.get("is_admin", False)
    )

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Save uploaded file to destination and return the path"""
    file_path = f"{destination}/{uuid.uuid4()}-{upload_file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    
    return file_path

# Auth Endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "is_admin": False,  # First user can be made admin manually in DB
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    user = User(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        is_admin=False
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@app.post("/api/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = users_collection.find_one({"email": login_data.email})
    
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        is_admin=user.get("is_admin", False)
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

# Papers Endpoints
@app.get("/api/papers", response_model=List[PaperResponse])
async def get_papers():
    papers = []
    for paper in papers_collection.find().sort("created_at", -1):
        papers.append(PaperResponse(
            id=paper["_id"],
            title=paper["title"],
            branch=paper["branch"],
            description=paper.get("description", ""),
            tags=paper.get("tags", []),
            file_path=paper["file_path"],
            uploaded_by=paper["uploaded_by"],
            created_at=paper["created_at"]
        ))
    return papers

@app.post("/api/papers")
async def create_paper(
    title: str = Form(...),
    branch: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Save file
    file_path = await save_upload_file(file, f"{UPLOAD_DIR}/papers")
    
    # Parse tags
    tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
    
    # Create paper document
    paper_id = str(uuid.uuid4())
    paper_doc = {
        "_id": paper_id,
        "title": title,
        "branch": branch,
        "description": description,
        "tags": tags_list,
        "file_path": file_path,
        "uploaded_by": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    papers_collection.insert_one(paper_doc)
    
    return {"message": "Paper uploaded successfully", "id": paper_id}

@app.delete("/api/papers/{paper_id}")
async def delete_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user)
):
    paper = papers_collection.find_one({"_id": paper_id})
    
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    
    # Only admin or uploader can delete
    if not current_user.is_admin and paper["uploaded_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete file
    try:
        os.remove(paper["file_path"])
    except OSError:
        pass  # File might not exist
    
    # Delete document
    papers_collection.delete_one({"_id": paper_id})
    
    return {"message": "Paper deleted successfully"}

@app.get("/api/papers/{paper_id}/download")
async def download_paper(paper_id: str):
    paper = papers_collection.find_one({"_id": paper_id})
    
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    
    if not os.path.exists(paper["file_path"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        path=paper["file_path"],
        filename=f"{paper['title']}.pdf",
        media_type="application/pdf"
    )

# Notes Endpoints
@app.get("/api/notes", response_model=List[NoteResponse])
async def get_notes():
    notes = []
    for note in notes_collection.find().sort("created_at", -1):
        notes.append(NoteResponse(
            id=note["_id"],
            title=note["title"],
            branch=note["branch"],
            description=note.get("description", ""),
            tags=note.get("tags", []),
            file_path=note["file_path"],
            uploaded_by=note["uploaded_by"],
            created_at=note["created_at"]
        ))
    return notes

@app.post("/api/notes")
async def create_note(
    title: str = Form(...),
    branch: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Save file
    file_path = await save_upload_file(file, f"{UPLOAD_DIR}/notes")
    
    # Parse tags
    tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
    
    # Create note document
    note_id = str(uuid.uuid4())
    note_doc = {
        "_id": note_id,
        "title": title,
        "branch": branch,
        "description": description,
        "tags": tags_list,
        "file_path": file_path,
        "uploaded_by": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    notes_collection.insert_one(note_doc)
    
    return {"message": "Notes uploaded successfully", "id": note_id}

@app.delete("/api/notes/{note_id}")
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user)
):
    note = notes_collection.find_one({"_id": note_id})
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Only admin or uploader can delete
    if not current_user.is_admin and note["uploaded_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete file
    try:
        os.remove(note["file_path"])
    except OSError:
        pass  # File might not exist
    
    # Delete document
    notes_collection.delete_one({"_id": note_id})
    
    return {"message": "Note deleted successfully"}

@app.get("/api/notes/{note_id}/download")
async def download_note(note_id: str):
    note = notes_collection.find_one({"_id": note_id})
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if not os.path.exists(note["file_path"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        path=note["file_path"],
        filename=f"{note['title']}.pdf",
        media_type="application/pdf"
    )

# Syllabus Endpoints
@app.get("/api/syllabus", response_model=List[SyllabusResponse])
async def get_syllabus():
    syllabus_list = []
    for syllabus in syllabus_collection.find().sort("created_at", -1):
        syllabus_list.append(SyllabusResponse(
            id=syllabus["_id"],
            title=syllabus["title"],
            branch=syllabus["branch"],
            year=syllabus["year"],
            description=syllabus.get("description", ""),
            tags=syllabus.get("tags", []),
            file_path=syllabus["file_path"],
            uploaded_by=syllabus["uploaded_by"],
            created_at=syllabus["created_at"]
        ))
    return syllabus_list

@app.post("/api/syllabus")
async def create_syllabus(
    title: str = Form(...),
    branch: str = Form(...),
    year: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Save file
    file_path = await save_upload_file(file, f"{UPLOAD_DIR}/syllabus")
    
    # Parse tags
    tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
    
    # Create syllabus document
    syllabus_id = str(uuid.uuid4())
    syllabus_doc = {
        "_id": syllabus_id,
        "title": title,
        "branch": branch,
        "year": year,
        "description": description,
        "tags": tags_list,
        "file_path": file_path,
        "uploaded_by": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    syllabus_collection.insert_one(syllabus_doc)
    
    return {"message": "Syllabus uploaded successfully", "id": syllabus_id}

@app.delete("/api/syllabus/{syllabus_id}")
async def delete_syllabus(
    syllabus_id: str,
    current_user: User = Depends(get_current_user)
):
    syllabus = syllabus_collection.find_one({"_id": syllabus_id})
    
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Syllabus not found"
        )
    
    # Only admin or uploader can delete
    if not current_user.is_admin and syllabus["uploaded_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete file
    try:
        os.remove(syllabus["file_path"])
    except OSError:
        pass  # File might not exist
    
    # Delete document
    syllabus_collection.delete_one({"_id": syllabus_id})
    
    return {"message": "Syllabus deleted successfully"}

@app.get("/api/syllabus/{syllabus_id}/download")
async def download_syllabus(syllabus_id: str):
    syllabus = syllabus_collection.find_one({"_id": syllabus_id})
    
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Syllabus not found"
        )
    
    if not os.path.exists(syllabus["file_path"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        path=syllabus["file_path"],
        filename=f"{syllabus['title']}.pdf",
        media_type="application/pdf"
    )

# Stats Endpoint
@app.get("/api/stats", response_model=Stats)
async def get_stats():
    total_papers = papers_collection.count_documents({})
    total_notes = notes_collection.count_documents({})
    total_syllabus = syllabus_collection.count_documents({})
    total_users = users_collection.count_documents({})
    
    return Stats(
        total_papers=total_papers,
        total_notes=total_notes,
        total_syllabus=total_syllabus,
        total_users=total_users
    )

# AI Chat Endpoint
@app.post("/api/ai/chat", response_model=ChatResponse)
async def ai_chat(
    chat_request: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """
    AI Assistant for student queries about engineering topics
    """
    try:
        # Create session ID for this chat
        session_id = chat_request.sessionId or f"user_{current_user.id}_{uuid.uuid4().hex[:8]}"
        
        # System message for educational AI assistant
        system_message = """You are an AI study assistant for engineering students. You specialize in helping with:

1. Computer Science & IT topics (programming, algorithms, data structures, databases, etc.)
2. Electronics & Communication (circuits, signals, digital electronics, etc.)  
3. Mechanical Engineering (thermodynamics, mechanics, materials science, etc.)
4. Civil Engineering (structures, materials, surveying, etc.)
5. General engineering mathematics, physics, and problem-solving

Your role is to:
- Explain concepts clearly with examples
- Help solve engineering problems step-by-step
- Provide study guidance and tips
- Answer doubts about course topics
- Suggest resources for further learning

Keep responses helpful, educational, and encouraging. If asked about non-engineering topics, politely redirect to engineering subjects."""

        # Initialize LLM chat with GPT-4o-mini (good for educational queries)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=chat_request.message)
        
        # Get AI response
        ai_response = await chat.send_message(user_message)
        
        # Store chat message in database for history
        message_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "session_id": session_id,
            "user_message": chat_request.message,
            "ai_response": ai_response,
            "timestamp": datetime.utcnow()
        }
        
        chat_messages_collection.insert_one(message_doc)
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        print(f"AI Chat Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get AI response. Please try again."
        )

# Health Check
@app.get("/")
async def root():
    return {"message": "Academic Resources API is running"}

@app.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)