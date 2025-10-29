from pathlib import Path
from dotenv import load_dotenv
import os
from pymongo import MongoClient

# -----------------------------
# Load .env explicitly from backend folder
# -----------------------------
dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path)

# -----------------------------
# Database Configuration
# -----------------------------
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "academic_resources_db")

try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    print(f"✅ MongoDB connected successfully to database: {DATABASE_NAME}")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

# -----------------------------
# JWT / Auth Configuration
# -----------------------------
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "change_this_secret"
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# -----------------------------
# CORS / Frontend
# -----------------------------
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# -----------------------------
# SMTP / Email Config
# -----------------------------
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "EduResources")
TEST_RECEIVER_EMAIL = os.getenv("TEST_RECEIVER_EMAIL")
