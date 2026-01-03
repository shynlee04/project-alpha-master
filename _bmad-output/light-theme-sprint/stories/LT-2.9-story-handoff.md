# LT-2.9 Story Execution Handoff Document

## Story Metadata
| Field | Value |
|-------|-------|
| **Story ID** | LT-2.9 |
| **Title** | Migrate Input Component |
| **Priority** | P0 |
| **Estimated Hours** | 3 |
| **Dependencies** | LT-1.7 (complete) |
| **Status** | Ready for execution |
| **Assignee** | light-theme-dev-agent |

## Objective

Update the Input component (`src/presentation/components/ui/input.tsx`) to use CSS custom properties for all color values, ensuring proper light/dark theme support while maintaining the 8-bit aesthetic and WCAG 2.1 AA accessibility compliance.

## Component Location

- **File**: `src/presentation/components/ui/input.tsx`
- **Current Size**: ~103 lines
- **Technology**: React + CVA + Tailwind CSS

## Current Implementation Analysis

### Existing Variants

The component currently uses:

```typescript
size: 'sm' | 'md' | 'lg'
state: 'default' | 'error' | 'success' | 'disabled'
```

### Current CVA Definition (Lines 32-54)

```typescript
const inputVariants = cva(
  "flex h-10 w-full items-center gap-2 rounded-none border-2 bg-neutral-950 text-neutral-100 px-3 py-2 text-sm transition-all outline-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-xs min-h-[32px]",
        md: "h-10 px-3 text-sm min-h-[40px]",
        lg: "h-12 px-4 text-base min-h-[48px]",
      },
      state: {
        default: "border-neutral-700 focus-visible:border-primary-500 focus-visible:ring-primary-500/50 hover:border-neutral-600",
        error: "border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/50 hover:border-error-600",
        success: "border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500/50 hover:border-success-600",
        disabled: "border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)
```

## Light Theme Specifications

### Required CSS Custom Property Mapping

#### Default State
| Property | Current (Hardcoded) | Target (CSS Variable) |
|----------|--------------------|-----------------------|
| Background | `bg-neutral-950` | `bg-[var(--background)]` |
| Foreground | `text-neutral-100` | `text-[var(--foreground)]` |
| Border | `border-2 border-neutral-700` | `border-[var(--border)]` |
| Placeholder | `placeholder:text-neutral-500` | `placeholder:text-[var(--muted-foreground)]` |
| Focus Ring | `focus-visible:ring-primary-500/50` | `focus-visible:ring-[var(--ring)]` |
| Focus Ring Offset | `focus-visible:ring-offset-neutral-950` | `focus-visible:ring-offset-[var(--background)]` |

#### State Variants
| State | Border Color | Focus Ring Color |
|-------|--------------|------------------|
| Default | `--input` → `--border` (hover) | `--ring` |
| Error | `--destructive` | `--destructive` |
| Success | `--success` | `--success` |
| Disabled | `--neutral-200` | None |

### Size Specifications
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| SM | 32px | 10px | 12px |
| MD (default) | 40px | 12px | 14px |
| LG | 48px | 16px | 16px |

### Animation Specifications
- Transition: 150ms ease-out for border color
- Focus ring: 150ms ease-out
- No transition on background (remains white)

## Implementation Approach

### Option A: CSS Variables in CVA (Recommended)

Update the CVA variants to use CSS variables inline:

```typescript
const inputVariants = cva(
  "flex h-10 w-full items-center gap-2 rounded-[4px] border bg-[var(--background)] text-[var(--foreground)] px-3 py-2 text-sm transition-[border-color] duration-150 outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-xs min-h-[32px]",
        md: "h-10 px-3 text-sm min-h-[40px]",
        lg: "h-12 px-4 text-base min-h-[48px]",
      },
      state: {
        default: "border-[var(--input)] hover:border-[var(--border)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]",
        error: "border-[var(--destructive)] hover:border-[var(--destructive)] focus-visible:border-[var(--destructive)] focus-visible:ring-[var(--destructive)]",
        success: "border-[var(--success)] hover:border-[var(--success)] focus-visible:border-[var(--success)] focus-visible:ring-[var(--success)]",
        disabled: "border-[var(--neutral-200)] bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)
```

### Key Changes from Current Implementation

1. **Border Width**: Change from `border-2` to `border` (1.5px via design tokens)
2. **Border Radius**: Change from `rounded-none` to `rounded-[4px]` (8-bit style with slight rounding)
3. **Background**: Change from `bg-neutral-950` to `bg-[var(--background)]`
4. **Text Color**: Change from `text-neutral-100` to `text-[var(--foreground)]`
5. **Placeholder**: Change from `text-neutral-500` to `text-[var(--muted-foreground)]`
6. **Focus Ring**: Use `--ring` variable with proper opacity
7. **Border Colors**: Use `--input`, `--border`, `--primary`, `--destructive`, `--success` variables

## Files to Modify

### Primary File
| File | Modification Type |
|------|-------------------|
| `src/presentation/components/ui/input.tsx` | Update CVA variants to use CSS variables |

### Related Files (Read Only - Do Not Modify)
| File | Purpose |
|------|---------|
| `src/styles/light-theme-tokens.css` | Verify light theme tokens exist |
| `src/styles/design-tokens.css` | Verify dark theme tokens exist |
| `src/lib/utils.ts` | Verify `cn` utility works |

## Testing Requirements

### Visual Testing
- [ ] Verify default state in light theme (white bg, neutral border)
- [ ] Verify default state in dark theme (dark bg, neutral border)
- [ ] Verify hover state (border changes)
- [ ] Verify focus state (primary border + ring)
- [ ] Verify error state (red border)
- [ ] Verify success state (green border)
- [ ] Verify disabled state (gray bg, no pointer events)
- [ ] Verify all 3 sizes (SM, MD, LG)

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Focus indicator visibility
- [ ] Screen reader announcements
- [ ] Contrast ratios (WCAG AA)

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

## Success Criteria
1. Input component renders correctly in light theme
2. Input component renders correctly in dark theme (no regression)
3. All variant states work properly
4. CSS custom properties are used for all color values
5. No breaking changes to existing dark theme functionality
6. Accessibility requirements met (WCAG 2.1 AA)

## Design Reference Documents
- **Component Specifications**: `_bmad-output/light-theme-design-system/light-theme-component-specifications-part1-2026-01-03.md` (Section 2.2)
- **Context XML**: `_bmad-output/light-theme-sprint/stories/LT-2.9-context.xml`

## Execution Checklist
- [ ] Read current Input component implementation
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
| **Created By** | SM Agent (Story Development Cycle) |
| **Document Version** | 1.0 |
| **Phase** | Week 2: P0 Components |
| **Preceding Stories** | LT-1.1 through LT-1.7 (all complete), LT-2.8 (in progress) |
| **Following Stories** | LT-2.10 (Select), LT-2.11 (Checkbox/Radio), LT-2.12 (Switch), LT-2.13 (Testing) |
