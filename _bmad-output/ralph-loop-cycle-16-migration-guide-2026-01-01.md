# Migration Guide: Agent Entity Methods to Domain Utilities

**Epic**: AC-1 (Store Consolidation)
**Story**: AC-1.5 (Fix Circular Dependencies)
**Date**: 2026-01-01
**Audience**: Developers working with Agent workspace bindings

## Overview

This guide explains how to migrate from expected OOP-style methods on the Agent entity to the new domain utility functions. This migration is part of resolving circular dependencies in the agent-selection-store.

## Background

### The Problem

The Agent entity is designed as a **pure interface** (data only), but some code expected OOP-style methods:

```typescript
// ❌ This doesn't work (Agent has no methods):
if (agent.isAvailableIn('knowledge')) {
  // ...
}
```

### The Solution

Domain utility functions that operate on Agent entities:

```typescript
// ✅ This works (functional style):
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

if (isAgentAvailableIn(agent, 'knowledge')) {
  // ...
}
```

## Quick Reference

| Old Method Call | New Utility Function | Import |
|----------------|---------------------|--------|
| `agent.isAvailableIn(workspaceType)` | `isAgentAvailableIn(agent, workspaceType)` | `@/domain/services/agent-workspace-utils` |
| `agent.isDefaultFor(workspaceType)` | `isAgentDefaultFor(agent, workspaceType)` | `@/domain/services/agent-workspace-utils` |
| (N/A - new) | `getAgentsForWorkspace(agents, workspaceType)` | `@/domain/services/agent-workspace-utils` |
| (N/A - new) | `getDefaultAgentForWorkspace(agents, workspaceType)` | `@/domain/services/agent-workspace-utils` |

## Migration Steps

### Step 1: Add Import Statement

**File**: Any file that needs to check Agent workspace availability

**Add this import**:
```typescript
import { isAgentAvailableIn, isAgentDefaultFor } from '@/domain/services/agent-workspace-utils';
```

**Location**: Top of file, after other `@/` imports

### Step 2: Replace Method Calls with Function Calls

#### Example 1: Check Single Agent Availability

**Before**:
```typescript
if (agent.isAvailableIn('knowledge')) {
  console.log('Agent available in Knowledge workspace');
}
```

**After**:
```typescript
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

if (isAgentAvailableIn(agent, 'knowledge')) {
  console.log('Agent available in Knowledge workspace');
}
```

#### Example 2: Filter Agents by Workspace

**Before** (hypothetical):
```typescript
const knowledgeAgents = agents.filter(agent => agent.isAvailableIn('knowledge'));
```

**After**:
```typescript
import { getAgentsForWorkspace } from '@/domain/services/agent-workspace-utils';

const knowledgeAgents = getAgentsForWorkspace(agents, 'knowledge');
```

#### Example 3: Find Default Agent

**Before** (hypothetical):
```typescript
const defaultAgent = agents.find(agent => agent.isDefaultFor('ide'));
```

**After**:
```typescript
import { getDefaultAgentForWorkspace } from '@/domain/services/agent-workspace-utils';

const defaultAgent = getDefaultAgentForWorkspace(agents, 'ide');
```

#### Example 4: Validate Agent Availability

**Before**:
```typescript
function setActiveAgent(agentId: string, workspaceType: WorkspaceType) {
  const agent = useAppStore.getState().getAgent(agentId);

  if (!agent.isAvailableIn(workspaceType)) {
    throw new Error(`Agent not available in ${workspaceType}`);
  }

  // ...
}
```

**After**:
```typescript
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

function setActiveAgent(agentId: string, workspaceType: WorkspaceType) {
  const agent = useAppStore.getState().getAgent(agentId);

  if (!isAgentAvailableIn(agent, workspaceType)) {
    throw new Error(`Agent not available in ${workspaceType}`);
  }

  // ...
}
```

## API Reference

### `isAgentAvailableIn(agent, workspaceType)`

Check if an agent is available in a specific workspace.

**Parameters**:
- `agent: Agent` - The agent entity to check
- `workspaceType: WorkspaceType` - The workspace type (`'ide' | 'knowledge' | 'study' | 'notes'`)

**Returns**: `boolean` - `true` if agent is available in workspace, `false` otherwise

**Business Rule**: Agent is available if it has a workspace binding with `isAvailable = true` for the given workspace type.

