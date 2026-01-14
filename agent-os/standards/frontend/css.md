---
date: '2025-12-31'
time: '03:45:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Frontend CSS Standards

_Standards for styling the Via-gent IDE using Tailwind CSS v4, CSS custom properties, and the 8-bit gaming aesthetic. This document defines solid retro styling (no glassmorphism), design tokens, utility patterns, animation standards, and responsive styling guidelines._

---

## 1. Styling Architecture Overview

### 1.1 Technology Stack

| Technology | Version | description |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **CSS Custom Properties** | Level 3 | Design tokens, theming |
| **class-variance-authority (CVA)** | Latest | Component variant styles |
| **clsx** | Latest | Conditional class merging |
| **tailwind-merge** | Latest | Class deduplication |

### 1.2 CSS File Structure

```
src/styles/
├── design-tokens.css      # CSS custom properties (design tokens)
├── design-tokens.ts       # TypeScript constants for tokens
├── animations.css         # Animation keyframes and utilities
├── global.css             # Global styles, resets
├── tailwind.css           # Tailwind directives
├── reset.css              # CSS reset
└── rtl-support.css        # RTL language support
```

---

## 2. Design Tokens System

### 2.1 Color Tokens (8-bit Gaming Theme)

```css
/* src/styles/design-tokens.css */
:root {
  /* === 8-bit Dark Theme Palette === */
  
  /* Background layers (dark to light) */
  --color-bg-primary: #0f0f0f;
  --color-bg-secondary: #1a1a1a;
  --color-bg-tertiary: #242424;
  --color-bg-elevated: #2d2d2d;
  --color-bg-inverse: #f3f4f6;
  
  /* Text layers (light to dark) */
  --color-text-primary: #f3f4f6;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-text-inverse: #1f2937;
  
  /* Accent colors (8-bit vibrant) */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-active: #1d4ed8;
  
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;
  
  /* Border colors */
  --color-border: #374151;
  --color-border-hover: #4b5563;
  --color-border-focus: #3b82f6;
  
  /* Shadow colors */
  --shadow-color: rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 1px 2px var(--shadow-color);
  --shadow-md: 0 4px 6px var(--shadow-color);
  --shadow-lg: 0 10px 15px var(--shadow-color);
  --shadow-xl: 0 20px 25px var(--shadow-color);
}
```

### 2.2 Layout Tokens

