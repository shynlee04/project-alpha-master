---
title: Via-gent Development Patterns and Conventions
version: 1.0.0
date: 2025-12-28
phase: Documentation
agent_mode: bmad-bmm-tech-writer
team: Documentation Team
---

# Via-gent Development Patterns and Conventions

## Overview

This document outlines the coding patterns, conventions, and best practices established in the Via-gent project. Following these conventions ensures consistency, maintainability, and quality across the codebase.

## Code Style Guidelines

### TypeScript Conventions

**Interface vs Type Alias:**

```typescript
// PREFERRED: Use interfaces for object types that may be extended
interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

// AVOID: Type aliases for object types
type ComponentProps = {
  className?: string;
  children: React.ReactNode;
};

// USE: Type aliases for unions, intersections, or primitives
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type EventHandler = (event: MouseEvent) => void;
```

**Generic Constraints:**

```typescript
// PREFERRED: Use meaningful generic parameter names
function createStore<T extends State>(initialState: T) {
  return create<T>();
}

// PREFERRED: Use extends for constraints
interface HasId {
  id: string;
}

function getById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
```

### Import Order Convention

Imports must follow a specific order:

```typescript
// 1. React imports
import { useState, useCallback, type FC } from 'react';

// 2. Third-party library imports
import { useQuery } from '@tanstack/react-query';
import { cn } from 'clsx';
import { z } from 'zod';

// 3. Internal module imports with @/ alias
import { useIDEStore } from '@/lib/state/ide-store';
import { useCredentialVault } from '@/lib/agent/providers/credential-vault';

// 4. Relative imports
import { ComponentName } from './ComponentName';
import { HelperFunction } from './utils/helper';
```

### Component Naming

```typescript
// PREFERRED: PascalCase for components
export const AgentConfigDialog: FC<AgentConfigDialogProps> = () => {
  return <div />;
};

// PREFERRED: Props interface with ComponentNameProps suffix
interface AgentConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// PREFERRED: Custom hooks with use prefix
export const useFileOperations = () => {
  // implementation
};
```

### File Naming

| File Type | Naming Convention | Example |
|-----------|------------------|---------|
| Components | PascalCase.tsx | AgentConfigDialog.tsx |
| Utilities | kebab-case.ts | file-lock.ts |
| Hooks | usePrefix.ts | useFileOperations.ts |
| Stores | kebab-case-store.ts | ide-store.ts |
| Types | kebab-case.ts | sync-types.ts |
| Tests | Same as source + .test.tsx | AgentConfigDialog.test.tsx |

## Component Patterns

### Functional Component Pattern

```typescript
import { type FC } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentNameProps } from './types';

interface ComponentNameProps {
  /** Primary content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Callback when clicked */
  onClick?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Component description for documentation
 */
export const ComponentName: FC<ComponentNameProps> = ({
  children,
  className,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  const isDisabled = disabled || !onClick;

  return (
    <button
      className={cn(
        'base-styles',
        {
          'variant-primary': variant === 'primary',
          'variant-secondary': variant === 'secondary',
          'opacity-50 cursor-not-allowed': isDisabled,
        },
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};
```

### Compound Component Pattern

```typescript
import { type FC, createContext, useContext, useState } from 'react';

// Context
interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Root component
interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export const Accordion: FC<AccordionProps> = ({ children, className }) => {
  const [openItems] = useState(() => new Set<string>());
  const toggle = (id: string) => {
    openItems.has(id) ? openItems.delete(id) : openItems.add(id);
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

// Sub-components
Accordion.Item = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('Must be used within Accordion');
  return <div data-open={context.openItems.has(id)}>{children}</div>;
};

Accordion.Trigger = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('Must be used within Accordion');
  return <button onClick={() => context.toggle(id)}>{children}</button>;
};
```

### Render Props Pattern

```typescript
interface DataLoaderProps<T> {
  url: string;
  children: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

export const DataLoader = <T,>({ url, children }: DataLoaderProps<T>) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then(r => r.json()),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <>{children(data as T, false, null)}</>;
};
```

## State Management Patterns

### Zustand Store Pattern

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';

interface IDEState {
  // State properties
  openFiles: string[];
  activeFile: string | null;
  panels: {
    explorer: boolean;
    search: boolean;
    chat: boolean;
  };
  terminalTab: 'bash' | 'powershell' | null;

  // Actions
  setActiveFile: (file: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  togglePanel: (panel: keyof IDEState['panels']) => void;
  setTerminalTab: (tab: IDEState['terminalTab']) => void;
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set, get) => ({
      // Initial state
      openFiles: [],
      activeFile: null,
      panels: {
        explorer: true,
        search: false,
        chat: true,
      },
      terminalTab: 'bash',

      // Actions
      setActiveFile: (file) => set({ activeFile: file }),

      openFile: (path) => {
        const { openFiles } = get();
        if (!openFiles.includes(path)) {
          set({ openFiles: [...openFiles, path], activeFile: path });
        } else if (get().activeFile !== path) {
          set({ activeFile: path });
        }
      },

      closeFile: (path) => {
        set((state) => ({
          openFiles: state.openFiles.filter((f) => f !== path),
          activeFile: state.activeFile === path
            ? state.openFiles[state.openFiles.length - 2] ?? null
            : state.activeFile,
        }));
      },

      togglePanel: (panel) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panel]: !state.panels[panel],
          },
        }));
      },

      setTerminalTab: (tab) => set({ terminalTab: tab }),
    }),
    {
      name: 'ide-store',
      storage: createJSONStorage(() => createDexieStorage('ide')),
    }
  )
);
```

### Custom Hook Pattern

```typescript
import { useState, useCallback, useEffect } from 'react';

