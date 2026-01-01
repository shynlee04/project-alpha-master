/**
 * @fileoverview Agent Basic Configuration Component
 * @module presentation/components/agent/AgentBasicConfig
 *
 * Provides basic agent configuration fields: name, description, provider, and model.
 * Part of P1-1 refactoring to extract from AgentConfigDialog god class.
 *
 * @December2025Patterns
 * - Single responsibility: Basic agent config only
 * - Reusable across agent configuration contexts
 * - Type-safe with proper TypeScript interfaces
 * - Accessible with proper ARIA labels
 */

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Loader2, RefreshCw, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/presentation/components/ui/label';
import { Input } from '@/presentation/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select';
import { Button } from '@/presentation/components/ui/button';
import { useProviderStore } from '@/infrastructure/persistence/stores/use-app-store';
import { cn } from '@/lib/utils';
import type { FormErrors } from './agent-config-validation';

/**
 * Props for AgentBasicConfig component
 */
export interface AgentBasicConfigProps {
    /** Current agent name */
    name: string;
    /** Current agent description */
    description: string;
    /** Selected provider ID */
    providerId: string;
    /** Selected model ID */
    modelId: string;
    /** Current agent ID (for hot-reload updates) */
    agentId?: string;
    /** Validation errors */
    errors: FormErrors;
    /** Callback to update agent field */
    onUpdateField: (field: string, value: string) => void;
    /** CSS class name for styling */
    className?: string;
}

/**
 * Agent Basic Configuration Component
 *
 * Provides form fields for:
 * - Agent name (required)
 * - Agent description (optional)
 * - LLM provider selection (required)
 * - Model selection with refresh (required)
 *
 * @example
 * ```tsx
 * function AgentConfigForm() {
 *   const [name, setName] = useState('My Agent');
 *   const [providerId, setProviderId] = useState('openrouter');
 *   const [modelId, setModelId] = useState('');
 *   const [errors, setErrors] = useState({});
 *
 *   const handleUpdate = (field, value) => {
 *     // Update logic...
 *   };
 *
 *   return (
 *     <AgentBasicConfig
 *       name={name}
 *       description=""
 *       providerId={providerId}
 *       modelId={modelId}
 *       errors={errors}
 *       onUpdateField={handleUpdate}
 *     />
 *   );
 * }
 * ```
 */
