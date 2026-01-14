---
date: '2025-12-31'
time: '03:35:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Frontend Accessibility Standards

_Standards for ensuring the Via-gent IDE is accessible to all users, including those with disabilities. This document defines WCAG 2.1 AA compliance requirements, keyboard navigation patterns, ARIA implementation, and accessibility testing protocols._

---

## 1. Accessibility Principles Overview

### 1.1 WCAG 2.1 AA Compliance Target

Via-gent targets **WCAG 2.1 Level AA** compliance as the minimum acceptable standard. All new features and updates must maintain this level of accessibility.

| WCAG Principle | Description | Our Implementation |
|----------------|-------------|-------------------|
| **Perceivable** | Information must be presentable in ways users can perceive | Color contrast, text alternatives, adaptable layout |
| **Operable** | UI components must be operable | Keyboard navigation, no timing constraints, seizure-safe |
| **Understandable** | Information and operation must be understandable | Readable content, predictable behavior, input assistance |
| **Robust** | Content must be robust enough for interpretation | Compatible with assistive technologies |

### 1.2 Color Contrast Requirements

All text and interactive elements must meet minimum contrast ratios:

| Text Size | Minimum Ratio | Our Standard |
|-----------|---------------|--------------|
| Normal text (≤16px) | 4.5:1 | **5:1** (stricter) |
| Large text (>18px or >14px bold) | 3:1 | **4.5:1** (stricter) |
| UI components (borders, icons) | 3:1 | **3:1** |
| Disabled states | 3:1 | **3:1** (may reduce opacity) |

**Implementation Example:**
```typescript
// Design tokens ensure contrast compliance
const colors = {
  // Primary text on dark background - passes 5:1
  textPrimary: 'var(--color-gray-100)',     // #f3f4f6 on #1f2937
  textSecondary: 'var(--color-gray-400)',   // #9ca3af on #1f2937 - 4.5:1
  textMuted: 'var(--color-gray-500)',       // #6b7280 on #1f2937 - 3:1
  
  // Interactive elements
  interactivePrimary: 'var(--color-blue-500)',  // #3b82f6 on dark
  interactiveFocus: 'var(--color-blue-400)',    // #60a5fa
  
  // Error states
  errorText: 'var(--color-red-400)',        // #f87171 on dark
  errorBackground: 'var(--color-red-900)',  // #7f1d1d
};
```

### 1.3 Focus Visibility Standards

All interactive elements MUST have visible focus indicators:

```typescript
// Global focus styles in design-tokens.css
:focus-visible {
  outline: 2px solid var(--color-blue-500);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-blue-900);
}

// Skip link for keyboard users
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: var(--color-bg);
  padding: 8px 16px;
  z-index: 100;
  
  &:focus {
    top: 0;
  }
}
```

---

## 2. Keyboard Navigation Requirements

### 2.1 Tab Order Management

| Element Type | Tab Order | Implementation |
|--------------|-----------|----------------|
| Main content | 1 | Natural document order |
| Interactive elements | Sequential | DOM order, no `tabindex` > 0 |
| Skip links | First | `tabindex="-1"` when hidden |
| Modals/dialogs | Trapped | Focus returns to trigger |

### 2.2 Keyboard Shortcuts

All keyboard shortcuts MUST be documented and respect user preferences:

| Shortcut | Action | Conflict Avoidance |
|----------|--------|-------------------|
| `Tab` | Navigate to next focusable | No overrides |
| `Enter` | Activate button/trigger | No overrides |
| `Space` | Toggle checkboxes/radios | No overrides |
| `Escape` | Close modal/menu | No overrides |
| `Arrow keys` | Navigate within components | Component-specific |
| `Ctrl/Cmd + /` | Toggle command palette | Check browser shortcuts |

**Implementation Pattern:**
```typescript
// useKeyboardShortcut hook for accessible shortcuts
function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    preventDefault?: boolean;
    enabled?: boolean;
  } = {}
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!options.enabled) return;
    
    const keyMatch = event.key.toLowerCase() === key.toLowerCase();
    const ctrlMatch = options.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
    const shiftMatch = options.shift ? event.shiftKey : !event.shiftKey;
    const altMatch = options.alt ? event.altKey : !event.altKey;
    
    if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
      if (options.preventDefault) {
        event.preventDefault();
      }
      callback();
    }
  }, [key, callback, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### 2.3 Focus Management Patterns

#### Modal/Dialog Focus Trap
```typescript
// useFocusTrap hook for modals
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

