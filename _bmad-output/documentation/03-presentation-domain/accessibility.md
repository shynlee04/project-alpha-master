# Accessibility Documentation

## Overview

The presentation layer implements WCAG 2.1 Level AA accessibility standards with comprehensive keyboard navigation, screen reader support, and focus management.

## Accessibility Components

### SkipLinks

**Location:** `src/presentation/components/ui/SkipLinks.tsx`

**Purpose:** Provides keyboard-accessible navigation bypassing repeated content.

**Usage:**
```tsx
<SkipLinks
  links={[
    { target: '#main-content', label: 'Skip to main content' },
    { target: '#sidebar', label: 'Skip to sidebar' },
    { target: '#footer', label: 'Skip to footer' },
  ]}
/>
```

**Features:**
- First tab stop on page load
- Visible on focus, hidden otherwise
- Focus trap prevention

### StatusAnnouncer

**Location:** `src/presentation/components/ui/StatusAnnouncer.tsx`

**Purpose:** Announces dynamic content changes to screen readers.

**Usage:**
```tsx
<StatusAnnouncer
  message="Changes saved successfully"
  politeness="polite" // or "assertive"
/>
```

**Features:**
- Live region support
- Politeness levels (polite, assertive)
- Debounced announcements

## Keyboard Navigation

### Focus Management

All interactive elements have visible focus indicators:

```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Keyboard Shortcuts

| Shortcut | Action | Component |
|----------|--------|-----------|
| Tab | Move focus forward | Global |
| Shift+Tab | Move focus backward | Global |
| Escape | Close modal/dialog | Global |
| Enter/Space | Activate button | Global |
| Arrow keys | Navigate menus/lists | Various |
| Ctrl/Cmd + P | Open Command Palette | CommandPalette |
| Ctrl/Cmd + B | Toggle sidebar | IDELayout |
| Ctrl/Cmd + ` | Toggle terminal | IDELayout |

### Tab Order

```
1. SkipLinks
2. Header controls
3. Main content
4. Sidebar
5. Footer
```

## ARIA Attributes

### ARIA Labels

All interactive elements include accessible labels:

```tsx
// Button with aria-label
<button
  aria-label={t('actions.delete')}
  onClick={handleDelete}
>
  <TrashIcon />
</button>

// Input with aria-describedby
<input
  aria-label={t('agents.config.name.label')}
  aria-describedby="name-help"
  placeholder={t('agents.config.name.placeholder')}
/>

// Region with aria-label
<main aria-label={t('regions.mainContent')}>
  {/* content */}
</main>
```

### ARIA Roles

| Role | Usage | Example |
|------|-------|---------|
| `button` | Clickable actions | Icon buttons |
| `dialog` | Modal dialogs | AgentConfigDialog |
| `navigation` | Navigation regions | Sidebar, tab bar |
| `main` | Main content area | Page content |
| `region` | Section regions | Command palette |
| `status` | Status updates | StatusAnnouncer |
| `tablist` | Tab container | Tabs component |
| `tab` | Tab trigger | TabsTrigger |
| `tabpanel` | Tab content | TabsContent |
| `menu` | Menu container | Dropdown menu |
| `menuitem` | Menu item | Dropdown item |

### ARIA States

| State | Usage | Example |
|-------|-------|---------|
| `aria-expanded` | Collapsible sections | Accordion, dropdown |
| `aria-selected` | Selected items | Tabs, list items |
| `aria-checked` | Checkable items | Checkbox, toggle |
| `aria-disabled` | Disabled state | Disabled buttons |
| `aria-hidden` | Hidden from accessibility | Decorative icons |
| `aria-live` | Dynamic updates | StatusAnnouncer |
| `aria-current` | Current item | Current page link |

## Component Accessibility

### Dialogs

