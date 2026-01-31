# Story File: ARCH-03-04 - Drag-Drop Plugin Reordering

**Story ID:** ARCH-03-04
**Epic:** EPIC-ARCH-03 (Layout System & UX)
**Phase:** Phase 3 of ADR-034
**Created:** 2026-01-23T12:00:00+07:00
**Updated:** 2026-01-23T23:10:00+07:00
**Status:** COMPLETE ✅ - 7/8 criteria met (criterion 8: DEFERRED)
**Team:** Team B
**Priority:** P1 - Medium
**Estimated Effort:** 3 hours
**Timebox:** 3 hours
**Dependencies:** ARCH-03-02 (Mobile-Responsive Plugin Layouts) ✅ COMPLETE

---

## 📋 Story Context

This story polishes the drag-drop plugin reordering functionality in PluginLayout by adding visual feedback, keyboard accessibility, and screen reader announcements. The `reorderPlugin()` action already exists in PluginLayoutStore from ARCH-02-09, but the UX is basic. This story adds:

1. Visual drag handles in each panel header
2. Cursor changes and visual feedback during drag
3. Drop zone highlighting
4. Smooth animations
5. Keyboard accessibility (arrow keys to reorder)
6. Screen reader announcements
7. Touch device support

**Authority Documents:**
- ADR-034: Project-Centric Architecture (Phase 3: Layout System & UX)
- ADR-034-AMENDMENT-001: Platform-First Plugin Selection
- EPIC-ARCH-03: Layout System & UX
- Previous completions: ARCH-03-00, ARCH-03-01, ARCH-03-01-UPDATE, ARCH-03-02, ARCH-03-03

---

## 🎯 Acceptance Criteria

| # | Criterion | Success Evidence |
|---|-----------|-----------------|
| 1 | Drag handle (≡ icon) in each panel header | PluginPanel.tsx renders GripHorizontal icon in header, cursor: grab |
| 2 | Cursor changes to `grabbing` during drag | CSS: `.plugin-drag-handle:active { cursor: grabbing; }` |
| 3 | Dragged panel has elevated shadow + slight opacity | CSS: `.plugin-panel.dragging { opacity: 0.8; box-shadow: 8px 8px 0 0 rgba(0, 0, 0, 0.3); z-index: 100; }` |
| 4 | Drop zones highlight on hover | CSS: `.plugin-drop-zone.active { border-color: #0066cc; background: rgba(0, 102, 204, 0.1); }` |
| 5 | Smooth animation (200ms) on drop | CSS: `transition: all 200ms ease-in-out;` on drop animation |
| 6 | Keyboard accessible: Focus panel, use arrow keys to reorder | PluginPanel.tsx: `onKeyDown` handler for ArrowUp/ArrowDown/ArrowLeft/ArrowRight, `tabIndex={0}` |
| 7 | Screen reader announces reorder | ARIA live region or `aria-live="polite"` on reordering, announces: "Plugin moved to position X" |
| 8 | Works on touch devices (long press to initiate) | Touch event handlers: `onTouchStart`, `onLongPress` to initiate drag mode |
| 9 | TypeScript: 0 errors | `pnpm tsc --noEmit` returns 0 errors in modified files |

---

## 📁 Files to Modify

### Existing Files to Update

| File | Purpose | Lines Changed |
|------|---------|---------------|
| `src/presentation/layouts/PluginPanel.tsx` | Add drag handle, visual feedback, keyboard accessibility, touch support | ~150 lines |
| `src/presentation/layouts/PluginLayout.tsx` | Add drop zone highlighting logic | ~50 lines |

### New Files to Create

| File | Purpose | Estimated Lines |
|------|---------|----------------|
| `src/presentation/layouts/plugin-dnd.css` | Drag-drop styles (drag handle, dragging state, drop zones) | ~80 lines |

---

## 🎨 CSS Specification (8-Bit Design - NON-NEGOTIABLE)

