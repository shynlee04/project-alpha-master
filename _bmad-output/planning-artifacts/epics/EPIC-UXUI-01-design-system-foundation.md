---
id: EPIC-UXUI-01
title: Design System Foundation & 8-bit Styling
version: 1.0.0
created: 2026-01-27
status: READY_FOR_EXECUTION
priority: P1
owner: Team B (UX)
blocked_by: null
blocks: EPIC-UXUI-02
estimated_effort: 18-26h
sprint: null
ux_spec_version: 3.0.0
---

# EPIC-UXUI-01: Design System Foundation & 8-bit Styling

## Overview

Implement the foundational design system based on UX Specification v3.0.0, including CSS design tokens, animation utilities, and 8-bit styling compliance for all UI primitives. This epic establishes the visual foundation that all subsequent UX/UI work builds upon.

### Visual Style Reference

```
+===============================================================+
|                    8-BIT UI QUICK REFERENCE                    |
+===============================================================+

CORNERS:   rounded-none (0px) or rounded-sm (2px) MAX
SHADOWS:   shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] only
COLORS:    tokens only (text-primary, bg-card, etc.)
SPACING:   4px grid (p-2=8px, p-4=16px, gap-3=12px)
FONTS:     font-mono (UI), font-pixel (headings)
ANIMATION: steps(5, end) or linear, max 300ms
OPACITY:   1.0 always (except modal backdrop, disabled)

NEVER: blur shadows, gradients, rounded-lg, backdrop-blur
+===============================================================+
```

---

## Success Criteria

1. All CSS design tokens implemented in `src/styles.css`
2. Animation tokens with step-based timing functions (steps(N, end))
3. Light theme token structure ready (not enabled by default)
4. All ShadcnUI primitives styled with 8-bit compliance
5. VALIDATION-CHECKLIST.md passes for all updated components
6. Zero inline style violations in updated components
7. `pnpm tsc --noEmit && pnpm vitest run` passes

---

## DO NOT DISTURB

These files are owned by backend teams and must NOT be modified:

| File | Owner | Reason |
|------|-------|--------|
| `src/infrastructure/context/project-context.tsx` | Team A | FSA Handle Lifecycle (CC-01) |
| `src/routes/$projectId.tsx` | Team A | Route FSA integration |
| `src/presentation/components/layout/PermissionOverlay.tsx` | Team A | Permission persistence |
| `src/infrastructure/context/plugin-coordination-context.tsx` | Team A | EPIC-0.6 Complete |
| `src/infrastructure/events/file-event-bus.ts` | Team B | File event infrastructure |
| `src/infrastructure/webcontainer/*.ts` | Team B | WebContainer integration |

---

## Stories

### Phase 1: Foundation (Team B) - 6-10h

#### UXUI-01-01: Implement Color Design Tokens

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/styles.css`, `src/styles/design-tokens.css` |

**Description**:
Implement all color tokens from UX Specification v3.0.0 Section 03 (Design Tokens). Must use CSS custom properties with semantic naming.

**Token Categories**:
- Primary: Orange (#f97316)
- Neutrals: Stone/Zinc palette
- Semantic: Success (green), Warning (amber), Error (red), Info (blue)
- Surface hierarchy: bg-0 (deepest) through bg-3 (elevated)

**Acceptance Criteria**:
- [ ] All color tokens from `ux-specification/03-design-tokens.md` implemented
- [ ] CSS custom properties for primary, neutral, semantic colors
- [ ] Surface hierarchy (--bg-0 through --bg-3)
- [ ] No hardcoded hex values in token file
- [ ] Dark theme as default
- [ ] Token names follow kebab-case convention

---

#### UXUI-01-02: Implement Typography Tokens

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 1-2h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/styles.css`, `tailwind.config.ts` |

**Description**:
Define typography system with 3 font families and responsive scale.

**Font Families**:
- `JetBrains Mono` - UI and code (monospace)
- `VT323` - Pixel decorative (headings, badges)
- `Inter` - Prose and long-form text

**Acceptance Criteria**:
- [ ] Font families defined: VT323, JetBrains Mono, Inter
- [ ] Font size scale (--text-xs through --text-3xl)
- [ ] Line height adjustments for Vietnamese text (1.6 minimum)
- [ ] Letter spacing tokens (--tracking-tight, --tracking-normal, --tracking-wide)
- [ ] Tailwind config references CSS variables

---

