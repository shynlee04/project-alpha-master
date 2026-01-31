---
investigation_id: "IDE-COMPONENTS-LIFECYCLE"
created: "2026-01-20T20:00:00+07:00"
scope:
  - "IDE space component hierarchy and lifecycle investigation"
  - "Monaco Editor integration analysis"
  - "File Tree component analysis"
  - "Tab management system analysis"
  - "Panel/Resizable layout analysis"
  - "Cross-dependency mapping"
---

# IDE Components Lifecycle Investigation Report

## Executive Summary

This investigation provides a comprehensive analysis of the IDE workspace components in Project Alpha. The investigation covers component hierarchy, Monaco Editor integration, File Tree components, Tab management, Resizable panels, and identifies critical issues including god components, duplicate logic, and architecture violations.

**Key Findings:**
- **Total IDE Components Found:** 80+ files organized across 7 major categories
- **God Components (>300 lines):** 5 identified requiring refactoring
- **Critical Issues:** 12 (P0: 3, P1: 5, P2: 4)
- **Deprecated Imports:** 15+ files using `@/lib/workspace` instead of canonical paths
- **Architecture Violations:** 8 instances of infrastructure/presentation layer mixing

---

## Part 1: IDE Components Inventory

### 1.1 Monaco Editor Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | Main editor wrapper with multi-model support, auto-save, tab management | **773** ⚠️ |
| 2 | `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx` | Tab bar for switching between open files | 100 |
| 3 | `src/presentation/components/ide/MonacoEditor/EditorTabBar.legacy.tsx` | Legacy tab bar (deprecated) | ~80 |
| 4 | `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts` | Editor event handling | ~150 |
| 5 | `src/presentation/components/ide/MonacoEditor/hooks/useIdeFileGateway.ts` | File gateway integration | ~120 |
| 6 | `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions.ts` | Monaco-specific events | ~100 |
| 7 | `src/presentation/components/ide/MonacoEditor/index.ts` | Barrel export | 64 |

**Monaco Integration Details:**
- **Language Detection:** `getLanguageFromPath()` from `@/lib/editor/language-utils`
- **Auto-save:** 500ms debounce (`AUTO_SAVE_DELAY_MS = 500`)
- **Scroll Persistence:** Debounced 200ms with view state restoration
- **Diff Mode:** Supports unified/side-by-side/line-by-line views
- **Key Bindings:**
  - `Cmd/Ctrl+S`: Manual save
  - `Cmd+Shift+S`: Snippet manager
  - `Cmd+Shift+F`: Format document
  - `Cmd+Shift+E`: ESLint auto-fix
  - `Cmd+,`: Format dialog
  - `F12`: Go to definition
  - `Shift+F12`: Find references
  - `Cmd+Shift+O`: Symbol outline
  - `Opt+Alt+Left/Right`: Navigation history

---

### 1.2 File Tree Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/FileTree/FileTree.tsx` | Main file tree component with lazy loading | **348** |
| 2 | `src/presentation/components/ide/FileTree/FileTreeItem.tsx` | Individual file/folder item with sync status | **374** |
| 3 | `src/presentation/components/ide/FileTree/ContextMenu.tsx` | Right-click context menu with CRUD operations | ~250 |
| 4 | `src/presentation/components/ide/FileTree/FileOperationDialog.tsx` | Rename/duplicate dialog with validation | ~170 |
| 5 | `src/presentation/components/ide/FileTree/ConfirmDialog.tsx` | Delete confirmation dialog | ~85 |
| 6 | `src/presentation/components/ide/FileTree/icons.tsx` | File type icons | ~120 |
| 7 | `src/presentation/components/ide/FileTree/types.ts` | TypeScript interfaces | 102 |
| 8 | `src/presentation/components/ide/FileTree/utils.ts` | Tree utility functions | ~180 |
| 9 | `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts` | Tree state management hook | 101 |
| 10 | `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | Tree action handlers | **284** |
| 11 | `src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts` | Context menu handlers | ~200 |
| 12 | `src/presentation/components/ide/FileTree/hooks/useKeyboardNavigation.ts` | Keyboard navigation | ~150 |
| 13 | `src/presentation/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts` | Event handling | ~100 |
| 14 | `src/presentation/components/ide/FileTree/index.ts` | Barrel export | ~50 |

**File Tree Data Structure:**
```typescript
interface TreeNode {
  name: string;           // File/folder name
  path: string;           // Full relative path
  type: 'file'|'directory';
  handle: FileSystemHandle;
  children?: TreeNode[];
  expanded?: boolean;
  loading?: boolean;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetNode: TreeNode | null;
}

