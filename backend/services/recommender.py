import os
import sys
from typing import Any, Dict, List, Optional, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
PARENT_DIR = os.path.dirname(BACKEND_DIR)

for p in [PARENT_DIR, BACKEND_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.crud import get_all_schemes
except ImportError:
    from crud import get_all_schemes

def _to_dict(obj: Any) -> Dict[str, Any]:
    """Safely convert dicts or objects to plain Python dictionary."""
    if obj is None:
        return {}
    if isinstance(obj, dict):
        return dict(obj)
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    if hasattr(obj, "to_dict"):
        return obj.to_dict()
    if hasattr(obj, "keys"):
        return {k: obj[k] for k in obj.keys()}
    return dict(obj)

def profile_matches_scheme(profile: Any, scheme: Any) -> Tuple[bool, float, List[str]]:
    """Evaluates profile match against scheme criteria."""
    p = _to_dict(profile)
    s = _to_dict(scheme)

    score = 50.0
    reasons = []

    p_state = (p.get("state") or "").strip().lower()
    s_state = (s.get("state") or "").strip().lower()
    if s_state and s_state not in ["all india", "all", "central", ""]:
        if p_state and (p_state in s_state or s_state in p_state):
            score += 15
            reasons.append(f"Matches state criteria ({s.get('state')})")
        elif p_state:
            return False, 0.0, ["State mismatch"]

    p_cat = (p.get("category") or "").strip().lower()
    s_cat = (s.get("category") or "").strip().lower()
    if p_cat and s_cat and p_cat in s_cat:
        score += 10
        reasons.append(f"Category match ({s.get('category')})")

    p_occ = (p.get("occupation") or "").strip().lower()
    s_occ = (s.get("occupation") or "").strip().lower()
    if p_occ and s_occ and (p_occ in s_occ or "all" in s_occ or "general" in s_occ):
        score += 10
        reasons.append(f"Occupation alignment ({s.get('occupation') or 'General'})")

    flags = ["farmer", "student", "business", "disability", "widow", "minority"]
    for flag in flags:
        if s.get(flag) == 1:
            if p.get(flag) == 1:
                score += 10
                reasons.append(f"Qualifies under {flag.capitalize()} status focus")
            else:
                return False, 0.0, [f"Does not hold {flag} status"]

    return True, score, reasons

def scheme_is_eligible(profile: Any, scheme: Any) -> Tuple[bool, float, List[str]]:
    """Checks whether citizen profile is fully eligible for a scheme."""
    p = _to_dict(profile)
    s = _to_dict(scheme)

    age = p.get("age")
    if age is not None:
        age_min = s.get("age_min")
        age_max = s.get("age_max")
        if age_min is not None and age_min > 0 and age < age_min:
            return False, 0.0, [f"Age {age} below minimum required age {age_min}"]
        if age_max is not None and age_max > 0 and age_max < 100 and age > age_max:
            return False, 0.0, [f"Age {age} exceeds maximum eligible age {age_max}"]

    income = p.get("income")
    if income is not None:
        inc_lim = s.get("income_limit")
        if inc_lim is not None and inc_lim > 0 and income > inc_lim:
            return False, 0.0, [f"Income Rs {income:,.0f} exceeds limit Rs {inc_lim:,.0f}"]

    gender = (p.get("gender") or "").strip().lower()
    s_gender = (s.get("gender") or "").strip().lower()
    if s_gender and s_gender not in ["all", "both", "any", ""]:
        if gender and gender not in s_gender and s_gender not in gender:
            return False, 0.0, [f"Gender '{gender.capitalize()}' does not match scheme focus '{s.get('gender')}'"]

    is_match, score, reasons = profile_matches_scheme(p, s)
    if not is_match:
        return False, 0.0, reasons

    if not reasons:
        reasons.append("Meets basic eligibility and demographic guidelines.")

    return True, score, reasons

def scheme_is_future_opportunity(profile: Any, scheme: Any) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """Checks if a scheme is close to qualifying (fails 1 minor gap)."""
    p = _to_dict(profile)
    s = _to_dict(scheme)

    gaps = []
    missing_doc = s.get("missing_documents") or s.get("required_documents") or "Documentation Pending"

    age = p.get("age")
    if age is not None:
        age_min = s.get("age_min")
        if age_min is not None and age_min > 0 and age < age_min and (age_min - age) <= 3:
            gaps.append((f"Min age gap: {age_min - age:.0f} year(s) until age {age_min}", f"{int(age_min - age)} year(s)"))

    income = p.get("income")
    if income is not None:
        inc_lim = s.get("income_limit")
        if inc_lim is not None and inc_lim > 0 and income > inc_lim and (income - inc_lim) <= 50000:
            gaps.append((f"Income limit gap: exceeds by Rs {income - inc_lim:,.0f}", "1-2 weeks"))

    if len(gaps) == 1:
        reason_msg, est_time = gaps[0]
        opportunity_payload = {
            "scheme_name": s.get("scheme_name", "Government Scheme"),
            "missing_requirement": reason_msg,
            "missing_document": missing_doc,
            "estimated_time": est_time,
            "reason": f"Eligible upon resolving: {reason_msg}",
            "priority": "High" if "Income" in reason_msg else "Medium"
        }
        return True, opportunity_payload

    return False, None

def split_scheme_results(profile: Any, schemes: List[Any]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Splits schemes into (eligible_schemes, future_opportunities, not_eligible)."""
    eligible = []
    future_opps = []
    not_eligible = []

    for s in schemes:
        s_dict = _to_dict(s)
        is_elig, score, reasons = scheme_is_eligible(profile, s_dict)
        if is_elig:
            s_copy = dict(s_dict)
            s_copy["match_score"] = score
            s_copy["matching_reasons"] = reasons
            eligible.append(s_copy)
        else:
            is_opp, opp_data = scheme_is_future_opportunity(profile, s_dict)
            if is_opp and opp_data:
                future_opps.append(opp_data)
            else:
                not_eligible.append(s_dict)

    return eligible, future_opps, not_eligible

def rank_eligible_schemes(profile: Any, schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Ranks eligible schemes by match_score descending."""
    return sorted(schemes, key=lambda x: x.get("match_score", 0), reverse=True)

def build_recommended_bundle(profile: Any, eligible_schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Builds a complementary bundle of top 2 to 4 schemes from different categories."""
    ranked = rank_eligible_schemes(profile, eligible_schemes)
    bundle = []
    seen_categories = set()

    for s in ranked:
        cat = (s.get("category") or "General").strip().lower()
        if cat not in seen_categories or len(bundle) < 2:
            bundle.append(s)
            seen_categories.add(cat)
        if len(bundle) >= 4:
            break

    return bundle

def generate_explanation(profile: Any, eligible_schemes: List[Dict[str, Any]], future_opportunities: List[Dict[str, Any]]) -> str:
    """Generates human-readable explanation summary."""
    p = _to_dict(profile)
    state_str = f" in {p.get('state')}" if p.get("state") else ""
    occ_str = f" as a {p.get('occupation')}" if p.get("occupation") else ""

    if eligible_schemes:
        top_scheme = eligible_schemes[0].get("scheme_name", "Scheme")
        return (
            f"Based on your profile{state_str}{occ_str}, you match {len(eligible_schemes)} government scheme(s). "
            f"Top recommendation: '{top_scheme}'. "
            f"You also have {len(future_opportunities)} potential future opportunity(ies)."
        )
    elif future_opportunities:
        return (
            f"No schemes are immediately active for your profile{state_str}, "
            f"but you have {len(future_opportunities)} potential future opportunity(ies) with minor requirement updates."
        )
    else:
        return "No matching schemes found for your input criteria at this moment."

def recommend_schemes(profile: Any, schemes: Optional[List[Any]] = None) -> Dict[str, Any]:
    """Main recommendation entry point."""
    if schemes is None:
        schemes = get_all_schemes(limit=1000)

    eligible, future_opps, _ = split_scheme_results(profile, schemes)
    ranked_eligible = rank_eligible_schemes(profile, eligible)
    bundle = build_recommended_bundle(profile, ranked_eligible)
    explanation = generate_explanation(profile, ranked_eligible, future_opps)

    if ranked_eligible:
        confidence_score = round(min(0.98, 0.65 + len(ranked_eligible) * 0.05), 2)
    elif future_opps:
        confidence_score = 0.50
    else:
        confidence_score = 0.20

    return {
        "eligible_schemes": ranked_eligible,
        "future_opportunities": future_opps,
        "recommended_bundle": bundle,
        "explanation": explanation,
        "confidence_score": confidence_score
    }
