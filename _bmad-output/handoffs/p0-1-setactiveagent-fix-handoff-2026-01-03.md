---
date: 2026-01-03
time: 12:30:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1091
type: critical-fix-handoff
---

# P0-1 Handoff: Fix setActiveAgent Implementation

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P0 - Critical (Blocks Core Functionality)
**Estimate**: 2 hours
**Location**: `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx:128-136`

## Problem Statement

The `WorkspaceProvider` component has a TODO stub for `setActiveAgent` that only logs a warning instead of actually setting the active agent. This breaks agent selection across all workspaces.

**Current Broken Code** (lines 128-136):
```typescript
agents: {
    activeAgentId: null, // TODO: Add activeAgentId to agents store
    agents: appStore.agents,
    addAgent: appStore.addAgent,
    updateAgent: appStore.updateAgent,
    removeAgent: appStore.removeAgent,
    setActiveAgent: (_id: string) => {
        // TODO: Implement setActiveAgent
        console.warn('[WorkspaceProvider] setActiveAgent not yet implemented');
    },
},
```

## Root Cause Analysis

The `WorkspaceProvider` is trying to expose agent functionality but is missing the integration with `useAgentSelectionStore`, which is the proper source of truth for active agent selection.

**Existing Store**: `src/infrastructure/persistence/stores/agents/agent-selection-store.ts`
- Has `activeAgentId` state
- Has `setActiveAgent(agentId: string | null, workspaceType: WorkspaceType)` method
- Manages per-workspace agent selection with proper event emission
- Validates agent availability before setting
- Emits `AGENT_SELECTED` and `AGENT_DESELECTED` events

## Implementation Plan

### Step 1: Import useAgentSelectionStore (5 minutes)

Add to imports at top of workspace-provider.tsx:
```typescript
import { useAgentSelectionStore } from '../agents/agent-selection-store';
```

### Step 2: Add activeAgentId from agent selection store (10 minutes)

Replace line 128 with:
```typescript
activeAgentId: agentSelectionStore.activeAgentId,
```

### Step 3: Implement setActiveAgent method (30 minutes)

Replace lines 133-136 with:
```typescript
setActiveAgent: (agentId: string) => {
    const { currentWorkspace } = workspaceStore;
    if (!currentWorkspace) {
        console.warn('[WorkspaceProvider] Cannot set active agent: no current workspace');
        return;
    }
    agentSelectionStore.setActiveAgent(agentId, currentWorkspace);
},
```

**Why This Works**:
- Gets current workspace from workspaceStore state
- Delegates to agentSelectionStore which handles validation, persistence, and events
- Maintains single source of truth pattern
- No need to duplicate validation logic

### Step 4: Expose additional agent selection helpers (15 minutes)

For better UX, also expose:
```typescript
getActiveAgent: () => agentSelectionStore.getActiveAgent(),
getAgentForWorkspace: (workspaceType: WorkspaceType) =>
    agentSelectionStore.getAgentForWorkspace(workspaceType),
```

### Step 5: Add getActiveAgent to context interface (10 minutes)

Update `workspace-context.ts` to include the new methods in `WorkspaceContextValue` interface.

### Step 6: Test integration (30 minutes)

**Manual Testing Steps**:
1. Start dev server: `pnpm dev`
2. Navigate to Hub page
3. Use agent selector dropdown in any workspace
4. Verify agent selection persists when switching workspaces
5. Check console for `AGENT_SELECTED` events
6. Verify each workspace remembers its last selected agent

**Expected Behavior**:
- Selecting agent in IDE workspace should persist when switching to Knowledge
- Switching back to IDE should show previously selected agent
- Console should show: `[AgentSelectionStore] Agent selected: {name} for workspace: {type}`

### Step 7: Code validation (20 minutes)

```bash
# Run TypeScript check
pnpm tsc --noEmit 2>&1 | grep -v "test\|spec" | grep "error" | wc -l
# Expected: 0 production errors

# Verify no new ESLint warnings
pnpm eslint src/infrastructure/persistence/stores/workspace/workspace-provider.tsx
```

## Constraints & Safeguards

### DO NOT:
- ❌ Duplicate agent validation logic (already in agentSelectionStore)
- ❌ Create new state variables for activeAgentId (use existing store)
- ❌ Break existing agent selection UI components
- ❌ Remove or modify agent-selection-store.ts

### MUST:
- ✅ Delegate to agentSelectionStore for all agent selection operations
- ✅ Get currentWorkspace from workspaceStore before calling setActiveAgent
- ✅ Preserve existing event emissions (AGENT_SELECTED, AGENT_DESELECTED)
- ✅ Maintain backward compatibility with WorkspaceContext interface
- ✅ Add JSDoc comments to new methods

### Validation Checklist:
- [ ] Import added for useAgentSelectionStore
- [ ] activeAgentId sourced from agentSelectionStore.activeAgentId
- [ ] setActiveAgent delegates to agentSelectionStore.setActiveAgent
- [ ] getActiveAgent helper added and functional
- [ ] getAgentForWorkspace helper added and functional
- [ ] WorkspaceContext interface updated with new methods
- [ ] Zero TypeScript errors in production files
- [ ] Manual test passes: agent selection persists across workspace switches
- [ ] Console shows proper event emissions
- [ ] JSDoc comments added to all public methods

## MCP Research Required (minimum 2 tool uses):

### Context7:
- Query Zustand v5 documentation for best practices on store composition
- Query React Context patterns for proper type exports

### Deepwiki:
- Search TanStack Router repo for workspace context patterns
- Search zustand repo for store integration patterns

## Output Location

Report completion to:
```
_bmad-output/p0-1-setactiveagent-fix-completion-2026-01-03.md
```

Include:
- Code diff showing changes made
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (agent selection works across workspaces)
- Screenshot of console showing AGENT_SELECTED events
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P0-1 completion status (SUCCESS/BLOCKED)
2. Files modified count
3. Verification results (manual test passed/failed)
4. Next action recommendation (proceed to P0-2 or address issues)

---

**Handoff Created**: 2026-01-03T12:30:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1091
**Team**: Team A
**Priority**: P0 CRITICAL - Agent Selection Broken Across All Workspaces
