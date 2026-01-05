# Styling System Documentation

## Overview

The Via-gent platform uses a comprehensive styling system based on CSS custom properties (design tokens) with Tailwind CSS 4 integration. The design follows a MistralAI-inspired 8-bit aesthetic with squared corners, pixel shadows, and a dark theme default.

## File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `design-tokens.css` | 611 | CSS design tokens and theme definitions |
| `design-tokens.ts` | 451 | TypeScript type definitions for tokens |
| `animations.css` | 621 | Custom 8-bit themed animations |
| `light-theme-tokens.css` | - | Light theme overrides |

## Design Tokens

### Color Palette

#### Primary Colors (Orange Accent)
```css
--primary: 24.6 95% 53.1%; /* #f97316 - MistralAI orange */
--primary-foreground: 0 0% 100%; /* White text */
```

#### Surface Colors
```css
--background: 240 6% 4%; /* #0f0f11 - Deep black */
--foreground: 0 0% 95%; /* Near white text */
--card: 240 4% 10%; /* #18181b - Panels and cards */
--secondary: 240 4% 16%; /* #27272a - Secondary surfaces */
--muted: 240 4% 16%; /* Muted backgrounds */
--accent: 240 4% 16%; /* Accent surfaces */
```

#### Semantic Colors
```css
--success: 142 71% 45%; /* Green */
--success-foreground: 0 0% 100%;
--warning: 38 92% 50%; /* Amber */
--warning-foreground: 0 0% 0%;
--destructive: 0 84% 60%; /* Red */
--info: 217 91% 60%; /* Blue */
```

#### Chart Colors
```css
--chart-1: 24.6 95% 53.1%; /* Primary orange */
--chart-2: 217 91% 60%; /* Blue */
--chart-3: 142 71% 45%; /* Green */
--chart-4: 280 65% 60%; /* Purple */
--chart-5: 38 92% 50%; /* Amber */
```

### Typography Tokens

```css
/* Font Families */
--font-sans: System UI sans-serif
--font-mono: Monospace for code
--font-pixel: 8-bit gaming font

/* Font Sizes */
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--text-3xl: 30px
--text-4xl: 36px
--text-5xl: 48px

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing Tokens

```css
--spacing-0: 0px
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
--spacing-20: 80px
--spacing-24: 96px
```

### Layout Tokens

#### Panel Sizes
```css
--panel-editor: 70%;
--panel-editor-monaco: 60%;
--panel-preview: 40%;
--panel-terminal: 30%;
--panel-chat: 25%;
```

#### Sidebar Dimensions
```css
--sidebar-activity-bar: 48px;
--sidebar-activity-bar-height: 44px;
--sidebar-content-panel: 280px;
--sidebar-content-panel-mobile: 200px;
--sidebar-content-panel-tablet: 240px;
--sidebar-content-panel-lg: 320px;
```

#### Status Bar
```css
--status-bar-height: 24px;
```

### Border Radius (8-bit Aesthetic)

```css
--radius: 0rem; /* Squared corners default */
--radius-sm: 0.125rem; /* 2px */
--radius-md: 0.25rem; /* 4px */
--radius-lg: 0.375rem; /* 6px */
```

### Shadow Tokens

```css
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
--shadow-pixel-sm: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-inset: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.05), inset -1px -1px 0px 0px rgba(0, 0, 0, 0.5);
```

### Transition Tokens

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
```

### Z-Index Tokens

```css
--z-dropdown: 1000;
--z-modal: 1100;
--z-tooltip: 1200;
--z-toast: 1300;
```

## Responsive Breakpoints

```css
--breakpoint-mobile: 640px;   /* Mobile devices */
--breakpoint-tablet: 768px;   /* Tablets */
--breakpoint-desktop: 1024px; /* Desktop */
--breakpoint-lg: 1280px;      /* Large desktop */

/* Mobile: < 640px */
@media (max-width: 639px) {
  --sidebar-activity-bar: 40px;
  --sidebar-activity-bar-height: 44px;
}

/* Tablet: 640px - 767px */
@media (min-width: 640px) and (max-width: 767px) {
  --sidebar-activity-bar: 48px;
  --sidebar-activity-bar-height: 48px;
}

/* Desktop: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  --sidebar-activity-bar: 48px;
  --sidebar-activity-bar-height: 48px;
}

/* Large Desktop: >= 1024px */
@media (min-width: 1024px) {
  --sidebar-activity-bar: 48px;
  --sidebar-activity-bar-height: 48px;
}
```

## Animations

### Animation Variables

```css
--animation-duration-fast: 100ms;
--animation-duration-medium: 150ms;
--animation-duration-slow: 200ms;
--animation-easing-8bit: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--animation-easing-linear: linear;
```

### Keyframe Animations