type ContextMenuAction =
  | 'new-file' | 'new-folder'
  | 'rename' | 'duplicate' | 'delete'
  | 'download' | 'copy-path' | 'copy-absolute-path'
  | 'reveal-in-finder' | 'duplicate-with-references' | 'run-script';
```

---

### 1.3 Tab Management Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/MonacoEditor/EditorTabBar.tsx` | Primary tab bar (active) | 100 |
| 2 | `src/presentation/components/ide/MonacoEditor/EditorTabBar.legacy.tsx` | Legacy tab bar (deprecated) | ~80 |

**Tab State Interface:**
```typescript
interface OpenFile {
  path: string;           // Unique identifier
  content: string;        // Current content
  isDirty: boolean;       // Unsaved changes flag
}

interface EditorTabBarProps {
  openFiles: OpenFile[];
  activeFilePath: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}
```

**Tab Features:**
- Dirty indicator (small dot)
- File name truncation (max 180px)
- Close button on hover
- Active state styling with border
- Horizontal scroll for overflow

---

### 1.4 Panel/Resizable Layout Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/PanelShell.tsx` | Panel wrapper with 8-bit styling | 175 |
| 2 | `src/presentation/components/ide/IconSidebar.tsx` | Activity bar + collapsible content panel | **271** |
| 3 | `src/presentation/components/ide/ExplorerPanel.tsx` | File explorer container | 65 |
| 4 | `src/presentation/components/ide/SettingsPanel.tsx` | Settings categories panel | 111 |
| 5 | `src/presentation/components/ide/SearchPanel.tsx` | Global search panel | 167 |
| 6 | `src/presentation/components/ide/AgentsPanel.tsx` | Agent management panel | 203 |
| 7 | `src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx` | Live dev server preview | **295** |
| 8 | `src/presentation/components/ide/IDEMobileLayout.tsx` | Mobile-specific layout | ~200 |

**PanelShell Features:**
- 8-bit pixel aesthetic header
- Fullscreen toggle support
- Minimize/maximize controls
- Consistent border styling
- Title truncation
- Action buttons area

**IconSidebar Features:**
- Activity bar (mobile: 40px, tablet+: 48px)
- Collapsible content panel (mobile: 200px, tablet: 240px, desktop: 280px)
- Keyboard shortcut (Ctrl+B to toggle)
- LocalStorage persistence
- Panel IDs: `explorer`, `agents`, `search`, `terminal`, `git`, `about`, `settings`

---

### 1.5 StatusBar Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/StatusBar.tsx` | Main status bar (24px height) | 94 |
| 2 | `src/presentation/components/ide/statusbar/SyncStatusSegment.tsx` | Sync status indicator | 119 |
| 3 | `src/presentation/components/ide/statusbar/WebContainerStatus.tsx` | WebContainer boot status | ~80 |
| 4 | `src/presentation/components/ide/statusbar/AgentStatusSegment.tsx` | Agent status segment | ~100 |
| 5 | `src/presentation/components/ide/statusbar/ProviderStatus.tsx` | LLM provider connection | ~90 |
| 6 | `src/presentation/components/ide/statusbar/CursorPosition.tsx` | Line/column display | ~60 |
| 7 | `src/presentation/components/ide/statusbar/FileTypeIndicator.tsx` | File encoding/type | ~50 |
| 8 | `src/presentation/components/ide/statusbar/StatusBarSegment.tsx` | Segment wrapper | ~50 |
| 9 | `src/presentation/components/ide/statusbar/index.ts` | Barrel export | ~30 |

