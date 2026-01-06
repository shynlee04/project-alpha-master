# Integration & Testing Module

**Module ID**: MOD-D-TEST
**Governance Tier**: Tier 3 (Archival)
**TTL**: 90 days
**Last Updated**: 2026-01-06
**Status**: Active

---

## Purpose

The Integration & Testing module provides real-world testing capabilities with production-grade rigor. It focuses on cross-platform integration testing, browser automation, and real API validation (NO MOCKS allowed).

### Key Responsibilities

1. **Real-World Testing**: Browser automation with Playwright and ChromeDev MCP
2. **Cross-Platform Integration**: Dual-team synchronization validation
3. **Real API Testing**: Production API keys (Gemini, OpenRouter) with quota tracking
4. **Visual Regression Testing**: Multimodal UI comparison and validation
5. **Performance Testing**: Load testing, response time validation
6. **Test Reporting**: Comprehensive test reports with screenshots and metrics

---

## Agents

### 1. Real-World Validator
**File**: `agents/real-world-validator.md`
**Role**: Execute production-grade testing with real APIs and browsers

**Capabilities**:
- Browser automation across Chrome, Firefox, Safari, Edge
- Real API calls with production keys (NO MOCKS)
- Visual regression testing with multimodal vision models
- Performance profiling and memory leak detection
- Network request interception and validation
- Console error capture and reporting

**Testing Philosophy**:
- **NO MOCKS**: All tests use real APIs and real browsers
- **Production Keys**: User-provided keys with quota tracking
- **Full User Journeys**: Complete end-to-end testing
- **Screenshot Evidence**: Every step captured for validation
- **Performance Metrics**: Real load times, not synthetic

---

## Workflows

### 1. Browser Automation Suite
**File**: `workflows/browser-automation-suite.md`

**Test Execution**:
1. **Deploy to Staging**:
   - Deploy feature to staging environment
   - Verify deployment success
   - Capture baseline metrics

2. **Load Production Keys**:
   - Read from `config/api-keys-prod.yaml`
   - Validate key format and quota availability
   - Track usage to prevent exhaustion

3. **User Simulation**:
   - Navigate to feature as real user
   - Complete full user journey
   - Capture screenshots at each step
   - Measure actual performance metrics

4. **Validation**:
   - Verify no console errors
   - Check no network failures
   - Validate UI renders correctly
   - Confirm API calls succeed with real keys

5. **Reporting**:
   - Generate test report with screenshots
   - Log performance metrics
   - Flag any regressions
   - Calculate test coverage

**Test Coverage**:
- **Happy Path**: Primary user workflows
- **Edge Cases**: Error scenarios, boundary conditions
- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **Mobile**: Touch targets, responsive design
- **Accessibility**: Screen reader validation

### 2. Visual Regression Testing
**File**: `workflows/visual-regression-testing.md`

**Multimodal Capabilities**:
- **Tools**: @anthropic-ai/claude-code (vision model) + Playwright screenshots
- **Workflow**:
  1. Capture baseline screenshots
  2. Implement feature changes
  3. Capture new screenshots
  4. Use vision model to detect differences
  5. Flag unexpected UI changes
  6. Generate visual diff report

**Visual Comparison**:
- Layout changes detection
- Color shift identification
- Typography validation
- Spacing and alignment checks
- Component rendering verification

### 3. Real API Testing
**File**: `workflows/real-api-testing.md`

**API Keys** (User-Provided):
```yaml
api_keys:
  gemini:
    key: "USER_PROVIDED_KEY"
    quota:
      max_requests_per_day: 1000
      current_usage: 0
      last_reset: "2026-01-06T00:00:00+07:00"
    cost_tracking:
      estimated_cost_per_request: 0.0001  # USD
      daily_budget: 10.0  # USD
      current_spend: 0.0
      budget_alert_threshold: 8.0  # Alert at 80%

  openrouter:
    key: "USER_PROVIDED_KEY"
    quota:
      max_requests_per_day: 500
      current_usage: 0
    cost_tracking:
      estimated_cost_per_request: 0.002  # USD
      daily_budget: 5.0  # USD
      current_spend: 0.0
```

**Security Protocols**:
- NEVER log keys in output
- NEVER include in handoff artifacts
- Load from YAML config (not environment)
- Validate key format before use
- Track usage to prevent exhaustion
- Alert when budget exceeded

**Testing Strategy**:
- **Rate Limiting**: Respect API rate limits (60 req/min for Gemini, 30 req/min for OpenRouter)
- **Quota Management**: Track daily usage, prevent exhaustion
- **Cost Alerts**: Notify at 80% budget, pause at 100%
- **Fallback**: Graceful degradation if quota exhausted
- **Real Responses**: Validate actual API responses, not mocks

---

## Configuration Files

### 1. API Keys Configuration
**File**: `config/api-keys-prod.yaml`
**Git Status**: `.gitignore` entry required (NEVER commit to git)
**Purpose**: User-provided production keys for real-world testing

