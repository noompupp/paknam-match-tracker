
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from "../locales";
import type { SupportedLanguage } from "../locales/types";

export type Language = SupportedLanguage;

// Add type for params parameter (object of key-value)
type TranslationParams = Record<string, string | number>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  /**
   * Main translation function.
   * @param key The key from the translation file.
   * @param fallback Optional fallback string.
   * @param params Optional params for interpolation.
   */
  t: (key: string, fallback?: string, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Helper for replacing {params} in a string.
 */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/{([^}]+)}/g, (match, p1) =>
    params[p1] !== undefined ? String(params[p1]) : match
  );
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'th')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Enhanced translation function with fallback + interpolation support
  const t = (
    key: string,
    fallback?: string,
    params?: TranslationParams
  ): string => {
    let translation = translations[language]?.[key];
    if (translation) {
      return interpolate(translation, params);
    }
    // If no translation found, try English as fallback
    if (language !== 'en') {
      const englishTranslation = translations.en[key];
      if (englishTranslation) {
        return interpolate(englishTranslation, params);
      }
    }
    // If still no translation, return fallback or the key itself
    return interpolate(fallback || key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// NOTE: This file now includes robust {param} interpolation in translations.
// Consider refactoring if this file grows further.

