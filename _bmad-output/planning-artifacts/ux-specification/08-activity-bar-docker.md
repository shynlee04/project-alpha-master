# Activity Bar & Plugin Docker

<- [Plugin Architecture](./07-plugin-architecture.md) | [Index](./index.md) | [Plugin Interfaces](./09-plugin-interfaces.md) ->

---

## 8.1 Activity Bar Specification

The Activity Bar provides quick access to plugins within a panel. Each panel (left, main, right) has its own activity bar.

### Dimensions

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width (vertical) | 48px | `--activity-bar-width` |
| Height (horizontal) | 48px | `--activity-bar-width` |
| Icon size | 24x24px | - |
| Touch target | 44x44px minimum | `--touch-target-min` |
| Max icons before scroll | 6 | - |

### Activity Bar Anatomy

```
VERTICAL (Left/Right)           HORIZONTAL (Top of Main)
+--------+                      +----+----+----+----+----+----+
|  [IC]  |  <- Active (border)  |[IC]|[IC]|[IC]|[IC]|[IC]|[IC]|
+--------+                      +----+----+----+----+----+----+
|  [IC]  |  <- Inactive              ^
+--------+                      Active indicator (bottom border)
|  [IC]  |
+--------+
|        |  <- Spacer (flex-1)
|  ...   |
|        |
+--------+
|  [+]   |  <- Add plugin (optional)
+--------+
```

### Active Indicator Styling (8-bit Compliance)

```css
/* Active indicator - solid border, NO glow */
.activity-bar__btn.active::before {
  content: '';
  position: absolute;
  background: var(--color-primary);
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

### Tooltip Behavior

| Property | Value |
|----------|-------|
| Hover delay | 300ms |
| Position | Right of button (left bar), Left of button (right bar), Below button (top bar) |
| Content | Plugin name + keyboard shortcut |
| Style | 8-bit: solid background, no shadow blur |

```css
.activity-bar__tooltip {
  position: absolute;
  padding: 4px 8px;
  background: var(--color-foreground);
  color: var(--color-background);
  font-family: var(--font-mono);
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: var(--z-tooltip);
}

.activity-bar__btn:hover .activity-bar__tooltip,
.activity-bar__btn:focus-visible .activity-bar__tooltip {
  opacity: 1;
}
```

---

## 8.2 Plugin Docker System

The Plugin Docker allows drag-and-drop management of plugins across activity bars and panel positions.

### Docker Architecture

```
+-------------------------------------------------------------+
|                   PLUGIN DOCKER FLOW                         |
+-------------------------------------------------------------+
|                                                              |
|  [Plugin Registry]                                           |
|        |                                                     |
|  [Activity Bar] <---> Drag to reorder                        |
|        |                                                     |
|  [Panel Position] <-> Drop to dock                           |
|                                                              |
+-------------------------------------------------------------+
```

### Docker Constraints

| Constraint | Value | Enforcement |
|------------|-------|-------------|
| Max plugins per device (desktop) | 4 | Hard limit |
| Max plugins per device (tablet) | 2 | Hard limit |
| Max plugins per device (mobile) | 1 | Hard limit |
| Always-loaded plugins | 3 (FileTree, Notes, Chat) | Cannot be removed |
| **Single instance per plugin** | **YES** | **Plugin can only exist in ONE panel** |
| Panel position lock | NO | Plugins CAN be moved between panels |

### Single Instance Rule

Each plugin can only run in ONE panel at a time. If a user drags a plugin to a different Activity Bar, it **MOVES** (not duplicates).

```typescript
// WRONG - would create duplicate
panels.left = 'filetree';
panels.right = 'filetree'; // ❌ Duplicate!

// CORRECT - plugin exists in one panel only
pluginPlacements.set('filetree', 'left');
// To move:
pluginPlacements.set('filetree', 'right'); // Automatically removes from left
```

### Drag-Drop Interaction

```
1. Initiate Drag
   |-- Long-press (touch): 150ms delay
   +-- Mouse: immediate on mousedown

2. Visual Feedback
   |-- Source: Ghost follows cursor (50% opacity), slot shows empty state
   |-- Target: Primary border highlight (valid drop)
   +-- Invalid: No additional highlight (same panel = no-op)

3. Drop Zones
   |-- Activity Bar Slot: Reorder within same bar
   |-- Other Activity Bar: MOVE plugin to that panel
   +-- Panel Area: Dock to panel position

4. Single Instance Enforcement
   |-- If plugin already in target panel: No action (already there)
   |-- If plugin in different panel: MOVE (remove from source, add to target)
   +-- Toast notification: "Moving [Plugin] to [Panel] panel"