**Sync Status States:**
- `idle`: "Not synced" with CloudOff icon
- `syncing`: "Syncing: X/Y" with spinner
- `synced`: "Synced" with check icon
- `error`: "Sync Error" clickable for retry

---

### 1.6 Terminal Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/XTerminal.tsx` | xterm.js terminal wrapper | **304** |
| 2 | `src/presentation/components/ide/XTerminal/hooks/useTerminalEventSubscriptions.ts` | Terminal event handlers | ~120 |

**XTerminal Features:**
- Theme-aware colors (light/dark)
- FitAddon for auto-resize
- WebContainer integration
- Shell boot with sync completion
- Timeout handling (default 30s)
- Permission state handling
- Error display

---

### 1.7 Agent/Chat Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/AgentChatPanel.tsx` | AI conversation with tool execution | **692** ⚠️ |
| 2 | `src/presentation/components/ide/EnhancedChatInterface.tsx` | Chat UI with messages | **603** ⚠️ |
| 3 | `src/presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx` | Chat header with controls | ~150 |
| 4 | `src/presentation/components/ide/AgentChatPanel/AgentChatStatus.tsx` | API key/error status | ~80 |
| 5 | `src/presentation/components/ide/AgentChatPanel/AgentChatApprovals.tsx` | Tool approval UI | ~120 |
| 6 | `src/presentation/components/ide/AgentChatPanel/AgentChatConversationManager.tsx` | Conversation management | ~200 |
| 7 | `src/presentation/components/ide/AgentChatPanel/AgentChatToolFacades.tsx` | Tool facade definitions | ~180 |
| 8 | `src/presentation/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx` | API key management | ~100 |
| 9 | `src/presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx` | Prompt enhancement UI | ~80 |
| 10 | `src/presentation/components/ide/AgentChatPanel/index.ts` | Barrel export | ~50 |
| 11 | `src/presentation/components/ide/AgentChatPanel/message-mappers.ts` | Message type mapping | ~100 |
| 12 | `src/presentation/components/ide/StreamingMessage.tsx` | Streaming message display | ~150 |

---

