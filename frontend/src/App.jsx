import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CitizenForm from "./components/CitizenForm";
import ResultsDashboard from "./components/ResultsDashboard";
import SearchSchemesPage from "./components/SearchSchemesPage";
import SavedSchemesPage from "./components/SavedSchemesPage";
import ApplicationTrackerPage, { TRACKER_STATUSES } from "./components/ApplicationTrackerPage";
import MyDocumentsPage from "./components/MyDocumentsPage";
import SchemeDetailModal from "./components/SchemeDetailModal";
import AuthPage from "./components/AuthPage";
import { useAuth } from "./contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

const SAVED_SCHEMES_STORAGE_KEY = "yojanasetu_saved_schemes";
const APPLICATION_TRACKER_STORAGE_KEY = "yojanasetu_application_tracker";
const MY_DOCUMENTS_STORAGE_KEY = "yojanasetu_my_documents";
const GUEST_MODE_STORAGE_KEY = "yojanasetu_guest_mode";

export default function App() {
  const { user, session, loading: authLoading, signOut } = useAuth();

  // Guest Mode state (persists in localStorage so refresh remains in guest mode)
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem(GUEST_MODE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState("eligibility"); // 'eligibility', 'search', 'saved', or 'tracker'
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState(["agriculture"]); // Default for first demo profile (Ravi)
  const [savedSchemesLoading, setSavedSchemesLoading] = useState(false);
  const [activeModalScheme, setActiveModalScheme] = useState(null);

  // Saved Schemes state (backed by PostgreSQL for authenticated users, with localStorage cache/fallback)
  const [savedSchemes, setSavedSchemes] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_SCHEMES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to read saved schemes from localStorage", e);
      return [];
    }
  });

  // Fetch saved schemes from backend PostgreSQL when session is available
  useEffect(() => {
    let isMounted = true;
    const fetchSavedSchemes = async () => {
      if (!session?.access_token) return;
      setSavedSchemesLoading(true);
      try {
        const res = await fetch("/api/saved-schemes", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setSavedSchemes(json.data);
            try {
              localStorage.setItem(SAVED_SCHEMES_STORAGE_KEY, JSON.stringify(json.data));
            } catch (e) {
              console.error("Failed to update localStorage cache", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch saved schemes from database:", err);
      } finally {
        if (isMounted) setSavedSchemesLoading(false);
      }
    };

    fetchSavedSchemes();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  // Application Tracker state backed by separate localStorage key
  // Mapping: { [schemeId]: "Saved" | "Planning to Apply" | "Application Started" | "Submitted" }
  const [trackerStatuses, setTrackerStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem(APPLICATION_TRACKER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to read application tracker from localStorage", e);
      return {};
    }
  });

  // Fetch application tracker statuses from backend PostgreSQL when session is available
  useEffect(() => {
    let isMounted = true;
    const fetchTrackerStatuses = async () => {
      if (!session?.access_token) return;
      try {
        const res = await fetch("/api/application-tracker", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setTrackerStatuses(json.data);
            try {
              localStorage.setItem(APPLICATION_TRACKER_STORAGE_KEY, JSON.stringify(json.data));
            } catch (e) {
              console.error("Failed to update tracker localStorage cache", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch application tracker from database:", err);
      }
    };

    fetchTrackerStatuses();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  // Sync savedSchemes to localStorage on every change as local cache/fallback
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_SCHEMES_STORAGE_KEY, JSON.stringify(savedSchemes));
    } catch (e) {
      console.error("Failed to write saved schemes to localStorage", e);
    }
  }, [savedSchemes]);

  // Personal Documents State (Available docs and Custom docs)
  // Backed by PostgreSQL for authenticated users, with localStorage fallback for guests
  const [availableDocs, setAvailableDocs] = useState(() => {
    try {
      const stored = localStorage.getItem(MY_DOCUMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.availableDocs)) return parsed.availableDocs;
      }
      return [];
    } catch (e) {
      console.error("Failed to read documents from localStorage", e);
      return [];
    }
  });

  const [customDocs, setCustomDocs] = useState(() => {
    try {
      const stored = localStorage.getItem(MY_DOCUMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.customDocs)) return parsed.customDocs;
      }
      return [];
    } catch (e) {
      console.error("Failed to read custom docs from localStorage", e);
      return [];
    }
  });

  // Sync myDocuments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        MY_DOCUMENTS_STORAGE_KEY,
        JSON.stringify({ availableDocs, customDocs })
      );
    } catch (e) {
      console.error("Failed to write documents to localStorage", e);
    }
  }, [availableDocs, customDocs]);

  // Fetch documents from PostgreSQL when session is available
  useEffect(() => {
    let isMounted = true;
    const fetchDocuments = async () => {
      if (!session?.access_token) return;
      try {
        const res = await fetch("/api/documents", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            if (Array.isArray(json.data.available_docs)) {
              setAvailableDocs(json.data.available_docs);
            }
            if (Array.isArray(json.data.custom_docs)) {
              setCustomDocs(json.data.custom_docs);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch documents from database:", err);
      }
    };

    fetchDocuments();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  // Helper to persist documents to backend if authenticated
  const persistDocumentsToBackend = async (newAvailable, newCustom) => {
    if (!session?.access_token) return;
    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          available_docs: newAvailable,
          custom_docs: newCustom,
        }),
      });
    } catch (err) {
      console.error("Failed to persist documents to cloud:", err);
    }
  };

  const handleToggleDocument = (docName) => {
    if (!docName) return;
    setAvailableDocs((prev) => {
      const exists = prev.includes(docName);
      const updated = exists ? prev.filter((d) => d !== docName) : [...prev, docName];
      persistDocumentsToBackend(updated, customDocs);
      return updated;
    });
  };

  const handleAddCustomDocument = (newDocName) => {
    if (!newDocName) return;
    const trimmed = newDocName.trim();
    if (!trimmed) return;
    if (customDocs.includes(trimmed)) return;

    const updatedCustom = [...customDocs, trimmed];
    const updatedAvailable = [...availableDocs, trimmed]; // Added custom doc defaults to available
    setCustomDocs(updatedCustom);
    setAvailableDocs(updatedAvailable);
    persistDocumentsToBackend(updatedAvailable, updatedCustom);
  };

  const handleRemoveCustomDocument = (docNameToRemove) => {
    if (!docNameToRemove) return;
    const updatedCustom = customDocs.filter((d) => d !== docNameToRemove);
    const updatedAvailable = availableDocs.filter((d) => d !== docNameToRemove);
    setCustomDocs(updatedCustom);
    setAvailableDocs(updatedAvailable);
    persistDocumentsToBackend(updatedAvailable, updatedCustom);
  };

  // Robust ID extraction helper (handles id, scheme_id, or name fallback)
  const getSchemeKey = (scheme) => {
    if (!scheme) return "";
    return scheme.id || scheme.scheme_id || scheme.name || scheme.scheme_name || "";
  };

  const isSchemeSaved = (scheme) => {
    const key = getSchemeKey(scheme);
    if (!key) return false;
    return savedSchemes.some((s) => getSchemeKey(s) === key);
  };

  // Update status for a specific scheme in state & backend PostgreSQL
  const handleUpdateTrackerStatus = async (schemeKey, newStatus) => {
    if (!schemeKey || !newStatus) return;
    if (!TRACKER_STATUSES.includes(newStatus)) return;

    // Optimistic update
    setTrackerStatuses((prev) => ({
      ...prev,
      [schemeKey]: newStatus,
    }));

    // If authenticated, persist to PostgreSQL
    if (session?.access_token) {
      try {
        const res = await fetch("/api/application-tracker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            scheme_id: schemeKey,
            status: newStatus,
          }),
        });
        if (!res.ok) {
          console.error("Failed to persist tracker status to database:", res.status);
        }
      } catch (err) {
        console.error("Network error updating application tracker:", err);
      }
    }
  };

  const handleToggleSaveScheme = async (scheme) => {
    if (!scheme) return;
    const key = getSchemeKey(scheme);
    if (!key) return;

    const exists = savedSchemes.some((s) => getSchemeKey(s) === key);

    // Normalize essential display fields
    const normalized = {
      id: scheme.id || scheme.scheme_id || key,
      scheme_id: scheme.scheme_id || scheme.id || key,
      name: scheme.name || scheme.scheme_name,
      scheme_name: scheme.scheme_name || scheme.name,
      category: scheme.category || "General",
      description: scheme.description || "",
      benefit: scheme.benefit || "",
      scope: scheme.scope || "Central",
      documents_summary: scheme.documents_summary || scheme.documents_required || "",
      source_url: scheme.source_url || "",
      source: scheme.source || "Official myScheme page",
      last_verified: scheme.last_verified || "",
      min_age: scheme.min_age,
      max_age: scheme.max_age,
      min_income: scheme.min_income,
      max_income: scheme.max_income,
      gender: scheme.gender,
      occupation: scheme.occupation,
      caste_eligibility: scheme.caste_eligibility,
    };

    if (exists) {
      // Optimistically remove from state
      setSavedSchemes((prev) => prev.filter((s) => getSchemeKey(s) !== key));
      setTrackerStatuses((tPrev) => {
        const updated = { ...tPrev };
        delete updated[key];
        return updated;
      });

      // Call backend DELETE if authenticated
      if (session?.access_token) {
        try {
          const res = await fetch(`/api/saved-schemes/${encodeURIComponent(normalized.scheme_id)}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (!res.ok) {
            console.error("Failed to remove saved scheme from database:", res.status);
          }
        } catch (err) {
          console.error("Network error removing saved scheme:", err);
        }
      }
    } else {
      // Optimistically add to state
      setSavedSchemes((prev) => [...prev, normalized]);
      setTrackerStatuses((tPrev) => {
        if (!tPrev[key]) {
          return { ...tPrev, [key]: "Saved" };
        }
        return tPrev;
      });

      // Call backend POST if authenticated
      if (session?.access_token) {
        try {
          const res = await fetch("/api/saved-schemes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ scheme_id: normalized.scheme_id }),
          });
          if (!res.ok) {
            console.error("Failed to save scheme to database:", res.status);
          }
        } catch (err) {
          console.error("Network error saving scheme to database:", err);
        }
      }
    }
  };

  // Fetch citizen goals/preferences from backend PostgreSQL when session is available
  useEffect(() => {
    let isMounted = true;
    const fetchPreferences = async () => {
      if (!session?.access_token) return;
      try {
        const res = await fetch("/api/preferences", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && Array.isArray(json.data.goals)) {
            setSelectedGoals(json.data.goals);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user preferences from database:", err);
      }
    };

    fetchPreferences();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  // Citizen Profile state fetched from cloud PostgreSQL for authenticated user
  const [savedProfile, setSavedProfile] = useState(null);

  // Fetch saved citizen profile from backend PostgreSQL when session is available
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!session?.access_token) return;
      try {
        const res = await fetch("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && json.data.name) {
            setSavedProfile(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch citizen profile from database:", err);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [session?.access_token]);

  const savePreferencesToBackend = async (goals) => {
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ goals }),
      });
      if (!res.ok) {
        console.error("Failed to persist preferences to database:", res.status);
      }
    } catch (err) {
      console.error("Network error updating preferences:", err);
    }
  };

  const handleToggleGoal = (goalId) => {
    setSelectedGoals((prev) => {
      const updated = prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId];
      savePreferencesToBackend(updated);
      return updated;
    });
  };

  const handleClearGoals = () => {
    setSelectedGoals([]);
    savePreferencesToBackend([]);
  };

  const handleSetGoals = (goals) => {
    const updated = Array.isArray(goals) ? goals : [];
    setSelectedGoals(updated);
    savePreferencesToBackend(updated);
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setLoadingStep("Checking available schemes...");

    try {
      // Step 1: POST /api/profile (includes verified Supabase Bearer token if session exists)
      const authHeader = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(formData),
      });

      if (!profileRes.ok) {
        throw new Error("We couldn't save your profile details. Please check that all required fields are filled out and try again.");
      }

      const profileJson = await profileRes.json();
      const citizenId = profileJson.data?.id;

      if (!citizenId) {
        throw new Error("We couldn't connect to YojanaSetu right now. Please make sure the service is running and try again.");
      }

      // Update local savedProfile state when authenticated
      if (session?.access_token && profileJson.data) {
        setSavedProfile(profileJson.data);
      }

      // Step 2: Step message
      const queryParts = [];
      if (selectedGoals && selectedGoals.length > 0) {
        queryParts.push(`goals=${encodeURIComponent(selectedGoals.join(","))}`);
      }
      if (availableDocs && availableDocs.length > 0) {
        queryParts.push(`available_docs=${encodeURIComponent(availableDocs.join(","))}`);
      }
      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const eligRes = await fetch(`/api/eligibility/${citizenId}${queryString}`);
      if (!eligRes.ok) {
        throw new Error("We couldn't evaluate eligibility right now. Please make sure the service is running and try again.");
      }

      setLoadingStep("Preparing your results and document checklist...");

      const eligJson = await eligRes.json();
      setResults(eligJson.data);
    } catch (err) {
      console.error(err);
      // Friendly message as specified in Step 9
      setError(
        err.message?.includes("connect") || err.message?.includes("fetch") || err.message?.includes("Failed")
          ? "We couldn't connect to YojanaSetu right now. Please make sure the service is running and try again."
          : err.message || "We couldn't connect to YojanaSetu right now. Please make sure the service is running and try again."
      );
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinueGuest = () => {
    setIsGuest(true);
    try {
      localStorage.setItem(GUEST_MODE_STORAGE_KEY, "true");
    } catch (e) {
      console.error("Failed to set guest mode", e);
    }
  };

  const handlePromptSignIn = () => {
    setIsGuest(false);
    try {
      localStorage.removeItem(GUEST_MODE_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear guest mode", e);
    }
  };

  // --- Auth Gating ---

  // While checking for an existing session, show a loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-600">Loading YojanaSetu...</p>
        </div>
      </div>
    );
  }

  // If the user is not authenticated and has not chosen to Continue as Guest, show the AuthPage
  if (!user && !isGuest) {
    return <AuthPage onContinueGuest={handleContinueGuest} />;
  }

  // --- Main Application (Guest or Authenticated) ---

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <Navbar
        onReset={handleReset}
        hasResults={Boolean(results)}
        activeTab={activeTab}
        savedCount={savedSchemes.length}
        docsCount={availableDocs.length}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setError(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        user={user}
        onSignOut={signOut}
        onSignIn={handlePromptSignIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* My Documents Tab */}
        {activeTab === "documents" && (
          <MyDocumentsPage
            availableDocs={availableDocs}
            customDocs={customDocs}
            onToggleDocument={handleToggleDocument}
            onAddCustomDocument={handleAddCustomDocument}
            onRemoveCustomDocument={handleRemoveCustomDocument}
            isCloudSynced={Boolean(session?.access_token)}
            results={results}
            onViewSchemeDetails={(scheme) => setActiveModalScheme(scheme)}
            onGoToResults={() => {
              setActiveTab("eligibility");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onGoToCheckEligibility={() => {
              setActiveTab("eligibility");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Application Tracker Tab */}
        {activeTab === "tracker" && (
          <ApplicationTrackerPage
            trackedSchemes={savedSchemes}
            trackerStatuses={trackerStatuses}
            onUpdateStatus={handleUpdateTrackerStatus}
            onRemoveScheme={handleToggleSaveScheme}
            onGoToSearch={() => {
              setActiveTab("search");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onGoToCheckEligibility={() => {
              setActiveTab("eligibility");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Saved Schemes Tab */}
        {activeTab === "saved" && (
          <SavedSchemesPage
            savedSchemes={savedSchemes}
            onToggleSaveScheme={handleToggleSaveScheme}
            trackerStatuses={trackerStatuses}
            onUpdateStatus={handleUpdateTrackerStatus}
            onGoToTracker={() => {
              setActiveTab("tracker");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onGoToSearch={() => {
              setActiveTab("search");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onGoToCheckEligibility={() => {
              setActiveTab("eligibility");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Search All Schemes Tab */}
        {activeTab === "search" && (
          <SearchSchemesPage
            onGoToCheckEligibility={() => {
              setActiveTab("eligibility");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            isSchemeSaved={isSchemeSaved}
            onToggleSaveScheme={handleToggleSaveScheme}
          />
        )}

        {/* Eligibility Tab */}
        {activeTab === "eligibility" && (
          <>
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Unable to complete request</h4>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State with friendly messages */}
            {loading && (
              <div className="py-20 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{loadingStep}</h3>
                <p className="text-xs text-slate-500">Please wait a moment while we process your details against official schemes.</p>
              </div>
            )}

            {/* Form View (when no results) */}
            {!loading && !results && (
              <CitizenForm
                onSubmit={handleFormSubmit}
                loading={loading}
                userProfile={savedProfile}
                selectedGoals={selectedGoals}
                onToggleGoal={handleToggleGoal}
                onClearGoals={handleClearGoals}
                onSetGoals={handleSetGoals}
              />
            )}

            {/* Results View */}
            {!loading && results && (
              <ResultsDashboard
                result={results}
                selectedGoals={selectedGoals}
                onBack={handleReset}
                isSchemeSaved={isSchemeSaved}
                onToggleSaveScheme={handleToggleSaveScheme}
                availableDocs={availableDocs}
                onGoToDocuments={() => {
                  setActiveTab("documents");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer with required disclaimer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>YojanaSetu</strong> — Find the government schemes that fit your needs.
          </p>
          <p className="text-[11px] text-slate-400 max-w-xl text-center sm:text-right">
            Disclaimer: YojanaSetu is an assistance platform. Final eligibility and approval are determined by the concerned government department.
          </p>
        </div>
      </footer>
      {/* Scheme Detail Modal (accessible globally across tabs) */}
      {activeModalScheme && (
        <SchemeDetailModal
          scheme={activeModalScheme}
          onClose={() => setActiveModalScheme(null)}
          isSaved={isSchemeSaved(activeModalScheme)}
          onToggleSave={handleToggleSaveScheme}
        />
      )}
    </div>
  );
}
