# Integration Test Plan: Agent Selection Store (AC-1.8)

**Epic**: AC-1 (Store Consolidation)
**Story**: AC-1.8 (Integration Testing)
**Date**: 2026-01-01
**Status**: ✅ TEST PLAN COMPLETE
**Test Type**: Integration Testing
**Scope**: Agent selection store with domain utilities

## Overview

This test plan validates that the circular dependency fixes in AC-1.5 work correctly across the entire application. Tests cover agent selection, workspace filtering, event emission, and persistence.

## Test Categories

### 1. Domain Utilities Unit Tests
### 2. Agent Selection Store Integration Tests
### 3. Cross-Workspace Event Tests
### 4. Persistence and Hydration Tests
### 5. Type Safety Tests

---

## 1. Domain Utilities Unit Tests

### File: `src/domain/services/__tests__/agent-workspace-utils.test.ts`

### Test 1.1: isAgentAvailableIn - Available Agent

**Scenario**: Agent with workspace binding (isAvailable: true) should return true

**Input**:
```typescript
const agent: Agent = {
  id: 'agent-1',
  name: 'Test Agent',
  workspaceBindings: [
    { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
  ]
};
```

**Expected Output**:
```typescript
isAgentAvailableIn(agent, 'knowledge') === true
```

**Test Code**:
```typescript
import { describe, it, expect } from 'vitest';
import { isAgentAvailableIn } from '../agent-workspace-utils';
import type { Agent } from '@/core/entities/Agent';

describe('isAgentAvailableIn', () => {
  it('should return true when agent is available in workspace', () => {
    const agent: Agent = {
      id: 'agent-1',
      name: 'Test Agent',
      description: 'Test',
      providerId: 'openrouter',
      modelId: 'gpt-4',
      systemPrompt: 'Test',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      tools: [],
      workspaceBindings: [
        { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
      ],
      status: 'online',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(isAgentAvailableIn(agent, 'knowledge')).toBe(true);
  });
});
```

### Test 1.2: isAgentAvailableIn - Unavailable Agent

**Scenario**: Agent without workspace binding should return false

**Input**:
```typescript
const agent: Agent = {
  workspaceBindings: [] // No bindings
};
```

**Expected Output**:
```typescript
isAgentAvailableIn(agent, 'knowledge') === false
```

### Test 1.3: isAgentDefaultFor - Default Agent

**Scenario**: Agent with isDefault: true should return true

**Input**:
```typescript
const agent: Agent = {
  workspaceBindings: [
    { workspaceType: 'ide', isAvailable: true, isDefault: true }
  ]
};
```

**Expected Output**:
```typescript
isAgentDefaultFor(agent, 'ide') === true
```

### Test 1.4: getAgentsForWorkspace - Filter by Workspace

**Scenario**: Filter mixed agent list to Knowledge workspace only

**Input**:
```typescript
const agents: Agent[] = [
  {
    id: 'agent-1',
    workspaceBindings: [
      { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
    ]
  },
  {
    id: 'agent-2',
    workspaceBindings: [
      { workspaceType: 'ide', isAvailable: true, isDefault: false }
    ]
  },
  {
    id: 'agent-3',
    workspaceBindings: [
      { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
    ]
  }
];
```

**Expected Output**:
```typescript
const knowledgeAgents = getAgentsForWorkspace(agents, 'knowledge');
expect(knowledgeAgents.length).toBe(2);
expect(knowledgeAgents.map(a => a.id)).toEqual(['agent-1', 'agent-3']);
```

### Test 1.5: getDefaultAgentForWorkspace - Find Default

**Scenario**: Find default agent for workspace from list

**Input**:
```typescript
const agents: Agent[] = [
  {
    id: 'agent-1',
    workspaceBindings: [
      { workspaceType: 'ide', isAvailable: true, isDefault: false }
    ]
  },
  {
    id: 'agent-2',
    workspaceBindings: [
      { workspaceType: 'ide', isAvailable: true, isDefault: true }
    ]
  }
];
```

