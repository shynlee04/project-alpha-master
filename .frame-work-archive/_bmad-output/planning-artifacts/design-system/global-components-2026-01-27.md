# Global Components Specification

**Document ID**: UX-DESIGN-02C
**Version**: 1.0.0
**Date**: 2026-01-27
**Author**: ux-designer-ext
**Status**: APPROVED
**Epic**: EPIC-UX-GLOBAL-UI

---

## Executive Summary

This specification defines the 5 global components that persist across all routes, providing consistent navigation, signposting, and user experience throughout the application.

### Components Covered

| Component | Purpose | Implementation Priority |
|-----------|---------|------------------------|
| **GlobalSidebar** | Primary navigation, route switching | P0 - Critical |
| **GlobalHeader** | Context bar, breadcrumbs, actions | P0 - Critical |
| **Breadcrumbs** | Route hierarchy navigation | P1 - High |
| **StatusBar** | System status, sync, shortcuts | P1 - High |
| **NavigationSystem** | Patterns for route transitions | P1 - High |

### Design System Compliance

All components MUST adhere to the 8-bit design system:

```css
/* NON-NEGOTIABLE RULES */
border-radius: 0;                           /* rounded-none */
box-shadow: 4px 4px 0 0 rgba(0,0,0,1);     /* shadow-pixel */
border-width: 2px;                          /* border-2 */
/* NO glassmorphism, NO backdrop-blur, NO opacity < 1 */
```

---

## 1. GlobalSidebar Component

### ASCII Wireframe

```
EXPANDED (240px)                    COLLAPSED (48px)
+------------------------------+    +--------+
| [LOGO] Via-gent          [-]|    |[LOGO]  |
+------------------------------+    +--------+
|                              |    |        |
| [H] Hub                      |    |  [H]   |
| [P] Projects                 |    |  [P]   |
|                              |    |        |
| RECENT PROJECTS              |    |        |
| * Project Alpha              |    |        |
| * Notes Demo                 |    |        |
|                              |    |        |
|------------------------------|    |--------|
| [S] Settings                 |    |  [S]   |
| [D/L] Theme  [EN/VI] Lang    |    | [D][E] |
| [<] Collapse                 |    |  [>]   |
+------------------------------+    +--------+

MOBILE (320px drawer overlay)
+--------------------------------+
| [LOGO] Via-gent            [X] |
+--------------------------------+
|                                |
| [H] Hub                  44px  |
| [P] Projects             44px  |
|                                |
| RECENT PROJECTS                |
| * Project Alpha                |
| * Notes Demo                   |
|                                |
|--------------------------------|
| [S] Settings             44px  |
| [D/L] Theme  [EN/VI] Lang      |
+--------------------------------+
```

### Props Interface

```typescript
interface GlobalSidebarProps {
  /** Additional CSS classes */
  className?: string;
}

// Internal state managed by useLayoutStore
interface SidebarState {
  /** Whether sidebar is collapsed (48px) or expanded (240px) */
  sidebarCollapsed: boolean;
  /** Whether mobile drawer is open */
  sidebarMobileOpen: boolean;
  /** Currently active navigation item ID */
  activeNavItem: 'home' | 'projects' | 'settings' | null;
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `className` | `string` | No | `undefined` | Additional CSS classes |

### State

| State | Type | Source | Description |
|-------|------|--------|-------------|
| `sidebarCollapsed` | `boolean` | `useLayoutStore` | Desktop collapse state |
| `sidebarMobileOpen` | `boolean` | `useLayoutStore` | Mobile drawer visibility |
| `activeNavItem` | `string \| null` | `useLayoutStore` | Currently highlighted nav item |
| `recentProjects` | `Project[]` | `useRecentProjects(5)` | Last 5 accessed projects |
| `resolvedTheme` | `'light' \| 'dark'` | `useTheme` | Current theme |
| `locale` | `'en' \| 'vi'` | `useLocalePreference` | Current language |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onNavigate` | `{ path: string, itemId: string }` | Route navigation triggered |
| `onToggleCollapse` | `void` | Collapse/expand toggled |
| `onMobileClose` | `void` | Mobile drawer close requested |
| `onThemeToggle` | `'light' \| 'dark'` | Theme changed |
| `onLocaleToggle` | `'en' \| 'vi'` | Language changed |

### Accessibility

