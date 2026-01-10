# BMAD Framework Transformation Plan
**Autonomous Multi-Agentic System with Near 0% Human Interference**

**Session**: 2026-01-06
**Architect**: Morgan (Module Builder)
**Status**: PLAN MODE - FINAL PLAN

---

## Executive Summary

**Current State**: Well-documented governance but **minimally enforced**
- 7 active modules (not 23+ as mentioned)
- 60-70% platform integration between .claude and .opencode
- Scripts exist but not wired to execution flow
- No automated TTL enforcement, state synchronization, or cross-platform routing

**Target State**: Self-governing autonomous development system
- 4 consolidated strategic modules
- 100% platform integration with unified routing
- Time-boxed loops with deep-investigation triggers
- Real-world testing with production-grade spec-driven rigor

---

## Phase 1: Module Consolidation (4 Strategic Modules)

### Current Module Analysis
```
Existing (7 modules):
├── architecture-remediation  ← Keep & extend
├── asgl (orchestrator)        ← Transform into BMAD-Core-Master
├── governance                 ← Merge into Core Standards
├── quality (deep-scan)        ← Keep & extend
├── bmm (builder)              ← Keep & extend
├── cham (audit)               ← Merge into Quality
└── cross-workspace-chat        ← Deprecate (unused)
```

### Target Structure (4 Modules)

#### **Module A: Core Governance & Standards**
**Purpose**: Tier 1 & 2 management, enforcement, platform routing
**Components**:
- Constitution enforcement (READ-ONLY validation)
- AGENTS.md as single source of truth
- Platform router service (.claude ↔ .opencode)
- Unified AGENT-STATE.yaml management
- Cross-platform handoff protocol

**Artifacts to Create**:
- `_bmad/modules/core-governance/agents/platform-router.md`
- `_bmad/modules/core-governance/workflows/unified-state-management.md`
- `_bmad/modules/core-governance/config/platform-matrix.yaml`

**Merged From**: `governance/` + `asgl/` (orchestration only)

---

#### **Module B: Architecture & Refactoring**
**Purpose**: Deep scan, remediation, normalization, god store elimination
**Components**:
- All quality scanners (state, architecture, UX, security, performance)
- Store refactoring workflows
- Component splitting workflows
- TypeScript error remediation
- Workspace architecture planning

**Artifacts to Create**:
- `_bmad/modules/architecture-refactoring/agents/master-architect.md`
- `_bmad/modules/architecture-refactoring/workflows/comprehensive-remediation.md`

**Merged From**: `architecture-remediation/` + `quality/` + `cham/`

---

#### **Module C: Sprint & Feature Execution**
**Purpose**: Stories, epics, active dev cycles, BMM workflows
**Components**:
- All BMM agents (analyst, architect, dev, pm, sm, tea, tech-writer, ux-designer)
- Sprint planning workflows
- Story development cycles
- Spec-driven development
- Product manager rigor (user journey assessments)

**Artifacts to Create**:
- `_bmad/modules/sprint-execution/agents/product-manager-rigorous.md`
- `_bmad/modules/sprint-execution/workflows/spec-driven-development.md`
- `_bmad/modules/sprint-execution/config/health-metrics.yaml`

**Merged From**: `bmm/` (enhanced with spec-driven rigor)

---

#### **Module D: Integration & Testing**
**Purpose**: Cross-platform sync, real-world testing, validation
**Components**:
- Browser automation (Playwright, ChromeDev MCP)
- Real API testing (Gemini, OpenRouter - NO MOCKS)
- Cross-platform integration testing
- Visual regression testing (multimodal)
- Dual-team synchronization (Claude Code + Open Code)

**Artifacts to Create**:
- `_bmad/modules/integration-testing/agents/real-world-validator.md`
- `_bmad/modules/integration-testing/workflows/browser-automation-suite.md`
- `_bmad/modules/integration-testing/config/api-keys-prod.yaml` (user-provided)

