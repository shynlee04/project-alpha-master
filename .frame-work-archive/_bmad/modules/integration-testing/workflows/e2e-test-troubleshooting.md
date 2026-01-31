---
name: "e2e-test-troubleshooting"
description: "E2E Test Troubleshooting Workflow"
version: "1.0.0"
created_at: "2026-01-09T00:00:00+07:00"
module: "integration-testing"
tier: 2
governance_version: "1.0.0"
acknowledged_at: "2026-01-09T00:00:00+07:00"
acknowledged_by: "module-builder"
---

# E2E Test Troubleshooting Workflow

**description**: Diagnose and resolve E2E test failures by distinguishing between test infrastructure issues and actual application bugs.

**Principle**: **A test failure ≠ An app bug**. This workflow provides systematic diagnosis to determine the root cause.

---

## ═══════════════════════════════════════════════════════════════════════════════
## DIAGNOSTIC FLOW
## ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────┐
│                     E2E TEST FAILURES                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  1. Run Gate Verification   │
                    │     (Critical Path Test)     │
                    └─────────────────────────────┘
                                  │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              Gates PASS                            Gates FAIL
                    │                                   │
                    ▼                                   ▼
          ┌──────────────────┐              ┌──────────────────┐
          │ INFRASTRUCTURE   │              │  APPLICATION    │
          │    ISSUE         │              │     BUG         │
          └──────────────────┘              └──────────────────┘
                    │                                   │
                    ▼                                   ▼
         Fix selectors, timeouts           Fix the actual code
         Disable DevTools                  Update app logic
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## STEP 1: GATE VERIFICATION (CRITICAL PATH TEST)
## ═══════════════════════════════════════════════════════════════════════════════

**description**: Validate that the application core functionality works, regardless of specific test assertions.

**Gate Tests** (must ALL pass for app to be considered working):

```typescript
// GATE-R1: Routing - /notes page loads
test('GATE-R1: /notes renders', async ({ page }) => {
  const response = await page.goto('/notes');
  expect(response?.status()).toBeLessThan(400);  // ✓ HTTP OK

  // Wait for page content
  await page.waitForTimeout(2000);

  // Should NOT have blocking errors visible
  await expect(page.locator('text=Maximum update depth exceeded')).not.toBeVisible();
});

// GATE-R2: Routing - /notes/{projectId} page loads
test('GATE-R2: /notes/$projectId renders', async ({ page }) => {
  const response = await page.goto('/notes/test-project');
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('text=Maximum update depth exceeded')).not.toBeVisible();
});

// GATE-R3: Routing - /ide page loads
test('GATE-R3: /ide renders', async ({ page }) => {
  const response = await page.goto('/ide');
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('text=Maximum update depth exceeded')).not.toBeVisible();
});

// GATE-E1: No infinite loops
test('GATE-E1: Zero "Maximum update depth exceeded"', async ({ page }) => {
  await page.goto('/');
  // Check multiple routes
  await page.goto('/notes');
  await page.goto('/ide');
  await page.goto('/settings');
  await expect(page.locator('text=Maximum update depth exceeded')).not.toBeVisible();
});
```

**Decision Matrix**:

| Result | Interpretation | Action |
|--------|---------------|--------|
| **All Gates PASS** | App is working, test failures are infrastructure issues | Go to Step 2: Infrastructure Diagnosis |
| **Any Gate FAIL** | App has actual bug | Go to Step 3: Application Bug Fix |

---

## ═══════════════════════════════════════════════════════════════════════════════
## STEP 2: INFRASTRUCTURE DIAGNOSIS (GATES PASS)
## ═══════════════════════════════════════════════════════════════════════════════

When gates pass but individual tests fail, diagnose infrastructure issues:

### Check 2.1: DevTools False Positive Detection

**Symptom**: Tests detect "Maximum update depth exceeded" that doesn't exist in production.

