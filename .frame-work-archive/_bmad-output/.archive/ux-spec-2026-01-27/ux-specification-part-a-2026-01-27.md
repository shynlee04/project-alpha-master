# Project Alpha UX Specification

**Version**: 3.0.0
**Date**: 2026-01-27
**Status**: ACTIVE
**Alignment**: ADR-039, architecture.md v3.0.0, prd.md v2.0.0

---

## Executive Summary

Project Alpha (VIA-GENT) is a browser-based AI-augmented development environment built with an **8-bit retro aesthetic** that prioritizes clarity, accessibility, and professional functionality over decorative nostalgia. The design language draws inspiration from classic gaming interfaces while maintaining modern usability standards.

The application follows a **plugin-centric architecture** where the UI adapts dynamically based on device capabilities and user preferences. Core workspaces (IDE, Notes, Settings) render through a unified plugin panel system with platform-aware limits that ensure optimal performance across desktop, tablet, and mobile devices.

This specification serves as the authoritative UX reference for all implementation work, superseding previous documentation that contained deprecated patterns and inaccurate completion claims. All sections have been validated against the current codebase state and align with the FSA Handle Lifecycle decisions in ADR-039.

## Document Authority

- **Tier Level**: Tier 2 (Controlled & Iterative)
- **Change Authority**: Requires `architect-ext` or `ux-designer-ext` approval
- **Implementation Deviations**: Require ADR with justification
- **Supersedes**: ux-specification.md v2.1.0 (2026-01-26)

## Quick Reference

