"""
Store for citizen documents (PostgreSQL-backed via SQLAlchemy).

Functions:
  get_user_documents(user_id: str) -> dict
  save_user_documents(user_id: str, available_docs: list, custom_docs: list) -> dict
"""

import uuid
from typing import List, Dict, Any
from sqlalchemy import text

from database import SessionLocal


def get_user_documents(user_id: str) -> Dict[str, Any]:
    """
    Return the saved document availability and custom documents for the user.
    Returns empty lists if no record exists yet.
    """
    sql = text("SELECT available_docs, custom_docs FROM citizen_documents WHERE user_id = :user_id")

    with SessionLocal() as db:
        row = db.execute(sql, {"user_id": user_id}).mappings().first()

    if row is None:
        return {"available_docs": [], "custom_docs": []}

    avail = row.get("available_docs") or []
    custom = row.get("custom_docs") or []

    if isinstance(avail, str):
        import json
        avail = json.loads(avail)
    if isinstance(custom, str):
        import json
        custom = json.loads(custom)

    return {
        "available_docs": list(avail),
        "custom_docs": list(custom),
    }


def save_user_documents(
    user_id: str,
    available_docs: List[str],
    custom_docs: List[str],
) -> Dict[str, Any]:
    """
    Upsert the citizen's document list in PostgreSQL in-place.
    Zero duplicate rows per user_id.
    """
    import json
    avail_json = json.dumps(available_docs)
    custom_json = json.dumps(custom_docs)
    new_id = str(uuid.uuid4())

    upsert_sql = text("""
        INSERT INTO citizen_documents (id, user_id, available_docs, custom_docs, created_at, updated_at)
        VALUES (:id, :user_id, CAST(:available_docs AS jsonb), CAST(:custom_docs AS jsonb), NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            available_docs = EXCLUDED.available_docs,
            custom_docs = EXCLUDED.custom_docs,
            updated_at = NOW()
        RETURNING available_docs, custom_docs;
    """)

    with SessionLocal() as db:
        result = db.execute(
            upsert_sql,
            {
                "id": new_id,
                "user_id": user_id,
                "available_docs": avail_json,
                "custom_docs": custom_json,
            },
        ).mappings().first()
        db.commit()

    saved_avail = result["available_docs"] if result else available_docs
    saved_custom = result["custom_docs"] if result else custom_docs

    if isinstance(saved_avail, str):
        saved_avail = json.loads(saved_avail)
    if isinstance(saved_custom, str):
        saved_custom = json.loads(saved_custom)

    return {
        "available_docs": list(saved_avail),
        "custom_docs": list(saved_custom),
    }
