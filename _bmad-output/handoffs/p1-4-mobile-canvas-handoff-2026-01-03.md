---
date: 2026-01-03
time: 17:45:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1098
type: p1-high-priority-handoff
---

# P1-4 Handoff: Mobile Canvas Unusable

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P1 - High (Mobile User Experience Blocked)
**Estimate**: 6 hours
**Impact**: Canvas component is unusable on mobile devices despite having read-only mode

## Problem Statement

The Canvas component has basic mobile detection and read-only mode, but the mobile experience is poor:

**Current State:**
- Read-only mode enabled on mobile (can't edit nodes/edges)
- Desktop-only controls still visible on mobile
- Keyboard shortcuts panel shown (irrelevant for touch devices)
- No touch gesture optimization
- Layout not optimized for small screens
- Empty state uses desktop typography

**User Impact:**
- Mobile users can't comfortably view knowledge graphs
- Controls take up screen space but don't work
- Keyboard shortcuts shown for touch devices
- No indication of touch gestures available
- Poor performance on mobile viewport sizes

## Root Cause Analysis

### Current Mobile Implementation (Lines 114, 130-132, 190-194):

```typescript
const { isMobile } = useResponsive();

// Detect mobile and set read-only mode
useEffect(() => {
  setReadOnly(isMobile);
}, [isMobile, setReadOnly]);

// ReactFlow props
<ReactFlow
  preventScrolling={!isMobile}  // Prevent scroll on desktop only
  nodesDraggable={!isReadOnly}   // False on mobile
  nodesConnectable={!isReadOnly} // False on mobile
  elementsSelectable={!isReadOnly} // False on mobile
>
```

### Mobile-Specific Issues:

**1. Controls Still Visible (Lines 201-206)**
```typescript
<Controls
  showZoom={true}
  showFitView={true}
  showInteractive={true}
  position="bottom-left"
/>
```
- Issue: Shown on mobile even in read-only mode
- Impact: Takes up screen space, user can't use them

**2. Keyboard Shortcuts Panel (Lines 84-106, 216)**
```typescript
function KeyboardShortcutsPanel() {
  // Shows: Arrow keys, +/-, Home, Delete
  return (
    <Panel position="bottom-right">
      {/* Keyboard shortcuts */}
    </Panel>
  );
}
```
- Issue: Irrelevant for touch devices
- Impact: Clutters mobile interface

**3. Empty State Not Mobile Optimized (Lines 39-53)**
```typescript
<h3 className="text-xl font-bold text-foreground mb-3">
<div className="mb-4 text-4xl animate-bounce">📝</div>
```
- Issue: Large typography for mobile screens
- Impact: Overwhelming on small screens

**4. No Touch Gesture Guidance**
- Issue: Users don't know they can pan/zoom with touch
- Impact: Confusing UX, appears broken

**5. Viewport Not Mobile-Optimized**
- Issue: `fitView: true` might not work well on narrow screens
- Issue: Default zoom 1 might not be optimal for mobile

**6. Min Height Too Large (Line 167)**
```typescript
className="w-full h-full min-h-[400px] relative"
```
- Issue: 400px minimum height too tall for mobile
- Impact: Takes too much vertical space

## Implementation Plan

### Step 1: Hide Desktop Controls on Mobile (30 minutes)

**File**: `src/presentation/components/canvas/Canvas.tsx`

**Modify Controls rendering (lines 201-206):**
```typescript
{/* Controls - hide on mobile in read-only mode */}
{!isReadOnly && (
  <Controls
    showZoom={true}
    showFitView={true}
    showInteractive={true}
    position="bottom-left"
  />
)}
```

**Rationale**:
- Controls are for editing (zoom, fit view, interactive mode)
- Read-only mode = no editing needed
- Mobile users can still use touch gestures to pan/zoom

---

### Step 2: Replace Keyboard Shortcuts with Touch Gesture Guide (1 hour)

**File**: `src/presentation/components/canvas/Canvas.tsx`

**Create new component:**
```typescript
/**
 * Touch gestures help panel for mobile devices
 */
function TouchGesturesPanel() {
  const { t } = useTranslation();

  const gestures = [
    { icon: '👆', desc: t('canvas.gesture.pan', 'Pan canvas') },
    { icon: '🤏', desc: t('canvas.gesture.zoom', 'Pinch to zoom') },
    { icon: '👆👆', desc: t('canvas.gesture.tap', 'Double-tap to reset') },
  ];

  return (
    <Panel position="bottom-right">
      <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded">
        {gestures.map(({ icon, desc }) => (
          <div key={icon} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span>{desc}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/**
 * Keyboard shortcuts help panel (desktop only)
 */
function KeyboardShortcutsPanel() {
  const { t } = useTranslation();

  const shortcuts = [
    { key: 'Arrow keys', action: t('canvas.shortcut.pan', 'Pan') },
    { key: '+ / -', action: t('canvas.shortcut.zoom', 'Zoom in/out') },
    { key: 'Home', action: t('canvas.shortcut.fitView', 'Fit view') },
    { key: 'Delete', action: t('canvas.shortcut.delete', 'Delete selected') },
  ];

  return (
    <Panel position="bottom-right">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded">
        {shortcuts.map(({ key, action }) => (
          <div key={key} className="flex gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{key}</kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
```

**Update CanvasContent to conditionally render (line 216):**
```typescript
{/* Panels */}
{isMobile ? <TouchGesturesPanel /> : <KeyboardShortcutsPanel />}
<LinkageProposalsPanel indexMetadata={props?.indexMetadata} />
```

---

### Step 3: Optimize Empty State for Mobile (30 minutes)

**File**: `src/presentation/components/canvas/Canvas.tsx`

**Update CanvasEmptyState component (lines 39-53):**
```typescript
/**
 * Empty state component shown when canvas has no nodes
 */
function CanvasEmptyState() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-surface/50 backdrop-blur-sm">
      <div className={`mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'} animate-bounce`}>
        📝
      </div>
      <h3 className={`font-bold text-foreground mb-3 ${isMobile ? 'text-base' : 'text-xl'}`}>
        {t('canvas.emptyState.title', 'Drop sources here to start')}
      </h3>
      <p className={`text-muted-foreground max-w-sm mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
        {t('canvas.emptyState.hint', 'Drag and drop sources from the sidebar to create your knowledge map')}
      </p>
    </div>
  );
}
```

---

### Step 4: Improve Touch Gesture Performance (1.5 hours)

**File**: `src/presentation/components/canvas/Canvas.tsx`

**Update ReactFlow props (lines 171-199):**
```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  viewport={viewport}
  onViewportChange={handleViewportChange}
  onNodeDoubleClick={handleNodeDoubleClick}
  nodeTypes={nodeTypes}
  edgeTypes={memoizedEdgeTypes}
  defaultEdgeOptions={defaultEdgeOptions}
  minZoom={defaultViewportOptions.minZoom}
  maxZoom={defaultViewportOptions.maxZoom}
  fitView={defaultViewportOptions.fitView}
  fitViewOptions={defaultViewportOptions.fitView}
  snapToGrid={false}
  snapGrid={[15, 15]}
  onlyRenderVisibleElements={true}
  preventScrolling={!isMobile}
  // Read-only mode for mobile
  nodesDraggable={!isReadOnly}
  nodesConnectable={!isReadOnly}
  elementsSelectable={!isReadOnly}
  // Performance optimization
  defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.5 : 1 }}
  // Attribution position
  attributionPosition="bottom-left"
  // Mobile-specific: Pan on scroll (disabled), use touch gestures instead
  panOnScroll={false}
  panOnScrollSpeed={0.5}
  // Enable touch gesture optimizations
  // ReactFlow automatically handles touch pan/zoom
>
```

**Key changes:**
- `panOnScroll={false}` - Prevent accidental zooming on scroll
- `defaultViewport` - Use lower zoom (0.5) for mobile initial view
- ReactFlow automatically handles touch gestures (pinch to zoom, pan)

---

### Step 5: Fix Min Height for Mobile (30 minutes)

**File**: `src/presentation/components/canvas/Canvas.tsx`

**Update container div className (line 167):**
```typescript
return (
  <div
    className={`w-full h-full relative ${isMobile ? 'min-h-[300px]' : 'min-h-[400px]'}`}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
  >
```

---

### Step 6: Add i18n Translation Keys (30 minutes)

**File**: `src/i18n/en.json`

**Add new translation keys:**
```json
{
  "canvas": {
    "gesture": {
      "pan": "Pan canvas",
      "zoom": "Pinch to zoom",
      "tap": "Double-tap to reset"
    },
    "shortcut": {
      "pan": "Pan",
      "zoom": "Zoom in/out",
      "fitView": "Fit view",
      "delete": "Delete selected"
    },
    "emptyState": {
      "title": "Drop sources here to start",
      "hint": "Drag and drop sources from the sidebar to create your knowledge map"
    },
    "mobileReadOnly": "Edit on desktop"
  }
}
```

**File**: `src/i18n/vi.json`

**Add Vietnamese translations:**
```json
{
  "canvas": {
    "gesture": {
      "pan": "Kéo thả để di chuyển",
      "zoom": "Véo để thu/phóng",
      "tap": "Chạm hai lần để đặt lại"
    },
    "shortcut": {
      "pan": "Di chuyển",
      "zoom": "Thu/phóng",
      "fitView": "Vừa màn hình",
      "delete": "Xóa đã chọn"
    },
    "emptyState": {
      "title": "Kéo nguồn vào đây để bắt đầu",
      "hint": "Kéo và thả nguồn từ thanh bên cạnh để tạo bản đồ kiến thức"
    },
    "mobileReadOnly": "Chỉnh sửa trên máy tính"
  }
}
```

---

### Step 7: Manual Testing (1 hour)

**Test Case 1: Mobile Viewport**
1. Open DevTools device emulator (iPhone 12 Pro)
2. Navigate to Knowledge workspace
3. Verify Canvas loads with read-only overlay visible
4. Verify Controls NOT visible (desktop-only)
5. Verify TouchGesturesPanel visible in bottom-right
6. Verify gestures show: 👆 Pan, 🤏 Zoom, 👆👆 Reset

**Test Case 2: Touch Gestures**
1. Using touch emulator (DevTools):
   - One finger drag → Pan canvas ✅
   - Two finger pinch → Zoom in/out ✅
   - Double tap → Reset viewport ✅
2. Verify smooth performance (no lag)

**Test Case 3: Empty State Mobile**
1. Clear all nodes from canvas
2. Switch to mobile viewport
3. Verify empty state uses smaller typography (text-base instead of text-xl)
4. Verify emoji is smaller (text-3xl instead of text-4xl)
5. Verify text is readable on mobile screen

**Test Case 4: Desktop Unchanged**
1. Switch back to desktop viewport
2. Verify Controls visible and working
3. Verify KeyboardShortcutsPanel visible
4. Verify editing works (drag nodes, create edges)
5. Verify no regressions

---

### Step 8: Code Validation (30 minutes)

```bash
# TypeScript check
pnpm tsc --noEmit 2>&1 | grep -E "Canvas\.tsx" | grep "error" | wc -l
# Expected: 0 errors

# Check i18n keys exist
grep -r "canvas\.gesture\|canvas\.shortcut" src/i18n/en.json
# Expected: All keys present

# Run ESLint
pnpm lint src/presentation/components/canvas/Canvas.tsx
# Expected: No warnings
```

---

## Constraints & Safeguards

### DO NOT:
- ❌ Break existing desktop functionality
- ❌ Remove read-only mode on mobile
- ❌ Add node/edge editing on mobile
- ❌ Change defaultViewport for desktop
- ❌ Remove existing keyboard shortcuts on desktop

### MUST:
- ✅ Maintain desktop behavior unchanged
- ✅ Keep read-only mode on mobile (no editing)
- ✅ Support touch gestures for pan/zoom
- ✅ Hide desktop controls on mobile
- ✅ Provide gesture guidance for mobile users
- ✅ Optimize typography for mobile
- ✅ Add i18n translation keys
- ✅ Test on both mobile and desktop viewports

---

## Validation Checklist:

- [ ] Controls hidden on mobile (visible on desktop)
- [ ] KeyboardShortcutsPanel hidden on mobile (visible on desktop)
- [ ] TouchGesturesPanel visible on mobile (hidden on desktop)
- [ ] Touch gestures work (pan, pinch to zoom, double-tap reset)
- [ ] Empty state uses mobile typography
- [ ] Min height reduced to 300px on mobile
- [ ] Default viewport zoom 0.5 on mobile (1.0 on desktop)
- [ ] i18n keys added to en.json and vi.json
- [ ] Zero TypeScript errors in Canvas.tsx
- [ ] Desktop functionality unchanged
- [ ] No regressions in read-only mode
- [ ] Performance acceptable on mobile (no lag)

---

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query ReactFlow 2025 documentation for mobile/touch gesture support
- Query React responsive design patterns for conditional rendering

### Deepwiki:
- Search ReactFlow repo for mobile optimization examples
- Search react-responsive repo for useResponsive hook best practices

---

## Output Location

Report completion to:
```
_bmad-output/p1-4-mobile-canvas-completion-2026-01-03.md
```

Include:
- Code diffs showing all changes
- Mobile test screenshots (or DevTools screenshots)
- Touch gesture test results
- TypeScript error count (before: 0, after: 0 expected)
- Desktop regression test results
- i18n keys added
- Any blockers or recommendations

---

## Report Back To

**@bmad-core-bmad-master** with:
1. P1-4 completion status (SUCCESS/BLOCKED)
2. Files modified count (expected: 3 files = Canvas.tsx + en.json + vi.json)
3. Mobile UX improvements summary
4. Desktop regression verification
5. Next action recommendation (all P1 issues complete, ready for Epic 52)

---

**Handoff Created**: 2026-01-03T17:45:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1098
**Team**: Team A
**Priority**: P1 HIGH - Mobile Canvas UX Blocked
