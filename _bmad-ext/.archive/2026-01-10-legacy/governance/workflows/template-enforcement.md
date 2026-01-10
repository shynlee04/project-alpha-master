# Template Enforcement Workflow

**Workflow**: Template Lock Enforcement
**Module**: Governance
**Version**: 1.0
**Created**: 2026-01-06

## Purpose

Enforces read-only governance on BMAD template modules. Templates should be referenced, not modified directly by agents.

## Protected Templates

The following modules are **READ-ONLY TEMPLATES**:

### asgl (Autonomous Sprint Governance Layer)
**Purpose**: Orchestration template for autonomous development cycles
**Path**: `_bmad/modules/asgl/`
**Protected Files**:
- `MASTER_PROMPT.md`
- `LOOP_STATE.yaml`
- `workflows/main-loop.md`
- `workflows/governance-update.md`

### architecture-remediation
**Purpose**: Remediation workflows and agents
**Path**: `_bmad/modules/architecture-remediation/`
**Protected Files**:
- All workflow definitions
- Agent profiles (reference only)
- Config templates

## Agent Behavior Rules

### When using templates:
1. **READ** the template file for guidance
2. **COPY** relevant sections to working context
3. **EXECUTE** based on template guidance
4. **DO NOT MODIFY** the original template

### When creating artifacts:
1. Create output in `_bmad-output/` or project-specific locations
2. Reference template source in frontmatter
3. Never write back to `_bmad/modules/` except via governance workflows

## Violation Detection

Check for:
- Direct modifications to `MASTER_PROMPT.md`
- Changes to `LOOP_STATE.yaml` outside governance workflows
- Edits to workflow definitions in template modules
- Missing template references in artifacts

## Enforcement Actions

### Level 1: Warning
- Log violation to governance log
- Notify agent of read-only status
- Suggest proper usage pattern

### Level 2: Block
- Prevent write operation to protected file
- Redirect output to proper location
- Require explicit override for modification

### Level 3: Escalation
- Halt workflow on violation
- Notify human for authorization
- Create incident report

## Override Process

Templates can only be modified via:
1. **Governance Module** workflows
2. **BMAD Master** with explicit authorization
3. **Human** direct edit (bypasses AI agents)

## Validation Commands

```bash
# Check for unauthorized modifications to templates
git diff _bmad/modules/asgl/MASTER_PROMPT.md
git diff _bmad/modules/asgl/workflows/

# Verify template integrity
find _bmad/modules -name "*.md" -exec grep -l "DO NOT EDIT" {} \;
```

## Success Criteria

- Zero direct modifications to template files by agents
- All artifacts reference template sources
- Template modifications only via governance workflows
- All agents trained on read-only template usage

---

*Workflow created as part of Cycle 1: Governance Foundation*
