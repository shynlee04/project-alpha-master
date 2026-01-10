# Implementation Plan: ARCH-01.1 - Unified Sync Manager (CRITICAL CORRECTION)

**Epic**: ARCH-01 (Foundation Architecture Refactoring)
**Story**: ARCH-01.1 (Unified Sync Manager)
**Status**: ⚠️ CRITICAL - GOD FILES CREATED - REFACTORING REQUIRED
**Estimated Effort**: 48-64 hours
**Team**: Team A
**Date**: 2026-01-04

---

## 🚨 CRITICAL ISSUE IDENTIFIED

**VIOLATION**: I created files that exceed the 300-line limit from sweeping-validation.md

| File | Lines | Violation | Action Required |
|------|-------|------------|-----------------|
| idb-adapter.ts | 787 | 2.6x over limit | Split into 5 modules (~160 each) |
| sync-types.ts | 612 | 2.0x over limit | Split into 4 modules (~150 each) |
| fsa-adapter.ts | 560 | 1.9x over limit | Split into 3 modules (~190 each) |
| bidirectional-sync.ts | 509 | 1.7x over limit | Split into 3 modules (~170 each) |
| sync-events.ts | 486 | 1.6x over limit | Split into 3 modules (~160 each) |
| sync-engine.ts | 415 | 1.4x over limit | Split into 2 modules (~210 each) |
| base-adapter.ts | 373 | 1.2x over limit | Split into 2 modules (~190 each) |
| conflict-resolution.ts | 368 | 1.2x over limit | Split into 2 modules (~185 each) |

**Root Cause**: I focused on functionality without respecting the 300-line architectural constraint.

**Corrective Action**: Split all files into <300-line modules before proceeding.

---

## God File Splitting Strategy

### File 1: idb-adapter.ts (787 lines → 5 modules)

```
src/infrastructure/sync/adapters/
├── idb-adapter-core.ts        (~160 lines) - Class, constructor, initialize, close
├── idb-crud-operations.ts      (~150 lines) - readFile, writeFile, deleteFile, listFiles, getMetadata, exists
├── idb-quota-manager.ts       (~140 lines) - checkQuota, evictIfNeeded, quota types
├── idb-eviction-policies.ts   (~160 lines) - evictByPolicy, sortForEviction, bulkDelete
└── idb-helpers.ts             (~150 lines) - openDatabase, getFileRecord, putRecord, base64 conversion, globToRegex
```

**Key Split Points**:
- Core: Class definition, constructor, state management
- CRUD: All StorageAdapter interface implementations
- Quota: P0-critical quota checking and eviction orchestration
- Eviction: Policy-specific sorting and deletion logic
- Helpers: Low-level IndexedDB operations and utilities

---

### File 2: sync-types.ts (612 lines → 4 modules)

```
src/infrastructure/sync/core/
├── sync-core-types.ts      (~140 lines) - WorkspaceType, SyncDirection, ConflictStrategy, SyncStatusType
├── file-types.ts           (~120 lines) - FileMetadata, FileContent, FileChangeEvent
├── sync-result-types.ts    (~180 lines) - SyncOptions, SyncResult, FailedFile, FileConflict, ConflictResolution
└── event-types.ts          (~150 lines) - SyncEvent, SyncEventType, SyncEventData (all 9 event data types)
```

**Key Split Points**:
- Core: Basic enums and type aliases
- File: File metadata and content types
- Result: Sync operation result types
- Events: All event-related types and data interfaces

---

### File 3: fsa-adapter.ts (560 lines → 3 modules)

```
src/infrastructure/sync/adapters/
├── fsa-adapter-core.ts         (~190 lines) - Class, constructor, mount, requestAccess, isSupported
├── fsa-permission-manager.ts   (~180 lines) - checkPermission, ensurePermission, isPermissionDenied
└── fsa-file-operations.ts      (~170 lines) - readFile, writeFile, deleteFile, listFiles, getMetadata, exists, watch
```

