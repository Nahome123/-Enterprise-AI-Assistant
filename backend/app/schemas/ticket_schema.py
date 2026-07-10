from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=160)
    description: str = Field(..., min_length=10, max_length=5000)
    customer_email: Optional[EmailStr] = None


class TicketUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(open|in_progress|resolved|closed)$")
    routed_team: Optional[str] = Field(None, min_length=2, max_length=120)


class TicketRead(BaseModel):
    id: int
    title: str
    description: str
    customer_email: Optional[str]
    status: str
    category: str
    priority: str
    routed_team: str
    suggested_response: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketAnalytics(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    closed: int
    high_priority: int
    category_counts: dict[str, int]
    team_counts: dict[str, int]


class AuditLogRead(BaseModel):
    id: int
    ticket_id: Optional[int]
    action: str
    details: str
    created_at: datetime

    class Config:
        from_attributes = True
