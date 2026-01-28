/**
 * @fileoverview FloatingPluginDocker - Floating Plugin Management Panel
 * @module presentation/components/layout/FloatingPluginDocker
 *
 * **UXUI-03-05**: Create Floating Plugin Docker
 *
 * A floating panel that provides centralized plugin management.
 * Displays ALL registered plugins with placement indicators.
 * Draggable header for repositioning within viewport.
 *
 * Key Features:
 * - Fixed position: bottom-right (80px from bottom, 24px from right)
 * - Toggle via Cmd+Shift+P keyboard shortcut
 * - 4-column grid of all plugins
 * - Shows placement badges (L/M/R) for placed plugins
 * - Draggable header to reposition
 * - Minimize/close buttons
 * - 8-bit design compliance (sharp corners, pixel shadows)
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-05
 * @team Team A
 * @created 2026-01-28
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Minus, GripHorizontal } from 'lucide-react';
import { PLUGIN_IDS, type PluginId } from '@/domain/types/plugin-types';
import type { PanelPosition } from '@/presentation/hooks/usePluginPlacement';
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * FloatingPluginDocker Props
 */
export interface FloatingPluginDockerProps {
  /** Map of plugin IDs to their current panel positions */
  placements: Map<PluginId, PanelPosition>;
  /** Callback when plugin is clicked (to open/move it) */
  onPluginClick: (pluginId: PluginId, defaultPanel: 'left' | 'main' | 'right') => void;
  /** Whether the docker is visible */
  isOpen: boolean;
  /** Toggle visibility callback */
  onClose: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * Position state for draggable docker
 */
interface DragPosition {
  x: number;
  y: number;
}

// ============================================================================
// Constants
// ============================================================================

// DEBUG PHASE 2: Plugins to DISABLE for testing
const DEBUG_DISABLED_DOCKER_PLUGINS: PluginId[] = ['notes', 'chat'];

// DEBUG PHASE 2: Filter out disabled plugins
const DEBUG_ENABLED_PLUGIN_IDS = PLUGIN_IDS.filter(
  (id) => !DEBUG_DISABLED_DOCKER_PLUGINS.includes(id)
);

/** Default position (bottom-right) */
const DEFAULT_POSITION = {
  x: typeof window !== 'undefined' ? window.innerWidth - 304 : 1000,
  y: typeof window !== 'undefined' ? window.innerHeight - 280 : 600,
};

/** Storage key for persisted position */
const STORAGE_KEY = 'floating-docker-position';

/** Default panel assignment for each plugin */
const DEFAULT_PLUGIN_PANELS: Record<PluginId, 'left' | 'main' | 'right'> = {
  filetree: 'left',
  notes: 'main',
  monaco: 'main',
  preview: 'main',
  terminal: 'right',
  chat: 'right',
  agents: 'right',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate and constrain position to viewport bounds
 * Handles NaN, null, undefined, and out-of-bounds values
 */
function validatePosition(pos: Partial<DragPosition> | null | undefined): DragPosition {
  if (typeof window === 'undefined') return DEFAULT_POSITION;
  
  const maxX = window.innerWidth - 280; // Docker width
  const maxY = window.innerHeight - 200; // Minimum visible height
  
  // Handle NaN, null, undefined, and out-of-bounds
  const x = typeof pos?.x === 'number' && !Number.isNaN(pos.x)
    ? Math.max(0, Math.min(pos.x, maxX))
    : Math.max(0, maxX - 24); // Default: 24px from right edge
    
  const y = typeof pos?.y === 'number' && !Number.isNaN(pos.y)
    ? Math.max(0, Math.min(pos.y, maxY))
    : Math.max(0, maxY - 80); // Default: 80px from bottom
  
  return { x, y };
}

/**
 * Load persisted position from localStorage
 * Returns validated position, falling back to safe defaults
 */
function loadPersistedPosition(): DragPosition {
  if (typeof window === 'undefined') return DEFAULT_POSITION;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return validatePosition(parsed);
    }
  } catch {
    // localStorage not available or parse error - clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup failure
    }
  }
  return validatePosition(null);
}

/**
 * Save position to localStorage
 */
function savePersistedPosition(position: DragPosition): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // localStorage not available
  }
}

/**
 * Get placement badge text
 */
function getPlacementBadge(placement: PanelPosition): string | null {
  switch (placement) {
    case 'left':
      return 'L';
    case 'main':
      return 'M';
    case 'right':
      return 'R';
    default:
      return null;
  }
}

/**
 * Get plugin display name
 */
