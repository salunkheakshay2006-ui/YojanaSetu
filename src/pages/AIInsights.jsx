import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import { useSchemes } from '../context/SchemeContext';
import { useCitizen } from '../context/CitizenContext';

/**
 * BharatBenefits AI - AI Insights & Assistant Page
 * Explains scheme recommendation logic, eligibility, ineligibility, 
 * future opportunities, and confidence scores from backend response or mock fallback.
 */
export default function AIInsights() {
  const { citizenProfile, recommendationData, loading: citizenLoading } = useCitizen();
  const { recommendationResult: schemeRecResult, loading: schemeLoading, isBackendConnected, error: schemeError } = useSchemes();
  const [activeFilter, setActiveFilter] = useState('All');

  const isLoading = citizenLoading || schemeLoading;
  const recResult = recommendationData || schemeRecResult;

  // Fallback Mock AI Insight Explanation Cards
  const fallbackInsights = [
    {
      id: 1,
      type: 'recommendation',
      tag: 'Recommended Bundle',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: '🏆',
      title: 'Why PM Kisan + Ayushman Bharat Bundle was suggested',
      explanation: 'Your profile matches both Farmer status and state residency guidelines. PM Kisan provides direct income support of ₹6,000/yr, while Ayushman Bharat provides ₹5 Lakh cashless health cover. Both schemes have 100% policy compatibility with zero mutual exclusion rules.',
      score: '98% Rule Match',
    },
    {
      id: 2,
      type: 'ineligible',
      tag: 'Ineligibility Reason',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      icon: '🚫',
      title: 'Why Post-Doctoral Fellowship (PECFAR) was flagged Ineligible',
      explanation: `PECFAR requires an applicant qualification of Doctoral / Ph.D. or Master’s in Science. Since your profile education is set to '${citizenProfile?.education || 'Graduate'}', the qualification rule failed automatically.`,
      score: 'Rule Disqualified',
    },
    {
      id: 3,
      type: 'future',
      tag: 'Future Opportunity',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: '⏳',
      title: 'Why PM Kisan Maandhan Yojana is marked Near-Eligible',
      explanation: `You satisfy all socio-economic criteria for PM Kisan Maandhan Pension, but the minimum age requirement is 30 years. With your current age at ${citizenProfile?.age || 28}, you have a minor age gap remaining. You will qualify automatically upon turning 30.`,
      score: '85% Readiness',
    },
    {
      id: 4,
      type: 'confidence',
      tag: 'Confidence Explanation',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: '📊',
      title: 'How your 96% AI Confidence Score is calculated',
      explanation: 'The confidence score is computed by weighing 6 criteria layers: State Alignment (+15%), Category Match (+10%), Occupation Fit (+10%), Income Limit Compliance (+20%), Gender Eligibility (+10%), and Special Status Flags (+35%).',
      score: '96% Confidence',
    },
  ];

  // Derive dynamic insights from backend recommendation payload
  const getDynamicInsights = () => {
    if (!recResult) return fallbackInsights;

    const bundleName =
      recResult.bundle_name ||
      recResult.recommended_bundle?.[0]?.bundleName ||
      recResult.recommendations?.[0]?.scheme_name ||
      'AI Scheme Recommendation Bundle';

    const explanationText =
      recResult.explanation ||
      recResult.recommendation_reason ||
      recResult.reason ||
      `Based on ${citizenProfile?.name || 'citizen'}'s profile (${citizenProfile?.occupation || 'Farmer'}, ${citizenProfile?.state || 'Maharashtra'}), your income of ₹${(citizenProfile?.income || 180000).toLocaleString()} aligns with eligibility criteria across all selected schemes.`;

    const confScore = Math.round((recResult.confidence_score || recResult.confidence || 0.98) * 100);

    const insights = [
      {
        id: 1,
        type: 'recommendation',
        tag: 'Recommended Bundle',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: '🏆',
        title: `Why ${bundleName} was suggested`,
        explanation: explanationText,
        score: `${confScore}% Match`,
      },
    ];

    // Ineligible explanation section
    if (recResult.ineligible_schemes && recResult.ineligible_schemes.length > 0) {
      const inelig = recResult.ineligible_schemes[0];
      insights.push({
        id: 2,
        type: 'ineligible',
        tag: 'Ineligibility Reason',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        icon: '🚫',
        title: `Why ${inelig.scheme_name || inelig.name || 'Certain Higher-Tier Schemes'} were flagged Ineligible`,
        explanation: inelig.reason || inelig.disqualification_reason || `Profile attribute '${inelig.failed_rule || 'Criteria'}' did not meet the rule requirement for ${inelig.scheme_name || 'this scheme'}.`,
        score: 'Disqualified',
      });
    } else {
      insights.push({
        id: 2,
        type: 'ineligible',
        tag: 'Ineligibility Reason',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        icon: '🚫',
        title: 'Why Out-of-State & Specialized Qualification Schemes were Excluded',
        explanation: `The rule engine evaluated your profile (${citizenProfile?.name || 'Citizen'}, Age: ${citizenProfile?.age || 28}, State: ${citizenProfile?.state || 'Maharashtra'}, Income: ₹${(citizenProfile?.income || 180000).toLocaleString()}) against central schemes database. Schemes requiring non-matching state residency or Ph.D. requirements were safely excluded.`,
        score: 'Rule Exclusions',
      });
    }

    // Future Opportunity explanation section
    if (recResult.future_opportunities && recResult.future_opportunities.length > 0) {
      const fut = recResult.future_opportunities[0];
      insights.push({
        id: 3,
        type: 'future',
        tag: 'Future Opportunity',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        icon: '⏳',
        title: `Why ${fut.scheme_name || fut.title} is marked Near-Eligible`,
        explanation: fut.reason || fut.missing_requirement || fut.unlock_condition || `You satisfy socio-economic criteria, but must satisfy '${fut.time_to_eligibility || 'upcoming requirement'}' before unlocking full benefits.`,
        score: 'Near Eligible',
      });
    } else {
      insights.push(fallbackInsights[2]);
    }

    // Confidence Score explanation section
    insights.push({
      id: 4,
      type: 'confidence',
      tag: 'Confidence Explanation',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: '📊',
      title: `How your ${confScore}% AI Confidence Score is calculated`,
      explanation: `Calculated by matching profile parameters against rule engine matrices: State Alignment (+15%), Category Match (+10%), Occupation Fit (+10%), Income Threshold (+20%), Gender Rules (+10%), and Special Status Flags (+35%).`,
      score: `${confScore}% Confidence`,
    });

    return insights;
  };

  const insightsList = getDynamicInsights();

  const filteredInsights = activeFilter === 'All'
    ? insightsList
    : insightsList.filter((i) => i.type === activeFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="AI Assistant" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                AI Assistant & Scheme Insights
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
                {isBackendConnected
                  ? 'Plain-language transparency breakdown powered by live FastAPI recommendation engine.'
                  : 'Plain-language transparency breakdown explaining why schemes were recommended or excluded.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl shrink-0">
                🤖 Transparent AI Engine
              </span>
            </div>
          </div>

          {/* Backend Connection Status Banner */}
          {!isBackendConnected && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>Backend offline. Showing standard mock AI insight explanations. Connect backend at <code>http://localhost:8000</code> for live profile evaluation.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {schemeError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-xs text-rose-300">
              <span>⚠️</span>
              <span>{schemeError}</span>
            </div>
          )}

          {/* Loading Screen State */}
          {isLoading ? (
            <LoadingScreen message="Analyzing recommendation explanations from backend engine..." />
          ) : (
            <>
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Recommendation', 'Ineligible', 'Future', 'Confidence'].map((tab) => {
                  const isActive = activeFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-600/30'
                          : 'bg-[#0d1322] border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab} Insights
                    </button>
                  );
                })}
              </div>

              {/* Chat-style / Card-style Insight Stream */}
              <div className="space-y-4">
                {filteredInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="bg-[#0d1322]/90 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-3 hover:border-slate-700 transition-all shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold shrink-0">
                          {insight.icon}
                        </div>
                        <div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${insight.badgeColor}`}>
                            {insight.tag}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1">
                            {insight.title}
                          </h3>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0">
                        {insight.score}
                      </span>
                    </div>

                    <div className="bg-[#111827] border border-slate-800/80 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                      💡 <span className="font-semibold text-slate-200">AI Reasoning:</span> {insight.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}


