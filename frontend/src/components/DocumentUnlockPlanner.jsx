import React from "react";
import { KeyRound, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Sparkles, ShieldAlert, FileText, Compass, ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function DocumentUnlockPlanner({ checklist, bundle }) {
  const { t } = useLanguage();
  if (!checklist) return null;

  const knownMissing = checklist.known_missing || [];
  const knownPresent = checklist.known_present || [];
  const verificationRequired = checklist.verification_required || [];

  // Transparent Priority Calculation based strictly on schemes count:
  // >= 4 schemes: High
  // 2 - 3 schemes: Medium
  // 1 scheme: Low
  const getPriorityInfo = (schemesCount) => {
    if (schemesCount >= 4) {
      return {
        level: t("planner.high_priority", "High Priority"),
        badgeClass: "bg-red-100 text-red-900 border-red-200",
        barClass: "bg-red-500",
        reason: `High priority because this document is needed by ${schemesCount} schemes in your current bundle.`,
      };
    } else if (schemesCount >= 2) {
      return {
        level: t("planner.medium_priority", "Medium Priority"),
        badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
        barClass: "bg-amber-500",
        reason: `Medium priority because this document is needed by ${schemesCount} schemes in your current bundle.`,
      };
    } else {
      return {
        level: t("planner.standard_priority", "Standard Priority"),
        badgeClass: "bg-blue-100 text-blue-900 border-blue-200",
        barClass: "bg-blue-500",
        reason: `Standard priority needed for ${schemesCount} scheme in your bundle.`,
      };
    }
  };

  // Sort missing documents by number of schemes unlocked (highest first)
  const sortedMissing = [...knownMissing].sort(
    (a, b) => (b.schemes?.length || 0) - (a.schemes?.length || 0)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {t("planner.title", "Which document should I get first?")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("planner.subtitle", "Document-Unlock Planning for your recommended scheme bundle")}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {knownMissing.length > 0
              ? `${knownMissing.length} Actionable Document${knownMissing.length > 1 ? "s" : ""} Missing`
              : "All Standard Documents Ready"}
          </span>
        </div>
      </div>

      {/* Feature 5 — Positive Message if No Missing Documents */}
      {knownMissing.length === 0 && (
        <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Great — no known bundle documents are missing!
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Your profile already has all standard verification documents recorded (such as an active Bank Account or Ration Card). 
            You should still verify scheme-specific requirements on the official government portal before applying.
          </p>
        </div>
      )}

      {/* Feature 1, 2, 3 — Prioritized Missing Documents Cards */}
      {knownMissing.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Prioritized Action Plan (Ranked by Schemes Prepared)
          </div>

          <div className="space-y-4">
            {sortedMissing.map((item, idx) => {
              const count = item.schemes?.length || 0;
              const priority = getPriorityInfo(count);

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50/90 transition p-5 sm:p-6 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-black text-slate-900">
                          {item.document}
                        </h4>
                        <span className="text-xs font-semibold text-emerald-700">
                          Required by {count} recommended scheme{count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${priority.badgeClass}`}>
                        Priority: {priority.level}
                      </span>
                    </div>
                  </div>

                  {/* Priority Rationale */}
                  <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    💡 {priority.reason}
                  </p>

                  {/* Action Advice */}
                  {item.action && (
                    <div className="text-xs text-slate-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
                      <strong className="text-amber-950 font-bold block mb-0.5">
                        Recommended Action:
                      </strong>
                      <span>{item.action}</span>
                    </div>
                  )}

                  {/* Document → Schemes Connection */}
                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-xs font-bold text-slate-800 block mb-2">
                      Helps prepare the following {count} scheme{count > 1 ? "s" : ""}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(item.schemes || []).map((schemeName, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-2 text-xs text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                          <span className="font-medium truncate">{schemeName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Note on Document Unlock */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <Compass className="w-4 h-4 text-blue-600" />
              How Document Planning Works
            </div>
            <p className="text-blue-800 leading-relaxed">
              Getting this document can help you complete the document requirements for these schemes. Other eligibility conditions still apply.
            </p>
          </div>
        </div>
      )}

      {/* Feature 4 — 3-Tier Summary Status (Available vs Missing vs Needs Verification) */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Document Classification Status
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <span className="font-bold block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ✓ Already Available ({knownPresent.length})
            </span>
            <p className="text-[11px] text-emerald-800">
              {knownPresent.length > 0
                ? knownPresent.map((d) => d.document).join(", ")
                : "No standard documents currently recorded."}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
            <span className="font-bold block mb-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              ⚠ Missing ({knownMissing.length})
            </span>
            <p className="text-[11px] text-amber-900">
              {knownMissing.length > 0
                ? knownMissing.map((d) => d.document).join(", ")
                : "None missing from known profile fields."}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
            <span className="font-bold block mb-1 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              ? Needs Verification ({verificationRequired.length})
            </span>
            <p className="text-[11px] text-blue-900">
              {verificationRequired.length} scheme-specific paperwork items to check on official portals.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 6 — Mandatory Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed italic">
        Disclaimer: Document planning only helps you prepare your applications. Having a document does not guarantee eligibility or approval. Final verification is done by the concerned government department.
      </div>
    </div>
  );
}
