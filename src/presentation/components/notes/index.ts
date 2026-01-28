/**
 * @fileoverview Notes Components Barrel Export
 * @module components/notes
 * @governance EPIC-26-1, EPIC-26-5
 */

export { NoteEditor, NoteEditorEmpty } from './NoteEditor';
// ARCHIVED 2026-01-28: NotesPage moved to _bmad-ext/.archive/layout-cleanup-2026-01-28/
export { NoteSidebar } from './NoteSidebar';
export { NoteTree } from './NoteTree';
export { NoteTreeItem } from './NoteTreeItem';

// AI Features
export { AIPromptDialog } from './AIPromptDialog';
export { getCustomSlashMenuItems } from './AISlashCommand';
export { AITransformMenu } from './AITransformMenu';
export { NoteStudyMenu } from './NoteStudyMenu';

// NR-08: Markdown Import/Export UI
export { MarkdownImportDialog } from './MarkdownImportDialog';
export { MarkdownExportDialog } from './MarkdownExportDialog';

// ARC-B12: Markdown Sync Conflict Dialog
export { MarkdownSyncConflictDialog, useMarkdownSyncConflictDialog } from './MarkdownSyncConflictDialog';
export type { MarkdownSyncConflictDialogProps, MarkdownSyncConflictDialogState } from './MarkdownSyncConflictDialog';

// NR-07/NR-08: Context Menu and Event System
export { NoteContextMenu, NoteListItem } from './NoteContextMenu';

// P2-8: Notes → Knowledge RAG Indexing
export { NotesIndexingButton } from './NotesIndexingButton';

// NS-2026-01-07: RAG Search Panel
export { NotesRAGSearch } from './NotesRAGSearch';

// NS-2026-01-07: Multi-Modal Import (PDF, Images)
export { MultiModalImport } from './MultiModalImport';

// NS-2026-01-07: Voice Recording Button
export { VoiceRecordButton } from './VoiceRecordButton';

// EPIC-MOBILE: Mobile Layout Components
// ARCHIVED 2026-01-28: NotesMobileLayout moved to _bmad-ext/.archive/layout-cleanup-2026-01-28/

