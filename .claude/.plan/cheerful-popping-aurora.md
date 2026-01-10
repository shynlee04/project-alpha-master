# BMAD Agent Integration Plan
# Token-Efficient Multi-Agent Coordination System

**Status**: PROPOSED
**Created**: 2026-01-05
**Author**: Claude Code (Plan Mode)

---

## Executive Summary

Create a token-efficient agent integration system that:
1. Uses **Hybrid Pattern**: Core dispatcher + selected skill proxies for common workflows
2. Maintains **LOOP_STATE.yaml** for centralized state tracking
3. **Consolidates** duplicate skills into single BMAD source with `.claude` as reference proxy

**Token Savings Target**: ~60-70% reduction in `.claude/` file sizes through referencing instead of duplication

---

## Architecture Overview

```
.claude/
├── AGENT-COORDINATOR.md          # Core dispatcher (NEW)
├── skills/
│   └── bmad-orchestrator/SKILL.md  # Skill entry point (NEW)
├── rules/
│   ├── agent-handoff.md           # Handoff protocol (NEW)
│   └── state-management.md        # State tracking rules (NEW)
└── AGENT-STATE.yaml               # Conversation state (NEW)

References to _bmad/ (not duplication):
├── modules/asgl/                  # Autonomous loops
├── modules/architecture-remediation/  # Remediation workflows
├── bmm/workflows/                 # Core workflows
└── bmm/agents/                    # Agent definitions
```

---

## Phase 1: Core Dispatcher (AGENT-COORDINATOR.md)

**Purpose**: Intent detection → Route to appropriate BMAD module/agent

### File Structure
```markdown
# AGENT-COORDINATOR.md

You are the Agent Coordinator for this BMAD V6 project.

## Reference Architecture (DO NOT DUPLICATE)
All workflow details are in _bmad/. Load on-demand:
- Main loop: _bmad/modules/asgl/workflows/main-loop.md
- Module routing: _bmad/modules/asgl/config/module-integration.yaml
- Sprint status: _bmad-output/sprint-artifacts/sprint-status.yaml

## Intent Detection
Route to @bmad/{module}/{agent} based on user request:

| Intent Pattern | Module | Agent | Workflow |
|----------------|--------|-------|----------|
| "god store", "split store" | architecture-remediation | store-refactorer | eliminate-god-stores |
| "component too big", "split" | architecture-remediation | component-splitter | normalize-components |
| "diagnose", "scan", "health" | deep-scan | state-scanner | targeted-scan |
| "implement story", "dev" | bmad-core | dev | dev-story |
| "code review" | bmad-core | dev | code-review |
| "autonomous loop", "sprint" | asgl | bmad-master | main-loop |

## Auto-Switching Protocol
1. Read AGENT-STATE.yaml for current context
2. Determine if handoff needed
3. Generate handoff artifact (templates in _bmad/modules/asgl/templates/)
4. Update AGENT-STATE.yaml
5. Invoke target agent with @bmad/{module}/{agent}

## Token Efficiency
- NEVER inline entire workflows
- Use Read tool to load only relevant sections
- Cache loaded content in conversation memory
```

**Size**: ~100 lines (vs 500+ if duplicated)

---

## Phase 2: Skill Proxy (bmad-orchestrator/SKILL.md)

**Purpose**: Skill entry point that references BMAD workflows

### File Structure
```yaml
name: bmad-orchestrator
description: |
  Orchestrates BMAD V6 workflows for autonomous development.
  Routes to specialized modules without duplicating content.

triggers:
  - "run autonomous loop"
  - "execute sprint"
  - "course correction"
  - "eliminate god stores"

# References (not inline content)
workflows:
  autonomous_loop: _bmad/modules/asgl/workflows/main-loop.md
  god_stores: _bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md
  dev_story: _bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml

# State
state_file: .claude/AGENT-STATE.yaml

# Auto-load these files on trigger
context_files:
  - _bmad/modules/asgl/LOOP_STATE.yaml
  - _bmad/modules/asgl/config/module-integration.yaml
  - _bmad-output/sprint-artifacts/sprint-status.yaml
```

