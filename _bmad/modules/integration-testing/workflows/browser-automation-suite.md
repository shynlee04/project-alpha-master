# Browser Automation Suite Workflow

**Workflow ID**: WF-TEST-001
**Module**: Integration & Testing (MOD-D-TEST)
**Governance Tier**: Tier 3 (Archival)
**TTL**: 90 days
**Created**: 2026-01-06
**Orchestrator**: Real-World Validator

---

## Purpose

Execute production-grade end-to-end testing with real APIs, real browsers, and comprehensive validation. Zero mocks - all tests use actual services to validate true functionality.

---

## Workflow Overview

```yaml
workflow_type: "browser_automation_testing"
duration: "2-3 hours per feature"
frequency: "Every story marked 'ready for testing'"
autonomy: "HIGH (Real-World Validator with MCP integration)"

phases:
  1. "Deploy to Staging" (15 min)
  2. "Load Production Keys" (5 min)
  3. "Execute User Journeys" (60-90 min)
  4. "Validate APIs" (30 min)
  5. "Visual Regression" (30 min)
  6. "Generate Report" (15 min)
```

---

## Phase 1: Deploy to Staging

**Purpose**: Deploy feature to staging environment for testing

```yaml
deploy_to_staging_phase:
  duration: "15 minutes"
  prerequisite: "Story implementation complete"

  deployment_steps:
    1. "Create deployment branch from main"
    2. "Merge feature branch to deployment branch"
    3. "Build production bundle: pnpm build"
    4. "Run tests: pnpm test"
    5. "Deploy to staging environment"
    6. "Verify deployment success"
    7. "Capture baseline metrics"

  verification_commands:
    build: "pnpm build"
    test: "pnpm test"
    deploy: "pnpm deploy:staging"  # Custom deploy script

  baseline_metrics:
    - "Bundle size: {size} KB"
    - "Build time: {seconds}"
    - "Deployment status: {success/failed}"
    - "Environment URL: {staging_url}"

  on_deployment_failure:
    action: "BLOCK testing, notify development team"
    recovery: "Fix deployment issues, retry"
```

---

## Phase 2: Load Production API Keys

**Purpose**: Load real API keys from config (NEVER use mocks)

```yaml
load_production_keys_phase:
  duration: "5 minutes"
  config_file: "_bmad/modules/integration-testing/config/api-keys-prod.yaml"

  key_loading:
    gemini:
      primary_model: "gemini-3-pro-preview"
      fallback_model: "gemini-3-flash-preview"
      minimum_model: "gemini-2.5-flash"

      quota_check:
        max_requests_per_day: 1000
        current_usage: 0  # Load from tracking
        quota_remaining: "{calculate}"
        reset_at: "Midnight tonight"

      cost_tracking:
        estimated_cost_per_request: 0.0001
        daily_budget: 10.0
        current_spend: 0.0
        budget_alert_threshold: 8.0

      validation:
        - "Key format valid"
        - "Quota available"
        - "Below budget threshold"
        - "Ready for testing"

    openrouter:
      coding_model: "mistralai/devstral-2512:free"
      multimodal_model: "mistralai/mistral-small-3.1-24b-instruct:free"

      quota_check:
        max_requests_per_day: 500
        current_usage: 0
        quota_remaining: "{calculate}"

      cost_tracking:
        estimated_cost_per_request: 0.0  # FREE tier
        budget_alert_threshold: "N/A (free tier)"

      validation:
        - "Key format valid"
        - "Quota available"
        - "Ready for testing"

  security_protocols:
    - "NEVER log keys in output"
    - "NEVER include in handoff artifacts"
    - "Load from YAML config only"
    - "Validate key format before use"

  quota_exhaustion_handling:
    if_quota_insufficient:
      action: "PAUSE testing immediately"
      notification: "Alert BMAD-Core-Master with quota report"
      recovery: "Wait for daily reset or user intervention"

  on_key_validation_failure:
    action: "CRITICAL - Notify human immediately"
    recovery: "Wait for user to provide valid key"
```

---

## Phase 3: Execute User Journeys (Playwright MCP)

**Purpose**: Simulate real user interactions with browser automation

