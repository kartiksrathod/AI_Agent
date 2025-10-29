from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    id: Optional[str]
    username: str
    email: EmailStr
    password: str
    role: str = "user"  # Can be "user" or "admin"
    verified: bool = False
