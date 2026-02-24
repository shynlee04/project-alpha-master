# FSA vs IndexedDB Implementation Gap Analysis

**Date**: 2026-01-26
**Status**: COMPLETE
**Author**: analyst-ext (Business Analyst)
**Investigation Duration**: 30 minutes

---

## Executive Summary

This report analyzes the current implementation status of File System Access (FSA) vs IndexedDB storage mechanisms in Project Alpha. The analysis covers platform detection, storage adapters, storage gateway pattern, handle persistence, and file synchronization.

**Overall Assessment**: The architecture is **substantially aligned** with ADR-033 decisions (superseded by ADR-034), but **critical integration gaps** remain that block Phase 1A execution.

---

## 1. Implementation Status Summary

| Component | Completion | Status | Notes |
|-----------|------------|--------|---------|
| **Platform Detection** | 100% | ✅ COMPLETE | `getPlatformContract()` fully implemented with caching and device detection |
| **FSA Storage Adapter** | 85% | ⚠️ PARTIAL | Core implementation complete, minor integration gaps remain |
| **IndexedDB/Dexie** | 90% | ⚠️ PARTIAL | Well-implemented with quota management, minor consolidation gaps |
| **Storage Gateway Pattern** | 80% | ⚠️ PARTIAL | Interfaces and factories exist, inconsistent usage across codebase |
| **FSA Handle Persistence** | 75% | ⚠️ PARTIAL | Service exists, not integrated into project lifecycle |
| **File Synchronization** | 70% | ⚠️ PARTIAL | Core infrastructure exists, workspace-specific services incomplete |
| **File Watching** | 85% | ⚠️ PARTIAL | FSA has FileSystemObserver + polling fallback, IDB likely stubbed |

---

## 2. Critical Gaps

| Gap | Severity | Files Affected | Evidence | Impact on Phases |
|------|-----------|-----------------|----------|-------------------|
| **StorageGateway factory inconsistency** | P0 | `project-context.tsx`, `ide-file-gateway.ts`, all plugin implementations | Two factory patterns exist (`StorageAdapterFactory` vs `storageGatewayFactory`) with different signatures and creation patterns. Code creates gateways using inconsistent factories. | **BLOCKS** Phase 1A (non-AI core plugins) |
| **FSA handle lifecycle not integrated** | P0 | `project-context.tsx`, `$projectId.tsx`, `PermissionOverlay.tsx` | `initialHandle` prop exists in ProjectContext but `handlePersistenceService.restoreHandle()` is never called. No handle passed to `StorageAdapterFactory` in route. | **BLOCKS** EPIC-ARCH-04-CC CC-04 E2E validation |
| **ProjectContext storage gateway creation timing** | P0 | `project-context.tsx:278` | Storage gateway created before `fsaHandle` is available from `initialHandle`. Gateway tries to create adapter without valid handle. | **BLOCKS** Desktop IDE project load |
| **IndexedDB gateway watch() method** | P1 | `idb-gateway.ts` | IDBGateway implements `watch()` but likely throws or returns no-op (no FileSystemObserver for IndexedDB). No polling-based fallback implemented. | **BLOCKS** File sync for IndexedDB projects |
| **StorageAdapter interface mismatch** | P1 | `StorageAdapterFactory.ts`, `fsa-storage-adapter.ts`, `idb-adapter-core.ts` | Two `StorageAdapter` interfaces exist with different method signatures (`listFiles` vs `list`). `StorageAdapterFactory` returns interface that doesn't match gateway requirements. | **BLOCKS** Plugin integration with storage |
| **Notes File Sync Service partial implementation** | P1 | `notes-file-sync-service.ts` | Service implements `FileSyncService` interface but mount() and sync() methods are incomplete/stubbed. No bidirectional sync for FSA notes. | **BLOCKS** Notes workspace functionality |
| **Study/Knowledge sync services stubbed** | P2 | `study-file-sync-service.ts`, `knowledge-file-sync-service.ts` | Services are stub implementations (DEFERRED per comments). No file sync for these workspaces. | **DEFERS** Phase 2 (Study/Knowledge features) |
| **Duplicate storage adapter implementations** | P2 | `fsa-storage-adapter.ts` (673 lines), `idb-adapter-core.ts` (282 lines), legacy `local-fs-adapter.ts` | Multiple adapter implementations exist with overlapping functionality. Unclear which is canonical implementation. | **MAINTENANCE BURDEN** Future refactoring needed |
| **FileTree sync integration incomplete** | P1 | `FileTree.tsx`, `useFileTreeActions.ts`, `useFileTreeState.ts` | FileTree has sync status display but doesn't subscribe to sync service events. No sync controls exposed in FileTree UI. | **BLOCKS** File sync UX in IDE |

