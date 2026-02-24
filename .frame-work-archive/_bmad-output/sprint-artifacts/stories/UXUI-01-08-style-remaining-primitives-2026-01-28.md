# Story: UXUI-01-08 - Style Remaining UI Primitives

**Epic**: EPIC-UXUI-01 (Design System Foundation)
**Story ID**: UXUI-01-08
**Title**: Style Remaining UI Primitives (8-bit Sweep)
**Priority**: P1
**Effort**: 3-4h
**Team**: B
**Created**: 2026-01-28
**Status**: DONE

---

## Story Description

As a developer building the VIA-GENT application,
I want all remaining UI primitives to follow the 8-bit design system,
So that the entire component library has consistent styling with pixel shadows, sharp corners, and step-based animations.

---

## Components to Update

### Target Files (7 Components)

| File | Current Issues | Required Changes |
|------|---------------|------------------|
| `card.tsx` | Uses `ease-out` timing | Change to `steps(5, end)` for transitions |
| `tabs.tsx` | Has `rounded-[4px]`, uses `ease-out` | Change to `rounded-none` or `rounded-sm`, use steps timing |
| `badge.tsx` | Has `rounded-[4px]`, uses `ease-out` | Change to `rounded-none` or `rounded-sm`, use steps timing |
| `tooltip.tsx` | Uses fade/zoom animations | Add `shadow-pixel-sm`, use instant or steps-based appearance |
| `dropdown-menu.tsx` | Already compliant | Verify `rounded-sm` on items, ensure steps animation |
| `sonner.tsx` | Mostly compliant | Add steps-based slide animation |
| `skeleton.tsx` | Has `rounded-md`, uses `animate-pulse` | Change to `rounded-none`, use 8-bit flicker animation |

**Note**: `popover.tsx` does not exist in codebase - skip this component.

---

## Implementation Requirements

### 8-bit Rules (NON-NEGOTIABLE)

```yaml
Border Radius:
  - Maximum: 2px (rounded-sm in Tailwind)
  - Preferred: 0px (rounded-none in Tailwind)
  - NEVER: rounded-md, rounded-lg, rounded-[4px]+

Shadows:
  - Use: var(--shadow-pixel) = "4px 4px 0 0 rgba(0,0,0,0.5)"
  - Use: var(--shadow-pixel-sm) = "2px 2px 0 0 rgba(0,0,0,0.5)"
  - NEVER: blur shadows, rgba() with blur

Animation Timing:
  - Use: steps(5, end), steps(3, end), steps(2, end)
  - Use: var(--timing-8bit) = steps(5, end)
  - NEVER: ease-in-out, ease-out, ease-in, linear (for most cases)
  - Exception: linear for continuous animations like spinners

Duration:
  - Fast: 100ms (hover, focus)
  - Normal: 150ms (transitions)
  - Slow: 200ms (complex animations)

Colors:
  - ALWAYS use CSS variables: var(--primary), var(--border), etc.
  - NEVER hardcoded hex values
```

### Per-Component Specifications

#### 1. card.tsx
```tsx
// Change transition timing from ease-out to steps
// Current: "transition-[border-color,background-color,shadow] duration-150 ease-out"
// Required: "transition-[border-color,background-color,shadow] duration-150"
// Add: [transition-timing-function:steps(5,end)]

// Card already has rounded-none and border-2 - KEEP these
```

#### 2. tabs.tsx
```tsx
// TabsList:
// Current: "rounded-[4px]"
// Required: "rounded-none" or "rounded-sm"
// Current: "duration-150" (implicit ease)
// Required: Add [transition-timing-function:steps(5,end)]

// TabsTrigger:
// Current: "duration-150 ease-out"
// Required: "duration-150 [transition-timing-function:steps(5,end)]"
```

#### 3. badge.tsx
```tsx
// Current: "rounded-[4px]"
// Required: "rounded-none" or "rounded-sm"

// Current: "duration-150 ease-out"
// Required: "duration-150 [transition-timing-function:steps(5,end)]"
```

#### 4. tooltip.tsx
```tsx
// Add pixel shadow:
// "shadow-[var(--shadow-pixel-sm)]"

// Change animations to instant or steps:
// Remove: "animate-in fade-in-0 zoom-in-95"
// Add: "animate-in [animation-timing-function:steps(3,end)]" or remove animation entirely
// Alternative: Keep animation but ensure steps timing
```

#### 5. dropdown-menu.tsx
```tsx
// Already has shadow-[var(--shadow-pixel)] and rounded-none - GOOD
// Items have "rounded-sm" - acceptable

// Verify animation timing uses steps:
// Current: "data-[state=open]:animate-in" 
// Ensure timing is steps-based in CSS
```

#### 6. sonner.tsx
```tsx
// Already has shadow-pixel and rounded-none - GOOD
// Verify animation timing

// Add steps timing if needed:
// toastOptions classNames should include [animation-timing-function:steps(5,end)]
```

#### 7. skeleton.tsx
```tsx
// Current: "rounded-md"
// Required: "rounded-none"

// Current: "animate-pulse"
// Required: Custom 8-bit flicker animation OR steps-based pulse

// Add custom class:
// "animate-[8bit-flicker_500ms_steps(3,end)_infinite]"
// OR define keyframes in CSS:
// @keyframes 8bit-pulse {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.5; }
// }
```

---

## Acceptance Criteria

- [x] All 7 components pass VALIDATION-CHECKLIST.md
- [x] No `rounded-[4px]` or larger - only `rounded-none` or `rounded-sm`
- [x] No `ease-out`, `ease-in-out`, `ease-in` in transitions
- [x] All transitions use `steps(N, end)` timing function
- [x] All shadows use `var(--shadow-pixel)` or `var(--shadow-pixel-sm)`
- [x] No hardcoded hex colors
- [x] TypeScript compiles with 0 new errors (13 pre-existing)
- [x] Animation durations <= 200ms for micro-interactions
- [x] skeleton.tsx uses steps-based or 8-bit flicker animation

---

## Reference Files

- Design Tokens: `src/styles/design-tokens.css`
- Validation: `_bmad-output/planning-artifacts/ux-specification/VALIDATION-CHECKLIST.md`
- Animation Spec: `_bmad-output/planning-artifacts/ux-specification/15-micro-animations.md`
- Global Components: `_bmad-output/planning-artifacts/ux-specification/05-global-components.md`

---

## Dev Notes

### CSS Class for Steps Timing
Tailwind arbitrary syntax: `[transition-timing-function:steps(5,end)]`

### Animation Keyframes for Skeleton
Add to `src/styles.css` or `design-tokens.css`:
```css
@keyframes 8bit-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-8bit-pulse {
  animation: 8bit-pulse 500ms steps(3, end) infinite;
}
```

### prefers-reduced-motion
All animations must respect:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-8bit-pulse {
    animation: none;
  }
}
```

---

## Handoff Requirements

After implementation:
1. Run `pnpm tsc --noEmit` - must pass
2. Verify each component visually
3. Update sprint-status-2026-01-26.yaml (UXUI-01-08 → DONE)
4. Update EPIC progress to 100% (8/8 stories)
5. Create handoff artifact

---

**Story Owner**: bmad-sprint-manager
**Implementer**: dev-ext-team-b
