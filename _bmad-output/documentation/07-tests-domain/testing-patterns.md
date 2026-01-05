# Testing Patterns Documentation

## Overview

This document catalogs the testing patterns, conventions, and best practices used throughout the `src/__tests__` domain. The project uses **Vitest** as the primary test runner with **@testing-library/react** for component testing.

## Test Framework Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Vitest** | ^4.0.16 | Test runner and assertion library |
| **@testing-library/react** | ^16.3.1 | React component testing utilities |
| **@testing-library/jest-dom** | ^6.9.1 | Custom Jest matchers for DOM testing |
| **@testing-library/user-event** | ^14.6.1 | User event simulation |
| **jest-axe** | ^10.0.0 | Accessibility testing |
| **vitest-axe** | ^0.1.0 | Accessibility assertions for Vitest |
| **fake-indexeddb** | ^6.2.5 | In-memory IndexedDB implementation |
| **jsdom** | ^27.4.0 | DOM environment for Node.js |

## Core Testing Patterns

### 1. Module Mocking Pattern

The project uses `vi.mock()` for module-level mocking to isolate units under test.

```typescript
// Pattern: Mock entire module
vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
    toServerSentEventsStream: mockToServerSentEventsStream,
}));

vi.mock('@tanstack/ai-openai', () => ({
    createOpenaiChat: mockCreateOpenaiChat,
}));

// Pattern: Mock with hoisted functions for initialization order
const { mockChat, mockToServerSentEventsStream, mockCreateOpenaiChat } = vi.hoisted(() => ({
    mockChat: vi.fn(),
    mockToServerSentEventsStream: vi.fn(),
    mockCreateOpenaiChat: vi.fn(),
}));
```

**Usage Example** (from `chat.test.ts`):
```typescript
// Track chat call arguments for verification
let lastChatCall: Record<string, unknown> | null = null;

describe('Chat API - SSE Streaming', () => {
    beforeEach(() => {
        lastChatCall = null;
        mockChat.mockReset();
        mockChat.mockImplementation((config: Record<string, unknown>) => {
            lastChatCall = { ...config };
            return mockStream as any;
        });
    });
});
```

### 2. Async Generator Stream Testing

Streaming functionality is tested using async generators to simulate real-time data flow.

```typescript
// Pattern: Async generator for stream simulation
const mockStream = (async function* () {
    yield { type: 'text-delta', text: 'Hello' };
    yield { type: 'text-delta', text: ' world' };
    yield { type: 'done' };
})();

// Pattern: Consuming stream in tests
it('should consume stream chunks correctly', async () => {
    const chunks: unknown[] = [];
    for await (const chunk of mockStream) {
        chunks.push(chunk);
    }
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual({ type: 'text-delta', text: 'Hello' });
});

// Pattern: Large stream efficiency testing
it('should handle large stream efficiently', async () => {
    const largeStream = (async function* () {
        for (let i = 0; i < 1000; i++) {
            yield { type: 'text-delta', text: `chunk ${i}` };
        }
        yield { type: 'done' };
    })();
    
    let count = 0;
    for await (const _ of largeStream) {
        count++;
    }
    expect(count).toBe(1001);
});
```

### 3. Error Handling Pattern

Errors are tested by throwing in async generators and catching in tests.

```typescript
// Pattern: Error in stream
it('should handle network errors gracefully', async () => {
    const errorStream = (async function* () {
        throw new Error('Network error');
    })();
    
    vi.mocked(chat).mockReturnValue(errorStream as any);
    
    try {
        for await (const _ of errorStream) {
            // Consume stream
        }
        expect(true).toBe(false); // Should not reach here
    } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
    }
});

// Pattern: Timeout errors
it('should handle timeout errors', async () => {
    const timeoutStream = (async function* () {
        yield { type: 'text-delta', text: 'Hello' };
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Stream timeout');
    })();
    
    vi.mocked(chat).mockReturnValue(timeoutStream as any);
    
    try {
        for await (const _ of timeoutStream) {
            // Consume stream
        }
        expect(true).toBe(false);
    } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Stream timeout');
    }
});

// Pattern: Connection abort
it('should handle connection abort', async () => {
    const abortController = new AbortController();
    abortController.abort();
    
    const abortedStream = (async function* () {
        yield { type: 'text-delta', text: 'Hello' };
        throw new DOMException('Aborted', 'AbortError');
    })();
    
    vi.mocked(chat).mockReturnValue(abortedStream as any);
    
    try {
        for await (const _ of abortedStream) {
            // Consume stream
        }
        expect(true).toBe(false);
    } catch (error) {
        expect(error).toBeInstanceOf(DOMException);
    }
});
```

### 4. Test Organization Pattern

Tests are organized using nested `describe` blocks for logical grouping.

