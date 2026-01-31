# Responsive Grid System Specification

**Document ID**: UX-DESIGN-02B
**Version**: 1.0.0
**Date**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
**Status**: APPROVED - Ready for Implementation
**Priority**: HIGH

---

## Executive Summary

This specification defines a comprehensive responsive grid system for the plugin-centric architecture. The system supports the user's specified desktop layout ratio `[0.5:(0.5:2:4:2.5:0.5)]` with responsive adaptations across 6 breakpoint tiers.

### Design Principles

1. **8-bit Aesthetic Compliance** - Sharp corners, pixel shadows, no glassmorphism
2. **Plugin-Centric** - Grid designed around plugin panels, not hardcoded layouts
3. **Performance-First** - Plugin limits enforced per device type
4. **Accessibility** - WCAG AA compliant, minimum 44x44px touch targets
5. **Mobile-First** - Progressive enhancement from smallest screens

---

## Section 1: Desktop Layout Specification

### 1.1 Base Grid Structure

```
Desktop Full Layout (>=1280px)
[0.5 : (0.5 : 2 : 4 : 2.5 : 0.5)]

+------+------+--------+----------------+----------+------+
| 0.5  | 0.5  |   2    |       4        |   2.5    | 0.5  |
+------+------+--------+----------------+----------+------+
|Global|Act.  |Plugin  |Main Content    |Plugin    |Act.  |
|Side- |Bar   |Left    |(Notes/Monaco)  |Right     |Bar   |
|bar   |LEFT  |        |+Activity TOP   |(Chat)    |RIGHT |
+------+------+--------+----------------+----------+------+
| 48px | 48px |minmax  |   minmax       | minmax   | 48px |
|      |      |200,1fr |  400,2fr       | 250,1.25 |      |
+------+------+--------+----------------+----------+------+
```

### 1.2 Ratio-to-Pixel Mapping

| Zone | Ratio | Min Width | Max Width | CSS Value |
|------|-------|-----------|-----------|-----------|
| Global Sidebar | 0.5 | 48px | 48px | `var(--sidebar-width)` |
| Activity Bar LEFT | 0.5 | 48px | 48px | `var(--activity-bar-width)` |
| Plugin Panel LEFT | 2 | 200px | 320px | `minmax(200px, 1fr)` |
| Main Content | 4 | 400px | unlimited | `minmax(400px, 2fr)` |
| Plugin Panel RIGHT | 2.5 | 250px | 400px | `minmax(250px, 1.25fr)` |
| Activity Bar RIGHT | 0.5 | 48px | 48px | `var(--activity-bar-width)` |

### 1.3 Total Ratios

```
Total Ratio Units: 0.5 + 0.5 + 2 + 4 + 2.5 + 0.5 = 10

At 1920px viewport:
- Global Sidebar: 48px (fixed)
- Activity Bar LEFT: 48px (fixed)
- Plugin LEFT: (1920-192) * 2/9 = 384px
- Main Content: (1920-192) * 4/9 = 768px
- Plugin RIGHT: (1920-192) * 2.5/9 = 480px
- Activity Bar RIGHT: 48px (fixed)
```

---

## Section 2: CSS Grid Implementation

### 2.1 Desktop Grid (>=1280px)

```css
/* Design Tokens */
:root {
  /* Grid dimensions */
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
  
  /* Terminal (post-MVP) */
  --terminal-height-collapsed: 32px;
  --terminal-height-expanded: 200px;
}

/* Project Space - Desktop Full */
.project-space--desktop {
  display: grid;
  grid-template-columns:
    var(--sidebar-width)           /* Global sidebar */
    var(--activity-bar-width)      /* Activity bar LEFT */
    minmax(var(--panel-left-min), 1fr)  /* Plugin LEFT */
    minmax(var(--main-content-min), 2fr) /* Main content */
    minmax(var(--panel-right-min), 1.25fr) /* Plugin RIGHT */
    var(--activity-bar-width);     /* Activity bar RIGHT */
  grid-template-rows:
    var(--header-height)           /* Header */
    1fr                            /* Content */
    var(--status-bar-height);      /* Status bar */
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}

/* Grid Areas */
.project-space--desktop {
  grid-template-areas:
    "header header header header header header"
    "sidebar activity-left panel-left main panel-right activity-right"
    "status status status status status status";
}

.global-sidebar { grid-area: sidebar; }
.activity-bar--left { grid-area: activity-left; }
.plugin-panel--left { grid-area: panel-left; }
.main-content { grid-area: main; }
.plugin-panel--right { grid-area: panel-right; }
.activity-bar--right { grid-area: activity-right; }
.global-header { grid-area: header; }
.status-bar { grid-area: status; }
```

### 2.2 Main Content Area with Activity Bar TOP

```css
/* Main Content Grid (nested) */
.main-content {
  display: grid;
  grid-template-rows:
    var(--activity-bar-width)    /* Activity bar TOP */
    1fr;                          /* Plugin content */
  overflow: hidden;
}

.main-content__activity-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-bottom: 2px solid var(--color-structural);
  background: var(--color-card);
}

.main-content__plugin {
  overflow: auto;
  position: relative;
}
```

### 2.3 Terminal Panel (Post-MVP)

