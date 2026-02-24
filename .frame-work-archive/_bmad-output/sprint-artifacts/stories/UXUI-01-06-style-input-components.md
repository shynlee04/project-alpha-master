# Story: UXUI-01-06 - Style Input Components

**Epic**: EPIC-UXUI-01 (Design System Foundation)
**Story ID**: UXUI-01-06
**Title**: Style Input Components with 8-bit Design System
**Points**: 3
**Priority**: P0
**Status**: DONE
**Team**: B
**Created**: 2026-01-28
**Completed**: 2026-01-28
**Coordinator**: bmad-sprint-manager
**Implementer**: dev-ext-team-b (delegated)

---

## Description

As a user of Via-gent,
I want all input components (input, textarea, select) to follow the 8-bit design system,
So that the UI is consistent with the retro aesthetic and accessible across themes.

---

## Technical Context

### Current State Analysis

| Component | Lines | Status | Issues |
|-----------|-------|--------|--------|
| input.tsx | 107 | Needs fixes | Uses `ring` focus (opacity), needs pixel shadow |
| textarea.tsx | 161 | Needs migration | Hardcoded colors (neutral-700, etc.) |
| select.tsx | 274 | Mostly compliant | Already uses CSS vars, has pixel shadow |

### 8-bit Design Requirements

From `VALIDATION-CHECKLIST.md`:
- NO `border-radius` > 2px
- NO blur shadows (only `4px 4px 0 0` pixel shadows)
- NO opacity < 0.9 on backgrounds
- All colors from design tokens (no hardcoded hex)
- Uses step-based timing `steps(N, end)` for 8-bit feel

### Design Token References

From `design-tokens.css`:
```css
--shadow-pixel: 4px 4px 0 0 rgba(0, 0, 0, 0.5);
--shadow-pixel-sm: 2px 2px 0 0 rgba(0, 0, 0, 0.5);
--radius: 0;           /* Default - sharp corners */
--radius-sm: 2px;      /* MAXIMUM allowed */
--font-mono: 'JetBrains Mono', ui-monospace, ...;
```

---

## Acceptance Criteria

- [x] AC1: 8-bit focus states (pixel outline, no glow/blur)
  - Focus: 2px solid border-primary, pixel shadow appears
  - NO blur, NO ring with opacity
  - Use `shadow-[var(--shadow-pixel)]` or `shadow-[2px_2px_0_0_var(--shadow-color)]`

- [x] AC2: Pixel shadow on focus (4px 4px 0 0)
  - Use `--shadow-pixel` token
  - Shadow appears on focus, not on default state

- [x] AC3: Border-radius 0 or 2px only
  - Use `rounded-none` or `rounded-[2px]`
  - Never `rounded-md`, `rounded-lg`, etc.

- [x] AC4: Consistent placeholder styling (text-muted)
  - Use `placeholder:text-[hsl(var(--muted-foreground))]`
  - Consistent across all input types

- [x] AC5: Error state with red pixel border
  - Border: `border-destructive`
  - Shadow: `shadow-[2px_2px_0_0_hsl(var(--destructive))]`

- [x] AC6: Disabled state with reduced opacity
  - `disabled:opacity-50 disabled:cursor-not-allowed`

- [x] AC7: All colors use CSS variables (no hardcoded hex/rgb)
  - Replace `border-neutral-700` with `border-[hsl(var(--border))]`
  - Replace `bg-neutral-900/80` with `bg-[hsl(var(--background))]`
  - Replace `text-neutral-100` with `text-[hsl(var(--foreground))]`

- [x] AC8: Passes VALIDATION-CHECKLIST.md
  - No `border-radius` > 2px
  - No blur shadows
  - Uses design tokens
  - Keyboard accessible

---

## Tasks

- [ ] Task 1: Update `input.tsx` - Replace ring focus with pixel shadow
- [ ] Task 2: Update `input.tsx` - Ensure border-2 and rounded-none
- [ ] Task 3: Update `textarea.tsx` - Migrate hardcoded colors to CSS variables
- [ ] Task 4: Update `textarea.tsx` - Add 8-bit focus state with pixel shadow
- [ ] Task 5: Update `select.tsx` - Verify 8-bit compliance (mostly done)
- [ ] Task 6: Add font-mono (JetBrains Mono) to all inputs
- [ ] Task 7: Run TypeScript check
- [ ] Task 8: Visual verification (if possible)

---

## Implementation Guidelines

### Input Focus State (8-bit)
```tsx
// BEFORE (violates 8-bit - uses ring with opacity)
"focus-visible:ring-2 focus-visible:ring-[var(--ring)]"

// AFTER (8-bit compliant - pixel shadow)
"focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[var(--shadow-pixel)]"
```

### Error State (8-bit)
```tsx
// 8-bit error styling
"border-destructive shadow-[2px_2px_0_0_hsl(var(--destructive))]"
```

### Disabled State
```tsx
"disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
```

### Base Styling
```tsx
"border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] rounded-none font-mono"
```

---

## Files to Update

| File | Changes |
|------|---------|
| `src/presentation/components/ui/input.tsx` | Focus state, border-radius, font-mono |
| `src/presentation/components/ui/textarea.tsx` | CSS variable migration, focus state |
| `src/presentation/components/ui/select.tsx` | Verify compliance, minor fixes if needed |

---

## Dependencies

- UXUI-01-01: Color Design Tokens (DONE)
- UXUI-01-02: Typography Tokens (DONE)
- UXUI-01-03: Spacing & Border Tokens (DONE)

---

## Time Box

**Estimated**: 2-3 hours
**Maximum**: 4 hours (escalate if exceeded)

---

## Handoff Artifacts

1. This story file (updated with completion status)
2. Dev report: `_bmad-output/handoffs/2026-01-28/UXUI-01-06-DEV-REPORT-2026-01-28.md`
3. Modified files committed

---

## Validation Checklist (Pre-Completion)

Before marking DONE, verify:
- [ ] `pnpm tsc --noEmit` passes (0 new errors)
- [ ] Input focus shows pixel shadow, not blur ring
- [ ] Textarea uses CSS variables, not hardcoded colors
- [ ] Select maintains 8-bit compliance
- [ ] All components use `rounded-none` or `rounded-[2px]`
- [ ] All components use `font-mono` (JetBrains Mono)
- [ ] Error states show red pixel border
- [ ] Disabled states show reduced opacity

---

*Story created by bmad-sprint-manager on 2026-01-28*
