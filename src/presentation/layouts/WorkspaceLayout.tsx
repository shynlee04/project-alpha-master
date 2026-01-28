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
 * **ARIA LANDMARKS**
 *
 * This component implements semantic HTML with ARIA landmarks for accessibility:
 * - `<nav aria-label="Main navigation">` - Global sidebar navigation
 * - `<main role="main" aria-label="Project workspace">` - Main content area
 * - `<aside aria-label="Plugin sidebar">` - Plugin panels (left and right)
 * - `<footer role="contentinfo" aria-label="Status bar">` - Status bar
 *
 * Screen reader users can navigate between these landmarks using shortcuts:
 * - VoiceOver: VO+U (Landmarks rotor)
 * - NVDA: D (next landmark), Shift+D (previous landmark)
 * - JAWS: R (next region), Shift+R (previous region)
 *
 * @epic EPIC-UXUI-03
 * @story UXUI-03-08
 * @team Team B
 * @created 2026-01-28
 * @updated 2026-01-28
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
 * - ARIA landmarks for screen reader navigation
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - 2px solid borders using CSS variables
 * - No glassmorphism or transparency
 *
 * Accessibility:
 * - Semantic HTML elements (nav, main, aside, footer)
 * - ARIA labels for all landmark regions
 * - Screen reader landmark navigation support
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
      {/* ARIA Landmark: Navigation region for main navigation */}
      {globalSidebar && (
        <nav
          className="workspace-layout__global-sidebar"
          aria-label="Main navigation"
        >
          {globalSidebar}
        </nav>
      )}

      {/* Activity Bar Left - 48px fixed width */}
      {activityBarLeft && (
        <div className="workspace-layout__activity-bar-left">
          {activityBarLeft}
        </div>
      )}

      {/* Plugin Left Panel - 200-320px flexible */}
      {/* ARIA Landmark: Complementary region for plugin sidebar */}
      {pluginLeft && (
        <aside
          className="workspace-layout__plugin-left"
          aria-label="Plugin sidebar"
        >
          {pluginLeft}
        </aside>
      )}

      {/* Main Content Area - flexible 1fr */}
      {/* ARIA Landmark: Main region for project workspace content */}
      {mainContent && (
        <main
          className="workspace-layout__main-content"
          role="main"
          aria-label="Project workspace"
        >
          {mainContent}
        </main>
      )}

      {/* Plugin Right Panel - 250-400px flexible */}
      {/* ARIA Landmark: Complementary region for plugin sidebar */}
      {pluginRight && (
        <aside
          className="workspace-layout__plugin-right"
          aria-label="Plugin sidebar"
        >
          {pluginRight}
        </aside>
      )}

      {/* Activity Bar Right - 48px fixed width */}
      {activityBarRight && (
        <div className="workspace-layout__activity-bar-right">
          {activityBarRight}
        </div>
      )}

      {/* Status Bar - 24px fixed height at bottom */}
      {/* ARIA Landmark: Contentinfo region for status information */}
      {statusBar && (
        <footer
          className="workspace-layout__status-bar"
          role="contentinfo"
          aria-label="Status bar"
        >
          {statusBar}
        </footer>
      )}
    </div>
  );
}

// ============================================================================
// No additional exports - WorkspaceLayout exported above
// ============================================================================
