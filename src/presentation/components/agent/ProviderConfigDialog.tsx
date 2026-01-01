import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderStore } from '@/lib/state/provider-store';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { ProviderConfig, PROVIDERS } from '@/lib/agent/providers/types';
import { toast } from 'sonner';
import { Lock, Key, Globe, Server } from 'lucide-react';

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
    const { addProvider, updateProvider, fetchModels } = useProviderStore();

    // Determine if this is a built-in provider (edit API key only) vs custom (full config)
    const isBuiltIn = provider ? isBuiltInProvider(provider.id) : false;
    const isAddingCustom = !provider; // If no provider passed, we're adding a custom one

    // Form state
    const [name, setName] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [defaultModel, setDefaultModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [headers, setHeaders] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            if (provider) {
                setName(provider.name);
                setBaseURL(provider.baseURL || '');
                setDefaultModel(provider.defaultModel || '');
                setApiKey(''); // Don't show existing key
                setHeaders('');
            } else {
                // Adding new custom provider
                setName('');
                setBaseURL('');
                setDefaultModel('');
                setApiKey('');
                setHeaders('');
            }
            setErrors({});
        }
    }, [open, provider]);

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
        try {
            if (isBuiltIn && provider) {
                // BUILT-IN PROVIDER: Only save API key
                if (apiKey) {
                    await credentialVault.storeCredentials(provider.id, apiKey);
                    // CRITICAL: Trigger model loading after key is saved (Ralph Loop Cycle 4: emits event)
                    await fetchModels(provider.id);
                    toast.success(`${provider.name} API key saved - loading models...`);
                } else {
                    toast.info('No API key provided - existing key kept');
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
                };

                addProvider(config);

                if (apiKey) {
                    await credentialVault.storeCredentials(id, apiKey);
                    await fetchModels(id); // Ralph Loop Cycle 4: emits event
                }

                toast.success(`Custom provider "${name}" added`);
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
                    await fetchModels(provider.id); // Ralph Loop Cycle 4: emits event
                }

                toast.success(`Provider "${name}" updated`);
            }

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save provider:', error);
            toast.error('Failed to save provider configuration');
        } finally {
            setIsSubmitting(false);
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
                        <Label htmlFor="apiKey" className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            {t('providers.apiKey', 'API Key')}
                        </Label>
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
                        <span className="text-xs text-muted-foreground">
                            {t('providers.key_hint', 'Key is encrypted and stored locally. Models will load automatically after saving.')}
                        </span>
                    </div>
                </div>

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

