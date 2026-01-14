# Sprint & Feature Execution Module

**Module ID**: MOD-C-SPRINT
**Governance Tier**: Tier 2 (Controlled & Iterative)
**TTL**: Permanent
**Last Updated**: 2026-01-06
**Status**: Active

---

## description

The Sprint & Feature Execution module manages all sprint planning, story development cycles, and product manager rigor. It enhances the original BMM (Builder) module with spec-driven development and systematic issue resolution.

### Key Responsibilities

1. **Sprint Planning**: Epic breakdown, story estimation, capacity planning
2. **Story Development**: Full story lifecycle from creation to completion
3. **Product Manager Rigor**: User journey assessments, multi-viewpoint validation
4. **Spec-Driven Development**: Technical specs from product requirements
5. **Health Monitoring**: Sprint health metrics, velocity tracking
6. **Systematic Issue Resolution**: Conditional routing, loop prevention

---

## Agents

### 1. Product Manager (Rigorous)
**File**: `agents/product-manager-rigorous.md`
**Role**: Enforce product management rigor with deep assessment

**Assessment Phases**:
1. **User Journey Analysis**:
   - Map starting point to first interaction
   - Identify user expectations at each node
   - Document edge cases for each step
   - Assess error scenarios (first 4 steps critical)

2. **Functional Requirements**:
   - What must the system DO?
   - Success criteria for each feature
   - Acceptance criteria with measurable outcomes

3. **Non-Functional Requirements**:
   - Performance targets (load time, response time)
   - Accessibility standards (WCAG 2.1 AA)
   - Mobile responsiveness (touch targets ≥44px)
   - i18n compliance (all strings via `t()`)

4. **Multi-Viewpoint Validation**:
   - Product Manager: User value, business impact
   - Architect: System design, scalability
   - Developer: Implementation feasibility
   - QA: Testability, edge cases

**Health Metric Enforcement**:
- **Critical Bugs**: 50% reduction in product health if first 4 steps have throwing errors
- **Assessment Depth**: Superficial assessments = FAILED, systematic assessments = APPROVED

### 2. BMM Agents (Enhanced)
**Original BMM Module** (8 agents retained and enhanced):

| Agent | Role | Enhancement |
|-------|------|-------------|
| `bmm-analyst.md` | Requirements analysis | Spec-driven workflows |
| `bmm-architect.md` | System design | Multi-viewpoint validation |
| `bmm-dev.md` | Feature implementation | Health metric awareness |
| `bmm-pm.md` | Backlog management | Rigorous assessment enforcement |
| `bmm-sm.md` | Story creation | Sprint health tracking |
| `bmm-tea.md` | Test strategy | Real-world testing integration |
| `bmm-tech-writer.md` | Documentation | Spec document generation |
| `bmm-ux-designer.md` | UI/UX design | Accessibility-first approach |

---

## Workflows

### 1. Spec-Driven Development
**File**: `workflows/spec-driven-development.md`

**Workflow**:
1. **Product Requirements** (PRD):
   - User stories with acceptance criteria
   - Business value and impact assessment
   - Success metrics definition

2. **User Journey Assessment**:
   - Walk through first 4 steps systematically
   - Document all edge cases and error scenarios
   - Identify user expectations at each interaction point

3. **Multi-Viewpoint Validation**:
   - Product Manager: Business value validation
   - Architect: Technical feasibility assessment
   - Developer: Implementation complexity analysis
   - QA: Testability and edge case coverage

4. **Technical Specification**:
   - Architecture decisions with ADRs
   - Data models and API contracts
   - Testing strategy with coverage targets
   - Deployment and rollback plans

5. **Implementation**:
   - Follow tech spec with systematic approach
   - Real-world testing with browser automation
   - Health metric validation before completion

**Quality Gates**:
- Superficial assessment = FAILED (require re-assessment)
- Critical bug in first 4 steps = 50% health penalty
- Missing edge case analysis = INCOMPLETE

### 2. Systematic Issue Resolution
**File**: `workflows/systematic-resolution.md`

