# EPIC-UXUI-03-PLUGIN-LAYOUT: UX Specification Complete Alignment - Plugin-Centric Activity Bar System

---

## Frontmatter

```yaml
id: EPIC-UXUI-03-PLUGIN-LAYOUT
title: "UX Specification Complete Alignment - Plugin-Centric Activity Bar System"
created: 2026-01-28 08:23:52
updated: 2026-01-28 11:30:00
status: READY_FOR_EXECUTION
priority: P0 CRITICAL
estimated_effort: 40-55 hours
team_assignment: Team A + Team B (Coordinated)
gap_analysis_ref: "_bmad-output/analysis/UX-SPEC-GAP-ANALYSIS-2026-01-28.md (v2.1.0)"
total_gaps_addressed: 44
stories_count: 17
phases: 5
blocking_dependency: none
```

---

## 1. Executive Summary

This EPIC remediates **44 identified gaps** between the UX Specification and current implementation. The primary focus is implementing the correct **Plugin-Centric Activity Bar System** with:

- GlobalSidebar visible in project routes
- Activity Bar TOP for main content plugin switching
- Floating Plugin Docker palette
- Mobile/Tablet responsive layouts
- Full WCAG 2.1 AA accessibility compliance

---

## 2. Technical Problem Statement

### 2.1 What's Wrong

The current implementation has **significant structural misalignment** with the UX specification:

| Area | Spec Compliance | Current State |
|------|-----------------|---------------|
| **Plugin-Centric Layout** | 30% | Missing GlobalSidebar, Activity Bar TOP |
| **GlobalSidebar** | 0% | `globalSidebar={null}` passed in `$projectId.tsx` |
| **Activity Bar TOP** | 0% | Not implemented - no horizontal variant |
| **Main Content Switching** | 0% | Monaco hardcoded, no plugin selection |
| **Plugin Docker** | 60% | Docked instead of floating overlay |
| **Mobile/Tablet** | 15% | No bottom nav, no tablet portrait layout |
| **Accessibility (ARIA)** | 40% | Missing landmarks, skip links, focus traps |
| **Keyboard Shortcuts** | 50% | Missing Cmd+1-6, Cmd+J shortcuts |

### 2.2 User Impact

- Users **cannot switch between Notes, Monaco, and Preview** in the main content area
- Users **cannot access the GlobalSidebar** from within project routes
- Mobile users have **no bottom navigation** - relying on broken sidebar drawer
- Tablet users see **desktop 6-zone grid on 768px screens** - unusable
- Screen reader users **cannot navigate via ARIA landmarks** - accessibility violation

### 2.3 Business Impact

- **WCAG 2.1 AA non-compliance** blocks enterprise adoption
- **Mobile PWA** blocked by missing responsive layouts
- **Power user workflow** degraded by missing keyboard shortcuts

---

## 3. Root Cause Analysis

### 3.1 Primary Root Cause

**Incorrect wiring in `$projectId.tsx` line 276:**
```tsx
<WorkspaceLayout
  globalSidebar={null}  // VIOLATION: Spec says GlobalSidebar is ALWAYS visible
  mainContent={<MonacoMain width={0} height={0} />}  // VIOLATION: Hardcoded, no switching
  ...
/>
```

### 3.2 Contributing Factors

1. **Missing `'main'` in PanelPosition type** - `usePluginPlacement.ts` only supports `'left' | 'right' | null`
2. **No horizontal ActivityBar variant** - Only vertical orientation implemented
3. **PluginDocker misnamed** - It's a Plugin Panel, not a floating Docker
4. **No responsive breakpoint handling** - Desktop grid used at all screen sizes
5. **No semantic HTML** - `<div>` used instead of `<main>`, `<nav>`, `<aside>`, `<footer>`

### 3.3 Architecture Debt

The spec defines a **3-part Main Content area**:
```
+----------------------------------------------------------+
|     [Activity Bar TOP - Horizontal 48px]                 |
|  [Notes] [Monaco] [Preview]                              |
+----------------------------------------------------------+
|                                                          |
|               Active Plugin Content                      |
|               (Notes / Monaco / Preview)                 |
|                                                          |
+----------------------------------------------------------+
```

Current implementation hardcodes Monaco without Activity Bar TOP or plugin switching.

---

## 4. Success Criteria

### 4.1 Phase 1 (P0 Critical) - MUST COMPLETE

- [ ] GlobalSidebar renders at 48px in all project routes
- [ ] GlobalSidebar can collapse/expand with Cmd+B
- [ ] Activity Bar TOP renders horizontally in main content area
- [ ] Can switch between Notes, Monaco, Preview via Activity Bar TOP
- [ ] `PanelPosition` type includes `'main'`

### 4.2 Phase 2 (P1 Floating Docker) - HIGH PRIORITY

- [ ] Plugin Docker floats at bottom-right (fixed position)
- [ ] Docker shows all plugins in 4-column grid
- [ ] L/M/R badges show current plugin placement
- [ ] Cmd+Shift+P toggles Docker visibility
- [ ] Plugin placements persist to localStorage/Zustand

