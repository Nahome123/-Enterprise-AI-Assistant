from pydantic import BaseModel
from datetime import datetime
from pydantic import Field

class TextDocumentCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=160)
    content: str = Field(..., min_length=20, max_length=200000)

class DocumentResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
