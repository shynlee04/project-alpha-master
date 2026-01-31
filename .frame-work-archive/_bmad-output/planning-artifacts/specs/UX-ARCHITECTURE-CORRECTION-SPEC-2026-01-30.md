# ═════════════════════════════════════════════════════════════════════════════
# UX ARCHITECTURE CORRECTION SPECIFICATION
# EPIC-UXUI-04: True Plugin Layout Architecture
# Created: 2026-01-30T14:40:00+07:00
# Status: ACTIVE SPECIFICATION
# ═════════════════════════════════════════════════════════════════════════════

## 🎯 EXECUTIVE SUMMARY

**Problem Identified**: EPIC-UXUI-03 created a generic plugin system that fundamentally misaligns with user requirements.

**Current Implementation** (WRONG):
- Single ActivityBar with all plugins dumped on it
- FloatingPluginDocker as a separate floating panel
- Multiple plugins visible simultaneously
- No enforcement of single-instance or max-per-bar constraints

**Required Implementation** (CORRECT):
- **3 Activity Bars**: Left (0.5), Main-Top (4), Right (2.5)
- **Plugin Docker**: Source of plugins (not destination)
- **Single plugin visible per bar** with toggle behavior
- **Drag from docker TO bars** with constraints
- **Grid ratio**: [0.5:0.5:2:4:2.5:0.5]

**Decision**: Halt all remediation work, correct architecture first.

---

## 📐 DETAILED ARCHITECTURE SPECIFICATION

### 1. Grid Layout System

#### Desktop Layout [0.5:0.5:2:4:2.5:0.5]

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────┐ ┌─────┐ ┌─────────────────┐ ┌────────────────────────┐ ┌──────────┐│
│  │     │ │     │ │                 │ │                        │ │          ││
│  │  G  │ │  A  │ │       P         │ │           M            │ │    P     ││
│  │  L  │ │  L  │ │       L         │ │           A            │ │    R     ││
│  │  O  │ │  E  │ │       U         │ │           I            │ │          ││
│  │  B  │ │  F  │ │       G         │ │           N            │ │    (2.5) ││
│  │  A  │ │  T  │ │       I         │ │           -            │ │          ││
│  │  L  │ │     │ │       N         │ │           T            │ │          ││
│  │     │ │  (  │ │                 │ │           O            │ │    A     ││
│  │ (0.5│ │  0.5│ │       (2)       │ │           P            │ │    C     ││
│  │  )  │ │  )  │ │                 │ │           (4)          │ │    T     ││
│  │     │ │     │ │                 │ │                        │ │    I     ││
│  │     │ │     │ │                 │ │                        │ │    V     ││
│  │     │ │     │ │                 │ │                        │ │    I     ││
│  │     │ │     │ │                 │ │                        │ │    T     ││
│  │     │ │     │ │                 │ │                        │ │    Y     ││
│  │     │ │     │ │                 │ │                        │ │          ││
│  │     │ │     │ │                 │ │                        │ │    B     ││
│  │     │ │     │ │                 │ │                        │ │    A     ││
│  │     │ │     │ │                 │ │                        │ │    R     ││
│  │     │ │     │ │                 │ │                        │ │          ││
│  │     │ │     │ │                 │ │                        │ │   (0.5)  ││
│  └─────┘ └─────┘ └─────────────────┘ └────────────────────────┘ └──────────┘│
│                                                                             │
│  [0.5]   [0.5]      [2]               [4]                    [2.5]   [0.5] │
│                                                                             │
│  Global  Left    Left Plugin        Main-Top Activity      Right   Right   │
│  Sidebar Activity  Panel (File)      Bar (Notes default)   Plugin  Activity│
│         Bar L                                              Panel   Bar R   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Column Definitions**:

| Column | Width | Purpose | Default Plugin |
|--------|-------|---------|----------------|
| Global Sidebar | 0.5 (48px collapsed, 240px expanded) | Navigation, project switcher | N/A |
| Activity Bar L | 0.5 (48px) | Left plugin icons | File-tree icon |
| Plugin Panel L | 2 (~320px) | Left plugin content | File-tree-project-management |
| Main-Top Activity | 4 (~640px) | Main content area | Notes (default) |
| Plugin Panel R | 2.5 (~400px) | Right plugin content | Agent-chat-cascade |
| Activity Bar R | 0.5 (48px) | Right plugin icons | Chat icon |

#### Responsive Breakpoints

```yaml
breakpoints:
  desktop:
    min_width: 1024px
    grid: [0.5:0.5:2:4:2.5:0.5]
    behavior: full_layout
    
  tablet_landscape:
    min_width: 768px
    max_width: 1023px
    grid: [0.5:0.5:3:4:2:0.5]
    behavior: compressed_layout
    
  tablet_portrait:
    min_width: 600px
    max_width: 767px
    layout: single_panel
    behavior: bottom_nav
    
  mobile:
    max_width: 599px
    layout: single_panel
    behavior: bottom_nav_fullscreen
```

---

### 2. Component Architecture

#### 2.1 Global Sidebar

```typescript
interface GlobalSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  projects: Project[];
  activeProjectId: string;
  onProjectSelect: (projectId: string) => void;
}

// Behavior:
// - Collapsed: 48px width, icons only, tooltips on hover
// - Expanded: 240px width, icons + labels
// - Auto-collapse on mobile/tablet
// - Persist state in localStorage
// - Smooth CSS transition (respects prefers-reduced-motion)
```

#### 2.2 Activity Bar System

```typescript
interface ActivityBarProps {
  position: 'left' | 'main-top' | 'right';
  plugins: PluginInstance[];
  activePluginId: string | null;
  maxPlugins: 3;
  onPluginToggle: (pluginId: string) => void;
  onPluginDragStart: (pluginId: string) => void;
}

// Behavior:
// - Displays plugin icons only (max 3)
// - Single click/tap toggles plugin visibility in associated panel
// - Active plugin highlighted with visual indicator
// - Accepts drops from PluginDocker
// - Emits drag events for reordering
```

#### 2.3 Plugin Panel System

```typescript
interface PluginPanelProps {
  position: 'left' | 'main' | 'right';
  activePlugin: PluginInstance | null;
  associatedActivityBar: ActivityBarPosition;
  onPluginMount: (pluginId: string) => void;
  onPluginUnmount: (pluginId: string) => void;
}

// Behavior:
// - Renders active plugin from associated activity bar
// - Preserves plugin state when hidden (React keep-alive)
// - Smooth transitions between plugins
// - Respects plugin capability interface
```

#### 2.4 Plugin Docker

```typescript
interface PluginDockerProps {
  availablePlugins: PluginDefinition[];
  assignedPlugins: PluginInstance[]; // Plugins already in bars
  deviceType: 'pc' | 'mobile' | 'tablet';
  onPluginDragStart: (pluginId: string) => void;
}

// Behavior:
// - Shows ALL available plugins (filtered by device type)
// - Plugins already in activity bars are HIDDEN
// - Drag source for activity bars
// - Device-aware filtering (hide IDE plugins for non-PC)
// - 8-bit styled panel
```

---

### 3. Plugin System Rules

#### 3.1 Instance Management

```yaml
single_instance_rule:
  description: "Never two same plugin instances across all 3 bars"
  enforcement: strict
  error_message: "Plugin already assigned to another bar"
  
always_loaded_plugins:
  - id: file_tree_project_management
    description: "Must be in one of the 3 bars, can move between bars"
    removable: false
    
  - id: agent_chat_cascade_thread_management
    description: "Must be in one of the 3 bars, can move between bars"
    removable: false

default_assignments:
  left_bar:
    - file_tree_project_management
    
  main_top_bar:
    - notes
    
  right_bar:
    - agent_chat_cascade_thread_management
```

