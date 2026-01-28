/**
 * @fileoverview Layout Components Barrel Export
 * @module components/layout
 *
 * Exports all layout components for IDE.
 */

export { IDELayout } from './IDELayoutMain';

export { GlobalHeader, type GlobalHeaderProps } from './GlobalHeader';
export { IDEHeaderBar, type IDEHeaderBarProps } from './IDEHeaderBar';
export { TerminalPanel, type TerminalPanelProps } from './TerminalPanel';
export { ChatPanelWrapper, type ChatPanelWrapperProps } from './ChatPanelWrapper';
export { MainSidebar } from './MainSidebar';
export { MainLayout } from './MainLayout';

// Mobile-responsive components (Epic-MRT)
export { MobileIDELayout } from './MobileIDELayout';
export { MobileTabBar, useMobilePanel, type MobilePanelType } from './MobileTabBar';

// Navigation components (Epic-UX-GLOBAL-UI)
export { Breadcrumbs, type BreadcrumbsProps } from './Breadcrumbs';

// Bento Grid Plugin Controls (CC-AR-04)
export { PluginToggles, type PluginTogglesProps } from './PluginToggles';

// Activity Bar (UXUI-02-02)
export { ActivityBar, type ActivityBarProps, type ActivityBarItem } from './ActivityBar';

// Plugin Docker (UXUI-02-02b)
export { PluginDocker, type PluginDockerProps } from './PluginDocker';

// Floating Plugin Docker (UXUI-03-05)
export { FloatingPluginDocker, type FloatingPluginDockerProps } from './FloatingPluginDocker';

// Live Region for Screen Reader Announcements (UXUI-03-11)
export { LiveRegion, type LiveRegionProps, type LiveRegionSyncStatus } from './LiveRegion';
