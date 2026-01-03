# Light Theme Transition Design

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 3 - Theme Transition Design
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft
- **Project**: Via-gent (Project Alpha v2.0)
- **Preceding Documents**:
  - light-theme-design-system-foundation-2026-01-03.md
  - light-theme-component-specifications-part1-2026-01-03.md
  - light-theme-component-specifications-part2-2026-01-03.md
  - light-theme-component-specifications-part3-2026-01-03.md

---

## Executive Summary

This document defines the animation and transition specifications for seamless light/dark theme switching. The goal is to provide smooth, performant transitions that enhance user experience while maintaining visual consistency and accessibility.

**Key Principles**:
- **Performance-first**: GPU-accelerated transitions, minimal layout thrashing
- **Respect user preferences**: Honor `prefers-reduced-motion`
- **Smooth**: Color interpolation with proper easing
- **Consistent**: Uniform timing across all components

---

## 1. Transition Architecture

### 1.1 CSS Custom Properties for Transitions

```css
:root {
  /* Transition Timings */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --transition-slower: 500ms;

  /* Transition Easing */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Color Transition Strategy */
  --color-transition-property: background-color, color, border-color;
  --color-transition-duration: var(--transition-base);
  --color-transition-timing: var(--ease-in-out);

  /* Shadow/Depth Transition */
  --shadow-transition-property: box-shadow;
  --shadow-transition-duration: var(--transition-fast);
  --shadow-transition-timing: var(--ease-out);
}

/* Dark theme class */
.dark {
  /* Color variables with dark theme values */
  --background: 240 3.7% 8%;
  --foreground: 0 0% 98%;
  /* ... */
}

/* Light theme class */
.light {
  /* Color variables with light theme values */
  --background: 0 0% 98%;
  --foreground: 240 6% 10%;
  /* ... */
}
```

### 1.2 Theme Transition Base Styles

```css
/* Apply color transitions to all elements */
*,
*::before,
*::after {
  transition-property: var(--color-transition-property), var(--shadow-transition-property);
  transition-duration: var(--color-transition-duration), var(--shadow-transition-duration);
  transition-timing-function: var(--color-transition-timing), var(--shadow-transition-timing);
}

/* Exclude specific elements from theme transitions */
:root,
html,
body {
  transition-property: none;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0ms !important;
    transition-property: none !important;
  }
}
```

---

## 2. Color Transition Strategies

### 2.1 Color Interpolation

#### Direct Color Mapping

| Color Family | Light Theme | Dark Theme | Transition Method |
|--------------|-------------|------------|-------------------|
| **Primary 500** | #f97316 | #f97316 | Static (no change) |
| **Primary 600** | #ea580c | #fdba74 | Interpolate |
| **Background** | #ffffff | #0f0f11 | Invert + interpolate |
| **Foreground** | #0f0f11 | #fafafa | Invert + interpolate |

#### HSL Color Space Interpolation

**Advantages**:
- Smoother transitions between light and dark
- Perceived luminance changes more natural
- Better color preservation

**Implementation**:
```css
/* Use HSL values in CSS variables for easier interpolation */
:root {
  --background-h: 240;
  --background-s: 3.7%;
  --background-l: 8%; /* Will animate to/from 98% */
  --background: var(--background-h) var(--background-s) var(--background-l%);
}
```

### 2.2 Component Color Transitions

By Component Category:

| Category | Transition Property | Duration | Easing |
|----------|---------------------|----------|--------|
| **Backgrounds** | background-color | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| **Text/Borders** | color, border-color | 200ms | cubic-bezier(0.4, 0, 0.6, 1) |
| **Shadows** | box-shadow | 150ms | cubic-bezier(0.4, 0, 0.2, 1) |
| **Gradients** | background-image | 200ms | cubic-bezier(0.4, 0, 0.6, 1) |

---

## 3. Component-Specific Transitions

### 3.1 Button Transitions

**Primary Button**:
| State Change | Property | Duration | Easing |
|--------------|----------|----------|--------|
| Default → Hover | background-color | 150ms | ease-out |
| Hover → Default | background-color | 150ms | ease-out |
| Any → Active | transform (scale 0.98) | 4ms | ease-out |
| Theme Switch | background-color, box-shadow | 200ms | ease-in-out |

