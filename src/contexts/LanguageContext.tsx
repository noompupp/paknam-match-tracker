
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'th')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  /**
   * Translation function with parameter interpolation
   * @param key The translation key
   * @param fallback Fallback text if key is not found
   * @param params Object with values to replace in the translation
   * @returns Translated and interpolated string
   */
  const t = (key: string, fallback?: string, params?: TranslationParams): string => {
    try {
      // Get the translation from the current language or fallback to English
      let translation = translations[language]?.[key] || translations.en?.[key] || fallback || key;

      // If params are provided, replace placeholders
      if (params && typeof translation === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const placeholder = `{${paramKey}}`;
          const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
          translation = translation.replace(regex, String(paramValue));
        });
      }

      return translation;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return fallback || key;
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
