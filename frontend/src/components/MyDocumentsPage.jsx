import React, { useState, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  AlertOctagon,
  Plus,
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  FolderCheck,
  AlertCircle,
  Check,
  KeyRound,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Zap,
  Layers,
  Award,
} from "lucide-react";
import { STANDARD_DOCUMENTS } from "../data/standardDocuments";
import { useLanguage } from "../contexts/LanguageContext";
import {
  categorizeSchemeReadiness,
  calculateDocumentUnlockRankings,
  calculateNextBestAction,
  getBundleReadiness,
} from "../utils/documentReadiness";

export default function MyDocumentsPage({
  availableDocs = [],
  customDocs = [],
  onToggleDocument,
  onAddCustomDocument,
  onRemoveCustomDocument,
  isCloudSynced = false,
  results = null,
  onViewSchemeDetails = null,
  onGoToResults = null,
  onGoToCheckEligibility = null,
}) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'available', 'missing', 'custom'
  const [searchQuery, setSearchQuery] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [inputError, setInputError] = useState("");

  // Merge standard documents with custom documents
  const allDocumentsList = useMemo(() => {
    const customList = customDocs.map((cName) => ({
      id: `custom_${cName.toLowerCase().replace(/\s+/g, "_")}`,
      name: cName,
      category: t("docs.category_personal", "Personal Document"),
      description: t("docs.custom_desc", "Custom personal document added by you."),
      isCustom: true,
      isAvailable: availableDocs.includes(cName),
    }));

    const standardList = STANDARD_DOCUMENTS.map((doc) => ({
      ...doc,
      isCustom: false,
      isAvailable: availableDocs.includes(doc.name),
    }));

    // Show custom documents at top so user sees their added document right away
    return [...customList, ...standardList];
  }, [availableDocs, customDocs, t]);

  // Filtered documents for the locker grid
  const filteredDocs = useMemo(() => {
    return allDocumentsList.filter((doc) => {
      // Tab filter
      if (activeFilter === "available" && !doc.isAvailable) return false;
      if (activeFilter === "missing" && doc.isAvailable) return false;
      if (activeFilter === "custom" && !doc.isCustom) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesCat = (doc.category || "").toLowerCase().includes(q);
        const matchesDesc = (doc.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }

      return true;
    });
  }, [allDocumentsList, activeFilter, searchQuery]);

  // Count summaries
  const totalCount = allDocumentsList.length;
  const availableCount = allDocumentsList.filter((d) => d.isAvailable).length;
  const missingCount = totalCount - availableCount;
  const customCount = customDocs.length;

  // Real-time calculation of Scheme Readiness across eligible schemes
  const allResultsList = results?.results || [];
  const readinessAnalysis = useMemo(() => {
    return categorizeSchemeReadiness(allResultsList, availableDocs);
  }, [allResultsList, availableDocs]);

  // Dynamic Document Unlock Rankings
  const unlockRankings = useMemo(() => {
    return calculateDocumentUnlockRankings(allResultsList, availableDocs);
  }, [allResultsList, availableDocs]);

  // Next Best Action
  const nextBestAction = useMemo(() => {
    return calculateNextBestAction(unlockRankings);
  }, [unlockRankings]);

  // Recommended Bundle Readiness
  const recommendedBundleSchemes = useMemo(() => {
    if (!results?.bundle) return [];
    if (Array.isArray(results.bundle)) return results.bundle;
    return results.bundle.bundle || [];
  }, [results?.bundle]);

  const bundleReadiness = useMemo(() => {
    return getBundleReadiness(recommendedBundleSchemes, availableDocs);
  }, [recommendedBundleSchemes, availableDocs]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newDocName.trim();
    if (!trimmed) {
      setInputError(t("docs.error_empty", "Please enter a document name."));
      return;
    }
    if (allDocumentsList.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      setInputError(t("docs.error_exists", "This document is already in your list."));
      return;
    }
    setInputError("");
    onAddCustomDocument(trimmed);
    setNewDocName("");
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> {t("docs.badge", "Document Readiness Locker")}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t("docs.title", "My Documents")}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t(
              "docs.subtitle",
              "Track which official identity and welfare documents you currently have. Check or uncheck documents anytime to keep your paperwork checklist accurate."
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <strong className="text-white">{availableCount}</strong> {t("docs.available_label", "Available")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <strong className="text-white">{missingCount}</strong> {t("docs.missing_label", "Missing")}
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-medium">
              {isCloudSynced ? t("saved.synced", "Synced with Cloud Account") : t("docs.local_cache", "Saved in browser session")}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">{t("docs.total_tracked", "Total Tracked")}</span>
          <span className="text-2xl font-black text-slate-900">{totalCount}</span>
          <span className="text-[11px] text-slate-400 block">{t("docs.docs_count", "documents")}</span>
        </div>

        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 block">✓ {t("docs.available_label", "Available")}</span>
          <span className="text-2xl font-black text-emerald-800">{availableCount}</span>
          <span className="text-[11px] text-emerald-600 block">{t("docs.ready_to_use", "ready for schemes")}</span>
        </div>

        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 block">⚠ {t("docs.missing_label", "Missing")}</span>
          <span className="text-2xl font-black text-amber-800">{missingCount}</span>
          <span className="text-[11px] text-amber-600 block">{t("docs.needs_procurement", "to be arranged")}</span>
        </div>

        <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-200 shadow-xs">
          <span className="text-xs font-semibold text-purple-700 block">✦ {t("docs.custom_label", "Custom Documents")}</span>
          <span className="text-2xl font-black text-purple-800">{customCount}</span>
          <span className="text-[11px] text-purple-600 block">{t("docs.user_added", "added by you")}</span>
        </div>
      </div>

      {/* Add Custom Document Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t("docs.cant_find_title", "Can't find your document?")}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {t("docs.cant_find_subtitle", "Type any custom certificate, bill, or proof you have (e.g. Electricity Bill, Gram Panchayat NOC, Caste Validity).")}
          </p>

          <form onSubmit={handleAddSubmit} className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => {
                  setNewDocName(e.target.value);
                  if (inputError) setInputError("");
                }}
                placeholder={t("docs.placeholder_doc_name", "Enter document name (e.g. Caste Validity Certificate)")}
                className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t("docs.add_btn", "Add Document")}</span>
              </button>
            </div>
            {inputError && (
              <p className="text-xs text-red-600 flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {inputError}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Filter and Search Bar for Documents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("checklist.all", "All Documents")} ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter("available")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === "available" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✓ {t("checklist.available", "Available")} ({availableCount})
          </button>
          <button
            onClick={() => setActiveFilter("missing")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === "missing" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚠ {t("checklist.missing", "Missing")} ({missingCount})
          </button>
          <button
            onClick={() => setActiveFilter("custom")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === "custom" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✦ {t("docs.custom_tab", "Custom")} ({customCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("docs.search_docs", "Filter documents...")}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs max-w-xl mx-auto space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">{t("docs.no_docs_found", "No documents match this filter")}</h4>
          <p className="text-xs text-slate-500">{t("docs.try_different_filter", "Try clearing your search query or selecting a different status filter.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isAvail = doc.isAvailable;
            return (
              <div
                key={doc.id || doc.name}
                className={`rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 ${
                  isAvail
                    ? "bg-white border-emerald-200 shadow-xs"
                    : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      doc.isCustom
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {doc.category || t("docs.category_personal", "Personal Document")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isAvail ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("checklist.available", "Available")}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          {t("checklist.missing", "Missing")}
                        </span>
                      )}

                      {doc.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCustomDocument(doc.name);
                          }}
                          title={t("docs.delete_custom", "Delete custom document")}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {doc.name}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                {/* Interactive Checkbox Button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onToggleDocument(doc.name)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer select-none text-left ${
                      isAvail
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition flex-shrink-0 ${
                        isAvail
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-slate-300 text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold">
                      {t("docs.checkbox_have", "I have this document")}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4, 5, 6, 7: ACTION CENTER — YOUR SCHEME READINESS */}
      {/* ========================================================================= */}

      <div className="pt-6 border-t border-slate-200/80 space-y-8">
        {/* Action Center Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("docs.action_center_badge", "Live Scheme Readiness Engine")}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("docs.readiness_title", "Your Scheme Readiness")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t(
                "docs.readiness_subtitle",
                "See which eligible welfare schemes you can apply for right now based on your available documents."
              )}
            </p>
          </div>

          {onGoToResults && results && (
            <button
              onClick={onGoToResults}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <span>{t("docs.view_full_dashboard", "View Results Dashboard")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* If citizen hasn't run eligibility yet */}
        {!results ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t("docs.check_elig_prompt_title", "Check eligibility to see your scheme readiness")}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {t(
                "docs.check_elig_prompt_desc",
                "Fill out your basic citizen profile (age, state, occupation, income) so YojanaSetu can evaluate your eligibility and map your available documents to official schemes."
              )}
            </p>
            {onGoToCheckEligibility && (
              <button
                onClick={onGoToCheckEligibility}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
              >
                <span>{t("nav.check_eligibility", "Check Eligibility")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live Readiness Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    🟢 {t("docs.ready_to_apply_header", "Ready to Apply")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    100% Docs
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-950 mt-1">
                  {readinessAnalysis.readyCount}
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  {t("docs.ready_desc", "Eligible schemes with all required documents possessed")}
                </p>
              </div>

              <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    🟡 {t("docs.almost_ready_header", "Almost Ready")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Missing Docs
                  </span>
                </div>
                <div className="text-3xl font-black text-amber-950 mt-1">
                  {readinessAnalysis.almostReadyCount}
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  {t("docs.almost_ready_desc", "Eligible schemes requiring 1 or more documents")}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    📋 {t("docs.total_eligible_header", "Total Eligible")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    Qualified
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {readinessAnalysis.totalEligibleCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t("docs.total_qualifying_schemes", "Total schemes matching your profile criteria")}
                </p>
              </div>
            </div>

            {/* NEXT BEST ACTION BANNER */}
            {nextBestAction && (
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      {t("docs.next_best_action_badge", "Your Next Best Action")}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {t("docs.get_doc_label", "Get:")} {nextBestAction.document}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {t("docs.next_best_why", "Why?")}{" "}
                      {nextBestAction.fullyUnlocksCount > 0
                        ? t(
                            "docs.next_best_unlocks_ready",
                            `This single document will make you immediately 100% Ready to Apply for ${nextBestAction.fullyUnlocksCount} eligible scheme${
                              nextBestAction.fullyUnlocksCount > 1 ? "s" : ""
                            } (and satisfies requirements for ${nextBestAction.impactCount} total schemes).`
                          )
                        : t(
                            "docs.next_best_unlocks_total",
                            `This document satisfies required paperwork for ${nextBestAction.impactCount} eligible schemes.`
                          )}
                    </p>
                  </div>

                  <button
                    onClick={() => onToggleDocument(nextBestAction.document)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
                  >
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>{t("docs.i_have_this_now", "I have this document now")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* RECOMMENDED BUNDLE READINESS STATUS */}
            {recommendedBundleSchemes.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {t("docs.bundle_readiness_title", "Recommended Scheme Bundle Readiness")}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {t(
                          "docs.bundle_readiness_sub",
                          "Consolidated status of schemes selected in your AI-recommended bundle"
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                      bundleReadiness.isFullyReady
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                        : "bg-amber-50 text-amber-900 border-amber-300"
                    }`}
                  >
                    {bundleReadiness.isFullyReady
                      ? `✓ ${t("results.ready_to_apply", "Ready to Apply")}`
                      : `⚠ ${t("results.partially_ready", "Partially Ready")}`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>
                    <strong>{t("optimizer.metric_readiness", "Document Readiness")}:</strong>{" "}
                    {bundleReadiness.readyCount} / {bundleReadiness.totalCount} schemes ready
                  </span>
                  {bundleReadiness.missingDocs.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-800 font-medium">
                        {t("docs.bundle_missing_label", "Missing across bundle")}:{" "}
                        {bundleReadiness.missingDocs.join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* READY TO APPLY SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {t("docs.ready_section_title", "Ready to Apply")} ({readinessAnalysis.readyCount})
                </h3>
              </div>

              {readinessAnalysis.readyCount === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  {t(
                    "docs.no_ready_schemes_yet",
                    "You do not have all documents for any eligible scheme yet. Check the Almost Ready list below to see which documents you need."
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readinessAnalysis.readyToApply.map((scheme) => (
                    <div
                      key={scheme.scheme_id || scheme.name}
                      className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {scheme.category || "General"}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("results.ready_to_apply", "Ready to Apply")}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {scheme.scheme_name || scheme.name}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2">
                          {scheme.benefit || scheme.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {scheme.readiness.totalRequired === 0
                            ? t("docs.no_docs_required", "No documents required")
                            : `${scheme.readiness.availableCount} / ${scheme.readiness.totalRequired} ${t("docs.docs_count", "documents available")}`}
                        </span>

                        {onViewSchemeDetails && (
                          <button
                            type="button"
                            onClick={() => onViewSchemeDetails(scheme)}
                            className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{t("docs.view_scheme_btn", "View Scheme")}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ALMOST READY SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {t("docs.almost_ready_section_title", "Almost Ready — Missing Paperwork")} ({readinessAnalysis.almostReadyCount})
                </h3>
              </div>

              {readinessAnalysis.almostReadyCount === 0 ? (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-center text-xs text-emerald-800 font-medium">
                  {t(
                    "docs.all_eligible_ready",
                    "All of your eligible schemes are currently ready to apply!"
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readinessAnalysis.almostReady.map((scheme) => (
                    <div
                      key={scheme.scheme_id || scheme.name}
                      className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {scheme.category || "General"}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" />
                            {scheme.readiness.readinessPct}% {t("docs.ready_label", "Ready")}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {scheme.scheme_name || scheme.name}
                        </h4>

                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-amber-900 block mb-1">
                            ⚠ {t("docs.missing_label", "Missing")}:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
                            {scheme.readiness.missingDocs.map((docName, idx) => (
                              <li key={idx}>
                                <strong>{docName}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 font-medium">
                          {scheme.readiness.availableCount} / {scheme.readiness.totalRequired} {t("docs.docs_count", "documents")}
                        </span>

                        {onViewSchemeDetails && (
                          <button
                            type="button"
                            onClick={() => onViewSchemeDetails(scheme)}
                            className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{t("docs.view_scheme_btn", "View Scheme")}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UNLOCK MORE SCHEMES INTELLIGENCE */}
            {unlockRankings.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {t("docs.unlock_title", "Documents that can unlock more schemes")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t(
                        "docs.unlock_subtitle",
                        "Ranked dynamically by how many currently eligible schemes they will make ready for you"
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {unlockRankings.map((ranking, idx) => (
                    <div
                      key={ranking.document}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:border-slate-300 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                            Rank #{idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {ranking.document}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600">
                          {ranking.fullyUnlocksCount > 0 ? (
                            <span className="text-emerald-800 font-semibold">
                              → Makes {ranking.fullyUnlocksCount} eligible scheme{ranking.fullyUnlocksCount > 1 ? "s" : ""} 100% Ready to Apply!{" "}
                            </span>
                          ) : null}
                          <span>(Needed by {ranking.impactCount} eligible schemes)</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleDocument(ranking.document)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t("docs.mark_as_available", "Mark Available")}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