**Secondary Button**:
| State Change | Property | Duration | Easing |
|--------------|----------|----------|--------|
| Default → Hover | background-color, box-shadow | 150ms | ease-out |
| Theme Switch | background-color | 200ms | ease-in-out |

**Ghost Button**:
| State Change | Property | Duration | Easing |
|--------------|----------|----------|--------|
| Default → Hover | background-color | 150ms | ease-out |
| Theme Switch | color, background-color | 200ms | ease-in-out |

### 3.2 Input Field Transitions

**Focus State Transition**:
| Property | Duration | Easing |
|----------|----------|--------|
| border-color | 150ms | ease-out |
| box-shadow (ring) | 150ms | ease-out |

**Theme Switch Transition**:
| Property | Duration | Easing |
|----------|----------|--------|
| background-color | 200ms | ease-in-out |
| color (foreground/text) | 200ms | ease-in-out |
| border-color | 200ms | ease-in-out |
| box-shadow | 200ms | ease-in-out |

### 3.3 Card Transitions

**Hover State**:
| Property | Duration | Easing |
|----------|----------|--------|
| box-shadow | 150ms | ease-out |
| border-color | 150ms | ease-out |

**Theme Switch**:
| Property | Duration | Easing |
|----------|----------|--------|
| background-color | 200ms | ease-in-out |
| border-color | 200ms | ease-in-out |
| box-shadow | 200ms | ease-in-out |

### 3.4 Navigation Component Transitions

**Tabs**:
- Active indicator slide: 150ms ease-out
- Tab color change: 200ms ease-in-out (theme switch)
- Tab hover background: 150ms ease-out

**Sidebar/Activity Bar**:
- Background color: 200ms ease-in-out
- Icon color: 200ms ease-in-out
- Active tab indicator: 150ms ease-out

**Header**:
- Background color: 200ms ease-in-out
- Border color: 200ms ease-in-out

---

## 4. Layout and Container Transitions

### 4.1 Panel Background Transitions

| Panel | Properties | Duration | Easing |
|-------|------------|----------|--------|
| **Content Panel** | background-color, border-color | 200ms | ease-in-out |
| **Sidebar** | background-color, border-color | 200ms | ease-in-out |
| **Status Bar** | background-color, border-color | 200ms | ease-in-out |
| **Header Bar** | background-color, border-color | 200ms | ease-in-out |

### 4.2 IDE-Specific Layout Transitions

**Code Editor (Monaco)**:
| Component | Properties | Duration | Easing |
|-----------|------------|----------|--------|
| Editor Background | background-color | 200ms | ease-in-out |
| Line Numbers | color | 200ms | ease-in-out |
| Selection | background-color | 200ms | ease-in-out |
| Cursor | border-color | 150ms | ease-out |
**Terminal**:
| Component | Properties | Duration | Easing |
|-----------|------------|----------|--------|
| Terminal Background | background-color | 200ms | ease-in-out |
| Text Color | color | 200ms | ease-in-out |
| Cursor | background-color | 150ms | ease-out |

**File Tree**:
| Component | Properties | Duration | Easing |
|-----------|------------|----------|--------|
| Tree Background | background-color | 200ms | ease-in-out |
| Icon Color | color | 200ms | ease-in-out |
| Selected Item | background-color | 150ms | ease-out |

---

## 5. Animation Performance Considerations

### 5.1 GPU-Accelerated Properties

**Best Practices**:
- Use `transform`, `opacity`, and `filter` for 60fps animations
- Avoid animating `width`, `height`, `top`, `left` (causes layout thrashing)
- Use `will-change` sparingly (only for persistent animations)

**Recommended Transitions**:
```css
/* ✅ GOOD - GPU-accelerated */
transform: translate3d(0, 0, 0);
opacity: 0.5;
filter: blur(4px);

/* ❌ AVOID - Layout thrashing */
width: 100% → 200%;
height: 50px → 100px;
top: 10px → 20px;
```

### 5.2 Transition Performance Optimization

