# Project-Wide Governance Enforcement Protocol

**Protocol ID**: GOV-ENFORCE-001
**Version**: 1.0.0
**Created**: 2026-01-06
**Purpose**: Define how governance is enforced across all agents, modules, workflows
**Scope**: Entire BMAD framework

---

## ═══════════════════════════════════════════════════════════════════════════════
## ENFORCEMENT ARCHITECTURE
## ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BMAD GOVERNANCE FRAMEWORK                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              CONSTITUTION (Supreme Authority)                    │ │
│  │              _bmad/modules/governance/CONSTITUTION.md            │ │
│  └────────────────────────┬─────────────────────────────────────────┘ │
│                           │                                            │
│         ┌─────────────────┼─────────────────┐                        │
│         │                 │                 │                        │
│         ▼                 ▼                 ▼                        │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                    │
│  │   HOOKS    │   │    LOOP    │   │  AGENTS    │                    │
│  │            │   │            │   │            │                    │
│  │ Pre-Exec   │   │ Ralph Loop │   │ Compliance │                    │
│  │ Stop       │   │ State      │   │ Checks     │                    │
│  └──────┬─────┘   └─────┬──────┘   └──────┬─────┘                    │
│         │                │                │                          │
│         └────────────────┼────────────────┘                          │
│                          │                                           │
│                          ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                 VALIDATION & ENFORCEMENT                         │ │
│  │                                                                  │ │
│  │  • Artifact freshness check         • Naming convention         │ │
│  │  • Frontmatter completeness          • Multi-team conflict       │ │
│  │  • Sequence integrity               • Context recovery          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## AGENT COMPLIANCE REQUIREMENTS
## ═══════════════════════════════════════════════════════════════════════════════

### Mandatory Acknowledgment Section

Every agent file MUST include:

```yaml
## ═══════════════════════════════════════════════════════════════════════════════
## GOVERNANCE ACKNOWLEDGMENT (REQUIRED)
## ═══════════════════════════════════════════════════════════════════════════════

governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "YYYY-MM-DD"
  acknowledged_by: "{agent-name}"

  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true
```

### Agents Requiring Updates

| Category | Agent Path | Priority |
|----------|------------|----------|
| **Core** | `_bmad/core/agents/bmad-master.md` | ✅ DONE |
| **BMM** | `_bmad/bmm/agents/*.md` | P0 |
| **CIS** | `_bmad/cis/agents/*.md` | P1 |
| **Architecture Remediation** | `_bmad/modules/architecture-remediation/agents/*.md` | P0 |
| **Governance** | `_bmad/modules/governance/agents/*.md` | P0 |

### Agent Compliance Checklist

Before execution, every agent MUST:

- [ ] Read Ralph Loop state for current cycle context
- [ ] Validate any input artifacts for freshness (<24h)
- [ ] Verify naming convention of artifacts being created
- [ ] Include complete frontmatter on all created artifacts
- [ ] Check for multi-team conflicts if working on epics
- [ ] Never modify module templates directly

After execution, every agent MUST:

- [ ] Update Ralph Loop state (if cycle lead agent)
- [ ] Create completion artifact with proper frontmatter
- [ ] Log any errors to `errors_encountered`
- [ ] Notify governance module of violations

---

## ═══════════════════════════════════════════════════════════════════════════════
## WORKFLOW COMPLIANCE REQUIREMENTS
## ═══════════════════════════════════════════════════════════════════════════════

### Workflow Frontmatter

Every workflow file MUST include:

```yaml
---
workflow_id: "{prefix}-{domain}-{seq}"
workflow_type: "cycle" | "workflow" | "protocol"
governance_version: "1.0.0"
created_at: "YYYY-MM-DDTHH:mm:ssZ"
expires_at: "YYYY-MM-DDTHH:mm:ssZ"
status: "DRAFT" | "ACTIVE" | "SUPERSEDED"
team: "Team-A" | "Team-B"
parent_id: "{epic-id or governance-id}"
related_artifacts: ["prev-workflow-id", "next-workflow-id"]
---
```

### Workflow Validation Gates

Every workflow MUST include validation gates:

```yaml
validation_gates:
  - name: "artifact_freshness_check"
    description: "Verify all input artifacts <24h old"
    on_failure: "stop_and_recover_context"

  - name: "naming_convention_check"
    description: "Verify output artifacts follow {prefix}-{domain}-{seq}"
    on_failure: "fix_before_proceed"

  - name: "frontmatter_completeness"
    description: "Verify all required frontmatter fields present"
    on_failure: "add_missing_fields"

  - name: "multi_team_conflict_check"
    description: "Verify no conflict with other team's active epic"
    on_failure: "coordinate_or_stop"
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## MODULE COMPLIANCE REQUIREMENTS
## ═══════════════════════════════════════════════════════════════════════════════

### Module MANIFEST.yaml

Every module MUST have a MANIFEST.yaml with:

```yaml
---
version: "X.Y.Z"
module_id: "{module-name}"
name: "{Module Display Name}"
created: "YYYY-MM-DD"
status: "ACTIVE" | "ARCHIVED"

