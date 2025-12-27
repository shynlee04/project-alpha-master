---
document_id: STD-FRONTEND-ACCESSIBILITY-2025-12-27
title: Accessibility Standards
version: 1.0.0
last_updated: 2025-12-27T13:25:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: ACTIVE
---

# Accessibility Standards

## Overview

This document defines accessibility standards for the Via-gent project to ensure the IDE is usable by all developers, including those with disabilities.

**Project Context**: Via-gent is a browser-based IDE with complex UI components including Monaco Editor, xterm.js terminal, file trees, and AI chat interfaces. Accessibility is critical for an inclusive development environment.

## WCAG Compliance

### Target Level

Via-gent aims for **WCAG 2.1 Level AA** compliance.

### Key Principles

1. **Perceivable**: Information and UI components must be presentable in ways users can perceive
2. **Operable**: UI components and navigation must be operable
3. **Understandable**: Information and operation of UI must be understandable
4. **Robust**: Content must be robust enough to be interpreted by assistive technologies

## Keyboard Navigation

### Focus Management

All interactive elements must be keyboard accessible:

```typescript
// ✅ Good - keyboard accessible
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>

// ❌ Bad - no keyboard support
<div onClick={handleClick}>
  Click me
</div>
```

### Focus Indicators

Ensure visible focus indicators:

```css
/* ✅ Good - visible focus */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ❌ Bad - removes focus indicator */
button:focus {
  outline: none;
}
```

### Tab Order

Maintain logical tab order:

```typescript
// Use tabIndex="0" for custom interactive elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Custom Button
</div>
```

### Keyboard Shortcuts

Provide keyboard shortcuts for common actions:

```typescript
// src/components/ide/CommandPalette.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(true);
    }
    
    // Escape to close
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

Reference: [`src/components/ide/CommandPalette.tsx`](../../src/components/ide/CommandPalette.tsx)

## Semantic HTML

### Use Semantic Elements

```typescript
// ✅ Good - semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/ide">IDE</a></li>
    <li><a href="/agents">Agents</a></li>
  </ul>
</nav>

// ❌ Bad - non-semantic
<div>
  <div>IDE</div>
  <div>Agents</div>
</div>
```

### Heading Hierarchy

Maintain proper heading hierarchy:

```typescript
// ✅ Good - proper hierarchy
<h1>Via-gent IDE</h1>
<h2>Projects</h2>
<h3>Project Settings</h3>

// ❌ Bad - skipped levels
<h1>Via-gent IDE</h1>
<h3>Projects</h3>
```

## ARIA Attributes

### Landmark Roles

Use landmark roles for page structure:

```typescript
<header role="banner">
  <h1>Via-gent</h1>
</header>

<main role="main">
  {/* Main content */}
</main>

<nav role="navigation" aria-label="Main">
  {/* Navigation */}
</nav>

<aside role="complementary" aria-label="File Explorer">
  {/* Sidebar */}
</aside>
```

### Live Regions

Use live regions for dynamic content:

```typescript
// ✅ Good - announces changes to screen readers
<div role="status" aria-live="polite">
  {syncStatus}
</div>

// ✅ Good - for urgent announcements
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

Reference: [`src/components/ide/SyncStatusIndicator.tsx`](../../src/components/ide/SyncStatusIndicator.tsx)

### Descriptive Labels

Provide descriptive labels for inputs:

```typescript
// ✅ Good - explicit label
<label htmlFor="project-name">Project Name</label>
<input id="project-name" type="text" />

// ✅ Good - aria-label for icon buttons
<button aria-label="Create new project">
  <PlusIcon />
</button>

// ❌ Bad - no label
<input type="text" />
```

## Screen Reader Support

### Monaco Editor

Monaco Editor has built-in accessibility features:

```typescript
// src/components/ide/MonacoEditor/MonacoEditor.tsx
const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);

useEffect(() => {
  if (editor.current) {
    // Enable screen reader mode
    monaco.editor.setTheme('vs-dark');
    
    // Configure accessibility support
    editor.current.updateOptions({
      accessibilitySupport: 'auto',
      // Other options...
    });
  }
}, []);
```

