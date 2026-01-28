/**
 * @fileoverview ActivityBar - 48px Vertical Activity Bar Component
 * @module presentation/components/layout/ActivityBar
 *
 * **ACTIVITY BAR COMPONENT**
 *
 * A 48px wide vertical bar that can appear on LEFT and RIGHT sides
 * of the workspace. Contains icon buttons with tooltips and optional
 * notification badges.
 *
 * Layout position in WorkspaceLayout:
 * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐
 * │Global  │Activity│Plugin    │Main Content    │Plugin    │Activity│
 * │Sidebar │Bar LEFT│LEFT      │(Notes/Monaco)  │RIGHT     │Bar     │
 * │ 48px   │ 48px   │200-320px │   400px+       │250-400px │ 48px   │
 * └────────┴────────┴──────────┴────────────────┴──────────┴────────┘
 *
 * @epic EPIC-UXUI-01
 * @story UXUI-03-14
 * @team Team B
 * @created 2026-01-28
 * @updated 2026-01-28
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * ActivityBarItem - Individual item configuration for the ActivityBar
 */
export interface ActivityBarItem {
  /** Unique identifier for the item */
  id: string;
  /** Icon to display - can be a React node or Lucide icon name */
  icon: ReactNode | string;
  /** Label text for tooltip/aria-label */
  label: string;
  /** Optional notification badge count */
  badge?: number;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * ActivityBar Props
 */
export interface ActivityBarProps {
  /** Position of the activity bar - determines border styling */
  position: 'left' | 'right';
  /** Array of items to display in the activity bar */
  items: ActivityBarItem[];
  /** Currently active item id */
  activeItem?: string;
  /** Callback when an item is clicked */
  onItemClick?: (id: string) => void;
  /** Additional CSS class names */
  className?: string;
  /** Enable drag-and-drop for items (default: false) */
  draggable?: boolean;
  /** Callback when an item drag starts */
  onDragStart?: (id: string) => void;
  /** Callback when an item drag ends */
  onDragEnd?: (id: string) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Renders an icon from the item configuration
 * If icon is a string, it renders a span with the icon name (for Lucide integration)
 * If icon is a ReactNode, it renders directly
 */
function renderIcon(icon: ReactNode | string): ReactNode {
  if (typeof icon === 'string') {
    // String icons are treated as Lucide icon names or emoji
    // In a real implementation, this would use a Lucide icon component
    return <span className="activity-bar__icon-text">{icon}</span>;
  }
  return icon;
}

/**
 * Formats badge number for display
 * Shows "9+" for numbers greater than 9
 */
function formatBadge(badge: number): string {
  if (badge > 9) return '9+';
  return badge.toString();
}

// ============================================================================
// ActivityBar Component
// ============================================================================

/**
 * ActivityBar Component - 48px Vertical Activity Bar
 *
 * @param props - ActivityBarProps
 * @returns Activity bar JSX element
 *
 * @remarks
 * 8-Bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - 2px solid borders using CSS variables
 * - 48x48px button sizes
 * - Active state with primary color background
 * - Hover state with muted background
 * - Badge support with red/orange indicator
 * - Drag-and-drop support for plugin panel reordering
 */
export function ActivityBar({
  position,
  items,
  activeItem,
  onItemClick,
  className = '',
  draggable = false,
  onDragStart,
  onDragEnd,
}: ActivityBarProps) {
  // Track which item is being dragged
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const positionClass = `activity-bar--${position}`;

  const handleItemClick = (id: string, disabled?: boolean) => {
    if (disabled) return;
    onItemClick?.(id);
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string, disabled?: boolean) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onItemClick?.(id);
    }
  };

  /**
   * Handles the start of a drag operation
   * Sets the data transfer with plugin id and effect
   */
  const handleDragStart = (event: React.DragEvent, id: string) => {
    event.dataTransfer.setData('pluginId', id);
    event.dataTransfer.setData('sourcePosition', position);
    event.dataTransfer.effectAllowed = 'move';
    
    // Set dragging state
    setDraggingId(id);
    onDragStart?.(id);
  };

  /**
   * Handles the end of a drag operation
   * Cleans up dragging state
   */
  const handleDragEnd = (id: string) => {
    setDraggingId(null);
    onDragEnd?.(id);
  };

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={0}>
      <nav
        className={`activity-bar ${positionClass} ${className}`}
        role="toolbar"
        aria-label={`Activity bar ${position}`}
      >
        <div className="activity-bar__content">
          {items.map((item) => {
          const isActive = activeItem === item.id;
          const isDragging = draggingId === item.id;
          const itemClasses = [
            'activity-bar__item',
            isActive && 'activity-bar__item--active',
            item.disabled && 'activity-bar__item--disabled',
            isDragging && 'activity-bar__item--dragging',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Tooltip.Root key={item.id} delayDuration={300}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  className={itemClasses}
                  onClick={() => handleItemClick(item.id, item.disabled)}
                  onKeyDown={(e) => handleKeyDown(e, item.id, item.disabled)}
                  disabled={item.disabled}
                  aria-pressed={isActive}
                  aria-label={item.label}
                  // Drag-and-drop attributes
                  draggable={draggable && !item.disabled}
                  onDragStart={draggable ? (e) => handleDragStart(e, item.id) : undefined}
                  onDragEnd={draggable ? () => handleDragEnd(item.id) : undefined}
                >
                  <span className="activity-bar__icon">
                    {renderIcon(item.icon)}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="activity-bar__badge">
                      {formatBadge(item.badge)}
                    </span>
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className={cn(
                    // Base styles
                    'z-50 px-3 py-1.5 text-xs font-mono',
                    // 8-bit aesthetic - sharp corners, 2px border
                    'rounded-none border-2 border-border',
                    'bg-popover text-popover-foreground',
                    // Pixel shadow
                    'shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]',
                    // Animation
                    'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    'data-[state=open]:zoom-in-95'
                  )}
                  side={position === 'left' ? 'right' : 'left'}
                  sideOffset={8}
                  align="center"
                >
                  {item.label}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
      </nav>
    </Tooltip.Provider>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default ActivityBar;
