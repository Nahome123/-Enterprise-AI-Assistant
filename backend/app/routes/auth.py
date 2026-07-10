import secrets
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter()

OAUTH_PROVIDERS = {
    "google": {
        "label": "Google",
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "scope": "openid email profile",
        "client_id": lambda: settings.GOOGLE_CLIENT_ID,
        "client_secret": lambda: settings.GOOGLE_CLIENT_SECRET,
    },
    "microsoft": {
        "label": "Microsoft",
        "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "userinfo_url": "https://graph.microsoft.com/oidc/userinfo",
        "scope": "openid email profile",
        "client_id": lambda: settings.MICROSOFT_CLIENT_ID,
        "client_secret": lambda: settings.MICROSOFT_CLIENT_SECRET,
    },
    "github": {
        "label": "GitHub",
        "auth_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "userinfo_url": "https://api.github.com/user",
        "emails_url": "https://api.github.com/user/emails",
        "scope": "read:user user:email",
        "client_id": lambda: settings.GITHUB_CLIENT_ID,
        "client_secret": lambda: settings.GITHUB_CLIENT_SECRET,
    },
}


def get_oauth_provider(provider: str):
    oauth_provider = OAUTH_PROVIDERS.get(provider)

    if not oauth_provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OAuth provider not supported")

    if not oauth_provider["client_id"]() or not oauth_provider["client_secret"]():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{oauth_provider['label']} OAuth is not configured.",
        )

    return oauth_provider


def get_redirect_uri(request: Request, provider: str) -> str:
    if settings.PUBLIC_BACKEND_URL:
        return f"{settings.PUBLIC_BACKEND_URL.rstrip('/')}/auth/oauth/{provider}/callback"

    return str(request.url_for("oauth_callback", provider=provider))


def create_oauth_state(provider: str) -> str:
    return create_access_token({
        "sub": "oauth-state",
        "provider": provider,
        "nonce": secrets.token_urlsafe(16),
    })


def validate_oauth_state(state_token: str, provider: str):
    try:
        payload = jwt.decode(state_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state") from error

    if payload.get("provider") != provider or payload.get("sub") != "oauth-state":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")


def exchange_oauth_code(provider: str, oauth_provider: dict, code: str, redirect_uri: str) -> str:
    response = requests.post(
        oauth_provider["token_url"],
        data={
            "client_id": oauth_provider["client_id"](),
            "client_secret": oauth_provider["client_secret"](),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        },
        headers={"Accept": "application/json"},
        timeout=15,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth token exchange failed")

    access_token = response.json().get("access_token")

    if not access_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth provider did not return an access token")

    return access_token


def fetch_oauth_profile(provider: str, oauth_provider: dict, access_token: str) -> dict:
    response = requests.get(
        oauth_provider["userinfo_url"],
        headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
        timeout=15,
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to read OAuth profile")

    profile = response.json()

    if provider == "github" and not profile.get("email"):
        email_response = requests.get(
            oauth_provider["emails_url"],
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            timeout=15,
        )

        if email_response.status_code < 400:
            primary_email = next((email for email in email_response.json() if email.get("primary") and email.get("verified")), None)
            profile["email"] = primary_email.get("email") if primary_email else None

    return profile


def get_or_create_oauth_user(db: Session, provider: str, profile: dict) -> User:
    email = (profile.get("email") or profile.get("preferred_username") or "").strip().lower()
    full_name = profile.get("name") or profile.get("login") or email.split("@")[0]

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth provider did not return an email address")

    user = db.query(User).filter(User.email == email).first()

    if user:
        return user

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(secrets.token_urlsafe(32)[:32]),
        role="user",
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            return existing_user

        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Unable to create OAuth user") from error

    db.refresh(user)

    return user

@router.post("/register", response_model=UserResponse)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    try:
        password_hash = hash_password(payload.password)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=password_hash,
        role="user"
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        ) from error

    db.refresh(user)

    return user

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/oauth/{provider}/login")
def oauth_login(provider: str, request: Request):
    oauth_provider = get_oauth_provider(provider)
    redirect_uri = get_redirect_uri(request, provider)
    query = urlencode({
        "client_id": oauth_provider["client_id"](),
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": oauth_provider["scope"],
        "state": create_oauth_state(provider),
        "prompt": "select_account",
    })

    return RedirectResponse(f"{oauth_provider['auth_url']}?{query}")


@router.get("/oauth/{provider}/callback", name="oauth_callback")
def oauth_callback(
    provider: str,
    request: Request,
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    oauth_provider = get_oauth_provider(provider)
    validate_oauth_state(state, provider)
    redirect_uri = get_redirect_uri(request, provider)
    provider_access_token = exchange_oauth_code(provider, oauth_provider, code, redirect_uri)
    profile = fetch_oauth_profile(provider, oauth_provider, provider_access_token)
    user = get_or_create_oauth_user(db, provider, profile)
    app_access_token = create_access_token({"sub": str(user.id)})
    callback_query = urlencode({
        "token": app_access_token,
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    })

    return RedirectResponse(f"{settings.FRONTEND_URL.rstrip('/')}/oauth/callback?{callback_query}")
