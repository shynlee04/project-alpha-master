/**
 * @fileoverview WorkspaceLayout - 6-Column CSS Grid Layout Shell
 * @module presentation/layouts/WorkspaceLayout
 *
 * **6-COLUMN GRID LAYOUT SYSTEM**
 *
 * Layout structure:
 * ┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐
 * │Global  │Activity│Plugin    │Main Content    │Plugin    │Activity│
 * │Sidebar │Bar LEFT│LEFT      │(Notes/Monaco)  │RIGHT     │Bar     │
 * │ 48px   │ 48px   │200-320px │   400px+       │250-400px │ 48px   │
 * └────────┴────────┴──────────┴────────────────┴──────────┴────────┘
 * + StatusBar at bottom (24px)
 *
 * Grid Template:
 * - Columns: 48px 48px minmax(200px, 320px) 1fr minmax(250px, 400px) 48px
 * - Rows: 1fr 24px
 *
 * @epic EPIC-UXUI-01
 * @story UXUI-02-01
 * @team Team B
 * @created 2026-01-28
 */

import type { ReactNode } from 'react';

// ============================================================================
// WorkspaceLayout Props Interface
// ============================================================================

/**
 * WorkspaceLayout Props
 *
 * All props are optional React nodes that render in specific grid areas.
 * Each slot corresponds to a specific area in the 6-column grid layout.
 */
export interface WorkspaceLayoutProps {
  /** Global sidebar - leftmost 48px column (e.g., Hub navigation) */
  globalSidebar?: ReactNode;

  /** Activity bar on the left side - 48px column */
  activityBarLeft?: ReactNode;

  /** Left plugin panel - 200-320px flexible width */
  pluginLeft?: ReactNode;

  /** Main content area - flexible 1fr (Notes editor, Monaco, etc.) */
  mainContent?: ReactNode;

  /** Right plugin panel - 250-400px flexible width */
  pluginRight?: ReactNode;

  /** Activity bar on the right side - 48px column */
  activityBarRight?: ReactNode;

  /** Status bar at the bottom - 24px height */
  statusBar?: ReactNode;
}

// ============================================================================
// WorkspaceLayout Component
// ============================================================================

/**
 * WorkspaceLayout Component - 6-Column CSS Grid Shell
 *
 * @param props - WorkspaceLayoutProps
 * @returns Workspace layout JSX element
 *
 * @remarks
 * Implementation Features:
 * - 6-column CSS Grid with named grid areas
 * - Flexible plugin panels with minmax constraints
 * - 8-bit design compliance (sharp corners, pixel borders)
 * - Responsive breakpoints for tablet and mobile
 * - All slots are optional - renders empty if not provided
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - 2px solid borders using CSS variables
 * - No glassmorphism or transparency
 */
export function WorkspaceLayout({
  globalSidebar,
  activityBarLeft,
  pluginLeft,
  mainContent,
  pluginRight,
  activityBarRight,
  statusBar,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      {/* Global Sidebar - 48px fixed width */}
      {globalSidebar && (
        <div className="workspace-layout__global-sidebar">
          {globalSidebar}
        </div>
      )}

      {/* Activity Bar Left - 48px fixed width */}
      {activityBarLeft && (
        <div className="workspace-layout__activity-bar-left">
          {activityBarLeft}
        </div>
      )}

      {/* Plugin Left Panel - 200-320px flexible */}
      {pluginLeft && (
        <div className="workspace-layout__plugin-left">
          {pluginLeft}
        </div>
      )}

      {/* Main Content Area - flexible 1fr */}
      {mainContent && (
        <div className="workspace-layout__main-content">
          {mainContent}
        </div>
      )}

      {/* Plugin Right Panel - 250-400px flexible */}
      {pluginRight && (
        <div className="workspace-layout__plugin-right">
          {pluginRight}
        </div>
      )}

      {/* Activity Bar Right - 48px fixed width */}
      {activityBarRight && (
        <div className="workspace-layout__activity-bar-right">
          {activityBarRight}
        </div>
      )}

      {/* Status Bar - 24px fixed height at bottom */}
      {statusBar && (
        <div className="workspace-layout__status-bar">
          {statusBar}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// No additional exports - WorkspaceLayout exported above
// ============================================================================
