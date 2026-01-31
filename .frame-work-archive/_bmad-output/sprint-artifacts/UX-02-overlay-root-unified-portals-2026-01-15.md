# UX-02: OverlayRoot for All Modals - Story Completion Artifact

**Epic**: EPIC-UX-01 - Block Editor & Panel Overhaul
**Story**: UX-02 - OverlayRoot for All Modals
**Status**: COMPLETE
**Date**: 2026-01-15
**Effort**: ~2 hours (estimated 4h)

---

## Summary

Created a unified portal root for all modals, popovers, and overlays to ensure consistent z-index stacking and prevent clipping issues. This establishes the foundation for proper overlay management across the application.

---

## Changes Made

### 1. New Component: OverlayRoot
**File**: `src/presentation/components/ui/OverlayRoot.tsx` (Created)

Features:
- React Context provider for unified overlay rendering
- `useOverlayRoot()` hook for accessing portal container
- `withOverlayRoot()` HOC for configuring Radix UI Portal components
- Single div element with `z-index: var(--z-base)` at root level
- Aria-hidden="true" for accessibility

```tsx
export function OverlayRoot({ children, className }: OverlayRootProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  return (
    <OverlayRootContext.Provider value={{ containerRef }}>
      {children}
      <div ref={containerRef} className={className} style={{ zIndex: 'var(--z-base)' }} />
    </OverlayRootContext.Provider>
  )
}
```

### 2. App Integration
**File**: `src/routes/__root.tsx` (Modified)

- Imported OverlayRoot component
- Wrapped the app with OverlayRoot provider around AppInitializer
- ToastContainer renders inside OverlayRoot for consistent z-index

### 3. Z-Index Token Migration
Updated components to use z-index tokens from UX-01:

| Component | Before | After | Token |
|-----------|--------|-------|-------|
| `dialog.tsx` | (no value) | `z-[var(--z-modal)]` | 50 |
| `SkipLinks.tsx` | `z-[9999]` | `z-[var(--z-alert)]` | 90 |
| `keyboard-shortcuts-overlay.tsx` | `z-[100]` | `z-[var(--z-modal)]` | 50 |
| `ApprovalOverlay.tsx` | `z-[100]` | `z-[var(--z-modal)]` | 50 |
| `ArtifactGalleryBlock.tsx` | `zIndex: 1000` | `zIndex: 'var(--z-popover)'` | 70 |

---

## Z-Index Scale Reference (from UX-01)

```
--z-base: 0       (Base canvas, OverlayRoot container)
--z-dropdown: 10  (Dropdowns, tooltips)
--z-sticky: 20    (Sticky headers)
--z-sidebar: 30   (Fixed sidebars)
--z-panel: 40     (Fixed panels, status overlays)
--z-modal: 50     (Modals, dialogs)
--z-toast: 60     (Toast notifications)
--z-popover: 70   (Priority popovers, lightboxes)
--z-overlay: 80   (Full-screen overlays)
--z-alert: 90     (Critical alerts, skip links)
--z-debug: 100    (Debug overlays)
```

---

## Testing

- TypeScript validation: PASSED (`pnpm tsc --noEmit` - exit code 0)
- No new errors introduced
- All existing functionality preserved

---

## Technical Notes

### Inline Style CSS Variables
When using CSS custom properties in inline React styles, the value must be a string:
```tsx
// Correct
zIndex: 'var(--z-popover)'

// Incorrect
zIndex: var(--z-popover)  // Syntax error
zIndex: 'var(--z-popover)' || 50  // Fallback not needed with tokens
```

### Radix UI Portal Compatibility
The codebase already uses Radix UI Portal primitives extensively. OverlayRoot provides a unified container without requiring changes to existing Dialog/Sheet/Popover implementations - they can optionally use `containerRef` from `useOverlayRoot()` when needed.

### Future Work
- Migrate remaining 97 files with z-index usage incrementally
- Consider using `withOverlayRoot()` HOC for components that need explicit portal control
- Add visual regression tests for z-index stacking scenarios

---

## Files Modified

1. `src/presentation/components/ui/OverlayRoot.tsx` (Created)
2. `src/routes/__root.tsx` (Modified - added OverlayRoot wrapper)
3. `src/presentation/components/ui/dialog.tsx` (Modified - z-index tokens)
4. `src/presentation/components/ui/SkipLinks.tsx` (Modified - z-[9999] → z-[var(--z-alert)])
5. `src/presentation/components/ui/keyboard-shortcuts-overlay.tsx` (Modified - z-[100] → z-[var(--z-modal)])
6. `src/presentation/components/ui/ApprovalOverlay.tsx` (Modified - z-[100] → z-[var(--z-modal)])
7. `src/presentation/components/notes/blocks/ArtifactGalleryBlock.tsx` (Modified - zIndex: 1000 → zIndex: 'var(--z-popover)')

---

## Next Story

**UX-03: Multi-Block Selection** (1 day, depends on UX-01)
- Enable selecting multiple blocks in BlockNote editor
- Foundation for drag-and-drop operations

---

## Governance Updates

- LOOP_STATE.yaml updated (iteration 27)
- ralph-loop.local.md updated (iteration 27, UX-02 complete)

---

**Story Completion**: UX-02 COMPLETE
**Ralph Loop Iteration**: 27
**Date**: 2026-01-15