```css
/* Terminal Panel - Below Main Content */
.main-content--with-terminal {
  grid-template-rows:
    var(--activity-bar-width)    /* Activity bar TOP */
    1fr                           /* Plugin content */
    var(--terminal-height-collapsed); /* Terminal collapsed */
}

.main-content--with-terminal.terminal-expanded {
  grid-template-rows:
    var(--activity-bar-width)
    1fr
    var(--terminal-height-expanded);
}

.terminal-panel {
  border-top: 2px solid var(--color-structural);
  background: var(--color-background);
  display: flex;
  flex-direction: column;
}

.terminal-panel__header {
  height: var(--terminal-height-collapsed);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  cursor: pointer;
  background: var(--color-card);
}

.terminal-panel__content {
  flex: 1;
  overflow: hidden;
}
```

---

## Section 3: Responsive Breakpoints

### 3.1 Breakpoint Definitions

| Tier | Name | Min Width | Max Width | Orientation |
|------|------|-----------|-----------|-------------|
| 1 | Desktop | 1280px | unlimited | Landscape |
| 2 | Laptop | 1024px | 1279px | Landscape |
| 3 | Tablet Landscape | 768px | 1023px | Landscape |
| 4 | Tablet Portrait | 600px | 767px | Portrait |
| 5 | Phone Landscape | 480px | 599px | Landscape |
| 6 | Phone Portrait | 0px | 479px | Portrait |

### 3.2 Tailwind Breakpoint Mapping

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      // Mobile-first breakpoints
      'sm': '480px',      // Phone landscape
      'md': '600px',      // Tablet portrait  
      'lg': '768px',      // Tablet landscape
      'xl': '1024px',     // Laptop
      '2xl': '1280px',    // Desktop
      
      // Custom queries
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      'touch': { 'raw': '(hover: none)' },
      'pointer-fine': { 'raw': '(pointer: fine)' },
    },
  },
};
```

---

## Section 4: Breakpoint-Specific Layouts

### 4.1 Tier 1: Desktop (>=1280px) - Landscape

```
Layout: [0.5:(0.5:2:4:2.5:0.5)]
Max Plugins: 4 (2 always-loaded + 2 optional)
All activity bars visible
Global sidebar: collapsible

ASCII Diagram:
+----+----+------+------------------------+--------+----+
|    |    |      |  [Activity Bar TOP]    |        |    |
| G  | A  | FT   |________________________|  Chat  | A  |
| S  | L  |      |                        |        | R  |
|    |    |      |    Notes / Monaco      |        |    |
|    |    |      |                        |        |    |
+----+----+------+------------------------+--------+----+
| 48 | 48 | flex |        flex            |  flex  | 48 |
+----+----+------+------------------------+--------+----+
| GS=Global Sidebar | AL=Activity Left | AR=Activity Right |
| FT=FileTree | Main=Notes/Monaco with Activity TOP      |
```

```css
/* Tier 1: Desktop */
@media (min-width: 1280px) {
  .project-space {
    grid-template-columns:
      var(--sidebar-width)
      var(--activity-bar-width)
      minmax(200px, 1fr)
      minmax(400px, 2fr)
      minmax(250px, 1.25fr)
      var(--activity-bar-width);
  }
  
  .activity-bar--left,
  .activity-bar--right { display: flex; }
  .plugin-panel--left,
  .plugin-panel--right { display: block; }
  .global-sidebar { display: flex; flex-direction: column; }
}
```

---

### 4.2 Tier 2: Laptop (1024px - 1279px) - Landscape

```
Layout: [0.5:(0.5:2:5:0.5)]
Max Plugins: 3 (2 always-loaded + 1 optional)
Right panel becomes overlay/modal
Activity bars: combine to single (LEFT only)

ASCII Diagram:
+----+----+------+--------------------------------+----+
|    |    |      |    [Activity Bar TOP]          |    |
| G  | A  | FT   |________________________________| A  |
| S  | L  |      |                                | R  |
|    |    |      |        Notes / Monaco          |    |
|    |    |      |                                |    |
+----+----+------+--------------------------------+----+
| 48 | 48 | flex |            flex                | 48 |
+----+----+------+--------------------------------+----+
| Right panel (Chat) = overlay triggered by AR button   |
```

```css
/* Tier 2: Laptop */
@media (min-width: 1024px) and (max-width: 1279px) {
  .project-space {
    grid-template-columns:
      var(--sidebar-width)
      var(--activity-bar-width)
      minmax(200px, 1fr)
      minmax(400px, 3fr)
      var(--activity-bar-width);
    grid-template-areas:
      "header header header header header"
      "sidebar activity-left panel-left main activity-right"
      "status status status status status";
  }
  
  .plugin-panel--right {
    display: none; /* Becomes overlay */
  }
  
  .plugin-panel--right.is-open {
    position: fixed;
    right: 0;
    top: var(--header-height);
    bottom: var(--status-bar-height);
    width: 350px;
    z-index: 50;
    background: var(--color-background);
    border-left: 2px solid var(--color-structural);
    box-shadow: -4px 0 0 0 var(--color-shadow);
  }
}
```

---

### 4.3 Tier 3: Tablet Landscape (768px - 1023px)

```
Layout: [0.5:(0.5:8:0.5)]
Max Plugins: 2 (always-loaded only)
Single main area with plugin switcher
Global sidebar: icon-only, auto-collapse

