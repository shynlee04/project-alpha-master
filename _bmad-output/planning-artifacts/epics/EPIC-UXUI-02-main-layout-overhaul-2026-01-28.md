---
id: EPIC-UXUI-02
title: Main Layout Overhaul - UX Spec v3.0.0 Implementation
version: 1.0.0
created: 2026-01-28
status: READY_FOR_EXECUTION
priority: P0
owner: Team B (UX)
blocked_by: null
blocks: EPIC-UXUI-03
estimated_effort: 22-32h
sprint: SPRINT-2026-01-28
ux_spec_version: 3.0.0
---

# EPIC-UXUI-02: Main Layout Overhaul

## Executive Summary

Replace the broken Bento Grid layout with UX Specification v3.0.0's 6-column CSS Grid layout. This is a **P0 BLOCKER** because EPIC-UXUI-01's design tokens exist but the app doesn't visibly use them due to wrong layout structure.

### Current State (BROKEN)

```
Current: Bento Grid with random positions
+---------------------------------------+
|  [Plugin A]  |       [Plugin B]       |
+--------------+-----------+-----------+
|  [Plugin C]  | [Chat?]   | [Files?]  |
+--------------+-----------+-----------+
- Plugins positioned by count (2,3,4,5 layouts)
- No Activity Bars
- No GlobalSidebar in project route
- Chat in wrong position (should be RIGHT)
- Drag-to-swap enabled (spec says LOCKED)
- Light theme toggle does nothing (hardcoded zinc-*)
```

### Target State (UX Spec v3.0.0)

```
+------+------+--------+----------------+----------+------+
|Global|Act.  |Plugin  |Main Content    |Plugin    |Act.  |
|Side- |Bar   |Left    |(Notes/Monaco)  |Right     |Bar   |
|bar   |LEFT  |(Files) |+Activity TOP   |(Chat)    |RIGHT |
+------+------+--------+----------------+----------+------+
| 48px | 48px |minmax  |   minmax       | minmax   | 48px |
|      |      |200,320 |  400px+        | 250,400  |      |
+------+------+--------+----------------+----------+------+
|           StatusBar (24px)                              |
+---------------------------------------------------------+
```

---

## Success Criteria

1. **Visible Layout Change**: App renders with 6-column grid layout
2. **Light Theme Works**: Toggle light theme → ALL components change colors
3. **Plugin Drag Behavior**: Plugins CAN drag between panels, ONE instance per plugin
4. **Activity Bars Visible**: Left, Top, Right activity bars with icons
5. **StatusBar Visible**: 24px bottom bar with sync/status info
6. **GlobalSidebar Present**: 48px sidebar visible in project route
7. **8-bit Compliance**: All new components pass VALIDATION-CHECKLIST.md
8. **No Zinc Hardcoding**: All colors use design tokens
9. **Build Passes**: `pnpm tsc --noEmit && pnpm vitest run`
10. **Responsive**: Layouts adapt at breakpoints (mobile, tablet, desktop)

---

## NO BLOCKERS - All CC-AR-xx References DEPRECATED

**CRITICAL**: The following are DEPRECATED and should be IGNORED:
- CC-AR-01 through CC-AR-08 - DOES NOT EXIST
- EPIC-CC-AR02AR03 - DOES NOT EXIST  
- Any "Do Not Touch" zones based on deprecated EPICs

**Reason**: User clarified these were hallucinated. Real completed EPICs:
- EPIC-0: Project-Centric Reset ✅
- EPIC-0.5: FileTree Plugin Maturity ✅
- EPIC-0.6: Plugin Coordination Layer ✅
- EPIC-UXUI-01: Design System Foundation ✅

Team B has FULL AUTHORITY to overhaul the layout.

---

## Stories (10 Total)

### Story Dependency Graph

```
UXUI-02-01 (WorkspaceLayout Shell)
    ↓
UXUI-02-02 (ActivityBar Component)
    ↓
UXUI-02-02b (Plugin Docker Component) ← NEW
    ↓
UXUI-02-03 (Integrate GlobalSidebar)
    ↓
UXUI-02-04 (Plugin Drag-to-Panel Behavior)
    ↓
UXUI-02-04b (Single Instance Plugin Constraint)
    ↓
UXUI-02-05 (Wire ActivityBar + Docker to Plugins)
    ↓
UXUI-02-06 (StatusBar)
    ↓
UXUI-02-07 (Apply Design Tokens)
    ↓
UXUI-02-08 (Archive Bento Grid)
```

---

### UXUI-02-01: Create WorkspaceLayout Shell

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | EPIC-UXUI-01 (design tokens) |

#### Description

Create new WorkspaceLayout component with 6-column CSS Grid to replace PluginLayout's Bento Grid. This is the foundational layout structure.

#### Files to Create

- `src/presentation/layouts/WorkspaceLayout.tsx` (NEW)
- `src/styles/workspace-layout.css` (NEW)

#### CSS Grid Implementation

