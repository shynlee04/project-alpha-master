---
story_id: STORY-2025-12-31-001
title: Agent Schema Alignment - Critical Fix
epic: Sprint Change Proposal v2.0 - AC-02 Agent Configuration Vault
status: DRAFT
priority: P0 - BLOCKER
created: 2025-12-31T19:30:00+07:00
team: BMAD Master
agent_mode: bmad-core-bmad-master
workflow: story-dev-cycle
phase: CREATE-STORY
---

# Story: Agent Schema Alignment

## Problem Statement

**CRITICAL ISSUE**: The Agent entity has **dual schema implementation** causing TypeScript compilation errors and breaking agent configuration functionality.

**Current State**:
- NEW schema defined in `src/core/entities/Agent.ts` (per Sprint Change Proposal v2.0)
- OLD schema still used in `src/stores/agents-store.ts` DEFAULT_AGENT
- 20+ TypeScript compilation errors confirmed
- Agent creation flow broken

**Impact**:
- 🔴 Blocks agent configuration
- 🔴 Type safety violations
- 🔴 Potential runtime errors in production
- 🔴 Violates Sprint Change Proposal v2.0 AC-02 requirements

---

## Root Cause Analysis

**Historical Context**:
1. Sprint Change Proposal v2.0 defined NEW Agent schema (2025-12-31)
2. Domain entities created with NEW schema ✅
3. Main Zustand store (`src/stores/agents-store.ts`) NEVER MIGRATED ❌
4. Components have mixed OLD/NEW schema usage
5. Mapping functions created as workaround (not sustainable)

**Schema Mismatch Details**:

```typescript
// NEW Schema (src/core/entities/Agent.ts) - CORRECT
interface Agent {
    description: string;     // ✅ Field name
    providerId: string;      // ✅ Field name (FK to LLMProvider)
    modelId: string;         // ✅ Field name (FK to ProviderModel)
    systemPrompt: string;    // ✅ Present
    temperature: number;     // ✅ Present
    tools: AgentToolBinding[];           // ✅ Present
    workspaceBindings: WorkspaceBinding[]; // ✅ Present
}

// OLD Schema (src/stores/agents-store.ts) - INCORRECT
const DEFAULT_AGENT = {
    role: string;           // ❌ Wrong field name
    provider: string;       // ❌ Wrong field name
    model: string;          // ❌ Wrong field name
    // Missing: systemPrompt, temperature, maxTokens, topP, tools, workspaceBindings
}
```

---

## Sprint Change Proposal Reference

**Epic**: AC-02 - Agent Configuration Vault (P0 TODAY)

**Acceptance Criteria (from proposal)**:
> 1. Agents reference provider + model correctly
>    - Agent has `providerId` and `modelId` fields
>    - Validation: model must belong to provider

**Current Compliance**: ❌ **FAIL** - DEFAULT_AGENT uses old field names

---

## User Story

**As a**: Developer
**I want**: All Agent references to use consistent schema (description, providerId, modelId)
**So that**: Type safety is maintained, agent configuration works, and Sprint Change Proposal requirements are met

**Acceptance Criteria**:
1. ✅ DEFAULT_AGENT uses NEW schema fields
2. ✅ All required fields present (systemPrompt, temperature, tools, workspaceBindings)
3. ✅ TypeScript compiles with 0 Agent-related errors
4. ✅ Agent creation flow works (manual test)
5. ✅ Phase 0 Gate tests pass (provider → models, agent selector, chat)

---

## Technical Specifications

### Files Affected

**Core Files** (MUST CHANGE):
1. `src/stores/agents-store.ts` (lines 27-40) - DEFAULT_AGENT definition
2. `src/stores/agents-store.test.ts` - Test mocks
3. `src/infrastructure/persistence/stores/agents-store.test.ts` - Test mocks (if exists)
4. `src/core/entities/agents.ts` - Sample data (if exists)

**Import Files** (MAY NEED UPDATES):
- 20+ files importing from `@/mocks/agents` instead of `@/core/entities/Agent`

**Test Coverage**:
- Unit tests for DEFAULT_AGENT creation
- Integration tests for agent store initialization
- Manual tests for agent configuration UI

### Dependencies

**Required Constants** (must be imported or defined):
```typescript
DEFAULT_TOOLS: AgentToolBinding[]
DEFAULT_WORKSPACE_BINDINGS: WorkspaceBinding[]
```

**Source**: `src/mocks/agents.ts` (lines 17-52)

**Import Strategy**:
```typescript
import { DEFAULT_TOOLS, DEFAULT_WORKSPACE_BINDINGS } from '@/mocks/agents';
```

### Schema Migration Map

