# Tests Domain Documentation

## Overview

This directory contains comprehensive documentation for the `src/__tests__` domain of the project. The documentation is structured to help developers understand, maintain, and extend the test suite effectively.

## Documentation Structure

| File | Description |
|------|-------------|
| `scan-inventory.json` | Structured inventory of all test files, organized by domain category |
| `file-structure.txt` | Tree view of the test file structure across all domains |
| `testing-patterns.md` | Comprehensive guide to testing patterns used in the project |
| `coverage.md` | Detailed analysis of test coverage by domain and category |
| `utilities.md` | Catalog of test utilities, helpers, and mock factories |
| `mocking.md` | Documentation of mocking strategies and patterns |
| `README.md` | This file - English overview |
| `README-VI.md` | Vietnamese translation of this overview |

## Quick Reference

### Test Statistics

| Metric | Value |
|--------|-------|
| **Total Test Files** | 189 |
| **Total Test Cases** | ~950 |
| **Test Frameworks** | Vitest, @testing-library/react |
| **Estimated Coverage** | 45% |
| **Setup File** | `src/test/setup.ts` |

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm vitest run src/__tests__/chat.test.ts

# Run tests in watch mode
pnpm vitest

# Run with coverage
pnpm vitest run --coverage
```

### Test Configuration

- **Config File:** `vitest.config.ts`
- **Environment:** Node (default) / jsdom (per-test with comment)
- **Globals:** Enabled
- **Setup Files:** `./src/test/setup.ts`

## Domain Coverage

### High Coverage (75%+)
- **Agent:** AI agents, providers, tools, permissions (15 test files)
- **RAG:** Retrieval, chunking, indexing (12 test files)

### Medium Coverage (50-75%)
- **Filesystem:** FSA, sync, path validation (20 test files)
- **Knowledge:** Sources, metadata, synthesis (18 test files)
- **Workspace:** Project, session, state (8 test files)
- **Sync:** File sync, events, rollback (10 test files)
- **Presentation:** Components, UI integration (45 test files)
- **Hooks:** Custom hooks (12 test files)

### Low Coverage (<50%)
- **Notes:** Note operations, AI services (5 test files)
- **Study:** Quiz, SRS, flashcards (4 test files)
- **Events:** Event bus, workspace events (5 test files)
- **WebContainer:** Terminal, manager, crash recovery (6 test files)

## Key Testing Patterns

### 1. Module Mocking

```typescript
const { mockChat } = vi.hoisted(() => ({
    mockChat: vi.fn(),
}));

vi.mock('@tanstack/ai', () => ({
    chat: mockChat,
}));
```

### 2. Async Stream Testing

```typescript
const mockStream = (async function* () {
    yield { type: 'text-delta', text: 'Hello' };
    yield { type: 'done' };
})();

for await (const chunk of mockStream) {
    // Process chunk
}
```

### 3. Event Bus Testing

```typescript
const mockEventBus = {
    on: vi.fn(),
    emit: vi.fn(),
};

manager.setEventBus(mockEventBus as any);
expect(mockEventBus.emit).toHaveBeenCalledWith('event', data);
```

### 4. Workspace-Scoped Testing

```typescript
it('should allow execute_command in IDE workspace', () => {
    const result = manager.checkPermission('execute_command', 'ide');
    expect(result.canExecute).toBe(true);
});
```

## Test Utilities

### Global Setup (`src/test/setup.ts`)

- **fake-indexeddb/auto** - Mock IndexedDB implementation
- **i18n mock** - Translation function with predefined translations
- **Router mock** - TanStack Router stubs
- **Store mocks** - IDE Store, Workspace mock
- **Global stubs** - crypto, ResizeObserver, IntersectionObserver

### Mock Utilities

| Utility | Purpose |
|---------|---------|
| `vi.hoisted()` | Hoisted mock functions for proper initialization |
| `vi.mocked()` | Type-safe mock assertions |
| `vi.fn()` | Create mock functions |
| `vi.spyOn()` | Spy on existing methods |
| `vi.stubGlobal()` | Stub global objects |

## Best Practices

### Test Organization

1. **Descriptive Names:** Use clear test names describing expected behavior
2. **Proper Isolation:** Reset state between tests with `beforeEach`
3. **Mock External Dependencies:** Use `vi.mock()` for external modules
4. **Test Edge Cases:** Include empty, error, and boundary condition tests

### Mocking Guidelines

1. **Hoist Mocks:** Use `vi.hoisted()` for module-level mocks
2. **Type Safety:** Use `vi.mocked()` for type-safe assertions
3. **Reset Mocks:** Clear mocks with `vi.clearAllMocks()` in `afterEach`
4. **Verify Interactions:** Always verify mock calls with assertions

### Coverage Goals

| Priority | Target | Focus Areas |
|----------|--------|-------------|
| High | Expand | Notes, Study domains |
| Medium | Increase | Accessibility testing |
| Long-term | 75% | Overall coverage |

## Common Tasks

### Adding a New Test

1. Create test file in appropriate `__tests__` directory
2. Use consistent naming: `*.test.ts` or `*.test.tsx`
3. Follow established patterns from similar tests
4. Add to relevant domain section in `scan-inventory.json`

### Mocking a New Module

1. Determine mock level (module, function, global)
2. Use `vi.hoisted()` for initialization-order-sensitive mocks
3. Apply with `vi.mock()` at file level
4. Reset in `beforeEach` or `afterEach`

### Extending Coverage

1. Identify low-coverage areas from `coverage.md`
2. Add tests for edge cases and error paths
3. Consider integration tests for workflows
4. Document new patterns in `testing-patterns.md`

## Related Documentation

- [Testing Patterns](./testing-patterns.md)
- [Mocking Strategies](./mocking.md)
- [Test Utilities](./utilities.md)
- [Coverage Analysis](./coverage.md)
- Vitest Official Docs: https://vitest.dev/
- Testing Library: https://testing-library.com/

## Version Information

| Property | Value |
|----------|-------|
| **Scanner Version** | 1.0.0 |
| **Scan Date** | 2026-01-05 |
| **Last Updated** | 2026-01-05 |
| **Documentation Language** | English, Vietnamese |

## Contributing

When contributing to the test suite:

1. Follow established patterns from existing tests
2. Add descriptive test names and comments
3. Include error handling tests
4. Mock at appropriate level (module, not internals)
5. Verify coverage for new functionality
6. Update documentation files as needed

## License

This documentation is part of the project documentation and follows the same licensing terms as the project.
