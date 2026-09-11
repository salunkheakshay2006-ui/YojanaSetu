import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SchemeCard from '../components/SchemeCard';
import LoadingScreen from '../components/LoadingScreen';
import { useSchemes } from '../context/SchemeContext';
import { searchSchemes, getSchemeById } from '../services/api';

/**
 * BharatBenefits AI - Eligible Schemes Page
 * Displays filtered grid of government schemes matching citizen eligibility criteria from backend or fallback.
 */
export default function EligibleSchemes() {
  const { schemes, recommendationResult, loading, isBackendConnected } = useSchemes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedOccupation, setSelectedOccupation] = useState('All');
  const [selectedEducation, setSelectedEducation] = useState('All');
  const [activeModalScheme, setActiveModalScheme] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Fallback mock schemes if backend data is empty
  const fallbackSchemes = [
    {
      scheme_id: 'SCH0001',
      scheme_name: 'PM Kisan Samman Nidhi',
      category: 'Agriculture',
      state: 'All India',
      central_or_state: 'Central',
      benefit: '₹6,000 / year direct income transfer in 3 instalments',
      occupation: 'Farmer',
      education: 'All',
      match_score: 98,
      matching_reasons: ['Farmer status verified', 'Income under eligibility limit'],
      description: 'Provides income support of ₹6,000 per year to all landholding farmer families across India to supplement financial needs in procuring agricultural inputs.',
    },
    {
      scheme_id: 'SCH0002',
      scheme_name: 'Ayushman Bharat PM-JAY',
      category: 'Health',
      state: 'All India',
      central_or_state: 'Central',
      benefit: '₹5 Lakh free health insurance cover per family per year',
      occupation: 'General/Unspecified',
      education: 'All',
      match_score: 96,
      matching_reasons: ['High health priority match', 'Eligible socio-economic status'],
      description: 'World’s largest government-funded health assurance scheme providing health coverage for secondary and tertiary care hospitalization to bottom 40% vulnerable families.',
    },
    {
      scheme_id: 'SCH0003',
      scheme_name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Agriculture',
      state: 'Maharashtra',
      central_or_state: 'Central',
      benefit: 'Comprehensive crop insurance against natural calamities & pest attack',
      occupation: 'Farmer',
      education: 'All',
      match_score: 94,
      matching_reasons: ['Agriculture focus', 'Matches Maharashtra state criteria'],
      description: 'Provides low-cost comprehensive crop insurance to farmers against non-preventable natural risks from pre-sowing to post-harvest stages.',
    },
    {
      scheme_id: 'SCH0004',
      scheme_name: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
      category: 'Business',
      state: 'All India',
      central_or_state: 'Central',
      benefit: 'Collateral-free working capital loan up to ₹50,000 with interest subsidy',
      occupation: 'Business',
      education: 'All',
      match_score: 90,
      matching_reasons: ['Business/Vendor status', 'Affordable micro-credit access'],
      description: 'Special micro-credit facility empowering street vendors and small entrepreneurs to restart micro-businesses with low-interest working capital loans.',
    },
    {
      scheme_id: 'SCH0005',
      scheme_name: 'National Social Assistance Programme (NSAP)',
      category: 'Pension',
      state: 'All India',
      central_or_state: 'Central',
      benefit: 'Monthly pension allowance for senior citizens, widows, & disability status',
      occupation: 'General/Unspecified',
      education: 'All',
      match_score: 88,
      matching_reasons: ['Widow / Disability welfare focus', 'Income criteria match'],
      description: 'Welfare social assistance scheme fulfilling constitutional principles by providing monthly pensions to elderly, widows, and persons with disabilities.',
    },
    {
      scheme_id: 'SCH0006',
      scheme_name: 'Post-Matric Scholarship Scheme for SC/ST/OBC Students',
      category: 'Scholarship',
      state: 'Maharashtra',
      central_or_state: 'Central/State',
      benefit: '100% tuition fee reimbursement + monthly maintenance allowance',
      occupation: 'Student',
      education: 'Graduate',
      match_score: 92,
      matching_reasons: ['OBC Category match', 'Student status verified'],
      description: 'Financial assistance for post-matriculation or post-secondary stages to enable eligible SC/ST/OBC students to complete higher education.',
    },
  ];

  // Call search API when filters are updated
  useEffect(() => {
    let isMounted = true;
    const fetchSearchResults = async () => {
      if (!isBackendConnected) return;

      const filters = {};
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedState !== 'All') filters.state = selectedState;
      if (selectedOccupation !== 'All') filters.occupation = selectedOccupation;
      if (selectedEducation !== 'All') filters.education = selectedEducation;

      if (Object.keys(filters).length > 0) {
        setSearching(true);
        try {
          const res = await searchSchemes(filters);
          if (isMounted && res && res.success && Array.isArray(res.data)) {
            setSearchResults(res.data);
          }
        } catch (err) {
          console.warn('[EligibleSchemes] Search endpoint error:', err);
        } finally {
          if (isMounted) setSearching(false);
        }
      } else {
        if (isMounted) setSearchResults(null);
      }
    };

    fetchSearchResults();
    return () => { isMounted = false; };
  }, [selectedCategory, selectedState, selectedOccupation, selectedEducation, isBackendConnected]);

  // Handle modal click & fetch detailed scheme by ID from backend if connected
  const handleSchemeClick = async (scheme) => {
    setActiveModalScheme(scheme);
    if (isBackendConnected && scheme?.scheme_id) {
      try {
        const res = await getSchemeById(scheme.scheme_id);
        if (res && res.success && res.data) {
          setActiveModalScheme((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.warn(`[EligibleSchemes] getSchemeById('${scheme.scheme_id}') warning:`, err);
      }
    }
  };

  // Determine active scheme source: searchResults (if active), recommendationResult eligible_schemes, schemes, or fallback
  const sourceSchemes = searchResults
    ? searchResults
    : ((recommendationResult?.eligible_schemes && recommendationResult.eligible_schemes.length > 0)
      ? recommendationResult.eligible_schemes
      : (schemes && schemes.length > 0 ? schemes : fallbackSchemes));

  // Client-side filtering fallback
  const filteredSchemes = sourceSchemes.filter((s) => {
    const q = searchQuery.toLowerCase();
    const schemeName = (s.scheme_name || s.name || '').toLowerCase();
    const category = (s.category || '').toLowerCase();
    const description = (s.description || '').toLowerCase();
    const state = (s.state || 'All India').toLowerCase();
    const occupation = (s.occupation || s.target_occupation || 'General/Unspecified').toLowerCase();
    const education = (s.education || s.target_education || 'All').toLowerCase();

    const matchesQuery = !q || schemeName.includes(q) || category.includes(q) || description.includes(q);
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory.toLowerCase();
    const matchesState = selectedState === 'All' || state.includes(selectedState.toLowerCase()) || state === 'all india';
    const matchesOccupation = selectedOccupation === 'All' || occupation.includes(selectedOccupation.toLowerCase()) || occupation === 'general/unspecified';
    const matchesEducation = selectedEducation === 'All' || education.includes(selectedEducation.toLowerCase()) || education === 'all';

    return matchesQuery && matchesCategory && matchesState && matchesOccupation && matchesEducation;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="Eligible Schemes" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Eligible Schemes ({filteredSchemes.length})
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
                {isBackendConnected
                  ? 'Showing live central & state government schemes fetched from backend recommendation engine.'
                  : 'Showing central & state government schemes matching your current profile (Offline Mode).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl shrink-0">
                ✓ {filteredSchemes.length} Active Matches
              </span>
            </div>
          </div>

          {loading || searching ? (
            <LoadingScreen message={searching ? "Searching schemes via backend API..." : "Fetching eligible schemes from backend API..."} />
          ) : (
            <>
              {/* Filter Toolbar */}
              <div className="bg-[#0d1322]/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 space-y-3 backdrop-blur-md">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Filter Schemes By Criteria
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Health">Health</option>
                      <option value="Business">Business</option>
                      <option value="Pension">Pension</option>
                      <option value="Scholarship">Scholarship</option>
                    </select>
                  </div>

                  {/* State Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All States</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="All India">All India (Central)</option>
                    </select>
                  </div>

                  {/* Occupation Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Occupation</label>
                    <select
                      value={selectedOccupation}
                      onChange={(e) => setSelectedOccupation(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Occupations</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Student">Student</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  {/* Education Filter */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Education</label>
                    <select
                      value={selectedEducation}
                      onChange={(e) => setSelectedEducation(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Education Levels</option>
                      <option value="School (9th-12th)">School (9th-12th)</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Scheme Cards Grid */}
              {filteredSchemes.length === 0 ? (
                <div className="bg-[#0d1322]/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="text-4xl">🔍</div>
                  <h3 className="text-lg font-bold text-white">No Schemes Found</h3>
                  <p className="text-xs text-slate-400">Try adjusting your category/state filter options.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSchemes.map((scheme, idx) => (
                    <SchemeCard
                      key={scheme.scheme_id || idx}
                      scheme={scheme}
                      onClick={(s) => handleSchemeClick(s)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Scheme Detail Modal Popup */}
      {activeModalScheme && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                  {activeModalScheme.category || 'General'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {activeModalScheme.state || 'All India'}
                </span>
              </div>
              <button
                onClick={() => setActiveModalScheme(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{activeModalScheme.scheme_name || activeModalScheme.name}</h3>
              {activeModalScheme.benefit && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl mb-4">
                  <p className="text-xs font-bold text-emerald-400">🎁 Benefit: {activeModalScheme.benefit}</p>
                </div>
              )}
              <p className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
                {activeModalScheme.description || 'No detailed description available.'}
              </p>
            </div>

            {activeModalScheme.matching_reasons && activeModalScheme.matching_reasons.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">AI Eligibility Justification:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalScheme.matching_reasons.map((r, i) => (
                    <span key={i} className="text-xs text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setActiveModalScheme(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Redirecting to official portal for ${activeModalScheme.scheme_name || activeModalScheme.name}`)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
              >
                Apply Official Portal →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