Reference: [`src/components/ide/MonacoEditor/MonacoEditor.tsx`](../../src/components/ide/MonacoEditor/MonacoEditor.tsx)

### Terminal Accessibility

xterm.js terminal accessibility:

```typescript
// src/components/ide/XTerminal.tsx
const terminal = useRef<XTerm | null>(null);

useEffect(() => {
  if (terminal.current) {
    // Enable accessibility mode
    terminal.current.options.allowProposedApi = true;
    terminal.current.options.screenReaderMode = true;
  }
}, []);
```

Reference: [`src/components/ide/XTerminal.tsx`](../../src/components/ide/XTerminal.tsx)

### File Tree Accessibility

```typescript
// src/components/ide/FileTree/FileTree.tsx
const FileTreeItem = ({ file, level }: FileTreeItemProps) => (
  <div
    role="treeitem"
    aria-expanded={file.isDirectory && file.expanded}
    aria-level={level}
    aria-selected={file.isSelected}
    tabIndex={file.isSelected ? 0 : -1}
  >
    {file.name}
  </div>
);
```

Reference: [`src/components/ide/FileTree/FileTree.tsx`](../../src/components/ide/FileTree/FileTree.tsx)

## Color and Contrast

### Contrast Ratios

Ensure text contrast meets WCAG AA standards:

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text (18pt+)**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Color Independence

Don't rely on color alone to convey information:

```typescript
// ✅ Good - uses icon + color
<div className="flex items-center gap-2">
  <CheckIcon className="text-green-500" />
  <span>Sync complete</span>
</div>

// ❌ Bad - relies on color only
<span className="text-green-500">Sync complete</span>
```

Reference: [`src/components/ide/statusbar/SyncStatusSegment.tsx`](../../src/components/ide/statusbar/SyncStatusSegment.tsx)

## Forms and Inputs

### Error Messages

Associate error messages with inputs:

```typescript
// ✅ Good - accessible error handling
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && (
    <span id="email-error" role="alert" className="text-red-500">
      {error}
    </span>
  )}
</div>
```

### Required Fields

Mark required fields clearly:

```typescript
// ✅ Good - accessible required field
<label htmlFor="name">
  Project Name <span aria-hidden="true">*</span>
  <span className="sr-only">(required)</span>
</label>
<input
  id="name"
  type="text"
  required
  aria-required="true"
/>
```

## Testing Accessibility

### Automated Testing

Use axe-core for automated accessibility testing:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist

- [ ] All functionality available via keyboard
- [ ] Focus indicators visible on all interactive elements
- [ ] Logical tab order
- [ ] Screen reader announces important changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Forms have proper labels and error messages
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Skip navigation link available
- [ ] No keyboard traps

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **WCAG 2.1**: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- **ARIA Authoring Practices**: [https://www.w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **axe-core**: [https://github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core)
- **Monaco Editor Accessibility**: [https://microsoft.github.io/monaco-editor/docs.html#accessibility](https://microsoft.github.io/monaco-editor/docs.html#accessibility)
- **xterm.js Accessibility**: [https://xtermjs.org/docs/guides/accessibility/](https://xtermjs.org/docs/guides/accessibility/)

### Implementation Files

- [`src/components/ide/MonacoEditor/MonacoEditor.tsx`](../../src/components/ide/MonacoEditor/MonacoEditor.tsx) - Monaco editor integration
- [`src/components/ide/XTerminal.tsx`](../../src/components/ide/XTerminal.tsx) - Terminal integration
- [`src/components/ide/FileTree/FileTree.tsx`](../../src/components/ide/FileTree/FileTree.tsx) - File tree component
- [`src/components/ide/CommandPalette.tsx`](../../src/components/ide/CommandPalette.tsx) - Command palette
- [`src/components/ide/statusbar/SyncStatusSegment.tsx`](../../src/components/ide/statusbar/SyncStatusSegment.tsx) - Status indicator

---

**Document Status**: Active
**Last Updated**: 2025-12-27T13:25:00Z
**Next Review**: 2026-01-27