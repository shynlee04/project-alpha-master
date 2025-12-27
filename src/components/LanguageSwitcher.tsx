import { useTranslation } from 'react-i18next';
import { useLocalePreference } from '../i18n/LocaleProvider';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = () => {
    const { t } = useTranslation();
    const { locale, setLocale } = useLocalePreference();

    const toggleLocale = () => {
        const next = locale === 'en' ? 'vi' : 'en';
        setLocale(next);
    };

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-sm transition-colors text-secondary-foreground"
            aria-label={t('actions.toggleLanguage', { code: locale.toUpperCase() })}
            title={t('actions.toggleLanguage', { code: locale.toUpperCase() })}
        >
            <Languages size={16} />
            <span className="font-medium">{locale.toUpperCase()}</span>
        </button>
    );
};
