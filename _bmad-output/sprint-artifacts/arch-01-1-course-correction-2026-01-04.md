# 🔄 ARCH-01.1 Course Correction & Dev Agent Redirect

**Date**: 2026-01-04T22:35:00+07:00
**From**: @bmad-core-bmad-master (Orchestrator)
**To**: @bmad-bmm-dev (Development Agent)
**Status**: URGENT REMEDIATION REQUIRED

---

## 📋 Executive Summary

The ARCH-01.1 (Unified Sync Manager) implementation is **PARTIALLY COMPLETE**. The infrastructure is functional (TypeScript passes, build succeeds), but **violates architectural constraints**:

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| GOD FILES | 4 | 0 | 🚨 4 files > 300 lines |
| Old Files Remaining | 8 | 0 | 🚨 8 files not deleted |
| Consumer Migrations | 10/21 | 21/21 | 🚨 11 imports on old paths |
| Acceptance Criteria | 3/9 | 9/9 | ⚠️ 6 incomplete |

---

## 🎯 Immediate Actions (DO THIS NOW)

### Action 1: Split GOD FILES (Priority: P0)

The following files exceed the 300-line limit and MUST be split:

#### 1.1 Split `idb-adapter-core.ts` (660 → 3 files)

```bash
# Current file: src/infrastructure/sync/adapters/idb-adapter-core.ts (660 lines)
```

**Split into:**
```
src/infrastructure/sync/adapters/
├── idb-adapter-core.ts      (~220 lines) - Class skeleton, constructor, initialize, close
├── idb-quota-manager.ts     (~220 lines) - checkQuota, evictIfNeeded, getQuotaInfo
└── idb-eviction.ts          (~220 lines) - evictByPolicy, sortForEviction, bulkDelete
```

**Split Points:**
1. Lines 1-220: Keep class definition, constructor, CRUD methods
2. Lines 221-440: Extract to `idb-quota-manager.ts` (quota checking and eviction orchestration)
3. Lines 441-660: Extract to `idb-eviction.ts` (policy-specific eviction logic)

**Update barrel:**
```typescript
// adapters/index.ts
export { IDBAdapter, createIDBAdapter } from './idb-adapter';
export { IDBQuotaManager, checkQuota } from './idb-quota-manager';
export { IDBEvictionPolicy, evictByPolicy } from './idb-eviction';
```

#### 1.2 Split `fsa-adapter-core.ts` (497 → 2 files)

```bash
# Current file: src/infrastructure/sync/adapters/fsa-adapter-core.ts (497 lines)
```

**Split into:**
```
src/infrastructure/sync/adapters/
├── fsa-adapter-core.ts         (~250 lines) - Class, CRUD operations
└── fsa-permission-manager.ts   (~250 lines) - Permission checking, request, denial handling
```

**Split Points:**
1. Lines 1-250: Keep class definition, readFile, writeFile, deleteFile, listFiles
2. Lines 251-497: Extract to `fsa-permission-manager.ts` (checkPermission, requestPermission, handleDenial)

#### 1.3 Split `bidirectional-sync-core.ts` (470 → 2 files)

```bash
# Current file: src/infrastructure/sync/strategies/bidirectional-sync-core.ts (470 lines)
```

**Split into:**
```
src/infrastructure/sync/strategies/
├── bidirectional-sync-core.ts    (~235 lines) - Class, sync orchestration, listAllFiles
└── sync-operation-executor.ts    (~235 lines) - executeOperation, upload, download, delete
```

**Split Points:**
1. Lines 1-235: Keep class definition, sync method, file comparison
2. Lines 236-470: Extract to `sync-operation-executor.ts` (operation execution logic)

#### 1.4 Split `sync-engine-core.ts` (371 → 2 files)

```bash
# Current file: src/infrastructure/sync/core/sync-engine-core.ts (371 lines)
```

**Split into:**
```
src/infrastructure/sync/core/
├── sync-engine-core.ts    (~185 lines) - Class, sync, resolveConflict, watch
└── sync-engine-state.ts   (~185 lines) - State management, event subscriptions, cleanup
```

---

### Action 2: Migrate Remaining Consumers (Priority: P0)

**Current consumers using old paths:**

```bash
# Run this to find all old imports:
grep -rn "from '@/lib/filesync" src/ --include='*.ts*'
```

