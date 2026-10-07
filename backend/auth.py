"""Account endpoints: sign up, log in, and 'who am I'.

A public user shape never includes password_hash, so hashes stay server-side only.
"""

import sqlite3

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, field_validator

from db import connect_ro, connect_rw
from security import hash_password, issue_token, verify_password, verify_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    @field_validator("first_name", "last_name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field is required.")
        return v

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PublicUser(BaseModel):
    id: int
    first_name: str | None
    last_name: str | None
    email: str


class AuthResponse(BaseModel):
    token: str
    user: PublicUser


def public_user(row: sqlite3.Row) -> PublicUser:
    return PublicUser(
        id=row["id"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        email=row["email"],
    )


def current_user(authorization: str | None = Header(default=None)) -> PublicUser:
    """Resolve the logged-in user from a Bearer token, or 401."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = verify_token(authorization.split(" ", 1)[1].strip())
    if user_id is None:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    with connect_ro() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Account not found")
    return public_user(row)


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(body: SignupRequest) -> AuthResponse:
    full_name = f"{body.first_name} {body.last_name}"
    email = body.email.lower()
    with connect_rw() as conn:
        exists = conn.execute(
            "SELECT 1 FROM users WHERE email = ? COLLATE NOCASE", (email,)
        ).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="An account with that email already exists.")
        cursor = conn.execute(
            """
            INSERT INTO users (name, email, password_hash, first_name, last_name)
            VALUES (?, ?, ?, ?, ?)
            """,
            (full_name, email, hash_password(body.password), body.first_name, body.last_name),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
    user = public_user(row)
    return AuthResponse(token=issue_token(user.id), user=user)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    with connect_ro() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? COLLATE NOCASE", (body.email.lower(),)
        ).fetchone()
    # Same error whether the email is unknown or the password is wrong, so the response
    # never reveals which emails have accounts.
    if row is None or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    user = public_user(row)
    return AuthResponse(token=issue_token(user.id), user=user)


@router.get("/me", response_model=PublicUser)
def me(user: PublicUser = Depends(current_user)) -> PublicUser:
    return user
