"""
PostgreSQL-backed scheme store (via SQLAlchemy).

Public interface:
  get_all_schemes()          -> List[Scheme]
  get_scheme_by_id(id: str)  -> Optional[Scheme]
"""

from typing import List, Optional

from sqlalchemy import text

from database import SessionLocal
from models.scheme import Scheme


def get_all_schemes() -> List[Scheme]:
    """Return all schemes from the database, ordered by name."""
    sql = text("SELECT * FROM schemes ORDER BY name")

    with SessionLocal() as db:
        rows = db.execute(sql).mappings().all()

    return [Scheme(**row) for row in rows]


def get_scheme_by_id(scheme_id: str) -> Optional[Scheme]:
    """
    Return one scheme by its id, url slug, or name fallback.
    Returns None if not found.
    """
    # 1. Direct ID match
    sql_id = text("SELECT * FROM schemes WHERE id = :id")
    with SessionLocal() as db:
        row = db.execute(sql_id, {"id": scheme_id}).mappings().first()
        if row is not None:
            return Scheme(**row)

    # 2. Slug match (e.g. source_url ends with /pm-kisan)
    sql_slug = text("SELECT * FROM schemes WHERE LOWER(source_url) LIKE LOWER(:slug_pattern)")
    with SessionLocal() as db:
        row = db.execute(sql_slug, {"slug_pattern": f"%/{scheme_id}"}).mappings().first()
        if row is not None:
            return Scheme(**row)

    # 3. Exact name match fallback
    sql_name = text("SELECT * FROM schemes WHERE LOWER(name) LIKE LOWER(:name)")
    with SessionLocal() as db:
        row = db.execute(sql_name, {"name": scheme_id}).mappings().first()
        if row is not None:
            return Scheme(**row)

    return None
