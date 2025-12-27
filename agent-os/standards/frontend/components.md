---
document_id: STD-FRONTEND-COMPONENTS-2025-12-27
title: Component Design Standards
version: 1.0.0
last_updated: 2025-12-27T13:30:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: ACTIVE
---

# Component Design Standards

## Overview

This document defines component design standards for the Via-gent project to ensure consistent, maintainable, and reusable React components.

**Project Context**: Via-gent uses React 19 with TypeScript, organized by feature directories. Components follow a barrel export pattern with TypeScript interfaces for props.

## Component Organization

### Feature-Based Structure

Components are organized by feature, not by type:

```
src/components/
├── agent/           # AI agent-related components
│   ├── AgentConfigDialog.tsx
│   └── index.ts
├── chat/            # Chat interface components
│   ├── ApprovalOverlay.tsx
│   ├── CodeBlock.tsx
│   ├── ToolCallBadge.tsx
│   └── index.ts
├── ide/             # IDE-specific components
│   ├── MonacoEditor/
│   ├── FileTree/
│   ├── XTerminal.tsx
│   ├── CommandPalette.tsx
│   └── index.ts
├── ui/              # Reusable UI components
│   ├── Toast.tsx
│   ├── Dialog.tsx
│   └── index.ts
└── layout/          # Layout components
    ├── IDELayout.tsx
    ├── IDEHeaderBar.tsx
    └── index.ts
```

Reference: [`src/components/`](../../src/components/)

### Barrel Exports

Each component directory has an `index.ts` barrel export:

```typescript
// src/components/chat/index.ts
export { ApprovalOverlay } from './ApprovalOverlay';
export { CodeBlock } from './CodeBlock';
export { ToolCallBadge } from './ToolCallBadge';
export { ChatPanel } from './ChatPanel';
```

Reference: [`src/components/chat/index.ts`](../../src/components/chat/index.ts)

## Component Structure

### Basic Template

```typescript
import React from 'react';

export interface ComponentNameProps {
  // Props interface (use interface, not type)
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onClick,
  children,
}) => {
  return (
    <div onClick={onClick}>
      <h1>{title}</h1>
      {children}
    </div>
  );
};
```

### Component Best Practices

1. **Use TypeScript interfaces** for props (not `type` aliases)
2. **Functional components** with React.FC
3. **Destructure props** at the top
4. **Default props** in function signature
5. **Early returns** for conditional rendering

```typescript
// ✅ Good - follows best practices
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  disabled = false,
  onClick,
  children,
}) => {
  if (disabled) {
    return <button disabled className="opacity-50">{children}</button>;
  }

  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

## Component Patterns

### Compound Components

Use compound components for complex UI:

```typescript
// src/components/ide/MonacoEditor/index.ts
export { MonacoEditor } from './MonacoEditor';
export { EditorTabBar } from './EditorTabBar';
export { useMonacoEditor } from './hooks';

// Usage
<MonacoEditor>
  <EditorTabBar />
  <EditorContent />
</MonacoEditor>
```

Reference: [`src/components/ide/MonacoEditor/index.ts`](../../src/components/ide/MonacoEditor/index.ts)

### Higher-Order Components

Use HOCs for cross-cutting concerns:

```typescript
// src/components/common/withErrorBoundary.tsx
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Usage
export const SafeMonacoEditor = withErrorBoundary(MonacoEditor);
```

Reference: [`src/components/common/ErrorBoundary.tsx`](../../src/components/common/ErrorBoundary.tsx)

### Custom Hooks

Extract logic into custom hooks:

```typescript
// src/components/ide/MonacoEditor/hooks/useMonacoEditor.ts
export function useMonacoEditor(options: MonacoOptions) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize editor
    const editor = monaco.editor.create(container, options);
    editorRef.current = editor;
    setIsReady(true);

    return () => {
      editor.dispose();
    };
  }, []);

  return { editor: editorRef.current, isReady };
}
```

Reference: [`src/components/ide/MonacoEditor/hooks/useMonacoEditor.ts`](../../src/components/ide/MonacoEditor/hooks/useMonacoEditor.ts)

## Styling

### Tailwind CSS

Use Tailwind CSS for styling:

```typescript
export const Button: React.FC<ButtonProps> = ({ variant, children }) => (
  <button
    className={cn(
      'px-4 py-2 rounded font-medium transition-colors',
      variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
      variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    )}
  >
    {children}
  </button>
);
```

### Class Variants

Use class-variance-authority for variant management:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'px-4 py-2 rounded font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  className,
  ...props
}) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
```

Reference: [`src/components/ui/button.tsx`](../../src/components/ui/button.tsx)

## State Management

### Local State

Use `useState` for component-local state:

```typescript
export const Dialog = ({ isOpen, onClose }: DialogProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={cn('dialog', isAnimating && 'animate-in')}>
      {/* Dialog content */}
    </div>
  );
};
```

### Global State

Use Zustand stores for global state:

```typescript
import { useIDEStore } from '@/lib/state/ide-store';

export const StatusBar = () => {
  const { activeFile, openFiles } = useIDEStore();

  return (
    <div className="status-bar">
      <span>{activeFile?.name}</span>
      <span>{openFiles.length} files</span>
    </div>
  );
};
```

Reference: [`src/lib/state/ide-store.ts`](../../src/lib/state/ide-store.ts)

## Props Patterns

### Children Prop

Always include `children?: React.ReactNode` for container components:

```typescript
export interface PanelProps {
  title: string;
  children?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children }) => (
  <div className="panel">
    <h2>{title}</h2>
    {children}
  </div>
);
```

### Render Props

Use render props for flexible composition:

```typescript
export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

### Callback Props

Use descriptive callback prop names:

```typescript
export interface FileTreeProps {
  files: FileNode[];
  onSelectFile: (file: FileNode) => void;
  onRenameFile?: (file: FileNode, newName: string) => void;
  onDeleteFile?: (file: FileNode) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  onSelectFile,
  onRenameFile,
  onDeleteFile,
}) => {
  const handleSelect = (file: FileNode) => {
    onSelectFile(file);
  };

  return (
    <div>
      {files.map((file) => (
        <FileTreeItem
          key={file.id}
          file={file}
          onSelect={handleSelect}
          onRename={onRenameFile}
          onDelete={onDeleteFile}
        />
      ))}
    </div>
  );
};
```

Reference: [`src/components/ide/FileTree/FileTree.tsx`](../../src/components/ide/FileTree/FileTree.tsx)

## Component Testing

### Test Structure

Co-locate tests with components:

```
src/components/ide/
├── CommandPalette.tsx
└── __tests__/
    └── CommandPalette.test.tsx
```

### Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../CommandPalette';

describe('CommandPalette', () => {
  it('should render command palette', () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should call onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<CommandPalette isOpen={true} onClose={onClose} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalled();
  });
});
```

Reference: [`src/components/ide/__tests__/CommandPalette.test.tsx`](../../src/components/ide/__tests__/CommandPalette.test.tsx)

## Performance

### Memoization

Use `React.memo` for expensive components:

```typescript
export const FileTreeItem = React.memo<FileTreeItemProps>(
  ({ file, onSelect }) => {
    return (
      <div onClick={() => onSelect(file)}>
        {file.name}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.file.id === nextProps.file.id &&
           prevProps.file.isSelected === nextProps.file.isSelected;
  }
);
```

### useCallback

Use `useCallback` for callback props:

```typescript
export const FileTree: React.FC<FileTreeProps> = ({ files, onSelectFile }) => {
  const handleSelect = useCallback((file: FileNode) => {
    onSelectFile(file);
  }, [onSelectFile]);

  return (
    <div>
      {files.map((file) => (
        <FileTreeItem
          key={file.id}
          file={file}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};
```

### Code Splitting

Use `React.lazy` for code splitting:

```typescript
import { lazy, Suspense } from 'react';

const AgentConfigDialog = lazy(() => import('./AgentConfigDialog'));

export const SettingsPanel = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AgentConfigDialog />
  </Suspense>
);
```

## Accessibility

### Semantic HTML

Use semantic HTML elements:

```typescript
export const Navigation = () => (
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/ide">IDE</a></li>
      <li><a href="/agents">Agents</a></li>
    </ul>
  </nav>
);
```

### ARIA Attributes

Include ARIA attributes for accessibility:

```typescript
export const Button = ({ children, ...props }: ButtonProps) => (
  <button
    type="button"
    aria-label={props['aria-label']}
    aria-disabled={props.disabled}
    {...props}
  >
    {children}
  </button>
);
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **React**: [https://react.dev/](https://react.dev/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **CVA**: [https://cva.style/](https://cva.style/)
- **Testing Library**: [https://testing-library.com/react](https://testing-library.com/react)

### Implementation Files

- [`src/components/ide/MonacoEditor/`](../../src/components/ide/MonacoEditor/) - Monaco editor components
- [`src/components/ide/FileTree/`](../../src/components/ide/FileTree/) - File tree components
- [`src/components/chat/`](../../src/components/chat/) - Chat components
- [`src/components/ui/`](../../src/components/ui/) - Reusable UI components
- [`src/components/layout/`](../../src/components/layout/) - Layout components

---

**Document Status**: Active
**Last Updated**: 2025-12-27T13:30:00Z
**Next Review**: 2026-01-27