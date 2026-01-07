# Spec-Driven Acceptance Criteria - Journey 1 P0/P1 Fixes

**Assessment Date**: 2026-01-07
**Module**: Product Health Skeptical Scan
**Status**: Iteration 1 Complete
**Document ID**: product-health-acceptance-criteria-001

---

## P0-001: SSR Guard Bypass Risk

### Issue
`credentialVault.getCredentials()` returns `null` during SSR without clear error. RAG queries may fail silently if vault not initialized.

### Acceptance Criteria

**AC-001-1: Lazy Initialization Guard**
```gherkin
Given the credential vault has not been initialized
When any code calls credentialVault.getCredentials(providerId)
Then the call should either:
- Automatically initialize the vault (await if needed)
- OR throw a specific error: "Credential vault initializing, please retry"
And the error should be caught by UI layer and shown as user-friendly message
```

**AC-001-2: Client-Side Retry for RAG**
```gherkin
Given a user is on the Knowledge workspace
When they submit their first RAG query
And the vault is not yet initialized
Then the system should:
1. Show temporary "Loading credentials..." state (≤500ms)
2. Auto-retry credential retrieval up to 3 times
3. If still failing after 3 retries, show: "Secure storage initializing. Please try again in a moment."
And the user should NOT see:
- Blank response
- "Key not found" error
- Silent failure
```

**AC-001-3: Preload on Knowledge Workspace Entry**
```gherkin
Given a user navigates to the Knowledge workspace
When the workspace component mounts
Then the system should:
1. Call credentialVault.initialize() immediately (fire-and-forget)
2. Show RAG interface immediately (no blocking)
3. If credentials not ready within 2 seconds, show inline "Syncing..." indicator
And RAG queries should work immediately if vault was already initialized
```

### Implementation Hints
- **File**: `src/lib/agent/providers/credential-vault.ts:416-449`
- **Pattern**: Add `private initializing: Promise<void> | null = null`
- **Change**: Wrap `initialize()` call with `this.initializing ||= this.initialize()`

---

## P0-002: Connection Test Timeout

### Issue
`ProviderAdapterFactory.testConnection()` has no timeout. Invalid keys cause indefinite hangs.

### Acceptance Criteria

**AC-002-1: 10-Second Timeout on Connection Test**
```gherkin
Given a user clicks "Save" with an API key
When the system tests the connection
Then the test should complete within 10 seconds maximum
And within that time, the UI should show:
- Spinner with "Testing connection..."
- Countdown timer or progress indicator (optional but recommended)
And if timeout occurs, treat as: "Connection failed - please check your key and try again"
```

**AC-002-2: Distinguish 401 vs Timeout**
```gherkin
Given a user enters an invalid API key
When the connection test runs
If the API returns 401 Unauthorized
Then show: "Invalid API key - please check and try again"
If the connection times out
Then show: "Connection timed out - please check your network and try again"
If the API returns other error
Then show the actual error message from the API
```

**AC-002-3: Spinner State**
```gherkin
Given a user is saving a provider configuration
While the connection test is in progress
Then the Save button should be disabled
And there should be a visible loading indicator
And the cursor should show "wait" or "not-allowed"
And user should NOT be able to close the dialog
```

### Implementation Hints
- **File**: `src/lib/agent/providers/provider-adapter.ts`
- **Pattern**: Wrap `testConnection()` in `Promise.race()` with timeout
- **Timeout Value**: 10000ms (10 seconds)

---

## P0-003: Key Format Validation

### Issue
No validation of API key format before storage. Users can save garbage keys.

### Acceptance Criteria

**AC-003-1: Gemini Key Format Check**
```gherkin
Given a user enters a key in the Gemini provider config
When the key does not match expected format (AIza...)
Then before saving, show a warning dialog:
"Warning: This key doesn't look like a valid Gemini API key.
Gemini API keys typically start with 'AIza'.
Are you sure you want to continue?"
And user can:
- Click "Cancel" to edit the key
- Click "Save Anyway" to proceed
```

**AC-003-2: OpenAI Key Format Check**
```gherkin
Given a user enters a key in the OpenAI provider config
When the key does not match expected format (sk-...)
Then show similar warning dialog for OpenAI
```

**AC-003-3: Custom Provider Skip**
```gherkin
Given a user is adding a custom OpenAI-compatible provider
When they enter an API key
Then do NOT show format validation (custom endpoints may use any format)
And allow saving immediately
```

### Implementation Hints
- **File**: `src/presentation/components/agent/ProviderConfigDialog.tsx`
- **Pattern**: Add `validateKeyFormat(providerId, key)` function
- **Regex**: `^AIza` for Gemini, `^sk-` for OpenAI, `^sk-ant` for Anthropic

---

## P1-001: Progress Indicator During Model Fetch

### Issue
Model fetch shows spinner with no progress indication. User uncertain about duration.

### Acceptance Criteria

**AC-P1-001-1: Estimated Time or Progress**
```gherkin
Given a user saves a new API key
When models are being fetched
Then show one of:
- Estimated time remaining (e.g., "About 5 seconds left")
- Progress bar with percentage
- Animated spinner with "Fetching models..." text
And the indicator should be in the dialog content area
```

