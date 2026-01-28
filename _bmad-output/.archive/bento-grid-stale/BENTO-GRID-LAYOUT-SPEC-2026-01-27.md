# Bento Grid Layout Specification

**Version:** 1.0.0
**Date:** 2026-01-27
**Author:** ux-designer-ext (BMAD Framework)
**Status:** SPECIFICATION COMPLETE - Ready for Implementation
**Timebox:** 45 minutes

---

## Executive Summary

This specification defines a **Bento Grid Layout System** for the plugin architecture. Unlike traditional equal-column layouts, bento grids use **asymmetric, mixed-size cells** that create visual hierarchy and optimal space utilization.

### Key Principles

1. **Asymmetric by Design** - No equal columns; mixed sizes like a Japanese bento box
2. **Predefined Arrangements** - Each plugin count (2-5) has ONE optimal bento arrangement
3. **Toggle-Based** - Plugins are toggled ON/OFF, grid shape changes accordingly
4. **Swap-Not-Resize** - Users can drag to swap positions, never resize cells
5. **Always-Loaded Core** - Chat + FileTree are always visible (minimum 2 plugins)
6. **8-bit Aesthetic** - Sharp corners, solid borders, no glassmorphism

---

## Bento Layouts

### Layout Philosophy

The bento grid is inspired by Japanese bento boxes where food items occupy different-sized compartments. Applied to UI:

- **Large cells** (2x2 or 2x1) house primary content (Editor, Chat)
- **Medium cells** (1x2 or 2x1) house secondary content (FileTree, Preview)
- **Small cells** (1x1) house utility content (Terminal, Notes compact)

---

### 2 Plugins (Core Layout)

Always-loaded: **Chat** + **FileTree**

```
+---------------------------+---------------------------+
|                           |                           |
|                           |                           |
|          CHAT             |         FILETREE          |
|         (60%)             |          (40%)            |
|                           |                           |
|                           |                           |
+---------------------------+---------------------------+
```

**CSS Grid Code:**
```css
.bento-grid-2 {
  display: grid;
  grid-template-columns: 6fr 4fr;
  grid-template-rows: 1fr;
  gap: 0;
  height: 100%;
}
```

**Tailwind Classes:**
```html
<div class="grid grid-cols-[6fr_4fr] grid-rows-1 gap-0 h-full">
  <div class="border-r-2 border-border"><!-- Chat --></div>
  <div><!-- FileTree --></div>
</div>
```

**Cell Assignments:**
| Position | Plugin | Grid Area | Size |
|----------|--------|-----------|------|
| Left | Chat | col 1 | 60% |
| Right | FileTree | col 2 | 40% |

**Rationale:** Chat is the primary interaction point (AI agent communication), so it gets more space. FileTree is navigation - needs visibility but not dominance.

---

### 3 Plugins (L-Shape Layout)

Core + 1 toggle: **Chat** + **FileTree** + **Notes/Monaco**

```
+-------------------+---------------+
|                   |               |
|       CHAT        |   FILETREE    |
|       (50%)       |    (25%)      |
|                   |               |
+-------------------+---------------+
|                                   |
|        MAIN CONTENT               |
|    (Notes/Monaco - 100% width)    |
|              (25%)                |
|                                   |
+-----------------------------------+
```

**CSS Grid Code:**
```css
.bento-grid-3 {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 3fr 2fr;
  gap: 0;
  height: 100%;
}

.bento-grid-3 .cell-chat { grid-area: 1 / 1 / 2 / 2; }
.bento-grid-3 .cell-filetree { grid-area: 1 / 2 / 2 / 3; }
.bento-grid-3 .cell-main { grid-area: 2 / 1 / 3 / 3; }
```

**Tailwind Classes:**
```html
<div class="grid grid-cols-[2fr_1fr] grid-rows-[3fr_2fr] gap-0 h-full">
  <div class="border-r-2 border-b-2 border-border"><!-- Chat --></div>
  <div class="border-b-2 border-border"><!-- FileTree --></div>
  <div class="col-span-2"><!-- Main Content --></div>
</div>
```

