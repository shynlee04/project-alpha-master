---
name: 'step-01-structure'
description: 'Phase 0: Map codebase structure - file inventory and dependency graph'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-01-structure.md'
nextStepFile: '{workflow_path}/steps/step-02-journeys.md'
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-0'
---

# Step 1: Codebase Structure Mapping (Phase 0)

## STEP GOAL

Map the complete codebase structure to understand scale, complexity hotspots, and dependency relationships before diving into specific issues.

## MANDATORY EXECUTION RULES

- 🛑 Execute BOTH sub-agent prompts before proceeding
- 📖 Wait for sub-agent completion before synthesis
- 💾 Save all outputs to `{outputPath}/`
- 🎯 This step spawns 2 parallel sub-agents

---

## SUB-AGENT PROMPT 0.1: File Inventory

**Delegate to Sub-Agent with this prompt:**

```
OBJECTIVE: Generate comprehensive file inventory of the codebase.

SCOPE: src/ directory and all subdirectories

TASKS:
1. Count files by type:
   - find src -type f -name "*.tsx" | wc -l
   - find src -type f -name "*.ts" | wc -l
   - find src -type f -name "*.css" | wc -l

2. List directories by file count (complexity hotspots):
   - find src -type f \( -name "*.tsx" -o -name "*.ts" \) | \
     sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

3. Identify largest files (>500 lines):
   - find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -30

4. Categorize by layer:
   - src/routes/ (routing)
   - src/presentation/ (UI)
   - src/lib/ (business logic)
   - src/infrastructure/ (data layer)

OUTPUT FORMAT:
## File Inventory Summary

### Counts
| Type | Count |
|------|-------|
| .tsx | X |
| .ts  | X |
| Total| X |

### Complexity Hotspots (Top 30 Directories)
| Directory | File Count |
|-----------|------------|

### God Files (>500 lines)
| File | Lines | Category |
|------|-------|----------|

### Layer Distribution
| Layer | Files | Complexity |
|-------|-------|------------|

SAVE TO: {outputPath}/file-inventory.md
EXIT WHEN: All 4 tasks complete with documented output
```

---

## SUB-AGENT PROMPT 0.2: Dependency Graph

**Delegate to Sub-Agent with this prompt:**

```
OBJECTIVE: Map inter-file dependencies to find circular imports and bottlenecks.

SCOPE: src/ directory

TASKS:
1. For each "God File" (>500 lines) identified in Prompt 0.1:
   - List what it imports (grep "^import" filename)
   - List what imports it (grep -rn "from.*filename" src/)

2. Find circular dependencies:
   - A imports B, B imports C, C imports A
   - Focus on: stores, hooks, contexts

3. Identify "Hub Files" (imported by >20 files):
   - grep -rn "from '@/lib/xxx'" src/ | wc -l
   - List top 20 most-imported files

4. Identify "Orphan Files" (imported by 0 files):
   - Files that exist but nothing imports them

5. Map critical paths:
   - __root.tsx → what does it import?
   - MainLayout → what does it import?
   - Each route → what does it import?

OUTPUT FORMAT:
## Dependency Analysis

### God File Dependencies
| File | Imports | Imported By |
|------|---------|-------------|

### Circular Dependencies
- [ ] A → B → A: (list files)
- [ ] A → B → C → A: (list files)

### Hub Files (>20 importers)
| File | Import Count | Risk Level |
|------|--------------|------------|

### Orphan Files
| File | Last Modified | Action |
|------|---------------|--------|

### Critical Import Chains
__root.tsx
├── import A
│   ├── import B
│   └── import C
└── import D

SAVE TO: {outputPath}/dependency-graph.md
EXIT WHEN: All 5 tasks complete
```

---

## ORCHESTRATOR SYNTHESIS

After BOTH sub-agents complete:

1. **Collect Results:**
   - Read `{outputPath}/file-inventory.md`
   - Read `{outputPath}/dependency-graph.md`

2. **Create Phase 0 Summary:**

```markdown
# Phase 0 Summary: Codebase Structure

## Key Metrics
- Total Files: X
- Complexity Hotspots: (list top 5)
- God Files: X files > 500 lines
- Circular Dependencies: X found
- Hub Files: X files with >20 importers

## Risk Assessment
| Risk | Files Affected | Priority |
|------|----------------|----------|

## Recommendations for Next Phase
- Focus areas for user journey analysis
- Suspected bottleneck components
```

3. **Save Summary:** `{outputPath}/phase-0-summary.md`

4. **Update PROGRESS.md:**
   - Mark Phase 0 complete
   - Record sub-agent outputs

---

## MENU OPTIONS

After synthesis complete:

- **[C] Continue** → Load step-02-journeys.md
- **[R] Review** → Re-examine phase 0 outputs
- **[RE] Re-execute** → Re-run specific sub-agent prompt

### Menu Handling Logic:

When user selects [C]:
1. Update PROGRESS.md with Phase 0 complete
2. Load, read entire file, execute `{workflow_path}/steps/step-02-journeys.md`

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- file-inventory.md created with all counts
- dependency-graph.md created with all mappings
- phase-0-summary.md synthesizes findings
- PROGRESS.md updated

### ❌ FAILURE:
- Proceeding without both sub-agent results
- Missing output files
- Not synthesizing before continuing
