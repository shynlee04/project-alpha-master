---
investigation_id: "NOTES-COMPONENTS-LIFECYCLE"
created: "2026-01-20T20:30:00+07:00"
scope:
  - "Notes space components inventory"
  - "BlockNote editor integration"
  - "File tree and sidebar navigation"
  - "Component lifecycle analysis"
  - "Cross-dependencies mapping"
---

# Notes Components Lifecycle Investigation

## Executive Summary

This investigation provides a comprehensive inventory and analysis of all Notes space components in Project Alpha. The analysis covers **60+ component files** organized across 6 categories: Editor, File Tree, Sidebar, Panels, Blocks, and AI Features.

### Key Findings at a Glance

| Category | Count | God Components (>300 lines) | Issues Found | Critical (P0) | High (P1) |
|----------|-------|------------------------------|--------------|---------------|-----------|
| Editor | 2 | 2 (NoteEditor: 1089, NotesPage: 975) | 15 | 2 | 5 |
| File Tree | 3 | 0 | 5 | 0 | 2 |
| Sidebar | 4 | 1 (NoteSidebar: 411) | 8 | 1 | 3 |
| Panels | 8 | 1 (ProjectFilesPanel: 429) | 6 | 0 | 2 |
| Blocks | 20 | 0 | 4 | 0 | 1 |
| AI Features | 12 | 0 | 8 | 0 | 3 |
| **TOTAL** | **60+** | **5** | **46** | **3** | **16** |

---

## Part 1: Complete Component Inventory

### 1.1 Editor Components (BlockNote)

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/NoteEditor.tsx` | Main BlockNote editor wrapper with auto-save, AI features, custom blocks | **1089** | God component, 8+ useEffect hooks, mixed concerns |
| 2 | `src/presentation/components/notes/NoteEditor.css` | Editor styling | 156 | N/A |
| 3 | `src/presentation/components/notes/NoteEditorEmpty.tsx` | Empty state placeholder | 28 | Minimal |
| 4 | `src/presentation/components/notes/BlockLoadingOverlay.tsx` | Loading overlay for editor | ~50 | Missing cleanup in useEffect |

### 1.2 File Tree Components

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/NoteTree.tsx` | Recursive tree rendering with filtering | 82 | Well-structured |
| 2 | `src/presentation/components/notes/NoteTreeItem.tsx` | Individual tree item with expand/collapse | 163 | Good structure |
| 3 | `src/presentation/components/notes/NotesFilePicker.tsx` | File picker for FSA handle selection | ~217 | Complex state |

### 1.3 Sidebar Components

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/NoteSidebar.tsx` | Main sidebar with search, favorites, view tabs | **411** | Over 300-line limit, inline handlers |
| 2 | `src/presentation/components/notes/NotesMobileLayout.tsx` | Mobile-optimized layout with tabs | 266 | Good structure |
| 3 | `src/presentation/components/notes/NoteContextMenu.tsx` | Context menu for notes | ~200+ | Mixed concerns |
| 4 | `src/presentation/components/notes/NoteSidebarChat.tsx` | Compact chat panel (E1-9) | ~150+ | Complex filtering |

### 1.4 Panel Components

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/ProjectFilesPanel.tsx` | File browser for Notes workspace | **429** | Complex useEffect, state management |
| 2 | `src/presentation/components/notes/NotesRAGSearch.tsx` | Semantic search panel | ~135 | Good structure |
| 3 | `src/presentation/components/notes/StorageIndicator.tsx` | Storage mode badge | ~70 | Minimal |
| 4 | `src/presentation/components/notes/NotesIndexingButton.tsx` | RAG indexing trigger | ~140 | Good structure |

