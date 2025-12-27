---
date: 2025-12-27
time: 18:00:00
phase: Implementation
team: Team-B
agent_mode: bmad-bmm-architect
---

# State Management Refactoring Requirements
## Team B Phase 2 - IDE State Consolidation

**Document ID**: SMR-2025-12-27-001
**Epic**: Epic 23 - UX/UI Modernization (P1.10 Inconsistent State Management)
**Status**: REQUIREMENTS DEFINED
**Execution**: CONSECUTIVE with Team A (after MRT-3 completion)

---

## Executive Summary

This document defines the requirements for refactoring state management in [`IDELayout.tsx`](../src/components/layout/IDELayout.tsx) and [`MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx) to eliminate state duplication and establish a single source of truth using [`useIDEStore`](../src/lib/state/ide-store.ts).

**Key Objectives**:
1. Eliminate P0 state duplication issue identified in state management audit
2. Establish [`useIDEStore`](../src/lib/state/ide-store.ts) as the single source of truth for all IDE state
3. Maintain file content caching strategy (ephemeral, not persisted)
4. Ensure consistency between desktop ([`IDELayout.tsx`](../src/components/layout/IDELayout.tsx)) and mobile ([`MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx)) layouts
5. Update [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions
6. Execute refactoring AFTER Team A completes MRT-3 to avoid MVP-3 interference

**Reference Documents**:
- State Management Audit: [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](../_bmad-output/state-management-audit-p1.10-2025-12-26.md)
- Zustand Store: [`src/lib/state/ide-store.ts`](../src/lib/state/ide-store.ts)
- Desktop Layout: [`src/components/layout/IDELayout.tsx`](../src/components/layout/IDELayout.tsx)
- Mobile Layout: [`src/components/layout/MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx)
- File Handlers: [`src/components/layout/hooks/useIDEFileHandlers.ts`](../src/components/layout/hooks/useIDEFileHandlers.ts)

---

## 1. Current State Duplication Analysis

### 1.1 IDELayout.tsx State Duplication (P0 Issue)

**File**: [`src/components/layout/IDELayout.tsx`](../src/components/layout/IDELayout.tsx:86-165)

**Problem**: The component uses a hybrid approach where some state is managed by [`useIDEStore`](../src/lib/state/ide-store.ts) while other state is managed by local `useState`, creating a single source of truth violation.

#### Current Implementation (Lines 106-165)

```typescript
// Zustand state (CORRECT - already using useIDEStore)
const chatVisible = useIDEStore((s) => s.chatVisible);
const setChatVisible = useIDEStore((s) => s.setChatVisible);
const terminalTab = useIDEStore((s) => s.terminalTab);
const setTerminalTab = useIDEStore((s) => s.setTerminalTab);
const openFilePaths = useIDEStore((s) => s.openFiles);
const activeFilePath = useIDEStore((s) => s.activeFile);
const setActiveFilePath = useIDEStore((s) => s.setActiveFile);
const addOpenFile = useIDEStore((s) => s.addOpenFile);
const removeOpenFile = useIDEStore((s) => s.removeOpenFile);

// Local state (INCORRECT - duplicates Zustand state)
const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);
const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
const [isFeatureSearchOpen, setIsFeatureSearchOpen] = useState(false);

// Local file content cache (CORRECT - ephemeral, not persisted)
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

// Derive OpenFile[] from Zustand state + local cache
const openFiles = useMemo<OpenFile[]>(() => {
  return openFilePaths.map((path) => ({
    path,
    content: fileContentCache.get(path) || '',
    isDirty: false,
  }));
}, [openFilePaths, fileContentCache]);

// Custom setOpenFiles function (INCORRECT - duplicates Zustand logic)
const setOpenFiles = (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
  const newFiles = typeof filesOrUpdater === 'function'
    ? filesOrUpdater(openFiles)
    : filesOrUpdater;

  // Update file content cache
  setFileContentCache(new Map(newFiles.map((f) => [f.path, f.content] as [string, string])));

  // Sync paths with Zustand if they changed
  const newPaths = newFiles.map(f => f.path);
  const currentPathsStr = openFilePaths.join('\0');
  const newPathsStr = newPaths.join('\0');
  if (currentPathsStr !== newPathsStr) {
    // Add new paths and remove old ones
    newPaths.forEach(path => {
      if (!openFilePaths.includes(path)) {
        addOpenFile(path);
      }
    });
    openFilePaths.forEach(path => {
      if (!newPaths.includes(path)) {
        removeOpenFile(path);
      }
    });
  }
};
```

#### State Duplication Matrix

| State Property | Current Implementation | Should Be | Issue |
|---------------|---------------------|-------------|--------|
| `chatVisible` | `useIDEStore((s) => s.chatVisible)` + `setChatVisible()` | ✅ CORRECT | None |
| `terminalTab` | `useIDEStore((s) => s.terminalTab)` + `setTerminalTab()` | ✅ CORRECT | None |
| `openFilePaths` | `useIDEStore((s) => s.openFiles)` | ✅ CORRECT | None |
| `activeFilePath` | `useIDEStore((s) => s.activeFile)` + `setActiveFile()` | ✅ CORRECT | None |
| `openFiles` | `useState<OpenFile[]>([])` derived from `openFilePaths` + `fileContentCache` | Use `useIDEStore` + local cache | ❌ DUPLICATION |
| `setOpenFiles` | Custom function syncing local state with Zustand | Remove, use Zustand actions directly | ❌ DUPLICATION |

#### Appropriate Local State (Keep As-Is)

| State Property | Reason | Status |
|---------------|---------|--------|
| `selectedFilePath` | Temporary selection state for FileTree interactions | ✅ KEEP - Component-local |
| `fileTreeRefreshKey` | Force re-render of FileTree | ✅ KEEP - Component-local |
| `isCommandPaletteOpen` | Command palette visibility | ✅ KEEP - Component-local |
| `isFeatureSearchOpen` | Feature search visibility | ✅ KEEP - Component-local |
| `fileContentCache` | Ephemeral file content (not persisted) | ✅ KEEP - Component-local |

### 1.2 MobileIDELayout.tsx State Consistency

**File**: [`src/components/layout/MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx:122-177)

