# Agent Governance Rules for UX/UI

<- [Accessibility](./11-accessibility.md) | [Index](./index.md) | [Appendix](./13-appendix.md) ->

---

## 12.1 Purpose

These rules are **NON-NEGOTIABLE** and must be followed by ALL AI agents (`dev-ext`, `ux-designer-ext`, `architect-ext`, `tea-ext`) when creating or modifying UI components.

### Enforcement Scope

| Agent | Read | Create | Modify | Enforce |
|-------|------|--------|--------|---------|
| `ux-designer-ext` | Y | Y (specs) | Y (specs) | Y |
| `dev-ext` | Y | Y (code) | Y (code) | Y |
| `architect-ext` | Y | N | N | Y (review) |
| `tea-ext` | Y | Y (tests) | Y (tests) | Y |

### Violation Handling

| Level | Example | Action |
|-------|---------|--------|
| CRITICAL | Hardcoded secrets in UI | Block PR, immediate fix required |
| HIGH | Accessibility violation (contrast, labels) | Block PR until fixed |
| MEDIUM | Non-8-bit styling (rounded corners > 2px) | Warning, fix in same PR |
| LOW | Missing i18n for internal-only text | Track in backlog |

---

## 12.2 The 10 Commandments of 8-bit UI

### Commandment 1: No Border-Radius > 2px

```css
/* VIOLATION */
border-radius: 0.5rem;     /* 8px - FORBIDDEN */
border-radius: 0.25rem;    /* 4px - FORBIDDEN */
border-radius: rounded-lg; /* Tailwind class - FORBIDDEN */

/* CORRECT */
border-radius: 0;          /* Sharp corners - DEFAULT */
border-radius: 2px;        /* Maximum allowed */
/* Tailwind: rounded-none or rounded-sm (2px) */
```

### Commandment 2: No Blur Shadows or Glassmorphism

```css
/* VIOLATION: Blur shadows */
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
box-shadow: shadow-lg;     /* Tailwind blur shadow */

/* VIOLATION: Glassmorphism */
backdrop-filter: blur(10px);

/* CORRECT: Pixel shadows only */
box-shadow: 4px 4px 0 0 rgba(0,0,0,0.5);      /* Standard */
box-shadow: var(--shadow-pixel);              /* Token */
/* Tailwind: shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] */
```

### Commandment 3: No Gradients on Backgrounds

```css
/* VIOLATION: Gradient backgrounds */
background: linear-gradient(to right, #f97316, #ea580c);
/* Tailwind: bg-gradient-to-r */

/* CORRECT: Solid colors only */
background: hsl(var(--background));
background: hsl(var(--card));
/* Tailwind: bg-background, bg-card, bg-primary */
```

### Commandment 4: No Opacity < 0.9 for Backgrounds

```css
/* VIOLATION: Transparent backgrounds */
background-color: rgba(0,0,0,0.5);
/* Tailwind: bg-black/50 */

/* CORRECT: Solid or near-solid backgrounds */
background-color: hsl(var(--background));
opacity: 1;
/* Exception: Modal backdrop uses --modal-backdrop-opacity: 0.6 */
```

### Commandment 5: No Floating Elements Without Z-Index Token

```css
/* VIOLATION: Magic z-index numbers */
z-index: 9999;
z-index: 999999;

/* CORRECT: Always use z-index tokens */
z-index: var(--z-modal);          /* 50 */
z-index: var(--z-toast);          /* 60 */
z-index: var(--z-popover);        /* 70 */
```

### Commandment 6: No Hardcoded Colors

```css
/* VIOLATION: Hardcoded hex/rgb/hsl values */
color: #f97316;
background-color: #18181b;

/* CORRECT: Use design tokens */
color: hsl(var(--primary));
background-color: hsl(var(--card));
/* Tailwind: text-primary bg-card */
```

### Commandment 7: No Hardcoded Spacing

```css
/* VIOLATION: Arbitrary pixel values */
padding: 13px;
margin: 7px 19px;

/* CORRECT: Use 4px grid tokens */
padding: var(--spacing-3);    /* 12px */
padding: var(--spacing-4);    /* 16px */
/* Tailwind: p-3 m-2 gap-4 */
```

### Commandment 8: No Hardcoded Text

```tsx
/* VIOLATION: Hardcoded user-facing strings */
<span>Settings</span>
<button>Save</button>

/* CORRECT: Use i18n translation function */
<span>{t('settings.title')}</span>
<button>{t('actions.save')}</button>

/* Exception: Code/technical strings */
<code>npm install</code>  /* OK - not translated */
```