**Created From**: New module focused on testing excellence

---

## Phase 2: Platform Agnostic Integration (100%)

### 2.1 Unified Agent Registry

**File**: `.claude/config/unified-agent-registry.yaml`

```yaml
# Single source of truth for ALL agents across platforms
agents:
  - id: "bmad-core-master"
    platforms: ["claude-code", "opencode"]
    capabilities: ["orchestration", "routing", "state-management"]
    availability: "active"
    specialization: "multi-platform coordination"

  - id: "platform-router"
    platforms: ["claude-code", "opencode"]
    capabilities: ["platform-detection", "load-balancing", "failover"]
    availability: "active"
    specialization: "optimal platform selection"
```

### 2.2 Platform Router Service

**File**: `_bmad/modules/core-governance/agents/platform-router.md`

**Capabilities**:
- Auto-detect optimal platform based on task type
- Load balance across platforms for performance
- Failover if one platform unavailable
- Route specialized tasks to platform-specific strengths

**Routing Logic**:
```yaml
# Decision matrix
task_type: "code-generation"
optimal_platform: "claude-code"  # Better at complex refactoring

task_type: "documentation"
optimal_platform: "opencode"     # Better at structured docs

task_type: "real-world-testing"
optimal_platform: "both"         # Cross-platform validation
```

### 2.3 Shared State Management

**File**: `.claude/AGENT-STATE.yaml` (UNIFIED - shared across platforms)

**Structure**:
```yaml
session:
  id: "UNIFIED-{timestamp}"
  platforms: ["claude-code", "opencode"]
  last_updated: "{ISO_timestamp}"

current:
  agent: "{active_agent}"
  platform: "{current_platform}"  # Track which platform is active
  workflow: "{current_workflow}"

handoffs:
  pending:
    - id: "HANDOFF-{timestamp}"
      from_platform: "claude-code"
      to_platform: "opencode"
      agent: "{target_agent}"
      context_artifact: "_bmad-output/handoffs/{session}/{story}.md"
```

**Synchronization**:
- Both platforms read/write same AGENT-STATE.yaml
- Mutex locks prevent concurrent writes
- Automatic conflict resolution with timestamp ordering

### 2.4 Cross-Platform Handoff Protocol

**Workflow**: `_bmad/modules/core-governance/workflows/cross-platform-handoff.md`

**Process**:
1. Agent A (Platform X) completes task
2. Creates handoff artifact with platform tags
3. Updates unified AGENT-STATE.yaml
4. Platform Router routes to Platform Y
5. Agent B (Platform Y) loads artifact and context
6. Execution continues seamlessly

**Dev Notes Integration**:
- All artifacts include `integration_points:` field
- Dual-team self-detection via keyword scanning
- Automatic notification when cross-team work detected

---

## Phase 3: Self-Regulated Loops (BMAD-Core-Master)

### 3.1 Master Orchestrator Agent

**File**: `_bmad/modules/core-governance/agents/bmad-core-master.md`

**Role**: Central coordinator enforcing all governance with **FULL AUTONOMY**

**User Decision**: Full autonomous override capability - can pause/block execution and make decisions without human approval (90%+ autonomy goal)

**Autonomous Capabilities**:
- ✅ **Pause/Block Execution**: Can halt workflows when governance violations detected
- ✅ **Make Decisions**: Route tasks, split stories, trigger deep-investigation without approval
- ✅ **Override Agents**: Reassign tasks if agent underperforming or stuck
- ✅ **Emergency Shutdown**: Abort sprint if critical failures cascade
- ✅ **Resource Reallocation**: Move agents between modules based on priority

**Context Management**:
- Context pulling via grep, search, MCP tools
- Metadata + timestamp filtering for relevance
- Loop-within-loop management (sprint → story → step)
- Time-boxing enforcement (30 min max per story)
- Deep-investigation triggering on timeout

