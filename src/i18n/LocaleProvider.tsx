import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'

import { getLocale, loadStoredLocale, setLocale as applyLocale, setupI18n, type SupportedLocale } from './config'

interface LocaleContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const i18nInstance = setupI18n()

export function LocaleProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => loadStoredLocale())

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        setLocaleState(next)
        applyLocale(next)
      },
    }),
    [locale],
  )

  // Keep html lang in sync when locale changes or when i18n reports a change
  useEffect(() => {
    applyLocale(locale)
  }, [locale])

  // Sync with i18n changeLanguage events (in case something else changes it)
  const { i18n } = useTranslation()
  useEffect(() => {
    const handler = (lng: string) => {
      if (lng && (lng === 'en' || lng === 'vi')) {
        setLocaleState(lng as SupportedLocale)
      }
    }
    i18n.on('languageChanged', handler)
    return () => {
      i18n.off('languageChanged', handler)
    }
  }, [i18n])

  // Ensure initial html lang reflects current locale on mount
  useEffect(() => {
    const current = getLocale()
    applyLocale(current)
    setLocaleState(current)
  }, [])

  return (
    <I18nextProvider i18n={i18nInstance}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  )
}

export function useLocalePreference(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocalePreference must be used within LocaleProvider')
  }
  return ctx
}
