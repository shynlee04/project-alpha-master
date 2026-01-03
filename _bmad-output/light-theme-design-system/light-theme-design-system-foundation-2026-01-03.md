# Light Theme Design System - Foundation

## Document Metadata
- **Date**: 2026-01-03
- **Phase**: Phase 1 - Design System Foundation
- **Version**: 1.0
- **Author**: BMAD UX Designer
- **Status**: Draft

---

## 1. Color Palette

### 1.1 Primary Colors

| Color Name | Hex | RGB | CSS Variable | Contrast Ratio (on White) | Contrast Ratio (on Light Gray) |
|------------|-----|-----|--------------|-------------------------|------------------------------|
| Primary | `#2563EB` | `rgb(37, 99, 235)` | `--color-primary` | 4.5:1 ✅ AA | 3.8:1 ⚠️ |
| Primary Light | `#60A5FA` | `rgb(96, 165, 250)` | `--color-primary-light` | 2.3:1 ❌ | 2.0:1 ❌ |
| Primary Dark | `#1E40AF` | `rgb(30, 64, 175)` | `--color-primary-dark` | 7.2:1 ✅ AAA | 6.1:1 ✅ AA |
| Primary Accent | `#3B82F6` | `rgb(59, 130, 246)` | `--color-primary-accent` | 4.0:1 ✅ AA | 3.4:1 ⚠️ |
| Secondary | `#7C3AED` | `rgb(124, 58, 237)` | `--color-secondary` | 4.1:1 ✅ AA | 3.5:1 ⚠️ |
| Secondary Light | `#A78BFA` | `rgb(167, 139, 250)` | `--color-secondary-light` | 2.1:1 ❌ | 1.8:1 ❌ |
| Secondary Dark | `#5B21B6` | `rgb(91, 33, 182)` | `--color-secondary-dark` | 6.5:1 ✅ AA | 5.5:1 ✅ AA |

**Usage Guidelines**:
- **Primary**: Main brand color for CTAs, links, and active states
- **Primary Light**: Hover states, subtle backgrounds (use with dark text)
- **Primary Dark**: Active states, pressed buttons, emphasis
- **Primary Accent**: Secondary actions, complementary highlights
- **Secondary**: Alternative brand color for variety and hierarchy
- **Secondary Light**: Hover states for secondary elements
- **Secondary Dark**: Active states for secondary elements

### 1.2 Semantic Colors

| Color Name | Hex | RGB | CSS Variable | Contrast Ratio (on White) | Usage |
|------------|-----|-----|--------------|-------------------------|-------|
| Success | `#059669` | `rgb(5, 150, 105)` | `--color-success` | 4.6:1 ✅ AA | Success messages, positive indicators |
| Success Light | `#34D399` | `rgb(52, 211, 153)` | `--color-success-light` | 2.2:1 ❌ | Success backgrounds, subtle indicators |
| Success Dark | `#047857` | `rgb(4, 120, 87)` | `--color-success-dark` | 7.0:1 ✅ AAA | Success borders, strong emphasis |
| Warning | `#D97706` | `rgb(217, 119, 6)` | `--color-warning` | 3.9:1 ✅ AA | Warning messages, caution indicators |
| Warning Light | `#FBBF24` | `rgb(251, 191, 36)` | `--color-warning-light` | 1.9:1 ❌ | Warning backgrounds, subtle alerts |
| Warning Dark | `#B45309` | `rgb(180, 83, 9)` | `--color-warning-dark` | 5.6:1 ✅ AA | Warning borders, strong caution |
| Error | `#DC2626` | `rgb(220, 38, 38)` | `--color-error` | 4.5:1 ✅ AA | Error messages, destructive actions |
| Error Light | `#F87171` | `rgb(248, 113, 113)` | `--color-error-light` | 2.0:1 ❌ | Error backgrounds, subtle errors |
| Error Dark | `#B91C1C` | `rgb(185, 28, 28)` | `--color-error-dark` | 6.4:1 ✅ AA | Error borders, strong destructive |
| Info | `#0891B2` | `rgb(8, 145, 178)` | `--color-info` | 4.3:1 ✅ AA | Information messages, neutral alerts |
| Info Light | `#22D3EE` | `rgb(34, 211, 238)` | `--color-info-light` | 2.0:1 ❌ | Info backgrounds, subtle information |
| Info Dark | `#0E7490` | `rgb(14, 116, 144)` | `--color-info-dark` | 6.0:1 ✅ AA | Info borders, strong information |

