# Domain Discovery Report: Notes & IDE Workspaces

**Generated:** 2026-01-16
**Purpose:** Map all components, stores, utilities for spike mirroring

---

## 1. Components Inventory

### Notes Workspace Components

**Location:** `src/presentation/components/notes/`

| Component | Path | Lines | Key Dependencies | State Management |
|-----------|------|-------|------------------|------------------|
| **NoteEditor** | `NoteEditor.tsx` | 1089 | @blocknote/react, useNoteStore, useNoteNavigationStore | useNoteStore, useNoteNavigationStore |
| **NotesPage** | `NotesPage.tsx` | 877 | useNoteStore, MainLayout, NoteSidebar, UnifiedChatPanel | useNoteStore, useIDEStore, useConversationStore |
| **NoteSidebar** | `NoteSidebar.tsx` | 382 | useNoteNavigationStore, NoteTree, ProjectFilesPanel | useNoteNavigationStore |
| **NoteContextMenu** | `NoteContextMenu.tsx` | 275 | DropdownMenu, useNoteStore | useNoteStore |
| **AISlashCommand** | `AISlashCommand.tsx` | 1417+ | @blocknote/core, useAIPromptStore, useAILoadingStore | Custom AI stores (ai-prompt, ai-loading, ai-insertion, prompt-history) |
| **SlashCommandManager** | `SlashCommandManager.tsx` | 658 | useSlashCommandStore | useSlashCommandStore |
| **ProjectFilesPanel** | `ProjectFilesPanel.tsx` | 429 | FileTree, useNoteStore, useWorkspaceSync | useNoteStore, useWorkspaceSync |
| **NoteCodeBlock** | `NoteCodeBlock.tsx` | 389 | detectLanguage, toast, useNoteCodeChunks | Local state + custom store |
| **NoteStudyMenu** | `NoteStudyMenu.tsx` | 247 | useNoteStore, extractTextFromBlocks, useFlashcardOperations | useNoteStore, useQuizStore |
| **NoteTreeItem** | `NoteTreeItem.tsx` | 163 | useNoteNavigationStore, useNoteStore | useNoteNavigationStore, useNoteStore |
| **NotesIndexingButton** | `NotesIndexingButton.tsx` | 189 | useNoteStore, noteIndexer | useNoteStore |
| **MarkdownImportDialog** | `MarkdownImportDialog.tsx` | 219 | Dialog, createNoteFileSyncService | Local component state |
| **NotesRAGSearch** | `NotesRAGSearch.tsx` | 181 | Input, Button, hybridSearch | Local component state |
| **NoteSidebarChat** | `NoteSidebarChat.tsx` | 150 | EnhancedChatInterface, useAgentChatWithTools | Agent stores, custom hook |
| **NoteTree** | `NoteTree.tsx` | 82 | useNoteNavigationStore, buildTree, filterTreeBySearch | useNoteNavigationStore |

**Block Components** (18+ custom BlockNote blocks in `blocks/` subdirectory):
- ArtifactGalleryBlock.tsx
- AIVisionBlock.tsx
- AIImageBlock.tsx
- StoryboardBlock.tsx
- VideoBlock.tsx
- And 13+ more blocks (50-300 lines each)

---

### IDE Workspace Components

**Location:** `src/presentation/components/ide/`

