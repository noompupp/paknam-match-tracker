// Aggregate all modules and merge into single translation dictionary per language

import navigation from "./navigation";
import common from "./common";
import dashboard from "./dashboard";
import teams from "./teams";
import match from "./match";
import referee from "./referee";
import events from "./events";
import forms from "./forms";
import time from "./time";
import messages from "./messages";
import language from "./language";
import rating from "./rating";

import { SupportedLanguage, TranslationObject } from "./types";

type Modules = Array<Record<SupportedLanguage, TranslationObject>>;

const modules: Modules = [
  navigation,
  common,
  dashboard,
  teams,
  match,
  referee,
  events,
  forms,
  time,
  messages,
  language,
  rating,
];

function aggregateTranslations(): Record<SupportedLanguage, TranslationObject> {
  const result: Record<SupportedLanguage, TranslationObject> = { en: {}, th: {} };
  for (const mod of modules) {
    for (const lang of ["en", "th"] as SupportedLanguage[]) {
      Object.assign(result[lang], mod[lang]);
    }
  }
  return result;
}

export const translations = aggregateTranslations();
