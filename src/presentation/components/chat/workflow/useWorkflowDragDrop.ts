/**
 * @fileoverview Workflow Drag-Drop Hook
 * @module presentation/components/chat/workflow/useWorkflowDragDrop
 * @governance EPIC-E4-5
 * @created 2026-01-07
 *
 * Custom hook for drag-drop event handlers and palette drop logic.
 */

import { useCallback } from 'react';
import {
    DragStartEvent,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';

export function useWorkflowDragDrop() {
    const { palette, setDragging, addStep } = useWorkflowBuilderStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setDragging(true, event.active.id as string);
    }, [setDragging]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setDragging(false);

        if (!over) return;

        // Handle palette item drop
        if (active.id.toString().startsWith('palette-')) {
            const paletteItem = palette.find((p) => `palette-${p.type}` === active.id);
            if (paletteItem) {
                const newStep = {
                    type: paletteItem.type,
                    name: paletteItem.name,
                    description: paletteItem.description,
                    config: paletteItem.defaultConfig,
                    nextSteps: [],
                };
                addStep(newStep);
            }
        }
    }, [palette, setDragging, addStep]);

    return {
        sensors,
        handleDragStart,
        handleDragEnd,
    };
}
