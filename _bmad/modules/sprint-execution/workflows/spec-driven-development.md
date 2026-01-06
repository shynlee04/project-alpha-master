# Spec-Driven Development Workflow

**Workflow ID**: WF-SPRINT-001
**Module**: Sprint & Feature Execution (MOD-C-SPRINT)
**Governance Tier**: Tier 2 (Controlled & Iterative)
**TTL**: Permanent
**Created**: 2026-01-06
**Orchestrator**: Product Manager (Rigorous)

---

## Purpose

Transform product requirements into technical specifications through systematic user journey analysis, multi-viewpoint validation, and rigorous assessment enforcement. Ensures all stories have complete technical specs before implementation.

---

## Workflow Overview

```yaml
workflow_type: "spec_driven_development"
duration: "2-3 hours per story"
frequency: "Every story before development"
autonomy: "MEDIUM (Product Manager with BMM agents)"

phases:
  1. "Product Requirements" (30 min)
  2. "User Journey Assessment" (45 min)
  3. "Multi-Viewpoint Validation" (30 min)
  4. "Technical Specification" (45 min)
  5. "Implementation Planning" (30 min)
```

---

## Phase 1: Product Requirements (PRD)

**Purpose**: Gather and document product requirements with clear success criteria

```yaml
product_requirements_phase:
  duration: "30 minutes"
  input: "Story from sprint backlog"

  prerequisites:
    - "Story has clear business value"
    - "Story has acceptance criteria defined"
    - "Story is prioritized in sprint"

  output_artifact: "artifacts/specs/{story_id}-prd.md"

  prd_template:
    section_1_overview:
      story_id: "{story_id}"
      story_title: "{title}"
      story_type: "{feature | enhancement | bugfix}"
      priority: "{P0 | P1 | P2}"
      points: "{story_points}"
      business_value: "{description of business impact}"

    section_2_user_stories:
      as_a: "{user role}"
      i_want: "{action or feature}"
      so_that: "{benefit or value}"

      acceptance_criteria:
        - "Given {precondition}"
        - "When {action}"
        - "Then {expected outcome}"
        - "And {additional criteria}"

    section_3_success_metrics:
      measurable_outcomes:
        - "Metric 1: {description} - Target: {value}"
        - "Metric 2: {description} - Target: {value}"
        - "Metric 3: {description} - Target: {value}"

    section_4_dependencies:
      stories: ["{dependent_story_1}", "{dependent_story_2}"]
      epic: "{parent_epic}"
      features: ["{related_feature_1}", "{related_feature_2}"]

    section_5_constraints:
      design: "8-bit gaming style, no glassmorphism"
      mobile: "Touch targets ≥44px, responsive design"
      i18n: "All strings via t() function"
      performance: "Load time <2s, response time <500ms"

  validation:
    - "Business value clearly articulated"
    - "Acceptance criteria are measurable"
    - "Success metrics are quantifiable"
    - "Dependencies documented"
    - "Constraints clearly specified"
```

---

## Phase 2: User Journey Assessment (Systematic)

**Purpose**: Walk through first 4 steps systematically to identify edge cases and error scenarios

