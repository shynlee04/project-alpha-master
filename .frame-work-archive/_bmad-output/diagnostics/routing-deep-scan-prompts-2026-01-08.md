# Routing & Project Management Deep Diagnostic

**Created:** 2026-01-08T11:33:00+07:00
**Status:** Diagnostic Phase
**Priority:** P0 - Critical

## Problem Summary

The application has multiple conflicting systems for:
1. Project creation (wizard, temp projects, auto-creation)
2. Workspace routing (notes, ide, knowledge, study)
3. Project selection (multiple selectors, binding logic)
4. Cross-workspace state synchronization (event bus, store updates)

These systems cause **Maximum update depth exceeded** errors (infinite loops) due to:
- Conflicting navigation triggers
- State updates triggering re-renders → triggering more state updates
- `useLiveQuery` subscription mechanism conflicting with React render cycle

---

## Sub-Agent Prompts

### PROMPT 1: Route Definition Analysis

```
OBJECTIVE: Map all TanStack Router routes and identify conflicting redirect patterns.

SCOPE:
- src/routes/*.tsx
- src/routes/*.lazy.tsx

TASKS:
1. List ALL route definitions (path, component, loader, search params)
2. Identify routes that perform redirects (navigate, redirect, Router.Navigate)
3. Map the redirect chains: A → B → C → A (find cycles)
4. Document route search params (?workspace=, ?action=, ?projectId=)
5. Identify routes that use useWorkspaceAccess hook

OUTPUT FORMAT:
| Route Path | Component | Redirects To | Condition | Search Params |
|------------|-----------|--------------|-----------|---------------|

FLAG: Any redirect cycle (A→B→A or A→B→C→A)
FLAG: Any route with multiple redirect conditions
```

---

### PROMPT 2: Project Creation Flow Analysis

```
OBJECTIVE: Trace all project creation paths and their post-creation navigation.

SCOPE:
- src/presentation/components/wizard/*.tsx
- src/presentation/components/hub/*.tsx
- src/lib/workspace/workspace-access-helper.tsx
- All files containing "createProject", "createTempProject"

TASKS:
1. List ALL methods that create projects (Dexie db.projects.put, etc.)
2. Trace what happens AFTER project creation:
   - Where does it navigate to?
   - Does it update any stores?
   - Does it emit any events?
3. Map the "temp project" flow:
   - When is temp-xxx created?
   - What triggers temp project creation?
   - Where does it navigate after temp creation?
4. Map the "wizard" flow:
   - Multi-step form progression
   - Final submission action
   - Post-creation navigation

OUTPUT FORMAT:
| Creation Method | Location | Trigger | Post-Creation Action | Navigation |
|----------------|----------|---------|---------------------|------------|

FLAG: Multiple paths creating projects with different post-actions
FLAG: Temp project creation in render cycle (useEffect with state dependency)
```

---

### PROMPT 3: Workspace Access Helper Deep Scan

```
OBJECTIVE: Analyze workspace-access-helper.tsx for infinite loop patterns.

SCOPE:
- src/lib/workspace/workspace-access-helper.tsx (FULL FILE)

TASKS:
1. Map ALL hooks used (useState, useEffect, useMemo, useCallback, useLiveQuery)
2. For each useEffect:
   - List dependencies
   - List state updates inside
   - Identify if any dependency is updated BY the effect
3. Trace useLiveQuery usage:
   - What table does it query?
   - What is the default value?
   - How is undefined/loading handled?
4. Trace navigation calls:
   - When does it navigate?
   - What triggers navigation?
   - Can the destination page re-trigger navigation back?
5. Map status transitions:
   - loading → no_projects → creates temp → navigates → ???
   - loading → has_projects → navigates → ???

OUTPUT FORMAT:
State Machine Diagram:
[loading] --useLiveQuery resolves--> [no_projects]
[no_projects] --useEffect--> createTempProject --> navigate(/workspace/$projectId)
...

FLAG: Any effect that updates its own dependencies
FLAG: Any navigation that can loop back
FLAG: useLiveQuery without stable default value
```

---

### PROMPT 4: Project Selector Components Analysis