**Example**:
```typescript
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

const agent = useAppStore.getState().getAgent('agent-1');

if (isAgentAvailableIn(agent, 'knowledge')) {
  console.log('Agent available in Knowledge workspace');
} else {
  console.log('Agent NOT available in Knowledge workspace');
}
```

### `isAgentDefaultFor(agent, workspaceType)`

Check if an agent is marked as the default for a specific workspace.

**Parameters**:
- `agent: Agent` - The agent entity to check
- `workspaceType: WorkspaceType` - The workspace type

**Returns**: `boolean` - `true` if agent is marked as default for workspace, `false` otherwise

**Business Rule**: Agent is default if it has a workspace binding with `isDefault = true` for the given workspace type.

**Example**:
```typescript
import { isAgentDefaultFor } from '@/domain/services/agent-workspace-utils';

const agent = useAppStore.getState().getAgent('agent-2');

if (isAgentDefaultFor(agent, 'ide')) {
  console.log('Agent is default for IDE workspace');
}
```

### `getAgentsForWorkspace(agents, workspaceType)`

Filter a list of agents to only those available in a specific workspace.

**Parameters**:
- `agents: Agent[]` - List of agents to filter
- `workspaceType: WorkspaceType` - The workspace type to filter for

**Returns**: `Agent[]` - Array of agents available in the workspace

**Business Rule**: Returns all agents that have `isAvailable = true` for the given workspace type.

**Example**:
```typescript
import { getAgentsForWorkspace } from '@/domain/services/agent-workspace-utils';

const allAgents = useAppStore.getState().agents;
const knowledgeAgents = getAgentsForWorkspace(allAgents, 'knowledge');

console.log(`Found ${knowledgeAgents.length} agents for Knowledge workspace`);
```

### `getDefaultAgentForWorkspace(agents, workspaceType)`

Find the default agent for a specific workspace from a list of agents.

**Parameters**:
- `agents: Agent[]` - List of agents to search
- `workspaceType: WorkspaceType` - The workspace type to find default for

**Returns**: `Agent | null` - The default agent, or `null` if no default is set

**Business Rule**: Returns the first agent that has `isDefault = true` for the given workspace type, or `null` if none found.

**Example**:
```typescript
import { getDefaultAgentForWorkspace } from '@/domain/services/agent-workspace-utils';

const allAgents = useAppStore.getState().agents;
const defaultIdeAgent = getDefaultAgentForWorkspace(allAgents, 'ide');

if (defaultIdeAgent) {
  console.log(`Default IDE agent: ${defaultIdeAgent.name}`);
} else {
  console.log('No default agent set for IDE workspace');
}
```

## Common Migration Patterns

### Pattern 1: Conditional Rendering

**Before**:
```typescript
function AgentBadge({ agent, workspaceType }) {
  if (agent.isAvailableIn(workspaceType)) {
    return <Badge>Available</Badge>;
  }
  return null;
}
```

**After**:
```typescript
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

function AgentBadge({ agent, workspaceType }) {
  if (isAgentAvailableIn(agent, workspaceType)) {
    return <Badge>Available</Badge>;
  }
  return null;
}
```

### Pattern 2: Validation Functions

**Before**:
```typescript
function validateAgentForWorkspace(agent, workspaceType) {
  if (!agent.isAvailableIn(workspaceType)) {
    throw new Error(`Agent not available in ${workspaceType}`);
  }
}
```

**After**:
```typescript
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

function validateAgentForWorkspace(agent, workspaceType) {
  if (!isAgentAvailableIn(agent, workspaceType)) {
    throw new Error(`Agent not available in ${workspaceType}`);
  }
}
```

### Pattern 3: Filter Operations

**Before**:
```typescript
const availableAgents = agents.filter(agent =>
  agent.isAvailableIn(currentWorkspace)
);
```

**After**:
```typescript
import { getAgentsForWorkspace } from '@/domain/services/agent-workspace-utils';

const availableAgents = getAgentsForWorkspace(agents, currentWorkspace);
```

### Pattern 4: Find Operations

**Before**:
```typescript
const defaultAgent = agents.find(agent =>
  agent.isDefaultFor(currentWorkspace)
);
```

**After**:
```typescript
import { getDefaultAgentForWorkspace } from '@/domain/services/agent-workspace-utils';

const defaultAgent = getDefaultAgentForWorkspace(agents, currentWorkspace);
```

## Testing Your Migration

### Unit Tests