| Animation | Duration | Purpose |
|-----------|----------|---------|
| `button-press` | 100ms | Button click feedback |
| `button-hover` | 150ms | Button hover state |
| `panel-slide-in` | 200ms | Panel appearance |
| `panel-slide-out` | 200ms | Panel dismissal |
| `modal-fade-in` | 150ms | Modal open |
| `modal-fade-out` | 150ms | Modal close |
| `tab-switch` | 100ms | Tab changes |
| `status-pulse` | 2s | Status indicator |
| `sync-progress` | 200ms | Progress bar |
| `tool-call-appear` | 100ms | Tool badge |
| `tree-expand` | 200ms | File tree |
| `icon-rotate` | 1s | Loading spinner |
| `notification-slide-in` | 150ms | Toast notification |
| `fade-in-up` | 150ms | Portal cards |
| `scale-in` | 150ms | Modals/dialogs |
| `glow-pulse` | 2s | AI features |
| `shimmer` | 1.5s | Loading states |
| `flip-in-x` / `flip-out-x` | 0.6s | Flashcards |

### 3D Flip Animations (Flashcards)

```css
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.flip-card { transition: transform 0.6s; }
.flip-card.flipped { transform: rotateX(180deg); }
.flip-card-back { transform: rotateX(180deg); }
```

### Animation Utility Classes

```css
.anim-button-press
.anim-button-hover
.anim-panel-slide-in
.anim-panel-slide-out
.anim-modal-fade-in
.anim-modal-fade-out
.anim-tab-switch
.anim-status-pulse
.anim-tool-call-appear
.anim-tree-expand
.anim-notification-slide-in
.anim-icon-rotate
.anim-fade-in-up
.anim-scale-in
.anim-glow-pulse
.anim-shimmer
.anim-slide-in-right
.anim-gradient-shift
.anim-typewriter
.anim-performance-optimized
.card-hover-lift
.stagger-fade-in
.delay-50, .delay-100, .delay-150, .delay-200
```

### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## TypeScript Type Definitions

### Token Types

```typescript
// Color Tokens
type PrimaryColorToken = 'primary-50' | 'primary-100' | ... | 'primary-950';
type SecondaryColorToken = 'secondary-50' | ...;
type NeutralColorToken = 'neutral-50' | ...;
type SemanticColorToken = 'success' | 'warning' | 'error' | 'info';
type RetroColorToken = 'retro-red' | 'retro-orange' | ...;

// Typography Tokens
type FontSizeToken = 'text-xs' | 'text-sm' | 'text-base' | ... | 'text-5xl';
type FontWeightToken = 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold';

// Layout Tokens
type PanelSizeToken = 'panel-editor' | 'panel-editor-monaco' | 'panel-preview' | 'panel-terminal' | 'panel-chat';
type SidebarToken = 'sidebar-activity-bar' | 'sidebar-content-panel';
```

### Utility Functions

```typescript
// Get CSS variable reference for a design token
function getToken(token: DesignToken): string

// Get color token reference
function getColor(token: ColorToken): string

// Get spacing token reference
function getSpacing(token: SpacingToken): string

// Get layout token reference
function getLayout(token: LayoutToken): string

// Get typography token reference
function getTypography(token: TypographyToken): string

// Get border radius token reference
function getBorderRadius(token: BorderRadiusToken): string

// Get shadow token reference
function getShadow(token: ShadowToken): string

// Get transition token reference
function getTransition(token: TransitionToken): string

// Get z-index token reference
function getZIndex(token: ZIndexToken): string
```

## Usage Examples

### CSS Usage

```css
.my-component {
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-pixel);
}

.my-button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  transition: all var(--transition-fast);
}

.my-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-pixel-primary);
}
```

### TypeScript Usage

```typescript
import { getColor, getSpacing, getShadow } from '@/styles/design-tokens';

const styles = {
  color: getColor('primary-500'),
  padding: getSpacing('spacing-4'),
  boxShadow: getShadow('shadow-pixel')
};
```

### Animation Usage

```css
.my-element {
  animation: modal-fade-in var(--animation-duration-medium) var(--animation-easing-8bit);
}
```

## Tailwind CSS 4 Integration

The project uses Tailwind CSS 4 with automatic content detection:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(), // Tailwind CSS 4 - configuration in CSS
  ],
});
```

Tailwind utilities can be combined with design tokens:

```html
<div class="bg-[hsl(var(--card))] p-[var(--spacing-4)] rounded-[var(--radius)]">
  Content
</div>
```

## Light Theme Support

Add the `.light` class to the document root:

```css
.light {
  --background: 0 0% 98%;
  --foreground: 240 6% 10%;
  --card: 0 0% 100%;
  /* ... other light theme overrides */
}
```

## Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  background: hsl(240 4% 25%);
  border-radius: 0px;
  border: 2px solid hsl(var(--card));
}

.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```

## Known Issues and Limitations

1. **Theme Transition Exclusion**: Root, html, and body elements have transitions disabled to prevent FOUC (Flash of Unstyled Content)
2. **Light Theme Incomplete**: Some components may not have full light theme styling
3. **Animation Performance**: Complex animations should use `will-change: transform, opacity`

## Developer Notes

1. All new styles should use design tokens instead of hardcoded values
2. The 8-bit aesthetic requires squared corners (`--radius: 0`)
3. Pixel shadows should be used for interactive elements
4. Animations should be purposeful and not exceed 200ms for micro-interactions
5. Always test with `prefers-reduced-motion` enabled
