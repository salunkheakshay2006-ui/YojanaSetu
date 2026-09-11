import React from 'react';

/**
 * BharatBenefits AI - Reusable Statistic Card Component
 * Displays key metrics in the dark premium AI dashboard style.
 *
 * @param {Object} props
 * @param {string} props.title - Metric title (e.g. 'Eligible Schemes')
 * @param {string|number} props.value - Metric value (e.g. '8', '₹48,000', '96%')
 * @param {string} [props.subtitle] - Secondary text (e.g. 'You can apply now')
 * @param {React.ReactNode} [props.icon] - Optional SVG or element icon
 * @param {string} [props.accent='blue'] - Accent color scheme ('emerald' | 'blue' | 'amber' | 'purple')
 * @param {string} [props.borderColor] - Optional custom border class
 * @param {string} [props.iconBg] - Optional custom icon background class
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = 'blue',
  borderColor,
  iconBg
}) {
  // Preset theme color maps for quick accent customization
  const accentStyles = {
    emerald: {
      border: 'border-emerald-500/40 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    blue: {
      border: 'border-blue-500/40 hover:border-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    amber: {
      border: 'border-amber-500/40 hover:border-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    purple: {
      border: 'border-purple-500/40 hover:border-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
  };

  const style = accentStyles[accent] || accentStyles.blue;
  const activeBorderClass = borderColor || style.border;
  const activeIconBgClass = iconBg || style.iconBg;

  return (
    <div
      className={`bg-[#0d1322]/80 border ${activeBorderClass} rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between space-y-4 select-none group`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-xl ${activeIconBgClass} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
          {icon || (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
          Stats
        </span>
      </div>

      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight mb-1">{value}</div>
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
