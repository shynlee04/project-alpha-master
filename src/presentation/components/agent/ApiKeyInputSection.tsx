/**
 * @fileoverview API Key Input Section Component
 * @module presentation/components/agent/ApiKeyInputSection
 *
 * Reusable component for API key management with testing and validation.
 * Part of P1-1 refactoring to extract from AgentConfigDialog god class.
 *
 * @December2025Patterns
 * - Single responsibility: API key input + testing only
 * - Composable: Can be used in any provider configuration context
 * - Type-safe: Proper TypeScript interfaces
 * - Accessible: ARIA labels and keyboard navigation
 */

import { Key, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { useTranslation } from 'react-i18next';

/**
 * Connection status states
 */
export type ConnectionStatus = 'idle' | 'success' | 'error' | 'checking';

/**
 * Props for ApiKeyInputSection component
 */
export interface ApiKeyInputSectionProps {
    /** Current API key value (masked with •••• when saved) */
    apiKey: string;
    /** Update API key value */
    onApiKeyChange: (key: string) => void;
    /** Provider ID for conditional rendering */
    providerId: string;
    /** Whether API key is required for this provider */
    required?: boolean;
    /** Connection test status */
    connectionStatus: ConnectionStatus;
    /** Whether connection test is in progress */
    isTestingConnection: boolean;
    /** Whether API key is being validated/saved */
    isSavingKey: boolean;
    /** Whether API key is being checked on mount */
    isCheckingKey: boolean;
    /** Validation error message */
    error?: string;
    /** Callback to test API connection */
    onTestConnection: () => void;
    /** Callback to save API key to credential vault */
    onSaveApiKey: () => void;
    /** Callback to clear API key */
    onClearApiKey: () => void;
    /** Callback to clear validation error */
    onClearError?: () => void;
    /** Optional provider-specific note */
    providerNote?: string;
    /** Optional config status indicator */
    configStatusIndicator?: React.ReactNode;
    /** CSS className for container */
    className?: string;
}

/**
 * API Key Input Section Component
 *
 * Handles:
 * - API key input with password masking
 * - Connection testing with status indicators
 * - Save/change key workflow
 * - Provider-specific messaging
 * - Validation error display
 *
 * @example
 * ```tsx
 * <ApiKeyInputSection
 *   apiKey={apiKey}
 *   onApiKeyChange={setApiKey}
 *   providerId="anthropic"
 *   required={true}
 *   connectionStatus={connectionStatus}
 *   isTestingConnection={isTesting}
 *   onTestConnection={handleTest}
 *   onSaveApiKey={handleSave}
 *   onClearApiKey={() => setApiKey('')}
 * />
 * ```
 */
export function ApiKeyInputSection({
    apiKey,
    onApiKeyChange,
    providerId: _providerId, // Intentionally unused (reserved for future provider-specific logic)
    required = false,
    connectionStatus,
    isTestingConnection,
    isSavingKey,
    isCheckingKey,
    error,
    onTestConnection,
    onSaveApiKey,
    onClearApiKey,
    onClearError,
    providerNote,
    configStatusIndicator,
    className = '',
}: ApiKeyInputSectionProps) {
    const { t } = useTranslation();

    // Determine if key is saved (masked)
    const isKeySaved = apiKey !== '' && apiKey !== '••••';

    // Handle input change with optional error clearing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onApiKeyChange(e.target.value);
        if (error && onClearError) {
            onClearError();
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    {t('agents.config.apiKey.label', 'API Key')}
                    {!required ? (
                        <span className="text-xs text-muted-foreground">
                            (optional)
                        </span>
                    ) : (
                        <span className="text-destructive">*</span>
                    )}
                </Label>
                {configStatusIndicator}
            </div>

            {/* Checking State */}
            {isCheckingKey ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('agents.config.apiKey.checking', 'Checking...')}
                </div>
            ) : isKeySaved ? (
                // Saved Key State: Show test and change buttons
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTestConnection}
                        disabled={isTestingConnection}
                        className="rounded-none gap-1"
                        aria-label={t('agents.config.testConnection', 'Test Connection')}
                    >
                        {isTestingConnection ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : connectionStatus === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 text-success" aria-hidden="true" />
                        ) : connectionStatus === 'error' ? (
                            <XCircle className="w-3 h-3 text-destructive" aria-hidden="true" />
                        ) : (
                            <RefreshCw className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                            {connectionStatus === 'success' && t('agents.config.connectionSuccess', 'Connection successful')}
                            {connectionStatus === 'error' && t('agents.config.connectionError', 'Connection failed')}
                        </span>
                        {t('agents.config.testConnection', 'Test Connection')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearApiKey}
                        className="rounded-none text-xs"
                        aria-label={t('agents.config.apiKey.change', 'Change API Key')}
                    >
                        {t('agents.config.apiKey.change', 'Change Key')}
                    </Button>
                </div>
            ) : (
                // Input State: Show password input and save button
                <div className="flex gap-2">
                    <Input
                        type="password"
                        value={apiKey}
                        onChange={handleInputChange}
                        placeholder={t('agents.config.apiKey.placeholder', 'Enter API key...')}
                        className="rounded-none flex-1"
                        aria-required={required}
                        aria-invalid={!!error}
                        aria-describedby={error ? 'apikey-error' : providerNote ? 'apikey-note' : undefined}
                    />
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onSaveApiKey}
                        disabled={isSavingKey || !apiKey.trim() || apiKey === '••••'}
                        className="rounded-none gap-1"
                        type="button"
                        aria-label={t('agents.config.apiKey.save', 'Save API Key')}
                    >
                        {isSavingKey && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                        {t('agents.config.apiKey.save', 'Save')}
                    </Button>
                </div>
            )}

            {/* Validation Error */}
            {error && (
                <p id="apikey-error" className="text-xs text-destructive" role="alert">
                    {error}
                </p>
            )}

            {/* Provider-specific Note */}
            {providerNote && (
                <p id="apikey-note" className="text-xs text-info mt-2">
                    {providerNote}
                </p>
            )}
        </div>
    );
}
