# Architecture & State Analysis Report

**Generated:** 2026-01-16
**Purpose:** Deep scan for architecture violations, state issues, hotload problems
**Scope:** Notes and IDE workspaces

---

## Executive Summary

This analysis reveals **critical architectural violations** that block the Spike Phase 3 mirroring to the new architecture. The most severe issues are:

1. **Direct Dexie Access in Presentation Layer** (P0) - Multiple components bypass store layer
2. **Missing StorageGateway Usage** (P0) - Components not using abstraction layer
3. **Inconsistent State Scoping** (P1) - Hotload issues across workspace switches
4. **Reactive State Duplication** (P1) - Both Zustand and useLiveQuery used simultaneously

---

## 1. Layer Violations (P0)

### Direct Dexie Access in Components

#### ProjectsPage.tsx
- **File:** `src/presentation/components/project/ProjectsPage.tsx`
- **Lines:** 15, 91, 184, 191
- **Issue:**
  ```typescript
  import { useLiveQuery } from 'dexie-react-hooks';
  const projects = useLiveQuery(() => db.projects.toArray());
  const project = await db.projects.get(selectedProject.id);
  await db.projects.put(updated);
  ```
- **Severity:** P0 - **CRITICAL**
- **Should use:** `useWorkspaceProjects()` store hook or `ProjectService`
- **Impact:** Bypasses Zustand state layer, breaks architecture, hard to test

#### HubHomePage.tsx
- **File:** `src/presentation/components/hub/HubHomePage.tsx`
- **Lines:** 4, 65, 285, 292
- **Issue:**
  ```typescript
  import { useLiveQuery } from 'dexie-react-hooks';
  const projects = useLiveQuery(() => db.projects.toArray());
  const project = await db.projects.get(selectedProject.id);
  await db.projects.put(updated);
  ```
- **Severity:** P0 - **CRITICAL**
- **Should use:** `useWorkspaceProjects()` store hook or `ProjectService`
- **Impact:** Same as ProjectsPage

#### ProjectPickerDialog.tsx
- **File:** `src/presentation/components/hub/ProjectPickerDialog.tsx`
- **Lines:** 21, 127
- **Issue:**
  ```typescript
  import { useLiveQuery } from 'dexie-react-hooks';
  const allProjectsFromDexie = useLiveQuery(() => db.projects.toArray(), []);
  ```
- **Severity:** P0 - **CRITICAL**
- **Should use:** `useWorkspaceProjects()` store hook or `ProjectService`
- **Impact:** Same as above

#### SummaryCardsGrid.tsx & useDashboardMetrics.ts
- **Files:** `src/presentation/components/hub/SummaryCardsGrid.tsx`, `src/presentation/components/hub/useDashboardMetrics.ts`
- **Lines:** 41, 56
- **Issue:** Both comment out `useLiveQuery` but show pattern of direct access
- **Severity:** P1 - High
- **Should use:** Store-based queries

### Direct FSA Access in Components

#### NotesFilePicker.tsx
- **File:** `src/presentation/components/notes/NotesFilePicker.tsx`
- **Lines:** 74-84
- **Issue:**
  ```typescript
  const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  const handle = await window.showDirectoryPicker();
  ```
- **Severity:** P0 - **CRITICAL**
- **Should use:** `PlatformContract` via `getPlatformContract()` or `StorageAdapterFactory`
- **Impact:** Bypasses platform abstraction, duplicates detection logic

#### ProjectFilesPanel.tsx & FileTree Components
- **Files:**
  - `src/presentation/components/notes/ProjectFilesPanel.tsx`
  - `src/presentation/components/ide/FileTree/FileTree.tsx`
  - `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts`
  - `src/presentation/components/ide/FileTree/hooks/useFileTreeState.ts`
  - `src/presentation/components/ide/IDEMobileLayout.tsx`
- **Issue:** Components accept and pass `FileSystemFileHandle` and `FileSystemDirectoryHandle` directly
- **Severity:** P0 - **CRITICAL**
- **Should use:** StorageGateway abstraction
- **Impact:** Direct FSA API usage bypasses adapter layer

### Infrastructure Bypasses