### 1.5 Block Components (Custom BlockNote Blocks)

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `blocks/ImageBlock.tsx` | Inline image rendering | 158 | Good pattern |
| 2 | `blocks/CodeFileBlock.tsx` | Code file block | ~150+ | Good pattern |
| 3 | `blocks/FileAttachmentBlock.tsx` | Generic file attachment | ~150+ | Good pattern |
| 4 | `blocks/AIImageBlock.tsx` | AI image generation | ~200+ | Complex state |
| 5 | `blocks/AIVisionBlock.tsx` | AI vision analysis | ~200+ | Complex state |
| 6 | `blocks/StoryboardBlock.tsx` | Sequential multi-image | ~200+ | Complex state |
| 7 | `blocks/VideoBlock.tsx` | Video understanding | ~200+ | Complex state |
| 8 | `blocks/TTSBlock.tsx` | Text-to-speech | ~150+ | Good pattern |
| 9 | `blocks/ArtifactBlock.tsx` | Interactive HTML artifact | ~200+ | Complex state |
| 10 | `blocks/VideoGenerationBlock.tsx` | Video generation | ~200+ | Complex state |
| 11 | `blocks/SlidesExportBlock.tsx` | PowerPoint export | ~150+ | Good pattern |
| 12 | `blocks/ChartDiagramBlock.tsx` | Chart/diagram generation | ~200+ | Complex state |
| 13 | `blocks/TransformPipelineBlock.tsx` | Transformation pipeline | ~200+ | Complex state |
| 14 | `blocks/ArtifactGalleryBlock.tsx` | Artifact gallery | ~200+ | Complex state |
| 15 | `blocks/MultiStepGenerationBlock.tsx` | Multi-step generation | ~200+ | Complex state |
| 16 | `blocks/CalloutBlock.tsx` | Notion-style callouts | 204 | Good pattern |
| 17 | `blocks/ReferenceBlock.tsx` | Block references | ~200+ | Complex state |
| 18 | `blocks/ColumnBlock.tsx` | Column layouts | ~150+ | Good pattern |
| 19 | `blocks/SyncedBlock.tsx` | Synced blocks | ~150+ | Good pattern |
| 20 | `blocks/EmbedBlock.tsx` | Embed blocks | ~150+ | Good pattern |

### 1.6 AI Feature Components

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/AISlashCommand.tsx` | Slash command menu | ~300+ | Complex handlers |
| 2 | `src/presentation/components/notes/AITransformMenu.tsx` | AI transformation menu | ~303 | Complex state |
| 3 | `src/presentation/components/notes/AIPromptDialog.tsx` | AI prompt dialog | ~415 | God component potential |
| 4 | `src/presentation/components/notes/AIInsertionDialog.tsx` | AI insertion dialog | ~161 | Good structure |
| 5 | `src/presentation/components/notes/InBlockAIPopup.tsx` | In-block AI popup | ~247 | Complex handlers |
| 6 | `src/presentation/components/notes/FloatingAIButton.tsx` | Floating AI trigger | ~37 | Minimal |
| 7 | `src/presentation/components/notes/SlashCommandManager.tsx` | Slash command management | ~200+ | Complex state |
| 8 | `src/presentation/components/notes/PromptSuggestionsPanel.tsx` | AI suggestions panel | ~270 | Good structure |
| 9 | `src/presentation/components/notes/PromptHistoryPanel.tsx` | Prompt history | ~200+ | Good structure |
| 10 | `src/presentation/components/notes/PromptTemplatesDialog.tsx` | Prompt templates | ~200+ | Good structure |
| 11 | `src/presentation/components/notes/PromptRefinementDialog.tsx` | Prompt refinement | ~238 | Good structure |
| 12 | `src/presentation/components/notes/PromptShareDialog.tsx` | Share prompts | ~200+ | Good structure |

### 1.7 Import/Export Components

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/MarkdownImportDialog.tsx` | Markdown import | ~192 | Good structure |
| 2 | `src/presentation/components/notes/MarkdownExportDialog.tsx` | Markdown export | ~56 | Minimal |
| 3 | `src/presentation/components/notes/MultiModalImport.tsx` | PDF/Image import | ~307 | Complex state |
| 4 | `src/presentation/components/notes/VoiceRecordButton.tsx` | Voice recording | ~156 | Good pattern |

