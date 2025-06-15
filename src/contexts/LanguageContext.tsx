import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from "../locales";
import type { SupportedLanguage } from "../locales/types";

export type Language = SupportedLanguage;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
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

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
    const translation = translations[language]?.[key];
    if (translation) {
      return translation;
    }
    // If no translation found, try English as fallback
    if (language !== 'en') {
      const englishTranslation = translations.en[key];
      if (englishTranslation) {
        return englishTranslation;
      }
    }
    // If still no translation, return fallback or the key itself
    return fallback || key;
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

// NOTE: This file is still quite long, but all translation data has been moved out!
// After this change, consider refactoring this file if logic grows further.