```
OBJECTIVE: Map all project selector components and their state sources.

SCOPE:
- src/presentation/components/*/ProjectSelector*.tsx
- src/presentation/components/*/MobileProjectSelector*.tsx
- src/presentation/components/hub/*.tsx
- All files containing "projectId" prop or "selectedProject"

TASKS:
1. List ALL project selector components
2. For each selector:
   - Where does it get projects from? (store, useLiveQuery, props)
   - What happens on project selection? (navigate, emit event, update store)
   - Does it auto-select a project?
3. Find duplicate selector implementations
4. Map selector → store → persistence flow

OUTPUT FORMAT:
| Component | Data Source | On Select Action | Auto-Select Logic |
|-----------|-------------|------------------|-------------------|

FLAG: Different selectors using different data sources
FLAG: Auto-select logic that can conflict with manual selection
FLAG: Selector that both reads AND writes to same store
```

---

### PROMPT 5: Cross-Workspace Event System Analysis

```
OBJECTIVE: Trace cross-workspace event subscriptions and their handlers.

SCOPE:
- src/lib/events/*.ts
- src/lib/events/*.tsx
- All files importing from lib/events

TASKS:
1. Map ALL event types (AgentConfigChange, WorkspaceChanged, etc.)
2. For each event:
   - Who emits it?
   - Who subscribes to it?
   - What does the handler do? (update store, navigate, etc.)
3. Trace event → handler → store update → component re-render chain
4. Identify events that trigger store.getState() calls

OUTPUT FORMAT:
| Event Type | Emitter | Subscriber(s) | Handler Action | Store Updates |
|------------|---------|---------------|----------------|---------------|

FLAG: Handler that calls store.getState() (can cause re-render loops)
FLAG: Event that triggers another event emission
FLAG: Circular event chains (A emits → B handles → B emits → A handles)
```

---

### PROMPT 6: useLiveQuery Usage Audit

```
OBJECTIVE: Audit all useLiveQuery usage for infinite loop patterns.

SCOPE:
- All files importing useLiveQuery from dexie-react-hooks

TASKS:
1. List ALL useLiveQuery calls in codebase
2. For each call:
   - What table is queried?
   - What is the query function?
   - Is a default value provided?
   - How is undefined/loading state handled?
   - Is the result used in useMemo/useEffect dependencies?
3. Check if any useLiveQuery is inside a component that re-mounts frequently

OUTPUT FORMAT:
| File | Query | Default Value | Used In Dependencies | Risk Level |
|------|-------|---------------|---------------------|------------|

FLAG: useLiveQuery without default value (returns undefined while loading)
FLAG: useLiveQuery result in useEffect dependency array
FLAG: useLiveQuery in component mounted by route that can redirect
```

---

### PROMPT 7: IDE Route vs Workspace Identity Crisis

```
OBJECTIVE: Clarify the IDE workspace identity confusion.

SCOPE:
- src/routes/ide.tsx, src/routes/ide.lazy.tsx
- src/routes/ide.$projectId.tsx, src/routes/ide.$projectId.lazy.tsx
- All files with workspace="ide" or workspaceType="ide"

TASKS:
1. Map the IDE route structure:
   - /ide (no project)
   - /ide/$projectId (with project)
2. Compare with other workspaces (notes, knowledge, study)
3. Check how IDE workspace is identified:
   - Is it by route path (/ide)?
   - Is it by workspace prop (workspace="ide")?
   - Are they consistent?
4. Trace project loading in IDE:
   - How is projectId resolved?
   - What happens if no projectId in URL?
   - Does it auto-redirect to first project?

OUTPUT FORMAT:
| Route | Workspace Identity | Project Resolution | Empty State Behavior |
|-------|-------------------|-------------------|---------------------|

FLAG: Inconsistent workspace identification methods
FLAG: IDE behaving differently from other workspaces
FLAG: Redirect loops between /ide and /ide/$projectId
```

---

### PROMPT 8: Store State Synchronization Audit

```
OBJECTIVE: Trace state synchronization between Zustand stores and Dexie.

SCOPE:
- src/infrastructure/persistence/stores/**/*.ts
- src/lib/state/*.ts
- All files with useXxxStore imports

TASKS:
1. Map ALL Zustand stores
2. For each store:
   - Is it synchronized with Dexie?
   - How is synchronization triggered? (effect, event, manual)
   - What is the race condition risk?
3. Find stores that:
   - Read from Dexie in initialization
   - Both read and write to same Dexie table
   - Have useLiveQuery subscribers
4. Trace the data flow:
   - User action → store update → Dexie persist → useLiveQuery update → component re-render

OUTPUT FORMAT:
| Store | Dexie Table | Sync Direction | Sync Trigger | Race Risk |
|-------|-------------|----------------|--------------|-----------|

FLAG: Store that doesn't sync to Dexie (state loss on refresh)
FLAG: Dual sync (store↔Dexie) that can cause loops
FLAG: Store update triggering useLiveQuery → triggering store update
```

