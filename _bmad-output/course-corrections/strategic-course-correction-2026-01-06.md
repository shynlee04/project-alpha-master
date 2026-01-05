# Strategic Course Correction: Verification-First Development
## BMAD Framework Course Correction Document

**Date:** 2026-01-06T02:30:00+07:00  
**Classification:** Architecture-Level Course Correction  
**Impact:** All ongoing sprints, all modules, all teams  
**Authority:** BMAD Master Orchestrator  

---

## Course Correction Summary

| Aspect | Previous Approach | Corrected Approach |
|--------|-------------------|-------------------|
| **Completion Criteria** | Code file exists | E2E test passes |
| **Error Handling** | console.error + return null | Structured error with recovery |
| **User Feedback** | Status indicators exist | Cancel/Pause/Retry mechanisms |
| **i18n** | Some strings use t() | ALL strings use t() |
| **Responsive** | Desktop-first | Mobile-first with breakpoints |
| **Sprint Validation** | Self-attestation | Automated E2E verification |

---

## HALT Current Sprint

### Immediate Actions

1. **STOP** marking any more stories as DONE
2. **FREEZE** the comprehensive-remediation-sprint-2026-01-05.yaml
3. **CREATE** validation suite for each "completed" story
4. **RE-VERIFY** all claimed completions

### Sprint File Status Update

```yaml
# Update to comprehensive-remediation-sprint-2026-01-05.yaml
sprint:
  status: "HALTED_FOR_VERIFICATION"
  halt_reason: "Stories marked complete without E2E validation"
  halt_date: "2026-01-06T02:30:00+07:00"
  resume_condition: "All P0 stories pass E2E validation suite"
```

---

## Phase 0: Verification Infrastructure (Days 1-2)

### Story V-001: Create E2E Validation Suite Framework

**Type:** INFRASTRUCTURE  
**Priority:** P0  
**Hours:** 4  

**Acceptance Criteria:**
- [ ] Playwright installed and configured
- [ ] Test structure mirrors user journeys
- [ ] Each test can run independently
- [ ] Test results stored in `_bmad-output/e2e-results/`

**Files to Create:**
```
e2e/
├── config/
│   └── playwright.config.ts
├── fixtures/
│   ├── test-project.fixture.ts
│   └── test-user.fixture.ts
├── journeys/
│   ├── file-sync.journey.spec.ts
│   ├── api-key-management.journey.spec.ts
│   ├── cross-workspace-agent.journey.spec.ts
│   └── mobile-responsive.journey.spec.ts
└── utils/
    ├── test-assertions.ts
    └── error-capture.ts
```

---

### Story V-002: File Sync E2E Validation Suite

**Type:** VALIDATION  
**Priority:** P0  
**Hours:** 6  
**Validates:** S-007, S-008 (Note-Folder Bridge)  

**Test Cases:**

```typescript
// e2e/journeys/file-sync.journey.spec.ts

describe('File Sync: Notes Workspace', () => {
    
    test('FSA-001: User can mount local folder in Notes', async ({ page }) => {
        // 1. Navigate to Notes workspace
        // 2. Click "Open Folder" button
        // 3. Select test folder with 5 .md files
        // 4. Verify folder picker appears (may need to mock FSA)
        // 5. Verify files appear in sidebar within 5 seconds
        // 6. Verify file count matches expected (5 files)
    });
    
    test('FSA-002: Mounted files can be opened and edited', async ({ page }) => {
        // Prerequisites: FSA-001 passed
        // 1. Click on first file in sidebar
        // 2. Verify editor loads with content
        // 3. Make edit (add line at end)
        // 4. Verify edit is reflected in editor
        // 5. Wait for auto-save (or trigger manual save)
    });
    
    test('FSA-003: Edits persist to local filesystem', async ({ page }) => {
        // Prerequisites: FSA-002 passed
        // 1. Make edit and save
        // 2. Use test utility to read file from mocked FSA
        // 3. Verify edit is present in raw file content
    });
    
    test('FSA-004: External file changes sync to Notes', async ({ page }) => {
        // 1. Mount folder
        // 2. Use test utility to modify file externally
        // 3. Trigger sync or wait for watcher
        // 4. Verify Note content updated
    });
    
    test('FSA-005: New external files appear in sidebar', async ({ page }) => {
        // 1. Mount folder
        // 2. Create new file externally
        // 3. Trigger sync
        // 4. Verify new Note created in sidebar
    });
    
    test('FSA-006: Deleted external files removed from Notes', async ({ page }) => {
        // 1. Mount folder
        // 2. Delete file externally
        // 3. Trigger sync
        // 4. Verify Note removed from sidebar
    });
    
    test('FSA-007: Large folder (100+ files) syncs with progress', async ({ page }) => {
        // 1. Create test folder with 100 .md files
        // 2. Mount folder
        // 3. Verify progress indicator appears
        // 4. Verify progress updates (not stuck at 0%)
        // 5. Verify all files sync within 30 seconds
    });
    
    test('FSA-008: User can cancel long-running sync', async ({ page }) => {
        // 1. Mount large folder
        // 2. While syncing, click "Cancel" button
        // 3. Verify sync stops
        // 4. Verify UI shows "Sync cancelled" message
        // 5. Verify partial sync state is consistent
    });
    
    test('FSA-009: Sync failure shows actionable error', async ({ page }) => {
        // 1. Mount folder
        // 2. Simulate sync failure (e.g., permission revoked)
        // 3. Verify error toast appears
        // 4. Verify error has actionable message
        // 5. Verify retry button works
    });
    
    test('FSA-010: Mobile: File sync works on touch devices', async ({ page }) => {
        // 1. Set viewport to mobile
        // 2. Mount folder
        // 3. Verify touch-friendly UI
        // 4. Verify sync works
    });
});
```

