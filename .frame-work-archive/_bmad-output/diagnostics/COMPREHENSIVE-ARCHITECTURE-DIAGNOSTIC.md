# COMPREHENSIVE CODEBASE DIAGNOSTIC: FULL ARCHITECTURE SCAN

**Created:** 2026-01-08T17:10:00+07:00
**Priority:** P0 - CRITICAL
**Codebase Size:** ~1600 files
**Status:** Deep Diagnostic Required

---

## EXECUTIVE SUMMARY

The codebase is architecturally unstable with symptoms:
- **Database operations extremely slow** (IndexedDB/Dexie)
- **BlockNote editor won't load** (keeps spinning)
- **Infinite render loops** (Maximum update depth exceeded)
- **Routes not reflecting real user journeys**
- **State management chaos** (Zustand + Dexie + useLiveQuery conflicts)
- **Hot reload breaks reactivity**
- **Workspaces interfering with each other**

This document provides **MULTI-PHASE DEEP SCAN PROMPTS** to diagnose the ENTIRE system, not just surface-level issues.

---

## PHASE 0: CODEBASE STRUCTURE MAPPING

### PROMPT 0.1: Generate Full File Inventory

```
OBJECTIVE: Create a complete inventory of all 1600+ files with categorization.

EXECUTION:
1. Run the following commands and save outputs:

find src -type f -name "*.tsx" | wc -l  # UI Components
find src -type f -name "*.ts" | wc -l   # Logic/Types
find src -type d | wc -l                 # Directories

2. Generate categorized file tree:

find src -type f \( -name "*.tsx" -o -name "*.ts" \) | \
  sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -50

3. Identify the LARGEST files (complexity hotspots):

find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -30

4. Map file dependencies (who imports whom):

For top 20 largest files, trace:
- What does it import?
- Who imports it?
- Is it a singleton? A store? A component?

OUTPUT: _bmad-output/diagnostics/phase-0/file-inventory.md
```

### PROMPT 0.2: Dependency Graph Generation

```
OBJECTIVE: Map the inter-file dependencies to find circular imports and bottlenecks.

EXECUTION:
1. For each major directory, trace imports:
   - src/lib/*
   - src/infrastructure/*
   - src/presentation/*
   - src/routes/*

2. Find circular dependencies:
   A imports B, B imports C, C imports A

3. Find "God Files" - files imported by >20 others

4. Find "Orphan Files" - files imported by nobody

5. Find "Bottleneck Files" - files on critical path of >10 user journeys

OUTPUT: _bmad-output/diagnostics/phase-0/dependency-graph.md
```

---

## PHASE 1: USER JOURNEY MAPPING (REALISTIC FLOWS)

### PROMPT 1.1: Landing & First-Time User Journey

```
OBJECTIVE: Trace what happens when a NEW user visits the app for the first time.

START: Browser opens http://localhost:3000/

TRACE EVERY STEP:
1. __root.tsx loads → What providers wrap the app?
2. ThemeProvider → Does it read from storage?
3. LocaleProvider → Does it read from storage?
4. AppInitializer → What does it initialize? How long?
5. UnifiedWorkspaceProvider → What does it do on mount?
6. OfflineIndicator → Does it cause re-renders?
7. index.tsx route → Where does it redirect?
8. hub.tsx → What loads? What queries database?

FOR EACH COMPONENT IN THE CHAIN:
- List ALL useEffect hooks
- List ALL useState calls
- List ALL useMemo/useCallback
- List ALL store subscriptions (useXxxStore)
- List ALL database queries (useLiveQuery, db.xxx)
- List ALL event subscriptions
- Measure: How many re-renders happen?

IDENTIFY:
- Where does the loading spinner appear?
- What is blocking render?
- What database calls happen before first paint?
- Are there race conditions?

OUTPUT: _bmad-output/diagnostics/phase-1/first-time-user-journey.md
```

### PROMPT 1.2: Hub → Notes Workspace Journey

