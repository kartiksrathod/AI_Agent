# routes/stats.py
from fastapi import APIRouter
from database import db
from bson import ObjectId

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/")
async def get_stats():
    total_users = db.users.count_documents({})
    recent_users_cursor = db.users.find().sort("created_at", -1).limit(5)
    recent_users = []
    for u in recent_users_cursor:
        u["_id"] = str(u["_id"])
        # avoid returning password
        u.pop("password", None)
        recent_users.append(u)
    return {"total_users": total_users, "recent_users": recent_users}
