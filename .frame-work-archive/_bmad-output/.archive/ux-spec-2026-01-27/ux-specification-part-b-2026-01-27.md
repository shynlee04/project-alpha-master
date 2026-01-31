# UX Specification - Part B: Plugin Architecture UX

**Document ID**: UX-SPEC-03B
**Version**: 3.0.0
**Date**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
**Status**: APPROVED
**Priority**: P0 - CRITICAL

---

## Document Purpose

This document defines the UX architecture for the plugin-centric system. It covers:
- Section 7: Plugin Architecture UX
- Section 8: Activity Bar & Plugin Docker
- Section 9: Plugin Interface Patterns
- Section 10: i18n & Typography

**Prerequisites**: Sections 1-6 defined in Part A (`ux-specification-part-a-2026-01-27.md`)

---

## Section 7: Plugin Architecture UX

### 7.1 Plugin System Overview

Via-Gent uses a **plugin-centric architecture** where all functionality is delivered through composable feature plugins. This replaces the deprecated workspace model with a flexible, platform-aware system.

#### Design Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                   PROJECT-CENTRIC MODEL                     │
├─────────────────────────────────────────────────────────────┤
│  Route: /$projectId                                         │
│      ↓                                                      │
│  Platform Detection (device + storage type)                 │
│      ↓                                                      │
│  Plugin Selection (platform-aware defaults)                 │
│      ↓                                                      │
│  Layout Composition (responsive grid slots)                 │
└─────────────────────────────────────────────────────────────┘
```

#### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Plugin Independence** | Each plugin is self-contained with its own state | Isolated Zustand stores per plugin |
| **Platform Awareness** | Plugins adapt to device capabilities | `PlatformContract` determines availability |
| **Lazy Loading** | Plugins load only when activated | Dynamic imports via `React.lazy()` |
| **State Isolation** | Plugin state scoped to plugin, project-persisted | `projectId` as state key prefix |
| **Cross-Communication** | Plugins communicate via EventBus | `file-event-bus.ts` for file events |

### 7.2 Plugin Types & Registry

#### Plugin Registry

| Plugin ID | Name | Description | Always Loaded | Default Position |
|-----------|------|-------------|---------------|------------------|
| `file-tree-project-management` | Project Files | File explorer, project switcher, CRUD | **Yes** | Left panel |
| `notes` | Notes Editor | Markdown/BlockNote document editing | **Yes** | Main content |
| `agent-chat-cascade` | AI Chat | Thread management, agent orchestration | **Yes** | Right panel |
| `monaco-editor` | Code Editor | Full Monaco IDE experience | No | Main content |
| `preview` | Live Preview | WebContainer preview (POST-MVP) | No | Main content |
| `terminal` | Terminal | Command line interface (POST-MVP) | No | Bottom panel |

#### TypeScript Plugin Interface

```typescript
// src/plugins/core/FeaturePlugin.interface.ts

interface FeaturePlugin {
  // === Identification ===
  id: PluginId;
  name: string;
  icon: React.ReactNode;
  description: string;

  // === Rendering ===
  component: React.LazyExoticComponent<React.FC<PluginProps>>;
  panelComponent?: React.FC<PanelPluginProps>;
  
  // === Platform Requirements ===
  requiresFSA: boolean;
  requiresProject: boolean;
  minWidth: number;           // Minimum panel width in pixels
  maxInstances: 1 | 2 | 'unlimited';
  
  // === Layout Constraints ===
  allowedPositions: ('left' | 'main' | 'right' | 'bottom')[];
  defaultPosition: 'left' | 'main' | 'right' | 'bottom';
  
  // === State Management ===
  createStore: () => PluginStore;
  
  // === Lifecycle Hooks ===
  onLoad?: (context: PluginContext) => Promise<void>;
  onUnload?: (context: PluginContext) => Promise<void>;
  onActivate?: (context: PluginContext) => void;
  onDeactivate?: (context: PluginContext) => void;
}

type PluginId = 
  | 'file-tree-project-management'
  | 'notes'
  | 'agent-chat-cascade'
  | 'monaco-editor'
  | 'preview'
  | 'terminal';

