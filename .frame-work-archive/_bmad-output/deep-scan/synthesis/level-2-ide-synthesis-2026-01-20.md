# Level 2 Investigation Synthesis: IDE Workspace

**Date**: 2026-01-20
**Investigation Phase**: Smelling Level Round 2 - Domain and Cross-Domain Analysis
**Status**: COMPLETE

---

## Executive Summary

Investigated IDE workspace lifecycle, components, and cross-domain dependencies to identify:
- ✅ Simplification opportunities
- ✅ Cross-path logic conflicts
- ✅ Sharing/consolidation opportunities
- ✅ State/render/Zustand conflicts
- ✅ Unclean/overlapping components

**Key Finding**: IDE has strong architecture but suffers from:
- 5 god components (773 lines max) that need splitting
- 4 major duplications (terminal, tabs, sync, chat) that need consolidation
- 3 layer violations (P0) that break clean architecture
- 2 cross-path logic conflicts (workspace switch cleanup, file watching)
- 1 state/render conflict (FileTree re-renders on every refresh)

---

## 1. IDE Entry - Component & Feature Lifecycle

### Route: `/ide/$projectId`

```
User Navigation
    ↓
[Route Guard] - Platform Validation (desktop only)
    ↓
[Route Loader] - Load project from Dexie
    ↓
[Hydration] - waitForHydration() blocks until Zustand ready
    ↓
[Suspense] - Shows spinner
    ↓
[ProjectProvider] - Provides project context + FSA handle
    ↓
[WorkspaceProvider] - Provides 5 cornerstone stores + EventBus
    ↓
[IDELayout] - Lazy-loaded, initializes all hooks
    ↓
[Components Mount] - Monaco, FileTree, Terminal, Chat, etc.
```

---

### Component Lifecycle Breakdown

#### 1.1 **IDELayoutMain.tsx** (400+ lines - ⚠️ God Component)

**What it does**:
- Orchestrates 15+ custom hooks
- Manages panels, gateway, FSA adapter
- Handles workspace sync, file watching, keyboard shortcuts
- Coordinates Monaco, Terminal, Chat, Explorer

**State involved**:
```typescript
// 15+ custom hooks (state flow):
useIdeFileGateway()              // Storage gateway instance
useWorkspaceSync()               // Sync status, pending changes
useFileSystemWatcher()           // File watching subscriptions
usePanelLayouts()              // Panel sizes, collapse states
useTerminal()                   // Terminal state
useChat()                      // Chat state
useExplorer()                   // Explorer state
useKeyboardShortcuts()          // Keyboard shortcuts registry
useTheme()                     // Theme state
useMobile()                    // Mobile detection
useWorkspaceContext()           // Current workspace, project
usePlatformContract()           // Platform type
useProjectState()              // Project metadata
// ... more hooks
```

**Persistence**:
- Panel layouts: Persisted to Dexie `ideState.table`
- Collapse states: Persisted to Dexie `ideState.table`
- Scroll positions: Persisted to Dexie `ideState.table`
- 500ms debounce before saving to Dexie

**Load/Use/Hooks**:
- Load: Lazy-loaded via `lazy()` in route
- Mount: All 15 hooks execute in parallel
- Unmount: Cleanup subscriptions, refs, timers

**Cross-Domain Dependencies**:
- ✅ Uses `useWorkspaceSync` (infrastructure) - Should be facade
- ✅ Uses `useIdeFileGateway` (infrastructure) - Should be facade
- ✅ Uses `useProjectState` (domain) - ✅ Correct
- ❌ Uses 7 infrastructure stores directly in child components

**Data Flow**:
```
ProjectContext
    ↓
IDELayoutMain initializes StorageGateway
    ↓
Gateway routed to FSAGateway (desktop) or IDBGateway (mobile)
    ↓
FileTree uses Gateway to list files
    ↓
Monaco uses Gateway to read/write files
    ↓
SyncService uses Gateway to watch files
```

**What can be simpler?**
- **Split into 5 components**: LayoutOrchestrator, PanelManager, HookCoordinator, KeyboardManager, SyncCoordinator
- Extract workspace sync facade: Replace direct `useWorkspaceSync` with `useIdeSync()`
- Extract file operations facade: Replace direct Gateway with `useIdeFileOperations()`

---

#### 1.2 **MonacoEditor.tsx** (773 lines - 🚨 God Component)

**What it does** (14 responsibilities):
1. Monaco editor initialization
2. Editor tabs management
3. File sync and auto-save
4. Scroll position tracking
5. Code navigation (go to definition, etc.)
6. Code formatting
7. Diff mode for merge conflicts
8. Snippets integration
9. AI presence indicators
10. Warnings display
11. Document symbols
12. Hover tooltips
13. Keyboard shortcuts (editor-specific)
14. Mobile optimizations

