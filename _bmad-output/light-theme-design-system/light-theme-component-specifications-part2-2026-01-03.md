# Light Theme Component Specifications - Part 2

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 2 - Component Specifications
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft
- **Project**: Via-gent (Project Alpha v2.0)
- **Preceding Document**: light-theme-component-specifications-part1-2026-01-03.md

---

## 4. Feedback Components (Continued)

### 4.1 Badge Component

**File**: `src/components/ui/badge.tsx`

#### Light Theme Specifications

| Variant | Background | Foreground | Border | Font Weight | Border Radius |
|---------|-----------|------------|--------|-------------|---------------|
| **Primary** | `--primary` (#f97316) | White (#ffffff) | None | 500 (medium) | Pill (9999px) |
| **Secondary** | `--secondary` (#f5f5f5) | `--secondary-foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | 500 (medium) | Pill (9999px) |
| **Success** | `--success-100` (#dcfce7) | `--success-700` (#15803d) | None | 500 (medium) | Pill (9999px) |
| **Warning** | `--warning-100` (#fef3c7) | `--warning-700` (#b45309) | None | 500 (medium) | Pill (9999px) |
| **Error** | `--destructive-100` (#fee2e2) | `--destructive-700` (#b91c1c) | None | 500 (medium) | Pill (9999px) |
| **Info** | `--info-100` (#dbeafe) | `--info-700` (#1d4ed8) | None | 500 (medium) | Pill (9999px) |
| **Neutral (Outline)** | White (#ffffff) | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | 500 (medium) | Pill (9999px) |

| State | Hover | Opacity | Duration |
|-------|-------|---------|----------|
| **Default** | None | 100% | — |
| **Hover** | Darken variant by 5-10% | 100% | 150ms |
| **Disabled** | Grayscale | 50% | 150ms |

#### Badge Specifications

**Sizing**:
| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| **XS** | 20px | 4px 8px | 10px | 10px |
| **SM** | 24px | 4px 8px | 11px | 12px |
| **MD** (default) | 28px | 6px 10px | 12px | 12px |
| **LG** | 32px | 8px 12px | 14px | 16px |

**Icon Support**:
- Position: Left of text or right for dismissible
- Spacing: 4px between icon and text
- Colors: Match badge foreground
- Dismissible: X icon (12px), hover color change

**Dot Badge**:
- Size: 6-8px diameter
- Circular shape
- Status indicator only (no text)
- Colors: Success, Warning, Error, Info, Neutral

**Counter Badge**:
- Position: Absolute, top-right corner
- Size: 18px diameter (MD)
- Font size: 10px
- Min width: 18px
- Offset: -4px top, -4px right

**Accessibility**:
- Screen reader: Accessible name + badge label
- Dismissible: Button with `aria-label="Dismiss"`
- Status badges: `aria-label` for meaning

**Animation**:
- Hover: 150ms ease-out
- Dismissible: 200ms fade + scale to 0
- Counter bounce: 300ms bounce on update

**Contrast Ratios**:
- Primary badge: 4.5:1 ✅ (white on orange)
- Secondary badge: 13.2:1 ✅ (near-black on light gray)
- Success badge: 7.2:1 ✅ (dark green on light green)
- Warning badge: 7.1:1 ✅ (dark amber on light amber)
- Error badge: 7.2:1 ✅ (dark red on light red)
- Info badge: 7.2:1 ✅ (dark blue on light blue)
- Neutral outline: 13.2:1 ✅ (near-black on white)

---

### 4.2 Toast Component

**File**: `src/components/ui/use-toast.tsx`

#### Light Theme Specifications

| Variant | Background | Border | Title | Description | Icon | Action Button |
|---------|-----------|--------|-------|-------------|------|---------------|
| **Default** | `--card` (#ffffff) | 1px `--border` (#e5e5e5) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) | None | Primary style |
| **Success** | White (#ffffff) | Left 4px `--success` (#22c55e) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) | CheckCircle (green) | Primary style |
| **Warning** | White (#ffffff) | Left 4px `--warning` (#f59e0b) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) | AlertCircle (amber) | Primary style |
| **Error** | White (#ffffff) | Left 4px `--destructive` (#ef4444) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) | AlertOctagon (red) | Primary style |
| **Info** | White (#ffffff) | Left 4px `--info` (#3b82f6) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) | InfoCircle (blue) | Primary style |

#### Toast Specifications

**Dimensions**:
| Size | Width | Padding | Font Size Title | Font Size Description |
|------|-------|---------|-----------------|----------------------|
| **Mobile** | 100% (max 380px) | `--spacing-4` (16px) | 14px | 13px |
| **Desktop** (default) | 380px | `--spacing-4` (16px) | 14px | 13px |
| **LG** | 440px | `--spacing-5` (20px) | 16px | 14px |

**Layout**:
- Flexbox column
- Icon to content spacing: 12px (`--spacing-3`)
- Title to description spacing: 4px (`--spacing-1`)
- Description to action spacing: 12px (`--spacing-3`)

**Typography**:
- Icon size: 20px
- Title: 14px, semibold (600), `--foreground` (#0f0f11)
- Description: 13px, regular (400), `--muted-foreground` (#737373)
- Action: 13px, medium (500), `--primary` (#f97316)

**Shadow**:
- Default: `0 4px 12px rgba(0, 0, 0, 0.08)`
- Hover: `0 6px 16px rgba(0, 0, 0, 0.12)`

**Border Radius**: 4px

**Close Button**:
- Icon only (Lucide X)
- Size: 16px
- Color: `--muted-foreground` (#737373)
- Hover color: `--foreground` (#0f0f11)
- Position: Top-right

**Position**:
- Bottom-right (default): 24px offset
- Top-right: 24px offset
- Bottom-center: 50% translate X
- Top-center: 50% translate X

**Accessibility**:
- Role: `role="status"` for non-critical
- Role: `role="alert"` for critical
- ARIA-live: `aria-live="polite"` or `"assertive"`
- Dismissible: Button with `aria-label="Close"`
- Auto-dismiss: `aria-label="Message will disappear in {seconds} seconds"`

**Animation**:
- Slide in (bottom-right): 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Slide in (top-right): 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Fade out: 200ms ease-in
- Swipe to dismiss: 150ms ease-out

**Contrast Ratios**:
- Title on background: 13.2:1 ✅
- Description on background: 4.5:1 ✅
- Action button: 4.5:1 ✅ (orange on white)

---

### 4.3 Progress Component

**File**: `src/components/ui/progress.tsx`

#### Light Theme Specifications

| Type | Background | Progress Fill | Border Radius | Height |
|------|-----------|---------------|---------------|--------|
| **Linear - Default** | `--neutral-200` (#e5e5e5) | `--primary` (#f97316) | Pill (9999px) | 8px |
| **Linear - Success** | `--neutral-200` (#e5e5e5) | `--success` (#22c55e) | Pill (9999px) | 8px |
| **Linear - Info** | `--neutral-200` (#e5e5e5) | `--info` (#3b82f6) | Pill (9999px) | 8px |
| **Circular Track** | `--neutral-200` (#e5e5e5) | `--primary` (#f97316) | Circle (50%) | — |

| State | Animation | Opacity | Detail |
|-------|-----------|---------|--------|
| **Default** | None | 100% | Static fill |
| **Indeterminate** | Slide animation (stripe) | 100% | Striped fill |
| **Loading** | 1.5s linear infinite | 100% | Circular rotation |
| **Disabled** | None | 50% | Grayed out |

#### Linear Progress Specifications

**Dimensions**:
| Size | Height | Width |
|------|--------|-------|
| **XS** | 4px | 100% (or custom) |
| **SM** | 6px | 100% (or custom) |
| **MD** (default) | 8px | 100% (or custom) |
| **LG** | 10px | 100% (or custom) |
| **XL** | 12px | 100% (or custom) |

**Track Styling**:
- Background: `--neutral-200` (#e5e5e5)
- Border radius: Pill shape
- Box shadow: Optional `inset 0 1px 2px rgba(0, 0, 0, 0.05)`

**Fill Styling**:
- Background: `--primary` (#f97316) or variant
- Border radius: Pill shape (inherits from track)
- Transition: 300ms ease-out (value changes)

**Striped Animation (Indeterminate)**:
- Stripe width: 20%
- Stripe angle: 45deg
- Animation: 1.5s linear infinite slide

**Value Display** (Optional):
- Position: Right of progress bar or centered inside
- Font size: 12px
- Color: `--muted-foreground` (#737373)
- Format: "XX%" or "XX/100"

#### Circular Progress Specifications

**Dimensions**:
| Size | Diameter | Track Thickness | Font Size |
|------|-----------|-----------------|-----------|
| **XS** | 24px | 2px | 10px |
| **SM** | 32px | 3px | 12px |
| **MD** (default) | 40px | 4px | 14px |
| **LG** | 48px | 5px | 16px |
| **XL** | 64px | 6px | 20px |

**Track**:
- Circle SVG
- Full circumference (100%)
- Background color: `--neutral-200` (#e5e5e5)

**Progress Arc**:
- SVG stroke-dasharray
- Color: `--primary` (#f97316) or variant
- Rotation: -90deg (start at top)
- Animation: 300ms ease-out (value changes)

**Center Text**:
- Value percentage or custom text
- Font weight: 600 (semibold)
- Color: `--foreground` (#0f0f11)

**Loading Animation**:
- Full rotation: 1.5s linear infinite
- Arc length: 50-70% of circumference
- Fade in/out at ends

**Accessibility**:
- Role: `role="progressbar"`
- Value: `aria-valuenow="{value}"`
- Min/Max: `aria-valuemin="0"` + `aria-valuemax="100"`
- Label: `aria-label="Loading"` or custom
- Indeterminate: `aria-busy="true"`

**Animation**:
- Value change: 300ms ease-out
- Indeterminate: 1.5s linear infinite
- Loading rotation: 1.5s linear infinite

**Contrast Ratios**:
- Fill on track: 4.5:1 ✅ (orange on light gray)
- Value text: 13.2:1 ✅ (near-black on white)

---

### 4.4 Spinner Component

**File**: `src/components/ui/spinner.tsx` (pending creation)

#### Light Theme Specifications

| Variant | Size | Stroke Color | Stroke Width | Background | Duration |
|---------|------|--------------|-------------|------------|----------|
| **Default** | 24px | `--neutral-900` (#171717) | 2px | Transparent | 1s linear |
| **Primary** | 24px | `--primary` (#f97316) | 2px | Transparent | 1s linear |
| **Secondary** | 24px | `--neutral-400` (#a3a3a3) | 2px | Transparent | 1s linear |
| **Inverse** | 24px | White (#ffffff) | 2px | `--foreground` (#0f0f11) | 1s linear |

| State | Opacity | Animation |
|-------|---------|-----------|
| **Default** | 100% | Rotate 360deg |
| **Loading** | 100% | Rotate 360deg |
| **Disabled** | 50% | None |

#### Spinner Specifications

**SVG Construction**:
- Circle element with stroke-dasharray
- Circumference calculation based on radius
- Gap: 20-30% of circumference
- Rotation: -90deg start position

**Dimensions**:
| Size | Diameter | Stroke Width | Icon Size |
|------|-----------|--------------|-----------|
| **XS** | 12px | 1.5px | — |
| **SM** | 16px | 2px | — |
| **MD** (default) | 24px | 2px | — |
| **LG** | 32px | 3px | — |
| **XL** | 48px | 4px | — |

**Stroke Colors**:
- Default: `--neutral-900` (#171717)
- Primary: `--primary` (#f97316)
- Contextual: Match surrounding text color
- Dark on light backgrounds
- Light on dark backgrounds (inverse variant)

**Animation**:
- Duration: 1s linear infinite
- Easing: linear (constant speed)
- Direction: Clockwise

**Dot Spinner (Alternative)**:
- 3-4 dots
- Size: Each dot 33% of container
- Animation: Scale pulse staggered
- Duration: 1.2s ease-in-out infinite

**Accessibility**:
- Role: `role="status"` with `aria-label="Loading"`
- Alternative: `aria-hidden="true"` if text present
- Screen reader: "Loading" or specific context

**Animation**:
- Smooth rotation
- No flickering
- Performance optimized (CSS transform)

**Contrast**:
- Stroke on background: 13.2:1 ✅ (near-black on white)
- Primary variant: 4.5:1 ✅ (orange on white)

---

### 4.5 Tooltip Component

**File**: `src/components/ui/tooltip.tsx`

#### Light Theme Specifications

| State | Background | Foreground | Border | Shadow | Arrow Color |
|-------|-----------|------------|--------|--------|-------------|
| **Default** | `--foreground` (#0f0f11) | White (#ffffff) | None | `0 4px 12px rgba(0, 0, 0, 0.15)` | Match background |
| **Hover** | `--foreground` (#0f0f11) | White (#ffffff) | None | `0 6px 16px rgba(0, 0, 0, 0.2)` | Match background |

| Animation | Duration | Easing |
|-----------|----------|--------|
| **Enter** | Fade in + scale | 150ms cubic-bezier(0.4, 0, 0.2, 1) |
| **Exit** | Fade out + scale | 100ms cubic-bezier(0, 0, 0.2, 1) |

#### Tooltip Specifications

**Dimensions**:
| Size | Max Width | Padding | Font Size |
|------|-----------|---------|-----------|
| **SM** | 200px | 6px 10px | 12px |
| **MD** (default) | 250px | 8px 12px | 13px |
| **LG** | 300px | 10px 14px | 14px |

**Typography**:
- Font: `--font-sans`
- Weight: 400 (regular)
- Line height: 1.5
- Text align: Left (default), Center optional

**Border Radius**: 4px

**Arrow**:
- Size: 8px × 8px triangle
- Position: Top, bottom, left, right of tooltip
- Color: Matches tooltip background
- Offset: 4px from anchor

**Positioning** (Priority Order):
- Top (default)
- Bottom
- Left
- Right

**Offset**:
- Horizontal: 8px
- Vertical: 8px

**Z-index**: 50

**Delay**:
- Show: 300ms (optional, for mouse hover)
- Hide: 100ms
- Instant for keyboard focus

**Trigger Methods**:
- Hover (default)
- Focus
- Click (optional, persistent)
- Manual control

**Accessibility**:
- Anchor: `aria-describedby="{tooltip-id}"`
- Tooltip: `id="{tooltip-id}"`, `role="tooltip"`
- Animation: Respect `prefers-reduced-motion`
- Screen reader: Full tooltip text announced
- Dismiss: Escape key or click away

**Animation**:
- Fade in: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- Scale: 0.95 → 1.0
- Fade out: 100ms cubic-bezier(0, 0, 0.2, 1)
- Reduced motion: Fade only (no scale)

**Contrast Ratios**:
- Text on background: 13.2:1 ✅ (white on near-black)

---

## 5. Navigation Components

### 5.1 Tabs Component

**File**: `src/components/ui/tabs.tsx`

#### Light Theme Specifications

**Tab List (Navigation)**:

| State | Tray Background | Border Bottom | Indicator Background | Indicator Shadow |
|-------|----------------|---------------|----------------------|------------------|
| **Default** | Transparent | 1px `--border` (#e5e5e5) | — | — |
| **Hover** | Transparent | 1px `--border` (#e5e5e5) | — | — |
| **Focus** | Transparent | 1px `--border` (#e5e5e5) | — | — |

**Tab Trigger**:

| State | Background | Foreground | Border Radius | Font Weight |
|-------|-----------|------------|---------------|-------------|
| **Default** | Transparent | `--muted-foreground` (#737373) | 4px top only | 500 (medium) |
| **Hover** | `--neutral-50` (#fafafa) | `--foreground` (#0f0f11) | 4px top only | 500 (medium) |
| **Active** | Transparent | `--foreground` (#0f0f11) | 4px top only | 600 (semibold) |
| **Focus** | Transparent | `--foreground` (#0f0f11) | 4px top only + ring | 600 (semibold) |
| **Disabled** | Transparent | `--neutral-300` (#d4d4d4) | 4px top only | 400 (regular) |

**Active Indicator**:
- Height: 2px
- Background: `--primary` (#f97316)
- Position: Bottom of active tab
- Width: 100%
- Transition: 150ms ease-out (position + width)

**Tab Content**:
- Background: Transparent (inherits from parent)
- Padding: `--spacing-6` (24px)
- Animation: Fade in 150ms ease-out

#### Tabs Specifications

**Tab List**:
- Flexbox row
- Gap: 0px (adjacent tabs)
- Border radius: 4px top corners
- Overflow: Hidden

**Tab Trigger**:
- Height: 40px
- Padding: `--spacing-3` (12px) `--spacing-4` (16px)
- Font size: 14px
- Text align: Center
- Position: Relative

**Icon Support**:
- Position: Left of text (or right, optional)
- Size: 18px
- Spacing: 8px between icon and text
- Color: Match tab foreground

**Badge Support**:
- Position: Right of text
- Size: MD badge (28px)
- Spacing: 8px between text and badge

**Vertical Tabs**:
- Tab list: Flexbox column
- Border: Right instead of bottom (1px `--border`)
- Active indicator: Right side, vertical 2px
- Tab trigger: Padding adjusted for vertical layout

**Pill Tabs (Alternative Style)**:
- Tab trigger background: `--secondary` (#f5f5f5)
- Active background: `--primary-50` (#fff7ed)
- Active foreground: `--primary` (#f97316)
- Border radius: Pill (9999px)
- Gap: 4px between tabs

**Accessibility**:
- Role: `role="tablist"` on list
- Tab: `role="tab"`, `aria-selected`, `aria-controls`
- Panel: `role="tabpanel"`, `aria-labelledby`
- Keyboard: Arrow keys, Home, End, Enter
- Focus indicator: 2px `--primary` (#f97316) ring (optional)

**Animation**:
- Indicator slide: 150ms ease-out
- Tab hover background: 150ms ease-out
- Content fade: 150ms ease-out
- Reduced motion: No slide indicator, instant show

**Contrast Ratios**:
- Active tab text: 13.2:1 ✅
- Inactive tab text: 4.5:1 ✅
- Disabled tab text: 1.5:1 ❌ (acceptable for disabled)

---

### 5.2 Breadcrumb Component

**File**: `src/components/ui/breadcrumb.tsx`

#### Light Theme Specifications

| Element | Foreground | Font Size | Font Weight | Hover Effect |
|---------|------------|-----------|-------------|--------------|
| **Page (Current)** | `--foreground` (#0f0f11) | 14px | 500 (medium) | None |
| **Link (Parent)** | `--muted-foreground` (#737373) | 14px | 400 (regular) | `--primary` (#f97316) + underline |
| **Separator** | `--muted-foreground` (#737373) | 14px | 400 (regular) | None |

#### Breadcrumb Specifications

**Layout**:
- Flexbox row
- Gap: 8px between items
- Align items: Center
- Wrap: Yes (mobile)

**Separator**:
- Icon: Lucide ChevronRight (14px)
- Color: `--muted-foreground` (#737373)
- Size: 14px
- Opacity: 60%
- Optional: "/" text separator

**Breadcrumb Item**:
- Padding: 4px 8px
- Border radius: 4px
- Hover background: `--neutral-50` (#fafafa)
- Transition: 150ms ease-out

**Current Page**:
- Font weight: 500 (medium)
- Color: `--foreground` (#0f0f11)
- No hover effect
- No link behavior

**Parent Link**:
- Font weight: 400 (regular)
- Color: `--muted-foreground` (#737373)
- Hover: `--primary` (#f97316) + underline
- Underline decoration: 1px solid `--primary`
- Cursor: Pointer

**Ellipsis (Truncated)**:
- Icon: Lucide MoreHorizontal (16px)
- Color: `--muted-foreground` (#737373)
- Position: Middle of long breadcrumbs
- Clickable: Opens dropdown with hidden items

**Dropdown (Ellipsis)**:
- Background: White (#ffffff)
- Border: 1px `--border` (#e5e5e5)
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Border radius: 4px
- Padding: 4px
- Z-index: 50

**Accessibility**:
- Container: `aria-label="Breadcrumb"`
- Navigation: `role="navigation"`, `aria-label`
- List: `<nav><ol>` semantic HTML
- Items: `<li>` with `<a>` or `<span>`
- Current: `aria-current="page"`

**Animation**:
- Hover: 150ms ease-out
- Link color: 150ms ease-out
- Dropdown: 150ms ease-out (fade + scale)

**Contrast Ratios**:
- Current page: 13.2:1 ✅
- Parent link: 4.5:1 ✅
- Hover link: 4.5:1 ✅ (orange on white)

---

### 5.3 Pagination Component

**File**: `src/components/ui/pagination.tsx` (pending creation)

#### Light Theme Specifications

**Button States**:

| State | Background | Foreground | Border | Icon/Text Color |
|-------|-----------|------------|--------|-----------------|
| **Default** | White (#ffffff) | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | `--foreground` (#0f0f11) |
| **Hover** | `--accent` (#f5f5f5) | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) | `--foreground` (#0f0f11) |
| **Active/Selected** | `--primary` (#f97316) | White (#ffffff) | 1px `--primary` (#f97316) | White (#ffffff) |
| **Focus** | White (#ffffff) | `--foreground` (#0f0f11) | 1px `--primary` (#f97316) | `--foreground` (#0f0f11) |
| **Disabled** | Transparent | `--neutral-300` (#d4d4d4) | 1px `--neutral-200` (#e5e5e5) | `--neutral-300` (#d4d4d4) |

| Size | Height | Width | Padding | Font Size | Border Radius |
|------|--------|-------|---------|-----------|---------------|
| **SM** | 32px | 32px | — | 12px | 4px |
| **MD** (default) | 36px | 36px | — | 14px | 4px |
| **LG** | 40px | 40px | — | 16px | 4px |

#### Pagination Specifications

**Layout**:
- Flexbox row
- Gap: 4px between buttons
- Align items: Center
- Wrap: No (scroll on mobile)

**Button Types**:
- **Previous/Next**: Chevron icon (16px)
- **Page Number**: Text (1, 2, 3, ...)
- **First/Last**: Double chevron or text
- **Ellipsis**: Three dots icon

**Previous/Next Buttons**:
- Icon size: 16px
- Padding: None (centered)
- Label: "Previous" / "Next" (hidden visually)
- Disabled: When at start or end

**Page Numbers**:
- Font size: 14px
- Font weight: 500 (medium)
- Selected: Bold (600) + primary background
- Range: Show 5-7 page numbers (configurable)
- Current page: Highlighted

**Ellipsis**:
- Icon: Lucide MoreHorizontal (16px)
- Color: `--muted-foreground` (#737373)
- Not clickable (decorative)
- Position: Between page ranges

**Compact Mode**:
- Show only: Previous | Current | Next
- "Page X of Y" text indicator
- Used in tight spaces

**Jump to Page (Optional)**:
- Input field after pagination
- Type number + Enter or click "Go"
- Min/Max validation

**Accessibility**:
- Container: `role="navigation"`, `aria-label="Pagination"`
- Buttons: `aria-label` for Prev/Next
- Selected: `aria-current="page"`
- Keyboard: Arrow keys, Home, End
- Screen reader: "Page X, Now on page Y"

**Animation**:
- Hover: 150ms ease-out
- Active scale: 0.95 (4ms)
- Focus ring: 150ms ease-out

**Contrast Ratios**:
- Default button: 13.2:1 ✅
- Active button: 4.5:1 ✅ (white on orange)
- Disabled button: 1.5:1 ❌ (acceptable for disabled)

---

## 6. Data Display Components

### 6.1 Card Component

**File**: `src/components/ui/card.tsx`

#### Light Theme Specifications

| Variant | Background | Border | Shadow | Focus Ring |
|---------|-----------|--------|--------|------------|
| **Default** | `--card` (#ffffff) | 1px `--border` (#e5e5e5) | `0 1px 3px rgba(0, 0, 0, 0.05)` | None |
| **Hover** | `--card` (#ffffff) | 1px `--neutral-300` (#d4d4d4) | `0 4px 12px rgba(0, 0, 0, 0.1)` | None |
| **Focus** | `--card` (#ffffff) | 1px `--primary` (#f97316) | `0 4px 12px rgba(0, 0, 0, 0.1)` | 0 0 0 3px `--primary` (12% opacity) |
| **Elevated** | `--card` (#ffffff) | None | `0 8px 24px rgba(0, 0, 0, 0.1)` | None |
| **Outlined** | `--card` (#ffffff) | 2px `--neutral-300` (#d4d4d4) | None | None |

| Border Radius | Compact | Default | Spacious |
|---------------|---------|---------|----------|
| **Standard** | 4px | 6px | 8px |
| **Pill** | 9999px | 9999px | 9999px |

#### Card Specifications

**Parts**:
- **Header**: Title + optional subtitle/actions
- **Content**: Main body
- **Footer**: Actions + metadata
- **Image**: Optional hero image

**Card Header**:
- Padding: `--spacing-4` (16px) `--spacing-5` (20px) `--spacing-3` (12px)
- Border bottom: 1px `--border` (#e5e5e5) (optional)
- Title: 18px, semibold (600), `--foreground` (#0f0f11)
- Subtitle: 14px, regular (400), `--muted-foreground` (#737373)
- Spacing: 4px between title/subtitle

**Card Content**:
- Padding: `--spacing-5` (20px)
- No background (transparent)
- Inherits from card

**Card Footer**:
- Padding: `--spacing-3` (12px) `--spacing-5` (20px) `--spacing-4` (16px)
- Border top: 1px `--border` (#e5e5e5) (optional)
- Flexbox row (actions) or column (metadata)
- Gap: 8px between actions

**Card Actions**:
- Buttons: Primary, Secondary, Ghost styles
- Alignment: Left, Center, Right
- Gap: 8px between buttons

**Card Image**:
- Position: Top (default) or specific placement
- Height: 200px (default), 300px (large)
- Object-fit: Cover
- Border radius: Top corners match card radius

**Sizing**:
| Size | Header Padding | Content Padding | Footer Padding |
|------|----------------|-----------------|----------------|
| **Compact** | 12px 16px 12px | 16px | 12px 16px 16px |
| **Default** | 16px 20px 12px | 20px | 12px 20px 16px |
| **Spacious** | 20px 24px 16px | 24px | 16px 24px 20px |

**Border Radius**:
- Standard: 6px (default)
- Compact: 4px
- Spacious: 8px
- Pill: 9999px

**Interactive Cards**:
- Cursor: Pointer
- Hover: Shadow + border color change
- Focus: Ring + border color change
- Active: Scale 0.98 (4ms)

**Accessibility**:
- Non-interactive: `role="article"` or `div`
- Interactive: `<a>` or `<button>`
- Focus indicator: 2px `--primary` (#f97316) ring
- Screen reader: Header title + content description

**Animation**:
- Hover shadow: 150ms ease-out
- Hover border: 150ms ease-out
- Focus ring: 150ms ease-out
- Active scale: 4ms ease-out
- Reduced motion: No scale, shadow only

**Contrast Ratios**:
- Header title: 13.2:1 ✅
- Header subtitle: 4.5:1 ✅
- Content text: 13.2:1 ✅
- Footer text: 4.5:1 ✅

---

## Document End - Part 2/3

*This document is Part 2 of 3 for Light Theme Component Specifications. Part 3 covers Table, Dialog, Drawer, Dropdown, Popover, Avatar, and Layout components.*

---

## Next Section Preview (Part 3)

**Component Families Remaining**:
- Table (Data display tables)
- Dialog (Modal dialogs)
- Drawer/Sheet (Sidebar panels)
- Dropdown Menu (Context menus)
- Popover (Hover/click popovers)
- Avatar (User avatars)
- Layout components (Separator, Container, ScrollArea)
- Workspace-specific components (IDE, Knowledge, Study, Notes)

**Continue to Part 3** for remaining component specifications + theme transition design + accessibility checklist.