ASCII Diagram:
+----+----+----------------------------------+----+
|    |    |     [Plugin Switcher Tabs]       |    |
| G  | A  |__________________________________|  A |
| S  | L  |                                  |  R |
|    |    |       Active Plugin              |    |
|    |    |       (Full Width)               |    |
+----+----+----------------------------------+----+
| 48 | 48 |           flex                   | 48 |
+----+----+----------------------------------+----+
| Plugin LEFT hidden - controlled via Activity Bar    |
```

```css
/* Tier 3: Tablet Landscape */
@media (min-width: 768px) and (max-width: 1023px) {
  .project-space {
    grid-template-columns:
      var(--sidebar-width)
      var(--activity-bar-width)
      1fr
      var(--activity-bar-width);
    grid-template-areas:
      "header header header header"
      "sidebar activity-left main activity-right"
      "status status status status";
  }
  
  .plugin-panel--left,
  .plugin-panel--right {
    display: none;
  }
  
  /* Plugin switcher tabs at top of main area */
  .main-content__activity-bar {
    justify-content: center;
    gap: 8px;
  }
  
  .plugin-switcher-tab {
    min-width: 80px;
    padding: 8px 16px;
  }
  
  /* Global sidebar collapses */
  .global-sidebar {
    width: var(--sidebar-width);
    overflow: hidden;
  }
  
  .global-sidebar:hover,
  .global-sidebar:focus-within {
    width: 200px;
    position: absolute;
    z-index: 40;
    box-shadow: 4px 0 0 0 var(--color-shadow);
  }
}
```

---

### 4.4 Tier 4: Tablet Portrait (600px - 767px)

```
Layout: Full-width single panel
Max Plugins: 2
Bottom navigation for plugin switching
Drawer-based global nav

