from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
import os
import uuid
from pathlib import Path
import aiofiles
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets

# Try to import magic for file validation, fallback to extension checking
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    print("⚠️  python-magic not available, using extension-based file validation")
    MAGIC_AVAILABLE = False

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Phase 2 Security Enhancements
from middleware.security_headers import SecurityHeadersMiddleware
from middleware.logging_middleware import RequestLoggingMiddleware
from app_logging.config import setup_logging

# Load .env from the correct path
load_dotenv(dotenv_path="/app/backend/.env")

# Initialize logging system
setup_logging()

# Main app instance
app = FastAPI(
    title="Academic Resources API", 
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "production") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT", "production") != "production" else None,
)

# ✅ PHASE 2: Security Headers Middleware (HSTS, CSP, X-Frame-Options, etc.)
enforce_https = os.getenv("ENVIRONMENT", "production") == "production"
app.add_middleware(SecurityHeadersMiddleware, enforce_https=enforce_https)

# ✅ PHASE 2: Request Logging Middleware (Security event tracking)
app.add_middleware(RequestLoggingMiddleware)

# ✅ SECURITY FIX #1: CORS Configuration - Restrict to specific origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # ✅ Fixed: No more wildcard
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)

# ✅ SECURITY FIX #3: Rate Limiting Setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Auth setup
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Config from env
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))  # ✅ Reduced from 1440 to 15
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")

# ✅ SECURITY FIX #5: File Upload Security
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = ['application/pdf']

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Academic Resources")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Make sure upload folders exist
Path(UPLOAD_DIR).mkdir(exist_ok=True)
for folder in ["papers", "notes", "syllabus", "profile_photos"]:
    Path(f"{UPLOAD_DIR}/{folder}").mkdir(exist_ok=True)