interface PluginContext {
  projectId: string;
  platform: PlatformContract;
  eventBus: EventBus;
  storageGateway: StorageGateway;
}
```

### 7.3 Always-Loaded Plugins (The Two Essential)

#### Plugin 1: file-tree-project-management

**Always in left panel. Cannot be removed.**

```
┌─────────────────────────────┐
│ [Search...]           [+]   │  36px header
├─────────────────────────────┤
│ PROJECT FILES               │  Section header
│ ├── src/                    │
│ │   ├── components/         │
│ │   └── pages/              │
│ ├── public/                 │
│ └── package.json            │
├─────────────────────────────┤
│ DATABASES (0)               │  Collapsible section
├─────────────────────────────┤
│ RAG INDICES (1)             │  Collapsible section
│   └── project-index         │
└─────────────────────────────┘
```

**Responsibilities:**
- File tree navigation with expand/collapse
- File/folder CRUD operations
- Project switching
- Search within project files
- Database management (future)
- RAG index management

#### Plugin 2: agent-chat-cascade

**Always in right panel. Cannot be removed.**

```
┌─────────────────────────────────────┐
│ [Chat] [Threads] [Agents] [Settings]│  32px tabs
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ User: Help me understand... │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Agent: I'll analyze...      │    │
│  │ [Code block]                │    │
│  │ [Tool output: grep]         │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│ [Type a message...]        [Send]   │  Input area
└─────────────────────────────────────┘
```

**Responsibilities:**
- Agent orchestration and delegation
- Thread management (project-scoped)
- Context window management (150K limit)
- Multi-format block rendering
- Streaming conversation display

### 7.4 Plugin State Management

#### State Isolation Pattern

```typescript
// Each plugin has isolated state scoped to projectId
interface PluginState<T> {
  projectId: string;
  pluginId: PluginId;
  enabled: boolean;
  config: T;
  sessionState: Record<string, unknown>;
}

// Factory for creating plugin stores
function createPluginStore<T>(
  pluginId: PluginId,
  initialConfig: T
): () => PluginState<T> {
  return create<PluginState<T>>()(
    persist(
      (set) => ({
        projectId: '',
        pluginId,
        enabled: true,
        config: initialConfig,
        sessionState: {},
        
        setProjectId: (projectId: string) => set({ projectId }),
        setConfig: (config: T) => set({ config }),
        setEnabled: (enabled: boolean) => set({ enabled }),
      }),
      {
        name: `plugin-${pluginId}`,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          config: state.config,
          enabled: state.enabled,
        }),
      }
    )
  );
}
```

### 7.5 Plugin Communication Patterns

#### EventBus Integration

```typescript
// Plugin-to-plugin communication via EventBus

// File events (from FileTree)
type FileEvent =
  | { type: 'FILE_SELECTED'; path: string; pluginId: PluginId }
  | { type: 'FILE_CREATED'; path: string }
  | { type: 'FILE_UPDATED'; path: string; content: string }
  | { type: 'FILE_DELETED'; path: string }
  | { type: 'FILE_RENAMED'; from: string; to: string };

// Plugin lifecycle events
type PluginEvent =
  | { type: 'PLUGIN_ACTIVATED'; pluginId: PluginId }
  | { type: 'PLUGIN_DEACTIVATED'; pluginId: PluginId }
  | { type: 'PLUGIN_STATE_CHANGED'; pluginId: PluginId; state: unknown };

// Usage in plugin
const handleFileSelected = useCallback((event: FileEvent) => {
  if (event.type === 'FILE_SELECTED') {
    openFileInEditor(event.path);
  }
}, []);