```css
/* src/styles/workspace-layout.css */
:root {
  /* Grid dimensions (from UX Spec 04-responsive-grid.md) */
  --sidebar-width: 48px;
  --activity-bar-width: 48px;
  --status-bar-height: 24px;
  --header-height: 48px;
  
  /* Panel constraints */
  --panel-left-min: 200px;
  --panel-left-max: 320px;
  --panel-right-min: 250px;
  --panel-right-max: 400px;
  --main-content-min: 400px;
}

/* Desktop Full Layout (>=1280px) */
.workspace-layout {
  display: grid;
  grid-template-columns:
    var(--sidebar-width)
    var(--activity-bar-width)
    minmax(var(--panel-left-min), 1fr)
    minmax(var(--main-content-min), 2fr)
    minmax(var(--panel-right-min), 1.25fr)
    var(--activity-bar-width);
  grid-template-rows:
    1fr
    var(--status-bar-height);
  grid-template-areas:
    "sidebar activity-left panel-left main panel-right activity-right"
    "status status status status status status";
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
  background: hsl(var(--background));
}

/* Grid area classes */
.workspace-layout__sidebar { grid-area: sidebar; }
.workspace-layout__activity-left { grid-area: activity-left; }
.workspace-layout__panel-left { grid-area: panel-left; }
.workspace-layout__main { grid-area: main; }
.workspace-layout__panel-right { grid-area: panel-right; }
.workspace-layout__activity-right { grid-area: activity-right; }
.workspace-layout__status { grid-area: status; }

/* Panel borders (8-bit style) */
.workspace-layout__panel-left,
.workspace-layout__panel-right,
.workspace-layout__main {
  border-right: 2px solid hsl(var(--border));
  overflow: hidden;
}

.workspace-layout__panel-right {
  border-right: none;
  border-left: 2px solid hsl(var(--border));
}

/* Responsive: Laptop (1024-1279px) - Hide right panel */
@media (max-width: 1279px) and (min-width: 1024px) {
  .workspace-layout {
    grid-template-columns:
      var(--sidebar-width)
      var(--activity-bar-width)
      minmax(var(--panel-left-min), 1fr)
      minmax(var(--main-content-min), 2fr)
      var(--activity-bar-width);
    grid-template-areas:
      "sidebar activity-left panel-left main activity-right"
      "status status status status status";
  }
  .workspace-layout__panel-right {
    display: none;
  }
}

/* Responsive: Tablet (768-1023px) - Single panel */
@media (max-width: 1023px) and (min-width: 768px) {
  .workspace-layout {
    grid-template-columns:
      var(--sidebar-width)
      minmax(var(--panel-left-min), 1fr)
      minmax(var(--main-content-min), 2fr);
    grid-template-areas:
      "sidebar panel-left main"
      "status status status";
  }
  .workspace-layout__activity-left,
  .workspace-layout__activity-right,
  .workspace-layout__panel-right {
    display: none;
  }
}

/* Responsive: Mobile (<768px) - Full screen plugin */
@media (max-width: 767px) {
  .workspace-layout {
    display: flex;
    flex-direction: column;
  }
  .workspace-layout__sidebar,
  .workspace-layout__activity-left,
  .workspace-layout__activity-right,
  .workspace-layout__panel-left,
  .workspace-layout__panel-right {
    display: none;
  }
  .workspace-layout__main {
    flex: 1;
    border: none;
  }
  .workspace-layout__status {
    height: var(--status-bar-height);
  }
}
```

#### Component Structure

```tsx
// src/presentation/layouts/WorkspaceLayout.tsx
export function WorkspaceLayout() {
  return (
    <div className="workspace-layout">
      {/* Grid Cells */}
      <aside className="workspace-layout__sidebar bg-card border-r-2 border-border">
        {/* GlobalSidebar - UXUI-02-03 */}
      </aside>
      
      <nav className="workspace-layout__activity-left bg-card border-r-2 border-border">
        {/* ActivityBar LEFT - UXUI-02-02 */}
      </nav>
      
      <section className="workspace-layout__panel-left bg-background">
        {/* Plugin LEFT (FileTree) - UXUI-02-04 */}
      </section>
      
      <main className="workspace-layout__main bg-background">
        {/* Main Content + Activity Bar TOP - UXUI-02-05 */}
      </main>
      
      <section className="workspace-layout__panel-right bg-background">
        {/* Plugin RIGHT (Chat) - UXUI-02-04 */}
      </section>
      
      <nav className="workspace-layout__activity-right bg-card border-l-2 border-border">
        {/* ActivityBar RIGHT - UXUI-02-02 */}
      </nav>
      
      <footer className="workspace-layout__status bg-card border-t-2 border-border">
        {/* StatusBar - UXUI-02-06 */}
      </footer>
    </div>
  );
}
```

#### Acceptance Criteria

- [ ] WorkspaceLayout component renders 6-column CSS Grid
- [ ] CSS uses `grid-template-areas` for named regions
- [ ] Grid cells use design tokens (bg-card, bg-background, border-border)
- [ ] Responsive: Laptop hides right panel
- [ ] Responsive: Tablet shows single panel
- [ ] Responsive: Mobile shows single plugin full-screen
- [ ] 8-bit styling (no rounded corners, 2px borders)
- [ ] CSS variables for grid dimensions
- [ ] Import workspace-layout.css in styles.css
- [ ] Build passes: `pnpm tsc --noEmit`

---

### UXUI-02-02: Implement ActivityBar Component

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-01 |

#### Description

Create ActivityBar component for vertical (left/right) and horizontal (top) plugin switching, per UX Spec 08-activity-bar-docker.md.

#### Files to Create

- `src/presentation/components/layout/ActivityBar.tsx` (NEW)
- `src/presentation/components/layout/ActivityBarItem.tsx` (NEW)

#### Dimensions (from UX Spec)

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width (vertical) | 48px | `--activity-bar-width` |
| Height (horizontal) | 48px | `--activity-bar-width` |
| Icon size | 24x24px | - |
| Touch target | 44x44px minimum | `--touch-target-min` |

#### Icons (Lucide)

