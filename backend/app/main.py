from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine

from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.answer_source import AnswerSource
from app.models.ticket import Ticket
from app.models.audit_log import AuditLog

from app.routes import auth, documents, search, chat, tickets, transcriptions


def init_database():
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    Base.metadata.create_all(bind=engine)


init_database()

app = FastAPI(
    title="Lumora",
    description="Backend API for document upload, semantic search, and AI-powered Q&A.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
app.include_router(transcriptions.router, prefix="/transcriptions", tags=["Transcriptions"])

@app.get("/")
def health_check():
    return {"status": "running"}


@app.get("/health")
def health_check_detailed():
    return {"status": "healthy"}