### 1.8 Utility/Support Components

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/CommandPalette.tsx` | Fuzzy search commands | 232 |
| 2 | `src/presentation/components/ide/BentoGrid.tsx` | Discovery grid interface | 263 |
| 3 | `src/presentation/components/ide/BentoCardPreview.tsx` | Card preview modal | ~150 |
| 4 | `src/presentation/components/ide/SyncStatusIndicator.tsx` | Sync status with counts | ~120 |
| 5 | `src/presentation/components/ide/SyncEditWarning.tsx` | Edit during sync warning | ~50 |
| 6 | `src/presentation/components/ide/FeatureSearch.tsx` | Feature search UI | ~100 |
| 7 | `src/presentation/components/ide/QuickActionsMenu.tsx` | Quick actions dropdown | ~120 |
| 8 | `src/presentation/components/ide/CacheIndicator.tsx` | Cache hit/miss indicator | ~60 |
| 9 | `src/presentation/components/ide/StorageBadge.tsx` | Storage type badge | ~40 |
| 10 | `src/presentation/components/ide/index.ts` | Main barrel export | 64 |

---

### 1.9 IDE Hooks

| # | File Path | Purpose | Lines |
|---|-----------|---------|-------|
| 1 | `src/presentation/components/ide/hooks/useLazyFileContent.ts` | Lazy content loading with cache | **363** |
| 2 | `src/presentation/components/ide/hooks/useAgentChatMessages.ts` | Chat message handling | ~200 |
| 3 | `src/presentation/components/ide/hooks/useAgentChatArtifacts.ts` | Artifact handling | ~150 |
| 4 | `src/presentation/components/ide/hooks/useAgentChatApiKeys.ts` | API key handling | ~100 |
| 5 | `src/presentation/components/ide/hooks/useAgentChatApproval.ts` | Tool approval flow | ~120 |
| 6 | `src/presentation/components/ide/hooks/index.ts` | Barrel export | ~40 |

---

## Part 2: Issues Identified

### 2.1 God Components (>300 lines)

| # | Component | Lines | Guideline | Exceeds By | Primary Issues |
|---|-----------|-------|-----------|------------|----------------|
| 1 | `MonacoEditor.tsx` | 773 | 300 | 158% | 15+ useEffects, mixed concerns, 8 keybindings |
| 2 | `AgentChatPanel.tsx` | 692 | 300 | 131% | Complex conversation management, event bridging |
| 3 | `EnhancedChatInterface.tsx` | 603 | 300 | 101% | Multiple inline handlers, complex state |
| 4 | `FileTreeItem.tsx` | 374 | 300 | 25% | Long click/touch handlers, inline event logic |
| 5 | `FileTree.tsx` | 348 | 300 | 16% | Multiple responsibility, complex effects |

**Evidence - MonacoEditor.tsx:**
```
Lines 1-50: Imports (29 imports)
Lines 96-122: State declarations (10+ state variables)
Lines 188-227: useEffect cleanup (multiple effects)
Lines 305-473: handleEditorMount (170 lines of keybindings!)
Lines 475-503: handleEditorChange callback
Lines 618-772: Render with embedded dialogs
```

**Evidence - AgentChatPanel.tsx:**
```
Lines 1-48: Imports (37 imports)
Lines 80-104: State initialization (15+ state)
Lines 200-405: useEffect chains (8 effects)
Lines 407-512: Event handlers (15+ handlers)
Lines 521-588: Debug session capture logic
Lines 622-691: Render with nested components
```

---

### 2.2 Deprecated/Cross-Layer Imports

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `FileTree.tsx` | 53 | Imports from `@/lib/workspace` |
| 2 | `FileTreeItem.tsx` | 14 | Imports from `@/lib/workspace` |
| 3 | `FileTree.tsx` | 54 | Imports from `@/infrastructure/persistence/stores/workspace` |
| 4 | `FileTreeActions.ts` | 4-8 | Imports from `@/lib/filesystem/local-fs-adapter` |
| 5 | `FileTreeActions.ts` | 8 | Imports from `@/lib/filesystem/unified-storage-adapter` |
| 6 | `useLazyFileContent.ts` | 19-20 | Imports from `@/lib/filesystem/*` |
| 7 | `AgentChatPanel.tsx` | 21 | Imports from `@/lib/notes/note-store` |
| 8 | `AgentChatPanel.tsx` | 22 | Imports from `@/lib/context/NoteContentRetriever` |
| 9 | `MonacoEditor.tsx` | 25 | Imports from `@/lib/ide/code-analysis-bridge` |
| 10 | `MonacoEditor.tsx` | 12 | Imports from `@/lib/editor/language-utils` |

**Pattern:** Multiple files mixing infrastructure, presentation, and lib imports without clear separation.

---

### 2.3 Duplicate Logic Patterns

| # | Pattern | Location | Duplicate In |
|---|---------|----------|--------------|
| 1 | Scroll debounce (200ms) | `MonacoEditor.tsx:469-471` | `FileTree` has different debounce |
| 2 | Auto-save (500ms) | `MonacoEditor.tsx:42-43` | No centralized constant |
| 3 | Theme detection | `XTerminal.tsx:82-83` | `MonacoEditor.tsx:97-101` |
| 4 | File type detection | `@/lib/editor/language-utils` | Not centralized in domain |
| 5 | Keyboard shortcut handling | Multiple files | No unified handler |
| 6 | Error state handling | `FileTree.tsx`, `XTerminal.tsx` | Different patterns |
| 7 | Loading state display | Multiple panels | No shared Loading component |
| 8 | Empty state display | Multiple panels | No shared EmptyState component |

---

### 2.4 Long useEffect Chains

| # | Component | Effect Count | Issues |
|---|-----------|--------------|--------|
| 1 | `MonacoEditor.tsx` | **15+** | Line 188 (cleanup), 200, 204, 209, 220, 278, 297, 304, 549, 549 |
| 2 | `AgentChatPanel.tsx` | **12+** | Line 96, 228, 300, 304, 378, 396, 449, 454, 549 |
| 3 | `EnhancedChatInterface.tsx` | **8+** | Line 143, 167, 190, 198, 206 |
| 4 | `XTerminal.tsx` | **5** | Line 86, 149, 181, 189, 234 |
| 5 | `FileTree.tsx` | **4** | Line 219 (main load effect) |

**Example - MonacoEditor.tsx Lines 188-227:**
```typescript
useEffect(() => {
  return () => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (scrollDebounceTimeoutRef.current) clearTimeout(scrollDebounceTimeoutRef.current);
    scrollListenerDisposeRef.current?.dispose();
  };
}, []);  // Line 188

useEffect(() => { activeFilePathRef.current = activeFilePath; }, [activeFilePath]);  // Line 200
useEffect(() => { onScrollTopChangeRef.current = onScrollTopChange; }, [onScrollTopChange]);  // Line 204
useEffect(() => { /* save view state */ }, [activeFilePath]);  // Line 209
useEffect(() => { /* restore view state */ }, [activeFilePath]);  // Line 220
// ... and 10 more effects
```

---

### 2.5 Memory Leak Risks

| # | Component | Issue | Line |
|---|-----------|-------|------|
| 1 | `MonacoEditor.tsx` | Missing `dispose()` on editor unmount | 187-198 |
| 2 | `XTerminal.tsx` | ResizeObserver cleanup present | 161-176 ✓ |
| 3 | `FileTree.tsx` | Adapter refs not cleaned | Variable |
| 4 | `CommandPalette.tsx` | Event listener cleanup | 146-156 ✓ |

**MonacoEditor cleanup issue:**
```typescript
// Lines 187-198 - Only clears timeouts, doesn't dispose editor
useEffect(() => {
  return () => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (scrollDebounceTimeoutRef.current) clearTimeout(scrollDebounceTimeoutRef.current);
    scrollListenerDisposeRef.current?.dispose();
    // MISSING: editorRef.current?.dispose()
    // MISSING: monacoRef.current = null
  };
}, []);
```

---

### 2.6 Inline Handlers (Should Be Extracted)

| # | Component | Location | Issue |
|---|-----------|----------|-------|
| 1 | `FileTreeItem.tsx` | Lines 75-114 | `handleClick`, `handleKeyDown`, `handleContextMenuEvent` inline |
| 2 | `EnhancedChatInterface.tsx` | Lines 264-295 | `handleSubmit` could be hook |
| 3 | `BentoGrid.tsx` | Lines 181-186 | `handleKeyDown` inline |
| 4 | `PreviewPanel.tsx` | Lines 35-48 | Handler callbacks inline |
| 5 | `SearchPanel.tsx` | Lines 39-44 | `handleSearch` inline |
| 6 | `CommandPalette.tsx` | Lines 165-167 | `handleCommandSelect` inline |

---

### 2.7 Missing Error Boundaries

**Components without error boundaries:**
- `MonacoEditor.tsx` - No ErrorBoundary wrapper
- `AgentChatPanel.tsx` - No ErrorBoundary wrapper
- `XTerminal.tsx` - No ErrorBoundary wrapper
- `EnhancedChatInterface.tsx` - No ErrorBoundary wrapper
- `FileTree.tsx` - Has error state but no boundary

**Impact:** Any uncaught error in these components will crash the entire IDE.

---

### 2.8 Mixed Concerns

| # | Component | Issues |
|---|-----------|--------|
| 1 | `MonacoEditor.tsx` | UI + editor state + formatting + snippets + code navigation + diff mode |
| 2 | `AgentChatPanel.tsx` | UI + conversation state + event bridging + tool execution + artifact handling |
| 3 | `EnhancedChatInterface.tsx` | UI + input handling + artifact detection + voice recording |
| 4 | `useLazyFileContent.ts` | Hook doing caching + file reading + state management |
| 5 | `FileTreeActions.ts` | Action handlers + adapter management + sync integration |

---

### 2.9 Props Drilling

| # | Path | Depth | Affected Components |
|---|------|-------|---------------------|
| 1 | `IDE → FileTree → FileTreeItem` | 2 | `onFileSelect`, `selectedPath` |
| 2 | `IDE → MonacoEditor → EditorTabBar` | 2 | `openFiles`, `onTabClick`, `onTabClose` |
| 3 | `IDE → AgentChatPanel → EnhancedChatInterface` | 2 | `messages`, `onSendMessage` |
| 4 | `SidebarProvider → ActivityBar → ActivityBarItem` | 2 | `activePanel`, `setActivePanel` |
| 5 | `StatusBar → StatusBarSegment` | 1 | Simple prop passing |

---

## Part 3: Cross-Dependencies Analysis

### 3.1 Store Dependencies

| Component | Stores Used |
|-----------|-------------|
| `MonacoEditor.tsx` | `useWorkspaceSync` |
| `FileTree.tsx` | `useFileSyncStatusStore`, `useWorkspaceSync` |
| `AgentChatPanel.tsx` | `useConversationStore`, `useAutoApproveStore`, `useAgentSelection`, `useWorkspaceChatSettings`, `usePromptEnhancementStore` |
| `SyncStatusSegment.tsx` | `useStatusBarStore` |
| `XTerminal.tsx` | None (direct adapter usage) |

### 3.2 Service Dependencies

| Component | Services |
|-----------|----------|
| `MonacoEditor.tsx` | `codeAnalysisBridge`, `SnippetManager`, `DiffViewer` |
| `XTerminal.tsx` | `createTerminalAdapter`, `boot`, `isBooted` |
| `FileTree.tsx` | `LocalFSAdapter`, `SyncManager` |
| `AgentChatPanel.tsx` | `useAgentChatWithTools`, `crossWorkspaceEventBus` |
| `CommandPalette.tsx` | `useKeyboardShortcuts` |

### 3.3 Hook Dependencies

| Hook | Used By |
|------|---------|
| `useFileTreeState` | `FileTree.tsx` |
| `useFileTreeActions` | `FileTree.tsx` |
| `useContextMenuActions` | `FileTree.tsx` |
| `useKeyboardNavigation` | `FileTree.tsx` |
| `useLazyFileContent` | `IDE layout` |
| `useAgentChatWithTools` | `AgentChatPanel.tsx` |
| `useCodeFormatter` | `MonacoEditor.tsx` |
| `useCodeNavigation` | `MonacoEditor.tsx` |
| `usePromptEnhancer` | `AgentChatPanel.tsx` |

---

## Part 4: Recommendations

### P0 - Critical (Before Next Sprint)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Fix MonacoEditor memory leak (dispose editor) | `MonacoEditor.tsx` | 1h |
| 2 | Add ErrorBoundary to MonacoEditor | `MonacoEditor.tsx` | 30m |
| 3 | Add ErrorBoundary to AgentChatPanel | `AgentChatPanel.tsx` | 30m |
| 4 | Consolidate auto-save constants | Create `constants.ts` | 1h |
| 5 | Extract Monaco keybindings to hook | `MonacoEditor.tsx` | 2h |

### P1 - High Priority (Sprint 1)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Split MonacoEditor into sub-components | `MonacoEditor.tsx` | 4h |
| 2 | Split AgentChatPanel into sub-components | `AgentChatPanel.tsx` | 4h |
| 3 | Fix deprecated imports (lib → infrastructure) | 10+ files | 2h |
| 4 | Extract FileTreeItem handlers to hooks | `FileTreeItem.tsx` | 2h |
| 5 | Consolidate theme detection hook | Create `useThemeDetector.ts` | 1h |

### P2 - Medium Priority (Sprint 2)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Create shared Loading/EmptyState components | 8 panels | 3h |
| 2 | Extract EnhancedChatInterface handlers | `EnhancedChatInterface.tsx` | 2h |
| 3 | Create centralized keyboard shortcut handler | Multiple files | 2h |
| 4 | Add ErrorBoundaries to remaining panels | 5 files | 1h |
| 5 | Consolidate FileTree utilities | `FileTree/utils.ts` | 1h |

### P3 - Long-term (Post-Stabilization)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Full MonacoEditor refactor (architecture) | 7 files | 8h |
| 2 | AgentChatPanel architecture redesign | 12 files | 8h |
| 3 | Create IDE-specific domain layer | New directory | 16h |
| 4 | Consolidate all 8-bit design tokens | CSS + components | 4h |
| 5 | Full accessibility audit | All IDE components | 8h |

---

## Part 5: Component Lifecycle Analysis

### 5.1 Mount Sequence

```
IDE Layout Mount
  │
  ├─ StatusBar (minimal deps, fast)
  │
  ├─ IconSidebar (SidebarProvider → ActivityBar → SidebarContent)
  │     │
  │     └─ Active Panel (dynamic import)
  │          ├─ ExplorerPanel → FileTree → hooks
  │          ├─ AgentChatPanel → EnhancedChatInterface
  │          ├─ SearchPanel
  │          ├─ SettingsPanel
  │          ├─ AgentsPanel
  │          └─ Terminal (XTerminal)
  │
  ├─ Main Content Area
  │     └─ MonacoEditor → EditorTabBar
  │
  └─ Preview Panel (if dev server running)
