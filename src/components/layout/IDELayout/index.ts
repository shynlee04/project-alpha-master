/**
 * IDE Layout Components
 *
 * Orchestrates IDE layout with resizable panels.
 * Split from IDELayout.tsx (604 lines) into 14 sub-components.
 *
 * @layer Presentation
 * @component IDELayout
 */

export { IDEDiscoveryMechanisms } from './IDEDiscoveryMechanisms';
export { IDEEditorPanel } from './IDEEditorPanel';
export { IDEPreviewPanel } from './IDEPreviewPanel';
export { IDETerminalPanel } from './IDETerminalPanel';
export { IDEChatPanel } from './IDEChatPanel';
export { IDESidebarPanels } from './IDESidebarPanels';
export { IDEResizableLayout } from './IDEResizableLayout';
export { IDEEditorPreviewGroup } from './IDEEditorPreviewGroup';
export { useIDELayoutState } from './useIDELayoutState';
export { useIDELayoutFileState } from './useIDELayoutFileState';
export { useIDELayoutWorkspaceState } from './useIDELayoutWorkspaceState';
export { useIDELayoutDiscoveryState } from './useIDELayoutDiscoveryState';
export { useIDELayoutPanelRefs } from './useIDELayoutPanelRefs';
export * from './types';