**Activation Protocol**:
```yaml
# Starts every autonomous session
start_sequence:
  1. Load config.yaml
  2. Read unified AGENT-STATE.yaml
  3. Scan for stale artifacts (TTL check)
  4. Load current LOOP_STATE.yaml
  5. Identify active story/epic
  6. Route to appropriate module agent

autonomous_decision_making:
  # Can make these decisions WITHOUT human approval
  - "Route story to different agent if current agent stuck"
  - "Split story if time-box exceeded 2x"
  - "Trigger deep-investigation on first timeout"
  - "Pause sprint if health score drops >30%"
  - "Reallocate agents to critical blockers"
  - "Abort workflow if unfixable errors detected"

  # MUST notify human (but can continue)
  - "Architecture decisions affecting system design"
  - "Budget alerts (API key costs exceeding daily limit)"
  - "Module consolidation conflicts"
  - "Cross-platform routing failures"

  # REQUIRES human approval
  - "Delete any artifact (except TTL-based auto-archive)"
  - "Modify Tier 1 governance documents"
  - "Change sprint priorities mid-execution"
```

**Fallback Mechanisms**:
```yaml
autonomy_safeguards:
  - "Every decision logged to AGENT-STATE.yaml with reasoning"
  - "Human can override any decision via /emergency-intervention command"
  - "Critical decisions (>30% health impact) require 60-second delay with explanation"
  - "Rollback procedures for all autonomous actions"
  - "Daily audit report of all autonomous decisions made"
```

### 3.2 Context Filtering System

**File**: `_bmad/modules/core-governance/config/context-filtering.yaml`

**Rules**:
```yaml
artifact_relevance:
  tier_1:
    ttl: "permanent"
    loading: "always"  # Standards, constitution
    validation: "read-only check"

  tier_2:
    ttl: "permanent"
    loading: "on-demand"  # AGENTS.md, PRD, architecture
    validation: "full consumption before edit"

  tier_3:
    ttl: "90 days"
    loading: "if timestamp < 90 days ago"
    validation: "archive if stale"

  tier_4:
    ttl: "24 hours"  # Stories context, reports, validations
    loading: "if timestamp < 24 hours ago AND status=validated"
    validation: "IGNORE if stale, trigger context recovery"
```

**Stale Artifact Handling**:
```yaml
stale_artifact_protocol:
  detection:
    - "Scan artifact frontmatter for created_at timestamp"
    - "Compare against current time"
    - "If age > TTL: mark as STALE"

  recovery:
    - "STOP workflow immediately"
    - "Trigger deep-investigation workflow"
    - "Retrieve historical context from archives"
    - "Re-validate artifact before consuming"

  prevention:
    - "Auto-archive artifacts approaching TTL"
    - "Update artifact registry with status"
    - "Notify governance module of orphans"
```

### 3.3 Time-Boxing Enforcement

**File**: `_bmad/modules/core-governance/config/time-boxing.yaml`

**Rules**:
```yaml
time_boxes:
  story_implementation:
    max_duration: "30 minutes"
    monitoring: "track via AGENT-STATE.yaml timestamp"
    on_exceed:
      - "PAUSE current implementation"
      - "TRIGGER deep-investigation workflow"
      - "ANALYZE why story exceeded timebox"
      - "DECIDE: split story, add research, or adjust scope"

  deep_investigation:
    max_duration: "15 minutes"
    output: "investigation-report.md with root cause"
    next_action: "resume story with new context"

  epic_execution:
    max_duration: "4 hours"
    checkpoint_frequency: "every 30 minutes"
    on_checkpoint:
      - "Update LOOP_STATE.yaml progress"
      - "Validate health metrics"
      - "Check for integration points"
```

---

## Phase 4: Production-Ready Automation

### 4.1 Spec-Driven Development Workflow

**File**: `_bmad/modules/sprint-execution/workflows/spec-driven-development.md`

