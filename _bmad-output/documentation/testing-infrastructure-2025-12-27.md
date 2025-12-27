---
date: 2025-12-27
time: "19:35:00 UTC"
phase: Documentation
team: Documentation
agent_mode: documentation-writer
document_id: testing-infrastructure-2025-12-27
version: 1.0.0
handoff:
  from: null
  to: null
  timestamp: 2025-12-27T19:35:00Z
---

# Testing Infrastructure

## Overview

This document describes the testing infrastructure for the Via-gent project, including test framework configuration, test organization, mocking strategies, and testing best practices.

## Table of Contents

- [Test Framework Configuration](#test-framework-configuration)
- [Test File Organization](#test-file-organization)
- [Test Environments](#test-environments)
- [Mocking Strategies](#mocking-strategies)
- [Test Utilities](#test-utilities)
- [Test Coverage Areas](#test-coverage-areas)
- [Running Tests](#running-tests)
- [Testing Best Practices](#testing-best-practices)
- [References](#references)

---

## Test Framework Configuration

### Vitest Configuration

The project uses **Vitest** as the test framework, configured in [`vitest.config.ts`](../vitest.config.ts):

```typescript
import { defineConfig } from 'vitest/config';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  test: {
    environment: 'node', // Default environment
    environmentMatchGlobs: ['**/*.test.tsx'], // jsdom for React components
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**Key Configuration Points:**
- **Default Environment**: `node` for utility and library tests
- **Environment Matching**: `*.test.tsx` files use `jsdom` environment
- **Path Aliases**: `viteTsConfigPaths` plugin resolves `@/*` imports
- **Setup File**: Global test setup at [`./src/test/setup.ts`](../src/test/setup.ts)

### Test Setup File

The global setup file ([`src/test/setup.ts`](../src/test/setup.ts)) configures the test environment:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

---

## Test File Organization

### Co-located Tests

Tests are co-located in `__tests__` directories adjacent to source files:

```
src/
├── components/
│   ├── __tests__/
│   │   ├── ThemeToggle.test.tsx
│   │   ├── workspace-i18n.test.tsx
│   │   └── dashboard-i18n.test.tsx
│   ├── agent/
│   │   ├── __tests__/
│   │   │   └── AgentConfigDialog.test.tsx
│   └── ide/
│       ├── __tests__/
│       │   ├── AgentChatPanel.test.tsx
│       │   ├── StreamingMessage.test.tsx
│       │   └── SyncStatusIndicator.test.tsx
│       └── FileTree/
│           └── __tests__/
│               └── FileTree.test.ts
├── lib/
│   ├── filesystem/
│   │   ├── __tests__/
│   │   │   ├── local-fs-adapter.test.ts
│   │   │   ├── sync-planner.test.ts
│   │   │   └── exclusion-config.test.ts
│   ├── webcontainer/
│   │   └── __tests__/
│   │       └── terminal-adapter.test.ts
│   └── workspace/
│       ├── __tests__/
│       │   ├── project-store.test.ts
│       │   ├── ide-state-store.test.ts
│       │   └── conversation-store.test.ts
└── routes/
    └── api/
        └── __tests__/
            └── chat.test.ts
```

### Test File Naming Convention

- Test files follow the pattern: `*.test.ts` or `*.test.tsx`
- `.test.tsx` for React component tests (uses `jsdom` environment)
- `.test.ts` for utility/library tests (uses `node` environment)

---

## Test Environments

### jsdom Environment

Used for React component tests. Provides a DOM implementation for testing:

```typescript
// vitest.config.ts
environmentMatchGlobs: ['**/*.test.tsx'], // Matches .test.tsx files
```

**Example - React Component Test** ([`src/components/__tests__/ThemeToggle.test.tsx`](../src/components/__tests__/ThemeToggle.test.tsx)):

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Mock window.matchMedia for next-themes
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
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
  });

  it('should toggle theme when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
```

### node Environment

Used for utility and library tests that don't require a DOM:

```typescript
// vitest.config.ts
environment: 'node', // Default for .test.ts files
```

---

## Mocking Strategies

### File System Access API Mocking

The File System Access API is mocked for file system tests:

```typescript
// Mock window.showDirectoryPicker
const mockDirectoryHandle = {
  name: 'test-project',
  kind: 'directory',
  queryPermission: vi.fn().mockResolvedValue('granted'),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  entries: vi.fn().mockResolvedValue([]),
};

vi.stubGlobal('showDirectoryPicker', vi.fn().mockResolvedValue(mockDirectoryHandle));

// Mock FileSystemFileHandle
const mockFileHandle = {
  name: 'test.txt',
  kind: 'file',
  getFile: vi.fn().mockResolvedValue({
    text: vi.fn().mockResolvedValue('file content'),
  }),
  createWritable: vi.fn().mockResolvedValue({
    write: vi.fn(),
    close: vi.fn(),
  }),
};
```

**Example - LocalFSAdapter Test** ([`src/lib/filesystem/__tests__/local-fs-adapter.test.ts`](../src/lib/filesystem/__tests__/local-fs-adapter.test.ts)):

```typescript
describe('LocalFSAdapter', () => {
  let mockDirectoryHandle: FileSystemDirectoryHandle;

  beforeEach(() => {
    mockDirectoryHandle = createMockDirectoryHandle();
    vi.stubGlobal('showDirectoryPicker', vi.fn().mockResolvedValue(mockDirectoryHandle));
  });

  it('should request directory access', async () => {
    const adapter = new LocalFSAdapter();
    await adapter.requestDirectoryAccess();

    expect(window.showDirectoryPicker).toHaveBeenCalled();
  });

  it('should read file content', async () => {
    const adapter = new LocalFSAdapter();
    await adapter.requestDirectoryAccess();
    
    const content = await adapter.readFile('/test.txt');
    expect(content).toBe('file content');
  });
});
```

### TanStack AI Mocking

TanStack AI functions are mocked for agent and chat API tests:

```typescript
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';

// Mock TanStack AI
vi.mock('@tanstack/ai', () => ({
  chat: vi.fn(),
  toServerSentEventsStream: vi.fn(),
}));

vi.mock('@tanstack/ai-openai', () => ({
  createOpenaiChat: vi.fn(),
}));
```

**Example - Chat API Test** ([`src/routes/api/__tests__/chat.test.ts`](../src/routes/api/__tests__/chat.test.ts)):

```typescript
describe('Chat API - SSE Streaming', () => {
  let mockStream: AsyncGenerator<unknown>;

  beforeEach(() => {
    // Create mock stream
    mockStream = (async function* () {
      yield { type: 'text-delta', text: 'Hello' };
      yield { type: 'text-delta', text: ' world' };
      yield { type: 'done' };
    })();

    // Mock chat function
    vi.mocked(chat).mockReturnValue(mockStream as any);
  });

  it('should consume stream chunks correctly', async () => {
    const chunks: unknown[] = [];
    for await (const chunk of mockStream) {
      chunks.push(chunk);
    }
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual({ type: 'text-delta', text: 'Hello' });
  });
});
```

### WebContainer Mocking

WebContainer operations are mocked for terminal and file system tests:

```typescript
// Mock WebContainer manager
vi.mock('../manager', () => ({
  isBooted: vi.fn(),
  spawn: vi.fn(),
}));

// Create mock process
const createMockProcess = () => {
  const inputWriter = {
    write: vi.fn().mockResolvedValue(undefined),
    releaseLock: vi.fn(),
  };

  return {
    output: new ReadableStream(),
    input: { getWriter: vi.fn().mockReturnValue(inputWriter) },
    exit: new Promise(() => {}),
    kill: vi.fn(),
  };
};
```

**Example - Terminal Adapter Test** ([`src/lib/webcontainer/__tests__/terminal-adapter.test.ts`](../src/lib/webcontainer/__tests__/terminal-adapter.test.ts)):

```typescript
describe('Terminal Adapter', () => {
  let mockTerminal;
  let mockProcess;

  beforeEach(() => {
    mockTerminal = createMockTerminal();
    mockProcess = createMockProcess();

    vi.mocked(isBooted).mockReturnValue(true);
    vi.mocked(spawn).mockResolvedValue(mockProcess as any);
  });

  it('should start shell with default options', async () => {
    const adapter = createTerminalAdapter({ terminal: mockTerminal as any });
    await adapter.startShell();

    expect(spawn).toHaveBeenCalledWith('jsh', [], {
      terminal: { cols: 80, rows: 24 },
    });
  });
});
```

### IndexedDB Mocking

IndexedDB is mocked using `fake-indexeddb` for persistence tests:

```typescript
import 'fake-indexeddb/auto';

// Tests can now use indexedDB as if it were a real implementation
const db = await indexedDB.open('test-db', 1);
// ... test operations
```

---

## Test Utilities

### @testing-library/react

Primary testing utility for React components:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Render component
render(<MyComponent />);

// Query elements
const button = screen.getByRole('button');
const heading = screen.getByText('Welcome');
const input = screen.getByLabelText('Username');

// User interactions
await userEvent.click(button);
await userEvent.type(input, 'test value');

// Wait for async updates
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Custom Error Classes

Tests use custom error classes for file system operations:

```typescript
import {
  FileSystemError,
  PermissionDeniedError,
  SyncError,
} from '../sync-types';

it('should throw PermissionDeniedError on access denied', async () => {
  vi.mocked(mockDirectoryHandle.requestPermission)
    .mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));

  const adapter = new LocalFSAdapter();
  
  await expect(adapter.requestDirectoryAccess()).rejects.toThrow(PermissionDeniedError);
});
```

---

## Test Coverage Areas

### File System Operations

Comprehensive tests for file system adapter and sync manager:

- **LocalFSAdapter** ([`src/lib/filesystem/__tests__/local-fs-adapter.test.ts`](../src/lib/filesystem/__tests__/local-fs-adapter.test.ts)): 423 lines
  - Directory access requests
  - File read/write operations
  - Directory listing
  - Permission handling
  - Error scenarios

- **Sync Planner** ([`src/lib/filesystem/__tests__/sync-planner.test.ts`](../src/lib/filesystem/__tests__/sync-planner.test.ts)):
  - Sync plan generation
  - Exclusion pattern matching
  - File comparison logic

- **Exclusion Config** ([`src/lib/filesystem/__tests__/exclusion-config.test.ts`](../src/lib/filesystem/__tests__/exclusion-config.test.ts)):
  - Default exclusion patterns
  - Custom exclusion rules

### WebContainer Integration

Tests for WebContainer terminal adapter and process management:

- **Terminal Adapter** ([`src/lib/webcontainer/__tests__/terminal-adapter.test.ts`](../src/lib/webcontainer/__tests__/terminal-adapter.test.ts)): 207 lines
  - Shell spawning with options
  - Working directory (cwd) handling
  - Terminal resize operations
  - Input/output handling
  - Process lifecycle (start, dispose)
  - Error states (NOT_BOOTED, ALREADY_STARTED, DISPOSED)

### Chat API and Streaming

Comprehensive tests for SSE streaming and chat API:

- **Chat API** ([`src/routes/api/__tests__/chat.test.ts`](../src/routes/api/__tests__/chat.test.ts)): 656 lines, 15 tests
  - Stream consumption patterns
  - Error handling (network errors, timeouts, malformed events)
  - Completion detection (`done` events)
  - Tool calls in streams
  - Provider integration (OpenRouter, OpenAI)
  - Message format handling (user, assistant, system)
  - Debug mode (tool enable/disable)
  - Performance (concurrent streams, rapid updates)

### React Components

Tests for UI components:

- **ThemeToggle** ([`src/components/__tests__/ThemeToggle.test.tsx`](../src/components/__tests__/ThemeToggle.test.tsx)):
  - Theme switching functionality
  - `window.matchMedia` mocking for next-themes

- **Workspace i18n** ([`src/components/__tests__/workspace-i18n.test.tsx`](../src/components/__tests__/workspace-i18n.test.tsx)):
  - Translation key rendering
  - Language switching

- **Agent Components** ([`src/components/agent/__tests__/AgentConfigDialog.test.tsx`](../src/components/agent/__tests__/AgentConfigDialog.test.tsx)):
  - Agent configuration UI
  - Provider selection
  - API key input

- **IDE Components** ([`src/components/ide/__tests__/`](../src/components/ide/__tests__/):
  - AgentChatPanel: Chat interface with streaming messages
  - StreamingMessage: Message rendering with code blocks
  - SyncStatusIndicator: Sync status display

### State Management

Tests for Zustand stores and persistence:

- **Project Store** ([`src/lib/workspace/project-store.test.ts`](../src/lib/workspace/project-store.test.ts)):
  - Project metadata persistence
  - IndexedDB operations

- **IDE State Store** ([`src/lib/workspace/ide-state-store.test.ts`](../src/lib/workspace/ide-state-store.test.ts)):
  - IDE state management
  - Panel visibility
  - File tabs

- **Conversation Store** ([`src/lib/workspace/conversation-store.test.ts`](../src/lib/workspace/conversation-store.test.ts)):
  - Chat history persistence
  - Message CRUD operations

---

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test --watch
```

### Run Tests with Coverage

```bash
pnpm test --coverage
```

### Run Specific Test File

```bash
pnpm test src/lib/filesystem/__tests__/local-fs-adapter.test.ts
```

### Run Tests Matching Pattern

```bash
pnpm test -- --grep "should request directory access"
```

---

## Testing Best Practices

### 1. Mock External Dependencies

Always mock external APIs and services:

```typescript
// Mock File System Access API
vi.stubGlobal('showDirectoryPicker', vi.fn());

// Mock TanStack AI
vi.mock('@tanstack/ai', () => ({
  chat: vi.fn(),
}));

// Mock WebContainer
vi.mock('../manager', () => ({
  isBooted: vi.fn(),
  spawn: vi.fn(),
}));
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested:

```typescript
// Good
it('should throw NOT_BOOTED error when WebContainer not booted', async () => {
  // ...
});

// Bad
it('should throw error', async () => {
  // ...
});
```

### 3. Test Happy Path and Error Cases

Test both successful operations and error scenarios:

```typescript
describe('readFile()', () => {
  it('should read file content successfully', async () => {
    // Happy path test
  });

  it('should throw FileSystemError when file not found', async () => {
    // Error case test
  });

  it('should throw PermissionDeniedError on permission denied', async () => {
    // Permission error test
  });
});
```

### 4. Clean Up After Each Test

Use `afterEach` to clean up mocks and state:

```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup(); // @testing-library/react cleanup
});
```

### 5. Use Appropriate Test Environment

- Use `jsdom` for React component tests (`.test.tsx`)
- Use `node` for utility/library tests (`.test.ts`)

### 6. Test Async Operations Properly

Use `async/await` and `waitFor` for async operations:

```typescript
it('should handle async file read', async () => {
  const adapter = new LocalFSAdapter();
  const content = await adapter.readFile('/test.txt');
  expect(content).toBe('file content');
});

it('should wait for UI update', async () => {
  render(<MyComponent />);
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### 7. Mock Browser APIs

Mock browser APIs that aren't available in test environment:

```typescript
beforeEach(() => {
  // Mock window.matchMedia for next-themes
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      // ... other properties
    })),
  });
});
```

### 8. Test Component Interactions

Use `@testing-library/user-event` for realistic user interactions:

```typescript
import userEvent from '@testing-library/user-event';

it('should handle form submission', async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Form submitted')).toBeInTheDocument();
});
```

### 9. Use Custom Error Classes

Test with custom error classes for domain-specific errors:

```typescript
it('should throw PermissionDeniedError', async () => {
  await expect(adapter.requestDirectoryAccess())
    .rejects.toThrow(PermissionDeniedError);
});

it('should throw SyncError on sync failure', async () => {
  await expect(syncManager.sync())
    .rejects.toThrow(SyncError);
});
```

### 10. Test Stream Consumption

For streaming APIs, test chunk consumption and completion:

```typescript
it('should accumulate text deltas correctly', async () => {
  const textStream = (async function* () {
    yield { type: 'text-delta', text: 'Hello' };
    yield { type: 'text-delta', text: ' ' };
    yield { type: 'text-delta', text: 'world' };
    yield { type: 'done' };
  })();

  let accumulatedText = '';
  for await (const chunk of textStream) {
    if (chunk.type === 'text-delta') {
      accumulatedText += chunk.text;
    }
  }
  expect(accumulatedText).toBe('Hello world');
});
```

---

## References

### Internal Documentation

- [`AGENTS.md`](../AGENTS.md) - Project-specific development guidelines
- [`vitest.config.ts`](../vitest.config.ts) - Test framework configuration
- [`src/test/setup.ts`](../src/test/setup.ts) - Global test setup

### External Documentation

- **Vitest**: [https://vitest.dev/](https://vitest.dev/)
- **@testing-library/react**: [https://testing-library.com/react](https://testing-library.com/react)
- **@testing-library/user-event**: [https://testing-library.com/docs/user-event](https://testing-library.com/docs/user-event)
- **fake-indexeddb**: [https://github.com/dumbmatter/fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB)
- **jsdom**: [https://github.com/jsdom/jsdom](https://github.com/jsdom/jsdom)

### Related Test Files

- [`src/components/__tests__/ThemeToggle.test.tsx`](../src/components/__tests__/ThemeToggle.test.tsx)
- [`src/components/__tests__/workspace-i18n.test.tsx`](../src/components/__tests__/workspace-i18n.test.tsx)
- [`src/components/agent/__tests__/AgentConfigDialog.test.tsx`](../src/components/agent/__tests__/AgentConfigDialog.test.tsx)
- [`src/components/ide/__tests__/AgentChatPanel.test.tsx`](../src/components/ide/__tests__/AgentChatPanel.test.tsx)
- [`src/components/ide/__tests__/StreamingMessage.test.tsx`](../src/components/ide/__tests__/StreamingMessage.test.tsx)
- [`src/components/ide/__tests__/SyncStatusIndicator.test.tsx`](../src/components/ide/__tests__/SyncStatusIndicator.test.tsx)
- [`src/components/ide/FileTree/__tests__/FileTree.test.ts`](../src/components/ide/FileTree/__tests__/FileTree.test.ts)
- [`src/lib/filesystem/__tests__/local-fs-adapter.test.ts`](../src/lib/filesystem/__tests__/local-fs-adapter.test.ts)
- [`src/lib/filesystem/__tests__/sync-planner.test.ts`](../src/lib/filesystem/__tests__/sync-planner.test.ts)
- [`src/lib/filesystem/__tests__/exclusion-config.test.ts`](../src/lib/filesystem/__tests__/exclusion-config.test.ts)
- [`src/lib/webcontainer/__tests__/terminal-adapter.test.ts`](../src/lib/webcontainer/__tests__/terminal-adapter.test.ts)
- [`src/routes/api/__tests__/chat.test.ts`](../src/routes/api/__tests__/chat.test.ts)

---

**Document Status**: Complete
**Last Updated**: 2025-12-27T19:35:00Z
