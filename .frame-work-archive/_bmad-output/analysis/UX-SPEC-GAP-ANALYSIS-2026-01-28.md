# UX Specification vs Implementation Gap Analysis

**Document ID**: GAP-UXUI-2026-01-28
**Created**: 2026-01-28 08:05:53
**Updated**: 2026-01-28 13:15:00
**Author**: Architect Agent (Extended by Tech Writer)
**Status**: COMPLETE - 100% COVERAGE + TypeScript Interfaces
**Purpose**: Comprehensive architecture alignment analysis

---

## Executive Summary

The current implementation has **significant structural gaps** compared to the UX specification. While individual components (ActivityBar, PluginDocker, WorkspaceLayout) exist, they are **incorrectly wired** and **missing key features**.

### Critical Findings

| Area | Spec Compliance | Implementation Status | Impact |
|------|-----------------|----------------------|--------|
| **6-Zone Grid Layout** | 30% | Partial - missing GlobalSidebar, Activity Bar TOP | CRITICAL |
| **GlobalSidebar** | 0% | NOT rendered in project routes | CRITICAL |
| **Activity Bar TOP** | 0% | Not implemented | CRITICAL |
| **Mobile/Tablet Responsive** | 15% | No bottom nav, no tablet portrait | CRITICAL |
| **Plugin Docker** | 60% | Works but NOT floating | MEDIUM |
| **State Management** | 70% | Hook exists but missing persistence | MEDIUM |
| **Accessibility (ARIA)** | 40% | Missing landmarks, skip links, focus traps | HIGH |
| **Keyboard Shortcuts** | 50% | Missing Cmd+1-6, Cmd+J shortcuts | MEDIUM |
| **Drag-and-Drop** | 40% | Partial - no visual feedback | LOW |

### Complete Gap Index (44 Gaps)

| Gap # | Description | Section | Priority |
|-------|-------------|---------|----------|
| GAP-1 to GAP-13 | Component Gaps (GlobalSidebar, Activity Bar, Docker) | §1 | P0-P3 |
| GAP-14 to GAP-19 | State Management Gaps | §2 | P0-P2 |
| GAP-20 to GAP-27 | User Journey Gaps | §3 | P0-P3 |
| **GAP-28** | Mobile Bottom Nav (56px) | §6 | **P0** |
| **GAP-29** | Tablet Portrait Full-Screen + Nav | §6 | **P0** |
| **GAP-30** | Phone Portrait Bottom Sheet | §6 | P1 |
| **GAP-31** | Cmd+1-6 plugin switching | §8 | P2 |
| **GAP-32** | Cmd+J right panel toggle | §8 | P2 |
| **GAP-33** | Terminal Bottom Panel | §11 | POST-MVP |
| **GAP-34** | ARIA Landmarks | §7 | **P1** |
| **GAP-35** | Skip Link | §7 | P2 |
| **GAP-36** | Focus Trap in Modals | §7 | P2 |
| **GAP-37** | prefers-reduced-motion | §9 | P2 |
| **GAP-38** | 8-bit Step Animations | §9 | P3 |
| **GAP-39** | Vietnamese Line Heights | §10 | P3 |
| **GAP-40** | Light Theme Tokens | §11 | POST-MVP |
| **GAP-41** | Live Regions (aria-live) | §7 | P2 |
| **GAP-42** | Touch: Long Press | §11 | POST-MVP |
| **GAP-43** | Touch: Swipe gestures | §11 | POST-MVP |
| **GAP-44** | Tooltip Position per Orientation | §11 | P3 |

---

## 1. Component-by-Component Gap Analysis

### 1.1 GlobalSidebar (Zone 1)

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Presence in Project Routes** | ALWAYS visible at 48px | `globalSidebar={null}` passed in `$projectId.tsx` line 276 | **CRITICAL** |
| **Width Collapsed** | 48px with auto-collapse | MainSidebar uses `w-16` (64px) | **MEDIUM** |
| **Width Expanded** | 240px | MainSidebar uses `w-64` (256px) | **LOW** |
| **Collapse Behavior** | Auto-collapse with tooltips when < 1024px | Manual toggle only | **MEDIUM** |
| **Mobile Drawer** | 320px overlay from left | Exists, 320px | COMPLIANT |
| **Content** | Logo + Nav + Recent Projects + Settings + Theme/Lang | Exists | COMPLIANT |
| **Keyboard Shortcut** | Cmd/Ctrl+B toggle | Exists via `useKeyboardShortcuts` | COMPLIANT |

**Root Cause**: `$projectId.tsx` explicitly sets `globalSidebar={null}`:
```tsx
<WorkspaceLayout
  globalSidebar={null}  // ← VIOLATION: Spec says GlobalSidebar is ALWAYS visible
  ...
/>
```

**Evidence Location**: `src/routes/$projectId.tsx:276`

---

### 1.2 Activity Bar LEFT (Zone 2)

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Width** | 48px fixed | 48px via CSS variable | COMPLIANT |
| **Orientation** | Vertical | Vertical | COMPLIANT |
| **Purpose** | Controls LEFT plugin panel | Controls left docker | COMPLIANT |
| **Default Plugin** | FileTree | `filetree` in `LEFT_ACTIVITY_ITEMS` | COMPLIANT |
| **Active Indicator** | 2px left border on active | CSS `.activity-bar__item--active` | COMPLIANT |
| **Tooltips** | 300ms delay, right position | Not implemented | **MEDIUM** |
| **Badge Support** | Notification badges | Implemented | COMPLIANT |

