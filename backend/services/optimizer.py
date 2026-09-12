"""
Autonomous Scheme-Bundle Optimizer — YojanaSetu (PS16)

Selects an explainable, optimized combination of government schemes
from among a citizen's eligible and possibly eligible schemes.

Pipeline position in PS16:
  Citizen Profile
  -> Eligible/Possibly Eligible Schemes (eligibility.py)
  -> Conflict Detection (conflict.py)
  -> Candidate Combinations (optimizer.py)
  -> Optimized Combination (optimizer.py)
  -> Explanation (optimizer.py)
  -> Missing Documents & Preparation Checklist (checklist.py)

Key Principles:
  1. Authoritative Eligibility: status from eligibility.py is authoritative.
     - not_eligible: strictly excluded from combinations.
     - confirmed_eligible / possibly_eligible: valid candidates.
     - Unresolved conditions are NOT treated as hard failures.
  2. Policy Conflict Incompatibility: Incompatible scheme pairs identified
     by conflict.py can never appear together in the same combination.
  3. Authoritative Backend Goal Taxonomy: 10 whitelist goal IDs.
     No dependency on frontend JavaScript.
  4. Honest Reality: Recommending schemes together does NOT claim a common
     government application portal, simultaneous submissions, or guaranteed approval.
  5. Sizing & Parsimony: Size-normalized scores. When scores are within 1.0 point,
     prefer smaller combinations to prevent bloat.
  6. Explainable Optimization Score: Normalized 0–100 composite score based on
     eligibility confidence, document readiness, goal alignment, and document synergy.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import itertools
from functools import cmp_to_key

from models.citizen import CitizenProfile


# ---------------------------------------------------------------------------
# Authoritative Backend Goal Taxonomy (10 Whitelist Goal IDs)
# ---------------------------------------------------------------------------
# Sourced directly from implementation_plan.md and verified scheme categories.
# If an unknown goal ID is passed, it is ignored safely.
# ---------------------------------------------------------------------------
VALID_GOAL_IDS: Set[str] = {
    "education",
    "employment",
    "healthcare",
    "skill_development",
    "housing",
    "agriculture",
    "business",
    "food_security",
    "pension",
    "disability_support",
}

GOAL_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "education": {
        "title": "Education",
        "categories": ["Education", "Education and Disability"],
        "related_categories": [
            "Skill Development",
            "Employment and Internship",
            "Skill Development and Social Empowerment",
        ],
        "schemes": [
            "Prime Minister's Scholarship Scheme",
            "Educational Assistance to the 10th to 12th Students",
            "National Means-Cum-Merit Scholarship Scheme",
            "National Overseas Scholarship For Scheduled Caste Candidates",
            "Post Matric Scholarship Students With Disabilities",
            "Post Matric Scholarship Scheme For The Students Belonging To Scheduled Tribe For Studies In India",
            "Post-Matric Scholarship To VJNT Students - Maharashtra",
            "National Overseas Scholarship For Students With Disabilities",
        ],
    },
    "employment": {
        "title": "Employment",
        "categories": ["Employment and Internship", "Skill Development", "Employment"],
        "related_categories": [
            "Education",
            "Skill Development and Social Empowerment",
            "Microenterprise Credit",
            "Artisans and Craftspeople",
            "Science and Technology",
        ],
        "schemes": [
            "Prime Minister’s Internship Scheme",
            "Prime Minister's Internship Scheme",
            "Craftsman Training Scheme - Maharashtra",
            "Pradhan Mantri Kaushal Vikas Yojana - Short Term Training",
            "PM-DAKSH",
            "Mahatma Gandhi National Rural Employment Guarantee Act",
            "Women Scientist Scheme-C",
        ],
    },
    "healthcare": {
        "title": "Healthcare",
        "categories": ["Health and Wellness", "Maternity and Nutrition", "Insurance", "Insurance and Social Security"],
        "related_categories": [
            "Food Security",
            "Social Security",
            "Disability and Social Welfare",
            "Housing",
            "Energy and Household Welfare",
            "Pension and Social Security",
        ],
        "schemes": [
            "Ayushman Bharat - PM-JAY",
            "Pradhan Mantri Matru Vandana Yojana",
            "Pradhan Mantri Jeevan Jyoti Bima Yojana",
            "Pradhan Mantri Suraksha Bima Yojana",
            "Aam Aadmi Bima Yojana (Maharashtra)",
        ],
    },
    "skill_development": {
        "title": "Skill Development",
        "categories": ["Skill Development", "Skill Development and Social Empowerment", "Science and Technology"],
        "related_categories": [
            "Employment and Internship",
            "Education",
            "Microenterprise Credit",
            "Artisans and Craftspeople",
            "Employment",
        ],
        "schemes": [
            "Craftsman Training Scheme - Maharashtra",
            "Pradhan Mantri Kaushal Vikas Yojana - Short Term Training",
            "PM-DAKSH",
            "PM Vishwakarma",
            "Skill Loan Scheme",
            "Women Scientist Scheme-C",
        ],
    },
    "housing": {
        "title": "Housing",
        "categories": ["Housing", "Energy and Household Welfare"],
        "related_categories": [
            "Health and Wellness",
            "Food Security",
            "Social Security",
        ],
        "schemes": [
            "Pradhan Mantri Awas Yojana - Urban",
            "Pradhan Mantri Awaas Yojana - Gramin",
            "Pradhan Mantri Ujjwala Yojana 2.0",
        ],
    },
    "agriculture": {
        "title": "Agriculture",
        "categories": ["Agriculture and Crop Insurance", "Agriculture and Income Support", "Agriculture", "Agriculture and Women Empowerment"],
        "related_categories": [
            "Health and Wellness",
            "Insurance",
            "Food Security",
            "Housing",
            "Energy and Household Welfare",
            "Social Security",
            "Pension and Social Security",
        ],
        "schemes": [
            "Pradhan Mantri Kisan Samman Nidhi",
            "Pradhan Mantri Fasal Bima Yojana",
            "Pradhan Mantri Krishi Sinchayee Yojana: Per Drop More Crop",
            "Mahila Kisan Yojana (Maharashtra)",
        ],
    },
    "business": {
        "title": "Business",
        "categories": ["Microenterprise Credit", "Artisans and Craftspeople", "Business and Entrepreneurship", "Microenterprise Credit and Women Empowerment"],
        "related_categories": [
            "Skill Development",
            "Employment and Internship",
            "Skill Development and Social Empowerment",
            "Banking and Financial Inclusion",
        ],
        "schemes": [
            "Pradhan Mantri Mudra Yojana",
            "PM Vishwakarma",
            "Stand-Up India",
            "Mahila Samridhi Yojana (Maharashtra)",
            "National Pension Scheme For Traders And Self Employed Persons",
        ],
    },
    "food_security": {
        "title": "Food Security",
        "categories": ["Food Security"],
        "related_categories": [
            "Health and Wellness",
            "Maternity and Nutrition",
            "Social Security",
            "Agriculture and Income Support",
            "Energy and Household Welfare",
        ],
        "schemes": [
            "Pradhan Mantri Garib Kalyan Anna Yojana",
        ],
    },
    "pension": {
        "title": "Pension",
        "categories": ["Pension and Social Security", "Social Security", "Banking and Financial Inclusion"],
        "related_categories": [
            "Health and Wellness",
            "Insurance",
            "Food Security",
            "Disability and Social Welfare",
        ],
        "schemes": [
            "Atal Pension Yojana",
            "National Family Benefit Scheme",
            "Indira Gandhi National Old Age Pension Scheme",
            "Indira Gandhi National Widow Pension Scheme",
            "Indira Gandhi National Disability Pension Scheme",
            "National Pension Scheme For Traders And Self Employed Persons",
            "Pradhan Mantri Jan Dhan Yojana",
        ],
    },
    "disability_support": {
        "title": "Disability Support",
        "categories": ["Disability and Social Welfare", "Education and Disability"],
        "related_categories": [
            "Health and Wellness",
            "Social Security",
            "Pension and Social Security",
            "Education",
        ],
        "schemes": [
            "Homes For Intellectually Impaired Persons",
            "Indira Gandhi National Disability Pension Scheme",
            "Post Matric Scholarship Students With Disabilities",
            "National Overseas Scholarship For Students With Disabilities",
        ],
    },
}


# ---------------------------------------------------------------------------
# Objective Weight Profiles (Approved in implementation_plan.md)
# ---------------------------------------------------------------------------
# Each profile represents an understandable citizen optimization strategy.
# All weights sum to 1.0 (100%).
# ---------------------------------------------------------------------------
OBJECTIVE_WEIGHTS = {
    "best_overall": {
        "label": "Best Overall Combination",
        "eligibility": 0.35,
        "readiness": 0.25,
        "goal": 0.30,
        "synergy": 0.10,
        "purpose": "Balances verified eligibility, declared goals, and realistic documentation.",
    },
    "most_ready_now": {
        "label": "Most Ready Now",
        "eligibility": 0.25,
        "readiness": 0.55,
        "goal": 0.15,
        "synergy": 0.05,
        "purpose": "Prioritizes combinations requiring the least additional document preparation.",
    },
    "goal_focused": {
        "label": "Goal Focused",
        "eligibility": 0.25,
        "readiness": 0.15,
        "goal": 0.55,
        "synergy": 0.05,
        "purpose": "Maximizes direct alignment with your declared assistance goals.",
    },
}


def _url_slug(source_url: str) -> str:
    """Extract the last path segment from a myscheme URL as the scheme slug."""
    if not source_url:
        return ""
    return source_url.rstrip("/").split("/")[-1].lower()


def _sanitize_goals(raw_goals: Optional[Any]) -> List[str]:
    """
    Safely extract and validate goal IDs against VALID_GOAL_IDS.
    Accepts None, list of strings, or comma-separated string.
    Ignores invalid IDs without crashing.
    """
    if not raw_goals:
        return []

    tokens: List[str] = []
    if isinstance(raw_goals, str):
        tokens = [t.strip().lower() for t in raw_goals.split(",") if t.strip()]
    elif isinstance(raw_goals, (list, tuple, set)):
        for item in raw_goals:
            if isinstance(item, str):
                for sub in item.split(","):
                    sub_clean = sub.strip().lower()
                    if sub_clean:
                        tokens.append(sub_clean)

    # Whitelist validation
    valid_goals = [g for g in tokens if g in VALID_GOAL_IDS]
    # Preserve order while removing duplicates
    seen = set()
    result = []
    for g in valid_goals:
        if g not in seen:
            seen.add(g)
            result.append(g)
    return result


def _is_conflict_free(combo_schemes: Tuple[Dict[str, Any], ...], conflicts: List[Dict[str, Any]]) -> bool:
    """
    Verify that no two schemes in combo_schemes have a registered policy conflict.
    """
    combo_slugs = {_url_slug(s.get("source_url", "")) for s in combo_schemes}
    for c in conflicts:
        slug_a = c.get("slug_a", "").lower()
        slug_b = c.get("slug_b", "").lower()
        if slug_a and slug_b and slug_a in combo_slugs and slug_b in combo_slugs:
            return False
    return True


def _calculate_eligibility_confidence(scheme: Dict[str, Any]) -> float:
    """
    Calculate eligibility confidence score (0 to 100) for a single scheme:
    - confirmed_eligible: 100 points
    - possibly_eligible: max(20.0, 100.0 - (15.0 * unresolved_count))
    Unresolved conditions reduce confidence, but never become hard disqualifications.
    """
    status = scheme.get("status")
    if status == "confirmed_eligible":
        return 100.0

    unresolved = scheme.get("reasons", {}).get("unresolved", [])
    count = len(unresolved)
    return max(20.0, 100.0 - (15.0 * count))


def _calculate_scheme_goal_score(scheme: Dict[str, Any], valid_goals: List[str]) -> Tuple[float, Optional[str], str]:
    """
    Calculate goal alignment (0 to 100) for a single scheme:
    - If no goals provided: neutral baseline 50.0 ('neutral').
    - Direct match (1.0): 100.0 ('direct').
    - Related match (0.5): 50.0 ('related').
    - Unrelated (0.1): 10.0 ('unrelated').
    Returns (score, matched_goal_title, match_type).
    """
    if not valid_goals:
        return 50.0, None, "neutral"

    scheme_name = (scheme.get("scheme_name") or scheme.get("name") or "").lower()
    scheme_cat = (scheme.get("category") or "").lower()

    # 1. Direct match check (1.0 = 100.0)
    for gid in valid_goals:
        definition = GOAL_DEFINITIONS.get(gid, {})
        # Check scheme name match
        for s_match in definition.get("schemes", []):
            if s_match.lower() in scheme_name or scheme_name in s_match.lower():
                return 100.0, definition.get("title"), "direct"

        # Check direct category match
        for c_match in definition.get("categories", []):
            if c_match.lower() in scheme_cat or scheme_cat in c_match.lower():
                return 100.0, definition.get("title"), "direct"

    # 2. Related broad category check (0.5 = 50.0)
    for gid in valid_goals:
        definition = GOAL_DEFINITIONS.get(gid, {})
        for r_match in definition.get("related_categories", []):
            if r_match.lower() in scheme_cat or scheme_cat in r_match.lower():
                return 50.0, definition.get("title"), "related"

    # 3. Unrelated (0.1 = 10.0)
    return 10.0, None, "unrelated"


def _get_combination_documents(
    combo_schemes: Tuple[Dict[str, Any], ...],
    checklist: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Extract document metrics for a specific combination using checklist.py output:
    - known_present docs
    - known_missing docs
    - verification_required docs
    - gross document requirement count (sum across schemes)
    """
    scheme_names = {s.get("scheme_name") for s in combo_schemes}

    held_docs: Set[str] = set()
    missing_docs: Set[str] = set()
    verify_docs: Set[str] = set()

    for item in checklist.get("known_present", []):
        doc = item.get("document")
        target_schemes = set(item.get("schemes", []))
        if doc and target_schemes.intersection(scheme_names):
            held_docs.add(doc)

    for item in checklist.get("known_missing", []):
        doc = item.get("document")
        target_schemes = set(item.get("schemes", []))
        if doc and target_schemes.intersection(scheme_names):
            missing_docs.add(doc)

    for item in checklist.get("verification_required", []):
        doc = item.get("document")
        target_schemes = set(item.get("schemes", []))
        if doc and target_schemes.intersection(scheme_names):
            verify_docs.add(doc)

    # Gross document count = sum of documents needed per scheme
    gross_count = 0
    for s in combo_schemes:
        s_name = s.get("scheme_name")
        for bucket in ("known_present", "known_missing", "verification_required"):
            for item in checklist.get(bucket, []):
                if s_name in item.get("schemes", []):
                    gross_count += 1

    unique_needed = len(held_docs) + len(missing_docs) + len(verify_docs)

    return {
        "held_docs": sorted(list(held_docs)),
        "missing_docs": sorted(list(missing_docs)),
        "verify_docs": sorted(list(verify_docs)),
        "unique_needed": unique_needed,
        "gross_count": gross_count,
    }