### 4.3 Phase 3 (P1 Accessibility) - MVP REQUIRED

- [ ] ARIA landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>` with aria-labels
- [ ] Skip link bypasses navigation on Tab
- [ ] Focus trapped inside open modals
- [ ] `aria-live` regions announce sync status changes

### 4.4 Phase 4 (P0 Mobile/Tablet) - IF MVP INCLUDES MOBILE

- [ ] Mobile (< 480px): Bottom nav 56px, full-screen plugin
- [ ] Tablet Portrait (600-767px): Full-screen + bottom nav
- [ ] Bottom sheet pull-up for actions (phone portrait)

### 4.5 Phase 5 (P2/P3 Polish)

- [ ] Activity Bar tooltips with 300ms delay
- [ ] Toast notifications on plugin move
- [ ] Cmd+1-6 switches plugins, Cmd+J toggles right panel
- [ ] `prefers-reduced-motion` disables all animations

---

## 5. Architecture Diagram - Target State

### 5.1 UX Specification Architecture (Target)

```
+----------------------------------------------------------------------------+
|                              WORKSPACE LAYOUT                               |
+--------+--------+----------+------------------------+----------+------------+
|        |        |          |  MAIN CONTENT AREA     |          |            |
| GLOBAL | ACTBAR | PLUGIN   |  +------------------+  | PLUGIN   | ACTBAR     |
| SIDE-  | LEFT   | LEFT     |  | ACTIVITY BAR TOP |  | RIGHT    | RIGHT      |
| BAR    |        |          |  |[Notes][Code][Eye]|  |          |            |
|        |        |          |  +------------------+  |          |            |
| 48px   | 48px   | 200-     |  |                  |  | 250-     | 48px       |
|        |        | 320px    |  |  Active Plugin   |  | 400px    |            |
|        |        |          |  |  Content Area    |  |          |            |
|        |        |          |  |                  |  |          |            |
|        |        |          |  +------------------+  |          |            |
+--------+--------+----------+------------------------+----------+------------+
|                              STATUS BAR (24px)                              |
+----------------------------------------------------------------------------+

                          +==============================+
                          |     FLOATING PLUGIN DOCKER   |  <- Separate overlay
                          |  [Files][Notes][Code][Chat]  |     Fixed bottom-right
                          |    L      M           R      |     z-index: 1000
                          +==============================+
```

### 5.2 Current Implementation (Problem State)

```
+----------------------------------------------------------------------------+
|                              WORKSPACE LAYOUT                               |
+--------+--------+----------+------------------------+----------+------------+
|        |        |          |                        |          |            |
|  NULL  | ACTBAR | PLUGIN   |     MAIN CONTENT       | PLUGIN   | ACTBAR     |
|  (no   | LEFT   | LEFT     |                        | RIGHT    | RIGHT      |
|  side- |        |          |     Monaco Only        |          |            |
|  bar)  |        | (works)  |     (hardcoded)        | (works)  |            |
|        |        |          |                        |          |            |
|        | 48px   | 200-     |     NO ACTIVITY        | 250-     | 48px       |
|        |        | 320px    |     BAR TOP            | 400px    |            |
+--------+--------+----------+------------------------+----------+------------+
|                              STATUS BAR (24px)                              |
+----------------------------------------------------------------------------+

                           NO FLOATING DOCKER EXISTS
```

### 5.3 Mobile/Tablet Architecture (Target)

**Tablet Portrait (600-767px):**
```
+----------------------------------------+
|        [Header: Project + Menu]        |
+----------------------------------------+
|                                        |
|          Active Plugin                 |
|          (Full Screen)                 |
|                                        |
+----------------------------------------+
|  Files  |  Notes  |  Chat  |   More   |
+----------------------------------------+
|              Bottom Nav (56px)         |
```

**Phone Portrait (<480px):**
```
+--------------------------------+
|  [=]  Project Name     [...]  |
+--------------------------------+
|                                |
|      Active Plugin             |
|      (Full Immersion)          |
|                                |
+--------------------------------+
        ^
        | Pull up for actions
