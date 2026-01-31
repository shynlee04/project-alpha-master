# Performance Issues Analysis
**Date:** 2026-01-11
**Category:** Performance - N+1 Queries, Race Conditions, Bottlenecks
**Status:** Complete

---

## Executive Summary

This document identifies performance issues across the codebase, including:
- N+1 query patterns
- Race conditions
- Unnecessary re-renders
- Inefficient data access patterns

**Key Findings:**
- **N+1 Query Patterns:** 5+ instances
- **Race Conditions:** 1 critical (sync)
- **Unnecessary Write Operations:** 1 instance
- **Data Transformation Overhead:** Multiple instances

---

## 1. N+1 Query Patterns

### Definition
N+1 query pattern occurs when:
1. One query fetches N items
2. Then N additional queries fetch related data for each item
3. Result: N+1 total database queries instead of 1-2 optimized queries

---

### 1.1 Knowledge Source Deletion (CRITICAL)

**Location:** `src/infrastructure/persistence/stores/knowledge/slices/knowledge-source-crud-slice.ts:56-62`

**Problematic Code:**
```typescript
// BAD: Query inside loop
for (const collection of get().collections) {
  if (collection.sourceIds.includes(sourceId)) {
    await db.collections.where('id').equals(collection.id).modify(...)
  }
}
```

**Analysis:**
- First query: Gets all collections (1 query)
- Loop: One query per collection to update (N queries)
- Total: 1 + N queries

**Impact:**
- **For 100 collections:** 101 database operations
- **Should be:** 1-2 bulk operations

**Fix:**
```typescript
// GOOD: Bulk operation
const collectionsToUpdate = get().collections.filter(c => c.sourceIds.includes(sourceId));
const collectionIds = collectionsToUpdate.map(c => c.id);
await db.collections.bulkPut(
  collectionsToUpdate.map(c => ({ ...c, sourceIds: c.sourceIds.filter(id => id !== sourceId) }))
);
```

**Performance Gain:** ~100x for 100 collections

---

### 1.2 Plugin Snapshot Updates

**Location:** `src/infrastructure/persistence/stores/plugins/slices/plugin-snapshot-slice.ts`

**Pattern:** Similar loop with queries

**Impact:** Same N+1 pattern

---

### 1.3 File Metadata Queries

**Pattern Found:** File metadata queries scattered across components

**Issue:** Repeated queries for same metadata

**Impact:**
- Redundant database hits
- No query result caching

**Recommendation:**
- Implement query result caching
- Batch metadata requests
- Use Dexie's `toArray()` with filtering

---

### 1.4 Collection Updates in Iteration

**Multiple Locations:** Various store slices

**Pattern:**
```typescript
for (const item of items) {
  await db.collection.where('id').equals(item.id).modify(update);
}
```

**Should be:**
```typescript
await db.collection.bulkPut(items.map(item => ({ ...item, ...update })));
```

---

## 2. Race Conditions

### 2.1 Sync Engine Race Condition (CRITICAL)

**Location:** `src/infrastructure/sync/core/sync-engine-core.ts:78-80`

**Problematic Code:**
```typescript
if (this.state.isSyncing) {
  throw new Error('Sync already in progress');
}
this.state.isSyncing = true;
// ... sync operations ...
this.state.isSyncing = false;
```

**Analysis:**
- Simple boolean check is NOT atomic
- Between check and set, another sync can start
- Multiple syncs can run simultaneously
- Last-write-wins causes data loss

**Race Condition Timeline:**
```
Thread A: check isSyncing → false
Thread B: check isSyncing → false
Thread A: set isSyncing = true
Thread B: set isSyncing = true  ← Both syncing!
Thread A: sync complete, set false
Thread B: sync complete, set false
Result: Potential data corruption
```

**Impact:**
- **HIGH:** Can cause data corruption
- **HIGH:** Can cause data loss (last-write-wins)
- **MEDIUM:** Unpredictable sync state

**Fix:**
```typescript
class AsyncLock {
  private locks = new Map<string, Promise<any>>();

  async acquire<T>(key: string, fn: () => Promise<T>, timeout = 30000): Promise<T> {
    const existing = this.locks.get(key);
    if (existing) {
      // Wait for existing lock or timeout
      const result = await Promise.race([
        existing,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Lock timeout')), timeout))
      ]);
      return result as T;
    }

    const task = fn().finally(() => this.locks.delete(key));
    this.locks.set(key, task);
    return task;
  }
}

// In SyncEngine:
await this.lock.acquire('sync', async () => {
  // ... sync operations ...
});
```

**Benefits:**
- Proper mutex/lock semantics
- Timeout support
- Queued requests (instead of throwing)
- No race conditions

---

### 2.2 Concurrent State Updates

**Pattern Found:** Multiple stores updating state concurrently without coordination

**Impact:**
- Unpredictable state
- Potential for lost updates
- Difficult to reason about

**Recommendation:**
- Implement proper state machine
- Use immutable state updates
- Consider event sourcing pattern

---

## 3. Unnecessary Write Operations

### 3.1 UniversalProviderRegistry.get()

**Location:** `src/domain/services/universal-provider-registry.ts:208`

**Issue:** Updates `lastAccessedOn` on every `get()` call

**Code:**
```typescript
get(id: string): ProviderConfig | undefined {
  const entry = this.configs.get(id);
  if (entry) {
    entry.lastAccessedOn = Date.now();  // Write on read!
  }
  return entry?.config;
}
```