```
OBJECTIVE: Trace what happens when user navigates from Hub to Notes.

START: User on /hub, clicks "Notes" in sidebar

TRACE:
1. Sidebar click → What navigation method?
2. TanStack Router → Route transition hooks?
3. notes.lazy.tsx loads → What does it render?
4. useWorkspaceAccess('notes') → What does it query?
5. useLiveQuery → Does it block render?
6. Status check → no_projects / has_projects / no_binding
7. If no_projects → What happens? Auto-create?
8. If has_projects → What component renders?
9. NotesPage or StableNotesWorkspace → What loads?
10. useNoteStore → What database calls?
11. NoteEditor → Does BlockNote initialize properly?

FOR EACH STEP:
- Timing (how long?)
- Database operations
- State updates
- Event emissions
- Potential infinite loops

OUTPUT: _bmad-output/diagnostics/phase-1/hub-to-notes-journey.md
```

### PROMPT 1.3: Hub → IDE Workspace Journey

```
OBJECTIVE: Trace what happens when user navigates from Hub to IDE.

START: User on /hub, clicks "IDE" in sidebar

TRACE:
1. Route transition: /hub → /ide or /ide/$projectId?
2. ide.tsx vs ide.$projectId.tsx → Which loads?
3. What is the difference between them?
4. useWorkspaceAccess('ide') → Same hook as notes?
5. IDELayoutMain → What does it render?
6. WebContainer initialization → Is it blocking?
7. Monaco Editor → Is it lazy loaded?
8. AgentChatPanel → What subscriptions?
9. SyncStatusPanel → Is it commented out? Why?
10. Cross-workspace events → What handlers fire?

COMPARE WITH NOTES:
- Are the patterns consistent?
- Where do they differ?
- Why does IDE use different patterns?

OUTPUT: _bmad-output/diagnostics/phase-1/hub-to-ide-journey.md
```

### PROMPT 1.4: Hub → Knowledge Workspace Journey

```
OBJECTIVE: Trace what happens when user navigates from Hub to Knowledge.

TRACE SAME PATTERN AS NOTES/IDE

SPECIAL FOCUS:
- RAG pipeline initialization
- Vector store loading
- Source indexing status
- Knowledge graph visualization

OUTPUT: _bmad-output/diagnostics/phase-1/hub-to-knowledge-journey.md
```

### PROMPT 1.5: Hub → Study Workspace Journey

```
OBJECTIVE: Trace what happens when user navigates from Hub to Study.

TRACE SAME PATTERN AS NOTES/IDE

SPECIAL FOCUS:
- Flashcard loading
- Quiz state management
- Spaced repetition logic
- Study session persistence

OUTPUT: _bmad-output/diagnostics/phase-1/hub-to-study-journey.md
```

### PROMPT 1.6: Project Creation Journey

```
OBJECTIVE: Trace the COMPLETE project creation flow.

SCENARIO A: User clicks "Create Project" button on Hub
SCENARIO B: User clicks "Quick Notes" on empty Notes workspace
SCENARIO C: User navigates to /notes without any projects

FOR EACH SCENARIO:
1. What triggers project creation?
2. Is it a wizard (multi-step) or instant creation?
3. What database operations happen?
4. What is saved to Dexie?
5. After creation, where does navigation go?
6. Does the new project load correctly?
7. Is there a flash of loading state?
8. Does anything cause a redirect loop?

MAP EACH PATH VISUALLY:
[Trigger] → [Component] → [Database Op] → [Navigation] → [Final State]

OUTPUT: _bmad-output/diagnostics/phase-1/project-creation-journey.md
```

### PROMPT 1.7: Cross-Workspace Navigation Journey

