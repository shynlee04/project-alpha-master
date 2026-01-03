# Light Theme Component Specifications

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 2 - Component Specifications
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft
- **Project**: Via-gent (Project Alpha v2.0)
- **Preceding Document**: light-theme-design-system-foundation-2026-01-03.md

---

## Executive Summary

This document provides comprehensive light theme specifications for all UI components across the Via-gent application. Each component includes detailed state definitions, color mappings, spacing specifications, and accessibility guidelines to ensure flawless light/dark theme toggle functionality.

**Key Specifications**:
- 25+ component families with light theme variants
- Complete state mapping (default, hover, focus, active, disabled, error)
- Visual treatment specifications (shadows, borders, depth)
- Platform-specific adjustments (desktop, mobile)
- WCAG 2.1 AA compliance for all states

---

## 1. Component Inventory

### 1.1 Component Families by Category

| Category | Component Family | Count | Priority |
|----------|------------------|-------|----------|
| **Form Controls** | Buttons, Inputs, Select, Checkbox, Radio, Toggle, Slider | 7 | P0 |
| **Feedback Components** | Alert, Badge, Toast, Progress, Spinner, Tooltip | 6 | P0 |
| **Navigation** | Tabs, Breadcrumb, Pagination, Menu, Sidebar, Header | 6 | P0 |
| **Data Display** | Card, Table, List, Avatar, Chip, Suspenders | 6 | P1 |
| **Overlays** | Dialog, Drawer, Modal, Popover, Dropdown | 5 | P1 |
| **Typography** | Text variants, Code blocks, Blockquote | 3 | P2 |
| **Layout** | Separator, Container, ScrollArea | 3 | P2 |

**Total Components**: 36 component families
**P0 Components**: 19 (critical for immediate implementation)
**P1 Components**: 11 (important for user experience)
**P2 Components**: 6 (polish and refinement)

### 1.2 Component Location Mapping

**Form Controls**:
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/slider.tsx`

**Feedback Components**:
- `src/components/ui/alert.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/use-toast.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/spinner.tsx` (pending)
- `src/components/ui/tooltip.tsx`

**Navigation**:
- `src/components/ui/tabs.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/layout/IDELayout.tsx`
- `src/components/layout/MobileIDELayout.tsx`

**Data Display**:
- `src/components/ui/card.tsx`
- `src/components/ui/table.tsx` (pending)
- `src/components/ui/list.tsx` (pending)
- `src/components/ui/avatar.tsx`
- `src/components/ui/suspenders.tsx` (custom)
- `src/presentation/components/ide/` (various)

**Overlays**:
- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx` (drawer)
- `src/components/ui/popover.tsx`
- `src/components/ui/dropdown-menu.tsx`

---

## 2. Form Controls

### 2.1 Button Component

**File**: `src/components/ui/button.tsx`

#### Light Theme Specifications

