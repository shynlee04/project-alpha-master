---
date: 2026-01-03
time: 13:00:00+07:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
iteration: 1091
type: critical-fix-handoff
---

# P0-2 Handoff: Wire RAG Store to KnowledgePage

## Handoff To: @bmad-bmm-dev (general-purpose)

## Issue Context

**Priority**: P0 - Critical (Blocks Core Functionality)
**Estimate**: 4 hours
**Location**: `src/presentation/components/knowledge/KnowledgePage.tsx:68-149`

## Problem Statement

The `KnowledgePage` component creates a **local OramaIndexAdapter** (lines 105-127) that is recreated on every page load, instead of using the shared RAG store infrastructure. This causes:

1. **RAG state not persisted** across page loads (indexing progress lost on refresh)
2. **No connection to RAG store** for reactive UI updates (indexing status, progress bars)
3. **Canvas not integrated** with knowledge graph (linkage proposals not generated)

## Root Cause Analysis

### Current Broken Implementation:

**Lines 105-127 in KnowledgePage.tsx**:
```typescript
// Local adapter created EVERY page render
class OramaIndexAdapter {
    constructor(private projectId: string) { }

    async indexBatch(chunks: any[]): Promise<void> {
        for (const chunk of chunks) {
            await indexSource(this.projectId, chunk.sourceId || 'unknown', chunk.content, {
                title: chunk.title,
                embedding: chunk.embedding
            });
        }
    }

    async search(query: string, limit?: number): Promise<any[]> {
        const results = await searchIndex(this.projectId, query, {
            limit: limit || 10
        });
        return results;
    }
}
```

**Problems**:
1. Adapter is recreated on every page load (lines 105-129)
2. No integration with `useRAGStore` for state management
3. Indexing progress not tracked in RAG store
4. Canvas component exists but not connected to knowledge graph

### Existing RAG Store Infrastructure:

**File**: `src/infrastructure/persistence/stores/rag/rag-store.ts`
- ✅ Has `loadIndexMetadata()` method (rag-index-slice.ts:52)
- ✅ Has `setIndexStatus()` method (rag-index-slice.ts:83)
- ✅ Has `updateIndexingProgress()` method (rag-index-slice.ts:90)
- ✅ Has `indexStatus`, `documentCount`, `totalDocuments` state
- ✅ Has Dexie persistence for index metadata

**KnowledgePage DOES import RAG store** (line 22):
```typescript
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
```

**But only uses it for errors** (line 86):
```typescript
useRAGStore.getState().setError((error as Error).message);
```

## Implementation Plan

### Step 1: Extract OramaIndexAdapter to Shared Service (1 hour)

**Create new file**: `src/lib/rag/orama-index-adapter.ts`

```typescript
/**
 * @fileoverview OramaIndexAdapter - Shared RAG Index Service
 * @module lib/rag/orama-index-adapter
 *
 * Provides a singleton adapter for Orama index operations
 * that integrates with the RAG store for state management.
 */

import { indexSource, searchIndex } from './orama-index';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';

export class OramaIndexAdapter {
    constructor(private projectId: string) {
        // Notify RAG store when adapter is created
        useRAGStore.getState().setCurrentProject(projectId);
    }

    async indexBatch(chunks: any[]): Promise<void> {
        // Update RAG store status
        const store = useRAGStore.getState();
        store.setIndexStatus('indexing', 'embedding');
        store.updateIndexingProgress(0, chunks.length);

        // Group chunks by source and index
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            try {
                await indexSource(this.projectId, chunk.sourceId || 'unknown', chunk.content, {
                    title: chunk.title,
                    embedding: chunk.embedding
                });

                // Update progress
                store.updateIndexingProgress(i + 1, chunks.length);
            } catch (error) {
                console.error('[OramaIndexAdapter] Failed to index chunk:', error);
                store.setError((error as Error).message);
            }
        }

        // Mark as ready
        store.setIndexStatus('ready', 'idle');
        await store.loadIndexMetadata(this.projectId);
    }

    async search(query: string, limit?: number): Promise<any[]> {
        // Update RAG store status
        useRAGStore.getState().setIndexStatus('searching', 'search');

        try {
            const results = await searchIndex(this.projectId, query, {
                limit: limit || 10
            });

            useRAGStore.getState().setIndexStatus('ready', 'idle');
            return results;
        } catch (error) {
            useRAGStore.getState().setError((error as Error).message);
            useRAGStore.getState().setIndexStatus('error', 'search');
            return [];
        }
    }
}

/**
 * Factory function to create or get existing adapter for a project
 */
const adapters = new Map<string, OramaIndexAdapter>();

export function getOramaIndexAdapter(projectId: string): OramaIndexAdapter {
    if (!adapters.has(projectId)) {
        adapters.set(projectId, new OramaIndexAdapter(projectId));
    }
    return adapters.get(projectId)!;
}
```

