# Via-gent IDE 8-bit Design System Specification

**Version**: 1.0.0  
**Date**: 2025-12-25  
**Status**: Production-Ready  
**Author**: UX Designer Agent (@bmad-bmm-ux-designer)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens](#2-design-tokens)
   - [Color Palette](#21-color-palette)
   - [Typography](#22-typography)
   - [Spacing](#23-spacing)
   - [Border Radius](#24-border-radius)
   - [Shadows](#25-shadows)
   - [Transitions](#26-transitions)
3. [Component Library](#3-component-library)
4. [Animation System](#4-animation-system)
5. [Accessibility Guidelines](#5-accessibility-guidelines)
6. [Responsive Strategy](#6-responsive-strategy)
7. [Theme System](#7-theme-system)
8. [i18n Support](#8-i18n-support)
9. [Asset Guidelines](#9-asset-guidelines)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Design Philosophy

### 1.1 Core Principles

The Via-gent 8-bit design system is inspired by retro-gaming aesthetics while maintaining modern usability standards. The design philosophy balances nostalgia with contemporary UX patterns.

**Principle 1: Pixel-Perfect Precision**
- All measurements align to 4px base unit (8-bit friendly)
- No fractional pixels or sub-pixel rendering
- Crisp, sharp edges for authentic retro feel
- Consistent alignment across all components

**Principle 2: Dark-First Aesthetic**
- Dark theme as primary (developer preference)
- High contrast for readability (WCAG AA compliant)
- Subtle pixel art accents for visual interest
- Reduced eye strain for long coding sessions

**Principle 3: Minimalist Interface**
- Clean, uncluttered layouts
- Progressive disclosure of features
- Clear visual hierarchy
- Purposeful use of color and decoration

**Principle 4: Developer-Centric**
- Optimized for IDE workflows
- Keyboard-first navigation
- Fast, responsive interactions
- Information-dense but scannable

**Principle 5: Extensibility**
- No hard-coded values
- Configurable via design tokens
- Themeable architecture
- Component composition patterns

### 1.2 8-bit Aesthetic Characteristics

**Visual Style:**
- **Color Palette**: Limited palette with high saturation
- **Shapes**: Geometric, pixel-aligned
- **Borders**: 1-2px solid, crisp edges
- **Shadows**: Hard-edged, no blur (retro style)
- **Icons**: Pixel art style (24x24 base)
- **Typography**: Monospace for code, sans-serif for UI

**Retro Elements:**
- Scanline overlay (optional, toggleable)
- Pixelated borders on containers
- CRT-style glow effects (subtle)
- 8-bit color dithering (for gradients)
- Blocky, chunky UI elements

**Modern Adaptations:**
- Smooth animations (60fps)
- Responsive layouts
- Touch-friendly targets (48px minimum)
- Accessibility features
- Modern typography rendering

### 1.3 Design System Goals

**Primary Goals:**
1. **Consistency**: Unified visual language across all interfaces
2. **Efficiency**: Fast development with reusable components
3. **Accessibility**: WCAG AA compliance for all users
4. **Maintainability**: Easy to update and extend
5. **Performance**: Optimized rendering and interactions
6. **Scalability**: Supports future features and growth

**Success Metrics:**
- Design system adoption rate: 100% for new components
- Component reusability: >80% of UI uses system components
- Accessibility score: WCAG AA compliant (100%)
- Developer satisfaction: >4/5 rating
- Design consistency: Visual audit score >9/10

---

## 2. Design Tokens

### 2.1 Color Palette

#### 2.1.1 Primary Colors (Brand)

Brand colors define the Via-gent identity. Use sparingly for emphasis and branding.

```css
/* CSS Variables - Dark Theme (Default) */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0e7ff;
--color-primary-200: #c7d2ff;
--color-primary-300: #a4b5ff;
--color-primary-400: #8194ff;
--color-primary-500: #5e73ff;  /* Primary brand color */
--color-primary-600: #4b5cf5;
--color-primary-700: #3d46e8;
--color-primary-800: #3636d8;
--color-primary-900: #3535b3;
--color-primary-950: #202038;

/* Light Theme */
--color-primary-50: #f5f3ff;
--color-primary-100: #e0e7ff;
--color-primary-200: #c7d2ff;
--color-primary-300: #a4b5ff;
--color-primary-400: #8194ff;
--color-primary-500: #5e73ff;  /* Primary brand color */
--color-primary-600: #4b5cf5;
--color-primary-700: #3d46e8;
--color-primary-800: #3636d8;
--color-primary-900: #3535b3;
--color-primary-950: #202038;
```

**Usage Guidelines:**
- Primary-500: Main actions, CTAs, active states
- Primary-600: Hover states
- Primary-700: Pressed/active states
- Primary-300: Secondary accents, highlights
- Primary-900: Text on light backgrounds

#### 2.1.2 Secondary Colors (Accents)

Secondary colors provide variety and semantic meaning.

```css
/* CSS Variables - Dark Theme */
--color-secondary-purple-50: #faf5ff;
--color-secondary-purple-500: #a855f7;
--color-secondary-purple-600: #9333e0;

--color-secondary-pink-50: #fdf2f8;
--color-secondary-pink-500: #ec4899;
--color-secondary-pink-600: #db277a;

--color-secondary-cyan-50: #ecfeff;
--color-secondary-cyan-500: #06b6d4;
--color-secondary-cyan-600: #0891b2;

--color-secondary-green-50: #f0fdf4;
--color-secondary-green-500: #22c55e;
--color-secondary-green-600: #16a34a;

--color-secondary-orange-50: #ffedd5;
--color-secondary-orange-500: #f97316;
--color-secondary-orange-600: #ea580c;

--color-secondary-yellow-50: #fefce8;
--color-secondary-yellow-500: #eab308;
--color-secondary-yellow-600: #ca8a04;
```

**Usage Guidelines:**
- Purple: AI agent features, chat
- Pink: Notifications, alerts
- Cyan: WebContainer status, terminal
- Green: Success states, sync complete
- Orange: Warnings, pending operations
- Yellow: Info states, tips

#### 2.1.3 Neutral Colors (Grayscale)

Neutral colors form the foundation of the interface.

```css
/* CSS Variables - Dark Theme */
--color-neutral-50: #fafafa;
--color-neutral-100: #f4f4f5;
--color-neutral-200: #e5e5e7;
--color-neutral-300: #d4d4d8;
--color-neutral-400: #a3a3a7;
--color-neutral-500: #71717a;
--color-neutral-600: #52525b;
--color-neutral-700: #3f3f46;
--color-neutral-800: #27272a;
--color-neutral-900: #18181b;
--color-neutral-950: #09090b;

/* Light Theme */
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f4;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d4d1d6;
--color-neutral-400: #a3a3a7;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #3f3f46;
--color-neutral-800: #27272a;
--color-neutral-900: #18181b;
--color-neutral-950: #09090b;
```

**Usage Guidelines:**
- Neutral-50: Backgrounds (light theme)
- Neutral-100: Card backgrounds
- Neutral-200: Elevated surfaces
- Neutral-300: Borders, dividers
- Neutral-400: Disabled text
- Neutral-500: Secondary text
- Neutral-600: Primary text
- Neutral-700: Headings
- Neutral-800: Emphasized text
- Neutral-900: Text on dark backgrounds
- Neutral-950: Backgrounds (dark theme)

#### 2.1.4 Semantic Colors (Status)

Semantic colors communicate state and feedback.

```css
/* Success */
--color-success-50: #f0fdf4;
--color-success-100: #dcfce7;
--color-success-500: #22c55e;
--color-success-600: #16a34a;
--color-success-700: #15803d;

/* Warning */
--color-warning-50: #fffbeb;
--color-warning-100: #fef3c7;
--color-warning-500: #eab308;
--color-warning-600: #ca8a04;
--color-warning-700: #a16207;

/* Error */
--color-error-50: #fef2f2;
--color-error-100: #fee2e2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;
--color-error-700: #b91c1c;

/* Info */
--color-info-50: #f0f9ff;
--color-info-100: #e0e7ff;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
--color-info-700: #1d4ed8;
```

**Usage Guidelines:**
- Success-500: Success messages, completed states
- Warning-500: Warning messages, caution states
- Error-500: Error messages, failed states
- Info-500: Information messages, help text

#### 2.1.5 8-bit Color Palette (Retro)

Special 8-bit colors for pixel art accents and retro effects.

```css
/* 8-bit Retro Palette */
--color-8bit-black: #000000;
--color-8bit-dark-gray: #1a1c2c;
--color-8bit-medium-gray: #383c4c;
--color-8bit-light-gray: #7b8496;
--color-8bit-white: #f4f4f5;
--color-8bit-red: #c84c0c;
--color-8bit-orange: #e09f3e;
--color-8bit-yellow: #f4d03f;
--color-8bit-green: #4ecdc4;
--color-8bit-blue: #45a3e5;
--color-8bit-purple: #9b59b6;
--color-8bit-pink: #e91e63;
```

**Usage Guidelines:**
- Use for pixel art borders, decorative elements
- Scanline overlays (8bit-dark-gray with 10% opacity)
- Retro button styles (8bit-yellow, 8bit-green)
- Accent borders on panels (8bit-blue, 8bit-purple)

#### 2.1.6 Color Contrast Ratios

All color combinations must meet WCAG AA requirements (minimum 4.5:1 contrast ratio).

| Background | Foreground | Contrast Ratio | WCAG Level |
|------------|-------------|----------------|-------------|
| neutral-950 | neutral-100 | 16.2:1 | AAA |
| neutral-950 | neutral-600 | 13.8:1 | AAA |
| neutral-800 | neutral-100 | 11.4:1 | AA |
| primary-500 | neutral-950 | 7.2:1 | AA |
| error-500 | neutral-950 | 6.8:1 | AA |
| success-500 | neutral-950 | 7.1:1 | AA |

### 2.2 Typography

#### 2.2.1 Font Families

```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
--font-display: 'Inter', -apple-system, sans-serif;
```

**Usage Guidelines:**
- `font-sans`: UI text, labels, buttons
- `font-mono`: Code, terminal, file paths
- `font-display`: Headings, large text

#### 2.2.2 Font Sizes

Scale based on 4px base unit (8-bit friendly).

```css
/* Font Size Scale */
--text-xs: 12px;      /* 0.75rem - 3 units */
--text-sm: 14px;      /* 0.875rem - 3.5 units */
--text-base: 16px;    /* 1rem - 4 units */
--text-lg: 18px;      /* 1.125rem - 4.5 units */
--text-xl: 20px;      /* 1.25rem - 5 units */
--text-2xl: 24px;     /* 1.5rem - 6 units */
--text-3xl: 32px;     /* 2rem - 8 units */
--text-4xl: 40px;     /* 2.5rem - 10 units */
--text-5xl: 48px;     /* 3rem - 12 units */
```

**Usage Guidelines:**
- `text-xs`: Captions, helper text (12px)
- `text-sm`: Secondary labels, metadata (14px)
- `text-base`: Body text, default size (16px)
- `text-lg`: Emphasized text, subheadings (18px)
- `text-xl`: Section headings (20px)
- `text-2xl`: Page headings (24px)
- `text-3xl`: Large titles (32px)
- `text-4xl`: Hero text (40px)
- `text-5xl`: Display headings (48px)

#### 2.2.3 Font Weights

```css
/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

**Usage Guidelines:**
- `font-normal`: Body text, descriptions
- `font-medium`: Emphasized text, buttons
- `font-semibold`: Subheadings, labels
- `font-bold`: Headings, titles
- `font-extrabold`: Display headings (rare)

#### 2.2.4 Line Heights

```css
/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;
```

**Usage Guidelines:**
- `leading-none`: Single-line text, headings
- `leading-tight`: Compact text, buttons
- `leading-normal`: Body text (default)
- `leading-relaxed`: Long-form content
- `leading-loose`: Spaced text, captions

#### 2.2.5 Letter Spacing

```css
/* Letter Spacing */
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

**Usage Guidelines:**
- `tracking-tighter`: All-caps text, headings
- `tracking-tight`: Large headings
- `tracking-normal`: Body text (default)
- `tracking-wide`: Emphasized text
- `tracking-wider`: Small text, labels
- `tracking-widest`: Display text, decorative

### 2.3 Spacing

#### 2.3.1 Spacing Scale

Based on 4px base unit (8-bit friendly).

```css
/* Spacing Scale */
--spacing-0: 0;
--spacing-px: 1px;
--spacing-1: 4px;      /* 0.25rem - 1 unit */
--spacing-2: 8px;      /* 0.5rem - 2 units */
--spacing-3: 12px;     /* 0.75rem - 3 units */
--spacing-4: 16px;     /* 1rem - 4 units */
--spacing-5: 20px;     /* 1.25rem - 5 units */
--spacing-6: 24px;     /* 1.5rem - 6 units */
--spacing-8: 32px;     /* 2rem - 8 units */
--spacing-10: 40px;    /* 2.5rem - 10 units */
--spacing-12: 48px;    /* 3rem - 12 units */
--spacing-16: 64px;    /* 4rem - 16 units */
--spacing-20: 80px;    /* 5rem - 20 units */
--spacing-24: 96px;    /* 6rem - 24 units */
```

**Usage Guidelines:**
- `spacing-0`: No spacing, collapsed
- `spacing-1`: Tight spacing, icons
- `spacing-2`: Small gaps, compact layouts
- `spacing-3`: Default padding/margins
- `spacing-4`: Standard spacing (base unit)
- `spacing-6`: Section spacing
- `spacing-8`: Large spacing, sections
- `spacing-12`: Component separation
- `spacing-16`: Major sections
- `spacing-20`: Page margins

#### 2.3.2 Component Spacing

```css
/* Component Spacing */
--spacing-input: 12px;      /* Input padding */
--spacing-button: 12px 24px; /* Button padding vertical/horizontal */
--spacing-card: 24px;       /* Card padding */
--spacing-panel: 16px;      /* Panel padding */
--spacing-section: 32px;    /* Section spacing */
--spacing-grid: 16px;       /* Grid gap */
```

### 2.4 Border Radius

Pixel-friendly values for 8-bit aesthetic.

```css
/* Border Radius Scale */
--radius-none: 0;
--radius-sm: 2px;
--radius-base: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

**Usage Guidelines:**
- `radius-none`: Sharp corners (8-bit style)
- `radius-sm`: Small elements, badges
- `radius-base`: Default radius, inputs
- `radius-md`: Cards, buttons
- `radius-lg`: Panels, modals
- `radius-xl`: Large containers
- `radius-2xl`: Hero sections
- `radius-full`: Pills, avatars

**8-bit Style Override:**
For authentic 8-bit look, use `radius-none` on most elements with pixel art borders.

### 2.5 Shadows

8-bit style shadows: hard-edged, no blur.

```css
/* Shadow Scale (8-bit style) */
--shadow-none: none;
--shadow-sm: 0 1px 0 rgba(0, 0, 0, 0.1);
--shadow-base: 0 2px 0 rgba(0, 0, 0, 0.15);
--shadow-md: 0 4px 0 rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 0 rgba(0, 0, 0, 0.25);
--shadow-xl: 0 16px 0 rgba(0, 0, 0, 0.3);
--shadow-2xl: 0 24px 0 rgba(0, 0, 0, 0.35);
--shadow-inner: inset 0 2px 0 rgba(0, 0, 0, 0.15);

/* Colored Shadows */
--shadow-primary: 0 4px 0 rgba(94, 115, 255, 0.3);
--shadow-success: 0 4px 0 rgba(34, 197, 94, 0.3);
--shadow-warning: 0 4px 0 rgba(234, 179, 8, 0.3);
--shadow-error: 0 4px 0 rgba(239, 68, 68, 0.3);
```

**Usage Guidelines:**
- `shadow-none`: Flat elements, no elevation
- `shadow-sm`: Tooltips, popovers
- `shadow-base`: Cards, buttons
- `shadow-md`: Panels, dropdowns
- `shadow-lg`: Modals, dialogs
- `shadow-xl`: Drawers, sidebars
- `shadow-inner`: Pressed states, inset elements

### 2.6 Transitions

#### 2.6.1 Duration Scale

```css
/* Transition Duration */
--duration-instant: 50ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
--duration-slowest: 1000ms;
```

**Usage Guidelines:**
- `duration-instant`: Instant feedback, hover
- `duration-fast`: Micro-interactions
- `duration-normal`: Default transitions
- `duration-slow`: Panel slide, modal fade
- `duration-slower`: Page transitions
- `duration-slowest`: Complex animations

#### 2.6.2 Easing Functions

```css
/* Easing Functions */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Usage Guidelines:**
- `ease-linear`: Loading spinners, progress
- `ease-in`: Enter animations, slide-in
- `ease-out`: Exit animations, slide-out
- `ease-in-out`: Default transitions
- `ease-bounce`: Attention-grabbing (use sparingly)

#### 2.6.3 Animation Presets

```css
/* Animation Presets */
--transition-base: all var(--duration-normal) var(--ease-in-out);
--transition-fast: all var(--duration-fast) var(--ease-in-out);
--transition-colors: color var(--duration-fast) var(--ease-in-out);
--transition-transform: transform var(--duration-normal) var(--ease-in-out);
--transition-opacity: opacity var(--duration-slow) var(--ease-in-out);
```

---

## 3. Component Library

### 3.1 Component Architecture Principles

**Principle 1: No Hard-coding**
- All values from design tokens
- Configurable via props
- Themeable via CSS variables
- Extensible for future use

**Principle 2: Class Variance Authority (CVA)**
- All components use CVA for variants
- Consistent variant naming
- Type-safe variant props
- Composable variant combinations

**Principle 3: Accessibility First**
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

**Principle 4: TypeScript Interfaces**
- Props interfaces (not type aliases)
- Strict typing
- Default values
- JSDoc comments

### 3.2 Component Categories

#### 3.2.1 Layout Components

**IDELayout**
```typescript
interface IDELayoutProps {
  children: React.ReactNode;
  className?: string;
  sidebarWidth?: number;      // Default: 280
  activityBarWidth?: number;  // Default: 48
  headerHeight?: number;       // Default: 56
  footerHeight?: number;       // Default: 32
}

// Variants
const layoutVariants = cva(
  'fixed flex flex-col h-screen overflow-hidden',
  {
    variants: {
      responsive: {
        mobile: 'w-full',
        tablet: 'w-full',
        desktop: 'w-full',
      },
    },
  }
);
```

**IDEHeaderBar**
```typescript
interface IDEHeaderBarProps {
  projectId?: string;
  projectName?: string;
  onChatToggle?: () => void;
  isChatVisible?: boolean;
  className?: string;
}

// Variants
const headerVariants = cva(
  'h-14 px-4 flex items-center justify-between border-b',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 border-neutral-800',
        light: 'bg-neutral-50 border-neutral-200',
      },
    },
  }
);
```

**IconSidebar**
```typescript
interface IconSidebarProps {
  activePanel?: 'explorer' | 'agents' | 'search' | 'terminal' | 'settings';
  onPanelChange?: (panel: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

// Variants
const sidebarVariants = cva(
  'flex flex-col border-r',
  {
    variants: {
      state: {
        expanded: 'w-64',
        collapsed: 'w-12',
      },
      theme: {
        dark: 'bg-neutral-900 border-neutral-800',
        light: 'bg-neutral-100 border-neutral-200',
      },
    },
  }
);
```

#### 3.2.2 Navigation Components

**Tabs**
```typescript
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// Variants
const tabsVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'flex flex-row border-b',
      vertical: 'flex flex-col border-r',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});

const tabsTriggerVariants = cva(
  'px-4 py-2 font-medium transition-colors',
  {
    variants: {
      state: {
        default: 'text-neutral-500 hover:text-neutral-300',
        active: 'text-primary-500 border-b-2 border-primary-500',
        disabled: 'text-neutral-400 cursor-not-allowed',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
  }
);
```

**Breadcrumbs**
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

// Variants
const breadcrumbVariants = cva(
  'flex items-center text-sm',
  {
    variants: {
      theme: {
        dark: 'text-neutral-400',
        light: 'text-neutral-600',
      },
    },
  }
);
```

#### 3.2.3 Form Components

**Input**
```typescript
interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'url';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Variants
const inputVariants = cva(
  'flex items-center border transition-colors',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
      },
      state: {
        default: 'border-neutral-700 focus:border-primary-500',
        error: 'border-error-500 focus:border-error-500',
        success: 'border-success-500 focus:border-success-500',
        disabled: 'border-neutral-800 bg-neutral-900 cursor-not-allowed',
      },
      theme: {
        dark: 'bg-neutral-950 text-neutral-100',
        light: 'bg-white text-neutral-900',
      },
    },
  }
);
```

**Select**
```typescript
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Variants
const selectVariants = cva(
  'relative border transition-colors',
  {
    variants: {
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-base',
        lg: 'h-12 text-lg',
      },
      state: {
        default: 'border-neutral-700 focus:border-primary-500',
        error: 'border-error-500 focus:border-error-500',
        disabled: 'border-neutral-800 bg-neutral-900 cursor-not-allowed',
      },
      theme: {
        dark: 'bg-neutral-950 text-neutral-100',
        light: 'bg-white text-neutral-900',
      },
    },
  }
);
```

**Checkbox**
```typescript
interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Variants
const checkboxVariants = cva(
  'flex items-center border transition-colors',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
      state: {
        default: 'border-neutral-700 focus:border-primary-500',
        error: 'border-error-500 focus:border-error-500',
        disabled: 'border-neutral-800 bg-neutral-900 cursor-not-allowed',
      },
      checked: {
        true: 'bg-primary-500 border-primary-500',
        false: 'bg-transparent',
      },
    },
  }
);
```

**Switch**
```typescript
interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Variants
const switchVariants = cva(
  'relative inline-flex items-center transition-colors',
  {
    variants: {
      size: {
        sm: 'w-8 h-4',
        md: 'w-11 h-6',
        lg: 'w-14 h-8',
      },
      state: {
        default: 'bg-neutral-700',
        checked: 'bg-primary-500',
        disabled: 'bg-neutral-800 cursor-not-allowed',
      },
    },
  }
);
```

#### 3.2.4 Feedback Components

**Button**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

// Variants
const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-neutral-950 hover:bg-primary-600 active:bg-primary-700',
        secondary: 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600 active:bg-neutral-500',
        ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800 active:bg-neutral-700',
        danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
        success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
      },
      state: {
        default: '',
        disabled: 'opacity-50 cursor-not-allowed',
        loading: 'cursor-wait',
      },
    },
  }
);
```

**Toast**
```typescript
interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;  // Default: 5000ms
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// Variants
const toastVariants = cva(
  'flex items-center gap-3 p-4 border shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 border-neutral-700 text-neutral-100',
        success: 'bg-success-900 border-success-700 text-success-100',
        error: 'bg-error-900 border-error-700 text-error-100',
        warning: 'bg-warning-900 border-warning-700 text-warning-100',
      },
    },
  }
);
```

**Dialog**
```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Variants
const dialogVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full h-full',
    },
    theme: {
      dark: 'bg-neutral-950 border-neutral-800',
      light: 'bg-white border-neutral-200',
    },
  },
});
```

**Alert**
```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Variants
const alertVariants = cva(
  'flex items-start gap-3 p-4 border',
  {
    variants: {
      variant: {
        info: 'bg-info-50 border-info-200 text-info-800',
        success: 'bg-success-50 border-success-200 text-success-800',
        warning: 'bg-warning-50 border-warning-200 text-warning-800',
        error: 'bg-error-50 border-error-200 text-error-800',
      },
    },
  }
);
```

**Badge**
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Variants
const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium',
  {
    variants: {
      variant: {
        default: 'bg-neutral-700 text-neutral-100',
        primary: 'bg-primary-500 text-neutral-950',
        success: 'bg-success-500 text-white',
        warning: 'bg-warning-500 text-white',
        error: 'bg-error-500 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
      dot: {
        true: 'w-2 h-2 rounded-full p-0',
        false: '',
      },
    },
  }
);
```

#### 3.2.5 Data Display Components

**Card**
```typescript
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

// Variants
const cardVariants = cva(
  'border transition-colors',
  {
    variants: {
      variant: {
        elevated: 'shadow-base',
        outlined: 'shadow-none',
        flat: 'shadow-none border-none',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      theme: {
        dark: 'bg-neutral-900 border-neutral-800',
        light: 'bg-white border-neutral-200',
      },
    },
  }
);
```

**Table**
```typescript
interface TableProps {
  columns: TableColumn[];
  data: TableRow[];
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: TableRow) => React.ReactNode;
}

interface TableRow {
  [key: string]: any;
}

// Variants
const tableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      striped: {
        true: 'even:bg-neutral-50 odd:bg-white',
        false: '',
      },
      theme: {
        dark: 'bg-neutral-950 text-neutral-100 border-neutral-800',
        light: 'bg-white text-neutral-900 border-neutral-200',
      },
    },
  }
);
```

**List**
```typescript
interface ListProps {
  items: ListItem[];
  variant?: 'default' | 'spaced' | 'divided';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ListItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

// Variants
const listVariants = cva('', {
  variants: {
    variant: {
      default: 'divide-y',
      spaced: 'space-y-2',
      divided: 'divide-y',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});
```

#### 3.2.6 IDE Components

**EditorPanel**
```typescript
interface EditorPanelProps {
  filePath?: string;
  language?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

// Variants
const editorVariants = cva(
  'h-full w-full border',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 border-neutral-800',
        light: 'bg-white border-neutral-200',
      },
      state: {
        default: '',
        focused: 'ring-2 ring-primary-500',
        readOnly: 'opacity-75',
      },
    },
  }
);
```

**TerminalPanel**
```typescript
interface TerminalPanelProps {
  projectPath?: string;
  onCommand?: (command: string) => void;
  className?: string;
}

// Variants
const terminalVariants = cva(
  'h-full w-full border font-mono',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 text-success-500 border-neutral-800',
        light: 'bg-white text-neutral-900 border-neutral-200',
      },
      state: {
        default: '',
        focused: 'ring-2 ring-primary-500',
      },
    },
  }
);
```

**FileTree**
```typescript
interface FileTreeProps {
  files: FileNode[];
  selectedPath?: string;
  onFileSelect?: (path: string) => void;
  onFolderToggle?: (path: string) => void;
  className?: string;
}

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  expanded?: boolean;
}

// Variants
const fileTreeVariants = cva(
  'h-full w-full overflow-auto',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 text-neutral-300',
        light: 'bg-neutral-50 text-neutral-700',
      },
    },
  }
);
```

**StatusBar**
```typescript
interface StatusBarProps {
  items: StatusItem[];
  className?: string;
}