---

### Story V-003: API Key Management E2E Validation Suite

**Type:** VALIDATION  
**Priority:** P0  
**Hours:** 4  
**Validates:** S-001, S-002, S-003 (LLM Model Loading)  

**Test Cases:**

```typescript
// e2e/journeys/api-key-management.journey.spec.ts

describe('API Key Management: Cross-Workspace', () => {
    
    test('KEY-001: User can configure API key in settings', async ({ page }) => {
        // 1. Navigate to Settings
        // 2. Open API Keys section
        // 3. Enter test API key for provider
        // 4. Click Save
        // 5. Verify success toast
        // 6. Verify key indicator shows "Configured"
    });
    
    test('KEY-002: Configured key persists after refresh', async ({ page }) => {
        // Prerequisites: KEY-001 passed
        // 1. Refresh page
        // 2. Navigate to Settings
        // 3. Verify key shows "Configured" (masked)
    });
    
    test('KEY-003: Models load after key configuration', async ({ page }) => {
        // Prerequisites: KEY-001 passed
        // 1. Navigate to Chat
        // 2. Open model selector
        // 3. Verify models list populated (not empty)
        // 4. Verify models have names (not "Loading...")
    });
    
    test('KEY-004: Key works across workspaces', async ({ page }) => {
        // Prerequisites: KEY-001 passed
        // 1. Configure key in IDE workspace
        // 2. Navigate to Notes workspace
        // 3. Open chat panel
        // 4. Open model selector
        // 5. Verify same models available
    });
    
    test('KEY-005: Chat works with configured key', async ({ page }) => {
        // Prerequisites: KEY-003 passed
        // 1. Select model
        // 2. Send message "Hello"
        // 3. Verify response received (not error)
        // May need mock API for CI
    });
    
    test('KEY-006: Invalid key shows clear error', async ({ page }) => {
        // 1. Enter invalid key
        // 2. Attempt to use
        // 3. Verify error message explains "Invalid API key"
        // 4. Verify retry/reconfigure option available
    });
    
    test('KEY-007: SSR does not break key persistence', async ({ page }) => {
        // 1. Configure key
        // 2. Navigate to trigger SSR
        // 3. Return to page
        // 4. Verify key still configured
    });
});
```

---

### Story V-004: Cross-Workspace Agent E2E Validation

**Type:** VALIDATION  
**Priority:** P0  
**Hours:** 4  
**Validates:** S-009 (Agent Selection Persistence)  

**Test Cases:**

```typescript
// e2e/journeys/cross-workspace-agent.journey.spec.ts

describe('Agent Configuration: Cross-Workspace', () => {
    
    test('AGENT-001: Agent selection persists after refresh', async ({ page }) => {
        // 1. Navigate to IDE
        // 2. Select agent "Code Expert"
        // 3. Refresh page
        // 4. Verify "Code Expert" still selected
    });
    
    test('AGENT-002: Per-workspace agent memory', async ({ page }) => {
        // 1. In IDE, select "Code Expert"
        // 2. Navigate to Notes
        // 3. Select "Writing Assistant"
        // 4. Navigate back to IDE
        // 5. Verify "Code Expert" still selected (not "Writing Assistant")
        // 6. Navigate to Notes
        // 7. Verify "Writing Assistant" selected
    });
    
    test('AGENT-003: Agent tool permissions persist', async ({ page }) => {
        // 1. Configure agent with specific tool permissions
        // 2. Refresh page
        // 3. Open agent config
        // 4. Verify permissions unchanged
    });
    
    test('AGENT-004: Agent config changes sync across browsers', async ({ page }) => {
        // Advanced: If using cloud sync
        // Otherwise: Verify IndexedDB persistence
    });
});
```