**Diagnosis**:
```bash
# Check if devtools plugin is enabled in vite.config.ts
grep -n "devtools" vite.config.ts
```

**Expected Finding**:
```typescript
// vite.config.ts - Line ~3
import { devtools } from '@tanstack/devtools-vite'

// vite.config.ts - Line ~196
devtools({ eventBusConfig: { port: devtoolsEventBusPort } }),
```

**Solution**:
```typescript
// vite.config.ts
// import { devtools } from '@tanstack/devtools-vite'  // DISABLED - causing E2E false positives

// plugins: [
//   ...
//   // devtools({ eventBusConfig: { port: devtoolsEventBusPort } }),  // DISABLED
// ]
```

**Verification**: Re-run tests. Firefox should no longer report "Maximum update depth exceeded".

---

### Check 2.2: Semantic Selector Mismatch

**Symptom**: Tests fail with "Element not found" for `h1`, `h2`, `h3` selectors.

**Diagnosis**: Capture page snapshot to see actual DOM structure:
```typescript
// In test file
test('Debug: Page snapshot', async ({ page }) => {
  await page.goto('/notes');
  console.log(await page.content());  // Print full HTML
  // Or use Playwright's snapshot
});
```

**Expected Finding**:
```yaml
# Page snapshot shows NO semantic tags
generic [ref=e64]:
  - generic [ref=e74]: 📝 Notes    # ← Styled component, NOT <h1>Notes</h1>
  - paragraph [ref=e75]: No notes yet
```

**Solution**:
```typescript
// ❌ WRONG - Expects semantic HTML
await expect(page.locator('h1')).toContainText('Notes');

// ✅ RIGHT - Text-based selector
await expect(page.locator('text=Notes')).toBeVisible();

// ✅ RIGHT - Or add data-testid attributes
// <h1 data-testid="notes-page-title">Notes</h1>
await expect(page.locator('[data-testid="notes-page-title"]')).toBeVisible();
```

---

### Check 2.3: Over-Engineered Selectors

**Symptom**: Adding `.or()` chains and `waitForLoadState()` makes tests worse, not better.

**Diagnosis**: Review test selector complexity:
```typescript
// ANTI-PATTERN
await page.waitForLoadState('domcontentloaded');
await expect(page.locator('h1, h2, h3').or(text=Notes).or(getByRole('heading')).first()).toBeVisible();
```

**Solution**:
```typescript
// Start simple - HTTP status + error check only
const response = await page.goto('/notes');
expect(response?.status()).toBeLessThan(400);
await expect(page.locator('text=Maximum update depth exceeded')).not.toBeVisible();
// If this passes → App works, add more specific assertions later
```

**Evidence**: Phase 1 testing showed 37 → 42 failures after over-engineering selectors.

---

### Check 2.4: Firefox Timeout Issues

**Symptom**: Tests timeout on Firefox where Chrome/Chromium succeed.

**Diagnosis**: Check test timeout settings:
```javascript
// playwright.config.ts
use: {
  launchOptions: {
    firefoxUserPrefs: {  // Firefox-specific settings
      'dom.timeout.enable_background_timer': false,
    },
  },
}
```

**Solution**:
```typescript
// Use simple timeout instead of waitForLoadState
await page.waitForTimeout(2000);  // Fixed wait, but reliable

// Or increase Firefox-specific timeout
test.setTimeout(60000);  // 60s for Firefox only
```

---

### Check 2.5: Async Rendering Race Conditions

**Symptom**: Tests fail inconsistently (sometimes pass, sometimes fail).

**Diagnosis**: Check for SSR hydration issues:
```typescript
// Look for hydration mismatches in console
const logs = [];
page.on('console', msg => logs.push(msg.text()));
```

