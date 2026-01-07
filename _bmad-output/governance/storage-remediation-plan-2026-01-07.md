# Storage Type Architecture & User Journey Crisis Remediation Plan

**Status**: PLAN PHASE - Ready for Execution
**Created**: 2026-01-07
**Priority**: P0 - CRITICAL USER JOURNEY BLOCKER
**Scope**: COMPREHENSIVE - All workspaces, all related issues

---

## Executive Summary

**User's Problem**: "WTF is this wizard - I select options but nothing makes sense, I can't access my projects anywhere, everything is broken!"

**Root Causes Identified**:
1. **Wizard creates confusing false choices** - IDE binding shown for IndexedDB but forced to false
2. **No project lists in workspaces** - Users stuck in single-project dead-ends
3. **Storage type not validated** - Mobile users can access FSA-only projects
4. **Inconsistent patterns** - Each workspace uses different project access methods

**User Requirements**:
- ✅ **Fix ALL related issues** - Not just examples, comprehensive scan across all workspaces
- ✅ **Full project switcher** - Users can switch projects from within any workspace
- ✅ **Show disabled FSA projects** - Mobile users see FSA projects with disabled state (not hidden)

---

## Phase 1: Comprehensive Workspace Scan ✅ COMPLETE

### Investigation Results Summary

| Finding | Impact | Evidence |
|----------|--------|----------|
| IDE binding false security | P0 | Wizard shows IDE option for IndexedDB but forces `ide: false` on creation |
| No project selectors in workspaces | P0 | NotesPage, StudyPage, KnowledgePage, IDE all lack project lists |
| Storage type ignorance | P1 | No filtering when accessing projects across storage types |
| Inconsistent access patterns | P1 | ProjectPickerDialog uses `useLiveQuery`, workspaces use `useIDEStore` |

### Dependency Matrix (Wizard Choices)

```
storageType: 'indexeddb' | 'fsa'
├── Affects: workspaceBindings.ide (FSA-only) ✗ CONFUSING
├── Determines: File sync service initialization
├── Controls: Directory access prompts
└── Impacts: Mobile compatibility

workspaceBindings.ide: true
├── Valid ONLY when: storageType === 'fsa'
└── Forced to: false when storageType === 'indexeddb'

workspaceBindings.{knowledge|notes|study}
├── Valid for: Both storage types
└── Should show: Project lists in each workspace ✗ MISSING
```

---

## Issues Registry

### P0 - Critical User Journey Blockers

| ID | Category | Location | Description | Effort |
|----|----------|----------|-------------|--------|
| WIZ-001 | Wizard Confusion | `ProjectCreationWizard.tsx:262-265` | IDE binding shown for IndexedDB but forced to false | 1h |
| WKS-001 | No Project List | `NotesPage.tsx` | Cannot switch projects from Notes workspace | 1h |
| WKS-002 | No Project List | `StudyPage.tsx` | Cannot switch projects from Study workspace | 1h |
| WKS-003 | No Project List | `KnowledgePage.tsx` | Cannot switch projects from Knowledge workspace | 1h |
| WKS-004 | No Project List | `IDELayout.tsx` | Cannot switch projects from IDE workspace | 1h |
| MOB-001 | Mobile Issues | `WorkspaceSwitcher.tsx:65` | Hidden on mobile (`hidden md:flex`) | 1h |

### P1 - High Priority Issues

| ID | Category | Location | Description | Effort |
|----|----------|----------|-------------|--------|
| STG-001 | Storage Type | `KnowledgePage.tsx` | Storage type completely ignored | 2h |
| PAT-001 | Pattern Inconsistency | All workspace pages | Mixed `useProjectContext` vs `useIDEStore` | 3h |
| SYNC-001 | File Sync | `KnowledgePage.tsx` | No file sync service integration | 2h |

---

## Execution Plan

### Phase 2: Wizard Clarity Fixes (1-2 hours)