useEffect(() => {
  return eventBus.subscribe('FILE_SELECTED', handleFileSelected);
}, [handleFileSelected]);
```

### 7.6 Plugin Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    PLUGIN LIFECYCLE                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  REGISTERED                                              │
│      ↓                                                   │
│  onLoad() ─────→ Load dependencies, initialize store     │
│      ↓                                                   │
│  LOADED                                                  │
│      ↓                                                   │
│  onActivate() ─→ Mount component, hydrate state          │
│      ↓                                                   │
│  ACTIVE ←──────→ User interaction, state updates         │
│      ↓                                                   │
│  onDeactivate() → Preserve state, unmount component      │
│      ↓                                                   │
│  INACTIVE (state preserved)                              │
│      ↓                                                   │
│  onUnload() ───→ Cleanup, release resources              │
│      ↓                                                   │
│  UNLOADED                                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Section 8: Activity Bar & Plugin Docker

### 8.1 Activity Bar Specification

The Activity Bar provides quick access to plugins within a panel. Each panel (left, main, right) has its own activity bar.

#### Dimensions

| Property | Value | CSS Variable |
|----------|-------|--------------|
| Width (vertical) | 48px | `--activity-bar-width` |
| Height (horizontal) | 48px | `--activity-bar-width` |
| Icon size | 24x24px | - |
| Touch target | 44x44px minimum | `--touch-target-min` |
| Max icons before scroll | 6 | - |

#### Activity Bar Anatomy

```
VERTICAL (Left/Right)           HORIZONTAL (Top of Main)
+--------+                      +----+----+----+----+----+----+
|  [IC]  |  ← Active (border)   |[IC]|[IC]|[IC]|[IC]|[IC]|[IC]|
+--------+                      +----+----+----+----+----+----+
|  [IC]  |  ← Inactive               ↑
+--------+                      Active indicator (bottom border)
|  [IC]  |
+--------+
|        |  ← Spacer (flex-1)
|  ...   |
|        |
+--------+
|  [+]   |  ← Add plugin (optional)
+--------+
```

#### Active Indicator Styling (8-bit Compliance)

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

#### Tooltip Behavior

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

### 8.2 Plugin Docker System

The Plugin Docker allows drag-and-drop management of plugins across activity bars and panel positions.

#### Docker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PLUGIN DOCKER FLOW                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Plugin Registry]                                       │
│        ↓                                                 │
│  [Activity Bar] ←──→ Drag to reorder                    │
│        ↓                                                 │
│  [Panel Position] ←→ Drop to dock                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Docker Constraints

| Constraint | Value | Enforcement |
|------------|-------|-------------|
| Max plugins per device (desktop) | 4 | Hard limit |
| Max plugins per device (tablet) | 2 | Hard limit |
| Max plugins per device (mobile) | 1 | Hard limit |
| Always-loaded plugins | 2 | Cannot be removed |
| Panel position lock | Yes for always-loaded | Cannot be moved |

#### Drag-Drop Interaction

```
1. Initiate Drag
   ├── Long-press (touch): 150ms delay
   └── Mouse: immediate on mousedown

2. Visual Feedback
   ├── Source: Ghost follows cursor, slot shows empty state
   ├── Target: Blue border highlight (valid), Red (invalid)
   └── Trash: Appears at bottom center during drag

3. Drop Zones
   ├── Activity Bar Slot: Reorder within same bar
   ├── Other Activity Bar: Move between bars
   ├── Panel Area: Dock to panel position
   └── Trash Zone: Remove plugin (optional only)

4. Completion
   ├── Success: Plugin moves, state persists to localStorage
   └── Cancel: Return to original position
```

#### Docker State (Zustand)

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

### 8.3 Activity Bar Variants

| Position | Panel | Orientation | Plugins | Behavior |
|----------|-------|-------------|---------|----------|
| **LEFT** | Left plugin panel | Vertical | FileTree (locked) | Controls left panel content |
| **TOP** | Main content | Horizontal | Notes, Monaco, Preview | Controls main content |
| **RIGHT** | Right plugin panel | Vertical | Chat (locked) | Controls right panel content |

#### Visual Comparison

```
LEFT ACTIVITY BAR               TOP ACTIVITY BAR (in main)
+--------+                      ┌──────────────────────────────────┐
|[Folder]| ← Locked (FileTree)  │ [Note][Code][Eye]                │
+--------+                      └──────────────────────────────────┘
|  [+]   | ← Add (if allowed)         ↑     ↑    ↑
+--------+                      Notes Monaco Preview

