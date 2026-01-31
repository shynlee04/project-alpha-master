# Project Space Route Reality Check - 2026-01-28

## Executive Summary

**Status**: INCOMPLETE - Layout system exists but is NOT the cause of visual issues
**Root Issue**: The "broken mess" visible in screenshot is likely from **duplicate stores** (BentoGridStore vs PluginLayoutStore) and **conflicting layout systems** (Bento Grid vs Workflow Presets).

---

## 1. Component Tree (ACTUAL CODE)

```
Route: localhost:3000/$projectId

$projectId.tsx (line 45-150)
├── ErrorBoundary
└── UnifiedProjectRoute()
    ├── PluginCoordinationProvider
    └── ProjectContextProvider
        └── div.h-full.w-full.flex.flex-col
            └── div.flex-1.overflow-hidden
                └── PluginLayout.tsx (line 84-245)
                    ├── BentoGridStore state
                    ├── PluginLayoutStore state (DUPLICATE)
                    ├── renderBentoGrid() - Desktop
                    │   └── CSS Grid with gridTemplateAreas
                    │       └── DraggableBentoCell (per plugin)
                    │           └── PluginRenderer
                    │               └── plugin.MainComponent
                    └── renderMobileSingleView() - Mobile
                        └── PluginRenderer
```

---

## 2. File Paths Involved

### Route Layer
| File | Purpose | Lines |
|------|---------|-------|
| `src/routes/$projectId.tsx` | Route entry point | 152 |

### Layout Layer
| File | Purpose | Lines |
|------|---------|-------|
| `src/presentation/layouts/PluginLayout.tsx` | Main layout container | 316 |
| `src/presentation/layouts/PluginLayoutStore.ts` | Zustand store (layout state) | 563 |
| `src/presentation/layouts/BentoGridStore.ts` | Zustand store (bento state) | 310 |
| `src/presentation/layouts/bento-layouts.ts` | Bento grid definitions | 270 |
| `src/presentation/layouts/workflow-presets.ts` | Workflow preset definitions | 176 |
| `src/presentation/layouts/DraggableBentoCell.tsx` | Draggable cell wrapper | ~200 |
| `src/presentation/layouts/PluginPanel.tsx` | Panel wrapper for plugins | 333 |
| `src/presentation/layouts/LayoutRenderers.tsx` | Column layout renderers | 439 |

### Plugin Layer
| File | Purpose | Lines |
|------|---------|-------|
| `src/plugins/filetree/FileTreePlugin.tsx` | FileTree main component | 456 |
| `src/plugins/chat/ChatPlugin.tsx` | Chat main component | 178 |
| `src/plugins/notes/NotesPlugin.tsx` | Notes main component | ~350 |
| `src/plugins/monaco/MonacoPlugin.tsx` | Monaco main component | 88 |
| `src/plugins/terminal/TerminalPlugin.tsx` | Terminal main component | ~100 |
| `src/plugins/preview/PreviewPlugin.tsx` | Preview main component | ~100 |

### Registry & Context
| File | Purpose | Lines |
|------|---------|-------|
| `src/infrastructure/plugins/plugin-registry.ts` | Plugin registry (singleton Map) | 203 |
| `src/infrastructure/context/project-context.tsx` | Project context provider | ~400 |
| `src/infrastructure/context/plugin-coordination-context.tsx` | Plugin coordination | ~200 |

---

## 3. Layout System Analysis

### Current Implementation: Bento Grid

The layout uses **CSS Grid with named areas**:

```typescript
// bento-layouts.ts - Layout for 3 plugins (L-Shape)
{
  count: 3,
  name: 'L-Shape',
  gridTemplate: {
    columns: '2fr 1fr',
    rows: '3fr 2fr',
    areas: '"chat filetree" "main main"',
  },
  cells: [
    { id: 'chat', gridArea: 'chat', sizeVariant: 'medium' },
    { id: 'filetree', gridArea: 'filetree', sizeVariant: 'small' },
    { id: 'main', gridArea: 'main', sizeVariant: 'large' },
  ],
}
```

### Rendering Flow

```
PluginLayout.renderBentoGrid()
  └── div.h-full.w-full.grid.gap-0
      style={{ gridTemplateColumns, gridTemplateRows, gridTemplateAreas }}
      └── DraggableBentoCell per visiblePlugin
          └── PluginRenderer (gets plugin from registry)
              └── plugin.MainComponent
```

### CSS Applied
- Container: `h-full w-full grid gap-0`
- Grid areas applied via `style.gridTemplateAreas`
- Each cell uses `gridArea: cell.gridArea`

---

## 4. Problems Identified

### Problem 1: Duplicate State Management (CRITICAL)

**Two separate Zustand stores managing similar state:**

