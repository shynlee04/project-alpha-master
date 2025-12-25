# Input Component Design Specification

**Version**: 1.0.0  
**Date**: 2025-12-25  
**Status**: Design Complete  
**Component**: Input/TextField  
**Design System**: [`_bmad-output/design-system-8bit-2025-12-25.md`](_bmad-output/design-system-8bit-2025-12-25.md)

---

## 1. Component Overview

Production-ready text input component following Via-gent 8-bit design system. Supports multiple sizes, variants, and states with full accessibility compliance.

**Key Features:**
- Pixel-perfect 8-bit aesthetic (sharp edges, no blur)
- Dark-first theme with high contrast (WCAG AA)
- CVA variants for composable styling
- Left/right icon slots
- Error/success states with visual feedback
- Full i18n support (EN/VI)
- Touch-friendly targets (48px minimum)

---

## 2. Props Interface

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input variant for visual state */
  variant?: 'default' | 'error' | 'success'
  
  /** Input size for responsive scaling */
  size?: 'sm' | 'md' | 'lg'
  
  /** Full width container */
  fullWidth?: boolean
  
  /** Icon on left side of input */
  leftIcon?: React.ReactNode
  
  /** Icon on right side of input */
  rightIcon?: React.ReactNode
  
  /** Error message (triggers error variant) */
  error?: string
  
  /** Helper text below input */
  helperText?: string
  
  /** Label above input */
  label?: string
  
  /** Required field indicator */
  required?: boolean
}
```

---

## 3. CVA Variants

### 3.1 Size Variants

| Size | Height | Padding | Font Size | Touch Target |
|------|--------|----------|------------|--------------|
| sm   | 32px   | 8px 12px | 14px (text-sm) | 48px+ (with label) |
| md   | 40px   | 12px 16px | 16px (text-base) | 48px+ (default) |
| lg   | 48px   | 16px 20px | 18px (text-lg) | 48px+ (minimum) |

```typescript
const sizeVariants = cva('', {
  variants: {
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
    },
  },
})
```

### 3.2 Variant (State) Styling

**Design Token References:**
- Colors: [`design-system-8bit-2025-12-25.md#21-color-palette`](_bmad-output/design-system-8bit-2025-12-25.md#21-color-palette)
- Spacing: [`design-system-8bit-2025-12-25.md#23-spacing`](_bmad-output/design-system-8bit-2025-12-25.md#23-spacing)
- Border Radius: [`design-system-8bit-2025-12-25.md#24-border-radius`](_bmad-output/design-system-8bit-2025-12-25.md#24-border-radius)

```typescript
const variantStyles = cva('', {
  variants: {
    variant: {
      default: 'border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50',
      error: 'border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/50',
      success: 'border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/50',
    },
    disabled: {
      true: 'border-neutral-800 bg-neutral-900 cursor-not-allowed opacity-50',
      false: '',
    },
  },
})
```

### 3.3 Base Styles

```typescript
const baseStyles = cva(
  'w-full flex items-center border transition-all duration-150 ease-in-out outline-none',
  {
    variants: {
      theme: {
        dark: 'bg-neutral-950 text-neutral-100 placeholder:text-neutral-500',
        light: 'bg-white text-neutral-900 placeholder:text-neutral-400',
      },
      radius: {
        none: 'rounded-none',      // 8-bit style
        sm: 'rounded-sm',          // 2px
        base: 'rounded-base',      // 4px (default)
        md: 'rounded-md',          // 8px
      },
    },
    defaultVariants: {
      theme: 'dark',
      radius: 'base',
    },
  }
)
```

---

## 4. Accessibility Requirements

### 4.1 ARIA Attributes

```typescript
// Error state
<input
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
/>

// Error message
<div id={`${id}-error`} role="alert" aria-live="polite">
  {error}
</div>

// Helper text
<div id={`${id}-helper`}>
  {helperText}
</div>
```

### 4.2 Keyboard Navigation

- `Tab`: Focus input
- `Shift+Tab`: Focus previous element
- `Enter`: Submit (if in form)
- `Escape`: Blur input (optional)

### 4.3 Focus Indicators

- Visible ring: `ring-2` with variant color
- Transition: `duration-150 ease-in-out`
- Offset: `ring-offset-2` on dark theme

### 4.4 Color Contrast

All combinations meet WCAG AA (4.5:1 minimum):

| State | Background | Foreground | Contrast |
|-------|------------|-------------|-----------|
| Default | neutral-950 | neutral-100 | 16.2:1 |
| Error | neutral-950 | error-500 | 6.8:1 |
| Success | neutral-950 | success-500 | 7.1:1 |

### 4.5 Touch Targets

- Minimum: 48x48px (WCAG 2.5.5)
- Input height: 32-48px
- With label: Combined height ≥ 48px
- Padding: 12px minimum (spacing-3)

---

## 5. Responsive Behavior

### 5.1 Size Breakpoints

| Breakpoint | Default Size | Rationale |
|------------|--------------|------------|
| Mobile (< 640px) | sm | Compact, touch-optimized |
| Tablet (640-1024px) | md | Balanced size |
| Desktop (> 1024px) | md | Standard IDE size |
| Large Desktop (> 1280px) | lg | Enhanced readability |

### 5.2 Implementation

```typescript
const responsiveSize = useBreakpointValue({
  base: 'sm',
  md: 'md',
  lg: 'md',
  xl: 'lg',
})
```

### 5.3 Full Width Behavior

```typescript
const fullWidthStyles = cva('', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: 'w-auto',
    },
  },
})
```

---

## 6. Animation Specifications

### 6.1 Focus Animation

```css
@keyframes focus-ring {
  0% { ring-opacity: 0; }
  100% { ring-opacity: 0.5; }
}

.input:focus {
  animation: focus-ring 150ms ease-in-out;
  ring-2 ring-primary-500/50;
}
```

**Duration**: 150ms ([`duration-fast`](_bmad-output/design-system-8bit-2025-12-25.md#261-duration-scale))  
**Easing**: ease-in-out ([`ease-in-out`](_bmad-output/design-system-8bit-2025-12-25.md#262-easing-functions))

### 6.2 Error Shake Animation

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.input-error {
  animation: shake 300ms ease-in-out;
}
```

**Duration**: 300ms  
**Easing**: ease-in-out  
**Trigger**: On error prop change

### 6.3 Success Checkmark Animation

```css
@keyframes checkmark {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.success-icon {
  animation: checkmark 200ms ease-out;
}
```

**Duration**: 200ms  
**Easing**: ease-out  
**Trigger**: On success variant

---

## 7. i18n Support

### 7.1 Translation Keys

```json
// src/i18n/en.json
{
  "input": {
    "default": "Enter text",
    "error": "This field has an error",
    "required": "This field is required",
    "placeholder": "Type here..."
  }
}

// src/i18n/vi.json
{
  "input": {
    "default": "Nhập văn bản",
    "error": "Trường này có lỗi",
    "required": "Trường này là bắt buộc",
    "placeholder": "Nhập tại đây..."
  }
}
```

### 7.2 Usage Pattern

```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()

<Input
  placeholder={t('input.placeholder')}
  error={error ? t('input.error') : undefined}
  required={required}
  label={t('input.default')}
/>
```

### 7.3 Label Association

```typescript
<label htmlFor={id}>
  {label}
  {required && <span aria-hidden="true">*</span>}
</label>
<input id={id} aria-required={required} />
```

---

## 8. Implementation Notes

### 8.1 Component Structure

```typescript
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// CVA variants defined above

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default',
    size = 'md',
    fullWidth = true,
    leftIcon,
    rightIcon,
    error,
    helperText,
    label,
    required,
    className,
    ...props 
  }, ref) => {
    const inputId = React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-300"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles({ theme: 'dark', radius: 'base' }),
              sizeVariants({ size }),
              variantStyles({ variant, disabled: props.disabled }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            aria-required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 text-neutral-500 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="text-xs text-error-500" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="text-xs text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, type InputProps }
```

### 8.2 Anti-Pattern Prevention

| Anti-Pattern | Prevention |
|--------------|-------------|
| Hard-coded colors | Use design tokens (`--color-*`) |
| Magic numbers | Use spacing scale (`spacing-*`) |
| Inline styles | Use Tailwind classes |
| Duplicate code | Use CVA variants |
| Missing accessibility | ARIA attributes required |
| No i18n | Use `t()` hook for all text |

### 8.3 Design Token Mapping

| Prop | Token Reference |
|------|-----------------|
| Border color | `--color-neutral-700` (default), `--color-error-500` (error) |
| Background | `--color-neutral-950` (dark), `--color-white` (light) |
| Text color | `--color-neutral-100` (dark), `--color-neutral-900` (light) |
| Focus ring | `--color-primary-500` |
| Spacing | `--spacing-3` (12px), `--spacing-4` (16px) |
| Border radius | `--radius-base` (4px) |
| Transition | `--duration-fast` (150ms), `--ease-in-out` |

### 8.4 Dependencies

- `@radix-ui/react-slot` - Slot primitive for composition
- `class-variance-authority` - Variant management
- `clsx` + `tailwind-merge` - Class merging (`cn` utility)
- `react-i18next` - Internationalization

### 8.5 Testing Checklist

- [ ] Renders with all size variants (sm, md, lg)
- [ ] Renders with all variant states (default, error, success)
- [ ] Focus ring appears on keyboard navigation
- [ ] ARIA attributes present for error states
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Touch targets ≥ 48x48px
- [ ] i18n translations work for EN/VI
- [ ] Animations are smooth (60fps)
- [ ] Disabled state is visually clear
- [ ] Label association works with screen readers

---

## 9. Related Components

- **Label**: [`@radix-ui/react-label`](https://www.radix-ui.com/primitives/docs/components/label)
- **Select**: Form select with dropdown
- **Textarea**: Multi-line input
- **Button**: Submit/cancel actions

---

**Next Steps**: Handoff to Dev mode for implementation.
