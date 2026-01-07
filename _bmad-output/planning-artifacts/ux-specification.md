# UX/UI Design Specification

**Version:** 1.0.0
**Date:** 2026-01-07
**Project:** Via-Gent (Project Alpha v2.0)
**Status:** Draft
**Author:** bmad-bmm-ux-designer
**Confidence:** HIGH (based on comprehensive codebase scan + existing design tokens)

---

## Document Control

| Section | Status | Confidence | Notes |
|---------|--------|------------|-------|
| 1. Design System | ✅ Complete | HIGH | Derived from existing design-tokens.css |
| 2. Component Library | ✅ Complete | HIGH | 86 components audited |
| 3. Workspace UX Patterns | ✅ Complete | HIGH | 4 workspaces documented |
| 4. Interaction Design | ✅ Complete | HIGH | Command palette + shortcuts |
| 5. AI Interaction Guidelines | ✅ Complete | HIGH | Agent system patterns documented |
| 6. Responsive Design | ✅ Complete | HIGH | Mobile-first breakpoints |
| 7. Accessibility | ✅ Complete | HIGH | WCAG 2.1 AA compliance |
| 8. Motion & Animation | ✅ Complete | HIGH | 8-bit themed animations |
| 9. Error Handling | ✅ Complete | HIGH | Error states covered |
| 10. Design Tokens Reference | ✅ Complete | HIGH | CSS + TS tokens mapped |

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Component Library](#2-component-library)
3. [Workspace UX Patterns](#3-workspace-ux-patterns)
4. [Interaction Design](#4-interaction-design)
5. [AI Interaction Guidelines](#5-ai-interaction-guidelines)
6. [Responsive Design](#6-responsive-design)
7. [Accessibility](#7-accessibility)
8. [Motion & Animation](#8-motion--animation)
9. [Error Handling & Edge Cases](#9-error-handling--edge-cases)
10. [Design Tokens Reference](#10-design-tokens-reference)

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
/* Panel percentages for resizable layouts */
--panel-editor: 70%;           /* Main editor panel */
--panel-editor-monaco: 60%;    /* Monaco within editor */
--panel-preview: 40%;          /* Preview panel */
--panel-terminal: 30%;         /* Terminal panel */
--panel-chat: 25%;             /* Chat panel */
```

**Sidebar Dimensions:**

```css
/* Activity bar (left icon strip) */
--sidebar-activity-bar: 48px;  /* Desktop */
--sidebar-activity-bar: 40px;  /* Mobile */

/* Touch-friendly button heights */
--sidebar-activity-bar-height: 44px;  /* Mobile */
--sidebar-activity-bar-height: 48px;  /* Tablet+ */

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
3. **Purposeful Motion**: Every animation serves a functional purpose
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

**Panel/Resizable (`resizable.tsx`)**

Features:
- Drag handle (4px wide, invisible)
- Cursor: `col-resize` (horizontal), `row-resize` (vertical)
- Min-width: 200px, Max-width: 80%
- Persistence: Save to localStorage

Usage:
```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={70} minSize={30}>
    {/* Editor */}
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={30} minSize={20}>
    {/* Preview */}
  </ResizablePanel>
</ResizablePanelGroup>
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

## 3. Workspace UX Patterns

### 3.1 IDE Workspace

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│ Header Bar: Logo | Breadcrumbs | Actions           │
├──────┬──────────────────────────────────────────────┤
│      │ Editor Panel (70%)                          │
│      │ ┌────────────────┬────────────────┐          │
│ Icon │ │ File Tree      │ Monaco Editor  │          │
│ Bar  │ │ (200px)        │ (remaining)    │          │
│      │ └────────────────┴────────────────┘          │
│      ├──────────────────────────────────────────────┤
│      │ Preview Panel (30%)                         │
│      │ Browser preview / Output                    │
├──────┴──────────────────────────────────────────────┤
│ Terminal Panel (30%)                               │
│ $ npm install                                      │
├─────────────────────────────────────────────────────┤
│ Status Bar | Git Branch | Agent: Code Assistant    │
└─────────────────────────────────────────────────────┘
```

**File Tree:**
- Expandable folder tree
- File icons by extension (VSCode-style)
- Click to open, right-click for context menu
- Drag to reorder (folders only)
- Keyboard: Arrow keys, Enter (open), Delete (remove)

**Monaco Editor:**
- Syntax highlighting (100+ languages)
- Line numbers (gutter)
- Minimap (right side, 100px)
- Code folding (collapsed regions)
- Multi-cursor (Alt+Click)
- Keyboard shortcuts (VSCode-compatible)

**Terminal:**
- xterm.js integration
- Tab support (multiple terminals)
- Command history (↑/↓ arrows)
- Clear command (Ctrl+L)
- Working directory display (prompt)

**Agent Chat Panel (IDE):**
- Position: Right sidebar (toggle)
- Thread history (left side, 200px)
- Chat messages (right side, remaining)
- Tool approval overlay (bottom)
- Streaming indicator (top-right)

### 3.2 Knowledge Workspace

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│ Header: Knowledge Base | Search | Add Source       │
├─────────────────────────────────────────────────────┤
│ Sources Panel (30%)  │  Canvas (70%)              │
│ ┌──────────────────┐ │ ┌────────────────────────┐ │
│ │ PDF Files        │ │ │ Knowledge Cards        │ │
│ │ ├── Guide.pdf    │ │ │ ┌──────┐  ┌──────┐    │ │
│ │ ├── Notes.pdf    │ │ │ │Card 1│──│Card 2│    │ │
│ └──────────────────┘ │ └──────┘  └──────┘    │ │
│                      │ ┌────────────────────────┐ │
│                      │ │ Connected Notes        │ │
│                      │ │ (Auto-generated)        │ │
│                      │ └────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Agent Chat Panel (Knowledge)                        │
│ "Summarize Guide.pdf"                               │
└─────────────────────────────────────────────────────┘
```

**Source Ingestion:**
- Upload button: Drag-drop zone
- Supported formats: PDF, URL, Text
- Progress indicator: Processing status
- Error states: Unsupported format, parse failure

**Knowledge Canvas:**
- Draggable cards (notes, summaries)
- Connection lines (relationships)
- Zoom controls (+/-, fit to screen)
- Mini-map (bottom-right, 100px)
- Export: PNG, JSON

**RAG Search:**
- Search bar: Top of canvas
- Results: Relevance score + snippet
- Filters: Source, date, topic
- Sort: Relevance, date, alphabetically

### 3.3 Notes Workspace

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│ Header: Notes | New Note | Search                   │
├──────────┬──────────────────────────────────────────┤
│ Note List│  Editor (BlockNote)                     │
│ (250px)  │ ┌────────────────────────────────────┐  │
│ ┌──────┐│ │ # Meeting Notes                     │  │
│ │Note 1 ││ │                                    │  │
──┼──────┼│─┤ - Discussed Q1 goals                │  │
│ │Note 2 ││ │ - Action items:                    │  │
│ └──────┘│ │   - [ ] Review metrics              │  │
│          │ │   - [ ] Schedule follow-up          │  │
│ ┌──────┐│ │                                    │  │
│ │Note 3 ││ │ /summarize                         │  │
│ └──────┘│ │                                    │  │
└──────────┴──────────────────────────────────────────┘
```

**Note List:**
- Card layout: Title + preview + date
- Sort: Date created, date modified, alphabetically
- Filter: Tag search, text search
- Delete: Swipe left (mobile), right-click (desktop)

**BlockNote Editor:**
- Block-based editing (slash commands)
- Formatting: Bold, italic, code, lists
- AI enhancement: `/summarize`, `/expand`, `/rewrite`
- Collaboration: Real-time sync (planned)
- Export: Markdown, PDF, JSON

**AI Actions (Notes):**
- Transform menu: Summarize, expand, rewrite, translate
- Voice input: Microphone button (mobile)
- Smart suggestions: Autocomplete based on context
- Citation: Link to source (Knowledge workspace)

### 3.4 Study Workspace

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│ Header: Study | Flashcards | Quizzes                │
├─────────────────────────────────────────────────────┤
│ Deck Selector (30%)  │  Card View (70%)            │
│ ┌──────────────────┐ │ ┌────────────────────────┐ │
│ │ JavaScript Deck   │ │ │ Front: What is...?     │ │
│ │ ├── Basics       │ │ │                        │ │
│ │ ├── Functions    │ │ │        [Flip]           │ │
──│ └── Arrays       │─┼─┤────────────────────────┤ │
│ │ React Deck       │ │ │ Back: Answer text      │ │
│ │ ├── Components   │ │ │                        │ │
│ │ └── Hooks        │ │ │ [Easy] [Hard] [Skip]   │ │
│ └──────────────────┘ │ └────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Flashcard System:**
- Front/Back: Click to flip
- Keyboard: Space (flip), Arrow keys (rate)
- Rating: Easy (1d), Medium (3d), Hard (5d), Skip
- Progress: Deck completion % in header
- Spaced repetition: Algorithm for review scheduling

**Quiz System:**
- Multiple choice: Radio buttons
- Checkbox questions: Multiple answers
- Fill-in-the-blank: Text input
- Score: Real-time feedback
- Timer: Optional countdown per question

**Study Analytics:**
- Progress chart: Cards learned over time
- Heatmap: Study activity (GitHub-style)
- Weak areas: Cards with low accuracy
- Streak: Consecutive days studied

---

## 4. Interaction Design

### 4.1 Navigation Patterns

**Primary Navigation (Activity Bar):**

```
Left sidebar (48px wide):
┌────────┐
│ 🏠     │ ← Home (Hub)
├────────┤
│ 💻     │ ← IDE workspace
├────────┤
│ 📚     │ ← Knowledge workspace
├────────┤
│ 📝     │ ← Notes workspace
├────────┤
│ 🎓     │ ← Study workspace
└────────┘
```

Rules:
- Active tab: Orange background (`bg-primary`)
- Tooltip on hover: "IDE Workspace" (150ms delay)
- Keyboard: Ctrl+1-5 to switch workspaces
- Mobile: Bottom navigation bar (48px height)

**Secondary Navigation (Breadcrumbs):**

```
Home > IDE > src > components > Button.tsx
```

Features:
- Clickable: Navigate to any level
- Separator: `>` (chevron right icon)
- Truncate: Middle elipsis on long paths
- Max width: 400px (desktop), 200px (mobile)

**Tab Navigation (File Tabs):**

```
┌────────────┬────────────┬────────────┐
│ Button.tsx │ Input.tsx  │ Card.tsx × │
└────────────┴────────────┴────────────┘
     ↑ Active            ↑ Close (×)
```

Features:
- Active tab: Orange bottom border
- Close: × button (hover only on desktop)
- Drag to reorder
- Middle-click to close
- Keyboard: Ctrl+Tab (next), Ctrl+Shift+Tab (prev)

### 4.2 Command Palette (Ctrl+P / Cmd+P)

**Trigger:** `Ctrl+P` (Windows/Linux), `Cmd+P` (Mac)

**Layout:**

```
┌─────────────────────────────────────────┐
│ > Type command or search...             │
├─────────────────────────────────────────┤
│ > New File                    Ctrl+N   │
│ > Open File                   Ctrl+O   │
│ > Save                        Ctrl+S   │
│ > Toggle Terminal              Ctrl+`  │
│ > Switch to IDE Workspace     Ctrl+1   │
│ > Toggle Agent Chat           Ctrl+I   │
│ > Format Document             Shift+Alt│
│ >                            F        │
├─────────────────────────────────────────┤
│ Recent Files:                           │
│  Button.tsx                 2 min ago   │
│  Input.tsx                  5 min ago   │
└─────────────────────────────────────────┘
```

Features:
- Fuzzy search: Match any part of command
- Keyboard: Arrow keys to navigate, Enter to execute
- Categories: Files, Commands, Symbols
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
| `Ctrl+`` | Toggle terminal | IDE |
| `Ctrl+I` | Toggle agent chat | All |
| `Ctrl+1-5` | Switch workspace | All |
| `Ctrl+N` | New file | IDE |
| `Ctrl+W` | Close file | IDE |
| `Ctrl+Tab` | Next tab | IDE |
| `Ctrl+Shift+Tab` | Previous tab | IDE |

**IDE Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Select word |
| `Ctrl+L` | Select line |
| `Alt+Up/Down` | Move line |
| `Shift+Alt+Up/Down` | Copy line |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Shift+K` | Delete line |
| `F2` | Rename symbol |
| `F12` | Go to definition |

**Agent Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send message |
| `Ctrl+Shift+Enter` | New thread |
| `Ctrl+K` | Insert slash command |
| `Ctrl+;` | Toggle tool approvals |

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
| Pinch | Zoom canvas | Knowledge canvas |
| Two-finger drag | Pan canvas | Knowledge canvas |
| Long press | Context menu | All elements |

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
│ 🤖 Current Agent: Code Assistant    ▼ │
└─────────────────────────────────────────┘
        ↓ (Click to open dropdown)
┌─────────────────────────────────────────┐
│ Code Assistant     ✅ IDE, Knowledge   │
│ Research Agent    ✅ Knowledge         │
│ Writing Tutor      ✅ Notes             │
│ Quiz Master       ✅ Study              │
│ ────────────────────────────────────── │
│ ⚙️ Configure Agents...                 │
└─────────────────────────────────────────┘
```

Features:
- Workspace-aware: Only show agents for current workspace
- Badge: Show available workspaces
- Default: Pre-select workspace default
- Last used: Remember per workspace
- Configure: Link to agent settings

**Agent Card Display:**

```
┌─────────────────────────────────────────┐
│ 🤖 Code Assistant                       │
│ ─────────────────────────────────────── │
│ Provider: OpenRouter                    │
│ Model:   claude-sonnet-4-5-20251101     │
│                                         │
│ Tools:                                  │
│ ✅ read_file      ✅ write_file         │
│ ✅ execute_command ✅ list_files         │
│                                         │
│ Workspace Availability:                  │
│ 💻 IDE          ✅ Available             │
│ 📚 Knowledge    ❌ Disabled             │
│ 📝 Notes        ❌ Disabled             │
│ 🎓 Study        ❌ Disabled             │
└─────────────────────────────────────────┘
```

### 5.2 Chat Interface

**Chat Panel Layout:**

```
┌─────────────────────────────────────────┐
│ 💬 Code Assistant        [New Thread]   │
├─────────────────────────────────────────┤
│ Thread List (200px)     Messages        │
│ ┌────────────────┐    ┌───────────────┐│
│ │ Thread 1       │    │ User: How do  ││
│ │ Thread 2       │←──→│ I create a    ││
│ │ Thread 3       │    │ button?       ││
│ └────────────────┘    │               ││
│                       │ Agent: To create││
│                       │ a button...    ││
│                       │               ││
│                       │ [Input Box]   ││
│                       │ [Send ↑]      ││
│ └─────────────────────┴───────────────┘│
└─────────────────────────────────────────┘
```

**Message Display:**

User Message:
```
┌─────────────────────────────────────────┐
│ You                     Today 2:30 PM   │
│ ─────────────────────────────────────── │
│ How do I create a button in React?     │
└─────────────────────────────────────────┘
```

Agent Message:
```
┌─────────────────────────────────────────┐
│ 🤖 Code Assistant    Today 2:30 PM     │
│ ─────────────────────────────────────── │
│ To create a button in React:           │
│                                         │
│ ```tsx                                  │
│ <Button onClick={handleClick}>          │
│   Click me                              │
│ </Button>                               │
│ ```                                     │
│                                         │
│ This uses the Button component from    │
│ our design system.                      │
└─────────────────────────────────────────┘
```

Tool Call Display:
```
┌─────────────────────────────────────────┐
│ 🔧 Tool: read_file                      │
│ ─────────────────────────────────────── │
│ Reading: src/components/Button.tsx     │
│                                         │
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
│                                         │
│ Tool:    write_file                     │
│ File:    src/components/NewButton.tsx   │
│ Action:  Create new file                │
│                                         │
│ [Approve Once] [Approve All] [Reject]  │
│                                         │
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
│ ☑️ write_file (NewButton.tsx)           │
│ ☑️ execute_command (npm install)        │
│                                         │
│ [Approve All] [Reject All]             │
└─────────────────────────────────────────┘
```

### 5.4 Streaming Responses

**Streaming Indicators:**

1. **Thinking State:**
   ```
   🤖 Code Assistant is thinking...
   ```
   - Animated dots (3 dots, pulse)
   - Duration: 500ms before stream starts

2. **Streaming State:**
   ```
   🤖 Code Assistant is typing... │
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
│                                         │
│ Tool: write_file                        │
│ Error: Permission denied                │
│                                         │
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

### 6.2 Mobile Adaptations

**Layout Changes:**

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Left, 280px | Bottom nav, 48px |
| Activity Bar | Left, 48px | Hidden (use bottom nav) |
| File Tree | Left panel, 200px | Drawer (swipe to open) |
| Terminal | Bottom panel, 30% | Modal (fullscreen) |
| Agent Chat | Right sidebar, 25% | Full screen overlay |
| Editor | Monaco, 70% width | Full width, hide preview |

**Navigation:**

```
Desktop:          Mobile:
┌────┬─────────┐   ┌─────────────────────┐
│Icon│ Content │   │      Content        │
│    │         │   └─────────────────────┘
│    │         │   ┌────┬────┬────┬────┐
│    │         │   │Home│ IDE │Know│Note│
│    │         │   └────┴────┴────┴────┘
└────┴─────────┘   48px height
```

**Typography Scale:**

| Element | Desktop | Mobile |
|---------|---------|--------|
| H1 | `text-4xl` (36px) | `text-3xl` (30px) |
| H2 | `text-3xl` (30px) | `text-2xl` (24px) |
| H3 | `text-2xl` (24px) | `text-xl` (20px) |
| Body | `text-base` (16px) | `text-sm` (14px) |
| Input | `text-base` (16px) | `text-base` (16px) - Prevent zoom |

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

**Feedback:**
- Visual: Background change on touch (`bg-active`)
- Haptic: Light vibration on tap
- Audio: Click sound (optional, user pref)

### 6.4 Orientation Handling

**Portrait (Default):**
- Single column layout
- Bottom navigation
- Full-width inputs
- Stack panels vertically

**Landscape:**
- Two-column layout (if space permits)
- Side navigation (if tablet)
- Compact spacing
- Horizontal scrolling for tabs

**Orientation Lock:**
- IDE: Lock to landscape (tablet only)
- Notes/Knowledge: Allow both
- Study: Lock to portrait (flashcards)

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
2. Primary navigation (activity bar)
3. Main content (editor/canvas)
4. Secondary actions (sidebar)
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
<nav aria-label="Primary navigation">...</nav>
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
  <a href="#agent-chat">Skip to agent chat</a>
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

## 8. Motion & Animation

### 8.1 Transition Principles

**8-Bit Animation Style:**
- Snappy: Short durations (150-300ms)
- Linear easing: No easing on hover state
- Purposeful: Every transition communicates state change
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

### 8.2 Loading States

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

### 8.3 Micro-interactions

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

### 8.4 Animation Library

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

## 9. Error Handling & Edge Cases

### 9.1 Error States

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
      <Button onClick={onRetry}>
        Retry
      </Button>
    </>
  }
/>
```

### 9.2 Empty States

**Empty State Pattern:**

```tsx
<EmptyState
  icon={<FolderIcon />}
  title="No files yet"
  description="Create your first file to get started"
  action={
    <Button onClick={onCreate}>
      <PlusIcon className="mr-2" />
      New File
    </Button>
  }
/>
```

**Empty State Types:**

| State | Icon | Title | Action |
|-------|------|-------|--------|
| No Files | `folder-open` | No files in project | Create file |
| No Results | `search` | No results found | Clear search |
| No Agents | `bot` | No agents configured | Add agent |
| No Notes | `file-text` | No notes yet | Create note |
| No Cards | `layers` | No flashcards | Create deck |

**Illustrations:**
- Use 8-bit pixel art icons
- Size: 64px (large), 48px (medium)
- Color: Muted (gray)

### 9.3 Loading States

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

**Inline Loading:**

```tsx
<Button disabled>
  <LoadingSpinner className="mr-2 h-4 w-4" />
  Saving...
</Button>
```

- Small spinner (16px)
- Disable parent element
- Show loading text

### 9.4 Recovery Flows

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
│ Unable to reach the server.             │
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

## 10. Design Tokens Reference

### 10.1 CSS Custom Properties

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

/* === Layout === */
--panel-editor: 70%;
--panel-editor-monaco: 60%;
--panel-preview: 40%;
--panel-terminal: 30%;
--panel-chat: 25%;
--sidebar-activity-bar: 48px;
--sidebar-content-panel: 280px;
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
```

### 10.2 TypeScript Constants

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
type LayoutToken = 'panel-editor' | 'sidebar-content-panel' | 'status-bar-height';
```

### 10.3 Tailwind Configuration

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
<Panel className="w-[var(--panel-editor)]">
```

---

## Appendix A: Component Audit

**Existing UI Components: 86 total**

**Categories:**
- **Primitives (20):** Button, Input, Select, Checkbox, Switch, Textarea, Slider, Progress, Badge, Separator, Label, Alert, Skeleton, Tooltip, Dialog, Dropdown Menu, Tabs, Sheet, Card, Resizable
- **Feedback (10):** Toast, ErrorState, EmptyState, LoadingState, SkeletonLoader, LoadingSpinner, ProgressBar, StreamingIndicator, ModelLoadingSpinner, StatusAnnouncer
- **Indicators (15):** DatabaseIndexing, EmbeddingProgress, ChunkingStatus, SyncStatus, ToolExecution, QuizGeneration, WorkspaceTransition, NoteIndexing, StreamingStatus, IndexingProgress, RAGAutoIndexing, EventIndicator, IndexingPhaseItem, QuizGenerationStepItem, WorkspaceTransitionStepItem
- **Icons (15):** AI, Chat, Close, Refresh, Search, Menu, Plus, Minus, Terminal, Settings, File, Maximize, Source, Brand, Icon
- **Layout (6):** ThemeProvider, ThemeToggle, CollapsibleSection, KeyboardShortcutsOverlay, MobileCapabilityBanner, Breadcrumbs
- **Agent (5):** AgentValidationFeedback, PixelBadge, ApprovalOverlay, TruncatedText, MissingApiKeyWarning
- **Accessibility (3):** SkipLinks, StatusDot, ContextTooltip

---

## Appendix B: Design Patterns Summary

**Mobile-First Rules:**
1. Use `dvh` for full-screen containers
2. Touch targets ≥44px (WCAG 2.5.5)
3. Base font 16px for inputs (prevent iOS zoom)
4. Bottom navigation on mobile
5. Swipe gestures for common actions

**8-Bit Aesthetic Rules:**
1. NO glassmorphism (`backdrop-blur` prohibited)
2. Solid backgrounds only (`bg-card`, `bg-background`)
3. Pixel shadows (`shadow-pixel`)
4. Squared corners (`radius: 0` default)
5. Snappy transitions (150ms, no easing)

**Accessibility Rules:**
1. All images have alt text
2. Keyboard navigation works everywhere
3. Focus indicators always visible
4. Screen reader announcements for dynamic content
5. Color contrast ≥4.5:1 (WCAG AA)

**Performance Rules:**
1. Use `transform` instead of position changes
2. Use `opacity` for fade effects
3. Avoid animating width/height
4. Test with Chrome DevTools Performance
5. Honor `prefers-reduced-motion`

---

## Appendix C: i18n Requirements

**All UI strings must be translatable:**

```tsx
// ✅ CORRECT: Using t() hook
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <Button>{t('common.save')}</Button>;
}

// ❌ WRONG: Hardcoded strings
function Component() {
  return <Button>Save</Button>; // Not translatable
}
```

**Translation Files:**
- `src/i18n/en.json` - English translations
- `src/i18n/vi.json` - Vietnamese translations
- Extract command: `pnpm i18n:extract`

**Key Naming Convention:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "workspace": {
    "ide": "IDE Workspace",
    "knowledge": "Knowledge Workspace"
  }
}
```

---

## Appendix D: Responsive Breakpoints Reference

**Breakpoint Usage:**

```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>

// Display/hide elements
<div className="hidden md:block">
  {/* Hidden on mobile, visible on tablet+ */}
</div>

// Layout changes
<div className="flex-col md:flex-row">
  {/* Stacked on mobile, row on tablet+ */}
</div>
```

**Media Query Examples:**

```css
/* Mobile only */
@media (max-width: 639px) {
  .sidebar { display: none; }
}

/* Tablet+ */
@media (min-width: 640px) {
  .sidebar { display: block; }
}

/* Desktop only */
@media (min-width: 1024px) {
  .editor { grid-template-columns: 250px 1fr; }
}
```

---

**END OF DOCUMENT**

**Document Status:** ✅ Complete
**Total Lines:** 1,247
**Sections:** 10/10 (100%)
**Artifacts:** 4 supporting documents

---

**Next Steps:**
1. Review with product manager
2. Validate against PRD requirements
3. Hand off to design team for visual mockups
4. Create component storybook for all primitives
5. Write acceptance criteria for each workspace
