/**
 * @fileoverview useDragDrop Hook - Main drag-drop functionality
 * @module presentation/hooks/useDragDrop
 *
 * EPIC-UXUI-04: Drag-Drop System (Story 6)
 * Provides comprehensive drag-drop functionality with HTML5 DnD API
 * and touch gesture support for mobile/tablet devices.
 *
 * Features:
 * - Drag from docker to activity bars
 * - Drag between activity bars
 * - Constraint enforcement (single instance, max 3 per bar)
 * - Visual feedback (ghost preview, drop zones)
 * - Touch support with long-press initiation
 *
 * @story UXUI-04-06
 * @created 2026-01-30
 */

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useActivityBarStore } from '@/infrastructure/persistence/stores/activity-bar';
import type { PluginId } from '@/domain/types/plugin-types';
// ActivityBarPosition is used via DropTargetPosition type alias
import { MAX_PLUGINS_PER_BAR } from '@/presentation/components/layout/activity-bar-types';
import type {
  DragData,
  DragItem,
  DragSource,
  DropTargetPosition,
  DropValidationResult,
  UseDragDropReturn,
  TouchGestureState,

  ConstraintViolation,
} from '@/presentation/components/layout/drag-drop-types';
import {
  DRAG_DATA_TYPE,
  DEFAULT_TOUCH_CONFIG,
} from '@/presentation/components/layout/drag-drop-types';
import type { DockerPluginDefinition } from '@/presentation/components/layout/docker-types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check constraint violation type
 */
/**
 * Map drop target position to state key
 */
function getStateKey(target: DropTargetPosition): 'left' | 'mainTop' | 'right' {
  return target === 'main-top' ? 'mainTop' : target;
}

function getConstraintViolation(
  pluginId: PluginId,
  target: DropTargetPosition,
  state: {
    left: { plugins: PluginId[] };
    mainTop: { plugins: PluginId[] };
    right: { plugins: PluginId[] };
  }
): ConstraintViolation {
  const stateKey = getStateKey(target);

  // Check if already in target bar
  const targetPlugins = state[stateKey].plugins;
  if (targetPlugins.includes(pluginId)) {
    return 'already-in-bar';
  }

  // Check if in another bar (single instance constraint)
  const allBars: Array<'left' | 'mainTop' | 'right'> = ['left', 'mainTop', 'right'];
  for (const bar of allBars) {
    if (bar !== stateKey && state[bar].plugins.includes(pluginId)) {
      return 'single-instance';
    }
  }

  // Check if target bar is full
  if (targetPlugins.length >= MAX_PLUGINS_PER_BAR) {
    return 'bar-full';
  }

  return 'none';
}

/**
 * Get human-readable constraint message
 */