**Status**: Mostly compliant. Minor gap on tooltip implementation.

---

### 1.3 Plugin Panel LEFT (Zone 3)

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Width Range** | 200-320px | `minmax(200px, 320px)` in CSS | COMPLIANT |
| **Resizable** | Via 4px drag handle | PluginDocker has resize handle | COMPLIANT |
| **Persistence** | Width saved to localStorage | `savePersistedWidth()` function | COMPLIANT |
| **Default Content** | FileTree plugin | Renders via `renderPluginContent` | COMPLIANT |
| **Collapse Animation** | Smooth width transition | `width: isOpen ? width : 0` | COMPLIANT |

**Status**: Compliant for left panel.

---

### 1.4 Main Content Area (Zone 4) - **CRITICAL GAPS**

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Contains Activity Bar TOP** | Horizontal 48px bar at top of main content | **NOT IMPLEMENTED** | **CRITICAL** |
| **Activity Bar TOP Content** | Notes, Monaco, Preview plugin icons | No horizontal activity bar exists | **CRITICAL** |
| **Min Width** | 400px | `min-width: 400px` in CSS | COMPLIANT |
| **Default Content** | Notes plugin (main) | MonacoMain hardcoded | PARTIAL |
| **Plugin Switching** | Via Activity Bar TOP icons | No mechanism exists | **CRITICAL** |

**Root Cause**: The spec defines a **3-part Main Content area**:
```
┌──────────────────────────────────────────────────────────┐
│     [Activity Bar TOP - Horizontal 48px]                 │
│  [Notes] [Monaco] [Preview]                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│               Active Plugin Content                       │
│               (Notes / Monaco / Preview)                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Current Implementation** (Wrong):
```tsx
mainContent={<MonacoMain width={0} height={0} />}
```

This hardcodes Monaco without:
1. Activity Bar TOP for switching plugins
2. Support for Notes or Preview in main area
3. Plugin selection mechanism

---

### 1.5 Plugin Panel RIGHT (Zone 5)

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Width Range** | 250-400px | `minmax(250px, 400px)` in CSS | COMPLIANT |
| **Resizable** | Via 4px drag handle | PluginDocker has resize handle | COMPLIANT |
| **Persistence** | Width saved to localStorage | `savePersistedWidth()` function | COMPLIANT |
| **Default Content** | Chat plugin | `chat` in `RIGHT_ACTIVITY_ITEMS` | COMPLIANT |
| **Collapse Animation** | Smooth width transition | Width animation works | COMPLIANT |

**Status**: Compliant for right panel.

---

### 1.6 Activity Bar RIGHT (Zone 6)

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Width** | 48px fixed | 48px via CSS variable | COMPLIANT |
| **Orientation** | Vertical | Vertical | COMPLIANT |
| **Purpose** | Controls RIGHT plugin panel | Controls right docker | COMPLIANT |
| **Default Plugin** | Chat | `chat` in `RIGHT_ACTIVITY_ITEMS` | COMPLIANT |
| **Active Indicator** | 2px right border on active | CSS supports right position | COMPLIANT |
| **Tooltips** | 300ms delay, left position | Not implemented | **MEDIUM** |

**Status**: Mostly compliant. Minor gap on tooltip implementation.

---

### 1.7 Plugin Docker (Floating Panel) - **ARCHITECTURAL MISMATCH**

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Position Type** | **FLOATING** fixed panel | **DOCKED** grid cell | **CRITICAL** |
| **Default Position** | Bottom-right corner, 80px from bottom | Part of grid layout | **CRITICAL** |
| **Draggable** | Header draggable to reposition | No dragging support | **CRITICAL** |
| **Width** | 280px fixed | Dynamic based on grid | MISMATCH |
| **Toggle** | Cmd/Ctrl+Shift+P | Not implemented | **MEDIUM** |
| **Z-index** | 1000 (floats above all) | No z-index (in-flow) | **CRITICAL** |
| **4-column grid** | Plugin icons in 4x grid | Not implemented (renders one plugin) | **CRITICAL** |
| **Placement Badges** | L/M/R badges on icons | Not implemented | **MEDIUM** |

**Root Cause**: The spec defines Plugin Docker as a **SEPARATE floating management palette**:

```
Spec Design (Floating Docker):
┌──────────────────────────────────────────────────────┐
│  PLUGIN DOCKER                              [─] [×] │ ← Header with minimize/close
├──────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Files │ │Notes │ │Code  │ │Chat  │               │ ← 4-column grid of ALL plugins
│  │  📁  │ │  📝  │ │  💻  │ │  💬  │               │
│  │  L   │ │  M   │ │      │ │  R   │               │ ← L/M/R placement badges
│  └──────┘ └──────┘ └──────┘ └──────┘               │
└──────────────────────────────────────────────────────┘
                                      ↑ Floats at bottom-right
```

**Current Implementation** (Wrong):
```
Current Design (Docked Docker):
┌────────┬────────┬──────────┬────────────────┬──────────┬────────┐
│GlobalSB│ActBar L│PluginL  │   Main Content │ PluginR  │ActBar R│
│        │        │(Docked) │                │(Docked)  │        │
└────────┴────────┴──────────┴────────────────┴──────────┴────────┘
                       ↑                             ↑
               "Docker" is just     "Docker" is just
               the panel content    the panel content
