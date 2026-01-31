# Direct Spike Plan - Isolate Working Parts Before Refactoring

**Created**: 2026-01-16
**Author**: BMAD Framework
**Purpose**: Create isolated spike to identify working components before major refactoring

---

## Executive Summary

Create an isolated spike folder (`routes-spike/`) that contains ONLY the working parts of the codebase. This will help us:

1. **Isolate Working Components**: Copy ONLY confirmed working loader logic and UI components
2. **Build 2 Workspaces**: Notes + IDE with minimal implementation (no features yet)
3. **Archive Broken Parts**: Move all problematic implementations to `_archive/`
4. **Refactor Later**: Once spike is stable, we'll refactor based on learnings

**Approach**: Incremental - start with what works, add features incrementally.

---

## Spike Folder Structure

```
routes-spike/
  ├── notes/
  │   ├── NotesWorkspace.tsx       (Copy from src/routes/notes.$projectId.lazy.tsx - lines 45-66 loader only)
  │   ├── NotesPage.tsx            (Copy from src/presentation/components/notes/NotesPage.tsx - working UI)
  │   └── NotesUI.tsx              (Minimal - just editor + sidebar, new file)
  │
  ├── ide/
  │   ├── IDEWorkspace.tsx         (Copy from src/routes/ide.$projectId.tsx - lines 38-88 loader + guard)
  │   ├── IDELayout.tsx            (Copy from src/presentation/components/layout/IDELayoutMain.tsx - working UI)
  │   └── IDEUI.tsx                (Minimal - just file tree + editor, new file)
  │
  ├── project-creation/
  │   └── ProjectWizard.tsx           (Copy from src/presentation/components/project/ProjectCreationWizard.tsx - working UI)
  │
  └── infrastructure/
      ├── dexie-spoke.ts               (Copy from src/infrastructure/persistence/dexie-db.ts - working DB)
      ├── fsa-spoke.ts                (Copy from FSA persistence that works)
      └── platform-spoke.ts             (Copy from src/infrastructure/filesystem/platform-contract.ts)
```

---

## Notes Workspace (What Works)

### ✅ INCLUDE (WORKING)

```typescript
// Route loader: src/routes/notes.$projectId.lazy.tsx (lines 45-66)
export const loader = async ({ params }: { params: { projectId: string } }) => {
  const projectId = parseInt(params.projectId, 10);
  const project = await db.projects.get(projectId);

  if (!project) {
    throw redirect({ to: '/' });
  }

  return { project };
};

// Component: src/presentation/components/notes/NotesPage.tsx
// - Working UI with editor + sidebar
// - Uses useNoteStore for state management
// - Dexie-based storage confirmed working

// Storage: Dexie via useNoteStore
// - Confirmed working in project creation flow
```

### ❌ DON'T INCLUDE YET (FEATURES)

```
- FSA file watching           (NOT working - causing bounce-back)
- Markdown sync service       (NOT working - conflicting with state)
- AI slash commands          (NOT working - blocked by route issues)
- RAG features               (NOT working - depends on working routes)
```

**Reasoning**: Start with minimal Notes workspace that can load a project and display content. Add features incrementally once baseline is stable.

---

## IDE Workspace (What Works)

### ✅ INCLUDE (WORKING)

```typescript
// Route loader: src/routes/ide.$projectId.tsx (lines 38-88)
export const loader = async ({ params }: { params: { projectId: string } }) => {
  const projectId = parseInt(params.projectId, 10);
  const project = await db.projects.get(projectId);

  if (!project) {
    throw redirect({ to: '/' });
  }

  return { project };
};

// beforeLoad: Platform guard
export const beforeLoad = () => {
  const platform = getPlatformContract();

  if (platform.deviceType === 'mobile') {
    throw redirect({ to: '/notes' });
  }
};

// Component: src/presentation/components/layout/IDELayoutMain.tsx
// - Working UI with file tree + editor
// - Clean architecture confirmed working

// Storage: FSA handle (desktop only)
// - Confirmed working for project creation
```

### ❌ DON'T INCLUDE YET (FEATURES)