```yaml
user_journey_assessment_phase:
  duration: "45 minutes"
  orchestrator: "Product Manager (Rigorous)"
  rigor: "SYSTEMATIC (code-only assessments REJECTED)"

  assessment_requirement:
    - "Walk through first 4 steps step-by-step"
    - "Document user expectations at each node"
    - "Identify edge cases for each step"
    - "Assess error scenarios (first 4 steps CRITICAL)"
    - "Check for throwing errors that block progression"

  output_artifact: "artifacts/specs/{story_id}-user-journey.md"

  user_journey_template:
    section_1_starting_point:
      where: "{homepage | dashboard | settings}"
      user_state: "{logged_in | logged_out | trial_user}"
      context: "{additional context}"

    section_2_first_4_steps:
      - step: 1
        action: "{what user does}"
        expectation: "{what user expects to happen}"
        actual: "{what should happen}"
        edge_cases:
          - "{edge_case_1}"
          - "{edge_case_2}"
        error_scenarios:
          - "{error_scenario_1}"
          - "{error_scenario_2}"
        critical_bugs: []  # Empty if none
        # If throwing error detected:
        # critical_bugs:
        #   - "TypeError: Cannot read property 'value' of null at step 1"
        #   health_penalty: "50% reduction applied"

      - step: 2
        # ... same structure

      # ... steps 3 and 4

    section_3_step_5_and_beyond:
      - step: 5
        # ... same structure (less critical)

  rigorous_validation:
    systematic_assessment_checklist:
      - "✅ First 4 steps documented"
      - "✅ User expectations identified per step"
      - "✅ Edge cases analyzed per step"
      - "✅ Error scenarios assessed per step"
      - "✅ Critical bugs in first 4 steps documented"
      - "✅ No code-only assessments"

    superficial_red_flags:
      - "❌ Assessment says 'I read the code'"
      - "❌ No user journey walkthrough"
      - "❌ Missing edge case analysis"
      - "❌ No error scenario assessment"
      - "❌ Single viewpoint (developer-only)"

    if_superficial_detected:
      action: "IMMEDIATE REJECTION"
      rejection_template: |
        ❌ ASSESSMENT REJECTED - SUPERFICIAL

        Story: {story_id}
        Reason: Code-only assessment without user journey validation

        Missing Elements:
        - [ ] User journey walkthrough (first 4 steps)
        - [ ] Edge case analysis per step
        - [ ] Error scenario assessment
        - [ ] Multi-viewpoint validation

        Required Action: Reassess with systematic user journey analysis
        Reference: product-manager-rigorous workflow

      notification: "Log to assessment quality metrics"
      reassessment_required: true

  example_systematic_assessment:
    story: "User authentication flow"

    step_1_click_login:
      action: "Click login button"
      expectation: "Login modal appears"
      edge_cases:
        - "Modal doesn't open (JavaScript error)"
        - "Modal opens off-screen (mobile viewport)"
      error_scenarios:
        - "Login button throws TypeError"
      critical_bugs: []  # OK

    step_2_enter_email:
      action: "Enter email address"
      expectation: "Email input accepts characters"
      edge_cases:
        - "Invalid email format"
        - "Email already exists"
        - "Email too long (>254 chars)"
      error_scenarios:
        - "Input throws: Cannot read property 'value' of null"  # CRITICAL BUG
      critical_bugs:
        - "Null pointer exception at step 2"
      health_penalty: "50% product health reduction applied"
      fix_required: "IMMEDIATE - blocks all authentication"
```

---

## Phase 3: Multi-Viewpoint Validation

**Purpose**: Validate story from 4 perspectives (Product, Architect, Developer, QA)

```yaml
multi_viewpoint_validation_phase:
  duration: "30 minutes"
  orchestrator: "Product Manager (Rigorous)"

  output_artifact: "artifacts/specs/{story_id}-multi-viewpoint.md"

  viewpoints:
    product_manager_viewpoint:
      role: "User value and business impact"
      questions:
        - "What problem does this solve for the user?"
        - "What is the measurable business value?"
        - "How does this align with product strategy?"
        - "What is the user benefit?"

      assessment:
        user_value: "{description of user benefit}"
        business_impact: "{measurable business value}"
        alignment: "{product strategy alignment}"
        priority_justification: "{why this priority}"

    architect_viewpoint:
      role: "System design and scalability"
      questions:
        - "How does this fit into existing architecture?"
        - "What are the integration points?"
        - "Scalability implications?"
        - "Technical debt considerations?"

      assessment:
        system_design: "{architecture approach}"
        integration_points:
          - "{point_1}: {description}"
          - "{point_2}: {description}"
        scalability: "{scalability considerations}"
        technical_debt: "{debt introduced or resolved}"

    developer_viewpoint:
      role: "Implementation feasibility"
      questions:
        - "What is the implementation complexity?"
        - "Are there technical risks?"
        - "Dependencies required?"
        - "Estimated effort (story points)?"

      assessment:
        complexity: "{HIGH | MEDIUM | LOW}"
        estimated_effort: "{story points}"
        technical_risks:
          - "{risk_1}: {mitigation}"
          - "{risk_2}: {mitigation}"
        dependencies:
          - "{dependency_1}: {version/type}"
          - "{dependency_2}: {version/type}"

    qa_viewpoint:
      role: "Testability and edge cases"
      questions:
        - "What are the edge cases?"
        - "How do we test this?"
        - "What could go wrong?"
        - "Regression risk assessment?"

      assessment:
        edge_cases:
          - "{case_1}: {testing approach}"
          - "{case_2}: {testing approach}"
        test_strategy: "{testing approach}"
        testing_tools: ["{tool_1}", "{tool_2}"]
        regression_risk: "{risk assessment}"

  validation_checklist:
    - "✅ Product Manager perspective documented"
    - "✅ Architect perspective documented"
    - "✅ Developer perspective documented"
    - "✅ QA perspective documented"
    - "✅ All perspectives aligned (no conflicts)"
    - "✅ Conflicts resolved with ADRs"

  incomplete_validation:
    if_viewpoint_missing:
      action: "REQUEST additional viewpoint analysis"
      notification: "Which viewpoint is missing and why it's needed"
      example: "Assessment lacks QA perspective - please add edge case analysis"
```

