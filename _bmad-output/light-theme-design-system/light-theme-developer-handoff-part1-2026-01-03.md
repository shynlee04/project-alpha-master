# Light Theme Developer Handoff Specifications

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 4 - Developer Handoff
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft
- **Project**: Via-gent (Project Alpha v2.0)
- **Target Audience**: Frontend Developers
- **Preceding Documents**:
  - light-theme-design-system-foundation-2026-01-03.md
  - light-theme-component-specifications-part1-2026-01-03.md
  - light-theme-component-specifications-part2-2026-01-03.md
  - light-theme-component-specifications-part3-2026-01-03.md
  - light-theme-transition-design-2026-01-03.md

---

## Executive Summary

This document provides comprehensive implementation guidance for the light theme feature. Developers will find code examples, component migration patterns, integration strategies, and testing guidelines to successfully implement the light theme with zero breaking changes to existing dark theme functionality.

**Implementation Goals**:
- **Zero Breaking Changes**: Existing dark theme must continue working
- **Progressive Enhancement**: Light theme as opt-in enhancement
- **Developer DX**: Clear patterns, reusable utilities, minimal boilerplate
- **Performance**: 60fps animations, minimal bundle impact

---

## 1. Technical Architecture

### 1.1 Theme Implementation Strategy

**Approach**: CSS Custom Properties + Class-Based Theme Toggling

**Why This Approach**:
- Zero runtime performance overhead (CSS only)
- Easy to maintain and extend
- Works with existing component libraries (shadcn/ui)
- Supports per-user preferences (localStorage)
- Respects system preferences

### 1.2 File Structure

```
src/
├── styles/
│   ├── design-tokens.css          # Existing dark theme tokens
│   └── light-theme-tokens.css     # New: Light theme tokens
│
├── components/
│   └── ui/
│       ├── button.tsx             # Update: Light theme variants
│       ├── input.tsx              # Update: Light theme states
│       ├── ... (all UI components) # Update: Light theme support
│
├── lib/
│   ├── hooks/
│   │   └── use-theme.ts           # New: Theme hook
│   │
│   └── utils/
│       └── theme-utils.ts         # New: Theme utilities
│
└── app/
    ├── providers/
    │   └── theme-provider.tsx     # New: Theme provider
    │
    └── layout/
        └── theme-toggle.tsx       # New: Theme toggle component
```

---

## 2. CSS Custom Properties Setup

### 2.1 Light Theme Token File

**File**: `src/styles/light-theme-tokens.css` (NEW)

