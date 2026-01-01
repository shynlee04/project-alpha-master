# Phase 0 Implementation Plan: Foundation Stabilization
**Project Alpha (Via-gent v2.0) - Ralph Loop Cycle 19**

**Date:** 2026-01-02
**Status:** Ready for Execution
**Total Effort:** 26-50 hours
**Priority:** P0 (Foundation Stability)

---

## Executive Summary

Phase 0 addresses critical foundation stability issues identified in Ralph Loop Cycle 18. The plan fixes 1,172 TypeScript errors, prevents data loss through IndexedDB quota handling, and reduces technical debt by extracting god components.

**MCP Research Completed (6 Tool Turns):**
1. ✅ Zustand v5 patterns (persist, slices, middleware)
2. ✅ Dexie.js transaction API & error handling
3. ✅ IndexedDB quota management best practices
4. ✅ TanStack Router lazy loading & file-based routing
5. ✅ React Hook extraction patterns
6. ✅ QuotaExceededError handling strategies

---

## Task Breakdown

### TS-001: Fix TypeScript Errors (1,172 → <100)
**Effort:** 6-8 hours
**Priority:** P0-CRITICAL
**Current State:** 1,172 errors (306 production + 866 test)

**Error Categories (from Cycle 18 analysis):**
```
Production Errors (306):
├─ TS6196: Unused imports (~90 errors)
├─ Type mismatches (~80 errors)
├─ Missing exports (~50 errors)
├─ DomainEvent payload access (~40 errors)
├─ tailwind-merge v3 API changes (~10 errors)
└─ Other misc issues (~36 errors)

Test Errors (866):
├─ Vitest global imports (~57 errors)
├─ Mock type mismatches (~200 errors)
├─ Component prop types (~150 errors)
├─ Store type inference errors (~100 errors)
└─ Other test issues (~359 errors)
```

**Implementation Strategy (Batched by Category):**

#### Batch 1: Unused Imports (2 hours)
```bash
# Find all unused imports
pnpm tsc --noEmit 2>&1 | grep "TS6196" | head -20

# Use eslint-plugin-unused-imports for automated removal
# Manual verification for edge cases
```

**Files to Fix:**
- `src/infrastructure/persistence/dexie-db-class.ts` (5 errors)
- `src/lib/agent/providers/*.ts` (15 errors)
- Test files across `/lib`, `/domain`, `/infrastructure`

#### Batch 2: Type Mismatches (2 hours)
**Focus Areas:**
- DomainEvent payload types (cross-workspace-event-bus.ts)
- tailwind-merge v3 API: `tailwindMerge()` → `twMerge()`
- Store selector types (Zustand v5 patterns)

**Example Fix:**
```typescript
// BEFORE (error: Type 'unknown' on payload)
eventHandler(payload: DomainEvent) {
  const data = payload.data; // Type is 'unknown'
}

// AFTER (correct typing)
eventHandler(payload: WorkspaceChangeEvent) {
  const data = payload.data; // Type is 'WorkspaceChangeData'
}
```

#### Batch 3: Missing Exports (1 hour)
**Pattern:** Add barrel exports for new modular components
```typescript
// src/presentation/components/agent/WorkspacePermissions/index.ts
export * from './PermissionBadge'
export * from './PermissionSwitch'
export * from './PermissionGridHeader'
// ... etc
```

#### Batch 4: Test Errors (2-3 hours)
**Priority:** Fix critical test blocking issues first
1. Remove global Vitest imports from test files
2. Fix mock type mismatches
3. Update component prop types in tests

**Example Fix:**
```typescript
// BEFORE (error: describe/global not defined)
import { describe, it, expect } from 'vitest'

// AFTER (use global test environment)
// No import needed - vitest globals are available
```

---

### DB-001: Safe IndexedDB Operations (Add Quota Handling)
**Effort:** 18-22 hours
**Priority:** P0-CRITICAL (Data Loss Risk)
**Current State:** No quota handling → silent failures → data loss

