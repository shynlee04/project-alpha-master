# RAG & Knowledge Synthesis Infrastructure Design
## Via-gent Knowledge Management Architecture

**Date**: 2025-12-28
**Epic**: Epic 30 - Knowledge Synthesis Station
**Phase**: Investigation & Research

---

## Executive Summary

This document specifies the database strategies, embedding techniques, and chunking methodologies for implementing a local-first RAG (Retrieval-Augmented Generation) system within Via-gent, supporting the Knowledge Synthesis Station concept.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Knowledge Synthesis Stack                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ UI Layer           │ KnowledgeCanvas, SourceCards, FlashcardDeck           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Synthesis Engine   │ ChunkManager, EmbeddingService, ContextBuilder        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Storage Layer      │ Dexie.js (IndexedDB), Vector Index (In-Memory)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Source Processors  │ PDFParser, URLFetcher, AudioTranscriber               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Strategy

### 2.1 Dexie.js Schema Extension

```typescript
// src/lib/state/dexie-db.ts additions

/** Knowledge source record */
interface SourceRecord {
    id: string;              // UUID
    notebookId: string;      // Parent notebook
    type: 'pdf' | 'url' | 'text' | 'audio' | 'video';
    title: string;
    url?: string;
    content: string;         // Extracted text
    metadata: {
        wordCount: number;
        createdAt: Date;
        processedAt: Date;
    };
}

/** Chunk record for RAG retrieval */
interface ChunkRecord {
    id: string;              // UUID
    sourceId: string;        // Parent source
    content: string;         // Chunk text
    embedding: number[];     // Vector (384 or 768 dims)
    metadata: {
        startOffset: number;
        endOffset: number;
        chunkIndex: number;
        tokenCount: number;
    };
}

/** Knowledge notebook (like NotebookLM) */
interface NotebookRecord {
    id: string;
    title: string;
    description?: string;
    sourceIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Dexie stores
class ViaGentDB extends Dexie {
    notebooks!: Table<NotebookRecord>;
    sources!: Table<SourceRecord>;
    chunks!: Table<ChunkRecord>;
    
    constructor() {
        super('via-gent-knowledge');
        this.version(1).stores({
            notebooks: 'id, createdAt, updatedAt',
            sources: 'id, notebookId, type, createdAt',
            chunks: 'id, sourceId'
        });
    }
}
```

### 2.2 Indexing Strategy

| Table | Primary Index | Secondary Indexes | Full-Text |
|-------|---------------|-------------------|-----------|
| `notebooks` | `id` | `createdAt`, `updatedAt` | `title` (future) |
| `sources` | `id` | `notebookId`, `type` | `content` (future) |
| `chunks` | `id` | `sourceId` | N/A |

### 2.3 Vector Index (In-Memory)

```typescript
class VectorIndex {
    private vectors: Map<string, Float32Array> = new Map();
    
    /** Add vector to index */
    add(chunkId: string, embedding: number[]): void {
        this.vectors.set(chunkId, new Float32Array(embedding));
    }
    
    /** Find k nearest neighbors using cosine similarity */
    search(query: number[], k: number = 5): Array<{chunkId: string; score: number}> {
        const queryVec = new Float32Array(query);
        const scores: Array<{chunkId: string; score: number}> = [];
        
        for (const [chunkId, vec] of this.vectors) {
            const score = this.cosineSimilarity(queryVec, vec);
            scores.push({ chunkId, score });
        }
        
        return scores.sort((a, b) => b.score - a.score).slice(0, k);
    }
    
    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
```

---

## 3. Embedding Model Integration

### 3.1 Model Selection

| Model | Size | Dimensions | Speed | Quality |
|-------|------|------------|-------|---------|
| **all-MiniLM-L6-v2** | 23MB | 384 | ⚡ Fast | Good |
| BGE-small-en-v1.5 | 33MB | 384 | Medium | Better |
| Nomic-embed-text | 137MB | 768 | Slow | Best |

**Recommendation**: Start with `all-MiniLM-L6-v2` for MVP, upgrade later.

### 3.2 ONNX Runtime Web Integration