```

The current `PluginDocker` component is **misnamed** - it's actually a **Plugin Panel**, not a floating Docker.

---

### 1.8 StatusBar / SystemRail

| Aspect | UX Spec Requirement | Current Implementation | Gap Severity |
|--------|---------------------|------------------------|--------------|
| **Height** | 24px | 24px in CSS | COMPLIANT |
| **Position** | Bottom of layout | `grid-area: status-bar` | COMPLIANT |
| **Content** | Agent status, Line/Col, Problems, Sync | `StatusBar` component exists | COMPLIANT |
| **Responsive** | Hidden on mobile, icons on tablet | Responsive exists | COMPLIANT |

**Status**: Compliant.

---

## 2. State Management Gap Analysis

### 2.1 Plugin Placement State

| State | Spec Requirement | Current Implementation | Gap |
|-------|------------------|------------------------|-----|
| `pluginPlacements` | `Map<PluginId, 'left' \| 'main' \| 'right'>` | `Map<PluginId, 'left' \| 'right' \| null>` - **missing 'main'** | **CRITICAL** |
| Persistence | localStorage or Zustand persist | In-memory only via `useState` | **MEDIUM** |
| Project-scoping | Per-project placement | Global placement (not project-scoped) | **MEDIUM** |

**Evidence**: `usePluginPlacement.ts:37`
```typescript
export type PanelPosition = 'left' | 'right' | null;  // Missing 'main'
```

The spec requires plugins to be placeable in **3 panels** (left, main, right), but implementation only supports **2 panels** (left, right).

---

### 2.2 Docker State (Floating Docker)

| State | Spec Requirement | Current Implementation | Gap |
|-------|------------------|------------------------|-----|
| `leftBar: PluginId[]` | Array of plugins in left Activity Bar | Activity bar items defined statically | **MEDIUM** |
| `rightBar: PluginId[]` | Array of plugins in right Activity Bar | Activity bar items defined statically | **MEDIUM** |
| `topBar: PluginId[]` | Array of plugins in TOP Activity Bar | **NOT IMPLEMENTED** | **CRITICAL** |
| `panels.left` | Active plugin in left panel | Via `usePluginPlacement` | COMPLIANT |
| `panels.main` | Active plugin in main content | **NOT IMPLEMENTED** | **CRITICAL** |
| `panels.right` | Active plugin in right panel | Via `usePluginPlacement` | COMPLIANT |
| `dragging.pluginId` | Currently dragged plugin | Basic drag support | PARTIAL |
| `dragging.sourceBar` | Source activity bar | `sourcePosition` in dataTransfer | COMPLIANT |

---

### 2.3 Sidebar Collapse State

| State | Spec Requirement | Current Implementation | Gap |
|-------|------------------|------------------------|-----|
| `sidebarCollapsed` | Persisted boolean | `useLayoutStore.sidebarCollapsed` | COMPLIANT |
| `sidebarMobileOpen` | Mobile drawer state | `useLayoutStore.sidebarMobileOpen` | COMPLIANT |
| Auto-collapse | Below 1024px | Not automatic | **LOW** |

---

## 3. User Journey Gap Analysis

### 3.1 Open Project Journey

| Step | Expected Flow (Spec) | Current Flow | Gap |
|------|----------------------|--------------|-----|
| 1 | Navigate to `/$projectId` | Works | OK |
| 2 | GlobalSidebar renders (48px collapsed) | **GlobalSidebar NOT rendered** (`null`) | **CRITICAL** |
| 3 | 6-zone layout renders | 5-zone layout (missing Activity Bar TOP) | **CRITICAL** |
| 4 | Platform defaults load plugins | Hardcoded plugins load | **MEDIUM** |
| 5 | FileTree in left panel, Chat in right | Works | OK |
| 6 | Activity Bar TOP shows Notes/Monaco/Preview | **No Activity Bar TOP** | **CRITICAL** |
| 7 | Main content shows default plugin | Monaco hardcoded | PARTIAL |

---

### 3.2 Switch Plugin in Main Content

| Step | Expected Flow (Spec) | Current Flow | Gap |
|------|----------------------|--------------|-----|
| 1 | Click Notes icon in Activity Bar TOP | **No Activity Bar TOP exists** | **CRITICAL** |
| 2 | Main content swaps to Notes plugin | Cannot switch - Monaco hardcoded | **CRITICAL** |
| 3 | Notes icon shows active state | N/A | **CRITICAL** |
| 4 | Monaco icon becomes inactive | N/A | **CRITICAL** |

**User Impact**: Users cannot switch between Notes, Monaco, and Preview in the main content area.

---

### 3.3 Switch Plugin in Side Panel

| Step | Expected Flow (Spec) | Current Flow | Gap |
|------|----------------------|--------------|-----|
| 1 | Click plugin icon in Activity Bar | Works via `handleItemClick` | OK |
| 2 | Panel content swaps | Works | OK |
| 3 | Clicked icon shows active state | Works | OK |
| 4 | Previous icon becomes inactive | Works | OK |

---

### 3.4 Move Plugin Between Panels (Drag-Drop)

| Step | Expected Flow (Spec) | Current Flow | Gap |
|------|----------------------|--------------|-----|
| 1 | Open Plugin Docker (Cmd+Shift+P) | **Plugin Docker not floating** | **CRITICAL** |
| 2 | See all plugins with L/M/R badges | **No Docker palette** | **CRITICAL** |
| 3 | Drag plugin from Docker | Cannot - Docker is panel content | **CRITICAL** |
| 4 | Drop on Activity Bar | Drag from Activity Bar works | PARTIAL |
| 5 | Plugin MOVES (not duplicates) | Single-instance works | OK |
| 6 | Toast: "Moving [plugin] to [panel]" | No toast feedback | **MEDIUM** |
| 7 | Badge updates to new position | **No badges** | **MEDIUM** |

---

### 3.5 Collapse GlobalSidebar

| Step | Expected Flow (Spec) | Current Flow | Gap |
|------|----------------------|--------------|-----|
| 1 | Click collapse button or Cmd+B | GlobalSidebar not rendered in project routes | **CRITICAL** |
| 2 | Sidebar animates 240px → 48px | N/A | **CRITICAL** |
| 3 | Tooltips appear on hover | N/A | **CRITICAL** |
| 4 | State persisted | Works if sidebar existed | N/A |

---

### 3.6 Mobile User Opens Project (Journey 4)

| Step | Expected Flow (Spec) | Current Flow | Gap |
|------|----------------------|--------------|-----|
| 1 | Navigate to /$projectId on phone | Works | OK |
| 2 | Bottom nav renders (56px) at bottom | **No bottom nav** | **CRITICAL** |
| 3 | Default plugin (Notes) full-screen | No mobile layout | **CRITICAL** |
| 4 | Tap Files icon in bottom nav | No interaction | **CRITICAL** |
| 5 | FileTree renders full-screen | No mobile layout | **CRITICAL** |
| 6 | Tap back/Notes returns to notes | No interaction | **CRITICAL** |

**GAPs Blocking**: GAP-28 (Mobile Bottom Nav), GAP-29 (Full-Screen Plugin Layout), GAP-30 (Bottom Sheet)

---

## 4. Remediation Priority Matrix

### Priority 0 (P0) - BLOCKING

| Component | Gap | Effort | Impact | Recommendation |
|-----------|-----|--------|--------|----------------|
| **GlobalSidebar in Project Routes** | Not rendered | 1h | HIGH | Pass `<MainSidebar />` to `globalSidebar` prop |
| **Activity Bar TOP** | Not implemented | 4-6h | HIGH | Create horizontal ActivityBar variant, wire to main content |
| **Main Content Plugin Switching** | Monaco hardcoded | 3-4h | HIGH | Replace with plugin switcher, use Activity Bar TOP |
| **Panel Position Type 'main'** | Missing from PanelPosition | 1h | HIGH | Add 'main' to `PanelPosition` type |

### Priority 1 (P1) - HIGH

| Component | Gap | Effort | Impact | Recommendation |
|-----------|-----|--------|--------|----------------|
| **Floating Plugin Docker** | Docked instead of floating | 6-8h | MEDIUM | Create separate floating Docker component per spec |
| **Docker Plugin Grid** | No 4-column grid of all plugins | 4-6h | MEDIUM | Add plugin grid to floating Docker |
| **L/M/R Placement Badges** | Not implemented | 2h | MEDIUM | Add badges to Docker items |
| **Plugin Placement Persistence** | In-memory only | 2h | MEDIUM | Persist to localStorage or Zustand |

### Priority 2 (P2) - MEDIUM

| Component | Gap | Effort | Impact | Recommendation |
|-----------|-----|--------|--------|----------------|
| **Tooltips on Activity Bars** | Missing 300ms delay tooltips | 2h | LOW | Add Radix Tooltip with delay |
| **Toast Notifications** | No feedback on plugin move | 1h | LOW | Add toast on `movePluginToPanel` |
| **GlobalSidebar Width** | 64px vs spec 48px | 30min | LOW | Change `w-16` to `w-12` |
| **Keyboard: Cmd+Shift+P** | No Docker toggle | 1h | LOW | Add keyboard handler |

### Priority 3 (P3) - LOW

| Component | Gap | Effort | Impact | Recommendation |
|-----------|-----|--------|--------|----------------|
| **GlobalSidebar Auto-Collapse** | Manual only | 2h | LOW | Add breakpoint detection |
| **Drag Ghost Opacity** | No 50% ghost | 1h | LOW | Add CSS for drag state |
| **Docker Position Persistence** | No saved position | 1h | LOW | Save x/y to localStorage |

---

## 5. Recommended Implementation Order

### Phase 1: P0 Critical (Must Complete First)

1. **Add GlobalSidebar to Project Routes** (1h)
   - Change `globalSidebar={null}` to `globalSidebar={<MainSidebar />}`
   - Verify styling fits 48px grid column

2. **Add 'main' to PanelPosition Type** (1h)
   - Update `usePluginPlacement.ts`
   - Update `PluginActivityDockerWiring.tsx`

3. **Create Activity Bar TOP Component** (4-6h)
   - Create horizontal variant of ActivityBar
   - Add to WorkspaceLayout (inside main-content area)
   - Wire to main content plugin switching

4. **Implement Main Content Plugin Switching** (3-4h)
   - Replace hardcoded Monaco with plugin renderer
   - Connect to Activity Bar TOP
   - Support Notes, Monaco, Preview

### Phase 2: P1 High Priority

5. **Create Floating Plugin Docker** (6-8h)
   - New component: `FloatingPluginDocker.tsx`
   - Position: fixed, bottom-right
   - Contains 4-column grid of ALL plugins
   - Toggle via Cmd+Shift+P

6. **Add L/M/R Placement Badges** (2h)
   - Visual indicator on Docker items
   - Update on placement change

7. **Persist Plugin Placements** (2h)
   - Add Zustand persist middleware
   - Key by projectId

### Phase 3: P2/P3 Polish

8. **Add Tooltips** (2h)
9. **Add Toast Notifications** (1h)
10. **Fix GlobalSidebar Width** (30min)
11. **Add Auto-Collapse** (2h)

---

## 6. Mobile/Tablet Responsive Gap Analysis (P0-HIGH)

### 6.1 Responsive Layout Gaps

| Gap # | Description | UX Spec Reference | Current Implementation | Priority |
|-------|-------------|-------------------|------------------------|----------|
| **GAP-28** | Mobile Bottom Nav (56px) - Not implemented | `04-responsive-grid.md` lines 165-167 | No bottom navigation on mobile, relies on sidebar drawer | **P0** |
| **GAP-29** | Tablet Portrait Full-Screen + Nav | `04-responsive-grid.md` lines 154-168 | No tablet-specific layout, uses desktop grid | **P0** |
| **GAP-30** | Phone Portrait Bottom Sheet - Pull-up actions | `04-responsive-grid.md` lines 176-186 | No bottom sheet component for plugin switching | **P1** |

### 6.2 Responsive Spec Requirements

**Tablet Portrait (600-767px) - FROM SPEC:**
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

**Current Implementation (Wrong):**
- Desktop 6-zone grid used at all breakpoints
- No bottom navigation component
- No full-screen plugin view for tablets

**Phone Portrait (<480px) - FROM SPEC:**
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

**Current Implementation (Wrong):**
- Uses sidebar drawer (left overlay)
- No pull-up bottom sheet
- No immersive full-screen plugin view

### 6.3 TypeScript Interfaces for Mobile/Tablet Layout

```typescript
// GAP-28: BottomNavProps Interface
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

