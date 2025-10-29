from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Paper(BaseModel):
    id: Optional[str]
    title: str
    subject: str
    year: str
    semester: str
    file_url: Optional[str] = None
    uploaded_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
