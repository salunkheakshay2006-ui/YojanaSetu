"""
Application Checklist & Missing-Document Service — YojanaSetu

Inspects the schemes in the recommended bundle and their documents_summary,
categorizing each required document into one of three strict statuses:
  1. known_present        — directly substantiated by positive citizen profile fields
  2. known_missing        — directly contradicted by negative citizen profile fields
  3. verification_required — cannot be determined from profile; citizen must verify

Rules:
  - Generated ONLY from schemes present in the recommended bundle.
  - Excludes schemes that are not_eligible or pruned due to conflicts.
  - Deduplicates common documents across multiple schemes.
  - No document requirements or citizen attributes are invented.
"""

from typing import Any, Dict, List, Set, Tuple
from models.citizen import CitizenProfile


def _normalize_doc_phrase(raw: str) -> Tuple[str, str, str]:
    """
    Map a raw phrase from documents_summary to:
      (canonical_document_name, default_action_if_missing, default_note_if_unverified)
    """
    p = raw.strip()
    pl = p.lower()

    # 1. Bank Account & Passbook
    if "bank" in pl or "passbook" in pl:
        return (
            "Bank or Post-Office Account Passbook",
            "Open a savings account with any commercial bank or post office to receive direct benefit transfers.",
            "Passbook or bank statement showing account number and IFSC code.",
        )

    # 2. Ration Card
    if "ration" in pl:
        return (
            "Ration Card",
            "Apply for an eligible ration card (such as AAY or PHH) at your local civil supplies office.",
            "Valid ration card issued by the State Food & Civil Supplies Department.",
        )

    # 3. Land records / Landholding papers
    if "land" in pl:
        return (
            "Agricultural Landholding Records / Proof of Land",
            "Obtain certified landownership records (such as 7/12 extract or RoR) for cultivable land.",
            "Certified land ownership papers, tenancy contract, or sharecropper agreement as applicable.",
        )

    # 4. Worker Welfare Board
    if "worker-board" in pl:
        return (
            "BOCW Worker Welfare Board Registration Card",
            "Register with the Building & Other Construction Workers Board to obtain your worker ID.",
            "Active registration card issued by the Maharashtra BOCW Welfare Board.",
        )

    # 5. ITI Admission
    if "iti" in pl:
        return (
            "ITI Admission / Enrollment Proof",
            "Secure formal admission in an approved Industrial Training Institute.",
            "Official admission receipt or bonafide student certificate from your ITI.",
        )

    # 6. Aadhaar
    if "aadhaar" in pl:
        return (
            "Aadhaar Card",
            "Apply for or update your Aadhaar card at an authorized enrolment centre.",
            "Aadhaar card with an active linked mobile number for authentication and e-KYC.",
        )

    # 7. Maternal / Child Health records
    if "mcp" in pl or "rchi" in pl or "pregnancy" in pl:
        return (
            "Mother & Child Protection (MCP / RCHI) Card",
            "Register your pregnancy at the local Anganwadi centre or Primary Health Centre to obtain an MCP card.",
            "MCP card and pregnancy/child health records issued by local health authorities.",
        )

    # 8. Death certificate
    if "death" in pl:
        return (
            "Death Certificate of Primary Breadwinner",
            "Obtain the official death certificate from the local registrar or municipal body.",
            "Original or certified copy of the death certificate of the deceased breadwinner.",
        )

    # 9. Disability certificate
    if "disability" in pl:
        return (
            "Disability Certificate",
            "Obtain a disability certificate from an authorized government medical board or hospital.",
            "Valid certificate indicating the type and percentage of disability.",
        )

    # 10. Caste / Category certificate
    if "caste" in pl or "community" in pl:
        return (
            "Caste / Category Certificate",
            "Apply for a caste/category certificate through your district revenue office or citizen portal.",
            "Valid caste/category certificate issued by the competent authority, if claiming reservation.",
        )

    # 11. Domicile / Residence certificate
    if "domicile" in pl:
        return (
            "Domicile / Residence Certificate",
            "Apply for a state domicile certificate at the local Tehsildar / revenue office.",
            "State domicile certificate or resident proof issued by the competent authority.",
        )

    # 12. Income certificate / BPL document
    if "income" in pl or "bpl" in pl:
        return (
            "Income Certificate / BPL Document",
            "Obtain an income certificate or BPL proof from the local revenue or municipal authority.",
            "Recent income certificate or BPL record issued by the competent local authority.",
        )

    # 13. Photographs
    if "photo" in pl:
        return (
            "Passport-size Photographs",
            "Keep recent passport-size color photographs ready for the application form.",
            "Recent passport-size color photographs.",
        )

    # 14. Academic / Marksheets
    if any(k in pl for k in ("marksheet", "academic", "admission", "education")):
        return (
            "Academic Marksheets & Educational Records",
            "Collect original or attested copies of qualifying examination marksheets.",
            "Original or attested marksheets and certificates for qualifying education.",
        )

    # 15. Business / Trade Records
    if any(k in pl for k in ("business", "trade", "project report", "quotation")):
        return (
            "Business Proof & Project / Quotation Records",
            "Prepare enterprise proof, quotations, or project estimates required by the lending institution.",
            "Trade license, Udyam registration, quotation, or project proposal as applicable.",
        )

    # 16. Consent / Enrolment Form
    if "consent" in pl or "enrolment" in pl:
        return (
            "Scheme Application / Consent Form",
            "Collect and fill out the official enrolment and auto-debit consent form.",
            "Prescribed application or auto-debit consent form available from the bank or portal.",
        )

    # 17. General Identity & Address Proof
    if "identity" in pl or "address" in pl or "residence" in pl:
        return (
            "Identity & Address Proof",
            "Obtain a valid government photo ID and address document (Voter ID, Driving License, or Utility Bill).",
            "Valid photo identity and current residential address proof.",
        )

    # Default fallback
    clean_title = p.title()
    return (
        clean_title,
        f"Obtain {clean_title} as specified by the scheme guidelines.",
        f"Verify the exact format for {clean_title} on the official scheme portal.",
    )


