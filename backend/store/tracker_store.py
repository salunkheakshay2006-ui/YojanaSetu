"""
Store for application tracker (PostgreSQL-backed via SQLAlchemy).

Valid statuses:
  - "Saved"
  - "Planning to Apply"
  - "Application Started"
  - "Submitted"

Functions:
  get_user_tracker(user_id: str) -> dict
  set_tracker_status(user_id: str, scheme_id: str, status: str) -> Optional[dict]
  delete_tracker_entry(user_id: str, scheme_id: str) -> bool
  delete_orphan_trackers(user_id: str) -> int
"""

import uuid
from typing import Dict, Optional
from sqlalchemy import text

from database import SessionLocal
from store.scheme_store import get_scheme_by_id

VALID_TRACKER_STATUSES = [
    "Saved",
    "Planning to Apply",
    "Application Started",
    "Submitted",
]


def get_user_tracker(user_id: str) -> Dict[str, str]:
    """
    Return a mapping of { scheme_id_or_slug: status } for the authenticated user.
    Only returns tracker records for schemes that are currently saved by the user
    (maintaining M8 business rule: no orphan tracker entries).
    """
    sql = text("""
        SELECT at.scheme_id, at.status, s.source_url
        FROM application_tracker at
        JOIN saved_schemes ss ON at.user_id = ss.user_id AND at.scheme_id = ss.scheme_id
        LEFT JOIN schemes s ON at.scheme_id = s.id
        WHERE at.user_id = :user_id
    """)

    with SessionLocal() as db:
        rows = db.execute(sql, {"user_id": user_id}).mappings().all()

    tracker_map = {}
    for r in rows:
        status = r["status"]
        canonical_id = r["scheme_id"]
        tracker_map[canonical_id] = status
        # Also populate slug key if available for frontend compatibility
        if r.get("source_url"):
            slug = r["source_url"].rstrip("/").split("/")[-1].lower()
            tracker_map[slug] = status

    return tracker_map


def set_tracker_status(user_id: str, scheme_id: str, status: str) -> Optional[dict]:
    """
    Create or update tracker status for a user and scheme.
    Requirements:
      1. status must be one of VALID_TRACKER_STATUSES.
      2. scheme must exist in catalog.
      3. scheme must be currently saved by the user (or automatically added if required).
    """
    if status not in VALID_TRACKER_STATUSES:
        return None

    scheme = get_scheme_by_id(scheme_id)
    if scheme is None:
        return None

    canonical_id = scheme.id
    record_id = str(uuid.uuid4())

    from datetime import datetime, timezone
    from models.saved_scheme_orm import SavedSchemeTable
    from models.application_tracker_orm import ApplicationTrackerTable

    with SessionLocal() as db:
        # Ensure the scheme is in saved_schemes so tracker never tracks unsaved schemes
        saved = db.query(SavedSchemeTable).filter_by(user_id=user_id, scheme_id=canonical_id).first()
        if not saved:
            db.add(SavedSchemeTable(id=str(uuid.uuid4()), user_id=user_id, scheme_id=canonical_id))
        
        # Upsert application tracker entry
        tracker = db.query(ApplicationTrackerTable).filter_by(user_id=user_id, scheme_id=canonical_id).first()
        if tracker:
            tracker.status = status
            tracker.updated_at = datetime.now(timezone.utc)
        else:
            tracker = ApplicationTrackerTable(
                id=record_id,
                user_id=user_id,
                scheme_id=canonical_id,
                status=status,
            )
            db.add(tracker)
        db.commit()

    slug = scheme.source_url.rstrip("/").split("/")[-1].lower() if scheme.source_url else canonical_id

    return {
        "scheme_id": canonical_id,
        "slug": slug,
        "name": scheme.name,
        "status": status,
    }


def delete_tracker_entry(user_id: str, scheme_id: str) -> bool:
    """
    Remove a tracker entry for user_id and scheme_id.
    Ensures User A cannot delete User B's tracker entry.
    """
    scheme = get_scheme_by_id(scheme_id)
    target_ids = [scheme_id]
    if scheme and scheme.id not in target_ids:
        target_ids.append(scheme.id)

    from models.application_tracker_orm import ApplicationTrackerTable

    with SessionLocal() as db:
        deleted = db.query(ApplicationTrackerTable).filter(
            ApplicationTrackerTable.user_id == user_id,
            ApplicationTrackerTable.scheme_id.in_(target_ids)
        ).delete(synchronize_session=False)
        db.commit()
        return deleted > 0