| Component | Path | Lines | Key Dependencies | State Management |
|-----------|------|-------|------------------|------------------|
| **MonacoEditor** | `MonacoEditor/MonacoEditor.tsx` | 773 | @monaco-editor/react, useWorkspaceSync, SyncEditWarning | openFiles, activeFilePath, showSyncWarning |
| **AgentChatPanel** | `AgentChatPanel.tsx` | 685 | useAgentChatWithTools, useConversationStore, EnhancedChatInterface | messages, isLoading, pendingApprovals, activeConversationId |
| **EnhancedChatInterface** | `EnhancedChatInterface.tsx` | 603 | useArtifactPreview, useChatExport, useVoiceRecording | input, attachments, keyboardHeight |
| **SyncStatusPanel** | `SyncStatusPanel.tsx` | 459 | crossWorkspaceEventBus, SyncStatusEvent, FileChangeEvent | syncState, isDismissed |
| **FileTree** | `FileTree/FileTree.tsx` | 348 | useWorkspaceSync, useFileTreeState, useContextMenuActions | rootNodes, expandedPaths, focusedPath, contextMenu |
| **IconSidebar** | `IconSidebar.tsx` | 271 | SidebarContext, useTranslation, lucide-react | activePanel, isCollapsed |
| **BentoGrid** | `BentoGrid.tsx` | 263 | useTranslation, React.memo | selectedTopic, searchQuery |
| **FeatureSearch** | `FeatureSearch.tsx` | 263 | useTranslation, cn | search, selectedIndex |
| **XTerminal** | `XTerminal.tsx` | 304 | @xterm/xterm, @xterm/addon-fit, createTerminalAdapter | isReady, shellStarted |
| **QuickActionsMenu** | `QuickActionsMenu.tsx` | 209 | DropdownMenu, useTranslation | None (stateless) |
| **CommandPalette** | `CommandPalette.tsx` | 232 | cmdk, useKeyboardShortcuts, lucide-react | search |
| **AgentsPanel** | `AgentsPanel.tsx` | 203 | useAgents, useAgentSelection, AgentConfigDialog | activeAgentId |
| **StreamingMessage** | `StreamingMessage.tsx` | 187 | React.memo, CodeBlock | displayedLength, isComplete |
| **IDEMobileLayout** | `IDEMobileLayout.tsx` | 290 | useIDEStore, useWorkspaceSync, lazy, framer-motion | currentPanel, fileTreeRefreshKey |
| **SyncStatusIndicator** | `SyncStatusIndicator.tsx` | 153 | useTranslation, TruncatedText, SyncProgress | status, progress, lastSyncTime |
| **AgentStatusSegment** | `statusbar/AgentStatusSegment.tsx` | 119 | useStatusBarStore, useWorkspaceSync | agentStatus |
| **SyncStatusSegment** | `statusbar/SyncStatusSegment.tsx` | 119 | useStatusBarStore, StatusBarSegment | status, progress, error |
| **PreviewPanel** | `PreviewPanel/PreviewPanel.tsx` | 295 | useTranslation, useToast, DEVICE_FRAMES | refreshKey, deviceFrame, isFocusMode |
| **StatusBar** | `StatusBar.tsx` | 94 | WebContainerStatus, AgentStatusSegment, SyncStatusSegment | None (composite) |
| **PanelShell** | `PanelShell.tsx` | 175 | cn, Button, TruncatedText | None (pure UI) |
| **SettingsPanel** | `SettingsPanel.tsx` | 111 | SidebarHeader, useTranslation | None (stateless) |
| **ExplorerPanel** | `ExplorerPanel.tsx` | 65 | SidebarHeader, useTranslation | None (stateless) |
| **SearchPanel** | `SearchPanel.tsx` | 167 | SidebarHeader, useState | query |

---

### Shared Components (Used by Both Notes and IDE)

**Location:** `src/presentation/components/common/`

| Component | Used By | Notes |
|-----------|---------|-------|
| **ErrorBoundary** | NotesPage, NoteEditor, IDE layouts | Global error handling wrapper |
| **WorkspaceSwitcher** | NotesPage, IDE layouts | Cross-workspace navigation |
| **UnsavedChangesDialog** | NotesPage, IDE editors | Save/discard changes dialog |
| **useUnsavedChangesWarning** | NotesPage, IDE | Navigation warning hook |

**Location:** `src/presentation/components/ide/` (shared across workspaces)

