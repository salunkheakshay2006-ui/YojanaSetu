"""
In-memory citizen store.

This module is the ONLY place that knows where citizen data lives.
When you add PostgreSQL later, replace only this file -- the routers
and models stay exactly the same.
"""

from typing import Optional

from models.citizen import CitizenProfile

# Simple dict acting as our temporary database.
# Key   = citizen id (str UUID)
# Value = plain dict (serialised CitizenProfile)
_db: dict[str, dict] = {}


def save_citizen(profile: CitizenProfile) -> CitizenProfile:
    """Persist a citizen profile and return it."""
    _db[profile.id] = profile.model_dump(mode="json")
    return profile


def get_citizen(citizen_id: str) -> Optional[CitizenProfile]:
    """Return a CitizenProfile by id, or None if not found."""
    record = _db.get(citizen_id)
    if record is None:
        return None
    return CitizenProfile(**record)
