# BMAD Extension Module Hierarchy & Cross-Reference Map

**Created**: 2026-01-11
**Version**: 1.0.0
**Purpose**: Unified view of all `_bmad-ext/modules/` with hierarchy, phases, and cross-references

---

## Module Hierarchy (by Phase)

```
PHASE 0: GOVERNANCE FOUNDATION
├── governance/                          ← Unified governance (v2.0)
│   ├── policies/artifact-lifecycle.md
│   ├── policies/context-strategy.md
│   ├── scanners/artifact-scanner.md
│   └── workflows/context-first/
│
├── governance-core/                     ← DEPRECATED - Merge into governance/
│   ├── workflows/correct-course.yaml
│   ├── workflows/context-first.md
│   ├── workflows/expert-analysis.md
│   └── hooks/claude-code/
│
└── arc-v2/                              ← Architecture Remediation v2
    ├── agents/context-validator.md
    ├── agents/domain-scanner.md
    └── workflows/diagnostic-first.md

PHASE 2: SPRINT PLANNING
└── sprint-planning-wrapper/             ← Enhanced sprint planning
    ├── workflows/sprint-planning-enhanced/
    ├── scanners/cohesion-scanner.md
    ├── scanners/dependency-scanner.md
    └── scanners/nonsense-detector.md

PHASE 4: IMPLEMENTATION
└── implementation/                      ← Story execution
    ├── workflows/story-cycle/
    ├── workflows/correct-course/
    └── config/journey-validation-rules.yaml
```

---

## Module Cross-Reference Map

### Module: `governance/`

**Phase**: 0 (Governance Foundation)
**Status**: ACTIVE (v2.0)
**Purpose**: Unified self-governance, artifact lifecycle, context filtering

#### Integration Points

| Reads From | Path | Purpose |
|------------|------|---------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` | Session state, anchor |
| ARTIFACT_REGISTRY | `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | Artifact tracking |
| Workflow Status | `bmm-workflow-status.yaml` | Story progress |

| Writes To | Path | Purpose |
|-----------|------|---------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` | Governance updates |
| AGENTS.md | Project root | Governance section |
| Archive | `_bmad-output/.archive/` | Stale artifacts |

| Invoked By | Trigger |
|------------|---------|
| master-orchestrator.md | On step completion |
| `.claude/hooks/` | Session start, user prompt |
| Enhanced agents | On artifact creation |

#### Referenced Files (MUST EXIST)

| File | Status | Action |
|------|--------|--------|
| `config/retention-policy.yaml` | ✅ EXISTS | No action |
| `config/domains.yaml` | ❌ MISSING | Create |
| `policies/artifact-lifecycle.md` | ✅ EXISTS | No action |
| `policies/context-strategy.md` | ❌ MISSING | Create |
| `scanners/artifact-scanner.md` | ✅ EXISTS | No action |
| `scanners/context-scanner.md` | ❌ MISSING | Create |
| `workflows/context-first/workflow.md` | ✅ EXISTS | No action |
| `workflows/expert-analysis/workflow.md` | ✅ EXISTS | No action |
| `workflows/research-trigger/workflow.md` | ✅ EXISTS | No action |

#### Hop-Reading Pattern

```yaml
# Step 1: Load frontmatter only
Load: "_bmad-ext/modules/governance/MODULE.md"
Extract:
  - phase
  - status
  - integration_points