```typescript
import * as ort from 'onnxruntime-web';

class EmbeddingService {
    private session: ort.InferenceSession | null = null;
    private tokenizer: any; // Tokenizer model
    
    async initialize(): Promise<void> {
        // Load ONNX model
        this.session = await ort.InferenceSession.create(
            '/models/all-MiniLM-L6-v2.onnx',
            { executionProviders: ['wasm'] }
        );
        
        // Load tokenizer
        const tokenizerData = await fetch('/models/tokenizer.json').then(r => r.json());
        this.tokenizer = new Tokenizer(tokenizerData);
    }
    
    async embed(text: string): Promise<number[]> {
        if (!this.session) throw new Error('Service not initialized');
        
        // Tokenize
        const tokens = this.tokenizer.encode(text);
        const inputIds = new ort.Tensor('int64', BigInt64Array.from(tokens.map(BigInt)), [1, tokens.length]);
        const attentionMask = new ort.Tensor('int64', BigInt64Array.from(tokens.map(() => 1n)), [1, tokens.length]);
        
        // Run inference
        const results = await this.session.run({
            input_ids: inputIds,
            attention_mask: attentionMask
        });
        
        // Extract embeddings (mean pooling)
        const embeddings = results.last_hidden_state.data as Float32Array;
        return this.meanPool(embeddings, tokens.length, 384);
    }
    
    private meanPool(data: Float32Array, seqLen: number, dim: number): number[] {
        const result = new Array(dim).fill(0);
        for (let i = 0; i < seqLen; i++) {
            for (let j = 0; j < dim; j++) {
                result[j] += data[i * dim + j];
            }
        }
        return result.map(v => v / seqLen);
    }
}
```

### 3.3 Gemini Embeddings (Alternative)

```typescript
// For server-side or API-based embedding
async function embedWithGemini(text: string): Promise<number[]> {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            content: { parts: [{ text }] }
        })
    });
    
    const data = await response.json();
    return data.embedding.values;
}
```

---

## 4. Chunking Strategies

### 4.1 Strategy Selection Matrix

| Content Type | Strategy | Chunk Size | Overlap | Rationale |
|--------------|----------|------------|---------|-----------|
| Technical Docs | Semantic | 512-1024 | 50 | Preserve code blocks |
| Conversations | Sliding | 2048-4096 | 100 | Maintain context |
| Articles | Hierarchical | 1024-2048 | 50 | Respect structure |
| Structured | Record | Variable | N/A | Natural boundaries |

### 4.2 Implementation

```typescript
interface ChunkOptions {
    maxTokens: number;
    overlap: number;
    strategy: 'semantic' | 'sliding' | 'hierarchical' | 'record';
}

class ChunkManager {
    private tokenizer: Tokenizer;
    
    chunk(text: string, options: ChunkOptions): string[] {
        switch (options.strategy) {
            case 'semantic':
                return this.semanticChunk(text, options);
            case 'sliding':
                return this.slidingWindowChunk(text, options);
            case 'hierarchical':
                return this.hierarchicalChunk(text, options);
            case 'record':
                return this.recordBasedChunk(text);
            default:
                return this.slidingWindowChunk(text, options);
        }
    }
    
    /** Semantic chunking - respect paragraph and section boundaries */
    private semanticChunk(text: string, opts: ChunkOptions): string[] {
        const chunks: string[] = [];
        const paragraphs = text.split(/\n\n+/);
        
        let currentChunk = '';
        let currentTokens = 0;
        
        for (const para of paragraphs) {
            const paraTokens = this.tokenizer.count(para);
            
            if (currentTokens + paraTokens > opts.maxTokens) {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = para;
                currentTokens = paraTokens;
            } else {
                currentChunk += '\n\n' + para;
                currentTokens += paraTokens;
            }
        }
        
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }
    
    /** Sliding window with overlap */
    private slidingWindowChunk(text: string, opts: ChunkOptions): string[] {
        const chunks: string[] = [];
        const tokens = this.tokenizer.encode(text);
        const step = opts.maxTokens - opts.overlap;
        
        for (let i = 0; i < tokens.length; i += step) {
            const chunkTokens = tokens.slice(i, i + opts.maxTokens);
            chunks.push(this.tokenizer.decode(chunkTokens));
        }
        
        return chunks;
    }
    
    /** Hierarchical - respect heading structure */
    private hierarchicalChunk(text: string, opts: ChunkOptions): string[] {
        const sections = text.split(/(?=^#{1,3}\s)/m);
        return sections.flatMap(section => {
            if (this.tokenizer.count(section) <= opts.maxTokens) {
                return [section.trim()];
            }
            return this.semanticChunk(section, opts);
        });
    }
    
    /** Record-based for structured data */
    private recordBasedChunk(text: string): string[] {
        // For JSON/CSV, each record is a chunk
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
                return data.map(item => JSON.stringify(item));
            }
        } catch {}
        return [text];
    }
}
```

---

## 5. Source Processing Pipeline

### 5.1 PDF Processing

```typescript
import * as pdfjsLib from 'pdfjs-dist';

async function extractPDFText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');
        pages.push(text);
    }
    
    return pages.join('\n\n');
}
```

### 5.2 URL Content Extraction

```typescript
async function extractURLContent(url: string): Promise<string> {
    // Use Readability for article extraction
    const response = await fetch(url);
    const html = await response.text();
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const reader = new Readability(doc);
    const article = reader.parse();
    
    return article?.textContent || '';
}
```

### 5.3 Audio Transcription