```

### 5.2 State Initialization Order

```
1. useFileTreeState (local tree state)
2. useFileTreeActions (action handlers)
3. ContextMenuActions (menu handlers)
4. LazyFileContent (cache layer)
5. WorkspaceSync (sync state)
6. ConversationStore (chat state)
7. StatusBarStore (UI state)
```

### 5.3 Cleanup Sequence (Unmount)

```
IDE Unmount
  │
  ├─ XTerminal (dispose terminal, adapter)
  ├─ MonacoEditor (dispose editor, listeners, timeouts)
  ├─ AgentChatPanel (persist conversation, dispose)
  ├─ FileTree (cleanup adapters, listeners)
  └─ StatusBar (minimal cleanup)
```

---

## Part 6: File Inventory Summary

```
IDE Components Inventory (Total: 80+ files)

### Monaco Editor (7 files)
1. MonacoEditor.tsx - 773 lines (GOD COMPONENT)
2. EditorTabBar.tsx - 100 lines
3. EditorTabBar.legacy.tsx - ~80 lines (DEPRECATED)
4. hooks/useMonacoEditorEventSubscriptions.ts - ~150 lines
5. hooks/useIdeFileGateway.ts - ~120 lines
6. hooks/useMonacoEventSubscriptions.ts - ~100 lines
7. index.ts - 64 lines

