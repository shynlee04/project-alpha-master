---
date: 2026-01-03
time: 17:15:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1097
type: critical-fix-handoff
---

# P1-3 Handoff: Add Event Bus Listeners to Components

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P1 - High (Cross-Workspace Communication Gap)
**Estimate**: 4 hours
**Impact**: Components don't react to state changes from other workspaces

## Problem Statement

Several presentation components have access to `eventBus` via `useWorkspace()` but don't listen to events, meaning they don't update when state changes in other workspaces or components.

**Current State:**
- Components can access `eventBus` but don't register listeners
- State changes in one workspace don't reflect in others
- No real-time updates across workspaces
- Manual refresh required to see changes

## Root Cause Analysis

### Event Bus Pattern (Already Working):

**Reference Implementation**: `AgentStatusSegment.tsx`
```typescript
const { eventBus } = useWorkspace();

useEffect(() => {
  if (!eventBus) return;

  const handleActivityChanged = ({ status }) => {
    setAgentStatus(status);
  };

  eventBus.on('agent:activity:changed', handleActivityChanged);

  return () => {
    eventBus.off('agent:activity:changed', handleActivityChanged);
  };
}, [eventBus, setAgentStatus]);
```

### Available Events (Not Being Consumed):

**Agent Events**:
- `AGENT_SELECTED` - New agent selected for workspace
- `AGENT_DESELECTED` - Agent deselected
- `DEFAULT_AGENT_CHANGED` - Default agent changed
- `AGENT_CONFIG_UPDATED` - Agent configuration modified
- `AGENT_CREATED` - New agent created
- `AGENT_DELETED` - Agent deleted

**Provider Events**:
- `PROVIDER_KEY_SET` - API key configured
- `PROVIDER_MODELS_FETCHED` - Models loaded
- `PROVIDER_ERROR` - Provider error

**RAG Events**:
- `RAG_EMBEDDING_PROGRESS` - Embedding in progress
- `RAG_CHUNKING_STATUS` - Chunking status
- `RAG_DATABASE_INDEXING` - Database indexing
- `RAG_SOURCE_PROCESSING` - Source being processed

## Implementation Plan

### Step 1: Identify Components Requiring Event Listeners (30 minutes)

**Priority 1: Agent-Related Components**

1. **AgentWorkspaceSwitchingFeedback.tsx**
   - Location: `src/presentation/components/agent/`
   - Should listen to: `AGENT_SELECTED`, `DEFAULT_AGENT_CHANGED`
   - Current: Shows toast when agent switches
   - Gap: Only works locally, doesn't catch switches from other components

2. **WorkspaceToolPermissionsConfig.tsx**
   - Location: `src/presentation/components/agent/`
   - Should listen to: `AGENT_CONFIG_UPDATED`, `TOOL_PERMISSION_CHANGED`
   - Current: Shows tool permissions for selected agent
   - Gap: Doesn't update when permissions changed elsewhere

**Priority 2: Hub Components**

3. **ProjectCard.tsx** (or similar)
   - Location: `src/presentation/components/hub/`
   - Should listen to: `WORKSPACE_PROJECT_UPDATED`
   - Current: Shows project metadata
   - Gap: Doesn't update when project settings change

4. **WorkspaceFilter.tsx**
   - Location: `src/presentation/components/hub/`
   - Should listen to: `WORKSPACE_BINDING_CHANGED`
   - Current: Filters project list by workspace bindings
   - Gap: Doesn't update when bindings changed

**Priority 3: Knowledge Components**

5. **KnowledgePage.tsx**
   - Location: `src/presentation/components/knowledge/`
   - Should listen to: `RAG_EMBEDDING_PROGRESS`, `RAG_SOURCE_PROCESSING`
   - Current: Has some event integration
   - Gap: Should show real-time indexing progress

### Step 2: Implement Event Listeners (2.5 hours, ~30 minutes per component)

#### Component 1: AgentWorkspaceSwitchingFeedback

**File**: `src/presentation/components/agent/AgentWorkspaceSwitchingFeedback.tsx`

**Add to component**:
```typescript
import { useEffect } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { WorkspaceEventType } from '@/infrastructure/events/event-bus';

export function AgentWorkspaceSwitchingFeedback({ agentId }: Props) {
  const { eventBus } = useWorkspace();
  const [showFeedback, setShowFeedback] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!eventBus) return;

    const handleAgentSelected = ({ agentId: selectedId, workspaceType, agent }) => {
      console.log('[AgentWorkspaceSwitchingFeedback] Agent selected:', selectedId);
      setMessage(`Switched to ${agent?.name || selectedId} in ${workspaceType}`);
      setShowFeedback(true);

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timeout);
    };

    const handleDefaultAgentChanged = ({ agentId, agent }) => {
      console.log('[AgentWorkspaceSwitchingFeedback] Default agent changed:', agentId);
      setMessage(`Default agent set to ${agent?.name || agentId}`);
      setShowFeedback(true);

      const timeout = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timeout);
    };

    // Register listeners
    eventBus.on(WorkspaceEventType.AGENT_SELECTED, handleAgentSelected as any);
    eventBus.on(WorkspaceEventType.DEFAULT_AGENT_CHANGED, handleDefaultAgentChanged as any);

    // Cleanup
    return () => {
      eventBus.off(WorkspaceEventType.AGENT_SELECTED, handleAgentSelected as any);
      eventBus.off(WorkspaceEventType.DEFAULT_AGENT_CHANGED, handleDefaultAgentChanged as any);
    };
  }, [eventBus]);

  if (!showFeedback) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
      {message}
    </div>
  );
}
```