**Key file to update:**
```typescript
// src/lib/notes/note-file-sync.ts
// CHANGE FROM:
import type { FileSyncService } from '@/lib/filesync/file-sync-service';

// CHANGE TO:
import { SyncEngine } from '@/infrastructure/sync';
// Then update the class to use SyncEngine API instead of FileSyncService
```

**Migration Pattern:**
```typescript
// OLD API (FileSyncService):
await fileSyncService.readFile(path);
await fileSyncService.writeFile(path, content);

// NEW API (SyncEngine):
const syncEngine = useSyncEngine(); // Or inject via context
await syncEngine.adapters.fsa.readFile(path);
await syncEngine.adapters.fsa.writeFile(path, content);
```

---

### Action 3: Delete Old Files (Priority: P1 - After migration complete)

**Only after all consumers are migrated:**

```bash
# Delete these files:
rm src/lib/filesync/file-sync-service.ts
rm src/lib/filesync/ide-file-sync-service.ts
rm src/lib/filesync/notes-file-sync-service.ts
rm src/lib/filesync/knowledge-file-sync-service.ts
rm src/lib/filesync/study-file-sync-service.ts
rm src/lib/filesync/project-knowledge-sync.ts
rm src/lib/filesync/cross-workspace-file-references.ts
rm src/lib/filesync/index.ts

# Verify no broken imports:
pnpm typecheck
```

---

## 🔒 Validation Gates

### Gate 1: After God File Splitting
```bash
# All files must be ≤300 lines
wc -l src/infrastructure/sync/adapters/*.ts src/infrastructure/sync/strategies/*.ts src/infrastructure/sync/core/*.ts | sort -rn | head -5
# Expected: No file > 300 lines

# TypeScript must still pass
pnpm typecheck
# Expected: 0 errors
```

### Gate 2: After Consumer Migration
```bash
# Zero old imports
grep -r "from '@/lib/filesync" src/ --include='*.ts*' | wc -l
# Expected: 0

# TypeScript must pass
pnpm typecheck
# Expected: 0 errors
```

### Gate 3: After Old File Deletion
```bash
# Files don't exist
ls src/lib/filesync/*.ts 2>&1
# Expected: No such file or directory

# Build passes
pnpm build
# Expected: Exit 0
```

---

## ⏱️ Timeline

| Task | Estimated Hours | Priority |
|------|-----------------|----------|
| Split idb-adapter-core.ts | 1.5h | P0 |
| Split fsa-adapter-core.ts | 1.0h | P0 |
| Split bidirectional-sync-core.ts | 1.0h | P0 |
| Split sync-engine-core.ts | 0.5h | P0 |
| Migrate consumers | 2.0h | P0 |
| Delete old files | 0.5h | P1 |
| Run full test suite | 1.0h | P1 |
| **Total** | **7.5h** | |

---

## 📝 Checklist for Dev Agent

Before marking ARCH-01.1 as DONE:

- [ ] `idb-adapter-core.ts` ≤ 300 lines
- [ ] `fsa-adapter-core.ts` ≤ 300 lines
- [ ] `bidirectional-sync-core.ts` ≤ 300 lines
- [ ] `sync-engine-core.ts` ≤ 300 lines
- [ ] All barrel exports updated
- [ ] TypeScript compiles with 0 errors
- [ ] 0 imports from `@/lib/filesync`
- [ ] 8 old files deleted
- [ ] Build passes
- [ ] Tests pass

---

## 🤝 Handoff Instructions

**When Complete:**

1. Run all validation gates
2. Update sprint-status.yaml:
   ```yaml
   - id: ARCH-01.1
     status: DONE
     completed_at: "2026-01-0{X}T{HH:MM}:00+07:00"
   ```
3. Create completion report at `_bmad-output/sprint-artifacts/arch-01-1-completion-2026-01-0{X}.md`
4. Notify @bmad-core-bmad-master for next story assignment

---

## ⚠️ DO NOT PROCEED TO ARCH-01.2 UNTIL:

1. All 4 god files are split
2. All consumers migrated
3. All old files deleted
4. All validation gates pass

**REASON**: ARCH-01.2 (State Consolidation) depends on clean sync infrastructure. Proceeding with technical debt will compound issues.

---

*Redirect issued by @bmad-core-bmad-master*
*Timestamp: 2026-01-04T22:40:00+07:00*