function getConstraintMessage(violation: ConstraintViolation): string {
  switch (violation) {
    case 'already-in-bar':
      return 'Plugin is already in this bar';
    case 'single-instance':
      return 'Plugin can only be in one bar at a time';
    case 'bar-full':
      return `Bar is full (max ${MAX_PLUGINS_PER_BAR} plugins)`;
    case 'invalid-target':
      return 'Invalid drop target';
    default:
      return '';
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useDragDrop Hook
 *
 * Main hook for drag-drop functionality. Manages drag state,
 * validates drops against constraints, and executes drop operations.
 *
 * @example
 * ```tsx
 * const {
 *   isDragging,
 *   draggedItem,
 *   startDrag,
 *   endDrag,
 *   canDropOn,
 *   dropOn,
 * } = useDragDrop();
 *
 * // Start dragging
 * startDrag(plugin, 'docker');
 *
 * // Check if can drop
 * const result = canDropOn('left');
 * if (result.canDrop) {
 *   dropOn('left');
 * }
 * ```
 *
 * @returns Drag-drop state and actions
 */
export function useDragDrop(): UseDragDropReturn {
  // ============================================================================
  // Activity Bar State
  // ============================================================================

  const leftBar = useActivityBarStore(useShallow((state) => state.left));
  const mainTopBar = useActivityBarStore(useShallow((state) => state.mainTop));
  const rightBar = useActivityBarStore(useShallow((state) => state.right));

  const addPluginToBar = useActivityBarStore((state) => state.addPluginToBar);
  const movePlugin = useActivityBarStore((state) => state.movePlugin);

  // ============================================================================
  // Local State
  // ============================================================================

  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetPosition | null>(null);
  const [dropValidation, setDropValidation] = useState<DropValidationResult | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  // Refs for touch handling
  const touchStateRef = useRef<TouchGestureState>({
    isTouching: false,
    startPosition: null,
    currentPosition: null,
    isLongPress: false,
    longPressTimer: null,
  });

  const dragDataRef = useRef<DragData | null>(null);

  // ============================================================================
  // Current State Memo
  // ============================================================================

  const currentState = useMemo(
    () => ({
      left: leftBar,
      mainTop: mainTopBar,
      right: rightBar,
    }),
    [leftBar, mainTopBar, rightBar]
  );

  // ============================================================================
  // Drag Actions
  // ============================================================================

  /**
   * Start a drag operation
   */
  const startDrag = useCallback(
    (plugin: DockerPluginDefinition, source: DragSource, touch = false) => {
      const item: DragItem = {
        plugin,
        source,
      };

      const data: DragData = {
        pluginId: plugin.id,
        source,
        timestamp: Date.now(),
      };

      setIsDragging(true);
      setDraggedItem(item);
      setIsTouch(touch);
      dragDataRef.current = data;

      // Set initial position if touch
      if (touch && touchStateRef.current.currentPosition) {
        setPosition(touchStateRef.current.currentPosition);
      }
    },
    []
  );

  /**
   * End the current drag operation
   */
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropTarget(null);
    setDropValidation(null);
    setPosition(null);
    setIsTouch(false);
    dragDataRef.current = null;

    // Clear touch state
    const touchState = touchStateRef.current;
    if (touchState.longPressTimer) {
      window.clearTimeout(touchState.longPressTimer);
    }
    touchStateRef.current = {
      isTouching: false,
      startPosition: null,
      currentPosition: null,
      isLongPress: false,
      longPressTimer: null,
    };
  }, []);

  /**
   * Update drag position (for ghost preview)
   */
  const updatePosition = useCallback((x: number, y: number) => {
    setPosition({ x, y });
  }, []);

  // ============================================================================
  // Drop Validation
  // ============================================================================

  /**
   * Check if drop is allowed on a target
   */
  const canDropOn = useCallback(
    (target: DropTargetPosition): DropValidationResult => {
      if (!draggedItem) {
        return {
          canDrop: false,
          reason: 'No item being dragged',
          severity: 'error',
        };
      }

      const violation = getConstraintViolation(
        draggedItem.plugin.id,
        target,
        currentState
      );

      if (violation === 'none') {
        return {
          canDrop: true,
          severity: 'info',
        };
      }

      return {
        canDrop: false,
        reason: getConstraintMessage(violation),
        severity: violation === 'single-instance' ? 'warning' : 'error',
      };
    },
    [draggedItem, currentState]
  );

  // ============================================================================
  // Drop Execution
  // ============================================================================

  /**
   * Execute drop on target
   */
  const dropOn = useCallback(
    (target: DropTargetPosition): boolean => {
      if (!draggedItem) return false;

      const validation = canDropOn(target);
      if (!validation.canDrop) {
        return false;
      }

      const { plugin, source } = draggedItem;

      try {
        if (source === 'docker') {
          // Add from docker to bar
          return addPluginToBar(target, plugin.id);
        } else {
          // Move between bars
          movePlugin(plugin.id, source, target);
          return true;
        }
      } catch (error) {
        console.error('[useDragDrop] Drop failed:', error);
        return false;
      }
    },
    [draggedItem, canDropOn, addPluginToBar, movePlugin]
  );

  /**
   * Get drag data for dataTransfer
   */
  const getDragData = useCallback((): DragData | null => {
    return dragDataRef.current;
  }, []);

  // ============================================================================
  // Touch Gesture Handlers
  // ============================================================================

  /**
   * Handle touch start (initiates long-press detection)
   */
  const handleTouchStart = useCallback(
    (
      e: React.TouchEvent,
      plugin: DockerPluginDefinition,
      source: DragSource
    ) => {
      const touch = e.touches[0];
      const touchState = touchStateRef.current;

      touchState.isTouching = true;
      touchState.startPosition = { x: touch.clientX, y: touch.clientY };
      touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
      touchState.isLongPress = false;

      // Start long-press timer
      touchState.longPressTimer = window.setTimeout(() => {
        touchState.isLongPress = true;
        startDrag(plugin, source, true);
      }, DEFAULT_TOUCH_CONFIG.longPressDuration);
    },
    [startDrag]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const touchState = touchStateRef.current;

    touchState.currentPosition = { x: touch.clientX, y: touch.clientY };

    // Update position for ghost preview
    if (isDragging) {
      updatePosition(touch.clientX, touch.clientY);
    }

    // Cancel long press if moved too much
    if (touchState.startPosition && !isDragging) {
      const dx = touch.clientX - touchState.startPosition.x;
      const dy = touch.clientY - touchState.startPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > DEFAULT_TOUCH_CONFIG.moveThreshold) {
        if (touchState.longPressTimer) {
          window.clearTimeout(touchState.longPressTimer);
          touchState.longPressTimer = null;
        }
        touchState.isTouching = false;
      }
    }
  }, [isDragging, updatePosition]);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(() => {
    const touchState = touchStateRef.current;

    // Clear long-press timer
    if (touchState.longPressTimer) {
      window.clearTimeout(touchState.longPressTimer);
      touchState.longPressTimer = null;
    }

    // If dragging, end the drag
    if (isDragging) {
      endDrag();
    }

    touchState.isTouching = false;
    touchState.isLongPress = false;
  }, [isDragging, endDrag]);

  // ============================================================================
  // HTML5 Drag Handlers
  // ============================================================================

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (e: React.DragEvent, plugin: DockerPluginDefinition, source: DragSource) => {
      startDrag(plugin, source, false);

      // Set drag data
      const data: DragData = {
        pluginId: plugin.id,
        source,
        timestamp: Date.now(),
      };

      e.dataTransfer.setData(DRAG_DATA_TYPE, JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'move';

      // Set drag image if available
      if (e.dataTransfer.setDragImage) {
        const target = e.target as HTMLElement;
        if (target) {
          e.dataTransfer.setDragImage(target, 20, 20);
        }
      }
    },
    [startDrag]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      const touchState = touchStateRef.current;
      if (touchState.longPressTimer) {
        window.clearTimeout(touchState.longPressTimer);
      }
    };
  }, []);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    isDragging,
    draggedItem,
    dropTarget,
    dropValidation,
    position,
    isTouch,

    // Actions
    startDrag,
    endDrag,
    canDropOn,
    dropOn,
    getDragData,
    setDropTarget,

    // Touch handlers (exposed for components)
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // HTML5 drag handlers (exposed for components)
    handleDragStart,
    handleDragEnd,
  } as UseDragDropReturn;
}

