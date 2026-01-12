---
name: "story-cycle"
type: "implementation-workflow"
purpose: "Execute stories from assignment to completion with deep analysis, evidence-based validation, and real code verification"
version: "2.0.0"
phase: "4"
---

# Story-Cycle Workflow v2.0

**Purpose**: Execute development stories from assignment through completion with **deep analysis**, **evidence-based validation**, and **real code verification**.

## v2.0 Critical Insight

**OLD**: Sprints fail due to shallow understanding and untested assumptions.

**NEW**: Sprints fail due to **NOT UNDERSTANDING THE ACTUAL CODE**. This workflow enforces:
1. Deep project analysis (grep/glob) BEFORE any code
2. Evidence-based validation (file:line references)
3. Real code path walking (not just diff summaries)
4. Journey verification with actual code paths
5. HTML output validation for all states

## Workflow Definition

```yaml
workflow:
  name: "story-cycle"
  phase: 4
  version: "2.0.0"
  purpose: "Execute stories with deep analysis + evidence-based validation"

  entry:
    required: "governance approval + story assignment"
    from: "orchestrator (after governance check)"

  output:
    - "story completion artifact"
    - "updated sprint-status.yaml"
    - "test results"
    - "journey map (mermaid)"
    - "tool definitions (if agentic)"
    - "visual regression report"
    - "deep analysis evidence (v2.0)"
    - "code path verification (v2.0)"

  steps: 10
  estimated_duration: "varies by story complexity"

  enhanced_features:
    - "Deep Project Analysis (Step 1) - grep/glob enforcement"
    - "Code-Verified Journey (Step 1a) - state machine walk"
    - "Evidence-Based Validation (Step 2) - file:line references"
    - "Architectural Conflict Detection (Step 3) - forbidden patterns"
    - "Real Code Review (Step 5) - path walking + HTML validation"
    - "Visual Reality Check (Step 6a) - journey comparison"
```

## Workflow Definition

```yaml
workflow:
  name: "story-cycle"
  phase: 4
  purpose: "Execute stories with sprint tracking + Product Reality validation"

  entry:
    required: "governance approval + story assignment"
    from: "orchestrator (after governance check)"

  output:
    - "story completion artifact"
    - "updated sprint-status.yaml"
    - "test results"
    - "journey map (mermaid)"
    - "tool definitions (if agentic)"
    - "visual regression report"

  steps: 10
  estimated_duration: "varies by story complexity"

  enhanced_features:
    - "User Journey Simulation (Step 1a)"
    - "Agent Tool Specification (Step 3a)"
    - "Reality Check (Step 6a)"
```

## Frontmatter Template

```yaml
---
stepsCompleted: []
storyKey: "{story_key}"
sprintId: "{sprint_id}"
startedAt: "{timestamp}"
status: "in_progress"
---
```

## Steps Overview v2.0

| Step | Name | Purpose | v2.0 Enhancement |
|------|------|---------|------------------|
| 1 | **Init** | Load story context, verify prerequisites | **+ Deep project analysis** |
| 1a | **User Journey** | The Movie Script Test (Code-Verified) | **+ State machine walk** |
| 2 | **Validate** | Check dependencies, sprint capacity | **+ Evidence-based checklist** |
| 3a | **Agent Tool Spec** | The Brain Check | No change |
| 3 | **Implement** | Execute development work | **+ Enforced grep/glob + conflict detection** |
| 4 | **Test** | Run tests, verify coverage | No change |
| 5 | **Review** | Code review, quality check | **+ Real code path walking + HTML validation** |
| 6 | **Done** | Update sprint-status, mark complete | No change |
| 6a | **Reality Check** | The Demo | **+ Journey map comparison** |
| 7 | **Retrospective** | Summary and learnings | No change |

## Quality Gates v2.0

### Code Compliance Gates (Unchanged)
- **Story Start Gate**: Prerequisites verified (Step 2)
- **Test Gate**: Tests passing, coverage >= 80% (Step 4)
- **Done Gate**: All acceptance criteria met (Step 6)