```
OBJECTIVE: Trace what happens when user switches between workspaces.

SCENARIO: Notes → IDE → Knowledge → Study → Notes (full circle)

FOR EACH TRANSITION:
1. What state is preserved?
2. What state is lost?
3. What database queries happen?
4. What events are emitted?
5. Are there cleanup functions that run?
6. Do subscriptions persist across workspaces?
7. Is there memory leakage?

IDENTIFY:
- State that should persist but doesn't
- State that persists but shouldn't
- Events that fire but have no handler
- Handlers that fire but event never emitted

OUTPUT: _bmad-output/diagnostics/phase-1/cross-workspace-navigation.md
```

---

## PHASE 2: DATA FLOW ANALYSIS

### PROMPT 2.1: Zustand Store Inventory

```
OBJECTIVE: Map ALL Zustand stores and their data flow.

FIND ALL STORES:
grep -rn "create\(.*=>" src --include="*.ts" | grep -i "zustand\|store"

FOR EACH STORE:
1. What state does it hold?
2. What actions does it have?
3. Is it persisted? (localStorage? Dexie?)
4. What components subscribe to it?
5. What triggers state updates?
6. Are there selectors that prevent unnecessary re-renders?

STORE CATEGORIES:
- Global stores (app-wide)
- Workspace stores (notes, ide, knowledge, study)
- Feature stores (chat, agent, project)
- UI stores (modal, sidebar, theme)

MAP:
Component → useXxxStore(selector) → Store → persist? → Dexie/localStorage

OUTPUT: _bmad-output/diagnostics/phase-2/zustand-inventory.md
```

### PROMPT 2.2: Dexie Database Schema Analysis

```
OBJECTIVE: Map the complete Dexie database schema and usage.

FIND DEXIE DEFINITION:
src/infrastructure/persistence/dexie-db.ts

FOR EACH TABLE:
1. Schema (columns, indexes)
2. What types use this table?
3. What components read from it?
4. What components write to it?
5. Is there CRUD helper functions?
6. Are there useLiveQuery subscriptions?

TABLES TO MAP:
- projects
- notes
- flashcards
- quizzes
- agentConfigs
- llmProviders
- conversations
- (any others)

IDENTIFY:
- Tables with no readers (orphan data)
- Tables with no writers (never populated)
- Tables with heavy read + write (contention)
- Slow queries (missing indexes?)

OUTPUT: _bmad-output/diagnostics/phase-2/dexie-schema.md
```

### PROMPT 2.3: useLiveQuery Usage Analysis

```
OBJECTIVE: Find and analyze EVERY useLiveQuery call in the codebase.

FIND ALL:
grep -rn "useLiveQuery" src --include="*.tsx" --include="*.ts"

FOR EACH USAGE:
1. File and line number
2. What table is queried?
3. What is the query logic?
4. Is there a default value?
5. What component uses the result?
6. Is the result used in useEffect dependencies?
7. Is the result used in useMemo dependencies?
8. Can the query result trigger re-renders that re-trigger the query?

RISK ASSESSMENT:
- HIGH: useLiveQuery result in useEffect deps without guards
- MEDIUM: useLiveQuery without default value (undefined while loading)
- LOW: useLiveQuery with stable default and proper guards

OUTPUT: _bmad-output/diagnostics/phase-2/uselivequery-analysis.md
```

### PROMPT 2.4: Event Bus Analysis

```
OBJECTIVE: Map ALL event buses and their event flows.

FIND ALL EVENT BUSES:
grep -rn "EventEmitter\|eventBus\|EventBus" src --include="*.ts" --include="*.tsx"

FOR EACH EVENT BUS:
1. What events does it define?
2. What emits each event?
3. What subscribes to each event?
4. What do handlers do? (update store? navigate? query DB?)
5. Are there event chains? (A → B → C)
6. Are there circular event chains? (A → B → A)

EVENT BUS TYPES:
- Global event bus
- Workspace event bus
- Cross-workspace event bus
- Sync event bus
- Chat event bus

OUTPUT: _bmad-output/diagnostics/phase-2/event-bus-analysis.md
```

### PROMPT 2.5: Context Provider Tree Analysis