### Commandment 9: No Components > 300 Lines

| Threshold | Action |
|-----------|--------|
| <= 200 lines | Ideal size |
| 201-300 lines | Consider splitting |
| 301-400 lines | Must split before merge |
| > 400 lines | BLOCKED - mandatory refactor |

### Commandment 10: No Inline Styles

```tsx
/* VIOLATION: Inline style objects */
<div style={{ marginTop: '10px' }} />
<div style={{ backgroundColor: '#18181b' }} />

/* CORRECT: Tailwind classes or CSS tokens */
<div className="mt-2" />
<div className="bg-card p-4" />

/* Exception: Dynamic values that can't be classes */
<div style={{ width: `${dynamicWidth}px` }} />
```

---

## 12.3 Z-Index Governance

### Complete Z-Index Hierarchy

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

### Z-Index Rules (NON-NEGOTIABLE)

1. NEVER use raw z-index values - always use tokens
2. NEVER use z-index > 100 (reserved for debug only)
3. NEVER use negative z-index (causes stacking confusion)
4. ALWAYS document z-index usage in component comments
5. ALWAYS verify stacking order before merging

---

## 12.4 Viewport Blocking Prevention

### Max Dimensions for Overlays

| Element | Max Width | Max Height | Scroll Behavior |
|---------|-----------|------------|-----------------|
| Modal (desktop) | 600px or 90vw | 85vh | `overflow-y: auto` on body |
| Modal (mobile) | 100vw | 100vh | Full-screen or bottom sheet |
| Dropdown | 320px | 50vh | `overflow-y: auto` |
| Popover | 400px | 40vh | `overflow-y: auto` |
| Toast | 400px | Auto | No scroll, auto-dismiss |
| Command palette | 640px | 60vh | `overflow-y: auto` |

### Safe Areas for Mobile

```css
/* REQUIRED: Respect device safe areas */
.modal-container {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
```

### Escape Hatch Requirements

Every overlay MUST have:
1. Escape key closes (keyboard)
2. Visible close button (mouse/touch)
3. Click outside closes (non-critical modals)
4. Swipe down closes (mobile bottom sheets)

---

## 12.5 Component Coherence Checklist

### Before Creating ANY Component

**Design Token Compliance:**
- [ ] Does it use design tokens (not hardcoded values)?
- [ ] All colors from palette tokens?
- [ ] All spacing from 4px grid?
- [ ] All shadows are pixel-style?
- [ ] Border-radius <= 2px?

**8-bit Aesthetic:**
- [ ] No blur effects?
- [ ] No gradients?
- [ ] No glassmorphism?
- [ ] Sharp corners?

**TypeScript & API:**
- [ ] Does it have TypeScript props interface?
- [ ] All props properly typed?
- [ ] No `any` types?

**State Management:**
- [ ] Does it handle loading state?
- [ ] Does it handle error state?
- [ ] Does it handle empty state?

**Internationalization:**
- [ ] All user-facing strings use `t()` function?
- [ ] Tested with Vietnamese strings?

**Responsiveness:**
- [ ] Works at 320px width (phone)?
- [ ] Works at 768px width (tablet)?
- [ ] Works at 1280px width (desktop)?
- [ ] Touch targets >= 44px on mobile?

**Accessibility:**
- [ ] Color contrast verified?
- [ ] Keyboard navigable?
- [ ] Screen reader tested?
- [ ] Focus states visible?

**Code Quality:**
- [ ] Is it under 300 lines?
- [ ] No inline styles?
- [ ] No duplicate code?

---

## 12.6 Validation Checklist for Code Review

### Design Token Validation

- [ ] All colors from design tokens (no hex codes)
- [ ] All spacing from 4px grid (no arbitrary values)
- [ ] All typography from font scale
- [ ] All shadows are pixel-style
- [ ] All border-radius <= 2px

### Responsiveness Validation

- [ ] Works at 320px width (iPhone SE)
- [ ] Works at 768px width (tablet)
- [ ] Works at 1280px width (desktop)
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets >= 44px on mobile

### i18n Validation

- [ ] No hardcoded user-facing text
- [ ] Tested with Vietnamese strings
- [ ] Text truncation with tooltip

### Accessibility Validation

- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Focus states visible

---

<- [Accessibility](./11-accessibility.md) | [Index](./index.md) | [Appendix](./13-appendix.md) ->