| Aspect | Specification |
|--------|---------------|
| **Design System** | ShadcnUI + Tailwind CSS 4 |
| **Visual Style** | Lyra (8-bit retro - boxy and sharp) |
| **Base Color** | Stone |
| **Primary Accent** | Orange (#f97316) |
| **Theme** | Dark only (light mode deferred to Phase 2) |
| **Languages** | English (en), Vietnamese (vi) |
| **Breakpoints** | 6 tiers (phone to desktop) |
| **Plugin Limit** | 1-4 (device-dependent) |
| **Icon Library** | Lucide React (with pixel styling) |
| **Fonts** | JetBrains Mono (UI), VT323 (decorative), Inter (prose) |
| **Min Touch Target** | 44x44px |
| **WCAG Compliance** | AA minimum |

---

## Table of Contents

1. [Executive Summary & Document Authority](#executive-summary)
2. [Design Principles](#section-2-design-principles)
3. [Design Tokens Reference](#section-3-design-tokens-reference)
4. [Responsive Grid System](#section-4-responsive-grid-system)
5. [Global Components](#section-5-global-components)
6. [Route Structure & Navigation](#section-6-route-structure--navigation)

---

## Section 2: Design Principles

### 2.1 8-Bit Retro Aesthetic (10 Non-Negotiable Rules)

The 8-bit aesthetic is the foundational visual language for Project Alpha. These rules are **mandatory** and apply to all UI components.

| Rule # | Rule | Implementation | Violation Example |
|--------|------|----------------|-------------------|
| **R1** | `border-radius` MUST be 0 or max 2px | `rounded-none` or `rounded-sm` | `rounded-lg`, `rounded-full` on cards |
| **R2** | NO blur shadows | `shadow-[4px_4px_0_0]` | `shadow-lg`, `shadow-2xl` |
| **R3** | NO glassmorphism | Solid backgrounds only | `backdrop-filter: blur()` |
| **R4** | NO gradients on surfaces | Single solid colors | `bg-gradient-to-r` on cards/buttons |
| **R5** | Background opacity MUST be >= 0.9 | `bg-card` (solid) | `bg-card/50` |
| **R6** | Spacing MUST use 4px grid | `p-4`, `gap-2`, `m-8` | `p-[13px]`, `m-[7px]` |
| **R7** | Prefer step-based animations | `steps(5, end)` | Spring/bounce physics |
| **R8** | Text contrast MUST meet WCAG AA | 4.5:1 minimum ratio | Low contrast muted text |
| **R9** | Touch targets MUST be >= 44px | `min-h-11 min-w-11` | 32px buttons |
| **R10** | Z-index MUST use tokens | `z-[var(--z-modal)]` | `z-[9999]` magic numbers |

### 2.2 ShadcnUI Integration

Project Alpha uses ShadcnUI with specific customizations for 8-bit compliance.

#### Style Configuration

```json
{
  "style": "lyra",
  "base": "radix",
  "tailwind": {
    "baseColor": "stone",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

#### Why Lyra Style?

| Aspect | Lyra Benefits |
|--------|---------------|
| **Corners** | "Boxy and sharp" by default |
| **Density** | Compact layouts |
| **Font Pairing** | Optimized for monospace (JetBrains Mono) |
| **Border Weight** | Heavier borders (2px default) |

#### Component Override Pattern

```tsx
// Every ShadcnUI component gets 8-bit treatment
<Button 
  className="rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] 
             hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]
             transition-all duration-100"
>
  Action
</Button>

<Card className="rounded-none border-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
  <CardContent>Content</CardContent>
</Card>
```

### 2.3 Accessibility First (WCAG AA Minimum)

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | 4.5:1 for normal text, 3:1 for large text |
| **Focus Indicators** | 2px orange ring, visible on all interactive elements |
| **Keyboard Navigation** | Full keyboard accessibility, logical tab order |
| **Screen Readers** | ARIA labels, live regions, semantic HTML |
| **Reduced Motion** | Respect `prefers-reduced-motion` |
| **Touch Targets** | Minimum 44x44px on all interactive elements |

#### Focus Visible Pattern

```css
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### 2.4 Mobile-First Responsive

Design starts at the smallest breakpoint (320px) and progressively enhances.

```
Mobile First Progression:

[Phone Portrait] → [Phone Landscape] → [Tablet Portrait] → 
     <480px           480-599px           600-767px

[Tablet Landscape] → [Laptop] → [Desktop]
    768-1023px       1024-1279px    >=1280px
```

| Breakpoint | Plugins | Layout |
|------------|---------|--------|
| Phone (<600px) | 1 | Full immersion, bottom sheet |
| Tablet (600-1023px) | 2 | Single panel + tabs |
| Laptop (1024-1279px) | 3 | Panel + overlay |
| Desktop (>=1280px) | 4 | Multi-panel grid |

### 2.5 Progressive Disclosure

Information and controls are revealed based on context and user intent.

| Level | Visibility | Examples |
|-------|------------|----------|
| **Level 1** | Always visible | FileTree toggle, primary actions |
| **Level 2** | Click/tap to reveal | Plugin management, settings |
| **Level 3** | Hidden by default | Advanced options, debug tools |

### 2.6 Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint** | <1.5s | Lighthouse |
| **Time to Interactive** | <3.0s | Lighthouse |
| **Layout Shift** | <0.1 CLS | Lighthouse |
| **Bundle Size (initial)** | <200KB gzipped | Build output |
| **Plugin Load** | <500ms | Custom metric |

---

## Section 3: Design Tokens Reference

### 3.1 Color System

#### Primary Colors (Orange Spectrum)

Based on MistralAI-inspired `#f97316` orange accent.

```css
:root {
  /* === Primary Orange Palette === */
  --primary: 24.6 95% 53.1%;           /* #f97316 - Brand primary */
  --primary-foreground: 0 0% 100%;     /* White text on primary */
  
  --primary-50: 24.6 100% 96.5%;       /* #fff7ed - Lightest tint */
  --primary-100: 24.6 100% 91.8%;      /* #ffedd5 - Subtle bg */
  --primary-200: 24.6 96.6% 83.1%;     /* #fed7aa - Hover bg */
  --primary-300: 24.6 97.2% 72.4%;     /* #fdba74 - Active state */
  --primary-400: 24.6 96.3% 61.2%;     /* #fb923c - Emphasis */
  --primary-500: 24.6 95% 53.1%;       /* #f97316 - Primary */
  --primary-600: 24.6 90.4% 48%;       /* #ea580c - Hover */
  --primary-700: 24.6 88.5% 40.4%;     /* #c2410c - Pressed */
  --primary-800: 24.6 79% 32.7%;       /* #9a3412 - Dark accent */
  --primary-900: 24.6 74.5% 27.8%;     /* #7c2d12 - Deepest */
}
```

#### Neutral Colors (Stone/Zinc Dark Theme)

```css
:root {
  /* === Neutral Stone/Zinc Palette === */
  --background: 240 6% 4%;             /* #0f0f11 - Deep black */
  --foreground: 0 0% 95%;              /* Near white text */
  
  --neutral-50: 0 0% 98%;              /* #fafafa */
  --neutral-100: 0 0% 96%;             /* #f5f5f5 */
  --neutral-200: 0 0% 90%;             /* #e5e5e5 */
  --neutral-300: 0 0% 83%;             /* #d4d4d4 */
  --neutral-400: 0 0% 64%;             /* #a3a3a3 */
  --neutral-500: 0 0% 45%;             /* #737373 */
  --neutral-600: 0 0% 32%;             /* #525252 */
  --neutral-700: 0 0% 25%;             /* #404040 */
  --neutral-800: 0 0% 15%;             /* #262626 */
  --neutral-900: 0 0% 9%;              /* #171717 */
  --neutral-950: 0 0% 4%;              /* #0a0a0a */
}
```

#### Semantic Colors

```css
:root {
  /* === Semantic Status Colors === */
  
  /* Success - Green */
  --success: 142 71% 45%;              /* #22c55e */
  --success-foreground: 0 0% 100%;
  
  /* Warning - Amber */
  --warning: 38 92% 50%;               /* #f59e0b */
  --warning-foreground: 0 0% 0%;
  
  /* Error/Destructive - Red */
  --destructive: 0 84% 60%;            /* #ef4444 */
  --destructive-foreground: 0 0% 100%;
  
  /* Info - Blue */
  --info: 217 91% 60%;                 /* #3b82f6 */
  --info-foreground: 0 0% 100%;
}
```

#### Surface Colors (Background Layers)

```css
:root {
  /* === Surface Hierarchy === */
  --surface-0: 240 6% 4%;              /* #0f0f11 - Base background */
  --surface-1: 240 4% 10%;             /* #18181b - Cards, panels */
  --surface-2: 240 4% 16%;             /* #27272a - Elevated surfaces */
  --surface-3: 240 4% 22%;             /* #3f3f46 - Highest elevation */
  
  /* ShadcnUI Token Mapping */
  --card: 240 4% 10%;
  --card-foreground: 0 0% 95%;
  --popover: 240 4% 10%;
  --popover-foreground: 0 0% 95%;
  --secondary: 240 4% 16%;
  --secondary-foreground: 0 0% 90%;
  --muted: 240 4% 16%;
  --muted-foreground: 0 0% 60%;
  --accent: 240 4% 16%;
  --accent-foreground: 0 0% 95%;
}
```

#### Border and Input Colors

```css
:root {
  /* === Border Colors === */
  --border: 240 4% 16%;                /* #27272a - Default border */
  --border-muted: 240 4% 12%;          /* Subtle border */
  --border-emphasis: 240 4% 25%;       /* Strong border */
  --border-focus: 24.6 95% 53.1%;      /* Orange focus ring */
  
  /* Input/Ring states */
  --input: 240 4% 16%;
  --ring: 24.6 95% 53.1%;              /* Focus ring */
}
```

### 3.2 Typography Scale

#### Font Families

```css
:root {
  /* === Font Stacks === */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 
               BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 
               Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  --font-pixel: 'VT323', 'Press Start 2P', monospace;
}
```

| Font | Usage |
|------|-------|
| `--font-sans` (Inter) | Prose, body text, descriptions |
| `--font-mono` (JetBrains Mono) | Code, terminal, UI elements, technical content |
| `--font-pixel` (VT323) | Headers, decorative elements, retro emphasis |

#### Font Sizes (Pixel-Perfect Scale)

```css
:root {
  /* === Type Scale (4px base unit) === */
  --text-xs: 0.75rem;                  /* 12px */
  --text-sm: 0.875rem;                 /* 14px */
  --text-base: 1rem;                   /* 16px - Base */
  --text-lg: 1.125rem;                 /* 18px */
  --text-xl: 1.25rem;                  /* 20px */
  --text-2xl: 1.5rem;                  /* 24px */
  --text-3xl: 1.875rem;                /* 30px */
  --text-4xl: 2.25rem;                 /* 36px */
  --text-5xl: 3rem;                    /* 48px */
}
```

#### Font Weights

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Line Heights

```css
:root {
  --leading-tight: 1.25;               /* Headings, pixel fonts */
  --leading-normal: 1.5;               /* Body text */
  --leading-relaxed: 1.75;             /* Long-form prose */
  --leading-loose: 2;                  /* Large text blocks */
}
```

#### Letter Spacing

```css
:root {
  /* Vietnamese diacritics: avoid tight tracking */
  --tracking-tighter: -0.05em;         /* Use sparingly */
  --tracking-tight: -0.025em;          /* Headlines only */
  --tracking-normal: 0em;              /* Default */
  --tracking-wide: 0.025em;            /* Labels, buttons */
  --tracking-wider: 0.05em;            /* All caps text */
}
```

### 3.3 Spacing System (4px Grid)

```css
:root {
  /* === 4px Grid Spacing Scale === */
  --spacing-0: 0px;                    /* 0 */
  --spacing-px: 1px;                   /* 1px - borders only */
  --spacing-0.5: 0.125rem;             /* 2px */
  --spacing-1: 0.25rem;                /* 4px - Base unit */
  --spacing-1.5: 0.375rem;             /* 6px */
  --spacing-2: 0.5rem;                 /* 8px */
  --spacing-3: 0.75rem;                /* 12px */
  --spacing-4: 1rem;                   /* 16px */
  --spacing-5: 1.25rem;                /* 20px */
  --spacing-6: 1.5rem;                 /* 24px */
  --spacing-8: 2rem;                   /* 32px */
  --spacing-10: 2.5rem;                /* 40px */
  --spacing-12: 3rem;                  /* 48px */
  --spacing-16: 4rem;                  /* 64px */
  --spacing-20: 5rem;                  /* 80px */
  --spacing-24: 6rem;                  /* 96px */
}
```

#### Component Spacing Conventions

```css
:root {
  /* Button padding */
  --padding-button-sm: 4px 8px;
  --padding-button-md: 8px 16px;
  --padding-button-lg: 12px 24px;
  
  /* Input padding */
  --padding-input-sm: 6px 8px;
  --padding-input-md: 8px 12px;
  --padding-input-lg: 10px 16px;
  
  /* Card padding */
  --padding-card-sm: 12px;
  --padding-card-md: 16px;
  --padding-card-lg: 24px;
  
  /* Component gaps */
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 32px;
}
```

### 3.4 Border & Shadow Tokens

#### Border Radius (8-bit Sharp Corners)

```css
:root {
  /* 8-BIT RULE: Maximum 2px for subtle rounding */
  --radius-none: 0px;                  /* Sharp corners - DEFAULT */
  --radius-sm: 0.125rem;               /* 2px - Maximum allowed */
  --radius-base: 0px;                  /* Use none as base */
  
  /* ShadcnUI override */
  --radius: 0rem;                      /* Force squared corners */
}
```

#### Border Widths

```css
:root {
  --border-width-0: 0px;
  --border-width-1: 1px;               /* Subtle */
  --border-width-2: 2px;               /* Default */
  --border-width-4: 4px;               /* Strong emphasis */
}
```

#### Pixel Shadows (8-bit Style)

```css
:root {
  /* NO BLUR - Hard drop shadows only */
  
  --shadow-none: none;
  
  /* Standard pixel shadows */
  --shadow-pixel-xs: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-sm: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel: 4px 4px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-md: 4px 4px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-lg: 6px 6px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-xl: 8px 8px 0px 0px rgba(0, 0, 0, 0.5);
  
  /* Colored pixel shadows */
  --shadow-pixel-primary: 4px 4px 0px 0px #c2410c;
  --shadow-pixel-success: 4px 4px 0px 0px #15803d;
  --shadow-pixel-warning: 4px 4px 0px 0px #b45309;
  --shadow-pixel-destructive: 4px 4px 0px 0px #b91c1c;
  
  /* Inset shadow (pressed state) */
  --shadow-pixel-inset: inset 2px 2px 0px 0px rgba(0, 0, 0, 0.3);
  
  /* Hover lift effect */
  --shadow-pixel-hover: 6px 6px 0px 0px rgba(0, 0, 0, 0.5);
}
```

### 3.5 Animation Tokens

#### Durations

```css
:root {
  --duration-instant: 0ms;             /* No animation */
  --duration-fastest: 50ms;            /* Micro-interactions */
  --duration-fast: 100ms;              /* Quick feedback */
  --duration-normal: 150ms;            /* Standard transitions */
  --duration-slow: 200ms;              /* Deliberate animations */
  --duration-slower: 300ms;            /* Complex animations */
  --duration-slowest: 500ms;           /* Page transitions */
}
```

#### Timing Functions (8-bit Step-Based)

```css
:root {
  /* Step-based (authentic 8-bit) - PREFERRED */
  --ease-8bit-2: steps(2, end);        /* 2-frame animation */
  --ease-8bit-3: steps(3, end);        /* 3-frame animation */
  --ease-8bit-4: steps(4, end);        /* 4-frame animation */
  --ease-8bit-5: steps(5, end);        /* 5-frame animation */
  --ease-8bit-8: steps(8, end);        /* 8-frame animation */
  --ease-8bit-10: steps(10, end);      /* 10-frame animation */
  
  /* Smooth alternatives (use sparingly) */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 8-bit cubic bezier (project default) */
  --ease-8bit-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

#### Transition Presets

```css
:root {
  --transition-fast: 100ms var(--ease-8bit-smooth);
  --transition-normal: 150ms var(--ease-8bit-smooth);
  --transition-slow: 200ms var(--ease-8bit-smooth);
  
  /* 8-bit step transitions */
  --transition-8bit-fast: 100ms var(--ease-8bit-5);
  --transition-8bit-normal: 150ms var(--ease-8bit-5);
}
```

#### Animation Keyframes

```css
/* 8-bit blink cursor */
@keyframes blink-cursor {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.cursor-8bit {
  animation: blink-cursor 1s steps(2, start) infinite;
}

/* Pixel-perfect step transition */
.transition-8bit {
  transition-timing-function: steps(5, end);
  transition-duration: 200ms;
}
```

### 3.6 Z-Index Hierarchy (12-Tier Scale)

```css
:root {
  /* === Z-Index Scale (STRICTLY ENFORCE) === */
  --z-base: 0;                         /* Default content */
  --z-docked: 5;                       /* Docked elements */
  --z-dropdown: 10;                    /* Dropdowns, tooltips */
  --z-sticky: 20;                      /* Sticky headers */
  --z-sidebar: 30;                     /* Fixed sidebars */
  --z-panel: 40;                       /* Fixed panels */
  --z-modal-backdrop: 45;              /* Modal backdrop */
  --z-modal: 50;                       /* Modals, dialogs */
  --z-toast: 60;                       /* Toast notifications */
  --z-popover: 70;                     /* Priority popovers */
  --z-overlay: 80;                     /* Full-screen overlays */
  --z-alert: 90;                       /* Critical alerts */
  --z-debug: 100;                      /* Debug tools (dev only) */
}
```

#### Z-Index Usage Guide

| Layer | Token | Use Case |
|-------|-------|----------|
| 0 | `--z-base` | Regular page content |
| 5 | `--z-docked` | Fixed elements within content flow |
| 10 | `--z-dropdown` | Dropdown menus, hover tooltips |
| 20 | `--z-sticky` | Sticky navigation, table headers |
| 30 | `--z-sidebar` | Activity bar, side panels |
| 40 | `--z-panel` | Status overlays, floating panels |
| 45 | `--z-modal-backdrop` | Dark overlay behind modals |
| 50 | `--z-modal` | Dialog boxes, modal windows |
| 60 | `--z-toast` | Sonner/toast notifications |
| 70 | `--z-popover` | Command palette, priority popups |
| 80 | `--z-overlay` | Full-screen loading overlays |
| 90 | `--z-alert` | Critical error dialogs |
| 100 | `--z-debug` | DevTools overlays (never ship) |

---

## Section 4: Responsive Grid System

### 4.1 Breakpoint Definitions (6 Tiers)

| Tier | Name | Min Width | Max Width | Orientation | Max Plugins |
|------|------|-----------|-----------|-------------|-------------|
| 1 | Desktop | 1280px | unlimited | Landscape | 4 |
| 2 | Laptop | 1024px | 1279px | Landscape | 3 |
| 3 | Tablet Landscape | 768px | 1023px | Landscape | 2 |
| 4 | Tablet Portrait | 600px | 767px | Portrait | 2 |
| 5 | Phone Landscape | 480px | 599px | Landscape | 1 |
| 6 | Phone Portrait | 0px | 479px | Portrait | 1 |

#### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '480px',      // Phone landscape
      'md': '600px',      // Tablet portrait  
      'lg': '768px',      // Tablet landscape
      'xl': '1024px',     // Laptop
      '2xl': '1280px',    // Desktop
      
      // Custom queries
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      'touch': { 'raw': '(hover: none)' },
    },
  },
};
```

### 4.2 Desktop Layout Specification

#### Grid Structure: `[0.5:(0.5:2:4:2.5:0.5)]`

```
Desktop Full Layout (>=1280px)

+------+------+--------+----------------+----------+------+
| 0.5  | 0.5  |   2    |       4        |   2.5    | 0.5  |
+------+------+--------+----------------+----------+------+
|Global|Act.  |Plugin  |Main Content    |Plugin    |Act.  |
|Side- |Bar   |Left    |(Notes/Monaco)  |Right     |Bar   |
|bar   |LEFT  |(Files) |+Activity TOP   |(Chat)    |RIGHT |
+------+------+--------+----------------+----------+------+
| 48px | 48px |minmax  |   minmax       | minmax   | 48px |
|      |      |200,1fr |  400,2fr       | 250,1.25 |      |
+------+------+--------+----------------+----------+------+
```

#### Ratio-to-Pixel Mapping

| Zone | Ratio | Min Width | Max Width | CSS Value |
|------|-------|-----------|-----------|-----------| 
| Global Sidebar | 0.5 | 48px | 48px | `var(--sidebar-width)` |
| Activity Bar LEFT | 0.5 | 48px | 48px | `var(--activity-bar-width)` |
| Plugin Panel LEFT | 2 | 200px | 320px | `minmax(200px, 1fr)` |
| Main Content | 4 | 400px | unlimited | `minmax(400px, 2fr)` |
| Plugin Panel RIGHT | 2.5 | 250px | 400px | `minmax(250px, 1.25fr)` |
| Activity Bar RIGHT | 0.5 | 48px | 48px | `var(--activity-bar-width)` |

#### CSS Grid Implementation

```css
:root {
  /* Grid dimensions */
  --sidebar-width: 48px;
  --activity-bar-width: 48px;
  --status-bar-height: 24px;
  --header-height: 48px;
  
  /* Panel constraints */
  --panel-left-min: 200px;
  --panel-left-max: 320px;
  --panel-right-min: 250px;
  --panel-right-max: 400px;
  --main-content-min: 400px;
}

/* Desktop Full Layout */
.project-space--desktop {
  display: grid;
  grid-template-columns:
    var(--sidebar-width)
    var(--activity-bar-width)
    minmax(var(--panel-left-min), 1fr)
    minmax(var(--main-content-min), 2fr)
    minmax(var(--panel-right-min), 1.25fr)
    var(--activity-bar-width);
  grid-template-rows:
    var(--header-height)
    1fr
    var(--status-bar-height);
  grid-template-areas:
    "header header header header header header"
    "sidebar activity-left panel-left main panel-right activity-right"
    "status status status status status status";
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}
```

### 4.3 Plugin Limit Matrix by Device

| Device Type | Max Plugins | Always-Loaded | Optional | Layout |
|-------------|-------------|---------------|----------|--------|
| Desktop (>=1280px) | 4 | FileTree, Chat | Monaco, Notes, Terminal, Preview | Multi-panel |
| Laptop (1024-1279px) | 3 | FileTree, Chat | Monaco, Notes | Panel + overlay |
| Tablet Landscape | 2 | FileTree | Notes, Chat | Single + tabs |
| Tablet Portrait | 2 | FileTree | Notes, Chat | Full-screen + nav |
| Phone Landscape | 1 | - | Notes, Chat, FileTree | Swipe |
| Phone Portrait | 1 | - | Notes, Chat | Full immersion |

#### Plugin Availability by Platform

| Plugin | Desktop FSA | Desktop IDB | Tablet | Mobile |
|--------|-------------|-------------|--------|--------|
| **FileTree** | Always | Always | Yes | Yes |
| **Monaco** | Yes | Yes (limited) | Yes | No |
| **Notes** | Yes | Yes | Yes | Yes |
| **Terminal** | Yes | No | No | No |
| **Preview** | Yes | No | No | No |
| **Chat** | Always | Always | Yes | Yes |

### 4.4 Responsive Layout Variants

#### Laptop (1024-1279px)

```
+----+----+------+--------------------------------+----+
|    |    |      |    [Activity Bar TOP]          |    |
| G  | A  | FT   |________________________________| A  |
| S  | L  |      |        Notes / Monaco          | R  |
+----+----+------+--------------------------------+----+

Right panel (Chat) = overlay triggered by Activity Bar button
```

#### Tablet Portrait (600-767px)

```
+----------------------------------------+
|        [Header: Project + Menu]        |
+----------------------------------------+
|                                        |
|          Active Plugin                 |
|          (Full Screen)                 |
|                                        |
+----------------------------------------+
|  Files  |  Notes  |  Chat  |   More   |
+----------------------------------------+
|              Bottom Nav (56px)         |
```

#### Phone Portrait (<480px)

```
+--------------------------------+
|  [=]  Project Name     [...]  |
+--------------------------------+
|                                |
|      Active Plugin             |
|      (Full Immersion)          |
|                                |
+--------------------------------+
        ^
        | Pull up for actions
+--------------------------------+
|       Bottom Sheet             |
|   Switch Plugin | Settings     |
+--------------------------------+
```

### 4.5 Tailwind Responsive Utilities

```html
<!-- Visibility by breakpoint -->
<div class="
  hidden          /* Phone portrait */
  sm:hidden       /* Phone landscape */
  md:block        /* Tablet portrait+ */
  lg:flex         /* Tablet landscape+ */
  xl:grid         /* Laptop+ */
  2xl:inline      /* Desktop+ */
">

<!-- Plugin Panel LEFT -->
<section class="
  hidden
  lg:block
  min-w-[200px] max-w-[320px]
  bg-background
  border-r-2 border-border
  overflow-auto
">

<!-- Mobile Bottom Nav -->
<nav class="
  fixed bottom-0 left-0 right-0
  flex justify-around items-center
  h-14 pb-safe
  bg-card
  border-t-2 border-border
  lg:hidden
">
```

---

## Section 5: Global Components

### 5.1 GlobalSidebar

The primary navigation sidebar that persists across all routes.

#### ASCII Wireframe

```
EXPANDED (240px)                    COLLAPSED (48px)
+------------------------------+    +--------+
| [LOGO] Via-gent          [-]|    |[LOGO]  |
+------------------------------+    +--------+
|                              |    |        |
| [H] Hub                      |    |  [H]   |
| [P] Projects                 |    |  [P]   |
|                              |    |        |
| RECENT PROJECTS              |    |        |
| * Project Alpha              |    |        |
| * Notes Demo                 |    |        |
|                              |    |        |
|------------------------------|    |--------|
| [S] Settings                 |    |  [S]   |
| [D/L] Theme  [EN/VI] Lang    |    | [D][E] |
| [<] Collapse                 |    |  [>]   |
+------------------------------+    +--------+

MOBILE (320px drawer overlay)
+--------------------------------+
| [LOGO] Via-gent            [X] |
+--------------------------------+
|                                |
| [H] Hub                  44px  |
| [P] Projects             44px  |
|                                |
| RECENT PROJECTS                |
| * Project Alpha                |
+--------------------------------+
| [S] Settings             44px  |
| [D/L] Theme  [EN/VI] Lang      |
+--------------------------------+
```

#### Props Interface

```typescript
interface GlobalSidebarProps {
  /** Additional CSS classes */
  className?: string;
}

// Internal state managed by useLayoutStore
interface SidebarState {
  /** Whether sidebar is collapsed (48px) or expanded (240px) */
  sidebarCollapsed: boolean;
  /** Whether mobile drawer is open */
  sidebarMobileOpen: boolean;
  /** Currently active navigation item ID */
  activeNavItem: 'home' | 'projects' | 'settings' | null;
}
```

#### States and Events

| State | Type | Source | Description |
|-------|------|--------|-------------|
| `sidebarCollapsed` | `boolean` | `useLayoutStore` | Desktop collapse state |
| `sidebarMobileOpen` | `boolean` | `useLayoutStore` | Mobile drawer visibility |
| `activeNavItem` | `string \| null` | `useLayoutStore` | Currently highlighted nav item |
| `recentProjects` | `Project[]` | `useRecentProjects(5)` | Last 5 accessed projects |

| Event | Payload | Description |
|-------|---------|-------------|
| `onNavigate` | `{ path: string, itemId: string }` | Route navigation triggered |
| `onToggleCollapse` | `void` | Collapse/expand toggled |
| `onMobileClose` | `void` | Mobile drawer close requested |
| `onThemeToggle` | `'light' \| 'dark'` | Theme changed |
| `onLocaleToggle` | `'en' \| 'vi'` | Language changed |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` (mobile) | Hidden by default, overlay drawer from left (320px) |
| `768px - 1023px` (tablet) | Visible, collapsed by default (48px) |
| `>= 1024px` (desktop) | Visible, expanded by default (240px) |

#### Keyboard Shortcuts

- `Cmd/Ctrl + B`: Toggle sidebar collapse
- `Cmd/Ctrl + Shift + T`: Toggle theme
- `Tab`: Navigate between items
- `Escape`: Close mobile drawer

### 5.2 GlobalHeader

Context bar with project info, navigation, and actions.

#### ASCII Wireframe

```
DESKTOP (>= 768px)
+--------------------------------------------------------------------------------+
| [=] [LOGO] Via-gent | Hub | [Preset v] [Plugins...] ||| [Search  Cmd+K] [S] [U] |
+--------------------------------------------------------------------------------+

MOBILE (< 768px)
+------------------------------------------------+
| [=] [LOGO] Via-gent          [Search] [S] [U]  |
+------------------------------------------------+
```

#### Props Interface

```typescript
interface GlobalHeaderProps {
  /** Additional CSS classes */
  className?: string;
}

interface NavItem {
  key: string;
  path: string;
  labelKey: string; // i18n key
}

const NAV_ITEMS: readonly NavItem[] = [
  { key: 'home', path: '/', labelKey: 'navigation.home' },
];
```

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Show hamburger, hide nav links, hide preset selector, compact search |
| `< 1024px` | Hide plugin toggles |
| `>= 1024px` | Full layout with all elements |

### 5.3 Breadcrumbs

Route hierarchy navigation with smart truncation.

#### ASCII Wireframe

```
DESKTOP (>= 640px)
+------------------------------------------------------------------+
| Hub > My Project > Notes > Meeting Notes                         |
+------------------------------------------------------------------+

DESKTOP TRUNCATED (> 4 items)
+------------------------------------------------------------------+
| Hub > ... > Notes > Meeting Notes                                |
+------------------------------------------------------------------+

MOBILE (< 640px)
+------------------------------------------------------------------+
| <- Meeting Notes                                                  |
+------------------------------------------------------------------+
```

#### Props Interface

```typescript
interface BreadcrumbsProps {
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string; // undefined = current page (not clickable)
}
```

#### Truncation Rules

| Condition | Behavior |
|-----------|----------|
| Items <= 4 | Show all items |
| Items > 4 | Show first, ellipsis dropdown, last 2 |
| Label > 200px | Truncate with ellipsis |
| Mobile | Show back arrow + current label only |

### 5.4 StatusBar (SystemRail)

System status, sync state, and shortcuts at bottom of screen.

#### ASCII Wireframe

```
DESKTOP (always visible, 24px height)
+--------------------------------------------------------------------------------+
| [Bot] Agent Ready    |    Ln 42, Col 15    |    [!] 0    [Sync] Synced    [^]  |
+--------------------------------------------------------------------------------+

EXPANDED (with terminal drawer, 200px additional)
+--------------------------------------------------------------------------------+
| [Bot] Agent Ready    |    Ln 42, Col 15    |    [!] 0    [Sync] Synced    [v]  |
+--------------------------------------------------------------------------------+
| > Terminal                                                                     |
| $ npm run dev                                                                  |
| Starting development server...                                                 |
+--------------------------------------------------------------------------------+
```

#### Props Interface

```typescript
interface StatusBarProps {
  agentStatus?: 'idle' | 'working' | 'error';
  agentError?: string;
  line?: number;
  column?: number;
  problemsCount?: number;
  syncStatus?: 'synced' | 'syncing' | 'error';
  className?: string;
}
```

#### Content Sections

| Section | Content |
|---------|---------|
| **Left** | Agent status icon + text |
| **Center** | Editor position: "Ln {line}, Col {column}" |
| **Right** | Problems count, Sync status, Terminal toggle |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Hidden entirely, use toast notifications |
| `768px - 1023px` | Compact mode: icons only |
| `>= 1024px` | Full layout with all information |

### 5.5 Navigation System Patterns

#### Route Transition Behavior

```yaml
Instant Navigation:
  threshold: 100ms
  behavior: No loading indicator for fast transitions
  implementation: TanStack Router loader

Loading States:
  - Skeleton loading for content areas
  - Preserve header/sidebar during load
  - Progressive reveal of content

Scroll Position:
  - Preserve on back navigation
  - Reset to top on new navigation
  - Restore per-route via sessionStorage
```

#### Prefetching Strategy

```typescript
const routes = {
  '/projects': {
    preload: 'intent', // Prefetch on hover/focus
  },
  '/$projectId': {
    preload: 'viewport', // Prefetch when visible
    preloadDelay: 50,
  },
};
```

---

## Section 6: Route Structure & Navigation

### 6.1 Route Hierarchy

```
/                           # Hub/Home - Project list and quick actions
├── /projects               # Projects list (alternative view)
├── /$projectId             # Project workspace (IDE layout)
│   └── ?preset=notes       # With specific preset active
│   └── ?plugins=a,b,c      # With specific plugins active
│   └── ?file=path/to/file  # With specific file open
├── /settings               # Global settings
│   ├── /settings/api-keys  # API key management
│   ├── /settings/vault     # Secure storage
│   └── /settings/theme     # Theme preferences
└── /agents                 # Agent management (future)
```

### 6.2 URL State Management

| Parameter | Example | Purpose |
|-----------|---------|---------|
| `preset` | `?preset=ide` | Active layout preset (ide, notes, split) |
| `plugins` | `?plugins=filetree,monaco,chat` | Active plugin list |
| `file` | `?file=src/index.ts` | Currently open file path |
| `line` | `?line=42` | Editor scroll position |

### 6.3 Deep Linking Requirements

```yaml
Share Link Contents:
  - Project ID (required)
  - Active file path (optional)
  - Preset/layout (optional)
  
Exclude from URLs:
  - Transient UI state (modal open, dropdown)
  - Scroll positions (use session storage)
  - Unsaved changes (prompt before navigation)
```

### 6.4 Route Transitions

#### Loading States

```typescript
// Route loader with skeleton
export const Route = createFileRoute('/$projectId')({
  loader: async ({ params }) => {
    // Show skeleton immediately
    return defer({
      project: loadProject(params.projectId),
      files: loadFileTree(params.projectId),
    });
  },
  pendingComponent: ProjectSkeleton,
  errorComponent: ProjectError,
});
```

#### Transition Timing

| Transition | Duration | Animation |
|------------|----------|-----------|
| Route change | 150ms | Fade content |
| Panel toggle | 100ms | Slide + fade |
| Modal open | 200ms | Scale + fade |
| Drawer slide | 200ms | Translate |

### 6.5 Back/Forward Navigation

```yaml
Browser Buttons:
  - Always respect browser back/forward
  - Maintain scroll position
  - Preserve form state (warn if dirty)

Custom Back Button (Mobile):
  - Show in header when depth > 1
  - Navigate to parent route
  - Use platform-native gesture when available

History State:
  - Push new state on navigation
  - Replace state on filter/sort changes
  - Don't add history for modals/drawers
```

### 6.6 Mobile Navigation Patterns

#### Bottom Navigation

```
+-------+-------+-------+-------+
| Files | Notes | Chat  | More  |
|  [F]  |  [N]  |  [C]  |  ...  |
+-------+-------+-------+-------+
```

| Tab | Icon | Route/Action |
|-----|------|--------------|
| Files | `Folder` | Toggle FileTree plugin |
| Notes | `NotebookPen` | Switch to Notes plugin |
| Chat | `MessageSquare` | Switch to Chat plugin |
| More | `MoreHorizontal` | Open bottom sheet menu |

#### Gesture Support

| Gesture | Action |
|---------|--------|
| Swipe left | Switch to next plugin |
| Swipe right | Switch to previous plugin |
| Pull up | Open bottom sheet |
| Edge swipe | Open sidebar drawer |

### 6.7 Error Handling

#### 404 Not Found

```yaml
Display:
  - Custom 8-bit styled 404 page
  - Pixel art confused robot
  - "Page not found" in VT323 font
  
Actions:
  - Link back to Hub
  - Search suggestions
  - Recent projects list
```

#### Permission Error (FSA)

```yaml
Display:
  - PermissionOverlay component
  - Clear explanation of why permission needed
  - File System Access API context
  
Actions:
  - "Grant Permission" button (primary)
  - "Skip" button (secondary)
  - "Use IndexedDB instead" option
```

#### Network Error

```yaml
Display:
  - Offline indicator in status bar
  - Toast notification on disconnect
  
Behavior:
  - Queue actions for retry
  - Graceful degradation
  - Show cached content when available
```

---

## Appendix A: Design Token Quick Reference

```
+===============================================================+
|                    8-BIT DESIGN TOKENS                        |
|                    QUICK REFERENCE                            |
+===============================================================+

COLORS
  Primary:        hsl(var(--primary))        #f97316
  Background:     hsl(var(--background))     #0f0f11
  Card:           hsl(var(--card))           #18181b
  Border:         hsl(var(--border))         #27272a
  Text:           hsl(var(--foreground))     Near white

SHADOWS (No Blur!)
  Small:          var(--shadow-pixel-sm)     2px 2px
  Default:        var(--shadow-pixel)        4px 4px
  Large:          var(--shadow-pixel-lg)     6px 6px

BORDER RADIUS
  Default:        0px (squared)
  Maximum:        2px (var(--radius-sm))

SPACING (4px Grid)
  1: 4px   2: 8px    3: 12px   4: 16px
  5: 20px  6: 24px   8: 32px   10: 40px

Z-INDEX
  Dropdown: 10  Modal: 50  Toast: 60  Overlay: 80

FONTS
  UI/Code:        font-mono (JetBrains Mono)
  Pixel:          font-pixel (VT323)
  Prose:          font-sans (Inter)

ANIMATION
  Fast:           100ms steps(5, end)
  Normal:         150ms steps(5, end)

+===============================================================+
```

---

## Appendix B: DO vs DON'T Visual Guide

```
=================================================================
                    8-BIT DESIGN: DO vs DON'T
=================================================================

BORDERS & CORNERS
-----------------------------------------------------------------
  DO (Sharp):              DON'T (Rounded):
  +----------------+       /----------------\
  |                |      |                  |
  |    Content     |      |    Content       |
  |                |      |                  |
  +----------------+       \----------------/


SHADOWS
-----------------------------------------------------------------
  DO (Pixel):              DON'T (Blur):
  +------------+           +------------+
  |            |           |            |  <--- blurry edge
  |   Card     |__         |   Card     |)))
  |            | |         |            |
  +------------+ |         +------------+
     |___________|


BACKGROUNDS
-----------------------------------------------------------------
  DO (Solid):              DON'T (Gradient/Glass):
  +----------------+       +----------------+
  | ############## |       | ........////// |
  | ############## |       | ....../////    |
  | ############## |       | ...//////      |
  +----------------+       +----------------+
     100% opacity          gradient + blur


SPACING (4px Grid)
-----------------------------------------------------------------
  DO:                      DON'T:
  +--+--+--+--+--+--+     +---+-+----+--+
  |  |  |  |  |  |  |     |   | |    |  |
  4px 8px 12px 16px       3px 7px 13px 19px
  
  ALIGN TO GRID!           ARBITRARY VALUES!

=================================================================
```

---

**End of Part A (Sections 1-6)**

**Document Version**: 3.0.0
**Lines**: ~1500
**Created**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
**Next**: Part B (Sections 7-9) and Part C (Sections 10-12)
