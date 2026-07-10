from fastapi import UploadFile
from openai import OpenAI

from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def transcribe_audio(file: UploadFile) -> str:
    file.file.seek(0)
    response = client.audio.transcriptions.create(
        model=settings.TRANSCRIPTION_MODEL,
        file=(file.filename or "recording.webm", file.file, file.content_type or "audio/webm"),
        response_format="text",
    )

    if isinstance(response, str):
        return response.strip()

    return response.text.strip()
