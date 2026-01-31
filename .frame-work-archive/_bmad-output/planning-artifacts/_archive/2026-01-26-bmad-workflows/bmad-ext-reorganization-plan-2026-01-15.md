# BMAD-EXT Reorganization Plan

**Created**: 2026-01-15
**Version**: 1.0.0
**Purpose**: Complete reorganization of _bmad-ext module to resolve conflicts, establish boundaries, and restore automation

---

## Executive Summary

This plan addresses all critical issues identified in the current _bmad-ext structure:

### Current Problems

| Problem | Impact | Severity |
|----------|---------|-----------|
| Conflicting content | Context poisoning, unclear what to use | CRITICAL |
| No clear navigation | Lost in file system, no entry points | CRITICAL |
| No boundaries | Components overlap, duplicate responsibility | HIGH |
| Lost automation | Self-governance broken, manual intervention needed | CRITICAL |
| Missing BMAD wrappers | Core workflows inaccessible | HIGH |
| Excessive context load | Context waste, slow performance | MEDIUM |
| Date at top | Stale context treated as fresh | HIGH |

### Target State

| Goal | Description |
|-------|-------------|
| Clear hierarchy | 4-tier organization (Orchestrator → Module → Agent → Workflow) |
| Defined boundaries | Each component has single, clear responsibility |
| Explicit entry points | Every component has `/command` entry point |
| Restored automation | Self-governance working, minimal human intervention |
| Complete wrappers | All BMAD core workflows accessible via extensions |
| Context economy | Frontmatter-only loading, hop-reading patterns |
| Stale detection | Version/date at bottom, TTL enforcement |

---

## Reorganization Strategy

### Phase 1: Structure Cleanup (Week 1)

#### 1.1 Archive Deprecated Modules

**Action**: Move to `_bmad-ext/.archive/deprecated/`

| Module | Reason | Action |
|--------|---------|--------|
| `governance-core/` | Duplicate of `governance/` | Archive entire module |
| `platform/` | Outdated platform concepts | Archive entire directory |
| `prompts/` | Old prompt files | Archive entire directory |

**Files to Archive**:
```bash
_bmad-ext/.archive/deprecated/
├── governance-core/                  # Duplicate module
└── platform/                          # Outdated platform docs
```

#### 1.2 Consolidate Duplicate Components

**Action**: Move to canonical locations

| Component Type | Current Locations | Target Location | Action |
|----------------|-------------------|------------------|--------|
| Handoff schemas | Multiple scattered | `_bmad-ext/schemas/handoff-artifact.schema.yaml` | Consolidate to single file |
| Scanners | In multiple modules | Respective modules | Keep, but add frontmatter |
| Hooks | Multiple locations | `.claude/hooks/` | Consolidate to hooks directory |

#### 1.3 Create Directory Standards

**Action**: Enforce canonical structure

```bash
# Target Structure
_bmad-ext/
├── orchestrator/                     # Master entry point
├── agents/                           # Main agents + sub-agents
├── modules/                          # Phase-based modules
│   ├── governance/                   # Phase 0
│   ├── arc-v2/                       # Phase 0 special
│   ├── sprint-planning-wrapper/      # Phase 2
│   ├── implementation/                # Phase 4
│   └── bmad-core/                   # NEW - Phase 1 wrappers
├── shared-services/                   # Infrastructure services
├── schemas/                          # YAML schemas
├── state/                            # State files
├── .handoffs/                        # Handoff artifacts
└── .archive/                          # Archived components
```

---

### Phase 2: Frontmatter Standardization (Week 1-2)

#### 2.1 Apply Schema to All Components

**Priority**: High - Must complete before any other changes

**Action**: Update every file with standardized frontmatter

**Batch 1: Orchestrator Level**
- [ ] `orchestrator/master-orchestrator.md`
- [ ] `orchestrator/delegation-protocol.md`
- [ ] `orchestrator/escalation-protocol.md`

**Batch 2: Module Level**
- [ ] `modules/governance/MODULE.md`
- [ ] `modules/arc-v2/MODULE.md`
- [ ] `modules/sprint-planning-wrapper/MODULE.md`
- [ ] `modules/implementation/MODULE.md`

**Batch 3: Agent Level**
- [ ] `agents/dev-ext.md`
- [ ] `agents/architect-ext.md`
- [ ] `agents/analyst-ext.md`
- [ ] `agents/product-management-ext.md`
- [ ] `agents/ux-designer-ext.md`
- [ ] `agents/tech-writer-ext.md`
- [ ] `agents/remediation-ext.md`