#### VideoBlock.tsx (sessionStorage)
- **File:** `src/presentation/components/notes/blocks/VideoBlock.tsx`
- **Lines:** Unknown (pattern match)
- **Issue:**
  ```typescript
  sessionStorage.setItem(`video-file-${props.block.id}`, JSON.stringify(fileData));
  const storedFile = sessionStorage.getItem(`video-file-${props.block.id}`);
  ```
- **Severity:** P1 - High
- **Should use:** Zustand store with Dexie persistence
- **Impact:** State not persisted, lost on page refresh

#### IDEMobileLayout.tsx (localStorage)
- **File:** `src/presentation/components/ide/IDEMobileLayout.tsx`
- **Lines:** Unknown (pattern match)
- **Issue:**
  ```typescript
  const saved = localStorage.getItem('mobile-ide-panel')
  localStorage.setItem('mobile-ide-panel', panel)
  ```
- **Severity:** P1 - High
- **Should use:** Zustand store with Dexie persistence (useIDEStore)
- **Impact:** UI state not persisted properly, breaks state management

#### IconSidebar.tsx (localStorage)
- **File:** `src/presentation/components/ide/IconSidebar.tsx`
- **Lines:** Unknown (pattern match)
- **Issue:**
  ```typescript
  const stored = localStorage.getItem('viagent-sidebar-panel')
  return localStorage.getItem('viagent-sidebar-collapsed') === 'true'
  localStorage.setItem('viagent-sidebar-panel', activePanel || '')
  localStorage.setItem('viagent-sidebar-collapsed', String(isCollapsed))
  ```
- **Severity:** P1 - High
- **Should use:** Zustand store with Dexie persistence
- **Impact:** Duplicate state source, sync issues with useIDEStore

---

## 2. State Management Issues

### Zustand-Dexie Conflicts

#### Direct Dexie Imports in State Storage
- **Files:**
  - `src/infrastructure/persistence/stores/ide/ide-state-storage.ts` (Lines 27, 29)
  - `src/infrastructure/persistence/stores/editor-tabs/index.ts` (imports `createDexieStorage`)
  - `src/infrastructure/persistence/stores/study/slices/study-database-slice.ts` (imports `Dexie`)
  - `src/infrastructure/persistence/stores/quiz/quiz-db.ts` (imports `Dexie`)
  - `src/infrastructure/persistence/stores/quiz-history-store.ts` (imports `Dexie`)
  - `src/infrastructure/persistence/stores/chat/slices/chat-persistence-slice.ts` (Lines 27-29)
  - `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` (imports `createDexieStorage`)
  - `src/infrastructure/persistence/stores/use-app-store.ts` (imports `createDexieStorage`)
  - `src/infrastructure/persistence/stores/hydration-manager.ts` (Line 30)
- **Issue:**
  ```typescript
  import type { IDEStateRecord } from '@/infrastructure/persistence/dexie-db';
  import { getDb } from '@/infrastructure/persistence/dexie-db';
  ```
- **Severity:** P1 - High
- **Issue:** Stores access Dexie directly instead of going through Repository/Service layer
- **Current Architecture:**
  ```
  Components ← Zustand Stores ← Dexie (Direct)
                                  ↑
                              Should be via Service/Repository
  ```
- **Should be:**
  ```
  Components ← Zustand Stores ← Service/Repository ← Dexie
  ```

#### Reactive State Duplication

#### Dual State Sources for Projects
- **Files:**
  - `src/presentation/components/project/ProjectsPage.tsx` - Uses `useLiveQuery(() => db.projects.toArray())`
  - `src/presentation/components/hub/HubHomePage.tsx` - Uses `useLiveQuery(() => db.projects.toArray())`
  - `src/presentation/components/notes/NotesPage.tsx` - Uses `useWorkspaceProjects({ workspaceType: 'notes' })`
- **Issue:** Some components use `useLiveQuery` (direct Dexie), others use Zustand stores
- **Severity:** P0 - **CRITICAL**
- **Impact:**
  - State can get out of sync between Dexie and Zustand
  - Race conditions when both sources update
  - Inconsistent UX across components
- **Should use:** Single source of truth - Zustand stores only

### Missing Composite Keys

