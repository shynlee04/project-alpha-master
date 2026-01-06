# BMAD Framework Consolidation Archive
**Date**: 2026-01-07
**Session**: ASGL-20260106-021651-COURSE-CORRECTION
**Purpose**: Archive orphaned and poisoned context artifacts during framework consolidation

---

## Archive Summary

| Category | Files | Location |
|----------|-------|----------|
| **Deleted from git** | 181 | `deleted-files/deleted-files-list.txt` |
| **Continuation capsules** | 54 | `continuation-capsules/` |
| **Hook logs** | 6 | `hooks/` |
| **ASGL cleanup** | ~50 | `asgl-cleanup-2026-01-07/` |

---

## 1. Deleted Files (Git-tracked, removed during consolidation)

### Why These Were Deleted
The BMAD framework underwent QG-001 (Framework Consolidation Complete):
- Agent profiles reduced from 30+ to ≤8
- Modules consolidated from 9 to ≤4
- Duplicate workflow definitions eliminated
- Platform-specific configs centralized

### Major Categories Deleted

#### 1.1 Agent Documentation (`_bmad/bmb/docs/agents/`)
- `agent-compilation.md` - Consolidated into AGENTS.md
- `agent-menu-patterns.md` - Consolidated into agent-builder.md
- `expert-agent-architecture.md` - Merged into main agent docs
- `simple-agent-architecture.md` - Merged into main agent docs
- `understanding-agent-types.md` - Consolidated
- `kb.csv` - Knowledge base consolidated
- `index.md` - Master index replaced by AGENTS.md

#### 1.2 Workflow Documentation (`_bmad/bmb/docs/workflows/`)
- `index.md` - Replaced by workflow.md
- `kb.csv` - Knowledge base consolidated

#### 1.3 Create Agent Workflow (Removed - obsolete)
- **Steps**: `step-01-brainstorm.md` through `step-08-celebrate.md`
- **Templates**: `agent-plan.template.md`, `expert-agent.template.md`, `simple-agent.template.md`
- **Data**: `agent-validation-checklist.md`, `brainstorm-context.md`, `communication-presets.csv`
- **Reference**: Complete `meal-prep-nutrition` workflow reference data

**Reason**: `create-agent` workflow replaced by `agent-builder` agent with streamlined flow

#### 1.4 CHAM Module (Architecture Remediation - ARCHIVED)
The entire `_bmad/custom/src/modules/cham/` directory was deleted:
- 20+ agent files (architecture-scanner, state-scanner, etc.)
- Configuration files for 5 platforms
- Documentation (agent-specifications.md, architecture.md, usage-guide.md)
- Status reports and diagnostics

**Reason**: CHAM module superseded by integrated architecture-remediation module

#### 1.5 ASGL Module Cleanup
- `LOOP_STATE.yaml` - Replaced by hierarchy (grandparent/parent/child)
- `MASTER_PROMPT.md` - Integrated into bmad-master.md
- `MANIFEST.yaml` - Consolidated into MODULE-ROUTING.yaml
- Multiple velocity/run state files - Transient execution artifacts

#### 1.6 CIS Module Documentation
- `docs/index.md` - Consolidated
- Individual agent docs consolidated into module-level docs

#### 1.7 Platform-Specific Workflow Files
Deleted duplicate workflow definitions across:
- `.agent/`
- `.augment/`
- `.claude/`
- `.clinerules/`
- `.codex/`
- `.crush/`
- `.cursor/`
- `.gemini/`
- `.iflow/`
- `.opencode/`
- `.rovodev/`
- `.trae/`
- `.windsurf/`

**Reason**: Single source of truth established at `_bmad/`, platforms reference via symlink/skill pattern

---

## 2. Continuation Capsules

### What These Are
Continuation capsules are YAML snapshots created when context threshold (65%) is reached during autonomous loop execution. They allow a new conversation to resume where the previous left off.

### Why Archived
- 54 capsules from 2026-01-06 (19:21 to 20:53)
- These are transient execution artifacts
- No longer needed after course correction initiated
- Latest capsule preserved: `continuation-2026-01-07T024000Z.yaml`

### Capsule Pattern
```yaml
session:
  id: "ASGL-VELOCITY-20260106-060000"
  timestamp: "2026-01-06T19:XX:XXZ"

context:
  loop_state: "...hierarchy snapshot..."
  current_action: "..."
  next_action: "..."
```

---

## 3. Hook Logs

### Files Archived
1. `claude-pre-execution-hook-log.txt` - 480KB of hook executions
2. `ralph-loop-hook-log.txt` - Ralph Loop hook debugging
3. `ralph-test-log.txt` - Test execution log
4. `session-start-log.txt` - Session initialization tracking
5. `stop-hook-log.txt` - Stop hook debugging
6. `turn-counter.txt` - Conversation turn tracking

### Purpose
These logs help debug hook execution during autonomous loops. Not needed for production but useful for retrospective analysis.

---

## 4. ASGL Cleanup Archive

### Location
`_bmad-output/archive/asgl-cleanup-2026-01-07/`

### Contents
- Old LOOP_STATE files (pre-hierarchy)
- MASTER-INTEGRATION-LOOP-CONFIG files
- VELOCITY execution tracking
- Orphaned capsule manifests

---

## Restoration Protocol

If any archived content needs to be restored:

1. **Deleted git-tracked files**: Use `git checkout HEAD~1 -- <path>`
2. **Continuation capsules**: Available in archive if needed for debugging
3. **Hook logs**: Available for debugging hook execution issues
4. **ASGL artifacts**: Check archive before creating from scratch

---

## Consolidation Verification

### Before Consolidation
- Agent profiles: 30+
- Modules: 9
- Documentation files: 200+
- Platform sync points: 13 directories

### After Consolidation
- Agent profiles: ≤8 (target met)
- Modules: 4 (target met)
- Documentation: AGENTS.md as single source of truth
- Platform sync: Via `.claude/skills/` integration

---

## Governance Notes

1. **AGENTS.md** is now the authoritative source for all project documentation
2. **LOOP_STATE hierarchy** (3 files) replaces single monolithic state
3. **MODULE-ROUTING.yaml** contains all module availability and routing
4. **Course Correction** active due to verification gap (0 verified / 12 claimed)

---

**Archive Status**: COMPLETE
**Next Review**: After course correction completion
**Retention Policy**: Keep until Q2-2026, then evaluate for deletion
