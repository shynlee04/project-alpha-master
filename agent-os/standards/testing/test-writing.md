---
date: '2025-12-31'
time: '03:55:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Testing Standards

_Standards for writing, organizing, and maintaining tests in the Via-gent project. This document defines testing strategies, frameworks, test organization, coverage requirements, and testing patterns for React components, stores, utilities, and API routes._

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

| Layer | Purpose | Coverage Target | Tools |
|-------|---------|-----------------|-------|
| **Unit Tests** | Individual functions, components | 70-80% | Vitest, React Testing Library |
| **Integration Tests** | Component interactions | 20-30% | Vitest, React Testing Library |
| **E2E Tests** | Critical user flows | 5-10% | Playwright |

### 1.2 Testing Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Test Behavior, Not Implementation** | Test what the user sees, not how it's done | React Testing Library queries |
| **Descriptive Test Names** | Test names should describe the behavior | "should save file when submit clicked" |
| **Single Assertion Per Test** | Each test should test one behavior | One expect per it block |
| **Test Isolation** | Tests should not depend on each other | Each test with fresh mocks |
| **Fast Feedback** | Tests should run quickly | Unit tests < 100ms each |

---

## 2. Testing Framework Setup

### 2.1 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@tanstack/react-router-plugin/react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Test environment
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    
    // File patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/', '.output/'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/test/**',
        'src/main.tsx',
        'src/App.tsx',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Run in parallel
    maxThreads: 4,
    minThreads: 2,
  },
});
```

### 2.2 Test Setup File

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserver;

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
```

---

## 3. Test File Organization

### 3.1 Test Location Convention

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.types.ts
│       ├── index.ts
│       └── __tests__/
│           └── Button.test.tsx        # Component tests
├── lib/
│   └── utils/
│       ├── format.ts
│       └── __tests__/
│           └── format.test.ts          # Utility tests
├── stores/
│   └── useIDEStore.ts
│   └── __tests__/
│       └── useIDEStore.test.ts         # Store tests
└── test/
    ├── setup.ts                        # Test setup
    ├── mocks/                          # Shared mocks
    │   ├── webcontainer.ts
    │   └── file-system.ts
    └── utils/                          # Test utilities
        ├── render-with-store.tsx
        └── wait-for.ts
```

### 3.2 Test File Naming

| Pattern | Example | Purpose |
|---------|---------|---------|
| `{Component}.test.tsx` | `Button.test.tsx` | Component tests |
| `{function}.test.ts` | `format.test.ts` | Utility function tests |
| `{hook}.test.ts` | `useAgentChat.test.ts` | Hook tests |
| `{store}.test.ts` | `useIDEStore.test.ts` | Store tests |
| `{service}.test.ts` | `api.test.ts` | API/service tests |

---

## 4. Component Testing

### 4.1 Basic Component Test

```typescript
// src/components/ui/Button/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import '@testing-library/jest-dom';

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

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });
});
```

### 4.2 Testing Component with Context

```typescript
// src/components/chat/ChatPanel/__tests__/ChatPanel.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChatPanel } from '../ChatPanel';
import { useAgentChat } from '@/lib/agent/hooks/use-agent-chat';

// Mock dependencies
vi.mock('@/lib/agent/hooks/use-agent-chat');
vi.mock('@/components/chat/ChatConversation');
vi.mock('@/components/ui/Input');

const mockUseAgentChat = useAgentChat as vi.Mock;

