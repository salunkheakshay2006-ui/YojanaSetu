"""
SQLAlchemy ORM table definition for the schemes table.

Column layout mirrors Scheme exactly -- no extra fields.
The table is created via Base.metadata.create_all(engine) in main.py.
"""

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class SchemeTable(Base):
    """ORM mapping for the `schemes` PostgreSQL table."""

    __tablename__ = "schemes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    # 'government' (default) or 'private' — mirrors SchemeTypeEnum in models/scheme.py
    scheme_type: Mapped[str] = mapped_column(String(20), nullable=False, default="government")
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    benefit: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)

    # Age eligibility -- nullable means no restriction on that bound
    min_age: Mapped[int] = mapped_column(Integer, nullable=True)
    max_age: Mapped[int] = mapped_column(Integer, nullable=True)

    # Income eligibility -- nullable means no restriction on that bound
    min_income: Mapped[float] = mapped_column(Float, nullable=True)
    max_income: Mapped[float] = mapped_column(Float, nullable=True)

    # Demographic filters
    gender: Mapped[str] = mapped_column(String(10), nullable=False, default="any")
    # Renamed from 'category' -- this is caste/community eligibility (General/OBC/SC/ST/any)
    caste_eligibility: Mapped[str] = mapped_column(String(10), nullable=False, default="any")
    occupation: Mapped[str] = mapped_column(String(100), nullable=False, default="any")
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="all")

    # Special eligibility flags
    is_student_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_farmer_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_disabled_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Documents stored as free text (structured list to be added in a future step)
    documents_required: Mapped[str] = mapped_column(Text, nullable=True)

    # --- Fields populated from the CSV dataset ---

    # Scheme topic area (e.g. "Education", "Health and Wellness", "Agriculture and Crop Insurance")
    category: Mapped[str] = mapped_column(String(100), nullable=True)

    # "Central" for nation-wide schemes, state name (e.g. "Maharashtra") for state-specific schemes
    scope: Mapped[str] = mapped_column(String(100), nullable=True)

    # Where the record was sourced from (e.g. "Official myScheme page")
    source: Mapped[str] = mapped_column(String(200), nullable=True)

    # Date the record was last verified against the official source (stored as ISO string)
    last_verified: Mapped[str] = mapped_column(String(20), nullable=True)

    # Raw document list text from the dataset -- stored as-is, not parsed
    documents_summary: Mapped[str] = mapped_column(Text, nullable=True)
