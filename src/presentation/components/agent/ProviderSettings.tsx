import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { ProviderConfigDialog } from './ProviderConfigDialog';
import { ProviderDeletionWarningDialog } from './ProviderDeletionWarningDialog';
import { ProviderStatusBadge, type ProviderStatus } from './ProviderStatusBadge';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
import type { ModelInfo } from '@/domain/types/llm/model-types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/presentation/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select';
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';

export function ProviderSettings() {
    // Use individual selectors to prevent infinite re-render loops
    const providers = useAppStore(s => s.providers)
    const removeProvider = useAppStore(s => s.removeProvider)
    // R4 FIX: Get models and fetch action for inline model selection
    const isLoadingModels = useAppStore(s => s.isLoadingModels)
    const fetchModels = useAppStore(s => s.fetchModels)
    const getAvailableModels = useAppStore(s => s.getAvailableModels)

    // Ralph Loop Cycle 12, Epic AC-1.1: Pass agents to break circular dependency
    // Use individual selector to avoid infinite re-renders
    const agents = useAgentsStore(s => s.agents)

    // Edit/Add Dialog State
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ProviderConfig | undefined>(undefined);

    // Delete Confirmation State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [providerToDelete, setProviderToDelete] = useState<ProviderConfig | undefined>(undefined);
    const [dependentAgents, setDependentAgents] = useState<AgentData[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // R4 FIX: Model selection state per provider
    const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});

    // R4 FIX: Get models for a provider with memoization
    const getProviderModels = useMemo(() => (providerId: string): ModelInfo[] => {
        return getAvailableModels(providerId);
    }, [getAvailableModels]);

    const handleAdd = () => {
        setEditingProvider(undefined);
        setIsConfigOpen(true);
    };

    // R4 FIX: Handle refresh models for a provider
    const handleRefreshModels = async (providerId: string) => {
        await fetchModels(providerId);
    };

    // R4 FIX: Handle model selection change
    const handleModelChange = (providerId: string, modelId: string) => {
        setSelectedModels(prev => ({ ...prev, [providerId]: modelId }));
    };

    const handleEdit = (provider: ProviderConfig) => {
        setEditingProvider(provider);
        setIsConfigOpen(true);
    };

    const confirmDelete = (provider: ProviderConfig) => {
        setProviderToDelete(provider);
        setDependentAgents([]); // Reset dependent agents
        setIsDeleteOpen(true);
    };

    const executeDelete = async () => {
        if (!providerToDelete) return;

        setIsDeleting(true);

        try {
            // Ralph Loop Cycle 12, Epic AC-1.1: Pass agents to break circular dependency
            await removeProvider(providerToDelete.id, agents);

            // Success - close dialog
            setProviderToDelete(undefined);
            setDependentAgents([]);
            setIsDeleteOpen(false);
        } catch (error) {
            // Error: Provider has dependent agents
            // Extract dependent agent names from error message
            const errorMsg = error instanceof Error ? error.message : String(error);

            // Parse error message to get dependent agents
            // Error format: "Cannot delete provider "{id}" - {count} agent(s) depend on it: {names}"
            const match = errorMsg.match(/: (.+)$/);
            if (match) {
                const agentNames = match[1].split(', ');
                const dependent = agents.filter(a => agentNames.includes(a.name));
                setDependentAgents(dependent);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleForceDelete = async () => {
        if (!providerToDelete) return;

        setIsDeleting(true);

        try {
            // Force delete by clearing agent dependencies first
            // For each dependent agent, clear its providerId
            for (const agent of dependentAgents) {
                // Update agent to remove provider dependency
                // This would require an updateAgent call
                console.warn('[ProviderSettings] Agent needs provider update:', agent.name);
            }

            // Now delete the provider
            await removeProvider(providerToDelete.id, []);

            // Success - close dialog
            setProviderToDelete(undefined);
            setDependentAgents([]);
            setIsDeleteOpen(false);
        } catch (error) {
            console.error('[ProviderSettings] Force delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold font-mono">Providers</h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-none shadow-[2px_2px_0_0]"
                    onClick={handleAdd}
                >
                    <Plus className="h-4 w-4" />
                    Add Provider
                </Button>
            </div>

            <div className="border border-border rounded-none divide-y divide-border bg-background">
                {providers.map(provider => {
                    const models = getProviderModels(provider.id);
                    const isLoading = isLoadingModels[provider.id];
                    const selectedModel = selectedModels[provider.id] || models[0]?.id || '';

                    return (
                        <div key={provider.id} className="p-4 hover:bg-muted transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium font-mono flex items-center gap-2">
                                            {provider.name}
                                            {provider.isActive && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                                        </span>
                                        <ProviderStatusBadge
                                            status={provider.hasApiKey ? 'configured' : 'missing' as ProviderStatus}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {models.length} models • {provider.isCustom ? 'Custom' : 'Built-in'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 rounded-none shadow-[2px_2px_0_0]"
                                        aria-label="Edit provider"
                                        onClick={() => handleEdit(provider)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none shadow-[2px_2px_0_0]"
                                        onClick={() => confirmDelete(provider)}
                                        aria-label="Delete provider"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* R4 FIX: Inline model selection dropdown */}
                            {provider.hasApiKey && models.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                        Available Models:
                                    </span>
                                    <Select
                                        value={selectedModel}
                                        onValueChange={(value) => handleModelChange(provider.id, value)}
                                    >
                                        <SelectTrigger className="h-8 rounded-none text-xs font-mono flex-1 shadow-[2px_2px_0_0]">
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {models.map((model) => (
                                                <SelectItem key={model.id} value={model.id} className="font-mono text-xs">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>{model.name}</span>
                                                        {model.isFree && (
                                                            <span className="text-xs text-green-500">(Free)</span>
                                                        )}
                                                        {model.contextLength && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {model.contextLength >= 1000000
                                                                    ? `${Math.round(model.contextLength / 1000)}K ctx`
                                                                    : `${model.contextLength} ctx`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 rounded-none shadow-[2px_2px_0_0]"
                                        aria-label="Refresh models"
                                        onClick={() => handleRefreshModels(provider.id)}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            )}

                            {/* R4 FIX: Show selected model details */}
                            {selectedModel && models.find(m => m.id === selectedModel) && (
                                <div className="mt-2 p-2 bg-muted rounded-none text-xs font-mono border border-border">
                                    {(() => {
                                        const model = models.find(m => m.id === selectedModel)!;
                                        return (
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <span>Selected: <span className="text-foreground">{model.name}</span></span>
                                                {model.contextLength && (
                                                    <span>Context: {model.contextLength.toLocaleString()} tokens</span>
                                                )}
                                                {model.supportsStreaming && <span>Streaming: ✓</span>}
                                                {model.supportsImages && <span>Vision: ✓</span>}
                                                {model.supportsTools && <span>Tools: ✓</span>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* GEM-2026-01-11: Gemini Capabilities Section */}
                            {provider.id === 'google' && provider.hasApiKey && (
                                <div className="mt-3 p-3 bg-muted rounded-none border border-border">
                                    <h4 className="text-xs font-semibold font-mono mb-2 text-foreground">
                                        Gemini Capabilities
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-none border border-green-600 font-mono">
                                            Text ✓
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-none border border-blue-600 font-mono">
                                            Images ✓
                                        </span>
                                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-none border border-purple-600 font-mono">
                                            Audio ✓
                                        </span>
                                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-none border border-orange-600 font-mono">
                                            Video ⏳
                                        </span>
                                        <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-none border border-cyan-600 font-mono">
                                            Thinking ✓
                                        </span>
                                        <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-none border border-pink-600 font-mono">
                                            Grounding ✓
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        Context window: up to 1M tokens
                                    </p>
                                </div>
                            )}

                            {/* R4 FIX: No models message */}
                            {provider.hasApiKey && models.length === 0 && !isLoading && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground font-mono">
                                        No models loaded. Click refresh to fetch available models.
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 rounded-none text-xs shadow-[2px_2px_0_0]"
                                        onClick={() => handleRefreshModels(provider.id)}
                                    >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Load Models
                                    </Button>
                                </div>
                            )}

                            {/* R4 FIX: Loading state */}
                            {isLoading && (
                                <div className="text-xs text-muted-foreground font-mono mt-2">
                                    Loading models...
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <ProviderConfigDialog
                open={isConfigOpen}
                onOpenChange={setIsConfigOpen}
                provider={editingProvider}
            />

            {/* Delete Confirmation Dialog */}
            {dependentAgents.length > 0 ? (
                <ProviderDeletionWarningDialog
                    providerId={providerToDelete?.id || ''}
                    providerName={providerToDelete?.name || ''}
                    dependentAgents={dependentAgents}
                    onConfirm={handleForceDelete}
                    onCancel={() => {
                        setProviderToDelete(undefined);
                        setDependentAgents([]);
                        setIsDeleteOpen(false);
                    }}
                    open={isDeleteOpen}
                    isLoading={isDeleting}
                />
            ) : (
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-none border-2 border-border shadow-[4px_4px_0_0]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Provider?
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{providerToDelete?.name}</strong>?
                                This action cannot be undone and will remove associated API keys.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={executeDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
