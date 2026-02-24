# INFINITE LOOP & PERFORMANCE CRISIS - MASTER DIAGNOSIS & HEALING PLAN

**Version**: 1.0.0
**Date**: 2026-01-19
**Severity**: P0 - CRITICAL
**Status**: DIAGNOSIS_COMPLETE | HEALING_REQUIRED
**Root Cause Category**: State Management Architecture Failure

---

## EXECUTIVE SUMMARY

When a user selects a folder in the project creation wizard:
- **CPU Usage**: Spikes to 1000% (10x normal)
- **Symptom**: Folder listing repeats infinitely
- **Root Cause**: Multiple infinite loop sources cascading into each other
- **Impact**: IDE unusable, projects cannot be created/loaded properly

This document provides a comprehensive diagnosis and healing roadmap.

---

## PART A: ROOT CAUSE ANALYSIS

### 1. PRIMARY CAUSE: Missing Handle Persistence

**File**: `src/presentation/components/project/ProjectCreationWizard.tsx`
**Line**: 279-321 (handleCreate function)

**Problem**:
```
When project is created:
1. Wizard stores storageMetadata (serializable info) ✅
2. BUT actual FileSystemDirectoryHandle is NEVER persisted to fsaHandles table ❌

When IDE loads:
1. Queries Dexie projects table
2. Gets project WITHOUT actual handle
3. projectMetadata.fsaHandle is undefined
4. Gateway creation fails (IDELayoutMain.tsx:210-211)
5. FileTree cannot list files
6. State sync loops fire repeatedly trying to sync non-existent state
```

**Evidence**:
```
HubHomePage.tsx:234  ✅ Correctly calls handlePersistenceService.persistHandle()
ProjectCreationWizard.tsx  ❌ Missing this call
```

### 2. SECONDARY CAUSE: useEffect Chain Cascading

**File**: `src/presentation/components/layout/IDELayoutMain.tsx`
**Lines**: 200-206

**Problem**:
```typescript
// 5 SEPARATE useEffects that trigger EACH OTHER
useEffect(() => { openFilePathsRef.current = openFilePaths; }, [...]);
useEffect(() => { activeFilePathRef.current = activeFilePath; }, [...]);
useEffect(() => { terminalTabRef.current = terminalTab; }, [...]);
useEffect(() => { chatVisibleRef.current = chatVisible; }, [...]);
useEffect(() => { scheduleIdeStatePersistence(250); }, [scheduleIdeStatePersistence, openFilePathsKey, activeFilePath, terminalTab, chatVisible]);
//                                                               ^^^^^^^^^^^^^^^^^^^^^^^
//                                                               Triggers on ANY state change
```

**Flow of Cascade**:
```
State A changes → useEffect A runs → setState B → useEffect B runs → setState C → ...
```

### 3. TERTIARY CAUSE: Callback Dependencies in useEffect

**Count**: 142+ instances across codebase

**Problem Pattern**:
```typescript
const updateFormData = useCallback((key, value) => { ... }, [...]);

useEffect(() => {
  if (condition) updateFormData(key, value);
}, [updateFormData]); // ❌ updateFormData reference changes on every render
```

**Why This Loops**:
1. Component renders
2. useCallback memo changes (new function reference)
3. useEffect detects dependency change
4. Effect runs → may call setState
5. Component re-renders
6. Repeat

### 4. QUATERNARY CAUSE: Zustand Destructuring

**Count**: 9+ instances

**Problem Pattern**:
```typescript
// ❌ BAD: Creates new object every render
const { a, b, c } = useStore(s => ({ a: s.a, b: s.b, c: s.c }));

// React re-renders when object reference changes (even if values are same)
```

---

## PART B: SYSTEMATIC DIAGNOSIS BY LAYER

### LAYER 1: WIZARD & PROJECT CREATION

| File | Issue | Severity | Lines | Fix Required |
|------|-------|----------|-------|--------------|
| `ProjectCreationWizard.tsx` | Missing persistHandle call | P0 | 279-321 | Add handlePersistenceService.persistHandle() |
| `ProjectCreationWizard.tsx` | Callback deps in useEffect | P1 | 176-194 | Ref-stabilize keyboard handler |
| `ProjectDetailsStep.tsx` | ✅ Already fixed | - | - | - |
| `WorkspaceSetupStep.tsx` | Callback deps | P1 | TBD | Ref-stabilize all setters |
| `AgentSelectionStep.tsx` | Callback deps | P1 | TBD | Ref-stabilize all setters |
| `FileSetupStep.tsx` | Callback deps | P1 | TBD | Ref-stabilize all setters |
| `ReviewStep.tsx` | Callback deps | P1 | TBD | Ref-stabilize all setters |

