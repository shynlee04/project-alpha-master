# STORY CONTEXT: Agent Referential Integrity Validation (STORY-2025-12-31-002)

**Date**: 2025-12-31 23:55:00+07:00
**Story**: Foreign Key Validation - ProviderId/ModelId Integrity
**Phase**: CREATE-STORY-CONTEXT (Comprehensive Dependency Mapping)
**Status**: DRAFT - Pending Validation

---

## Executive Summary

**Critical Gap Identified**: Agents can be created with invalid `providerId`/`modelId` combinations, causing runtime errors.

**Root Cause**: `AgentConfigDialog.tsx` line 529 calls `addAgent(agentData)` WITHOUT validating that `modelId` belongs to `providerId`.

**Example of Invalid Configuration**:
```typescript
// User creates agent with:
providerId: 'openrouter'
modelId: 'gpt-4'  // ❌ WRONG - gpt-4 belongs to OpenAI, not OpenRouter

// Result: Runtime error "Model not found for provider"
```

**Solution**: Inject validation before `addAgent` and `updateAgent` calls to ensure referential integrity.

---

## 1. File Inventory (17 Files Mapped)

### Core Store Files (2)

**1. [src/stores/agents-store.ts](src/stores/agents-store.ts)** ⚠️ PRIMARY TARGET
- **Purpose**: Agent CRUD operations
- **Key Methods**:
  - `addAgent(agentData)` - Line 129-143 → **NEEDS VALIDATION INJECTION**
  - `updateAgent(id, updates)` - Line 164-173 → **NEEDS VALIDATION INJECTION**
  - `removeAgent(id)` - Line 145-162
- **Current Behavior**: No validation of providerId/modelId relationship
- **Required Changes**: Add validation before save operations

**2. [src/lib/state/provider-store.ts](src/lib/state/provider-store.ts)** ✅ DATA SOURCE
- **Purpose**: Provider configuration and models
- **Key Methods**:
  - `getAvailableModels(providerId)` - Line 178-180 → **Returns ModelInfo[]**
  - `availableModels: Record<string, ModelInfo[]>` - Line 43 → **DATA STRUCTURE**
- **Current Behavior**: Correctly models provider → model relationship
- **Required Changes**: None (used as-is)

---

### UI Components (8)

**3. [src/components/agent/AgentConfigDialog.tsx](src/components/agent/AgentConfigDialog.tsx)** ⚠️ PRIMARY ENTRY POINT
- **Purpose**: Agent creation/edit UI
- **Key Function**: `handleSubmit()` - Line 472-551
  - Line 498-499: Prepares agentData with providerId and modelId
  - Line 524: Calls `updateAgent(agent.id, agentData)` → **NEEDS VALIDATION**
  - Line 529: Calls `addAgent(agentData)` → **NEEDS VALIDATION**
- **Current Behavior**: No referential integrity validation
- **Required Changes**: Call validation before addAgent/updateAgent

**4. [src/components/ide/AgentsPanel.tsx](src/components/ide/AgentsPanel.tsx)**
- **Purpose**: Display list of agents
- **Usage**: Read-only display of agents
- **Required Changes**: None (read-only)

**5. [src/routes/settings.tsx](src/routes/settings.tsx)**
- **Purpose**: Settings page with agent management
- **Usage**: Links to agent configuration
- **Required Changes**: None (navigation only)

**6. [src/presentation/components/agent/AgentConfigDialogRefactored.tsx](src/presentation/components/agent/AgentConfigDialogRefactored.tsx)**
- **Purpose**: Refactored version of AgentConfigDialog
- **Status**: Alternative implementation
- **Required Changes**: Same validation as main dialog

**7. [src/presentation/components/agent/index.ts](src/presentation/components/agent/index.ts)**
- **Purpose**: Barrel export
- **Required Changes**: None

**8. [src/presentation/components/ide/ApiKeyStatus.tsx](src/presentation/components/ide/ApiKeyStatus.tsx)**
- **Purpose**: API key status display
- **Required Changes**: None

---

### Hooks and Utilities (7)

**9. [src/hooks/useAgents.ts](src/hooks/useAgents.ts)**
- **Purpose**: Hook for agent store access
- **Exports**: `addAgent`, `updateAgent`, `removeAgent` wrappers
- **Required Changes**: None (thin wrappers)

