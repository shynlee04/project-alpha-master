---
name: wire-source-to-rag
description: "Wire Source Import Pipeline to RAG Indexing (GAP-001)"
agent: source-processor
estimated_effort: "6 hours"
---

# Wire Source Import to RAG Pipeline

**Purpose:** Connect the source import system to automatic RAG indexing so that 
imported documents are immediately searchable in the knowledge base.

**Gap Reference:** GAP-001 in `data/integration-gaps.yaml`

---

## Prerequisites

- [ ] Verify `pnpm build` passes before starting
- [ ] Review existing implementation:
  - `src/presentation/components/knowledge/SourceImportDialog.tsx`
  - `src/lib/knowledge/source-import.ts`
  - `src/lib/rag/orama-index.ts`
  - `src/lib/rag/embedding-service.ts`

---

## Step 1: Create Source-RAG Bridge Service

**Task:** Create a bridge service that listens for source import events and triggers RAG indexing

**Output File:** `src/lib/knowledge/source-rag-bridge.ts`

```typescript
// Source-RAG Bridge Service
// Connects source import pipeline to RAG indexing

import { onStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';
import { embeddingService } from '@/lib/rag/embedding-service';
import { oramaIndex } from '@/lib/rag/orama-index';
import type { SourceDocument } from '@/lib/knowledge/types';

export interface SourceRAGBridgeConfig {
  autoIndex: boolean;
  batchSize: number;
  retryAttempts: number;
}

export class SourceRAGBridge {
  private config: SourceRAGBridgeConfig;
  private unsubscribe: (() => void) | null = null;

  constructor(config: Partial<SourceRAGBridgeConfig> = {}) {
    this.config = {
      autoIndex: true,
      batchSize: 10,
      retryAttempts: 3,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    // Subscribe to source import events
    this.unsubscribe = onStoreEvent('SOURCE_IMPORTED', async (payload) => {
      if (this.config.autoIndex) {
        await this.indexSource(payload.source);
      }
    });
  }

  async indexSource(source: SourceDocument): Promise<void> {
    // 1. Generate embeddings
    const embeddings = await embeddingService.embed(source.content, {
      taskType: 'RETRIEVAL_DOCUMENT',
    });

    // 2. Add to Orama index
    await oramaIndex.addDocument({
      id: source.id,
      content: source.content,
      embeddings,
      metadata: {
        title: source.title,
        sourceType: source.type,
        createdAt: source.createdAt,
        tags: source.tags || [],
      },
    });

    // 3. Emit indexed event
    emitStoreEvent('SOURCE_INDEXED', { sourceId: source.id });
  }

  // ... additional methods
}

export const sourceRAGBridge = new SourceRAGBridge();
```

**Validation:**
- [ ] File created with TypeScript types
- [ ] No import errors
- [ ] Build passes

---

## Step 2: Wire Import Dialog to Bridge

**Task:** Modify SourceImportDialog to trigger indexing after import

**Target File:** `src/presentation/components/knowledge/SourceImportDialog.tsx`

**Changes:**
1. Import `sourceRAGBridge`
2. After successful import, call `sourceRAGBridge.indexSource()`
3. Show indexing progress in UI
4. Handle indexing errors gracefully

**Code Changes:**
```typescript
// Add import
import { sourceRAGBridge } from '@/lib/knowledge/source-rag-bridge';

// In handleImport function, after source is saved:
const handleImport = async () => {
  // ... existing import logic ...
  
  // After source saved to Dexie:
  setStatus('indexing');
  try {
    await sourceRAGBridge.indexSource(newSource);
    setStatus('complete');
  } catch (error) {
    console.error('Indexing failed:', error);
    setStatus('import-only'); // Source saved but not indexed
    toast.warning(t('knowledge.import.indexingFailed'));
  }
};
```

**Validation:**
- [ ] Import dialog shows "Indexing..." status
- [ ] Sources appear in RAG search after import
- [ ] Build passes

---

## Step 3: Add Store Event Definitions

**Task:** Add new store events for source/RAG lifecycle

**Target File:** `src/lib/events/store-events.ts`

**Add Events:**
```typescript
export const STORE_EVENTS = {
  // ... existing events ...
  
  // Source lifecycle events
  SOURCE_IMPORTED: 'source:imported',
  SOURCE_INDEXED: 'source:indexed',
  SOURCE_INDEX_FAILED: 'source:index-failed',
  SOURCE_SYNTHESIZED: 'source:synthesized',
  SOURCE_DELETED: 'source:deleted',
} as const;
```

**Validation:**
- [ ] Events exported correctly
- [ ] TypeScript types updated
- [ ] Build passes

---

## Step 4: Update Source Store to Emit Events

**Task:** Modify source store to emit events on import

**Target File:** `src/infrastructure/persistence/stores/knowledge-store.ts` (or equivalent)

**Changes:**
1. Import `emitStoreEvent`
2. After adding source, emit `SOURCE_IMPORTED`
3. Pass source data in event payload

**Validation:**
- [ ] Event emitted after successful import
- [ ] Bridge receives event
- [ ] Build passes

---

## Step 5: Add Indexed Status to Source UI

**Task:** Show "Indexed" badge on SourceCard when source is in RAG index

**Target File:** `src/presentation/components/knowledge/SourceCard.tsx`

**Changes:**
1. Add `isIndexed` prop or check from store
2. Show badge: "📊 Indexed" or "⚪ Not Indexed"
3. Add hover tooltip explaining status

**Code Example:**
```tsx
{source.isIndexed ? (
  <Badge variant="success" size="sm">
    <Search className="w-3 h-3 mr-1" />
    {t('knowledge.source.indexed')}
  </Badge>
) : (
  <Badge variant="outline" size="sm">
    {t('knowledge.source.notIndexed')}
  </Badge>
)}
```

**Validation:**
- [ ] Badge visible on source cards
- [ ] Status updates after indexing
- [ ] i18n strings added (EN + VI)

---

## Step 6: Add i18n Strings

**Target Files:**
- `src/i18n/en.json`
- `src/i18n/vi.json`

**Strings to Add:**
```json
{
  "knowledge": {
    "import": {
      "indexing": "Indexing for search...",
      "indexingFailed": "Import successful but indexing failed. Source won't appear in searches.",
      "indexingComplete": "Source indexed and searchable"
    },
    "source": {
      "indexed": "Searchable",
      "notIndexed": "Not in search index"
    }
  }
}
```

---

## Step 7: Final Validation

Run these checks:

```bash
# 1. Build passes
pnpm build

# 2. TypeScript check
pnpm tsc --noEmit

# 3. Test import flow manually:
# - Import a PDF
# - Check Orama index contains the document
# - Search for content from the PDF
# - Verify results returned
```

**Acceptance Criteria:**
- [ ] Import completion → auto-index in Orama
- [ ] Embeddings generated for imported content
- [ ] Source metadata preserved in index
- [ ] UI shows indexed status
- [ ] Build passes with 0 errors

---

## Update LOOP_STATE.yaml

After completion, update:
```yaml
phase_1:
  tasks:
    - id: "wire-source-to-orama"
      status: "DONE"
      completed_at: "{{timestamp}}"
      notes: "Bridge service created, events wired, UI updated"
```