#### UXUI-01-03: Implement Spacing & Border Tokens

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 1-2h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/styles.css` |

**Description**:
Define 4px grid spacing system and 8-bit border tokens.

**8-bit Rules**:
- Border radius: 0 or 2px ONLY (never rounded-lg, rounded-md)
- Shadows: `4px 4px 0 0` pixel shadows (no blur)
- Borders: 1px or 2px solid

**Acceptance Criteria**:
- [ ] 4px grid spacing scale (--space-1 = 4px through --space-16 = 64px)
- [ ] Border radius tokens: `--radius-none: 0`, `--radius-sm: 2px` (ONLY these two)
- [ ] Pixel shadow tokens (--shadow-pixel: 4px 4px 0 0)
- [ ] Border width tokens (--border-1, --border-2)
- [ ] Z-index scale (12 tiers from 0 to 100)

---

#### UXUI-01-04: Implement Animation Tokens

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/styles.css`, `src/styles/animations.css` |

**Description**:
Define 8-bit step-based animations that avoid smooth easing. All animations must use `steps(N, end)` timing function.

**Animation Requirements**:
- Timing: `steps(5, end)` or `linear` ONLY
- Duration: fast (100ms), normal (200ms), slow (300ms)
- No bounce, ease-in-out, or spring animations
- Respect `prefers-reduced-motion`

**Acceptance Criteria**:
- [ ] Step-based timing functions (--timing-8bit: steps(5, end))
- [ ] Duration tokens (--duration-fast, --duration-normal, --duration-slow)
- [ ] @keyframes for 8-bit animations (pixel-bounce, pixel-fade, pixel-slide)
- [ ] `prefers-reduced-motion: reduce` support (disable non-essential animations)
- [ ] Animation utility classes (.animate-8bit-hover, .animate-8bit-press)

---

### Phase 2: UI Primitives (Team B) - 12-16h

#### UXUI-01-05: Style Button Components

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/presentation/components/ui/button.tsx` |

**Description**:
Update Button component with 8-bit styling. High-impact component with 160+ imports across codebase.

**8-bit Button Effects**:
- Hover: `translateY(-2px)` + pixel shadow
- Press/Active: `translateY(0)` + inset shadow
- Focus: 2px solid primary outline

**Acceptance Criteria**:
- [ ] 8-bit hover effect (translateY(-2px), pixel shadow appears)
- [ ] 8-bit press effect (translateY(0), inset shadow)
- [ ] All variants (default, destructive, outline, secondary, ghost, link) use design tokens
- [ ] Animation uses steps() timing or instant
- [ ] Touch target minimum 44x44px
- [ ] Passes VALIDATION-CHECKLIST.md
- [ ] No border-radius > 2px

---

#### UXUI-01-06: Style Input Components

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/presentation/components/ui/input.tsx`, `textarea.tsx`, `select.tsx` |

**Description**:
Update input, textarea, and select components with consistent 8-bit focus states.

**Acceptance Criteria**:
- [ ] 8-bit focus states (pixel outline, no glow/blur)
- [ ] Pixel shadow on focus (4px 4px 0 0)
- [ ] Border-radius 0 or 2px only
- [ ] Consistent placeholder styling
- [ ] Error state with red pixel border
- [ ] Disabled state with reduced opacity
- [ ] Passes VALIDATION-CHECKLIST.md

---

#### UXUI-01-07: Style Dialog/Modal Components

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 2-3h |
| **Priority** | P0 |
| **Team** | B |
| **Files** | `src/presentation/components/ui/dialog.tsx`, `sheet.tsx` |

**Description**:
Update dialog and sheet (drawer) components with 8-bit appearance.

**8-bit Modal Rules**:
- Backdrop: solid semi-transparent (rgba), NO blur
- Entrance: instant or steps() animation
- Modal box: pixel shadow, 0 border-radius

**Acceptance Criteria**:
- [ ] 8-bit appearance animation (instant or steps())
- [ ] Pixel shadow on modal (4px 4px 0 0)
- [ ] Backdrop uses solid color, NO backdrop-filter blur
- [ ] Z-index from token scale (--z-modal)
- [ ] Focus trap working
- [ ] Escape key closes
- [ ] Passes VALIDATION-CHECKLIST.md

---

#### UXUI-01-08: Style Remaining UI Primitives

| Property | Value |
|----------|-------|
| **Status** | READY |
| **Effort** | 3-4h |
| **Priority** | P1 |
| **Team** | B |
| **Files** | `src/presentation/components/ui/*.tsx` |

**Description**:
Sweep through all remaining UI primitives to ensure 8-bit compliance.

