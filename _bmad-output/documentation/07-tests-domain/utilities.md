# Test Utilities Documentation

## Overview

This document catalogs the test utilities, helpers, and mock factories available in the `src/__tests__` domain. These utilities provide consistent patterns for testing across the codebase.

## Test Setup Infrastructure

### Global Setup File

**Location:** `src/test/setup.ts`

The global setup file configures the test environment for all tests:

```typescript
// Key imports and configurations
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import React from 'react';

// Mocks applied globally
vi.mock('react-i18next', () => ({ /* ... */ }));
vi.mock('@tanstack/react-router', () => ({ /* ... */ }));
vi.mock('@/hooks/useCapabilityDetection', () => ({ /* ... */ }));
vi.mock('../../lib/workspace', () => ({ /* ... */ }));
vi.mock('@/lib/state', () => ({ /* ... */ }));

// Global stubs
vi.stubGlobal('crypto', mockCrypto);
vi.stubGlobal('ResizeObserver', vi.fn());
vi.stubGlobal('IntersectionObserver', vi.fn());
```

### Features of Global Setup

| Feature | Purpose | Location |
|---------|---------|----------|
| **fake-indexeddb/auto** | Mock IndexedDB implementation | Line 3 |
| **i18n Mock** | Translation function mock | Lines 9-89 |
| **Router Mock** | TanStack Router mock | Lines 92-100 |
| **Capability Detection Mock** | FSA/WebContainer capability flags | Lines 103-109 |
| **Workspace Mock** | Workspace state mock | Lines 112-127 |
| **IDE Store Mock** | IDE state mock | Lines 130-160 |
| **matchMedia Mock** | Media query mocking | Lines 163-177 |
| **ResizeObserver Mock** | Element resize detection mock | Lines 180-184 |
| **IntersectionObserver Mock** | Visibility detection mock | Lines 187-192 |
| **Crypto Mock** | Cryptographic operations mock | Lines 196-213 |

## Mock Utilities

### 1. Crypto Mock Utilities

**Location:** `src/test/setup.ts` (lines 194-213)

```typescript
const mockCrypto = {
    getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    },
    randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },
};

vi.stubGlobal('crypto', mockCrypto);
vi.stubGlobal('Crypto', mockCrypto);
```

**Usage:**
```typescript
// Crypto is automatically mocked in all tests
const randomBytes = crypto.getRandomValues(new Uint8Array(16));
const id = crypto.randomUUID();
```

### 2. Event Bus Mock

**Pattern from `tool-permission-manager.test.ts`:**

```typescript
const mockEventBus: EventEmitter3 = {
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    listenerCount: vi.fn(),
    eventNames: vi.fn(),
};

// Usage
manager.setEventBus(mockEventBus as any);
expect(mockEventBus.emit).toHaveBeenCalledWith('permission:changed', 'write_file', 'auto');
```

### 3. Dexie Database Mock

**Pattern from `credential-vault.test.ts`:**

```typescript
const mockCredentialsTable = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
};

const mockDb = {
    credentials: mockCredentialsTable,
};

vi.mock('../../state/dexie-db', () => mockDb);
```

### 4. Hoisted Mock Functions

**Pattern from `chat.test.ts` and `credential-vault.test.ts`:**

```typescript
// Use vi.hoisted for mocks that must run before imports
const { mockChat, mockToServerSentEventsStream, mockCreateOpenaiChat } = vi.hoisted(() => ({
    mockChat: vi.fn(),
    mockToServerSentEventsStream: vi.fn(),
    mockCreateOpenaiChat: vi.fn(),
}));

// Apply mocks
vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
    toServerSentEventsStream: mockToServerSentEventsStream,
}));

vi.mock('@tanstack/ai-openai', () => ({
    createOpenaiChat: mockCreateOpenaiChat,
}));
```

## Mock Data Utilities

### 1. Knowledge Mock Data

**Location:** `src/lib/knowledge/__tests__/mock-data.ts`

Provides standardized test data for knowledge tests:

```typescript
// Example structure (actual content varies)
export const mockKnowledgeSources = [
    {
        id: 'source-1',
        title: 'Test Document',
        type: 'pdf',
        content: 'Sample content...',
        metadata: { /* ... */ },
    },
    // ...
];

export const mockCollections = [
    {
        id: 'collection-1',
        name: 'Test Collection',
        sourceIds: ['source-1', 'source-2'],
    },
    // ...
];
```

### 2. Sync Events Mock

**Location:** `src/lib/filesync/__tests__/mock-sync-events.ts`

Provides mock sync event patterns:

```typescript
// Example structure
export const createMockSyncEvent = (type: SyncEventType) => ({
    type,
    timestamp: Date.now(),
    filePath: '/test/file.txt',
    status: 'pending',
});

export const mockSyncState = {
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: [],
    error: null,
};
```

### 3. WebContainer Mock

**Location:** `src/lib/webcontainer/__tests__/webcontainer.mock.ts`

Provides WebContainer API mocking:

```typescript
// Example structure
export const createMockWebContainer = () => ({
    mount: vi.fn().mockResolvedValue(undefined),
    spawn: vi.fn(),
    fs: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        rm: vi.fn(),
    },
    on: vi.fn(),
});

export const mockWebContainerInstance = createMockWebContainer();
```

## Test Store Utilities

### 1. Knowledge Store Test Setup

**Location:** `src/lib/state/knowledge/__tests__/test-store.ts`