### 1.8 Study & Save Components

| # | File Path | Purpose | Lines | Issues |
|---|-----------|---------|-------|--------|
| 1 | `src/presentation/components/notes/NoteStudyMenu.tsx` | Study menu | ~100+ | Stub |
| 2 | `src/presentation/components/notes/SaveBlockDialog.tsx` | Save block to file | ~200+ | Good structure |
| 3 | `src/presentation/components/notes/MarkdownSyncConflictDialog.tsx` | Sync conflict resolution | ~200+ | Complex state |

---

## Part 2: BlockNote Editor Integration Analysis

### 2.1 Editor Instance Management

The `NoteEditor.tsx` component manages the BlockNote editor instance through:

**Key Hooks:**
- `useCreateBlockNote()` - Creates editor instance
- `useMemo()` for initial content sanitization
- Custom `useDebouncedCallback()` for auto-save

**Editor Lifecycle:**
```typescript
// Lines 687-692: Editor creation
const editor = useCreateBlockNote({
    schema,
    initialContent,
});

// Lines 763-774: Debounced save handler
const debouncedSave = useDebouncedCallback(
    async (blocks: any[]) => {
        await updateNote({ id: noteId, blocks });
    },
    500  // 500ms debounce
);
```

### 2.2 File Type Detection

**Locations:**
- `NoteEditor.tsx`: Block type validation (lines 195-205)
- `ProjectFilesPanel.tsx`: File extension detection (lines 51-56)

**Valid Block Types:**
```typescript
const validBlockTypes = new Set([
    'paragraph', 'heading', 'bulletListItem', 'numberedListItem',
    'todoItem', 'toggle', 'text', 'quote', 'callout', 'image',
    'codeFile', 'fileAttachment', 'aiImage', 'aiVision', 'storyboard',
    'videoAnalysis', 'ttsBlock', 'artifactBlock', 'videoGeneration',
    'codeBlock', 'table', 'divider', 'slidesExport', 'chartDiagram',
    'transformPipeline', 'artifactGallery', 'multiStepGeneration',
    'reference', 'column', 'synced'
]);
```

### 2.3 Editor State Persistence

**Scroll Position (Lines 716-761):**
- `useNoteNavigationStore` manages scroll positions per note
- Throttled save at 100ms
- `requestAnimationFrame` for restoration

**Save Status (Lines 450-451):**
- `useNoteSaveStatus()` hook tracks save state
- `useIsNoteIndexing()` tracks RAG indexing status

### 2.4 Editor Configuration

**Custom Schema (Lines 325-364):**
```typescript
const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        image: ImageBlock(),
        codeFile: CodeFileBlock(),
        fileAttachment: FileAttachmentBlock(),
        aiImage: AIImageBlock(),
        // ... 17 custom blocks
    },
});
```

**Theme & Editable (Lines 992-993):**
```typescript
theme="dark"
editable={!readOnly}
```

---

## Part 3: File Tree Component Analysis

### 3.1 Data Structure

**Tree Building (NoteTree.tsx:39-52):**
```typescript
const tree = useMemo(() => {
    let tree = buildTree(notes);
    if (searchQuery.trim()) {
        tree = filterTreeBySearch(tree, searchQuery);
    }
    if (showFavoritesOnly) {
        tree = filterTreeByFavorites(tree);
    }
    return tree;
}, [notes, searchQuery, showFavoritesOnly]);
```

**TreeNode Interface:**
```typescript
interface TreeNode {
    id: string;
    note: NoteRecord;
    children: TreeNode[];
}
```

### 3.2 File Operations

**Selection (NoteTreeItem.tsx:64-66):**
```typescript
const handleClick = () => {
    onNoteSelect(node.id);
};
```

**Favorites Toggle (NoteTreeItem.tsx:59-62):**
```typescript
const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(node.id);
};
```

**Expand/Collapse (NoteTreeItem.tsx:52-57):**
```typescript
const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
        toggleExpanded(node.id);
    }
};
```

