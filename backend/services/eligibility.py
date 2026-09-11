"""
Eligibility Engine — YojanaSetu

Checks a CitizenProfile against all schemes using ONLY structured rules
that were explicitly identified in eligibility_analysis.md.

Rules applied (Task 4B):
  - min_age / max_age        (from CSV: PMJJBY, PM-DAKSH)
  - gender                   (from CSV: PMMVY, PM Ujjwala 2.0)
  - is_farmer_required       (from CSV: PMFBY, PM-Kisan)
  - is_disabled_required     (from CSV: Homes For IP)
  - scope / state            (from DB: Maharashtra-specific schemes)

Additional rules applied (Task 5C — uses new citizen fields):
  - has_bank_account         PMJJBY, APY  — False fails; True removes that unresolved entry
  - is_bpl                   NFBS         — False fails; True removes that unresolved entry
  - ration_card_type         PM-GKAY      — not AAY/PHH fails; AAY/PHH removes that entry
  - owns_land                PM-Kisan     — False fails; True removes that unresolved entry
                             PMFBY        — NOT used (tenancy/sharecropper also valid; analysis
                                            says owns_land alone must not disqualify)
  - is_pregnant_or_lactating PMMVY        — False fails; True removes that unresolved entry
  - owns_business            PMMY         — False fails; True removes that unresolved entry

Design rules (must never be violated):
  - A field being True must NOT automatically produce confirmed_eligible.
  - A scheme stays possibly_eligible whenever any other condition is still unresolved.
  - No eligibility conditions are invented or guessed.
"""

from typing import Any, Dict, List

from models.citizen import CitizenProfile
from models.scheme import Scheme


# ---------------------------------------------------------------------------
# Per-scheme HARD RULES (explicit numeric/boolean conditions from the CSV)
# Source: eligibility_analysis.md
# Keyed by the URL slug from official_myscheme_url (last path segment)
# ---------------------------------------------------------------------------
SCHEME_HARD_RULES: Dict[str, Dict[str, Any]] = {
    # Pradhan Mantri Jeevan Jyoti Bima Yojana — "aged 18-50" (explicit in CSV)
    "pmjjby": {"min_age": 18, "max_age": 50},

    # PM-DAKSH — "aged 18-45" (explicit in CSV)
    "pm-daksh": {"min_age": 18, "max_age": 45},

    # Pradhan Mantri Matru Vandana Yojana — "pregnant/lactating women" (female only)
    "pmmvy": {"gender": "female"},

    # Pradhan Mantri Ujjwala Yojana 2.0 — "adult women" (female only)
    "pmuy2": {"gender": "female"},

    # Pradhan Mantri Fasal Bima Yojana — "farmers growing notified crops"
    "pmfby": {"is_farmer_required": True},

    # Pradhan Mantri Kisan Samman Nidhi — "landholding farmer families"
    "pm-kisan": {"is_farmer_required": True},

    # Homes For Intellectually Impaired Persons — "intellectual disability"
    "hiip": {"is_disabled_required": True},
}


