# Spec-Driven Acceptance Criteria - Journey 2 P0/P1 Fixes

**Assessment Date**: 2026-01-07
**Module**: Product Health Skeptical Scan
**Status**: Iteration 2 Complete
**Document ID**: product-health-journey-2-acceptance-criteria-001

---

## P0-004: Hydration Race Condition

### Issue
Multiple stores hydrate independently. RAG query may run before credential vault initializes, causing key unavailability.

### Acceptance Criteria

**AC-004-1: Unified Hydration Hook**
```gherkin
Given the app is starting (client-side)
When the root layout renders
Then there should be a single `useHydration()` hook that returns:
- `isHydrated: boolean` (true when all critical stores are ready)
- `hydrationError: Error | null` (any error during hydration)
And critical stores include:
- useAppStore (providers, agents)
- useWorkspaceStore (workspace, project)
- credentialVault (initialized)
```

**AC-004-2: RAG Component Waits for Hydration**
```gherkin
Given the Knowledge workspace is mounted
When RAG components render
If hydration is not complete
Then show skeleton loader with "Loading your knowledge base..."
And NOT attempt any queries
And NOT show error state
And auto-retry hydration check every 100ms until ready
```

**AC-004-3: Maximum Hydration Wait Time**
```gherkin
Given hydration is in progress
When 5 seconds elapse without completion
Then show error state with:
- "Loading is taking longer than expected"
- "Retry" button
- "Clear data and reload" option (in case of corrupted state)
And log hydration failure for debugging
```

### Implementation Hints
- **File**: `src/infrastructure/persistence/stores/use-app-store.ts`
- **Pattern**: Create `hydration-state.ts` with unified hydration tracking
- **Stores**: Add `isCritical` flag to determine which stores block UI

---

## P0-005: IndexedDB Corruption Recovery

### Issue
IndexedDB corruption is detected but not recovered. User loses all data.

### Acceptance Criteria

**AC-005-1: Corruption Detection**
```gherkin
Given IndexedDB is accessed via getDb()
When open() fails with error
Then classify error as:
- "corruption" (version mismatch, schema error)
- "quota" (storage full)
- "transient" (network/timeout)
- "unknown"
And if corruption, trigger recovery flow
```

**AC-005-2: Automatic Recovery Flow**
```gherkin
Given corruption detected
When recovery triggers
Then:
1. Log recovery event with timestamp
2. Delete corrupted database
3. Create new database with schema version tracking
4. Attempt to restore from backup (if exists)
5. Reset stores to initial state
6. Notify user: "Your data was recovered. Some recent changes may have been lost."
```

**AC-005-3: Backup Before Corruption**
```gherkin
Given app is running normally
When stores are persisted
Then create daily backup in localStorage
And keep last 3 backups
And backup includes:
- Providers configuration (without API keys)
- Agents configuration
- Workspace preferences
- Last known good state
```

### Implementation Hints
- **File**: `src/infrastructure/persistence/dexie-db.ts:223-236`
- **Pattern**: Wrap `db.open()` with try/catch and recovery logic
- **Backup**: Use `localStorage` with base64 encoded JSON for lightweight backup

---

## P0-006: Model Cache Persistence

### Issue
Models are re-fetched on every page load, causing unnecessary API calls and delay.

### Acceptance Criteria

**AC-006-1: Cache Models in IndexedDB**
```gherkin
Given models are fetched from provider
When fetch completes successfully
Then store in Dexie `embedding_models` table with:
- providerId
- models (JSON)
- fetchedAt (timestamp)
- ttl (24 hours)
```

**AC-006-2: Cache-First with Background Refresh**
```gherkin
Given app loads with existing model cache
When a provider is selected
If cached models exist AND cache age < 24 hours
Then use cached models immediately
And trigger background refresh
And update cache when refresh completes
If cache missing OR cache age >= 24 hours
Then show loading state while fetching
And cache result when complete
```

**AC-006-3: Cache Invalidation**
```gherkin
Given models are cached
When user clears provider cache
Then remove all cached models for that provider
And force fresh fetch on next access
And user can access this via Settings > Providers > Clear Cache
```

### Implementation Hints
- **File**: `src/infrastructure/persistence/stores/providers/provider-models-slice.ts`
- **Dexie Table**: Already exists `embedding_models` table
- **TTL**: 24 * 60 * 60 * 1000 milliseconds

---

## P1-004: Loading State During Hydration

### Issue
Users see broken/empty UI while stores hydrate. No loading indicator.

### Acceptance Criteria

**AC-P1-004-1: Root Layout Hydration Guard**
```gherkin
Given the app is starting (client-side)
When rendering the root layout
If hydration is not complete
Then show global loading screen with:
- App logo
- "Loading..." text
- Optional: progress bar or spinner
And block navigation until hydration complete
```

**AC-P1-004-2: Per-Component Loading States**
```gherkin
Given hydration is complete
When individual components load
If component data is still fetching (e.g., models)
Then show skeleton loader matching component dimensions
And keep skeleton until data available
And allow user interaction with skeleton (disabled state)
```

**AC-P1-004-3: Hydration Progress**
```gherkin
Given multiple stores are hydrating
When hydration is in progress
Then show progress indicator:
- "Loading your settings..." (app store)
- "Restoring workspace..." (workspace store)
- "Preparing knowledge base..." (RAG store)
And order indicates dependency (critical first)
```

