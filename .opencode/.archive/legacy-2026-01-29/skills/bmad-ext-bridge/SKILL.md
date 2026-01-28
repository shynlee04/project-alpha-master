---
name: bmad-ext-bridge
description: Master bridge skill for BMAD-ext modules integration. Provides unified access to governance, architecture remediation, sprint planning wrapper, and implementation modules. Use this skill when needing to invoke BMAD-ext workflows, load module frontmatter, or coordinate across multiple modules.
version: 1.0.0
category: bridge
parent: bmad-orchestrator
children:
  - bmad-ext-governance
  - bmad-ext-arc-v2
  - bmad-ext-sprint-planning
  - bmad-ext-implementation
priority: 10
agents:
  - bmad-core-master
  - platform-router
triggers:
  - bmad-ext
  - bm-ad extension
  - extension modules
  - _bmad-ext
  - /ext-master
  - /bmad-ext
---

# BMAD-EXT Bridge Master Skill

**description**: Unified gateway to all BMAD-ext modules with hop-reading patterns, module coordination, and cross-module workflows.

## When to use this skill

- When needing to invoke any BMAD-ext module workflow
- When coordinating across multiple modules (e.g., governance → sprint planning → implementation)
- When loading module frontmatter for routing decisions
- When creating new modules, workflows, or agents that integrate with BMAD-ext
- When checking module status, health, or integration points

## Module Gateway

### 1. Governance Module (Phase 0)

```bash
# Load governance module frontmatter
/claude/skills/bmad-ext-bridge/modules/governance/SKILL.md

# Invoke governance workflows
- context-first: Gather and validate context
- expert-analysis: Expert code analysis
- research-trigger: Internet-based research
- correct-course: Recovery workflow
```

**Location**: `_bmad-ext/modules/governance/`
**Entry**: Load frontmatter → Execute workflow → Update LOOP_STATE

### 2. Architecture Remediation v2 (Phase 0 - Special)

```bash
# Load ARC-v2 module
/claude/skills/bmad-ext-bridge/modules/arc-v2/SKILL.md

# Invoke ARC workflows
- diagnostic-first: Always scan before plan
- domain-scanner: 6-domain targeted scanning
- store-refactorer: Zustand store splitting
- component-splitter: React component splitting
```

**Location**: `_bmad-ext/modules/arc-v2/`
**Entry**: Diagnostic-first workflow → Domain isolation → Platform-aware strategies

### 3. Sprint-Planning Wrapper (Phase 2)

```bash
# Load sprint-planning wrapper
/claude/skills/bmad-ext-bridge/modules/sprint-planning-wrapper/SKILL.md

# Enhanced sprint planning with cohesion validation
- cohesion-check: Validate sprint UX cohesion
- dependency-map: Map cross-story dependencies
- reality-validation: 30-second demo script test
- auto-gatekeeping: Loop-back on failures
```

**Location**: `_bmad-ext/modules/sprint-planning-wrapper/`
**Entry**: 7-step enhanced workflow → Cohesion first → Gatekeeping

### 4. Implementation Module (Phase 4)

```bash
# Load implementation module
/claude/skills/bmad-ext-bridge/modules/implementation/SKILL.md

# Story execution workflows
- story-cycle: New feature development
- correct-course: Bug fixes and remediation
```

**Location**: `_bmad-ext/modules/implementation/`
**Entry**: Story-cycle (features) or correct-course (fixes) → Handoff to orchestrator

## Hop-Reading Pattern

```yaml
# Step 1: Load module frontmatter (lightweight)
Load: "_bmad-ext/modules/{module}/MODULE.md"
Extract:
  - phase
  - status
  - integration_points
  - workflows

# Step 2: On need, load specific workflow (heavyweight)
If: "need_workflow_execution"
Load: "_bmad-ext/modules/{module}/workflows/{workflow}/workflow.md"
Execute: "step-by-step with hop-reading"

# Step 3: Update LOOP_STATE on completion
Update: "_bmad-ext/state/LOOP_STATE.yaml"
With:
  module: "{module}"
  workflow: "{workflow}"
  status: "completed"
  timestamp: "2026-01-11T10:00:00Z"
```

## Cross-Module Coordination

### Flow 1: New Feature Development

```
User Request
    ↓
[governance/] → Context-first + Expert Analysis + Research
    ↓ (ALLOW)
[sprint-planning-wrapper/] → 7-step enhanced planning
    ↓ (COHESION CHECK)
[implementation/] → Story-cycle workflow
    ↓
Story Complete → Handoff
```

### Flow 2: Architecture Remediation

```
Architecture Issue Detected
    ↓
[arc-v2/] → Diagnostic-first workflow
    ├─ context-validator (session-start)
    ├─ domain-scanner (6-domain)
    └─ remediation-plan (evidence-based)
    ↓
[implementation/] → Architectural conflict sub-workflow
    ↓
Refactoring Complete
```

