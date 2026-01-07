---
version: 1.0.0
created: 2026-01-07T22:00:00+07:00
status: planning
phase: formal-workflow-design
team: Team A
orchestrator: @bmad-core-bmad-master
---

# Formal PRD Workflow Plan
## BMAD Planning Cycle - Phase 1 of 4

> **Purpose**: Define the formal `bmad-bmm-workflows-create-prd.md` workflow specification
> **Context**: Course correction after brownfield docs proved unreliable
> **Integration**: Must align with sprint-status.yaml and sprint-planning workflow

---

## Executive Summary

This plan defines the autonomous PRD generation workflow as the first step in creating fresh single-source-of-truth planning documents. The workflow will delegate research and analysis tasks to specialized sub-agents, producing an evidence-based PRD grounded in codebase reality.

**Key Differentiators from Brownfield Approach:**
- Code-traced requirements (every claim references file:line)
- Confidence scoring on assertions (HIGH/MEDIUM/LOW)
- Iterative validation gates (not waterfall)
- MCP research integration (Context7, Deepwiki, Exa, Tavily)

---

## Workflow Specification

### File Location
```
.agent/workflows/bmad/bmm/workflows/1-planning/create-prd/workflow.md
```

### Step-File Architecture
Per BMAD patterns, the workflow uses micro-files for each step:

```
.agent/workflows/bmad/bmm/workflows/1-planning/create-prd/
├── workflow.md                    # Main orchestration (this file)
├── step-01-init.md                # Mission capture + validation
├── step-02-codebase-scan.md       # Structure analysis
├── step-03-mcp-research.md        # External research
├── step-04-gap-analysis.md        # Brownfield vs reality
├── step-05-user-journeys.md       # Journey mapping
├── step-06-requirements.md        # Feature extraction
├── step-07-personas.md            # User persona synthesis
├── step-08-constraints.md         # Technical constraints
├── step-09-metrics.md             # Success criteria
├── step-10-draft.md               # PRD document generation
├── step-11-validate.md            # Self-validation
└── step-12-complete.md            # Handoff + reporting
```

---

## Agent Delegation Strategy

### Primary Orchestrator
| Agent | Role | Trigger |
|-------|------|---------|
| `@bmad-bmm-pm` | Product Manager - PRD owner | Workflow initiation |
| `@bmad-bmm-analyst` | Requirements analyst | Codebase analysis |
| `@bmad-bmm-researcher` | External research | MCP tool execution |

### Sub-Agent Delegation Pattern

```yaml
delegation_template:
  spawn_agent:
    mode: claude-code-sub-agent
    instructions: |
      You are executing step-{N} of the PRD generation workflow.

      CONTEXT:
      - Load step file: .agent/workflows/bmad/bmm/workflows/1-planning/create-prd/step-{N:02d}-*.md
      - Execute instructions autonomously
      - Use MCP tools as specified
      - Output results to {output_location}
      - Report completion with artifact locations

      DO NOT:
      - Request interactive input
      - Skip validation checks
      - Exceed token limits for MCP queries

      RETURN:
      - Completion status
      - Artifacts created
      - Items flagged for human review
```

---

## Phase-by-Phase Execution Plan

### Phase 1: Mission & Vision Capture (Step 01)

**Agent**: `@bmad-bmm-pm` (Product Manager)

**Actions**:
```yaml
input_sources:
  - agent-os/product/mission.md (if exists)
  - README.md (project root)
  - package.json (description field)

capture_questions:
  - What problem does this product solve?
  - Who is the primary target user?
  - What is the core value proposition?
  - What differentiates from alternatives?

outputs:
  - mission_context.yaml (structured capture)
  - vision.md (narrative form)
```

**Validation Gate**:
- Mission statement captured: REQUIRED
- Target user identified: REQUIRED
- Value proposition clear: WARN if vague

---

### Phase 2: Codebase Structure Analysis (Step 02)

**Agent**: `@bmad-bmm-analyst`

**Actions**:
```yaml
analysis_tasks:
  directory_scan:
    - src/routes/          # Entry points
    - src/components/     # UI elements
    - src/lib/            # Business logic
    - src/stores/         # State management
    - src/infrastructure/ # Persistence

  feature_indicators:
    - grep: "@epic|@story|TODO|FIXME"
    - grep: "export.*function|export.*component"
    - identify: route definitions

  complexity_metrics:
    - file counts by directory
    - line counts (identify god files >300 lines)
    - import analysis (circular dependencies)
```

**Outputs**:
- `codebase_structure.yaml` - Hierarchical directory tree
- `feature_inventory.yaml` - Discovered features with file:line references
- `complexity_report.yaml` - Metrics and flags

---

### Phase 3: External Research (Step 03)

**Agent**: `@bmad-bmm-researcher`

