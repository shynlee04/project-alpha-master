← [Section 14: Light Theming](./14-light-theming.md) | [Index](./index.md) | [VALIDATION-CHECKLIST](./VALIDATION-CHECKLIST.md) →

# Section 15: Micro Animations & Effects

> **Version**: 3.0.0 | **Date**: 2026-01-27 | **Status**: ACTIVE

---

## 15.1 Animation Philosophy

### 15.1.1 Core 8-bit Principles

Micro animations in Project Alpha follow authentic 8-bit game console aesthetics:

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Frame-by-Frame** | Discrete jumps, not smooth interpolation | `steps(N, end)` timing function |
| **Pixel-Perfect** | Movement in whole pixel increments | `transform: translateY(-2px)` not `-1.5px` |
| **Minimal Keyframes** | 3-6 frames max for most animations | Keep `@keyframes` simple |
| **Hard Edges** | No blur, glow, or feathering | Solid colors, sharp shadows |
| **Instant Response** | Immediate feedback on interaction | 100ms or less for micro-interactions |

### 15.1.2 Step-Based vs Smooth Motion

**8-BIT (Preferred)**:
```css
animation-timing-function: steps(5, end);
```

**MODERN (Avoid for 8-bit aesthetic)**:
```css
animation-timing-function: ease-in-out;
animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### 15.1.3 Performance Budget

| Context | Max Concurrent Animations | Duration Limit |
|---------|---------------------------|----------------|
| **Page Load** | 3-4 staggered elements | 300ms |
| **User Interaction** | 1-2 per interaction | 200ms |
| **Background** | 1 subtle animation max | 500ms |
| **Loading States** | 1 skeleton OR 1 spinner | 600ms |
| **Mobile** | Reduce by 50% | 150ms |

### 15.1.4 GPU-Accelerated Properties Only

**✅ Animate These (GPU-accelerated)**:
```css
transform: translateX() / translateY() / scale() / rotate();
opacity: 0-1;
```

**❌ Avoid These (Layout recalculation)**:
```css
width, height       /* Use transform: scale() instead */
margin, padding     /* Use transform: translate() instead */
top, left, right, bottom  /* Use transform: translate() instead */
font-size           /* Avoid animating */
border-width        /* Use opacity or box-shadow instead */
```

---

## 15.2 Animation Tokens

### 15.2.1 Duration Tokens

```css
:root {
  /* === Animation Durations === */
  --duration-instant: 0ms;             /* No animation */
  --duration-fastest: 50ms;            /* Micro-interactions */
  --duration-fast: 100ms;              /* Quick feedback */
  --duration-normal: 150ms;            /* Standard transitions */
  --duration-slow: 200ms;              /* Deliberate animations */
  --duration-slower: 300ms;            /* Complex animations */
  --duration-slowest: 500ms;           /* Page transitions */
}
```

### 15.2.2 Step-Based Timing Functions

```css
:root {
  /* === Step-Based Timing (8-bit Authentic) === */
  --timing-8bit: steps(5, end);                      /* Default 8-bit */
  --timing-8bit-fast: steps(3, end);                 /* Quick 8-bit */
  --timing-8bit-snap: steps(2, end);                 /* Instant snap */
  --timing-8bit-smooth: steps(8, end);               /* Smoother 8-bit */

  /* === Smooth Alternatives (Use Sparingly) === */
  --timing-linear: linear;                           /* Continuous motion */
  --timing-fallback: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Non-8-bit fallback */
}
```

### 15.2.3 Animation Delays

```css
:root {
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

---

## 15.3 Hover Effects

### 15.3.1 Button Hover (8-bit Lift)

```css
.btn-8bit {
  transition: transform var(--duration-fast) var(--timing-8bit-snap),
              box-shadow var(--duration-fast) var(--timing-8bit-snap);
  box-shadow: var(--shadow-pixel);
}

.btn-8bit:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 0 rgba(0, 0, 0, 0.5);
}

/* Step 1: Normal state
   Step 2: Hover state - instant snap */
```

### 15.3.2 Link Hover (Pixel Underline)

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
  transition: width var(--duration-normal) var(--timing-8bit);
}

.link-8bit:hover::after {
  width: 100%;
}
```

### 15.3.3 Card Hover (Border Glow)

```css
.card-8bit {
  border: 2px solid hsl(var(--border));
  transition: border-color var(--duration-fast) var(--timing-8bit-snap);
}