---

## Execution Plan

1. **Phase 1 (Parallel):** Run Prompts 1, 4, 6, 7 - Route and component analysis
2. **Phase 2 (Parallel):** Run Prompts 2, 3 - Project creation and workspace access
3. **Phase 3 (Sequential):** Run Prompts 5, 8 - Event and store analysis
4. **Phase 4:** Consolidate findings, create unified fix plan

## Output Location

All diagnostic results should be saved to:
`_bmad-output/diagnostics/routing-deep-scan-2026-01-08/`

---

## Known Issues to Verify

- [ ] `useLiveQuery` in workspace-access-helper causes infinite loop
- [ ] Cross-workspace event handlers call `useAgentsStore.getState()`
- [ ] Temp project auto-creation triggers navigation in render cycle
- [ ] Multiple project selectors with inconsistent data sources
- [ ] IDE route has different pattern than other workspaces
- [ ] OfflineIndicator may contribute to re-render issues

---

## Critical Files to Scan

### Routes (TanStack Router)
```
src/routes/__root.tsx
src/routes/index.tsx
src/routes/hub.tsx
src/routes/notes.lazy.tsx
src/routes/notes.$projectId.lazy.tsx
src/routes/ide.tsx
src/routes/ide.$projectId.tsx
src/routes/knowledge.lazy.tsx
src/routes/knowledge.$projectId.lazy.tsx
src/routes/study.lazy.tsx
src/routes/study.$projectId.lazy.tsx
src/routes/projects.tsx
src/routes/agents.tsx
src/routes/settings.tsx
```

### Workspace & Project Management
```
src/lib/workspace/workspace-access-helper.tsx
src/lib/workspace/workspace-transition-manager.ts
src/lib/workspace/ProjectContext.tsx
src/infrastructure/persistence/stores/workspace/workspace-store.ts
src/infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts
src/infrastructure/persistence/stores/project/useProjectStore.ts
```

### Cross-Workspace Events
```
src/lib/events/cross-workspace-event-bus.ts
src/lib/events/use-cross-workspace-events.ts
src/lib/events/use-chat-state-sync.ts
src/lib/events/use-chat-event-bridge.ts
src/infrastructure/events/cross-workspace-event-bus.ts
src/infrastructure/ui/AgentWorkspaceSync.tsx
```

### Project Creation & Selection
```
src/presentation/components/wizard/ProjectCreationWizard.tsx
src/presentation/components/hub/HubHomePage.tsx
src/presentation/components/hub/ProjectPickerDialog.tsx
src/presentation/components/project/ProjectsPage.tsx
```

### useLiveQuery Usage
```
src/lib/workspace/workspace-access-helper.tsx
src/presentation/components/hub/useDashboardMetrics.ts
src/presentation/components/hub/SummaryCardsGrid.tsx
src/lib/agent/hooks/use-provider-api-key.ts
src/infrastructure/persistence/stores/providers/provider-models-slice.ts
```

### Workspace Pages (Potential Loop Sources)
```
src/presentation/components/notes/NotesPage.tsx
src/presentation/components/ide/IDELayoutMain.tsx
src/presentation/components/knowledge/KnowledgePage.tsx
src/presentation/components/study/StudyPage.tsx
```

---

## Quick Commands for Sub-Agents

### Find all navigate() calls:
```bash
grep -rn "navigate(" src/routes src/lib/workspace --include="*.tsx" --include="*.ts"
```

### Find all useLiveQuery:
```bash
grep -rn "useLiveQuery" src --include="*.tsx" --include="*.ts"
```

### Find all createTempProject:
```bash
grep -rn "createTempProject\|createTemp" src --include="*.tsx" --include="*.ts"
```

### Find all project selectors:
```bash
grep -rn "ProjectSelector\|projectSelect\|setActiveProject" src --include="*.tsx"
```

### Find all cross-workspace events:
```bash
grep -rn "crossWorkspace\|CrossWorkspace\|useAllCrossWorkspace" src --include="*.tsx" --include="*.ts"
```
