# STORY-2025-12-31-002: Agent Referential Integrity - Foreign Key Validation

**Date**: 2025-12-31 23:30:00+07:00
**Priority**: HIGH (Gap 3 - Critical Architecture)
**Epic**: Epic 13 - Agent System Remediation
**Status**: CREATE-STORY (Draft)
**Estimated Time**: 2-3 hours

---

## Story Context

### Problem Statement

**Current Issue**: Agents can be configured with invalid `providerId` and `modelId` combinations, causing runtime errors.

**Example of Invalid Configuration**:
```typescript
// INVALID - providerId exists but modelId belongs to different provider
const agent = {
  name: 'Broken Agent',
  providerId: 'openrouter',        // ✅ Valid provider
  modelId: 'gpt-4',                 // ❌ Invalid - gpt-4 belongs to OpenAI, not OpenRouter
};

// Result: Runtime error "Model not found for provider"
```

**Root Cause**: No validation exists to ensure `modelId` belongs to the specified `providerId`.

**Impact**:
- Users can create agents that fail at runtime
- Poor UX - error discovered during chat, not configuration
- Violates referential integrity principle
- Data inconsistency in agent store

---

### Sprint Change Proposal Alignment

**Relevant Requirements**:

**3.2 Agent Configuration System**:
> "Centralized vault: Single source of truth for all agent configurations"

**3.1 LLM Provider Configuration System**:
> "Model Discovery: Automatic model loading upon successful API key validation"

**Gap Addressed**: Gap 3 - No Referential Integrity (MEDIUM priority)

**Compliance Impact**: +20% Sprint Change Proposal compliance (40% → 60%)

---

## Story Objective

Add domain validation to ensure Agent configurations maintain referential integrity between `providerId` and `modelId`.

### Success Criteria

1. ✅ Cannot create agent with invalid providerId/modelId combination
2. ✅ Cannot update agent to invalid providerId/modelId combination
3. ✅ Validation provides clear, actionable error messages
4. ✅ All existing agents validated on migration
5. ✅ Unit tests for validation logic (95% coverage)
6. ✅ Integration tests for agent creation/update flows

---

## Scope Definition

### IN SCOPE ✅

**Domain Layer**:
- Validation rules for valid providerId/modelId combinations
- Domain service for validation logic
- Error definitions for validation failures

**Application Layer**:
- Use case for agent validation
- Integration with agent creation/update flows
- Migration script for existing agents

**Infrastructure Layer**:
- Provider store integration for model lookup
- Validation utilities

**Presentation Layer**:
- Error message display in AgentConfigDialog
- Validation feedback in agent creation UI
- Toast notifications for validation failures

### OUT OF SCOPE ❌

- Component size compliance (separate story)
- Module reorganization (separate story)
- Event bus integration (separate story)
- Hotload validation system (separate story)

---

## Acceptance Criteria

### AC1: Domain Validation Rules

**Gherkin Syntax**:
```gherkin
Scenario: Validate agent providerId/modelId combination
  Given an agent configuration with providerId "openrouter" and modelId "gpt-4"
  When "gpt-4" does not belong to provider "openrouter"
  Then validation should fail with error "Model gpt-4 is not available for provider openrouter"
  And agent should not be saved

Scenario: Validate agent with valid combination
  Given an agent configuration with providerId "openrouter" and modelId "mistralai/devstral-2512:free"
  When "mistralai/devstral-2512:free" belongs to provider "openrouter"
  Then validation should pass
  And agent should be saved successfully
```

**Technical Specification**:

**Domain Rule**:
```typescript
/**
 * Validates that modelId belongs to the specified providerId
 *
 * @param providerId - The provider ID (e.g., 'openrouter', 'openai')
 * @param modelId - The model ID (e.g., 'mistralai/devstral-2512:free', 'gpt-4')
 * @returns Object with isValid flag and errorMessage if invalid
 */
export function validateAgentProviderModel(
  providerId: string,
  modelId: string,
  availableModels: Record<string, ModelInfo[]>
): ValidationResult {
  // Rule 1: providerId must exist in provider store
  if (!availableModels[providerId]) {
    return {
      isValid: false,
      error: 'validation.provider.unknown',
      message: `Provider "${providerId}" is not configured`
    };
  }

  // Rule 2: modelId must exist in provider's model list
  const providerModels = availableModels[providerId];
  const modelExists = providerModels.some(m => m.id === modelId);

  if (!modelExists) {
    return {
      isValid: false,
      error: 'validation.model.notAvailable',
      message: `Model "${modelId}" is not available for provider "${providerId}"`
    };
  }

  return { isValid: true };
}
```

---

### AC2: Application Layer Use Case

**Use Case: Validate Agent Configuration**

```typescript
/**
 * Application Layer Use Case
 * Orchestrates agent validation with provider store lookup
 */
export class ValidateAgentUseCase {
  constructor(
    private providerStore: ProviderStore,
    private agentStore: AgentStore
  ) {}

  /**
   * Validates agent configuration before save
   *
   * @param agent - Agent configuration to validate
   * @returns ValidationResult with isValid and error details
   */
  execute(agent: Partial<Agent>): ValidationResult {
    // Get available models from provider store (single source of truth)
    const availableModels = this.providerStore.getAvailableModels();

    // Delegate to domain validation logic
    return validateAgentProviderModel(
      agent.providerId,
      agent.modelId,
      availableModels
    );
  }
}
```

---

### AC3: Integration with Agent Creation/Update

**Before Save Hook**:
```typescript
// In agents-store.ts
addAgent: (agentData) => {
  // BEFORE: Direct save
  // const newAgent = { ...agentData };

  // AFTER: Validate first
  const validationResult = validateAgentUseCase.execute(agentData);
  if (!validationResult.isValid) {
    console.error('[AgentsStore] Validation failed:', validationResult.message);
    throw new AgentValidationError(validationResult.message);
  }

  const newAgent = { ...agentData };
  // ... continue with save logic
}
```

**Error Handling**:
```typescript
// In AgentConfigDialog.tsx
const handleSave = useCallback(async () => {
  try {
    // Validate before save
    const validation = validateAgentUseCase.execute(formData);

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    // If validation passes, save agent
    addAgent(formData);
    toast.success('Agent created successfully');
  } catch (error) {
    if (error instanceof AgentValidationError) {
      toast.error(error.message);
    } else {
      toast.error('Failed to create agent');
    }
  }
}, [formData, addAgent]);
```

---

### AC4: Migration Script for Existing Agents

**Migration Strategy**:
```typescript
/**
 * Migration Script: Validate existing agents on app load
 *
 * Runs once on startup to check existing agents for invalid configurations
 */
export async function migrateAgentValidation() {
  const agents = useAgentsStore.getState().agents;
  const providerStore = useProviderStore.getState();
  const validateAgentUseCase = new ValidateAgentUseCase(providerStore, null);

  let invalidCount = 0;

  for (const agent of agents) {
    const validation = validateAgentUseCase.execute(agent);

    if (!validation.isValid) {
      invalidCount++;
      console.warn(`[Migration] Invalid agent found: ${agent.name}`, validation.message);

      // Option 1: Disable agent
      useAgentsStore.getState().updateAgentStatus(agent.id, 'invalid');

      // Option 2: Delete agent (if too broken)
      // useAgentsStore.getState().removeAgent(agent.id);

      // Option 3: Notify user to fix
      toast.error(`Agent "${agent.name}" has invalid configuration: ${validation.message}`);
    }
  }

  if (invalidCount > 0) {
    console.warn(`[Migration] Found ${invalidCount} agents with invalid configurations`);
  }

  return invalidCount;
}
```

---

## Implementation Plan

### Phase 1: Domain Layer (30 minutes)

**Tasks**:
1. Create `src/core/domain/validation/agent-validation.ts`
2. Implement `validateAgentProviderModel()` function
3. Define `ValidationResult` type
4. Create error class `AgentValidationError`