+--------------------------------+
|       Bottom Sheet             |
|   Switch Plugin | Settings     |
+--------------------------------+
```

---

## 6. Stories by Phase

### Phase 1: P0 Critical (8-12 hours)

#### UXUI-03-01: Add GlobalSidebar to Project Routes

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-01 |
| **Title** | Add GlobalSidebar to Project Routes |
| **Points** | 2 |
| **Priority** | P0 |
| **Team** | B |
| **Effort** | 1h |
| **Gaps Addressed** | GAP-01 |
| **Dependencies** | None |
| **Time Box** | 60 min |

**Description:**
As a user, I want to see the GlobalSidebar (48px collapsed) when inside a project so that I can navigate to other projects or access settings.

**Acceptance Criteria:**
- [ ] `$projectId.tsx` passes `<MainSidebar />` to `globalSidebar` prop instead of `null`
- [ ] GlobalSidebar renders at 48px width (collapsed state)
- [ ] GlobalSidebar can expand to 240px
- [ ] Cmd+B toggles sidebar collapse state
- [ ] Mobile: GlobalSidebar becomes 320px overlay drawer

**Technical Tasks:**
- [ ] Update `$projectId.tsx` line 276: Change `globalSidebar={null}` to `globalSidebar={<MainSidebar />}`
- [ ] Verify MainSidebar CSS fits 48px grid column
- [ ] Test collapse/expand behavior
- [ ] Test mobile drawer behavior

**Handoff Artifacts:**
- Updated `src/routes/$projectId.tsx`
- Screenshot: GlobalSidebar visible in project view

---

#### UXUI-03-02: Add 'main' to PanelPosition Type

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-02 |
| **Title** | Add 'main' to PanelPosition Type |
| **Points** | 1 |
| **Priority** | P0 |
| **Team** | B |
| **Effort** | 1h |
| **Gaps Addressed** | GAP-04, GAP-14 |
| **Dependencies** | None |
| **Time Box** | 45 min |

**Description:**
As a developer, I want `PanelPosition` to include `'main'` so that plugins can be placed in the main content area.

**Acceptance Criteria:**
- [ ] `PanelPosition` type is `'left' | 'main' | 'right' | null`
- [ ] `usePluginPlacement.ts` handles `'main'` placement
- [ ] TypeScript compiles without errors
- [ ] Unit tests updated for new type

**Technical Tasks:**
- [ ] Update `src/presentation/hooks/usePluginPlacement.ts` line 37
- [ ] Update `PluginActivityDockerWiring.tsx` for 'main' support
- [ ] Add unit test for 'main' placement

**Handoff Artifacts:**
- Updated `usePluginPlacement.ts`
- Passing unit tests

---

#### UXUI-03-03: Create Activity Bar TOP Component

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-03 |
| **Title** | Create Activity Bar TOP Component |
| **Points** | 8 |
| **Priority** | P0 |
| **Team** | A |
| **Effort** | 4-6h |
| **Gaps Addressed** | GAP-02, GAP-06, GAP-15 |
| **Dependencies** | UXUI-03-02 |
| **Time Box** | 4 hours |

**Description:**
As a user, I want a horizontal Activity Bar TOP in the main content area so that I can switch between Notes, Monaco, and Preview plugins.

**Acceptance Criteria:**
- [ ] `ActivityBarTop.tsx` component created with horizontal orientation
- [ ] Height: 48px, full width of main content area
- [ ] Icons for Notes, Monaco (Code), Preview (Eye)
- [ ] Active indicator: 2px bottom border
- [ ] Clicking icon changes active plugin in main content
- [ ] Supports `aria-label` and keyboard navigation

**Technical Tasks:**
- [ ] Create `src/presentation/components/layout/ActivityBarTop.tsx`
- [ ] Define `TOP_ACTIVITY_ITEMS` constant with Notes, Monaco, Preview
- [ ] Implement `useActivityBarTop` hook for state management
- [ ] Add CSS for horizontal orientation in `activity-bar.css`
- [ ] Wire to WorkspaceLayout via new `activityBarTop` prop

**TypeScript Interface:**
```typescript
interface ActivityBarTopItem {
  pluginId: PluginId;
  icon: ReactNode;
  label: string;
  shortcut?: string; // 'Cmd+1', 'Cmd+2', etc.
}

