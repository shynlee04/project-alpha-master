# Home Page Layout Redesign Sprint Plan

**Document ID**: `SPRINT-LAYOUT-2025-12-27`
**Created**: 2025-12-27
**Status**: Ready for Development
**Version**: 1.0

---

## Executive Summary

This sprint plan implements the Home Page Layout Architecture Redesign to eliminate duplicate navigation systems, implement unified collapsible sidebar, and fix routing structure.

**Epic ID**: `LAYOUT-2025-12-27`
**Epic Name**: "Home Page Layout Architecture Redesign"
**Epic Priority**: P0 (Critical)
**Epic Status**: READY

**Architecture Reference**: [`_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`](_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md)

---

## Problem Statement

The home page layout architecture is fundamentally broken with:
1. **Duplicate Navigation Systems**: Header has mobile menu (lines 47-124), HubLayout has HubSidebar - two conflicting systems
2. **Wrong Layout Structure**: Current = Header (top) + HubSidebar (left). User wants = Single collapsible sidebar + main content
3. **Routing Misalignment**: Portal cards navigate to routes that may not exist
4. **No State Coordination**: Header's mobile menu uses separate useState instead of useHubStore

---

## User's Vision

> "Something centering (hence main sidebar that is collapsible with icons -> that at the home page it will be topic-based onboarding; quick actions and portal cards to other sections, centering project managements while other tabs bring the user to other interfaces from IDE-workspace to agent management center, to knowledge synthesis hub etc."

---

## Epic Stories

### Story LAYOUT-1 (P0): Create Unified Layout Store

**Story ID**: LAYOUT-1
**Story Name**: "Create Unified Layout Store"
**Priority**: P0
**Estimated Effort**: 3 points (1 day)

**Dependencies**: None (Foundation story)

**Description**:
Create new Zustand store for unified sidebar state management to replace duplicate navigation state.

**Acceptance Criteria**:
- [ ] Create `src/lib/state/layout-store.ts` with Zustand store
- [ ] Define state: `sidebarCollapsed`, `sidebarMobileOpen`, `activeNavItem`
- [ ] Define actions: `toggleSidebar`, `setSidebarCollapsed`, `setMobileMenuOpen`, `setActiveNavItem`
- [ ] Implement persistence using `persist` middleware
- [ ] Store persists to localStorage with key `via-gent-layout-storage`
- [ ] TypeScript types properly exported for use in components
- [ ] No linter errors (`pnpm build` passes)
- [ ] No type errors (`pnpm tsc --noEmit` passes)

**Implementation Notes**:
- Follow Zustand pattern from existing stores (see [`useIDEStore`](src/lib/state/ide-store.ts))
- Use `persist` middleware for localStorage persistence
- Export `NavItem` type: `'home' | 'projects' | 'agents' | 'knowledge' | 'settings'`

---

### Story LAYOUT-2 (P0): Create MainSidebar Component

**Story ID**: LAYOUT-2
**Story Name**: "Create MainSidebar Component"
**Priority**: P0
**Estimated Effort**: 5 points (1.5 days)

**Dependencies**: LAYOUT-1 (layout-store must exist)

**Description**:
Create unified collapsible sidebar component with icons as single navigation source.

**Acceptance Criteria**:
- [ ] Create `src/components/layout/MainSidebar.tsx`
- [ ] Implement collapsible sidebar with icons (Home, Projects, Agents, Knowledge, Settings)
- [ ] Wire to `useLayoutStore` for state management
- [ ] Sidebar collapses to icon-only view (64px width) when collapsed
- [ ] Sidebar expands to full width (256px width) when expanded
- [ ] Navigation items highlight active route
- [ ] Click on nav item navigates to correct route
- [ ] Add collapse toggle button at bottom
- [ ] Mobile menu overlay works correctly
- [ ] Responsive design (mobile vs desktop)
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Use lucide-react icons: `Home`, `Folder`, `Bot`, `Brain`, `Settings`
- Use TanStack Router `useNavigate()` and `useLocation()` for navigation
- CSS transitions for smooth collapse/expand
- Mobile: overlay menu that slides in from left

---

### Story LAYOUT-3 (P0): Create MainLayout Component

**Story ID**: LAYOUT-3
**Story Name**: "Create MainLayout Component"
**Priority**: P0
**Estimated Effort**: 4 points (1 day)

**Dependencies**: LAYOUT-1 (layout-store), LAYOUT-2 (MainSidebar)

**Description**:
Create unified layout wrapper integrating Header and MainSidebar.

**Acceptance Criteria**:
- [ ] Create `src/components/layout/MainLayout.tsx`
- [ ] Integrate MainSidebar on left side
- [ ] Integrate Header at top
- [ ] Main content area adjusts based on sidebar state
- [ ] CSS transitions for sidebar collapse/expand
- [ ] Responsive layout (mobile menu overlay)
- [ ] Outlet for child routes
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Use flexbox layout: sidebar (left) + main content (right)
- Main content margin adjusts based on `sidebarCollapsed` state
- Header spans full width above sidebar and content
- Mobile: MainSidebar becomes overlay menu