# Step 2: On demand, load full content
If: "need_detailed_info"
Load: "_bmad-ext/modules/governance/workflows/context-first/workflow.md"
```

---

### Module: `governance-core/`

**Phase**: 0 (Governance Foundation)
**Status**: DEPRECATED (merge into governance/)
**Purpose**: Duplicate of governance - to be archived

#### Issues

1. Duplicates governance module structure
2. Hooks in `hooks/claude-code/` have YAML format issues
3. References files that don't exist:
   - `config/artifact-manager.yaml`
   - `config/context-poisoning.yaml`
   - `config/error-categories.yaml`
   - `policies/remediation-categories.md`
   - `state/stage-progress.yaml`

#### Recommended Action

Archive entire module, move useful hooks to:
- `.claude/hooks/session-start.yaml`
- `.claude/hooks/user-prompt-submit.yaml`

---

### Module: `arc-v2/`

**Phase**: 0 (Governance Foundation - Special)
**Status**: ACTIVE
**Purpose**: Architecture Remediation v2 - Diagnostic-first approach

#### Integration Points

| Reads From | Path | Purpose |
|------------|------|---------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` | Track remediation |
| ARTIFACT_REGISTRY | `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | Register scans |
| Routing Rules | `_bmad-ext/orchestrator/routing-rules.yaml` | Route stories |

| Writes To | Path | Purpose |
|-----------|------|---------|
| Scan Results | `_bmad-output/scans/{domain}-scan-{date}.yaml` | Evidence |
| Remediation Plans | `_bmad-output/remediations/` | Plans |
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` | Progress |

#### Referenced Files (MUST EXIST)

| File | Status | Action |
|------|--------|--------|
| `MODULE.md` | ✅ EXISTS | No action |
| `agents/context-validator.md` | ✅ EXISTS | No action |
| `agents/domain-scanner.md` | ✅ EXISTS | No action |
| `agents/journey-mapper.md` | ❌ MISSING | Create or remove reference |
| `agents/remediation-executor.md` | ❌ MISSING | Create or remove reference |
| `workflows/diagnostic-first.md` | ✅ EXISTS | No action |
| `workflows/domain-remediation.md` | ❌ MISSING | Create or remove reference |
| `workflows/journey-repair.md` | ❌ MISSING | Create or remove reference |
| `scanners/persistence-scan.md` | ❌ MISSING | Create or remove reference |
| `scanners/sync-scan.md` | ❌ MISSING | Create or remove reference |
| `scanners/state-scan.md` | ❌ MISSING | Create or remove reference |
| `scanners/routing-scan.md` | ❌ MISSING | Create or remove reference |
| `scanners/agents-scan.md` | ❌ MISSING | Create or remove reference |
| `scanners/ux-scan.md` | ❌ MISSING | Create or remove reference |
| `config/domains.yaml` | ❌ MISSING | Create or remove reference |
| `config/thresholds.yaml` | ❌ MISSING | Create or remove reference |
| `config/platform-strategies.yaml` | ❌ MISSING | Create or remove reference |

#### Hop-Reading Pattern

```yaml
# Step 1: Load frontmatter
Load: "_bmad-ext/modules/arc-v2/MODULE.md"
Extract:
  - 6-domain model
  - key principles
  - integration_points

# Step 2: Load agent frontmatter (on need)
Load: "_bmad-ext/modules/arc-v2/agents/domain-scanner.md"
Extract:
  - domains covered
  - scan protocol

# Step 3: Load workflow (on execution)
Load: "_bmad-ext/modules/arc-v2/workflows/diagnostic-first.md"
Execute: 7-step workflow
```

---

### Module: `sprint-planning-wrapper/`

**Phase**: 2 (Sprint Planning)
**Status**: ACTIVE
**Purpose**: Enhanced sprint planning with cohesion and reality validation

#### Integration Points

| Reads From | Path | Purpose |
|------------|------|---------|
| BMAD Sprint Planning | `_bmad/bmm/workflows/4-implementation/sprint-planning/` | Original workflow |
| Epics | `_bmad-output/planning-artifacts/epics.md` | Epic definitions |
| Story Files | `_bmad-output/sprint-artifacts/stories/` | Story details |

| Writes To | Path | Purpose |
|-----------|------|---------|
| Sprint Status | `sprint-status.yaml` | Enhanced status |
| Cohesion Report | `_bmad-output/sprint-artifacts/cohesion-report-{date}.md` | Analysis |
| Dependency Map | `_bmad-output/sprint-artifacts/dependency-map.yaml` | Graph |

| Hands Off To | Path |
|--------------|------|
| Story-Cycle | `_bmad-ext/modules/implementation/workflows/story-cycle/` |

#### Referenced Files (MUST EXIST)

