# 8-Bit Design Tokens Specification

**Document ID**: UX-DESIGN-02A  
**Version**: 1.0.0  
**Date**: 2026-01-27  
**Agent**: ux-designer-ext  
**Status**: APPROVED

---

## Executive Summary

This document defines the comprehensive design token system for Project Alpha's VIA-GENT 8-bit retro aesthetic. It builds upon the existing ShadcnUI integration (Lyra style, stone base) and extends it with strict 8-bit design rules.

**Design Philosophy**: Premium retro gaming aesthetic without kitsch - clean, functional, and accessible.

---

## Table of Contents

1. [Color Tokens](#1-color-tokens)
2. [Typography Tokens](#2-typography-tokens)
3. [Spacing Tokens](#3-spacing-tokens)
4. [Border & Shadow Tokens](#4-border--shadow-tokens)
5. [Animation Tokens](#5-animation-tokens)
6. [Z-Index Tokens](#6-z-index-tokens)
7. [8-Bit Design Rules](#7-8-bit-design-rules)
8. [ShadcnUI Integration](#8-shadcnui-integration)
9. [Usage Examples](#9-usage-examples)
10. [DO and DON'T Guide](#10-do-and-dont-guide)

---

## 1. Color Tokens

### 1.1 Primary Colors (Orange Spectrum)

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
  --primary-950: 24.6 81.2% 14.5%;     /* #431407 - Text on light */
}
```

### 1.2 Neutral Colors (Stone/Zinc Dark Theme)

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

### 1.3 Semantic Colors

```css
:root {
  /* === Semantic Status Colors === */
  
  /* Success - Green */
  --success: 142 71% 45%;              /* #22c55e */
  --success-foreground: 0 0% 100%;
  --success-50: 142 76% 96.7%;         /* #f0fdf4 */
  --success-500: 142 71% 45%;          /* #22c55e */
  --success-700: 142 72% 29%;          /* #15803d */
  
  /* Warning - Amber */
  --warning: 38 92% 50%;               /* #f59e0b */
  --warning-foreground: 0 0% 0%;
  --warning-50: 38 100% 96%;           /* #fffbeb */
  --warning-500: 38 92% 50%;           /* #f59e0b */
  --warning-700: 38 91% 37%;           /* #b45309 */
  
  /* Error/Destructive - Red */
  --destructive: 0 84% 60%;            /* #ef4444 */
  --destructive-foreground: 0 0% 100%;
  --destructive-50: 0 100% 97%;        /* #fef2f2 */
  --destructive-500: 0 84% 60%;        /* #ef4444 */
  --destructive-700: 0 74% 42%;        /* #b91c1c */
  
  /* Info - Blue */
  --info: 217 91% 60%;                 /* #3b82f6 */
  --info-foreground: 0 0% 100%;
  --info-50: 217 100% 97%;             /* #eff6ff */
  --info-500: 217 91% 60%;             /* #3b82f6 */
  --info-700: 217 76% 48%;             /* #1d4ed8 */
}
```

### 1.4 Surface Colors (Background Layers)

```css
:root {
  /* === Surface Hierarchy === */
  --surface-0: 240 6% 4%;              /* #0f0f11 - Base background */
  --surface-1: 240 4% 10%;             /* #18181b - Cards, panels */
  --surface-2: 240 4% 16%;             /* #27272a - Elevated surfaces */
  --surface-3: 240 4% 22%;             /* #3f3f46 - Highest elevation */
  
  /* Mapped to ShadcnUI tokens */
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

### 1.5 Border Colors

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

### 1.6 Text Colors

```css
:root {
  /* === Text Hierarchy === */
  --text-primary: 0 0% 95%;            /* Primary text - near white */
  --text-secondary: 0 0% 70%;          /* Secondary text */
  --text-muted: 0 0% 60%;              /* Muted/disabled text */
  --text-disabled: 0 0% 40%;           /* Disabled state */
  --text-inverse: 0 0% 5%;             /* Text on light backgrounds */
  --text-link: 24.6 95% 53.1%;         /* Link color - primary */
  --text-link-hover: 24.6 95% 63%;     /* Link hover */
}
```

### 1.7 8-Bit Retro Colors (Optional Accent Palette)

```css
:root {
  /* === NES-Inspired Retro Palette === */
  --retro-red: #ff0000;
  --retro-orange: #ff8000;
  --retro-yellow: #ffff00;
  --retro-green: #00ff00;
  --retro-cyan: #00ffff;
  --retro-blue: #0000ff;
  --retro-magenta: #ff00ff;
  --retro-purple: #8000ff;
  
  /* CRT Glow Effects */
  --glow-primary: 0 0 10px hsl(var(--primary)), 
                  0 0 20px hsl(var(--primary) / 0.5);
  --glow-success: 0 0 10px hsl(var(--success)), 
                  0 0 20px hsl(var(--success) / 0.5);
}
```

---

## 2. Typography Tokens

### 2.1 Font Families

```css
:root {
  /* === Font Stacks === */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, 
               BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 
               Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  --font-pixel: 'VT323', 'Press Start 2P', monospace;
  
  /* Usage guidance */
  /* font-sans:  Prose, body text, descriptions */
  /* font-mono:  Code, terminal, UI elements, technical content */
  /* font-pixel: Headers, decorative elements, retro emphasis */
}
```

### 2.2 Font Sizes (Pixel-Perfect Scale)

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
  
  /* Pixel display sizes (for VT323/Press Start 2P) */
  --text-pixel-sm: 0.875rem;           /* 14px - for inline */
  --text-pixel-base: 1rem;             /* 16px - standard */
  --text-pixel-lg: 1.25rem;            /* 20px - headings */
  --text-pixel-xl: 1.5rem;             /* 24px - titles */
}
```

### 2.3 Font Weights

```css
:root {
  /* === Font Weights === */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 2.4 Line Heights

```css
:root {
  /* === Line Heights === */
  --leading-tight: 1.25;               /* Headings, pixel fonts */
  --leading-normal: 1.5;               /* Body text */
  --leading-relaxed: 1.75;             /* Long-form prose */
  --leading-loose: 2;                  /* Large text blocks */
}
```

### 2.5 Letter Spacing

```css
:root {
  /* === Letter Spacing === */
  /* Vietnamese diacritics consideration: avoid tight tracking */
  --tracking-tighter: -0.05em;         /* Use sparingly */
  --tracking-tight: -0.025em;          /* Headlines only */
  --tracking-normal: 0em;              /* Default */
  --tracking-wide: 0.025em;            /* Labels, buttons */
  --tracking-wider: 0.05em;            /* All caps text */
  --tracking-widest: 0.1em;            /* Decorative */
}
```

---

## 3. Spacing Tokens

### 3.1 Base Unit System (4px Grid)

```css
:root {
  /* === 4px Grid Spacing Scale === */
  --spacing-0: 0px;                    /* 0 */
  --spacing-px: 1px;                   /* 1px - borders only */
  --spacing-0.5: 0.125rem;             /* 2px */
  --spacing-1: 0.25rem;                /* 4px - Base unit */
  --spacing-1.5: 0.375rem;             /* 6px */
  --spacing-2: 0.5rem;                 /* 8px */
  --spacing-2.5: 0.625rem;             /* 10px */
  --spacing-3: 0.75rem;                /* 12px */
  --spacing-3.5: 0.875rem;             /* 14px */
  --spacing-4: 1rem;                   /* 16px */
  --spacing-5: 1.25rem;                /* 20px */
  --spacing-6: 1.5rem;                 /* 24px */
  --spacing-7: 1.75rem;                /* 28px */
  --spacing-8: 2rem;                   /* 32px */
  --spacing-9: 2.25rem;                /* 36px */
  --spacing-10: 2.5rem;                /* 40px */
  --spacing-11: 2.75rem;               /* 44px */
  --spacing-12: 3rem;                  /* 48px */
  --spacing-14: 3.5rem;                /* 56px */
  --spacing-16: 4rem;                  /* 64px */
  --spacing-20: 5rem;                  /* 80px */
  --spacing-24: 6rem;                  /* 96px */
  --spacing-28: 7rem;                  /* 112px */
  --spacing-32: 8rem;                  /* 128px */
  --spacing-36: 9rem;                  /* 144px */
  --spacing-40: 10rem;                 /* 160px */
  --spacing-44: 11rem;                 /* 176px */
  --spacing-48: 12rem;                 /* 192px */
  --spacing-52: 13rem;                 /* 208px */
  --spacing-56: 14rem;                 /* 224px */
  --spacing-60: 15rem;                 /* 240px */
  --spacing-64: 16rem;                 /* 256px */
}
```

### 3.2 Component Spacing Conventions

```css
:root {
  /* === Component Padding === */
  --padding-button-sm: var(--spacing-1) var(--spacing-2);     /* 4px 8px */
  --padding-button-md: var(--spacing-2) var(--spacing-4);     /* 8px 16px */
  --padding-button-lg: var(--spacing-3) var(--spacing-6);     /* 12px 24px */
  
  --padding-input-sm: var(--spacing-1.5) var(--spacing-2);    /* 6px 8px */
  --padding-input-md: var(--spacing-2) var(--spacing-3);      /* 8px 12px */
  --padding-input-lg: var(--spacing-2.5) var(--spacing-4);    /* 10px 16px */
  
  --padding-card-sm: var(--spacing-3);                        /* 12px */
  --padding-card-md: var(--spacing-4);                        /* 16px */
  --padding-card-lg: var(--spacing-6);                        /* 24px */
  
  /* === Component Gaps === */
  --gap-xs: var(--spacing-1);                                 /* 4px */
  --gap-sm: var(--spacing-2);                                 /* 8px */
  --gap-md: var(--spacing-4);                                 /* 16px */
  --gap-lg: var(--spacing-6);                                 /* 24px */
  --gap-xl: var(--spacing-8);                                 /* 32px */
}
```

---

## 4. Border & Shadow Tokens

### 4.1 Border Radius (8-bit Sharp Corners)

```css
:root {
  /* === Border Radius === */
  /* 8-BIT RULE: Maximum 2px for subtle rounding */
  --radius-none: 0px;                  /* Sharp corners - DEFAULT */
  --radius-sm: 0.125rem;               /* 2px - Maximum allowed */
  --radius-base: 0px;                  /* Use none as base */
  --radius-md: 0.25rem;                /* 4px - Only for special cases */
  --radius-lg: 0.375rem;               /* 6px - Rarely used */
  --radius-xl: 0.5rem;                 /* 8px - Never use */
  --radius-2xl: 0.75rem;               /* 12px - Never use */
  --radius-full: 9999px;               /* Circles only */
  
  /* ShadcnUI default override */
  --radius: 0rem;                      /* Force squared corners */
}
```

### 4.2 Border Widths

```css
:root {
  /* === Border Widths === */
  --border-width-0: 0px;
  --border-width-1: 1px;               /* Default */
  --border-width-2: 2px;               /* Emphasis */
  --border-width-4: 4px;               /* Strong emphasis */
  --border-width-8: 8px;               /* Decorative only */
}
```

### 4.3 Pixel Shadows (8-bit Style)

```css
:root {
  /* === 8-Bit Pixel Shadows === */
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

---

## 5. Animation Tokens

### 5.1 Durations

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

### 5.2 Timing Functions

```css
:root {
  /* === 8-Bit Timing Functions === */
  
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
  
  /* 8-bit cubic bezier (existing project default) */
  --ease-8bit-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### 5.3 Transition Presets

```css
:root {
  /* === Transition Presets === */
  --transition-fast: var(--duration-fast) var(--ease-8bit-smooth);
  --transition-normal: var(--duration-normal) var(--ease-8bit-smooth);
  --transition-slow: var(--duration-slow) var(--ease-8bit-smooth);
  
  /* 8-bit step transitions */
  --transition-8bit-fast: var(--duration-fast) var(--ease-8bit-5);
  --transition-8bit-normal: var(--duration-normal) var(--ease-8bit-5);
  
  /* Properties to transition */
  --transition-colors: color, background-color, border-color, fill, stroke;
  --transition-opacity: opacity;
  --transition-transform: transform;
  --transition-shadow: box-shadow;
  --transition-all: all;
}
```

---

## 6. Z-Index Tokens (CRITICAL)

```css
:root {
  /* === Z-Index Scale === */
  /* STRICTLY ENFORCE - No magic numbers allowed */
  
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

**Z-Index Usage Guide**:

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

## 7. 8-Bit Design Rules

### 7.1 Mandatory Rules (NON-NEGOTIABLE)

| Rule # | Rule | Violation |
|--------|------|-----------|
| **R1** | `border-radius` MUST be 0 or max 2px | Rounded corners > 2px |
| **R2** | NO blur shadows (`blur()` forbidden) | `box-shadow` with blur |
| **R3** | NO glassmorphism (`backdrop-filter: blur()`) | Frosted glass effects |
| **R4** | NO gradients on surfaces | `linear-gradient()` on cards/buttons |
| **R5** | Background opacity MUST be >= 0.9 | Semi-transparent backgrounds |
| **R6** | Spacing MUST use 4px grid | Arbitrary pixel values |
| **R7** | Prefer step-based animations | Spring/bounce physics |
| **R8** | Text contrast MUST meet WCAG AA | Contrast ratio < 4.5:1 |
| **R9** | Touch targets MUST be >= 44px | Buttons smaller than 44x44 |
| **R10** | Z-index MUST use tokens | Magic z-index numbers |

### 7.2 Visual Characteristics

```
+------------------------------------------+
|  8-BIT AESTHETIC CHECKLIST               |
+------------------------------------------+
| [x] Sharp, squared corners               |
| [x] Hard drop shadows (no blur)          |
| [x] Solid colors (no transparency)       |
| [x] Pixel-perfect 4px grid alignment     |
| [x] Step-based animations                |
| [x] High contrast text                   |
| [x] Mono/pixel fonts for UI              |
| [x] Clear visual hierarchy               |
| [x] Minimal decoration                   |
| [x] Functional over decorative           |
+------------------------------------------+
```

---

## 8. ShadcnUI Integration

### 8.1 components.json Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "lyra",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "stone",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 8.2 Tailwind CSS 4 Theme Additions

Add to your main CSS file (after `@import "tailwindcss"`):

```css
@theme {
  /* === 8-Bit Custom Colors === */
  --color-pixel-shadow: rgba(0, 0, 0, 0.5);
  --color-pixel-shadow-primary: #c2410c;
  
  /* === Pixel Shadows === */
  --shadow-pixel-xs: 1px 1px 0px 0px var(--color-pixel-shadow);
  --shadow-pixel-sm: 2px 2px 0px 0px var(--color-pixel-shadow);
  --shadow-pixel: 4px 4px 0px 0px var(--color-pixel-shadow);
  --shadow-pixel-lg: 6px 6px 0px 0px var(--color-pixel-shadow);
  --shadow-pixel-hover: 6px 6px 0px 0px var(--color-pixel-shadow);
  
  /* === Step Animations === */
  --ease-8bit: steps(5, end);
  --ease-8bit-3: steps(3, end);
  --ease-8bit-8: steps(8, end);
  
  /* === Pixel Font === */
  --font-pixel: 'VT323', monospace;
}
```

### 8.3 Component Override Patterns

```tsx
// Button with 8-bit styling
<Button 
  className="rounded-none shadow-pixel hover:shadow-pixel-hover 
             transition-all duration-100"
>
  Click Me
</Button>

// Card with 8-bit styling
<Card className="rounded-none border-2 shadow-pixel">
  <CardContent>Content</CardContent>
</Card>

// Input with 8-bit styling
<Input 
  className="rounded-none border-2 focus:ring-2 focus:ring-primary"
/>
```

---

## 9. Usage Examples

### 9.1 CSS Custom Properties Usage

```css
/* Apply pixel shadow to a card */
.retro-card {
  border-radius: var(--radius-none);
  box-shadow: var(--shadow-pixel);
  background-color: hsl(var(--card));
  border: var(--border-width-2) solid hsl(var(--border));
  transition: box-shadow var(--transition-fast);
}

.retro-card:hover {
  box-shadow: var(--shadow-pixel-hover);
}
```

### 9.2 Tailwind Class Usage

```tsx
// 8-bit button
<button className="
  bg-primary text-primary-foreground
  px-4 py-2
  rounded-none
  border-2 border-primary-700
  shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
  hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]
  hover:-translate-y-0.5
  active:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]
  active:translate-y-0.5
  transition-all duration-100
  font-mono text-sm uppercase tracking-wide
">
  Play Game
</button>

// 8-bit card
<div className="
  bg-card border-2 border-border
  rounded-none
  shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
  p-4
">
  <h3 className="font-pixel text-lg text-foreground">Title</h3>
  <p className="font-mono text-sm text-muted-foreground">Description</p>
</div>
```

### 9.3 TypeScript Token Access

```typescript
import { getToken, getShadow, getZIndex } from '@/styles/design-tokens';

// Use tokens in inline styles
const cardStyle = {
  boxShadow: getShadow('shadow-pixel'),
  zIndex: getZIndex('z-modal'),
  borderRadius: '0px', // Always sharp
};

// Use tokens in CSS-in-JS
const StyledCard = styled.div`
  box-shadow: var(--shadow-pixel);
  border-radius: 0;
  z-index: var(--z-modal);
`;
```

---

## 10. DO and DON'T Guide

### Visual Guide (ASCII Art)

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


BUTTONS
-----------------------------------------------------------------
  DO:                      DON'T:
  +----------------+       (  Click Me!  )
  |   Click Me!    |__     
  +----------------+ |     <- rounded, gradient, glossy
     |______________|


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


TYPOGRAPHY
-----------------------------------------------------------------
  DO:                      DON'T:
  
  PRESS START             Press Start
  Press Start 2P          [Decorative Script]
  JetBrains Mono          Comic Sans MS


ANIMATIONS
-----------------------------------------------------------------
  DO (Steps):              DON'T (Smooth):
  
  Frame 1 -> Frame 2      ~~~~~~~~~~~~>
       |         |        (spring bounce)
       v         v
  [===    ] [======]      Ease-in-out with
                          physics simulation
=================================================================
```

### Code Examples: DO vs DON'T

```tsx
// ========================================
// BORDER RADIUS
// ========================================

// DO: Sharp corners
<div className="rounded-none" />
<div className="rounded-sm" /> // max 2px

// DON'T: Rounded corners
<div className="rounded-lg" />  // 8px - FORBIDDEN
<div className="rounded-full" /> // Only for avatars/icons


// ========================================
// SHADOWS
// ========================================

// DO: Pixel shadows (no blur)
<div className="shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]" />
<div style={{ boxShadow: 'var(--shadow-pixel)' }} />

// DON'T: Blur shadows
<div className="shadow-lg" />  // Has blur - FORBIDDEN
<div className="shadow-2xl" /> // More blur - FORBIDDEN


// ========================================
// BACKGROUNDS
// ========================================

// DO: Solid colors
<div className="bg-card" />
<div className="bg-primary" />

// DON'T: Transparency or gradients
<div className="bg-card/50" />  // 50% opacity - FORBIDDEN
<div className="bg-gradient-to-r from-blue-500 to-purple-500" />


// ========================================
// GLASSMORPHISM
// ========================================

// DO: Solid overlay
<div className="bg-neutral-900" />

// DON'T: Frosted glass
<div className="backdrop-blur-md bg-white/10" />  // FORBIDDEN


// ========================================
// ANIMATIONS
// ========================================

// DO: Step-based timing
<div className="transition-all duration-100 [transition-timing-function:steps(5,end)]" />

// DON'T: Spring/bounce physics
<motion.div 
  transition={{ type: "spring", bounce: 0.5 }}  // FORBIDDEN
/>


// ========================================
// Z-INDEX
// ========================================

// DO: Use tokens
<div style={{ zIndex: 'var(--z-modal)' }} />
<div className="z-[var(--z-toast)]" />

// DON'T: Magic numbers
<div className="z-[9999]" />  // FORBIDDEN
<div style={{ zIndex: 999999 }} />  // FORBIDDEN


// ========================================
// SPACING
// ========================================

// DO: 4px grid values
<div className="p-4 m-2 gap-4" />  // 16px, 8px, 16px

// DON'T: Arbitrary values
<div className="p-[13px] m-[7px]" />  // Not on grid
```

---

## Appendix A: Complete Token Export

```css
/* ============================================================
   COMPLETE 8-BIT DESIGN TOKENS
   Copy this entire block to your design-tokens.css
   ============================================================ */

:root {
  /* Colors */
  --primary: 24.6 95% 53.1%;
  --primary-foreground: 0 0% 100%;
  --background: 240 6% 4%;
  --foreground: 0 0% 95%;
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
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 0%;
  --info: 217 91% 60%;
  --info-foreground: 0 0% 100%;
  --border: 240 4% 16%;
  --input: 240 4% 16%;
  --ring: 24.6 95% 53.1%;
  
  /* Border Radius */
  --radius: 0rem;
  --radius-sm: 0.125rem;
  --radius-md: 0.25rem;
  --radius-lg: 0.375rem;
  
  /* Pixel Shadows */
  --shadow-pixel-xs: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-sm: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel: 4px 4px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-lg: 6px 6px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-hover: 6px 6px 0px 0px rgba(0, 0, 0, 0.5);
  --shadow-pixel-primary: 4px 4px 0px 0px #c2410c;
  --shadow-pixel-inset: inset 2px 2px 0px 0px rgba(0, 0, 0, 0.3);
  
  /* Animation */
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 200ms;
  --ease-8bit: steps(5, end);
  --ease-8bit-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Z-Index */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-sidebar: 30;
  --z-panel: 40;
  --z-modal-backdrop: 45;
  --z-modal: 50;
  --z-toast: 60;
  --z-popover: 70;
  --z-overlay: 80;
  --z-alert: 90;
  --z-debug: 100;
  
  /* Touch Targets */
  --touch-target-min: 44px;
}
```

---

## Appendix B: Quick Reference Card

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

**Document End**  
**Author**: ux-designer-ext  
**Review Status**: Ready for Implementation  
**Next Steps**: 
1. Update `src/styles/design-tokens.css` with missing tokens
2. Configure Tailwind CSS 4 theme extensions
3. Create component override utilities
4. Update ShadcnUI components.json to Lyra style