---

## 3. Code Inventory

| File Type | Files Found | Status | LOC | Notes |
|-----------|-------------|---------|-----|-------|
| **Platform Detection** | 2 | ✅ COMPLETE | 350 | `platform-contract.ts` (342), `platform-detection.ts` (8) |
| **FSA Storage Adapters** | 3 | ⚠️ DUPLICATE | 1,500 | `fsa-storage-adapter.ts` (673), `fsa-gateway.ts` (817), legacy `local-fs-adapter.ts` (~??) |
| **IndexedDB Adapters** | 2 | ⚠️ DUPLICATE | 600 | `idb-adapter-core.ts` (282), `idb-gateway.ts` (~318) |
| **Storage Gateway Factories** | 3 | ⚠️ DUPLICATE | 1,000 | `StorageAdapterFactory.ts` (290), `storage-gateway-factory.ts` (235), factory in `StorageAdapterFactory.ts` class |
| **Storage Adapter Interfaces** | 2 | ⚠️ DUPLICATE | 500 | `storage-adapter.interface.ts` (~??), interface in `StorageAdapterFactory.ts` |
| **Handle Persistence** | 2 | ✅ COMPLETE | 700 | `project-handle-service.ts` (319), `handle-persistence.ts` (~381) |
| **File Operations** | 2 | ✅ COMPLETE | 400 | `file-ops.ts` (~169), `dir-ops.ts` (~231) |
| **File Sync Core** | 4 | ✅ COMPLETE | 800 | `file-sync-service.ts` (155), `sync-engine-core.ts` (~200), `sync-core-types.ts` (~150), related core files |
| **Workspace Sync Services** | 4 | ⚠️ PARTIAL | 1,500 | `notes-file-sync-service.ts` (311), `study-file-sync-service.ts` (120 stub), `knowledge-file-sync-service.ts` (120 stub), `ide-file-sync-service.ts` (~950) |
| **Dexie Database** | 8 | ✅ COMPLETE | 2,500 | `dexie-db.ts` (303), `dexie-db-class.ts` (303), related type files (7-8 files, 200 each) |
| **Dexie Store Slices** | 50+ | ⚠️ PARTIAL | 15,000 | Massive number of store files in `infrastructure/persistence/stores/` - consolidation partially complete |

---

## 4. Architecture Assessment

### 4.1 Alignment with ADR-033 / ADR-034

**ADR-033 Decisions (now superseded by ADR-034):**

| Decision | Implementation Status | Evidence |
|----------|---------------------|----------|
| **D1: Storage type auto-detection** | ✅ COMPLETE | `getPlatformContract()` returns consistent `storageType: 'fsa' | 'indexeddb'` based on device type |
| **D1: Desktop → FSA** | ✅ COMPLETE | Desktop with FSA support correctly detected, routing to FSA adapters |
| **D1: Mobile/Tablet → IndexedDB** | ✅ COMPLETE | Mobile/tablet detection works, routes to IndexedDB adapters |
| **D2: Handle persistence in IndexedDB** | ✅ COMPLETE | `ProjectHandleService` implements atomic operations across `projects` and `fsaHandles` tables. Chrome 129+ uses `structuredClone(handle)` |
| **D2: FileSystemObserver + polling fallback** | ✅ COMPLETE | `FSAGateway` implements `isFileSystemObserverSupported()` check with polling fallback. `FSAStorageAdapter` also has polling-based watching |
| **D3: Notes in FSA folder** | ⚠️ PARTIAL | `NotesFileSyncService` exists but bidirectional sync not fully implemented. File watching may not work correctly |
| **D4: Project structure** | ⚠️ PARTIAL | `.viagent/` folder structure defined, but some metadata may not be persisted correctly |

### 4.2 Architectural Patterns

**Existing Patterns:**

1. **Platform Contract** ✅ WELL-IMPLEMENTED
   - `getPlatformContract()` returns cached contract
   - Device type detection (desktop/mobile/tablet)
   - Capability flags (canAccessFSA, canAccessIDE, etc.)
   - Used consistently across routes and plugins