def generate_application_checklist(
    citizen: CitizenProfile,
    bundle: Any,
    available_docs: Optional[Set[str]] = None,
) -> Dict[str, Any]:
    """
    Generate an application checklist for the schemes in the recommended bundle.

    Evaluates each document requirement against the citizen profile and available_docs:
      - known_present: profile confirms citizen has it OR document is in available_docs
      - known_missing: profile confirms citizen does NOT have it OR document is missing from citizen's available_docs
      - verification_required: cannot be determined from profile when available_docs is not supplied
    """
    # 1. Extract the recommended bundle list
    bundle_schemes: List[Dict[str, Any]] = (
        bundle.get("bundle", []) if isinstance(bundle, dict) else bundle
    )

    # Mapping: doc_name -> { "status": str, "action": str, "note": str, "schemes": Set[str] }
    doc_registry: Dict[str, Dict[str, Any]] = {}

    for scheme in bundle_schemes:
        scheme_name = scheme.get("scheme_name", "Unknown Scheme")
        doc_summary = scheme.get("documents_summary") or ""

        if not doc_summary.strip():
            continue

        raw_items = [item.strip() for item in doc_summary.split(";") if item.strip()]

        for raw_item in raw_items:
            doc_name, default_action, default_note = _normalize_doc_phrase(raw_item)

            if doc_name not in doc_registry:
                # Determine status based on citizen profile and available_docs
                pl = raw_item.lower()

                # --- Status classification logic ---
                status = "verification_required"
                action = default_action
                note = default_note

                if "bank" in pl or "passbook" in pl:
                    if getattr(citizen, "has_bank_account", False):
                        status = "known_present"
                    else:
                        status = "known_missing"

                elif "ration" in pl:
                    ration_type = getattr(citizen, "ration_card_type", "none")
                    if hasattr(ration_type, "value"):
                        ration_type = ration_type.value
                    if ration_type in ("AAY", "PHH", "NPHH"):
                        status = "known_present"
                    else:
                        status = "known_missing"

                elif "land" in pl:
                    if getattr(citizen, "owns_land", False):
                        status = "known_present"
                    else:
                        # PM-Kisan strictly requires land; for other schemes (like PMFBY) tenancy is also valid
                        is_pm_kisan = "kisan" in scheme_name.lower() or "pm-kisan" in scheme.get("source_url", "").lower()
                        if is_pm_kisan:
                            status = "known_missing"
                        else:
                            status = "verification_required"
                else:
                    # All other documents (Aadhaar, PAN, certificates, etc.) cannot be verified from profile alone
                    status = "verification_required"

                # If caller provided citizen's available_docs, reconcile directly:
                if available_docs is not None:
                    if doc_name in available_docs:
                        status = "known_present"
                    else:
                        status = "known_missing"

                doc_registry[doc_name] = {
                    "document": doc_name,
                    "status": status,
                    "action": action,
                    "note": note,
                    "schemes": set(),
                }

            doc_registry[doc_name]["schemes"].add(scheme_name)

    # Group into the three required categories
    known_present: List[Dict[str, Any]] = []
    known_missing: List[Dict[str, Any]] = []
    verification_required: List[Dict[str, Any]] = []

    for doc_name, entry in sorted(doc_registry.items()):
        schemes_list = sorted(list(entry["schemes"]))
        status = entry["status"]

        if status == "known_present":
            known_present.append({
                "document": doc_name,
                "schemes": schemes_list,
            })
        elif status == "known_missing":
            known_missing.append({
                "document": doc_name,
                "schemes": schemes_list,
                "action": entry["action"],
            })
        else:
            verification_required.append({
                "document": doc_name,
                "schemes": schemes_list,
                "note": entry["note"],
            })

    total_unique = len(known_present) + len(known_missing) + len(verification_required)

    return {
        "summary": {
            "total_unique_documents": total_unique,
            "known_present_count": len(known_present),
            "known_missing_count": len(known_missing),
            "verification_required_count": len(verification_required),
        },
        "known_present": known_present,
        "known_missing": known_missing,
        "verification_required": verification_required,
    }