**Key Split Points**:
- Core: Adapter initialization and lifecycle
- Permission: Permission state management and checking
- Operations: StorageAdapter interface implementations

---

### File 4: bidirectional-sync.ts (509 lines → 3 modules)

```
src/infrastructure/sync/strategies/
├── bidirectional-sync-core.ts    (~170 lines) - Class, constructor, sync orchestration, listAllFiles
├── file-comparison.ts             (~160 lines) - compareFiles, FileComparison, FileChangeStatus
└── operation-generator.ts          (~170 lines) - generateOperations, executeOperation, resolveConflict, upload/download
```

**Key Split Points**:
- Core: Main sync orchestration and file listing
- Comparison: File comparison logic and status detection
- Operations: Operation generation and execution

---

### File 5: sync-events.ts (486 lines → 3 modules)

```
src/infrastructure/sync/core/
├── sync-event-bus.ts        (~150 lines) - SyncEventBus class, emit, on, onAll, wildcard handling
├── event-emitters.ts        (~120 lines) - All emit* convenience functions (9 functions)
└── file-watcher.ts          (~150 lines) - FileWatcher class, watchFile, unwatchAll
```

**Key Split Points**:
- Bus: Core event emission and subscription infrastructure
- Emitters: Convenience functions for emitting specific events
- Watcher: File change detection and watching

---

### File 6: sync-engine.ts (415 lines → 2 modules)

```
src/infrastructure/sync/core/
├── sync-engine.ts           (~210 lines) - Main SyncEngine class, sync, resolveConflict, watch, public methods
└── sync-engine-state.ts     (~190 lines) - SyncEngineState, subscribeToEvents, private helpers, factory
```

**Key Split Points**:
- Main: Public API and sync orchestration
- State: Internal state tracking and event subscriptions

---

### File 7: base-adapter.ts (373 lines → 2 modules)

```
src/infrastructure/sync/adapters/
├── base-adapter.ts         (~200 lines) - BaseStorageAdapter abstract class, utility methods
└── adapter-errors.ts        (~160 lines) - AdapterError, FileNotFoundError, PermissionDeniedError, QuotaExceededError, AdapterNotReadyError, type guards
```

**Key Split Points**:
- Base: Abstract class with common functionality
- Errors: All error classes and type guard functions

---

### File 8: conflict-resolution.ts (368 lines → 2 modules)

```
src/infrastructure/sync/strategies/
├── conflict-resolver.ts     (~190 lines) - ConflictResolver class, resolve methods, createChecksum, contentsEqual
└── conflict-detection.ts    (~170 lines) - ConflictDetectionConfig, UserPromptResult, detectConflicts utility, factory
```

**Key Split Points**:
- Resolver: Core conflict resolution logic
- Detection: Conflict detection utilities and types

---

## Splitting Execution Order

To minimize import chain disruption, split in this order:

1. **sync-types.ts** (No dependencies on other sync files)
2. **base-adapter.ts** → **adapter-errors.ts** (Only depends on sync-types)
3. **sync-events.ts** → **sync-event-bus.ts** + **event-emitters.ts** + **file-watcher.ts** (Depends on sync-types)
4. **idb-adapter.ts** → 5 modules (Depends on sync-types, sync-events, base-adapter)
5. **fsa-adapter.ts** → 3 modules (Depends on sync-types, base-adapter)
6. **conflict-resolution.ts** → 2 modules (Depends on sync-types)
7. **bidirectional-sync.ts** → 3 modules (Depends on sync-types, sync-events, conflict-resolution)
8. **sync-engine.ts** → 2 modules (Depends on all others)

---

## Barrel Exports Strategy

After splitting, update barrel exports to maintain backwards compatibility:

```typescript
// adapters/index.ts - Must export from split modules
export { BaseStorageAdapter } from './base-adapter';
export {
  AdapterError,
  FileNotFoundError,
  PermissionDeniedError,
  QuotaExceededError,
  AdapterNotReadyError
} from './adapter-errors';
export { IDBAdapter, createIDBAdapter } from './idb-adapter'; // Re-exports from idb-adapter-core
// ... etc
```