---

## Phase 4: Technical Specification

**Purpose**: Create detailed technical spec with ADRs, data models, and testing strategy

```yaml
technical_specification_phase:
  duration: "45 minutes"
  orchestrator: "bmm-architect"
  input: "PRD + User Journey + Multi-Viewpoint Validation"

  output_artifact: "artifacts/specs/{story_id}-tech-spec.md"

  tech_spec_template:
    section_1_overview:
      story_id: "{story_id}"
      spec_version: "1.0.0"
      last_updated: "{ISO_timestamp}"
      status: "DRAFT | APPROVED | IMPLEMENTED"

    section_2_architecture_decisions:
      adr_1:
        context: "{What is the problem?}"
        decision: "{What was chosen?}"
        alternatives:
          - "{alternative_1}: {pros/cons}"
          - "{alternative_2}: {pros/cons}"
        consequences:
          - "{positive_consequence}"
          - "{negative_consequence}"

    section_3_data_models:
      # For stories involving data structures
      typescript_interfaces:
        - name: "{InterfaceName}"
          properties:
            - name: "{property_name}"
              type: "{typescript_type}"
              required: true
              validation: "{validation rules}"
          example: "{example_value}"

      api_contracts:
        - endpoint: "GET /api/resource"
          request_params:
            - name: "param1"
              type: "string"
              required: true
          response:
            type: "Object"
            schema: "{response_structure}"

    section_4_implementation_details:
      component_structure:
        components_to_create:
          - name: "{ComponentName}"
            purpose: "{description}"
            props:
              - name: "{prop_name}"
                type: "{type}"
                required: true
            state: "{state management approach}"
            hooks: ["{hook_1}", "{hook_2}"]

        stores_to_modify:
          - name: "{StoreName}"
            changes:
              - "Add selector: get{Value}"
              - "Add action: {actionName}"

        files_to_create:
          - "src/components/{ComponentName}.tsx"
          - "src/hooks/use{HookName}.ts"
          - "src/stores/{storeName}-slice.ts"

      design_patterns:
        - "{pattern_1}: {usage}"
        - "{pattern_2}: {usage}"

      libraries_to_use:
        - "{library_1}: {version}"
        - "{library_2}: {version}"

    section_5_testing_strategy:
      unit_tests:
        - description: "{what to test}"
          file: "src/{component}.test.ts"
          coverage_target: "80%+"

      integration_tests:
        - description: "{what to test}"
          file: "src/integration/{feature}.test.ts"
          scenarios: ["{scenario_1}", "{scenario_2}"]

      e2e_tests:
        - description: "{user journey to test}"
          file: "src/e2e/{journey}.test.ts"
          tools: ["Playwright", "ChromeDev"]

      validation_commands:
        typescript: "pnpm typecheck"
        tests: "pnpm test"
        lint: "pnpm lint"
        build: "pnpm build"

    section_6_deployment_strategy:
      deployment_steps:
        - "1. Create feature branch"
        - "2. Implement changes"
        - "3. Run tests locally"
        - "4. Create PR"
        - "5. Code review"
        - "6. Merge to main"
        - "7. Deploy to staging"
        - "8. E2E testing"
        - "9. Deploy to production"

      rollback_plan:
        trigger: "{what constitutes failure requiring rollback}"
        steps:
          - "1. Revert deployment"
          - "2. Investigate issue"
          - "3. Fix bug"
          - "4. Re-deploy"
        data_backup: "{backup strategy}"

    section_7_performance_considerations:
      load_time_target: "<2 seconds"
      response_time_target: "<500ms"
      bundle_impact: "{estimated bundle size increase}"
      lazy_loading: "{components to lazy load}"
      caching_strategy: "{caching approach}"

    section_8_accessibility_considerations:
      wcag_compliance: "AA"
      touch_targets: "≥44px"
      screen_reader: "{aria labels, roles}"
      keyboard_navigation: "{tab order, shortcuts}"
      color_contrast: "{contrast ratios}"

    section_9_i18n_considerations:
      strings: "All via t() function"
      date_formatting: "{locale-specific format}"
      number_formatting: "{locale-specific format}"
      rtl_support: "{if applicable}"

  validation:
    - "All ADRs documented with alternatives considered"
    - "Data models defined with TypeScript interfaces"
    - "API contracts specified with examples"
    - "Component structure clear and modular"
    - "Testing strategy comprehensive (unit, integration, E2E)"
    - "Deployment and rollback plans defined"
    - "Performance and accessibility considered"
    - "i18n compliance ensured"
```

