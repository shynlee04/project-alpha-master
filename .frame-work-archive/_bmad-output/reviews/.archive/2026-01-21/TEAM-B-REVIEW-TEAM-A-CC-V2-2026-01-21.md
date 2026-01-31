# TEAM B REVIEW: Team A Phase 2 Stories (CC-V2-A01, A02, A03)

**Date**: 2026-01-21T14:00:00+07:00
**Reviewer**: Team B (Storage & State Squad)
**Review Mode**: ZERO_TOLERANCE - Strict & Skeptical
**Governance Reference**: ADR-035, correct-course-v2-sprint-2026-01-20.yaml

---

## EXECUTIVE SUMMARY

| Story | Self-Reported | Team B Review | Status |
|-------|---------------|---------------|--------|
| CC-V2-A01 | COMPLETED | REVISION REQUIRED | ⚠️ PARTIAL |
| CC-V2-A02 | COMPLETED | REVISION REQUIRED | ⚠️ PARTIAL |
| CC-V2-A03 | COMPLETED | PASS | ✅ VERIFIED |

**Overall**: 1/3 stories fully verified. Two stories require revisions before Team B can proceed with dependent work.

---

## CC-V2-A01: Desktop /notes shows project picker

**Priority**: P1
**Self-Reported**: COMPLETED
**Review Verdict**: ⚠️ **REVISION REQUIRED**

