# ADR-032: Clean Storage Architecture

**Status**: ACCEPTED  
**Date**: 2026-01-15  
**Decision Makers**: EXCALIBUR, User  
**Epic**: EPIC-CC-01 (Project Space Foundation)  

---

## Context

The application had severe storage fragmentation with **77 sync-related files across 8+ directories**:

```
src/lib/sync/                           ← Sync #1
src/lib/filesync/                       ← DEPRECATED (re-exports only)
src/lib/filesystem/sync-manager/        ← Legacy SyncManager
src/lib/filesystem/sync-transaction/    ← Transaction logging
src/lib/workspace/file-sync-status-store/
src/infrastructure/sync/                ← "New" unified sync (incomplete)
src/lib/watcher/                        ← File watcher #1 (BROKEN)
src/infrastructure/sync/core/           ← File watcher #2
```

### Critical Problems Discovered

1. **File Watcher NOT IMPLEMENTED** - `getFileStats()` always returned `Date.now()`, meaning external file changes were **never detected**
2. **Two LocalFSAdapter Implementations** - Facade pattern with circular re-exports
3. **StorageAdapter Interface Mismatch** - Domain interface existed but wasn't properly implemented
4. **No Platform Detection** - No routing between Desktop (FSA) vs Mobile (IDB)

---

## Decision

### Storage Strategy (User Confirmed)

| Platform | Storage Backend | Priority |
|----------|-----------------|----------|
| **Desktop** (IDE, Notes, All Workspaces) | File System Access API (FSA) | P0 - Must work flawlessly |
| **Mobile** (All Workspaces) | IndexedDB via Dexie | P1 - Onboarding/starter experience |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     StorageAdapter Interface                     │
│                    (Domain Layer - Clean Architecture)           │
│  readFile | writeFile | deleteFile | listFiles | getMetadata    │
│  exists | watch() | isAvailable()                               │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ FSAStorageAdapter│  │ IDBStorageAdapter│  │ WebContainerAdapter│
│ (Desktop - NEW)  │  │ (Mobile - TODO) │  │ (IDE Preview)      │
│                  │  │                  │  │                     │
│ • Real files     │  │ • Dexie tables   │  │ • StackBlitz WC    │
│ • Polling watch  │  │ • Blob storage   │  │ • No persistence   │
│ • SHA-256 hash   │  │ • Sync to cloud? │  │ • Fast iteration   │
└─────────────────┘  └─────────────────┘  └─────────────────────┘
```

### Files Created/Modified

| File | Status | Description |
|------|--------|-------------|
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | **NEW** | FSA implementation with `watch()` and SHA-256 hashing |
| `src/domain/interfaces/storage-adapter.interface.ts` | Existing | Domain interface (Clean Architecture) |
| `src/infrastructure/sync/core/sync-result-types.ts` | Modified | Added `FileChangeCallback` re-export |
| `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts` | Modified | Export `INITIAL_PROVIDERS` for ESM compatibility |

### TypeScript Fixes Applied

| Error | Fix |
|-------|-----|
| `dexieDB` not found | Changed to `db` import (ESM-compatible proxy) |
| `require()` in ESM | Replaced with proper ES module imports |
| Implicit `any` types | Added explicit type annotations |
| TanStack `server` property | Added `@ts-expect-error` (type definition mismatch) |
| `video` modality missing | Added case to `buildRequestPayload()` |

---

## Consequences

### Positive

1. **Clean Architecture Compliance** - Domain owns interface, infrastructure implements
2. **External Change Detection** - FSAStorageAdapter has working `watch()` with polling
3. **Content-Based Sync** - SHA-256 hashing for change detection (no more timestamp-only)
4. **TypeScript Clean** - 0 errors, app compiles and runs

### Negative

1. **Polling Required** - FSA API doesn't have native watch; must poll for changes
2. **Mobile Not Implemented** - IDBStorageAdapter still TODO
3. **77 Files Still Exist** - Consolidation of legacy sync code is Phase 2

### Risks

1. **Polling Performance** - Need to tune interval (300ms default, configurable)
2. **Memory Usage** - Content hashing for large files could be expensive

---

## Implementation Plan

### Phase 1: FSA Foundation (This Session) ✅

- [x] Create `FSAStorageAdapter` implementing `StorageAdapter` interface
- [x] Add `watch()` method with polling-based change detection
- [x] Add SHA-256 content hashing for change detection
- [x] Fix all TypeScript errors (19 → 0)
- [x] Fix ESM compatibility (`require()` → ES imports)
- [x] Verify app runs (`pnpm dev`)

### Phase 2: Integration (Next)

- [ ] Create platform detection: `'showDirectoryPicker' in window`
- [ ] Route Desktop → FSA, Mobile → IDB
- [ ] Integrate `FSAStorageAdapter.watch()` for external change detection
- [ ] Connect to Monaco for hot reload on external edits

### Phase 3: Consolidation (Future)

- [ ] Delete `src/lib/filesync/` (already just re-exports)
- [ ] Consolidate `src/lib/sync/` into `src/infrastructure/sync/`
- [ ] Remove duplicate file watcher in `src/lib/watcher/`
- [ ] Archive legacy `SyncManager` + `LocalFSAdapter`

---

## References

- **StorageAdapter Interface**: `src/domain/interfaces/storage-adapter.interface.ts`
- **FSAStorageAdapter**: `src/infrastructure/filesystem/fsa-storage-adapter.ts`
- **File Watcher (broken)**: `src/lib/watcher/file-watcher.ts` (line 353-361)
- **Session**: `correct-course-clean-storage-2026-01-15`