---

## Phase 5: Implementation Planning

**Purpose**: Break down technical spec into implementation tasks

```yaml
implementation_planning_phase:
  duration: "30 minutes"
  orchestrator: "bmm-dev"
  input: "Technical specification"

  output_artifact: "artifacts/specs/{story_id}-implementation-plan.md"

  task_breakdown:
    tasks:
      - task: 1
        title: "{task title}"
        description: "{what to do}"
        file: "{file to create/modify}"
        estimated_time: "{minutes}"
        dependencies: []
        acceptance_criteria:
          - "{criterion_1}"
          - "{criterion_2}"

      - task: 2
        # ... same structure

    example_tasks:
      - task: 1
        title: "Create AuthModal component"
        description: "Build modal with email and password inputs"
        file: "src/components/auth/AuthModal.tsx"
        estimated_time: "30 minutes"
        dependencies: []
        acceptance_criteria:
          - "Modal opens on button click"
          - "Email input validates format"
          - "Password input masks characters"
          - "Touch targets ≥44px"

      - task: 2
        title: "Add useAuth hook"
        description: "Create custom hook for authentication logic"
        file: "src/hooks/useAuth.ts"
        estimated_time: "20 minutes"
        dependencies: []
        acceptance_criteria:
          - "Handles login API call"
          - "Manages authentication state"
          - "Provides error handling"

      - task: 3
        title: "Integrate auth store"
        description: "Add auth slice to Zustand store"
        file: "src/stores/auth-slice.ts"
        estimated_time: "15 minutes"
        dependencies: [2]
        acceptance_criteria:
          - "User state managed"
          - "Login action implemented"
          - "Logout action implemented"

      - task: 4
        title: "Write unit tests"
        description: "Test AuthModal and useAuth"
        file: "src/components/auth/AuthModal.test.tsx"
        estimated_time: "30 minutes"
        dependencies: [1, 2]
        acceptance_criteria:
          - "Coverage ≥80%"
          - "All happy paths tested"
          - "Error scenarios tested"

      - task: 5
        title: "E2E testing"
        description: "Test full authentication journey"
        file: "src/e2e/auth-flow.test.ts"
        estimated_time: "20 minutes"
        dependencies: [1, 2, 3, 4]
        acceptance_criteria:
          - "User can login successfully"
          - "Error scenarios handled"
          - "Console errors checked"

  total_estimated_time: "115 minutes (~2 hours)"

  implementation_sequence:
    parallel_tasks:
      - "Tasks 1 and 2 can run in parallel"

    sequential_dependencies:
      - "Task 3 depends on Task 2"
      - "Task 4 depends on Tasks 1 and 2"
      - "Task 5 depends on all previous tasks"

  resource_allocation:
    developer: "bmm-dev"
    qa: "bmm-tea"
    tech_writer: "bmm-tech-writer"
    estimated_completion: "{date/time}"
```

---

## State Management

### AGENT-STATE.yaml Updates

```yaml
# Product Manager and BMM agents update these sections

progress:
  specs_created: {increment}
  user_journeys_assessed: {increment}
  multi_viewpoint_validations: {increment}
  implementation_plans: {increment}

current_spec:
  story_id: "{story_id}"
  phase: "prd | user_journey | multi_viewpoint | tech_spec | implementation"
  active_agent: "{current orchestrator}"
  approval_status: "DRAFT | UNDER_REVIEW | APPROVED"

assessment_quality:
  systematic_assessments: {count}
  superficial_assessments: {count}
  rejection_rate: "{percentage}"

product_health:
  current_score: {recalculate with penalties}
  critical_bugs_first_4_steps: {count}
  health_penalties_active: [{penalty_details}]
```