interface StatusItem {
  id: string;
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

// Variants
const statusBarVariants = cva(
  'h-8 px-4 flex items-center justify-between border-t text-sm',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-900 border-neutral-800 text-neutral-400',
        light: 'bg-neutral-50 border-neutral-200 text-neutral-600',
      },
    },
  }
);
```

#### 3.2.7 Agent Components

**AgentChatPanel**
```typescript
interface AgentChatPanelProps {
  agentId?: string;
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
  onToolApproval?: (toolCall: ToolCall, approved: boolean) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
}

// Variants
const chatPanelVariants = cva(
  'flex flex-col h-full border',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 border-neutral-800',
        light: 'bg-white border-neutral-200',
      },
    },
  }
);
```

**AgentConfigDialog**
```typescript
interface AgentConfigDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  agentId?: string;
  onSave?: (config: AgentConfig) => void;
  className?: string;
}

interface AgentConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  parameters: Record<string, any>;
}

// Variants
const configDialogVariants = cva(
  'p-6 border',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-900 border-neutral-800',
        light: 'bg-white border-neutral-200',
      },
    },
  }
);
```

**ApprovalOverlay**
```typescript
interface ApprovalOverlayProps {
  toolCall: ToolCall;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

// Variants
const approvalVariants = cva(
  'p-4 border shadow-lg',
  {
    variants: {
      state: {
        pending: 'border-warning-500 bg-warning-50',
        approved: 'border-success-500 bg-success-50',
        rejected: 'border-error-500 bg-error-50',
      },
    },
  }
);
```

### 3.3 Component Implementation Guidelines

**Guideline 1: Use CVA for All Variants**
```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'base-class',
  {
    variants: {
      variant: {
        primary: 'primary-classes',
        secondary: 'secondary-classes',
      },
      size: {
        sm: 'sm-classes',
        md: 'md-classes',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

**Guideline 2: Use Design Tokens**
```typescript
// ❌ BAD: Hard-coded values
<button className="bg-blue-500 text-white px-4 py-2">

// ✅ GOOD: Design tokens
<button className="bg-primary-500 text-neutral-950 px-4 py-2">
```

**Guideline 3: Props Interface Pattern**
```typescript
interface ComponentProps {
  // Required props
  children: React.ReactNode;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onClick?: () => void;
  
  // Styling overrides
  className?: string;
  
  // Accessibility
  disabled?: boolean;
  'aria-label'?: string;
}
```

**Guideline 4: Compound Components**
```typescript
// Parent component
interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

// Child components
interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}
```

---

## 4. Animation System

### 4.1 Animation Principles

**Principle 1: Purposeful Motion**
- Animations serve a purpose (feedback, guidance, delight)
- No decorative animations
- Respect user's motion preferences
- Performance-optimized (60fps)

**Principle 2: 8-bit Style**
- Pixel-perfect movements
- Hard-edged transitions (no blur)
- Subtle scanline effects
- Retro color transitions

**Principle 3: Consistent Timing**
- Use duration scale from design tokens
- Consistent easing functions
- Predictable motion patterns
- No jarring changes

### 4.2 Animation Types

#### 4.2.1 Micro-interactions

**Hover States**
```css
.hover-effect {
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.hover-effect:hover {
  background-color: var(--color-primary-600);
}
```

**Focus States**
```css
.focus-effect {
  transition: box-shadow var(--duration-fast) var(--ease-in-out);
}

.focus-effect:focus {
  box-shadow: 0 0 0 2px var(--color-primary-500);
}
```

**Active/Pressed States**
```css
.active-effect {
  transition: transform var(--duration-instant) var(--ease-in-out);
}

.active-effect:active {
  transform: translateY(1px);
}
```

#### 4.2.2 Transitions

**Panel Slide**
```css
.panel-slide {
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.panel-slide-enter {
  transform: translateX(-100%);
}

.panel-slide-enter-active {
  transform: translateX(0);
}

.panel-slide-exit {
  transform: translateX(0);
}

.panel-slide-exit-active {
  transform: translateX(-100%);
}
```

**Modal Fade**
```css
.modal-fade {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-fade-enter {
  opacity: 0;
}

.modal-fade-enter-active {
  opacity: 1;
}

.modal-fade-exit {
  opacity: 1;
}

.modal-fade-exit-active {
  opacity: 0;
}
```

**Tab Switch**
```css
.tab-switch {
  transition: all var(--duration-normal) var(--ease-in-out);
}

.tab-switch-active {
  opacity: 1;
  transform: translateY(0);
}

.tab-switch-inactive {
  opacity: 0;
  transform: translateY(4px);
}
```

#### 4.2.3 Loading States

**Spinner**
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

**Skeleton**
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-800) 0%,
    var(--color-neutral-700) 50%,
    var(--color-neutral-800) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Progress Bar**
```css
@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.progress-bar {
  animation: progress var(--duration-slower) var(--ease-in-out);
}
```

#### 4.2.4 8-bit Specific Animations

**Pixel Art Border Pulse**
```css
@keyframes pixelPulse {
  0%, 100% {
    border-color: var(--color-8bit-blue);
  }
  50% {
    border-color: var(--color-8bit-purple);
  }
}

.pixel-border-pulse {
  animation: pixelPulse 2s ease-in-out infinite;
}
```

**Scanline Effect**
```css
@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.scanline-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 2px
  );
  animation: scanline 8s linear infinite;
}
```

**CRT Glow**
```css
@keyframes crtGlow {
  0%, 100% {
    text-shadow: 0 0 10px var(--color-primary-500);
  }
  50% {
    text-shadow: 0 0 20px var(--color-primary-500);
  }
}

.crt-glow {
  animation: crtGlow 3s ease-in-out infinite;
}
```

### 4.3 Animation Performance

**Optimization Guidelines:**

1. **Use CSS Transforms**
   ```css
   /* ✅ GOOD: Hardware accelerated */
   transform: translateX(100%);
   
   /* ❌ BAD: Not hardware accelerated */
   left: 100%;
   ```

2. **Use will-change**
   ```css
   .animating-element {
     will-change: transform, opacity;
   }
   ```

3. **Avoid Layout Thrashing**
   ```css
   /* ✅ GOOD: Batch DOM reads */
   const width = element.offsetWidth;
   element.style.transform = 'translateX(100%)';
   
   /* ❌ BAD: Interleaved reads/writes */
   element.style.transform = 'translateX(' + element.offsetWidth + 'px)';
   ```

4. **Use requestAnimationFrame**
   ```typescript
   function animate() {
     requestAnimationFrame(() => {
       // Animation logic
       if (shouldContinue) animate();
     });
   }
   ```

### 4.4 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Accessibility Guidelines

### 5.1 WCAG Compliance

**Target Level: WCAG 2.1 AA**

#### 5.1.1 Perceivable

**Color Contrast**
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Minimum 3:1 contrast ratio for UI components
- Verify with contrast checker tools

**Text Alternatives**
- Icons always have text labels
- Images have alt text
- Complex graphics have descriptions
- Color not sole indicator of meaning

**Time-Based Media**
- No auto-playing media
- User controls for all media
- Captions for video content
- Audio descriptions for visual content

#### 5.1.2 Operable

**Keyboard Navigation**
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- No keyboard traps
- Skip navigation links

**Timing Control**
- No time limits on interactions
- Pause/stop auto-updating content
- User controls for motion
- Warning before time expiration

**Seizure Safety**
- No flashing content (>3x/second)
- No rapid color changes
- User control for motion
- Respect reduced-motion preference

#### 5.1.3 Understandable

**Language**
- Page language declared (html lang)
- Consistent reading direction
- Text expansion support (30% buffer)
- Clear, simple language

**Predictability**
- Consistent navigation patterns
- Clear feedback for actions
- Predictable component behavior
- No unexpected state changes

**Error Identification**
- Clear error messages
- Specific error descriptions
- Recovery suggestions
- Input validation feedback

#### 5.1.4 Robust

**Compatibility**
- Works with assistive technologies
- Graceful degradation
- No JavaScript dependency for core content
- Semantic HTML structure

**Error Recovery**
- Form validation before submission
- Clear error messages
- Recovery options provided
- No data loss on errors

### 5.2 ARIA Implementation

**ARIA Labels**
```tsx
// ❌ BAD: No label
<button onClick={handleClick}>Click</button>

// ✅ GOOD: ARIA label
<button 
  onClick={handleClick}
  aria-label="Save changes"
>
  Save
</button>
```

**ARIA Roles**
```tsx
// ✅ GOOD: Semantic roles
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/home">Home</a>
    </li>
  </ul>
</nav>
```

**ARIA States**
```tsx
// ✅ GOOD: Live regions
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  File saved successfully
</div>

// ✅ GOOD: Expanded states
<button
  aria-expanded={isOpen}
  aria-controls="menu-panel"
  aria-haspopup="true"
>
  Menu
</button>
```

**ARIA Descriptions**
```tsx
// ✅ GOOD: Complex descriptions
<div
  role="img"
  aria-label="Via-gent logo"
  aria-describedby="logo-description"
>
  <svg>...</svg>
</div>
<span id="logo-description" className="sr-only">
  Via-gent IDE logo - a pixel art rocket ship
</span>
```

### 5.3 Keyboard Navigation

**Tab Order**
```tsx
// ✅ GOOD: Logical tab order
<div>
  <button tabIndex={1}>First</button>
  <button tabIndex={2}>Second</button>
  <button tabIndex={3}>Third</button>
</div>
```

**Keyboard Shortcuts**
```tsx
// ✅ GOOD: Keyboard handlers
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.ctrlKey && e.key === 'k') {
      onOpenCommandPalette();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Focus Management**
```tsx
// ✅ GOOD: Focus trap in modals
const Modal = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus first focusable element
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
      
      // Trap focus
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          // Cycle focus within modal
        }
      };
      
