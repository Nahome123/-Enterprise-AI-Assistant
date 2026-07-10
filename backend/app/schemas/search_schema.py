from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

class SearchResult(BaseModel):
    chunk_id: int
    document_id: int
    chunk_text: str
    page_number: Optional[int]
    distance: float