**Size**: ~50 lines (vs 300+ if duplicated)

---

## Phase 3: Handoff Protocol (agent-handoff.md)

**Purpose**: Standardized handoff between agents

### File Structure
```markdown
# Agent Handoff Protocol

## When to Handoff
Handoff when:
- Task type changes (e.g., diagnosis → implementation)
- Specialized expertise needed
- Workflow explicitly requires different agent

## Handoff Template (use ASGL template)
```yaml
_source: _bmad/modules/asgl/templates/handoff-artifact.md

session: {session_id}
from_agent: {current}
to_agent: {target}
story: {story_id}
task: {brief_description}

## Context
- Current state: {state}
- Artifacts: {created}
- Pending: {items}

## Acceptance Criteria
{criteria_list}

## Next Action
{specific_action}
```

## Handoff Steps
1. Create handoff artifact in _bmad-output/handoffs/
2. Register in _bmad/modules/asgl/scratchpad/artifact-registry.yaml
3. Update AGENT-STATE.yaml
4. Use @bmad/{module}/{agent} to invoke
5. Target agent reads handoff, executes, reports back
```

**Size**: ~80 lines

---

## Phase 4: State Management (state-management.md + AGENT-STATE.yaml)

**Purpose**: Centralized conversation state tracking

### AGENT-STATE.yaml Template
```yaml
# AGENT-STATE.yaml - Conversation state for agent coordination
# DO NOT edit manually - managed by AGENT-COORDINATOR

session:
  id: "AGENT-{timestamp}"
  started_at: "{ISO_timestamp}"
  status: "ACTIVE"  # ACTIVE | PAUSED | COMPLETED

current:
  agent: "bmad-core-bmad-master"
  workflow: "main-loop"
  story: "S-001"

progress:
  stories_completed: 0
  stories_remaining: 33
  artifacts_created: []

handoffs:
  pending: []
  completed: []

context:
  sprint_file: "_bmad-output/sprint-artifacts/comprehensive-remediation-sprint-2026-01-05.yaml"
  health_score: 46.4
  target_score: 95.0

continuation:
  next_action: "Load story S-001 from sprint artifact"
  resume_prompt: |
    Resume agent session {session.id}
    Current story: {current.story}
    Next: {continuation.next_action}
```

### Rules File Content
```markdown
# State Management Rules

## Read Before Each Action
Always read AGENT-STATE.yaml at start of each turn.

## Update After Each Action
After completing any work:
1. Update progress counters
2. Log artifacts created
3. Set next_action
4. Write back to AGENT-STATE.yaml

## Session Persistence
- Session survives across conversation turns
- Use continuation.next_action for resume
- PAUSED sessions can be resumed later

## Conflict Resolution
If AGENT-STATE.yaml conflicts with LOOP_STATE.yaml:
- LOOP_STATE is authoritative for sprint execution
- AGENT-STATE tracks conversation-level state
- Merge both on resume
```

---

## Phase 5: Skill Consolidation

**Current State**:
- `.claude/skills/` - 42 skill definitions
- `.opencode/skill/` - Duplicate of above
- `_bmad/` - Source of truth for workflows

**Consolidation Plan**:

### Step 1: Create BMAD Skills Index
```yaml
# _bmad/.skills-index.yaml
# Single source of truth for all skills

skills:
  # Architecture Remediation
  eliminate-god-stores:
    module: architecture-remediation
    workflow: workflows/eliminate-god-stores.md
    agent: agents/store-refactorer.md
    triggers:
      - "god store"
      - "split store"
      - "store refactoring"

  normalize-components:
    module: architecture-remediation
    workflow: workflows/normalize-components.md
    agent: agents/component-splitter.md
    triggers:
      - "component too big"
      - "split component"

  # Standard Development
  dev-story:
    module: bmad-core
    workflow: bmm/workflows/4-implementation/dev-story/workflow.yaml
    agent: bmm/agents/dev.md
    triggers:
      - "implement story"
      - "development"

  # Add remaining 40 skills...
```

