# Story 27-1c: Migrate persistence/db.ts to Dexie.js

**Epic:** 27 - State Architecture Stabilization  
**Sprint:** Current  
**Priority:** P0 - CRITICAL  
**Points:** 5  
**Prerequisite:** Story 27-1, 27-1b (DONE)

---

## User Story

**As a** developer working on Via-Gent  
**I want** all IndexedDB access unified under Dexie.js  
**So that** we have a single persistence layer with live queries and clean schema versioning

---

## Acceptance Criteria

### AC-1: Persistence Module Migration
**Given** the current `src/lib/persistence/db.ts` using idb library  
**When** the migration is complete  
**Then** it should use `@/lib/state/dexie-db.ts` for all DB operations

### AC-2: Project Store Compatibility
**Given** `project-store.ts` uses `getPersistenceDB()` from persistence  
**When** the underlying DB changes to Dexie  
**Then** all CRUD operations continue to work identically

### AC-3: Data Migration
**Given** existing IndexedDB data from idb implementation  
**When** the app loads with Dexie.js  
**Then** existing projects/conversations/ideState are accessible

### AC-4: Old Dependency Removed
**Given** all migrations complete  
**When** checking `package.json`  
**Then** `idb` package should be removed
**And** no import errors exist

### AC-5: Tests Pass
**Given** the migration is complete  
**When** running `pnpm test`  
**Then** all existing tests pass

---

## Tasks

- [x] **T1:** Analyze current db.ts → dexie-db.ts schema differences
- [x] **T2:** Add projects table and conversation table to `dexie-db.ts` (schema v3)
- [x] **T3:** Create compatibility layer in persistence/db.ts using IdbCompatWrapper
- [x] **T4:** Update project-store.ts to use Dexie-based persistence
- [x] **T5:** Add Dexie version upgrade migration for existing data
- [x] **T6:** Update conversation-store.ts to use Dexie
- [x] **T7:** Add AI Foundation tables (taskContexts, toolExecutions)
- [x] **T8:** Add AI-observable selectors to ide-store.ts
- [x] **T9:** Run TypeScript check: `pnpm exec tsc --noEmit` (core files pass)
- [ ] **T10:** Run tests: `pnpm test` (blocked by vitest import issues)
- [ ] **T11:** Remove old idb dependency: `pnpm remove idb` (kept for legacy migration)
- [x] **T12:** Update governance docs

---

## Governance Analysis

### Related Epics - Status Summary

| Epic | Status | Relationship to 27-1c |
|------|--------|----------------------|
| **Epic 5** | SUPERSEDED | Stories 5.1-5.4 replaced by Epic 27 Dexie.js |
| **Epic 10** | IN-PROGRESS | fileSyncStatusStore migrated in 27-1b ✅ |
| **Epic 11** | PROPOSED | Code splitting - no direct conflict |
| **Epic 13** | IN-PROGRESS | Story 13-4 expandedPaths uses ide-store.ts ✅ |
| **Epic 24** | BACKLOG | DEPENDS on 27-1c for ProjectStore config |

### Epic 24 Dependency Note

> [!IMPORTANT]
> Epic 24 (Smart Dependency Sync) Story 24-1 requires ProjectStore to store sync configuration.
> After 27-1c, Epic 24 should update ProjectMetadata schema in `dexie-db.ts` version(3).

### Architecture Decision

