---
artifact_id: "handoff-2026-01-11-bug-fix"
artifact_type: "handoff"
parent_id: null
story_id: "BUG-FIX-2026-01-11"
source_agent: "master-orchestrator"
target_agent: "dev-ext"
created_at: "2026-01-11T12:00:00+07:00"
status: "ACTIVE"
---

# Handoff: Fix 6 Critical Runtime Bugs

## Context Summary

Master orchestrator delegating bug remediation task. Six critical runtime errors identified from console logs requiring immediate attention.

## Bugs to Fix

### Bug #1: Thread Store Crash (CRITICAL)
**Error**: `TypeError: Cannot read properties of undefined (reading 'threads')`
**Location**: `thread-management-slice.ts:131`
**Impact**: ChatPanelWrapper crashes, chat completely broken
**File**: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`

### Bug #2: WebContainer Boot Loop (CRITICAL)
**Symptom**: 50+ "Booted successfully" messages, "No projectId in state, skipping persistence" × 100+
**Impact**: Performance degradation, 10+ second delays, state corruption risk
**Files**: `src/infrastructure/webcontainer/`, `src/infrastructure/sync/`

### Bug #3: Hydration Mismatch
**Error**: Server renders "Home", client renders "Trang chủ"
**Impact**: React hydration failure, full client-side re-render
**File**: Likely in locale/i18n handling

### Bug #4: Structured Output API Error
**Error**: "Invalid structured output syntax" (code 3051) from Mistral model
**Model**: `mistralai/devstral-2512:free`
**Impact**: AI chat requests fail with 400 error
**File**: API endpoint using OpenAI structured output with non-compatible model

### Bug #5: SVG Path Error
**Error**: `<path> attribute d: Expected number, "…a8 8 0 0 1 1 8 8v0a8 8 0 0 1 -1 …"`
**Impact**: Icon rendering broken
**File**: Likely in dynamic SVG component

### Bug #6: IDEStateStorage Spam
**Symptom**: "No projectId in state, skipping persistence" logs repeatedly
**Impact**: Noise in console, indicates timing issue in state initialization
**File**: `src/infrastructure/persistence/stores/ide/ide-state-storage.ts`

## Acceptance Criteria

- [ ] All 6 bugs fixed or mitigated
- [ ] Console shows zero errors during normal app usage
- [ ] Chat functionality works (threads accessible)
- [ ] WebContainer boots once per session
- [ ] No hydration mismatches
- [ ] AI API calls work (with model compatibility check)
- [ ] TypeScript compiles with zero errors
- [ ] Tests pass

## Validation Commands

```bash
# TypeScript check
pnpm tsc --noEmit

# Run tests
pnpm vitest run

# Lint check
pnpm lint
```

## Priority Order

1. **Bug #1** (Thread Store) - Blocks all chat functionality
2. **Bug #2** (WebContainer) - Causes performance issues
3. **Bug #4** (Structured Output) - Blocks AI features
4. **Bug #3** (Hydration) - Causes re-render overhead
5. **Bug #6** (IDEStateStorage) - Console noise/timing
6. **Bug #5** (SVG) - UI issue

## Escalation Path

On failure → Report to master-orchestrator with:
- Error details
- What was attempted
- Recovery actions taken
- Recommendation for next steps