function getPluginDisplayName(pluginId: PluginId): string {
  const plugin = getPlugin(pluginId);
  if (plugin?.name) return plugin.name;

  // Fallback display names
  const names: Record<PluginId, string> = {
    filetree: 'Files',
    monaco: 'Code',
    notes: 'Notes',
    terminal: 'Terminal',
    chat: 'Chat',
    agents: 'Agents',
    preview: 'Preview',
  };
  return names[pluginId] || pluginId;
}

/**
 * Get plugin icon component
 */
function getPluginIcon(pluginId: PluginId): React.ReactNode {
  const plugin = getPlugin(pluginId);
  if (plugin?.icon) {
    return plugin.icon;
  }

  // Fallback: use first letter
  return (
    <span className="floating-docker__icon-fallback">
      {pluginId.charAt(0).toUpperCase()}
    </span>
  );
}

// ============================================================================
// FloatingPluginDocker Component
// ============================================================================

/**
 * FloatingPluginDocker Component
 *
 * @param props - FloatingPluginDockerProps
 * @returns Floating plugin management panel
 *
 * @remarks
 * 8-Bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - Pixel shadow (4px 4px 0 0)
 * - Solid borders (2px)
 * - No glassmorphism or blur effects
 */
export function FloatingPluginDocker({
  placements,
  onPluginClick,
  isOpen,
  onClose,
  className = '',
}: FloatingPluginDockerProps) {
  // ========================================================================
  // State
  // ========================================================================

  const [position, setPosition] = useState<DragPosition>(loadPersistedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragPosition>({ x: 0, y: 0 });
  
  const dockerRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // Calculate unplaced plugins count (DEBUG: Only count enabled plugins)
  // ========================================================================

  const unplacedCount = DEBUG_ENABLED_PLUGIN_IDS.filter((id) => {
    const placement = placements.get(id);
    return placement === null || placement === undefined;
  }).length;

  // ========================================================================
  // Drag Handlers
  // ========================================================================

  /**
   * Start dragging from header
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.body.classList.add('floating-docker--dragging');
  }, [position]);

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - (isMinimized ? 40 : 200);

    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY)),
    });
  }, [isDragging, dragOffset, isMinimized]);

  /**
   * End drag operation
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.classList.remove('floating-docker--dragging');
      // Persist position
      savePersistedPosition(position);
    }
  }, [isDragging, position]);

  // Attach global mouse events during drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ========================================================================
  // Keyboard Handler (Escape to close)
  // ========================================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ========================================================================
  // Reset position on window resize
  // ========================================================================

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => validatePosition(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  if (!isOpen) return null;

  return (
    <div
      ref={dockerRef}
      className={`floating-docker ${isMinimized ? 'floating-docker--minimized' : ''} ${isDragging ? 'floating-docker--dragging' : ''} ${className}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      role="dialog"
      aria-label="Plugin Docker"
      aria-hidden={!isOpen}
    >
      {/* Header (Draggable) */}
      <div
        className="floating-docker__header"
        onMouseDown={handleMouseDown}
        role="toolbar"
        aria-label="Plugin Docker Controls"
      >
        <div className="floating-docker__title">
          <GripHorizontal size={14} className="floating-docker__grip" />
          <span>
            {unplacedCount > 0
              ? `${unplacedCount} UNPLACED`
              : 'ALL PLACED'}
          </span>
        </div>
        <div className="floating-docker__controls">
          <button
            type="button"
            className="floating-docker__btn"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand docker' : 'Minimize docker'}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="floating-docker__btn floating-docker__btn--close"
            onClick={onClose}
            aria-label="Close docker"
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content (Hidden when minimized) */}
      {!isMinimized && (
        <div className="floating-docker__content">
          <div className="floating-docker__grid">
            {PLUGIN_IDS.map((pluginId) => {
              const placement = placements.get(pluginId);
              const badge = getPlacementBadge(placement ?? null);
              const isPlaced = placement !== null && placement !== undefined;
              const defaultPanel = DEFAULT_PLUGIN_PANELS[pluginId];

              return (
                <button
                  key={pluginId}
                  type="button"
                  className={`floating-docker__item ${isPlaced ? 'floating-docker__item--placed' : ''}`}
                  onClick={() => onPluginClick(pluginId, defaultPanel)}
                  aria-label={`${getPluginDisplayName(pluginId)}${badge ? ` (${badge})` : ''}`}
                  title={`${getPluginDisplayName(pluginId)}${badge ? ` - Panel ${badge}` : ' - Click to place'}`}
                >
                  <div className="floating-docker__item-icon">
                    {getPluginIcon(pluginId)}
                  </div>
                  <span className="floating-docker__item-label">
                    {getPluginDisplayName(pluginId)}
                  </span>
                  {badge && (
                    <span className="floating-docker__badge">{badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Help text */}
          <div className="floating-docker__help">
            Click to toggle • Cmd+Shift+P to hide
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default FloatingPluginDocker;