interface ActivityBarTopProps {
  items: ActivityBarTopItem[];
  activePluginId: PluginId | null;
  onItemClick: (pluginId: PluginId) => void;
  className?: string;
}
```

**Handoff Artifacts:**
- New `ActivityBarTop.tsx` component
- Updated `WorkspaceLayout.tsx` with `activityBarTop` slot
- Screenshot: Horizontal activity bar with icons

---

#### UXUI-03-04: Implement Main Content Plugin Switching

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-04 |
| **Title** | Implement Main Content Plugin Switching |
| **Points** | 5 |
| **Priority** | P0 |
| **Team** | A |
| **Effort** | 3-4h |
| **Gaps Addressed** | GAP-03, GAP-16, GAP-20-24 |
| **Dependencies** | UXUI-03-03 |
| **Time Box** | 3 hours |

**Description:**
As a user, I want to switch between Notes, Monaco, and Preview in the main content area by clicking Activity Bar TOP icons.

**Acceptance Criteria:**
- [ ] `MainContentRenderer.tsx` component created
- [ ] Replaces hardcoded `<MonacoMain />` in `$projectId.tsx`
- [ ] Renders active plugin based on `activeMainPluginId` state
- [ ] Supports Notes, Monaco, Preview plugins
- [ ] Plugin content fills available space below Activity Bar TOP
- [ ] Error boundary catches plugin rendering errors

**Technical Tasks:**
- [ ] Create `src/presentation/components/layout/MainContentRenderer.tsx`
- [ ] Update `$projectId.tsx` to use MainContentRenderer
- [ ] Wire Activity Bar TOP clicks to change `activeMainPluginId`
- [ ] Add error boundary for plugin failures
- [ ] Add fallback UI for empty state

**TypeScript Interface:**
```typescript
interface MainContentRendererProps {
  activePluginId: PluginId | null;
  plugins: Map<PluginId, FeaturePlugin>;
  onPluginError: (pluginId: PluginId, error: Error) => void;
  fallback?: ReactNode;
}
```

**Handoff Artifacts:**
- New `MainContentRenderer.tsx` component
- Updated `$projectId.tsx`
- Video: Plugin switching demonstration

---

### Phase 2: P1 High Priority - Floating Docker (10-14 hours)

#### UXUI-03-05: Create Floating Plugin Docker

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-05 |
| **Title** | Create Floating Plugin Docker |
| **Points** | 13 |
| **Priority** | P1 |
| **Team** | A |
| **Effort** | 6-8h |
| **Gaps Addressed** | GAP-05, GAP-17, GAP-25-27 |
| **Dependencies** | Phase 1 complete |
| **Time Box** | 6 hours |

**Description:**
As a user, I want a floating Plugin Docker palette that shows all available plugins so that I can manage plugin placement.

**Acceptance Criteria:**
- [ ] `FloatingPluginDocker.tsx` component created
- [ ] Position: fixed, bottom-right, 80px from bottom
- [ ] Width: 280px, z-index: 1000
- [ ] Draggable header to reposition
- [ ] 4-column grid showing ALL registered plugins
- [ ] Toggle via Cmd+Shift+P keyboard shortcut
- [ ] Clicking plugin icon opens it in appropriate panel

**Technical Tasks:**
- [ ] Create `src/presentation/components/layout/FloatingPluginDocker.tsx`
- [ ] Implement drag-to-reposition with position persistence
- [ ] Create 4-column plugin grid
- [ ] Add Cmd+Shift+P handler to `useKeyboardShortcuts.ts`
- [ ] Style per 8-bit design system (sharp corners, pixel shadows)

**Handoff Artifacts:**
- New `FloatingPluginDocker.tsx` component
- Updated `useKeyboardShortcuts.ts`
- Screenshot: Floating docker at bottom-right

---

#### UXUI-03-06: Add L/M/R Placement Badges

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-06 |
| **Title** | Add L/M/R Placement Badges |
| **Points** | 3 |
| **Priority** | P1 |
| **Team** | A |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-07 |
| **Dependencies** | UXUI-03-05 |
| **Time Box** | 90 min |

**Description:**
As a user, I want to see L/M/R badges on plugin icons in the Docker so that I know where each plugin is currently placed.

**Acceptance Criteria:**
- [ ] Badge shows "L" for left panel placement
- [ ] Badge shows "M" for main content placement
- [ ] Badge shows "R" for right panel placement
- [ ] Badge updates when plugin is moved
- [ ] No badge if plugin is not placed (hidden)

**Technical Tasks:**
- [ ] Add `PlacementBadge` component
- [ ] Wire to `pluginPlacements` state
- [ ] Style badge per 8-bit design (pixel font, contrasting color)

**Handoff Artifacts:**
- Updated `FloatingPluginDocker.tsx` with badges
- Screenshot: Docker showing L/M/R badges

---

#### UXUI-03-07: Persist Plugin Placements

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-07 |
| **Title** | Persist Plugin Placements |
| **Points** | 3 |
| **Priority** | P1 |
| **Team** | A |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-08, GAP-18, GAP-19 |
| **Dependencies** | UXUI-03-06 |
| **Time Box** | 90 min |

**Description:**
As a user, I want my plugin placements to persist across page refresh so that my workspace configuration is saved.

**Acceptance Criteria:**
- [ ] Plugin placements saved to localStorage OR Zustand persist
- [ ] Placements keyed by projectId (per-project config)
- [ ] Placements restored on page load
- [ ] Fallback to platform defaults if no saved config

**Technical Tasks:**
- [ ] Add `persist` middleware to placement store
- [ ] Key storage by `projectId`
- [ ] Add hydration logic for page load
- [ ] Add reset-to-defaults action

**Handoff Artifacts:**
- Updated `usePluginPlacement.ts` with persistence
- Manual test: Refresh page, verify placements persist

---

### Phase 3: P1 Accessibility - MVP Required (8-10 hours)

#### UXUI-03-08: Add ARIA Landmarks

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-08 |
| **Title** | Add ARIA Landmarks |
| **Points** | 5 |
| **Priority** | P1 |
| **Team** | B |
| **Effort** | 3-4h |
| **Gaps Addressed** | GAP-34 |
| **Dependencies** | Phase 1 complete |
| **Time Box** | 3 hours |

**Description:**
As a screen reader user, I want ARIA landmarks so that I can navigate the layout via screen reader shortcuts.

**Acceptance Criteria:**
- [ ] GlobalSidebar wrapped in `<nav aria-label="Main navigation">`
- [ ] Main content wrapped in `<main role="main" aria-label="Project workspace">`
- [ ] Plugin panels wrapped in `<aside aria-label="Plugin sidebar">`
- [ ] StatusBar wrapped in `<footer role="contentinfo" aria-label="Status bar">`
- [ ] VoiceOver/NVDA announces landmarks correctly

**Technical Tasks:**
- [ ] Update `WorkspaceLayout.tsx` to use semantic HTML
- [ ] Add `aria-label` attributes per spec
- [ ] Test with VoiceOver on macOS
- [ ] Document landmark structure

**Handoff Artifacts:**
- Updated `WorkspaceLayout.tsx` with semantic HTML
- VoiceOver test recording or screenshot

---

#### UXUI-03-09: Implement Skip Link

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-09 |
| **Title** | Implement Skip Link |
| **Points** | 3 |
| **Priority** | P1 |
| **Team** | B |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-35 |
| **Dependencies** | UXUI-03-08 |
| **Time Box** | 90 min |

**Description:**
As a keyboard user, I want a skip link so that I can bypass navigation and jump directly to main content.

**Acceptance Criteria:**
- [ ] Skip link is first focusable element in body
- [ ] Visible on focus (sr-only by default)
- [ ] Links to `#main-content` anchor
- [ ] Main content has `tabindex="-1"` to receive focus
- [ ] 8-bit styled (sharp corners, pixel shadow)

