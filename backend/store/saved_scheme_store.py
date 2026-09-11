"""
Store for user saved schemes (PostgreSQL-backed via SQLAlchemy).

Provides methods:
  get_user_saved_schemes(user_id: str) -> List[dict]
  save_user_scheme(user_id: str, scheme_id: str) -> dict
  delete_user_saved_scheme(user_id: str, scheme_id: str) -> bool
"""

import uuid
from typing import List, Optional
from sqlalchemy import text

from database import SessionLocal
from store.scheme_store import get_scheme_by_id


def get_user_saved_schemes(user_id: str) -> List[dict]:
    """
    Return full scheme objects for all schemes bookmarked by user_id,
    ordered by save date (newest first).
    """
    sql = text("""
        SELECT ss.id as saved_id, ss.scheme_id, ss.created_at as saved_at,
               s.name, s.category, s.description, s.benefit, s.source_url,
               s.scope, s.source, s.last_verified, s.documents_summary,
               s.min_age, s.max_age, s.min_income, s.max_income,
               s.gender, s.occupation, s.caste_eligibility,
               s.is_student_required, s.is_farmer_required, s.is_disabled_required
        FROM saved_schemes ss
        JOIN schemes s ON ss.scheme_id = s.id
        WHERE ss.user_id = :user_id
        ORDER BY ss.created_at DESC
    """)

    with SessionLocal() as db:
        rows = db.execute(sql, {"user_id": user_id}).mappings().all()

    results = []
    for r in rows:
        row_dict = dict(r)
        slug = row_dict["source_url"].rstrip("/").split("/")[-1].lower() if row_dict.get("source_url") else row_dict["scheme_id"]
        # Ensure id, scheme_id, and slug are present for frontend card / modal compatibility
        row_dict["id"] = row_dict["scheme_id"]
        row_dict["scheme_id"] = row_dict["scheme_id"]
        row_dict["slug"] = slug
        if row_dict.get("saved_at"):
            row_dict["saved_at"] = row_dict["saved_at"].isoformat()
        results.append(row_dict)

    return results


def save_user_scheme(user_id: str, scheme_id: str) -> Optional[dict]:
    """
    Save a scheme for user_id.
    If scheme does not exist in schemes catalog, returns None.
    If already saved (ON CONFLICT), does nothing and returns existing record info.
    """
    scheme = get_scheme_by_id(scheme_id)
    if scheme is None:
        return None

    record_id = str(uuid.uuid4())
    canonical_id = scheme.id

    sql = text("""
        INSERT INTO saved_schemes (id, user_id, scheme_id, created_at)
        VALUES (:id, :user_id, :scheme_id, NOW())
        ON CONFLICT (user_id, scheme_id) DO NOTHING
    """)

    with SessionLocal() as db:
        db.execute(sql, {"id": record_id, "user_id": user_id, "scheme_id": canonical_id})
        db.commit()

    return {
        "id": canonical_id,
        "scheme_id": scheme_id,
        "name": scheme.name,
        "category": scheme.category,
    }


def delete_user_saved_scheme(user_id: str, scheme_id: str) -> bool:
    """
    Remove a saved scheme for user_id.
    Returns True if a row was deleted, False if no such row was found.
    Ensures User A cannot delete User B's saved scheme.
    """
    scheme = get_scheme_by_id(scheme_id)
    target_ids = [scheme_id]
    if scheme and scheme.id not in target_ids:
        target_ids.append(scheme.id)

    sql_saved = text("""
        DELETE FROM saved_schemes
        WHERE user_id = :user_id AND scheme_id = ANY(:target_ids)
    """)
    sql_tracker = text("""
        DELETE FROM application_tracker
        WHERE user_id = :user_id AND scheme_id = ANY(:target_ids)
    """)

    with SessionLocal() as db:
        # Also clean up any corresponding tracker entry (M8 business rule: no orphan tracker entries)
        db.execute(sql_tracker, {"user_id": user_id, "target_ids": target_ids})
        result = db.execute(sql_saved, {"user_id": user_id, "target_ids": target_ids})
        db.commit()
        return result.rowcount > 0
