/**
 * @fileoverview Drag-Drop Types - Type definitions for drag-drop system
 * @module presentation/components/layout/drag-drop-types
 *
 * EPIC-UXUI-04: Drag-Drop System (Story 6)
 * Provides comprehensive type definitions for the drag-drop functionality
 * including drag sources, drop targets, constraints, and visual feedback.
 *
 * @story UXUI-04-06
 * @created 2026-01-30
 */

import type { ReactNode } from 'react';
import type { PluginId } from '@/domain/types/plugin-types';
import type { ActivityBarPosition } from './activity-bar-types';
import type { DockerPluginDefinition } from './docker-types';

// ============================================================================
// Drag Source Types
// ============================================================================

/**
 * Source of a drag operation
 */
export type DragSource = 'docker' | ActivityBarPosition;

/**
 * Data transferred during drag operation
 */
export interface DragData {
  /** Plugin being dragged */
  pluginId: PluginId;
  /** Source location */
  source: DragSource;
  /** Timestamp for drag initiation */
  timestamp: number;
}

/**
 * Drag item metadata
 */
export interface DragItem {
  /** Plugin definition */
  plugin: DockerPluginDefinition;
  /** Source location */
  source: DragSource;
  /** Element being dragged (for positioning) */
  element?: HTMLElement;
}

// ============================================================================
// Drop Target Types
// ============================================================================

/**
 * Drop target position
 */
export type DropTargetPosition = ActivityBarPosition;

/**
 * Result of a drop validation check
 */
export interface DropValidationResult {
  /** Whether the drop is allowed */
  canDrop: boolean;
  /** Reason if drop is not allowed */
  reason?: string;
  /** Severity of the constraint violation */
  severity: 'error' | 'warning' | 'info';
}

/**
 * Drop target state
 */
export interface DropTargetState {
  /** Whether drag is currently over this target */
  isOver: boolean;
  /** Whether drop is allowed at current position */
  canDrop: boolean;
  /** Validation result for current drag */
  validation: DropValidationResult | null;
}

// ============================================================================
// Drag State Types
// ============================================================================

/**
 * Complete drag-drop state
 */
export interface DragDropState {
  /** Whether a drag operation is in progress */
  isDragging: boolean;
  /** Item being dragged */
  draggedItem: DragItem | null;
  /** Current drop target (if any) */
  dropTarget: DropTargetPosition | null;
  /** Current drop validation result */
  dropValidation: DropValidationResult | null;
  /** Drag position (for ghost preview) */
  position: { x: number; y: number } | null;
  /** Whether using touch (vs mouse) */
  isTouch: boolean;
}

/**
 * Drag-drop actions
 */
export interface DragDropActions {
  /** Start a drag operation */
  startDrag: (item: DragItem, isTouch?: boolean) => void;
  /** End the current drag operation */
  endDrag: () => void;
  /** Update drag position (for ghost preview) */
  updatePosition: (x: number, y: number) => void;
  /** Set the current drop target */
  setDropTarget: (target: DropTargetPosition | null) => void;
  /** Validate a potential drop */
  validateDrop: (target: DropTargetPosition) => DropValidationResult;
  /** Execute a drop operation */
  executeDrop: (target: DropTargetPosition) => boolean;
}

/**
 * Combined drag-drop state and actions
 */
export type DragDropContextValue = DragDropState & DragDropActions;

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useDragDrop hook
 */
export interface UseDragDropReturn extends DragDropState {
  /** Start dragging from a source */
  startDrag: (plugin: DockerPluginDefinition, source: DragSource) => void;
  /** End current drag */
  endDrag: () => void;
  /** Check if drop is allowed on a target */
  canDropOn: (target: DropTargetPosition) => DropValidationResult;
  /** Execute drop on target */
  dropOn: (target: DropTargetPosition) => boolean;
  /** Get drag data for dataTransfer */
  getDragData: () => DragData | null;
  /** Set current drop target */
  setDropTarget: (target: DropTargetPosition | null) => void;
  /** HTML5 drag start handler */
  handleDragStart: (e: React.DragEvent, plugin: DockerPluginDefinition, source: DragSource) => void;
  /** HTML5 drag end handler */
  handleDragEnd: () => void;
  /** Touch start handler */
  handleTouchStart: (e: React.TouchEvent, plugin: DockerPluginDefinition, source: DragSource) => void;
  /** Touch move handler */
  handleTouchMove: (e: React.TouchEvent) => void;
  /** Touch end handler */
  handleTouchEnd: () => void;
}