**Technical Tasks:**
- [ ] Create `SkipLink.tsx` component
- [ ] Add to root layout before GlobalSidebar
- [ ] Add `id="main-content"` to main content area
- [ ] Style per spec (focus-visible states)

**Handoff Artifacts:**
- New `SkipLink.tsx` component
- Screenshot: Skip link visible on focus

---

#### UXUI-03-10: Focus Trap in Modals

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-10 |
| **Title** | Focus Trap in Modals |
| **Points** | 3 |
| **Priority** | P1 |
| **Team** | B |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-36 |
| **Dependencies** | None |
| **Time Box** | 90 min |

**Description:**
As a keyboard user, I want focus trapped inside open modals so that I don't accidentally interact with background content.

**Acceptance Criteria:**
- [ ] Radix Dialog components trap focus (verify)
- [ ] Custom modals use `FocusTrap` wrapper
- [ ] Escape key closes modal and restores focus
- [ ] Tab cycles within modal only

**Technical Tasks:**
- [ ] Audit all Dialog/Modal components
- [ ] Add `FocusTrap` to any custom modals
- [ ] Test focus behavior in each modal

**Handoff Artifacts:**
- Audit report of modal focus behavior
- Updated custom modals if needed

---

#### UXUI-03-11: Add Live Regions (aria-live)

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-11 |
| **Title** | Add Live Regions (aria-live) |
| **Points** | 3 |
| **Priority** | P1 |
| **Team** | B |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-41 |
| **Dependencies** | None |
| **Time Box** | 90 min |

**Description:**
As a screen reader user, I want sync status changes announced so that I know when my files are saved.

**Acceptance Criteria:**
- [ ] `aria-live="polite"` region for sync status
- [ ] Announces "Syncing...", "Synced", "Sync error" states
- [ ] Uses `sr-only` class (visually hidden)
- [ ] `aria-atomic="true"` for complete announcements

**Technical Tasks:**
- [ ] Create `LiveRegion.tsx` component
- [ ] Add to StatusBar or layout root
- [ ] Wire to sync status state
- [ ] Test with VoiceOver

**Handoff Artifacts:**
- New `LiveRegion.tsx` component
- VoiceOver test of announcements

---

### Phase 4: P0 Mobile/Tablet - IF MVP INCLUDES MOBILE (8-12 hours)

#### UXUI-03-12: Implement Mobile Bottom Nav

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-12 |
| **Title** | Implement Mobile Bottom Nav |
| **Points** | 8 |
| **Priority** | P0 (if mobile MVP) |
| **Team** | A |
| **Effort** | 4-6h |
| **Gaps Addressed** | GAP-28, GAP-30 |
| **Dependencies** | Phase 1 complete |
| **Time Box** | 4 hours |

**Description:**
As a mobile user, I want a bottom navigation bar so that I can switch between plugins on phone-size screens.

**Acceptance Criteria:**
- [ ] Bottom nav renders at 56px height on screens < 480px
- [ ] Shows Files, Notes, Chat icons + More
- [ ] Active plugin highlighted
- [ ] Tapping icon switches to full-screen plugin view
- [ ] More reveals bottom sheet with additional plugins

**Technical Tasks:**
- [ ] Create `BottomNav.tsx` component
- [ ] Add breakpoint detection hook
- [ ] Create `BottomSheet.tsx` for More actions
- [ ] Wire to `activePluginId` state

**TypeScript Interface:**
```typescript
interface BottomNavItem {
  pluginId: PluginId;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activePluginId: PluginId | null;
  onItemClick: (pluginId: PluginId) => void;
  className?: string;
}
```

**Handoff Artifacts:**
- New `BottomNav.tsx` component
- New `BottomSheet.tsx` component
- Mobile responsive test screenshots

---

#### UXUI-03-13: Implement Tablet Portrait Layout

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-13 |
| **Title** | Implement Tablet Portrait Layout |
| **Points** | 8 |
| **Priority** | P0 (if mobile MVP) |
| **Team** | A |
| **Effort** | 4-6h |
| **Gaps Addressed** | GAP-29 |
| **Dependencies** | UXUI-03-12 |
| **Time Box** | 4 hours |

