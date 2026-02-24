/**
 * @fileoverview DropZone - Drop target indicator component
 * @module presentation/components/layout/DropZone
 *
 * EPIC-UXUI-04: Drag-Drop System (Story 6)
 * Wraps activity bars and other drop targets to provide visual feedback
 * during drag operations. Shows drop validity with color-coded indicators.
 *
 * Features:
 * - Visual feedback when drag is over
 * - Valid/invalid drop indication
 * - 8-bit styling with dashed borders
 * - Accessible drop announcements
 * - Touch-friendly targets
 *
 * @story UXUI-04-06
 * @created 2026-01-30
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useDragDrop } from '@/presentation/hooks/useDragDrop';
import type {
  DropZoneProps,
  DropTargetPosition,
} from './drag-drop-types';
import { DRAG_CSS_CLASSES } from './drag-drop-types';
import './DropZone.css';

// ============================================================================
// Component
// ============================================================================

/**
 * DropZone Component
 *
 * Wraps a drop target (like an activity bar) and provides visual feedback
 * during drag operations. Shows different states based on drop validity.
 *
 * @example
 * ```tsx
 * <DropZone target="left">
 *   <ActivityBarLeft />
 * </DropZone>
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export const DropZone: React.FC<DropZoneProps> = ({
  target,
  children,
  className,
  alwaysShowIndicator = false,
}) => {
  const {
    isDragging,
    dropTarget,
    dropValidation,
    dropOn,
    setDropTarget,
  } = useDragDrop();

  const isOver = dropTarget === target;
  const canDrop = dropValidation?.canDrop ?? false;

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
    },
    [canDrop]
  );

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback(() => {
    setDropTarget(target);
  }, [setDropTarget, target]);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      // Only clear if leaving the zone entirely (not entering a child)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (
        x < rect.left ||
        x > rect.right ||
        y < rect.top ||
        y > rect.bottom
      ) {
        setDropTarget(null);
      }
    },
    [setDropTarget]
  );

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Execute the drop
      const success = dropOn(target);

      // Clear drop target
      setDropTarget(null);

      // Announce to screen readers
      const announcement = success
        ? `Dropped on ${getTargetLabel(target)}`
        : `Cannot drop on ${getTargetLabel(target)}: ${dropValidation?.reason || 'Invalid drop'}`;

      announceToScreenReader(announcement);
    },
    [dropOn, setDropTarget, target, dropValidation]
  );

  /**
   * Get CSS classes based on state
   */
  const zoneClasses = cn(
    DRAG_CSS_CLASSES.dropZone,
    'drop-zone',
    isDragging && DRAG_CSS_CLASSES.dropZoneActive,
    isDragging && 'drop-zone--active',
    isOver && canDrop && DRAG_CSS_CLASSES.dropZoneValid,
    isOver && canDrop && 'drop-zone--valid',
    isOver && !canDrop && DRAG_CSS_CLASSES.dropZoneInvalid,
    isOver && !canDrop && 'drop-zone--invalid',
    alwaysShowIndicator && 'drop-zone--always-show',
    className
  );

  return (
    <div
      className={zoneClasses}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label={`Drop zone for ${getTargetLabel(target)}`}
      aria-dropeffect={canDrop ? 'move' : 'none'}
      data-target={target}
      data-is-over={isOver}
      data-can-drop={canDrop}
    >
      {/* Drop indicator overlay */}
      {isDragging && (
        <div
          className={cn(
            'drop-zone__indicator',
            isOver && 'drop-zone__indicator--active',
            isOver && canDrop && 'drop-zone__indicator--valid',
            isOver && !canDrop && 'drop-zone__indicator--invalid'
          )}
          aria-hidden="true"
        >
          {/* 8-bit corner markers */}
          <span className="drop-zone__corner drop-zone__corner--tl" />
          <span className="drop-zone__corner drop-zone__corner--tr" />
          <span className="drop-zone__corner drop-zone__corner--bl" />
          <span className="drop-zone__corner drop-zone__corner--br" />

          {/* Validation message */}
          {isOver && dropValidation?.reason && (
            <span className="drop-zone__message">
              {dropValidation.reason}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="drop-zone__content">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get human-readable label for drop target
 */
function getTargetLabel(target: DropTargetPosition): string {
  switch (target) {
    case 'left':
      return 'Left Activity Bar';
    case 'main-top':
      return 'Main Activity Bar';
    case 'right':
      return 'Right Activity Bar';
    default:
      return 'Activity Bar';
  }
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message: string): void {
  if (typeof document === 'undefined') return;

  // Create or find live region
  let liveRegion = document.getElementById('drag-drop-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'drag-drop-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  // Set message
  liveRegion.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }, 1000);
}

export default DropZone;
