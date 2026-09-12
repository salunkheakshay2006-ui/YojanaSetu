import React, { useState } from "react";
import {
  Settings,
  Shield,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Copy,
  Check,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function AccountSettingsPage({
  user = null,
  userProfile = null,
  onSignOut,
}) {
  const { updatePassword } = useAuth();
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const userEmail = user?.email || "Unknown";
  const userId = user?.id || "N/A";

  const handleCopyId = () => {
    if (!userId || userId === "N/A") return;
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(newPassword);
      if (updateError) {
        setError(updateError.message || "Failed to update password. Please try again.");
      } else {
        setSuccessMessage("Your password has been updated successfully! Please use this new password next time you sign in.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("settings.title", "Account & Security Settings")}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("settings.subtitle", "Manage your account authentication credentials, session security, and data privacy.")}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Account Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Mail className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t("settings.account_info", "Account Information")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Registered Email
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 truncate" title={userEmail}>
                {userEmail}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                <Check className="w-3 h-3 text-emerald-700" /> Verified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Citizen Account ID
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-medium text-slate-600 truncate" title={userId}>
                {userId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition shrink-0 cursor-pointer"
                title="Copy user ID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Linked Profile Status */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-950 block">
                Persistent Citizen Profile:{" "}
                {userProfile?.name ? `${userProfile.name} (Active)` : "Not set"}
              </span>
              <span className="text-emerald-800/80">
                {userProfile?.name
                  ? "Your profile is automatically restored from the secure database on every sign-in."
                  : "Complete your profile on the Profile tab to enable automatic cloud restoration."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Change Password Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t("settings.change_password", "Change Password")}
          </h2>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs font-medium">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Section 3: Privacy & Security Commitments */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Security & Privacy Commitments
          </h2>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
          <li className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Passwords Stored Locally:</strong> Passwords and hashes are handled exclusively by Supabase Auth using industry-standard bcrypt encryption.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Strict User Data Isolation:</strong> Your citizen profile, saved bookmarks, uploaded document checklist, and tracker stages are bound strictly to your authenticated identity.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Automated Submissions:</strong> YojanaSetu never submits applications without your explicit consent; you are directed to verified official government portals (e.g. myscheme.gov.in).
            </span>
          </li>
        </ul>
      </div>

      {/* Section 4: Sign Out Option */}
      <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-950">End Current Session</h3>
          <p className="text-xs text-red-800/80 mt-0.5">
            Sign out to terminate your active authenticated session and clear all sensitive profile data from this device.
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}
