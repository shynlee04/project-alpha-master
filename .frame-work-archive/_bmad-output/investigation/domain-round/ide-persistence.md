---
investigation_id: "IDE-PERSISTENCE-INVESTIGATION"
created: "2026-01-20T20:00:00+07:00"
scope:
  - "IDE space persistence layer investigation"
  - "Storage gateway implementations (FSA, IDB)"
  - "State persistence with Zustand"
  - "File operations and watching"
  - "Sync strategy and conflict resolution"
  - "WebContainer integration"
  - "Handle persistence for FSA"
---

# IDE Persistence Layer Investigation Report

## Executive Summary

This investigation covers the complete IDE space persistence layer for Project Alpha, examining storage architecture, file operations, state persistence, sync strategies, and WebContainer integration. The IDE space has a well-structured persistence layer with proper abstraction through the `StorageGateway` interface, but contains several issues including duplicate implementations, missing adapters, and cross-layer violations.

---

## Part 1: Persistence Layer Architecture

### 1.1 Storage Gateway Interface

**Location**: `src/domain/interfaces/storage-gateway.interface.ts` (246 lines)

The StorageGateway interface defines the abstraction layer for file I/O operations:

| Method | Purpose | Lines |
|--------|---------|-------|
| `read(path)` | Read file as Uint8Array | 134 |
| `write(path, data)` | Write file content | 143 |
| `delete(path)` | Delete file/directory | 151 |
| `list(path)` | List directory contents | 160 |
| `exists(path)` | Check file existence | 168 |
| `watch(callback)` | Watch for file changes | 180 |
| `rename(old, new)` | Rename file/directory | 197 |
| `createDirectory(path)` | Create directory | 210 |

**Issues Identified**:
- ✅ Interface is well-designed with clear contracts
- ⚠️ Factory interface exists but implementation is in separate file

### 1.2 FSA Gateway Implementation

**Location**: `src/infrastructure/filesystem/fsa-gateway.ts` (~711 lines)

The FSAGateway implements StorageGateway using the File System Access API:

| Feature | Implementation | Details |
|---------|----------------|---------|
| File Reading | `readFile()` | Binary/text support via `fileOps.readFile` |
| File Writing | `write()` | Text via string, binary via Blob |
| Directory Operations | `dirOps` module | `createDirectory()`, `rename()` |
| File Watching | FileSystemObserver (129+) or polling fallback | Lines 62-67, 410-465 |

**File Watching Implementation**:
- **Chrome 129+**: Uses native `FileSystemObserver` API (experimental)
- **Fallback**: Polling every 2 seconds with 300ms debounce
- **Hash-based change detection**: Stores file hashes for modification detection

**Issues Identified**:
- ⚠️ FileSystemObserver is experimental with `@ts-ignore` (line 66)
- ⚠️ Polling interval hardcoded at 2000ms (line 114)
- ⚠️ Large file size (~711 lines) - approaching god class threshold

### 1.3 IDB Gateway Implementation

**Location**: `src/infrastructure/filesystem/idb-gateway.ts` (544 lines)

The IDBGateway implements StorageGateway using IndexedDB via Dexie:

| Feature | Implementation | Details |
|---------|----------------|---------|
| File Storage | `idbFiles` table | Compound key: `[projectId, path]` |
| File Reading | `read()` | Retrieves from Dexie |
| File Writing | `write()` | Stores Uint8Array in IDB |
| File Watching | Polling only | No native support in IDB |

**Dexie Schema for Files**:
```
idbFiles: '[projectId+path], projectId, lastModified'
```

**Issues Identified**:
- ⚠️ Polling-based watching only (no native IDB change events)
- ⚠️ Similar implementation pattern to FSA gateway - potential for abstraction
- ✅ Proper error handling with FileSystemError

### 1.4 Storage Gateway Factory

**Location**: `src/infrastructure/filesystem/storage-gateway-factory.ts` (235 lines)

Factory implementation that creates appropriate gateway based on storage type:

```typescript
class StorageGatewayFactoryImpl implements IStorageGatewayFactory {
  createFSAGateway(directoryHandle): StorageGateway
  createIDBGateway(projectId): StorageGateway
  createFromPlatform(platform, options): StorageGateway
}
```

**Issues Identified**:
- ✅ Clean factory pattern implementation
- ⚠️ Generic `create()` method is deprecated (throws error at line 65)
- ✅ Singleton export for convenience

### 1.5 FSA Storage Adapter (Duplicate)

