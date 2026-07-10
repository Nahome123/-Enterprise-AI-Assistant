from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