---

## Validation After Splitting

For each file split, verify:

1. **Size Check**: `wc -l <file>` returns ≤300 lines
2. **TypeScript Check**: `pnpm typecheck` returns 0 errors
3. **Import Check**: No broken imports in barrel files
4. **Functionality**: All existing tests still pass

---

## Risk Mitigation

**Risk**: Splitting files could break import chains
**Mitigation**:
- Always update barrel exports before deleting original file
- Run TypeScript check after each split
- Use facade pattern to maintain backwards compatibility

**Risk**: Circular dependencies after split
**Mitigation**:
- Keep utilities in separate module
- Use dependency injection for cross-module references
- Avoid importing from modules that will import back

---

## Critical Issues Identified (From Deep-Scan Reports)

### P0 Issues (Must Fix)
| Issue | Impact | Current State |
|-------|--------|---------------|
| **IndexedDB Quota Handling** | Data loss risk | No quota checking, no eviction policy |
| **Missing Conflict Resolution** | Silent data overwrites | Last-write-wins behavior, no user notification |
| **Event Integration Gap** | UI shows mock data | SyncManager doesn't emit events or call Zustand store |

### P1 Issues (Should Fix)
| Issue | Impact | Current State |
|-------|--------|---------------|
| **80% Code Duplication** | ~1,000 lines duplicated across 4 workspace services | `ide-file-sync-service.ts`, `notes-file-sync-service.ts`, etc. |
| **Test Coverage Gap** | Maintenance risk | Only 21% coverage in filesync module (3/14 files) |
| **Triplicate Sync Status Storage** | Confusion & inconsistency | Zustand store + unused IndexedDB table + runtime state |

---

## Story Development Cycle Coordination

### Agent Responsibilities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Story Development Cycle                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: Create Story File                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                                 │
│  │ SM Agent        │  │ PM Agent        │                                 │
│  │ (Scrum Master)  │  │ (Project Mgr)   │                                 │
│  │                 │  │                 │                                 │
│  │ • Extract from  │  │ • Verify epic   │                                 │
│  │   epic definition│  │   alignment     │                                 │
│  │ • Create story  │  │ • Validate time │                                 │
│  │   file with ACs │  │   estimates     │                                 │
│  │ • Define tasks  │  │ • Check sprint  │                                 │
│  │   + checkboxes  │  │   capacity      │                                 │
│  └─────────────────┘  └─────────────────┘                                 │
│           │                     │                                          │
│           └──────────┬──────────┘                                          │
│                      ▼                                                     │
│              Story File Created                                            │
│              {sprint_artifacts}/arch-01-1-unified-sync-manager.md           │
│                                                                             │
│  PHASE 2: Create Story Context XML                                          │
│  ┌─────────────────┐  ┌─────────────────┐                                 │
│  │ SM Agent        │  │ PM Agent        │                                 │
│  │                 │  │                 │                                 │
│  │ • Gather code   │  │ • Document      │                                 │
│  │   state         │  │   dependencies  │                                 │
│  │ • Research MCP  │  │ • Identify      │                                 │
│  │   tools         │  │   risks         │                                 │
│  │ • Create XML    │  │                 │                                 │
│  └─────────────────┘  └─────────────────┘                                 │
│           │                     │                                          │
│           └──────────┬──────────┘                                          │
│                      ▼                                                     │
│              Context XML Created                                            │
│              {sprint_artifacts}/arch-01-1-unified-sync-manager-context.xml  │
│                                                                             │
│  PHASE 3: Development (Dev Agent)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • Pre-implementation research (MCP tools)                            │    │
│  │ • TDD cycle for each task (red-green-refactor)                       │    │
│  │ • Update Dev Agent Record in story file                             │    │
│  │ • Run tests: pnpm typecheck && pnpm test                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  PHASE 4: Code Review                                                       │
│  ┌─────────────────┐  ┌─────────────────┐                                 │
│  │ Code Reviewer   │  │ SM Agent        │                                 │
│  │                 │  │                 │                                 │
│  │ • Verify all ACs│  │ • Validate      │                                 │
│  │ • Check arch   │  │   completion    │                                 │
│  │ • Review tests │  │ • Update status  │                                 │
│  └─────────────────┘  └─────────────────┘                                 │
│                                                                             │
│  PHASE 5: Done                                                               │
│  • Update sprint-status.yaml                                               │
│  • Update bmm-workflow-status.yaml                                         │
│  • Trigger next story OR epic retrospective                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks Breakdown

