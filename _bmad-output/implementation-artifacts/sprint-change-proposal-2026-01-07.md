---
date: 2026-01-07
time: 10:30:00
phase: Critical Bug Fix
workflow-type: correct-course
author: BMAD Core Master
user_name: Admin
---

# Sprint Change Proposal: Critical Project Creation & Workspace Access Blockers

**Document ID:** CCP-2026-01-07-001
**Status:** Ready for Implementation
**Priority:** P0 - CRITICAL
**Scope:** Project Creation Flow + Workspace Access

---

## 1. Issue Summary

### Problem Statement

Users cannot access any of the 4 workspaces (IDE, Knowledge, Notes, Study) because:
1. Project creation fails to properly create/sync projects
2. Without valid projects, workspace bindings are never established
3. The entire workspace access system is blocked

### Evidence of Issue

User Report:
> "this wont work - no matter what you do in all 4 cases when I can't create project or having my project synced and registered I cant access any workspaces"

### Root Cause Analysis

| Issue | File | Line | Impact |
|-------|------|------|--------|
| **fsaHandle set to null** | `ProjectCreationWizard.tsx` | 255 | Created projects can't mount folders |
| **Creation flow incomplete** | `ProjectPickerDialog.tsx` | 173-177 | Clicking "Create Project" does nothing |
| **Store never hydrated** | `useProjectStore.ts` | 53-67 | Projects disappear on refresh |
| **Workspace bindings inconsistent** | `HubHomePage.tsx` | 174-179 | Some workspaces never enabled |
| **enabledWorkspaces hardcoded** | `useWorkspaceSwitching.ts` | 63-65 | Always returns all, ignores actual bindings |

### Impact Assessment

- **User Journeys Affected:** All 4 (Alex, Thảo, Returning Explorer, Mobile Learner)
- **Epics Affected:** Epic 1-5, Epic 24
- **Stories Affected:** All stories requiring project access
- **Technical Impact:** 100% workspace access blocked

---

## 2. Impact Analysis

### Epic Impact

| Epic | Status | Impact |
|------|--------|--------|
| **Epic 1: Mobile-First Visual Foundation** | Complete | UI works, but inaccessible without projects |
| **Epic 2: AI Chat That Just Works** | Complete | Chat works, but inaccessible without projects |
| **Epic 3: Local-First File Magic** | Complete | Sync works, but inaccessible without projects |
| **Epic 4: Smart Agent Tools** | Complete | Tools work, but inaccessible without projects |
| **Epic 5: Production-Ready Polish** | Complete | Polish complete, but inaccessible without projects |
| **Epic 24: Performance & UX Optimization** | In Progress | Blocked by this issue |

### Artifact Conflicts

| Artifact | Section | Required Change |
|----------|---------|-----------------|
| `prd.md` | User Journeys | Add project creation failure handling |
| `epics-enhanced-2025-12-29.md` | Story 2.0 | Update credential vault to handle project creation |
| `architecture.md` | State Architecture | Document FSA handle requirement |

### Technical Impact

- **Project Store**: `fsaHandle` must be properly stored
- **Dexie Schema**: May need to store FSA handles for persistence
- **Workspace Binding**: Must enable all 4 workspaces by default
- **Store Hydration**: Must load projects from Dexie on mount

---

## 3. Recommended Approach

### Chosen Path: **Direct Adjustment**

**Rationale:**
- Root cause is isolated to project creation flow
- No fundamental architectural changes required
- Can be fixed within existing sprint timeline
- Low risk of regression

**Effence Estimate:** 4-6 hours
**Risk Level:** Medium
**Timeline Impact:** 1 day

---

## 4. Detailed Change Proposals

### Fix 1: Add Folder Selection Step to ProjectCreationWizard

**File:** `src/presentation/components/project/ProjectCreationWizard.tsx`