```
- WebContainer                (NOT working - blocked by route issues)
- Terminal                    (NOT working - blocked by WebContainer)
- AI features                 (NOT working - blocked by route issues)
```

**Reasoning**: Start with minimal IDE workspace that can load a project and display file tree. Add advanced features incrementally.

---

## Phase 3: Archive Everything Else

Move ALL problematic implementations to archive to prevent contamination:

```
_archive/broken-routes-2026-01-16/
  ├── old-notes/         (Move src/routes/notes.* old implementations)
  ├── old-ide/            (Move src/routes/ide.* old implementations)
  ├── temp-project-flows/ (Move temp project logic)
  └── hydration-manager/   (KEEP for reference - may need later)
```

**Archive Purpose**:
- Remove broken code from active codebase
- Keep for reference during refactoring
- Prevent accidental imports from broken modules

---

## Phase 4: Refactor Plan (After Spike Works)

Once the spike is confirmed working (all success criteria met), proceed with refactoring:

1. **Fix Regex Bug**: ADR-035 says fixed, but verify if still present in spike
2. **Consolidate FSA Handle Persistence**: Implement proper handle storage in IndexedDB
3. **Implement Proper Project Scoping**: Ensure all state is properly scoped by projectId
4. **Fix Route Guards**: Apply platform guards to ALL workspace routes
5. **Add Features Incrementally**: Add FSA sync, WebContainer, AI features one at a time
6. **Integrate Back**: Merge spike findings back into main codebase

**Refactoring Timeline**:
- Week 1: Spike implementation and validation
- Week 2: Feature additions to spike
- Week 3: Integration back to main codebase

---

## Success Criteria

**Spike Implementation**:
- [ ] Spike folder `routes-spike/` created
- [ ] Working files copied from confirmed working paths
- [ ] Minimal UI files created (NotesUI.tsx, IDEUI.tsx)
- [ ] Infrastructure spokes created (dexie-spoke.ts, fsa-spoke.ts, platform-spoke.ts)

**Functional Testing**:
- [ ] Notes workspace loads project correctly
- [ ] IDE workspace loads project correctly
- [ ] Platform guard works (mobile blocked from IDE)
- [ ] No bounce-back in spike (navigate to `/ide/$projectId` doesn't bounce to `/notes/$projectId`)
- [ ] Project creation wizard works in spike context

**Documentation**:
- [ ] This plan document created
- [ ] Spike execution log created
- [ ] Success/failure report documented

**Next Steps**:
- If ALL criteria met → Proceed to Phase 4 Refactor Plan
- If ANY criteria fail → Debug specific failure, fix, retry
- If MAJOR blockers discovered → Update plan with new findings

---

## Risk Mitigation

### High-Risk Items

1. **FSA Handle Persistence** (HIGH RISK)
   - **Risk**: Handle may expire or be invalid
   - **Mitigation**: Implement re-auth prompt on access failure

2. **Platform Detection** (MEDIUM RISK)
   - **Risk**: Mobile detection may be unreliable
   - **Mitigation**: Add manual override in settings

3. **Route Bounce-Back** (HIGH RISK)
   - **Risk**: Spike may still exhibit bounce-back behavior
   - **Mitigation**: If persists, investigate route guard logic more deeply

### Rollback Plan

If spike fails to provide working baseline:
1. Keep archive of all moved code
2. Document findings from spike attempt
3. Alternative approach: Refactor in-place with more granular commits

---

## Timeline Estimate

| Phase | Duration | Owner |
|-------|----------|-------|
| Spike Setup | 2-3 hours | dev-ext |
| Spike Testing | 1-2 hours | test-ext |
| Archive Old Code | 30 min | dev-ext |
| Refactor Planning | 1 hour | architect-ext |
| **Total** | **4.5-6.5 hours** | |

---

## Notes

- Spike should be implemented in a separate session to ensure fresh perspective
- All file copies should be exact (no modifications yet)
- Test spike in isolation before adding any features
- Document ANY issues encountered, even minor ones

---

**Status**: READY FOR EXECUTION
**Priority**: P0 (Critical Path for Architectural Remediation)
