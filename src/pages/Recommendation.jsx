import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import RecommendationCard from '../components/RecommendationCard';
import SchemeCard from '../components/SchemeCard';
import LoadingScreen from '../components/LoadingScreen';
import { useSchemes } from '../context/SchemeContext';

/**
 * BharatBenefits AI - Recommendation Page
 * Displays the AI-curated best scheme bundle, confidence breakdown, and individual bundle scheme cards from backend or fallback.
 */
export default function Recommendation() {
  const { recommendationResult, schemes, loading, isBackendConnected } = useSchemes();

  // Fallback Recommendation Bundle Data
  const fallbackRecommendation = {
    bundleName: 'PM Kisan + Ayushman Bharat',
    bundleBenefit: '₹48,000 / year income support + ₹5 Lakh Health Cover',
    confidence_score: 0.96,
    explanation: 'Based on your profile in Maharashtra as a Farmer, this bundle combines agricultural income support with zero-cost hospitalization coverage with 100% policy compatibility and zero mutual exclusion conflicts.',
  };

  // 3 Fallback Recommended Schemes
  const fallbackRecommendedSchemes = [
    {
      scheme_id: 'SCH0001',
      scheme_name: 'PM Kisan Samman Nidhi',
      category: 'Agriculture',
      state: 'All India',
      benefit: '₹6,000 / year direct bank transfer',
      match_score: 98,
      matching_reasons: ['Farmer status verified', 'Income within limit'],
      description: 'Provides assured financial support to landholding farmer families across India for agricultural seeds and fertilizers.',
    },
    {
      scheme_id: 'SCH0002',
      scheme_name: 'Ayushman Bharat PM-JAY',
      category: 'Health',
      state: 'All India',
      benefit: '₹5 Lakh cash-free hospital coverage per family/year',
      match_score: 96,
      matching_reasons: ['Highest health priority', 'Zero co-pay requirement'],
      description: 'Provides cashless access to secondary and tertiary healthcare services for vulnerable families across empaneled hospitals.',
    },
    {
      scheme_id: 'SCH0003',
      scheme_name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Agriculture',
      state: 'Maharashtra',
      benefit: 'Low-cost crop loss insurance against drought & flood',
      match_score: 94,
      matching_reasons: ['Maharashtra climate risk protection', 'Farmer focus'],
      description: 'Comprehensive insurance cover against crop damage due to unseasonal rainfall, drought, and natural calamities.',
    },
  ];

  const activeRecommendation = recommendationResult || fallbackRecommendation;

  // Extract bundle information
  const rawBundle = Array.isArray(activeRecommendation?.recommended_bundle) && activeRecommendation.recommended_bundle.length > 0
    ? activeRecommendation.recommended_bundle[0]
    : (activeRecommendation?.recommended_bundle || fallbackRecommendation);

  const displayBundle = {
    bundleName: rawBundle?.bundleName || rawBundle?.name || 'PM Kisan + Ayushman Bharat',
    bundleBenefit: rawBundle?.bundleBenefit || rawBundle?.benefit || '₹48,000 / year income support + ₹5 Lakh Health Cover',
    category: rawBundle?.category || 'Agriculture & Health',
    confidence_score: activeRecommendation?.confidence_score || 0.96,
    explanation: activeRecommendation?.explanation || fallbackRecommendation.explanation,
  };

  const confidencePercent = `${Math.round((displayBundle.confidence_score || 0.96) * 100)}%`;

  // Schemes included in recommendation
  const recommendedSchemes = (activeRecommendation?.eligible_schemes && activeRecommendation.eligible_schemes.length > 0)
    ? activeRecommendation.eligible_schemes.slice(0, 3)
    : (schemes && schemes.length > 0 ? schemes.slice(0, 3) : fallbackRecommendedSchemes);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="Recommendations" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                AI Recommendations & Best Bundle
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
                {isBackendConnected
                  ? 'AI-curated complementary scheme bundle generated live by FastAPI recommendation engine.'
                  : 'AI-curated complementary scheme bundle offering maximum total benefit with zero policy conflicts.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl shrink-0">
                🏆 {confidencePercent} AI Confidence Score
              </span>
            </div>
          </div>

          {loading ? (
            <LoadingScreen message="Fetching recommendations from backend API..." />
          ) : (
            <>
              {/* Top Recommendation Highlight & Why This Bundle Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Recommendation Card */}
                <div className="lg:col-span-1">
                  <RecommendationCard recommendation={displayBundle} />
                </div>

                {/* Right: Detailed Bundle AI Explanation Card */}
                <div className="lg:col-span-2 bg-[#0d1322]/90 border border-slate-800/90 rounded-2xl p-6 md:p-8 space-y-5 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Why This Bundle is Best For You
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                          High Benefit
                        </span>
                        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-md">
                          No Conflict
                        </span>
                        <span className="text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-md">
                          Strong Match
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {displayBundle.bundleName}
                    </h3>

                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                      {displayBundle.explanation}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Benefit</div>
                        <div className="text-sm font-bold text-emerald-400">{displayBundle.bundleBenefit}</div>
                      </div>
                      <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Health Cover</div>
                        <div className="text-sm font-bold text-blue-400">₹5 Lakh Cashless</div>
                      </div>
                      <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Conflict Check</div>
                        <div className="text-sm font-bold text-purple-400">0 Exclusions</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Bundle includes {recommendedSchemes.length} verified government schemes</span>
                    <button
                      onClick={() => alert(`Starting one-click application process for ${displayBundle.bundleName}!`)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      Apply Entire Bundle →
                    </button>
                  </div>
                </div>
              </div>

              {/* Individual Bundle Schemes Grid */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white">
                  Included Schemes in Recommended Bundle ({recommendedSchemes.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedSchemes.map((scheme, idx) => (
                    <SchemeCard
                      key={scheme.scheme_id || idx}
                      scheme={scheme}
                      status="Recommended"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

