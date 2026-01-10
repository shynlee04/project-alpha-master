# BMAD Agent Hierarchy Definition

> **Version:** 1.0.0
> **Updated:** 2026-01-10
> **Status:** Phase 2.4 - Agent Hierarchy Skeleton

---

## Overview

The BMAD agent system organizes agents into a hierarchy with:
- **Main Agents**: ≤8 primary agents that receive delegation from orchestrator
- **Sub-Agents**: ≤4 specialized agents per main agent
- **Shared Services**: Infrastructure resources available to all agents

**Total Count:** 7 Main Agents + 1 Shared Service = 8 (within ≤8 limit)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Master Orchestrator                             │
│                    (asgl / bmad-master)                                 │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Governance     │ │   Main Agent 1  │ │   Main Agent 2  │
│  (GOV-001)      │ │  dev-ext        │ │  architect-ext  │
│  Always First   │ │                 │ │                 │
└─────────────────┘ └────────┬────────┘ └─────────────────┘
                             │
                    ┌────────┴────────┐
                    │   Sub-Agents    │
                    │  (≤4 per main)  │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         Shared Services                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │ quality-scanner │  │  handoff-store  │  │ artifact-       │        │
│  │ (10 scanners)   │  │  (registry)     │  │ registry        │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Main Agents (7)

| ID | Agent | Purpose | Wrapped From | Sub-Agents |
|----|-------|---------|--------------|------------|
| **MA-01** | dev-ext | Feature implementation, bug fixes | `_bmad/bmm/agents/dev.md` | tea-ext (testing) |
| **MA-02** | architect-ext | System design, architecture decisions | `_bmad/bmm/agents/architect.md` | (none yet) |
| **MA-03** | analyst-ext | Requirements analysis, research | `_bmad/bmm/agents/analyst.md` | (none yet) |
| **MA-04** | product-management-ext | Backlog, stories, sprint planning | Consolidated from pm-ext + sm-ext | pm, sm (sub-agents) |
| **MA-05** | ux-designer-ext | UI/UX design, wireframes | `_bmad/bmm/agents/ux-designer.md` | (none yet) |
| **MA-06** | tech-writer-ext | Documentation, API docs | `_bmad/bmm/agents/tech-writer.md` | (none yet) |
| **MA-07** | remediation-ext | Architecture remediation | `_bmad/modules/quality/` | store-refactorer, component-splitter |

### Agent Count History

| Date | Count | Change |
|------|-------|--------|
| 2026-01-10 (initial) | 9 | Original set |
| 2026-01-10 (consolidated) | 7 | pm+sm → product-management, quality → shared |

---

## Shared Services (1)

Shared services are NOT counted as main agents - they are infrastructure available to all agents.

| ID | Service | Purpose | Available To |
|----|---------|---------|--------------|
| **SS-01** | quality-scanner | Aggregates 10 domain scanners | All agents (via skill invocation) |

**Why Not a Main Agent?**
- Quality scanner is a tool/service, not a development workflow agent
- It doesn't receive delegation from orchestrator directly
- It's invoked by other agents when scanning is needed
- Moving to shared services reduces main agent count from 9 → 8

---

## Sub-Agent Pattern

### Definition

Sub-agents are specialized agents that:
1. Are invoked ONLY by their parent main agent
2. Receive delegation via internal handoff artifacts
3. Report back to parent (not orchestrator directly)
4. Focus on specific sub-domain of parent's work

### Constraints

```yaml
sub_agent_limits:
  max_per_main: 4
  max_delegation_depth: 2  # main → sub → sub-sub
  handoff_required: true
  parent_approval: true
```

### Sub-Agent to Main Mapping

| Sub-Agent | Parent Main | Purpose |
|-----------|-------------|---------|
| **tea-ext** | dev-ext | Test engineering, test strategy |
| **pm** | product-management-ext | Product management, roadmap |
| **sm** | product-management-ext | Scrum master, story creation |
| **store-refactorer** | remediation-ext | Store splitting remediation |
| **component-splitter** | remediation-ext | Component splitting remediation |
| **typescript-fixer** | remediation-ext | TypeScript error remediation |

---

## Handoff Artifact Structure

### Schema

All handoffs between agents use this structure:

```yaml
---
artifact_id: "{uuid}"
artifact_type: "handoff"  # or "sub-handoff" for sub-agents
parent_id: "{parent-handoff-id or null}"
story_id: "{story-id}"
source_agent: "{agent-name}"
target_agent: "{agent-name}"
created_at: "{iso-8601-timestamp}"
status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"

context_summary: |
  Brief summary of what was done and what needs to happen next.

handoff_data:
  story_file: "{path-to-story-md}"
  validation_results:
    typescript_errors: 0
    tests_passed: true
    test_count: 42
  files_modified:
    - path: "src/..."
      change_type: "created|modified|deleted"
  files_created:
    - "test/..."
  artifacts_produced:
    - "{artifact-id-1}"
    - "{artifact-id-2}"

acceptance_criteria:
  - "All story tasks marked complete"
  - "All tests passing (0 failures)"
  - "No TypeScript errors"
  - "Code follows CLAUDE.md standards"

validation_commands: |
  # Verify TypeScript compilation
  pnpm tsc --noEmit

  # Run all tests
  pnpm vitest run

escalation_path: |
  On failure → Report to {orchestrator|parent-agent} with:
  - Error details from validation
  - Files that need review
  - Suggested recovery action
---
```

