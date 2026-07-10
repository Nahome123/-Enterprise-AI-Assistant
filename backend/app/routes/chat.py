from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.answer_source import AnswerSource
from app.schemas.chat_schema import ChatRequest
from app.services.rag_service import generate_answer
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.post("/")
def chat_with_documents(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == payload.session_id,
            ChatSession.user_id == current_user.id
        ).first()
    else:
        session = None

    if not session:
        session = ChatSession(
            user_id=current_user.id,
            title=payload.question[:50]
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        message=payload.question
    )

    db.add(user_message)
    db.commit()

    rag_result = generate_answer(
        db,
        payload.question,
        user_id=current_user.id,
        language=payload.language,
    )

    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        message=rag_result["answer"]
    )

    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    for source in rag_result["sources"]:
        answer_source = AnswerSource(
            chat_message_id=assistant_message.id,
            document_id=source["document_id"],
            chunk_id=source["chunk_id"],
            similarity_score=source["distance"]
        )

        db.add(answer_source)

    db.commit()

    return {
        "answer": rag_result["answer"],
        "session_id": session.id,
        "language": payload.language,
        "sources": rag_result["sources"]
    }
@router.get("/sessions")
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()


@router.get("/sessions/{session_id}")
def get_chat_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        return {"detail": "Session not found"}

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return {
        "session": session,
        "messages": messages
    }
