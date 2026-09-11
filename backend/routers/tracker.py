"""
Application Tracker Router -- Protected application pipeline status API.

Endpoints:
  GET    /api/application-tracker               Get tracker statuses for authenticated caller
  POST   /api/application-tracker               Update or set status for a scheme
  DELETE /api/application-tracker/{scheme_id}   Remove tracker entry for a scheme

Statuses:
  - "Saved"
  - "Planning to Apply"
  - "Application Started"
  - "Submitted"

Security:
  Strictly requires Supabase JWT (Bearer <token>).
  All queries and modifications scoped directly to verified user.id.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.auth import get_current_user_required
from store import tracker_store

router = APIRouter(prefix="/api")


class UpdateTrackerRequest(BaseModel):
    scheme_id: str = Field(..., min_length=1, max_length=100)
    status: str = Field(..., min_length=1, max_length=32)


@router.get("/application-tracker")
def getApplicationTracker(current_user: dict = Depends(get_current_user_required)):
    """Return application tracker mapping { scheme_id_or_slug: status } for authenticated caller."""
    user_id = current_user["id"]
    tracker_data = tracker_store.get_user_tracker(user_id)

    return {
        "success": True,
        "message": f"Retrieved {len(tracker_data)} tracked scheme statuses.",
        "data": tracker_data,
    }


@router.post("/application-tracker")
def updateTrackerStatus(
    body: UpdateTrackerRequest,
    current_user: dict = Depends(get_current_user_required),
):
    """
    Update tracker status for a scheme for the authenticated caller.
    Rejects invalid statuses (returns 400).
    Rejects unknown schemes (returns 404).
    """
    if body.status not in tracker_store.VALID_TRACKER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status '{body.status}'. "
                f"Allowed statuses are: {', '.join(tracker_store.VALID_TRACKER_STATUSES)}."
            ),
        )

    user_id = current_user["id"]
    updated = tracker_store.set_tracker_status(user_id, body.scheme_id, body.status)

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{body.scheme_id}' was not found in the catalog.",
        )

    return {
        "success": True,
        "message": f"Status updated to '{body.status}' for '{updated['name']}'.",
        "data": updated,
    }


@router.delete("/application-tracker/{scheme_id}")
def removeTrackerEntry(
    scheme_id: str,
    current_user: dict = Depends(get_current_user_required),
):
    """
    Remove a tracker entry for the authenticated caller.
    Guarantees that User A cannot delete User B's tracker entry.
    """
    user_id = current_user["id"]
    deleted = tracker_store.delete_tracker_entry(user_id, scheme_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme '{scheme_id}' is not in your application tracker.",
        )

    return {
        "success": True,
        "message": "Scheme removed from application tracker.",
        "data": {"scheme_id": scheme_id},
    }