```css
/* Light Theme Tokens */
/* This file provides light theme overrides for design tokens */

:root {
  /* Primary Colors */
  --primary: 24.6 95% 53.1%;
  --primary-foreground: 0 0% 100%;
  --primary-50: 24.6 100% 96.5%;
  --primary-100: 24.6 100% 91.8%;
  --primary-200: 24.6 96.6% 83.1%;
  --primary-300: 24.6 97.2% 72.4%;
  --primary-400: 24.6 96.3% 61.2%;
  --primary-500: 24.6 95% 53.1%;
  --primary-600: 24.6 90.4% 48%;
  --primary-700: 24.6 88.5% 40.4%;
  --primary-800: 24.6 79% 32.7%;
  --primary-900: 24.6 74.5% 27.8%;
  --primary-950: 24.6 81.2% 14.5%;

  /* Semantic Colors */
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --success-50: 142 76% 96.7%;
  --success-100: 142 71% 92.5%;
  --success-200: 142 70% 85.1%;
  --success-300: 142 78% 73.1%;
  --success-400: 142 70% 58%;
  --success-500: 142 71% 45.3%;
  --success-600: 142 76% 36.3%;
  --success-700: 142 72% 29.2%;
  --success-800: 142 64% 24.1%;
  --success-900: 142 61% 20.2%;
  --success-950: 142 80% 10%;

  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --warning-50: 38 100% 96.3%;
  --warning-100: 38 96% 88.8%;
  --warning-200: 38 97% 76.7%;
  --warning-300: 38 96% 64.7%;
  --warning-400: 38 96% 56.3%;
  --warning-500: 38 92% 50.2%;
  --warning-600: 38 95% 43.7%;
  --warning-700: 38 91% 36.9%;
  --warning-800: 38 83% 31.4%;
  --warning-900: 38 78% 26.5%;
  --warning-950: 38 92% 14.1%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --destructive-50: 0 100% 97.3%;
  --destructive-100: 0 100% 94.1%;
  --destructive-200: 0 100% 89.4%;
  --destructive-300: 0 94% 81.8%;
  --destructive-400: 0 91% 70.8%;
  --destructive-500: 0 84% 60.2%;
  --destructive-600: 0 70% 50.6%;
  --destructive-700: 0 74% 41.8%;
  --destructive-800: 0 70% 35.3%;
  --destructive-900: 0 63% 30.6%;
  --destructive-950: 0 75% 15.5%;

  --info: 217 91% 60%;
  --info-foreground: 0 0% 100%;
  --info-50: 217 100% 96.9%;
  --info-100: 217 94% 92.7%;
  --info-200: 217 97% 87.3%;
  --info-300: 217 96% 78.4%;
  --info-400: 217 94% 68%;
  --info-500: 217 91% 59.8%;
  --info-600: 217 83% 53.3%;
  --info-700: 217 76% 48%;
  --info-800: 217 71% 40.2%;
  --info-900: 217 64% 32.9%;
  --info-950: 217 57% 21%;

  /* Neutral Colors */
  --background: 0 0% 98%;
  --foreground: 240 6% 10%;
  --neutral-50: 0 0% 98%;
  --neutral-100: 0 0% 96%;
  --neutral-200: 0 0% 90%;
  --neutral-300: 0 0% 83%;
  --neutral-400: 0 0% 64%;
  --neutral-500: 0 0% 45%;
  --neutral-600: 0 0% 32%;
  --neutral-700: 0 0% 25%;
  --neutral-800: 0 0% 15%;
  --neutral-900: 0 0% 9%;
  --neutral-950: 0 0% 4%;

  /* Surface Colors */
  --card: 0 0% 100%;
  --card-foreground: 240 6% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 6% 10%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 240 6% 10%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 0 0% 96%;
  --accent-foreground: 240 6% 10%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 24.6 95% 53.1%;
}

/* Light theme class - applied to html element */
.light {
  /* Inherits from :root with light theme values */
  /* All values already defined above */
}
```

### 2.2 Integration with Existing Design Tokens

**File**: `src/styles/design-tokens.css` (EXISTING - update required)

```css
/* Add this section to the existing design-tokens.css file */

/* ============================================================================
   THEME TRANSITIONS
   ============================================================================ */

/* Apply color transitions to all elements for smooth theme switching */
*,
*::before,
*::after {
  transition-property: background-color, color, border-color, box-shadow, fill, stroke;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
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

### 2.3 Global CSS Import

**File**: `src/index.css` or `src/app/globals.css` (EXISTING - update required)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Existing imports */
@import './styles/design-tokens.css';

/* NEW: Import light theme tokens */
@import './styles/light-theme-tokens.css';

/* Other imports... */
```

---

## 3. TypeScript Type Definitions

### 3.1 Theme Types

**File**: `src/types/theme.ts` (NEW)

```typescript
/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolved theme (actual rendered theme)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Theme context interface
 */
export interface ThemeContextValue {
  /**
   * Current theme mode preference
   */
  theme: ThemeMode;

  /**
   * Set theme mode preference
   */
  setTheme: (theme: ThemeMode) => void;

  /**
   * Resolved theme (actual theme based on mode and system preference)
   */
  resolvedTheme: ResolvedTheme;
  /**
   * Toggle between light and dark (skips system)
   */
  toggleTheme: () => void;
}

/**
 * Theme storage schema (for localStorage persistence)
 */
export interface ThemeStorage {
  theme: ThemeMode;
  timestamp: number;
}
```

### 3.2 Update Tailwind Config

**File**: `tailwind.config.ts` (EXISTING - update required)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'], // Update for class-based themes
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Existing dark theme colors (mapped to --*)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
        },
        // ... other color mappings (success, warning, destructive, info, neutral, etc.)
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## 4. React Implementation

