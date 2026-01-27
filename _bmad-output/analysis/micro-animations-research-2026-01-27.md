# Micro Animations & Effects for 8-bit UX

**Task ID**: PH2-T1B
**Agent**: ux-designer-ext
**Date**: 2026-01-27
**Status**: RESEARCH COMPLETE

---

## Executive Summary

This research defines micro animations, transitions, and effects that enhance UX while maintaining the 8-bit retro aesthetic. The key finding is that **step-based timing functions** (`steps()`) are the authentic 8-bit animation approach, creating frame-by-frame motion rather than smooth interpolation.

---

## 1. 8-bit Animation Principles

### 1.1 Core Philosophy

8-bit animations should feel like they came from a retro game console:

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Frame-by-Frame** | Discrete jumps, not smooth interpolation | `steps(N, end)` timing function |
| **Pixel-Perfect** | Movement in whole pixel increments | `transform: translateY(-2px)` not `-1.5px` |
| **Minimal Keyframes** | 3-6 frames max for most animations | Keep `@keyframes` simple |
| **Hard Edges** | No blur, glow, or feathering | Solid colors, sharp shadows |
| **Instant Response** | Immediate feedback on interaction | 100ms or less for micro-interactions |

### 1.2 Step-Based vs Smooth Motion

```css
/* 8-BIT (Preferred) - Frame-by-frame jumps */
animation-timing-function: steps(5, end);

/* MODERN (Avoid for 8-bit aesthetic) */
animation-timing-function: ease-in-out;
animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### 1.3 Steps() Function Deep Dive

```css
/* Syntax */
steps(<number-of-steps>, <jump-position>)

/* Jump positions */
steps(4, jump-start)  /* First jump at 0% */
steps(4, jump-end)    /* Last jump at 100% (default) */
steps(4, jump-none)   /* No jump at 0% or 100% */
steps(4, jump-both)   /* Jump at both 0% and 100% */

/* Common patterns */
steps(1)           /* Instant switch (on/off) */
steps(3, end)      /* 3-frame animation */
steps(5, end)      /* 5-frame animation */
steps(10, end)     /* Smoother but still stepped */
```

---

## 2. Animation Taxonomy

### 2.1 Complete Animation Categories

```
Micro Animations
├── Hover Effects
│   ├── Button hover (lift + shadow)
│   ├── Link hover (underline slide)
│   ├── Card hover (border glow)
│   └── Icon hover (color shift)
├── Click/Tap Feedback
│   ├── Button press (inset + scale)
│   ├── Pixel burst (8-bit ripple)
│   ├── Toggle switch (snap)
│   └── Checkbox/Radio (mark appear)
├── Focus States
│   ├── Input focus (border animation)
│   ├── Focus ring (2px solid outline)
│   └── Keyboard nav (skip-link reveal)
├── Loading States
│   ├── 8-bit skeleton (block shimmer)
│   ├── Segmented progress bar
│   ├── Pixel spinner (4-frame rotate)
│   └── Typing indicator (3-dot bounce)
├── Transitions
│   ├── Page transitions (fade + slide)
│   ├── Panel slide in/out
│   ├── Modal appear/dismiss
│   ├── Accordion expand/collapse
│   └── Tab switch (step fade)
├── Feedback
│   ├── Success checkmark (draw)
│   ├── Error shake (horizontal)
│   ├── Toast slide in
│   └── Notification badge (pulse)
└── Decorative (Use Sparingly)
    ├── Idle blink (cursor, status)
    ├── Empty state pixel art
    └── Achievement celebration
```

---

## 3. CSS Code Examples

### 3.1 Hover Effects

#### Button Hover (8-bit Lift)

```css
/* Design Token Integration */
.btn-8bit {
  transition: transform 100ms steps(2, end),
              box-shadow 100ms steps(2, end);
  box-shadow: var(--shadow-pixel);
}

.btn-8bit:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.5);
}

/* Step 1: Normal state
   Step 2: Hover state - instant snap */
```

#### Link Hover (Pixel Underline)

```css
.link-8bit {
  position: relative;
  text-decoration: none;
}

.link-8bit::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px; /* Pixel-perfect 2px line */
  background: hsl(var(--primary));
  transition: width 150ms steps(3, end);
}

.link-8bit:hover::after {
  width: 100%;
}
```

#### Card Hover (Border Glow)

```css
.card-8bit {
  border: 2px solid hsl(var(--border));
  transition: border-color 100ms steps(1);
}

.card-8bit:hover {
  border-color: hsl(var(--primary));
}
```

### 3.2 Click/Tap Feedback

#### Button Press (8-bit Inset)

```css
.btn-8bit:active {
  transform: translateY(2px);
  box-shadow: var(--shadow-pixel-inset);
}

