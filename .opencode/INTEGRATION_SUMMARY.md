# OpenCode + BMAD Integration Summary

> **Generated**: 2026-01-05 | **description**: Document OpenCode integration with ASGL and BMAD modules

## Files Created/Updated

| File | description | Token Optimization |
|------|---------|-------------------|
| `.opencode/skill/asgl/SKILL.md` | ASGL skill definition | ✅ References only (~70% reduction) |
| `.opencode/skill/asgl/MASTER_PROMPT.md` | Master prompt reference | ✅ Minimal reference |
| `.opencode/skill/bmad-core-integration/SKILL.md` | BMAD core integration | ✅ References only |
| `.opencode/skill/bmm-workflows/SKILL.md` | BMM workflows reference | ✅ Minimal reference |
| `.opencode/command/asgl-loop.md` | ASGL command execution | ✅ Full command (required) |
| `.opencode/config/integrations.json` | Integration configuration | ✅ JSON (efficient) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OpenCode (.opencode/)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │ skill/asgl/      │  │ skill/bmad-core/ │  │ command/asgl-loop.md   │  │
│  │ SKILL.md         │  │ SKILL.md         │  │                        │  │
│  │ MASTER_PROMPT.md │  │                  │  │ @asgl run-comprehensive│  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬────────────┘  │
│           │                     │                          │               │
│           └──────────┬──────────┴────────────┬───────────┘               │
│                      ▼                         ▼                          │
│           ┌─────────────────────────────────────────────┐                 │
│           │         config/integrations.json            │                 │
│           │    (Module routing, platform mapping)       │                 │
│           └─────────────────────┬───────────────────────┘                 │
│                                 │                                         │
└─────────────────────────────────┼─────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BMAD Framework (_bmad/)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                         ASGL Module                               │    │
│  │  _bmad/modules/asgl/                                              │    │
│  │  ├── README.md (master documentation)                            │    │
│  │  ├── LOOP_STATE.yaml (session state)                             │    │
│  │  ├── config/governance.yaml                                      │    │
│  │  ├── config/module-integration.yaml                              │    │
│  │  └── workflows/main-loop.md                                      │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                  │                                         │
│           ┌──────────────────────┼──────────────────────┐                 │
│           ▼                      ▼                      ▼                 │
│  ┌────────────────┐   ┌─────────────────────────┐   ┌────────────────┐  │
│  │ deep-scan/     │   │ architecture-remediation│   │ bmm/           │  │
│  │ (Diagnostics)  │   │ (Refactoring)           │   │ (Workflows)    │  │
│  └────────────────┘   └─────────────────────────┘   └────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Sprint Artifacts (_bmad-output/)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  _bmad-output/sprint-artifacts/                                          │
│  ├── course-correction-p0-2026-01-05.yaml (7 stories)                    │
│  ├── comprehensive-remediation-sprint-2026-01-05.yaml (33 stories)       │
│  └── sprint-status.yaml                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Token-Optimized References

Instead of duplicating BMAD content in OpenCode files, we use **references**:

```markdown
# Instead of copying 500 lines...
## Quick Reference
| Item | Location |
|------|----------|
| Master Prompt | `_bmad/modules/asgl/MASTER_PROMPT.md` |
| Loop State | `_bmad/modules/asgl/LOOP_STATE.yaml` |
```

**Benefits**:
- ✅ ~80% token reduction
- ✅ Single source of truth
- ✅ Live updates (no regeneration needed)

### 2. Automatic Module Routing

When `@asgl` is invoked, it routes to the correct module:

```json
// From integrations.json
"workflow_routing": {
  "decision_tree": [
    { "condition": "story.type == 'DIAGNOSTIC'", "module": "deep-scan" },
    { "condition": "story.type == 'GOD_STORE_SPLIT'", "module": "architecture-remediation" },
    { "condition": "story.type == 'IMPLEMENTATION'", "module": "bmad-core" }
  ]
}
```

### 3. Governance Enforcement

All platforms point to AGENTS.md as single source of truth:

| Platform | Configuration | Governance |
|----------|--------------|------------|
| **Claude Code** | `.claude/CLAUDE.md` | → AGENTS.md |
| **OpenCode** | `.opencode/config/integrations.json` | → AGENTS.md |
| **Gemini** | `.gemini/context.md` | → AGENTS.md |
| **BMAD** | `_bmad/` | Uses AGENTS.md directly |

## Usage Examples

### Execute Comprehensive Remediation

```markdown
@asgl run-comprehensive-remediation

# ASGL loads:
# - _bmad/modules/asgl/LOOP_STATE.yaml
# - _bmad-output/sprint-artifacts/comprehensive-remediation-sprint-2026-01-05.yaml
# - Routes S-001 to bmad-core dev-story
# - Executes with validation
# - Updates governance docs every 3 stories
```

### Invoke Single Story

```markdown
@asgl run-comprehensive-remediation --story S-001

# Executes only S-001 (Debug Model Loading Flow)
# Returns completion report
```

### Resume Paused Session

```markdown
@asgl resume

# ASGL checks LOOP_STATE.yaml
# Finds status: PAUSED
# Continues from current_story
```

## Auto-Switching & Handoff

### Module Handoff Protocol

When ASGL invokes another module:

1. **Generate Handoff** → `_bmad/modules/asgl/templates/handoff-artifact.md`
2. **Include Context**: session_id, story_id, constraints
3. **Track in Registry** → `_bmad/modules/asgl/scratchpad/artifact-registry.yaml`

### Cross-Module Communication

```
deep-scan results → architecture-remediation (for planning)
architecture-remediation → arc-sprint-status.yaml (tracking)
bmad-core workflows → bmm-workflow-status.yaml (tracking)
```

## Governance Triggers

| Document | Trigger | Action |
|----------|---------|--------|
| **AGENTS.md** | Every 3 stories | Update epic progress, canonical locations |
| **CLAUDE.md** | Every 5 stories | Update key directories, file stats |
| **Child AGENTS.md** | Layer changes >5 files | Create/update layer-specific docs |

## Success Metrics

### Token Optimization
- **Before**: ~2000 tokens (duplicated content)
- **After**: ~400 tokens (references only)
- **Reduction**: ~80%

### Consistency
- Single source of truth (AGENTS.md)
- All platforms synchronized
- No orphaned artifacts

### Maintainability
- Live updates (BMAD changes reflect immediately)
- No regeneration needed
- Easy to audit

## Related Documents

| Document | Location | description |
|----------|----------|---------|
| ASGL README | `_bmad/modules/asgl/README.md` | Complete ASGL documentation |
| ASGL Master Prompt | `_bmad/modules/asgl/MASTER_PROMPT.md` | Ready-to-use prompt |
| Governance Config | `_bmad/modules/asgl/config/governance.yaml` | Governance rules |
| Module Integration | `_bmad/modules/asgl/config/module-integration.yaml` | Routing table |
| Course Correction Sprint | `_bmad-output/sprint-artifacts/course-correction-p0-2026-01-05.yaml` | P0 sprint (7 stories) |
| Comprehensive Remediation | `_bmad-output/sprint-artifacts/comprehensive-remediation-sprint-2026-01-05.yaml` | Full sprint (33 stories) |

---

**Generated**: 2026-01-05 | **Module**: `.opencode/` | **Version**: 1.0.0