| File | Status | Action |
|------|--------|--------|
| `MODULE.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/workflow.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-01-discover-epics.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-02-generate-status.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-03-cohesion-check.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-04-dependency-map.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-05-reality-validation.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-06-gatekeeping.md` | ✅ EXISTS | No action |
| `workflows/sprint-planning-enhanced/steps/step-07-handoff.md` | ✅ EXISTS | No action |
| `scanners/cohesion-scanner.md` | ✅ EXISTS | No action |
| `scanners/dependency-scanner.md` | ✅ EXISTS | No action |
| `scanners/nonsense-detector.md` | ✅ EXISTS | No action |
| `config/gating-rules.yaml` | ✅ EXISTS | No action |
| `config/cohesion-patterns.yaml` | ✅ EXISTS | No action |

#### Hop-Reading Pattern

```yaml
# Step 1: Load frontmatter
Load: "_bmad-ext/modules/sprint-planning-wrapper/MODULE.md"
Extract:
  - wrapper architecture
  - 7-step process
  - scanners

# Step 2: Load step files sequentially
Load: "_bmad-ext/modules/sprint-planning-wrapper/workflows/sprint-planning-enhanced/steps/step-01-discover-epics.md"
Execute: Discover epics

# Step 3: Continue to next steps
Load: step-02-generate-status.md
Execute: Generate status

# ... continue through all 7 steps
```

---

### Module: `implementation/`

**Phase**: 4 (Implementation)
**Status**: ACTIVE
**Purpose**: Story execution and bug fix workflows

#### Integration Points

| Reads From | Path | Purpose |
|------------|------|---------|
| Sprint Status | `sprint-status.yaml` | Story assignment |
| Governance Report | `_bmad-output/governance/` | Issue level |
| Story Files | `_bmad-output/sprint-artifacts/stories/` | Context |

| Writes To | Path | Purpose |
|-----------|------|---------|
| Sprint Status | `sprint-status.yaml` | Update progress |
| Story Completion | `_bmad-output/sprint-artifacts/stories/{story_id}-done.md` | Summary |

| Receives From | Path |
|---------------|------|
| Sprint-Planning Wrapper | Handoff artifact |
| Governance | Governance report |

#### Referenced Files (MUST EXIST)

| File | Status | Action |
|------|--------|--------|
| `MODULE.md` | ✅ EXISTS | No action |
| `workflows/story-cycle/workflow.md` | ✅ EXISTS | No action |
| `workflows/story-cycle/steps/step-01-init.md` | ✅ EXISTS | No action |
| `workflows/story-cycle/steps/step-02-validate.md` | ✅ EXISTS | No action |
| `workflows/story-cycle/steps/step-03-implement.md` | ✅ EXISTS | No action |
| `workflows/story-cycle/steps/step-04-test.md` | ✅ EXISTS | No action |
| `workflows/story-cycle/steps/step-05-review.md` | ❌ MISSING | Create |
| `workflows/story-cycle/steps/step-06a-reality-check.md` | ❌ MISSING | Create |
| `workflows/story-cycle/steps/step-06-done.md` | ❌ MISSING | Create |
| `workflows/story-cycle/steps/step-07-retrospective.md` | ✅ EXISTS | No action |
| `workflows/correct-course/workflow.md` | ✅ EXISTS | No action |
| `workflows/correct-course/steps/step-01-receive-report.md` | ✅ EXISTS | No action |
| `workflows/correct-course/steps/step-02-categorize.md` | ✅ EXISTS | No action |
| `workflows/correct-course/steps/step-03-route.md` | ✅ EXISTS | No action |
| `workflows/correct-course/steps/step-04-complete.md` | ✅ EXISTS | No action |
| `config/agent-tool-spec-template.yaml` | ✅ EXISTS | No action |
| `config/journey-validation-rules.yaml` | ✅ EXISTS | No action |
| `templates/enhanced-story-template.md` | ✅ EXISTS | No action |

#### Hop-Reading Pattern

```yaml
# Step 1: Load frontmatter
Load: "_bmad-ext/modules/implementation/MODULE.md"
Extract:
  - phase position
  - routing rules
  - handoff protocol

# Step 2: Load workflow based on issue level
If: "governance.issue_level == 'new_feature'"
  Load: "workflows/story-cycle/workflow.md"
Else:
  Load: "workflows/correct-course/workflow.md"

# Step 3: Execute steps sequentially
Load: "steps/step-01-init.md"
Execute: Initialize

Load: "steps/step-02-validate.md"
Execute: Validate

# ... continue
```

