# ARC Gap Remediation Module

**Version:** 1.0.0  
**Created:** 2025-12-31  
**Created By:** bmad-bmm-architect  
**Status:** READY

## Overview

The ARC Gap Remediation Module is a systematic refactoring module designed to address architectural gaps identified in the ARC (Agent Runtime Configuration) Module validation. This module coordinates the remediation of P0 and P1 gaps through structured workflows and specialized agents.

### Module Purpose

The ARC Module achieved a **CONDITIONAL PASS** with a score of **87/100**. This module systematically addresses the critical gaps:

| Priority | Gap | Impact | Story |
|----------|-----|--------|-------|
| **P0** | Missing `workspacePermissions` field | Blocks per-workspace tool security | ARC-P0-1 |
| **P0** | Missing `workspaceBindings` field | Prevents workspace-specific agent availability | ARC-P0-2 |
| **P0** | Workspace-aware tool permissions | Critical security feature | ARC-P0-3 |
| **P1** | Context summarization | Affects conversation management | ARC-P1-1 |
| **P1** | AgentConfigDialog refactor (1089 LOC) | Code quality violation | ARC-P1-2 |

## Installation

### Prerequisites

- BMAD Framework v6.0.0-alpha.21 or higher
- Project Alpha v2.0 codebase
- Node.js 18+ and pnpm

### Installation Steps

1. **Navigate to the module directory:**
   ```bash
   cd _bmad-output/bmb-creations/arc-gap-remediation
   ```

2. **Run the module installer:**
   ```bash
   pnpm install
   ```

3. **Verify installation:**
   ```bash
   pnpm run validate
   ```

## Module Structure

```
arc-gap-remediation/
├── agents/                           # Agent definition files
│   ├── arc-p0-remediation-agent.md   # P0 gap fixes agent
│   └── arc-p1-remediation-agent.md   # P1 gap fixes agent
├── workflows/                        # Workflow plans for each gap
│   ├── workspace-permissions/        # ARC-P0-1 workflow (6 steps)
│   ├── workspace-bindings/           # ARC-P0-2 workflow (6 steps)
│   ├── context-summarization/        # ARC-P1-1 workflow (6 steps)
│   └── agent-dialog-refactor/        # ARC-P1-2 workflow (7 steps)
├── data/                             # Data files
│   ├── gap-remediation-plan.yaml     # Detailed remediation plan
│   └── acceptance-criteria.yaml      # Acceptance criteria for each story
├── _module-installer/                # Installation configuration
├── module.yaml                       # Module configuration
├── README.md                         # This file
└── TODO.md                           # Development phases and tasks
```

## Usage

### Activating the Module

To activate the ARC Gap Remediation module, use the BMAD module activation command:

```bash
bmad activate arc-gap-remediation
```

### Running Workflows

Each workflow can be executed independently or as part of a coordinated sequence:

```bash
# Execute P0 gap remediation
bmad run arc-p0-remediation-agent

# Execute P1 gap remediation
bmad run arc-p1-remediation-agent
```

### Workflow Execution Order

The workflows should be executed in the following order to respect dependencies:

1. **Sprint 1 (Jan 1-7, 2026):** P0 Gap Remediation
   - ARC-P0-1: workspacePermissions (Day 1-2)
   - ARC-P0-2: workspaceBindings (Day 3-4)
   - ARC-P0-3: workspace-aware permissions (Day 5-6)

2. **Sprint 2 (Jan 8-14, 2026):** P1 Gap Remediation
   - ARC-P1-1: context summarization (Day 1-2)
   - ARC-P1-2: AgentConfigDialog refactor (Day 3-5)

## Agents

### arc-p0-remediation-agent

**Purpose:** Handles P0 (critical) gap fixes

**Workflows:**
- `workspace-permissions`: Implements workspacePermissions field
- `workspace-bindings`: Implements workspaceBindings field
- `workspace-tool-permissions`: Implements workspace-aware tool permissions

**Technical Requirements:**
- Code quality: All code must pass linting and type checking
- Performance: Permission checks < 10ms
- Security: Default deny-all policy for workspace access
- Test coverage: > 80%

### arc-p1-remediation-agent

**Purpose:** Handles P1 (important) gap fixes

**Workflows:**
- `context-summarization`: Implements context summarization for long conversations
- `agent-dialog-refactor`: Refactors AgentConfigDialog.tsx (1089 LOC → < 300 LOC)

**Technical Requirements:**
- Code quality: All code must pass linting and type checking
- Performance: Summarization < 100ms, context size reduced by ≥ 50%
- Maintainability: Each extracted component < 200 LOC
- Test coverage: > 80%

## Workflows

### workspace-permissions (ARC-P0-1)

**Steps:**
1. `01-analyze-schema.md` - Analyze current AgentConfig schema
2. `02-design-permissions.md` - Design workspacePermissions structure
3. `03-implement-schema.md` - Implement schema with Zod
4. `04-add-permission-checks.md` - Add permission validation
5. `05-update-dialog-ui.md` - Update AgentConfigDialog UI
6. `06-update-docs.md` - Update documentation

**Estimated Duration:** 1 day

**Acceptance Criteria:**
- workspacePermissions field added to AgentConfig schema
- Tool permission checks respect workspacePermissions
- Tests pass for all permission scenarios
- Documentation updated

### workspace-bindings (ARC-P0-2)