---

## Phase 1: Error Recovery Architecture (Days 3-4)

### Story ER-001: Define Error Types and Recovery Patterns

**Type:** ARCHITECTURE  
**Priority:** P0  
**Hours:** 3  

**Deliverable:** `src/infrastructure/errors/error-types.ts`

```typescript
// Proposed structure
export interface RecoverableError {
    code: ErrorCode;
    i18nKey: string;
    severity: 'info' | 'warning' | 'error' | 'fatal';
    canRetry: boolean;
    canDismiss: boolean;
    retryDelay?: number;
    context?: Record<string, unknown>;
}

export type ErrorCode = 
    | 'SYNC_PERMISSION_DENIED'
    | 'SYNC_QUOTA_EXCEEDED'
    | 'SYNC_FILE_LOCKED'
    | 'SYNC_NETWORK_ERROR'
    | 'API_KEY_INVALID'
    | 'API_KEY_EXPIRED'
    | 'API_RATE_LIMITED'
    | 'AGENT_CONFIG_INVALID'
    | 'WORKSPACE_INIT_FAILED'
    | 'SSR_OPERATION_INVALID';

export interface ErrorRecovery {
    retryAction?: () => Promise<void>;
    fallbackAction?: () => void;
    dismissAction?: () => void;
}
```

---

### Story ER-002: Create Error Boundary with Recovery UI

**Type:** IMPLEMENTATION  
**Priority:** P0  
**Hours:** 4  

**Component:** `src/presentation/components/common/RecoverableErrorBoundary.tsx`

**Features:**
- Catches errors at workspace level
- Shows structured error message
- Provides recovery buttons
- Supports i18n
- Mobile-friendly layout

---

### Story ER-003: Replace Silent Failures with Error Events

**Type:** IMPLEMENTATION  
**Priority:** P0  
**Hours:** 6  

**Scope:** All files containing `console.error + return` patterns

**Pattern:**
```typescript
// BEFORE (silent failure)
} catch (error) {
    console.error('[Service] Failed:', error);
    return null;
}

// AFTER (structured error)
} catch (error) {
    const recoverableError = createRecoverableError({
        code: 'SYNC_FAILED',
        i18nKey: 'errors.sync.failed',
        severity: 'error',
        canRetry: true,
        context: { operation: 'mount', path: directoryHandle.name }
    });
    
    eventBus.emit('error:recoverable', recoverableError);
    errorStore.addError(recoverableError);
    
    // Return structured error instead of null
    throw recoverableError;
}
```

---

## Phase 2: User Feedback Infrastructure (Days 5-6)

### Story UF-001: Operation Progress Store

**Type:** IMPLEMENTATION  
**Priority:** P0  
**Hours:** 3  

**Store:** `src/infrastructure/persistence/stores/operation-progress-store.ts`

```typescript
interface OperationProgress {
    id: string;
    type: 'file-sync' | 'import' | 'export' | 'ai-generation' | 'rag-indexing';
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    progress: {
        current: number;
        total: number;
        currentItem?: string;
    };
    startedAt: number;
    estimatedCompletion?: number;
    canCancel: boolean;
    canPause: boolean;
}

interface OperationProgressStore {
    operations: Map<string, OperationProgress>;
    
    // Actions
    startOperation: (config: Omit<OperationProgress, 'status' | 'startedAt'>) => string;
    updateProgress: (id: string, current: number, currentItem?: string) => void;
    pauseOperation: (id: string) => void;
    resumeOperation: (id: string) => void;
    cancelOperation: (id: string) => void;
    completeOperation: (id: string) => void;
    failOperation: (id: string, error: RecoverableError) => void;
    
    // Selectors
    getActiveOperations: () => OperationProgress[];
    getOperation: (id: string) => OperationProgress | undefined;
}
```

---

### Story UF-002: Universal Progress Panel

**Type:** IMPLEMENTATION  
**Priority:** P0  
**Hours:** 4  

**Component:** `src/presentation/components/ui/activity-indicators/UniversalProgressPanel.tsx`

**Features:**
- Shows all active operations
- Per-operation progress bar with percentage
- Cancel button (if operation supports)
- Pause/Resume button (if operation supports)
- Clear completed button
- Mobile-responsive layout
- Collapsible/expandable

---

### Story UF-003: Wire File Sync to Progress Store

**Type:** IMPLEMENTATION  
**Priority:** P0  
**Hours:** 3  

**Scope:** Update `NotesFileSyncService` to emit progress events