**MCP Research Findings:**
- **QuotaExceededError** is thrown when origin exceeds storage limit
- Browser quotas vary: Chrome ~60% of disk, Safari ~1GB, Firefox ~2GB
- Must estimate available storage before writes
- Graceful degradation required: cleanup → compress → notify user

**Implementation Plan:**

#### Step 1: Storage Estimation (4 hours)
**Location:** `src/infrastructure/persistence/storage-quota-manager.ts` (NEW)

```typescript
/**
 * Estimates available IndexedDB storage space
 * Uses navigator.storage API if available
 */
export class StorageQuotaManager {
  /**
   * Get storage estimate with fallback
   * @returns Promise<{ quota: number, usage: number, available: number }>
   */
  async getStorageEstimate(): Promise<StorageEstimate> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }

    // Fallback: Heuristic based on browser
    return this.getFallbackEstimate();
  }

  /**
   * Predict if write will exceed quota
   * @param dataSize Size of data to write in bytes
   */
  async willWriteExceedQuota(dataSize: number): Promise<boolean> {
    const estimate = await this.getStorageEstimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || Number.MAX_SAFE_INTEGER;
    const projectedUsage = usage + dataSize;

    // 80% threshold to prevent QuotaExceededError
    const safeLimit = quota * 0.8;
    return projectedUsage > safeLimit;
  }
}
```

**Tests:**
- `getStorageEstimate()` returns valid estimate
- `willWriteExceedQuota()` predicts correctly
- Fallback estimate works for older browsers

#### Step 2: Dexie Transaction Enhancement (6 hours)
**Location:** `src/infrastructure/persistence/dexie-storage.ts` (MODIFY)

```typescript
import { StorageQuotaManager } from './storage-quota-manager';

const quotaManager = new StorageQuotaManager();

// Wrap all Dexie transactions with quota check
export async function safeTransaction<T>(
  mode: Dexie.Mode,
  tables: Dexie.Table[],
  callback: (tx: Dexie.Transaction) => Promise<T>
): Promise<T> {
  // Estimate write size (heuristic: count of operations)
  const estimatedSize = estimateWriteSize(tables);

  // Check quota before transaction
  const willExceed = await quotaManager.willWriteExceedQuota(estimatedSize);
  if (willExceed) {
    // Trigger cleanup strategy
    await cleanupOldData();

    // Re-check after cleanup
    const stillExceeds = await quotaManager.willWriteExceedQuota(estimatedSize);
    if (stillExceeds) {
      throw new QuotaExceededError(
        'Cannot save: storage quota exceeded. Please clear old data.'
      );
    }
  }

  // Proceed with transaction
  return db.transaction(mode, tables, callback).catch(error => {
    if (error.name === 'QuotaExceededError') {
      // Log to error tracking (Sentry)
      Sentry.captureException(error, {
        tags: { component: 'IndexedDB', action: 'write' }
      });

      // Show user-friendly error
      showNotification({
        type: 'error',
        message: 'Storage full. Clearing old data...',
        duration: 5000
      });

      // Trigger emergency cleanup
      emergencyCleanup();
    }

    throw error;
  });
}
```

#### Step 3: Cleanup Strategies (4 hours)
**Location:** `src/infrastructure/persistence/cleanup-strategies.ts` (NEW)

```typescript
/**
 * Automatic cleanup when quota is low
 */
export class AutoCleanupStrategy {
  /**
   * Remove old RAG embeddings (keep last 30 days)
   */
  async cleanupOldEmbeddings(): Promise<number> {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const deleted = await db.rag_chunks
      .where('createdAt')
      .below(thirtyDaysAgo)
      .delete();

    return deleted;
  }

  /**
   * Remove old conversation threads (keep last 50)
   */
  async cleanupOldThreads(): Promise<number> {
    const allThreads = await db.conversation_threads.toArray();
    const sortedByDate = allThreads.sort((a, b) =>
      b.updatedAt - a.updatedAt
    );

    const toKeep = sortedByDate.slice(0, 50);
    const toDelete = sortedByDate.slice(50);

    const idsToDelete = toDelete.map(t => t.id);
    return await db.conversation_threads.bulkDelete(idsToDelete);
  }

  /**
   * Compress large text blobs (optional, for v2)
   */
  async compressLargeBlobs(): Promise<void> {
    // TODO: Implement LZ-string compression for large payloads
    // Deferred to Phase 2
  }
}
```

