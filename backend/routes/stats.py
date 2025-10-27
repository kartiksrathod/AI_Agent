# routes/stats.py
from fastapi import APIRouter
from server import db

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/")
async def get_stats():
    total_users = db.users.count_documents({})
    recent_users = list(db.users.find().sort("created_at", -1).limit(5))

    # Convert ObjectId to string
    for user in recent_users:
        user["_id"] = str(user["_id"])

    return {
        "total_users": total_users,
        "recent_users": recent_users
    }