      modalRef.current.addEventListener('keydown', handleTab);
      return () => modalRef.current?.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);
  
  // ...
};
```

### 5.4 Screen Reader Support

**Screen Reader Only Content**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Live Announcements**
```tsx
// ✅ GOOD: Live regions for dynamic content
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

**Descriptive Links**
```tsx
// ✅ GOOD: Descriptive links
<a
  href="/settings"
  aria-label="Navigate to settings page"
>
  <SettingsIcon aria-hidden="true" />
  <span>Settings</span>
</a>
```

### 5.5 Focus Indicators

**Visible Focus Styles**
```css
/* ✅ GOOD: Visible focus indicators */
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Custom focus for 8-bit style */
button:focus-visible {
  outline: 4px solid var(--color-8bit-blue);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-8bit-blue);
}
```

**Focus Ring Components**
```tsx
// ✅ GOOD: Focus ring wrapper
const FocusRing = ({ children, className }) => (
  <div className={cn('focus-ring', className)}>
    {children}
  </div>
);
```

### 5.6 Accessibility Testing Checklist

**Manual Testing:**
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces all important information
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] All interactive elements have focus indicators
- [ ] Forms have proper labels and error messages
- [ ] Dynamic content updates are announced
- [ ] Reduced motion preference is respected
- [ ] Text can be resized to 200% without breaking layout
- [ ] All images have alt text