**Cell Assignments:**
| Position | Plugin | Grid Area | Size |
|----------|--------|-----------|------|
| Top-Left | Chat | row 1, col 1 | 50% x 60% |
| Top-Right | FileTree | row 1, col 2 | 25% x 60% |
| Bottom (full width) | Main (Notes/Monaco) | row 2, col 1-2 | 100% x 40% |

**Rationale:** The "L-shape" gives Chat prominence while allowing full-width editing below. FileTree remains visible for navigation context.

---

### 4 Plugins (2x2 Asymmetric Layout)

Core + 2 toggles: **Chat** + **FileTree** + **Monaco** + **Preview/Terminal**

```
+-------------------+---------------------------+
|                   |                           |
|      CHAT         |          MONACO           |
|      (30%)        |          (50%)            |
|                   |                           |
+-------------------+---------------------------+
|                   |                           |
|    FILETREE       |       PREVIEW/TERMINAL    |
|      (30%)        |          (50%)            |
|                   |                           |
+-------------------+---------------------------+
```

**CSS Grid Code:**
```css
.bento-grid-4 {
  display: grid;
  grid-template-columns: 3fr 5fr;
  grid-template-rows: 1fr 1fr;
  gap: 0;
  height: 100%;
}

.bento-grid-4 .cell-chat { grid-area: 1 / 1 / 2 / 2; }
.bento-grid-4 .cell-monaco { grid-area: 1 / 2 / 2 / 3; }
.bento-grid-4 .cell-filetree { grid-area: 2 / 1 / 3 / 2; }
.bento-grid-4 .cell-tool { grid-area: 2 / 2 / 3 / 3; }
```

**Tailwind Classes:**
```html
<div class="grid grid-cols-[3fr_5fr] grid-rows-2 gap-0 h-full">
  <div class="border-r-2 border-b-2 border-border"><!-- Chat --></div>
  <div class="border-b-2 border-border"><!-- Monaco --></div>
  <div class="border-r-2 border-border"><!-- FileTree --></div>
  <div><!-- Preview/Terminal --></div>
</div>
```

**Cell Assignments:**
| Position | Plugin | Grid Area | Size |
|----------|--------|-----------|------|
| Top-Left | Chat | row 1, col 1 | 37.5% x 50% |
| Top-Right | Monaco | row 1, col 2 | 62.5% x 50% |
| Bottom-Left | FileTree | row 2, col 1 | 37.5% x 50% |
| Bottom-Right | Preview/Terminal | row 2, col 2 | 62.5% x 50% |

**Rationale:** The 2x2 layout creates quadrants with the editor dominating the right side. This mirrors traditional IDE layouts while maintaining bento asymmetry.

---

### 5 Plugins (Full Bento Layout)

Core + 3 toggles: **Chat** + **FileTree** + **Monaco** + **Preview** + **Terminal**

```
+-------------------+-----------------------+---------------+
|                   |                       |               |
|      CHAT         |        MONACO         |   FILETREE    |
|       (25%)       |        (50%)          |     (25%)     |
|                   |                       |               |
|                   |                       |               |
+-------------------+-----------------------+---------------+
|                       TERMINAL (100% width)               |
|                          (30% height)                     |
+-----------------------------------------------------------+
|                   |                                       |
|     PREVIEW       |          (empty or Notes)             |
|      (40%)        |              (60%)                    |
|                   |                                       |
+-------------------+---------------------------------------+
```

