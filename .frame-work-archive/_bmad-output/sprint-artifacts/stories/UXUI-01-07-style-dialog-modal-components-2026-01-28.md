# Story: UXUI-01-07 - Style Dialog/Modal Components

**Epic**: EPIC-UXUI-01 (Design System Foundation & 8-bit Styling)
**Story ID**: UXUI-01-07
**Title**: Style Dialog/Modal Components
**Team**: B
**Priority**: P0
**Status**: DONE
**Created**: 2026-01-28
**Effort**: 2-3h

---

## Description

Apply 8-bit design system styling to Dialog and Sheet components following the VIA-GENT Design System specifications. Remove all smooth animations, rounded corners, and blur effects. Replace with pixel shadows, instant/stepped animations, and solid overlays.

---

## Acceptance Criteria

- [x] 8-bit appearance animation (instant or steps())
- [x] Pixel shadow on modal (4px 4px 0 0 or 6px 6px 0 0)
- [x] Backdrop uses solid color, NO backdrop-filter blur
- [x] Z-index from token scale (--z-modal)
- [x] Border-radius: 0 (rounded-none)
- [x] Focus trap working (Radix Dialog handles this)
- [x] Escape key closes (Radix Dialog handles this)
- [x] Passes VALIDATION-CHECKLIST.md

---

## Technical Requirements

### Files to Modify

1. `src/presentation/components/ui/dialog.tsx`
2. `src/presentation/components/ui/sheet.tsx`

### 8-bit Modal Rules (CRITICAL)

| Property | Current | Required |
|----------|---------|----------|
| Backdrop | `bg-[var(--color-overlay)]` | Keep (solid) |
| Border-radius | `rounded-[4px]` | `rounded-none` (0) |
| Shadow | `shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]` | `shadow-[var(--shadow-pixel-lg)]` or `6px_6px_0_0_rgba(0,0,0,0.5)` |
| Animation | `duration-200 ease-out` | `var(--duration-normal)` with `steps()` timing |
| Z-index | `z-50` (hardcoded) | `z-[var(--z-modal)]` |
| Close button radius | `rounded-[4px]` | `rounded-none` |

### Dialog Overlay Changes

```tsx
// BEFORE (line 54)
"fixed inset-0 z-[var(--z-modal)] bg-[var(--color-overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-200"

// AFTER
"fixed inset-0 z-[var(--z-modal)] bg-[var(--color-overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
// Remove: transition-opacity duration-200 (use 8-bit animation instead)
```

### DialogContent Changes

```tsx
// BEFORE (line 68)
"... shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] duration-200 ease-out ... rounded-[4px] ..."

// AFTER
"... shadow-[var(--shadow-pixel-lg)] ... rounded-none ..."
// Remove: duration-200 ease-out (let Radix handle with proper 8-bit timing)
```

### DialogContent CVA Variants Fix

```tsx
// Fix base styles in dialogContentVariants:
// - Remove: rounded-[4px]
// - Change: shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] to shadow-[var(--shadow-pixel-lg)]
// - Remove: duration-200 ease-out

// Fix variant shadows for error/success/warning (keep semantic colors but fix shadow intensity)
```

### Close Button Fix

```tsx
// BEFORE (line 125)
"absolute right-4 top-4 rounded-[4px] ..."

// AFTER
"absolute right-4 top-4 rounded-none ..."
```

### Sheet Component Changes

```tsx
// SheetOverlay (line 37):
// - Keep solid color overlay (already correct)
// - Ensure z-index uses token

// SheetContent (line 59):
// - Change: shadow-pixel → shadow-[var(--shadow-pixel-lg)]
// - Remove: transition ease-in-out
// - Change: data-[state=closed]:duration-300 data-[state=open]:duration-500 → use shorter duration
// - Add: border-2 border-border (if not present)

// SheetClose (line 73):
// - Change: rounded-xs → rounded-none
```

---

## Design Token References

From `src/styles/design-tokens.css`:

```css
--z-modal: 50;                           /* Modal z-index */
--shadow-pixel: 4px 4px 0 0 rgba(0, 0, 0, 0.5);
--shadow-pixel-lg: 6px 6px 0 0 rgba(0, 0, 0, 0.5);
--radius: 0;                              /* Default sharp corners */
--color-overlay: #1a1a1a;                 /* Solid overlay (NOT blur) */
```

From `src/styles/animations.css`:

```css
--timing-8bit: steps(5, end);
--timing-8bit-fast: steps(3, end);
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-slow: 200ms;
```

---

## Validation Checklist (Pre-Completion)

### 8-bit Compliance
- [ ] No `border-radius` > 2px
- [ ] No blur shadows (only `4px 4px 0 0` or `6px 6px 0 0` pixel shadows)
- [ ] No opacity < 0.9 on backgrounds
- [ ] All colors from design tokens (no hardcoded hex)

### Animation Compliance
- [ ] Uses step-based timing `steps(N, end)` or instant
- [ ] Duration ≤ 200ms for micro-interactions
- [ ] Respects `prefers-reduced-motion` media query
- [ ] No smooth easing (`ease-in-out`) - use `steps()` or `linear`

### Accessibility
- [ ] Focus trap working (Tab cycles within modal)
- [ ] Escape key closes modal
- [ ] Focus states visible
- [ ] Screen reader announcements (aria attributes)

---

## Dependencies

- UXUI-01-01: Color tokens (DONE)
- UXUI-01-03: Spacing & Border tokens (DONE)
- UXUI-01-04: Animation tokens (DONE)

---

## Test Scenarios

1. **Open Dialog**: Should appear with 8-bit animation (instant or stepped)
2. **Close Dialog**: Should disappear with matching animation
3. **Backdrop Click**: Should close dialog
4. **Escape Key**: Should close dialog
5. **Tab Navigation**: Focus should stay within dialog
6. **Light Theme**: Check shadow and colors work in both themes
7. **Mobile (320px)**: Verify dialog fits and is usable

---

## Handoff Artifacts

On completion, create:
- `_bmad-output/handoffs/2026-01-28/UXUI-01-07-DEV-REPORT-2026-01-28.md`
- Update sprint-status-2026-01-26.yaml (UXUI-01-07 → DONE)

---

## Notes

- Dialog uses Radix UI primitives which handle focus trap and Escape key
- Keep all existing variant support (size, variant props)
- Keep i18n support for close button aria-label
- The Sheet component follows same patterns as Dialog