describe('ChatPanel', () => {
  const mockSendMessage = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAgentChat.mockReturnValue({
      messages: [],
      isLoading: false,
      sendMessage: mockSendMessage,
      error: null,
    });
  });

  it('renders chat conversation with messages', () => {
    const mockMessages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' },
    ];
    
    mockUseAgentChat.mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      sendMessage: mockSendMessage,
      error: null,
    });

    render(<ChatPanel />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows loading state while sending', () => {
    mockUseAgentChat.mockReturnValue({
      messages: [],
      isLoading: true,
      sendMessage: mockSendMessage,
      error: null,
    });

    render(<ChatPanel />);
    
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    mockUseAgentChat.mockReturnValue({
      messages: [],
      isLoading: false,
      sendMessage: mockSendMessage,
      error: new Error('Failed to send'),
    });

    render(<ChatPanel />);
    
    expect(screen.getByText('Failed to send')).toBeInTheDocument();
  });

  it('calls sendMessage when form is submitted', async () => {
    mockUseAgentChat.mockReturnValue({
      messages: [],
      isLoading: false,
      sendMessage: mockSendMessage,
      error: null,
    });

    render(<ChatPanel />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const form = screen.getByRole('form');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
  });
});
```

---

## 5. Store Testing

### 5.1 Zustand Store Test

```typescript
// src/lib/state/ide-store/__tests__/ide-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIDEStore } from '../ide-store';
import { Provider } from 'zustand-x';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('useIDEStore', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={useIDEStore}>{children}</Provider>
  );

  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useIDEStore.setState({
        openFiles: [],
        activeFile: null,
        activeProject: null,
      });
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useIDEStore(), { wrapper });
    
    expect(result.current.openFiles).toEqual([]);
    expect(result.current.activeFile).toBeNull();
  });

  it('adds file to open files', () => {
    const { result } = renderHook(() => useIDEStore(), { wrapper });
    
    act(() => {
      result.current.addOpenFile('/src/index.ts');
    });
    
    expect(result.current.openFiles).toContain('/src/index.ts');
  });

  it('removes file from open files', () => {
    const { result } = renderHook(() => useIDEStore(), { wrapper });
    
    act(() => {
      result.current.addOpenFile('/src/index.ts');
      result.current.addOpenFile('/src/App.tsx');
      result.current.removeOpenFile('/src/index.ts');
    });
    
    expect(result.current.openFiles).toEqual(['/src/App.tsx']);
  });

  it('sets active file', () => {
    const { result } = renderHook(() => useIDEStore(), { wrapper });
    
    act(() => {
      result.current.setActiveFile('/src/index.ts');
    });
    
    expect(result.current.activeFile).toBe('/src/index.ts');
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useIDEStore(), { wrapper });
    
    act(() => {
      result.current.addOpenFile('/src/index.ts');
      result.current.setActiveFile('/src/index.ts');
    });
    
    // Verify state is persisted
    const state = useIDEStore.getState();
    expect(state.openFiles).toContain('/src/index.ts');
  });

  it('clears all open files', () => {
    const { result } = renderHook(() => useIDEStore(), { wrapper });
    
    act(() => {
      result.current.addOpenFile('/src/index.ts');
      result.current.addOpenFile('/src/App.tsx');
      result.current.clearOpenFiles();
    });
    
    expect(result.current.openFiles).toEqual([]);
    expect(result.current.activeFile).toBeNull();
  });
});
```

---

## 6. Utility Function Testing

### 6.1 Pure Function Test

```typescript
// src/lib/utils/path-utils/__tests__/path-utils.test.ts
import { describe, it, expect } from 'vitest';
import { 
  joinPath, 
  normalizePath, 
  getFileName, 
  getFileExtension,
  isAbsolutePath 
} from '../path-utils';

