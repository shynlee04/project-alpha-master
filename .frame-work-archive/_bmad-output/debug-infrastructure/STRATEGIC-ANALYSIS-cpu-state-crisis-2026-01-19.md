# Strategic Analysis: CPU & State Crisis

**Date:** 2026-01-19
**Analysis ID:** STRAT-2026-01-19-001
**Trigger:** User reports: folder listing repeats, state not remembered, CPU drains 10x, FileTree won't load

---

## Executive Summary

### The Crisis

Your application has entered a **state corruption cycle** where:

1. Project registration fails to persist → Same folder listed repeatedly
2. FSA handles not stored correctly → State not remembered (not even path)
3. IDE reselection defaults to My Documents → Wrong path loaded
4. Folder selection triggers infinite loop → CPU drains 10x
5. FileTree can't load anything → Sync/reactive loop blocking render

### Root Cause Analysis

| Layer | Issue | Impact |
|-------|-------|--------|
| **Persistence** | FSA handles NOT stored in Dexie | Projects forgotten on reload |
| **State Management** | 142 useEffect with callback deps | Infinite loops on state changes |
| **Sync Layer** | 4 duplicate sync implementations | Race conditions, conflicting updates |
| **Cross-Workspace** | 8 state leaks between IDE/Notes | Wrong data in wrong contexts |
| **Event Bus** | Dual event systems fighting | Conflicting state updates |

---

## Entity Map: What Controls Project State

### Level 1: Project Registration

```
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT REGISTRATION FLOW                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User selects folder                                             │
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ProjectWizard (src/presentation/components/project/)        ││
│  │ - ProjectDetailsStep.tsx ← FIXED: useRef pattern            ││
│  │ - WorkspaceSetupStep.tsx ← POTENTIAL: similar pattern       ││
│  │ - FileSetupStep.tsx                                         ││
│  │ - TemplateSelectionStep.tsx                                 ││
│  │ - ReviewStep.tsx                                            ││
│  └─────────────────────────────────────────────────────────────┘│
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ useProjectStore (src/infrastructure/persistence/stores/)    ││
│  │ - createProject()                                           ││
│  │ - saveProject()                                             ││
│  │ - loadProjects()                                            ││
│  │                                                               ││
│  │ GOD STORE: project-crud-slice.ts (377 lines)                ││
│  └─────────────────────────────────────────────────────────────┘│
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ DexieDB (src/infrastructure/persistence/dexie-db.ts)        ││
│  │ - projects table                                            ││
│  │ - FSA handles table (SHOULD store handle here)              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Level 2: FSA Handle Persistence

```
┌─────────────────────────────────────────────────────────────────┐
│  FSA HANDLE PERSISTENCE (THE MISSING LINK)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Problem: FSA handles stored in memory only → LOST on reload    │
│                                                                  │
│  Current (BROKEN):                                               │
│  ┌──────────────────┐                                           │
│  │ Memory Variable  │───❌ Lost on reload                       │
│  │ (not persisted)  │                                           │
│  └──────────────────┘                                           │
│                                                                  │
│  Required (WORKING):                                             │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ IndexedDB        │───▶│ Handle restored  │───▶ Works         │
│  │ (Dexie)          │    │ on app start     │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                  │
│  Files Involved:                                                 │
│  - src/infrastructure/persistence/stores/handle-storage.ts      │
│  - src/lib/filesystem/fsa-persistence.ts (ARCHIVED?)            │
│  - src/infrastructure/filesystem/fsa-storage-adapter.ts         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Level 3: IDE Entry & FileTree

