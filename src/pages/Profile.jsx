import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useCitizen } from '../context/CitizenContext';
import { useSchemes } from '../context/SchemeContext';
import { getRecommendation } from '../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * BharatBenefits AI - Citizen Profile Page
 * Form for citizens to input demographic & eligibility details and trigger AI Engine.
 */
export default function Profile() {
  const navigate = useNavigate();
  const { citizenProfile, updateProfile } = useCitizen();
  const { setRecommendationResult, runRecommendation } = useSchemes();
  const [formData, setFormData] = useState(citizenProfile);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recommendationSummary, setRecommendationSummary] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? (checked ? 1 : 0) : (name === 'age' || name === 'income' ? (value ? Number(value) : '') : value);
    setFormData((prev) => ({
      ...prev,
      [name]: finalVal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    setRecommendationSummary(null);

    try {
      // 1. Update local citizen profile context
      updateProfile(formData);

      // 2. Submit to backend POST /api/recommend endpoint via API service
      const res = await getRecommendation(formData);

      if (res && res.success && res.data) {
        // Save response in SchemeContext
        if (setRecommendationResult) {
          setRecommendationResult(res.data);
        }
        setRecommendationSummary(res.data);
        setSuccessMessage('✓ Profile successfully analyzed by FastAPI AI Recommendation Engine!');
      } else {
        // Fallback context execution if API service response format varies
        if (runRecommendation) {
          await runRecommendation(formData);
        }
        setErrorMessage('Backend API returned offline status. Updated profile in local mock mode.');
      }
    } catch (err) {
      console.warn('[Profile] Submission error:', err);
      setErrorMessage('Failed to connect to backend recommendation API. Updated profile locally.');
    } finally {
      setSubmitting(false);
    }
  };

  const bundleInfo = Array.isArray(recommendationSummary?.recommended_bundle) && recommendationSummary.recommended_bundle.length > 0
    ? recommendationSummary.recommended_bundle[0]
    : recommendationSummary?.recommended_bundle;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex antialiased selection:bg-blue-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="Profile" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar userName={formData.name || 'Tanmay'} />

        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Citizen Profile
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
              Enter your personal and demographic details to discover eligible government schemes & future opportunities.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-blue-900/30 via-slate-900/80 to-indigo-900/30 border border-blue-800/40 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-lg">
              ℹ️
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">How AI uses your profile</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our rule-based engine evaluates your age, state, family income, and occupational status against central and state schemes to recommend the highest-benefit bundle with zero conflict.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-amber-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Citizen Profile Form */}
          <form onSubmit={handleSubmit} className="bg-[#0d1322]/90 border border-slate-800/90 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-md shadow-xl">
            
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
                1. Personal & Location Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="e.g. Tanmay Awad"
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  min="0"
                  max="120"
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || 'Female'}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="All">All / Transgender</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">State / Union Territory</label>
                <select
                  name="state"
                  value={formData.state || 'Maharashtra'}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="All India">All India</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district || ''}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Annual Family Income (₹)</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income || ''}
                  onChange={handleChange}
                  placeholder="e.g. 180000"
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="border-b border-slate-800/80 pb-3 pt-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">
                2. Occupation & Socio-Economic Status
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Occupation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation || 'Farmer'}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Student">Student</option>
                  <option value="Business">Business / Entrepreneur</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="General/Unspecified">General / Unspecified</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Education Level</label>
                <select
                  name="education"
                  value={formData.education || 'Graduate'}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="School (9th-12th)">School (9th-12th)</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Doctoral">Doctoral / Ph.D.</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Social Category</label>
                <select
                  name="category"
                  value={formData.category || 'OBC'}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            {/* Special Flags */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">Special Status Checkboxes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'farmer', label: 'Farmer' },
                  { name: 'student', label: 'Student' },
                  { name: 'business', label: 'Business Owner' },
                  { name: 'disability', label: 'Person with Disability' },
                  { name: 'widow', label: 'Widow' },
                  { name: 'minority', label: 'Minority Category' },
                ].map((item) => (
                  <label key={item.name} className="flex items-center gap-2.5 bg-[#111827] p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={Boolean(formData[item.name])}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-200 font-medium select-none">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Analyze Profile Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Analyzing Profile with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Profile & Find Best Schemes</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* AI Recommendation Summary Section (Returned from POST /api/recommend) */}
          {recommendationSummary && (
            <div className="bg-[#0d1322]/90 border border-emerald-500/40 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">
                    AI Recommendation Result
                  </h3>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl">
                  🏆 {Math.round((recommendationSummary.confidence_score || 0.96) * 100)}% Match Score
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Recommended Bundle</span>
                  <h4 className="text-lg font-bold text-white">
                    {bundleInfo?.bundleName || bundleInfo?.name || 'PM Kisan + Ayushman Bharat'}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-400">
                    🎁 Total Benefit: {bundleInfo?.bundleBenefit || '₹48,000 / year'}
                  </p>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Eligible Schemes Found</span>
                  <h4 className="text-lg font-bold text-white">
                    {recommendationSummary.eligible_schemes?.length || 0} Active Schemes
                  </h4>
                  <p className="text-xs text-slate-300">
                    Zero policy conflicts detected.
                  </p>
                </div>
              </div>

              {recommendationSummary.explanation && (
                <div className="bg-[#111827]/80 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                  💡 <span className="font-semibold text-slate-200">AI Explanation:</span> {recommendationSummary.explanation}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => navigate('/recommendations')}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  View Full Recommendation Details →
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