---

## Error Handling & Recovery

```yaml
error_scenarios:
  user_journey_superficial:
    action: "REJECT assessment"
    recovery: "Agent provides systematic reassessment"

  multi_viewpoint_incomplete:
    action: "REQUEST missing viewpoint"
    recovery: "Agent provides missing perspective"

  technical_spec_incomplete:
    action: "REQUEST missing sections"
    recovery: "Architect completes documentation"

  critical_bug_in_first_4_steps:
    action: "Apply 50% health penalty"
    recovery: "Bug must be fixed before story approval"

  conflicts_between_viewpoints:
    action: "TRIGGER ADR creation"
    recovery: "Document decision, resolve conflict"
```

---

## Integration with BMM Agents

```yaml
agent_coordination:
  product_manager_rigorous:
    interaction: "Enforce rigor, validate assessments"
    frequency: "Every story before spec"

  bmm_analyst:
    interaction: "Gather requirements, create PRD"
    trigger: "Story accepted for sprint"

  bmm_architect:
    interaction: "Create technical specification"
    trigger: "After user journey approved"

  bmm_dev:
    interaction: "Break down into implementation tasks"
    trigger: "After tech spec approved"

  bmm_te:
    interaction: "Create testing strategy"
    trigger: "During tech spec creation"

  handoff_protocol:
    1. "Product Manager validates user journey"
    2. "If systematic: Approve for multi-viewpoint"
    3. "BMM Analyst creates PRD"
    4. "Product Manager validates multi-viewpoint"
    5. "BMM Architect creates tech spec"
    6. "BMM Dev creates implementation plan"
    7. "Product Manager gives final approval for development"
```

---

## Success Criteria

✅ **Systematic assessment** (100%, 0% superficial)
✅ **Multi-viewpoint validation** (all 4 perspectives)
✅ **Critical bugs identified** (in first 4 steps)
✅ **Technical spec complete** (with ADRs, data models, testing strategy)
✅ **Implementation plan** (task breakdown with estimates)
✅ **Health penalties applied** (if critical bugs in first 4 steps)
✅ **AGENTS.md ready** (for update after implementation)

---

## Quality Metrics

### Spec Quality

- **Target**: 100% systematic assessments
- **Measurement**: Assessment quality tracking
- **Current**: Tracked in AGENT-STATE.yaml

### Multi-Viewpoint Coverage

- **Target**: 100% (all 4 perspectives)
- **Measurement**: Viewpoint coverage percentage
- **Current**: Tracked per viewpoint

### Technical Debt Prevention

- **Target**: Zero architecture violations
- **Measurement**: ADR compliance
- **Current**: Validated by Product Manager

---

## Example End-to-End Execution

```yaml
example_story:
  story_id: "S-001"
  title: "User authentication"
  points: 5

  phase_1_prd:
    duration: "30 minutes"
    output: "artifacts/specs/S-001-prd.md"
    acceptance_criteria: 5

  phase_2_user_journey:
    duration: "45 minutes"
    output: "artifacts/specs/S-001-user-journey.md"
    first_4_steps_documented: true
    critical_bugs_found: 0
    assessment: "SYSTEMATIC ✅"

  phase_3_multi_viewpoint:
    duration: "30 minutes"
    output: "artifacts/specs/S-001-multi-viewpoint.md"
    all_4_viewpoints: true
    conflicts: 0

  phase_4_tech_spec:
    duration: "45 minutes"
    output: "artifacts/specs/S-001-tech-spec.md"
    adrs_created: 2
    data_models: 3
    testing_strategy: "comprehensive"

  phase_5_implementation:
    duration: "30 minutes"
    output: "artifacts/specs/S-001-implementation-plan.md"
    tasks_breakdown: 5
    total_estimated_time: "115 minutes"

  outcome: "✅ APPROVED FOR DEVELOPMENT"
  total_time: "3 hours"
```

---

**Workflow Status**: ✅ ACTIVE - Ready for execution
**Orchestrator**: Product Manager (Rigorous) with BMM agents
**Autonomy Level**: MEDIUM (rigor enforcement with validation)
**Next Action**: Execute Phase 1 (Product Requirements)
**Frequency**: Every story before development
**Expected Outcome**: Complete technical spec with systematic assessment