**MCP Tool Execution** (Parallel):
```yaml
mcp_research_tasks:
  context7_queries:
    - library: "@tanstack/ai"
      query: "AI agent system architecture patterns"
    - library: "@tanstack/react-router"
      query: "file-based routing best practices"
    - library: "zustand"
      query: "state management patterns 2025"

  deepwiki_queries:
    - repo: "TanStack/ai"
      question: "How to structure AI product features"
    - repo: "pmndrs/zustand"
      question: "Store organization patterns"

  exa_searches:
    - query: "AI note-taking competitive analysis 2025"
      tokens: 3000
    - query: "browser-based IDE product requirements"
      tokens: 3000

  tavily_searches:
    - query: "local-first AI assistant market trends"
      type: deep
```

**Research Synthesis Rules**:
- Minimum 5 successful iterations per MCP query
- Score results by relevance (1-10)
- Keep only top 3 results per query
- Document all URLs for traceability

**Outputs**:
- `market_research.yaml` - Competitive landscape
- `best_practices.md` - Industry patterns with citations
- `research_log.md` - All queries and results

---

### Phase 4: Gap Analysis (Steps 04-05)

**Agent**: `@bmad-bmm-analyst`

**Analysis Dimensions**:
```yaml
gap_analysis:
  documentation_vs_reality:
    compare:
      - brownfield docs vs actual code structure
      - documented features vs implemented features
      - claimed capabilities vs working features

    output: gap_matrix.yaml
    fields:
      - feature_id
      - documented: true/false
      - implemented: true/false
      - working: true/false
      - evidence: file:line
      - confidence: HIGH/MEDIUM/LOW

  user_journey_mapping:
    trace:
      - Entry point → Feature → Outcome
      - Identify working paths
      - Identify broken paths
      - Identify missing paths

    output: user_journeys.yaml
    fields:
      - journey_id
      - entry_point: route
      - steps: [step1, step2, ...]
      - status: working|broken|missing
      - evidence: file:line
      - blockers: [list]
```

---

### Phase 5: Requirements Synthesis (Steps 06-09)

**Agent**: `@bmad-bmm-pm`

**Feature Categorization**:
```yaml
feature_categories:
  existing_working:
    definition: Implemented and verified working
    source: codebase analysis + testing
    evidence: file:line references
    confidence: HIGH

  existing_broken:
    definition: Implemented but non-functional
    source: sprint-status.yaml blockers
    evidence: error logs, failing tests
    confidence: HIGH

  planned_documented:
    definition: In docs but not implemented
    source: brownfield docs
    evidence: doc references
    confidence: MEDIUM

  planned_inferred:
    definition: Inferred from TODO/@epic tags
    source: code annotations
    evidence: file:line
    confidence: LOW
```

**User Persona Generation**:
```yaml
persona_extraction:
  sources:
    - route structure (implies user types)
    - component organization (implies workflows)
    - existing personas (brownfield, if valid)

  output: personas.yaml
  structure:
    - persona_id
    - name
    - role
    - goals
    - pain_points
    - typical_journeys
    - confidence_score
```

---

### Phase 6: PRD Document Generation (Steps 10-12)

**Agent**: `@bmad-bmm-pm`

**Document Structure**:
```markdown
---
version: 1.0.0-draft
generated: {timestamp}
agent: bmad-bmm-pm
phase: planning
status: draft
stepsCompleted: [1,2,3,4,5,6,7,8,9,10,11,12]
confidence_scores: true
---

# Product Requirements Document: {project_name}

## Document Control
- Version: 1.0.0-draft
- Generated: {timestamp}
- Status: Draft - Pending Review
- Source: Codebase analysis + MCP research

## Executive Summary
[From mission_context.yaml - confidence: HIGH]

## Problem Statement
[From gap_analysis + user_journeys - confidence: HIGH]

## Target Users
[From personas.yaml - confidence per persona]

## User Stories & Journeys
[From user_journeys.yaml - code-traced]

## Functional Requirements
### Core Features (Existing - Working) [confidence: HIGH]
### Core Features (Existing - Broken) [confidence: HIGH]
### Planned Features (Documented) [confidence: MEDIUM]
### Planned Features (Inferred) [confidence: LOW]

## Non-Functional Requirements
### Performance
### Security
### Scalability
### Accessibility

## Technical Constraints
[From codebase_structure.yaml]

## Success Metrics
[Derived from product type]

## Dependencies & Risks
[From gap_analysis + market_research]

## Appendix
### Research References
### Evidence Index
### Items Requiring Human Review
```

---

## Validation Gates

### Gate 1: Mission Capture (After Step 01)
```yaml
required:
  - mission_context.yaml exists
  - At least 3 of 4 questions answered
  - Target user identified

on_fail:
  - Infer from package.json README
  - Mark confidence as LOW
```

### Gate 2: Codebase Access (After Step 02)
```yaml
required:
  - codebase_structure.yaml exists
  - At least 5 directories mapped
  - feature_inventory.yaml has 10+ entries

on_fail:
  - FAIL workflow - cannot proceed without codebase
```

### Gate 3: Research Completion (After Step 03)
```yaml
required:
  - market_research.yaml exists
  - At least 5 MCP queries successful
  - best_practices.md has citations

on_fail:
  - Continue with codebase-only analysis
  - Flag as "research-limited"
```

