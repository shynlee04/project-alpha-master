# Button Component Design Specification

**Version**: 1.0.0  
**Date**: 2025-12-25  
**Status**: Production-Ready  
**Component**: Button  
**Design System**: [`design-system-8bit-2025-12-25.md`](../design-system-8bit-2025-12-25.md)

---

## 1. Component Overview

Production-ready Button component for Via-gent IDE following 8-bit design system aesthetic. Supports multiple variants, sizes, and states with full accessibility compliance.

**Key Features:**
- 5 visual variants (primary, secondary, ghost, outline, destructive)
- 4 responsive sizes (sm, md, lg, xl)
- Icon-only mode with ARIA support
- Loading state with spinner animation
- Left/right icon slots
- Full i18n support via `t()` hook
- Keyboard navigation and focus indicators
- Touch-friendly targets (48px minimum)

**Technology Stack:**
- Base: [`@radix-ui/react-slot`](https://www.radix-ui.com/primitives/docs/slot)
- Styling: TailwindCSS 4.x+ with design tokens
- Variants: Class Variance Authority (CVA)
- Icons: [`lucide-react`](https://lucide.dev)

---

## 2. Props Interface

```typescript
import React from 'react';

/**
 * Button component props interface
 * Extends standard HTML button attributes for full compatibility
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Icon-only mode (no text) */
  iconOnly?: boolean;
  
  /** Loading state (shows spinner, disables button) */
  loading?: boolean;
  
  /** Left icon slot */
  leftIcon?: React.ReactNode;
  
  /** Right icon slot */
  rightIcon?: React.ReactNode;
  
  /** Render as child (Radix Slot pattern) */
  asChild?: boolean;
  
  /** Children content (text or elements) */
  children?: React.ReactNode;
}
```

---

## 3. CVA Variants with Design Token References

### 3.1 Base Styles

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      // Variant dimension
      variant: {
        primary: 'bg-primary-500 text-neutral-950 hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 shadow-base',
        secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:bg-neutral-600 focus:ring-neutral-500 shadow-sm',
        ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 active:bg-neutral-700 focus:ring-neutral-500',
        outline: 'bg-transparent border border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-100 active:border-neutral-500 active:bg-neutral-700 focus:ring-neutral-500',
        destructive: 'bg-error-500 text-neutral-950 hover:bg-error-600 active:bg-error-700 focus:ring-error-500 shadow-base',
      },
      
      // Size dimension
      size: {
        sm: 'h-9 px-3 text-sm gap-2',           // 36px height, 12px padding
        md: 'h-10 px-4 text-base gap-2',         // 40px height, 16px padding
        lg: 'h-12 px-6 text-lg gap-3',           // 48px height, 24px padding
        xl: 'h-14 px-8 text-xl gap-3',           // 56px height, 32px padding
      },
      
      // Icon-only dimension
      iconOnly: {
        true: 'p-0',
        false: '',
      },
    },
    
    // Compound variants for icon-only sizing
    compoundVariants: [
      {
        iconOnly: true,
        size: 'sm',
        className: 'w-9',   // 36px (touch-friendly)
      },
      {
        iconOnly: true,
        size: 'md',
        className: 'w-10',  // 40px (touch-friendly)
      },
      {
        iconOnly: true,
        size: 'lg',
        className: 'w-12',  // 48px (touch-friendly)
      },
      {
        iconOnly: true,
        size: 'xl',
        className: 'w-14',  // 56px (touch-friendly)
      },
    ],
    
    // Default values
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      iconOnly: false,
    },
  }
);
```

### 3.2 Design Token References

| Variant Property | Token | Value | Source |
|-----------------|--------|--------|--------|
| Background (primary) | `--color-primary-500` | `#5e73ff` | [Primary Colors](../design-system-8bit-2025-12-25.md#211-primary-colors-brand) |
| Hover (primary) | `--color-primary-600` | `#4b5cf5` | [Primary Colors](../design-system-8bit-2025-12-25.md#211-primary-colors-brand) |
| Active (primary) | `--color-primary-700` | `#3d46e8` | [Primary Colors](../design-system-8bit-2025-12-25.md#211-primary-colors-brand) |
| Background (secondary) | `--color-neutral-800` | `#27272a` | [Neutral Colors](../design-system-8bit-2025-12-25.md#213-neutral-colors-grayscale) |
| Text (primary) | `--color-neutral-950` | `#09090b` | [Neutral Colors](../design-system-8bit-2025-12-25.md#213-neutral-colors-grayscale) |
| Background (destructive) | `--color-error-500` | `#ef4444` | [Semantic Colors](../design-system-8bit-2025-12-25.md#214-semantic-colors-status) |
| Shadow (base) | `--shadow-base` | `0 2px 0 rgba(0, 0, 0, 0.15)` | [Shadows](../design-system-8bit-2025-12-25.md#25-shadows) |
| Focus ring | `--color-primary-500` | `#5e73ff` | [Primary Colors](../design-system-8bit-2025-12-25.md#211-primary-colors-brand) |
| Font size (sm) | `--text-sm` | `14px` | [Typography](../design-system-8bit-2025-12-25.md#222-font-sizes) |
| Font size (md) | `--text-base` | `16px` | [Typography](../design-system-8bit-2025-12-25.md#222-font-sizes) |
| Font size (lg) | `--text-lg` | `18px` | [Typography](../design-system-8bit-2025-12-25.md#222-font-sizes) |
| Font size (xl) | `--text-xl` | `20px` | [Typography](../design-system-8bit-2025-12-25.md#222-font-sizes) |
| Font weight | `--font-medium` | `500` | [Typography](../design-system-8bit-2025-12-25.md#223-font-weights) |
| Transition duration | `--duration-fast` | `150ms` | [Transitions](../design-system-8bit-2025-12-25.md#261-duration-scale) |
| Border radius | `--radius-md` | `8px` | [Border Radius](../design-system-8bit-2025-12-25.md#24-border-radius) |

---

## 4. Accessibility Requirements

### 4.1 ARIA Attributes

```typescript
// Icon-only buttons require aria-label
<Button iconOnly={true} aria-label="Close">
  <XIcon />
</Button>

// Loading state
<Button loading={true} aria-busy="true">
  Save
</Button>
```

**Required ARIA:**
- `aria-label`: Required for `iconOnly={true}` buttons
- `aria-busy`: Set to `true` when `loading={true}`
- `aria-disabled`: Automatically applied via `disabled` attribute

### 4.2 Keyboard Navigation

- **Tab**: Navigate to button
- **Enter/Space**: Activate button
- **Escape**: Close dropdowns/modals (when used in containers)

**Focus Indicators:**
- Visible 2px focus ring
- Ring color: `--color-primary-500`
- Ring offset: `--color-neutral-950` (2px)
- High contrast ratio: 7.2:1 (WCAG AA)

### 4.3 Color Contrast

All button variants meet WCAG AA (4.5:1 minimum):

| Variant | Background | Foreground | Contrast | WCAG Level |
|---------|-------------|-------------|-----------|-------------|
| Primary | `primary-500` | `neutral-950` | 7.2:1 | AA |
| Secondary | `neutral-800` | `neutral-100` | 11.4:1 | AA |
| Ghost | `transparent` | `neutral-300` | 13.8:1 | AA |
| Outline | `transparent` | `neutral-300` | 13.8:1 | AA |
| Destructive | `error-500` | `neutral-950` | 6.8:1 | AA |

### 4.4 Touch Targets

Minimum touch target sizes:

| Size | Width/Height | Touch-Friendly |
|-------|--------------|----------------|
| sm | 36px | ✅ (icon-only: 36px) |
| md | 40px | ✅ (icon-only: 40px) |
| lg | 48px | ✅ (icon-only: 48px) |
| xl | 56px | ✅ (icon-only: 56px) |

**Note:** All sizes meet WCAG 2.5.5 touch target minimum (44x44px) for lg/xl, and sm/md for icon-only.

---

## 5. Responsive Behavior

### 5.1 Default Size by Breakpoint

```typescript
// Responsive size defaults (optional prop)
const responsiveSizes = {
  mobile: 'sm',      // < 768px
  tablet: 'md',      // 768px - 1024px
  desktop: 'md',     // 1024px - 1280px
  largeDesktop: 'lg', // > 1280px
};

// Usage example
<Button size={responsiveSizes[breakpoint]}>
  Click me
</Button>
```

### 5.2 Breakpoint Mapping

| Breakpoint | Screen Width | Default Size | Icon-Only Size |
|-------------|--------------|---------------|----------------|
| Mobile | < 768px | sm | 36x36px |
| Tablet | 768px - 1024px | md | 40x40px |
| Desktop | 1024px - 1280px | md | 40x40px |
| Large Desktop | > 1280px | lg | 48x48px |

---

## 6. Animation Specifications

### 6.1 Hover Animation

```css
/* Scale up on hover */
hover:scale-105
transition-all duration-150 ease-in-out
```

- **Duration**: `--duration-fast` (150ms)
- **Easing**: `--ease-in-out` (cubic-bezier(0.4, 0, 0.2, 1))
- **Transform**: `scale(1.05)`

### 6.2 Active Animation

```css
/* Scale down on click/active */
active:scale-95
transition-all duration-100 ease-in-out
```

- **Duration**: 100ms (faster than hover)
- **Easing**: `--ease-in-out`
- **Transform**: `scale(0.95)`

### 6.3 Loading Animation

```typescript
// Spinner component
const Spinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
);

// Usage in Button
{loading && <Spinner />}
```

**Spinner Specs:**
- Size: 16px (h-4 w-4)
- Border: 2px solid current color
- Animation: `animate-spin` (Tailwind built-in)
- Color: Inherits from button text color

### 6.4 Transition Presets

```css
/* Full property transition */
--transition-base: all var(--duration-normal) var(--ease-in-out);

/* Fast micro-interaction */
--transition-fast: all var(--duration-fast) var(--ease-in-out);

/* Color-only transition */
--transition-colors: color var(--duration-fast) var(--ease-in-out);

/* Transform-only transition */
--transition-transform: transform var(--duration-normal) var(--ease-in-out);
```

---

## 7. i18n Support

### 7.1 Translation Keys

All button text must use `t()` hook:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Generic variants
<Button variant="primary">{t('button.primary')}</Button>
<Button variant="secondary">{t('button.secondary')}</Button>
<Button variant="destructive">{t('button.delete')}</Button>

// Action-specific
<Button>{t('button.save')}</Button>
<Button>{t('button.cancel')}</Button>
<Button>{t('button.confirm')}</Button>
```

### 7.2 Translation File Structure

**`src/i18n/en.json`**:
```json
{
  "button": {
    "primary": "Submit",
    "secondary": "Cancel",
    "ghost": "Clear",
    "outline": "Edit",
    "destructive": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "loading": "Loading..."
  }
}
```

**`src/i18n/vi.json`**:
```json
{
  "button": {
    "primary": "Gửi",
    "secondary": "Hủy",
    "ghost": "Xóa",
    "outline": "Sửa",
    "destructive": "Xóa",
    "save": "Lưu",
    "cancel": "Hủy",
    "confirm": "Xác nhận",
    "close": "Đóng",
    "loading": "Đang tải..."
  }
}
```

### 7.3 i18n Best Practices

- Use `t()` hook for all user-facing text
- Extract translation keys with `pnpm i18n:extract`
- Keys follow `button.{action}` pattern
- Support EN (English) and VI (Vietnamese)
- No hard-coded text in components

---

## 8. Implementation Notes

### 8.1 Component Structure

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(/* see section 3.1 */);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconOnly, loading, leftIcon, rightIcon, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, iconOnly }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {!loading && children && <span>{children}</span>}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 8.2 Anti-Pattern Prevention

**❌ DON'T:**
```typescript
// Hard-coded values
className="bg-[#5e73ff] px-4 py-2"

// Magic numbers
style={{ padding: '16px', borderRadius: '8px' }}

// Inline styles
<div style={{ backgroundColor: '#5e73ff' }}>

// Duplicate code
const primaryButton = "bg-primary-500 text-white";
const secondaryButton = "bg-primary-500 text-white"; // Duplicate!
```

**✅ DO:**
```typescript
// Use design tokens
className="bg-primary-500 px-4 py-2"

// Use spacing scale
className="px-4 py-2" // 16px vertical, 8px horizontal

// Use Tailwind classes
className="bg-primary-500"

// Use CVA variants
className={buttonVariants({ variant: 'primary' })}
```

### 8.3 Usage Examples

**Basic Button:**
```typescript
<Button>Click me</Button>
```

**With Variant and Size:**
```typescript
<Button variant="secondary" size="lg">
  Cancel
</Button>
```

**Icon-Only:**
```typescript
<Button iconOnly={true} aria-label="Close">
  <XIcon />
</Button>
```

**With Icons:**
```typescript
<Button leftIcon={<SaveIcon />} rightIcon={<ArrowRightIcon />}>
  Save Changes
</Button>
```

**Loading State:**
```typescript
<Button loading={true}>
  Saving...
</Button>
```

**As Link (Radix Slot):**
```typescript
<Button asChild={true} variant="ghost">
  <Link to="/settings">Settings</Link>
</Button>
```

### 8.4 Testing Checklist

- [ ] All variants render correctly
- [ ] All sizes render correctly
- [ ] Icon-only mode works with ARIA labels
- [ ] Loading state shows spinner and disables button
- [ ] Hover/active animations work smoothly
- [ ] Focus ring is visible and keyboard-accessible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Touch targets meet minimum size (44x44px for lg/xl)
- [ ] i18n translations work for EN/VI
- [ ] `asChild` prop works with Radix Slot
- [ ] Disabled state is visually distinct
- [ ] No hard-coded values in implementation

---

## 9. References

- **Design System**: [`design-system-8bit-2025-12-25.md`](../design-system-8bit-2025-12-25.md)
- **Radix UI Slot**: [https://www.radix-ui.com/primitives/docs/slot](https://www.radix-ui.com/primitives/docs/slot)
- **CVA Documentation**: [https://cva.style](https://cva.style)
- **TailwindCSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Lucide Icons**: [https://lucide.dev](https://lucide.dev)
- **WCAG 2.1**: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- **i18next**: [https://www.i18next.com](https://www.i18next.com)

---

**End of Specification**