**Product Manager Rigor**:
```yaml
assessment_phases:
  1. user_journey_analysis:
     - "Map starting point to first interaction"
     - "Identify all user expectations at each node"
     - "Document edge cases for each step"
     - "Assess error scenarios (first 4 steps critical)"

  2. functional_requirements:
     - "What must the system DO?"
     - "Success criteria for each feature"
     - "Acceptance criteria with measurable outcomes"

  3. non_functional_requirements:
     - "Performance targets (load time, response time)"
     - "Accessibility standards (WCAG 2.1 AA)"
     - "Mobile responsiveness (touch targets ≥44px)"
     - "i18n compliance (all strings via t())"

  4. multi_viewpoint_validation:
     - "Product Manager: User value, business impact"
     - "Architect: System design, scalability"
     - "Developer: Implementation feasibility"
     - "QA: Testability, edge cases"
```

**Health Metric Enforcement**:
```yaml
health_metrics:
  critical_bugs:
    first_4_steps:
      - "Throwing errors that block progression"
      - "Looping bugs without advancing to features"
      penalty: "50% reduction in product health score"

  assessment_depth:
    superficial:
      - "Reading code only, no execution"
      - "Assuming without validating"
      - "Patching without root cause"
      penalty: "MARK AS FAILED, require re-assessment"

    systematic:
      - "User journey walkthrough"
      - "Edge case analysis"
      - "Multi-viewpoint validation"
      reward: "APPROVED for implementation"
```

### 4.2 Systematic Issue Resolution

**File**: `_bmad/modules/sprint-execution/workflows/systematic-resolution.md`

**Conditional Routing**:
```yaml
routing_logic:
  issue_type: "god_component_detected"
  conditions:
    - if: "feature is still in development"
      action: "DEFER - address after feature complete"
      reasoning: "Refactoring mid-development wastes effort"

    - if: "feature is stable and tested"
      action: "ROUTE to Module B (Architecture & Refactoring)"
      reasoning: "Technical debt remediation appropriate now"

  issue_type: "typescript_errors"
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

---

## Phase 5: Real-World Testing (No Mocks)

### 5.1 Browser Automation Suite

**File**: `_bmad/modules/integration-testing/workflows/browser-automation-suite.md`

**MCP Integration**:
```yaml
mcp_servers:
  playwright:
    purpose: "Cross-browser end-to-end testing"
    capabilities:
      - "Chrome, Firefox, Safari, Edge"
      - "Visual regression screenshots"
      - "Network request interception"
      - "Local storage testing"

  chromedev:
    purpose: "Chrome DevTools Protocol debugging"
    capabilities:
      - "Performance profiling"
      - "Memory leak detection"
      - "Console error capture"
      - "JavaScript execution tracing"
```

**Test Execution**:
```yaml
test_workflow:
  1. deploy_to_staging: "Deploy feature to staging environment"
  2. real_api_keys:
     - gemini: "User-provided production key"
     - openrouter: "User-provided production key"
  3. user_simulation:
     - "Navigate to feature as real user"
     - "Complete full user journey"
     - "Capture screenshots at each step"
     - "Measure actual performance metrics"
  4. validation:
     - "Verify no console errors"
     - "Check no network failures"
     - "Validate UI renders correctly"
     - "Confirm API calls succeed with real keys"
  5. reporting:
     - "Generate test report with screenshots"
     - "Log performance metrics"
     - "Flag any regressions"
```

### 5.2 Visual Regression Testing

**Multimodal Capabilities**:
```yaml
visual_testing:
  tools:
    - "@anthropic-ai/claude-code" (vision model)
    - "Screenshot comparison via Playwright"

  workflow:
    1. "Capture baseline screenshots"
    2. "Implement feature changes"
    3. "Capture new screenshots"
    4. "Use vision model to detect differences"
    5. "Flag unexpected UI changes"
    6. "Generate visual diff report"
