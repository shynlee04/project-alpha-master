# Design Tokens Reference

<- [Design Principles](./02-design-principles.md) | [Index](./index.md) | [Responsive Grid](./04-responsive-grid.md) ->

---

## 3.1 Color System

### Primary Colors (Orange Spectrum)

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

### Neutral Colors (Stone/Zinc Dark Theme)

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

### Semantic Colors

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

### Surface Colors (Background Layers)

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

### Border and Input Colors

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

---

## 3.2 Typography Scale

### Font Families

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

### Font Sizes (Pixel-Perfect Scale)

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

### Line Heights

```css
:root {
  --leading-tight: 1.25;               /* Headings, pixel fonts */
  --leading-normal: 1.5;               /* Body text */
  --leading-relaxed: 1.75;             /* Long-form prose */
  --leading-loose: 2;                  /* Large text blocks */
}
```

---

## 3.3 Spacing System (4px Grid)

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

### Component Spacing Conventions

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

---

## 3.4 Border & Shadow Tokens

### Border Radius (8-bit Sharp Corners)

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

### Pixel Shadows (8-bit Style)

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

---

## 3.5 Animation Tokens

### Durations

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

### Timing Functions (8-bit Step-Based)

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

### 8-bit Animation Keyframes

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

---

## 3.6 Z-Index Hierarchy (12-Tier Scale)

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

### Z-Index Usage Guide

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

<- [Design Principles](./02-design-principles.md) | [Index](./index.md) | [Responsive Grid](./04-responsive-grid.md) ->
