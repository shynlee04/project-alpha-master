---
document_id: STD-FRONTEND-CSS-2025-12-27
title: CSS and Styling Standards
version: 1.0.0
last_updated: 2025-12-27T13:35:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: ACTIVE
---

# CSS and Styling Standards

## Overview

This document defines CSS and styling standards for the Via-gent project to ensure consistent, maintainable, and performant styling across the application.

**Project Context**: Via-gent uses Tailwind CSS for styling with a dark-themed 8-bit design aesthetic. The project uses class-variance-authority (CVA) for variant management and clsx/tailwind-merge for conditional class composition.

## Tailwind CSS Configuration

### Configuration File

Tailwind is configured in [`tailwind.config.ts`](../../tailwind.config.ts):

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... more color tokens
      },
    },
  },
  plugins: [],
};

export default config;
```

Reference: [`tailwind.config.ts`](../../tailwind.config.ts)

### CSS Variables

Use CSS custom properties for theming:

```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... more dark mode variables */
}
```

Reference: [`src/index.css`](../../src/index.css)

## Utility Classes

### Class Composition

Use `clsx` and `tailwind-merge` for conditional class composition:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  className
)}>
  Click me
</button>
```

Reference: [`src/lib/utils.ts`](../../src/lib/utils.ts)

### Class Variants

Use class-variance-authority (CVA) for component variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

Reference: [`src/components/ui/button.tsx`](../../src/components/ui/button.tsx)

## Styling Patterns

### Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4">Item 1</div>
  <div className="p-4">Item 2</div>
  <div className="p-4">Item 3</div>
</div>
```

### Dark Mode

Use the `dark:` prefix for dark mode styles:

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### Hover and Focus States

Use hover and focus modifiers:

```typescript
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none">
  Button
</button>
```

### Transitions

Use Tailwind's transition utilities:

```typescript
<div className="transition-all duration-300 ease-in-out hover:scale-105">
  Animated element
</div>
```

## Component Styling

### Layout Components

Use flexbox and grid for layouts:

```typescript
// Flexbox
<div className="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Grid
<div className="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Reference: [`src/components/layout/IDELayout.tsx`](../../src/components/layout/IDELayout.tsx)

### Panel Components

Use consistent panel styling:

```typescript
export const Panel = ({ title, children }: PanelProps) => (
  <div className="border border-border rounded-lg bg-card text-card-foreground shadow-sm">
    <div className="flex flex-col space-y-1.5 p-6">
      <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
    </div>
    <div className="p-6 pt-0">{children}</div>
  </div>
);
```

### Status Indicators

Use consistent status indicator styling:

```typescript
export const StatusDot = ({ status }: { status: 'success' | 'error' | 'warning' }) => (
  <span
    className={cn(
      'inline-block w-2 h-2 rounded-full',
      status === 'success' && 'bg-green-500',
      status === 'error' && 'bg-red-500',
      status === 'warning' && 'bg-yellow-500'
    )}
  />
);
```

Reference: [`src/components/ui/status-dot.tsx`](../../src/components/ui/status-dot.tsx)

## Animation

### Tailwind Animations

Use Tailwind's built-in animations:

```typescript
<div className="animate-spin">Loading...</div>
<div className="animate-pulse">Pulse effect</div>
<div className="animate-bounce">Bounce effect</div>
```

### Custom Animations

Add custom animations in tailwind.config.ts:

```typescript
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
}
```

## Performance

### Avoid Inline Styles

Prefer Tailwind classes over inline styles:

```typescript
// ❌ Bad
<div style={{ padding: '1rem', margin: '0.5rem' }}>

// ✅ Good
<div className="p-4 m-2">
```

### Use PurgeCSS

Tailwind automatically purges unused styles in production:

```typescript
// tailwind.config.ts
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
],
```

### Optimize Animations

Use `transform` and `opacity` for animations (GPU-accelerated):

```typescript
// ✅ Good - GPU-accelerated
<div className="transition-transform hover:scale-105">

// ❌ Bad - CPU-intensive
<div className="transition-all hover:width-200">
```

## Accessibility

### Focus Styles

Ensure visible focus styles:

```typescript
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Button
</button>
```

### Color Contrast

Ensure sufficient color contrast (WCAG AA):

```typescript
// ✅ Good - high contrast
<div className="bg-gray-900 text-white">

// ❌ Bad - low contrast
<div className="bg-gray-900 text-gray-400">
```

### Reduced Motion

Respect user's motion preferences:

```typescript
<div className="transition-transform duration-300 motion-reduce:transition-none">
  Animated element
</div>
```

## 8-bit Design System

### Pixel-Perfect Styling

The project uses an 8-bit design aesthetic with pixel-perfect styling:

```typescript
// Pixel border effect
<div className="border-2 border-border shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
  Pixel card
</div>

// Pixel font
<div className="font-mono text-sm">
  Mono text
</div>
```

### Color Palette

Use the 8-bit color palette:

```typescript
// Primary colors
<div className="bg-[#3b82f6] text-white">Primary</div>
<div className="bg-[#10b981] text-white">Success</div>
<div className="bg-[#ef4444] text-white">Error</div>
<div className="bg-[#f59e0b] text-white">Warning</div>
```

## Best Practices

### 1. Use Semantic HTML

Combine Tailwind with semantic HTML:

```typescript
<nav className="flex items-center justify-between p-4 border-b">
  <a href="/" className="font-bold">Logo</a>
  <ul className="flex gap-4">
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### 2. Extract Reusable Patterns

Create reusable components for common patterns:

```typescript
// Card component
export const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
    {children}
  </div>
);

// Usage
<Card className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### 3. Use Arbitrary Values Sparingly

Prefer Tailwind's built-in values over arbitrary values:

```typescript
// ❌ Bad - arbitrary value
<div className="w-[327px]">

// ✅ Good - built-in value
<div className="w-80">
```

### 4. Group Related Classes

Group related classes together:

```typescript
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  hover:bg-gray-50 dark:hover:bg-gray-800
  transition-colors
">
  Content
</div>
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **CVA**: [https://cva.style/](https://cva.style/)
- **clsx**: [https://github.com/lukeed/clsx](https://github.com/lukeed/clsx)
- **tailwind-merge**: [https://github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)

### Implementation Files

- [`tailwind.config.ts`](../../tailwind.config.ts) - Tailwind configuration
- [`src/index.css`](../../src/index.css) - Global CSS and variables
- [`src/lib/utils.ts`](../../src/lib/utils.ts) - Utility functions
- [`src/components/ui/`](../../src/components/ui/) - UI components

---

**Document Status**: Active
**Last Updated**: 2025-12-27T13:35:00Z
**Next Review**: 2026-01-27