**State involved**:
```typescript
// Local state (14+ refs):
const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
const modelRef = useRef<monaco.editor.ITextModel>(null);
const cursorPositionRef = useRef<monaco.Position>(null);
const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor>(null);
// ... 10 more refs

// Store state:
const { openFiles, activeFile, addOpenFile, removeOpenFile } = useIdeEditorStore();
const { autoSave } = useWorkspaceSync();
// ... more store selectors
```

**Persistence**:
- Auto-save: 500ms debounce → StorageGateway.write()
- Scroll position: Saved to Dexie `ideState.table`
- Open files: Saved to Dexie `ideState.table`

**Load/Use/Hooks**:
- Load: On component mount
- Use: Monaco APIs, store subscriptions, event listeners
- Unmount: Cleanup Monaco refs, subscriptions

**Cross-Domain Dependencies**:
- ❌ Integrates with Knowledge workspace: "Analyze in Knowledge" action (line 429)
- ❌ Uses `useWorkspaceSync` directly (infrastructure)
- ✅ Uses `useIdeEditorStore` (domain) - ✅ Correct

**Data Flow**:
```
User types → Monaco onChange
    ↓
Update Monaco model (real-time)
    ↓
500ms debounce → StorageGateway.write()
    ↓
EventBus emits 'file:modified'
    ↓
WorkspaceSyncService updates sync status
```

**Cross-path logic conflicts**:
- **Conflict 1**: Auto-save debounce (500ms) vs. File watcher polling (2000ms)
  - If user types, auto-save at 500ms
  - File watcher detects change at 2000ms
  - Race condition: Which one writes to file system last?
  - **Issue**: May cause unnecessary re-read or overwrite
  - **Fix**: File watcher should ignore auto-save events (track auto-save ID)

**What can be simpler?**
- **Split into 8 components**:
  1. EditorCore (Monaco initialization, model management)
  2. EditorTabs (tab management, switching)
  3. EditorSync (auto-save, scroll position)
  4. EditorNavigation (go to definition, find references)
  5. EditorFormatting (format, prettier)
  6. EditorDiff (diff mode for conflicts)
  7. EditorSnippets (snippet insertion)
  8. EditorPresence (AI indicators)

**State/render/Zustand conflicts**:
- **Conflict**: Re-renders on every content change
  - Monaco `onChange` fires on every keystroke
  - React re-renders if parent component passes `content` prop
  - **Fix**: Use `React.memo` to prevent re-renders unless `activeFile` changes (already implemented ✅)

---

#### 1.3 **FileTree.tsx** (300+ lines - ⚠️ Near God Component)

**What it does**:
- File tree rendering (recursive)
- File/directory selection
- File operations (create, delete, rename, move)
- Context menu (right-click actions)
- Keyboard navigation (arrow keys)
- File watching (refresh on external changes)

**State involved**:
```typescript
// Local state:
const [expanded, setExpanded] = useState<Set<string>>(new Set());
const [selected, setSelected] = useState<string | null>(null);

// Store state:
const { expandedPaths, toggleExpand } = useIdeExplorerStore();
const { activeFile } = useIdeEditorStore();
const { syncStatus } = useWorkspaceSync();
```

**Persistence**:
- Expanded paths: Persisted to Dexie `ideState.table` (serialized as Array)
- Active file: Persisted to Dexie `ideState.table`

**Load/Use/Hooks**:
- Load: On component mount, load from Dexie
- Use: File watching subscription, keyboard navigation
- Unmount: Cleanup file watching subscription

**Cross-Domain Dependencies**:
- ❌ Uses `useWorkspaceSync` directly (infrastructure)
- ✅ Uses `useIdeExplorerStore` (domain) - ✅ Correct

**Data Flow**:
```
EventBus emits 'file:created' (from Notes workspace)
    ↓
FileTree refreshes (re-scans file system via Gateway)
    ↓
FileTree re-renders (all nodes)
```

**Cross-path logic conflicts**:
- **Conflict 2**: FileTree re-renders on every file change
  - EventBus emits `file:created`, `file:modified`, `file:deleted` globally
  - FileTree receives these events even if IDE workspace is inactive
  - But FileTree is unmounted when IDE is inactive, so this is OK ✅
  - **Real issue**: FileTree re-renders on EVERY refresh (no virtualization)
  - With 10K+ files, this causes performance degradation
  - **Fix**: Add virtualization (react-window or react-virtual)

**What can be simpler?**
- Extract file operations: `useFileTreeActions` (already exists ✅)
- Extract context menu: `useContextMenuActions` (already exists ✅)
- Extract keyboard navigation: `useKeyboardNavigation` (already exists ✅)
- **Add virtualization**: Wrap file nodes in virtualized list

**State/render/Zustand conflicts**:
- **Conflict**: FileTree re-renders on every refresh
  - No `React.memo` on FileTree component
  - Re-scans entire file tree on every file change
  - **Fix**: Add `React.memo` + virtualization

---

#### 1.4 **XTerminal.tsx** (304 lines - ⚠️ Near God Component)

