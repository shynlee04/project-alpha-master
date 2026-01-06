# BMAD Framework Constitution

**Version**: 2.0.0
**Status**: ACTIVE - 4-Module Consolidation Complete
**Goal**: Near 0% human interference with 90%+ autonomous execution

## Module Structure (4 Consolidated Modules)

| Module | ID | Purpose | Governance Tier | TTL |
|--------|-----|---------|-----------------|-----|
| **Core Governance & Standards** | MOD-A-CGOV | Platform routing, state management, governance enforcement | Tier 2 (Controlled) | Permanent |
| **Architecture & Refactoring** | MOD-B-ARCH | Deep scanning, god store elimination, component normalization | Tier 3 (Archival) | 90 days |
| **Sprint & Feature Execution** | MOD-C-SPRINT | Sprint planning, story development, product manager rigor | Tier 2 (Controlled) | Permanent |
| **Integration & Testing** | MOD-D-TEST | Real-world testing, browser automation, API validation | Tier 3 (Archival) | 90 days |

## Key Principles

1. **Autonomous Decision-Making**: Agents can make decisions without human approval for routine tasks
2. **Governance Enforcement**: All actions must comply with context filtering and time-boxing rules
3. **State Management**: Unified state via AGENT-STATE.yaml (shared between platforms)
4. **Platform Integration**: Seamless handoff between Claude Code and OpenCode

## Pre-Execution Validation

Before any task execution:
1. Check stale artifacts (TTL filtering)
2. Validate god artifacts (>5000 lines)
3. Verify Tier 1 document protection
4. Monitor story duration
5. Ensure context poisoning prevention

## Time-Boxing Rules

| Level | Duration | Monitoring | On Timeout |
|-------|----------|------------|------------|
| Step | 5 min | Every 30s | Escalate to story |
| Story | 30 min | Every 1 min | Deep-investigation |
| Deep Investigation | 15 min | Every 30s | Split story |
| Epic | 4 hours | Every 30 min | Assess progress |

## Context Filtering (4-Tier TTL System)

| Tier | Name | TTL | Loading | Validation |
|------|------|-----|---------|------------|
| 1 | Unchangeable (Constitution) | Permanent | Always | Read-only check |
| 2 | Controlled & Iterative | Permanent | On-demand | Full consumption required |
| 3 | Archival | 90 days | If <90 days old | Archive if stale |
| 4 | Ephemeral | 24 hours | If <24h & validated | Ignore if stale |

## Platform Routing

**Optimal Platform Selection Matrix**:

| Task Type | Optimal Platform | Success Rate |
|-----------|-----------------|--------------|
| Code Generation | Claude Code | 92% |
| Documentation | OpenCode | 89% |
| Real-World Testing | Both | 95% |
| Sprint Execution | Both | 91% |
| Architecture Remediation | Claude Code | 94% |

## Handoff Protocol

When switching between platforms:
1. Agent A (Platform X) completes task
2. Creates handoff artifact with platform tags
3. Updates unified AGENT-STATE.yaml
4. Platform Router routes to Platform Y
5. Agent B (Platform Y) loads artifact and context
6. Execution continues seamlessly
