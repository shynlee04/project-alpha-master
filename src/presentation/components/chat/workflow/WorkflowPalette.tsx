/**
 * @fileoverview Workflow Palette Component
 * @module presentation/components/chat/workflow/WorkflowPalette
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Drag sources for workflow steps (palette items).
 */

import { useTranslation } from 'react-i18next';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';
import type { PaletteItem } from '@/lib/workflow/builder/types';

interface WorkflowPaletteProps {
    onDragEnd: (event: DragEndEvent) => void;
}

export function WorkflowPalette({ onDragEnd }: WorkflowPaletteProps) {
    const { t } = useTranslation();
    const palette = useWorkflowBuilderStore().getPalette();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    return (
        <div className="lg:col-span-1">
            <p className="text-sm font-medium mb-3">{t('chat.workflow.addStep')}</p>
            <div className="space-y-2">
                {palette.map((item) => (
                    <DndContext
                        key={item.type}
                        sensors={sensors}
                        onDragEnd={onDragEnd}
                    >
                        <div className="relative" id={`palette-${item.type}`}>
                            <PaletteItemComponent item={item} />
                        </div>
                    </DndContext>
                ))}
            </div>
        </div>
    );
}

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