**10. [src/components/agent/useAgentConfigForm.ts](src/components/agent/useAgentConfigForm.ts)**
- **Purpose**: Form state management
- **Required Changes**: None (form state only)

**11. [src/components/agent/useAgentConfigProvider.ts](src/components/agent/useAgentConfigProvider.ts)**
- **Purpose**: Provider operations in agent config
- **Required Changes**: None (provider-level config)

**12. [src/components/ide/hooks/useAgentChatApiKeys.ts](src/components/ide/hooks/useAgentChatApiKeys.ts)**
- **Purpose**: API key management for agent chat
- **Required Changes**: None

**13. [src/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx](src/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx)**
- **Purpose**: API key manager component
- **Required Changes**: None

**14. [src/components/agent/agent-config-types.ts](src/components/agent/agent-config-types.ts)**
- **Purpose**: Type definitions
- **Required Changes**: None

**15. [src/components/agent/AgentConfigForm/AgentProviderSelector.tsx](src/components/agent/AgentConfigForm/AgentProviderSelector.tsx)**
- **Purpose**: Provider selection dropdown
- **Required Changes**: None

**16. [src/components/agent/agent-config-validation.ts](src/components/agent/agent-config-validation.ts)**
- **Purpose**: Existing form validation
- **Current Status**: Has `validateModelRequired()` - Line 78-80
- **Required Changes**: Add `validateProviderModelMatch()` function

---

### Test Files (2)

**17. [src/components/agent/__tests__/AgentConfigDialog.test.tsx](src/components/agent/__tests__/AgentConfigDialog.test.tsx)**
- **Purpose**: Component tests
- **Required Changes**: Add test cases for validation logic

**18. [src/infrastructure/persistence/stores/agents-store.test.ts](src/infrastructure/persistence/stores/agents-store.test.ts)**
- **Purpose**: Store tests
- **Required Changes**: Add test cases for validation in addAgent/updateAgent

---

## 2. Dependency Graph (Data Flow)

### Agent Creation Flow

```
USER ACTION (Click "Save Agent" in AgentConfigDialog)
        ↓
AgentConfigDialog.handleSubmit() [Line 472]
        ↓
validateForm() [Line 473]
  - Checks form fields (name, description, etc.)
  - ❌ MISSING: No providerId/modelId validation
        ↓
Prepare agentData [Line 495-516]
  - providerId: "openrouter"
  - modelId: "gpt-4"  ❌ Could be invalid!
        ↓
addAgent(agentData) [Line 529]
        ↓
┌─────────────────────────────────┐
│  agents-store.ts [Line 129-143]  │
│  NO VALIDATION                   │
│  Direct save to store            │
└─────────────────────────────────┘
        ↓
INVALID AGENT SAVED → RUNTIME ERROR LATER
```

### Agent Update Flow

```
USER ACTION (Click "Save Changes")
        ↓
AgentConfigDialog.handleSubmit() [Line 472]
        ↓
validateForm() [Line 473]
  - ❌ MISSING: No providerId/modelId validation
        ↓
Prepare agentData [Line 495-516]
  - providerId: "openrouter"
  - modelId: "gpt-4"  ❌ Could be invalid!
        ↓
updateAgent(agent.id, agentData) [Line 524]
        ↓
┌─────────────────────────────────┐
│  agents-store.ts [Line 164-173]  │
│  NO VALIDATION                   │
│  Direct update in store          │
└─────────────────────────────────┘
        ↓
INVALID AGENT UPDATED → RUNTIME ERROR LATER
```

### Provider Store Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    provider-store.ts                             │
│                                                                   │
│  availableModels: Record<string, ModelInfo[]>                   │
│  {                                                                │
│    'openrouter': [                                               │
│      { id: 'mistralai/devstral-2512:free', name: 'Devstral' },   │
│      { id: 'deepseek/deepseek-chat', name: 'DeepSeek' }           │
│    ],                                                              │
│    'openai': [                                                    │
│      { id: 'gpt-4', name: 'GPT-4' },                             │
│      { id: 'gpt-4o', name: 'GPT-4O' }                             │
│    ],                                                              │
│    'anthropic': [                                                 │
│      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5' }     │
│    ]                                                               │
│  }                                                                │
│                                                                   │
│  getAvailableModels(providerId): ModelInfo[]                     │
│  - Returns models for specific provider                            │
│  - Returns empty array if provider not found                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Integration Points (Where to Inject Validation)

