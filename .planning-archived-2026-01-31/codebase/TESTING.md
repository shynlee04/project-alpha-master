# Testing Patterns

**Analysis Date:** 2026-01-31

## Test Framework

**Unit/Integration Tests:**
- **Runner:** Vitest 4.0.16
- **Config:** `vitest.config.ts`
- **Setup file:** `src/test/setup.ts`

**E2E Tests:**
- **Runner:** Playwright 1.57.0
- **Config:** `playwright.config.ts`
- **Test directory:** `e2e/journeys/`

**Run Commands:**
```bash
# Unit Tests
pnpm test                      # Run all tests
pnpm test:fast                 # Parallel execution with thread pool
pnpm test [pattern]            # Run matching tests

# E2E Tests
pnpm test:e2e                  # Run all E2E tests
pnpm test:e2e:ui               # Interactive UI mode
pnpm test:e2e:debug            # Debug mode
pnpm test:e2e:headed           # Visible browser
pnpm test:e2e:ide              # IDE workspace journey only
pnpm test:e2e:notes            # Notes workspace journey only
pnpm test:e2e:knowledge        # Knowledge workspace journey only
pnpm test:e2e:study            # Study workspace journey only
pnpm test:e2e:cross-workspace  # Cross-workspace integration

# Coverage
COVERAGE=true pnpm test        # With coverage report
```

## Test File Organization

**Location:**
- **Unit tests:** Co-located in `__tests__/` subdirectory OR adjacent with `.test.ts` suffix
- **E2E tests:** Separate in `e2e/journeys/` directory
- **Setup/mocks:** `src/test/setup.ts`

**Naming:**
- Unit tests: `*.test.ts`, `*.test.tsx`
- Spec tests (E2E/journey): `*.spec.ts`, `*.journey.spec.ts`
- Page objects: `e2e/pages/*.ts`

**Structure:**
```
src/
├── domain/entities/__tests__/
│   ├── project.test.ts
│   ├── workspace.test.ts
│   └── study.test.ts
├── infrastructure/persistence/stores/
│   ├── layout/sidebar-store.test.ts    # Co-located
│   └── __tests__/
│       └── workspace-store-factory.test.ts
├── presentation/components/
│   └── ide/__tests__/
│       ├── AgentChatPanel.test.tsx
│       └── SyncStatusIndicator.test.tsx
└── test/
    └── setup.ts                         # Global test setup

e2e/
├── journeys/
│   ├── ide-workspace.journey.spec.ts
│   ├── notes-workspace.journey.spec.ts
│   ├── knowledge-workspace.journey.spec.ts
│   └── cross-workspace-integration.journey.spec.ts
├── pages/
│   ├── IDEPage.ts                       # Page Object Model
│   └── NotesPage.ts
├── fixtures/
├── utils/
└── results/
```

## Test Structure

**Suite Organization:**
```typescript
/**
 * @fileoverview Component Tests
 * @module components/feature/__tests__/Component.test
 * @vitest-environment jsdom  // For DOM tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  // Test setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct default state', async () => {
      // Arrange
      const { store } = await import('./store');

      // Act
      const state = store.getState();

      // Assert
      expect(state.isExpanded).toBe(true);
    });
  });

  describe('action name', () => {
    it('should perform expected behavior', async () => {
      // Test implementation
    });

    it('should handle edge case', async () => {
      // Edge case test
    });
  });
});
```

**Patterns:**
- Use `describe` blocks to group related tests
- Nested `describe` for actions/features
- Clear test names: "should [expected behavior] when [condition]"
- AAA pattern: Arrange, Act, Assert

## Mocking

**Framework:** Vitest's built-in `vi` mock utilities

**Global Mocks (setup.ts):**
```typescript
// Mock IndexedDB
import 'fake-indexeddb/auto';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

// Mock @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  useParams: vi.fn(() => ({})),
}));

// Mock browser APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

**Component-Level Mocks:**
```typescript
// Mock specific modules per test file
vi.mock('@/lib/workspace', () => ({
  useWorkspace: vi.fn(() => ({
    directoryHandle: null,
    permissionState: 'granted',
    syncStatus: 'idle',
  })),
}));

// Mock hooks with configurable return values
const mockUseAgentChatWithTools = vi.fn();
vi.mock('../../lib/agent/hooks/use-agent-chat-with-tools', () => ({
  useAgentChatWithTools: (...args: any[]) => mockUseAgentChatWithTools(...args),
}));

// In tests:
beforeEach(() => {
  vi.clearAllMocks();
  mockUseAgentChatWithTools.mockReturnValue(getDefaultHookReturn());
});
```

**localStorage Mock:**
```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
```

**What to Mock:**
- External services (APIs, databases)
- Browser APIs (localStorage, matchMedia, ResizeObserver)
- i18n translations
- Router/navigation
- Dexie/IndexedDB queries
- Side effects (timers, network)

**What NOT to Mock:**
- The component/module under test
- Pure utility functions
- Type definitions
- Store logic when testing store behavior

## Fixtures and Factories

**Test Data:**
```typescript
// Define mock return values as factory functions
const getDefaultHookReturn = () => ({
  messages: [],
  rawMessages: [],
  sendMessage: mockSendMessage,
  isLoading: false,
  error: null,
  toolCalls: [],
  toolsAvailable: false,
  pendingApprovals: [],
});