ASCII Diagram:
+----------------------------------------+
|        [Header: Project + Menu]        |
+----------------------------------------+
|                                        |
|                                        |
|          Active Plugin                 |
|          (Full Screen)                 |
|                                        |
|                                        |
+----------------------------------------+
|  Files  |  Notes  |  Chat  |   More   |
+----------------------------------------+
|              Bottom Nav (56px)         |
```

```css
/* Tier 4: Tablet Portrait */
@media (min-width: 600px) and (max-width: 767px) {
  .project-space {
    display: flex;
    flex-direction: column;
    height: 100dvh;
  }
  
  .global-header {
    height: var(--header-height);
    flex-shrink: 0;
  }
  
  .main-content {
    flex: 1;
    overflow: hidden;
  }
  
  .bottom-nav {
    height: 56px;
    flex-shrink: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: 2px solid var(--color-structural);
    background: var(--color-card);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* Hide desktop elements */
  .global-sidebar,
  .activity-bar--left,
  .activity-bar--right,
  .plugin-panel--left,
  .plugin-panel--right,
  .status-bar {
    display: none;
  }
  
  /* Global nav as drawer */
  .global-nav-drawer {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 60;
    background: var(--color-background);
    border-right: 2px solid var(--color-structural);
  }
  
  .global-nav-drawer.is-open {
    transform: translateX(0);
  }
}
```

---

### 4.5 Tier 5: Phone Landscape (480px - 599px)

```
Layout: Single panel with gestures
Max Plugins: 1 active at a time
Swipe navigation between plugins
Minimal chrome

ASCII Diagram:
+--------------------------------------+
|     [Minimal Header: Back + Title]   |
+--------------------------------------+
|                                      |
|                                      |
|         Active Plugin                |
|         (Full Screen)                |
|                                      |
|                                      |
+--------------------------------------+
|      [Gesture hint / mini-nav]       |
+--------------------------------------+

<-- Swipe Left/Right to Switch Plugin -->
```

```css
/* Tier 5: Phone Landscape */
@media (min-width: 480px) and (max-width: 599px) {
  .project-space {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
  }
  
  .global-header {
    height: 40px;
    flex-shrink: 0;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .main-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  
  /* Swipe container */
  .plugin-swipe-container {
    display: flex;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  
  .plugin-swipe-panel {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    scroll-snap-align: start;
  }
  
  /* Gesture hint */
  .gesture-hint {
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  .gesture-hint__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-muted);
  }
  
  .gesture-hint__dot.active {
    background: var(--color-primary);
    width: 16px;
    border-radius: 3px;
  }
  
  /* Hide all non-essential UI */
  .global-sidebar,
  .activity-bar--left,
  .activity-bar--right,
  .plugin-panel--left,
  .plugin-panel--right,
  .status-bar,
  .bottom-nav {
    display: none;
  }
}
```

---

### 4.6 Tier 6: Phone Portrait (<480px)

```
Layout: Single panel, full immersion
Max Plugins: 1
Bottom sheet for secondary actions
Hamburger menu for navigation

ASCII Diagram:
+--------------------------------+
|  [=]  Project Name     [...]  |
+--------------------------------+
|                                |
|                                |
|      Active Plugin             |
|      (Full Immersion)          |
|                                |
|                                |
|                                |
|                                |
+--------------------------------+
        ^
        | Pull up for actions
+--------------------------------+
|       Bottom Sheet             |
|   Switch Plugin | Settings     |
+--------------------------------+
```

```css
/* Tier 6: Phone Portrait */
@media (max-width: 479px) {
  .project-space {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
  }
  
  .global-header {
    height: 44px;
    flex-shrink: 0;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid var(--color-structural);
  }
  
  .global-header__menu-btn,
  .global-header__actions-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .main-content {
    flex: 1;
    overflow: auto;
  }
  
  /* Bottom sheet */
  .bottom-sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-card);
    border-top: 2px solid var(--color-structural);
    border-radius: 0;
    transform: translateY(100%);
    transition: transform 0.2s ease;
    max-height: 60vh;
    z-index: 70;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .bottom-sheet.is-open {
    transform: translateY(0);
  }
  
  .bottom-sheet__handle {
    width: 40px;
    height: 4px;
    background: var(--color-muted);
    margin: 8px auto;
  }
  
  /* Hamburger drawer */
  .hamburger-drawer {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: var(--color-background);
    border-right: 2px solid var(--color-structural);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 80;
    padding-top: env(safe-area-inset-top);
  }
  
  .hamburger-drawer.is-open {
    transform: translateX(0);
  }
  
  /* Hide all non-essential UI */
  .global-sidebar,
  .activity-bar--left,
  .activity-bar--right,
  .plugin-panel--left,
  .plugin-panel--right,
  .status-bar,
  .bottom-nav {
    display: none;
  }
}
```

---

## Section 5: Plugin Limit Matrix

### 5.1 Device-Type Plugin Limits

| Device Type | Max Plugins | Always-Loaded | Optional | Layout Type |
|-------------|-------------|---------------|----------|-------------|
| Desktop (>=1280px) | 4 | FileTree, Chat | Monaco, Notes, Terminal, Preview | Multi-panel |
| Laptop (1024-1279px) | 3 | FileTree, Chat | Monaco, Notes | Panel + overlay |
| Tablet Landscape (768-1023px) | 2 | FileTree | Notes, Chat | Single + tabs |
| Tablet Portrait (600-767px) | 2 | FileTree | Notes, Chat | Full-screen + nav |
| Phone Landscape (480-599px) | 1 | - | Notes, Chat, FileTree | Swipe |
| Phone Portrait (<480px) | 1 | - | Notes, Chat | Full immersion |

### 5.2 Plugin Availability by Platform

| Plugin | Desktop FSA | Desktop IDB | Tablet | Mobile | Notes |
|--------|-------------|-------------|--------|--------|-------|
| **FileTree** | Always | Always | Yes | Yes | Universal |
| **Monaco** | Yes | Yes (limited) | Yes | No | Requires min-width 768px |
| **Notes** | Yes | Yes | Yes | Yes | Universal |
| **Terminal** | Yes | No | No | No | Requires FSA + WebContainer |
| **Preview** | Yes | No | No | No | Requires FSA + WebContainer |
| **Chat** | Always | Always | Yes | Yes | Universal |

### 5.3 TypeScript Plugin Limits

```typescript
// src/domain/types/plugin-limits.ts

export interface PluginLimits {
  maxPlugins: number;
  alwaysLoaded: PluginId[];
  available: PluginId[];
  blocked: PluginId[];
  layoutType: 'multi-panel' | 'panel-overlay' | 'single-tabs' | 'full-nav' | 'swipe' | 'immersion';
}

export function getPluginLimits(deviceType: DeviceType, storageType: StorageType): PluginLimits {
  // Desktop with FSA
  if (deviceType === 'desktop' && storageType === 'fsa') {
    return {
      maxPlugins: 4,
      alwaysLoaded: ['filetree', 'chat'],
      available: ['monaco', 'notes', 'terminal', 'preview'],
      blocked: [],
      layoutType: 'multi-panel',
    };
  }
  
  // Desktop with IndexedDB
  if (deviceType === 'desktop' && storageType === 'indexeddb') {
    return {
      maxPlugins: 4,
      alwaysLoaded: ['filetree', 'chat'],
      available: ['monaco', 'notes'],
      blocked: ['terminal', 'preview'],
      layoutType: 'multi-panel',
    };
  }
  
  // Tablet
  if (deviceType === 'tablet') {
    return {
      maxPlugins: 2,
      alwaysLoaded: ['filetree'],
      available: ['notes', 'chat'],
      blocked: ['monaco', 'terminal', 'preview'],
      layoutType: 'single-tabs',
    };
  }
  
  // Mobile
  return {
    maxPlugins: 1,
    alwaysLoaded: [],
    available: ['notes', 'chat', 'filetree'],
    blocked: ['monaco', 'terminal', 'preview'],
    layoutType: 'immersion',
  };
}
```

---

## Section 6: Activity Bar Specification

### 6.1 Activity Bar Anatomy

```
Activity Bar (48px width)
+------+
|  IC  |  <- Plugin icon (24x24)
+------+
|  IC  |
+------+
|  IC  |
+------+
|  IC  |
+------+
|  IC  |
+------+
|  IC  |
+------+
|      |  <- Flexible spacer
|......|
|      |
+------+
| [+]  |  <- Add plugin button (optional)
+------+
```

### 6.2 Activity Bar Props

```typescript
interface ActivityBarProps {
  /** Position in layout */
  position: 'left' | 'right' | 'top';
  
  /** Plugins to display */
  plugins: PluginId[];
  
  /** Currently active plugin */
  activePlugin: PluginId | null;
  
  /** Maximum slots before scroll */
  maxSlots?: number; // Default: 6
  
  /** Allow drag-drop reordering */
  allowReorder?: boolean; // Default: true
  
  /** Callback when plugin clicked */
  onPluginClick: (pluginId: PluginId) => void;
  
  /** Callback when plugins reordered */
  onReorder?: (plugins: PluginId[]) => void;
}
```

### 6.3 Activity Bar CSS

```css
/* Activity Bar Base */
.activity-bar {
  width: var(--activity-bar-width);
  display: flex;
  flex-direction: column;
  background: var(--color-card);
  border-right: 2px solid var(--color-structural);
  padding: 8px 0;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* When positioned right */
.activity-bar--right {
  border-right: none;
  border-left: 2px solid var(--color-structural);
}

/* When positioned top (horizontal) */
.activity-bar--top {
  width: 100%;
  height: var(--activity-bar-width);
  flex-direction: row;
  border-right: none;
  border-bottom: 2px solid var(--color-structural);
  padding: 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
}

/* Activity Bar Button */
.activity-bar__btn {
  width: 40px;
  height: 40px;
  margin: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.1s linear;
}

.activity-bar__btn:hover {
  background: var(--color-canvas);
}

.activity-bar__btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

/* Active indicator */
.activity-bar__btn.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--color-primary);
}

