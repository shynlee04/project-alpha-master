/**
 * @fileoverview Workflow Toolbar Component
 * @module presentation/components/chat/workflow/WorkflowToolbar
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Header with save/execute buttons and template loader.
 */

import { useTranslation } from 'react-i18next';
import { Save, Play, Square, FolderOpen } from 'lucide-react';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';

interface WorkflowToolbarProps {
    onSave?: () => void;
    onLoadTemplate: () => void;
}

export function WorkflowToolbar({ onSave, onLoadTemplate }: WorkflowToolbarProps) {
    const { t } = useTranslation();
    const { workflow, isValid, isPreview, togglePreview } = useWorkflowBuilderStore();

    if (!workflow) return null;

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-semibold">{workflow.name}</h3>
                <p className="text-sm text-muted-foreground">
                    {workflow.steps.length} {t('chat.workflow.steps')} • v{workflow.version}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {!isPreview ? (
                    <>
                        <button
                            onClick={onLoadTemplate}
                            className="p-2 rounded hover:bg-muted transition-colors"
                            title={t('chat.workflow.loadTemplate')}
                        >
                            <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onSave}
                            disabled={!isValid}
                            className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
                            title={t('chat.workflow.save')}
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            onClick={togglePreview}
                            disabled={!isValid}
                            className="p-2 rounded hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
                            title={t('chat.workflow.preview')}
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={togglePreview}
                        className="p-2 rounded hover:bg-muted transition-colors"
                        title={t('chat.workflow.stopPreview')}
                    >
                        <Square className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