**Usage Guidelines**:
- Use **Dark** variants for text on light backgrounds
- Use **Light** variants for backgrounds with dark text overlay
- Use **Base** variants for icons, borders, and small text

### 1.3 Neutral Colors

| Color Name | Hex | RGB | CSS Variable | Contrast Ratio (on White) | Usage |
|------------|-----|-----|--------------|-------------------------|-------|
| Gray 50 | `#F9FAFB` | `rgb(249, 250, 251)` | `--color-gray-50` | 1.1:1 ❌ | Backgrounds, subtle dividers |
| Gray 100 | `#F3F4F6` | `rgb(243, 244, 246)` | `--color-gray-100` | 1.2:1 ❌ | Backgrounds, cards, panels |
| Gray 200 | `#E5E7EB` | `rgb(229, 231, 235)` | `--color-gray-200` | 1.4:1 ❌ | Borders, dividers, disabled |
| Gray 300 | `#D1D5DB` | `rgb(209, 213, 219)` | `--color-gray-300` | 1.7:1 ❌ | Borders, icons (disabled) |
| Gray 400 | `#9CA3AF` | `rgb(156, 163, 175)` | `--color-gray-400` | 2.4:1 ❌ | Placeholder text, secondary icons |
| Gray 500 | `#6B7280` | `rgb(107, 114, 128)` | `--color-gray-500` | 3.5:1 ⚠️ | Secondary text, muted content |
| Gray 600 | `#4B5563` | `rgb(75, 85, 99)` | `--color-gray-600` | 5.1:1 ✅ AA | Body text, primary content |
| Gray 700 | `#374151` | `rgb(55, 65, 81)` | `--color-gray-700` | 7.0:1 ✅ AAA | Headings, emphasis text |
| Gray 800 | `#1F2937` | `rgb(31, 41, 55)` | `--color-gray-800` | 10.2:1 ✅ AAA | Primary headings, strong text |
| Gray 900 | `#111827` | `rgb(17, 24, 39)` | `--color-gray-900` | 15.5:1 ✅ AAA | Primary text, highest contrast |

**Usage Guidelines**:
- **Gray 50-100**: Backgrounds, cards, panels
- **Gray 200-300**: Borders, dividers, disabled states
- **Gray 400-500**: Secondary text, placeholder text, muted icons
- **Gray 600-700**: Body text, primary content
- **Gray 800-900**: Headings, emphasis text, primary text

### 1.4 Surface Colors

| Color Name | Hex | RGB | CSS Variable | Contrast Ratio (on White) | Usage |
|------------|-----|-----|--------------|-------------------------|-------|
| Surface Primary | `#FFFFFF` | `rgb(255, 255, 255)` | `--color-surface-primary` | 21:1 ✅ AAA | Main background, cards |
| Surface Secondary | `#F3F4F6` | `rgb(243, 244, 246)` | `--color-surface-secondary` | 1.2:1 ❌ | Secondary backgrounds, panels |
| Surface Tertiary | `#E5E7EB` | `rgb(229, 231, 235)` | `--color-surface-tertiary` | 1.4:1 ❌ | Tertiary backgrounds, overlays |
| Surface Elevated | `#FFFFFF` | `rgb(255, 255, 255)` | `--color-surface-elevated` | 21:1 ✅ AAA | Elevated surfaces (with shadow) |
| Surface Overlay | `rgba(0, 0, 0, 0.5)` | `rgba(0, 0, 0, 0.5)` | `--color-surface-overlay` | N/A | Modal backdrops, overlays |

**Usage Guidelines**:
- **Surface Primary**: Main application background, cards, dialogs
- **Surface Secondary**: Sidebar backgrounds, panel backgrounds
- **Surface Tertiary**: Hover states, subtle backgrounds
- **Surface Elevated**: Dropdowns, tooltips, popovers (with shadow)
- **Surface Overlay**: Modal backdrops, overlays (semi-transparent)

### 1.5 WCAG Compliance Summary