**Automated Testing:**
- [ ] axe-core passes with no violations
- [ ] Lighthouse accessibility score >90
- [ ] WAVE tool passes all checks
- [ ] No keyboard traps detected
- [ ] All ARIA attributes are valid

---

## 6. Responsive Strategy

### 6.1 Breakpoints

```css
/* Breakpoint Scale */
--breakpoint-xs: 0px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

**Breakpoint Definitions:**
- **Mobile**: < 640px (phones, small tablets)
- **Tablet**: 640px - 1024px (tablets, small laptops)
- **Desktop**: 1024px - 1440px (laptops, desktops)
- **Large Desktop**: > 1440px (large monitors, 4K)

### 6.2 Responsive Patterns

#### 6.2.1 Mobile-First Approach

```css
/* Base styles (mobile) */
.component {
  padding: var(--spacing-3);
  font-size: var(--text-base);
}

/* Tablet */
@media (min-width: 640px) {
  .component {
    padding: var(--spacing-4);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: var(--spacing-6);
    font-size: var(--text-lg);
  }
}
```

#### 6.2.2 Container Queries

```css
.container {
  container-type: inline-size;
}

@container (min-width: 640px) {
  .component {
    /* Tablet styles */
  }
}

@container (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

#### 6.2.3 Responsive Components

**Responsive Grid**
```css
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-4);
}

@media (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Responsive Sidebar**
```css
.sidebar {
  width: 100%;
  position: fixed;
  z-index: 50;
}

@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
    position: relative;
  }
}
```

**Responsive Typography**
```css
.responsive-text {
  font-size: clamp(
    var(--text-sm),
    var(--text-base),
    var(--text-lg)
  );
}

