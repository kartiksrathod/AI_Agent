# database.py
from pymongo import MongoClient
from config import MONGO_URI as MONGO_URL, DATABASE_NAME


import sys

if not MONGO_URL:
    raise ValueError("MONGO_URL / MONGO_URI is not set in environment variables (.env)")

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]

# optional quick ping (will raise if problem)
try:
    client.admin.command("ping")
    print("✅ MongoDB connected successfully")
except Exception as e:
    print(f"❌ MongoDB ping failed: {e}")
    # Don't exit here; allow server to start but db calls will error explicitly
