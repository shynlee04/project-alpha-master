# EPIC-INF-02: Fix Hooks Error
## Phase 1 - Fix Notes Workspace Crash to Unblock User Journey

**Date**: 2026-01-15
**Status**: READY FOR IMPLEMENTATION
**Team**: Team A (Identity & Routing Squad)
**Priority**: P0-CRITICAL
**Effort**: 1 hour
**ADR References**: ADR-034 D12, ADR-035 Entity Model

---

## Epic Overview

**Purpose**: Fix Notes workspace crash ("Rendered fewer hooks than expected" error) to unblock user journey.

**Problem**: `useLiveQuery` hook in `NotesWorkspaceDefault` (notes.lazy.tsx) causes React hooks error when called conditionally inside useEffect.

**Root Cause**: Conditional hook usage violates React rules - hooks must be called at top level of component, not inside conditional branches or useEffect callbacks.

**Impact**: 
- ❌ Desktop users cannot access Notes workspace
- ❌ Mobile users cannot access Notes workspace
- ❌ Users see crash screen instead of project picker
- ❌ No error feedback shown to user

**Key Findings from Deep Analysis**:
- Infection Point #1 (Part 1.2.1): Hooks error in /notes route
- ADR-034 D12 Violation: Route loader should use Dexie directly, not Zustand
- ADR-035 Entity Model: Proper Dexie React Hooks usage required

---

## Stories

### Story INF-02-01: Remove useLiveQuery Hook from notes.lazy.tsx

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 20 minutes

**Description**:
Remove the conditional `useLiveQuery` hook that causes "Rendered fewer hooks than expected" error.

**Root Cause**:
```typescript
// ❌ WRONG: Hook called conditionally inside useEffect
useEffect(() => {
  const platform = getPlatformContract();
  if (platform.canAccessFSA) {
    const fsaProjects = useLiveQuery(async () => { ... }, [platform.canAccessFSA]);
  }
}, [platform.canAccessFSA]);
```

**Solution**:
Replace conditional `useLiveQuery` with custom hook that always calls React hooks at top level.

**Tasks**:
- [ ] Read current notes.lazy.tsx implementation
- [ ] Identify all conditional hook usages
- [ ] Replace with custom hook pattern
- [ ] Ensure all hooks called at top level
- [ ] Test Notes workspace on desktop
- [ ] Test Notes workspace on mobile
- [ ] Verify no console errors

**Acceptance Criteria**:
- ✅ No hooks error when loading /notes route
- ✅ Desktop shows project picker (not crash)
- ✅ Mobile auto-loads browser-mode project
- ✅ All React hooks called at component top level
- ✅ No console errors
- ✅ TypeScript: 0 errors

**Files to Modify**:
| File | Change |
|-------|---------|
| `src/routes/notes.lazy.tsx` | Remove useLiveQuery hook, add custom hook |

**Expected Behavior** (after fix):
```typescript
// ✅ CORRECT: Hook always called at top level
function NotesWorkspaceDefault() {
  const platform = getPlatformContract();
  const fsaProjects = useFSAProjects(); // Custom hook, no conditional
  
  useEffect(() => {
    // Desktop: Show project picker
    if (platform.canAccessFSA) {
      setShowPicker(true);
      return;
    }
    
    // Mobile: Auto-load browser-mode
    import('@/lib/workspace/browser-mode').then(
      async ({ getOrCreateBrowserModeProject }) => {
        const browserProject = await getOrCreateBrowserModeProject();
        if (browserProject) {
          setProject(browserProject);
        }
      }
    );
  }, [platform.canAccessFSA, fsaProjects]);
  
  // Desktop: Show project picker dialog
  if (platform.canAccessFSA && showPicker) {
    return <ProjectPickerDialog open={true} ... />;
  }
  
  // Mobile: Show loading or NotesPage
  if (!project) {
    return <LoadingSpinner />;
  }
  
  return (
    <ProjectProvider project={project} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
```

---

### Story INF-02-02: Create useFSAProjects() Custom Hook

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 20 minutes

**Description**:
Create custom hook `useFSAProjects()` that properly uses `useLiveQuery` without conditional calls.

**Tasks**:
- [ ] Create useFSAProjects() hook file
- [ ] Use useLiveQuery() at top level (no conditional)
- [ ] Filter results in useMemo (not in hook)
- [ ] Export hook for notes.lazy.tsx
- [ ] Add TypeScript types
- [ ] Add error handling
- [ ] Add unit test stub

**Acceptance Criteria**:
- ✅ Hook always calls useLiveQuery at top level
- ✅ Filtering happens in useMemo (deferred)
- ✅ No conditional hook calls
- ✅ TypeScript: 0 errors
- ✅ Export available for notes.lazy.tsx
- ✅ Error handling for failed queries

**Files to Create**:
| File | Purpose |
|-------|---------|
| `src/infrastructure/persistence/stores/project/use-fsa-projects.ts` | Custom hook implementation |