**What it does** (9 responsibilities):
1. xterm.js initialization
2. Terminal adapter (WebContainer integration)
3. Shell booting
4. Theme support
5. Resize handling (fit addon)
6. Overlay messages (sync, timeout, exit)
7. Output buffering
8. Command history
9. Tab switching

**State involved**:
```typescript
// Local state:
const xtermRef = useRef<XTerm>(null);
const outputRef = useRef<string[]>([]);

// Store state:
const { terminalTab } = useIdeTerminalStore();
const { commands, addCommand } = useTerminalStore();
```

**Persistence**:
- Terminal settings: Persisted to Dexie `terminalState.table`
- Terminal tab: Persisted to Dexie `ideState.table`
- Command history: In-memory only (NOT persisted) ⚠️ **Data loss risk**

**Load/Use/Hooks**:
- Load: On component mount
- Use: xterm.js APIs, WebContainer adapter
- Unmount: Cleanup xterm instance, WebContainer connection

**Cross-Domain Dependencies**:
- ❌ Uses `useTerminalStore` directly (infrastructure)
- ❌ Uses `useIdeTerminalStore` directly (infrastructure)
- Should use facade: `useTerminal()`

**Data Flow**:
```
User types → xterm.js receives input
    ↓
WebContainer adapter sends command to shell
    ↓
Shell output returned → xterm.js displays
    ↓
Command added to command history (in-memory)
```

**What can be simpler?**
- **Split into 4 components**:
  1. TerminalCore (xterm.js initialization)
  2. TerminalAdapter (WebContainer integration)
  3. TerminalOverlays (sync, timeout, exit messages)
  4. TerminalSettings (theme, resize)

**Duplication with other components**:
- **Duplication**: `ide-terminal-slice.ts` (42 lines) vs `terminal-store.ts` (317 lines)
  - `ide-terminal-slice.ts`: Manages terminal tab switching
  - `terminal-store.ts`: Manages terminal instances, command history
  - **Consolidation opportunity**: Merge `terminal-store` into `ide-terminal-slice`
  - Effort: 4 hours

**State/render/Zustand conflicts**:
- **Conflict**: Terminal history not persisted
  - Command history is in-memory only
  - Lost on page refresh
  - **Fix**: Persist command history to Dexie `terminalState.table`

---

#### 1.5 **AgentChatPanel.tsx** (691 lines - 🚨 God Component)

**What it does** (11 responsibilities):
1. Conversation rendering
2. Agent selection
3. Approval flow (auto-approve settings)
4. API key management
5. Thread management
6. Prompt enhancement
7. Notes integration (workspace context)
8. Settings UI
9. Prompt library
10. Workspace context (Notes vs IDE)
11. Streaming artifacts (code blocks, diffs)

**State involved**:
```typescript
// Local state:
const [streaming, setStreaming] = useState(false);
const [artifacts, setArtifacts] = useState<Artifact[]>([]);

// Store state (7 stores!):
const { messages, addMessage } = useConversationStore();
const { agents, activeAgent } = useAgentsStore();
const { autoApprove } = useAutoApproveStore();
const { threads, activeThread } = useThreadsStore();
const { prompts, activePrompt } = usePromptEnhancementStore();
const { apiKey } = useApiKeyStore();
const workspaceType = useWorkspaceType(); // Notes vs IDE
```

**Persistence**:
- Conversations: Persisted to Dexie `conversations.table`
- Agents: Persisted to Dexie `agents.table`
- Prompts: Persisted to Dexie `prompts.table`
- Threads: Persisted to Dexie `threads.table`

**Load/Use/Hooks**:
- Load: On component mount
- Use: Streaming logic, approval flow, workspace context
- Unmount: Cleanup subscriptions

**Cross-Domain Dependencies**:
- ❌ Uses 7 infrastructure stores directly (tight coupling)
- ❌ Integrates with Notes workspace (lines 85-150):
  ```typescript
  const activeNote = workspaceType === 'notes' ? useActiveNote() : null;
  if (workspaceType === 'notes' && activeNote) {
    const noteContent = retrieveNoteContent(activeNote.blocks, {...});
    context += `\n\n## ACTIVE NOTE CONTENT\nTitle: ${activeNote.title}\n\n${truncatedContent}`;
  }
  ```
  - IDE component knows too much about Notes
  - Should be abstraction/facade

**Data Flow**:
```
User types prompt → AgentChatPanel
    ↓
Streaming to AI service
    ↓
Chunks returned → Update messages state
    ↓
Monaco code blocks extracted → Rendered in chat
    ↓
