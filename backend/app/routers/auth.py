"""Authentication router — login, MFA verify, refresh, me."""

import re
from fastapi import APIRouter, HTTPException, Depends, status

from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from app.models.users import get_user
from app.schemas.auth import (
    LoginRequest,
    MfaVerifyRequest,
    TokenResponse,
    RefreshRequest,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Temporary store for pending MFA sessions (in-memory, demo only)
_pending_mfa: dict[str, dict] = {}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = get_user(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account is disabled")

    if user["mfa_required"]:
        # Store pending session, return indicator
        _pending_mfa[body.email.lower()] = user
        return TokenResponse(
            access_token="",
            refresh_token="",
            role=user["role"],
            name=user["name"],
            mfa_required=True,
        )

    return _issue_tokens(user)


@router.post("/mfa-verify", response_model=TokenResponse)
def mfa_verify(body: MfaVerifyRequest):
    user = _pending_mfa.pop(body.email.lower(), None)
    if not user:
        raise HTTPException(status_code=400, detail="No pending MFA session")
    if not re.match(r"^\d{6}$", body.code):
        _pending_mfa[body.email.lower()] = user  # keep session alive
        raise HTTPException(status_code=401, detail="Invalid code. Enter 6 digits.")
    return _issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = get_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return _issue_tokens(user)


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    user = get_user(current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
        email=user["email"],
        name=user["name"],
        role=user["role"],
        department=user["department"],
        is_active=user["is_active"],
    )


def _issue_tokens(user: dict) -> TokenResponse:
    claims = {"sub": user["email"], "role": user["role"], "name": user["name"]}
    return TokenResponse(
        access_token=create_access_token(claims),
        refresh_token=create_refresh_token(claims),
        role=user["role"],
        name=user["name"],
    )
