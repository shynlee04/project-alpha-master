/**
 * @fileoverview ActivityBarTop - Horizontal Activity Bar for Main Content Area
 * @module presentation/components/layout/ActivityBarTop
 *
 * **ACTIVITY BAR TOP COMPONENT**
 *
 * A 48px tall horizontal bar that appears at the top of the main content area.
 * Allows users to switch between Notes, Monaco, and Preview plugins in the
 * main content zone.
 *
 * Layout position in WorkspaceLayout:
 * ┌────────┬────────┬──────────┬──────────────────────────────────┬────────┬────────┐
 * │Global  │Activity│Plugin    │ [ACTIVITY BAR TOP - 48px]        │Plugin  │Activity│
 * │Sidebar │Bar LEFT│LEFT      │────────────────────────────────── │RIGHT   │Bar     │
 * │        │        │          │ Active Plugin Content            │        │RIGHT   │
 * │ 48px   │ 48px   │200-320px │       400px+                     │250-400 │ 48px   │
 * └────────┴────────┴──────────┴──────────────────────────────────┴────────┴────────┘
 *
 * 8-bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - 2px bottom border for active indicator
 * - 48px height
 * - No transparency, no blur
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-03
 * @team Team A
 * @created 2026-01-28
 */

import type { ReactNode, KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * ActivityBarTopItem - Individual item for the horizontal activity bar
 */
export interface ActivityBarTopItem {
  /** Plugin identifier */
  pluginId: string;
  /** Icon to display - can be a React node */
  icon: ReactNode;
  /** Label text for tooltip/aria-label */
  label: string;
  /** Optional keyboard shortcut hint (e.g., 'Cmd+1') */
  shortcut?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * ActivityBarTopProps - Props for the horizontal activity bar
 */
export interface ActivityBarTopProps {
  /** Array of items to display in the activity bar */
  items: ActivityBarTopItem[];
  /** Currently active plugin ID */
  activePluginId: string | null;
  /** Callback when an item is clicked */
  onItemClick: (pluginId: string) => void;
  /** Additional CSS class names */
  className?: string;
  /** Maximum number of plugins displayed (default: 3 per UX spec) */
  maxItems?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Renders an icon from the item configuration
 */
function renderIcon(icon: ReactNode): ReactNode {
  if (typeof icon === 'string') {
    return <span className="activity-bar-top__icon-text">{icon}</span>;
  }
  return icon;
}

// ============================================================================
// ActivityBarTop Component
// ============================================================================

/**
 * ActivityBarTop Component - 48px Horizontal Activity Bar
 *
 * @param props - ActivityBarTopProps
 * @returns Horizontal activity bar JSX element
 *
 * @remarks
 * 8-Bit Design Features:
 * - Sharp corners (border-radius: 0)
 * - 2px bottom border for active indicator
 * - 48px height, full width
 * - CSS variables for consistent theming
 * - Keyboard navigation support
 * - Max 3 plugins per bar (per UX spec)
 */
export function ActivityBarTop({
  items,
  activePluginId,
  onItemClick,
  className = '',
  maxItems = 3,
}: ActivityBarTopProps) {
  const { t } = useTranslation();

  // Limit items to maxItems per UX spec
  const displayItems = items.slice(0, maxItems);

  const handleItemClick = useCallback(
    (pluginId: string, disabled?: boolean) => {
      if (disabled) return;
      onItemClick(pluginId);
    },
    [onItemClick]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, pluginId: string, disabled?: boolean) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onItemClick(pluginId);
      }
      // Arrow key navigation
      const buttons = event.currentTarget.parentElement?.querySelectorAll('button:not([disabled])');
      if (!buttons) return;

      const currentIndex = Array.from(buttons).indexOf(event.currentTarget);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        (buttons[nextIndex] as HTMLButtonElement).focus();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        (buttons[prevIndex] as HTMLButtonElement).focus();
      }
    },
    [onItemClick]
  );

  return (
    <nav
      className={`activity-bar-top ${className}`}
      role="toolbar"
      aria-label={t('layout.activityBarTop.ariaLabel')}
      aria-orientation="horizontal"
    >
      <div className="activity-bar-top__content">
        {displayItems.map((item) => {
          const isActive = activePluginId === item.pluginId;
          const itemClasses = [
            'activity-bar-top__item',
            isActive && 'activity-bar-top__item--active',
            item.disabled && 'activity-bar-top__item--disabled',
          ]
            .filter(Boolean)
            .join(' ');

          // Build aria-label with shortcut info if available
          const ariaLabel = item.shortcut
            ? `${item.label} (${item.shortcut})`
            : item.label;

          return (
            <button
              key={item.pluginId}
              type="button"
              className={itemClasses}
              onClick={() => handleItemClick(item.pluginId, item.disabled)}
              onKeyDown={(e) => handleKeyDown(e, item.pluginId, item.disabled)}
              disabled={item.disabled}
              aria-pressed={isActive}
              aria-label={ariaLabel}
              title={ariaLabel}
              tabIndex={0}
            >
              <span className="activity-bar-top__icon">
                {renderIcon(item.icon)}
              </span>
              <span className="activity-bar-top__label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// Default Export
// ============================================================================

export default ActivityBarTop;