```yaml
ARIA:
  role: navigation
  aria-label: "Main navigation"
  aria-expanded: "{sidebarMobileOpen}" # Mobile drawer

Keyboard:
  - Cmd/Ctrl + B: Toggle sidebar collapse
  - Cmd/Ctrl + Shift + T: Toggle theme
  - Tab: Navigate between items
  - Enter/Space: Activate item
  - Escape: Close mobile drawer

Screen Reader:
  - Announce current route on navigation
  - Announce collapse/expand state change
  - Announce theme/locale changes

Focus:
  - Focus trap when mobile drawer open
  - Return focus to trigger on close
  - Skip link to main content
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` (mobile) | Hidden by default, overlay drawer from left (320px), 60% backdrop |
| `768px - 1023px` (tablet) | Visible, collapsed by default (48px), can expand |
| `>= 1024px` (desktop) | Visible, expanded by default (240px), remember user preference |

### 8-bit Styling Rules

```css
/* Container */
.sidebar {
  background: var(--color-zinc-900);
  border-right: 2px solid var(--color-zinc-700);
  border-radius: 0; /* rounded-none */
}

/* Mobile overlay */
.sidebar-mobile {
  box-shadow: 4px 4px 0 0 rgba(0,0,0,1); /* shadow-pixel */
}

/* Nav item active */
.nav-item-active {
  border-left: 2px solid var(--color-orange-500);
  background: var(--color-zinc-900);
  box-shadow: 2px 2px 0 0 rgba(0,0,0,0.3);
}

/* Nav item hover */
.nav-item:hover {
  background: var(--color-zinc-950);
  color: var(--color-zinc-50);
}

/* Typography */
.nav-label {
  font-family: 'VT323', monospace; /* font-pixel */
  font-size: 16px;
  letter-spacing: 0.05em;
}
```

### ShadcnUI Integration

| ShadcnUI Component | Usage |
|--------------------|-------|
| `Tooltip` | Show labels when collapsed |
| `Sheet` | Mobile drawer container |
| `Button` | Toggle buttons (theme, locale, collapse) |
| `Separator` | Section dividers |

---

## 2. GlobalHeader Component

### ASCII Wireframe

```
DESKTOP (>= 768px)
+--------------------------------------------------------------------------------+
| [=] [LOGO] Via-gent | Hub | [Preset v] [Plugins...] ||| [Search...  Cmd+K] [S] [U] |
+--------------------------------------------------------------------------------+
   ^       ^           ^        ^           ^               ^                ^   ^
   |       |           |        |           |               |                |   |
Hamburger Logo      Nav     Preset    Plugin          Search          Settings User
(mobile)                   Selector   Toggles         Button          Button   Menu

MOBILE (< 768px)
+------------------------------------------------+
| [=] [LOGO] Via-gent          [Search] [S] [U]  |
+------------------------------------------------+
```

### Props Interface

```typescript
interface GlobalHeaderProps {
  /** Additional CSS classes */
  className?: string;
}

// Navigation items configuration
interface NavItem {
  key: string;
  path: string;
  labelKey: string; // i18n key
}

const NAV_ITEMS: readonly NavItem[] = [
  { key: 'home', path: '/', labelKey: 'navigation.home' },
];
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `className` | `string` | No | `undefined` | Additional CSS classes |

### State

| State | Type | Source | Description |
|-------|------|--------|-------------|
| `projectId` | `string \| undefined` | `useParams` | Current project from route |
| `isProjectRoute` | `boolean` | Derived | Whether on `/$projectId` route |
| `pathname` | `string` | `useLocation` | Current route path |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onMobileMenuToggle` | `void` | Open mobile sidebar |
| `onSearchFocus` | `void` | Open command palette |
| `onSettingsClick` | `void` | Navigate to /settings |
| `onUserClick` | `void` | Open user menu (future) |

### Accessibility

```yaml
ARIA:
  role: banner
  aria-label: "Main header"

Keyboard:
  - Cmd/Ctrl + K: Open command palette
  - Tab: Navigate between header items
  - Enter: Activate buttons

Screen Reader:
  - Current page announced via aria-current
  - Keyboard shortcut hints for search

Focus:
  - Visible focus indicators (ring-orange-500)
  - Logical tab order
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Show hamburger, hide nav links, hide preset selector, compact search |
| `< 1024px` | Hide plugin toggles |
| `>= 1024px` | Full layout with all elements |

### 8-bit Styling Rules

```css
/* Container */
.header {
  height: 48px; /* h-12 */
  background: var(--color-zinc-900);
  border-bottom: 2px solid var(--color-zinc-700);
  border-radius: 0;
}

