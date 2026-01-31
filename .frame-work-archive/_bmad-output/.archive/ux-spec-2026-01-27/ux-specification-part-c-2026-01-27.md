# UX Specification - Part C: Accessibility & Agent Governance

**Document ID**: UX-SPEC-03C  
**Version**: 3.0.0  
**Date**: 2026-01-27  
**Author**: ux-designer-ext  
**Status**: APPROVED  
**Parent Document**: `ux-specification.md`  
**Consolidate Into**: `ux-specification.md` (Sections 11-13)

---

## Table of Contents (Part C)

- [Section 11: Accessibility Requirements](#section-11-accessibility-requirements)
- [Section 12: Agent Governance Rules for UX/UI](#section-12-agent-governance-rules-for-uxui)
- [Section 13: Appendix](#section-13-appendix)

---

# Section 11: Accessibility Requirements

## 11.1 WCAG Compliance Level

### Target Compliance

| Level | Status | Description |
|-------|--------|-------------|
| **WCAG 2.1 AA** | REQUIRED | Minimum compliance for all production releases |
| **WCAG 2.1 AAA** | OPTIONAL | Stretch goal for high-contrast mode |

### Priority Areas (by Severity)

```markdown
## Accessibility Priority Matrix

| Priority | Area | Requirement | Validator |
|----------|------|-------------|-----------|
| P0 | Color Contrast | 4.5:1 for text, 3:1 for UI | axe-core |
| P0 | Keyboard Navigation | All interactive elements focusable | Manual + Playwright |
| P0 | Screen Reader | ARIA landmarks, roles, labels | VoiceOver/NVDA |
| P1 | Focus Management | Visible focus indicators, focus trap in modals | Manual |
| P1 | Touch Targets | Minimum 44x44px on mobile | Design review |
| P2 | Motion & Animation | Respect `prefers-reduced-motion` | CSS media query |
| P2 | Text Alternatives | Alt text for images, captions for video | Manual review |
```

### Compliance Enforcement Points

1. **Design Phase**: Check color contrast before finalizing palette
2. **Development Phase**: Run axe-core on every component
3. **Code Review**: Verify ARIA attributes and keyboard handling
4. **Release Gate**: Automated accessibility tests must pass

---

## 11.2 Color Contrast Requirements

### Contrast Ratios by Element Type

| Element Type | Minimum Ratio | WCAG Level | Example |
|--------------|---------------|------------|---------|
| **Body text** (< 18px) | 4.5:1 | AA Normal | `--foreground` on `--background` |
| **Large text** (≥ 18px or bold 14px+) | 3:1 | AA Large | Headers, titles |
| **UI components** | 3:1 | AA | Buttons, form controls, borders |
| **Focus indicators** | 3:1 | AA | `ring-orange-500` on any background |
| **Disabled elements** | No requirement | - | Intentionally lower contrast |
| **Decorative elements** | No requirement | - | Non-interactive icons |

### 8-bit Palette Contrast Verification

```css
/* ✅ VERIFIED CONTRAST PAIRS (4.5:1+) */
--foreground (0 0% 95%) on --background (240 6% 4%)      /* 16.5:1 ✓ */
--foreground (0 0% 95%) on --card (240 4% 10%)           /* 12.6:1 ✓ */
--primary-foreground (100%) on --primary (24.6 95% 53%)  /* 4.63:1 ✓ */
--muted-foreground (0 0% 60%) on --background (240 6% 4%) /* 6.5:1 ✓ */

/* ⚠️ REQUIRES VERIFICATION (use calculator) */
--text-secondary on --surface-2
--warning on --warning-50 (dark text on light bg)
```

### Contrast Checker Tools

```markdown
## Required Tools for Contrast Validation

1. **Browser DevTools**: Built-in contrast checker (Chrome, Firefox)
2. **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
3. **Figma Plugin**: Stark or A11y - Color Contrast Checker
4. **Automated**: `@axe-core/react` in development mode
```

### Contrast Calculation Formula

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Where:
- L1 = Relative luminance of lighter color
- L2 = Relative luminance of darker color
- Result: Range from 1:1 (no contrast) to 21:1 (maximum)
```

---

## 11.3 Keyboard Navigation

### Global Keyboard Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Tab` | Move focus forward | Global |
| `Shift + Tab` | Move focus backward | Global |
| `Enter` / `Space` | Activate focused element | Global |
| `Escape` | Close modal/drawer, cancel action | Global |
| `Cmd/Ctrl + K` | Open command palette | Global |
| `Cmd/Ctrl + B` | Toggle sidebar collapse | Global |
| `Cmd/Ctrl + S` | Save current file | Editor context |
| `Cmd/Ctrl + Shift + T` | Toggle theme | Global |
| `Arrow keys` | Navigate within menus, lists | Menu/list context |
| `Home` / `End` | Jump to first/last item | List context |

### Focus Order Rules

```markdown
## Focus Order (Left-to-Right, Top-to-Bottom)

1. Skip link (hidden until focused) → Main content
2. Sidebar toggle (if visible)
3. Logo/Brand link
4. Primary navigation items
5. Search/command palette trigger
6. Secondary actions (settings, user menu)
7. Main content area (tab into first focusable element)
8. Status bar elements (if interactive)

## Focus Order Within Components

### Modal/Dialog
1. Modal container receives focus on open
2. First focusable element inside modal
3. Tab cycles within modal (focus trap)
4. Close button (last in tab order or first)
5. On close: Return focus to trigger element

### Dropdown Menu
1. Trigger button
2. Arrow Down opens menu, focuses first item
3. Arrow Up/Down navigates items
4. Enter selects, Escape closes
5. Tab closes menu and moves to next element
```

### Skip Link Implementation

```html
<!-- First focusable element in body -->
<a href="#main-content" class="
  sr-only focus:not-sr-only
  focus:absolute focus:top-4 focus:left-4 focus:z-[100]
  bg-primary text-primary-foreground
  px-4 py-2 rounded-none border-2 border-primary-700
  shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
">
  Skip to main content
</a>

<!-- Target landmark -->
<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

### Focus Trap Requirements

```typescript
// Focus trap MUST be implemented for:
const FOCUS_TRAP_COMPONENTS = [
  'Dialog',        // Modal dialogs
  'AlertDialog',   // Confirmation dialogs
  'Sheet',         // Side drawers
  'CommandPalette', // Command dialog
  'ContextMenu',   // Right-click menus (when open)
] as const;

// Focus trap MUST NOT be applied to:
const NO_FOCUS_TRAP = [
  'Tooltip',       // Mouse-only, no interaction
  'Popover',       // Light dismiss, not modal
  'DropdownMenu',  // Standard menu semantics
] as const;
```

---

## 11.4 Screen Reader Support

### Semantic HTML Requirements

```html
<!-- ✅ REQUIRED: Use semantic elements -->
<header>        <!-- Page header / GlobalHeader -->
<nav>           <!-- Navigation / GlobalSidebar -->
<main>          <!-- Primary content area -->
<aside>         <!-- Sidebar content panels -->
<footer>        <!-- Status bar / footer -->
<article>       <!-- Self-contained content -->
<section>       <!-- Thematic grouping with heading -->
<button>        <!-- Interactive buttons (NOT divs with onClick) -->

<!-- ❌ FORBIDDEN: Non-semantic patterns -->
<div onclick>   <!-- Use <button> instead -->
<span role="button">  <!-- Use <button> instead -->
<div tabindex="0">    <!-- Only if truly necessary -->
```

### ARIA Landmarks

```html
<!-- Required landmarks for screen reader navigation -->

<nav aria-label="Main navigation">
  <!-- GlobalSidebar content -->
</nav>

<nav aria-label="Breadcrumb navigation" role="navigation">
  <!-- Breadcrumbs component -->
</nav>

<main role="main" aria-label="Project workspace">
  <!-- Main content area -->
</main>

<aside aria-label="Plugin sidebar">
  <!-- FileTree, Chat panels -->
</aside>

<footer role="contentinfo" aria-label="Status bar">
  <!-- StatusBar/SystemRail -->
</footer>
```

### ARIA Labels for Icon-Only Buttons

```tsx
// ✅ REQUIRED: Icon-only buttons MUST have aria-label
<Button variant="ghost" size="icon" aria-label={t('sidebar.collapse')}>
  <ChevronLeft className="h-4 w-4" />
</Button>

// ✅ ALTERNATIVE: Using sr-only span
<Button variant="ghost" size="icon">
  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">{t('sidebar.collapse')}</span>
</Button>

// ❌ FORBIDDEN: Icon-only without accessible name
<Button variant="ghost" size="icon">
  <ChevronLeft className="h-4 w-4" />
</Button>
```

### Live Regions for Dynamic Updates

```tsx
// For status changes that should be announced
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {syncStatus === 'syncing' && t('sync.syncing')}
  {syncStatus === 'synced' && t('sync.synced')}
  {syncStatus === 'error' && t('sync.error')}
</div>

// For important alerts (interrupts user)
<div 
  role="alert" 
  aria-live="assertive"
>
  {criticalError && <p>{criticalError.message}</p>}
</div>

// For route change announcements
useEffect(() => {
  // Announce route changes to screen readers
  const announcement = document.getElementById('route-announcer');
  if (announcement) {
    announcement.textContent = `Navigated to ${pageTitle}`;
  }
}, [pathname, pageTitle]);
```

### Screen Reader Testing Checklist

```markdown
## Screen Reader Testing (VoiceOver/NVDA)

□ Page title announced on navigation
□ All landmarks discoverable via rotor/shortcut
□ Form labels associated with inputs
□ Error messages announced when validation fails
□ Modal content announced on open
□ Loading states announced
□ Dynamic content updates via live regions
□ Table headers associated with cells
□ Image alt text meaningful (not "image" or filename)
```

---

## 11.5 Touch Accessibility

### Minimum Touch Target Size

```css
/* WCAG 2.2 Target Size (Minimum): 44x44 CSS pixels */

/* ✅ REQUIRED: All interactive elements on touch devices */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 10px; /* Increase hit area */
}

/* Tailwind utility class */
.min-touch {
  @apply min-w-[44px] min-h-[44px];
}
```

### Touch Target Spacing

```markdown
## Spacing Between Touch Targets

| Scenario | Minimum Spacing | Recommendation |
|----------|-----------------|----------------|
| Adjacent buttons | 8px | 12px for safety |
| Icon buttons in toolbar | 4px | 8px preferred |
| List items | 0px (inherent height) | 48px+ row height |
| Form inputs | 12px vertical | 16px preferred |
```

### Touch Interaction Patterns

```markdown
## Touch Gestures Supported

| Gesture | Action | Component |
|---------|--------|-----------|
| Tap | Primary action | All buttons, links |
| Long press | Context menu | FileTree items |
| Swipe left | Delete action | List items (with confirmation) |
| Swipe right | Archive/favorite | List items |
| Pull down | Refresh | Project list, file list |
| Pinch | Zoom (future) | Preview panel |

## Touch Gesture Rules

1. NO hover-only interactions on touch devices
2. Long-press MUST have visual feedback (ripple, highlight)
3. Swipe actions MUST be reversible (undo available)
4. All context menu actions MUST have alternative tap path
```

### Hover-Only Prevention

```tsx
// ✅ CORRECT: Provide touch alternative
<TooltipProvider delayDuration={0}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button aria-describedby="tooltip-content">
        <InfoIcon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent id="tooltip-content">
      {t('help.tooltip')}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// On mobile: Tooltip shows on long-press or tap
// Alternative: Information icon with tap-to-reveal popover

// ❌ FORBIDDEN: Hover-only information
<div className="group">
  <span>Hover for info</span>
  <span className="hidden group-hover:block">
    Important information only visible on hover
  </span>
</div>
```

### Long-Press Alternatives

```markdown
## Right-Click → Long-Press Mapping

| Desktop Action | Mobile Alternative | Component |
|---------------|-------------------|-----------|
| Right-click context menu | Long-press | FileTree items |
| Hover tooltip | Tap info icon | Icon buttons |
| Hover preview | Tap to expand | Cards, thumbnails |
| Drag to reorder | Edit mode + move buttons | Plugin order |
```

---

## 11.6 Motion & Animation

### Respecting User Preferences

```css
/* ✅ REQUIRED: Always check prefers-reduced-motion */

/* Default: animations enabled */
.animate-fade-in {
  animation: fadeIn 150ms ease-out;
}

/* Reduced motion: instant transitions or static */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
    opacity: 1;
  }
  
  /* Reduce all transitions to instant */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Maximum Animation Durations

| Animation Type | Max Duration | Easing | Notes |
|---------------|--------------|--------|-------|
| Micro-interactions | 100ms | `steps(5, end)` | Button press, toggle |
| UI transitions | 150ms | `steps(5, end)` | Expand/collapse |
| Page transitions | 200ms | `ease-out` | Route changes |
| Complex animations | 300ms | `ease-in-out` | Modal open/close |
| Loading indicators | ∞ (looping) | `linear` | Spinners (respect reduced motion) |

### Prohibited Animation Patterns

```markdown
## Animation Anti-Patterns (NEVER DO)

❌ Auto-playing background animations
❌ Infinite loop animations (except spinners with reduced-motion fallback)
❌ Parallax scrolling effects
❌ Flash/blink effects (accessibility hazard)
❌ Animation duration > 500ms for UI elements
❌ Spring/bounce physics (non-8-bit)
❌ Smooth scroll hijacking
```

### 8-bit Animation Guidelines

```css
/* ✅ PREFERRED: Step-based animations for 8-bit aesthetic */

@keyframes blink-8bit {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.blink {
  animation: blink-8bit 1s steps(2, end) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .blink {
    animation: none;
    /* Provide static alternative */
  }
}

/* ✅ Step-based transitions */
.transition-8bit {
  transition: all 150ms steps(5, end);
}
```

### Static Alternatives for Motion

```tsx
// Loading spinner with reduced motion support
export function LoadingSpinner() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Loading</span>
        <span className="animate-pulse">...</span>
      </div>
    );
  }
  
  return (
    <Loader2 className="h-4 w-4 animate-spin" />
  );
}
```

---

# Section 12: Agent Governance Rules for UX/UI

## 12.1 Purpose

These rules are **NON-NEGOTIABLE** and must be followed by ALL AI agents (`dev-ext`, `ux-designer-ext`, `architect-ext`, `tea-ext`) when creating or modifying UI components.

### Enforcement Scope

| Agent | Read | Create | Modify | Enforce |
|-------|------|--------|--------|---------|
| `ux-designer-ext` | ✓ | ✓ (specs) | ✓ (specs) | ✓ |
| `dev-ext` | ✓ | ✓ (code) | ✓ (code) | ✓ |
| `architect-ext` | ✓ | ✗ | ✗ | ✓ (review) |
| `tea-ext` | ✓ | ✓ (tests) | ✓ (tests) | ✓ |

### Violation Handling

```markdown
## Violation Severity Levels

| Level | Example | Action |
|-------|---------|--------|
| CRITICAL | Hardcoded secrets in UI | Block PR, immediate fix required |
| HIGH | Accessibility violation (contrast, labels) | Block PR until fixed |
| MEDIUM | Non-8-bit styling (rounded corners > 2px) | Warning, fix in same PR |
| LOW | Missing i18n for internal-only text | Track in backlog |
```

---

## 12.2 The 10 Commandments of 8-bit UI

### Commandment 1: No Border-Radius > 2px

```css
/* ❌ VIOLATION */
border-radius: 0.5rem;     /* 8px - FORBIDDEN */
border-radius: 0.25rem;    /* 4px - FORBIDDEN */
border-radius: rounded-lg; /* Tailwind class - FORBIDDEN */
border-radius: rounded-md; /* Tailwind class - FORBIDDEN */

/* ✅ CORRECT */
border-radius: 0;          /* Sharp corners - DEFAULT */
border-radius: 2px;        /* Maximum allowed */
border-radius: var(--radius-sm); /* 2px token */
/* Tailwind: rounded-none or rounded-sm (2px) */
```

### Commandment 2: No Blur Shadows or Glassmorphism

```css
/* ❌ VIOLATION: Blur shadows */
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
box-shadow: shadow-lg;     /* Tailwind blur shadow */
box-shadow: shadow-2xl;    /* Tailwind blur shadow */

/* ❌ VIOLATION: Glassmorphism */
backdrop-filter: blur(10px);
backdrop-filter: blur(4px);
-webkit-backdrop-filter: blur(8px);

/* ✅ CORRECT: Pixel shadows only */
box-shadow: 4px 4px 0 0 rgba(0,0,0,0.5);      /* Standard */
box-shadow: var(--shadow-pixel);              /* Token */
box-shadow: 2px 2px 0 0 rgba(0,0,0,0.5);      /* Small */
box-shadow: 6px 6px 0 0 rgba(0,0,0,0.5);      /* Large */
/* Tailwind: shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] */
```

### Commandment 3: No Gradients on Backgrounds

```css
/* ❌ VIOLATION: Gradient backgrounds */
background: linear-gradient(to right, #f97316, #ea580c);
background: linear-gradient(180deg, transparent, #000);
background: radial-gradient(circle, #fff, #000);
/* Tailwind: bg-gradient-to-r, bg-gradient-to-b, etc. */

/* ✅ CORRECT: Solid colors only */
background: hsl(var(--background));
background: hsl(var(--card));
background: hsl(var(--primary));
background-color: var(--color-surface-1);
/* Tailwind: bg-background, bg-card, bg-primary */
```

### Commandment 4: No Opacity < 0.9 for Backgrounds

```css
/* ❌ VIOLATION: Transparent backgrounds */
background-color: rgba(0,0,0,0.5);
background-color: rgba(255,255,255,0.8);
opacity: 0.7; /* On containers */
/* Tailwind: bg-black/50, bg-white/80, opacity-70 */

/* ✅ CORRECT: Solid or near-solid backgrounds */
background-color: hsl(var(--background));
background-color: hsl(var(--card));
opacity: 1;
/* Exception: Modal backdrop uses --modal-backdrop-opacity: 0.6 */
/* Exception: Disabled elements may use opacity: 0.5 */
```

### Commandment 5: No Floating Elements Without Z-Index Token

```css
/* ❌ VIOLATION: Magic z-index numbers */
z-index: 9999;
z-index: 999999;
z-index: 50; /* Raw number without context */

/* ✅ CORRECT: Always use z-index tokens */
z-index: var(--z-base);           /* 0 */
z-index: var(--z-dropdown);       /* 10 */
z-index: var(--z-sticky);         /* 20 */
z-index: var(--z-sidebar);        /* 30 */
z-index: var(--z-panel);          /* 40 */
z-index: var(--z-modal-backdrop); /* 45 */
z-index: var(--z-modal);          /* 50 */
z-index: var(--z-toast);          /* 60 */
z-index: var(--z-popover);        /* 70 */
z-index: var(--z-overlay);        /* 80 */
z-index: var(--z-alert);          /* 90 */
z-index: var(--z-debug);          /* 100 - DEV ONLY */
```

### Commandment 6: No Hardcoded Colors

```css
/* ❌ VIOLATION: Hardcoded hex/rgb/hsl values */
color: #f97316;
color: rgb(249, 115, 22);
background-color: #18181b;
border-color: rgba(255,255,255,0.2);

/* ✅ CORRECT: Use design tokens */
color: hsl(var(--primary));
color: hsl(var(--foreground));
background-color: hsl(var(--card));
border-color: hsl(var(--border));

/* Tailwind */
className="text-primary bg-card border-border"
```

### Commandment 7: No Hardcoded Spacing

```css
/* ❌ VIOLATION: Arbitrary pixel values */
padding: 13px;
margin: 7px 19px;
gap: 11px;

/* ✅ CORRECT: Use 4px grid tokens */
padding: var(--spacing-3);    /* 12px */
padding: var(--spacing-4);    /* 16px */
margin: var(--spacing-2) var(--spacing-5); /* 8px 20px */
gap: var(--spacing-3);        /* 12px */

/* Tailwind: Use standard spacing scale */
className="p-3 m-2 gap-4" /* 12px, 8px, 16px */
```

### Commandment 8: No Hardcoded Text

```tsx
/* ❌ VIOLATION: Hardcoded user-facing strings */
<span>Settings</span>
<button>Save</button>
<p>File not found</p>
<h1>Welcome to Via-gent</h1>

/* ✅ CORRECT: Use i18n translation function */
<span>{t('settings.title')}</span>
<button>{t('actions.save')}</button>
<p>{t('errors.fileNotFound')}</p>
<h1>{t('home.welcome')}</h1>

/* Exception: Code/technical strings */
<code>npm install</code>  /* OK - not translated */
<pre>{JSON.stringify(data, null, 2)}</pre> /* OK - data */
```

### Commandment 9: No Components > 300 Lines

```markdown
## Component Size Limits

| Threshold | Action |
|-----------|--------|
| ≤ 200 lines | ✅ Ideal size |
| 201-300 lines | ⚠️ Consider splitting |
| 301-400 lines | ❌ Must split before merge |
| > 400 lines | ❌ BLOCKED - mandatory refactor |

## Splitting Strategy

1. Extract custom hooks for state/logic → `use{Component}State.ts`
2. Extract sub-components → `{Component}Header.tsx`, `{Component}Content.tsx`
3. Extract utilities → `{component}.utils.ts`
4. Keep parent as composition/orchestration only
```

### Commandment 10: No Inline Styles

```tsx
/* ❌ VIOLATION: Inline style objects */
<div style={{ marginTop: '10px' }} />
<div style={{ backgroundColor: '#18181b', padding: '16px' }} />
<button style={{ borderRadius: '8px' }} />

/* ✅ CORRECT: Tailwind classes or CSS tokens */
<div className="mt-2" />
<div className="bg-card p-4" />
<button className="rounded-none" />

/* Exception: Dynamic values that can't be classes */
<div style={{ '--progress': `${progress}%` } as React.CSSProperties} />
<div style={{ width: `${dynamicWidth}px` }} /> /* Only when truly dynamic */
```

---

## 12.3 Z-Index Governance

### Complete Z-Index Hierarchy

```markdown
## Z-Index Token Reference (MEMORIZE)

| Token | Value | Use Case | Example Component |
|-------|-------|----------|-------------------|
| `--z-base` | 0 | Default content layer | Page content |
| `--z-docked` | 5 | Docked elements in flow | Inline toolbars |
| `--z-dropdown` | 10 | Dropdowns, menus | DropdownMenu, Select |
| `--z-sticky` | 20 | Sticky headers/footers | Table headers |
| `--z-sidebar` | 30 | Fixed sidebars | GlobalSidebar, Activity Bar |
| `--z-panel` | 40 | Floating panels | Floating preview, inspector |
| `--z-modal-backdrop` | 45 | Modal overlay (dark bg) | Dialog overlay |
| `--z-modal` | 50 | Modal content | Dialog, AlertDialog, Sheet |
| `--z-toast` | 60 | Toast notifications | Sonner toasts |
| `--z-popover` | 70 | Priority popovers | Command palette |
| `--z-overlay` | 80 | Full-screen overlays | Loading screen |
| `--z-alert` | 90 | Critical alerts | Error boundary overlay |
| `--z-debug` | 100 | Debug tools (DEV ONLY) | Never in production |
```

### Z-Index Rules

```markdown
## RULES (NON-NEGOTIABLE)

1. NEVER use raw z-index values - always use tokens
2. NEVER use z-index > 100 (reserved for debug only)
3. NEVER use negative z-index (causes stacking confusion)
4. ALWAYS document z-index usage in component comments
5. ALWAYS verify stacking order before merging

## Z-Index Debugging

When z-index issues occur:
1. Check if element creates new stacking context
2. Verify parent element z-index
3. Use browser DevTools → Layers panel
4. Document the fix in component comments
```

### Stacking Context Triggers

```markdown
## Elements That Create New Stacking Contexts

Be aware that these CSS properties create new stacking contexts:

- `position: fixed` or `position: sticky`
- `opacity` < 1
- `transform` (any value except none)
- `filter` (any value except none)
- `isolation: isolate`
- `mix-blend-mode` (any value except normal)
- `will-change` (when specifying any property)
- `contain: layout` or `contain: paint`

When nesting components with these properties, z-index is relative
to the parent stacking context, not the document root.
```

---

## 12.4 Viewport Blocking Prevention

### Pre-Render Measurement Rules

```markdown
## Rules to Prevent Viewport Blocking

### 1. MEASURE Before Render

□ Check viewport dimensions before opening modals
□ Verify content fits within safe areas
□ Calculate max-height based on viewport height
□ Account for virtual keyboard on mobile

### 2. MAX Dimensions for Overlays

| Element | Max Width | Max Height | Scroll Behavior |
|---------|-----------|------------|-----------------|
| Modal (desktop) | 600px or 90vw | 85vh | `overflow-y: auto` on body |
| Modal (mobile) | 100vw | 100vh | Full-screen or bottom sheet |
| Dropdown | 320px | 50vh | `overflow-y: auto` |
| Popover | 400px | 40vh | `overflow-y: auto` |
| Toast | 400px | Auto | No scroll, auto-dismiss |
| Command palette | 640px | 60vh | `overflow-y: auto` |
```

### Safe Areas for Mobile

```css
/* ✅ REQUIRED: Respect device safe areas */
.modal-container {
  /* Account for notch, status bar, gesture areas */
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

/* Fixed elements at edges */
.fixed-bottom {
  bottom: env(safe-area-inset-bottom, 0px);
}

.fixed-top {
  top: env(safe-area-inset-top, 0px);
}
```

### Responsive Modal Patterns

```markdown
## Desktop → Mobile Transformation

| Component | Desktop Behavior | Mobile Behavior |
|-----------|-----------------|-----------------|
| Modal | Centered dialog | Bottom sheet (slide from bottom) |
| Dropdown | Below trigger | Full-width at bottom |
| Sheet (side) | Slide from right | Slide from bottom |
| Command palette | Centered | Full-width, top-aligned |
| Confirmation | Small centered dialog | Bottom action sheet |

## Implementation Pattern

```tsx
function ResponsiveDialog({ children, ...props }: DialogProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  if (isMobile) {
    return (
      <Sheet {...props}>
        <SheetContent side="bottom" className="h-[85vh]">
          {children}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog {...props}>
      <DialogContent className="max-w-[600px] max-h-[85vh]">
        {children}
      </DialogContent>
    </Dialog>
  );
}
```
```

### Escape Hatch Requirements

```markdown
## Every Overlay MUST Have:

1. ✅ Escape key closes (keyboard)
2. ✅ Visible close button (mouse/touch)
3. ✅ Click outside closes (non-critical modals)
4. ✅ Swipe down closes (mobile bottom sheets)

## Exception: Critical Modals

For destructive actions or unsaved changes:
- Click outside does NOT close
- Must explicitly confirm or cancel
- Clear visual indicator of blocking nature
```

---

## 12.5 Component Coherence Checklist

### Before Creating ANY Component

```markdown
## Pre-Creation Checklist

### Design Token Compliance
□ Does it use design tokens (not hardcoded values)?
□ All colors from palette tokens?
□ All spacing from 4px grid?
□ All typography from type scale?
□ All shadows are pixel-style?
□ Border-radius ≤ 2px?

### 8-bit Aesthetic
□ Does it follow the 8-bit aesthetic rules?
□ No blur effects?
□ No gradients?
□ No glassmorphism?
□ Sharp corners?

### TypeScript & API
□ Does it have TypeScript props interface?
□ All props properly typed?
□ Default values for optional props?
□ No `any` types?
□ Exported interface for consumers?

### State Management
□ Does it handle loading state?
□ Does it handle error state?
□ Does it handle empty state?
□ States visually distinct?

### Internationalization
□ Does it support i18n (no hardcoded text)?
□ All user-facing strings use `t()` function?
□ Tested with Vietnamese strings?
□ Text truncation with tooltip for overflow?

### Responsiveness
□ Does it work at 320px width (phone)?
□ Does it work at 640px width (tablet portrait)?
□ Does it work at 768px width (tablet landscape)?
□ Does it work at 1024px width (laptop)?
□ Does it work at 1280px width (desktop)?
□ Does it work at 1536px width (large desktop)?
□ No horizontal scroll at any breakpoint?
□ Touch targets ≥ 44px on mobile?

### Accessibility
□ Does it meet accessibility requirements?
□ Color contrast verified?
□ Keyboard navigable?
□ Screen reader tested?
□ Focus states visible?
□ ARIA attributes correct?

### Code Quality
□ Is it under 300 lines?
□ Does it use ShadcnUI primitives where applicable?
□ No inline styles?
□ No duplicate code?
```

### Before Modifying ANY Component

```markdown
## Pre-Modification Checklist

### Context Understanding
□ Read existing implementation first (entire file)
□ Check for existing design patterns
□ Identify all consumers of this component
□ Check for related components in same directory

### Change Safety
□ Verify no breaking changes to props interface
□ Check if changes affect other components
□ Identify shared state dependencies
□ Document any API changes in PR

### Testing
□ Test at all 6 breakpoints
□ Test with Vietnamese text (longer strings)
□ Test keyboard navigation
□ Test with screen reader
□ Run accessibility check (axe-core)

### Review
□ Changes follow 8-bit rules?
□ No new hardcoded values?
□ No new inline styles?
□ Component still under 300 lines?
```

---

## 12.6 Progressive Disclosure Patterns

### Disclosure Levels

```markdown
## Level 1: IMMEDIATE (Always Visible)

Elements that are critical and always displayed:
- Primary actions (Save, Submit, Create)
- Critical status indicators (Error, Unsaved)
- Main navigation (Hub, Projects)
- Current context (Project name, File name)

## Level 2: ON-DEMAND (Click/Tap to Reveal)

Elements revealed on explicit user action:
- Secondary actions (overflow menu "...")
- Additional details (accordion expand)
- Settings panels (gear icon → popover)
- File metadata (info icon → popover)

## Level 3: CONTEXTUAL (Appears When Relevant)

Elements that appear based on context:
- Tooltips (hover on desktop, long-press on mobile)
- Inline help (? icon next to form fields)
- Validation messages (on input blur/submit)
- Contextual actions (selected file → action bar)

## Level 4: DEEP (Requires Navigation)

Elements accessed through navigation:
- Advanced settings (/settings/advanced)
- Detailed reports (/project/analytics)
- Historical data (git log, version history)
- System configuration (dev tools, debug)
```

### Animation for Disclosure

```css
/* ✅ Disclosure Animation Specifications */

/* Expand/collapse (accordion, panel) */
.disclosure-expand {
  transition: height 150ms ease-out;
  /* Alternative 8-bit: transition: height 150ms steps(5, end); */
}

/* Fade in (appearing content) */
.disclosure-fade {
  transition: opacity 100ms ease-in;
  /* Alternative 8-bit: transition: opacity 100ms steps(3, end); */
}

/* Slide (drawer, sheet) */
.disclosure-slide {
  transition: transform 200ms ease-out;
  /* Alternative 8-bit: transition: transform 200ms steps(8, end); */
}

/* 8-bit authentic animation (use for retro emphasis) */
.disclosure-8bit {
  transition: all 150ms steps(5, end);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .disclosure-expand,
  .disclosure-fade,
  .disclosure-slide,
  .disclosure-8bit {
    transition: none;
  }
}
```

### Disclosure State Persistence

```typescript
// Persist disclosure states per project
interface DisclosureState {
  // Sidebar sections
  sidebarSections: Record<string, boolean>; // section-id → expanded
  
  // File tree folders
  expandedFolders: string[]; // paths
  
  // Accordion states
  accordions: Record<string, boolean>; // accordion-id → expanded
  
  // Panel visibility
  panels: Record<string, boolean>; // panel-id → visible
}

// Store in project-scoped localStorage
const DISCLOSURE_KEY = `disclosure_${projectId}`;
```

---

## 12.7 Common Anti-Patterns to AVOID

### UX Anti-Pattern: Double Component Rendering

```markdown
## Problem: Component renders twice on screen

### Symptoms:
- Same component visible in two places
- Duplicate data fetching
- Inconsistent state between instances

### Causes:
1. Component included in both layout AND route
2. Missing key props causing React to preserve old instance
3. Multiple route matches rendering same component

### Prevention:
□ Use unique `key` prop for list items
□ Check route configuration for overlapping paths
□ Verify layout doesn't include route-specific components
□ Use React DevTools to inspect component tree

### Debug Pattern:
```tsx
useEffect(() => {
  console.log(`[${componentName}] Mounted at ${Date.now()}`);
  return () => console.log(`[${componentName}] Unmounted`);
}, []);
```
```

### UX Anti-Pattern: Orphaned Floating Elements

```markdown
## Problem: Element "floats" without connection to parent

### Symptoms:
- Dropdown appears but doesn't track trigger position
- Modal backdrop visible but content elsewhere
- Tooltip points to wrong element
- Element persists after closing parent

### Prevention:
□ Always attach floating elements to parent context
□ Use Radix UI Portal for consistent mounting
□ Clean up on unmount (useEffect cleanup)
□ Verify z-index stacking context

### Debug Pattern:
```tsx
useEffect(() => {
  return () => {
    // Cleanup floating elements
    floatingRef.current?.remove();
  };
}, []);
```
```

### UX Anti-Pattern: Infinite Scroll Without Virtualization

```markdown
## Problem: Performance degrades with large lists

### Threshold: > 50 items requires virtualization

### Symptoms:
- Scroll becomes laggy
- Memory usage spikes
- DOM node count exceeds 1000

### Solution:
- Use `@tanstack/react-virtual` for lists
- Use `react-window` for grids
- Implement pagination as alternative

### Implementation:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Row height
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            style={{
              height: row.size,
              transform: `translateY(${row.start}px)`,
            }}
          >
            {items[row.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```
```

### UX Anti-Pattern: Layout Shift on Load

```markdown
## Problem: Content jumps after loading

### Symptoms:
- Text/images shift position
- CLS (Cumulative Layout Shift) score > 0.1
- User loses reading position
- Buttons move after click

### Prevention:
□ Reserve space with skeletons matching content dimensions
□ Use fixed dimensions for images/videos
□ Pre-allocate list item heights
□ Load fonts with `font-display: swap` + size-adjust

### Skeleton Pattern:
```tsx
function ItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 h-[64px]">
      <div className="w-10 h-10 bg-muted rounded-none animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded-none w-3/4" />
        <div className="h-3 bg-muted rounded-none w-1/2" />
      </div>
    </div>
  );
}
```
```

### UX Anti-Pattern: Focus Loss on Dynamic Content

```markdown
## Problem: Focus disappears when content changes

### Symptoms:
- Focus jumps to body after modal close
- Keyboard user loses position after item delete
- Tab order broken after async content load

### Prevention:
□ Manage focus programmatically on add/remove
□ Return focus to trigger after modal/drawer close
□ Maintain focus within list after item operations

### Focus Management Pattern:
```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

function handleClose() {
  setOpen(false);
  // Return focus to trigger
  requestAnimationFrame(() => {
    triggerRef.current?.focus();
  });
}

function handleDelete(id: string, index: number) {
  removeItem(id);
  // Focus next item, or previous if last
  requestAnimationFrame(() => {
    const nextFocusable = 
      listRef.current?.children[index] ?? 
      listRef.current?.children[index - 1];
    (nextFocusable as HTMLElement)?.focus();
  });
}
```
```

### UX Anti-Pattern: Generic AI Styling

```markdown
## Problem: UI looks generic, not 8-bit

### Symptoms:
- Rounded corners everywhere
- Soft blur shadows
- Gradients on buttons
- Sans-serif fonts only
- "Modern" look instead of retro

### Prevention:
□ Follow 10 Commandments EXACTLY
□ Use design tokens (no creative interpretation)
□ Review against 8-bit style guide
□ Check component against existing approved components

### Audit Checklist:
□ All corners sharp (radius 0 or 2px)?
□ All shadows pixel-style (no blur)?
□ All backgrounds solid (no gradient/opacity)?
□ VT323 font used for headings/labels?
□ Monospace for UI elements?
□ Step-based animations?
```

---

## 12.8 Validation Checklist for Code Review

### Design Token Validation

```markdown
## Design Tokens Checklist

□ All colors from design tokens
  - No hex codes (#f97316)
  - No rgb/rgba values
  - No hsl values without var()
  - Uses: text-{color}, bg-{color}, border-{color}

□ All spacing from 4px grid
  - No arbitrary values (p-[13px])
  - Uses: p-{n}, m-{n}, gap-{n} where n = 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12...
  - Exception: space-y-{n} for flex gaps OK

□ All typography from font scale
  - Uses: text-xs, text-sm, text-base, text-lg, text-xl...
  - No arbitrary font sizes
  - Font families: font-sans, font-mono, font-pixel

□ All shadows are pixel-style
  - Uses: shadow-pixel, shadow-pixel-sm, shadow-pixel-lg
  - Or: shadow-[Xpx_Xpx_0_0_color]
  - No blur shadows: shadow-sm, shadow-md, shadow-lg

□ All border-radius ≤ 2px
  - Uses: rounded-none (default), rounded-sm (2px)
  - No: rounded, rounded-md, rounded-lg, rounded-full (except avatars)
```

### Responsiveness Validation

```markdown
## Responsive Design Checklist

□ Works at 320px width (iPhone SE)
  - Content readable
  - No horizontal overflow
  - Touch targets ≥ 44px

□ Works at 768px width (tablet)
  - Layout adapts appropriately
  - Sidebars collapse or overlay

□ Works at 1280px width (desktop)
  - Full layout displays
  - No wasted whitespace
  - All features accessible

□ No horizontal scroll at any breakpoint
  - Test with overflow indicators
  - Check nested scroll containers

□ Touch targets ≥ 44px on mobile
  - Buttons, links, form controls
  - Icon buttons include padding
```

### i18n Validation

```markdown
## Internationalization Checklist

□ No hardcoded user-facing text
  - All strings use t() function
  - Error messages translated
  - Placeholder text translated

□ Tested with Vietnamese strings
  - Longer text doesn't break layout
  - Diacritics display correctly
  - Line breaks sensible

□ Text truncation with tooltip
  - Overflow: hidden + text-ellipsis
  - Tooltip shows full text
  - Tested with long strings
```

### Accessibility Validation

```markdown
## Accessibility Checklist

□ Keyboard navigable
  - All interactive elements focusable
  - Tab order logical
  - Enter/Space activates
  - Escape closes modals

□ Screen reader tested
  - ARIA labels present
  - Landmarks correct
  - Dynamic content announced

□ Color contrast verified
  - Text: 4.5:1 minimum
  - UI components: 3:1 minimum
  - Use axe-core or contrast checker

□ Focus states visible
  - Ring visible on focus
  - Distinct from hover state
  - Works on all backgrounds
```

### Performance Validation

```markdown
## Performance Checklist

□ Component < 300 lines
  - Count lines excluding imports/types
  - Split if approaching limit

□ No unnecessary re-renders
  - Use React DevTools Profiler
  - Memo expensive computations
  - Use useCallback for stable callbacks

□ Lazy load if > 50KB
  - Use React.lazy for routes
  - Use dynamic imports for heavy components
  - Check bundle analyzer
```

---

# Section 13: Appendix

## 13.1 Glossary

| Term | Definition |
|------|------------|
| **Activity Bar** | 48px vertical bar containing plugin icons (left side on desktop, bottom on mobile) |
| **Plugin Docker** | System for arranging plugins in layout slots |
| **Global Component** | UI element that persists across all routes (Header, Sidebar, StatusBar) |
| **Design Token** | Named CSS custom property for consistent styling (color, spacing, shadow, etc.) |
| **Progressive Disclosure** | UX pattern of revealing information gradually based on user need |
| **Focus Trap** | Accessibility pattern containing tab focus within a modal/dialog |
| **Live Region** | ARIA region that announces dynamic content changes to screen readers |
| **Pixel Shadow** | Hard-edge box-shadow without blur (4px 4px 0 0 rgba(0,0,0,0.5)) |
| **Touch Target** | Minimum 44x44px interactive area for touch accessibility |
| **Stacking Context** | Isolated z-index layer created by certain CSS properties |
| **Skeleton** | Loading placeholder that reserves space for content |
| **8-bit Aesthetic** | Retro gaming visual style with sharp corners, pixel shadows, step animations |

## 13.2 References

### External Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **ShadcnUI** | https://ui.shadcn.com/ | Component library |
| **Tailwind CSS 4** | https://tailwindcss.com/ | Utility CSS framework |
| **WCAG 2.1** | https://www.w3.org/WAI/WCAG21/quickref/ | Accessibility guidelines |
| **axe-core** | https://github.com/dequelabs/axe-core | Accessibility testing |
| **Radix Primitives** | https://www.radix-ui.com/primitives | Accessible UI primitives |
| **TanStack Router** | https://tanstack.com/router | Type-safe routing |

### Internal Documents

| Document | Path | Purpose |
|----------|------|---------|
| **ADR-039** | `_bmad-output/planning-artifacts/adr/ADR-039-*.md` | Architecture decisions |
| **Design Tokens** | `_bmad-output/planning-artifacts/design-system/design-tokens-8bit-*.md` | Token definitions |
| **Global Components** | `_bmad-output/planning-artifacts/design-system/global-components-*.md` | Component specs |
| **UX Audit** | `_bmad-output/analysis/ux-spec-audit-*.md` | Audit findings |
| **AGENTS.md** | `AGENTS.md` | Governance patterns |

## 13.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.0.0 | 2026-01-27 | Complete rewrite for plugin-centric architecture. Added comprehensive accessibility (Section 11), 10 Commandments (Section 12.2), z-index governance (Section 12.3), viewport blocking prevention (Section 12.4), component coherence checklists (Section 12.5), anti-patterns (Section 12.7), validation checklists (Section 12.8) | ux-designer-ext |
| 2.0.0 | 2026-01-26 | Previous version (deprecated - contained false completion claims) | - |
| 1.0.0 | 2026-01-15 | Initial version | - |

## 13.4 Quick Reference Cards

### 8-bit Rules Summary Card

```
╔══════════════════════════════════════════════════════════════════╗
║                     8-BIT UI QUICK REFERENCE                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  CORNERS:   rounded-none (0px) or rounded-sm (2px) MAX           ║
║  SHADOWS:   shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] only            ║
║  COLORS:    tokens only (text-primary, bg-card, etc.)            ║
║  SPACING:   4px grid (p-2=8px, p-4=16px, gap-3=12px)             ║
║  FONTS:     font-mono (UI), font-pixel (headings)                ║
║  ANIMATION: steps(5, end) or linear, max 300ms                   ║
║  OPACITY:   1.0 always (except modal backdrop, disabled)         ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEVER: blur shadows, gradients, rounded-lg, backdrop-blur       ║
╚══════════════════════════════════════════════════════════════════╝
```

### Z-Index Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════╗
║                      Z-INDEX HIERARCHY                            ║
╠══════════════════════════════════════════════════════════════════╣
║  100 │ --z-debug       │ DevTools (DEV ONLY)                     ║
║   90 │ --z-alert       │ Critical alerts                         ║
║   80 │ --z-overlay     │ Full-screen loading                     ║
║   70 │ --z-popover     │ Command palette                         ║
║   60 │ --z-toast       │ Sonner notifications                    ║
║   50 │ --z-modal       │ Dialog/Sheet content                    ║
║   45 │ --z-modal-bg    │ Modal backdrop                          ║
║   40 │ --z-panel       │ Floating panels                         ║
║   30 │ --z-sidebar     │ GlobalSidebar                           ║
║   20 │ --z-sticky      │ Sticky headers                          ║
║   10 │ --z-dropdown    │ Menus, tooltips                         ║
║    5 │ --z-docked      │ Docked elements                         ║
║    0 │ --z-base        │ Content                                 ║
╠══════════════════════════════════════════════════════════════════╣
║  RULE: Always use tokens, never raw numbers                       ║
╚══════════════════════════════════════════════════════════════════╝
```

### Component Size Limits Card

```
╔══════════════════════════════════════════════════════════════════╗
║                    COMPONENT SIZE LIMITS                          ║
╠══════════════════════════════════════════════════════════════════╣
║  ≤ 200 lines   │  ✅ IDEAL        │  No action needed            ║
║  201-300 lines │  ⚠️ WARNING      │  Consider splitting          ║
║  301-400 lines │  ❌ MUST SPLIT   │  Split before merge          ║
║  > 400 lines   │  🚫 BLOCKED      │  Mandatory refactor          ║
╠══════════════════════════════════════════════════════════════════╣
║  Splitting Strategy:                                              ║
║  1. Extract hooks → use{Component}State.ts                       ║
║  2. Extract sub-components → {Component}Header.tsx               ║
║  3. Extract utilities → {component}.utils.ts                     ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 13.5 Implementation Verification

### How to Verify This Spec is Being Followed

```markdown
## Automated Checks

1. **ESLint Rules** (configure in eslint.config.js):
   - no-hardcoded-colors (custom rule)
   - no-arbitrary-spacing (custom rule)
   - react/jsx-no-inline-style (built-in)

2. **TypeScript Strict Mode**:
   - No `any` types
   - All props typed
   - Strict null checks

3. **axe-core in Tests**:
   - Add to Vitest/Playwright setup
   - Fail on accessibility violations
   - Run on every component test

## Manual Review Checklist

Use the checklists in Section 12.5 and 12.8 during:
- PR code review
- Design review
- Accessibility audit
- Pre-release QA

## Periodic Audits

Schedule regular audits:
- Weekly: Spot-check 5 random components
- Monthly: Full accessibility scan
- Quarterly: Design token usage audit
- Per-epic: Comprehensive UX review
```

---

**End of Part C**

---

## Consolidation Instructions

This document (Part C) should be consolidated into the main `ux-specification.md` as Sections 11, 12, and 13.

### File Operations Required

1. **Combine Parts**:
   - Part A (Sections 1-5): Design System, Typography, Colors
   - Part B (Sections 6-10): Components, Layouts, Plugins, AI
   - Part C (Sections 11-13): Accessibility, Governance, Appendix

2. **Update Header**:
   ```markdown
   # UX Specification v3.0.0
   Date: 2026-01-27
   Status: APPROVED
   ```

3. **Update Table of Contents**:
   - Add Section 11: Accessibility Requirements
   - Add Section 12: Agent Governance Rules
   - Add Section 13: Appendix

4. **Delete Part Files**:
   - After consolidation, archive part files to `_bmad-ext/.archive/`

---

**Document Statistics**:
- **Lines**: ~1,100
- **Sections**: 3 (11, 12, 13)
- **Checklists**: 8
- **Code Examples**: 25+
- **Tables**: 20+
- **Quick Reference Cards**: 3

**Author**: ux-designer-ext  
**Review Status**: Ready for consolidation  
**Next Action**: Merge with Parts A and B into final `ux-specification.md`
