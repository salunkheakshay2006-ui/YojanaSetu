import React from "react";
import { SUPPORT_GOALS } from "../data/goals";
import { Check, Compass, Sparkles } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function GoalSelector({ selectedGoals, onToggleGoal, onClearGoals }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {t("goal.header", "What kind of support do you need?")}
            </h2>
            <p className="text-xs text-slate-500">
              {t("goal.subtitle", "Select one or more areas of assistance to help prioritize matching schemes for you.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {selectedGoals.length > 0 ? (
            <>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {selectedGoals.length} {t("goal.selected_count", "goal(s) selected")}
              </span>
              <button
                type="button"
                onClick={onClearGoals}
                className="text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
              >
                {t("goal.clear_all", "Clear all")}
              </button>
            </>
          ) : (
            <span className="text-slate-400 italic">{t("goal.optional", "Optional — choose any or leave empty")}</span>
          )}
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {SUPPORT_GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const title = t(`goal.${goal.id}`, goal.title);
          const description = t(`goal.${goal.id}_desc`, goal.description);

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onToggleGoal(goal.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-2xl" role="img" aria-label={title}>
                  {goal.icon}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 group-hover:border-slate-400 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div className="font-black text-xs text-slate-900 mb-1">
                {title}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {description}
              </p>
            </button>
          );
        })}
      </div>

      {selectedGoals.length > 0 && (
        <div className="text-[11px] text-emerald-800/80 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {t("card.priority_match", "Schemes addressing your selected goals will appear with a priority banner on your results page.")}
          </span>
        </div>
      )}
    </div>
  );
}

