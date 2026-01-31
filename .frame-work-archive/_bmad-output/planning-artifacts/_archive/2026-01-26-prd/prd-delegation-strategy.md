# PRD Workflow Delegation Strategy

## Agent Orchestration Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    @bmad-core-bmad-master (Orchestrator)               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Full Planning Cycle (Meta-Orchestration)                          ││
│  │  Phase 1: PRD Generation ←─── WE ARE HERE                          ││
│  │  Phase 2: Architecture (Future)                                    ││
│  │  Phase 3: UX Design (Future)                                       ││
│  │  Phase 4: Epics & Stories (Future)                                ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       /bmad-bmm-workflows-create-prd                   │
│                    (Step-File Architecture: 12 Steps)                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ @bmad-bmm-pm  │           │ @bmad-analyst │           │ @bmad-research│
│  Product Mgr  │           │   Analyst     │           │    Researcher  │
└───────────────┘           └───────────────┘           └───────────────┘
        │                           │                           │
    ┌───┴───┐                   ┌───┴───┐                   ┌───┴───┐
    │ Steps │                   │ Steps │                   │ Steps │
    │ 01    │                   │ 02    │                   │ 03    │
    │ 06    │                   │ 04    │                   │       │
    │ 07    │                   │ 05    │                   │       │
    │ 08    │                   │       │                   │       │
    │ 09    │                   │       │                   │       │
    │ 10    │                   │       │                   │       │
    │ 11    │                   │       │                   │       │
    │ 12    │                   │       │                   │       │
    └───────┘                   └───────┘                   └───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
                        ┌───────────────────────────┐
                        │     MCP Tool Servers       │
                        ├───────────────────────────┤
                        │ • Context7 (official docs)│
                        │ • Deepwiki (repo semantic)│
                        │ • Exa (semantic search)   │
                        │ • Tavily (deep research)  │
                        └───────────────────────────┘
```

## Step-by-Step Routing

| Step | Agent | Task | Output | Validation |
|------|-------|------|--------|------------|
| 01 | @bmad-bmm-pm | Mission capture | mission_context.yaml | Gate 1 |
| 02 | @bmad-analyst | Codebase scan | codebase_structure.yaml | Gate 2 |
| 03 | @bmad-research | MCP research | market_research.yaml | Gate 3 |
| 04 | @bmad-analyst | Gap analysis | gap_matrix.yaml | - |
| 05 | @bmad-analyst | User journeys | user_journeys.yaml | Gate 4 |
| 06 | @bmad-bmm-pm | Requirements | requirements.yaml | - |
| 07 | @bmad-bmm-pm | Personas | personas.yaml | - |
| 08 | @bmad-bmm-pm | Constraints | constraints.yaml | - |
| 09 | @bmad-bmm-pm | Metrics | metrics.yaml | - |
| 10 | @bmad-bmm-pm | PRD draft | prd.md | - |
| 11 | @bmad-bmm-pm | Self-validation | validation_report.yaml | Gate 5 |
| 12 | @bmad-bmm-pm | Completion | completion_report.md | DONE |

## Sub-Agent Spawn Template

```yaml
spawn_sub_agent:
  mode: claude-code-sub-agent
  timeout: 10m
  context:
    workflow: /bmad-bmm-workflows-create-prd
    step: {step_number}
    step_file: .agent/workflows/bmad/bmm/workflows/1-planning/create-prd/step-{step_number:02d}-*.md
    agent: {bmad_agent_type}
    inputs: {input_files}
    output_location: _bmad-output/planning-artifacts/

  instructions: |
    You are {agent} executing step {step_number} of PRD generation.

    1. Load step file: {step_file}
    2. Read completely before executing
    3. Execute autonomously - no interactive prompts
    4. Use MCP tools as specified in step
    5. Output to: {output_location}
    6. Report completion with:
       - Status (SUCCESS/FAILURE/PARTIAL)
       - Artifacts created (file paths)
       - Validation results
       - Items flagged for human review

  handoff:
    on_success: "Load next step file"
    on_failure: "Report error, attempt recovery"
    on_partial: "Flag gaps, continue with warnings"
```

## Research Strategy (Step 03)

### Parallel MCP Queries
```yaml
context7:  # Official docs
  - "@tanstack/ai" → AI agent patterns
  - "@tanstack/react-router" → Routing patterns
  - "zustand" → State management
  iterations: 5 per query

deepwiki:  # Repo semantic understanding
  - "TanStack/ai" → AI feature structure
  - "pmndrs/zustand" → Store organization
  iterations: 5 per query

exa:  # Semantic search
  - "AI note-taking competitive 2025"
  - "browser IDE requirements"
  tokens: 3000 per search

tavily:  # Deep research
  - "local-first AI assistant trends"
  type: deep
```

### Research Synthesis
1. Score results by relevance (1-10)
2. Keep top 3 per query
3. Cross-reference findings
4. Document all URLs for traceability

## Codebase Analysis Strategy (Step 02)

### Scan Targets
```yaml
directories:
  - src/routes/          # Entry points, user flows
  - src/components/     # UI elements
  - src/lib/            # Business logic
  - src/stores/         # State patterns
  - src/infrastructure/ # Persistence