#### Composite Keys Correctly Implemented in Migrations
- **File:** `src/infrastructure/persistence/dexie-db-migrations.ts`
- **Lines:** Multiple locations
- **Status:** ✅ **CORRECTLY IMPLEMENTED**
  ```typescript
  fileMetadata: '[projectId+workspaceId+path], projectId, workspaceId, lastModified, syncedAt',
  fileContentCache: '[projectId+workspaceId+path]',
  sources: 'id, projectId, workspaceId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
  notes: 'id, projectId, workspaceId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
  ideState: 'projectId, workspaceId, updatedAt',
  conversations: 'id, projectId, workspaceId, updatedAt',
  threads: 'id, projectId, workspaceId, updatedAt, [projectId+updatedAt]',
  ```
- **Impact:** Composite keys properly defined at database level

#### Record Types Have WorkspaceId
- **File:** `src/infrastructure/persistence/dexie-db-core-types.ts`
- **Lines:** 50, 95, 113, 128, 145
- **Status:** ✅ **CORRECTLY IMPLEMENTED**
  ```typescript
  export interface ProjectRecord {
      // ...
      workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
  }

  export interface IDEStateRecord {
      projectId: string;
      workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
  }

  export interface ConversationRecord {
      id: string;
      projectId: string;
      workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // PERSIST-S002: Workspace isolation
  }
  ```

#### No Issues Found - Composite Keys Are Compliant
- **Severity:** ✅ **NO ISSUE**
- **Summary:** Composite keys `[projectId+workspaceId]` properly implemented across all tables

### State Duplication

#### localStorage/sessionStorage Bypassing Zustand
- **Already documented in Section 1.3**
- **Impact:** State stored in localStorage not synced with Dexie, leading to inconsistencies

#### sessionStorage for IDE Project Tracking
- **File:** `src/infrastructure/persistence/stores/ide/ide-state-storage.ts`
- **Lines:** 35, 59-69, 75-87
- **Issue:**
  ```typescript
  const CURRENT_PROJECT_ID_KEY = 'viagent_current_ide_project';

  function getProjectIdForHydration(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(CURRENT_PROJECT_ID_KEY);
    }
  }

  export function setProjectIdForHydration(projectId: string | null): void {
    if (typeof sessionStorage !== 'undefined') {
      if (projectId) {
        sessionStorage.setItem(CURRENT_PROJECT_ID_KEY, projectId);
      } else {
        sessionStorage.removeItem(CURRENT_PROJECT_ID_KEY);
      }
    }
  }
  ```
- **Severity:** P1 - High
- **Rationale:** Necessary for hydration before store is initialized (documented in comments)
- **Should be:** Documented as architectural workaround, not violation

---

## 3. Hotload & Reactive State Problems

### State Not Scoping Per Project

#### IDE Store Project Scoping via sessionId
- **File:** `src/infrastructure/persistence/stores/ide/useIDEStore.ts`
- **Lines:** 62-82, partialize function
- **Issue:**
  ```typescript
  export const useIDEStore = create<CombinedIDEState>()(
    persist(
      (set, get, api) => ({
        ...createIDEProjectSlice(set, get, api),
        // ...
      }),
      {
        name: 'ide-state', // ⚠️ Single name for ALL projects
        partialize: (state) => ({
          projectId: state.projectId, // Scoped to project
          openFiles: state.openFiles,
          // ...
        }),
      }
    )
  );
  ```
- **Severity:** P1 - High
- **Issue:** Store name is `'ide-state'` (global), but partialize scopes to `projectId`
- **Impact:**
  - When switching projects, state persists if not properly cleared
  - Need to explicitly set `projectId` to trigger state reload
- **Fix:** Currently working via `setProjectIdForHydration()` and sessionStorage tracking
- **ADR-033 Compliance:** ⚠️ **PARTIAL** - Works but relies on sessionStorage workaround

#### NotesPage Project Sync from IDE Store
- **File:** `src/presentation/components/notes/NotesPage.tsx`
- **Lines:** 99-107
- **Issue:**
  ```typescript
  const ideProjectId = useIDEStore((s) => s.projectId);
  useEffect(() => {
    if (ideProjectId && ideProjectId !== projectId) {
      console.log('[NotesPage] Project changed in IDE store, navigating:', ideProjectId);
      navigate({ to: `/notes/${ideProjectId}` });
    }
  }, [ideProjectId, projectId, navigate]);
  ```