export function AgentBasicConfig({
    name,
    description,
    providerId,
    modelId,
    agentId: _agentId,
    errors,
    onUpdateField,
    className,
}: AgentBasicConfigProps) {
    const { t } = useTranslation();

    // Subscribe to provider store
    const { providers, availableModels, isLoadingModels: storeLoadingModels, fetchModels } =
        useProviderStore();

    // Get models for selected provider
    const models = useMemo(() => {
        return availableModels[providerId] || [];
    }, [availableModels, providerId]);

    const isLoadingModels = storeLoadingModels[providerId] || false;

    /**
     * Get provider icon component
     */
    const getProviderIcon = (id: string, _name: string) => {
        if (id.includes('openai')) return <Bot className="w-5 h-5" />;
        if (id.includes('anthropic')) return <Bot className="w-5 h-5" />;
        if (id.includes('google')) return <Bot className="w-5 h-5" />;
        return <Settings2 className="w-5 h-5" />;
    };

    /**
     * Handle provider change
     */
    const handleProviderChange = useCallback(
        (value: string) => {
            onUpdateField('providerId', value);
            // Reset model when provider changes
            onUpdateField('modelId', '');
        },
        [onUpdateField]
    );

    /**
     * Handle model change
     */
    const handleModelChange = useCallback(
        (value: string) => {
            onUpdateField('modelId', value);
        },
        [onUpdateField]
    );

    /**
     * Handle refresh models
     */
    const handleRefreshModels = useCallback(async () => {
        try {
            await fetchModels(providerId);
            toast.success(t('agents.config.modelsRefreshed', 'Models refreshed'));
        } catch (err: any) {
            toast.error(
                t('agents.config.fetchFailed', 'Failed to fetch models: {{error}}', {
                    error: err.message || 'Unknown error',
                })
            );
        }
    }, [providerId, fetchModels, t]);

    return (
        <div className={className}>
            {/* Agent Name */}
            <div className="grid gap-2">
                <Label htmlFor="agent-name">
                    {t('agents.config.name', 'Agent Name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="agent-name"
                    value={name}
                    onChange={(e) => onUpdateField('name', e.target.value)}
                    placeholder={t('agents.config.namePlaceholder', 'Enter agent name...')}
                    className="rounded-none"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'agent-name-error' : undefined}
                />
                {errors.name && (
                    <p id="agent-name-error" className="text-xs text-destructive" role="alert">
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
                <Label htmlFor="agent-description">
                    {t('agents.config.description', 'Description')}
                </Label>
                <Input
                    id="agent-description"
                    value={description}
                    onChange={(e) => onUpdateField('description', e.target.value)}
                    placeholder={t('agents.config.descriptionPlaceholder', 'e.g., Frontend Developer')}
                    className="rounded-none"
                />
            </div>

            {/* Provider Selection */}
            <div className="grid gap-2">
                <Label>
                    {t('agents.config.provider', 'LLM Provider')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Select value={providerId} onValueChange={handleProviderChange}>
                        <SelectTrigger className="rounded-none" aria-label={t('agents.config.provider', 'LLM Provider')}>
                            <SelectValue placeholder={t('agents.config.providerPlaceholder', 'Select provider...')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            {providers.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                        {getProviderIcon(p.id, p.name)}
                                        <span>{p.name}</span>
                                        {p.id === 'openrouter' && (
                                            <span className="ml-2 text-xs text-success">
                                                {t('agents.config.freeModels', '(Free models available)')}
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {errors.provider && (
                    <p className="text-xs text-destructive" role="alert">
                        {errors.provider}
                    </p>
                )}
            </div>

            {/* Model Selection */}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>
                        {t('agents.config.model', 'Model')} <span className="text-destructive">*</span>
                    </Label>
                    <Button
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={handleRefreshModels}
                        disabled={isLoadingModels}
                        title={t('agents.config.refreshModels', 'Refresh models')}
                        aria-label={t('agents.config.refreshModels', 'Refresh models')}
                    >
                        <RefreshCw className={cn('w-3 h-3', isLoadingModels && 'animate-spin')} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                </div>
                <Select
                    value={modelId}
                    onValueChange={handleModelChange}
                    disabled={!providerId || isLoadingModels}
                >
                    <SelectTrigger className="rounded-none" aria-label={t('agents.config.model', 'Model')}>
                        <SelectValue
                            placeholder={
                                isLoadingModels
                                    ? t('agents.config.modelLoading', 'Loading models...')
                                    : t('agents.config.modelPlaceholder', 'Select model...')
                            }
                        />
                    </SelectTrigger>
                    <SelectContent className="rounded-none max-h-60">
                        {models.length === 0 ? (
                            <SelectItem value="none" disabled>
                                {t('agents.config.noModels', 'No models found')}
                            </SelectItem>
                        ) : (
                            models.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.name}
                                    {m.isFree && (
                                        <span className="ml-2 text-xs text-success">
                                            {t('agents.config.modelFree', '(Free)')}
                                        </span>
                                    )}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                {errors.modelId && (
                    <p className="text-xs text-destructive" role="alert">
                        {errors.modelId}
                    </p>
                )}
                {!providerId && (
                    <p className="text-xs text-muted-foreground">
                        {t('agents.config.selectProviderFirst', 'Select a provider first')}
                    </p>
                )}
                {isLoadingModels && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                        {t('agents.config.modelLoading', 'Loading models...')}
                    </div>
                )}
            </div>
        </div>
    );
}
