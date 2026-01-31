---
id: UXUI-01-04
epic: EPIC-UXUI-01
title: Implement Animation Tokens
status: DONE
priority: P0
effort: 2-3h
team: B
started: 2026-01-27
completed: 2026-01-27
---

# UXUI-01-04: Implement Animation Tokens

## Description

Implement authentic 8-bit animation tokens with step-based timing functions, duration tokens, keyframe definitions, and utility classes. All animations MUST respect `prefers-reduced-motion` for accessibility compliance.

## 8-bit Animation Rules (CRITICAL)

| Rule | Implementation |
|------|----------------|
| **Timing** | `steps(N, end)` or `linear` ONLY |
| **Duration** | fast (100ms), normal (200ms), slow (300ms) |
| **Motion** | Frame-by-frame, NO smooth easing |
| **Values** | Whole pixels only (no sub-pixel) |
| **Accessibility** | MUST respect `prefers-reduced-motion` |

## Files to Modify

- `src/styles/design-tokens.css` - Add duration tokens to `:root`
- `src/styles/animations.css` - Add timing functions, keyframes, utility classes
- `src/styles.css` - Ensure proper import order

## Token Definitions

### Duration Tokens (design-tokens.css)
```css
/* === Animation Durations === */
--duration-instant: 0ms;             /* No animation */
--duration-fastest: 50ms;            /* Micro-interactions */
--duration-fast: 100ms;              /* Quick feedback */
--duration-normal: 150ms;            /* Standard transitions */
--duration-slow: 200ms;              /* Deliberate animations */
--duration-slower: 300ms;            /* Complex animations */
--duration-slowest: 500ms;           /* Page transitions */
```

### Timing Functions (animations.css)
```css
/* === Step-Based Timing (8-bit Authentic) === */
--timing-8bit: steps(5, end);                      /* Default 8-bit */
--timing-8bit-fast: steps(3, end);                 /* Quick 8-bit */
--timing-8bit-snap: steps(2, end);                 /* Instant snap */
--timing-8bit-smooth: steps(8, end);               /* Smoother 8-bit */

/* === Smooth Alternatives (Use Sparingly) === */
--timing-linear: linear;                           /* Continuous motion */
```

### Delay Tokens (animations.css)
```css
/* === Animation Delays === */
--delay-none: 0ms;
--delay-short: 50ms;
--delay-medium: 100ms;
--delay-long: 200ms;

/* === Stagger Delays (for lists) === */
--stagger-1: 0ms;
--stagger-2: 50ms;
--stagger-3: 100ms;
--stagger-4: 150ms;
--stagger-5: 200ms;
--stagger-6: 250ms;
```

### Required Keyframes (animations.css)
```css
/* 8-bit fade with step effect */
@keyframes pixel-fade-in {
  0% { opacity: 0; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

/* 8-bit slide up with pixel steps */
@keyframes pixel-slide-up {
  0% { transform: translateY(4px); opacity: 0; }
  50% { transform: translateY(2px); opacity: 0.5; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 8-bit bounce (whole pixels only) */
@keyframes pixel-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* 8-bit pulse */
@keyframes pixel-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Required Utility Classes (animations.css)
```css
/* Hover animation utility */
.animate-8bit-hover {
  transition: transform var(--duration-fast) var(--timing-8bit),
              box-shadow var(--duration-fast) var(--timing-8bit);
}

/* Press/click animation utility */
.animate-8bit-press {
  transition: transform var(--duration-instant);
}

/* Pixel fade animation */
.animate-pixel-fade-in {
  animation: pixel-fade-in var(--duration-normal) var(--timing-8bit) forwards;
}

/* Pixel slide animation */
.animate-pixel-slide-up {
  animation: pixel-slide-up var(--duration-slow) var(--timing-8bit) forwards;
}

/* Pixel bounce animation */
.animate-pixel-bounce {
  animation: pixel-bounce var(--duration-slow) var(--timing-8bit) infinite;
}

/* Pixel pulse animation */
.animate-pixel-pulse {
  animation: pixel-pulse 1s var(--timing-8bit-smooth) infinite;
}
```

### Reduced Motion Support (CRITICAL - animations.css)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Acceptance Criteria

- [ ] Step-based timing functions (--timing-8bit: steps(5, end))
- [ ] Duration tokens (--duration-fast, --duration-normal, --duration-slow)
- [ ] @keyframes for 8-bit animations (pixel-bounce, pixel-fade, pixel-slide)
- [ ] `prefers-reduced-motion: reduce` support (disable non-essential animations)
- [ ] Animation utility classes (.animate-8bit-hover, .animate-8bit-press)
- [ ] Delay and stagger tokens for sequential animations
- [ ] TypeScript check passes (`pnpm tsc --noEmit`)
- [ ] No conflicts with existing animation classes

## Reference

- UX Spec: `_bmad-output/planning-artifacts/ux-specification/15-micro-animations.md`
- Design Tokens: `_bmad-output/planning-artifacts/ux-specification/03-design-tokens.md`
- Previous Stories: `UXUI-01-01`, `UXUI-01-02`, `UXUI-01-03`

## Dependencies

- UXUI-01-01 (Color Tokens) - DONE
- UXUI-01-02 (Typography Tokens) - DONE
- UXUI-01-03 (Spacing & Border Tokens) - READY

## Timebox

2-3 hours

## DO NOT Rules

- NO `ease-in-out`, `ease`, or `cubic-bezier` timing (except --timing-fallback)
- NO sub-pixel values (use 2px, 4px NOT 1.5px)
- NO spring/bounce physics (too modern)
- NO blur effects in animations
- NO ignoring reduced motion preferences

---
**Created**: 2026-01-27
**Agent**: bmad-sprint-manager
**Coordinator**: bmad-sprint-manager (parallel instance)
**Implementer**: dev-ext-team-b (delegated)