**Location**: `src/infrastructure/filesystem/fsa-storage-adapter.ts` (673 lines)

**⚠️ CRITICAL**: This is a DUPLICATE implementation with overlapping functionality:

| Aspect | FSAStorageAdapter | FSAGateway |
|--------|-------------------|------------|
| Lines | 673 | ~711 |
| Watch | Polling (2000ms) | FileSystemObserver + polling |
| Interface | `StorageAdapter` | `StorageGateway` |
| Factory | `createFSAStorageAdapter()` | `createFSAGateway()` |

**Evidence of Duplicate**:
- Both implement read/write/list/delete/watch
- Both use `fileOps` module for core operations
- Both have similar error handling patterns
- Line 21 in fsa-storage-adapter.ts imports from `storage-adapter.interface`

**Recommendation**: Consolidate to single `FSAGateway` implementation.

---

## Part 2: Handle Persistence (FSA Desktop)

### 2.1 Handle Persistence Service

**Location**: `src/infrastructure/filesystem/handle-persistence.ts` (599 lines)

Manages FileSystemDirectoryHandle lifecycle without DataCloneError:

| Feature | Chrome 129+ | Chrome 122-128 | Pre-122 |
|---------|-------------|----------------|---------|
| Store Handle | structuredClone() | Metadata only | Metadata only |
| Silent Restore | From stored handle | By handle ID | Not supported |
| Permission | Verify after restore | Persistent permission | Prompt each time |

**Key Methods**:
- `persistHandle(projectId, handle, workspaceId)` - Lines 182-211
- `restoreHandle(projectId)` - Lines 219-288
- `trySilentRestore()` - Lines 304-419
- `promptUserForHandle()` - Lines 434-531

**Chrome Version Detection**:
```typescript
// Line 53-61
export function isStructuredCloneSupported(): boolean {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = match ? parseInt(match[1], 10) : 0;
  return chromeVersion >= 129;
}
```

**Issues Identified**:
- ✅ Sophisticated Chrome version-aware handle storage
- ✅ Graceful degradation strategy
- ⚠️ `queryPermission` check at line 331 uses type assertion for non-standard API

### 2.2 Dexie Helpers for Handle Storage

**Location**: `src/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers.ts`

Stores FSA handle metadata in Dexie `fsaHandles` table:

| Field | Type | Purpose |
|-------|------|---------|
| `projectId` | string | Primary key |
| `handleData` | FileSystemDirectoryHandle \| null | Chrome 129+ structured clone |
| `directoryPath` | string | Directory name for restoration |
| `permissionStatus` | 'granted' \| 'denied' \| 'prompt' \| 'dismissed' | PS-04 |
| `grantedAt` | number | Timestamp |
| `lastAccessedAt` | number | For cleanup decisions |

**Issues Identified**:
- ✅ Proper permission state tracking including 'dismissed' state
- ✅ Handle data stored separately from metadata
- ⚠️ No automatic cleanup of stale handles

---

## Part 3: State Persistence (Zustand)

### 3.1 Dexie Storage Adapter

**Location**: `src/infrastructure/persistence/dexie-storage.ts` (237 lines)

Implements Zustand's `StateStorage` interface using Dexie:

**Quota Management**:
```typescript
const QUOTA_THRESHOLD = 0.9;  // Line 27

async function getStorageQuota() { /* Lines 33-46 */ }
async function isStorageNearQuota() { /* Lines 52-57 */ }
async function evictOldestEntries() { /* Lines 64-95 */ }
```

**Storage Adapter Creation**:
```typescript
export function createDexieStorage(tableName: keyof typeof db) {
  return {
    getItem: async (name) => { /* Lines 140-151 */ },
    setItem: async (name, value) => { /* Lines 154-221 */ },
    removeItem: async (name) => { /* Lines 224-234 */ }
  };
}
```

**Issues Identified**:
- ✅ Proactive quota management (cleanup before write)
- ✅ Reactive QuotaExceededError handling with retry
- ⚠️ Uses `JSON.parse(value)` for state (line 165) - could be optimized

### 3.2 IDE State Storage (Custom Adapter)

**Location**: `src/infrastructure/persistence/stores/ide/ide-state-storage.ts` (270 lines)

**STATE-002 Fix**: Custom adapter for IDE workspace state:

| Feature | Implementation | Lines |
|---------|----------------|-------|
| Project Scoping | sessionStorage for projectId | 60-87 |
| State Storage | Custom `createIDEStateStorage()` | 96-263 |
| Store Reference | Module-level `getIDEStoreState` | 52-54 |

