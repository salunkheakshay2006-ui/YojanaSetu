import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import SchemeCard from '../components/SchemeCard';
import FutureSchemeCard from '../components/FutureSchemeCard';
import RecommendationCard from '../components/RecommendationCard';
import LoadingScreen from '../components/LoadingScreen';
import { useSchemes } from '../context/SchemeContext';
import { useCitizen } from '../context/CitizenContext';
import { getHealth } from '../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * BharatBenefits AI - Dashboard Page
 * Main landing page showcasing AI recommendation summary, stat metrics, scheme previews, and AI insights.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { citizenProfile } = useCitizen();
  const { schemes, futureOpportunities, recommendationResult, loading: contextLoading, isBackendConnected, refreshData } = useSchemes();

  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch backend health & sync data on page load
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLocalLoading(true);
      try {
        const healthRes = await getHealth();
        if (healthRes && healthRes.success) {
          if (refreshData) {
            await refreshData();
          }
        } else {
          setErrorMessage('Backend API is currently offline. Showing local mock dashboard.');
        }
      } catch (err) {
        console.warn('[Dashboard] Direct backend fetch notice:', err);
        setErrorMessage('Backend connection error. Showing local fallback data.');
      } finally {
        if (isMounted) setLocalLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const isLoading = contextLoading || localLoading;

  // Active dataset evaluation with mock fallback
  const eligibleList = recommendationResult?.eligible_schemes?.length
    ? recommendationResult.eligible_schemes
    : (schemes?.length ? schemes : []);

  const futureList = recommendationResult?.future_opportunities?.length
    ? recommendationResult.future_opportunities
    : (futureOpportunities?.length ? futureOpportunities : []);

  const eligibleCount = eligibleList.length || 8;
  const futureCount = futureList.length || 4;
  const confidenceScore = recommendationResult?.confidence_score
    ? `${Math.round(recommendationResult.confidence_score * 100)}%`
    : '96%';

  const schemeCategories = [
    { name: 'Agriculture', count: '12 schemes', bgColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { name: 'Education', count: '10 schemes', bgColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { name: 'Health', count: '10 schemes', bgColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { name: 'Pension', count: '8 schemes', bgColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { name: 'Skill Development', count: '6 schemes', bgColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { name: 'Others', count: '5 schemes', bgColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
  ];

  const progressChecklist = [
    { label: 'Profile Completed', done: true },
    { label: 'Eligibility Checked', done: true },
    { label: 'Recommendations Ready', done: true },
    { label: 'Explore Future Opportunities', done: true }
  ];

  // Top previews for SchemeCard and FutureSchemeCard
  const topEligibleScheme = eligibleList.length > 0 ? eligibleList[0] : {
    scheme_id: 'SCH0001',
    scheme_name: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    benefit: '₹6,000 / year direct income support',
    state: 'All India',
    match_score: 98,
    matching_reasons: ['Farmer status verified', 'Income within limit'],
    description: 'Provides direct income support to landholding farmer families across India.',
  };

  const topFutureOpportunity = futureList.length > 0 ? futureList[0] : {
    id: 1,
    scheme_name: 'PM Kisan Maandhan Yojana (Farmer Pension)',
    category: 'Pension',
    priority: 'High Priority',
    missing_requirement: 'Min Age Gap: 2 years remaining until age 30',
    missing_document: 'Income Certificate (Self Declaration)',
    estimated_time: '2 Years',
    reason: 'Eligible upon reaching minimum age threshold of 30 years.',
    readiness: '85%',
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Sidebar */}
      <Sidebar activeItem="Dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userName={citizenProfile?.name || citizenProfile?.occupation || 'Tanmay'}
        />

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

          {/* Backend API Connection & Error Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                Backend Status: {isBackendConnected ? 'Live FastAPI Engine (http://localhost:8000)' : 'Offline / Local Mock Mode'}
              </span>
            </div>
            {errorMessage && !isBackendConnected && (
              <span className="text-amber-400 font-semibold">{errorMessage}</span>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="text-blue-400 hover:text-blue-300 font-semibold self-start sm:self-auto"
            >
              Update Citizen Profile →
            </button>
          </div>

          {isLoading ? (
            <LoadingScreen message="Fetching live recommendation summary from backend..." />
          ) : (
            <>
              {/* Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d162a] via-[#111e38] to-[#152547] border border-slate-800/90 shadow-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative z-10 max-w-xl space-y-2 text-left">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Your Gateway to <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                      Government Opportunities
                    </span>
                  </h2>
                  <p className="text-sm md:text-base text-slate-400 font-medium">
                    Discover. Prepare. Progress.
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center md:items-end text-center md:text-right">
                  <div className="w-32 h-20 md:w-44 md:h-24 opacity-80 mb-2 relative flex items-center justify-center">
                    <svg className="w-full h-full text-amber-500/40 fill-current" viewBox="0 0 100 60">
                      <path d="M20 58 h60 v-4 h-60 z M25 54 h50 v-6 h-50 z M30 48 h40 v-8 h-40 z M40 40 h20 v-15 h-20 z M35 25 h30 v-5 h-30 z M45 20 h10 v-6 h-10 z" />
                      <path d="M42 54 a 8 8 0 0 1 16 0 z" fill="#090d16" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold tracking-wider text-amber-400/90 uppercase block">Sabka Saath</span>
                    <span className="text-xs font-semibold tracking-wider text-emerald-400/90 uppercase block">Sabka Vikas</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Eligible Schemes"
                  value={eligibleCount}
                  subtitle="You can apply now"
                  borderColor="border-emerald-500/40 hover:border-emerald-400"
                  iconBg="bg-emerald-500/20 text-emerald-400"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title="Upcoming Opportunities"
                  value={futureCount}
                  subtitle="Coming soon for you"
                  borderColor="border-blue-500/40 hover:border-blue-400"
                  iconBg="bg-blue-500/20 text-blue-400"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <StatCard
                  title="Potential Benefit"
                  value="₹48,000"
                  subtitle="From recommended schemes"
                  borderColor="border-amber-500/40 hover:border-amber-400"
                  iconBg="bg-amber-500/20 text-amber-400"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title="AI Confidence"
                  value={confidenceScore}
                  subtitle="High match with your profile"
                  borderColor="border-purple-500/40 hover:border-purple-400"
                  iconBg="bg-purple-500/20 text-purple-400"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
              </div>

              {/* Middle Section: Recommendation Card + AI Insight Quote + Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecommendationCard
                  recommendation={recommendationResult}
                  onClick={() => navigate('/recommendations')}
                />

                <div className="bg-gradient-to-br from-[#0d162a] to-[#121c35] border border-blue-900/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-slate-600 text-6xl font-serif absolute top-2 right-4 opacity-30 select-none">“</div>
                  <div className="relative z-10 space-y-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">AI Explanation Preview</span>
                    <blockquote className="text-sm md:text-base font-medium text-slate-100 leading-relaxed">
                      “{recommendationResult?.explanation || 'Based on your profile in Maharashtra as a Farmer, you match multiple high-priority government schemes with zero policy conflicts.'}”
                    </blockquote>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 via-white to-emerald-500" />
                  </div>
                  <button
                    onClick={() => navigate('/ai-insights')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 mt-4 text-left"
                  >
                    Read Detailed AI Insights →
                  </button>
                </div>

                <div className="bg-[#0d1322]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
                  <h3 className="text-sm font-bold text-white">Your Progress</h3>

                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-400" strokeDasharray="80, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-sm font-bold text-white">80%</span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {progressChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                          <span className="text-slate-300 font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previews Grid for SchemeCard & FutureSchemeCard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">Featured Scheme Match</h3>
                    <button onClick={() => navigate('/eligible-schemes')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All ({eligibleCount}) →</button>
                  </div>
                  <SchemeCard scheme={topEligibleScheme} onClick={() => navigate('/eligible-schemes')} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">Near-Eligible Opportunity</h3>
                    <button onClick={() => navigate('/future-opportunities')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All ({futureCount}) →</button>
                  </div>
                  <FutureSchemeCard opportunity={topFutureOpportunity} />
                </div>
              </div>

              {/* Scheme Categories */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white">Scheme Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {schemeCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate('/eligible-schemes')}
                      className="bg-[#0d1322]/80 border border-slate-800/80 hover:border-slate-700/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 cursor-pointer group transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center border group-hover:scale-110 transition-transform font-bold text-lg`}>
                        ★
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cat.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d162a] to-[#121f3b] border border-slate-800/90 p-6 flex items-center justify-between gap-4">
                  <div className="space-y-2 z-10 max-w-xs">
                    <h4 className="text-base font-bold text-white">Building an Inclusive India</h4>
                    <div className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-500 via-white to-emerald-500" />
                    <p className="text-xs text-slate-400 font-medium">More Opportunities • A Brighter Tomorrow</p>
                  </div>

                  <div className="w-28 h-20 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500 overflow-hidden relative">
                    <svg className="w-full h-full text-slate-700/60 fill-current" viewBox="0 0 100 60">
                      <rect x="10" y="30" width="80" height="25" rx="2" />
                      <path d="M35 30 a 15 15 0 0 1 30 0 z" fill="#1e293b" />
                    </svg>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#121c33] to-[#0f172a] border border-blue-900/30 p-6 flex items-center justify-between gap-4">
                  <div className="space-y-2 z-10 flex-1">
                    <blockquote className="text-sm font-bold text-white">“A small step today, a brighter tomorrow.”</blockquote>
                    <p className="text-xs text-slate-400">Let AI guide you to the best government schemes for a better future.</p>
                  </div>

                  <button
                    onClick={() => navigate('/ai-insights')}
                    className="w-10 h-10 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