| Icon | Plugin | Bar Position |
|------|--------|--------------|
| `FolderTree` | FileTree | LEFT (locked) |
| `StickyNote` | Notes | TOP |
| `Code` | Monaco | TOP |
| `Terminal` | Terminal | TOP |
| `Eye` | Preview | TOP |
| `MessageSquare` | Chat | RIGHT (locked) |

#### Active Indicator (8-bit Style)

```css
/* Active indicator - solid border, NO glow */
.activity-bar__btn.active::before {
  content: '';
  position: absolute;
  background: hsl(var(--primary));
}

/* Vertical (left) - left border */
.activity-bar--left .activity-bar__btn.active::before {
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
}

/* Vertical (right) - right border */
.activity-bar--right .activity-bar__btn.active::before {
  right: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
}

/* Horizontal (top) - bottom border */
.activity-bar--top .activity-bar__btn.active::before {
  left: 8px;
  right: 8px;
  bottom: 0;
  height: 2px;
}
```

#### Component Interface

```tsx
interface ActivityBarProps {
  position: 'left' | 'right' | 'top';
  items: ActivityBarItemConfig[];
  activeId: string | null;
  onItemClick: (itemId: string) => void;
  className?: string;
}

interface ActivityBarItemConfig {
  id: string;
  icon: LucideIcon;
  label: string;  // i18n key
  shortcut?: string;  // e.g., "Cmd+1"
  locked?: boolean;  // Cannot be moved/removed
}
```

#### Acceptance Criteria

- [ ] ActivityBar renders in left, right, top positions
- [ ] Icons from Lucide icon set (FolderTree, StickyNote, Code, Terminal, Eye, MessageSquare)
- [ ] Active icon has 2px orange indicator (left/right/bottom based on position)
- [ ] Uses design tokens for all colors
- [ ] 8-bit styling (no rounded corners)
- [ ] Tooltip on hover (300ms delay, shows plugin name + shortcut)
- [ ] Touch target minimum 44x44px
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Focus states visible
- [ ] i18n labels (use t() function)

---

### UXUI-02-02b: Plugin Docker Component

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-02 |

#### Description

Create Plugin Docker - a floating panel that houses all available plugins. Users can drag plugins FROM the Docker TO Activity Bars. The Docker shows which plugins are currently placed and where.

#### What is the Docker?

A **floating panel/drawer** that:
1. Shows all available plugins as draggable icons
2. Can be toggled open/closed (button in header or keyboard shortcut)
3. Floats above the workspace (not part of the grid)
4. Plugin icons can be dragged FROM here TO Activity Bars
5. Shows which plugins are currently placed (with placement indicator)

#### Docker Visual Layout

```
┌─────────────────────────────────────────────────────┐
│  PLUGIN DOCKER                              [─] [×] │
├─────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │Files │ │Notes │ │Code  │ │Term  │ │Preview│     │
│  │  📁  │ │  📝  │ │  💻  │ │  >_  │ │  👁   │     │
│  │      │ │  ✓   │ │      │ │      │ │      │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│  ┌──────┐                                          │
│  │Chat  │  ← Draggable icons                       │
│  │  💬  │  ← Checkmark if placed                  │
│  │  ✓   │  ← Can still drag to MOVE               │
│  └──────┘                                          │
└─────────────────────────────────────────────────────┘
```

#### Files to Create

- `src/presentation/components/layout/PluginDocker.tsx` (NEW)
- `src/presentation/components/layout/DockerPluginItem.tsx` (NEW)
- `src/styles/plugin-docker.css` (NEW)

#### Docker Behavior

| Action | Result |
|--------|--------|
| Click Docker toggle button | Opens/closes Docker panel |
| Drag plugin from Docker | Shows drag ghost, highlight drop zones |
| Drop on LEFT Activity Bar | Plugin loads in LEFT panel |
| Drop on MAIN Activity Bar (TOP) | Plugin loads in MAIN panel |
| Drop on RIGHT Activity Bar | Plugin loads in RIGHT panel |
| Drop outside valid zone | Cancelled, plugin returns |
| Drag already-placed plugin | MOVES it to new location |

#### Docker States

| State | Visual |
|-------|--------|
| Plugin available (not placed) | Normal icon |
| Plugin placed in LEFT | Icon with "L" badge or left-arrow |
| Plugin placed in MAIN | Icon with "M" badge or center dot |
| Plugin placed in RIGHT | Icon with "R" badge or right-arrow |
| Plugin being dragged | Ghost icon follows cursor |

#### Component Implementation

```typescript
// src/presentation/components/layout/PluginDocker.tsx
interface PluginDockerProps {
  isOpen: boolean;
  onToggle: () => void;
}

function PluginDocker({ isOpen, onToggle }: PluginDockerProps) {
  const plugins = useAvailablePlugins();
  const placements = usePluginPlacements();
  const [position, setPosition] = useState(() => 
    loadFromLocalStorage('docker-position', { x: 0, y: 0 })
  );
  
  if (!isOpen) return null;
  
  return (
    <Draggable 
      handle=".docker-header"
      position={position}
      onStop={(_, data) => {
        setPosition({ x: data.x, y: data.y });
        saveToLocalStorage('docker-position', { x: data.x, y: data.y });
      }}
    >
      <div className="plugin-docker">
        <div className="docker-header">
          <span>{t('docker.title')}</span>
          <button onClick={() => minimize()} aria-label={t('docker.minimize')}>─</button>
          <button onClick={onToggle} aria-label={t('docker.close')}>×</button>
        </div>
        <div className="docker-content">
          {plugins.map(plugin => (
            <DockerPluginItem
              key={plugin.id}
              plugin={plugin}
              placement={placements.get(plugin.id)}
              onDragStart={() => startDrag(plugin.id)}
              onDragEnd={(panel) => handleDrop(plugin.id, panel)}
            />
          ))}
        </div>
      </div>
    </Draggable>
  );
}
```