| OLD Field | NEW Field | Transformation |
|-----------|-----------|----------------|
| `role: string` | `description: string` | Direct rename |
| `provider: string` | `providerId: string` | Direct rename, lowercase |
| `model: string` | `modelId: string` | Direct rename |
| *[missing]* | `systemPrompt: string` | Add default prompt |
| *[missing]* | `temperature: number` | Add default 0.7 |
| *[missing]* | `maxTokens: number` | Add default 4096 |
| *[missing]* | `topP: number` | Add default 1.0 |
| *[missing]* | `tools: AgentToolBinding[]` | Add DEFAULT_TOOLS |
| *[missing]* | `workspaceBindings: WorkspaceBinding[]` | Add DEFAULT_WORKSPACE_BINDINGS |

---

## Implementation Plan (TDD Approach)

### Phase 1: Test Creation (RED Phase)

**Test 1: DEFAULT_AGENT Schema Validation**
```typescript
// File: src/stores/agents-store.test.ts
test('DEFAULT_AGENT uses correct schema', () => {
    expect(DEFAULT_AGENT).toMatchSchema({
        description: expect.any(String),
        providerId: expect.any(String),
        modelId: expect.any(String),
        systemPrompt: expect.any(String),
        temperature: expect.any(Number),
        maxTokens: expect.any(Number),
        topP: expect.any(Number),
        tools: expect.any(Array),
        workspaceBindings: expect.any(Array),
    });

    // Verify OLD fields don't exist
    expect(DEFAULT_AGENT).not.toHaveProperty('role');
    expect(DEFAULT_AGENT).not.toHaveProperty('provider');
    expect(DEFAULT_AGENT).not.toHaveProperty('model');
});
```

**Test 2: Store Initialization**
```typescript
test('store initializes with DEFAULT_AGENT', () => {
    const store = useAgentsStore.getState();
    expect(store.agents).toHaveLength(1);
    expect(store.agents[0]).toMatchObject({
        name: 'Via-Gent Coder',
        description: expect.any(String),
        providerId: 'openrouter',
        modelId: 'mistralai/devstral-2512:free',
    });
});
```

**Test 3: Agent Creation**
```typescript
test('addAgent creates agent with correct schema', () => {
    const store = useAgentsStore.getState();
    const newAgent = store.addAgent({
        name: 'Test Agent',
        description: 'Test description',
        providerId: 'anthropic',
        modelId: 'claude-3-5-sonnet-20241022',
        systemPrompt: 'Test prompt',
        temperature: 0.5,
        maxTokens: 2048,
        topP: 1.0,
        tools: [],
        workspaceBindings: [],
        status: 'online',
    });

    expect(newAgent).not.toHaveProperty('role');
    expect(newAgent).toHaveProperty('description', 'Test description');
});
```

**Expected Test Results (RED Phase)**:
- ❌ All tests FAIL (expected, code not fixed yet)

### Phase 2: Code Implementation (GREEN Phase)

**Change 1: Update Imports**
```typescript
// File: src/stores/agents-store.ts
// Line: ~22 (after existing imports)
import { DEFAULT_TOOLS, DEFAULT_WORKSPACE_BINDINGS } from '@/mocks/agents';
```

**Change 2: Replace DEFAULT_AGENT**
```typescript
// File: src/stores/agents-store.ts
// Lines: 27-40 (replace entire DEFAULT_AGENT definition)
const DEFAULT_AGENT: Agent = {
    id: 'agt_default_001',
    name: 'Via-Gent Coder',
    description: 'Default AI coding assistant powered by Devstral via OpenRouter',
    providerId: 'openrouter',
    modelId: 'mistralai/devstral-2512:free',
    systemPrompt: 'You are an expert frontend developer specializing in React and TypeScript.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    tools: DEFAULT_TOOLS,
    workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,
    status: 'online',
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
};
```

**Change 3: Update Test Mocks**
- Update all test files to use new schema
- Replace role → description
- Replace provider → providerId
- Replace model → modelId
- Add missing fields to mocks

**Expected Test Results (GREEN Phase)**:
- ✅ All tests PASS
- ✅ TypeScript compiles (0 Agent errors)

### Phase 3: Refactor (CLEANUP Phase)

**Refactoring Opportunities**:
1. Extract default agent configuration to constants file
2. Create factory function for default agent creation
3. Add validation helpers for schema compliance

**Example Refactoring**:
```typescript
// File: src/stores/agents-store.ts
// AFTER tests pass, consider refactoring:

import { createDefaultAgent } from '@/lib/agent/factories/agent-factory';

const DEFAULT_AGENT = createDefaultAgent();
```

---

## Validation Gates

### Gate 1: Pre-Implementation Validation ✅ NOW

**Checks**:
- [x] Story created with clear acceptance criteria
- [x] Root cause analysis complete
- [x] All affected files identified
- [x] Dependencies mapped (constants, imports)
- [x] Test scenarios defined
- [x] Implementation plan documented

