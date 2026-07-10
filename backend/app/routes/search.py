from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.search_schema import SearchRequest
from app.services.search_service import semantic_search
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/")
def search_documents(
    payload: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = semantic_search(db, payload.query, user_id=current_user.id, limit=payload.limit)

    return [
        {
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "chunk_text": chunk.chunk_text,
            "page_number": chunk.page_number,
            "distance": distance
        }
        for chunk, distance in results
    ]