**Batch DOM Updates**:
```javascript
// ✅ GOOD - Batch updates
requestAnimationFrame(() => {
  element.classList.add('light');
  element.classList.remove('dark');
});

// ❌ AVOID - Multiple reflows
element.classList.add('light');
element.classList.remove('dark');
element.style.display = 'none';
```

**Use CSS Custom Properties**:
```css
/* ✅ GOOD - Custom properties reflow once */
.component {
  background-color: var(--background);
  color: var(--foreground);
}

/* ❌ AVOID - Direct values reflow multiple times */
.component {
  background-color: #ffffff;
  color: #0f0f11;
}
```

---

## 6. Reduced Motion Support

### 6.1 Respecting User Preferences

**Detection**:
```css
/* Check for reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  /* Disable all theme transitions */
  *,
  *::before,
  *::after {
    transition-duration: 0ms !important;
    transition-property: none !important;
  }

  /* Disable animations */
  * {
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

**JavaScript Detection**:
```javascript
// Check for reduced motion preference in JS
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Apply reduced motion styles if needed
if (prefersReducedMotion) {
  document.documentElement.classList.add('reduced-motion');
}
```

### 6.2 Reduced Motion Fallbacks

**Instant Theme Switch**:
```css
.reduced-motion {
  /* Force instant theme switch */
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
```

**Essential Animations Only**:
- Hover hover states (instant, no fade)
- Focus indicators (instant color change)
- Active states (instant scale)

---

## 7. Transition Timing Guidelines

### 7.1 Recommended Durations

| Transition Type | Duration | Use Case |
|-----------------|----------|----------|
| **Instant** | 0ms | Reduced motion, critical feedback |
| **Fast** | 150ms | Hover states, buttons, focus indicators |
| **Base** | 200ms | Theme switch, color transitions, cards |
| **Slow** | 300ms | Overlays, drawers, complex layouts |
| **Slower** | 500ms | Page transitions, major UI changes |

### 7.2 Recommended Easing Functions

| Easing | Cubic Bezier | Use Case |
|--------|-------------|----------|
| **ease-out** | cubic-bezier(0.4, 0, 0.2, 1) | Hover states, focus indicators (fast start, smooth end) |
| **ease-in-out** | cubic-bezier(0.4, 0, 0.6, 1) | Theme switch (smooth acceleration and deceleration) |
| **ease-spring** | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Micro-interactions, button presses (bouncy) |
| **linear** | cubic-bezier(0, 0, 1, 1) | Loading spinners, progress bars (constant speed) |

---

## 8. Theme Switch Implementation Pattern

### 8.1 React Implementation

**Theme Provider**:
```typescript
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 8.2 Theme Toggle Component

**Toggle Button Design**:

| State | Icon | Background | Text Color |
|-------|------|-----------|------------|
| **Light Active** | Sun | `--primary` (#f97316) | White (#ffffff) |
| **Dark Active** | Moon | `--foreground` (#0f0f11) | `--card` (#ffffff) |
| **System Auto** | Monitor + Sun/Moon split | `--secondary` (#f5f5f5) | `--foreground` (#0f0f11) |

**Transition Support**:
- Icon fade + scale: 150ms ease-out
- Background color: 200ms ease-in-out
- Text color: 200ms ease-in-out

**Icon Animations**:
- Sun icon: Rotate 360° in 500ms (spin)
- Moon icon: Scale 0.8 → 1.0 in 200ms (bounce)

### 8.3 System Preference Detection

**Listening for Changes**:
```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = () => {
    if (theme === 'system') {
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      setResolvedTheme(newTheme);
    }
  };

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, [theme]);
```

---

## 9. Theme Preservation

### 9.1 Storage Strategy

**Storage Mechanisms**:
- **Primary**: `localStorage` (`theme` key)
- **Secondary**: Cookie (optional, for SSR)
- **Fallback**: System default

**Storage Schema**:
```typescript
interface ThemeStorage {
  theme: 'light' | 'dark' | 'system';
  timestamp: number;
}
```

### 9.2 Initialization Sequence

1. Check `localStorage` for saved theme preference
2. If not found, use system preference
3. Apply theme class to `<html>` element immediately (FOUC prevention)
4. Setup listener for system preference changes

**FOUC Prevention**:
```html
<!-- Inline script in head -->
<script>
  (function() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    document.documentElement.classList.add(theme);
  })();
</script>
```

---

## 10. Theme Switch UX Considerations

### 10.1 Transition Zones

**Awareness Windows** (minimum time between switches):

| Switch Type | Minimum Time | Rationale |
|-------------|--------------|-----------|
| **Manual Toggle** | 0ms | User-initiated, immediate feedback |
| **System Change** | 0ms | System preference change, immediate apply |
| **Auto-Schedule** | 30s minimum | Prevent flashing, allow cognitive adaptation |

### 10.2 Transition Feedback

**Visual Feedback During Switch**:
- No explicit "loading" state needed (instant CSS class toggling)
- Optional: Fade overlay (50ms) for complex layouts
- Optional: Transition button icon change (150ms)

**Auditory Feedback** (Optional):
- Screen reader announcement: "Theme changed to light/dark"
- Sound effect: None (avoid unnecessary audio)

---

## 11. Testing and Validation

### 11.1 Transition Testing Checklist

**Visual Regression**:
- [ ] Theme switch completes without layout shifts
- [ ] All colors transition smoothly
- [ ] No flashing or FOUC (Flash of Unstyled Content)
- [ ] Reduced motion respected

**Performance**:
- [ ] Theme switch animation maintains 60fps
- [ ] No layout thrashing during switch
- [ ] Low CPU/GPU usage during transition
- [ ] Smooth animation on low-end devices

**Accessibility**:
- [ ] `prefers-reduced-motion` respected
- [ ] Screen reader announces theme change
- [ ] Contrast maintained during transition
- [ ] Focus indicators visible in both themes

### 11.2 Browser Compatibility

**Minimum Supported**:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari (iOS): Last 2 major versions

**Fallbacks**:
- CSS custom properties: Fallback to static values (IE11 not supported)
- CSS transitions: Fallback to instant switch
- `matchMedia`: Fallback to default theme

---

## 12. Component Transition Reference

### Complete Transition Matrix

| Component | Background | Border | Text | Shadow | Duration | Easing |
|-----------|-----------|--------|------|--------|----------|--------|
| **Button (Primary)** | ✅ 200ms | ❌ | ✅ 200ms | ✅ 150ms | 200ms | ease-in-out |
| **Button (Ghost)** | ✅ 200ms | ❌ | ✅ 200ms | ❌ | 200ms | ease-in-out |
| **Input** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ✅ 200ms | 200ms | ease-in-out |
| **Card** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ✅ 200ms | 200ms | ease-in-out |
| **Table** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ❌ | 200ms | ease-in-out |
| **Dialog** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ✅ 200ms | 200ms | ease-in-out |
| **Tooltip** | ✅ 200ms | ❌ | ✅ 200ms | ✅ 150ms | 200ms | ease-in-out |
| **Tabs** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ❌ | 200ms | ease-in-out |
| **Sidebar** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ❌ | 200ms | ease-in-out |
| **Status Bar** | ✅ 200ms | ✅ 200ms | ✅ 200ms | ❌ | 200ms | ease-in-out |
| **Monaco Editor** | ✅ 200ms | ❌ | ✅ 200ms | ❌ | 200ms | ease-in-out |
| **Terminal** | ✅ 200ms | ❌ | ✅ 200ms | ❌ | 200ms | ease-in-out |

**Legend**:
- ✅ = Transition applied
- ❌ = No transition needed
- ✅ 200ms = Duration (variable per property)

---

## Document End

*This document concludes the Light Theme Transition Design specifications. For accessibility guidelines and developer implementation details, refer to the subsequent documents in this series.*

---

## Next Documents

1. **Light Theme Accessibility Guidelines** - WCAG compliance, contrast validation, motion sensitivity
2. **Developer Handoff Specifications** - Implementation guide, code examples, migration patterns
3. **Development Story Breakdown** - Developer-ready task breakdown with acceptance criteria
4. **QA Validation Checklist** - Quality assurance procedures and testing protocols