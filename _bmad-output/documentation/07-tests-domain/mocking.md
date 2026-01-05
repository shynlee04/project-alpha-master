# Mocking Strategies Documentation

## Overview

This document catalogs the mocking strategies and patterns used throughout the `src/__tests__` domain. Proper mocking is essential for isolating units under test and ensuring reliable, fast test execution.

## Mocking Categories

### 1. Module-Level Mocks

Module-level mocks replace entire module imports with test implementations.

#### TanStack AI Mock

**Location:** `src/__tests__/chat.test.ts`

```typescript
// Hoisted mock functions for proper initialization order
const { mockChat, mockToServerSentEventsStream, mockCreateOpenaiChat } = vi.hoisted(() => ({
    mockChat: vi.fn(),
    mockToServerSentEventsStream: vi.fn(),
    mockCreateOpenaiChat: vi.fn(),
}));

// Apply module mock
vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
    toServerSentEventsStream: mockToServerSentEventsStream,
}));

vi.mock('@tanstack/ai-openai', () => ({
    createOpenaiChat: mockCreateOpenaiChat,
}));
```

**Usage in Tests:**
```typescript
mockChat.mockImplementation((config: Record<string, unknown>) => {
    lastChatCall = { ...config };
    return mockStream as any;
});

mockChat.mockReset();
expect(mockChat).toHaveBeenCalledWith(config);
```

#### React Router Mock

**Location:** `src/test/setup.ts`

```typescript
vi.mock('@tanstack/react-router', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/' })),
    useSearch: vi.fn(() => ({})),
    useParams: vi.fn(() => ({})),
    RouterProvider: ({ children }: { children: React.ReactNode }) => 
        React.createElement(React.Fragment, null, children),
    createRouter: vi.fn(),
    Router: vi.fn(({ children }: { children: React.ReactNode }) => 
        React.createElement(React.Fragment, null, children)),
}));
```

#### i18n Mock

**Location:** `src/test/setup.ts`

```typescript
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'ide.hideChat': 'Hide chat',
                'ide.showChat': 'Show chat',
                // ... more translations
            };
            return translations[key] || key;
        },
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));
```

### 2. Global Object Mocks

Global objects are stubbed for consistent behavior across tests.

#### Crypto Mock

**Location:** `src/test/setup.ts`

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

#### ResizeObserver Mock

```typescript
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
```

#### IntersectionObserver Mock

```typescript
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
}));
```

#### matchMedia Mock

```typescript
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
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
}
```

### 3. Store Mocks

#### IDE Store Mock

**Location:** `src/test/setup.ts`

```typescript
vi.mock('@/lib/state', () => ({
    useIDEStore: vi.fn((selector: (state: unknown) => unknown) => {
        const state = {
            projectId: 'test-project',
            openFiles: [],
            activeFile: null,
            expandedPaths: new Set<string>(),
            panelLayouts: {},
            terminalTab: 'terminal',
            chatVisible: true,
            activeFileScrollTop: 0,
            // Actions
            setProjectId: vi.fn(),
            addOpenFile: vi.fn(),
            removeOpenFile: vi.fn(),
            setActiveFile: vi.fn(),
            toggleExpanded: vi.fn(),
            setExpandedPaths: vi.fn(),
            setPanelLayout: vi.fn(),
            setTerminalTab: vi.fn(),
            toggleChatVisible: vi.fn(),
            setChatVisible: vi.fn(),
            setActiveFileScrollTop: vi.fn(),
            reset: vi.fn(),
        };
        if (typeof selector === 'function') {
            return selector(state);
        }
        return state;
    }),
}));
```

#### Workspace Store Mock

```typescript
vi.mock('../../lib/workspace', () => ({
    useWorkspace: vi.fn(() => ({
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
    })),
    WorkspaceProvider: ({ children }: { children: React.ReactNode }) => 
        React.createElement(React.Fragment, null, children),
}));
```

#### Capability Detection Mock

```typescript
vi.mock('@/hooks/useCapabilityDetection', () => ({
    useCapabilityDetection: vi.fn(() => ({
        supportsFSA: true,
        supportsWebContainer: true,
        isMobile: false,
    })),
}));
```

### 4. Database Mocks

#### Dexie/IndexedDB Mock

**Location:** `src/test/setup.ts`

```typescript
// fake-indexeddb/auto is imported at the top of setup.ts
import 'fake-indexeddb/auto';
```

**Usage in Tests:**

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

