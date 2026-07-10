from pydantic import BaseModel, Field
from typing import Literal, Optional

SupportedLanguage = Literal[
    "English",
    "Spanish",
    "French",
    "German",
    "Amharic",
    "Arabic",
    "Chinese",
    "Hindi",
    "Portuguese",
]

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[int] = None
    language: SupportedLanguage = "English"

class ChatResponse(BaseModel):
    answer: str
    session_id: int
    language: SupportedLanguage
    sources: list
