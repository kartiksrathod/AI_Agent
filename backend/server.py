# ============================================================
# ✅ STEP 1: Load environment variables BEFORE anything else
# ============================================================
import os
from pathlib import Path
from dotenv import load_dotenv

dotenv_path = Path(__file__).resolve().parent / ".env"
print(f"🔍 Loading .env from: {dotenv_path}")
load_dotenv(dotenv_path)

# ============================================================
# ✅ STEP 2: Imports
# ============================================================
import uuid
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
import importlib
import pkgutil

# ✅ Central Config
from config import (
    db,
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALLOWED_ORIGINS,
)

# ============================================================
# ✅ STEP 3: Logging Setup
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
# ✅ STEP 4: Password Hashing & JWT
# ============================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Generate JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    """Decode JWT and verify validity"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ============================================================
# ✅ STEP 5: FastAPI App Initialization
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
# ✅ STEP 6: Pydantic Models
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
# ✅ STEP 7: Auth Routes
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
        "is_admin": users_collection.count_documents({}) == 0,  # first user = admin
        "created_at": datetime.utcnow(),
    }

    users_collection.insert_one(user_doc)
    logger.info(f"👤 New user registered: {user.email}")

    token = create_access_token({"sub": user.email, "is_admin": user_doc["is_admin"]})
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
    token = create_access_token({"sub": user.email, "is_admin": is_admin})

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
            "is_admin": is_admin,
        },
    }


@app.get("/api/profile")
async def profile(request: Request):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token missing or invalid")

    payload = verify_token(token.split(" ")[1])
    email = payload.get("sub")

    user = db.users.find_one({"email": email}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# ============================================================
# ✅ STEP 8: Auto-Import All Routers from /routes
# ============================================================
import routes

def auto_include_routers(app):
    """Automatically include all routers from the 'routes' package."""
    for _, module_name, _ in pkgutil.iter_modules(routes.__path__):
        module = importlib.import_module(f"routes.{module_name}")
        if hasattr(module, "router"):
            prefix = f"/api/{module_name.replace('_routes', '')}"
            tag = module_name.replace("_routes", "").capitalize()
            app.include_router(module.router, prefix=prefix, tags=[tag])
            logger.info(f"✅ Router loaded: {module_name} -> {prefix}")

auto_include_routers(app)

# ============================================================
# ✅ STEP 9: Root Endpoint
# ============================================================
@app.get("/")
async def root():
    return {"message": "🚀 EduResources Backend Running Successfully!"}

# ============================================================
# ✅ STEP 10: Run Server
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