**Current Code (Line 255):**
```typescript
const projectInput: CreateProjectInput = {
  name: formData.projectName,
  folderPath: formData.projectName.toLowerCase().replace(/\s+/g, '-'),
  fsaHandle: null as any, // Will be set when folder is mounted
  // ...
};
```

**Proposed Change:**
```typescript
const projectInput: CreateProjectInput = {
  name: formData.projectName,
  folderPath: formData.projectName.toLowerCase().replace(/\s+/g, '-'),
  fsaHandle: formData.selectedHandle, // NEW: Use selected handle from folder step
  description: formData.projectDescription || undefined,
  tags: [formData.projectType],
  bindings: {
    ide: true,
    knowledge: true,
    notes: true,
    study: true,
  },
};
```

**Additional Changes Required:**
1. Add `selectedHandle` field to `WizardFormData`
2. Add FolderSelectionStep component between ReviewStep and final creation
3. Add folder selection using `window.showDirectoryPicker()`
4. Only enable "Create" button after folder is selected

**Rationale:** Projects must have a real FSA handle to mount and sync files. Without this, no workspace can function.

---

### Fix 2: Complete ProjectPickerDialog Creation Flow

**File:** `src/presentation/components/hub/ProjectPickerDialog.tsx`

**Current Code (Lines 173-177):**
```typescript
const handleCreateProject = () => {
  onOpenChange(false);
  // TODO: Trigger project creation flow  ← INCOMPLETE!
  // For now, just close and return to hub
};
```

**Proposed Change:**
```typescript
const handleCreateProject = () => {
  onOpenChange(false);
  // Trigger project creation flow via URL parameter
  navigate({
    to: '/hub',
    search: { action: 'create-project' }
  });
};
```

**Additional Changes Required:**
1. HubHomePage must handle `action=create-project` query param
2. Open ProjectCreationWizard when action is detected

**Rationale:** Users clicking "Create Project" expect a creation flow, not nothing.

---

### Fix 3: Add Hydration to useProjectStore

**File:** `src/infrastructure/persistence/stores/project/useProjectStore.ts`

**Current Code (Lines 53-67):**
```typescript
export const useProjectStore = create<CombinedProjectState>()(
  (set, get, api) => ({
    // State initialization - EMPTY!
    projects: {},
    activeProjectId: null,
    _hasHydrated: false,
    // ...
  })
);
```

**Proposed Change:**
```typescript
export const useProjectStore = create<CombinedProjectState>()(
  persist(
    (set, get, api) => ({
      // State initialization
      projects: {},
      activeProjectId: null,
      _hasHydrated: false,

      // Hydration method
      hydrateProjects: async () => {
        try {
          const db = getDb();
          const records = await db.projects.toArray();
          const projects: Record<string, ProjectRecord> = {};
          records.forEach(record => {
            projects[record.id] = record;
          });
          set({ projects, _hasHydrated: true });
          console.log('[useProjectStore] Hydrated', Object.keys(projects).length, 'projects');
        } catch (error) {
          console.error('[useProjectStore] Failed to hydrate projects:', error);
          set({ _hasHydrated: true }); // Mark as hydrated even on failure
        }
      },
      // ...
    }),
    {
      name: 'project-state',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        // Auto-hydrate after persist rehydrates
        if (state) {
          state.hydrateProjects();
        }
      },
    }
  )
);
```

**Rationale:** Without hydration, projects saved to Dexie are never loaded into the Zustand store, causing projects to appear missing after refresh.

---

### Fix 4: Fix Workspace Bindings Consistency

**File:** `src/presentation/components/hub/HubHomePage.tsx`

**Current Code (Lines 174-179):**
```typescript
bindings: {
  ide: true,        // Only IDE enabled
  knowledge: false,
  notes: false,
  study: false,
},
```

**Proposed Change:**
```typescript
bindings: {
  ide: true,
  knowledge: true,   // Enable all workspaces by default
  notes: true,
  study: true,
},
```

**Rationale:** Match the default from `project-crud-slice.ts:85-90` which enables all workspaces. Users should be able to access all features immediately after project creation.

---