def _evaluate_combination(
    combo: Tuple[Dict[str, Any], ...],
    checklist: Dict[str, Any],
    valid_goals: List[str],
) -> Dict[str, Any]:
    """
    Evaluate all 4 normalized metrics (0–100) for a given combination of schemes:
    1. Eligibility Confidence
    2. Document Readiness
    3. Goal Alignment
    4. Document Synergy
    """
    size = len(combo)
    if size == 0:
        return {
            "eligibility_confidence": 0.0,
            "document_readiness_pct": 0.0,
            "goal_alignment_pct": 0.0,
            "document_synergy_pct": 0.0,
            "doc_details": {"held_docs": [], "missing_docs": [], "verify_docs": [], "unique_needed": 0},
            "scheme_evals": [],
        }

    # 1. Eligibility Confidence (normalized average across schemes)
    elig_scores = [_calculate_eligibility_confidence(s) for s in combo]
    avg_elig = sum(elig_scores) / size

    # 2. Goal Alignment (normalized average across schemes)
    goal_evals = [_calculate_scheme_goal_score(s, valid_goals) for s in combo]
    goal_scores = [ge[0] for ge in goal_evals]
    avg_goal = sum(goal_scores) / size

    # 3. Document Readiness & 4. Document Synergy
    doc_info = _get_combination_documents(combo, checklist)
    unique_docs = doc_info["unique_needed"]
    held_docs_count = len(doc_info["held_docs"])
    gross_docs = doc_info["gross_count"]

    if unique_docs == 0:
        doc_readiness = 100.0
    else:
        doc_readiness = (held_docs_count / unique_docs) * 100.0

    if gross_docs <= 1 or unique_docs == 0:
        doc_synergy = 0.0
    else:
        # Preparation overlap efficiency: higher reuse of documents across schemes
        doc_synergy = max(0.0, min(100.0, (1.0 - (unique_docs / gross_docs)) * 100.0))

    scheme_evals = []
    for idx, s in enumerate(combo):
        scheme_evals.append({
            "scheme": s,
            "eligibility_confidence": round(elig_scores[idx], 1),
            "goal_score": round(goal_scores[idx], 1),
            "matched_goal_title": goal_evals[idx][1],
            "goal_match_type": goal_evals[idx][2],
        })

    return {
        "size": size,
        "eligibility_confidence": round(avg_elig, 1),
        "document_readiness_pct": round(doc_readiness, 1),
        "goal_alignment_pct": round(avg_goal, 1),
        "document_synergy_pct": round(doc_synergy, 1),
        "doc_details": doc_info,
        "scheme_evals": scheme_evals,
    }


