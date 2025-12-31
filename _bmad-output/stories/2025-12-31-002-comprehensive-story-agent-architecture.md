# STORY-2025-12-31-002-COMPLETE: Agent Configuration System - Complete Architecture Remediation

**Date**: 2025-12-31 23:59:45+07:00
**Priority**: CRITICAL (Epic 13 - Agent System Foundation)
**Status**: CREATE-STORY (Draft - Comprehensive Scope)
**Previous Attempt**: STORY-2025-12-31-002 (validation only - SUPERFICIAL)

---

## Course Correction Rationale

**Why This Story Exists**:

Previous approach (STORY-2025-12-31-002) was **superficial**:
- ✅ Would fix validation bug
- ❌ Would NOT establish Layer Architecture
- ❌ Would NOT create repository pattern
- ❌ Would NOT follow Clean Architecture principles
- ❌ Would NOT meet Sprint Change Proposal requirements

**User Directive** (5th time):
> "Move beyond superficial story completion by conducting deep cross-architectural analysis"
> "NOT ATTEMPT if not fully 1000% sure of what features, components, and dependencies are involved"
> "All remediation and stories to consolidate architecture addressed while legacy is either refactored or removed"

**Realization**: I cannot fix validation WITHOUT establishing proper architecture. Doing so would create MORE technical debt.

---

## Problem Statement

### Current State (BROKEN ARCHITECTURE)

**Issue 1: No Layer Boundaries**
```typescript
// Presentation Layer calling Infrastructure directly
AgentConfigDialog.tsx (551 lines) → agents-store.ts → localStorage
// No Application Layer
// No Domain Layer
// No Repository pattern
```

**Issue 2: No Validation**
```typescript
// Can create invalid agent
addAgent({
    providerId: 'openrouter',
    modelId: 'gpt-4'  // ❌ WRONG - gpt-4 belongs to OpenAI
})
// No validation → Runtime error
```

**Issue 3: Component Size Violations**
```typescript
AgentConfigDialog.tsx: 551 lines  // ❌ Violates 120-line limit
AgentChatPanelRefactored.tsx: 320 lines  // ❌ Violates 120-line limit
```

**Issue 4: No Repository Pattern**
```typescript
// Stores directly access localStorage
agents-store.ts → localStorage
// No abstraction
// No testability
// No domain entities
```

**Issue 5: Violates Sprint Change Proposal**
```markdown
Section 2.1: Layer Architecture ❌ NOT IMPLEMENTED
Section 3.2: Agent Configuration System ❌ NOT CENTRALIZED
Section 7.2: Module Structure ❌ NOT FOLLOWED
Section 7.1: Component Limits ❌ VIOLATED
```

---

## Story Objective

**Establish Clean Architecture for Agent Configuration System** with:
- Layer boundaries (Domain, Application, Infrastructure, Presentation)
- Repository pattern for data access
- Validation for providerId/modelId integrity
- Component size compliance (≤120 lines)
- Full Sprint Change Proposal compliance

---

## Success Criteria

### Functional Requirements
1. ✅ Cannot create agent with invalid providerId/modelId combination
2. ✅ Agent configuration changes hotload immediately (no restart)
3. ✅ All agents properly wired to tools and workspaces
4. ✅ Cross-workspace agent availability working

### Architectural Requirements
5. ✅ Layer boundaries established (Domain, Application, Infrastructure, Presentation)
6. ✅ Repository pattern implemented for agent data access
7. ✅ All components ≤120 lines (AgentConfigDialog split)
8. ✅ Application Layer use cases created
9. ✅ Domain entities and validation rules defined

### Quality Requirements
10. ✅ 95% test coverage for validation logic
11. ✅ All tests passing (no regressions)
12. ✅ Zero TypeScript errors
13. ✅ Clean Architecture compliance verified

---

## Scope Definition

### IN SCOPE ✅ (Comprehensive)

