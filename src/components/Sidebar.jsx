import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * BharatBenefits AI - Reusable Sidebar Component
 * Matches the dark navy AI dashboard design with React Router navigation.
 */
export default function Sidebar({ activeItem, onItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarNavItems = [
    {
      id: 'Dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'Profile',
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'Eligible Schemes',
      path: '/eligible-schemes',
      label: 'Eligible Schemes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'Future Opportunities',
      path: '/future-opportunities',
      label: 'Future Opportunities',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'Recommendations',
      path: '/recommendations',
      label: 'Recommendations',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'AI Assistant',
      path: '/ai-insights',
      label: 'AI Assistant',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      id: 'About',
      path: '/ai-insights',
      label: 'About',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const handleNavClick = (item) => {
    if (onItemClick) {
      onItemClick(item.id);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className="w-64 bg-[#0d1322]/95 border-r border-slate-800/80 flex flex-col justify-between p-5 shrink-0 min-h-screen select-none">
      <div>
        {/* Logo & Title */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-2 py-3 mb-6 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-slate-950 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-1.5 3-4 4.5-7 5 2.5 3.5 5 8 7 13 2-5 4.5-9.5 7-13-3-.5-5.5-2-7-5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide leading-none">BharatBenefits</h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">AI for a Brighter Tomorrow</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {sidebarNavItems.map((item) => {
            const isPathActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
            const isActive = activeItem ? activeItem === item.id : isPathActive;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar Card: Inclusive India */}
      <div className="mt-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1.5a2.5 2.5 0 002.5 2.5h.5a2 2 0 002-2v-1.065" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Inclusive India</h4>
            <p className="text-[10px] text-slate-400">Powered by AI</p>
          </div>
        </div>

        {/* Tricolor Line */}
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-orange-500 via-white to-emerald-500 my-2 opacity-80" />

        <p className="text-[10px] text-slate-400 text-center font-medium mt-1">
          Sabka Saath • Sabka Vikas • Sabka Vishwas
        </p>
      </div>
    </aside>
  );
}