**Hydration Flow**:
1. Check sessionStorage for `viagent_current_ide_project` (line 63)
2. Query `ideState` table by projectId (line 139)
3. Return null if no projectId (STATE-002 fix, line 135)

**Dexie Schema for IDE State**:
```typescript
ideState: 'projectId, updatedAt'  // Primary key: projectId
```

**Persisted Fields**:
- `openFiles[]`
- `activeFile`
- `expandedPaths[]`
- `panelLayouts`
- `terminalTab`
- `chatVisible`
- `activeFileScrollTop`

**Issues Identified**:
- ✅ STATE-002 fix properly implemented (no cross-project contamination)
- ⚠️ sessionStorage dependency may fail in private mode
- ⚠️ Custom adapter needed due to non-standard schema

### 3.3 State Persistence Usage Summary

**Stores Using Dexie Storage**:

| Store | Table | Location |
|-------|-------|----------|
| `useAppStore` | `providerConfigs` | Line 109 |
| `useIDEStore` | `ideState` (custom) | Line 76 |
| `unifiedChatStore` | `conversationState` | Line 91 |
| `terminalStore` | `terminalState` | Line 313 |
| `ragStore` | `ragState` | Line 53 |
| `agentSelectionStore` | `agentConfigs` | Line 34 |
| `toolPermissionStore` | `agentConfigs` | Line 63 |
| `workspaceStore` | `providerConfigs` | Line 178 |

**Stores Using localStorage**:

| Store | Purpose | Location |
|-------|---------|----------|
| `analyticsStore` | User preferences | Line 115 |
| `pluginsStore` | Plugin settings | Line 260 |
| `fileWatcherStore` | Watch preferences | Line 227 |
| `chatSettingsStore` | UI settings | Line 140 |
| `navigationStore` | Nav state | Line 133 |
| `editorTabs/index` | Tab state | Line 58 |

**Issues Identified**:
- ⚠️ Inconsistent storage choice (Dexie vs localStorage)
- ⚠️ No clear pattern for when to use which
- ⚠️ Some stores may exceed localStorage quota (5MB)

---

## Part 4: File Operations

### 4.1 Core File Operations

**Location**: `src/infrastructure/filesystem/file-ops.ts`

| Function | Purpose | Lines |
|----------|---------|-------|
| `readFile()` | Read file with encoding option | 24-64 |
| `writeFile()` | Write text content | 69-94 |
| `deleteFile()` | Delete with error handling | 99-168 |

### 4.2 Directory Operations

**Location**: `src/infrastructure/filesystem/dir-ops.ts`

| Function | Purpose | Lines |
|----------|---------|-------|
| `createDirectory()` | Create nested directories | 60-77 |
| `rename()` | Rename file/directory | 120-184 |

### 4.3 File Watching

**Implementation Locations**:
1. `FSAGateway.watch()` - Lines 382-400 (fsa-gateway.ts)
2. `FSAStorageAdapter.watch()` - Lines 396-411 (fsa-storage-adapter.ts)
3. `IDBGateway.watch()` - Lines 355-372 (idb-gateway.ts)

**Watching Strategy**:
```typescript
// FSAGateway - FileSystemObserver with polling fallback
if (isFileSystemObserverSupported()) {
  this.watchObserver = new FileSystemObserver(async (records) => {
    // Handle changes
  });
} else {
  // Fallback to polling
  this.watchInterval = setInterval(async () => {
    await this.checkForChanges();
  }, 2000);
}
```

**Change Detection**:
- Hash-based (SHA-256 or simple fallback)
- Size + lastModified quick check
- Debounced emission (300ms)

**Issues Identified**:
- ⚠️ Polling interval fixed at 2000ms (not configurable)
- ⚠️ No optimization for large directories
- ⚠️ FileSystemObserver is experimental (Chrome 129+ only)
- ⚠️ Duplicate implementations in FSAStorageAdapter and FSAGateway

---

## Part 5: Sync Strategy

### 5.1 Sync Engine

**Location**: `src/infrastructure/sync/core/sync-engine-core.ts` (~171 lines)

The `SyncEngine` class orchestrates synchronization between storage adapters:

```typescript
class SyncEngine {
  sync(options?: SyncOptions): Promise<SyncResult>
  resolveConflict(path: string, strategy: ConflictStrategy): Promise<void>
  watch(callback?: FileChangeCallback): () => void
}
```