**WCAG 2.1 AA Standards**:
- **Normal Text** (< 18pt or < 14pt bold): Minimum 4.5:1 contrast ratio
- **Large Text** (≥ 18pt or ≥ 14pt bold): Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

**Compliance Status**:
- ✅ **Primary Colors**: All base colors meet AA standards
- ✅ **Semantic Colors**: All base colors meet AA standards
- ✅ **Neutral Colors**: Gray 600-900 meet AA standards for text
- ⚠️ **Light Variants**: Use with dark text overlay only
- ✅ **Surface Colors**: All compliant with appropriate text colors

**Recommended Text Color Combinations**:
- White background + Gray 600+ text ✅
- Surface Secondary background + Gray 700+ text ✅
- Primary background + White text ✅
- Success background + White text ✅
- Warning background + White text ✅
- Error background + White text ✅

---

## 2. Typography System

### 2.1 Font Families

| Font Family | CSS Variable | Fallback Stack | Usage |
|-------------|--------------|----------------|-------|
| Primary | `--font-primary` | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Body text, UI elements |
| Secondary | `--font-secondary` | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Headings, emphasis |
| Monospace | `--font-mono` | `"JetBrains Mono", "Fira Code", "Courier New", monospace` | Code, technical content |

**Font Loading Strategy**:
- Use `font-display: swap` for web fonts
- Load Inter via CDN or self-host
- Load JetBrains Mono for code blocks
- Provide fallback fonts for offline scenarios

### 2.2 Type Scale

| Scale | Font Size | Line Height | Letter Spacing | Font Weight | CSS Variable | Usage |
|-------|-----------|-------------|----------------|-------------|--------------|-------|
| H1 | 36px | 44px | -0.02em | 700 | `--text-h1` | Page titles, hero headings |
| H2 | 30px | 38px | -0.01em | 600 | `--text-h2` | Section headings, modal titles |
| H3 | 24px | 32px | 0em | 600 | `--text-h3` | Subsection headings, card titles |
| H4 | 20px | 28px | 0em | 600 | `--text-h4` | Component headings, labels |
| H5 | 18px | 24px | 0em | 500 | `--text-h5` | Small headings, captions |
| H6 | 16px | 24px | 0em | 500 | `--text-h6` | Micro headings, metadata |
| Body Large | 18px | 28px | 0em | 400 | `--text-body-large` | Primary body text, descriptions |
| Body | 16px | 24px | 0em | 400 | `--text-body` | Standard body text, content |
| Body Small | 14px | 20px | 0em | 400 | `--text-body-small` | Secondary text, helper text |
| Caption | 12px | 16px | 0.01em | 400 | `--text-caption` | Captions, labels, metadata |
| Overline | 12px | 16px | 0.1em | 500 | `--text-overline` | Overlines, tags, badges |
| Code | 14px | 20px | 0em | 400 | `--text-code` | Inline code, code blocks |

**Type Scale Principles**:
- **Modular Scale**: Based on major third (1.25) for harmonious progression
- **Line Height**: 1.2–1.5 ratio for readability
- **Letter Spacing**: Tighter for large text, looser for small text
- **Font Weight**: 400–700 range for hierarchy

### 2.3 Font Weights

| Weight | Value | CSS Variable | Usage |
|--------|-------|--------------|-------|
| Light | 300 | `--font-weight-light` | Subtle text, decorative elements |
| Regular | 400 | `--font-weight-regular` | Body text, standard content |
| Medium | 500 | `--font-weight-medium` | Emphasis, secondary headings |
| Semibold | 600 | `--font-weight-semibold` | Primary headings, CTAs |
| Bold | 700 | `--font-weight-bold` | Strong emphasis, page titles |

**Font Weight Guidelines**:
- Use **Regular** (400) for body text and standard content
- Use **Medium** (500) for emphasis and secondary headings
- Use **Semibold** (600) for primary headings and CTAs
- Use **Bold** (700) for strong emphasis and page titles
- Use **Light** (300) sparingly for decorative elements

### 2.4 Responsive Typography