### 4.1 Theme Hook

**File**: `src/lib/hooks/use-theme.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';
import type { ThemeMode, ResolvedTheme, ThemeStorage } from '@/types/theme';

const THEME_STORAGE_KEY = 'via-gent-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;

    const parsed: ThemeStorage = JSON.parse(stored);

    // Verify stored theme is valid
    if (parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system') {
      return parsed.theme;
    }

    return null;
  } catch (error) {
    console.error('[useTheme] Failed to parse stored theme:', error);
    return null;
  }
}

function saveTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;

  try {
    const storage: ThemeStorage = {
      theme,
      timestamp: Date.now(),
    };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('[useTheme] Failed to save theme:', error);
  }
}

/**
 * Theme management hook
 *
 * Manages theme state, persistence, and system preference detection.
 *
 * @example
 ```typescript
 * const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();
 *
 * // Set specific theme
 * setTheme('light');
 *
 * // Toggle between light and dark
 * toggleTheme();
 *
 * // Follow system preference
 * setTheme('system');
 * ```
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return getStoredTheme() ?? 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = getStoredTheme();
    if (stored && stored !== 'system') {
      return stored;
    }
    return getSystemTheme();
  });

  // Update resolved theme when theme or system preference changes
  useEffect(() => {
    const root = document.documentElement;

    let newResolvedTheme: ResolvedTheme;

    if (theme === 'system') {
      newResolvedTheme = getSystemTheme();
    } else {
      newResolvedTheme = theme;
    }

    // Apply theme class to root element
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);

    // Update state
    setResolvedTheme(newResolvedTheme);

    // Save to localStorage
    saveTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      setResolvedTheme(newTheme);
    };

    // Add listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    theme,
    setTheme: setThemeState,
    resolvedTheme,
    toggleTheme,
  };
}
```

### 4.2 Theme Provider

**File**: `src/app/providers/theme-provider.tsx` (NEW)

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import type { ThemeContextValue } from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component
 *
 * Wraps the application to provide theme context to all components.
 *
 * @example
 ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeContext = useTheme();

  return (
    <ThemeContext.Provider value={themeContext}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * Must be used within a ThemeProvider.
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 ```tsx
 * const { theme, setTheme, resolvedTheme, toggleTheme } = useThemeContext();
 * ```
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
}
```

### 4.3 Theme Toggle Component

**File**: `src/components/ui/theme-toggle.tsx` (NEW)

```typescript
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeContext } from '@/app/providers/theme-provider';
import type { ThemeMode } from '@/types/theme';
import { Button } from './button'; // Assuming button is at this path

/**
 * Theme toggle button
 *
 * Provides a compact button to switch between light, dark, and system themes.
 *
 * @example
 ```tsx
 * <ThemeToggle variant="icon-only" />
 * <ThemeToggle variant="dropdown" />
 * ```
 */