**Domain Layer** (90 minutes):
- [ ] Create `src/core/entities/Agent.ts` (domain entity)
- [ ] Create `src/core/validation/agent-validation.ts` (validation rules)
- [ ] Create `src/core/repositories/AgentRepository.ts` (repository interface)
- [ ] Create error classes (`AgentValidationError`)

**Application Layer** (90 minutes):
- [ ] Create `src/application/use-cases/CreateAgentUseCase.ts`
- [ ] Create `src/application/use-cases/UpdateAgentUseCase.ts`
- [ ] Create `src/application/use-cases/ValidateAgentUseCase.ts`
- [ ] Create `src/application/dtos/AgentDTO.ts`
- [ ] Create `src/application/services/AgentService.ts` (refactor existing)

**Infrastructure Layer** (90 minutes):
- [ ] Create `src/infrastructure/repositories/AgentRepositoryImpl.ts`
- [ ] Create `src/infrastructure/persistence/AgentStorageAdapter.ts`
- [ ] Update `src/stores/agents-store.ts` (use repository pattern)
- [ ] Add event emission for validation failures

**Presentation Layer** (120 minutes):
- [ ] Refactor `AgentConfigDialog.tsx` (551 lines → 3-4 components)
  - `AgentConfigForm.tsx` (≤120 lines)
  - `AgentValidationErrors.tsx` (≤80 lines)
  - `AgentProviderSelector.tsx` (≤100 lines)
  - `AgentModelSelector.tsx` (≤100 lines)
- [ ] Create `src/presentation/hooks/useAgentValidation.ts`
- [ ] Create `src/presentation/hooks/useAgentMutation.ts`
- [ ] Add error boundaries for validation failures

**Migration & Testing** (60 minutes):
- [ ] Create migration script for existing agents
- [ ] Unit tests for validation logic
- [ ] Integration tests for use cases
- [ ] Component tests for refactored UI
- [ ] Manual testing validation

### OUT OF SCOPE ❌ (Separate Epic)

- Event bus for agent:selected events → STORY-2025-12-31-003
- Knowledge Synthesis workspace integration → Epic 25
- RAG infrastructure → Epic 26
- Component library standardization → Epic 27

---

## Acceptance Criteria

### AC1: Domain Layer - Entity & Validation

**Gherkin**:
```gherkin
Scenario: Domain entity represents Agent
  Given a domain Agent entity
  When entity is created with valid providerId and modelId
  Then entity should enforce invariants
  And entity should have business rules validation

Scenario: Domain validation rules enforce referential integrity
  Given validation rules for Agent providerId/modelId
  When validating agent with providerId "openrouter" and modelId "gpt-4"
  Then validation should fail (gpt-4 belongs to OpenAI)
  And error message should be "Model gpt-4 is not available for provider openrouter"
```

**Technical Specification**:

```typescript
// src/core/entities/Agent.ts
export class Agent {
    private constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly providerId: string,
        public readonly modelId: string,
        // ... other fields
    ) {
        this.validate(); // Enforce invariants
    }

    private validate(): void {
        if (!this.name || this.name.trim() === '') {
            throw new AgentValidationError('name', 'Name is required');
        }
        // More invariants...
    }

    static create(data: CreateAgentDTO): Agent {
        return new Agent(
            generateId(),
            data.name,
            data.providerId,
            data.modelId,
            // ...
        );
    }
}

// src/core/validation/agent-validation.ts
export function validateAgentProviderModel(
    providerId: string,
    modelId: string,
    availableModels: Record<string, ModelInfo[]>
): ValidationResult {
    // Pure business logic - no framework dependencies
    if (!availableModels[providerId]) {
        return {
            isValid: false,
            error: 'validation.provider.unknown',
            message: `Provider "${providerId}" is not configured`
        };
    }

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

// src/core/repositories/AgentRepository.ts (interface)
export interface AgentRepository {
    save(agent: Agent): Promise<void>;
    findById(id: string): Promise<Agent | null>;
    findAll(): Promise<Agent[]>;
    delete(id: string): Promise<void>;
    validateProviderModel(providerId: string, modelId: string): Promise<ValidationResult>;
}
```

