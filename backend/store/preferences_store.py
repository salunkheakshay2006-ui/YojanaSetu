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
    sql = text("SELECT goals FROM citizen_preferences WHERE user_id = :user_id")

    with SessionLocal() as db:
        row = db.execute(sql, {"user_id": user_id}).mappings().first()

    if row is None or row.get("goals") is None:
        return []

    goals_val = row["goals"]
    if isinstance(goals_val, str):
        try:
            return json.loads(goals_val)
        except Exception:
            return []
    return list(goals_val)


def save_user_preferences(user_id: str, goals: List[str]) -> List[str]:
    """
    Create or update citizen preferences for user_id.
    Enforces at most one record per user via ON CONFLICT (user_id).
    """
    record_id = str(uuid.uuid4())
    goals_json = json.dumps(goals)

    sql = text("""
        INSERT INTO citizen_preferences (id, user_id, goals, created_at, updated_at)
        VALUES (:id, :user_id, CAST(:goals AS JSONB), NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET goals = EXCLUDED.goals, updated_at = NOW()
    """)

    with SessionLocal() as db:
        db.execute(sql, {
            "id": record_id,
            "user_id": user_id,
            "goals": goals_json,
        })
        db.commit()

    return goals
