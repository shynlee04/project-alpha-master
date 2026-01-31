# EPIC-E2E-TOOLS: Browser Automation & E2E Testing Framework

**Epic ID**: EPIC-E2E-TOOLS  
**Created**: 2026-01-25  
**Status**: READY_FOR_PLANNING  
**Priority**: P0 (Critical)  
**Estimated Effort**: 4-6 hours  
**Team**: dev-ext (implementation) + real-world-validator (testing)  
**Dependency**: INV-C-E2E-JOURNEYS complete_with_blocker

---

## Executive Summary

Install and configure browser automation infrastructure to enable real-world E2E user journey testing. Currently blocked by lack of Playwright MCP, preventing validation of EPIC-ARCH-03 deliverables.

## Why This Epic?

**Critical Gap Identified**:
- E2E User Journey Investigation (INV-C) could not execute actual browser tests
- Cannot verify user interactions, UI behavior, or feature completeness
- Cannot capture screenshots for issue documentation
- EPIC-ARCH-03 cannot be marked "verified" without E2E validation

**Impact of Not Completing**:
- EPIC-ARCH-03 stays in "e2e_validation_blocked" status
- No confidence in UI/UX implementation
- User journeys unvalidated before production deployment
- Regression testing impossible

## Prerequisites

Before starting this epic, verify:

```bash
# 1. Check if Playwright MCP is available
# (Check available tools for browser automation)

# 2. Verify dev server compiles with 0 errors
pnpm tsc --noEmit
# Expected: 0 errors (already resolved)

# 3. Verify dev server runs without errors
pnpm dev
# Expected: Server starts on http://localhost:3000
```

## Problem Statement

### Current State (After INV-C)

```
✅ WORKING:
- Dev server starts cleanly (0 TypeScript errors)
- All main routes respond HTTP 200 OK
- Server-side functionality verified
- Read-only investigation artifacts generated

❌ BLOCKED:
- No browser automation available
- Cannot execute user journeys
- Cannot capture screenshots
- Cannot validate UI behavior
- Cannot verify feature implementation
```

### Desired State (After This Epic)

```
✅ WORKING:
- Playwright MCP configured for real-world-validator
- Headless browser automation available
- Screenshot capture at test checkpoints
- 5 user journeys fully testable
- E2E validation framework in place
- CI/CD integration ready
```

## Stories

### E2E-TOOLS-01: Install Playwright Dependencies

**Priority**: P0  
**Estimated**: 1-2 hours  
**Acceptance Criteria**:

```yaml
AC_01: Playwright installed
  action: pnpm add -D @playwright/test @playwright/experimental-ct-react
  verify: package.json includes @playwright/test
  verify: node_modules/.bin/playwright exists

AC_02: Browser binaries installed
  action: npx playwright install chromium
  verify: ~/.cache/ms-playwright/chromium exists
  verify: npx playwright install --dry-run shows chromium installed

AC_03: DevTools support
  verify: Playwright can launch headless Chrome
  verify: Playwright can capture screenshots
  verify: Playwright can simulate touch events (for mobile)
```

**Implementation Notes**:
- Start with Chromium only (Firefox/WebKit optional for now)
- Use headless mode for CI/CD
- Keep browser installation fast (~2-3 minutes)

### E2E-TOOLS-02: Create E2E Test Framework

**Priority**: P0  
**Estimated**: 2-3 hours  
**Acceptance Criteria**:

```yaml
AC_01: Playwright config file
  file: playwright.config.ts
  includes: 
    - Viewport presets (Desktop, Tablet, Mobile)
    - Screenshot directory configuration
    - Timeout settings
    - Test reporters

AC_02: Test utilities
  file: src/e2e/utils/browser.ts
  functions:
    - navigateTo(path: string)
    - takeScreenshot(name: string)
    - simulateTouch(element: string, action: string)
    - waitForSelector(selector: string, timeout: number)

AC_03: Device presets
  file: src/e2e/fixtures/devices.ts
  presets:
    - desktop-1920x1080: { width: 1920, height: 1080, device: 'Desktop' }
    - tablet-768x1024: { width: 768, height: 1024, device: 'iPad' }
    - mobile-375x812: { width: 375, height: 812, device: 'iPhone 14' }
```