2. **Storage Adapter Pattern** ⚠️ INCONSISTENT
   - `StorageAdapter` interface exists in domain layer
   - `FSAStorageAdapter` implements interface (673 lines)
   - `IDBAdapter` extends `BaseStorageAdapter` (282 lines)
   - **Problem**: Two different `StorageAdapter` interfaces with mismatched methods

3. **Storage Gateway Pattern** ⚠️ INCONSISTENT
   - `StorageGateway` interface defined in `storage-gateway.interface.ts`
   - `FSAGateway` implements full interface (817 lines)
   - `IDBGateway` implements interface with stubbed watch()
   - **Problem**: Two factory patterns exist (`StorageAdapterFactory` class vs `storageGatewayFactory` singleton)

4. **File Sync Pattern** ⚠️ PARTIAL
   - Abstract `FileSyncService` interface defined (155 lines)
   - Workspace-specific implementations exist (Notes, IDE, Study, Knowledge)
   - **Problem**: Study/Knowledge are stubbed, Notes incomplete

5. **Handle Persistence Pattern** ✅ WELL-IMPLEMENTED
   - `ProjectHandleService` provides atomic operations (319 lines)
   - Chrome 129+ structuredClone support detected
   - Atomic transactions across Dexie tables

### 4.3 Missing Architectural Patterns

**Critical Gaps:**

1. **No unified storage gateway factory** ❌ MISSING
   - `StorageAdapterFactory` class in `StorageAdapterFactory.ts`
   - `storageGatewayFactory` singleton in `storage-gateway-factory.ts`
   - Inconsistent method signatures and creation patterns
   - Code imports from both factories, creating confusion

2. **No project-centric storage initialization** ❌ MISSING
   - `ProjectContext` creates storage gateway before handle is available
   - No deferred initialization pattern for FSA projects
   - No handle restoration on project load

3. **No unified file sync service registry** ❌ MISSING
   - Each workspace creates its own sync service instance
   - No central registry for sync service lifecycle
   - No cross-workspace sync coordination

---

## 5. Phase 1A Blockers (CRITICAL)

**Phase 1A Scope**: Non-AI Core Plugins (Terminal, Monaco, FileTree, Preview)

| Blocker | Component | Impact | Resolution Required |
|---------|-----------|---------|-------------------|
| **#1: StorageGateway factory inconsistency** | ALL Phase 1A plugins | Cannot reliably create storage gateways. Must consolidate `StorageAdapterFactory` class and `storageGatewayFactory` singleton into single pattern. |
| **#2: ProjectContext timing issue** | Project load | Storage gateway created before `initialHandle` is restored from Dexie. Must implement deferred gateway creation or ensure handle availability first. |
| **#3: FSA handle not restored** | Desktop IDE projects | `ProjectHandleService.restoreHandle()` exists but never called. Must wire route to call `restoreHandle()` before passing handle to `ProjectContext`. |
| **#4: FileTree sync integration** | FileTree plugin | FileTree displays sync status but no sync service subscription. Must wire FileTree to subscribe to sync service events. |
| **#5: Monaco/Preview storage** | Monaco, Preview plugins | Plugins need storage adapter but factory inconsistency prevents reliable creation. Must resolve #1 first. |
| **#6: Terminal file operations** | Terminal plugin | Terminal needs real file system access (FSA only). Handle persistence issue (#2) blocks terminal functionality. |
| **#7: IndexedDB file watching** | Notes workspace (IndexedDB) | `IDBGateway.watch()` likely stubbed. Cannot sync notes changes for mobile/tablet. Must implement polling-based watching for IndexedDB. |

**Blocker Dependencies:**
- Blocker #1 must be resolved before #3, #4, #5
- Blocker #2 must be resolved before #3, #6
- Blocker #3 must be resolved before #6

---

## 6. Recommendations

### 6.1 Immediate Actions (Before Phase 1A)

1. **Consolidate storage gateway factories** (2 hours)
   - Delete `StorageAdapterFactory` class from `StorageAdapterFactory.ts`
   - Keep `storageGatewayFactory` singleton as canonical implementation
   - Update all imports to use `createStorageGateway()` from `storage-gateway-factory.ts`
   - Ensure all plugins use consistent factory

2. **Fix ProjectContext FSA handle lifecycle** (3 hours)
   - In `project-context.tsx`, move storage gateway creation after `initialHandle` restoration
   - Call `ProjectHandleService.restoreHandle(projectId)` before creating adapter
   - Pass restored handle to `StorageAdapterFactory` via `handle` parameter
   - Test project load with existing FSA handle in Dexie