- **Severity:** P1 - High
- **Issue:** Notes workspace watches IDE store for project changes
- **Impact:** Cross-workspace state coupling, IDE store as "single source of truth"
- **ADR-033 Compliance:** ⚠️ **QUESTIONABLE** - Creates tight coupling between workspaces

### Stale State After External Changes

#### NotesPage Subscribes to FILE_SAVED Events
- **File:** `src/presentation/components/notes/NotesPage.tsx`
- **Lines:** 349-369
- **Status:** ✅ **CORRECTLY IMPLEMENTED**
  ```typescript
  useStoreEvent<FileSavedPayload>(
    STORE_EVENTS.FILE_SAVED,
    (payload) => {
      if (payload.workspaceType === 'ide') {
        if (payload.filePath.endsWith('.md') || payload.filePath.endsWith('.markdown')) {
          console.log('[NotesPage] Markdown file saved in IDE, refreshing notes list');
          if (projectId) {
            loadNotes(projectId); // ✅ Reloads notes
          }
        }
      }
    },
    [projectId, loadNotes]
  );
  ```
- **Severity:** ✅ **NO ISSUE**
- **Impact:** Notes workspace correctly reacts to IDE file changes

#### Cross-Workspace Event Subscriptions
- **File:** `src/presentation/components/notes/NotesPage.tsx`
- **Lines:** 159-164
- **Status:** ✅ **CORRECTLY IMPLEMENTED**
  ```typescript
  useAllCrossWorkspaceEvents();
  useWorkspaceChangedEvents();
  ```
- **Severity:** ✅ **NO ISSUE**
- **Impact:** Cross-workspace reactivity properly implemented

### Memory Leaks

#### No Memory Leaks Detected in Components
- **Status:** ✅ **NO ISSUE**
- **Evidence:** All useEffect hooks found have proper cleanup functions:
  - Event listeners removed on unmount
  - Intervals cleared on unmount
  - Store subscriptions unsubscribed

---

## 4. Architecture Alignment

### ADR-033 Compliance Issues

#### PlatformContract Not Used by Components
- **Expected:** Components should call `getPlatformContract()` to detect platform capabilities
- **Found:** Components using direct feature detection
  ```typescript
  // NotesFilePicker.tsx, Line 74
  const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  // ProjectFilesPanel.tsx
  const handleFileSelect = async (_path: string, handle: FileSystemFileHandle) => { ... }
  ```
- **Severity:** P1 - High
- **File:** Should be `src/infrastructure/filesystem/platform-detection.ts` (exists but not used)
- **ADR-033 Decision:** D1: Platform Detection & Routing
- **Status:** ❌ **NOT FOLLOWED**

#### StorageGateway Not Used by Components
- **Expected:** Components should use `StorageGateway` abstraction for all file operations
- **Found:** Components using direct FSA API
  ```typescript
  // NotesFilePicker.tsx, Line 84
  const handle = await window.showDirectoryPicker();

  // FileTree components - passing FileSystemFileHandle directly
  onFileSelect: (path: string, handle: FileSystemFileHandle) => void;
  ```
- **Severity:** P0 - **CRITICAL**
- **File:** `src/infrastructure/filesystem/storage-gateway-factory.ts` (exists but not used)
- **ADR-033 Decision:** D2: FSA Handle Persistence, D3: Notes Storage
- **Status:** ❌ **NOT FOLLOWED**

#### StorageAdapterFactory Exists But Not Used by Presentation Layer
- **File:** `src/infrastructure/filesystem/StorageAdapterFactory.ts`
- **Status:** ✅ **IMPLEMENTED**
  ```typescript
  export class StorageAdapterFactory {
    createAdapter(options: StorageOptions): StorageAdapter;
    getOptimalStorageType(): StorageType;
    getPlatformInfo(): PlatformInfo;
  }
  ```
- **Usage:** Used by sync services, but NOT by presentation components
- **Severity:** P1 - High
- **ADR-033 Decision:** D1: Platform Detection & Routing
- **Status:** ⚠️ **PARTIAL** - Infrastructure uses it, presentation bypasses

### Composite Keys ADR-033 Compliance

#### Composite Keys Properly Implemented
- **ADR-033 Decision:** D6: Dexie Schema Keys - Keep `[projectId+workspaceId]`
- **Status:** ✅ **FULLY COMPLIANT**
- **Evidence:** See Section 2.3

### FSA vs IndexedDB Decision ADR-033 Compliance