### Product Reality Gates (v2.0 Enhanced)
- **Deep Analysis Gate**: Context loaded via grep/glob (Step 1) - **Prevents shallow understanding**
- **Journey Reality Gate**: Code-verified journey (Step 1a) - **Prevents fragmented UX**
- **Evidence Gate**: Validation with file:line (Step 2) - **Prevents untested assumptions**
- **Architectural Gate**: Conflict detection (Step 3) - **Prevents clean architecture violations**
- **Code Reality Gate**: Path walking + HTML (Step 5) - **Prevents shipping broken code**
- **Visual Reality Gate**: Reality check passed (Step 6a) - **Prevents shipping broken UI**

## Enhanced Step Details v2.0

### Step 1: Init (v2.0 Enhanced)
- **Agent Role**: Context Analyst + Code Walker
- **Action**: Load story context AND run deep project analysis
  - Glob related files (components, stores, routes, domains)
  - Grep for related patterns and usages
  - Map cross-impact with other stories/epics
  - Detect dead code and overlaps
- **Output**: `context-loaded.yaml` with grep/glob evidence
- **Detects**: Shallow understanding, missing context, code overlaps

### Step 1a: User Journey Simulation (v2.0 Enhanced)
- **Agent Role**: UX Analyst + Code Verifier
- **Action**: Generate 30-second demo script WITH code path verification
  - Walk through actual code paths for each journey step
  - Map state machine (initial/loading/error/success)
  - Verify every transition has code support
- **Output**: `journey-map.mermaid` with code evidence
- **Detects**: Island features, split-brain workflows, ghost results, dead ends, **missing state handlers**

### Step 2: Validate (v2.0 Enhanced)
- **Agent Role**: Quality Gatekeeper
- **Action**: Evidence-based validation checklist
  - Every check requires file:line evidence
  - Command output captured as evidence
  - Cross-references verified
- **Output**: `validation-evidence.yaml`
- **Detects**: Missing prerequisites, incomplete dependencies, stale context

### Step 3a: Agent Tool Specification (Unchanged)
- **Agent Role**: Prompt Engineer
- **Action**: Define JSON Schema, System Prompt, Permission levels
- **Output**: `tool-definition.json`, `prompt-context.md`
- **Detects**: Orphan tools, permission gaps, silent thinking, vague triggers

### Step 3: Implement (v2.0 Enhanced)
- **Agent Role**: Developer
- **Action**: TDD with ENFORCED pre-coding analysis
  - MUST run grep/glob BEFORE writing any code
  - MUST detect architectural conflicts
  - MUST document dead code/overlaps
- **Output**: Code changes with analysis evidence
- **Detects**: Clean architecture violations, circular deps, god patterns

### Step 5: Review (v2.0 Enhanced)
- **Agent Role**: Code Reviewer + QA + Sceptic
- **Action**: Real code analysis with extreme skepticism
  - Read actual changed files (not just diffs)
  - Walk through code paths for every AC
  - Extract and validate HTML output
  - Map requirements to actual implementation
- **Output**: `code-review-report.yaml` with evidence
- **Detects**: Implementation gaps, broken paths, untested edge cases

### Step 6a: Reality Check (v2.0 Enhanced)
- **Agent Role**: QA User + UX Auditor
- **Action**: End-to-end UI verification with journey comparison
  - Compare actual journey to Step 1a map
  - Validate all states (initial/loading/error/success/empty)
  - Check for visual breaks and context switches
- **Output**: `visual-regression-report.md` with journey delta
- **Detects**: Visual breaks, missing states, zombie features, result hiding, **journey drift**

## Integration

**Entry**: From orchestrator after governance approval

**Exit**: To orchestrator with completion status

**Updates**: sprint-status.yaml, workflow-status.yaml

## Location

`_bmad-ext/modules/implementation/workflows/story-cycle/`

---

**Version**: 2.0.0
**Last Updated**: 2026-01-12
**Changes**: v2.0 - Deep analysis, evidence-based validation, real code verification
