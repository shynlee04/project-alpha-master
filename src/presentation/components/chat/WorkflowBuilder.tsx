/**
 * @fileoverview Workflow Builder Component
 * @module presentation/components/chat/WorkflowBuilder
 * @governance EPIC-E4-5
 * @created 2026-01-06
 *
 * Visual drag-and-drop workflow builder for agent workflows.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';
import type { PaletteItem, WorkflowStep, WorkflowTemplate } from '@/lib/workflow/builder/types';
import {
    Plus,
    Trash2,
    Save,
    Play,
    Square,
    FolderOpen,
    X,
} from 'lucide-react';

// ============================================================================
// Sub-Components
// ============================================================================

interface PaletteItemProps {
    item: PaletteItem;
}

function PaletteItemComponent({ item }: PaletteItemProps) {
    return (
        <div
            className={`p-3 rounded-none border-2 border-dashed cursor-grab active:cursor-grabbing
                hover:border-primary/50 transition-colors ${item.color} bg-[var(--muted)]`}
        >
            <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
            </div>
        </div>
    );
}

interface WorkflowStepItemProps {
    step: WorkflowStep;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

function WorkflowStepItem({ step, isSelected, onSelect, onDelete }: WorkflowStepItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: step.id,
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              transition,
          }
        : undefined;

    const paletteItem = useWorkflowBuilderStore
        .getState()
        .getPalette()
        .find((p) => p.type === step.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onSelect}
            className={`p-4 rounded-none border-2 cursor-pointer transition-all
                ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
                ${paletteItem?.color || 'bg-gray-500'} bg-[var(--muted)]`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{paletteItem?.icon || '⚙️'}</span>
                    <div>
                        <p className="text-sm font-medium">{step.name}</p>
                        {step.description && (
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1 rounded hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
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
            className="p-3 rounded-none border border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all text-left w-full"
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{template.icon}</span>
                <p className="text-sm font-medium">{template.name}</p>
            </div>
            <p className="text-xs text-muted-foreground">{template.description}</p>
        </button>
    );
}

// ============================================================================
// Props
// ============================================================================

export interface WorkflowBuilderProps {
    /** Callback when workflow is saved */
    onSave?: (workflow: ReturnType<typeof useWorkflowBuilderStore.getState>['workflow']) => void;
    /** Callback when workflow is executed */
    onExecute?: (workflow: ReturnType<typeof useWorkflowBuilderStore.getState>['workflow']) => void;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function WorkflowBuilder({ onSave, onExecute, className = '' }: WorkflowBuilderProps) {
    const { t } = useTranslation();
    const [showTemplates, setShowTemplates] = useState(false);

    const {
        workflow,
        selectedStepId,
        isValid,
        isPreview,
        errors,
        createWorkflow,
        loadTemplate,
        updateStep,
        removeStep,
        selectStep,
        setDragging,
        saveWorkflow,
        togglePreview,
        getPalette,
        getTemplates,
    } = useWorkflowBuilderStore();

    const palette = getPalette();
    const templates = getTemplates();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setDragging(true, event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDragging(false);

        if (!over) return;

        // Handle palette item drop
        if (active.id.toString().startsWith('palette-')) {
            const paletteItem = palette.find((p) => `palette-${p.type}` === active.id);
            if (paletteItem) {
                const newStep: Omit<WorkflowStep, 'id'> = {
                    type: paletteItem.type,
                    name: paletteItem.name,
                    description: paletteItem.description,
                    config: paletteItem.defaultConfig,
                    nextSteps: [],
                };
                useWorkflowBuilderStore.getState().addStep(newStep);
            }
        }
    };

    const handleSave = () => {
        saveWorkflow();
        onSave?.(workflow);
    };

    const handleExecute = () => {
        onExecute?.(workflow);
    };

    const selectedStep = workflow?.steps.find((s) => s.id === selectedStepId);

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
                            <FolderOpen className="w-4 h-4 mr-2 inline" />
                            {t('chat.workflow.fromTemplate')}
                        </button>
                    </div>
                </div>

                {showTemplates && (
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm font-medium mb-3">{t('chat.workflow.templates')}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onLoad={() => {
                                        loadTemplate(template);
                                        setShowTemplates(false);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const stepsIds = workflow.steps.map((s) => s.id);

    return (
        <div className={`p-6 rounded-none border bg-card ${className}`}>
            {/* Header */}
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
                                onClick={() => setShowTemplates(!showTemplates)}
                                className="p-2 rounded hover:bg-muted transition-colors"
                                title={t('chat.workflow.loadTemplate')}
                            >
                                <FolderOpen className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleSave}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Palette */}
                <div className="lg:col-span-1">
                    <p className="text-sm font-medium mb-3">{t('chat.workflow.addStep')}</p>
                    <div className="space-y-2">
                        {palette.map((item) => (
                            <DndContext
                                key={item.type}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="relative" id={`palette-${item.type}`}>
                                    <PaletteItemComponent item={item} />
                                </div>
                            </DndContext>
                        ))}
                    </div>
                </div>

                {/* Workflow Canvas */}
                <div className="lg:col-span-2">
                    <p className="text-sm font-medium mb-3">{t('chat.workflow.workflow')}</p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={stepsIds}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {workflow.steps.map((step) => (
                                    <div key={step.id}>
                                        <WorkflowStepItem
                                            step={step}
                                            isSelected={selectedStepId === step.id}
                                            onSelect={() => selectStep(step.id)}
                                            onDelete={() => removeStep(step.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

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
            </div>

            {/* Step Config Panel */}
            {selectedStep && !isPreview && (
                <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">{t('chat.workflow.stepConfig')}</p>
                        <button onClick={() => selectStep(null)} className="p-1 rounded hover:bg-muted">
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
                    <button onClick={onClose} className="p-2 rounded hover:bg-muted">
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
