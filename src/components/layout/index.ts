/**
 * @fileoverview Layout Components Barrel Export
 * @module components/layout
 *
 * Exports all layout components for IDE.
 */

/**
 * @deprecated Use MainLayout instead. This component is being phased out as part of the Home Page Layout Redesign epic.
 * See: src/components/layout/MainLayout.tsx
 */
export { IDELayout } from './IDELayout';

export { IDEHeaderBar, type IDEHeaderBarProps } from './IDEHeaderBar';
export { TerminalPanel, type TerminalPanelProps } from './TerminalPanel';
export { ChatPanelWrapper, type ChatPanelWrapperProps } from './ChatPanelWrapper';
export { MainSidebar } from './MainSidebar';
export { MainLayout } from './MainLayout';
