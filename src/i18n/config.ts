import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import vi from './vi.json'

const supportedLocales = ['en', 'vi'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

const DEFAULT_LOCALE: SupportedLocale = 'en'
const STORAGE_KEY = 'locale'

export function loadStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && supportedLocales.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale
  }
  return DEFAULT_LOCALE
}

export function persistLocale(locale: SupportedLocale) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, locale)
}

export function setupI18n() {
  const lng = loadStoredLocale()

  i18n
    .use(initReactI18next)
    .init({
      lng,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: supportedLocales,
      load: 'languageOnly',
      interpolation: {
        escapeValue: false,
      },
      resources: {
        en: { translation: en },
        vi: { translation: vi },
      },
    })

  return i18n
}

export function setLocale(locale: SupportedLocale) {
  if (!supportedLocales.includes(locale)) {
    locale = DEFAULT_LOCALE
  }
  persistLocale(locale)
  i18n.changeLanguage(locale)
  const html = document.querySelector('html')
  if (html) {
    html.setAttribute('lang', locale)
  }
  let ogLocale = document.querySelector('meta[property="og:locale"]')
  if (!ogLocale) {
    ogLocale = document.createElement('meta')
    ogLocale.setAttribute('property', 'og:locale')
    document.head.appendChild(ogLocale)
  }
  ogLocale.setAttribute('content', locale)
}

export function getLocale(): SupportedLocale {
  const lng = i18n.language as SupportedLocale | undefined
  return lng && supportedLocales.includes(lng) ? lng : DEFAULT_LOCALE
}