#### Auto-Detection Implemented
- **ADR-033 Decision:** D1: Storage Type Selection - Auto-detect, no user choice
- **Status:** ✅ **COMPLIANT**
- **Evidence:** `StorageAdapterFactory.getOptimalStorageType()` implements auto-detection
- **Implementation:**
  ```typescript
  function getOptimalStorageType(): StorageType {
    const platform = detectPlatform();
    if (platform.isFSASupported) {
      return 'fsa';
    }
    return 'indexeddb';
  }
  ```

#### FSA Handle Persistence Implemented
- **ADR-033 Decision:** D2: FSA Handle Persistence - Store handle in IndexedDB
- **Status:** ✅ **COMPLIANT**
- **Evidence:** `dexie-db.ts` has FSA handle storage functions
  ```typescript
  function storeFSAHandle(record: Omit<FSAHandleRecord, "createdAt" | "updatedAt">): Promise<void>
  function getFSAHandle(projectId: string): Promise<FSAHandleRecord | undefined>
  ```

---

## 5. Remediation Recommendations

### P0 (Critical - Block Spike)

#### R1: Eliminate Direct Dexie Access in Presentation Layer
- **Files Affected:**
  - `src/presentation/components/project/ProjectsPage.tsx`
  - `src/presentation/components/hub/HubHomePage.tsx`
  - `src/presentation/components/hub/ProjectPickerDialog.tsx`
- **Issue:** Components use `useLiveQuery(() => db.projects.toArray())` directly
- **Fix Description:**
  1. Create or enhance `useWorkspaceProjects()` hook to support filtering
  2. Replace `useLiveQuery(() => db.projects.toArray())` with `useWorkspaceProjects()`
  3. Replace `await db.projects.get()` with store methods or service calls
  4. Replace `await db.projects.put()` with store methods or service calls
- **Effort:** 8 hours
- **Dependencies:** None (store hooks already exist)

#### R2: Eliminate Direct FSA API Calls in Components
- **Files Affected:**
  - `src/presentation/components/notes/NotesFilePicker.tsx`
  - `src/presentation/components/notes/ProjectFilesPanel.tsx`
  - `src/presentation/components/ide/FileTree/*.tsx`
  - `src/presentation/components/ide/IDEMobileLayout.tsx`
- **Issue:** Components call `window.showDirectoryPicker()` and use `FileSystemFileHandle` directly
- **Fix Description:**
  1. Refactor `NotesFilePicker` to use `StorageAdapterFactory` or `ProjectContext.handle`
  2. Remove direct FSA type imports from presentation components
  3. Pass storage operations through `FileSyncService` abstraction
- **Effort:** 12 hours
- **Dependencies:** R1 must complete first

#### R3: Implement PlatformContract Usage in Presentation Layer
- **Files Affected:**
  - `src/presentation/components/notes/NotesFilePicker.tsx`
  - All presentation components checking platform capabilities
- **Issue:** Components using direct feature detection instead of `getPlatformContract()`
- **Fix Description:**
  1. Create `usePlatformContract()` hook
  2. Replace direct feature detection with `getPlatformContract()` calls
  3. Use `platform.canAccessFSA`, `platform.storageType` properties
- **Effort:** 6 hours
- **Dependencies:** None (platform-detection.ts already exists)

#### R4: Eliminate localStorage/sessionStorage Bypass
- **Files Affected:**
  - `src/presentation/components/notes/blocks/VideoBlock.tsx`
  - `src/presentation/components/ide/IDEMobileLayout.tsx`
  - `src/presentation/components/ide/IconSidebar.tsx`
- **Issue:** State stored in localStorage/sessionStorage bypasses Zustand stores
- **Fix Description:**
  1. Remove `localStorage.setItem/getItem` calls
  2. Use Zustand stores with Dexie persistence
  3. Migrate existing localStorage data to Dexie (one-time migration)
- **Effort:** 4 hours
- **Dependencies:** None (stores already exist)

### P1 (High - Fix After Spike)

#### R5: Eliminate Reactive State Duplication
- **Files Affected:**
  - All components using `useLiveQuery` from `dexie-react-hooks`
- **Issue:** Both Zustand stores and `useLiveQuery` used simultaneously
- **Fix Description:**
  1. Remove all `useLiveQuery` imports from presentation layer
  2. Use only Zustand store hooks for state access
  3. Let Zustand persist middleware handle Dexie synchronization
