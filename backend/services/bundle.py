"""
Bundle Optimization Service — YojanaSetu

Selects an optimized, conflict-free bundle of schemes for a citizen.

Pipeline position in PS16:
  Citizen Profile -> Eligible Schemes -> Conflict Detection -> Optimized Bundle -> Application Checklist

Rules applied:
  1. Only considers schemes with status 'confirmed_eligible' or 'possibly_eligible'.
  2. Disqualifies schemes marked as 'not_eligible'.
  3. Applies verified conflicts from services/conflict.py:
     - For 'pmv_vs_active_mudra_loan', PM Vishwakarma (pmv) is excluded because
       official guidelines prohibit registering for PM Vishwakarma with an
       active/unpaid MUDRA loan.
  4. Partitions the valid bundle into:
     - confirmed: schemes where all known criteria are verified.
     - conditional: schemes requiring further document/external verification.
  5. Returns a structured result with the complete bundle, partitions,
     excluded schemes, and bundle summary.
"""

from typing import Any, Dict, List
from models.citizen import CitizenProfile


def _url_slug(source_url: str) -> str:
    """Extract the last path segment from a myscheme URL as the scheme slug."""
    return source_url.rstrip("/").split("/")[-1].lower()


def _build_bundle_explanation(
    bundle: List[Dict[str, Any]],
    confirmed: List[Dict[str, Any]],
    conditional: List[Dict[str, Any]],
    excluded_schemes: List[Dict[str, Any]],
    conflicts: List[Dict[str, Any]],
) -> Dict[str, str]:
    """
    Build a plain-English bundle-level explanation using only counts and
    data already present in the bundle, confirmed, conditional, and conflict sets.
    """
    total_b = len(bundle)
    total_c = len(confirmed)
    total_p = len(conditional)
    total_e = len(excluded_schemes)

    # 1. Summary: explain why the bundle was created
    conflict_note = (
        f"{total_e} scheme(s) were excluded due to detected conflicts."
        if total_e > 0
        else "No detected conflicts affected the bundle."
    )
    summary = (
        f"This bundle contains {total_b} scheme(s) based on your profile. "
        f"Schemes with confirmed eligible ({total_c}) or possibly eligible ({total_p}) status "
        f"were considered, while not eligible schemes were excluded. {conflict_note}"
    )

    # 2. Confirmed tier explanation
    if total_c > 0:
        confirmed_tier = (
            f"There {'is' if total_c == 1 else 'are'} {total_c} confirmed eligible scheme(s) in this bundle. "
            f"All conditions currently checked by YojanaSetu were met, and you can proceed with your application "
            f"through the official links."
        )
    else:
        confirmed_tier = (
            "There are currently 0 confirmed eligible schemes in this bundle. "
            "All schemes in your bundle require further verification before eligibility is confirmed."
        )

    # 3. Conditional tier explanation
    if total_p > 0:
        conditional_tier = (
            f"There {'is' if total_p == 1 else 'are'} {total_p} conditional (possibly eligible) scheme(s) in this bundle. "
            f"Your profile satisfies the primary criteria checked by the system, but certain conditions "
            f"require verification at the official scheme portal."
        )
    else:
        conditional_tier = "There are 0 conditional schemes in this bundle."

    # 4. Conflict resolution explanation
    if total_e > 0:
        details = "; ".join(
            f"{s.get('scheme_name', 'Scheme')}: {s.get('exclusion_reason', 'Excluded due to conflict')}"
            for s in excluded_schemes
        )
        conflict_resolution = (
            f"{total_e} scheme(s) were excluded from this bundle because of verified conflict rules: {details}"
        )
    else:
        conflict_resolution = (
            "No detected conflicts affected this bundle. "
            "All recommended schemes in this bundle can be pursued without identified incompatibilities."
        )

    return {
        "summary": summary,
        "confirmed_tier": confirmed_tier,
        "conditional_tier": conditional_tier,
        "conflict_resolution": conflict_resolution,
    }


def optimize_bundle(
    citizen: CitizenProfile,
    eligibility_report: Dict[str, Any],
    conflicts: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Build an optimized, conflict-free scheme bundle for a citizen.

    Parameters:
      citizen: CitizenProfile
      eligibility_report: Dict returned by run_eligibility (contains "results")
      conflicts: List of conflict dicts from run_conflict_detection

    Returns:
      Dict with:
        - bundle: List[Dict] (all valid schemes in bundle)
        - confirmed: List[Dict] (confirmed_eligible schemes in bundle)
        - conditional: List[Dict] (possibly_eligible schemes in bundle)
        - excluded_schemes: List[Dict] (schemes excluded due to conflict)
        - bundle_summary: Dict (counts of bundle, confirmed, conditional, excluded)
        - explanation: Dict[str, str] (summary, confirmed_tier, conditional_tier, conflict_resolution)
    """
    # 1. Extract results list from eligibility report
    all_results = (
        eligibility_report.get("results", [])
        if isinstance(eligibility_report, dict)
        else eligibility_report
    )

    # 2. Filter candidate schemes (confirmed_eligible or possibly_eligible only)
    candidate_schemes: List[Dict[str, Any]] = [
        item for item in all_results
        if item.get("status") in ("confirmed_eligible", "possibly_eligible")
    ]

    # 3. Determine which scheme slugs must be excluded based on active conflicts
    # For the verified conflict 'pmv_vs_active_mudra_loan', PM Vishwakarma ('pmv') is blocked.
    excluded_slugs_to_reason: Dict[str, str] = {}
    for conflict in conflicts:
        conflict_id = conflict.get("conflict_id")
        if conflict_id == "pmv_vs_active_mudra_loan":
            slug_to_exclude = conflict.get("slug_a", "pmv")
            reason = conflict.get(
                "explanation",
                "Applicant cannot register for PM Vishwakarma with an active MUDRA loan."
            )
            excluded_slugs_to_reason[slug_to_exclude] = reason

    # 4. Partition candidate schemes into bundle vs excluded_schemes
    bundle: List[Dict[str, Any]] = []
    excluded_schemes: List[Dict[str, Any]] = []

    for scheme in candidate_schemes:
        source_url = scheme.get("source_url", "")
        slug = _url_slug(source_url)

        if slug in excluded_slugs_to_reason:
            excluded_schemes.append({
                **scheme,
                "exclusion_reason": excluded_slugs_to_reason[slug],
            })
        else:
            bundle.append(scheme)

    # 5. Split final bundle into confirmed vs conditional
    confirmed: List[Dict[str, Any]] = [
        s for s in bundle if s.get("status") == "confirmed_eligible"
    ]
    conditional: List[Dict[str, Any]] = [
        s for s in bundle if s.get("status") == "possibly_eligible"
    ]

    # 6. Build bundle summary
    bundle_summary = {
        "total_bundle_schemes": len(bundle),
        "confirmed_count": len(confirmed),
        "conditional_count": len(conditional),
        "excluded_count": len(excluded_schemes),
    }

    # 7. Build bundle-level explanation
    explanation = _build_bundle_explanation(
        bundle=bundle,
        confirmed=confirmed,
        conditional=conditional,
        excluded_schemes=excluded_schemes,
        conflicts=conflicts,
    )

    return {
        "bundle": bundle,
        "confirmed": confirmed,
        "conditional": conditional,
        "excluded_schemes": excluded_schemes,
        "bundle_summary": bundle_summary,
        "explanation": explanation,
    }

