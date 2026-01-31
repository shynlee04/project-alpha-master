# UXUI-01-03: Implement Spacing & Border Tokens

## Story Metadata

| Property | Value |
|----------|-------|
| **Story ID** | UXUI-01-03 |
| **Epic** | EPIC-UXUI-01 (Design System Foundation) |
| **Priority** | P0 |
| **Status** | IN_PROGRESS |
| **Effort** | 1-2 hours |
| **Team** | B (UX) |
| **Assignee** | dev-ext |
| **Started** | 2026-01-27 |
| **Coordinator** | bmad-sprint-manager |

## User Story

**As a** UI developer  
**I want** standardized spacing and border tokens following the 4px grid  
**So that** I can maintain consistent layouts with proper 8-bit aesthetic

## Background Context

### Current State Analysis

**Existing tokens in `design-tokens.css`:**
1. **Spacing tokens (lines 512-521)**: Responsive breakpoint spacing exists but NOT the 4px grid scale
2. **Border radius (lines 421-428)**: Non-compliant with 8-bit rules (has 4px and 6px which are FORBIDDEN)
3. **Pixel shadows (lines 430-435)**: Use 2px offset instead of required 4px
4. **Z-index scale (lines 554-578)**: Already exists with 10-tier scale
5. **Border widths (lines 549-552)**: Already exist as --border-width-1/2/3

### What Needs to Change

1. **ADD** 4px grid spacing scale (--space-0 through --space-16)
2. **FIX** Border radius to ONLY allow 0 and 2px (remove --radius-md, --radius-lg)
3. **UPDATE** Pixel shadows to use 4px offset per 8-bit spec
4. **VERIFY** Z-index scale matches requirements

## 8-bit Design Rules (CRITICAL)

```css
/* ALLOWED */
border-radius: 0;        /* Sharp corners - DEFAULT */
border-radius: 2px;      /* Maximum subtle rounding */
box-shadow: 4px 4px 0 0; /* Pixel shadows - NO blur */
border-width: 1px | 2px; /* Solid borders */

/* FORBIDDEN */
border-radius: 0.5rem;   /* Too rounded */
border-radius: 4px;      /* Too rounded */
border-radius: 6px;      /* Too rounded */
backdrop-filter: blur(); /* No glassmorphism */
box-shadow: blur effects /* No soft shadows */
```

## Acceptance Criteria

- [ ] **AC1**: 4px grid spacing scale implemented (--space-1 = 4px through --space-16 = 64px)
- [ ] **AC2**: Border radius tokens FIXED: only `--radius-none: 0` and `--radius-sm: 2px`
- [ ] **AC3**: Pixel shadow tokens use 4px offset (--shadow-pixel: 4px 4px 0 0)
- [ ] **AC4**: Border width tokens exist (--border-1: 1px, --border-2: 2px)
- [ ] **AC5**: Z-index scale has 12 tiers from 0 to 100
- [ ] **AC6**: Tailwind theme inline section updated to expose new tokens
- [ ] **AC7**: TypeScript: 0 errors introduced
- [ ] **AC8**: Visual regression: No existing UI broken

## Token Requirements

### 1. 4px Grid Spacing (NEW)

```css
/* 4px Grid Spacing Scale - ADD to :root */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 2. Border Radius (CORRECTION)

```css
/* 8-bit Border Radius - REPLACE existing */
--radius: 0;           /* Default - sharp corners */
--radius-none: 0;      /* Explicit sharp corners */
--radius-sm: 2px;      /* MAXIMUM allowed rounding */

/* REMOVE these non-compliant values */
/* --radius-md: 0.25rem;  <- DELETE */
/* --radius-lg: 0.375rem; <- DELETE */
```

### 3. Pixel Shadows (UPDATE)

```css
/* 8-bit Pixel Shadows - UPDATE values */
--shadow-pixel: 4px 4px 0 0 rgba(0, 0, 0, 0.5);
--shadow-pixel-sm: 2px 2px 0 0 rgba(0, 0, 0, 0.5);
--shadow-pixel-lg: 6px 6px 0 0 rgba(0, 0, 0, 0.5);
--shadow-pixel-primary: 4px 4px 0 0 hsl(24.6 95% 53.1%);
--shadow-inset: inset 2px 2px 0 0 rgba(0, 0, 0, 0.3);
```

### 4. Border Widths (VERIFY)

```css
/* Already exist - just verify */
--border-1: 1px;
--border-2: 2px;
```

### 5. Z-Index Scale (VERIFY)

```css
/* Already exists - verify alignment with 12-tier system */
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;       /* May need to add */
--z-modal-backdrop: 40;  /* May need to add */
--z-modal: 50;
--z-popover: 60;     /* Different order than spec */
--z-tooltip: 70;     /* May need to add */
--z-toast: 80;       /* Different value than spec */
--z-max: 100;
```

## Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `src/styles/design-tokens.css` | Add spacing, fix radius, update shadows | P0 |
| `src/styles.css` | Update @theme inline section | P0 |

## Implementation Notes

### Location in design-tokens.css

Add new spacing tokens after the Typography section (around line 170):

```css
/* ==========================================================================
   SPACING TOKENS (UXUI-01-03)
   4px Grid System - Base unit 0.25rem (4px)
   ========================================================================== */
```

### Tailwind Integration

Update `@theme inline` in styles.css to expose:
- `--spacing-*` tokens for Tailwind utilities
- Ensure radius tokens work with Tailwind

## Definition of Done

1. All acceptance criteria marked as complete
2. `pnpm tsc --noEmit` passes with 0 new errors
3. Visual check: No existing UI broken
4. Both `:root` and `.light` theme updated
5. Handoff artifact created

## Dependencies

- **Depends on**: UXUI-01-01 (Color Tokens) - COMPLETE
- **Depends on**: UXUI-01-02 (Typography Tokens) - IN PROGRESS
- **Blocks**: UXUI-01-05+ (Component Styling)

## Time-Box

| Phase | Duration |
|-------|----------|
| Implementation | 45 min |
| Testing | 15 min |
| Documentation | 15 min |
| **Total** | ~1.25 hours |

---

**Created**: 2026-01-27  
**Coordinator**: bmad-sprint-manager  
**Implementer**: dev-ext (delegated)