.activity-bar--right .activity-bar__btn.active::before {
  left: auto;
  right: 0;
}

.activity-bar--top .activity-bar__btn.active::before {
  left: 8px;
  right: 8px;
  top: auto;
  bottom: 0;
  width: auto;
  height: 2px;
}

/* Tooltip */
.activity-bar__tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  padding: 4px 8px;
  background: var(--color-foreground);
  color: var(--color-background);
  font-size: 12px;
  font-family: var(--font-mono);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 100;
}

.activity-bar__btn:hover .activity-bar__tooltip,
.activity-bar__btn:focus-visible .activity-bar__tooltip {
  opacity: 1;
}

/* Overflow indicator */
.activity-bar__overflow {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--color-structural);
}

/* Drag-drop states */
.activity-bar__btn.dragging {
  opacity: 0.5;
}

.activity-bar__btn.drag-over {
  background: var(--color-primary-alpha-20);
}
```

### 6.4 Activity Bar Icons

| Plugin | Icon | Lucide Name | Tooltip Text |
|--------|------|-------------|--------------|
| FileTree | Folder | `Folder` | "Files" |
| Monaco | Code | `Code2` | "Editor" |
| Notes | NotepadText | `NotebookPen` | "Notes" |
| Terminal | Terminal | `Terminal` | "Terminal" |
| Preview | Eye | `Eye` | "Preview" |
| Chat | MessageSquare | `MessageSquare` | "AI Chat" |
| Add | Plus | `Plus` | "Add Plugin" |
| Settings | Settings | `Settings` | "Settings" |

---

## Section 7: Plugin Docker System

### 7.1 Plugin Docker Overview

The Plugin Docker system allows drag-drop management of plugins across activity bars and panel positions.

```
Plugin Flow:
[Plugin Registry] -> [Activity Bar (docked)] -> [Panel Position]
                           |
                           v
                    [Drag to reorder]
                           |
                           v
                    [Drop to new slot]
```

### 7.2 Docker Interaction Patterns

#### 7.2.1 Drag from Activity Bar

```
1. User long-presses (touch) or mousedown (pointer) on plugin icon
2. 150ms delay before drag starts (prevents accidental drags)
3. Visual feedback: icon lifts with shadow, slot shows empty state
4. Dragging: ghost follows cursor, valid drop zones highlight
5. Drop: plugin moves to new position, state persists
```

#### 7.2.2 Drop Zone Types

| Zone | Action | Visual Feedback |
|------|--------|-----------------|
| Activity Bar Slot | Reorder in same bar | Blue border highlight |
| Other Activity Bar | Move to different bar | Blue background pulse |
| Panel Area | Dock to panel position | Dashed border outline |
| Trash Zone | Remove plugin | Red background |

### 7.3 Docker State Management

```typescript
// src/infrastructure/persistence/stores/plugin-docker-store.ts

interface PluginDockerState {
  /** Left activity bar plugins */
  leftBar: PluginId[];
  
  /** Right activity bar plugins */
  rightBar: PluginId[];
  
  /** Top activity bar plugins (main content) */
  topBar: PluginId[];
  
  /** Panel positions */
  panels: {
    left: PluginId | null;
    main: PluginId | null;
    right: PluginId | null;
  };
  
  /** Drag state */
  dragging: {
    pluginId: PluginId | null;
    sourceBar: 'left' | 'right' | 'top' | null;
    sourceIndex: number | null;
  };
}

interface PluginDockerActions {
  /** Start dragging a plugin */
  startDrag: (pluginId: PluginId, sourceBar: 'left' | 'right' | 'top', sourceIndex: number) => void;
  
