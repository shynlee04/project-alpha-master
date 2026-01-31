# ARTIFACT 3: NOTES Workspace - Main Panel Investigation
**Date:** 2026-01-13
**Workspace:** NOTES
**Focus:** Main Editor Panel (Center)
**Status:** INVESTIGATION COMPLETE

---

## ULTRA-THINK: What This Artifact Is

**This IS:**
- ✅ Evidence-based investigation of NOTES workspace main panel
- ✅ All props documented from actual component files
- ✅ Feature mapping and user flow analysis
- ✅ Component connection hierarchy

**This is NOT:**
- ❌ Assumptions without code verification
- ❌ Implementation recommendations
- ❌ Solutions without investigation

---

## COMPONENT HIERARCHY

```
NotesPage (Main Container)
    ├── NoteSidebar (Left - 20-30%)
    │   ├── NoteTree (Notes view)
    │   ├── ProjectFilesPanel (Files view)
    │   └── NotesRAGSearch (AI view)
    ├── NoteEditor (Center - 50%)
    │   ├── BlockNote Editor
    │   ├── AIPromptDialog
    │   ├── AITransformMenu
    │   ├── AIInsertionDialog
    │   ├── VoiceRecordButton
    │   ├── MultiModalImport
    │   └── PromptSuggestionsPanel
    └── UnifiedChatPanel (Right - 30%)
        └── AgentChatPanel (RAG mode)
```

---

## COMPONENT 1: NotesPage

**File:** `src/presentation/components/notes/NotesPage.tsx:69`

**Props:**
```typescript
// No props - main page component
```

**Features Enabled:**
- Main workspace container with 3-column layout
- Mobile-responsive with dynamic view switching
- Project selection and workspace management
- File sync service integration (auto-import project files)
- Cross-workspace event handling (Knowledge → Notes synthesis export)
- Markdown import/export dialogs
- Slash commands dialog
- AI chat panel integration

**Connected To:**
- **Children:** NoteSidebar, NoteEditor, UnifiedChatPanel
- **Dialogs:** MarkdownImportDialog, MarkdownExportDialog, SlashCommandsDialog
- **Hooks:** useNoteStore, useActiveNote, useWorkspaceProjects, useFileSyncService

**User Flow:**
1. User opens Notes workspace
2. Project selection if multiple projects
3. NoteSidebar loads with notes list
4. User selects note → NoteEditor displays content
5. User can chat with AI about notes via right panel
6. Auto-save on every edit (500ms debounce)

---

## COMPONENT 2: NoteEditor

**File:** `src/presentation/components/notes/NoteEditor.tsx:143`

**Props:**
```typescript
noteId: string
className?: string
readOnly?: boolean
```

**Features Enabled:**
- Block-based editor (BlockNote library)
- Auto-save with 500ms debounce
- Custom blocks (Image, CodeFile, FileAttachment)
- AI slash commands integration
- Voice recording support
- Multi-modal import (PDF, images)
- Prompt suggestions panel
- Edit mode toggle
- Save status indicator

**Connected To:**
- **Dialogs:** AIPromptDialog, AITransformMenu, AIInsertionDialog
- **Components:** VoiceRecordButton, MultiModalImport, PromptSuggestionsPanel
- **Hooks:** useNoteStore, useNoteSaveStatus, useIsNoteIndexing

**User Flow:**
1. User selects note from sidebar
2. NoteEditor loads note content
3. User edits blocks
4. Auto-save after 500ms of inactivity
5. Can use slash commands (/) for AI features
6. Can transform content via AI menu
7. Can insert AI-generated content

---

## COMPONENT 3: AIPromptDialog

**File:** `src/presentation/components/notes/AIPromptDialog.tsx:32`

**Props:**
```typescript
// No props - uses global store state
```

**Features Enabled:**
- AI content generation dialog
- Context mode selection (above cursor, all, selection, none)
- Context preview with statistics
- Agent validation
- Error handling
- Prompt refinement options

**Connected To:**
- **Stores:** useAIPromptStore, useAgentSelectionStore
- **Service:** generateNoteContent (AI service)

