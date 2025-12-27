# Test Writing Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Test-Driven Development (TDD)

### When TDD is REQUIRED

- [ ] New story implementation (write failing test first)
- [ ] Bug fixes (write test that reproduces bug, then fix)
- [ ] Critical path features (AI tools, file sync, persistence)

### When TDD is OPTIONAL

- UI polish and styling changes
- Documentation updates
- Non-critical utility functions

---

## Coverage Requirements

| Category | Minimum | Target | Measurement |
|----------|---------|--------|-------------|
| **Unit Tests** | 60% | 80% | Lines covered |
| **Integration Tests** | 40% | 60% | Critical paths |
| **E2E Tests** | N/A | 14-step sequence | Manual/Playwright |

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
  },
});
```

---

## General Practices

- **Test Behavior, Not Implementation**: Focus on what the code does, not how
- **Clear Test Names**: `describe('SyncManager')` → `it('should emit sync:completed after successful sync')`
- **Mock External Dependencies**: Use `fake-indexeddb` for persistence, `@webcontainer/api` stubs
- **Fast Execution**: Unit tests should run in milliseconds
- **Isolated Tests**: Each test should be independent, no shared state

---

## Via-Gent Specific Patterns

### IndexedDB Testing

```typescript
import 'fake-indexeddb/auto';on

describe('ProjectStore', () => {
  beforeEach(async () => {
    await deleteDB('via-gent-db');
  });
  
  it('should persist project metadata', async () => {
    const store = new ProjectStore();
    await store.saveProject({ id: '1', name: 'Test' });
    const result = await store.getProject('1');
    expect(result?.name).toBe('Test');
  });
});
```

### WebContainer Mocking

```typescript
vi.mock('@webcontainer/api', () => ({
  WebContainer: {
    boot: vi.fn().mockResolvedValue({
      mount: vi.fn(),
      spawn: vi.fn().mockResolvedValue({ output: new ReadableStream() }),
      fs: { readFile: vi.fn(), writeFile: vi.fn() },
    }),
  },
}));
```

### FSA Permission Mocking

```typescript
const mockDirectoryHandle = {
  kind: 'directory',
  name: 'project',
  queryPermission: vi.fn().mockResolvedValue('granted'),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  values: vi.fn().mockReturnValue([]),
};
```

---

## Story Completion Checklist

Before marking a story as "done":

- [ ] Unit tests written for new/modified functions
- [ ] Tests pass locally (`pnpm test`)
- [ ] Coverage meets minimum thresholds
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] Manual verification of acceptance criteria
