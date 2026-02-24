# E2E Testing Documentation

## Overview

This directory contains comprehensive end-to-end (E2E) tests for Project Alpha using Playwright. The test suite covers all four workspaces (IDE, Notes, Knowledge, Study) with cross-workspace integration tests.

## Test Architecture

### Page Object Models (POM)

Page Object Models provide a clean abstraction layer for interacting with workspace UIs:

- **`IDEPage.ts`** - IDE workspace operations (file tree, editor, terminal, agents)
- **`NotesPage.ts`** - Notes workspace operations (note CRUD, AI generation, sync)
- **`KnowledgePage.ts`** - Knowledge workspace operations (indexing, search, RAG chat)
- **`StudyPage.ts`** - Study workspace operations (quizzes, flashcards, sessions)

### Test Suites

#### Journey Tests (Critical Paths)

1. **`sanity.journey.spec.ts`** - Basic framework verification
2. **`ide-workspace.journey.spec.ts`** - IDE workspace critical paths
3. **`notes-workspace.journey.spec.ts`** - Notes workspace critical paths
4. **`knowledge-workspace.journey.spec.ts`** - Knowledge workspace critical paths
5. **`study-workspace.journey.spec.ts`** - Study workspace critical paths
6. **`cross-workspace-integration.journey.spec.ts`** - Cross-workspace workflows
7. **`file-sync.journey.spec.ts`** - File synchronization (with FSA mocks)
8. **`cross-workspace-agent.journey.spec.ts`** - Agent integration across workspaces
9. **`api-key-management.journey.spec.ts`** - API key configuration flows

### Fixtures & Utilities

- **`mock-fsa.fixture.ts`** - Mock File System Access API for testing file operations
- **`test-assertions.ts`** - Custom assertion helpers (toast, sync status, agent selection)
- **`test-project.fixture.ts`** - Test project structure and data

## Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Ensure dev server can start
pnpm dev  # Starts on http://localhost:3000
```

### Run All Tests

```bash
# Run all E2E tests (across all browsers)
pnpm exec playwright test

# Run with UI (helps debug)
pnpm exec playwright test --ui

# Run with headed mode (see browser)
pnpm exec playwright test --headed
```

### Run Specific Test Files

```bash
# Test only IDE workspace
pnpm exec playwright test ide-workspace.journey.spec.ts

# Test only Notes workspace
pnpm exec playwright test notes-workspace.journey.spec.ts

# Test cross-workspace integration
pnpm exec playwright test cross-workspace-integration.journey.spec.ts
```

### Run on Specific Browser

```bash
# Chromium (default)
pnpm exec playwright test --project=chromium

# Firefox
pnpm exec playwright test --project=firefox

# WebKit (Safari)
pnpm exec playwright test --project=webkit

# Mobile Chrome
pnpm exec playwright test --project=mobile-chrome

# Mobile Safari
pnpm exec playwright test --project=mobile-safari
```

### Run Specific Tests

```bash
# Run tests matching pattern
pnpm exec playwright test --grep "IDE-001"

# Run tests in a specific file
pnpm exec playwright test ide-workspace.journey.spec.ts:42

# Run tests with specific title
pnpm exec playwright test --grep "Can create new file"
```

### Debug Tests

```bash
# Run with Playwright Inspector (step through tests)
pnpm exec playwright test --debug

# Run with UI mode (visual test runner)
pnpm exec playwright test --ui

# Run single test with verbose output
DEBUG=pw:api pnpm exec playwright test ide-workspace.journey.spec.ts
```

## Test Results

### View Test Reports

```bash
# Open HTML report
pnpm exec playwright show-report

# Report location
open e2e/results/html-report/index.html
```

### Test Artifacts

After test run, artifacts are saved to `e2e/results/test-artifacts/`:

- **Screenshots** - Captured on test failure
- **Videos** - Recorded on test retry
- **Traces** - Detailed execution timeline (on retry)
- **Error Context** - Markdown files with error details

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { IDEPage } from '../pages/IDEPage';

test.describe('Feature Name', () => {
    let idePage: IDEPage;

    test.beforeEach(async ({ page }) => {
        idePage = new IDEPage(page);
        await idePage.goto();
    });

    test('TEST-ID: Description', async ({ page }) => {
        // Arrange
        const fileName = 'test.md';

        // Act
        await idePage.createNewFile(fileName);

        // Assert
        await idePage.assertFileExists(fileName);
    });
});
```

### Best Practices

