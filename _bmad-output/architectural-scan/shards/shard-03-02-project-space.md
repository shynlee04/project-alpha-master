# Feature Group 2: Project Space Boundaries - Deep Analysis

**Shard ID**: ARCH-SHARD-03-02
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Core Centralized Group #2 - Project Space Boundaries (Desktop FS vs Browser DB)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → Project Space Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on Project Space |
|--------------------|-------|----------------|-------------------------|
| **A: State & Stores** | `useWorkspaceFileSystem.ts:571` | P0 | GOD STORE - mixed concerns |
| **C: Persistence & Data** | `fsa-adapter-core.ts`, `idb-adapter-core.ts` | P0 | Dual storage, no abstraction |
| **C: Persistence & Data** | Multiple Dexie DBs | P0 | Fragmented persistence |
| **D: API & Data Flow** | `unified-storage-adapter.ts:406` | ⚠️ | Additional abstraction layer |
| **F: Layers & Boundaries** | `domain/services/file-crud/unified-file-crud.ts:31` | P0 | Domain→Infra import |

### 1.2 Current Architecture Diagram (BROKEN)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROJECT SPACE BOUNDARIES (CURRENT - BROKEN)          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      ROUTING LAYER                               │   │
│  │  /ide/$projectId  →  Desktop FS if available                     │   │
│  │  /notes/$projectId →  Browser DB (always)                        │   │
│  │  /knowledge/$projectId → Browser DB (always)                     │   │
│  │  /study/$projectId → Browser DB (always)                         │   │
│  │  /hub → Browser DB (default workspace)                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 UnifiedStorageAdapter (406 lines!)               │   │
│  │                                                                  │   │
│  │   ┌─────────────────┐         ┌─────────────────┐               │   │
│  │   │   FSA Adapter   │         │   IDB Adapter   │               │   │
│  │   │ (File System    │         │ (IndexedDB      │               │   │
│  │   │  Access API)    │         │  Default)       │               │   │
│  │   │                  │         │                  │               │   │
│  │   │ ⚠️ Permissions  │         │ ⚠️ Quota        │               │   │
│  │   │    complex      │         │    management    │               │   │
│  │   │ ⚠️ Desktop only │         │ ✓ All platforms  │               │   │
│  │   └────────┬────────┘         └────────┬────────┘               │   │
│  │            │                           │                          │   │
│  │            └───────────┬───────────────┘                          │   │
│  │                        ▼                                          │   │
│  │            ┌──────────────────────┐                               │   │
│  │            │  NO CLEAR BOUNDARY!  │ ◀── PROBLEM                  │   │
│  │            │  Which adapter when? │                               │   │
│  │            └──────────────────────┘                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    useWorkspaceFileSystem.ts                     │   │
│  │              (GOD STORE - 571 LINES OF MIXED CONCERNS)           │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ Project     │  │ File Ops    │  │ Dexie Queries           │  │   │
│  │  │ Loading     │  │ read/write  │  │ (mixed together!)       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (Project Space Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **God store (571 lines)** | `useWorkspaceFileSystem.ts` | P0 | 3 concerns mixed: loading + ops + queries |
| **No storage abstraction** | Missing interface | P0 | Components know storage details |
| **Multiple Dexie DBs** | `flashcard-db.ts`, `study-db.ts` | P0 | Data fragmentation |
| **Domain→Infra import** | `unified-file-crud.ts:31` | P0 | Clean Architecture violation |
| **Sync without content hash** | `bidirectional-sync-core.ts:144` | P1 | Only lastModified comparison |
| **FSA permission complexity** | `fsa-adapter-core.ts` | P1 | Permission states unclear |

---

## 2. Feature Behavior Analysis

### 2.1 Storage Decision Flow

```
                    ┌─────────────────────┐
                    │  User Opens Project │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Detect Capability  │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │  Desktop Detected?  │         │  Mobile/No FS       │
    │  (Handle API avail) │         │  (Browser only)     │
    └──────────┬──────────┘         └──────────┬──────────┘
               │                               │
               ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │  Try FSA Adapter    │         │  Use IDB Adapter    │
    │                     │         │                     │
    │  ┌───────────────┐  │         │  ┌───────────────┐ │
    │  │ Permission:   │  │         │  │ Quota:        │ │
    │  │ - granted?    │  │         │  │ - check avail │ │
    │  │ - prompt?     │  │         │  │ - eviction    │ │
    │  │ - denied?     │  │         │  │ - warn user   │ │
    │  └───────────────┘  │         │  └───────────────┘ │
    │        │            │         │        │           │
    │        ▼            │         │        ▼           │
    │  ┌───────────────┐  │         │  ┌─────────────┐  │
    │  │ If granted:   │  │         │  │ Store in    │  │
    │  │ Use FS + Sync │  │         │  │ ViaGentDB   │  │
    │  └───────────────┘  │         │  └─────────────┘  │
    │        │            │         │                   │
    │        ▼            │         │                   │
    │  ┌───────────────┐  │         │                   │
    │  │ If denied:    │  │         │                   │
    │  │ Fallback to   │  │         │                   │
    │  │ IDB           │  │         │                   │
    │  └───────────────┘  │         │                   │
    └─────────────────────┘         └───────────────────┘
```

**Current Issues**:
- No clear abstraction: Components check storage type directly
- FSA fallback logic complex and error-prone
- IDB quota management may cause data loss

### 2.2 Data Flow: File Operations

#### Desktop User: Create File

```
User Action              System Response              Storage Path
─────────────────────────────────────────────────────────────────────
1. Create file       →   Check FSA permission         FSA Adapter
2. Save content      →   Write to FS                  FS (immediate)
                       →   Sync to IDB (async)        IDB (background)
3. Update UI         →   Refresh file list            Store
```

#### Mobile User: Create File

```
User Action              System Response              Storage Path
─────────────────────────────────────────────────────────────────────
1. Create file       →   Direct to IDB               IDB Adapter
2. Save content      →   Write to ViaGentDB          ViaGentDB (immediate)
3. Update UI         →   Refresh file list            Store
```

**Current Issues**:
- Desktop: FS + IDB sync may conflict (no content hashing)
- Mobile: Single storage but quota issues
- No unified API: Components know which storage

---

## 3. User Stories - Project Space (DETAILED)

### Story PS-01: Desktop File System Access

```
As a desktop user
I want to access my project files directly from the file system
So that I can use my familiar file manager and edit files externally

Priority: P0
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Detect File System Access API availability
- [ ] AC2: Request permission on first use (not page load)
- [ ] AC3: Read files from selected directory
- [ ] AC4: Write files to selected directory
- [ ] AC5: Create/delete files through UI
- [ ] AC6: Permission denial handled gracefully with clear UI

Technical Requirements:
- [ ] TR1: `FsaAdapter.isSupported()` returns boolean
- [ ] TR2: `FsaAdapter.requestPermission()` with retry logic
- [ ] TR3: File operations with proper error handling
- [ ] TR4: Path normalization for cross-platform

Edge Cases:
- [ ] EC1: Permission granted, then revoked → Fallback to IDB
- [ ] EC2: User closes permission dialog → Retry prompt option
- [ ] EC3: File deleted externally while open → Auto-close or warn
- [ ] EC4: Disk full → Clear error, suggest cleanup
- [ ] EC5: Network drive (slow) → Loading indicators
- [ ] EC6: Symlinks or special files → Ignore or warn

Combined Uses:
- [ ] CU1: Open project, edit in VS Code, refresh in app → Changes reflected
- [ ] CU2: Create file in app, edit externally → Bidirectional sync
-: Multiple files edited externally → Batch [ ] CU3 sync

Non-Functional Requirements:
- [ ] NFR1: Permission request < 1s (UI responsive)
- [ ] NFR2: File read < 100ms for typical file
- [ ] NFR3: Permission state persists across sessions
- [ ] NFR4: Clear visual indicator of FS vs IDB mode

Tests Required:
- [ ] Unit: Permission state machine
- [ ] Unit: Path normalization
- [ ] Integration: Read/write operations
- [ ] E2E: Full workflow on desktop browser
```

### Story PS-02: Browser Database Fallback

```
As a mobile user or desktop user without FS access
I want my files stored in the browser database
So that I can still use all features without file system access

Priority: P0
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Files stored in IndexedDB (ViaGentDatabase)
- [ ] AC2: Automatic storage when FS not available
- [ ] AC3: Quota usage indicator visible
- [ ] AC4: Warning when approaching quota limit
- [ ] AC5: Graceful handling of quota exceeded

Technical Requirements:
- [ ] TR1: `IdbAdapter` with quota estimation
- [ ] TR2: Quota check before large writes
- [ ] TR3: Eviction policy for old files (configurable)
- [ ] TR4: Compression for storage efficiency

Edge Cases:
- [ ] EC1: Quota exceeded during write → Rollback, notify user
- [ ] EC2: Browser private mode → Warn, suggest export
- [ ] EC3: Large file (>10MB) → Chunking or reject with reason
- [ ] EC4: Browser storage corrupted → Recovery option
- [ ] EC5: Storage full → Minimal cleanup suggestions

Combined Uses:
- [ ] CU1: Mobile user creates notes, embeds images → Compressed storage
- [ ] CU2: Desktop user denies FS → Auto-switch to IDB, continue work
- [ ] CU3: User switches from mobile to desktop → IDB sync possible?

Non-Functional Requirements:
- [ ] NFR1: Write operation < 200ms for 1MB file
- [ ] NFR2: Storage efficiency > 80% (compression ratio)
- [ ] NFR3: Quota check < 10ms
- [ ] NFR4: Works in all modern browsers

Tests Required:
- [ ] Unit: Quota estimation
- [ ] Unit: Eviction policy
- [ ] Integration: Large file handling
- [ ] E2E: Mobile workflow complete
```

### Story PS-03: Unified Storage Abstraction

```
As a developer
I want a single storage API regardless of backend
So that I can write storage-agnostic code

Priority: P0
Estimation: 3 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Single interface for file operations
- [ ] AC2: `StorageAdapter.getFile(path)` returns file content
- [ ] AC3: `StorageAdapter.writeFile(path, content)` persists
- [ ] AC4: `StorageAdapter.deleteFile(path)` removes
- [ ] AC5: `StorageAdapter.listFiles(dir)` returns file list
- [ ] AC6: Components never import FSA or IDB directly

Technical Requirements:
- [ ] TR1: Define `StorageAdapter` interface in domain layer
- [ ] TR2: FSA adapter implements `StorageAdapter`
- [ ] TR3: IDB adapter implements `StorageAdapter`
- [ ] TR4: Factory creates appropriate adapter
- [ ] TR5: Context provides adapter instance

Edge Cases:
- [ ] EC1: FS permission lost during operation → Adapter swap
- [ ] EC2: IDB quota during operation → Error with suggestion
- [ ] EC3: Path format differences (FS vs IDB) → Normalization
- [ ] EC4: Adapter not ready → Queue operations or error

Combined Uses:
- [ ] CU1: Note editor uses StorageAdapter, works in both modes
- [ ] CU2: File tree component same code for both modes
- [ ] CU3: RAG indexing uses StorageAdapter, reads from either

Non-Functional Requirements:
- [ ] NFR1: Adapter method latency < 50ms (overhead)
- [ ] NFR2: Zero runtime errors from adapter switching
- [ ] NFR3: Type safety at compile time
- [ ] NFR4: Easy to add new adapters (e.g., cloud storage)

Tests Required:
- [ ] Unit: Interface compliance
- [ ] Unit: Adapter switching
- [ ] Integration: Same operation on both adapters
- [ ] E2E: Feature works identically in both modes
```

### Story PS-04: Desktop ↔ Browser Sync

```
As a user who uses both desktop and browser
I want my files to sync between File System and Browser DB
So that I have a backup and can access on mobile

Priority: P1
Estimation: 5 days (deferred to Phase 3)

Acceptance Criteria:
- [ ] AC1: Files can exist in both FS and IDB
- [ ] AC2: Last-write-wins by default
- [ ] AC3: Conflict detection with user choice
- [ ] AC4: Sync status visible per file
- [ ] AC5: Manual sync trigger available

Technical Requirements:
- [ ] TR1: `SyncEngine` with bidirectional sync
- [ ] TR2: Content hashing for change detection
- [ ] TR3: Conflict resolver with strategies
- [ ] TR4: Sync queue with retry logic

Edge Cases:
- [ ] EC1: Both ends modified simultaneously → Conflict UI
- [ ] EC2: File deleted in one location → Delete in other?
- [ ] EC3: Large file sync → Progress indicator
- [ ] EC4: Network offline → Queue and sync later

Combined Uses:
- [ ] CU1: Edit in IDE (FS), open on mobile (IDB) → Sync bridges
- [ ] CU2: Bulk import on desktop → Background sync to IDB
- [ ] CU3: Conflict during active edit → Warn user

Non-Functional Requirements:
- [ ] NFR1: Sync < 5s for typical file
- [ ] NFR2: Bandwidth efficient (deltas, not full files)
- [ ] NFR3: Reliable (survives network interruption)
- [ ] NFR4: User-configurable sync frequency

Tests Required:
- [ ] Unit: Hash generation
- [ ] Unit: Conflict detection
- [ ] Integration: Full sync cycle
- [ ] E2E: Cross-device workflow

DEFER NOTE: Sync is Phase 3 work. Focus Phase 1-2 on abstraction.
```

### Story PS-05: Project Space Routing

```
As a user navigating between workspaces
I want clear routing that respects project boundaries
So that I never lose context of which project I'm in

Priority: P0
Estimation: 1 day (verify + fixes)

Acceptance Criteria:
- [ ] AC1: Route `/ide/$projectId` opens IDE with that project
- [ ] AC2: Route `/notes/$projectId` opens notes for that project
- [ ] AC3: Route `/hub` opens default workspace
- [ ] AC4: Invalid project ID shows clear error
- [ ] AC5: Project switching preserves unsaved work (where possible)

Technical Requirements:
- [ ] TR1: Route params validated against project registry
- [ ] TR2: `ProjectContext` provides project to all children
- [ ] TR3: Unsaved work dialog on route change

Edge Cases:
- [ ] EC1: Project deleted while open → Graceful handling
- [ ] EC2: Permission changed while open → Update access
- [ ] EC3: Two tabs with different projects → Independent contexts
- [ ] EC4: Refresh on project page → Restores state

Combined Uses:
- [ ] CU1: Open IDE, switch to Notes, back to IDE → State preserved
- [ ] CU2: Open project A, open project B in new tab → Independent
- [ ] CU3: Navigate to non-existent project → Clear 404

Non-Functional Requirements:
- [ ] NFR1: Route change < 200ms
- [ ] NFR2: No white screen during load
- [ ] NFR3: Back button works correctly

Tests Required:
- [ ] Unit: Route param validation
- [ ] Integration: Project context propagation
- [ ] E2E: Full navigation flow
```

---

## 4. Project Space → Architecture Conflict Matrix

| Project Space Story | Architecture Issue | Conflict Severity | Fix Required |
|---------------------|-------------------|-------------------|--------------|
| PS-01, PS-02 | God store useWorkspaceFileSystem (P0) | BLOCKING | Split into 3 slices |
| PS-03 | No StorageAdapter interface (P0) | BLOCKING | Create domain interface |
| PS-04 | Sync without content hash (P1) | HIGH | Add SHA-256 |
| PS-01, PS-02 | Multiple Dexie DBs (P0) | BLOCKING | Consolidate to ViaGent |
| PS-05 | Route validation missing (P1) | MEDIUM | Add route guards |
| ALL | Domain→Infra import (P0) | BLOCKING | Move interface to domain |
| ALL | FSA/IDB adapter leakage (P1) | HIGH | Use StorageAdapter only |

---

## 5. File Change Manifest - Project Space

### 5.1 Files to CREATE

| File | Purpose | Lines | Story |
|------|---------|-------|-------|
| `domain/interfaces/storage-adapter.ts` | Storage abstraction interface | 80 | PS-03 |
| `infrastructure/persistence/stores/workspace/file-loader-slice.ts` | Project loading only | 100 | PS-01, PS-02 |
| `infrastructure/persistence/stores/workspace/file-ops-slice.ts` | File operations only | 120 | PS-01, PS-02 |
| `infrastructure/persistence/stores/workspace/storage-adapter-slice.ts` | Adapter management | 80 | PS-03 |
| `infrastructure/sync/content-hasher.ts` | SHA-256 for sync | 50 | PS-04 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `useWorkspaceFileSystem.ts` | Keep orchestrator only, <150 lines | -400 | PS-01-PS-05 |
| `unified-storage-adapter.ts` | Implement StorageAdapter interface | -100 | PS-03 |
| `fsa-adapter-core.ts` | Implement StorageAdapter | +20 | PS-03 |
| `idb-adapter-core.ts` | Implement StorageAdapter | +20 | PS-03 |
| `routeTree.gen.ts` | Add project validation guards | +30 | PS-05 |
| `bidirectional-sync-core.ts` | Add content hashing | +50 | PS-04 |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `flashcard-db.ts` | Consolidate to ViaGent | PS-02 |
| `study-database-slice.ts` | Consolidate to ViaGent | PS-02 |

### 5.4 Files to REFERENCE (No Changes)

| File | Purpose | Status |
|------|---------|--------|
| `workspace-store.ts` | Workspace state - may need refactor | ⚠️ |

---

## 6. Project Space Must-Pass Checklist

### Pre-Refactor Verification

- [ ] Current storage flow diagrammed and understood
- [ ] All file operations identified and listed
- [ ] FSA permission states documented
- [ ] IDB quota usage measured

### During Refactor

- [ ] StorageAdapter interface created in domain layer
- [ ] FSA adapter implements interface
- [ ] IDB adapter implements interface
- [ ] Factory creates correct adapter
- [ ] File loader slice tested in isolation
- [ ] File ops slice tested in isolation
- [ ] Storage adapter slice tested in isolation
- [ ] Components use StorageAdapter (not direct adapters)

### Post-Refactor Verification

- [ ] useWorkspaceFileSystem.ts < 150 lines
- [ ] Zero imports of FSA/IDB in presentation layer
- [ ] Desktop mode: Files stored in FS, synced to IDB
- [ ] Mobile mode: Files stored in IDB only
- [ ] Route changes preserve project context
- [ ] No console errors in normal operation
- [ ] TypeScript compilation succeeds
- [ ] All existing tests pass

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| File System Access API | ✅ Browser native | Core |
| IndexedDB (Dexie) | ✅ Ready | Core |
| Web Crypto API | ✅ Ready | Hashing |
| TanStack Router | ✅ Ready | Routing |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Adapter interface breaks existing code** | High | High | Gradual migration, facade pattern |
| **FS permission UX poor** | Medium | High | Test with real users, iterate |
| **IDB quota surprises users** | Medium | Medium | Early warning UI, cleanup tools |
| **Sync conflicts cause data loss** | Low | Critical | Hash-based detection, user choice |

### Deferred (Not MVP)

| Item | Reason | When |
|------|--------|------|
| Bidirectional sync (PS-04) | Complex, depends on abstraction | Phase 3 |
| Conflict resolution UI | Depends on sync | Phase 3 |
| Cloud storage adapter | Extension, not core | Future |
| Compression | Performance trade-off | Phase 4 |

---

## 8. Research Notes & Tech Context

### File System Access API

```
Browser Support: Chrome 86+, Edge 86+, Opera 72+
Safari: Behind flag (no stable support)
Firefox: Not implemented

Implications:
- Desktop Chrome/Edge users get FS access
- Safari/Firefox users get IDB only
- Detect capability, don't assume
```

### IndexedDB Quota

```
Browser Quota Estimates:
- Chrome/Edge: ~60% of disk space
- Safari: ~50% of disk space
- Mobile: More restrictive

Management Strategies:
- Estimate before write (navigator.storage.estimate())
- Compress large files (gzip)
- Evict old files (LRU)
- Warn user at 80%, 90%, 95%
```

### Sync Strategies

```
Options:
1. Last-Write-Wins (simplest)
2. Server wins (cloud)
3. Manual merge (most correct)

Recommendation:
- Default: Last-Write-Wins with hash comparison
- Conflict: User choice dialog
- Future: Server for cross-device
```

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-03 - Agent/LLM Orchestration](./shard-03-03-agent-llm.md)*
