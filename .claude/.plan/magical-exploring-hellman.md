# BMAD Framework Consolidation Plan
**ID**: BMAD-CONSOLIDATE-2026-01-07
**Status**: DRAFT - Pending Approval
**Coverage**: Full - All requirements addressed in strategic phases

---

## Executive Summary

**Current State Analysis** (from 3 parallel Explore agents):
- **40 agents** in .claude/ with 18 missing YAML frontmatter
- **32 skill directories** with 1 empty (bmad-orchestrator) and 14 orphaned
- **10 modules** in _bmad/ with 4 lacking manifests
- **2 confirmed duplicates** (file-sync-specialist, workspace-architect)
- **3 missing workflows** referenced but not created

**Target State**:
- **<8 active agent profiles** (from 50+ scattered agents)
- **~15 consolidated skills** (from 40+)
- **4 strategic modules** (from 10+)
- **100% Claude Code integration** (hooks, skills, commands working)
- **Self-regulating BMAD-Core-Master loops**

**Approach**: 5 Phases with nested cycles, each with validation gates before proceeding.

---

## Phase 1: Platform Integration Foundation
**Objective**: Fix Claude Code platform integration (hooks, skills, commands)
**Dependencies**: None (can start immediately)

### Cycle 1.1: Hook Rebuild (Hybrid Approach)
**Input**: .bk hook files + official Claude Code docs
**Output**: 5 working hooks with JSON output

| Hook | Source | Action | Validation |
|------|--------|--------|------------|
| `daily-governance-audit.sh` | .bk reference + rebuild | Add JSON output, optimize execution | `bash .claude/hooks/daily-governance-audit.sh \| jq .` |
| `pre-execution.sh` | .bk reference + rebuild | Add JSON output, optimize execution | `bash .claude/hooks/pre-execution.sh \| jq .` |
| `ralph-loop.sh` | .bk reference + rebuild | Already has JSON, validate | `bash .claude/hooks/ralph-loop.sh \| jq .` |
| `context-bridge.sh` | .bk reference + rebuild | Add JSON output | `bash .claude/hooks/context-bridge.sh \| jq .` |
| `context-check.sh` | .bk reference + rebuild | Add JSON output | `bash .claude/hooks/context-check.sh \| jq .` |

**Steps**:
1. Research official Claude Code hooks docs via MCP (Context7/DeepWiki)
2. Read each .bk file to understand intended functionality
3. Rebuild with:
   - Proper JSON output (`{"decision": "...", "systemMessage": "..."}`)
   - Resource efficiency (background process management)
   - Error handling with silent failures
4. Test each hook individually
5. Register in `~/.claude/settings.json`

### Cycle 1.2: Skill Frontmatter Validation
**Output**: All skills with proper YAML triggers

**Skills needing YAML frontmatter**:
1. `state-consolidation.md` - Add name/description/triggers
2. `systematic-debugging/CREATION-LOG.md` - Remove or add frontmatter
3. `writing-skills/examples/CLAUDE_MD_TESTING.md` - Remove or add frontmatter
4. `writing-skills/persuasion-principles.md` - Remove or add frontmatter

**Empty directory to fix**:
- `bmad-orchestrator/` - Create SKILL.md with orchestrator triggers

**Steps**:
1. Add proper YAML frontmatter to each:
   ```yaml
   ---
   name: skill-name
   description: This skill should be used when [trigger phrases]
   version: 1.0.0
   ---
   ```
2. Validate with Claude Code skill activation test
3. Remove non-skill files from skill directories

### Cycle 1.3: Orphaned Skills Archive
**Output**: 14 orphaned skills archived, clean skill tree

**Orphaned skills to archive** (move to `.claude/.archive/skills/`):
1. brainstorming/
2. dispatching-parallel-agents/
3. executing-plans/
4. finishing-a-development-branch/
5. receiving-code-review/
6. requesting-code-review/
7. subagent-driven-development/
8. systematic-debugging/
9. test-driven-development/
10. using-git-worktrees/
11. using-superpowers/
12. verification-before-completion/
13. writing-plans/
14. writing-skills/