governance:
  constitution_version: "1.0.0"
  acknowledged_at: "YYYY-MM-DD"
  compliance_level: "full" | "partial" | "pending"

domains:
  {domain_name}:
    description: "{domain description}"
    triggers: ["trigger1", "trigger2"]
    agent: "{agent-id}"

workflows:
  - id: "{workflow-id}"
    path: "workflows/{workflow-file}.md"
    governance_compliant: true

agents:
  - id: "{agent-id}"
    path: "agents/{agent-file}.md"
    governance_compliant: true
---
```

### Read-Only Template Rule

**CRITICAL**: Modules are READ-ONLY templates. Agents MUST NOT modify module files directly.

**Correct Pattern**:
```yaml
# Agent needs to update workflow
action: "use_governance_module"
workflow: "governance/workflow-update"
target: "{module}/{workflow-file}"
reason: "Modules are read-only templates, use governance for updates"
```

**Incorrect Pattern**:
```yaml
# DO NOT DO THIS
action: "direct_edit"
target: "{module}/{workflow-file}"
reason: "This violates read-only template rule"
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## ENFORCEMENT TRIGGERS
## ═══════════════════════════════════════════════════════════════════════════════

### Trigger Points

| Trigger | Location | Action |
|---------|----------|--------|
| **Pre-Execution** | `.claude/hooks/pre-execution.sh` | Validate artifact freshness |
| **Stop Hook** | `.claude/hooks/ralph-loop.sh` | Update iteration, check stale |
| **Agent Load** | Agent file header | Verify governance acknowledgment |
| **Workflow Start** | Workflow header | Validate input artifacts |
| **Artifact Create** | Throughout | Enforce naming convention |
| **Cycle Complete** | BMAD Master | Update Ralph Loop state |

### Enforcement Levels

```yaml
enforcement_levels:
  P0_critical:
    description: "BLOCKS execution until resolved"
    triggers:
      - "stale_artifact_detected"
      - "missing_frontmatter"
      - "naming_convention_violation"
    action: "hard_stop"

  P1_warning:
    description: "Log warning, allow execution with notice"
    triggers:
      - "missing_governance_acknowledgment"
      - "template_modification_attempt"
      - "incomplete_frontmatter"
    action: "log_and_continue"

  P2_advisory:
    description: "Track for governance review"
    triggers:
      - "near_expiration"
      - "multi_team_potential_conflict"
    action: "log_for_review"
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## COMPLIANCE AUDIT PROTOCOL
## ═══════════════════════════════════════════════════════════════════════════════

### Automated Audit Checks

**Run Daily**: Automated audit of all artifacts

```bash
#!/bin/bash
# Governance Audit Script
# Runs daily to check compliance

echo "════════════════════════════════════════════════════════════"
echo "🔍 GOVERNANCE COMPLIANCE AUDIT"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. Check for missing frontmatter
echo "1. Checking for missing frontmatter..."
missing=$(grep -L "^---" _bmad-output/handoffs/**/*.md 2>/dev/null || true)
if [[ -n "$missing" ]]; then
    echo "   ❌ Files missing frontmatter:"
    echo "$missing" | sed 's/^/     /'
else
    echo "   ✅ All artifacts have frontmatter"
fi

# 2. Check naming convention
echo ""
echo "2. Checking naming convention..."
invalid=$(find _bmad-output/handoffs -name "*.md" | grep -vE "[A-Z]+-[A-Z]+-[0-9]+|^[A-Z][0-9]+-" | head -5)
if [[ -n "$invalid" ]]; then
    echo "   ❌ Files not following naming convention:"
    echo "$invalid" | sed 's/^/     /'
else
    echo "   ✅ All artifacts follow naming convention"
fi

# 3. Check for stale artifacts
echo ""
echo "3. Checking for stale artifacts (>24h)..."
stale=$(find _bmad-output/handoffs -name "*.md" -mtime +1)
if [[ -n "$stale" ]]; then
    echo "   ⚠️  Stale artifacts found:"
    echo "$stale" | sed 's/^/     /'
    echo "   → Should trigger context recovery on next access"
else
    echo "   ✅ No stale artifacts"
fi

