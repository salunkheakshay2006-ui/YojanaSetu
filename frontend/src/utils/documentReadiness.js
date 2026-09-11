/**
 * Document Readiness & Unlock Intelligence Engine — YojanaSetu
 * 
 * Pure functional calculation engine connecting:
 * - Scheme required documents (from documents_summary)
 * - Citizen available documents (from availableDocs)
 * - Scheme readiness state (Ready to Apply vs Almost Ready vs Ineligible)
 * - Dynamic Document Unlock Intelligence (ranked by eligible schemes unlocked)
 * - Next Best Action recommendation
 * - Recommended Bundle readiness state
 */

/**
 * Normalizes raw document phrases into canonical document names.
 * Mirrors backend/services/checklist.py _normalize_doc_phrase.
 */
export function normalizeDocumentPhrase(raw) {
  if (!raw || typeof raw !== "string") return "Required Document";
  const p = raw.trim();
  const pl = p.toLowerCase();

  // 1. Bank Account & Passbook
  if (pl.includes("bank") || pl.includes("passbook")) {
    return "Bank or Post-Office Account Passbook";
  }
  // 2. Ration Card
  if (pl.includes("ration")) {
    return "Ration Card";
  }
  // 3. Land records / Landholding papers
  if (pl.includes("land")) {
    return "Agricultural Landholding Records / Proof of Land";
  }
  // 4. Worker Welfare Board
  if (pl.includes("worker-board")) {
    return "BOCW Worker Welfare Board Registration Card";
  }
  // 5. ITI Admission
  if (pl.includes("iti")) {
    return "ITI Admission / Enrollment Proof";
  }
  // 6. Aadhaar
  if (pl.includes("aadhaar")) {
    return "Aadhaar Card";
  }
  // 7. Maternal / Child Health records
  if (pl.includes("mcp") || pl.includes("rchi") || pl.includes("pregnancy")) {
    return "Mother & Child Protection (MCP / RCHI) Card";
  }
  // 8. Death certificate
  if (pl.includes("death")) {
    return "Death Certificate of Primary Breadwinner";
  }
  // 9. Disability certificate
  if (pl.includes("disability")) {
    return "Disability Certificate";
  }
  // 10. Caste / Category certificate
  if (pl.includes("caste") || pl.includes("community")) {
    return "Caste / Category Certificate";
  }
  // 11. Domicile / Residence certificate
  if (pl.includes("domicile")) {
    return "Domicile / Residence Certificate";
  }
  // 12. Income certificate / BPL document
  if (pl.includes("income") || pl.includes("bpl")) {
    return "Income Certificate / BPL Document";
  }
  // 13. Photographs
  if (pl.includes("photo")) {
    return "Passport-size Photographs";
  }
  // 14. Academic / Marksheets
  if (["marksheet", "academic", "admission", "education"].some((k) => pl.includes(k))) {
    return "Academic Marksheets & Educational Records";
  }
  // 15. Business / Trade Records
  if (["business", "trade", "project report", "quotation"].some((k) => pl.includes(k))) {
    return "Business Proof & Project / Quotation Records";
  }
  // 16. Consent / Enrolment Form
  if (pl.includes("consent") || pl.includes("enrolment")) {
    return "Scheme Application / Consent Form";
  }
  // 17. General Identity & Address Proof
  if (pl.includes("identity") || pl.includes("address") || pl.includes("residence")) {
    return "Identity & Address Proof";
  }

  // Fallback: title case the cleaned string
  return p
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Extracts unique canonical required documents for a given scheme.
 */
export function getSchemeRequiredDocuments(scheme) {
  if (!scheme) return [];
  const rawSummary = scheme.documents_summary || scheme.documents_required || "";
  if (!rawSummary.trim()) return [];

  const rawItems = rawSummary.split(";").map((i) => i.trim()).filter(Boolean);
  const docSet = new Set();
  rawItems.forEach((raw) => {
    const canonical = normalizeDocumentPhrase(raw);
    if (canonical) docSet.add(canonical);
  });

  return Array.from(docSet);
}

/**
 * Checks whether a specific canonical document is held by the citizen in availableDocs.
 * Performs safe case-insensitive comparison.
 */
export function isDocAvailable(docName, availableDocs = []) {
  if (!docName || !Array.isArray(availableDocs)) return false;
  const target = docName.toLowerCase().trim();
  return availableDocs.some((d) => (d || "").toLowerCase().trim() === target);
}

/**
 * Calculates document readiness metrics for a single scheme.
 */
export function getSchemeDocumentReadiness(scheme, availableDocs = []) {
  const requiredDocs = getSchemeRequiredDocuments(scheme);
  const totalRequired = requiredDocs.length;

  // Safe handling of schemes with no required documents (e.g. 0 docs)
  if (totalRequired === 0) {
    return {
      requiredDocs: [],
      availableDocsForScheme: [],
      missingDocs: [],
      availableCount: 0,
      totalRequired: 0,
      readinessPct: 100,
      isReady: true,
      isAlmostReady: false,
    };
  }

  const availableDocsForScheme = requiredDocs.filter((doc) =>
    isDocAvailable(doc, availableDocs)
  );
  const missingDocs = requiredDocs.filter(
    (doc) => !isDocAvailable(doc, availableDocs)
  );

  const availableCount = availableDocsForScheme.length;
  const readinessPct = Math.round((availableCount / totalRequired) * 100);
  const isReady = availableCount === totalRequired;
  const isAlmostReady = !isReady;

  return {
    requiredDocs,
    availableDocsForScheme,
    missingDocs,
    availableCount,
    totalRequired,
    readinessPct,
    isReady,
    isAlmostReady,
  };
}

/**
 * Checks if a scheme is eligible based on its authoritative eligibility status.
 */
export function isSchemeEligible(scheme) {
  if (!scheme) return false;
  const status = scheme.status;
  return (
    status === "confirmed_eligible" ||
    status === "possibly_eligible" ||
    status === "conditional_eligible" ||
    status === "conditional" ||
    scheme.tier === "confirmed" ||
    scheme.tier === "conditional"
  );
}

/**
 * Categorizes a list of schemes into:
 * - Ready to Apply (Eligible AND 100% required documents available)
 * - Almost Ready (Eligible BUT 1 or more required documents missing)
 * - Not Eligible (Demographic/socioeconomic criteria failed)
 */
export function categorizeSchemeReadiness(schemes = [], availableDocs = []) {
  const readyToApply = [];
  const almostReady = [];
  const notEligible = [];

  schemes.forEach((scheme) => {
    if (!isSchemeEligible(scheme)) {
      notEligible.push(scheme);
      return;
    }

    const readiness = getSchemeDocumentReadiness(scheme, availableDocs);
    const enrichedScheme = {
      ...scheme,
      readiness,
    };

    if (readiness.isReady) {
      readyToApply.push(enrichedScheme);
    } else {
      almostReady.push(enrichedScheme);
    }
  });

  return {
    readyToApply,
    almostReady,
    notEligible,
    readyCount: readyToApply.length,
    almostReadyCount: almostReady.length,
    totalEligibleCount: readyToApply.length + almostReady.length,
    notEligibleCount: notEligible.length,
  };
}

/**
 * Calculates dynamic Document Unlock Intelligence across all eligible schemes.
 * Ranks missing documents based on:
 * 1. How many eligible schemes would become 100% "Ready to Apply" if acquired.
 * 2. How many total eligible schemes require this document.
 */
export function calculateDocumentUnlockRankings(eligibleSchemes = [], availableDocs = []) {
  // Mapping: docName -> { document, schemes: [], fullyUnlocks: [] }
  const docImpactMap = new Map();

  eligibleSchemes.forEach((scheme) => {
    if (!isSchemeEligible(scheme)) return;

    const readiness = getSchemeDocumentReadiness(scheme, availableDocs);
    if (readiness.isReady) return; // Already ready

    readiness.missingDocs.forEach((missingDoc) => {
      if (!docImpactMap.has(missingDoc)) {
        docImpactMap.set(missingDoc, {
          document: missingDoc,
          impactCount: 0,
          fullyUnlocksCount: 0,
          schemes: [],
          fullyUnlocksSchemes: [],
        });
      }

      const entry = docImpactMap.get(missingDoc);
      entry.impactCount += 1;
      entry.schemes.push(scheme);

      // If this missing document is the ONLY missing document for this scheme,
      // obtaining it makes the scheme 100% Ready to Apply!
      if (readiness.missingDocs.length === 1) {
        entry.fullyUnlocksCount += 1;
        entry.fullyUnlocksSchemes.push(scheme);
      }
    });
  });

  const rankings = Array.from(docImpactMap.values());

  // Sort descending: highest fullyUnlocksCount first, then impactCount
  rankings.sort((a, b) => {
    if (b.fullyUnlocksCount !== a.fullyUnlocksCount) {
      return b.fullyUnlocksCount - a.fullyUnlocksCount;
    }
    if (b.impactCount !== a.impactCount) {
      return b.impactCount - a.impactCount;
    }
    return a.document.localeCompare(b.document);
  });

  return rankings;
}

/**
 * Determines the Next Best Action: the single highest-leverage document
 * for the citizen to obtain next.
 */
export function calculateNextBestAction(unlockRankings = [], userGoals = []) {
  if (!unlockRankings || unlockRankings.length === 0) {
    return null;
  }

  // Top candidate from calculated ranking
  const topCandidate = unlockRankings[0];

  return {
    document: topCandidate.document,
    fullyUnlocksCount: topCandidate.fullyUnlocksCount,
    impactCount: topCandidate.impactCount,
    schemes: topCandidate.schemes,
    fullyUnlocksSchemes: topCandidate.fullyUnlocksSchemes,
  };
}

/**
 * Calculates document readiness for a recommended scheme bundle.
 */
export function getBundleReadiness(bundleSchemes = [], availableDocs = []) {
  if (!Array.isArray(bundleSchemes) || bundleSchemes.length === 0) {
    return {
      readyCount: 0,
      totalCount: 0,
      missingDocs: [],
      isFullyReady: false,
      isPartiallyReady: false,
      status: "none",
    };
  }

  const missingSet = new Set();
  let readyCount = 0;

  bundleSchemes.forEach((scheme) => {
    const readiness = getSchemeDocumentReadiness(scheme, availableDocs);
    if (readiness.isReady) {
      readyCount += 1;
    } else {
      readiness.missingDocs.forEach((d) => missingSet.add(d));
    }
  });

  const totalCount = bundleSchemes.length;
  const missingDocs = Array.from(missingSet);
  const isFullyReady = readyCount === totalCount && totalCount > 0;
  const isPartiallyReady = readyCount > 0 && readyCount < totalCount;
  const isDocumentsRequired = readyCount === 0 && totalCount > 0;

  let status = "ready_to_apply";
  if (isPartiallyReady) status = "partially_ready";
  else if (isDocumentsRequired) status = "documents_required";

  return {
    readyCount,
    totalCount,
    missingDocs,
    isFullyReady,
    isPartiallyReady,
    isDocumentsRequired,
    status,
  };
}