```

### 5.3 Real API Key Management

**File**: `_bmad/modules/integration-testing/config/api-keys-prod.yaml`
**Git Status**: `.gitignore` entry required (NEVER commit to git)

**Structure**:
```yaml
# User-provided production keys (NEVER commit to git)
# This file is gitignored for security
api_keys:
  gemini:
    key: "USER_PROVIDED_KEY"  # Replace with actual key
    purpose: "Real AI model testing"
    quota:
      max_requests_per_day: 1000
      current_usage: 0
      last_reset: "2026-01-06T00:00:00+07:00"
    cost_tracking:
      estimated_cost_per_request: 0.0001
      daily_budget: 10.0  # USD
      current_spend: 0.0

  openrouter:
    key: "USER_PROVIDED_KEY"  # Replace with actual key
    purpose: "Multi-model routing testing"
    quota:
      max_requests_per_day: 500
      current_usage: 0
      last_reset: "2026-01-06T00:00:00+07:00"
    cost_tracking:
      estimated_cost_per_request: 0.002
      daily_budget: 5.0  # USD
      current_spend: 0.0

security:
  - "NEVER log keys in output"
  - "NEVER include in handoff artifacts"
  - "Load from YAML config (not environment)"
  - "Validate key format before use"
  - "Track usage to prevent exhaustion"
  - "Alert when budget exceeded"

gitignore_entry: |
  # API keys - NEVER commit these
  _bmad/modules/integration-testing/config/api-keys-prod.yaml
  _bmad/modules/integration-testing/config/api-keys-*.yaml
```

---

## Phase 6: Artifact Integrity & Cleanup

### 6.1 Automated TTL Enforcement

**File**: `_bmad/modules/core-governance/workflows/artifact-cleanup.md`

**Cron Job Integration**:
```yaml
scheduled_tasks:
  daily_artifact_audit:
    schedule: "0 2 * * *"  # 2 AM daily
    actions:
      - "Scan all artifacts in _bmad-output/"
      - "Check created_at timestamps"
      - "Archive artifacts exceeding TTL"
      - "Update artifact registry"
      - "Generate cleanup report"

  weekly_deep_cleanup:
    schedule: "0 3 * * 0"  # 3 AM Sunday
    actions:
      - "Identify orphan artifacts (no parent references)"
      - "Detect duplicate artifacts"
      - "Compress old artifacts (>90 days)"
      - "Purge artifacts >1 year"
      - "Validate registry consistency"
```

### 6.2 Context Poisoning Prevention

**File**: `_bmad/modules/core-governance/config/context-validation.yaml`

**Pre-Execution Checks**:
```yaml
pre_execution_validation:
  1. artifact_freshness:
     - "Check all artifact timestamps"
     - "MARK STALE if age > TTL"
     - "BLOCK execution if stale artifacts detected"

  2. artifact_registry_check:
     - "Verify artifact in registry.yaml"
     - "CONFIRM status=validated"
     - "BLOCK if orphan or unregistered"

  3. dependency_validation:
     - "Check parent artifact references"
     - "VALIDATE parent exists and is fresh"
     - "BLOCK if dependency chain broken"

  4. size_limits:
     - "Count artifact lines"
     - "WARN if >1000 lines (token optimization needed)"
     - "SPLIT if >5000 lines (god artifact)"
```

---

## Phase 7: Dual-Team Synchronization

### 7.1 Separate Sprint Tracking

**File 1**: `.claude/sprint-status-claude-code.yaml`
**File 2**: `.opencode/sprint-status-opencode.yaml`

**Structure**:
```yaml
# Each team maintains independent sprint tracking
team: "claude-code"  # or "opencode"
active_sprint: "Sprint 23"
active_epics:
  - "Epic 23-1: UX/UI Modernization"
  - "Epic 23-2: Performance Optimization"

integration_points:
  detected: []
  notify_opposite_team: []  # Auto-populate when integration needed