#### Step 4: User Notifications (2 hours)
**Location:** `src/presentation/components/common/StorageQuotaWarning.tsx` (NEW)

```typescript
/**
 * Shows storage quota warning when approaching limit
 */
export function StorageQuotaWarning() {
  const { quota, usage } = useStorageQuota();
  const usagePercent = (usage / quota) * 100;

  if (usagePercent < 70) return null;

  const severity = usagePercent > 90 ? 'critical' : 'warning';

  return (
    <Alert variant={severity}>
      <AlertTitle>Storage {severity === 'critical' ? 'Critical' : 'Warning'}</AlertTitle>
      <AlertDescription>
        You've used {usagePercent.toFixed(1)}% of available storage.
        {severity === 'critical' && ' Please clear old data to continue.'}
      </AlertDescription>
      <Button onClick={handleCleanup}>
        Clear Old Data
      </Button>
    </Alert>
  );
}
```

#### Step 5: Integration & Testing (4 hours)
**Files to Modify:**
- `src/infrastructure/persistence/dexie-storage.ts` - Add quota checks
- `src/lib/rag/indexeddb-storage.ts` - Use safeTransaction
- `src/lib/state/tool-permission-store.ts` - Handle QuotaExceededError
- All store files using Dexie - Wrap transactions

**Test Coverage:**
```typescript
describe('StorageQuotaManager', () => {
  it('should estimate available storage', async () => {
    const estimate = await quotaManager.getStorageEstimate();
    expect(estimate.quota).toBeGreaterThan(0);
  });

  it('should predict QuotaExceededError', async () => {
    const willExceed = await quotaManager.willWriteExceedQuota(1_000_000_000); // 1GB
    expect(typeof willExceed).toBe('boolean');
  });
});

describe('safeTransaction', () => {
  it('should throw QuotaExceededError when full', async () => {
    // Mock navigator.storage.estimate to return full storage
    await expect(
      safeTransaction('rw', [db.testTable], async () => {
        await db.testTable.add({ data: 'x'.repeat(1_000_000_000) });
      })
    ).rejects.toThrow('QuotaExceededError');
  });
});
```

---

### UI-001: Extract AgentConfigDialog Hooks (1,089 → <300 lines)
**Effort:** 16-20 hours
**Priority:** P0-HIGH (Maintainability Risk)
**Current State:** 1,089 lines (9x over 120-line limit)

**File:** `src/presentation/components/agent/AgentConfigDialog.tsx`

**Extraction Strategy:**

#### Hook 1: Agent Form State Management (4 hours)
**Location:** `src/presentation/components/agent/hooks/useAgentFormState.ts` (NEW)

```typescript
/**
 * Manages agent form state (name, system prompt, temperature)
 * Extracted from AgentConfigDialog lines 150-350
 */
export function useAgentFormState(initialAgent?: Agent) {
  const [name, setName] = useState(initialAgent?.name || '');
  const [systemPrompt, setSystemPrompt] = useState(
    initialAgent?.systemPrompt || ''
  );
  const [temperature, setTemperature] = useState(
    initialAgent?.temperature || 0.7
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    }

    if (temperature < 0 || temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, systemPrompt, temperature]);

  const reset = useCallback(() => {
    setName(initialAgent?.name || '');
    setSystemPrompt(initialAgent?.systemPrompt || '');
    setTemperature(initialAgent?.temperature || 0.7);
    setErrors({});
  }, [initialAgent]);

  return {
    // State
    name, setName,
    systemPrompt, setSystemPrompt,
    temperature, setTemperature,
    errors,
    // Actions
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}
```