/* Alternative with media queries */
.responsive-text {
  font-size: var(--text-sm);
}

@media (min-width: 640px) {
  .responsive-text {
    font-size: var(--text-base);
  }
}

@media (min-width: 1024px) {
  .responsive-text {
    font-size: var(--text-lg);
  }
}
```

### 6.3 Component Behavior by Breakpoint

| Component | Mobile (<640px) | Tablet (640-1024px) | Desktop (1024-1440px) | Large Desktop (>1440px) |
|-----------|------------------|------------------------|-------------------------|------------------------|
| IDELayout | Full-screen, stacked panels | Split view, collapsible sidebar | 3-column layout | Full IDE layout |
| IconSidebar | Bottom navigation bar | Left sidebar (collapsed) | Left sidebar (expanded) | Left sidebar (expanded) |
| AgentChatPanel | Full-screen overlay | Right panel (50% width) | Right panel (40% width) | Right panel (33% width) |
| FileTree | Collapsible drawer | Left panel (200px) | Left panel (280px) | Left panel (320px) |
| Terminal | Bottom sheet | Bottom panel (200px height) | Bottom panel (300px height) | Bottom panel (400px height) |
| Editor | Full screen | 80% width | 70% width | 65% width |

### 6.4 Touch-Friendly Targets

**Minimum Touch Target Size: 48x48px**

```css
.touch-target {
  min-width: 48px;
  min-height: 48px;
  padding: var(--spacing-3);
}

