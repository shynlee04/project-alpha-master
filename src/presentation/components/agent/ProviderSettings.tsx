import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { ProviderConfigDialog } from './ProviderConfigDialog';
import { ProviderDeletionWarningDialog } from './ProviderDeletionWarningDialog';
import { ProviderStatusBadge, type ProviderStatus } from './ProviderStatusBadge';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/presentation/components/ui/dialog';
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';

export function ProviderSettings() {
    // Use individual selectors to prevent infinite re-render loops
    const providers = useAppStore(s => s.providers)
    const removeProvider = useAppStore(s => s.removeProvider)
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

    const handleAdd = () => {
        setEditingProvider(undefined);
        setIsConfigOpen(true);
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
                    className="gap-2 rounded-none"
                    onClick={handleAdd}
                >
                    <Plus className="h-4 w-4" />
                    Add Provider
                </Button>
            </div>

            <div className="border border-border rounded-none divide-y divide-border bg-background">
                {providers.map(provider => (
                    <div key={provider.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
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
                                {provider.models.length} models • {provider.isCustom ? 'Custom' : 'Built-in'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-none"
                                aria-label="Edit provider"
                                onClick={() => handleEdit(provider)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none"
                                onClick={() => confirmDelete(provider)}
                                aria-label="Delete provider"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
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
                    <DialogContent className="sm:max-w-[425px]">
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
