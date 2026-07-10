from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "uploads"
    TRANSCRIPTION_MODEL: str = "gpt-4o-mini-transcribe"
    FRONTEND_URL: str = "http://127.0.0.1:5173"
    BACKEND_CORS_ORIGINS: str = "http://127.0.0.1:5173,http://localhost:5173"
    PUBLIC_BACKEND_URL: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    MICROSOFT_CLIENT_ID: Optional[str] = None
    MICROSOFT_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    @model_validator(mode="after")
    def normalize_database_url(self):
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)

        return self

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if value == "dev_secret" or len(value) < 32:
            raise ValueError("JWT_SECRET_KEY must be a strong secret with at least 32 characters")

        return value

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    class Config:
        env_file = ".env"

settings = Settings()
