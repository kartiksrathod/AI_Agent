# ============================================================
# ✅ STEP 1: Load environment variables BEFORE anything else
# ============================================================
import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from the backend folder
dotenv_path = Path(__file__).resolve().parent / ".env"
print(f"🔍 Loading .env from: {dotenv_path}")
load_dotenv(dotenv_path)

# ============================================================
# ✅ STEP 2: Imports that depend on env vars
# ============================================================
import uuid
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

# ============================================================
# ✅ STEP 3: Config & Environment Variables
# ============================================================
MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academic_resources_db")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60

# ============================================================
# ✅ STEP 4: Logging Setup
# ============================================================
LOG_DIR = os.path.join(os.getcwd(), "app_logging", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(LOG_DIR, "app.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
logger.info("✅ Logging initialized")

# ============================================================
# ✅ STEP 5: MongoDB Connection
# ============================================================
try:
    client = MongoClient(MONGO_URL)
    db = client[DATABASE_NAME]
    client.admin.command("ping")
    logger.info("✅ MongoDB connected successfully")
except Exception as e:
    logger.error(f"❌ MongoDB connection failed: {e}")
    db = None

# ============================================================
# ✅ STEP 6: Password Hashing & JWT
# ============================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRATION_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ============================================================
# ✅ STEP 7: FastAPI App Initialization
# ============================================================
app = FastAPI(title="EduResources API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ✅ STEP 8: Models
# ============================================================
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    usn: str | None = None
    course: str | None = None
    semester: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ============================================================
# ✅ STEP 9: Auth Routes
# ============================================================
@app.post("/api/auth/register")
async def register(user: UserRegister):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    users_collection = db.users
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = pwd_context.hash(user.password)
    user_id = str(uuid.uuid4())

    user_doc = {
        "_id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "usn": user.usn,
        "course": user.course,
        "semester": user.semester,
        "is_admin": False,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(user_doc)
    logger.info(f"👤 New user registered: {user.email}")

    token = create_access_token({"sub": user.email})
    return {"message": "User registered successfully", "token": token, "user_id": user_id}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    users_collection = db.users
    existing_user = users_collection.find_one({"email": user.email})

    if not existing_user or not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    is_admin = existing_user.get("is_admin", False)
    token = create_access_token({
        "sub": user.email,
        "is_admin": is_admin
    })

    logger.info(f"✅ User logged in: {user.email} | Admin: {is_admin}")

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"],
            "usn": existing_user.get("usn"),
            "course": existing_user.get("course"),
            "semester": existing_user.get("semester"),
            "is_admin": is_admin
        }
    }

@app.get("/api/profile")
async def profile(request: Request):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing or invalid")

    email = verify_token(token.split(" ")[1])

    user = db.users.find_one({"email": email}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# ============================================================
# ✅ STEP 10: Include External Routers
# ============================================================
from routes.admin_routes import router as admin_router
from routes import auth, stats

app.include_router(auth.router)
app.include_router(stats.router)
app.include_router(admin_router, prefix="/api/admin")

# ============================================================
# ✅ STEP 11: Root
# ============================================================
@app.get("/")
async def root():
    return {"message": "EduResources Backend Running!"}
