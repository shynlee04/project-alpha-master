# Handoff Report: Home Page Layout Architecture Redesign

**From**: `@bmad-bmm-architect`
**To**: `@bmad-core-bmad-master`
**Date**: 2025-12-27
**Reference**: `ARCH-HOME-LAYOUT-2025-12-27`

---

## Task Completed

Home page layout architecture redesign technical specification created.

## Artifacts Created

| File | Purpose |
|------|---------|
| `_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md` | Complete technical specification |

## Key Findings

### Current Problems Identified

1. **Duplicate Navigation Systems**: Header has mobile menu sidebar (lines 47-124 in [`Header.tsx`](src/components/Header.tsx)), HubLayout has [`HubSidebar`](src/components/hub/HubSidebar.tsx) - two conflicting systems

2. **Wrong Layout Structure**: Current = Header (top) + HubSidebar (left) + main content. User wants = Single collapsible sidebar + main content

3. **Routing Misalignment**: Navigation links don't match unified sidebar concept, portal cards navigate to routes that may not exist

4. **No State Coordination**: Header's mobile menu uses separate `useState` instead of coordinating with [`useHubStore`](src/lib/state/hub-store.ts)

### Proposed Solution

- **New `MainLayout`**: Unified layout wrapper replacing `HubLayout`
- **New `MainSidebar`**: Collapsible sidebar with icons as single navigation source
- **New `useLayoutStore`**: Unified state for sidebar collapse/expand + mobile menu
- **Simplified `Header`**: Remove duplicate mobile menu, add hamburger trigger
- **New Routes**: `/workspace` index page for project list

### Files to Create/Modify

**NEW (6 files)**:
- `src/lib/state/layout-store.ts`
- `src/components/layout/MainSidebar.tsx`
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/QuickActions.tsx`
- `src/components/layout/PortalCards.tsx`
- `src/routes/workspace/index.tsx`

**MODIFY (4 files)**:
- `src/routes/__root.tsx`
- `src/components/Header.tsx`
- `src/components/hub/HubHomePage.tsx`
- `src/i18n/en.json`, `vi.json`

**REMOVE (1 file)**:
- `src/components/layout/HubLayout.tsx` (deprecated)

## Implementation Priority

| Priority | Task |
|----------|------|
| P0 | Create `useLayoutStore` |
| P0 | Create `MainSidebar.tsx` |
| P0 | Create `MainLayout.tsx` |
| P1 | Update `__root.tsx` to use MainLayout |
| P1 | Create `workspace/index.tsx` route |
| P1 | Simplify `Header.tsx` |
| P2 | Add QuickActions and PortalCards |

## Migration Plan (4 Days)

- **Day 1**: Foundation - Create store, MainSidebar, MainLayout
- **Day 2**: Routing - Update __root.tsx, create workspace index
- **Day 3**: Components - Simplify Header, enhance HubHomePage
- **Day 4**: Cleanup - Remove deprecated code, test navigation

## Next Actions

1. **PM Task Breakdown**: Create implementation stories from this spec
2. **Dev Implementation**: Delegate to `@bmad-bmm-dev` for coding
3. **UX Review**: Optionally handoff to `@bmad-bmm-ux-designer` for visual review

---

**Status**: Architecture complete. Ready for story breakdown and implementation.