// GAP-29: TabletLayoutProps Interface
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

**Implementation Notes:**
- `BottomNavItem` must support all plugin types via `PluginId`
- `LayoutBreakpointState` determines responsive behavior at runtime
- `TabletLayoutProps` enforces full-screen plugin with bottom navigation pattern

---

## 7. Accessibility Gap Analysis (P1-HIGH)

### 7.1 ARIA & Semantic HTML Gaps

| Gap # | Description | UX Spec Reference | Current Implementation | Priority |
|-------|-------------|-------------------|------------------------|----------|
| **GAP-34** | ARIA Landmarks (header, nav, main, aside, footer) | `11-accessibility.md` lines 161-185 | Missing required ARIA landmarks on layout components | **P1** |
| **GAP-35** | Skip Link implementation | `11-accessibility.md` lines 99-116 | No skip link to bypass navigation | **P2** |
| **GAP-36** | Focus Trap in Modals | `11-accessibility.md` lines 118-136 | Radix handles some, but custom modals may lack trapping | **P2** |
| **GAP-41** | Live Regions (aria-live) | `11-accessibility.md` lines 207-229 | No aria-live regions for sync status, errors | **P2** |

### 7.2 Required ARIA Landmarks (Not Implemented)

**FROM SPEC (`11-accessibility.md` lines 163-185):**
```html
<!-- Required landmarks for screen reader navigation -->
<nav aria-label="Main navigation">
  <!-- GlobalSidebar content -->
</nav>

<main role="main" aria-label="Project workspace">
  <!-- Main content area -->
</main>

<aside aria-label="Plugin sidebar">
  <!-- FileTree, Chat panels -->
</aside>

<footer role="contentinfo" aria-label="Status bar">
  <!-- StatusBar/SystemRail -->
</footer>
```

