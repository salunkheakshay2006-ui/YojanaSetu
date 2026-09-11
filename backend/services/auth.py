"""
Supabase Auth token verification service for FastAPI backend.

Verifies Supabase JWT access tokens against the official Supabase Auth API
using httpx (already installed in the environment).

Never trusts client-supplied user_id parameters.
Extracts and validates authoritative user identity directly from Supabase.
"""

import os
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import Header, HTTPException, status

# Load environment variables from backend/.env or fallback to frontend/.env
load_dotenv(Path(__file__).parent.parent / ".env")
supabase_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_anon_key:
    # Try reading from frontend/.env if not present in backend/.env
    frontend_env = Path(__file__).parent.parent.parent / "frontend" / ".env"
    if frontend_env.exists():
        load_dotenv(frontend_env)
        supabase_url = supabase_url or os.getenv("VITE_SUPABASE_URL")
        supabase_anon_key = supabase_anon_key or os.getenv("VITE_SUPABASE_ANON_KEY")


def verify_supabase_token(access_token: str) -> dict:
    """
    Validate a Supabase JWT access token by calling Supabase's /auth/v1/user endpoint.
    Returns the user dict if valid; raises HTTPException(401) if invalid or expired.
    """
    if not supabase_url or not supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Auth is not configured on the backend server.",
        )

    headers = {
        "apikey": supabase_anon_key,
        "Authorization": f"Bearer {access_token}",
    }

    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{supabase_url}/auth/v1/user", headers=headers)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach authentication service. Please try again later.",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session. Please sign in again.",
        )

    user_data = resp.json()
    if not user_data or "id" not in user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: user record missing from token.",
        )

    return user_data


def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Optional authentication dependency.
    If Authorization header is present (Bearer <token>), verifies it and returns user dict.
    If no Authorization header is provided, returns None (allows guest / demo access).
    If an invalid token is provided, raises HTTP 401.
    """
    if not authorization:
        return None

    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must follow format 'Bearer <token>'.",
        )

    token = parts[1]
    return verify_supabase_token(token)


def get_current_user_required(authorization: Optional[str] = Header(None)) -> dict:
    """
    Strict authentication dependency.
    Requires a valid Supabase access token in Authorization: Bearer <token>.
    Raises HTTP 401 if missing or invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
        )

    user = get_current_user_optional(authorization)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
        )
    return user
