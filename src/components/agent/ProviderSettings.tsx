import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProviderStore } from '@/lib/state/provider-store';
import { ProviderConfigDialog } from './ProviderConfigDialog';
import { ProviderConfig } from '@/lib/agent/providers/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';

export function ProviderSettings() {
    const { t } = useTranslation();
    const { providers, removeProvider } = useProviderStore();

    // Edit/Add Dialog State
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ProviderConfig | undefined>(undefined);

    // Delete Confirmation State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [providerToDelete, setProviderToDelete] = useState<ProviderConfig | undefined>(undefined);

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
        setIsDeleteOpen(true);
    };

    const executeDelete = () => {
        if (providerToDelete) {
            removeProvider(providerToDelete.id);
            setProviderToDelete(undefined);
            setIsDeleteOpen(false);
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
                        <div className="flex flex-col gap-1">
                            <span className="font-medium font-mono flex items-center gap-2">
                                {provider.name}
                                {provider.enabled && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                                {provider.type} • {provider.defaultModel || 'No default model'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                aria-label="Edit provider"
                                onClick={() => handleEdit(provider)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
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
                        <Button variant="destructive" onClick={executeDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
