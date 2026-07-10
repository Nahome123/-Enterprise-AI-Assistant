from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.embedding_service import create_embedding

def semantic_search(db: Session, query: str, user_id: int, limit: int = 5):
    query_embedding = create_embedding(query)

    results = db.query(
        DocumentChunk,
        DocumentChunk.embedding.cosine_distance(query_embedding).label("distance")
    ).join(
        Document,
        Document.id == DocumentChunk.document_id
    ).filter(
        Document.user_id == user_id
    ).order_by(
        DocumentChunk.embedding.cosine_distance(query_embedding)
    ).limit(limit).all()

    return results
