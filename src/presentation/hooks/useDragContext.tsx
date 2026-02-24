/**
 * @fileoverview useDragContext - React Context for drag-drop system
 * @module presentation/hooks/useDragContext
 *
 * EPIC-UXUI-04: Drag-Drop System (Story 6)
 * Provides React Context for sharing drag-drop state across the component tree.
 * This allows multiple components to access and control drag-drop operations
 * without prop drilling.
 *
 * Features:
 * - Centralized drag-drop state management
 * - Context provider for app-wide drag-drop
 * - Hook for consuming drag-drop context
 * - Optimized re-renders with context splitting
 *
 * @story UXUI-04-06
 * @created 2026-01-30
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useActivityBarStore } from '@/infrastructure/persistence/stores/activity-bar';
import type { PluginId } from '@/domain/types/plugin-types';
import type {
  DragItem,
  DragSource,
  DropTargetPosition,
  DropValidationResult,
  DragProviderProps,
  TouchGestureState,
} from '@/presentation/components/layout/drag-drop-types';
import {
  DRAG_DATA_TYPE,
  DEFAULT_TOUCH_CONFIG,
} from '@/presentation/components/layout/drag-drop-types';
import { MAX_PLUGINS_PER_BAR } from '@/presentation/components/layout/activity-bar-types';
import type { DockerPluginDefinition } from '@/presentation/components/layout/docker-types';

// ============================================================================
// Context Type
// ============================================================================

/**
 * Drag context value type
 */
interface DragContextValue {
  // State
  isDragging: boolean;
  draggedItem: DragItem | null;
  dropTarget: DropTargetPosition | null;
  dropValidation: DropValidationResult | null;
  position: { x: number; y: number } | null;
  isTouch: boolean;

  // Actions
  startDrag: (plugin: DockerPluginDefinition, source: DragSource) => void;
  endDrag: () => void;
  setDropTarget: (target: DropTargetPosition | null) => void;
  canDropOn: (target: DropTargetPosition) => DropValidationResult;
  dropOn: (target: DropTargetPosition) => boolean;