### Step 2: Create Skill Loader
```typescript
// .claude/skills/bmad-orchestrator/loader.js
// Dynamic skill loading from BMAD index

function loadSkill(skillName) {
  const index = readYaml('_bmad/.skills-index.yaml');
  const skill = index.skills[skillName];

  return {
    name: skillName,
    module: skill.module,
    workflowPath: `_bmad/modules/${skill.module}/${skill.workflow}`,
    agentPath: `_bmad/modules/${skill.module}/${skill.agent}`,
    // Load only when invoked
  };
}
```

### Step 3: Update Existing Skills
For each existing skill in `.claude/skills/`:
1. Replace content with reference to `_bmad/` source
2. Keep only trigger patterns and description
3. Add `_source: _bmad/...` reference

Example transformation:
```yaml
# BEFORE (300+ lines of duplicated content)
# .claude/skills/architecture-remediation/SKILL.md
name: architecture-remediation
description: |
  [Full workflow duplicated here...]

# AFTER (30 lines, references source)
name: architecture-remediation
description: |
  Eliminates god stores, normalizes components, fixes architecture debt.

_source: _bmad/modules/architecture-remediation/README.md
workflows:
  god_stores: workflows/eliminate-god-stores.md
  components: workflows/normalize-components.md

triggers:
  - "god store"
  - "eliminate god stores"
  - "split component"
```

---

## Phase 6: Auto-Switching Implementation

### Intent Detection Matrix
```yaml
# .claude/intent-matrix.yaml

intents:
  diagnostic:
    patterns: ["diagnose", "scan", "health", "analyze codebase"]
    route_to: "@bmad/modules/deep-scan/workflows/full-scan"

  remediation:
    patterns: ["fix", "refactor", "eliminate", "split"]
    sub_routes:
      god_store: "@bmad/modules/architecture-remediation/workflows/eliminate-god-stores"
      component: "@bmad/modules/architecture-remediation/workflows/normalize-components"
      typescript: "@bmad/modules/architecture-remediation/workflows/fix-typescript-errors"

  development:
    patterns: ["implement", "develop", "code", "story"]
    route_to: "@bmad/bmm/workflows/4-implementation/dev-story"

  autonomous:
    patterns: ["autonomous loop", "sprint", "course correction"]
    route_to: "@bmad/modules/asgl/workflows/main-loop"
```

### Auto-Switch Workflow
```yaml
# When switching agents:

1. DETECT: Analyze user intent against intent-matrix.yaml
2. PLAN: Read target workflow from _bmad/
3. HANDOFF: Create handoff artifact
4. UPDATE: Write AGENT-STATE.yaml
5. INVOKE: Use @bmad/{module}/{workflow} syntax
6. RECEIVE: Target agent reports completion
7. CONTINUE: Determine next action or return to coordinator
```

---

## Phase 7: Integration with Course Correction Sprints

### Sprint Execution Flow
```yaml
# For executing course-correction-p0-2026-01-05.yaml or comprehensive-remediation-sprint

1. LOAD sprint artifact
2. READ current story (from LOOP_STATE current_story index)
3. DETERMINE story type from route_to field
4. GENERATE handoff artifact
5. INVOKE appropriate module:
   - bmad-core → dev-story
   - architecture-remediation → eliminate-god-stores
   - deep-scan → targeted-scan
   - asgl → governance-update
6. VALIDATE acceptance criteria
7. UPDATE sprint-status.yaml
8. CONTINUE to next story
```

### Story Type → Module Mapping
```yaml
# From sprint artifacts, route_to field maps to:

route_to mappings:
  "bmad-core → dev-story":
    module: "bmad-core"
    workflow: "bmm/workflows/4-implementation/dev-story"
    agent: "dev"

  "architecture-remediation → eliminate-god-stores":
    module: "architecture-remediation"
    workflow: "workflows/eliminate-god-stores"
    agent: "store-refactorer"

  "deep-scan → targeted-scan":
    module: "deep-scan"
    workflow: "workflows/targeted-scan"
    agent: "domain-scanner"

  "asgl → governance-update":
    module: "asgl"
    workflow: "workflows/governance-update"
    agent: "bmad-master"
```

---

