# .claude Legacy Archive - 2026-01-11

> **Archive Date**: 2026-01-11
> **Reason**: Integration of Product Reality Gates and Sprint-Planning Wrapper
> **Archive Type**: Command consolidation + duplicate cleanup

---

## Files Archived

### Commands (commands/)

| File | Reason | Replacement |
|------|--------|-------------|
| `ralph-loop-platform-unification.md` | Replaced by unified ASGL loop | `/loop` or `/asgl` |

### Config (config/)

| File | Reason | Replacement |
|------|--------|-------------|
| `LOOP_STATE-child.yaml` | Old state file format | `workflow-status.yaml` |

### Root Files

| File | Reason | Replacement |
|------|--------|-------------|
| `AGENT-COORDINATOR.md` | Old coordinator spec | `_bmad-ext/orchestrator/master-orchestrator.md` |
| `SYSTEM-COPY-SUMMARY.md` | Legacy summary | SKILLS_MANIFEST.yaml |
| `settings.json.bk` | Backup file (not needed) | settings.local.json |
| `ralph-loop.local copy.md` | Orphaned duplicate | N/A (deleted) |

### Duplicates (duplicates/)

26 duplicate `ralph-loop.local*.md` files consolidated from `.archive/` root.

---

## What Was NOT Archived

These files remain active and are referenced by the current system:

### Commands (Active)
- `ado*.md` - ADO workflow commands
- `orchestrate-implement.md` - Orchestration command
- `deep-scan-*.md` - Diagnostics commands
- `codebase-diagnostic.md` - Codebase health check
- `sprint-planning-wrapper.md` - NEW: Enhanced sprint planning
- `story-cycle.md` - UPDATED: With Product Reality Gates
- `agent-delegation-*.md` - ADO sub-commands

### Skills (Active)
- All skills under `.claude/skills/` including:
  - `product-reality-*/` - NEW: Product Reality Gates
  - `architecture-remediation/` - ARC workflows
  - Global standards (global-*.md)

### Config (Active)
- `unified-agent-registry.yaml` - Agent definitions
- `hooks/` - Session and tool hooks

---

## Migration Notes

### Product Reality Gates Integration

The `.claude/commands/index.yaml` was updated to include:
- New command: `sprint-planning-wrapper` (priority 36)
- Updated command: `story-cycle` (v2.1.0 with Product Reality Gates)

The `.claude/skills/SKILLS_MANIFEST.yaml` was updated to v3.1.0:
- New category: `product-reality` (priority 5-9, highest priority)
- Three new skills:
  - `ux-gate` - User Journey Simulation ("The Movie Script Test")
  - `brain-gate` - Agent Tool Specification
  - `visual-gate` - Reality Check (UI validation)

### Command Shorthands

| Old | New | Notes |
|-----|-----|-------|
| `/ralph-loop` | `/loop` | Unified ASGL loop |
| `/bmad` | `/bm` | Shorter, consistent |
| `/bmm-dev` | `/dev` | Unified development command |

---

## Verification

After archive cleanup, verify:
- [ ] `/loop` command loads ASGL workflow
- [ ] `/sprintpw` loads Sprint Planning Wrapper
- [ ] `/cycle` loads Enhanced Story-Cycle with Product Reality Gates
- [ ] No orphaned `ralph-loop*.md` files in `.claude/` root
- [ ] All Product Reality Gates skills are accessible

---

**Archived by**: BMAD Orchestrator v1.1
**Archive Reference**: `.claude/.archive/2026-01-11-legacy/`