```
┌─────────────────────────────────────────────────────────────────┐
│  IDE ENTRY FLOW                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User clicks project in hub                                      │
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Route: /ide.$projectId                                       ││
│  │                                                            ││
│  │ PROBLEM: projectId → but handle NOT loaded!                 ││
│  │ - Route params parsed                                       ││
│  │ - Store lookup: "what project?"                             ││
│  │ - FSA handle: MISSING (not persisted)                       ││
│  │ - FileSystemDirectoryHandle: undefined                      ││
│  └─────────────────────────────────────────────────────────────┘│
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ IDELayoutMain.tsx                                           ││
│  │ - scheduleIdeStatePersistence() ← CALLBACK IN DEPS! 🔴      ││
│  │ - useEffect with callback → potential loop                  ││
│  └─────────────────────────────────────────────────────────────┘│
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ FileTree.tsx (src/presentation/components/ide/FileTree/)    ││
│  │ - useFileTreeState() ← RESTORED: uses getAdapter()          ││
│  │ - useFileTreeActions()                                      ││
│  │ - useContextMenuActions()                                   ││
│  │                                                              ││
│  │ PROBLEM: If handle missing → getAdapter fails → LOOP        ││
│  │ Error: "getAdapter is not a function" → REVERTED FIX        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## The CPU Drain Mechanism

### How 10x CPU Drain Happens

```
┌─────────────────────────────────────────────────────────────────┐
│  INFINITE LOOP CHAIN                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: User clicks folder to select                           │
│          │                                                      │
│          ▼                                                      │
│  Step 2: FileTree requests file listing                         │
│          │                                                      │
│          ▼                                                      │
│  Step 3: FSA adapter called                                     │
│          │                                                      │
│          ▼                                                      │
│  Step 4: Handle missing! (not persisted)                        │
│          │                                                      │
│          ▼                                                      │
│  Step 5: State update triggers useEffect with callback deps     │
│          │    ◄─── IDELayoutMain.tsx:206                        ││
│          │        scheduleIdeStatePersistence in deps           ││
│          │                                                      │
│          ▼                                                      │
│  Step 6: useEffect fires (callback identity changed)            │
│          │                                                      │
│          ▼                                                      │
│  Step 7: State updated → re-render → callback identity changes  │
│          │    ◄─── Infinite loop triggered!                     ││
│          │                                                      │
│          ▼                                                      │
│  Step 8: CPU at 100%, UI frozen                                 │
│                                                                  │
│  CAUSE: 142 useEffect with callback deps across codebase        │
│         + 9 Zustand destructuring instances                     │
│         + Dual event bus conflict                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Folder Listing Repeats

### The Problem: Duplicate Project Registration

```
┌─────────────────────────────────────────────────────────────────┐
│  DUPLICATE REGISTRATION MECHANISM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User creates project "MyProject" at /Users/me/code/myproject   │
│        │                                                        │
│        ▼                                                        │
│  Project stored in Dexie:                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ id: "uuid-1"                                             │   │
│  │ name: "MyProject"                                        │   │
│  │ path: "/Users/me/code/myproject"                         │   │
│  │ handle: ??? (NOT STORED!)                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│        │                                                        │
│        ▼ (Page reload - handle lost!)                           │
│  User sees empty project list                                   │
│        │                                                        │
│        ▼ (User tries again - creates duplicate)                 │
│  New entry created:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ id: "uuid-2"                                             │   │
│  │ name: "MyProject"                                        │   │
│  │ path: "/Users/me/code/myproject" (same!)                 │   │
│  │ handle: ??? (still not stored!)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│        │                                                        │
│        ▼                                                        │
│  Result: Same folder listed multiple times!                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## All Files Involved in This Crisis

### Category A: Critical (Causing CPU Drain)

| File | Issue | Severity |
|------|-------|----------|
| `src/presentation/components/ide/IDELayoutMain.tsx:206` | `scheduleIdeStatePersistence` callback in deps | 🔴 CRITICAL |
| `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts:155` | Multiple setters in deps | 🔴 CRITICAL |
| `src/presentation/components/ide/FileTree/hooks/useWorkspaceActions.ts:136` | 6+ setters + navigate in deps | 🔴 CRITICAL |
| `src/presentation/components/project/ProjectDetailsStep.tsx:155` | `updateFormData` callback in deps | 🔴 FIXED |

### Category B: High (Causing State Issues)

| File | Issue | Severity |
|------|-------|----------|
| `src/infrastructure/persistence/stores/project-store.tsx` | God store (377 lines) | 🟡 HIGH |
| `src/infrastructure/persistence/stores/handle-storage.ts` | FSA handle NOT stored | 🟡 HIGH |
| `src/lib/filesystem/fsa-persistence.ts` | Archived? Not used? | 🟡 HIGH |

### Category C: Medium (Related Issues)

| File | Issue | Severity |
|------|-------|----------|
| `src/infrastructure/filesystem/StorageAdapterFactory.ts` | Recently modified | 🟢 MEDIUM |
| `src/presentation/components/ide/FileTree/FileTree.tsx` | Uses restored getAdapter() | 🟢 MEDIUM |
| `src/infrastructure/persistence/dexie-db.ts` | Schema may not include handles | 🟢 MEDIUM |

---

## Strategic Fix Plan

### Phase 1: CRITICAL (Now - 24 hours)

**Goal:** Stop CPU drain, restore basic functionality

| Priority | Action | Files | Time |
|----------|--------|-------|------|
| P0 | Fix IDELayoutMain.tsx callback loop | 1 file | 30 min |
| P0 | Fix useFileTreeActions.ts callback deps | 1 file | 30 min |
| P1 | Verify FSA handle storage exists | 1 file | 30 min |
| P1 | Add handle to Dexie schema if missing | 1 file | 30 min |

### Phase 2: HIGH (This Week)

**Goal:** Consolidate patterns, prevent recurrence

| Priority | Action | Files | Time |
|----------|--------|-------|------|
| P1 | Consolidate sync logic (4→1) | 5-10 files | 8 hours |
| P2 | Fix all Zustand destructuring (9 files) | 9 files | 4 hours |
| P2 | Fix remaining useEffect callbacks (10 files) | 10 files | 4 hours |

### Phase 3: MEDIUM (Architecture)

**Goal:** Clean architecture, prevent future issues

| Priority | Action | Files | Time |
|----------|--------|-------|------|
| P2 | Split god stores (2→8 slices) | 2 files | 16 hours |
| P3 | Remove dual event bus | 12 files | 8 hours |
| P3 | Add ESLint enforcement | 1 rule | 2 hours |

---

## Immediate Actions Required

### For You (Testing)

1. **Try project creation again** - The P0 fix should work now
2. **Monitor CPU** - Should NOT spike
3. **Check hub** - Should NOT show duplicate folders
4. **Report exactly what happens** - I need your observation

### For Me (If Fix Works)

1. **Proceed to P0 fix #2**: IDELayoutMain.tsx
2. **Proceed to P0 fix #3**: useFileTreeActions.ts
3. **Verify FSA handle storage**

### For Me (If Fix Fails)

1. **Return with findings**
2. **Hypothesis rejected**
3. **Investigate deeper** - May be multiple issues

---

## Hypothesis Testing Framework

### Current Hypothesis

```
HYPOTHESIS 1: Fixing ProjectDetailsStep.tsx (done) + IDELayoutMain.tsx 
              + useFileTreeActions.ts will stop CPU drain and restore
              project creation + FileTree loading.
