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
export { AISlashCommand } from './AISlashCommand';
export { AITransformMenu } from './AITransformMenu';
export { NoteStudyMenu } from './NoteStudyMenu';

// NR-08: Markdown Import/Export UI
export { MarkdownImportDialog } from './MarkdownImportDialog';
export { MarkdownExportDialog } from './MarkdownExportDialog';