5. Completion
   |-- Success: Plugin moves, state persists to localStorage
   |-- Cancel (Esc or drop outside): Return to original position
```

### Docker State (Zustand)

```typescript
interface PluginDockerState {
  // Activity bar contents
  leftBar: PluginId[];
  rightBar: PluginId[];
  topBar: PluginId[];      // Main content activity bar
  
  // Active plugin per panel
  panels: {
    left: PluginId | null;
    main: PluginId | null;
    right: PluginId | null;
    bottom: PluginId | null;  // Terminal (POST-MVP)
  };
  
  // Drag state
  dragging: {
    pluginId: PluginId | null;
    sourceBar: 'left' | 'right' | 'top' | null;
    sourceIndex: number | null;
  };
}

interface PluginDockerActions {
  startDrag: (pluginId: PluginId, sourceBar: string, index: number) => void;
  endDrag: () => void;
  movePlugin: (pluginId: PluginId, targetBar: string, targetIndex: number) => void;
  setActivePanel: (position: 'left' | 'main' | 'right', pluginId: PluginId) => void;
  resetToDefaults: (deviceType: DeviceType) => void;
}
```

---

## 8.3 Plugin Docker Component (Floating Palette)

The Plugin Docker is a **floating panel** that provides a centralized location for all available plugins. Users drag plugins FROM the Docker TO Activity Bars to place them in panels.

### Docker Purpose

| Purpose | Description |
|---------|-------------|
| Plugin Discovery | Shows ALL available plugins in one place |
| Drag Source | Primary source for dragging plugins to panels |
| Placement Tracking | Shows where each plugin is currently placed |
| Plugin Management | Central UI for managing plugin layout |

### Docker Visual Layout

```
┌─────────────────────────────────────────────────────┐
│  PLUGIN DOCKER                              [─] [×] │
├─────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │Files │ │Notes │ │Code  │ │Term  │ │Preview│     │
│  │  📁  │ │  📝  │ │  💻  │ │  >_  │ │  👁   │     │
│  │  L   │ │  M   │ │      │ │      │ │      │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│  ┌──────┐                                          │
│  │Chat  │  ← Draggable icons                       │
│  │  💬  │  ← "L/M/R" badge shows panel             │
│  │  R   │  ← Drag to MOVE between panels          │
│  └──────┘                                          │
└─────────────────────────────────────────────────────┘
```

### Docker Dimensions

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width | 280px | `--docker-width` |
| Min width (tablet) | 200px | - |
| Padding | 12px | - |
| Icon grid | 4 columns (desktop), 3 columns (tablet) | - |
| Plugin item size | 64x64px | - |
| Icon size | 32x32px | - |
| Header height | 40px | - |
| Z-index | 1000 | `--z-docker` |

### Docker Position & Persistence

| Property | Behavior |
|----------|----------|
| Default position | Bottom-right corner (80px from bottom, 24px from right) |
| Draggable | YES - drag header to reposition |
| Position saved | localStorage key: `docker-position` |
| Restore on load | Load saved position, fallback to default |
| Bounds | Stay within viewport |

### Docker Toggle Behavior

| Trigger | Action |
|---------|--------|
| Header button in GlobalHeader | Toggle Docker visibility |
| Keyboard: `Cmd/Ctrl + Shift + P` | Toggle Docker visibility |
| Close button (×) | Hide Docker |
| Minimize button (─) | Collapse to title bar only |
| Click outside Docker | Keep open (not auto-dismiss) |
| Escape key | Close Docker |

### Docker Item States

| State | Visual Indicator | Behavior |
|-------|------------------|----------|
| **Available** (not placed) | Normal opacity, no badge | Drag to any Activity Bar |
| **Placed in LEFT** | "L" badge, 70% opacity | Drag to MOVE to different panel |
| **Placed in MAIN** | "M" badge, 70% opacity | Drag to MOVE to different panel |
| **Placed in RIGHT** | "R" badge, 70% opacity | Drag to MOVE to different panel |
| **Dragging** | Ghost follows cursor, 50% opacity | Drop on Activity Bar to place |
| **Hover** | Border highlight, bg-accent | - |

### Docker-to-ActivityBar Drag Flow

```
1. User opens Docker
   └── Cmd+Shift+P or header button

2. User identifies plugin to place
   └── Badge shows current placement (if any)

3. User starts drag from Docker item
   ├── Ghost icon follows cursor (50% opacity)
   ├── Docker item shows empty state
   └── Activity Bars highlight as valid drop zones

