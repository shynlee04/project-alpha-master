# Accessibility Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)  
> **Target:** WCAG 2.1 AA Compliance

---

## Requirements

| Area | Requirement |
|------|-------------|
| **Contrast** | 4.5:1 normal text, 3:1 large text |
| **Focus** | Visible focus indicators on all interactive elements |
| **Keyboard** | Full keyboard navigation |
| **Screen Readers** | NVDA/VoiceOver compatible |

---

## Semantic HTML

```tsx
// ✅ Good - Semantic structure
<main id="ide-workspace">
  <nav aria-label="File Tree">
    <ul role="tree">
      <li role="treeitem" aria-expanded="true">
        src/
      </li>
    </ul>
  </nav>
</main>

// ❌ Avoid - Div soup
<div class="main">
  <div class="nav">
    <div class="item">src/</div>
  </div>
</div>
```

---

## Keyboard Navigation

### Focus Management

```tsx
// Modal focus trap
useEffect(() => {
  if (isOpen) {
    const firstFocusable = dialogRef.current?.querySelector('button');
    firstFocusable?.focus();
  }
}, [isOpen]);
```

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save file | `Ctrl+S` / `Cmd+S` |
| Toggle terminal | `Ctrl+`` |
| Command palette | `Ctrl+Shift+P` |
| Close tab | `Ctrl+W` |

---

## ARIA for IDE Components

### File Tree

```tsx
<ul role="tree" aria-label={t('filetree.label')}>
  <li
    role="treeitem"
    aria-expanded={isExpanded}
    aria-selected={isSelected}
    tabIndex={isFocused ? 0 : -1}
  >
    {name}
  </li>
</ul>
```

### Terminal

```tsx
<div
  role="log"
  aria-live="polite"
  aria-label={t('terminal.output')}
>
  {/* xterm.js container */}
</div>
```

---

## General Practices

- **Semantic HTML**: Use `nav`, `main`, `button`, not `div` everywhere
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Color Contrast**: Use Shadcn/ui colors (designed for contrast)
- **Alt Text**: Meaningful labels for all icons and images
- **Focus Indicators**: Never remove `:focus` styles
- **ARIA When Needed**: Enhance complex components (tree, tabs)
