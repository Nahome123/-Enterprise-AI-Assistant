from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt
from app.config import settings

def hash_password(password: str):
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError("Password must be 72 bytes or fewer")

    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str):
    password_bytes = plain_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    })

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