**Files to Create**:
```
src/core/domain/validation/
├── agent-validation.ts
└── types.ts
```

**Acceptance Tests**:
```typescript
describe('validateAgentProviderModel', () => {
  it('should reject invalid providerId', () => {
    const result = validateAgentProviderModel('unknown-provider', 'gpt-4', {});
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('validation.provider.unknown');
  });

  it('should reject modelId from different provider', () => {
    const availableModels = {
      'openrouter': [{ id: 'mistralai/devstral-2512:free' }]
    };

    const result = validateAgentProviderModel('openrouter', 'gpt-4', availableModels);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('validation.model.notAvailable');
  });

  it('should accept valid providerId/modelId combination', () => {
    const availableModels = {
      'openrouter': [{ id: 'mistralai/devstral-2512:free' }]
    };

    const result = validateAgentProviderModel(
      'openrouter',
      'mistralai/devstral-2512:free',
      availableModels
    );

    expect(result.isValid).toBe(true);
  });
});
```

---

### Phase 2: Application Layer (45 minutes)

**Tasks**:
1. Create `src/application/use-cases/ValidateAgentUseCase.ts`
2. Implement use case with provider store integration
3. Add error handling and logging

**Files to Create**:
```
src/application/use-cases/
└── ValidateAgentUseCase.ts
```

**Integration Tests**:
```typescript
describe('ValidateAgentUseCase', () => {
  it('should validate agent against provider store models', () => {
    const mockProviderStore = {
      getAvailableModels: () => ({
        'openrouter': [{ id: 'mistralai/devstral-2512:free' }]
      })
    };

    const useCase = new ValidateAgentUseCase(mockProviderStore, null);

    const result = useCase.execute({
      providerId: 'openrouter',
      modelId: 'mistralai/devstral-2512:free'
    });

    expect(result.isValid).toBe(true);
  });
});
```

---

### Phase 3: Infrastructure Integration (45 minutes)

**Tasks**:
1. Update `agents-store.ts` to validate before save
2. Update `AgentConfigDialog.tsx` to call validation
3. Add migration script to app initialization

**Files to Modify**:
```
src/stores/agents-store.ts (add validation in addAgent/updateAgent)
src/components/agent/AgentConfigDialog.tsx (validate before save)
src/App.tsx or main entry point (run migration script)
```

---

### Phase 4: Presentation Layer (30 minutes)

**Tasks**:
1. Add error message display in AgentConfigDialog
2. Add toast notifications for validation failures
3. Add visual feedback for invalid configurations

**UI Changes**:
```tsx
// In AgentConfigDialog.tsx
{validationError && (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Configuration Error</AlertTitle>
    <AlertDescription>{validationError}</AlertDescription>
  </Alert>
)}
```

---

## Testing Strategy

### Unit Tests (Phase 1-2)

**Coverage Target**: 95%

**Test Suites**:
1. Domain validation logic (agent-validation.test.ts)
2. Use case orchestration (ValidateAgentUseCase.test.ts)

### Integration Tests (Phase 3)

**Test Scenarios**:
1. Agent creation with invalid providerId → Rejected
2. Agent creation with invalid modelId → Rejected
3. Agent creation with valid combination → Accepted
4. Agent update to invalid configuration → Rejected
5. Migration script validates existing agents

**Test Format**:
```typescript
describe('Agent Validation Integration', () => {
  it('should prevent creating agent with invalid providerId/modelId', async () => {
    const { result } = renderHook(() => useAgents(), {
      wrapper: TestProvidersWrapper
    });

    await act(async () => {
      await expect(
        result.current.addAgent({
          name: 'Invalid Agent',
          providerId: 'openrouter',
          modelId: 'gpt-4' // Wrong provider
        })
      ).rejects.toThrow('Model gpt-4 is not available for provider openrouter');
    });
  });
});
```

### Manual Testing (Phase 4)