```
OBJECTIVE: Map the React Context provider tree and data flow.

START FROM __root.tsx:
1. List ALL providers in order
2. For each provider:
   - What context does it create?
   - What data does it provide?
   - What hooks consume this context?
   - Does it cause re-renders when data changes?

FIND ALL CONTEXT DEFINITIONS:
grep -rn "createContext\|useContext" src --include="*.tsx" --include="*.ts"

PROVIDER TREE:
ThemeProvider
  └─ LocaleProvider
       └─ TooltipProvider
            └─ AppInitializer
                 └─ UnifiedWorkspaceProvider
                      └─ AppErrorBoundary
                           └─ (Route Components)

IDENTIFY:
- Providers that cause unnecessary re-renders
- Missing memoization in context values
- Context that should be store instead

OUTPUT: _bmad-output/diagnostics/phase-2/context-providers.md
```

---

## PHASE 3: PERFORMANCE BOTTLENECK ANALYSIS

### PROMPT 3.1: Initial Load Time Analysis

```
OBJECTIVE: Identify what makes the initial load slow.

MEASURE:
1. Time from page request to first paint
2. Time from first paint to interactive
3. Time from interactive to data loaded
4. Bundle size breakdown (what's big?)

TRACE BLOCKING OPERATIONS:
1. Synchronous database reads in render
2. useLiveQuery without suspense/loading state
3. Heavy computation in render path
4. Unoptimized re-renders

FOR EACH ROUTE:
- What JavaScript bundles fetch?
- What network requests happen?
- What database operations block?
- Is code-splitting effective?

OUTPUT: _bmad-output/diagnostics/phase-3/initial-load-analysis.md
```

### PROMPT 3.2: Database Operation Profiling

```
OBJECTIVE: Profile all Dexie database operations.

ADD TIMING TO:
- db.xxx.get()
- db.xxx.put()
- db.xxx.bulkPut()
- db.xxx.where().toArray()
- db.xxx.toArray()

FOR EACH OPERATION:
1. What triggers it?
2. How often does it run?
3. How long does it take?
4. Can it be batched?
5. Can it be cached?
6. Is it blocking render?

IDENTIFY:
- Operations that run on every render
- Operations that run on every keystroke
- Operations that should be debounced
- Operations that should be in background

OUTPUT: _bmad-output/diagnostics/phase-3/database-profiling.md
```

### PROMPT 3.3: Re-render Analysis

```
OBJECTIVE: Identify components that re-render excessively.

TOOLS:
- React DevTools Profiler (conceptual analysis)
- Manual code review

FOR EACH MAJOR COMPONENT:
1. What triggers re-render?
2. Are props changing when they shouldn't?
3. Are store subscriptions too broad?
4. Is there missing useMemo/useCallback?
5. Are children re-rendering due to parent?

HIGH-RISK COMPONENTS:
- Components using useLiveQuery
- Components using multiple stores
- Components in render loops (lists)
- Components with complex useEffect chains

OUTPUT: _bmad-output/diagnostics/phase-3/rerender-analysis.md
```

---

## PHASE 4: FEATURE-BY-FEATURE ISOLATION

### PROMPT 4.1: Notes Feature Deep Scan

```
OBJECTIVE: Completely map the Notes feature in isolation.

SCOPE:
- src/routes/notes*.tsx
- src/presentation/components/notes/*.tsx
- src/lib/notes/*.ts
- All imports and dependencies

MAP:
1. Entry points (routes)
2. Page components
3. Child components
4. State management (stores, context)
5. Database tables used
6. External dependencies (BlockNote, etc.)

DATA FLOW:
[Route] → [Page] → [Sidebar + Editor + Chat]
                       ↓
              [useNoteStore]
                       ↓
              [Dexie: notes table]

IDENTIFY ISSUES:
- What blocks rendering?
- What causes infinite loops?
- What doesn't persist correctly?
- What loses state on navigation?

OUTPUT: _bmad-output/diagnostics/phase-4/notes-feature.md
```