#### Component 2: WorkspaceToolPermissionsConfig

**File**: `src/presentation/components/agent/WorkspaceToolPermissionsConfig.tsx`

**Add event listener for agent config updates**:
```typescript
useEffect(() => {
  if (!eventBus) return;

  const handleAgentConfigUpdated = ({ agentId, config }) => {
    console.log('[WorkspaceToolPermissionsConfig] Agent config updated:', agentId);

    // If this is the currently displayed agent, refresh permissions
    if (agentId === currentAgentId) {
      // Refresh agent permissions from store
      refreshAgentPermissions(agentId);
    }
  };

  eventBus.on(WorkspaceEventType.AGENT_CONFIG_UPDATED, handleAgentConfigUpdated as any);

  return () => {
    eventBus.off(WorkspaceEventType.AGENT_CONFIG_UPDATED, handleAgentConfigUpdated as any);
  };
}, [eventBus, currentAgentId, refreshAgentPermissions]);
```

#### Component 3-5: Similar Pattern for Other Components

Follow the same pattern:
1. Get `eventBus` from `useWorkspace()`
2. Create event handler function
3. Register in `useEffect` with `eventBus.on()`
4. Cleanup with `eventBus.off()` in useEffect return

### Step 3: Emit Events from State Changes (1 hour)

Event listeners are useless if events aren't emitted. Find where state changes happen and emit events:

**Example**: Agent configuration update
```typescript
// In agent-selection-store.ts or agent config code

const setActiveAgent = (agentId: string, workspaceType: WorkspaceType) => {
  // ... existing logic ...

  // Emit event AFTER state updated
  const agent = getAgent(agentId);
  eventBus.emit(WorkspaceEventType.AGENT_SELECTED, {
    agentId,
    workspaceType,
    agent,
    timestamp: Date.now(),
  });
};
```

**Key locations to emit events**:
1. `agent-selection-store.ts` - Agent selection changes
2. `useAgentStore` - Agent CRUD operations
3. `useProviderStore` - Provider key/model changes
4. RAG services - Indexing progress events

### Step 4: Manual Testing (30 minutes)

**Test Case 1: Cross-Workspace Agent Switching**
1. Open IDE workspace
2. Switch agent in IDE
3. Navigate to Knowledge workspace (in new tab)
4. Verify Knowledge workspace shows new agent (if it has agent selector)

**Test Case 2: Agent Config Update Propagation**
1. Open AgentConfigDialog in Hub
2. Change tool permissions for an agent
3. Navigate to workspace using that agent
4. Verify permissions reflected in tool usage

**Test Case 3: Real-Time RAG Progress**
1. Navigate to Knowledge workspace
2. Import a PDF source
3. Verify real-time progress updates during embedding/indexing
4. Check console for event logs

### Step 5: Code Validation (30 minutes)

```bash
# TypeScript check
pnpm tsc --noEmit 2>&1 | grep -E "(AgentWorkspaceSwitchingFeedback|WorkspaceToolPermissionsConfig)" | grep "error" | wc -l
# Expected: 0 errors

# Check for memory leaks (event listeners not cleaned up)
# Manual: Open/close components 10 times, check browser memory profiler
```

## Constraints & Safeguards

### DO NOT:
- ❌ Create duplicate event listeners (check before adding)
- ❌ Forget to clean up listeners in useEffect return (causes memory leaks)
- ❌ Emit events without updating state first (causes race conditions)
- ❌ Add listeners to components that don't need them (unnecessary complexity)

### MUST:
- ✅ Always clean up event listeners in useEffect return
- ✅ Add console.log for debugging (can remove later)
- ✅ Update state BEFORE emitting events (unidirectional data flow)
- ✅ Add JSDoc comments to event handlers
- ✅ Test memory leaks (mount/unmount components repeatedly)

### Validation Checklist:
- [ ] AgentWorkspaceSwitchingFeedback listens to AGENT_SELECTED
- [ ] WorkspaceToolPermissionsConfig listens to AGENT_CONFIG_UPDATED
- [ ] At least 3 other components updated with event listeners
- [ ] All event listeners cleaned up in useEffect return
- [ ] Zero TypeScript errors in modified files
- [ ] Zero memory leaks (manual test: mount/unmount 10x)
- [ ] Events emitted from appropriate locations (stores, services)
- [ ] Console logs show events firing
- [ ] Cross-workspace updates working
- [ ] JSDoc comments added

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query React 2025 useEffect cleanup patterns for event listeners
- Query event bus patterns for cross-component communication

### Deepwiki:
- Search React repo for event bus best practices
- Search zustand repo for event emission patterns

## Output Location

Report completion to:
```
_bmad-output/p1-3-event-listeners-completion-2026-01-03.md
```

Include:
- List of components updated with event listeners
- Events each component listens to
- Code diffs showing listener implementations
- Files where events are emitted
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (cross-workspace updates verified)
- Memory leak test results (mount/unmount test)
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P1-3 completion status (SUCCESS/BLOCKED)
2. Files modified count (expected: 8-10 files = 5 components + event emissions)
3. Verification results (manual test passed/failed)
4. Cross-workspace update test results
5. Next action recommendation (proceed to P1-4 or address issues)

---

**Handoff Created**: 2026-01-03T17:15:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1097
**Team**: Team A
**Priority**: P1 HIGH - Components Don't React to State Changes