**Before**:
```typescript
describe('Agent availability', () => {
  it('should check if agent is available in workspace', () => {
    const agent = createMockAgent({
      workspaceBindings: [
        { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
      ]
    });

    expect(agent.isAvailableIn('knowledge')).toBe(true); // ❌ Error
  });
});
```

**After**:
```typescript
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';

describe('Agent availability', () => {
  it('should check if agent is available in workspace', () => {
    const agent = createMockAgent({
      workspaceBindings: [
        { workspaceType: 'knowledge', isAvailable: true, isDefault: false }
      ]
    });

    expect(isAgentAvailableIn(agent, 'knowledge')).toBe(true); // ✅ Works
  });
});
```

### Integration Tests

Test that stores can successfully use domain utilities:

```typescript
import { getAgentsForWorkspace } from '@/domain/services/agent-workspace-utils';

describe('Agent selection store', () => {
  it('should filter agents by workspace', () => {
    const agents = useAppStore.getState().agents;
    const knowledgeAgents = getAgentsForWorkspace(agents, 'knowledge');

    expect(knowledgeAgents.length).toBeGreaterThan(0);
    expect(knowledgeAgents.every(agent =>
      agent.workspaceBindings.some(b =>
        b.workspaceType === 'knowledge' && b.isAvailable
    )
    )).toBe(true);
  });
});
```

## Troubleshooting

### Error: "Property 'isAvailableIn' does not exist on type 'Agent'"

**Cause**: Trying to call method on Agent entity

**Solution**: Import and use domain utility function:
```typescript
// ❌ Wrong:
if (agent.isAvailableIn('knowledge')) { }

// ✅ Correct:
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';
if (isAgentAvailableIn(agent, 'knowledge')) { }
```

### Error: "Cannot find module '@/domain/services/agent-workspace-utils'"

**Cause**: File path incorrect or file not created yet

**Solution**: Verify file exists at `src/domain/services/agent-workspace-utils.ts`

### Error: "Argument of type 'Agent | null' is not assignable to parameter of type 'Agent'"

**Cause**: Passing null agent to utility function

**Solution**: Add null check before calling function:
```typescript
// ❌ Wrong:
isAgentAvailableIn(agent, 'knowledge') // agent might be null

// ✅ Correct:
if (agent && isAgentAvailableIn(agent, 'knowledge')) { }
```

## Benefits of This Migration

### 1. **Clean Architecture**
- Agent entity remains pure (data only)
- Business logic in domain service layer
- Follows Domain-Driven Design principles

### 2. **Testability**
- Pure functions easier to unit test
- No need to mock Agent methods
- Predictable inputs and outputs

### 3. **Reusability**
- Utilities can be used across multiple stores
- Single source of truth for business rules
- Consistent behavior across application

### 4. **Type Safety**
- Full TypeScript types
- Compile-time error checking
- Better IDE autocomplete

### 5. **Performance**
- No prototype chain lookups
- Function inlining optimizations
- O(1) lookups with early returns

## Rollback Plan

If issues arise, rollback steps:

1. **Remove domain utility imports**:
```typescript
// Remove these lines:
import { isAgentAvailableIn } from '@/domain/services/agent-workspace-utils';
```

2. **Restore method calls** (temporary workaround):
```typescript
// Add helper inline:
function isAgentAvailableIn(agent: Agent, workspaceType: WorkspaceType): boolean {
  return agent.workspaceBindings.some(b =>
    b.workspaceType === workspaceType && b.isAvailable
  );
}
```

3. **Report issues** to development team with:
- File where issue occurred
- Expected behavior
- Actual error message

## Additional Resources

- **Domain Service Pattern**: [DDD Reference](https://www.domainlanguage.com/ddd/reference/)
- **Agent Entity Definition**: `src/core/entities/Agent.ts`
- **Workspace Type Definition**: `src/domain/value-objects/workspace-type.ts`
- **Completion Report**: `ralph-loop-cycle-16-epic-ac-1-5-completion-2026-01-01.md`

## Questions?

If you have questions about this migration:

1. Check this guide's API Reference section
2. Review the completion report for architectural decisions
3. Check existing code in `agent-selection-store.ts` for examples
4. Consult with development team

---

**Last Updated**: 2026-01-01
**Epic**: AC-1 (Store Consolidation)
**Story**: AC-1.5 (Fix Circular Dependencies)
**Status**: ✅ Migration Guide Complete