#### CSS (8-bit Compliance)

```css
/* src/styles/plugin-docker.css */
.plugin-docker {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 280px;
  background: hsl(var(--card));
  border: 2px solid hsl(var(--border));
  box-shadow: 4px 4px 0 0 hsl(var(--shadow)); /* 8-bit shadow */
  z-index: 1000;
}

.docker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: hsl(var(--muted));
  border-bottom: 2px solid hsl(var(--border));
  cursor: move;
  font-family: var(--font-mono);
  font-size: 12px;
}

.docker-header button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

.docker-header button:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--accent));
}

.docker-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
}

.docker-plugin-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  cursor: grab;
  border: 1px solid transparent;
  position: relative;
}

.docker-plugin-item:hover {
  border-color: hsl(var(--border));
  background: hsl(var(--accent));
}

.docker-plugin-item.placed {
  opacity: 0.7;
}

.docker-plugin-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.docker-plugin-item .plugin-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.docker-plugin-item .plugin-name {
  font-size: 10px;
  text-align: center;
  color: hsl(var(--muted-foreground));
}

.docker-plugin-item .placement-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  font-family: var(--font-mono);
  padding: 1px 3px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Responsive: Hide on mobile, minimize on tablet */
@media (max-width: 767px) {
  .plugin-docker {
    display: none;
  }
}

@media (max-width: 1023px) and (min-width: 768px) {
  .plugin-docker {
    width: 200px;
  }
  .docker-content {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Keyboard Shortcut

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + P` | Toggle Plugin Docker |

#### Acceptance Criteria

- [ ] Docker floats above workspace (z-index 1000+)
- [ ] Can be toggled with button or Cmd+Shift+P
- [ ] Shows all available plugins (6+: FileTree, Notes, Monaco, Terminal, Preview, Chat)
- [ ] Plugin icons are draggable (using react-dnd)
- [ ] Placed plugins show placement indicator (L/M/R badge)
- [ ] Docker position saved to localStorage
- [ ] Docker can be minimized or closed
- [ ] Docker is draggable (reposition by dragging header)
- [ ] 8-bit styling (pixel shadows, no rounded corners)
- [ ] Dark/light theme compatible (uses design tokens)
- [ ] Hidden on mobile (<768px)
- [ ] Compact on tablet (768-1023px)
- [ ] i18n labels for all text

---

### UXUI-02-03: Integrate GlobalSidebar

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-01, UXUI-02-02 |

#### Description

Add GlobalSidebar to project route. Currently `$projectId.tsx` renders PluginLayout WITHOUT GlobalSidebar. Per UX Spec 05-global-components.md, the sidebar should be visible.

#### Files to Modify

- `src/routes/$projectId.tsx` - Add GlobalSidebar wrapper
- `src/presentation/components/layout/MainSidebar.tsx` - Fix design tokens

#### Current Problem

```tsx
// Current $projectId.tsx - NO GlobalSidebar!
return (
  <PluginCoordinationProvider>
    <ProjectContextProvider>
      <div className="h-full w-full flex flex-col">
        <PluginLayout />  {/* Only this renders */}
      </div>
    </ProjectContextProvider>
  </PluginCoordinationProvider>
);
```

#### Target Solution

```tsx
// New $projectId.tsx - With WorkspaceLayout containing GlobalSidebar
return (
  <PluginCoordinationProvider>
    <ProjectContextProvider>
      <WorkspaceLayout />  {/* Contains GlobalSidebar + ActivityBars + Panels */}
    </ProjectContextProvider>
  </PluginCoordinationProvider>
);
```

#### MainSidebar Token Migration

| Current (Hardcoded) | Target (Token) |
|---------------------|----------------|
| `bg-zinc-900` | `bg-card` |
| `border-zinc-700` | `border-border` |
| `text-zinc-400` | `text-muted-foreground` |
| `text-zinc-50` | `text-foreground` |
| `hover:bg-zinc-950` | `hover:bg-accent` |
| `text-orange-500` | `text-primary` |

#### Acceptance Criteria

- [ ] GlobalSidebar visible in project route (48px width)
- [ ] Sidebar uses design tokens (no hardcoded zinc-*)
- [ ] Light theme toggle changes sidebar colors
- [ ] Theme toggle button in sidebar WORKS
- [ ] Language toggle button WORKS
- [ ] Collapse/expand functionality preserved
- [ ] Mobile overlay drawer preserved
- [ ] 8-bit styling (no rounded corners)

---

### UXUI-02-04: Plugin Drag-to-Panel Behavior

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-01, UXUI-02-02 |

#### Description

Plugins CAN be dragged between Activity Bars. Dropping a plugin on an Activity Bar loads it into that panel. **ONE INSTANCE RULE**: Same plugin cannot run in multiple panels simultaneously.

#### Plugin Drag Behavior

| Behavior | Description |
|----------|-------------|
| **Draggable** | All Activity Bar items can be dragged |
| **Drop Zones** | Left Activity Bar, Main Activity Bar, Right Activity Bar |
| **Single Instance** | Plugin can only exist in ONE panel at a time |
| **Move vs Duplicate** | Dragging MOVES the plugin (not duplicate) |
| **Default Positions** | FileTree defaults LEFT, Chat defaults RIGHT, Notes defaults MAIN |

