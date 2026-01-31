---
name: 'step-06-integration'
description: 'Phase 5: Analyze cross-feature dependencies and shared infrastructure'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-06-integration.md'
nextStepFile: '{workflow_path}/steps/step-07-synthesis.md'
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-5'
---

# Step 6: Integration Point Analysis (Phase 5)

## STEP GOAL

Analyze how features interact with each other and with shared infrastructure. Identify integration conflicts that cause cascading failures.

## MANDATORY EXECUTION RULES

- 🛑 Execute BOTH sub-agent prompts SEQUENTIALLY
- 📖 Prompt 5.2 depends on 5.1 results
- 💾 Both analyses saved

---

## SUB-AGENT PROMPT 5.1: Cross-Feature Dependencies

```
OBJECTIVE: Map how features depend on each other.

USE PHASE 4 RESULTS:
- Review each feature-*.md file
- Extract "Dependencies on Other Features" section

BUILD DEPENDENCY MATRIX:

For each feature pair, document:
1. What data do they share?
2. What events do they exchange?
3. What stores do they both use?
4. Can one break the other?

ANALYZE:
1. Notes ↔ IDE
   - Do they share project context?
   - Can switching break state?

2. Notes ↔ Knowledge
   - RAG integration with notes?
   - Source indexing of notes?

3. Notes ↔ Study
   - Flashcard generation from notes?
   - Quiz generation from notes?

4. IDE ↔ Knowledge
   - Code indexing?
   - RAG on code?

5. Agents ↔ All Features
   - Agent config changes affect all?
   - API key availability?

6. Hub ↔ All Features
   - Project selection propagation?
   - Dashboard metrics?

OUTPUT FORMAT:
## Cross-Feature Dependencies

### Dependency Matrix
|           | Notes | IDE | Knowledge | Study | Hub | Agents |
|-----------|-------|-----|-----------|-------|-----|--------|
| Notes     | -     | Low | Medium    | High  | Low | High   |
| IDE       | Low   | -   | Low       | Low   | Low | High   |
| Knowledge | Medium| Low | -         | Medium| Low | High   |
| Study     | High  | Low | Medium    | -     | Low | High   |
| Hub       | Low   | Low | Low       | Low   | -   | Low    |
| Agents    | High  | High| High      | High  | Low | -      |

### Shared Data
| Data | Features | Conflict Risk |
|------|----------|---------------|
| Project context | All | High |
| Agent config | All | High |
| API keys | All | High |

### Shared Events
| Event | Producer | Consumers | Risk |
|-------|----------|-----------|------|

### Cascade Failure Paths
1. Agent config changes → All chat panels re-render → ...
2. Project switch → All workspace states reset → ...

### Breaking Dependency Chains
| Chain | Features | What Breaks |
|-------|----------|-------------|

SAVE TO: {outputPath}/cross-feature-deps.md
```

---

## SUB-AGENT PROMPT 5.2: Shared Infrastructure Analysis

```
OBJECTIVE: Analyze shared infrastructure and its impact on all features.

SHARED INFRASTRUCTURE COMPONENTS:

1. UnifiedWorkspaceProvider
   - src/infrastructure/persistence/stores/workspace/
   - What does it provide?
   - Who consumes it?
   - When does it update?
   - Does update cause all children to re-render?

2. ProjectProvider / ProjectContext
   - src/lib/workspace/ProjectContext.tsx
   - Project state management
   - Project switching behavior

3. Dexie Database (Single Instance)
   - src/infrastructure/persistence/dexie-db.ts
   - Single database for all features
   - Connection contention?

4. Event Buses (Multiple)
   - Global event bus
   - Cross-workspace event bus
   - Sync event bus
   - Event collision possible?

5. Zustand Global Stores
   - Stores used by multiple features
   - Update propagation

6. UI Component Library
   - src/presentation/components/ui/
   - Shared components (Button, Dialog, etc.)
   - Any state leakage?

FOR EACH:
1. What does it provide?
2. What assumes it's available?
3. What happens if it fails?
4. What happens on update?
5. Is it properly isolated?

OUTPUT FORMAT:
## Shared Infrastructure Analysis

### UnifiedWorkspaceProvider
**File:** src/infrastructure/persistence/stores/workspace/
**Provides:** [list]
**Consumers:** [list]
**Update Impact:** [what re-renders]
**Issues:**
- [ ] Issue 1
- [ ] Issue 2

### ProjectProvider
**File:** src/lib/workspace/ProjectContext.tsx
**Provides:** [list]
**Consumers:** [list]
**Update Impact:** [what re-renders]
**Issues:**

### Dexie Database
**File:** src/infrastructure/persistence/dexie-db.ts
**Tables:** [list]
**Concurrent Access:** [how handled]
**Issues:**

### Event Buses
| Bus | File | Events | Risk |
|-----|------|--------|------|

### Global Stores
| Store | Consumers | Update Impact |
|-------|-----------|---------------|

### Infrastructure Failure Modes
| Component | Failure Mode | Impact | Mitigation |
|-----------|--------------|--------|------------|

SAVE TO: {outputPath}/shared-infrastructure.md
```

---

## ORCHESTRATOR SYNTHESIS

After BOTH sub-agents complete:

1. **Create Phase 5 Summary:**

```markdown
# Phase 5 Summary: Integration Analysis

## Integration Complexity Score
| Area | Score (1-10) | Risk |
|------|--------------|------|
| Cross-Feature | X | |
| Shared Infra | X | |
| Event Chains | X | |

## Critical Integration Issues
1. [Most dangerous integration point]
2. [Second priority]

## Isolation Recommendations
- What can be decoupled?
- What should remain coupled?

## Architecture Debt
| Debt | Impact | Effort to Fix |
|------|--------|---------------|
```

2. **Save:** `{outputPath}/phase-5-summary.md`

---

## MENU OPTIONS

- **[C] Continue** → Load step-07-synthesis.md
- **[R] Review** → Examine integration outputs

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Both analysis files created
- Dependency matrix complete
- Infrastructure risks identified

### ❌ FAILURE:
- Running prompts in parallel (5.2 needs 5.1)
- Missing infrastructure analysis
- No failure mode documentation