### LAYER 2: IDE LAYOUT & STATE MANAGEMENT

| File | Issue | Severity | Lines | Fix Required |
|------|-------|----------|-------|--------------|
| `IDELayoutMain.tsx` | useEffect chain cascade | P0 | 200-206 | Single consolidated useEffect |
| `IDELayoutMain.tsx` | Gateway init deps | P1 | 209-226 | Ref-stabilize projectMetadata |
| `useIdeStatePersistence.ts` | Multiple useEffect | P1 | 122-142 | Ref-stabilize setProjectId |
| `useIDELayoutWorkspaceState.ts` | useMemo deps | P2 | 55-63 | Use stable refs |
| `useIDELayoutFileState.ts` | TBD | P1 | TBD | Full analysis |

### LAYER 3: ZUSTAND STORE PATTERNS

| File | Issue | Severity | Count | Fix Required |
|------|-------|----------|-------|--------------|
| Multiple files | Destructuring pattern | P1 | 9 | Replace with useShallow or individual selectors |
| `useIDEStore` | Store structure | P2 | - | Audit store for unnecessary derived state |
| `useProjectStore` | Store structure | P2 | - | Audit store for unnecessary derived state |
| `useWorkspaceSync` | Context selector | P1 | - | Use useShallow pattern |

### LAYER 4: FILE SYSTEM OPERATIONS

| File | Issue | Severity | Lines | Fix Required |
|------|-------|----------|-------|--------------|
| `FileTree.tsx` | useWorkspaceSync deps | P1 | TBD | Analyze callback deps |
| `handle-persistence.ts` | Logic correct | - | - | Already correct |
| `fsa-storage-adapter.ts` | TBD | P1 | TBD | Full analysis |
| `storage-gateway.interface.ts` | TBD | P1 | TBD | Full analysis |

### LAYER 5: CROSS-WORKSPACE STATE

| File | Issue | Severity | Lines | Fix Required |
|------|-------|----------|-------|--------------|
| `unified-workspace-context.ts` | Large context | P2 | All | Consider splitting |
| `useAllCrossWorkspaceEvents` | Disabled (correctly) | P1 | - | Needs proper fix before re-enabling |

---

## PART C: COMPLETE INVENTORY OF PROBLEMATIC PATTERNS

### C.1: useEffect with Callback Dependencies (142+ instances)

**Search Pattern**: `useEffect\([^)]*(?:updateFormData|set[A-Z]\w+|handle\w+|on\w+)\)`

**Files Requiring Fix** (priority order):
1. ✅ `ProjectDetailsStep.tsx` - ALREADY FIXED
2. `ProjectCreationWizard.tsx` - Keyboard navigation handler
3. `WorkspaceSetupStep.tsx` - All setter callbacks
4. `AgentSelectionStep.tsx` - All setter callbacks
5. `FileSetupStep.tsx` - All setter callbacks
6. `ReviewStep.tsx` - All setter callbacks
7. `IDELayoutMain.tsx` - Multiple effects
8. `useIDEStateRestoration.ts` - Multiple effects
9. `FileTree.tsx` - Multiple effects
10. `IDEHeaderBar.tsx` - Multiple effects
11. `MonacoEditor.tsx` - Multiple effects
12. `AgentChatPanel.tsx` - Multiple effects
13. **...and 130 more files**

### C.2: Zustand Destructuring (9+ instances)

**Search Pattern**: `const \{[^}]+\} = useStore\(s => \(\{[^}]+\}\)\)`

**Files Requiring Fix**:
1. `AgentChatPanel.tsx` - TBD
2. `IDEMobileLayout.tsx` - Already uses useShallow ✅
3. `FileTree.tsx` - TBD
4. `MonacoEditorWithWatcher.tsx` - TBD
5. `NoteSidebarChat.tsx` - TBD
6. `ProjectFilesPanel.tsx` - TBD
7. **...and 3 more files**

### C.3: useMemo with Mutable Refs (50+ instances)

**Search Pattern**: `useMemo\(\(\) => \{[^}]*(?:Ref|current)[^}]*\}, \[`

**Files Requiring Fix**:
1. `useIDELayoutWorkspaceState.ts:55-63` - fileTools, terminalTools
2. Multiple hook files

---

## PART D: HEALING REQUIREMENTS & ACCEPTANCE CRITERIA