```css
/* Drag handle */
.plugin-drag-handle {
  cursor: grab;
  padding: 4px 8px;
  color: #666;
  transition: color 150ms;
}

.plugin-drag-handle:hover {
  color: #000;
}

.plugin-drag-handle:active {
  cursor: grabbing;
}

/* Dragging state */
.plugin-panel.dragging {
  opacity: 0.8;
  box-shadow: 8px 8px 0 0 rgba(0, 0, 0, 0.3);
  z-index: 100;
  pointer-events: none; /* Prevent drop zones from activating on dragged panel */
}

/* Drop zone */
.plugin-drop-zone {
  border: 2px dashed transparent;
  transition: border-color 150ms, background-color 150ms;
}

.plugin-drop-zone.active {
  border-color: #0066cc;
  background: rgba(0, 102, 204, 0.1);
}

/* Drop animation */
.plugin-panel.drop-animation {
  animation: drop-bounce 200ms ease-out;
}

@keyframes drop-bounce {
  0% { transform: scale(0.98); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

**8-Bit Design Compliance:**
- ✅ Sharp corners: `border-radius: 0` (no rounding)
- ✅ Pixel shadows: `box-shadow: 8px 8px 0 0` (no blur)
- ✅ Solid colors: No transparency on backgrounds
- ✅ No glassmorphism: No `backdrop-filter: blur()`

---

## 🔌 Keyboard Accessibility

```typescript
// In PluginPanel.tsx
function PluginPanel({ pluginId, ... }: PluginPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { activePlugins, reorderPlugin } = usePluginLayoutStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (document.activeElement !== panelRef.current) return;

    const currentIndex = activePlugins.indexOf(pluginId);
    if (currentIndex === -1) return;

    // Arrow keys to reorder
    if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault();
      reorderPlugin(pluginId, currentIndex - 1);
      announceReorder(pluginId, currentIndex - 1);
    } else if (e.key === 'ArrowDown' && currentIndex < activePlugins.length - 1) {
      e.preventDefault();
      reorderPlugin(pluginId, currentIndex + 1);
      announceReorder(pluginId, currentIndex + 1);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      reorderPlugin(pluginId, currentIndex - 1);
      announceReorder(pluginId, currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < activePlugins.length - 1) {
      e.preventDefault();
      reorderPlugin(pluginId, currentIndex + 1);
      announceReorder(pluginId, currentIndex + 1);
    }
  };

  return (
    <div
      ref={panelRef}
      tabIndex={0}  // Make focusable
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`${pluginId} panel`}
    >
      {/* Drag handle */}
      <div className="plugin-drag-handle" aria-hidden="true">
        <GripHorizontal />
      </div>
      {/* Panel content */}
    </div>
  );
}
```

---

## 📢 Screen Reader Support

```typescript
// Live region for announcements
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>

// Announce function
function announceReorder(pluginId: PluginId, newIndex: number) {
  const announcement = `${pluginId} moved to position ${newIndex + 1}`;
  setAnnouncement(announcement);
  // Clear after announcement is read
  setTimeout(() => setAnnouncement(''), 2000);
}
```

---

## 📱 Touch Device Support

```typescript
// Long press detection for touch devices
const [touchStartX, setTouchStartX] = useState(0);
const [touchStartY, setTouchStartY] = useState(0);
const [isLongPress, setIsLongPress] = useState(false);
const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStartX(e.touches[0].clientX);
  setTouchStartY(e.touches[0].clientY);
  setIsLongPress(false);

  // Start long press timer (500ms)
  longPressTimerRef.current = setTimeout(() => {
    setIsLongPress(true);
    // Initiate drag mode
  }, 500);
};

const handleTouchMove = (e: React.TouchEvent) => {
  // Cancel long press if user moves finger significantly
  const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

  if (deltaX > 10 || deltaY > 10) {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }
};

