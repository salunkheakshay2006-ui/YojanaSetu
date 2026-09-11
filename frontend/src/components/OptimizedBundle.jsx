import React, { useState, useMemo } from "react";
import {
  Award,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  Info,
  ChevronRight,
  TrendingUp,
  Target,
  Zap,
  AlertOctagon,
  Check,
} from "lucide-react";
import { SCHEME_BENEFITS } from "../data/schemeBenefits";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getBundleReadiness,
  getSchemeDocumentReadiness,
} from "../utils/documentReadiness";

export default function OptimizedBundle({
  optimizedData,
  onViewDetails,
  isSchemeSaved = () => false,
  onToggleSaveScheme = null,
  allSchemes = [],
  availableDocs = [],
}) {
  const { t } = useLanguage();

  // If optimized data is missing, fail safely with informative notice
  if (!optimizedData) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-3 shadow-sm">
        <div className="p-3 bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-500">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{t("optimizer.unavailable", "Optimized bundle is currently unavailable")}</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {t("optimizer.subtitle", "The autonomous optimizer could not evaluate combinations at this moment. You can still explore your full eligibility results below.")}
        </p>
      </div>
    );
  }

  const { primary, alternatives = [], disclaimer } = optimizedData;

  if (!primary) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-3 shadow-sm">
        <div className="p-3 bg-amber-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-amber-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          {t("optimizer.no_combo", "No focused scheme combination is currently available based on this profile")}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {optimizedData.message ||
            t("hero.subtitle", "Based on the provided demographic and welfare criteria, no actionable combination met the optimizer thresholds. Check Future Opportunities to unlock potential schemes.")}
        </p>
      </div>
    );
  }

  // Build the list of valid views: Primary + any returned Alternatives
  const allViews = [
    { ...primary, tabKey: "primary", tabLabel: primary.label || "Best Overall", tabIcon: Award },
    ...alternatives.map((alt, idx) => ({
      ...alt,
      tabKey: `alt-${idx}`,
      tabLabel: alt.label || `Alternative ${idx + 1}`,
      tabIcon: alt.objective === "most_ready_now" ? Zap : alt.objective === "goal_focused" ? Target : TrendingUp,
    })),
  ];

  const [activeTabKey, setActiveTabKey] = useState(allViews[0].tabKey);

  const activeCombo = allViews.find((v) => v.tabKey === activeTabKey) || allViews[0];

  // Helper to look up full scheme object for modal details and complete document specs
  const getFullScheme = (schemeItem) => {
    const sName = (schemeItem.scheme_name || schemeItem.name || "").toLowerCase();
    const match = allSchemes.find(
      (s) => (s.scheme_name || s.name || "").toLowerCase() === sName
    );
    return match || schemeItem;
  };

  // Real-time calculation of active bundle document readiness
  const comboFullSchemes = useMemo(() => {
    return (activeCombo.schemes || []).map(getFullScheme);
  }, [activeCombo.schemes, allSchemes]);

  const liveBundleReadiness = useMemo(() => {
    return getBundleReadiness(comboFullSchemes, availableDocs);
  }, [comboFullSchemes, availableDocs]);

  return (
    <div className="space-y-6">
      {/* 1. Main Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t("optimizer.badge", "Autonomous Scheme-Bundle Optimizer")}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t("optimizer.title", "AI Recommended Scheme Bundles")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t(
              "optimizer.subtitle",
              "Our autonomous multi-goal optimizer analyzed combinations to maximize your total benefits while preventing scheme conflicts and minimizing paperwork."
            )}
          </p>

          <div className="inline-block px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur text-[11px] text-slate-300 border border-white/10">
            <strong>{t("card.ready_badge", "Application Reality")}:</strong> {t("hero.disclaimer", "The schemes below are recommended together for planning. Each scheme may have its own application process.")}
          </div>
        </div>

        {/* Tab Selection (If alternatives exist) */}
        {allViews.length > 1 && (
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
            {allViews.map((view) => {
              const Icon = view.tabIcon || Award;
              const isActive = view.tabKey === activeTabKey;
              const translatedTabLabel = view.tabKey === "primary" ? t("optimizer.best_overall", view.tabLabel) : view.tabLabel;

              return (
                <button
                  key={view.tabKey}
                  onClick={() => setActiveTabKey(view.tabKey)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{translatedTabLabel}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                      isActive ? "bg-emerald-700 text-white" : "bg-black/30 text-emerald-300"
                    }`}
                  >
                    {view.optimization_score}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Active Combination Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Combination Title and Score Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Rank #{activeCombo.rank || 1} • {activeCombo.objective?.replace("_", " ")}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {activeCombo.scheme_count} Schemes Recommended
              </span>

              {/* Real-time Document Readiness Badge */}
              {liveBundleReadiness.isFullyReady ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  {t("results.ready_to_apply", "Ready to Apply")} ({liveBundleReadiness.readyCount}/{liveBundleReadiness.totalCount} ready)
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-amber-700" />
                  {t("results.partially_ready", "Partially Ready")} ({liveBundleReadiness.readyCount}/{liveBundleReadiness.totalCount} ready)
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {activeCombo.label}
            </h3>
          </div>

          <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-slate-100">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bundle Score:</span>
              <span className="text-3xl font-black text-emerald-700">{activeCombo.optimization_score}</span>
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs sm:ml-auto">
              Scored using eligibility certainty, document readiness, goal fit, and paperwork synergy.
            </p>
          </div>
        </div>

        {/* Live Missing Documents Banner for Bundle if any */}
        {liveBundleReadiness.missingDocs.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-amber-950">
                {liveBundleReadiness.readyCount} of {liveBundleReadiness.totalCount} schemes in this bundle are fully document-ready.
              </strong>
              <p className="text-[11px] text-amber-800">
                <span className="font-semibold">Paperwork to arrange: </span>
                {liveBundleReadiness.missingDocs.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Document Readiness</span>
            <div className="text-xl font-black text-slate-900">
              {liveBundleReadiness.readyCount} / {liveBundleReadiness.totalCount}
            </div>
            <span className="text-[11px] text-slate-500">
              {liveBundleReadiness.isFullyReady ? "All schemes ready" : `${liveBundleReadiness.missingDocs.length} doc(s) missing`}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Goal Alignment</span>
            <div className="text-xl font-black text-emerald-700">
              {activeCombo.metrics?.goal_alignment_pct ?? 0}%
            </div>
            <span className="text-[11px] text-slate-500">profile & need focus</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Eligibility Certainty</span>
            <div className="text-xl font-black text-blue-700">
              {activeCombo.metrics?.eligibility_confidence ?? 0}%
            </div>
            <span className="text-[11px] text-slate-500">verified profile facts</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Preparation Synergy</span>
            <div className="text-xl font-black text-purple-700">
              {activeCombo.metrics?.document_synergy_pct ?? 0}%
            </div>
            <span className="text-[11px] text-slate-500">shared document reuse</span>
          </div>
        </div>

        {/* Why YojanaSetu recommended this combination */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Why YojanaSetu recommended this combination</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {activeCombo.explanation?.why_ranked_first ||
              activeCombo.explanation?.why_different_from_primary ||
              activeCombo.explanation?.why_selected ||
              activeCombo.explanation?.strategy_purpose ||
              "This combination provides the strongest balance of eligibility confidence and document preparation efficiency for your profile."}
          </p>
        </div>

        {/* Policy Compatibility Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {activeCombo.metrics?.conflicts_avoided && activeCombo.metrics.conflicts_avoided.length > 0
              ? `Conflicts avoided: ${activeCombo.metrics.conflicts_avoided.join(", ")}`
              : "No known policy conflicts were detected among these schemes."}
          </span>
        </div>

        {/* Schemes in Combination */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Recommended Schemes in this Combination ({activeCombo.schemes?.length || 0})
            </h4>
          </div>

          <div className="space-y-3">
            {activeCombo.schemes?.map((schemeItem, idx) => {
              const fullScheme = getFullScheme(schemeItem);
              const isSaved = isSchemeSaved(fullScheme);
              const schemeReadiness = getSchemeDocumentReadiness(fullScheme, availableDocs);
              const isConfirmed = schemeItem.status === "confirmed_eligible";
              const benefitText =
                schemeItem.benefit ||
                SCHEME_BENEFITS[schemeItem.scheme_name] ||
                SCHEME_BENEFITS[fullScheme.name];

              return (
                <div
                  key={schemeItem.scheme_id || idx}
                  className="rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 transition-all duration-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Live Application Readiness Badge */}
                        {schemeReadiness.isReady ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {t("results.ready_to_apply", "Ready to Apply")}
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300">
                            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                            {schemeReadiness.readinessPct}% Ready ({schemeReadiness.missingDocs.length} Missing)
                          </span>
                        )}

                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {isConfirmed ? "Profile Matched" : "Needs Verification"}
                        </span>

                        {schemeItem.category && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {schemeItem.category}
                          </span>
                        )}

                        <span className="text-xs font-medium px-2 py-0.5 rounded text-slate-500 bg-slate-50 border border-slate-100">
                          {schemeItem.scope === "Maharashtra" ? "Maharashtra State" : "Central Government"}
                        </span>
                      </div>

                      <h5 className="text-base font-bold text-slate-900 pt-1">
                        {schemeItem.scheme_name || fullScheme.name}
                      </h5>

                      {benefitText && (
                        <p className="text-xs text-emerald-900 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/50">
                          <strong>Key Benefit:</strong> {benefitText}
                        </p>
                      )}

                      {/* Missing docs notice if almost ready */}
                      {!schemeReadiness.isReady && schemeReadiness.missingDocs.length > 0 && (
                        <p className="text-[11px] text-amber-800 font-medium">
                          ⚠ Missing required paperwork: {schemeReadiness.missingDocs.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onToggleSaveScheme && (
                        <button
                          type="button"
                          onClick={() => onToggleSaveScheme(fullScheme)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            isSaved
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                              Save
                            </>
                          )}
                        </button>
                      )}

                      {onViewDetails && (
                        <button
                          type="button"
                          onClick={() => onViewDetails(fullScheme)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
