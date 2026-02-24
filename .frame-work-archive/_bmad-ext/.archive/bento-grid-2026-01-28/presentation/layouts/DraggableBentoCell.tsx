/**
 * @fileoverview DraggableBentoCell - Drag-and-swap cell wrapper
 * @module presentation/layouts/DraggableBentoCell
 */

import React, { useState, useSyncExternalStore } from 'react';
import { clsx } from 'clsx';
import { GripVertical } from 'lucide-react';

import type { PluginId } from '@/domain/types/plugin-types';

import { useBentoGridStore } from './BentoGridStore';
import type { CellSizeVariant } from './bento-layouts';

// ==========================================================================
// Pointer Drag State (Touch/Pen)
// ==========================================================================

type PointerDragState = {
  activeId: PluginId | null;
  overId: PluginId | null;
  pointerId: number | null;
};

let pointerDragState: PointerDragState = {
  activeId: null,
  overId: null,
  pointerId: null,
};

const pointerDragListeners = new Set<() => void>();

const emitPointerDragChange = () => {
  pointerDragListeners.forEach((listener) => listener());
};

const setPointerDragState = (next: Partial<PointerDragState>) => {
  pointerDragState = { ...pointerDragState, ...next };
  emitPointerDragChange();
};

const resetPointerDragState = () => {
  pointerDragState = { activeId: null, overId: null, pointerId: null };
  emitPointerDragChange();
};

const subscribePointerDrag = (listener: () => void) => {
  pointerDragListeners.add(listener);
  return () => pointerDragListeners.delete(listener);
};

const getPointerDragSnapshot = () => pointerDragState;

// ==========================================================================
// Component
// ==========================================================================

interface DraggableBentoCellProps {
  pluginId: PluginId;
  gridArea: string;
  sizeVariant: CellSizeVariant;
  children: React.ReactNode;
  isLast?: boolean;
  cellId?: string;
}

export function DraggableBentoCell({
  pluginId,
  gridArea,
  sizeVariant,
  children,
  isLast = false,
  cellId,
}: DraggableBentoCellProps) {
  const swapPlugins = useBentoGridStore((state) => state.swapPlugins);
  const pointerDrag = useSyncExternalStore(
    subscribePointerDrag,
    getPointerDragSnapshot,
    getPointerDragSnapshot
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const isPointerDragging = pointerDrag.activeId === pluginId;
  const isPointerOver =
    pointerDrag.overId === pluginId && pointerDrag.activeId !== null && pointerDrag.activeId !== pluginId;

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', pluginId);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const fromId = event.dataTransfer.getData('text/plain') as PluginId;
    if (fromId && fromId !== pluginId) {
      swapPlugins(fromId, pluginId);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setPointerDragState({
      activeId: pluginId,
      overId: pluginId,
      pointerId: event.pointerId,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = getPointerDragSnapshot();
    if (current.activeId !== pluginId || current.pointerId !== event.pointerId) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);
    const targetCell = element?.closest<HTMLElement>('[data-plugin]');
    const targetId = targetCell?.getAttribute('data-plugin') as PluginId | null;

    if (targetId && targetId !== current.overId) {
      setPointerDragState({ overId: targetId });
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = getPointerDragSnapshot();
    if (current.activeId !== pluginId || current.pointerId !== event.pointerId) return;

    if (current.overId && current.overId !== pluginId) {
      swapPlugins(current.activeId, current.overId);
    }

    resetPointerDragState();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = getPointerDragSnapshot();
    if (current.activeId !== pluginId || current.pointerId !== event.pointerId) return;
    resetPointerDragState();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'relative h-full overflow-hidden border-r border-b border-zinc-700 transition-colors duration-150 ease-linear',
        isLast && 'border-r-0',
        (isDragging || isPointerDragging) && 'ring-2 ring-orange-500 bg-zinc-900',
        (isDragOver || isPointerOver) && 'ring-2 ring-orange-500 bg-zinc-800'
      )}
      style={{ gridArea }}
      data-plugin={pluginId}
      data-size={sizeVariant}
      data-bento-cell={cellId}
    >
      <div
        className={
          'absolute top-2 right-2 flex items-center justify-center h-11 w-11 cursor-grab active:cursor-grabbing '
          +
          'bg-zinc-900 border border-zinc-700 rounded-none z-10'
        }
        data-drag-handle
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-hidden="true"
      >
        <GripVertical className="h-4 w-4 text-zinc-400" />
      </div>
      {children}
    </div>
  );
}
