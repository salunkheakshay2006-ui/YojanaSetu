/**
 * Authoritative list of standard documents recognized across government welfare schemes.
 * Derived from the normalization mapping in backend/services/checklist.py.
 */

export const STANDARD_DOCUMENTS = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    category: "Identity",
    description: "Aadhaar card with active mobile number linked for authentication & e-KYC.",
  },
  {
    id: "bank_passbook",
    name: "Bank or Post-Office Account Passbook",
    category: "Financial",
    description: "Passbook or bank statement showing account number and IFSC code for direct cash transfers.",
  },
  {
    id: "ration_card",
    name: "Ration Card",
    category: "Welfare",
    description: "Valid ration card (AAY, PHH, or NPHH) issued by Food & Civil Supplies Department.",
  },
  {
    id: "income_certificate",
    name: "Income Certificate / BPL Document",
    category: "Income",
    description: "Recent income certificate or BPL proof issued by competent local authority.",
  },
  {
    id: "domicile_certificate",
    name: "Domicile / Residence Certificate",
    category: "Residence",
    description: "State domicile certificate or resident proof issued by Tehsildar / revenue office.",
  },
  {
    id: "caste_certificate",
    name: "Caste / Category Certificate",
    category: "Category",
    description: "Valid caste/category certificate for SC/ST/OBC/EWS reservations and welfare schemes.",
  },
  {
    id: "land_records",
    name: "Agricultural Landholding Records / Proof of Land",
    category: "Agriculture",
    description: "Certified land ownership records (such as 7/12 extract or RoR) for cultivable land.",
  },
  {
    id: "disability_certificate",
    name: "Disability Certificate",
    category: "Special",
    description: "Valid certificate indicating percentage of disability from government medical board.",
  },
  {
    id: "mcp_card",
    name: "Mother & Child Protection (MCP / RCHI) Card",
    category: "Healthcare",
    description: "Pregnancy registration card issued by Anganwadi centre or Primary Health Centre.",
  },
  {
    id: "bocw_card",
    name: "BOCW Worker Welfare Board Registration Card",
    category: "Livelihood",
    description: "Active registration card issued by Building & Other Construction Workers Board.",
  },
  {
    id: "iti_admission",
    name: "ITI Admission / Enrollment Proof",
    category: "Education",
    description: "Official admission receipt or bonafide student certificate from approved ITI.",
  },
  {
    id: "academic_records",
    name: "Academic Marksheets & Educational Records",
    category: "Education",
    description: "Original or attested copies of qualifying examination marksheets and certificates.",
  },
  {
    id: "business_proof",
    name: "Business Proof & Project / Quotation Records",
    category: "Enterprise",
    description: "Udyam registration, trade license, or business quotation for enterprise loans.",
  },
  {
    id: "photographs",
    name: "Passport-size Photographs",
    category: "Identity",
    description: "Recent passport-size color photographs required for application submissions.",
  },
  {
    id: "identity_address",
    name: "Identity & Address Proof",
    category: "Identity",
    description: "Voter ID, Driving License, or Utility Bill for personal and address verification.",
  },
];
