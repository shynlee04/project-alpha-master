/**
 * @fileoverview Workflow Canvas Component
 * @module presentation/components/chat/workflow/WorkflowCanvas
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Sortable canvas for workflow steps with drag-drop reordering.
 */

import { useTranslation } from 'react-i18next';
import {
    DndContext,
    DragStartEvent,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';
import type { WorkflowStep } from '@/lib/workflow/builder/types';

interface WorkflowCanvasProps {
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
}

export function WorkflowCanvas({ onDragStart, onDragEnd }: WorkflowCanvasProps) {
    const { t } = useTranslation();
    const { workflow, selectedStepId, selectStep, removeStep } = useWorkflowBuilderStore();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    if (!workflow) return null;

    const stepsIds = workflow.steps.map((s) => s.id);

    return (
        <div className="lg:col-span-2">
            <p className="text-sm font-medium mb-3">{t('chat.workflow.workflow')}</p>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <SortableContext items={stepsIds} strategy={verticalListSortingStrategy}>
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
            className={`p-4 rounded-none border-2 cursor-pointer transition-all group
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
                    className="p-1 rounded-none hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