### D.1: Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| FR-01 | Folder selection must persist handle | After selecting folder, `fsaHandles` table in Dexie contains record with actual handle |
| FR-02 | IDE must load project correctly | Navigate to `/ide/$projectId` → `projectMetadata.fsaHandle` is not undefined |
| FR-03 | FileTree must list files | No repeated/looping folder listings |
| FR-04 | State must be stable | No infinite re-renders on project load |
| FR-05 | No CPU spikes | CPU usage normal (<5% idle, <30% active) |

### D.2: Non-Functional Requirements

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-01 | Performance | State changes complete in <16ms (60fps) |
| NFR-02 | Memory | No memory leaks from unbounded useEffect subscriptions |
| NFR-03 | Maintainability | All useEffect deps arrays are stable (no callback deps) |
| NFR-04 | Type Safety | `pnpm tsc --noEmit` passes with 0 errors |
| NFR-05 | Test Coverage | All modified paths have unit tests |

### D.3: Edge Cases

| ID | Edge Case | Expected Behavior |
|----|-----------|-------------------|
| EC-01 | User cancels folder picker | Project creation cancelled, no error |
| EC-02 | Handle permission revoked | User prompted to re-select folder |
| EC-03 | Browser doesn't support FSA | IndexedDB storage used automatically |
| EC-04 | Chrome < 122 | Metadata-only persistence, user prompt on restore |
| EC-05 | Multiple rapid state changes | Debounced/batched updates, no race conditions |
| EC-06 | Project switch mid-operation | Old operation cancelled, new operation starts |
| EC-07 | Tab switched away during sync | Sync continues, state preserved |
| EC-08 | Network loss during sync | Error shown, retry available |
| EC-09 | Large file trees (>10k files) | Virtualized rendering, chunked loading |
| EC-10 | Concurrent file modifications | Conflict resolution, last-write-wins |

---

## PART E: IMPLEMENTATION SEQUENCING

### PHASE 1: CRITICAL PATH (Day 1)

**Goal**: Fix immediate crash/infinite loop

| Task | File | Change | Risk |
|------|------|--------|------|
| 1.1 | `ProjectCreationWizard.tsx` | Add persistHandle() call | Low |
| 1.2 | `IDELayoutMain.tsx` | Consolidate 5 useEffects to 1 | Medium |
| 1.3 | Validation | Run tsc + vitest | - |

**Exit Criteria for Phase 1**:
- [ ] Folder selection → IDE load works
- [ ] No infinite loops on project open
- [ ] tsc passes
- [ ] vitest passes

### PHASE 2: STATE STABILIZATION (Day 2)

**Goal**: Fix all callback dependency issues

| Task | Files | Change | Risk |
|------|-------|--------|------|
| 2.1 | Wizard step files (5) | Ref-stabilize all setters | Low |
| 2.2 | IDE layout files (5) | Ref-stabilize all callbacks | Medium |
| 2.3 | Hook files (10) | Ref-stabilize all callbacks | Medium |
| 2.4 | Component files (20) | Ref-stabilize all callbacks | Medium |

**Exit Criteria for Phase 2**:
- [ ] 0 callback dependencies in useEffect
- [ ] No re-render cascades
- [ ] tsc passes
- [ ] vitest passes

### PHASE 3: ZUSTAND CLEANUP (Day 3)

**Goal**: Fix all destructuring patterns

| Task | Files | Change | Risk |
|------|-------|--------|------|
| 3.1 | All 9 files | Replace destructuring with useShallow | Low |
| 3.2 | All stores | Audit for unnecessary derived state | Medium |

**Exit Criteria for Phase 3**:
- [ ] 0 destructuring patterns
- [ ] Store selectors optimized
- [ ] tsc passes
- [ ] vitest passes

### PHASE 4: COMPREHENSIVE AUDIT (Day 4-5)

**Goal**: Verify all patterns are fixed

| Task | Action | Criteria |
|------|--------|----------|
| 4.1 | Grep search for callback deps | 0 results |
| 4.2 | Grep search for destructuring | 0 results |
| 4.3 | Grep search for chained useEffects | 0 results |
| 4.4 | Performance profiling | <5% CPU idle |
| 4.5 | Memory profiling | No leaks after 10 reloads |

**Exit Criteria for Phase 4**:
- [ ] All grep patterns return 0
- [ ] Performance meets NFRs
- [ ] No regressions

---

## PART F: DETAILED CHECKLISTS

### F.1: ProjectCreationWizard.tsx Checklist