**AC-P1-001-2: Skeleton Loading State**
```gherkin
Given a user has previously configured a provider
When they reopen the provider config dialog
Then show skeleton loader where models list will appear
And keep skeleton until models are loaded
And allow user to close dialog before models load (with confirmation)
```

### Implementation Hints
- **File**: `src/presentation/components/agent/ProviderConfigDialog.tsx:336-341`
- **Component**: Already has `ModelLoadingSpinner` - enhance with progress

---

## P1-002: RAG Empty State Guidance

### Issue
First-time Knowledge workspace users see no guidance on how to start RAG.

### Acceptance Criteria

**AC-P1-002-1: Empty State with CTA**
```gherkin
Given a user visits the Knowledge workspace
When they have no sources indexed
Then show empty state with:
- Icon representing document/sources
- Headline: "Start building your knowledge base"
- Description: "Add documents, URLs, or notes to enable AI-powered search and synthesis"
- Primary button: "Add your first source"
- Secondary button: "Learn more" (links to docs)
```

**AC-P1-002-2: Source Types Available**
```gherkin
Given user clicks "Add your first source"
When the source picker opens
Then show available options:
- Upload PDF document
- Import from URL
- Create new note
- Select from existing notes
And each option should have icon and brief description
```

### Implementation Hints
- **File**: `src/presentation/components/knowledge/KnowledgePage.tsx`
- **Pattern**: Check `ragIndexSlice.documentCount === 0` and render empty state

---

## P1-003: Credential Vault Cryptic Errors

### Issue
Vault errors leak implementation details like "Vault not initialized".

### Acceptance Criteria

**AC-P1-003-1: User-Friendly Vault Errors**
```gherkin
Given the credential vault encounters an error
When the error is displayed to the user
Then translate technical messages to user-friendly:
- "Vault not initialized" → "Secure storage is still loading. Please wait a moment and try again."
- "Decryption failed" → "We couldn't read your saved API key. Please re-enter it."
- "Storage quota exceeded" → "Your browser's storage is full. Try clearing some data."
- "IndexedDB unavailable" → "Your browser doesn't support secure storage. Try a different browser."
```

**AC-P1-003-2: Recovery Actions**
```gherkin
Given a user sees a credential error
When the error has a recovery action
Then show the action button:
- "Re-enter key" (for decryption errors)
- "Clear and retry" (for storage errors)
- "Reload page" (for initialization errors)
And after recovery, verify the key works before dismissing
```

### Implementation Hints
- **File**: `src/lib/agent/providers/credential-vault.ts` error throwing
- **Pattern**: Wrap errors in UI layer with `try/catch` and user message mapping

---

## Test Cases for QA Verification

### Playwright Test Suite

```typescript
// journey-1-first-time-user.spec.ts

test.describe('Journey 1: First-Time User', () => {
  test('P0-001: SSR guard - credentials load after hydration', async ({ page }) => {
    await page.goto('/knowledge');
    await page.waitForSelector('[data-testid="rag-interface"]');
    // Should not show credential error
    await expect(page.locator('text=Vault not initialized')).not.toBeVisible();
  });

  test('P0-002: Connection test times out after 10s', async ({ page }) => {
    await page.goto('/settings/providers');
    await page.click('text=Configure >> nth=0'); // Google/Gemini
    await page.fill('input[type="password"]', 'invalid-key-12345');
    await page.click('button:has-text("Save")');
    
    // Should show timeout or error within 15s
    await expect(page.locator('text=Testing connection')).toBeVisible();
    await expect(page.locator('text=Connection failed')).toBeVisible({ timeout: 15000 });
  });

  test('P0-003: Format warning for invalid key', async ({ page }) => {
    await page.goto('/settings/providers');
    await page.click('text=Configure >> nth=0'); // Google/Gemini
    await page.fill('input[type="password"]', 'not-a-valid-key-format');
    await page.click('button:has-text("Save")');
    
    // Should show warning dialog
    await expect(page.locator('text=doesn\'t look like a valid')).toBeVisible();
  });

  test('P1-001: Model fetch shows progress', async ({ page }) => {
    await page.goto('/settings/providers');
    await page.click('text=Configure >> nth=0');
    await page.fill('input[type="password"]', process.env.VALID_GEMINI_KEY!);
    
    // Should show loading indicator
    await expect(page.locator('text=Fetching models')).toBeVisible();
  });

  test('P1-002: Knowledge workspace shows empty state', async ({ page }) => {
    // Clear all sources first
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('via-gent-db');
    });
    await page.goto('/knowledge');
    
    // Should show empty state with CTA
    await expect(page.locator('text=Start building your knowledge base')).toBeVisible();
    await expect(page.locator('text=Add your first source')).toBeVisible();
  });
});
```

---

## Severity Summary

| ID | Severity | Estimated Fix Time | Dependencies |
|----|----------|-------------------|--------------|
| P0-001 | Critical | 2-3 hours | None |
| P0-002 | Critical | 1-2 hours | None |
| P0-003 | Critical | 1 hour | None |
| P1-001 | Major | 2-3 hours | None |
| P1-002 | Major | 2 hours | Design review |
| P1-003 | Major | 1 hour | None |

---

*Generated by BMAD Skeptical PM Assessment*
*Document ID: product-health-acceptance-criteria-001*
