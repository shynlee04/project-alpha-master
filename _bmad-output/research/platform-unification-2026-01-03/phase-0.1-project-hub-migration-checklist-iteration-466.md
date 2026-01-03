---
date: 2026-01-04
time: 00:05:00
phase: Grand Cycle 6 - Phase 0.1 Implementation
story: 51-platform-unification-status
team: Team A
agent_mode: bmad-bmm-dev
iteration: 466
previous: iteration-465 (migration assessment)
---

# Phase 0.1: Project Hub Migration - Implementation Checklist

**Generated**: 2026-01-04T00:05:00+07:00
**Estimated Effort**: 8-10 hours
**Status**: IN PROGRESS

---

## Current State Analysis

### Discovery: Hub Already Exists at `/`

**Finding**: The assessment's claim that "Hub not accessible via /hub route" is **PARTIALLY CORRECT**.

**Actual State**:
- ✅ HubHomePage component exists: `src/presentation/components/hub/HubHomePage.tsx` (267 lines)
- ✅ Hub IS accessible - but at `/` route, not `/hub`
- ❌ Uses legacy `lib/workspace/project-store.ts` (lines 19-25)
- ✅ `hub-store.ts` exists but NOT integrated - only navigation state

**Current Routing**:
```typescript
// src/routes/index.tsx
export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HubHomePage />  {/* Hub mounted at root */}
    </MainLayout>
  ),
})
```

---

## Migration Objectives

### Primary Goal

**Modernize Hub HomePage** from legacy `lib/workspace/project-store` to modern store architecture.

### Secondary Goal (Optional)

Create dedicated `/hub` route if architecture requires `/` for landing page.

---

## Implementation Checklist

### Step 1: Create Modern Project Store (2-3 hours)

**Acceptance Criteria**:
- [ ] Create `src/infrastructure/persistence/stores/project/useProjectStore.ts`
- [ ] Implement slice pattern (3 slices: CRUD, Bindings, Utils)
- [ ] Dexie IndexedDB persistence
- [ ] Type-safe project CRUD operations
- [ ] Workspace binding management
- [ ] Zero TypeScript errors

**Slice Structure**:
```typescript
// Slice 1: Project CRUD Slice (100 lines)
- projects: Record<string, Project>
- activeProjectId: string | null
- createProject(project) => string
- updateProject(id, updates) => void
- deleteProject(id) => void
- setActiveProject(id) => void

// Slice 2: Workspace Bindings Slice (80 lines)
- updateProjectBindings(projectId, bindings) => Promise<void>
- getProjectBindings(projectId) => WorkspaceBindings
- validateBindings(bindings) => ValidationResult

// Slice 3: Project Utils Slice (70 lines)
- getProject(id) => Project | undefined
- getRecentProjects(limit) => Project[]
- searchProjects(query) => Project[]
- updateLastOpened(projectId) => Promise<void>
```

**Estimated**: 2-3 hours

---

### Step 2: Create /hub Route (1 hour)

**Acceptance Criteria**:
- [ ] Create `src/routes/hub.tsx`
- [ ] Mount HubHomePage at `/hub` path
- [ ] Keep existing `/` route (for now)
- [ ] Verify both routes work
- [ ] Update navigation links to point to `/hub`

**Implementation**:
```typescript
// src/routes/hub.tsx (NEW)
import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '@/presentation/components/hub/HubHomePage'
import { MainLayout } from '@/presentation/components/layout/MainLayout'

export const Route = createFileRoute('/hub')({
  component: () => (
    <MainLayout>
      <HubHomePage />
    </MainLayout>
  ),
})
```

**Estimated**: 1 hour

---

### Step 3: Migrate HubHomePage to Modern Store (3-4 hours)

**Acceptance Criteria**:
- [ ] Remove imports from `lib/workspace/project-store`
- [ ] Add imports from modern `useProjectStore`
- [ ] Update all project CRUD operations
- [ ] Test create project flow
- [ ] Test open project flow
- [ ] Test workspace binding flow
- [ ] Zero TypeScript errors
- [ ] Zero runtime errors

**Changes Required**:
```typescript
// BEFORE (lines 19-25):
import {
  saveProject,
  generateProjectId,
  updateProjectLastOpened,
  updateProjectBindings,
  type ProjectMetadata
} from '@/lib/workspace/project-store';

// AFTER:
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

// Update handlers to use store:
const createProject = useProjectStore(state => state.createProject);
const updateBindings = useProjectStore(state => state.updateProjectBindings);
```

**Estimated**: 3-4 hours

---

### Step 4: Migrate Other Project-Consuming Components (2-3 hours)

**Acceptance Criteria**:
- [ ] Find all 13 components using `lib/workspace/project-store`
- [ ] Migrate components one at a time
- [ ] Test each component after migration
- [ ] Delete legacy `lib/workspace/project-store.ts`
- [ ] Verify zero breaking changes

**Components to Migrate** (need grep to find):
1. Hub subcomponents (already done in Step 3)
2. Workspace selector components
3. Project card components
4. File sync components
5. Other project-consuming components

**Estimated**: 2-3 hours

---

### Step 5: Verification & Testing (1 hour)

**Acceptance Criteria**:
- [ ] Run `pnpm tsc --noEmit` - Zero errors
- [ ] Run `pnpm dev` - Dev server starts
- [ ] Test `/hub` route accessible
- [ ] Test create new project
- [ ] Test open recent project
- [ ] Test workspace binding dialog
- [ ] Test navigation to other workspaces
- [ ] Manual E2E testing complete

**Estimated**: 1 hour

---

## Risk Mitigation

### Risk 1: Breaking Existing Hub Route

**Mitigation**: Keep `/` route as alias to `/hub` during migration
```typescript
// src/routes/index.tsx (UPDATED)
export const Route = createFileRoute('/')({
  beforeLoad: async ({ navigate }) => {
    // Redirect to /hub
    throw navigate({ to: '/hub', replace: true })
  },
})
```

### Risk 2: Data Loss During Migration

**Mitigation**:
- Backup IndexedDB before migration
- Verify Dexie schema unchanged
- Test project persistence
- Rollback plan ready

### Risk 3: Component Breaking Changes

**Mitigation**:
- Migrate components one at a time
- Test each component individually
- Keep legacy imports during transition
- Delete legacy code ONLY after verification

---

## Rollback Plan

If migration fails:

1. **Restore `/` route**: Revert `src/routes/index.tsx`
2. **Revert HubHomePage**: Restore legacy imports
3. **Delete new store**: Remove `useProjectStore.ts`
4. **Verify**: Run `pnpm dev` to confirm system works

**Rollback Time**: 5 minutes

---

## Success Criteria

**Phase 0.1 Complete When**:
- ✅ `/hub` route accessible
- ✅ HubHomePage migrated to modern store
- ✅ All 13 project-consuming components migrated
- ✅ Legacy `lib/workspace/project-store.ts` deleted
- ✅ Zero TypeScript errors
- ✅ Zero runtime errors
- ✅ Manual testing passed

---

## Next Steps After Phase 0.1

**Phase 0.2**: Knowledge Workspace Migration (12-16 hours)
- Create `useKnowledgeStore.ts`
- Migrate 14 knowledge-consuming components
- Verify RAG integration functional

**Prerequisite**: Phase 0.1 MUST complete before starting Phase 0.2

---

**Document Version**: 1.0
**Last Updated**: 2026-01-04T00:05:00+07:00
**Iteration**: 466
