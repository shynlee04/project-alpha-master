---
archive_id: "archive_20260129_014200_legacy"
archive_date: "2026-01-29T01:42:00+07:00"
archive_type: "full"
reason: "BMAD Beast Mode v2.0.0 migration - clean slate for OpenCode native implementation"
created_by: "module-builder"
---

# Legacy Assets Archive Manifest

## Archive Summary

| Category | Count | Status |
|----------|-------|--------|
| **Agents** | 58 | ✅ Archived |
| **Commands** | 121 | ✅ Archived |
| **Skills** | 45 directories | ✅ Archived |
| **Config** | directory | ✅ Archived |
| **Hooks** | directory | ✅ Archived |
| **Instructions** | directory | ✅ Archived |
| **Rules** | directory | ✅ Archived |
| **Scripts** | directory | ✅ Archived |

## Archival Reason

This archive was created as part of the **OpenCode Native Migration** (Phase 2 - Beast Mode Implementation). The legacy BMAD-style agents, skills, and commands are being replaced with a streamlined, native OpenCode implementation following three core methodologies:

1. **Less for More** - On-demand skill loading vs. preloaded context
2. **Accurately Specific** - Schema-validated artifacts with TTL
3. **Auto Governance** - Plugin-based enforcement vs. text rules

## Restoration Instructions

To restore any archived asset:

```bash
# Restore single file
cp .archive/legacy-2026-01-29/agents/{agent-name}.md agent/

# Restore all agents
cp -r .archive/legacy-2026-01-29/agents/* agent/

# Full rollback
cp -r .archive/legacy-2026-01-29/* ../
```

## Key Legacy Assets

### High-Value Agents (May Reference)
- `ext-master.md` - Original orchestrator pattern
- `dev-ext.md` - Developer agent with TDD workflow
- `architect-ext.md` - Architecture agent
- `analyst-ext.md` - Research agent

### High-Value Skills
- `story-cycle/` - Story development workflow
- `test-driven-development/` - TDD skill
- `architecture-remediation/` - Refactoring patterns
- `systematic-debugging/` - Debug methodology

### Key Commands
- `story-dev-cycle.md` - Full story execution
- `deep-research.md` - Research workflow
- `code-review.md` - Review workflow

## Archive Integrity

This archive is **READ-ONLY**. Do not modify files in this directory.

---

**Created**: 2026-01-29T01:42:00+07:00
**Module Builder Session**: BMAD Beast Mode v2.0.0
