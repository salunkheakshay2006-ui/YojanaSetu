"""
SQLAlchemy ORM table definition for the citizens table.

Column layout mirrors CitizenProfile exactly -- no extra fields.
The table is created via Base.metadata.create_all(engine) in main.py.
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class CitizenTable(Base):
    """ORM mapping for the `citizens` PostgreSQL table."""

    __tablename__ = "citizens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    income: Mapped[float] = mapped_column(Float, nullable=False)
    occupation: Mapped[str] = mapped_column(String(100), nullable=False)
    education: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(10), nullable=False)
    is_student: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_farmer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_disabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # --- Eligibility fields added in Task 5B ---
    # Columns already exist in the live DB (added via ALTER TABLE).
    # Defaults here match the DB defaults so create_all() stays a no-op.

    has_bank_account: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_bpl: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # "none" | "AAY" | "PHH" | "NPHH"
    ration_card_type: Mapped[str] = mapped_column(String(10), nullable=False, default="none")
    owns_land: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_pregnant_or_lactating: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    owns_business: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # --- Conflict-detection column added in Task 13 ---
    # True = citizen currently holds an active/outstanding MUDRA loan.
    # Blocks PM Vishwakarma registration until the loan is fully repaid.
    has_active_mudra_loan: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # --- Authenticated User link added in Milestone M10-B ---
    # Nullable Supabase Auth user ID (UUID). Preserves existing guest/demo compatibility.
    user_id: Mapped[str] = mapped_column(String(64), nullable=True, index=True)

