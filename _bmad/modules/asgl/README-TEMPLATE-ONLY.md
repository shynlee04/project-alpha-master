# ASGL Module - READ-ONLY TEMPLATE

**IMPORTANT**: This module is a **TEMPLATE/GUIDELINE** reference only.

## ⚠️ READ-ONLY STATUS

This module contains governance templates for autonomous sprint execution. These files should be **referenced, not modified** by AI agents.

## Protected Files

The following files are **READ-ONLY TEMPLATES**:

- `MASTER_PROMPT.md` - Master orchestration template
- `LOOP_STATE.yaml` - State tracking template
- `workflows/main-loop.md` - Main loop workflow template
- `workflows/governance-update.md` - Governance update template
- `MANIFEST.yaml` - Module manifest
- `config/` - Configuration templates

## Proper Usage

### ✅ CORRECT
1. **Read** the template for guidance
2. **Copy** relevant patterns to working context
3. **Create** artifacts in `_bmad-output/`
4. **Reference** template in artifact frontmatter

### ❌ WRONG
1. **Modify** template files directly
2. **Write** execution output to template files
3. **Update** LOOP_STATE.yaml outside governance
4. **Edit** workflows without governance authorization

## Template Modification Protocol

Templates can ONLY be modified via:
1. `/governance/template-update` workflow
2. BMAD Master with explicit authorization
3. Human direct edit (bypasses AI)

## State File Location

**Working state** belongs in: `_bmad-output/sprint-artifacts/`
**Template state** remains here: `_bmad/modules/asgl/`

When executing cycles:
1. **Copy** template state to working location
2. **Modify** working copy during execution
3. **Archive** working copy when complete
4. **Preserve** template for next cycle

## Version

**Template Version**: 3.0
**Last Updated**: 2026-01-06
**Governance Module**: `_bmad/modules/governance/`

---

*This README enforces read-only template governance*
*Contact: Governance Module for template modifications*
