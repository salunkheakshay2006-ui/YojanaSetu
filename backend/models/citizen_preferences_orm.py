"""
SQLAlchemy ORM table definition for citizen_preferences table.

Stores the citizen's selected support goals and preferences in PostgreSQL.
Enforces at most ONE preferences record per authenticated user via unique user_id constraint.
"""

from datetime import datetime, timezone
from typing import List
from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class CitizenPreferencesTable(Base):
    """ORM mapping for the `citizen_preferences` PostgreSQL table."""

    __tablename__ = "citizen_preferences"

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_preferences"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    goals: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