RIGHT ACTIVITY BAR
+--------+
|[Chat]  | ← Locked (agent-chat)
+--------+
|  [+]   | ← Add (if allowed)
+--------+
```

### 8.4 Plugin Switching Interactions

| Action | Behavior | Keyboard |
|--------|----------|----------|
| **Click** | Activate plugin, show in panel | - |
| **Double-click** | Expand/maximize plugin panel | - |
| **Keyboard** | Quick switch to plugin | `Cmd/Ctrl + 1-6` |
| **Touch tap** | Same as click | - |
| **Touch hold** | Open context menu | - |

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + 1` | Switch to first plugin in top bar |
| `Cmd/Ctrl + 2` | Switch to second plugin in top bar |
| `Cmd/Ctrl + 3` | Switch to third plugin in top bar |
| `Cmd/Ctrl + B` | Toggle left panel visibility |
| `Cmd/Ctrl + J` | Toggle right panel visibility |
| `Cmd/Ctrl + `` ` | Toggle terminal (POST-MVP) |

---

## Section 9: Plugin Interface Patterns

### 9.1 Plugin Panel Structure

Every plugin panel follows a consistent structure for predictable UX.

```
┌─────────────────────────────────────┐
│ Plugin Header (title, actions)      │  36px
├─────────────────────────────────────┤
│ Tabbed Sub-navigation (optional)    │  32px
├─────────────────────────────────────┤
│                                     │
│ Plugin Content Area                 │  flex-1
│ (scrollable)                        │
│                                     │
├─────────────────────────────────────┤
│ Plugin Footer (status, actions)     │  28px
└─────────────────────────────────────┘
```

#### CSS Implementation

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

### 9.2 Plugin Header

The header provides plugin identity and primary actions.

```
┌─────────────────────────────────────────────────────────┐
│ [Icon] Title                  [Action1][Action2][...][X]│
└─────────────────────────────────────────────────────────┘
```

#### Header Props

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

#### Header Rules

| Rule | Value |
|------|-------|
| Title max width | Truncate at 150px with tooltip |
| Max visible actions | 3 (overflow to menu) |
| Action button size | 28x28px (32px touch target via padding) |
| Close button | Hidden for always-loaded plugins |

### 9.3 Tabbed Sub-navigation

For complex plugins with multiple views (e.g., Chat with Threads, Settings, History).

```
┌────┬────┬────┬────┬────┐
│ IC │ IC │ IC │ IC │... │
└────┴────┴────┴────┴────┘
  ↑         ↑
Active   Inactive
(border) (no border)
```

#### Tab Styling (8-bit)

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

#### Tab Constraints

| Constraint | Value |
|------------|-------|
| Max visible tabs | 5 |
| Overflow behavior | Horizontal scroll or dropdown |
| Tab icon size | 24x24px |
| Tab touch target | 44x32px |

### 9.4 Plugin Content Area

The main scrollable content region of the plugin.

#### States

| State | Display | Component |
|-------|---------|-----------|
| **Loading** | Skeleton loader | `<PluginSkeleton />` |
| **Empty** | 8-bit illustrated empty state | `<EmptyState />` |
| **Error** | Error message + retry action | `<ErrorState />` |
| **Content** | Plugin-specific content | Plugin component |

#### Loading State (Skeleton)

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

#### Empty State

```
┌─────────────────────────────────────┐
│                                     │
│           [8-bit Icon]              │
│                                     │
│      No files in this project       │
│                                     │
│    [Create File] or [Import]        │
│                                     │
└─────────────────────────────────────┘
```

#### Error State

```
┌─────────────────────────────────────┐
│                                     │
│        [!] Error Icon               │
│                                     │
│     Failed to load files            │
│     Permission denied               │
│                                     │
│         [Retry] [Cancel]            │
│                                     │
└─────────────────────────────────────┘
```

### 9.5 Plugin Footer

Status information and secondary actions.

```
┌─────────────────────────────────────────────────────────┐
│ 42 items • Last synced 2m ago          [Refresh][Export]│
└─────────────────────────────────────────────────────────┘
```

#### Footer Props

```typescript
interface PluginFooterProps {
  status?: string;             // Left-aligned status text
  actions?: FooterAction[];    // Right-aligned action buttons
  showResizeHandle?: boolean;  // For resizable panels
}
```

### 9.6 Complex Plugin Example: agent-chat-cascade

