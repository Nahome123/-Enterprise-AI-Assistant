import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.answer_source import AnswerSource
from app.schemas.document_schema import DocumentResponse, TextDocumentCreate
from app.utils.dependencies import get_current_user
from app.services.document_parser import extract_text
from app.services.chunking_service import chunk_text
from app.services.embedding_service import create_embedding

router = APIRouter()

ALLOWED_TYPES = ["pdf", "txt", "docx", "png", "jpg", "jpeg", "webp", "tif", "tiff"]

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lstrip(".").lower()

def save_upload_file(file: UploadFile, file_extension: str) -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    stored_filename = f"{uuid4().hex}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path

def save_text_file(content: str) -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid4().hex}.txt")

    with open(file_path, "w", encoding="utf-8") as text_file:
        text_file.write(content)

    return file_path

def process_document(db: Session, document: Document) -> Document:
    try:
        extracted_pages = extract_text(document.file_path, document.file_type)

        chunk_index = 0

        for page in extracted_pages:
            page_number = page.get("page_number")
            page_text = page.get("text", "")

            chunks = chunk_text(page_text)

            for chunk in chunks:
                embedding = create_embedding(chunk)

                document_chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_text=chunk,
                    chunk_index=chunk_index,
                    page_number=page_number,
                    embedding=embedding
                )

                db.add(document_chunk)
                chunk_index += 1

        document.status = "completed"
        db.commit()
        db.refresh(document)

    except Exception:
        document.status = "failed"
        db.commit()
        db.refresh(document)

    return document

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    original_filename = Path(file.filename or "").name
    file_extension = get_file_extension(original_filename)

    if file_extension not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_path = save_upload_file(file, file_extension)

    document = Document(
        user_id=current_user.id,
        file_name=original_filename,
        file_type=file_extension,
        file_path=file_path,
        status="processing"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return process_document(db, document)

@router.post("/text", response_model=DocumentResponse)
def create_text_document(
    payload: TextDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    safe_title = " ".join(payload.title.strip().split())
    file_name = f"{safe_title}.txt"
    file_path = save_text_file(payload.content.strip())

    document = Document(
        user_id=current_user.id,
        file_name=file_name,
        file_type="txt",
        file_path=file_path,
        status="processing"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return process_document(db, document)

@router.get("/", response_model=list[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.uploaded_at.desc()).all()

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id
    ).all()
    chunk_ids = [chunk.id for chunk in chunks]

    if chunk_ids:
        db.query(AnswerSource).filter(
            AnswerSource.chunk_id.in_(chunk_ids)
        ).delete(synchronize_session=False)

    db.query(AnswerSource).filter(
        AnswerSource.document_id == document.id
    ).delete(synchronize_session=False)

    db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id
    ).delete(synchronize_session=False)

    file_path = document.file_path
    db.delete(document)
    db.commit()

    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
