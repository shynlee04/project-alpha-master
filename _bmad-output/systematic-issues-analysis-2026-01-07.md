# Systematic Issues Analysis
**Generated**: 2026-01-07T02:40:00+07:00
**Session**: ASGL-20260106-021651-COURSE-CORRECTION
**Trigger**: Verification Gap Analysis - 0 verified / 12 claimed complete

---

## Executive Summary

This document catalogs systematic issues discovered during deep investigation of claimed "production-ready" sprint completions. **Critical finding**: 12 stories marked DONE without end-to-end validation, representing a fundamental breakdown in the Definition of Done.

**Root Issue**: Stories are being marked "DONE" based on code implementation alone, without:
- E2E validation across workspaces
- Cross-workspace state consistency checks
- Actual user journey testing
- Mobile responsive validation
- i18n completeness verification

---

## Category 1: LLM Provider & Agent Configuration Issues

### Issue 1.1: Empty Model Arrays on Provider Initialization

**Severity**: P0 - Blocking
**Location**: [`src/infrastructure/persistence/stores/providers/provider-crud-slice.ts`](src/infrastructure/persistence/stores/providers/provider-crud-slice.ts)

**Problem**:
```typescript
const INITIAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    hasApiKey: false,
    models: [],  // ← EMPTY - models don't load until API key + fetchModels()
    enabled: true,
  },
  // ... anthropic, openai, google all have models: []
]
```

**User Impact**:
- LLM keys don't populate model lists automatically
- User must manually trigger model fetch after entering API key
- No visible feedback that models are loading
- Gemini and OpenRouter providers show empty model dropdowns

