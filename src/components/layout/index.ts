/**
 * @fileoverview Layout Components Barrel Export
 * @module components/layout
 *
 * Exports all layout components for IDE.
 */

export { IDELayout } from './IDELayout';

export { IDEHeaderBar, type IDEHeaderBarProps } from './IDEHeaderBar';
export { TerminalPanel, type TerminalPanelProps } from './TerminalPanel';
export { ChatPanelWrapper, type ChatPanelWrapperProps } from './ChatPanelWrapper';
export { MainSidebar } from './MainSidebar';
export { MainLayout } from './MainLayout';

// Mobile-responsive components (Epic-MRT)
export { MobileIDELayout } from './MobileIDELayout';
export { MobileTabBar, useMobilePanel, type MobilePanelType } from './MobileTabBar';

