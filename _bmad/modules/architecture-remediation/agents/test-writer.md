# Test Writer Agent

**Agent ID**: `@bmad/modules/architecture-remediation/agents/test-writer`
**Version**: 1.0.0
**Created**: 2026-01-03
**Specialization**: Test Coverage Improvement and Quality Assurance

## Agent Overview

Specialized BMAD agent for systematic improvement of test coverage from 16.6% to ≥80% through strategic test writing for critical paths, business logic, and integration boundaries.

### Agent Purpose

Achieve ≥80% test coverage by writing comprehensive unit tests for business logic, integration tests for cross-boundary operations, and E2E tests for critical user journeys.

### Agent Capabilities

1. **Coverage Analysis**
   - Identify untested critical paths
   - Calculate current coverage metrics
   - Prioritize testing by risk (P0: data loss, P1: user-facing)
   - Map test gaps by module

2. **Test Writing**
   - Write unit tests for business logic (fast, isolated)
   - Write integration tests for cross-boundary operations (store + component)
   - Write E2E tests for critical user journeys (Playwright)
   - Achieve ≥80% coverage target

3. **Test Quality**
   - Follow testing best practices (AAA pattern, descriptive names)
   - Mock external dependencies (WebContainer, AI providers)
   - Test edge cases and error states
   - Ensure tests are maintainable and reliable

4. **Validation**
   - Run test suite (100% pass rate)
   - Measure coverage with `pnpm test -- --coverage`
   - Validate no regression (existing tests still pass)
   - Update coverage metrics

## Agent Workflow

### Phase 1: Coverage Analysis (2-3 hours)

**Input**: Current coverage metrics (16.6%)
**Output**: Coverage gap analysis with testing priorities

```bash
# Analyze coverage
@bmad/modules/architecture-remediation/agents/test-writer:analyze-coverage
current_coverage: 16.6
target_coverage: 80
output: "_bmad-output/test-analysis/coverage-gap-analysis-{timestamp}.md"
```

**Coverage Analysis Checklist**:
- [ ] Run `pnpm test -- --coverage` to get baseline
- [ ] Identify untested modules (0% coverage)
- [ ] Identify low-coverage modules (<50%)
- [ ] Map critical paths without tests
- [ ] Prioritize by risk (P0: data loss, P1: user-facing)
- [ ] Estimate test writing effort

**Coverage Analysis Report Template**:
```markdown
# Test Coverage Gap Analysis

## Current Metrics
- **Overall Coverage**: {current_coverage}% ({lines}% lines, {functions}% functions, {branches}% branches, {statements}% statements)
- **Target**: ≥80%
- **Gap**: {target_coverage - current_coverage}% ({estimated_tests} tests needed)

## Module Breakdown

### P0: Critical Infrastructure (0% coverage - HIGH RISK)
1. **IndexedDB Operations** (`src/lib/workspace/project-store.ts`)
   - **Risk**: Data loss, quota exceeded
   - **Priority**: P0 - CRITICAL
   - **Estimated Tests**: {num_tests} tests (8-10 hours)
   - **Test Types**: Unit (CRUD operations), Integration (quota handling)

2. **Agent Store** (`src/lib/state/agents-store.ts`)
   - **Risk**: State corruption, circular dependencies
   - **Priority**: P0 - CRITICAL
   - **Estimated Tests**: {num_tests} tests (6-8 hours)
   - **Test Types**: Unit (state updates, actions), Integration (consumer components)

### P1: User-Facing Features (<30% coverage)
1. **RAG Indexing** (`src/lib/rag/`)
   - **Risk**: Broken search, incorrect embeddings
   - **Priority**: P1 - HIGH
   - **Estimated Tests**: {num_tests} tests (12-15 hours)
   - **Test Types**: Unit (chunking, embedding), Integration (full pipeline)

2. **Agent Chat** (`src/lib/agent/`)
   - **Risk**: Broken tool execution, incorrect responses
   - **Priority**: P1 - HIGH
   - **Estimated Tests**: {num_tests} tests (10-12 hours)
   - **Test Types**: Unit (tool execution), Integration (agent + store)

### P2: Business Logic (<50% coverage)
1. **Knowledge Graph** (`src/lib/knowledge/`)
   - **Risk**: Graph corruption, incorrect traversal
   - **Priority**: P2 - MEDIUM
   - **Estimated Tests**: {num_tests} tests (8-10 hours)

2. **Flashcard Generation** (`src/lib/study/`)
   - **Risk**: Incorrect SRS scheduling
   - **Priority**: P2 - MEDIUM
   - **Estimated Tests**: {num_tests} tests (6-8 hours)

## Testing Priorities

### Phase 1: P0 Critical Infrastructure (20-25 hours)
1. IndexedDB operations (8-10 hours)
2. Agent store (6-8 hours)
3. Provider store (6-7 hours)

### Phase 2: P1 User-Facing Features (25-30 hours)
1. RAG indexing (12-15 hours)
2. Agent chat (10-12 hours)
3. File sync operations (3-4 hours)

### Phase 3: P2 Business Logic (20-25 hours)
1. Knowledge graph (8-10 hours)
2. Flashcard generation (6-8 hours)
3. Quiz generation (6-7 hours)

## Estimated Timeline
- **Phase 1** (P0): 20-25 hours → {coverage1}% coverage
- **Phase 2** (P1): 25-30 hours → {coverage2}% coverage
- **Phase 3** (P2): 20-25 hours → {final_coverage}% coverage (≥80%)
- **Total**: 65-80 hours → 16.6% → ≥80% coverage

## Success Criteria
- ✅ Overall coverage ≥80%
- ✅ All P0 modules ≥80% coverage
- ✅ All P1 modules ≥70% coverage
- ✅ Test pass rate 100%
- ✅ Zero flaky tests
```