#### Default Plugin Positions (Initial Load)

| Plugin | Default Panel | Can Be Moved | Notes |
|--------|---------------|--------------|-------|
| FileTree | `left` | ✅ YES | Starts left, can move to main/right |
| Chat | `right` | ✅ YES | Starts right, can move to left/main |
| Notes | `main` | ✅ YES | Starts main, can move to left/right |
| Monaco | `main` | ✅ YES | Available via activity bar |
| Terminal | `main` | ✅ YES | Available via activity bar |
| Preview | `main` | ✅ YES | Available via activity bar |

#### Implementation

```typescript
// src/infrastructure/persistence/stores/plugin-placement-store.ts

interface PluginPlacement {
  pluginId: PluginId;
  panel: 'left' | 'main' | 'right';
}

interface PluginPlacementState {
  // Map of plugin ID to panel
  placements: Map<PluginId, 'left' | 'main' | 'right'>;
  
  // Actions
  movePlugin: (pluginId: PluginId, targetPanel: 'left' | 'main' | 'right') => void;
  getPluginPanel: (pluginId: PluginId) => 'left' | 'main' | 'right' | null;
  isPluginInPanel: (pluginId: PluginId, panel: 'left' | 'main' | 'right') => boolean;
  resetToDefaults: () => void;
}

// On drag-drop attempt:
function handlePluginDrop(pluginId: PluginId, targetPanel: Panel) {
  const currentPanel = pluginPlacements.get(pluginId);
  
  if (currentPanel === targetPanel) {
    // Already in this panel, no action
    return;
  }
  
  if (currentPanel) {
    // Plugin already in another panel - MOVE it
    // Remove from current, add to target
    pluginPlacements.delete(pluginId);
  }
  
  // Place plugin in new panel
  pluginPlacements.set(pluginId, targetPanel);
  renderPlugin(pluginId, targetPanel);
}
```

#### Drag Visual Feedback

```css
/* Ghost icon during drag */
.activity-bar__item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

/* Drop zone highlight */
.panel-drop-zone {
  border: 2px dashed transparent;
  transition: border-color 0.15s steps(2, end);
}

.panel-drop-zone.drag-over {
  border-color: hsl(var(--primary));
}

.panel-drop-zone.drag-invalid {
  border-color: hsl(var(--destructive));
}
```

#### Acceptance Criteria

- [ ] Activity Bar items are DRAGGABLE
- [ ] Dropping on Activity Bar moves plugin to that panel
- [ ] Visual feedback during drag (ghost icon, drop zones)
- [ ] Drop zones highlight when drag hovers
- [ ] Moving plugin removes it from source panel
- [ ] Plugin positions persist across sessions
- [ ] Panel visibility can be toggled (collapse/expand)
- [ ] Resize handles between panels (stretch goal)

---

### UXUI-02-04b: Single Instance Plugin Constraint

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-04 |

#### Description

Enforce that the same plugin cannot run in multiple panels. Store tracks plugin placement and prevents duplicates. Visual indicators show which panel hosts each plugin.

#### Implementation

```typescript
// Plugin instance tracking
const pluginPlacements = new Map<PluginId, 'left' | 'main' | 'right'>();

function canPlacePlugin(pluginId: PluginId, targetPanel: Panel): boolean {
  const currentPanel = pluginPlacements.get(pluginId);
  
  // If not placed anywhere, can place
  if (!currentPanel) return true;
  
  // If already in target, no action needed
  if (currentPanel === targetPanel) return true;
  
  // Plugin is in another panel - MOVE allowed, not duplicate
  return true; // Moving is always allowed
}

function handlePluginDrop(pluginId: PluginId, targetPanel: Panel) {
  const currentPanel = pluginPlacements.get(pluginId);
  
  if (currentPanel === targetPanel) {
    // Already in this panel, no action
    return;
  }
  
  if (currentPanel) {
    // MOVE plugin from current to target
    // Show toast: "Moving {plugin} from {current} to {target}"
    toast.info(`Moving ${getPluginName(pluginId)} to ${targetPanel} panel`);
    
    // Remove from current panel's activity bar
    removeFromActivityBar(pluginId, currentPanel);
  }
  
  // Place plugin in new panel
  pluginPlacements.set(pluginId, targetPanel);
  addToActivityBar(pluginId, targetPanel);
  activatePlugin(pluginId, targetPanel);
}
```

#### Visual Indicators

```tsx
// Activity Bar item shows which panel hosts it
<ActivityBarItem
  pluginId={plugin.id}
  hostedPanel={pluginPlacements.get(plugin.id)}
>
  <PluginIcon icon={plugin.icon} />
  {/* Small dot indicator showing panel */}
  <PanelIndicator panel={pluginPlacements.get(plugin.id)} />
</ActivityBarItem>

// PanelIndicator component
function PanelIndicator({ panel }: { panel: 'left' | 'main' | 'right' | null }) {
  if (!panel) return null;
  
  const colors = {
    left: 'bg-blue-500',
    main: 'bg-green-500',
    right: 'bg-purple-500',
  };
  
  return (
    <span 
      className={`absolute bottom-1 right-1 w-2 h-2 ${colors[panel]}`}
      title={`Active in ${panel} panel`}
    />
  );
}
```

#### Error Handling