#### Returning Focus After Modal Close
```typescript
// Store trigger element reference
const triggerRef = useRef<HTMLButtonElement>(null);

function openModal() {
  triggerRef.current = document.activeElement as HTMLButtonElement;
  setIsOpen(true);
}

function closeModal() {
  setIsOpen(false);
  // Return focus to trigger
  setTimeout(() => {
    triggerRef.current?.focus();
  }, 0);
}
```

---

## 3. ARIA Implementation Standards

### 3.1 ARIA Roles and Attributes

| Role | When to Use | Example |
|------|-------------|---------|
| `button` | Clickable action | `<button>`, not `<div onClick>` |
| `dialog` | Modal window | `<div role="dialog" aria-modal="true">` |
| `tooltip` | Hover information | `<div role="tooltip">` |
| `tablist` | Tab container | Container for tabs |
| `tab` | Individual tab | Trigger for tab panel |
| `tabpanel` | Tab content | Content associated with tab |
| `alert` | Important message | Error, success, warning messages |
| `status` | Status update | Non-critical status info |
| `progressbar` | Progress indicator | Loading, upload progress |
| `combobox` | Autocomplete/dropdown | Select with search |

### 3.2 Live Regions for Dynamic Content

```typescript
// Announce dynamic content changes to screen readers
function useLiveRegion() {
  const regionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-live', priority);
      regionRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        regionRef.current!.textContent = '';
      }, 1000);
    }
  }, []);

  return { regionRef, announce };
}

// Component implementation
function ChatPanel() {
  const { regionRef, announce } = useLiveRegion();
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    announce(`New message from ${message.sender}`);
  };

  return (
    <>
      <div
        ref={regionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <ChatConversation messages={messages} />
    </>
  );
}
```

### 3.3 Accessible Form Validation

```typescript
// Accessible error messages
function AccessibleFormField({
  label,
  error,
  children,
  required = false
}: FormFieldProps) {
  const errorId = `${label}-error`;
  const helperId = `${label}-helper`;

  return (
    <div className="form-field">
      <label htmlFor={label} required={required}>
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="error-message">
          <ErrorIcon aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// Input with proper ARIA
function AccessibleInput({
  id,
  label,
  error,
  ...props
}) {
  return (
    <AccessibleFormField label={label} error={error}>
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-required={props.required}
        {...props}
      />
    </AccessibleFormField>
  );
}
```

### 3.4 Accessible Dropdowns and Selects

```typescript
// Accessible combobox pattern
function AccessibleSelect({
  options,
  value,
  onChange,
  label,
  placeholder
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const { announce } = useLiveRegion();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        if (isOpen && highlightedIndex >= 0) {
          event.preventDefault();
          onChange(options[highlightedIndex]);
          setIsOpen(false);
          announce(`Selected ${options[highlightedIndex].label}`);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      ref={comboboxRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="sr-only">{label}</span>
      {isOpen && (
        <ul role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value?.value}
              data-highlighted={index === highlightedIndex}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 4. Screen Reader Support

### 4.1 Screen Reader Compatibility Matrix

| Screen Reader | Browser | Status | Notes |
|---------------|---------|--------|-------|
| **NVDA** | Firefox | ✅ Full Support | Primary target |
| **NVDA** | Chrome | ✅ Full Support | Good support |
| **JAWS** | Chrome | ✅ Full Support | Good support |
| **VoiceOver** | Safari | ✅ Full Support | macOS/iOS |
| **VoiceOver** | Chrome | ⚠️ Partial | May have issues |
| **Narrator** | Edge | ✅ Full Support | Windows |
| **TalkBack** | Chrome (Android) | ✅ Full Support | Android |

### 4.2 Semantic HTML Requirements

| Element | Use For | Example |
|---------|---------|---------|
| `<main>` | Primary content | `<main id="main-content">` |
| `<nav>` | Navigation sections | `<nav aria-label="Main navigation">` |
| `<header>` | Page header | Page-level header |
| `<footer>` | Page footer | Page-level footer |
| `<aside>` | Sidebar content | Secondary content |
| `<article>` | Self-contained content | Blog post, comment |
| `<section>` | Thematic grouping | Related content group |
| `<h1>`-`<h6>` | Headings | Document outline |

### 4.3 Landmark Regions

```typescript
// Page layout with proper landmarks
function IDELayout() {
  return (
    <>
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header role="banner">
        <IDEToolbar />
      </header>

      <div className="layout-container">
        <nav role="navigation" aria-label="File explorer">
          <ExplorerPanel />
        </nav>

        <main id="main-content" role="main">
          <EditorArea />
        </main>

        <aside role="complementary" aria-label="Chat panel">
          <AgentChatPanel />
        </aside>
      </div>

      <footer role="contentinfo">
        <StatusBar />
      </footer>
    </>
  );
}
```

### 4.4 Alternative Text for Images and Icons

```typescript
// Icon accessibility
interface IconProps {
  name: string;
  ariaLabel?: string;
  decorative?: boolean;
}

