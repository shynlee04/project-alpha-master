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
| Always-loaded plugins | 2 | Cannot be removed |
| Panel position lock | Yes for always-loaded | Cannot be moved |

### Drag-Drop Interaction

```
1. Initiate Drag
   |-- Long-press (touch): 150ms delay
   +-- Mouse: immediate on mousedown

2. Visual Feedback
   |-- Source: Ghost follows cursor, slot shows empty state
   |-- Target: Blue border highlight (valid), Red (invalid)
   +-- Trash: Appears at bottom center during drag

3. Drop Zones
   |-- Activity Bar Slot: Reorder within same bar
   |-- Other Activity Bar: Move between bars
   |-- Panel Area: Dock to panel position
   +-- Trash Zone: Remove plugin (optional only)

4. Completion
   |-- Success: Plugin moves, state persists to localStorage
   +-- Cancel: Return to original position
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

## 8.3 Activity Bar Variants

| Position | Panel | Orientation | Plugins | Behavior |
|----------|-------|-------------|---------|----------|
| **LEFT** | Left plugin panel | Vertical | FileTree (locked) | Controls left panel content |
| **TOP** | Main content | Horizontal | Notes, Monaco, Preview | Controls main content |
| **RIGHT** | Right plugin panel | Vertical | Chat (locked) | Controls right panel content |

### Visual Comparison

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

---

## 8.4 Plugin Switching Interactions

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
