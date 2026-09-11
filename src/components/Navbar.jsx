import React, { useState } from 'react';

/**
 * BharatBenefits AI - Reusable Top Navbar Component
 * Matches the dark translucent premium AI dashboard design.
 *
 * @param {Object} props
 * @param {string} [props.userName='Tanmay'] - Name of the logged-in user
 * @param {string} [props.userAvatar='T'] - Initial or avatar character for the user
 * @param {string} [props.searchQuery=''] - Current search input text
 * @param {Function} [props.onSearchChange] - Handler function when search text changes
 * @param {number} [props.notificationCount=1] - Number of unread notifications
 */
export default function Navbar({
  userName = 'Tanmay',
  userAvatar = 'T',
  searchQuery = '',
  onSearchChange,
  notificationCount = 1
}) {
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const handleSearch = (e) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <header className="h-20 border-b border-slate-800/80 px-6 flex items-center justify-between gap-4 sticky top-0 bg-[#090d16]/90 backdrop-blur-md z-30 select-none">
      
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={onSearchChange ? searchQuery : internalSearch}
          onChange={handleSearch}
          placeholder="Ask anything... (e.g. I am a student from Maharashtra)"
          className="w-full bg-[#111827]/80 text-sm text-slate-200 placeholder-slate-400 rounded-xl pl-11 pr-16 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 rounded-md px-1.5 py-0.5">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Sun / Theme Toggle Button */}
        <button
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>

        {/* Notification Bell Icon */}
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* User Profile Avatar & Name */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-white shadow-md group-hover:border-slate-500 transition-all">
            {userAvatar}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                {userName}
              </span>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