**Current Status**: Mobile layout uses the same hybrid approach as desktop layout, with identical state duplication patterns.

#### Current Implementation (Lines 122-177)

```typescript
// Zustand state (CORRECT - already using useIDEStore)
const openFilePaths = useIDEStore((s) => s.openFiles);
const activeFilePath = useIDEStore((s) => s.activeFile);
const setActiveFilePath = useIDEStore((s) => s.setActiveFile);
const addOpenFile = useIDEStore((s) => s.addOpenFile);
const removeOpenFile = useIDEStore((s) => s.removeOpenFile);
const terminalTab = useIDEStore((s) => s.terminalTab);
const setTerminalTab = useIDEStore((s) => s.setTerminalTab);

// Local state (INCORRECT - same duplication as desktop)
const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

// Derive OpenFile[] from Zustand state + local cache
const openFiles = useMemo<OpenFile[]>(() => {
  return openFilePaths.map((path) => ({
    path,
    content: fileContentCache.get(path) || '',
    isDirty: false,
  }));
}, [openFilePaths, fileContentCache]);

// Custom setOpenFiles function (INCORRECT - same duplication as desktop)
const setOpenFiles = (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
  const newFiles = typeof filesOrUpdater === 'function' ? filesOrUpdater(openFiles) : filesOrUpdater;
  setFileContentCache(new Map(newFiles.map((f) => [f.path, f.content] as [string, string])));

  const newPaths = newFiles.map((f) => f.path);
  newPaths.forEach((path) => {
    if (!openFilePaths.includes(path)) addOpenFile(path);
  });
  openFilePaths.forEach((path) => {
    if (!newPaths.includes(path)) removeOpenFile(path);
  });
};
```