```typescript
// If somehow duplicate attempted (should not happen with move logic)
function preventDuplicate(pluginId: PluginId, targetPanel: Panel) {
  const currentPanel = pluginPlacements.get(pluginId);
  
  if (currentPanel && currentPanel !== targetPanel) {
    // Move instead of duplicate
    toast.info(
      t('plugin.moving', { 
        plugin: getPluginName(pluginId), 
        from: currentPanel, 
        to: targetPanel 
      })
    );
  }
}
```

#### Integration with EPIC-0.6 Plugin Coordination

```typescript
// Sync with plugin-coordination-store from EPIC-0.6
import { usePluginCoordinationStore } from '@/infrastructure/context/plugin-coordination-context';

function syncWithCoordination(pluginId: PluginId, targetPanel: Panel) {
  const { setActivePlugin } = usePluginCoordinationStore();
  
  // Update plugin coordination to reflect new panel
  setActivePlugin(targetPanel, pluginId);
}
```

#### Acceptance Criteria

- [ ] Cannot have two FileTree instances across panels
- [ ] Cannot have two Chat instances across panels
- [ ] Cannot have two Monaco instances across panels
- [ ] Drag-drop between panels MOVES plugin (not duplicates)
- [ ] Activity Bar item shows which panel hosts it (dot indicator)
- [ ] Toast notification when moving plugin between panels
- [ ] Store tracks plugin placement: `Map<PluginId, Panel>`
- [ ] Synced with plugin-coordination-store from EPIC-0.6
- [ ] Plugin positions persist to localStorage

---

### UXUI-02-05: Wire ActivityBar to Plugins

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-02, UXUI-02-04, UXUI-02-04b |

#### Description

Clicking activity bar icons toggles plugin visibility in panels. Activity Bar items are **DRAGGABLE** - dropping on a different Activity Bar moves the plugin to that panel (with single instance constraint from UXUI-02-04b).

#### Interaction Behavior

| Action | Target | Result |
|--------|--------|--------|
| Click Notes icon | TOP bar | Show Notes in main, hide others |
| Click Code icon | TOP bar | Show Monaco in main, hide others |
| Click Terminal icon | TOP bar | Show Terminal in main, hide others |
| Click Preview icon | TOP bar | Show Preview in main, hide others |
| Click FileTree icon | LEFT bar | Toggle FileTree panel visibility |
| Click Chat icon | RIGHT bar | Toggle Chat panel visibility |
| **Drag plugin icon** | **Any bar** | **Move plugin to target panel** |

#### Drag-Drop Behavior (NEW)

| Action | Behavior |
|--------|----------|
| Start drag | Ghost icon follows cursor, source slot dims |
| Hover over Activity Bar | Drop zone highlights with primary color |
| Drop on same bar | Reorder within bar |
| Drop on different bar | Move plugin to that panel's activity bar |
| Invalid drop | Red highlight, snap back to source |

#### Implementation (Draggable ActivityBarItem)

```tsx
// ActivityBarItem.tsx
import { useDrag, useDrop } from 'react-dnd';

interface DraggableActivityBarItemProps {
  pluginId: PluginId;
  panel: 'left' | 'main' | 'right';
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onActivate: () => void;
}

export function DraggableActivityBarItem({
  pluginId,
  panel,
  icon: Icon,
  label,
  isActive,
  onActivate,
}: DraggableActivityBarItemProps) {
  const { movePlugin, getPluginPanel } = usePluginPlacementStore();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'activity-bar-item',
    item: { pluginId, sourcePanel: panel },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'activity-bar-item',
    canDrop: (item: { pluginId: PluginId; sourcePanel: string }) => {
      // Can always drop - will MOVE (not duplicate)
      return item.sourcePanel !== panel;
    },
    drop: (item: { pluginId: PluginId }) => {
      movePlugin(item.pluginId, panel);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  return (
    <button
      ref={(node) => drag(drop(node))}
      onClick={onActivate}
      className={cn(
        'activity-bar__btn',
        isActive && 'active',
        isDragging && 'dragging',
        isOver && canDrop && 'drop-target',
        isOver && !canDrop && 'drop-invalid',
      )}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
      <PanelIndicator panel={getPluginPanel(pluginId)} />
    </button>
  );
}
```

#### Panel Drop Zone

```tsx
// PanelDropZone.tsx - Wraps each panel to accept drops
export function PanelDropZone({ 
  panel, 
  children 
}: { 
  panel: 'left' | 'main' | 'right'; 
  children: React.ReactNode;
}) {
  const { movePlugin } = usePluginPlacementStore();
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'activity-bar-item',
    drop: (item: { pluginId: PluginId }) => {
      movePlugin(item.pluginId, panel);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });
  
  return (
    <div
      ref={drop}
      className={cn(
        'panel-drop-zone h-full',
        isOver && canDrop && 'drag-over',
      )}
    >
      {children}
    </div>
  );
}
```

#### Keyboard Shortcuts (from UX Spec)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + 1` | Switch to first plugin in top bar |
| `Cmd/Ctrl + 2` | Switch to second plugin in top bar |
| `Cmd/Ctrl + 3` | Switch to third plugin in top bar |
| `Cmd/Ctrl + B` | Toggle left panel visibility |
| `Cmd/Ctrl + J` | Toggle right panel visibility |

#### State Management

```tsx
// Use existing PluginLayoutStore or create new one
interface WorkspaceLayoutState {
  // Active plugin in main content area
  mainActivePlugin: 'notes' | 'monaco' | 'terminal' | 'preview';
  
  // Panel visibility
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  
  // Actions
  setMainActivePlugin: (pluginId: string) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}
```