```typescript
describe('Chat API - SSE Streaming', () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    let mockAbortController: { abort: () => void };
    let mockStream: AsyncGenerator<unknown>;
    
    beforeEach(() => {
        // Setup
    });
    
    afterEach(() => {
        vi.clearAllMocks();
    });
    
    describe('Stream Consumption', () => {
        it('should consume stream chunks correctly', async () => {
            // Test
        });
        
        it('should handle empty stream gracefully', async () => {
            // Test
        });
    });
    
    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            // Test
        });
        
        it('should handle timeout errors', async () => {
            // Test
        });
    });
    
    describe('Completion Detection', () => {
        it('should detect done event correctly', async () => {
            // Test
        });
    });
    
    describe('Tool Execution', () => {
        it('should handle tool calls in stream', async () => {
            // Test
        });
    });
});
```

### 5. Event Bus Testing Pattern

Events are tested by mocking the event emitter and verifying emissions.

```typescript
// Pattern: Event bus mock
const mockEventBus: EventEmitter3 = {
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    listenerCount: vi.fn(),
    eventNames: vi.fn(),
};

// Pattern: Testing event emission
it('should emit permission:changed event when level changes', () => {
    manager.setEventBus(mockEventBus as any);
    manager.setTrustLevel('write_file', 'auto');
    expect(mockEventBus.emit).toHaveBeenCalledWith('permission:changed', 'write_file', 'auto');
});

// Pattern: Event subscription testing
it('should set event bus', () => {
    manager.setEventBus(mockEventBus as any);
    expect(mockEventBus.on).toHaveBeenCalled();
});
```

### 6. Workspace-Scoped Permission Testing

Tests verify behavior across different workspace contexts.

```typescript
// Pattern: Workspace-specific tests
describe('Workspace-Scoped Permissions (Ralph Loop 51-3)', () => {
    describe('Different trust levels per workspace', () => {
        it('should allow execute_command in IDE workspace with prompt', () => {
            const result = manager.checkPermission('execute_command', 'ide');
            expect(result.canExecute).toBe(true);
            expect(result.reason).toBe('prompt');
        });
        
        it('should block execute_command in knowledge workspace', () => {
            const result = manager.checkPermission('execute_command', 'knowledge');
            expect(result.canExecute).toBe(false);
            expect(result.reason).toBe('block');
        });
        
        it('should allow read_file in all workspaces with auto', () => {
            const ideResult = manager.checkPermission('read_file', 'ide');
            const knowledgeResult = manager.checkPermission('read_file', 'knowledge');
            const notesResult = manager.checkPermission('read_file', 'notes');
            const studyResult = manager.checkPermission('read_file', 'study');
            
            expect(ideResult.canExecute).toBe(true);
            expect(knowledgeResult.canExecute).toBe(true);
            expect(notesResult.canExecute).toBe(true);
            expect(studyResult.canExecute).toBe(true);
        });
    });
});
```

### 7. Test Setup Pattern

The project uses a centralized test setup file for global mocks.

```typescript
// src/test/setup.ts

// Pattern: Import fake-indexeddb first
import 'fake-indexeddb/auto';

// Pattern: Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => translations[key] || key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
}));

// Pattern: Mock router
vi.mock('@tanstack/react-router', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/' })),
}));

// Pattern: Mock stores
vi.mock('@/lib/state', () => ({
    useIDEStore: vi.fn((selector: (state: unknown) => unknown) => {
        const state = {
            projectId: 'test-project',
            openFiles: [],
            // ...
        };
        if (typeof selector === 'function') {
            return selector(state);
        }
        return state;
    }),
}));

// Pattern: Stub globals
vi.stubGlobal('crypto', mockCrypto);
vi.stubGlobal('ResizeObserver', vi.fn());
vi.stubGlobal('IntersectionObserver', vi.fn());
```

### 8. Component Testing Pattern

React components are tested using @testing-library/react.

```typescript
/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle', () => {
    it('should render theme toggle button', () => {
        render(<ThemeToggle />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    it('should toggle theme on click', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);
        
        await user.click(screen.getByRole('button'));
        // Verify theme toggle occurred
    });
});
```

### 9. Performance Testing Pattern

Performance is tested by measuring execution time.

```typescript
// Pattern: Performance testing
it('should handle rapid message updates', async () => {
    const rapidStream = (async function* () {
        for (let i = 0; i < 100; i++) {
            yield { type: 'text-delta', text: `chunk ${i}` };
        }
        yield { type: 'done' };
    })();
    
    vi.mocked(chat).mockReturnValue(rapidStream as any);
    
    const startTime = Date.now();
    const chunks: unknown[] = [];
    for await (const chunk of chat({
        adapter: {} as any,
        messages: [{ role: 'user', content: 'test' }],
    })) {
        chunks.push(chunk);
    }
    const endTime = Date.now();
    
    expect(chunks).toHaveLength(101);
    expect(endTime - startTime).toBeLessThan(1000);
});

// Pattern: Concurrent stream testing
it('should handle concurrent streams', async () => {
    let streamVersion = 1;
    
    mockChat.mockImplementation(() => {
        const version = streamVersion;
        return (async function* () {
            yield { type: 'text-delta', text: `Stream ${version}` };
            yield { type: 'done' };
        })();
    });
    
    const runStream1 = async () => {
        const chunks: unknown[] = [];
        for await (const chunk of chat({ /*...*/ })) {
            chunks.push(chunk);
        }
        return chunks;
    };
    
    const [result1, result2] = await Promise.all([runStream1(), runStream2()]);
    
    expect(result1).toHaveLength(2);
    expect(result2).toHaveLength(2);
});
```