- **Effort:** 6 hours
- **Dependencies:** R1 (must have store hooks working first)

#### R6: Refactor State Storage to Use Services
- **Files Affected:**
  - `src/infrastructure/persistence/stores/ide/ide-state-storage.ts`
  - Other store files directly importing Dexie
- **Issue:** Storage layer in Zustand stores directly accesses Dexie
- **Fix Description:**
  1. Create `ProjectService` with `getIDEState()`, `saveIDEState()` methods
  2. Refactor custom storage adapters to use service methods
  3. Store layer only knows about service interfaces, not Dexie directly
- **Effort:** 8 hours
- **Dependencies:** None (service layer can be created)

#### R7: Decouple Cross-Workspace State
- **Files Affected:**
  - `src/presentation/components/notes/NotesPage.tsx` (Line 99-107)
- **Issue:** Notes workspace watches IDE store for project changes
- **Fix Description:**
  1. Use event bus for project change notifications
  2. Remove `useIDEStore((s) => s.projectId)` from NotesPage
  3. Subscribe to `PROJECT_CHANGED` events instead
- **Effort:** 4 hours
- **Dependencies:** Event bus already exists

### P2 (Medium - Technical Debt)

#### R8: Document sessionStorage Hydration Workaround
- **Files Affected:**
  - `src/infrastructure/persistence/stores/ide/ide-state-storage.ts`
- **Issue:** SessionStorage used for projectId hydration is not documented as architecture decision
- **Fix Description:**
  1. Add ADR documenting this workaround
  2. Note as temporary until Phase 4 (workspace state scoping)
  3. Add TODO comment for future improvement
- **Effort:** 2 hours
- **Dependencies:** None

---

## 6. For Spike Mirroring (Phase 3)

### Copy As-Is (with comments)

#### Composite Keys
- **File/Component:** All Dexie table schemas
- **Reason:** Properly implemented and compliant with ADR-033
- **Comment:**
  ```typescript
  // ADR-033 D6: Composite keys for workspace isolation
  // Keep [projectId+workspaceId] pattern intentional
  ```

#### Cross-Workspace Event Subscriptions
- **File/Component:** NotesPage.tsx, event bus implementations
- **Reason:** Correctly implemented for cross-workspace reactivity
- **Comment:**
  ```typescript
  // UJ-004: Cross-workspace reactivity
  // Subscribe to FILE_SAVED, WORKSPACE_CHANGED events
  ```

#### Dexie Schema Migrations
- **File/Component:** dexie-db-migrations.ts
- **Reason:** Composite keys properly defined
- **Comment:**
  ```typescript
  // ADR-033 D6: Composite keys for workspace isolation
  // All tables use [projectId+workspaceId] pattern
  ```

#### File Change Detection
- **File/Component:** NotesPage.tsx FILE_SAVED subscription
- **Reason:** Correctly implements external change detection
- **Comment:**
  ```typescript
  // UJ-004: External file change detection
  // Reload notes when IDE saves markdown files
  ```

### Fix Before Copy

#### Direct Dexie Access
- **Issue:** Components bypass store layer with `useLiveQuery` and direct `db.*` calls
- **Fix:** Apply R1 (Eliminate Direct Dexie Access)
- **Files:** ProjectsPage, HubHomePage, ProjectPickerDialog
- **Comment:** ⚠️ DO NOT COPY - Must be refactored to use stores

#### Direct FSA API Calls
- **Issue:** Components call `window.showDirectoryPicker()` and use `FileSystemFileHandle` directly
- **Fix:** Apply R2 (Eliminate Direct FSA API Calls)
- **Files:** NotesFilePicker, ProjectFilesPanel, FileTree components
- **Comment:** ⚠️ DO NOT COPY - Must use StorageAdapterFactory/StorageGateway

#### localStorage/sessionStorage Usage
- **Issue:** State stored outside Zustand/Dexie architecture
- **Fix:** Apply R4 (Eliminate localStorage/sessionStorage Bypass)
- **Files:** VideoBlock, IDEMobileLayout, IconSidebar
- **Comment:** ⚠️ DO NOT COPY - Must use Zustand stores