.card-8bit:hover {
  border-color: hsl(var(--primary));
}
```

### 15.3.4 Icon Hover (Color Shift)

```css
.icon-8bit {
  transition: color var(--duration-fast) var(--timing-8bit-snap);
}

.icon-8bit:hover {
  color: hsl(var(--primary));
}
```

---

## 15.4 Click/Tap Feedback

### 15.4.1 Button Press (8-bit Inset)

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
  animation: button-press-8bit var(--duration-slow) var(--timing-8bit);
}
```

### 15.4.2 8-bit Pixel Burst (Ripple Alternative)

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
  animation: pixel-burst 300ms var(--timing-8bit) forwards;
}
```

### 15.4.3 Toggle Switch (Snap)

```css
@keyframes toggle-snap {
  0% { left: 2px; }
  100% { left: calc(100% - 18px); }
}

.toggle-8bit[data-state="checked"] .toggle-thumb {
  animation: toggle-snap var(--duration-fast) var(--timing-8bit-snap) forwards;
}
```

### 15.4.4 Checkbox/Radio (Mark Appear)

```css
@keyframes checkmark-appear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.checkbox-8bit:checked .checkmark {
  animation: checkmark-appear var(--duration-fast) var(--timing-8bit-snap) forwards;
}
```

---

## 15.5 Focus States

### 15.5.1 Input Focus (8-bit Border)

```css
.input-8bit {
  border: 2px solid hsl(var(--border));
  outline: none;
  transition: border-color var(--duration-fastest) var(--timing-8bit-snap);
}

.input-8bit:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.3);
}
```

### 15.5.2 Focus Ring (Keyboard Navigation)

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
  animation: focus-pulse 1s var(--timing-8bit-snap) infinite;
}
```

### 15.5.3 Skip Link Reveal

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 8px 16px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  transition: top var(--duration-normal) var(--timing-8bit);
  z-index: var(--z-alert);
}

.skip-link:focus {
  top: 0;
}
```

---

## 15.6 Loading States

### 15.6.1 8-bit Skeleton Shimmer

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
  animation: skeleton-shimmer-8bit 1.5s var(--timing-8bit-smooth) infinite;
}
```

### 15.6.2 Segmented Progress Bar

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
  animation: progress-8bit 2s var(--timing-8bit-smooth) forwards;
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
  transition: background var(--duration-fast) var(--timing-8bit-snap);
}

.progress-segment.filled {
  background: hsl(var(--primary));
}
```

### 15.6.3 8-bit Pixel Spinner

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
  animation: spin-8bit 600ms var(--timing-linear) infinite;
}
```

### 15.6.4 Typing Indicator (3-Dot Bounce)

```css
@keyframes dot-bounce-8bit {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: hsl(var(--muted-foreground));
  animation: dot-bounce-8bit 600ms var(--timing-8bit) infinite;
}

.typing-dot:nth-child(2) { animation-delay: var(--delay-short); }
.typing-dot:nth-child(3) { animation-delay: var(--delay-medium); }
```

---

## 15.7 Transitions

### 15.7.1 Panel Slide In/Out

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
  animation: panel-slide-in-8bit var(--duration-slow) var(--timing-8bit) forwards;
}

.panel-8bit-exit {
  animation: panel-slide-out-8bit var(--duration-slow) var(--timing-8bit) forwards;
}
```

### 15.7.2 Modal Appear/Dismiss

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
  animation: modal-appear-8bit var(--duration-normal) var(--timing-8bit) forwards;
}

.modal-8bit-exit {
  animation: modal-appear-8bit var(--duration-normal) var(--timing-8bit) reverse forwards;
}
```

### 15.7.3 Accordion Expand/Collapse

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
  animation: accordion-expand-8bit var(--duration-slow) var(--timing-8bit) forwards;
}
```

### 15.7.4 Tab Switch (Step Fade)

```css
@keyframes tab-fade-8bit {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content-8bit {
  animation: tab-fade-8bit var(--duration-normal) var(--timing-8bit) forwards;
}
```

---

## 15.8 Feedback Animations

### 15.8.1 Success Checkmark

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
  animation: checkmark-draw-8bit var(--duration-slow) var(--timing-8bit) forwards;
}
```

### 15.8.2 Error Shake

```css
@keyframes shake-8bit {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.shake-error-8bit {
  animation: shake-8bit var(--duration-slow) var(--timing-8bit);
}
```

### 15.8.3 Toast Notification

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
  animation: toast-slide-in-8bit var(--duration-slow) var(--timing-8bit) forwards;
}

