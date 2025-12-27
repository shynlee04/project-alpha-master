# Handoff Document: LAYOUT-4 - Update Home Route
**From:** @bmad-core-bmad-master
**To:** @bmad-bmm-dev
**Date:** 2025-12-27
**Epic:** HOMEPAGE-LAYOUT (Home Page Layout Redesign)
**Story:** LAYOUT-4

---

## Context Summary

### Epic Overview
The Home Page Layout Redesign epic aims to create a unified navigation system with a single collapsible sidebar, replacing duplicate navigation components and misaligned routing.

### Completed Stories (Foundation Phase)
- **LAYOUT-1**: Created [`src/lib/state/layout-store.ts`](src/lib/state/layout-store.ts) - Zustand store with localStorage persistence
- **LAYOUT-2**: Created [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx) - Collapsible sidebar with 5 navigation items
- **LAYOUT-3**: Created [`src/components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx) - Responsive layout integrating MainSidebar and Outlet

### Current Issue
The home route ([`src/routes/index.tsx`](src/routes/index.tsx)) currently uses `HubLayout` which has a conflicting sidebar system. This needs to be replaced with the new `MainLayout` component.

---

## Task Specification

### Story: LAYOUT-4 - Update Home Route
**Priority:** P0
**Estimated Time:** 30 minutes

### Acceptance Criteria
1. ✅ Update [`src/routes/index.tsx`](src/routes/index.tsx) to use `MainLayout` instead of `HubLayout`
2. ✅ Remove import of `HubLayout` from [`src/routes/index.tsx`](src/routes/index.tsx)
3. ✅ Verify home page renders correctly with new layout
4. ✅ Verify MainSidebar navigation works (Home, Projects, Agents, Knowledge, Settings)
5. ✅ Verify sidebar collapse/expand functionality works
6. ✅ Verify mobile menu overlay works
7. ✅ Run `pnpm build` - no errors (pre-existing warnings acceptable)

### Constraints
- **DO NOT** modify [`src/components/layout/HubLayout.tsx`](src/components/layout/HubLayout.tsx) - it will be deprecated in LAYOUT-7
- **DO NOT** modify [`src/components/hub/HubSidebar.tsx`](src/components/hub/HubSidebar.tsx) - it will be deprecated in LAYOUT-7
- **ONLY** modify [`src/routes/index.tsx`](src/routes/index.tsx)
- Keep existing [`HubHomePage`](src/components/hub/HubHomePage.tsx) component unchanged

### Technical Details

#### Current State (src/routes/index.tsx)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { HubLayout } from '@/components/layout/HubLayout'
import { HubHomePage } from '@/components/hub/HubHomePage'

export const Route = createFileRoute('/')({
  component: () => (
    <HubLayout>
      <HubHomePage />
    </HubLayout>
  ),
})
```

#### Target State (src/routes/index.tsx)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/MainLayout'
import { HubHomePage } from '@/components/hub/HubHomePage'

export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HubHomePage />
    </MainLayout>
  ),
})
```

---

## Current Workflow Status

### Epic Progress
- **Epic:** HOMEPAGE-LAYOUT
- **Status:** IN_PROGRESS
- **Progress:** 3/10 stories DONE
- **Current Story:** LAYOUT-4
- **Next Story:** LAYOUT-5 (Update Projects Route)

### Active Workflows
1. MVP Epic: AI Coding Agent Vertical Slice (1/7 stories DONE)
2. Home Page Layout Redesign (3/10 stories DONE)

### Dependencies
- **LAYOUT-4 depends on:** LAYOUT-1, LAYOUT-2, LAYOUT-3 (all DONE ✅)
- **LAYOUT-5 depends on:** LAYOUT-4 (this story)

---

## References

### Architecture Document
[`_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`](_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md)
- Section 4.1: Proposed Route Hierarchy
- Section 7.2: Phase 2 - Routing Updates

### Related Files
- [`src/lib/state/layout-store.ts`](src/lib/state/layout-store.ts) - Layout state management
- [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx) - New sidebar component
- [`src/components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx) - New layout wrapper
- [`src/routes/index.tsx`](src/routes/index.tsx) - Home route (TO BE MODIFIED)
- [`src/components/hub/HubHomePage.tsx`](src/components/hub/HubHomePage.tsx) - Home page content (unchanged)

### Navigation Routes
MainSidebar navigates to:
- `/` - Home (this route)
- `/workspace` - Projects (LAYOUT-5)
- `/agents` - Agents (LAYOUT-6)
- `/knowledge` - Knowledge (LAYOUT-6)
- `/settings` - Settings (LAYOUT-6)

---

## Next Agent Assignment

After completing LAYOUT-4, report back to **@bmad-core-bmad-master** with:
1. Completion summary
2. Artifacts created/modified
3. Build verification results
4. Any issues encountered

The orchestrator will then:
1. Update workflow status files
2. Delegate LAYOUT-5 (Update Projects Route) to @bmad-bmm-dev

---

## Testing Checklist

Before marking DONE:
- [ ] Home page loads at `http://localhost:3000`
- [ ] MainSidebar visible on left side
- [ ] 5 navigation items visible (Home, Projects, Agents, Knowledge, Settings)
- [ ] Sidebar collapse button works
- [ ] Mobile menu button works (on mobile viewport)
- [ ] Navigation to other routes works (click on Projects, Agents, etc.)
- [ ] `pnpm build` completes without errors
- [ ] No TypeScript errors

---

**Handoff Complete.** Proceed with LAYOUT-4 implementation.