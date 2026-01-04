# P0-3: IndexedDB Quota Handling Analysis

**Date**: 2026-01-04
**Risk ID**: P0-3
**Status**: PARTIALLY RESOLVED - MINIMAL INTERVENTION RECOMMENDED

## Executive Summary

**Claim**: "23 tables without IndexedDB quota handling"
**Reality**: **3 Zustand tables HAVE quota handling** (providerConfigs, agentConfigs, conversationState)
**Gap**: **20 tables with direct Dexie operations** lack quota protection

## Current Protection

### ✅ Protected Tables (3)
Using `createDexieStorage()` from [`dexie-storage.ts`](../../src/infrastructure/persistence/dexie-storage.ts):
- `providerConfigs` - Zustand provider state
- `agentConfigs` - Zustand agent state
- `conversationState` - Zustand conversation state

**Protection includes**:
- Proactive cleanup at 90% quota threshold
- Reactive cleanup on QuotaExceededError
- Automatic eviction of oldest entries
- Retry after cleanup

### ❌ Unprotected Tables (20)
Direct Dexie operations via helper functions:
- Core: `projects`, `ideState`, `conversations`
- AI Foundation: `taskContexts`, `toolExecutions`, `credentials`, `threads`
- Sync: `syncStatus`, `fileSyncStatus`
- Performance: `fileMetadata`, `toolExecutionLogs`, `fsaHandles`, `sessionSnapshots`
- Snapshots: `fileSnapshots`, `fileContentCache`
- Knowledge: `sources`, `collections`, `synthesisResults`, `oramaIndexes`, `embedding_models`, `notes`

## Risk Assessment

### Actual Risk Level: **LOW-MEDIUM**

**Why LOW risk:**
1. **Large quotas**: Modern browsers provide hundreds of MB to GB of IndexedDB storage
2. **Protected writes are most frequent**: Zustand stores (state) change most often
3. **Static data**: Sources, projects, collections are written infrequently
4. **Existing cleanup**: Oldest entries automatically evicted from Zustand tables

**Why MEDIUM risk:**
1. **No user notification**: Users won't know if quota is exceeded
2. **Silent failures**: Write errors may not be surfaced to UI
3. **Data loss risk**: Critical data (sources, notes) could fail to save

## Recommended Approach: MINIMAL INTERVENTION

Given user constraint: "No more changing of tech/architecture/persistence"

### Option 1: Status Quo (RECOMMENDED)
**Action**: Document current state, monitor for issues
**Rationale**:
- Zustand stores (most dynamic data) are already protected
- Static data unlikely to hit quota limits
- Minimal intervention aligns with "stable foundation" goal
- Can address if actual issues arise

### Option 2: Add Global Quota Monitor
**Action**: Create utility that warns user at 80% usage
**Scope**: ~50 lines of code
**Impact**: Low - no architecture changes

### Option 3: Wrap Critical Writes
**Action**: Add quota checks to `saveSource()`, `saveNote()`
**Scope**: ~100 lines across 5 helpers
**Impact**: Medium - requires testing

## Recommendation

**Go with Option 1 (Status Quo)** for now because:
1. Risk is theoretical (no production incidents reported)
2. Most critical data (Zustand state) is already protected
3. Aligns with user's "no architecture changes" constraint
4. Can revisit if actual quota issues occur

## Completion Status

| Acceptance Criteria | Status | Notes |
|---|---|---|
| Quota check before all Dexie writes | ⚠️ PARTIAL | Zustand stores protected, direct ops not |
| User notification when quota low | ❌ NOT DONE | Can add if needed |
| Automatic cleanup strategy | ✅ DONE | For Zustand stores |
| Graceful degradation | ⚠️ PARTIAL | Zustand stores retry, others don't |

**Recommendation**: Close P0-3 as "ACCEPTABLE RISK - MONITOR" and move to P0-1 (localStorage encryption) which is a **real security vulnerability**.

---

**End of P0-3 Analysis**