#### Acceptance Criteria

- [ ] Click Notes icon → show Notes in main content
- [ ] Click Code icon → show Monaco in main content
- [ ] Click Terminal icon → show Terminal in main content
- [ ] Click Preview icon → show Preview in main content
- [ ] FileTree and Chat toggle with their respective icons
- [ ] Only one main content plugin visible at a time
- [ ] Keyboard shortcuts Cmd+1, Cmd+2, Cmd+3 work
- [ ] Cmd+B toggles left panel
- [ ] Cmd+J toggles right panel
- [ ] Active indicator updates when plugin switches

---

### UXUI-02-06: Implement StatusBar

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P1 |
| **Team** | B |
| **Depends On** | UXUI-02-01 |

#### Description

Create StatusBar component for bottom status display. Shows sync status, connection state, and editor position.

#### Files to Create

- `src/presentation/components/layout/StatusBar.tsx` (NEW)

#### Dimensions

- Height: 24px (`--status-bar-height`)
- Full width (spans all grid columns)

#### Content Sections (from UX Spec 05-global-components.md)

| Section | Content | Example |
|---------|---------|---------|
| Left | Agent status icon + text | `[Bot] Agent Ready` |
| Center | Editor position | `Ln 42, Col 15` |
| Right | Problems, Sync status, Terminal toggle | `[!] 0  [Sync] Synced  [^]` |

#### Component Interface

```tsx
interface StatusBarProps {
  agentStatus?: 'idle' | 'working' | 'error';
  agentError?: string;
  line?: number;
  column?: number;
  problemsCount?: number;
  syncStatus?: 'synced' | 'syncing' | 'error';
  className?: string;
}
```

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Hidden entirely, use toast notifications |
| `768px - 1023px` | Compact mode: icons only |
| `>= 1024px` | Full layout with all information |

#### Acceptance Criteria

- [ ] StatusBar renders at 24px height
- [ ] Shows agent status with icon (Bot icon)
- [ ] Shows editor position: "Ln {line}, Col {column}"
- [ ] Shows problems count with warning icon
- [ ] Shows sync status (synced/syncing/error)
- [ ] Uses design tokens for all colors
- [ ] 8-bit styling (no rounded corners)
- [ ] Hidden on mobile
- [ ] Compact icons-only mode on tablet
- [ ] Full info on desktop

---

### UXUI-02-07: Apply Design Tokens to All Components

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P0 |
| **Team** | B |
| **Depends On** | UXUI-02-01 through UXUI-02-06 |

#### Description

Sweep through ALL components created in this epic and ensure they use CSS design tokens. Light theme toggle MUST work after this story.

#### Token Migration Map

```css
/* BEFORE → AFTER */

/* Backgrounds */
bg-zinc-900       →  bg-card
bg-zinc-800       →  bg-muted
bg-zinc-950       →  bg-background
bg-zinc-900/50    →  bg-card/50 (avoid, use solid)

/* Borders */
border-zinc-700   →  border-border
border-zinc-600   →  border-border

/* Text */
text-zinc-400     →  text-muted-foreground
text-zinc-100     →  text-foreground
text-zinc-50      →  text-foreground
text-zinc-500     →  text-muted-foreground

/* Hover/Active */
hover:bg-zinc-800 →  hover:bg-accent
hover:bg-zinc-950 →  hover:bg-muted
active:bg-zinc-800 →  active:bg-accent

/* Accent Colors */
text-orange-500   →  text-primary
border-orange-500 →  border-primary
bg-orange-500     →  bg-primary
```

#### Files to Audit

- [ ] `src/presentation/layouts/WorkspaceLayout.tsx`
- [ ] `src/presentation/components/layout/ActivityBar.tsx`
- [ ] `src/presentation/components/layout/ActivityBarItem.tsx`
- [ ] `src/presentation/components/layout/MainSidebar.tsx`
- [ ] `src/presentation/components/layout/StatusBar.tsx`
- [ ] `src/styles/workspace-layout.css`

#### Verification Process

```bash
# 1. Search for hardcoded colors
grep -r "zinc-" src/presentation/layouts/
grep -r "zinc-" src/presentation/components/layout/
grep -r "#[0-9a-fA-F]" src/presentation/layouts/

# 2. Toggle theme and verify
# - Open app in browser
# - Open DevTools > Application > localStorage
# - Set theme: 'light'
# - Refresh page
# - ALL components should use light colors
```

#### Acceptance Criteria