### Primary Integration Point #1: agents-store.ts

**Location**: `src/stores/agents-store.ts`

**Current Code** (Line 129-143):
```typescript
addAgent: (agentData) => {
    const newAgent: Agent = {
        ...agentData,
        id: `agt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        tasksCompleted: 0,
        successRate: 0,
        tokensUsed: 0,
    };

    console.log('[AgentsStore] Adding agent:', newAgent.id, newAgent.name);
    set((state) => ({ agents: [...state.agents, newAgent] }));
    return newAgent;
},
```

**Required Changes**:
```typescript
addAgent: (agentData) => {
    // ✅ NEW: Validate providerId/modelId relationship
    const validation = validateAgentProviderModel(
        agentData.providerId,
        agentData.modelId,
        // Get from provider store (will be injected)
        getProviderModels(agentData.providerId)
    );

    if (!validation.isValid) {
        console.error('[AgentsStore] Validation failed:', validation.message);
        throw new AgentValidationError(validation.message);
    }

    // Continue with normal add logic...
    const newAgent: Agent = { ...agentData, ... };
    // ...
},
```

---

### Primary Integration Point #2: AgentConfigDialog.tsx

**Location**: `src/components/agent/AgentConfigDialog.tsx`

**Current Code** (Line 472-551):
```typescript
const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
        // ... prepare agentData ...

        let savedAgent: Agent | undefined;

        if (agent) {
            updateAgent(agent.id, agentData);  // ❌ NO VALIDATION
            savedAgent = { ...agent, ...agentData };
        } else {
            addAgent(agentData);  // ❌ NO VALIDATION
            savedAgent = addAgent(agentData);
        }

        // ... success handling ...
    } catch (error) {
        // ... error handling ...
    }
}, [/* deps */]);
```

**Required Changes**:
```typescript
const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    // ✅ NEW: Validate providerId/modelId BEFORE save
    const providerModels = useProviderStore.getState().getAvailableModels(providerId);
    const modelExists = providerModels.some(m => m.id === modelId);

    if (!modelExists) {
        toast.error(t('agents.validation.modelNotAvailable',
            `Model "${modelId}" is not available for provider "${providerId}"`
        ));
        return; // Prevent save
    }

    setIsSubmitting(true);

    try {
        // ... rest of save logic ...
    }
}, [/* deps */]);
```

---

### Secondary Integration Point #3: agent-config-validation.ts

**Location**: `src/components/agent/agent-config-validation.ts`

**Current Code** (Line 78-80):
```typescript
validateModelRequired: (modelId: string) => {
    if (!modelId || modelId.trim() === '') {
        return 'agents.config.validation.modelRequired'
    }
    return true
},
```

**Required Addition**:
```typescript
validateProviderModelMatch: (
    providerId: string,
    modelId: string,
    availableModels: Record<string, ModelInfo[]>
) => {
    // Rule 1: Check if provider exists
    if (!availableModels[providerId]) {
        return 'agents.config.validation.providerUnknown'
    }

    // Rule 2: Check if model belongs to provider
    const providerModels = availableModels[providerId]
    const modelExists = providerModels.some(m => m.id === modelId)

    if (!modelExists) {
        return 'agents.config.validation.modelNotAvailable'
    }

    return true
},
```

---

## 4. Edge Cases Catalog

### Edge Case 1: Unknown Provider

**Scenario**:
```typescript
providerId: 'unknown-provider'
modelId: 'any-model'
```

**Expected Behavior**: Validation fails with error "Provider 'unknown-provider' is not configured"

**Current Behavior**: ❌ Would save, cause runtime error later

---

### Edge Case 2: Model From Different Provider

**Scenario**:
```typescript
providerId: 'openrouter'
modelId: 'gpt-4'  // Belongs to OpenAI, not OpenRouter
```

**Expected Behavior**: Validation fails with error "Model 'gpt-4' is not available for provider 'openrouter'"

**Current Behavior**: ❌ Would save, cause runtime error later

---

### Edge Case 3: Provider Has No Models Loaded

**Scenario**:
```typescript
providerId: 'openai'
modelId: 'gpt-4'
// But availableModels['openai'] is empty array []
```

**Expected Behavior**: Validation fails with error "No models available for provider 'openai'"

**Current Behavior**: ❌ Would save, cause runtime error later

---

### Edge Case 4: Custom Provider With No Models

**Scenario**:
```typescript
providerId: 'openai-compatible'
modelId: 'custom-model'
// User just created provider, hasn't loaded models yet
```

**Expected Behavior**: Validation fails with error "No models available for provider 'openai-compatible'"

**Current Behavior**: ❌ Would save, cause runtime error later

---

### Edge Case 5: Model ID Is Empty String

**Scenario**:
```typescript
providerId: 'openrouter'
modelId: ''
```

**Expected Behavior**: Validation fails with error "Model is required"

**Current Behavior**: ✅ Already handled by `validateModelRequired()` in agent-config-validation.ts

---

### Edge Case 6: Provider ID Is Empty

**Scenario**:
```typescript
providerId: ''
modelId: 'gpt-4'
```

**Expected Behavior**: Validation fails with error "Provider is required"

**Current Behavior**: ✅ Already handled by form validation

---

### Edge Case 7: Migration Scenario - Existing Invalid Agent

**Scenario**:
```typescript
// Agent created before this story (stored in IndexedDB)
{
  name: 'Legacy Agent',
  providerId: 'openrouter',
  modelId: 'gpt-4'  // Invalid - wrong provider
}
```

**Expected Behavior**:
- Migration script detects invalid agent
- Sets agent status to 'invalid'
- Shows toast notification to user
- User must fix or delete agent

**Current Behavior**: ❌ Agent exists, will cause runtime error when used

---

## 5. Migration Impact Assessment

### Existing Agent Analysis

**Current Agent Count**: Unknown (varies by user environment)

**DEFAULT_AGENT** (from agents-store.ts line 35):
```typescript
const DEFAULT_AGENT: Agent = {
    id: 'agt_default_001',
    name: 'Via-Gent Coder',
    providerId: 'openrouter',              // ✅ Valid
    modelId: 'mistralai/devstral-2512:free', // ✅ Valid (belongs to OpenRouter)
    // ...
};
```

**Assessment**: DEFAULT_AGENT is VALID ✅

**Potential Invalid Agents**:
- Any agent created manually via `addAgent` with wrong provider/model combo
- Any agent migrated from OLD schema with `provider` display name instead of `providerId`
- Agents created via tests or scripts without validation

**Migration Strategy**:
1. Scan all agents in `useAgentsStore.getState().agents`
2. For each agent, validate providerId/modelId relationship
3. If invalid:
   - Set `status: 'invalid'`
   - Log warning with agent name and error
   - Show toast notification
4. User must manually fix or delete invalid agents

---

## 6. Data Structure Dependencies

### Agent Entity (NEW Schema)

```typescript
interface Agent {
    id: string;
    name: string;
    description: string;
    providerId: string;           // Foreign key to provider
    modelId: string;              // Foreign key to model
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;
    tools: AgentTool[];
    workspaceBindings: WorkspaceBinding[];
    status: 'online' | 'offline' | 'busy' | 'error' | 'invalid'; // ✅ NEW: 'invalid' status
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;
    createdAt: string;
}
```

### Provider Model Structure

```typescript
interface ModelInfo {
    id: string;           // e.g., 'gpt-4', 'mistralai/devstral-2512:free'
    name: string;         // e.g., 'GPT-4', 'Devstral'
    contextWindow: number;
    maxOutputTokens: number;
    inputModalities: string[];
    outputModalities: string[];
    isEnabled: boolean;
}
```

### Provider Store State

```typescript
interface ProviderState {
    providers: ProviderConfig[];
    availableModels: Record<string, ModelInfo[]>;  // ✅ KEY: providerId → ModelInfo[]