**Description:**
As a tablet user in portrait mode, I want a full-screen plugin view with bottom nav so that I can use the app on a 768px screen.

**Acceptance Criteria:**
- [ ] Layout switches at 600-767px breakpoint
- [ ] Header shows project name + menu
- [ ] Active plugin renders full-screen
- [ ] Bottom nav shows Files, Notes, Chat, More
- [ ] No side panels in portrait mode

**Technical Tasks:**
- [ ] Create `TabletPortraitLayout.tsx` component
- [ ] Add breakpoint detection for 600-767px
- [ ] Create responsive layout switcher
- [ ] Test on iPad simulator

**TypeScript Interface:**
```typescript
interface TabletLayoutProps {
  header: ReactNode;
  activePlugin: ReactNode;
  bottomNav: ReactNode;
  onPluginChange: (pluginId: PluginId) => void;
}

interface LayoutBreakpointState {
  breakpoint: 'desktop' | 'laptop' | 'tablet-landscape' | 'tablet-portrait' | 'phone-landscape' | 'phone-portrait';
  orientation: 'landscape' | 'portrait';
  maxPlugins: 1 | 2 | 3 | 4;
  layoutMode: 'multi-panel' | 'single-panel' | 'full-screen';
}
```

**Handoff Artifacts:**
- New `TabletPortraitLayout.tsx` component
- New `useBreakpoint.ts` hook
- iPad simulator screenshots

---

### Phase 5: P2/P3 Polish (6-8 hours)

#### UXUI-03-14: Add Activity Bar Tooltips

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-14 |
| **Title** | Add Activity Bar Tooltips |
| **Points** | 3 |
| **Priority** | P2 |
| **Team** | B |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-09, GAP-44 |
| **Dependencies** | None |
| **Time Box** | 90 min |

**Description:**
As a user, I want tooltips on Activity Bar icons so that I know what each icon does.

**Acceptance Criteria:**
- [ ] 300ms delay before tooltip appears
- [ ] Tooltip shows plugin name
- [ ] Left Activity Bar: tooltips on right
- [ ] Right Activity Bar: tooltips on left
- [ ] 8-bit styled (sharp corners)

**Technical Tasks:**
- [ ] Add Radix Tooltip to ActivityBar items
- [ ] Configure 300ms delay
- [ ] Style per 8-bit design system

**Handoff Artifacts:**
- Updated `ActivityBar.tsx` with tooltips
- Screenshot: Tooltip visible on hover

---

#### UXUI-03-15: Add Toast Notifications

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-15 |
| **Title** | Add Toast Notifications |
| **Points** | 2 |
| **Priority** | P2 |
| **Team** | B |
| **Effort** | 1h |
| **Gaps Addressed** | GAP-10 |
| **Dependencies** | None |
| **Time Box** | 45 min |

**Description:**
As a user, I want toast notifications when moving plugins so that I get feedback on my actions.

**Acceptance Criteria:**
- [ ] Toast shows "Moving [plugin] to [panel]"
- [ ] Toast auto-dismisses after 3 seconds
- [ ] 8-bit styled toast component
- [ ] Accessible to screen readers

**Technical Tasks:**
- [ ] Add toast on `movePluginToPanel` action
- [ ] Use existing toast infrastructure or add Sonner
- [ ] Style per 8-bit design system

**Handoff Artifacts:**
- Toast integration in plugin movement
- Screenshot: Toast message visible

---

#### UXUI-03-16: Keyboard Shortcuts (Cmd+1-6, Cmd+J)

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-16 |
| **Title** | Keyboard Shortcuts (Cmd+1-6, Cmd+J) |
| **Points** | 3 |
| **Priority** | P2 |
| **Team** | B |
| **Effort** | 2h |
| **Gaps Addressed** | GAP-31, GAP-32 |
| **Dependencies** | UXUI-03-03 (Activity Bar TOP) |
| **Time Box** | 90 min |

**Description:**
As a power user, I want keyboard shortcuts to quickly switch plugins and toggle panels.

**Acceptance Criteria:**
- [ ] Cmd+1 switches to first plugin in Activity Bar TOP
- [ ] Cmd+2 switches to second plugin
- [ ] Cmd+3 switches to third plugin
- [ ] Cmd+J toggles right panel visibility
- [ ] Works on both Mac (Cmd) and Windows (Ctrl)

**Technical Tasks:**
- [ ] Add shortcuts to `useKeyboardShortcuts.ts`
- [ ] Wire to Activity Bar TOP selection
- [ ] Wire Cmd+J to right panel toggle
- [ ] Add to keyboard shortcuts documentation

**Handoff Artifacts:**
- Updated `useKeyboardShortcuts.ts`
- Manual test: All shortcuts work

---

#### UXUI-03-17: prefers-reduced-motion Support

| Field | Value |
|-------|-------|
| **ID** | UXUI-03-17 |
| **Title** | prefers-reduced-motion Support |
| **Points** | 2 |
| **Priority** | P2 |
| **Team** | B |
| **Effort** | 1h |
| **Gaps Addressed** | GAP-37 |
| **Dependencies** | None |
| **Time Box** | 45 min |