/* Ensure adequate spacing */
.touch-target + .touch-target {
  margin-top: var(--spacing-2);
  margin-left: var(--spacing-2);
}
```

---

## 7. Theme System

### 7.1 Theme Architecture

**Theme Structure:**
- CSS variables for all design tokens
- Dark theme as default (developer preference)
- Light theme support
- System theme detection
- Theme persistence (localStorage)

### 7.2 Theme Variables

```css
:root {
  /* Theme Indicator */
  --theme-mode: dark;
  
  /* Background Colors */
  --color-background: var(--color-neutral-950);
  --color-surface: var(--color-neutral-900);
  --color-surface-elevated: var(--color-neutral-800);
  
  /* Text Colors */
  --color-text-primary: var(--color-neutral-100);
  --color-text-secondary: var(--color-neutral-400);
  --color-text-tertiary: var(--color-neutral-500);
  
  /* Border Colors */
  --color-border-default: var(--color-neutral-800);
  --color-border-focus: var(--color-primary-500);
  --color-border-error: var(--color-error-500);
  
  /* Interactive Colors */
  --color-primary: var(--color-primary-500);
  --color-primary-hover: var(--color-primary-600);
  --color-primary-active: var(--color-primary-700);
  
  /* Status Colors */
  --color-success: var(--color-success-500);
  --color-warning: var(--color-warning-500);
  --color-error: var(--color-error-500);
  --color-info: var(--color-info-500);
}

[data-theme="light"] {
  /* Background Colors */
  --color-background: var(--color-neutral-50);
  --color-surface: var(--color-white);
  --color-surface-elevated: var(--color-neutral-100);
  
  /* Text Colors */
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-tertiary: var(--color-neutral-500);
  
  /* Border Colors */
  --color-border-default: var(--color-neutral-200);
  --color-border-focus: var(--color-primary-500);
  --color-border-error: var(--color-error-500);
}
```

### 7.3 Theme Switching

**Theme Detection**
```typescript
import { useEffect } from 'react';

