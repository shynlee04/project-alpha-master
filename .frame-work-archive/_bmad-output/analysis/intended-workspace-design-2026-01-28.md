# Intended Project Workspace Design Analysis

**Date**: 2026-01-28
**Author**: ux-designer-ext (automated analysis)
**Status**: COMPLETE
**Purpose**: Document INTENDED design vs CURRENT implementation for `/$projectId` route

---

## 1. INTENDED LAYOUT SPECIFICATION

### 1.1 Desktop Full Layout (>= 1280px)

Per **UX Specification v3.0.0 Section 04-responsive-grid.md**:

```
Desktop Full Layout (>= 1280px)

+------+------+--------+----------------+----------+------+
| 0.5  | 0.5  |   2    |       4        |   2.5    | 0.5  |
+------+------+--------+----------------+----------+------+
|Global|Act.  |Plugin  |Main Content    |Plugin    |Act.  |
|Side- |Bar   |Left    |(Notes/Monaco)  |Right     |Bar   |
|bar   |LEFT  |(Files) |+Activity TOP   |(Chat)    |RIGHT |
+------+------+--------+----------------+----------+------+
| 48px | 48px |minmax  |   minmax       | minmax   | 48px |
|      |      |200,1fr |  400,2fr       | 250,1.25 |      |
+------+------+--------+----------------+----------+------+
```

**CSS Implementation (from spec):**

```css
.project-space--desktop {
  display: grid;
  grid-template-columns:
    var(--sidebar-width)              /* 48px */
    var(--activity-bar-width)         /* 48px */
    minmax(var(--panel-left-min), 1fr)  /* 200-320px */
    minmax(var(--main-content-min), 2fr) /* 400px+ */
    minmax(var(--panel-right-min), 1.25fr) /* 250-400px */
    var(--activity-bar-width);        /* 48px */
  grid-template-rows:
    var(--header-height)              /* 48px */
    1fr
    var(--status-bar-height);         /* 24px */
  grid-template-areas:
    "header header header header header header"
    "sidebar activity-left panel-left main panel-right activity-right"
    "status status status status status status";
}
```

### 1.2 Activity Bar System

Per **Section 08-activity-bar-docker.md**:

| Position | Panel | Orientation | Plugins | Behavior |
|----------|-------|-------------|---------|----------|
| **LEFT** | Left plugin panel | Vertical | FileTree (locked) | Controls left panel content |
| **TOP** | Main content | Horizontal | Notes, Monaco, Preview | Controls main content |
| **RIGHT** | Right plugin panel | Vertical | Chat (locked) | Controls right panel content |

```
LEFT ACTIVITY BAR               TOP ACTIVITY BAR (in main)
+--------+                      +----------------------------------+
|[Folder]| <- Locked (FileTree) | [Note][Code][Eye]                |
+--------+                      +----------------------------------+
|  [+]   | <- Add (if allowed)       ^     ^    ^
+--------+                      Notes Monaco Preview

RIGHT ACTIVITY BAR
+--------+
|[Chat]  | <- Locked (agent-chat)
+--------+
|  [+]   | <- Add (if allowed)
+--------+
```

### 1.3 Plugin Panel Structure

Per **Section 09-plugin-interfaces.md**:

```
+-------------------------------------+
| Plugin Header (title, actions)      |  36px
+-------------------------------------+
| Tabbed Sub-navigation (optional)    |  32px
+-------------------------------------+
|                                     |
| Plugin Content Area                 |  flex-1
| (scrollable)                        |
|                                     |
+-------------------------------------+
| Plugin Footer (status, actions)     |  28px
+-------------------------------------+
```

### 1.4 Plugin System Overview

Per **Section 07-plugin-architecture.md**:

| Plugin ID | Name | Description | Always Loaded | Default Position |
|-----------|------|-------------|---------------|------------------|
| `file-tree-project-management` | Project Files | File explorer, project switcher, CRUD | **Yes** | Left panel |
| `notes` | Notes Editor | Markdown/BlockNote document editing | **Yes** | Main content |
| `agent-chat-cascade` | AI Chat | Thread management, agent orchestration | **Yes** | Right panel |
| `monaco-editor` | Code Editor | Full Monaco IDE experience | No | Main content |
| `preview` | Live Preview | WebContainer preview (POST-MVP) | No | Main content |
| `terminal` | Terminal | Command line interface (POST-MVP) | No | Bottom panel |

---

## 2. CURRENT IMPLEMENTATION (Gap Analysis)

### 2.1 What's Implemented