```yaml
browser_automation_phase:
  duration: "60-90 minutes"
  mcp_server: "Playwright MCP"
  browsers: ["Chrome", "Firefox", "Safari", "Edge"]

  test_setup:
    playwright_launch:
      browser: "chromium"  # Can also use firefox, webkit
      headless: false  # Show browser for debugging
      slow_mo: 50  # Slow down actions for visibility
      viewport: "{width: 1920, height: 1080}"

  user_journey_execution:
    story_id: "{story_id}"
    feature_under_test: "{feature_name}"

    steps:
      - step: 1
        action: "Navigate to {url}"
        command: "await page.goto('{staging_url}')"
        screenshot: "artifacts/screenshots/baseline/{feature}/step-1-navigate.png"
        validation:
          - "Page loads successfully"
          - "No console errors"
          - "Load time <2 seconds"

      - step: 2
        action: "Click {button}"
        command: "await page.click('{button_selector}')"
        screenshot: "artifacts/screenshots/baseline/{feature}/step-2-click-{button}.png"
        validation:
          - "Button responds to click"
          - "Expected action occurs"
          - "No console errors"

      - step: 3
        action: "Fill {form_field}"
        command: |
          await page.fill('{input_selector}', '{test_value}')
          await page.screenshot({ path: 'screenshot.png' })
        screenshot: "artifacts/screenshots/baseline/{feature}/step-3-fill-{field}.png"
        validation:
          - "Input accepts characters"
          - "Validation works"
          - "No console errors"

      # ... more steps as needed

    console_error_capture:
      enabled: true
      on_console_error:
        action: "Log error, flag in test report"
        severity: "FAIL if error blocks user journey"

    network_monitoring:
      enabled: true
      on_request_failed:
        action: "Log failed request, flag in test report"
        severity: "FAIL if API call fails"

    performance_tracking:
      metrics:
        - "Load time: {time_to_first_paint}"
        - "Response time: {time_to_interactive}"
        - "Frame rate: {fps_during_interactions}"
        - "Memory usage: {heap_size}"

  cross_browser_testing:
    chrome:
      priority: "P0"
      test_execution: "Full user journey"
      screenshots: "Capture at each step"

    firefox:
      priority: "P0"
      test_execution: "Full user journey"
      screenshots: "Capture at each step"

    safari:
      priority: "P1"
      test_execution: "Smoke test (key steps only)"
      screenshots: "Capture key steps only"

    edge:
      priority: "P1"
      test_execution: "Smoke test (key steps only)"
      screenshots: "Capture key steps only"

  test_coverage:
    happy_path:
      - "Primary user workflow"
      - "Most common use cases"

    edge_cases:
      - "Invalid inputs"
      - "Network failures"
      - "Error scenarios"
      - "Boundary conditions"

    mobile_testing:
      - "Touch targets ≥44px"
      - "Responsive design"
      - "Mobile-specific features"

    accessibility:
      - "Keyboard navigation"
      - "Screen reader compatibility"
      - "ARIA attributes"
```

---

## Phase 4: Validate Real API Calls

**Purpose**: Test with real production APIs (NO MOCKS)

```yaml
real_api_validation_phase:
  duration: "30 minutes"
  philosophy: "NO MOCKS - All tests use real APIs"

  api_testing:
    load_api_keys:
      from: "_bmad/modules/integration-testing/config/api-keys-prod.yaml"
      validation: "Key format and quota check"

    execute_api_calls:
      gemini_api:
        model: "gemini-3-flash-preview"
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        method: "POST"
        headers:
          Authorization: "Bearer {api_key}"
          Content-Type: "application/json"

        request_body:
          test_prompt: "Test message for API validation"
          test_image: "{base64_encoded_image}"  # For multimodal testing

        validation:
          - "API responds with 200 status"
          - "Response contains expected data"
          - "Response time <500ms"
          - "Quota tracked after call"

        quota_tracking:
          increment: "gemini_requests_today"
          update: "current_usage"
          check: "If quota >80%, alert BMAD-Core-Master"

      openrouter_api:
        model: "mistralai/devstral-2512:free"
        endpoint: "https://openrouter.ai/api/v1/chat/completions"
        method: "POST"
        headers:
          Authorization: "Bearer {api_key}"
          HTTP-Referer: "{application_url}"
          Content-Type: "application/json"

        request_body:
          model: "mistralai/devstral-2512:free"
          messages:
            - role: "user"
              content: "Test message for API validation"

        validation:
          - "API responds with 200 status"
          - "Response contains expected data"
          - "Cost tracking: FREE tier"

        quota_tracking:
          increment: "openrouter_requests_today"
          update: "current_usage"

  rate_limiting:
    gemini:
      max_requests_per_minute: 60
      strategy: "Queue requests, respect limits"
      on_limit_reached: "Wait 1 second, retry"

    openrouter:
      max_requests_per_minute: 30
      strategy: "Queue requests, respect limits"
      on_limit_reached: "Wait 2 seconds, retry"

  cost_tracking:
    gemini:
      estimated_cost_per_request: 0.0001
      daily_budget: 10.0
      current_spend: "{running_total}"

      alerts:
        80_percent: "Warning notification at $8.00"
        95_percent: "Critical notification at $9.50"
        100_percent: "Pause testing at $10.00"

    openrouter:
      estimated_cost_per_request: 0.0  # FREE
      budget_alert: "N/A (free tier)"

  fallback_handling:
    on_api_failure:
      action: "Capture error details, log to report"
      retry_strategy: "Exponential backoff (1s, 2s, 4s, 8s)"
      max_retries: 3

    on_quota_exhausted:
      action: "PAUSE testing immediately"
      notification: "Alert human with quota report"
      recovery: "Wait for daily reset or user action"
```

