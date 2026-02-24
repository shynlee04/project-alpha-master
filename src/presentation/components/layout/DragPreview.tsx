/**
 * @fileoverview DragPreview - Ghost preview component for drag operations
 * @module presentation/components/layout/DragPreview
 *
 * EPIC-UXUI-04: Drag-Drop System (Story 6)
 * Displays a ghost preview of the dragged item that follows the cursor.
 * Provides visual feedback during drag operations with 8-bit styling.
 *
 * Features:
 * - Semi-transparent ghost preview
 * - Follows cursor position
 * - 8-bit pixel shadow styling
 * - Touch and mouse support
 * - Smooth animations
 *
 * @story UXUI-04-06
 * @created 2026-01-30
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useDragDrop } from '@/presentation/hooks/useDragDrop';
import { DRAG_CSS_CLASSES } from './drag-drop-types';
import './DragPreview.css';

// ============================================================================
// Component
// ============================================================================

/**
 * DragPreview Component
 *
 * Renders a ghost preview of the dragged plugin that follows the cursor.
 * Only visible when a drag operation is in progress.
 *
 * @returns React component or null if not dragging
 */
export const DragPreview: React.FC = () => {
  const { isDragging, draggedItem, position, isTouch } = useDragDrop();

  /**
   * Calculate preview position styles
   */
  const previewStyle = useMemo(() => {
    if (!position) {
      return {
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    }

    // Offset slightly so cursor doesn't cover the preview
    const offsetX = isTouch ? -40 : 10;
    const offsetY = isTouch ? -40 : 10;

    return {
      left: position.x + offsetX,
      top: position.y + offsetY,
      opacity: isDragging ? 0.85 : 0,
      pointerEvents: 'none' as const,
    };
  }, [isDragging, position, isTouch]);

  /**
   * Get plugin icon component
   */
  const PluginIcon = useMemo(() => {
    return draggedItem?.plugin.icon || null;
  }, [draggedItem]);

  // Don't render if not dragging or no item
  if (!isDragging || !draggedItem) {
    return null;
  }

  return (
    <div
      className={cn(
        DRAG_CSS_CLASSES.ghost,
        'drag-preview',
        isTouch && 'drag-preview--touch'
      )}
      style={previewStyle}
      role="presentation"
      aria-hidden="true"
    >
      <div className="drag-preview__content">
        {PluginIcon && (
          <PluginIcon
            size={24}
            className="drag-preview__icon"
            aria-hidden="true"
          />
        )}
        <span className="drag-preview__name">
          {draggedItem.plugin.name}
        </span>
      </div>

      {/* 8-bit pixel shadow */}
      <div className="drag-preview__shadow" aria-hidden="true" />
    </div>
  );
};

/**
 * DragPreviewPortal Component
 *
 * Renders the drag preview in a portal to ensure it appears above all other content.
 * Uses fixed positioning to follow cursor across the entire viewport.
 */
export const DragPreviewPortal: React.FC = () => {
  // For now, render directly. In a full implementation, this would use React Portal
  // to render into document.body and avoid z-index issues.
  return <DragPreview />;
};

export default DragPreview;
