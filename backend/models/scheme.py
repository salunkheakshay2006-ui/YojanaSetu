"""
Pydantic models for the Scheme resource.

SchemeCreate  -- shape of the request body when adding a scheme.
Scheme        -- full scheme record (includes id).
"""

import enum
from typing import Optional

from pydantic import BaseModel, Field


class SchemeGenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    any = "any"


class SchemeCasteEnum(str, enum.Enum):
    """Caste/community eligibility for a scheme."""
    general = "General"
    obc = "OBC"
    sc = "SC"
    st = "ST"
    any = "any"


class SchemeTypeEnum(str, enum.Enum):
    """
    Whether a scheme is a government programme or a private scholarship.
    Used to power the future 'All Scholarships' unified view.
      government — central or state government scheme (myScheme.gov.in etc.)
      private    — private-sector / NGO / foundation scholarship
    """
    government = "government"
    private    = "private"


class SchemeCreate(BaseModel):
    """Fields required when adding a new government scheme."""

    # Classification: 'government' (default) or 'private'.
    # Powers the future 'All Scholarships' unified view.
    # All 20 existing schemes are government schemes.
    scheme_type: SchemeTypeEnum = SchemeTypeEnum.government

    name: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=2)
    benefit: str = Field(..., min_length=2)
    source_url: str = Field(..., min_length=5)

    # Age eligibility -- None means no restriction on that bound
    min_age: Optional[int] = Field(None, ge=0, le=120)
    max_age: Optional[int] = Field(None, ge=0, le=120)

    # Income eligibility -- None means no restriction on that bound
    min_income: Optional[float] = Field(None, ge=0, description="Annual income in INR")
    max_income: Optional[float] = Field(None, ge=0, description="Annual income in INR")

    # Demographic filters -- "any" means no restriction
    gender: SchemeGenderEnum = SchemeGenderEnum.any
    # Caste/community eligibility (renamed from 'category' to avoid collision with topic category)
    caste_eligibility: SchemeCasteEnum = SchemeCasteEnum.any

    # Occupation filter -- "any" means open to all occupations
    occupation: str = Field("any", max_length=100)

    # State filter -- "all" means a central (nation-wide) scheme
    state: str = Field("all", max_length=100)

    # Special eligibility flags -- False means not required
    is_student_required: bool = False
    is_farmer_required: bool = False
    is_disabled_required: bool = False

    # Documents stored as free text -- structured list to be added in a future step
    documents_required: Optional[str] = None

    # --- Fields populated from the CSV dataset ---

    # Scheme topic area from the dataset (e.g. "Education", "Health and Wellness")
    category: Optional[str] = None

    # "Central" for nation-wide schemes, state name for state-specific schemes
    scope: Optional[str] = None

    # Where the record was sourced from (e.g. "Official myScheme page")
    source: Optional[str] = None

    # Date the record was last verified (ISO date string, e.g. "2026-09-11")
    last_verified: Optional[str] = None

    # Raw document list text from the dataset -- stored as-is, not parsed
    documents_summary: Optional[str] = None


class Scheme(SchemeCreate):
    """Full scheme record -- extends SchemeCreate with the server-set id."""

    id: str
