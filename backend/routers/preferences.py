"""
Preferences Router -- Protected citizen goals & support preferences API.

Endpoints:
  GET  /api/preferences     Get authenticated caller's saved support goals
  POST /api/preferences     Save/update authenticated caller's support goals

Security:
  Strictly requires Supabase JWT (Bearer <token>).
  User identity resolved exclusively via services.auth.get_current_user_required.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.auth import get_current_user_required
from store import preferences_store

router = APIRouter(prefix="/api")


class PreferencesRequest(BaseModel):
    goals: List[str] = Field(default_factory=list)


@router.get("/preferences")
def getPreferences(current_user: dict = Depends(get_current_user_required)):
    """Return the saved support goals for the authenticated caller."""
    user_id = current_user["id"]
    saved_goals = preferences_store.get_user_preferences(user_id)

    return {
        "success": True,
        "message": f"Retrieved {len(saved_goals)} preferred goals.",
        "data": {
            "goals": saved_goals,
        },
    }


@router.post("/preferences")
def savePreferences(
    body: PreferencesRequest,
    current_user: dict = Depends(get_current_user_required),
):
    """
    Save or update support goals for the authenticated caller.
    Validates goal identifiers against the authoritative system taxonomy.
    """
    validation_error = preferences_store.validate_goals(body.goals)
    if validation_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation_error,
        )

    user_id = current_user["id"]
    saved = preferences_store.save_user_preferences(user_id, body.goals)

    return {
        "success": True,
        "message": f"Saved {len(saved)} preferred goals.",
        "data": {
            "goals": saved,
        },
    }