### Task Group A: Foundation (2h)

| ID | Task | Effort | Deliverable |
|----|------|--------|-------------|
| A1 | Create sync infrastructure folder structure | 30m | `src/infrastructure/sync/` with subfolders |
| A2 | Define SyncEngine interface and types | 1.5h | `sync-types.ts` with all core types |

**Validation**:
- [ ] Folder structure exists: `core/`, `adapters/`, `strategies/`, `workspace-bindings/`
- [ ] TypeScript compiles with 0 errors

---

### Task Group B: Adapters (14h)

| ID | Task | Effort | Deliverable |
|----|------|--------|-------------|
| B1 | Implement FSA adapter | 8h | `fsa-adapter.ts` |
| B2 | Implement IDB adapter | 6h | `idb-adapter.ts` |

**FSA Adapter Requirements**:
```typescript
class FSAAdapter implements StorageAdapter {
  readFile(path: string): Promise<FileContent>
  writeFile(path: string, content: Uint8Array): Promise<void>
  deleteFile(path: string): Promise<void>
  listFiles(pattern: string): Promise<string[]>
  watch(callback: FileChangeCallback): () => void
}
```

**IDB Adapter Requirements**:
```typescript
class IDBAdapter implements StorageAdapter {
  // MUST include quota handling
  async checkQuota(): Promise<{ used: number; total: number; available: number }>
  async evictIfNeeded(requiredBytes: number): Promise<boolean>
  // CRUD operations...
}
```

**Validation**:
- [ ] FSA adapter handles permission denial gracefully
- [ ] IDB adapter implements quota checking before writes
- [ ] Both adapters pass unit tests (≥80% coverage)

---

### Task Group C: Sync Strategies (20h)

| ID | Task | Effort | Deliverable |
|----|------|--------|-------------|
| C1 | Implement bidirectional sync strategy | 12h | `bidirectional-sync.ts` |
| C2 | Implement conflict resolution | 8h | `conflict-resolution.ts` |

**Conflict Resolution Strategies**:
```typescript
enum ConflictStrategy {
  LAST_WRITE_WINS = 'last-write-wins',
  MANUAL_MERGE = 'manual-merge',
  SOURCE_WINS = 'source-wins',   // Local FS wins
  TARGET_WINS = 'target-wins'    // Platform wins
}

interface ConflictResolution {
  detectConflict(local: FileMetadata, remote: FileMetadata): boolean
  resolve(strategy: ConflictStrategy, local: FileContent, remote: FileContent): Promise<FileContent>
  promptUser(conflict: FileConflict): Promise<ConflictResolution>
}
```

**Validation**:
- [ ] Bidirectional sync detects local vs platform changes
- [ ] Conflict resolution supports 4 strategies
- [ ] User receives notification for conflicts (not silent overwrites)

---

### Task Group D: Core Engine (8h)

| ID | Task | Effort | Deliverable |
|----|------|--------|-------------|
| D1 | Create SyncEngine class | 8h | `sync-engine.ts` |

**SyncEngine Interface**:
```typescript
class SyncEngine {
  // Adapters
  private fsaAdapter: FSAAdapter
  private idbAdapter: IDBAdapter
  private webContainerAdapter?: WebContainerAdapter

  // Strategies
  private bidirectionalSync: BidirectionalSyncStrategy
  private conflictResolution: ConflictResolution

  // Event emission
  private eventBus: CrossWorkspaceEventBus
  private syncStatusStore: SyncStatusStore

  // Core methods
  async sync(options: SyncOptions): Promise<SyncResult>
  async resolveConflict(path: string, strategy: ConflictStrategy): Promise<void>
  on(event: SyncEvent, callback: EventHandler): () => void
}
```

