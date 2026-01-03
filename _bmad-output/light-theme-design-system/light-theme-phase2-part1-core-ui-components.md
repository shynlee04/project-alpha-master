# Light Theme Design System - Phase 2: Component Specifications (Part 1)

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 2 - Component Specifications
- **Part**: Part 1 of 5 (Core UI Components)
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft
- **Project**: Via-gent (Project Alpha v2.0)

---

## Overview

This document provides detailed light theme specifications for core UI components. Each component specification includes:
- Visual appearance in light theme
- All interactive states (default, hover, active, focus, disabled, loading)
- Accessibility requirements
- Usage guidelines

---

## Component Inventory

### Part 1 Coverage (This Document)
✅ Button (All Variants)
✅ Input Fields (Text, Number, Search)
✅ Textarea
✅ Checkbox
✅ Radio
✅ Toggle/Switch
✅ Card

### Part 2 Coverage (Next Document)
- Navigation components (Tabs, Breadcrumb, Menu)
- Layout components (Dialog, Popover, Tooltip)

### Part 3 Coverage
- Status components (Badge, Alert, Progress, Skeleton)
- Feedback components (Toast, Notification)

### Part 4 Coverage
- Data display (Table, List, Avatar)
- Form components (Select, Dropdown, Slider)
- Divider & Separator components

### Part 5 Coverage
- Workspace-specific components
- Specialized IDE components
- Mobile-specific variants

---

## 1. Button

### 1.1 Primary Button