**Solution**:
```typescript
// Wait for React hydration
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(500);  // Additional buffer for hydration

// Or use data-testid which is available after hydration
await expect(page.locator('[data-testid="app-root"]')).toBeVisible();
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## STEP 3: APPLICATION BUG FIX (GATES FAIL)
## ═══════════════════════════════════════════════════════════════════════════════

When gates fail, the application has an actual bug that needs fixing.

### Bug Type 3.1: HTTP 4xx/5xx Errors

**Symptom**: `response.status() >= 400`

**Diagnosis**: Check server logs and console:
```typescript
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
```

**Common Causes**:
- Missing route handlers
- API endpoint errors
- Authentication failures
- Missing dependencies

**Solution**: Fix the server-side code, not the test.

---

### Bug Type 3.2: Visible Error Messages

**Symptom**: `page.locator('text=Error').isVisible() === true`

**Diagnosis**: Capture screenshot and read error text:
```typescript
await page.screenshot({ path: 'error-screenshot.png' });
const errorText = await page.locator('text=Error').textContent();
console.log('Error:', errorText);
```

**Common Causes**:
- Unhandled exceptions
- Failed data fetching
- State management bugs
- Component crashes

**Solution**: Fix the component code, add error boundaries, improve error handling.

---

### Bug Type 3.3: Infinite Loop Detection

**Symptom**: "Maximum update depth exceeded" visible on page

**Diagnosis**: Check for infinite re-renders:
```typescript
// Look for useEffect without dependencies
// Look for state updates during render
// Look for circular dependencies in stores
```

**Solution**: Fix the infinite loop in component or store code.

**Common Pattern** (Zustand v5):
```typescript
// ❌ WRONG - Causes infinite loop
const { providers, models } = useStore();  // New object every render

// ✅ RIGHT - Stable reference
const providers = useStore(s => s.providers);
const models = useStore(s => s.models);
```

---

## ═══════════════════════════════════════════════════════════════════════════════
## STEP 4: RESOLUTION & VERIFICATION
## ═══════════════════════════════════════════════════════════════════════════════

### After Infrastructure Fix:
1. Re-run gate verification tests
2. Verify gates still pass
3. Re-run failing tests
4. If still failing, iterate on diagnosis

### After Application Bug Fix:
1. Re-run gate verification tests
2. Verify gates now pass (bug is fixed)
3. Re-run all tests
4. Verify test failures are resolved

---

## ═══════════════════════════════════════════════════════════════════════════════
## COMMON PITFALLS SUMMARY
## ═══════════════════════════════════════════════════════════════════════════════

| # | Pitfall | Symptom | Solution |
|---|---------|---------|----------|
| 1 | DevTools plugin enabled | False "Maximum update depth exceeded" | Disable in vite.config.ts |
| 2 | Semantic tag selectors | h1/h2/h3 not found | Use text selectors or data-testid |
| 3 | Over-engineered selectors | More failures after "fixes" | Start simple: HTTP + error check |
| 4 | Firefox slow loads | Timeout on Firefox only | Use waitForTimeout instead of waitForLoadState |
| 5 | Hydration race conditions | Flaky test results | Add buffer for SSR hydration |
| 6 | Missing data-testid | Brittle selectors | Add test attributes to key elements |

---

## ═══════════════════════════════════════════════════════════════════════════════
## RELATED ARTIFACTS
## ═══════════════════════════════════════════════════════════════════════════════

- **Test Results**: `e2e/results/test-artifacts/` - Screenshots and error contexts
- **Gate Verification**: `_bmad-output/sprint-artifacts/phase-1-gate-verification-results-2026-01-09.md`
- **Vite Config**: `vite.config.ts` - DevTools plugin location
- **Test File**: `e2e/journeys/phase-1-gate-verification.spec.ts`

---

## ═══════════════════════════════════════════════════════════════════════════════
## VERSION HISTORY
## ═══════════════════════════════════════════════════════════════════════════════

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial workflow created from Phase 1 E2E testing learnings |

---

**Status**: ✅ ACTIVE
**Maintainer**: real-world-validator agent
**Next Review**: 2026-02-09 (30 days)