**Expected Output**:
```typescript
const defaultAgent = getDefaultAgentForWorkspace(agents, 'ide');
expect(defaultAgent?.id).toBe('agent-2');
```

---

## 2. Agent Selection Store Integration Tests

### File: `src/infrastructure/persistence/stores/agents/__tests__/agent-selection-store.test.ts`

### Test 2.1: setActiveAgent - Valid Agent for Workspace

**Scenario**: Set active agent that is available in workspace

**Steps**:
1. Create mock agent with Knowledge workspace binding
2. Call `setActiveAgent('agent-1', 'knowledge')`
3. Verify `activeAgentId` is set
4. Verify `lastSelectedAgentIds.knowledge` is updated
5. Verify AGENT_SELECTED event is emitted

**Expected Output**:
```typescript
const store = useAgentSelectionStore.getState();

store.setActiveAgent('agent-1', 'knowledge');

expect(store.activeAgentId).toBe('agent-1');
expect(store.lastSelectedAgentIds.knowledge).toBe('agent-1');

// Verify event emission
eventBus.emit = vi.fn();
// ... event verification code
```

### Test 2.2: setActiveAgent - Invalid Agent (Not Available)

**Scenario**: Attempt to set agent that is NOT available in workspace

**Steps**:
1. Create mock agent with ONLY IDE workspace binding
2. Attempt to call `setActiveAgent('agent-1', 'knowledge')`
3. Verify error is thrown

**Expected Output**:
```typescript
const store = useAgentSelectionStore.getState();

expect(() => {
  store.setActiveAgent('agent-1', 'knowledge');
}).toThrow('Agent "Test Agent" is not available in workspace: knowledge');
```

### Test 2.3: getAgentForWorkspace - Business Rules Priority

**Scenario**: Verify business rules are applied in correct order

**Business Rules**:
1. Prefer workspace-specific default agent
2. Fall back to last selected agent for workspace
3. Fall back to first available agent marked as default
4. Fall back to first available agent

**Test Setup**:
```typescript
const agents: Agent[] = [
  {
    id: 'agent-1',
    workspaceBindings: [
      { workspaceType: 'knowledge', isAvailable: true, isDefault: true } // Marked default
    ]
  },
  {
    id: 'agent-2',
    workspaceBindings: [
      { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
    ]
  }
];

const store = useAgentSelectionStore.getState();

// Set workspace-specific default (highest priority)
store.setDefaultAgent('agent-2', 'knowledge');

// Rule 1: Workspace-specific default should win over marked default
const selected = store.getAgentForWorkspace('knowledge');
expect(selected?.id).toBe('agent-2'); // NOT agent-1 (even though agent-1 has isDefault: true)
```

### Test 2.4: selectAgentForWorkspace - Auto-Selection

**Scenario**: Automatically select best agent for workspace

**Steps**:
1. Call `selectAgentForWorkspace('knowledge')`
2. Verify `activeAgentId` is set
3. Verify AGENT_SELECTED event is emitted

**Expected Output**:
```typescript
const store = useAgentSelectionStore.getState();

store.selectAgentForWorkspace('knowledge');

expect(store.activeAgentId).toBeDefined();
expect(store.activeAgentId).toBe('expected-agent-id');
```

### Test 2.5: needsReselection - Active Agent Unavailable

**Scenario**: Check if reselection needed when switching workspaces

**Steps**:
1. Set active agent available in IDE workspace
2. Check `needsReselection('knowledge')`
3. Should return true (agent not available in Knowledge)

**Expected Output**:
```typescript
const store = useAgentSelectionStore.getState();

store.setActiveAgent('ide-only-agent', 'ide');

const needsReselection = store.needsReselection('knowledge');
expect(needsReselection).toBe(true);
```

---

## 3. Cross-Workspace Event Tests

### File: `src/infrastructure/events/__tests__/agent-selection-events.test.ts`

### Test 3.1: AGENT_SELECTED Event Emission

**Scenario**: Verify AGENT_SELECTED event contains correct payload

**Steps**:
1. Subscribe to AGENT_SELECTED event
2. Call `setActiveAgent('agent-1', 'knowledge')`
3. Verify event payload