---

### Story LAYOUT-4 (P1): Update Root Route

**Story ID**: LAYOUT-4
**Story Name**: "Update Root Route"
**Priority**: P1
**Estimated Effort**: 3 points (0.5 day)

**Dependencies**: LAYOUT-3 (MainLayout)

**Description**:
Update `__root.tsx` to use MainLayout wrapper for all routes.

**Acceptance Criteria**:
- [ ] Update `src/routes/__root.tsx` to wrap with MainLayout
- [ ] Remove HubLayout wrapper from root route
- [ ] All routes use MainLayout (sidebar + header)
- [ ] Outlet renders child routes correctly
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Replace HubLayout with MainLayout in root route
- Ensure Outlet renders child routes
- Test navigation across all routes

---

### Story LAYOUT-5 (P1): Create Workspace Index Route

**Story ID**: LAYOUT-5
**Story Name**: "Create Workspace Index Route"
**Priority**: P1
**Estimated Effort**: 5 points (1.5 days)

**Dependencies**: LAYOUT-4 (root route updated)

**Description**:
Create `/workspace` index route for project list page.

**Acceptance Criteria**:
- [ ] Create `src/routes/workspace/index.tsx`
- [ ] Implement project list page
- [ ] Integrate with Dexie project store to load projects
- [ ] Display project cards with name, description, last modified
- [ ] Add "Open Folder" button to open existing project
- [ ] Add "Create Project" button to create new project
- [ ] Click on project navigates to `/workspace/$projectId`
- [ ] Empty state shows helpful message
- [ ] No linter errors
- [ ] No type errors
- [ ] Browser E2E verification with screenshot

**Implementation Notes**:
- Use Dexie to query projects from IndexedDB
- Project cards show: name, path, last modified date
- Use existing project opening logic from IDE
- Create new project uses existing project creation flow

---

### Story LAYOUT-6 (P1): Simplify Header Component

**Story ID**: LAYOUT-6
**Story Name**: "Simplify Header Component"
**Priority**: P1
**Estimated Effort**: 3 points (0.5 day)

**Dependencies**: LAYOUT-1 (layout-store)

**Description**:
Remove duplicate mobile menu from Header and add hamburger trigger for unified sidebar.

**Acceptance Criteria**:
- [ ] Remove duplicate mobile menu (lines 47-124) from [`Header.tsx`](src/components/Header.tsx)
- [ ] Add hamburger menu button to Header
- [ ] Hamburger button triggers `setMobileMenuOpen` from `useLayoutStore`
- [ ] Keep logo, theme toggle, language switcher, user menu
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Remove entire mobile menu sidebar implementation
- Add hamburger icon (lucide-react `Menu`)
- Wire hamburger click to `useLayoutStore(s => s.setMobileMenuOpen(!s.sidebarMobileOpen))`

---

### Story LAYOUT-7 (P2): Add QuickActions Component

**Story ID**: LAYOUT-7
**Story Name**: "Add QuickActions Component"
**Priority**: P2
**Estimated Effort**: 3 points (0.5 day)

**Dependencies**: None (can be done in parallel with LAYOUT-8)

**Description**:
Create QuickActions component with "Open Folder" and "Create Project" buttons.

**Acceptance Criteria**:
- [ ] Create `src/components/layout/QuickActions.tsx`
- [ ] Implement "Open Folder" button
- [ ] Implement "Create Project" button
- [ ] Use existing project opening logic
- [ ] Use existing project creation logic
- [ ] Styled with 8-bit design system
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Reuse existing file picker logic
- Reuse existing project creation dialog
- Component should be reusable in HubHomePage and Workspace page

---

### Story LAYOUT-8 (P2): Add PortalCards Component

**Story ID**: LAYOUT-8
**Story Name**: "Add PortalCards Component"
**Priority**: P2
**Estimated Effort**: 4 points (1 day)

**Dependencies**: None (can be done in parallel with LAYOUT-7)

**Description**:
Create PortalCards component with navigation cards to IDE, Agents, Knowledge, Settings sections.

**Acceptance Criteria**:
- [ ] Create `src/components/layout/PortalCards.tsx`
- [ ] Implement navigation cards for: IDE, Agents, Knowledge, Settings
- [ ] Each card has icon, title, description
- [ ] Click on card navigates to correct route
- [ ] Cards styled with 8-bit design system
- [ ] Hover effects for interactivity
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Use lucide-react icons: `Code`, `Bot`, `Brain`, `Settings`
- Routes: `/workspace`, `/agents`, `/knowledge`, `/settings`
- Grid layout for cards

---

### Story LAYOUT-9 (P2): Enhance HubHomePage

**Story ID**: LAYOUT-9
**Story Name**: "Enhance HubHomePage"
**Priority**: P2
**Estimated Effort**: 4 points (1 day)

**Dependencies**: LAYOUT-7 (QuickActions), LAYOUT-8 (PortalCards)

**Description**:
Update HubHomePage to integrate QuickActions and PortalCards components.