**Event Integration (CRITICAL - Currently Missing)**:
```typescript
// MUST emit these events for UI consumption
enum SyncEvent {
  SYNC_STARTED = 'sync:started',
  SYNC_PROGRESS = 'sync:progress',
  SYNC_COMPLETED = 'sync:completed',
  SYNC_FAILED = 'sync:failed',
  FILE_SYNCED = 'file:synced',
  CONFLICT_DETECTED = 'conflict:detected'
}

// MUST call Zustand store methods
interface SyncStatusStoreIntegration {
  startSync: () => void
  setFileSyncPending: (path: string) => void
  setFileSyncSynced: (path: string) => void
  updateProgress: (current: number, total: number) => void
  completeSync: (fileCount: number) => void
}
```

**Validation**:
- [ ] SyncEngine emits events for all state changes
- [ ] SyncEngine calls Zustand store methods (no mock data in UI)
- [ ] Integration tests pass (bidirectional sync works IDE ↔ local)

---

### Task Group E: Workspace Bindings (6h)

| ID | Task | Effort | Deliverable |
|----|------|--------|-------------|
| E1 | Create workspace bindings | 6h | `ide-binding.ts`, `notes-binding.ts`, `knowledge-binding.ts` |

**Base Class Pattern (Eliminates 80% Duplication)**:
```typescript
abstract class WorkspaceSyncBinding {
  protected syncEngine: SyncEngine
  protected workspaceType: WorkspaceType

  abstract getExcludedPatterns(): string[]
  abstract getSyncPriority(): number

  async sync(): Promise<SyncResult>
  async handleFileChange(event: FileChangeEvent): Promise<void>
}
```

**Validation**:
- [ ] Each workspace binding has specific excluded patterns
- [ ] Code duplication <20% (vs current 80%)

---

### Task Group F: Migration & Testing (14h)

| ID | Task | Effort | Deliverable |
|----|------|--------|-------------|
| F1 | Migrate existing consumers | 8h | All imports updated |
| F2 | Write integration tests | 6h | Test suite for sync scenarios |
| F3 | Delete deprecated files | 2h | 7 duplicate files removed |

**Files to DELETE**:
```
src/lib/filesystem/sync-manager.ts              ← DUPLICATE
src/lib/filesync/file-sync-service.ts           ← REPLACED
src/lib/filesync/ide-file-sync-service.ts       ← REPLACED
src/lib/filesync/notes-file-sync-service.ts     ← REPLACED
src/lib/filesync/knowledge-file-sync-service.ts ← REPLACED
src/lib/filesync/study-file-sync-service.ts     ← REPLACED
src/lib/filesync/project-knowledge-sync.ts      ← REPLACED
```

**Migration Pattern**:
```typescript
// OLD (find all occurrences via grep)
import { FileSyncService } from '@/lib/filesync/file-sync-service'

// NEW
import { SyncEngine } from '@/infrastructure/sync'
```

**Validation**:
- [ ] All 7 duplicate files deleted
- [ ] Zero imports of old paths remaining
- [ ] Integration tests cover: happy path, conflict scenarios, quota exceeded

---

## Acceptance Criteria Mapping

| AC | Description | Task Group | Validation |
|----|-------------|------------|------------|
| AC1 | Single SyncEngine class handles all sync | D | File exists at `src/infrastructure/sync/core/sync-engine.ts` |
| AC2 | FSA adapter correctly reads/writes local files | B | Unit tests pass for File System Access API |
| AC3 | IDB adapter correctly reads/writes to IndexedDB | B | Unit tests pass for Dexie operations |
| AC4 | Bidirectional sync detects local vs platform changes | C | Integration test verifies change detection |
| AC5 | Conflict resolution handles simultaneous edits | C | 4 strategies supported, user notified |
| AC6 | All 7 duplicate sync files deleted after migration | F | Files don't exist, grep confirms 0 imports |
| AC7 | All existing sync consumers migrated to new paths | F | TypeScript compiles with 0 errors |
| AC8 | Integration tests cover happy path and conflicts | F | ≥10 integration tests passing |
| AC9 | Sync status emits events for UI consumption | D | Components use real data, not mock |