**Default Options**:
```typescript
{
  direction: 'bidirectional',
  conflictStrategy: 'last-write-wins',
  batchSize: 50,
  debounceMs: 300,
  maxConcurrent: 5
}
```

### 5.2 Bidirectional Sync

**Location**: `src/infrastructure/sync/strategies/bidirectional-sync.ts` (barrel export)

Core sync implementation with:
- `BidirectionalSync` class
- `generateOperations()` - Plan sync operations
- `executeOperation()` - Execute sync actions

### 5.3 Conflict Resolution

**Location**: `src/infrastructure/sync/strategies/conflict-resolution.ts`

**Conflict Strategies**:
| Strategy | Behavior |
|----------|----------|
| `last-write-wins` | Most recent modification wins |
| `keep-local` | Prefer local (FSA) changes |
| `keep-remote` | Prefer remote (IDB) changes |
| `manual` | Require user intervention |

**Issues Identified**:
- ⚠️ Conflict resolution UI not fully implemented
- ⚠️ No visual conflict resolution dialog mentioned
- ⚠️ Manual strategy leaves conflicts unresolved

---

## Part 6: WebContainer Integration

### 6.1 WebContainer FSA Adapter

**Location**: `src/infrastructure/webcontainer/fsa-adapter.ts` (~480 lines)

Bridges FSA file system with WebContainer virtual file system:

| Feature | Implementation | Lines |
|---------|----------------|-------|
| Mount | `mountToContainer()` | 114-147 |
| Bidirectional Sync | `startBidirectionalSync()` | 150+ |
| FSA → WC Sync | `syncFSAToWC()` | 310-330 |
| WC → FSA Sync | `syncWCToFSA()` | 385-410 |
| Conflict Detection | `detectConflict()` | 441-475 |
| Conflict Resolution | `resolveConflict()` | 488-510 |

**Configuration**:
```typescript
interface WebContainerFSAAdapterOptions {
  fsaGateway: StorageGateway;
  container: WebContainer;
  eventBus?: WorkspaceEventEmitter;
  mountPoint?: string;
  conflictResolution?: 'fsa-wins' | 'wc-wins' | 'manual';
}
```

**Issues Identified**:
- ⚠️ Large class (~480 lines) - splitting recommended
- ✅ HMR event forwarding implemented
- ✅ Proper conflict resolution strategies

---

## Part 7: File Inventory

### IDE Persistence Inventory

#### Storage Gateways
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `domain/interfaces/storage-gateway.interface.ts` | Interface definition | 246 | ✅ Complete |
| `infrastructure/filesystem/fsa-gateway.ts` | FSA implementation | ~711 | ✅ Complete |
| `infrastructure/filesystem/idb-gateway.ts` | IDB implementation | 544 | ✅ Complete |
| `infrastructure/filesystem/storage-gateway-factory.ts` | Factory pattern | 235 | ✅ Complete |
| `infrastructure/filesystem/fsa-storage-adapter.ts` | **DUPLICATE FSA** | 673 | ⚠️ Remove |
| `domain/interfaces/storage-adapter.interface.ts` | Legacy interface | - | ⚠️ Deprecated |

#### State Persistence
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `infrastructure/persistence/dexie-storage.ts` | Dexie adapter | 237 | ✅ Complete |
| `infrastructure/persistence/stores/ide/ide-state-storage.ts` | IDE state adapter | 270 | ✅ Complete |
| `infrastructure/persistence/dexie-db.ts` | Dexie database | - | ✅ Complete |
| `infrastructure/persistence/dexie-db-class.ts` | DB class | - | ✅ Complete |

#### Handle Persistence
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `infrastructure/filesystem/handle-persistence.ts` | Handle lifecycle | 599 | ✅ Complete |
| `infrastructure/filesystem/platform-contract.ts` | Platform detection | - | ✅ Complete |

#### File Operations
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `infrastructure/filesystem/file-ops.ts` | Core file I/O | - | ✅ Complete |
| `infrastructure/filesystem/dir-ops.ts` | Directory ops | - | ✅ Complete |
| `infrastructure/filesystem/markdown-sync-service.ts` | Markdown sync | - | ✅ Complete |

#### Sync Services
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `infrastructure/sync/core/sync-engine.ts` | Sync orchestration | 57 | ✅ Complete |
| `infrastructure/sync/core/sync-engine-core.ts` | Engine impl | ~171 | ✅ Complete |
| `infrastructure/sync/strategies/bidirectional-sync.ts` | Bidirectional sync | 62 | ✅ Complete |
| `infrastructure/sync/strategies/conflict-resolution.ts` | Conflict handling | - | ✅ Complete |