**Conditional Routing Logic**:

**Issue: God Component Detected**
```yaml
conditions:
  - if: "feature is still in development"
    action: "DEFER - address after feature complete"
    reasoning: "Refactoring mid-development wastes effort"

  - if: "feature is stable and tested"
    action: "ROUTE to Module B (Architecture Refactoring)"
    reasoning: "Technical debt remediation appropriate now"
```

**Issue: TypeScript Errors**
```yaml
conditions:
  - if: "error_count < 10"
    action: "QUICK_FIX - address immediately"

  - if: "error_count >= 10"
    action: "DEEP_INVESTIGATION - root cause analysis needed"
    trigger: "types-scanner agent for comprehensive audit"
```

**Loop Prevention**:
```yaml
loop_detection:
  triggers:
    - "Same story attempted >3 times"
    - "No progress after 2 timebox extensions"
    - "Health score decreases >20%"

  actions:
    - "PAUSE sprint immediately"
    - "NOTIFY human with root cause analysis"
    - "REQUEST intervention: spec adjustment, scope reduction, or architectural decision"
```

### 3. Story Development Cycle
**File**: `workflows/story-dev-cycle.md`

**Cycle Phases**:
1. **Story**: Load story from backlog
2. **Context**: Generate story context artifact
3. **Validation**: Validate acceptance criteria
4. **Development**: Implement feature
5. **Code Review**: Quality gate validation
6. **Loop**: Address feedback iteratively
7. **Notes**: Document lessons learned
8. **Done**: Mark complete, update sprint status

**Handoff Protocol**:
- Use ASGL handoff template
- Include platform tags (.claude ↔ .opencode)
- Update AGENT-STATE.yaml
- Notify platform router for optimal routing

---

## Configuration Files

### 1. Health Metrics
**File**: `config/health-metrics.yaml`

**Metric Categories**:
```yaml
health_metrics:
  product_health:
    weight: 40%
    dimensions:
      - user_satisfaction: surveys, feedback
      - feature_completeness: acceptance criteria met
      - critical_bugs_first_4_steps: 50% penalty if present

  technical_health:
    weight: 30%
    dimensions:
      - typescript_errors: 0 in code files
      - test_coverage: ≥80% target
      - performance_targets: load time, response time

  process_health:
    weight: 20%
    dimensions:
      - sprint_velocity: stories completed per sprint
      - time_box_compliance: % stories within 30 min
      - assessment_depth: systematic vs superficial

  team_health:
    weight: 10%
    dimensions:
      - agent_performance: completion rate, quality
      - collaboration: cross-platform handoffs
      - learning: lessons documented, improvements made
```

**Thresholds**:
- **Excellent**: >90% (maintain standard time-boxes)
- **Good**: 70-90% (normal vigilance)
- **Degraded**: 50-70% (extend time-boxes by 20%)
- **Poor**: 30-50% (extend time-boxes by 50%, consider pausing)
- **Critical**: <30% (PAUSE all execution, health recovery mode)

### 2. Sprint Configuration
**File**: `config/sprint-config.yaml`

**Sprint Structure**:
```yaml
sprint_structure:
  duration: "2 weeks"  # 10 business days
  capacity:
    - "Complex stories: 3-4 per sprint"
    - "Medium stories: 6-8 per sprint"
    - "Simple stories: 10-12 per sprint"

  ceremonies:
    - sprint_planning: "Day 1, 2 hours"
    - daily_standup: "Automated via AGENT-STATE.yaml"
    - sprint_review: "Day 10, 1 hour"
    - retrospective: "Day 10, 1 hour"

  tracking:
    - sprint_status_claude_code.yaml: "Claude Code team"
    - sprint_status_opencode.yaml: "Open Code team"
    - integration_points: "Auto-detected via keywords"
```

---

## Integration Points

### Module Dependencies
**Consumes From**:
- Core Governance Module (time-boxing, state management, governance enforcement)
- Architecture Refactoring Module (technical debt remediation, quality scans)