---

## Phase 5: Visual Regression Testing

**Purpose**: Compare screenshots with multimodal AI to detect unintended changes

```yaml
visual_regression_phase:
  duration: "30 minutes"
  tools: ["@anthropic-ai/claude-code (vision model)", "Playwright screenshots"]

  workflow:
    1. capture_baseline:
       action: "Take screenshots before feature implementation"
       storage: "artifacts/screenshots/baseline/{feature}/"
       naming: "{step}-{description}.png"

    2. implement_feature:
       action: "Deploy feature changes"
       verification: "Feature deployed successfully"

    3. capture_actual:
       action: "Take screenshots after feature implementation"
       storage: "artifacts/screenshots/actual/{feature}/"
       naming: "{step}-{description}.png"

    4. visual_comparison:
       tool: "@anthropic-ai/claude-code"
       method: "Use vision model to detect differences"
       prompt: |
         Compare these two screenshots and identify any visual differences.
         Focus on:
         - Layout changes
         - Color shifts
         - Typography differences
         - Spacing and alignment
         - Component rendering

       baseline_image: "artifacts/screenshots/baseline/{feature}/{step}.png"
       actual_image: "artifacts/screenshots/actual/{feature}/{step}.png"

    5. generate_diff_report:
       output: "artifacts/visual-regression-{date}.md"
       includes:
         - "Side-by-side comparison images"
         - "Highlighted differences"
         - "Regression severity (LOW|MEDIUM|HIGH)"
         - "Recommendations for fixes"

  regression_detection:
    types_of_differences:
      layout:
        - "Element positioning changes"
        - "Spacing and alignment shifts"
        - "Grid/flexbox layout changes"

      visual:
        - "Color changes (unintentional)"
        - "Typography (font, size, weight)"
        - "Iconography changes"

      rendering:
        - "Component rendering differences"
        - "CSS effects (shadows, borders)"
        - "Animation differences"

    severity_levels:
      LOW:
        - "Minor pixel differences (<2px)"
        - "Anti-aliasing variations"
        - "Action: Document only"

      MEDIUM:
        - "Spacing changes (2-5px)"
        - "Color shifts (minimal)"
        - "Action: Flag for review"

      HIGH:
        - "Layout shifts (>5px)"
        - "Missing elements"
        - "Broken components"
        - "Action: Block deployment, fix required"

  example_comparison:
    feature: "User authentication modal"

    baseline: "screenshots/baseline/auth-modal.png"
    actual: "screenshots/actual/auth-modal.png"

    differences_detected:
      - type: "spacing"
        severity: "MEDIUM"
        description: "Email input top margin increased by 4px"
        unintentional: true
        recommendation: "Review if intentional, if not fix CSS"

      - type: "color"
        severity: "LOW"
        description: "Button shadow color changed from #000 to #111"
        unintentional: false
        recommendation: "Document as intentional styling update"
```

---

## Phase 6: Generate Test Report

**Purpose**: Create comprehensive test report with all findings