**Tests**:
```typescript
describe('Agent Entity', () => {
    it('should enforce name invariant', () => {
        expect(() => Agent.create({ name: '' }))
            .toThrow(AgentValidationError);
    });
});

describe('validateAgentProviderModel', () => {
    it('should reject model from wrong provider', () => {
        const models = {
            'openrouter': [{ id: 'mistralai/devstral-2512:free' }]
        };

        const result = validateAgentProviderModel(
            'openrouter',
            'gpt-4',
            models
        );

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('validation.model.notAvailable');
    });
});
```

---

### AC2: Application Layer - Use Case Orchestration

**Gherkin**:
```gherkin
Scenario: Create Agent use case orchestrates validation and persistence
  Given user wants to create an agent with providerId "openrouter" and modelId "gpt-4"
  When createAgent use case is executed
  Then use case should validate providerId/modelId relationship
  And use case should reject creation with error "Model gpt-4 is not available"
  And agent should NOT be saved
```

**Technical Specification**:

```typescript
// src/application/use-cases/CreateAgentUseCase.ts
export class CreateAgentUseCase {
    constructor(
        private agentRepository: AgentRepository,
        private providerRepository: ProviderRepository
    ) {}

    async execute(request: CreateAgentRequest): Promise<Agent> {
        // Step 1: Validate business rules
        const validationResult = await this.agentRepository.validateProviderModel(
            request.providerId,
            request.modelId
        );

        if (!validationResult.isValid) {
            throw new AgentValidationError(
                'providerModel',
                validationResult.message
            );
        }

        // Step 2: Create domain entity
        const agent = Agent.create({
            name: request.name,
            providerId: request.providerId,
            modelId: request.modelId,
            // ...
        });

        // Step 3: Persist via repository
        await this.agentRepository.save(agent);

        return agent;
    }
}

// src/application/use-cases/UpdateAgentUseCase.ts
export class UpdateAgentUseCase {
    constructor(
        private agentRepository: AgentRepository,
        private providerRepository: ProviderRepository
    ) {}

    async execute(id: string, request: UpdateAgentRequest): Promise<Agent> {
        const existing = await this.agentRepository.findById(id);
        if (!existing) {
            throw new AgentNotFoundError(id);
        }

        // Validate if providerId/modelId changed
        if (request.providerId || request.modelId) {
            const newProviderId = request.providerId || existing.providerId;
            const newModelId = request.modelId || existing.modelId;

            const validationResult = await this.agentRepository.validateProviderModel(
                newProviderId,
                newModelId
            );

            if (!validationResult.isValid) {
                throw new AgentValidationError(
                    'providerModel',
                    validationResult.message
                );
            }
        }

        const updated = existing.update(request);
        await this.agentRepository.save(updated);

        return updated;
    }
}
```

**Tests**:
```typescript
describe('CreateAgentUseCase', () => {
    it('should reject agent with invalid providerId/modelId', async () => {
        const useCase = new CreateAgentUseCase(
            mockAgentRepository,
            mockProviderRepository
        );

        await expect(useCase.execute({
            name: 'Test Agent',
            providerId: 'openrouter',
            modelId: 'gpt-4'  // Invalid
        })).rejects.toThrow('Model gpt-4 is not available');
    });
});
```

---

### AC3: Infrastructure Layer - Repository Implementation

**Gherkin**:
```gherkin
Scenario: Repository implementation validates against provider store
  Given AgentRepositoryImpl is backed by provider store
  When validateProviderModel is called with providerId "openrouter" and modelId "gpt-4"
  Then repository should query provider store
  And repository should return validation error
```

**Technical Specification**:

```typescript
// src/infrastructure/repositories/AgentRepositoryImpl.ts
export class AgentRepositoryImpl implements AgentRepository {
    constructor(
        private providerStore: ProviderStore,
        private storageAdapter: AgentStorageAdapter
    ) {}

    async save(agent: Agent): Promise<void> {
        const agentData = this.toPersistenceModel(agent);
        await this.storageAdapter.save(agentData);
        this.emitEvent('agent:created', agent);
    }

    async findById(id: string): Promise<Agent | null> {
        const data = await this.storageAdapter.findById(id);
        return data ? this.toDomainModel(data) : null;
    }

    async validateProviderModel(
        providerId: string,
        modelId: string
    ): Promise<ValidationResult> {
        // Query provider store (single source of truth)
        const availableModels = this.providerStore.getAvailableModels();

        // Delegate to domain validation logic
        return validateAgentProviderModel(
            providerId,
            modelId,
            availableModels
        );
    }

    private toDomainModel(data: AgentData): Agent {
        return Agent.create(data);
    }

    private toPersistenceModel(agent: Agent): AgentData {
        return {
            id: agent.id,
            name: agent.name,
            providerId: agent.providerId,
            modelId: agent.modelId,
            // ...
        };
    }

    private emitEvent(event: string, data: unknown): void {
        // Emit to event bus for cross-component communication
        eventBus.emit(event, data);
    }
}

// src/infrastructure/persistence/AgentStorageAdapter.ts
export class AgentStorageAdapter {
    async save(data: AgentData): Promise<void> {
        // Abstraction over localStorage/IndexedDB
        // Makes testing easier
    }
}
```

**Tests**:
```typescript
describe('AgentRepositoryImpl', () => {
    it('should validate against provider store', async () => {
        const mockProviderStore = {
            getAvailableModels: () => ({
                'openrouter': [{ id: 'mistralai/devstral-2512:free' }]
            })
        };

        const repository = new AgentRepositoryImpl(mockProviderStore, mockAdapter);

        const result = await repository.validateProviderModel(
            'openrouter',
            'gpt-4'
        );

        expect(result.isValid).toBe(false);
    });
});
```

---

### AC4: Presentation Layer - Component Refactoring

**Gherkin**:
```gherkin
Scenario: AgentConfigForm component handles validation errors
  Given user enters providerId "openrouter" and modelId "gpt-4"
  When user clicks "Save Agent"
  Then useAgentValidation hook should return validation error
  And AgentValidationErrors component should display error message
  And agent should NOT be created
```

**Component Split**:

```typescript
// src/presentation/components/agent/AgentConfigForm.tsx (≤120 lines)
export function AgentConfigForm({ agent, onSuccess }: Props) {
    const validation = useAgentValidation();
    const mutation = useAgentMutation();

    const handleSubmit = async (data: AgentFormData) => {
        // Validate using hook
        const validationResult = await validation.validateProviderModel(
            data.providerId,
            data.modelId
        );

        if (!validationResult.isValid) {
            validation.setError(validationResult.message);
            return;
        }

        // Create using use case
        await mutation.createAgent(data);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit}>
            <AgentProviderSelector />
            <AgentModelSelector />
            <AgentValidationErrors error={validation.error} />
            {/* ... other fields ... */}
        </form>
    );
}

// src/presentation/hooks/useAgentValidation.ts
export function useAgentValidation() {
    const [error, setError] = useState<string | null>(null);
    const validateAgentUseCase = useValidateAgentUseCase();

    const validateProviderModel = async (
        providerId: string,
        modelId: string
    ) => {
        try {
            await validateAgentUseCase.execute({ providerId, modelId });
            return { isValid: true };
        } catch (err) {
            if (err instanceof AgentValidationError) {
                setError(err.message);
                return { isValid: false, message: err.message };
            }
            throw err;
        }
    };

    return { error, validateProviderModel, setError };
}

// src/presentation/components/agent/AgentValidationErrors.tsx (≤80 lines)
export function AgentValidationErrors({ error }: Props) {
    if (!error) return null;

    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
}
```

