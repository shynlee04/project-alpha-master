/**
 * @fileoverview Layout Components Barrel Export
 * @module components/layout
 * @updated 2026-01-28
 *
 * Exports active layout components.
 * Legacy layout components archived to: _bmad-ext/.archive/layout-cleanup-2026-01-28/
 */

// Core Layout Components
export { GlobalHeader, type GlobalHeaderProps } from './GlobalHeader';
export { MainSidebar } from './MainSidebar';
export { ProjectAwareLayout } from './ProjectAwareLayout';

// IDE Components
export { IDEHeaderBar, type IDEHeaderBarProps } from './IDEHeaderBar';
export { TerminalPanel, type TerminalPanelProps } from './TerminalPanel';
export { ChatPanelWrapper, type ChatPanelWrapperProps } from './ChatPanelWrapper';

// Mobile Components
export { MobileTabBar, useMobilePanel, type MobilePanelType } from './MobileTabBar';
export { BottomSheet, type BottomSheetProps } from './BottomSheet';

// Navigation Components
export { Breadcrumbs, type BreadcrumbsProps } from './Breadcrumbs';

// Activity Bar (UXUI-02-02)
export { ActivityBar, type ActivityBarProps, type ActivityBarItem } from './ActivityBar';

// Plugin Docker (UXUI-02-02b)
export { PluginDocker, type PluginDockerProps } from './PluginDocker';

// Floating Plugin Docker (UXUI-03-05)
export { FloatingPluginDocker, type FloatingPluginDockerProps } from './FloatingPluginDocker';

// Main Content Renderer (UXUI-03-04)
export { MainContentRenderer, type MainContentRendererProps } from './MainContentRenderer';

// Live Region for Screen Reader Announcements (UXUI-03-11)
export { LiveRegion, type LiveRegionProps, type LiveRegionSyncStatus } from './LiveRegion';

// Status Bar
export { StatusBar } from './StatusBar';

// Activity Bar Top (UXUI-03-03)
export { ActivityBarTop, type ActivityBarTopProps } from './ActivityBarTop';

// System Rail
export { SystemRail } from './SystemRail';

// Permission Overlay
export { PermissionOverlay } from './PermissionOverlay';

// Sidebar Widgets
export { SidebarWidgets } from './SidebarWidgets';

// Navigation Breadcrumbs
export { NavigationBreadcrumbs } from './NavigationBreadcrumbs';

// Min Viewport Warning
export { MinViewportWarning } from './MinViewportWarning';

// Plugin Activity Docker Wiring (UXUI-03-03)
export { usePluginActivityDockerWiring } from './PluginActivityDockerWiring';