**Test Cases**:
1. Try to create agent with `providerId: "openrouter"` and `modelId: "gpt-4"`
   - Expected: Error message displayed
   - Expected: Agent NOT created

2. Try to create agent with `providerId: "openrouter"` and `modelId: "mistralai/devstral-2512:free"`
   - Expected: No errors
   - Expected: Agent created successfully

3. Update existing agent to invalid modelId
   - Expected: Update rejected
   - Expected: Error message shown

---

## Migration Plan

### Existing Data Migration

**Strategy**: Validate on app load, disable invalid agents

**Steps**:
1. App starts → Run `migrateAgentValidation()`
2. Scan all existing agents in store
3. For each invalid agent:
   - Log warning with agent name and validation error
   - Set agent status to 'invalid'
   - Show toast notification to user
4. User must fix or delete invalid agents

**Fallback**: If agent is critically broken, delete it

---

## Dependencies

**Prerequisites**:
- ✅ Provider store with `getAvailableModels()` method (already exists)
- ✅ Agent store with agent CRUD operations (already exists)
- ✅ AgentConfigDialog component (already exists)

**Blocked By**: None

**Blocks**:
- STORY-2025-12-31-003 (Agent Configuration Events) - can be parallel
- STORY-2025-12-31-004 (Application Layer) - should precede

---

## Success Metrics

### Quantitative

- ✅ 95% test coverage for validation logic
- ✅ 0 invalid agents can be created in UI
- ✅ 100% of existing agents validated on migration
- ✅ < 100ms validation execution time

### Qualitative

- ✅ Clear, actionable error messages
- ✅ Validation feedback visible before save
- ✅ No runtime errors from invalid configurations
- ✅ User can understand and fix validation errors

---

## Risk Assessment

### Low Risk ✅

- **Scope Limited**: Only validation, no architectural changes
- **Non-Breaking**: Adds validation, doesn't remove functionality
- **Rollback Safe**: Can be disabled if issues arise

### Mitigation Strategies

1. **Graceful Degradation**: If validation fails, log warning but allow save
2. **Migration Notification**: Show clear messages for invalid existing agents
3. **User Override**: Add "force save" option for advanced users (if needed)

---

## Definition of Done

- [x] Story document created with acceptance criteria
- [ ] Story validated against Sprint Change Proposal
- [ ] Story context created (file mappings, dependencies)
- [ ] Story context validated as comprehensive
- [ ] Implementation TDD cycle completed
- [ ] Code review approved
- [ ] All tests passing (30/30 + new tests)
- [ ] Zero TypeScript errors
- [ ] Migration script tested
- [ ] Manual testing completed
- [ ] Loop completion documented

---

## Out of Scope Items

**Explicitly NOT in this story** (deferred to separate stories):

- ❌ Component size compliance (AgentChatPanelRefactored 320 lines → ≤120)
- ❌ Module reorganization (clean architecture layers)
- ❌ Event bus for configuration events (agent:selected, agent:config:updated)
- ❌ Application Layer creation (useAgentSelectionUseCase)
- ❌ Hotload validation system (real-time validation on config change)

**Rationale**: Each gap requires its own story with proper BMAD cycle per user directive.

---

## Next Steps

### Immediate: VALIDATION Phase

**Action**: Validate this story against Sprint Change Proposal requirements

**Validation Checklist**:
- [ ] Scope is bounded to validation only (no architectural refactoring)
- [ ] Acceptance criteria are measurable and testable
- [ ] Implementation plan is realistic (2-3 hours)
- [ ] Dependencies are correctly identified
- [ ] Migration strategy is safe
- [ ] Rollback plan is defined

**If Validation Fails**: Create course correction document

**If Validation Passes**: Proceed to CREATE-STORY-CONTEXT phase

---

## Story Status

**Current Phase**: CREATE-STORY (Draft)
**Created**: 2025-12-31 23:30:00+07:00
**Author**: BMAD Master (bmad-core-bmad-master mode)
**Next Action**: VALIDATE against Sprint Change Proposal

---

**Signature**: _bmad-core-bmad-master_
