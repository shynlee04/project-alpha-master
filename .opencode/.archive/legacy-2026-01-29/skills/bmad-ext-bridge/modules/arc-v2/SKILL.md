---
name: bmad-ext-arc-v2-bridge
description: Bridge to BMAD-ext Architecture Remediation v2.0 module. Provides diagnostic-first approach, 6-domain scanning, and specialized remediation agents (store-refactorer, component-splitter, workspace-architect). Use for architecture refactoring, god-store elimination, and component normalization.
version: 2.0.0
category: bridge
parent: bmad-ext-bridge
children:
  - arc-context-validator
  - arc-domain-scanner
  - arc-store-refactorer
  - arc-component-splitter
  - arc-workspace-architect
priority: 12
agents:
  - master-architect
  - store-refactorer
  - component-splitter
  - workspace-architect
triggers:
  - architecture remediation
  - arc-v2
  - god store
  - god component
  - refactoring
  - /ext-arc
---

# BMAD-EXT ARC-v2 Bridge

**description**: Gateway to Architecture Remediation v2 with diagnostic-first approach, 6-domain model, and platform-aware strategies.

## Module Overview

**Location**: `_bmad-ext/modules/arc-v2/`
**Version**: 2.0.0
**Status**: ACTIVE
**Phase**: 0 (Governance Foundation - Special)
**Replaces**: `_bmad/modules/architecture-remediation/` (stale)

## 6-Domain Model

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
  +------------------+   +------------------+   +------------------+
  |     AGENTS       |   |       RAG        |   |        UX        |
  |------------------|   |------------------|   |------------------|
  | - CRUD ops       |   | - Tool perms     |   | - Components     |
  | - Key passing    |   | - Citations      |   | - Error bounds   |
  | - Provider mgmt  |   | - Context window |   | - User journeys  |
  +------------------+   +------------------+   +------------------+
```

## Key Principles

1. **Diagnostic-First**: No remediation without fresh scan (<4 hours old)
2. **Domain Isolation**: Each domain has clear boundaries and interfaces
3. **Platform-Aware**: Strategies differ for Desktop (FSA) vs Mobile (IndexedDB)
4. **Journey-Centric**: Fix complete user journeys, not isolated components
5. **Evidence-Based**: All decisions traced to scan findings

## Agents

### 1. Context Validator

**description**: Pre-execution prompt validation and relevance scoring

**Triggers**:
- User mentions architecture, refactoring, stores, routing
- Session start

**Actions**:
1. Validate user prompt accuracy
2. Map prompt to actual code structures
3. Check for stale context (<4 hours)
4. Return relevance-scored file list

### 2. Domain Scanner

**description**: 6-domain targeted scanning

**Domains**:
- PERSISTENCE: Dexie/IndexedDB, quota, schema
- SYNC: FSA vs IndexedDB, conflict resolution
- STATE: Zustand stores, React state, UI state
- ROUTING: Workspace, cross-workspace, projects
- AGENTS: CRUD operations, permissions
- UX: Components, error boundaries, journeys

### 3. Store Refactorer

**description**: Zustand store splitting and state management optimization

**Triggers**:
- Store > 120 lines
- Epic CC-1 activation
- Epic CP-1 activation

**Capabilities**:
- God-store elimination
- Zustand v5 migration
- Slice extraction
- State boundary definition

### 4. Component Splitter

**description**: React component splitting and normalization

**Triggers**:
- Component > 300 lines
- God component detected

**Capabilities**:
- God-component elimination
- Hook isolation
- Prop interface design
- Composition patterns

### 5. Workspace Architect

**description**: File system and architecture specialist

**Triggers**:
- File in wrong layer
- Cross-workspace duplication
- Circular dependencies

**Capabilities**:
- File structure validation
- Layer violation detection
- Dependency analysis
- Architecture documentation

## Workflows

### Diagnostic-First Workflow

**description**: Always scan before plan - the core ARC workflow

**Steps**:
1. Identify target domain(s)
2. Run domain-specific scanner
3. Generate fresh evidence
4. Create remediation plan from EVIDENCE (not assumptions)
5. Execute with rollback capability

**Location**: `workflows/diagnostic-first.md`

## Freshness Rules

| Artifact Type | Max Age | Action if Stale |
|---------------|---------|-----------------|
| Scan Results | 4 hours | Re-scan required |
| Remediation Plans | 24 hours | Re-plan from fresh scan |
| Domain Reports | 48 hours | Partial re-scan |
| Architecture Docs | Permanent | No expiry (Tier 1) |

## Validation Gates

Before any code change:

1. **Evidence Gate**: Scan results exist and are fresh
2. **Domain Gate**: Change is within declared domain boundaries
3. **Journey Gate**: User journey impact assessed
4. **Rollback Gate**: Rollback plan documented

## Integration Points

### Reads From
- `_bmad-ext/state/LOOP_STATE.yaml` - Track remediation progress
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` - Register scan outputs
- `_bmad-ext/orchestrator/routing-rules.yaml` - Route remediation stories

### Writes To
- `_bmad-output/scans/{domain}-scan-{date}.yaml` - Evidence
- `_bmad-output/remediations/` - Plans
- `_bmad-ext/state/LOOP_STATE.yaml` - Progress

## Quick Commands

| Command | Action |
|---------|--------|
| `/ext-arc` | Load ARC-v2 bridge |
| `/arc-validate` | Run context validator |
| `/arc-scan` | Run domain scanner |
| `/arc-store` | Invoke store refactorer |
| `/arc-split` | Invoke component splitter |
| `/arc-workspace` | Invoke workspace architect |
| `/arc-diagnostic` | Run diagnostic-first workflow |

## Usage Pattern

```bash
# Session start validation
1. Load this bridge
2. Invoke: context-validator
3. Return: prompt_accuracy, relevance_scores, stale_context

# Before any remediation work
1. Load: diagnostic-first workflow
2. Execute: scan target domain
3. Generate: evidence-based plan
4. Execute: remediation with rollback

# Specific remediation
1. Identify: domain (e.g., STATE)
2. Load: domain-scanner for STATE
3. Execute: scan Zustand stores
4. Route: to store-refactorer if >120 lines
5. Execute: split with backward compatibility
```

---

**Source**: `_bmad-ext/modules/arc-v2/MODULE.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-11