**Alternative 5-Plugin Layout (User's Original Vision):**

```
+---------------------------+---------------+
|                           |               |
|       LARGE SQUARE        |    SMALL      |
|         (Chat)            |   (FileTree)  |
|           65%             |      35%      |
+---------------------------+---------------+
|             WIDE RECTANGLE                |
|             (Monaco/Editor)               |
|                 100%                      |
+-------------------+-----------------------+
|      TALL RECT    |                       |
|     (Terminal)    |      SQUARE           |
|        40%        |     (Preview)         |
|                   |        60%            |
+-------------------+-----------------------+
```

**CSS Grid Code (Alternative - Recommended):**
```css
.bento-grid-5 {
  display: grid;
  grid-template-columns: 65fr 35fr;
  grid-template-rows: 35fr 30fr 35fr;
  gap: 0;
  height: 100%;
}

.bento-grid-5 .cell-chat { grid-area: 1 / 1 / 2 / 2; }
.bento-grid-5 .cell-filetree { grid-area: 1 / 2 / 2 / 3; }
.bento-grid-5 .cell-monaco { grid-area: 2 / 1 / 3 / 3; }
.bento-grid-5 .cell-terminal { grid-area: 3 / 1 / 4 / 2; }
.bento-grid-5 .cell-preview { grid-area: 3 / 2 / 4 / 3; }
```

**Tailwind Classes:**
```html
<div class="grid grid-cols-[65fr_35fr] grid-rows-[35fr_30fr_35fr] gap-0 h-full">
  <div class="border-r-2 border-b-2 border-border"><!-- Chat --></div>
  <div class="border-b-2 border-border"><!-- FileTree --></div>
  <div class="col-span-2 border-b-2 border-border"><!-- Monaco --></div>
  <div class="border-r-2 border-border"><!-- Terminal --></div>
  <div><!-- Preview --></div>
</div>
```

**Cell Assignments:**
| Position | Plugin | Grid Area | Size |
|----------|--------|-----------|------|
| Top-Left (Large Square) | Chat | row 1, col 1 | 65% x 35% |
| Top-Right (Small) | FileTree | row 1, col 2 | 35% x 35% |
| Middle (Wide Rectangle) | Monaco | row 2, col 1-2 | 100% x 30% |
| Bottom-Left (Tall Rect) | Terminal | row 3, col 1 | 40% x 35% |
| Bottom-Right (Square) | Preview | row 3, col 2 | 60% x 35% |

**Rationale:** This layout follows the user's original vision - a true bento with mixed cell sizes. The Monaco editor spans the full width in the middle for maximum code visibility, while Chat and Preview get visual prominence.

---

## Plugin Size Variants

Each plugin must render appropriately in different cell sizes. This table defines the UI behavior per size:

| Plugin | Small (1x1) | Medium (2x1 / 1x2) | Large (2x2) |
|--------|-------------|-------------------|-------------|
| **Chat** | Message list only, no input | + Input field | + Full history + typing indicator |
| **FileTree** | Tree only, collapsed | + Search bar | + File preview panel |
| **Monaco** | Read-only, no tabs | + Edit mode, single tab | + Multi-tab + minimap |
| **Notes** | Note list (titles only) | + Editor view | + Split list/editor |
| **Terminal** | Output only (readonly) | + Command input | + Multiple tabs + history |
| **Preview** | Thumbnail/iframe | + Interactive | + DevTools panel |

### Size Detection Logic

```typescript
// Determine cell size based on grid area
function getCellSize(gridArea: string): 'small' | 'medium' | 'large' {
  const [rowStart, colStart, rowEnd, colEnd] = parseGridArea(gridArea);
  const rows = rowEnd - rowStart;
  const cols = colEnd - colStart;
  
  if (rows >= 2 && cols >= 2) return 'large';
  if (rows >= 2 || cols >= 2) return 'medium';
  return 'small';
}

// Plugin MainComponent receives size prop
interface PluginMainProps {
  width: number;
  height: number;
  cellSize: 'small' | 'medium' | 'large';
}
```

### Responsive Variants

| Breakpoint | Plugin Count | Layout Mode |
|------------|--------------|-------------|
| mobile | 1 | Single fullscreen plugin |
| mobileLg | 1 | Single fullscreen plugin |
| tablet | 2 | 2-plugin bento (horizontal) |
| desktop | 2-5 | Full bento grid |
| wide | 2-5 | Full bento grid (larger cells) |

---

## Drag-to-Swap Behavior

### Interaction Model

Users can **drag** a plugin from one cell to another. Plugins **swap positions** - the grid shape does NOT change.

```
BEFORE SWAP:                    AFTER SWAP:
+-------+-------+               +-------+-------+
| Chat  | Files |    drag       | Files | Chat  |
|   1   |   2   |  Files to 1   |   1   |   2   |
+-------+-------+   -------->   +-------+-------+
```

### Drag-Drop Implementation

```typescript
interface DragState {
  draggingPlugin: PluginId | null;
  sourceCell: number | null;
  targetCell: number | null;
}

function handleDrop(sourceCell: number, targetCell: number) {
  // Swap plugin positions in state
  const newOrder = [...pluginOrder];
  const temp = newOrder[sourceCell];
  newOrder[sourceCell] = newOrder[targetCell];
  newOrder[targetCell] = temp;
  setPluginOrder(newOrder);
  
  // Persist order
  persistPluginOrder(newOrder);
}
```

### Visual Feedback (8-bit Compliant)

| State | Visual Treatment |
|-------|------------------|
| **Idle** | Normal appearance |
| **Dragging** | `opacity-70`, `shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]` |
| **Over Drop Target** | Target cell: `border-4 border-primary` |
| **Invalid Target** | Target cell: `border-4 border-destructive` |

```css
/* 8-bit drag visual */
.cell-dragging {
  opacity: 0.7;
  box-shadow: 8px 8px 0 0 rgba(0, 0, 0, 0.5);
  cursor: grabbing;
}

.cell-drop-target {
  border: 4px solid var(--primary);
  background-color: var(--primary-10);
}

.cell-drop-invalid {
  border: 4px solid var(--destructive);
}
```

### Constraints

1. **Same Layout Only** - Swapping doesn't change cell sizes
2. **No External Drops** - Cannot drag outside the bento grid
3. **Order Persistence** - Plugin order is stored in Zustand/localStorage
4. **Touch Support** - Long-press (500ms) to initiate drag on touch devices

---

## Mobile Considerations

### 2-Panel Maximum

Mobile devices show a maximum of 2 plugins with tab-based switching:

```
+----------------------------------+
|         Global Header            |
+----------------------------------+
|                                  |
|                                  |
|         ACTIVE PLUGIN            |
|     (fullscreen content)         |
|                                  |
|                                  |
+----------------------------------+
|     [Chat]      [Notes]          |
+----------------------------------+
```

### Swipe Navigation

- **Horizontal swipe**: Switch between tabs
- **Swipe threshold**: 50px minimum
- **Animation**: 200ms ease-out slide

```typescript
function useSwipeNavigation(plugins: PluginId[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeIndex < plugins.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    },
    trackMouse: false,
    delta: 50,
  });
  
  return { handlers, activeIndex, setActiveIndex };
}
```

### Mobile-Specific Layouts

| Configuration | Tab 1 | Tab 2 |
|---------------|-------|-------|
| Default (Chat focus) | Chat | Notes |
| Code mode | FileTree | Monaco |
| Preview mode | Monaco | Preview |

---

## CSS Grid Implementation

### Complete Grid System

```css
/* ============================================
   BENTO GRID SYSTEM - 8-bit Design Compliant
   ============================================ */

/* Base Grid Container */
.bento-grid {
  display: grid;
  gap: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* 2-Plugin Layout */
.bento-grid[data-plugins="2"] {
  grid-template-columns: 6fr 4fr;
  grid-template-rows: 1fr;
}

/* 3-Plugin Layout (L-Shape) */
.bento-grid[data-plugins="3"] {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 3fr 2fr;
}
.bento-grid[data-plugins="3"] .cell:nth-child(3) {
  grid-column: 1 / -1; /* span full width */
}

/* 4-Plugin Layout (2x2 Asymmetric) */
.bento-grid[data-plugins="4"] {
  grid-template-columns: 3fr 5fr;
  grid-template-rows: 1fr 1fr;
}

/* 5-Plugin Layout (Full Bento) */
.bento-grid[data-plugins="5"] {
  grid-template-columns: 65fr 35fr;
  grid-template-rows: 35fr 30fr 35fr;
}
.bento-grid[data-plugins="5"] .cell:nth-child(3) {
  grid-column: 1 / -1; /* Monaco spans full width */
}

/* Cell Styling - 8-bit Compliant */
.bento-cell {
  overflow: hidden;
  border-radius: 0; /* NO rounded corners */
  position: relative;
}

/* Cell Borders */
.bento-cell:not(:last-child) {
  border-right: 2px solid var(--border);
}
.bento-grid[data-plugins="3"] .bento-cell:nth-child(1),
.bento-grid[data-plugins="3"] .bento-cell:nth-child(2) {
  border-bottom: 2px solid var(--border);
}
.bento-grid[data-plugins="4"] .bento-cell:nth-child(1),
.bento-grid[data-plugins="4"] .bento-cell:nth-child(2) {
  border-bottom: 2px solid var(--border);
}
.bento-grid[data-plugins="5"] .bento-cell:nth-child(1),
.bento-grid[data-plugins="5"] .bento-cell:nth-child(2) {
  border-bottom: 2px solid var(--border);
}
.bento-grid[data-plugins="5"] .bento-cell:nth-child(3) {
  border-bottom: 2px solid var(--border);
}

/* Cell Header (plugin name) */
.bento-cell-header {
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--muted);
  border-bottom: 2px solid var(--border);
  font-family: var(--font-pixel), monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Cell Content */
.bento-cell-content {
  height: calc(100% - 32px);
  overflow: auto;
}
```

---

## Tailwind Utility Classes

### Layout Classes

```html
<!-- 2-Plugin Grid -->
<div class="grid grid-cols-[6fr_4fr] grid-rows-1 gap-0 h-full">

<!-- 3-Plugin Grid -->
<div class="grid grid-cols-[2fr_1fr] grid-rows-[3fr_2fr] gap-0 h-full">

<!-- 4-Plugin Grid -->
<div class="grid grid-cols-[3fr_5fr] grid-rows-2 gap-0 h-full">

<!-- 5-Plugin Grid -->
<div class="grid grid-cols-[65fr_35fr] grid-rows-[35fr_30fr_35fr] gap-0 h-full">
```

### Cell Classes (8-bit Compliant)

```html
<!-- Standard Cell -->
<div class="overflow-hidden rounded-none relative border-r-2 border-border">

<!-- Cell Header -->
<div class="h-8 px-3 flex items-center justify-between bg-muted border-b-2 border-border font-pixel text-xs uppercase tracking-wide">

<!-- Cell Content -->
<div class="h-[calc(100%-32px)] overflow-auto">

<!-- Drag Handle -->
<div class="cursor-grab active:cursor-grabbing">
```

### Component Structure

```tsx
interface BentoGridProps {
  plugins: PluginId[];
  order: number[];
  onSwap: (source: number, target: number) => void;
}

function BentoGrid({ plugins, order, onSwap }: BentoGridProps) {
  const gridClass = useMemo(() => {
    const count = plugins.length;
    switch (count) {
      case 2: return 'grid-cols-[6fr_4fr] grid-rows-1';
      case 3: return 'grid-cols-[2fr_1fr] grid-rows-[3fr_2fr]';
      case 4: return 'grid-cols-[3fr_5fr] grid-rows-2';
      case 5: return 'grid-cols-[65fr_35fr] grid-rows-[35fr_30fr_35fr]';
      default: return 'grid-cols-1 grid-rows-1';
    }
  }, [plugins.length]);

  return (
    <div 
      className={cn('grid gap-0 h-full', gridClass)}
      data-plugins={plugins.length}
    >
      {order.map((index, cellIndex) => {
        const pluginId = plugins[index];
        const isSpanning = 
          (plugins.length === 3 && cellIndex === 2) ||
          (plugins.length === 5 && cellIndex === 2);
        
        return (
          <BentoCell
            key={pluginId}
            pluginId={pluginId}
            cellIndex={cellIndex}
            isSpanning={isSpanning}
            onSwap={onSwap}
          />
        );
      })}
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Core Grid System

- [ ] Create `BentoGrid.tsx` component with data-plugins attribute
- [ ] Implement CSS Grid layouts for 2, 3, 4, 5 plugins
- [ ] Create `BentoCell.tsx` wrapper component
- [ ] Wire to `PluginLayoutStore` for plugin list
- [ ] Add 8-bit compliant borders and headers

### Phase 2: Drag-to-Swap

- [ ] Add `useDragSwap` hook with drag state management
- [ ] Implement drag visual feedback (opacity, shadow)
- [ ] Add drop target highlighting
- [ ] Persist plugin order to localStorage
- [ ] Add touch support with long-press

### Phase 3: Plugin Size Variants

- [ ] Define `cellSize` prop on PluginMainProps
- [ ] Update each plugin to handle size variants
- [ ] Add size detection based on grid area

### Phase 4: Mobile

- [ ] Create mobile 2-tab layout
- [ ] Add swipe navigation hook
- [ ] Test on iOS Safari and Android Chrome

---

## Acceptance Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| AC-1 | 2-plugin layout renders with 60/40 split | |
| AC-2 | 3-plugin layout renders L-shape (2 top, 1 spanning bottom) | |
| AC-3 | 4-plugin layout renders 2x2 asymmetric grid | |
| AC-4 | 5-plugin layout renders true bento with Monaco spanning | |
| AC-5 | Plugins can be dragged and swapped | |
| AC-6 | Grid shape does NOT change on swap | |
| AC-7 | Plugin order persists across sessions | |
| AC-8 | Mobile shows 2 tabs with swipe navigation | |
| AC-9 | All cells have sharp corners (rounded-none) | |
| AC-10 | All borders are 2px solid border-border | |

---

## ASCII Summary (All 4 Layouts)

```
=== 2 PLUGINS ===                === 3 PLUGINS (L-Shape) ===
+-------------+----------+       +-------------+---------+
|             |          |       |             |         |
|    CHAT     | FILETREE |       |    CHAT     | FTREE   |
|    (60%)    |  (40%)   |       |             |         |
|             |          |       +-------------+---------+
+-------------+----------+       |     MAIN CONTENT      |
                                 |     (Notes/Monaco)    |
                                 +-----------------------+

=== 4 PLUGINS (2x2) ===          === 5 PLUGINS (Full Bento) ===
+----------+---------------+     +----------------+----------+
|   CHAT   |    MONACO     |     |     CHAT       | FILETREE |
|          |               |     |     (65%)      |  (35%)   |
+----------+---------------+     +----------------+----------+
| FILETREE |  PREVIEW/TERM |     |       MONACO (100%)       |
|          |               |     +----------------+----------+
+----------+---------------+     |  TERMINAL(40%) | PREVIEW  |
                                 |                | (60%)    |
                                 +----------------+----------+
```

---

## Key Design Decisions

### Decision 1: Asymmetric Over Equal

**Why:** Equal columns waste space and create visual monotony. Asymmetric layouts guide user attention to primary content.

### Decision 2: Monaco Spans Full Width at 5 Plugins

**Why:** Code editing needs horizontal space for readability. A narrow editor is unusable; spanning gives Monaco ~1200px+ on desktop.

### Decision 3: Chat Gets Largest Cell

**Why:** Chat with AI agent is the primary interaction mode. Thread lists, message history, and input field need space for usability.

### Decision 4: Terminal in Bottom-Left at 5 Plugins

**Why:** Terminal output scrolls vertically. Placing it in the "tall rect" position maximizes visible output lines.

### Decision 5: No User Resizing

**Why:** User-resizable panels lead to inconsistent experiences, persist state complexity, and break responsive behavior. Fixed presets are predictable.

---

## References

- **8-bit Design System**: `AGENTS.md` lines 295-302
- **Plugin Types**: `src/domain/types/plugin-types.ts`
- **Current Presets**: `src/presentation/layouts/workflow-presets.ts`
- **Breakpoints**: `src/presentation/layouts/useBreakpoint.ts`
- **Layout Analysis**: `_bmad-output/analysis/LAYOUT-ARCHITECTURE-SPEC-2026-01-27.md`

---

**Document End**

*Generated by ux-designer-ext on 2026-01-27*
*Timebox: 45 minutes*
*Status: SPECIFICATION COMPLETE*
