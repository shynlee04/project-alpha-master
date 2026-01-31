---
name: 'step-03-dataflow'
description: 'Phase 2: Analyze data flow - stores, database, events, contexts'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-03-dataflow.md'
nextStepFile: '{workflow_path}/steps/step-04-performance.md'
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-2'
---

# Step 3: Data Flow Analysis (Phase 2)

## STEP GOAL

Map ALL data flow mechanisms: Zustand stores, Dexie database, event buses, React contexts. Identify conflicts, race conditions, and infinite loop patterns.

## MANDATORY EXECUTION RULES

- 🛑 Execute ALL 5 sub-agent prompts
- 📖 Each analysis must be exhaustive
- 💾 Each analysis saved separately
- 🎯 Can run in parallel

---

## SUB-AGENT PROMPT 2.1: Zustand Store Inventory

```
OBJECTIVE: Map ALL Zustand stores and their data flow.

FIND ALL STORES:
grep -rn "create(" src --include="*.ts" | grep -i zustand
OR
grep -rn "useStore\|Store" src --include="*.ts" --include="*.tsx"

FOR EACH STORE:
1. File location
2. State shape (what data it holds)
3. Actions (what mutations)
4. Selectors (how data is accessed)
5. Persistence (is it saved to localStorage/Dexie?)
6. Subscribers (what components use it?)

CATEGORIZE:
- Global stores (used everywhere)
- Workspace stores (workspace-specific)
- Feature stores (feature-specific)
- UI stores (modals, sidebars, theme)

OUTPUT FORMAT:
## Zustand Store Inventory

### Global Stores
| Store | File | State Keys | Actions | Persisted? |
|-------|------|------------|---------|------------|

### Workspace Stores
| Store | File | State Keys | Actions | Persisted? |
|-------|------|------------|---------|------------|

### Feature Stores
| Store | File | State Keys | Actions | Persisted? |
|-------|------|------------|---------|------------|

### Store Dependency Graph
useAgentsStore
├── used by: AgentChatPanel
├── used by: AgentConfigPage
└── syncs with: Dexie agentConfigs table

### Risk Analysis
| Store | Risk | Reason |
|-------|------|--------|

SAVE TO: {outputPath}/zustand-inventory.md
```

---

## SUB-AGENT PROMPT 2.2: Dexie Database Analysis

```
OBJECTIVE: Map the complete Dexie database schema and all usages.

FIND DATABASE DEFINITION:
src/infrastructure/persistence/dexie-db.ts

FOR EACH TABLE:
1. Schema (columns, indexes)
2. TypeScript types used
3. CRUD operations (find all db.table.xxx calls)
4. useLiveQuery subscriptions
5. Write locations (what puts data)
6. Read locations (what reads data)

TABLES EXPECTED:
- projects
- notes
- flashcards
- quizzes
- agentConfigs
- llmProviders
- conversations
- (discover any others)

OUTPUT FORMAT:
## Dexie Database Schema

### Table: projects
**Schema:** { id, name, path, bindings, ... }
**Indexes:** id, name

**Writers:**
| File | Method | Trigger |
|------|--------|---------|

**Readers:**
| File | Method | useLiveQuery? |
|------|--------|---------------|

**useLiveQuery Subscriptions:**
| File | Query | Default Value | Risk |
|------|-------|---------------|------|

(Repeat for each table)

### Cross-Table Relationships
projects ← notes (notes.projectId)
projects ← flashcards (flashcards.projectId)
...

### Performance Issues
| Issue | Table | Query | Impact |
|-------|-------|-------|--------|

SAVE TO: {outputPath}/dexie-analysis.md
```

---

## SUB-AGENT PROMPT 2.3: useLiveQuery Audit