```yaml
test_report_generation_phase:
  duration: "15 minutes"
  output: "artifacts/test-reports/e2e-test-report-{date}.md"

  report_structure:
    section_1_overview:
      story_id: "{story_id}"
      feature: "{feature_name}"
      test_date: "{ISO_timestamp}"
      test_duration: "{total_time}"
      tester: "real-world-validator"

    section_2_execution_summary:
      total_tests: "{number}"
      passed: "{number}"
      failed: "{number}"
      skipped: "{number}"
      pass_rate: "{percentage}"

    section_3_browser_results:
      chrome:
        status: "{PASSED | FAILED}"
        tests_executed: "{number}"
        screenshots_captured: "{number}"
        console_errors: "{number}"
        network_failures: "{number}"

      firefox:
        status: "{PASSED | FAILED}"
        tests_executed: "{number}"
        screenshots_captured: "{number}"
        console_errors: "{number}"
        network_failures: "{number}"

      safari:
        status: "{SMOKE_TEST | SKIPPED}"
        tests_executed: "{number}"
        key_steps_validated: "{number}"

      edge:
        status: "{SMOKE_TEST | SKIPPED}"
        tests_executed: "{number}"
        key_steps_validated: "{number}"

    section_4_api_validation:
      gemini_api:
        endpoint: "{endpoint}"
        model: "gemini-3-flash-preview"
        requests_made: "{number}"
        success_rate: "{percentage}"
        avg_response_time: "{ms}"
        quota_used: "{number}/{max_requests}"
        cost_incurred: "${cost}"

      openrouter_api:
        endpoint: "{endpoint}"
        model: "mistralai/devstral-2512:free"
        requests_made: "{number}"
        success_rate: "{percentage}"
        avg_response_time: "{ms}"
        quota_used: "{number}/{max_requests}"
        cost_incurred: "$0.00 (free tier)"

    section_5_visual_regression:
      screenshots_compared: "{number}"
      differences_found: "{number}"
      regressions:
        - severity: "{LOW|MEDIUM|HIGH}"
          description: "{description}"
          recommendation: "{action}"

    section_6_performance_metrics:
      load_time:
        target: "<2 seconds"
        actual: "{seconds}"
        status: "{PASS | FAIL}"

      response_time:
        target: "<500ms"
        actual: "{ms}"
        status: "{PASS | FAIL}"

      frame_rate:
        target: ">60 FPS"
        actual: "{fps}"
        status: "{PASS | FAIL}"

      memory:
        target: "No leaks in 10-minute session"
        actual: "{status}"
        status: "{PASS | FAIL}"

    section_7_issues_found:
      critical_issues:
        - issue: "{description}"
          severity: "CRITICAL"
          browser: "{browser_name}"
          screenshot: "{screenshot_path}"
          recommendation: "{action}"

      medium_issues:
        - issue: "{description}"
          severity: "MEDIUM"
          browser: "{browser_name}"
          screenshot: "{screenshot_path}"
          recommendation: "{action}"

      low_issues:
        - issue: "{description}"
          severity: "LOW"
          browser: "{browser_name}"
          screenshot: "{screenshot_path}"
          recommendation: "{action}"

    section_8_recommendations:
      for_development:
        - "{recommendation_1}"
        - "{recommendation_2}"

      for_testing:
        - "{recommendation_1}"
        - "{recommendation_2}"

      for_documentation:
        - "{recommendation_1}"

    section_9_conclusion:
      overall_status: "{PASS | FAIL | CONDITIONAL_PASS}"
      ready_for_production: "{YES | NO}"
      blockers:
        - "{blocker_1}"
        - "{blocker_2}"

  screenshots_evidence:
    baseline: "artifacts/screenshots/baseline/{story_id}/"
    actual: "artifacts/screenshots/actual/{story_id}/"
    diffs: "artifacts/screenshots/diffs/{story_id}/"
```

---

## State Management

### AGENT-STATE.yaml Updates

```yaml
# Real-World Validator updates these sections

progress:
  test_suites_executed: {increment}
  tests_passed: {increment}
  tests_failed: {increment}
  screenshots_captured: {increment}

api_usage:
  gemini_requests_today: {increment}
  gemini_quota_remaining: {calculate}
  gemini_cost_today: {update}
  openrouter_requests_today: {increment}
  openrouter_quota_remaining: {calculate}

test_coverage:
  browser_coverage: "{browsers tested}"
  api_coverage: "{endpoints tested}"
  visual_regression_tests: {count}
  performance_tests: {count}

cross_platform:
  sync_success_rate: "{percentage}"
  handoff_success_rate: "{percentage}"
  routing_success_rate: "{percentage}"
```

