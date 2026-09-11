import React, { useState, useMemo } from "react";
import { CheckCircle2, AlertOctagon, HelpCircle, FileCheck2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { isDocAvailable } from "../utils/documentReadiness";

export default function ChecklistView({ checklist, availableDocs = [], onGoToDocuments = null }) {
  const { t } = useLanguage();
  if (!checklist) return null;

  const [activeTab, setActiveTab] = useState("all");

  const rawKnownPresent = checklist.known_present || [];
  const rawKnownMissing = checklist.known_missing || [];
  const rawVerificationRequired = checklist.verification_required || [];

  // Live reconciliation between backend checklist and citizen's live availableDocs
  const { knownPresent, knownMissing, verificationRequired, totalCount } = useMemo(() => {
    const present = [];
    const missing = [];
    const verify = [];

    const allItems = [
      ...rawKnownPresent.map((i) => ({ ...i, originalStatus: "known_present" })),
      ...rawKnownMissing.map((i) => ({ ...i, originalStatus: "known_missing" })),
      ...rawVerificationRequired.map((i) => ({ ...i, originalStatus: "verification_required" })),
    ];

    const seen = new Set();
    allItems.forEach((item) => {
      if (!item.document || seen.has(item.document)) return;
      seen.add(item.document);

      const isHeld = isDocAvailable(item.document, availableDocs);
      if (isHeld) {
        present.push(item);
      } else if (item.originalStatus === "known_missing" || availableDocs.length > 0) {
        missing.push(item);
      } else {
        verify.push(item);
      }
    });

    return {
      knownPresent: present,
      knownMissing: missing,
      verificationRequired: verify,
      totalCount: present.length + missing.length + verify.length,
    };
  }, [rawKnownPresent, rawKnownMissing, rawVerificationRequired, availableDocs]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {t("checklist.title", "Document Checklist")}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {t("checklist.subtitle", "Deduplicated paperwork required for all schemes in your recommended bundle")}
          </p>
          {onGoToDocuments && (
            <div className="pt-1.5">
              <button
                onClick={onGoToDocuments}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
              >
                <span>📂 {t("docs.manage_in_locker", "Manage your personal availability in My Documents")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Filters with exact requested symbols */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("checklist.all", "All Documents")} ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("missing")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "missing"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚠ {t("checklist.missing", "Missing")} ({knownMissing.length})
          </button>
          <button
            onClick={() => setActiveTab("present")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "present"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✓ {t("checklist.available", "Available")} ({knownPresent.length})
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "verify"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ? {t("checklist.verify", "Verification required")} ({verificationRequired.length})
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* 1. Missing Documents (⚠ Missing) */}
        {(activeTab === "all" || activeTab === "missing") && knownMissing.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                ⚠ Missing Documents ({knownMissing.length})
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {knownMissing.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
                      {item.document}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠ Missing
                    </span>
                  </div>

                  {item.action && (
                    <p className="text-xs text-amber-950 bg-white/80 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed font-medium">
                      👉 <strong>Action to take:</strong> {item.action}
                    </p>
                  )}

                  {item.schemes && item.schemes.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-600">Needed for: </span>
                      {item.schemes.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Available in Profile / Locker (✓ Available) */}
        {(activeTab === "all" || activeTab === "present") && knownPresent.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">
                ✓ Available in Profile & Locker ({knownPresent.length})
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {knownPresent.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {item.document}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Available
                    </span>
                  </div>
                  {item.schemes && item.schemes.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-600">Supports: </span>
                      {item.schemes.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Verification Required (? Verification required) */}
        {(activeTab === "all" || activeTab === "verify") && verificationRequired.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
                ? Verification Required ({verificationRequired.length})
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {verificationRequired.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      {item.document}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                      ? Verify
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      📋 <strong>Note:</strong> {item.note}
                    </p>
                  )}
                  {item.schemes && item.schemes.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-600">For schemes: </span>
                      {item.schemes.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
