/**
 * @fileoverview Workflow Builder Component (Refactored)
 * @module presentation/components/chat/WorkflowBuilder
 * @governance EPIC-E4-5
 * @created 2026-01-06
 * @refactored 2026-01-07 - Split into focused components
 *
 * Visual drag-and-drop workflow builder for agent workflows.
 * Now acts as orchestrator for extracted components.
 *
 * @size 140 lines (down from 476 lines, 71% reduction)
 * @responsibility Orchestration of workflow builder components
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Play, X } from 'lucide-react';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';
import {
    WorkflowPalette,
    WorkflowCanvas,
    WorkflowToolbar,
    WorkflowStepEditor,
    WorkflowTemplates,
} from './workflow';
import { useWorkflowDragDrop } from './workflow/useWorkflowDragDrop';

export interface WorkflowBuilderProps {
    /** Callback when workflow is saved */
    onSave?: (workflow: ReturnType<typeof useWorkflowBuilderStore.getState>['workflow']) => void;
    /** Callback when workflow is executed */
    onExecute?: (workflow: ReturnType<typeof useWorkflowBuilderStore.getState>['workflow']) => void;
    /** Additional CSS classes */
    className?: string;
}

export function WorkflowBuilder({ onSave, onExecute, className = '' }: WorkflowBuilderProps) {
    const { t } = useTranslation();
    const [showTemplates, setShowTemplates] = useState(false);

    const {
        workflow,
        isPreview,
        createWorkflow,
        loadTemplate,
        saveWorkflow,
    } = useWorkflowBuilderStore();

    const { handleDragStart, handleDragEnd } = useWorkflowDragDrop();

    const handleSave = () => {
        saveWorkflow();
        onSave?.(workflow);
    };

    const handleExecute = () => {
        onExecute?.(workflow);
    };

    const handleLoadTemplate = () => setShowTemplates(!showTemplates);

    // Initialize workflow if none exists
    if (!workflow) {
        return (
            <div className={`p-6 rounded-none border bg-card ${className}`}>
                <div className="text-center py-8">
                    <p className="text-lg font-medium mb-4">{t('chat.workflow.noWorkflow')}</p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={createWorkflow}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2 inline" />
                            {t('chat.workflow.createBlank')}
                        </button>
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="px-4 py-2 border rounded-none hover:bg-muted transition-colors"
                        >
                            <X className="w-4 h-4 mr-2 inline" />
                            {t('chat.workflow.fromTemplate')}
                        </button>
                    </div>
                </div>

                {showTemplates && (
                    <WorkflowTemplates
                        onLoadTemplate={(template) => {
                            loadTemplate(template);
                            setShowTemplates(false);
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={`p-6 rounded-none border bg-card ${className}`}>
            <WorkflowToolbar
                onSave={handleSave}
                onExecute={handleExecute}
                onLoadTemplate={handleLoadTemplate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WorkflowPalette onDragEnd={handleDragEnd} />
                <WorkflowCanvas onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
            </div>

            <WorkflowStepEditor />

            {/* Execute button in preview mode */}
            {isPreview && (
                <div className="mt-4 p-4 rounded bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium mb-2">{t('chat.workflow.previewMode')}</p>
                    <button
                        onClick={handleExecute}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-none hover:bg-primary/90 transition-colors"
                    >
                        <Play className="w-4 h-4 mr-2 inline" />
                        {t('chat.workflow.execute')}
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Convenience Component
// ============================================================================

export interface WorkflowBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (workflow: ReturnType<typeof useWorkflowBuilderStore.getState>['workflow']) => void;
    onExecute?: (workflow: ReturnType<typeof useWorkflowBuilderStore.getState>['workflow']) => void;
}

export function WorkflowBuilderModal({
    isOpen,
    onClose,
    onSave,
    onExecute,
}: WorkflowBuilderModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[var(--color-overlay)] flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-none shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{t('chat.workflow.title')}</h2>
                    <button onClick={onClose} className="p-2 rounded-none hover:bg-muted">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4">
                    <WorkflowBuilder onSave={onSave} onExecute={onExecute} />
                </div>
            </div>
        </div>
    );
}