**Note**: These will be restored IF their functionality is unique and needed. For now, archive to reduce context load.

### Cycle 1.4: Command-to-Workflow Mapping Validation
**Output**: All commands point to existing workflows/agents

**Validation Steps**:
1. For each command in `.claude/commands/bmad/**/*.md`
2. Extract referenced workflow/agent path
3. Verify file exists
4. Remove or fix commands pointing to non-existent targets
5. Update `unified-agent-registry.yaml`

---

## Phase 2: Agent Consolidation
**Objective**: Reduce 50+ agents to <8 active profiles
**Dependencies**: Phase 1 complete

### Cycle 2.1: Remove Duplicates
**Output**: 2 duplicate files removed

| Duplicate | Keep | Delete |
|-----------|------|--------|
| `file-sync-specialist` | `.claude/agents/file-sync-specialist.md` (186 lines) | `.claude/agents/arc-agents/file-sync-specialist.md` (36 lines) |
| `workspace-architect` | `.claude/agents/workspace-architect.md` (89 lines) | `.claude/agents/arc-agents/workspace-architect.md` (39 lines) |

### Cycle 2.2: Consolidate Deep-Scan Agents
**Output**: 1 unified analyzer agent (from 11 deep-scan agents)

**Consolidation strategy**:
- Merge all `deep-scan-*-scanner.md` agents into `architecture-remediation-orchestrator.md`
- Add "Scanner Capabilities" section with sub-modes:
  - RAG Scanner
  - Architecture Scanner
  - State Scanner
  - Security Scanner
  - Performance Scanner
  - Persistence Scanner
  - Types Scanner
  - UX Scanner
  - Workspace Scanner
  - Agent-RAG Scanner
  - Evidence Synthesizer

### Cycle 2.3: Consolidate BMAD Subdirectories
**Output**: 3 consolidated profiles (from 16 agents in subdirectories)

| From | To | New Profile |
|------|-----|-------------|
| `bmad-analysis/` (4 agents) | Unified **analyzer** profile | `.claude/agents/analyzer.md` |
| `bmad-research/` (2 agents) | Merged into analyzer | |
| `bmad-planning/` (7 agents) | Unified **planner** profile | `.claude/agents/planner.md` |
| `bmad-review/` (3 agents) | Unified **reviewer** profile | `.claude/agents/reviewer.md` |

### Cycle 2.4: Add YAML Frontmatter to All Agents
**Output**: 18 agents with proper YAML frontmatter

**Agents needing frontmatter**:
1. All deep-scan agents (until consolidated)
2. `agent-profile-loader.md`
3. `architecture-remediation-orchestrator.md`
4. `component-splitter.md`
5. `store-refactorer-loader.md`
6. Root `file-sync-specialist.md`
7. Root `workspace-architect.md`

### Cycle 2.5: Create Missing Workflows
**Output**: 3 missing workflows created

**Missing workflows** (referenced but not existent):
1. `/bmad-bmm-workflows-knowledge-sync-strategy`
2. `/bmad-bmm-workflows-notes-sync-strategy`
3. `/bmad-bmm-workflows-workspace-file-system-e2e`

**Action**: Create these in `_bmad/modules/sprint-execution/workflows/` or appropriate module.

---

## Phase 3: Module Harmonization
**Objective**: Align _bmad modules with .claude structure, eliminate duplication
**Dependencies**: Phase 2 complete

### Cycle 3.1: Module Consolidation (10 → 4)
**Output**: 4 strategic modules

| From | To | description |
|------|-----|---------|
| `core-governance/`, `governance/`, `asgl/` | **Module A: Orchestration Core** | Loop coordination, governance, context management |
| `architecture-remediation/`, `architecture-refactoring/`, `quality/` | **Module B: Architecture** | Deep scan, remediation, refactoring, quality scanners |
| `sprint-execution/`, BMM agents | **Module C: Sprint Execution** | Development workflows, stories, implementation |
| `integration-testing/` | **Module D: Quality** | Review, testing, validation, cross-platform sync |

