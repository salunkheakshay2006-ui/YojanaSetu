"""
PostgreSQL-backed citizen store (via SQLAlchemy).

Exposes the same public interface as the original in-memory store:
  save_citizen(profile: CitizenProfile) -> CitizenProfile
  get_citizen(citizen_id: str)          -> Optional[CitizenProfile]

Only this file changed -- routers and models are untouched.
"""

from typing import Optional

from sqlalchemy import text

from database import SessionLocal
from models.citizen import CitizenProfile


def save_citizen(profile: CitizenProfile) -> CitizenProfile:
    """Persist a citizen profile to PostgreSQL and return it."""
    data = profile.model_dump(mode="json")

    columns = ", ".join(data.keys())
    placeholders = ", ".join(f":{k}" for k in data.keys())
    sql = text(
        f"INSERT INTO citizens ({columns}) VALUES ({placeholders}) "
        f"ON CONFLICT (id) DO NOTHING"
    )

    with SessionLocal() as db:
        db.execute(sql, data)
        db.commit()

    return profile


def get_citizen(citizen_id: str) -> Optional[CitizenProfile]:
    """Return a CitizenProfile by id, or None if not found."""
    sql = text("SELECT * FROM citizens WHERE id = :id")

    with SessionLocal() as db:
        row = db.execute(sql, {"id": citizen_id}).mappings().first()

    if row is None:
        return None
    return CitizenProfile(**row)


def get_citizen_by_user_id(user_id: str) -> Optional[CitizenProfile]:
    """Return the most recent CitizenProfile belonging to an authenticated Supabase user."""
    sql = text("SELECT * FROM citizens WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1")

    with SessionLocal() as db:
        row = db.execute(sql, {"user_id": user_id}).mappings().first()

    if row is None:
        return None
    return CitizenProfile(**row)


def update_citizen_for_user(user_id: str, profile_id: str, updated_data: dict) -> CitizenProfile:
    """Update an existing citizen record for the authenticated user and return it."""
    set_clauses = [f"{k} = :{k}" for k in updated_data.keys() if k not in ("id", "user_id")]
    sql = text(f"""
        UPDATE citizens
        SET {", ".join(set_clauses)}
        WHERE id = :id AND user_id = :user_id
    """)

    params = {**updated_data, "id": profile_id, "user_id": user_id}

    with SessionLocal() as db:
        db.execute(sql, params)
        db.commit()

    return get_citizen(profile_id)
