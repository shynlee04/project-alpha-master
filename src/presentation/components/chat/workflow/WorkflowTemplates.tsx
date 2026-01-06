/**
 * @fileoverview Workflow Templates Component
 * @module presentation/components/chat/workflow/WorkflowTemplates
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Template cards and template grid with load handlers.
 */

import { useTranslation } from 'react-i18next';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';
import type { WorkflowTemplate } from '@/lib/workflow/builder/types';

interface WorkflowTemplatesProps {
    onLoadTemplate: (template: WorkflowTemplate) => void;
}

export function WorkflowTemplates({ onLoadTemplate }: WorkflowTemplatesProps) {
    const { t } = useTranslation();
    const templates = useWorkflowBuilderStore().getTemplates();

    return (
        <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium mb-3">{t('chat.workflow.templates')}</p>
            <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        onLoad={() => onLoadTemplate(template)}
                    />
                ))}
            </div>
        </div>
    );
}

interface TemplateCardProps {
    template: WorkflowTemplate;
    onLoad: () => void;
}

function TemplateCard({ template, onLoad }: TemplateCardProps) {
    return (
        <button
            onClick={onLoad}
            className="p-3 rounded-lg border border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all text-left w-full"
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{template.icon}</span>
                <p className="text-sm font-medium">{template.name}</p>
            </div>
            <p className="text-xs text-muted-foreground">{template.description}</p>
        </button>
    );
}