### Acceptance Criteria Review

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Desktop /notes shows project picker or recent projects | ✅ PASS | [notes.lazy.tsx:119-137](src/routes/notes.lazy.tsx#L119-L137) - ProjectPickerDialog shown when `platform.canAccessFSA=true` |
| Mobile /notes auto-creates browser-default project | ✅ PASS | [notes.lazy.tsx:66-114](src/routes/notes.lazy.tsx#L66-L114) - Calls `getOrCreateBrowserModeProject()` when `canAccessFSA=false` |
| **Browser-mode ID changed to 'proj_browser-default'** | ❌ **FAIL** | [browser-mode.ts:23](src/lib/workspace/browser-mode.ts#L23) - Still has `'notes:browser-mode'` |
| TypeScript: 0 errors | ✅ PASS | No new errors introduced |

### Critical Failure

**File**: [src/lib/workspace/browser-mode.ts:23](src/lib/workspace/browser-mode.ts#L23)

```typescript
// CURRENT (WRONG):
export const BROWSER_MODE_PROJECT_ID = 'notes:browser-mode';

// REQUIRED (per ADR-035):
export const BROWSER_MODE_PROJECT_ID = 'proj_browser-default';
```

**Impact**:
- Contains colon (`:`) which breaks URL parsing per ADR-035
- Does not match `proj_*` format standard
- AC explicitly states: "Browser-mode ID changed to 'proj_browser-default'"

### Additional Concerns

1. **UX Friction**: Desktop users must pick from ProjectPickerDialog every time they visit `/notes`. There's no "last project" memory or auto-selection.

2. **Suspicious Pattern**: The comments in notes.lazy.tsx claim "CC-V2-A01: Desktop shows FSA project picker" but the ID migration requirement was seemingly ignored.

---

## CC-V2-A02: Consolidate WorkspaceId definitions

**Priority**: P2
**Self-Reported**: COMPLETED
**Review Verdict**: ⚠️ **REVISION REQUIRED**

### Acceptance Criteria Review

| Criterion | Status | Evidence |
|-----------|--------|----------|
| WorkspaceId defined in ONE file only | ❌ FAIL | Duplicate definition found |
| All other files import from canonical location | ⚠️ PARTIAL | 3 of 4 files compliant |
| TypeScript: 0 errors | ✅ PASS | No new errors introduced |

### Passes (Files correctly importing from canonical)

| File | Import Statement | Status |
|------|-----------------|--------|
| WorkspaceBindingToggle.tsx:21 | `import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-core-types'` | ✅ |
| WorkspaceBindingDialog.types.ts:12 | `import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-core-types'` | ✅ |
| useWorkspaceBindingState.ts:18 | `import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-core-types'` | ✅ |

### Failure (Duplicate definition)

**File**: [src/lib/events/cross-workspace-event-bus.ts:39](src/lib/events/cross-workspace-event-bus.ts#L39)

```typescript
// CURRENT (WRONG):
export type WorkspaceId = WorkspaceType;

// REQUIRED (per ADR-035):
import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-core-types';
```

**Rationale**: While `WorkspaceType` may have the same value, this creates a **NEW definition** not an import. Per ADR-035: "WorkspaceId is defined in ONE file only (dexie-db-core-types.ts)."

### Grep Output (Evidence of multiple definitions)

```
src/lib/events/cross-workspace-event-bus.ts:39:export type WorkspaceId = WorkspaceType;
src/infrastructure/persistence/dexie-db-core-types.ts:24:export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';
```

**Impact**: Violates ADR-035 single-source-of-truth rule for WorkspaceId.

---

## CC-V2-A03: Remove temp project from desktop IDE

**Priority**: P1
**Self-Reported**: COMPLETED
**Review Verdict**: ✅ **PASS**

### Acceptance Criteria Review

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Desktop /ide shows ONLY 'Select Project Folder' and 'Browse Projects' | ✅ PASS | Temp button conditional on `!platform.canAccessFSA` |
| No 'Quick IDE' or 'Temp Project' visible on desktop | ✅ PASS | Button only renders when FSA unavailable |
| TypeScript: 0 errors | ✅ PASS | No new errors introduced |

### Evidence

**File**: [src/routes/ide.tsx:144-153](src/routes/ide.tsx#L144-L153)

```typescript
{/* PLAT-001: Only show temp project on mobile/fallback (when FSA not available) */}
{!platform.canAccessFSA && (
  <button onClick={() => handleCreateTemp(navigate)}>
    ⚡ Quick IDE (Temp Project)
  </button>
)}
```

**Logic**: When `platform.canAccessFSA=true` (desktop Chrome 122+), the temp button is hidden.

---

## REVISION REQUESTED

Team A must address the following issues:

### 1. CC-V2-A01 Revision: Migrate browser-mode ID

**File**: `src/lib/workspace/browser-mode.ts`
**Line**: 23
**Change Required**:
```diff
- export const BROWSER_MODE_PROJECT_ID = 'notes:browser-mode';
+ export const BROWSER_MODE_PROJECT_ID = 'proj_browser-default';
```

### 2. CC-V2-A02 Revision: Import WorkspaceId from canonical location

**File**: `src/lib/events/cross-workspace-event-bus.ts`
**Line**: 30, 39
**Changes Required**:
```diff
import type { WorkspaceType } from '@/core/entities/Workspace';
+ import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-core-types';

- export type WorkspaceId = WorkspaceType;
+ // WorkspaceId imported from canonical location
```

**Note**: Any usage of `WorkspaceType` in this file for `workspaceId` should be updated to `WorkspaceId` from the canonical import.

---

## TEAM B DEPENDENCY BLOCKER

Team B's CC-V2-B04 (MarkdownSyncService) and CC-V2-B05 (browser-mode ID migration) are **BLOCKED** until CC-V2-A01 and CC-V2-A02 revisions are complete.

Specifically:
- CC-V2-B05 cannot proceed until browser-mode ID is migrated (part of CC-V2-A01's scope)
- CC-V2-B04 depends on CC-V2-A01's completion

---

## TYPESCRIPT VERIFICATION

**Command**: `pnpm tsc --noEmit`
**Result**: No new errors introduced by Team A's changes
**Note**: Pre-existing errors remain in:
- `db-consolidation-service.ts(140,34)`
- `_spike.ux-redesign-2026-01-14.tsx`
- Lazy route SSR config issues

---

**Reviewer Signature**: Team B (BMAD-EXT)
**Next Review**: After Team A revisions submitted
**Gatekeeper Status**: ❌ NOT APPROVED - Revisions required
