/**
 * IDE Components Barrel Export
 * 
 * Exports all IDE-related components for easy importing.
 */

// Agent Components
export { AgentChatPanel } from './AgentChatPanel';
export { AgentsPanel } from './AgentsPanel';

// Discovery Components
// ARCHIVED 2026-01-28 (UXUI-02-08): BentoGrid and BentoCardPreview archived
// See _bmad-ext/.archive/bento-grid-2026-01-28/ for archived files
// export { BentoGrid } from './BentoGrid';
// export { BentoCardPreview } from './BentoCardPreview';
export { CommandPalette } from './CommandPalette';
export { FeatureSearch } from './FeatureSearch';

// Editor Components
export { ExplorerPanel } from './ExplorerPanel';

// File Tree Components
export * as FileTree from './FileTree';

// Layout Components
export { ActivityBar } from './IconSidebar';
export { PanelShell } from './PanelShell';
export { QuickActionsMenu } from './QuickActionsMenu';
export { SearchPanel } from './SearchPanel';
export { SettingsPanel } from './SettingsPanel';

// Monaco Editor Components
export * as MonacoEditor from './MonacoEditor';

// Preview Components
export * as PreviewPanel from './PreviewPanel';

// Status Bar Components
// ARCHIVED 2026-01-28 (CC-UX-04): StatusBar moved to components/layout/StatusBar
// See _bmad-ext/.archive/duplicate-components-2026-01-28/ for archived files
// Use: import { StatusBar } from '@/presentation/components/layout/StatusBar'
export * as StatusBarSegments from './statusbar';

// Terminal Components
export { XTerminal } from './XTerminal';

// UI Components
export { EnhancedChatInterface } from './EnhancedChatInterface';
export { StreamingMessage } from './StreamingMessage';
export { SyncEditWarning } from './SyncEditWarning';
export { SyncStatusIndicator } from './SyncStatusIndicator';

// WB-7: Lazy Content Loading
export { CacheIndicator } from './CacheIndicator';
export * from './hooks';

// EPIC-MOBILE: Mobile Layout Components
// ARCHIVED 2026-01-28: IDEMobileLayout moved to _bmad-ext/.archive/layout-cleanup-2026-01-28/

// Types
export type { CommandItem } from './CommandPalette';
export type { CommandPaletteProps } from './CommandPalette';
export type { FeatureItem } from './FeatureSearch';
export type { FeatureSearchProps } from './FeatureSearch';
// ARCHIVED 2026-01-28 (UXUI-02-08): Bento types archived
// export type { BentoCardProps } from './BentoGrid';
// export type { BentoGridProps } from './BentoGrid';
// export type { BentoCardPreviewProps } from './BentoCardPreview';
