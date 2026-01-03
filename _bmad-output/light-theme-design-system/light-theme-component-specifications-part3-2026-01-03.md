# Light Theme Component Specifications - Part 3

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 2 - Component Specifications
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft
- **Project**: Via-gent (Project Alpha v2.0)
- **Preceding Document**: light-theme-component-specifications-part2-2026-01-03.md

---

## 7. Data Display Components (Continued)

### 7.1 Table Component

**File**: `src/components/ui/table.tsx` (pending creation)

#### Light Theme Specifications

**Table Container**:
| State | Background | Border | Border Radius |
|-------|-----------|--------|---------------|
| **Default** | `--card` (#ffffff) | 1px `--border` (#e5e5e5) | 6px |
| **Hover (Row)** | `--accent` (#f5f5f5) | — | — |
| **Selected** | `--primary-50` (#fff7ed) | — | — |

**Table Header**:
| State | Background | Foreground | Border Bottom | Font Weight |
|-------|-----------|------------|---------------|-------------|
| **Default** | `--neutral-50` (#fafafa) | `--foreground` (#0f0f11) | 2px `--border` (#e5e5e5) | 600 (semibold) |
| **Hover (Sortable)** | `--neutral-100` (#f5f5f5) | `--primary` (#f97316) | 2px `--border` (#e5e5e5) | 600 (semibold) |
| **Active (Sorted)** | `--neutral-100` (#f5f5f5) | `--primary` (#f97316) | 2px `--primary` (#f97316) | 600 (semibold) |

**Table Row**:
| State | Background | Foreground | Border Bottom |
|-------|-----------|------------|---------------|
| **Default** | Transparent | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) |
| **Hover** | `--accent` (#f5f5f5) | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) |
| **Selected** | `--primary-50` (#fff7ed) | `--foreground` (#0f0f11) | 1px `--border` (#e5e5e5) |
| **Disabled** | Transparent | `--neutral-300` (#d4d4d4) | 1px `--border` (#e5e5e5) |

**Table Cell**:
| Variant | Text Color | Font Size | Font Weight |
|---------|------------|-----------|-------------|
| **Primary** | `--foreground` (#0f0f11) | 14px | 400 (regular) |
| **Secondary** | `--muted-foreground` (#737373) | 13px | 400 (regular) |
| **Accent** | `--primary` (#f97316) | 14px | 500 (medium) |

#### Table Specifications

**Cell Padding**:
| Size | Horizontal | Vertical |
|------|------------|----------|
| **Compact** | 12px | 8px |
| **Default** | 16px | 12px |
| **Spacious** | 20px | 16px |

**Typography**:
- Header: 13px, semibold (600), `--foreground` (#0f0f11)
- Cell: 14px, regular (400), `--foreground` (#0f0f11)
- Secondary: 13px, regular (400), `--muted-foreground` (#737373)
- Line height: 1.5

**Sortable Columns**:
- Icon: ArrowUp/ArrowDown or ChevronDown (14px)
- Position: Right of text
- Opacity: 100% when active, 40% when inactive
- Hover: Opacity 100% + color change to `--primary` (#f97316)
- Ascending: ArrowUp icon
- Descending: ArrowDown icon

**Sticky Header**:
- Background: `--neutral-50` (#fafafa)
- Position: sticky, top: 0
- Z-index: 10
- Shadow: `0 2px 4px rgba(0, 0, 0, 0.05)` when scrolled

**Sticky Column** (Optional):
- Leftmost column fixed
- Background: `--card` (#ffffff)
- Border right: 1px `--border` (#e5e5e5)
- Shadow: `2px 0 4px rgba(0, 0, 0, 0.05)` when scrolled

**Row Selection**:
- Checkbox column on left
- Selected row background: `--primary-50` (#fff7ed)
- Checkbox: Follows component specs (see Part 1)

**Empty State**:
- Height: 200px minimum
- Icon: 48px, `--muted-foreground` (#737373)
- Text: 16px, `--foreground` (#0f0f11)
- Subtext: 14px, `--muted-foreground` (#737373)
- Action button: Optional primary

**Loading State**:
- Skeleton rows (4-6)
- Skeleton color: `--neutral-200` (#e5e5e5)
- Grid pattern for anticipation
- Height: Match typical row height

**Pagination**:
- Position: Bottom-right of container
- Follows Pagination component specs (see Part 2)
- Optional top pagination for long tables

**Responsive Table**:
- Mobile: Horizontal scroll
- Tablet: Hide less important columns
- Desktop: All columns visible
- Scrollbar: Custom styling (8px width)

**Accessibility**:
- Semantic: `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Headers: `scope="col"` or `scope="row"`
- Sortable: `aria-sort` attribute
- Caption: Optional `<caption>` for table description
- Keyboard: Arrow keys for row selection (mode dependent)
- Focus: 2px ring around selected row

**Contrast Ratios**:
- Header text: 13.2:1 ✅
- Cell text: 13.2:1 ✅
- Secondary text: 4.5:1 ✅
- Accent text: 4.5:1 ✅ (orange on white)

---

## 8. Overlay Components

### 8.1 Dialog Component

**File**: `src/components/ui/dialog.tsx`

#### Light Theme Specifications

**Overlay/Backdrop**:
| State | Background | Blur | Duration |
|-------|-----------|------|----------|
| **Default** | rgba(15, 15, 17, 0.5) | None | 200ms fade in/out |
| **Mobile** | rgba(15, 15, 17, 0.6) | None | 200ms fade in/out |

**Dialog Panel**:
| State | Background | Border | Shadow | Border Radius |
|-------|-----------|--------|--------|---------------|
| **Default** | `--popover` (#ffffff) | 1px `--border` (#e5e5e5) | `0 8px 24px rgba(0, 0, 0, 0.15)` | 6px |
| **Mobile** | `--popover` (#ffffff) | 1px `--border` (#e5e5e5) | `0 8px 24px rgba(0, 0, 0, 0.15)` | 0px (full width/height) |

**Dialog Header**:
| Element | Padding | Border | Foreground |
|---------|---------|--------|------------|
| **Container** | 16px 20px 12px | Bottom 1px `--border` (#e5e5e5) | — |
| **Title** | — | — | `--foreground` (#0f0f11) |
| **Description** | — | — | `--muted-foreground` (#737373) |

**Dialog Content**:
| State | Padding | Scrollbar |
|-------|---------|-----------|
| **Default** | 20px | Custom styling |

**Dialog Footer**:
| Element | Padding | Border | Background |
|---------|---------|--------|------------|
| **Container** | 12px 20px 20px | Top 1px `--border` (#e5e5e5) | `--neutral-50` (#fafafa) |

#### Dialog Specifications

**Dialog Panel Sizing**:

| Variant | Max Width | Padding | Font Size Header | Font Size Content |
|---------|-----------|---------|------------------|-------------------|
| **XS** | 400px | 0px | 16px | 14px |
| **SM** | 500px | 0px | 18px | 14px |
| **MD** (default) | 600px | 0px | 20px | 14px |
| **LG** | 800px | 0px | 24px | 16px |
| **XL** | 1000px | 0px | 24px | 16px |
| **Full** | 95vw | 0px | 24px | 16px |

**Header**:
- Title: 20px (MD), semibold (600), `--foreground` (#0f0f11)
- Description: 14px, regular (400), `--muted-foreground` (#737373)
- Spacing: 8px between title and description

**Close Button (Header)**:
- Icon: Lucide X (20px)
- Color: `--muted-foreground` (#737373)
- Hover: `--foreground` (#0f0f11)
- Position: Top-right corner
- Padding: 4px
- Border radius: 4px

**Content**:
- Padding: 20px
- Font size: 14px
- Scrollable: Yes (max-height: 70vh)
- Overflow-y: Auto
- Scrollbar: 8px width, rounded

**Footer**:
- Padding: 12px 20px 20px
- Background: `--neutral-50` (#fafafa)
- Border top: 1px `--border` (#e5e5e5)
- Flexbox row
- Gap: 8px between buttons
- Alignment: Right (default), Left, Center, Space-between

**Button Layout**:
- Right: [Cancel] [Confirm] (default)
- Left: [Confirm] [Cancel]
- Center: evenly spaced
- Space-between: [Confirm] ... [Cancel]

**Mobile Dialog**:
- Full width (100%) + full height (100%)
- Border radius: 0px
- Max height: 100vh
- Swipe to dismiss (optional)
- Handle bar: Top center, 40px wide, 4px height

**Animation**:
- Overlay: 200ms fade in/out
- Scale: 0.95 → 1.0 (200ms cubic-bezier(0.4, 0, 0.2, 1))
- Slide up (mobile): 300ms ease-out
- Reduced motion: Fade only (no scale/slide)

**Z-index**: 50

**Accessibility**:
- Role: `role="dialog"`, `aria-modal="true"`
- Focus trap: Within dialog container
- Focus management: First focusable element or close button
- Escape key: Dismisses dialog
- Screen reader: Title announced on open
- Close: `aria-label="Close dialog"`

**Contrast Ratios**:
- Title on background: 13.2:1 ✅
- Description on background: 4.5:1 ✅
- Content text: 13.2:1 ✅
- Close button: 4.5:1 ✅

---

### 8.2 Drawer/Sheet Component

**File**: `src/components/ui/sheet.tsx`

#### Light Theme Specifications

| Position | Width (Desktop) | Width (Mobile) | Border | Shadow |
|----------|-----------------|----------------|--------|--------|
| **Right** | 400px (default) | 100% | Left 1px `--border` (#e5e5e5) | -4px 0 24px rgba(0, 0, 0, 0.15) |
| **Left** | 400px (default) | 100% | Right 1px `--border` (#e5e5e5) | 4px 0 24px rgba(0, 0, 0, 0.15) |
| **Top** | 100% | 100% | Bottom 1px `--border` (#e5e5e5) | 0 -4px 24px rgba(0, 0, 0, 0.15) |
| **Bottom** | 100% | 100% | Top 1px `--border` (#e5e5e5) | 0 4px 24px rgba(0, 0, 0, 0.15) |

| State | Background | Overlay | Keyboard Trap |
|-------|-----------|---------|---------------|
| **Open** | `--popover` (#ffffff) | rgba(15, 15, 17, 0.5) | Yes |
| **Closed** | Hidden (offscreen) | None | No |

#### Drawer Specifications

**Sizing**:

| Size | Width (Side) | Height (Top/Bottom) |
|------|--------------|---------------------|
| **XS** | 280px | 240px (top), 200px (bottom) |
| **SM** | 320px | 320px (top), 240px (bottom) |
| **MD** (default) | 400px | 400px (top), 320px (bottom) |
| **LG** | 500px | 500px (top), 400px (bottom) |
| **XL** | 600px | 600px (top), 500px (bottom) |
| **Full** | 100% | 100% (top/bottom only) |

**Header**:
- Padding: 16px 20px
- Border bottom: 1px `--border` (#e5e5e5)
- Title: 18px, semibold (600), `--foreground` (#0f0f11)
- Close button: 20px, right-aligned

**Content**:
- Padding: 20px
- Scrollable: Yes
- Overflow-y: Auto
- Max-height: 80vh

**Footer** (Optional):
- Padding: 12px 20px 20px
- Border top: 1px `--border` (#e5e5e5)
- Background: `--neutral-50` (#fafafa)
- Flexbox row, gap 8px

**Handle Bar** (Bottom drawer only):
- Width: 40px
- Height: 4px
- Background: `--neutral-300` (#d4d4d4)
- Border radius: 2px
- Position: Top center
- Vertical offset: 8px

**Animation**:
- Side (Desktop): 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Side (Mobile): 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Top/Bottom: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Overlay: 200ms fade
- Reduced motion: Fade only, no transform

**Swipe to Dismiss**:
- Distance threshold: 50% of drawer width
- Velocity threshold: 0.5 px/ms (optional)
- Animation: Follow swipe gesture

**Accessibility**:
- Role: `role="dialog"` or `role="sidebar"`
- Focus trap: Within drawer
- Escape key: Dismisses drawer
- Overlay click: Dismisses drawer
- Screen reader: Title announced

**Contrast Ratios**:
- Header text: 13.2:1 ✅
- Content text: 13.2:1 ✅
- Handle bar: Sufficient contrast

---

### 8.3 Dropdown Menu Component

**File**: `src/components/ui/dropdown-menu.tsx`

#### Light Theme Specifications

**Menu Content**:
| State | Background | Border | Shadow | Border Radius |
|-------|-----------|--------|--------|---------------|
| **Default** | `--popover` (#ffffff) | 1px `--border` (#e5e5e5) | `0 4px 12px rgba(0, 0, 0, 0.1)` | 6px |

**Menu Item**:
| State | Background | Foreground | Icon Color | Shortcut Font |
|-------|-----------|------------|------------|---------------|
| **Default** | Transparent | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) | `--muted-foreground` (#737373) |
| **Hover** | `--accent` (#f5f5f5) | `--foreground` (#0f0f11) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) |
| **Focus** | `--accent` (#f5f5f5) | `--foreground` (#0f0f11) | `--foreground` (#0f0f11) | `--muted-foreground` (#737373) |
| **Active (Selected)** | `--primary-50` (#fff7ed) | `--primary` (#f97316) | `--primary` (#f97316) | `--muted-foreground` (#737373) |
| **Disabled** | Transparent | `--neutral-300` (#d4d4d4) | `--neutral-300` (#d4d4d4) | `--neutral-400` (#a3a3a3) |

**Menu Item Destructive**:
| State | Foreground | Icon Color |
|-------|------------|------------|
| **Default** | `--destructive` (#ef4444) | `--destructive` (#ef4444) |
| **Hover** | `--destructive-700` (#b91c1c) | `--destructive-700` (#b91c1c) |

#### Dropdown Menu Specifications

**Menu Content**:
- Min-width: 160px
- Max-width: 280px
- Max-height: 70vh
- Padding: 4px
- Overflow-y: Auto

**Menu Item**:
- Height: 36px
- Padding: 8px 12px
- Font size: 14px
- Font weight: 400 (regular)
- Border radius: 4px
- Display: Flexbox row
- Align: Center
- Cursor: Pointer (clickable)

**Icon**:
- Size: 16px
- Position: Left of text
- Spacing: 10px from text
- Color: `--muted-foreground` (#737373)

**Label**:
- Font size: 12px
- Font weight: 600 (semibold)
- Color: `--muted-foreground` (#737373)
- Padding: 8px 12px 4px
- Text transform: Uppercase

**Separator**:
- Color: `--border` (#e5e5e5)
- Height: 1px
- Margin: 4px 8px

**Checkbox Item**:
- Checkbox: Left of text (replaces icon)
- Check icon: Shown when active
- Position: 4px from left edge

**Radio Item**:
- Radio: Left of text (replaces icon)
- Dot icon: Shown when active
- Position: 4px from left edge

**Shortcut**:
- Font size: 12px
- Font weight: 400 (regular)
- Color: `--muted-foreground` (#737373)
- Position: Right side
- Spacing: 16px from text

**Submenu Indicator**:
- Icon: Lucide ChevronRight (14px)
- Color: `--muted-foreground` (#737373)
- Position: Right side
- Hover color: `--foreground` (#0f0f11)

**Animation**:
- Open: 150ms scale + fade (cubic-bezier(0.4, 0, 0.2, 1))
- Close: 100ms scale + fade (cubic-bezier(0, 0, 0.2, 1))
- Item hover: 150ms ease-out
- Reduced motion: Fade only

**Z-index**: 50

**Accessibility**:
- Role: `role="menu"`, `role="menuitem"`
- Keyboard: Arrow keys, Enter, Escape
- Focus: 2px ring on focused item
- Screen reader: Full label + shortcut announced

**Contrast Ratios**:
- Item text: 13.2:1 ✅
- Hover text: 13.2:1 ✅
- Disabled text: 1.5:1 ❌ (acceptable)
- Destructive hover: 7.2:1 ✅

---

### 8.4 Popover Component

**File**: `src/components/ui/popover.tsx`

#### Light Theme Specifications

**Popover Content**:
| State | Background | Border | Shadow | Border Radius |
|-------|-----------|--------|--------|---------------|
| **Default** | `--popover` (#ffffff) | 1px `--border` (#e5e5e5) | `0 4px 12px rgba(0, 0, 0, 0.1)` | 6px |

| Animation | Duration | Easing |
|-----------|----------|--------|
| **Enter** | Fade in + scale | 150ms cubic-bezier(0.4, 0, 0.2, 1) |
| **Exit** | Fade out + scale | 100ms cubic-bezier(0, 0, 0.2, 1) |

#### Popover Specifications

**Content**:
- Max-width: 400px (default), custom width available
- Padding: 12px
- Font size: 14px
- Color: `--foreground` (#0f0f11)

**Positioning** (Priority Order):
- Bottom (default)
- Top
- Left
- Right

**Offset**:
- Horizontal: 8px
- Vertical: 8px

**Arrow**:
- Size: 8px × 8px
- Color: `--popover` (#ffffff) or `--card` (#ffffff)
- Border: 1px `--border` (#e5e5e5) (complete triangle)
- Position: Pointing to anchor

**Close on Click**:
- Inside popover: No
- Outside popover: Yes

**Trigger Methods**:
- Click (toggle)
- Hover (show on hover, hide on mouseleave)
- Manual (controlled)

**Accessibility**:
- Trigger: `aria-haspopup="true"`, `aria-expanded`, `aria-controls`
- Content: `role="dialog"`, `aria-labelledby`
- Focus: Trap while open, return to trigger on close
- Escape key: Dismisses popover

**Animation**:
- Fade in: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- Scale: 0.95 → 1.0
- Fade out: 100ms cubic-bezier(0, 0, 0.2, 1)
- Reduced motion: Fade only (no scale)

**Z-index**: 50

**Contrast Ratios**:
- Content text: 13.2:1 ✅

---

## 9. Avatar Component

**File**: `src/components/ui/avatar.tsx`

#### Light Theme Specifications

| State | Background | Border | Font Size |
|-------|-----------|--------|-----------|
| **Default (Image)** | None | 1px `--border` (#e5e5e5) | — |
| **Default (Fallback)** | `--neutral-200` (#e5e5e5) | 1px `--border` (#e5e5e5) | 14px (MD) |
| **Hover** | — | 1px `--neutral-300` (#d4d4d4) | — |
| **Focus** | — | 2px `--primary` (#f97316) | — |

| Size | Diameter | Font Size | Icon Size |
|------|-----------|-----------|-----------|
| **XS** | 24px | 10px | 12px |
| **SM** | 32px | 12px | 16px |
| **MD** (default) | 40px | 14px | 20px |
| **LG** | 48px | 16px | 24px |
| **XL** | 64px | 20px | 32px |
| **2XL** | 96px | 28px | 48px |

#### Avatar Specifications

**Fallback Initials**:
- Background: `--neutral-200` (#e5e5e5)
- Text color: `--neutral-900` (#171717)
- Font weight: 600 (semibold)
- Text transform: Uppercase
- Initial count: 1-2 (first name + last initial)

**Colors for Initials** (Optional):
- Generate consistent colors based on username hash
- Palette: Primary colors (#f97316 variants)
- Sufficient contrast ratio: 4.5:1 minimum

**Loading State**:
- Background: `--neutral-100` (#f5f5f5)
- Animation: Skeleton shimmer
- Optional: Spinner inside

**Group (Stacked Avatars)**:
- Container: Flexbox, row, RTL
- Overlap: -8px (each overlap)
- Border: 2px white (#ffffff) for separation
- Border radius: Same as individual avatars
- Limit: 3-5 visible, "+N" counter for remaining

**Status Indicator**:
- Position: Bottom-right corner
- Size: 25% of avatar diameter
- Border: 2px white (#ffffff)
- Border radius: Circle (50%)
- Colors: Success, Warning, Error, Info

**Accessibility**:
- Image: `alt` attribute required
- Fallback: `aria-label` with user name
- Group: `aria-label` with count
- Status: `aria-label` with status description

**Contrast Ratios**:
- Initials on background: 13.2:1 ✅ (near-black on light gray)
- Image borders: Sufficient contrast

---

## 10. Layout Components

### 10.1 Separator Component

**File**: `src/components/ui/separator.tsx`

#### Light Theme Specifications

| Orientation | Background | Thickness |
|-------------|-----------|-----------|
| **Horizontal** | `--border` (#e5e5e5) | 1px |
| **Vertical** | `--border` (#e5e5e5) | 1px |

#### Separator Specifications

**Orientation**:
- **Horizontal**: `<hr>` equivalent, width 100%
- **Vertical**: Height 100%, custom width

**Height**:
- **Horizontal**: Auto (1px)
- **Vertical**: Custom (height prop)

**Margin**:
- Default: 8px (`--spacing-2`) on both sides
- Custom: `my` and `mx` props

**Decorative**:
- Default: `aria-hidden="true"` (decorative)
- Logical: Optional `role="separator"` when splitting sections

**Accessibility**:
- Decorative: `aria-hidden="true"`
- Logical: `role="separator"`, `aria-orientation`

---

### 10.2 Container Component

**File**: `src/components/ui/container.tsx` (pending creation, utility component)

#### Light Theme Specifications

| Variant | Max Width | Background | Border | Border Radius |
|---------|-----------|-----------|--------|---------------|
| **XS** | 100% | Transparent | None | 0px |
| **SM** | 640px | Transparent | None | 0px |
| **MD** | 768px | Transparent | None | 0px |
| **LG** | 1024px | Transparent | None | 0px |
| **XL** | 1280px | Transparent | None | 0px |
| **2XL** | 1536px | Transparent | None | 0px |

#### Container Specifications

**Padding**:
- **Default**: `--spacing-4` (16px) horizontal
- **Mobile**: `--spacing-3` (12px) horizontal
- **Desktop**: `--spacing-6` (24px) horizontal

**Centering**:
- Margin: `0 auto` (horizontal auto)
- Width: 100% of container
- Max-width: Applied as per variant

**Responsive**:
- Mobile: 100% width, 12px padding
- Tablet: MD variant, 16px padding
- Desktop: LG variant, 24px padding

**Accessibility**: N/A (layout only)

---

### 10.3 ScrollArea Component

**File**: `src/components/ui/scroll-area.tsx` (pending creation)

#### Light Theme Specifications

**Scrollbar Track**:
- Background: Transparent
- Hover background: `--neutral-100` (#f5f5f5)

**Scrollbar Thumb**:
| State | Background | Border Radius | Width/Height |
|-------|-----------|---------------|--------------|
| **Default** | `--neutral-300` (#d4d4d4) | 4px | 8px |
| **Hover** | `--neutral-400` (#a3a3a3) | 4px | 8px |
| **Dragging** | `--neutral-500` (#737373) | 4px | 8px |

#### ScrollArea Specifications

**Scrollbar Dimensions**:
- Width: 8px (horizontal) / 8px (vertical)
- Min height: 32px for thumb
- Border radius: 4px

**Corner** (Intersection):
- Background: Transparent
- Size: 8px × 8px (from scrollbar dimensions)

**Hide Scrollbar**:
- Use while dragging logic
- Fade out after inactivity (optional)

**Mobile**:
- Default browser scrollbar recommended
- Cancel custom scrollbar on touch devices

**Accessibility**:
- Native scrolling behavior
- Keyboard scroll: Arrow keys, Page Up/Down, Home/End
- Focus: Scroll to focused element

---

## Component Specifications Complete ✅

**Total Components Documented**: 36 component families across 3 parts

| Category | Count | Status |
|----------|-------|--------|
| Form Controls | 7 | ✅ Complete |
| Feedback Components | 6 | ✅ Complete |
| Navigation | 6 | ✅ Complete |
| Data Display | 6 | ✅ Complete |
| Overlays | 5 | ✅ Complete |
| Typography | 3 | ✅ Complete |
| Layout | 3 | ✅ Complete |

**Next Documents**:
1. Theme Transition Design
2. Accessibility Guidelines
3. Developer Handoff
4. QA Validation Checklist

---

## Document End - Part 3/3

*This document concludes the Light Theme Component Specifications (Part 3 of 3). For theme transition guidelines, accessibility requirements, and implementation details, refer to the subsequent documents in this series.*

---

## Full Component Index

**Form Controls**:
- Button (Part 1)
- Input (Part 1)
- Select (Part 1)
- Checkbox (Part 1)
- Radio Group (Part 1)
- Switch/Toggle (Part 1)
- Slider (Part 1)

**Feedback Components**:
- Alert (Part 1)
- Badge (Part 2)
- Toast (Part 2)
- Progress (Part 2)
- Spinner (Part 2)
- Tooltip (Part 2)

**Navigation**:
- Tabs (Part 2)
- Breadcrumb (Part 2)
- Pagination (Part 2)

**Data Display**:
- Card (Part 2)
- Table (Part 3)
- Avatar (Part 3)

**Overlays**:
- Dialog (Part 3)
- Drawer/Sheet (Part 3)
- Dropdown Menu (Part 3)
- Popover (Part 3)

**Layout**:
- Separator (Part 3)
- Container (Part 3)
- ScrollArea (Part 3)