### PROMPT 4.2: IDE Feature Deep Scan

```
OBJECTIVE: Completely map the IDE feature in isolation.

SCOPE:
- src/routes/ide*.tsx
- src/presentation/components/ide/*.tsx
- src/lib/ide/*.ts
- WebContainer integration
- Monaco Editor integration

MAP SAME AS NOTES + SPECIAL:
- WebContainer lifecycle
- File system synchronization
- Terminal integration
- Git integration

OUTPUT: _bmad-output/diagnostics/phase-4/ide-feature.md
```

### PROMPT 4.3: Knowledge Feature Deep Scan

```
OBJECTIVE: Completely map the Knowledge feature in isolation.

SCOPE:
- src/routes/knowledge*.tsx
- src/presentation/components/knowledge/*.tsx
- src/lib/rag/*.ts
- Vector store integration

MAP SAME AS NOTES + SPECIAL:
- RAG pipeline
- Source indexing
- Embedding generation
- Similarity search

OUTPUT: _bmad-output/diagnostics/phase-4/knowledge-feature.md
```

### PROMPT 4.4: Study Feature Deep Scan

```
OBJECTIVE: Completely map the Study feature in isolation.

SCOPE:
- src/routes/study*.tsx
- src/presentation/components/study/*.tsx
- src/lib/study/*.ts

MAP SAME AS NOTES + SPECIAL:
- Flashcard state machine
- Quiz generation
- Spaced repetition algorithm
- Study session tracking

OUTPUT: _bmad-output/diagnostics/phase-4/study-feature.md
```

### PROMPT 4.5: Hub Feature Deep Scan

```
OBJECTIVE: Completely map the Hub feature in isolation.

SCOPE:
- src/routes/hub.tsx
- src/presentation/components/hub/*.tsx

MAP:
- Project listing
- Dashboard metrics
- Quick actions
- Navigation to workspaces

IDENTIFY:
- Why does hub perform many database queries?
- What summary cards are slow?
- What can be lazy loaded?

OUTPUT: _bmad-output/diagnostics/phase-4/hub-feature.md
```

### PROMPT 4.6: Agent Configuration Feature Deep Scan

```
OBJECTIVE: Completely map the Agent/LLM configuration feature.

SCOPE:
- src/routes/agents.tsx
- src/presentation/components/agent/*.tsx
- src/lib/agent/*.ts
- src/infrastructure/persistence/stores/agents/*.ts

MAP:
- Agent configuration UI
- Provider API key management
- Model selection
- Agent personas

IDENTIFY:
- What causes the "API Key missing" message?
- How is agent config persisted?
- What events sync agent config across workspaces?

OUTPUT: _bmad-output/diagnostics/phase-4/agent-feature.md
```

---

## PHASE 5: INTEGRATION POINT ANALYSIS

### PROMPT 5.1: Cross-Feature Dependencies

```
OBJECTIVE: Map how features depend on each other.

MATRIX:
           | Notes | IDE | Knowledge | Study | Hub | Agents |
Notes      |   -   |     |           |       |     |        |
IDE        |       |  -  |           |       |     |        |
Knowledge  |       |     |     -     |       |     |        |
Study      |       |     |           |   -   |     |        |
Hub        |       |     |           |       |  -  |        |
Agents     |       |     |           |       |     |   -    |

FOR EACH CELL:
- What data do they share?
- What events do they exchange?
- What stores do they both use?
- Can one break the other?

OUTPUT: _bmad-output/diagnostics/phase-5/cross-feature-deps.md
```

### PROMPT 5.2: Shared Infrastructure Analysis

```
OBJECTIVE: Map shared infrastructure and its impact.

SHARED INFRASTRUCTURE:
- UnifiedWorkspaceProvider
- ProjectProvider
- Dexie database
- Event buses
- Zustand stores
- UI components (Button, Dialog, etc.)

FOR EACH:
1. Who uses it?
2. What is the contract?
3. Are there breaking assumptions?
4. Is it thread-safe / re-entrant?

OUTPUT: _bmad-output/diagnostics/phase-5/shared-infrastructure.md
```

