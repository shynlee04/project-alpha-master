import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderStore } from '@/lib/state/provider-store';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProviderConfig } from '@/lib/agent/providers/types';
import { toast } from 'sonner';

interface ProviderConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    provider?: ProviderConfig;
}

export function ProviderConfigDialog({ open, onOpenChange, provider }: ProviderConfigDialogProps) {
    const { t } = useTranslation();
    const { addProvider, updateProvider } = useProviderStore();

    const [name, setName] = useState('');
    const [type, setType] = useState<string>('openai-compatible');
    const [baseURL, setBaseURL] = useState('');
    const [defaultModel, setDefaultModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            if (provider) {
                setName(provider.name);
                setType(provider.type);
                setBaseURL(provider.baseURL || '');
                setDefaultModel(provider.defaultModel || '');
                setApiKey(''); // Don't show existing key
            } else {
                setName('');
                setType('openai-compatible');
                setBaseURL('');
                setDefaultModel('');
                setApiKey('');
            }
            setErrors({});
        }
    }, [open, provider]);

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        // if (!type) newErrors.type = 'Type is required'; 

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const id = provider?.id || crypto.randomUUID(); // Use UUID for new providers

            const config: ProviderConfig = {
                id,
                name,
                type: type as any,
                baseURL: baseURL || undefined,
                defaultModel: defaultModel || undefined,
                enabled: true,
                isCustom: true,
                supportsNativeTools: false // Default for custom
            };

            // Store credentials if provided
            if (apiKey) {
                await credentialVault.storeCredentials(id, apiKey);
            }

            if (provider) {
                updateProvider(provider.id, config);
                toast.success('Provider updated');
            } else {
                addProvider(config);
                toast.success('Provider added');
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save provider:', error);
            toast.error('Failed to save provider');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{provider ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
                    <DialogDescription>
                        Configure your AI provider settings.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Provider Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Local LLM"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Provider Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="openai-compatible">OpenAI Compatible</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="baseURL">Base URL (Optional)</Label>
                        <Input
                            id="baseURL"
                            value={baseURL}
                            onChange={(e) => setBaseURL(e.target.value)}
                            placeholder="http://localhost:11434/v1"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="defaultModel">Default Model (Optional)</Label>
                        <Input
                            id="defaultModel"
                            value={defaultModel}
                            onChange={(e) => setDefaultModel(e.target.value)}
                            placeholder="llama-2-7b-chat"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={provider ? 'Leave blank to keep existing' : 'sk-...'}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Provider'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