### Flow 3: Bug Fix / Recovery

```
Bug Report
    ↓
[governance/] → Correct-course workflow
    ├─ Receive Report
    ├─ Categorize (quick-patch | feature-fix | architectural)
    └─ Route
    ↓
[implementation/] → Correct-course execution
    ↓
Fix Complete
```

## Module Status Dashboard

| Module | Phase | Status | Health | Integration Points |
|--------|-------|--------|--------|-------------------|
| governance | 0 | ACTIVE v2.0 | 95% | LOOP_STATE, ARTIFACT_REGISTRY |
| arc-v2 | 0 | ACTIVE v2.0 | 90% | Routing rules, 6-domain model |
| sprint-planning-wrapper | 2 | ACTIVE v1.0 | 85% | BMAD sprint-planning, cohesion |
| implementation | 4 | ACTIVE v1.0 | 88% | Sprint-status, story files |

## Utility Functions

### Load Module Frontmatter

```typescript
async function loadModuleFrontmatter(modulePath: string): Promise<ModuleFrontmatter> {
  const content = await readFile(`${modulePath}/MODULE.md`);
  const frontmatter = extractYamlFrontmatter(content);
  return {
    name: frontmatter.name,
    version: frontmatter.version,
    phase: frontmatter.phase,
    status: frontmatter.status,
    integration_points: frontmatter.integration_points,
  };
}
```

### Execute Workflow with Hop-Reading

```typescript
async function executeWorkflow(workflowPath: string): Promise<void> {
  // Load workflow frontmatter
  const workflow = await loadWorkflow(workflowPath);
  
  // Execute steps sequentially with hop-reading
  for (const step of workflow.steps) {
    const stepContent = await readFile(`${workflowPath}/steps/${step}`);
    await executeStep(stepContent);
  }
  
  // Update LOOP_STATE
  await updateLoopState({
    workflow: workflowPath,
    status: 'completed'
  });
}
```

### Check Module Health

```typescript
async function checkModuleHealth(modulePath: string): Promise<HealthCheck> {
  const frontmatter = await loadModuleFrontmatter(modulePath);
  const integrationPoints = await verifyIntegrationPoints(frontmatter.integration_points);
  
  return {
    module: frontmatter.name,
    status: frontmatter.status,
    integrationHealth: integrationPoints,
    overallScore: calculateHealthScore(integrationPoints),
  };
}
```

## Quick Commands

| Command | Action |
|---------|--------|
| `/ext-master` | Load master bridge skill |
| `/ext-governance` | Load governance module |
| `/ext-arc` | Load ARC-v2 module |
| `/ext-sprint` | Load sprint-planning wrapper |
| `/ext-implementation` | Load implementation module |
| `/ext-scan` | Run diagnostic-first scan |
| `/ext-correct-course` | Invoke correct-course workflow |

## Integration with Claude Code

### Commands Integration

```yaml
# .claude/commands/bmad-ext.yaml
commands:
  - id: ext-master
    name: BMAD-EXT Master
    path: .claude/skills/bmad-ext-bridge/SKILL.md
  
  - id: ext-governance
    name: Governance Module
    path: .claude/skills/bmad-ext-bridge/modules/governance/SKILL.md
  
  - id: ext-arc
    name: ARC-v2 Module
    path: .claude/skills/bmad-ext-bridge/modules/arc-v2/SKILL.md
  
  - id: ext-sprint
    name: Sprint-Planning Wrapper
    path: .claude/skills/bmad-ext-bridge/modules/sprint-planning-wrapper/SKILL.md
  
  - id: ext-implementation
    name: Implementation Module
    path: .claude/skills/bmad-ext-bridge/modules/implementation/SKILL.md
```

### Hooks Integration

```yaml
# .claude/hooks/session-start.yaml
hooks:
  - trigger: session_start
    action: bmad-ext-bridge
    task: validate-modules
```

## Error Handling

### Module Not Found

```typescript
if (!moduleExists(modulePath)) {
  return {
    error: "MODULE_NOT_FOUND",
    suggestion: "Check _bmad-ext/modules/ for available modules",
    availableModules: listModules(),
  };
}
```

### Integration Point Failure

```typescript
if (!integrationPointHealthy(point)) {
  return {
    error: "INTEGRATION_FAILED",
    point: point,
    suggestion: "Run governance check or contact module owner",
  };
}
```

## Version Compatibility

| BMAD-EXT Version | Claude Code Version | Status |
|------------------|---------------------|--------|
| 1.0.0 | 2.0.0 | ✅ Compatible |
| 2.0.0 | 2.1.0 | ✅ Compatible |
| 2.1.0 | 2.1.3 | ✅ Current |

---

**Source**: `_bmad-ext/modules/` + `_bmad-ext/AUDIT-REPORT.md`
**Version**: 1.0.0
**Last Updated**: 2026-01-11
