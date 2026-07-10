from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "uploads"

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if value == "dev_secret" or len(value) < 32:
            raise ValueError("JWT_SECRET_KEY must be a strong secret with at least 32 characters")

        return value

    class Config:
        env_file = ".env"

settings = Settings()