**Expected Output**:
```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

const mockHandler = vi.fn();
eventBus.on(DomainEventType.AGENT_SELECTED, mockHandler);

const store = useAgentSelectionStore.getState();
store.setActiveAgent('agent-1', 'knowledge');

expect(mockHandler).toHaveBeenCalledWith(
  expect.objectContaining({
    type: DomainEventType.AGENT_SELECTED,
    payload: expect.objectContaining({
      agentId: 'agent-1',
      agentName: 'Test Agent',
      workspaceType: 'knowledge'
    })
  })
);
```

### Test 3.2: AGENT_DESELECTED Event Emission

**Scenario**: Verify AGENT_DESELECTED event when agent set to null

**Steps**:
1. Subscribe to AGENT_DESELECTED event
2. Set active agent to null
3. Verify event payload

**Expected Output**:
```typescript
const mockHandler = vi.fn();
eventBus.on(DomainEventType.AGENT_DESELECTED, mockHandler);

const store = useAgentSelectionStore.getState();
store.setActiveAgent(null, 'knowledge');

expect(mockHandler).toHaveBeenCalledWith(
  expect.objectContaining({
    type: DomainEventType.AGENT_DESELECTED,
    payload: expect.objectContaining({
      workspaceType: 'knowledge'
    })
  })
);
```

### Test 3.3: DEFAULT_AGENT_CHANGED Event Emission

**Scenario**: Verify DEFAULT_AGENT_CHANGED event when default is changed

**Steps**:
1. Subscribe to DEFAULT_AGENT_CHANGED event
2. Call `setDefaultAgent('agent-2', 'knowledge')`
3. Verify event payload

**Expected Output**:
```typescript
const mockHandler = vi.fn();
eventBus.on(DomainEventType.DEFAULT_AGENT_CHANGED, mockHandler);

const store = useAgentSelectionStore.getState();
store.setDefaultAgent('agent-2', 'knowledge');

expect(mockHandler).toHaveBeenCalledWith(
  expect.objectContaining({
    type: DomainEventType.DEFAULT_AGENT_CHANGED,
    payload: expect.objectContaining({
      agentId: 'agent-2',
      agentName: 'Test Agent 2',
      workspaceType: 'knowledge'
    })
  })
);
```

---

## 4. Persistence and Hydration Tests

### File: `src/infrastructure/persistence/stores/agents/__tests__/agent-selection-persistence.test.ts`

### Test 4.1: Persistence - Active Agent ID

**Scenario**: Verify activeAgentId is persisted to IndexedDB

**Steps**:
1. Set active agent
2. Trigger persist middleware
3. Query IndexedDB for stored value
4. Verify data integrity

**Expected Output**:
```typescript
const store = useAgentSelectionStore.getState();
store.setActiveAgent('agent-1', 'knowledge');

// Wait for persist
await new Promise(resolve => setTimeout(resolve, 100));

// Query Dexie
const storedData = await db.agentSelection.get('activeAgentId');
expect(storedData).toBe('agent-1');
```

### Test 4.2: Hydration - Valid Agent IDs

**Scenario**: Verify hydration validates agent IDs against current agent list

**Steps**:
1. Manually insert stale agent ID into IndexedDB
2. Reload store (trigger hydration)
3. Verify stale ID is cleared
4. Verify no errors thrown

**Expected Output**:
```typescript
// Insert stale data
await db.agentSelection.bulkPut([
  { key: 'activeAgentId', value: 'deleted-agent-id' }
]);

// Trigger hydration
window.location.reload(); // Or manual hydration trigger

// Verify stale ID cleared
const store = useAgentSelectionStore.getState();
expect(store.activeAgentId).toBeNull();
```

### Test 4.3: Selective Persistence - Partialize

**Scenario**: Verify only critical data is persisted

**Persisted Data**:
- ✅ `activeAgentId`
- ✅ `defaultAgentIds`
- ✅ `lastSelectedAgentIds`

**Not Persisted**:
- ❌ `_hasHydrated` (ephemeral runtime flag)

