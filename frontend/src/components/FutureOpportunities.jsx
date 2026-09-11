import React from "react";
import { Sparkles, ExternalLink, Info, ShieldAlert, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";
import { SCHEME_BENEFITS } from "../data/schemeBenefits";

/**
 * Determine valid Future Opportunities from existing eligibility results.
 *
 * Rules:
 * 1. Must NOT be in the recommended bundle (`bundle.bundle`).
 * 2. Must NOT be excluded due to scheme conflicts (e.g. PM Vishwakarma vs active MUDRA loan).
 * 3. Must NOT have immutable demographic mismatches (gender, permanent criteria).
 * 4. Must have an actionable, addressable document/account blocker identified in `reasons.failed`
 *    (e.g., bank account or ration card).
 * 5. Returns structured explanation, blocker description, and recommended next action using existing backend data.
 */
export function getFutureOpportunities(results = [], bundle = {}) {
  const bundleSchemes = bundle.bundle || [];
  const bundleIds = new Set(bundleSchemes.map((s) => s.scheme_id || s.id));

  // Also collect conflict-excluded schemes so they are NEVER presented as document-unlock opportunities
  const excludedSchemes = bundle.excluded_schemes || [];
  const excludedIds = new Set(excludedSchemes.map((s) => s.scheme_id || s.id));

  const opportunities = [];

  for (const scheme of results) {
    const sId = scheme.scheme_id || scheme.id;
    if (bundleIds.has(sId) || excludedIds.has(sId)) {
      continue;
    }

    const failed = scheme.reasons?.failed || [];
    if (failed.length === 0) {
      continue;
    }

    // Check if any failure reason is an immutable mismatch (e.g. gender)
    const hasImmutableFailure = failed.some((f) => {
      const fl = f.toLowerCase();
      return (
        fl.includes("gender") ||
        fl.includes("female applicants only") ||
        fl.includes("male applicants only") ||
        fl.includes("disability") ||
        fl.includes("pregnant") ||
        fl.includes("age")
      );
    });

    if (hasImmutableFailure) {
      continue;
    }

    // Check if failure is an addressable document / account requirement
    let blocker = null;
    let action = null;

    for (const f of failed) {
      const fl = f.toLowerCase();
      if (fl.includes("bank") || fl.includes("post-office account")) {
        blocker = "Bank or post-office savings account is currently missing";
        action = "Open a savings account with any commercial bank or post office, then re-check eligibility.";
        break;
      } else if (fl.includes("ration card") || fl.includes("aay") || fl.includes("phh")) {
        blocker = "Eligible priority ration card (AAY or PHH) is currently missing";
        action = "Apply for an eligible ration card at your local Civil Supplies office, then re-check eligibility.";
        break;
      }
    }

    if (blocker && action) {
      const schemeName = scheme.scheme_name || scheme.name;
      const benefitText =
        scheme.benefit ||
        SCHEME_BENEFITS[schemeName] ||
        "Benefit subject to official scheme terms";

      opportunities.push({
        ...scheme,
        schemeName,
        benefitText,
        blocker,
        action,
      });
    }
  }

  return opportunities;
}

export default function FutureOpportunities({
  results = [],
  bundle = {},
  onOpenDetails,
  isSchemeSaved = () => false,
  onToggleSaveScheme = null,
}) {
  const opportunities = getFutureOpportunities(results, bundle);

  // If there are no reliable, actionable future opportunities, render nothing
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <Sparkles className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Future Opportunities
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Some schemes may become worth checking later if a current condition is addressed.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            {opportunities.length} Potential Opportunit{opportunities.length === 1 ? "y" : "ies"}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          These schemes are <strong>not in your current recommended bundle</strong> because a specific requirement (such as an active bank account or ration card) is not yet on record. Addressing the condition may make the scheme worth re-checking in the future.
        </p>
      </div>

      {/* Grid of Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((item, idx) => {
          const isSaved = isSchemeSaved(item);

          return (
            <div
              key={idx}
              className="rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50/60 p-5 sm:p-6 transition flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                    Potential Future Opportunity
                  </span>

                  {item.category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded text-slate-500 bg-white border border-slate-200">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Scheme Name */}
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {item.schemeName}
                </h4>

                {/* Short Benefit */}
                {item.benefitText && (
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-purple-100 leading-relaxed">
                    <strong className="text-slate-900 block mb-0.5">Potential Benefit:</strong>
                    <span>{item.benefitText}</span>
                  </div>
                )}

                {/* Why it is not available right now */}
                <div className="text-xs text-slate-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1">
                  <strong className="text-amber-950 font-bold block">
                    Why it's not available right now:
                  </strong>
                  <p className="text-amber-900 leading-relaxed">
                    {item.blocker}
                  </p>
                </div>

                {/* What you can do next */}
                <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-emerald-950 font-bold block flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    What you can do next:
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    {item.action}
                  </p>
                </div>
              </div>

              {/* Safety Disclaimer */}
              <div className="text-[11px] text-slate-500 italic pt-1 border-t border-purple-100/80">
                Important: Addressing this condition does not guarantee eligibility or approval. Final decisions rest solely with the concerned government department.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {onToggleSaveScheme && (
                    <button
                      type="button"
                      onClick={() => onToggleSaveScheme(item)}
                      className={`inline-flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                        isSaved
                          ? "text-emerald-700 hover:text-emerald-800"
                          : "text-slate-600 hover:text-emerald-700"
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
                          Save Scheme
                        </>
                      )}
                    </button>
                  )}

                  {onOpenDetails && (
                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-purple-700 transition cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-purple-600" />
                      View Full Details
                    </button>
                  )}
                </div>

                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline"
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
  );
}
