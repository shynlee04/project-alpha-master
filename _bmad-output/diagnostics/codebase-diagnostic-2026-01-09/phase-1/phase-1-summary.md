# Phase 1 Summary: User Journeys

## Critical Findings

### 1. 🚨 ROOT CAUSE: useLiveQuery Infinite Loop
**Location:** `lib/workspace/workspace-access-helper.tsx` (lines 230-238)

The `useWorkspaceAccess` hook was **completely rewritten** to use static mock data because `useLiveQuery` was causing "Maximum update depth exceeded" errors.

```typescript
// FIX-2026-01-08: COMPLETELY REMOVED useLiveQuery
// Root cause: Dexie's live query subscription conflicts with React's render cycle

// STATIC MOCK DATA - no database access
const allProjects: ProjectRecord[] = [];
const status: WorkspaceAccessStatus = 'no_projects';
```

**Impact:** Knowledge workspace is completely non-functional. Study workspace may be broken.

### 2. 🔴 P0: useWorkspaceAccess Non-Functional
| Status | Returns | Impact |
|--------|---------|--------|
| `allProjects` | Empty array | No projects detected |
| `status` | `'no_projects'` | Always shows empty state |
| `workspaceProjects` | Empty array | No workspace-bound projects |

### 3. 🟡 Phase 1 Detachments
- **Knowledge:** Shows placeholder "Coming in Phase 2"
- **IDE:** Uses simplified temp-project pattern (bypasses hook)
- **Notes:** Uses StableNotesWorkspace (bypasses hook)

---

## Journey Comparison Matrix

| Journey | Status | Loop Risk | Blocking? | Notes |
|---------|--------|-----------|-----------|-------|
| First-time user | ✅ Works | Low | Provider init | useLiveQuery disabled |
| Hub → Notes | ✅ Works | Low | None | StableNotesWorkspace |
| Hub → IDE | ✅ Works | Low | None | Temp project pattern |
| Hub → Knowledge | ❌ Broken | N/A | N/A | Placeholder UI |
| Hub → Study | ❓ Unknown | Unknown | Unknown | Needs verification |
| Project creation | ⚠️ Multiple | Medium | Some paths | Inconsistent patterns |
| Cross-workspace | ⚠️ Mixed | Low | None | Memory OK |

---

## Critical Bottlenecks Identified

| Bottleneck | Location | Severity | Fix Priority |
|------------|----------|----------|--------------|
| useLiveQuery loop | workspace-access-helper.tsx | 🔴 P0 | Immediate |
| useWorkspaceAccess broken | workspace-access-helper.tsx | 🔴 P0 | Immediate |
| Knowledge non-functional | knowledge.lazy.tsx | 🔴 P0 | After P0 fix |
| God component: MonacoEditor | MonacoEditor.tsx (769 lines) | 🟡 P1 | Short-term |
| Inconsistent project patterns | Multiple files | 🟡 P1 | Short-term |

---

## Root Cause Analysis

### Infinite Loop Chain
```
useWorkspaceAccess('knowledge')
    ↓ calls
useLiveQuery(() => db.projects.where('bindings.knowledge')...)
    ↓ returns
New reference on every query update
    ↓ causes
Component re-renders
    ↓ triggers
useLiveQuery re-runs
    ↓ results in
Maximum update depth exceeded
```

### Why This Happens
1. `useLiveQuery` returns new array reference on every update
2. Component uses result in state or effect
3. State/effect change triggers re-render
4. Re-render triggers `useLiveQuery` again
5. → Infinite loop

---

## Evidence Collected

### File: workspace-access-helper.tsx
- Lines 31-39: Unused imports (useEffect, useMemo, useState, useProjectStore, useLiveQuery, toast)
- Lines 230-238: Static mock data instead of real queries

### File: routes/knowledge.lazy.tsx
- Lines 7-14: Phase 1 detachment documentation
- Lines 115-151: Original implementation preserved (commented out)

### File: routes/notes.lazy.tsx
- Lines 60-82: StableNotesWorkspace with direct store access
- Lines 77: Hardcoded projectId = 'default-notes'

### File: routes/ide.tsx
- Lines 68-83: Phase 1 detachment documentation
- Lines 172-182: handleCreateTemp with temp project flow

---

## Priority Issues for Phase 2

### P0 (Immediate - Blocking)
1. **Fix useWorkspaceAccess hook**
   - Re-implement with proper default values
   - Use `useMemo` for query result stability
   - Add explicit `undefined` handling

2. **Fix useLiveQuery patterns**
   - Add default values: `?? []`
   - Wrap in `useMemo`
   - Check dependencies

### P1 (This Week)
1. **Re-attach Knowledge workspace**
   - Remove Phase 1 placeholder
   - Uncomment original implementation
   - Test with real Dexie data

2. **Verify Study workspace**
   - Check if functional or broken
   - Apply same fix pattern if needed

3. **Audit note-store.ts**
   - Check for `useLiveQuery` usage
   - Apply same fix pattern

### P2 (This Month)
1. **Split god components**
   - MonacoEditor.tsx (769 lines)
   - rag-store.ts (1,595 lines)
   - conversation-threads-store.ts (726 lines)

2. **Unify project creation patterns**
   - Remove hardcoded projectIds
   - Centralize project factory

---

## Phase 1 Complete ✅

**Output Files Created:**
- `journey-first-time-user.md` - Complete first-load analysis
- `journey-hub-to-notes.md` - Notes workspace pattern
- `journey-hub-to-ide.md` - IDE workspace pattern
- `journey-hub-to-knowledge.md` - Knowledge placeholder
- `journey-hub-to-study.md` - Study verification needed
- `journey-project-creation.md` - Project creation flows
- `journey-cross-workspace.md` - State transitions

**Next Phase:** Phase 2 - Data Flow Analysis (5 sub-agents)