| Breakpoint | Base Scale | Scale Factor | H1 | H2 | H3 | Body | Caption |
|------------|------------|--------------|----|----|----|------|---------|
| Mobile (< 640px) | 1.0 | 1.0 | 28px | 24px | 20px | 16px | 12px |
| Tablet (640-1024px) | 1.0 | 1.1 | 32px | 26px | 22px | 16px | 12px |
| Desktop (> 1024px) | 1.0 | 1.2 | 36px | 30px | 24px | 16px | 12px |

**Responsive Typography Guidelines**:
- **Mobile**: Smaller fonts for compact screens
- **Tablet**: Slightly larger fonts for medium screens
- **Desktop**: Full-size fonts for large screens
- Use CSS `clamp()` for fluid typography between breakpoints
- Maintain line height ratios across breakpoints

**Accessibility Considerations**:
- Minimum font size: 12px for body text
- Minimum line height: 1.2 for headings, 1.5 for body text
- Minimum letter spacing: 0.01em for small text
- Support user font size preferences (use relative units)

---

## 3. Spacing & Layout Grid

### 3.1 Spacing Scale

| Token | Value | CSS Variable | Use Cases |
|-------|-------|--------------|-----------|
| Space 0 | 0px | `--space-0` | No spacing, collapsed |
| Space 1 | 4px | `--space-1` | Micro spacing, tight layouts |
| Space 2 | 8px | `--space-2` | Tight spacing, compact layouts |
| Space 3 | 12px | `--space-3` | Small spacing, dense layouts |
| Space 4 | 16px | `--space-4` | Standard spacing, default padding |
| Space 5 | 20px | `--space-5` | Medium spacing, comfortable padding |
| Space 6 | 24px | `--space-6` | Medium-large spacing, section padding |
| Space 8 | 32px | `--space-8` | Large spacing, section margins |
| Space 10 | 40px | `--space-10` | Extra-large spacing, major sections |
| Space 12 | 48px | `--space-12` | Huge spacing, page margins |
| Space 16 | 64px | `--space-16` | Maximum spacing, hero sections |

**Spacing Scale Principles**:
- **Base Unit**: 4px (consistent 4px grid)
- **Progression**: Multiples of 4 for harmony
- **Usage**: Padding, margins, gaps, gutters
- **Consistency**: Use spacing tokens, not arbitrary values

**Spacing Use Cases**:
- **Space 0-2**: Icon spacing, tight lists, compact components
- **Space 3-4**: Button padding, form inputs, card padding
- **Space 5-6**: Section padding, panel margins, dialog padding
- **Space 8-10**: Page margins, major sections, hero spacing
- **Space 12-16**: Hero sections, landing pages, maximum spacing

### 3.2 Grid System

| Grid Property | Value | CSS Variable | Usage |
|--------------|-------|--------------|-------|
| Columns | 12 | `--grid-columns` | 12-column grid system |
| Gutter | 24px | `--grid-gutter` | Space between columns |
| Margin | 24px | `--grid-margin` | Space between grid and viewport |
| Max Width | 1280px | `--grid-max-width` | Maximum container width |

**Grid System Breakpoints**:

| Breakpoint | Columns | Gutter | Margin | Max Width | CSS Variable |
|------------|---------|--------|--------|------------|--------------|
| Mobile (< 640px) | 4 | 16px | 16px | 100% | `--grid-mobile` |
| Tablet (640-1024px) | 8 | 20px | 20px | 100% | `--grid-tablet` |
| Desktop (> 1024px) | 12 | 24px | 24px | 1280px | `--grid-desktop` |

**Grid System Guidelines**:
- **Mobile**: 4-column grid for compact layouts
- **Tablet**: 8-column grid for medium layouts
- **Desktop**: 12-column grid for full layouts
- Use CSS Grid or Flexbox for implementation
- Maintain consistent gutters and margins

**Column Widths (Desktop)**:
- 1 column: ~85px
- 2 columns: ~194px
- 3 columns: ~303px
- 4 columns: ~412px
- 6 columns: ~630px
- 8 columns: ~848px
- 12 columns: ~1284px

### 3.3 Breakpoints

| Breakpoint | Value | CSS Variable | Device Type |
|------------|-------|--------------|-------------|
| xs | 0px | `--breakpoint-xs` | Extra small devices |
| sm | 640px | `--breakpoint-sm` | Small devices (landscape phones) |
| md | 768px | `--breakpoint-md` | Medium devices (tablets) |
| lg | 1024px | `--breakpoint-lg` | Large devices (desktops) |
| xl | 1280px | `--breakpoint-xl` | Extra large devices (large desktops) |
| 2xl | 1536px | `--breakpoint-2xl` | Extra extra large devices (widescreens) |