---

## Edge Cases & Risk Mitigation

### Edge Case 1: IndexedDB Quota Exceeded
**Current**: No handling → data loss
**Solution**:
```typescript
// IDB Adapter must implement:
async checkQuotaBeforeWrite(size: number): Promise<void> {
  const { used, total } = await navigator.storage.estimate()
  const available = (total - used) * 0.9 // 10% buffer

  if (size > available) {
    await this.evictLeastRecentlyUsed(size - available)
  }
}
```

### Edge Case 2: Simultaneous Edits (Conflict)
**Current**: Silent overwrites
**Solution**:
```typescript
// Conflict resolution with user notification
if (conflictDetected) {
  const resolution = await this.promptUser({
    localVersion: local.content,
    remoteVersion: remote.content,
    localTimestamp: local.modifiedAt,
    remoteTimestamp: remote.modifiedAt
  })
  // Apply user's choice
}
```

### Edge Case 3: Permission Revoked Mid-Sync
**Current**: Unclear behavior
**Solution**:
```typescript
// Wrap all FSA operations in permission check
try {
  await this.fsaAdapter.writeFile(path, content)
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    await this.syncStatusStore.notifyPermissionRevoked(path)
    // Queue for retry when permission restored
  }
}
```

### Edge Case 4: WebContainer Not Available
**Current**: May crash
**Solution**:
```typescript
// Graceful degradation
if (!this.webContainerAdapter?.isAvailable()) {
  // Continue with local + IndexedDB sync only
  logger.info('WebContainer unavailable, using local-only sync')
}
```

---

## MCP Research Protocol (Pre-Implementation)

Before ANY code implementation, Dev Agent MUST:

1. **Context7 Research** (2+ calls):
   - Query: "File System Access API patterns 2025"
   - Query: "IndexedDB quota management best practices"
   - Query: "Zustand v5 event emission patterns"

2. **DeepWiki Research** (1+ call):
   - Repository: `stackblitz/webcontainer-core`
   - Query: "WebContainer file system synchronization patterns"

3. **Repomix Analysis** (1 call):
   - Pack and analyze current sync implementations
   - Identify patterns to preserve vs refactor

4. **Document in Context XML**:
```xml
<research_notes>
  <finding source="context7" query="File System Access API">
    Pattern: Always check permission state before operations
  </finding>
  <finding source="deepwiki" repo="stackblitz/webcontainer-core">
    Pattern: WebContainer.fs.writeFile requires absolute paths from project root
  </finding>
</research_notes>
```

---

## Files to Create

```
src/infrastructure/sync/
├── index.ts                                    # Public exports
├── core/
│   ├── sync-engine.ts                           # Main SyncEngine class
│   ├── sync-types.ts                            # Core type definitions
│   └── sync-events.ts                           # Event definitions
├── adapters/
│   ├── fsa-adapter.ts                           # File System Access API adapter
│   ├── idb-adapter.ts                           # IndexedDB/Dexie adapter
│   ├── base-adapter.ts                          # Abstract base class
│   └── webcontainer-adapter.ts                  # WebContainer adapter (optional)
├── strategies/
│   ├── bidirectional-sync.ts                    # Bidirectional sync logic
│   ├── conflict-resolution.ts                   # Conflict handling
│   └── quota-management.ts                      # IndexedDB quota handling
└── workspace-bindings/
    ├── base-binding.ts                          # Abstract base for workspace bindings
    ├── ide-binding.ts                           # IDE workspace sync
    ├── notes-binding.ts                         # Notes workspace sync
    ├── knowledge-binding.ts                     # Knowledge workspace sync
    └── study-binding.ts                         # Study workspace sync
```

