/**
 * @fileoverview PanelResizer - Drag handle for resizing layout panels
 * @module presentation/components/layout/PanelResizer
 *
 * EPIC-PLAT-09: Fix panel overlap/disappear issues
 * Provides drag-to-resize functionality for layout panels.
 *
 * @story PLAT-09
 * @created 2026-02-01
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/infrastructure/utils/cn';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import './PanelResizer.css';

// ============================================================================
// Types
// ============================================================================

export interface PanelResizerProps {
  /** Panel position to the left of this resizer */
  leftPanel: 'left' | 'main';
  /** Panel position to the right of this resizer */
  rightPanel: 'main' | 'right';
  /** Optional CSS class */
  className?: string;
  /** Orientation (defaults to vertical for horizontal panels) */
  orientation?: 'vertical' | 'horizontal';
  /** Minimum panel size percentage */
  minSize?: number;
  /** Maximum panel size percentage */
  maxSize?: number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * PanelResizer Component
 *
 * A draggable divider between two panels that allows resizing.
 * Uses percentage-based sizing relative to the container.
 *
 * @example
 * ```tsx
 * <PanelResizer leftPanel="left" rightPanel="main" />
 * ```
 */
export const PanelResizer: React.FC<PanelResizerProps> = ({
  leftPanel,
  rightPanel,
  className,
  orientation = 'vertical',
  minSize = 10,
  maxSize = 80,
}) => {
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startLeftSizeRef = useRef(0);
  const startRightSizeRef = useRef(0);

  // Get panel sizes and actions from store (useShallow for performance)
  const { panelSizes, setPanelSize } = usePluginLayoutStore(
    useShallow((state) => ({
      panelSizes: state.panelSizes,
      setPanelSize: state.setPanelSize,
    }))
  );

  /**
   * Get the parent container for calculating percentages
   */
  const getContainer = useCallback(() => {
    if (!containerRef.current) return null;
    // Find the responsive layout container
    const layout = containerRef.current.closest('.responsive-layout__desktop, .responsive-layout__tablet-landscape');
    return layout as HTMLElement | null;
  }, []);

  /**
   * Handle mouse down - start dragging
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startLeftSizeRef.current = panelSizes[leftPanel];
    startRightSizeRef.current = panelSizes[rightPanel];

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Add dragging class to body
    document.body.classList.add('panel-resizing');
  }, [panelSizes, leftPanel, rightPanel]);

  /**
   * Handle mouse move - resize panels
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const container = getContainer();
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const deltaX = e.clientX - startXRef.current;
    const deltaPercent = (deltaX / containerWidth) * 100;

    // Calculate new sizes
    let newLeftSize = startLeftSizeRef.current + deltaPercent;
    let newRightSize = startRightSizeRef.current - deltaPercent;

    // Clamp to min/max
    if (newLeftSize < minSize) {
      newLeftSize = minSize;
      newRightSize = startLeftSizeRef.current + startRightSizeRef.current - minSize;
    }
    if (newLeftSize > maxSize) {
      newLeftSize = maxSize;
      newRightSize = startLeftSizeRef.current + startRightSizeRef.current - maxSize;
    }
    if (newRightSize < minSize) {
      newRightSize = minSize;
      newLeftSize = startLeftSizeRef.current + startRightSizeRef.current - minSize;
    }
    if (newRightSize > maxSize) {
      newRightSize = maxSize;
      newLeftSize = startLeftSizeRef.current + startRightSizeRef.current - maxSize;
    }

    // Update store - use setPanelSize which handles normalization
    setPanelSize(leftPanel, newLeftSize);
  }, [getContainer, leftPanel, minSize, maxSize, setPanelSize]);

  /**
   * Handle mouse up - stop dragging
   */
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.classList.remove('panel-resizing');
  }, [handleMouseMove]);

  /**
   * Handle touch events for mobile support
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    isDraggingRef.current = true;
    startXRef.current = touch.clientX;
    startLeftSizeRef.current = panelSizes[leftPanel];
    startRightSizeRef.current = panelSizes[rightPanel];

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.body.classList.add('panel-resizing');
  }, [panelSizes, leftPanel, rightPanel]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const container = getContainer();
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const deltaX = touch.clientX - startXRef.current;
    const deltaPercent = (deltaX / containerWidth) * 100;

    let newLeftSize = startLeftSizeRef.current + deltaPercent;
    newLeftSize = Math.max(minSize, Math.min(maxSize, newLeftSize));

    setPanelSize(leftPanel, newLeftSize);
  }, [getContainer, leftPanel, minSize, maxSize, setPanelSize]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.body.classList.remove('panel-resizing');
  }, [handleTouchMove]);

  /**
   * Clean up event listeners on unmount
   */
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.classList.remove('panel-resizing');
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  /**
   * Handle keyboard navigation for accessibility
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1; // Larger steps with Shift

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setPanelSize(leftPanel, Math.max(minSize, panelSizes[leftPanel] - step));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setPanelSize(leftPanel, Math.min(maxSize, panelSizes[leftPanel] + step));
        break;
      case 'Home':
        e.preventDefault();
        setPanelSize(leftPanel, minSize);
        break;
      case 'End':
        e.preventDefault();
        setPanelSize(leftPanel, maxSize);
        break;
    }
  }, [leftPanel, minSize, maxSize, panelSizes, setPanelSize]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'panel-resizer',
        `panel-resizer--${orientation}`,
        className
      )}
      role="separator"
      aria-orientation={orientation}
      aria-valuenow={panelSizes[leftPanel]}
      aria-valuemin={minSize}
      aria-valuemax={maxSize}
      aria-label={`Resize ${leftPanel} and ${rightPanel} panels`}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
    >
      <div className="panel-resizer__handle">
        <div className="panel-resizer__grip" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default PanelResizer;
