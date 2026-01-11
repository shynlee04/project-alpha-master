# BMAD Extension Layer - Root Cause Analysis & Fix

**Created**: 2026-01-11
**Status**: IN_PROGRESS
**Purpose**: Document why the extension layer wasn't working and how to fix it

---

## Executive Summary

The BMAD Extension Layer (`_bmad-ext/`) was built with comprehensive concepts but **never fully activated**. The MANIFEST.yaml shows Phases 1-5 as `PENDING`, meaning the system was designed but never integrated into the actual command and agent workflow.

**Root Causes**:
1. **Paths Mismatch**: Commands point to original `_bmad/` paths, not enhanced `_bmad-ext/` paths
2. **LOOP_STATE Never Initialized**: The global state file has `null` values
3. **Duplicate Governance**: Two modules (`governance/` + `governance-core/`) caused confusion
4. **Hooks Reference Old Paths**: Session-start and user-prompt hooks use deprecated paths
5. **Agents Not Enhanced**: module-builder and workflow-builder don't integrate with extension system

---

## Root Cause 1: Command System Points to Wrong Paths

### Current State
Claude Code commands in `.claude/commands/bmad/` point to:
- `_bmad/bmm/agents/*.md` (original agents)
- `_bmad/bmb/agents/*.md` (original builder agents)

### Should Point To
- `_bmad-ext/agents/*.md` (enhanced agents with extension integration)
- `_bmad-ext/orchestrator/master-orchestrator.md` (central orchestrator)

### Evidence
```bash
# These commands exist but bypass the extension layer:
.claude/commands/bmad/bmm/agents/dev.md → _bmad/bmm/agents/dev.md
.claude/commands/bmad/bmb/agents/module-builder.md → _bmad/bmb/agents/module-builder.md
.claude/commands/bmad/bmb/agents/workflow-builder.md → _bmad/bmb/agents/workflow-builder.md
```

### Impact
- Extension layer never gets invoked
- LOOP_STATE never initialized
- No artifact tracking
- No self-governance

---

## Root Cause 2: LOOP_STATE Never Initialized

### Current State
`_bmad-ext/state/LOOP_STATE.yaml` contains:
```yaml
session:
  id: null          # ❌ Never generated
  start_time: null  # ❌ Never set
  iteration: 0

anchor:
  human_intent_summary: null  # ❌ Never set
  human_intent_timestamp: null  # ❌ Never set

governance:
  last_check: null  # ❌ Never runs
  status: "pending"
```

### Should Be
```yaml
session:
  id: "uuid-here"
  start_time: "2026-01-11T10:00:00Z"
  iteration: 1

anchor:
  human_intent_summary: "User request"
  human_intent_timestamp: "2026-01-11T10:00:00Z"

governance:
  last_check: "2026-01-11T10:00:00Z"
  status: "ACTIVE"
  stale_detected: 0
```

### Impact
- No session tracking
- No anti-hallucination anchor
- No governance checks
- No progress metrics

---

## Root Cause 3: Duplicate Governance Modules

### Current State
Two conflicting modules exist:
1. `_bmad-ext/modules/governance/` - Complex with 8 subfolders
2. `_bmad-ext/modules/governance-core/` - Similar but separate

Both have:
- Workflows for context-first, expert-analysis, research-trigger
- Scanners for artifacts and domains
- Similar but incompatible structures

### Impact
- Confusion about which to use
- Overlapping functionality
- Neither fully integrated
- Duplicate maintenance

---

## Root Cause 4: Hooks Reference Old Paths

### session-start.yaml (existing)
```yaml
# WRONG PATHS
Read: .claude/LOOP_STATE-child.yaml
Read: _bmad/modules/asgl/LOOP_STATE-parent.yaml
```

### Should Be
```yaml
# CORRECT PATHS
Read: _bmad-ext/state/LOOP_STATE.yaml
Read: _bmad-ext/state/ARTIFACT_REGISTRY.yaml
```

### Impact
- Session initialization fails or uses wrong state
- Artifacts not registered
- No stale detection

---

## Root Cause 5: Module-Builder Not Enhanced

### Original Agent (`_bmad/bmb/agents/module-builder.md`)
- Loads config.yaml
- Shows menu
- Executes workflows
- **No LOOP_STATE integration**
- **No artifact registry**
- **No handoff protocol**
- **No governance updates**