### 3.3 File Icon/Thumbnail Handling

**NoteTreeItem.tsx:116:**
```typescript
<span className="text-lg flex-shrink-0">{node.note.emoji || '📄'}</span>
```

**ProjectFilesPanel.tsx: Image Preview (Lines 398-404):**
```typescript
{preview.fileType === 'image' && previewUrl && (
    <img
        src={previewUrl}
        alt={preview.fileName}
        className="max-w-full max-h-[60vh] object-contain rounded"
    />
)}
```

---

## Part 4: Sidebar Navigation Analysis

### 4.1 Navigation Structure

**NoteSidebar.tsx: Sidebar Views (Lines 94, 59):**
```typescript
type SidebarView = 'notes' | 'files' | 'rag';

const [sidebarView, setSidebarView] = useState<SidebarView>('notes');
```

**View Mode Tabs (Lines 144-199):**
- Notes View - Standard note list
- Files View - Project file browser
- RAG View - AI semantic search

### 4.2 Project Selector Logic

**ProjectSelector Slot (Lines 127-135):**
```typescript
{projectSelectorSlot && (
    <div className="space-y-1">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {t('notes.project', 'Project')}
        </label>
        {projectSelectorSlot}
    </div>
)}
```

### 4.3 Recent Notes/History

**Search with Debounce (Lines 97-103):**
```typescript
useEffect(() => {
    const timer = setTimeout(() => {
        setSearchQuery(localSearchQuery);
    }, 150);
    return () => clearTimeout(timer);
}, [localSearchQuery, setSearchQuery]);
```

---

## Part 5: Issues Identified

### 5.1 God Components (>300 lines)

| Component | Lines | Limit | Exceeds By | Primary Issues |
|-----------|-------|-------|------------|----------------|
| `NotesPage.tsx` | 975 | 300 | 225% | 8+ useEffect chains, PERF-07 memo band-aid, mixed mobile/desktop rendering |
| `NoteEditor.tsx` | 1089 | 300 | 263% | 7 custom blocks, complex sanitization, 5+ useEffect, inline handlers |
| `NoteSidebar.tsx` | 411 | 300 | 37% | Inline handlers, complex view toggle logic |
| `ProjectFilesPanel.tsx` | 429 | 300 | 43% | Complex useEffect, state management |
| `AIPromptDialog.tsx` | ~415 | 300 | 38% | Complex dialog state |

### 5.2 Duplicate Logic

| Issue | Locations | Impact |
|-------|-----------|--------|
| Block sanitization | `NoteEditor.tsx:192-319` AND inline in `useMemo` | Code duplication, maintenance burden |
| Scroll position restoration | `NoteEditor.tsx:716-738` AND `NotesPage.tsx` | Inconsistent behavior |
| File type detection | `ProjectFilesPanel.tsx:51-56` AND possibly elsewhere | Inconsistent handling |

### 5.3 Long useEffect Chains

**NotesPage.tsx (Lines 235-467):**
```
1. useEffect: loadNotes (lines 235-253) - 18 lines
2. useEffect: auto-init (lines 257-271) - 14 lines
3. useEffect: auto-import (lines 275-350) - 76 lines
4. useEffect: mobile sync (lines 353-357) - 4 lines
5. useEffect: createNote ref (lines 364-369) - 5 lines
6. useEffect: Knowledge export (lines 371-433) - 62 lines
7. useEffect: FILE_SAVED listener (lines 441-467) - 27 lines
```

**NoteEditor.tsx (Lines 709-761):**
```
1. useEffect: note content (lines 709-713) - 4 lines
2. useEffect: scroll restoration (lines 716-738) - 23 lines
3. useEffect: scroll save (lines 741-761) - 20 lines
```

### 5.4 Missing Error Boundaries

| Component | Status | Risk |
|-----------|--------|------|
| `NoteEditor` | ✅ Has ErrorBoundary (lines 978-986) | Protected |
| `BlockNoteView` | ✅ Wrapped | Protected |
| `NoteTree` | ❌ No ErrorBoundary | Risk of tree failure |
| `NoteSidebar` | ❌ No ErrorBoundary | Risk of sidebar failure |
| `ProjectFilesPanel` | ❌ No ErrorBoundary | Risk of file panel failure |