### Implementation Hints
- **File**: `src/routes/__root.tsx` or main layout
- **Hook**: Create `useHydration()` that tracks all stores
- **Design**: Use existing `SkeletonLoader` component

---

## P1-005: Agent Selection Persistence

### Issue
Agent selection may not persist per workspace. User must reselect after switching workspaces.

### Acceptance Criteria

**AC-P1-005-1: Per-Workspace Agent Persistence**
```gherkin
Given an agent is selected in IDE workspace
When user switches to Knowledge workspace
Then the agent selection in Knowledge should be preserved
And when switching back to IDE, original agent is still selected
```

**AC-P1-005-2: Storage Structure**
```gherkin
Given agent selection changes
When persisting state
Then store in Dexie with structure:
{
  workspaceId: "ide" | "knowledge" | "study" | "notes",
  agentId: string,
  selectedAt: timestamp
}
And key: `agent-selection-${workspaceId}`
```

**AC-P1-005-3: Migration from Single Agent**
```gherkin
Given existing users with old single-agent storage
When they first load after update
Then migrate old `activeAgentId` to all workspaces
And show notification: "Your agent preferences have been updated for all workspaces"
```

### Implementation Hints
- **File**: `src/infrastructure/persistence/stores/agents/agent-selection-store.ts`
- **Dexie**: Add to existing `agentConfigs` table or create new table

---

## P1-006: RAG Index Metadata Caching

### Issue
RAG index metadata loaded on every page load. No quick restore if index corrupted.

### Acceptance Criteria

**AC-P1-006-1: Index Metadata Cache**
```gherkin
Given RAG index exists
When index metadata is loaded
Then cache in Dexie `oramaIndexes` table:
- projectId
- documentCount
- lastIndexedAt
- indexSize
- checksum (for integrity)
```

**AC-P1-006-2: Quick Restore from Cache**
```gherkin
Given user navigates to Knowledge workspace
When loading index metadata
If cached metadata exists and checksum valid
Then display cached metadata immediately (instant load)
And verify index integrity in background
If integrity check fails
Then trigger re-indexing with notification
```

**AC-P1-006-3: Index Repair**
```gherkin
Given index integrity check fails
When repair is triggered
Then:
1. Show notification: "Index was corrupted, rebuilding..."
2. Use last known good sources
3. Re-index documents incrementally
4. Update cache when complete
5. Notify user when ready
```

### Implementation Hints
- **File**: `src/infrastructure/persistence/stores/rag/rag-index-slice.ts`
- **Dexie Table**: Already exists `oramaIndexes` table

---

## Test Cases for QA Verification

```typescript
// journey-2-returning-user.spec.ts

test.describe('Journey 2: Returning User', () => {
  test('P0-004: Hydration race condition - RAG waits for vault', async ({ page }) => {
    // Setup: Save provider with valid key
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'valid-gemini-key');
    });
    
    await page.goto('/knowledge');
    
    // Should show loading state, not error
    await expect(page.locator('text=Loading your knowledge base')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Key not found')).not.toBeVisible();
  });

  test('P0-005: IndexedDB corruption recovery', async ({ page }) => {
    // Corrupt IndexedDB
    await page.evaluate(() => {
      indexedDB.deleteDatabase('via-gent-db');
    });
    
    await page.reload();
    
    // Should recover gracefully
    await expect(page.locator('text=Database was recovered')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=crashed')).not.toBeVisible();
  });

  test('P0-006: Model cache persists across reload', async ({ page }) => {
    // Load providers page
    await page.goto('/settings/providers');
    
    // First load - models not cached
    await page.waitForSelector('text=Loading models...');
    
    // Save key and fetch models
    await page.fill('input[type="password"]', process.env.VALID_GEMINI_KEY!);
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=models loaded');
    
    // Reload page
    await page.reload();
    
    // Should show cached models immediately (no loading)
    // Check network tab - should NOT have model fetch request
  });

  test('P1-004: Loading state during hydration', async ({ page }) => {
    await page.goto('/');
    
    // Should show global loading screen
    await expect(page.locator('text=Loading...')).toBeVisible();
    await expect(page.locator('[data-testid=main-content]')).not.toBeVisible();
    
    // After hydration
    await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid=main-content]')).toBeVisible();
  });

  test('P1-005: Agent persists per workspace', async ({ page }) => {
    // Select agent in IDE
    await page.goto('/ide');
    await page.selectOption('[data-testid=agent-selector]', 'agent-1');
    
    // Switch to Knowledge
    await page.click('[data-testid=workspace-switcher] >> text=Knowledge');
    
    // Switch back to IDE
    await page.click('[data-testid=workspace-switcher] >> text=IDE');
    
    // Agent should still be selected
    await expect(page.locator('[data-testid=agent-selector]')).toHaveValue('agent-1');
  });
});
```

---

## Severity Summary

| ID | Severity | Estimated Fix Time | Dependencies |
|----|----------|-------------------|--------------|
| P0-004 | Critical | 3-4 hours | None |
| P0-005 | Critical | 2-3 hours | None |
| P0-006 | Critical | 2 hours | None |
| P1-004 | Major | 2-3 hours | Design review |
| P1-005 | Major | 2 hours | None |
| P1-006 | Major | 3 hours | None |

---

*Generated by BMAD Skeptical PM Assessment*
*Document ID: product-health-journey-2-acceptance-criteria-001*