## File Creation Summary

### New Files to Create
| File | Purpose | Lines |
|------|---------|-------|
| `.claude/AGENT-COORDINATOR.md` | Core dispatcher | ~100 |
| `.claude/skills/bmad-orchestrator/SKILL.md` | Skill entry | ~50 |
| `.claude/rules/agent-handoff.md` | Handoff protocol | ~80 |
| `.claude/rules/state-management.md` | State rules | ~60 |
| `.claude/AGENT-STATE.yaml` | Conversation state | ~50 |
| `.claude/intent-matrix.yaml` | Intent detection | ~100 |
| `_bmad/.skills-index.yaml` | Skills registry | ~200 |

### Files to Consolidate/Update
| Directory | Action | Token Savings |
|-----------|--------|---------------|
| `.claude/skills/*` | Replace with references | ~60% |
| `.opencode/skill/*` | Delete, use BMAD source | ~100% |
| `.claude/rules/governance-rules.md` | Reference _bmad/ | ~40% |

---

## Token Efficiency Analysis

### Before (Current Duplication)
```
.claude/
├── skills/             ~12,000 tokens (42 files × ~300 lines each)
├── rules/              ~3,000 tokens (10 files with duplicated content)
└── Total:              ~15,000 tokens in .claude/
```

### After (Reference Pattern)
```
.claude/
├── AGENT-COORDINATOR.md ~500 tokens
├── skills/             ~2,000 tokens (references only)
├── rules/              ~1,000 tokens (references only)
├── AGENT-STATE.yaml    ~200 tokens
└── Total:              ~3,700 tokens

Savings: ~11,300 tokens (75% reduction)
```

### Dynamic Loading
```
When workflow needed:
1. Read intent from user message
2. Load specific workflow file from _bmad/
3. Cache in conversation for reuse
4. Load only what's needed, when needed
```

---

## Execution Order

### Phase 1: Foundation (1-2 hours)
1. Create `.claude/AGENT-COORDINATOR.md`
2. Create `.claude/AGENT-STATE.yaml`
3. Create `.claude/rules/state-management.md`

### Phase 2: Handoff System (1 hour)
4. Create `.claude/rules/agent-handoff.md`
5. Create `.claude/intent-matrix.yaml`

### Phase 3: Skill Integration (2 hours)
6. Create `_bmad/.skills-index.yaml`
7. Create `.claude/skills/bmad-orchestrator/SKILL.md`
8. Consolidate existing skills to reference pattern

### Phase 4: Testing (1 hour)
9. Test intent detection and routing
10. Test handoff between agents
11. Test state persistence

### Phase 5: Sprint Integration (1 hour)
12. Wire up to course correction sprint artifacts
13. Test autonomous loop execution
14. Validate token savings

**Total Estimated**: 6-7 hours

---

## Success Criteria

- [ ] AGENT-COORDINATOR.md routes to appropriate BMAD modules
- [ ] Handoff artifacts created and tracked
- [ ] AGENT-STATE.yaml persists across conversation turns
- [ ] Skills reference _bmad/ instead of duplicating
- [ ] Token usage reduced by >60%
- [ ] Course correction sprint can execute via new system
- [ ] ASGL integration works as expected

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Too many reference files to load | Cache loaded content in conversation |
| Circular references in index | Validation step in skills-index.yaml |
| Handoff failures | Fallback to direct @bmad/ invocation |
| State file conflicts | Merge logic with conflict resolution |

---

## Next Steps

1. **Approve Plan**: User approves this plan
2. **Create Foundation**: Phase 1 files
3. **Test Integration**: Verify routing works
4. **Execute Sprint**: Run course correction using new system
5. **Iterate**: Refine based on usage patterns

---

**References**:
- ASGL Module: `_bmad/modules/asgl/`
- Course Correction: `_bmad-output/sprint-artifacts/course-correction-p0-2026-01-05.yaml`
- Comprehensive Remediation: `_bmad-output/sprint-artifacts/comprehensive-remediation-sprint-2026-01-05.yaml`
- Module Integration: `_bmad/modules/asgl/config/module-integration.yaml`