### 10. Singleton Pattern Testing

Singletons are tested for instance consistency.

```typescript
// Pattern: Singleton testing
describe('Singleton Pattern', () => {
    it('should return same instance on multiple getInstance() calls', () => {
        const instance1 = ToolPermissionManager.getInstance();
        const instance2 = ToolPermissionManager.getInstance();
        expect(instance1).toBe(instance2);
    });
    
    it('should create new instance with createInstance()', () => {
        const instance1 = ToolPermissionManager.getInstance();
        const instance2 = ToolPermissionManager.createInstance();
        expect(instance1).not.toBe(instance2);
    });
});
```

### 11. Trust Level Testing Pattern

Tool permissions are tested across trust levels (auto, prompt, block).

```typescript
// Pattern: Trust level testing
describe('Trust Level Modification', () => {
    it('should allow changing trust level for a tool', () => {
        manager.setTrustLevel('write_file', 'auto');
        expect(manager.getTrustLevel('write_file')).toBe('auto');
    });
});

describe('Permission Check - Auto Mode', () => {
    it('should return needsApproval=false for auto tool', () => {
        const result = manager.checkPermission('read_file');
        expect(result.needsApproval).toBe(false);
    });
    
    it('should return canExecute=true for auto tool', () => {
        const result = manager.checkPermission('read_file');
        expect(result.canExecute).toBe(true);
    });
});

describe('Permission Check - Block Mode', () => {
    it('should return needsApproval=false for blocked tool', () => {
        const result = manager.checkPermission('delete_file');
        expect(result.needsApproval).toBe(false);
    });
    
    it('should return canExecute=false for blocked tool', () => {
        const result = manager.checkPermission('delete_file');
        expect(result.canExecute).toBe(false);
    });
});
```

### 12. Session Trust Testing Pattern

Temporary trust is tested for session-scoped permissions.

```typescript
// Pattern: Session trust testing
describe('Session Trust', () => {
    it('should initially have no session trust', () => {
        expect(manager.hasSessionTrust('write_file')).toBe(false);
    });
    
    it('should add session trust for a tool', () => {
        manager.addSessionTrust('write_file');
        expect(manager.hasSessionTrust('write_file')).toBe(true);
    });
    
    it('should remove session trust', () => {
        manager.addSessionTrust('write_file');
        manager.removeSessionTrust('write_file');
        expect(manager.hasSessionTrust('write_file')).toBe(false);
    });
});

describe('Session Trust Override', () => {
    it('should return needsApproval=false when session trust exists', () => {
        manager.addSessionTrust('write_file');
        const result = manager.checkPermission('write_file');
        expect(result.needsApproval).toBe(false);
    });
    
    it('should still block even with session trust', () => {
        manager.addSessionTrust('delete_file');
        const result = manager.checkPermission('delete_file');
        expect(result.canExecute).toBe(false);
    });
});
```

## Testing Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Use `afterEach` for cleanup
- Avoid shared mutable state between tests

### 2. Clear Test Names
- Use descriptive test names
- Follow pattern: `it('should [expected behavior] when [condition]', ...)`
- Include expected outcomes in test names

### 3. Mock External Dependencies
- Mock API calls with `vi.mock()`
- Mock file system with in-memory alternatives
- Mock IndexedDB with `fake-indexeddb`

### 4. Test Edge Cases
- Empty streams
- Error conditions
- Large inputs
- Concurrent operations
- Timeout scenarios

### 5. Use Appropriate Assertions
- `toBe()` for primitives
- `toEqual()` for objects/arrays
- `toHaveBeenCalledWith()` for function calls
- `toBeInstanceOf()` for error types
- `toBeLessThan()` for performance assertions

### 6. Maintain Test Files
- Keep tests close to source files (same directory with `__tests__`)
- Use consistent naming: `*.test.ts` or `*.test.tsx`
- Document test purpose at file level

## Configuration Reference

```typescript
// vitest.config.ts
export default defineConfig({
    plugins: [viteTsConfigPaths({ projects: ['./tsconfig.json'] })],
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
    },
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Run specific test file
pnpm vitest run src/__tests__/chat.test.ts

# Run tests with coverage
pnpm vitest run --coverage
```

## Known Limitations

1. **Crypto Mock Timing**: Some crypto operations occur at module load time, making them difficult to mock. Tests use `vi.hoisted()` to work around this.

2. **Environment-Specific Tests**: Some tests require `@vitest-environment jsdom` comment for proper DOM simulation.

3. **IndexedDB Complexity**: Full IndexedDB testing requires `fake-indexeddb/auto` import before any database code.

4. **Test Performance**: Some integration tests may be slow due to async operations and file system mocking.
