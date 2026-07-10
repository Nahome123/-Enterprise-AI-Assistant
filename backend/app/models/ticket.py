from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    customer_email = Column(String, nullable=True)
    status = Column(String, default="open", nullable=False, index=True)
    category = Column(String, default="General", nullable=False, index=True)
    priority = Column(String, default="Medium", nullable=False, index=True)
    routed_team = Column(String, default="Customer Operations", nullable=False, index=True)
    suggested_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