### 5.5 Memory Leaks

| Component | Issue | Location |
|-----------|-------|----------|
| `ProjectFilesPanel.tsx` | `useEffect` cleanup missing for `refreshKey` | Lines 101-106 |
| `NotesPage.tsx` | Multiple event listeners without proper cleanup tracking | Lines 441-467 |

### 5.6 Props Drilling

**Deep Prop Drilling Pattern:**
```
NotesPage → NoteSidebar → NoteTree → NoteTreeItem
                                          ↓
                                   useNoteNavigationStore
                                   useNoteStore
```

**Prop Count:**
- `NoteSidebarProps`: 13 props (lines 27-52)
- `NoteTreeProps`: 4 props (lines 17-23)
- `NoteTreeItemProps`: 5 props (lines 18-25)

### 5.7 Missing Loading States

| Component | Missing State | Impact |
|-----------|---------------|--------|
| `NoteTree` | No loading indicator during filter | Poor UX |
| `ProjectFilesPanel` | Loading state exists but incomplete | Partial |
| `NoteSidebar` | No loading for view switching | Poor UX |

### 5.8 Inline Handlers

**NoteSidebar.tsx (Lines 105-107):**
```typescript
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
};
```

**Recommendation:** These should be extracted to separate handlers for better testability.

### 5.9 Mixed Concerns

| Component | Mixed Concerns | Impact |
|-----------|----------------|--------|
| `NotesPage.tsx` | UI + file sync logic + event listeners | Hard to maintain |
| `NoteEditor.tsx` | UI + block sanitization + AI integration | Hard to maintain |
| `ProjectFilesPanel.tsx` | UI + file operations + preview | Hard to maintain |

### 5.10 Hardcoded Values

| Location | Value | Should Be |
|----------|-------|-----------|
| `NoteEditor.tsx:500` | `500` (debounce) | CONSTANT |
| `NoteEditor.tsx:750` | `100` (throttle) | CONSTANT |
| `NoteEditor.tsx:539` | `50` (max recursion) | CONSTANT |
| `NoteSidebar.tsx:98` | `150` (debounce) | CONSTANT |
| `ProjectFilesPanel.tsx:45-46` | File extensions | CONSTANT |

---

## Part 6: Cross-Dependencies

### 6.1 Hook Usage Matrix

| Component | useNoteStore | useNoteNavigationStore | useNoteSaveStatus | useIsNoteIndexing |
|-----------|--------------|------------------------|-------------------|-------------------|
| NotesPage | ✅ | ❌ | ❌ | ❌ |
| NoteEditor | ✅ | ✅ | ✅ | ✅ |
| NoteSidebar | ❌ | ✅ | ❌ | ❌ |
| NoteTree | ❌ | ✅ | ❌ | ❌ |
| NoteTreeItem | ✅ | ✅ | ❌ | ❌ |
| ProjectFilesPanel | ✅ | ❌ | ❌ | ❌ |
| NotesIndexingButton | ✅ | ❌ | ❌ | ❌ |
| NoteContextMenu | ✅ | ❌ | ❌ | ❌ |

### 6.2 State Store Dependencies

**useNoteStore (from `@/lib/notes/note-store`):**
- `notes` - Map of all notes
- `notesArray` - Array of notes for rendering
- `currentProjectId` - Active project
- `createNote()` - Create new note
- `updateNote()` - Update existing note
- `deleteNote()` - Delete note
- `toggleFavorite()` - Toggle favorite status
- `loadNotes()` - Load notes for project
- `loadAllNotes()` - Load all notes (browser mode)
- `setActiveNote()` - Set active note
- `saveNoteToFile()` - Export to file