const handleTouchEnd = () => {
  if (longPressTimerRef.current) {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }
  setIsLongPress(false);
};
```

---

## 🎯 Implementation Tasks

### Task 1: Create plugin-dnd.css
- [ ] Create file at `src/presentation/layouts/plugin-dnd.css`
- [ ] Add drag handle styles (cursor: grab/grabbing)
- [ ] Add dragging state styles (opacity, shadow, z-index)
- [ ] Add drop zone styles (dashed border, active state)
- [ ] Add drop animation (@keyframes)
- [ ] Follow 8-bit design rules (no border-radius, pixel shadows)

### Task 2: Update PluginPanel.tsx
- [ ] Import GripHorizontal icon from lucide-react
- [ ] Add drag handle to panel header (≡ icon)
- [ ] Add plugin-dnd.css import
- [ ] Add dragging state to component
- [ ] Add touch event handlers (onTouchStart, onTouchMove, onTouchEnd)
- [ ] Implement long press detection (500ms)
- [ ] Add keyboard event handler (onKeyDown)
- [ ] Implement ArrowUp/ArrowDown/ArrowLeft/ArrowRight reordering
- [ ] Add tabIndex={0} to make panel focusable
- [ ] Add ARIA attributes (role="region", aria-label)

### Task 3: Update PluginLayout.tsx
- [ ] Import plugin-dnd.css
- [ ] Add drop zone highlighting state
- [ ] Add onDragEnter/onDragOver/onDragLeave handlers
- [ ] Set active class on drop zones during drag
- [ ] Implement smooth animation on drop (200ms)
- [ ] Add screen reader live region
- [ ] Implement announceReorder function

### Task 4: i18n Updates
- [ ] Add translation key: `pluginPanel.dragAriaLabel` ("Drag to reorder")
- [ ] Add translation key: `pluginPanel.dragHandleTooltip` ("Press and drag to reorder this panel")
- [ ] Add translation key: `pluginPanel.announcement.moved` ("{plugin} moved to position {position}")

---

## 📊 Success Metrics

| Metric | Target | Before | After |
|--------|---------|---------|--------|
| Drag handle in panel header | Yes | No | Yes |
| Cursor changes during drag | Yes | No | Yes |
| Dragged panel elevation | Yes | No | Yes |
| Drop zones highlight | Yes | No | Yes |
| Smooth animation | Yes | No | Yes |
| Keyboard accessible | Yes | No | Yes |
| Touch devices work | Yes | No | Yes |
| Screen reader support | Yes | No | Yes |
| Acceptance criteria | 9/9 | 0/9 | 9/9 |
| TypeScript errors | 0 | - | 0 |

---

## 🚨 STOP CONDITIONS (NON-NEGOTIABLE)

**STOP and report to Sprint-Manager if:**
1. TypeScript errors > 5 in PluginPanel or PluginLayout
2. Breaking changes introduced (PluginLayout no longer works)
3. ADR-034 violations detected (workspace modes reintroduced)
4. > 2x estimated time (3 hours = 6 hours) without progress
5. dev-ext blocked > 30 minutes without resolution

---

## 🎯 Governance Compliance Checklist

- [ ] Follows ADR-034 Phase 3 specification
- [ ] Follows ADR-034-AMENDMENT-001 platform-first pattern
- [ ] No workspace modes introduced
- [ ] Navigation uses `/$projectId` only (no `/ide/$projectId` or `/notes/$projectId`)
- [ ] 8-bit design: sharp corners, pixel shadows, solid colors
- [ ] No `window.location.href` usage (use navigate())
- [ ] AGENTS.md import order followed
- [ ] Zustand v5 pattern: `useShallow` for multiple selectors
- [ ] i18n support for all user-facing strings
- [ ] TypeScript compiles with 0 errors
- [ ] File size < 400 lines per file
- [ ] Documentation in ENGLISH ONLY (per delegation instructions)

---

## 🔍 Dependencies

### Prerequisites (Already Complete)
- ✅ ARCH-03-00: Platform-First Plugin Defaults
- ✅ ARCH-03-01: ProjectSidebar Component
- ✅ ARCH-03-01-UPDATE: ProjectSidebar Navigation
- ✅ ARCH-03-02: Mobile-Responsive Plugin Layouts
- ✅ ARCH-03-03: Layout Presets System

### Blocks
- None (all dependencies complete)

---

## 📝 Notes

### Existing Implementation
- `reorderPlugin(pluginId: PluginId, newIndex: number)` action already exists in PluginLayoutStore (from ARCH-02-09)
- This story focuses on UX polish (visual feedback, a11y), not core functionality

### Touch Gestures
- Long press (500ms) initiates drag mode on touch devices
- Swipe gestures already implemented in ARCH-03-02 for plugin switching
- This story adds touch-specific drag-drop reordering

### Accessibility
- WCAG 2.1 Level AA compliance for keyboard navigation
- Screen reader announcements for reorder operations
- Focus indicators visible on all panels
- Touch targets ≥ 44x44px (already compliant from ARCH-03-02)

---

## 🎉 Story Complete Criteria

**ARCH-03-04 is COMPLETE when:**
- ✅ All 9 acceptance criteria met
- ✅ 3 files modified/created (PluginPanel.tsx, PluginLayout.tsx, plugin-dnd.css)
- ✅ 0 TypeScript errors
- ✅ 8-bit design compliance verified
- ✅ Keyboard accessibility tested
- ✅ Touch device support verified
- ✅ Screen reader announcements verified
- ✅ Completion report created
- ✅ Ready for Orchestrator authorization before ARCH-03-05

---

**END OF STORY FILE**

---

## 🚨 FIX INSTRUCTIONS (2026-01-23T22:30:00+07:00)

### Critical Issue: 13 TypeScript Errors

The previous implementation added incomplete long press detection code that caused TypeScript errors. Touch device support (criterion 8) is DEFERRED.

### What to Remove (Lines ~115-227)

1. **First `handleKeyDown` declaration** (lines 115-153) - REMOVE
2. **`handleLongPressMove` function** (lines 156-173) - REMOVE
3. **`handleLongPressEnd` function** (lines 175-188) - REMOVE
4. **Second `handleKeyDown` declaration** (lines 190-227) - REMOVE (DUPLICATE)

### What to Keep

1. **Swipe gesture code** (lines 64-92, 278-324) - KEEP (from ARCH-03-02)
2. **Drag handle code** (lines 353-360) - KEEP (✅ working)
3. **Single `handleKeyDown` function** - KEEP (keyboard accessibility working)
4. **Screen reader live region** (in PluginLayout.tsx) - KEEP

### Acceptance Criteria Update

Criterion 8 (Touch device support) is DEFERRED. Target is 7/8 criteria met.

### Required Fix

Remove lines 115-227 (incomplete long press code) and keep ONE handleKeyDown function (lines 129-153 from first declaration).