describe('path-utils', () => {
  describe('joinPath', () => {
    it('joins two path segments', () => {
      expect(joinPath('src', 'lib')).toBe('src/lib');
    });

    it('handles trailing slashes', () => {
      expect(joinPath('src/', '/lib/')).toBe('src/lib');
    });

    it('joins multiple segments', () => {
      expect(joinPath('src', 'lib', 'utils.ts')).toBe('src/lib/utils.ts');
    });

    it('handles empty segments', () => {
      expect(joinPath('', 'src', '')).toBe('src');
    });
  });

  describe('normalizePath', () => {
    it('normalizes path separators', () => {
      expect(normalizePath('src\\lib\\utils.ts')).toBe('src/lib/utils.ts');
    });

    it('removes redundant slashes', () => {
      expect(normalizePath('src//lib//utils.ts')).toBe('src/lib/utils.ts');
    });

    it('resolves parent directory references', () => {
      expect(normalizePath('src/../lib')).toBe('lib');
    });

    it('resolves current directory references', () => {
      expect(normalizePath('src/./lib')).toBe('src/lib');
    });
  });

  describe('getFileName', () => {
    it('extracts filename from path', () => {
      expect(getFileName('/src/lib/utils.ts')).toBe('utils.ts');
    });

    it('handles trailing slashes', () => {
      expect(getFileName('/src/lib/')).toBe('');
    });

    it('handles empty path', () => {
      expect(getFileName('')).toBe('');
    });
  });

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(getFileExtension('/src/lib/utils.ts')).toBe('.ts');
    });

    it('returns empty string for files without extension', () => {
      expect(getFileExtension('/src/Makefile')).toBe('');
    });

    it('handles hidden files', () => {
      expect(getFileExtension('/src/.gitignore')).toBe('');
    });
  });

  describe('isAbsolutePath', () => {
    it('returns true for absolute paths', () => {
      expect(isAbsolutePath('/src/lib/utils.ts')).toBe(true);
    });

    it('returns false for relative paths', () => {
      expect(isAbsolutePath('src/lib/utils.ts')).toBe(false);
      expect(isAbsolutePath('./src/lib/utils.ts')).toBe(false);
      expect(isAbsolutePath('../src/lib/utils.ts')).toBe(false);
    });
  });
});
```

---

## 7. API Testing

### 7.1 API Route Test

```typescript
// src/routes/api/chat/__tests__/chat.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '../route';
import { createMockRequest } from '@/test/utils/create-mock-request';

// Mock AI provider
vi.mock('@/lib/agent/providers/provider-adapter', () => ({
  providerAdapterFactory: {
    createAdapter: vi.fn(),
  },
}));