```

### Test Conditions

| Test | Expected | If Not |
|------|----------|--------|
| Create project | Works, no freeze | ❌ Reject hypothesis |
| Hub shows project | Single entry | ❌ Reject hypothesis |
| Click project → IDE | Loads correct folder | ❌ Reject hypothesis |
| FileTree shows files | No CPU spike | ❌ Reject hypothesis |
| Reload page | Project remembered | ❌ Reject hypothesis |

### If All Tests Pass

→ Hypothesis CONFIRMED
→ Proceed to Phase 2 (consolidation)

### If Any Test Fails

→ Hypothesis REJECTED
→ Investigate root cause
→ Draft new hypothesis

---

## What I Need From You

1. **Test the current fix** (ProjectDetailsStep.tsx is fixed)
2. **Report exactly what happens**:
   - Can you create a project?
   - Does it appear once or multiple times?
   - Does IDE open?
   - Does FileTree show files?
   - Does CPU spike?

**Your observation is the ONLY way to validate the hypothesis.**

---

## Document References

| Document | Purpose |
|----------|---------|
| `comprehensive-state-pattern-audit-2026-01-19.md` | Full audit of 142 patterns |
| `progressive-refactoring-charter-2026-01-19.md` | Strategic framework |
| `past-feature-audit-2026-01-19.md` | Past working patterns |
| `current-gap-analysis-2026-01-19.md` | Current vs past gaps |

---

## Summary

### The Crisis in One Sentence

```
Your application has a cascade of issues: FSA handles not persisted,
142 useEffect callback patterns creating infinite loops, and duplicate
sync implementations fighting over state. The result is CPU drain,
forgotten projects, and broken FileTree.
```

### The Fix in One Sentence

```
Fix the critical callback patterns, ensure FSA handles are stored in
Dexie, consolidate sync logic, and establish proper architecture.
```

### Next Step

**Test project creation now and report what happens.**

---

*Document ID: STRAT-2026-01-19-001*
*Created: 2026-01-19*
*Status: Awaiting user test results*