| Component | Used By | Notes |
|-----------|---------|-------|
| **EnhancedChatInterface** | NoteSidebarChat, AgentChatPanel | Unified chat UI |
| **FileTree** | ProjectFilesPanel, ExplorerPanel | File browser component |
| **SyncStatusIndicator** | NotesPage, IDE status bar | Sync status display |
| **SyncStatusPanel** | NotesPage, IDE | Sync status panel |
| **SyncEditWarning** | NoteEditor, MonacoEditor | Sync edit warning |
| **CommandPalette** | NotesPage, IDE | Keyboard-driven actions |
| **FeatureSearch** | NotesPage, IDE | Feature discovery |
| **StreamingMessage** | NoteCodeBlock, chat panels | AI response display |
| **BentoGrid** | NotesPage, IDE | Discovery UI |
| **AgentChatPanel** | NotesPage (via UnifiedChatPanel) | Agent chat |
| **IDEMobileLayout** | NotesMobileLayout | Mobile layout pattern |
| **PanelShell** | NotesPage, IDE | Panel wrapper |

---

## 2. Stores Inventory

### Zustand Stores

**Location:** `src/infrastructure/persistence/stores/`

| Store | Path | Lines | Used By | God Store (>300)? |
|-------|------|-------|---------|-------------------|
| **useAppStore** | `use-app-store.ts` | 378 | All workspaces | YES - Bounded Store (intentional) |
| **useTerminalStore** | `terminal-store.ts` | 317 | IDE | YES - Should refactor |
| **useIDEStore** | `ide/useIDEStore.ts` | 246 | IDE | No (6 slices, <100 each) |
| **useWorkspaceStore** | `workspace/workspace-store.ts` | 227 | All | No |
| **useUnifiedChatStore** | `chat/unified-chat-store.ts` | 201 | All | No (6 slices) |
| **useSynthesisStore** | `synthesis-store.ts` | 211 | Knowledge | No |
| **useGitStore** | `git/index.ts` | 155 | IDE | No (4 slices) |
| **useAgentSelectionStore** | `agents/agent-selection-store.ts` | 144 | All | No |
| **useProjectStore** | `project/useProjectStore.ts` | 148 | All | No (5 slices) |
| **useStatusBarStore** | `statusbar-store.ts` | - | IDE | No |
| **useLayoutStore** | `layout-store.ts` | 142 | Hub | No |
| **useRAGStore** | `rag/rag-store.ts` | 129 | Knowledge | No (5 slices) |
| **useKnowledgeStore** | `knowledge/knowledge-store.ts` | 108 | Knowledge | No (6 slices) |
| **useStudyStore** | `study/study-store-refactored.ts` | 131 | Study | No (4 slices) |
| **useFileSnapshotStore** | `filesystem/useFileSnapshotStore.ts` | 140 | IDE | No (4 slices) |
| **useNotificationStore** | `notifications/index.ts` | 143 | All | No (3 slices) |
| **useToolPermissionStore** | `permissions/tool-permission-store.ts` | 109 | All | No |
| **useConversationStore** | `conversation/useConversationStore.ts` | - | Chat | No (6 slices) |

### Notes-Specific Stores

| Store | Path | Purpose |
|-------|------|---------|
| **note-navigation-store** | Custom implementation | Search, favorites, expanded nodes |
| **note-context-tracker** | `stores/notes/note-context-tracker.ts` | AI agent awareness of current note |
| **slash-commands** | `stores/notes/slash-commands/` | Slash command management |
| **ai-prompt-store** | Custom | AI prompt state |
| **ai-loading-store** | Custom | AI loading state |
| **ai-insertion-store** | Custom | AI insertion state |
| **prompt-history-store** | Custom | Prompt history |

### IDE-Specific Stores

| Store | Path | Purpose |
|-------|------|---------|
| **ide-editor-slice** | `ide/ide-editor-slice.ts` | Open files, active file |
| **ide-explorer-slice** | `ide/ide-explorer-slice.ts` | File tree expanded paths |
| **ide-layout-slice** | `ide/ide-layout-slice.ts` | Panel layouts |
| **ide-terminal-slice** | `ide/ide-terminal-slice.ts` | Terminal state |
| **ide-project-slice** | `ide/ide-project-slice.ts` | Project context |
| **ide-selectors-slice** | `ide/ide-selectors-slice.ts` | Computed selectors |
| **terminal-store** | `terminal-store.ts` | Terminal tabs, visibility, settings |