**Evidence from codebase**:
- [`provider-models-slice.ts:45-55`](src/infrastructure/persistence/stores/providers/provider-models-slice.ts#L45) has `fetchModels()` but doesn't auto-run on provider enable
- `fetchModels()` loads defaults when no API key, but only if explicitly called
- No automatic `fetchModels()` call in [`ApiKeyInputSection.tsx`](src/components/agent/config/ApiKeyInputSection.tsx) after save

**Story Claimed Complete**: S-018 (LLM Provider Configuration) - **NOT VERIFIED**

---

### Issue 1.2: No User Feedback for Saved API Keys

**Severity**: P1 - High UX Friction
**Location**: [`src/components/agent/config/ApiKeyInputSection.tsx`](src/components/agent/config/ApiKeyInputSection.tsx)

**Problem**:
- User saves API key → no toast notification
- No badge/indicator showing "key configured"
- No loading state while validating key
- Silent failure if key is invalid

**Expected Behavior**:
```typescript
// Should exist but doesn't:
const handleSaveKey = async (key: string) => {
  setSaving(true);
  try {
    await validateAndStoreKey(providerId, key);
    toast.success(`${providerName} API key saved`);
    setHasApiKey(true);
  } catch (error) {
    toast.error('Invalid API key');
  } finally {
    setSaving(false);
  }
}
```

**Actual**: Key saves to encrypted vault but no user-facing confirmation

**Story Claimed Complete**: S-019 (Credential Vault Implementation) - **NOT VERIFIED**

---

### Issue 1.3: SSR Guard Causing Key Regeneration on Vercel

**Severity**: P0 - Production Deployment Breaker
**Location**: [`src/lib/agent/providers/credential-vault.ts`](src/lib/agent/providers/credential-vault.ts)

**Problem**:
```typescript
// Line 45-50 in credential-vault.ts
if (typeof window === 'undefined') {
  console.log('[CredentialVault] SSR detected - skipping initialization');
  return;  // ← Returns undefined on SSR
}
```

**Impact**:
- Each SSR request skips vault initialization
- On hydration, vault is empty → regenerates encryption key
- User's saved keys appear "lost" after page refresh
- Deployment to Vercel breaks credential persistence

**Fix Applied**: FIX-2025-12-31 comment present, but fix is incomplete
**Real Fix Needed**: Persistent key storage in IndexedDB, not in-memory

**Story Claimed Complete**: S-019 - **NOT VERIFIED**

---

## Category 2: File System Synchronization Issues

### Issue 2.1: NoteFolderBridge Silent Error Swallowing (PARTIALLY FIXED)

**Severity**: P0 - Data Loss Risk
**Location**: [`src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts`](src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts)

**Problem**:
- BEFORE FIX-2026-01-06: Errors caught, logged to console, returned null
- User sees nothing - files appear to save but don't
- AFTER FIX-2026-01-06: Toast notifications added
- **BUT**: No validation that fix actually works in E2E scenarios

**Evidence of Fix**:
```typescript
// Line 134-145 in note-folder-bridge.ts
catch (error) {
  const context = importContext || 'unknown operation';
  console.error(`[NoteFolderBridge] ${context} failed:`, error);

  // FIX-2026-01-06: Now shows toast
  toast.error({
    title: 'File operation failed',
    description: error instanceof Error ? error.message : 'Unknown error',
  });
  return null;
}
```

**Verification Gap**: Fix exists but was never tested in actual E2E scenario

**Story Claimed Complete**: S-031 (File System Sync Error Handling) - **NOT VERIFIED**

---

### Issue 2.2: Project Mounting Fails - Files Not Loading in Notes

**Severity**: P0 - Core Feature Broken
**Location**: Unknown - requires tracing mount flow

**Problem Description** (from user report):
- User mounts project in IDE workspace
- Switch to Notes workspace
- Expected: Project files visible and editable
- Actual: Empty workspace, no files loaded
- No error message shown

**Potential Root Causes**:
1. `NoteFolderBridge.importDirectory()` not called after mount
2. Workspace binding not established between IDE and Notes
3. File handle not passed to Notes workspace context
4. Permission not granted to Notes workspace

**Required Investigation**: Trace full mount flow from IDE → Notes

**Story Claimed Complete**: None - this was never a story

---

### Issue 2.3: No Fallback for Mobile/Desktop File Access

**Severity**: P1 - Platform Incompatibility
**Location**: File System Access API integration

**Problem**:
- File System Access API is desktop-only (Chrome/Edge)
- Mobile Safari/Firefox don't support `showDirectoryPicker()`
- No IndexedDB fallback for mobile users
- App silently fails on mobile file operations

**User Impact**:
- Mobile users cannot access project files
- No graceful degradation message
- App appears broken on mobile

**Story Claimed Complete**: S-027 (Cross-Platform File Access) - **NOT VERIFIED**

---

## Category 3: Workspace State Management Issues

### Issue 3.1: Cross-Workspace State Inconsistency

**Severity**: P1 - Data Integrity Risk
**Location**: [`src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts`](src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts)

**Problem**:
- ARCH-01.3 consolidated 5 stores into unified provider
- **BUT**: No E2E validation that state syncs across workspaces
- Provider config updated in IDE → may not reflect in Notes
- Agent settings changed in Notes → may not persist in Chat

**Evidence from Code**:
```typescript
// unified-workspace-context.ts:368 lines of exports
// But no cross-workspace event validation
// Event bus exists but subscriber patterns not tested
```

**Required Validation**:
1. Update agent in IDE workspace → verify in Chat workspace
2. Change LLM provider in Notes → verify persists in IDE
3. Mount project in IDE → verify files accessible in Notes

**Story Claimed Complete**: S-028 (Workspace State Consolidation) - **NOT VERIFIED**

---

### Issue 3.2: No Workspace Switching Validation

**Severity**: P2 - Medium
**Location**: Workspace switcher component

**Problem**:
- User switches workspaces → no state validation
- May lose unsaved changes silently
- No "unsaved changes" warning
- Workspace switching doesn't trigger state checkpoint

**Expected Behavior**:
- Detect unsaved changes before workspace switch
- Prompt user: "Save changes before switching?"
- Or auto-save to IndexedDB before switch

**Story Claimed Complete**: S-029 (Workspace Switching) - **NOT VERIFIED**

---

## Category 4: Error Handling & User Feedback Issues

### Issue 4.1: console.error + return null Pattern Throughout Codebase

**Severity**: P1 - Poor Debuggability
**Evidence Locations**:
- [`credential-vault.ts:89`](src/lib/agent/providers/credential-vault.ts#L89)
- [`note-folder-bridge.ts:134`](src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts#L134)
- [`provider-models-slice.ts:67`](src/infrastructure/persistence/stores/providers/provider-models-slice.ts#L67)

**Problem**:
```typescript
// Anti-pattern found everywhere:
try {
  return await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  return null;  // ← Silent failure, caller may not check
}
```

**Impact**:
- Errors logged but not surfaced to user
- Callers may assume null is valid return
- No telemetry/analytics for error rates
- Impossible to debug production issues

**Course Correction Action**: CC-PHASE-1 targets this pattern

---

### Issue 4.2: No Retry Logic for Network Failures

**Severity**: P2 - Medium
**Location**: All API calls (provider fetch, model listing, etc.)

**Problem**:
- Single network failure → permanent failure
- No exponential backoff
- No retry with different endpoint
- User must manually retry

**Required Enhancement**:
```typescript
// Should exist but doesn't:
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);  // exponential backoff
    }
  }
}
```

**Story Claimed Complete**: None - never addressed

---

## Category 5: i18n & Responsive Design Issues

### Issue 5.1: Zero i18n Implementation in Notes Workspace

**Severity**: P1 - Internationalization Failure
**Evidence**:
- `grep -r "useTranslation" src/infrastructure/workspace-services/notes` → 0 results
- `grep -r "t(" src/components/notes` → 0 results
- All hardcoded English strings

**Problem**:
- i18next configured but not used
- No translated strings for Notes workspace
- App claims i18n support but doesn't deliver

**Story Claimed Complete**: S-022 (i18n Implementation) - **NOT VERIFIED**

---

### Issue 5.2: Zero useResponsive Calls - Mobile Layouts Broken

**Severity**: P1 - Mobile UX Failure
**Evidence**:
- `grep -r "useResponsive" src` → 0 results
- No responsive breakpoints in Notes components
- Desktop-only layouts assumed

**Problem**:
- Touch targets <44px on mobile
- Layouts don't adapt to screen size
- No mobile-first design validation

**Story Claimed Complete**: S-023 (Responsive Design) - **NOT VERIFIED**

---

## Category 6: Documentation & Governance Issues

### Issue 6.1: Orphaned Context Artifacts

**Severity**: P2 - Medium
**Problem**: Multiple YAML/markdown artifacts with unclear status:

1. `sprint-status.yaml` - Main sprint tracking, shows 12 complete
2. `course-correction-sprint-2026-01-06.yaml` - Parallel tracking
3. `arc-sprint-status.yaml` - Architecture remediation specific
4. Various handoff artifacts in `_bmad-output/handoffs/`

**Impact**:
- Unclear which file is authoritative
- Status divergence possible
- Difficult to determine true project state

---

### Issue 6.2: AGENTS.md Update Frequency Not Honored

**Severity**: P2 - Medium
**Rule**: "Update AGENTS.md every 3 completed stories"
**Reality**: Last update unclear, 12 stories claimed done

**Problem**:
- Governance rule not enforced
- Documentation drift from implementation
- New developers have outdated context

---

## Summary by Severity

| Severity | Count | Issue IDs |
|----------|-------|-----------|
| **P0 - Blocking** | 5 | 1.1, 1.3, 2.1, 2.2, 2.3 |
| **P1 - High** | 6 | 1.2, 2.3, 3.1, 4.1, 5.1, 5.2 |
| **P2 - Medium** | 5 | 3.2, 4.2, 6.1, 6.2 |

---

## Course Correction Required

The verification gap (0 verified / 12 claimed complete) triggered **Course Correction CC-2026-01-06**:

### Phase 0: Verification Infrastructure (Current)
- V-001: Create E2E Validation Suite Framework → marked COMPLETE but needs validation
- V-002: File Sync E2E Validation Suite
- V-003: API Key Management E2E Validation Suite
- V-004: Workspace State E2E Validation Suite

### Phase 1: Error Recovery Architecture (Next)
- ER-001: Implement Error Boundary Framework
- ER-002: Add Retry Logic with Exponential Backoff
- ER-003: Centralized Error Reporting

### Remaining Phases
- CC-PHASE-2: User Feedback Infrastructure
- CC-PHASE-3: i18n & Responsive Validation
- CC-PHASE-4 through CC-PHASE-7: Additional remediation

---

## Recommendations

1. **STOP marking stories DONE without E2E validation**
2. Complete V-001 through V-004 before any new features
3. Add E2E test suite as Definition of Done gatekeeper
4. Create automated validation: E2E tests must pass before story complete
5. Archive orphaned artifacts to prevent confusion
6. Single source of truth: `course-correction-sprint-2026-01-06.yaml`

---

**Document Status**: DRAFT
**Next Review**: After V-004 completion
**Owner**: BMAD Master Orchestrator
