---
date: '2025-12-31'
time: '03:40:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Frontend Component Standards

_Standards for creating, composing, and maintaining React components in the Via-gent IDE. This document defines component patterns, composition strategies, Radix UI integration, and component testing requirements._

---

## 1. Component Architecture Overview

### 1.1 Component Categories

| Category | Location | Purpose | Examples |
|----------|----------|---------|----------|
| **Feature Components** | `src/components/{feature}/` | Business logic, user journeys | ChatConversation, AgentConfigDialog |
| **UI Primitives** | `src/components/ui/` | Base, reusable, dumb components | Button, Dialog, Input |
| **Layout Components** | `src/components/layout/` | Page structure | IDELayout, MobileIDELayout |
| **Icons** | `src/components/ui/icons/` | Icon components | AIIcon, TerminalIcon |
| **Common Utilities** | `src/components/common/` | Cross-cutting concerns | ErrorBoundary, AppInitializer |

### 1.2 Component Hierarchy

```
src/components/
├── agent/                    # Feature: AI agent configuration
│   ├── AgentConfigDialog.tsx
│   ├── AgentSelector.tsx
│   └── index.ts              # Barrel export
├── chat/                     # Feature: Chat interface
│   ├── ChatPanel.tsx
│   ├── ChatConversation.tsx
│   ├── ThreadCard.tsx
│   └── index.ts
├── ide/                      # Feature: IDE core
│   ├── AgentChatPanel.tsx
│   ├── ExplorerPanel.tsx
│   ├── MonacoEditor/
│   ├── XTerminal.tsx
│   └── index.ts
├── layout/                   # Layout
│   ├── IDELayout.tsx
│   ├── MobileIDELayout.tsx
│   └── index.ts
├── ui/                       # UI Primitives
│   ├── Button.tsx
│   ├── Dialog.tsx
│   ├── icons/
│   └── index.ts
└── common/                   # Common utilities
    ├── ErrorBoundary.tsx
    └── index.ts
```

---

## 2. Component Design Principles

### 2.1 Composition Over Inheritance

**✅ Preferred Pattern:**
```typescript
// Composable component pattern
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export function ButtonGroup({ 
  children, 
  orientation = 'horizontal',
  spacing = 'md' 
}: ButtonGroupProps) {
  return (
    <div 
      role="group"
      className={cn(
        'button-group',
        `button-group-${orientation}`,
        `button-group-spacing-${spacing}`
      )}
    >
      {children}
    </div>
  );
}

// Usage - composition is natural
<ButtonGroup>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</ButtonGroup>
```

**❌ Avoid:**
```typescript
// Inheritance-based approach - DON'T
class BaseButton extends React.Component {
  // Common logic
}

class PrimaryButton extends BaseButton {
  // Override styles
}

class SecondaryButton extends BaseButton {
  // Override styles
}
```

### 2.2 Single Responsibility Principle

Each component should have one reason to change:

| Component | Responsibility | Lines (guideline) |
|-----------|---------------|-------------------|
| `Button` | Render button with variants | <100 |
| `AgentConfigDialog` | Agent configuration modal | <200 |
| `ChatPanel` | Chat interface container | <150 |
| `useAgentChat` | Chat logic hook | <200 |

### 2.3 Dumb vs Smart Components

| Pattern | Characteristics | Example |
|---------|-----------------|---------|
| **Dumb/Presentational** | Props in, UI out, no state | `Button`, `Icon`, `CodeBlock` |
| **Smart/Container** | Hooks, stores, callbacks | `ChatPanel`, `AgentConfigDialog` |

```typescript
// Dumb component - purely presentational
interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <pre className={cn('code-block', className)}>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}

// Smart component - contains logic
export function ChatPanel() {
  const { messages, sendMessage } = useAgentChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-panel">
      <ChatConversation messages={messages} />
      <form onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
```

---

## 3. Component Interface Standards

### 3.1 Interface Naming Convention

```typescript
// ✅ Use PascalCase for interfaces
interface AgentConfigDialogProps {
  // Props
}

// ✅ Use descriptive names with Props suffix
interface ChatConversationProps {
  messages: Message[];
  onMessageClick?: (message: Message) => void;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ✅ Use type for unions, interfaces for objects
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
```