/* For animated press feedback */
@keyframes button-press-8bit {
  0% {
    transform: translateY(0);
    box-shadow: var(--shadow-pixel);
  }
  50% {
    transform: translateY(2px);
    box-shadow: var(--shadow-pixel-inset);
  }
  100% {
    transform: translateY(0);
    box-shadow: var(--shadow-pixel);
  }
}

.btn-press-anim {
  animation: button-press-8bit 200ms steps(3, end);
}
```

#### 8-bit Pixel Burst (Ripple Alternative)

```css
/* Instead of smooth ripple, use expanding pixel squares */
@keyframes pixel-burst {
  0% {
    opacity: 1;
    transform: scale(0);
  }
  33% {
    transform: scale(0.5);
  }
  66% {
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

.pixel-burst::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid hsl(var(--primary));
  animation: pixel-burst 300ms steps(4, end) forwards;
}
```

#### Toggle Switch (Snap)

```css
@keyframes toggle-snap {
  0% { left: 2px; }
  100% { left: calc(100% - 18px); }
}

.toggle-8bit[data-state="checked"] .toggle-thumb {
  animation: toggle-snap 100ms steps(2, end) forwards;
}
```

### 3.3 Focus States

#### Input Focus (8-bit Border)

```css
.input-8bit {
  border: 2px solid hsl(var(--border));
  outline: none;
}

.input-8bit:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3);
}

/* No transition - instant focus feedback for 8-bit feel */
```

#### Focus Ring (Keyboard Navigation)

```css
.focus-visible-8bit:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* Animated focus ring option */
@keyframes focus-pulse {
  0%, 100% {
    outline-color: hsl(var(--primary));
  }
  50% {
    outline-color: hsl(var(--primary) / 0.5);
  }
}

.focus-pulse:focus-visible {
  animation: focus-pulse 1s steps(2, end) infinite;
}
```

### 3.4 Loading States

#### 8-bit Skeleton Shimmer

```css
/* Block-based shimmer instead of smooth gradient */
@keyframes skeleton-shimmer-8bit {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-8bit {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted)) 40%,
    hsl(var(--accent)) 50%,
    hsl(var(--muted)) 60%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer-8bit 1.5s steps(8, end) infinite;
}
```

#### Segmented Progress Bar

```css
@keyframes progress-8bit {
  0% { width: 0%; }
  12.5% { width: 12.5%; }
  25% { width: 25%; }
  37.5% { width: 37.5%; }
  50% { width: 50%; }
  62.5% { width: 62.5%; }
  75% { width: 75%; }
  87.5% { width: 87.5%; }
  100% { width: 100%; }
}

.progress-bar-8bit {
  animation: progress-8bit 2s steps(8, end) forwards;
  background: hsl(var(--primary));
  height: 8px;
}

/* Visual segments */
.progress-container-8bit {
  display: flex;
  gap: 2px;
}

.progress-segment {
  flex: 1;
  height: 8px;
  background: hsl(var(--muted));
  transition: background 100ms steps(1);
}

.progress-segment.filled {
  background: hsl(var(--primary));
}
```

#### 8-bit Pixel Spinner

```css
@keyframes spin-8bit {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}

.spinner-8bit {
  width: 24px;
  height: 24px;
  border: 3px solid hsl(var(--muted));
  border-top-color: hsl(var(--primary));
  animation: spin-8bit 600ms steps(4, end) infinite;
}
```

#### Typing Indicator (3-Dot Bounce)

```css
@keyframes dot-bounce-8bit {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: hsl(var(--muted-foreground));
  animation: dot-bounce-8bit 600ms steps(3, end) infinite;
}