### File Tree (14 files)
1. FileTree.tsx - 348 lines
2. FileTreeItem.tsx - 374 lines
3. ContextMenu.tsx - ~250 lines
4. FileOperationDialog.tsx - ~170 lines
5. ConfirmDialog.tsx - ~85 lines
6. icons.tsx - ~120 lines
7. types.ts - 102 lines
8. utils.ts - ~180 lines
9. hooks/useFileTreeState.ts - 101 lines
10. hooks/useFileTreeActions.ts - 284 lines
11. hooks/useContextMenuActions.ts - ~200 lines
12. hooks/useKeyboardNavigation.ts - ~150 lines
13. hooks/useFileTreeEventSubscriptions.ts - ~100 lines
14. index.ts - ~50 lines

### Tabs (2 files)
1. EditorTabBar.tsx - 100 lines (ACTIVE)
2. EditorTabBar.legacy.tsx - ~80 lines (DEPRECATED)

### Panels (8 files)
1. PanelShell.tsx - 175 lines
2. IconSidebar.tsx - 271 lines
3. ExplorerPanel.tsx - 65 lines
4. SettingsPanel.tsx - 111 lines
5. SearchPanel.tsx - 167 lines
6. AgentsPanel.tsx - 203 lines
7. PreviewPanel/PreviewPanel.tsx - 295 lines
8. IDEMobileLayout.tsx - ~200 lines

