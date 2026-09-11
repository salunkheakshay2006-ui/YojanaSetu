"""
Conflict Detection Service — YojanaSetu

Detects verified, officially-documented incompatibilities between government
schemes for a given citizen profile.

Design principles:
  - Completely separate from eligibility.py — must not be imported by it.
  - Only one conflict rule is encoded: the one verified in Task 12.
  - No rules are invented.  No inferences are made beyond what official
    scheme guidelines explicitly state.

Verified conflict documented here:
  PM Vishwakarma (pmv) ↔ Pradhan Mantri Mudra Yojana (pmmy)

  Official source:
    pmvishwakarma.gov.in (FAQ / scheme guidelines)
    pib.gov.in (PM Vishwakarma scheme document)

  Rule:
    An applicant who has availed a MUDRA loan in the past 5 years and has
    NOT fully repaid it is NOT eligible to register for PM Vishwakarma.
    Once the loan is fully repaid, eligibility for PM Vishwakarma is restored.

  Citizen field used: CitizenProfile.has_active_mudra_loan (bool)
    True  → citizen holds an active/outstanding MUDRA loan right now.
    False → no active MUDRA loan (never had one, or fully repaid).

  IMPORTANT: has_active_mudra_loan must NOT be confused with owns_business.
    A citizen can own a business without a MUDRA loan, and vice versa.
"""

from typing import Any, Dict, List

from models.citizen import CitizenProfile
from models.scheme import Scheme


# ---------------------------------------------------------------------------
# URL slugs for the two conflicting schemes
# (matches the slug logic in eligibility.py: last path segment of source_url)
# ---------------------------------------------------------------------------
_PMV_SLUG  = "pmv"        # PM Vishwakarma
_PMMY_SLUG = "pmmy"       # Pradhan Mantri Mudra Yojana


def _url_slug(source_url: str) -> str:
    """Extract the last path segment from a myscheme URL as the scheme slug."""
    return source_url.rstrip("/").split("/")[-1].lower()


def run_conflict_detection(
    citizen: CitizenProfile,
    schemes: List[Scheme],
) -> List[Dict[str, Any]]:
    """
    Check the citizen profile for verified scheme conflicts.

    Returns a list of conflict dicts — one entry per detected conflict.
    Returns an empty list when no conflicts are found.

    Each conflict dict has the shape:
      {
        "conflict_id":   str   — short machine-readable identifier
        "scheme_a":      str   — name of the first scheme
        "scheme_b":      str   — name of the second scheme
        "slug_a":        str   — URL slug of scheme_a
        "slug_b":        str   — URL slug of scheme_b
        "condition":     str   — the citizen-profile condition that triggers this conflict
        "explanation":   str   — plain-English explanation for the citizen
        "official_source": str — URL of the official document that states this rule
      }
    """
    # Build a slug → scheme name lookup from the provided scheme list
    slug_to_name: Dict[str, str] = {
        _url_slug(s.source_url): s.name for s in schemes
    }

    conflicts: List[Dict[str, Any]] = []

    # -------------------------------------------------------------------
    # CONFLICT 1 — PM Vishwakarma ↔ Active MUDRA Loan
    #
    # Rule: If the citizen currently holds an active (unpaid) MUDRA loan,
    # they cannot register for PM Vishwakarma.
    #
    # Official source:
    #   https://pmvishwakarma.gov.in  (scheme guidelines / FAQ)
    #   https://pib.gov.in            (PM Vishwakarma scheme document)
    # -------------------------------------------------------------------
    if citizen.has_active_mudra_loan:
        # Only flag this conflict if both schemes are present in the scheme list
        # (guards against the scheme list being filtered or incomplete).
        pmv_name  = slug_to_name.get(_PMV_SLUG)
        pmmy_name = slug_to_name.get(_PMMY_SLUG)

        if pmv_name and pmmy_name:
            conflicts.append({
                "conflict_id": "pmv_vs_active_mudra_loan",
                "scheme_a":    pmv_name,
                "scheme_b":    pmmy_name,
                "slug_a":      _PMV_SLUG,
                "slug_b":      _PMMY_SLUG,
                "condition":   "Citizen currently holds an active / outstanding MUDRA loan.",
                "explanation": (
                    f"You cannot register for {pmv_name} while you have an "
                    f"active or outstanding MUDRA loan under {pmmy_name}. "
                    f"According to the official PM Vishwakarma scheme guidelines, "
                    f"applicants who have availed a MUDRA loan in the past 5 years "
                    f"and have NOT fully repaid it are ineligible to register for "
                    f"{pmv_name}. Once your MUDRA loan is fully repaid, you may "
                    f"apply for {pmv_name}."
                ),
                "official_source": (
                    "https://pmvishwakarma.gov.in (scheme guidelines / FAQ); "
                    "https://pib.gov.in (PM Vishwakarma scheme document)"
                ),
            })

    return conflicts
