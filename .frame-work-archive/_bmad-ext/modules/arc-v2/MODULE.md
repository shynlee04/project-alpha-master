---
name: "arc-v2"
description: "Architecture Remediation v2 - Diagnostic-first, 6-domain scanning, platform-aware strategies"
version: "2.0.0"
tier: "module"
phase: "0"
status: "active"
category: "remediation"
entry_point: "/diagnostic-first"
updated: "2026-01-15"

integration_points:
  reads_from:
    - "_bmad-ext/state/LOOP_STATE.yaml"
    - "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
    - "_bmad-ext/orchestrator/routing-rules.yaml"
  writes_to:
    - "_bmad-output/scans/{domain}-scan-{date}.yaml"
    - "_bmad-output/remediations/"
    - "_bmad-ext/state/LOOP_STATE.yaml"
  invoked_by:
    - "master-orchestrator"
    - "governance"

children:
  type: "agent"
  count: 5
  list:
    - "context-validator"
    - "domain-scanner"
    - "store-refactorer"
    - "component-splitter"
    - "typescript-fixer"

architecture_domains:
  domains: 6
  list:
    - "persistence"
    - "sync"
    - "state"
    - "routing"
    - "agents"
    - "workspace"

triggers:
  - "architecture remediation"
  - "diagnostic first"
  - "scan architecture"
  - "domain scan"

entry_points:
  commands:
    - "/diagnostic-first"
    - "/domain-scan"
    - "/store-refactor"
    - "/component-split"
    - "/fix-typescript"
---

# Architecture Remediation v2.0 (ARC-V2)

## Description

Fresh architecture remediation module designed to address the systemic issues in Project Alpha:

| Problem | Solution |
|---------|----------|
| **Stale Context Poisoning** | Diagnostic-First - always scan before plan |
| **Platform Divergence** (FSA vs IndexedDB) | Domain Isolation with platform-aware strategies |
| **State Boundary Collapse** | Clear 6-domain architecture |
| **Agent CRUD + User CRUD chaos** | Permission matrix and capability boundaries |
| **Superficial Fixes** | Journey-first remediation, not component-first |
| **1,800+ tangled files** | Targeted scans with relevance scoring |

---

## Architecture

### 6-Domain Model

```
+------------------+     +------------------+     +------------------+
|   PERSISTENCE    |     |      SYNC        |     |      STATE       |
|------------------|     |------------------|     |------------------|
| - Dexie/IndexedDB|     | - FSA (Desktop)  |     | - Zustand stores |
| - Quota mgmt     |     | - IndexedDB (Mob)|     | - React state    |
| - Schema mgmt    |     | - Conflict res   |     | - UI state       |
+------------------+     +------------------+     +------------------+
         |                       |                       |
         +-----------------------+-----------------------+
                                 |
                    +---------------------------+
                    |         ROUTING           |
                    |---------------------------|
                    | - Workspace routing       |
                    | - Cross-workspace access  |
                    | - Project bindings        |
                    +---------------------------+
                                 |
         +-----------------------+-----------------------+
         |                       |                       |
+------------------+     +------------------+     +------------------+
|     AGENTS       |     |       RAG        |     |        UX        |
|------------------|     |------------------|     |------------------|
| - CRUD ops       |     | - Tool perms     |     | - Components     |
| - Key passing    |     | - Citations      |     | - Error bounds   |
| - Provider mgmt  |     | - Context window |     | - User journeys  |
+------------------+     +------------------+     +------------------+
```

### Key Principles

1. **Diagnostic-First**: No remediation without fresh scan (<4 hours old)
2. **Domain Isolation**: Each domain has clear boundaries and interfaces
3. **Platform-Aware**: Strategies differ for Desktop (FSA) vs Mobile (IndexedDB)
4. **Journey-Centric**: Fix complete user journeys, not isolated components
5. **Evidence-Based**: All decisions traced to scan findings

---

## Integration Points

### Connects To (_bmad-ext/)

| Component | Path | description |
|-----------|------|---------|
| Loop State | `state/LOOP_STATE.yaml` | Track remediation progress |
| Artifact Registry | `state/ARTIFACT_REGISTRY.yaml` | Register scan outputs |
| Routing Rules | `orchestrator/routing-rules.yaml` | Route remediation stories |
| Quality Scanner | `agents/quality-scanner-ext.md` | Delegate scans |
| Dev Agent | `agents/dev-ext.md` | Execute fixes |

### Deprecates (_bmad/modules/)

| Path | Status | Reason |
|------|--------|--------|
| `architecture-remediation/README.md` | STALE | Claims 1,172 TS errors (actual: 0) |
| `architecture-remediation/config/` | STALE | References wrong epics |
| `architecture-remediation/agents/` | REPLACE | Move to arc-v2/agents |
| `architecture-remediation/workflows/` | REPLACE | Move to arc-v2/workflows |

---

## Module Structure

