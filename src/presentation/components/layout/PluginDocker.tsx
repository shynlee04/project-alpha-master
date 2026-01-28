/**
 * @fileoverview PluginDocker - Resizable Panel Container for Plugins
 * @module presentation/components/layout/PluginDocker
 *
 * **PLUGIN DOCKER COMPONENT**
 *
 * A resizable panel container that holds plugin content like FileTree, Search, etc.
 * Can appear on LEFT (200-320px) or RIGHT (250-400px) sides of the workspace.
 *
 * Layout position in WorkspaceLayout:
 * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐
 * │Global  │Activity│Plugin    │Main Content    │Plugin    │Activity│
 * │Sidebar │Bar LEFT│LEFT      │(Notes/Monaco)  │RIGHT     │Bar     │
 * │ 48px   │ 48px   │200-320px │   400px+       │250-400px │ 48px   │
 * └────────┴────────┴──────────┴────────────────┴──────────┴────────┘
 *
 * @epic EPIC-UXUI-01
 * @story UXUI-02-02b
 * @team Team B
 * @created 2026-01-28
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * PluginDocker Props
 */
export interface PluginDockerProps {
  /** Position of the docker - determines resize handle placement */
  position: 'left' | 'right';
  /** Minimum width in pixels */
  minWidth: number;
  /** Maximum width in pixels */
  maxWidth: number;
  /** Initial/default width */
  defaultWidth?: number;
  /** Whether the docker is visible */
  isOpen: boolean;
  /** Callback when width changes during resize */
  onResize?: (width: number) => void;
  /** Optional title for the header */
  title?: string;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Plugin content to render inside the docker */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Callback when a plugin is dropped into this docker */
  onPluginDrop?: (pluginId: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Default width for left docker */
const DEFAULT_LEFT_WIDTH = 240;
/** Default width for right docker */
const DEFAULT_RIGHT_WIDTH = 300;
/** Storage key prefix for persisting width */
const STORAGE_KEY_PREFIX = 'plugin-docker-width-';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the storage key for a given position
 */
function getStorageKey(position: 'left' | 'right'): string {
  return `${STORAGE_KEY_PREFIX}${position}`;
}

/**
 * Loads persisted width from localStorage
 */
function loadPersistedWidth(
  position: 'left' | 'right',
  defaultWidth: number,
  minWidth: number,
  maxWidth: number
): number {
  if (typeof window === 'undefined') return defaultWidth;
  
  try {
    const stored = localStorage.getItem(getStorageKey(position));
    if (stored) {
      const width = parseInt(stored, 10);
      if (!isNaN(width)) {
        return Math.max(minWidth, Math.min(maxWidth, width));
      }
    }
  } catch {
    // localStorage not available or error
  }
  return defaultWidth;
}

/**
 * Saves width to localStorage
 */
function savePersistedWidth(position: 'left' | 'right', width: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(position), width.toString());
  } catch {
    // localStorage not available
  }
}

// ============================================================================
// PluginDocker Component
// ============================================================================

/**
 * PluginDocker Component - Resizable Panel Container for Plugins
 *
 * @param props - PluginDockerProps
 * @returns Plugin docker JSX element
 *
 * @remarks
 * 8-Bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - 2px solid borders using CSS variables
 * - Resizable with 4px drag handle
 * - Collapsible with smooth transitions
 * - Width persistence in localStorage
 */
