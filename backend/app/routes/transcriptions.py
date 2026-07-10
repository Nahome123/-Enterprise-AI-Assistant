from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.models.user import User
from app.services.transcription_service import transcribe_audio
from app.utils.dependencies import get_current_user

router = APIRouter()

ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/ogg",
}

MAX_AUDIO_BYTES = 25 * 1024 * 1024


@router.post("/")
async def create_transcription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported audio format. Record in the browser or upload WEBM, WAV, MP3, M4A, MP4, or OGG audio.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Audio file is empty.")

    if len(contents) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Audio file must be 25 MB or smaller.")

    file.file.seek(0)

    try:
        transcript = transcribe_audio(file)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to transcribe audio. Check the OpenAI API configuration and try again.",
        ) from exc

    if not transcript:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No speech was detected in the audio.")

    return {"text": transcript}