def _compute_composite_score(metrics: Dict[str, Any], objective_key: str) -> float:
    """
    Compute the composite optimization score for an objective using approved weights.
    Returns float in range [0.0, 100.0].
    """
    weights = OBJECTIVE_WEIGHTS[objective_key]
    score = (
        (weights["eligibility"] * metrics["eligibility_confidence"])
        + (weights["readiness"] * metrics["document_readiness_pct"])
        + (weights["goal"] * metrics["goal_alignment_pct"])
        + (weights["synergy"] * metrics["document_synergy_pct"])
    )
    return round(score, 1)


def _compare_combos(a: Dict[str, Any], b: Dict[str, Any]) -> int:
    """
    Parsimony comparator for combinations:
    1. Higher optimization score is better.
    2. Parsimony Tie-Breaker: If scores are within 1.0 point, prefer smaller size.
    3. If same size and within 1.0 point, prefer higher document readiness, then eligibility.
    """
    diff = a["composite_score"] - b["composite_score"]
    if abs(diff) > 1.0:
        return 1 if diff > 0 else -1

    # Within 1.0 point: prefer smaller combination to avoid bloat
    if a["size"] != b["size"]:
        return 1 if a["size"] < b["size"] else -1

    # Same size and within 1.0 point: prefer higher document readiness
    readiness_diff = a["document_readiness_pct"] - b["document_readiness_pct"]
    if abs(readiness_diff) > 0.05:
        return 1 if readiness_diff > 0 else -1

    # Tertiary: higher eligibility confidence
    elig_diff = a["eligibility_confidence"] - b["eligibility_confidence"]
    if abs(elig_diff) > 0.05:
        return 1 if elig_diff > 0 else -1

    return 0


