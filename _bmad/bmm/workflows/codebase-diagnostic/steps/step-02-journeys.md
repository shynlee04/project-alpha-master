---
name: 'step-02-journeys'
description: 'Phase 1: Map realistic user journeys through actual code paths'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-02-journeys.md'
nextStepFile: '{workflow_path}/steps/step-03-dataflow.md'
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-1'
---

# Step 2: User Journey Mapping (Phase 1)

## STEP GOAL

Trace REALISTIC user journeys through actual code, not theoretical flows. Map what components load, what hooks fire, what database queries run, and where bottlenecks occur.

## MANDATORY EXECUTION RULES

- 🛑 Execute ALL 7 sub-agent prompts
- 📖 Each journey must trace ACTUAL code paths
- 💾 Each journey saved separately
- 🎯 Can run prompts in parallel if sub-agents available

---

## SUB-AGENT PROMPT 1.1: First-Time User Journey

**Delegate to Sub-Agent:**

```
OBJECTIVE: Trace what happens when a NEW user visits the app for the first time.

START: Browser opens http://localhost:3000/

TRACE EACH COMPONENT IN ORDER:
1. __root.tsx → List ALL providers in render order
2. For EACH provider:
   - What useEffect hooks fire on mount?
   - What useState initializations happen?
   - What database queries (useLiveQuery, db.xxx)?
   - What event subscriptions?
3. Index route → Where does it redirect?
4. Hub page → What loads? What queries?

FOR EACH FILE TOUCHED:
- File path and line numbers
- Hook invocations (list each useEffect, useState, useMemo)
- Database operations (exact queries)
- Event subscriptions (what events, what handlers)

OUTPUT FORMAT:
## First-Time User Journey

### 1. __root.tsx loads
**File:** src/routes/__root.tsx

**Provider Chain:**
1. ThemeProvider (line X) - reads localStorage
2. LocaleProvider (line X) - reads browser lang
3. AppInitializer (line X) - useEffects: [list]
4. UnifiedWorkspaceProvider (line X) - queries: [list]
5. AppErrorBoundary (line X)

**Blocking Operations:**
| Operation | File:Line | Duration Est | Blocking? |
|-----------|-----------|--------------|-----------|

### 2. Index Route
**Redirect:** / → /hub (line X)

### 3. Hub Page Loads
**Components Mounted:**
| Component | Hooks | DB Queries | Events |
|-----------|-------|------------|--------|

### Timeline Estimate
| Phase | Time | Blocking? |
|-------|------|-----------|
| Provider init | Xms | |
| Route resolve | Xms | |
| Hub render | Xms | |
| Data loaded | Xms | |

SAVE TO: {outputPath}/journey-first-time-user.md
```

---

## SUB-AGENT PROMPT 1.2: Hub → Notes Journey

**Delegate to Sub-Agent:**

```
OBJECTIVE: Trace navigation from Hub to Notes workspace.

START: User on /hub, clicks "Notes" in sidebar

TRACE:
1. Sidebar click event → What handler fires?
2. Navigation method → TanStack Router navigate()?
3. Route change → notes.lazy.tsx loads
4. useWorkspaceAccess('notes') → Read ENTIRE function, document:
   - What hooks it calls
   - What queries it runs
   - What status values possible
   - What triggers navigation/redirect
5. For each status (loading, no_projects, has_projects, no_binding):
   - What component renders?
   - What happens next?
6. If NotesPage renders:
   - What hooks fire?
   - What database queries?
   - Does BlockNote editor load?

CAPTURE EXACT CODE PATHS:
- File:line for each decision point
- Conditions that trigger different paths
- Database queries with timing

OUTPUT FORMAT:
## Hub → Notes Journey

### Step 1: Sidebar Click
**File:** src/presentation/components/layout/MainSidebar.tsx
**Handler:** line X
**Navigation:** navigate({ to: '/notes' })

### Step 2: Route Transition
**From:** src/routes/hub.tsx
**To:** src/routes/notes.lazy.tsx

### Step 3: useWorkspaceAccess Analysis
**File:** src/lib/workspace/workspace-access-helper.tsx

**Hooks Used:**
| Hook | Purpose | Dependencies | Risk |
|------|---------|--------------|------|

**Status Flow:**
[loading] → query db.projects
    ↓
[no_projects] → show empty state
    ↓
[has_projects] → render NotesPage

**Database Queries:**
| Query | Table | When | Blocking? |
|-------|-------|------|-----------|

### Step 4: NotesPage Analysis
**File:** src/presentation/components/notes/NotesPage.tsx

**Hooks:** [list all with line numbers]
**Stores:** [list all useXxxStore calls]
**Events:** [list all subscriptions]

### Potential Infinite Loops
| Location | Trigger | Evidence |
|----------|---------|----------|

SAVE TO: {outputPath}/journey-hub-to-notes.md
```