```typescript
// Example pattern
export const createTestKnowledgeStore = (initialState?: Partial<KnowledgeState>) => {
    return create<KnowledgeState>()(
        persist(
            (set, get) => ({
                ...defaultState,
                ...initialState,
            }),
            { name: 'test-knowledge-store' }
        )
    );
};

export const defaultState: KnowledgeState = {
    sources: {},
    collections: {},
    metadata: {},
    undoStack: [],
    redoStack: [],
    preview: null,
};
```

### 2. Workspace Test Utilities

**Location:** `src/lib/workspace/__tests__/test-utils.ts`

```typescript
// Example pattern
export const createMockWorkspace = (overrides?: Partial<WorkspaceState>) => ({
    directoryHandle: null,
    permissionState: 'granted',
    syncStatus: 'idle',
    syncError: null,
    autoSync: true,
    isOpeningFolder: false,
    openFolder: vi.fn(),
    switchFolder: vi.fn(),
    syncNow: vi.fn(),
    setAutoSync: vi.fn(),
    projectMetadata: null,
    ...overrides,
});
```

## Helper Functions

### 1. Async Stream Helpers

```typescript
// Create a stream that yields chunks over time
export const createTimedStream = async function* <T>(
    chunks: T[],
    delayMs: number = 100
): AsyncGenerator<T> {
    for (const chunk of chunks) {
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
};

// Create a stream that errors
export const createErrorStream = <T>(error: Error): AsyncGenerator<T> => {
    return (async function* () {
        throw error;
    })();
};

// Create a stream that completes with done
export const createDoneStream = <T>(data: T[]): AsyncGenerator<T | { type: 'done' }> => {
    return (async function* () {
        for (const item of data) {
            yield item;
        }
        yield { type: 'done' };
    })();
};
```

### 2. Event Helper

```typescript
// Create a mock event with properties
export const createMockEvent = <T>(eventType: string, properties: T): T & { type: string } => ({
    type: eventType,
    ...properties,
});

// Wait for an event to be emitted
export const waitForEvent = (eventBus: EventEmitter, eventName: string, timeout: number = 1000): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Event ${eventName} not emitted within ${timeout}ms`));
        }, timeout);
        
        eventBus.once(eventName, (data) => {
            clearTimeout(timer);
            resolve(data);
        });
    });
};
```

### 3. Mock Store Helper

```typescript
// Create a mock Zustand store with selectors
export const createMockStore = <T>(initialState: T) => {
    const state = { ...initialState };
    const store = {
        getState: () => state,
        setState: (partial: Partial<T>) => {
            Object.assign(state, partial);
        },
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
    };
    return store;
};

// Create a store selector mock
export const createStoreSelectorMock = <T, R>(store: T, selector: (state: T) => R) => {
    return selector(store);
};
```

## Test Configuration

### Vitest Configuration

**Location:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [viteTsConfigPaths({ projects: ['./tsconfig.json'] })],
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
    },
});
```

### Environment-Specific Tests

Some tests require specific environments, specified with comments:

```typescript
/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
// Tests requiring DOM environment
```

## Custom Matchers

The project uses `@testing-library/jest-dom` for custom matchers:

```typescript
// Available matchers
expect(element).toBeInTheDocument();
expect(element).not.toBeVisible();
expect(element).toHaveTextContent('text');
expect(element).toHaveAttribute('attr', 'value');
expect(element).toHaveClass('class');
expect(element).toBeDisabled();
expect(element).toBeEnabled();
expect(element).toBeChecked();
expect(select).toHaveValue('option-value');
expect(list).toHaveLength(3);
```

## Common Testing Patterns

### 1. Mocking Imports

```typescript
// Full module mock
vi.mock('module-path', () => ({
    export1: vi.fn(),
    export2: vi.fn(),
}));

// Partial mock with vi.doMock
vi.doMock('module-path', () => ({
    export1: mockExport1,
}));
```

### 2. Mocking Functions

```typescript
// Create mock function
const mockFn = vi.fn();

// Set implementation
mockFn.mockImplementation((arg) => `mocked: ${arg}`);

// Mock return value
mockFn.mockReturnValue('result');

// Mock resolved value (async)
mockFn.mockResolvedValue('async-result');

// Mock rejected value
mockFn.mockRejectedValue(new Error('error'));

// Track calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
```

### 3. Spying on Objects

```typescript
// Spy on method
const obj = { method: (x) => x };
const spy = vi.spyOn(obj, 'method');

// Mock implementation
spy.mockImplementation((x) => x * 2);

// Restore original
spy.mockRestore();
```

### 4. Mocking Timers

```typescript
// Use fake timers
vi.useFakeTimers();

// Advance time
vi.advanceTimersByTime(1000);

// Run pending timers
vi.runAllTimers();

// Restore real timers
vi.useRealTimers();
```

## Best Practices

### 1. Mock Order
1. Import hoisted mocks first
2. Apply vi.mock() before imports
3. Use beforeAll for expensive setup
4. Use beforeEach for test isolation

### 2. Cleanup
```typescript
afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});
```

### 3. Test Data
- Use factory functions for consistent test data
- Avoid hardcoded values in assertions
- Create mock utilities for complex objects

### 4. Async Testing
- Always return promises in async tests
- Use async/await for readability
- Test error paths with try/catch

## Related Documentation

- [Testing Patterns](./testing-patterns.md)
- [Mocking Strategies](./mocking.md)
- [Test Coverage](./coverage.md)
- Vitest Documentation: https://vitest.dev/
- @testing-library/react: https://testing-library.com/docs/react-testing-library/