**Batch 4: Workflow Level**
- [ ] `modules/governance/workflows/context-first/workflow.md`
- [ ] `modules/implementation/workflows/story-cycle/workflow.md`
- [ ] All other workflow files

**Validation**:
```bash
# After each batch, validate
pnpm run validate-frontmatter
```

#### 2.2 Move Version/Date to Bottom

**Action**: Update every file with version metadata at bottom

**Before**:
```markdown
---
name: "component"
version: "1.0.0"
updated: "2026-01-15"
---

# Content here
```

**After**:
```markdown
# Content here

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
```

---

### Phase 3: Create Missing Wrappers (Week 2)

#### 3.1 Create bmad-core Module

**Action**: New module to wrap missing BMAD core workflows

**Location**: `_bmad-ext/modules/bmad-core/`

**Structure**:
```
bmad-core/
├── MODULE.md                          # Module definition with frontmatter
├── workflows/
│   ├── brainstorming/
│   │   ├── workflow.md
│   │   └── steps/
│   ├── party-mode/
│   │   ├── workflow.md
│   │   └── steps/
│   ├── create-product-brief/
│   │   ├── workflow.md
│   │   └── steps/
│   ├── prd/
│   │   ├── workflow.md
│   │   └── steps/
│   ├── create-architecture/
│   │   ├── workflow.md
│   │   └── steps/
│   └── create-epics-and-stories/
│       ├── workflow.md
│       └── steps/
```

**Entry Points**:
- `/brainstorm` → brainstorming workflow
- `/party-mode` → multi-agent discussion
- `/product-brief` → create product brief
- `/prd` → PRD creation
- `/architecture` → architecture design
- `/epics` → epic/story creation

#### 3.2 Create Workflow Step Files

**Action**: Add missing step files for each workflow

**Priority**: High - Without steps, workflows can't execute

**Deliverables**:
- Brainstorming workflow: 3-5 step files
- Party-mode workflow: 2-3 step files
- Product brief workflow: 4-5 step files
- PRD workflow: 5-7 step files
- Architecture workflow: 6-8 step files
- Epics workflow: 8-10 step files

#### 3.3 Test Integration

**Action**: Verify each new workflow integrates with existing system

**Tests**:
- [ ] Entry point works (`/command` invocation)
- [ ] Workflow loads frontmatter correctly
- [ ] Steps execute sequentially
- [ ] Integration points are valid
- [ ] Artifacts written to correct locations
- [ ] LOOP_STATE updates appropriately

---

### Phase 4: Boundary Definition (Week 2-3)

#### 4.1 Define Clear Responsibilities

**Action**: Create responsibility matrix for each component

**Governance Module** (Phase 0)
- ✅ Self-governance (artifact lifecycle, TTL enforcement)
- ✅ Context filtering (stale detection, validation)
- ✅ Pre-work validation (research triggers, expert analysis)
- ✅ Recovery workflows (correct-course)

**Architecture Remediation v2** (Phase 0 Special)
- ✅ Diagnostic scanning (6-domain model)
- ✅ Domain isolation (store refactoring, component splitting)
- ✅ Evidence-based remediation plans
- ✅ Architecture conflict resolution

**Sprint-Planning Wrapper** (Phase 2)
- ✅ Cohesion validation (UX coherence checks)
- ✅ Dependency mapping (cross-story dependencies)
- ✅ Reality validation (nonsense detection, 30-sec demo)
- ✅ Sprint gatekeeping

**Implementation Module** (Phase 4)
- ✅ Story execution (TDD implementation)
- ✅ Bug fixes (correct-course workflow)
- ✅ Quality validation (tests, TypeScript, code review)
- ✅ Artifact registration

**BMAD Core Module** (Phase 1 - NEW)
- ✅ Creative workflows (brainstorming, party-mode)
- ✅ Product planning (briefs, PRDs)
- ✅ Architecture creation (system design)
- ✅ Epic/story creation (backlog management)

#### 4.2 Remove Overlapping Functionality

**Action**: Identify and eliminate duplicate responsibilities

| Duplicate | Keep In | Remove From |
|-----------|----------|-------------|
| Stale detection | governance | All other modules |
| Context gathering | governance | story-cycle (when needed) |
| Research | governance | All modules (via trigger) |
| Code review | implementation | agent-specific workflows |
| Validation | governance | All modules (quality gates) |

#### 4.3 Create Decision Tree

**Action**: Clear flow for when to use which component