**Components to Update**:
- `card.tsx` - Pixel shadow, 0 radius
- `tabs.tsx` - 8-bit tab indicators
- `badge.tsx` - Pixel font option
- `tooltip.tsx` - Instant/steps appearance
- `popover.tsx` - Pixel shadow
- `dropdown-menu.tsx` - Consistent with dialog
- `toast/*.tsx` - 8-bit toast styling
- `skeleton.tsx` - 8-bit loading animation

**Acceptance Criteria**:
- [ ] All remaining primitives pass VALIDATION-CHECKLIST.md
- [ ] Consistent 8-bit styling (0/2px radius, pixel shadows)
- [ ] No inline styles (all via CSS classes/tokens)
- [ ] All colors from tokens (no hardcoded hex)
- [ ] Animation timing uses steps()
- [ ] Touch targets >= 44px where applicable

---

## Dependencies

### Depends On
- None (greenfield safe zone - this epic establishes foundation)

### Blocks
- **EPIC-UXUI-02**: Common Components (needs design tokens)
- **EPIC-UXUI-03**: Feature Components (needs UI primitives)
- **EPIC-UXUI-04**: Global Components (needs full foundation)

---

## Coordination Matrix

| UX Task | Backend Task | Action | Notes |
|---------|--------------|--------|-------|
| Any layout changes | CC-AR-04 | WAIT | Toggle layout replaces drag-drop |
| Route styling | CC-04 | Coordinate | FSA E2E must pass first |
| Plugin area styling | CC-AR-08 | WAIT | PluginLayout split in progress |
| i18n string additions | CC-AR-01 | Coordinate | i18n keys being added |

### Safe Parallel Work

These files are 100% safe for UX work without coordination:
- `src/styles.css`
- `src/styles/*.css`
- `src/presentation/components/ui/*.tsx`

---

## Validation Checklist

Before marking any story DONE, verify:

```markdown
### 8-bit Style Validation
- [ ] border-radius: 0 or 2px MAX (no rounded-md, rounded-lg)
- [ ] box-shadow: 4px 4px 0 0 format (no blur shadows)
- [ ] No gradients anywhere
- [ ] No backdrop-filter: blur()
- [ ] Colors from CSS variables only
- [ ] Animation: steps(N, end) or linear only
- [ ] Focus ring: 2px solid var(--primary)
- [ ] Opacity: 1.0 (except backdrop, disabled states)

### Code Quality
- [ ] No hardcoded colors (#xxx)
- [ ] No inline styles
- [ ] TypeScript compiles (pnpm tsc --noEmit)
- [ ] Tests pass (pnpm vitest run)
- [ ] Responsive at 320px, 768px, 1280px

### Accessibility
- [ ] Touch targets >= 44x44px
- [ ] Focus states visible
- [ ] Color contrast >= 4.5:1
- [ ] prefers-reduced-motion respected
```

---

## References

| Document | Path |
|----------|------|
| UX Specification Index | `_bmad-output/planning-artifacts/ux-specification/index.md` |
| Design Tokens | `_bmad-output/planning-artifacts/ux-specification/03-design-tokens.md` |
| Validation Checklist | `_bmad-output/planning-artifacts/ux-specification/VALIDATION-CHECKLIST.md` |
| Light Theming | `_bmad-output/planning-artifacts/ux-specification/14-light-theming.md` |
| Micro Animations | `_bmad-output/planning-artifacts/ux-specification/15-micro-animations.md` |
| Implementation Roadmap | `_bmad-output/planning-artifacts/ux-ui-implementation-roadmap-2026-01-27.md` |
| DO NOT DISTURB | `_bmad-output/analysis/do-not-disturb-zones-2026-01-27.md` |

---

## Progress Tracking

| Story | Status | Assignee | Started | Completed |
|-------|--------|----------|---------|-----------|
| UXUI-01-01 | READY | - | - | - |
| UXUI-01-02 | READY | - | - | - |
| UXUI-01-03 | READY | - | - | - |
| UXUI-01-04 | READY | - | - | - |
| UXUI-01-05 | READY | - | - | - |
| UXUI-01-06 | READY | - | - | - |
| UXUI-01-07 | READY | - | - | - |
| UXUI-01-08 | READY | - | - | - |

**Epic Progress**: 0/8 stories complete (0%)

---

**Created**: 2026-01-27
**Author**: bmad-sprint-manager
**Task ID**: PH2-T25A
**Lines**: ~350