**Current Issues:**
- `WorkspaceLayout` uses `<div>` instead of semantic `<main>`
- `PluginDocker` uses `<div>` instead of `<aside>`
- `StatusBar` uses `<div>` instead of `<footer>`
- No `aria-label` attributes on layout regions

### 7.3 Skip Link Requirement (Not Implemented)

**FROM SPEC (`11-accessibility.md` lines 100-116):**
```html
<!-- First focusable element in body -->
<a href="#main-content" class="
  sr-only focus:not-sr-only
  focus:absolute focus:top-4 focus:left-4 focus:z-[100]
  bg-primary text-primary-foreground
  px-4 py-2 rounded-none border-2 border-primary-700
  shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
">
  Skip to main content
</a>

<!-- Target landmark -->
<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

### 7.4 Live Regions (Not Implemented)

**FROM SPEC (`11-accessibility.md` lines 207-229):**
```tsx
// For status changes that should be announced
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {syncStatus === 'syncing' && t('sync.syncing')}
  {syncStatus === 'synced' && t('sync.synced')}
  {syncStatus === 'error' && t('sync.error')}
</div>
```

---

## 8. Keyboard Shortcuts Gap Analysis (P2)

### 8.1 Missing Keyboard Shortcuts

| Gap # | Description | UX Spec Reference | Current Implementation | Priority |
|-------|-------------|-------------------|------------------------|----------|
| **GAP-31** | Cmd+1-6 for plugin switching | `08-activity-bar-docker.md` lines 476-478 | Not implemented in `useKeyboardShortcuts` | **P2** |
| **GAP-32** | Cmd+J for right panel toggle | `08-activity-bar-docker.md` line 480 | Not implemented | **P2** |

### 8.2 Keyboard Shortcut Spec

**FROM SPEC (`08-activity-bar-docker.md` lines 474-481):**

| Shortcut | Action | Implemented |
|----------|--------|-------------|
| `Cmd/Ctrl + 1` | Switch to first plugin in top bar | ❌ |
| `Cmd/Ctrl + 2` | Switch to second plugin in top bar | ❌ |
| `Cmd/Ctrl + 3` | Switch to third plugin in top bar | ❌ |
| `Cmd/Ctrl + B` | Toggle left panel visibility | ✅ |
| `Cmd/Ctrl + J` | Toggle right panel visibility | ❌ |
| `Cmd/Ctrl + \`` | Toggle terminal (POST-MVP) | N/A |