/* Nav link active */
.nav-link-active {
  border: 2px solid var(--color-orange-500);
  color: var(--color-orange-500);
  background: var(--color-zinc-950);
}

/* Search button */
.search-button {
  border: 2px solid var(--color-zinc-700);
  background: var(--color-black);
  border-radius: 0;
}

/* Action buttons */
.action-button {
  min-width: 44px;
  min-height: 44px; /* Touch-friendly */
  border-radius: 0;
}
```

### ShadcnUI Integration

| ShadcnUI Component | Usage |
|--------------------|-------|
| `Button` | Action buttons, nav links |
| `DropdownMenu` | User menu (future) |
| `CommandDialog` | Search/command palette |

---

## 3. Breadcrumbs Component

### ASCII Wireframe

```
DESKTOP (>= 640px)
+------------------------------------------------------------------+
| Hub > My Project > Notes > Meeting Notes                         |
+------------------------------------------------------------------+

DESKTOP TRUNCATED (> 4 items)
+------------------------------------------------------------------+
| Hub > ... > Notes > Meeting Notes                                |
+------------------------------------------------------------------+

MOBILE (< 640px)
+------------------------------------------------------------------+
| ... > Notes > Meeting Notes                                      |
+------------------------------------------------------------------+

MOBILE MINIMAL
+------------------------------------------------------------------+
| <- Meeting Notes                                                  |
+------------------------------------------------------------------+
```

### Props Interface

```typescript
interface BreadcrumbsProps {
  /** Additional CSS classes */
  className?: string;
}

interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Path to navigate (undefined = current, not clickable) */
  path?: string;
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `className` | `string` | No | `undefined` | Additional CSS classes |

### State

| State | Type | Source | Description |
|-------|------|--------|-------------|
| `pathname` | `string` | `useLocation` | Current route path |
| `projectId` | `string \| undefined` | `useParams` | Current project ID |
| `project` | `Project \| null` | `useProjectStore` | Project details for name |
| `items` | `BreadcrumbItem[]` | Derived | Computed breadcrumb segments |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onNavigate` | `{ path: string }` | Breadcrumb item clicked |

### Accessibility

```yaml
ARIA:
  role: navigation
  aria-label: "Breadcrumb navigation"
  aria-current: "page" # For current item

Keyboard:
  - Tab: Navigate between breadcrumb links
  - Enter: Navigate to path

Screen Reader:
  - Announce full path on focus
  - "You are here: [current page]"

Separator:
  - aria-hidden="true" on chevron icons
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 640px` | Show ellipsis prefix + last 2 items only |
| `640px - 1023px` | Show up to 4 items, truncate middle |
| `>= 1024px` | Show all items up to max 4, truncate long labels |

### Breadcrumb Rules

```yaml
Structure: Home > [Workspace] > [Project] > [Current]

Max Items: 4 visible
Truncation:
  - If > 4: Show first, ellipsis, last 2
  - Label max-width: 200px (desktop), 100px (mobile)

Current Item:
  - Non-clickable
  - Bold text (text-zinc-50)
  - No path prop

Back Button (Mobile):
  - Arrow icon + current label only
  - Click navigates to parent
```

### 8-bit Styling Rules

```css
/* Container */
.breadcrumbs {
  height: 32px; /* h-8 */
  background: var(--color-zinc-950);
  border-radius: 0;
  font-family: monospace;
  font-size: 14px;
}

/* Link */
.breadcrumb-link {
  color: var(--color-zinc-400);
  border-radius: 0;
}

.breadcrumb-link:hover {
  color: var(--color-zinc-50);
}

/* Current */
.breadcrumb-current {
  color: var(--color-zinc-50);
  font-weight: 500;
}