---

### Dexie Stores (IndexedDB Tables)

**Main Database:** `src/infrastructure/persistence/dexie-db.ts`
**Database Class:** `src/infrastructure/persistence/dexie-db-class.ts`
**Database Name:** `via-gent-persistence`
**Schema Version:** 25

| Table Name | Schema | Primary Key | Indexes | Used By |
|------------|--------|-------------|---------|---------|
| **projects** | `id, workspaceId, lastOpened, name` | `id` | `workspaceId`, `lastOpened`, `name` | All |
| **notes** | Complex note schema | `id` | `projectId`, `workspaceId`, `parentId`, `isFavorite`, `order`, `[projectId+parentId]`, etc. | Notes |
| **ideState** | `projectId, workspaceId, updatedAt` | `projectId` | `workspaceId`, `updatedAt` | IDE |
| **conversations** | `id, projectId, workspaceId` | `id` | `projectId`, `workspaceId`, `updatedAt` | All |
| **threads** | `id, projectId, workspaceId` | `id` | `projectId`, `workspaceId`, `[projectId+updatedAt]` | All |
| **fileMetadata** | `[projectId+workspaceId+path]` | `path` | `projectId`, `workspaceId`, `lastModified` | IDE |
| **fileContentCache** | `[projectId+workspaceId+path]` | `path` | `projectId`, `workspaceId`, `[projectId+workspaceId+path]` | IDE |
| **fileSnapshots** | `++id` (auto-increment) | `++id` | `projectId`, `workspaceId`, `path` | IDE |
| **syncStatus** | `id, workspaceId, path` | `id` | `workspaceId`, `path`, `[path+syncStatus]` | All |
| **providers** | Provider configs | `id` | `workspaceId`, `type` | All |
| **agentConfigs** | Agent configurations | `id` | `workspaceId`, `agentId` | All |
| **credentials** | Encrypted credentials | `providerId` | `workspaceId` | All |
| **sources** | Knowledge sources | `id` | `projectId`, `workspaceId`, `type` | Knowledge |
| **collections** | Knowledge collections | `id` | `projectId`, `workspaceId`, `name` | Knowledge |
| **flashcards** | Study flashcards | `id` | `workspaceId`, `projectId`, `topic` | Study |
| **studySessions** | Study sessions | `id` | `workspaceId`, `projectId`, `startTime` | Study |
| **quizzes** | Quiz data | `id` | `workspaceId`, `projectId`, `title` | Study |
| **codeSnippets** | Code snippets | `id` | `workspaceId`, `language`, `folder` | IDE |
| **savedBlocks** | Saved blocks | `id` | `workspaceId`, `blockType`, `category` | Notes |
| **plugins** | Plugin data | `id` | `workspaceId`, `source`, `state` | All |
| **terminalState** | Terminal state | `id` | `updatedAt` | IDE |
| **sessionSnapshots** | Session snapshots | `id` | `projectId`, `workspaceId`, `createdAt` | All |

---

## 3. Architecture Violations

### Critical (P0) - Direct Dexie Access in Components

| Location | File | Issue |
|----------|------|-------|
| Hub | `HubHomePage.tsx:17` | `import { db } from '@/infrastructure/persistence/dexie-db'` |
| Hub | `ProjectPickerDialog.tsx:23` | `import { db } from '@/infrastructure/persistence/dexie-db'` |
| Project | `ProjectsPage.tsx:24` | `import { db } from '@/infrastructure/persistence/dexie-db'` |
| Notes | `AISlashCommand.tsx:49` | Direct DB access for SavedBlockRecord |
| Notes | `NoteSidebar.tsx:24` | Type import from dexie-db |
| Notes | `NoteTree.tsx:14` | Type import from dexie-db |
| Notes | `NoteContextMenu.tsx:31` | Type import from dexie-db |
| Knowledge | Multiple components (8 files) | Direct type imports and DB access |