### Phase 2: Unit Test Writing (4-6 hours per module)

**Input**: Untested module file
**Output**: Unit test file with ≥80% coverage

```bash
# Write unit tests
@bmad/modules/architecture-remediation/agents/test-writer:write-unit-tests
module_path: "src/lib/agent/providers/credential-vault.ts"
output: "src/lib/agent/providers/__tests__/credential-vault.test.ts"
target_coverage: 80
```

**Unit Test Template**:
```typescript
// File: src/lib/agent/providers/__tests__/credential-vault.test.ts
// Target: ≥80% coverage

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CredentialVault } from '../credential-vault';

describe('CredentialVault', () => {
  let vault: CredentialVault;

  beforeEach(() => {
    // Reset vault before each test
    vault = new CredentialVault();
  });

  describe('setCredential', () => {
    it('should store credential successfully', async () => {
      // Arrange
      const providerId = 'openai';
      const apiKey = 'sk-test-key';

      // Act
      await vault.setCredential(providerId, apiKey);

      // Assert
      const retrieved = await vault.getCredential(providerId);
      expect(retrieved).toBe(apiKey);
    });

    it('should overwrite existing credential', async () => {
      // Arrange
      const providerId = 'openai';
      await vault.setCredential(providerId, 'old-key');

      // Act
      await vault.setCredential(providerId, 'new-key');

      // Assert
      const retrieved = await vault.getCredential(providerId);
      expect(retrieved).toBe('new-key');
    });

    it('should encrypt credential before storage', async () => {
      // Arrange
      const providerId = 'openai';
      const apiKey = 'sk-test-key';

      // Act
      await vault.setCredential(providerId, apiKey);

      // Assert
      const storage = await vault.getStorage();
      const stored = storage[providerId];
      expect(stored).not.toBe(apiKey); // Should be encrypted
      expect(stored).toMatch(/^encrypted:/); // Encryption prefix
    });

    it('should throw error if providerId is empty', async () => {
      // Arrange
      const providerId = '';
      const apiKey = 'sk-test-key';

      // Act & Assert
      await expect(
        vault.setCredential(providerId, apiKey)
      ).rejects.toThrow('Provider ID is required');
    });
  });

  describe('getCredential', () => {
    it('should return null if credential not found', async () => {
      // Act
      const credential = await vault.getCredential('nonexistent');

      // Assert
      expect(credential).toBeNull();
    });

    it('should decrypt credential after retrieval', async () => {
      // Arrange
      const providerId = 'openai';
      const apiKey = 'sk-test-key';
      await vault.setCredential(providerId, apiKey);

      // Act
      const retrieved = await vault.getCredential(providerId);

      // Assert
      expect(retrieved).toBe(apiKey); // Should be decrypted
    });
  });

  describe('removeCredential', () => {
    it('should remove credential successfully', async () => {
      // Arrange
      const providerId = 'openai';
      await vault.setCredential(providerId, 'sk-test-key');

      // Act
      await vault.removeCredential(providerId);

      // Assert
      const credential = await vault.getCredential(providerId);
      expect(credential).toBeNull();
    });

    it('should not throw if credential does not exist', async () => {
      // Act & Assert
      await expect(
        vault.removeCredential('nonexistent')
      ).resolves.not.toThrow();
    });
  });
});
```