**Test Code**:
```typescript
const store = useAgentSelectionStore.getState();

store.setHasHydrated(true); // Set ephemeral flag

await new Promise(resolve => setTimeout(resolve, 100));

// Query all stored data
const allData = await db.agentSelection.toArray();
const keys = allData.map(d => d.key);

// _hasHydrated should NOT be in stored keys
expect(keys).not.toContain('_hasHydrated');

// But activeAgentId SHOULD be present
expect(keys).toContain('activeAgentId');
```

---

## 5. Type Safety Tests

### File: `src/infrastructure/persistence/stores/agents/__tests__/agent-selection-types.test.ts`

### Test 5.1: AgentSelectionState Interface Completeness

**Scenario**: Verify all methods are declared in interface

**Check**:
```typescript
import type { AgentSelectionState } from '../agent-selection-store';

const state: AgentSelectionState = {
  // State properties
  activeAgentId: null,
  defaultAgentIds: { ide: null, knowledge: null, study: null, notes: null },
  lastSelectedAgentIds: { ide: null, knowledge: null, study: null, notes: null },
  _hasHydrated: false,

  // All 12 methods must be present
  setActiveAgent: vi.fn(),
  setDefaultAgent: vi.fn(),
  getActiveAgent: vi.fn(),
  getAgentForWorkspace: vi.fn(),
  selectAgentForWorkspace: vi.fn(),
  needsReselection: vi.fn(),
  emitAgentSelected: vi.fn(),
  emitAgentDeselected: vi.fn(),
  emitDefaultAgentChanged: vi.fn(),
  setHasHydrated: vi.fn(),
  reset: vi.fn(),
};

// If this compiles, interface is complete
expect(true).toBe(true);
```

### Test 5.2: WorkspaceType Consistency

**Scenario**: Verify all workspace types are consistent

**Check**:
```typescript
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

const validTypes: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];

const store = useAgentSelectionStore.getState();

// All workspace operations should accept valid types
validTypes.forEach(workspaceType => {
  expect(() => {
    store.selectAgentForWorkspace(workspaceType);
    store.needsReselection(workspaceType);
    store.getAgentForWorkspace(workspaceType);
  }).not.toThrow();
});
```

---

## Test Execution Plan

### Phase 1: Unit Tests (Immediate)
- **Duration**: 1 hour
- **Files**:
  - `src/domain/services/__tests__/agent-workspace-utils.test.ts`
- **Command**:
```bash
pnpm test src/domain/services/__tests__/agent-workspace-utils.test.ts
```

### Phase 2: Integration Tests (After AC-1.8)
- **Duration**: 2 hours
- **Files**:
  - `src/infrastructure/persistence/stores/agents/__tests__/agent-selection-store.test.ts`
  - `src/infrastructure/events/__tests__/agent-selection-events.test.ts`
- **Command**:
```bash
pnpm test src/infrastructure/persistence/stores/agents/__tests__
pnpm test src/infrastructure/events/__tests__
```

### Phase 3: Persistence Tests (After Phase 2)
- **Duration**: 1.5 hours
- **Files**:
  - `src/infrastructure/persistence/stores/agents/__tests__/agent-selection-persistence.test.ts`
- **Command**:
```bash
pnpm test src/infrastructure/persistence/stores/agents/__tests__/agent-selection-persistence.test.ts
```

### Phase 4: Type Safety Tests (Continuous)
- **Duration**: 0.5 hours
- **Command**:
```bash
pnpm tsc --noEmit
```

### Total Estimated Time: 5 hours

---

## Manual Testing Checklist

### UI Testing

#### 1. Agent Selection in AgentConfigDialog
- [ ] Open AgentConfigDialog
- [ ] Select agent from dropdown
- [ ] Verify agent is available in current workspace
- [ ] Verify no console errors

#### 2. Workspace Switching
- [ ] Set active agent in IDE workspace
- [ ] Switch to Knowledge workspace
- [ ] Verify agent is reselected if available
- [ ] Verify agent is deselected if not available

