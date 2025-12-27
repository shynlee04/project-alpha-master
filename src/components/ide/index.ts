/**
 * IDE Components Barrel Export
 * 
 * Exports all IDE-related components for easy importing.
 */

// Agent Components
export { AgentChatPanel } from './AgentChatPanel';
export { AgentsPanel } from './AgentsPanel';

// Discovery Components
export { BentoGrid } from './BentoGrid';
export { BentoCardPreview } from './BentoCardPreview';
export { CommandPalette } from './CommandPalette';
export { FeatureSearch } from './FeatureSearch';

// Editor Components
export { ExplorerPanel } from './ExplorerPanel';

// File Tree Components
export * as FileTree from './FileTree';

// Layout Components
export { IconSidebar } from './IconSidebar';
export { PanelShell } from './PanelShell';
export { QuickActionsMenu } from './QuickActionsMenu';
export { SearchPanel } from './SearchPanel';
export { SettingsPanel } from './SettingsPanel';

// Monaco Editor Components
export * as MonacoEditor from './MonacoEditor';

// Preview Components
export * as PreviewPanel from './PreviewPanel';

// Status Bar Components
export { StatusBar } from './StatusBar';
export * as StatusBar from './statusbar';

// Terminal Components
export { XTerminal } from './XTerminal';

// UI Components
export { EnhancedChatInterface } from './EnhancedChatInterface';
export { StreamingMessage } from './StreamingMessage';
export { SyncEditWarning } from './SyncEditWarning';
export { SyncStatusIndicator } from './SyncStatusIndicator';

// Types
export type { CommandItem } from './CommandPalette';
export type { CommandPaletteProps } from './CommandPalette';
export type { FeatureItem } from './FeatureSearch';
export type { FeatureSearchProps } from './FeatureSearch';
export type { BentoCardProps } from './BentoGrid';
export type { BentoGridProps } from './BentoGrid';
export type { BentoCardPreviewProps } from './BentoCardPreview';