**Provides To**:
- Integration Testing Module (stories ready for real-world testing)
- All modules (sprint status updates, health metrics)

### Platform Integration
**Dual-Team Tracking**:
- `.claude/sprint-status-claude-code.yaml` (Claude Code team)
- `.opencode/sprint-status-opencode.yaml` (Open Code team)

**Integration Point Self-Detection**:
```yaml
integration_triggers:
  keywords:
    - "cross-workspace"
    - "platform-agnostic"
    - "dual-platform"
    - ".claude AND .opencode"

  detection_workflow:
    1. "Scan artifact for integration keywords"
    2. "If found: ADD to integration_points:detected"
    3. "NOTIFY opposite team via shared notification artifact"
    4. "CREATE integration handoff document"
```

---

## Artifacts Created

### Sprint Planning
- `artifacts/sprint-plan-{sprint_id}.md`
- `artifacts/epic-breakdown-{epic_id}.md`
- `artifacts/story-estimates-{sprint_id}.md`

### Story Development
- `artifacts/stories-context/{story_id}-context.md`
- `artifacts/specs/{story_id}-tech-spec.md`
- `artifacts/validation/{story_id}-validation.md`

### Health & Reporting
- `artifacts/health-metrics-{sprint_id}.md`
- `artifacts/retrospective-{sprint_id}.md`
- `artifacts/velocity-report-{sprint_id}.md`

### Integration Artifacts
- `_bmad-output/shared-notifications/{timestamp}.md`
- `artifacts/integration-handoffs/{story_id}-handoff.md`

---

## Merged From

This module enhances and consolidates:

### 1. bmm/ (Builder) Module
**All 8 Original Agents**:
- Analyst, Architect, Dev, PM, SM, TEA, Tech-Writer, UX-Designer

**Enhancements Added**:
- Product manager rigor with systematic assessments
- Spec-driven development workflows
- Health metric awareness and enforcement
- Systematic issue resolution with conditional routing

### 2. asgl/ (Orchestrator) Module
**Capabilities Integrated**:
- Sprint planning workflows
- Story development cycle
- Sprint status tracking
- Loop coordination

---

## Quality Metrics

### Sprint Health
- **Target**: 70%+ overall health score
- **Measurement**: Weighted average of 4 health dimensions
- **Baseline**: Established from first 3 sprints

### Assessment Quality
- **Target**: 100% systematic assessments (0% superficial)
- **Measurement**: PM review of assessment depth
- **Penalty**: Superficial assessments marked as FAILED

### Time-Box Compliance
- **Target**: 80%+ stories completed within 30 minutes
- **Measurement**: Story duration tracking in AGENT-STATE.yaml
- **Escalation**: Auto-trigger deep-investigation on timeout

---

## Success Criteria

✅ **Completed**:
1. Module consolidation (bmm + asgl → sprint-execution)
2. Directory structure created
3. MANIFEST.md documentation

🔄 **In Progress**:
1. Product Manager (rigorous) agent creation
2. Spec-driven development workflow
3. Health metrics configuration
4. Systematic resolution workflow

⏳ **Pending**:
1. BMM agent enhancements (8 agents)
2. Sprint status file creation
3. Integration notification system
4. Retrospective workflow

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-06 | BMAD Framework Transformation - Enhanced with rigor |
| 1.x.x | 2025-12-XX | Original bmm (builder) module |
| 1.x.x | 2025-12-XX | Original asgl (orchestrator) module |

---

## Related Files

- **Governance**: `_bmad/modules/core-governance/` (time-boxing, state management)
- **Architecture**: `_bmad/modules/architecture-refactoring/` (remediation support)
- **Testing**: `_bmad/modules/integration-testing/` (real-world validation)
- **Transformation Plan**: `/Users/apple/.claude/plans/valiant-purring-tower.md`

---

**Module Status**: ✅ ACTIVE (enhanced)
**Next Review**: 2026-02-06 (30 days)
**Maintainer**: BMAD-Core-Master (orchestrates via product-manager-rigorous)
