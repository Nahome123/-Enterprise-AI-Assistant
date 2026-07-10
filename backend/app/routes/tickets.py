from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket_schema import (
    AuditLogRead,
    TicketAnalytics,
    TicketCreate,
    TicketRead,
    TicketUpdate,
)
from app.services.ticket_intelligence_service import analyze_ticket
from app.utils.dependencies import get_current_user

router = APIRouter()


def write_audit_log(db: Session, user_id: int, action: str, details: str, ticket_id: int | None = None):
    db.add(
        AuditLog(
            user_id=user_id,
            ticket_id=ticket_id,
            action=action,
            details=details,
        )
    )


@router.post("/", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    intelligence = analyze_ticket(payload.title, payload.description)
    ticket = Ticket(
        user_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        customer_email=str(payload.customer_email) if payload.customer_email else None,
        category=intelligence.category,
        priority=intelligence.priority,
        routed_team=intelligence.routed_team,
        suggested_response=intelligence.suggested_response,
    )

    db.add(ticket)
    db.flush()
    write_audit_log(
        db,
        user_id=current_user.id,
        ticket_id=ticket.id,
        action="ticket.created",
        details=f"Created ticket categorized as {ticket.category}, priority {ticket.priority}, routed to {ticket.routed_team}.",
    )
    db.commit()
    db.refresh(ticket)

    return ticket


@router.get("/", response_model=list[TicketRead])
def list_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Ticket)
        .filter(Ticket.user_id == current_user.id)
        .order_by(Ticket.created_at.desc())
        .all()
    )


@router.patch("/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id, Ticket.user_id == current_user.id)
        .first()
    )

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    changes = []

    if payload.status and payload.status != ticket.status:
        changes.append(f"status {ticket.status} -> {payload.status}")
        ticket.status = payload.status

    if payload.routed_team and payload.routed_team != ticket.routed_team:
        changes.append(f"team {ticket.routed_team} -> {payload.routed_team}")
        ticket.routed_team = payload.routed_team

    if changes:
        write_audit_log(
            db,
            user_id=current_user.id,
            ticket_id=ticket.id,
            action="ticket.updated",
            details="; ".join(changes),
        )
        db.commit()
        db.refresh(ticket)

    return ticket


@router.get("/analytics", response_model=TicketAnalytics)
def get_ticket_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tickets = db.query(Ticket).filter(Ticket.user_id == current_user.id).all()
    status_counts = Counter(ticket.status for ticket in tickets)
    category_counts = Counter(ticket.category for ticket in tickets)
    team_counts = Counter(ticket.routed_team for ticket in tickets)

    return {
        "total": len(tickets),
        "open": status_counts["open"],
        "in_progress": status_counts["in_progress"],
        "resolved": status_counts["resolved"],
        "closed": status_counts["closed"],
        "high_priority": sum(1 for ticket in tickets if ticket.priority == "High"),
        "category_counts": dict(category_counts),
        "team_counts": dict(team_counts),
    }


@router.get("/manager")
def get_manager_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tickets = db.query(Ticket).filter(Ticket.user_id == current_user.id).all()
    unresolved = [ticket for ticket in tickets if ticket.status not in {"resolved", "closed"}]
    high_priority_open = [
        ticket for ticket in unresolved if ticket.priority == "High"
    ]

    return {
        "unresolved_count": len(unresolved),
        "high_priority_open": len(high_priority_open),
        "routing_load": dict(Counter(ticket.routed_team for ticket in unresolved)),
        "attention_queue": [
            {
                "id": ticket.id,
                "title": ticket.title,
                "priority": ticket.priority,
                "category": ticket.category,
                "routed_team": ticket.routed_team,
                "status": ticket.status,
            }
            for ticket in high_priority_open[:5]
        ],
    }


@router.get("/audit-log", response_model=list[AuditLogRead])
def get_audit_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .limit(100)
        .all()
    )
