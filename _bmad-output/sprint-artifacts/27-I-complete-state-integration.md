# Story 27-I: Complete State Architecture Integration

**Epic:** [27 - State Architecture Stabilization](../epics/epic-27-state-architecture-stabilization.md)  
**Status:** `in-progress`  
**Priority:** P0 (Critical Blocker)  
**Platform:** Platform A  
**Created:** 2025-12-21T23:15:00+07:00

---

## User Story

**As a** developer  
**I want** all components fully integrated with Zustand/Dexie/EventBus  
**So that** the IDE functions correctly after the architecture migration and is ready for AI Foundation

---

## Background

Stories 27-1, 27-1b, 27-1c, and 27-2 created infrastructure:
- Zustand stores (`ide-store.ts`, `file-sync-status-store.ts`)
- Dexie.js database (`dexie-db.ts`, `dexie-storage.ts`)
- Event bus emissions in WebContainer manager and terminal adapter

However, **integration was not verified**:
- Some components may still reference old stores
- Old idb direct usage may still exist
- Event bus subscriptions not tested end-to-end
- Dead code not removed

This story completes the integration to unblock Epic 25 (AI Foundation).

---

## Acceptance Criteria

### AC-1: No Legacy Store References
**Given** the codebase  
**When** I search for `@tanstack/react-store` or `TanStackStore`  
**Then** zero results are found

### AC-2: No Direct idb Usage
**Given** the codebase  
**When** I search for `from 'idb'` (excluding Dexie wrapper)  
**Then** zero results in consumer files

### AC-3: All Components Use New Stores
**Given** FileTree, MonacoEditor, XTerminal, SyncStatusIndicator  
**When** they access state  
**Then** they use `useSyncStatusStore`, `useWorkspace`, or new Zustand hooks

### AC-4: Event Bus Integration Works
**Given** WebContainer boots  
**When** `container:booted` event is emitted  
**Then** subscribed components receive the event

### AC-5: State Persistence Works
**Given** the IDE with an open file  
**When** I reload the page  
**Then** the previously open file and expanded folders are restored

### AC-6: All Tests Pass
**Given** the test suite  
**When** I run `pnpm test`  
**Then** all tests pass (0 failures)

### AC-7: Build Succeeds
**Given** the project  
**When** I run `pnpm build`  
**Then** build completes without errors

### AC-8: Dead Code Removed
**Given** the codebase  
**When** audited with refactor-clean principles  
**Then** no dead code, unused exports, or deprecated files remain

---

## Tasks

### Discovery & Audit
- [ ] T1: Run grep to find all `@tanstack/react-store` references
- [ ] T2: Run grep to find all direct `idb` usage
- [ ] T3: Run grep to find all `TanStackStore` references
- [ ] T4: Identify components using old patterns

### Integration Fixes
- [ ] T5: Remove/update any files with old store patterns
- [ ] T6: Verify FileTree uses new sync status store
- [ ] T7: Verify MonacoEditor uses new stores if applicable
- [ ] T8: Verify XTerminal uses event bus
- [ ] T9: Verify WorkspaceContext wiring

### TDD Testing
- [ ] T10: Write integration test for store persistence
- [ ] T11: Write integration test for event bus round-trip
- [ ] T12: Write integration test for component wiring
- [ ] T13: Run all tests, iterate until 100% pass

### Cleanup
- [ ] T14: Remove dead code files
- [ ] T15: Update GOVERNANCE-INDEX.md
- [ ] T16: Update impact report with completion status

---

## Files to Audit

| File | Expected State | Verified |
|------|----------------|----------|
| `src/lib/workspace/ide-state-store.ts` | May be deprecated | [ ] |
| `src/lib/workspace/file-sync-status-store.ts` | Using Zustand | [ ] |
| `src/lib/state/ide-store.ts` | Main Zustand store | [ ] |
| `src/lib/state/dexie-db.ts` | Dexie.js database | [ ] |
| `src/lib/persistence/db.ts` | Uses Dexie wrapper | [ ] |
| `src/components/ide/FileTree/*.tsx` | Uses new stores | [ ] |
| `src/components/ide/MonacoEditor/*.tsx` | Uses new stores | [ ] |
| `src/components/ide/XTerminal/*.tsx` | Uses event bus | [ ] |
| `src/lib/workspace/WorkspaceContext.tsx` | Coordinates stores | [ ] |

---

## Dev Notes

### Research References
- [Epic 27 Impact Report](../handoffs/epic-27-integration-impact-report-2025-12-21.md)
- [TDD Cycle Workflow](/.windsurf/rules/commands/tdd-cycle.md)
- [Refactor Clean Workflow](/.agent/workflows/refactor-clean.md)

### Known Patterns
```typescript
// NEW PATTERN (Zustand)
import { useSyncStatusStore } from '@/lib/workspace';
const status = useSyncStatusStore(s => s.statuses[path]);

// OLD PATTERN (TanStack Store) - MUST NOT EXIST
import { useStore } from '@tanstack/react-store';
import { fileSyncStatusStore } from '@/lib/workspace';
```

---

## Dev Agent Record

**Agent:** Antigravity  
**Session:** 2025-12-21T23:15:00+07:00

### Progress:
- [/] Story created
- [ ] Discovery complete
- [ ] Integration fixes complete
- [ ] Tests passing
- [ ] Cleanup complete

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-21T23:15 | created | Initial story creation |
| 2025-12-21T23:15 | in-progress | Beginning discovery phase |
