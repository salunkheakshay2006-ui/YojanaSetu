import React, { useState } from "react";
import { Bookmark, BookmarkX, ExternalLink, Info, Search, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Layers, Clock, Check } from "lucide-react";
import SchemeDetailModal from "./SchemeDetailModal";
import { TRACKER_STATUSES, ProgressIndicator } from "./ApplicationTrackerPage";
import { useLanguage } from "../contexts/LanguageContext";

export default function SavedSchemesPage({
  savedSchemes = [],
  onToggleSaveScheme,
  onGoToSearch,
  onGoToCheckEligibility,
  trackerStatuses = {},
  onUpdateStatus,
  onGoToTracker,
}) {
  const { t } = useLanguage();
  const [selectedScheme, setSelectedScheme] = useState(null);

  const getSchemeKey = (scheme) => {
    if (!scheme) return "";
    return scheme.id || scheme.scheme_id || scheme.name || scheme.scheme_name || "";
  };

  const getStatus = (scheme) => {
    const key = getSchemeKey(scheme);
    return trackerStatuses[key] || "Saved";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Bookmark className="w-3.5 h-3.5" /> {t("saved.title", "Saved Schemes")}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t("saved.title", "Saved Schemes")}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("saved.subtitle", "Quickly access schemes you have bookmarked during your current session. Review details, compare benefits, or prepare your paperwork.")}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {savedSchemes.length} {t("checklist.schemes", "Scheme(s) Saved")}
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-medium">{t("saved.synced", "Synced with Cloud Account")}</span>
          </div>
        </div>
      </div>

      {/* Zero State: No Saved Schemes */}
      {savedSchemes.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bookmark className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              {t("saved.empty_title", "You haven't saved any schemes yet.")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {t("saved.empty_desc", "When you find a scheme you are interested in, click 'Save Scheme' to bookmark it here for quick access.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onGoToSearch}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t("saved.browse_schemes", "Search All Schemes")}
            </button>
            <button
              onClick={onGoToCheckEligibility}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t("saved.find_schemes", "Check Scheme Eligibility")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
            Note: Saved schemes remain available while using this browser and refresh safely. No account is required.
          </div>
        </div>
      )}

      {/* Grid of Saved Schemes */}
      {savedSchemes.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">
              Your Saved Schemes ({savedSchemes.length})
            </h2>
            <button
              onClick={onGoToSearch}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              Add more schemes from directory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedSchemes.map((scheme, idx) => {
              const schemeName = scheme.name || scheme.scheme_name || "Government Scheme";
              const key = getSchemeKey(scheme) || idx;

              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Category & Scope Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {scheme.category && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {scheme.category}
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded text-slate-500 bg-slate-50 border border-slate-100">
                          {scheme.scope === "Maharashtra" ? "Maharashtra State" : "Central Government"}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onToggleSaveScheme(scheme)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer border border-rose-200"
                        title="Remove from saved schemes"
                      >
                        <BookmarkX className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {schemeName}
                    </h3>

                    {/* Benefit */}
                    {scheme.benefit && (
                      <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 leading-relaxed font-medium">
                        <strong className="text-emerald-950 block mb-0.5">Benefit:</strong>
                        {scheme.benefit}
                      </div>
                    )}

                    {/* Short Description */}
                    {scheme.description && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        <strong className="text-slate-800">Who is eligible: </strong>
                        {scheme.description}
                      </p>
                    )}

                    {/* FEATURE 5: Tracker Status Integration */}
                    {onUpdateStatus && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Application Status:
                          </span>
                          <span className="font-bold text-emerald-800">
                            {getStatus(scheme)}
                          </span>
                        </div>

                        <ProgressIndicator status={getStatus(scheme)} />

                        {getStatus(scheme) === "Submitted" && (
                          <div className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-tight">
                            Marked as submitted by you. This does not confirm government receipt or approval.
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              Update:
                            </label>
                            <select
                              value={getStatus(scheme)}
                              onChange={(e) => onUpdateStatus(key, e.target.value)}
                              className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                              {TRACKER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          {onGoToTracker && (
                            <button
                              type="button"
                              onClick={onGoToTracker}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                            >
                              Track in Tracker →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedScheme(scheme)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-emerald-600" />
                      View Details
                    </button>

                    {scheme.source_url && (
                      <a
                        href={scheme.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Official Portal
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Storage Information Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
        <strong className="text-slate-700 font-bold block">
          About Saved Schemes
        </strong>
        <p>
          Saved schemes are stored temporarily in your local browser so you can organize your inquiries without creating an account or logging in. Clearing your browser data will clear this list.
        </p>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
          isSaved={true}
          onToggleSave={onToggleSaveScheme}
        />
      )}
    </div>
  );
}