```
_bmad-ext/modules/arc-v2/
├── MODULE.md (this file)
├── agents/
│   ├── context-validator.md      # Session-start sub-agent
│   ├── domain-scanner.md         # 6-domain targeted scanner
│   ├── store-refactorer.md       # Zustand store refactoring specialist
│   ├── component-splitter.md     # React component splitting specialist
│   ├── workspace-architect.md    # File system & architecture specialist
│   ├── journey-mapper.md         # User journey analyzer (TODO)
│   └── remediation-executor.md   # Fix executor with rollback (TODO)
├── workflows/
│   ├── diagnostic-first.md       # Always scan before plan
│   ├── domain-remediation.md     # Per-domain fix workflow
│   └── journey-repair.md         # Journey-centric repair
├── scanners/
│   ├── persistence-scan.md       # Dexie/IndexedDB scan
│   ├── sync-scan.md              # FSA vs IndexedDB sync
│   ├── state-scan.md             # Zustand/React state
│   ├── routing-scan.md           # Cross-workspace routing
│   ├── agents-scan.md            # Agent CRUD/permissions
│   └── ux-scan.md                # Component/journey scan
└── config/
    ├── domains.yaml              # 6-domain definitions
    ├── thresholds.yaml           # Scan thresholds
    └── platform-strategies.yaml  # FSA vs IndexedDB strategies
```

---

## Usage

### 1. Context Validation (Session Start)

Before ANY remediation work:

```yaml
# Invoke context-validator
trigger: "User mentions architecture, refactoring, stores, routing"
agent: "arc-v2/agents/context-validator.md"
action:
  - Validate user prompt accuracy
  - Map prompt to actual code structures
  - Check for stale context (<4 hours)
  - Return relevance-scored file list
```

### 2. Diagnostic-First Workflow

```yaml
# Always scan before planning
workflow: "arc-v2/workflows/diagnostic-first.md"
steps:
  1. Identify target domain(s)
  2. Run domain-specific scanner
  3. Generate fresh evidence
  4. Create remediation plan from EVIDENCE (not assumptions)
  5. Execute with rollback capability
```

### 3. Domain-Specific Remediation

```yaml
# Route to correct scanner
domain: "state"
scanner: "arc-v2/scanners/state-scan.md"
output: "_bmad-output/scans/state-scan-{date}.yaml"
```

---

## Governance

### Freshness Rules

| Artifact Type | Max Age | Action if Stale |
|---------------|---------|-----------------|
| Scan Results | 4 hours | Re-scan required |
| Remediation Plans | 24 hours | Re-plan from fresh scan |
| Domain Reports | 48 hours | Partial re-scan |
| Architecture Docs | Permanent | No expiry (Tier 1) |

### Validation Gates

Before any code change:

1. **Evidence Gate**: Scan results exist and are fresh
2. **Domain Gate**: Change is within declared domain boundaries
3. **Journey Gate**: User journey impact assessed
4. **Rollback Gate**: Rollback plan documented

---

## Anti-Patterns (What We're Fixing)

### Old Module Problems

1. **Assumed State**: "1,172 TypeScript errors" without verification
2. **Stale Plans**: 991-line YAML that was never updated
3. **Wrong Epic Focus**: Referenced CC-1, CP-1 while active was EPIC-FS
4. **Isolated Fixes**: Component splitting without journey context
5. **No Scanning**: Workflows didn't verify claims

### New Module Solutions

1. **Verified State**: Run `pnpm tsc --noEmit` before claiming errors
2. **Fresh Plans**: Generate from scan results, not historical docs
3. **Current Epic**: Read from `AGENTS.md` Quick Reference
4. **Journey-First**: Trace user flow before refactoring
5. **Always Scan**: Every workflow starts with diagnostic

---

## Entry Point

### Via EXCALIBUR (Recommended)
```bash
# Activate via ext-master agent
/ext-master
# Then select: [AR] Architecture Remediation v2
```

### Direct Entry
```bash
# Load workflow directly
cat _bmad-ext/modules/arc-v2/workflows/diagnostic-first.md
```

```bash
# Start fresh remediation session
1. Read this MODULE.md
2. Load context-validator agent
3. Run diagnostic-first workflow
4. Receive scan results
5. Execute domain-specific remediation
```

---

**Module Owner**: arc-v2
**Integrates With**: `_bmad-ext/orchestrator/routing-rules.yaml`
**Last Updated**: 2026-01-11

---

## Remediation Agents (NEW)

### Active Agents (Ready for Deployment)

| Agent | Domain | description | Status |
|-------|--------|---------|--------|
| `context-validator.md` | All | Pre-execution prompt validation | ✅ Ready |
| `domain-scanner.md` | All | 6-domain targeted scanning | ✅ Ready |
| `store-refactorer.md` | STATE | Zustand store splitting | ✅ Ready |
| `component-splitter.md` | UX | React component splitting | ✅ Ready |
| `workspace-architect.md` | ROUTING | File structure architecture | ✅ Ready |

### Agent Activation Matrix

```yaml
store_refactorer:
  triggers:
    - store > 120 lines
    - Epic CC-1 activation
    - Epic CP-1 activation
  coordinates_with:
    - domain-scanner (for analysis)
    - component-splitter (if store has embedded components)

component_splitter:
  triggers:
    - component > 300 lines
    - god component detected
  coordinates_with:
    - domain-scanner (for analysis)
    - store-refactorer (if component contains stores)

workspace_architect:
  triggers:
    - file in wrong layer
    - cross-workspace duplication
    - circular dependencies
  coordinates_with:
    - domain-scanner (for analysis)
```

---

**Version**: 2.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