# ---------------------------------------------------------------------------
# Per-scheme UNRESOLVED CONDITIONS
# Conditions that exist in the scheme but CANNOT be checked from the
# current CitizenProfile fields. Source: eligibility_analysis.md.
# All 20 schemes have at least one unresolved condition.
# ---------------------------------------------------------------------------
SCHEME_UNRESOLVED: Dict[str, List[str]] = {
    "pmss": [
        "Student or dependent relationship with a service-family member cannot be verified from profile",
        "Approved course type requires official scheme document check",
    ],
    "cts-maharashtra": [
        "ITI trainee status is not present in the citizen profile",
        "Exact income ceiling is not available in the dataset — verify at official source",
        "Attendance condition cannot be verified from profile",
    ],
    "eatt10t12s": [
        "Parent's registration with Maharashtra BOCW Board is not in the citizen profile",
        "Minimum marks condition is not available in the dataset",
    ],
    "nmmss": [
        "Type of school (government/government-aided) is not in the citizen profile",
        "Parental income limit is not available in the dataset — verify at official source",
        "Merit selection process cannot be pre-verified",
    ],
    "ab-pmjay": [
        "Eligibility is determined by SECC 2011 government database, not self-reported profile",
        "Deprivation and occupational criteria require external government database lookup",
    ],
    "pmmvy": [
        "Pregnancy or lactation status is not in the citizen profile",
        "Registration with health authorities (RCHI/MCP card) cannot be verified from profile",
    ],
    "pm-gkay": [
        "Ration card type (AAY / Priority Household) is not in the citizen profile",
        "NFSA beneficiary status requires government database lookup",
    ],
    "pmjjby": [
        "Bank or post-office account ownership is not in the citizen profile",
    ],
    "hiip": [
        "Orphan status is not in the citizen profile",
        "Type and certified degree of intellectual disability is not in the citizen profile",
    ],
    "apy": [
        "Bank or post-office account ownership is not in the citizen profile",
        "Age range for this scheme is not structured in the dataset — verify at official source",
        "Non-income-tax-payer condition cannot be verified from profile",
    ],
    "pmfby": [
        "Notified crop type and notified area require state-level agricultural records",
        "Tenancy or sharecropper status is not in the citizen profile",
        "Seasonal enrolment conditions require current-year verification",
    ],
    "pm-kisan": [
        "Land ownership records are not in the citizen profile",
        "Exclusion conditions (government employee, income-tax payer) cannot be verified from profile",
    ],
    "pmay-u": [
        "Urban household status is not in the citizen profile",
        "EWS/LIG/MIG income slab thresholds are not structured in the dataset — verify at official source",
        "Existing house ownership status is not in the citizen profile",
    ],
    "pmuy2": [
        "Definition of deprived or poor household requires government criteria verification",
        "Existing LPG connection status is not in the citizen profile",
    ],
    "pmkvy-stt": [
        "Approved training programme availability cannot be pre-verified",
        "Enrolment conditions require programme-level check at official source",
    ],
    "pmv": [
        "Specific artisan trade from the 18 notified trades is not in the citizen profile",
        "Age condition and one-member-per-family rule cannot be verified from profile",
    ],
    "pm-daksh": [
        "EWS income certificate status is not in the citizen profile",
        "DNT, Safai Mitra, or waste-picker group membership is not in the citizen profile",
    ],
    "pmmy": [
        "Business or enterprise ownership and type are not in the citizen profile",
        "Non-farm, non-corporate enterprise status cannot be verified from profile",
    ],
    "nfbs": [
        "Primary breadwinner death is a life event not present in the citizen profile",
        "BPL status is not in the citizen profile",
        "Note: the age condition in this scheme refers to the deceased breadwinner, not the applicant",
    ],
    "pmis": [
        "Participating company availability and programme conditions require official portal check",
        "Current employment status details are not sufficient in the citizen profile",
    ],
}


def _url_slug(source_url: str) -> str:
    """Extract the last path segment from a myscheme URL as the scheme slug."""
    return source_url.rstrip("/").split("/")[-1].lower()


def _explain(status: str, passed: List[str], failed: List[str], unresolved: List[str]) -> str:
    """
    Build a single plain-English citizen-facing explanation sentence.
    Generated ONLY from the already-computed status, passed, failed,
    and unresolved lists. No new data or eligibility rules are introduced.
    """
    if status == "confirmed_eligible":
        # All known conditions verified — tell the citizen clearly.
        checks = len(passed)
        return (
            f"You appear to meet all {checks} condition(s) that YojanaSetu "
            f"can currently verify for this scheme. "
            f"Visit the official link to apply."
        )

    if status == "not_eligible":
        # Use the first failed reason as the primary explanation.
        primary = failed[0] if failed else "A required condition is not met."
        # Strip trailing punctuation to embed cleanly in a sentence.
        primary = primary.rstrip(".")
        extra = (
            f" ({len(failed) - 1} more condition(s) also failed)"
            if len(failed) > 1 else ""
        )
        return (
            f"You are not eligible for this scheme because: {primary}{extra}."
        )

    # possibly_eligible
    n_pass = len(passed)
    n_unres = len(unresolved)
    passed_note = (
        f"You meet {n_pass} known condition(s). "
        if n_pass > 0 else ""
    )
    return (
        f"{passed_note}However, {n_unres} condition(s) could not be "
        f"automatically verified from your profile and require manual "
        f"confirmation at the official scheme portal."
    )