def _build_scheme_contribution(
    scheme: Dict[str, Any],
    scheme_eval: Dict[str, Any],
    valid_goals: List[str],
) -> str:
    """
    Build an honest, plain-English contribution reason based strictly on verified data.
    """
    parts = []
    status = scheme.get("status")
    passed = scheme.get("reasons", {}).get("passed", [])

    if status == "confirmed_eligible":
        parts.append(f"Confirmed eligible meeting {len(passed)} verified profile condition(s).")
    elif len(passed) > 0:
        parts.append(f"Satisfies {len(passed)} verified eligibility condition(s).")
    else:
        parts.append("Profile satisfies initial demographic filters.")

    matched_goal = scheme_eval.get("matched_goal_title")
    match_type = scheme_eval.get("goal_match_type")
    if match_type == "direct" and matched_goal:
        parts.append(f"Directly addresses your '{matched_goal}' goal.")
    elif match_type == "related" and matched_goal:
        parts.append(f"Provides complementary support related to your '{matched_goal}' needs.")

    return " ".join(parts)


def _format_combination_result(
    combo_data: Dict[str, Any],
    rank: int,
    objective_key: str,
    valid_goals: List[str],
    is_alternative: bool = False,
    primary_schemes: Optional[Set[str]] = None,
) -> Dict[str, Any]:
    """
    Format a combination into the structured, explainable JSON output.
    """
    objective_meta = OBJECTIVE_WEIGHTS[objective_key]
    schemes_output = []

    for se in combo_data["scheme_evals"]:
        s = se["scheme"]
        schemes_output.append({
            "scheme_id": s.get("scheme_id") or s.get("id"),
            "scheme_name": s.get("scheme_name") or s.get("name"),
            "category": s.get("category"),
            "scope": s.get("scope"),
            "status": s.get("status"),
            "benefit": s.get("benefit"),
            "source_url": s.get("source_url"),
            "contribution_reason": _build_scheme_contribution(s, se, valid_goals),
        })

    doc_details = combo_data["doc_details"]

    explanation: Dict[str, str] = {
        "strategy_label": objective_meta["label"],
        "strategy_purpose": objective_meta["purpose"],
    }

    if not is_alternative:
        explanation["why_ranked_first"] = (
            f"Achieved the highest balanced score ({combo_data['composite_score']}/100) across eligibility "
            f"certainty ({combo_data['eligibility_confidence']}%), document readiness ({combo_data['document_readiness_pct']}%), "
            f"and goal alignment ({combo_data['goal_alignment_pct']}%)."
        )
    else:
        # Explain trade-off vs primary
        if primary_schemes:
            current_schemes = {s["scheme_name"] for s in schemes_output}
            swapped_in = current_schemes - primary_schemes
            swapped_out = primary_schemes - current_schemes

            trade_off_parts = []
            if swapped_in:
                trade_off_parts.append(f"Focuses on {', '.join(swapped_in)}")
            if swapped_out:
                trade_off_parts.append(f"in place of {', '.join(swapped_out)}")

            explanation["why_different_from_primary"] = (
                f"Different optimization objective ({objective_meta['label']}). "
                f"{' '.join(trade_off_parts)}. Score: {combo_data['composite_score']}/100."
            )
        else:
            explanation["why_different_from_primary"] = f"Prioritizes {objective_meta['label']}."

    return {
        "rank": rank,
        "objective": objective_key,
        "label": objective_meta["label"],
        "optimization_score": combo_data["composite_score"],
        "scheme_count": combo_data["size"],
        "schemes": schemes_output,
        "metrics": {
            "eligibility_confidence": combo_data["eligibility_confidence"],
            "document_readiness_pct": combo_data["document_readiness_pct"],
            "goal_alignment_pct": combo_data["goal_alignment_pct"],
            "document_synergy_pct": combo_data["document_synergy_pct"],
            "documents_already_held": doc_details["held_docs"],
            "documents_still_needed": doc_details["missing_docs"],
            "documents_to_verify": doc_details["verify_docs"],
            "conflicts_avoided": [],
        },
        "explanation": explanation,
    }