/* Separator */
.breadcrumb-separator {
  color: var(--color-zinc-600);
  margin: 0 8px;
}
```

### ShadcnUI Integration

| ShadcnUI Component | Usage |
|--------------------|-------|
| `Breadcrumb` | Base component structure |
| `BreadcrumbItem` | Individual items |
| `BreadcrumbLink` | Clickable items |
| `BreadcrumbSeparator` | Chevron separators |
| `DropdownMenu` | Overflow menu for truncated items |

---

## 4. StatusBar (SystemRail) Component

### ASCII Wireframe

```
DESKTOP (always visible)
+--------------------------------------------------------------------------------+
| [Bot] Agent Ready    |    Ln 42, Col 15    |    [!] 0    [Sync] Synced    [^]  |
+--------------------------------------------------------------------------------+
   ^                          ^                     ^          ^              ^
   |                          |                     |          |              |
Agent Status            Editor Position        Problems    Sync Status   Expand

EXPANDED (with terminal drawer, 200px)
+--------------------------------------------------------------------------------+
| [Bot] Agent Ready    |    Ln 42, Col 15    |    [!] 0    [Sync] Synced    [v]  |
+--------------------------------------------------------------------------------+
| > Terminal                                                                     |
| $ npm run dev                                                                  |
| Starting development server...                                                 |
| Ready on http://localhost:3000                                                 |
|                                                                                |
+--------------------------------------------------------------------------------+