---

## SUB-AGENT PROMPT 1.3: Hub → IDE Journey

```
OBJECTIVE: Trace navigation from Hub to IDE workspace.

SAME PATTERN AS PROMPT 1.2, but focus on:
- IDE-specific components (WebContainer, Monaco)
- IDE route structure (/ide vs /ide/$projectId)
- How IDE differs from Notes in access pattern

SAVE TO: {outputPath}/journey-hub-to-ide.md
```

---

## SUB-AGENT PROMPT 1.4: Hub → Knowledge Journey

```
OBJECTIVE: Trace navigation from Hub to Knowledge workspace.

SAME PATTERN AS PROMPT 1.2, but focus on:
- RAG pipeline initialization
- Vector store loading
- Source indexing

SAVE TO: {outputPath}/journey-hub-to-knowledge.md
```

---

## SUB-AGENT PROMPT 1.5: Hub → Study Journey

```
OBJECTIVE: Trace navigation from Hub to Study workspace.

SAME PATTERN AS PROMPT 1.2, but focus on:
- Flashcard loading
- Quiz state
- Study session persistence

SAVE TO: {outputPath}/journey-hub-to-study.md
```

---

## SUB-AGENT PROMPT 1.6: Project Creation Journey

```
OBJECTIVE: Trace ALL project creation paths.

SCENARIOS:
A. User clicks "Create Project" on Hub
B. User visits /notes with no projects (auto-create temp?)
C. User visits /ide with no projects

FOR EACH SCENARIO:
1. What triggers creation?
2. What component handles it? (Wizard? Quick create?)
3. What database operations?
4. What is created in Dexie?
5. Where does navigation go after?
6. Can this cause redirect loops?

OUTPUT FORMAT:
## Project Creation Flows

### Scenario A: Hub Create Button
| Step | File:Line | Action | Next State |
|------|-----------|--------|------------|

### Scenario B: Notes Auto-Create
| Step | File:Line | Action | Next State |
|------|-----------|--------|------------|

### Scenario C: IDE Empty State
| Step | File:Line | Action | Next State |
|------|-----------|--------|------------|

### Conflict Analysis
| Conflict | Scenario A vs B | Risk |
|----------|-----------------|------|

SAVE TO: {outputPath}/journey-project-creation.md
```

---

## SUB-AGENT PROMPT 1.7: Cross-Workspace Navigation

```
OBJECTIVE: Trace state changes when switching between workspaces.

SCENARIO: Notes → IDE → Knowledge → Study → Notes (full circle)

FOR EACH TRANSITION:
1. What state is cleaned up?
2. What state persists?
3. What subscriptions remain?
4. What database queries re-run?
5. What events fire?

CAPTURE:
- Memory state before/after each transition
- Database queries on each load
- Event emissions
- Potential memory leaks (subscriptions not cleaned up)

OUTPUT FORMAT:
## Cross-Workspace Navigation

### Transition: Notes → IDE
**State Cleaned:** [list]
**State Preserved:** [list]
**Queries Re-run:** [list]
**Events Fired:** [list]

### Transition: IDE → Knowledge
(same format)

### Full Circle Analysis
| Metric | Start | After Circle | Leak? |
|--------|-------|--------------|-------|
| Subscriptions | X | Y | |
| DB Queries | X | Y | |
| Memory (est) | X | Y | |

SAVE TO: {outputPath}/journey-cross-workspace.md
```

---

## ORCHESTRATOR SYNTHESIS

After ALL 7 sub-agents complete:

1. **Collect All Journey Results**
2. **Create Phase 1 Summary:**

```markdown
# Phase 1 Summary: User Journeys

## Critical Findings
1. [Most significant bottleneck]
2. [Highest risk infinite loop]
3. [Slowest journey]

## Journey Comparison Matrix
| Journey | Load Time | DB Queries | Potential Loops |
|---------|-----------|------------|-----------------|

## Priority Issues for Phase 2
1. [Issue requiring data flow analysis]
2. [Issue requiring store analysis]
```

3. **Save:** `{outputPath}/phase-1-summary.md`

---

## MENU OPTIONS

- **[C] Continue** → Load step-03-dataflow.md
- **[R] Review** → Examine journey outputs
- **[RE] Re-execute** → Re-run specific journey prompt

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All 7 journey files created
- Each journey traces actual code paths
- phase-1-summary.md synthesizes findings

### ❌ FAILURE:
- Missing journey files
- Journeys based on assumptions, not code
- Proceeding without synthesis
