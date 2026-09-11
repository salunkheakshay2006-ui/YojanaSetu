import React from 'react';

/**
 * BharatBenefits AI - Reusable Recommendation Card Component
 * Displays the AI-recommended scheme bundle with confidence score & match tags in dark premium dashboard style.
 *
 * @param {Object} props
 * @param {string} [props.title] - Recommended bundle or scheme title
 * @param {string} [props.benefit] - Total financial or healthcare benefit summary
 * @param {number|string} [props.confidence] - AI confidence percentage (e.g. '96%')
 * @param {string} [props.reason] - Reasoning why this bundle was selected
 * @param {string[]} [props.tags] - Array of pill tags (e.g. ['Highest Benefit', 'No Conflicts', 'Best Match'])
 * @param {Function} [props.onClick] - Click handler for action button
 * @param {Object} [props.recommendation] - Recommendation result object fallback
 */
export default function RecommendationCard({
  title,
  benefit,
  confidence,
  reason,
  tags,
  onClick,
  recommendation
}) {
  // Support both object prop (`recommendation`) and individual primitive props
  const bundleTitle = title || recommendation?.bundleName || 'PM Kisan + Ayushman Bharat';
  const bundleBenefit = benefit || recommendation?.bundleBenefit || '₹48,000 / year + ₹5 Lakh Health Cover';
  const confidenceScore = confidence || (recommendation?.confidence_score ? `${Math.round(recommendation.confidence_score * 100)}%` : '96%');
  const explanationReason = reason || recommendation?.explanation || 'Top recommended bundle with maximum complementary benefits and zero scheme conflicts.';
  const cardTags = tags || ['Highest Benefit', 'No Conflicts', 'Best Match'];

  const handleAction = () => {
    if (onClick) {
      onClick(recommendation || { title: bundleTitle, benefit: bundleBenefit });
    }
  };

  return (
    <div className="bg-[#0d1322]/80 border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group select-none">
      <div>
        {/* Header Tag & Confidence */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>AI Recommendation</span>
          </div>

          <span className="text-[11px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
            {confidenceScore} AI Match
          </span>
        </div>

        {/* Bundle Title & Icon */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-lg shadow-inner">
            🏆
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
              {bundleTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Recommended Bundle</p>
          </div>
        </div>

        {/* Benefit Highlight */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl my-3">
          <p className="text-xs text-emerald-400 font-semibold truncate">
            💰 {bundleBenefit}
          </p>
        </div>

        {/* Short Explanation */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {explanationReason}
        </p>

        {/* Match Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {cardTags.map((tag, idx) => (
            <span
              key={idx}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                idx === 0
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : idx === 1
                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                  : 'text-purple-400 bg-purple-500/10 border-purple-500/30'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* View Details Button */}
      <button
        onClick={handleAction}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40"
      >
        <span>View Details</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
