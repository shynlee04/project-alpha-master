/**
 * @fileoverview Missing API Key Warning Component
 * @module presentation/components/ui/MissingApiKeyWarning
 *
 * User-friendly warning displayed when user triggers AI features
 * without configuring a required API key.
 *
 * @epic BYOK Vault Wiring
 * @story B-1 - Wire Vault to AI Providers
 *
 * Provides clear guidance and navigation to Provider Settings.
 */

import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Key, AlertTriangle, Settings } from 'lucide-react';
import { Button } from './button';

export interface MissingApiKeyWarningProps {
    /** The provider ID that is missing an API key */
    providerId?: string;
    /** Human-readable provider name */
    providerName?: string;
    /** Optional custom message */
    message?: string;
    /** Whether to show in inline variant (smaller) */
    variant?: 'inline' | 'full';
    /** Additional CSS classes */
    className?: string;
}

/**
 * Provider names for display
 */
const PROVIDER_NAMES: Record<string, string> = {
    openrouter: 'OpenRouter',
    openai: 'OpenAI',
    anthropic: 'Anthropic Claude',
    gemini: 'Google Gemini',
    'openai-compatible': 'Custom Provider',
};

/**
 * Component displayed when user tries to use AI features without API key.
 *
 * Shows warning with Settings navigation button for quick configuration.
 */
export function MissingApiKeyWarning({
    providerId = 'openrouter',
    providerName,
    message,
    variant = 'full',
    className = '',
}: MissingApiKeyWarningProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const displayName = providerName || PROVIDER_NAMES[providerId] || providerId;
    const defaultTitle = t('providers.missingKey.title', 'API Key Required');
    const defaultMessage = t(
        'providers.missingKey.message',
        'Configure your {{provider}} API key in Settings to use AI features.',
        { provider: displayName }
    );

    const handleGoToSettings = () => {
        navigate({ to: '/settings', search: { tab: 'providers' } });
    };

    if (variant === 'inline') {
        return (
            <div className={`flex items-center gap-2 px-3 py-2 bg-destructive/10 border-2 border-destructive/20 rounded-none ${className}`}>
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                    {message || defaultMessage}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToSettings}
                    className="h-7 text-xs"
                >
                    <Settings className="h-3 w-3 mr-1" />
                    {t('providers.configure', 'Configure')}
                </Button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-4 p-6 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-none ${className}`}>
            <div className="flex items-center gap-3">
                {/* 8-bit: using rounded-none for icon container */}
                <div className="p-3 bg-destructive/10 rounded-none">
                    <Key className="h-6 w-6 text-destructive" />
                </div>
                <div className="text-left">
                    <h3 className="font-semibold text-foreground">{defaultTitle}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {message || defaultMessage}
                    </p>
                </div>
            </div>

            <Button
                variant="primary"
                onClick={handleGoToSettings}
                className="gap-2"
            >
                <Settings className="h-4 w-4" />
                {t('providers.goToSettings', 'Go to Provider Settings')}
            </Button>
        </div>
    );
}

export default MissingApiKeyWarning;
