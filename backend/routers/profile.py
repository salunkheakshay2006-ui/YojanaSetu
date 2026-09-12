"""
Profile router -- Citizen Profile API.

Routes
------
POST /api/profile         createCitizenProfile() (optionally authenticated)
GET  /api/profile/me      getMyCitizenProfile()  (strictly authenticated caller only)
GET  /api/profile/{id}    getCitizenProfile()
"""

from typing import Optional
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from models.citizen import CitizenCreate, CitizenProfile
from services.auth import get_current_user_optional, get_current_user_required
from store import memory as store

router = APIRouter(prefix="/api")


@router.post("/profile", status_code=201)
def createCitizenProfile(
    body: CitizenCreate,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Create or update a citizen profile and return it.
    If caller provides a valid Supabase bearer token:
      - If they already have a profile in the database, it updates their existing profile.
      - Otherwise, creates a new profile associated with their verified user_id.
    If no token is provided, user_id is None (preserves guest/demo tests).
    """
    verified_user_id = current_user["id"] if current_user else None

    if verified_user_id:
        existing = store.get_citizen_by_user_id(verified_user_id)
        if existing:
            updated_profile = store.update_citizen_for_user(
                user_id=verified_user_id,
                profile_id=existing.id,
                updated_data=body.model_dump(mode="json"),
            )
            return {
                "success": True,
                "message": "Profile updated successfully",
                "data": updated_profile.model_dump(mode="json"),
            }

    profile = CitizenProfile(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc),
        user_id=verified_user_id,
        **body.model_dump(),
    )
    store.save_citizen(profile)

    return {
        "success": True,
        "message": "Profile created successfully",
        "data": profile.model_dump(mode="json"),
    }


@router.get("/profile/me")
def getMyCitizenProfile(current_user: dict = Depends(get_current_user_required)):
    """
    Fetch the citizen profile belonging to the authenticated Supabase caller.
    Guarantees that User A cannot retrieve User B's profile:
    The lookup strictly searches by the verified token's user.id.
    """
    user_id = current_user["id"]
    profile = store.get_citizen_by_user_id(user_id)

    if profile is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "No citizen profile found for your account. Please complete your profile details.",
                "data": {},
            },
        )

    return {
        "success": True,
        "message": "Profile fetched successfully",
        "data": profile.model_dump(mode="json"),
    }


@router.get("/profile/{id}")
def getCitizenProfile(id: str):
    """Fetch a citizen profile by its id."""
    profile = store.get_citizen(id)

    if profile is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"No profile found with id '{id}'",
                "data": {},
            },
        )

    return {
        "success": True,
        "message": "Profile fetched successfully",
        "data": profile.model_dump(mode="json"),
    }