- [ ] Import `handlePersistenceService` from `@/infrastructure/filesystem/handle-persistence`
- [ ] In `handleCreate()`, after `const projectId = await createProject(projectInput);`
- [ ] Add: `if (formData.storageType === 'fsa' && formData.fsaHandle) { await handlePersistenceService.persistHandle(projectId, formData.fsaHandle, 'ide'); }`
- [ ] Add: Import `serializeHandle` (already imported)
- [ ] Verify no duplicate handle storage
- [ ] Test: Create project → Check Dexie `fsaHandles` table has record

### F.2: IDELayoutMain.tsx Checklist

- [ ] Remove lines 200-206 (5 separate useEffects)
- [ ] Add single consolidated useEffect:
  ```typescript
  useEffect(() => {
    openFilePathsRef.current = openFilePaths;
    activeFilePathRef.current = activeFilePath ?? null;
    terminalTabRef.current = terminalTab;
    chatVisibleRef.current = chatVisible;
    // No scheduleIdeStatePersistence - Zustand auto-saves
  }, [openFilePaths, activeFilePath, terminalTab, chatVisible]);
  ```
- [ ] Remove or make no-op: `scheduleIdeStatePersistence` function
- [ ] Verify all refs are initialized before use
- [ ] Test: Open IDE → No cascading re-renders

### F.3: useEffect Callback Pattern Fix

For EACH useEffect with callback dependency:

**Pattern Detection**:
```typescript
// ❌ BAD
useEffect(() => {
  if (condition) callback(...args);
}, [callback]);

// ✅ GOOD
const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback; }, [callback]);

useEffect(() => {
  if (condition) callbackRef.current(...args);
}, [condition, /* other stable deps */]);
```

**Files to Process**:
1. `ProjectCreationWizard.tsx` - keyboard handler (line 176-194)
2. All wizard step files
3. All hook files
4. All component files

### F.4: Zustand Destructuring Pattern Fix

**Pattern Detection**:
```typescript
// ❌ BAD
const { a, b, c } = useStore(s => ({ a: s.a, b: s.b, c: s.c }));

// ✅ GOOD - Option 1: useShallow
import { useShallow } from 'zustand/react/shallow';
const { a, b, c } = useStore(useShallow(s => ({ a: s.a, b: s.b, c: s.c })));

// ✅ GOOD - Option 2: Individual selectors
const a = useStore(s => s.a);
const b = useStore(s => s.b);
const c = useStore(s => s.c);
```

**Files to Process**:
1. Find all instances with grep
2. Apply fix pattern
3. Verify no new object creation on render

### F.5: useMemo with Refs Pattern Fix

**Pattern Detection**:
```typescript
// ❌ BAD
const tools = useMemo(() => {
  if (!ref.current) return null;
  return createTools(ref.current);
}, [ref.current]); // ref.current is mutable!

// ✅ GOOD
const tools = useMemo(() => {
  if (!ref.current) return null;
  return createTools(ref.current);
}, [ref]); // Use ref object, not .current
```

**Files to Process**:
1. `useIDELayoutWorkspaceState.ts` - fileTools, terminalTools
2. All hook files with useMemo

---

## PART G: VERIFICATION COMMANDS

### G.1: TypeScript Validation
```bash
pnpm tsc --noEmit
# Expected: 0 errors
```

### G.2: Test Suite
```bash
pnpm vitest run
# Expected: 0 failures
```

### G.3: Pattern Detection (Post-Fix)

**Callback deps**:
```bash
grep -r "useEffect.*updateFormData\|useEffect.*set[A-Z]\w\+" src/ --include="*.tsx" --include="*.ts" | wc -l
# Expected: 0
```

**Zustand destructuring**:
```bash
grep -r "useStore.*s => ({.*})" src/ --include="*.tsx" --include="*.ts" | grep -v "useShallow" | wc -l
# Expected: 0
```

**Chained useEffects**:
```bash
grep -r "useEffect.*useEffect" src/ --include="*.tsx" | wc -l
# Expected: 0 (or very few, reviewed)
```

### G.4: Performance Validation

**CPU Profile**:
1. Open DevTools Performance tab
2. Record while loading project
3. Verify no event loop blocking >50ms
4. Verify no infinite component render loops

**Memory Profile**:
1. Open DevTools Memory tab
2. Take heap snapshot
3. Reload page 10 times
4. Take another snapshot
5. Verify no retained objects growing

---

## PART H: ROLLBACK PROCEDURES

If healing causes regressions:

### H.1: Emergency Rollback
```bash
git checkout HEAD~1 -- src/presentation/components/project/ProjectCreationWizard.tsx
git checkout HEAD~1 -- src/presentation/components/layout/IDELayoutMain.tsx
pnpm tsc --noEmit
```

### H.2: Selective Revert
```bash
# Revert specific lines
git diff src/presentation/components/project/ProjectCreationWizard.tsx
# Copy-paste original lines back
```

### H.3: Feature Flagging
- Wrap fixes behind feature flags
- Enable after testing passes
- Disable if issues detected

---

## PART I: DEPENDENCIES & BLOCKERS

### I.1: External Dependencies
| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| Zustand | v5 | State management | ✅ OK |
| React | 19 | UI framework | ✅ OK |
| Dexie.js | v3 | IndexedDB wrapper | ✅ OK |
| TanStack Router | v1 | Routing | ✅ OK |

### I.2: Internal Blockers
| Blocker | Description | Resolution |
|---------|-------------|------------|
| None identified | - | - |

### I.3: Prerequisites
| Prerequisite | Status |
|--------------|--------|
| Latest main branch | ✅ Ready |
| No uncommitted changes | ⚠️ Verify |
| Tests passing on main | ✅ Required |

---

## PART J: RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regression in IDE load | Medium | High | Thorough testing, feature flags |
| State corruption | Low | High | Rollback procedure, backups |
| Performance degradation | Low | Medium | Performance profiling, benchmarks |
| Test failures | Medium | Low | Update tests with fixes |

---

## PART K: SUCCESS METRICS

### K.1: Quantitative Metrics
| Metric | Before | Target | Measure |
|--------|--------|--------|---------|
| CPU usage (project load) | 1000% | <30% | DevTools Performance |
| Folder listing repeats | ∞ | 1 | Manual verification |
| useEffect callback deps | 142 | 0 | grep count |
| Zustand destructuring | 9 | 0 | grep count |
| TypeScript errors | 0 | 0 | pnpm tsc |
| Test failures | 0 | 0 | pnpm vitest |

### K.2: Qualitative Metrics
| Metric | Before | Target |
|--------|--------|--------|
| User experience | Broken | Smooth |
| Developer confidence | Low | High |
| Code maintainability | Poor | Excellent |
| Performance reliability | Unreliable | Predictable |

---

## PART L: EXECUTION TRACKING

### L.1: Daily Checkpoints
| Day | Focus | Checkpoint |
|-----|-------|------------|
| 1 | Critical path | Phase 1 exit criteria met |
| 2 | State stabilization | Phase 2 exit criteria met |
| 3 | Zustand cleanup | Phase 3 exit criteria met |
| 4-5 | Comprehensive audit | All criteria met |

### L.2: Sign-off Required
| Role | Sign-off for |
|------|--------------|
| Dev Lead | Phase 1 completion |
| QA Lead | Phase 2 completion |
| Architect | Phase 3 completion |
| Product Owner | Full healing completion |

---

## PART M: APPENDIX

### M.1: Related Documentation
- `ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- `bmm-workflow-status.yaml`
- `AGENTS.md` (governance rules)

### M.2: Key Files Reference
| File | Purpose |
|------|---------|
| `src/presentation/components/project/ProjectCreationWizard.tsx` | Main fix target |
| `src/presentation/components/layout/IDELayoutMain.tsx` | Main fix target |
| `src/infrastructure/filesystem/handle-persistence.ts` | Handle persistence logic |
| `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | State context |

### M.3: Glossary
| Term | Definition |
|------|------------|
| Callback dependency | Function reference in useEffect deps array |
| Destructuring pattern | Creating new object from store selector |
| Ref stabilization | Using useRef to maintain stable function reference |
| Zustand persist middleware | Automatic state persistence to IndexedDB |

---

## META-INFORMATION

| Field | Value |
|-------|-------|
| **Master Plan Version** | 1.0.0 |
| **Created** | 2026-01-19 |
| **Last Updated** | 2026-01-19 |
| **Author** | Orchestrator (BMAD-EXT) |
| **Classification** | Internal - Development |
| **Applicable Phase** | All Phases |

---

## STATUS LOG

| Date | Version | Action | Author |
|------|---------|--------|--------|
| 2026-01-19 | 1.0.0 | Initial diagnosis | Orchestrator |
| 2026-01-19 | 1.0.0 | Healing plan | Orchestrator |

---

**END OF DOCUMENT**

To be continued by execution team. Loop until 100% healing achieved.