### Cycle 3.2: Agent Profile Finalization (8 profiles)
**Output**: <8 active agent profiles with clear triggers

| # | Profile | Consolidates | Trigger Phrases |
|---|---------|--------------|-----------------|
| 1 | orchestrator | bmad-master, asgl agents | "run BMAD", "autonomous loop", "coordinate", "orchestrate" |
| 2 | architect | architect, workspace-architect, arc-agents | "design", "architecture", "ADR", "system design" |
| 3 | analyzer | all deep-scan-*, bmad-analysis, bmad-research | "analyze", "scan", "diagnose", "health check", "investigate" |
| 4 | implementer | dev, implementer, developer agents | "implement", "build", "code", "feature", "develop" |
| 5 | refactorer | store-refactorer, component-splitter | "split", "refactor", "god store", "normalize", "eliminate god" |
| 6 | reviewer | all bmad-review, code-reviewer | "review", "code review", "validate", "audit" |
| 7 | planner | pm, sm, all bmad-planning | "plan", "sprint", "story", "epic", "backlog" |
| 8 | researcher | bmad-research, spec agents, tech-writer | "research", "spec", "document", "investigate" |

### Cycle 3.3: Update unified-agent-registry.yaml
**Output**: Clean registry with 8 profiles

**Location**: `.claude/config/unified-agent-registry.yaml`

**Content**:
```yaml
version: "2.0.0"
active_profiles:
  - id: orchestrator
    file: ".claude/agents/orchestrator.md"
    triggers: ["run BMAD", "autonomous loop", "coordinate"]
  - id: architect
    file: ".claude/agents/architect.md"
    triggers: ["design", "architecture", "ADR"]
  - id: analyzer
    file: ".claude/agents/analyzer.md"
    triggers: ["analyze", "scan", "diagnose"]
  - id: implementer
    file: ".claude/agents/implementer.md"
    triggers: ["implement", "build", "code"]
  - id: refactorer
    file: ".claude/agents/refactorer.md"
    triggers: ["split", "refactor", "god store"]
  - id: reviewer
    file: ".claude/agents/reviewer.md"
    triggers: ["review", "validate", "audit"]
  - id: planner
    file: ".claude/agents/planner.md"
    triggers: ["plan", "sprint", "story"]
  - id: researcher
    file: ".claude/agents/researcher.md"
    triggers: ["research", "spec", "document"]
```

---

## Phase 4: BMAD-Core-Master Activation
**Objective**: Enable self-regulating loops with context filtering
**Dependencies**: Phase 3 complete

### Cycle 4.1: Enhance BMAD-Core-Master Agent
**Output**: Updated `bmad-master.md` with self-regulation

**Additions needed**:
1. **Context TTL filtering**: Ignore artifacts older than 24 hours
2. **Frontmatter parsing**: Read only headers before consuming full artifact
3. **Metadata validation**: Check status (validated/outdated) before loading
4. **Time-boxing**: Trigger deep-investigation if story >30 mins
5. **Loop-within-loop**: Sprint loop → Story loop → Task loop

### Cycle 4.2: AGENT-STATE.yaml Schema Update
**Output**: Enhanced schema for handoffs and subagents

**Add sections**:
```yaml
handoffs:
  pending: []
  completed: []

subagents:
  active: []
  completed: []

context_filtering:
  ttl_hours: 24
  frontmatter_only: true
  metadata_required: true
```

### Cycle 4.3: Create Loop Governance Status Files
**Output**: YAML files for loop state tracking

**Files to create**:
1. `_bmad/modules/orchestration-core/loop-state.yaml` - Sprint-level state
2. `_bmad/modules/orchestration-core/story-state.yaml` - Story-level state
3. `_bmad/modules/orchestration-core/context-filter.yaml` - TTL rules

---

## Phase 5: Validation & Governance Enforcement
**Objective**: Verify all changes, update governance docs
**Dependencies**: Phase 4 complete

### Cycle 5.1: Hook Validation
**Check**: All 5 hooks output valid JSON

```bash
for hook in .claude/hooks/*.sh; do
  echo "Testing: $hook"
  bash "$hook" 2>/dev/null | jq . > /dev/null && echo "✅ PASS" || echo "❌ FAIL"
done
```