MOBILE
Hidden - critical info moved to header/toast notifications
```

### Props Interface

```typescript
interface StatusBarProps {
  /** Agent status indicator */
  agentStatus?: 'idle' | 'working' | 'error';
  /** Agent error message */
  agentError?: string;
  /** Current editor line number */
  line?: number;
  /** Current editor column number */
  column?: number;
  /** Number of problems/errors */
  problemsCount?: number;
  /** Sync status */
  syncStatus?: 'synced' | 'syncing' | 'error';
  /** Additional CSS classes */
  className?: string;
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `agentStatus` | `'idle' \| 'working' \| 'error'` | No | `'idle'` | Current AI agent status |
| `agentError` | `string` | No | `undefined` | Error message to display |
| `line` | `number` | No | `0` | Current cursor line |
| `column` | `number` | No | `0` | Current cursor column |
| `problemsCount` | `number` | No | `0` | Problems/errors count |
| `syncStatus` | `'synced' \| 'syncing' \| 'error'` | No | `'synced'` | File sync status |
| `className` | `string` | No | `''` | Additional CSS classes |

### State

| State | Type | Source | Description |
|-------|------|--------|-------------|
| `isExpanded` | `boolean` | Local | Terminal drawer visibility |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onToggle` | `void` | Expand/collapse terminal drawer |
| `onSyncClick` | `void` | Open sync details modal |
| `onProblemsClick` | `void` | Open problems panel |

### Accessibility

```yaml
ARIA:
  role: status
  aria-live: "polite" # For status updates
  aria-expanded: "{isExpanded}" # For drawer

Keyboard:
  - Enter/Space: Toggle drawer expand
  - Escape: Collapse drawer

Screen Reader:
  - Announce status changes
  - "Agent status: Ready"
  - "Sync status: Synced"
  - "3 problems detected"
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Hidden entirely, use toast notifications instead |
| `768px - 1023px` | Compact mode: hide labels, icons only |
| `>= 1024px` | Full layout with all information |

### Content Sections

```yaml
Left Section:
  - Agent status icon (Bot/Loader2/AlertTriangle)
  - Agent status text

Center Section:
  - Editor position: "Ln {line}, Col {column}"
  - Mobile: "Ln {line}" only

Right Section:
  - Problems count with AlertCircle icon
  - Sync status (Check/RefreshCw/AlertCircle + label)
  - Terminal toggle (ChevronUp/Down)
```

### 8-bit Styling Rules

```css
/* Container */
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px; /* h-8 collapsed */
  background: var(--color-card);
  border-top: 2px solid var(--color-structural);
  border-radius: 0;
}

/* Expanded with drawer */
.status-bar.expanded {
  height: 232px; /* 32px bar + 200px drawer */
}

/* Status indicators */
.status-synced { color: var(--color-success); }
.status-syncing { color: var(--color-primary); }
.status-error { color: var(--color-destructive); }

/* Typography */
.status-text {
  font-family: monospace;
  font-size: 12px;
}
```

### ShadcnUI Integration

| ShadcnUI Component | Usage |
|--------------------|-------|
| `Button` | Toggle expand button |
| `Badge` | Problems count indicator |
| `Tooltip` | Hover info for icons |
| `Collapsible` | Drawer expand/collapse animation |

---

## 5. Navigation System Patterns

### Route Transition Behavior

```yaml
Instant Navigation:
  threshold: 100ms
  behavior: No loading indicator for fast transitions
  implementation: TanStack Router loader

Loading States:
  - Skeleton loading for content areas
  - Preserve header/sidebar during load
  - Progressive reveal of content

Scroll Position:
  - Preserve on back navigation
  - Reset to top on new navigation
  - Restore per-route via sessionStorage
```

### Deep Linking

```yaml
URL Structure:
  /                         # Hub/Home
  /projects                 # Projects list
  /$projectId               # Project workspace (IDE layout)
  /$projectId?preset=notes  # Project with Notes preset
  /settings                 # Global settings
  /settings/api-keys        # Settings subsection
  /agents                   # Agent management (future)

State in URL:
  - Active preset: ?preset=ide|notes|split
  - Active plugins: ?plugins=filetree,monaco,chat
  - Open file: ?file=path/to/file.ts

Share Link:
  - Include project ID
  - Include active file path
  - Exclude transient UI state
```

### Error Handling

```yaml
404 Not Found:
  - Display custom 8-bit styled 404 page
  - Suggest similar routes
  - Link back to Hub

Permission Error:
  - PermissionOverlay for FSA issues
  - Clear action buttons (Grant, Skip)
  - Explain why permission needed

Network Error:
  - Offline indicator in status bar
  - Queue actions for retry
  - Graceful degradation
```

### Navigation Patterns by Platform

| Platform | Pattern |
|----------|---------|
| Desktop (FSA) | Full navigation, deep linking, file paths in URL |
| Desktop (IndexedDB) | Full navigation, project IDs only |
| Tablet | Simplified sidebar, swipe gestures (future) |
| Mobile | Bottom tab navigation, back button, minimal breadcrumbs |

### Prefetching Strategy

```typescript
// TanStack Router prefetch on hover
const routes = {
  '/projects': {
    preload: 'intent', // Prefetch on hover/focus
  },
  '/$projectId': {
    preload: 'viewport', // Prefetch when visible
    preloadDelay: 50,
  },
};
```

### Back/Forward Navigation

```yaml
Browser Buttons:
  - Always respect browser back/forward
  - Maintain scroll position
  - Preserve form state (if navigating away, warn user)

Custom Back Button (Mobile):
  - Show in header when depth > 1
  - Navigate to parent route
  - Use platform-native gesture (swipe) when available

History State:
  - Push new state on navigation
  - Replace state on filter/sort changes
  - Don't add history for modals/drawers
```

---

## Design Tokens Reference

### Spacing

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
}
```

### Component Dimensions

```css
:root {
  /* Sidebar */
  --sidebar-width-expanded: 240px;
  --sidebar-width-collapsed: 48px;
  --sidebar-width-mobile: 320px;
  
  /* Header */
  --header-height: 48px;
  
  /* Breadcrumbs */
  --breadcrumbs-height: 32px;
  
  /* Status Bar */
  --status-bar-height: 32px;
  --status-bar-drawer-height: 200px;
  
  /* Touch targets */
  --touch-target-min: 44px;
}
```

### Colors (8-bit Palette)

```css
:root {
  /* Background */
  --color-bg-primary: #09090b;    /* zinc-950 */
  --color-bg-secondary: #18181b;  /* zinc-900 */
  --color-bg-tertiary: #27272a;   /* zinc-800 */
  
  /* Foreground */
  --color-fg-primary: #fafafa;    /* zinc-50 */
  --color-fg-secondary: #a1a1aa;  /* zinc-400 */
  --color-fg-muted: #71717a;      /* zinc-500 */
  
  /* Accent (Orange for active states) */
  --color-accent: #f97316;        /* orange-500 */
  --color-accent-hover: #ea580c;  /* orange-600 */
  
  /* Borders */
  --color-border: #3f3f46;        /* zinc-700 */
  
  /* Status */
  --color-success: #22c55e;       /* green-500 */
  --color-warning: #eab308;       /* yellow-500 */
  --color-error: #ef4444;         /* red-500 */
}
```

### Shadows

```css
:root {
  --shadow-pixel: 4px 4px 0 0 rgba(0,0,0,1);
  --shadow-pixel-sm: 2px 2px 0 0 rgba(0,0,0,0.3);
  --shadow-pixel-lg: 6px 6px 0 0 rgba(0,0,0,1);
}
```

### Typography

```css
:root {
  /* Font Families */
  --font-pixel: 'VT323', monospace;
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
  
  /* Font Sizes */
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
}
```

---

## Integration Summary

### Component Hierarchy

```
<App>
  <GlobalSidebar />        <!-- z-50, fixed left -->
  <main>
    <GlobalHeader />       <!-- z-40, sticky top -->
    <Breadcrumbs />        <!-- Below header -->
    <PageContent />        <!-- Scrollable area -->
  </main>
  <StatusBar />            <!-- z-40, fixed bottom -->