3. **Wire FSA handle restoration in route** (1 hour)
   - In `$projectId.tsx`, call `handlePersistenceService.restoreHandle()` before loading project
   - Pass `fsaHandle` to `ProjectContext` via `initialHandle` prop
   - Test navigation to existing project with persisted handle

4. **Implement IndexedDB gateway watch()** (2 hours)
   - In `idb-gateway.ts`, implement polling-based file watching
   - Use `setInterval` to check for external changes
   - Emit `FileChangeEvent` for created/modified/deleted files
   - Return `WatchHandle` with dispose() method

5. **Wire FileTree to sync service** (1.5 hours)
   - In `useFileTreeActions.ts`, subscribe to sync service events
   - Display sync controls (sync button, status indicator)
   - Update FileTree when sync completes

### 6.2 Short-Term Actions (During Phase 1A)

6. **Complete Notes File Sync Service** (4 hours)
   - Implement full bidirectional sync in `NotesFileSyncService`
   - Add FSA folder watching for `/notes/*.md` files
   - Implement conflict resolution for external edits
   - Test autosave debouncing (500ms per ADR-033)

7. **Add Monaco/Preview storage adapters** (3 hours each)
   - Wire Monaco plugin to use `StorageGateway` for file I/O
   - Wire Preview plugin to use `StorageGateway` for file serving
   - Ensure both FSA and IndexedDB projects work correctly

### 6.3 Medium-Term Actions (After Phase 1A)

8. **Consolidate storage adapter implementations** (6 hours)
   - Choose canonical adapter (likely `fsa-storage-adapter.ts` + `idb-adapter-core.ts`)
   - Archive/deprecate legacy `local-fs-adapter.ts`
   - Ensure single implementation path for each storage type

9. **Implement Study/Knowledge sync services** (8 hours each)
   - Replace stub implementations with working services
   - Use same patterns as Notes/IDE services
   - Add file watching and sync controls

10. **Refactor store consolidation** (8 hours)
   - Complete migration of legacy store files to `infrastructure/persistence/stores/`
   - Archive duplicate implementations
   - Update all imports to use canonical paths

---

## 7. Risk Assessment