#### WebContainer
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `infrastructure/webcontainer/fsa-adapter.ts` | WC integration | ~480 | ⚠️ Large |
| `infrastructure/filesystem/terminal-fs-adapter.ts` | Terminal adapter | - | ✅ Complete |

---

## Part 8: Issues Summary

### Critical (P0) - Must Fix

| # | File | Issue | Lines | Evidence |
|---|------|-------|-------|----------|
| 1 | `fsa-storage-adapter.ts` | Duplicate of FSAGateway | 673 | Same interface, same operations |
| 2 | `domain/interfaces/storage-adapter.interface.ts` | Legacy interface | - | Not used by canonical implementation |
| 3 | `infrastructure/filesystem/` | Cross-layer import violations | 22, 33, 20 | Imports from `@/lib/filesystem/*` |

### High Priority (P1)

| # | File | Issue | Lines | Evidence |
|---|------|-------|-------|----------|
| 4 | `fsa-gateway.ts` | Large class (711 lines) | 711 | Approaches god class threshold |
| 5 | `webcontainer/fsa-adapter.ts` | Large class (480 lines) | 480 | Consider splitting |
| 6 | `dexie-storage.ts` | localStorage fallback | 165 | `JSON.parse(value)` could be optimized |
| 7 | Multiple stores | Inconsistent storage choice | - | Some Dexie, some localStorage |

### Medium Priority (P2)

| # | File | Issue | Lines | Evidence |
|---|------|-------|-------|----------|
| 8 | `fsa-gateway.ts` | Hardcoded polling (2000ms) | 114 | Not configurable |
| 9 | `fsa-gateway.ts` | Experimental API usage | 66 | @ts-ignore for FileSystemObserver |
| 10 | `handle-persistence.ts` | No stale handle cleanup | 599 | Only manual via `clearAll()` |
| 11 | Sync engine | No conflict resolution UI | - | Manual strategy not implemented |

### Low Priority (P3)

| # | File | Issue | Lines | Evidence |
|---|------|-------|-------|----------|
| 12 | Various | TODO comments | 80+ | Across codebase |
| 13 | IDE state storage | sessionStorage dependency | 75 | May fail in private mode |

---

## Part 9: Recommendations

### Immediate (P0)

1. **Remove Duplicate FSA Storage Adapter**
   - Delete `src/infrastructure/filesystem/fsa-storage-adapter.ts`
   - Update consumers to use `FSAGateway`
   - Verify no breaking changes

2. **Remove Legacy Interface**
   - Archive `storage-adapter.interface.ts`
   - Update any remaining consumers

3. **Fix Infrastructure Imports**
   - Update workspace slices to import from canonical paths
   - Remove `@/lib/filesystem/*` imports

### Short-term (P1)

4. **Split Large Classes**
   - Extract file watching from `FSAGateway` to separate module
   - Split `WebContainerFSAAdapter` into mount/sync/watch modules

5. **Standardize State Storage**
   - Create migration plan for localStorage → Dexie
   - Document when to use which storage

6. **Add Polling Configuration**
   - Make polling interval configurable via options
   - Allow disabling polling when FileSystemObserver available

### Medium-term (P2)

7. **Implement Conflict Resolution UI**
   - Create modal dialog for manual conflict resolution
   - Show diff of local vs remote changes
   - Allow merge decisions

8. **Add Handle Cleanup**
   - Automatic cleanup of handles not accessed in N days
   - Show handle status in project settings

9. **Optimize State Storage**
   - Store state as-is without JSON.parse
   - Add compression for large states

### Long-term (P3)

10. **File Watching Optimization**
    - Implement directory change detection
    - Add watch depth configuration
    - Support FileSystemObserver universally

---

## Part 10: Evidence References

### Files Analyzed

| Category | Count |
|----------|-------|
| Storage Gateways | 6 |
| State Persistence | 4 |
| Handle Persistence | 2 |
| File Operations | 3 |
| Sync Services | 4 |
| WebContainer | 2 |
| **Total** | **21+** |

### Investigation Methods

- **grep**: Pattern matching for imports, exports, function definitions
- **glob**: File discovery by pattern
- **read with offset**: Deep investigation of specific code sections
- **Symbol analysis**: TypeScript type hierarchy analysis

---

*Report generated: 2026-01-20*
*Investigation ID: IDE-PERSISTENCE-INVESTIGATION*
