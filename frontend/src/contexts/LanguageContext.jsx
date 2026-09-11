import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "../i18n/translations";

const LANGUAGE_STORAGE_KEY = "yojanasetu_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिंदी", short: "हिं" },
  { code: "mr", label: "मराठी", short: "मरा" },
];

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && ["en", "hi", "mr"].includes(stored)) {
        return stored;
      }
    } catch (e) {
      console.error("Failed to read language from localStorage", e);
    }
    return "en"; // Default
  });

  const setLanguage = (newLang) => {
    if (!["en", "hi", "mr"].includes(newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.error("Failed to persist language in localStorage", e);
    }
  };

  /**
   * Helper translation function
   * @param {string} key - translation key in TRANSLATIONS
   * @param {string} [fallback] - default text if key is missing
   * @returns {string} translated text
   */
  const t = (key, fallback = "") => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English if missing in target language
    const enDict = TRANSLATIONS.en;
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
