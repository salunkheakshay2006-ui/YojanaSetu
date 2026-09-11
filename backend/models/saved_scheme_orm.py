"""
SQLAlchemy ORM table definition for saved_schemes table.

Links an authenticated Supabase user (user_id) to a saved government scheme (scheme_id).
Enforces uniqueness on (user_id, scheme_id) so a scheme cannot be saved twice by the same user.
"""

from datetime import datetime, timezone
from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class SavedSchemeTable(Base):
    """ORM mapping for the `saved_schemes` PostgreSQL table."""

    __tablename__ = "saved_schemes"

    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", name="uq_user_scheme"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