**Description:**
As a user with motion sensitivity, I want animations disabled when I have prefers-reduced-motion enabled.

**Acceptance Criteria:**
- [ ] Global CSS disables animations when `prefers-reduced-motion: reduce`
- [ ] Transitions become instant (0.01ms)
- [ ] Custom animations respect preference
- [ ] Tested in macOS System Preferences

**Technical Tasks:**
- [ ] Add global `@media (prefers-reduced-motion: reduce)` rule
- [ ] Audit custom animations for compliance
- [ ] Test with macOS Reduce Motion setting

**Handoff Artifacts:**
- Updated `styles.css` with reduced-motion rules
- macOS test confirmation

---

## 7. Team Assignment Matrix

| Story | Team A | Team B | Notes |
|-------|--------|--------|-------|
| UXUI-03-01 | | X | Simple prop change |
| UXUI-03-02 | | X | Type definition update |
| UXUI-03-03 | X | | HIGH: New component, complex CSS grid |
| UXUI-03-04 | X | | HIGH: State management, plugin rendering |
| UXUI-03-05 | X | | HIGH: Drag-drop, position persistence |
| UXUI-03-06 | X | | State tracking, UI updates |
| UXUI-03-07 | X | | Zustand persist, localStorage |
| UXUI-03-08 | | X | Add role attributes |
| UXUI-03-09 | | X | Single component |
| UXUI-03-10 | | X | Use existing library |
| UXUI-03-11 | | X | Add attributes |
| UXUI-03-12 | X | | HIGH: Responsive layout, touch handlers |
| UXUI-03-13 | X | | HIGH: Layout state machine |
| UXUI-03-14 | | X | Radix tooltip wrapper |
| UXUI-03-15 | | X | Use existing toast system |
| UXUI-03-16 | | X | Add to existing handler |
| UXUI-03-17 | | X | CSS media query |

**Total Effort:**
- Team A (Complex Tasks): 7 stories, ~26-39 hours
- Team B (Simpler Tasks): 10 stories, ~14-16 hours

---

## 8. Dependencies Graph

```
                            +------------------+
                            | UXUI-03-01       |
                            | GlobalSidebar    |
                            +--------+---------+
                                     |
            +------------------+    |    +------------------+
            | UXUI-03-02       |<---+    | (Independent)    |
            | PanelPosition    |         | UXUI-03-10       |
            +--------+---------+         | Focus Trap       |
                     |                   +------------------+
                     v                   | UXUI-03-11       |
            +------------------+         | Live Regions     |
            | UXUI-03-03       |         +------------------+
            | Activity Bar TOP |
            +--------+---------+
                     |
        +------------+------------+
        v                         v
+------------------+     +------------------+
| UXUI-03-04       |     | UXUI-03-16       |
| Main Content     |     | Keyboard Shortcuts|
+--------+---------+     +------------------+
         |
         v [Phase 1 Complete]
         |
+--------+---------+     +------------------+
| UXUI-03-05       |     | UXUI-03-08       |
| Floating Docker  |     | ARIA Landmarks   |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
+------------------+     +------------------+
| UXUI-03-06       |     | UXUI-03-09       |
| L/M/R Badges     |     | Skip Link        |
+--------+---------+     +------------------+
         |
         v
+------------------+
| UXUI-03-07       |
| Persist Placements|
+--------+---------+
         |
         v [Phase 2 Complete]
         |
+------------------+     +------------------+
| UXUI-03-12       |     | UXUI-03-14       |
| Mobile Bottom Nav|     | Tooltips (Indep) |
+--------+---------+     +------------------+
         |               | UXUI-03-15       |
         v               | Toasts (Indep)   |
+------------------+     +------------------+
| UXUI-03-13       |     | UXUI-03-17       |
| Tablet Portrait  |     | Reduced Motion   |
+------------------+     +------------------+
```

---

## 9. Files Requiring Modification

### Critical Files (Phase 1)

| File | Modification | Story |
|------|--------------|-------|
| `src/routes/$projectId.tsx` | Add GlobalSidebar, Activity Bar TOP, replace Monaco | 01, 03, 04 |
| `src/presentation/hooks/usePluginPlacement.ts` | Add 'main' to PanelPosition, persistence | 02, 07 |
| `src/presentation/layouts/WorkspaceLayout.tsx` | Add activityBarTop slot, semantic HTML | 03, 08 |
| `src/styles/workspace-layout.css` | Activity Bar TOP grid area | 03 |

### New Files Required

| File | Purpose | Story |
|------|---------|-------|
| `src/presentation/components/layout/ActivityBarTop.tsx` | Horizontal activity bar | 03 |
| `src/presentation/components/layout/MainContentRenderer.tsx` | Plugin switching | 04 |
| `src/presentation/components/layout/FloatingPluginDocker.tsx` | Floating palette | 05 |
| `src/presentation/components/layout/SkipLink.tsx` | Accessibility skip link | 09 |
| `src/presentation/components/layout/LiveRegion.tsx` | Aria-live announcements | 11 |
| `src/presentation/components/layout/BottomNav.tsx` | Mobile navigation | 12 |
| `src/presentation/components/layout/BottomSheet.tsx` | Mobile actions sheet | 12 |
| `src/presentation/components/layout/TabletPortraitLayout.tsx` | Tablet layout | 13 |
| `src/presentation/hooks/useBreakpoint.ts` | Responsive breakpoints | 12, 13 |

