# Deep-Scan Module

**Module ID**: `deep-scan`
**Version**: 1.0.0
**Created**: 2026-01-04
**Status**: `ACTIVE`
**Integration**: Claude Code, OpenCode, BMAD Architecture Remediation

## Module Overview

Comprehensive code-first diagnostic framework that systematically scans the entire codebase to produce **audit-grade, evidence-backed findings** with actionable remediation plans. Unlike document-based analysis, this module operates directly on source code files using specialized scanning agents.

### Design Philosophy

This module combines the best approaches from two paradigms:

| Paradigm | Source | Key Contribution |
|----------|--------|------------------|
| **Evidence-First Iterative** | GPT | Raw facts with path-level evidence, falsifiable findings, audit-grade proofs |
| **Multi-Agent Structured** | Gemini | Specialized domain agents, cycle-based execution, cross-validation synthesis |

### Key Differentiators

1. **Code-First**: Scans actual source files, not documentation
2. **Evidence-Backed**: Every finding includes file paths, line numbers, and grep-able patterns
3. **Audit-Grade**: Outputs are traceable, falsifiable, and legally defensible
4. **Platform-Integrated**: Works with Claude Code, OpenCode, and BMAD frameworks
5. **Incremental**: Can run partial scans for targeted analysis

## Module Purpose

Replace reactive debugging with **proactive systematic diagnosis**:

- **Detect** architectural drift, code smells, and technical debt
- **Quantify** risk with measurable metrics and blast radius analysis
- **Prioritize** issues by severity (P0-P3) and impact surface
- **Generate** actionable remediation backlogs with acceptance criteria
- **Validate** fixes with repeatable command sets

## Scan Domains

### Primary Domains (Phase 1)

| Domain | Agent | Scan Focus |
|--------|-------|------------|
| **State & Stores** | `state-scanner` | Store duplication, god stores, circular deps, Zustand patterns |
| **Type Safety** | `types-scanner` | TypeScript errors, contract drift, barrel exports |
| **Persistence** | `persistence-scanner` | IndexedDB operations, quota handling, migrations |
| **Architecture** | `architecture-scanner` | Layer violations, god components, service gaps |
| **Agent/RAG** | `agent-rag-scanner` | Tool permissions, context pipeline, citations |

### Secondary Domains (Phase 2)

| Domain | Agent | Scan Focus |
|--------|-------|------------|
| **Mobile/UX** | `ux-scanner` | Touch targets, responsive failures, i18n gaps |
| **Cross-Workspace** | `workspace-scanner` | Event bus, sync status, project bindings |
| **Security** | `security-scanner` | API key exposure, input validation, XSS vectors |
| **Performance** | `performance-scanner` | Bundle size, render counts, memory leaks |

## Evidence Protocol

Every finding MUST include an **Evidence Block** for audit-grade traceability:

```yaml
finding:
  statement: "Two independent persistence stacks exist for workspace state"
  falsifiable: true  # Can be proven false with evidence
  severity: P0  # Critical | High | Medium | Low

evidence:
  primary_files:
    - path: "src/lib/state/workspace-store.ts"
      lines: "1-450"
      pattern: "export const useWorkspaceStore"
    - path: "src/infrastructure/persistence/stores/workspace/index.ts"
      lines: "1-235"
      pattern: "export const useWorkspaceStore"
  imports:
    - from: "src/routes/ide.tsx:15"
      imports: "@/lib/state/workspace-store"
    - from: "src/routes/knowledge.tsx:22"
      imports: "@/infrastructure/persistence/stores/workspace"
  grep_command: "grep -r 'useWorkspaceStore' src --include='*.ts' --include='*.tsx'"

impact:
  affected_routes:
    - "/ide"
    - "/knowledge"
    - "/notes"
  blast_radius: 12  # Number of files affected
  data_loss_risk: HIGH  # State divergence between stores

remediation:
  shape: "Consolidate into single SoT at infrastructure/persistence"
  contracts:
    - "Single WorkspaceStore export"
    - "Facade at old location for backwards compatibility"
    - "Data migration script for existing users"
  effort_hours: 8-12

validation:
  commands:
    - cmd: "grep -c 'useWorkspaceStore' src/lib/state/"
      expected: "0 or 1 (facade only)"
    - cmd: "pnpm typecheck"
      expected: "0 errors"
    - cmd: "pnpm test --run"
      expected: "100% pass rate"
```