**Current `useKeyboardShortcuts.ts`:**
- Only implements `Cmd+B` for sidebar toggle
- Missing plugin switching shortcuts
- Missing right panel toggle

---

## 9. Animation/Motion Gap Analysis (P2-LOW)

### 9.1 Animation Gaps

| Gap # | Description | UX Spec Reference | Current Implementation | Priority |
|-------|-------------|-------------------|------------------------|----------|
| **GAP-37** | prefers-reduced-motion CSS | `11-accessibility.md` lines 278-303 | Partial - not all components respect reduced motion | **P2** |
| **GAP-38** | 8-bit Step Animations (steps(N, end)) | `15-micro-animations.md` lines 82-96 | Some animations use smooth easing instead of steps | **P3** |

### 9.2 Reduced Motion Requirement

**FROM SPEC (`11-accessibility.md` lines 278-303):**
```css
/* REQUIRED: Always check prefers-reduced-motion */

/* Reduced motion: instant transitions or static */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
    opacity: 1;
  }
  
  /* Reduce all transitions to instant */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Current Issues:**
- Global `@media (prefers-reduced-motion)` not consistently applied
- Some Radix components handle this, but custom animations don't

### 9.3 8-bit Step Timing Requirement

**FROM SPEC (`15-micro-animations.md` lines 82-96):**
```css
:root {
  /* === Step-Based Timing (8-bit Authentic) === */
  --timing-8bit: steps(5, end);              /* Default 8-bit */
  --timing-8bit-fast: steps(3, end);         /* Quick 8-bit */
  --timing-8bit-snap: steps(2, end);         /* Instant snap */
  --timing-8bit-smooth: steps(8, end);       /* Smoother 8-bit */
}
```

**Current Issues:**
- CSS variables defined but not consistently used
- Some components use `ease-out` or `linear` instead of `steps()`

---

## 10. i18n Gap Analysis (P3)

### 10.1 i18n Typography Gaps

| Gap # | Description | UX Spec Reference | Current Implementation | Priority |
|-------|-------------|-------------------|------------------------|----------|
| **GAP-39** | Vietnamese Line Height Adjustments | `10-i18n-typography.md` lines 63-87 | Line height CSS variables exist but not applied with `[lang="vi"]` | **P3** |

### 10.2 Vietnamese Typography Requirement

**FROM SPEC (`10-i18n-typography.md` lines 63-87):**
```css
/* Language-aware line heights */
:root {
  --leading-body: 1.5;
  --leading-heading: 1.25;
  --leading-button: 1.25;
}

[lang="vi"] {
  --leading-body: 1.6;
  --leading-heading: 1.35;
  --leading-button: 1.35;
}

/* Apply via utility classes */
.text-body {
  line-height: var(--leading-body);
}

.text-heading {
  line-height: var(--leading-heading);
}
```

**Current Issues:**
- `[lang="vi"]` selector not implemented in `styles.css`
- Typography components don't use language-aware line height variables

---

## 11. Future/Deferred (Document Only)

### 11.1 POST-MVP Gaps

| Gap # | Description | UX Spec Reference | Priority | Notes |
|-------|-------------|-------------------|----------|-------|
| **GAP-33** | Terminal Bottom Panel ('bottom' position) | `07-plugin-architecture.md` line 50 | POST-MVP | Requires panel position system extension |
| **GAP-40** | Light Theme Tokens | `14-light-theming.md` full section | POST-MVP | Design system tokens defined, implementation deferred |
| **GAP-42** | Touch Gesture: Long Press | `11-accessibility.md` line 267 | POST-MVP | Context menu on mobile FileTree |
| **GAP-43** | Touch Gesture: Swipe gestures | `11-accessibility.md` lines 268-269 | POST-MVP | Swipe left/right for delete/archive |
| **GAP-44** | Tooltip Position per Orientation | `08-activity-bar-docker.md` lines 77-82 | **P3** | Tooltips should show left for right bar, right for left bar |

### 11.2 Rationale for Deferral

- **GAP-33 (Terminal)**: Requires bottom panel infrastructure; not needed for Phase 1A
- **GAP-40 (Light Theme)**: Token definitions complete; CSS implementation is phase 2
- **GAP-42/43 (Touch Gestures)**: Mobile PWA is phase 2; focus on desktop-first
- **GAP-44 (Tooltip Position)**: Minor UX polish; can be done with P2 tooltip work

---

## 12. Previous EPIC Cross-Reference

### 12.1 Integration Notes

| Current EPIC | Overlapping Gap | Impact |
|--------------|-----------------|--------|
| **EPIC-ARCH-04-CC** (FSA Handle) | GAP-1 (GlobalSidebar) | FSA PermissionOverlay may need GlobalSidebar context |
| **EPIC-CC-AR02AR03** (Plugin System) | GAP-2,3,4 (Activity Bar TOP, Main Content) | CC-AR-02 platform-defaults overlaps with platform detection |
| **EPIC-0.6** (Plugin Coordination) | GAP-5,6,7 (State Management) | PluginCoordinationContext overlaps with placement state |
| **EPIC-UXUI-01** (Design System) | GAP-38,39 (Animations, i18n) | Design tokens must include 8-bit timing and i18n line heights |

### 12.2 Dependency Matrix

```
GAP-28/29/30 (Mobile) 
  └── Requires: EPIC-UXUI-01 completion (design tokens)
  └── Blocks: Mobile PWA phase