**Current Route Structure (`src/routes/$projectId.tsx`):**

```tsx
<PluginCoordinationProvider>
  <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <PluginLayout />
      </div>
    </div>
  </ProjectContextProvider>
</PluginCoordinationProvider>
```

**Current PluginLayout (`src/presentation/layouts/PluginLayout.tsx`):**

Uses a **Bento Grid System** (asymmetric CSS Grid):

```
2 Plugins (Core):
+---------------------------+---------------------------+
|          CHAT             |         FILETREE          |
|         (60%)             |          (40%)            |
+---------------------------+---------------------------+

3 Plugins (L-Shape):
+-------------------+---------------+
|       CHAT        |   FILETREE    |
+-------------------+---------------+
|        MAIN CONTENT               |
+-----------------------------------+

4 Plugins (2x2 Asymmetric):
+----------+---------------+
|   CHAT   |    MONACO     |
+----------+---------------+
| FILETREE |  PREVIEW/TERM |
+----------+---------------+

5 Plugins (Full Bento):
+----------------+----------+
|     CHAT       | FILETREE |
+----------------+----------+
|       MONACO (100%)       |
+----------------+----------+
|  TERMINAL(40%) | PREVIEW  |
+----------------+----------+
```

### 2.2 Gap Analysis Table

| Aspect | INTENDED (UX Spec) | CURRENT (Implementation) | Gap Level |
|--------|-------------------|-------------------------|-----------|
| **Layout System** | 6-column CSS Grid with fixed ratios | Bento Grid (asymmetric, flexible) | **MAJOR** |
| **Global Sidebar** | 48px persistent sidebar (left) | Missing from `/$projectId` | **CRITICAL** |
| **Activity Bar LEFT** | Vertical bar beside FileTree | Missing | **CRITICAL** |
| **Activity Bar RIGHT** | Vertical bar beside Chat | Missing | **CRITICAL** |
| **Activity Bar TOP** | Horizontal bar in main content | Missing | **CRITICAL** |
| **Header** | 48px with preset selector, plugin toggles | Using PluginToggleBar in different location | **MAJOR** |
| **StatusBar** | 24px bottom rail | Not implemented in route | **MAJOR** |
| **Plugin Positions** | Fixed: FileTree=Left, Chat=Right, Main=flexible | Bento arrangement (Chat top-left) | **MAJOR** |
| **Panel Sizing** | Fixed ratios (0.5:0.5:2:4:2.5:0.5) | Dynamic bento (toggle-based) | **MAJOR** |
| **Drag-Drop** | Swap positions only, no resize | Implemented in DraggableBentoCell | **PARTIAL** |
| **Always-Loaded Plugins** | FileTree + Chat locked | chat + filetree in ALWAYS_LOADED_PLUGINS | **ALIGNED** |

### 2.3 Missing Components

| Component | Spec Location | Implementation Status |
|-----------|--------------|----------------------|
| `GlobalSidebar` | 05-global-components.md | EXISTS but not in route |
| `GlobalHeader` | 05-global-components.md | EXISTS but incomplete |
| `StatusBar` | 05-global-components.md | EXISTS but not in route |
| `ActivityBar` (left/right/top) | 08-activity-bar-docker.md | **NOT IMPLEMENTED** |
| `PluginDocker` | 08-activity-bar-docker.md | **NOT IMPLEMENTED** |
| `PluginPanel` | 09-plugin-interfaces.md | Partial (PluginPanel.tsx exists) |

---

## 3. KEY DESIGN DECISIONS

### 3.1 Activity Bar Behavior (Intended)

Per Section 08:

| Action | Behavior | Keyboard |
|--------|----------|----------|
| **Click** | Activate plugin, show in panel | - |
| **Double-click** | Expand/maximize plugin panel | - |
| **Keyboard** | Quick switch to plugin | `Cmd/Ctrl + 1-6` |
| `Cmd/Ctrl + B` | Toggle left panel visibility | - |
| `Cmd/Ctrl + J` | Toggle right panel visibility | - |

### 3.2 Plugin Docker Constraints (Intended)

| Constraint | Value | Current |
|------------|-------|---------|
| Max plugins per device (desktop) | 4 | 5 in bento |
| Max plugins per device (tablet) | 2 | Not enforced |
| Max plugins per device (mobile) | 1 | Enforced |
| Always-loaded plugins | 2 | 2 |
| Panel position lock | Yes for always-loaded | Not enforced |

### 3.3 Hierarchy (Primary/Secondary Panels)

Per intended design:

1. **PRIMARY**: Main Content Area (Notes/Monaco/Preview)
   - Largest area (ratio 4)
   - Activity bar TOP controls content
   - Default: Notes plugin

2. **SECONDARY Left**: FileTree
   - Fixed position (locked)
   - Cannot be moved or removed
   - Ratio 2 (200-320px)

3. **SECONDARY Right**: Chat
   - Fixed position (locked)
   - Cannot be moved or removed
   - Ratio 2.5 (250-400px)

4. **TERTIARY**: Bottom Panel (Terminal)
   - POST-MVP feature
   - Toggle via StatusBar

---

## 4. REFERENCES

### 4.1 Authoritative Documents

| Document | Version | Section | Key Content |
|----------|---------|---------|-------------|
| `ux-specification/04-responsive-grid.md` | 3.0.0 | 4.2 | Desktop Layout Specification |
| `ux-specification/07-plugin-architecture.md` | 3.0.0 | 7.1-7.6 | Plugin System Overview |
| `ux-specification/08-activity-bar-docker.md` | 3.0.0 | 8.1-8.4 | Activity Bar Specification |
| `ux-specification/09-plugin-interfaces.md` | 3.0.0 | 9.1-9.6 | Plugin Panel Structure |
| `ux-specification/05-global-components.md` | 3.0.0 | 5.1-5.5 | Sidebar, Header, StatusBar |
| `architecture.md` | 3.0.0 | Plugin System | Plugin Registry, Lifecycle |
| `prd.md` | 2.0.0 | Phase 1 | Plugin System Requirements |

### 4.2 Current Implementation Files

| File | Purpose | Gap Status |
|------|---------|------------|
| `src/routes/$projectId.tsx` | Route definition | Missing global components |
| `src/presentation/layouts/PluginLayout.tsx` | Bento grid | Different system than spec |
| `src/presentation/layouts/bento-layouts.ts` | Layout definitions | Not in spec (deviation) |
| `src/presentation/layouts/workflow-presets.ts` | Presets | Partially aligned |
| `src/presentation/layouts/BentoGridStore.ts` | State | Different from spec |
| `src/presentation/components/layout/PluginToggleBar.tsx` | Toggle UI | Exists, not as Activity Bar |

---

## 5. RECOMMENDATIONS

### 5.1 High Priority (P0)

1. **Implement Activity Bar System**
   - Create `ActivityBar` component per spec (08-activity-bar-docker.md)
   - Add left, right, and top variants
   - Wire to plugin switching

2. **Add Global Components to Route**
   - Include `GlobalSidebar` (currently missing from `/$projectId`)
   - Include `StatusBar` at bottom
   - Ensure `GlobalHeader` has preset selector

3. **Fix Plugin Position Locking**
   - FileTree MUST be in left panel always
   - Chat MUST be in right panel always
   - Only main content should be switchable

### 5.2 Medium Priority (P1)

4. **Align Grid System**
   - Consider replacing bento with spec's 6-column grid
   - OR document deviation in ADR

5. **Implement Panel Constraints**
   - Enforce min/max widths per spec
   - Implement panel visibility toggles (Cmd+B, Cmd+J)

### 5.3 Decision Needed

**Question**: Should we keep the Bento Grid system (current) or implement the 6-column fixed grid (spec)?

| Option | Pros | Cons |
|--------|------|------|
| **Keep Bento** | Already implemented, flexible | Doesn't match spec, different UX |
| **Implement Spec** | Matches UX spec, predictable | Requires significant refactor |
| **Hybrid** | Best of both | More complexity |

**Recommendation**: Document the Bento system as an ADR deviation OR create story to align with spec. Current visual mess is likely due to missing Activity Bars and GlobalSidebar, not the grid system itself.

---

## 6. CONCLUSION

The `/$projectId` route has a **partial implementation** that deviates significantly from the UX specification:

- **Working**: Bento grid layout, plugin rendering, mobile navigation
- **Missing**: Activity Bars, GlobalSidebar integration, StatusBar, fixed panel positions
- **Deviated**: Using Bento system instead of 6-column fixed grid

The "visual mess" is likely caused by:
1. Missing Activity Bars for navigation context
2. Missing GlobalSidebar for project-level navigation
3. Missing StatusBar for system status
4. Plugins not locked to their intended positions (Chat on left instead of right)

**Next Steps**:
1. Create EPIC or stories for Activity Bar implementation
2. Integrate GlobalSidebar and StatusBar into route
3. Document Bento Grid as intentional deviation OR plan refactor

---

*Generated by ux-designer-ext analysis - 2026-01-28*