export function PluginDocker({
  position,
  minWidth,
  maxWidth,
  defaultWidth,
  isOpen,
  onResize,
  title,
  onClose,
  children,
  className = '',
  onPluginDrop,
}: PluginDockerProps) {
  // Calculate default width based on position
  const calculatedDefaultWidth = defaultWidth ?? (
    position === 'left' ? DEFAULT_LEFT_WIDTH : DEFAULT_RIGHT_WIDTH
  );
  
  // Load persisted width or use default
  const initialWidth = loadPersistedWidth(
    position,
    calculatedDefaultWidth,
    minWidth,
    maxWidth
  );
  
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const dockerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const dragEnterCountRef = useRef<number>(0);

  // Update width when defaultWidth prop changes
  useEffect(() => {
    if (defaultWidth !== undefined && defaultWidth !== width) {
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, defaultWidth));
      setWidth(clampedWidth);
    }
  }, [defaultWidth, minWidth, maxWidth]);

  /**
   * Handles the start of a resize operation
   * DEBUG: nested resizable - DISABLED to debug layout issues
   */
  const handleResizeStart = useCallback((_event: React.MouseEvent) => {
    // DEBUG: nested resizable - START
    // Temporarily disabled to test if this is causing layout issues
    console.log('[PluginDocker] Resize disabled for debugging');
    return; // Exit early - no resize
    
    // _event.preventDefault();
    // setIsResizing(true);
    // startXRef.current = _event.clientX;
    // startWidthRef.current = width;
    // 
    // // Add resizing class to body for cursor
    // document.body.classList.add('plugin-docker--resizing');
    // DEBUG: nested resizable - END
  }, [width]);

  /**
   * Handles resize movement
   */
  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = event.clientX - startXRef.current;
    let newWidth: number;
    
    if (position === 'left') {
      // For left docker: dragging right increases width
      newWidth = startWidthRef.current + deltaX;
    } else {
      // For right docker: dragging left increases width (negative delta)
      newWidth = startWidthRef.current - deltaX;
    }
    
    // Clamp to min/max constraints
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(newWidth);
    onResize?.(newWidth);
  }, [isResizing, position, minWidth, maxWidth, onResize]);

  /**
   * Handles the end of a resize operation
   */
  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      document.body.classList.remove('plugin-docker--resizing');
      // Persist the final width
      savePersistedWidth(position, width);
    }
  }, [isResizing, position, width]);

  // Attach global mouse events during resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // ============================================================================
  // Drag-and-Drop Handlers
  // ============================================================================

  /**
   * Handles drag over - must call preventDefault to allow drop
   * Only highlights if dragging from OPPOSITE position (cross-panel drop)
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handles drag enter - tracks nested enters for proper highlight
   * Uses a counter to handle child element enters
   */
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    dragEnterCountRef.current++;
    
    // Show highlight (will verify source on drop)
    // Note: We can't read dataTransfer data during dragenter in HTML5 DnD API
    if (dragEnterCountRef.current === 1) {
      setIsDropTarget(true);
    }
  }, []);

  /**
   * Handles drag leave - decrements counter and removes highlight when fully left
   */
  const handleDragLeave = useCallback(() => {
    dragEnterCountRef.current--;
    
    if (dragEnterCountRef.current === 0) {
      setIsDropTarget(false);
    }
  }, []);

  /**
   * Handles drop - receives pluginId and calls onPluginDrop
   * Only accepts drops from OPPOSITE position panel
   */
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    // Reset drop target state
    dragEnterCountRef.current = 0;
    setIsDropTarget(false);
    
    const pluginId = event.dataTransfer.getData('pluginId');
    const sourcePosition = event.dataTransfer.getData('sourcePosition');
    
    if (!pluginId) return;
    
    // Only process if source position is different (cross-panel drop)
    if (sourcePosition !== position) {
      onPluginDrop?.(pluginId);
    }
  }, [position, onPluginDrop]);

  // Determine position-specific classes
  const positionClass = `plugin-docker--${position}`;
  const stateClass = isOpen ? 'plugin-docker--open' : 'plugin-docker--closed';
  const resizingClass = isResizing ? 'plugin-docker--resizing' : '';
  const dropTargetClass = isDropTarget ? 'plugin-docker--drop-target' : '';

  return (
    <div
      ref={dockerRef}
      className={`plugin-docker ${positionClass} ${stateClass} ${resizingClass} ${dropTargetClass} ${className}`}
      style={{
        width: isOpen ? width : 0,
        minWidth: isOpen ? minWidth : 0,
        maxWidth: isOpen ? maxWidth : 0,
      }}
      aria-hidden={!isOpen}
      onDragOver={isOpen ? handleDragOver : undefined}
      onDragEnter={isOpen ? handleDragEnter : undefined}
      onDragLeave={isOpen ? handleDragLeave : undefined}
      onDrop={isOpen ? handleDrop : undefined}
    >
      {/* Resize Handle */}
      <div
        className="plugin-docker__resize-handle"
        onMouseDown={handleResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${position} panel`}
        tabIndex={isOpen ? 0 : -1}
        onKeyDown={(e) => {
          if (!isOpen) return;
          
          // Keyboard resize support
          const step = 20;
          let newWidth = width;
          
          if (position === 'left') {
            if (e.key === 'ArrowRight') newWidth = Math.min(maxWidth, width + step);
            if (e.key === 'ArrowLeft') newWidth = Math.max(minWidth, width - step);
          } else {
            if (e.key === 'ArrowLeft') newWidth = Math.min(maxWidth, width + step);
            if (e.key === 'ArrowRight') newWidth = Math.max(minWidth, width - step);
          }
          
          if (newWidth !== width) {
            setWidth(newWidth);
            onResize?.(newWidth);
            savePersistedWidth(position, newWidth);
          }
        }}
      />
      
      {/* Content Container */}
      <div className="plugin-docker__content">
        {/* Optional Header */}
        {(title || onClose) && (
          <div className="plugin-docker__header">
            {title && (
              <h3 className="plugin-docker__title">{title}</h3>
            )}
            {onClose && (
              <button
                type="button"
                className="plugin-docker__close-btn"
                onClick={onClose}
                aria-label="Close panel"
                title="Close panel"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {/* Plugin Content */}
        <div className="plugin-docker__body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default PluginDocker;