export function ThemeToggle({ variant = 'button' }: { variant?: 'button' | 'icon-only' }) {
  const { theme, setTheme, resolvedTheme } = useThemeContext();

  const getIcon = () => {
    if (theme === 'system') {
      return resolvedTheme === 'light' ? <Monitor className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
    }
    return resolvedTheme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  const getNextTheme = (): ThemeMode => {
    const cycle: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = cycle.indexOf(theme);
    return cycle[(currentIndex + 1) % cycle.length];
  };

  const handleClick = () => {
    const nextTheme = getNextTheme();
    setTheme(nextTheme);
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label={`Toggle theme (current: ${theme})`}
      >
        {getIcon()}
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={handleClick}>
      {getIcon()}
      <span className="ml-2 hidden sm:inline">
        {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
      </span>
    </Button>
  );
}
```

---

## 5. Component Migration Guidelines

### 5.1 Migration Principles

**No Breaking Changes**:
- All existing components MUST continue working with dark theme
- Light theme is an enhancement, not a replacement
- Use CSS custom properties for theme-specific styles
- never hardcode colors in components (use variables)

**Component Update Checklist**:
1. ✅ Use CSS custom properties for all colors (no hardcoded values)
2. ✅ Ensure all interactive states have light theme variants
3. ✅ Verify contrast ratios in both themes (4.5:1 minimum)
4. ✅ Test theme switching with component in different states
5. ✅ Update component props if needed for theme-specific behavior

### 5.2 Component Migration Example: Button

**Existing Button Component** (assuming with some hardcoded values):

```typescript
// BEFORE: Hardcoded colors (BAD)
export function Button({ children, ...props }) {
  return (
    <button
      className="bg-[#f97316] text-white hover:bg-[#ea580c]" // Hardcoded
      {...props}
    >
      {children}
    </button>
  );
}
```

**Migrated Button Component**:

```typescript
// AFTER: CSS custom properties (GOOD)
import { forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Utility function for className merging

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-600",
      secondary: "bg-secondary text-secondary-foreground hover:bg-neutral-200 border border-neutral-300",
      ghost: "hover:bg-neutral-100 text-foreground",
      outline: "border-2 border-primary text-primary hover:bg-primary-50",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 5.3 Component Update Priority

**Phase 1 (P0 - Critical)**:
- Button
- Input
- Select
- Checkbox/Radio
- Toggle/Switch

**Phase 2 (P1 - Important)**:
- Badge
- Card
- Dialog
- Toast
- Tabs

**Phase 3 (P2 - Polish)**:
- Avatar
- Tooltip
- Dropdown Menu
- Table (if exists)
- Progress/Spinner

---

## 6. Implementation Roadmap

### 6.1 Week 1: Foundation Setup

**Stories**:
- [ ] **STORY-1**: Create light theme token file (`light-theme-tokens.css`)
- [ ] **STORY-2**: Update `design-tokens.css` with transition styles
- [ ] **STORY-3**: Update Tailwind config for class-based themes
- [ ] **STORY-4**: Create TypeScript theme types
- [ ] **STORY-5**: Implement `useTheme` hook
- [ ] **STORY-6**: Create `ThemeProvider` component
- [ ] **STORY-7**: Create `ThemeToggle` component

**Acceptance Criteria**:
- All CSS tokens defined with correct color values
- Theme hook provides correct theme state
- Theme persists to localStorage
- System preference detection working

### 6.2 Week 2: Component Migration (P0)

**Stories**:
- [ ] **STORY-8**: Migrate Button component
- [ ] **STORY-9**: Migrate Input component
- [ ] **STORY-10**: Migrate Select component
- [ ] **STORY-11**: Migrate Checkbox/Radio components
- [ ] **STORY-12**: Migrate Toggle/Switch component
- [ ] **STORY-13**: Test all P0 components in both themes

**Acceptance Criteria**:
- All P0 components use CSS custom properties
- All interactive states have light theme variants
- Zero breaking changes to dark theme
- Contrast ratios validated (≥4.5:1)

### 6.3 Week 3: Component Migration (P1)

**Stories**:
- [ ] **STORY-14**: Migrate Badge component
- [ ] **STORY-15**: Migrate Card component
- [ ] **STORY-16**: Migrate Dialog component
- [ ] **STORY-17**: Migrate Toast component
- [ ] **STORY-18**: Migrate Tabs component

**Acceptance Criteria**:
- All P1 components migrated
- Theme switching smooth (no FOUC)
- Reduced motion respected

### 6.4 Week 4: Workspace-Specific Components

**Stories**:
- [ ] **STORY-19**: Update IDE workspace components
- [ ] **STORY-20**: Update Knowledge workspace components
- [ ] **STORY-21**: Update Study workspace components
- [ ] **STORY-22**: Update Notes workspace components
- [ ] **STORY-23**: Integration testing across all workspaces

**Acceptance Criteria**:
- All workspace components support light theme
- No layout breaks during theme switch
- Monaco Editor theme switching working
- Terminal theme switching working

---

## Document End - Part 1/2

*This document concludes Part 1 of the Developer Handoff Specifications. Part 2 contains QA Validation Checklist and additional implementation considerations.*

---

## Next Section Preview (Part 2)

**Remaining Topics**:
- QA Validation Checklist
- Browser Compatibility Strategy
- Performance Optimization Guidelines
- Common Issues and Solutions
- Rollback Plan

**Continue to Part 2** for testing procedures and additional implementation guidance.