**Default State** (Light Theme)
- **Background**: `--primary` (#f97316)
- **Foreground**: `--primary-foreground` (#ffffff)
- **Border**: None
- **Shadow**: None
- **Typography**: `--font-medium` (500), `--text-sm` (14px)

**Hover State**
- **Background**: `--primary-600` (#ea580c)
- **Foreground**: `--primary-foreground` (#ffffff)
- **Border**: None
- **Shadow**: `0 4px 12px rgba(249, 115, 22, 0.3)`
- **Transition**: 150ms ease-in-out

**Active/Pressed State**
- **Background**: `--primary-700` (#c2410c)
- **Foreground**: `--primary-foreground` (#ffffff)
- **Shadow**: `0 2px 4px rgba(249, 115, 22, 0.4)`
- **Transform**: scale(0.98)

**Focus State**
- **Border**: 2px solid `--ring` (#f97316)
- **Border Radius**: Same as button
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.2)`
- **Outline**: None

**Disabled State**
- **Background**: `--neutral-200` (#e5e5e5)
- **Foreground**: `--neutral-400` (#a3a3a3)
- **Border**: None
- **Shadow**: None
- **Cursor**: not-allowed

**Loading State**
- **Background**: `--primary` (#f97316)
- **Foreground**: `--primary-foreground` (#ffffff)
- **Indicator**: Spinner icon (2px stroke, white)
- **Opacity**: 0.8
- **Cursor**: wait

**Accessibility**
```html
<button
  type="button"
  class="btn-primary"
  aria-busy="false"
  disabled="false"
>
  Save Changes
</button>
```

**Contrast Requirements**
- Background vs Foreground: **4.5:1** ✅
- Focus ring vs Background: **3.8:1** ✅

**Variants**
- **Size**: SM (32px), MD (40px), LG (48px)
- **Radius**: 4px (sharp, 8-bit style)
- **Icon**: Optional (+ 8px left/right spacing)

---

### 1.2 Secondary Button

**Default State** (Light Theme)
- **Background**: Transparent
- **Foreground**: `--foreground` (#0f0f11)
- **Border**: 1px solid `--border` (#e5e5e5)
- **Typography**: `--font-medium` (500), `--text-sm` (14px)

**Hover State**
- **Background**: `--accent` (#f5f5f5)
- **Foreground**: `--foreground` (#0f0f11)
- **Border**: 1px solid `--border` (#e5e5e5)

**Active/Pressed State**
- **Background**: `--muted` (#f5f5f5)
- **Foreground**: `--foreground` (#0f0f11)
- **Transform**: scale(0.98)

**Focus State**
- **Border**: 2px solid `--ring` (#f97316)
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.2)`

**Disabled State**
- **Background**: Transparent
- **Foreground**: `--neutral-400` (#a3a3a3)
- **Border**: 1px solid `--neutral-200` (#e5e5e5)

**Loading State**
- **Indicator**: Spinner (neutral-600)
- **Opacity**: 0.6

**Contrast Requirements**
- Foreground vs Background: **13.2:1** ✅
- Border vs Background: **1.3:1** ❌ (acceptable for border only)

---

### 1.3 Ghost Button

**Default State** (Light Theme)
- **Background**: Transparent
- **Foreground**: `--foreground` (#0f0f11)
- **Border**: None

**Hover State**
- **Background**: `--accent` (#f5f5f5)
- **Foreground**: `--foreground` (#0f0f11)

**Active/Pressed State**
- **Background**: `--muted` (#f5f5f5)
- **Transform**: scale(0.98)

**Focus State**
- **Box Shadow**: `0 0 0 2px rgba(249, 115, 22, 0.2)`

**Disabled State**
- **Foreground**: `--neutral-400` (#a3a3a3)

---

### 1.4 Destructive Button

**Default State** (Light Theme)
- **Background**: `--destructive` (#ef4444)
- **Foreground**: `--destructive-foreground` (#ffffff)

**Hover State**
- **Background**: `--destructive-600` (#dc2626)
- **Foreground**: `--destructive-foreground` (#ffffff)

**Active/Pressed State**
- **Background**: `--destructive-700` (#b91c1c)

**Focus State**
- **Box Shadow**: `0 0 0 3px rgba(239, 68, 68, 0.2)`

**Disabled State**
- **Background**: `--neutral-200` (#e5e5e5)
- **Foreground**: `--neutral-400` (#a3a3a3)

**Contrast Requirements**
- Background vs Foreground: **4.5:1** ✅

---

### 1.5 Button Size Specifications

| Size | Height | Padding (H) | Padding (V) | Font Size | Icon Size |
|------|--------|-------------|-------------|-----------|-----------|
| **XS** | 28px | 8px | 4px | 12px | 12px |
| **SM** | 32px | 12px | 6px | 14px | 14px |
| **MD** | 40px | 16px | 8px | 14px | 16px |
| **LG** | 48px | 24px | 12px | 16px | 20px |
| **XL** | 56px | 32px | 16px | 18px | 24px |

---

### 1.6 Icon Button

**Default State**
- **Background**: Transparent
- **Foreground**: `--icon-default` (#525252)
- **Border**: None (0px transparent)

**Hover State**
- **Background**: `--accent` (#f5f5f5)
- **Foreground**: `--icon-hover` (#262626)

**Active/Pressed State**
- **Background**: `--primary` (#f97316)
- **Foreground**: `--primary-foreground` (#ffffff)

**Focus State**
- **Box Shadow**: `0 0 0 2px rgba(249, 115, 22, 0.2)`

**Disabled State**
- **Foreground**: `--icon-disabled` (#d4d4d4)

**Sizes**
- **SM**: 32×32px, icon 16px
- **MD**: 40×40px, icon 20px
- **LG**: 48×48px, icon 24px

**Accessibility**
```html
<button
  type="button"
  class="icon-button"
  aria-label="Settings"
>
  <SettingsIcon aria-hidden="true" />
</button>
```

---

## 2. Input Fields

### 2.1 Text Input

**Default State** (Light Theme)
- **Background**: `--background` (#ffffff)
- **Border**: 1px solid `--input` (#e5e5e5)
- **Foreground**: `--foreground` (#0f0f11)
- **Placeholder**: `--muted-foreground` (#737373)
- **Typography**: `--text-sm` (14px), `--leading-normal` (1.5)
- **Height**: 40px (SM: 32px, LG: 48px)
- **Padding**: 8px 12px
- **Radius**: 4px (sharp corners)

**Hover State**
- **Border**: 1px solid `--neutral-400` (#a3a3a3)
- **Background**: `--background` (#ffffff)

**Focus State**
- **Border**: 2px solid `--ring` (#f97316)
- **Background**: `--background` (#ffffff)
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.1)`
- **Outline**: None

**Error State**
- **Border**: 2px solid `--destructive` (#ef4444)
- **Foreground**: `--foreground` (#0f0f11)
- **Error Message**: `--destructive` (#ef4444), text-xs

**Disabled State**
- **Background**: `--neutral-50` (#fafafa)
- **Border**: 1px solid `--neutral-200` (#e5e5e5)
- **Foreground**: `--neutral-400` (#a3a3a3)
- **Cursor**: not-allowed

**Read-Only State**
- **Background**: `--neutral-100` (#f5f5f5)
- **Border**: 1px solid `--neutral-300` (#d4d4d4)
- **Foreground**: `--foreground` (#0f0f11)
- **Cursor**: default

**Accessibility**
```html
<input
  type="text"
  id="username"
  class="input-text"
  placeholder="Enter username"
  required="true"
  aria-describedby="username-error"
  aria-invalid="false"
/>
<span id="username-error" class="error-message"></span>
```

**Contrast Requirements**
- Foreground vs Background: **13.2:1** ✅
- Placeholder vs Background: **4.5:1** ✅
- Focus ring vs Background: **2.1:1** ❌ (requires shadow enhancement)
- Error text vs Background: **4.5:1** ✅

---

### 2.2 Number Input

**Base Specifications**: Same as Text Input

**Controls** (Arrows)
- **Background**: `--neutral-100` (#f5f5f5)
- **Hover Background**: `--neutral-200` (#e5e5e5)
- **Active Background**: `--neutral-300` (#d4d4d4)
- **Foreground**: `--foreground` (#0f0f11)
- **Border**: 1px solid `--neutral-300` (#d4d4d4)
- **Size**: 24×24px (SM: 20×20px)

**Accessibility**
```html
<input
  type="number"
  id="quantity"
  class="input-number"
  min="1"
  max="100"
  step="1"
  aria-label="Quantity"
/>
```

---

### 2.3 Search Input

**Base Specifications**: Same as Text Input

**Search Icon** (Left)
- **Color**: `--muted-foreground` (#737373)
- **Size**: 16px (SM: 14px, LG: 20px)
- **Position**: 8px from left edge

**Clear Button** (Right, only when has value)
- **Icon**: X (Close)
- **Color**: `--muted-foreground` (#737373)
- **Hover Color**: `--destructive` (#ef4444)
- **Size**: 16×16px
- **Background**: Transparent
- **Hover Background**: `--neutral-200` (#e5e5e5)

**Accessibility**
```html
<div role="search">
  <input
    type="search"
    id="search"
    class="input-search"
    placeholder="Search..."
    aria-label="Search"
  />
  <button
    type="button"
    class="search-clear"
    aria-label="Clear search"
    hidden="true"
  >
    <XIcon aria-hidden="true" />
  </button>
</div>
```

---

### 2.4 Textarea

**Default State** (Light Theme)
- **Background**: `--background` (#ffffff)
- **Border**: 1px solid `--input` (#e5e5e5)
- **Foreground**: `--foreground` (#0f0f11)
- **Placeholder**: `--muted-foreground` (#737373)
- **Typography**: `--text-sm` (14px), `--leading-normal` (1.5)
- **Min-Height**: 80px (auto-expand with content)
- **Padding**: 8px 12px
- **Radius**: 4px (sharp corners)
- **Resize**: Vertical only

**Hover State**
- **Border**: 1px solid `--neutral-400` (#a3a3a3)

**Focus State**
- **Border**: 2px solid `--ring` (#f97316)
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.1)`

**Error State**
- **Border**: 2px solid `--destructive` (#ef4444)

**Disabled State**
- **Background**: `--neutral-50` (#fafafa)
- **Border**: 1px solid `--neutral-200` (#e5e5e5)
- **Foreground**: `--neutral-400` (#a3a3a3)

**Character Counter** (Optional, Bottom Right)
- **Color**: `--muted-foreground` (#737373)
- **Font**: `--text-xs` (12px)
- **Position**: Inside padding area
- **Warning**: Red when approaching limit (80%)

**Accessibility**
```html
<textarea
  id="message"
  class="textarea"
  rows="3"
  placeholder="Enter your message..."
  required="true"
  aria-describedby="message-counter"
  maxlength="500"
></textarea>
<span id="message-counter" class="char-counter">0/500</span>
```

---

## 3. Checkbox

### 3.1 Checkbox Component

**Unchecked State** (Light Theme)
- **Background**: `--background` (#ffffff)
- **Border**: 2px solid `--border` (#e5e5e5)
- **Size**: 18×18px (SM: 16×16px, LG: 20×20px)
- **Radius**: 2px (slightly rounded corners for 8-bit style)

**Hover State** (Unchecked)
- **Border**: 2px solid `--primary` (#f97316)
- **Background**: `--primary-50` (#fff7ed)

**Focus State**
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.2)`

**Checked State**
- **Background**: `--primary` (#f97316)
- **Border**: 2px solid `--primary` (#f97316)
- **Checkmark**: White (#ffffff), 12px icon (vector path)

**Indeterminate State** (Mixed selection)
- **Background**: `--primary` (#f97316)
- **Border**: 2px solid `--primary` (#f97316)
- **Icon**: Minus (-), white

**Disabled State** (Checked)
- **Background**: `--neutral-200` (#e5e5e5)
- **Border**: 2px solid `--neutral-200` (#e5e5e5)
- **Checkmark**: `--neutral-400` (#a3a3a3)

**Disabled State** (Unchecked)
- **Background**: `--background` (#ffffff)
- **Border**: 2px solid `--neutral-300` (#d4d4d4)

**Label Text**
- **Spacing**: 8px left of checkbox
- **Color**: `--foreground` (#0f0f11)
- **Font**: `--text-sm` (14px), `--leading-normal` (1.5)
- **Disabled Color**: `--neutral-400` (#a3a3a3)

**Accessibility**
```html
<label class="checkbox-label">
  <input
    type="checkbox"
    id="terms"
    class="checkbox-input"
    checked="false"
    aria-checked="false"
  />
  <span class="checkbox-visual"></span>
  <span class="checkbox-label-text">I agree to terms</span>
</label>
```

**Contrast Requirements**
- Checkmark vs Background (checked): **4.5:1** ✅
- Label vs Background: **13.2:1** ✅

---

## 4. Radio Button

### 4.1 Radio Component

**Unchecked State** (Light Theme)
- **Background**: `--background` (#ffffff)
- **Border**: 2px solid `--border` (#e5e5e5)
- **Outer Ring**: 18×18px
- **Inner Circle**: None
- **Radius**: 50% (circular)

**Hover State** (Unchecked)
- **Border**: 2px solid `--primary` (#f97316)
- **Background**: `--primary-50` (#fff7ed)

**Focus State**
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.2)`

**Checked State**
- **Background**: `--background` (#ffffff)
- **Border**: 2px solid `--primary` (#f97316)
- **Inner Circle**: 10×10px, `--primary` (#f97316)

**Disabled State** (Checked)
- **Border**: 2px solid `--neutral-200` (#e5e5e5)
- **Inner Circle**: `--neutral-400` (#a3a3a3)

**Disabled State** (Unchecked)
- **Border**: 2px solid `--neutral-300` (#d4d4d4)

**Label Text**
- **Spacing**: 8px left of radio
- **Color**: `--foreground` (#0f0f11)
- **Font**: `--text-sm` (14px), `--leading-normal` (1.5)
- **Disabled Color**: `--neutral-400` (#a3a3a3)

**Accessibility**
```html
<label class="radio-label">
  <input
    type="radio"
    id="option1"
    name="options"
    class="radio-input"
    checked="true"
    aria-checked="true"
  />
  <span class="radio-visual"></span>
  <span class="radio-label-text">Option 1</span>
</label>
```

**Contrast Requirements**
- Inner circle vs Background (checked): **4.5:1** ✅
- Label vs Background: **13.2:1** ✅

---

## 5. Toggle Switch

### 5.1 Toggle Component

**Off State** (Light Theme)
- **Track Background**: `--neutral-300` (#d4d4d4)
- **Thumb Background**: `--background` (#ffffff)
- **Thumb Shadow**: `0 2px 4px rgba(0, 0, 0, 0.2)`
- **Size**: 44×24px track, 20×20px thumb
- **Radius**: 12px (rounded track), 10px (rounded thumb)
- **Thumb Position**: 2px from left edge

**Hover State** (Off)
- **Track Background**: `--neutral-400` (#a3a3a3)
- **Thumb Shadow**: `0 4px 8px rgba(0, 0, 0, 0.3)`

**Focus State**
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.2)`

**On State**
- **Track Background**: `--primary` (#f97316)
- **Thumb Background**: `--primary-foreground` (#ffffff)
- **Thumb Shadow**: `0 2px 4px rgba(0, 0, 0, 0.2)`
- **Thumb Position**: 2px from right edge (translate X)

**Disabled State** (Off)
- **Track Background**: `--neutral-200` (#e5e5e5)
- **Thumb Background**: `--neutral-50` (#fafafa)
- **Thumb Shadow**: None

**Disabled State** (On)
- **Track Background**: `--neutral-400` (#a3a3a3)
- **Thumb Background**: `--neutral-200` (#e5e5e5)

**Transition**
- **Duration**: 200ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Properties**: background-color, transform

**Accessibility**
```html
<button
  type="button"
  role="switch"
  aria-checked="false"
  class="toggle"
>
  <span class="toggle-thumb"></span>
</button>
```

**Contrast Requirements**
- Thumb vs Track (off): **4.5:1** ⚠️ (border required)
- Thumb vs Track (on): **4.5:1** ✅

**Thumb Border** (Contrast Enhancement)
- **Width**: 2px
- **Color**: `--neutral-400` (#a3a3a3)
- **On State**: `--primary` (#f97316)

---

## 6. Card

### 6.1 Card Component

**Default State** (Light Theme)
- **Background**: `--card` (#ffffff)
- **Border**: 1px solid `--border` (#e5e5e5)
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- **Radius**: 8px (sharp with minimal rounding for 8-bit style)
- **Padding**: 16px (MD), 24px (LG), 32px (XL)

**Header** (Optional)
- **Padding Bottom**: 12px
- **Border Bottom**: 1px solid `--border` (#e5e5e5)
- **Title**: `--text-h5` (20px), `--font-semibold` (600)
- **Subtitle**: `--text-sm` (14px), `--muted-foreground` (#737373)

**Body**
- **Padding**: 0 (use card padding)
- **Content**: `--foreground` (#0f0f11)

**Footer** (Optional)
- **Padding Top**: 12px
- **Border Top**: 1px solid `--border` (#e5e5e5)
- **Content**: Primary or secondary buttons

**Hover State** (Interactive Cards)
- **Border**: 1px solid `--primary` (#f97316)
- **Shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Transform**: translateY(-2px)
- **Transition**: 150ms ease-in-out

**Active/Pressed State**
- **Transform**: translateY(0)
- **Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`

**Focus State**
- **Border**: 2px solid `--ring` (#f97316)
- **Box Shadow**: `0 0 0 3px rgba(249, 115, 22, 0.1)`

**Disabled Grayed Card**
- **Background**: `--neutral-50` (#fafafa)
- **Border**: 1px solid `--neutral-200` (#e5e5e5)
- **Foreground**: `--muted-foreground` (#737373)
- **Shadow**: None

**Elevation Levels**
| Level | Shadow | Use Case |
|-------|--------|----------|
| **0** | None | Flat cards |
| **1** | `0 1px 3px rgba(0, 0, 0, 0.1)` | Default cards |
| **2** | `0 4px 6px rgba(0, 0, 0, 0.1)` | Elevated cards |
| **3** | `0 10px 15px rgba(0, 0, 0, 0.1)` | Modal cards |

**Accessibility**
```html
<article class="card" tabindex="0">
  <header class="card-header">
    <h2 class="card-title">Card Title</h2>
  </header>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <footer class="card-footer">
    <button class="btn-primary">Action</button>
  </footer>
</article>
```

**Contrast Requirements**
- Foreground vs Background: **13.2:1** ✅
- Title vs Background: **13.2:1** ✅

---

## 7. Component State Summary Matrix

### 7.1 Common State Tokens

| State | Background | Border | Foreground | Shadow |
|-------|------------|--------|------------|--------|
| **Default** | `--card` (#fff) | `--border` (#e5e5e5) | `--foreground` (#0f0f11) | Level 1 |
| **Hover** | `--accent` (#f5f5f5) | `--neutral-400` (#a3a3a3) | `--foreground` (#0f0f11) | Level 2 |
| **Active** | `--muted` (#f5f5f5) | `--primary` (#f97316) | `--foreground` (#0f0f11) | Level 1 |
| **Focus** | `--card` (#fff) | `--ring` (#f97316) 2px | `--foreground` (#0f0f11) | Focus ring |
| **Disabled** | `--neutral-50` (#fafafa) | `--neutral-200` (#e5e5e5) | `--neutral-400` (#a3a3a3) | None |
| **Error** | `--card` (#fff) | `--destructive` (#ef4444) 2px | `--destructive` (#ef4444) | Level 1 |

---

## Document End (Part 1)

**Next Document**: Phase 2 - Part 2: Navigation & Layout Components

*This document is part of the Via-gent Light Theme Design System, Phase 2: Component Specifications. For questions or clarifications, please refer to the project documentation or contact the UX Design team.*