### Handoff Flow

```
┌──────────────────┐     handoff      ┌──────────────────┐
│ Orchestrator     │ ───────────────► │ Main Agent       │
│ (asgl)           │                  │ (dev-ext)        │
└──────────────────┘                  └────────┬─────────┘
                                               │
                                               │ sub-handoff
                                               ▼
                                        ┌──────────────┐
                                        │ Sub-Agent    │
                                        │ (tea-ext)    │
                                        └──────┬───────┘
                                               │
                                               │ report back
                                               ▼
                                        ┌──────────────┐
                                        │ Main Agent   │
                                        │ (complete)   │
                                        └──────┬───────┘
                                               │
                                               │ callback
                                               ▼
                                        ┌──────────────┐
                                        │ Orchestrator │
                                        │ (asgl)       │
                                        └──────────────┘
```

---

## Agent Consolidation Details

### Consolidation 1: pm-ext + sm-ext → product-management-ext

**Rationale:**
- Both agents deal with product organization (backlog, stories, sprints)
- PM handles roadmap, features, priorities
- SM handles story creation, sprint tracking
- Frequently work together on same tasks
- Consolidation reduces agent count by 1

**New Structure:**
```yaml
product_management_ext:
  type: "main_agent"
  id: "MA-04"
  sub_agents:
    - id: "pm"
      role: "Product Manager"
      focus: ["roadmap", "backlog", "prioritization"]
    - id: "sm"
      role: "Scrum Master"
      focus: ["stories", "sprints", "ceremonies"]

  handoff_protocol:
    from_orchestrator: "receives product management tasks"
    to_sub_agent: "delegates to pm or sm based on task type"
    from_sub_agent: "receives completion report"
    to_orchestrator: "reports overall completion"
```

**File Changes:**
- Create: `_bmad-ext/agents/product-management-ext.md`
- Archive: `_bmad-ext/agents/pm-ext.md` → `_bmad-ext/.archive/agents/pm-ext.md`
- Archive: `_bmad-ext/agents/sm-ext.md` → `_bmad-ext/.archive/agents/sm-ext.md`

### Consolidation 2: quality-scanner-ext → Shared Service

**Rationale:**
- Quality scanner is not a development workflow agent
- It's a tool/service invoked by other agents
- Doesn't receive delegation from orchestrator directly
- Better classified as infrastructure

**New Structure:**
```yaml
shared_services:
  quality_scanner:
    type: "shared_service"
    id: "SS-01"
    invocation: "via skill or direct agent call"
    available_to: "all agents"
    scanners:
      - state-scanner
      - types-scanner
      - architecture-scanner
      - persistence-scanner
      - security-scanner
      - performance-scanner
      - ux-scanner
      - workspace-scanner
      - agent-rag-scanner
      - evidence-synthesizer
```

**File Changes:**
- Move: `_bmad-ext/agents/quality-scanner-ext.md` → `_bmad-ext/shared-services/quality-scanner.md`
- Update: routing rules to reflect shared service status

---

## Routing Rules Impact

### Before (9 Main Agents)

```yaml
routing_rules:
  - rule_id: "DEV-001"
    agent: "dev-ext"
    priority: "high"

  - rule_id: "QA-001"
    agent: "quality-scanner-ext"
    priority: "medium"
    # ... 7 more rules
```

### After (7 Main Agents + Shared Service)

```yaml
routing_rules:
  # Governance (always first)
  - rule_id: "GOV-001"
    agent: "governance-core"
    priority: "critical"

  # Main Agents
  - rule_id: "DEV-001"
    agent: "dev-ext"
    priority: "high"
    sub_agents: ["tea-ext"]

  - rule_id: "ARCH-001"
    agent: "architect-ext"
    priority: "high"

  - rule_id: "ANL-001"
    agent: "analyst-ext"
    priority: "medium"

  - rule_id: "PROD-001"
    agent: "product-management-ext"
    priority: "medium"
    sub_agents: ["pm", "sm"]

  - rule_id: "UX-001"
    agent: "ux-designer-ext"
    priority: "medium"

  - rule_id: "DOC-001"
    agent: "tech-writer-ext"
    priority: "low"

  - rule_id: "REM-001"
    agent: "remediation-ext"
    priority: "high"
    sub_agents: ["store-refactorer", "component-splitter", "typescript-fixer"]

  # Shared Services (not in main routing)
  shared_services:
    - id: "SS-001"
      service: "quality-scanner"
      invocation: "on_demand"
```

---

## Implementation Checklist

### Phase 2.4 Steps

- [x] Analyze current agent structure
- [x] Identify consolidation opportunities
- [x] Create AGENT-HIERARCHY.md definition
- [ ] Create product-management-ext.md (consolidates pm + sm)
- [ ] Archive pm-ext.md and sm-ext.md
- [ ] Move quality-scanner-ext.md to shared-services/
- [ ] Update orchestrator routing-rules.yaml
- [ ] Update MODULE-ROUTING.yaml agent mappings
- [ ] Create handoff-artifact.schema.yaml
- [ ] Test agent hierarchy with sample workflow

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-10 | Initial agent hierarchy definition for Phase 2.4 |
