/**
 * Provider Deletion Warning Dialog
 *
 * Warns users when deleting a provider that dependent agents rely on.
 * Shows list of dependent agents and provides clear action options.
 *
 * Features:
 * - Lists all dependent agents
 * - Explains impact clearly
 * - Provides "Cancel" and "Delete Anyway" options
 * - Accessible with keyboard navigation and screen reader support
 *
 * @module agent/ProviderDeletionWarningDialog
 * @story P0-1.1 - Provider Dependency Warning UI
 */

import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ProviderDeletionWarningDialogProps {
    /** Provider ID to delete */
    providerId: string;
    /** Provider display name */
    providerName: string;
    /** Agents that depend on this provider */
    dependentAgents: AgentData[];
    /** Callback when user confirms deletion */
    onConfirm: () => Promise<void>;
    /** Callback when user cancels */
    onCancel: () => void;
    /** Whether dialog is open */
    open: boolean;
    /** Whether deletion is in progress */
    isLoading?: boolean;
}

export function ProviderDeletionWarningDialog({
    providerId,
    providerName,
    dependentAgents,
    onConfirm,
    onCancel,
    open,
    isLoading = false,
}: ProviderDeletionWarningDialogProps) {
    const { t } = useTranslation();

    const agentCount = dependentAgents.length;

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            // Error is handled by parent component
            console.error('[ProviderDeletionWarningDialog] Delete failed:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        {t('agent.provider.deletionWarning.title', 'Provider Deletion Warning')}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3 text-base">
                            <p>
                                {t('agent.provider.deletionWarning.message', 'Cannot delete provider "{{providerName}}" because {{ agentCount }} agent(s) depend on it.', {
                                    providerName,
                                    agentCount,
                                })}
                            </p>

                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <p className="text-sm font-medium text-destructive mb-2">
                                    {t('agent.provider.deletionWarning.affectedAgents', 'Affected Agents')} ({agentCount}):
                                </p>
                                <ul className="space-y-1" role="list">
                                    {dependentAgents.map((agent) => (
                                        <li key={agent.id} className="flex items-center gap-2 text-sm">
                                            <XCircle className="h-3 w-3 text-destructive flex-shrink-0" aria-hidden="true" />
                                            <span className="font-mono">{agent.name}</span>
                                            {agent.providerId === providerId && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {t('agent.provider.deletionWarning.dependsOnProvider', 'Depends on this provider')}
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {t('agent.provider.deletionWarning.recommendation', 'To delete this provider, first remove or reassign the dependent agents.')}
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-none"
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="rounded-none"
                    >
                        {isLoading ? t('common.deleting', 'Deleting...') : t('agent.provider.deletionWarning.deleteAnyway', 'Delete Anyway')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
