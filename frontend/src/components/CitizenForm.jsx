import React, { useState, useEffect } from "react";
import { Sparkles, User, MapPin, Briefcase, Loader2, ArrowRight, ShieldCheck, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { DEMO_PROFILES, EMPTY_FORM } from "../data/demoProfiles";
import GoalSelector from "./GoalSelector";
import { useLanguage } from "../contexts/LanguageContext";

export default function CitizenForm({
  onSubmit,
  loading,
  userProfile = null,
  selectedGoals = [],
  onToggleGoal,
  onClearGoals,
  onSetGoals,
  onSaveProfile = null,
  isProfileSaving = false,
  isAuthenticated = false,
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(() => {
    if (userProfile && userProfile.name) {
      return {
        name: userProfile.name || "",
        age: userProfile.age ?? "",
        gender: userProfile.gender || "male",
        state: userProfile.state || "Maharashtra",
        district: userProfile.district || "",
        income: userProfile.income ?? "",
        occupation: userProfile.occupation || "Farmer",
        education: userProfile.education || "10th Pass",
        category: userProfile.category || "General",
        is_student: Boolean(userProfile.is_student),
        is_farmer: Boolean(userProfile.is_farmer),
        is_disabled: Boolean(userProfile.is_disabled),
        has_bank_account: Boolean(userProfile.has_bank_account),
        is_bpl: Boolean(userProfile.is_bpl),
        ration_card_type: userProfile.ration_card_type || "none",
        owns_land: Boolean(userProfile.owns_land),
        is_pregnant_or_lactating: Boolean(userProfile.is_pregnant_or_lactating),
        owns_business: Boolean(userProfile.owns_business),
        has_active_mudra_loan: Boolean(userProfile.has_active_mudra_loan),
      };
    }
    return DEMO_PROFILES[0].data;
  });
  const [activePreset, setActivePreset] = useState(() => {
    return userProfile && userProfile.name ? "cloud" : "ravi";
  });
  const [saveStatusMessage, setSaveStatusMessage] = useState(null);

  // Restore authenticated user's cloud profile when available
  useEffect(() => {
    if (userProfile && userProfile.name) {
      setFormData({
        name: userProfile.name || "",
        age: userProfile.age ?? "",
        gender: userProfile.gender || "male",
        state: userProfile.state || "Maharashtra",
        district: userProfile.district || "",
        income: userProfile.income ?? "",
        occupation: userProfile.occupation || "Farmer",
        education: userProfile.education || "10th Pass",
        category: userProfile.category || "General",
        is_student: Boolean(userProfile.is_student),
        is_farmer: Boolean(userProfile.is_farmer),
        is_disabled: Boolean(userProfile.is_disabled),
        has_bank_account: Boolean(userProfile.has_bank_account),
        is_bpl: Boolean(userProfile.is_bpl),
        ration_card_type: userProfile.ration_card_type || "none",
        owns_land: Boolean(userProfile.owns_land),
        is_pregnant_or_lactating: Boolean(userProfile.is_pregnant_or_lactating),
        owns_business: Boolean(userProfile.owns_business),
        has_active_mudra_loan: Boolean(userProfile.has_active_mudra_loan),
      });
      setActivePreset("cloud");
    }
  }, [userProfile]);

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.id);
    setFormData(preset.data);
    if (preset.defaultGoals && onSetGoals) {
      onSetGoals(preset.defaultGoals);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setActivePreset(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      age: parseInt(formData.age, 10) || 0,
      income: parseFloat(formData.income) || 0,
    });
  };

  const handleManualSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!onSaveProfile) return;
    setSaveStatusMessage(null);
    const sanitized = {
      ...formData,
      age: parseInt(formData.age, 10) || 0,
      income: parseFloat(formData.income) || 0,
    };
    const res = await onSaveProfile(sanitized);
    if (res?.message) {
      setSaveStatusMessage({
        type: res.success ? "success" : "error",
        text: res.message,
      });
      if (res.success) {
        setActivePreset("cloud");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Home Hero Section */}
      <div className="text-center space-y-3.5 py-4 sm:py-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {t("hero.badge", "YojanaSetu • Scheme & Document Assistance Platform")}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t("hero.title_part1", "Find the government schemes")} <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
            {t("hero.title_part2", "that fit your needs.")}
          </span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t("hero.subtitle", "YojanaSetu checks your details against available government schemes and helps you understand which schemes may be relevant, what documents you may need, and what to do next.")}
        </p>

        {/* Small Required Disclaimer */}
        <p className="text-xs text-slate-400 max-w-xl mx-auto italic">
          {t("hero.disclaimer", "Disclaimer: YojanaSetu is an assistance platform. Final eligibility and approval are determined by the concerned government department.")}
        </p>
      </div>

      {/* 1-Click Demo Profiles Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("demo.title", "Quick Demo Profiles (Click to pre-fill)")}
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData(EMPTY_FORM);
              setActivePreset("empty");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            {t("demo.reset_empty", "Clear Form")}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DEMO_PROFILES.map((preset) => {
            const isSelected = activePreset === preset.id;
            const badgeText = t(`demo.${preset.id}_badge`, preset.badge);
            const descText = t(`demo.${preset.id}_desc`, preset.description);

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-1">{preset.label}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2 leading-tight mb-2">
                  {descText}
                </div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-700"
                }`}>
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal-Based Discovery Section */}
      <GoalSelector
        selectedGoals={selectedGoals}
        onToggleGoal={onToggleGoal}
        onClearGoals={onClearGoals}
      />

      {/* Citizen Details Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900">{t("form.personal_title", "Citizen Details Form")}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t("form.cloud_synced", "Please provide your basic information so we can find matching schemes.")}</p>
          </div>
          {userProfile && userProfile.name && activePreset === "cloud" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("demo.custom_loaded", "Restored from Cloud Profile")}</span>
            </div>
          )}
        </div>

        {/* Save feedback banner */}
        {saveStatusMessage && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            saveStatusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs"
              : "bg-red-50 border border-red-200 text-red-900 shadow-xs"
          }`}>
            {saveStatusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{saveStatusMessage.text}</span>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t("form.personal_title", "Personal & Demographic Details")}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.name", "Full Name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Ramesh Patil"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.age", "Age (years)")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="120"
                placeholder="35"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.gender", "Gender")} <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="male">{t("form.male", "Male")}</option>
                <option value="female">{t("form.female", "Female")}</option>
                <option value="other">{t("form.transgender", "Other / Transgender")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.category", "Social Category")}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="General">{t("form.general", "General")}</option>
                <option value="OBC">{t("form.obc", "OBC")}</option>
                <option value="SC">{t("form.sc", "SC")}</option>
                <option value="ST">{t("form.st", "ST")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.education", "Education Level")}
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="No Formal Education">{t("form.edu_below_10th", "Below 10th / No Formal")}</option>
                <option value="Below 10th">{t("form.edu_below_10th", "Below 10th")}</option>
                <option value="10th Pass">{t("form.edu_10th", "10th Pass")}</option>
                <option value="12th Pass">{t("form.edu_12th", "12th Pass")}</option>
                <option value="ITI / Diploma">ITI / Diploma</option>
                <option value="Graduate">{t("form.edu_graduate", "Graduate & Above")}</option>
                <option value="Post-Graduate">{t("form.edu_post_graduate", "Post Graduate")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location & Work */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t("form.location_title", "Location & Income")}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.state", "State")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="Maharashtra"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.district", "District")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="e.g. Pune, Nashik"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.annual_income", "Annual Family Income (₹)")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 100000"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("form.occupation", "Primary Occupation")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                placeholder="e.g. Farmer, Carpenter, Tailor"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Demographic Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_farmer"
                checked={formData.is_farmer}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-800">{t("form.is_farmer", "I am a Farmer / Cultivator")}</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_student"
                checked={formData.is_student}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-800">{t("form.is_student", "I am an Active Student")}</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_disabled"
                checked={formData.is_disabled}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-800">{t("form.is_disabled", "Person with Disability (Divyangjan)")}</span>
            </label>
          </div>
        </div>

        {/* Section 3: Financial & Welfare Status */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t("form.welfare_title", "Welfare & Economic Status")}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Bank Account */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="has_bank_account"
                checked={formData.has_bank_account}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t("form.bank_account", "Have an active Bank / Post Office Account")}</span>
                <span className="text-[11px] text-slate-500 block">Required for direct cash transfers & insurance</span>
              </div>
            </label>

            {/* BPL Card */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_bpl"
                checked={formData.is_bpl}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t("form.bpl_status", "Below Poverty Line (BPL)")}</span>
                <span className="text-[11px] text-slate-500 block">Below Poverty Line certificate holder</span>
              </div>
            </label>

            {/* Land Ownership */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="owns_land"
                checked={formData.owns_land}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t("form.owns_land", "Owns Agricultural Land")}</span>
                <span className="text-[11px] text-slate-500 block">Cultivable land in own/family name</span>
              </div>
            </label>

            {/* Maternity */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="is_pregnant_or_lactating"
                checked={formData.is_pregnant_or_lactating}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t("form.pregnant_lactating", "Currently Pregnant or Lactating Mother")}</span>
                <span className="text-[11px] text-slate-500 block">For maternity wage support (PMMVY)</span>
              </div>
            </label>

            {/* Owns Business */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="owns_business"
                checked={formData.owns_business}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t("form.owns_business", "Owns / Operates a Small Business")}</span>
                <span className="text-[11px] text-slate-500 block">Small business, artisan trade, or workshop</span>
              </div>
            </label>

            {/* Active MUDRA Loan (Conflict Trigger) */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 cursor-pointer">
              <input
                type="checkbox"
                name="has_active_mudra_loan"
                checked={formData.has_active_mudra_loan}
                onChange={handleChange}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-amber-950 block">{t("form.active_mudra", "Currently have an Active MUDRA Loan")}</span>
                <span className="text-[11px] text-amber-800/80 block">Triggers official PM Vishwakarma conflict</span>
              </div>
            </label>

            {/* Ration Card Dropdown */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-bold text-slate-900 mb-1">
                {t("form.ration_card", "Ration Card Type")}
              </label>
              <select
                name="ration_card_type"
                value={formData.ration_card_type}
                onChange={handleChange}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="none">{t("form.ration_none", "None / No Ration Card")}</option>
                <option value="PHH">{t("form.ration_phh", "Priority Household (PHH)")} — Eligible for PM-GKAY</option>
                <option value="AAY">{t("form.ration_aay", "Antyodaya Anna Yojana (AAY)")} — Eligible for PM-GKAY</option>
                <option value="NPHH">Non-Priority Household (NPHH)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit / Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            🔒 {t("hero.disclaimer", "Your details are checked against 40 official government schemes.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {onSaveProfile && (
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isProfileSaving || loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                title="Save your profile details to cloud so they load automatically next time you sign in"
              >
                {isProfileSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    <span>{t("form.saving_profile", "Saving Profile...")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t("form.save_profile", "Save Profile")}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("form.submitting", "Checking Available Schemes...")}
                </>
              ) : (
                <>
                  {t("form.submit_button", "Check Scheme Eligibility")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