**Unit Test Checklist**:
- [ ] Test file created (adjacent to source file in `__tests__` directory)
- [ ] Test file name: `{filename}.test.ts`
- [ ] AAA pattern (Arrange, Act, Assert)
- [ ] Descriptive test names (`should {expected behavior} when {state}`)
- [ ] Test happy path (success cases)
- [ ] Test edge cases (empty, null, undefined)
- [ ] Test error states (invalid inputs, network failures)
- [ ] Mock external dependencies (WebContainer, IndexedDB, AI providers)
- [ ] Coverage ≥80% (validate with `pnpm test -- --coverage`)
- [ ] Tests pass (100% pass rate)

### Phase 3: Integration Test Writing (6-8 hours per feature)

**Input**: Feature with multiple modules (store + component)
**Output**: Integration test file with cross-boundary coverage

```bash
# Write integration tests
@bmad/modules/architecture-remediation/agents/test-writer:write-integration-tests
feature_path: "src/presentation/components/agent/AgentConfigDialog.tsx"
output: "src/presentation/components/agent/__tests__/AgentConfigDialog.integration.test.tsx"
target_coverage: 75
```

**Integration Test Template**:
```typescript
// File: src/presentation/components/agent/__tests__/AgentConfigDialog.integration.test.tsx
// Target: ≥75% coverage

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentConfigDialog } from '../AgentConfigDialog';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';

// Mock external dependencies
vi.mock('@/lib/agent/providers/credential-vault');
vi.mock('@tanstack/ai', () => ({
  useChat: () => ({
    messages: [],
    sendMessage: vi.fn(),
  }),
}));

describe('AgentConfigDialog Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useAgentsStore.setState({ agents: [] });
  });

  describe('Agent Creation Workflow', () => {
    it('should create new agent and update store', async () => {
      // Arrange
      render(<AgentConfigDialog open />);
      const agentName = 'Test Agent';

      // Act: Fill form
      fireEvent.change(screen.getByLabelText(/agent name/i), {
        target: { value: agentName },
      });

      // Act: Submit form
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      // Assert: Agent added to store
      await waitFor(() => {
        const agents = useAgentsStore.getState().agents;
        expect(agents).toHaveLength(1);
        expect(agents[0].name).toBe(agentName);
      });
    });

    it('should validate provider credentials before creating agent', async () => {
      // Arrange
      const mockCredentialVault = vi.mocked(require('@/lib/agent/providers/credential-vault').CredentialVault);
      mockCredentialVault.prototype.getCredential.mockResolvedValue(null); // No credential

      render(<AgentConfigDialog open />);

      // Act: Try to create agent without credential
      fireEvent.change(screen.getByLabelText(/agent name/i), {
        target: { value: 'Test Agent' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      // Assert: Error message shown
      await waitFor(() => {
        expect(screen.getByText(/provider credential required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Agent Update Workflow', () => {
    it('should update existing agent and persist to store', async () => {
      // Arrange: Create agent in store
      const agent = { id: 'agent-1', name: 'Old Name' };
      useAgentsStore.setState({ agents: [agent] });

      render(<AgentConfigDialog open agentId={agent.id} />);

      // Act: Update agent name
      const nameInput = screen.getByLabelText(/agent name/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      // Assert: Store updated
      await waitFor(() => {
        const updatedAgent = useAgentsStore.getState().agents.find(a => a.id === agent.id);
        expect(updatedAgent?.name).toBe('New Name');
      });
    });
  });

  describe('Cross-Workspace Binding', () => {
    it('should bind agent to multiple workspaces', async () => {
      // Arrange
      render(<AgentConfigDialog open />);

      // Act: Enable workspaces
      fireEvent.click(screen.getByLabelText(/ide workspace/i));
      fireEvent.click(screen.getByLabelText(/knowledge workspace/i));

      // Act: Create agent
      fireEvent.change(screen.getByLabelText(/agent name/i), {
        target: { value: 'Multi-Workspace Agent' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      // Assert: Agent bound to workspaces
      await waitFor(() => {
        const agent = useAgentsStore.getState().agents[0];
        expect(agent.workspaceBindings).toEqual(['ide', 'knowledge']);
      });
    });
  });
});
```