**Impact:** HIGH - Breaks layer separation, makes testing difficult

---

### High (P1) - localStorage/sessionStorage Usage in Components

| Location | File | Lines | Usage |
|----------|------|-------|-------|
| Dev Tools | `SyncDevTools.tsx:32` | `localStorage.getItem('lastProjectId')` | Dev-only, acceptable |
| Dashboard | `Onboarding.tsx:16-30` | `localStorage.getItem/setItem` | Onboarding state |
| Hub | `MobileProjectSelector.tsx:114` | `sessionStorage.setItem('demo-template')` | Template demo |
| Notes | `VideoBlock.tsx:156,211` | `sessionStorage.setItem/getItem` | Video file caching |
| IDE | `IconSidebar.tsx:63-75` | `localStorage.getItem/setItem` | Sidebar state |
| IDE | `IDEMobileLayout.tsx:56,65` | `localStorage.getItem/setItem` | Mobile panel state |
| Agent | `useToolTrustLevels.ts:61,95` | `localStorage.getItem/setItem` | Trust levels |

**Impact:** MEDIUM - Some are acceptable (UI state), others should be in Zustand

---

### Medium (P2) - Filesystem Adapter Issues

| Issue | Location | Details |
|-------|----------|---------|
| Re-export from lib/filesystem | `infrastructure/filesystem/index.ts:69-75` | Permission lifecycle re-exported from deprecated location |
| Duplicate adapter patterns | Multiple | `LocalFSAdapter` and `FSAStorageAdapter` have overlapping responsibilities |

---

## 4. Circular Dependencies

### Detected Inter-Store Dependencies

| Dependency Chain | Files Involved | Severity |
|------------------|----------------|----------|
| `useAgentSelectionStore` → `useAppStore` | `agents/agent-selection-store.ts`, `use-app-store.ts` | Low - Intentional |
| `useConversationStore` → `useUnifiedChatStore` | `conversation/useConversationStore.ts`, `chat/unified-chat-store.ts` | Low - Intentional |
| `agent-events-slice` → `useWorkspaceStore` | `agents/slices/agent-events-slice.ts`, `workspace/` | Low - Intentional |
| `provider-models-slice` → `useWorkspaceStore` | `providers/provider-models-slice.ts`, `workspace/` | Low - Intentional |
| `use-vfs-sync-slice` → `useStatusBarStore` | `workspace/slices/use-vfs-sync-slice.ts`, `statusbar-store.ts` | Low - Intentional |

**Analysis:** All circular dependencies are intentional bounded store patterns, not anti-patterns. The `useAppStore` combines Agents + Providers to eliminate circular dependency issues through a single source of truth.

---

## 5. Utility/Helper Functions

### Main Utils (`src/lib/utils.ts`)

| Function | Lines | Purpose |
|----------|-------|---------|
| `cn()` | 4 | Tailwind class merging (clsx + twMerge) |

### Error Handling (`src/lib/utils/error-handling.ts`)

| Function | Lines | Purpose |
|----------|-------|---------|
| `showErrorToast()` | 74 | Error toast notification |
| `showSuccessToast()` | 6 | Success toast |
| `showInfoToast()` | 6 | Info toast |
| `showWarningToast()` | 6 | Warning toast |
| `showLoadingToast()` | 5 | Loading toast |
| `dismissToast()` | 3 | Dismiss toast by ID |
| `dismissAllT()` | 3 | Dismiss all toasts |
| `withRetry()` | 39 | Retry with exponential backoff |
| `createErrorFallback()` | 13 | Error boundary fallback |
| `getErrorMessage()` | 25 | User-friendly error message |
| `isNetworkError()` | 11 | Network error detection |
| `isTimeoutError()` | 10 | Timeout error detection |
| `isPermissionError()` | 10 | Permission error detection |
| `logError()` | 12 | Error logging |
| `createAsyncErrorHandler()` | 18 | Async operation error handler |
| `useErrorToast()` | 34 | React hook for error toasts |

