/**
 * @fileoverview Presentation Hooks Barrel Export
 * @module presentation/hooks
 * @updated 2026-01-30
 *
 * Exports all custom React hooks for the presentation layer
 */

// Layout hooks
export { useSidebarState } from './useSidebarState';
export { useGlobalSidebar } from './useGlobalSidebar';
export { useLayoutState } from './useLayoutState';

// Responsive layout hooks (UXUI-04-07)
export { useBreakpoint } from './useBreakpoint';
export { useResponsiveLayout } from './useResponsiveLayout';

// Re-export other hooks as needed
export { useBreakpointEnhanced } from './useBreakpointEnhanced';
export { useStorageMode } from './useStorageMode';