**Consistency Requirement**: Mobile layout must use identical state management patterns as desktop layout after refactoring.

---

## 2. Zustand Store Interface Requirements

### 2.1 IDEState Interface (from [`ide-store.ts`](../src/lib/state/ide-store.ts:46-114))

```typescript
export interface IDEState {
  // =========================================================================
  // State
  // =========================================================================

  /** Currently open file paths */
  openFiles: string[];

  /** Path of currently active/focused file */
  activeFile: string | null;

  /** Set of expanded folder paths in FileTree */
  expandedPaths: Set<string>;

  /** Panel layout sizes by group ID */
  panelLayouts: Record<string, number[]>;

  /** Active terminal panel tab */
  terminalTab: TerminalTab;

  /** Whether chat panel is visible */
  chatVisible: boolean;

  /** Scroll position of active file in editor */
  activeFileScrollTop: number;

  /** Current project ID for scoping state */
  projectId: string | null;

  // =========================================================================
  // Actions
  // =========================================================================

  /** Set current project ID (scopes state to this project) */
  setProjectId: (projectId: string | null) => void;

  /** Add a file to open files list */
  addOpenFile: (path: string) => void;

  /** Remove a file from open files list */
  removeOpenFile: (path: string) => void;

  /** Set active file */
  setActiveFile: (path: string | null) => void;

  /** Toggle a folder's expanded state */
  toggleExpanded: (path: string) => void;

  /** Set multiple folders as expanded */
  setExpandedPaths: (paths: string[]) => void;

  /** Update panel layout for a group */
  setPanelLayout: (groupId: string, layout: number[]) => void;

  /** Set terminal tab */
  setTerminalTab: (tab: TerminalTab) => void;

  /** Toggle chat visibility */
  toggleChatVisible: () => void;

  /** Set chat visibility explicitly */
  setChatVisible: (visible: boolean) => void;

  /** Set scroll position */
  setActiveFileScrollTop: (scrollTop: number) => void;

  /** Reset all state (for project change) */
  reset: () => void;
}
```

### 2.2 Store Persistence Configuration

**Storage**: Dexie.js (IndexedDB) via custom storage adapter
**Store Name**: `via-gent-ide-state` (project-scoped)
**Persisted Properties**:
- `openFiles`: `string[]` - Array of file paths
- `activeFile`: `string | null` - Currently active file path
- `expandedPaths`: `string[]` - Converted from Set for JSON serialization
- `panelLayouts`: `Record<string, number[]>` - Panel layout sizes
- `terminalTab`: `'terminal' | 'output' | 'problems'` - Active terminal tab
- `chatVisible`: `boolean` - Chat panel visibility
- `activeFileScrollTop`: `number` - Scroll position

**Not Persisted** (ephemeral, in-memory):
- File content cache (managed locally in component)
- Selected file path (FileTree highlight state)
- Command palette / feature search visibility

---

## 3. Migration Path: useState → useIDEStore

### 3.1 Refactoring Strategy

**Goal**: Eliminate the custom `setOpenFiles` function and use Zustand actions directly.