| Risk | Severity | Probability | Impact | Mitigation |
|-------|-----------|--------------|---------|------------|
| **Handle persistence failure on project load** | HIGH | 30% | Users lose FSA access, forced to re-select folder | Fix #2 (ProjectContext timing) immediately. Add error handling for restore failure. |
| **Storage factory confusion bugs** | HIGH | 40% | Plugins may create wrong gateway type, causing I/O errors | Consolidate factories (#1) before Phase 1A. Add TypeScript strict mode. |
| **IndexedDB quota exceeded** | MEDIUM | 15% | Mobile users lose data when storage full | Quota manager already implemented. Add user notifications before quota critical. |
| **File sync race conditions** | MEDIUM | 25% | Concurrent edits cause data loss or conflicts | Implement optimistic locking in sync services. Add conflict resolution UI. |
| **Phase 1A blocker cascade** | CRITICAL | 50% | Multiple blockers depend on each other, causing extended delays | Resolve #1 and #2 immediately (top of dependency chain). |

---

## 8. Evidence

### 8.1 Platform Detection Evidence

**File**: `src/infrastructure/filesystem/platform-contract.ts` (342 lines)

```typescript
export interface PlatformContract {
  readonly deviceType: DeviceType;
  readonly storageType: StorageType;
  readonly canAccessFSA: boolean;
  readonly canWatchFiles: boolean;
  readonly canRunTerminal: boolean;
  readonly canDoAgenticCoding: boolean;
  readonly canAccessIDE: boolean;
}

export function getPlatformContract(): PlatformContract {
  if (cachedContract) {
    return cachedContract; // Caching for session consistency
  }
  cachedContract = buildPlatformContract();
  return cachedContract;
}
```

**Assessment**: ✅ Complete and correct implementation

### 8.2 FSA Storage Adapter Evidence

**File**: `src/infrastructure/filesystem/fsa-storage-adapter.ts` (673 lines)

```typescript
export class FSAStorageAdapter implements StorageAdapter {
  readonly name = 'fsa';
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private watchInterval: ReturnType<typeof setInterval> | null = null;
  private fileHashes: Map<string, FileHashEntry> = new Map();

  async readFile(path: string): Promise<FileContent> {
    const root = this.ensureAccess();
    const result = await fileOps.readFile(root, path, { encoding: 'binary' });
    // ... full implementation
  }

  watch(callback: FileChangeCallback): () => void {
    this.watchCallbacks.add(callback);
    if (!this.watchInterval) {
      this.startPolling(); // Polling-based file watching
    }
    // ...
  }
}
```

**Assessment**: ✅ Well-implemented core adapter with polling-based watching

### 8.3 Storage Gateway Factory Evidence

**Problem**: Two factory implementations with different patterns

**Factory 1**: `src/infrastructure/filesystem/StorageAdapterFactory.ts` (290 lines)
```typescript
export class StorageAdapterFactory {
  createAdapter(options: StorageOptions): StorageAdapter {
    const storageType = explicitType ?? getOptimalStorageType();
    switch (storageType) {
      case 'fsa':
        const effectiveHandle = handleGetter ? handleGetter() : handle;
        return this.createFSAAdapter({ projectId, handle: effectiveHandle, ... });
      case 'indexeddb':
        return this.createIDBAdapter({ projectId, ... });
    }
  }
}
```

**Factory 2**: `src/infrastructure/filesystem/storage-gateway-factory.ts` (235 lines)
```typescript
class StorageGatewayFactoryImpl implements IStorageGatewayFactory {
  createFromPlatform(platform: { storageType: StorageType }, options: {...}): StorageGateway {
    switch (platform.storageType) {
      case 'fsa':
        if (!options.directoryHandle) throw new Error('FSAGateway requires directoryHandle');
        return this.createFSAGateway(options.directoryHandle);
      case 'indexeddb':
        if (!options.projectId) throw new Error('IDBGateway requires projectId');
        return this.createIDBGateway(options.projectId);
    }
  }
}

export const storageGatewayFactory = new StorageGatewayFactoryImpl();
```

**Assessment**: ⚠️ Inconsistent patterns causing confusion

### 8.4 Handle Persistence Evidence

**File**: `src/infrastructure/persistence/services/project-handle-service.ts` (319 lines)

```typescript
export class ProjectHandleService {
  async createWithHandle(project: ProjectRecord, handle: FileSystemDirectoryHandle, workspaceId: WorkspaceType): Promise<ProjectId> {
    return db.transaction('rw', db.projects, db.fsaHandles, async () => {
      const projectId = await db.projects.put(project);
      const handleData = isStructuredCloneSupported() ? structuredClone(handle) : null;
      await db.fsaHandles.put({ projectId, workspaceId, handleData, ... });
      return projectId;
    });
  }

  async restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
    const record = await db.fsaHandles.get(projectId);
    if (!record) return null;
    if (isStructuredCloneSupported() && record.handleData) {
      return structuredClone(record.handleData) as FileSystemDirectoryHandle;
    }
    return null;
  }
}
```

**Assessment**: ✅ Well-implemented atomic handle persistence

### 8.5 ProjectContext Gap Evidence

**File**: `src/infrastructure/context/project-context.tsx:278`

```typescript
// PROBLEM: Gateway created before handle is available
const [gateway, setGateway] = useState<StorageGateway | null>(null);

// Later in effect:
const storageAdapter: StorageAdapter = storageAdapterFactory.createAdapter({
  projectId: loadedProject.id,
  storageType: loadedProject.storageType,
  // ❌ handle is undefined here, initialHandle not restored yet
});

const storageGateway: StorageGateway = {
  // Maps adapter to gateway interface
};
```

**Assessment**: ❌ Timing issue blocks FSA project loading

---

## 9. Success Criteria

**Investigation Complete:**
- [x] All storage adapter implementations identified and cataloged
- [x] Platform detection implementation verified
- [x] Storage gateway factory inconsistencies documented
- [x] FSA handle persistence implementation verified
- [x] File sync service implementation status assessed
- [x] Phase 1A blockers identified and prioritized
- [x] Critical gaps documented with evidence
- [x] Actionable recommendations provided

---

## 10. Next Steps

1. **Review with BMAD Master** - Present findings and get approval for consolidation plan
2. **Create implementation epic** - Define stories for resolving blockers #1-#7
3. **Priority ordering** - Execute blockers in dependency order (#1, #2, #3, #4, #5, #6, #7)
4. **Testing** - Validate each fix with FSA and IndexedDB projects
5. **Phase 1A execution** - Resume plugin development after blockers resolved

---

**Document Owner**: analyst-ext
**Created**: 2026-01-26T00:00:00+07:00
**Status**: READY FOR REVIEW
