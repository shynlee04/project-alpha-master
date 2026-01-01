# NeuralNote Architecture Specification v1.0
## Technical Implementation Blueprint for Local-First RAG on Android

**Document Status:** Production-Ready  
**Version:** 1.0  
**Last Updated:** 2026-01-02  
**Classification:** Technical / Architecture  

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Module Hierarchy](#2-module-hierarchy)
3. [Data Layer Specification](#3-data-layer-specification)
4. [RAG Pipeline (Deep Dive)](#4-rag-pipeline-deep-dive)
5. [Performance & Optimization Strategies](#5-performance--optimization-strategies)
6. [Security Architecture](#6-security-architecture)
7. [Integration Patterns & API Contracts](#7-integration-patterns--api-contracts)
8. [Deployment & DevOps](#8-deployment--devops)

---

## 1. System Architecture

### 1.1 Layered Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  [Editor UI] [Database UI] [Canvas/Graph] [Chat] [Synthesis] │
│        Tamagui/React Native Components                       │
└─────────────────────────────────────────────────────────────┘
                             ↕ (props, events)
┌─────────────────────────────────────────────────────────────┐
│                      LOGIC LAYER (Zustand)                   │
│  - WorkspaceStore  - EditorStore  - RAGStore                │
│  - UIStateStore    - SynthesisStore                          │
│        MMKV (Synchronous Persistence)                        │
└─────────────────────────────────────────────────────────────┘
                        ↕ (queries, actions)
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER (Domain Logic)               │
│  BlockService  DatabaseService  RAGService                   │
│  SynthesisService  ImportExportService  GraphService         │
│        Pure TypeScript, zero React imports                   │
└─────────────────────────────────────────────────────────────┘
                        ↕ (async/JSI calls)
┌─────────────────────────────────────────────────────────────┐
│                   NATIVE/JSI LAYER (C++)                     │
│  op-sqlite  sqlite-vec  MediaPipe  ExecuTorch               │
│  react-native-skia  react-native-worklets-core              │
│        JavaScript Interface to Native Code                   │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                   SYSTEM LAYER (Android OS)                  │
│  FileSystem  Encryption  Permissions  NPU/GPU               │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Architectural Principles

**Principle 1: Unidirectional Data Flow**
```
UI (React Composable)
  ↓ [event: user clicks "save"]
Zustand Store (optimistic update)
  ↓ [dispatch: updateBlock(id, content)]
Service Layer (validate, transform)
  ↓ [call: db.update(...)]
Native Layer (SQLite transaction)
  ✓ [persist to disk]
```

**Principle 2: Bridge-Free Design**
- JSI (JavaScript Interface) used exclusively for hot paths (database, embeddings, LLM).
- JSON serialization avoided for large datasets (vectors, images).
- Callback-based streaming for LLM responses (don't wait for full response).

**Principle 3: Reactive State Management**
- Zustand slices (one per domain: workspace, editor, rag).
- Each store slice <200 lines (enforced via linter).
- MMKV listener for cross-component updates.

**Principle 4: Performance-First Constraints**
- Composables <150 lines; Services <300 lines.
- All state updates under 16ms (60fps target).
- Vector operations offloaded to Worklets (GPU/background thread).

---

## 2. Module Hierarchy

### 2.1 Directory Structure

```
project-root/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── editor.tsx            # Editor UI (Blocks)
│   │   ├── database.tsx          # Database UI (Tables/Cards)
│   │   ├── graph.tsx             # Graph View (Skia)
│   │   ├── canvas.tsx            # Canvas (Spatial)
│   │   └── synthesis.tsx         # Chat & Synthesis
│   ├── login.tsx
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── BlockEditor.tsx
│   │   │   ├── BlockMenu.tsx
│   │   │   └── BlockTypes.tsx
│   │   ├── database/
│   │   │   ├── TableView.tsx
│   │   │   ├── GalleryView.tsx
│   │   │   └── PropertyEditor.tsx
│   │   ├── graph/
│   │   │   ├── GraphCanvas.tsx   # Skia rendering
│   │   │   ├── ForceLayout.tsx   # Physics simulation
│   │   │   └── NodeMenu.tsx
│   │   ├── canvas/
│   │   │   ├── InfiniteCanvas.tsx
│   │   │   ├── CardNode.tsx
│   │   │   └── EdgeRenderer.tsx
│   │   └── synthesis/
│   │       ├── ChatBubble.tsx
│   │       ├── CitationPopover.tsx
│   │       └── ArtifactGenerator.tsx
│   ├── stores/
│   │   ├── workspace.store.ts    # Zustand + MMKV
│   │   ├── editor.store.ts
│   │   ├── rag.store.ts
│   │   ├── ui.store.ts
│   │   └── synthesis.store.ts
│   ├── services/
│   │   ├── block.service.ts
│   │   ├── database.service.ts
│   │   ├── rag.service.ts        # Vector search + LLM
│   │   ├── synthesis.service.ts  # Artifact generation
│   │   ├── import-export.service.ts
│   │   └── graph.service.ts      # Edge/relation logic
│   ├── native/
│   │   ├── jsi-bindings.ts       # JSI interface definitions
│   │   ├── sqlite.ts             # op-sqlite wrapper
│   │   ├── embedding.ts          # MediaPipe bridge
│   │   ├── llm.ts                # ExecuTorch bridge
│   │   └── worklets.ts           # Reanimated Worklets
│   ├── types/
│   │   ├── index.ts              # Common types
│   │   ├── block.types.ts
│   │   ├── database.types.ts
│   │   ├── graph.types.ts
│   │   └── rag.types.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── logger.ts
│   │   └── chunking.ts           # Text chunking logic
│   └── hooks/
│       ├── useBlockEditor.ts
│       ├── useDatabase.ts
│       ├── useRAG.ts
│       ├── useGraph.ts
│       └── useCanvas.ts
├── native/
│   ├── cpp/                      # C++ JSI modules
│   │   ├── sqlite-wrapper/
│   │   ├── embedding-bridge/
│   │   └── inference-bridge/
│   └── android/                  # Native Android code
│       ├── MainActivity.kt
│       └── modules/
├── scripts/
│   ├── validate.sh
│   ├── benchmark.sh
│   └── deploy.sh
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   ├── stores/
│   │   └── utils/
│   ├── e2e/
│   │   └── maestro/
│   │       ├── editor.flow.yaml
│   │       ├── synthesis.flow.yaml
│   │       └── graph.flow.yaml
│   └── integration/
├── docs/
│   ├── ARCHITECTURE.md           # This file
│   ├── API_CONTRACTS.md
│   ├── PERFORMANCE_BENCHMARKS.md
│   └── SETUP.md
├── app.json
├── tsconfig.json
├── package.json
└── eas.json
```

### 2.2 Module Ownership & Responsibilities

| Module | Owner | Key Files | Responsibilities |
|--------|-------|-----------|------------------|
| **Editor (Block)** | @mobileDevAgent | `editor/BlockEditor.tsx`, `block.service.ts` | Create, edit, format blocks; handle rich text. |
| **Database** | @mobileDevAgent | `database/TableView.tsx`, `database.service.ts` | Record management, property types, views. |
| **Graph & Canvas** | @nativeModuleAgent | `graph/GraphCanvas.tsx`, `native/worklets.ts` | Rendering, layout physics, GPU optimization. |
| **RAG Pipeline** | @nativeModuleAgent | `rag.service.ts`, `native/embedding.ts`, `native/llm.ts` | Embedding, search, inference, citation mapping. |
| **Synthesis** | @mobileDevAgent | `synthesis.service.ts`, `synthesis/ArtifactGenerator.tsx` | Brief, FAQ, mind map, flashcard generation. |
| **Storage & Sync** | @architectAgent | `native/sqlite.ts`, `stores/workspace.store.ts` | Persistence, CRDT ops (future), encryption. |

---

## 3. Data Layer Specification

### 3.1 SQLite Schema (Complete)

```sql
-- ============================================
-- WORKSPACES
-- ============================================
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  encryption_key_id TEXT,  -- Reference to Keystore entry
  last_sync INTEGER
);
CREATE INDEX idx_workspaces_name ON workspaces(name);

-- ============================================
-- BLOCKS (Atomic Content Units)
-- ============================================
CREATE TABLE blocks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  parent_id TEXT,  -- NULL if root; otherwise block_id
  position INTEGER NOT NULL,  -- Order among siblings
  type TEXT NOT NULL,  -- 'page', 'heading', 'paragraph', 'code', 'image', 'embed', ...
  content JSONB NOT NULL,  -- Type-specific data
  metadata JSONB,  -- { "tags": [...], "mentions": [...], "properties": {...} }
  vector BLOB,  -- 768-dim embedding (float32, ~3KB)
  is_synced BOOLEAN DEFAULT 0,  -- Part of a synced block group
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by TEXT,
  version INTEGER DEFAULT 1,  -- Optimistic locking
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES blocks(id) ON DELETE CASCADE
);
CREATE INDEX idx_blocks_workspace_parent ON blocks(workspace_id, parent_id);
CREATE INDEX idx_blocks_type ON blocks(type);
CREATE INDEX idx_blocks_updated_at ON blocks(updated_at);

-- Full-text search index (for block content)
CREATE VIRTUAL TABLE blocks_fts USING fts5(
  id,
  content,
  tokenize = 'porter'
);

-- ============================================
-- DATABASES (Record Collections)
-- ============================================
CREATE TABLE databases (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- Emoji or icon identifier
  schema JSONB NOT NULL,  -- { "properties": { "title": { "type": "text" }, ... } }
  view_ids JSONB,  -- List of associated view configs
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, name)
);
CREATE INDEX idx_databases_workspace ON databases(workspace_id);

-- Database Records (typed blocks)
-- Each record is a block with type='database_record' and a relation to the database
CREATE TABLE database_records (
  id TEXT PRIMARY KEY,
  database_id TEXT NOT NULL,
  block_id TEXT NOT NULL UNIQUE,  -- The page/block storing the record content
  properties JSONB NOT NULL,  -- { "title": "...", "author": "...", "rating": 5, ... }
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (database_id) REFERENCES databases(id) ON DELETE CASCADE,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
);
CREATE INDEX idx_database_records_db_id ON database_records(database_id);

-- ============================================
-- EDGES (Links & Relationships)
-- ============================================
CREATE TABLE edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'backlink', 'manual', 'canvas_connection', 'relation'
  label TEXT,  -- Optional label for edge
  metadata JSONB,  -- { "color": "#FF0000", ... }
  created_at INTEGER NOT NULL,
  FOREIGN KEY (source_id) REFERENCES blocks(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES blocks(id) ON DELETE CASCADE,
  UNIQUE(source_id, target_id, type)
);
CREATE INDEX idx_edges_source ON edges(source_id);
CREATE INDEX idx_edges_target ON edges(target_id);
CREATE INDEX idx_edges_type ON edges(type);

-- ============================================
-- CONVERSATIONS (RAG Sessions)
-- ============================================
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT,
  context_block_ids JSONB NOT NULL,  -- [block_id, ...]
  context_tags JSONB,  -- Tags used to filter blocks
  history JSONB NOT NULL,  -- [{ "role": "user/assistant", "content": "...", "tokens": N }, ...]
  model_name TEXT,  -- "llama-3.2-1b" for reproducibility
  temperature REAL DEFAULT 0.7,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
CREATE INDEX idx_conversations_workspace ON conversations(workspace_id);

-- Conversation Turns (indexed for citation retrieval)
CREATE TABLE conversation_turns (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  embedded BOOLEAN DEFAULT 0,  -- Whether this turn was embedded
  source_citation_map JSONB,  -- For assistant turns: { "citation_1": { "block_id": "...", "excerpt": "..." }, ... }
  created_at INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
CREATE INDEX idx_conversation_turns_conv_id ON conversation_turns(conversation_id);

-- ============================================
-- ARTIFACT GENERATIONS (Synthesis Outputs)
-- ============================================
CREATE TABLE artifact_generations (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,  -- NULL if generated standalone
  workspace_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,  -- 'brief', 'faq', 'mind_map', 'flashcard_set'
  source_block_ids JSONB NOT NULL,  -- [block_id, ...]
  artifact_content JSONB NOT NULL,  -- The generated artifact
  source_citation_map JSONB,  -- { "1": { "block_id": "...", "excerpt": "..." }, ... }
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);
CREATE INDEX idx_artifacts_workspace ON artifact_generations(workspace_id);

-- ============================================
-- VECTOR INDEX (sqlite-vec extension)
-- ============================================
CREATE VIRTUAL TABLE blocks_vectors USING vec0(
  id TEXT,
  embedding FLOAT[768]
);

-- Trigger to keep vectors in sync with blocks
CREATE TRIGGER blocks_vector_insert
AFTER INSERT ON blocks
BEGIN
  INSERT INTO blocks_vectors(id, embedding)
  VALUES (NEW.id, NEW.vector);
END;

CREATE TRIGGER blocks_vector_update
AFTER UPDATE ON blocks
BEGIN
  UPDATE blocks_vectors SET embedding = NEW.vector WHERE id = NEW.id;
END;

-- ============================================
-- SYNC LOG (Future: Cross-Device Sync)
-- ============================================
CREATE TABLE sync_log (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  operation TEXT NOT NULL,  -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL,  -- 'block', 'database', 'edge', ...
  entity_id TEXT NOT NULL,
  changes JSONB,  -- Before/after state
  timestamp INTEGER NOT NULL,
  device_id TEXT,  -- Which device made this change
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
CREATE INDEX idx_sync_log_workspace_ts ON sync_log(workspace_id, timestamp);
```

### 3.2 Vector Index Operations (via sqlite-vec)

```typescript
// Example: Insert block with embedding
const embedding = await generateEmbedding(blockContent);
db.execute(
  `INSERT INTO blocks_vectors(id, embedding) VALUES (?, ?)`,
  [blockId, embedding]  // embedding is Float32Array
);

// Example: Semantic search
const queryVector = await generateEmbedding(userQuery);
const results = db.execute(
  `SELECT id, distance FROM blocks_vectors
   WHERE embedding MATCH mips_query(?)
   LIMIT 5`,
  [queryVector]
);
// Results: [{ id: "block-1", distance: 0.15 }, ...]
```

---

## 4. RAG Pipeline (Deep Dive)

### 4.1 End-to-End Flow

```
┌──────────────────┐
│  USER ACTION:    │
│  - Import Note   │
│  - Edit Block    │
│  - Delete Text   │
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│  INGEST & CHUNKING                   │
│  (BlockService)                      │
│  - Extract text from block           │
│  - Chunk with sliding window         │
│  - Generate chunk metadata           │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  EMBEDDING GENERATION                │
│  (MediaPipe, JSI, Worklet)           │
│  - Batch chunks for efficiency       │
│  - Run embedding model on-device     │
│  - Cache embeddings for reuse        │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  STORE VECTORS                       │
│  (op-sqlite, sqlite-vec)             │
│  - Insert/update vectors in DB       │
│  - FTS index for text search         │
│  - Trigger maintains consistency     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  [INDEXED - Ready for Retrieval]     │
│  Vector Index: 1k–100k vectors       │
│  Text Index: FTS5 for keywords       │
└──────────────────────────────────────┘
         ↓ (User asks a question)
┌──────────────────────────────────────┐
│  QUERY PROCESSING                    │
│  (RAGService)                        │
│  - Embed user question               │
│  - Define retrieval filters          │
│    (tags, time range, databases)     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  RETRIEVAL (Hybrid)                  │
│  Step 1: Vector similarity search    │
│    - sqlite-vec cosine/MIP           │
│    - Top 10 candidates               │
│  Step 2: BM25 (FTS5) keyword search  │
│    - Top 10 keyword matches          │
│  Step 3: Merge & re-rank             │
│    - Dedupe, score, limit to top 5   │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  CONTEXT ASSEMBLY                    │
│  (PromptBuilder)                     │
│  - Truncate/overlap retrieved chunks │
│  - Build system prompt               │
│  - Insert retrieved context          │
│  - Total context < 2k tokens         │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  LLM INFERENCE                       │
│  (ExecuTorch, on-device)             │
│  - Llama 3.2 1B quantized            │
│  - Streaming token generation        │
│  - Target TTFT <1.5s                 │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  POST-PROCESSING & CITATION          │
│  (CitationMapper)                    │
│  - Parse response for citations      │
│  - Map each citation to source block │
│  - Create artifact_generations entry │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  UI DISPLAY                          │
│  - Render response + citations       │
│  - Allow clicking through to sources │
│  - Save to conversation history      │
└──────────────────────────────────────┘
```

### 4.2 Chunking Strategy

**Algorithm: Recursive Semantic Chunking**

```typescript
interface ChunkConfig {
  maxTokens: number;        // 512
  overlapTokens: number;    // 50
  respectBlockBoundaries: boolean;  // true
  sentenceBuffer: number;   // Keep sentences intact
}

function recursiveChunk(text: string, config: ChunkConfig): Chunk[] {
  // Level 1: Split by blocks (if nested blocks)
  const blocks = text.split('\n\n');
  
  // Level 2: Split each block into sentences
  const sentences = blocks.flatMap(b => b.split(/[.!?]\s+/));
  
  // Level 3: Accumulate sentences until maxTokens
  const chunks: Chunk[] = [];
  let current = '';
  let overlap = '';
  
  for (const sentence of sentences) {
    const tokenCount = estimateTokens(current + sentence);
    if (tokenCount > config.maxTokens && current.length > 0) {
      // Save chunk with overlap
      chunks.push({
        text: current + overlap,
        startChar: ...,
        endChar: ...,
        sourceId: blockId
      });
      // Start new chunk with overlap
      current = overlap + sentence;
      overlap = getLastN(current, config.overlapTokens);
    } else {
      current += ' ' + sentence;
    }
  }
  if (current) chunks.push({ text: current, ... });
  
  return chunks;
}
```

### 4.3 Embedding Generation (MediaPipe)

```typescript
// JSI Bridge: embedding.ts
import { NativeModules } from 'react-native';

const EmbeddingModule = NativeModules.EmbeddingModule;

async function generateEmbedding(text: string): Promise<Float32Array> {
  // On first call: download MediaPipe model (~50MB)
  await EmbeddingModule.ensureModelLoaded();
  
  // Generate embedding
  const vector = await EmbeddingModule.embed(text);
  
  // Returns: Float32Array (768 dims)
  return vector;
}

// Batch embedding for efficiency
async function batchEmbed(texts: string[]): Promise<Float32Array[]> {
  return Promise.all(texts.map(t => generateEmbedding(t)));
}
```

### 4.4 Vector Similarity Search

```typescript
interface RetrievalQuery {
  embedding: Float32Array;
  limit?: number;           // 5–10
  similarityThreshold?: number;  // 0.3
  filters?: {
    blockIds?: string[];
    tags?: string[];
    dateRange?: [number, number];
    databases?: string[];
  };
}

function semanticSearch(query: RetrievalQuery): RetrievalResult[] {
  // Build WHERE clause from filters
  let where = 'WHERE 1=1';
  if (query.filters?.tags) {
    where += ` AND metadata->>'tags' LIKE ?`;  // JSON search (DB-specific)
  }
  if (query.filters?.dateRange) {
    where += ` AND updated_at BETWEEN ? AND ?`;
  }
  
  // SQLite-VEC query (cosine distance)
  const results = db.execute(`
    SELECT b.id, b.content, bv.distance
    FROM blocks b
    JOIN blocks_vectors bv ON b.id = bv.id
    ${where}
    WHERE bv.embedding MATCH cos_query(?)
    ORDER BY bv.distance ASC
    LIMIT ?
  `, [query.embedding, query.limit || 5]);
  
  return results.map(r => ({
    blockId: r.id,
    content: r.content,
    relevanceScore: 1 - r.distance,  // Convert distance to score
  }));
}
```

### 4.5 Citation Mapping

```typescript
interface Citation {
  id: string;              // "[1]"
  blockId: string;
  blockTitle: string;
  excerpt: string;         // The relevant chunk
  relevanceScore: number;
}

interface AnnotatedResponse {
  text: string;            // Response with [1], [2], etc.
  citations: Citation[];
}

function mapCitations(response: string, retrievedChunks: Chunk[]): AnnotatedResponse {
  const citations: Citation[] = [];
  let annotatedText = response;
  
  // Simple heuristic: for each sentence in response,
  // find the most relevant source chunk
  const sentences = response.split(/[.!?]/);
  let citationCounter = 1;
  
  for (const sentence of sentences) {
    if (sentence.trim().length < 10) continue;  // Skip short
    
    // Find best matching chunk
    const embedding = await generateEmbedding(sentence);
    const matches = semanticSearch({ embedding, limit: 1 });
    
    if (matches.length > 0 && matches[0].relevanceScore > 0.5) {
      const chunk = matches[0];
      const citation: Citation = {
        id: `[${citationCounter}]`,
        blockId: chunk.blockId,
        blockTitle: getBlockTitle(chunk.blockId),
        excerpt: chunk.content.substring(0, 200),
        relevanceScore: chunk.relevanceScore
      };
      citations.push(citation);
      annotatedText = annotatedText.replace(sentence, `${sentence} [${citationCounter}]`);
      citationCounter++;
    }
  }
  
  return { text: annotatedText, citations };
}
```

### 4.6 LLM Inference (ExecuTorch)

```typescript
// llm.ts (JSI Bridge to ExecuTorch)

interface LLMConfig {
  modelPath: string;        // Path to quantized model file
  temperature: number;
  maxTokens: number;
  stopTokens?: number[];
}

class LLMInference {
  private model: any;  // Native model handle
  
  async initialize(config: LLMConfig) {
    // Load model into memory (2–3GB)
    this.model = await NativeModules.LLMModule.loadModel(config.modelPath);
  }
  
  async generate(
    prompt: string,
    config: Partial<LLMConfig> = {}
  ): Promise<AsyncIterable<string>> {
    // Return async generator for streaming
    return NativeModules.LLMModule.generate({
      prompt,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 256
    });
  }
  
  async generateWithCallback(
    prompt: string,
    onToken: (token: string) => void
  ) {
    const generator = await this.generate(prompt);
    for await (const token of generator) {
      onToken(token);  // UI updates in real-time
    }
  }
}
```

---

## 5. Performance & Optimization Strategies

### 5.1 Memory Management

**Problem:** Model + Index can consume 3–5GB on a 6GB phone.

**Solution:**

| Phase | Memory Target | Strategy |
|-------|---------------|----------|
| **Idle** | <150MB | Unload LLM; keep index in memory. |
| **Chat Session** | <350MB | Load LLM on-demand; stream responses. |
| **Index Building** | <500MB | Batch embedding (don't load all vectors in RAM). |

**Code Pattern:**

```typescript
class LLMInferenceOptimized {
  private modelLoaded = false;
  
  async ensureModelLoaded() {
    if (!this.modelLoaded) {
      await this.loadModel();
      this.modelLoaded = true;
      // Set timer to unload after 5 min of inactivity
      this.inactivityTimer = setTimeout(() => {
        this.unloadModel();
        this.modelLoaded = false;
      }, 5 * 60 * 1000);
    }
  }
  
  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.ensureModelLoaded();
  }
}
```

### 5.2 Vector Index Optimization

**Problem:** 100k vectors = 300MB+ at 768 dimensions.

**Solution 1: Dimensionality Reduction**
- Use 384-dim embeddings instead of 768 (50% size, minimal quality loss).
- Quantize embeddings to int8 (4x compression).

**Solution 2: Lazy Loading**
- Keep only active workspace vectors in memory.
- Archive old blocks to a separate index file.

**Solution 3: Periodic Pruning**
- Delete embeddings for archived/deleted blocks.
- Rebuild index weekly (SQLite VACUUM).

### 5.3 UI Rendering Optimization

**Composables:**

```typescript
// ❌ Slow: Re-renders entire list on state change
function BlockList() {
  const blocks = useStore(s => s.blocks);  // This triggers re-render on ANY store change
  return <FlashList data={blocks} renderItem={...} />;
}

// ✅ Fast: Selector granularity
function BlockList() {
  const blocks = useStore(s => s.blocks.filter(b => b.parent_id === null));  // Specific slice
  return <FlashList data={blocks} renderItem={...} />;
}

// ✅ Memoized item renderer
const BlockItem = memo(({ block }: { block: Block }) => (
  <View style={styles.item}>
    <Text>{block.content.text}</Text>
  </View>
));
```

**Graph Rendering:**

```typescript
// Use Skia Worklet for graph physics (GPU/background thread)
const updateGraphLayout = useWorklet((nodes, edges) => {
  // This runs on the GPU thread, not the JS thread
  // Prevents UI freeze
  for (let i = 0; i < iterations; i++) {
    updateForces(nodes, edges);
  }
  return nodes;
});

// Call from Gesture Handler
const gesture = Gesture.Pan().onUpdate(({ translationX, translationY }) => {
  runOnUI(updateGraphLayout)(nodes, edges);
});
```

### 5.4 Database Query Optimization

```typescript
-- Index strategy: Create indexes for common queries
CREATE INDEX idx_blocks_workspace_type ON blocks(workspace_id, type);
CREATE INDEX idx_edges_source_target ON edges(source_id, target_id);

-- Query optimization: Use EXPLAIN QUERY PLAN
EXPLAIN QUERY PLAN
SELECT b.* FROM blocks b
WHERE b.workspace_id = ? AND b.type = 'page'
ORDER BY b.updated_at DESC
LIMIT 20;

-- Good: Uses index; ~2ms on 10k blocks
-- Bad (without index): Full table scan; ~50ms
```

---

## 6. Security Architecture

### 6.1 Encryption at Rest

**Algorithm:** AES-256-GCM  
**Key Storage:** Android Keystore (hardware-backed if available)  
**Scope:** All user data (blocks, database records, vectors, conversations)

```typescript
class EncryptionService {
  private keyAlias = "neuralnote_key";
  
  async initializeKey() {
    const keyExists = await this.keyExists(this.keyAlias);
    if (!keyExists) {
      // Create key in Android Keystore (hardware-backed)
      await NativeModules.EncryptionModule.generateKey(this.keyAlias, {
        keySize: 256,
        blockMode: 'GCM',
        encryptionPadding: 'NoPadding',
        useStrongBoxIfAvailable: true
      });
    }
  }
  
  async encrypt(plaintext: string): Promise<string> {
    const encrypted = await NativeModules.EncryptionModule.encrypt(
      this.keyAlias,
      plaintext
    );
    return encrypted;  // Returns: base64(iv + ciphertext + tag)
  }
  
  async decrypt(ciphertext: string): Promise<string> {
    const plaintext = await NativeModules.EncryptionModule.decrypt(
      this.keyAlias,
      ciphertext
    );
    return plaintext;
  }
}

// Usage in DatabaseService
async function saveBlock(block: Block) {
  const encryptedContent = await encryptionService.encrypt(
    JSON.stringify(block.content)
  );
  db.execute(
    `UPDATE blocks SET content = ? WHERE id = ?`,
    [encryptedContent, block.id]
  );
}
```

### 6.2 Data Privacy & Isolation

- **No network calls** for RAG, search, or synthesis.
- **Local temp files** encrypted if created (for PDF processing).
- **No crash reporting** (errors logged to local file only).
- **No analytics/telemetry.**
- **Permissions minimal:** FileSystem (required), Camera (optional for OCR).

### 6.3 Access Control

```typescript
interface AccessPolicy {
  workspace_id: string;
  user_id?: string;  // NULL for local-only
  read: boolean;
  write: boolean;
  delete: boolean;
}

// Phase 1: Single-user (local-only) workspace
// Phase 2 (future): Multi-device sync with encryption
```

---

## 7. Integration Patterns & API Contracts

### 7.1 Service Layer Interface (TypeScript)

```typescript
// block.service.ts
interface BlockService {
  // Create
  createBlock(workspaceId: string, parentId: string | null, type: BlockType, content: any): Promise<Block>;
  
  // Read
  getBlock(id: string): Promise<Block>;
  getBlockChildren(parentId: string): Promise<Block[]>;
  
  // Update
  updateBlock(id: string, updates: Partial<Block>): Promise<Block>;
  moveBlock(id: string, newParentId: string, newPosition: number): Promise<Block>;
  
  // Delete
  deleteBlock(id: string): Promise<void>;
  
  // Bulk
  bulkUpdateBlocks(updates: Array<{ id: string; changes: Partial<Block> }>): Promise<void>;
  
  // Special
  syncBlock(id: string, groupId: string): Promise<void>;
  unsyncBlock(id: string): Promise<void>;
  
  // Indexing
  reindexBlock(id: string): Promise<void>;  // Re-embed and index
  reindexWorkspace(workspaceId: string): Promise<ProgressEvent>;  // Batch re-index
}

// rag.service.ts
interface RAGService {
  // Query
  semanticSearch(query: string, filters: RetrievalFilters): Promise<RetrievalResult[]>;
  
  // Chat
  chat(conversation_id: string, userMessage: string): Promise<AsyncIterable<string>>;
  
  // Synthesis
  generateBrief(blockIds: string[]): Promise<Brief>;
  generateFAQ(blockIds: string[]): Promise<FAQ>;
  generateMindMap(blockIds: string[]): Promise<MindMap>;
  generateFlashcards(blockIds: string[]): Promise<Flashcard[]>;
  
  // Management
  listConversations(workspaceId: string): Promise<Conversation[]>;
  deleteConversation(conversationId: string): Promise<void>;
}
```

### 7.2 Store (Zustand) Interface

```typescript
// editor.store.ts
interface EditorStore {
  // State
  currentBlockId: string | null;
  editingText: string;
  selectionRange: [number, number];
  isDirty: boolean;
  
  // Actions
  setCurrentBlock(id: string): void;
  setEditingText(text: string): void;
  setSelection(start: number, end: number): void;
  
  // Mutations
  saveBlock(): Promise<void>;
  discardChanges(): void;
}

// Access in components
const EditingBlock = () => {
  const currentBlockId = useStore(s => s.currentBlockId);
  const editingText = useStore(s => s.editingText);
  const setEditingText = useStore(s => s.setEditingText);
  
  return <TextInput value={editingText} onChangeText={setEditingText} />;
};
```

---

## 8. Deployment & DevOps

### 8.1 Build & Release Pipeline

```yaml
# eas.json (Expo Application Services)
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "keystore": "production.jks"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk",
        "nodeVersion": "18.0.0"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "production"
      }
    }
  }
}
```

### 8.2 Version Management

```
Version: MAJOR.MINOR.PATCH-SUFFIX
Example: 1.0.0-alpha, 1.0.0-beta, 1.0.0

MAJOR: Breaking schema changes (DB migration required)
MINOR: New features
PATCH: Bug fixes
```

### 8.3 Database Migrations (SQLite)

```typescript
// migrations/001_initial_schema.sql
-- Run once on first install
CREATE TABLE workspaces (...);
CREATE TABLE blocks (...);
-- ...

// migrations/002_add_vector_index.sql
-- Run on update from v0.9 → v1.0
CREATE VIRTUAL TABLE blocks_vectors USING vec0(...);

// Migration runner
async function runMigrations(db: Database) {
  const version = await getSchemaVersion(db);
  
  for (let v = version + 1; v <= LATEST_VERSION; v++) {
    const migration = require(`./migrations/${String(v).padStart(3, '0')}_*.sql`);
    await db.executeSql(migration);
    await setSchemaVersion(db, v);
  }
}
```

---

## Appendix: Performance Benchmarks

| Operation | Target | Measurement Device |
|-----------|--------|-------------------|
| App startup | <1.2s | Pixel 6a, cold |
| Block creation | <50ms | Pixel 6a |
| Search (10k blocks) | <500ms | Pixel 6a |
| Embedding generation (100 words) | <200ms | Pixel 6a |
| Inference (TTFT) | <1.5s | Pixel 7 |
| Canvas pan/zoom (1k nodes) | 60fps | Pixel 6a |
| Database filter + sort | <100ms | Pixel 6a |

---

**Document Prepared By:** Architecture Team  
**Next Review:** Post-MVP (May 2026)