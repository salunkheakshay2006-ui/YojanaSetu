import React, { useState } from "react";
import { CheckCircle2, HelpCircle, XCircle, ArrowLeft, FileText, Award, Layers, ChevronDown, ChevronUp, Sparkles, Compass, AlertCircle, KeyRound, Info, Bookmark, BookmarkCheck } from "lucide-react";
import SchemeCard from "./SchemeCard";
import ConflictAlert from "./ConflictAlert";
import ChecklistView from "./ChecklistView";
import DocumentUnlockPlanner from "./DocumentUnlockPlanner";
import FutureOpportunities from "./FutureOpportunities";
import SchemeDetailModal from "./SchemeDetailModal";
import OptimizedBundle from "./OptimizedBundle";
import { SUPPORT_GOALS, matchesGoals } from "../data/goals";
import { useLanguage } from "../contexts/LanguageContext";

export default function ResultsDashboard({
  result,
  selectedGoals = [],
  onBack,
  isSchemeSaved = () => false,
  onToggleSaveScheme = null,
  availableDocs = [],
  onGoToDocuments = null,
}) {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState("schemes"); // 'schemes', 'planner', or 'checklist'
  const [showNotEligible, setShowNotEligible] = useState(false);
  const [selectedModalScheme, setSelectedModalScheme] = useState(null);

  if (!result) return null;

  const citizenName = result.citizen_name || "Citizen";
  const bundle = result.bundle || {};
  const bundleSummary = bundle.bundle_summary || {};
  const confirmedSchemes = bundle.confirmed || [];
  const conditionalSchemes = bundle.conditional || [];
  const excludedSchemes = bundle.excluded_schemes || [];
  const explanation = bundle.explanation || {};
  const conflicts = result.conflicts || [];
  const checklist = result.checklist;

  // Selected goals objects for display
  const activeGoalObjs = SUPPORT_GOALS.filter((g) => selectedGoals.includes(g.id));

  // Helper to sort schemes so goal matches appear first within each tier
  const sortByGoalMatch = (schemesList) => {
    if (!selectedGoals || selectedGoals.length === 0) return schemesList;
    return [...schemesList].sort((a, b) => {
      const aMatch = matchesGoals(a, selectedGoals);
      const bMatch = matchesGoals(b, selectedGoals);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  };

  const prioritizedConfirmed = sortByGoalMatch(confirmedSchemes);
  const prioritizedConditional = sortByGoalMatch(conditionalSchemes);
  
  // Extract not eligible schemes from full results list
  const notEligibleSchemes = sortByGoalMatch(
    (result.results || []).filter((s) => s.status === "not_eligible")
  );

  // Determine Bundle Readiness Status strictly from backend counts
  const totalBundle = bundleSummary.total_bundle_schemes || 0;
  const confirmedCount = bundleSummary.confirmed_count || 0;
  const conditionalCount = bundleSummary.conditional_count || 0;
  const missingDocsCount = checklist?.summary?.known_missing_count || 0;
  const conflictsCount = conflicts.length;

  let readinessStatus = {
    title: t("results.needs_verification", "Needs verification"),
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Your bundle contains schemes that match your profile, but external portal verification or pending documents are needed before submitting applications.",
  };

  if (totalBundle === 0) {
    readinessStatus = {
      title: t("results.not_ready", "Not ready"),
      badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
      description: "No eligible schemes could be bundled based on your current demographic and welfare profile details.",
    };
  } else if (conflictsCount > 0) {
    readinessStatus = {
      title: t("results.has_conflict", "Contains a conflict (Resolved)"),
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      description: "A benefit incompatibility was detected. YojanaSetu automatically resolved your bundle to protect your active benefits, but review the conflict explanation below.",
    };
  } else if (missingDocsCount > 0) {
    readinessStatus = {
      title: t("results.partially_ready", "Partially ready"),
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      description: "Some schemes can be pursued, but key documents (such as a Bank Account Passbook or Ration Card) are currently missing from your profile and must be obtained first.",
    };
  } else if (confirmedCount > 0 && conditionalCount === 0) {
    readinessStatus = {
      title: t("results.ready_to_apply", "Ready to apply"),
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      description: "All conditions checked by the system were met with verified profile information and available documents. You can proceed directly to the official portals.",
    };
  } else if (confirmedCount > 0 && conditionalCount > 0) {
    readinessStatus = {
      title: t("results.partially_ready", "Partially ready"),
      badgeClass: "bg-teal-100 text-teal-900 border-teal-300",
      description: "You have confirmed schemes ready to apply immediately, alongside conditional schemes that require additional paperwork or verification.",
    };
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner — My Recommended Scheme Bundle */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white mb-6 backdrop-blur transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t("results.back_button", "Back to Citizen Form")}
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" /> {t("results.header_badge", "Recommended Scheme Bundle")}
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${readinessStatus.badgeClass}`}>
              {t("results.readiness_status", "Status")}: {readinessStatus.title}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            {t("results.title_for", "Recommended Scheme Bundle for")} {citizenName}
          </h2>

          {/* Simple explanation */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
            {t("results.subtitle", "These schemes were selected from your eligibility results based on official rules. Review your best scheme bundle, required documents, and next steps below.")}
          </p>

          {/* Accurate 5-Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/5">
              <span className="text-xs text-slate-400 block font-medium">{t("results.metric_bundle", "Recommended")}</span>
              <span className="text-2xl font-black text-white">{totalBundle}</span>
              <span className="text-[11px] text-slate-400 block">{t("checklist.schemes", "schemes in bundle")}</span>
            </div>

            <div className="bg-emerald-500/10 backdrop-blur rounded-xl p-3 border border-emerald-500/20">
              <span className="text-xs text-emerald-300 block font-medium">{t("results.metric_confirmed", "Confirmed")}</span>
              <span className="text-2xl font-black text-emerald-400">{confirmedCount}</span>
              <span className="text-[11px] text-emerald-300/80 block">{t("results.ready_to_apply", "ready to apply")}</span>
            </div>

            <div className="bg-blue-500/10 backdrop-blur rounded-xl p-3 border border-blue-500/20">
              <span className="text-xs text-blue-300 block font-medium">{t("results.metric_conditional", "Possibly Eligible")}</span>
              <span className="text-2xl font-black text-blue-400">{conditionalCount}</span>
              <span className="text-[11px] text-blue-300/80 block">{t("results.needs_verification", "need verification")}</span>
            </div>

            <div className="bg-amber-500/10 backdrop-blur rounded-xl p-3 border border-amber-500/20">
              <span className="text-xs text-amber-300 block font-medium">{t("results.metric_missing", "Documents")}</span>
              <span className="text-2xl font-black text-amber-400">{missingDocsCount}</span>
              <span className="text-[11px] text-amber-300/80 block">{missingDocsCount > 0 ? t("checklist.missing", "missing paperwork") : "none missing"}</span>
            </div>

            <div className="bg-purple-500/10 backdrop-blur rounded-xl p-3 border border-purple-500/20 col-span-2 sm:col-span-1">
              <span className="text-xs text-purple-300 block font-medium">{t("results.metric_conflicts", "Conflicts")}</span>
              <span className="text-2xl font-black text-purple-400">{conflictsCount}</span>
              <span className="text-[11px] text-purple-300/80 block">{excludedSchemes.length > 0 ? `${excludedSchemes.length} excluded` : "none detected"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Alert (if any scheme was pruned) */}
      <ConflictAlert conflicts={conflicts} excludedSchemes={excludedSchemes} />

      {/* Goal Priority Banner (if citizen selected any goals) */}
      {activeGoalObjs.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-emerald-950">
                Based on your goal: {activeGoalObjs.map((g) => `${g.icon} ${g.title}`).join(", ")}
              </h3>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Discovery Prioritization Active
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Schemes matching your selected support goals are prioritized and highlighted below. 
            Please note: Goal selection helps organize and discover relevant opportunities—eligibility is still determined strictly from your actual profile details by the eligibility engine.
          </p>
        </div>
      )}

      {/* Navigation Pills (Schemes vs Planner vs Checklist) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView("schemes")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeView === "schemes"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" /> {t("results.tab_schemes", "Recommended Schemes")} ({bundleSummary.total_bundle_schemes || 0})
          </button>
          <button
            onClick={() => setActiveView("planner")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeView === "planner"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            {t("results.tab_planner", "Document Priority Planner")}
            {checklist?.summary?.known_missing_count > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {checklist.summary.known_missing_count}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView("checklist")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeView === "checklist"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-4 h-4" /> {t("results.tab_checklist", "Complete Checklist")} ({checklist?.summary?.total_unique_documents || 0})
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          {t("nav.official_schemes", "Evaluated from 20 official government schemes")}
        </div>
      </div>

      {/* View: Schemes */}
      {activeView === "schemes" && (
        <div className="space-y-10">
          {/* Autonomous Scheme-Bundle Optimizer (Milestone 11) */}
          <OptimizedBundle
            optimizedData={result.optimized_combinations}
            onViewDetails={(s) => setSelectedModalScheme(s)}
            isSchemeSaved={isSchemeSaved}
            onToggleSaveScheme={onToggleSaveScheme}
            allSchemes={result.results || []}
            availableDocs={availableDocs}
          />

          {/* Tier 1: Confirmed Schemes */}
          {prioritizedConfirmed.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {t("results.confirmed_title", "Confirmed Eligible Schemes")} ({prioritizedConfirmed.length})
                  </h3>
                  <p className="text-xs font-medium text-emerald-800">
                    {t("results.confirmed_subtitle", "All mandatory criteria and known documents are verified for your profile.")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {prioritizedConfirmed.map((scheme) => (
                  <SchemeCard
                    key={scheme.scheme_id}
                    scheme={scheme}
                    tier="confirmed"
                    isGoalMatch={matchesGoals(scheme, selectedGoals)}
                    onOpenDetails={(s) => setSelectedModalScheme(s)}
                    isSaved={isSchemeSaved(scheme)}
                    onToggleSave={onToggleSaveScheme}
                    availableDocs={availableDocs}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tier 2: Conditional Schemes */}
          {prioritizedConditional.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {t("results.conditional_title", "Possibly Eligible Schemes")} ({prioritizedConditional.length})
                  </h3>
                  <p className="text-xs font-medium text-blue-800">
                    {t("results.conditional_subtitle", "You match core eligibility, but specific documents or verification are pending.")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {prioritizedConditional.map((scheme) => (
                  <SchemeCard
                    key={scheme.scheme_id}
                    scheme={scheme}
                    tier="conditional"
                    isGoalMatch={matchesGoals(scheme, selectedGoals)}
                    onOpenDetails={(s) => setSelectedModalScheme(s)}
                    isSaved={isSchemeSaved(scheme)}
                    onToggleSave={onToggleSaveScheme}
                    availableDocs={availableDocs}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Future Opportunities — Schemes You May Unlock Later (Milestone 9) */}
          <FutureOpportunities
            results={result.results}
            bundle={bundle}
            onOpenDetails={(s) => setSelectedModalScheme(s)}
            isSchemeSaved={isSchemeSaved}
            onToggleSaveScheme={onToggleSaveScheme}
          />

          {/* Optional Collapsible: Not Eligible Schemes */}
          {notEligibleSchemes.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowNotEligible(!showNotEligible)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                       View Schemes You Do Not Currently Qualify For ({notEligibleSchemes.length})
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Schemes where mandatory conditions were not met by your current profile
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  {showNotEligible ? (
                    <>Hide <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show <ChevronDown className="w-4 h-4" /></>
                  )}
                </div>
              </button>

              {showNotEligible && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                  {notEligibleSchemes.map((scheme) => {
                    const isGoalMatch = matchesGoals(scheme, selectedGoals);
                    return (
                      <div
                        key={scheme.scheme_id}
                        className={`p-4 rounded-2xl border bg-white space-y-2 opacity-80 hover:opacity-100 transition ${
                          isGoalMatch ? "border-amber-200 ring-1 ring-amber-400/20" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">
                            {scheme.scheme_name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            Not Eligible
                          </span>
                        </div>
                        {isGoalMatch && (
                          <div className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">
                            Matches your goal interest, but eligibility conditions were not met
                          </div>
                        )}
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {scheme.explanation}
                        </p>
                        {scheme.reasons?.failed?.length > 0 && (
                          <div className="text-[11px] text-rose-800 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200/80 font-medium">
                            <strong className="block text-rose-950 mb-0.5 font-bold">✕ {t("card.criteria_failed", "Criteria not met by current profile")}:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-rose-900">
                              {scheme.reasons.failed.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="pt-2 flex items-center justify-end gap-3">
                          {onToggleSaveScheme && (
                            <button
                              type="button"
                              onClick={() => onToggleSaveScheme(scheme)}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold transition cursor-pointer ${
                                isSchemeSaved(scheme)
                                  ? "text-emerald-700 hover:text-emerald-800"
                                  : "text-slate-600 hover:text-emerald-700"
                              }`}
                            >
                              {isSchemeSaved(scheme) ? (
                                <>
                                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                                  Save Scheme
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedModalScheme(scheme)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" /> View Scheme Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Documents Needed for this Bundle — Quick Overview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Documents Needed for this Bundle
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Based on the {totalBundle} recommended schemes in your bundle
                </p>
              </div>
              <button
                onClick={() => setActiveView("checklist")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer self-start sm:self-auto"
              >
                View full checklist ({checklist?.summary?.total_unique_documents || 0}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ✓ Available in Profile ({checklist?.summary?.known_present_count || 0})
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Documents already substantiated by your profile details.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  ⚠ Missing ({checklist?.summary?.known_missing_count || 0})
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {checklist?.summary?.known_missing_count > 0
                    ? "Action needed: You must obtain these documents before applying."
                    : "Great news: No standard documents are known to be missing."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1 mb-1">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  ? Needs Verification ({checklist?.summary?.verification_required_count || 0})
                </span>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Scheme-specific forms and paperwork to verify with official portal guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Document-Unlock Planning Section */}
          <DocumentUnlockPlanner checklist={checklist} bundle={bundle} />

          {/* Quick link to Full Checklist */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-emerald-950 text-base">Ready to start applying?</h4>
              <p className="text-xs text-emerald-800">
                View your unified document checklist to see what documents you have and what you need to arrange.
              </p>
            </div>
            <button
              onClick={() => setActiveView("checklist")}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              View Complete Checklist →
            </button>
          </div>
        </div>
      )}

      {/* View: Document-Unlock Planner */}
      {activeView === "planner" && (
        <DocumentUnlockPlanner checklist={checklist} bundle={bundle} />
      )}

      {/* View: Checklist */}
      {activeView === "checklist" && (
        <ChecklistView
          checklist={checklist}
          availableDocs={availableDocs}
          onGoToDocuments={onGoToDocuments}
        />
      )}

      {/* Scheme Detail Modal (Milestone 6 & 7) */}
      {selectedModalScheme && (
        <SchemeDetailModal
          scheme={selectedModalScheme}
          onClose={() => setSelectedModalScheme(null)}
          isSaved={isSchemeSaved(selectedModalScheme)}
          onToggleSave={onToggleSaveScheme}
        />
      )}
    </div>
  );
}