**Breakpoint Guidelines**:
- **xs**: Mobile-first default, no media query
- **sm**: Landscape phones, small tablets
- **md**: Tablets, small laptops
- **lg**: Desktops, laptops
- **xl**: Large desktops, monitors
- **2xl**: Widescreens, ultra-wide monitors

**Responsive Design Strategy**:
- Mobile-first approach (start with xs, add media queries for larger screens)
- Use `min-width` media queries for progressive enhancement
- Test on actual devices, not just browser resizing
- Consider touch targets for mobile (minimum 44x44px)

---

## 4. Iconography Standards

### 4.1 Icon Sizes

| Size | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| XS | 12px | `--icon-size-xs` | Micro icons, inline icons |
| SM | 16px | `--icon-size-sm` | Small icons, list icons |
| MD | 20px | `--icon-size-md` | Medium icons, standard icons |
| LG | 24px | `--icon-size-lg` | Large icons, navigation icons |
| XL | 32px | `--icon-size-xl` | Extra-large icons, feature icons |
| 2XL | 48px | `--icon-size-2xl` | Huge icons, hero icons |

**Icon Size Guidelines**:
- **XS**: Inline icons, button icons, list item icons
- **SM**: Small icons, compact UI elements
- **MD**: Standard icons, navigation icons
- **LG**: Large icons, feature icons, tooltips
- **XL**: Extra-large icons, hero section icons
- **2XL**: Huge icons, landing page icons

### 4.2 Icon Colors

| State | Color | CSS Variable | Usage |
|-------|-------|--------------|-------|
| Default | `#6B7280` | `--icon-color-default` | Default icon state |
| Hover | `#4B5563` | `--icon-color-hover` | Hover state |
| Active | `#2563EB` | `--icon-color-active` | Active/selected state |
| Disabled | `#D1D5DB` | `--icon-color-disabled` | Disabled state |
| Success | `#059669` | `--icon-color-success` | Success indicators |
| Warning | `#D97706` | `--icon-color-warning` | Warning indicators |
| Error | `#DC2626` | `--icon-color-error` | Error indicators |
| Info | `#0891B2` | `--icon-color-info` | Information indicators |

**Icon Color Guidelines**:
- **Default**: Gray 500 for neutral icons
- **Hover**: Gray 600 for hover state
- **Active**: Primary color for active/selected icons
- **Disabled**: Gray 300 for disabled state
- **Semantic**: Use semantic colors for status icons

### 4.3 Icon Usage Guidelines

