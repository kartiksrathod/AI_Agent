from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Note(BaseModel):
    id: Optional[str]
    title: str
    description: str
    subject: str
    semester: str
    file_url: Optional[str] = None
    uploaded_by: Optional[str] = None  # user id or email
    created_at: datetime = datetime.utcnow()
