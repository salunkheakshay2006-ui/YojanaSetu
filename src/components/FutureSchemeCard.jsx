import React from 'react';

/**
 * BharatBenefits AI - Reusable Future Scheme Card Component
 * Displays near-eligible future opportunity details in dark premium dashboard style.
 *
 * @param {Object} props
 * @param {string} [props.name] - Name of the upcoming scheme
 * @param {string} [props.status='Near Eligible'] - Future eligibility status badge
 * @param {string} [props.missingRequirement] - What condition is missing
 * @param {string} [props.missingDocument] - Required document missing
 * @param {string} [props.estimatedTime] - Estimated resolution timeframe
 * @param {string} [props.reason] - Short explanation of eligibility gap
 * @param {string|number} [props.readiness='85%'] - Readiness / progress percentage indicator
 * @param {Function} [props.onClick] - Click handler for action button
 * @param {Object} [props.opportunity] - Future opportunity object fallback
 */
export default function FutureSchemeCard({
  name,
  status = 'Near Eligible',
  missingRequirement,
  missingDocument,
  estimatedTime,
  reason,
  readiness = '85%',
  onClick,
  opportunity
}) {
  // Support both object prop (`opportunity`) and individual primitive props
  const schemeName = name || opportunity?.scheme_name || 'Government Opportunity';
  const oppStatus = status || opportunity?.priority || 'Near Eligible';
  const reqMissing = missingRequirement || opportunity?.missing_requirement || 'Age/Income Threshold';
  const docMissing = missingDocument || opportunity?.missing_document || 'Income Certificate';
  const timeEst = estimatedTime || opportunity?.estimated_time || '1-2 Months';
  const oppReason = reason || opportunity?.reason || 'Eligible upon resolving pending requirements.';
  const readinessVal = readiness || '85%';

  const handleAction = () => {
    if (onClick) {
      onClick(opportunity || { name: schemeName, missingRequirement: reqMissing });
    }
  };

  return (
    <div className="bg-[#0d1322]/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group select-none">
      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            ⏳ {oppStatus}
          </span>
          <span className="text-[11px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
            Est. Time: {timeEst}
          </span>
        </div>

        {/* Scheme Name */}
        <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
          {schemeName}
        </h4>

        {/* Readiness Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Readiness:</span>
            <span className="text-amber-400">{readinessVal}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
              style={{ width: typeof readinessVal === 'number' ? `${readinessVal}%` : readinessVal }}
            />
          </div>
        </div>

        {/* Missing Requirements Details */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-start gap-2 bg-[#111827] p-2.5 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold shrink-0">⚠️ Condition Gap:</span>
            <span className="text-slate-200 line-clamp-2">{reqMissing}</span>
          </div>

          {docMissing && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-blue-400 font-bold shrink-0">📄 Required Doc:</span>
              <span className="text-slate-300 truncate">{docMissing}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reason Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400 italic line-clamp-1 flex-1">
          💡 {oppReason}
        </p>
        {onClick && (
          <button
            onClick={handleAction}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0"
          >
            Track →
          </button>
        )}
      </div>
    </div>
  );
}
