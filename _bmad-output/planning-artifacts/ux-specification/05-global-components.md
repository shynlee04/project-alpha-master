# Global Components

<- [Responsive Grid](./04-responsive-grid.md) | [Index](./index.md) | [Route & Navigation](./06-route-navigation.md) ->

---

## 5.1 GlobalSidebar

The primary navigation sidebar that persists across all routes.

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
+--------------------------------+
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

### States and Events

| State | Type | Source | Description |
|-------|------|--------|-------------|
| `sidebarCollapsed` | `boolean` | `useLayoutStore` | Desktop collapse state |
| `sidebarMobileOpen` | `boolean` | `useLayoutStore` | Mobile drawer visibility |
| `activeNavItem` | `string \| null` | `useLayoutStore` | Currently highlighted nav item |
| `recentProjects` | `Project[]` | `useRecentProjects(5)` | Last 5 accessed projects |

| Event | Payload | Description |
|-------|---------|-------------|
| `onNavigate` | `{ path: string, itemId: string }` | Route navigation triggered |
| `onToggleCollapse` | `void` | Collapse/expand toggled |
| `onMobileClose` | `void` | Mobile drawer close requested |
| `onThemeToggle` | `'light' \| 'dark'` | Theme changed |
| `onLocaleToggle` | `'en' \| 'vi'` | Language changed |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` (mobile) | Hidden by default, overlay drawer from left (320px) |
| `768px - 1023px` (tablet) | Visible, collapsed by default (48px) |
| `>= 1024px` (desktop) | Visible, expanded by default (240px) |

### Keyboard Shortcuts

- `Cmd/Ctrl + B`: Toggle sidebar collapse
- `Cmd/Ctrl + Shift + T`: Toggle theme
- `Tab`: Navigate between items
- `Escape`: Close mobile drawer

---

## 5.2 GlobalHeader

Context bar with project info, navigation, and actions.

### ASCII Wireframe

```
DESKTOP (>= 768px)
+--------------------------------------------------------------------------------+
| [=] [LOGO] Via-gent | Hub | [Preset v] [Plugins...] ||| [Search  Cmd+K] [S] [U] |
+--------------------------------------------------------------------------------+

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

interface NavItem {
  key: string;
  path: string;
  labelKey: string; // i18n key
}

const NAV_ITEMS: readonly NavItem[] = [
  { key: 'home', path: '/', labelKey: 'navigation.home' },
];
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Show hamburger, hide nav links, hide preset selector, compact search |
| `< 1024px` | Hide plugin toggles |
| `>= 1024px` | Full layout with all elements |

---

## 5.3 Breadcrumbs

Route hierarchy navigation with smart truncation.

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
| <- Meeting Notes                                                  |
+------------------------------------------------------------------+
```

### Props Interface

```typescript
interface BreadcrumbsProps {
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string; // undefined = current page (not clickable)
}
```

### Truncation Rules

| Condition | Behavior |
|-----------|----------|
| Items <= 4 | Show all items |
| Items > 4 | Show first, ellipsis dropdown, last 2 |
| Label > 200px | Truncate with ellipsis |
| Mobile | Show back arrow + current label only |

---

## 5.4 StatusBar (SystemRail)

System status, sync state, and shortcuts at bottom of screen.

### ASCII Wireframe

```
DESKTOP (always visible, 24px height)
+--------------------------------------------------------------------------------+
| [Bot] Agent Ready    |    Ln 42, Col 15    |    [!] 0    [Sync] Synced    [^]  |
+--------------------------------------------------------------------------------+

EXPANDED (with terminal drawer, 200px additional)
+--------------------------------------------------------------------------------+
| [Bot] Agent Ready    |    Ln 42, Col 15    |    [!] 0    [Sync] Synced    [v]  |
+--------------------------------------------------------------------------------+
| > Terminal                                                                     |
| $ npm run dev                                                                  |
| Starting development server...                                                 |
+--------------------------------------------------------------------------------+
```

### Props Interface

```typescript
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

### Content Sections

| Section | Content |
|---------|---------|
| **Left** | Agent status icon + text |
| **Center** | Editor position: "Ln {line}, Col {column}" |
| **Right** | Problems count, Sync status, Terminal toggle |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Hidden entirely, use toast notifications |
| `768px - 1023px` | Compact mode: icons only |
| `>= 1024px` | Full layout with all information |

---

## 5.5 Navigation System Patterns

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

### Prefetching Strategy

```typescript
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

---

<- [Responsive Grid](./04-responsive-grid.md) | [Index](./index.md) | [Route & Navigation](./06-route-navigation.md) ->