## Module Structure

```
_bmad/modules/deep-scan/
├── README.md (this file)
├── agents/
│   ├── state-scanner.md           # State & store analysis
│   ├── types-scanner.md           # TypeScript & contracts
│   ├── persistence-scanner.md     # IndexedDB & Dexie
│   ├── architecture-scanner.md    # Layer boundaries
│   ├── agent-rag-scanner.md       # Agent/RAG correctness
│   ├── ux-scanner.md              # Mobile, i18n, theme
│   ├── workspace-scanner.md       # Cross-workspace integration
│   ├── security-scanner.md        # Security vulnerabilities
│   ├── performance-scanner.md     # Performance bottlenecks
│   └── evidence-synthesizer.md    # Aggregation & risk register
├── workflows/
│   ├── full-scan.md               # Complete codebase scan
│   ├── targeted-scan.md           # Single domain scan
│   ├── incremental-scan.md        # Delta since last scan
│   ├── validation-scan.md         # Post-fix verification
│   └── evidence-synthesis.md      # Risk register generation
├── config/
│   ├── domains.yaml               # Domain definitions
│   ├── thresholds.yaml            # Warning/error limits
│   ├── priorities.yaml            # P0-P3 classification
│   └── exclusions.yaml            # Files to skip
├── artifacts/
│   ├── templates/
│   │   ├── evidence-block.yaml
│   │   ├── domain-inventory.md
│   │   ├── risk-register.md
│   │   └── remediation-backlog.md
│   └── scan-results/              # Output directory (gitignored)
└── references/
    ├── scan-patterns.md           # Common patterns to detect
    ├── remediation-shapes.md      # Standard fix approaches
    └── validation-commands.md     # Verification scripts
```

## Execution Workflow

### Phase A: Domain Inventory (Raw Facts Only)

Each agent produces an inventory artifact with:
- File counts and lists
- Exported symbols
- Domain classification rationale
- **No opinions yet** (facts only)

```yaml
cycle_1_inventory:
  - state-scanner: state_inventory.md
  - types-scanner: types_inventory.md
  - persistence-scanner: persistence_inventory.md

cycle_2_inventory:
  - architecture-scanner: architecture_inventory.md
  - agent-rag-scanner: agent_rag_inventory.md
  - ux-scanner: ux_inventory.md

cycle_3_inventory:
  - workspace-scanner: workspace_inventory.md
  - security-scanner: security_inventory.md
  - performance-scanner: performance_inventory.md
```

### Phase B: Dependency & Boundary Proofs

Agents generate:
- **Import graphs** with edge annotations
- **Write paths** (UI event → store → service → persistence)
- **Cycle detection** with exact edges
- **Boundary violations** with evidence

```yaml
proof_generation:
  high_risk_areas:
    - agent_tools: "lib/agent/tools/** → stores/** → persistence/**"
    - rag_indexing: "presentation/rag/** → lib/rag/** → stores/rag/**"
    - filesystem_sync: "lib/filesystem/** → lib/sync/** → stores/filesystem/**"
    - conversations: "presentation/chat/** → stores/conversation/**"
```

### Phase C: Synthesis & Remediation

Lead architect agent merges evidence into:
1. **Risk Register** (P0-P2 ranked)
2. **Course Correction Backlog** (epics with stories)
3. **Validation Playbook** (commands per fix)

```yaml
synthesis:
  - evidence-synthesizer:
      inputs:
        - all_inventory_files
        - all_proof_files
      outputs:
        - risk-register.md
        - remediation-backlog.md
        - validation-playbook.md
```

## Output Artifacts

### Scan Artifacts (per domain)

| Artifact | Purpose | Agent |
|----------|---------|-------|
| `state-inventory.md` | Store classification, storage keys, dependencies | state-scanner |
| `types-inventory.md` | TS errors, contract drift, barrel gaps | types-scanner |
| `persistence-inventory.md` | DB operations, quota handling, migrations | persistence-scanner |
| `architecture-inventory.md` | Layer violations, god components | architecture-scanner |
| `agent-rag-inventory.md` | Tool permissions, RAG pipeline | agent-rag-scanner |
| `ux-inventory.md` | Mobile gaps, i18n coverage | ux-scanner |
| `workspace-inventory.md` | Event isolation, sync status | workspace-scanner |

### Proof Artifacts

