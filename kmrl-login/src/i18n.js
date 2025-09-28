import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import ml from './locales/ml/translation.json';

const resources = {
  en: { translation: en },
  ml: { translation: ml },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      // order and from where user language should be detected
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

export default i18n;
