import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { ModelLoadingSpinner } from '@/presentation/components/ui';
import { ProviderStatusBadge, type ProviderStatus } from './ProviderStatusBadge';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
import { toast } from 'sonner';
import { Lock, Key, Globe, Server, Zap } from 'lucide-react';

interface ProviderConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Provider to edit - if undefined, this is "Add Custom Provider" mode */
    provider?: ProviderConfig;
}

/**
 * Check if provider is a built-in (non-custom) provider
 * Built-in providers have hardcoded base URLs that cannot be modified
 */
function isBuiltInProvider(providerId: string): boolean {
    const builtInIds = ['openai', 'anthropic', 'gemini', 'openrouter'];
    return builtInIds.includes(providerId);
}

/**
 * Get the hardcoded base URL for built-in providers
 */
function getBuiltInBaseUrl(providerId: string): string {
    const urls: Record<string, string> = {
        openai: 'https://api.openai.com/v1',
        anthropic: 'https://api.anthropic.com/v1',
        openrouter: 'https://openrouter.ai/api/v1',
        gemini: 'Gemini SDK (Native)',
    };
    return urls[providerId] || '';
}

export function ProviderConfigDialog({ open, onOpenChange, provider }: ProviderConfigDialogProps) {
    const { t } = useTranslation();
    // Use individual selectors to prevent infinite re-render loops
    const addProvider = useAppStore(s => s.addProvider)
    const updateProvider = useAppStore(s => s.updateProvider)
    const fetchModels = useAppStore(s => s.fetchModels)

    // Determine if this is a built-in provider (edit API key only) vs custom (full config)
    const isBuiltIn = provider ? isBuiltInProvider(provider.id) : false;
    const isAddingCustom = !provider; // If no provider passed, we're adding a custom one

    // Form state
    const [name, setName] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [defaultModel, setDefaultModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [_headers, setHeaders] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [fetchError, setFetchError] = useState<string | undefined>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [keyStatus, setKeyStatus] = useState<ProviderStatus>('missing');
    const [isValidatingKey, setIsValidatingKey] = useState(false);
    const [testResult, setTestResult] = useState<{ valid: boolean; latencyMs?: number; error?: string } | null>(null);
    const [isTestingConnection, setIsTestingConnection] = useState(false);

    useEffect(() => {
        if (open) {
            if (provider) {
                setName(provider.name);
                setBaseURL(provider.baseURL || '');
                setDefaultModel(provider.defaultModel || '');
                setApiKey(''); // Don't show existing key
                setHeaders('');
                // Set initial key status
                setKeyStatus(provider.hasApiKey ? 'configured' : 'missing');
            } else {
                // Adding new custom provider
                setName('');
                setBaseURL('');
                setDefaultModel('');
                setApiKey('');
                setHeaders('');
                setKeyStatus('missing');
            }
            setErrors({});
            setFetchError(undefined);
            setTestResult(null); // Reset test result when dialog opens
        }
    }, [open, provider]);

    /**
     * Test API key connection before saving
     * Calls /api/provider/test endpoint for server-side validation
     */
    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            toast.error('Please enter an API key first');
            return;
        }

        const providerId = provider?.id || 'openai-compatible';
        setIsTestingConnection(true);
        setTestResult(null);

        try {
            const response = await fetch('/api/provider/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId,
                    apiKey: apiKey.trim(),
                    baseURL: baseURL || undefined,
                }),
            });

            const data = await response.json() as { valid: boolean; error?: string; latencyMs?: number };

            setTestResult(data);

            if (data.valid) {
                const latencyMsg = data.latencyMs ? ` (${data.latencyMs}ms)` : '';
                toast.success(`✓ Connection successful${latencyMsg}`);
                setKeyStatus('configured');
            } else {
                toast.error(`✗ Connection failed: ${data.error || 'Unknown error'}`);
                setKeyStatus('error');
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Network error';
            setTestResult({ valid: false, error: errorMsg });
            toast.error(`✗ Test failed: ${errorMsg}`);
            setKeyStatus('error');
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        // Validation
        if (isAddingCustom) {
            // Custom provider requires name and base URL
            if (!name.trim()) newErrors.name = 'Name is required';
            if (!baseURL.trim()) newErrors.baseURL = 'Base URL is required for custom providers';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setFetchError(undefined);
        setIsValidatingKey(true);
        setKeyStatus('loading');

        try {
            if (isBuiltIn && provider) {
                // BUILT-IN PROVIDER: Only save API key
                if (apiKey) {
                    // FIX-2026-01-05: Store credentials first
                    await credentialVault.storeCredentials(provider.id, apiKey);

                    // Update hasApiKey flag immediately for visual feedback
                    updateProvider(provider.id, { hasApiKey: true });
                    
                    // Now try to load models (Validation)
                    setIsFetchingModels(true);
                    try {
                        await fetchModels(provider.id);
                        
                        // SUCCESS: Key valid and models loaded
                        setKeyStatus('configured');
                        toast.success(`✓ ${provider.name} configured and verified`);
                        onOpenChange(false); // Only close on success
                    } catch (error) {
                        // FAILURE: Key saved but verification failed
                        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models';
                        setFetchError(errorMessage);
                        setKeyStatus('error');
                        
                        // Warn user and keep dialog open
                        toast.error(`Key saved, but validation failed: ${errorMessage}`);
                    } finally {
                        setIsFetchingModels(false);
                    }
                } else {
                    setIsValidatingKey(false);
                    toast.info('No API key provided - existing key kept');
                    onOpenChange(false);
                }
            } else if (isAddingCustom) {
                // ADDING NEW CUSTOM PROVIDER
                const id = `custom-${Date.now()}`;
                const config: ProviderConfig = {
                    id,
                    name,
                    type: 'openai-compatible',
                    baseURL,
                    defaultModel: defaultModel || undefined,
                    enabled: true,
                    isCustom: true,
                    supportsNativeTools: false,
                    hasApiKey: !!apiKey, // True if API key provided
                    models: [], // Will be populated after key saved
                    lastModelFetchAt: undefined,
                };

                addProvider(config);

                if (apiKey) {
                    await credentialVault.storeCredentials(id, apiKey);
                    updateProvider(id, { hasApiKey: true });
                    
                    setIsFetchingModels(true);
                    try {
                        await fetchModels(id);
                        setKeyStatus('configured');
                        toast.success(`✓ Custom provider "${name}" configured and verified`);
                        onOpenChange(false);
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models';
                        setFetchError(errorMessage);
                        setKeyStatus('error');
                        toast.error(`Provider added, but validation failed: ${errorMessage}`);
                        // Keep dialog open
                    } finally {
                        setIsFetchingModels(false);
                    }
                } else {
                    setIsValidatingKey(false);
                    toast.success(`✓ Custom provider "${name}" added`);
                    onOpenChange(false);
                }
            } else if (provider?.isCustom) {
                // EDITING EXISTING CUSTOM PROVIDER
                const config: Partial<ProviderConfig> = {
                    name,
                    baseURL,
                    defaultModel: defaultModel || undefined,
                };

                updateProvider(provider.id, config);

                if (apiKey) {
                    await credentialVault.storeCredentials(provider.id, apiKey);
                    updateProvider(provider.id, { hasApiKey: true });
                    
                    setIsFetchingModels(true);
                    try {
                        await fetchModels(provider.id);
                        setKeyStatus('configured');
                        toast.success(`✓ Provider "${name}" updated and verified`);
                        onOpenChange(false);
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models';
                        setFetchError(errorMessage);
                        setKeyStatus('error');
                        toast.error(`Provider updated, but validation failed: ${errorMessage}`);
                        // Keep dialog open
                    } finally {
                        setIsFetchingModels(false);
                    }
                } else {
                    setIsValidatingKey(false);
                    toast.success(`✓ Provider "${name}" updated`);
                    onOpenChange(false);
                }
            }
        } catch (error) {
            console.error('[ProviderConfigDialog] Failed to save provider:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setKeyStatus('error');
            toast.error(`Failed to save provider configuration: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
            setIsValidatingKey(false);
        }
    };

    // Render different dialogs based on context
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isBuiltIn ? <Key className="h-5 w-5" /> : <Server className="h-5 w-5" />}
                        {isBuiltIn
                            ? t('providers.configure_key', 'Configure API Key')
                            : isAddingCustom
                                ? t('providers.add_custom', 'Add Custom Provider')
                                : t('providers.edit_custom', 'Edit Custom Provider')
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {isBuiltIn
                            ? t('providers.key_only_desc', 'Enter your API key. The endpoint is pre-configured.')
                            : t('providers.custom_desc', 'Configure your OpenAI-compatible provider.')
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Provider Name - only for custom providers */}
                    {!isBuiltIn && (
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('providers.name', 'Provider Name')}</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Local LLM"
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                        </div>
                    )}

                    {/* Base URL - READONLY for built-in, editable for custom */}
                    <div className="grid gap-2">
                        <Label htmlFor="baseURL" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {t('providers.baseURL', 'Base URL')}
                            {isBuiltIn && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </Label>
                        <Input
                            id="baseURL"
                            value={isBuiltIn && provider ? getBuiltInBaseUrl(provider.id) : baseURL}
                            onChange={(e) => !isBuiltIn && setBaseURL(e.target.value)}
                            placeholder="http://localhost:11434/v1"
                            disabled={isBuiltIn}
                            className={isBuiltIn ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
                        />
                        {isBuiltIn && (
                            <span className="text-xs text-muted-foreground">
                                {t('providers.url_locked', 'Endpoint is pre-configured and cannot be changed')}
                            </span>
                        )}
                        {errors.baseURL && <span className="text-xs text-destructive">{errors.baseURL}</span>}
                    </div>

                    {/* Default Model - only for custom providers */}
                    {!isBuiltIn && (
                        <div className="grid gap-2">
                            <Label htmlFor="defaultModel">{t('providers.defaultModel', 'Default Model (Optional)')}</Label>
                            <Input
                                id="defaultModel"
                                value={defaultModel}
                                onChange={(e) => setDefaultModel(e.target.value)}
                                placeholder="llama-2-7b-chat"
                            />
                        </div>
                    )}

                    {/* API Key - always editable */}
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="apiKey" className="flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                {t('providers.apiKey', 'API Key')}
                            </Label>
                            <ProviderStatusBadge status={isValidatingKey ? 'loading' : keyStatus} />
                        </div>
                        <Input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={provider
                                ? t('providers.apiKeyPlaceholderEdit', 'Leave blank to keep existing')
                                : 'sk-...'
                            }
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                {t('providers.key_hint', 'Key is encrypted and stored locally. Models will load automatically after saving.')}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTestConnection}
                                disabled={!apiKey || isTestingConnection}
                                className="h-7 text-xs"
                            >
                                <Zap className={`h-3 w-3 mr-1 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                                {isTestingConnection ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </div>
                        {/* Test result feedback */}
                        {testResult && (
                            <div className={`text-xs p-2 rounded ${testResult.valid ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                {testResult.valid
                                    ? `✓ Valid connection${testResult.latencyMs ? ` (${testResult.latencyMs}ms latency)` : ''}`
                                    : `✗ ${testResult.error || 'Invalid API key'}`
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* Model Loading Feedback */}
                <ModelLoadingSpinner
                    providerName={provider?.name || name}
                    isLoading={isFetchingModels}
                    error={fetchError}
                    onRetry={handleSubmit}
                />

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting
                            ? t('common.saving', 'Saving...')
                            : isBuiltIn
                                ? t('providers.save_key', 'Save Key')
                                : t('providers.save', 'Save Provider')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

