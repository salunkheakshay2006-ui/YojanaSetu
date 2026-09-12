import React from "react";
import {
  User,
  FileText,
  Bookmark,
  Clock,
  Bell,
  Settings,
  LogOut,
  Search,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Sidebar({
  activeTab = "profile",
  onTabChange,
  savedCount = 0,
  docsCount = 0,
  trackerCount = 0,
  unreadNotificationsCount = 0,
  user = null,
  onSignOut,
  isOpenMobile = false,
  onCloseMobile = () => {},
}) {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const userEmail = user?.email || "Citizen User";
  const userInitials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "CU";

  const navItems = [
    {
      id: "profile",
      label: t("sidebar.profile", "Profile"),
      description: t("sidebar.profile_desc", "Details & Eligibility"),
      icon: User,
      badge: null,
    },
    {
      id: "search",
      label: t("sidebar.search", "Search Schemes"),
      description: t("sidebar.search_desc", "Explore 40 Schemes"),
      icon: Search,
      badge: null,
    },
    {
      id: "documents",
      label: t("sidebar.documents", "My Documents"),
      description: t("sidebar.documents_desc", "Paperwork & Readiness"),
      icon: FileText,
      badge: docsCount > 0 ? docsCount : null,
    },
    {
      id: "saved",
      label: t("sidebar.saved", "Saved Schemes"),
      description: t("sidebar.saved_desc", "Bookmarked Benefits"),
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: "applications",
      label: t("sidebar.applications", "My Applications"),
      description: t("sidebar.applications_desc", "Application Tracker"),
      icon: Clock,
      badge: trackerCount > 0 ? trackerCount : null,
    },
    {
      id: "notifications",
      label: t("sidebar.notifications", "Notifications"),
      description: t("sidebar.notifications_desc", "Alerts & Readiness"),
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      id: "settings",
      label: t("sidebar.settings", "Account Settings"),
      description: t("sidebar.settings_desc", "Password & Security"),
      icon: Settings,
      badge: null,
    },
  ];

  const handleItemClick = (id) => {
    onTabChange(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Header & Brand */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div
          onClick={() => handleItemClick("profile")}
          className="cursor-pointer select-none group"
        >
          <img
            src="/yojanasetu-logo.svg"
            alt="YojanaSetu"
            className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
          />
          <p className="text-[11px] text-slate-500 font-medium mt-1.5 pl-0.5">
            {t("sidebar.subtitle", "Government Scheme Assistant")}
          </p>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-3.5 mx-3 mt-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate" title={userEmail}>
              {userEmail}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{t("sidebar.verified_citizen", "Verified Citizen Account")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("sidebar.menu", "Menu")}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === "profile" && activeTab === "eligibility") ||
            (item.id === "applications" && activeTab === "tracker");

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-emerald-50 text-emerald-900 shadow-xs border border-emerald-200/80 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <div className="truncate">
                  <span className="block leading-tight">{item.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      item.badgeColor || (isActive ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700")
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Language Selector & Sign Out */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {/* Language switch */}
        <div className="flex items-center justify-between px-2 py-1 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            {t("sidebar.language", "Language")}:
          </span>
          <div className="flex items-center gap-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${
                  language === lang.code
                    ? "bg-emerald-700 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onSignOut();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>{t("nav.sign_out", "Sign Out")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 lg:fixed lg:inset-y-0 lg:z-40">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
