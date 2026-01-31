# BMAD Consolidated Giant Module Specification

> **Version:** 1.0.0 | **Date:** 2026-01-14T10:30:00+07:00 | **Status:** SPECIFICATION (Future Implementation)
> **Consolidation:** _bmad + _bmad-ext → Single Source of Truth
> **Platforms:** Claude Code + OpenCode | **Author:** @bmad-bmb-bmad-builder
> **Note:** This is a forward-looking specification. Current implementation uses the existing modules in _bmad-ext/

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Canonical Directory Structure](#2-canonical-directory-structure)
3. [Core Modules](#3-core-modules)
4. [Audit & Guardrails System](#4-audit--guardrails-system)
5. [UI/UX Scanning Patterns](#5-uiux-scanning-patterns)
6. [Platform Integration](#6-platform-integration)
7. [Traceable Linking System](#7-traceable-linking-system)
8. [Workflow Integration](#8-workflow-integration)

---

## 1. Executive Summary

This document consolidates the BMAD framework into a single, unified module that integrates:
- All agent definitions (_bmad/bmb/agents, _bmad-ext/agents)
- All workflows (_bmad/workflows, _bmad-ext/workflows)
- All governance modules (_bmad/modules, _bmad-ext/modules)
- All hooks and protocols (_bmad/hooks, _bmad-ext/hooks)
- Platform-specific configurations (Claude Code + OpenCode)

### Key Principles

- **Single Source of Truth:** All artifacts trace back to this module
- **No Fragmentation:** Every component is mounted and linked
- **Platform Agnostic:** Works with both Claude Code and OpenCode
- **Audit-Ready:** Every change is tracked, validated, and linked

---

## 2. Canonical Directory Structure

```
_bmad-ext/
├── modules/
│   ├── CONSOLIDATED-BMAD-MODULE-2026-01-14.md  ← THIS FILE
│   ├── core/
│   │   ├── agents/
│   │   │   ├── bmad-master.md                   # Master orchestrator
│   │   │   ├── bmad-builder.md                  # Builder agent
│   │   │   └── bmad-ext-master.md               # Extension master
│   │   ├── workflows/
│   │   │   ├── orchestration/
│   │   │   │   ├── delegation.yaml
│   │   │   │   ├── escalation.yaml
│   │   │   │   └── routing.yaml
│   │   │   └── cycles/
│   │   │       ├── story-cycle.yaml
│   │   │       ├── epic-cycle.yaml
│   │   │       └── correct-course.yaml
│   │   └── orchestrator/
│   │       ├── master-orchestrator.md
│   │       └── event-bus.yaml
│   │
│   ├── implementation/
│   │   ├── bmm/
│   │   │   ├── agents/
│   │   │   │   ├── analyst.md
│   │   │   │   ├── architect.md
│   │   │   │   ├── dev.md
│   │   │   │   ├── pm.md
│   │   │   │   ├── sm.md
│   │   │   │   ├── tea.md
│   │   │   │   ├── tech-writer.md
│   │   │   │   ├── ux-designer.md
│   │   │   │   └── quick-flow-solo-dev.md
│   │   │   └── workflows/
│   │   │       ├── sprint-planning.yaml
│   │   │       ├── dev-story.yaml
│   │   │       ├── code-review.yaml
│   │   │       ├── create-story.yaml
│   │   │       └── correct-course.yaml
│   │   │
│   │   ├── bmb/
│   │   │   ├── agents/
│   │   │   │   ├── agent-builder.md
│   │   │   │   ├── module-builder.md
│   │   │   │   └── workflow-builder.md
│   │   │   └── workflows/
│   │   │       ├── create-agent.yaml
│   │   │       ├── create-module.yaml
│   │   │       └── create-workflow.yaml
│   │   │
│   │   └── cis/
│   │       ├── agents/
│   │       │   ├── brainstorming-coach.md
│   │       │   ├── creative-problem-solver.md
│   │       │   ├── design-thinking-coach.md
│   │       │   ├── innovation-strategist.md
│   │       │   ├── presentation-master.md
│   │       │   └── storyteller.md
│   │       └── workflows/
│   │           ├── design-thinking.yaml
│   │           └── innovation-strategy.yaml
│   │
│   ├── governance/
│   │   ├── AUDIT-REPORT.md
│   │   ├── MODULE.md
│   │   ├── config/
│   │   │   ├── checklists.yaml
│   │   │   ├── domains.yaml
│   │   │   ├── gates.yaml
│   │   │   └── retention-policy.yaml
│   │   ├── policies/
│   │   │   ├── artifact-lifecycle.md
│   │   │   ├── context-strategy.md
│   │   │   └── gating-policy.md
│   │   ├── scanners/
│   │   │   ├── agent-cluster-governance-scanner.md
│   │   │   ├── artifact-scanner.md
│   │   │   ├── domain-scanner.md
│   │   │   └── quality-*.md (10 quality scanners consolidated from _bmad)
│   │   └── workflows/
│   │       ├── context-first.yaml
│   │       ├── expert-analysis.yaml
│   │       └── research-trigger.yaml
│   │
│   ├── audit/
│   │   ├── ui-ux-scanner/
│   │   │   ├── layout-violations.md
│   │   │   ├── z-index-violations.md
│   │   │   ├── mobile-responsiveness.md
│   │   │   └── portal-overlay-check.md
│   │   ├── code-scanner/
│   │   │   ├── god-component-detector.md
│   │   │   ├── circular-dependency.md
│   │   │   └── hardcoded-strings.md
│   │   └── guardrails/
│   │       ├── context-pruning.md
│   │       ├── loop-limiter.md
│   │       ├── resource-semaphore.md
│   │       └── storage-quota.md
│   │
│   └── platform/
│       ├── claude-code/
│       │   ├── CLAUDE.md-integration.md
│       │   ├── prompt-templates.md
│       │   ├── mcp-config.json
│       │   └── commands.yaml
│       └── opencode/
│           ├── opencode.jsonc-integration.md
│           ├── rules/
│           │   ├── general-rules.md
│           │   └── governance-rules.md
│           └── skill/
│               └── SKILLS_MANIFEST.yaml
│
├── agents/
│   ├── _template-enhanced-agent.md
│   ├── AGENT-HIERARCHY.md
│   ├── analyst-ext.md
│   ├── architect-ext.md
│   ├── dev-ext.md
│   ├── ext-master-enhanced.md
│   ├── module-builder-ext.md
│   ├── product-management-ext.md
│   ├── tea-ext.md
│   ├── tech-writer-ext.md
│   └── ux-designer-ext.md
│
├── hooks/
│   ├── pre-request-governance.yaml
│   ├── pre-tool-use.yaml
│   ├── post-tool-use.yaml
│   ├── post-execution.yaml
│   ├── session-start.yaml
│   ├── user-prompt-submit.yaml
│   └── scripts/
│       ├── archive-expired-artifacts.cjs
│       ├── check-artifact-freshness.cjs
│       └── check-tier1-protection.cjs
│
├── orchestrator/
│   ├── delegation-protocol.md
│   ├── escalation-protocol.md
│   ├── event-bus.yaml
│   ├── governance-auto-update.md
│   ├── master-orchestrator.md
│   ├── routing-rules.yaml
│   └── sub-agent-definitions.md
│
├── schemas/
│   ├── handoff-artifact.schema.yaml
│   ├── story-context.schema.yaml
│   └── workflow-status.schema.yaml
│
├── state/
│   ├── LOOP_STATE.yaml
│   ├── ARTIFACT_REGISTRY.yaml
│   └── SPRINT_STATUS.yaml
│
├── protocols/
│   └── handoff.md
│
├── shared-services/
│   └── quality-scanner.md
│
├── config.yaml
│
├── README.md
│
└── tree.md
```

---

## 3. Core Modules

### 3.1 Master Orchestrator

**File:** [`orchestrator/master-orchestrator.md`](_bmad-ext/orchestrator/master-orchestrator.md)

**Responsibilities:**
- Coordinates all agent handoffs
- Maintains LOOP_STATE
- Routes stories through Sprint-Planning Wrapper
- Handles escalation protocols

**Entry Points:**
```yaml
routes:
  - pattern: ".*story.*cycle.*"
    handler: "@bmad/core/workflows/story-cycle"
  - pattern: ".*correct.*course.*"
    handler: "@bmad/core/workflows/correct-course"
  - pattern: ".*delegate.*"
    handler: "@bmad/core/orchestration/delegation"
```

### 3.2 Sprint-Planning Wrapper

**File:** [`modules/core/workflows/sprint-planning.yaml`](_bmad-ext/modules/core/workflows/sprint-planning.yaml)

**Stages:**
1. **Cohesion Check** - Validates story cohesion
2. **Dependency Map** - Maps cross-story dependencies
3. **Reality Validation** - Validates feasibility
4. **Gatekeeping** - Enforces governance gates

### 3.3 Story Cycle Engine

**File:** [`modules/core/workflows/story-cycle.yaml`](_bmad-ext/modules/core/workflows/story-cycle.yaml)

**Steps:**
| Step | Name | Guardrail |
|------|------|-----------|
| 01 | Story Creation | UX Gate |
| 02 | Validation | Brain Gate |
| 03 | Implementation | Loop Limiter |
| 04 | Testing | Resource Semaphore |
| 05 | Code Review | Context Pruning |
| 06 | Done | Visual Gate |

---

## 4. Audit & Guardrails System

### 4.1 Runtime Guardrails

#### Context Explosion Prevention

**File:** [`modules/audit/guardrails/context-pruning.md`](_bmad-ext/modules/audit/guardrails/context-pruning.md)

```typescript
// Implementation pattern
const MAX_CONTEXT_TOKENS = 80000;
const PRUNE_THRESHOLD = 0.8;

function useContextPruning() {
  const context = useContext();
  const tokenCount = countTokens(context);

  if (tokenCount > MAX_CONTEXT_TOKENS * PRUNE_THRESHOLD) {
    return pruneOldestMessages(context);
  }

  return context;
}
```

#### Loop Limiter

**File:** [`modules/audit/guardrails/loop-limiter.md`](_bmad-ext/modules/audit/guardrails/loop-limiter.md)

```typescript
const MAX_ITERATIONS = 10;

function useLoopLimiter(workflowId: string) {
  const iterations = useRef(0);

  if (iterations.current >= MAX_ITERATIONS) {
    throw new LoopLimitExceededError({
      workflowId,
      iterations: iterations.current,
      maxAllowed: MAX_ITERATIONS
    });
  }

  iterations.current++;
}
```

#### Resource Semaphore

**File:** [`modules/audit/guardrails/resource-semaphore.md`](_bmad-ext/modules/audit/guardrails/resource-semaphore.md)

```typescript
const MAX_CONCURRENT_BACKGROUND = 1;

async function useBackgroundTaskQueue() {
  const running = await getRunningTasks();

  if (running.length >= MAX_CONCURRENT_BACKGROUND) {
    throw new ResourceBusyError({
      task: 'background-indexing',
      reason: 'Another task is already running'
    });
  }

  return runTask();
}
```

### 4.2 Build-Time Validators

#### God Component Detector

**File:** [`modules/audit/code-scanner/god-component-detector.md`](_bmad-ext/modules/audit/code-scanner/god-component-detector.md)

```bash
# CLI command for detection
audit:god-component --max-lines 300 --strict
```

**Criteria:**
- File exceeds 300 LOC
- Multiple unrelated concerns
- Excessive props interface

#### Circular Dependency Scanner

**File:** [`modules/audit/code-scanner/circular-dependency.md`](_bmad-ext/modules/audit/code-scanner/circular-dependency.md)

```bash
# Using madge
npx madge --circular src/
```

#### Hardcoded String Scanner (I18N)

**File:** [`modules/audit/code-scanner/hardcoded-strings.md`](_bmad-ext/modules/audit/code-scanner/hardcoded-strings.md)

```bash
# ESLint rule
npx eslint --ext .tsx,.ts --rule 'no-hardcoded-strings: error'
```

---

## 5. UI/UX Scanning Patterns

### 5.1 Layout Violation Scanner

**File:** [`modules/audit/ui-ux-scanner/layout-violations.md`](_bmad-ext/modules/audit/ui-ux-scanner/layout-violations.md)

#### Nested Flex/Split Detection

**Query:** `ResizablePanelGroup.*ResizablePanelGroup`

**Violations:**
- Nested resizable panels
- Split-pane inside split-pane
- Deep flex nesting

#### Z-Index Stratification Check

**File:** [`modules/audit/ui-ux-scanner/z-index-violations.md`](_bmad-ext/modules/audit/ui-ux-scanner/z-index-violations.md)

**Allowed Scale:**
| Token | Usage |
|-------|-------|
| z-0 | Base canvas |
| z-10 | Sticky headers/footers |
| z-20 | Resizers / FABs |
| z-30 | Drawers / Slide-overs |
| z-40 | Command Palette / Dialogs |
| z-50 | Toasts / Critical Alerts |

**Violations:**
- Arbitrary values: `z-[100]`, `z-[9999]`
- Inline style: `style={{ zIndex: 100 }}`

### 5.2 Mobile Responsiveness Scanner

**File:** [`modules/audit/ui-ux-scanner/mobile-responsiveness.md`](_bmad-ext/modules/audit/ui-ux-scanner/mobile-responsiveness.md)

**Detection Queries:**
- `w-[...px]` - Hardcoded pixel widths
- `min-w-[...px]` - Arbitrary minimums
- `max-w-full` missing on mobile breakpoints

### 5.3 Portal Overlay Check

**File:** [`modules/audit/ui-ux-scanner/portal-overlay-check.md`](_bmad-ext/modules/audit/ui-ux-scanner/portal-overlay-check.md)

**Pattern:** `position: fixed` without Portal wrapper

---

## 6. Platform Integration

### 6.1 Claude Code Integration

**File:** [`modules/platform/claude-code/CLAUDE.md-integration.md`](_bmad-ext/modules/platform/claude-code/CLAUDE.md-integration.md)

#### CLAUDE.md Configuration

```markdown
## BMAD Commands
- `audit:ui` - Run UI/UX violation scan
- `audit:dead` - Run dead code detection
- `audit:arch` - Run architecture audit
- `bmad:delegate <agent>` - Delegate to BMAD agent
- `bmad:status` - Show current workflow status

## Quick Reference
- See: `_bmad-ext/modules/CONSOLIDATED-BMAD-MODULE-2026-01-14.md`
- See: `_bmad-ext/orchestrator/master-orchestrator.md`
- See: `_bmad-ext/state/LOOP_STATE.yaml`
```

#### MCP Configuration

**File:** [`modules/platform/claude-code/mcp-config.json`](_bmad-ext/modules/platform/claude-code/mcp-config.json)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "deepwiki": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.deepwiki.com/sse"]
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@0.2.3"]
    }
  }
}
```

### 6.2 OpenCode Integration

**File:** [`modules/platform/opencode/opencode.jsonc-integration.md`](_bmad-ext/modules/platform/opencode/opencode.jsonc-integration.md)

#### Rules Configuration

**File:** [`modules/platform/opencode/rules/general-rules.md`](_bmad-ext/modules/platform/opencode/rules/general-rules.md)

```jsonc
{
  "rules": {
    "typescript": {
      "enable": true,
      "typescriptPath": "./node_modules/typescript"
    },
    "eslint": {
      "enable": true,
      "eslintPath": "./node_modules/eslint"
    }
  }
}
```

#### Skills Manifest

**File:** [`modules/platform/opencode/skill/SKILLS_MANIFEST.yaml`](_bmad-ext/modules/platform/opencode/skill/SKILLS_MANIFEST.yaml)

```yaml
skills:
  - id: "bmad-orchestration"
    name: "BMAD Orchestration"
    description: "Execute BMAD workflows and cycles"
    entryPoint: "_bmad-ext/modules/core/workflows/"
    commands:
      - "story-cycle"
      - "correct-course"
      - "sprint-planning"

  - id: "bmad-audit"
    name: "BMAD Audit Scanner"
    description: "Run code and UI/UX audits"
    entryPoint: "_bmad-ext/modules/audit/"
    commands:
      - "ui-scan"
      - "code-scan"
      - "guardrail-check"
```

---

## 7. Traceable Linking System

### 7.1 Artifact Registry

**File:** [`state/ARTIFACT_REGISTRY.yaml`](_bmad-ext/state/ARTIFACT_REGISTRY.yaml)

```yaml
registry:
  - artifactId: "CONSOLIDATED-MODULE-2026-01-14"
    path: "_bmad-ext/modules/CONSOLIDATED-BMAD-MODULE-2026-01-14.md"
    type: "module-specification"
    createdAt: "2026-01-14T10:30:00+07:00"
    linkedFrom:
      - "_bmad/modules/governance/MODULE.md"
      - "_bmad/bmb/agents/bmad-builder.md"
    linksTo:
      - "_bmad-ext/orchestrator/master-orchestrator.md"
      - "_bmad-ext/modules/core/workflows/sprint-planning.yaml"
      - "_bmad-ext/modules/audit/guardrails/context-pruning.md"

  - artifactId: "MASTER-ORCHESTRATOR"
    path: "_bmad-ext/orchestrator/master-orchestrator.md"
    type: "orchestrator"
    createdAt: "2026-01-10T08:00:00+07:00"
    linkedFrom:
      - "_bmad-ext/modules/CONSOLIDATED-BMAD-MODULE-2026-01-14.md"
    linksTo:
      - "_bmad-ext/state/LOOP_STATE.yaml"
      - "_bmad-ext/orchestrator/delegation-protocol.md"
```

### 7.2 Link Validation

**Script:** [`hooks/scripts/check-artifact-links.cjs`](_bmad-ext/hooks/scripts/check-artifact-links.cjs)

```javascript
// Link validation function
function validateLinks(artifactPath) {
  const artifact = readArtifact(artifactPath);
  const links = extractLinks(artifact.content);

  const validLinks = links.filter(link => {
    const targetPath = resolvePath(link, artifactPath);
    return fileExists(targetPath);
  });

  const brokenLinks = links.filter(link => !validLinks.includes(link));

  return {
    valid: validLinks,
    broken: brokenLinks,
    timestamp: new Date().toISOString()
  };
}
```

### 7.3 Forward/Backward Traceability

```yaml
traceability:
  artifact: "CONSOLIDATED-MODULE-2026-01-14"

  backwardLinks:
    - file: "_bmad/modules/governance/MODULE.md"
      reason: "Consolidated from governance module"
    - file: "_bmad/bmb/agents/bmad-builder.md"
      reason: "Created by bmad-builder agent"

  forwardLinks:
    - file: "_bmad-ext/orchestrator/master-orchestrator.md"
      relationship: "mounts"
    - file: "_bmad-ext/state/LOOP_STATE.yaml"
      relationship: "updates"
    - file: "_bmad-ext/modules/audit/guardrails/context-pruning.md"
      relationship: "references"
```

---

## 8. Workflow Integration

### 8.1 Story Cycle Workflow

```yaml
# Story Cycle Integration
workflow: story-cycle
version: 1.0.0

stages:
  - name: create-story
    module: "@bmad/bmm/workflows/create-story"
    guardrails:
      - "ux-gate"
      - "context-validation"

  - name: validate-story
    module: "@bmad/bmm/workflows/validate-story"
    guardrails:
      - "brain-gate"
      - "story-cohesion"

  - name: dev-story
    module: "@bmad/bmm/workflows/dev-story"
    guardrails:
      - "loop-limiter"
      - "resource-semaphore"

  - name: code-review
    module: "@bmad/bmm/workflows/code-review"
    guardrails:
      - "context-pruning"
      - "guardrail-validation"

  - name: story-done
    module: "@bmad/bmm/workflows/story-done"
    guardrails:
      - "visual-gate"
      - "link-validation"
```

### 8.2 Correct Course Workflow

```yaml
# Correct Course Integration
workflow: correct-course
version: 1.0.0

triggers:
  - pattern: "correct-course"
    priority: "high"

steps:
  - name: categorize
    module: "@bmad/core/workflows/correct-course/step-02-categorize"

  - name: route
    module: "@bmad/core/workflows/correct-course/step-03-route"

  - name: complete
    module: "@bmad/core/workflows/correct-course/step-04-complete"

outputs:
  - "SPRINT_PLANNING_UPDATE"
  - "ARCHITECTURE_UPDATE"
  - "EPIC_STATUS_UPDATE"
```

---

## 9. Audit Command Reference

### 9.1 Quick Audit Commands

| Command | Description | Platform |
|---------|-------------|----------|
| `audit:ui` | Scan UI/UX violations | Both |
| `audit:dead` | Detect dead code | Both |
| `audit:arch` | Run architecture audit | Both |
| `audit:links` | Validate all links | Both |
| `audit:guardrails` | Check guardrail compliance | Claude Code |

### 9.2 Deep Scan Commands

```bash
# UI/UX Comprehensive Scan
npx bmad-audit ui-scan --output _bmad-output/audit/ui-scan-results.md

# Code Quality Scan
npx bmad-audit code-scan --depth deep --output _bmad-output/audit/code-scan-results.md

# Architecture Consistency
npx bmad-audit arch-validate --output _bmad-output/audit/arch-validation.md
```

---

## 10. Maintenance & Updates

### 10.1 Version Management

**Policy:** All artifacts must include frontmatter with version and date.

```yaml
---
version: 1.0.0
lastUpdated: 2026-01-14T10:30:00+07:00
maintainer: "@bmad-bmb-bmad-builder"
---
```

### 10.2 Archival Policy

**Retention:**
- Active artifacts: Unlimited
- Stale artifacts (>30 days): Archive to `_bmad-ext/.archive/`
- Broken links: Flag for repair within 7 days

### 10.3 Health Check

```bash
# Run module health check
npx bmad-audit health --module _bmad-ext/modules/CONSOLIDATED-BMAD-MODULE-2026-01-14.md
```

**Metrics:**
- Link integrity: 100%
- Guardrail coverage: 100%
- Platform compatibility: 100%

---

## 11. References

### Essential Files

| File | Path | Purpose |
|------|------|---------|
| AGENTS.md | `AGENTS.md` | Project governance |
| CLAUDE.md | `CLAUDE.md` | Claude Code prompts |
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` | Session state |
| ARTIFACT_REGISTRY | `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | Artifact tracking |

### External Documentation

- **TanStack Router:** `https://tanstack.com/router`
- **Zustand:** `https://zustand.docs.pmnd.rs`
- **Dexie.js:** `https://dexie.org`
- **Radix UI:** `https://www.radix-ui.com`

---

## 12. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-14 | 1.0.0 | Initial consolidation | @bmad-bmb-bmad-builder |

---

**END OF DOCUMENT**

> **Navigation:** Use this document as the single entry point for all BMAD operations.
> **Updates:** Any changes must be linked and traced in `ARTIFACT_REGISTRY.yaml`.