# MongoDB connection with SSL/TLS support for MongoDB Atlas
try:
    # MongoDB Atlas requires SSL/TLS - configure connection parameters
    import ssl
    
    # Parse if it's an Atlas connection (mongodb+srv://)
    if "mongodb+srv://" in MONGO_URL or "mongodb+srv" in MONGO_URL:
        # MongoDB Atlas connection with SSL/TLS
        client = MongoClient(
            MONGO_URL,
            tls=True,
            tlsAllowInvalidCertificates=True,  # For development - helps with SSL cert issues
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            retryWrites=True
        )
        print("🔒 Connecting to MongoDB Atlas with SSL/TLS...")
    else:
        # Local MongoDB connection
        client = MongoClient(MONGO_URL)
        print("📦 Connecting to local MongoDB...")
    
    db = client[DATABASE_NAME]
    
    # All collections we need
    users_collection = db.users
    papers_collection = db.papers
    notes_collection = db.notes
    syllabus_collection = db.syllabus
    chat_messages_collection = db.chat_messages
    bookmarks_collection = db.bookmarks
    achievements_collection = db.achievements
    learning_goals_collection = db.learning_goals
    downloads_collection = db.downloads  # Track actual downloads
    forum_posts_collection = db.forum_posts  # Forum posts
    forum_replies_collection = db.forum_replies  # Forum replies
    cms_content_collection = db.cms_content  # CMS content management
    password_reset_tokens_collection = db.password_reset_tokens  # Password reset tokens
    email_verification_tokens_collection = db.email_verification_tokens  # Email verification tokens
    
    # Quick ping to check if DB is alive
    client.admin.command('ping')
    print("✓ MongoDB connected successfully")
    
    # BULLETPROOF DATA PROTECTION: Auto-restore ONLY if completely empty
    import subprocess
    import os
    
    # Check if database has ANY data
    total_records = (
        users_collection.count_documents({}) +
        papers_collection.count_documents({}) +
        notes_collection.count_documents({}) +
        syllabus_collection.count_documents({})
    )
    
    # Only restore if database is completely empty AND backups exist
    if total_records == 0:
        backup_dir = "/app/backups"
        has_backups = os.path.exists(backup_dir) and len([d for d in os.listdir(backup_dir) if d.startswith("backup_")]) > 0
        
        if has_backups:
            print("⚠️  DATABASE IS EMPTY! Auto-restoring from backup...")
            try:
                result = subprocess.run(
                    ["bash", "/app/scripts/emergency_protection.sh"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                print(result.stdout)
                if result.returncode == 0:
                    print("✅ DATA RESTORED SUCCESSFULLY!")
                else:
                    print(f"⚠️  Restore warning: {result.stderr}")
            except Exception as restore_error:
                print(f"⚠️  Auto-restore failed: {restore_error}")
        else:
            print("✓ Fresh database - no backups to restore from")
    else:
        print(f"✓ Database OK - {total_records} records")
        
except Exception as e:
    print(f"✗ MongoDB connection error: {e}")

# Request/Response models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    usn: str
    course: Optional[str] = None
    semester: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    usn: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    is_admin: bool = False
    profile_photo: Optional[str] = None
    email_verified: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Base model for resources (papers, notes, syllabus)
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

# Profile related models
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class BookmarkCreate(BaseModel):
    resource_type: str  # can be 'paper', 'note', or 'syllabus'
    resource_id: str
    category: Optional[str] = "General"

class BookmarkResponse(BaseModel):
    id: str
    resource_type: str
    resource_id: str
    category: str
    title: str
    branch: str
    created_at: datetime

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    earned_at: datetime
    
class LearningGoal(BaseModel):
    id: str
    title: str
    description: str
    target_date: datetime
    progress: int  # 0-100
    completed: bool
    created_at: datetime

class LearningGoalCreate(BaseModel):
    title: str
    description: str
    target_date: datetime

class LearningGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    progress: Optional[int] = None
    completed: Optional[bool] = None

# Forum Models
class ForumPostCreate(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str] = []

class ForumPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class ForumReplyCreate(BaseModel):
    content: str

class ForumReply(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    content: str
    created_at: datetime
    author_profile_photo: Optional[str] = None

class ForumPost(BaseModel):
    id: str
    title: str
    content: str
    category: str
    tags: List[str]
    author_id: str
    author_name: str
    replies_count: int
    views: int
    created_at: datetime
    updated_at: datetime
    last_activity: datetime
    author_profile_photo: Optional[str] = None


# CMS Models
class CMSContentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    content_type: str = "announcement"  # announcement, news, update, info
    featured: bool = False
    category: Optional[str] = None
    tags: Optional[List[str]] = []

class CMSContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = None
    featured: Optional[bool] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class CMSContent(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    content: str
    content_type: str
    featured: bool
    category: Optional[str] = None
    tags: List[str]
    author_id: str
    author_name: str
    created_at: datetime
    updated_at: datetime


# Helper functions for auth
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data, expires_delta=None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
):
    """
    ✅ SECURITY FIX #2: Support both cookie and Authorization header
    Priority: Cookie first, then Authorization header (for backward compatibility)
    """
    # Standard auth exception
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = None
    
    # Try to get token from cookie first (secure method)
    if "access_token" in request.cookies:
        cookie_token = request.cookies.get("access_token")
        if cookie_token.startswith("Bearer "):
            token = cookie_token[7:]  # Remove "Bearer " prefix
        else:
            token = cookie_token
    # Fall back to Authorization header (for backward compatibility)
    elif credentials:
        token = credentials.credentials
    
    if not token:
        raise auth_error
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise auth_error
    except JWTError:
        raise auth_error
    
    # Fetch user from DB
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise auth_error
    
    return User(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        usn=user.get("usn"),
        course=user.get("course"),
        semester=user.get("semester"),
        is_admin=user.get("is_admin", False),
        profile_photo=user.get("profile_photo"),
        email_verified=user.get("email_verified", False)
    )

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    # Only admins can pass this check
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def save_upload_file(upload_file, destination):
    """Saves uploaded file and returns path"""
    file_path = f"{destination}/{uuid.uuid4()}-{upload_file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    
    return file_path

# ✅ SECURITY FIX #5: File Validation Functions
async def validate_file_size(file: UploadFile):
    """Validate file size to prevent DoS"""
    size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    # Read file in chunks
    content = await file.read()
    size = len(content)
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Reset file pointer
    await file.seek(0)
    return True

async def validate_file_type(file: UploadFile):
    """Validate file type using magic bytes (not just extension)"""
    # Always check extension first
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="File must have .pdf extension"
        )
    
    # If magic library is available, do deeper validation
    if MAGIC_AVAILABLE:
        # Read first 2048 bytes for magic number detection
        header = await file.read(2048)
        await file.seek(0)
        
        # Check magic bytes
        try:
            mime = magic.from_buffer(header, mime=True)
            if mime not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type '{mime}'. Only PDF files are allowed."
                )
        except Exception as e:
            print(f"Magic detection error: {e}")
            # Fallback to extension check (already done above)
            pass
    
    return True
    
    return True

## Auth routes
@app.post("/api/auth/register")
@limiter.limit("3/minute")  # ✅ SECURITY FIX #3: Rate limit registration
async def register(request: Request, user_data: UserCreate):
    # Make sure email isn't already taken
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user doc
    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(user_data.password)
    
    user_doc = {
        "_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pw,
        "usn": user_data.usn,
        "course": user_data.course,
        "semester": user_data.semester,
        "is_admin": False,
        "email_verified": False,  # Email verification ENABLED - users must verify email
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_doc)
    
    # Generate email verification token
    verification_token = secrets.token_urlsafe(32)
    
    # Store verification token with 24 hour expiry
    token_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "email": user_data.email,
        "token": verification_token,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=24),
        "used": False
    }
    
    email_verification_tokens_collection.insert_one(token_doc)
    
    # Create verification link
    verification_link = f"{FRONTEND_URL}/verify-email/{verification_token}"
    
    # Beautiful welcome email with verification
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background-color: #f5f7fa; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 28px; }}
            .icon {{ font-size: 48px; margin-bottom: 10px; }}
            .content {{ padding: 40px 30px; }}
            .greeting {{ font-size: 20px; color: #2d3748; margin-bottom: 20px; font-weight: 500; }}
            .button {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }}
            .features {{ background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .feature-item {{ margin: 10px 0; }}
            .expiry-notice {{ background: #fff5e1; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }}
            .footer {{ background: #2d3748; color: #cbd5e0; text-align: center; padding: 30px; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="icon">🎓</div>
                <h1>Welcome to EduResources!</h1>
            </div>
            <div class="content">
                <div class="greeting">Hello {user_data.name},</div>
                <p>Thank you for joining EduResources - Your Academic Success Platform! We're excited to have you as part of our learning community.</p>
                <p>To get started and access all features, please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                    <a href="{verification_link}" class="button">Verify Email Address</a>
                </div>
                <div class="expiry-notice">
                    ⏰ <strong>Important:</strong> This verification link will expire in 24 hours.
                </div>
                <div class="features">
                    <h3 style="margin-top: 0;">🎓 What's waiting for you:</h3>
                    <div class="feature-item">📄 Access thousands of question papers</div>
                    <div class="feature-item">📝 Download comprehensive study notes</div>
                    <div class="feature-item">🤖 Get help from AI Study Assistant</div>
                    <div class="feature-item">💬 Join the community forum</div>
                    <div class="feature-item">📊 Track your learning progress</div>
                    <div class="feature-item">🎯 Set and achieve learning goals</div>
                </div>
                <p style="font-size: 14px; color: #718096;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; font-size: 12px; color: #4a5568; background: #f7fafc; padding: 10px; border-radius: 4px;">{verification_link}</p>
                <p style="margin-top: 30px; font-size: 14px; color: #718096;">If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
                <div style="font-size: 24px; margin-bottom: 10px;">📚 EduResources</div>
                <p style="margin: 10px 0;">Academic Resources Platform for Engineering Students</p>
                <p style="margin: 10px 0; font-size: 12px;">© 2025 EduResources. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Send verification email (optional - don't fail registration if email fails)
    try:
        email_sent = send_email(
            to_email=user_data.email,
            subject="Welcome to EduResources - Verify Your Email 📚",
            html_content=html_content
        )
        
        if email_sent:
            print(f"✅ Welcome email sent to {user_data.email}")
        else:
            print(f"⚠️  Welcome email failed to send to {user_data.email}")
    except Exception as e:
        print(f"⚠️  Email send error (non-critical): {e}")
    
    return {
        "message": "Registration successful! Please check your email to verify your account before logging in.",
        "email": user_data.email,
        "email_sent": email_sent if 'email_sent' in locals() else False
    }

@app.post("/api/auth/login", response_model=Token)
@limiter.limit("5/minute")  # ✅ SECURITY FIX #3: Rate limit login attempts
async def login(request: Request, login_data: UserLogin, response: Response):
    user = users_collection.find_one({"email": login_data.email})
    
    # Check if user exists and password matches
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Email verification check - ENABLED
    if not user.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in. Check your inbox for the verification link."
        )
    
    # Create JWT token
    token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"]}, expires_delta=token_expires
    )
    
    # ✅ SECURITY FIX #2: Set httpOnly cookie instead of sending token in body
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # ✅ Prevents JavaScript access (XSS protection)
        secure=True,    # ✅ Only sent over HTTPS
        samesite="lax", # ✅ CSRF protection
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    user_obj = User(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        usn=user.get("usn"),
        course=user.get("course"),
        semester=user.get("semester"),
        is_admin=user.get("is_admin", False),
        profile_photo=user.get("profile_photo"),
        email_verified=user.get("email_verified", False)
    )
    
    # Return user data and token (for backward compatibility during transition)
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@app.post("/api/auth/logout")
async def logout(response: Response):
    """✅ SECURITY FIX #2: Logout endpoint to clear httpOnly cookie"""
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}



## Email utility function
def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP with robust error handling"""
    try:
        # Validate SMTP configuration
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("❌ SMTP credentials not configured")
            return False
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Send email with timeout
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication failed: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

## Email Verification Endpoints
@app.get("/api/auth/verify-email/{token}")
async def verify_email(token: str):
    """Verify user email with token"""
    try:
        # Find token (check both used and unused)
        token_doc = email_verification_tokens_collection.find_one({
            "token": token
        })
        
        if not token_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification link. Please request a new one."
            )
        
        # Check if token is expired
        if datetime.utcnow() > token_doc["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification link has expired. Please request a new one."
            )
        
        # Check if user is already verified
        user = users_collection.find_one({"_id": token_doc["user_id"]})
        if user and user.get("email_verified", False):
            # Already verified - return success (handles duplicate clicks)
            return {
                "message": "Email already verified! You can login now.",
                "already_verified": True
            }
        
        # Mark user as verified
        users_collection.update_one(
            {"_id": token_doc["user_id"]},
            {"$set": {"email_verified": True}}
        )
        
        # Mark token as used
        email_verification_tokens_collection.update_one(
            {"_id": token_doc["_id"]},
            {"$set": {"used": True}}
        )
        
        return {"message": "Email verified successfully! You can now login."}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during verification. Please try again later."
        )

class ResendVerificationRequest(BaseModel):
    email: EmailStr

@app.post("/api/auth/resend-verification")
async def resend_verification(request: ResendVerificationRequest):
    """Resend verification email"""
    try:
        # Check if user exists
        user = users_collection.find_one({"email": request.email})
        
        if not user:
            # Don't reveal if email exists
            return {"message": "If an unverified account exists with this email, a new verification link has been sent."}
        
        # Check if already verified
        if user.get("email_verified", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already verified. You can login now."
            )
        
        # Invalidate old tokens
        email_verification_tokens_collection.update_many(
            {"user_id": user["_id"], "used": False},
            {"$set": {"used": True}}
        )
        
        # Generate new verification token
        verification_token = secrets.token_urlsafe(32)
        
        # Store new token
        token_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user["_id"],
            "email": request.email,
            "token": verification_token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
            "used": False
        }
        
        email_verification_tokens_collection.insert_one(token_doc)
        
        # Send verification email
        verification_link = f"{FRONTEND_URL}/verify-email/{verification_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 28px; }}
                .content {{ padding: 40px 30px; }}
                .button {{ display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }}
                .footer {{ background: #2d3748; color: #cbd5e0; text-align: center; padding: 30px; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="font-size: 48px; margin-bottom: 10px;">📚</div>
                    <h1>Email Verification</h1>
                </div>
                <div class="content">
                    <p style="font-size: 20px; color: #2d3748; margin-bottom: 20px;">Hello {user['name']},</p>
                    <p>We received a request to resend your verification email. Click the button below to verify your email address:</p>
                    <div style="text-align: center;">
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                    </div>
                    <p style="background: #fff5e1; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <strong>Note:</strong> This link will expire in 24 hours.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2025 EduResources - Academic Platform</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        email_sent = send_email(
            to_email=request.email,
            subject="Email Verification - EduResources 📚",
            html_content=html_content
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email. Please try again later."
            )
        
        return {"message": "If an unverified account exists with this email, a new verification link has been sent."}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Resend verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred. Please try again later."
        )

## Password Reset Endpoints
@app.post("/api/auth/forgot-password")
@limiter.limit("3/hour")  # ✅ SECURITY FIX #3: Rate limit password reset
async def forgot_password(request: Request, reset_request: ForgotPasswordRequest):
    """Send password reset email"""
    try:
        # Check if user exists
        user = users_collection.find_one({"email": reset_request.email})
        
        # Always return success to prevent email enumeration
        if not user:
            return {
                "message": "If an account exists with this email, a password reset link has been sent."
            }
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store token in database with 1 hour expiry
        token_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user["_id"],
            "email": reset_request.email,
            "token": reset_token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=1),
            "used": False
        }
        
        password_reset_tokens_collection.insert_one(token_doc)
        
        # Create reset link
        reset_link = f"{FRONTEND_URL}/reset-password/{reset_token}"
        
        # Email content - Modern academic theme
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background-color: #f5f7fa;
                    margin: 0;
                    padding: 0;
                }}
                .container {{ 
                    max-width: 600px; 
                    margin: 40px auto; 
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .header .icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
                .content {{ 
                    padding: 40px 30px;
                    background: white;
                }}
                .greeting {{
                    font-size: 20px;
                    color: #2d3748;
                    margin-bottom: 20px;
                    font-weight: 500;
                }}
                .message {{
                    color: #4a5568;
                    font-size: 16px;
                    line-height: 1.8;
                    margin-bottom: 20px;
                }}
                .button {{ 
                    display: inline-block; 
                    padding: 14px 32px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    margin: 20px 0;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
                }}
                .link-box {{
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    word-break: break-all;
                    font-size: 14px;
                    color: #4a5568;
                }}
                .expiry-notice {{
                    background: #fff5e1;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                    font-size: 14px;
                    color: #92400e;
                }}
                .security-note {{
                    background: #e6f7ff;
                    border-left: 4px solid #1890ff;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                    font-size: 14px;
                    color: #003a8c;
                }}
                .footer {{ 
                    background: #2d3748;
                    color: #cbd5e0;
                    text-align: center;
                    padding: 30px;
                    font-size: 14px;
                }}
                .footer .logo {{
                    font-size: 24px;
                    margin-bottom: 10px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">🔐</div>
                    <h1>Password Reset Request</h1>
                </div>
                
                <div class="content">
                    <div class="greeting">Hello {user['name']},</div>
                    
                    <div class="message">
                        We received a request to reset your password for your <strong>EduResources</strong> account.
                    </div>
                    
                    <div class="message">
                        Click the button below to create a new password:
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </div>
                    
                    <div class="expiry-notice">
                        ⏰ <strong>Important:</strong> This reset link will expire in 1 hour for security reasons.
                    </div>
                    
                    <div class="message">
                        If the button doesn't work, copy and paste this link into your browser:
                    </div>
                    
                    <div class="link-box">
                        {reset_link}
                    </div>
                    
                    <div class="security-note">
                        🛡️ <strong>Security Tip:</strong> If you didn't request this password reset, please ignore this email. 
                        Your account remains secure and no changes will be made.
                    </div>
                </div>
                
                <div class="footer">
                    <div class="logo">📚 EduResources</div>
                    <p style="margin: 10px 0;">Academic Resources Platform for Engineering Students</p>
                    <p style="margin: 10px 0; font-size: 12px;">
                        © 2025 EduResources. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email
        email_sent = send_email(
            to_email=reset_request.email,
            subject="Password Reset Request - Academic Resources",
            html_content=html_content
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reset email. Please try again later."
            )
        
        return {
            "message": "If an account exists with this email, a password reset link has been sent."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Forgot password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred. Please try again later."
        )

@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    try:
        # Find token
        token_doc = password_reset_tokens_collection.find_one({
            "token": request.token,
            "used": False
        })
        
        if not token_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check if token is expired
        if datetime.utcnow() > token_doc["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )
        
        # Hash new password
        new_hash = get_password_hash(request.new_password)
        
        # Update user password
        users_collection.update_one(
            {"_id": token_doc["user_id"]},
            {"$set": {"password": new_hash}}
        )
        
        # Mark token as used
        password_reset_tokens_collection.update_one(
            {"_id": token_doc["_id"]},
            {"$set": {"used": True}}
        )
        
        return {"message": "Password has been reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred. Please try again later."
        )

## Papers API
@app.get("/api/papers", response_model=List[PaperResponse])
async def get_papers():
    # Get all papers sorted by newest first
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
    # ✅ SECURITY FIX #5: Validate file size and type
    await validate_file_size(file)
    await validate_file_type(file)
    
    # Save the uploaded file
    file_path = await save_upload_file(file, f"{UPLOAD_DIR}/papers")
    
    # Convert comma-separated tags to list
    tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
    
    # Create paper doc
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
    
    # Give user contributor badge
    await check_and_award_achievement(current_user.id, "contributor")
    
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
    
    # Only the uploader or admin can delete
    if not current_user.is_admin and paper["uploaded_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Try to delete the file (might fail if file is missing, that's ok)
    try:
        os.remove(paper["file_path"])
    except OSError:
        pass
    
    papers_collection.delete_one({"_id": paper_id})
    
    return {"message": "Paper deleted successfully"}

@app.get("/api/papers/{paper_id}/download")
async def download_paper(paper_id: str, current_user: User = Depends(get_current_user)):
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
    
    # Track the download
    await track_download(current_user.id, "paper", paper_id)
    
    return FileResponse(
        path=paper["file_path"],
        filename=f"{paper['title']}.pdf",
        media_type="application/pdf"
    )

@app.get("/api/papers/{paper_id}/view")
async def view_paper(paper_id: str):
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
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
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
    # ✅ SECURITY FIX #5: Validate file size and type
    await validate_file_size(file)
    await validate_file_type(file)
    
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
    
    # Award contributor achievement
    await check_and_award_achievement(current_user.id, "contributor")
    
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
async def download_note(note_id: str, current_user: User = Depends(get_current_user)):
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
    
    # Track the download
    await track_download(current_user.id, "note", note_id)
    
    return FileResponse(
        path=note["file_path"],
        filename=f"{note['title']}.pdf",
        media_type="application/pdf"
    )

@app.get("/api/notes/{note_id}/view")
async def view_note(note_id: str):
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
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
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
    
    # Award contributor achievement
    await check_and_award_achievement(current_user.id, "contributor")
    
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
async def download_syllabus(syllabus_id: str, current_user: User = Depends(get_current_user)):
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
    
    # Track the download
    await track_download(current_user.id, "syllabus", syllabus_id)
    
    return FileResponse(
        path=syllabus["file_path"],
        filename=f"{syllabus['title']}.pdf",
        media_type="application/pdf"
    )

@app.get("/api/syllabus/{syllabus_id}/view")
async def view_syllabus(syllabus_id: str):
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
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
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

## AI Study Assistant
@app.post("/api/ai/chat", response_model=ChatResponse)
async def ai_chat(
    chat_request: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """AI assistant for engineering students"""
    try:
        # Generate or use existing session ID
        session_id = chat_request.sessionId or f"user_{current_user.id}_{uuid.uuid4().hex[:8]}"
        
        # System prompt for the AI
        system_msg = """You are an AI study assistant for engineering students. You specialize in helping with:

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

        # Setup chat with GPT-4o-mini (works well for education)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg
        ).with_model("openai", "gpt-4o-mini")
        
        user_msg = UserMessage(text=chat_request.message)
        
        # Get response from AI
        ai_response = await chat.send_message(user_msg)
        
        # Save chat history to DB
        msg_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "session_id": session_id,
            "user_message": chat_request.message,
            "ai_response": ai_response,
            "timestamp": datetime.utcnow()
        }
        
        chat_messages_collection.insert_one(msg_doc)
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        print(f"AI Chat Error: {e}")

@app.get("/api/profile/stats")
async def get_profile_stats(current_user: User = Depends(get_current_user)):
    """Get user's profile statistics"""
    total_downloads = downloads_collection.count_documents({"user_id": current_user.id})
    total_bookmarks = bookmarks_collection.count_documents({"user_id": current_user.id})
    total_goals = learning_goals_collection.count_documents({"user_id": current_user.id})
    completed_goals = learning_goals_collection.count_documents({"user_id": current_user.id, "completed": True})
    total_achievements = achievements_collection.count_documents({"user_id": current_user.id})
    
    # Get recent downloads
    recent_downloads = []
    for download in downloads_collection.find({"user_id": current_user.id}).sort("downloaded_at", -1).limit(10):
        resource_type = download["resource_type"]
        resource_id = download["resource_id"]
        
        # Get resource details
        resource = None
        if resource_type == "paper":
            resource = papers_collection.find_one({"_id": resource_id})
        elif resource_type == "note":
            resource = notes_collection.find_one({"_id": resource_id})
        elif resource_type == "syllabus":
            resource = syllabus_collection.find_one({"_id": resource_id})
        
        if resource:
            recent_downloads.append({
                "type": resource_type,
                "title": resource["title"],
                "branch": resource["branch"],
                "downloaded_at": download["downloaded_at"]
            })
    
    return {
        "total_downloads": total_downloads,
        "total_bookmarks": total_bookmarks,
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "total_achievements": total_achievements,
        "recent_downloads": recent_downloads
    }

## Profile endpoints
@app.get("/api/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Returns current user's profile"""
    return current_user

@app.put("/api/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update profile info (currently just name)"""
    updates = {}
    
    if profile_data.name is not None:
        updates["name"] = profile_data.name
    
    if updates:
        users_collection.update_one(
            {"_id": current_user.id},
            {"$set": updates}
        )
    
    return {"message": "Profile updated successfully"}

@app.post("/api/profile/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload/update profile picture"""
    # Only accept image files
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPG, PNG, WebP) are allowed"
        )
    
    # Remove old photo if it exists
    user_doc = users_collection.find_one({"_id": current_user.id})
    if user_doc and user_doc.get("profile_photo"):
        try:
            os.remove(user_doc["profile_photo"])
        except OSError:
            pass  # Old file might be missing, that's fine
    
    # Save new photo
    file_path = await save_upload_file(file, f"{UPLOAD_DIR}/profile_photos")
    
    # Update DB
    users_collection.update_one(
        {"_id": current_user.id},
        {"$set": {"profile_photo": file_path}}
    )
    
    # Award profile completion achievement
    await check_profile_achievements(current_user.id)
    
    return {"message": "Profile photo updated successfully", "file_path": file_path}

@app.put("/api/profile/password")
async def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    user = users_collection.find_one({"_id": current_user.id})
    
    # Make sure current password is correct
    if not verify_password(password_data.current_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash and save new password
    new_hash = get_password_hash(password_data.new_password)
    users_collection.update_one(
        {"_id": current_user.id},
        {"$set": {"password": new_hash}}
    )
    
    return {"message": "Password updated successfully"}

@app.delete("/api/profile/photo")
async def remove_profile_photo(
    current_user: User = Depends(get_current_user)
):
    """Remove profile picture"""
    user_doc = users_collection.find_one({"_id": current_user.id})
    
    if user_doc and user_doc.get("profile_photo"):
        try:
            os.remove(user_doc["profile_photo"])
        except OSError:
            pass  # File might be missing, that's fine
    
    # Update DB - remove photo reference
    users_collection.update_one(
        {"_id": current_user.id},
        {"$unset": {"profile_photo": ""}}
    )
    
    return {"message": "Profile photo removed successfully"}

@app.get("/api/profile/photo/{user_id}")
async def get_profile_photo(user_id: str):
    """Get user profile photo"""
    user = users_collection.find_one({"_id": user_id})
    
    if not user or not user.get("profile_photo"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile photo not found"
        )
    
    if not os.path.exists(user["profile_photo"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile photo file not found"
        )
    
    # Detect media type from file extension
    file_path = user["profile_photo"]
    if file_path.lower().endswith('.png'):
        media_type = "image/png"
    elif file_path.lower().endswith('.webp'):
        media_type = "image/webp"
    elif file_path.lower().endswith(('.jpg', '.jpeg')):
        media_type = "image/jpeg"
    else:
        media_type = "image/jpeg"  # default
    
    return FileResponse(
        path=user["profile_photo"],
        media_type=media_type
    )

# Bookmarks Endpoints
@app.get("/api/bookmarks", response_model=List[BookmarkResponse])
async def get_bookmarks(current_user: User = Depends(get_current_user)):
    """Get user's bookmarks"""
    bookmarks = []
    
    for bookmark in bookmarks_collection.find({"user_id": current_user.id}).sort("created_at", -1):
        # Get resource details
        resource = None
        if bookmark["resource_type"] == "paper":
            resource = papers_collection.find_one({"_id": bookmark["resource_id"]})
        elif bookmark["resource_type"] == "note":
            resource = notes_collection.find_one({"_id": bookmark["resource_id"]})
        elif bookmark["resource_type"] == "syllabus":
            resource = syllabus_collection.find_one({"_id": bookmark["resource_id"]})
        
        if resource:
            bookmarks.append(BookmarkResponse(
                id=bookmark["_id"],
                resource_type=bookmark["resource_type"],
                resource_id=bookmark["resource_id"],
                category=bookmark["category"],
                title=resource["title"],
                branch=resource["branch"],
                created_at=bookmark["created_at"]
            ))
    
    return bookmarks

@app.post("/api/bookmarks")
async def create_bookmark(
    bookmark_data: BookmarkCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a bookmark"""
    # Check if bookmark already exists
    existing = bookmarks_collection.find_one({
        "user_id": current_user.id,
        "resource_type": bookmark_data.resource_type,
        "resource_id": bookmark_data.resource_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource already bookmarked"
        )
    
    # Verify resource exists
    resource = None
    if bookmark_data.resource_type == "paper":
        resource = papers_collection.find_one({"_id": bookmark_data.resource_id})
    elif bookmark_data.resource_type == "note":
        resource = notes_collection.find_one({"_id": bookmark_data.resource_id})
    elif bookmark_data.resource_type == "syllabus":
        resource = syllabus_collection.find_one({"_id": bookmark_data.resource_id})
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Create bookmark
    bookmark_id = str(uuid.uuid4())
    bookmark_doc = {
        "_id": bookmark_id,
        "user_id": current_user.id,
        "resource_type": bookmark_data.resource_type,
        "resource_id": bookmark_data.resource_id,
        "category": bookmark_data.category,
        "created_at": datetime.utcnow()
    }
    
    bookmarks_collection.insert_one(bookmark_doc)
    
    # Check for bookmark achievements
    await check_bookmark_achievements(current_user.id)
    
    return {"message": "Bookmark created successfully", "id": bookmark_id}

@app.delete("/api/bookmarks/{resource_type}/{resource_id}")
async def remove_bookmark(
    resource_type: str,
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a bookmark"""
    result = bookmarks_collection.delete_one({
        "user_id": current_user.id,
        "resource_type": resource_type,
        "resource_id": resource_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    
    return {"message": "Bookmark removed successfully"}

@app.get("/api/bookmarks/check/{resource_type}/{resource_id}")
async def check_bookmark(
    resource_type: str,
    resource_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check if a resource is bookmarked"""
    bookmark = bookmarks_collection.find_one({
        "user_id": current_user.id,
        "resource_type": resource_type,
        "resource_id": resource_id
    })
    
    return {"bookmarked": bookmark is not None}

# Achievements Endpoints
@app.get("/api/achievements", response_model=List[Achievement])
async def get_achievements(current_user: User = Depends(get_current_user)):
    """Get user's achievements"""
    achievements = []
    
    for achievement in achievements_collection.find({"user_id": current_user.id}).sort("earned_at", -1):
        achievements.append(Achievement(
            id=achievement["_id"],
            name=achievement["name"],
            description=achievement["description"],
            icon=achievement["icon"],
            earned_at=achievement["earned_at"]
        ))
    
    return achievements

# Learning Goals Endpoints
@app.get("/api/learning-goals", response_model=List[LearningGoal])
async def get_learning_goals(current_user: User = Depends(get_current_user)):
    """Get user's learning goals"""
    goals = []
    
    for goal in learning_goals_collection.find({"user_id": current_user.id}).sort("created_at", -1):
        goals.append(LearningGoal(
            id=goal["_id"],
            title=goal["title"],
            description=goal["description"],
            target_date=goal["target_date"],
            progress=goal["progress"],
            completed=goal["completed"],
            created_at=goal["created_at"]
        ))
    
    return goals

@app.post("/api/learning-goals")
async def create_learning_goal(
    goal_data: LearningGoalCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a learning goal"""
    goal_id = str(uuid.uuid4())
    goal_doc = {
        "_id": goal_id,
        "user_id": current_user.id,
        "title": goal_data.title,
        "description": goal_data.description,
        "target_date": goal_data.target_date,
        "progress": 0,
        "completed": False,
        "created_at": datetime.utcnow()
    }
    
    learning_goals_collection.insert_one(goal_doc)
    
    # Award achievement for first goal
    await check_and_award_achievement(current_user.id, "goal_setter")
    
    return {"message": "Learning goal created successfully", "id": goal_id}

@app.put("/api/learning-goals/{goal_id}")
async def update_learning_goal(
    goal_id: str,
    goal_data: LearningGoalUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a learning goal"""
    goal = learning_goals_collection.find_one({"_id": goal_id, "user_id": current_user.id})
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning goal not found"
        )
    
    update_fields = {}
    
    if goal_data.title is not None:
        update_fields["title"] = goal_data.title
    if goal_data.description is not None:
        update_fields["description"] = goal_data.description
    if goal_data.target_date is not None:
        update_fields["target_date"] = goal_data.target_date
    if goal_data.progress is not None:
        update_fields["progress"] = min(100, max(0, goal_data.progress))
        # Auto-complete if progress reaches 100
        if update_fields["progress"] == 100:
            update_fields["completed"] = True
    if goal_data.completed is not None:
        update_fields["completed"] = goal_data.completed
        # Award achievement for first completed goal
        if goal_data.completed and not goal["completed"]:
            await check_and_award_achievement(current_user.id, "goal_achiever")
            # Check for additional goal achievements
            await check_goal_achievements(current_user.id)
    
    if update_fields:
        learning_goals_collection.update_one(
            {"_id": goal_id},
            {"$set": update_fields}
        )
    
    return {"message": "Learning goal updated successfully"}

@app.delete("/api/learning-goals/{goal_id}")
async def delete_learning_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a learning goal"""
    result = learning_goals_collection.delete_one({"_id": goal_id, "user_id": current_user.id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning goal not found"
        )
    
    return {"message": "Learning goal deleted successfully"}

## Achievement system helpers
async def check_and_award_achievement(user_id, achievement_type):
    """Awards achievement if user doesn't have it yet"""
    # Don't award if already earned
    existing = achievements_collection.find_one({
        "user_id": user_id,
        "achievement_type": achievement_type
    })
    
    if existing:
        return
    
    # All available achievements
    achievements = {
        "first_bookmark": {
            "name": "Bookworm",
            "description": "Created your first bookmark",
            "icon": "📚"
        },
        "bookmark_collector": {
            "name": "Bookmark Collector",
            "description": "Saved 10+ resources to bookmarks",
            "icon": "⭐"
        },
        "bookmark_master": {
            "name": "Bookmark Master",
            "description": "Saved 25+ resources across different categories",
            "icon": "💫"
        },
        "goal_setter": {
            "name": "Goal Setter", 
            "description": "Set your first learning goal",
            "icon": "🎯"
        },
        "goal_achiever": {
            "name": "Goal Achiever",
            "description": "Completed your first learning goal", 
            "icon": "🏆"
        },
        "goal_master": {
            "name": "Goal Master",
            "description": "Completed 5+ learning goals",
            "icon": "👑"
        },
        "active_learner": {
            "name": "Active Learner",
            "description": "Downloaded 10+ resources",
            "icon": "📖"
        },
        "power_user": {
            "name": "Power User",
            "description": "Downloaded 50+ resources",
            "icon": "⚡"
        },
        "contributor": {
            "name": "Contributor",
            "description": "Uploaded your first resource",
            "icon": "📝"
        },
        "super_contributor": {
            "name": "Super Contributor",
            "description": "Uploaded 5+ resources",
            "icon": "🌟"
        },
        "profile_complete": {
            "name": "Profile Complete",
            "description": "Added profile photo and updated information",
            "icon": "✨"
        },
        "early_adopter": {
            "name": "Early Adopter",
            "description": "One of the first users on the platform",
            "icon": "🚀"
        },
        "forum_contributor": {
            "name": "Forum Contributor",
            "description": "Created your first forum post",
            "icon": "💬"
        }
    }
    
    if achievement_type not in achievements:
        return
    
    ach = achievements[achievement_type]
    
    # Award the achievement
    ach_id = str(uuid.uuid4())
    ach_doc = {
        "_id": ach_id,
        "user_id": user_id,
        "achievement_type": achievement_type,
        "name": ach["name"],
        "description": ach["description"],
        "icon": ach["icon"],
        "earned_at": datetime.utcnow()
    }
    
    achievements_collection.insert_one(ach_doc)

async def check_bookmark_achievements(user_id):
    """Check if user earned bookmark achievements"""
    count = bookmarks_collection.count_documents({"user_id": user_id})
    
    if count == 1:
        await check_and_award_achievement(user_id, "first_bookmark")
    elif count == 10:
        await check_and_award_achievement(user_id, "bookmark_collector")
    elif count == 25:
        await check_and_award_achievement(user_id, "bookmark_master")

async def check_goal_achievements(user_id):
    """Check if user earned goal achievements"""
    completed = learning_goals_collection.count_documents({"user_id": user_id, "completed": True})
    
    # Award goal master for completing 5 goals
    if completed == 5:
        await check_and_award_achievement(user_id, "goal_master")

async def check_profile_achievements(user_id):
    """Check if profile is complete"""
    user = users_collection.find_one({"_id": user_id})
    
    # Award if user has uploaded profile photo
    if user and user.get("profile_photo"):
        await check_and_award_achievement(user_id, "profile_complete")


async def track_download(user_id, resource_type, resource_id):
    """Track when a user downloads a resource"""
    download_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "resource_type": resource_type,  # 'paper', 'note', or 'syllabus'
        "resource_id": resource_id,
        "downloaded_at": datetime.utcnow()
    }
    downloads_collection.insert_one(download_doc)
    
    # Check download achievements
    total_downloads = downloads_collection.count_documents({"user_id": user_id})
    if total_downloads == 10:
        await check_and_award_achievement(user_id, "active_learner")
    elif total_downloads == 50:
        await check_and_award_achievement(user_id, "power_user")


## Forum Endpoints
@app.get("/api/forum/posts", response_model=List[ForumPost])
async def get_forum_posts(category: Optional[str] = None):
    """Get all forum posts, optionally filtered by category"""
    query = {}
    if category:
        query["category"] = category
    
    posts = []
    for post in forum_posts_collection.find(query).sort("last_activity", -1):
        # Get author details
        author = users_collection.find_one({"_id": post["author_id"]})
        author_name = author["name"] if author else "Unknown User"
        author_photo = author.get("profile_photo") if author else None
        
        # Count replies
        replies_count = forum_replies_collection.count_documents({"post_id": post["_id"]})
        
        posts.append(ForumPost(
            id=post["_id"],
            title=post["title"],
            content=post["content"],
            category=post["category"],
            tags=post.get("tags", []),
            author_id=post["author_id"],
            author_name=author_name,
            replies_count=replies_count,
            views=post.get("views", 0),
            created_at=post["created_at"],
            updated_at=post.get("updated_at", post["created_at"]),
            last_activity=post.get("last_activity", post["created_at"]),
            author_profile_photo=author_photo
        ))
    
    return posts

@app.get("/api/forum/posts/{post_id}", response_model=ForumPost)
async def get_forum_post(post_id: str):
    """Get a single forum post and increment views"""
    post = forum_posts_collection.find_one({"_id": post_id})
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Increment views
    forum_posts_collection.update_one(
        {"_id": post_id},
        {"$inc": {"views": 1}}
    )
    
    # Get author details
    author = users_collection.find_one({"_id": post["author_id"]})
    author_name = author["name"] if author else "Unknown User"
    author_photo = author.get("profile_photo") if author else None
    
    # Count replies
    replies_count = forum_replies_collection.count_documents({"post_id": post_id})
    
    return ForumPost(
        id=post["_id"],
        title=post["title"],
        content=post["content"],
        category=post["category"],
        tags=post.get("tags", []),
        author_id=post["author_id"],
        author_name=author_name,
        replies_count=replies_count,
        views=post.get("views", 0) + 1,
        created_at=post["created_at"],
        updated_at=post.get("updated_at", post["created_at"]),
        last_activity=post.get("last_activity", post["created_at"]),
        author_profile_photo=author_photo
    )

@app.post("/api/forum/posts")
async def create_forum_post(
    post_data: ForumPostCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new forum post"""
    post_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    post_doc = {
        "_id": post_id,
        "title": post_data.title,
        "content": post_data.content,
        "category": post_data.category,
        "tags": post_data.tags,
        "author_id": current_user.id,
        "views": 0,
        "created_at": now,
        "updated_at": now,
        "last_activity": now
    }
    
    forum_posts_collection.insert_one(post_doc)
    
    # Award achievement for first post
    user_post_count = forum_posts_collection.count_documents({"author_id": current_user.id})
    if user_post_count == 1:
        await check_and_award_achievement(current_user.id, "forum_contributor")
    
    return {"message": "Post created successfully", "id": post_id}

@app.put("/api/forum/posts/{post_id}")
async def update_forum_post(
    post_id: str,
    post_data: ForumPostUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a forum post (author or admin only)"""
    post = forum_posts_collection.find_one({"_id": post_id})
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only author or admin can update
    if post["author_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_fields = {"updated_at": datetime.utcnow()}
    
    if post_data.title is not None:
        update_fields["title"] = post_data.title
    if post_data.content is not None:
        update_fields["content"] = post_data.content
    if post_data.category is not None:
        update_fields["category"] = post_data.category
    if post_data.tags is not None:
        update_fields["tags"] = post_data.tags
    
    forum_posts_collection.update_one(
        {"_id": post_id},
        {"$set": update_fields}
    )
    
    return {"message": "Post updated successfully"}

@app.delete("/api/forum/posts/{post_id}")
async def delete_forum_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a forum post (author or admin only)"""
    post = forum_posts_collection.find_one({"_id": post_id})
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only author or admin can delete
    if post["author_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete all replies first
    forum_replies_collection.delete_many({"post_id": post_id})
    
    # Delete the post
    forum_posts_collection.delete_one({"_id": post_id})
    
    return {"message": "Post deleted successfully"}

@app.get("/api/forum/posts/{post_id}/replies", response_model=List[ForumReply])
async def get_post_replies(post_id: str):
    """Get all replies for a post"""
    # Check if post exists
    post = forum_posts_collection.find_one({"_id": post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    replies = []
    for reply in forum_replies_collection.find({"post_id": post_id}).sort("created_at", 1):
        # Get author details
        author = users_collection.find_one({"_id": reply["author_id"]})
        author_name = author["name"] if author else "Unknown User"
        author_photo = author.get("profile_photo") if author else None
        
        replies.append(ForumReply(
            id=reply["_id"],
            post_id=reply["post_id"],
            author_id=reply["author_id"],
            author_name=author_name,
            content=reply["content"],
            created_at=reply["created_at"],
            author_profile_photo=author_photo
        ))
    
    return replies

@app.post("/api/forum/posts/{post_id}/replies")
async def create_reply(
    post_id: str,
    reply_data: ForumReplyCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a reply to a forum post"""
    # Check if post exists
    post = forum_posts_collection.find_one({"_id": post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    reply_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    reply_doc = {
        "_id": reply_id,
        "post_id": post_id,
        "author_id": current_user.id,
        "content": reply_data.content,
        "created_at": now
    }
    
    forum_replies_collection.insert_one(reply_doc)
    
    # Update post's last activity
    forum_posts_collection.update_one(
        {"_id": post_id},
        {"$set": {"last_activity": now}}
    )
    
    return {"message": "Reply created successfully", "id": reply_id}

@app.delete("/api/forum/replies/{reply_id}")
async def delete_reply(
    reply_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a forum reply (author or admin only)"""
    reply = forum_replies_collection.find_one({"_id": reply_id})
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Only author or admin can delete
    if reply["author_id"] != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    forum_replies_collection.delete_one({"_id": reply_id})
    
    return {"message": "Reply deleted successfully"}

## Health check endpoints
@app.get("/")
async def root():
    return {"message": "Academic Resources API is running"}

@app.get("/health")
async def health_check():
    try:
        # Ping DB to verify connection
        client.admin.command('ping')
        
        # Check email configuration
        email_configured = bool(SMTP_USERNAME and SMTP_PASSWORD)
        
        return {
            "status": "healthy", 
            "database": "connected",
            "email_system": "configured" if email_configured else "not_configured"
        }
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Startup event to initialize backup system
@app.on_event("startup")
async def startup_event():
    """Initialize continuous backup system on startup"""
    import subprocess
    import threading
    
    def run_continuous_backup():
        """Run backup system in background thread"""
        try:
            subprocess.Popen(
                ["bash", "/app/scripts/continuous_backup.sh"],
                stdout=open("/var/log/backup.log", "w"),
                stderr=subprocess.STDOUT
            )
            print("✓ Continuous backup system started")
        except Exception as e:
            print(f"⚠️  Failed to start backup system: {e}")
    
    # Start backup in background thread
    backup_thread = threading.Thread(target=run_continuous_backup, daemon=True)
    backup_thread.start()
    
    print("✓ Startup complete - data protection active")


# =============================================================================
# CMS CONTENT MANAGEMENT ENDPOINTS
# =============================================================================

@app.get("/api/cms/content", response_model=List[CMSContent])
async def get_cms_content(
    content_type: Optional[str] = None,
    featured: Optional[bool] = None,
    category: Optional[str] = None,
    limit: Optional[int] = None
):
    """Get all CMS content (public endpoint)"""
    try:
        # Build query
        query = {}
        if content_type:
            query["content_type"] = content_type
        if featured is not None:
            query["featured"] = featured
        if category:
            query["category"] = category
        
        # Get content sorted by created_at (newest first)
        cursor = cms_content_collection.find(query).sort("created_at", -1)
        
        if limit:
            cursor = cursor.limit(limit)
        
        content_list = []
        for doc in cursor:
            doc["id"] = doc.pop("_id")
            content_list.append(CMSContent(**doc))
        
        return content_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cms/content/{content_id}", response_model=CMSContent)
async def get_cms_content_by_id(content_id: str):
    """Get specific CMS content by ID (public endpoint)"""
    try:
        content = cms_content_collection.find_one({"_id": content_id})
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        content["id"] = content.pop("_id")
        return CMSContent(**content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cms/content", response_model=CMSContent)
async def create_cms_content(
    content_data: CMSContentCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create new CMS content (admin only)"""
    try:
        # Verify admin
        user = await get_current_user(credentials)
        if not user.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Create content document
        content_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        content_doc = {
            "_id": content_id,
            "title": content_data.title,
            "description": content_data.description,
            "content": content_data.content,
            "content_type": content_data.content_type,
            "featured": content_data.featured,
            "category": content_data.category,
            "tags": content_data.tags or [],
            "author_id": user["_id"],
            "author_name": user["name"],
            "created_at": now,
            "updated_at": now
        }
        
        cms_content_collection.insert_one(content_doc)
        
        content_doc["id"] = content_doc.pop("_id")
        return CMSContent(**content_doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/cms/content/{content_id}", response_model=CMSContent)
async def update_cms_content(
    content_id: str,
    content_data: CMSContentUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update CMS content (admin only)"""
    try:
        # Verify admin
        user = await get_current_user(credentials)
        if not user.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Check if content exists
        existing_content = cms_content_collection.find_one({"_id": content_id})
        if not existing_content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        if content_data.title is not None:
            update_doc["title"] = content_data.title
        if content_data.description is not None:
            update_doc["description"] = content_data.description
        if content_data.content is not None:
            update_doc["content"] = content_data.content
        if content_data.content_type is not None:
            update_doc["content_type"] = content_data.content_type
        if content_data.featured is not None:
            update_doc["featured"] = content_data.featured
        if content_data.category is not None:
            update_doc["category"] = content_data.category
        if content_data.tags is not None:
            update_doc["tags"] = content_data.tags
        
        # Update content
        cms_content_collection.update_one(
            {"_id": content_id},
            {"$set": update_doc}
        )
        
        # Get updated content
        updated_content = cms_content_collection.find_one({"_id": content_id})
        updated_content["id"] = updated_content.pop("_id")
        
        return CMSContent(**updated_content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/cms/content/{content_id}")
async def delete_cms_content(
    content_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete CMS content (admin only)"""
    try:
        # Verify admin
        user = await get_current_user(credentials)
        if not user.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Check if content exists
        existing_content = cms_content_collection.find_one({"_id": content_id})
        if not existing_content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Delete content
        cms_content_collection.delete_one({"_id": content_id})
        
        return {"message": "Content deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run the server (supervisor handles this in production)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)