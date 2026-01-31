# Accessibility Requirements

<- [i18n & Typography](./10-i18n-typography.md) | [Index](./index.md) | [Agent Governance](./12-agent-governance.md) ->

---

## 11.1 WCAG Compliance Level

### Target Compliance

| Level | Status | Description |
|-------|--------|-------------|
| **WCAG 2.1 AA** | REQUIRED | Minimum compliance for all production releases |
| **WCAG 2.1 AAA** | OPTIONAL | Stretch goal for high-contrast mode |

### Priority Areas (by Severity)

| Priority | Area | Requirement | Validator |
|----------|------|-------------|-----------|
| P0 | Color Contrast | 4.5:1 for text, 3:1 for UI | axe-core |
| P0 | Keyboard Navigation | All interactive elements focusable | Manual + Playwright |
| P0 | Screen Reader | ARIA landmarks, roles, labels | VoiceOver/NVDA |
| P1 | Focus Management | Visible focus indicators, focus trap in modals | Manual |
| P1 | Touch Targets | Minimum 44x44px on mobile | Design review |
| P2 | Motion & Animation | Respect `prefers-reduced-motion` | CSS media query |
| P2 | Text Alternatives | Alt text for images, captions for video | Manual review |

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
| **Large text** (>= 18px or bold 14px+) | 3:1 | AA Large | Headers, titles |
| **UI components** | 3:1 | AA | Buttons, form controls, borders |
| **Focus indicators** | 3:1 | AA | `ring-orange-500` on any background |
| **Disabled elements** | No requirement | - | Intentionally lower contrast |
| **Decorative elements** | No requirement | - | Non-interactive icons |

### 8-bit Palette Contrast Verification

```css
/* VERIFIED CONTRAST PAIRS (4.5:1+) */
--foreground (0 0% 95%) on --background (240 6% 4%)      /* 16.5:1 */
--foreground (0 0% 95%) on --card (240 4% 10%)           /* 12.6:1 */
--primary-foreground (100%) on --primary (24.6 95% 53%)  /* 4.63:1 */
--muted-foreground (0 0% 60%) on --background (240 6% 4%) /* 6.5:1 */

/* REQUIRES VERIFICATION (use calculator) */
--text-secondary on --surface-2
--warning on --warning-50 (dark text on light bg)
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

```
Focus Order (Left-to-Right, Top-to-Bottom)

1. Skip link (hidden until focused) -> Main content
2. Sidebar toggle (if visible)
3. Logo/Brand link
4. Primary navigation items
5. Search/command palette trigger
6. Secondary actions (settings, user menu)
7. Main content area (tab into first focusable element)
8. Status bar elements (if interactive)
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
<!-- REQUIRED: Use semantic elements -->
<header>        <!-- Page header / GlobalHeader -->
<nav>           <!-- Navigation / GlobalSidebar -->
<main>          <!-- Primary content area -->
<aside>         <!-- Sidebar content panels -->
<footer>        <!-- Status bar / footer -->
<article>       <!-- Self-contained content -->
<section>       <!-- Thematic grouping with heading -->
<button>        <!-- Interactive buttons (NOT divs with onClick) -->

<!-- FORBIDDEN: Non-semantic patterns -->
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
// REQUIRED: Icon-only buttons MUST have aria-label
<Button variant="ghost" size="icon" aria-label={t('sidebar.collapse')}>
  <ChevronLeft className="h-4 w-4" />
</Button>

// ALTERNATIVE: Using sr-only span
<Button variant="ghost" size="icon">
  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">{t('sidebar.collapse')}</span>
</Button>

// FORBIDDEN: Icon-only without accessible name
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
```

---

## 11.5 Touch Accessibility

### Minimum Touch Target Size

```css
/* WCAG 2.2 Target Size (Minimum): 44x44 CSS pixels */

/* REQUIRED: All interactive elements on touch devices */
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

| Scenario | Minimum Spacing | Recommendation |
|----------|-----------------|----------------|
| Adjacent buttons | 8px | 12px for safety |
| Icon buttons in toolbar | 4px | 8px preferred |
| List items | 0px (inherent height) | 48px+ row height |
| Form inputs | 12px vertical | 16px preferred |

### Touch Interaction Patterns

| Gesture | Action | Component |
|---------|--------|-----------|
| Tap | Primary action | All buttons, links |
| Long press | Context menu | FileTree items |
| Swipe left | Delete action | List items (with confirmation) |
| Swipe right | Archive/favorite | List items |
| Pull down | Refresh | Project list, file list |
| Pinch | Zoom (future) | Preview panel |

---

## 11.6 Motion & Animation

### Respecting User Preferences

```css
/* REQUIRED: Always check prefers-reduced-motion */

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
| Loading indicators | Infinite (looping) | `linear` | Spinners (respect reduced motion) |

### Prohibited Animation Patterns

- Auto-playing background animations
- Infinite loop animations (except spinners with reduced-motion fallback)
- Parallax scrolling effects
- Flash/blink effects (accessibility hazard)
- Animation duration > 500ms for UI elements
- Spring/bounce physics (non-8-bit)
- Smooth scroll hijacking

---

<- [i18n & Typography](./10-i18n-typography.md) | [Index](./index.md) | [Agent Governance](./12-agent-governance.md) ->