interface UseFileOperationsOptions {
  projectId: string;
  onError?: (error: Error) => void;
}

export const useFileOperations = (options: UseFileOperationsOptions) => {
  const { projectId, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const readFile = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const content = await window.fs.readFile(path);
      return content;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [projectId, onError]);

  const writeFile = useCallback(async (path: string, content: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.fs.writeFile(path, content);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [projectId, onError]);

  return {
    readFile,
    writeFile,
    loading,
    error,
  };
};
```

## API Patterns

### TanStack Router Loader Pattern

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

const projectSchema = z.object({
  projectId: z.string(),
});

export const Route = createFileRoute('/workspace/$projectId')({
  component: WorkspacePage,
  validateSearch: projectSchema,
  loader: ({ params, search }) => {
    return fetchProject(params.projectId, search.includeFiles);
  },
  loaderDeps: ({ search }) => ({ includeFiles: search.includeFiles }),
});

async function fetchProject(projectId: string, includeFiles: boolean) {
  const response = await fetch(`/api/projects/${projectId}${includeFiles ? '?include=files' : ''}`);
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
}
```

### API Route Pattern

```typescript
import { type APIRoute } from 'astro';
import { createOpenaiChat } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, provider, model, credentials } = await request.json();

    // Validate credentials
    if (!credentials?.apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create provider adapter
    const providerAdapter = createProviderAdapter(provider, model, credentials.apiKey);

    // Stream response
    const result = await streamText({
      model: providerAdapter.getModel(),
      messages,
      system: 'You are a helpful AI coding assistant.',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

## Error Handling Patterns

### Custom Error Classes

```typescript
// src/lib/errors.ts

export class FileSystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class PermissionDeniedError extends FileSystemError {
  constructor(path: string, public operation: 'read' | 'write' | 'delete') {
    super(`Permission denied for ${operation} on ${path}`, 'PERMISSION_DENIED', path);
    this.name = 'PermissionDeniedError';
  }
}

export class SyncError extends Error {
  constructor(
    message: string,
    public localPath: string,
    public remotePath: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'SyncError';
  }
}
```

### Error Boundary Pattern

```typescript
import { type FC, type ReactNode } from 'react';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback?.(this.state.error, this.handleReset) ?? (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={this.handleReset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## Testing Patterns

### Component Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// Mock dependencies
vi.mock('@/lib/agent/providers/credential-vault', () => ({
  useCredentialVault: vi.fn(() => ({
    getCredential: vi.fn(() => 'test-api-key'),
    setCredential: vi.fn(),
  })),
}));

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ComponentName>Test Content</ComponentName>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick}>Click me</ComponentName>);

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<ComponentName loading>Loading...</ComponentName>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(<ComponentName error={new Error('Test error')}>Error</ComponentName>);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
```

### Hook Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFileOperations } from './useFileOperations';

// Mock File System Access API
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();

vi.stubGlobal('fs', {
  readFile: mockReadFile,
  writeFile: mockWriteFile,
});

describe('useFileOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads file successfully', async () => {
    mockReadFile.mockResolvedValue('file content');

    const { result } = renderHook(() => useFileOperations({ projectId: 'test' }));

    const content = await result.current.readFile('/test/file.txt');

    expect(content).toBe('file content');
    expect(mockReadFile).toHaveBeenCalledWith('/test/file.txt');
  });

  it('handles read error', async () => {
    mockReadFile.mockRejectedValue(new Error('Read failed'));

    const { result } = renderHook(() => useFileOperations({ projectId: 'test' }));

    await expect(result.current.readFile('/test/file.txt')).rejects.toThrow('Read failed');
    expect(result.current.error).toBeDefined();
  });

  it('writes file successfully', async () => {
    mockWriteFile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFileOperations({ projectId: 'test' }));

    await result.current.writeFile('/test/file.txt', 'new content');

    expect(mockWriteFile).toHaveBeenCalledWith('/test/file.txt', 'new content');
  });
});
```

## Utility Patterns

### Class Name Utility

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
const className = cn(
  'base-class',
  condition && 'conditional-class',
  variant === 'primary' && 'primary-variant',
  classNameProp
);
```

### Debounce Utility

```typescript
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Usage
const debouncedSearch = debounce((query: string) => {
  // Perform search
}, 300);
```

### Event Emitter Pattern

```typescript
import { EventEmitter } from 'eventemitter3';

interface WorkspaceEvents {
  fileOpened: (path: string) => void;
  fileClosed: (path: string) => void;
  fileChanged: (path: string, content: string) => void;
  projectSaved: () => void;
}

class WorkspaceEventEmitter extends EventEmitter<WorkspaceEvents> {}

export const workspaceEvents = new WorkspaceEventEmitter();

// Usage
workspaceEvents.on('fileOpened', (path) => {
  console.log('File opened:', path);
});

workspaceEvents.emit('fileOpened', '/src/App.tsx');
```

---

**Document Information**
- Version: 1.0.0
- Created: 2025-12-28
- Agent: bmad-bmm-tech-writer
- Phase: Documentation