```
┌─────────────────────────────────────────────────────────┐
│ [Chat] AI Chat                          [Clear][...]    │  Header
├─────────────────────────────────────────────────────────┤
│ [Chat] [Threads] [Agents] [Settings]                    │  Tabs
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [U] Help me refactor the auth module              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [A] I'll analyze the current auth implementation. │  │
│  │                                                   │  │
│  │ ```typescript                                     │  │
│  │ // Current auth.ts                                │  │
│  │ export function login(...)                        │  │
│  │ ```                                               │  │
│  │                                                   │  │
│  │ [Tool: grep] Found 3 files                       │  │  Content
│  │ [Expand to see results]                           │  │
│  │                                                   │  │
│  │ I recommend:                                      │  │
│  │ 1. Extract validation logic                       │  │
│  │ 2. Add token refresh handling                     │  │
│  │ 3. Implement session management                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ [@][+] [Send]   │  Input
│ │ Type a message...                   │                 │
│ └─────────────────────────────────────┘                 │
├─────────────────────────────────────────────────────────┤
│ Thread: main • 1,234 tokens (1% used)                   │  Footer
└─────────────────────────────────────────────────────────┘
```

#### Tab Views

| Tab | Content | Key Features |
|-----|---------|--------------|
| **Chat** | Active conversation | Message list, input area |
| **Threads** | Thread list with search | Create, rename, delete threads |
| **Agents** | Agent selection | Model picker, tool permissions |
| **Settings** | Plugin settings | Context limit, compaction settings |

---

## Section 10: i18n & Typography

### 10.1 Supported Languages

| Language | Code | Status | Notes |
|----------|------|--------|-------|
| **English** | `en` | Primary | Default language |
| **Vietnamese** | `vi` | Secondary | Full support with diacritics |
| RTL Languages | - | **Deferred** | Not in MVP scope |

### 10.2 Font Stack

| Purpose | Font Family | Fallback | CSS Variable |
|---------|-------------|----------|--------------|
| **Display/Pixel** | VT323 | monospace | `--font-pixel` |
| **Code/Mono** | JetBrains Mono | Consolas, monospace | `--font-mono` |
| **Body/Sans** | Inter | system-ui, sans-serif | `--font-sans` |

#### CSS Font Stack Declarations

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco',
               'Inconsolata', 'Consolas', monospace;
  
  --font-pixel: 'VT323', 'Press Start 2P', 'Courier New', monospace;
}
```

#### Vietnamese Character Support Test String

```
Tiếng Việt: Àáảãạ Èéẻẽẹ Ìíỉĩị Òóỏõọ Ùúủũụ Ỳýỷỹỵ
Đặc biệt: Đ đ Ă ă Â â Ê ê Ô ô Ơ ơ Ư ư
Full: Việt Nam, Sài Gòn, Đà Nẵng, Huế, Hà Nội
```

### 10.3 Vietnamese Typography Considerations

Vietnamese text requires special handling for diacritics and text expansion.

#### Line Height Adjustments

| Element | English | Vietnamese | Adjustment |
|---------|---------|------------|------------|
| **Headings (H1-H3)** | 1.25 | 1.35 | +0.10 |
| **Body text** | 1.5 | 1.6 | +0.10 |
| **Buttons** | 1.25 | 1.35 | +0.10 |
| **Labels** | 1.4 | 1.5 | +0.10 |
| **Code** | 1.5 | 1.5 | No change |

#### Letter Spacing

```css
/* English: default */
[lang="en"] .text-body {
  letter-spacing: 0;
}