### Enhanced Version (`_bmad-ext/agents/module-builder-ext.md`) - CREATED
- Loads LOOP_STATE on activation
- Registers artifacts in ARTIFACT_REGISTRY
- Uses master orchestrator for routing
- Updates governance on completion
- Creates traceable handoff artifacts
- Verifies anchor freshness (anti-hallucination)

---

## Solution Implementation

### Phase 1: Fix LOOP_STATE Initialization ✅ IN PROGRESS

**Status**: Creating enhanced module-builder and workflow-builder with proper LOOP_STATE integration

**Files Created/Modified**:
- `_bmad-ext/agents/module-builder-ext.md` (new)
- `_bmad-ext/agents/workflow-builder-ext.md` (pending)

### Phase 2: Consolidate Governance Modules

**Action**: Merge `governance/` and `governance-core/` into unified structure

**Structure**:
```
_bmad-ext/modules/governance/
├── MODULE.md              # Unified module definition
├── config/
│   ├── module.yaml
│   └── retention-policy.yaml
├── policies/
│   ├── artifact-lifecycle.md
│   ├── context-strategy.md
│   └── gating-policy.md
├── scanners/
│   └── artifact-scanner.md
└── workflows/
    └── self-governance-cycle.md
```

### Phase 3: Fix Hook Paths

**Action**: Update `.claude/hooks/session-start.yaml` and `user-prompt-submit.yaml`

**Changes**:
```yaml
# OLD (wrong)
Read: .claude/LOOP_STATE-child.yaml
Read: _bmad/modules/asgl/LOOP_STATE-parent.yaml

# NEW (correct)
Read: _bmad-ext/state/LOOP_STATE.yaml
Read: _bmad-ext/state/ARTIFACT_REGISTRY.yaml
```

### Phase 4: Create Platform Commands

**Action**: Create commands that invoke enhanced agents

**Files to Create**:
- `.claude/commands/bmad-ext/master-orchestrator.md`
- `.claude/commands/bmad-ext/module-builder.md`
- `.claude/commands/bmad-ext/workflow-builder.md`

### Phase 5: Activate Extension Layer

**Action**: Update MANIFEST.yaml phases from PENDING to ACTIVE

**Changes**:
```yaml
# BEFORE
phase_1:
  status: "PENDING"
phase_2:
  status: "PENDING"

# AFTER  
phase_1:
  status: "ACTIVE"
phase_2:
  status: "ACTIVE"
```

---

## Immediate Actions Required

### 1. Fix HOOK Paths
```bash
# Update .claude/hooks/session-start.yaml
# Change paths to _bmad-ext/state/ structure
```

### 2. Initialize LOOP_STATE
```bash
# Create proper LOOP_STATE.yaml with session data
# Add initialization to session-start hook
```

### 3. Create Platform Commands
```bash
# Create .claude/commands/bmad-ext/ directory
# Add commands that invoke _bmad-ext/agents/*.md
```

### 4. Activate Extension Layer
```bash
# Update MANIFEST.yaml phases to ACTIVE
# Run governance cycle to verify
```

### 5. Archive Duplicate Modules
```bash
# Archive governance-core/ (consolidated into governance/)
# Update MANIFEST to reflect consolidation
```

---

## Verification Checklist

- [ ] LOOP_STATE initialized with session ID
- [ ] ARTIFACT_REGISTRY created and accessible
- [ ] Hooks use correct `_bmad-ext/state/` paths
- [ ] Platform commands invoke enhanced agents
- [ ] MANIFEST phases updated to ACTIVE
- [ ] Governance module consolidated
- [ ] Module-builder creates traceable artifacts
- [ ] Workflow-builder registers artifacts
- [ ] Self-governance cycle runs on session start
- [ ] Stale artifacts detected and archived

---

## Next Steps

1. **Complete Phase 1**: Finish creating enhanced module-builder and workflow-builder
2. **Fix Hook Files**: Update session-start and user-prompt-submit with correct paths
3. **Create Platform Commands**: Add commands for enhanced agents
4. **Test Integration**: Run a story cycle through the extension layer
5. **Update MANIFEST**: Mark phases as ACTIVE after verification

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-11
**Next Review**: After Phase 1 completion