---

## Validation Gates

### Gate 1: After Task Group A (Foundation)
```bash
# Verify folder structure
ls -la src/infrastructure/sync/{core,adapters,strategies,workspace-bindings}

# Verify TypeScript
pnpm typecheck
# Expected: 0 errors
```

### Gate 2: After Task Group B (Adapters)
```bash
# Run adapter tests
pnpm test -- fsa-adapter
pnpm test -- idb-adapter

# Verify coverage
pnpm test -- --coverage --reporter=text
# Expected: ≥80% coverage for adapters
```

### Gate 3: After Task Group C (Strategies)
```bash
# Run strategy tests
pnpm test -- bidirectional-sync
pnpm test -- conflict-resolution

# Verify conflict scenarios
# Expected: All 4 strategies tested
```

### Gate 4: After Task Group D (Core Engine)
```bash
# Integration test
pnpm test -- sync-engine.integration

# Verify event emission
# Expected: Events fired for all state changes
```

### Gate 5: After Task Group F (Migration)
```bash
# Verify no old imports remain
grep -r "from '@/lib/filesync" src/
# Expected: 0 results

# Verify old files deleted
ls src/lib/filesync/*.ts 2>&1 | grep "No such file"
# Expected: Command fails (files don't exist)

# Full test suite
pnpm typecheck && pnpm test
# Expected: All pass
```

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Duplicate sync files | 7 | 0 | `find src -name "*sync*" | wc -l` |
| Code duplication | 80% | <20% | Manual code review |
| Test coverage (filesync) | 21% | ≥80% | `pnpm test --coverage` |
| TypeScript errors | 0 | 0 | `pnpm typecheck` |
| Event integration | Mock data | Real events | UI shows actual sync status |
| IndexedDB quota handling | None | Implemented | Code review + tests |

---

## Timeline Estimate

| Week | Tasks | Hours | Cumulative |
|------|-------|-------|------------|
| 1 | Task Groups A + B | 16h | 16h |
| 1-2 | Task Group C | 20h | 36h |
| 2 | Task Groups D + E | 14h | 50h |
| 2 | Task Group F + Validation | 14h | 64h |

**Total**: 48-64 hours (within epic estimate)

---

## Next Actions

### Immediate (SM Agent)
1. Create story file at `{sprint_artifacts}/arch-01-1-unified-sync-manager.md`
2. Extract all 9 ACs from epic definition with Given/When/Then format
3. Create task breakdown with checkboxes

### After Story File (PM Agent)
1. Validate time estimates against sprint capacity
2. Check dependencies with STAB-24.1/24.2/24.3 (parallel safe)
3. Verify epic alignment

### After Story Approval (SM Agent)
1. Create context XML file with code state
2. Execute MCP research protocol
3. Document architecture patterns from `architecture.md`

### After Context XML (Dev Agent)
1. Execute pre-implementation research
2. Implement TDD cycle for each task group
3. Update Dev Agent Record in story file

---

## Handoff Format

```markdown
## 📋 HANDOFF: SM → PM

**Task:** ARCH-01.1 Story Creation
**Phase:** 1/5 (Create Story File)
**Timestamp:** 2026-01-04T{time}

### Completed
- Deep-scan analysis of sync infrastructure
- Identification of P0/P1 issues
- Task breakdown with hour estimates

### Artifacts Created
- _bmad-output/deep-scan/agent-abf1253.md (File sync analysis)
- _bmad-output/deep-scan/agent-adbae81.md (Sync status state management)
- /Users/apple/.claude/plans/velvety-soaring-manatee.md (This plan)

### Validation Results
- TypeScript: ✅ N/A (planning phase)
- Tests: ✅ N/A (planning phase)
- Size compliance: ✅ Plan <500 lines

### Next Action
PM Agent: Validate story file against sprint capacity and epic alignment
```
