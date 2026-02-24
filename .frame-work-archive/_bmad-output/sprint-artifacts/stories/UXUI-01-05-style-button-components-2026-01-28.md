# UXUI-01-05: Style Button Components

**Created**: 2026-01-28
**Status**: DONE
**Completed**: 2026-01-28
**Team**: B (UX)
**Assignee**: dev-ext
**Coordinator**: bmad-sprint-manager
**Epic**: EPIC-UXUI-01 (Design System Foundation)
**Priority**: P0

---

## Story Summary

Update the Button component with 8-bit styling using existing design tokens. Implement pixel-perfect hover/press effects with step-based animations.

---

## Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/presentation/components/ui/button.tsx` | MODIFY | Apply 8-bit styling |

---

## Design Tokens Available

From `src/styles/design-tokens.css`:

```css
/* Animation */
--duration-fast: 100ms;
--duration-normal: 150ms;

/* Shadows */
--shadow-pixel: 4px 4px 0 0 rgba(0, 0, 0, 0.5);
--shadow-pixel-sm: 2px 2px 0 0 rgba(0, 0, 0, 0.5);
--shadow-inset: inset 2px 2px 0 0 rgba(0, 0, 0, 0.3);

/* Radius */
--radius: 0;
--radius-none: 0;
--radius-sm: 2px;  /* MAX allowed */

/* Colors */
--primary: 24.6 95% 53.1%;
--primary-600: 24.6 90.4% 48%;
--primary-700: 24.6 88.5% 40.4%;
--destructive: 0 84% 60%;
--destructive-600: 0 70% 50.6%;
--destructive-700: 0 74% 41.8%;
```

---

## 8-bit Button Behavior

### Hover State
- Transform: `translateY(-2px)` - Button lifts up
- Shadow: Pixel shadow appears (4px 4px 0 0)
- Timing: `steps(2, end)` or instant (100ms)

### Active/Press State
- Transform: `translateY(0)` - Button returns to base
- Shadow: Inset shadow or no shadow (pressed effect)
- Timing: Instant

### Focus State
- Outline: 2px solid primary color
- Offset: 2px
- NO blur/glow

---

## Current Button Implementation Analysis

The button currently uses:
- `rounded-none` - GOOD (8-bit compliant)
- `focus-visible:ring-2` - Needs adjustment for 8-bit focus
- `transition-[background-color,transform] duration-150 ease-out` - Needs step timing

**Missing**:
- Hover translateY effect
- Pixel shadow on hover
- Inset shadow on active/press
- Step-based animation timing

---

## Implementation Requirements

### 1. Update Base Button Styles

```typescript
// Base styles in cva()
const buttonVariants = cva(
  // Add to base:
  // - hover:translate-y-[-2px]
  // - active:translate-y-0
  // - transition with step-based timing
)
```

### 2. Variant-Specific Shadows

| Variant | Normal | Hover | Active |
|---------|--------|-------|--------|
| primary | shadow-[var(--shadow-pixel-sm)] | shadow-[var(--shadow-pixel)] | shadow-none or inset |
| secondary | none | shadow-[var(--shadow-pixel-sm)] | shadow-none |
| destructive | shadow-[var(--shadow-pixel-sm)] | shadow-[var(--shadow-pixel)] | shadow-none or inset |
| outline | none | shadow-[var(--shadow-pixel-sm)] | shadow-none |
| ghost | none | none | none |

### 3. Focus State

```css
focus-visible:outline-2 
focus-visible:outline-primary 
focus-visible:outline-offset-2
/* Remove ring-2, ring-offset - replace with solid outline */
```

### 4. Touch Target

Ensure all button sizes maintain minimum 44x44px touch target:
- sm: min-h-[44px] (currently 32px - NEEDS FIX)
- md: 40px (close, but should be 44px minimum)
- lg: 48px - OK
- xl: 56px - OK

---

## Acceptance Criteria

- [ ] 8-bit hover effect (translateY(-2px), pixel shadow appears)
- [ ] 8-bit press effect (translateY(0), inset shadow or no shadow)
- [ ] All variants (primary, secondary, ghost, outline, destructive) use design tokens
- [ ] Animation uses step-based timing or instant (NO ease-in-out)
- [ ] Touch target minimum 44x44px on all sizes
- [ ] Focus state uses 2px solid outline (no ring/glow)
- [ ] No border-radius > 2px (currently 0 - maintain)
- [ ] TypeScript compiles: `pnpm tsc --noEmit` passes
- [ ] Passes VALIDATION-CHECKLIST.md

---

## Validation Checklist (Run Before Claiming DONE)

### 8-bit Compliance
- [ ] border-radius: 0 or 2px MAX
- [ ] box-shadow: 4px 4px 0 0 format (no blur)
- [ ] No gradients
- [ ] No backdrop-filter: blur()
- [ ] Animation: steps(N, end) or instant
- [ ] Focus ring: 2px solid outline (no glow)

### Responsive Check
- [ ] Touch targets >= 44px on mobile
- [ ] Works at 320px width
- [ ] Works at 768px width
- [ ] Works at 1280px width

### Code Quality
- [ ] No hardcoded colors (#xxx)
- [ ] No inline styles
- [ ] TypeScript compiles
- [ ] Component < 300 lines

---

## Dependencies

- Design tokens already implemented (UXUI-01-01, 01-02, 01-03, 01-04 DONE)
- No backend file conflicts (button.tsx is in safe zone)

---

## References

| Document | Path |
|----------|------|
| Current Button | `src/presentation/components/ui/button.tsx` |
| Design Tokens | `src/styles/design-tokens.css` |
| Micro Animations Spec | `ux-specification/15-micro-animations.md` |
| Validation Checklist | `ux-specification/VALIDATION-CHECKLIST.md` |
| EPIC Definition | `epics/EPIC-UXUI-01-design-system-foundation.md` |

---

## Story Timeline

| Event | Timestamp | Agent |
|-------|-----------|-------|
| Created | 2026-01-28 | bmad-sprint-manager |
| Assigned to dev-ext | 2026-01-28 | bmad-sprint-manager |
| Status: IN_PROGRESS | 2026-01-28 | bmad-sprint-manager |

---

**Lines**: ~180