---

## 10. Validation Checklist

### Phase 1 Validation

- [ ] GlobalSidebar visible in `/$projectId` routes
- [ ] GlobalSidebar collapses to 48px
- [ ] Cmd+B toggles sidebar
- [ ] Activity Bar TOP renders horizontally
- [ ] Can switch Notes ↔ Monaco ↔ Preview
- [ ] TypeScript compiles without errors
- [ ] No runtime errors in console

### Phase 2 Validation

- [ ] Floating Docker appears at bottom-right
- [ ] Cmd+Shift+P toggles Docker
- [ ] Docker shows all plugins in 4-column grid
- [ ] L/M/R badges reflect current placement
- [ ] Placements persist across page refresh

### Phase 3 Validation (Accessibility)

- [ ] VoiceOver announces landmarks correctly
- [ ] Skip link appears on Tab, jumps to main content
- [ ] Focus trapped inside dialogs
- [ ] Sync status announced via aria-live

### Phase 4 Validation (Mobile)

- [ ] Bottom nav renders on phone (< 480px)
- [ ] Tablet portrait shows full-screen plugin (600-767px)
- [ ] Tapping icon switches active plugin

### Phase 5 Validation (Polish)

- [ ] Tooltips appear on Activity Bar hover (300ms delay)
- [ ] Toast shows on plugin move
- [ ] Cmd+1-6 switches plugins
- [ ] Cmd+J toggles right panel
- [ ] Reduced motion setting disables animations

---

## 11. Risk Assessment

### High Risk

| Risk | Mitigation |
|------|------------|
| Merge conflicts in shared files | Coordinate with Team A, clear handoff protocol |
| `$projectId.tsx` merge conflicts | Clear handoff protocol, sequential commits |
| Accessibility testing tools unavailable | Manual VoiceOver testing, document results |

### Medium Risk

| Risk | Mitigation |
|------|------------|
| Mobile breakpoint detection edge cases | Extensive device testing matrix |
| Floating Docker z-index conflicts | Audit existing z-index values first |
| Persistence schema migration | Version storage keys, add migration logic |

### Low Risk

| Risk | Mitigation |
|------|------------|
| Tooltip positioning at edges | Radix handles this automatically |
| 8-bit animation timing | CSS variables already defined |

---

## 12. Definition of Done

### Story Level

- [ ] All acceptance criteria met
- [ ] TypeScript compiles without errors (`pnpm typecheck:fast`)
- [ ] Unit tests pass (`pnpm test:fast`)
- [ ] Code reviewed by peer
- [ ] Handoff artifacts created
- [ ] No new console errors

### EPIC Level

- [ ] All Phase 1 stories complete (P0 unblock)
- [ ] All Phase 2 stories complete (P1 Docker)
- [ ] All Phase 3 stories complete (Accessibility MVP)
- [ ] Validation checklist 100% passed
- [ ] Gap analysis updated to reflect resolved gaps
- [ ] AGENTS.md updated with new status

---

## 13. Cross-References

### Related EPICs

| EPIC | Relationship |
|------|--------------|

| EPIC-UXUI-01 | FOUNDATION: Design tokens used for 8-bit styling |
| EPIC-0.6-PLUGIN | OVERLAP: PluginCoordinationContext relates to placement state |

### Gap Analysis Reference

All 44 gaps from `_bmad-output/analysis/UX-SPEC-GAP-ANALYSIS-2026-01-28.md` are addressed:

| Gap Range | Stories Addressing |
|-----------|-------------------|
| GAP-01 to GAP-04 | UXUI-03-01, 02, 03, 04 |
| GAP-05 to GAP-08 | UXUI-03-05, 06, 07 |
| GAP-09 to GAP-10 | UXUI-03-14, 15 |
| GAP-14 to GAP-19 | UXUI-03-02, 04, 05, 07 |
| GAP-20 to GAP-27 | UXUI-03-04, 05 |
| GAP-28 to GAP-30 | UXUI-03-12, 13 |
| GAP-31 to GAP-32 | UXUI-03-16 |
| GAP-34 to GAP-36 | UXUI-03-08, 09, 10 |
| GAP-37 | UXUI-03-17 |
| GAP-41 | UXUI-03-11 |

**POST-MVP (Documented Only):** GAP-33, GAP-38, GAP-39, GAP-40, GAP-42, GAP-43, GAP-44

---

## Document Metadata

```yaml
document_id: EPIC-UXUI-03-PLUGIN-LAYOUT
version: 1.0.0
created: 2026-01-28 08:23:52
created_by: BMAD Sprint Manager
status: READY_FOR_EXECUTION
governance_tier: Tier 2 (Controlled)
ttl: Permanent (iterative document)
validation_status: PENDING
last_validation: null
```

---

**END OF EPIC DOCUMENT**