### Step 2: Update KnowledgePage to Use Shared Adapter (30 minutes)

**Remove lines 105-127** from KnowledgePage.tsx (local class definition)

**Replace with**:
```typescript
import { getOramaIndexAdapter } from '@/lib/rag/orama-index-adapter';

// In useEffect (lines 96-149):
const oramaIndex = getOramaIndexAdapter(projectId);
```

### Step 3: Add RAG Progress UI Components (1.5 hours)

**Create**: `src/presentation/components/rag/IndexingProgressPanel.tsx`

```typescript
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import { useTranslation } from 'react-i18next';

export function IndexingProgressPanel() {
    const { t } = useTranslation();
    const { indexStatus, documentCount, totalDocuments, indexingOperation } = useRAGStore(s => ({
        indexStatus: s.indexStatus,
        documentCount: s.documentCount,
        totalDocuments: s.totalDocuments,
        indexingOperation: s.indexingOperation,
    }));

    if (indexStatus === 'idle' || indexStatus === 'ready') {
        return null;
    }

    const progress = totalDocuments > 0 ? (documentCount / totalDocuments) * 100 : 0;

    return (
        <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                    {indexingOperation === 'embedding' && t('rag.embedding')}
                    {indexingOperation === 'chunking' && t('rag.chunking')}
                    {indexingOperation === 'search' && t('rag.searching')}
                </span>
                <span className="text-xs text-muted-foreground">
                    {documentCount} / {totalDocuments}
                </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
```

**Add to KnowledgePage**:
```typescript
import { IndexingProgressPanel } from '@/presentation/components/rag/IndexingProgressPanel';

// In JSX (near SourceImportDialog):
<IndexingProgressPanel />
```

### Step 4: Wire Canvas to Knowledge Graph (1 hour)

**Update Canvas lazy import** (lines 13-18):
```typescript
const Canvas = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: () => <></> });
    }
    return import('@/presentation/components/canvas/Canvas').then(m => ({
        default: () => {
            const { useRAGStore } = require('@/infrastructure/persistence/stores/rag/rag-store');
            const { indexMetadata } = useRAGStore.getState();

            // Pass index metadata to Canvas for linkage proposals
            return <Canvas indexMetadata={indexMetadata} />;
        }
    }));
});
```

**Or better**: Pass indexMetadata as prop after data loads:
```typescript
const indexMetadata = useRAGStore(s => s.indexMetadata);

<Canvas indexMetadata={indexMetadata} />
```

### Step 5: Initialize RAG Store on Component Mount (30 minutes)

**Add to useEffect** (after line 93):
```typescript
// Initialize RAG store state
useRAGStore.getState().setCurrentProject(projectId);
useRAGStore.getState().setCurrentWorkspace('knowledge');

// Load existing index metadata
useRAGStore.getState().loadIndexMetadata(projectId);
```

### Step 6: Manual Testing (30 minutes)