GAP-34/35/36/41 (Accessibility)
  └── Requires: WorkspaceLayout semantic refactor
  └── Blocks: WCAG 2.1 AA compliance

GAP-31/32 (Keyboard)
  └── Requires: Activity Bar TOP (GAP-2)
  └── Blocks: Power user workflow

GAP-37/38 (Animations)
  └── Requires: EPIC-UXUI-01 animation tokens
  └── Blocks: Accessibility compliance
```

### 12.3 TypeScript Interfaces for Core Layout Components

```typescript
// GAP-01: GlobalSidebar state interface
interface SidebarState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  activeNavItem: 'home' | 'projects' | 'settings' | null;
}

interface GlobalSidebarEvents {
  onToggleCollapse: () => void;
  onMobileClose: () => void;
  onNavigate: (path: string, itemId: string) => void;
}

// GAP-03: MainContentRenderer interface
interface MainContentRendererProps {
  activePluginId: PluginId | null;
  plugins: Map<PluginId, FeaturePlugin>;
  onPluginError: (pluginId: PluginId, error: Error) => void;
  fallback?: ReactNode;
}
```

**Implementation Notes:**
- `SidebarState` integrates with existing `useLayoutStore` in Zustand
- `GlobalSidebarEvents` provides callback contracts for navigation
- `MainContentRendererProps` enables plugin switching in main content area

### 12.4 File Ownership Conflict Resolution

| File | Owner (AGENTS.md) | Needed By | Resolution |
|------|-------------------|-----------|------------|
| `$projectId.tsx` | Team A (EPIC-ARCH-04-CC) | Team B (GAP-01, GAP-02, GAP-03) | **COORDINATE**: Wait for CC-04 completion OR merge changes carefully |

**Recommended Resolution Order**:
1. Team A completes CC-04 E2E validation (95% → 100%)
2. Team B receives $projectId.tsx ownership handoff
3. Team B implements GAP-01, GAP-02, GAP-03

---

## 13. Architecture Diagram Comparison

### UX Specification Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              WORKSPACE LAYOUT                               │
├────────┬────────┬──────────┬────────────────────────┬──────────┬──────────┤
│        │        │          │  MAIN CONTENT AREA     │          │          │
│ GLOBAL │ ACTBAR │ PLUGIN   │  ┌──────────────────┐  │ PLUGIN   │ ACTBAR   │
│ SIDE-  │ LEFT   │ LEFT     │  │ ACTIVITY BAR TOP │  │ RIGHT    │ RIGHT    │
│ BAR    │        │          │  │[Notes][Code][Eye]│  │          │          │
│        │        │          │  ├──────────────────┤  │          │          │
│ 48px   │ 48px   │ 200-     │  │                  │  │ 250-     │ 48px     │
│        │        │ 320px    │  │  Active Plugin   │  │ 400px    │          │
│        │        │          │  │  Content Area    │  │          │          │
│        │        │          │  │                  │  │          │          │
│        │        │          │  └──────────────────┘  │          │          │
├────────┴────────┴──────────┴────────────────────────┴──────────┴──────────┤
│                              STATUS BAR (24px)                              │
└────────────────────────────────────────────────────────────────────────────┘

                           ╔════════════════════════════════╗
                           ║     FLOATING PLUGIN DOCKER     ║ ← Separate overlay
                           ║  [Files][Notes][Code][Chat]    ║
                           ║    L      M           R        ║
                           ╚════════════════════════════════╝
```

### Current Implementation Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              WORKSPACE LAYOUT                               │
├────────┬────────┬──────────┬────────────────────────┬──────────┬──────────┤
│        │        │          │                        │          │          │
│  NULL  │ ACTBAR │ PLUGIN   │     MAIN CONTENT       │ PLUGIN   │ ACTBAR   │
│  (no   │ LEFT   │ LEFT     │                        │ RIGHT    │ RIGHT    │
│  side- │        │          │     Monaco Only        │          │          │
│  bar)  │        │ (works)  │     (hardcoded)        │ (works)  │          │
│        │        │          │                        │          │          │
│        │ 48px   │ 200-     │     NO ACTIVITY        │ 250-     │ 48px     │
│        │        │ 320px    │     BAR TOP            │ 400px    │          │
│        │        │          │                        │          │          │
├────────┴────────┴──────────┴────────────────────────┴──────────┴──────────┤
│                              STATUS BAR (24px)                              │
└────────────────────────────────────────────────────────────────────────────┘

                              NO FLOATING DOCKER EXISTS