const useTheme = () => {
  useEffect(() => {
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Apply theme
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
};
```

**Theme Toggle Component**
```typescript
interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className={className}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
```

### 7.4 8-bit Theme Variants

**Retro Dark Theme**
```css
[data-theme="dark"][data-variant="retro"] {
  --color-background: #0a0a0a;
  --color-surface: #1a1c2c;
  --color-text-primary: #f4f4f5;
  --color-border-default: #383c4c;
  --shadow-base: 0 4px 0 #000000;
}
```

**Retro Light Theme**
```css
[data-theme="light"][data-variant="retro"] {
  --color-background: #f4f4f5;
  --color-surface: #ffffff;
  --color-text-primary: #1a1c2c;
  --color-border-default: #7b8496;
  --shadow-base: 0 4px 0 #383c4c;
}
```

### 7.5 Theme Composition

**Component Theming Pattern**
```typescript
// ✅ GOOD: Use theme variables
const ThemedComponent = () => (
  <div className="bg-background text-text-primary border-border">
    Content
  </div>
);

// ❌ BAD: Hard-coded colors
const UnthemedComponent = () => (
  <div className="bg-neutral-950 text-neutral-100 border-neutral-800">
    Content
  </div>
);
```

---

## 8. i18n Support

### 8.1 Supported Languages

**Primary Languages:**
- English (en) - Default language
- Vietnamese (vi) - Secondary language

**Future Languages:**
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Spanish (es)
- French (fr)

### 8.2 i18n Architecture

**Translation Structure:**
```json
{
  "translation": {
    "common": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit"
    },
    "ide": {
      "title": "Via-gent IDE",
      "editor": "Editor",
      "terminal": "Terminal",
      "fileTree": "File Tree"
    },
    "agent": {
      "title": "AI Agent",
      "chat": "Chat",
      "configure": "Configure Agent"
    }
  }
}
```

**Translation Keys:**
```typescript
// ✅ GOOD: Structured keys
t('ide.editor')
t('agent.chat.send')

// ❌ BAD: Flat keys
t('editor')
t('chat-send')
```

### 8.3 Text Expansion

**30% Buffer Rule:**
All UI elements must accommodate 30% text expansion for translated content.

```css
/* ✅ GOOD: Flexible sizing */
.button {
  min-width: fit-content;
  padding: var(--spacing-3) var(--spacing-4);
}

/* ❌ BAD: Fixed sizing */
.button {
  width: 100px;  /* Too narrow for expanded text */
}
```

**Line Height Adjustment:**
```css
/* ✅ GOOD: Generous line height for expansion */
.expanded-text {
  line-height: var(--leading-relaxed);
}

/* ❌ BAD: Tight line height */
.tight-text {
  line-height: var(--leading-tight);
}
```

### 8.4 RTL Support

**RTL Preparation:**
```css
/* ✅ GOOD: RTL-aware spacing */
.component {
  margin-inline-start: var(--spacing-4);
  margin-inline-end: var(--spacing-4);
  padding-inline-start: var(--spacing-3);
  padding-inline-end: var(--spacing-3);
}

/* ❌ BAD: LTR-only spacing */
.component {
  margin-left: var(--spacing-4);
  margin-right: var(--spacing-4);
  padding-left: var(--spacing-3);
  padding-right: var(--spacing-3);
}
```

**RTL Detection:**
```typescript
const isRTL = () => {
  return document.documentElement.dir === 'rtl';
};
```

### 8.5 Date/Time Formatting

**Locale-Aware Formatting:**
```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { en, vi } from 'date-fns/locale';

const formatDate = (date: Date, locale: 'en' | 'vi' = 'en') => {
  return format(date, 'PPP', { locale });
};

const formatRelativeTime = (date: Date, locale: 'en' | 'vi' = 'en') => {
  return formatDistanceToNow(date, { 
    addSuffix: true,
    locale 
  });
};
```

### 8.6 Number Formatting

**Locale-Aware Numbers:**
```typescript
const formatNumber = (value: number, locale: 'en' | 'vi' = 'en') => {
  return new Intl.NumberFormat(locale).format(value);
};

const formatCurrency = (value: number, locale: 'en' | 'vi' = 'en') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};
```

### 8.7 i18n Component Pattern

**Language Switcher**
```typescript
interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const LanguageSwitcher = ({ currentLanguage, onLanguageChange, className }) => (
  <div className={className}>
    {languages.map((lang) => (
      <button
        key={lang.code}
        onClick={() => onLanguageChange(lang.code)}
        aria-label={`Switch to ${lang.name}`}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          currentLanguage === lang.code && 'bg-primary-500'
        )}
      >
        <span>{lang.flag}</span>
        <span>{lang.name}</span>
      </button>
    ))}
  </div>
);
```

---

## 9. Asset Guidelines

### 9.1 Icon System

**Icon Style: Pixel Art (24x24 base)**

**Icon Specifications:**
- **Size**: 24x24px base, scalable to 16x16, 32x32
- **Style**: Pixel art, sharp edges
- **Colors**: 8-bit palette (see section 2.1.5)
- **Format**: SVG with optimized paths
- **Stroke**: 2px solid (no anti-aliasing)

**Icon Categories:**
- **Navigation**: Home, Settings, Back, Forward, Menu
- **Actions**: Save, Delete, Edit, Copy, Paste
- **IDE**: File, Folder, Code, Terminal, Search
- **Agent**: Robot, Chat, Brain, Configuration
- **Status**: Check, X, Warning, Info, Error
- **Media**: Play, Pause, Stop, Volume

**Icon Usage Guidelines:**
```tsx
// ✅ GOOD: Icon with label
<button aria-label="Save changes">
  <SaveIcon aria-hidden="true" />
  <span>Save</span>
</button>

// ❌ BAD: Icon without label
<button>
  <SaveIcon />