**Integration Test Checklist**:
- [ ] Test file created in `__tests__` directory
- [ ] Mock external dependencies (WebContainer, IndexedDB, AI providers)
- [ ] Test cross-boundary operations (store + component)
- [ ] Test user workflows (create, update, delete)
- [ ] Test state persistence (store updates persist across components)
- [ ] Coverage ≥75% (validate with `pnpm test -- --coverage`)
- [ ] Tests pass (100% pass rate)

### Phase 4: Coverage Validation (1-2 hours)

**Input**: Test files
**Output**: Coverage report + validation metrics

```bash
# Validate coverage
@bmad/modules/architecture-remediation/agents/test-writer:validate-coverage
test_files: "{list_of_files}"
output: "_bmad-output/test-validation/coverage-validation-{timestamp}.md"
```

**Validation Commands**:
```bash
# Run tests with coverage
pnpm test -- --coverage

# Expected output:
# % Coverage report:
# -----------------|
# File                    | % Stmts | % Branch | % Funcs | % Lines |
# -----------------|---------|----------|---------|---------|
# All files               |    82.5 |     78.3 |    85.1 |    82.1 |
#  credential-vault       |    95.2 |     92.1 |    96.5 |    95.1 |
#  agent-config-dialog    |    78.3 |     72.5 |    81.2 |    78.1 |
# -----------------|---------|----------|---------|---------|
```

**Validation Report Template**:
```markdown
# Test Coverage Validation

## Session Summary
- **Modules Tested**: {num_modules}
- **Tests Written**: {num_tests} tests
- **Time Taken**: {duration}
- **Files Modified**: {num_files}

## Coverage Results

### Overall Coverage
- **Before**: {old_coverage}% ({lines}% lines, {functions}% functions, {branches}% branches)
- **After**: {new_coverage}% ({lines}% lines, {functions}% functions, {branches}% branches)
- **Improvement**: {improvement}%
- **Target Met**: {target_met} (≥80%)

### Module Breakdown
1. **{module_name}**
   - Coverage: {coverage}% ✅ (≥80)
   - Tests: {num_tests} tests
   - Status: {PASSED / FAILED}

2. **{module_name}**
   - Coverage: {coverage}% ❌ (<80)
   - Gap: {80 - coverage}% coverage missing
   - Status: NEEDS_MORE_TESTS

## Test Quality

### Pass Rate
- **Tests Run**: {total_tests}
- **Tests Passed**: {passed_tests}
- **Tests Failed**: {failed_tests}
- **Pass Rate**: {pass_rate}% (target: 100%)

### Test Reliability
- **Flaky Tests**: {num_flaky} tests
- **Timeout Errors**: {num_timeouts} tests
- **Mock Failures**: {num_mock_failures} tests

## Regression Check
- ✅ All existing tests still passing
- ✅ Zero new test failures
- ✅ Coverage improved by ≥5%

## Next Actions
1. Retest low-coverage modules: {list_of_modules}
2. Add edge case tests: {list_of_cases}
3. Improve mock accuracy: {list_of_mocks}

## Recommendation
{COVERAGE_TARGET_MET | COVERAGE_TARGET_NOT_MET} - {reason}
```

## Agent Quality Standards

### Test Quality

1. **AAA Pattern**
   - ✅ Arrange (set up test data, mocks, dependencies)
   - ✅ Act (execute the function/method being tested)
   - ✅ Assert (verify expected behavior)

2. **Descriptive Test Names**
   - ✅ Format: `should {expected behavior} when {state}`
   - ✅ Examples:
     - `should store credential successfully`
     - `should throw error when providerId is empty`
     - `should update agent name in store when form is submitted`