describe('/api/chat', () => {
  describe('GET', () => {
    it('returns chat configuration', async () => {
      const request = createMockRequest('GET', '/api/chat');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('providers');
      expect(body).toHaveProperty('models');
    });
  });

  describe('POST', () => {
    it('processes chat request successfully', async () => {
      const request = createMockRequest('POST', '/api/chat', {
        body: {
          message: 'Hello, assistant!',
          provider: 'openrouter',
          model: 'claude-3-haiku',
        },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('response');
      expect(body.response).toBeTruthy();
    });

    it('returns 400 for missing message', async () => {
      const request = createMockRequest('POST', '/api/chat', {
        body: {
          provider: 'openrouter',
          model: 'claude-3-haiku',
        },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Message is required');
    });

    it('returns 401 for unauthorized provider', async () => {
      const request = createMockRequest('POST', '/api/chat', {
        body: {
          message: 'Hello!',
          provider: 'invalid-provider',
          model: 'invalid-model',
        },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Invalid provider');
    });

    it('handles streaming responses', async () => {
      const request = createMockRequest('POST', '/api/chat', {
        body: {
          message: 'Write a function',
          provider: 'openrouter',
          model: 'claude-3-haiku',
          stream: true,
        },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
    });
  });
});
```

---

## 8. Test Utilities

### 8.1 Render with Store

```typescript
// src/test/utils/render-with-store.tsx
import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { Provider as ZustandProvider } from 'zustand-x';
import { useIDEStore } from '@/lib/state/ide-store';
import { useAgentStore } from '@/stores/agents';

interface RenderWithStoreOptions {
  ideStoreState?: Partial<ReturnType<typeof useIDEStore.getState>>;
  agentStoreState?: Partial<ReturnType<typeof useAgentStore.getState>>;
}

export function renderWithStore(
  component: React.ReactElement,
  options: RenderWithStoreOptions = {}
): RenderResult {
  const { ideStoreState = {}, agentStoreState = {} } = options;

  // Set initial store state
  if (Object.keys(ideStoreState).length > 0) {
    act(() => {
      useIDEStore.setState(ideStoreState);
    });
  }

  if (Object.keys(agentStoreState).length > 0) {
    act(() => {
      useAgentStore.setState(agentStoreState);
    });
  }

  return render(
    <ZustandProvider store={useIDEStore}>
      <ZustandProvider store={useAgentStore}>
        {component}
      </ZustandProvider>
    </ZustandProvider>
  );
}
```

### 8.2 Mock WebContainer

```typescript
// src/test/mocks/webcontainer.ts
import { vi } from 'vitest';

export const createWebContainerMock = () => ({
  boot: vi.fn().mockResolvedValue(undefined),
  mount: vi.fn().mockResolvedValue(undefined),
  spawn: vi.fn().mockImplementation(() => ({
    output: {
      getReader: () => ({
        read: vi.fn().mockResolvedValue({ done: true }),
      }),
    },
    exit: vi.fn().mockResolvedValue(0),
  })),
  fs: {
    readFile: vi.fn().mockResolvedValue('file content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockResolvedValue({ isFile: () => true, isDirectory: () => false }),
  },
  on: vi.fn(),
  off: vi.fn(),
});

export const webContainerMock = createWebContainerMock();

// Set up global mock
vi.mock('@webcontainer/api', () => ({
  WebContainer: {
    instance: webContainerMock,
  },
}));
```

---

## 9. Test Coverage Requirements

### 9.1 Coverage Thresholds

```json
// package.json
{
  "vitest": {
    "coverage": {
      "thresholds": {
        "lines": 70,
        "functions": 70,
        "branches": 70,
        "statements": 70,
        "perFile": true
      }
    }
  }
}
```

### 9.2 Coverage by Type

| File Type | Minimum Coverage | Priority |
|-----------|-----------------|----------|
| **Utils** | 90% | High |
| **Stores** | 85% | High |
| **Components** | 70% | Medium |
| **API Routes** | 80% | High |
| **Hooks** | 85% | Medium |

---

## 10. Testing Best Practices

### 10.1 Test Organization Guidelines

```typescript
// Recommended test structure
describe('ComponentName', () => {
  // Setup
  const defaultProps = { /* ... */ };
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });
  
  // Rendering tests
  describe('rendering', () => {
    it('renders correctly with default props', () => {});
    it('renders correctly with custom props', () => {});
    it('does not render when hidden', () => {});
  });
  
  // Interaction tests
  describe('interactions', () => {
    it('handles click events', () => {});
    it('handles keyboard events', () => {});
    it('does not call onClick when disabled', () => {});
  });
  
  // State tests
  describe('state management', () => {
    it('updates state on user input', () => {});
    it('resets state when props change', () => {});
  });
  
  // Edge cases
  describe('edge cases', () => {
    it('handles empty data', () => {});
    it('handles loading state', () => {});
    it('handles error state', () => {});
  });
});
```

### 10.2 Testing Async Operations

```typescript
// Testing async operations with waitFor
import { waitFor, screen } from '@testing-library/react';

it('updates list after async operation', async () => {
  render(<DataList />);
  
  // Initial state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
  
  // Assert final state
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.getByText('Item 2')).toBeInTheDocument();
});

// Testing with findBy
it('displays data after loading', async () => {
  render(<DataComponent />);
  
  const item = await screen.findByText('Loaded Item');
  expect(item).toBeInTheDocument();
});
```

---

## Related Documents

- [`global/coding-style.md`](../global/coding-style.md): Code patterns
- [`global/error-handling.md`](../global/error-handling.md): Error patterns
- [`global/validation.md`](../global/validation.md): Validation standards
- [`frontend/components.md`](../frontend/components.md): Component patterns

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15*