```typescript
// In NoteFolderBridge.importDirectory()
const files = await this.listMarkdownFiles();
const operationId = operationProgressStore.startOperation({
    id: `sync-${Date.now()}`,
    type: 'file-sync',
    progress: { current: 0, total: files.length },
    canCancel: true,
    canPause: true
});

for (let i = 0; i < files.length; i++) {
    // Check for cancellation
    const operation = operationProgressStore.getOperation(operationId);
    if (operation?.status === 'cancelled') {
        break;
    }
    if (operation?.status === 'paused') {
        await waitForResume(operationId);
    }
    
    operationProgressStore.updateProgress(operationId, i + 1, files[i].name);
    await this.importFile(files[i]);
}

operationProgressStore.completeOperation(operationId);
```

---

## Phase 3: i18n and Responsive (Days 7-8)

### Story I18N-001: Audit and Extract Hardcoded Strings

**Type:** IMPLEMENTATION  
**Priority:** P1  
**Hours:** 4  

**Scope:** All files in `src/presentation/components/notes/`

**Task:**
1. Grep for all string literals
2. Categorize: UI labels, error messages, placeholders
3. Generate keys for extraction
4. Add to `en.json` and `vi.json`

---

### Story I18N-002: Add Missing Vietnamese Translations

**Type:** IMPLEMENTATION  
**Priority:** P1  
**Hours:** 3  

**Scope:** All keys in `en.json` that don't have `vi.json` equivalents

---

### Story RESP-001: Audit and Fix Mobile Layouts

**Type:** IMPLEMENTATION  
**Priority:** P1  
**Hours:** 6  

**Scope:** All pages in a mobile viewport (375px width)

**Process:**
1. Test each page on mobile viewport
2. Identify broken layouts
3. Add `useResponsive` hook usage
4. Create mobile-specific variants if needed
5. Test touch interactions

---

## Verification Gates

### Before Marking ANY Story DONE:

1. **Automated Test Passes**: E2E test suite for that story passes
2. **Manual Smoke Test**: Developer performs user journey manually
3. **Error Path Tested**: Intentionally trigger error, verify recovery
4. **Mobile Checked**: Test on mobile viewport
5. **i18n Verified**: Switch to Vietnamese, verify all text displays

### Gate Checklist (to be added to each story)

```yaml
completion_gate:
  automated_test: false  # E2E test file path
  manual_smoke: false    # Date + initiator
  error_path: false      # Error scenario tested
  mobile_verified: false # Mobile viewport tested
  i18n_verified: false   # Both languages checked
```

---

## Updated Sprint Timeline

| Day | Focus | Stories | Validation |
|-----|-------|---------|------------|
| 1-2 | Verification Infrastructure | V-001 to V-004 | Create test suites |
| 3-4 | Error Recovery Architecture | ER-001 to ER-003 | Test error flows |
| 5-6 | User Feedback Infrastructure | UF-001 to UF-003 | Test progress/cancel |
| 7-8 | i18n and Responsive | I18N-001, I18N-002, RESP-001 | Test both languages + mobile |
| 9-10 | Re-verify S-007, S-008 (File Sync) | Existing stories | E2E suite passes |
| 11-12 | Re-verify S-001, S-002 (API Keys) | Existing stories | E2E suite passes |
| 13-14 | Re-verify S-009 (Agent Persistence) | Existing stories | E2E suite passes |
| 15 | Final Validation + Documentation | All stories | Full regression |

---

## Governance Updates

### After This Course Correction:

1. **Update AGENTS.md** with:
   - New verification requirements
   - E2E test patterns
   - Error handling standards
   - Progress indicator requirements

2. **Update Sprint Template** to include:
   - Verification gate in each story
   - Link to E2E test file
   - Mobile/i18n checkboxes

3. **Update ASGL Module** to:
   - Check for E2E tests before marking DONE
   - Run tests before reporting completion
   - Fail stories that don't have passing tests

---

## Tracking Metadata

```yaml
artifact:
  id: strategic-course-correction-2026-01-06
  type: course-correction
  phase: pre-implementation
  team: platform-a
  agent: bmad-master
  created: 2026-01-06T02:45:00+07:00
  status: PROPOSED
  approval_required: true
  approval_from: user
  blocks:
    - All current sprint work
  unblocks:
    - Verification-first development
    - True E2E integration
```

---

## Approval Request

**To proceed with this course correction, please confirm:**

1. **HALT** the current sprint as proposed
2. **APPROVE** the verification-first approach
3. **ACCEPT** the revised 15-day timeline

Reply with:
- `APPROVED` to proceed
- `MODIFY: [specific changes]` to adjust
- `REJECT: [reason]` to continue with current approach