.typing-dot:nth-child(2) { animation-delay: 100ms; }
.typing-dot:nth-child(3) { animation-delay: 200ms; }
```

### 3.5 Transitions

#### Panel Slide In/Out

```css
@keyframes panel-slide-in-8bit {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(-50%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes panel-slide-out-8bit {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.panel-8bit-enter {
  animation: panel-slide-in-8bit 200ms steps(3, end) forwards;
}

.panel-8bit-exit {
  animation: panel-slide-out-8bit 200ms steps(3, end) forwards;
}
```

#### Modal Appear/Dismiss

```css
@keyframes modal-appear-8bit {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-8bit-enter {
  animation: modal-appear-8bit 150ms steps(3, end) forwards;
}
```

#### Accordion Expand/Collapse

```css
@keyframes accordion-expand-8bit {
  0% {
    max-height: 0;
    opacity: 0;
  }
  50% {
    max-height: 100px;
    opacity: 0.5;
  }
  100% {
    max-height: 500px;
    opacity: 1;
  }
}

.accordion-content-8bit[data-state="open"] {
  animation: accordion-expand-8bit 200ms steps(3, end) forwards;
}
```

### 3.6 Feedback Animations

#### Success Checkmark

```css
@keyframes checkmark-draw-8bit {
  0% {
    stroke-dashoffset: 24;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.checkmark-8bit {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: checkmark-draw-8bit 300ms steps(6, end) forwards;
}
```

#### Error Shake

```css
@keyframes shake-8bit {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.shake-error-8bit {
  animation: shake-8bit 400ms steps(5, end);
}
```

#### Toast Notification

```css
@keyframes toast-slide-in-8bit {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out-8bit {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast-8bit-enter {
  animation: toast-slide-in-8bit 200ms steps(4, end) forwards;
}

.toast-8bit-exit {
  animation: toast-slide-out-8bit 200ms steps(4, end) forwards;
}
```

### 3.7 Decorative Animations

#### Cursor Blink

```css
@keyframes blink-8bit {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.cursor-blink {
  animation: blink-8bit 1s steps(1) infinite;
}
```

#### Status Indicator Pulse

```css
@keyframes status-pulse-8bit {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-online {
  animation: status-pulse-8bit 2s steps(2, end) infinite;
}
```

---

## 4. Timing Token Recommendations

### 4.1 Proposed Animation Token System

```css
:root {
  /* === Animation Durations === */
  --anim-instant: 0ms;           /* No animation */
  --anim-fast: 100ms;            /* Micro-interactions */
  --anim-normal: 200ms;          /* Standard transitions */
  --anim-slow: 300ms;            /* Deliberate animations */
  --anim-slower: 500ms;          /* Complex transitions */
  
  /* === Step Counts === */
  --steps-instant: steps(1);     /* On/off switch */
  --steps-snap: steps(2, end);   /* Quick snap (hover) */
  --steps-normal: steps(3, end); /* Standard animation */
  --steps-smooth: steps(5, end); /* Smoother motion */
  --steps-fluid: steps(8, end);  /* Near-smooth */
  
  /* === Timing Functions === */
  --timing-8bit: steps(5, end);                      /* Default 8-bit */
  --timing-8bit-fast: steps(3, end);                 /* Quick 8-bit */
  --timing-8bit-smooth: steps(8, end);               /* Smoother 8-bit */
  --timing-linear: linear;                           /* Continuous motion */
  --timing-fallback: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Non-8-bit fallback */
  
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
}
```

### 4.2 Usage Examples

```css
/* Button hover */
.btn {
  transition: transform var(--anim-fast) var(--steps-snap),
              box-shadow var(--anim-fast) var(--steps-snap);
}

/* Modal appear */
.modal-enter {
  animation: modal-appear var(--anim-normal) var(--steps-normal) forwards;
}

/* Loading spinner */
.spinner {
  animation: spin-8bit 600ms var(--timing-linear) infinite;
}
```

---

## 5. Performance Guidelines

### 5.1 GPU-Accelerated Properties (Prefer)

```css
/* These properties are GPU-accelerated and performant */
transform: translateX() / translateY() / scale() / rotate();
opacity: 0-1;

/* Use will-change for known animations */
.will-animate {
  will-change: transform, opacity;
}
```

### 5.2 Avoid Animating (Layout Properties)

```css
/* These cause layout recalculation - expensive */
width, height       /* Use transform: scale() instead */
margin, padding     /* Use transform: translate() instead */
top, left, right, bottom  /* Use transform: translate() instead */
font-size           /* Avoid animating */
border-width        /* Use opacity or box-shadow instead */
```

### 5.3 Animation Budget

| Context | Max Concurrent Animations |
|---------|---------------------------|
| **Page Load** | 3-4 staggered elements |
| **User Interaction** | 1-2 per interaction |
| **Background** | 1 subtle animation max |
| **Loading States** | 1 skeleton OR 1 spinner |
| **Mobile** | Reduce by 50% |

### 5.4 Performance Optimization

```css
/* Batch animations on repaint boundaries */
.animation-group {
  contain: layout style;
}

/* Pause animations when not visible */
.hidden-tab [data-animating] {
  animation-play-state: paused;
}

/* Reduce animation on battery-saver mode */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Accessibility Patterns

### 6.1 prefers-reduced-motion Implementation

```css
/* Default: Full animations */
.animated-element {
  animation: slide-in 200ms steps(4, end) forwards;
  transition: transform 100ms steps(2, end);
}

/* Reduced motion: Instant state changes */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Keep essential feedback but make it instant */
  .btn:active {
    transform: translateY(1px); /* Still shows press */
  }
  
  /* Disable decorative animations entirely */
  .decorative-animation {
    animation: none !important;
  }
}
```

### 6.2 JavaScript Detection

```typescript
// React hook for motion preference
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
}

// Usage
const prefersReduced = usePrefersReducedMotion();
const animationDuration = prefersReduced ? 0 : 200;
```

### 6.3 Alternative Static States

| Animation | Reduced Motion Alternative |
|-----------|---------------------------|
| Loading spinner | Static "Loading..." text |
| Progress bar animation | Instant width change |
| Card hover lift | Border color change only |
| Modal slide in | Instant appear with border |
| Toast slide | Instant appear in position |
| Skeleton shimmer | Solid gray background |

### 6.4 WCAG Compliance Checklist

- [ ] `prefers-reduced-motion` respected
- [ ] No flashing content (>3 flashes/second)
- [ ] Animations can be paused/stopped
- [ ] Motion doesn't distract from content
- [ ] Essential feedback preserved in reduced mode
- [ ] No auto-playing infinite animations on load

---

## 7. DO/DON'T Examples

### 7.1 DO

```css
/* Use step-based timing for 8-bit feel */
animation-timing-function: steps(5, end);

/* Keep animations short */
animation-duration: 100ms;

/* Use GPU-accelerated properties */
transform: translateY(-2px);

/* Provide reduced motion alternatives */
@media (prefers-reduced-motion: reduce) {
  animation: none;
}

/* Use pixel-perfect values */
transform: translateX(4px); /* Whole pixels */

/* Keep shadows hard and offset */
box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.5);
```

### 7.2 DON'T

```css
/* Avoid smooth easing */
animation-timing-function: ease-in-out; /* Too modern */

/* Avoid long animations */
animation-duration: 2s; /* Too slow for UI */

/* Avoid layout animations */
animation: width-change 300ms; /* Causes reflow */

/* Avoid sub-pixel values */
transform: translateX(1.5px); /* Not pixel-perfect */

/* Avoid blur effects */
filter: blur(4px); /* Not 8-bit */
box-shadow: 0 0 10px rgba(0,0,0,0.5); /* Too soft */

/* Avoid spring/bounce effects */
animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); /* Too modern */

/* Avoid infinite decorative animations */
animation: pulse 1s infinite; /* Distracting */
```

---

## 8. Integration with Current Codebase

### 8.1 Current State Analysis

From `src/styles/animations.css`:
- Currently uses `cubic-bezier(0.25, 0.46, 0.45, 0.94)` as default
- Has `steps()` only in typewriter animation
- Durations: 100ms (fast), 150ms (medium), 200ms (slow)
- Already has `prefers-reduced-motion` support

### 8.2 Recommended Changes

1. **Add step-based tokens** to `design-tokens.css`
2. **Create 8-bit animation variants** alongside existing smooth ones
3. **Update utility classes** to use step timing
4. **Add skeleton loader classes** for loading states
5. **Document when to use steps vs cubic-bezier**

### 8.3 Migration Path

```css
/* Phase 1: Add tokens (non-breaking) */
:root {
  --timing-8bit: steps(5, end);
  --timing-8bit-fast: steps(3, end);
}

/* Phase 2: Add 8-bit variants (optional use) */
.btn-8bit-hover { /* New class */ }

/* Phase 3: Gradually migrate components */
/* Keep both options during transition */
```

---

## 9. Summary & Recommendations

### 9.1 Key Takeaways

1. **Use `steps()` for authentic 8-bit feel** - This is the single most important change
2. **Keep animations under 200ms** - Faster feedback for micro-interactions
3. **Animate only transform and opacity** - GPU-accelerated properties
4. **Always respect `prefers-reduced-motion`** - Already implemented, maintain it
5. **Pixel-perfect values** - Use whole pixels (2px, 4px) not decimals

### 9.2 Priority Implementation Order

| Priority | Animation Type | Effort |
|----------|---------------|--------|
| P0 | Button hover/press | 1h |
| P0 | Focus states | 30m |
| P1 | Loading states (skeleton, spinner) | 2h |
| P1 | Toast notifications | 1h |
| P2 | Modal/Panel transitions | 1h |
| P2 | Accordion/Tab animations | 1h |
| P3 | Decorative animations | 30m |

### 9.3 Token Additions Required

Add to `design-tokens.css`:
```css
/* Animation Tokens - 8-bit */
--timing-8bit: steps(5, end);
--timing-8bit-fast: steps(3, end);
--timing-8bit-snap: steps(2, end);
--timing-8bit-smooth: steps(8, end);
```

---

## References

- [MDN: steps() timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/steps)
- [CSS-Tricks: steps() Almanac](https://css-tricks.com/almanac/functions/s/steps/)
- [Smashing Magazine: Respecting Motion Preferences](https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/)
- [prefers-reduced-motion.com](https://prefers-reduced-motion.com/)
- [Treehouse: CSS Sprite Animation with steps()](https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps)

---

**Research Complete** | **Lines**: 680 | **Agent**: ux-designer-ext | **Timebox**: 15 minutes