#### 3. Default Agent Configuration
- [ ] Set default agent for workspace
- [ ] Switch away and back to workspace
- [ ] Verify default agent is auto-selected

### Console Testing

#### 1. Event Emission Verification
```typescript
// Open browser console
// Run:
const { eventBus, DomainEventType } = window;

eventBus.on(DomainEventType.AGENT_SELECTED, (event) => {
  console.log('AGENT_SELECTED:', event.payload);
});

// Trigger agent selection in UI
// Verify console log appears
```

#### 2. Store State Inspection
```typescript
// Open browser console
// Run:
const { useAgentSelectionStore } = window;

const state = useAgentSelectionStore.getState();
console.log('Active Agent ID:', state.activeAgentId);
console.log('Default Agents:', state.defaultAgentIds);
console.log('Last Selected:', state.lastSelectedAgentIds);
```

---

## Success Criteria

### Unit Tests
- ✅ All domain utility tests pass
- ✅ 100% code coverage for agent-workspace-utils.ts
- ✅ No TypeScript errors

### Integration Tests
- ✅ All agent selection store tests pass
- ✅ Event emission tests pass
- ✅ Persistence tests pass
- ✅ No circular dependency errors

### Manual Testing
- ✅ Agent selection works across all workspaces
- ✅ Workspace switching triggers correct events
- ✅ Default agent configuration persists
- ✅ No console errors or warnings

### Type Safety
- ✅ Zero TypeScript errors in agent-selection-store.ts
- ✅ All workspace types consistent
- ✅ AgentSelectionState interface complete

---

## Known Issues and Workarounds

### Issue 1: Persist Middleware Type Coercions

**Status**: Intentional workaround (see AC-1.5 completion report)

**TypeScript Errors**:
- Line 348: `storage as any`
- Line 349: `partialize as any`

**Workaround**: Accept these warnings as intentional
**Long-term Solution**: Create proper type wrappers for Dexie storage

### Issue 2: onRehydrateStorage Complex Signature

**Status**: Resolved in AC-1.5

**Fix**: Changed from `(state) => {` to `() => (state) => {`

### Issue 3: Workspace Type Consistency

**Status**: Resolved in AC-1.5

**Fix**: Replaced all `canvas` references with `notes`

---

## Test Data

### Mock Agents

```typescript
export const mockAgents: Agent[] = [
  {
    id: 'agent-ide-default',
    name: 'IDE Default Agent',
    description: 'Default agent for IDE workspace',
    providerId: 'openrouter',
    modelId: 'gpt-4',
    systemPrompt: 'You are an IDE assistant',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    tools: [],
    workspaceBindings: [
      { workspaceType: 'ide', isAvailable: true, isDefault: true },
      { workspaceType: 'knowledge', isAvailable: false, isDefault: false }
    ],
    status: 'online',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'agent-knowledge',
    name: 'Knowledge Agent',
    description: 'Agent for Knowledge workspace',
    providerId: 'anthropic',
    modelId: 'claude-3-opus',
    systemPrompt: 'You are a knowledge synthesis assistant',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1.0,
    tools: [],
    workspaceBindings: [
      { workspaceType: 'ide', isAvailable: false, isDefault: false },
      { workspaceType: 'knowledge', isAvailable: true, isDefault: true },
      { workspaceType: 'study', isAvailable: true, isDefault: false },
      { workspaceType: 'notes', isAvailable: true, isDefault: false }
    ],
    status: 'online',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];
```

---

## References

- **AC-1.5 Completion Report**: `ralph-loop-cycle-16-epic-ac-1-5-completion-2026-01-01.md`
- **Migration Guide**: `ralph-loop-cycle-16-migration-guide-2026-01-01.md`
- **Domain Utilities**: `src/domain/services/agent-workspace-utils.ts`
- **Agent Selection Store**: `src/infrastructure/persistence/stores/agents/agent-selection-store.ts`

---

**Status**: ✅ TEST PLAN COMPLETE
**Next Steps**: Execute test plan, create test files, run test suites
**Estimated Time**: 5 hours total
**Priority**: P1 (AC-1.8 required for Epic AC-1 completion)