### Fix 5: Make enabledWorkspaces Dynamic

**File:** `src/infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts`

**Current Code (Lines 63-65):**
```typescript
const enabledWorkspaces = useMemo(() => {
  return ['hub', 'ide', 'notes', 'knowledge', 'study'] as ExtendedWorkspaceType[];
}, []);
```

**Proposed Change:**
```typescript
const enabledWorkspaces = useMemo(() => {
  if (!projectId) return ['hub'] as ExtendedWorkspaceType[];

  // Get project from store
  const project = useProjectStore.getState().getProject(projectId);
  if (!project) return ['hub'] as ExtendedWorkspaceType[];

  // Return workspaces based on project bindings
  const enabled: ExtendedWorkspaceType[] = ['hub'];
  if (project.bindings?.ide) enabled.push('ide');
  if (project.bindings?.knowledge) enabled.push('knowledge');
  if (project.bindings?.notes) enabled.push('notes');
  if (project.bindings?.study) enabled.push('study');

  return enabled;
}, [projectId]);
```

**Rationale:** Workspace access should be based on actual project bindings, not hardcoded values.

---

## 5. Implementation Handoff

### Scope Classification: **ModerATE**

- Requires backlog reorganization
- PO/SM coordination for UI changes
- Developer can implement directly

### Handoff Recipients

| Role | Responsibility |
|------|----------------|
| **Developer** | Implement Fixes 1-5 in order |
| **PO/SM** | Verify workspace access works after fixes |
| **QA** | Test project creation flow end-to-end |

### Success Criteria

1. ✅ User can create a new project via ProjectPickerDialog
2. ✅ Project has valid FSA handle and folder path
3. ✅ All 4 workspaces are accessible after project creation
4. ✅ Projects persist and load correctly on page refresh
5. ✅ No console errors during project creation

---

## 6. Testing Plan

### Manual Testing Checklist

| Test | Expected Result | Status |
|------|-----------------|--------|
| Open Hub page | Shows empty state with "Create Project" button | ⬜ |
| Click "Create Project" | Opens ProjectCreationWizard | ⬜ |
| Complete wizard with folder selection | Project created successfully | ⬜ |
| Navigate to project | All 4 workspaces accessible | ⬜ |
| Refresh page | Project still exists, workspaces still accessible | ⬜ |
| Create another project | Both projects visible in project list | ⬜ |

### Automated Tests (To Add)

```typescript
// test/project-creation.spec.ts
describe('Project Creation Flow', () => {
  it('should create project with valid FSA handle', async () => {
    // Test wizard creates project with non-null fsaHandle
  });

  it('should enable all workspaces after project creation', async () => {
    // Test all 4 workspaces are accessible
  });

  it('should hydrate projects from Dexie on mount', async () => {
    // Test projects persist and load correctly
  });
});
```

---

## 7. Rollback Plan

If issues arise after deployment:

| Issue | Rollback Action |
|-------|-----------------|
| FSA handle persistence fails | Revert to `fsaHandle: null` with clear error messaging |
| Workspace access broken | Revert `enabledWorkspaces` to hardcoded array |
| Project list empty | Check Dexie storage directly, revert hydration changes |

---

## 8. Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Implementation** | 2-3 hours | Fixes 1-5 |
| **Testing** | 1 hour | Manual + automated tests |
| **Validation** | 30 min | User acceptance |
| **Total** | **4-5 hours** | |

---

## 9. Approval

**Recommended Next Steps:**

1. ⏳ **Await User Approval** - Review and approve this proposal
2. 🚀 **Begin Implementation** - Start with Fix 1 (FSA handle)
3. 🔄 **Incremental Validation** - Test each fix before proceeding
4. ✅ **Final Acceptance** - Verify all 4 workspaces accessible

---

**Document Prepared:** 2026-01-07 10:30:00+07:00
**Prepared By:** BMAD Core Master (via Correct Course Workflow)
**Approval Required:** Yes (Moderate scope change)