### 3.2 Required Props Documentation

```typescript
interface DialogProps {
  /** Whether the dialog is visible */
  open: boolean;
  
  /** Callback when dialog requests to close */
  onClose: () => void;
  
  /** Dialog title (for accessibility) */
  title: string;
  
  /** Dialog content */
  children: React.ReactNode;
  
  /** Size of the dialog */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  
  /** CSS class for custom styling */
  className?: string;
}
```

### 3.3 Default Props and Optional Values

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

// Default values via destructuring
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'button',
        `button-${variant}`,
        `button-${size}`,
        { 'button-disabled': disabled }
      )}
      {...props}
    >
      {loading && <Spinner className="button-spinner" />}
      {children}
    </button>
  );
}
```

---

## 4. Radix UI Integration

### 4.1 Using Radix Primitives

Via-gent uses Radix UI for accessible, unstyled primitives:

```typescript
// Dialog with Radix UI
import * as DialogPrimitive from '@radix-ui/react-dialog';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogContent({ children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content className="dialog-content" {...props}>
        {children}
        <DialogPrimitive.Close className="dialog-close">
          <CloseIcon />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
```

### 4.2 Radix Component Composition

```typescript
// Dropdown menu with Radix UI
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export interface ContextMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
}

export function ContextMenu({ trigger, items, onSelect }: ContextMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="context-menu" sideOffset={5}>
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              className="context-menu-item"
              onSelect={() => onSelect(item)}
              disabled={item.disabled}
            >
              {item.icon && <span className="menu-item-icon">{item.icon}</span>}
              {item.label}
              {item.shortcut && (
                <span className="menu-item-shortcut">{item.shortcut}</span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

### 4.3 Custom Styled Radix Components

```typescript
// Custom select with Radix
import * as SelectPrimitive from '@radix-ui/react-select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Select({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...' 
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="select-trigger">
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="select-icon">
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="select-content">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="select-item"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
```

---

## 5. Component Patterns

### 5.1 Compound Components Pattern

```typescript
// Compound components for complex UI
interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist" className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ 
  value, 
  children 
}: { 
  value: string; 
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  const { value: selectedValue, onChange } = context;
  const isActive = value === selectedValue;
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={cn('tabs-tab', { 'tabs-tab-active': isActive })}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ 
  value, 
  children 
}: { 
  value: string; 
  children: React.ReactNode 
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Panel must be used within Tabs');
  
  const { value: selectedValue } = context;
  const isActive = value === selectedValue;
  
  if (!isActive) return null;
  
  return (
    <div role="tabpanel" className="tabs-panel">
      {children}
    </div>
  );
};

// Usage
<Tabs value="tab1" onChange={(v) => setTab(v)}>
  <Tabs.List>
    <Tabs.Tab value="tab1">Overview</Tabs.Tab>
    <Tabs.Tab value="tab2">Code</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">Overview content</Tabs.Panel>
  <Tabs.Panel value="tab2">Code content</Tabs.Panel>
</Tabs>
```

### 5.2 Render Props Pattern

```typescript
// Render props for flexible component logic
interface DataFetcherProps<T> {
  url: string;
  render: (data: { data: T | null; loading: boolean; error: Error | null }) => React.ReactNode;
}

export function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
  const { data, loading, error } = useData<T>(url);
  
  return <>{render({ data, loading, error })}</>;
}

// Usage - consumer controls rendering
<DataFetcher<Agent[]>
  url="/api/agents"
  render={({ data, loading, error }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    return <AgentList agents={data!} />;
  }}
/>
```

### 5.3 Custom Hooks Pattern

```typescript
// Extract logic to hooks for reusability
function useFileOperations() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadFiles = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const data = await fileService.list(path);
      setFiles(data);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFile = useCallback(async (name: string, content: string) => {
    await fileService.write(name, content);
    await loadFiles(path.dirname(name));
  }, [loadFiles]);

  return { files, loading, error, loadFiles, createFile };
}

// Usage in component
function FileExplorer() {
  const { files, loading, error, loadFiles, createFile } = useFileOperations();
  
  useEffect(() => {
    loadFiles('/');
  }, [loadFiles]);

  return (
    <div className="file-explorer">
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      <FileTree files={files} onCreate={createFile} />
    </div>
  );
}
```

---

## 6. Error Handling in Components

### 6.1 Error Boundary Implementation

```typescript
// Global error boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Optionally report to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState
          title="Something went wrong"
          message={this.state.error?.message}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<GlobalErrorFallback />}>
      <MainContent />
    </ErrorBoundary>
  );
}
```

### 6.2 Graceful Error UI

```typescript
// Error state component
interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

export function ErrorState({ title, message, onRetry, actions }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <ErrorIcon className="error-state-icon" />
      <h3 className="error-state-title">{title}</h3>
      {message && (
        <p className="error-state-message">{message}</p>
      )}
      {(onRetry || actions) && (
        <div className="error-state-actions">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Component Testing Requirements

### 7.1 Testing Library Setup

```typescript
// __tests__/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-danger');
  });

  it('disables when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);
    expect(ref).toHaveBeenCalledWith(screen.getByRole('button'));
  });
});
```

### 7.2 Accessibility Testing

```typescript
// Accessibility assertions
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper aria attributes', () => {
    render(<Button aria-describedby="help-text">Help</Button>);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-describedby',
      'help-text'
    );
  });
});
```

---

## 8. Performance Optimization

### 8.1 Memoization Patterns

```typescript
// Use React.memo for pure components
interface ExpensiveListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

