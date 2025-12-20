# Story 13-2: Fix Auto-Sync on Project Load

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13  
**Priority:** P0 (Critical - Blocks validation step 3)  
**Points:** 3  
**Status:** done

---

## User Story

As a **user**,  
I want **files to automatically sync when I open a project**,  
So that **I don't have to manually click "Sync Now"**.

---

## Acceptance Criteria

### AC-13-2-1: Auto-sync triggers on project open
**Given** user navigates to workspace with a project  
**When** the WorkspaceProvider mounts with a valid directory handle  
**Then** sync automatically starts after WebContainer booted  
**And** SyncStatusIndicator shows "Syncing..."

### AC-13-2-2: Auto-sync waits for WebContainer boot
**Given** directory handle is available before WebContainer boots  
**When** boot completes  
**Then** sync starts immediately  
**And** sync does NOT start if WebContainer boot is still pending

### AC-13-2-3: Files available after auto-sync completes
**Given** auto-sync completed successfully  
**When** user runs `ls` in terminal  
**Then** project files are visible  
**And** `npm install` finds package.json

### AC-13-2-4: Auto-sync respects autoSync setting
**Given** user has autoSync disabled in settings  
**When** project opens  
**Then** auto-sync does NOT trigger  
**And** Manual sync button remains available

---

## Task Breakdown

### Research Tasks
- [x] T0-1: Analyze useInitialSync.ts implementation
- [x] T0-2: Identify race condition with syncManagerRef.current check
- [x] T0-3: Trace WebContainer boot flow in IDELayout.tsx
- [x] T0-4: Verify sync-manager.ts handles boot internally

### Implementation Tasks
- [x] T1: Add `isWebContainerBooted` state to WorkspaceContext
- [x] T2: Modify useInitialSync to wait for WebContainer boot
- [x] T3: Replace ref-based check with `initialSyncCompleted` state
- [x] T4: Update IDELayout to set boot status
- [x] T5: Run TypeScript check: `pnpm exec tsc --noEmit` ✅
- [x] T6: Run tests: `pnpm test` ✅ (160 tests pass)

---

## Dev Notes

### Root Cause
The auto-sync issue has TWO problems:

**Problem 1: Race Condition**
`useInitialSync.ts` line 25 condition:
```typescript
if (directoryHandle && !syncManagerRef.current && syncStatus === 'idle')
```
- Once `syncManagerRef.current` is set, this effect NEVER runs again
- If sync fails silently or directory changes, no retry

**Problem 2: No WebContainer Readiness Check**
- Sync can attempt before WebContainer is booted
- `sync-manager.ts` handles boot internally, but this creates hidden async dependencies
- User may see "idle" status while boot is still pending

### Architecture Pattern (from architecture.md)
```typescript
// Proposed fix: Add WebContainer readiness to context
interface WorkspaceState {
  // ... existing
  isWebContainerBooted: boolean;  // NEW: Track boot status
  initialSyncCompleted: boolean;  // NEW: Prevent duplicate syncs
}
```

### Key Discovery
Files mount at WebContainer root `/` via `mount(tree)`. The sync happens in `sync-manager.ts` which calls `boot()` internally if needed, but the UI has no visibility into this.

---

## Research Requirements

| Tool | Query | Finding |
|------|-------|---------|
| Codebase | useInitialSync.ts | Condition requires `!syncManagerRef.current` which prevents re-sync |
| Codebase | sync-manager.ts | `syncToWebContainer()` calls `boot()` if `!isBooted()` |
| Codebase | IDELayout.tsx | Separate `boot()` call in useEffect, no state tracking |
| Context7 | React useEffect dependencies | Effect runs on dependency changes only |

---

## References

- [sprint-change-proposal-v5](file:///_bmad-output/sprint-change-proposal-v5-2025-12-20.md#BUG-02)
- [architecture.md](file:///_bmad-output/architecture.md)
- [Story 13-1](file:///_bmad-output/sprint-artifacts/13-1-fix-terminal-working-directory.md)

---

## Dev Agent Record

**Agent:** Antigravity
**Session:** 2025-12-20
**Status:** ✅ COMPLETE

### Task Progress:
- [x] T0-1: Analyzed useInitialSync.ts implementation
- [x] T0-2: Identified race condition with syncManagerRef.current check
- [x] T0-3: Traced WebContainer boot flow in IDELayout.tsx
- [x] T0-4: Verified sync-manager.ts handles boot internally
- [x] T1-T6: All implementation tasks completed

### Research Executed:
- Codebase: useInitialSync.ts → Condition `!syncManagerRef.current` prevents re-sync
- Codebase: sync-manager.ts → Internal boot call at line 128-130
- Codebase: IDELayout.tsx → Separate boot useEffect at lines 252-265

### Files Changed:
| File | Action | Notes |
|------|--------|-------|
| src/lib/workspace/hooks/useInitialSync.ts | Modified | Fixed sync trigger to use state-based checks |
| src/lib/workspace/hooks/useWorkspaceState.ts | Modified | Added isWebContainerBooted, initialSyncCompleted state |
| src/lib/workspace/workspace-types.ts | Modified | Added new state and action types |
| src/lib/workspace/WorkspaceContext.tsx | Modified | Exposed setIsWebContainerBooted to context |
| src/components/layout/IDELayout.tsx | Modified | Calls setIsWebContainerBooted(true) on boot |
| src/lib/workspace/WorkspaceContext.test.tsx | Modified | Updated 2 tests + added 1 new test for boot behavior |
| src/lib/filesystem/__tests__/sync-executor.test.ts | Modified | Fixed pre-existing TypeScript type error |

### Decisions Made:
- Used state-based approach (`isWebContainerBooted`, `initialSyncCompleted`) instead of ref-based
- Kept `_refs` parameter in useInitialSync for API compatibility
- IDELayout sets boot status via context action after successful boot()

### Test Results:
- TypeScript: ✅ Pass (`pnpm exec tsc --noEmit`)
- Unit Tests: ✅ 160 tests pass
- WorkspaceContext tests: 11/11 pass (including 3 Story 13-2 specific tests)

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-20 | drafted | Story created from sprint-change-proposal-v5 |
| 2025-12-20 | ready-for-dev | Context XML created with research |
| 2025-12-20 | done | Implementation complete, all tests pass |