**Analysis:**
- Read operation causing write
- Unnecessary I/O
- Performance degradation
- Not needed for most use cases

**Impact:**
- Every get() triggers a write
- For 100 gets/sec: 100 unnecessary writes/sec

**Fix:**
```typescript
// Option 1: Remove lastAccessedOn entirely
// Option 2: Update only on explicit access tracking
// Option 3: Batch updates (debounce)
```

---

## 4. Data Transformation Overhead

### 4.1 Multiple Transformation Layers

**Locations:**
- `src/domain/services/universal-adapter-factory.ts:65`
- `src/domain/services/universal-adapter-factory.ts:229`

**Pattern:**
```
buildRequestPayload() → executeProviderRequest() → buildBody()
```

**Analysis:**
- Data transformed multiple times
- Each transformation creates new objects
- Unnecessary intermediate representations

**Impact:**
- Memory overhead
- CPU overhead
- GC pressure

**Recommendation:**
- Streamline transformation pipeline
- Reduce intermediate steps
- Consider direct construction

---

### 4.2 Workspace Binding Transformations

**Location:** `src/domain/services/agent-workspace-utils.ts:30`

**Issue:** Functions expect both plain objects AND class instances

**Impact:**
- Runtime type checking
- Unnecessary conversions
- Performance overhead

---

## 5. Query Optimization Opportunities

### 5.1 Missing Indexes

**Pattern:** Queries on unindexed fields

**Impact:**
- Full table scans
- Slow queries on large datasets

**Recommendation:**
- Audit Dexie indexes
- Add indexes for frequently queried fields
- Use compound indexes for multi-field queries

---

### 5.2 No Query Result Caching

**Issue:** Same queries executed repeatedly

**Example:** File metadata fetched multiple times per render

**Recommendation:**
- Implement query cache
- Use React Query or similar
- Cache invalidation strategy

---

### 5.3 Large Batch Processing

**Location:** Sync operations

**Current:** Batch size 50 files

**Analysis:**
- May be suboptimal for all scenarios
- Fixed size doesn't adapt to conditions

**Recommendation:**
- Adaptive batch sizing
- Parallel processing for independent operations
- Progress reporting

---

## 6. Store Re-render Issues

### 6.1 Selector Usage

**Pattern Found:** Some stores use multiple separate selectors

**Anti-pattern:**
```typescript
// BAD: Causes multiple re-renders
const items = useStore((s) => s.items);
const addItem = useStore((s) => s.addItem);
```

**Correct:**
```typescript
// GOOD: Single re-render
const { items, addItem } = useStore(
  useShallow((state) => ({ items: state.items, addItem: state.addItem }))
);
```

**Impact:** Unnecessary re-renders, UI lag

---

### 6.2 Large Store Subscriptions

**Issue:** Components subscribing to entire store instead of specific slices

**Impact:** Re-render on any state change

**Recommendation:**
- Subscribe to minimal state needed
- Use selectors properly
- Implement memoization

---

## 7. Sync Performance Issues

### 7.1 Debounce Delay

**Current:** 300ms debounce on sync trigger

**Impact:** Perceived latency

**Analysis:**
- May be too long for responsive feel
- May be too short for performance

**Recommendation:**
- Adaptive debounce based on operation
- User-configurable preference

---

### 7.2 No Parallel Processing

**Current:** `maxConcurrent: 5`

**Analysis:**
- May not be optimal for all scenarios
- Fixed concurrency doesn't adapt

**Recommendation:**
- Dynamic concurrency based on:
  - Network conditions
  - Device capabilities
  - Operation type

---

## 8. Remediation Priority

### P0 - Critical (Do First)
1. Fix sync race condition (data corruption risk)
2. Fix N+1 query patterns (100x performance gain)

### P1 - High
3. Remove unnecessary write operations
4. Implement query result caching
5. Add proper selectors (prevent re-renders)

### P2 - Medium
6. Optimize data transformation pipeline
7. Add database indexes
8. Implement adaptive batch sizing

### P3 - Low
9. Optimize debounce timing
10. Dynamic concurrency adjustment

---

## 9. Performance Testing Plan

### Benchmarks to Establish:

1. **Database Queries:**
   - N+1 vs bulk operation timing
   - Indexed vs non-indexed queries
   - Large dataset performance

2. **Sync Operations:**
   - Race condition reproduction
   - Throughput with/without lock
   - Batch size optimization

3. **UI Performance:**
   - Re-render counts before/after selector fixes
   - Component mount time
   - Interaction responsiveness

### Tools:
- `console.time()` for quick benchmarks
- Lighthouse for UI performance
- Custom performance marks for critical paths

---

## 10. Success Metrics

**Before:**
- N+1 queries: 5+ instances
- Race condition: 1 critical
- Unnecessary writes: Every get() call

**After:**
- N+1 queries: 0
- Race conditions: 0 (proper locking)
- Unnecessary writes: Eliminated or optimized

**Performance Targets:**
- Database operations: 100x faster for bulk operations
- Sync: No race conditions, proper serialization
- UI: 50% fewer re-renders

---

## Related Artifacts

- [Comprehensive Codebase Audit](./comprehensive-codebase-audit-2026-01-11.md)
- [Store Consolidation Analysis](./store-consolidation-analysis-2026-01-11.md)

---

*Analysis conducted by: BMAD Performance Analysis Agent*
*Report Version: 1.0*
