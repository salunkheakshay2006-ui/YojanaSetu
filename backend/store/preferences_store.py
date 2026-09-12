"""
Store for citizen goals and preferences (PostgreSQL-backed via SQLAlchemy).

Uses the authoritative VALID_GOAL_IDS defined in the optimizer service:
  - "education"
  - "employment"
  - "healthcare"
  - "skill_development"
  - "housing"
  - "agriculture"
  - "business"
  - "food_security"
  - "pension"
  - "disability_support"

Functions:
  get_user_preferences(user_id: str) -> List[str]
  save_user_preferences(user_id: str, goals: List[str]) -> List[str]
"""

import uuid
from typing import List, Optional
import json
from sqlalchemy import text

from database import SessionLocal
from services.optimizer import VALID_GOAL_IDS


def validate_goals(goals: List[str]) -> Optional[str]:
    """
    Validate a list of goals against the authoritative VALID_GOAL_IDS.
    Returns None if all are valid, or an error message string if any are invalid.
    """
    if not isinstance(goals, list):
        return "Goals must be provided as a list of goal identifiers."

    for g in goals:
        if not isinstance(g, str) or g not in VALID_GOAL_IDS:
            valid_list = ", ".join(sorted(VALID_GOAL_IDS))
            return f"Invalid goal '{g}'. Allowed goals are: {valid_list}."

    return None


def get_user_preferences(user_id: str) -> List[str]:
    """
    Return the saved list of goals for the authenticated user.
    Returns an empty list if no preferences record exists yet.
    """
    from models.citizen_preferences_orm import CitizenPreferencesTable

    with SessionLocal() as db:
        record = db.query(CitizenPreferencesTable).filter_by(user_id=user_id).first()
        if record and record.goals is not None:
            goals_val = record.goals
            if isinstance(goals_val, str):
                try:
                    return json.loads(goals_val)
                except Exception:
                    return []
            return list(goals_val)

    return []


def save_user_preferences(user_id: str, goals: List[str]) -> List[str]:
    """
    Create or update citizen preferences for user_id.
    Enforces at most one record per user via unique constraint on user_id.
    """
    from datetime import datetime, timezone
    from models.citizen_preferences_orm import CitizenPreferencesTable

    with SessionLocal() as db:
        record = db.query(CitizenPreferencesTable).filter_by(user_id=user_id).first()
        if record:
            record.goals = goals
            record.updated_at = datetime.now(timezone.utc)
        else:
            record = CitizenPreferencesTable(
                id=str(uuid.uuid4()),
                user_id=user_id,
                goals=goals,
            )
            db.add(record)
        db.commit()

    return goals