</App>
```

### Store Dependencies

| Store | Components Using |
|-------|-----------------|
| `useLayoutStore` | GlobalSidebar, GlobalHeader |
| `useProjectStore` | Breadcrumbs |
| `usePluginLayoutStore` | GlobalHeader (plugin toggles) |
| `useTheme` | GlobalSidebar |
| `useLocalePreference` | GlobalSidebar |

### i18n Keys Required

```yaml
global.sidebar:
  home: "Hub"
  projects: "Projects"
  settings: "Settings"
  recentProjects: "Recent Projects"
  expand: "Expand sidebar"
  collapse: "Collapse sidebar"

global.header:
  title: "Via-gent"
  search: "Search"
  searchPlaceholder: "Search..."
  toggleMenu: "Toggle menu"
  userMenu: "User menu"

global.breadcrumb:
  home: "Hub"
  ariaLabel: "Breadcrumb navigation"

systemRail:
  agent:
    ready: "Agent Ready"
    working: "Working..."
    error: "Error"
  sync:
    synced: "Synced"
    syncing: "Syncing..."
    error: "Sync Error"
  editor:
    position: "Ln {line}, Col {column}"
  terminal:
    title: "Terminal"
    placeholder: "No terminal output"
```

---

## Implementation Checklist

### Phase 1: Core Components (Existing)

- [x] GlobalSidebar - Implemented in `MainSidebar.tsx`
- [x] GlobalHeader - Implemented in `GlobalHeader.tsx`
- [x] Breadcrumbs - Implemented in `Breadcrumbs.tsx`
- [x] StatusBar - Implemented in `SystemRail.tsx`
- [x] MobileBottomNav - Implemented in `MobileBottomNav.tsx`

### Phase 2: Enhancements Required

- [ ] Add keyboard shortcut for sidebar toggle (Cmd+B) - DONE
- [ ] Add focus trap for mobile sidebar drawer
- [ ] Implement breadcrumb overflow dropdown
- [ ] Connect StatusBar to real editor state
- [ ] Add sync status click handler
- [ ] Implement route prefetching

### Phase 3: Polish

- [ ] Add animations for sidebar collapse
- [ ] Add transitions for theme/locale changes
- [ ] Implement skip links for accessibility
- [ ] Add reduced motion support
- [ ] Performance optimize re-renders

---

## Appendix A: Existing Implementation Analysis

### Current vs Specification Gaps

| Component | Implementation | Gap |
|-----------|---------------|-----|
| `MainSidebar.tsx` | 404 lines | Focus trap missing, animation timing not specified |
| `GlobalHeader.tsx` | 332 lines | User menu placeholder, search triggers command palette |
| `Breadcrumbs.tsx` | 238 lines | Overflow dropdown missing |
| `SystemRail.tsx` | 266 lines | Terminal integration placeholder |
| `MobileBottomNav.tsx` | 219 lines | No gesture support yet |

### Files Referenced

```
src/presentation/components/layout/
├── MainSidebar.tsx         # GlobalSidebar implementation
├── GlobalHeader.tsx        # GlobalHeader implementation
├── Breadcrumbs.tsx         # Breadcrumbs implementation
├── SystemRail.tsx          # StatusBar implementation
├── MobileBottomNav.tsx     # Mobile navigation
├── PresetSelector.tsx      # Layout preset dropdown
├── PluginToggles.tsx       # Plugin toggle buttons
└── PermissionOverlay.tsx   # FSA permission handling
```

---

**End of Specification**

**Document Version**: 1.0.0
**Lines**: ~800
**Created**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
**Next Action**: Route to dev-ext for implementation of missing features
