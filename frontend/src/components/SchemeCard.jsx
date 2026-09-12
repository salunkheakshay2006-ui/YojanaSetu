import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Check,
  HelpCircle,
  Sparkles,
  Gift,
  Info,
  Bookmark,
  BookmarkCheck,
  AlertOctagon,
  XCircle,
} from "lucide-react";
import { SCHEME_BENEFITS } from "../data/schemeBenefits";
import { useLanguage } from "../contexts/LanguageContext";
import { getSchemeDocumentReadiness } from "../utils/documentReadiness";

export default function SchemeCard({
  scheme,
  tier = "conditional",
  isGoalMatch = false,
  onOpenDetails = null,
  isSaved = false,
  onToggleSave = null,
  availableDocs = [],
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const isConfirmed = scheme.status === "confirmed_eligible" || tier === "confirmed";
  const isNotEligible = scheme.status === "not_eligible";
  const readiness = getSchemeDocumentReadiness(scheme, availableDocs);

  const passedReasons = scheme.reasons?.passed || [];
  const unresolvedReasons = scheme.reasons?.unresolved || [];
  const failedReasons = scheme.reasons?.failed || [];
  const benefitText = scheme.benefit || SCHEME_BENEFITS[scheme.scheme_name] || SCHEME_BENEFITS[scheme.name];

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-sm hover:shadow-md ${
        isGoalMatch
          ? "border-emerald-300 ring-2 ring-emerald-500/20"
          : isConfirmed && readiness.isReady
          ? "border-emerald-200 ring-1 ring-emerald-500/10"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Goal Priority Banner if matched */}
      {isGoalMatch && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[11px] font-bold px-4 py-1.5 flex items-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t("card.priority_match", "Priority Match • Matches your selected support goal")}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Status Badge: Application Readiness */}
            {isNotEligible ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300">
                <XCircle className="w-3.5 h-3.5 text-slate-500" />
                {t("card.not_eligible_badge", "Not Eligible")}
              </span>
            ) : readiness.isReady ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t("card.ready_badge", "Ready to Apply")}
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                {t(
                  "card.almost_ready_badge",
                  `Eligible • ${readiness.missingDocs.length} Document${readiness.missingDocs.length > 1 ? "s" : ""} Missing`
                )}
              </span>
            )}

            {/* Secondary Badge: Criteria Verification */}
            {scheme.rule_status === "not_configured" ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-amber-50/50 text-amber-800 border-amber-200">
                Eligibility rules not configured
              </span>
            ) : !isNotEligible && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  isConfirmed
                    ? "bg-emerald-50/50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50/50 text-blue-700 border-blue-200"
                }`}
              >
                {isConfirmed
                  ? t("card.confirmed_criteria", "Profile Matched")
                  : t("card.conditional_criteria", "Needs Verification")}
              </span>
            )}

            {scheme.category && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {scheme.category}
              </span>
            )}

            <span className="text-xs font-medium px-2 py-0.5 rounded text-slate-500 bg-slate-50 border border-slate-100">
              {scheme.scope === "Maharashtra" ? "Maharashtra State" : "Central Government"}
            </span>
          </div>

          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {t("tracker.official_portal", "Official Portal")} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Scheme Name */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
          {scheme.scheme_name || scheme.name}
        </h3>

        {/* Main Benefit */}
        {benefitText && (
          <div className="text-xs text-emerald-900 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80 mb-3 flex items-start gap-2">
            <Gift className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-bold">{t("card.benefit_label", "Key Benefit")}: </strong>
              <span>{benefitText}</span>
            </div>
          </div>
        )}

        {/* Document Readiness Callout */}
        {!isNotEligible && (
          <div
            className={`p-3 rounded-xl border text-xs mb-3 flex items-start gap-2.5 ${
              readiness.isReady
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : "bg-amber-50/80 border-amber-200 text-amber-950"
            }`}
          >
            {readiness.isReady ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-bold">
                  {readiness.isReady
                    ? t("card.all_docs_available", "All required documents available in your locker")
                    : t(
                        "card.docs_progress",
                        `${readiness.availableCount} of ${readiness.totalRequired} documents ready (${readiness.readinessPct}%)`
                      )}
                </strong>
                {readiness.totalRequired > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70">
                    {readiness.availableCount}/{readiness.totalRequired}
                  </span>
                )}
              </div>
              {!readiness.isReady && readiness.missingDocs.length > 0 && (
                <p className="text-[11px] text-amber-800">
                  <span className="font-semibold">{t("docs.missing_label", "Missing")}: </span>
                  {readiness.missingDocs.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Why it is included */}
        {scheme.explanation && (
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
            <strong className="text-slate-900 block mb-0.5">{t("card.why_eligible", "Why you match")}:</strong>
            <span>{scheme.explanation}</span>
          </div>
        )}

        {/* Documents Summary Snippet */}
        {scheme.documents_summary && (
          <div className="flex items-start gap-2 text-xs text-slate-600 mb-3 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100">
            <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">{t("modal.documents_required", "Documents needed")}: </span>
              <span className="text-slate-600">{scheme.documents_summary}</span>
            </div>
          </div>
        )}

        {/* Expand/Collapse Toggle for detailed criteria breakdown */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
        >
          {expanded ? (
            <>
              Hide details <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              View eligibility details ({passedReasons.length} matched{unresolvedReasons.length > 0 ? `, ${unresolvedReasons.length} to verify` : ""}{failedReasons.length > 0 ? `, ${failedReasons.length} failed` : ""}){" "}
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Detailed Breakdown */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
            {passedReasons.length > 0 && (
              <div>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                  <Check className="w-3.5 h-3.5" /> {t("card.why_eligible", "Criteria you satisfy")}:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  {passedReasons.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {unresolvedReasons.length > 0 && (
              <div>
                <span className="font-bold text-blue-700 flex items-center gap-1 mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> {t("card.why_pending", "Requires external verification")}:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  {unresolvedReasons.map((u, idx) => (
                    <li key={idx}>{u}</li>
                  ))}
                </ul>
              </div>
            )}

            {failedReasons.length > 0 && (
              <div>
                <span className="font-bold text-rose-700 flex items-center gap-1 mb-1.5">
                  <XCircle className="w-3.5 h-3.5" /> {t("card.criteria_failed", "Criteria not met")}:
                </span>
                <ul className="list-disc list-inside space-y-1 text-rose-800 pl-1">
                  {failedReasons.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Official Application Portal Note & Detail Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <p className="italic">
            {t("hero.disclaimer", "Applications are completed on the official government portal.")}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(scheme)}
                className={`inline-flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                  isSaved
                    ? "text-emerald-700 hover:text-emerald-800"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
                aria-label={isSaved ? "Remove from saved schemes" : "Save scheme for this session"}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    {t("card.saved", "Saved")}
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    {t("card.save", "Save Scheme")}
                  </>
                )}
              </button>
            )}

            {onOpenDetails && (
              <button
                type="button"
                onClick={() => onOpenDetails(scheme)}
                className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                {t("card.view_details", "View Full Details")}
              </button>
            )}
            {scheme.source_url && (
              <a
                href={scheme.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {t("modal.official_link", "Official portal")} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
