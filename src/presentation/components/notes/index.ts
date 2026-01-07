/**
 * @fileoverview Notes Components Barrel Export
 * @module components/notes
 * @governance EPIC-26-1, EPIC-26-5
 */

export { NoteEditor, NoteEditorEmpty } from './NoteEditor';
export { NotesPage } from './NotesPage';
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