```typescript
// Using Gemini Live API or Web Speech API
async function transcribeAudio(audioBlob: Blob): Promise<string> {
    // Option 1: Gemini
    const base64Audio = await blobToBase64(audioBlob);
    const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
            role: 'user',
            parts: [
                { text: 'Transcribe this audio:' },
                { inlineData: { mimeType: 'audio/wav', data: base64Audio } }
            ]
        }]
    });
    
    return response.text;
}
```

---

## 6. RAG Query Pipeline

### 6.1 Query Flow

```
User Query 
    ↓
Query Embedding (EmbeddingService)
    ↓
Vector Search (VectorIndex.search)
    ↓
Fetch Chunks (Dexie.js)
    ↓
Context Assembly (ContextBuilder)
    ↓
LLM Generation (Gemini/OpenRouter)
    ↓
Response with Citations
```

### 6.2 Context Builder

```typescript
class ContextBuilder {
    async buildContext(chunkIds: string[], maxTokens: number = 4000): Promise<string> {
        const chunks = await db.chunks
            .where('id')
            .anyOf(chunkIds)
            .toArray();
        
        // Sort by score (assuming we have scores)
        const sortedChunks = chunks.sort((a, b) => 
            b.metadata.relevanceScore - a.metadata.relevanceScore
        );
        
        // Build context within token limit
        let context = '';
        let tokenCount = 0;
        
        for (const chunk of sortedChunks) {
            const chunkTokens = this.tokenizer.count(chunk.content);
            if (tokenCount + chunkTokens > maxTokens) break;
            
            context += `\n\n[Source: ${chunk.sourceId}]\n${chunk.content}`;
            tokenCount += chunkTokens;
        }
        
        return context.trim();
    }
}
```

### 6.3 Prompt Template

```typescript
const RAG_PROMPT = `You are a helpful assistant with access to the user's knowledge base.

Use the following context to answer the question. If the context doesn't contain relevant information, say so.

CONTEXT:
{context}

QUESTION: {question}

Provide a comprehensive answer based on the context. Include citations in [Source: X] format.`;
```

---

## 7. Cross-Workspace Context Management

### 7.1 Context Isolation

```typescript
interface WorkspaceContext {
    workspaceId: string;
    notebooks: string[];
    sharedContexts: string[];  // IDs of shared contexts
}

// Ensure queries only access authorized notebooks
async function queryWithIsolation(
    query: string, 
    workspaceId: string
): Promise<string[]> {
    const workspace = await getWorkspaceContext(workspaceId);
    const chunks = await vectorIndex.search(await embed(query), 10);
    
    // Filter to authorized notebooks
    return chunks.filter(c => 
        workspace.notebooks.includes(c.notebookId)
    );
}
```

### 7.2 Context Sharing

```typescript
interface SharedContext {
    id: string;
    notebookIds: string[];
    workspaceIds: string[];  // Workspaces that can access
    permissions: 'read' | 'write';
}
```

---

## 8. Performance Optimization

### 8.1 Caching Strategy

```typescript
class ContextCache {
    private cache = new LRUCache<string, string>({
        max: 100,
        ttl: 1000 * 60 * 5  // 5 minute TTL
    });
    
    async get(queryHash: string): Promise<string | undefined> {
        return this.cache.get(queryHash);
    }
    
    set(queryHash: string, context: string): void {
        this.cache.set(queryHash, context);
    }
}
```

### 8.2 Batch Embedding

```typescript
async function embedBatch(texts: string[]): Promise<number[][]> {
    // Batch for efficiency
    const batchSize = 32;
    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const embeddings = await Promise.all(batch.map(t => embed(t)));
        results.push(...embeddings);
    }
    
    return results;
}
```

### 8.3 Lazy Loading

```typescript
// Only load vector index when needed
let vectorIndex: VectorIndex | null = null;

async function getVectorIndex(): Promise<VectorIndex> {
    if (!vectorIndex) {
        vectorIndex = new VectorIndex();
        const chunks = await db.chunks.toArray();
        for (const chunk of chunks) {
            vectorIndex.add(chunk.id, chunk.embedding);
        }
    }
    return vectorIndex;
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Extend Dexie schema with knowledge tables
- [ ] Implement PDF/URL source processors
- [ ] Set up ONNX embedding service

### Phase 2: Core RAG (Week 3-4)
- [ ] Implement chunking strategies
- [ ] Build vector index
- [ ] Create query pipeline

### Phase 3: UI (Week 5-6)
- [ ] Knowledge Canvas component
- [ ] Source card UI
- [ ] Chat with sources

### Phase 4: Enhancement (Week 7-8)
- [ ] Flashcard generation
- [ ] Audio overview (TTS)
- [ ] Export functionality

---

## References

- [Sentence Transformers](https://www.sbert.net/)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Dexie.js](https://dexie.org/)
- [PDF.js](https://mozilla.github.io/pdf.js/)

---

*Generated via BMAD v6 Investigation Cycle - 2025-12-28*