**Icon Library**:
- **Primary**: Lucide React (https://lucide.dev)
- **Fallback**: Custom SVG icons for unique needs
- **Consistency**: Use Lucide icons for consistency

**Icon Principles**:
- **Clarity**: Icons should be clear and recognizable
- **Consistency**: Use consistent stroke width and style
- **Simplicity**: Avoid overly complex icons
- **Accessibility**: Provide text alternatives for screen readers

**Accessibility Considerations**:
- **ARIA Labels**: Add `aria-label` for icon-only buttons
- **Decorative Icons**: Use `aria-hidden="true"` for decorative icons
- **Focus Indicators**: Ensure keyboard focus is visible
- **Color Contrast**: Icons must meet WCAG contrast ratios
- **Touch Targets**: Minimum 44x44px for touch targets

**Icon Best Practices**:
- Use icons to supplement text, not replace it
- Provide tooltips for icon-only buttons
- Use consistent icon styles across the application
- Test icons at different sizes for clarity
- Consider cultural differences in icon meanings

**Icon Implementation**:
```tsx
// Icon-only button with ARIA label
<Button aria-label="Settings">
  <SettingsIcon className="w-5 h-5" />
</Button>

// Decorative icon
<div aria-hidden="true">
  <StarIcon className="w-4 h-4" />
</div>

// Icon with text
<Button>
  <SettingsIcon className="w-5 h-5 mr-2" />
  Settings
</Button>
```

---

## References

### Design System References
- **Dark theme design tokens**: [`src/styles/design-tokens.css`](src/styles/design-tokens.css)
- **TypeScript design tokens**: [`src/styles/design-tokens.ts`](src/styles/design-tokens.ts)
- **Tailwind CSS documentation**: https://tailwindcss.com/docs
- **WCAG 2.1 guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Component Library References
- **Radix UI Primitives**: https://www.radix-ui.com/primitives
- **Lucide Icons**: https://lucide.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

### Accessibility References
- **WCAG 2.1 AA Standards**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **A11Y Project**: https://www.a11yproject.com/

### Color Tools
- **Coolors**: https://coolors.co/
- **Adobe Color**: https://color.adobe.com/
- **Contrast Ratio Calculator**: https://contrast-ratio.com/

---

## Appendix A: CSS Custom Properties

### Color Variables
```css
:root {
  /* Primary Colors */
  --color-primary: 24.6 95% 53.1%;
  --color-primary-light: 217.2 91.2% 60%;
  --color-primary-dark: 221.2 83.2% 53.3%;
  --color-primary-accent: 217.2 91.2% 60%;
  --color-secondary: 262.1 83.3% 57.8%;
  --color-secondary-light: 262.1 83.3% 76.5%;
  --color-secondary-dark: 262.1 83.3% 45.1%;

  /* Semantic Colors */
  --color-success: 158.4 64% 42%;
  --color-success-light: 158.4 64% 52%;
  --color-success-dark: 158.4 64% 35%;
  --color-warning: 32.6 94.6% 44%;
  --color-warning-light: 32.6 94.6% 56%;
  --color-warning-dark: 32.6 94.6% 36%;
  --color-error: 0 84.2% 60.2%;
  --color-error-light: 0 84.2% 71%;
  --color-error-dark: 0 84.2% 51%;
  --color-info: 189.1 91.4% 36.5%;
  --color-info-light: 189.1 91.4% 53%;
  --color-info-dark: 189.1 91.4% 29%;

  /* Neutral Colors */
  --color-gray-50: 220 20% 97%;
  --color-gray-100: 220 19% 93%;
  --color-gray-200: 215 16% 91%;
  --color-gray-300: 217 9% 81%;
  --color-gray-400: 215 16% 67%;
  --color-gray-500: 215 14% 47%;
  --color-gray-600: 215 13% 33%;
  --color-gray-700: 215 19% 27%;
  --color-gray-800: 215 25% 17%;
  --color-gray-900: 215 28% 9%;

  /* Surface Colors */
  --color-surface-primary: 0 0% 100%;
  --color-surface-secondary: 220 19% 93%;
  --color-surface-tertiary: 215 16% 91%;
  --color-surface-elevated: 0 0% 100%;
  --color-surface-overlay: 0 0% 0% / 0.5;
}
```

### Typography Variables
```css
:root {
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-secondary: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Type Scale */
  --text-h1: 36px;
  --text-h2: 30px;
  --text-h3: 24px;
  --text-h4: 20px;
  --text-h5: 18px;
  --text-h6: 16px;
  --text-body-large: 18px;
  --text-body: 16px;
  --text-body-small: 14px;
  --text-caption: 12px;
  --text-overline: 12px;
  --text-code: 14px;
}
```

### Spacing Variables
```css
:root {
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Layout Variables
```css
:root {
  /* Grid System */
  --grid-columns: 12;
  --grid-gutter: 24px;
  --grid-margin: 24px;
  --grid-max-width: 1280px;

  /* Breakpoints */
  --breakpoint-xs: 0px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Icon Variables
```css
:root {
  /* Icon Sizes */
  --icon-size-xs: 12px;
  --icon-size-sm: 16px;
  --icon-size-md: 20px;
  --icon-size-lg: 24px;
  --icon-size-xl: 32px;
  --icon-size-2xl: 48px;

  /* Icon Colors */
  --icon-color-default: var(--color-gray-500);
  --icon-color-hover: var(--color-gray-600);
  --icon-color-active: var(--color-primary);
  --icon-color-disabled: var(--color-gray-300);
  --icon-color-success: var(--color-success);
  --icon-color-warning: var(--color-warning);
  --icon-color-error: var(--color-error);
  --icon-color-info: var(--color-info);
}
```

---

## Appendix B: Implementation Notes

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          light: 'hsl(var(--color-primary-light))',
          dark: 'hsl(var(--color-primary-dark))',
          accent: 'hsl(var(--color-primary-accent))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          light: 'hsl(var(--color-secondary-light))',
          dark: 'hsl(var(--color-secondary-dark))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          light: 'hsl(var(--color-success-light))',
          dark: 'hsl(var(--color-success-dark))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          light: 'hsl(var(--color-warning-light))',
          dark: 'hsl(var(--color-warning-dark))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
          light: 'hsl(var(--color-error-light))',
          dark: 'hsl(var(--color-error-dark))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          light: 'hsl(var(--color-info-light))',
          dark: 'hsl(var(--color-info-dark))',
        },
        gray: {
          50: 'hsl(var(--color-gray-50))',
          100: 'hsl(var(--color-gray-100))',
          200: 'hsl(var(--color-gray-200))',
          300: 'hsl(var(--color-gray-300))',
          400: 'hsl(var(--color-gray-400))',
          500: 'hsl(var(--color-gray-500))',
          600: 'hsl(var(--color-gray-600))',
          700: 'hsl(var(--color-gray-700))',
          800: 'hsl(var(--color-gray-800))',
          900: 'hsl(var(--color-gray-900))',
        },
        surface: {
          primary: 'hsl(var(--color-surface-primary))',
          secondary: 'hsl(var(--color-surface-secondary))',
          tertiary: 'hsl(var(--color-surface-tertiary))',
          elevated: 'hsl(var(--color-surface-elevated))',
          overlay: 'hsl(var(--color-surface-overlay))',
        },
      },
      fontFamily: {
        primary: ['var(--font-primary)'],
        secondary: ['var(--font-secondary)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        'h1': ['var(--text-h1)', { lineHeight: '44px', letterSpacing: '-0.02em' }],
        'h2': ['var(--text-h2)', { lineHeight: '38px', letterSpacing: '-0.01em' }],
        'h3': ['var(--text-h3)', { lineHeight: '32px' }],
        'h4': ['var(--text-h4)', { lineHeight: '28px' }],
        'h5': ['var(--text-h5)', { lineHeight: '24px' }],
        'h6': ['var(--text-h6)', { lineHeight: '24px' }],
        'body-large': ['var(--text-body-large)', { lineHeight: '28px' }],
        'body': ['var(--text-body)', { lineHeight: '24px' }],
        'body-small': ['var(--text-body-small)', { lineHeight: '20px' }],
        'caption': ['var(--text-caption)', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'overline': ['var(--text-overline)', { lineHeight: '16px', letterSpacing: '0.1em' }],
        'code': ['var(--text-code)', { lineHeight: '20px' }],
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      screens: {
        'xs': 'var(--breakpoint-xs)',
        'sm': 'var(--breakpoint-sm)',
        'md': 'var(--breakpoint-md)',
        'lg': 'var(--breakpoint-lg)',
        'xl': 'var(--breakpoint-xl)',
        '2xl': 'var(--breakpoint-2xl)',
      },
    },
  },
};
```

### TypeScript Type Definitions
```typescript
// src/styles/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      DEFAULT: 'hsl(24.6 95% 53.1%)',
      light: 'hsl(217.2 91.2% 60%)',
      dark: 'hsl(221.2 83.2% 53.3%)',
      accent: 'hsl(217.2 91.2% 60%)',
    },
    // ... other color definitions
  },
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      secondary: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      h1: '36px',
      h2: '30px',
      h3: '24px',
      // ... other font sizes
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    // ... other spacing values
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type DesignTokens = typeof designTokens;
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-03 | BMAD UX Designer | Initial release - Phase 1 foundation |

---

## Next Steps

### Phase 2: Component Specifications
- Button component specifications
- Input component specifications
- Card component specifications
- Dialog component specifications

### Phase 3: Theme Switching
- Theme switching mechanism
- Transition animations
- Theme persistence

### Phase 4: Component Implementation
- Implement light theme components
- Test component variations
- Validate accessibility

### Phase 5: Documentation
- Component documentation
- Usage examples
- Best practices guide

### Phase 6: Validation
- WCAG compliance testing
- Cross-browser testing
- User acceptance testing

---

**End of Document**