**useNoteNavigationStore (from `@/lib/notes/note-navigation-store`):**
- `searchQuery` - Search text
- `setSearchQuery()` - Update search
- `showFavoritesOnly` - Filter flag
- `toggleFavoritesFilter()` - Toggle filter
- `expandedNodes` - Set of expanded node IDs
- `toggleExpanded()` - Toggle node expansion
- `noteScrollPositions` - Map of note ID to scroll position
- `setNoteScrollPosition()` - Save scroll position
- `getNoteScrollPosition()` - Get scroll position

### 6.3 Service Dependencies

| Component | Service | Purpose |
|-----------|---------|---------|
| NotesPage | `useFileSyncService` | File sync management |
| NotesPage | `useAllCrossWorkspaceEvents` | Cross-workspace events |
| NoteEditor | BlockNote APIs | Editor functionality |
| ProjectFilesPanel | `useWorkspaceSync` | File system access |
| ProjectFilesPanel | `FileTree` | IDE file tree component |

### 6.4 Prop Drilling Patterns

**Heavy Prop Passing:**
```
NotesPage → NoteSidebar:
  - notes, activeNoteId, onNoteSelect, onCreateNote
  - onImport, onExport, onFileSync, onSlashCommands
  - agentSelectorSlot, projectSelectorSlot
  - projectId, isBrowserMode

NoteSidebar → NoteTree:
  - notes, activeNoteId, onNoteSelect, isBrowserMode
```

---

## Part 7: Component Composition Patterns

### 7.1 Well-Structured Components

**NoteTree (82 lines):**
- ✅ Single responsibility
- ✅ Memoized computations
- ✅ Clean prop interface
- ✅ Uses store hooks properly

**NoteTreeItem (163 lines):**
- ✅ Clean separation
- ✅ Proper event handling
- ✅ Accessible markup
- ✅ Good inline component structure

**ImageBlock (158 lines):**
- ✅ Focused block spec
- ✅ Proper state management
- ✅ Clean render function
- ✅ Error handling

### 7.2 Needs Refactoring

**NotesPage (975 lines):**
- ❌ Needs: `useNotesPageState` hook
- ❌ Needs: `useFileSyncManager` hook
- ❌ Needs: Mobile/desktop layout split
- ❌ Needs: Event listener extraction

**NoteEditor (1089 lines):**
- ❌ Needs: `useBlockSanitizer` utility
- ❌ Needs: `useEditorInitialization` hook
- ❌ Needs: AI features extraction
- ❌ Needs: Scroll management extraction

**NoteSidebar (411 lines):**
- ❌ Needs: View tabs extraction
- ❌ Needs: Search handler extraction
- ❌ Needs: Action bar extraction

---

## Part 8: Recommendations

### Immediate (P0 - Before Phase 2)

1. **Split NotesPage**
   - Extract `useNotesPageState` hook (~200 lines)
   - Extract `useFileSyncManager` hook (~100 lines)
   - Split mobile/desktop layouts to separate components
   - Estimated reduction: 400 lines

2. **Split NoteEditor**
   - Extract block sanitization to utility (~100 lines)
   - Extract `useEditorSave` hook (~50 lines)
   - Extract AI features to separate component (~150 lines)
   - Estimated reduction: 300 lines

3. **Add Error Boundaries**
   - Add ErrorBoundary to NoteTree
   - Add ErrorBoundary to NoteSidebar
   - Add ErrorBoundary to ProjectFilesPanel

### Short-term (P1 - Sprint 1)

4. **Consolidate Constants**
   - Create `NOTE_EDITOR_CONSTANTS` export
   - Create `FILE_DETECTION_CONSTANTS` export
   - Create `DEBOUNCE_DELAYS` export

5. **Extract Inline Handlers**
   - Move handlers from NoteSidebar to dedicated functions
   - Move handlers from ProjectFilesPanel to dedicated functions

6. **Fix Memory Leaks**
   - Add proper cleanup to ProjectFilesPanel useEffect
   - Add cleanup tracking to NotesPage event listeners

### Medium-term (P2 - Sprint 2)