```css
:root {
  /* === Layout Tokens === */
  
  /* Spacing scale (8-bit grid: 4px base unit) */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  
  /* Panel sizes */
  --panel-sidebar-width: 280px;
  --panel-explorer-width: 260px;
  --panel-chat-width: 360px;
  --panel-terminal-height: 200px;
  --panel-statusbar-height: 28px;
  
  /* Header heights */
  --header-height: 48px;
  --toolbar-height: 40px;
  
  /* Border radius (8-bit: 0, 4px, 8px, 12px) */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

### 2.3 Typography Tokens

```css
:root {
  /* === Typography Tokens === */
  
  /* Font families */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  /* Font sizes (8-bit scale) */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 24px;
  --text-4xl: 30px;
  
  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### 2.4 Animation Tokens

```css
:root {
  /* === Animation Tokens === */
  
  /* Duration scale (8-bit feel: fast to slow) */
  --duration-instant: 0ms;
  --duration-fast: 75ms;
  --duration-normal: 150ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --duration-slowest: 750ms;
  
  /* Easing curves */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-8bit: steps(4, end);
}
```

### 2.5 TypeScript Design Tokens Export

```typescript
// src/styles/design-tokens.ts
export const colors = {
  bg: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-bg-tertiary)',
    elevated: 'var(--color-bg-elevated)',
    inverse: 'var(--color-bg-inverse)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    muted: 'var(--color-text-muted)',
    inverse: 'var(--color-text-inverse)',
  },
  primary: {
    DEFAULT: 'var(--color-primary)',
    hover: 'var(--color-primary-hover)',
    active: 'var(--color-primary-active)',
  },
  error: 'var(--color-error)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  border: 'var(--color-border)',
};

export const spacing = {
  0: 'var(--space-0)',
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  16: 'var(--space-16)',
};

export const layout = {
  sidebarWidth: 'var(--panel-sidebar-width)',
  explorerWidth: 'var(--panel-explorer-width)',
  chatWidth: 'var(--panel-chat-width)',
  terminalHeight: 'var(--panel-terminal-height)',
  statusbarHeight: 'var(--panel-statusbar-height)',
  headerHeight: 'var(--header-height)',
};

export const animation = {
  duration: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  },
  ease: {
    inOut: 'var(--ease-in-out)',
    bounce: 'var(--ease-bounce)',
  },
};

export type Color = keyof typeof colors;
export type Spacing = keyof typeof spacing;
```

---

## 3. Tailwind CSS Configuration

### 3.1 Tailwind v4 Configuration

```typescript
// vite.config.ts (Tailwind v4 plugin config)
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@tanstack/react-router-plugin/react';

export default defineConfig({
  plugins: [
    tailwindcss({
      theme: {
        extend: {
          colors: {
            // Map design tokens to Tailwind
            'bg-primary': 'var(--color-bg-primary)',
            'bg-secondary': 'var(--color-bg-secondary)',
            'bg-tertiary': 'var(--color-bg-tertiary)',
            'text-primary': 'var(--color-text-primary)',
            'text-secondary': 'var(--color-text-secondary)',
            'text-muted': 'var(--color-text-muted)',
            'primary': 'var(--color-primary)',
            'error': 'var(--color-error)',
            'success': 'var(--color-success)',
            'border': 'var(--color-border)',
          },
          spacing: {
            'panel': 'var(--panel-sidebar-width)',
            'header': 'var(--header-height)',
          },
          fontFamily: {
            'sans': 'var(--font-sans)',
            'mono': 'var(--font-mono)',
          },
          animation: {
            'fade-in': 'fadeIn var(--duration-normal) var(--ease-out)',
            'slide-up': 'slideUp var(--duration-normal) var(--ease-out)',
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            slideUp: {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
          },
        },
      },
    }),
    react(),
  ],
});
```

### 3.2 Global CSS Import

```css
/* src/styles/tailwind.css */
@import 'tailwindcss';

/* Import design tokens first */
@import './design-tokens.css';

/* Import animations */
@import './animations.css';

/* Import global styles */
@import './global.css';

/* Import RTL support */
@import './rtl-support.css';
```

---

## 4. Component Variant Patterns

### 4.1 CVA Pattern for Variants

```typescript
// src/components/ui/button.types.ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-tertiary text-primary hover:bg-elevated',
        ghost: 'hover:bg-tertiary text-secondary hover:text-primary',
        danger: 'bg-error text-white hover:bg-red-600',
        success: 'bg-success text-white hover:bg-emerald-600',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;
```

### 4.2 Using Variants in Components

```typescript
// src/components/ui/Button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariant, type ButtonSize } from './button.types';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="button-icon">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="button-icon">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

---

## 5. Utility Functions

### 5.1 Class Merging (clsx + tailwind-merge)

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
cn(
  'base-styles',
  condition && 'conditional-styles',
  variant === 'primary' && 'primary-styles'
);
```

### 5.2 Color Utility Functions

```typescript
// src/lib/utils/colors.ts
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): 'light' | 'dark' {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'light';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'dark' : 'light';
}
```

---

## 6. Animation Standards

### 6.1 Animation Keyframes

```css
/* src/styles/animations.css */

/* === 8-bit Themed Animations === */

/* Fade animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Slide animations */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Scale animations */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Blink animation (8-bit style) */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Glitch effect (8-bit gaming) */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
```

### 6.2 Animation Utility Classes

```css
/* Animation utilities */
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-fade-out {
  animation: fadeOut var(--duration-normal) var(--ease-in);
}

.animate-slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.animate-slide-down {
  animation: slideDown var(--duration-normal) var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-out);
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-blink {
  animation: blink 1s step-end infinite;
}

/* Animation delays */
.delay-0 { animation-delay: 0ms; }
.delay-75 { animation-delay: 75ms; }
.delay-150 { animation-delay: 150ms; }
.delay-300 { animation-delay: 300ms; }
```

### 6.3 Animation in Components

```typescript
// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
  };

  return (
    <div
      className={cn(
        'rounded-full border-current border-t-transparent animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

---

## 7. Global Styles

### 7.1 CSS Reset

```css
/* src/styles/reset.css */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

/* Focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default button styles */
button {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
}

/* Remove default input styles */
input,
textarea,
select {
  font: inherit;
  color: inherit;
}

/* Links */
a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Code blocks */
code,
pre {
  font-family: var(--font-mono);
}
```

### 7.2 Scrollbar Styling

```css
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 5px;
  border: 2px solid var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

::-webkit-scrollbar-corner {
  background: var(--color-bg-secondary);
}
```

---

## 8. CSS-in-JS Patterns

### 8.1 Inline Styles for Dynamic Values

```typescript
// For values not known at build time
interface DynamicPanelProps {
  width: number;
  minWidth?: number;
}

function DynamicPanel({ width, minWidth = 200 }: DynamicPanelProps) {
  return (
    <div
      style={{
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        padding: 'var(--space-4)',
      }}
    >
      Content
    </div>
  );
}
```

### 8.2 CSS Module Pattern

```css
/* src/components/ide/ExplorerPanel.module.css */
.panel {
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}
```

```typescript
// src/components/ide/ExplorerPanel.tsx
import styles from './ExplorerPanel.module.css';

export function ExplorerPanel() {
  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <span>Explorer</span>
      </header>
      <div className={styles.content}>
        {/* Content */}
      </div>
    </aside>
  );
}
```

---

## 9. Dark Theme Support

### 9.1 Theme Colors (CSS Variables)

```css
/* src/styles/themes.css */

/* Default dark theme (8-bit gaming style) */
:root {
  /* Use the 8-bit dark theme defined in design-tokens.css */
  color-scheme: dark;
}

/* Light theme (when needed) */
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text-primary: #1f2937;
  --color-text-secondary: #374151;
  --color-border: #e5e7eb;
}
```

### 9.2 Theme Toggle Component

```typescript
// src/components/ui/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Button } from './Button';
import { SunIcon, MoonIcon } from './icons';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
```

---

## 10. Performance Optimizations

### 10.1 CSS Containment

```css
/* Performance: Use CSS containment for large lists */
.file-tree-item {
  contain: content;
  will-change: transform;
}

.panel-content {
  contain: layout paint;
  overflow-anchor: auto;
}
```

### 10.2 Font Loading

```css
/* Font display swap */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
  font-style: normal;
}
```

---

## Related Documents

- [`components.md`](components.md): Component patterns
- [`accessibility.md`](accessibility.md): Accessibility requirements
- [`responsive.md`](responsive.md): Responsive design
- [`global/coding-style.md`](../global/coding-style.md): Code patterns
- [`design-tokens.ts`](../../src/styles/design-tokens.ts): TypeScript tokens

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15*