**Stories**: STORAGE-2-1, STORAGE-2-2

| Task | File | Change |
|------|------|--------|
| T2.1 | `WorkspaceSetupStep.tsx` | Disable IDE checkbox for IndexedDB with clear message |
| T2.2 | `ProjectDetailsStep.tsx` | Add storage type info badge |

### Phase 3: Project Lists in All Workspaces (3-4 hours)

**Stories**: STORAGE-3-1, STORAGE-3-2, STORAGE-3-3, STORAGE-3-4

| Task | File | Change |
|------|------|--------|
| T3.1 | `useWorkspaceProjects.ts` | NEW - Unified hook |
| T3.2 | `NotesPage.tsx` | Add project switcher |
| T3.3 | `StudyPage.tsx` | Add project switcher |
| T3.4 | `KnowledgePage.tsx` | Add project switcher + storage awareness |
| T3.5 | `IDELayout.tsx` | Add project switcher (FSA only) |

### Phase 4: Storage Type Validation & Mobile Handling (2-3 hours)

**Stories**: STORAGE-4-1, STORAGE-4-2

| Task | File | Change |
|------|------|--------|
| T4.1 | `useWorkspaceProjects.ts` | Add mobile detection + FSA warning |
| T4.2 | `ProjectSelector.tsx` | NEW - Shared component with badges |
| T4.3 | `WorkspaceSwitcher.tsx` | Make mobile-compatible |

### Phase 5: Unified Project Access Pattern (2-3 hours)

**Stories**: STORAGE-5-1, STORAGE-5-2

| Task | File | Change |
|------|------|--------|
| T5.1 | All workspace pages | Migrate to `useWorkspaceProjects` |
| T5.2 | Documentation | Update architecture docs |

### Phase 6: Testing & Validation (1-2 hours)

**Stories**: STORAGE-6-1

| Task | File | Change |
|------|------|--------|
| T6.1 | User journey tests | Test all 6 scenarios |
| T6.2 | TypeScript check | `pnpm typecheck` |
| T6.3 | Build verification | `pnpm build` |

---

## Success Criteria

- [ ] **Phase 2**: Wizard clearly shows IDE = FSA only (no false choice)
- [ ] **Phase 3**: All workspaces have FULL project switcher (dropdown selector)
- [ ] **Phase 4**: Mobile users see FSA projects as DISABLED (not hidden)
- [ ] **Phase 5**: Unified project access pattern across all workspaces
- [ ] **Phase 6**: Zero TypeScript errors, all user journeys passable

---

## Estimated Effort

| Phase | Hours | Stories |
|-------|-------|---------|
| 0: Discovery | ✅ Complete | - |
| 1: Scan | ✅ Complete | - |
| 2: Wizard Fixes | 1-2 | STORAGE-2-1, STORAGE-2-2 |
| 3: Project Lists | 3-4 | STORAGE-3-1 through STORAGE-3-4 |
| 4: Storage Validation | 2-3 | STORAGE-4-1, STORAGE-4-2 |
| 5: Unified Pattern | 2-3 | STORAGE-5-1, STORAGE-5-2 |
| 6: Testing | 1-2 | STORAGE-6-1 |
| **Total** | **11-17 hours** | **8 stories** |

---

## User Requirement Summary

✅ **Fix ALL related issues** - Comprehensive scan across ALL workspaces
✅ **Full project switcher** - Dropdown to switch projects from within any workspace
✅ **Show disabled FSA projects** - Mobile users see FSA projects with disabled state

---

## Related Documents

- ADR-STORAGE-001: `_bmad-output/project-planning-artifacts/adr-storage-type-selection.md`
- Phase 1 Scan Results: Sub-agent Explore Task Results (2026-01-07)
- Storage Architecture: `src/infrastructure/sync/adapters/adapter-factory.ts`
- Unified Adapter: `src/lib/filesystem/unified-storage-adapter.ts`
