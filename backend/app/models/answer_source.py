from sqlalchemy import Column, Integer, Float, ForeignKey
from app.database import Base

class AnswerSource(Base):
    __tablename__ = "answer_sources"

    id = Column(Integer, primary_key=True, index=True)
    chat_message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_id = Column(Integer, ForeignKey("document_chunks.id"), nullable=False)
    similarity_score = Column(Float, nullable=True)