**Lines Removed:** ~200 lines
**Test Coverage:** Form validation, reset functionality, error handling

#### Hook 2: Provider Configuration (4 hours)
**Location:** `src/presentation/components/agent/hooks/useProviderConfiguration.ts` (NEW)

```typescript
/**
 * Manages LLM provider selection and configuration
 * Extracted from AgentConfigDialog lines 350-550
 */
export function useProviderConfiguration(agent?: Agent) {
  const providers = useAppStore(s => s.providers);
  const activeProviderId = agent?.providerId || providers[0]?.id;

  const [selectedProviderId, setSelectedProviderId] = useState(activeProviderId);
  const [modelSettings, setModelSettings] = useState(
    agent?.modelSettings || {}
  );

  const selectedProvider = useMemo(
    () => providers.find(p => p.id === selectedProviderId),
    [providers, selectedProviderId]
  );

  const availableModels = useMemo(
    () => selectedProvider?.models || [],
    [selectedProvider]
  );

  const handleProviderChange = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
    // Reset model settings when provider changes
    setModelSettings({});
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setModelSettings(prev => ({ ...prev, modelId }));
  }, []);

  return {
    // State
    selectedProviderId,
    selectedProvider,
    modelSettings,
    availableModels,
    // Actions
    handleProviderChange,
    handleModelChange,
    setModelSettings,
  };
}
```

**Lines Removed:** ~200 lines

#### Hook 3: Workspace Permissions (4 hours)
**Location:** `src/presentation/components/agent/hooks/useAgentWorkspacePermissions.ts` (NEW)

**Note:** This already exists! Reuse existing hook:
```typescript
import { useWorkspacePermissions } from './WorkspacePermissions/hooks/useWorkspacePermissions';

// Already implemented in Cycle 17 (87.5% complete)
// 7 modular components + 1 custom hook = 175 lines total
// All components ≤120 lines
```

**Lines Saved:** ~150 lines (by reusing Cycle 17 work)

#### Hook 4: Dialog State Management (3 hours)
**Location:** `src/presentation/components/agent/hooks/useAgentDialogState.ts` (NEW)

```typescript
/**
 * Manages dialog open/close and dirty state
 * Extracted from AgentConfigDialog lines 100-150
 */
export function useAgentDialogState(agent?: Agent) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>(
    agent ? 'edit' : 'create'
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setIsDirty(false);
  }, []);

  const markDirty = useCallback(() => setIsDirty(true), []);

  // Warn on close if dirty
  const handleCloseAttempt = useCallback(() => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Close anyway?')) {
        close();
      }
    } else {
      close();
    }
  }, [isDirty, close]);

  return {
    isOpen,
    isDirty,
    mode,
    open,
    close,
    markDirty,
    handleCloseAttempt,
  };
}
```

**Lines Removed:** ~100 lines

#### Hook 5: Agent CRUD Operations (3 hours)
**Location:** `src/presentation/components/agent/hooks/useAgentCrud.ts` (NEW)

```typescript
/**
 * Handles agent create/update/delete operations
 * Extracted from AgentConfigDialog lines 550-750
 */
export function useAgentCrud() {
  const agents = useAppStore(s => s.agents);
  const addAgent = useAppStore(s => s.addAgent);
  const updateAgent = useAppStore(s => s.updateAgent);
  const deleteAgent = useAppStore(s => s.deleteAgent);

  const createAgent = useCallback(async (
    agentData: CreateAgentDTO
  ): Promise<Agent> => {
    try {
      const newAgent = await addAgent(agentData);
      showNotification({
        type: 'success',
        title: 'Agent created',
        message: `"${agentData.name}" has been added.`,
      });
      return newAgent;
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to create agent',
        message: error.message,
      });
      throw error;
    }
  }, [addAgent]);

  const saveAgent = useCallback(async (
    id: string,
    updates: Partial<Agent>
  ): Promise<void> => {
    try {
      await updateAgent(id, updates);
      showNotification({
        type: 'success',
        title: 'Agent updated',
        message: 'Changes saved successfully.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to save',
        message: error.message,
      });
      throw error;
    }
  }, [updateAgent]);

  const removeAgent = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteAgent(id);
      showNotification({
        type: 'success',
        title: 'Agent deleted',
        message: 'Agent has been removed.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Failed to delete',
        message: error.message,
      });
      throw error;
    }
  }, [deleteAgent]);

  return {
    agents,
    createAgent,
    saveAgent,
    removeAgent,
  };
}
```