### Additional Utils

| Module | Location | Functions |
|--------|----------|-----------|
| **dynamic-imports** | `src/lib/utils/dynamic-imports.ts` | Lazy loading utilities |
| **security** | `src/lib/utils/security.ts` | Security utilities |
| **platform-detection** | `src/lib/utils/platform-detection.ts` | Platform detection |
| **mobile-error-handling** | `src/lib/utils/mobile-error-handling.ts` | Mobile-specific error handling |
| **error-classification** | `src/lib/utils/error-classification.ts` | Error classification |

---

### Filesystem Adapters

**Location:** `src/infrastructure/filesystem/`

| Adapter | File | Purpose |
|---------|------|---------|
| **FSAStorageAdapter** | `fsa-storage-adapter.ts` | File System Access API adapter |
| **FSAGateway** | `fsa-gateway.ts` | Gateway for FSA operations |
| **IDBGateway** | `idb-gateway.ts` | Gateway for IndexedDB operations |
| **LocalFSAdapter** | `local-fs-adapter.ts` | Local filesystem adapter |
| **MarkdownSyncService** | `markdown-sync-service.ts` | Notes ↔ Markdown sync |
| **FileTreeScanner** | `file-tree-scanner.ts` | File tree scanning |
| **ViagentService** | `viagent-service.ts` | .viagent/ metadata service |
| **HandlePersistence** | `handle-persistence.ts` | FSA handle persistence |
| **PlatformContract** | `platform-contract.ts` | Platform requirements |
| **StorageGatewayFactory** | `storage-gateway-factory.ts` | Gateway factory |

---

## 6. Recommendations

### For Spike Mirroring

**Components to COPY (workspace-specific):**
- `NoteEditor.tsx` - Core editor, BlockNote integration
- `NoteSidebar.tsx` - Notes navigation
- `NoteTree.tsx` - Notes tree view
- `NoteContextMenu.tsx` - Notes context menu
- `AISlashCommand.tsx` - AI slash commands
- `MonacoEditor.tsx` - Code editor
- `FileTree.tsx` - File browser
- `XTerminal.tsx` - Terminal
- `AgentChatPanel.tsx` - Agent chat

**Components to USE DIRECTLY (shared):**
- `ErrorBoundary.tsx` - Error handling wrapper
- `WorkspaceSwitcher.tsx` - Workspace navigation
- `UnsavedChangesDialog.tsx` - Save/discard dialog
- `EnhancedChatInterface.tsx` - Chat UI
- `SyncStatusIndicator.tsx` - Sync status
- `SyncEditWarning.tsx` - Sync warning
- `CommandPalette.tsx` - Command palette
- `PanelShell.tsx` - Panel wrapper
- `BentoGrid.tsx` - Discovery UI

**Stores to COPY (with slices pattern):**
- `useIDEStore.ts` - IDE state (6 slices)
- `useNoteStore.ts` - Notes state
- `note-navigation-store` - Navigation state

**Stores to USE DIRECTLY:**
- `useAppStore.ts` - Agents + Providers (bounded store)
- `useConversationStore.ts` - Chat state
- `useStatusBarStore.ts` - Status bar state

### Remediation Priority

| Priority | Issue | Location | Action |
|----------|-------|----------|--------|
| **P0** | Direct Dexie access | 8 component files | Create repository layer |
| **P1** | localStorage in components | 7 files | Move to Zustand stores |
| **P2** | useTerminalStore god store | 317 lines | Split into 3 slices |
| **P2** | Duplicate adapter patterns | 2 files | Consolidate to single adapter |
| **P3** | Re-export from deprecated | lib/filesystem | Move exports to infrastructure |

---

## 7. Files to Copy (for Phase 3)