4. User hovers over Activity Bar
   ├── LEFT bar: Primary border highlight
   ├── TOP bar: Primary border highlight  
   └── RIGHT bar: Primary border highlight

5. User drops on Activity Bar
   ├── If plugin NOT placed: Add to that panel
   ├── If plugin ALREADY placed: MOVE to new panel
   └── Toast: "Moving [Plugin] to [Panel] panel"

6. Drop completes
   ├── Docker item updates badge (L/M/R)
   ├── Activity Bar shows new icon
   ├── Panel renders plugin content
   └── State persists to localStorage
```

### Docker CSS (8-bit Compliance)

```css
.plugin-docker {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 280px;
  background: hsl(var(--card));
  border: 2px solid hsl(var(--border));
  box-shadow: 4px 4px 0 0 hsl(var(--shadow)); /* 8-bit pixel shadow */
  z-index: 1000;
  /* NO border-radius - 8-bit compliance */
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
  /* NO border-radius - 8-bit compliance */
}

.docker-plugin-item:hover {
  border-color: hsl(var(--border));
  background: hsl(var(--accent));
}

.docker-plugin-item.placed {
  opacity: 0.7;
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
  /* NO border-radius - 8-bit compliance */
}
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1280px) | Full Docker with 4-column grid |
| Laptop (1024-1279px) | Full Docker with 4-column grid |
| Tablet (768-1023px) | Compact Docker with 3-column grid, 200px width |
| Mobile (<768px) | Docker HIDDEN - use mobile plugin nav instead |

### Integration with Single Instance Rule

The Docker enforces the single instance rule from section 8.2:

```typescript
// When dragging from Docker:
function handleDockerDrop(pluginId: PluginId, targetPanel: Panel) {
  const currentPlacement = placements.get(pluginId);
  
  if (currentPlacement === targetPanel) {
    // Already in this panel - no action
    return;
  }
  
  if (currentPlacement) {
    // Plugin is placed elsewhere - this is a MOVE operation
    toast.info(t('plugin.moving', { 
      plugin: getPluginName(pluginId), 
      from: currentPlacement, 
      to: targetPanel 
    }));
  }
  
  // Update placement (removes from old, adds to new)
  placements.set(pluginId, targetPanel);
  
  // Update Docker badge
  updateDockerBadge(pluginId, targetPanel);
}
```

---

## 8.4 Activity Bar Variants

| Position | Panel | Orientation | Default Plugins | Behavior |
|----------|-------|-------------|---------|----------|
| **LEFT** | Left plugin panel | Vertical | FileTree (default) | Controls left panel, plugins draggable |
| **TOP** | Main content | Horizontal | Notes, Monaco, Preview | Controls main content, plugins draggable |
| **RIGHT** | Right plugin panel | Vertical | Chat (default) | Controls right panel, plugins draggable |

**Note**: Default plugins can be moved to other panels via drag-drop. Each plugin exists in only ONE panel at a time.

### Visual Comparison

```
LEFT ACTIVITY BAR               TOP ACTIVITY BAR (in main)
+--------+                      +----------------------------------+
|[Folder]| <- Default FileTree  | [Note][Code][Eye]                |
+--------+    (can be moved)    +----------------------------------+
|  [+]   | <- Add (if allowed)       ^     ^    ^
+--------+                      Notes Monaco Preview (all draggable)

RIGHT ACTIVITY BAR
+--------+
|[Chat]  | <- Default Chat (can be moved)
+--------+
|  [+]   | <- Add (if allowed)
+--------+
```

---

## 8.5 Plugin Switching Interactions

| Action | Behavior | Keyboard |
|--------|----------|----------|
| **Click** | Activate plugin, show in panel | - |
| **Double-click** | Expand/maximize plugin panel | - |
| **Keyboard** | Quick switch to plugin | `Cmd/Ctrl + 1-6` |
| **Touch tap** | Same as click | - |
| **Touch hold** | Open context menu | - |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + 1` | Switch to first plugin in top bar |
| `Cmd/Ctrl + 2` | Switch to second plugin in top bar |
| `Cmd/Ctrl + 3` | Switch to third plugin in top bar |
| `Cmd/Ctrl + B` | Toggle left panel visibility |
| `Cmd/Ctrl + J` | Toggle right panel visibility |
| `Cmd/Ctrl + `` ` | Toggle terminal (POST-MVP) |

---

<- [Plugin Architecture](./07-plugin-architecture.md) | [Index](./index.md) | [Plugin Interfaces](./09-plugin-interfaces.md) ->
