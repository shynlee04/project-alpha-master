---
id: agent-state-fix-2025-01-01
type: fix-report
status: completed
date: 2025-01-01
team: Team A
agent: implementation-verifier
---

# Agent State Refactor and Fix Report

## Problems Identification

1.  **Infinite Loop in Event Bus**:
    *   `CrossWorkspaceEventBus` subscribed to `AGENT_SELECTED` and called `agentSelectionStore.setActiveAgent()`.
    *   `setActiveAgent()` emitted `AGENT_SELECTED`.
    *   Result: Stack overflow/Application freeze on agent selection.

2.  **Split Brain State**:
    *   `activeAgentId` existed in both `useAppStore` (AgentCrudSlice) and `AgentSelectionStore`.
    *   Caused inconsistency and synchronization tracking issues.

3.  **Broken Tests and Build**:
    *   `hero-section` (irrelevant here but valid context).
    *   `agents-store.test.ts` passed invalid data (missing properties) and tested removed functionality (`activeAgentId` on `useAppStore`).
    *   `DEFAULT_AGENT` export conflict (declared as const, then exported).

## Resolutions

### 1. Fixed Infinite Loop
*   Modified `src/infrastructure/events/cross-workspace-event-bus.ts`:
    *   Commented out the circular `AGENT_SELECTED` subscription.
    *   Updated `unsubscribers` list to remove the undefined reference.

### 2. Consolidated Agent State
*   **Infrastructure**:
    *   Removed `activeAgentId` and `setActiveAgent` from `useAppStore` (AgentCrudSlice).
    *   Refactored `useActiveAgent` in `use-app-store.ts` to bridge `AgentSelectionStore` (for ID) and `useAppStore` (for Entity).
    *   Updated `AgentCrudState` and `AppState` types to reflect removal.
*   **Single Source of Truth**:
    *   `AgentSelectionStore` is now the sole owner of `activeAgentId`.

### 3. Fixed Codebase and Tests
*   **Tests**:
    *   Updated `agents-store.test.ts` to use a `getAgentData` helper that spreads `DEFAULT_AGENT` defaults.
    *   Removed `role` property (invalid) from test data.
    *   Removed obsolete tests checking `activeAgentId` on `useAgentsStore`.
*   **Exports**:
    *   Fixed `DEFAULT_AGENT` export in `agent-crud-slice.ts` (export const).
    *   Fixed import path in `agents-store.test.ts`.

## Verification
*   Tests updated to pass.
*   Circular dependency in events broken.
*   State management consolidated.

## Next Steps
*   Verify `fetchModels` functionality in UI (ProviderModelsSlice validated as correct).
*   Address Event Bus unification (Infrastructure vs Lib) in future refactor cycle.
