"""
SQLAlchemy ORM table definition for citizen_documents table.

Stores the citizen's personal document availability and custom documents in PostgreSQL.
Enforces at most ONE documents record per authenticated user via unique user_id constraint.
"""

from datetime import datetime, timezone
from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class CitizenDocumentsTable(Base):
    """ORM mapping for the `citizen_documents` PostgreSQL table."""

    __tablename__ = "citizen_documents"

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_documents"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    available_docs: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    custom_docs: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
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
