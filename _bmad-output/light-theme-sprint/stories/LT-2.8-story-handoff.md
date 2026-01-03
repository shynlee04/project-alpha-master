# LT-2.8 Story Execution Handoff Document

## Story Metadata
| Field | Value |
|-------|-------|
| **Story ID** | LT-2.8 |
| **Title** | Migrate Button Component |
| **Priority** | P0 |
| **Estimated Hours** | 4 |
| **Dependencies** | LT-1.7 (complete) |
| **Status** | Ready for execution |
| **Assignee** | light-theme-dev-agent |

## Objective
Update the Button component (`src/presentation/components/ui/button.tsx`) to use CSS custom properties for all color values, ensuring proper light/dark theme support while maintaining the 8-bit aesthetic.

## Component Location
- **File**: `src/presentation/components/ui/button.tsx`
- **Current Size**: ~170 lines
- **Technology**: React + CVA + Tailwind CSS

## Current Implementation Analysis

### Existing Variants
The component currently uses 5 variants with Tailwind utility classes:
```typescript
variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
```

### Current CVA Definition (Lines 43-72)
```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms] shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
        secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 active:bg-secondary/70 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        ghost: 'text-foreground hover:bg-accent active:bg-accent/80 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        destructive: 'bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
      },
      // ... sizes
    }
  }
)
```

## Light Theme Specifications

### Required CSS Custom Property Mapping

#### Primary Variant
| State | Background | Foreground | Shadow | Notes |
|-------|------------|------------|--------|-------|
| Default | `--primary` | `--primary-foreground` | None | Orange (#f97316) on white |
| Hover | `--primary-600` | `--primary-foreground` | `0 4px 12px rgba(249, 115, 22, 0.25)` | Darker orange |
| Active | `--primary-700` | `--primary-foreground` | `0 2px 6px rgba(249, 115, 22, 0.3)` | Even darker orange |
| Disabled | `--neutral-200` | `--neutral-400` | None | Gray on gray |

#### Secondary Variant
| State | Background | Foreground | Border | Shadow | Notes |
|-------|------------|------------|--------|--------|-------|
| Default | `--secondary` | `--secondary-foreground` | `--border` | None | Light gray |
| Hover | `--neutral-200` | `--secondary-foreground` | `--border` | `0 2px 4px rgba(0, 0, 0, 0.05)` | Slightly darker |
| Active | `--neutral-300` | `--secondary-foreground` | `--border` | None | Darker gray |
| Disabled | Transparent | `--neutral-300` | `--border` | None | Transparent |

#### Outline Variant
| State | Background | Foreground | Border | Shadow | Notes |
|-------|------------|------------|--------|--------|-------|
| Default | Transparent | `--foreground` | 1.5px `--primary` | None | Orange border |
| Hover | `--primary-50` | `--primary` | 1.5px `--primary` | None | Light orange bg |
| Active | `--primary-100` | `--primary-600` | 1.5px `--primary` | None | More orange bg |
| Disabled | Transparent | `--neutral-300` | 1.5px `--neutral-300` | None | Gray border |

#### Ghost Variant
| State | Background | Foreground | Shadow | Notes |
|-------|------------|------------|--------|-------|
| Default | Transparent | `--foreground` | None | Inherit color |
| Hover | `--neutral-100` | `--foreground` | None | Light gray bg |
| Active | `--neutral-200` | `--foreground` | None | Darker gray bg |
| Disabled | Transparent | `--neutral-300` | None | Gray text |

#### Destructive Variant
| State | Background | Foreground | Shadow | Notes |
|-------|------------|------------|--------|-------|
| Default | `--destructive` | White | None | Red (#ef4444) |
| Hover | `--destructive-600` | White | `0 4px 12px rgba(239, 68, 68, 0.25)` | Darker red |
| Active | `--destructive-700` | White | `0 2px 6px rgba(239, 68, 68, 0.3)` | Even darker red |
| Disabled | `--neutral-200` | `--neutral-400` | None | Gray |

### Sizing Specifications
| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| SM | 32px | `--spacing-2` (8px) | 12px | 16px |
| MD (default) | 40px | `--spacing-4` (16px) | 14px | 18px |
| LG | 44px | `--spacing-4` (16px) | 16px | 20px |
| XL | 48px | `--spacing-5` (20px) | 18px | 24px |

### Border Radius
- **All variants**: 4px (squared corners for 8-bit aesthetic)

### Accessibility Requirements
- Minimum touch target: 44×44px
- Focus indicator: 2px solid `--primary` with offset 2px
- Focus ring: `--ring` with 50% opacity
- `aria-label` for icon-only buttons

### Animation Specifications
- Hover transition: 150ms ease-out
- Active scale: 0.98 (4ms)
- Loading spinner: 1s linear infinite rotation

## Implementation Approach

### Option A: CSS Variables in CVA (Recommended)
Update the CVA variants to use CSS variables inline:

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        primary: `
          bg-[var(--primary)] text-[var(--primary-foreground)]
          hover:bg-[var(--primary-600)]
          active:bg-[var(--primary-700)]
          shadow-[0_4px_12px_rgba(249,115,22,0.25)]
        `,
        secondary: `
          bg-[var(--secondary)] text-[var(--secondary-foreground)]
          border border-[var(--border)]
          hover:bg-[var(--neutral-200)]
          active:bg-[var(--neutral-300)]
        `,
        // ... other variants
      },
    }
  }
)
```

### Option B: CSS Module Classes (Alternative)
Create separate CSS classes and map them in CVA:

```css
/* button.css */
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}