  /** End drag (drop or cancel) */
  endDrag: () => void;
  
  /** Move plugin to new position */
  movePlugin: (
    pluginId: PluginId,
    targetBar: 'left' | 'right' | 'top',
    targetIndex: number
  ) => void;
  
  /** Set panel content */
  setPanel: (position: 'left' | 'main' | 'right', pluginId: PluginId | null) => void;
  
  /** Remove plugin from docker */
  removePlugin: (pluginId: PluginId) => void;
  
  /** Reset to defaults */
  resetToDefaults: (deviceType: DeviceType) => void;
}

export const usePluginDockerStore = create<PluginDockerState & PluginDockerActions>()(
  persist(
    (set, get) => ({
      leftBar: ['filetree'],
      rightBar: ['chat'],
      topBar: [],
      panels: {
        left: 'filetree',
        main: 'notes',
        right: 'chat',
      },
      dragging: {
        pluginId: null,
        sourceBar: null,
        sourceIndex: null,
      },
      
      startDrag: (pluginId, sourceBar, sourceIndex) => {
        set({ dragging: { pluginId, sourceBar, sourceIndex } });
      },
      
      endDrag: () => {
        set({ dragging: { pluginId: null, sourceBar: null, sourceIndex: null } });
      },
      
      movePlugin: (pluginId, targetBar, targetIndex) => {
        const state = get();
        const { dragging } = state;
        
        if (!dragging.sourceBar) return;
        
        // Remove from source
        const sourceKey = `${dragging.sourceBar}Bar` as 'leftBar' | 'rightBar' | 'topBar';
        const targetKey = `${targetBar}Bar` as 'leftBar' | 'rightBar' | 'topBar';
        
        const newSource = state[sourceKey].filter(id => id !== pluginId);
        const newTarget = [...state[targetKey]];
        newTarget.splice(targetIndex, 0, pluginId);
        
        set({
          [sourceKey]: newSource,
          [targetKey]: newTarget,
        });
        
        get().endDrag();
      },
      
      setPanel: (position, pluginId) => {
        set(state => ({
          panels: { ...state.panels, [position]: pluginId },
        }));
      },
      
      removePlugin: (pluginId) => {
        set(state => ({
          leftBar: state.leftBar.filter(id => id !== pluginId),
          rightBar: state.rightBar.filter(id => id !== pluginId),
          topBar: state.topBar.filter(id => id !== pluginId),
          panels: {
            left: state.panels.left === pluginId ? null : state.panels.left,
            main: state.panels.main === pluginId ? null : state.panels.main,
            right: state.panels.right === pluginId ? null : state.panels.right,
          },
        }));
      },
      
      resetToDefaults: (deviceType) => {
        const limits = getPluginLimits(deviceType, 'fsa');
        
        if (deviceType === 'desktop') {
          set({
            leftBar: ['filetree'],
            rightBar: ['chat'],
            topBar: ['monaco', 'notes'],
            panels: {
              left: 'filetree',
              main: 'notes',
              right: 'chat',
            },
          });
        } else {
          set({
            leftBar: ['filetree'],
            rightBar: [],
            topBar: ['notes', 'chat'],
            panels: {
              left: null,
              main: 'notes',
              right: null,
            },
          });
        }
      },
    }),
    {
      name: 'plugin-docker',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 7.4 Docker CSS

```css
/* Drop zone indicators */
.drop-zone {
  position: relative;
}

.drop-zone::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 2px dashed transparent;
  pointer-events: none;
  transition: border-color 0.15s;
}

.drop-zone.drop-target::after {
  border-color: var(--color-primary);
}

.drop-zone.drop-invalid::after {
  border-color: var(--color-destructive);
}

/* Drag ghost */
.drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  opacity: 0.9;
  background: var(--color-card);
  border: 2px solid var(--color-primary);
  box-shadow: 4px 4px 0 0 var(--color-shadow);
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Empty slot placeholder */
.activity-bar__slot--empty {
  width: 40px;
  height: 40px;
  margin: 0 4px;
  border: 2px dashed var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* Trash zone */
.plugin-trash-zone {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: var(--color-destructive);
  color: white;
  display: none;
  align-items: center;
  gap: 8px;
  z-index: 999;
}

.plugin-trash-zone.visible {
  display: flex;
}

.plugin-trash-zone.drag-over {
  background: var(--color-destructive-dark);
  transform: translateX(-50%) scale(1.1);
}
```

---

## Section 8: Tailwind Responsive Utility Mappings

### 8.1 Responsive Classes Quick Reference

```html
<!-- Visibility by breakpoint -->
<div class="
  hidden          /* Phone portrait */
  sm:hidden       /* Phone landscape */
  md:block        /* Tablet portrait+ */
  lg:flex         /* Tablet landscape+ */
  xl:grid         /* Laptop+ */
  2xl:inline      /* Desktop+ */
">

<!-- Grid columns by breakpoint -->
<div class="
  grid-cols-1       /* Mobile */
  md:grid-cols-2    /* Tablet */
  lg:grid-cols-3    /* Tablet landscape */
  xl:grid-cols-4    /* Laptop */
  2xl:grid-cols-6   /* Desktop */
">

<!-- Flex direction by breakpoint -->
<div class="
  flex-col          /* Mobile: vertical stack */
  md:flex-row       /* Tablet+: horizontal row */
">

<!-- Panel visibility -->
<aside class="
  hidden            /* Mobile: hidden */
  lg:flex           /* Tablet landscape+: visible */
  lg:flex-col
  lg:w-[var(--sidebar-width)]
">
```

### 8.2 Custom Tailwind Plugins

```javascript
// tailwind.config.js

module.exports = {
  plugins: [
    // 8-bit design utilities
    plugin(({ addUtilities }) => {
      addUtilities({
        '.shadow-pixel': {
          boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.25)',
        },
        '.shadow-pixel-sm': {
          boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.25)',
        },
        '.shadow-pixel-lg': {
          boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.25)',
        },
        '.border-structural': {
          borderColor: 'var(--color-structural)',
          borderWidth: '2px',
          borderStyle: 'solid',
        },
        '.rounded-none': {
          borderRadius: '0',
        },
      });
    }),
    
    // Safe area utilities
    plugin(({ addUtilities }) => {
      addUtilities({
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.mb-safe': {
          marginBottom: 'env(safe-area-inset-bottom)',
        },
      });
    }),
    
    // Touch target utilities
    plugin(({ addUtilities }) => {
      addUtilities({
        '.touch-target': {
          minWidth: '44px',
          minHeight: '44px',
        },
        '.touch-target-sm': {
          minWidth: '36px',
          minHeight: '36px',
        },
      });
    }),
  ],
};
```

### 8.3 Layout Component Classes

```html
<!-- Project Space Container -->
<div class="
  h-dvh w-dvw
  overflow-hidden
  bg-background text-foreground
  
  /* Mobile: flex column */
  flex flex-col
  
  /* Desktop: grid */
  2xl:grid
  2xl:grid-cols-[48px_48px_minmax(200px,1fr)_minmax(400px,2fr)_minmax(250px,1.25fr)_48px]
  2xl:grid-rows-[48px_1fr_24px]
">

<!-- Global Sidebar -->
<aside class="
  hidden
  2xl:flex 2xl:flex-col
  w-[48px]
  bg-card
  border-r-2 border-structural
">

<!-- Activity Bar LEFT -->
<nav class="
  hidden
  xl:flex xl:flex-col
  w-[48px]
  bg-card
  border-r-2 border-structural
">

<!-- Plugin Panel LEFT -->
<section class="
  hidden
  lg:block
  min-w-[200px] max-w-[320px]
  bg-background
  border-r-2 border-structural
  overflow-auto
">

<!-- Main Content -->
<main class="
  flex-1
  overflow-hidden
  
  /* Nested grid for activity bar TOP */
  grid grid-rows-[48px_1fr]
">

<!-- Activity Bar TOP (inside main) -->
<nav class="
  flex items-center
  h-[48px]
  px-2 gap-1
  bg-card
  border-b-2 border-structural
">

<!-- Plugin Panel RIGHT -->
<aside class="
  hidden
  2xl:block
  min-w-[250px] max-w-[400px]
  bg-background
  border-l-2 border-structural
  overflow-auto
  
  /* Laptop: overlay mode */
  xl:fixed xl:right-0 xl:top-[48px] xl:bottom-[24px]
  xl:w-[350px] xl:z-50
  xl:translate-x-full
  xl:data-[open=true]:translate-x-0
  xl:transition-transform xl:duration-200
">

<!-- Activity Bar RIGHT -->
<nav class="
  hidden
  2xl:flex 2xl:flex-col
  w-[48px]
  bg-card
  border-l-2 border-structural
">

<!-- Status Bar -->
<footer class="
  hidden
  lg:flex
  h-[24px]
  bg-primary
  text-primary-foreground
  items-center
  px-3
  text-xs font-mono
">

<!-- Mobile Bottom Nav -->
<nav class="
  fixed bottom-0 left-0 right-0
  flex justify-around items-center
  h-14 pb-safe
  bg-zinc-900
  border-t-2 border-zinc-700
  md:hidden
">
```

---

## Section 9: Terminal Panel Specification (Post-MVP)

### 9.1 Terminal Panel Position

```
Position: Below main content area (ratio 4)
Height: Collapsible, resizable
Trigger: Keyboard shortcut (Ctrl+`) or button

Desktop Layout with Terminal:
+----+----+------+------------------------+--------+----+
|    |    |      |  [Activity Bar TOP]    |        |    |
| G  | A  | FT   |________________________|  Chat  | A  |
| S  | L  |      |    Notes / Monaco      |        | R  |
|    |    |      |________________________|        |    |
|    |    |      |  [Terminal Header]     |        |    |
|    |    |      |  Terminal Content      |        |    |
+----+----+------+------------------------+--------+----+
```

### 9.2 Terminal Panel States

| State | Height | Behavior |
|-------|--------|----------|
| Hidden | 0px | Not rendered |
| Collapsed | 32px | Header only, click to expand |
| Default | 200px | Standard working height |
| Maximized | 50vh | Half viewport |

### 9.3 Terminal CSS (Post-MVP)

```css
/* Terminal Panel */
.terminal-panel {
  background: var(--color-background);
  border-top: 2px solid var(--color-structural);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* State-based heights */
  --terminal-height: 200px;
  height: var(--terminal-height);
  min-height: 32px;
  max-height: 50vh;
  
  /* Resize handle */
  resize: vertical;
}

.terminal-panel--collapsed {
  height: 32px;
}

.terminal-panel--maximized {
  height: 50vh;
}

.terminal-panel__header {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--color-card);
  border-bottom: 1px solid var(--color-structural);
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.terminal-panel__tabs {
  display: flex;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
}

.terminal-panel__tab {
  padding: 4px 12px;
  font-size: 12px;
  font-family: var(--font-mono);
  background: transparent;
  border: none;
  cursor: pointer;
}

.terminal-panel__tab.active {
  background: var(--color-canvas);
}

.terminal-panel__actions {
  display: flex;
  gap: 4px;
}

.terminal-panel__content {
  flex: 1;
  overflow: hidden;
}

/* Only show on desktop breakpoints */
.terminal-panel {
  display: none;
}

@media (min-width: 1024px) {
  .terminal-panel {
    display: flex;
  }
}
```

---

## Section 10: Accessibility Requirements

### 10.1 Touch Targets

| Element | Minimum Size | Recommended |
|---------|--------------|-------------|
| Activity Bar Button | 44x44px | 48x48px |
| Plugin Tab | 44x44px | 48x48px |
| Bottom Nav Item | 44x56px | 60x56px |
| Hamburger Menu | 44x44px | 48x48px |
| Close Button | 44x44px | 44x44px |

### 10.2 Focus Management

```css
/* Focus visible only for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--color-background);
  padding: 8px 16px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 10.3 ARIA Landmarks

```html
<div class="project-space" role="application" aria-label="Project workspace">
  <header role="banner" aria-label="Project header">...</header>
  
  <nav role="navigation" aria-label="Activity bar">...</nav>
  
  <aside role="complementary" aria-label="File explorer">...</aside>
  
  <main role="main" aria-label="Main content">...</main>
  
  <aside role="complementary" aria-label="AI chat">...</aside>
  
  <footer role="contentinfo" aria-label="Status bar">...</footer>
  
  <nav role="navigation" aria-label="Bottom navigation" class="md:hidden">...</nav>
</div>
```

---

## Section 11: Implementation Checklist

### 11.1 Phase 1: Core Grid (P0)

- [ ] Create CSS custom properties for grid dimensions
- [ ] Implement desktop grid template (>=1280px)
- [ ] Implement laptop grid template (1024-1279px)
- [ ] Implement tablet landscape grid (768-1023px)
- [ ] Create mobile flex layouts (< 768px)
- [ ] Add activity bar component (left, right, top variants)
- [ ] Add bottom navigation component

### 11.2 Phase 2: Plugin Docker (P1)

- [ ] Create plugin docker store
- [ ] Implement drag-drop for activity bars
- [ ] Implement panel slot management
- [ ] Add plugin limit enforcement
- [ ] Persist docker state to localStorage

### 11.3 Phase 3: Terminal Panel (Post-MVP)

- [ ] Create terminal panel component
- [ ] Add resize handle
- [ ] Implement collapse/expand states
- [ ] Wire to WebContainer

### 11.4 Phase 4: Polish (P2)

- [ ] Add animations for panel transitions
- [ ] Implement gesture hints for mobile
- [ ] Add orientation lock warnings
- [ ] Performance optimization

---

## Appendix A: Design Token Reference

```css
:root {
  /* Grid Dimensions */
  --sidebar-width: 48px;
  --activity-bar-width: 48px;
  --header-height: 48px;
  --status-bar-height: 24px;
  --bottom-nav-height: 56px;
  
  /* Panel Constraints */
  --panel-left-min: 200px;
  --panel-left-max: 320px;
  --panel-right-min: 250px;
  --panel-right-max: 400px;
  --main-content-min: 400px;
  
  /* Terminal */
  --terminal-height-collapsed: 32px;
  --terminal-height-default: 200px;
  --terminal-height-max: 50vh;
  
  /* Z-index Scale */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;
  --z-overlay: 90;
  --z-drag-ghost: 100;
  
  /* Safe Areas */
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);
  --safe-area-left: env(safe-area-inset-left);
  --safe-area-right: env(safe-area-inset-right);
}
```

---

## Appendix B: Breakpoint Quick Reference

```
+------------------+----------------+-------------+
| Phone Portrait   |    < 480px     | 1 plugin    |
+------------------+----------------+-------------+
| Phone Landscape  |  480 - 599px   | 1 plugin    |
+------------------+----------------+-------------+
| Tablet Portrait  |  600 - 767px   | 2 plugins   |
+------------------+----------------+-------------+
| Tablet Landscape |  768 - 1023px  | 2 plugins   |
+------------------+----------------+-------------+
| Laptop           | 1024 - 1279px  | 3 plugins   |
+------------------+----------------+-------------+
| Desktop          |   >= 1280px    | 4 plugins   |
+------------------+----------------+-------------+
```

---

**End of Specification**

**Document Version**: 1.0.0
**Created**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
**Next Action**: Implementation by dev-ext team

---

*This specification provides the complete responsive grid system design for the plugin-centric architecture. Implementation should follow the phased approach outlined in Section 11.*