  // Handlers for components
  handleDragStart: (e: React.DragEvent, plugin: DockerPluginDefinition, source: DragSource) => void;
  handleDragEnd: () => void;
  handleTouchStart: (e: React.TouchEvent, plugin: DockerPluginDefinition, source: DragSource) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Drag context
 */
const DragContext = createContext<DragContextValue | null>(null);

/**
 * Hook to use drag context
 * @throws Error if used outside of DragProvider
 */
export function useDragContext(): DragContextValue {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if drop is allowed
 */
function checkCanDrop(
  pluginId: PluginId,
  target: DropTargetPosition,
  state: {
    left: { plugins: PluginId[] };
    mainTop: { plugins: PluginId[] };
    right: { plugins: PluginId[] };
  }
): DropValidationResult {
  const stateKey = target === 'main-top' ? 'mainTop' : target;
  const targetPlugins = state[stateKey].plugins;

  // Check if already in target bar
  if (targetPlugins.includes(pluginId)) {
    return {
      canDrop: false,
      reason: 'Plugin is already in this bar',
      severity: 'warning',
    };
  }

  // Check if in another bar (single instance)
  const allBars: Array<'left' | 'mainTop' | 'right'> = ['left', 'mainTop', 'right'];
  for (const bar of allBars) {
    if (bar !== stateKey && state[bar].plugins.includes(pluginId)) {
      return {
        canDrop: false,
        reason: 'Plugin can only be in one bar at a time',
        severity: 'warning',
      };
    }
  }

  // Check if bar is full
  if (targetPlugins.length >= MAX_PLUGINS_PER_BAR) {
    return {
      canDrop: false,
      reason: `Bar is full (max ${MAX_PLUGINS_PER_BAR} plugins)`,
      severity: 'error',
    };
  }

  return {
    canDrop: true,
    severity: 'info',
  };
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * DragProvider Component
 *
 * Provides drag-drop context to child components. Wraps the application
 * or a section that needs drag-drop functionality.
 *
 * @example
 * ```tsx
 * <DragProvider>
 *   <App />
 * </DragProvider>
 * ```
 *
 * @param props - Component props
 * @returns React component
 */
export const DragProvider: React.FC<DragProviderProps> = ({ children }) => {
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
  const [dropTarget, setDropTargetState] = useState<DropTargetPosition | null>(null);
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
  // Actions
  // ============================================================================

  /**
   * Start drag operation
   */
  const startDrag = useCallback(
    (plugin: DockerPluginDefinition, source: DragSource, touch = false) => {
      const item: DragItem = {
        plugin,
        source,
      };

      setIsDragging(true);
      setDraggedItem(item);
      setIsTouch(touch);

      if (touch && touchStateRef.current.currentPosition) {
        setPosition(touchStateRef.current.currentPosition);
      }
    },
    []
  );

  /**
   * End drag operation
   */
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropTargetState(null);
    setDropValidation(null);
    setPosition(null);
    setIsTouch(false);

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
   * Set drop target with validation
   */
  const setDropTarget = useCallback(
    (target: DropTargetPosition | null) => {
      setDropTargetState(target);
      if (target && draggedItem) {
        setDropValidation(checkCanDrop(draggedItem.plugin.id, target, currentState));
      } else {
        setDropValidation(null);
      }
    },
    [draggedItem, currentState]
  );

  /**
   * Check if can drop on target
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
      return checkCanDrop(draggedItem.plugin.id, target, currentState);
    },
    [draggedItem, currentState]
  );

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
          return addPluginToBar(target, plugin.id);
        } else {
          movePlugin(plugin.id, source, target);
          return true;
        }
      } catch (error) {
        console.error('[DragContext] Drop failed:', error);
        return false;
      }
    },
    [draggedItem, canDropOn, addPluginToBar, movePlugin]
  );

  // ============================================================================
  // Touch Handlers
  // ============================================================================

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, plugin: DockerPluginDefinition, source: DragSource) => {
      const touch = e.touches[0];
      const touchState = touchStateRef.current;

      touchState.isTouching = true;
      touchState.startPosition = { x: touch.clientX, y: touch.clientY };
      touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
      touchState.isLongPress = false;

      touchState.longPressTimer = window.setTimeout(() => {
        touchState.isLongPress = true;
        startDrag(plugin, source, true);
      }, DEFAULT_TOUCH_CONFIG.longPressDuration);
    },
    [startDrag]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const touchState = touchStateRef.current;

    touchState.currentPosition = { x: touch.clientX, y: touch.clientY };

    if (isDragging) {
      setPosition({ x: touch.clientX, y: touch.clientY });
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
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    const touchState = touchStateRef.current;

    if (touchState.longPressTimer) {
      window.clearTimeout(touchState.longPressTimer);
      touchState.longPressTimer = null;
    }

    if (isDragging) {
      endDrag();
    }

    touchState.isTouching = false;
    touchState.isLongPress = false;
  }, [isDragging, endDrag]);

  // ============================================================================
  // HTML5 Drag Handlers
  // ============================================================================

  const handleDragStart = useCallback(
    (e: React.DragEvent, plugin: DockerPluginDefinition, source: DragSource) => {
      startDrag(plugin, source, false);

      e.dataTransfer.setData(
        DRAG_DATA_TYPE,
        JSON.stringify({
          pluginId: plugin.id,
          source,
          timestamp: Date.now(),
        })
      );
      e.dataTransfer.effectAllowed = 'move';

      if (e.dataTransfer.setDragImage) {
        const target = e.target as HTMLElement;
        if (target) {
          e.dataTransfer.setDragImage(target, 20, 20);
        }
      }
    },
    [startDrag]
  );

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      const touchState = touchStateRef.current;
      if (touchState.longPressTimer) {
        window.clearTimeout(touchState.longPressTimer);
      }
    };
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo(
    () => ({
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
      setDropTarget,
      canDropOn,
      dropOn,

      // Handlers
      handleDragStart,
      handleDragEnd,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }),
    [
      isDragging,
      draggedItem,
      dropTarget,
      dropValidation,
      position,
      isTouch,
      startDrag,
      endDrag,
      setDropTarget,
      canDropOn,
      dropOn,
      handleDragStart,
      handleDragEnd,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    ]
  );

  return (
    <DragContext.Provider value={value}>
      {children}
    </DragContext.Provider>
  );
};

export default DragProvider;
