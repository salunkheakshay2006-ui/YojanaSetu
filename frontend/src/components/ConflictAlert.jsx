import React from "react";
import { AlertTriangle, Info, ArrowRight, ShieldAlert, XCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function ConflictAlert({ conflicts = [], excludedSchemes = [] }) {
  const { t } = useLanguage();
  if (conflicts.length === 0 && excludedSchemes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      {/* 1. Potential Conflicts Section */}
      {conflicts.length > 0 && (
        <div className="rounded-3xl bg-amber-50/90 border border-amber-300 p-6 text-amber-950 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-base font-black text-amber-950">
                  {t("conflict.title", "Potential Scheme Conflicts Detected")} ({conflicts.length})
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {t("conflict.subtitle", "These schemes may have overlapping or conflicting benefits under official rules. YojanaSetu evaluated these against official guidelines to protect your active benefits.")}
                </p>
              </div>

              <div className="space-y-2.5">
                {conflicts.map((conflict, idx) => (
                  <div
                    key={conflict.conflict_id || idx}
                    className="bg-white p-4 rounded-2xl border border-amber-200 text-xs text-slate-700 shadow-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{conflict.scheme_a}</span>
                        <span className="text-slate-400 font-normal">↔</span>
                        <span>{conflict.scheme_b}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                        Benefit Conflict
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">What the conflict is: </strong>
                      {conflict.explanation}
                    </p>

                    <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-900 text-[11px]">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>What you should do: </strong>
                        These schemes may have overlapping or conflicting benefits. Please confirm with the concerned department before applying together. If one is excluded below, prioritize your active loan/benefit first.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Excluded Schemes Section */}
      {excludedSchemes.length > 0 && (
        <div className="rounded-3xl bg-slate-100/90 border border-slate-300 p-6 text-slate-900 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-red-100 text-red-700 shrink-0 mt-0.5">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Not Included in this Bundle ({excludedSchemes.length})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  The following schemes matched your demographic profile, but were excluded from your recommended bundle because of verified incompatibility rules.
                </p>
              </div>

              <div className="space-y-2.5">
                {excludedSchemes.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 shadow-xs space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-red-700 text-sm">
                        {item.scheme_name}
                      </h4>
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold">
                        Excluded from bundle
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Reason for exclusion: </strong>
                      {item.exclusion_reason || "Excluded due to detected benefit conflict."}
                    </p>

                    {item.source_url && (
                      <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Check guidelines again when your current loan or condition changes.</span>
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline font-semibold"
                        >
                          View official information →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