```

### 7.2 Integration Point Self-Detection

**Keyword Scanning**:
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

dev_notes_protocol:
  format: |
    <!-- INTEGRATION_NOTE -->
    Team: {claude-code|opencode}
    Integration Required: {yes|no}
    Reason: {why integration needed}
    Contact: {agent to coordinate with}
    <!-- END_INTEGRATION_NOTE -->
```

### 7.3 Shared Notification System

**File**: `_bmad-output/shared-notifications/{timestamp}.md`

**Structure**:
```markdown
# Cross-Team Notification
**From**: claude-code
**To**: opencode
**Timestamp**: {ISO_timestamp}
**Priority**: {high|medium|low}

## Integration Point Detected
**Artifact**: {artifact_path}
**Story**: {story_id}
**Reason**: {why integration needed}

## Action Required
- [ ] Review changes
- [ ] Update corresponding platform artifacts
- [ ] Test cross-platform functionality
- [ ] Confirm completion

## Status
**Status**: PENDING
**Assigned To**: {agent_name}
**Completed At**: {timestamp_when_done}
```

---

## Implementation Sequence (ALL PHASES IN PARALLEL)

**User Decision**: Execute all 7 phases simultaneously for maximum speed

### Parallel Execution Strategy

```yaml
sprint_structure:
  duration: "8 weeks total"
  execution_mode: "parallel"

  teams:
    - team: "Platform Integration Squad"
      phases: [1, 2, 3, 6]
      focus: "Unified routing, cross-platform handoffs"

    - team: "Governance & Autonomy Squad"
      phases: [1, 4, 7]
      focus: "BMAD-Core-Master, TTL enforcement, self-regulation"

    - team: "Testing & Validation Squad"
      phases: [5, 7]
      focus: "Real-world testing, browser automation, API integration"

    - team: "Module Consolidation Squad"
      phases: [2, 3]
      focus: "Merging 7→4 modules, refactoring workflows"
```

### Week 1-2: Foundation (All Teams Active)
**Platform Integration**:
- ✅ Create unified agent registry
- ✅ Build platform router agent
- ✅ Implement unified AGENT-STATE.yaml

**Governance**:
- ✅ Create core-governance module structure
- ✅ Implement pre-execution validation hooks
- ✅ Design TTL enforcement system

**Testing**:
- ✅ Setup Playwright MCP integration
- ✅ Setup ChromeDev MCP integration
- ✅ Create api-keys-prod.yaml (gitignored)

**Consolidation**:
- ✅ Create new module directories (4 modules)
- ✅ Design module merger boundaries

### Week 3-4: Core Implementation (All Teams Active)
**Platform Integration**:
- ✅ Build cross-platform handoff protocol
- ✅ Create shared notification system
- ✅ Test .claude ↔ .opencode routing

**Governance**:
- ✅ Implement BMAD-Core-Master orchestrator
- ✅ Wire time-boxing enforcement
- ✅ Create deep-investigation triggers

**Testing**:
- ✅ Build browser automation suite
- ✅ Create visual regression testing
- ✅ Implement real API key validation

**Consolidation**:
- ✅ Merge governance+asgl → core-governance
- ✅ Merge architecture-remediation+quality+cham → architecture-refactoring
- ✅ Enhance bmm → sprint-execution

### Week 5-6: Integration & Hardening (All Teams Active)
**Platform Integration**:
- ✅ Implement dual-team sprint tracking
- ✅ Create integration point auto-detection
- ✅ Test cross-platform workflows

**Governance**:
- ✅ Enable automated TTL enforcement
- ✅ Implement context filtering system
- ✅ Create stale artifact recovery workflow

**Testing**:
- ✅ Run full browser automation suite
- ✅ Execute real-world testing with production keys
- ✅ Validate visual regression system

**Consolidation**:
- ✅ Create integration-testing module
- ✅ Update all AGENTS.md references
- ✅ Test consolidated module workflows

