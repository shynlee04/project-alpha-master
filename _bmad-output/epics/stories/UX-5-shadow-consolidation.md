# Story UX-5: Shadow Consolidation

**Epic:** EPIC-UX: System-Wide UX Remediation
**Status:** drafted
**Priority:** P2 - Medium
**Points:** 2
**Estimated:** 1 hour
**Created:** 2026-01-09
**Source:** `_bmad-output/ux-scan-results.md`

---

## User Story

As a user,
I want consistent pixel-style shadows throughout the application,
So that the 8-bit aesthetic is maintained with hard drop shadows instead of soft blur shadows.

---

## Problem Statement

The codebase contains **soft shadow violations** using Tailwind's default `shadow-md`, `shadow-lg` instead of the required pixel-style shadows (`--shadow-pixel`, `--shadow-pixel-sm`). These soft shadows violate the 8-bit aesthetic requirements.

---

## Context

- **Reference:** `_bmad-output/ux-scan-results.md` (Section 6)
- **Design Tokens:** `src/styles/design-tokens.css`
- **Required Shadows:**
  - `--shadow-pixel: 2px 2px 0px 0px rgba(0,0,0,0.5)`
  - `--shadow-pixel-primary: 2px 2px 0px 0px #c2410c`
  - `--shadow-pixel-sm: 1px 1px 0px 0px rgba(0,0,0,0.5)`

---

## Acceptance Criteria

### AC-1: Audit Soft Shadow Usage ✅
- [ ] Search for `shadow-md`, `shadow-lg`, `shadow-xl` in components
- [ ] Identify files using non-pixel shadows
- [ ] Document findings

### AC-2: Replace Default Shadows ✅
- [ ] Update any components using `shadow-md` with `--shadow-pixel`
- [ ] Update any components using `shadow-lg` with `--shadow-pixel-lg`
- [ ] Update any components using `shadow-xl` with `--shadow-pixel`

### AC-3: Verify Design Token Usage ✅
- [ ] Verify `--shadow-pixel` is defined and used
- [ ] Verify `--shadow-pixel-primary` is defined and used
- [ ] Verify `--shadow-pixel-sm` is defined and used

### AC-4: Animation Shadows ✅
- [ ] Review `src/styles/animations.css` for shadow patterns
- [ ] Update any soft shadows to pixel style

### AC-5: Validation ✅
- [ ] Build passes without errors
- [ ] No `shadow-md`, `shadow-lg`, `shadow-xl` in component files
- [ ] All shadows use design token variables

---

## Tasks

### Task 1: Shadow Audit (15 min)
- [ ] Search for shadow classes in components
- [ ] Identify violations
- [ ] Document findings

### Task 2: Replace Soft Shadows (30 min)
- [ ] Update components using `shadow-md`
- [ ] Update components using `shadow-lg`
- [ ] Update components using `shadow-xl`

### Task 3: Animation Shadow Review (10 min)
- [ ] Review animations.css for shadow patterns
- [ ] Update soft shadows to pixel style

### Task 4: Validation (5 min)
- [ ] Run `pnpm build`
- [ ] Verify no non-pixel shadows remain

---

## Technical Notes

### Shadow Replacement Pattern
```tsx
// BEFORE (soft shadow)
<div className="shadow-md ...">

// AFTER (pixel shadow)
<div className="shadow-pixel ...">
// or
<div className="shadow-[var(--shadow-pixel)] ...">
```

### Design Token Definitions (from design-tokens.css)
```css
:root {
  --shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
  --shadow-pixel-sm: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-lg: 4px 4px 0px 0px rgba(0, 0, 0, 0.4);
}
```

### Search Commands
```bash
# Find soft shadow usage
grep -r "shadow-md\|shadow-lg\|shadow-xl" src/ --include="*.tsx" --include="*.ts"
```

---

## Dev Notes

**Reference:** `_bmad-output/project-planning-artifacts/architecture.md`

### Architecture Patterns
- Follow **pixel shadow** pattern (`--shadow-pixel`, `--shadow-pixel-sm`)
- Replace soft shadows (`shadow-md`, `shadow-lg`) with pixel shadows
- Use design token variables for consistency

### Component Patterns
- `shadow-pixel: 2px 2px 0px 0px rgba(0,0,0,0.5)` - standard
- `shadow-pixel-primary: 2px 2px 0px 0px #c2410c` - primary color
- `shadow-pixel-sm: 1px 1px 0px 0px rgba(0,0,0,0.5)` - small elements

---

## Research Requirements

- [ ] Review design-tokens.css for shadow definitions
- Check existing shadow-pixel usage patterns

---

## Dependencies

- None - can be done independently

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression | Low | Take before/after screenshots |

---

## Definition of Done

- [ ] No `shadow-md`, `shadow-lg`, `shadow-xl` in component files
- [ ] All shadows use design token variables
- [ ] Build passes without errors
- [ ] Visual testing confirms pixel shadow aesthetic
- [ ] Story file updated with completion timestamp

---

## Files Modified

- Component files with soft shadows - Replace with pixel shadows
- `src/styles/animations.css` - Update shadow patterns (if needed)

---

## Notes

- Some third-party components may use their own shadows - these are out of scope
- Animation shadows in animations.css may need special handling for performance

---

**Created:** 2026-01-09  
**Last Updated:** 2026-01-09
