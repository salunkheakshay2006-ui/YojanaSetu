"""
Saved Schemes Router -- Protected user bookmarks API.

Endpoints:
  GET    /api/saved-schemes             List saved schemes for authenticated caller
  POST   /api/saved-schemes             Save a scheme for authenticated caller
  DELETE /api/saved-schemes/{scheme_id} Remove a saved scheme for authenticated caller

Security:
  All endpoints strictly require a valid Supabase access token (Bearer <token>).
  User identity is resolved exclusively via services.auth.get_current_user_required.
  Client-supplied user_id parameters are never accepted or used.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.auth import get_current_user_required
from store import saved_scheme_store

router = APIRouter(prefix="/api")


class SaveSchemeRequest(BaseModel):
    scheme_id: str = Field(..., min_length=1, max_length=100)


@router.get("/saved-schemes")
def getSavedSchemes(current_user: dict = Depends(get_current_user_required)):
    """Return all saved schemes belonging to the authenticated caller."""
    user_id = current_user["id"]
    schemes = saved_scheme_store.get_user_saved_schemes(user_id)

    return {
        "success": True,
        "message": f"Retrieved {len(schemes)} saved schemes.",
        "data": schemes,
    }


@router.post("/saved-schemes", status_code=201)
def saveScheme(
    body: SaveSchemeRequest,
    current_user: dict = Depends(get_current_user_required),
):
    """
    Save a scheme for the authenticated caller.
    Validates scheme_id against the government schemes catalog.
    Prevents duplicates via UNIQUE(user_id, scheme_id).
    """
    user_id = current_user["id"]
    saved = saved_scheme_store.save_user_scheme(user_id, body.scheme_id)

    if saved is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{body.scheme_id}' was not found in the catalog.",
        )

    return {
        "success": True,
        "message": f"Scheme '{saved['name']}' saved successfully.",
        "data": saved,
    }


@router.delete("/saved-schemes/{scheme_id}")
def removeSavedScheme(
    scheme_id: str,
    current_user: dict = Depends(get_current_user_required),
):
    """
    Remove a saved scheme for the authenticated caller.
    Guarantees that User A cannot delete User B's saved schemes.
    """
    user_id = current_user["id"]
    deleted = saved_scheme_store.delete_user_saved_scheme(user_id, scheme_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme '{scheme_id}' is not in your saved list.",
        )

    return {
        "success": True,
        "message": "Scheme removed from saved list.",
        "data": {"scheme_id": scheme_id},
    }