### Cycle 5.2: Agent Registry Validation
**Check**: All 8 profiles exist and have triggers

```bash
for profile in orchestrator architect analyzer implementer refactorer reviewer planner researcher; do
  file=".claude/agents/$profile.md"
  if [[ -f "$file" ]]; then
    grep -q "^name:" "$file" && echo "✅ $profile has frontmatter" || echo "❌ $profile missing frontmatter"
  else
    echo "❌ $profile does not exist"
  fi
done
```

### Cycle 5.3: Skill Registry Validation
**Check**: All active skills have proper YAML

```bash
for skill_dir in .claude/skills/*/; do
  if [[ -f "$skill_dir/SKILL.md" ]]; then
    grep -q "^name:" "$skill_dir/SKILL.md" && echo "✅ $(basename $skill_dir)" || echo "❌ $(basename $skill_dir)"
  fi
done
```

### Cycle 5.4: Command Mapping Validation
**Check**: All commands point to existing targets

```bash
find .claude/commands -name "*.md" -exec grep -l "action:" {} \; | while read cmd; do
  # Extract referenced workflow/agent and verify existence
  # Report any broken references
done
```

### Cycle 5.5: Governance Documentation Update
**Output**: Updated AGENTS.md, CLAUDE.md

**Updates**:
1. Add new 8-profile structure to AGENTS.md
2. Update platform integration section
3. Document new module structure (4 modules)
4. Add loop governance documentation

---

## Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Active agent profiles | 50+ | <8 | ✅ 8 |
| Skill directories | 32 | ~15 | ✅ Reduced |
| Duplicate files | ~10 | 0 | ✅ None |
| Hooks with JSON | 1/5 | 5/5 | ✅ 100% |
| Agents with frontmatter | ~50% | 100% | ✅ All |
| Modules | 10 | 4 | ✅ Consolidated |
| Commands broken | Unknown | 0 | ✅ All valid |

---

## Critical Files to Modify

### Files to CREATE:
1. `.claude/agents/orchestrator.md`
2. `.claude/agents/analyzer.md`
3. `.claude/agents/implementer.md`
4. `.claude/agents/refactorer.md`
5. `.claude/agents/reviewer.md`
6. `.claude/agents/planner.md`
7. `.claude/agents/researcher.md`
8. `.claude/agents/architect.md`
9. `.claude/skills/bmad-orchestrator/SKILL.md`
10. `.claude/.archive/skills/` (directory for 14 orphaned skills)
11. `_bmad/modules/orchestration-core/loop-state.yaml`

### Files to MODIFY:
1. `.claude/config/unified-agent-registry.yaml`
2. `.claude/AGENT-STATE.yaml`
3. `.claude/hooks/daily-governance-audit.sh`
4. `.claude/hooks/pre-execution.sh`
5. `.claude/hooks/context-bridge.sh`
6. `.claude/hooks/context-check.sh`
7. `AGENTS.md`
8. `_bmad/core/agents/bmad-master.md`

### Files to DELETE:
1. `.claude/agents/arc-agents/file-sync-specialist.md` (duplicate)
2. `.claude/agents/arc-agents/workspace-architect.md` (duplicate)
3. `.claude/codetree-for`
4. `.claude/codetree-for-analysi-2.mdstree`

---

## Execution Order (Sequential)

1. **Phase 1** (Platform Integration) → Foundation for everything else
2. **Phase 2** (Agent Consolidation) → Reduce clutter
3. **Phase 3** (Module Harmonization) → Align _bmad and .claude
4. **Phase 4** (BMAD-Core-Master) → Enable self-regulation
5. **Phase 5** (Validation) → Verify everything works

---

## Rollback Plan

If any phase fails:
1. Restore from backup (all .bk files available)
2. Document failure reason
3. Adjust approach
4. Retry phase

---

**Status**: Ready for execution upon approval
**Estimated Duration**: 4-6 hours across all phases
**Next Action**: Execute Phase 1, Cycle 1.1 (Hook Rebuild)
