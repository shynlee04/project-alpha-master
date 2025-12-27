# Handoff Document: LAYOUT-5 - Update Projects Route

**Date:** 2025-12-27T11:10:00+07:00
**From:** @bmad-core-bmad-master
**To:** @bmad-bmm-dev
**Epic:** HOMEPAGE-LAYOUT (Home Page Layout Redesign)
**Story:** LAYOUT-5

---

## 1. Context Summary

### Epic Overview
The Home Page Layout Redesign epic aims to create a unified navigation system with a single collapsible sidebar, replacing duplicate navigation components and misaligned routing.

### Completed Stories
- **LAYOUT-1** ✅: Created `src/lib/state/layout-store.ts` - Zustand store with localStorage persistence
- **LAYOUT-2** ✅: Created `src/components/layout/MainSidebar.tsx` - Collapsible sidebar with 5 navigation items
- **LAYOUT-3** ✅: Created `src/components/layout/MainLayout.tsx` - Responsive layout integrating MainSidebar and Outlet
- **LAYOUT-4** ✅: Updated `src/routes/index.tsx` - Replaced HubLayout with MainLayout

### Current Task: LAYOUT-5
Replace IDELayout with MainLayout in the projects route (`src/routes/workspace/$projectId.tsx`).

### Dependencies
- LAYOUT-4 (DONE ✅)
- MainLayout component exists and is functional
- MainSidebar component exists and is functional
- Layout store exists and is functional

---

## 2. Task Specification

### Objective
Update the projects route to use MainLayout instead of IDELayout, ensuring consistent navigation across the application.

### Acceptance Criteria

1. **Update Projects Route**
   - Replace `IDELayout` import with `MainLayout` in `src/routes/workspace/$projectId.tsx`
   - Replace `<IDELayout />` with `<MainLayout />` in the Workspace component
   - Remove import of IDELayout

2. **Verify Route Renders Correctly**
   - Projects route should render with MainLayout wrapper
   - MainSidebar should be visible on the left
   - Workspace content should be visible in the main area

3. **Verify MainSidebar Navigation Works**
   - All 5 navigation items should be clickable
   - Navigation should route to correct pages:
     - Home → `/`
     - Projects → `/workspace`
     - Agents → `/agents`
     - Knowledge → `/knowledge`
     - Settings → `/settings`

4. **Verify Sidebar Collapse/Expand**
   - Collapse button should toggle sidebar visibility
   - State should persist across page navigations (via localStorage)

5. **Verify Mobile Menu Overlay**
   - On mobile (< 768px), hamburger menu should be visible
   - Clicking hamburger menu should show mobile menu overlay
   - Clicking outside overlay should close it

6. **Build Verification**
   - Run `pnpm build` - no errors
   - Only pre-existing warnings are acceptable

### Constraints

**DO NOT:**
- Modify `IDELayout.tsx` (will be deprecated in LAYOUT-7)
- Modify `IDEHeaderBar.tsx` (will be deprecated in LAYOUT-7)
- Modify `HubLayout.tsx` (will be deprecated in LAYOUT-7)
- Modify `HubSidebar.tsx` (will be deprecated in LAYOUT-7)
- Create new components
- Modify MainLayout.tsx
- Modify MainSidebar.tsx
- Modify layout-store.ts

**ONLY:**
- Modify `src/routes/workspace/$projectId.tsx`
- Replace IDELayout with MainLayout
- Remove IDELayout import
- Add MainLayout import

### Technical Details

**Current Projects Route Structure:**
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { IDELayout } from '../../components/layout/IDELayout'
import { ToastProvider, Toast } from '../../components/ui/Toast'
import { WorkspaceProvider } from '../../lib/workspace'
import { getProject } from '../../lib/workspace'

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false, // CRITICAL: Disable SSR for WebContainers compatibility
    component: Workspace,
    loader: async ({ params }) => {
        const project = await getProject(params.projectId)
        return { project }
    },
})

function Workspace() {
    const { projectId } = Route.useParams()
    const { project } = Route.useLoaderData()

    return (
        <ToastProvider>
            <WorkspaceProvider projectId={projectId} initialProject={project}>
                <IDELayout />
            </WorkspaceProvider>
            <Toast />
        </ToastProvider>
    )
}
```

**Required Changes:**
1. Replace `import { IDELayout } from '../../components/layout/IDELayout'` with `import { MainLayout } from '../../components/layout/MainLayout'`
2. Replace `<IDELayout />` with `<MainLayout />`

**Important Notes:**
- Keep `ssr: false` - this is critical for WebContainers compatibility
- Keep `ToastProvider` and `Toast` - these are unrelated to layout
- Keep `WorkspaceProvider` - this provides workspace context
- Keep `loader` function - this loads project data

---

## 3. Current Workflow Status

**Epic Progress:** 4/10 stories DONE
**Current Story:** LAYOUT-5 (IN_PROGRESS)
**Next Story:** LAYOUT-6 (Update Other Routes)

**Completed Actions:**
- LAYOUT-1: Unified Layout Store (2025-12-27T10:23:43+07:00)
- LAYOUT-2: MainSidebar Component (2025-12-27T10:23:43+07:00)
- LAYOUT-3: MainLayout Component (2025-12-27T10:37:40+07:00)
- LAYOUT-4: Update Home Route (2025-12-27T11:03:55+07:00)

---

## 4. References

### Related Stories
- LAYOUT-1: [`src/lib/state/layout-store.ts`](src/lib/state/layout-store.ts)
- LAYOUT-2: [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx)
- LAYOUT-3: [`src/components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx)
- LAYOUT-4: [`src/routes/index.tsx`](src/routes/index.tsx)

### Architecture Documentation
- [`_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`](_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md)
- Migration Plan: Phase 2 - Routing Updates (lines 426-437)

### Workflow Status
- [`_bmad-output/bmm-workflow-status.yaml`](_bmad-output/bmm-workflow-status.yaml)

---

## 5. Next Agent Assignment

**Current Agent:** @bmad-bmm-dev
**Task:** Implement LAYOUT-5 (Update Projects Route)
**Mode:** Development

### Completion Instructions

Upon completion, use `attempt_completion` with a concise summary including:

1. **Files Modified:** List of files changed
2. **Changes Made:** Brief description of modifications
3. **Build Verification:** Result of `pnpm build` (pass/fail, any errors)
4. **Testing Performed:** Manual verification steps completed
5. **Next Action:** Suggest next step (LAYOUT-6)

### Return Protocol

Report completion to @bmad-core-bmad-master with:
- Completion summary
- Artifacts created/modified
- Workflow status updates needed
- Next action recommendation

---

**End of Handoff Document**