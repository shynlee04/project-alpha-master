import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './config';

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'en';
    // Update head meta if needed, though react-helmet or similar is usually preferred for meta tags.
    // For now, simple document attribute update.
  }, [i18n.language]);

  return <>{children}</>;
};

export const useLocalePreference = () => {
  const { i18n } = useTranslation();
  return {
    locale: i18n.language || 'en',
    setLocale: (lang: string) => i18n.changeLanguage(lang),
  };
};