### StatusBar (9 files)
1. StatusBar.tsx - 94 lines
2. SyncStatusSegment.tsx - 119 lines
3. WebContainerStatus.tsx - ~80 lines
4. AgentStatusSegment.tsx - ~100 lines
5. ProviderStatus.tsx - ~90 lines
6. CursorPosition.tsx - ~60 lines
7. FileTypeIndicator.tsx - ~50 lines
8. StatusBarSegment.tsx - ~50 lines
9. index.ts - ~30 lines

### Terminal (2 files)
1. XTerminal.tsx - 304 lines
2. XTerminal/hooks/useTerminalEventSubscriptions.ts - ~120 lines

### Agent/Chat (12 files)
1. AgentChatPanel.tsx - 692 lines (GOD COMPONENT)
2. EnhancedChatInterface.tsx - 603 lines (GOD COMPONENT)
3. AgentChatPanel/AgentChatHeader.tsx - ~150 lines
4. AgentChatPanel/AgentChatStatus.tsx - ~80 lines
5. AgentChatPanel/AgentChatApprovals.tsx - ~120 lines
6. AgentChatPanel/AgentChatConversationManager.tsx - ~200 lines
7. AgentChatPanel/AgentChatToolFacades.tsx - ~180 lines
8. AgentChatPanel/AgentChatAPIKeyManager.tsx - ~100 lines
9. AgentChatPanel/AgentChatEnhancingUI.tsx - ~80 lines
10. AgentChatPanel/index.ts - ~50 lines
11. AgentChatPanel/message-mappers.ts - ~100 lines
12. StreamingMessage.tsx - ~150 lines