**Tests**:
```typescript
describe('AgentConfigForm', () => {
    it('should display validation error for invalid model', async () => {
        const { getByLabelText, getByText } = render(<AgentConfigForm />);

        fireEvent.change(getByLabelText('Provider'), 'openrouter');
        fireEvent.change(getByLabelText('Model'), 'gpt-4');
        fireEvent.click(getByText('Save'));

        await waitFor(() => {
            expect(getByText('Model gpt-4 is not available for provider openrouter'))
                .toBeInTheDocument();
        });
    });
});
```

---

### AC5: Migration Script

**Gherkin**:
```gherkin
Scenario: Migration validates existing agents
  Given app starts with existing agents in store
  When migration script runs
  Then each agent should be validated
  And invalid agents should be marked with status 'invalid'
  And user should be notified of invalid agents
```

**Technical Specification**:

```typescript
// src/infrastructure/migration/validate-existing-agents.ts
export async function migrateAgentValidation() {
    const agents = await agentRepository.findAll();
    const validateAgentUseCase = new ValidateAgentUseCase(providerRepository);

    let invalidCount = 0;

    for (const agent of agents) {
        try {
            await validateAgentUseCase.execute({
                providerId: agent.providerId,
                modelId: agent.modelId
            });
            // Valid - do nothing
        } catch (error) {
            if (error instanceof AgentValidationError) {
                invalidCount++;
                console.warn(`[Migration] Invalid agent: ${agent.name}`, error.message);

                // Mark as invalid
                const updated = agent.update({ status: 'invalid' });
                await agentRepository.save(updated);

                // Notify user
                toast.error(`Agent "${agent.name}" has invalid configuration: ${error.message}`);
            }
        }
    }

    if (invalidCount > 0) {
        console.warn(`[Migration] Found ${invalidCount} invalid agents`);
    }

    return invalidCount;
}
```

---

## Implementation Plan

### Phase 1: Domain Layer (90 minutes)

**Tasks**:
1. Create domain entity `Agent.ts` with invariants
2. Create validation rules `agent-validation.ts`
3. Create repository interface `AgentRepository.ts`
4. Create error classes
5. Write unit tests (95% coverage)

**Files to Create**:
```
src/core/entities/Agent.ts
src/core/validation/agent-validation.ts
src/core/repositories/AgentRepository.ts
src/core/errors/AgentErrors.ts
src/core/entities/__tests__/Agent.test.ts
src/core/validation/__tests__/agent-validation.test.ts
```

---

### Phase 2: Application Layer (90 minutes)

**Tasks**:
1. Create use cases (Create, Update, Validate)
2. Create DTOs
3. Refactor existing AgentService.ts
4. Write integration tests

**Files to Create**:
```
src/application/use-cases/CreateAgentUseCase.ts
src/application/use-cases/UpdateAgentUseCase.ts
src/application/use-cases/ValidateAgentUseCase.ts
src/application/dtos/AgentDTO.ts
src/application/services/AgentService.ts (refactor)
src/application/use-cases/__tests__/CreateAgentUseCase.test.ts
```

---

### Phase 3: Infrastructure Layer (90 minutes)

**Tasks**:
1. Create repository implementation
2. Create storage adapter
3. Update agents-store.ts to use repository
4. Add event emission
5. Write integration tests

**Files to Create/Modify**:
```
src/infrastructure/repositories/AgentRepositoryImpl.ts
src/infrastructure/persistence/AgentStorageAdapter.ts
src/stores/agents-store.ts (modify to use repository)
src/infrastructure/repositories/__tests__/AgentRepositoryImpl.test.ts
```

---

### Phase 4: Presentation Layer (120 minutes)

**Tasks**:
1. Refactor AgentConfigDialog (551 lines → 4 components)
2. Create hooks for validation and mutations
3. Add error boundaries
4. Write component tests