function Icon({ name, ariaLabel, decorative = true }: IconProps) {
  // Decorative icons are hidden from screen readers
  if (decorative) {
    return <i aria-hidden="true" className={`icon-${name}`} />;
  }

  // Informative icons need labels
  return (
    <>
      <i aria-hidden="true" className={`icon-${name}`} />
      <span className="sr-only">{ariaLabel}</span>
    </>
  );
}

// Usage examples
<Icon name="save" ariaLabel="Save file" />          // Informative
<Icon name="menu" decorative />                      // Decorative
<Icon name="settings" ariaLabel="Open settings" />   // Interactive
```

---

## 5. Reduced Motion and Preferences

### 5.1 Respecting User Motion Preferences

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Use prefers-reduced-motion for animations */
.animated-element {
  animation: slideIn 0.3s ease-out;
}

@media (prefers-reduced-motion: no-preference) {
  .animated-element {
    animation: slideIn 0.3s ease-out;
  }
}
```

### 5.2 High Contrast Mode Support

```css
/* High contrast mode overrides */
@media (forced-colors: active) {
  .button {
    border: 2px solid currentColor;
    forced-color-adjust: none;
  }
  
  .form-input {
    border: 2px solid currentColor;
  }
  
  .link {
    text-decoration: underline;
  }
}

/* Dark/light mode with high contrast */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #ffffff;
    --color-text-secondary: #e5e7eb;
    --color-border: #d1d5db;
  }
}
```

---

## 6. Accessibility Testing Requirements

### 6.1 Automated Testing

| Tool | description | Integration |
|------|---------|-------------|
| **axe-core** | Automated accessibility tests | CI pipeline |
| **eslint-plugin-jsx-a11y** | JSX accessibility linting | Build process |
| **storybook-addon-a11y** | Visual testing | Storybook |

```typescript
// jest-axe for component testing
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Component accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 6.2 Manual Testing Checklist

| Test | Frequency | Responsible |
|------|-----------|-------------|
| Keyboard-only navigation | Every sprint | QA/Developer |
| Screen reader testing (NVDA) | Every release | QA |
| Color contrast audit | Every sprint | Developer |
| Focus indicator verification | Every PR | Reviewer |
| ARIA attribute validation | Every PR | Reviewer |
| Screen reader (VoiceOver) | Weekly | QA |

### 6.3 Accessibility Testing Commands

```bash
# Run axe accessibility tests
pnpm test -- --testPathPattern="a11y"

# Check for accessibility issues in CI
pnpm lint:eslint -- --ext .ts,.tsx --rule 'jsx-a11y/recommended:error'