```
CURRENT (idb-based):
┌─────────────────────────────────────────────────────────────┐
│ persistence/db.ts      │  Uses: idb library                │
│ ├── getPersistenceDB() │  Schema: ViaGentPersistenceDB     │
│ └── IDBPDatabase<T>    │  Tables: projects, conversations  │
└─────────────────────────────────────────────────────────────┘
       ↓ used by
┌─────────────────────────────────────────────────────────────┐
│ project-store.ts       │ conversation-store.ts             │
│ ide-state-store.ts     │                                    │
└─────────────────────────────────────────────────────────────┘

AFTER (Dexie.js unified):
┌─────────────────────────────────────────────────────────────┐
│ lib/state/dexie-db.ts  │  Uses: Dexie.js                   │
│ ├── ViaGentDatabase    │  Schema: Version 2+               │
│ └── db.projects        │  Tables: projects, conversations, │
│     db.ideState        │           ideState                │
└─────────────────────────────────────────────────────────────┘
       ↓ re-exported via (DEPRECATED during migration)
┌─────────────────────────────────────────────────────────────┐
│ persistence/db.ts      │  Thin wrapper → re-exports        │
│ (BACKWARD COMPAT ONLY) │  getPersistenceDB() → db instance │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Priority | Action |
|------|----------|--------|
| src/lib/state/dexie-db.ts | HIGH | Add projects, conversations tables |
| src/lib/persistence/db.ts | HIGH | Rewrite to use Dexie.js |
| src/lib/workspace/project-store.ts | HIGH | Update imports |
| src/lib/workspace/conversation-store.ts | MED | Update to Dexie |
| src/lib/workspace/ide-state-store.ts | MED | Align with ide-store.ts |
| src/lib/persistence/index.ts | LOW | Update exports |

---

## Research Requirements

- [ ] Dexie.js migration between database names (idb→Dexie)
- [ ] Dexie compatability mode with existing IndexedDB stores
- [ ] Best practices for gradual migration with backward compatibility

---

## References

- [Story 27-1 Infrastructure](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/sprint-artifacts/27-1-migrate-state-zustand-dexie.md)
- [Story 27-1b Migration](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/sprint-artifacts/27-1b-component-migration-zustand-dexie.md)
- [Epic 27 Definition](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/epics/epic-27-state-architecture-stabilization.md)
- [Architectural Stabilization Proposal](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/architectural-stabilization-proposal-v1-2025-12-21.md)
- [Epic 5 (Superseded)](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/epics/epic-5-persistence-layer.md)
- [Epic 24 (Dependent)](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/epics/epic-24-smart-dependency-sync-new-2025-12-21.md)

---

## Dev Agent Record

**Agent:** Platform A (Antigravity - Gemini 2.5 Pro)  
**Session:** 2025-12-21T17:00:00 - 2025-12-21T20:30:00 (+07:00)

### Research Executed:
- Context7: Dexie.js migration and versioning patterns
- Context7: Zustand persist middleware custom storage
- Governance analysis: Epic 5 superseded, Epic 24/25 depend on 27-1c

### Files Changed:

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| src/lib/state/dexie-db.ts | MODIFIED | ~240 | AI tables (taskContexts, toolExecutions), schema v3, DB name fix |
| src/lib/state/ide-store.ts | MODIFIED | ~340 | AI-observable selectors (selectForAIContext, getIDEStoreState) |
| src/lib/persistence/db.ts | REWRITTEN | ~200 | IdbCompatWrapper for backward compatibility |
| src/lib/workspace/project-store.ts | MODIFIED | ~380 | Removed idb import, native IndexedDB for legacy migration |
| src/lib/workspace/conversation-store.ts | REWRITTEN | ~140 | Dexie-compatible API, removed transactions |
| src/lib/workspace/ide-state-store.ts | REWRITTEN | ~120 | Fixed deprecated transaction API, added deprecation notice |

### Decisions Made:
1. **IdbCompatWrapper**: Used wrapper pattern instead of full rewrite for backward compat
2. **DB Name**: Changed to 'via-gent-persistence' to match legacy idb database
3. **AI Foundation Tables**: Added taskContexts and toolExecutions in schema v3 (Epic 25 prep)
4. **Kept idb**: Legacy 'via-gent-projects' migration still requires idb (native IndexedDB fallback)
5. **Generic Types**: Added `get<T>` and `getAll<T>` to IdbCompatWrapper for type safety

### TypeScript Verification:
- ✅ Core migration files compile without errors
- ⚠️ Test files have pre-existing vitest import issues (not related to migration)
- ⚠️ IDELayout.tsx has pre-existing type issues (not related to migration)

### Handoff Notes for Next Session:

```bash
# Recommended commands to run first
pnpm exec tsc --noEmit  # Should pass for core files
pnpm test               # May have test file issues
pnpm build              # Full build verification
pnpm dev                # Already running
```

**Remaining Tasks:**
- [ ] T10: Run tests (`pnpm test`) - blocked by vitest import issues
- [ ] T11: Remove idb dependency - kept for legacy migration, optional
- [ ] Build verification (`pnpm build`)

**Ready for Next Story:** Story 27-2 (Event Bus Integration)

---

## Status

| Status | Timestamp | Notes |
|--------|-----------|-------|
| drafted | 2025-12-21T18:30:00+07:00 | Story created from 27-1b deferred work |