---

## Error Handling & Recovery

```yaml
error_scenarios:
  deployment_failed:
    action: "BLOCK testing, notify development team"
    recovery: "Fix deployment issues, retry"

  api_key_invalid:
    action: "CRITICAL - Notify human immediately"
    recovery: "Wait for user to provide valid key"

  quota_exhausted:
    action: "PAUSE testing, alert with quota report"
    recovery: "Wait for daily reset or user intervention"

  browser_automation_failed:
    action: "Retry with different browser"
    recovery: "If all browsers fail, investigate environment"

  visual_regression_detected:
    action: "Flag in test report, continue testing"
    recovery: "Document for developer review"

  performance_regression:
    action: "Alert in test report with metrics"
    recovery: "Recommend optimization steps"

  cross_platform_sync_failed:
    action: "CRITICAL - Notify BMAD-Core-Master"
    recovery: "Investigate state synchronization issue"
```

---

## Integration with Other Agents

```yaml
agent_coordination:
  bmad_core_master:
    interaction: "Report test results, quota alerts"
    frequency: "After every test suite"

  sprint_execution:
    interaction: "Receive stories ready for testing"
    frequency: "When story marked 'ready for testing'"

  architecture_refactoring:
    interaction: "Validate remediated code"
    frequency: "After god store/component fixes"

  handoff_protocol:
    1. "Receive story ready for testing"
    2. "Load production API keys"
    3. "Execute browser automation suite"
    4. "Run real API tests"
    5. "Generate test report with screenshots"
    6. "Update AGENT-STATE.yaml with results"
    7. "Notify sprint execution of test completion"
```

---

## Success Criteria

✅ **100% real API testing** (0% mocks)
✅ **Zero console errors** during browser automation
✅ **Zero network failures** in real API calls
✅ **Zero visual regressions** (unintended UI changes)
✅ **Performance targets met** (load <2s, response <500ms)
✅ **Cross-platform sync verified** (100% success)
✅ **Quota tracked** (no exhaustion surprises)
✅ **Comprehensive report** (with screenshots and metrics)

---

## Quality Metrics

### Real-World Testing

- **Target**: 100% real API testing
- **Measurement**: API call verification in test logs
- **Enforcement**: Blocked if mocks detected

### Test Coverage

- **Target**: ≥80% code coverage
- **Measurement**: Test report coverage percentage
- **Focus**: Critical paths, user journeys

### Performance

- **Load Time**: <2 seconds
- **Response Time**: <500ms
- **Frame Rate**: >60 FPS
- **Memory**: No leaks in 10-minute session

---

## Example End-to-End Execution

```yaml
example_test_suite:
  story_id: "S-001"
  feature: "User authentication"

  phase_1_deploy:
    duration: "15 minutes"
    status: "✅ Deployment successful"
    staging_url: "https://staging.example.com"

  phase_2_load_keys:
    duration: "5 minutes"
    gemini_quota: "950/1000 remaining"
    openrouter_quota: "480/500 remaining"

  phase_3_browser_automation:
    duration: "75 minutes"
    browsers_tested: ["Chrome", "Firefox"]
    screenshots_captured: 24
    console_errors: 0
    network_failures: 0

  phase_4_api_validation:
    duration: "30 minutes"
    gemini_requests: 5
    openrouter_requests: 2
    all_apis_passed: true

  phase_5_visual_regression:
    duration: "30 minutes"
    screenshots_compared: 24
    differences_found: 1
    severity: "LOW (anti-aliasing variation)"

  phase_6_report:
    duration: "15 minutes"
    report: "artifacts/test-reports/e2e-test-report-2026-01-06.md"
    overall_status: "✅ PASS"
    ready_for_production: "YES"

  outcome: "✅ APPROVED FOR PRODUCTION"
  total_time: "3 hours"
```

---

**Workflow Status**: ✅ ACTIVE - Ready for execution
**Orchestrator**: Real-World Validator
**Autonomy Level**: HIGH (production-grade testing)
**Next Action**: Execute Phase 1 (Deploy to Staging)
**Frequency**: Every story ready for testing
**Expected Outcome**: Production-ready feature with comprehensive validation

**Testing Philosophy**: 100% REAL (0% mocks)
