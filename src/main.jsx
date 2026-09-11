import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CitizenProvider } from './context/CitizenContext.jsx';
import { SchemeProvider } from './context/SchemeContext.jsx';
import './index.css';

/**
 * BharatBenefits AI - React Vite Entry Point
 * Wraps application tree with CitizenProvider & SchemeProvider
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CitizenProvider>
      <SchemeProvider>
        <App />
      </SchemeProvider>
    </CitizenProvider>
  </React.StrictMode>
);