**Implementation Notes**:
- Follow TanStack Router testing patterns (if available)
- Use page object pattern for cleaner tests
- Make screenshot names descriptive (e.g., "j1-step3-wizard.png")

### E2E-TOOLS-03: Re-Execute E2E User Journey Investigation

**Priority**: P0  
**Estimated**: 2-3 hours  
**Acceptance Criteria**:

```yaml
AC_01: Execute all 5 journeys
  J1: Project Creation (Desktop FSA only)
  J2: Notes CRUD (Desktop, Tablet, Mobile)
  J3: AI Chat (Desktop, Mobile)
  J4: IDE Editing (Desktop FSA only)
  J5: Plugin Switching (Desktop, Tablet, Mobile)

AC_02: Capture screenshots
  each_journey: Minimum 3 screenshots
  naming: j{journey}-step{step}-{description}.png
  location: _bmad-output/investigation-reports/screenshots/e2e-final-{date}/

AC_03: Generate comprehensive report
  file: _bmad-output/investigation-reports/INV-E2E-JOURNEYS-FINAL-{date}.md
  includes:
    - Results matrix with pass/fail status
    - All issues with severity ratings
    - Screenshots referenced for each issue
    - Prioritized remediation recommendations
    - Overall assessment (GREEN/YELLOW/RED)
```

**Success Metrics**:

| Journey | Pass Threshold | Target |
|---------|----------------|--------|
| J1 | 100% steps pass | ✅ 7/7 steps |
| J2 | 80% steps pass | ✅ 12/15 steps |
| J3 | Chat UI + messages work | ✅ 6/8 steps |
| J4 | 100% steps pass | ✅ 7/7 steps |
| J5 | 90% steps pass | ✅ 11/12 steps |

**Overall Assessment**:
- **GREEN**: All journeys pass thresholds, <3 P2 issues
- **YELLOW**: 1-2 journeys below threshold, or 1 P1 issue
- **RED**: Any P0 issue, or 3+ journeys fail

## Definition of Done

For each story:

- [ ] All acceptance criteria met
- [ ] Playwright tests run successfully (`pnpm playwright test`)
- [ ] Screenshots captured correctly
- [ ] TypeScript compiles with 0 errors
- [ ] Documentation updated

For epic completion:

- [ ] All 3 stories completed
- [ ] E2E investigation fully re-executed
- [ ] Comprehensive report generated
- [ ] Remediation backlog created (if issues found)
- [ ] EPIC-ARCH-03 status updated to "e2e_validated" or "remediation_needed"

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Playwright MCP not available in environment | HIGH | Use Playwright CLI directly with bash |
| Browser installation fails | MEDIUM | Retry with different network, use cached binaries |
| Screenshot capture flaky | MEDIUM | Add retry logic, increase timeout |
| Tests timeout on slow CI/CD | MEDIUM | Adjust timeouts, use headless mode |

## Success Criteria

Epic is successful when:

1. ✅ All 5 user journeys can be executed via Playwright
2. ✅ Screenshots are captured at each checkpoint
3. ✅ Comprehensive E2E report is generated
4. ✅ Remediation backlog is created (if issues found)
5. ✅ EPIC-ARCH-03 can be marked as "validated" (with or without remediation)

## Related Artifacts

- **Source Investigation**: `_bmad-output/handoffs/2026-01-25/INV-C-E2E-JOURNEYS-handoff-2026-01-25.md`
- **Partial Report**: `_bmad-output/investigation-reports/INV-E2E-JOURNEYS-UPDATED-2026-01-25.md`
- **Callback**: `_bmad-output/handoffs/2026-01-25/e2e-journeys-final-callback.md`

## Next Steps After Epic

1. **If GREEN**: Mark EPIC-ARCH-03 as "e2e_validated", proceed to EPIC-ARCH-04
2. **If YELLOW**: Assign P0/P1 issues to dev-ext, re-test after fixes
3. **If RED**: Block all work until P0 issues resolved

---

**Last Updated**: 2026-01-25T14:30:00+07:00  
**Author**: bmad-master (orchestrator)  
**Status**: READY_FOR_PLANNING