---

## Workflow Call Chains

### Path 1: New Feature Development

```
User Request
    ↓
governance/ (Phase 0)
    ├─ context-first
    ├─ expert-analysis  
    └─ research-trigger
    ↓
[ALLOW] → Governance Report
    ↓
sprint-planning-wrapper/ (Phase 2)
    └─ 7-step enhanced sprint planning
    ↓
Sprint Status Updated
    ↓
implementation/ (Phase 4)
    └─ story-cycle workflow
    ↓
Story Complete → Handoff to orchestrator
```

### Path 2: Bug Fix / Remediation

```
Bug Report / User Request
    ↓
governance/ (Phase 0)
    └─ correct-course
    ↓
[ALLOW] → Issue Level Categorized
    ├─ Quick Patch
    ├─ Feature Fix
    └─ Architectural Conflict
    ↓
implementation/ (Phase 4)
    └─ correct-course workflow
    ↓
Fix Complete → Handoff
```

### Path 3: Architecture Remediation

```
Architecture Issue Detected
    ↓
arc-v2/ (Phase 0 - Special)
    └─ diagnostic-first workflow
    ├─ context-validator
    ├─ domain-scanner
    └─ remediation plan
    ↓
implementation/ (Phase 4)
    └─ architectural-conflict sub-workflow
    ↓
Refactoring Complete
```

---

## Missing Files Summary

| Module | Missing File | Priority | Action |
|--------|--------------|----------|--------|
| governance/ | `config/domains.yaml` | HIGH | Create |
| governance/ | `policies/context-strategy.md` | HIGH | Create |
| governance/ | `policies/gating-policy.md` | MEDIUM | Create |
| governance/ | `scanners/context-scanner.md` | HIGH | Create |
| governance/ | `workflows/self-governance-cycle.md` | HIGH | Create or consolidate |
| governance/ | `workflows/stale-detection.md` | HIGH | Create or consolidate |
| arc-v2/ | `agents/journey-mapper.md` | MEDIUM | Create or remove ref |
| arc-v2/ | `agents/remediation-executor.md` | MEDIUM | Create or remove ref |
| arc-v2/ | `scanners/persistence-scan.md` | LOW | Create or remove ref |
| arc-v2/ | `scanners/sync-scan.md` | LOW | Create or remove ref |
| arc-v2/ | `scanners/state-scan.md` | LOW | Create or remove ref |
| arc-v2/ | `scanners/routing-scan.md` | LOW | Create or remove ref |
| arc-v2/ | `scanners/agents-scan.md` | LOW | Create or remove ref |
| arc-v2/ | `scanners/ux-scan.md` | LOW | Create or remove ref |
| implementation/ | `workflows/story-cycle/steps/step-05-review.md` | HIGH | Create |
| implementation/ | `workflows/story-cycle/steps/step-06a-reality-check.md` | HIGH | Create |
| implementation/ | `workflows/story-cycle/steps/step-06-done.md` | HIGH | Create |

---

## Phase Dependency Matrix

| Phase | Module | Depends On | Required By |
|-------|--------|------------|-------------|
| 0 | governance/ | None | All subsequent phases |
| 0 | arc-v2/ | governance/ | implementation/ (architectural) |
| 2 | sprint-planning-wrapper/ | governance/ | implementation/ |
| 4 | implementation/ | governance/ + sprint-planning/ | None (final) |

---

## Next Actions

1. **Consolidate governance modules** - Archive `governance-core/`, keep `governance/`
2. **Create missing governance files** - `domains.yaml`, `context-strategy.md`, etc.
3. **Fix arc-v2 references** - Either create missing files or remove references
4. **Create missing story-cycle steps** - `step-05-review.md`, `step-06a-reality-check.md`, `step-06-done.md`
5. **Verify hop-reading patterns** - Ensure all workflows use frontmatter-first approach

---

**Document Version**: 1.0.0
**Created**: 2026-01-11
**Next Review**: After missing files are created
