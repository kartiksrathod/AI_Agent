#!/usr/bin/env python3
# create_admin.py
from dotenv import load_dotenv
from database import db
import os, sys, uuid
from passlib.context import CryptContext
from datetime import datetime

load_dotenv()

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Admin User")

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    print("ADMIN_EMAIL and ADMIN_PASSWORD required in .env")
    sys.exit(1)

existing = db.users.find_one({"email": ADMIN_EMAIL})
if existing:
    print("Admin already exists.")
    if not existing.get("is_admin"):
        db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"is_admin": True, "role": "admin"}})
        print("Updated user to admin.")
    else:
        print("User already admin.")
    sys.exit(0)

hashed = pwd.hash(ADMIN_PASSWORD)
doc = {
    "_id": str(uuid.uuid4()),
    "name": ADMIN_NAME,
    "email": ADMIN_EMAIL,
    "password": hashed,
    "verified": True,
    "is_admin": True,
    "role": "admin",
    "created_at": datetime.utcnow()
}
db.users.insert_one(doc)
print("Admin created.")