**Decision**: ✅ PROCEED to story context creation

---

### Gate 2: Story Context Validation (PENDING)

**Before Implementation**:
- [ ] Story context document created
- [ ] Full dependency graph mapped
- [ ] UI/UX impact assessed
- [ ] Cross-workspace impact verified
- [ ] Rollback strategy documented
- [ ] Risk assessment complete

**Decision**: PENDING story context review

---

### Gate 3: Pre-Implementation Validation (PENDING)

**Before ANY Code Changes**:
- [ ] Feature branch created
- [ ] Current state committed
- [ ] IndexedDB backup exported
- [ ] All stakeholders notified
- [ ] TypeScript baseline documented

**Decision**: PENDING preparation

---

### Gate 4: Post-Implementation Validation (PENDING)

**After Code Changes**:
- [ ] All unit tests pass (GREEN phase)
- [ ] TypeScript compiles (0 Agent errors)
- [ ] No circular dependencies
- [ ] Code review complete
- [ ] Manual tests pass (Phase 0 Gate)

**Decision**: PENDING implementation

---

## Risk Assessment

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking agent creation | 🟠 MEDIUM | 🔴 HIGH | TDD approach, tests first |
| Missing dependencies | 🟢 LOW | 🟠 MEDIUM | Dependency mapping complete |
| TypeScript errors | 🟠 MEDIUM | 🟡 MEDIUM | Incremental validation |
| Store initialization failure | 🟢 LOW | 🔴 HIGH | Manual testing required |
| Import path issues | 🟠 MEDIUM | 🟡 MEDIUM | Careful import management |

**Overall Risk**: 🟠 **MEDIUM-HIGH** (but CONTAINABLE with TDD)

---

## Definition of Done

**Code Complete**:
- [ ] DEFAULT_AGENT uses NEW schema
- [ ] All tests pass (unit + integration)
- [ ] TypeScript compiles (0 Agent errors)
- [ ] No regressions in agent creation

**Testing Complete**:
- [ ] Unit tests for DEFAULT_AGENT
- [ ] Integration tests for store
- [ ] Manual tests for agent UI
- [ ] Phase 0 Gate tests pass (4/4)

**Documentation Complete**:
- [ ] Code comments updated
- [ ] Story document complete
- [ ] Course correction created (if needed)

**Validation Complete**:
- [ ] Peer code review done
- [ ] All validation gates passed
- [ ] Sprint Change Proposal compliance verified

---

## Course Correction Triggers

**Auto-create course correction if**:
1. ❌ TypeScript has > 5 Agent-related errors after fix
2. ❌ Store initialization fails in browser
3. ❌ Agent creation UI broken
4. ❌ Phase 0 Gate tests fail (> 2 checks)
5. ❌ Circular dependencies detected
6. ❌ Performance regression (> 100ms slower)

**Course Correction Actions**:
- Pause implementation
- Root cause analysis of failure
- Create course correction story
- Re-validate approach
- Resume with corrected plan

---

## Success Metrics

**Technical Metrics**:
- TypeScript compilation: 0 Agent-related errors
- Test coverage: > 80% for agents-store
- Performance: Store initialization < 100ms
- Compatibility: All 4 workspaces functional

**Quality Metrics**:
- Code review approved
- No regressions detected
- Sprint Change Proposal compliance: 100%
- Documentation complete

**User Experience Metrics**:
- Agent creation works smoothly
- No confusing errors in UI
- Configuration persists correctly
- Cross-workspace consistency maintained

---

## Next Steps (After Story Approval)

1. **CREATE-STORY-CONTEXT**: Full dependency mapping and context document
2. **VALIDATION**: Review story context with stakeholders
3. **IMPLEMENTATION TDD**: Follow TDD cycle (RED → GREEN → REFACTOR)
4. **CODE-REVIEW**: Peer review with quality gates
5. **VALIDATION**: Execute all validation gates
6. **LOOP**: If issues found, create course correction story

---

## References

**Controlled Documents**:
- Sprint Change Proposal v2.0: `_bmad-output/sprint-change-proposal-2025-12-31.md`
- Comprehensive Architecture Synthesis: `_bmad-output/comprehensive-architecture-synthesis-2025-12-31.md`
- Execution Plan Phase 0: `_bmad-output/execution-plan-phase-0-2025-12-31.md`

**Related Stories**:
- (To be linked after sprint planning)

**Epics**:
- Sprint Change Proposal v2.0 - AC-02 Agent Configuration Vault

---

**Story Created**: 2025-12-31T19:30:00+07:00
**Author**: BMAD Master (bmad-core-bmad-master mode)
**Status**: DRAFT - AWAITING VALIDATION
**Next Phase**: CREATE-STORY-CONTEXT (after story approval)