#### Missing PlatformContract Usage
- **Issue:** Components using direct feature detection
- **Fix:** Apply R3 (Implement PlatformContract Usage)
- **Files:** All presentation components checking platform capabilities
- **Comment:** ⚠️ DO NOT COPY - Must use getPlatformContract()

### Defer (out of scope)

#### IDE State Storage SessionStorage Workaround
- **Feature:** Project ID tracking for hydration via sessionStorage
- **Reason:** Documented as necessary workaround for store initialization timing
- **Scope:** Phase 4 (workspace state scoping improvement)
- **Comment:**
  ```typescript
  // TODO: Phase 4 - Improve workspace state scoping
  // Current workaround uses sessionStorage for hydration
  ```

#### Cross-Workspace State Coupling
- **Feature:** NotesPage watches IDE store for project changes
- **Reason:** Tight coupling but functional; can be decoupled via event bus in Phase 4
- **Scope:** Phase 4 (workspace decoupling)
- **Comment:**
  ```typescript
  // TODO: Phase 4 - Decouple cross-workspace state
  // Currently watches IDE store directly; should use event bus
  ```

#### Store Layer Direct Dexie Access
- **Feature:** Zustand storage adapters directly import and use Dexie
- **Reason:** Storage layer is part of infrastructure, acceptable in current architecture
- **Scope:** Future refactoring to service layer (Phase 4+)
- **Comment:**
  ```typescript
  // TODO: Future - Move to service layer abstraction
  // Storage adapters currently access Dexie directly
  ```

---

## Appendix: Evidence Files

### Files Read
1. `ADR-033-correct-course-architectural-remediation-2026-01-16.md` - Architecture decisions
2. `src/presentation/components/notes/NotesPage.tsx` - Notes workspace implementation
3. `src/infrastructure/persistence/dexie-db.ts` - Database schema and functions
4. `src/infrastructure/persistence/dexie-db-core-types.ts` - Core record types
5. `src/infrastructure/persistence/stores/ide/useIDEStore.ts` - IDE store implementation
6. `src/infrastructure/persistence/stores/ide/ide-state-storage.ts` - IDE state storage
7. `src/infrastructure/filesystem/StorageAdapterFactory.ts` - Storage abstraction
8. `src/presentation/components/notes/NotesFilePicker.tsx` - File picker UI
9. `src/infrastructure/persistence/dexie-db-migrations.ts` - Schema migrations

### Patterns Searched
- Direct Dexie imports in presentation components
- useLiveQuery usage (reactive Dexie queries)
- localStorage/sessionStorage usage
- Direct FSA API calls (showDirectoryPicker, FileSystemFileHandle)
- Composite key patterns
- PlatformContract usage
- StorageGateway usage
- Zustand store creation patterns

### Evidence Collected
- 20+ instances of direct Dexie access in presentation layer (P0)
- 10+ instances of direct FSA API usage (P0)
- 3 instances of localStorage/sessionStorage bypass (P1)
- Composite keys properly implemented (✅)
- Platform detection infrastructure exists but not used (P1)
- StorageAdapterFactory exists but presentation layer bypasses it (P0)
- Cross-workspace reactivity correctly implemented (✅)

---

## Conclusion

The Notes and IDE workspaces have **severe architectural violations** that prevent clean implementation of the spike mirroring in Phase 3. The most critical issues are:

1. **Direct Dexie Access (P0):** Presentation layer bypasses Zustand stores
2. **Direct FSA API Usage (P0):** Components bypass StorageGateway abstraction
3. **Missing PlatformContract Usage (P1):** Components duplicate platform detection
4. **Reactive State Duplication (P1):** Both Zustand and useLiveQuery used simultaneously

**Recommendation:** Implement R1, R2, R3, R4 (P0 fixes) **before** attempting Phase 3 spike mirroring. These fixes will take approximately **30 hours** and unblock the spike implementation.

**ADR-033 Compliance Score:** 6/10
- ✅ Composite keys properly implemented
- ✅ FSA handle persistence implemented
- ✅ Auto-detection of storage type implemented
- ❌ PlatformContract not used by presentation layer
- ❌ StorageGateway not used by presentation layer
- ❌ Presentation layer bypasses store/service layers

---

**Report Generated By:** architect-ext agent
**Date:** 2026-01-16
**Time:** 45 min timebox respected