```yaml
# _bmad-ext/DECISION-TREE.yaml

orchestrator_start:
  condition: "session_start"

  # Phase 0: Governance checks first
  governance_check:
    if: "any_work_requested"
      route: "governance"
      action: "validate_and_gate"

  # Phase 1: BMAD core workflows
  creative_workflow:
    if: "brainstorm|party-mode|creative"
      route: "bmad-core"
      sub_route: "brainstorming|party-mode"

  product_planning:
    if: "product-brief|prd|requirements"
      route: "bmad-core"
      sub_route: "create-product-brief|prd"

  architecture_design:
    if: "architecture|system-design|technical-spec"
      route: "bmad-core"
      sub_route: "create-architecture"

  # Phase 2: Sprint planning
  sprint_planning:
    if: "sprint-planning|plan-sprint"
      route: "sprint-planning-wrapper"
      action: "7-step_enhanced_planning"

  # Phase 0 Special: Architecture remediation
  architecture_scan:
    if: "architecture-scan|diagnostic|remediate"
      route: "arc-v2"
      action: "diagnostic-first"

  # Phase 4: Implementation
  story_development:
    if: "story|develop|implement"
      route: "implementation"
      sub_route: "story-cycle|correct-course"

  bug_fix:
    if: "bug|fix|remediate"
      route: "implementation"
      sub_route: "correct-course"
```

---

### Phase 5: Context Economy Implementation (Week 3)

#### 5.1 Frontmatter-Only Loading

**Action**: Implement hop-reading pattern

**Pattern**:
```typescript
// Pseudo-code for frontmatter-only loading
async function loadComponent(componentPath: string) {
  // Step 1: Load only frontmatter (lightweight)
  const frontmatter = await extractYamlFrontmatter(componentPath);

  // Step 2: Validate frontmatter structure
  validateFrontmatter(frontmatter);

  // Step 3: Return frontmatter immediately
  return frontmatter;
}

// Only load full content when explicitly requested
async function loadFullContent(componentPath: string) {
  const content = await readFile(componentPath);
  return {
    frontmatter: extractYamlFrontmatter(content),
    body: extractMarkdownBody(content)
  };
}

// Hop-reading for workflows
async function executeWorkflow(workflowPath: string) {
  // Load workflow frontmatter only
  const workflow = await loadComponent(workflowPath);

  // Execute steps one at a time
  for (const step of workflow.steps) {
    // Load single step file
    const stepContent = await loadComponent(`${workflowPath}/steps/${step}`);

    // Execute step
    await executeStep(stepContent);

    // Update LOOP_STATE
    await updateLoopState(workflow.name, step);

    // Next step...
  }
}
```

#### 5.2 TTL-Based Caching

**Action**: Implement freshness-aware caching

**Cache Rules**:
```yaml
cache_policies:
  frontmatter:
    ttl: "24 hours"
    refresh_on: "component_updated"

  workflow_definitions:
    ttl: "4 hours"
    refresh_on: "workflow_modified"

  step_content:
    ttl: "0 hours"  # Never cache steps
    refresh_on: "always_load_fresh"
```

#### 5.3 Stale Detection Enforcement

**Action**: Automatic rerun of outdated workflows

**Triggers**:
```yaml
stale_triggers:
  keywords:
    - "validation"
    - "check"
    - "verify"
    - "scan"
    - "diagnostic"
    - "investigation"

  threshold_hours:
    validation: 1      # Rerun after 1 hour
    scan: 1              # Rerun after 1 hour
    architecture: 24     # Prompt after 24 hours
    planning: 168        # Prompt after 7 days
```

**Action on Stale Detection**:
```yaml
on_stale_detected:
  action: "prompt_user"
  message: |
    Artifact {artifact_name} is {age_hours} hours old (threshold: {threshold_hours}).
    This type of artifact should be refreshed.

    Options:
    [R] Rerun workflow - Execute fresh
    [S] Skip - Use current version
    [A] Archive - Mark as archival

  on_rerun:
    action: "execute_workflow"
    archive_old: true
    record_timestamp: true

  on_skip:
    action: "mark_as_cached"
    ttl_reset: false
```

---

### Phase 6: Automation Restoration (Week 3-4)

#### 6.1 Restore Self-Governance

**Action**: Implement automatic governance hooks

**Hook Points**:

```yaml
# Session Start Hook
.claude/hooks/session-start.yaml
triggers:
  - event: "session_start"
    action: "load_governance_module"
    module: "governance"
    tasks:
      - "Check all active artifacts for staleness"
      - "Validate LOOP_STATE freshness"
      - "Initialize governance tracking"

# User Prompt Hook
.claude/hooks/user-prompt-submit.yaml
triggers:
  - event: "user_prompt_submit"
    action: "check_context_threshold"
    threshold: "65%"
    tasks:
      - "Calculate context usage"
      - "If > 65%, create continuation capsule"
      - "If < 65%, proceed normally"

# Step Completion Hook
.claude/hooks/step-completion.yaml
triggers:
  - event: "step_completion"
    action: "governance_check"
    tasks:
      - "Update LOOP_STATE"
      - "Check artifact freshness"
      - "Register new artifacts"
      - "Validate against governance rules"

# Story Completion Hook
.claude/hooks/story-completion.yaml
triggers:
  - event: "story_completion"
    action: "full_governance_check"
    tasks:
      - "Run artifact scan"
      - "Update AGENTS.md (every 3 stories)"
      - "Archive completed artifacts"
      - "Update sprint status"
```

#### 6.2 Implement Auto-Rerun Logic

**Action**: Background process for stale workflow detection

**Process**:
```typescript
// Background stale detection
class StaleWorkflowDetector {
  async scanActiveArtifacts() {
    const activeArtifacts = await this.loadActiveArtifacts();
    const staleArtifacts = [];

    for (const artifact of activeArtifacts) {
      const age = this.calculateAge(artifact);
      const threshold = this.getThreshold(artifact.keywords);

      if (age > threshold) {
        staleArtifacts.push({
          artifact,
          age,
          threshold,
          action: 'rerun'
        });
      }
    }

    return staleArtifacts;
  }

  async handleStaleArtifacts(staleArtifacts) {
    for (const stale of staleArtifacts) {
      switch (stale.userAction) {
        case 'auto-rerun':
          await this.rerunWorkflow(stale.artifact);
          break;
        case 'prompt':
          await this.promptUser(stale);
          break;
        case 'archive':
          await this.archiveArtifact(stale.artifact);
          break;
      }
    }
  }
}
```

#### 6.3 Quality Gate Automation

**Action**: Automatic validation after each step

**Gates**:
```yaml
quality_gates:
  typescript:
    command: "pnpm tsc --noEmit"
    expect: "0 errors"
    on_fail: "block_proceed"
    auto_fix: false  # Requires human intervention

  tests:
    command: "pnpm vitest run"
    expect: "all passing"
    on_fail: "block_proceed"
    auto_fix: true  # Can attempt fix

  lint:
    command: "pnpm lint"
    expect: "no new issues"
    on_fail: "warn_proceed"  # Continue but log warning
```

---

### Phase 7: Documentation and Migration (Week 4)

#### 7.1 Update MANIFEST.yaml

**Action**: Reflect new module structure

```yaml
# _bmad-ext/MANIFEST.yaml
modules:
  governance:
    id: "governance"
    name: "Governance Module"
    version: "2.1.0"
    status: "active"
    phase: "0"
    tier: "foundation"
    entry_point: "/context-first"

  arc-v2:
    id: "arc-v2"
    name: "Architecture Remediation v2.0"
    version: "2.0.0"
    status: "active"
    phase: "0"
    tier: "remediation"
    entry_point: "/diagnostic-first"

  sprint-planning-wrapper:
    id: "sprint-planning-wrapper"
    name: "Sprint-Planning Wrapper"
    version: "1.0.0"
    status: "active"
    phase: "2"
    tier: "planning"
    entry_point: "/sprint-planning"

  implementation:
    id: "implementation"
    name: "Implementation Module"
    version: "1.0.0"
    status: "active"
    phase: "4"
    tier: "execution"
    entry_point: "/story-cycle"

  bmad-core:  # NEW
    id: "bmad-core"
    name: "BMAD Core Workflows"
    version: "1.0.0"
    status: "active"
    phase: "1"
    tier: "wrappers"
    entry_points:
      - "/brainstorm"
      - "/party-mode"
      - "/product-brief"
      - "/prd"
      - "/architecture"
      - "/epics"
```

#### 7.2 Create Migration Guide

**Action**: Document transition from old to new structure

**Content**:
```markdown
# BMAD-EXT Migration Guide

## What Changed

### Deprecated Components
- `governance-core/` → Use `governance/` instead
- `platform/` → Moved to `.archive/deprecated/`
- Old frontmatter format → New schema

### New Components
- `bmad-core/` module → Wrappers for core workflows
- Standardized frontmatter → All components now have consistent metadata
- Decision tree → Clear routing rules in `DECISION-TREE.yaml`

### Breaking Changes
1. **Entry points changed**: Old commands may not work
2. **Frontmatter required**: All components must have new schema
3. **Version at bottom**: Date/version moved to bottom of files

## Migration Steps

1. Archive old components
2. Update frontmatter on all active files
3. Test entry points
4. Verify integration points
5. Run full governance check
```