---

## PHASE 6: ROOT CAUSE SYNTHESIS

### PROMPT 6.1: Issue Correlation Matrix

```
OBJECTIVE: Correlate symptoms with root causes.

SYMPTOMS:
1. Database slow
2. BlockNote won't load
3. Infinite loops
4. State loss on navigation
5. Cross-workspace interference
6. Hot reload breaks reactivity

FOR EACH SYMPTOM:
- What user journey triggers it?
- What components are involved?
- What stores are involved?
- What database tables are involved?
- What is the likely root cause?

OUTPUT: _bmad-output/diagnostics/phase-6/issue-correlation.md
```

### PROMPT 6.2: Remediation Priority Matrix

```
OBJECTIVE: Prioritize fixes based on impact and effort.

FOR EACH IDENTIFIED ISSUE:
1. Impact (1-10): How much does it break?
2. Effort (1-10): How hard to fix?
3. Risk (1-10): How likely to break something else?
4. Dependencies: What must be fixed first?

PRIORITY = Impact / (Effort * Risk)

OUTPUT: _bmad-output/diagnostics/phase-6/remediation-priorities.md
```

---

## EXECUTION INSTRUCTIONS

### For Sub-Agents:

1. **Pick ONE prompt at a time**
2. **Execute FULLY** - don't skip steps
3. **Document EVERYTHING** - including dead ends
4. **Use grep/find commands** to find actual code
5. **Read actual file contents** - not just signatures
6. **Save to specified output location**

### Execution Order:

```
Phase 0 (Foundation)     → 2 sub-agents in parallel
Phase 1 (User Journeys)  → 7 sub-agents (can be parallel if independent)
Phase 2 (Data Flow)      → 5 sub-agents in parallel
Phase 3 (Performance)    → 3 sub-agents in parallel
Phase 4 (Features)       → 6 sub-agents in parallel  
Phase 5 (Integration)    → 2 sub-agents sequential
Phase 6 (Synthesis)      → 1 sub-agent (requires all prior phases)
```

### Output Location:

All outputs go to:
```
_bmad-output/diagnostics/
├── phase-0/
├── phase-1/
├── phase-2/
├── phase-3/
├── phase-4/
├── phase-5/
└── phase-6/
```

---

## CRITICAL FILES LIST (Must Scan)

```
# Routes
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

# Core Infrastructure
src/infrastructure/persistence/dexie-db.ts
src/infrastructure/persistence/stores/workspace/workspace-store.ts
src/infrastructure/persistence/stores/project/useProjectStore.ts
src/infrastructure/events/cross-workspace-event-bus.ts

# Workspace Access
src/lib/workspace/workspace-access-helper.tsx
src/lib/workspace/workspace-transition-manager.ts
src/lib/workspace/ProjectContext.tsx

# State Management
src/lib/notes/note-store.ts
src/lib/state/dexie-db.ts

# Events
src/lib/events/cross-workspace-event-bus.ts
src/lib/events/use-cross-workspace-events.ts

# Components (largest/most complex)
src/presentation/components/notes/NotesPage.tsx
src/presentation/components/ide/IDELayoutMain.tsx
src/presentation/components/knowledge/KnowledgePage.tsx
src/presentation/components/study/StudyPage.tsx
src/presentation/components/hub/HubHomePage.tsx
src/presentation/components/wizard/ProjectCreationWizard.tsx
```

---

## FINAL OUTPUT

After all phases complete, synthesize into:

**`_bmad-output/diagnostics/FINAL-ARCHITECTURE-REPORT.md`**

This report should contain:
1. Executive summary
2. Critical issues ranked by priority
3. Root cause analysis
4. Recommended fix order
5. Estimated effort for each fix
6. Risk assessment for each fix
7. Success criteria for verification