#### 3.2 Capacity Constraints

```yaml
max_per_bar: 3
max_total: 9

visibility_rule:
  description: "Only 1 plugin visible per bar at a time"
  behavior: toggle
  
toggle_behavior:
  trigger: single_click_or_tap
  action: switch_to_plugin
  animation: 200ms ease-out
  
drag_drop_rules:
  source: plugin_docker_only
  destination: activity_bars_only
  between_bars: true
  constraints:
    - no_duplicates
    - max_3_per_bar
    - device_aware
```

#### 3.3 Device Filtering

```yaml
device_filtering:
  pc_users:
    available_plugins:
      - file_tree_project_management
      - notes
      - agent_chat_cascade_thread_management
      - monaco_editor
      - terminal
      - preview
      - all_other_plugins
      
  non_pc_users:
    available_plugins:
      - file_tree_project_management
      - notes
      - agent_chat_cascade_thread_management
      - preview
    hidden_plugins:
      - monaco_editor
      - terminal
    reason: "IDE-related plugins not suitable for mobile/tablet"
```

---

### 4. State Management

#### 4.1 Layout State

```typescript
interface LayoutState {
  // Global sidebar
  sidebar: {
    isExpanded: boolean;
  };
  
  // Activity bar assignments
  activityBars: {
    left: {
      pluginIds: string[]; // Max 3
      activePluginId: string | null;
    };
    mainTop: {
      pluginIds: string[]; // Max 3
      activePluginId: string | null;
    };
    right: {
      pluginIds: string[]; // Max 3
      activePluginId: string | null;
    };
  };
  
  // Docker state
  docker: {
    isOpen: boolean;
    filter: 'all' | 'pc-only' | 'mobile-friendly';
  };
  
  // Responsive
  breakpoint: 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
}

// Persistence:
// - Key: `layout-state-${projectId}`
// - Storage: localStorage
// - Validation: Schema validation on load
// - Fallback: Default assignments if corrupted
```

#### 4.2 Plugin Coordination Integration

```typescript
// Wire to EPIC-0.6 PluginCoordinationContext
interface PluginCoordinationState {
  // From EPIC-0.6
  openFiles: Map<pluginId, fileId[]>;
  writeLocks: Map<fileId, pluginId>;
  capabilities: Map<pluginId, PluginCapability>;
  
  // New for EPIC-UXUI-04
  pluginAssignments: Map<pluginId, ActivityBarPosition>;
  activePlugins: Map<ActivityBarPosition, pluginId>;
}
```

---

### 5. Interaction Flows

#### 5.1 Plugin Assignment Flow

```
User opens PluginDocker
    ↓
User drags plugin from Docker
    ↓
System validates:
  - Is plugin already assigned? → REJECT
  - Is target bar full (3 plugins)? → REJECT
  - Is plugin compatible with device? → REJECT if no
    ↓
System assigns plugin to bar
    ↓
System hides plugin from Docker
    ↓
System persists new assignment
    ↓
Plugin icon appears in Activity Bar
```

#### 5.2 Plugin Toggle Flow

```
User clicks plugin icon in Activity Bar
    ↓
System checks current active plugin
    ↓
If same plugin clicked:
  - Toggle visibility (hide/show)
Else:
  - Switch to clicked plugin
  - Preserve previous plugin state
    ↓
System updates active plugin in state
    ↓
PluginPanel renders new plugin
    ↓
System persists active plugin
```

#### 5.3 Responsive Adaptation Flow

```
Viewport changes size
    ↓
System detects new breakpoint
    ↓
System applies layout for breakpoint:
  - Desktop: Full 6-column grid
  - Tablet: Compressed grid or single panel
  - Mobile: Single panel + bottom nav
    ↓
System preserves plugin assignments
    ↓
System adjusts visible plugins if needed
    ↓
Layout transitions smoothly (CSS)
```