1. **BentoGridStore** (`BentoGridStore.ts:114`)
   - `activePlugins: PluginId[]`
   - `pluginOrder: PluginId[]`
   - Persisted to `bento-grid-storage`

2. **PluginLayoutStore** (`PluginLayoutStore.ts:202`)
   - `activePlugins: PluginId[]`
   - `layoutMode: LayoutMode`
   - `currentPreset: WorkflowPreset`
   - Persisted to `plugin-layout-storage`

**Impact**: When route initializes, it reads from PluginLayoutStore to initialize defaults, but PluginLayout.tsx reads from BentoGridStore to render. This can cause mismatch.

### Problem 2: Conflicting Layout Systems

**Two layout systems exist:**

1. **Bento Grid** (currently active in PluginLayout)
   - Uses `bento-layouts.ts` for predefined asymmetric layouts
   - Layouts based on plugin COUNT (2, 3, 4, 5)

2. **Workflow Presets** (partially integrated)
   - Uses `workflow-presets.ts` for USE-CASE based layouts
   - Layouts based on WORKFLOW (default, focus, code, full-editor)

**Impact**: Route initializes using `getPresetConfig()` but PluginLayout renders using `getBentoLayout()`. The two systems have different plugin orders and grid configurations.

### Problem 3: Plugin Order Mismatch

**Route initialization** (`$projectId.tsx:108-121`):
```typescript
// Uses PRESET panels (from workflow-presets.ts)
const defaultPreset = layoutStore.currentPreset || 'default';
const presetConfig = getPresetConfig(defaultPreset);
layoutStore.initializeDefaults(presetConfig.panels, getDefaultLayoutMode(platform));
// presetConfig.panels = ['chat', 'filetree', 'notes']
```

**PluginLayout rendering** (`PluginLayout.tsx:114-116`):
```typescript
// Uses BENTO layout (from bento-layouts.ts)
const layout = useMemo(() => {
  return getBentoLayout(getActiveCount());
}, [getActiveCount]);
// Returns L-Shape layout with cells: [chat, filetree, main]
```

**Impact**: The bento layout expects plugins in a specific order (chat, filetree, main) but receives them from preset (chat, filetree, notes). The grid areas may not match.

### Problem 4: Each Plugin Has Its Own Header

Looking at the plugins:

- **ChatPlugin** (line 85): Has its own header bar
- **FileTreePlugin** (line 370): Has its own header bar
- **NotesPlugin**: Has its own header bar

But **PluginPanel.tsx** also has a header (lines 290-316, `showHeader` defaults to `false`).

If `showHeader={true}` is ever passed, there would be DUPLICATE headers.

### Problem 5: No Clear Grid Boundaries

The current CSS:
```typescript
// PluginLayout.tsx:165
className="h-full w-full grid gap-0"
```

`gap-0` means no visible gap between panels. Combined with border styling inside plugins, this creates an unclear boundary.

---

## 5. Recent Backend Activity (Last 7 Days)

```
983b98b1 feat: Introduce a new responsive grid system and UX specifications
b251157f feat: Implement plugin coordination layer, WebContainer management, and a draggable Bento grid layout
87044537 feat: Refactor plugin architecture with dedicated main components
d4914dbf feat: Implement project-centric routing and introduce a file event bus
5fc9befc feat(plugins): replace drag-drop with toggle toolbar and integrate Monaco editor
```

**Files Modified Recently:**
- `src/presentation/layouts/BentoGridStore.ts` - NEW
- `src/presentation/layouts/DraggableBentoCell.tsx` - NEW
- `src/presentation/layouts/bento-layouts.ts` - NEW
- `src/presentation/layouts/workflow-presets.ts` - NEW
- `src/plugins/*` - All plugins modified

---

## 6. What's Actually Rendered (Default Preset)

With default preset (`['chat', 'filetree', 'notes']`):

1. **BentoGridStore.activePlugins** = `['chat', 'filetree', 'notes']` (from persist)
2. **getActiveCount()** returns `3`
3. **getBentoLayout(3)** returns L-Shape layout:
   ```
   +-------------------+---------------+
   |       CHAT        |   FILETREE    |
   |      (2fr)        |    (1fr)      |
   +-------------------+---------------+
   |        MAIN CONTENT (full width)  |
   +-----------------------------------+
   ```
4. **visiblePlugins** = `['chat', 'filetree', 'notes']`
5. **Mapping**:
   - `pluginId='chat'` -> `cell.gridArea='chat'`
   - `pluginId='filetree'` -> `cell.gridArea='filetree'`
   - `pluginId='notes'` -> `cell.gridArea='main'`

---

## 7. Root Cause Analysis

The "broken mess" with 4+ panels is likely caused by:

1. **Stale localStorage state** from previous versions
   - Old `bento-grid-storage` with different plugins
   - Old `plugin-layout-storage` with different configuration

2. **Preset vs Bento mismatch**
   - Route sets preset panels, Bento uses different layout

3. **Hydration race condition**
   - Store hydrates AFTER route tries to initialize
   - CC-AR-03 was supposed to fix this but may be incomplete

---

## 8. Recommended Investigation

### Step 1: Clear localStorage and Test
```javascript
localStorage.removeItem('bento-grid-storage');
localStorage.removeItem('plugin-layout-storage');
```
Then refresh page.

### Step 2: Console Log Check
Look for:
```
[PluginLayout] Rendering with activePlugins: [...]
[BentoGridStore] Active count: X
[PluginLayout] Using layout: L-Shape
```

### Step 3: Unify State Management
**Recommendation**: Remove PluginLayoutStore's `activePlugins` and use BentoGridStore as single source of truth for active plugins.

---

## 9. Architecture Diagram

```
                    ┌────────────────────────────────────┐
                    │         $projectId.tsx             │
                    │  (Route Entry - Line 45)           │
                    └───────────────┬────────────────────┘
                                    │
                    ┌───────────────▼────────────────────┐
                    │    ProjectContextProvider          │
                    │    (Project + Gateway)             │
                    └───────────────┬────────────────────┘
                                    │
                    ┌───────────────▼────────────────────┐
                    │    PluginCoordinationProvider      │
                    │    (Cross-plugin file tracking)    │
                    └───────────────┬────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                        PluginLayout.tsx                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  STATE SOURCES (PROBLEM: DUPLICATE)                             │    │
│  │  ┌─────────────────────┐  ┌──────────────────────┐              │    │
│  │  │ BentoGridStore      │  │ PluginLayoutStore    │              │    │
│  │  │ - activePlugins     │  │ - activePlugins      │              │    │
│  │  │ - pluginOrder       │  │ - layoutMode         │              │    │
│  │  │ - getActiveCount()  │  │ - currentPreset      │              │    │
│  │  └─────────────────────┘  └──────────────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  LAYOUT SOURCES (PROBLEM: CONFLICTING)                          │    │
│  │  ┌─────────────────────┐  ┌──────────────────────┐              │    │
│  │  │ bento-layouts.ts    │  │ workflow-presets.ts  │              │    │
│  │  │ Based on COUNT      │  │ Based on USE-CASE    │              │    │
│  │  │ (2, 3, 4, 5 plugins)│  │ (default, focus,..) │              │    │
│  │  └─────────────────────┘  └──────────────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌────────────────────────CSS GRID────────────────────────────────┐    │
│  │  gridTemplateColumns: "2fr 1fr"                                 │    │
│  │  gridTemplateRows: "3fr 2fr"                                    │    │
│  │  gridTemplateAreas: '"chat filetree" "main main"'               │    │
│  │                                                                  │    │
│  │  ┌────────────────────┐ ┌────────────────────┐                  │    │
│  │  │ DraggableBentoCell │ │ DraggableBentoCell │                  │    │
│  │  │ gridArea: "chat"   │ │ gridArea: "filetree"│                  │    │
│  │  │ ┌────────────────┐ │ │ ┌────────────────┐ │                  │    │
│  │  │ │ ChatPlugin     │ │ │ │ FileTreePlugin │ │                  │    │
│  │  │ │ (own header)   │ │ │ │ (own header)   │ │                  │    │
│  │  │ │ AgentChatPanel │ │ │ │ renderTree()   │ │                  │    │
│  │  │ └────────────────┘ │ │ └────────────────┘ │                  │    │
│  │  └────────────────────┘ └────────────────────┘                  │    │
│  │  ┌──────────────────────────────────────────┐                   │    │
│  │  │ DraggableBentoCell  gridArea: "main"     │                   │    │
│  │  │ ┌──────────────────────────────────────┐ │                   │    │
│  │  │ │ NotesPlugin (own header)             │ │                   │    │
│  │  │ │ NoteEditor (BlockNote)               │ │                   │    │
│  │  │ └──────────────────────────────────────┘ │                   │    │
│  │  └──────────────────────────────────────────┘                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Conclusion

**The layout system code is structurally sound, but has:**

1. **Duplicate state stores** - BentoGridStore AND PluginLayoutStore both track `activePlugins`
2. **Conflicting layout systems** - Bento (count-based) vs Workflow Presets (use-case based)
3. **Stale localStorage** - Previous versions' state persisted causing unexpected layouts

**The "broken mess" is NOT from CSS issues but from state management confusion.**

**Immediate Action Required:**
- Clear localStorage for `bento-grid-storage` and `plugin-layout-storage`
- Test with fresh state
- Long-term: Unify to single store and single layout system