**Acceptance Criteria**:
- [ ] Update [`HubHomePage.tsx`](src/components/hub/HubHomePage.tsx) to use QuickActions
- [ ] Update HubHomePage to use PortalCards
- [ ] Keep topic-based onboarding section
- [ ] Keep recent projects section
- [ ] Layout flows naturally: onboarding → quick actions → portal cards → recent projects
- [ ] No linter errors
- [ ] No type errors
- [ ] Browser E2E verification with screenshot

**Implementation Notes**:
- Import and integrate QuickActions component
- Import and integrate PortalCards component
- Maintain existing topic-based onboarding
- Maintain existing recent projects from Dexie

---

### Story LAYOUT-10 (P2): Deprecate HubLayout

**Story ID**: LAYOUT-10
**Story Name**: "Deprecate HubLayout"
**Priority**: P2
**Estimated Effort**: 2 points (0.5 day)

**Dependencies**: LAYOUT-4 (root route updated, HubLayout removed)

**Description**:
Remove HubLayout from routing and mark for removal in v2.0.

**Acceptance Criteria**:
- [ ] Remove [`HubLayout.tsx`](src/components/layout/HubLayout.tsx) from routing
- [ ] Mark HubLayout as deprecated in code comments
- [ ] Add TODO comment: "Remove in v2.0"
- [ ] Clean up unused imports from HubLayout
- [ ] Verify no other components depend on HubLayout
- [ ] No linter errors
- [ ] No type errors

**Implementation Notes**:
- Add deprecation warning at top of file
- Search codebase for any remaining imports
- Document in project deprecation log

---

## Sprint Organization

### Sprint Goal

Implement unified home page layout architecture with collapsible sidebar, eliminate duplicate navigation systems, and fix routing structure.

### Sprint Duration

**Estimated**: 8 days (40 story points)
**Platform**: Platform A (Antigravity)

### Story Execution Order

**Phase 1 - Foundation (Days 1-2)**:
1. LAYOUT-1: Create Unified Layout Store (P0)
2. LAYOUT-2: Create MainSidebar Component (P0)
3. LAYOUT-3: Create MainLayout Component (P0)

**Phase 2 - Routing Integration (Days 3-4)**:
4. LAYOUT-4: Update Root Route (P1)
5. LAYOUT-5: Create Workspace Index Route (P1)
6. LAYOUT-6: Simplify Header Component (P1)

**Phase 3 - Component Enhancement (Days 5-7)**:
7. LAYOUT-7: Add QuickActions Component (P2)
8. LAYOUT-8: Add PortalCards Component (P2)
9. LAYOUT-9: Enhance HubHomePage (P2)

**Phase 4 - Cleanup (Day 8)**:
10. LAYOUT-10: Deprecate HubLayout (P2)

### Dependencies

**Sequential Execution**:
- P0 stories (LAYOUT-1, LAYOUT-2, LAYOUT-3) must complete before P1 stories
- P1 stories (LAYOUT-4, LAYOUT-5, LAYOUT-6) must complete before P2 stories
- P2 stories (LAYOUT-7, LAYOUT-8, LAYOUT-9) can be done in parallel after P1 complete

**No Cross-Epic Dependencies**: This epic is independent of MVP epic

---

## Risk Mitigation

### Risks

1. **State Migration Complexity**: Migrating from HubSidebar/MainLayout to new MainLayout/MainSidebar
   - **Mitigation**: Keep useHubStore for backward compatibility during transition
   
2. **Breaking Changes**: Removing HubLayout may break existing routes
   - **Mitigation**: Update all routes in LAYOUT-4, verify no orphaned imports
   
3. **Mobile Responsiveness**: Ensuring sidebar works on mobile devices
   - **Mitigation**: Test on mobile viewport sizes, use responsive CSS

---

## Definition of Done

### Epic Completion

- [ ] All 10 stories completed
- [ ] All acceptance criteria met
- [ ] TypeScript: `pnpm build` passes
- [ ] No linter errors
- [ ] No type errors
- [ ] **MANDATORY**: Manual browser E2E verification with screenshot
- [ ] Full navigation flow tested (Home → Projects → IDE)
- [ ] Mobile menu tested
- [ ] Sidebar collapse/expand tested
- [ ] All routes accessible via sidebar

---

## References

**Architecture Document**: [`_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`](_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md)

**Related Components**:
- [`Header.tsx`](src/components/Header.tsx) - To be simplified
- [`HubLayout.tsx`](src/components/layout/HubLayout.tsx) - To be deprecated
- [`HubSidebar.tsx`](src/components/hub/HubSidebar.tsx) - To be replaced by MainSidebar
- [`HubHomePage.tsx`](src/components/hub/HubHomePage.tsx) - To be enhanced

**State Management**:
- [`useHubStore`](src/lib/state/hub-store.ts) - Existing hub state (keep for compatibility)
- [`useLayoutStore`](src/lib/state/layout-store.ts) - New unified layout store (to be created)

---

**Document Ends**

*For questions or clarifications, contact PM team.*