| Artifact | Purpose |
|----------|---------|
| `write-paths.md` | 10+ traced write flows with call chains |
| `import-graph.md` | Full dependency graph with annotations |
| `cycles.md` | Circular dependencies with exact edges |
| `boundary-violations.md` | Cross-layer imports with evidence |

### Synthesis Artifacts

| Artifact | Purpose |
|----------|---------|
| `risk-register.md` | P0-P2 items with blast radius |
| `remediation-backlog.md` | Epics/stories with acceptance criteria |
| `validation-playbook.md` | Repeatable validation commands |
| `architectural-drift.md` | Gap analysis vs target architecture |

## Integration Points

### Claude Code Integration

The module generates artifacts compatible with `.claude/` structure:

```
.claude/
├── skills/
│   └── deep-scan/
│       ├── SKILL.md                # Main skill entry point
│       └── agents/
│           ├── state-scanner.md
│           ├── types-scanner.md
│           └── ...
├── commands/
│   ├── deep-scan-full.md           # /deep-scan-full
│   ├── deep-scan-targeted.md       # /deep-scan [domain]
│   └── deep-scan-validate.md       # /deep-scan-validate
└── context/
    └── deep-scan-results/          # Latest scan results
```

### OpenCode Integration

The module generates artifacts compatible with `.opencode/` structure:

```
.opencode/
├── skill/
│   └── deep-scan/
│       ├── SKILL.md
│       └── ...
├── command/
│   ├── deep-scan-full.md
│   ├── deep-scan-targeted.md
│   └── deep-scan-validate.md
└── agent/
    └── deep-scan/
        ├── state-scanner.md
        └── ...
```

### Architecture Remediation Integration

Deep-scan feeds directly into the architecture-remediation module:

```
Deep-Scan → Risk Register → ARC Epics → Remediation Workflows
    ↓            ↓              ↓              ↓
Diagnosis   Prioritization   Planning      Execution
```

## Usage

### Full Scan

```bash
# BMAD invocation
@bmad/modules/deep-scan/workflows/full-scan

# Claude Code slash command
/deep-scan-full

# OpenCode command
/deep-scan-full
```

### Targeted Scan

```bash
# Scan specific domain
@bmad/modules/deep-scan/workflows/targeted-scan domain=state

# Available domains:
# state, types, persistence, architecture, agent-rag, ux, workspace, security, performance
```

### Post-Fix Validation

```bash
# Validate specific fix
@bmad/modules/deep-scan/workflows/validation-scan fix_id="CC-1.3"
```

## Success Criteria

### Scan Completeness

- [ ] All 9 domains scanned
- [ ] 100% file coverage (respecting exclusions)
- [ ] All findings have evidence blocks
- [ ] All high-risk areas have write paths

### Output Quality

- [ ] Risk register has P0-P2 classification
- [ ] Remediation backlog has acceptance criteria
- [ ] Validation playbook has runnable commands
- [ ] All artifacts internally consistent

### Integration

- [ ] Claude Code skills generated
- [ ] OpenCode commands generated
- [ ] ARC module can consume outputs
- [ ] Sprint status updated

## Configuration

### domains.yaml

```yaml
domains:
  - id: state
    name: "State & Stores"
    agent: state-scanner
    scan_paths:
      - "src/infrastructure/persistence/stores/**"
      - "src/lib/state/**"
      - "src/stores/**"
    priority: P0

  - id: types
    name: "Type Safety"
    agent: types-scanner
    scan_paths:
      - "src/**/*.ts"
      - "src/**/*.tsx"
    priority: P0
    
  # ... more domains
```

### thresholds.yaml

```yaml
thresholds:
  store:
    max_lines: 120
    max_functions: 10
    warning_lines: 100
    
  component:
    max_lines: 300
    warning_lines: 250
    
  typescript_errors:
    max_production: 0
    max_test: 50
    
  coverage:
    min_percentage: 80
    warning_percentage: 75
```

## Related Modules

- **architecture-remediation**: Consumes scan outputs for remediation
- **story-dev-cycle**: Uses scan findings for story creation
- **validation-gates**: Uses validation playbook for quality gates

---

**Module Owner**: @bmad-core-bmad-master
**Module Maintainers**: @bmad-bmm-architect, @bmad-bmm-analyst
**Last Updated**: 2026-01-04
**Module Status**: ACTIVE - READY FOR EXECUTION