**Approach**: 
1. Keep `fileContentCache` as local `useState` (ephemeral, not persisted)
2. Derive `openFiles` from `useIDEStore` state + local cache using `useMemo`
3. Remove custom `setOpenFiles` function
4. Use Zustand actions (`addOpenFile`, `removeOpenFile`) directly in [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts)
5. Update [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions

### 3.2 Before Refactoring (Current State)

```typescript
// IDELayout.tsx / MobileIDELayout.tsx - Lines 126-165

// Local file content cache (keep as-is)
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

// Derive OpenFile[] from Zustand state + local cache
const openFiles = useMemo<OpenFile[]>(() => {
  return openFilePaths.map((path) => ({
    path,
    content: fileContentCache.get(path) || '',
    isDirty: false,
  }));
}, [openFilePaths, fileContentCache]);

// Custom setOpenFiles function (REMOVE THIS)
const setOpenFiles = (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
  const newFiles = typeof filesOrUpdater === 'function'
    ? filesOrUpdater(openFiles)
    : filesOrUpdater;

  // Update file content cache
  setFileContentCache(new Map(newFiles.map((f) => [f.path, f.content] as [string, string])));

  // Sync paths with Zustand if they changed
  const newPaths = newFiles.map(f => f.path);
  const currentPathsStr = openFilePaths.join('\0');
  const newPathsStr = newPaths.join('\0');
  if (currentPathsStr !== newPathsStr) {
    // Add new paths and remove old ones
    newPaths.forEach(path => {
      if (!openFilePaths.includes(path)) {
        addOpenFile(path);
      }
    });
    openFilePaths.forEach(path => {
      if (!newPaths.includes(path)) {
        removeOpenFile(path);
      }
    });
  }
};

// Pass to useIDEFileHandlers (REMOVE setOpenFiles parameter)
const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
  openFiles,
  openFilePaths,
  activeFilePath,
  setActiveFilePath,
  addOpenFile,
  removeOpenFile,
  setSelectedFilePath,
  setFileTreeRefreshKey,
  setFileContentCache,
  syncManagerRef,
  eventBus,
  toast,
});
```

### 3.3 After Refactoring (Target State)

```typescript
// IDELayout.tsx / MobileIDELayout.tsx - Refactored

// Local file content cache (keep as-is - ephemeral, not persisted)
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

// Derive OpenFile[] from Zustand state + local cache (SIMPLIFIED)
const openFiles = useMemo<OpenFile[]>(() => {
  return openFilePaths.map((path) => ({
    path,
    content: fileContentCache.get(path) || '',
    isDirty: false,
  }));
}, [openFilePaths, fileContentCache]);

// Pass to useIDEFileHandlers (REMOVE setOpenFiles, add setFileContentCache)
const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
  openFiles,
  openFilePaths,
  activeFilePath,
  setActiveFilePath,
  addOpenFile,
  removeOpenFile,
  setSelectedFilePath,
  setFileTreeRefreshKey,
  setFileContentCache,  // ADD THIS
  syncManagerRef,
  eventBus,
  toast,
});
```

### 3.4 Migration Checklist

- [ ] Remove `setOpenFiles` custom function from both layouts
- [ ] Add `setFileContentCache` parameter to [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) call
- [ ] Update [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) to accept `setFileContentCache`
- [ ] Verify `openFiles` derivation uses `useMemo` for performance
- [ ] Ensure both layouts use identical patterns
- [ ] Test file open/close operations
- [ ] Test content changes and persistence
- [ ] Test state restoration on page reload
- [ ] Verify no state synchronization issues

---

## 4. File Content Cache Strategy

### 4.1 Cache Design Rationale

**Why Ephemeral Cache?**
- File paths are persisted to IndexedDB via [`useIDEStore`](../src/lib/state/ide-store.ts)
- File content is NOT persisted to IndexedDB (too large, changes frequently)
- Cache is local `useState` - cleared on component unmount
- Content is loaded from File System Access API on file selection
- Content is updated in real-time during editing

### 4.2 Cache Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ File Content Cache (useState<Map<string, string>>)     │
│ - Ephemeral (in-memory only)                         │
│ - Not persisted to IndexedDB                             │
│ - Cleared on component unmount                            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │
        ┌─────────────────┴─────────────────┐
        │                                  │
        ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│ File Selection  │              │ Content Edit   │
│ Load from FSA  │              │ User types     │
│ Cache.set(path,│              │ Cache.set(path,│
│   content)    │              │   newContent) │
└──────────────────┘              └──────────────────┘
        │                                  │
        └─────────────────┬─────────────────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │ Monaco Editor   │
                  │ Display cached │
                  │ content        │
                  └──────────────────┘
```

### 4.3 Cache Requirements

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| **Data Structure** | `Map<string, string>` | O(1) lookup by file path |
| **Persistence** | Ephemeral (in-memory) | Content changes frequently, too large for IndexedDB |
| **Scope** | Component-local (`useState`) | Cleared on unmount, prevents stale data |
| **Update Trigger** | File selection, content changes | Real-time editor updates |
| **Derivation** | `useMemo` from `openFilePaths` + `fileContentCache` | Performance optimization, prevent unnecessary re-renders |

### 4.4 Cache Implementation Pattern

```typescript
// Local file content cache (ephemeral, not persisted)
const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

// Derive OpenFile[] from Zustand state + local cache
const openFiles = useMemo<OpenFile[]>(() => {
  return openFilePaths.map((path) => ({
    path,
    content: fileContentCache.get(path) || '',
    isDirty: false,
  }));
}, [openFilePaths, fileContentCache]);

// Update cache when file is loaded from FSA
const handleFileSelect = async (path: string, handle: FileSystemFileHandle) => {
  const file = await handle.getFile();
  const content = await file.text();
  
  // Update Zustand store (persisted)
  addOpenFile(path);
  
  // Update local cache (ephemeral)
  setFileContentCache((prev) => new Map(prev).set(path, content));
  setActiveFilePath(path);
};

// Update cache when content changes in editor
const handleContentChange = (path: string, content: string) => {
  // Update local cache (ephemeral)
  setFileContentCache((prev) => new Map(prev).set(path, content));
  
  // Emit event for agent tools
  eventBus.emit('file:modified', { path, source: 'editor', content });
};
```

---

## 5. Integration with useIDEFileHandlers

### 5.1 Current Hook Interface

**File**: [`src/components/layout/hooks/useIDEFileHandlers.ts`](../src/components/layout/hooks/useIDEFileHandlers.ts:14-50)

```typescript
interface UseIDEFileHandlersOptions {
  /** Current open files */
  openFiles: OpenFile[];
  
  /** Open file paths from Zustand */
  openFilePaths: string[];
  
  /** Currently active file path */
  activeFilePath: string | null;
  
  /** Setter for active file path */
  setActiveFilePath: (path: string | null) => void;
  
  /** Add file to open files */
  addOpenFile: (path: string) => void;
  
  /** Remove file from open files */
  removeOpenFile: (path: string) => void;
  
  /** Setter for selected file path (FileTree highlight) */
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string | undefined>>;
  
  /** Setter for file tree refresh key */
  setFileTreeRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  
  /** Setter for file content cache */
  setFileContentCache: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  
  /** Reference to sync manager */
  syncManagerRef: React.RefObject<SyncManager | null>;
  
  /** Event bus for file events */
  eventBus: WorkspaceEventBus;
  
  /** Toast notification function */
  toast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}
```

### 5.2 Required Hook Updates

**Change**: Add `setFileContentCache` to hook options and handlers

#### Updated handleFileSelect (Lines 75-98)

```typescript
// BEFORE
const handleFileSelect = useCallback(
  async (path: string, handle: FileSystemFileHandle) => {
    setSelectedFilePath(path);
    console.log('[IDE] File selected:', path);

    const existingFile = openFiles.find((f) => f.path === path);
    if (existingFile) {
      setActiveFilePath(path);
      return;
    }

    try {
      const file = await handle.getFile();
      const content = await file.text();
      // Update Zustand store and local cache
      addOpenFile(path);
      setFileContentCache((prev) => new Map(prev).set(path, content));
      setActiveFilePath(path);
    } catch (error) {
      console.error('[IDE] Failed to read file:', path, error);
    }
  },
  [openFiles, addOpenFile, setActiveFilePath, setSelectedFilePath, setFileContentCache],
);

// AFTER (NO CHANGES NEEDED - already correct)
// The hook already correctly uses setFileContentCache
```

#### Updated handleSave (Lines 100-121)

```typescript
// BEFORE
const handleSave = useCallback(
  async (path: string, content: string) => {
    console.log('[IDE] Saving file:', path);
    try {
      if (syncManagerRef.current) {
        await syncManagerRef.current.writeFile(path, content);
        // Update local content cache
        setFileContentCache((prev) => new Map(prev).set(path, content));
        console.log('[IDE] File saved successfully:', path);
        setFileTreeRefreshKey((prev) => prev + 1);
      } else {
        console.warn('[IDE] No SyncManager available for save');
        toast('No project folder open - save skipped', 'warning');
      }
    } catch (error) {
      console.error('[IDE] Failed to save file:', path, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast(`Failed to save ${path.split('/').pop()}: ${errorMessage}`, 'error');
    }
  },
  [syncManagerRef, setFileTreeRefreshKey, setFileContentCache, toast],
);

// AFTER (NO CHANGES NEEDED - already correct)
// The hook already correctly uses setFileContentCache
```

#### Updated handleContentChange (Lines 123-130)

```typescript
// BEFORE
const handleContentChange = useCallback(
  (path: string, content: string) => {
    // Update local content cache
    setFileContentCache((prev) => new Map(prev).set(path, content));
    eventBus.emit('file:modified', { path, source: 'editor', content });
  },
  [setFileContentCache, eventBus],
);

// AFTER (NO CHANGES NEEDED - already correct)
// The hook already correctly uses setFileContentCache
```

#### Updated handleTabClose (Lines 132-142)

```typescript
// BEFORE
const handleTabClose = useCallback(
  (path: string) => {
    removeOpenFile(path);
    if (activeFilePath === path) {
      // Find last open file after removing current
      const remainingFiles = openFilePaths.filter((p) => p !== path);
      setActiveFilePath(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
    }
  },
  [activeFilePath, openFilePaths, removeOpenFile, setActiveFilePath],
);

// AFTER (NO CHANGES NEEDED - already correct)
// The hook already correctly uses Zustand actions
```

### 5.3 Hook Update Summary

**Required Changes to [`useIDEFileHandlers.ts`](../src/components/layout/hooks/useIDEFileHandlers.ts)**:
- ✅ **NONE** - The hook already correctly uses `setFileContentCache` parameter
- ✅ **NONE** - The hook already correctly uses Zustand actions (`addOpenFile`, `removeOpenFile`, `setActiveFilePath`)

**Required Changes to Layout Components**:
- ❌ **REMOVE** `setOpenFiles` custom function from both layouts
- ❌ **ADD** `setFileContentCache` parameter to hook call in both layouts

---

## 6. MobileIDELayout.tsx Consistency Requirements

### 6.1 Consistency Principle

**Requirement**: Mobile layout must use identical state management patterns as desktop layout after refactoring.

**Rationale**: 
- Both layouts share the same [`useIDEStore`](../src/lib/state/ide-store.ts)
- Both layouts use the same [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts)
- Inconsistencies could cause state synchronization issues when switching between mobile/desktop

### 6.2 Consistency Checklist

| Pattern | Desktop Layout | Mobile Layout | Status |
|---------|----------------|----------------|--------|
| Zustand state usage | `useIDEStore` hooks | `useIDEStore` hooks | ✅ CONSISTENT |
| File content cache | `useState<Map<string, string>>` | `useState<Map<string, string>>` | ✅ CONSISTENT |
| `openFiles` derivation | `useMemo` from `openFilePaths` + `fileContentCache` | `useMemo` from `openFilePaths` + `fileContentCache` | ✅ CONSISTENT |
| `setOpenFiles` function | Custom function (TO BE REMOVED) | Custom function (TO BE REMOVED) | ✅ CONSISTENT |
| `useIDEFileHandlers` call | With `setFileContentCache` parameter | With `setFileContentCache` parameter | ✅ CONSISTENT |
| Local state (keep) | `selectedFilePath`, `fileTreeRefreshKey`, `isCommandPaletteOpen`, `isFeatureSearchOpen` | `selectedFilePath`, `fileTreeRefreshKey` | ✅ CONSISTENT |

### 6.3 Mobile-Specific Considerations

**Mobile Layout Differences (Keep As-Is)**:
- Panel switching: Mobile uses `activePanel` state from `useMobilePanel` hook
- Tab bar navigation: Mobile-specific bottom tab bar
- Single-panel focus: Only one panel visible at a time

**State Management Consistency**:
- File operations: Must use same Zustand actions as desktop
- Content caching: Must use same ephemeral cache pattern
- File handlers: Must use same [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) hook

---

## 7. Execution Timeline and Dependencies

### 7.1 Team B Execution Phases

**Phase 1 (COMPLETED)**: Requirements Definition (This Document)
- Document state management requirements
- Define migration path
- Specify consistency requirements
- Define file content cache strategy

**Phase 2 (BLOCKED - Awaiting Team A)**: State Refactoring Execution
- **Trigger**: After Team A completes MRT-3 (Mobile Responsive Transformation)
- **Reason**: Avoid interference with MVP-3 (Tool Execution - File Operations)
- **Duration**: Estimated 2-3 hours

**Phase 3 (FUTURE)**: Testing and Validation
- Unit tests for state management
- Integration tests for file operations
- Browser E2E verification
- Desktop and mobile layout testing

### 7.2 Dependencies

| Dependency | Status | Impact |
|-------------|--------|--------|
| Team A MRT-3 completion | ⏳ BLOCKING | Cannot start refactoring until mobile layout is stable |
| MVP-3 completion | ⏳ BLOCKING | Cannot test file operations until MVP-3 is done |
| Zustand store stability | ✅ READY | Store is stable and well-tested |
| File handler hook stability | ✅ READY | Hook is already using Zustand correctly |

### 7.3 Risk Mitigation

**Risk**: Refactoring state management during active MVP-3 development could cause conflicts.

**Mitigation**:
1. **Sequential Execution**: Wait for Team A to complete MRT-3 before starting
2. **Isolated Changes**: Refactor only state management, not file operations
3. **Testing**: Thoroughly test both layouts after refactoring
4. **Rollback Plan**: Keep git history clean for easy rollback if issues arise

---

## 8. Acceptance Criteria

### 8.1 Functional Requirements

- [ ] [`IDELayout.tsx`](../src/components/layout/IDELayout.tsx) uses [`useIDEStore`](../src/lib/state/ide-store.ts) for all IDE state
- [ ] [`MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx) uses [`useIDEStore`](../src/lib/state/ide-store.ts) for all IDE state
- [ ] Custom `setOpenFiles` function removed from both layouts
- [ ] `setFileContentCache` parameter passed to [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) in both layouts
- [ ] File content cache uses `useState<Map<string, string>>` (ephemeral, not persisted)
- [ ] `openFiles` derived from `openFilePaths` + `fileContentCache` using `useMemo`
- [ ] Both layouts use identical state management patterns

### 8.2 Non-Functional Requirements

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All existing tests pass
- [ ] State persistence works correctly (IndexedDB)
- [ ] File operations work correctly (open, save, close, edit)
- [ ] Mobile/desktop layouts behave consistently
- [ ] No performance regressions

### 8.3 Documentation Requirements

- [ ] Code comments updated to reflect new patterns
- [ ] AGENTS.md updated with state management best practices
- [ ] This requirements document referenced in commit message
- [ ] Handoff document created for next phase

---

## 9. Implementation Notes

### 9.1 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Keep fileContentCache as useState** | Content changes frequently, too large for IndexedDB, cleared on unmount |
| **Remove custom setOpenFiles** | Duplicates Zustand logic, creates single source of truth violation |
| **Use Zustand actions directly** | Store actions already handle state updates correctly, no need for custom logic |
| **Maintain consistency between layouts** | Prevents state synchronization issues when switching mobile/desktop |

### 9.2 Performance Considerations

| Optimization | Impact |
|-------------|--------|
| **useMemo for openFiles derivation** | Prevents unnecessary re-renders when cache updates |
| **Map for fileContentCache** | O(1) lookup by file path, fast content retrieval |
| **Ephemeral cache** | No IndexedDB overhead for content, faster editor updates |
| **Zustand selective subscriptions** | Only re-render when specific state changes (already implemented) |

### 9.3 Testing Strategy

**Unit Tests**:
- Test state derivation from Zustand + cache
- Test file operations (open, save, close)
- Test content updates and cache invalidation

**Integration Tests**:
- Test file operations with SyncManager
- Test state persistence to IndexedDB
- Test event bus emissions for agent tools

**Browser E2E Tests**:
- Test file open/close workflow
- Test content editing and save
- Test state restoration on page reload
- Test mobile/desktop layout switching

---

## 10. References

### 10.1 Related Documents

- **State Management Audit**: [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](../_bmad-output/state-management-audit-p1.10-2025-12-26.md)
- **MVP Sprint Plan**: [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](../_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- **State Architecture**: [`docs/2025-12-23/state-architecture.md`](../docs/2025-12-23/state-architecture.md)

### 10.2 Code References

- **Zustand Store**: [`src/lib/state/ide-store.ts`](../src/lib/state/ide-store.ts)
- **Desktop Layout**: [`src/components/layout/IDELayout.tsx`](../src/components/layout/IDELayout.tsx)
- **Mobile Layout**: [`src/components/layout/MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx)
- **File Handlers**: [`src/components/layout/hooks/useIDEFileHandlers.ts`](../src/components/layout/hooks/useIDEFileHandlers.ts)
- **Dexie Storage**: [`src/lib/state/dexie-storage.ts`](../src/lib/state/dexie-storage.ts)

### 10.3 External References

- **Zustand Documentation**: https://zustand.docs.pmnd.rs
- **Dexie Documentation**: https://dexie.org
- **React Hooks**: https://react.dev/reference/react

---

## 11. Glossary

| Term | Definition |
|-------|------------|
| **Single Source of Truth** | Architectural principle where each state property has ONE owner (either Zustand, Context, or localStorage) |
| **Ephemeral State** | State that exists only in memory, not persisted to storage, cleared on component unmount |
| **Persisted State** | State that is saved to IndexedDB and restored on page reload |
| **State Duplication** | Anti-pattern where the same state is managed in multiple places, causing synchronization issues |
| **Zustand Store** | Lightweight state management library used for global state with optional persistence |
| **Dexie** | IndexedDB wrapper library used for browser database operations |

---

## 12. Appendices

### Appendix A: State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    useIDEStore (Zustand)                │
│  - Persisted to IndexedDB via Dexie                   │
│  - Single source of truth for IDE state                │
└─────────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ IDELayout.tsx │  │MobileIDELayout │  │ Other        │
│ (Desktop)     │  │.tsx          │  │ Components   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │ File Operations │
                  │ (via handlers)  │
                  └──────────────────┘
```

### Appendix B: Migration Checklist

**Pre-Migration**:
- [ ] Review current state duplication in audit document
- [ ] Understand Zustand store interface
- [ ] Review file handler hook implementation
- [ ] Confirm Team A MRT-3 completion

**Migration**:
- [ ] Remove `setOpenFiles` from [`IDELayout.tsx`](../src/components/layout/IDELayout.tsx)
- [ ] Remove `setOpenFiles` from [`MobileIDELayout.tsx`](../src/components/layout/MobileIDELayout.tsx)
- [ ] Add `setFileContentCache` to hook calls in both layouts
- [ ] Verify `openFiles` derivation uses `useMemo`
- [ ] Test file operations in desktop layout
- [ ] Test file operations in mobile layout

**Post-Migration**:
- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Perform browser E2E testing
- [ ] Update AGENTS.md with best practices
- [ ] Create handoff document for next phase

---

**Document End**

*Prepared by*: Team B Architect Mode (bmad-bmm-architect)
*Date*: 2025-12-27
*Next Action*: Await Team A MRT-3 completion, then execute refactoring in Dev mode