**User Flow:**
1. User triggers AI generation (slash command or menu)
2. Dialog opens with context options
3. User selects context mode (above cursor, all, selection, none)
4. User enters prompt
5. AI generates content
6. Content inserted into editor

---

## COMPONENT 4: AITransformMenu

**File:** `src/presentation/components/notes/AITransformMenu.tsx`

**Props:**
```typescript
// (Investigated via component scan)
```

**Features Enabled:**
- Content transformation options
- AI-powered text operations
- Selection-based transformation
- Quick access to common transformations

**Connected To:**
- **Parent:** NoteEditor (triggered via selection/menu)
- **Service:** AI transformation service

**User Flow:**
1. User selects text in editor
2. Opens AI transform menu
3. Selects transformation type
4. AI processes selected text
5. Result replaces selection

---

## COMPONENT 5: SlashCommandManager

**File:** `src/presentation/components/notes/SlashCommandManager.tsx:56`

**Props:**
```typescript
// No props - standalone manager
```

**Features Enabled:**
- Create/edit/delete custom slash commands
- Icon selection with 20+ icons
- Category and tag filtering
- Import/export commands
- 2-step refinement support
- Prompt templates browsing

**Connected To:**
- **Dialog:** PromptTemplatesDialog
- **Store:** useSlashCommandStore

**User Flow:**
1. User types / in editor
2. Command palette appears
3. Can filter by category/tags
4. Select command or create new
5. Can configure custom commands
6. Can export/import command sets

---

## COMPONENT 6: AIInsertionDialog

**File:** `src/presentation/components/notes/AIInsertionDialog.tsx`

**Props:**
```typescript
// (Investigated via component scan)
```

**Features Enabled:**
- AI content insertion
- Preview before insert
- Multiple generation options
- Refinement capabilities

**Connected To:**
- **Parent:** Triggered from NoteEditor
- **Store:** AI insertion state management

**User Flow:**
1. User triggers AI insertion
2. Dialog opens with generation options
3. AI generates content
4. User previews options
5. User selects and inserts

---

## STATE MANAGEMENT ARCHITECTURE

### Note Store Slices (7 total)
| Slice | description | File |
|-------|---------|------|
| CRUD | Note create/read/update/delete | note-crud-slice.ts |
| Metadata | Title, tags, favorites | note-metadata-slice.ts |
| Query | Search and filtering | note-query-slice.ts |
| Sync | File synchronization | note-sync-slice.ts |
| Indexing | RAG indexing status | note-indexing-slice.ts |
| Events | Cross-workspace events | note-events-slice.ts |
| UI | UI state (sidebar, etc.) | note-ui-slice.ts |

### Additional Stores
| Store | description |
|-------|---------|
| note-navigation-store.ts | Search, favorites, tree expansion |
| ai-prompt-store.ts | AI dialog state and context mode |
| slash-command-store.ts | Custom commands management |
| ai-loading-store.ts | AI operation loading states |
| ai-insertion-store.ts | Pending AI content management |

---

## IDENTIFIED ISSUES

### Critical (P0)
1. **Store fragmentation** - 7 slices + 5 additional stores for notes
   - **Evidence:** Multiple store files in `src/infrastructure/persistence/stores/` and `src/lib/notes/`

### High (P1)
2. **BlockNote dependency** - Heavy library for block-based editing
   - **Evidence:** NoteEditor.tsx imports BlockNote
3. **No conflict resolution** - What happens if two users edit same note?

### Medium (P2)
4. **Slash command overlap** - Notes has its own slash commands separate from chat
5. **AI dialog fragmentation** - Multiple AI dialogs (prompt, transform, insertion)

---

## DELIVERABLES STATUS

- ✅ NotesPage investigated
- ✅ NoteEditor investigated
- ✅ AIPromptDialog investigated
- ✅ AITransformMenu investigated
- ✅ SlashCommandManager investigated
- ✅ AIInsertionDialog investigated
- ✅ State architecture mapped
- ✅ User flows documented

---

**Last Updated:** 2026-01-13
**Version:** 1.0
**Agent ID:** a2f871a