// Test usage
await mockDb.credentials.put({ id: 'provider-1', key: 'api-key' });
expect(mockCredentialsTable.put).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'provider-1' })
);
```

### 5. Event Bus Mocks

#### Custom Event Bus Mock

```typescript
import type { EventEmitter3 } from 'eventemitter3';

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

### 6. Function Mocks

#### Mock Function Patterns

```typescript
// Create mock function
const mockFn = vi.fn();

// Set implementation
mockFn.mockImplementation((arg) => `processed: ${arg}`);

// Mock return value
mockFn.mockReturnValue('result');

// Mock multiple return values
mockFn.mockReturnValueOnce('first').mockReturnValueOnce('second').mockReturnValue('default');

// Mock async resolved value
mockFn.mockResolvedValue('async-result');

// Mock async rejected value
mockFn.mockRejectedValue(new Error('error'));

// Mock implementation once
mockFn.mockImplementationOnce(() => 'special');

// Track calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
expect(mockFn).toHaveBeenLastCalledWith(lastArg);

// Clear calls
mockFn.mockClear();

// Reset completely
mockFn.mockReset();
```

#### SpyOn Pattern

```typescript
// Spy on object method
const obj = { method: (x: number) => x * 2 };
const spy = vi.spyOn(obj, 'method');

// Mock implementation
spy.mockImplementation((x) => x + 1);

// Mock return value
spy.mockReturnValue(100);

// Verify calls
expect(spy).toHaveBeenCalledWith(5);

// Restore original
spy.mockRestore();
```

### 7. Async Generator Mocks

#### Stream Mocking Pattern

```typescript
// Create async generator stream
const mockStream = (async function* () {
    yield { type: 'text-delta', text: 'Hello' };
    yield { type: 'text-delta', text: ' world' };
    yield { type: 'done' };
})();

// Large stream for performance testing
const largeStream = (async function* () {
    for (let i = 0; i < 1000; i++) {
        yield { type: 'text-delta', text: `chunk ${i}` };
    }
    yield { type: 'done' };
})();

// Error stream
const errorStream = (async function* () {
    throw new Error('Network error');
})();

// Consume stream in test
const chunks: unknown[] = [];
for await (const chunk of mockStream) {
    chunks.push(chunk);
}
expect(chunks).toHaveLength(3);
```

### 8. Component Mocks

#### React Component Mock

```typescript
// Mock a component
vi.mock('../SomeComponent', () => ({
    SomeComponent: ({ prop }: { prop: string }) => 
        React.createElement('div', null, `Mocked: ${prop}`),
}));
```

#### Hook Mock

```typescript
vi.mock('@/hooks/useCustomHook', () => ({
    useCustomHook: vi.fn(() => ({
        data: 'mock-data',
        loading: false,
        error: null,
    })),
}));
```

## Mocking Strategies by Domain

### Agent Domain

**Strategy:** Heavy mocking of TanStack AI, providers, and credential storage.

```typescript
// Provider adapter mock
vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
    toServerSentEventsStream: mockToServerSentEventsStream,
}));

// Credential storage mock
const mockCredentialsTable = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
};
```

### RAG Domain

**Strategy:** Mock Orama index, chunking utilities, and storage.

```typescript
// Orama mock
vi.mock('@orama/orama', () => ({
    create: vi.fn().mockResolvedValue(mockIndex),
    search: vi.fn().mockResolvedValue(mockResults),
}));

// Storage mock
const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
};
```

### Filesystem Domain

**Strategy:** Mock FSA API, WebContainer, and sync operations.

```typescript
// FSA handle mock
const mockDirectoryHandle = {
    getDirectoryHandle: vi.fn(),
    values: vi.fn(),
    // ...
};

// WebContainer mock
const mockWebContainer = {
    mount: vi.fn().mockResolvedValue(undefined),
    spawn: vi.fn(),
    fs: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
    },
};
```

### Presentation Domain

**Strategy:** Mock routing, stores, and external UI libraries.

```typescript
// Component library mock
vi.mock('@radix-ui/react-dialog', () => ({
    Dialog: ({ children }: { children: React.ReactNode }) => 
        React.createElement(React.Fragment, null, children),
    DialogTrigger: ({ children }: { children: React.ReactNode }) => 
        React.createElement(React.Fragment, null, children),
    // ...
}));
```

## Mocking Best Practices

### 1. Use Hoisted Mocks for Module Imports

```typescript
// ✅ CORRECT: Hoisted for proper initialization
const { mockChat } = vi.hoisted(() => ({
    mockChat: vi.fn(),
}));
vi.mock('@tanstack/ai', () => ({ chat: mockChat }));

// ❌ INCORRECT: Not hoisted, may cause initialization issues
const mockChat = vi.fn();
vi.mock('@tanstack/ai', () => ({ chat: mockChat }));
```