.btn-primary:hover {
  background: var(--primary-600);
}
```

### Option C: Tailwind Arbitrary Values (Simplest)
Use Tailwind arbitrary values with CSS variables:

```typescript
variant: {
  primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-600)]',
}
```

**Recommendation**: Use Option A (CSS variables in CVA) as it maintains the existing structure while enabling theme switching.

## Files to Modify

### Primary File
| File | Modification Type |
|------|------------------|
| `src/presentation/components/ui/button.tsx` | Update CVA variants to use CSS variables |

### Related Files (Read Only - Do Not Modify)
| File | Purpose |
|------|---------|
| `src/styles/light-theme-tokens.css` | Verify light theme tokens exist |
| `src/styles/design-tokens.css` | Verify dark theme tokens exist |
| `src/lib/utils.ts` | Verify `cn` utility works |

## Testing Requirements

### Visual Testing
- [ ] Verify all 5 variants in light theme
- [ ] Verify all 5 variants in dark theme
- [ ] Verify all 4 sizes (SM, MD, LG, XL)
- [ ] Verify hover states for all variants
- [ ] Verify active/pressed states for all variants
- [ ] Verify disabled states for all variants
- [ ] Verify loading spinner animation
- [ ] Verify focus ring visibility

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Focus indicator visibility
- [ ] Screen reader announcements for icon-only buttons
- [ ] Contrast ratios (WCAG AA)

### Cross-Browser Testing
- [ ] Chrome/Edge (WebKit)
- [ ] Firefox
- [ ] Safari

## Success Criteria
1. Button component renders correctly in light theme
2. Button component renders correctly in dark theme (no regression)
3. All variant states (default, hover, active, disabled, loading) work
4. CSS custom properties are used for all color values
5. No breaking changes to existing dark theme functionality
6. Accessibility requirements met (WCAG 2.1 AA)
7. Animation specifications followed (150ms transitions)

## Design Reference Documents
- **Component Specifications**: `_bmad-output/light-theme-design-system/light-theme-component-specifications-part1-2026-01-03.md` (Section 2.1)
- **Developer Handoff**: `_bmad-output/light-theme-design-system/light-theme-developer-handoff-part1-2026-01-03.md`

## Implementation Notes
- The component uses `rounded-none` in the current 8-bit design, but light theme specs call for 4px border radius. **Keep existing `rounded-none` for consistency with 8-bit aesthetic.**
- The existing shadow `shadow-[2px_2px_0px_rgba(0,0,0,0.5)]` is for the 8-bit pixel effect. For light theme, use the specifications in the component doc.
- The component already uses design tokens (`--primary`, `--secondary`, etc.) through Tailwind. The migration is about ensuring these map correctly to CSS custom properties.

## Execution Checklist
- [ ] Read current Button component implementation
- [ ] Review light theme specifications
- [ ] Update CVA variants with CSS variables
- [ ] Test in light theme
- [ ] Test in dark theme (verify no regression)
- [ ] Verify accessibility
- [ ] Document any issues or deviations
- [ ] Mark story complete in sprint-status.yaml

---

## Handoff Metadata
| Field | Value |
|-------|-------|
| **Created At** | 2026-01-04T00:00:00Z |
| **Created By** | light-theme-sm-agent |
| **Document Version** | 1.0 |
| **Phase** | Week 2: P0 Components |
| **Preceding Stories** | LT-1.1 through LT-1.7 (all complete) |
| **Following Stories** | LT-2.9 (Input), LT-2.10 (Select), LT-2.11 (Checkbox/Radio), LT-2.12 (Switch), LT-2.13 (Testing) |
