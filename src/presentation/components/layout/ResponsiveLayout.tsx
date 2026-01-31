/**
 * @fileoverview ResponsiveLayout - Main responsive layout wrapper
 * @module presentation/components/layout/ResponsiveLayout
 *
 * EPIC-UXUI-04: Responsive Layout Implementation
 * FIX-2026-02-01: Removed GlobalSidebar to eliminate layout nesting conflict.
 * ProjectAwareLayout handles global navigation (GlobalHeader/MainSidebar).
 * This component focuses ONLY on plugin panels.
 *
 * - Desktop layout: [0.5:2:4:2.5:0.5] 5-column grid
 * - Tablet landscape: [0.5:3:4:2:0.5] 5-column grid
 * - Tablet portrait: Single panel + bottom nav
 * - Mobile: Single panel + bottom nav
 *
 * @story UXUI-04-07
 * @created 2026-01-30
 * @updated 2026-02-01 - Added PanelResizer integration (gap closure 01-06)
 */

import React, { useEffect } from 'react';
import { cn } from '@/infrastructure/utils/cn';
import { useTranslation } from 'react-i18next';
import { useResponsiveLayout } from '@/presentation/hooks/useResponsiveLayout';
import { ActivityBarLeft } from './ActivityBarLeft';
import { ActivityBarRight } from './ActivityBarRight';
import {
  PluginPanelLeft,
  PluginPanelMain,
  PluginPanelRight,
} from './PluginPanelContainer';
import { BottomNavigation } from './BottomNavigation';
import { PanelResizer } from './PanelResizer';
import type { ResponsiveLayoutProps } from './responsive-types';
import './ResponsiveLayout.css';

// ============================================================================
// Desktop Layout Component
// ============================================================================

/**
 * DesktopLayout - 5-column grid layout (NO GlobalSidebar - handled by ProjectAwareLayout)
 *
 * Grid: [0.5:2:4:2.5:0.5]
 * [ActivityBarLeft:PanelLeft:MainPanel:PanelRight:ActivityBarRight]
 * 
 * NOTE: GlobalSidebar is removed because ProjectAwareLayout provides GlobalHeader
 * for global navigation. This layout focuses ONLY on plugin panels.
 */
const DesktopLayout: React.FC = () => {
  return (
    <div className="responsive-layout__desktop">
      {/* Activity Bar Left (0.5) */}
      <nav className="responsive-layout__activity-bar-left" aria-label="Left panel plugins">
        <ActivityBarLeft />
      </nav>

      {/* Plugin Panel Left (2) */}
      <section className="responsive-layout__panel-left" role="region" aria-label="Left plugin panel">
        <PluginPanelLeft />
      </section>

      {/* Resizer: Left ↔ Main */}
      <PanelResizer leftPanel="left" rightPanel="main" />

      {/* Main Panel (4) */}
      <main className="responsive-layout__panel-main" role="main" aria-label="Main content area">
        <PluginPanelMain />
      </main>

      {/* Resizer: Main ↔ Right */}
      <PanelResizer leftPanel="main" rightPanel="right" />

      {/* Plugin Panel Right (2.5) */}
      <section className="responsive-layout__panel-right" role="region" aria-label="Right plugin panel">
        <PluginPanelRight />
      </section>

      {/* Activity Bar Right (0.5) */}
      <nav className="responsive-layout__activity-bar-right" aria-label="Right panel plugins">
        <ActivityBarRight />
      </nav>
    </div>
  );
};

// ============================================================================
// Tablet Landscape Layout Component
// ============================================================================

/**
 * TabletLandscapeLayout - 5-column grid for tablet landscape (NO GlobalSidebar)
 *
 * Grid: [0.5:3:4:2:0.5]
 * [ActivityBarLeft:PanelLeft:MainPanel:PanelRight:ActivityBarRight]
 */
const TabletLandscapeLayout: React.FC = () => {
  return (
    <div className="responsive-layout__tablet-landscape">
      {/* Activity Bar Left (0.5) */}
      <nav className="responsive-layout__activity-bar-left" aria-label="Left panel plugins">
        <ActivityBarLeft />
      </nav>

      {/* Plugin Panel Left (3) */}
      <section className="responsive-layout__panel-left" role="region" aria-label="Left plugin panel">
        <PluginPanelLeft />
      </section>

      {/* Resizer: Left ↔ Main */}
      <PanelResizer leftPanel="left" rightPanel="main" />

      {/* Main Panel (4) */}
      <main className="responsive-layout__panel-main" role="main" aria-label="Main content area">
        <PluginPanelMain />
      </main>

      {/* Resizer: Main ↔ Right */}
      <PanelResizer leftPanel="main" rightPanel="right" />

      {/* Plugin Panel Right (2) */}
      <section className="responsive-layout__panel-right" role="region" aria-label="Right plugin panel">
        <PluginPanelRight />
      </section>

      {/* Activity Bar Right (0.5) */}
      <nav className="responsive-layout__activity-bar-right" aria-label="Right panel plugins">
        <ActivityBarRight />
      </nav>
    </div>
  );
};