### Notes Workspace Components
```
src/presentation/components/notes/NoteEditor.tsx
src/presentation/components/notes/NotesPage.tsx
src/presentation/components/notes/NoteSidebar.tsx
src/presentation/components/notes/NoteTree.tsx
src/presentation/components/notes/NoteTreeItem.tsx
src/presentation/components/notes/NoteContextMenu.tsx
src/presentation/components/notes/NoteStudyMenu.tsx
src/presentation/components/notes/AISlashCommand.tsx
src/presentation/components/notes/SlashCommandManager.tsx
src/presentation/components/notes/ProjectFilesPanel.tsx
src/presentation/components/notes/NoteCodeBlock.tsx
src/presentation/components/notes/MarkdownImportDialog.tsx
src/presentation/components/notes/NotesIndexingButton.tsx
src/presentation/components/notes/NotesRAGSearch.tsx
src/presentation/components/notes/blocks/*.tsx (18+ files)
src/presentation/components/notes/index.ts
```

### IDE Workspace Components
```
src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
src/presentation/components/ide/AgentChatPanel.tsx
src/presentation/components/ide/EnhancedChatInterface.tsx
src/presentation/components/ide/SyncStatusPanel.tsx
src/presentation/components/ide/FileTree/FileTree.tsx
src/presentation/components/ide/FileTree/hooks/*.ts
src/presentation/components/ide/IconSidebar.tsx
src/presentation/components/ide/BentoGrid.tsx
src/presentation/components/ide/XTerminal.tsx
src/presentation/components/ide/CommandPalette.tsx
src/presentation/components/ide/AgentsPanel.tsx
src/presentation/components/ide/StreamingMessage.tsx
src/presentation/components/ide/IDEMobileLayout.tsx
src/presentation/components/ide/SyncStatusIndicator.tsx
src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx
src/presentation/components/ide/statusbar/*.tsx
src/presentation/components/ide/index.ts
```

### Shared Components (Reference Only)
```
src/presentation/components/common/ErrorBoundary.tsx
src/presentation/components/common/WorkspaceSwitcher.tsx
src/presentation/components/common/UnsavedChangesDialog.tsx
src/presentation/components/common/hooks/useUnsavedChangesWarning.ts
src/presentation/components/common/index.ts
```

### Stores to Copy
```
src/infrastructure/persistence/stores/ide/useIDEStore.ts
src/infrastructure/persistence/stores/ide/*.ts (all slices)
src/infrastructure/persistence/stores/notes/note-context-tracker.ts
src/infrastructure/persistence/stores/notes/slash-commands/
src/infrastructure/persistence/stores/terminal-store.ts
src/infrastructure/persistence/stores/conversation/*.ts
```

### Utilities to Copy
```
src/lib/utils/error-handling.ts
src/lib/utils/dynamic-imports.ts
src/lib/utils/security.ts
```

### Filesystem Adapters
```
src/infrastructure/filesystem/fsa-storage-adapter.ts
src/infrastructure/filesystem/fsa-gateway.ts
src/infrastructure/filesystem/idb-gateway.ts
src/infrastructure/filesystem/markdown-sync-service.ts
src/infrastructure/filesystem/file-tree-scanner.ts
src/infrastructure/filesystem/platform-contract.ts
src/infrastructure/filesystem/storage-gateway-factory.ts
src/infrastructure/filesystem/index.ts
```

### Dexie Database (Reference Only)
```
src/infrastructure/persistence/dexie-db.ts
src/infrastructure/persistence/dexie-db-class.ts
src/infrastructure/persistence/dexie-storage.ts
src/infrastructure/persistence/dexie-db-migrations.ts
```

---

## Summary

- **Total Notes Components:** 45+ (including 18+ block components)
- **Total IDE Components:** 60+ (including subdirectory components)
- **Shared Components:** 15+ (used by both workspaces)
- **Zustand Stores:** 20+ (17 canonical + notes-specific + IDE-specific)
- **Dexie Tables:** 39 (cross-workspace with workspaceId isolation)
- **God Stores:** 2 (useAppStore - intentional, useTerminalStore - needs refactor)
- **Architecture Violations:** 8 P0, 7 P1, 2 P2

---

**Report Generated:** 2026-01-16
**Scanner:** domain-scanner agent
**Timebox:** 45 minutes