**Pattern:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent 
    aria-describedby="dialog-description"
    // Focus trap enabled
    // Escape key closes
  >
    <DialogHeader>
      <DialogTitle>{t('agents.config.title')}</DialogTitle>
    </DialogHeader>
    <DialogDescription id="dialog-description">
      {t('agents.config.description')}
    </DialogDescription>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Forms

**Pattern:**
```tsx
<form onSubmit={handleSubmit}>
  <label htmlFor="name">
    {t('agents.config.name.label')}
    <Input
      id="name"
      aria-required="true"
      aria-invalid={!!errors.name}
      aria-describedby={errors.name ? 'name-error' : 'name-help'}
    />
  </label>
  {errors.name && (
    <span id="name-error" role="alert">
      {errors.name}
    </span>
  )}
  <span id="name-help" className="help-text">
    {t('agents.config.name.help')}
  </span>
</form>
```

### Buttons and Links

**Pattern:**
```tsx
// Icon button
<Button
  variant="ghost"
  size="icon"
  aria-label={t('actions.delete')}
  onClick={handleDelete}
>
  <TrashIcon />
</Button>

// Link with text
<Link 
  href="/settings"
  aria-current={isActive ? 'page' : undefined}
>
  {t('nav.settings')}
</Link>
```

### Tables

**Pattern:**
```tsx
<table>
  <caption>{t('table.caption')}</caption>
  <thead>
    <tr>
      <th scope="col">{t('table.headers.name')}</th>
      <th scope="col">{t('table.headers.status')}</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr>
        <td>{item.name}</td>
        <td>{item.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Screen Reader Support

### Reading Order

Content is structured for logical reading order:

```tsx
<SkipLinks />
<Header>
  <Logo aria-label={t('branding.logo')} />
  <Navigation />
</Header>
<main id="main-content">
  <h1>{t('page.title')}</h1>
  {/* page content */}
</main>
```

### Announcements

Dynamic changes are announced:

```tsx
// Loading state
<StatusAnnouncer message={t('status.loading')} />

// Success state
<StatusAnnouncer message={t('status.saved')} politeness="polite" />

// Error state
<StatusAnnouncer message={error.message} politeness="assertive" />
```

### Alternative Text

Images and icons have alternative text:

```tsx
// Decorative icons (hidden from screen readers)
<Icon className="decorative" aria-hidden="true" />

// Informative icons
<Icon aria-label={t('icon.description')} />

// Images
<img 
  src={avatarUrl} 
  alt={t('about.hero.avatarAlt')}
/>
```

## Mobile Accessibility

### Touch Targets

Minimum touch target size of 44x44 pixels:

```css
/* Minimum touch target */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Button sizing */
button, [role="button"] {
  min-width: 44px;
  min-height: 44px;
}
```

### High Contrast

Supports system high contrast mode:

```css
@media (prefers-contrast: more) {
  :root {
    --border-color: currentColor;
    --text-color: currentColor;
  }
}
```

### Reduced Motion

Respects reduced motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition: none;
  }
}
```

## Testing Accessibility

### Automated Testing

```typescript
// jest-axe for component testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Error messages are announced
- [ ] Keyboard navigation works
- [ ] Focus order is logical
- [ ] Focus is visible
- [ ] Color is not the only indicator
- [ ] Touch targets are 44x44px minimum
- [ ] Works with screen reader
- [ ] Works with keyboard only

## Developer Guidelines

### When Adding New Components

1. Add appropriate ARIA attributes
2. Include keyboard navigation
3. Provide visible focus styles
4. Add translations for labels
5. Test with keyboard only
6. Test with screen reader

### Accessibility Code Review

Check for:
- Missing `aria-label` on interactive elements
- Unlabeled form fields
- Missing alt text on images
- Incorrect heading hierarchy
- Missing form associations
- Focus trap issues

### Tools

- **Lighthouse**: Automated accessibility audits
- **axe DevTools**: Browser extension for testing
- **NVDA**: Screen reader for Windows
- **VoiceOver**: Screen reader for macOS
- **Keyboard testing**: Tab through interface
