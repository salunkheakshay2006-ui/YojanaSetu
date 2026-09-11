import React from 'react';

/**
 * BharatBenefits AI - Reusable Loading Screen Component
 * Displays animated progress, spinner, & step indicator in dark premium dashboard style.
 *
 * @param {Object} props
 * @param {string} [props.message='Analyzing profile & finding best government schemes...'] - Loading status text
 * @param {number} [props.step=2] - Current active AI pipeline step (1: Profile, 2: Eligibility, 3: Opportunities, 4: Recommendation)
 * @param {number} [props.progress=70] - Percentage value for progress bar (0-100)
 */
export default function LoadingScreen({
  message = 'Analyzing profile & finding best government schemes...',
  step = 2,
  progress = 70
}) {
  const steps = [
    { num: 1, label: 'Analyzing Profile' },
    { num: 2, label: 'Checking Eligibility' },
    { num: 3, label: 'Finding Opportunities' },
    { num: 4, label: 'Building Bundle' },
  ];

  return (
    <div className="min-h-[420px] w-full flex flex-col items-center justify-center p-8 bg-[#090d16]/90 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-6 select-none">
      
      {/* Animated Glowing Spinner with Lotus Logo Icon */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* outer ring glow */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-blue-500 border-r-emerald-400 animate-spin" />
        {/* inner core icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
          <svg className="w-6 h-6 text-slate-950 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-1.5 3-4 4.5-7 5 2.5 3.5 5 8 7 13 2-5 4.5-9.5 7-13-3-.5-5.5-2-7-5z" />
          </svg>
        </div>
      </div>

      {/* Main Status Heading & Sub-message */}
      <div className="text-center space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-white tracking-wide">
          BharatBenefits AI Engine
        </h3>
        <p className="text-xs text-slate-300 animate-pulse font-medium">
          {message}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs space-y-1">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>AI Processing</span>
          <span className="text-emerald-400">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pipeline Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg pt-2">
        {steps.map((st) => {
          const isDone = st.num < step;
          const isCurrent = st.num === step;
          return (
            <div
              key={st.num}
              className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-blue-500/20 border-blue-500/50 text-white font-bold animate-pulse'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5">
                Step 0{st.num}
              </div>
              <div className="truncate font-medium">{st.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
