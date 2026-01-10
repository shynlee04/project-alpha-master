# Architecture Remediation v2.0 (ARC-V2)

**Module ID**: `arc-v2`
**Version**: 2.0.0
**Created**: 2026-01-10
**Status**: `ACTIVE`
**Replaces**: `_bmad/modules/architecture-remediation/` (stale, poisoned context)

---

## Purpose

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

| Component | Path | Purpose |
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
│   ├── journey-mapper.md         # User journey analyzer
│   └── remediation-executor.md   # Fix executor with rollback
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
**Last Updated**: 2026-01-10