7. **Reduce Props Drilling**
   - Consider Context for note tree state
   - Consider direct store access in leaf components

8. **Improve Loading States**
   - Add loading indicators to NoteTree
   - Add loading states to NoteSidebar view switching
   - Improve ProjectFilesPanel loading feedback

9. **Document Block Components**
   - Add JSDoc to all block specs
   - Create block pattern documentation

### Long-term (P3 - Post-Stabilization)

10. **AI Features Consolidation**
    - Extract common AI dialog patterns
    - Create AI feature hooks library
    - Standardize AI prompt handling

11. **File Tree Optimization**
    - Virtualize large note lists
    - Add virtualization to ProjectFilesPanel
    - Optimize tree building algorithm

12. **Performance Monitoring**
    - Add render count tracking
    - Add useEffect timing
    - Create performance benchmark suite

---

## Part 9: File Inventory Summary

### Complete Notes Components Inventory

```
## Notes Components Inventory

### Editor (BlockNote)
1. src/presentation/components/notes/NoteEditor.tsx - Main editor wrapper - 1089 lines ⭐ GOD COMPONENT
2. src/presentation/components/notes/NoteEditor.css - Editor styling - 156 lines
3. src/presentation/components/notes/NoteEditorEmpty.tsx - Empty state - 28 lines
4. src/presentation/components/notes/BlockLoadingOverlay.tsx - Loading overlay - ~50 lines

### File Tree
1. src/presentation/components/notes/NoteTree.tsx - Recursive tree - 82 lines ✅ WELL-STRUCTURED
2. src/presentation/components/notes/NoteTreeItem.tsx - Tree item - 163 lines ✅ WELL-STRUCTURED
3. src/presentation/components/notes/NotesFilePicker.tsx - File picker - ~217 lines

### Sidebar
1. src/presentation/components/notes/NoteSidebar.tsx - Main sidebar - 411 lines ⚠️ OVER LIMIT
2. src/presentation/components/notes/NotesMobileLayout.tsx - Mobile layout - 266 lines ✅ WELL-STRUCTURED
3. src/presentation/components/notes/NoteContextMenu.tsx - Context menu - ~200+ lines
4. src/presentation/components/notes/NoteSidebarChat.tsx - Chat panel - ~150+ lines

### Panels
1. src/presentation/components/notes/ProjectFilesPanel.tsx - File browser - 429 lines ⚠️ OVER LIMIT
2. src/presentation/components/notes/NotesRAGSearch.tsx - RAG search - ~135 lines ✅ WELL-STRUCTURED
3. src/presentation/components/notes/StorageIndicator.tsx - Storage badge - ~70 lines
4. src/presentation/components/notes/NotesIndexingButton.tsx - Indexing trigger - ~140 lines

### Custom Blocks (20 total)
1. blocks/ImageBlock.tsx - Image rendering - 158 lines ✅ GOOD
2. blocks/CodeFileBlock.tsx - Code files - ~150+ lines
3. blocks/FileAttachmentBlock.tsx - Attachments - ~150+ lines
4. blocks/AIImageBlock.tsx - AI image gen - ~200+ lines
5. blocks/AIVisionBlock.tsx - AI vision - ~200+ lines
6. blocks/StoryboardBlock.tsx - Storyboard - ~200+ lines
7. blocks/VideoBlock.tsx - Video analysis - ~200+ lines
8. blocks/TTSBlock.tsx - Text-to-speech - ~150+ lines
9. blocks/ArtifactBlock.tsx - HTML artifacts - ~200+ lines
10. blocks/VideoGenerationBlock.tsx - Video gen - ~200+ lines
11. blocks/SlidesExportBlock.tsx - Slides export - ~150+ lines
12. blocks/ChartDiagramBlock.tsx - Charts/diagrams - ~200+ lines
13. blocks/TransformPipelineBlock.tsx - Pipeline - ~200+ lines
14. blocks/ArtifactGalleryBlock.tsx - Gallery - ~200+ lines
15. blocks/MultiStepGenerationBlock.tsx - Multi-step - ~200+ lines
16. blocks/CalloutBlock.tsx - Callouts - 204 lines ✅ GOOD PATTERN
17. blocks/ReferenceBlock.tsx - References - ~200+ lines
18. blocks/ColumnBlock.tsx - Columns - ~150+ lines
19. blocks/SyncedBlock.tsx - Synced blocks - ~150+ lines
20. blocks/EmbedBlock.tsx - Embeds - ~150+ lines

### AI Features
1. src/presentation/components/notes/AISlashCommand.tsx - Slash commands - ~300+ lines
2. src/presentation/components/notes/AITransformMenu.tsx - AI transform - ~303 lines
3. src/presentation/components/notes/AIPromptDialog.tsx - AI prompts - ~415 lines ⚠️ OVER LIMIT
4. src/presentation/components/notes/AIInsertionDialog.tsx - Insertion - ~161 lines
5. src/presentation/components/notes/InBlockAIPopup.tsx - In-block AI - ~247 lines
6. src/presentation/components/notes/FloatingAIButton.tsx - Float button - ~37 lines
7. src/presentation/components/notes/SlashCommandManager.tsx - Command manager - ~200+ lines
8. src/presentation/components/notes/PromptSuggestionsPanel.tsx - Suggestions - ~270 lines
9. src/presentation/components/notes/PromptHistoryPanel.tsx - History - ~200+ lines
10. src/presentation/components/notes/PromptTemplatesDialog.tsx - Templates - ~200+ lines
11. src/presentation/components/notes/PromptRefinementDialog.tsx - Refinement - ~238 lines
12. src/presentation/components/notes/PromptShareDialog.tsx - Sharing - ~200+ lines

### Import/Export
1. src/presentation/components/notes/MarkdownImportDialog.tsx - Import - ~192 lines
2. src/presentation/components/notes/MarkdownExportDialog.tsx - Export - ~56 lines
3. src/presentation/components/notes/MultiModalImport.tsx - Multi-modal - ~307 lines
4. src/presentation/components/notes/VoiceRecordButton.tsx - Voice - ~156 lines

### Study & Save
1. src/presentation/components/notes/NoteStudyMenu.tsx - Study menu - ~100+ lines
2. src/presentation/components/notes/SaveBlockDialog.tsx - Save dialog - ~200+ lines
3. src/presentation/components/notes/MarkdownSyncConflictDialog.tsx - Conflicts - ~200+ lines

### Index & Exports
1. src/presentation/components/notes/index.ts - Barrel export - 45 lines
2. src/presentation/components/notes/blocks/index.ts - Block exports
```

