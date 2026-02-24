# BMAD-EXT Claude Code Integration Guide

**Created**: 2026-01-11
**Version**: 1.0.0
**description**: Complete integration of BMAD-ext modules with Claude Code

## Overview

This document describes the integration layer that bridges Claude Code's `.claude/` directory with the BMAD-ext modules in `_bmad-ext/modules/`. The integration ensures:

- BMAD-ext modules remain the single source of truth (NOT modified)
- Claude Code acts as a bridge/wrapper layer
- Full module-builder, workflow-builder, agent-builder functionality
- Seamless hop-reading patterns between platforms

## Directory Structure

```
.claude/
├── skills/
│   ├── bmad-ext-bridge/              # Master bridge to all modules
│   │   ├── SKILL.md                  # Main gateway skill
│   │   └── modules/
│   │       ├── governance/SKILL.md   # Governance module bridge
│   │       ├── arc-v2/SKILL.md       # ARC-v2 module bridge
│   │       ├── sprint-planning-wrapper/SKILL.md
│   │       └── implementation/SKILL.md
│   ├── module-builder/SKILL.md       # Module creation tool
│   ├── workflow-builder/SKILL.md     # Workflow creation tool
│   └── agent-builder/SKILL.md        # Agent creation tool
├── commands/
│   ├── bmad-ext/                     # BMAD-ext commands
│   │   ├── ext-master.yaml           # Master gateway command
│   │   ├── ext-governance.yaml       # Governance command
│   │   ├── ext-arc.yaml              # ARC-v2 command
│   │   ├── ext-sprint.yaml           # Sprint-planning command
│   │   └── ext-implementation.yaml   # Implementation command
│   └── index.yaml                    # Updated command registry
├── hooks/
│   ├── session-start.yaml            # Updated with bridge validation
│   └── pre-request-governance.yaml   # BMAD governance checks
└── config/
    └── unified-agent-registry.yaml   # Updated with bridge agents

_bmad-ext/
└── modules/                          # Source of truth (NOT MODIFIED)
    ├── governance/
    ├── arc-v2/
    ├── sprint-planning-wrapper/
    └── implementation/
```

## Bridge Skills

### 1. BMAD-EXT Bridge Master (bmad-ext-bridge/SKILL.md)

**description**: Unified gateway to all BMAD-ext modules

**Provides**:
- Module status dashboard
- Cross-module coordination
- Hop-reading patterns
- Utility functions for module loading

**Sub-modules**:
- `bmad-ext-governance-bridge` - Phase 0 governance
- `bmad-ext-arc-v2-bridge` - Phase 0 architecture remediation
- `bmad-ext-sprint-planning-bridge` - Phase 2 sprint planning
- `bmad-ext-implementation-bridge` - Phase 4 implementation

### 2. Module Builder (module-builder/SKILL.md)

**description**: Create and manage BMAD-ext modules

**Capabilities**:
- Generate module structure from templates
- Create module frontmatter
- Configure integration points
- Validate module compliance

**Usage**:
```bash
/module-builder
/create-module name="new-module" phase="4" tier="execution"
/validate-module name="new-module"
```

### 3. Workflow Builder (workflow-builder/SKILL.md)

**description**: Create and manage BMAD-ext workflows

**Capabilities**:
- Generate workflow structure
- Create step files with frontmatter
- Implement hop-reading patterns
- Validate workflow compliance

**Usage**:
```bash
/workflow-builder
/create-workflow name="new-workflow" module="governance" steps=5
/validate-workflow name="new-workflow" module="governance"
```

### 4. Agent Builder (agent-builder/SKILL.md)

**description**: Create and manage BMAD-ext agents

**Capabilities**:
- Generate agent structure
- Define capabilities
- Configure tool requirements
- Validate agent compliance

**Usage**:
```bash
/agent-builder
/create-agent name="new-agent" module="implementation" type="specialist"
/validate-agent name="new-agent" module="implementation"
```

## Command Registry

### Core Commands

| Command | Path | Description |
|---------|------|-------------|
| `/ext-master` | `.claude/skills/bmad-ext-bridge/SKILL.md` | Master gateway |
| `/ext-governance` | `.claude/skills/bmad-ext-bridge/modules/governance/SKILL.md` | Governance workflows |
| `/ext-arc` | `.claude/skills/bmad-ext-bridge/modules/arc-v2/SKILL.md` | ARC-v2 workflows |
| `/ext-sprint` | `.claude/skills/bmad-ext-bridge/modules/sprint-planning-wrapper/SKILL.md` | Sprint planning |
| `/ext-implementation` | `.claude/skills/bmad-ext-bridge/modules/implementation/SKILL.md` | Implementation |

### Builder Commands

| Command | Description |
|---------|-------------|
| `/module-builder` | Create BMAD-ext modules |
| `/workflow-builder` | Create workflows |
| `/agent-builder` | Create agents |

### Governance Commands

