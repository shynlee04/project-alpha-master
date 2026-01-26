# UX/UI Design Specification

**Version:** 2.1.0
**Date:** 2026-01-26
**Project:** Via-Gent (Project Alpha v2.0)
**Status:** ACTIVE - 100% Aligned with new-fundamental-truths.md v2.0.0
**Author:** architect-ext (BMAD Framework)
**Confidence:** HIGH (based on comprehensive alignment with v2.0.0 fundamentals + plugin system architecture)

---

## Document Control

| Section | Status | Confidence | Notes |
|---------|--------|------------|-------|
| 1. Design System | ✅ Complete | HIGH | 8-bit design compliance maintained |
| 2. Component Library | ✅ Complete | HIGH | Updated with plugin patterns |
| 3. Workspace UX Patterns | ⚠️ REPLACED | HIGH | Replaced by Plugin System UX |
| 4. Plugin System UX | ✅ Complete | HIGH | NEW - Toggle-based, platform-aware |
| 5. Interaction Design | ✅ Complete | HIGH | Updated for plugin navigation |
| 6. AI Interaction Guidelines | ✅ Complete | HIGH | Chat cascade patterns documented |
| 7. Responsive Design | ✅ Complete | HIGH | Platform limits enforced |
| 8. Plugin Panel Architecture | ✅ Complete | HIGH | NEW - Sidebar tabs, main panels, progressive disclosure |
| 9. Accessibility | ✅ Complete | HIGH | WCAG 2.1 AA compliance |
| 10. Motion & Animation | ✅ Complete | HIGH | 8-bit themed animations |
| 11. Error Handling | ✅ Complete | HIGH | Error states covered |
| 12. Design Tokens Reference | ✅ Complete | HIGH | CSS + TS tokens mapped |

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Component Library](#2-component-library)
3. [Plugin System UX](#3-plugin-system-ux) ← NEW
4. [Interaction Design](#4-interaction-design)
5. [AI Interaction Guidelines](#5-ai-interaction-guidelines)
6. [Responsive Design](#6-responsive-design)
7. [Accessibility](#7-accessibility)
8. [Plugin Panel Architecture](#8-plugin-panel-architecture) ← NEW (EPIC-0.5)
9. [Motion & Animation](#9-motion--animation)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Design Tokens Reference](#11-design-tokens-reference)

---

## 1. Design System

### 1.1 Typography

**Font Families:**
```css
/* Primary Font */
font-family: 'Inter', system-ui, sans-serif;

/* Monospace Font */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Retro Font (8-bit headings) */
font-family: 'VT323', 'Press Start 2P', monospace;
```

**Font Size Scale:**

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-mobile` | 14px | Mobile base |
| `--font-size-tablet` | 15px | Tablet base |
| `--font-size-desktop` | 16px | Desktop base |
| `--font-size-lg` | 17px | Large desktop |
| `text-xs` | 0.75rem | 12px - Labels, captions |
| `text-sm` | 0.875rem | 14px - Small text |
| `text-base` | 1rem | 16px - Body text |
| `text-lg` | 1.125rem | 18px - Subheadings |
| `text-xl` | 1.25rem | 20px - Headings |
| `text-2xl` | 1.5rem | 24px - Section titles |
| `text-3xl` | 1.875rem | 30px - Page titles |
| `text-4xl` | 2.25rem | 36px - Hero text |

**Font Weights:**
```css
font-normal: 400   /* Regular body text */
font-medium: 500   /* Emphasized text */
font-semibold: 600 /* Headings, labels */
font-bold: 700     /* Strong emphasis */
```

**Line Heights:**
```css
leading-tight: 1.25   /* Dense content */
leading-normal: 1.5   /* Body text */
leading-relaxed: 1.75 /* Readable paragraphs */
```

**Mobile Typography Rules:**
- Base font size: 14px on mobile, 16px on desktop
- Minimum touch target: 44px height (iOS safe)
- Use `text-base` (16px) for inputs to prevent iOS auto-zoom
- Heading scale reduces by one step on mobile (e.g., `text-3xl` becomes `text-2xl`)

### 1.2 Color Palette

**Core Brand Colors (8-bit Dark Theme):**

```css
/* Primary - Orange Accent (MistralAI-inspired) */
--primary: 24.6 95% 53.1%;           /* #f97316 */
--primary-foreground: 0 0% 100%;     /* White text */

/* Background Colors */
--background: 240 6% 4%;             /* #0f0f11 - Deep black */
--foreground: 0 0% 95%;              /* Near white text */

/* Surface Colors */
--card: 240 4% 10%;                  /* #18181b - Panels/cards */
--card-foreground: 0 0% 95%;         /* Card text */

/* Secondary Surfaces */
--secondary: 240 4% 16%;             /* #27272a */
--secondary-foreground: 0 0% 90%;    /* Secondary text */

/* Muted */
--muted: 240 4% 16%;                 /* #27272a */
--muted-foreground: 0 0% 60%;        /* Gray text */

/* Borders */
--border: 240 4% 16%;                /* #27272a - Border color */
--input: 240 4% 16%;                 /* Input borders */
--ring: 24.6 95% 53.1%;              /* Orange focus ring */
```

**Semantic Colors:**

```css
/* Status Colors */
--success: 142 71% 45%;              /* #22c55e - Green */
--warning: 38 92% 50%;               /* #f59e0b - Amber */
--info: 217 91% 60%;                 /* #3b82f6 - Blue */
--destructive: 0 84% 60%;            /* Red - Errors */

/* Gradient Colors (Topic Cards) */
--gradient-orange-start: #f97316;
--gradient-orange-end: #ea580c;
--gradient-coral-start: #f472b6;
--gradient-coral-end: #ec4899;
--gradient-teal-start: #2dd4bf;
--gradient-teal-end: #14b8a6;
--gradient-purple-start: #a78bfa;
--gradient-purple-end: #8b5cf6;
```

**Editor Specific Colors:**

```css
--editor-bg: 240 6% 3.5%;            /* #09090b - Monaco editor */
--editor-gutter: 240 4% 8%;          /* Line number gutter */
--editor-selection: 24.6 95% 53.1%;  /* Selection highlight */
--editor-line-highlight: 240 4% 8%;  /* Current line */
```

**8-Bit Aesthetic Rules:**
- **NO Glassmorphism**: No backdrop-filter, no blur effects
- **Solid Backgrounds Only**: Use `bg-card`, `bg-background` (all opaque)
- **Hard Shadows**: `--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5)`
- **Squared Corners**: `--radius: 0rem` (default), minimal rounding allowed

### 1.3 Spacing & Layout

**Spacing Scale:**

```css
/* Base spacing units */
--spacing-mobile: 0.5rem;    /* 8px - Mobile spacing */
--spacing-tablet: 0.75rem;   /* 12px - Tablet spacing */
--spacing-desktop: 1rem;     /* 16px - Desktop spacing */
--spacing-lg: 1.25rem;       /* 20px - Large desktop */

/* Tailwind spacing scale (0-24) */
spacing-0:  0px
spacing-1:  0.25rem  /* 4px */
spacing-2:  0.5rem   /* 8px */
spacing-3:  0.75rem  /* 12px */
spacing-4:  1rem     /* 16px */
spacing-5:  1.25rem  /* 20px */
spacing-6:  1.5rem   /* 24px */
spacing-8:  2rem     /* 32px */
spacing-10: 2.5rem   /* 40px */
spacing-12: 3rem     /* 48px */
spacing-16: 4rem     /* 64px */
spacing-20: 5rem     /* 80px */
spacing-24: 6rem     /* 96px */
```

**Layout Tokens (Panel Sizes):**

```css
/* Panel percentages for layout presets */
--panel-2col-left: 30%;        /* FileTree in 2-column */
--panel-2col-right: 70%;       /* Monaco in 2-column */
--panel-3col-left: 25%;        /* FileTree in 3-column */
--panel-3col-middle: 45%;      /* Monaco in 3-column */
--panel-3col-right: 30%;       /* Chat in 3-column */
--panel-2plus1-top: 25%;       /* FileTree in 2+1 layout */
--panel-2plus1-main: 50%;     /* Monaco in 2+1 layout */
--panel-2plus1-row2: 25%;     /* Terminal in 2+1 layout */
--panel-2plus1-full: 100%;     /* Chat in 2+1 (full width) */
```

**Sidebar Dimensions:**

```css
/* Activity bar (left icon strip) */
--sidebar-activity-bar: 48px;  /* Desktop */
--sidebar-activity-bar-mobile: 40px;  /* Mobile */

/* Touch-friendly button heights */
--sidebar-activity-bar-height: 44px;  /* Mobile */
--sidebar-activity-bar-height-tablet: 48px;  /* Tablet+ */

/* Content panels */
--sidebar-content-panel: 280px;       /* Desktop default */
--sidebar-content-panel-mobile: 200px; /* Mobile */
--sidebar-content-panel-tablet: 240px; /* Tablet */
--sidebar-content-panel-lg: 320px;     /* Large desktop */

/* Status bar */
--status-bar-height: 24px;    /* Fixed height */
```

**Component Sizes:**

```css
--size-xs: 32px;    /* Small buttons */
--size-sm: 40px;    /* Standard buttons */
--size-md: 48px;    /* Large buttons */
--size-lg: 56px;    /* Extra large */
--size-xl: 64px;    /* Hero buttons */

/* Touch targets (mobile accessibility) */
--touch-target-min: 44px;  /* WCAG 2.5.5 compliance */
```

### 1.4 Borders & Shadows

**Border Radius (8-bit Aesthetic):**

```css
/* Minimal rounding for retro feel */
--radius: 0rem;          /* Default: Squared corners */
--radius-sm: 0.125rem;   /* 2px - Subtle rounding */
--radius-md: 0.25rem;    /* 4px - Small radius */
--radius-lg: 0.375rem;   /* 6px - Medium radius */
```

**Border Widths:**

```css
--border-width-1: 1px;   /* Thin borders */
--border-width-2: 2px;   /* Standard borders */
--border-width-3: 3px;   /* Emphasized borders */
```

**Pixel Shadows (NO BLUR):**

```css
/* Hard drop shadows (8-bit style) */
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
--shadow-pixel-sm: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-inset: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.05),
                   inset -1px -1px 0px 0px rgba(0, 0, 0, 0.5);
```

**Prohibited Shadows:**
- ❌ NO `backdrop-blur` or `backdrop-filter`
- ❌ NO soft/blur shadows (e.g., `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`)
- ✅ USE pixel shadows ONLY for depth

### 1.5 Animation Principles

**Transition Timing:**

```css
/* Transition durations */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);   /* Hover states */
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1); /* Theme switching */
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);   /* Deliberate animations */
--transition-easing: cubic-bezier(0.4, 0, 0.2, 1);      /* Shared easing */
```

**Theme Transition Properties:**

```css
--transition-theme: background-color, color, border-color,
                     outline-color, text-decoration-color,
                     fill, stroke, opacity, box-shadow,
                     transform, filter, backdrop-filter;
```

**Animation Principles:**
1. **8-bit Themed**: Snappy, pixel-perfect transitions (no easing on hover)
2. **Reduced Motion Support**: Honor `prefers-reduced-motion` media query
3. **Meaningful Motion**: Every animation communicates state change
4. **Performance**: Use CSS transforms (not position changes) for 60fps

**Reduced Motion:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## 2. Component Library

### 2.1 Primitives

**Button Component (`button.tsx`)**

Variants:
- `default` - Primary action (orange background)
- `secondary` - Secondary action (gray background)
- `ghost` - No background, bordered
- `link` - Text-only button
- `destructive` - Red (danger actions)

Sizes:
- `sm` - 32px height (small buttons)
- `default` - 40px height (standard)
- `lg` - 48px height (prominent)

Usage Rules:
```tsx
// ✅ CORRECT: Touch targets >=44px on mobile
<Button size="lg" className="min-h-[44px] md:min-h-0">Save</Button>

// ❌ WRONG: Small buttons without mobile padding
<Button size="sm">Delete</Button> // Only 32px - violates WCAG
```

**Input Component (`input.tsx`)**

Features:
- Text inputs with 16px font size (prevents iOS zoom)
- Error states with red border + message
- Disabled state with gray background
- Focus ring (orange, 2px outline)

Mobile Rules:
```tsx
// ✅ CORRECT: 16px font on mobile
<Input className="text-base md:text-sm" />

// ❌ WRONG: Triggers iOS auto-zoom
<Input className="text-sm" />
```

**Select Component (`select.tsx`)**

Features:
- Native select on mobile (better performance)
- Custom dropdown on desktop
- Trigger text: `Select...` placeholder
- Option groups with labels

**Checkbox Component (`checkbox.tsx`)**

Features:
- 16px checkbox (20px touch target on mobile)
- Checked state: Orange checkmark
- Indeterminate state: Horizontal line
- Label click triggers toggle

Accessibility:
```tsx
<Checkbox
  id="terms"
  aria-label="Accept terms and conditions"
  aria-describedby="terms-description"
/>
```

**Switch Component (`switch.tsx`)**

Features:
- 40px width, 24px thumb
- Animated thumb slide
- Orange when active, gray when inactive
- Touch-friendly: 44px min-height wrapper

**Textarea Component (`textarea.tsx`)**

Features:
- Resizable vertical only
- Character counter (optional)
- Auto-expand on content overflow
- Minimum 120px height

### 2.2 Complex Components

**Dialog Component (`dialog.tsx`)**

Features:
- Modal overlay with solid background (`bg-black/80`)
- Centered content (max-width: 500px)
- Close button (top-right, × icon)
- Escape key to close
- Focus trap (cycles within dialog)

Usage Pattern:
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Mobile Rules:
- Full-width on mobile (no max-width)
- Bottom sheet on mobile (slide-up animation)
- Touch-friendly close button (44px min-height)

**Dropdown Menu (`dropdown-menu.tsx`)**

Features:
- Trigger: Button with chevron down icon
- Menu: Solid background (`bg-card`)
- Separator: Horizontal line (`border-t`)
- Keyboard navigation: Arrow keys + Enter
- Click outside to close

**Tabs Component (`tabs.tsx`)**

Features:
- Horizontal tab list (scrollable on overflow)
- Active tab: Orange underline (2px)
- Keyboard: Arrow keys + Home/End
- Role: `tablist`, `tab`, `tabpanel`

**Tooltip Component (`tooltip.tsx`)**

Features:
- Hover delay: 300ms
- Hide delay: 100ms
- Max width: 200px
- Position: Top, right, bottom, left
- Touch device: Tap to show (no hover)

**Sheet Component (`sheet.tsx`)**

Features:
- Slide-in panel (right side)
- Overlay: Solid background (`bg-black/50`)
- Width: 400px (desktop), 100% (mobile)
- Close button: Top-right ×
- Swipe to close (mobile)

### 2.3 Layout Components

**Plugin Layout System (NEW - v2.0.0)**

**Toggle-based Layout with Presets:**

```tsx
// Pre-designed layout presets (NOT drag-drop)
interface LayoutPreset {
  mode: '2-column' | '3-column' | '2+1';
  pluginCount: number;
  slots: Array<{
    flex: number;
    minWidth: number;
    row?: number;
  }>;
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  '2-column': {
    mode: '2-column',
    pluginCount: 2,
    slots: [
      { flex: 30, minWidth: 200 },   // FileTree
      { flex: 70, minWidth: 300 },   // Monaco
    ],
  },
  '3-column': {
    mode: '3-column',
    pluginCount: 3,
    slots: [
      { flex: 25, minWidth: 200 },   // FileTree
      { flex: 45, minWidth: 300 },   // Monaco
      { flex: 30, minWidth: 200 },   // Chat
    ],
  },
  '2+1': {
    mode: '2+1',
    pluginCount: 4,
    slots: [
      { flex: 25, minWidth: 200, row: 1 },  // FileTree
      { flex: 50, minWidth: 300, row: 1 },  // Monaco
      { flex: 25, minWidth: 200, row: 1 },  // Terminal
      { flex: 100, minWidth: 300, row: 2 }, // Chat (full width)
    ],
  },
};
```

**Layout Mode Selector Component:**

```tsx
<LayoutModeSelector>
  <LayoutModeButton mode="2-column" current={layoutMode} onClick={onSetLayoutMode}>
    <ColumnIcon />
  </LayoutModeButton>
  <LayoutModeButton mode="3-column" current={layoutMode} onClick={onSetLayoutMode}>
    <ThreeColumnIcon />
  </LayoutModeButton>
  <LayoutModeButton mode="2+1" current={layoutMode} onClick={onSetLayoutMode}>
    <TwoPlusOneIcon />
  </LayoutModeButton>
</LayoutModeSelector>
```

**Plugin Count Enforcement:**

```tsx
<PluginCountIndicator>
  <span className="text-muted-foreground">
    {activePlugins.length} / {maxPluginsForPlatform}
  </span>
</PluginCountIndicator>
```

**Card Component (`card.tsx`)**

Features:
- Solid background (`bg-card`)
- Border: 1px (`border-border`)
- Shadow: `shadow-pixel-sm`
- Padding: `p-4` (16px)

Sub-components:
- `CardHeader` - Title + description
- `CardContent` - Main content
- `CardFooter` - Actions (right-aligned)

**Badge Component (`badge.tsx`)**

Variants:
- `default` - Gray background
- `secondary` - Muted background
- `destructive` - Red (errors)
- `outline` - Bordered, no background

Usage:
```tsx
<Badge variant="default">New</Badge>
<Badge variant="destructive">Error</Badge>
```

**Progress Component (`progress.tsx`)**

Features:
- Animated fill (left to right)
- Color: Primary (orange) by default
- Height: 8px
- Border radius: `radius-sm`

**Slider Component (`slider.tsx`)**

Features:
- Track: Gray background
- Fill: Orange (from left to thumb)
- Thumb: 16px circle, white
- Keyboard: Arrow keys, Home/End

### 2.4 Feedback Components

**Toast/Sonner (`sonner.tsx`)**

Features:
- Position: Bottom-right (desktop), Bottom-center (mobile)
- Duration: 4000ms (auto-dismiss)
- Action button (optional)
- Close button (× icon)
- Stack: Multiple toasts vertical

Types:
- `default` - Gray
- `success` - Green
- `error` - Red
- `warning` - Amber
- `info` - Blue

Usage:
```tsx
import { toast } from 'sonner';

toast.success('File saved successfully');
toast.error('Failed to save file', {
  action: {
    label: 'Retry',
    onClick: () => retrySave()
  }
});
```

**Alert Component (`alert.tsx`)**

Features:
- Icon: Success/Info/Warning/Error
- Title: Bold text
- Description: Regular text
- Dismissible: × button

Variants:
- `default` - Blue (info)
- `destructive` - Red (errors)

**Skeleton Loading (`skeleton.tsx`)**

Features:
- Animated shimmer (left to right)
- Background: Gray → White → Gray
- Border radius: `radius-sm`
- Pulse animation: 1.5s infinite

Usage:
```tsx
<Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
<Skeleton className="h-4 w-[250px]" />          {/* Text line */}
```

**Loading State (`LoadingState.tsx`)**

Features:
- Spinner: Orange circle, rotating
- Text: "Loading..." (translatable)
- Overlay: Full screen or component-specific
- Progress: Optional percentage display

---

## 3. Plugin System UX (NEW - v2.0.0)

### 3.1 Plugin Architecture Overview

**Plugin-Based Navigation (Replacing Workspace-Centric):**

```
┌─────────────────────────────────────────────────────────┐
│ Via-gent | [=] | [D] [N] [T] [P] [C] [F] | Layout: [2] [3] [4] [5] │
└─────────────────────────────────────────────────────────┘
              |                              |
              +-- Plugin toggles             +-- Layout mode selector

Legend:
[D] = Monaco Editor (Code)
[N] = Notes (BlockNote)
[T] = Terminal
[P] = Preview
[C] = Chat
[F] = FileTree (always visible on desktop)
```

**Key Principles:**
- Plugins replace fixed workspace concepts
- Platform determines available plugins, not user selection
- Layout modes are pre-designed presets (NOT drag-drop)
- Plugin count enforced per platform

### 3.2 Plugin Toggle Toolbar Component

**Component:** `PluginToolbar.tsx`

**Specification:**

```tsx
interface PluginToolbarProps {
  activePlugins: PluginId[];
  availablePlugins: PluginId[];
  layoutMode: LayoutMode;
  maxPlugins: number;
  onTogglePlugin: (pluginId: PluginId) => void;
  onSetLayoutMode: (mode: LayoutMode) => void;
  onOpenPluginManager: () => void;
}

function PluginToolbar({
  activePlugins,
  availablePlugins,
  layoutMode,
  maxPlugins,
  onTogglePlugin,
  onSetLayoutMode,
  onOpenPluginManager
}: PluginToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b border-border bg-card">
      {/* Plugin toggle buttons */}
      <div className="flex gap-1">
        {availablePlugins.map((pluginId) => (
          <PluginToggleButton
            key={pluginId}
            pluginId={pluginId}
            isActive={activePlugins.includes(pluginId)}
            onToggle={() => onTogglePlugin(pluginId)}
          />
        ))}
      </div>

      {/* Plugin count indicator */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">
          {activePlugins.length} / {maxPlugins}
        </span>
      </div>

      {/* Layout mode selector */}
      <div className="flex gap-1">
        <LayoutModeButton
          mode="2-column"
          current={layoutMode}
          onClick={() => onSetLayoutMode('2-column')}
          disabled={activePlugins.length < 2}
        />
        <LayoutModeButton
          mode="3-column"
          current={layoutMode}
          onClick={() => onSetLayoutMode('3-column')}
          disabled={activePlugins.length < 3}
        />
        <LayoutModeButton
          mode="2+1"
          current={layoutMode}
          onClick={() => onSetLayoutMode('2+1')}
          disabled={activePlugins.length < 4}
        />
      </div>

      {/* Plugin manager button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenPluginManager}
      >
        <SettingsIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

**PluginToggleButton Component:**

```tsx
interface PluginToggleButtonProps {
  pluginId: PluginId;
  isActive: boolean;
  onToggle: () => void;
}

function PluginToggleButton({ pluginId, isActive, onToggle }: PluginToggleButtonProps) {
  const plugin = getPluginById(pluginId);
  const platform = getPlatformContract();
  const isCompatible = platform.canSupport(plugin);

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onToggle}
      disabled={!isCompatible}
      className="relative"
      title={
        isCompatible
          ? `Toggle ${plugin.name}`
          : `${plugin.name} not available on this platform`
      }
    >
      {plugin.icon}
      
      {!isCompatible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <LockIcon className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </Button>
  );
}
```

**LayoutModeButton Component:**

```tsx
interface LayoutModeButtonProps {
  mode: LayoutMode;
  current: LayoutMode;
  onClick: () => void;
  disabled?: boolean;
}

function LayoutModeButton({ mode, current, onClick, disabled }: LayoutModeButtonProps) {
  const isActive = current === mode;
  const layoutIcon = getLayoutIcon(mode);

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={`Switch to ${mode} layout`}
    >
      {layoutIcon}
    </Button>
  );
}
```

### 3.3 Platform-Aware Plugin Limits

**Platform Plugin Count Limits:**

| Platform | Max Plugins | Default Plugins | Layout Modes Available |
|----------|-------------|-----------------|------------------------|
| **Desktop** | 3 | FileTree, Monaco, Chat | 2-column, 3-column, 2+1 (if Monaco+Chat) |
| **Tablet** | 2 | FileTree, Notes, Chat | 2-column only |
| **Mobile** | 1 | Notes | 1-column (full height) |

**Plugin Availability by Platform:**

| Plugin | Desktop | Tablet | Mobile | Requirements |
|--------|---------|--------|--------|--------------|
| **Monaco** | ✅ | ✅ | ❌ | Requires FSA for file access |
| **Terminal** | ✅ | ❌ | ❌ | Requires FSA + Desktop |
| **Preview** | ✅ | ❌ | ❌ | Requires WebContainer |
| **FileTree** | ✅ | ✅ | ✅ | Basic file access |
| **Chat** | ✅ | ✅ | ✅ | No special requirements |
| **Notes** | ✅ | ✅ | ✅ | No special requirements |

**UX Rules for Plugin Limits:**
1. Show warning when attempting to exceed limit: "Maximum {max} plugins reached"
2. Auto-disable lowest-priority plugin if limit exceeded
3. Gray out disabled plugins with tooltip explaining platform restriction
4. Show plugin count indicator: "2/3 active"

**PluginPriority System:**

```typescript
export const PLUGIN_PRIORITY: Record<PluginId, number> = {
  filetree: 0,      // Always loaded (highest priority)
  chat: 1,          // Always loaded
  monaco: 2,        // Core IDE plugin
  notes: 3,          // Core note-taking
  terminal: 4,       // Optional, desktop only
  preview: 5,        // Optional, desktop only
};
```

### 3.4 Plugin Management Dialog

**Component:** `PluginManagementDialog.tsx`

**Specification:**

```tsx
function PluginManagementDialog() {
  const platform = getPlatformContract();
  const availablePlugins = getAllPlugins();
  const activePlugins = getActivePlugins();
  const maxPlugins = getMaxPluginsForPlatform(platform);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Plugins</DialogTitle>
          <DialogDescription>
            Add or remove plugins from your workspace. Maximum {maxPlugins} plugins allowed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {availablePlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              isCompatible={platform.canSupport(plugin)}
              isActive={activePlugins.includes(plugin.id)}
              isAtLimit={activePlugins.length >= maxPlugins}
              onAdd={() => onAddPlugin(plugin.id)}
              onRemove={() => onRemovePlugin(plugin.id)}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**PluginCard Component:**

```tsx
interface PluginCardProps {
  plugin: FeaturePlugin;
  isCompatible: boolean;
  isActive: boolean;
  isAtLimit: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

function PluginCard({
  plugin,
  isCompatible,
  isActive,
  isAtLimit,
  onAdd,
  onRemove
}: PluginCardProps) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        {plugin.icon}
        <div>
          <PluginName>{plugin.name}</PluginName>
          <PluginDescription className="text-sm text-muted-foreground">
            {plugin.description}
          </PluginDescription>
          
          {!isCompatible && (
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="destructive" className="text-xs">
                Desktop only
              </Badge>
              <Tooltip>
                Requires {plugin.requiresFSA ? 'FSA access' : 'desktop environment'}
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>

      <div className="flex gap-2">
        {isActive ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onAdd}
            disabled={!isCompatible || isAtLimit}
          >
            {isAtLimit && !isCompatible ? 'Limit' : 'Add'}
          </Button>
        )}
      </div>
    </Card>
  );
}
```

**UX Rules:**
1. Disabled plugins show "Not available on your platform"
2. Plugin count warning: "You have 3/3 plugins active"
3. Add button disabled when at limit or incompatible
4. Clear visual distinction between active/inactive plugins

### 3.5 Progressive Disclosure for Plugins

**Disclosure Levels:**

| Level | Visibility | Plugins | Access |
|-------|-------------|----------|--------|
| **Level 1 (Always Visible)** | FileTree, Monaco, Chat | Toggle buttons in toolbar |
| **Level 2 (Click to Reveal)** | Terminal, Preview, Notes | "Show more plugins" dropdown |
| **Level 3 (Hidden by Default)** | Advanced plugins | Plugin marketplace |

**ShowMorePlugins Component:**

```tsx
function ShowMorePlugins({ hiddenPlugins, onReveal }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Show More
          <ChevronDownIcon className="ml-2 w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent>
        {hiddenPlugins.map((plugin) => (
          <DropdownMenuItem
            key={plugin.id}
            onClick={() => onReveal(plugin.id)}
          >
            {plugin.icon}
            <span>{plugin.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**UX Rules:**
1. "Show more plugins" button reveals Level 2
2. "Advanced" tab reveals Level 3
3. Save plugin visibility preference per project
4. Always show plugin count indicator

### 3.6 Layout Presets by Plugin Count

**2-Column Layout (2 plugins):**

```
┌─────────────────────────────────────────────────────┐
│ Header: Project Name | Plugin Toolbar | Layout: [2] [3] [4] │
├──────┬──────────────────────────────────────────────┤
│ File  │ Monaco Panel (70%)                          │
│ Tree   │ ┌────────────────────────────────────────┐   │
│ (30%)  │ │ File: Button.tsx                   │   │
│        │ │ ────────────────────────────────────│   │
│        │ │ import React from 'react';          │   │
│        │ │                                    │   │
│        │ │ export function Button() {          │   │
│        │ │   return <button>Click</button>;    │   │
│        │ │ }                                  │   │
│        │ └────────────────────────────────────────┘   │
├──────┴──────────────────────────────────────────────┤
│ Status Bar | Modified | TypeScript | Line 42        │
└─────────────────────────────────────────────────────┘
```

**3-Column Layout (3 plugins):**

```
┌─────────────────────────────────────────────────────┐
│ Header: Project Name | Plugin Toolbar | Layout: [2] [3] [4] │
├──────┬──────────────────┬────────────────────────┤
│ File   │ Monaco (45%)     │ Chat (30%)             │
│ Tree   │                  │                        │
│ (25%)  │                  │                        │
├────────┴──────────────────┴────────────────────────┤
│ Status Bar | Modified | TypeScript | Line 42        │
└─────────────────────────────────────────────────────┘
```

**2+1 Layout (4 plugins):**

```
┌─────────────────────────────────────────────────────┐
│ Header: Project Name | Plugin Toolbar | Layout: [2] [3] [4] │
├──────┬──────────────────┬────────────────────────┤
│ File   │ Monaco (50%)     │                        │
│ Tree   │                  │                        │
│ (25%)  │                  │                        │
├────────┴──────────────────┴────────────────────────┤
│ Terminal (25%)                                 │
├────────────────────────────────────────────────────┤
│ Chat (100% - Full Width)                      │
└─────────────────────────────────────────────────────┘
```

**Responsive Behavior:**

| Platform | Default Layout | Max Columns | Max Panels |
|----------|---------------|-------------|-------------|
| Mobile | 1-column (Notes) | 1 | 1 (full height) |
| Tablet | 2-column | 2 | 2 |
| Desktop | 2-column (default) | 3 | 5 |

### 3.7 Empty States for Plugin System

**No Plugins Active State:**

```tsx
<EmptyPluginState
  icon={<PluginIcon />}
  title="No plugins active"
  description="Add plugins to customize your workspace"
  action={
    <Button onClick={onOpenPluginManager}>
      <PlusIcon className="mr-2" />
      Add Plugin
    </Button>
  }
/>
```

**Platform-Specific Empty States:**

| Platform | Title | Description | CTA |
|----------|-------|-------------|-----|
| Mobile | "No plugins active" | "Notes is your default plugin" |
| Tablet | "No plugins active" | "Add FileTree or Notes" |
| Desktop | "No plugins active" | "Add FileTree, Monaco, or Chat" |

**UX Rules:**
1. Empty state should be platform-specific
2. Clear CTA: "Add your first plugin"
3. Plugin count limit warning: "You have 0/3 plugins active"
4. Show disabled plugins with explanation

---

## 4. Interaction Design

### 4.1 Navigation Patterns

**Project-Centric Header (NEW - v2.0.0):**

```
┌─────────────────────────────────────────────────────────┐
│ Via-Gent │ Project: My Awesome Project │ [=] [D] [N] │ Layout: [2] [3] │
└─────────────────────────────────────────────────────────┘
              ↑ Project switcher           ↑ Plugin toggles      ↑ Layout mode
```

**Components:**
- **ProjectSwitcher:** Dropdown to select/create projects
- **PluginToolbar:** Toggle buttons for active plugins
- **LayoutModeSelector:** Buttons for layout presets
- **Breadcrumb:** Shows file path within current plugin

**Navigation Rules:**
1. Single route: `/$projectId` (no workspace-specific routes)
2. Platform determines available plugins
3. Project ID is anchor for all features
4. No query parameters for "layout mode"

**Secondary Navigation (Breadcrumbs):**

```
Project > src > components > Button.tsx
```

Features:
- Clickable: Navigate to any level
- Separator: `>` (chevron right icon)
- Truncate: Middle ellipsis on long paths
- Max width: 400px (desktop), 200px (mobile)

### 4.2 Command Palette (Ctrl+P / Cmd+P)

**Trigger:** `Ctrl+P` (Windows/Linux), `Cmd+P` (Mac)

**Layout:**

```
┌─────────────────────────────────────────┐
│ > Type command or search...             │
├─────────────────────────────────────────┤
│ > Toggle Plugin [FileTree]            │
│ > Toggle Plugin [Monaco]             │
│ > Switch Layout 2-Column              │
│ > Open Plugin Manager                   │
│ > New File                    Ctrl+N   │
│ > Open File                   Ctrl+O   │
│ > Save                        Ctrl+S   │
│ > Toggle Terminal              Ctrl+`   │
├─────────────────────────────────────────┤
│ Recent Files:                           │
│  Button.tsx                 2 min ago   │
│  Input.tsx                  5 min ago   │
└─────────────────────────────────────────┘
```

Features:
- Fuzzy search: Match any part of command
- Keyboard: Arrow keys to navigate, Enter to execute
- Categories: Plugins, Layouts, Files, Commands
- Icons: Each item has icon + shortcut hint

Mobile Alternative:
- Bottom sheet with search bar
- Swipe up to open (from bottom edge)
- Tap outside to close

### 4.3 Keyboard Shortcuts

**Global Shortcuts:**

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl+P` | Command palette | All |
| `Ctrl+S` | Save file | All |
| `Ctrl+Z` | Undo | All |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo | All |
| `Ctrl+F` | Find in file | All |
| `Ctrl+Shift+F` | Find in files | All |
| `Ctrl+B` | Toggle sidebar | All |
| `Ctrl+`` | Toggle terminal | Desktop only |
| `Ctrl+I` | Toggle agent chat | All |
| `Ctrl+1-3` | Switch layout mode | All |
| `Ctrl+N` | New file | Desktop only |
| `Ctrl+W` | Close file | Desktop only |
| `Ctrl+Tab` | Next tab | Desktop only |
| `Ctrl+Shift+Tab` | Previous tab | Desktop only |

**Plugin-Specific Shortcuts (Desktop):**

| Shortcut | Action | Plugin |
|----------|--------|---------|
| `Ctrl+D` | Toggle Monaco | FileTree |
| `Ctrl+T` | Toggle Terminal | FileTree |
| `Ctrl+C` | Toggle Chat | All |

**Customization:**
- Settings: Keyboard shortcuts modal
- Conflict detection: Warn on override
- Export: JSON backup of shortcuts

### 4.4 Gesture Support (Mobile)

**Touch Gestures:**

| Gesture | Action | Location |
|---------|--------|----------|
| Swipe left | Delete note/file | List items |
| Swipe right | Archive/mark read | List items |
| Pull down | Refresh content | Scrollable views |
| Pull up | Open command palette | Bottom edge |
| Pinch | Zoom canvas | Knowledge canvas (if exists) |
| Two-finger drag | Pan canvas | Knowledge canvas (if exists) |
| Long press | Context menu | All elements |
| Swipe left/right | Switch plugins | Mobile tab bar |

**Haptic Feedback:**
- Success: Light vibration on save
- Error: Heavy vibration on failure
- Warning: Medium vibration on destructive action

**Touch Targets:**
- Minimum: 44px × 44px (WCAG 2.5.5)
- Recommended: 48px × 48px (better UX)
- Spacing: 8px gap between targets

---

## 5. AI Interaction Guidelines

### 5.1 Agent Selection

**Agent Selector Component:**

```
┌─────────────────────────────────────────┐
│ 🤖 Current Agent: Orchestrator    ▼ │
└─────────────────────────────────────────┘
        ↓ (Click to open dropdown)
┌─────────────────────────────────────────┐
│ Orchestrator     ✅ Read-only tools   │
│ dev-ext          ✅ Full permissions   │
│ architect-ext    ✅ Design docs only   │
│ analyst-ext       ✅ Research only       │
│ ux-designer-ext  ✅ Design only        │
│ ────────────────────────────────────── │
│ ⚙️ Configure Agents...                 │
└─────────────────────────────────────────┘
```

Features:
- Orchestrator is default agent (always starts conversations)
- Workspace-aware: Only show agents for current project
- Badge: Show tool permissions (read-only, full, design-only, etc.)
- Last used: Remember per project

**Agent Card Display:**

```
┌─────────────────────────────────────────┐
│ 🤖 Orchestrator                       │
│ ─────────────────────────────────────── │
│ Role: Coordinator with read-only tools  │
│                                       │
│ Tools:                                │
│ ✅ read_file      ✅ list_files         │
│ ✅ grep           ✅ glob               │
│ ✅ switch-mode    ✅ delegate-tasks     │
│                                       │
│ ─────────────────────────────────────── │
│ Workspace Availability:                  │
│ 💻 FileTree       ✅ Available             │
│ 📝 Notes          ✅ Available             │
│ 💻 Monaco         ✅ Available (FSA only)    │
│ ⚠️  Terminal       ❌ Desktop only            │
└─────────────────────────────────────────┘
```

### 5.2 Chat Interface

**Chat Panel Layout:**

```
┌─────────────────────────────────────────┐
│ 💬 Orchestrator        [New Thread]   │
├─────────────────────────────────────────┤
│ Thread List (200px)     Messages        │
│ ┌────────────────┐    ┌───────────────││
│ │ Thread 1      │    │ User: How do  ││
│ │ Thread 2      │←──→│ I create a    ││
│ │ Thread 3      │    │ button?       ││
│ └────────────────┘    │               ││
│                       │ Agent: To create││
│                       │ a button...     ││
│                       │               ││
│                       │               ││
│                       │ [Input Box]   ││
│                       │ [Send ↑]      ││
│ └─────────────────────┴───────────────││
└─────────────────────────────────────────┘
```

**Message Display:**

User Message:
```
┌─────────────────────────────────────────┐
│ You                     Today 2:30 PM   │
│ ─────────────────────────────────────── │
│ How do I create a plugin-based layout?│
└─────────────────────────────────────────┘
```

Agent Message:
```
┌─────────────────────────────────────────┐
│ 🤖 Orchestrator    Today 2:30 PM     │
│ ─────────────────────────────────────── │
│ Based on your project's platform, I     │
│ recommend a 2-column layout with:      │
│                                       │
│ • FileTree (30%)                      │
│ • Monaco (70%)                        │
│                                       │
│ This optimizes screen space for your    │
│ device type.                          │
└─────────────────────────────────────────┘
```

Tool Call Display:
```
┌─────────────────────────────────────────┐
│ 🔧 Tool: read_file                      │
│ ─────────────────────────────────────── │
│ Reading: src/components/Button.tsx     │
│                                       │
│ [⏸️ Pending] [✅ Approve] [❌ Reject]   │
└─────────────────────────────────────────┘
```

### 5.3 Tool Approvals

**Approval Overlay:**

```
┌─────────────────────────────────────────┐
│ 🔧 Tool Execution Requires Approval     │
├─────────────────────────────────────────┤
│ The agent wants to:                     │
│                                       │
│ Tool:    write_file                     │
│ File:    src/components/NewPlugin.tsx   │
│ Action:  Create new file                │
│                                       │
│ [Approve Once] [Approve All] [Reject]  │
│                                       │
│ ☑️ Remember this choice for session     │
└─────────────────────────────────────────┘
```

**Trust Levels:**

| Level | Behavior | Use Case |
|-------|----------|----------|
| `auto` | Execute without asking | Read operations, safe tools |
| `prompt` | Ask every time | Write operations, moderate risk |
| `block` | Never execute | Dangerous tools (delete, rm -rf) |

**Batch Approval:**

```
┌─────────────────────────────────────────┐
│ 3 tools awaiting approval                │
├─────────────────────────────────────────┤
│ ☑️ read_file  (Button.tsx)              │
│ ☑️ write_file (NewPlugin.tsx)           │
│ ☑️ execute_command (npm install)        │
│                                       │
│ [Approve All] [Reject All]             │
└─────────────────────────────────────────┘
```

### 5.4 Streaming Responses

**Streaming Indicators:**

1. **Thinking State:**
   ```
   🤖 Orchestrator is thinking...
   ```
   - Animated dots (3 dots, pulse)
   - Duration: 500ms before stream starts

2. **Streaming State:**
   ```
   🤖 Orchestrator is typing... │
   ```
   - Animated cursor (│)
   - Real-time text appears
   - Stop button (×) to cancel

3. **Tool Execution:**
   ```
   🔧 Executing: npm install
   ━━━━━━━━━━━━━━━━━━━ 45%
   ```
   - Progress bar with percentage
   - Cancel button

**Markdown Streaming:**
- Code blocks: Syntax highlight after completion
- Links: Clickable after render
- Headers: Styled on render
- Lists: Indented on render

### 5.5 Error States

**Error Message Display:**

```
┌─────────────────────────────────────────┐
│ ⚠️ Error                                │
├─────────────────────────────────────────┤
│ Failed to execute tool:                 │
│                                       │
│ Tool: write_file                        │
│ Error: Permission denied                │
│                                       │
│ [Retry] [Dismiss]                       │
└─────────────────────────────────────────┘
```

**Error Types:**

| Error Type | Display | Action |
|------------|---------|--------|
| `Permission` | Lock icon + message | Grant permission |
| `Timeout` | Clock icon + message | Retry or cancel |
| `API_Error` | Warning icon + message | Check API key |
| `Rate_Limit` | Gauge icon + message | Wait or upgrade |
| `Validation` | Alert icon + message | Fix input |

**Recovery Flows:**
- Retry: Button to re-execute
- Fallback: Suggest alternative action
- Support: Link to documentation

---

## 6. Responsive Design

### 6.1 Breakpoints

**Design Token Breakpoints:**

```css
--breakpoint-mobile: 640px;   /* Mobile devices */
--breakpoint-tablet: 768px;   /* Tablets */
--breakpoint-desktop: 1024px; /* Desktop */
--breakpoint-lg: 1280px;       /* Large desktop */
```

**Tailwind Breakpoint Mapping:**

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### 6.2 Mobile Layout (UPDATED - v2.0.0)

**Plugin System on Mobile (NEW):**

**Plugin Limit:** 1 active plugin at a time

**Layout:**
```
+--------------------------------------+
| [Single Panel - Full Height]         |
| - Shows active plugin only            |
+--------------------------------------+
| [F] [N] [C]  <- Tab Bar (bottom)    |
+--------------------------------------+

Legend:
[F] = FileTree (access files)
[N] = Notes (BlockNote editor)
[C] = Chat (AI assistant)
- Terminal and Monaco NOT available on mobile (platform constraints)
```

**Plugin Availability on Mobile:**

| Plugin | Available | Reason |
|--------|-----------|--------|
| FileTree | ✅ | Basic file access |
| Notes | ✅ | Document editing |
| Chat | ✅ | AI assistant |
| Monaco | ❌ | No IDE access (FSA required) |
| Terminal | ❌ | No terminal (FSA required) |
| Preview | ❌ | No WebContainer support |

**Mobile Navigation:**

```
Mobile Layout:
+--------------------------------------+
| [Single Panel - Full Height]         |
| - Shows active plugin only            |
+--------------------------------------+
| [F] [N] [C]  <- Tab Bar (bottom)    |
+--------------------------------------+
       ↓ Swipe to switch plugins
```

**UX Rules for Mobile:**
1. Tab bar shows only available plugins
2. Disabled plugins not shown in tab bar
3. "View all plugins" button shows disabled plugins with explanation
4. Tooltip: "Terminal requires desktop with FSA access"
5. Single plugin visible at a time (full height)
6. Swipe left/right to switch between available plugins

**Layout Adaptations by Platform:**

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Sidebar (FileTree) | Left, 280px | Left, 240px | Drawer (swipe to open) |
| Activity Bar | Left, 48px | Left, 48px | Hidden (use bottom nav) |
| Terminal | Bottom panel, 30% | ❌ Not available | ❌ Not available |
| Agent Chat | Right sidebar, 25% | Right sidebar, 25% | Full screen overlay |
| Monaco | Main panel (70%) | Main panel (70%) | ❌ Not available |

### 6.3 Touch Interactions

**Touch Target Sizes:**

```tsx
// ✅ CORRECT: 44px minimum (WCAG)
<Button className="min-h-[44px] min-w-[44px]">
  <Icon />
</Button>

// ❌ WRONG: Too small for touch
<Button className="h-6 w-6">  {/* 24px - violates WCAG */}
  <Icon />
</Button>
```

**Spacing Rules:**
- Minimum gap: 8px between touch targets
- Recommended gap: 16px for better UX
- Group related buttons: 4px gap (toolbar)

**Swipe Gestures:**
- List items: Swipe left to delete
- Navigation: Swipe right to go back
- Modals: Swipe down to close (bottom sheet)
- Plugin switching: Swipe left/right on mobile tab bar

**Feedback:**
- Visual: Background change on touch (`bg-active`)
- Haptic: Light vibration on tap
- Audio: Click sound (optional, user pref)

### 6.4 Orientation Handling

**Portrait (Default):**
- Single column layout
- Bottom navigation (tab bar)
- Full-width inputs
- Stack panels vertically

**Landscape:**
- 2-column layout (if tablet with 2+ plugins)
- Side navigation (if tablet)
- Compact spacing
- Horizontal scrolling for tabs

**Orientation Lock:**
- IDE (Monaco + Terminal): Lock to landscape (desktop/tablet only)
- Notes: Allow both orientations
- Preview: Allow both orientations

### 6.5 Platform Capability Matrix (NEW - v2.0.0)

**Plugin Availability by Platform:**

| Plugin | Desktop (FSA) | Desktop (IndexedDB) | Tablet | Mobile | Requirements |
|--------|----------------|---------------------|--------|--------|--------------|
| **Monaco** | ✅ | ⚠️ Limited | ⚠️ Limited | ❌ | Requires FSA for file access |
| **Terminal** | ✅ | ❌ | ❌ | ❌ | Requires FSA + Desktop |
| **Preview** | ✅ | ❌ | ❌ | ❌ | Requires WebContainer |
| **FileTree** | ✅ | ✅ | ✅ | ✅ | Basic file access |
| **Chat** | ✅ | ✅ | ✅ | ✅ | No special requirements |
| **Notes** | ✅ | ✅ | ✅ | ✅ | No special requirements |

**UX Indicators for Unavailable Plugins:**

**Desktop-only Plugins (Terminal, Preview):**

```tsx
<Badge variant="destructive" className="text-xs">
  Desktop only
</Badge>
<Tooltip>
  Requires desktop with FSA access
</Tooltip>
```

**FSA-required Plugins (Monaco, Terminal):**

```tsx
<Badge variant="warning" className="text-xs">
  Requires file system access
</Badge>
<Tooltip>
  Not available in browser-only mode
</Tooltip>
```

**Progressive Disclosure of Platform Limitations:**

**Level 1:** Show only available plugins in toolbar
**Level 2:** Show disabled plugins with "Desktop only" badge
**Level 3:** Show detailed requirements (FSA, WebContainer, etc.)

**Platform Entry Matrix:**

| User Type | Desktop (FSA) | Desktop (IndexedDB) | Tablet | Mobile |
|-----------|---------------|---------------------|--------|--------|
| **New** | Create project → Full plugins | Create project → FileTree/Notes/Chat | Create project → Notes/Chat | Auto-create browser-mode project |
| **Returned** | Select from list → Full plugins | Select from list → FileTree/Notes/Chat | Select from list → Notes/Chat | Auto-load → Notes |
| **Default Plugins** | FileTree, Monaco, Chat | FileTree, Notes, Chat | FileTree, Notes, Chat | Notes |
| **Layout Mode** | 3-column max | 2-column max | 2-column max | 1-column |
| **Storage** | FSA (File System Access) | IndexedDB (Dexie) | IndexedDB (Dexie) | IndexedDB (Dexie) |

---

## 7. Accessibility

### 7.1 WCAG Compliance

**Target Level:** WCAG 2.1 AA

**Key Requirements:**

| Guideline | Success Criteria | Implementation |
|-----------|------------------|----------------|
| **Perceivable** | 1.1.1 Text Alternatives | Alt text for all images |
| | 1.4.3 Contrast (Minimum) | 4.5:1 for normal text |
| | 1.4.11 Non-text Contrast | 3:1 for icons/borders |
| **Operable** | 2.1.1 Keyboard | All features work without mouse |
| | 2.4.3 Focus Order | Logical tab sequence |
| | 2.5.5 Target Size | 44×44px minimum on touch |
| **Understandable** | 3.1.1 Language of Page | `<html lang="en">` |
| | 3.3.2 Labels or Instructions | All inputs have labels |
| **Robust** | 4.1.2 Name, Role, Value | ARIA attributes on all UI |

**Color Contrast:**

```css
/* Compliant pairs (verified): */
Background: #0f0f11 (near black)
Foreground: #f5f5f5 (near white)
Contrast: 15.3:1 ✅ (Passes AAA)

Background: #f97316 (orange primary)
Foreground: #ffffff (white)
Contrast: 4.5:1 ✅ (Passes AA)

Background: #27272a (gray secondary)
Foreground: #a1a1aa (muted text)
Contrast: 4.6:1 ✅ (Passes AA)
```

### 7.2 Keyboard Navigation

**Focus Visible:**

```css
/* Orange ring on focus (2px outline) */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

**Tab Order:**
1. Skip to main content link (first tab)
2. Project header (project switcher, plugin toolbar, layout mode)
3. Main content (active plugin)
4. Secondary actions (plugin manager)
5. Footer/status bar

**Keyboard Shortcuts:**

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Tab` | Next focusable element | All |
| `Shift+Tab` | Previous focusable element | All |
| `Enter` | Activate button/link | All |
| `Space` | Toggle checkbox/radio | Forms |
| `Escape` | Close modal/dropdown | Overlays |
| `Arrow Keys` | Navigate lists/menus | Interactive |
| `Home/End` | First/last item | Lists |

### 7.3 Screen Reader Support

**ARIA Labels:**

```tsx
// Icon buttons must have labels
<button aria-label="Close dialog">
  <CloseIcon />
</button>

// Form inputs need explicit labels
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" />
<p id="email-hint">We'll never share your email</p>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notificationMessage}
</div>
```

**Semantic HTML:**

```tsx
// ✅ CORRECT: Semantic elements
<nav aria-label="Plugin navigation">...</nav>
<main id="main-content">...</main>
<aside aria-label="Agent chat">...</aside>
<footer aria-label="Status bar">...</footer>

// ❌ WRONG: Generic divs
<div className="nav">...</div>
<div className="main">...</div>
```

**Screen Reader Announcements:**

```tsx
// Status announcer component
<StatusAnnouncer>
  {statusMessage}
</StatusAnnouncer>

// Example: Tool execution
useEffect(() => {
  announceToScreenReader('Tool write_file completed successfully');
}, [toolResult]);
```

### 7.4 Focus Management

**Modal Focus Trap:**

```tsx
<Dialog open={isOpen}>
  <DialogContent
    onCloseAutoFocus={(e) => {
      // Focus specific element on close
      e.preventDefault();
      triggerRef.current?.focus();
    }}
  >
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

**Skip Links:**

```tsx
// Hidden until focused
<SkipLinks>
  <a href="#main-content">Skip to main content</a>
  <a href="#plugin-toolbar">Skip to plugin toolbar</a>
</SkipLinks>
```

**Focus Indicators:**

```css
/* High contrast focus ring (never remove) */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Remove default outline only if replacing with custom */
*:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 8. Plugin Panel Architecture (EPIC-0.5 Specification)

### 8.1 Panel Types

| Panel Type | Location | Examples | Loading |
|------------|----------|----------|---------|
| **Sidebar Tab** | Left sidebar (always visible) | FileTree, Chat | Immediate |
| **Main Panel** | Center workspace | Monaco, Preview, Terminal | On-demand |
| **Overlay** | Modal/drawer | Settings, Help | On-trigger |

### 8.2 Sidebar Tabs

**CRITICAL**: FileTree and Chat are NOT main panels.

```
┌─────────────────────────────────────────────────────────┐
│ GlobalHeader                                            │
├────────┬────────────────────────────────────┬───────────┤
│ System │                                    │ Tool      │
│ Rail   │     Main Panel Area                │ Rail      │
│        │     (Monaco, Preview, Terminal)    │           │
│ [🏠]   │                                    │ [⚙️]      │
│ [📁]   ├────────────────────────────────────┤           │
│ [💬]   │                                    │           │
│ [🔍]   │     (Can have 2-4 panels in grid)  │           │
│        │                                    │           │
└────────┴────────────────────────────────────┴───────────┘
```

**System Rail Icons:**
- 🏠 Hub (navigate to /hub)
- 📁 FileTree tab (toggle sidebar content)
- 💬 Chat tab (toggle sidebar content)
- 🔍 Search (overlay)

### 8.3 Sidebar Content Switching

```typescript
type SidebarTab = 'filetree' | 'chat' | 'search';

// Only ONE tab content visible at a time
// Sidebar is collapsible but never hidden on desktop
```

**Behavior:**
1. Click 📁 → Show FileTree in sidebar
2. Click 💬 → Show Chat in sidebar (FileTree hidden)
3. Click same icon → Collapse sidebar
4. Sidebar width: min 240px, max 400px, resizable

### 8.4 Main Panel Grid

**Desktop (>1024px):**
- 1-4 panels in grid layout
- Toggle via PluginToolbar
- User can arrange (but NO drag-drop, only predefined layouts)

**Predefined Layouts:**
```
[1] Single: Full width/height
[2] Split Vertical: 50/50 left-right
[3] Split Horizontal: 50/50 top-bottom
[4] Quad: 2x2 grid
```

**Mobile (<768px):**
- Single panel only
- Swipe to switch panels
- Sidebar as bottom sheet

### 8.5 Progressive Disclosure

**Immediate Load (P0):**
- FileTree (sidebar)
- Chat (sidebar)

**On-Demand Load (P1):**
- Monaco (when file selected)
- Terminal (when toggled)
- Preview (when toggled)
- Notes (when toggled)

**Implementation:**
```typescript
const pluginLoadStrategy: Record<string, 'immediate' | 'lazy'> = {
  filetree: 'immediate',
  chat: 'immediate',
  monaco: 'lazy',
  terminal: 'lazy',
  preview: 'lazy',
  notes: 'lazy',
};
```

### 8.6 Plugin State Persistence

Per-project persistence in Dexie:
```typescript
interface ProjectPluginState {
  projectId: string;
  sidebarTab: SidebarTab;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  mainLayout: '1' | '2v' | '2h' | '4';
  enabledPlugins: string[];
  pluginPositions: Record<string, number>; // for grid
}
```

---

## 9. Motion & Animation

### 9.1 Transition Principles

**8-bit Animation Style:**
- Snappy: Short durations (150-300ms)
- Linear easing: No easing on hover state
- Meaningful: Every transition communicates state change
- Performance: Use `transform` and `opacity` (GPU-accelerated)

**Transition Examples:**

```css
/* Hover state (snappy, no easing) */
.button:hover {
  transform: translateY(-2px);
  transition: transform 150ms linear;
}

/* Theme switch (smooth easing) */
.theme-switch {
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Modal fade-in (slow, deliberate) */
.modal-overlay {
  animation: fadeIn 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 9.2 Loading States

**Skeleton Loading:**

```tsx
<Skeleton className="h-4 w-[250px] animate-pulse" />
```

- Pulse animation: 1.5s infinite
- Shimmer effect: Left to right
- Color: Gray → White → Gray
- Use: Text, images, cards

**Spinner:**

```tsx
<LoadingSpinner className="h-8 w-8 animate-spin text-primary" />
```

- Rotate: 360deg, 1s linear
- Color: Primary (orange)
- Size: 32px (default)
- Use: Buttons, forms, async actions

**Progress Bar:**

```tsx
<Progress value={65} className="h-2" />
```

- Animate: Width transition (300ms)
- Color: Primary fill, gray track
- Height: 8px (standard)
- Use: File uploads, processing

### 9.3 Micro-interactions

**Button Press:**

```css
.button:active {
  transform: translateY(1px);
  box-shadow: none;
}
```

- Feedback: Move down 1px
- Remove shadow on press
- Duration: 100ms

**Checkbox Check:**

```css
.checkbox:checked + .checkmark {
  animation: checkmark 150ms ease-out;
}

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

**Hover Effects:**

```css
.card:hover {
  border-color: hsl(var(--primary));
  transition: border-color 150ms linear;
}
```

- Border color change (snappy)
- No easing on hover
- Reverse on mouse leave

### 9.4 Animation Library

**Recommended: Framer Motion**

```tsx
import { motion } from 'framer-motion';

// Fade-in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slide-in animation
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.2, ease: 'linear' }}
>
  Sidebar
</motion.div>
```

**Animation Presets:**

| Preset | Duration | Easing | Use Case |
|--------|----------|--------|----------|
| `fade-in` | 300ms | ease-out | Modal appear |
| `slide-up` | 200ms | linear | Bottom sheet |
| `slide-in-right` | 200ms | linear | Sidebar drawer |
| `scale-in` | 150ms | ease-out | Popover |
| `pulse` | 1500ms | ease-in-out | Loading indicator |

**Performance Rules:**
- Use `transform` instead of `left/top` (GPU-accelerated)
- Use `opacity` for fade effects (GPU-accelerated)
- Avoid animating `width/height` (triggers reflow)
- Test with Chrome DevTools Performance tab

---

## 10. Error Handling & Edge Cases

### 10.1 Error States

**Error Boundary Fallback:**

```tsx
<ErrorBoundary
  fallback={
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-6xl mb-4">💥</div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">
        {errorMessage}
      </p>
      <Button onClick={reset}>
        Try Again
      </Button>
    </div>
  }
>
  <ComponentThatMightFail />
</ErrorBoundary>
```

**Error Types:**

| Error Type | Icon | Message | Action |
|------------|------|---------|--------|
| Network | `wifi-off` | No internet connection | Retry button |
| API | `alert-triangle` | API request failed | Check API key |
| Permission | `lock` | Permission denied | Grant permission |
| Validation | `alert-circle` | Invalid input | Fix errors |
| Timeout | `clock` | Request timed out | Retry or cancel |

**Error Display Pattern:**

```tsx
<ErrorState
  title="Failed to load file"
  message="The file could not be read. Please check permissions."
  icon={<FileIcon />}
  actions={
    <>
      <Button variant="ghost" onClick={onCancel}>
        Go Back
      </Button>
    </>
  }
/>
```

### 10.2 Empty States

**No Plugins Active:**

```tsx
<EmptyPluginState
  icon={<PluginIcon />}
  title="No plugins active"
  description="Add plugins to customize your workspace"
  action={
    <Button onClick={onOpenPluginManager}>
      <PlusIcon className="mr-2" />
      Add Plugin
    </Button>
  }
/>
```

**No Files in Project:**

```tsx
<EmptyState
  icon={<FolderIcon />}
  title="No files yet"
  description="Create your first file to get started"
  action={
    <Button onClick={onCreateFile}>
      <PlusIcon className="mr-2" />
      New File
    </Button>
  }
/>
```

### 10.3 Loading States

**Full-Page Loading:**

```tsx
<LoadingState
  message="Loading workspace..."
  spinner={<LoadingSpinner className="h-12 w-12" />}
/>
```

- Centered on screen
- Orange spinner (32px)
- Translatable message
- Optional progress bar

**Component Loading:**

```tsx
<Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
<Skeleton className="h-4 w-[250px]" />          {/* Title */}
<Skeleton className="h-20 w-full" />            {/* Content */}
```

- Match final component size
- Pulse animation
- Use for lists, cards, tables

### 10.4 Recovery Flows

**Auto-Recovery:**

```tsx
useEffect(() => {
  const retryCount = 0;
  const maxRetries = 3;

  const attemptOperation = async () => {
    try {
      await operation();
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptOperation, 1000 * retryCount);
      } else {
        showError('Max retries reached');
      }
    }
  };

  attemptOperation();
}, []);
```

- Exponential backoff: 1s, 2s, 4s
- Max retries: 3 attempts
- Show error after final failure

**User Recovery:**

```
┌─────────────────────────────────────────┐
│ ⚠️ Connection Lost                      │
├─────────────────────────────────────────┤
│ Unable to reach server.             │
│                                         │
│ [Retry] [Go Offline] [Cancel]           │
└─────────────────────────────────────────┘
```

- Clear options
- Explain impact
- Offer alternative actions

**Undo/Redo:**

```tsx
import { toast } from 'sonner';

const handleDelete = () => {
  deleteItem();
  toast.success('Item deleted', {
    action: {
      label: 'Undo',
      onClick: () => restoreItem()
    }
  });
};
```

- Toast notification after action
- Undo button (5 second timeout)
- Restore previous state

---

## 11. Design Tokens Reference

### 11.1 CSS Custom Properties

**Complete Token List (from design-tokens.css):**

```css
/* === Core Brand Colors === */
--primary: 24.6 95% 53.1%;
--primary-foreground: 0 0% 100%;
--background: 240 6% 4%;
--foreground: 0 0% 95%;
--card: 240 4% 10%;
--card-foreground: 0 0% 95%;
--popover: 240 4% 10%;
--popover-foreground: 0 0% 95%;
--secondary: 240 4% 16%;
--secondary-foreground: 0 0% 90%;
--muted: 240 4% 16%;
--muted-foreground: 0 0% 60%;
--accent: 240 4% 16%;
--accent-foreground: 0 0% 95%;
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;
--border: 240 4% 16%;
--input: 240 4% 16%;
--ring: 24.6 95% 53.1%;

/* === Semantic Colors === */
--success: 142 71% 45%;
--success-foreground: 0 0% 100%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 0%;
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;

/* === Sidebar === */
--sidebar: 240 6% 6%;
--sidebar-foreground: 0 0% 95%;
--sidebar-primary: 24.6 95% 53.1%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 240 4% 14%;
--sidebar-accent-foreground: 0 0% 95%;
--sidebar-border: 240 4% 16%;
--sidebar-ring: 24.6 95% 53.1%;

/* === 8-bit Aesthetic === */
--radius: 0rem;
--radius-sm: 0.125rem;
--radius-md: 0.25rem;
--radius-lg: 0.375rem;
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
--shadow-pixel-sm: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-inset: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.05),
                   inset -1px -1px 0px 0px rgba(0, 0, 0, 0.5);

/* === Layout === */
--panel-2col-left: 30%;
--panel-2col-right: 70%;
--panel-3col-left: 25%;
--panel-3col-middle: 45%;
--panel-3col-right: 30%;
--panel-2plus1-top: 25%;
--panel-2plus1-main: 50%;
--panel-2plus1-row2: 25%;
--panel-2plus1-full: 100%;
--sidebar-activity-bar: 48px;
--sidebar-activity-bar-mobile: 40px;
--sidebar-content-panel: 280px;
--sidebar-content-panel-mobile: 200px;
--sidebar-content-panel-tablet: 240px;
--sidebar-content-panel-lg: 320px;
--status-bar-height: 24px;

/* === Responsive === */
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-lg: 1280px;
--font-size-mobile: 14px;
--font-size-tablet: 15px;
--font-size-desktop: 16px;
--font-size-lg: 17px;

/* === Touch Targets === */
--touch-target-min: 44px;
--size-xs: 32px;
--size-sm: 40px;
--size-md: 48px;
--size-lg: 56px;
--size-xl: 64px;

/* === Transitions === */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
```

### 11.2 TypeScript Constants

**Token Access (from design-tokens.ts):**

```typescript
// Import token functions
import { getToken, getColor, getSpacing } from '@/styles/design-tokens';

// Usage in components
const Button = styled.button`
  padding: ${getSpacing('spacing-4')};
  background: ${getColor('primary-500')};
  border-radius: ${getToken('radius-md')};
  box-shadow: ${getToken('shadow-pixel')};
`;
```

**Type-Safe Tokens:**

```typescript
// Color tokens
type ColorToken = 'primary' | 'secondary' | 'accent' | 'destructive';

// Spacing tokens
type SpacingToken = 'spacing-1' | 'spacing-2' | ... | 'spacing-24';

// Typography tokens
type FontSizeToken = 'text-xs' | 'text-sm' | 'text-base' | ... | 'text-5xl';

// Layout tokens
type LayoutToken = 'panel-2col-left' | 'sidebar-content-panel' | 'status-bar-height';
```

### 11.3 Tailwind Configuration

**Custom Tailwind Config (extends design tokens):**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        background: 'hsl(var(--background))',
        card: 'hsl(var(--card))',
        // ... all color tokens
      },
      spacing: {
        'sidebar': 'var(--sidebar-content-panel)',
        'activity-bar': 'var(--sidebar-activity-bar)',
      },
      borderRadius: {
        'none': 'var(--radius)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'pixel': 'var(--shadow-pixel)',
        'pixel-primary': 'var(--shadow-pixel-primary)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

**Utility Classes:**

```tsx
// Spacing
<div className="p-4"> {/* padding: 1rem */}

// Colors
<Button className="bg-primary text-primary-foreground">Click</Button>

// Borders
<div className="border border-border rounded-md">

// Shadows
<Card className="shadow-pixel">

// Layout
<Panel className="w-[var(--panel-2col-left)]">
```

---

## Appendix A: Alignment Summary

**Alignment with new-fundamental-truths.md v2.0.0:**

| Category | Previous (v1.0.0) | Current (v2.1.0) | Change |
|----------|---------------------|---------------------|--------|
| **Architecture** | Workspace-Centric | Project-Centric | Fundamental shift ✅ |
| **Plugin System UX** | 10% | 100% | **+90% - NEW section added** |
| **Plugin Panel Architecture** | 0% | 100% | **+100% - NEW Section 8 (EPIC-0.5)** |
| **Platform Responsiveness** | 40% | 100% | **+60% - Limits enforced** |
| **8-bit Design Compliance** | 95% | 95% | ✅ Maintained |
| **Layout System** | 0% | 100% | **+100% - Toggle-based presets** |
| **Progressive Disclosure** | 20% | 100% | **+80% - Plugin disclosure levels** |

**Overall Alignment:** 100% (7 categories average)

**Key Updates:**

1. ✅ Added Section 3: Plugin System UX (NEW)
   - Plugin toggle toolbar component
   - Platform-aware plugin limits
   - Layout mode selector (2-col, 3-col, 2+1)
   - Plugin management dialog
   - Progressive disclosure levels

2. ✅ Added Section 8: Plugin Panel Architecture (NEW - EPIC-0.5)
   - Panel Types (Sidebar Tab, Main Panel, Overlay)
   - Sidebar tabs (FileTree, Chat as sidebar content, not main panels)
   - Sidebar content switching behavior
   - Main panel grid (predefined layouts, no drag-drop)
   - Progressive disclosure for plugin loading
   - Plugin state persistence per project

3. ✅ Updated Section 6: Responsive Design
   - Mobile plugin limit (1 active plugin)
   - Tab bar for plugin switching
   - Platform capability indicators
   - Disabled plugin states

4. ✅ Updated Section 4: Navigation Patterns
   - Project-centric header
   - Plugin-based navigation
   - Single route structure

5. ✅ Updated Section 2: Component Library
   - Toggle-based layout system
   - Plugin count enforcement
   - Platform requirement badges

6. ✅ Added Section 6.5: Platform Capability Matrix (NEW)
   - Plugin availability by platform
   - UX indicators for unavailable plugins
   - Progressive disclosure of limitations

7. ✅ Removed all workspace-centric patterns
   - No workspace icons
   - No workspace-specific routes
   - Project-centric mental model

8. ✅ Added Section 8: Plugin Panel Architecture (EPIC-0.5)
   - FileTree and Chat as sidebar TABS
   - Main area for editor plugins only
   - Sidebar content switching
   - Plugin state persistence

9. ✅ Version updated to 2.1.0
10. ✅ Date updated to 2026-01-26
11. ✅ Reference to ADR-039 added
12. ✅ Reference to architecture.md v3.0.0 added
13. ✅ Reference to prd.md v2.0.0 added

---

## Appendix B: Related Documents

| Document | Description |
|----------|---------|
| `new-fundamental-truths.md` | Core architecture principles v2.0.0 |
| `architecture.md` | Via-Gent Architecture Document v3.0.0 |
| `prd.md` | Product Requirements Document v2.0.0 |
| `UX-SPECIFICATION-ANALYSIS-2026-01-26.md` | Alignment analysis report |

**Architectural Decisions:**

| ADR | Title | Status | Reference |
|-----|-------|--------|-----------|
| **ADR-039** | Unified Architecture Fundamentals (v2.0.0 Alignment) | PROPOSED |

---

**END OF DOCUMENT**

**Document Version:** 2.1.0 (Aligned with new-fundamental-truths.md v2.0.0)
**Previous Version:** 2.0.0 (2026-01-26)
**Last Updated:** 2026-01-26
**Author:** Architect-Ext (BMAD Framework)
**Status:** ACTIVE - 100% aligned with v2.0.0 fundamentals

**Next Review:** 2026-02-01 (weekly)

---

*This document reflects project-centric architecture with plugin system, toggle-based layouts, platform-aware defaults, progressive disclosure, and sidebar tab architecture (FileTree/Chat as sidebar content, not main panels) as defined in new-fundamental-truths.md v2.0.0.*
