/**
 * @fileoverview useSidebarState Hook
 * @module presentation/hooks/useSidebarState
 * @updated 2026-01-30
 *
 * Custom hook for managing sidebar state with responsive behavior
 * EPIC-UXUI-04: Global Sidebar Auto-Collapse
 */

import { useEffect, useCallback, useState } from 'react';
import { useSidebarStore } from '@/infrastructure/persistence/stores/layout/sidebar-store';
import { shouldAutoCollapse } from '@/infrastructure/persistence/stores/layout/sidebar-store';
import type { ViewportState } from '@/presentation/components/layout/types';
import { SIDEBAR_BREAKPOINTS } from '@/presentation/components/layout/types';

/**
 * Hook return type
 */
interface UseSidebarStateReturn {
  /** Whether sidebar is expanded */
  isExpanded: boolean;
  /** Whether sidebar is in icon-only mode (collapsed) */
  isCollapsed: boolean;
  /** Current viewport state */
  viewport: ViewportState;
  /** Whether auto-collapse is active (viewport < 1024px) */
  isAutoCollapsed: boolean;
  /** Toggle sidebar expanded/collapsed */
  toggle: () => void;
  /** Set explicit expanded state */
  setExpanded: (expanded: boolean) => void;
  /** Expand sidebar */
  expand: () => void;
  /** Collapse sidebar */
  collapse: () => void;
  /** Current sidebar width in pixels */
  width: number;
}

/**
 * Get current viewport state
 */
function getViewportState(): ViewportState {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    isMobile: width < SIDEBAR_BREAKPOINTS.mobile,
    isTablet: width >= SIDEBAR_BREAKPOINTS.mobile && width < SIDEBAR_BREAKPOINTS.tablet,
    isDesktop: width >= SIDEBAR_BREAKPOINTS.desktop,
  };
}

/**
 * Custom hook for sidebar state management
 * Handles responsive auto-collapse and viewport detection
 */
export function useSidebarState(): UseSidebarStateReturn {
  // Get state from Zustand store
  const isExpanded = useSidebarStore((state) => state.isExpanded);
  const setExpanded = useSidebarStore((state) => state.setExpanded);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  // Local state for viewport
  const [viewport, setViewport] = useState<ViewportState>(getViewportState());
  const [isAutoCollapsed, setIsAutoCollapsed] = useState(false);

  // Update viewport state on resize
  useEffect(() => {
    const handleResize = () => {
      const newViewport = getViewportState();
      setViewport(newViewport);

      // Auto-collapse on mobile/tablet
      const shouldCollapse = shouldAutoCollapse(newViewport.width);
      setIsAutoCollapsed(shouldCollapse);

      // If auto-collapsing and currently expanded, collapse it
      if (shouldCollapse && isExpanded) {
        setExpanded(false);
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, setExpanded]);

  // Toggle handler
  const toggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  // Expand handler
  const expand = useCallback(() => {
    setExpanded(true);
  }, [setExpanded]);

  // Collapse handler
  const collapse = useCallback(() => {
    setExpanded(false);
  }, [setExpanded]);

  // Calculate width
  const width = isExpanded ? 200 : 48;

  return {
    isExpanded,
    isCollapsed: !isExpanded,
    viewport,
    isAutoCollapsed,
    toggle,
    setExpanded,
    expand,
    collapse,
    width,
  };
}

export default useSidebarState;
