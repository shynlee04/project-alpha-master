/**
 * @fileoverview useGlobalSidebar Hook
 * @module presentation/hooks/useGlobalSidebar
 * @updated 2026-01-30
 *
 * Re-export of useSidebarState for consistent naming
 * EPIC-UXUI-04: Global Sidebar Auto-Collapse
 *
 * This hook provides:
 * - Sidebar expanded/collapsed state
 * - Viewport detection (mobile/tablet/desktop)
 * - Auto-collapse behavior on small screens
 * - Toggle/expand/collapse actions
 *
 * @example
 * ```tsx
 * const { isExpanded, isCollapsed, toggle, width } = useGlobalSidebar();
 *
 * return (
 *   <aside style={{ width }}>
 *     <button onClick={toggle}>
 *       {isExpanded ? 'Collapse' : 'Expand'}
 *     </button>
 *   </aside>
 * );
 * ```
 */

// Re-export everything from useSidebarState
export { useSidebarState as useGlobalSidebar } from './useSidebarState';
export { useSidebarState as default } from './useSidebarState';