**Structure**:
```yaml
api_keys:
  gemini:
    key: "YOUR_GEMINI_API_KEY_HERE"  # Replace with actual key
    purpose: "Real AI model testing"
    provider: "Google"
    quota: {...}
    cost_tracking: {...}
    rate_limiting: {...}
    status: "ACTIVE"  # ACTIVE | SUSPENDED | EXHAUSTED

  openrouter:
    key: "YOUR_OPENROUTER_API_KEY_HERE"  # Replace with actual key
    purpose: "Multi-model routing testing"
    provider: "OpenRouter"
    quota: {...}
    cost_tracking: {...}
    rate_limiting: {...}
    status: "ACTIVE"

security:
  - "NEVER log keys in output"
  - "NEVER include in handoff artifacts"
  - "Load from YAML config only"
  - "Validate key format before use"
  - "Track usage to prevent exhaustion"
```

**Quota Management**:
- **Daily Reset**: Midnight automatic reset
- **Budget Alerts**: Warning at 80%, Critical at 95%, Exhausted at 100%
- **Usage Tracking**: Every API call logged
- **Cost Optimization**: Batch requests, cache responses, use cheaper models

### 2. MCP Server Configuration
**File**: `config/mcp-servers.yaml`

**MCP Integrations**:
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

  zai-mcp-server:
    purpose: "Multimodal visual analysis"
    capabilities:
      - "UI screenshot comparison"
      - "Data visualization analysis"
      - "Error screenshot diagnosis"
      - "Video content analysis"
```

---

## Integration Points

### Module Dependencies
**Consumes From**:
- Sprint Execution Module (stories ready for testing)
- Architecture Refactoring Module (remediated code validation)

**Provides To**:
- All modules (test reports, validation results)
- Core Governance Module (health metrics from testing)

### Platform Integration
**Cross-Platform Testing**:
- Test in Claude Code environment
- Test in Open Code environment
- Validate cross-platform synchronization
- Verify state management consistency

### Browser Testing Matrix
| Browser | Version | Platform | Priority |
|---------|---------|----------|----------|
| Chrome | Latest | Desktop/Linux | P0 |
| Firefox | Latest | Desktop/Linux | P0 |
| Safari | Latest | macOS | P1 |
| Edge | Latest | Windows | P1 |
| Mobile Safari | Latest | iOS | P2 |
| Chrome Mobile | Latest | Android | P2 |

---

## Artifacts Created

### Test Reports
- `artifacts/test-reports/e2e-test-report-{date}.md`
- `artifacts/test-reports/visual-regression-{date}.md`
- `artifacts/test-reports/api-testing-report-{date}.md`
- `artifacts/test-reports/performance-report-{date}.md`

### Screenshots & Evidence
- `artifacts/screenshots/baseline/{feature}/{step}.png`
- `artifacts/screenshots/actual/{feature}/{step}.png`
- `artifacts/screenshots/diffs/{feature}/{step}-diff.png`

### Usage Tracking
- `artifacts/usage-reports/api-usage-{date}.md`
- `artifacts/usage-reports/cost-tracking-{date}.md`
- `artifacts/usage-reports/quota-alerts-{date}.md`

### Validation Results
- `artifacts/validation/{story_id}-validation.md`
- `artifacts/validation/cross-platform-sync-{date}.md`
- `artifacts/validation/accessibility-audit-{date}.md`

---

## Quality Metrics

### Test Coverage
- **Target**: ≥80% code coverage
- **Measurement**: Test report coverage percentage
- **Focus**: Critical paths, user journeys, edge cases

### Real-World Validation
- **Target**: 100% real API testing (0% mocks)
- **Measurement**: API call verification in test logs
- **Enforcement**: Blocked if mocks detected

### Visual Regression
- **Target**: 0% unexpected UI changes
- **Measurement**: Visual diff report
- **Enforcement**: Manual review required for changes

### Performance Targets
- **Load Time**: <2 seconds for initial page load
- **Response Time**: <500ms for API calls
- **Frame Rate**: >60 FPS for animations
- **Memory**: No leaks detected in 10-minute session

---

## Success Criteria

✅ **Completed**:
1. Module creation (new module, not merged)
2. Directory structure created
3. api-keys-prod.yaml configuration (gitignored)
4. MANIFEST.md documentation

🔄 **In Progress**:
1. Real-world validator agent creation
2. Browser automation suite workflow
3. Visual regression testing workflow
4. MCP server integration setup

⏳ **Pending**:
1. Playwright MCP configuration
2. ChromeDev MCP configuration
3. Test report templates
4. Usage tracking automation
5. Cost alert system

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-06 | BMAD Framework Transformation - New module created |

---

## Related Files

- **Governance**: `_bmad/modules/core-governance/` (platform routing for testing)
- **Sprint**: `_bmad/modules/sprint-execution/` (stories requiring validation)
- **Architecture**: `_bmad/modules/architecture-refactoring/` (remediation validation)
- **Transformation Plan**: `/Users/apple/.claude/plans/valiant-purring-tower.md`

---

**Module Status**: ✅ ACTIVE (new module)
**Next Review**: 2026-02-06 (30 days)
**Maintainer**: BMAD-Core-Master (orchestrates via real-world-validator)
