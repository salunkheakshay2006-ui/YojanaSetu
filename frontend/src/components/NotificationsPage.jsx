import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Bookmark,
  ShieldAlert,
  Info,
  ExternalLink,
  Check,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function NotificationsPage({
  user = null,
  userProfile = null,
  savedSchemes = [],
  trackerStatuses = {},
  availableDocs = [],
  results = null,
  onNavigate = () => {},
}) {
  const { t } = useLanguage();
  const userId = user?.id || "guest";
  const storageKey = `yojanasetu_notifications_${userId}`;

  // Default dynamic notification templates derived from actual system state
  const generateInitialNotifications = () => {
    const list = [];
    const missingDocsCount = results?.checklist?.known_missing?.length || 0;

    // 1. Cloud Profile Sync
    if (userProfile && userProfile.name) {
      list.push({
        id: "notif-profile-synced",
        type: "success",
        title: "Citizen Profile Active & Synced",
        message: `Your profile for ${userProfile.name} is saved and automatically synchronized across your devices.`,
        date: "Current Session",
        category: "Account",
        icon: CheckCircle2,
        actionLabel: "View Profile",
        targetTab: "profile",
      });
    } else {
      list.push({
        id: "notif-profile-incomplete",
        type: "warning",
        title: "Complete Your Citizen Profile",
        message: "Fill out your details to enable accurate scheme matching, conflict detection, and bundle optimization.",
        date: "Action Recommended",
        category: "Profile",
        icon: AlertTriangle,
        actionLabel: "Complete Profile",
        targetTab: "profile",
      });
    }

    // 2. Document Checklist Readiness
    if (missingDocsCount > 0) {
      list.push({
        id: "notif-docs-missing",
        type: "info",
        title: `Document Preparation Alert (${missingDocsCount} Pending)`,
        message: `Your matched scheme bundle requires ${missingDocsCount} additional document(s). Check issuance steps in My Documents.`,
        date: "Active Bundle",
        category: "Documents",
        icon: FileText,
        actionLabel: "Check Documents",
        targetTab: "documents",
      });
    } else if (availableDocs.length > 0) {
      list.push({
        id: "notif-docs-ready",
        type: "success",
        title: "Documents Catalogued",
        message: `You have ${availableDocs.length} personal document(s) recorded in your readiness checklist.`,
        date: "Readiness Check",
        category: "Documents",
        icon: CheckCircle2,
        actionLabel: "Manage Documents",
        targetTab: "documents",
      });
    }

    // 3. Saved Schemes & Applications
    if (savedSchemes.length > 0) {
      list.push({
        id: "notif-saved-schemes",
        type: "info",
        title: `${savedSchemes.length} Scheme(s) Bookmarked`,
        message: "You have bookmarked schemes. Track their application lifecycle stages in My Applications.",
        date: "Tracker Alert",
        category: "Applications",
        icon: Bookmark,
        actionLabel: "View Tracker",
        targetTab: "applications",
      });
    }

    // 4. Statutory Conflict Advisory
    if (userProfile?.has_active_mudra_loan) {
      list.push({
        id: "notif-mudra-conflict",
        type: "warning",
        title: "Statutory Policy Advisory: Active MUDRA Loan",
        message: "Under Ministry guidelines, PM Vishwakarma registration is paused while a MUDRA loan is active. Clear the loan to restore eligibility.",
        date: "Policy Advisory",
        category: "Conflict",
        icon: ShieldAlert,
        actionLabel: "Review Profile",
        targetTab: "profile",
      });
    }

    // 5. Official Government Portal Reminder
    list.push({
      id: "notif-official-reminder",
      type: "neutral",
      title: "Official Government Portal Guidance",
      message: "YojanaSetu assists with discovery and document preparation. Final submission and approvals must be conducted via official department portals.",
      date: "System Notice",
      category: "Guidance",
      icon: Info,
      actionLabel: "Search Schemes",
      targetTab: "search",
    });

    return list;
  };

  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'

  const allNotifications = generateInitialNotifications();

  // Save readIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readIds));
    } catch (e) {
      console.error("Failed to save read notifications state:", e);
    }
  }, [readIds, storageKey]);

  const toggleRead = (id) => {
    setReadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const markAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    setReadIds(allIds);
  };

  const clearAllRead = () => {
    setReadIds([]);
  };

  const filteredNotifications = allNotifications.filter((n) => {
    const isRead = readIds.includes(n.id);
    if (filter === "unread") return !isRead;
    if (filter === "read") return isRead;
    return true;
  });

  const unreadCount = allNotifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t("notifications.title", "Notifications & System Alerts")}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  "notifications.subtitle",
                  "Stay informed on your profile status, document readiness, and tracked applications."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("notifications.mark_all_read", "Mark all as read")}</span>
            </button>
          )}
          {readIds.length > 0 && (
            <button
              type="button"
              onClick={clearAllRead}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-500 hover:text-slate-800 transition shadow-xs cursor-pointer"
              title="Reset read indicators"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Honest Government Disclosure Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">
            {t("notifications.notice_title", "System Assistance Notices Only")}
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            {t(
              "notifications.notice_body",
              "These notifications are generated by YojanaSetu to assist you with profile readiness, required documentation, and application organization. They are not official government department communications."
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            filter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          All ({allNotifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
            filter === "unread"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFilter("read")}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            filter === "read"
              ? "bg-slate-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Read ({readIds.length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {filter === "unread"
              ? "You are all caught up! No unread notices right now."
              : "No notifications in this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const isRead = readIds.includes(n.id);
            const Icon = n.icon;

            const borderColors = {
              success: "border-emerald-200 bg-emerald-50/20",
              warning: "border-amber-200 bg-amber-50/20",
              info: "border-blue-200 bg-blue-50/20",
              neutral: "border-slate-200 bg-slate-50/30",
            };

            const iconColors = {
              success: "text-emerald-600 bg-emerald-50",
              warning: "text-amber-600 bg-amber-50",
              info: "text-blue-600 bg-blue-50",
              neutral: "text-slate-600 bg-slate-100",
            };

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isRead
                    ? "bg-white border-slate-200 opacity-80"
                    : `${borderColors[n.type] || "border-slate-200"} shadow-xs`
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      iconColors[n.type] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {n.title}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Unread" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {n.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {n.date}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      {n.actionLabel && (
                        <button
                          type="button"
                          onClick={() => onNavigate(n.targetTab)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                        >
                          <span>{n.actionLabel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRead(n.id)}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer ml-auto"
                      >
                        {isRead ? "Mark as unread" : "Mark as read"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