// ============================================================================
// Additional Hooks
// ============================================================================

/**
 * Hook for drag source functionality
 */
export function useDragSource(
  plugin: DockerPluginDefinition,
  source: DragSource
) {
  const {
    isDragging,
    draggedItem,
    handleDragStart,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useDragDrop();

  const isCurrentDrag = draggedItem?.plugin.id === plugin.id;

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      handleDragStart(e, plugin, source);
    },
    [handleDragStart, plugin, source]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleTouchStart(e, plugin, source);
    },
    [handleTouchStart, plugin, source]
  );

  return {
    isDragging: isDragging && isCurrentDrag,
    dragHandlers: {
      onDragStart,
      onDragEnd: handleDragEnd,
      onTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      draggable: true,
    },
  };
}

/**
 * Hook for drop target functionality
 */
export function useDropTarget(target: DropTargetPosition) {
  const {
    isDragging,
    dropTarget,
    dropValidation,
    dropOn,
    setDropTarget,
  } = useDragDrop();

  const isOver = dropTarget === target;

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    []
  );

  const onDragEnter = useCallback(() => {
    setDropTarget(target);
  }, [setDropTarget, target]);

  const onDragLeave = useCallback(() => {
    setDropTarget(null);
  }, [setDropTarget]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dropOn(target);
      setDropTarget(null);
    },
    [dropOn, setDropTarget, target]
  );

  const state = useMemo(
    () => ({
      isOver,
      canDrop: dropValidation?.canDrop ?? false,
      validation: dropValidation,
    }),
    [isOver, dropValidation]
  );

  return {
    state,
    isActive: isDragging,
    dropHandlers: {
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
    },
  };
}