---

### 6. Technical Implementation

#### 6.1 CSS Grid Implementation

```css
/* Desktop Layout */
.workspace-layout {
  display: grid;
  grid-template-columns: 
    48px                    /* Global Sidebar (collapsed) */
    48px                    /* Activity Bar L */
    minmax(280px, 2fr)      /* Plugin Panel L */
    minmax(400px, 4fr)      /* Main-Top Activity */
    minmax(320px, 2.5fr)    /* Plugin Panel R */
    48px;                   /* Activity Bar R */
  grid-template-rows: 1fr;
  gap: 0;
  height: 100vh;
  overflow: hidden;
}

/* Expanded sidebar variant */
.workspace-layout.sidebar-expanded {
  grid-template-columns: 
    240px                   /* Global Sidebar (expanded) */
    48px
    minmax(280px, 2fr)
    minmax(400px, 4fr)
    minmax(320px, 2.5fr)
    48px;
}

/* Tablet Portrait */
@media (max-width: 767px) {
  .workspace-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 56px; /* Content + Bottom Nav */
  }
}
```

#### 6.2 Drag and Drop Implementation

```typescript
// Use @dnd-kit/core for React-friendly drag-drop
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

// Draggable Plugin Item
function DraggablePlugin({ plugin }: { plugin: PluginDefinition }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: plugin.id,
    data: { type: 'plugin', plugin },
  });
  
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <PluginIcon plugin={plugin} />
    </div>
  );
}

// Droppable Activity Bar
function DroppableActivityBar({ position, children }: ActivityBarProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `activity-bar-${position}`,
    data: { type: 'activity-bar', position },
  });
  
  return (
    <div 
      ref={setNodeRef} 
      className={cn('activity-bar', isOver && 'drag-over')}
    >
      {children}
    </div>
  );
}
```

#### 6.3 State Persistence

```typescript
// Zustand store with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      sidebar: { isExpanded: false },
      activityBars: {
        left: { pluginIds: ['file-tree'], activePluginId: 'file-tree' },
        mainTop: { pluginIds: ['notes'], activePluginId: 'notes' },
        right: { pluginIds: ['chat'], activePluginId: 'chat' },
      },
      docker: { isOpen: false, filter: 'all' },
      breakpoint: 'desktop',
      
      // Actions
      toggleSidebar: () => set(state => ({
        sidebar: { isExpanded: !state.sidebar.isExpanded }
      })),
      
      assignPlugin: (pluginId: string, bar: ActivityBarPosition) => {
        // Validation logic
        const currentBar = get().activityBars[bar];
        if (currentBar.pluginIds.length >= 3) return;
        if (get().isPluginAssigned(pluginId)) return;
        
        set(state => ({
          activityBars: {
            ...state.activityBars,
            [bar]: {
              ...currentBar,
              pluginIds: [...currentBar.pluginIds, pluginId],
              activePluginId: currentBar.activePluginId || pluginId,
            }
          }
        }));
      },
      
      togglePlugin: (bar: ActivityBarPosition, pluginId: string) => {
        const currentBar = get().activityBars[bar];
        const newActiveId = currentBar.activePluginId === pluginId 
          ? null 
          : pluginId;
        
        set(state => ({
          activityBars: {
            ...state.activityBars,
            [bar]: { ...currentBar, activePluginId: newActiveId }
          }
        }));
      },
    }),
    {
      name: 'layout-state',
      partialize: (state) => ({
        sidebar: state.sidebar,
        activityBars: state.activityBars,
      }),
    }
  )
);
```

---

### 7. Files to Create/Modify

#### 7.1 New Files

