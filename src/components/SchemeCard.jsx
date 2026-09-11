import React from 'react';

/**
 * BharatBenefits AI - Reusable Scheme Card Component
 * Displays individual government scheme details in dark premium dashboard style.
 *
 * @param {Object} props
 * @param {string} [props.name] - Name of the government scheme
 * @param {string} [props.benefit] - Benefit details or financial amount
 * @param {string} [props.category] - Category tag (e.g. 'Agriculture', 'Scholarship')
 * @param {string} [props.description] - Short summary of the scheme
 * @param {number|string} [props.score] - Match percentage or eligibility score
 * @param {string} [props.status='Eligible'] - Scheme status tag ('Eligible' | 'Recommended')
 * @param {Function} [props.onClick] - Click handler for action button
 * @param {Object} [props.scheme] - Scheme object fallback
 */
export default function SchemeCard({
  name,
  benefit,
  category,
  description,
  score,
  status = 'Eligible',
  onClick,
  scheme
}) {
  // Support both object props (`scheme`) and individual primitive props
  const schemeName = name || scheme?.scheme_name || 'Government Scheme';
  const schemeBenefit = benefit || scheme?.benefit;
  const schemeCategory = category || scheme?.category || 'General';
  const schemeDesc = description || scheme?.description || scheme?.eligibility_text;
  const schemeScore = score || scheme?.match_score || 95;
  const matchingReasons = scheme?.matching_reasons || [];

  const handleAction = () => {
    if (onClick) {
      onClick(scheme || { name: schemeName, benefit: schemeBenefit, category: schemeCategory });
    }
  };

  return (
    <div className="bg-[#0d1322]/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group select-none">
      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
            {schemeCategory}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              {typeof schemeScore === 'number' ? `${schemeScore}% Match` : schemeScore}
            </span>
          </div>
        </div>

        {/* Scheme Name */}
        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
          {schemeName}
        </h3>

        {/* Benefit Highlight */}
        {schemeBenefit && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <p className="text-xs text-emerald-400 font-semibold line-clamp-2">
              🎁 Benefit: {schemeBenefit}
            </p>
          </div>
        )}

        {/* Description */}
        {schemeDesc && (
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {schemeDesc}
          </p>
        )}

        {/* Matching Reasons Tags */}
        {matchingReasons.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Match Reason:</span>
            <div className="flex flex-wrap gap-1">
              {matchingReasons.slice(0, 2).map((reason, idx) => (
                <span key={idx} className="text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  ✓ {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Link */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">Status: {status}</span>
        <button
          onClick={handleAction}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-1 transition-all"
        >
          <span>View Details</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