.toast-8bit-exit {
  animation: toast-slide-out-8bit var(--duration-slow) var(--timing-8bit) forwards;
}
```

### 15.8.4 Notification Badge (Pulse)

```css
@keyframes badge-pulse-8bit {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.notification-badge {
  animation: badge-pulse-8bit 1s var(--timing-8bit-snap) infinite;
}
```

---

## 15.9 Accessibility

### 15.9.1 prefers-reduced-motion Implementation

```css
/* Default: Full animations */
.animated-element {
  animation: slide-in var(--duration-slow) var(--timing-8bit) forwards;
  transition: transform var(--duration-fast) var(--timing-8bit-snap);
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

### 15.9.2 JavaScript Detection

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
const animationDuration = prefersReduced ? 0 : var(--duration-slow);
```

### 15.9.3 Alternative Static States

| Animation | Reduced Motion Alternative |
|-----------|---------------------------|
| Loading spinner | Static "Loading..." text |
| Progress bar animation | Instant width change |
| Card hover lift | Border color change only |
| Modal slide in | Instant appear with border |
| Toast slide | Instant appear in position |
| Skeleton shimmer | Solid gray background |

### 15.9.4 WCAG Compliance Checklist

- [ ] `prefers-reduced-motion` respected
- [ ] No flashing content (>3 flashes/second)
- [ ] Animations can be paused/stopped
- [ ] Motion doesn't distract from content
- [ ] Essential feedback preserved in reduced mode
- [ ] No auto-playing infinite animations on load

---

## 15.10 DO/DON'T Reference

### 15.10.1 DO

```css
/* Use step-based timing for 8-bit feel */
animation-timing-function: steps(5, end);

/* Keep animations short */
animation-duration: var(--duration-fast);

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

/* Limit concurrent animations */
/* Max 3-4 per page load */
```

### 15.10.2 DON'T

```css
/* Avoid smooth easing */
animation-timing-function: ease-in-out; /* Too modern */

/* Avoid long animations */
animation-duration: 2s; /* Too slow for UI */

/* Avoid layout animations */
animation: width-change var(--duration-slow); /* Causes reflow */

/* Avoid sub-pixel values */
transform: translateX(1.5px); /* Not pixel-perfect */

/* Avoid blur effects */
filter: blur(4px); /* Not 8-bit */
box-shadow: 0 0 10px rgba(0,0,0,0.5); /* Too soft */

/* Avoid spring/bounce effects */
animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); /* Too modern */

/* Avoid infinite decorative animations */
animation: pulse 1s infinite; /* Distracting */

/* Don't animate more than 4 elements simultaneously */
```

---

## 15.11 Quick Reference Table

| Animation Type | Duration | Timing | Use Case |
|---------------|----------|--------|----------|
| **Button hover** | 100ms | steps(2, end) | Micro-interaction |
| **Button press** | 200ms | steps(3, end) | Feedback |
| **Link underline** | 150ms | steps(5, end) | Navigation |
| **Focus ring** | 0ms (instant) | N/A | Accessibility |
| **Modal appear** | 150ms | steps(3, end) | Dialog |
| **Toast slide** | 200ms | steps(4, end) | Notification |
| **Skeleton shimmer** | 1.5s | steps(8, end) | Loading |
| **Progress bar** | 2s | steps(8, end) | Progress |
| **Spinner** | 600ms | linear | Loading |
| **Error shake** | 400ms | steps(5, end) | Feedback |

---

## 15.12 Implementation Priority

| Priority | Animation Type | Effort | Impact |
|----------|---------------|--------|--------|
| **P0** | Button hover/press | 1h | High |
| **P0** | Focus states | 30m | Critical |
| **P1** | Loading states (skeleton, spinner) | 2h | High |
| **P1** | Toast notifications | 1h | Medium |
| **P2** | Modal/Panel transitions | 1h | Medium |
| **P2** | Accordion/Tab animations | 1h | Low |
| **P3** | Decorative animations | 30m | Low |

---

← [Section 14: Light Theming](./14-light-theming.md) | [Index](./index.md) | [VALIDATION-CHECKLIST](./VALIDATION-CHECKLIST.md) →

**Section 15 Complete** | **Lines**: ~850 | **Created**: 2026-01-27 | **Agent**: ux-designer-ext-team-b