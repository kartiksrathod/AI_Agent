from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Syllabus(BaseModel):
    id: Optional[str]
    branch: str
    semester: str
    year: str
    file_url: Optional[str] = None
    uploaded_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