# Test with axe-cli
npx axe-cli http://localhost:3000 --report
```

---

## 7. IDE-Specific Accessibility Requirements

### 7.1 Editor Accessibility

| Feature | Requirement | Implementation |
|---------|-------------|----------------|
| Line numbers | Screen reader announcement | `aria-label` on line numbers |
| Syntax highlighting | Color-blind friendly | Patterns + colors |
| Cursor position | Announced on change | Live region updates |
| Selection | Announced range | `aria-live` region |
| Error indicators | Multiple modalities | Color + icon + text |

### 7.2 Terminal Accessibility

```typescript
// Terminal with screen reader support
function AccessibleTerminal() {
  const outputRef = useRef<HTMLDivElement>(null);
  const { announce } = useLiveRegion();

  // Announce new terminal output
  const handleOutput = useCallback((output: string) => {
    const lineCount = output.split('\n').length;
    announce(`${lineCount} new lines in terminal`);
    
    // Focus management for terminal output
    if (outputRef.current) {
      outputRef.current.focus();
    }
  }, [announce]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Terminal output"
      ref={outputRef}
      tabIndex={0}
    >
      <TerminalContent onOutput={handleOutput} />
    </div>
  );
}
```

### 7.3 Chat Accessibility

```typescript
// Accessible chat messages
function AccessibleChatMessage({ message }: ChatMessageProps) {
  const { t } = useTranslation();

  return (
    <article
      role="article"
      aria-label={`Message from ${message.sender}`}
      className={cn('chat-message', message.type)}
    >
      <header>
        <Avatar name={message.sender} />
        <span className="sender-name">{message.sender}</span>
        <time dateTime={message.timestamp}>
          {formatTime(message.timestamp)}
        </time>
      </header>
      
      <div className="message-content">
        {message.code ? (
          <CodeBlock
            code={message.code}
            language={message.language}
            ariaLabel={`Code in ${message.language}`}
          />
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      
      {/* Tool call badges with proper labeling */}
      {message.toolCalls?.map(call => (
        <div
          key={call.id}
          role="status"
          aria-label={t('chat.toolCallPending', { tool: call.name })}
        >
          <ToolCallBadge tool={call} />
        </div>
      ))}
    </article>
  );
}
```

---

## 8. Internationalization Accessibility

### 8.1 RTL Language Support

```typescript
// RTL-aware component structure
function BidirectionalLayout({ children, dir = 'ltr' }: LayoutProps) {
  return (
    <div dir={dir} lang="vi" className="layout">
      {children}
    </div>
  );
}

// CSS for RTL support
.sidebar {
  /* LTR */
  order: 1;
  border-right: 1px solid var(--color-border);
}

[dir="rtl"] .sidebar {
  /* RTL */
  order: 1;
  border-right: none;
  border-left: 1px solid var(--color-border);
}
```

### 8.2 Vietnamese Localization Considerations

| Aspect | Consideration | Implementation |
|--------|---------------|----------------|
| **Line height** | Vietnamese needs more line height for diacritics | `line-height: 1.6` minimum |
| **Font selection** | Support for Vietnamese fonts | System fonts, Noto Sans VN fallback |
| **Reading order** | Vietnamese LTR | `dir="ltr"` for vi |
| **Date formats** | DD/MM/YYYY | `Intl.DateTimeFormat` with `vi` locale |
| **Number formats** | 1.234,56 | `Intl.NumberFormat` with `vi` locale |

---

## 9. Accessibility Documentation

### 9.1 Accessibility Statement

```markdown
## Accessibility Statement

Via-gent is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

### Conformance Status

The Web Content Accessibility Guidelines (WCAG) 2.1 defines requirements for designers and developers to improve accessibility for people with disabilities. Via-gent aspires to conform to WCAG 2.1 Level AA.

### Measures Taken

- Automated accessibility testing integrated into CI/CD
- Manual testing with screen readers (NVDA, VoiceOver)
- Keyboard navigation testing
- Color contrast validation
- ARIA implementation review

### Accessibility Features

- Full keyboard navigation
- Screen reader support (NVDA, VoiceOver, JAWS)
- High contrast mode support
- Reduced motion support
- RTL language support (Vietnamese)
- Resizable text up to 200%

### Feedback

We welcome your feedback on the accessibility of Via-gent. Please let us know if you encounter accessibility barriers:
- Email: accessibility@via-gent.example.com
- GitHub: Report an issue
```

---

## Related Documents

- [`css.md`](css.md): Styling standards
- [`components.md`](components.md): Component patterns
- [`responsive.md`](responsive.md): Responsive design
- [`global/error-handling.md`](../global/error-handling.md): Error accessibility
- [`global/coding-style.md`](../global/coding-style.md): Code patterns

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15*