# 4. Check agent compliance
echo ""
echo "4. Checking agent governance acknowledgment..."
agents_without=$(grep -L "governance:" _bmad/**/agents/*.md 2>/dev/null | head -5)
if [[ -n "$agents_without" ]]; then
    echo "   ❌ Agents missing governance acknowledgment:"
    echo "$agents_without" | sed 's/^/     /'
else
    echo "   ✅ All agents have governance acknowledgment"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Audit complete. Results logged to governance audit log."
echo "════════════════════════════════════════════════════════════"
```

### Audit Report Template

```markdown
# Governance Compliance Audit Report

**Date**: YYYY-MM-DD
**Audit ID**: GOV-AUDIT-{seq}
**Auditor**: Governance Module

## Summary

| Category | Status | Issues Found | Issues Resolved |
|----------|--------|--------------|-----------------|
| Frontmatter Compliance | ✅/❌ | N | N |
| Naming Convention | ✅/❌ | N | N |
| Stale Artifacts | ✅/❌ | N | N |
| Agent Acknowledgment | ✅/❌ | N | N |
| Multi-Team Conflicts | ✅/❌ | N | N |

## Issues Requiring Attention

### P0 - Critical
1. {Issue description}
   - File: {file_path}
   - Action Required: {action}

### P1 - Warning
1. {Issue description}
   - File: {file_path}
   - Action Recommended: {action}

## Recommendations

1. {Recommendation for improvement}
2. {Recommendation for improvement}

---
**Report Generated**: YYYY-MM-DDTHH:mm:ssZ
**Next Audit**: YYYY-MM-DD
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## ROLLOUT PLAN
## ═══════════════════════════════════════════════════════════════════════════════

### Phase 1: Foundation (COMPLETE ✅)

- [x] Create governance module structure
- [x] Define CONSTITUTION.md
- [x] Create stale-artifact-validation workflow (v2.0)
- [x] Update Ralph Loop state file
- [x] Create ralph-loop.sh hook
- [x] Design pre-execution hook specification

### Phase 2: Agent Acknowledgment (IN PROGRESS)

- [x] Update bmad-master.md with governance acknowledgment
- [ ] Update BMM agents with governance acknowledgment
- [ ] Update Architecture Remediation agents
- [ ] Update CIS agents
- [ ] Update remaining module agents

### Phase 3: Workflow Compliance

- [ ] Add frontmatter to all workflow files
- [ ] Add validation gates to all workflows
- [ ] Update workflow templates with governance section
- [ ] Enforce naming convention on workflow outputs

### Phase 4: Hook Deployment

- [ ] Deploy .claude/hooks/pre-execution.sh
- [ ] Deploy .opencode/hooks/pre-execution.sh
- [ ] Set executable permissions on all hooks
- [ ] Test hook execution with stale artifacts
- [ ] Verify multi-team conflict detection

### Phase 5: Audit & Monitor

- [ ] Set up daily audit cron job
- [ ] Create audit report template
- [ ] Establish audit log retention
- [ ] Configure alert thresholds

---

## ═══════════════════════════════════════════════════════════════════════════════
## SUCCESS METRICS
## ═══════════════════════════════════════════════════════════════════════════════

### Governance Health Score

| Metric | Target | Current |
|--------|--------|---------|
| Agents with acknowledgment | 100% | TBD |
| Workflows with validation gates | 100% | TBD |
| Artifacts following naming convention | 100% | TBD |
| Artifacts with complete frontmatter | 100% | TBD |
| Stale artifacts ( >24h ) | 0 | TBD |
| Multi-team conflicts resolved | 100% | TBD |

### Monthly Governance Report

At the end of each month, generate:

1. **Compliance Score**: Percentage of compliant entities
2. **Violations Log**: All P0/P1 violations with resolution
3. **Improvement Plan**: Areas needing attention
4. **Constitution Amendments**: Any changes proposed

---

## ═══════════════════════════════════════════════════════════════════════════════
## EMERGENCY PROTOCOLS
## ═══════════════════════════════════════════════════════════════════════════════

### Governance Violation Escalation

```yaml
escalation_levels:
  P0_violation:
    triggers: ["stale_artifact_in_use", "missing_frontmatter", "naming_violation"]
    action: "immediate_stop"
    notification: "user + governance_module"
    resolution_required: "before_continue"

  P1_violation:
    triggers: ["missing_acknowledgment", "template_modification"]
    action: "log_warning"
    notification: "governance_module"
    resolution_required: "within_24_hours"

  P2_violation:
    triggers: ["near_expiration", "potential_conflict"]
    action: "log_advisory"
    notification: "governance_module_log_only"
    resolution_required: "next_audit"
```

### Rollback Procedure

If governance update causes issues:

1. **Identify**: Pinpoint the breaking change
2. **Revert**: Restore previous version from git history
3. **Notify**: Report to governance module
4. **Fix**: Create corrected version
5. **Test**: Validate in isolation before re-deploy

---

**Protocol Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: ACTIVE - ROLLOUT IN PROGRESS
**Next Review**: 2026-01-13 (7 days)
