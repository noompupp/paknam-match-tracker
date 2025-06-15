
import { useLanguage } from '@/contexts/LanguageContext';

export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguage();

  return {
    /** 
     * Enhanced t(): 
     * - (key, fallback, params?) => string
     * - params allows {placeholder} interpolation
     */
    t,
    language,
    setLanguage,
    isEnglish: language === 'en',
    isThai: language === 'th'
  };
};

