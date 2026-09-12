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
    from models.citizen_documents_orm import CitizenDocumentsTable
    import json

    with SessionLocal() as db:
        record = db.query(CitizenDocumentsTable).filter_by(user_id=user_id).first()
        if record is None:
            return {"available_docs": [], "custom_docs": []}

        avail = record.available_docs or []
        custom = record.custom_docs or []

        if isinstance(avail, str):
            try:
                avail = json.loads(avail)
            except Exception:
                avail = []
        if isinstance(custom, str):
            try:
                custom = json.loads(custom)
            except Exception:
                custom = []

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
    Upsert the citizen's document list in-place.
    Zero duplicate rows per user_id.
    """
    from datetime import datetime, timezone
    from models.citizen_documents_orm import CitizenDocumentsTable

    with SessionLocal() as db:
        record = db.query(CitizenDocumentsTable).filter_by(user_id=user_id).first()
        if record:
            record.available_docs = available_docs
            record.custom_docs = custom_docs
            record.updated_at = datetime.now(timezone.utc)
        else:
            record = CitizenDocumentsTable(
                id=str(uuid.uuid4()),
                user_id=user_id,
                available_docs=available_docs,
                custom_docs=custom_docs,
            )
            db.add(record)
        db.commit()

    return {
        "available_docs": list(available_docs),
        "custom_docs": list(custom_docs),
    }