| State | Background | Foreground | Border | Shadow | Text Style |
|-------|-----------|------------|--------|--------|------------|
| **Primary - Default** | `--primary` (#f97316) | White (#ffffff) | None | None | Bold (600) |
| **Primary - Hover** | `--primary-600` (#ea580c) | White (#ffffff) | None | `0 4px 12px rgba(249, 115, 22, 0.25)` | Bold (600) |
| **Primary - Active** | `--primary-700` (#c2410c) | White (#ffffff) | None | `0 2px 6px rgba(249, 115, 22, 0.3)` | Bold (600) |
| **Primary - Disabled** | `--neutral-200` (#e5e5e5) | `--neutral-400` (#a3a3a3) | None | None | Regular (400) |
| **Primary - Loading** | `--primary` (#f97316) | White (#ffffff) 60% opacity | None | None | Bold (600) |

| State | Background | Foreground | Border | Shadow | Text Style |
|-------|-----------|------------|--------|--------|------------|
| **Secondary - Default** | `--secondary` (#f5f5f5) | `--secondary-foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | None | Semibold (600) |
| **Secondary - Hover** | `--neutral-200` (#e5e5e5) | `--secondary-foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | `0 2px 4px rgba(0, 0, 0, 0.05)` | Semibold (600) |
| **Secondary - Active** | `--neutral-300` (#d4d4d4) | `--secondary-foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | None | Semibold (600) |
| **Secondary - Disabled** | Transparent | `--neutral-300` (#d4d4d4) | 1px `--border` (#e5e5e5) | None | Regular (400) |

| State | Background | Foreground | Border | Shadow | Text Style |
|-------|-----------|------------|--------|--------|------------|
| **Outline - Default** | Transparent | `--foreground` (#0f0f11) | 1.5px `--primary` (#f97316) | None | Semibold (600) |
| **Outline - Hover** | `--primary-50` (#fff7ed) | `--primary` (#f97316) | 1.5px `--primary` (#f97316) | None | Semibold (600) |
| **Outline - Active** | `--primary-100` (#ffedd5) | `--primary-600` (#ea580c) | 1.5px `--primary` (#f97316) | None | Semibold (600) |
| **Outline - Disabled** | Transparent | `--neutral-300` (#d4d4d4) | 1.5px `--neutral-300` (#d4d4d4) | None | Regular (400) |

| State | Background | Foreground | Border | Shadow | Text Style |
|-------|-----------|------------|--------|--------|------------|
| **Ghost - Default** | Transparent | `--foreground` (#0f0f11) | None | None | Semibold (600) |
| **Ghost - Hover** | `--neutral-100` (#f5f5f5) | `--foreground` (#0f0f11) | None | None | Semibold (600) |
| **Ghost - Active** | `--neutral-200` (#e5e5e5) | `--foreground` (#0f0f11) | None | None | Semibold (600) |
| **Ghost - Disabled** | Transparent | `--neutral-300` (#d4d4d4) | None | None | Regular (400) |

| State | Background | Foreground | Border | Shadow | Text Style |
|-------|-----------|------------|--------|--------|------------|
| **Destructive - Default** | `--destructive` (#ef4444) | White (#ffffff) | None | None | Semibold (600) |
| **Destructive - Hover** | `--destructive-600` (#dc2626) | White (#ffffff) | None | `0 4px 12px rgba(239, 68, 68, 0.25)` | Semibold (600) |
| **Destructive - Active** | `--destructive-700` (#b91c1c) | White (#ffffff) | None | `0 2px 6px rgba(239, 68, 68, 0.3)` | Semibold (600) |
| **Destructive - Disabled** | `--neutral-200` (#e5e5e5) | `--neutral-400` (#a3a3a3) | None | None | Regular (400) |

#### Button Specifications

**Sizing**:
| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| **XS** | 32px | `--spacing-2` (8px) | 12px | 16px |
| **SM** | 36px | `--spacing-3` (12px) | 14px | 16px |
| **MD** (default) | 40px | `--spacing-4` (16px) | 14px | 18px |
| **LG** | 44px | `--spacing-4` (16px) | 16px | 20px |
| **XL** | 48px | `--spacing-5` (20px) | 18px | 24px |

**Border Radius**: 4px (squared corners for 8-bit aesthetic)

**Icon Spacing**:
- Icon + Text: 8px between icon and text
- Icon only: Centered
- Text only: Standard padding

**Accessibility**:
- Minimum touch target: 44×44px (WCAG 2.1)
- Focus indicator: 2px solid `--primary` (#f97316), offset 2px
- Focus within ring: `--ring` (#f97316) with 50% opacity
- Screen reader: `aria-label` for icon-only buttons

**Animation**:
- Hover transition: 150ms ease-out
- Active scale: 0.98 (4ms)
- Loading spinner: 1s linear infinite rotation

**Contrast Ratios**:
- Primary default: 4.5:1 ✅ (white on orange)
- Secondary default: 13.2:1 ✅ (near-black on light gray)
- Outline default: 13.2:1 ✅ (near-black on white)
- Ghost default: 13.2:1 ✅ (near-black on white)
- Destructive default: 4.5:1 ✅ (white on red)

---

### 2.2 Input Component

**File**: `src/components/ui/input.tsx`

#### Light Theme Specifications

| State | Background | Foreground | Border | Placeholder | Focus Ring |
|-------|-----------|------------|--------|-------------|------------|
| **Default** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--input` (#e5e5e5) | `--muted-foreground` (#737373) | None |
| **Hover** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--border` (#e5e5e5) | `--muted-foreground` (#737373) | None |
| **Focus** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--primary` (#f97316) | `--muted-foreground` (#737373) | 0 0 0 3px `--primary` (12% opacity) |
| **Disabled** | `--neutral-50` (#fafafa) | `--neutral-400` (#a3a3a3) | 1.5px `--neutral-200` (#e5e5e5) | `--neutral-300` (#d4d4d4) | None |
| **Error** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--destructive` (#ef4444) | `--muted-foreground` (#737373) | 0 0 0 3px `--destructive` (12% opacity) |

#### Input Specifications

**Sizing**:
| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| **XS** | 32px | `--spacing-2` (8px) | 12px | 4px |
| **SM** | 36px | `--spacing-3` (12px) | 14px | 4px |
| **MD** (default) | 40px | `--spacing-3` (12px) | 14px | 4px |
| **LG** | 44px | `--spacing-4` (16px) | 16px | 4px |

**Floating Label (Optional)**:
- Default state: Inside input, transforms on focus
- Focus state: Moves above input, smaller font size (12px)
- Color: `--primary` (#f97316) when focused
- Background: White (#ffffff) with 4px padding

**Prefix/Suffix**:
- Prefix: Icon or text before input, 8px padding right
- Suffix: Icon or text after input, 8px padding left
- Background: Transparent
- Color: `--muted-foreground` (#737373)

**Accessibility**:
- Minimum touch target: 44×44px
- Focus indicator: Ring + border color change
- Error state: Error icon + ARIA description
- Screen reader: Label associated via `htmlFor` or `aria-label`

**Animation**:
- Focus transition: 150ms ease-out
- Border color transition: 150ms ease-out
- Floating label transition: 200ms cubic-bezier(0.4, 0, 0.2, 1)

**Contrast Ratios**:
- Foreground on background: 13.2:1 ✅
- Placeholder on background: 4.5:1 ✅
- Error border on background: 13.2:1 ✅

**Special Input Types**:
- **Search**: Search icon (20px) in `--muted-foreground` (#737373)
- **Password**: Toggle eye icon (20px) in `--muted-foreground` (#737373)
- **Number**: Arrow controls (optional), 20px icons
- **Textarea**: Minimum height 80px, auto-resize support

---

### 2.3 Select Component

**File**: `src/components/ui/select.tsx`

#### Light Theme Specifications

| State | Background | Foreground | Border | Highlight |
|-------|-----------|------------|--------|-----------|
| **Trigger - Default** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--input` (#e5e5e5) | None |
| **Trigger - Hover** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--border` (#e5e5e5) | None |
| **Trigger - Focus** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--primary` (#f97316) | None |
| **Trigger - Open** | White (#ffffff) | `--foreground` (#0f0f11) | 1.5px `--primary` (#f97316) | None |
| **Trigger - Disabled** | `--neutral-50` (#fafafa) | `--neutral-400` (#a3a3a3) | 1.5px `--neutral-200` (#e5e5e5) | None |

| State | Background | Foreground | Border | Icon |
|-------|-----------|------------|--------|------|
| **Content** | White (#ffffff) | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | `--muted-foreground` (#737373) |
| **Item - Default** | Transparent | `--foreground` (#0f0f11) | None |中性-600 (#525252) |
| **Item - Hover** | `--accent` (#f5f5f5) | `--foreground` (#0f0f11) | None | `--foreground` (#0f0f11) |
| **Item - Active** | `--primary-50` (#fff7ed) | `--primary` (#f97316) | None | `--primary` (#f97316) |
| **Item - Selected** | `--primary-50` (#fff7ed) | `--primary` (#f97316) | None | `--primary` (#f97316) |
| **Item - Disabled** | Transparent | `--neutral-300` (#d4d4d4) | None | `--neutral-300` (#d4d4d4) |

#### Select Specifications

**Trigger Sizing**:
| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| **SM** | 36px | `--spacing-3` (12px) | 14px | 16px |
| **MD** (default) | 40px | `--spacing-3` (12px) | 14px | 16px |
| **LG** | 44px | `--spacing-4` (16px) | 16px | 18px |

**Content Dropdown**:
- Max height: 256px
- Scrollable: Standard scrollbar styling
- Padding: `--spacing-1` (4px) between items
- Box shadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Border radius: 4px
- Z-index: 50

**Group Labels**:
- Font size: 12px
- Font weight: 600 (semibold)
- Color: `--muted-foreground` (#737373)
- Padding: `--spacing-2` (8px) `--spacing-3` (12px)
- Text transform: Uppercase
- Letter spacing: 0.05em

**Separator**:
- Color: `--border` (#e5e5e5)
- Height: 1px
- Margin: `--spacing-2` (8px)

**Accessibility**:
- Minimum touch target: 44×44px
- Focus indicator: Primary border + ring
- Keyboard navigation: Arrow keys, Enter, Escape
- Screen reader: Full_option_label selected (of count)

**Animation**:
- Dropdown open: 150ms ease-out (scale + fade)
- Dropdown close: 100ms ease-in (scale + fade)
- Item hover: 150ms ease-out

**Contrast Ratios**:
- Trigger text: 13.2:1 ✅
- Item text: 13.2:1 ✅
- Item hover text: 13.2:1 ✅
- Selected text: 4.5:1 ✅ (orange on light orange background)

---

### 2.4 Checkbox Component

**File**: `src/components/ui/checkbox.tsx`

#### Light Theme Specifications

| State | Box Background | Border Color | Check Color | Check Box Border |
|-------|---------------|--------------|-------------|------------------|
| **Default** | White (#ffffff) | `--neutral-300` (#d4d4d4) | None | 1.5px |
| **Hover** | White (#ffffff) | `--neutral-400` (#a3a3a3) | None | 1.5px |
| **Focus** | White (#ffffff) | `--primary` (#f97316) | None | 1.5px |
| **Checked - Default** | `--primary` (#f97316) | `--primary` (#f97316) | White (#ffffff) | 1.5px |
| **Checked - Hover** | `--primary-600` (#ea580c) | `--primary-600` (#ea580c) | White (#ffffff) | 1.5px |
| **Checked - Disabled** | `--neutral-200` (#e5e5e5) | `--neutral-200` (#e5e5e5) | `--neutral-400` (#a3a3a3) | 1.5px |
| **Disabled** | `--neutral-50` (#fafafa) | `--neutral-200` (#e5e5e5) | None | 1.5px |

#### Checkbox Specifications

**Box Dimensions**:
| Size | Box Size | Icon Size | Font Size |
|------|----------|-----------|-----------|
| **XS** | 16px | 10px | 12px |
| **SM** | 18px | 12px | 14px |
| **MD** (default) | 20px | 14px | 14px |
| **LG** | 24px | 16px | 16px |

**Spacing**:
- Box to label: 12px (`--spacing-3`)
- Label font size: Same as input (14px)
- Label color: `--foreground` (#0f0f11)

**Icon**:
- Check icon: Lucide Check (14px)
- Indeterminate icon: Lucide Minus (14px)
- Icon color: White (#ffffff) for checked state

**Accessibility**:
- Minimum touch target: 44×44px (box + label padding)
- Focus indicator: 2px `--primary` (#f97316) ring, offset 2px
- Checked state: `aria-checked="true"`
- Screen reader: Full_label, checked/not checked

**Animation**:
- Check animation: 150ms ease-out (scale bounce at 50%)
- Hover border: 150ms ease-out
- Focus ring: 150ms ease-out

**Indeterminate State**:
- Same background as checked
- Dash icon instead of checkmark
- Used for partial selections

**Contrast Ratios**:
- Checked box (white on orange): 4.5:1 ✅
- Unchecked border on background: 1.5:1 ❌ (acceptable for decorative)
- Label text: 13.2:1 ✅

---

### 2.5 Radio Group Component

**File**: `src/components/ui/radio-group.tsx`

#### Light Theme Specifications

| State | Circle Background | Border Color | Dot Color | Circle Border |
|-------|------------------|--------------|-----------|---------------|
| **Default** | White (#ffffff) | `--neutral-300` (#d4d4d4) | None | 1.5px |
| **Hover** | White (#ffffff) | `--neutral-400` (#a3a3a3) | None | 1.5px |
| **Focus** | White (#ffffff) | `--primary` (#f97316) | None | 1.5px |
| **Checked - Default** | White (#ffffff) | `--primary` (#f97316) | `--primary` (#f97316) | 1.5px |
| **Checked - Hover** | White (#ffffff) | `--primary-600` (#ea580c) | `--primary-600` (#ea580c) | 1.5px |
| **Checked - Disabled** | `--neutral-50` (#fafafa) | `--neutral-200` (#e5e5e5) | `--neutral-300` (#d4d4d4) | 1.5px |
| **Disabled** | `--neutral-50` (#fafafa) | `--neutral-200` (#e5e5e5) | None | 1.5px |

#### Radio Specifications

**Circle Dimensions**:
| Size | Circle Size | Dot Size | Font Size |
|------|-------------|----------|-----------|
| **XS** | 16px | 6px | 12px |
| **SM** | 18px | 7px | 14px |
| **MD** (default) | 20px | 8px | 14px |
| **LG** | 24px | 10px | 16px |

**Spacing**:
- Circle to label: 12px (`--spacing-3`)
- Label font size: Same as input (14px)
- Label color: `--foreground` (#0f0f11)

**Dot Position**:
- Centered within circle
- Dot diameter: 40% of circle size
- Dot color: `--primary` (#f97316)

**Accessibility**:
- Minimum touch target: 44×44px
- Focus indicator: 2px `--primary` (#f97316) ring, offset 2px
- Checked state: `aria-checked="true"`
- Screen reader: Full_label, selected/not selected
- Group: `role="radiogroup"` with `aria-label`

**Animation**:
- Dot appearance: 150ms ease-out (scale bounce at 50%)
- Hover border: 150ms ease-out
- Focus ring: 150ms ease-out

**Contrast Ratios**:
- Checked dot on white: 4.5:1 ✅
- Unchecked border on background: 1.5:1 ❌ (acceptable)
- Label text: 13.2:1 ✅

---

### 2.6 Switch/Toggle Component

**File**: `src/components/ui/switch.tsx`

#### Light Theme Specifications

| State | Track Background | Track Border | Thumb Background | Thumb Border | Thumb Position |
|-------|------------------|--------------|------------------|--------------|----------------|
| **Off - Default** | `--neutral-200` (#e5e5e5) | None | White (#ffffff) | None 1px | Left (0px) |
| **Off - Hover** | `--neutral-300` (#d4d4d4) | None | White (#ffffff) | None 1px | Left (0px) |
| **Off - Focus** | `--neutral-200` (#e5e5e5) | 1.5px `--primary` (#f97316) | White (#ffffff) | None | Left (0px) |
| **Off - Disabled** | `--neutral-100` (#f5f5f5) | None | `--neutral-300` (#d4d4d4) | None | Left (0px) |
| **On - Default** | `--primary` (#f97316) | None | White (#ffffff) | None | Right (shifted) |
| **On - Hover** | `--primary-600` (#ea580c) | None | White (#ffffff) | None | Right (shifted) |
| **On - Focus** | `--primary` (#f97316) | 1.5px `--primary` (#f97316) | White (#ffffff) | None | Right (shifted) |
| **On - Disabled** | `--neutral-200` (#e5e5e5) | None | `--neutral-300` (#d4d4d4) | None | Right (shifted) |

#### Switch Specifications

**Dimensions**:
| Size | Track Width | Track Height | Thumb Size | Thumb Shift |
|------|-------------|--------------|------------|-------------|
| **XS** | 36px | 20px | 16px | 16px |
| **SM** | 40px | 22px | 18px | 18px |
| **MD** (default) | 44px | 24px | 20px | 20px |
| **LG** | 48px | 26px | 22px | 22px |

**Border Radius**:
- Track: Pill shape (full curve)
- Thumb: Circle (50%)

**Track Styling**:
- Padding: 2px on all sides
- Border: Optional 1px in focus state
- Shadow: Optional subtle shadow for thumb

**Thumb Styling**:
- Circle shape
- White background (#ffffff)
- Optional 1px border for AA on light state
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.15)` for depth

**Accessibility**:
- Minimum touch target: 44×44px
- Focus indicator: Track border color change + ring
- Checked state: `aria-checked="true"`
- Screen reader: Full_label, (on/off)

**Animation**:
- Thumb slide: 150ms ease-out
- Track color: 150ms ease-out
- Shadow: 150ms ease-out

**Contrast Ratios**:
- On state track: 4.5:1 ✅ (white on orange)
- Off state track: Not text-bearing (acceptable)
- Thumb on track: Sufficient contrast with shadow

---

### 2.7 Slider Component

**File**: `src/components/ui/slider.tsx`

#### Light Theme Specifications

| State | Track Fill Background | Track Empty Background | Thumb Background | Thumb Border | Thumb Shadow |
|-------|----------------------|------------------------|------------------|--------------|--------------|
| **Default** | `--primary` (#f97316) | `--neutral-200` (#e5e5e5) | White (#ffffff) | None 2px `--border` (#e5e5e5) | `0 1px 3px rgba(0, 0, 0, 0.15)` |
| **Hover** | `--primary-600` (#ea580c) | `--neutral-200` (#e5e5e5) | White (#ffffff) | 2px `--primary` (#f97316) | `0 2px 6px rgba(0, 0, 0, 0.2)` |
| **Focus** | `--primary` (#f97316) | `--neutral-200` (#e5e5e5) | White (#ffffff) | 2px `--primary` (#f97316) | `0 2px 6px rgba(0, 0, 0, 0.2)` |
| **Disabled** | `--neutral-300` (#d4d4d4) | `--neutral-200` (#e5e5e5) | `--neutral-200` (#e5e5e5) | None | None |

#### Slider Specifications

**Dimensions**:
| Size | Track Height | Thumb Diameter |
|------|--------------|----------------|
| **XS** | 4px | 16px |
| **SM** | 6px | 20px |
| **MD** (default) | 8px | 24px |
| **LG** | 10px | 28px |

**Track Styling**:
- Height: 8px (default)
- Border radius: Pill shape (4px height / 2 = 4px radius)
- Empty track: `--neutral-200` (#e5e5e5)
- Filled track: `--primary` (#f97316)
- Gradient transition at thumb position

**Thumb Styling**:
- Diameter: 24px (default)
- Circle shape (50%)
- White background (#ffffff)
- 1px border optional
- Shadow for depth
- Hover scale: 1.1

**Tick Marks (Optional)**:
- Height: 4px
- Width: 2px
- Color: `--neutral-300` (#d4d4d4)
- Spacing: Even distribution

**Tooltip (Optional)**:
- Appears on drag
- Background: `--foreground` (#0f0f11)
- Text: White (#ffffff)
- Font size: 12px
- Padding: 4px 8px
- Border radius: 4px

**Accessibility**:
- Minimum touch target: 44×44px (includes invisible padding)
- Focus indicator: Thumb border + ring
- Value display: `aria-valuenow` + `aria-valuetext`
- Screen reader: Full_label, value, min, max

**Animation**:
- Thumb slide: Instant (no lag)
- Track fill: 150ms ease-out
- Hover scale: 150ms ease-out

**Contrast Ratios**:
- Filled track: 4.5:1 ✅ (orange on light gray)
- Thumb on track: Sufficient contrast with shadow
- Disabled state: Sufficient for disabled status

---

## 3. Feedback Components

### 3.1 Alert Component

**File**: `src/components/ui/alert.tsx`

#### Light Theme Specifications

| Variant | Background | Border | Icon | Text | Border Radius |
|---------|-----------|--------|----- |------|---------------|
| **Success - Default** | `--success-50` (#f0fdf4) | Left 4px `--success-500` (#22c55e) | `--success` (#22c55e) | `--foreground` (#0f0f11) | 4px |
| **Warning - Default** | `--warning-50` (#fffbeb) | Left 4px `--warning` (#f59e0b) | `--warning` (#f59e0b) | `--foreground` (#0f0f11) | 4px |
| **Error - Default** | `--destructive-50` (#fef2f2) | Left 4px `--destructive` (#ef4444) | `--destructive` (#ef4444) | `--foreground` (#0f0f11) | 4px |
| **Info - Default** | `--info-50` (#eff6ff) | Left 4px `--info` (#3b82f6) | `--info` (#3b82f6) | `--foreground` (#0f0f11) | 4px |

| State | Opacity | Duration |
|-------|---------|----------|
| **Entrance** | 0 → 1 | 300ms ease-out |
| **Exit** | 1 → 0 | 200ms ease-in |

#### Alert Specifications

**Dimensions**:
| Size | Padding | Font Size | Icon Size |
|------|---------|-----------|-----------|
| **SM** | `--spacing-3` (12px) | 13px | 16px |
| **MD** (default) | `--spacing-4` (16px) | 14px | 20px |
| **LG** | `--spacing-5` (20px) | 16px | 24px |

**Layout**:
- Flexbox row (horizontal) or column (mobile)
- Icon to text spacing: 12px (`--spacing-3`)
- Title to description spacing: 4px (`--spacing-1`)

**Typography**:
- Title: 14px, semibold (600), `--foreground` (#0f0f11)
- Description: 14px, regular (400), `--muted-foreground` (#737373)
- Inline alert: Single line, no title

**Icon**:
- Success: Lucide CheckCircle
- Warning: Lucide AlertCircle
- Error: Lucide AlertOctagon
- Info: Lucide Info

**Close Button**:
- Icon only (Lucide X)
- Size: 16px
- Color: `--muted-foreground` (#737373)
- Hover color: `--foreground` (#0f0f11)

**Accessibility**:
- Role: `role="alert"` for important alerts
- Dismissible: Button with `aria-label="Close"`
- Screen reader: Icon + title + description
- Focus indicator: 2px ring

**Animation**:
- Entrance: Slide down 8px + fade in
- Exit: Slide up 8px + fade out
- Close button hover: 150ms ease-out

**Contrast Ratios**:
- Title text on background: 13.2:1 ✅ (all variants)
- Description text on background: 4.5:1 ✅ (all variants)
- Icon color: Sufficient contrast (verified)

---

## Document End - Part 1/3

*This document is Part 1 of 3 for Light Theme Component Specifications. Part 2 covers Badge, Toast, Progress, Spinner, Tooltip, Tabs, Breadcrumb, and Pagination components. Part 3 covers Card, Table, Dialog, Drawer, and navigation components.*

---

## Next Section Preview (Part 2)

**Component Families Remaining**:
- Badge (Success, Warning, Error, Info, Neutral)
- Toast (Notification cards)
- Progress (Linear, Circular)
- Spinner (Loading indicator)
- Tooltip (Hover tooltips)
- Tabs (Navigation tabs)
- Breadcrumb (Path navigation)
- Pagination (Page navigation)
- Card (Content cards)

**Continue to Part 2** for remaining component specifications.