// Mock projects
const mockProjects = [
  {
    id: 'project-123',
    name: 'Test Project',
    folderPath: '/path/to/project',
    storageType: 'fsa' as const,
    lastOpened: new Date(),
    createdAt: new Date(),
    autoSync: true,
    workspaceBindings: { ide: true },
    tags: [],
  },
];
```

**Location:**
- Inline in test files for simple data
- `e2e/fixtures/` for shared E2E test data
- Factory functions co-located with tests

## Coverage

**Requirements:** Target >80% (currently being built)

**Configuration (vitest.config.ts):**
```typescript
coverage: {
  provider: 'v8',
  enabled: process.env.COVERAGE === 'true',
  reporter: ['text', 'json', 'html'],
  reportsDirectory: './coverage',
  exclude: [
    'node_modules/',
    'src/test/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/mocks/**',
  ],
}
```

**View Coverage:**
```bash
COVERAGE=true pnpm test        # Generate report
# Open coverage/index.html in browser
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, store actions
- Files: `*.test.ts`, `*.test.tsx`
- Environment: `node` or `jsdom` (via `@vitest-environment` comment)
- Focus: Business logic, state transitions, pure functions

**Integration Tests:**
- Scope: Component + store interactions, multi-module flows
- Files: `*.integration.test.ts`
- Examples: `cross-workspace-file-operations.integration.test.ts`

**E2E Tests (Playwright):**
- Scope: Full user journeys across workspaces
- Files: `*.journey.spec.ts`, `*.spec.ts`
- Location: `e2e/journeys/`
- Framework: Page Object Model pattern

**E2E Test Structure:**
```typescript
import { test, expect } from '@playwright/test';
import { IDEPage } from '../pages/IDEPage';

test.describe('IDE Workspace: Critical Path', () => {
  let idePage: IDEPage;

  test.beforeEach(async ({ page }) => {
    idePage = new IDEPage(page);
    await idePage.goto();
  });

  test('IDE-001: Can mount project directory', async ({ page }) => {
    await expect(idePage.mountProjectButton).toBeVisible();
    await idePage.mountProjectButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
```

## Common Patterns

**Async Testing:**
```typescript
it('should load persisted state from localStorage', async () => {
  localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedState));

  const { useSidebarStore } = await import('./sidebar-store');
  const state = useSidebarStore.getState();

  expect(state.isExpanded).toBe(false);
});
```

**Store Testing with Dynamic Imports:**
```typescript
// Required because Zustand stores are singletons
it('should toggle isExpanded', async () => {
  const { useSidebarStore } = await import('./sidebar-store');
  const store = useSidebarStore;

  store.setState({ isExpanded: true });
  store.getState().toggleSidebar();

  expect(store.getState().isExpanded).toBe(false);
});
```

**React Component Testing:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceProvider projectId={mockProjectId}>
    {children}
  </WorkspaceProvider>
);

it('renders correctly with title', () => {
  render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);
  expect(screen.getByText('Agent')).toBeInTheDocument();
});
```

**Error Testing:**
```typescript
it('should use defaults when localStorage has invalid JSON', async () => {
  localStorageMock.getItem.mockReturnValue('invalid-json');

  const { useSidebarStore } = await import('./sidebar-store');
  const state = useSidebarStore.getState();

  expect(state.isExpanded).toBe(DEFAULT_SIDEBAR_STATE.isExpanded);
});
```

**Persistence Testing:**
```typescript
it('should persist toggled state to localStorage', async () => {
  const { useSidebarStore } = await import('./sidebar-store');
  const store = useSidebarStore;

  store.setState({ isExpanded: true });
  store.getState().toggleSidebar();

  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    SIDEBAR_STORAGE_KEY,
    expect.stringContaining('"isExpanded":false')
  );
});
```

## E2E Page Objects

**Pattern:**
```typescript
export class IDEPage {
  readonly page: Page;
  readonly url: string = '/ide';

  // Locators
  readonly fileTree: Locator;
  readonly editor: Locator;
  readonly terminal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileTree = page.locator('[data-testid="file-tree"]');
    this.editor = page.locator('[data-testid="monaco-editor"]');
    this.terminal = page.locator('[data-testid="terminal-panel"]');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await expect(this.fileTree).toBeVisible({ timeout: 10000 });
  }

  async openFile(fileName: string): Promise<void> {
    const fileItem = this.fileTree.getByRole('treeitem', { name: fileName });
    await fileItem.click();
    await expect(this.editor).toBeVisible();
  }
}
```

## Playwright Configuration

**Key Settings (playwright.config.ts):**
```typescript
export default defineConfig({
  testDir: './e2e/journeys',
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'e2e/results/html-report' }],
    ['json', { outputFile: 'e2e/results/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10 * 1000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Vitest Performance Configuration

**Key Settings (vitest.config.ts):**
```typescript
test: {
  environment: 'node',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],

  // Performance
  pool: 'threads',                              // Faster than forks
  maxWorkers: Math.max(4, os.cpus().length - 1),
  isolate: true,
  maxConcurrency: Math.max(8, os.cpus().length * 2),

  // Caching
  cache: { dir: '.vitest-cache' },

  // CI
  bail: process.env.CI ? 3 : 0,

  // Timeouts
  testTimeout: 30000,
  hookTimeout: 30000,

  // File patterns
  include: [
    'src/**/*.{test,spec}.{ts,tsx}',
    'tests/**/*.{test,spec}.{ts,tsx}',
  ],
  exclude: [
    '**/node_modules/**',
    '**/e2e/**',                // E2E uses Playwright
  ],
}
```

## Data-TestId Conventions

**Pattern:** `data-testid="component-element"`

**Examples from codebase:**
- `data-testid="file-tree"`
- `data-testid="monaco-editor"`
- `data-testid="terminal-panel"`
- `data-testid="agent-panel"`
- `data-testid="chat-panel"`
- `data-testid="sync-status"`
- `data-testid="tool-badge-${toolName}"`
- `data-testid="approval-overlay"`

---

*Testing analysis: 2026-01-31*
