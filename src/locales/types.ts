
// Defines the structure for translations

export type TranslationObject = Record<string, string>;
export interface LocaleModule {
  en: TranslationObject;
  th: TranslationObject;
}

export type SupportedLanguage = 'en' | 'th';