| Command | Description |
|---------|-------------|
| `/context-first` | Context-first governance workflow |
| `/expert-analysis` | Expert analysis workflow |
| `/research-trigger` | Research trigger workflow |
| `/correct-course` | Recovery workflow |

### ARC-v2 Commands

| Command | Description |
|---------|-------------|
| `/arc-validate` | Context validator |
| `/arc-scan` | Domain scanner |
| `/arc-store` | Store refactorer |
| `/arc-split` | Component splitter |
| `/arc-workspace` | Workspace architect |

### Sprint Planning Commands

| Command | Description |
|---------|-------------|
| `/sprint-cohesion` | Cohesion check |
| `/sprint-dependency` | Dependency map |
| `/sprint-reality` | Reality validation |
| `/sprint-gate` | Gatekeeping |

### Implementation Commands

| Command | Description |
|---------|-------------|
| `/story-cycle` | Story execution workflow |
| `/correct-course` | Bug fix workflow |
| `/quick-patch` | Quick patch sub-workflow |
| `/feature-fix` | Feature fix sub-workflow |
| `/arch-fix` | Architectural conflict sub-workflow |

## Integration Points

### LOOP_STATE Integration

The bridge layer reads and writes to `_bmad-ext/state/LOOP_STATE.yaml`:

```yaml
governance:
  last_check: "2026-01-11T10:00:00Z"
  stale_detected: 0
  artifacts_scanned: 15
  contexts_validated: 8
  auto_archives: 2
  health_score: 95
```

### Artifact Registry Integration

The bridge layer manages `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`:

```yaml
artifacts:
  - id: "uuid"
    path: "_bmad-output/scans/{scan}.yaml"
    type: "scan"
    created: "2026-01-11T10:00:00Z"
    ttl_hours: 4
    status: "active"
```

### Workflow Status Integration

The bridge layer reads `bmm-workflow-status.yaml`:

```yaml
current_workflow:
  story: "FS-05"
  epic: "EPIC-FS"
  status: "in_progress"
```

## Hop-Reading Pattern

The bridge layer implements hop-reading for efficient module loading:

```yaml
# Step 1: Load module frontmatter (lightweight)
Load: "_bmad-ext/modules/{module}/MODULE.md"
Extract:
  - phase
  - status
  - integration_points

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
```

## Module Status Dashboard

| Module | Phase | Status | Health | Integration Points |
|--------|-------|--------|--------|-------------------|
| governance | 0 | ACTIVE v2.0 | 95% | LOOP_STATE, ARTIFACT_REGISTRY |
| arc-v2 | 0 | ACTIVE v2.0 | 90% | Routing rules, 6-domain model |
| sprint-planning-wrapper | 2 | ACTIVE v1.0 | 85% | BMAD sprint-planning, cohesion |
| implementation | 4 | ACTIVE v1.0 | 88% | Sprint-status, story files |

## Workflow Call Chains

### Path 1: New Feature Development

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

### Path 2: Architecture Remediation

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

### Path 3: Bug Fix / Recovery

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

## Migration Guide

### From v1.0 Commands

Replace old commands with new bridge commands:

| Old Command | New Command |
|-------------|-------------|
| `/gov` | `/ext-governance` or `/context-first` |
| `/scan` | `/ext-arc` or `/arc-scan` |
| `/fix` | `/correct-course` |
| `/sprint` | `/ext-sprint` or `/enhanced-sprint` |

### New Features in v2.0

1. **Module Builder**: Create new modules with proper structure
2. **Workflow Builder**: Create workflows with hop-reading patterns
3. **Agent Builder**: Create agents with capabilities
4. **Cross-Module Coordination**: Seamless handoffs between modules
5. **Unified Status Dashboard**: View all module statuses in one place

## Validation Checklist

- [ ] BMAD-ext modules are NOT modified
- [ ] Claude Code acts as bridge/wrapper only
- [ ] All commands point to `.claude/skills/` not `_bmad-ext/`
- [ ] Hop-reading patterns are implemented
- [ ] LOOP_STATE is properly updated
- [ ] Artifact registry is maintained
- [ ] Module status dashboard is accurate

## Troubleshooting

### Bridge Commands Not Found

```bash
# Check if bridge skills exist
ls .claude/skills/bmad-ext-bridge/
ls .claude/commands/bmad-ext/
```

### Module Not Loading

```bash
# Verify module exists in _bmad-ext/modules/
ls _bmad-ext/modules/{module}/MODULE.md

# Check LOOP_STATE for errors
cat _bmad-ext/state/LOOP_STATE.yaml
```

### Integration Points Failing

```bash
# Verify integration points
cat _bmad-ext/modules/{module}/MODULE.md | grep integration_points

# Check artifact registry
cat _bmad-ext/state/ARTIFACT_REGISTRY.yaml
```

---

**Document Version**: 1.0.0
**Created**: 2026-01-11
**Last Updated**: 2026-01-11