**Files to Create/Modify**:
```
src/presentation/components/agent/AgentConfigForm.tsx (≤120 lines)
src/presentation/components/agent/AgentValidationErrors.tsx (≤80 lines)
src/presentation/components/agent/AgentProviderSelector.tsx (≤100 lines)
src/presentation/components/agent/AgentModelSelector.tsx (≤100 lines)
src/presentation/hooks/useAgentValidation.ts
src/presentation/hooks/useAgentMutation.ts
src/presentation/components/agent/__tests__/AgentConfigForm.test.tsx
```

---

### Phase 5: Migration & Testing (60 minutes)

**Tasks**:
1. Create migration script
2. Run migration on app load
3. Manual testing validation
4. End-to-end testing

**Files to Create**:
```
src/infrastructure/migration/validate-existing-agents.ts
src/App.tsx (add migration call)
```

---

## Testing Strategy

### Unit Tests (Domain Layer)
- Agent entity invariants
- Validation rules
- Repository interface contract

### Integration Tests (Application Layer)
- Use case orchestration
- Repository integration
- Provider store integration

### Component Tests (Presentation Layer)
- Form validation feedback
- Error display
- User interactions

### E2E Tests (Full Stack)
- Create agent with valid data
- Reject agent with invalid data
- Update agent with invalid data
- Migration script validates existing agents

---

## Risk Assessment

### High Risk Areas

**Risk 1**: Breaking existing agent creation flow
- **Mitigation**: Maintain backward compatibility during migration
- **Fallback**: Feature flag to disable validation if critical bug found

**Risk 2**: Component refactoring introduces UI bugs
- **Mitigation**: Comprehensive component tests, manual testing
- **Rollback**: Keep old AgentConfigDialog until new version fully tested

**Risk 3**: Performance impact of validation
- **Mitigation**: Validation is O(n) where n < 50 models, <100ms expected
- **Optimization**: Cache provider models lookup

---

## Success Metrics

### Quantitative
- ✅ 95% test coverage for domain layer
- ✅ 100% test coverage for validation logic
- ✅ All components ≤120 lines
- ✅ Zero invalid agents can be created in UI
- ✅ <100ms validation execution time

### Qualitative
- ✅ Clean Architecture principles followed
- ✅ Layer boundaries established
- ✅ Repository pattern implemented
- ✅ Sprint Change Proposal compliance 100%
- ✅ Clear, maintainable code

---

## Definition of Done

- [ ] Story document created with comprehensive scope
- [ ] All acceptance criteria defined with gherkin syntax
- [ ] Domain layer implemented with entities and validation
- [ ] Application layer implemented with use cases
- [ ] Infrastructure layer implemented with repository pattern
- [ ] Presentation layer refactored (components ≤120 lines)
- [ ] Migration script created and tested
- [ ] All tests passing (unit, integration, component)
- [ ] Zero TypeScript errors
- [ ] Manual testing completed
- [ ] Sprint Change Proposal compliance verified
- [ ] Clean Architecture principles validated

---

## Next Steps

### Immediate: VALIDATION Phase

**Action**: Validate this comprehensive story against Sprint Change Proposal

**Validation Checklist**:
- [ ] Scope addresses ALL architectural gaps (not superficial)
- [ ] Layer boundaries clearly defined
- [ ] Repository pattern specified
- [ ] Component size compliance addressed
- [ ] Acceptance criteria are measurable and testable
- [ ] Implementation plan is realistic (8-12 hours)
- [ ] Migration strategy is safe

**If Validation Fails**: Create course correction document

**If Validation Passes**: Proceed to CREATE-STORY-CONTEXT phase

---

## Story Status

**Current Phase**: CREATE-STORY (Draft - Comprehensive Scope)
**Created**: 2025-12-31 23:59:45+07:00
**Author**: BMAD Master (bmad-core-bmad-master mode)
**Next Action**: VALIDATE against Sprint Change Proposal (comprehensive review)

**Previous Attempt**: STORY-2025-12-31-002 (validation only - SUPERFICIAL)
**Course Correction**: Expanded scope to address root architectural issues

---

**Signature**: _bmad-core-bmad-master_
