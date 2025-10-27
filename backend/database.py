import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# Support both naming conventions
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")

if not MONGO_URI:
    raise ValueError("Neither MONGO_URI nor MONGO_URL found in environment variables")

client = MongoClient(MONGO_URI)
db = client["your_database_name"]
print("✅ MongoDB connected successfully")
