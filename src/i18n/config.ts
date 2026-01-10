/**
 * @fileoverview i18next Configuration
 * @module i18n/config
 *
 * BUG-FIX-2026-01-11: Documented hydration mismatch handling
 * - Server renders in English (fallbackLng)
 * - Client hydrates with user's saved locale from localStorage
 * - suppressHydrationWarning on <body> prevents hydration warnings
 * - See: src/routes/__root.tsx
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import vi from './vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
