# Plugin Interface Patterns

<- [Activity Bar & Docker](./08-activity-bar-docker.md) | [Index](./index.md) | [i18n & Typography](./10-i18n-typography.md) ->

---

## 9.1 Plugin Panel Structure

Every plugin panel follows a consistent structure for predictable UX.

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

### CSS Implementation

```css
.plugin-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-background);
  border: 2px solid var(--color-structural);
}

.plugin-panel__header {
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 2px solid var(--color-structural);
  background: var(--color-card);
}

.plugin-panel__tabs {
  height: 32px;
  flex-shrink: 0;
  display: flex;
  gap: 2px;
  padding: 0 8px;
  border-bottom: 2px solid var(--color-structural);
  background: var(--color-card);
}

.plugin-panel__content {
  flex: 1;
  overflow: auto;
}

.plugin-panel__footer {
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top: 2px solid var(--color-structural);
  background: var(--color-card);
  font-size: 12px;
  font-family: var(--font-mono);
}
```

---

## 9.2 Plugin Header

The header provides plugin identity and primary actions.

```
+-----------------------------------------------------------+
| [Icon] Title                  [Action1][Action2][...][X]  |
+-----------------------------------------------------------+
```

### Header Props

```typescript
interface PluginHeaderProps {
  icon: React.ReactNode;
  title: string;
  actions?: HeaderAction[];
  onClose?: () => void;        // Only for optional plugins
  onMinimize?: () => void;
  className?: string;
}

interface HeaderAction {
  icon: React.ReactNode;
  label: string;               // For tooltip
  onClick: () => void;
  disabled?: boolean;
}
```

### Header Rules

| Rule | Value |
|------|-------|
| Title max width | Truncate at 150px with tooltip |
| Max visible actions | 3 (overflow to menu) |
| Action button size | 28x28px (32px touch target via padding) |
| Close button | Hidden for always-loaded plugins |

---

## 9.3 Tabbed Sub-navigation

For complex plugins with multiple views (e.g., Chat with Threads, Settings, History).

```
+----+----+----+----+----+
| IC | IC | IC | IC |... |
+----+----+----+----+----+
  ^         ^
Active   Inactive
(border) (no border)
```

### Tab Styling (8-bit)

```css
.plugin-tab {
  min-width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
}

.plugin-tab:hover {
  background: var(--color-canvas);
}

/* Active tab indicator - solid bottom border (8-bit) */
.plugin-tab.active::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: 0;
  height: 2px;
  background: var(--color-primary);
}

/* Icon-only tabs with tooltip */
.plugin-tab__icon {
  width: 24px;
  height: 24px;
}
```

### Tab Constraints

| Constraint | Value |
|------------|-------|
| Max visible tabs | 5 |
| Overflow behavior | Horizontal scroll or dropdown |
| Tab icon size | 24x24px |
| Tab touch target | 44x32px |

---

## 9.4 Plugin Content Area

The main scrollable content region of the plugin.

### States

| State | Display | Component |
|-------|---------|-----------|
| **Loading** | Skeleton loader | `<PluginSkeleton />` |
| **Empty** | 8-bit illustrated empty state | `<EmptyState />` |
| **Error** | Error message + retry action | `<ErrorState />` |
| **Content** | Plugin-specific content | Plugin component |

### Loading State (Skeleton)

```typescript
// Use skeleton, NOT spinner (8-bit compliance)
<div className="plugin-skeleton">
  <div className="skeleton-line h-4 w-3/4 mb-2" />
  <div className="skeleton-line h-4 w-1/2 mb-2" />
  <div className="skeleton-line h-4 w-5/6" />
</div>
```

```css
.skeleton-line {
  background: linear-gradient(
    90deg,
    var(--color-canvas) 0%,
    var(--color-card) 50%,
    var(--color-canvas) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 0; /* 8-bit: no rounding */
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty State

```
+-------------------------------------+
|                                     |
|           [8-bit Icon]              |
|                                     |
|      No files in this project       |
|                                     |
|    [Create File] or [Import]        |
|                                     |
+-------------------------------------+
```

### Error State

```
+-------------------------------------+
|                                     |
|        [!] Error Icon               |
|                                     |
|     Failed to load files            |
|     Permission denied               |
|                                     |
|         [Retry] [Cancel]            |
|                                     |
+-------------------------------------+
```

---

## 9.5 Plugin Footer

Status information and secondary actions.

```
+-----------------------------------------------------------+
| 42 items * Last synced 2m ago          [Refresh][Export]  |
+-----------------------------------------------------------+
```

### Footer Props

```typescript
interface PluginFooterProps {
  status?: string;             // Left-aligned status text
  actions?: FooterAction[];    // Right-aligned action buttons
  showResizeHandle?: boolean;  // For resizable panels
}
```

---

## 9.6 Complex Plugin Example: agent-chat-cascade

```
+-----------------------------------------------------------+
| [Chat] AI Chat                          [Clear][...]      |  Header
+-----------------------------------------------------------+
| [Chat] [Threads] [Agents] [Settings]                      |  Tabs
+-----------------------------------------------------------+
|                                                           |
|  +-----------------------------------------------------+  |
|  | [U] Help me refactor the auth module                |  |
|  +-----------------------------------------------------+  |
|                                                           |
|  +-----------------------------------------------------+  |
|  | [A] I'll analyze the current auth implementation.   |  |
|  |                                                     |  |
|  | ```typescript                                       |  |
|  | // Current auth.ts                                  |  |
|  | export function login(...)                          |  |
|  | ```                                                 |  |
|  |                                                     |  |
|  | [Tool: grep] Found 3 files                          |  |  Content
|  | [Expand to see results]                             |  |
|  |                                                     |  |
|  | I recommend:                                        |  |
|  | 1. Extract validation logic                         |  |
|  | 2. Add token refresh handling                       |  |
|  | 3. Implement session management                     |  |
|  +-----------------------------------------------------+  |
|                                                           |
+-----------------------------------------------------------+
| +-------------------------------------+ [@][+] [Send]     |  Input
| | Type a message...                   |                   |
| +-------------------------------------+                   |
+-----------------------------------------------------------+
| Thread: main * 1,234 tokens (1% used)                     |  Footer
+-----------------------------------------------------------+
```

### Tab Views

| Tab | Content | Key Features |
|-----|---------|--------------|
| **Chat** | Active conversation | Message list, input area |
| **Threads** | Thread list with search | Create, rename, delete threads |
| **Agents** | Agent selection | Model picker, tool permissions |
| **Settings** | Plugin settings | Context limit, compaction settings |

---

<- [Activity Bar & Docker](./08-activity-bar-docker.md) | [Index](./index.md) | [i18n & Typography](./10-i18n-typography.md) ->
