/**
 * @fileoverview Agent Config Dialog Header
 * @module components/agent/AgentConfigDialogHeader
 *
 * Dialog header with title, description, and action buttons (delete, import/export).
 * Extracted from AgentConfigDialog for better separation of concerns.
 */

import { useTranslation } from 'react-i18next';
import { DialogTitle, DialogDescription, DialogHeader } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AgentImportExport } from './AgentImportExport';

interface AgentConfigDialogHeaderProps {
    agentId: string | undefined;
    onDelete: () => void;
    onImportSuccess: () => void;
    onExportSuccess: () => void;
}

export function AgentConfigDialogHeader({
    agentId,
    onDelete,
    onImportSuccess,
    onExportSuccess,
}: AgentConfigDialogHeaderProps) {
    const { t } = useTranslation();

    return (
        <>
            <DialogHeader>
                <div className="flex items-center justify-between">
                    <DialogTitle className="font-pixel">
                        {agentId
                            ? t('agents.config.editAgent', 'Edit Agent')
                            : t('agents.config.newAgent', 'New Agent')
                        }
                    </DialogTitle>

                    <div className="flex items-center gap-2">
                        {agentId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {t('actions.delete', 'Delete')}
                            </Button>
                        )}

                        <AgentImportExport
                            onImportSuccess={onImportSuccess}
                            onExportSuccess={onExportSuccess}
                        />
                    </div>
                </div>
                <DialogDescription>
                    {t('agents.config.description', 'Configure your AI agent settings')}
                </DialogDescription>
            </DialogHeader>
        </>
    );
}