```
src/presentation/components/layout/
├── GlobalSidebar/
│   ├── GlobalSidebar.tsx
│   ├── GlobalSidebar.css
│   └── useGlobalSidebar.ts
├── ActivityBar/
│   ├── ActivityBarLeft.tsx
│   ├── ActivityBarMainTop.tsx
│   ├── ActivityBarRight.tsx
│   ├── ActivityBar.css
│   └── useActivityBar.ts
├── PluginPanel/
│   ├── PluginPanelLeft.tsx
│   ├── PluginPanelMain.tsx
│   ├── PluginPanelRight.tsx
│   └── PluginPanel.css
├── PluginDocker/
│   ├── PluginDocker.tsx
│   ├── PluginDocker.css
│   └── usePluginDocker.ts
└── WorkspaceLayout/
    ├── WorkspaceLayout.tsx          # Updated
    ├── WorkspaceLayout.css          # Updated
    └── useWorkspaceLayout.ts        # Updated

src/presentation/stores/
└── layout-store.ts                   # New
```

#### 7.2 Files to Archive

```
_bmad-ext/.archive/layout-cleanup-2026-01-30/
├── ActivityBar.tsx                   # Old single bar
├── FloatingPluginDocker.tsx          # Old floating docker
└── MainContentRenderer.tsx           # May repurpose or archive
```

#### 7.3 Files to Modify

```
src/presentation/layouts/WorkspaceLayout.tsx
src/routes/$projectId.tsx
src/styles.css                        # Add grid CSS
```

---

### 8. Acceptance Criteria

#### 8.1 Functional Requirements

- [ ] 3 Activity Bars render in correct positions
- [ ] Each bar displays max 3 plugin icons
- [ ] Single click/tap toggles plugin visibility
- [ ] Only 1 plugin visible per bar at a time
- [ ] Plugin Docker shows available plugins
- [ ] Plugins in bars hidden from Docker
- [ ] Drag-drop works from Docker to bars
- [ ] Drag-drop works between bars
- [ ] Single instance enforced (no duplicates)
- [ ] Max 3 plugins per bar enforced
- [ ] Device filtering works (PC vs non-PC)
- [ ] Global sidebar auto-collapses
- [ ] Sidebar tooltips work
- [ ] State persists across sessions
- [ ] Responsive layouts work (all breakpoints)

#### 8.2 Non-Functional Requirements

- [ ] 8-bit design compliance (sharp corners, pixel shadows)
- [ ] 60fps animations (no jank)
- [ ] WCAG 2.1 AA accessibility
- [ ] Touch-friendly on mobile/tablet
- [ ] Keyboard navigation support
- [ ] prefers-reduced-motion support
- [ ] Build passes (0 TypeScript errors)
- [ ] No console errors

#### 8.3 Performance Requirements

- [ ] Initial render < 100ms
- [ ] Plugin switch < 50ms
- [ ] Drag-drop feedback < 16ms
- [ ] Layout transition < 200ms
- [ ] Memory usage stable (no leaks)

---

### 9. Testing Strategy

#### 9.1 Unit Tests

- Layout store actions
- Activity bar logic
- Plugin validation
- State persistence

#### 9.2 Integration Tests

- Drag-drop flow
- Plugin toggle flow
- Responsive adaptation
- State restoration

#### 9.3 E2E Tests

- Full user journey: Open docker → Drag plugin → Toggle plugins
- Responsive testing: Resize window → Verify layout changes
- Persistence testing: Reload page → Verify state restored

---

### 10. Migration Plan

#### Phase 1: Create New Components (Week 1)
- Create all new components in parallel
- Don't modify existing layout yet
- Test in isolation

#### Phase 2: Integration (Week 2)
- Replace old layout with new
- Wire up PluginCoordinationContext
- Archive old components

#### Phase 3: Validation (Week 2)
- E2E testing
- Performance testing
- Bug fixes

---

**Document Version**: 1.0.0
**Created**: 2026-01-30T14:40:00+07:00
**Status**: ACTIVE SPECIFICATION
**Next Step**: Begin Story Implementation