**Steps:**
1. `01-analyze-availability.md` - Analyze current agent availability
2. `02-design-bindings.md` - Design workspaceBindings structure
3. `03-implement-schema.md` - Implement schema with Zod
4. `04-add-availability-checks.md` - Add availability validation
5. `05-update-dialog-ui.md` - Update AgentConfigDialog UI
6. `06-update-docs.md` - Update documentation

**Estimated Duration:** 1 day

**Acceptance Criteria:**
- workspaceBindings field added to AgentConfig schema
- Agent availability respects workspaceBindings
- Tests pass for all binding scenarios
- Documentation updated

### context-summarization (ARC-P1-1)

**Steps:**
1. `01-analyze-context.md` - Analyze current conversation context
2. `02-design-summarization.md` - Design summarization strategy
3. `03-implement-summarization.md` - Implement summarization logic
4. `04-update-store.md` - Update conversation store
5. `05-add-ui-indicators.md` - Add UI indicators
6. `06-update-docs.md` - Update documentation

**Estimated Duration:** 2 days

**Acceptance Criteria:**
- Context summarization logic implemented
- Conversation store updated with summarization
- Context size reduced by at least 50%
- Tests pass for all summarization scenarios
- Documentation updated

### agent-dialog-refactor (ARC-P1-2)

**Steps:**
1. `01-analyze-structure.md` - Analyze AgentConfigDialog structure
2. `02-design-extraction.md` - Design component extraction
3. `03-extract-provider-panel.md` - Extract ProviderConfigPanel
4. `04-extract-model-selector.md` - Extract ModelSelector
5. `05-extract-tool-panel.md` - Extract ToolConfigPanel
6. `06-refactor-main-dialog.md` - Refactor main dialog
7. `07-validate-refactor.md` - Validate refactoring

**Estimated Duration:** 3 days

**Acceptance Criteria:**
- AgentConfigDialog reduced to < 300 LOC
- Component extraction completed
- All tests passing
- Backward compatibility maintained
- Documentation updated

## Configuration

### Module Configuration

The module configuration is defined in [`module.yaml`](module.yaml):

```yaml
module:
  id: ARC-GAP-REMEDIATION
  name: ARC Gap Remediation
  version: 1.0.0
  description: Systematic remediation of ARC Module P0 and P1 gaps
```

### Sprint Timeline

```yaml
sprint_timeline:
  sprint_1:
    name: Sprint 1 - P0 Gap Remediation
    dates: "2026-01-01 to 2026-01-07"
    focus: P0 gaps + Epic 22 stories
  
  sprint_2:
    name: Sprint 2 - P1 Gap Remediation
    dates: "2026-01-08 to 2026-01-14"
    focus: P1 gaps + Epic 24 stories
```

### Success Metrics

```yaml
success_metrics:
  code_quality:
    - AgentConfigDialog LOC < 300
    - Test coverage > 80%
    - No critical linting errors
  
  functionality:
    - All P0 gaps resolved
    - All P1 gaps resolved
    - Zero regressions in existing functionality
  
  performance:
    - Permission checks < 10ms
    - Context summarization < 100ms
    - No performance degradation in agent execution
```

## Data Files

### gap-remediation-plan.yaml

Detailed remediation plan including:
- Executive summary
- Gap analysis for all 5 gaps
- Sprint timeline
- Risk assessment
- Success metrics

### acceptance-criteria.yaml

Comprehensive acceptance criteria for each story including:
- Functional requirements
- Non-functional requirements
- Technical requirements
- Documentation requirements
- Definition of Done

## Validation

The module includes validation criteria defined in `_bmad/bmb/workflows/create-module/validation.md`:

- ✅ Module directory structure created
- ✅ `module.yaml` file with complete module configuration
- ✅ `README.md` with module overview, installation instructions, and usage guide
- ✅ `TODO.md` with development phases and task breakdown
- ✅ `agents/` directory with agent definition files
- ✅ `workflows/` directory with workflow plans
- ✅ `data/` directory with data files
- ✅ `_module-installer/` directory with installation configuration
- ✅ All files follow BMAD module structure standards

## References

### Project Documents

- [`_bmad-output/arc-module-gap-analysis-2025-12-31.md`](../../arc-module-gap-analysis-2025-12-31.md) - Complete gap analysis
- [`_bmad-output/project-planning-artifacts/sprint-change-proposal-arc-module-gaps-2025-12-31.md`](../../project-planning-artifacts/sprint-change-proposal-arc-module-gaps-2025-12-31.md) - Sprint change proposal
- [`_bmad/bmb/workflows/create-module/workflow.md`](../../../../_bmad/bmb/workflows/create-module/workflow.md) - Create module workflow
- [`_bmad/bmb/workflows/create-module/validation.md`](../../../../_bmad/bmb/workflows/create-module/validation.md) - Validation criteria

### Related Modules

- [`_bmad-output/bmb-creations/arc-module/`](../arc-module/) - ARC Module (source of gaps)

## Handoff Information

### Next Phase: Dev Cycle Coordination

After module creation, the handoff sequence is:

1. **@bmad-bmm-pm** - Sprint planning with the new stories
2. **@bmad-bmm-dev** - Implementation of gap remediation

### Handoff Report Location

`_bmad-output/handoffs/architect-to-pm-arc-gap-remediation-2025-12-31.md`

## Support

For questions or issues related to this module, refer to:

- BMAD Framework documentation: `_bmad/bmb/`
- Project documentation: `docs/`
- AGENTS.md: Project-specific development patterns

## License

This module is part of the Via-gent Project Alpha v2.0 and follows the project's license.