- [ ] Toggle light theme → ALL layout components change colors
- [ ] No `zinc-*` classes in WorkspaceLayout or new components
- [ ] No hardcoded hex values (#xxx)
- [ ] Uses semantic tokens: bg-card, bg-background, text-foreground, etc.
- [ ] 8-bit compliance verified (no rounded corners > 2px)
- [ ] Shadows use correct token (shadow-pixel-*)
- [ ] Focus rings use `ring-primary`
- [ ] Theme toggle works in GlobalSidebar

---

### UXUI-02-08: Archive Bento Grid

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 1-2h |
| **Priority** | P2 |
| **Team** | B |
| **Depends On** | UXUI-02-01 through UXUI-02-07 |

#### Description

Remove old Bento Grid layout code. Archive files to `_bmad-ext/.archive/` per AGENTS.md file change rules.

#### Files to Archive

| Source | Destination | Notes |
|--------|-------------|-------|
| `src/presentation/layouts/PluginLayout.tsx` | `_bmad-ext/.archive/bento-grid-2026-01-28/PluginLayout.tsx` | Main layout |
| `src/presentation/layouts/DraggableBentoCell.tsx` | `_bmad-ext/.archive/bento-grid-2026-01-28/DraggableBentoCell.tsx` | Drag component |
| `src/presentation/layouts/bento-layouts.ts` | `_bmad-ext/.archive/bento-grid-2026-01-28/bento-layouts.ts` | Layout configs |
| `src/presentation/layouts/BentoGridStore.ts` | `_bmad-ext/.archive/bento-grid-2026-01-28/BentoGridStore.ts` | Zustand store |
| `src/presentation/layouts/MobilePluginNav.tsx` | Keep | Still useful for mobile |

#### Cleanup Tasks

1. Move files to archive directory
2. Update imports in `$projectId.tsx` to use `WorkspaceLayout`
3. Remove bento-grid-storage from localStorage
4. Verify no dead imports remain
5. Run build to confirm

#### localStorage Cleanup

```typescript
// Clear old bento grid storage
localStorage.removeItem('bento-grid-storage');
localStorage.removeItem('plugin-layout-storage');
```

#### Acceptance Criteria

- [ ] Old layout code moved to `_bmad-ext/.archive/bento-grid-2026-01-28/`
- [ ] No references to Bento Grid in active code
- [ ] `$projectId.tsx` imports WorkspaceLayout (not PluginLayout)
- [ ] Clean build with no dead code
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm vitest run` passes
- [ ] No console errors in browser

---

## 8-bit Compliance Checklist

Every component in this EPIC must pass:

```markdown
### 8-bit Style Validation
- [ ] border-radius: 0 or 2px MAX (no rounded-md, rounded-lg)
- [ ] box-shadow: 4px 4px 0 0 format (no blur shadows)
- [ ] No gradients anywhere
- [ ] No backdrop-filter: blur()
- [ ] Colors from CSS variables only (no hardcoded zinc-*)
- [ ] Animation: steps(N, end) or linear only
- [ ] Focus ring: 2px solid var(--ring)
- [ ] Opacity: 1.0 (except backdrop, disabled states)

### Code Quality
- [ ] No hardcoded colors (#xxx)
- [ ] No inline styles
- [ ] TypeScript compiles (pnpm tsc --noEmit)
- [ ] Tests pass (pnpm vitest run)
- [ ] Responsive at 320px, 768px, 1280px

### Accessibility
- [ ] Touch targets >= 44x44px
- [ ] Focus states visible
- [ ] Color contrast >= 4.5:1
- [ ] prefers-reduced-motion respected
```

---

## Coordination Notes

### Safe Zones (Team B Full Authority)

- `src/presentation/layouts/WorkspaceLayout.tsx` (NEW)
- `src/presentation/components/layout/ActivityBar*.tsx` (NEW)
- `src/presentation/components/layout/PluginDocker.tsx` (NEW)
- `src/presentation/components/layout/DockerPluginItem.tsx` (NEW)
- `src/presentation/components/layout/StatusBar.tsx` (NEW)
- `src/presentation/components/layout/MainSidebar.tsx` (token migration only)
- `src/styles/*.css`
- `src/routes/$projectId.tsx` (layout wrapper change)

### Use Existing Infrastructure

- `src/infrastructure/context/plugin-coordination-context.tsx` - READ ONLY
- `src/infrastructure/plugins/plugin-registry.ts` - Use `getPlugin()`
- `src/presentation/layouts/PluginLayoutStore.ts` - Extend or create new

### Do NOT Modify

- `src/infrastructure/context/project-context.tsx` - FSA handle lifecycle
- `src/infrastructure/filesystem/*` - Storage adapters
- `src/domain/*` - Business logic

---

## References

| Document | Path |
|----------|------|
| UX Specification Index | `_bmad-output/planning-artifacts/ux-specification/index.md` |
| Responsive Grid | `_bmad-output/planning-artifacts/ux-specification/04-responsive-grid.md` |
| Global Components | `_bmad-output/planning-artifacts/ux-specification/05-global-components.md` |
| Activity Bar Docker | `_bmad-output/planning-artifacts/ux-specification/08-activity-bar-docker.md` |
| Design Tokens | `_bmad-output/planning-artifacts/ux-specification/03-design-tokens.md` |
| Validation Checklist | `_bmad-output/planning-artifacts/ux-specification/VALIDATION-CHECKLIST.md` |
| Light Theming | `_bmad-output/planning-artifacts/ux-specification/14-light-theming.md` |
| EPIC-UXUI-01 (Foundation) | `_bmad-output/planning-artifacts/epics/EPIC-UXUI-01-design-system-foundation.md` |

---

## Progress Tracking

| Story | Status | Assignee | Started | Completed |
|-------|--------|----------|---------|-----------|
| UXUI-02-01 | READY | - | - | - |
| UXUI-02-02 | READY | - | - | - |
| UXUI-02-02b | READY | - | - | - |
| UXUI-02-03 | READY | - | - | - |
| UXUI-02-04 | READY | - | - | - |
| UXUI-02-04b | READY | - | - | - |
| UXUI-02-05 | READY | - | - | - |
| UXUI-02-06 | READY | - | - | - |
| UXUI-02-07 | READY | - | - | - |
| UXUI-02-08 | READY | - | - | - |

**Epic Progress**: 0/10 stories complete (0%)
**Epic Status**: READY_FOR_EXECUTION

---

**Created**: 2026-01-28
**Author**: bmad-sprint-manager
**Epic ID**: EPIC-UXUI-02
**Lines**: ~700