3. **Test Isolation**
   - ✅ Each test is independent (no shared state)
   - ✅ Tests run in any order
   - ✅ Cleanup after each test (`beforeEach`, `afterEach`)

4. **Mocking Best Practices**
   - ✅ Mock external dependencies (WebContainer, IndexedDB, AI providers)
   - ✅ Mock interfaces, not implementations
   - ✅ Verify mock calls when necessary (spy on critical functions)

### Coverage Standards

1. **Coverage Targets**
   - ✅ Overall coverage: ≥80%
   - ✅ Critical infrastructure (P0): ≥90%
   - ✅ User-facing features (P1): ≥75%
   - ✅ Business logic (P2): ≥70%

2. **Test Types**
   - ✅ Unit tests: Business logic, utilities, hooks (fast, isolated)
   - ✅ Integration tests: Cross-boundary operations (store + component)
   - ✅ E2E tests: Critical user journeys (slow, realistic)

3. **Coverage Gaps**
   - ✅ Identify untested code paths
   - ✅ Prioritize by risk (P0 > P1 > P2)
   - ✅ Fill gaps systematically

## Agent Tools & Techniques

### Coverage Tools

1. **Vitest Coverage**
```bash
# Run tests with coverage
pnpm test -- --coverage

# Generate HTML coverage report
pnpm test -- --coverage --reporter=html

# Open coverage report
open coverage/index.html
```

2. **Coverage Thresholds**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
});
```

### Testing Techniques

1. **Unit Test Patterns**
```typescript
// Pattern 1: Pure function testing
describe('calculateTotal', () => {
  it('should sum all items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ];
    const total = calculateTotal(items);
    expect(total).toBe(25);
  });
});

// Pattern 2: State mutation testing
describe('useAgentFormState', () => {
  it('should update form field', () => {
    const { result } = renderHook(() => useAgentFormState());
    act(() => {
      result.current.setFieldValue('name', 'Test Agent');
    });
    expect(result.current.formData.name).toBe('Test Agent');
  });
});

// Pattern 3: Error handling testing
describe('CredentialVault', () => {
  it('should throw error when providerId is empty', async () => {
    const vault = new CredentialVault();
    await expect(
      vault.setCredential('', 'sk-key')
    ).rejects.toThrow('Provider ID is required');
  });
});
```

2. **Integration Test Patterns**
```typescript
// Pattern 1: Store + Component integration
describe('AgentConfigDialog Integration', () => {
  it('should update store when agent is created', async () => {
    render(<AgentConfigDialog open />);
    fireEvent.change(screen.getByLabelText(/agent name/i), {
      target: { value: 'Test Agent' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => {
      const agents = useAgentsStore.getState().agents;
      expect(agents).toHaveLength(1);
    });
  });
});

// Pattern 2: Hook + Component integration
describe('useAgentChat Integration', () => {
  it('should send message and update conversation', async () => {
    const { result } = renderHook(() => useAgentChat());
    act(() => {
      result.current.sendMessage('Hello');
    });
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello');
    });
  });
});
```

## Agent Success Criteria

### Quantitative Metrics

- ✅ Overall coverage: ≥80%
- ✅ P0 modules: ≥90% coverage
- ✅ P1 modules: ≥75% coverage
- ✅ Test pass rate: 100%
- ✅ Flaky tests: 0

### Qualitative Metrics

- ✅ Tests follow AAA pattern
- ✅ Descriptive test names
- ✅ Tests are isolated and independent
- ✅ Mocks are accurate and minimal
- ✅ Tests document expected behavior

## Related Artifacts

### Reference Documentation
- `CLAUDE.md` (Testing structure, patterns, guidelines)
- `vitest.config.ts` (Test configuration, coverage thresholds)

### Previous Sessions
- `_bmad-output/ralph-loop-cycle-12-iteration-17-completion-2026-01-01.md` (Vitest import fixes)

### Research Documents
- `agents/test-writer-research.md` (Testing patterns, Vitest best practices)

---

**Agent Owner**: @bmad-bmm-tea
**Agent Maintainer**: @bmad-bmm-dev
**Last Updated**: 2026-01-03
**Agent Status**: ACTIVE - READY FOR TEST WRITING
