/**
 * @fileoverview Workflow Step Editor Component
 * @module presentation/components/chat/workflow/WorkflowStepEditor
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Step configuration panel with form inputs and validation errors.
 */

import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';

export function WorkflowStepEditor() {
    const { t } = useTranslation();
    const { workflow, selectedStepId, selectStep, updateStep, errors } = useWorkflowBuilderStore();

    const selectedStep = workflow?.steps.find((s) => s.id === selectedStepId);

    if (!selectedStep) return null;

    return (
        <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">{t('chat.workflow.stepConfig')}</p>
                <button
                    onClick={() => selectStep(null)}
                    className="p-1 rounded hover:bg-muted"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <label className="text-muted-foreground">{t('chat.workflow.name')}</label>
                    <input
                        type="text"
                        value={selectedStep.name}
                        onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                        className="w-full px-3 py-2 rounded border bg-background"
                    />
                </div>
                <div>
                    <label className="text-muted-foreground">{t('chat.workflow.type')}</label>
                    <input
                        type="text"
                        value={selectedStep.type}
                        disabled
                        className="w-full px-3 py-2 rounded border bg-muted"
                    />
                </div>
                <div className="col-span-2">
                    <label className="text-muted-foreground">{t('chat.workflow.description')}</label>
                    <textarea
                        value={selectedStep.description || ''}
                        onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                        className="w-full px-3 py-2 rounded border bg-background min-h-[60px]"
                    />
                </div>
            </div>

            {/* Validation errors */}
            {Object.keys(errors).length > 0 && (
                <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20">
                    <p className="text-sm font-medium text-red-400 mb-1">
                        {t('chat.workflow.validationErrors')}
                    </p>
                    <ul className="text-xs text-red-300 space-y-1">
                        {Object.values(errors).map((error, i) => (
                            <li key={i}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