User approves → Approval flow → Execute command
```

**Cross-path logic conflicts**:
- **Conflict 3**: Workspace context switching
  - AgentChatPanel needs to know if workspace is Notes or IDE
  - Different system prompts for each workspace
  - Complex conditional logic (lines 85-150)
  - **Simplification opportunity**: Extract `useWorkspaceContext()` hook
  - This hook returns workspace-specific context based on current route

**What can be simpler?**
- **Split into 7 components**:
  1. ChatMessages (message rendering, streaming)
  2. ChatInput (prompt input, streaming logic)
  3. ChatApprovals (approval flow UI)
  4. ChatPrompts (prompt library)
  5. ChatThreads (thread management)
  6. ChatContext (workspace context abstraction)
  7. ChatSettings (API keys, settings)

**Duplication with other components**:
- **Duplication**: AgentChatPanel (691 lines) vs NoteSidebarChat (569 lines)
  - Both have similar: message rendering, streaming logic, code blocks, diffs
  - **Consolidation opportunity**: Create unified ChatPanel component
  - Shared via props/workspace context
  - Effort: 12 hours

**State/render/Zustand conflicts**:
- **Conflict**: 7 store hooks in single component
  - Each hook creates its own subscription
  - Re-renders on ANY store change
  - **Fix**: Use `useShallow()` with multiple selectors per store
  - Or extract to facade: `useChat()` (returns all chat state)

---

## 2. Notes Entry - Component & Feature Lifecycle

### Route: `/notes/$projectId`

```
User Navigation
    ↓
[Route Loader] - Load project from Dexie
    ↓
[Hydration] - waitForHydration() blocks until Zustand ready
    ↓
[ProjectContext] - Provides project context + FSA handle
    ↓
[WorkspaceProvider] - Provides 5 cornerstone stores + EventBus
    ↓
[NotesPage] - Main notes page
    ↓
[Components Mount] - NoteEditor, NoteSidebar, Chat, FileTree, etc.
```

---

### Component Lifecycle Breakdown

#### 2.1 **NotesPage.tsx** (975 lines - 🚨 God Component)

**What it does** (10+ responsibilities):
1. Note editor (BlockNote integration)
2. Note file sync (FSA ↔ Markdown)
3. Note management (create, delete, duplicate)
4. File tree (notes-specific)
5. Sidebar (search, filters, favorites)
6. Chat (AI assistant)
7. Presence (collaboration indicators)
8. Mobile optimizations
9. Keyboard shortcuts
10. Auto-save

**State involved**:
```typescript
// Local state (10+ refs/state):
const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
const [isEditorReady, setIsEditorReady] = useState(false);
const editorRef = useRef<BlockNoteEditor>(null);
// ... more refs