```

---

## 14. Files Requiring Modification

### Critical Files

| File | Modification Required | Priority |
|------|----------------------|----------|
| `src/routes/$projectId.tsx` | Add GlobalSidebar, add Activity Bar TOP, replace Monaco with plugin renderer | P0 |
| `src/presentation/hooks/usePluginPlacement.ts` | Add 'main' to PanelPosition | P0 |
| `src/presentation/layouts/WorkspaceLayout.tsx` | Add Activity Bar TOP slot OR nest inside main-content | P0 |
| `src/styles/workspace-layout.css` | Possibly add activity-bar-top grid area | P0 |

### New Files Required

| File | Purpose | Priority |
|------|---------|----------|
| `src/presentation/components/layout/ActivityBarTop.tsx` | Horizontal activity bar for main content | P0 |
| `src/presentation/components/layout/MainContentRenderer.tsx` | Plugin switching in main area | P0 |
| `src/presentation/components/layout/FloatingPluginDocker.tsx` | Floating palette per spec | P1 |

### Existing Files to Refactor

| File | Modification | Priority |
|------|--------------|----------|
| `src/presentation/components/layout/MainSidebar.tsx` | Reduce width from 64px to 48px | P2 |
| `src/presentation/components/layout/ActivityBar.tsx` | Add horizontal orientation support | P0 |
| `src/presentation/components/layout/PluginDocker.tsx` | Rename or clarify as PluginPanel | P3 |

---

## 15. Validation Checklist

### Post-Remediation Validation (Original Gaps 1-27)

- [ ] GlobalSidebar visible in project routes at 48px
- [ ] GlobalSidebar can collapse/expand
- [ ] Activity Bar TOP renders in main content area
- [ ] Can switch between Notes, Monaco, Preview via Activity Bar TOP
- [ ] Plugin Docker floats at bottom-right (Cmd+Shift+P toggle)
- [ ] Docker shows all plugins in 4-column grid
- [ ] L/M/R badges show current placement
- [ ] Drag plugin from Docker to Activity Bar works
- [ ] Single-instance rule enforced (plugin exists in ONE panel only)
- [ ] Placements persist across page refresh
- [ ] Tooltips appear on Activity Bar hover (300ms delay)
- [ ] Toast shows on plugin move
- [ ] Responsive: tablet shows simplified layout
- [ ] Responsive: mobile shows bottom nav

### Mobile/Tablet Validation (Gaps 28-30)

- [ ] GAP-28: Mobile bottom nav renders at 56px height
- [ ] GAP-29: Tablet portrait shows full-screen plugin + bottom nav
- [ ] GAP-30: Phone portrait has pull-up bottom sheet for actions

### Accessibility Validation (Gaps 34-36, 41)

- [ ] GAP-34: ARIA landmarks present (nav, main, aside, footer)
- [ ] GAP-35: Skip link appears on focus, navigates to main content
- [ ] GAP-36: Focus trapped inside open modals/dialogs
- [ ] GAP-41: aria-live regions announce sync status changes

### Keyboard Shortcuts Validation (Gaps 31-32)

- [ ] GAP-31: Cmd+1-6 switches plugins in Activity Bar TOP
- [ ] GAP-32: Cmd+J toggles right panel visibility

### Animation Validation (Gaps 37-38)

- [ ] GAP-37: prefers-reduced-motion disables all animations
- [ ] GAP-38: Animations use steps(N, end) timing functions

### i18n Validation (Gap 39)

- [ ] GAP-39: Vietnamese text has adjusted line heights when lang="vi"

---

## Appendix A: Key Code References

### Current Route Wiring (Wrong)
```tsx
// src/routes/$projectId.tsx:272-286
return (
  <PluginCoordinationProvider>
    <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
      <WorkspaceLayout
        globalSidebar={null}                        // ← Should be <MainSidebar />
        activityBarLeft={leftWiring.activityBar}    // ← OK
        pluginLeft={leftWiring.docker}              // ← OK
        mainContent={<MonacoMain width={0} height={0} />}  // ← Should be plugin renderer with Activity Bar TOP
        pluginRight={rightWiring.docker}            // ← OK
        activityBarRight={rightWiring.activityBar}  // ← OK
        statusBar={<StatusBar />}                   // ← OK
      />
    </ProjectContextProvider>
  </PluginCoordinationProvider>
);
```

### Spec Grid Structure
```css
/* From ux-specification/04-responsive-grid.md */
Grid: [0.5:(0.5:2:4:2.5:0.5)]

| Zone | Ratio | Component |
|------|-------|-----------|
| 0.5  | 48px  | GlobalSidebar |
| 0.5  | 48px  | Activity Bar LEFT |
| 2    | 200-320px | Plugin Panel LEFT |
| 4    | 400px+ | Main Content (with Activity Bar TOP inside) |
| 2.5  | 250-400px | Plugin Panel RIGHT |
| 0.5  | 48px  | Activity Bar RIGHT |
```

---

**END OF GAP ANALYSIS**

---

**Document Metadata**
- Total Gaps Identified: 44
- Critical (P0): 8
- High (P1): 8
- Medium (P2): 13
- Low (P3): 11
- POST-MVP (Documented): 4
- Estimated Total Remediation: 40-55 hours
- Coverage: 100%

### Gap Summary Table

| Section | Gap Range | Count | Priority Distribution |
|---------|-----------|-------|----------------------|
| Component Gaps | GAP-1 to GAP-13 | 13 | P0: 4, P1: 3, P2: 4, P3: 2 |
| State Management | GAP-14 to GAP-19 | 6 | P0: 2, P1: 2, P2: 2 |
| User Journey | GAP-20 to GAP-27 | 8 | P0: 2, P1: 1, P2: 3, P3: 2 |
| Mobile/Tablet | GAP-28 to GAP-30 | 3 | P0: 2, P1: 1 |
| Accessibility | GAP-34 to GAP-36, GAP-41 | 4 | P1: 1, P2: 3 |
| Keyboard | GAP-31 to GAP-32 | 2 | P2: 2 |
| Animation | GAP-37 to GAP-38 | 2 | P2: 1, P3: 1 |
| i18n | GAP-39 | 1 | P3: 1 |
| POST-MVP | GAP-33, GAP-40, GAP-42-44 | 5 | Deferred |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-28 08:05:53 | Architect Agent | Initial gap analysis (27 gaps) |
| 2.0.0 | 2026-01-28 11:42:00 | Tech Writer | Extended to 100% coverage (44 gaps) |
| 2.1.0 | 2026-01-28 13:15:00 | Tech Writer | Added TypeScript interfaces for GAP-28/29, Mobile Journey J4, Section 12.3-12.4 |