---

## Implementation Timeline

### Week 1: Foundation
- [x] Phase 1.1: Archive deprecated modules
- [x] Phase 1.2: Consolidate duplicate components
- [ ] Phase 1.3: Create directory standards
- [ ] Phase 2.1: Apply schema (Batch 1-2)
- [ ] Phase 2.2: Move version/date to bottom

### Week 2: Core Features
- [ ] Phase 2.1: Apply schema (Batch 3-4)
- [ ] Phase 3.1: Create bmad-core module
- [ ] Phase 3.2: Create workflow step files
- [ ] Phase 3.3: Test integration
- [ ] Phase 4.1: Define clear responsibilities

### Week 3: Automation
- [ ] Phase 4.2: Remove overlapping functionality
- [ ] Phase 4.3: Create decision tree
- [ ] Phase 5.1: Frontmatter-only loading
- [ ] Phase 5.2: TTL-based caching
- [ ] Phase 5.3: Stale detection enforcement

### Week 4: Completion
- [ ] Phase 6.1: Restore self-governance
- [ ] Phase 6.2: Implement auto-rerun logic
- [ ] Phase 6.3: Quality gate automation
- [ ] Phase 7.1: Update MANIFEST.yaml
- [ ] Phase 7.2: Create migration guide
- [ ] Final validation and testing

---

## Risk Mitigation

### Risk 1: Breaking Changes During Migration

**Mitigation**:
- Keep old versions in `.archive/old-structure/`
- Create compatibility layer if needed
- Test in isolated branch first
- Rollback plan ready

### Risk 2: Context Loading Overhead

**Mitigation**:
- Implement aggressive caching for frontmatter
- Use incremental loading for workflows
- Monitor context usage metrics
- Optimize hop-reading patterns

### Risk 3: Lost Functionality

**Mitigation**:
- Comprehensive feature audit before migration
- Maintain feature parity list
- Test all entry points
- Document any intentional deprecations

### Risk 4: Team A/B Coordination

**Mitigation**:
- Clear ownership matrix in AGENTS.md
- Explicit handoff protocols
- Separate LOOP_STATE files if needed
- Regular sync points

---

## Success Criteria

### Phase Completion Criteria

**Phase 1 Complete**:
- [x] Deprecated modules archived
- [x] Directory structure standardized
- [x] No duplicate components

**Phase 2 Complete**:
- [x] All components have standardized frontmatter
- [x] Version/date at bottom of all files
- [x] Frontmatter validation passing

**Phase 3 Complete**:
- [x] bmad-core module created
- [x] All missing workflows have wrappers
- [x] Integration tests passing

**Phase 4 Complete**:
- [x] Responsibility matrix clear
- [x] No overlapping functionality
- [x] Decision tree created

**Phase 5 Complete**:
- [x] Frontmatter-only loading working
- [x] TTL-based caching implemented
- [x] Stale detection active

**Phase 6 Complete**:
- [x] Self-governance restored
- [x] Auto-rerun logic working
- [x] Quality gates automated

**Phase 7 Complete**:
- [x] MANIFEST.yaml updated
- [x] Migration guide created
- [x] Full system validated

### Overall Success

**System Health Indicators**:
- [ ] No duplicate responsibilities
- [ ] Clear entry points for all components
- [ ] Context usage reduced by 50%
- [ ] Stale detection working (<1% false positives)
- [ ] Self-governance functioning (0% human intervention)
- [ ] All BMAD core workflows accessible
- [ ] Integration tests passing (>95%)

---

## Related Documents

- Hierarchy Classification Map: `_bmad-output/planning-artifacts/bmad-ext-hierarchy-classification-2026-01-15.md`
- Frontmatter Schema: `_bmad-output/planning-artifacts/bmad-ext-frontmatter-schema-2026-01-15.md`
- Decision Tree: `_bmad-ext/DECISION-TREE.yaml` (to be created)
- MANIFEST.yaml: `_bmad-ext/MANIFEST.yaml` (to be updated)

---

**Plan Version**: 1.0.0
**Created**: 2026-01-15
**Status**: READY FOR IMPLEMENTATION
**Next Steps**: Begin Phase 1.1 (Archive deprecated modules)