def check_scheme(citizen: CitizenProfile, scheme: Scheme) -> Dict[str, Any]:
    """
    Check one citizen against one scheme.
    Returns a dict with scheme_id, scheme_name, status, reasons, and explanation.
    """
    slug = _url_slug(scheme.source_url)
    hard_rules = SCHEME_HARD_RULES.get(slug, {})
    unresolved = SCHEME_UNRESOLVED.get(slug, [
        "Additional eligibility conditions exist — verify at official source"
    ])

    passed: List[str] = []
    failed: List[str] = []

    # --- Rule: minimum age ---
    min_age = hard_rules.get("min_age")
    if min_age is not None:
        if citizen.age < min_age:
            failed.append(
                f"Age {citizen.age} is below the minimum required age of {min_age}"
            )
        else:
            passed.append(
                f"Age {citizen.age} meets the minimum age requirement of {min_age}"
            )

    # --- Rule: maximum age ---
    max_age = hard_rules.get("max_age")
    if max_age is not None:
        if citizen.age > max_age:
            failed.append(
                f"Age {citizen.age} exceeds the maximum eligible age of {max_age}"
            )
        else:
            passed.append(
                f"Age {citizen.age} is within the maximum age limit of {max_age}"
            )

    # --- Rule: gender ---
    required_gender = hard_rules.get("gender")
    if required_gender:
        citizen_gender = citizen.gender.value if hasattr(citizen.gender, "value") else citizen.gender
        if citizen_gender != required_gender:
            failed.append(
                f"Scheme is for {required_gender} applicants only; "
                f"citizen gender is '{citizen_gender}'"
            )
        else:
            passed.append(
                f"Gender '{citizen_gender}' meets the scheme requirement"
            )

    # --- Rule: farmer required ---
    if hard_rules.get("is_farmer_required"):
        if not citizen.is_farmer:
            failed.append("Scheme requires the applicant to be a farmer")
        else:
            passed.append("Citizen is a farmer, satisfying the scheme requirement")

    # --- Rule: disability required ---
    if hard_rules.get("is_disabled_required"):
        if not citizen.is_disabled:
            failed.append("Scheme requires the applicant to have a disability")
        else:
            passed.append("Citizen has a disability, satisfying the scheme requirement")

    # --- Rule: state scope (Maharashtra-specific schemes) ---
    if scheme.scope and scheme.scope.lower() != "central":
        if citizen.state.lower() != scheme.scope.lower():
            failed.append(
                f"Scheme is specific to {scheme.scope}; "
                f"citizen's state is '{citizen.state}'"
            )
        else:
            passed.append(
                f"Citizen's state '{citizen.state}' matches the scheme scope '{scheme.scope}'"
            )

    # --- Task 5C: new citizen-field checks ---
    # Work on a mutable copy of unresolved so we can remove individual entries
    # that are now resolvable, without touching entries that remain unknown.
    unresolved = list(unresolved)

    # -- has_bank_account (PMJJBY, APY) --
    _BANK_UNRESOLVED = "Bank or post-office account ownership is not in the citizen profile"
    if slug in ("pmjjby", "apy"):
        if not citizen.has_bank_account:
            failed.append("Scheme requires a bank or post-office account; citizen does not have one")
        else:
            passed.append("Citizen holds a bank or post-office account, satisfying that condition")
            if _BANK_UNRESOLVED in unresolved:
                unresolved.remove(_BANK_UNRESOLVED)

    # -- is_bpl (NFBS) --
    _BPL_UNRESOLVED = "BPL status is not in the citizen profile"
    if slug == "nfbs":
        if not citizen.is_bpl:
            failed.append("Scheme targets BPL families; citizen does not hold a BPL card")
        else:
            passed.append("Citizen holds a BPL card, satisfying that condition")
            if _BPL_UNRESOLVED in unresolved:
                unresolved.remove(_BPL_UNRESOLVED)

    # -- ration_card_type (PM-GKAY) --
    _RATION_UNRESOLVED = "Ration card type (AAY / Priority Household) is not in the citizen profile"
    if slug == "pm-gkay":
        ration = citizen.ration_card_type.value if hasattr(citizen.ration_card_type, "value") else citizen.ration_card_type
        if ration not in ("AAY", "PHH"):
            failed.append(
                f"Scheme requires AAY or PHH ration card; "
                f"citizen's ration card type is '{ration}'"
            )
        else:
            passed.append(
                f"Citizen holds a '{ration}' ration card, satisfying that condition"
            )
            if _RATION_UNRESOLVED in unresolved:
                unresolved.remove(_RATION_UNRESOLVED)

    # -- owns_land (PM-Kisan only; NOT applied to PMFBY — tenancy also valid) --
    _LAND_UNRESOLVED = "Land ownership records are not in the citizen profile"
    if slug == "pm-kisan":
        if not citizen.owns_land:
            failed.append(
                "Scheme requires landholding farmer families; citizen does not own agricultural land"
            )
        else:
            passed.append("Citizen owns agricultural land, satisfying the landholding requirement")
            if _LAND_UNRESOLVED in unresolved:
                unresolved.remove(_LAND_UNRESOLVED)

    # -- is_pregnant_or_lactating (PMMVY) --
    _PREG_UNRESOLVED = "Pregnancy or lactation status is not in the citizen profile"
    if slug == "pmmvy":
        if not citizen.is_pregnant_or_lactating:
            failed.append(
                "Scheme targets pregnant or lactating women; citizen is not pregnant or lactating"
            )
        else:
            passed.append(
                "Citizen is pregnant or lactating, satisfying that condition"
            )
            if _PREG_UNRESOLVED in unresolved:
                unresolved.remove(_PREG_UNRESOLVED)

    # -- owns_business (PMMY) --
    _BIZ_UNRESOLVED = "Business or enterprise ownership and type are not in the citizen profile"
    if slug == "pmmy":
        if not citizen.owns_business:
            failed.append(
                "Scheme targets micro/small enterprise owners; citizen does not own a business"
            )
        else:
            passed.append(
                "Citizen owns a business or enterprise, satisfying that condition"
            )
            if _BIZ_UNRESOLVED in unresolved:
                unresolved.remove(_BIZ_UNRESOLVED)

    # --- Determine final status ---
    if failed:
        # At least one hard rule failed — definitively not eligible
        status = "not_eligible"
        unresolved_out = []
    elif unresolved:
        # All hard rules passed but unverifiable conditions remain
        status = "possibly_eligible"
        unresolved_out = unresolved
    else:
        # All rules passed and nothing unresolved — fully confirmed
        status = "confirmed_eligible"
        unresolved_out = []

    explanation = _explain(status, passed, failed, unresolved_out)

    return {
        "scheme_id": scheme.id,
        "scheme_name": scheme.name,
        "category": scheme.category,
        "scope": scheme.scope,
        "status": status,
        "explanation": explanation,
        "reasons": {
            "passed": passed,
            "failed": failed,
            "unresolved": unresolved_out,
        },
        # Application info — sourced directly from the already-loaded Scheme object.
        # documents_summary: raw document list text imported from the CSV dataset.
        # source_url: official myScheme.gov.in page for this scheme.
        # Neither field is invented or modified here.
        "documents_summary": scheme.documents_summary,
        "source_url": scheme.source_url,
    }


def run_eligibility(citizen: CitizenProfile, schemes: List[Scheme]) -> Dict[str, Any]:
    """
    Run the eligibility engine for a citizen against all provided schemes.
    Returns a summary dict with results grouped by status.
    """
    results = [check_scheme(citizen, s) for s in schemes]

    confirmed = [r for r in results if r["status"] == "confirmed_eligible"]
    possible  = [r for r in results if r["status"] == "possibly_eligible"]
    not_elig  = [r for r in results if r["status"] == "not_eligible"]

    return {
        "citizen_id":   citizen.id,
        "citizen_name": citizen.name,
        "summary": {
            "total_schemes_checked": len(results),
            "confirmed_eligible":    len(confirmed),
            "possibly_eligible":     len(possible),
            "not_eligible":          len(not_elig),
        },
        "results": results,
    }