### Gate 4: Gap Analysis (After Step 05)
```yaml
required:
  - gap_matrix.yaml exists
  - user_journeys.yaml has 3+ journeys
  - At least 1 gap identified

on_fail:
  - WARN if no gaps found (suspicious)
```

### Gate 5: PRD Completeness (After Step 11)
```yaml
required:
  - prd.md exists
  - Line count > 200
  - All sections populated
  - Confidence scores present
  - At least 3 user stories

on_fail:
  - Re-run step 10 with adjusted parameters
  - Max retries: 2
```

---

## Handoff Protocol

### Completion Report Template
```markdown
## PRD Workflow Complete

**Status**: ✅ Draft Complete
**Output**: _bmad-output/planning-artifacts/prd.md
**Lines**: {line_count}
**Sections**: 12/12

### Confidence Summary
| Section | Confidence | Notes |
|---------|------------|-------|
| Executive Summary | HIGH | Source-traced |
| Problem Statement | HIGH | Evidence-backed |
| User Journeys | HIGH | Code-verified |
| Functional Req | HIGH | Working features validated |
| Planned Features | MEDIUM | Inferred from TODOs |
| Non-Functional | LOW | Needs human input |

### Items Flagged for Review
1. [List LOW confidence items]
2. [List inferred requirements]

### Research Metrics
- Context7 queries: {count}
- Deepwiki queries: {count}
- Exa searches: {count}
- Tavily searches: {count}

### Codebase Analysis
- Directories scanned: {count}
- Files analyzed: {count}
- Features discovered: {count}
- User journeys traced: {count}

### Next Action
→ Human review required
→ After approval: /bmad-bmm-workflows-create-architecture
```

---

## Integration with Sprint Status

### Updates to sprint-status.yaml
```yaml
prd_workflow:
  status: draft-complete
  timestamp: {completion_time}
  artifacts:
    - _bmad-output/planning-artifacts/prd.md
    - _bmad-output/planning-artifacts/mission_context.yaml
    - _bmad-output/planning-artifacts/codebase_structure.yaml
    - _bmad-output/planning-artifacts/feature_inventory.yaml
    - _bmad-output/planning-artifacts/user_journeys.yaml

  metrics:
    total_features: {count}
    working_features: {count}
    broken_features: {count}
    planned_features: {count}
    confidence_score: {percentage}
```

---

## Error Recovery Matrix

| Failure Point | Detection | Recovery | Retry Limit |
|---------------|-----------|----------|-------------|
| Mission missing | mission.yaml not found | Infer from codebase | N/A |
| Codebase locked | File read denied | FAIL workflow | 0 |
| MCP timeout | No response after 30s | Continue without research | N/A |
| Empty section | Post-generation validation | Fill with placeholder + LOW flag | 2 |
| Line count < 200 | Post-generation check | Re-run step 10 | 2 |

---

## Traceability Requirements

Every claim in the PRD must have:
```yaml
evidence_standard:
  functional_requirement:
    - file: "path/to/file.ts"
    - line: 42
    - type: "implementation" | "annotation" | "inference"
    - confidence: HIGH | MEDIUM | LOW

  user_journey:
    - route: "/path"
    - component: "ComponentName"
    - status: "working" | "broken" | "missing"
    - evidence: "file:line"
```

---

## Next Steps After PRD

1. **Human Review** (Required)
   - Validate problem statement
   - Approve user personas
   - Confirm priorities

2. **Architecture Workflow** (`/bmad-bmm-workflows-create-architecture`)
   - Input: Approved PRD
   - Output: architecture.md with ADRs

3. **UX Design Workflow** (`/bmad-bmm-workflows-create-ux-design`)
   - Input: Approved PRD + Architecture
   - Output: ux-design.md

4. **Epics & Stories** (`/bmad-bmm-workflows-create-epics-and-stories`)
   - Input: All previous documents
   - Output: epics.md + sprint-status.yaml

---

## Appendices

### A. Agent Capabilities Reference
| Agent | Best For | Limitations |
|-------|----------|-------------|
| @bmad-bmm-pm | Requirements synthesis | Not for code analysis |
| @bmad-bmm-analyst | Codebase scanning | Not for external research |
| @bmad-bmm-researcher | MCP tool execution | Not for synthesis |

### B. MCP Tool Reference
| Tool | Use Case | Token Limit | Cost Consideration |
|------|----------|-------------|-------------------|
| Context7 | Official docs | 2000/query | Medium |
| Deepwiki | Repo semantics | 3000/query | Low |
| Exa | Semantic search | 3000/search | Medium |
| Tavily | Deep research | 4000/search | High |

### C. File Templates
(To be created during workflow implementation)

---

**Status**: PLANNING COMPLETE - Ready for workflow implementation
**Next Action**: Execute `/bmad-bmm-workflows-create-workflow` with this plan as input
**Estimated Duration**: 2-3 hours autonomous execution