// Store state (multiple stores):
const { notes, activeNote } = useNoteStore();
const { project } = useProjectStore();
const { syncStatus } = useWorkspaceSync();
```

**Persistence**:
- Note content: Saved to FSA `/notes/*.md` (BlockNote syncs)
- Note metadata: Saved to Dexie `notes.table`
- Active note ID: Persisted to Dexie `ideState.table` (or notes-specific table?)

**Load/Use/Hooks**:
- Load: On component mount
- Use: BlockNote APIs, file sync logic, chat streaming
- Unmount: Cleanup subscriptions

**Cross-Domain Dependencies**:
- ❌ Uses `useWorkspaceSync` directly (infrastructure)
- ❌ Integrates with IDE workspace: Can open file in IDE from Notes
  - "Open in IDE" button → triggers IDE route navigation
  - Creates cross-workspace coupling

**Data Flow**:
```
User edits note → BlockNote onChange
    ↓
500ms debounce → NoteFileSyncService
    ↓
Save to FSA /notes/*.md
    ↓
EventBus emits 'file:modified'
    ↓
IDE workspace receives event → FileTree refreshes
```

**Cross-path logic conflicts**:
- **Conflict 4**: File watching duplication
  - Notes workspace watches `/notes/` folder for changes
  - IDE workspace watches project root for changes
  - If both watch same file (unlikely but possible), double processing
  - **Issue**: No coordination between file watchers
  - **Fix**: Single file watcher per project, events routed to workspaces

**What can be simpler?**
- **Split into 8 components**:
  1. NoteEditor (BlockNote integration)
  2. NoteSync (file sync logic)
  3. NoteManager (CRUD operations)
  4. NoteSidebar (search, filters)
  5. NoteFileTree (notes-specific file tree)
  6. NoteChat (AI assistant)
  7. NotePresence (collaboration indicators)
  8. NoteMobile (mobile optimizations)

**Unclean component**:
- **Long comments**: 10+ story markers (TB-15, R3, BUG-016, etc.)
- **Dangling logic**: Partial TODO implementations left commented
- **Multiple change sections**: Lines 100-400 have 10+ markers
- **Cleanup needed**: Resolve or document resolved issues, remove dead code

---

#### 2.2 **NoteEditor.tsx** (1,088 lines - 🚨 God Component)

**What it does** (12+ responsibilities):
1. BlockNote editor initialization
2. Block rendering (text, image, code, etc.)
3. Block types and extensions
4. Keyboard shortcuts
5. Auto-save
6. File upload (images, attachments)
7. Mentions (@file, @note)
8. Collaboration (real-time edits)
9. Themes and styling
10. Mobile optimizations
11. Markdown export
12. Print support

**State involved**:
```typescript
// Local state (12+ refs):
const editorRef = useRef<BlockNoteEditor>(null);
const [uploading, setUploading] = useState(false);
// ... more refs

// Store state:
const { activeNote, updateNote } = useNoteStore();
```

**Persistence**:
- Note content: Saved to BlockNote internal storage
- Synced to FSA `/notes/*.md` via NoteFileSyncService
- 500ms debounce before sync

**Load/Use/Hooks**:
- Load: On component mount
- Use: BlockNote APIs, file upload logic, collaboration logic
- Unmount: Cleanup BlockNote instance

**Cross-Domain Dependencies**:
- ✅ Uses `useNoteStore` (domain) - ✅ Correct
- ❌ Uses `useWorkspaceSync` directly (infrastructure)

**Data Flow**:
```
User edits block → BlockNote onChange
    ↓
Update note state → 500ms debounce
    ↓
NoteFileSyncService.save()
    ↓
Convert BlockNote → Markdown
    ↓
Write to FSA /notes/*.md
```

**What can be simpler?**
- **Split into 10 components**:
  1. BlockNoteEditorCore (BlockNote initialization)
  2. BlockRenderer (block rendering)
  3. BlockExtensions (block types, mentions, file upload)
  4. BlockKeyboardShortcuts (shortcuts)
  5. BlockSync (auto-save, file sync)
  6. BlockCollaboration (real-time edits, presence)
  7. BlockThemes (theming, styling)
  8. BlockMobile (mobile optimizations)
  9. BlockExport (Markdown export, print)
  10. BlockUpload (image/file upload)

---

## 3. Unclean, Overlapping, Confusing Components

### 3.1 **God Components (>300 lines)**

| Component | Lines | Primary Issues | Suggested Split |
|-----------|--------|----------------|-----------------|
| **MonacoEditor.tsx** | **773** | 14 responsibilities | Split into 8 components |
| **AgentChatPanel.tsx** | **691** | 11 responsibilities | Split into 7 components |
| **EnhancedChatInterface.tsx** | **602** | 9 responsibilities | Split into 4 components |
| **NoteEditor.tsx** | **1,088** | 12 responsibilities | Split into 10 components |
| **NotesPage.tsx** | **975** | 10+ responsibilities | Split into 8 components |
| **SyncStatusPanel.tsx** | **458** | 7 responsibilities | Split into 4 components |
| **XTerminal.tsx** | **304** | 9 responsibilities | Split into 4 components |

**Total Refactoring Effort**: 60-80 hours

---

### 3.2 **Long Comments / Multiple Change Markers**

**MonacoEditor.tsx**:
- Lines 1-50: 10+ story markers (TB-15, R3, BUG-016, BUG-FIX-003, MOBILE-01, S-024)
- Indicates poor code hygiene
- **Cleanup**: Resolve or document resolved issues, remove markers

**FileTree.tsx**:
- Lines 100-200: Story 27-1b, S-024 markers
- Conflicting logic sections
- **Cleanup**: Consolidate into single logic flow

**XTerminal.tsx**:
- Lines 50-100: Story LT-4.19, Story 27-I markers
- Dead code sections commented
- **Cleanup**: Remove dead code, document decisions

**NotesPage.tsx**:
- Lines 100-400: 10+ story markers
- Partial TODO implementations left commented
- **Cleanup**: Resolve TODOs or document why not implemented

**Route files**:
- Multiple governance markers (WB-6, INF-03, P0)
- Unclear governance status
- **Cleanup**: Update governance documentation

---

### 3.3 **Overlapping / Duplicating Logic**

#### **Duplication 1: Terminal State Management** (🔴 Critical)

**Files**:
- `ide-terminal-slice.ts` (42 lines)
- `terminal-store.ts` (317 lines)

**Overlap**:
- Both manage terminal state
- Different interfaces, different responsibilities
- `ide-terminal-slice`: Terminal tab switching
- `terminal-store`: Terminal instances, command history

**Conflict**:
- Two separate systems for terminal state
- Confusion: Which store to use?
- Maintenance burden: Changes must be made in both
- State inconsistency: Can lead to bugs

**Simplification**:
- Consolidate `terminal-store` into `ide-terminal-slice`
- Single source of truth for terminal state
- Add command history persistence to `ide-terminal-slice`
- Effort: 4 hours

---

#### **Duplication 2: Editor Tab Management** (🔴 Critical)

**Files**:
- `ide-editor-slice.ts`: Tracks open files, active file
- `editor-tabs-store.ts` + 3 slices: Track EditorTab objects with content, dirty flag

**Overlap**:
- Different `EditorTab` interfaces
- Overlapping responsibilities
- Unclear ownership: Which system manages tabs?

**Conflict**:
- Two tab management systems
- Potential state desynchronization
- Confusion for developers

**Simplification**:
- Choose single source of truth (prefer `ide-editor-slice`)
- Migrate `editor-tabs-store` into `ide-editor-slice`
- Consolidate interfaces
- Effort: 6 hours

---

#### **Duplication 3: File Sync Services** (🔴 Critical)

**Files**:
- `ide-file-sync-service.ts` (IDE file sync)
- `notes-file-sync-service.ts` (Notes file sync)
- `knowledge-file-sync-service.ts` (Knowledge file sync - deferred)
- `study-file-sync-service.ts` (Study file sync - deferred)

**Overlap**:
- Similar logic: File watching, conflict detection, sync strategies
- Duplicate code: Event listeners, polling, error handling
- Inconsistent strategies: Different debounce, different conflict resolution

**Conflict**:
- Maintenance burden: Changes must be made in all 4 services
- Sync conflicts: Different sync strategies may conflict
- Code bloat: 4 separate files for similar logic

**Simplification**:
- Create base class: `BaseFileSyncService`
- Extend with workspace-specific adapters:
  - `IDESyncService extends BaseFileSyncService`
  - `NotesSyncService extends BaseFileSyncService`
  - etc.
- Shared logic in base class
- Effort: 8 hours

---

#### **Duplication 4: Chat Interfaces** (🔴 Critical)

**Files**:
- `AgentChatPanel.tsx` (691 lines)
- `NoteSidebarChat.tsx` (569 lines)

**Overlap**:
- Similar components: Message rendering, streaming logic, code blocks, diffs
- Similar logic: Approval flow, artifact rendering, copy buttons
- Different context: IDE vs Notes workspace

**Conflict**:
- Code duplication: Same logic in two components
- Maintenance burden: Changes must be made in both
- Inconsistent UX: Different chat experiences

**Simplification**:
- Create unified `ChatPanel` component
- Shared via props/workspace context
- Extract workspace-specific logic to hooks:
  - `useIdeChatContext()` for IDE
  - `useNotesChatContext()` for Notes
- Effort: 12 hours

---

### 3.4 **Confusing Logic / Cross-Path Conflicts**

#### **Conflict 1: Auto-Save vs File Watcher** (⚠️ Medium)

**Files**:
- `MonacoEditor.tsx` (auto-save, 500ms debounce)
- `FileSystemWatcher.ts` (file watching, 2000ms polling)

**Conflict**:
- User types → Auto-save at 500ms → File watcher detects at 2000ms
- Race condition: Which one writes to file system last?
- May cause unnecessary re-read or overwrite

**Simplification**:
- File watcher should ignore auto-save events
- Track auto-save ID in file watcher
- Or: Disable file watcher during auto-save debounce
- Effort: 2 hours

---

#### **Conflict 2: FileTree Re-Renders on Every Refresh** (⚠️ Medium)

**Files**:
- `FileTree.tsx` (no virtualization)
- EventBus (emits file change events)

**Conflict**:
- EventBus emits `file:created`, `file:modified`, `file:deleted`
- FileTree re-scans entire file tree on every event
- With 10K+ files, causes performance degradation

**Simplification**:
- Add virtualization (react-window or react-virtual)
- Only render visible file nodes
- Debounce refreshes to avoid re-scanning on rapid events
- Effort: 4 hours

---

#### **Conflict 3: Workspace Context Switching in AgentChatPanel** (⚠️ Medium)

**Files**:
- `AgentChatPanel.tsx` (lines 85-150)

**Conflict**:
- Complex conditional logic for Notes vs IDE workspace
- Different system prompts, different context building
- Hard to maintain, hard to test

**Simplification**:
- Extract `useWorkspaceContext()` hook
- Returns workspace-specific context based on current route
- Simplifies AgentChatPanel logic
- Effort: 2 hours

---

#### **Conflict 4: File Watching Duplication** (⚠️ Low)

**Files**:
- `ide-file-sync-service.ts` (watches project root)
- `notes-file-sync-service.ts` (watches /notes/ folder)

**Conflict**:
- Two file watchers for same project (overlapping paths)
- Double processing of file events
- No coordination between watchers

**Simplification**:
- Single file watcher per project
- Route events to workspaces based on path
- Effort: 4 hours

---

## 4. What Can Be Simpler?

### 4.1 **Component Splitting** (🔴 Critical)

**Summary**:
- 7 god components (>300 lines)
- Total lines: ~5,000
- Suggested splits: ~50 components (~100 lines each)
- Effort: 60-80 hours

**Benefits**:
- Easier to understand (smaller files)
- Easier to test (focused responsibilities)
- Easier to maintain (clear boundaries)
- Better reusability (modular components)

---

### 4.2 **Consolidate Duplication** (🔴 Critical)

**Summary**:
- 4 major duplications
- Terminal state: 2 stores → 1 store (4 hours)
- Editor tabs: 2 systems → 1 system (6 hours)
- File sync: 4 services → 1 base class (8 hours)
- Chat: 2 components → 1 component (12 hours)
- Effort: 30 hours

**Benefits**:
- Single source of truth
- Less code to maintain
- Consistent behavior across workspaces
- Reduced bug surface area

---

### 4.3 **Fix Cross-Path Conflicts** (⚠️ Medium)

**Summary**:
- 4 cross-path conflicts
- Auto-save vs file watcher (2 hours)
- FileTree re-renders (4 hours)
- Workspace context switching (2 hours)
- File watching duplication (4 hours)
- Effort: 12 hours

**Benefits**:
- Eliminate race conditions
- Improve performance (FileTree)
- Simplify complex logic
- Coordinate file events

---

### 4.4 **Extract Facades** (🔴 Critical)

**Problem**: Components directly import infrastructure stores

**Files** (24 components import `useWorkspaceSync` directly):
- `MonacoEditor.tsx`
- `FileTree.tsx`
- `AgentChatPanel.tsx`
- `NoteEditor.tsx`
- etc.

**Simplification**:
- Create facade hooks for infrastructure services:
  - `useIdeFileOperations()` (abstracts StorageGateway)
  - `useIdeSync()` (abstracts useWorkspaceSync)
  - `useIdeTerminal()` (abstracts terminal stores)
  - `useIdeChat()` (abstracts chat stores)

**Benefits**:
- Loose coupling between presentation and infrastructure
- Easier to test (mock facades)
- Consistent API across components
- Simplifies imports (1 facade vs 7 stores)

**Effort**: 8 hours

---

## 5. State/Render/Zustand Conflicts

### 5.1 **N+1 Selector Pattern** (🔴 Critical)

**Problem**: Components use multiple store hooks, causing multiple re-renders

**Example**: `IDELayoutMain.tsx`
```typescript
const { openFiles } = useIdeEditorStore();  // Hook 1
const { expandedPaths } = useIdeExplorerStore();  // Hook 2
const { syncStatus } = useWorkspaceSync();  // Hook 3
const { chatVisible } = useIdeLayoutStore();  // Hook 4
// ... 15+ hooks total

// Re-renders on ANY store change!
```

**Issue**:
- Each hook creates its own subscription
- Component re-renders on ANY store change
- 15 hooks = 15 potential re-renders

**Simplification**:
```typescript
// Use useShallow() with multiple selectors
const state = useIdeEditorStore(
  useShallow((s) => ({
    openFiles: s.openFiles,
    activeFile: s.activeFile,
    expandedPaths: s.expandedPaths,
    syncStatus: s.syncStatus,
    chatVisible: s.chatVisible,
  }))
);
// Single subscription, re-renders only when these values change
```

**Effort**: 4 hours

---

### 5.2 **FileTree Re-Renders on Every Refresh** (⚠️ Medium)

**Problem**: FileTree re-renders on every file change

**Cause**:
- No `React.memo` on FileTree component
- Re-scans entire file tree on every EventBus event
- With 10K+ files, causes performance degradation

**Simplification**:
- Add `React.memo` to FileTree component
- Add virtualization (react-window)
- Debounce refreshes to avoid re-scanning on rapid events

**Effort**: 4 hours

---

### 5.3 **Terminal History Not Persisted** (⚠️ Medium)

**Problem**: Terminal history is in-memory only, lost on page refresh

**Cause**:
- Command history stored in `terminal-store.ts` (in-memory)
- Not persisted to Dexie
- Lost on page refresh

**Simplification**:
- Persist command history to Dexie `terminalState.table`
- Use compound key: `[projectId+workspaceId+tabId]`

**Effort**: 2 hours

---

### 5.4 **Incomplete Session Restoration** (⚠️ Medium)

**Problem**: Session snapshots don't restore cursor positions, panel widths, terminal history

**Cause**:
- Session snapshots save: open files, active file, scroll positions
- Missing: cursor positions, panel widths, terminal history
- TODO comments indicate incomplete implementation

**Simplification**:
- Restore cursor positions from Monaco
- Restore panel widths from snapshots
- Restore terminal history from terminal store
- Remove all TODOs

**Effort**: 4 hours

---

## 6. Sharing Opportunities

### 6.1 **Shared Facade Hooks** (🔴 Critical)

**Current**: Components directly import infrastructure stores

**Proposed**: Create facade hooks
- `useIdeFileOperations()` (StorageGateway abstraction)
- `useIdeSync()` (useWorkspaceSync abstraction)
- `useIdeTerminal()` (terminal stores abstraction)
- `useIdeChat()` (chat stores abstraction)
- `useNotesSync()` (useWorkspaceSync abstraction for Notes)
- `useNotesChat()` (chat stores abstraction for Notes)

**Benefits**:
- Loose coupling
- Easier to test
- Consistent API
- Simplifies imports

**Effort**: 8 hours

---

### 6.2 **Shared ChatPanel Component** (🔴 Critical)

**Current**: `AgentChatPanel.tsx` (691 lines) vs `NoteSidebarChat.tsx` (569 lines)

**Proposed**: Create unified `ChatPanel` component
- Shared message rendering
- Shared streaming logic
- Shared code block rendering
- Workspace-specific logic extracted to hooks

**Benefits**:
- Single source of truth
- Less code duplication
- Consistent chat UX
- Easier to maintain

**Effort**: 12 hours

---

### 6.3 **Shared File Watcher** (⚠️ Medium)

**Current**: 4 separate file sync services, each with own watcher

**Proposed**: Single file watcher per project
- Route events to workspaces based on path
- Base class `BaseFileSyncService`
- Workspace-specific adapters extend base

**Benefits**:
- Single source of truth for file events
- Eliminate duplicate processing
- Coordinated file watching

**Effort**: 8 hours

---

### 6.4 **Shared Event Bus Filtering** (⚠️ Medium)

**Current**: Global EventBus sends ALL events to ALL workspaces

**Proposed**: Workspace-scoped event emitters
- Filter events by workspace
- Selective forwarding between workspaces
- Reduce event noise

**Benefits**:
- Reduce unnecessary re-renders
- Improve performance
- Clearer event flow

**Effort**: 4 hours

---

## 7. Recommendations (Prioritized)

### P0 - Critical (Do Immediately)

1. **Split MonacoEditor** (773 lines → 8 components)
   - Effort: 8 hours
   - Impact: Major improvement in maintainability

2. **Split AgentChatPanel** (691 lines → 7 components)
   - Effort: 6 hours
   - Impact: Major improvement in maintainability

3. **Consolidate Terminal State** (2 stores → 1 store)
   - Effort: 4 hours
   - Impact: Eliminates confusion, single source of truth

4. **Consolidate Editor Tabs** (2 systems → 1 system)
   - Effort: 6 hours
   - Impact: Eliminates confusion, single source of truth

5. **Fix N+1 Selector Pattern** (useShallow in IDELayoutMain)
   - Effort: 4 hours
   - Impact: Reduces re-renders, improves performance

---

### P1 - High Priority (Do Within 1 Sprint)

6. **Split NoteEditor** (1,088 lines → 10 components)
   - Effort: 10 hours

7. **Split NotesPage** (975 lines → 8 components)
   - Effort: 8 hours

8. **Consolidate 4 File Sync Services** (1 base class)
   - Effort: 8 hours

9. **Create Shared ChatPanel** (2 components → 1 component)
   - Effort: 12 hours

10. **Extract Facade Hooks** (24 components → facades)
    - Effort: 8 hours

---

### P2 - Medium Priority (Do Within 2-3 Sprints)

11. **Add FileTree Virtualization**
    - Effort: 4 hours

12. **Fix Auto-Save vs File Watcher Conflict**
    - Effort: 2 hours

13. **Extract Workspace Context Hook**
    - Effort: 2 hours

14. **Create Shared File Watcher**
    - Effort: 4 hours

15. **Implement Workspace-Scoped Event Emitters**
    - Effort: 4 hours

16. **Persist Terminal History**
    - Effort: 2 hours

17. **Complete Session Restoration**
    - Effort: 4 hours

---

## 8. Total Effort Estimation

| Priority | Tasks | Effort |
|----------|--------|--------|
| **P0** | 5 tasks | 28 hours |
| **P1** | 5 tasks | 46 hours |
| **P2** | 7 tasks | 22 hours |
| **Total** | 17 tasks | **96 hours** (~12 work days) |

---

## 9. Impact Summary

### **What Can Be Simpler?**
- 7 god components → 50 small components
- 4 major duplications → 0 duplications
- 4 cross-path conflicts → 0 conflicts
- 24 direct infrastructure imports → 6 facade hooks

### **What Cross-Path Logic Conflicts?**
- Auto-save vs file watcher: Race condition fixed
- FileTree re-renders: Performance improved
- Workspace context switching: Simplified
- File watching duplication: Coordinated

### **Sharing Opportunities?**
- Shared ChatPanel: 2 components → 1 component
- Shared File Watcher: 4 services → 1 base class
- Shared Event Filtering: Global → Scoped

### **Simplification Needed?**
- Facade hooks: Loosen coupling
- Component splitting: Improve maintainability
- Consolidation: Single source of truth

### **State/Render/Zustand Conflicts?**
- N+1 selector pattern: Fixed with useShallow
- FileTree re-renders: Fixed with virtualization
- Terminal history: Persisted to Dexie
- Session restoration: Completed

---

## 10. Next Steps

### **Immediate (This Week)**
1. Split MonacoEditor (8 hours)
2. Split AgentChatPanel (6 hours)
3. Consolidate Terminal State (4 hours)

### **Short-Term (Next 2 Weeks)**
4. Consolidate Editor Tabs (6 hours)
5. Fix N+1 Selector Pattern (4 hours)
6. Split NoteEditor (10 hours)
7. Split NotesPage (8 hours)

### **Medium-Term (Next Month)**
8. Consolidate 4 File Sync Services (8 hours)
9. Create Shared ChatPanel (12 hours)
10. Extract Facade Hooks (8 hours)

---

**End of Level 2 Investigation Synthesis**
