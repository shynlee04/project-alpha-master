# ADR-001: Complete Migration to Unified useAppStore

**Status:** ACCEPTED
**Date:** 2026-01-02
**Type:** Architecture Migration

## Context

The unified `useAppStore` was implemented in December 2025 following Zustand v5 best practices:
- Single bounded store (agents + providers)
- 5 Agent slices, 3 Provider slices
- Dexie IndexedDB persistence
- Convenience selectors

**BUT** migration was never completed - components still use legacy stores.

## Decision

**Migrate all 20 remaining files from legacy stores to `useAppStore`**

## Rationale

1. **Single Source of Truth**: Eliminates store fragmentation
2. **Reactive Updates**: Agent/provider changes reflect immediately everywhere
3. **Proven Architecture**: Store already battle-tested (Cycle 12-17)
4. **Low Risk**: Just updating imports, no logic changes

## Migration Plan

See: `cornerstone-1-provider-analysis.md` for detailed 3-batch plan.

## Consequences

- **Before**: 20 files using legacy stores (fragmented state)
- **After**: 20 files using unified store (reactive state)
- **Risk**: LOW (bulk find/replace, 2-3 hours)
- **Breaking**: None (backward compatible hooks provided)