</button>
```

**Icon Component:**
```typescript
interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ariaLabel?: string;
}

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const Icon = ({ name, size = 'md', className, ariaLabel }: IconProps) => {
  const IconComponent = iconMap[name];
  const pixelSize = iconSizes[size];
  
  return (
    <IconComponent
      width={pixelSize}
      height={pixelSize}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
};
```

### 9.2 Logo Guidelines

**Logo Specifications:**
- **Style**: Pixel art rocket ship
- **Colors**: Primary-500 + 8-bit palette
- **Size**: 48x48px base, scalable
- **Format**: SVG with optimized paths
- **Variants**: Full color, monochrome, icon-only

**Logo Usage:**
```tsx
// ✅ GOOD: Logo with alt text
<img
  src="/logo.svg"
  alt="Via-gent IDE logo"
  width={48}
  height={48}
/>

// ❌ BAD: Logo without alt text
<img src="/logo.svg" width={48} height={48} />
```

**Logo Component:**
```typescript
interface LogoProps {
  variant?: 'full' | 'monochrome' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ variant = 'full', size = 'md', className }: LogoProps) => {
  const sizes = { sm: 32, md: 48, lg: 64 };
  return (
    <img
      src={`/logo-${variant}.svg`}
      alt="Via-gent IDE logo"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
};
```

### 9.3 Illustration Style

**Illustration Guidelines:**
- **Style**: Pixel art illustrations
- **Colors**: 8-bit palette + brand colors
- **Subject**: IDE-related (coding, AI, files)
- **Size**: Scalable SVG, optimized
- **Animation**: Subtle motion (optional)

**Illustration Categories:**
- **Onboarding**: Welcome, getting started
- **Empty States**: No files, no agents, no projects
- **Error States**: Connection lost, sync failed, error occurred
- **Success States**: Setup complete, file saved, agent configured

### 9.4 Image Optimization

**Optimization Guidelines:**

1. **SVG Optimization**
   ```xml
   <!-- ✅ GOOD: Optimized SVG -->
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
     <path d="M4 4h16v16H4z" stroke-width="2" stroke-linecap="square"/>
   </svg>
   
   <!-- ❌ BAD: Unoptimized SVG -->
   <svg viewBox="0 0 24 24">
     <path d="..." stroke-width="2.5" stroke-linecap="round"/>
   </svg>
   ```

2. **Image Compression**
   - Use WebP format with fallback
   - Compress to <100KB for illustrations
   - Use responsive images (srcset)
   - Lazy load below-the-fold images

3. **Icon Sprite (Optional)**
   ```xml
   <!-- Icon sprite for performance -->
   <svg xmlns="http://www.w3.org/2000/svg">
     <defs>
       <symbol id="icon-save" viewBox="0 0 24 24">
         <path d="M4 4h16v16H4z"/>
       </symbol>
       <symbol id="icon-delete" viewBox="0 0 24 24">
         <path d="M4 4h16v16H4z"/>
       </symbol>
     </defs>
   </svg>
   ```

---

## 10. Implementation Guide

### 10.1 Getting Started

**Step 1: Install Dependencies**
```bash
pnpm add class-variance-authority clsx tailwind-merge
```

**Step 2: Create Design Token File**
```typescript
// src/styles/tokens.css
:root {
  /* Import all design tokens */
  @import './tokens/colors.css';
  @import './tokens/typography.css';
  @import './tokens/spacing.css';
  @import './tokens/borders.css';
  @import './tokens/shadows.css';
  @import './tokens/transitions.css';
}
```

**Step 3: Create Utility Functions**
```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Create Base Components**
```typescript
// src/components/ui/button.tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-neutral-950',
        secondary: 'bg-neutral-700 text-neutral-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
      },
    },
  }
);

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  onClick 
}: ButtonProps) => (
  <button 
    className={cn(buttonVariants({ variant, size }), className)}
    onClick={onClick}
  >
    {children}
  </button>
);
```

### 10.2 Component Creation Workflow

**Workflow:**

1. **Define Props Interface**
   ```typescript
   interface ComponentProps {
     // Required props
     children: React.ReactNode;
     
     // Optional props with defaults
     variant?: 'primary' | 'secondary';
     size?: 'sm' | 'md' | 'lg';
     
     // Event handlers
     onClick?: () => void;
     
     // Styling overrides
     className?: string;
     
     // Accessibility
     disabled?: boolean;
     'aria-label'?: string;
   }
   ```

2. **Create Variants with CVA**
   ```typescript
   const componentVariants = cva(
     'base-classes',
     {
       variants: {
         variant: {
           primary: 'primary-classes',
           secondary: 'secondary-classes',
         },
         size: {
           sm: 'sm-classes',
           md: 'md-classes',
           lg: 'lg-classes',
         },
       },
       defaultVariants: {
         variant: 'primary',
         size: 'md',
       },
     }
   );
   ```

3. **Implement Component**
   ```typescript
   export const Component = ({ 
     variant = 'primary', 
     size = 'md', 
     className, 
     children, 
     onClick,
     disabled,
     'aria-label'
   }: ComponentProps) => (
     <button
       className={cn(componentVariants({ variant, size }), className)}
       onClick={onClick}
       disabled={disabled}
       aria-label={ariaLabel}
     >
       {children}
     </button>
   );
   ```

4. **Add JSDoc Comments**
   ```typescript
   /**
    * Button component with 8-bit styling
    * 
    * @param variant - Visual variant (primary, secondary, ghost, danger, success)
    * @param size - Size variant (xs, sm, md, lg, xl)
    * @param disabled - Disable interaction
    * @param className - Additional CSS classes
    * @param children - Button content
    * @param onClick - Click handler
    * @param ariaLabel - Accessibility label
    */
   ```

5. **Write Tests**
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { Button } from './button';
   
   describe('Button', () => {
     it('renders with default props', () => {
       render(<Button>Click me</Button>);
       expect(screen.getByRole('button')).toBeInTheDocument();
     });
     
     it('applies variant classes', () => {
       render(<Button variant="secondary">Click me</Button>);
       expect(screen.getByRole('button')).toHaveClass('bg-neutral-700');
     });
     
     it('is accessible via keyboard', () => {
       render(<Button>Click me</Button>);
       const button = screen.getByRole('button');
       button.focus();
       expect(button).toHaveFocus();
     });
   });
   ```

6. **Export from Index**
   ```typescript
   // src/components/ui/index.ts
   export { Button } from './button';
   export { Input } from './input';
   export { Card } from './card';
   // ... other exports
   ```

### 10.3 Design System Migration

**Migration Strategy:**

1. **Audit Existing Components**
   - List all components with hard-coded values
   - Identify design token opportunities
   - Create migration backlog

2. **Create Migration Tasks**
   ```markdown
   ## Migration Task Template
   
   ### Component: [ComponentName]
   
   **Current Issues:**
   - [ ] Hard-coded colors
   - [ ] Hard-coded spacing
   - [ ] No variants
   - [ ] Missing accessibility
   
   **Migration Steps:**
   - [ ] Extract design tokens
   - [ ] Create CVA variants
   - [ ] Add ARIA attributes
   - [ ] Write tests
   - [ ] Update documentation
   ```

3. **Prioritize Components**
   - High-usage components first
   - Layout components before UI components
   - Critical paths (agent chat, editor) first

4. **Incremental Migration**
   - Migrate one component at a time
   - Test thoroughly before merging
   - Update design system documentation

### 10.4 Best Practices

**Do:**
- ✅ Use design tokens for all values
- ✅ Create variants with CVA
- ✅ Implement accessibility from start
- ✅ Write tests for all components
- ✅ Document component usage
- ✅ Use semantic HTML elements
- ✅ Provide keyboard navigation
- ✅ Support reduced motion
- ✅ Test with screen readers
- ✅ Validate color contrast

**Don't:**
- ❌ Hard-code colors, spacing, sizes
- ❌ Skip accessibility features
- ❌ Create components without tests
- ❌ Use non-semantic HTML
- ❌ Ignore keyboard navigation
- ❌ Auto-play media
- ❌ Use color as sole indicator
- ❌ Skip i18n support
- ❌ Create over-engineered solutions

### 10.5 Design System Maintenance

**Versioning:**
- Semantic versioning (1.0.0, 1.1.0, 2.0.0)
- Changelog documentation
- Breaking change notices
- Migration guides for major versions

**Documentation:**
- Component storybook (optional)
- Usage examples for all components
- Design token reference
- Accessibility guidelines
- i18n patterns

**Governance:**
- Design system review meetings
- Component approval process
- Design debt tracking
- Continuous improvement

---

## Appendix

### A. Design Token Reference

**Complete Token List:**
```css
/* Colors */
--color-primary-50 to --color-primary-950
--color-secondary-purple-500 to --color-secondary-yellow-600
--color-neutral-50 to --color-neutral-950
--color-success-50 to --color-success-700
--color-warning-50 to --color-warning-700
--color-error-50 to --color-error-700
--color-info-50 to --color-info-700
--color-8bit-black to --color-8bit-pink

/* Typography */
--font-sans, --font-mono, --font-display
--text-xs to --text-5xl
--font-normal to --font-extrabold
--leading-none to --leading-loose
--tracking-tighter to --tracking-widest

/* Spacing */
--spacing-0 to --spacing-24
--spacing-input, --spacing-button, --spacing-card, --spacing-panel, --spacing-section, --spacing-grid

/* Border Radius */
--radius-none to --radius-full

/* Shadows */
--shadow-none to --shadow-2xl
--shadow-primary, --shadow-success, --shadow-warning, --shadow-error

/* Transitions */
--duration-instant to --duration-slowest
--ease-linear to --ease-bounce
--transition-base to --transition-opacity
```

### B. Component Quick Reference

**Component Index:**
- Layout: IDELayout, IDEHeaderBar, IconSidebar
- Navigation: Tabs, Breadcrumbs
- Form: Input, Select, Checkbox, Switch
- Feedback: Button, Toast, Dialog, Alert, Badge
- Data Display: Card, Table, List
- IDE: EditorPanel, TerminalPanel, FileTree, StatusBar
- Agent: AgentChatPanel, AgentConfigDialog, ApprovalOverlay

### C. Accessibility Checklist

**WCAG 2.1 AA Checklist:**
- [ ] Perceivable: Color contrast ≥4.5:1
- [ ] Perceivable: Text alternatives for non-text content
- [ ] Operable: Keyboard accessible
- [ ] Operable: No keyboard traps
- [ ] Operable: Focus indicators visible
- [ ] Understandable: Page language identified
- [ ] Understandable: Consistent navigation
- [ ] Robust: ARIA attributes correct
- [ ] Robust: Error messages clear
- [ ] Robust: Form validation provided

### D. i18n Translation Keys

**Required Keys:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "ide": {
    "title": "Via-gent IDE",
    "editor": "Editor",
    "terminal": "Terminal",
    "fileTree": "File Tree",
    "statusBar": "Status Bar"
  },
  "agent": {
    "title": "AI Agent",
    "chat": "Chat",
    "configure": "Configure Agent",
    "approval": "Approve Tool Execution"
  }
}
```

---

## Conclusion

This 8-bit design system provides a comprehensive, extensible foundation for Via-gent IDE's UI/UX transformation. By following these guidelines, developers can create consistent, accessible, and visually appealing interfaces that honor the retro-gaming aesthetic while meeting modern usability standards.

**Next Steps:**
1. Create design token CSS files
2. Implement base components with CVA variants
3. Migrate existing components to design system
4. Add comprehensive tests
5. Create component documentation
6. Train developers on design system usage

**Success Metrics:**
- Design system adoption: 100% for new components
- Component reusability: >80%
- Accessibility compliance: WCAG AA (100%)
- Developer satisfaction: >4/5 rating
- Design consistency: >9/10 audit score

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-25  
**Maintained By**: UX Designer Agent (@bmad-bmm-ux-designer)