```
OBJECTIVE: Audit EVERY useLiveQuery call for infinite loop patterns.

FIND ALL:
grep -rn "useLiveQuery" src --include="*.tsx" --include="*.ts"

FOR EACH USAGE:
1. File and line number
2. Query function (what it queries)
3. Dependencies array
4. Default value (or undefined?)
5. Component that uses result
6. Is result used in useEffect deps?
7. Is result used in useMemo deps?
8. Can query trigger state change that re-triggers query?

RISK CLASSIFICATION:
- 🔴 HIGH: No default value + used in useEffect deps
- 🟡 MEDIUM: No default value OR used in deps
- 🟢 LOW: Has default value + isolated usage

OUTPUT FORMAT:
## useLiveQuery Audit

### All Usages
| File | Line | Query | Default | In Effect Deps? | Risk |
|------|------|-------|---------|-----------------|------|

### High Risk (🔴)
| File:Line | Reason | Fix Suggestion |
|-----------|--------|----------------|

### Medium Risk (🟡)
| File:Line | Reason | Fix Suggestion |
|-----------|--------|----------------|

### Infinite Loop Patterns Detected
| Pattern | Files Involved | Evidence |
|---------|----------------|----------|

SAVE TO: {outputPath}/uselivequery-audit.md
```

---

## SUB-AGENT PROMPT 2.4: Event Bus Analysis

```
OBJECTIVE: Map ALL event buses and their event chains.

FIND ALL EVENT BUSES:
grep -rn "EventEmitter\|eventBus\|EventBus\|emit\|on(" src --include="*.ts"

TYPES OF EVENT BUSES:
- Global event bus
- Workspace event bus
- Cross-workspace event bus
- Sync event bus
- Chat event bus

FOR EACH EVENT TYPE:
1. Event name
2. Payload shape
3. Emitter(s) - who fires it?
4. Subscriber(s) - who handles it?
5. Handler action - what does handler do?
6. Chain effect - does handler trigger another event?

OUTPUT FORMAT:
## Event Bus Analysis

### Event Types
| Event | Bus | Payload | Emitter | Subscriber | Handler Action |
|-------|-----|---------|---------|------------|----------------|

### Event Chains
AgentConfigChange
├── emitted by: AgentConfigPage (save)
├── handled by: AgentChatPanel
│   └── calls: useAgentsStore.getState() ← RE-RENDER RISK
└── handled by: SyncStatusPanel
    └── updates: syncStatus state

### Circular Event Chains
| Chain | Events | Risk |
|-------|--------|------|

### Store Updates from Events
| Event | Handler | Store Updated | Method |
|-------|---------|---------------|--------|

SAVE TO: {outputPath}/event-bus-analysis.md
```

---

## SUB-AGENT PROMPT 2.5: React Context Analysis

```
OBJECTIVE: Map all React Context providers and their data flow.

FIND ALL CONTEXTS:
grep -rn "createContext\|useContext" src --include="*.tsx" --include="*.ts"

FOR EACH CONTEXT:
1. Definition file
2. What data it provides
3. Provider location (where in tree)
4. Consumers (what uses useContext)
5. Update frequency (how often value changes)
6. Memoization (is value memoized?)

PROVIDER TREE (from __root.tsx):
ThemeProvider
└── LocaleProvider
    └── TooltipProvider
        └── AppInitializer
            └── UnifiedWorkspaceProvider
                └── (routes)

OUTPUT FORMAT:
## React Context Analysis

### Context Definitions
| Context | File | Data Provided | Memoized? |
|---------|------|---------------|-----------|

### Provider Tree
(visual tree from __root.tsx)

### Consumer Analysis
| Context | Consumer | Usage | Re-render Risk |
|---------|----------|-------|----------------|

### Optimization Opportunities
| Context | Issue | Fix |
|---------|-------|-----|

SAVE TO: {outputPath}/context-analysis.md
```

---

## ORCHESTRATOR SYNTHESIS

After ALL 5 sub-agents complete:

1. **Create Phase 2 Summary:**

```markdown
# Phase 2 Summary: Data Flow

## State Management Overview
- Zustand Stores: X total
- Dexie Tables: X total
- Event Buses: X total
- React Contexts: X total

## Critical Data Flow Issues
1. [Most dangerous infinite loop pattern]
2. [Store/Dexie sync conflict]
3. [Event chain causing re-renders]

## Data Flow Diagram
(text-based diagram showing data flow)

## Priority Fixes
1. [Fix with highest impact]
2. [Next priority]
```

2. **Save:** `{outputPath}/phase-2-summary.md`

---

## MENU OPTIONS

- **[C] Continue** → Load step-04-performance.md
- **[R] Review** → Examine data flow outputs
- **[RE] Re-execute** → Re-run specific prompt

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All 5 analysis files created
- Every store, table, event, context documented
- Infinite loop patterns identified

### ❌ FAILURE:
- Missing analysis files
- Incomplete store/event inventory
- Not identifying loop patterns
