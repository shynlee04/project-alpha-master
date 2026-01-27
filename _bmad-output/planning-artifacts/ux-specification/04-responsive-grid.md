# Responsive Grid System

<- [Design Tokens](./03-design-tokens.md) | [Index](./index.md) | [Global Components](./05-global-components.md) ->

---

## 4.1 Breakpoint Definitions (6 Tiers)

| Tier | Name | Min Width | Max Width | Orientation | Max Plugins |
|------|------|-----------|-----------|-------------|-------------|
| 1 | Desktop | 1280px | unlimited | Landscape | 4 |
| 2 | Laptop | 1024px | 1279px | Landscape | 3 |
| 3 | Tablet Landscape | 768px | 1023px | Landscape | 2 |
| 4 | Tablet Portrait | 600px | 767px | Portrait | 2 |
| 5 | Phone Landscape | 480px | 599px | Landscape | 1 |
| 6 | Phone Portrait | 0px | 479px | Portrait | 1 |

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '480px',      // Phone landscape
      'md': '600px',      // Tablet portrait  
      'lg': '768px',      // Tablet landscape
      'xl': '1024px',     // Laptop
      '2xl': '1280px',    // Desktop
      
      // Custom queries
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      'touch': { 'raw': '(hover: none)' },
    },
  },
};
```

---

## 4.2 Desktop Layout Specification

### Grid Structure: `[0.5:(0.5:2:4:2.5:0.5)]`

```
Desktop Full Layout (>=1280px)

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

### Ratio-to-Pixel Mapping

| Zone | Ratio | Min Width | Max Width | CSS Value |
|------|-------|-----------|-----------|-----------| 
| Global Sidebar | 0.5 | 48px | 48px | `var(--sidebar-width)` |
| Activity Bar LEFT | 0.5 | 48px | 48px | `var(--activity-bar-width)` |
| Plugin Panel LEFT | 2 | 200px | 320px | `minmax(200px, 1fr)` |
| Main Content | 4 | 400px | unlimited | `minmax(400px, 2fr)` |
| Plugin Panel RIGHT | 2.5 | 250px | 400px | `minmax(250px, 1.25fr)` |
| Activity Bar RIGHT | 0.5 | 48px | 48px | `var(--activity-bar-width)` |

### CSS Grid Implementation

```css
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
}

/* Desktop Full Layout */
.project-space--desktop {
  display: grid;
  grid-template-columns:
    var(--sidebar-width)
    var(--activity-bar-width)
    minmax(var(--panel-left-min), 1fr)
    minmax(var(--main-content-min), 2fr)
    minmax(var(--panel-right-min), 1.25fr)
    var(--activity-bar-width);
  grid-template-rows:
    var(--header-height)
    1fr
    var(--status-bar-height);
  grid-template-areas:
    "header header header header header header"
    "sidebar activity-left panel-left main panel-right activity-right"
    "status status status status status status";
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}
```

---

## 4.3 Plugin Limit Matrix by Device

| Device Type | Max Plugins | Always-Loaded | Optional | Layout |
|-------------|-------------|---------------|----------|--------|
| Desktop (>=1280px) | 4 | FileTree, Chat | Monaco, Notes, Terminal, Preview | Multi-panel |
| Laptop (1024-1279px) | 3 | FileTree, Chat | Monaco, Notes | Panel + overlay |
| Tablet Landscape | 2 | FileTree | Notes, Chat | Single + tabs |
| Tablet Portrait | 2 | FileTree | Notes, Chat | Full-screen + nav |
| Phone Landscape | 1 | - | Notes, Chat, FileTree | Swipe |
| Phone Portrait | 1 | - | Notes, Chat | Full immersion |

### Plugin Availability by Platform

| Plugin | Desktop FSA | Desktop IDB | Tablet | Mobile |
|--------|-------------|-------------|--------|--------|
| **FileTree** | Always | Always | Yes | Yes |
| **Monaco** | Yes | Yes (limited) | Yes | No |
| **Notes** | Yes | Yes | Yes | Yes |
| **Terminal** | Yes | No | No | No |
| **Preview** | Yes | No | No | No |
| **Chat** | Always | Always | Yes | Yes |

---

## 4.4 Responsive Layout Variants

### Laptop (1024-1279px)

```
+----+----+------+--------------------------------+----+
|    |    |      |    [Activity Bar TOP]          |    |
| G  | A  | FT   |________________________________| A  |
| S  | L  |      |        Notes / Monaco          | R  |
+----+----+------+--------------------------------+----+

Right panel (Chat) = overlay triggered by Activity Bar button
```

### Tablet Portrait (600-767px)

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

### Phone Portrait (<480px)

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

## 4.5 Tailwind Responsive Utilities

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

<!-- Plugin Panel LEFT -->
<section class="
  hidden
  lg:block
  min-w-[200px] max-w-[320px]
  bg-background
  border-r-2 border-border
  overflow-auto
">

<!-- Mobile Bottom Nav -->
<nav class="
  fixed bottom-0 left-0 right-0
  flex justify-around items-center
  h-14 pb-safe
  bg-card
  border-t-2 border-border
  lg:hidden
">
```

---

<- [Design Tokens](./03-design-tokens.md) | [Index](./index.md) | [Global Components](./05-global-components.md) ->
