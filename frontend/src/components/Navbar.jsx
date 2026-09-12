import React from "react";
import { RefreshCw, Search, CheckCircle2, Bookmark, Clock, LogOut, User, FileText } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navbar({ onReset, hasResults, activeTab = "eligibility", onTabChange, savedCount = 0, docsCount = 0, user = null, isGuest = false, onSignOut = null, onSignIn = null }) {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 shrink-0 items-center gap-3 cursor-pointer select-none" onClick={onReset}>
          <img
            src="/yojanasetu-logo.svg"
            alt="YojanaSetu"
            className="h-9 sm:h-10 w-auto object-contain"
          />
          <p className="text-xs text-slate-500 hidden xl:block border-l border-slate-200 pl-3">
            {t("brand.tagline", "Autonomous Government Scheme-Bundle Optimizer for Citizens")}
          </p>
        </div>

        {/* Main Navigation Links */}
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3 lg:w-auto">
          <nav className="order-3 flex min-w-0 max-w-full flex-1 items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 lg:order-none lg:flex-none">
            <button
              onClick={() => onTabChange("eligibility")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "eligibility"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("nav.check_eligibility", "Check Eligibility")}</span>
            </button>
            <button
              onClick={() => onTabChange("search")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "search"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t("nav.search_schemes", "Search All Schemes")}</span>
              <span className="sm:hidden">{t("nav.search_schemes", "Search")}</span>
            </button>
            <button
              onClick={() => onTabChange("saved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "saved"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t("nav.saved_schemes", "Saved Schemes")}</span>
              <span className="sm:hidden">{t("nav.saved_schemes", "Saved")}</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  {savedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange("tracker")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "tracker"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t("nav.tracker", "Application Tracker")}</span>
              <span className="sm:hidden">{t("nav.tracker", "Tracker")}</span>
            </button>
            <button
              onClick={() => onTabChange("documents")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "documents"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t("nav.my_documents", "My Documents")}</span>
              <span className="sm:hidden">{t("nav.my_documents", "Documents")}</span>
              {docsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  {docsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Language Selector */}
          <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === lang.code
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title={lang.label}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {hasResults && activeTab === "eligibility" && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t("nav.new_profile", "New Profile Check")}</span>
            </button>
          )}

          {/* Authenticated User Section */}
          {user ? (
            <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-2 ml-1">
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[120px] truncate font-medium">{user.email}</span>
              </div>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer"
                  title={t("nav.sign_out", "Sign out")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("nav.sign_out", "Sign Out")}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-2 ml-1">
              {isGuest && (
                <span className="hidden sm:inline-flex items-center rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                  Guest Mode
                </span>
              )}
              {onSignIn && (
                <button
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t("auth.signin_btn", "Sign In")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
