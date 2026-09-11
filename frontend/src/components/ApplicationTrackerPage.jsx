import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  Search,
  ArrowRight,
  ShieldAlert,
  Compass,
  FileCheck,
  ChevronRight,
  Bookmark,
  BookmarkX,
  FileText,
} from "lucide-react";
import SchemeDetailModal from "./SchemeDetailModal";
import { useLanguage } from "../contexts/LanguageContext";

export const TRACKER_STATUSES = [
  "Saved",
  "Planning to Apply",
  "Application Started",
  "Submitted",
];

export function getStatusStepIndex(status) {
  const idx = TRACKER_STATUSES.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function ProgressIndicator({ status }) {
  const { t } = useLanguage();
  const currentIndex = getStatusStepIndex(status);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {TRACKER_STATUSES.map((step, idx) => {
          const isCompletedOrActive = idx <= currentIndex;
          return (
            <div key={step} className="flex-1 flex items-center">
              <div
                className={`h-2 w-full rounded-full transition-all duration-300 ${
                  isCompletedOrActive
                    ? idx === 3
                      ? "bg-emerald-600 shadow-xs"
                      : "bg-emerald-500"
                    : "bg-slate-200"
                }`}
                title={`${idx + 1}. ${step}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-400 px-0.5">
        <span>1. {t("tracker.status_saved", "Saved")}</span>
        <span>2. {t("tracker.status_planning", "Plan")}</span>
        <span>3. {t("tracker.status_started", "Started")}</span>
        <span>4. {t("tracker.status_submitted", "Submitted")}</span>
      </div>
    </div>
  );
}

export default function ApplicationTrackerPage({
  trackedSchemes = [],
  trackerStatuses = {},
  onUpdateStatus,
  onRemoveScheme,
  onGoToSearch,
  onGoToCheckEligibility,
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

  const getNextStatus = (currentStatus) => {
    const idx = TRACKER_STATUSES.indexOf(currentStatus);
    if (idx >= 0 && idx < TRACKER_STATUSES.length - 1) {
      return TRACKER_STATUSES[idx + 1];
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> {t("tracker.title", "Application Tracker")}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t("tracker.title", "Application Tracker")}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("tracker.subtitle", "Track the progress of schemes you are interested in. This is your personal tracking record and does not confirm government application status.")}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {trackedSchemes.length} {t("checklist.schemes", "Scheme(s) Tracked")}
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-medium">{t("saved.synced", "Synced with Cloud Account")}</span>
          </div>
        </div>
      </div>

      {/* Zero State: No Tracked Schemes */}
      {trackedSchemes.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              No schemes are being tracked yet.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Save a scheme first, then use Application Tracker to record your progress.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onGoToSearch}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Schemes
            </button>
            <button
              onClick={onGoToCheckEligibility}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Check My Eligibility
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
            Note: Saving a scheme automatically creates a personal tracking record for your session.
          </div>
        </div>
      )}

      {/* Grid of Tracked Schemes */}
      {trackedSchemes.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">
              Your Tracked Schemes ({trackedSchemes.length})
            </h2>
            <button
              onClick={onGoToSearch}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              Browse more schemes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trackedSchemes.map((scheme) => {
              const schemeName = scheme.name || scheme.scheme_name || "Government Scheme";
              const key = getSchemeKey(scheme);
              const currentStatus = getStatus(scheme);
              const nextStatus = getNextStatus(currentStatus);
              const isSubmitted = currentStatus === "Submitted";

              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Category & Current Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {scheme.category && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {scheme.category}
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded text-slate-500 bg-slate-50 border border-slate-100">
                          {scheme.scope === "Maharashtra" ? "Maharashtra State" : "Central"}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                          isSubmitted
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : currentStatus === "Application Started"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : currentStatus === "Planning to Apply"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {currentStatus}
                      </span>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {schemeName}
                    </h3>

                    {/* Progress Indicator */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Tracking Progress:</span>
                        <span className="font-bold text-emerald-800">{currentStatus}</span>
                      </div>
                      <ProgressIndicator status={currentStatus} />
                    </div>

                    {/* FEATURE 10: Honest Submission Warning */}
                    {isSubmitted && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 leading-relaxed space-y-0.5">
                        <div className="font-bold flex items-center gap-1 text-amber-900">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Self-Reported Status Note
                        </div>
                        <p>
                          Marked as submitted by you. This does not confirm that the government department has received or approved your application.
                        </p>
                      </div>
                    )}

                    {/* Status Dropdown / Fast Advance */}
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <label className="text-xs font-bold text-slate-700 shrink-0">
                        Update Status:
                      </label>
                      <select
                        value={currentStatus}
                        onChange={(e) => onUpdateStatus(key, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        {TRACKER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      {nextStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(key, nextStatus)}
                          className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer inline-flex items-center gap-1 ml-auto"
                        >
                          Advance to {nextStatus} →
                        </button>
                      )}
                    </div>
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

                    <div className="flex items-center gap-3">
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

                      {onRemoveScheme && (
                        <button
                          type="button"
                          onClick={() => onRemoveScheme(scheme)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove from tracker and saved schemes"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General Guidance Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
        <strong className="text-slate-700 font-bold block">
          About Your Application Tracker
        </strong>
        <p>
          This tracker is stored locally on your device to help you remember where you are in the application process. YojanaSetu does not submit applications or check government databases for approval status. Please submit and monitor your official paperwork through each scheme's designated portal.
        </p>
      </div>

      {/* Reusable Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
          isSaved={true}
          onToggleSave={onRemoveScheme ? () => onRemoveScheme(selectedScheme) : null}
        />
      )}
    </div>
  );
}