---

## Part 10: Investigation Evidence

### Files Analyzed

| Category | Count |
|----------|-------|
| Editor Components | 4 |
| File Tree Components | 3 |
| Sidebar Components | 4 |
| Panel Components | 4 |
| Block Components | 20 |
| AI Feature Components | 12 |
| Import/Export Components | 4 |
| Study/Save Components | 3 |
| **Total** | **60+** |

### Methods Used

- **glob**: File discovery by pattern (`src/presentation/components/notes/**/*`)
- **read**: Full content analysis with offset/limit
- **grep**: Pattern matching for hooks, imports, state
- **Symbol analysis**: TypeScript type hierarchy understanding

### Key File References

| File | Key Findings |
|------|--------------|
| `NotesPage.tsx:975` | God component with 8+ useEffects |
| `NoteEditor.tsx:1089` | God component with 5+ useEffects |
| `NoteSidebar.tsx:411` | Over limit with inline handlers |
| `ProjectFilesPanel.tsx:429` | Complex state management |
| `NoteTree.tsx:82` | Well-structured pattern |
| `NoteTreeItem.tsx:163` | Good separation of concerns |
| `CalloutBlock.tsx:204` | Good block pattern |

---

*Report created as part of Notes Space Investigation*
*Investigation ID: NOTES-COMPONENTS-LIFECYCLE*
*Date: 2026-01-20*