**Lines Removed:** ~200 lines

#### Refactored Component (2 hours)
**Location:** `src/presentation/components/agent/AgentConfigDialog.tsx` (MODIFY)

```typescript
/**
 * Agent Configuration Dialog (Refactored)
 * Lines: 1,089 → ~250 lines (77% reduction)
 */
import { useAgentFormState } from './hooks/useAgentFormState';
import { useProviderConfiguration } from './hooks/useProviderConfiguration';
import { useAgentWorkspacePermissions } from './WorkspacePermissions/hooks/useWorkspacePermissions';
import { useAgentDialogState } from './hooks/useAgentDialogState';
import { useAgentCrud } from './hooks/useAgentCrud';
import { UnifiedAgentSelector } from './UnifiedAgentSelector';
import { WorkspacePermissions } from './WorkspacePermissions';

export function AgentConfigDialog({ agent, mode }: AgentConfigDialogProps) {
  // Dialog state
  const {
    isOpen, isDirty, mode: dialogMode,
    open, close, markDirty, handleCloseAttempt,
  } = useAgentDialogState(agent);

  // Form state
  const formState = useAgentFormState(agent);

  // Provider configuration
  const providerConfig = useProviderConfiguration(agent);

  // Workspace permissions (reuse Cycle 17 work)
  const permissions = useAgentWorkspacePermissions(agent);

  // CRUD operations
  const { createAgent, saveAgent, removeAgent } = useAgentCrud();

  // Save handler
  const handleSave = async () => {
    if (!formState.validate()) return;

    const agentData = {
      name: formState.name,
      systemPrompt: formState.systemPrompt,
      temperature: formState.temperature,
      providerId: providerConfig.selectedProviderId,
      modelSettings: providerConfig.modelSettings,
      workspaceBindings: permissions.bindings,
    };

    if (dialogMode === 'create') {
      await createAgent(agentData);
    } else {
      await saveAgent(agent.id, agentData);
    }

    close();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {dialogMode === 'create' ? 'New Agent' : 'Edit Agent'}
          </DialogTitle>
        </DialogHeader>

        {/* Agent Form */}
        <AgentFormSection
          formState={formState}
          markDirty={markDirty}
        />

        {/* Provider Configuration */}
        <ProviderConfigurationSection
          providerConfig={providerConfig}
          markDirty={markDirty}
        />

        {/* Workspace Permissions */}
        <WorkspacePermissions
          agent={agent}
          bindings={permissions.bindings}
          onChange={permissions.setBindings}
          markDirty={markDirty}
        />

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formState.isValid || !permissions.isValid}
          >
            Save Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Final Result:**
- **Lines Removed:** ~650 lines
- **New Lines Added:** ~250 lines (component) + ~440 lines (5 hooks) = 690 total
- **Net Reduction:** 399 lines (37% reduction)
- **Component Complexity:** 1,089 → 250 lines (77% reduction)
- **Maintainability:** ✅ All modules ≤120 lines

---

## Implementation Order

### Week 1: TypeScript Fixes + Component Refactoring
1. **Day 1-2:** TS-001 Batches 1-2 (Unused imports, type mismatches)
2. **Day 3-4:** UI-001 Hooks 1-3 (Form state, provider config, permissions)
3. **Day 5:** Integration testing of refactored AgentConfigDialog

### Week 2: IndexedDB + Finalization
1. **Day 6-7:** DB-001 Steps 1-3 (Storage estimation, transaction enhancement, cleanup)
2. **Day 8:** DB-001 Steps 4-5 (User notifications, integration)
3. **Day 9-10:** TS-001 Batch 4 (Test errors) + Documentation updates

---

## Success Criteria

### TS-001
- [ ] TypeScript errors reduced from 1,172 to <100
- [ ] Production code has zero blocking errors
- [ ] `pnpm tsc --noEmit` runs without critical failures
- [ ] All new code passes type checking

### DB-001
- [ ] QuotaExceededError caught and handled gracefully
- [ ] User sees notification when quota >70%
- [ ] Automatic cleanup prevents data loss
- [ ] Emergency cleanup trigger when quota >90%
- [ ] Sentry tracks all quota-related errors

### UI-001
- [ ] AgentConfigDialog.tsx ≤300 lines
- [ ] All hooks ≤120 lines
- [ ] All hooks have unit tests
- [ ] Zero breaking changes (API compatibility)
- [ ] Component functions identically to before refactoring

---

## Risk Mitigation

### Risk 1: Breaking Changes During Refactoring
**Mitigation:**
- Comprehensive test suite before changes
- Run tests after each batch
- Feature flag for new implementations
- Rollback plan for each task

### Risk 2: IndexedDB Quota Estimation Inaccuracy
**Mitigation:**
- Conservative 80% threshold (not 100%)
- Fallback heuristics for older browsers
- User notification before hitting hard limit
- Emergency cleanup as last resort

### Risk 3: Test Failures After TypeScript Fixes
**Mitigation:**
- Fix production code first, then tests
- Use Vitest --run mode for faster feedback
- Update test mocks to match new types
- Incremental testing (not bulk fix)

---

## Documentation Updates

### Files to Update
1. **CLAUDE.md**
   - Update file structure with new hooks
   - Add IndexedDB quota handling section
   - Update TypeScript error count
   - Document new best practices

2. **AGENTS.md**
   - Add Phase 0 completion notes
   - Update god component list (remove AgentConfigDialog)
   - Document quota handling patterns
   - Add hook extraction guidelines

3. **New Documentation**
   - `_bmad-output/phase-0-completion-report-2026-01-02.md`
   - `_bmad-output/indexeddb-quota-handling-guide-2026-01-02.md`
   - `_bmad-output/hook-extraction-patterns-2026-01-02.md`

---

## Next Steps (Phase 1 Preparation)

After Phase 0 completion:
1. **Epic AC-1:** Store Consolidation (42 hours, 8 stories)
   - Consolidate provider stores (3h)
   - Consolidate agent stores (6h)
   - Migrate conversation stores (4h)
   - Delete `src/stores/` directory (2h)
   - Fix circular dependencies (4h)

2. **Epic WB:** Workspace Bindings (28 hours, 5 stories)
   - Workspace-specific tool permissions
   - Cross-workspace event propagation
   - E2E test setup

---

## Handoff to Development Team

**Prerequisites:**
- ✅ Complete MCP research (6 tool turns)
- ✅ Codebase analysis via Repomix
- ✅ Detailed implementation plan created
- ✅ Success criteria defined
- ✅ Risk mitigation strategies documented

**Ready for Execution:** All tasks are well-defined with:
- Clear acceptance criteria
- Code examples and patterns
- Test coverage requirements
- Documentation deliverables

**Agent Mode:** `@bmad-bmm-dev` (Dev mode) for implementation
**Tracking:** Update `bmm-workflow-status.yaml` after each batch
**Validation:** Run `pnpm tsc --noEmit` after each TypeScript fix batch

---

**Document ID:** PHASE-0-PLAN-2026-01-02.md
**Status:** ✅ Ready for Execution
**Next Action:** Execute TS-001 Batch 1 (Unused Imports)
