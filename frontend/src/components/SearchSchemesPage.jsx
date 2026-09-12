import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, RotateCcw, AlertCircle, Loader2, ExternalLink, Info, CheckCircle2, ChevronRight, Layers, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import SchemeDetailModal from "./SchemeDetailModal";
import { useLanguage } from "../contexts/LanguageContext";

export default function SearchSchemesPage({
  onGoToCheckEligibility,
  isSchemeSaved = () => false,
  onToggleSaveScheme = null,
}) {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");

  // Modal detail state
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Fetch schemes from existing backend endpoint: GET /api/schemes
  useEffect(() => {
    let isMounted = true;
    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/schemes");
        if (!res.ok) {
          throw new Error(`Failed to load schemes (status ${res.status})`);
        }
        const json = await res.json();
        if (isMounted) {
          setSchemes(json.data || []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(
            "We couldn't load the government schemes repository right now. Please verify the backend service is running and try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSchemes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available unique categories and scopes from the actual schemes dataset
  const categories = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  }, [schemes]);

  const scopes = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      if (s.scope) set.add(s.scope);
    });
    return Array.from(set).sort();
  }, [schemes]);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return schemes.filter((s) => {
      // 1. Text search match: name, description, benefit, category, documents_summary
      if (q) {
        const nameMatch = (s.name || "").toLowerCase().includes(q);
        const descMatch = (s.description || "").toLowerCase().includes(q);
        const benefitMatch = (s.benefit || "").toLowerCase().includes(q);
        const catMatch = (s.category || "").toLowerCase().includes(q);
        const docsMatch = (s.documents_summary || "").toLowerCase().includes(q);

        if (!nameMatch && !descMatch && !benefitMatch && !catMatch && !docsMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== "all" && s.category !== selectedCategory) {
        return false;
      }

      // 3. Scope/State filter (Central vs Maharashtra)
      if (selectedScope !== "all" && s.scope !== selectedScope) {
        return false;
      }

      // 4. Gender filter
      if (selectedGender !== "all") {
        if (s.gender && s.gender !== "any" && s.gender !== selectedGender) {
          return false;
        }
      }

      return true;
    });
  }, [schemes, searchQuery, selectedCategory, selectedScope, selectedGender]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedScope("all");
    setSelectedGender("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedScope !== "all" ||
    selectedGender !== "all";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" /> {t("nav.search_schemes", "Scheme Knowledge Base")}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t("search.title", "Official Government Schemes Directory")}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t("search.subtitle", "Browse and search all 20 verified central and state schemes in the YojanaSetu knowledge base.")}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {schemes.length} {t("nav.official_schemes", "Official Schemes")}
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-medium">100% Verified Rules</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scheme name, keyword, benefit (e.g. scholarship, pension, health, ₹6,000, farmer)..."
            className="w-full text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region / Scope Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Region / Scope
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Regions (Central & States)</option>
              {scopes.map((scope) => (
                <option key={scope} value={scope}>
                  {scope === "Central" ? "Central Government" : `${scope} State`}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Gender Eligibility
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Any / All Genders</option>
              <option value="female">Women / Female Only</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        {/* Status bar & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{filteredSchemes.length}</strong> of{" "}
            <strong className="text-slate-900">{schemes.length}</strong> government schemes
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Loading government schemes...</h3>
          <p className="text-xs text-slate-500">Connecting to official scheme repository.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Unable to load schemes repository
          </div>
          <p className="text-xs text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Results Found */}
      {!loading && !error && filteredSchemes.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No schemes found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No government scheme matches your current search query or filter combination.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Normal Results Grid */}
      {!loading && !error && filteredSchemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {scheme.category || "General"}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded text-slate-500 bg-slate-100">
                    {scheme.scope === "Maharashtra" ? "Maharashtra State" : "Central Government"}
                  </span>
                  {scheme.gender && scheme.gender !== "any" && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 capitalize">
                      {scheme.gender} only
                    </span>
                  )}
                </div>

                {/* Scheme Name */}
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {scheme.name}
                </h3>

                {/* Benefit Highlight */}
                {scheme.benefit && (
                  <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 leading-relaxed font-medium">
                    <strong className="text-emerald-950 block mb-0.5">Benefit:</strong>
                    {scheme.benefit}
                  </div>
                )}

                {/* Eligibility Summary */}
                {scheme.description && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    <strong className="text-slate-800">Who is eligible: </strong>
                    {scheme.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {onToggleSaveScheme && (
                    <button
                      type="button"
                      onClick={() => onToggleSaveScheme(scheme)}
                      className={`inline-flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                        isSchemeSaved(scheme)
                          ? "text-emerald-700 hover:text-emerald-800"
                          : "text-slate-600 hover:text-emerald-700"
                      }`}
                      aria-label={isSchemeSaved(scheme) ? "Remove from saved schemes" : "Save scheme for this session"}
                    >
                      {isSchemeSaved(scheme) ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          Save Scheme
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-emerald-600" />
                    View Full Details
                  </button>
                </div>

                {scheme.source_url && (
                  <a
                    href={scheme.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    myScheme Portal
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Callout to Check Personalized Eligibility */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-black text-emerald-950">
            Want to know which schemes you qualify for?
          </h3>
          <p className="text-xs text-emerald-800 max-w-xl">
            Instead of searching manually, enter your details once. YojanaSetu automatically checks all 40 schemes, resolves conflicts, and generates your unified application checklist.
          </p>
        </div>
        <button
          onClick={onGoToCheckEligibility}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 whitespace-nowrap transition cursor-pointer"
        >
          Check My Eligibility →
        </button>
      </div>

      {/* Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
          isSaved={isSchemeSaved(selectedScheme)}
          onToggleSave={onToggleSaveScheme}
        />
      )}
    </div>
  );
}
