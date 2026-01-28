/**
 * @fileoverview Responsive Layout Switcher Component
 * @module components/layout/ResponsiveLayoutSwitcher
 * @created 2026-01-28
 * @updated 2026-01-28
 * @epic EPIC-UXUI-03
 * @story UXUI-03-13
 *
 * Automatically switches between layout components based on breakpoint:
 * - Desktop (>=768px): WorkspaceLayout (6-zone grid)
 * - Tablet Portrait (600-767px): TabletPortraitLayout (full-screen + bottom nav)
 * - Mobile (<600px): MobileBottomNav integration (full-screen + bottom nav)
 *
 * Uses useBreakpointEnhanced hook for 6-tier breakpoint detection.
 */

import React, { type ReactNode, useEffect, useRef } from 'react';
import { useBreakpointEnhanced, type BreakpointState } from '@/presentation/hooks/useBreakpointEnhanced';

// ============================================================================
// Types
// ============================================================================

export interface ResponsiveLayoutSwitcherProps {
  /** Desktop layout component (6-zone grid) - shown at >=768px */
  desktopLayout: ReactNode;
  /** Tablet portrait layout (full-screen + bottom nav) - shown at 600-767px */
  tabletPortraitLayout: ReactNode;
  /** Mobile layout (full-screen + bottom nav) - shown at <600px */
  mobileLayout: ReactNode;
  /** Optional callback when breakpoint changes */
  onBreakpointChange?: (breakpoint: BreakpointState) => void;
  /** Whether to animate transitions between layouts */
  animated?: boolean;
  /** Additional class name */
  className?: string;
}

export interface ResponsiveLayoutState {
  /** Current active layout type */
  layoutType: 'desktop' | 'tablet-portrait' | 'mobile';
  /** Current breakpoint state */
  breakpoint: BreakpointState;
  /** Whether layout is transitioning */
  isTransitioning: boolean;
}

// ============================================================================
// Hook: useResponsiveLayout
// ============================================================================

/**
 * Hook for determining which layout to show based on breakpoint
 *
 * @returns Layout state with breakpoint info
 */
export function useResponsiveLayout(): ResponsiveLayoutState {
  const breakpoint = useBreakpointEnhanced();

  // Determine layout type based on breakpoint
  let layoutType: 'desktop' | 'tablet-portrait' | 'mobile';

  switch (breakpoint.breakpoint) {
    case 'phone-portrait':
    case 'phone-landscape':
      layoutType = 'mobile';
      break;
    case 'tablet-portrait':
      layoutType = 'tablet-portrait';
      break;
    case 'tablet-landscape':
    case 'laptop':
    case 'desktop':
    default:
      layoutType = 'desktop';
      break;
  }

  return {
    layoutType,
    breakpoint,
    isTransitioning: false, // Could add transition state tracking
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * ResponsiveLayoutSwitcher - Renders appropriate layout based on screen size
 *
 * Features:
 * - Automatic layout switching based on 6-tier breakpoints
 * - Preserves state when switching layouts
 * - Optional animation between layouts
 * - Callback for breakpoint changes
 *
 * Breakpoint Mapping:
 * - Desktop (>=768px): desktopLayout prop (WorkspaceLayout)
 * - Tablet Portrait (600-767px): tabletPortraitLayout prop
 * - Mobile (<600px): mobileLayout prop
 *
 * @example
 * ```tsx
 * <ResponsiveLayoutSwitcher
 *   desktopLayout={<WorkspaceLayout {...desktopProps} />}
 *   tabletPortraitLayout={<TabletPortraitLayout {...tabletProps} />}
 *   mobileLayout={<MobileIDELayout {...mobileProps} />}
 *   onBreakpointChange={handleBreakpointChange}
 * />
 * ```
 */
export const ResponsiveLayoutSwitcher: React.FC<ResponsiveLayoutSwitcherProps> = ({
  desktopLayout,
  tabletPortraitLayout,
  mobileLayout,
  onBreakpointChange,
  animated = false,
  className,
}) => {
  const { layoutType, breakpoint } = useResponsiveLayout();
  const prevLayoutType = useRef(layoutType);

  // Notify parent of breakpoint changes
  useEffect(() => {
    if (prevLayoutType.current !== layoutType) {
      console.log('[ResponsiveLayoutSwitcher] Layout changed:', {
        from: prevLayoutType.current,
        to: layoutType,
        breakpoint: breakpoint.breakpoint,
        width: breakpoint.width,
      });
      prevLayoutType.current = layoutType;
    }

    onBreakpointChange?.(breakpoint);
  }, [breakpoint, layoutType, onBreakpointChange]);

  // Render appropriate layout based on breakpoint
  const renderLayout = (): ReactNode => {
    switch (layoutType) {
      case 'mobile':
        return mobileLayout;
      case 'tablet-portrait':
        return tabletPortraitLayout;
      case 'desktop':
      default:
        return desktopLayout;
    }
  };

  // With animation wrapper
  if (animated) {
    return (
      <div
        className={className}
        style={{
          transition: 'opacity 150ms ease-in-out',
          opacity: 1,
        }}
        data-layout-type={layoutType}
        data-breakpoint={breakpoint.breakpoint}
      >
        {renderLayout()}
      </div>
    );
  }

  // Without animation - just render the layout
  return <>{renderLayout()}</>;
};

ResponsiveLayoutSwitcher.displayName = 'ResponsiveLayoutSwitcher';

// ============================================================================
// Utility: getLayoutType
// ============================================================================

/**
 * Get layout type from breakpoint state
 *
 * @param breakpoint - Current breakpoint state
 * @returns Layout type string
 */
export function getLayoutType(
  breakpoint: BreakpointState
): 'desktop' | 'tablet-portrait' | 'mobile' {
  switch (breakpoint.breakpoint) {
    case 'phone-portrait':
    case 'phone-landscape':
      return 'mobile';
    case 'tablet-portrait':
      return 'tablet-portrait';
    case 'tablet-landscape':
    case 'laptop':
    case 'desktop':
    default:
      return 'desktop';
  }
}

export default ResponsiveLayoutSwitcher;