### 2. Reset Mocks Between Tests

```typescript
beforeEach(() => {
    mockChat.mockReset();
    mockChat.mockClear();
});

afterEach(() => {
    vi.clearAllMocks();
});
```

### 3. Use Type-Safe Mocks

```typescript
// ✅ Type-safe
vi.mocked(chat).mockReturnValue(stream);

// ❌ Not type-safe
chat.mockReturnValue(stream);
```

### 4. Mock at the Right Level

```typescript
// ✅ Mock at module level for full isolation
vi.mock('@/lib/agent/tool-permission-manager', () => ({
    ToolPermissionManager: mockManager,
}));

// ❌ Don't spy on implementation details
const manager = new ToolPermissionManager();
vi.spyOn(manager, 'checkPermission');
```

### 5. Avoid Over-Mocking

```typescript
// ✅ Mock only what's necessary
vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
}));

// ❌ Don't mock everything
vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
    toServerSentEventsStream: mockToSSE,
    streamToText: mockStreamToText,
    createChat: mockCreateChat,
    // ... too many mocks
}));
```

### 6. Verify Mock Interactions

```typescript
it('should call chat with correct config', () => {
    chat({ adapter: mockAdapter, messages: testMessages });
    
    expect(mockChat).toHaveBeenCalledWith(
        expect.objectContaining({
            adapter: mockAdapter,
            messages: testMessages,
        })
    );
});

it('should not call chat if already processing', () => {
    // Setup: manager is processing
    manager.process();
    
    // Action
    manager.process();
    
    // Verify: chat was only called once
    expect(mockChat).toHaveBeenCalledTimes(1);
});
```

## Common Issues and Solutions

### Issue 1: Crypto Not Available

**Problem:** `crypto.getRandomValues` not available in Node.js test environment.

**Solution:** Use `vi.stubGlobal('crypto', mockCrypto)` in setup file.

### Issue 2: Module Import Timing

**Problem:** Module uses crypto at import time before mock is applied.

**Solution:** Use `vi.hoisted()` for mock definitions and `vi.mock()` for application.

### Issue 3: Event Bus Not Mocked

**Problem:** Event emitter not properly mocked causing test failures.

**Solution:** Create complete mock with all required methods.

```typescript
const mockEventBus = {
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    listenerCount: vi.fn(),
    eventNames: vi.fn(),
};
```

### Issue 4: Store Selectors Not Working

**Problem:** Store mock doesn't handle selector functions correctly.

**Solution:** Implement proper selector handling in mock.

```typescript
vi.mock('@/lib/state', () => ({
    useIDEStore: vi.fn((selector) => {
        const state = { /* ... */ };
        if (typeof selector === 'function') {
            return selector(state);
        }
        return state;
    }),
}));
```

## Mocking Anti-Patterns

### 1. Mocking Everything

```typescript
// ❌ BAD: Over-mocking
vi.mock('axios');
vi.mock('lodash');
vi.mock('date-fns');
// ... many mocks

// ✅ GOOD: Mock only external dependencies
vi.mock('axios'); // External API
// Don't mock utility libraries
```

### 2. Mocking Internal Implementation

```typescript
// ❌ BAD: Mocking internal functions
vi.mock('../internal/helper', () => ({
    internalCalculate: vi.fn(),
}));

// ✅ GOOD: Mock at public API boundary
vi.mock('../service', () => ({
    Service: mockService,
}));
```

### 3. Incomplete Mocks

```typescript
// ❌ BAD: Missing required properties
const mockEventBus = {
    on: vi.fn(),
    emit: vi.fn(),
    // Missing: off, removeAllListeners, etc.
};

// ✅ GOOD: Complete mock with all properties
const mockEventBus = {
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    listenerCount: vi.fn(),
    eventNames: vi.fn(),
};
```

### 4. Not Verifying Mock Calls

```typescript
// ❌ BAD: Not checking mock interactions
it('should call API', () => {
    service.fetchData();
    // No assertion
});

// ✅ GOOD: Verify mock was called correctly
it('should call API with correct params', () => {
    service.fetchData({ id: '123' });
    expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ id: '123' })
    );
});
```

## Related Documentation

- [Testing Patterns](./testing-patterns.md)
- [Test Utilities](./utilities.md)
- [Test Coverage](./coverage.md)
- Vitest Mocking: https://vitest.dev/api/vi.html#vi-mock
- Testing Library: https://testing-library.com/
