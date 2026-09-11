import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FutureSchemeCard from '../components/FutureSchemeCard';
import LoadingScreen from '../components/LoadingScreen';
import { useSchemes } from '../context/SchemeContext';
import { getFutureOpportunities } from '../services/api';

/**
 * BharatBenefits AI - Future Opportunities Page
 * Displays schemes citizens are close to qualifying for with missing requirements & timeline.
 */
export default function FutureOpportunities() {
  const { futureOpportunities, recommendationResult, loading: contextLoading, isBackendConnected } = useSchemes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [selectedGap, setSelectedGap] = useState('All');
  const [apiOpportunities, setApiOpportunities] = useState(null);
  const [fetchingApi, setFetchingApi] = useState(false);

  // Direct fetch from GET /api/future-opportunities endpoint on load
  useEffect(() => {
    let isMounted = true;
    const loadFutureOpps = async () => {
      if (!isBackendConnected) return;
      setFetchingApi(true);
      try {
        const res = await getFutureOpportunities();
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setApiOpportunities(res.data);
        }
      } catch (err) {
        console.warn('[FutureOpportunities] Endpoint fetch error:', err);
      } finally {
        if (isMounted) setFetchingApi(false);
      }
    };

    loadFutureOpps();
    return () => { isMounted = false; };
  }, [isBackendConnected]);

  // Fallback mock future opportunity cards
  const fallbackOpportunities = [
    {
      id: 1,
      scheme_name: 'PM Kisan Maandhan Yojana (Farmer Pension)',
      category: 'Pension',
      priority: 'High Priority',
      missing_requirement: 'Min Age Gap: 2 years remaining until turning age 30',
      missing_document: 'Income Certificate (Self Declaration)',
      estimated_time: '2 Years',
      reason: 'Eligible upon reaching minimum age threshold of 30 years.',
      readiness: '85%',
    },
    {
      id: 2,
      scheme_name: 'Post-Doctoral Fellowship to SC/ST Candidates',
      category: 'Scholarship',
      priority: 'High Priority',
      missing_requirement: 'Ph.D. Degree completion certificate submission',
      missing_document: 'Provisional Ph.D. Degree / NOC Certificate',
      estimated_time: '3 Months',
      reason: 'Qualifies immediately upon uploading final thesis award certificate.',
      readiness: '92%',
    },
    {
      id: 3,
      scheme_name: 'Stand-Up India Micro-Loan Scheme',
      category: 'Business',
      priority: 'Medium Priority',
      missing_requirement: 'Business Udyam Registration & Bank Account linkage',
      missing_document: 'Business Registration Certificate (MSME Udyam)',
      estimated_time: '1 Month',
      reason: 'Eligible upon completing 1-page free online MSME Udyam registration.',
      readiness: '75%',
    },
    {
      id: 4,
      scheme_name: 'Pradhan Mantri Awas Yojana (PMAY-Urban)',
      category: 'Housing',
      priority: 'High Priority',
      missing_requirement: 'Family Income Certificate validation under ₹3 Lakh',
      missing_document: 'Tahsildar Certified Income Certificate',
      estimated_time: '2 Weeks',
      reason: 'Requires revenue office certified income proof to unlock subsidy.',
      readiness: '88%',
    },
    {
      id: 5,
      scheme_name: 'National Means-cum-Merit Scholarship (NMMSS)',
      category: 'Scholarship',
      priority: 'Medium Priority',
      missing_requirement: 'School Bonafide Certificate & Marksheet update',
      missing_document: 'School Attendance & Marksheet Record',
      estimated_time: '1 Month',
      reason: 'Qualifies after submitting 75%+ attendance school principal certificate.',
      readiness: '90%',
    },
    {
      id: 6,
      scheme_name: 'Atal Pension Yojana (APY)',
      category: 'Pension',
      priority: 'Medium Priority',
      missing_requirement: 'Savings Bank Account Auto-Debit Mandate setup',
      missing_document: 'Bank Passbook & Mandate Form',
      estimated_time: '1 Week',
      reason: 'Eligible immediately upon enabling bank account auto-debit.',
      readiness: '95%',
    },
  ];

  // Prefer recommendationResult future opportunities, then API endpoint result, then context, then fallback
  const sourceOpportunities = (recommendationResult?.future_opportunities && recommendationResult.future_opportunities.length > 0)
    ? recommendationResult.future_opportunities
    : (apiOpportunities && apiOpportunities.length > 0
      ? apiOpportunities
      : (futureOpportunities && futureOpportunities.length > 0 ? futureOpportunities : fallbackOpportunities));

  // Filter logic
  const filteredOpps = sourceOpportunities.filter((opp) => {
    const q = searchQuery.toLowerCase();
    const schemeName = (opp.scheme_name || opp.name || '').toLowerCase();
    const category = (opp.category || 'General').toLowerCase();
    const missingReq = (opp.missing_requirement || opp.reason || '').toLowerCase();
    const missingDoc = (opp.missing_document || '').toLowerCase();
    const estTime = (opp.estimated_time || '').toLowerCase();

    const matchesQuery = !q || schemeName.includes(q) || category.includes(q) || missingReq.includes(q);
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory.toLowerCase();
    const matchesTime = selectedTimeframe === 'All' || estTime.includes(selectedTimeframe.toLowerCase());
    const matchesGap = selectedGap === 'All' || (selectedGap === 'Age' && missingReq.includes('age')) || (selectedGap === 'Document' && (missingDoc || missingReq.includes('document') || missingReq.includes('certificate')));

    return matchesQuery && matchesCategory && matchesTime && matchesGap;
  });

  const isLoading = contextLoading || fetchingApi;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="Future Opportunities" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Future Opportunities ({filteredOpps.length})
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
                {isBackendConnected
                  ? 'Showing near-eligible schemes generated live by backend recommendation engine.'
                  : 'Schemes you are close to becoming eligible for with minor requirement or document updates.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl shrink-0">
                ⏳ {filteredOpps.length} Near-Eligible Opportunities
              </span>
            </div>
          </div>

          {isLoading ? (
            <LoadingScreen message="Fetching future opportunities from backend..." />
          ) : (
            <>
              {/* Filter Toolbar */}
              <div className="bg-[#0d1322]/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 space-y-3 backdrop-blur-md">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Filter Future Opportunities
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="Pension">Pension</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Business">Business</option>
                      <option value="Housing">Housing</option>
                    </select>
                  </div>

                  {/* Time to Eligibility Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Time to Eligibility</label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="All">Any Timeframe</option>
                      <option value="Week">Within 1-2 Weeks</option>
                      <option value="Month">Within 1-3 Months</option>
                      <option value="Year">Within 1-2 Years</option>
                    </select>
                  </div>

                  {/* Gap Type Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Missing Requirement Type</label>
                    <select
                      value={selectedGap}
                      onChange={(e) => setSelectedGap(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="All">All Gap Types</option>
                      <option value="Age">Age Gap / Birthday</option>
                      <option value="Document">Missing Document / Registration</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              {filteredOpps.length === 0 ? (
                <div className="bg-[#0d1322]/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="text-4xl">✨</div>
                  <h3 className="text-lg font-bold text-white">No Future Opportunities Found</h3>
                  <p className="text-xs text-slate-400">Try clearing your filters to view all near-eligible schemes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpps.map((opp, idx) => (
                    <FutureSchemeCard key={opp.id || idx} opportunity={opp} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}