def run_optimization(
    citizen: CitizenProfile,
    eligibility_report: Dict[str, Any],
    conflicts: List[Dict[str, Any]],
    checklist: Dict[str, Any],
    goals: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Main entry point for the PS16 Autonomous Scheme-Bundle Optimizer.

    Evaluates candidate schemes returned by eligibility.py, filters verified conflicts,
    and returns:
      - primary: Best Overall Combination
      - alternatives: Genuinely distinct alternatives (Most Ready Now, Goal Focused)
      - metadata: disclaimer, evaluated count, active goals

    Guarantees:
      - Additive only: Does not mutate existing inputs.
      - Never crashes on invalid goals.
      - Uses authoritative backend eligibility and conflict outputs.
    """
    valid_goals = _sanitize_goals(goals)

    # 1. Build Candidate Pool C from existing eligibility results
    all_results = (
        eligibility_report.get("results", [])
        if isinstance(eligibility_report, dict)
        else eligibility_report
    )

    # Slugs excluded by active conflict (e.g. pmv when active MUDRA loan is True)
    conflict_excluded_slugs: Set[str] = set()
    for c in conflicts:
        cid = c.get("conflict_id")
        if cid == "pmv_vs_active_mudra_loan":
            conflict_excluded_slugs.add(c.get("slug_a", "pmv").lower())

    candidates: List[Dict[str, Any]] = []
    for s in all_results:
        # Rule: status == "not_eligible" is strictly excluded
        if s.get("status") not in ("confirmed_eligible", "possibly_eligible"):
            continue

        slug = _url_slug(s.get("source_url", ""))
        if slug in conflict_excluded_slugs:
            continue

        candidates.append(s)

    candidate_count = len(candidates)

    disclaimer = (
        "This score is used only to rank scheme combinations using profile fit, readiness, goals, "
        "and document efficiency. It is not an approval probability."
    )

    # --- Edge Case 0: 0 candidates ---
    if candidate_count == 0:
        return {
            "disclaimer": disclaimer,
            "active_goals": valid_goals,
            "candidate_pool_size": 0,
            "total_candidates_evaluated": 0,
            "primary": None,
            "alternatives": [],
            "message": "No eligible schemes are currently available based on your profile.",
        }

    # --- Edge Case 1: 1–2 candidates ---
    if candidate_count <= 2:
        combo_tuple = tuple(candidates)
        metrics = _evaluate_combination(combo_tuple, checklist, valid_goals)
        metrics["composite_score"] = _compute_composite_score(metrics, "best_overall")

        primary_result = _format_combination_result(
            metrics, rank=1, objective_key="best_overall", valid_goals=valid_goals
        )

        return {
            "disclaimer": disclaimer,
            "active_goals": valid_goals,
            "candidate_pool_size": candidate_count,
            "total_candidates_evaluated": 1,
            "primary": primary_result,
            "alternatives": [],
            "message": f"Returned the {candidate_count} available valid scheme(s).",
        }

    # --- Standard Case: >= 3 candidates ---
    # Allowed sizes rule:
    # If 3 to 5 candidates: sizes k in [3, candidate_count]
    # If > 5 candidates: sizes k in {3, 4, 5}
    if candidate_count <= 5:
        allowed_sizes = list(range(3, candidate_count + 1))
    else:
        allowed_sizes = [3, 4, 5]

    # Enumerate all candidate combinations and filter pairwise conflicts
    valid_combos_tuples: List[Tuple[Dict[str, Any], ...]] = []
    for k in allowed_sizes:
        for combo in itertools.combinations(candidates, k):
            if _is_conflict_free(combo, conflicts):
                valid_combos_tuples.append(combo)

    total_evaluated = len(valid_combos_tuples)
    if total_evaluated == 0:
        return {
            "disclaimer": disclaimer,
            "active_goals": valid_goals,
            "candidate_pool_size": candidate_count,
            "total_candidates_evaluated": 0,
            "primary": None,
            "alternatives": [],
            "message": "No conflict-free combinations could be formed from eligible schemes.",
        }

    # Pre-evaluate base metrics for all combinations
    pre_evaluated: List[Dict[str, Any]] = []
    for ct in valid_combos_tuples:
        base_metrics = _evaluate_combination(ct, checklist, valid_goals)
        pre_evaluated.append(base_metrics)

    # 1. Rank for BEST OVERALL
    best_overall_list = []
    for item in pre_evaluated:
        c_item = dict(item)
        c_item["composite_score"] = _compute_composite_score(item, "best_overall")
        best_overall_list.append(c_item)

    best_overall_sorted = sorted(best_overall_list, key=cmp_to_key(_compare_combos), reverse=True)
    best_overall_winner = best_overall_sorted[0]

    primary_result = _format_combination_result(
        best_overall_winner, rank=1, objective_key="best_overall", valid_goals=valid_goals
    )
    primary_scheme_names = {s["scheme_name"] for s in primary_result["schemes"]}

    # Helper to check meaningful difference from primary
    def is_meaningfully_different(combo_item: Dict[str, Any]) -> bool:
        combo_names = {se["scheme"].get("scheme_name") for se in combo_item["scheme_evals"]}
        symmetric_diff = combo_names.symmetric_difference(primary_scheme_names)
        # For size >= 4, require at least 2 schemes difference
        # For size == 3, require at least 1 scheme difference
        if len(primary_scheme_names) >= 4:
            return len(symmetric_diff) >= 2
        return len(symmetric_diff) >= 1

    alternatives: List[Dict[str, Any]] = []
    rank_counter = 2
    used_alternative_signatures: Set[Tuple[str, ...]] = {tuple(sorted(list(primary_scheme_names)))}

    # 2. Rank for MOST READY NOW
    ready_list = []
    for item in pre_evaluated:
        c_item = dict(item)
        c_item["composite_score"] = _compute_composite_score(item, "most_ready_now")
        ready_list.append(c_item)

    ready_sorted = sorted(ready_list, key=cmp_to_key(_compare_combos), reverse=True)

    ready_winner = None
    for candidate_item in ready_sorted:
        c_sig = tuple(sorted([se["scheme"].get("scheme_name") for se in candidate_item["scheme_evals"]]))
        if c_sig not in used_alternative_signatures and is_meaningfully_different(candidate_item):
            ready_winner = candidate_item
            used_alternative_signatures.add(c_sig)
            break

    if ready_winner is not None:
        alt_ready_result = _format_combination_result(
            ready_winner,
            rank=rank_counter,
            objective_key="most_ready_now",
            valid_goals=valid_goals,
            is_alternative=True,
            primary_schemes=primary_scheme_names,
        )
        alternatives.append(alt_ready_result)
        rank_counter += 1

    # 3. Rank for GOAL FOCUSED (only meaningful if goals were provided)
    if valid_goals:
        goal_list = []
        for item in pre_evaluated:
            c_item = dict(item)
            c_item["composite_score"] = _compute_composite_score(item, "goal_focused")
            goal_list.append(c_item)

        goal_sorted = sorted(goal_list, key=cmp_to_key(_compare_combos), reverse=True)

        goal_winner = None
        for candidate_item in goal_sorted:
            c_sig = tuple(sorted([se["scheme"].get("scheme_name") for se in candidate_item["scheme_evals"]]))
            if c_sig not in used_alternative_signatures and is_meaningfully_different(candidate_item):
                goal_winner = candidate_item
                used_alternative_signatures.add(c_sig)
                break

        if goal_winner is not None:
            alt_goal_result = _format_combination_result(
                goal_winner,
                rank=rank_counter,
                objective_key="goal_focused",
                valid_goals=valid_goals,
                is_alternative=True,
                primary_schemes=primary_scheme_names,
            )
            alternatives.append(alt_goal_result)
            rank_counter += 1

    return {
        "disclaimer": disclaimer,
        "active_goals": valid_goals,
        "candidate_pool_size": candidate_count,
        "total_candidates_evaluated": total_evaluated,
        "primary": primary_result,
        "alternatives": alternatives,
    }
