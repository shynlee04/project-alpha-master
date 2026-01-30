/**
 * @fileoverview useSidebarState Hook
 * @module presentation/hooks/useSidebarState
 * @updated 2026-01-30
 *
 * Custom hook for managing sidebar state with responsive behavior
 * EPIC-UXUI-04: Global Sidebar Auto-Collapse
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useSidebarStore } from '@/infrastructure/persistence/stores/layout/sidebar-store';
import { shouldAutoCollapse } from '@/infrastructure/persistence/stores/layout/sidebar-store';
import type { ViewportState } from '@/presentation/components/layout/types';
import { SIDEBAR_BREAKPOINTS } from '@/presentation/components/layout/types';

/**
 * Debounce delay for toggle operations (ms)
 * Prevents race conditions from rapid clicks
 */
const TOGGLE_DEBOUNCE_MS = 200;

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

  // Refs for debouncing
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastToggleTimeRef = useRef<number>(0);

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

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (toggleTimeoutRef.current) {
        clearTimeout(toggleTimeoutRef.current);
      }
    };
  }, []);

  // Toggle handler with debouncing to prevent race conditions
  const toggle = useCallback(() => {
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTimeRef.current;

    // Clear any pending toggle
    if (toggleTimeoutRef.current) {
      clearTimeout(toggleTimeoutRef.current);
      toggleTimeoutRef.current = null;
    }

    // If within debounce window, schedule the toggle
    if (timeSinceLastToggle < TOGGLE_DEBOUNCE_MS) {
      toggleTimeoutRef.current = setTimeout(() => {
        toggleSidebar();
        lastToggleTimeRef.current = Date.now();
        toggleTimeoutRef.current = null;
      }, TOGGLE_DEBOUNCE_MS - timeSinceLastToggle);
    } else {
      // Execute immediately if outside debounce window
      toggleSidebar();
      lastToggleTimeRef.current = now;
    }
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