**Test Cases**:
1. **Indexing Progress**: Import a PDF source, verify progress bar shows real-time updates
2. **State Persistence**: Refresh page during indexing, verify progress continues from same point
3. **Search Integration**: Use RAG search, verify status changes to "searching" then "ready"
4. **Canvas Integration**: After indexing completes, verify Canvas shows linkage proposals

**Expected Console Output**:
```
[RAGIndexSlice] Setting project: default
[RAGStore] Loading index for project: default
[RAGIndexSlice] Setting workspace: knowledge
[OramaIndexAdapter] Indexing batch of 10 chunks
[RAGIndexSlice] Index status: indexing, operation: embedding
[RAGIndexSlice] Progress: 5/10
[RAGIndexSlice] Progress: 10/10
[RAGIndexSlice] Index status: ready
```

### Step 7: Code Validation (30 minutes)

```bash
# TypeScript check
pnpm tsc --noEmit 2>&1 | grep -v "test\|spec" | grep "error" | wc -l
# Expected: 0 production errors

# Verify no circular dependencies
pnpm madge --circular src/lib/rag/orama-index-adapter.ts
# Expected: No circular dependencies

# Run RAG tests
pnpm test src/lib/rag/__tests__/
pnpm test src/infrastructure/persistence/stores/rag/__tests__/
# Expected: All tests passing
```

## Constraints & Safeguards

### DO NOT:
- ❌ Break existing SourceRAGBridge functionality
- ❌ Remove orama-index.ts functions (indexSource, searchIndex)
- ❌ Change RAG store slice interfaces
- ❌ Create duplicate state (use existing RAG store)

### MUST:
- ✅ Use singleton pattern for OramaIndexAdapter (Map<string, Adapter>)
- ✅ Delegate state updates to RAG store (don't duplicate)
- ✅ Maintain backward compatibility with SourceRAGBridge
- ✅ Add proper TypeScript types (no `any`)
- ✅ Handle errors gracefully with RAG store setError()
- ✅ Add JSDoc comments to exported functions

### Validation Checklist:
- [ ] OramaIndexAdapter extracted to shared service
- [ ] Singleton pattern implemented (Map-based caching)
- [ ] Adapter updates RAG store during indexing
- [ ] Adapter updates RAG store during search
- [ ] IndexingProgressPanel component created
- [ ] Progress panel added to KnowledgePage
- [ ] Canvas receives indexMetadata prop
- [ ] RAG store initialized on component mount
- [ ] Zero TypeScript errors
- [ ] Manual test: Import PDF shows progress
- [ ] Manual test: Refresh page preserves state
- [ ] JSDoc comments added

## MCP Research Required (minimum 3 tool uses):

### Context7:
- Query React singleton pattern best practices
- Query Zustand store integration with services

### Deepwiki:
- Search Orama repo for index lifecycle management
- Search Zustand repo for state synchronization patterns

### WebSearch:
- Search "React 2025 singleton service pattern" for latest approaches

## Output Location

Report completion to:
```
_bmad-output/p0-2-rag-store-wiring-completion-2026-01-03.md
```

Include:
- Code diff showing changes made
- Files created/modified count
- TypeScript error count (before: 0, after: 0 expected)
- Manual test results (screenshots of progress bar)
- Console output showing RAG store integration
- Any blockers or recommendations

## Report Back To

**@bmad-core-bmad-master** with:
1. P0-2 completion status (SUCCESS/BLOCKED)
2. Files created/modified
3. Verification results (manual test passed/failed)
4. Screenshot of indexing progress in action
5. Next action recommendation (proceed to P0-3 or address issues)

---

**Handoff Created**: 2026-01-03T13:00:00+07:00
**BMAD Master**: @bmad-core-bmad-master
**Iteration**: 1091
**Team**: Team A
**Priority**: P0 CRITICAL - RAG State Not Persisted Across Page Loads