    getAvailableModels(providerId: string): ModelInfo[] {
        return get().availableModels[providerId] || [];
    }
}
```

---

## 7. Error Handling Strategy

### Validation Error Types

**1. Unknown Provider Error**
```typescript
{
    isValid: false,
    error: 'validation.provider.unknown',
    message: 'Provider "{providerId}" is not configured'
}
```

**2. Model Not Available Error**
```typescript
{
    isValid: false,
    error: 'validation.model.notAvailable',
    message: 'Model "{modelId}" is not available for provider "{providerId}"'
}
```

**3. No Models Loaded Error**
```typescript
{
    isValid: false,
    error: 'validation.provider.noModels',
    message: 'No models available for provider "{providerId}". Please add API key first.'
}
```

### User-Facing Error Messages

**UI Display** (via toast):
```typescript
// English
toast.error(`Model "${modelId}" is not available for provider "${providerId}". Please select a valid model.`)

// Vietnamese (i18n)
toast.error(t('agents.validation.modelNotAvailable', {
    modelId,
    providerId,
    defaultMessage: `Model "${modelId}" is not available for provider "${providerId}"`
}))
```

---

## 8. Testing Strategy

### Unit Tests Required

**Test Suite 1: Domain Validation Logic**
```typescript
describe('validateAgentProviderModel', () => {
    it('should reject unknown provider', () => {
        const result = validateAgentProviderModel(
            'unknown-provider',
            'gpt-4',
            {}
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('validation.provider.unknown');
    });

    it('should reject model from different provider', () => {
        const models = {
            'openrouter': [
                { id: 'mistralai/devstral-2512:free', name: 'Devstral' }
            ]
        };

        const result = validateAgentProviderModel(
            'openrouter',
            'gpt-4',  // Wrong provider
            models
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('validation.model.notAvailable');
    });

    it('should accept valid provider/model combination', () => {
        const models = {
            'openrouter': [
                { id: 'mistralai/devstral-2512:free', name: 'Devstral' }
            ]
        };

        const result = validateAgentProviderModel(
            'openrouter',
            'mistralai/devstral-2512:free',
            models
        );
        expect(result.isValid).toBe(true);
    });
});
```

**Test Suite 2: Store Integration**
```typescript
describe('agents-store validation', () => {
    it('should throw error when adding agent with invalid model', () => {
        const store = createAgentsStore();

        // Mock provider store to return empty models
        jest.spyOn(providerStore, 'getAvailableModels').mockReturnValue([]);

        expect(() => {
            store.getState().addAgent({
                name: 'Test Agent',
                providerId: 'openrouter',
                modelId: 'gpt-4',  // Invalid
                // ... other required fields
            });
        }).toThrow('Model gpt-4 is not available for provider openrouter');
    });
});
```

**Test Suite 3: UI Integration**
```typescript
describe('AgentConfigDialog validation', () => {
    it('should prevent save when model is invalid', async () => {
        const { getByLabelText, getByText } = render(<AgentConfigDialog />);

        // Select provider
        fireEvent.change(getByLabelText('Provider'), 'openrouter');

        // Enter invalid model
        fireEvent.change(getByLabelText('Model'), 'gpt-4');

        // Click save
        fireEvent.click(getByText('Save'));

        // Should show error toast
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                expect.stringContaining('not available for provider')
            );
        });

        // Agent should NOT be added
        const agents = useAgentsStore.getState().agents;
        expect(agents.length).toBe(0);
    });
});
```

---

## 9. Implementation Phases (Detailed)

### Phase 1: Domain Layer (30 min)

**Files to Create**:
```
src/core/domain/validation/
├── agent-validation.ts       (validateAgentProviderModel function)
└── types.ts                    (ValidationResult type, AgentValidationError class)
```

**Dependencies**:
- `@/lib/agent/providers/types` (ModelInfo type)

**Deliverables**:
1. Domain validation logic
2. Error definitions
3. Unit tests (95% coverage)

---

### Phase 2: Application Layer (45 min)

**Files to Create**:
```
src/application/use-cases/
└── ValidateAgentUseCase.ts       (orchestration layer)
```

**Dependencies**:
- `src/core/domain/validation/agent-validation.ts` (domain logic)
- `src/lib/state/provider-store.ts` (provider store)

**Deliverables**:
1. Use case implementation
2. Integration tests
3. Error handling

---

### Phase 3: Infrastructure Integration (45 min)

**Files to Modify**:
```
src/stores/agents-store.ts              (add validation in addAgent/updateAgent)
src/components/agent/AgentConfigDialog.tsx  (add validation in handleSubmit)
src/components/agent/agent-config-validation.ts (add validateProviderModelMatch)
```

**Dependencies**:
- `src/application/use-cases/ValidateAgentUseCase.ts`
- `src/lib/state/provider-store.ts`

**Deliverables**:
1. Validation integrated in agents-store
2. Validation integrated in AgentConfigDialog
3. Helper function in agent-config-validation

---

### Phase 4: Migration Script (30 min)

**Files to Create**:
```
src/lib/agent/migration/
└── validate-existing-agents.ts     (migration script)
```

**Files to Modify**:
```
src/App.tsx or src/main.tsx           (call migration on app load)
```

**Dependencies**:
- `src/stores/agents-store.ts`
- `src/application/use-cases/ValidateAgentUseCase.ts`

**Deliverables**:
1. Migration script implementation
2. App initialization hook
3. User notification system

---

## 10. Risk Assessment

### Implementation Risks

**Risk 1: Breaking Existing Workflows** ⚠️ LOW
- **Mitigation**: Validation is additive, doesn't remove functionality
- **Fallback**: Can add "force save" option if needed

**Risk 2: Performance Impact** ⚠️ LOW
- **Mitigation**: Validation is O(n) where n = number of models (typically < 50)
- **Optimization**: Cache provider models lookup
- **Target**: < 100ms validation time

**Risk 3: False Positives** ⚠️ MEDIUM
- **Scenario**: Valid model rejected due to race condition
- **Mitigation**: Graceful degradation with "force save" option
- **Monitoring**: Log validation failures for debugging

---

## 11. Rollback Strategy

**If Validation Causes Issues**:
1. Add feature flag: `ENABLE_AGENT_VALIDATION` (default: true)
2. If critical bug found, set flag to false
3. Validation disabled, original behavior restored
4. Fix bug, re-enable flag

**Rollback Command** (in browser console):
```typescript
// Disable validation temporarily
localStorage.setItem('enable_agent_validation', 'false');
location.reload();
```

---

## 12. Context Completeness Checklist

- [x] **File Inventory**: All 18 files mapped
- [x] **Dependency Graph**: Data flow documented
- [x] **Integration Points**: 3 primary injection points identified
- [x] **Edge Cases**: 7 edge cases cataloged
- [x] **Migration Impact**: Existing agents assessed
- [x] **Data Structures**: Agent and Provider structures documented
- [x] **Error Handling**: Error types and messages defined
- [x] **Testing Strategy**: Test suites defined
- [x] **Implementation Plan**: 4 phases with timelines
- [x] **Risk Assessment**: Risks and mitigations identified
- [x] **Rollback Strategy**: Safe rollback plan defined

---

## Summary

**Total Files Involved**: 18 files
- **2 Core Store Files** (agents-store, provider-store)
- **8 UI Components** (AgentConfigDialog, panels, etc.)
- **7 Hooks/Utilities** (useAgents, useAgentConfigForm, etc.)
- **2 Test Files** (AgentConfigDialog.test, agents-store.test)

**Primary Injection Points**: 3
1. `agents-store.ts` addAgent/updateAgent methods
2. `AgentConfigDialog.tsx` handleSubmit function
3. `agent-config-validation.ts` helper functions

**Estimated Migration Impact**: Low (DEFAULT_AGENT is valid, user-created agents unknown)

**Critical Success Factors**:
1. ✅ Comprehensive file mapping completed
2. ✅ Data flow clearly understood
3. ✅ Integration points precisely identified
4. ✅ Edge cases cataloged
5. ✅ Safe migration strategy defined

**Next Phase**: VALIDATE this context document for completeness

---

**Context Created**: 2025-12-31 23:55:00+07:00
**Author**: BMAD Master (bmad-core-bmad-master mode)
**Status**: READY FOR VALIDATION
**Completeness**: 100% (all checklist items complete)

---

**Signature**: _bmad-core-bmad-master_
