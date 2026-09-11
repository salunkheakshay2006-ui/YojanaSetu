import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSchemes, getRecommendation, getFutureOpportunities, getHealth } from '../services/api';
import { useCitizen } from './CitizenContext';

// Default mock recommendations for fallback when backend API is offline
const fallbackRecommendations = {
  eligible_schemes: [
    {
      scheme_id: 'SCH0001',
      scheme_name: 'PM Kisan Samman Nidhi',
      category: 'Agriculture',
      benefit: '₹6,000 / year direct income support',
      state: 'All India',
      match_score: 98,
      matching_reasons: ['Farmer status verified', 'Income under eligibility limit'],
      description: 'Provides income support of ₹6,000 per year to all landholding farmer families across India.',
    },
    {
      scheme_id: 'SCH0002',
      scheme_name: 'Ayushman Bharat PM-JAY',
      category: 'Health',
      benefit: '₹5 Lakh free health insurance cover per family',
      state: 'All India',
      match_score: 96,
      matching_reasons: ['High health priority match', 'Eligible category'],
      description: 'World’s largest health assurance scheme providing coverage for secondary and tertiary care hospitalization.',
    }
  ],
  future_opportunities: [
    {
      scheme_name: 'PM Kisan Maandhan Yojana (Farmer Pension)',
      missing_requirement: 'Min Age Gap: 2 years remaining until turning age 30',
      missing_document: 'Income Certificate (Self Declaration)',
      estimated_time: '2 Years',
      reason: 'Eligible upon reaching minimum age threshold of 30 years.',
      priority: 'High'
    }
  ],
  recommended_bundle: [
    {
      bundleName: 'PM Kisan + Ayushman Bharat',
      bundleBenefit: '₹48,000 / year + ₹5 Lakh Health Cover',
      category: 'Agriculture & Health',
    }
  ],
  explanation: 'Based on your profile in Maharashtra as a Farmer, you match multiple high-priority government schemes with zero policy conflicts.',
  confidence_score: 0.96,
};

const SchemeContext = createContext({
  schemes: [],
  setSchemes: () => {},
  futureOpportunities: [],
  setFutureOpportunities: () => {},
  recommendationResult: fallbackRecommendations,
  recommendations: fallbackRecommendations,
  setRecommendationResult: () => {},
  setRecommendations: () => {},
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  isBackendConnected: false,
  refreshData: () => {},
  runRecommendation: () => {},
});

export function SchemeProvider({ children }) {
  const { citizenProfile } = useCitizen();
  const [schemes, setSchemes] = useState([]);
  const [futureOpportunities, setFutureOpportunities] = useState([]);
  const [recommendationResult, setRecommendationResult] = useState(fallbackRecommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const syncBackendData = async (profileToUse) => {
    setLoading(true);
    setError(null);
    try {
      // Check health endpoint
      const healthRes = await getHealth();
      const isOnline = Boolean(healthRes && healthRes.success);
      setIsBackendConnected(isOnline);

      if (isOnline) {
        // Fetch all schemes
        const schemesRes = await getSchemes(0, 100);
        if (schemesRes && schemesRes.success && Array.isArray(schemesRes.data) && schemesRes.data.length > 0) {
          setSchemes(schemesRes.data);
        }

        // Fetch pre-calculated future opportunities
        const futureRes = await getFutureOpportunities();
        if (futureRes && futureRes.success && Array.isArray(futureRes.data) && futureRes.data.length > 0) {
          setFutureOpportunities(futureRes.data);
        }

        // Send POST /api/recommend with current profile
        const activeProfile = profileToUse || citizenProfile;
        if (activeProfile) {
          const recRes = await getRecommendation(activeProfile);
          if (recRes && recRes.success && recRes.data) {
            setRecommendationResult(recRes.data);
          }
        }
      }
    } catch (err) {
      console.warn('[SchemeContext] Backend sync warning:', err);
      setError('Backend API unreachable. Falling back to local mock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncBackendData();
  }, [citizenProfile]);

  return (
    <SchemeContext.Provider
      value={{
        schemes,
        setSchemes,
        futureOpportunities,
        setFutureOpportunities,
        recommendationResult: recommendationResult || fallbackRecommendations,
        recommendations: recommendationResult || fallbackRecommendations,
        setRecommendationResult,
        setRecommendations: setRecommendationResult,
        loading,
        setLoading,
        error,
        setError,
        isBackendConnected,
        refreshData: syncBackendData,
        runRecommendation: syncBackendData,
      }}
    >
      {children}
    </SchemeContext.Provider>
  );
}

export function useScheme() {
  const context = useContext(SchemeContext);
  if (!context) {
    throw new Error('useScheme must be used within a SchemeProvider');
  }
  return context;
}

export const useSchemes = useScheme;
