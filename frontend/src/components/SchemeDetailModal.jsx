import React from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Tag,
  FileText,
  Gift,
  Info,
  CheckCircle2,
  Users,
  AlertCircle,
  HelpCircle,
  XCircle,
  Building,
  Check,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { SCHEME_BENEFITS } from "../data/schemeBenefits";
import { useLanguage } from "../contexts/LanguageContext";

export default function SchemeDetailModal({ scheme, onClose, isSaved = false, onToggleSave = null }) {
  const { t } = useLanguage();
  if (!scheme) return null;

  const schemeName = scheme.name || scheme.scheme_name || "Government Scheme";
  const benefitText =
    scheme.benefit ||
    SCHEME_BENEFITS[schemeName] ||
    SCHEME_BENEFITS[scheme.name] ||
    SCHEME_BENEFITS[scheme.scheme_name];

  // Check if eligibility evaluation reasons are available (from results view)
  const hasEligibilityInfo = Boolean(scheme.status);
  const status = scheme.status;
  const passedReasons = scheme.reasons?.passed || [];
  const failedReasons = scheme.reasons?.failed || [];
  const unresolvedReasons = scheme.reasons?.unresolved || [];

  // Parse documents list if formatted with semicolons
  const rawDocs = scheme.documents_summary || scheme.documents_required || "";
  const docsList = rawDocs
    ? rawDocs
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 p-5 sm:p-6 flex items-start justify-between gap-4 z-10">
          <div className="space-y-1.5 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              {scheme.category && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {scheme.category}
                </span>
              )}
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full text-slate-600 bg-slate-100 border border-slate-200">
                {scheme.scope === "Maharashtra"
                  ? "Maharashtra State Scheme"
                  : "Central Government Scheme"}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {schemeName}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(scheme)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isSaved
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                aria-label={isSaved ? "Remove from saved schemes" : "Save scheme for this session"}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-500" />
                    Save Scheme
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 text-sm text-slate-700">
          {/* FEATURE 3 — Personalized Eligibility Callout (Shown only when viewing an evaluated scheme) */}
          {hasEligibilityInfo && (
            <div
              className={`p-4 rounded-2xl border ${
                status === "confirmed_eligible"
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : status === "conditional_eligible" || status === "conditional"
                  ? "bg-blue-50/80 border-blue-200 text-blue-950"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider">
                {status === "confirmed_eligible" && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-900">Your Eligibility: Confirmed Eligible</span>
                  </>
                )}
                {(status === "conditional_eligible" || status === "conditional") && (
                  <>
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-blue-900">Your Eligibility: Conditionally Eligible</span>
                  </>
                )}
                {status === "not_eligible" && (
                  <>
                    <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-800">Your Eligibility: Not Currently Eligible</span>
                  </>
                )}
              </div>

              {scheme.explanation && (
                <p className="text-xs leading-relaxed mb-3 font-medium">
                  {scheme.explanation}
                </p>
              )}

              {/* Reasons breakdown */}
              {(passedReasons.length > 0 || unresolvedReasons.length > 0 || failedReasons.length > 0) && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                  {passedReasons.length > 0 && (
                    <div>
                      <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                        <Check className="w-3.5 h-3.5" /> Criteria matched from your profile:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {passedReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {unresolvedReasons.length > 0 && (
                    <div>
                      <span className="font-semibold text-blue-800 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Items requiring external verification:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {unresolvedReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {failedReasons.length > 0 && (
                    <div>
                      <span className="font-semibold text-rose-800 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Criteria not met by current profile:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {failedReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 1: What is this scheme? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Info className="w-4 h-4 text-emerald-600" />
              {t("modal.overview", "What is this scheme?")}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {scheme.description || "Official government programme offering targeted assistance under scheme rules."}
            </p>
          </div>

          {/* Section 2: What benefits does it provide? */}
          {benefitText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <Gift className="w-4 h-4 text-emerald-700" />
                {t("modal.benefits", "What benefits does it provide?")}
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                  {benefitText}
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Who is it for? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-600" />
              {t("modal.eligibility_rules", "Who is it for? (Eligibility overview)")}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 block font-medium">Age Limit</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {scheme.min_age != null || scheme.max_age != null
                    ? `${scheme.min_age ?? 0} to ${scheme.max_age ?? 120} years`
                    : "No specific age limit"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 block font-medium">Income Ceiling</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {scheme.max_income != null
                    ? `Up to ₹${Number(scheme.max_income).toLocaleString("en-IN")}/year`
                    : "No income limit"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 block font-medium">Gender</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block capitalize">
                  {scheme.gender || "Any"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 block font-medium">Occupation</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block capitalize">
                  {scheme.occupation || "Any"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 block font-medium">Community / Category</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {scheme.caste_eligibility || "Any"}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] text-slate-400 block font-medium">Region / Scope</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {scheme.scope === "Maharashtra" ? "Maharashtra Only" : "All India (Central)"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: What documents may be needed? */}
          {docsList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-slate-600" />
                What documents may be needed?
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {docsList.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic pt-1">
                  Note: Document requirements are based on official portal records. Please confirm current formats on the official portal.
                </p>
              </div>
            </div>
          )}

          {/* Section 5: Where can I apply / learn more? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Building className="w-4 h-4 text-emerald-600" />
              Where can I apply / learn more?
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>
                  Information Source:{" "}
                  <span className="font-bold text-slate-800">
                    {scheme.source || "Official myScheme Government Directory"}
                  </span>
                </div>
                {scheme.last_verified && (
                  <div className="text-slate-400 text-[11px]">
                    Record verified on {scheme.last_verified}
                  </div>
                )}
              </div>

              {scheme.source_url && (
                <a
                  href={scheme.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition shrink-0"
                >
                  Visit Official Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Section 6: Important Note / Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 leading-relaxed space-y-1">
            <strong className="block font-bold text-amber-900">
              Important Note
            </strong>
            <p>
              YojanaSetu is an autonomous guidance platform that helps you discover schemes and prepare your application materials. Final eligibility verification, application processing, and benefit sanctioning are decided solely by the concerned government ministry or department according to current government guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