// ============================================================================
// Single Panel Layout Component (Tablet Portrait & Mobile)
// ============================================================================

/**
 * SinglePanelLayout - Single panel with bottom navigation
 *
 * Used for tablet portrait and mobile breakpoints
 */
interface SinglePanelLayoutProps {
  /** Whether to show bottom navigation */
  showBottomNav: boolean;
}

const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({
  showBottomNav,
}) => {
  const { visiblePlugins } = useResponsiveLayout();

  return (
    <div className="responsive-layout__single-panel">
      {/* Main Content Area */}
      <main className="responsive-layout__single-content" role="main">
        <PluginPanelMain />
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation
          plugins={visiblePlugins}
          activePluginId={visiblePlugins[0] || null}
          onPluginSelect={() => {
            // Plugin switching handled by BottomNavigation internally
            // No-op: BottomNavigation manages its own plugin state
          }}
          isVisible={showBottomNav}
        />
      )}
    </div>
  );
};

// ============================================================================
// Main ResponsiveLayout Component
// ============================================================================

/**
 * ResponsiveLayout Component
 *
 * Main responsive layout wrapper that switches between different layout modes
 * based on viewport breakpoint. Handles desktop, tablet, and mobile layouts
 * with smooth transitions.
 *
 * @param props - ResponsiveLayoutProps
 * @returns React component
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ResponsiveLayout
 *       onBreakpointChange={(bp) => console.log('Breakpoint:', bp)}
 *       onLayoutModeChange={(mode) => console.log('Layout:', mode)}
 *     >
 *       <AppContent />
 *     </ResponsiveLayout>
 *   );
 * }
 * ```
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  onBreakpointChange,
  onLayoutModeChange,
}) => {
  const { t } = useTranslation();
  const {
    breakpoint,
    layoutMode,
    isTransitioning,
    layoutConfig,
  } = useResponsiveLayout();

  /**
   * Notify parent of breakpoint changes
   */
  useEffect(() => {
    onBreakpointChange?.(breakpoint);
  }, [breakpoint, onBreakpointChange]);

  /**
   * Notify parent of layout mode changes
   */
  useEffect(() => {
    onLayoutModeChange?.(layoutMode);
  }, [layoutMode, onLayoutModeChange]);

  /**
   * Render appropriate layout based on breakpoint
   */
  const renderLayout = () => {
    switch (breakpoint) {
      case 'desktop':
        return <DesktopLayout />;

      case 'tabletLandscape':
        return <TabletLandscapeLayout />;

      case 'tabletPortrait':
        return (
          <SinglePanelLayout
            showBottomNav={layoutConfig.showBottomNav}
          />
        );

      case 'mobile':
        return (
          <SinglePanelLayout
            showBottomNav={layoutConfig.showBottomNav}
          />
        );

      default:
        // Fallback to desktop layout
        return <DesktopLayout />;
    }
  };

  // Generate container class names
  const containerClassName = cn(
    'responsive-layout',
    `responsive-layout--${breakpoint}`,
    `responsive-layout--${layoutMode}`,
    isTransitioning && 'responsive-layout--transitioning',
    className
  );

  return (
    <div
      className={containerClassName}
      data-breakpoint={breakpoint}
      data-layout-mode={layoutMode}
      aria-label={t('layout.responsive.container', 'Responsive layout container')}
    >
      {/* Main layout content */}
      <div className="responsive-layout__container">
        {renderLayout()}
      </div>

      {/* 
       * DISABLED: PluginDocker causes floating overlay issues.
       * TODO: Integrate as part of panel system, not fixed positioned.
       * 
       * {breakpoint === 'desktop' && (
       *   <div className="responsive-layout__docker-container">
       *     <PluginDocker ... />
       *   </div>
       * )}
       */}

      {/* Additional children (if any) */}
      {children}
    </div>
  );
};

/**
 * ResponsiveLayout Component (default export)
 */
export default ResponsiveLayout;