export const ExpensiveList = memo(function ExpensiveList({
  items,
  onItemClick,
}: ExpensiveListProps) {
  return (
    <ul className="expensive-list">
      {items.map((item) => (
        <ListItem
          key={item.id}
          item={item}
          onClick={onItemClick}
        />
      ))}
    </ul>
  );
});

// Use useMemo for expensive computations
function Chart({ data, config }) {
  const processedData = useMemo(() => {
    return data.reduce((acc, item) => {
      // Expensive computation
      return processItem(acc, item);
    }, []);
  }, [data]);

  const chartData = useMemo(() => {
    return transformForChart(processedData, config);
  }, [processedData, config]);

  return <ChartComponent data={chartData} />;
}

// Use useCallback for event handlers
function ListWithCallbacks({ items }: ListWithCallbacksProps) {
  const handleItemClick = useCallback((item: Item) => {
    console.log('Clicked:', item.id);
  }, []);

  const handleItemAction = useCallback((item: Item, action: string) => {
    api.performAction(item.id, action);
  }, []);

  return (
    <ul>
      {items.map((item) => (
        <ListItem
          key={item.id}
          item={item}
          onClick={handleItemClick}
          onAction={handleItemAction}
        />
      ))}
    </ul>
  );
}
```

### 8.2 Lazy Loading

```typescript
// Code splitting for large components
const MonacoEditor = lazy(() => import('./MonacoEditor'));
const TerminalPanel = lazy(() => import('./XTerminal'));
const AgentChatPanel = lazy(() => import('./AgentChatPanel'));

function IDELayout() {
  return (
    <div className="ide-layout">
      <Suspense fallback={<LoadingSpinner />}>
        <MonacoEditor />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <TerminalPanel />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <AgentChatPanel />
      </Suspense>
    </div>
  );
}
```

---

## 9. Barrel Exports

### 9.1 Required Index Files

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Dialog, DialogContent, DialogTrigger } from './Dialog';
export { Input } from './Input';
export { Label } from './Label';
export { Select } from './Select';
export { Switch } from './Switch';
export { Tabs, TabsList, TabsTab, TabsPanel } from './Tabs';
export type { ButtonProps } from './Button';
export type { DialogProps } from './Dialog';
export type { InputProps } from './Input';
// ... etc
```

### 9.2 Import Pattern

```typescript
// ✅ Correct - import from barrel
import { Button, Dialog, Input } from '@/components/ui';

// ❌ Avoid - deep imports
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
```

---

## 10. Component Documentation

### 10.1 Storybook Stories

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
```

---

## Related Documents

- [`css.md`](css.md): Styling standards
- [`accessibility.md`](accessibility.md): Accessibility requirements
- [`responsive.md`](responsive.md): Responsive design
- [`global/coding-style.md`](../global/coding-style.md): Code patterns
- [`global/error-handling.md`](../global/error-handling.md): Error patterns

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15*