**Implementation Pattern**:
```typescript
// src/infrastructure/persistence/stores/project/use-fsa-projects.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';
import db from '@/infrastructure/persistence/dexie-db';

export function useFSAProjects() {
  const platform = getPlatformContract();
  
  // ✅ ALWAYS call hook at top level (no conditional)
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);
  
  // ✅ Filter in useMemo (deferred, not in hook)
  const fsaProjects = useMemo(() => {
    if (!platform.canAccessFSA) return [];
    
    return allProjects?.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    ) ?? [];
  }, [allProjects, platform.canAccessFSA]);
  
  return fsaProjects;
}
```

---

### Story INF-02-03: Test Notes Workspace on Desktop + Mobile

**Status**: PENDING
**Priority**: P0-CRITICAL
**Effort**: 20 minutes

**Description**:
Manually test Notes workspace on desktop and mobile to verify fix works correctly.

**Tasks**:
- [ ] Open app on desktop Chrome
- [ ] Navigate to /notes route
- [ ] Verify: Project picker dialog shows (not crash)
- [ ] Select project from picker
- [ ] Verify: NotesPage loads with project data
- [ ] Open app on mobile (responsive mode)
- [ ] Navigate to /notes route
- [ ] Verify: Browser-mode project auto-loads
- [ ] Verify: NotesPage loads with project data
- [ ] Check console for errors
- [ ] Document test results

**Test Cases**:
| Platform | Action | Expected Result | Actual Result |
|----------|--------|-----------------|--------------|
| Desktop | Navigate to /notes | Show project picker dialog | [ ] PASS/FAIL |
| Desktop | Select FSA project | Navigate to /notes/$projectId | [ ] PASS/FAIL |
| Mobile | Navigate to /notes | Auto-load browser-mode project | [ ] PASS/FAIL |
| Mobile | Check NotesPage | See welcome note | [ ] PASS/FAIL |

**Acceptance Criteria**:
- ✅ Desktop: Project picker shows without crash
- ✅ Desktop: Can select FSA project
- ✅ Desktop: NotesPage loads with project data
- ✅ Mobile: Auto-loads browser-mode project
- ✅ Mobile: NotesPage loads with welcome note
- ✅ No "Rendered fewer hooks than expected" error
- ✅ No console errors on either platform
- ✅ TypeScript: 0 errors

**Files to Test**:
| File | Test Focus |
|-------|------------|
| `src/routes/notes.lazy.tsx` | Hooks fix, custom hook usage |
| `src/infrastructure/persistence/stores/project/use-fsa-projects.ts` | Custom hook implementation |

**Expected User Journey** (after fix):

**Desktop User**:
1. Opens app
2. Clicks Notes icon in sidebar
3. ✅ Project picker dialog appears (no crash)
4. Selects FSA project from list
5. ✅ Navigates to `/notes/$projectId`
6. ✅ NotesPage loads with project data
7. Can create/edit notes

**Mobile User**:
1. Opens app on mobile
2. Clicks Notes icon in sidebar
3. ✅ Browser-mode project auto-creates/loads
4. ✅ Navigates to `/notes` (auto-loads)
5. ✅ NotesPage loads with welcome note
6. Can create/edit notes

---

## Epic Acceptance Criteria

This epic is complete when:
1. ✅ Story INF-02-01 complete (useLiveQuery hook removed)
2. ✅ Story INF-02-02 complete (useFSAProjects() hook created)
3. ✅ Story INF-02-03 complete (Notes workspace tested on both platforms)
4. ✅ Notes workspace loads without hooks error
5. ✅ Desktop shows project picker
6. ✅ Mobile auto-loads browser-mode project
7. ✅ No console errors
8. ✅ TypeScript: 0 errors
9. ✅ User journey unblocked

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|-------|-------------|--------|------------|
| Fix doesn't solve hooks error | Low | High | Test thoroughly on both platforms |
| Mobile auto-load doesn't work | Medium | High | Manual test on mobile |
| Custom hook introduces new errors | Low | Medium | TypeScript validation before commit |

---

## Success Metrics

| Metric | Target | Current | Gap |
|---------|---------|---------|-----|
| Notes workspace crash rate | 0% | 100% | ❌ |
| Desktop project picker availability | 100% | 0% | ❌ |
| Mobile auto-load success rate | 100% | 0% | ❌ |
| TypeScript errors | 0 | 0 | ✅ |
| Hooks error count | 0 | Unknown | ❌ |

---

## Next Steps

After this epic is complete:
1. ✅ Run code-review with multi-agent review
2. ✅ Run story-done to complete epic
3. ✅ Update LOOP_STATE.yaml
4. ⏸ STOP: Report completion to user
5. ⏸ AWAIT: User approval for EPIC-INF-03

---

## Reference Documents

- **Deep Analysis**: `_bmad-output/planning-artifacts/deep-architectural-analysis-2026-01-15.md`
  - Part 1.2.1: Hooks error in /notes route
  - Part 2.2: Use Case #1 and #6 (Desktop + Mobile Notes)
  - Part 5.1: Phase 1 implementation plan (1 hour)

- **ADR-034 D12**: Route Loading - Dexie direct queries, no Zustand
- **ADR-035**: Entity Model - Dexie React Hooks best practices

---

**END OF EPIC**