/* Vietnamese: slightly tighter */
[lang="vi"] .text-body {
  letter-spacing: -0.01em;
}
```

#### CSS Implementation

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

### 10.4 Text Expansion Matrix

Vietnamese translations can be shorter OR longer than English. Design for flexibility.

| Component | EN Max Chars | VI Expansion | Resulting Max | Strategy |
|-----------|--------------|--------------|---------------|----------|
| **Button (primary)** | 20 | +30% | 26 chars | Wrap or truncate |
| **Button (icon+text)** | 12 | +25% | 15 chars | Truncate |
| **Menu item** | 25 | +35% | 34 chars | Truncate + tooltip |
| **Tab label** | 15 | +25% | 19 chars | Icon only if overflow |
| **Sidebar item** | 20 | +30% | 26 chars | Ellipsis at end |
| **Breadcrumb segment** | 20 | +25% | 25 chars | Middle truncation |
| **Toast message** | 50 | +40% | 70 chars | Multi-line allowed |
| **Tooltip** | 100 | +30% | 130 chars | Wrap at 200px |
| **Modal title** | 40 | +30% | 52 chars | Wrap allowed |
| **Form label** | 30 | +35% | 41 chars | Wrap preferred |
| **Error message** | 60 | +40% | 84 chars | Multi-line |
| **Badge/Tag** | 12 | +20% | 15 chars | No truncation |
| **Status text** | 15 | +25% | 19 chars | Truncate |

#### Real-World Translation Examples

| English | Vietnamese | Change |
|---------|------------|--------|
| Settings | Cài đặt | -12% (shorter) |
| Create new project | Tạo dự án mới | -28% (shorter) |
| File management | Quản lý tệp tin | 0% (same) |
| Permission denied | Quyền truy cập bị từ chối | +53% (longer) |

### 10.5 Truncation Strategies

| Component | Strategy | Indicator | Tooltip |
|-----------|----------|-----------|---------|
| **Sidebar items** | End truncation | `...` | Full text |
| **Breadcrumbs** | Middle truncation | `pro...ject` | Full path |
| **File names** | Extension preserved | `longfile...txt` | Full name |
| **Tags/Badges** | No truncation | - | None |
| **Tab labels** | End truncation | `...` | Full text |
| **Toasts** | Multi-line (max 2) | - | Expand on click |

#### Truncation CSS

```css
/* Single-line truncation */
.truncate-i18n {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line truncation (2 lines) */
.truncate-i18n-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* File name truncation (preserve extension) */
.truncate-filename {
  display: flex;
  min-width: 0;
}

.truncate-filename__base {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.truncate-filename__ext {
  flex-shrink: 0;
}
```

### 10.6 i18n Implementation

#### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | react-i18next | Translation management |
| **Namespace** | Per feature/plugin | Lazy loading |
| **Fallback** | English | Missing translation fallback |
| **Storage** | localStorage | Locale preference persistence |

#### Namespace Structure

```
src/i18n/
├── en/
│   ├── common.json           # Shared strings
│   ├── navigation.json       # Nav, sidebar, breadcrumbs
│   ├── plugins/
│   │   ├── filetree.json
│   │   ├── notes.json
│   │   ├── chat.json
│   │   └── monaco.json
│   └── settings.json
└── vi/
    ├── common.json
    ├── navigation.json
    ├── plugins/
    │   ├── filetree.json
    │   ├── notes.json
    │   ├── chat.json
    │   └── monaco.json
    └── settings.json
```

#### Usage Pattern

```typescript
// Component usage
import { useTranslation } from 'react-i18next';

function PluginHeader() {
  const { t } = useTranslation('plugins/filetree');
  
  return (
    <header className="plugin-panel__header">
      <h2>{t('title')}</h2>
      <button aria-label={t('actions.refresh')}>
        <RefreshIcon />
      </button>
    </header>
  );
}
```

#### Lazy Loading

```typescript
// i18n config
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi'],
    ns: ['common', 'navigation'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });
```

### 10.7 Typography Scale

#### Responsive Font Sizes

| Element | Mobile | Tablet | Desktop | Large Desktop |
|---------|--------|--------|---------|---------------|
| **H1** | 26px | 30px | 36px | 36px |
| **H2** | 22px | 24px | 30px | 32px |
| **H3** | 19px | 20px | 24px | 26px |
| **Body** | 15px | 16px | 16px | 17px |
| **Small** | 13px | 14px | 14px | 14px |
| **Button** | 14px | 14px | 16px | 16px |
| **Code** | 13px | 13px | 14px | 15px |

#### CSS Custom Properties

```css
:root {
  /* Base scale (desktop 16px base) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
}

/* Mobile adjustments */
@media (max-width: 639px) {
  :root {
    --text-base: 0.9375rem;  /* 15px */
    --text-lg: 1.0625rem;    /* 17px */
    --text-2xl: 1.375rem;    /* 22px */
    --text-3xl: 1.625rem;    /* 26px */
  }
}

/* Large desktop adjustments */
@media (min-width: 1280px) {
  :root {
    --text-base: 1.0625rem;  /* 17px */
    --text-lg: 1.1875rem;    /* 19px */
  }
}
```

### 10.8 Language-Aware Typography Hook

```typescript
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface TypographyConfig {
  lineHeight: string;
  letterSpacing: string;
  className: string;
}

export function useI18nTypography(
  variant: 'body' | 'heading' | 'button' | 'small'
): TypographyConfig {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';
  
  return useMemo(() => {
    const configs = {
      body: {
        en: { lineHeight: '1.5', letterSpacing: '0', className: 'leading-normal' },
        vi: { lineHeight: '1.6', letterSpacing: '-0.01em', className: 'leading-relaxed' },
      },
      heading: {
        en: { lineHeight: '1.25', letterSpacing: '-0.025em', className: 'leading-tight' },
        vi: { lineHeight: '1.35', letterSpacing: '-0.03em', className: 'leading-snug' },
      },
      button: {
        en: { lineHeight: '1.25', letterSpacing: '0.01em', className: 'leading-tight' },
        vi: { lineHeight: '1.35', letterSpacing: '0', className: 'leading-snug' },
      },
      small: {
        en: { lineHeight: '1.4', letterSpacing: '0', className: 'leading-normal' },
        vi: { lineHeight: '1.5', letterSpacing: '-0.01em', className: 'leading-relaxed' },
      },
    };
    
    return isVietnamese ? configs[variant].vi : configs[variant].en;
  }, [isVietnamese, variant]);
}
```

### 10.9 Tailwind Language Variants

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    function({ addVariant }) {
      addVariant('vi', 'html[lang="vi"] &');
      addVariant('en', 'html[lang="en"] &');
    },
  ],
  theme: {
    extend: {
      lineHeight: {
        'vi-tight': '1.35',
        'vi-snug': '1.475',
        'vi-normal': '1.6',
        'vi-relaxed': '1.725',
      },
      letterSpacing: {
        'vi-normal': '-0.01em',
        'vi-tight': '-0.03em',
      },
    },
  },
};
```

#### Usage

```tsx
<p className="leading-normal vi:leading-vi-normal">
  {t('description')}
</p>

<h2 className="leading-tight tracking-tight vi:leading-vi-tight vi:tracking-vi-tight">
  {t('title')}
</h2>
```

---

## Appendix B.1: Plugin Icons Reference

| Plugin | Lucide Icon | Tooltip (EN) | Tooltip (VI) |
|--------|-------------|--------------|--------------|
| FileTree | `Folder` | Files | Tệp tin |
| Monaco | `Code2` | Editor | Trình soạn |
| Notes | `NotebookPen` | Notes | Ghi chú |
| Terminal | `Terminal` | Terminal | Terminal |
| Preview | `Eye` | Preview | Xem trước |
| Chat | `MessageSquare` | AI Chat | Chat AI |
| Add | `Plus` | Add Plugin | Thêm plugin |
| Settings | `Settings` | Settings | Cài đặt |

---

## Appendix B.2: CSS Variables Summary

```css
/* Plugin Panel Dimensions */
:root {
  --plugin-header-height: 36px;
  --plugin-tabs-height: 32px;
  --plugin-footer-height: 28px;
  
  /* Activity Bar */
  --activity-bar-width: 48px;
  --activity-btn-size: 40px;
  --activity-icon-size: 24px;
  
  /* Touch Targets */
  --touch-target-min: 44px;
  
  /* Z-index Scale */
  --z-plugin-content: 1;
  --z-plugin-header: 10;
  --z-plugin-overlay: 20;
  --z-activity-bar: 30;
  --z-tooltip: 70;
  --z-drag-ghost: 100;
}
```

---

**End of Part B - Sections 7-10**

**Document Version**: 3.0.0
**Lines**: ~1100
**Created**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
**Status**: APPROVED - Ready for consolidation with Parts A and C

**Next Action**: Consolidate with Part A and Part C into final `ux-specification.md`