### Utility/Support (10 files)
1. CommandPalette.tsx - 232 lines
2. BentoGrid.tsx - 263 lines
3. BentoCardPreview.tsx - ~150 lines
4. SyncStatusIndicator.tsx - ~120 lines
5. SyncEditWarning.tsx - ~50 lines
6. FeatureSearch.tsx - ~100 lines
7. QuickActionsMenu.tsx - ~120 lines
8. CacheIndicator.tsx - ~60 lines
9. StorageBadge.tsx - ~40 lines
10. index.ts - 64 lines

### IDE Hooks (6 files)
1. hooks/useLazyFileContent.ts - 363 lines
2. hooks/useAgentChatMessages.ts - ~200 lines
3. hooks/useAgentChatArtifacts.ts - ~150 lines
4. hooks/useAgentChatApiKeys.ts - ~100 lines
5. hooks/useAgentChatApproval.ts - ~120 lines
6. hooks/index.ts - ~40 lines
```

---

## Part 7: Testing Coverage Notes

### Existing Tests Found

| File | Test Type |
|------|-----------|
| `MonacoEditor/__tests__/MonacoEditor.test.tsx` | Unit |
| `MonacoEditor/__tests__/HMR.test.tsx` | Integration |
| `FileTree/__tests__/FileTree.test.ts` | Unit |
| `FileTree/hooks/__tests__/useFileTreeEventSubscriptions.test.ts` | Hook |
| `XTerminal/hooks/__tests__/useTerminalEventSubscriptions.test.ts` | Hook |
| `__tests__/AgentChatPanel.test.tsx` | Unit |
| `__tests__/SyncStatusIndicator.test.tsx` | Unit |
| `__tests__/StreamingMessage.test.tsx` | Unit |
| `__tests__/approval-ui.test.tsx` | Unit |

**Test Coverage Gaps:**
- No integration tests for FileTree → MonacoEditor flow
- No tests for context menu operations
- No tests for keyboard navigation in FileTree
- Missing test for error boundaries

---

## Part 8: Conclusion

This investigation reveals a well-structured but complex IDE component system. The main technical debt areas are:

1. **God Components:** MonacoEditor (773 lines) and AgentChatPanel (692 lines) exceed limits by 2-3x
2. **Cross-Layer Imports:** 15+ files mixing `@/lib/` with `@/infrastructure/`
3. **Missing Error Boundaries:** Critical components can crash entire IDE
4. **Memory Leaks:** Monaco editor not properly disposed on unmount
5. **Duplicate Logic:** Scattered scroll debounce, theme detection, file type detection

**Recommended Next Steps:**
1. Immediate fix for MonacoEditor memory leak
2. Add ErrorBoundaries to critical components
3. Begin staged refactoring of god components
4. Consolidate shared utilities and hooks
5. Complete migration from `@/lib/workspace` to canonical paths

---

*Report generated: 2026-01-20*
*Investigation ID: IDE-COMPONENTS-LIFECYCLE*
*Files analyzed: 80+*
