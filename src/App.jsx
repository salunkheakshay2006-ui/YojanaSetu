import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Views
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EligibleSchemes from './pages/EligibleSchemes';
import FutureOpportunities from './pages/FutureOpportunities';
import Recommendation from './pages/Recommendation';
import AIInsights from './pages/AIInsights';

/**
 * BharatBenefits AI - Main Application Component
 * Sets up client-side routes.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard / Home Route */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile Route */}
        <Route path="/profile" element={<Profile />} />

        {/* Eligible Schemes Route */}
        <Route path="/eligible-schemes" element={<EligibleSchemes />} />

        {/* Future Opportunities Route */}
        <Route path="/future-opportunities" element={<FutureOpportunities />} />

        {/* AI Recommendation Route */}
        <Route path="/recommendations" element={<Recommendation />} />

        {/* AI Insights & Assistant Route */}
        <Route path="/ai-insights" element={<AIInsights />} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

