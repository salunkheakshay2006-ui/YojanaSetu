"""
Pydantic models for the Citizen resource.

CitizenCreate  -- shape of the POST /api/profile request body.
CitizenProfile -- full citizen record (includes id and created_at).
"""

import enum
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class CategoryEnum(str, enum.Enum):
    general = "General"
    obc = "OBC"
    sc = "SC"
    st = "ST"


class RationCardTypeEnum(str, enum.Enum):
    """Type of government ration card held by the citizen."""
    none = "none"   # no ration card
    aay  = "AAY"    # Antyodaya Anna Yojana (poorest of the poor)
    phh  = "PHH"    # Priority Household
    nphh = "NPHH"   # Non-Priority Household


class CitizenCreate(BaseModel):
    """Fields the caller must supply when creating a profile."""

    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=120)
    gender: GenderEnum
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    income: float = Field(..., ge=0, description="Annual income in INR")
    occupation: str = Field(..., min_length=2, max_length=100)
    education: str = Field(..., min_length=2, max_length=100)
    category: CategoryEnum
    is_student: bool = False
    is_farmer: bool = False
    is_disabled: bool = False

    # --- Eligibility fields added in Task 5B ---
    # Safe defaults: all False / "none" so existing profiles are unaffected.

    # Does the citizen hold a bank or post-office savings account?
    # Required by: PMJJBY, Atal Pension Yojana
    has_bank_account: bool = False

    # Is the citizen a Below Poverty Line (BPL) card holder?
    # Required by: NFBS, partial indicator for AB-PMJAY and PMUY 2.0
    is_bpl: bool = False

    # Government ration card category held by the citizen's household
    # Required by: PM Garib Kalyan Anna Yojana (needs AAY or PHH)
    ration_card_type: RationCardTypeEnum = RationCardTypeEnum.none

    # Does the citizen own agricultural land?
    # Required by: PM-Kisan (landholding farmer), PMFBY (stronger farmer filter)
    owns_land: bool = False

    # Is the citizen currently pregnant or lactating?
    # Required by: Pradhan Mantri Matru Vandana Yojana
    is_pregnant_or_lactating: bool = False

    # Does the citizen own or run a micro/small business or enterprise?
    # Required by: Pradhan Mantri Mudra Yojana
    owns_business: bool = False

    # --- Conflict-detection fields added in Task 13 ---
    # These are separate from eligibility flags — they represent life-event states
    # that cause a verified incompatibility between specific scheme pairs.

    # Does the citizen currently hold an active/outstanding MUDRA loan?
    # If True, PM Vishwakarma (pmv) registration is blocked until the loan is fully repaid.
    # Source: official PM Vishwakarma scheme guidelines (pmvishwakarma.gov.in / pib.gov.in)
    # IMPORTANT: must NOT be confused with owns_business. A citizen can own a business
    # without a MUDRA loan, or have repaid a past MUDRA loan and be eligible again.
    has_active_mudra_loan: bool = False



class CitizenProfile(CitizenCreate):
    """Full citizen record -- extends CitizenCreate with server-set fields."""

    id: str
    created_at: datetime
    user_id: str | None = None


class ApiResponse(BaseModel):
    """Standard API response envelope used by every route."""

    success: bool
    message: str
    data: Any = {}