1. **Use Page Object Models** - Don't interact with page directly, use POM methods
2. **Descriptive Test IDs** - Use format `WORKSPACE-CATEGORY-NUMBER` (e.g., `IDE-001`)
3. **Skip Unimplemented Tests** - Use `test.skip(true, 'reason')` for placeholders
4. **Wait for Load States** - Use `waitForLoad()`, `waitForLoadState('networkidle')`
5. **Clear Test Data** - Clean up created files, notes, etc. in `afterEach`
6. **Avoid Flakiness** - Use explicit waits, avoid hard-coded delays

### Test Data

Use fixtures for test data:

```typescript
// From mock-fsa.fixture.ts
import { createTestMarkdownFiles } from '../fixtures/mock-fsa.fixture';

const testFiles = createTestMarkdownFiles(5);
```

## Test Coverage Goals

### Critical Workflows (100% Coverage Required)

- ✅ **IDE**: Mount project → Edit file → Sync to filesystem
- ✅ **Notes**: Mount folder → Create note → Edit → Save
- ✅ **Knowledge**: Mount project → Index → Search → Chat
- ✅ **Study**: Generate quiz → Answer questions → View results

### Cross-Workspace Integration (100% Coverage Required)

- ✅ File sync: IDE ↔ Notes ↔ Knowledge
- ✅ Agent context sharing across workspaces
- ✅ Workspace switching performance
- ✅ State persistence (open files, chat history)

### Edge Cases (90% Coverage Target)

- Large file handling (100+ files, 100KB+ content)
- Error recovery (permission denied, sync failures)
- Mobile responsive design
- Network latency handling

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests
        run: pnpm exec playwright test
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: e2e/results/html-report/
```

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

**Problem**: Tests timeout after 30s default

**Solutions**:
- Increase timeout for specific tests: `test.setTimeout(60000)`
- Check for slow operations (indexing, AI generation)
- Verify dev server is running and responsive

#### 2. Flaky Tests

**Problem**: Tests pass sometimes, fail sometimes

**Solutions**:
- Add explicit waits instead of hard-coded delays
- Use `waitForLoadState('networkidle')` before assertions
- Check for race conditions in async operations
- Increase retry count in `playwright.config.ts`

#### 3. FSA Mock Not Working

**Problem**: File System Access API mock not injected

**Solutions**:
- Verify `mock-fsa.fixture.ts` is properly imported
- Check `addInitScript` is called before navigation
- Ensure mock overrides `window.showDirectoryPicker`

#### 4. Agent Tests Failing

**Problem**: Agent chat or tool execution fails

**Solutions**:
- Verify API keys are configured (use test keys)
- Check agent is available in workspace
- Ensure tool permissions are granted
- Mock LLM responses for faster tests

### Debug Commands

```bash
# Run with verbose logging
DEBUG=pw:* pnpm exec playwright test

# Run single test with trace
pnpm exec playwright test --trace on

# Keep test server running after tests
pnpm exec playwright test --no-deps
```

## Test Maintenance

### Regular Tasks

1. **Weekly**:
   - Review failed tests in CI
   - Update test data fixtures
   - Check for flaky tests

2. **Per Release**:
   - Update test IDs for new features
   - Add tests for new functionality
   - Remove obsolete tests
   - Update documentation

3. **Per Quarter**:
   - Review test coverage metrics
   - Optimize slow tests
   - Update Playwright version
   - Refactor Page Object Models

### Performance Benchmarks

Target execution times:

- **Sanity tests**: < 30 seconds
- **Single workspace suite**: < 5 minutes
- **Full test suite**: < 20 minutes (parallel execution)
- **Cross-workspace integration**: < 10 minutes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Retries](https://playwright.dev/docs/test-retries)
- [CI Integration](https://playwright.dev/docs/ci)

## Contributing

When adding new tests:

1. Create test ID following convention: `WORKSPACE-CATEGORY-NUMBER`
2. Add to appropriate test suite file
3. Update this README with new test description
4. Run tests locally before committing
5. Ensure CI passes

### Example Test Addition

```typescript
/**
 * NEW-FEATURE-001: Can do new thing
 */
test('NEW-FEATURE-001: Can do new thing', async () => {
    // Arrange
    const input = 'test';

    // Act
    await pageComponent.performAction(input);

    // Assert
    await expect(result).toContainText(input);
});
```

## Test Metrics Dashboard

Track these metrics:

- **Pass Rate**: Target > 95%
- **Flaky Test Rate**: Target < 5%
- **Average Execution Time**: Target < 20 minutes (full suite)
- **Test Coverage**: Target 100% critical paths, 90% edge cases
- **Maintenance Burden**: Target < 2 hours/week

---

**Last Updated**: 2026-01-07
**Maintainer**: E2E Test Architect
**Status**: ✅ Active
