from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String, default="processing")
    uploaded_at = Column(DateTime, default=datetime.utcnow)