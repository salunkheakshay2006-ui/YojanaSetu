"""
SQLAlchemy ORM table definition for application_tracker table.

Stores the citizen's application pipeline status for a saved scheme:
  - "Saved"
  - "Planning to Apply"
  - "Application Started"
  - "Submitted"

Enforces uniqueness on (user_id, scheme_id) so there is at most one tracker record per scheme per user.
"""

from datetime import datetime, timezone
from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class ApplicationTrackerTable(Base):
    """ORM mapping for the `application_tracker` PostgreSQL table."""

    __tablename__ = "application_tracker"

    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", name="uq_user_tracker_scheme"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(String(36), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Saved")
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