/**
 * Return type for useDragSource hook
 */
export interface UseDragSourceReturn {
  /** Whether this source is currently being dragged */
  isDragging: boolean;
  /** Drag handlers to attach to element */
  dragHandlers: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    draggable: boolean;
  };
}

/**
 * Return type for useDropTarget hook
 */
export interface UseDropTargetReturn {
  /** Current drop target state */
  state: DropTargetState;
  /** Drop handlers to attach to element */
  dropHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: () => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for DragPreview component
 */
export interface DragPreviewProps {
  /** Custom class name */
  className?: string;
}

/**
 * Props for DropZone component
 */
export interface DropZoneProps {
  /** Target position for this drop zone */
  target: DropTargetPosition;
  /** Children to render inside drop zone */
  children: ReactNode;
  /** Custom class name */
  className?: string;
  /** Whether to show drop indicator even when not dragging */
  alwaysShowIndicator?: boolean;
}

/**
 * Props for DragProvider component
 */
export interface DragProviderProps {
  /** Child components */
  children: ReactNode;
}

// ============================================================================
// Constraint Types
// ============================================================================

/**
 * Constraint check function type
 */
export type ConstraintCheck = (
  pluginId: PluginId,
  target: DropTargetPosition,
  currentState: {
    left: PluginId[];
    mainTop: PluginId[];
    right: PluginId[];
  }
) => DropValidationResult;

/**
 * Constraint violation types
 */
export type ConstraintViolation =
  | 'already-in-bar'
  | 'bar-full'
  | 'single-instance'
  | 'invalid-target'
  | 'none';

// ============================================================================
// Touch Gesture Types
// ============================================================================

/**
 * Touch gesture state
 */
export interface TouchGestureState {
  /** Whether touch is active */
  isTouching: boolean;
  /** Start position */
  startPosition: { x: number; y: number } | null;
  /** Current position */
  currentPosition: { x: number; y: number } | null;
  /** Whether long press has been detected */
  isLongPress: boolean;
  /** Timer ID for long press detection */
  longPressTimer: number | null;
}

/**
 * Touch gesture configuration
 */
export interface TouchGestureConfig {
  /** Long press duration in ms */
  longPressDuration: number;
  /** Movement threshold in pixels */
  moveThreshold: number;
  /** Whether to prevent scroll while dragging */
  preventScroll: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default touch gesture configuration
 */
export const DEFAULT_TOUCH_CONFIG: TouchGestureConfig = {
  longPressDuration: 500,
  moveThreshold: 10,
  preventScroll: true,
};

/**
 * Drag data transfer type
 */
export const DRAG_DATA_TYPE = 'application/x-plugin-drag';

/**
 * CSS classes for drag states
 */
export const DRAG_CSS_CLASSES = {
  dragging: 'dragging',
  dragOver: 'drag-over',
  canDrop: 'can-drop',
  cannotDrop: 'cannot-drop',
  dropZone: 'drop-zone',
  dropZoneActive: 'drop-zone--active',
  dropZoneValid: 'drop-zone--valid',
  dropZoneInvalid: 'drop-zone--invalid',
  ghost: 'drag-ghost',
  touchDragging: 'touch-dragging',
} as const;

/**
 * Animation durations (ms)
 */
export const DRAG_ANIMATION = {
  dragStart: 150,
  dragEnd: 200,
  dropSuccess: 300,
  dropFail: 400,
  shake: 500,
} as const;
