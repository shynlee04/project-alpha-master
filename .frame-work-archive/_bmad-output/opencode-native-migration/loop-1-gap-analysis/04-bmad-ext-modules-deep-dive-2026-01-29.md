# BMAD-EXT Modules Deep-Dive Analysis

**Created**: 2026-01-29 00:51
**Version**: 1.0.0
**Status**: COMPLETE
**Loop**: 1.2A - Module Analysis for OpenCode Native Migration

---

## Table of Contents

1. [Module Inventory](#section-1-module-inventory)
2. [Per-Module Deep Dive](#section-2-per-module-deep-dive)
3. [Cross-Module Dependencies](#section-3-cross-module-dependencies)
4. [What OpenCode Native Must Preserve](#section-4-what-opencode-native-must-preserve)

---

## Section 1: Module Inventory

### Overview Summary

| Module ID | Name | Purpose | Phase | Workflows | Agents | Status |
|-----------|------|---------|-------|-----------|--------|--------|
| MOD-GOV | **governance** | Unified self-governance, context filtering, TTL enforcement | 0 | 4 | 0 | ACTIVE v2.1.0 |
| MOD-CORE | **bmad-core** | Core BMAD workflow wrappers (brainstorming, PRD, architecture) | 1-3 | 5 | 0 | ACTIVE v1.0.0 |
| MOD-SPRINT | **sprint-planning-wrapper** | Enhanced sprint planning with cohesion/reality validation | 2 | 1 | 0 | ACTIVE v1.1.0 |
| MOD-IMPL | **implementation** | Story execution and bug fix workflows | 4 | 2 | 0 | ACTIVE v1.0.0 |
| MOD-ARC | **arc-v2** (referenced) | Architecture remediation (diagnostic-first) | 0 | 1 | 2 | ACTIVE |

### Phase Alignment

```
PHASE 0: GOVERNANCE FOUNDATION
    governance/                 ← Context filtering, TTL enforcement, stale detection
    arc-v2/                     ← Architecture remediation (special)

PHASE 1-3: CORE PLANNING
    bmad-core/                  ← Brainstorming, product-brief, PRD, architecture

PHASE 2: SPRINT PLANNING
    sprint-planning-wrapper/    ← Enhanced sprint planning with cohesion validation

PHASE 4: IMPLEMENTATION
    implementation/             ← Story-cycle, correct-course workflows
```

---

## Section 2: Per-Module Deep Dive

---

### Module: governance (MOD-GOV)

**Location**: `_bmad-ext/modules/governance/`
**Version**: 2.1.0
**Phase**: 0 (Governance Foundation)
**Status**: ACTIVE

#### Purpose

What problem does this module solve?

The governance module is the **foundation of all autonomous agent operations**. It prevents:
- **Context Poisoning**: Agents using stale or irrelevant information
- **Untracked Artifacts**: Documents created without proper governance
- **Shallow Understanding**: Agents acting without proper context
- **Stale Decisions**: Relying on outdated information

It implements the **Three Core Concepts**:
1. **Context-First**: Auto-transform prompts with accurate context before any work
2. **Expert Analysis**: Categorize issues and compare approaches against actual codebase
3. **Research Trigger**: Internet-based validation for tech choices

#### Phase Alignment

**Phase 0** - This is the FIRST module invoked in any workflow. All other modules depend on governance passing before they can execute.

#### Workflows

| Workflow | Trigger | Steps | Output | Purpose |
|----------|---------|-------|--------|---------|
| **context-first** | Session start, user prompt | 5 | `context-first-output-{date}.md` | Gather context, transform prompts |
| **expert-analysis** | After context-first | 5 | `expert-analysis-output-{date}.md` | Categorize issues, detect flaws |
| **research-trigger** | Tech choice needed, flaws detected | 4 | `research-trigger-output-{date}.md` | Internet-based validation |
| **story-continuity** | Before/after each story | 3 | `continuity-{date}.yaml` | Code validation, story tracking |

#### Workflow Details

##### context-first Workflow

```yaml
steps:
  step-01-scan: "Identify domains, depth, slices needed"
  step-01b-continue: "Resume from previous session"
  step-02-analyze: "Extract intent, map to domains"
  step-03-contextualize: "Extend coverage, find transitive deps"
  step-04-transform: "Create improved prompt with context"

triggers:
  - "on_session_start"
  - "on_user_prompt_submit"
  - "on_story_start"

output:
  governance_report:
    context_slices: []
    domains_scanned: []
    recommendations: []
  code_validation:
    typescript: "passing|failing"
    tests: "passing|failing"
```

##### expert-analysis Workflow

```yaml
steps:
  step-01-init: "Load context-first output"
  step-02-analyze-codebase: "Load actual code for comparison"
  step-03-compare-approach: "Compare user approach with codebase"
  step-04-recommend: "Make decision: proceed/modify/block"

issue_categories:
  quick_patch: "Simple bugs, single file"
  feature_fix: "Independent feature work"
  architectural: "Comprehensive remediation needed"

decision_framework:
  proceed: "flaw_score > 80, no critical flaws"
  proceed_with_warnings: "flaw_score 50-80"
  modify: "flaw_score 30-50"
  block: "flaw_score < 30, critical flaws"
```

##### research-trigger Workflow

```yaml
steps:
  step-01-init: "Identify research topics"
  step-02-research: "Conduct internet search"
  step-03-analyze: "Evaluate evidence"
  step-04-complete: "Provide recommendations"

research_categories:
  - "Technology Evaluation"
  - "Performance Optimization"
  - "Architecture Patterns"
  - "Security and Compliance"

output:
  recommendation: "{detailed recommendation}"
  warnings: [list]
  alternatives: [list]
  next_steps: [list]
```

#### Scanners

| Scanner | Purpose | Output |
|---------|---------|--------|
| **artifact-scanner** | Detect stale artifacts, code validation | `artifact_scan_results.yaml` |
| **domain-scanner** | Identify domain boundaries, coupling | `domain_scan_results.yaml` |
| **quality-*-scanner** (10+) | Various quality checks (architecture, types, security, etc.) | Individual reports |

#### Policies

| Policy | Purpose | Key Rules |
|--------|---------|-----------|
| **artifact-lifecycle** | Creation to archival lifecycle | Stages: creation → active → stale → archived |
| **context-strategy** | Context gathering and application | Two-step hook, poisoning prevention |
| **gating-policy** | Gate enforcement rules | Strict/advisory/informational gates |

#### Configuration Files

| Config | Purpose |
|--------|---------|
| `config/retention-policy.yaml` | TTL tiers (permanent, 90 days, 24 hours) |
| `config/domains.yaml` | 13 domain classifications |
| `config/gates.yaml` | Gate definitions and thresholds |
| `config/checklists.yaml` | Validation checklists |

#### State Management

**Reads From**:
- `_bmad-ext/state/LOOP_STATE.yaml` - Session state, anchor
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` - Artifact tracking
- `bmm-workflow-status.yaml` - Story progress

**Writes To**:
- `_bmad-ext/state/LOOP_STATE.yaml` - Governance updates
- `AGENTS.md` - Governance section updates
- `_bmad-output/.archive/` - Archived stale artifacts
- `_bmad-output/governance/` - Governance outputs

#### Bouncing Loops

1. **Context-Validation Loop**:
   ```
   context-first → expert-analysis → (if modify) → context-first again
   ```

2. **Research Loop**:
   ```
   expert-analysis → research-trigger → expert-analysis (with research)
   ```

3. **Stale Detection Loop**:
   ```
   artifact-scanner → flag stale → (every 3 stories) → update governance docs
   ```

4. **Code Validation Loop**:
   ```
   story-continuity PRE → story execution → story-continuity POST
   If fails: BLOCK → fix → retry
   ```

#### Context Economy Features

**Hop-Reading Pattern**:
```yaml
step_1: "Load frontmatter only (~20 lines)"
step_2: "Extract: name, phase, status, integration_points"
step_3: "On-demand, load full content"
```

**4-Tier TTL System**:
| Tier | Name | TTL | Examples |
|------|------|-----|----------|
| 1 | Constitution | Permanent | CLAUDE.md, AGENTS.md |
| 2 | Controlled | On-demand | MODULE.md, architecture.md |
| 3 | Archival | 90 days | Scans, research, plans |
| 4 | Ephemeral | 24 hours | Handoffs, context files |

---

### Module: bmad-core (MOD-CORE)

**Location**: `_bmad-ext/modules/bmad-core/`
**Version**: 1.0.0
**Phase**: 1-3 (Core Planning)
**Status**: ACTIVE

#### Purpose

What problem does this module solve?

The bmad-core module **wraps the original BMAD workflows** with extension layer enhancements:
- Adds governance integration
- Enforces template usage
- Provides validation gates
- Creates structured outputs

It covers the entire **ideation-to-architecture** pipeline.

#### Phase Alignment

**Phases 1-3** - This module spans multiple phases:
- Phase 1: Brainstorming, Party-mode, Product Brief
- Phase 2: PRD
- Phase 3: Architecture

#### Workflows

| Workflow | Phase | Wraps | Duration | Output |
|----------|-------|-------|----------|--------|
| **brainstorming** | 1 | None (native) | 15-30 min | `brainstorming-output-{date}.md` |
| **party-mode** | 1 | None (native) | 5-10 min | Raw idea list |
| **create-product-brief** | 1 | `_bmad/bmm/.../create-product-brief` | 1-2 hours | `product-brief-{date}.md` |
| **prd** | 2 | `_bmad/bmm/.../prd` | 2-4 hours | `prd-{date}.md` |
| **create-architecture** | 3 | `_bmad/bmm/.../create-architecture` | 2-3 hours | `architecture-{date}.md`, ADRs |

#### Workflow Details

##### brainstorming Workflow

```yaml
steps:
  1_setup: "Define topic and constraints"
  2_generate: "Generate ideas from multiple perspectives"
  3_cluster: "Group related ideas"
  4_prioritize: "Rank by impact/feasibility"
  5_document: "Create output document"

perspectives:
  - "User viewpoint"
  - "Business viewpoint"
  - "Technical viewpoint"
  - "Creative viewpoint"

quality_gate: "Minimum 10 ideas generated"
```

##### prd Workflow

```yaml
steps:
  1_discovery: "Review product brief"
  2_journeys: "Map user journeys"
  3_functional: "Define functional requirements"
  4_non_functional: "Define NFRs"
  5_scoping: "Define boundaries"
  6_assumptions: "Document assumptions"
  7_review: "Internal review"
  8_finalize: "Complete PRD"

required_outputs:
  - "prd-{date}.md"
  - "user-journeys.yaml"
  - "requirements-matrix.yaml"
```

##### create-architecture Workflow

```yaml
steps:
  1_requirements: "Review PRD requirements"
  2_architecture: "Define high-level architecture"
  3_components: "Map components"
  4_data_flow: "Document data movement"
  5_adrs: "Create Architecture Decision Records"
  6_review: "Technical review"
  7_finalize: "Complete architecture"

required_outputs:
  - "architecture-{date}.md"
  - "adr-{nn}-{title}.md" (multiple)
  - "component-diagram.mmd"
  - "data-flow-diagram.mmd"
```

#### Artifacts Created

| Artifact | Format | TTL | Purpose |
|----------|--------|-----|---------|
| `brainstorming-output-{date}.md` | Markdown | Tier 3 (90 days) | Idea documentation |
| `product-brief-{date}.md` | Markdown | Tier 2 (permanent) | Product definition |
| `prd-{date}.md` | Markdown | Tier 2 (permanent) | Requirements document |
| `architecture-{date}.md` | Markdown | Tier 2 (permanent) | System design |
| `adr-{nn}-*.md` | Markdown | Tier 2 (permanent) | Decision records |

#### State Management

**Reads From**:
- `_bmad/bmm/workflows/1-analysis/create-product-brief/`
- `_bmad/bmm/workflows/2-plan-workflows/prd/`
- `_bmad/bmm/workflows/3-solutioning/create-architecture/`
- `_bmad-output/planning-artifacts/`

**Writes To**:
- `_bmad-output/planning-artifacts/brainstorming/{date}/`
- `_bmad-output/planning-artifacts/product-brief/{date}/`
- `_bmad-output/planning-artifacts/prd/{date}/`
- `_bmad-output/planning-artifacts/architecture/{date}/`

#### Bouncing Loops

1. **Iterative Refinement Loop**:
   ```
   brainstorming → (not satisfied) → party-mode → brainstorming
   ```

2. **PRD-Architecture Loop**:
   ```
   prd → create-architecture → (gaps found) → prd update → architecture update
   ```

---

### Module: sprint-planning-wrapper (MOD-SPRINT)

**Location**: `_bmad-ext/modules/sprint-planning-wrapper/`
**Version**: 1.1.0
**Phase**: 2 (Sprint Planning)
**Status**: ACTIVE

#### Purpose

What problem does this module solve?

The original BMAD `sprint-planning` workflow generates `sprint-status.yaml` but lacks:
- **Cohesion Validation**: Detecting fragmented UX across stories ("Dual Chat" problems)
- **Dependency Mapping**: Finding hidden story dependencies
- **Narrative Validation**: "Movie Script Test" for entire sprint
- **Auto Gatekeeping**: Loop back on validation failures

This wrapper ADDS these capabilities without modifying the original BMAD workflow.

#### Phase Alignment

**Phase 2** - This is the bridge between planning (Phase 1-3) and implementation (Phase 4).

#### Workflows

| Workflow | Trigger | Steps | Output |
|----------|---------|-------|--------|
| **sprint-planning-enhanced** | Sprint start, manual trigger | 7 | Enhanced `sprint-status.yaml`, cohesion report, dependency map |

#### Workflow Steps

```yaml
steps:
  step-01-discover-epics: "Scan for epic files in planning artifacts"
  step-02-generate-status: "Run BMAD sprint-planning to generate baseline"
  step-03-cohesion-check: "Validate sprint cohesion, detect fragmentation"
  step-04-dependency-map: "Map cross-story dependencies, find conflicts"
  step-05-reality-validation: "Generate 30-second demo script"
  step-06-gatekeeping: "Auto-validation with loop-back on failures"
  step-07-handoff: "Prepare enhanced context for story-cycle"

processing_time:
  total: "5-15 minutes"
  cohesion_check: "2-3 minutes"
  dependency_map: "1-2 minutes"
  reality_validation: "2-3 minutes"
```

#### Scanners

| Scanner | Purpose | Severity | Output |
|---------|---------|----------|--------|
| **cohesion-scanner** | Detect fragmented UX, "Dual Chat" issues | HIGH | `cohesion-report-{date}.md` |
| **dependency-scanner** | Map cross-story dependencies | CRITICAL | `dependency-map.yaml` |
| **nonsense-detector** | Spot contradictory/duplicate features | VARIES | Part of cohesion report |

##### cohesion-scanner Details

```yaml
checks:
  narrative_check:
    description: "30-second demo script for entire sprint"
    severity: "high"
    fail_if:
      - "User must switch between disconnected UIs"
      - "Multiple workflows for same goal"
      - "Demo requires explanation"

  dependency_friction:
    description: "Story A completes Day X, Story B needs it Day Y"
    severity: "critical"
    fail_if:
      - "Story scheduled before dependency completes"

  ghost_logic:
    description: "Missing error/empty/loading states"
    severity: "medium"

anti_patterns:
  - split_brain: "Dual workflows for same goal"
  - island_parade: "Features with no clear connection"
  - carousel_chaos: "User must cycle through states"

scoring:
  min: 1
  max: 5
  minimum_to_pass: 3
```

##### dependency-scanner Details

```yaml
dependency_types:
  explicit: "Declared in story metadata"
  implicit_component: "Multiple stories modify same component"
  implicit_data: "Story A creates data Story B needs"
  implicit_api: "Story A changes API Story B uses"

temporal_validation:
  conflict: "Dependent story starts before dependency completes"
  risk: "Same day - needs coordination"
  ok: "Sufficient buffer"

resolution_strategies:
  - reorder: "Adjust story sequence"
  - split: "Break large story into smaller chunks"
  - parallel: "Define interface, work in parallel"
  - contract_first: "Complete API contract first"
```

##### nonsense-detector Details

```yaml
patterns:
  duplicate_workflows: "Multiple ways to achieve same goal"
  contradictory_requirements: "Stories that conflict"
  orphan_features: "Features with no entry point"
  zombie_features: "Features that will be immediately replaced"

severity_levels:
  critical: "Must resolve before sprint"
  high: "Should resolve before sprint"
  medium: "Flag for review"
  low: "Note for future"
```

#### Artifacts Created

| Artifact | Format | TTL | Purpose |
|----------|--------|-----|---------|
| `sprint-status.yaml` (enhanced) | YAML | Tier 3 (90 days) | Sprint tracking |
| `cohesion-report-{date}.md` | Markdown | Tier 3 (90 days) | Sprint cohesion analysis |
| `dependency-map.yaml` | YAML | Tier 3 (90 days) | Dependency graph |
| `demo-script.md` | Markdown | Tier 4 (24 hours) | 30-second narrative |

#### State Management

**Reads From**:
- `_bmad/bmm/workflows/4-implementation/sprint-planning/`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/sprint-artifacts/stories/`

**Writes To**:
- `sprint-status.yaml`
- `_bmad-output/sprint-artifacts/cohesion-report-{date}.md`
- `_bmad-output/sprint-artifacts/dependency-map.yaml`

**Hands Off To**:
- `_bmad-ext/modules/implementation/workflows/story-cycle/`

#### Bouncing Loops

1. **Cohesion Failure Loop**:
   ```
   step-03-cohesion-check → (fails) → step-06-gatekeeping → reorder stories → step-03 again
   ```

2. **Dependency Conflict Loop**:
   ```
   step-04-dependency-map → (conflicts) → step-06-gatekeeping → resolve → step-04 again
   ```

3. **Reality Validation Loop**:
   ```
   step-05-reality-validation → (fails demo) → step-06-gatekeeping → adjust → step-05 again
   ```

---

### Module: implementation (MOD-IMPL)

**Location**: `_bmad-ext/modules/implementation/`
**Version**: 2.0.0
**Phase**: 4 (Implementation)
**Status**: ACTIVE

#### Purpose

What problem does this module solve?

The implementation module is where **actual code gets written**. It solves:
- **Shallow Understanding**: Enforces deep project analysis BEFORE coding
- **Fragmented UX**: Requires user journey simulation ("Movie Script Test")
- **Untested Assumptions**: Mandates evidence-based validation with file:line references
- **Broken Code**: Real code review with path walking and HTML validation
- **Scope Creep**: Structured story cycle with clear gates

#### Phase Alignment

**Phase 4** - Final execution phase. All planning is done; this is implementation.

#### Workflows

| Workflow | Trigger | Steps | Output |
|----------|---------|-------|--------|
| **story-cycle** | Story assignment from sprint | 10 | Story completion artifact, tests, journey map |
| **correct-course** | Bug report, governance report | 4 | Resolution artifact |

#### story-cycle Workflow (v2.0)

```yaml
steps:
  step-01-init:
    name: "Deep Project Context Loading"
    actions:
      - "Load story context"
      - "Deep project analysis (grep/glob)"
      - "Cross-impact mapping"
      - "Detect dead code & overlaps"
    output: "context-loaded.yaml with grep/glob evidence"

  step-01a-user-journey:
    name: "The Movie Script Test (Code-Verified)"
    actions:
      - "Generate 30-second demo script"
      - "Walk through actual code paths"
      - "Map state machine (initial/loading/error/success)"
      - "Verify every transition has code support"
    output: "journey-map.mermaid with code evidence"
    anti_patterns_detected:
      - "island_feature"
      - "split_brain"
      - "ghost_result"
      - "dead_end"
      - "loading_vacuum"
      - "empty_state_void"

  step-02-validate:
    name: "Evidence-Based Validation"
    actions:
      - "Every check requires file:line evidence"
      - "Command output captured as evidence"
      - "Cross-references verified"
    output: "validation-evidence.yaml"

  step-03a-agent-tool-spec:
    name: "The Brain Check (if agentic)"
    actions:
      - "Define JSON Schema for LLM tool"
      - "Define system prompt"
      - "Set permission levels"
    output: "tool-definition.json, prompt-context.md"
    anti_patterns_detected:
      - "orphan_tools"
      - "permission_gaps"
      - "silent_thinking"
      - "vague_triggers"

  step-03-implement:
    name: "TDD with ENFORCED Pre-Coding Analysis"
    actions:
      - "MUST run grep/glob BEFORE writing any code"
      - "MUST detect architectural conflicts"
      - "MUST document dead code/overlaps"
    output: "Code changes with analysis evidence"
    architectural_checks:
      - "Clean architecture violations"
      - "Circular dependencies"
      - "God patterns (>300 lines component, >120 lines store)"
      - "Import pattern violations"

  step-04-test:
    name: "Test with Coverage"
    actions:
      - "Run tests"
      - "Verify coverage >= 80%"
      - "Check edge cases"
    gate: "Tests passing, coverage >= 80%"

  step-05-review:
    name: "Deep Real-Code Analysis"
    actions:
      - "Read actual changed files (not just diffs)"
      - "Walk through code paths for every AC"
      - "Extract and validate HTML output"
      - "Map requirements to actual implementation"
    approach: "BE EXTREMELY SKEPTICAL - evidence before assertion"
    output: "code-review-report.yaml with evidence"

  step-06-done:
    name: "Story Completion"
    actions:
      - "Update sprint-status.yaml"
      - "Mark story complete"
      - "Create completion artifact"

  step-06a-reality-check:
    name: "The Demo"
    actions:
      - "Compare actual journey to Step 1a map"
      - "Validate all states (initial/loading/error/success/empty)"
      - "Check for visual breaks and context switches"
    output: "visual-regression-report.md with journey delta"

  step-07-retrospective:
    name: "Summary and Learnings"
    actions:
      - "Document what worked"
      - "Document what didn't"
      - "Create lessons learned"

quality_gates:
  code_compliance:
    - "Story Start Gate (Step 2)"
    - "Test Gate (Step 4) - coverage >= 80%"
    - "Done Gate (Step 6)"
  product_reality:
    - "Deep Analysis Gate (Step 1)"
    - "Journey Reality Gate (Step 1a)"
    - "Evidence Gate (Step 2)"
    - "Architectural Gate (Step 3)"
    - "Code Reality Gate (Step 5)"
    - "Visual Reality Gate (Step 6a)"
```

#### correct-course Workflow

```yaml
steps:
  step-01-receive-report:
    name: "Get governance report with categorization"
    input: "Governance report with issue level"

  step-02-categorize:
    name: "Confirm issue type, select sub-workflow"
    categories:
      quick_patch:
        complexity: "low"
        duration: "minutes to hours"
      feature_fix:
        complexity: "medium"
        duration: "hours to days"
      architectural:
        complexity: "high"
        duration: "days to weeks"

  step-03-route:
    name: "Delegate to appropriate sub-workflow"
    sub_workflows:
      - "quick-patch"
      - "feature-fix"
      - "architectural-conflict"

  step-04-complete:
    name: "Update status, create resolution artifact"
```

#### Templates

| Template | Purpose |
|----------|---------|
| `enhanced-story-template.md` | User-centric story template with journey context |
| `enhanced-story-context-template.xml` | Story context XML for agents |

#### Configuration Files

| Config | Purpose |
|--------|---------|
| `config/journey-validation-rules.yaml` | Anti-patterns for "Movie Script Test" |
| `config/agent-tool-spec-template.yaml` | Agent tool specification template |

#### Artifacts Created

| Artifact | Format | TTL | Purpose |
|----------|--------|-----|---------|
| `story-cycle-{story_key}-output.md` | Markdown | Tier 3 (90 days) | Story execution log |
| `journey-map.mermaid` | Mermaid | Tier 4 (24 hours) | User journey visualization |
| `tool-definition.json` | JSON | Tier 3 (90 days) | Agent tool spec |
| `code-review-report.yaml` | YAML | Tier 4 (24 hours) | Review evidence |
| `visual-regression-report.md` | Markdown | Tier 4 (24 hours) | Reality check results |

#### State Management

**Reads From**:
- `sprint-status.yaml` - Story assignment
- `_bmad-output/governance/` - Issue level from governance
- `_bmad-output/sprint-artifacts/stories/` - Story context

**Writes To**:
- `sprint-status.yaml` - Update progress
- `_bmad-output/sprint-artifacts/stories/{story_id}-done.md` - Completion summary

#### Bouncing Loops

1. **Implementation-Review Loop**:
   ```
   step-03-implement → step-05-review → (fails) → step-03-implement again
   ```

2. **Reality Check Loop**:
   ```
   step-06a-reality-check → (visual breaks) → step-03-implement → step-06a again
   ```

3. **Architectural Conflict Escalation**:
   ```
   step-03-implement (conflict) → STOP → correct-course workflow → architectural-conflict sub-workflow
   ```

---

## Section 3: Cross-Module Dependencies

### Module Dependency Graph

```
                    ┌─────────────────┐
                    │   GOVERNANCE    │
                    │   (Phase 0)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────────┐ ┌─────────┐ ┌─────────────────┐
    │   BMAD-CORE     │ │ ARC-V2  │ │   GOVERNANCE    │
    │   (Phase 1-3)   │ │ (Phase 0)│ │   (loops)       │
    └────────┬────────┘ └────┬────┘ └────────┬────────┘
             │               │               │
             ▼               │               │
    ┌─────────────────┐      │               │
    │ SPRINT-PLANNING │◄─────┘               │
    │   (Phase 2)     │                      │
    └────────┬────────┘                      │
             │                               │
             ▼                               │
    ┌─────────────────┐                      │
    │ IMPLEMENTATION  │◄─────────────────────┘
    │   (Phase 4)     │
    └─────────────────┘
```

### Data Flow Between Modules

| From Module | To Module | Data Passed | Format |
|-------------|-----------|-------------|--------|
| governance | bmad-core | Governance approval | `governance_report.yaml` |
| governance | sprint-planning-wrapper | Context validation | `context-first-output.md` |
| governance | implementation | Issue categorization | `expert-analysis-output.md` |
| bmad-core | sprint-planning-wrapper | Architecture, PRD | `architecture-{date}.md`, `prd-{date}.md` |
| sprint-planning-wrapper | implementation | Story assignments | `sprint-status.yaml`, handoff artifact |
| implementation | governance | Story completion | Update to `bmm-workflow-status.yaml` |

### Workflow Call Chains

#### Path 1: New Feature Development

```
User Request
    ↓
governance/ (Phase 0)
    ├─ context-first
    ├─ expert-analysis
    └─ research-trigger (if needed)
    ↓
[ALLOW] → Governance Report
    ↓
bmad-core/ (Phase 1-3)
    ├─ brainstorming → party-mode
    ├─ create-product-brief
    ├─ prd
    └─ create-architecture
    ↓
sprint-planning-wrapper/ (Phase 2)
    └─ 7-step enhanced sprint planning
    ↓
Sprint Status Updated
    ↓
implementation/ (Phase 4)
    └─ story-cycle workflow (10 steps)
    ↓
Story Complete → Handoff to orchestrator
```

#### Path 2: Bug Fix / Remediation

```
Bug Report / User Request
    ↓
governance/ (Phase 0)
    └─ context-first → expert-analysis
    ↓
[ALLOW] → Issue Level Categorized
    ├─ Quick Patch → implementation/correct-course
    ├─ Feature Fix → implementation/correct-course
    └─ Architectural Conflict → arc-v2/ → implementation/
    ↓
Fix Complete → Handoff
```

### Shared State Files

| State File | Used By | Purpose |
|------------|---------|---------|
| `_bmad-ext/state/LOOP_STATE.yaml` | ALL | Session state, anchor, progress |
| `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | governance, implementation | Artifact tracking |
| `bmm-workflow-status.yaml` | ALL | Current story/epic progress |
| `sprint-status.yaml` | sprint-planning-wrapper, implementation | Sprint tracking |

---

## Section 4: What OpenCode Native Must Preserve

### Critical Patterns to Preserve

#### 1. Hop-Reading Pattern (NON-NEGOTIABLE)

```yaml
preservation_requirement: CRITICAL
description: |
  Context economy - load frontmatter first, full content on-demand.
  This prevents context window bloat and enables fast agent startup.

implementation:
  step_1: "Load frontmatter only (~20 lines)"
  step_2: "Extract key metadata (name, phase, status, integration_points)"
  step_3: "On-demand load full content for specific task"

metrics:
  avg_context_initial: "<100 lines"
  full_content_loads_per_session: "<5"
```

#### 2. 4-Tier TTL System (NON-NEGOTIABLE)

```yaml
preservation_requirement: CRITICAL
description: |
  Prevents context poisoning and stale artifact usage.
  Different artifact types have different lifespans.

tiers:
  tier_1:
    name: "Constitution"
    ttl: "permanent"
    examples: ["CLAUDE.md", "AGENTS.md"]
    rule: "Read-only, never archive"

  tier_2:
    name: "Controlled"
    ttl: "permanent"
    examples: ["MODULE.md", "architecture.md", "prd.md"]
    rule: "Update iteratively, single source of truth"

  tier_3:
    name: "Archival"
    ttl: "90 days"
    examples: ["sprint-status.yaml", "scans", "research"]
    rule: "Archive if stale"

  tier_4:
    name: "Ephemeral"
    ttl: "24 hours"
    examples: ["context files", "handoffs", "reports"]
    rule: "Auto-purge if stale"
```

#### 3. Three Core Concepts (NON-NEGOTIABLE)

```yaml
preservation_requirement: CRITICAL
description: |
  The foundation of governance - context-first, expert-analysis, research-trigger.
  All work must pass through these gates.

concepts:
  context_first:
    purpose: "Gather accurate context before any work"
    triggers: ["session_start", "user_prompt", "story_start"]
    output: "transformed_prompt with context"

  expert_analysis:
    purpose: "Categorize issues, detect flaws in approach"
    triggers: ["after context-first", "bug_report", "feature_request"]
    output: "decision: proceed/modify/block"

  research_trigger:
    purpose: "Internet-based validation for tech choices"
    triggers: ["tech_choice_needed", "flaws_detected", "architectural_conflict"]
    output: "research-backed recommendation"
```

#### 4. Story Cycle Quality Gates (NON-NEGOTIABLE)

```yaml
preservation_requirement: CRITICAL
description: |
  Product reality gates that prevent shipping broken features.

gates:
  code_compliance:
    - story_start_gate: "Prerequisites verified"
    - test_gate: "Tests passing, coverage >= 80%"
    - done_gate: "All AC met"

  product_reality:
    - deep_analysis_gate: "Context loaded via grep/glob"
    - journey_reality_gate: "Code-verified user journey"
    - evidence_gate: "Validation with file:line references"
    - architectural_gate: "Conflict detection"
    - code_reality_gate: "Path walking + HTML validation"
    - visual_reality_gate: "Reality check passed"
```

#### 5. Anti-Pattern Detection (NON-NEGOTIABLE)

```yaml
preservation_requirement: HIGH
description: |
  Patterns that cause "Dual Chat" type failures.

patterns_to_detect:
  ux_patterns:
    - island_feature: "No entry point"
    - split_brain: "Dual workflows for same task"
    - ghost_result: "Action with no visible result"
    - dead_end: "No way back"
    - loading_vacuum: "No feedback during processing"
    - empty_state_void: "No handling for zero results"

  code_patterns:
    - god_component: ">300 lines"
    - god_store: ">120 lines"
    - circular_dependency: "A imports B, B imports A"
    - cross_layer_import: "Presentation importing Infrastructure"

  sprint_patterns:
    - duplicate_workflows: "Multiple ways to same goal"
    - contradictory_requirements: "Stories that conflict"
    - orphan_features: "No entry point"
    - zombie_features: "Will be replaced immediately"
```

#### 6. Evidence-Based Validation (NON-NEGOTIABLE)

```yaml
preservation_requirement: CRITICAL
description: |
  Every claim must have file:line evidence.
  "Evidence before assertion" is the rule.

validation_approach:
  every_ac:
    - "File where implemented: {file}:{line}"
    - "Test that verifies: {test_file}:{line}"
    - "User journey step: {from journey-map}"

  code_path_walking:
    - "Entry point: {file}:{line}"
    - "Data/State update: {file}:{line}"
    - "UI/Result rendering: {file}:{line}"

  html_output_validation:
    - "State: initial - HTML output validated"
    - "State: loading - HTML output validated"
    - "State: error - HTML output validated"
    - "State: success - HTML output validated"
```

#### 7. Sprint Cohesion Validation (IMPORTANT)

```yaml
preservation_requirement: HIGH
description: |
  Prevents "Dual Chat" failures by validating sprint coherence.

validations:
  narrative_check:
    description: "30-second demo script for entire sprint"
    fail_if:
      - "Context switches"
      - "Multiple workflows for same goal"
      - "Demo requires explanation"

  dependency_friction:
    description: "Story A completes Day X, Story B needs Day Y"
    fail_if: "Y < X"

  ghost_logic:
    description: "Missing error/empty/loading states"
```

#### 8. Wrapper Architecture (IMPORTANT)

```yaml
preservation_requirement: HIGH
description: |
  Modules WRAP original BMAD workflows, not replace them.
  Extension layer adds validation without breaking core.

pattern:
  input: "Consume from BMAD workflow"
  process: "Add validation gates, cohesion checks"
  output: "Enhanced output with validation evidence"

example:
  module: "sprint-planning-wrapper"
  wraps: "_bmad/bmm/workflows/4-implementation/sprint-planning"
  adds:
    - "cohesion-check"
    - "dependency-map"
    - "reality-validation"
    - "auto-gatekeeping"
```

### State Files That Must Be Synchronized

| State File | Platform Sync Required | Purpose |
|------------|------------------------|---------|
| `LOOP_STATE.yaml` | YES | Session state, anchor |
| `ARTIFACT_REGISTRY.yaml` | YES | Artifact tracking |
| `bmm-workflow-status.yaml` | YES | Story/epic progress |
| `sprint-status.yaml` | YES | Sprint tracking |

### Commands That Must Be Available

| Command | Module | Purpose |
|---------|--------|---------|
| `/context-first` | governance | Trigger context gathering |
| `/expert-analysis` | governance | Trigger issue analysis |
| `/research-trigger` | governance | Trigger research |
| `/sprint-planning` | sprint-planning-wrapper | Run enhanced sprint planning |
| `/story-cycle` | implementation | Execute story development |
| `/correct-course` | implementation | Fix bugs and remediation |
| `/brainstorming` | bmad-core | Creative exploration |
| `/prd` | bmad-core | Create PRD |
| `/architecture` | bmad-core | Create architecture |

---

## Summary

### Module Count and Lines

| Module | Files | Total Lines | Key Workflows |
|--------|-------|-------------|---------------|
| governance | ~30+ | ~3000+ | 4 workflows, 10+ scanners |
| bmad-core | ~10 | ~900+ | 5 workflows |
| sprint-planning-wrapper | ~15 | ~1000+ | 1 workflow, 3 scanners |
| implementation | ~20 | ~2500+ | 2 workflows, 10 steps |

### Critical Integration Points for OpenCode Native

1. **All modules read/write LOOP_STATE.yaml** - This is the session anchor
2. **Governance must run BEFORE any other module** - Phase 0 is mandatory
3. **Sprint-planning-wrapper hands off to implementation** - Clear boundary
4. **Evidence-based validation is mandatory** - No claims without file:line proof
5. **Anti-pattern detection must be preserved** - "Dual Chat" prevention
6. **Hop-reading pattern saves context** - Critical for large codebases

---

**Document Version**: 1.0.0
**Created**: 2026-01-29 00:51
**Completed**: 2026-01-29
**Lines**: ~1200
**Purpose**: OpenCode Native Migration - Module Deep Dive