### Week 7-8: Validation & Launch (All Teams Active)
**All Teams**:
- ✅ Run full system integration tests
- ✅ Validate 90%+ autonomy achievement
- ✅ Measure 0% context poisoning compliance
- ✅ Test cross-platform routing (100% success target)
- ✅ Validate real-world testing with production APIs
- ✅ Document production handoff
- ✅ Create rollback procedures

---

## Success Metrics

### Autonomy
- **Target**: 90%+ autonomous execution (near 0% human interference)
- **Measure**: Ratio of autonomous stories to human-intervention stories

### Governance Compliance
- **Target**: 100% enforcement of all governance rules
- **Measure**: Automated validation catches all violations before execution

### Platform Integration
- **Target**: 100% routing success between .claude and .opencode
- **Measure**: Cross-platform handoffs complete without errors

### Context Quality
- **Target**: 0% context poisoning, 100% artifact freshness
- **Measure**: Stale artifact detection blocks execution 100% of time

### Production Readiness
- **Target**: 0% critical bugs in first 4 user journey steps
- **Measure**: Real-world testing with browser automation passes

### Token Efficiency
- **Target**: 70%+ token optimization via TTL enforcement
- **Measure**: Average context size per story <50K tokens

---

## Critical Files to Modify

### New Files (Create)
```
_bmad/modules/core-governance/
  ├── agents/platform-router.md
  ├── agents/bmad-core-master.md
  ├── workflows/unified-state-management.md
  └── config/platform-matrix.yaml

_bmad/modules/architecture-refactoring/
  ├── agents/master-architect.md
  └── workflows/comprehensive-remediation.md

_bmad/modules/sprint-execution/
  ├── agents/product-manager-rigorous.md
  ├── workflows/spec-driven-development.md
  └── config/health-metrics.yaml

_bmad/modules/integration-testing/
  ├── agents/real-world-validator.md
  ├── workflows/browser-automation-suite.md
  └── config/api-keys-prod.yaml

.claude/config/unified-agent-registry.yaml
.claude/AGENT-STATE.yaml (unified)
.opencode/AGENT-STATE.yaml (symlink to .claude)
```

### Files to Modify (Update)
```
AGENTS.md (update module references)
_bmad/bmb/config.yaml (add new module paths)
.claude/hooks/pre-execution.sh (wire to validation)
.opencode/hooks/pre-execution.sh (wire to validation)
```

### Files to Archive (Deprecate)
```
_bmad/modules/asgl/ (merge into core-governance)
_bmad/modules/governance/ (merge into core-governance)
_bmad/modules/quality/ (merge into architecture-refactoring)
_bmad/modules/cham/ (merge into architecture-refactoring)
_bmad/modules/cross-workspace-chat/ (unused - deprecate)
```

---

## Risk Mitigation

### Risk 1: Module Consolidation Breaks Existing Workflows
**Mitigation**: Create facade layer maintaining backward compatibility during migration

### Risk 2: Platform Router Causes Task Failures
**Mitigation**: Fallback to manual platform selection with user prompt

### Risk 3: TTL Enforcement Deletes Active Artifacts
**Mitigation**: Dry-run mode first, manual approval before purging

### Risk 4: Real API Keys Exhausted During Testing
**Mitigation**: Quota tracking, rate limiting, cost alerts

### Risk 5: Dual-Team Integration Points Missed
**Mitigation**: Keyword scanning + manual integration note review

---

## Handoff to Implementation

Once approved, this plan will be executed by:
1. **BMAD-Core-Master** (orchestration)
2. **Platform Router** (cross-platform coordination)
3. **Module-specific agents** (consolidation work)

**Estimated Duration**: 8 weeks
**Resource Requirement**: User-provided API keys for Gemini and OpenRouter
**Success Criterion**: 90%+ autonomous execution with 0% context poisoning

---

**Plan Status**: READY FOR APPROVAL
**Next Action**: Admin review and approval to proceed