indicators:
  grep_patterns:
    - "@epic|@story"     # Planned work
    - "TODO|FIXME"       # Known issues
    - "export.*function" # Public APIs
    - "create.*Route"    # Route definitions

  metrics:
    - file_count_by_directory
    - line_count_by_file  # Flag >300
    - import_dependency_graph  # Detect cycles
```

## Gap Analysis Strategy (Steps 04-05)

### Comparison Dimensions
```yaml
documentation_vs_reality:
  brownfield_docs/   │  src/ actual
  ───────────────────┼──────────────────
  Feature X documented│ Feature X exists?
  Pattern Y claimed   │ Pattern Y used?
  Component Z in docs │ Component Z found?

### Evidence Standards
| Claim Type | Evidence Required | Confidence |
|------------|------------------|------------|
| Working feature | file:line + test | HIGH |
| Broken feature | file:line + error | HIGH |
| Planned feature | TODO/@epic tag | MEDIUM |
| Inferred need | Route + empty | LOW |
```

## Validation Gates Flow

```
┌─────┐    Gate 1    ┌─────┐    Gate 2    ┌─────┐    Gate 3    ┌─────┐
│ 01  │ ────PASS───→ │ 02  │ ────PASS───→ │ 03  │ ────PASS───→ │ 04  │
│Init │             │Scan │             │MCP  │             │Gap  │
└─────┘             └─────┘             └─────┘             └─────┘
  │                   │                   │                   │
  FAIL               FAIL               WARN               PASS
  │                   │                   │                   │
  ▼                   ▼                   ▼                   ▼
Infer from          FAIL               Continue            ┌─────┐
codebase            (abort)            without            │ 05  │
                                        research           │Jrny │
                                                           └─────┘
                                                              │
                                                           PASS
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Steps 06-09                              │
│                    (Requirements Synthesis)                     │
└─────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌─────┐    Gate 5    ┌─────┐    Gate 6    ┌─────┐
│ 10  │ ────PASS───→ │ 11  │ ────PASS───→ │ 12  │
│Draft│             │Valid│             │Done │
└─────┘             └─────┘             └─────┘
  │                   │                   │
 FAIL                FAIL                COMPLETE
  │                   │                   │
  ▼                   ▼                   ▼
Re-run             Re-run            Handoff to
(max 2)           (max 2)          Architecture
```

## Output Artifacts

### Primary Output
```
_bmad-output/planning-artifacts/
├── prd.md                  # Main deliverable (>200 lines)
├── prd-evidence.yaml       # Traceability index
└── prd-completion-report.md
```

### Intermediate Artifacts
```
_bmad-output/planning-artifacts/
├── mission_context.yaml      # Step 01
├── codebase_structure.yaml   # Step 02
├── feature_inventory.yaml    # Step 02
├── market_research.yaml      # Step 03
├── best_practices.md         # Step 03
├── gap_matrix.yaml           # Step 04
├── user_journeys.yaml        # Step 05
├── personas.yaml             # Step 07
└── constraints.yaml          # Step 08
```

## Integration Points

### With sprint-status.yaml
```yaml
prd_workflow:
  complete: true
  timestamp: {completion_time}
  artifacts: {list}
  metrics:
    features_discovered: {n}
    journeys_traced: {n}
    confidence_score: {n}%

next_workflow: "/bmad-bmm-workflows-create-architecture"
next_prerequisites:
  - prd.md status == "approved"
```

### With Architecture Workflow
```yaml
architecture_input:
  from: prd.md
  sections_used:
    - functional_requirements
    - technical_constraints
    - non_functional_requirements
```

## Execution Timeline

| Phase | Steps | Agent | Duration (est) |
|-------|-------|-------|----------------|
| Init | 01 | @bmad-bmm-pm | 5 min |
| Scan | 02 | @bmad-analyst | 10 min |
| Research | 03 | @bmad-research | 20 min |
| Analysis | 04-05 | @bmad-analyst | 15 min |
| Synthesis | 06-09 | @bmad-bmm-pm | 15 min |
| Draft | 10-11 | @bmad-bmm-pm | 10 min |
| Complete | 12 | @bmad-bmm-pm | 5 min |
| **Total** | **12** | **3 agents** | **~80 min** |

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mission not documented | HIGH | Infer from codebase, mark LOW |
| MCP tools timeout | MEDIUM | Continue with codebase-only |
| Codebase access denied | CRITICAL | FAIL workflow, notify human |
| Generated PRD < 200 lines | MEDIUM | Re-run with verbose mode |
| Low confidence throughout | HIGH | Flag for human review, don't auto-approve |

---

**Status**: Delegation strategy defined
**Next Action**: Implement workflow files using `/bmad-bmm-workflows-create-workflow`
**Estimated Duration**: 80 minutes autonomous execution
