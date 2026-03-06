"""Pydantic schemas for auth endpoints."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class MfaVerifyRequest(BaseModel):
    email: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    name: str
    mfa_required: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    email: str
    name: str
    role: str
    department: str
    is_active: bool
