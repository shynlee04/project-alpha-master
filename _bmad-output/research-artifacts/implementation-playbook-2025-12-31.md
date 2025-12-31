---
date: 2025-12-31
time: 02:15:00
phase: Research & Architecture - Final Synthesis
team: Team-B
agent_mode: bmad-bmm-architect
---

# Implementation Playbook: Frontier RAG Knowledge Synthesis Expert System

**Artifact ID:** FRKS-IMPLEMENTATION-PLAYBOOK-2025-12-31
**Version:** 1.0.0
**Status:** FINAL SYNTHESIS - Ready for Implementation
**Confidence Score:** 87% (Average of all 6 research artifacts)

## Executive Summary

This Implementation Playbook synthesizes all 6 research artifacts created for the Frontier RAG Knowledge Synthesis Expert System into a comprehensive, actionable implementation guide. The system represents a browser-based, local-first platform that merges Google NotebookLM-style AI synthesis with Notion-like knowledge organization, targeting the Vietnamese education market.

### Research Artifact Summary

| Artifact | Title | Confidence | Key Deliverables |
|----------|-------|------------|------------------|
| 1 | Agent Interaction Protocols | 90% | 10 message types, 5 agents, A2A/MCP protocols |
| 2 | System Architecture Specification | 85% | 5-layer architecture, Gemini integration, TanStack AI |
| 3 | RAG Pipeline Optimization Report | 90% | Orama WASM, hybrid search, 20-week roadmap |
| 4 | Pedagogical Framework Design | 85% | VARK styles, adaptive pathways, spaced repetition |
| 5 | Multimodal Processing Specification | 82% | 5 modalities, CLIP embeddings, 16-week roadmap |
| 6 | Integration Guide | 88% | Cross-artifact matrix, 6 Epics, 24 Stories |

**Overall Research Confidence: 87%**

---

## Part 1: System Architecture Overview

### 1.1 Five-Layer Architecture

The system implements a five-layer architecture as defined in the System Architecture Specification:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  IDE Layout  │  │  Chat UI     │  │  Knowledge Canvas    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                   ORCHESTRATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Multi-Agent Coordinator System                    │  │
│  │  Research │ Synthesizer │ Generator │ Pedagogical │ Advisor │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                 QUERY ORCHESTRATION LAYER                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TanStack AI + Query Pipeline                             │  │
│  │  Caching │ Background Refetch │ Optimistic Updates        │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                   RAG INFRASTRUCTURE LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Orama WASM   │  │ Embeddings   │  │ Hybrid Search Engine │  │
│  │ Vector Store │  │ Pipeline     │  │ RRF Fusion           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    LLM BACKEND LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Google Gemini 3.0 (Primary) │ Gemini 2.5 (Specialized)  │  │
│  │  Dynamic Model Routing │ Cost-Aware Decision Engine       │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│              STORAGE & PERSISTENCE LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  IndexedDB   │  │ LocalStorage │  │  FSA API Integration │  │
│  │  (Dexie.js)  │  │  (Agents)    │  │  File System Access  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Summary

**Core Technologies (Research-Validated)**

| Category | Technology | Purpose | Confidence |
|----------|------------|---------|------------|
| Framework | React 19 + Vite | UI Framework | 95% |
| Router | TanStack Router | SPA Routing | 90% |
| AI Orchestration | TanStack AI | Query Management | 88% |
| LLM Provider | Google Gemini 3.0 | Primary Model | 90% |
| Vector Store | Orama WASM | Client-Side RAG | 92% |
| Database | Dexie.js (IndexedDB) | Persistence | 90% |
| State Management | Zustand | Reactive State | 92% |
| File System | File System Access API | Local FS | 85% |
| Runtime | WebContainer | Browser Node.js | 88% |
| PDF Processing | PDF.js | Client-Side PDF | 85% |
| Embeddings | Transformers.js (CLIP) | Multimodal Vectors | 82% |
| Speech | Whisper (WASM) | Audio Transcription | 80% |

---

## Part 2: Multi-Agent Coordination System

### 2.1 Agent Architecture (from Artifact 1)

The system implements 5 specialized agents coordinated through a message bus architecture:

```typescript
// Agent Types and Interfaces
interface AgentMessage {
  id: string;
  type: MessageType;
  sender: AgentId;
  recipient: AgentId;
  payload: unknown;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  correlationId?: string;
}

type MessageType = 
  | 'TASK_REQUEST'
  | 'TASK_RESPONSE'
  | 'CONTEXT_SHARE'
  | 'TOOL_INVOCATION'
  | 'TOOL_RESULT'
  | 'KNOWLEDGE_QUERY'
  | 'KNOWLEDGE_RESPONSE'
  | 'SYNTHESIS_REQUEST'
  | 'SYNTHESIS_RESPONSE'
  | 'LEARNING_PATH_UPDATE';

// Agent Registry
const AGENT_REGISTRY = {
  RESEARCHER: {
    capabilities: ['web_search', 'document_analysis', 'fact_checking'],
    model: 'gemini-2.5-pro',
    timeout: 60000,
  },
  SYNTHESIZER: {
    capabilities: ['knowledge_fusion', 'citation_management', 'summarization'],
    model: 'gemini-3.0-pro',
    timeout: 120000,
  },
  GENERATOR: {
    capabilities: ['content_creation', 'formatting', 'visualization'],
    model: 'gemini-3.0-flash',
    timeout: 30000,
  },
  PEDAGOGUE: {
    capabilities: ['learning_path_design', 'assessment', 'adaptation'],
    model: 'gemini-2.5-flash',
    timeout: 45000,
  },
  ADVISOR: {
    capabilities: ['recommendation', 'decision_support', 'explanation'],
    model: 'gemini-2.5-pro',
    timeout: 60000,
  },
} as const;
```

### 2.2 Agent Communication Patterns

```typescript
// Message Bus Implementation
class AgentMessageBus {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private queue: PriorityQueue<AgentMessage>;
  private circuitBreakers: Map<AgentId, CircuitBreaker>;

  async send(message: AgentMessage): Promise<void> {
    const agentCircuit = this.circuitBreakers.get(message.recipient);
    
    if (agentCircuit?.isOpen()) {
      throw new CircuitOpenError(`Agent ${message.recipient} unavailable`);
    }

    try {
      await this.processMessage(message);
      agentCircuit?.recordSuccess();
    } catch (error) {
      agentCircuit?.recordFailure();
      this.handleMessageFailure(message, error);
    }
  }

  async broadcast(sourceAgent: AgentId, message: Omit<AgentMessage, 'id' | 'sender' | 'timestamp'>): Promise<void> {
    const agents = Object.keys(AGENT_REGISTRY).filter(id => id !== sourceAgent);
    
    await Promise.all(
      agents.map(agentId => 
        this.send({
          ...message,
          id: generateMessageId(),
          sender: sourceAgent,
          recipient: agentId as AgentId,
          timestamp: new Date(),
        } as AgentMessage)
      )
    );
  }
}
```

---

## Part 3: RAG Infrastructure Design

### 3.1 Orama WASM Vector Store Configuration (from Artifact 3)

```typescript
// RAG Configuration
interface RAGConfig {
  embedding: {
    model: string;
    dimensions: number;
    batchSize: number;
  };
  vectorStore: {
    indexName: string;
    similarity: 'cosine' | 'euclidean' | 'dotproduct';
    hnsw: {
      efConstruction: number;
      m: number;
    };
  };
  hybridSearch: {
    vectorWeight: number;
    textWeight: number;
    rrfK: number;
  };
}

const RAG_CONFIG: RAGConfig = {
  embedding: {
    model: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    batchSize: 32,
  },
  vectorStore: {
    indexName: 'knowledge-base',
    similarity: 'cosine',
    hnsw: {
      efConstruction: 100,
      m: 16,
    },
  },
  hybridSearch: {
    vectorWeight: 0.7,
    textWeight: 0.3,
    rrfK: 60,
  },
};

// Orama Index Setup
async function initializeOramaIndex(db: OramaDatabase): Promise<void> {
  await db.create({
    schema: {
      id: 'string',
      content: 'string',
      metadata: {
        source: 'string',
        url: 'string',
        title: 'string',
        type: 'string',
        embedding: 'vector[384]',
      },
    },
    hnsw: {
      dimensions: 384,
      metric: 'cosine',
    },
  });
}
```

### 3.2 Hybrid Search Pipeline

```typescript
// Hybrid Search with RRF Fusion
class HybridSearchEngine {
  private vectorStore: OramaDatabase;
  private fullTextIndex: OramaDatabase;
  private cache: LRUCache<string, SearchResult[]>;

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const cacheKey = this.generateCacheKey(query, options);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Parallel vector and full-text search
    const [vectorResults, textResults] = await Promise.all([
      this.vectorSearch(query, options),
      this.fullTextSearch(query, options),
    ]);

    // RRF Fusion
    const fusedResults = this.rrfFusion(vectorResults, textResults, {
      k: options.rrfK || 60,
      vectorWeight: options.vectorWeight || 0.7,
      textWeight: options.textWeight || 0.3,
    });

    // Apply reranking
    const rerankedResults = await this.rerankResults(query, fusedResults);

    // Cache results
    this.cache.set(cacheKey, rerankedResults);

    return rerankedResults;
  }

  private rrfFusion(
    vectorResults: SearchResult[],
    textResults: SearchResult[],
    options: { k: number; vectorWeight: number; textWeight: number }
  ): SearchResult[] {
    const scoreMap = new Map<string, number>();

    // RRF for vector results
    vectorResults.forEach((result, index) => {
      const rrfScore = 1 / (options.k + index + 1);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + options.vectorWeight * rrfScore);
    });

    // RRF for text results
    textResults.forEach((result, index) => {
      const rrfScore = 1 / (options.k + index + 1);
      scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + options.textWeight * rrfScore);
    });

    // Sort by combined score
    return Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({
        id,
        score,
        source: scoreMap.size > 1 ? 'hybrid' : 'single',
      }));
  }
}
```

---

## Part 4: Multimodal Processing Pipeline

### 4.1 Unified Processing Architecture (from Artifact 5)

```typescript
// Multimodal Processor Factory
class UnifiedMultimodalProcessor {
  private processors: Map<string, ContentProcessor>;
  private embeddingEngine: UnifiedEmbeddingEngine;

  async process(input: MultimodalInput): Promise<ProcessedContent> {
    const processor = this.getProcessor(input.type);
    const extracted = await processor.extract(input);
    const embeddings = await this.embeddingEngine.generate(input.type, extracted);
    
    return {
      ...extracted,
      embeddings,
      modality: input.type,
      processedAt: new Date(),
    };
  }

  private getProcessor(type: ModalityType): ContentProcessor {
    const processor = this.processors.get(type);
    if (!processor) {
      throw new UnsupportedModalityError(type);
    }
    return processor;
  }
}

// Modality-Specific Processors
class PDFProcessor implements ContentProcessor {
  async extract(input: FileSource): Promise<ExtractedContent> {
    const pdf = await pdfjsLib.getDocument(input.file).promise;
    const textContent: string[] = [];
    const metadata: Record<string, string> = {};

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent.push(text.items.map(item => item.str).join(' '));
    }

    return {
      content: textContent.join('\n\n'),
      chunks: this.createChunks(textContent),
      metadata: {
        pageCount: pdf.numPages.toString(),
        ...this.extractMetadata(input.file),
      },
    };
  }
}

class ImageProcessor implements ContentProcessor {
  async extract(input: FileSource): Promise<ExtractedContent> {
    // Load image for CLIP embedding
    const imageTensor = await this.loadImage(input.file);
    const clipEmbedding = await this.clipModel.embed(imageTensor);
    
    // OCR for text extraction
    const ocrResult = await this.performOCR(input.file);
    
    return {
      content: ocrResult.text,
      chunks: this.createChunks([ocrResult.text]),
      metadata: {
        dimensions: `${ocrResult.width}x${ocrResult.height}`,
        ocrConfidence: ocrResult.confidence.toString(),
        clipEmbedding: clipEmbedding.toString(),
      },
    };
  }
}

class AudioProcessor implements ContentProcessor {
  async extract(input: FileSource): Promise<ExtractedContent> {
    // Whisper transcription
    const audioBuffer = await input.file.arrayBuffer();
    const transcription = await this.whisperModel.transcribe(audioBuffer);
    
    return {
      content: transcription.text,
      chunks: this.createChunks([transcription.text]),
      metadata: {
        duration: transcription.duration.toString(),
        language: transcription.language,
        confidence: transcription.confidence.toString(),
      },
    };
  }
}
```

---

## Part 5: Pedagogical Framework Integration

### 5.1 Adaptive Learning System (from Artifact 4)

```typescript
// VARK Learning Style Detection
interface LearningProfile {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
  detectedStyle: VARKStyle;
  confidence: number;
}

// Spaced Repetition with SM-2 Algorithm
interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastGrade: number;
}

class SpacedRepetitionSystem {
  calculateNextReview(current: SRSData, grade: number): SRSData {
    let { easeFactor, interval, repetitions } = current;

    if (grade >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    return {
      easeFactor,
      interval,
      repetitions,
      nextReview: this.addDays(new Date(), interval),
      lastGrade: grade,
    };
  }
}

// Adaptive Learning Path Generator
class LearningPathGenerator {
  async generatePath(
    userId: string,
    topic: string,
    learningProfile: LearningProfile
  ): Promise<LearningPath> {
    // Get current knowledge state
    const currentState = await this.knowledgeTrace.getState(userId, topic);
    
    // Identify gaps
    const gaps = await this.identifyGaps(currentState, topic);
    
    // Generate adaptive content sequence
    const content = await this.selectContentForStyle(gaps, learningProfile);
    
    // Create path with branching
    const path = await this.buildAdaptivePath(content, currentState);

    return path;
  }

  private selectContentForStyle(
    gaps: KnowledgeGap[],
    profile: LearningProfile
  ): Promise<ContentItem[]> {
    const sortedGaps = this.sortByPriority(gaps);
    const content: ContentItem[] = [];

    for (const gap of sortedGaps) {
      const variants = await this.contentStore.getVariants(gap.topic);
      const bestVariant = this.selectBestVariant(variants, profile);
      content.push(bestVariant);
    }

    return content;
  }
}
```

---

## Part 6: Epic and Story Breakdown

### 6.1 Implementation Roadmap Summary (from Artifact 6)

| Phase | Duration | Epics | Stories | Focus Area |
|-------|----------|-------|---------|------------|
| Phase 1 | Weeks 1-5 | EPIC-32 | 4 | RAG Infrastructure |
| Phase 2 | Weeks 6-10 | EPIC-33 | 4 | Agent Coordination |
| Phase 3 | Weeks 11-15 | EPIC-34 | 5 | Multimodal Processing |
| Phase 4 | Weeks 16-20 | EPIC-35, EPIC-36, EPIC-37 | 14 | Adaptive Learning |

### 6.2 Epic Detail Specifications

#### EPIC-32: RAG Infrastructure Foundation (Weeks 1-5)

| Story ID | Title | Effort | Dependencies | Output |
|----------|-------|--------|--------------|--------|
| 32-1 | Orama WASM Integration | 8 | - | Vector store with HNSW indexing |
| 32-2 | Hybrid Search Engine | 5 | 32-1 | RRF fusion search implementation |
| 32-3 | Embedding Pipeline | 5 | 32-1 | Transformers.js embedding generation |
| 32-4 | Caching Layer | 3 | 32-2 | Multi-tier cache for queries |

#### EPIC-33: Agent Coordination System (Weeks 6-10)

| Story ID | Title | Effort | Dependencies | Output |
|----------|-------|--------|--------------|--------|
| 33-1 | Message Bus Implementation | 8 | - | Event-driven message system |
| 33-2 | Agent Registry & Discovery | 5 | 33-1 | Dynamic agent registration |
| 33-3 | Orchestration Engine | 8 | 33-1, 33-2 | Task routing and coordination |
| 33-4 | Tool Facade Layer | 5 | 33-3 | Unified tool interface |

#### EPIC-34: Multimodal Processing (Weeks 11-15)

| Story ID | Title | Effort | Dependencies | Output |
|----------|-------|--------|--------------|--------|
| 34-1 | PDF/Text Processing | 5 | - | PDF.js text extraction |
| 34-2 | Image OCR & CLIP | 8 | 32-3 | Visual embedding pipeline |
| 34-3 | Audio Transcription | 8 | 32-3 | Whisper WASM integration |
| 34-4 | Cross-Modal Retrieval | 5 | 32-2, 34-2 | Unified search across modalities |
| 34-5 | Unified Embedding Space | 8 | 34-2, 34-3 | Cross-modal vector alignment |

#### EPIC-35: Adaptive Learning System (Weeks 16-18)

| Story ID | Title | Effort | Dependencies | Output |
|----------|-------|--------|--------------|--------|
| 35-1 | VARK Detection | 5 | - | Learning style questionnaire |
| 35-2 | Adaptive Pathways | 8 | 35-1 | Dynamic content selection |
| 35-3 | Knowledge Tracing | 5 | 32-1 | Proficiency tracking |
| 35-4 | Spaced Repetition | 5 | 35-3 | SM-2 algorithm implementation |

#### EPIC-36: Assessment and Analytics (Weeks 18-19)

| Story ID | Title | Effort | Dependencies | Output |
|----------|-------|--------|--------------|--------|
| 36-1 | Flashcard Generation | 5 | 35-4 | Auto flashcard creation |
| 36-2 | Quiz Generation | 5 | 35-1 | Adaptive quiz engine |
| 36-3 | Progress Analytics | 3 | 35-3 | Learning metrics dashboard |
| 36-4 | Achievement System | 3 | 36-3 | Gamification elements |

#### EPIC-37: System Integration and Polish (Weeks 19-20)

| Story ID | Title | Effort | Dependencies | Output |
|----------|-------|--------|--------------|--------|
| 37-1 | Integration Testing | 5 | All Phase 1-4 | E2E test suite |
| 37-2 | Performance Optimization | 5 | All Phase 1-4 | Performance benchmarks |
| 37-3 | Error Handling | 3 | All Phase 1-4 | Comprehensive error states |
| 37-4 | UI Polish | 3 | All Phase 1-4 | Design system completion |
| 37-5 | Documentation | 3 | All Phase 1-4 | API docs and guides |
| 37-6 | Deployment Pipeline | 5 | 37-1 | Production deployment |

---

## Part 7: Implementation Checklists

### 7.1 Pre-Implementation Checklist

```markdown
## Infrastructure Setup
- [ ] Vite project with cross-origin isolation configured
- [ ] TanStack Router file-based routing setup
- [ ] Dexie.js IndexedDB schema v9 migration
- [ ] Tailwind CSS with design tokens
- [ ] i18next with en/vi translations

## Development Environment
- [ ] pnpm install all dependencies
- [ ] Configure VS Code settings (read-only routes)
- [ ] Set up pre-commit hooks (lint, format)
- [ ] Configure vitest with jsdom environment
- [ ] Set up Git branch strategy (feature/*)

## External Services
- [ ] Google Gemini API keys configured
- [ ] Orama WASM bundles available locally
- [ ] Transformers.js models downloaded
- [ ] Whisper WASM model cached
- [ ] PDF.js worker configured
```

### 7.2 Story Implementation Template

```typescript
// Story Implementation Checklist
interface StoryChecklist {
  storyId: string;
  title: string;
  
  // Pre-Implementation
  researchCompleted: boolean;
  techSpecsReviewed: boolean;
  dependenciesIdentified: boolean;
  testStrategyDefined: boolean;
  
  // Implementation
  typesDefined: boolean;
  componentCreated: boolean;
  storeUpdated: boolean;
  i18nKeysAdded: boolean;
  
  // Validation
  unitTestsWritten: boolean;
  integrationTestsPassed: boolean;
  lintChecksPassed: boolean;
  typeCheckingPassed: boolean;
  
  // Documentation
  apiDocsUpdated: boolean;
  readmeUpdated: boolean;
  commentsAdded: boolean;
}
```

### 7.3 Code Review Checklist

```markdown
## Code Review Criteria
- [ ] TypeScript strict mode compliance
- [ ] No unused imports or variables
- [ ] Consistent naming conventions
- [ ] Error handling with proper types
- [ ] Accessible UI components
- [ ] Responsive design implemented
- [ ] i18n for all UI strings
- [ ] Performance considerations
- [ ] Security best practices
- [ ] Test coverage adequate

## Import Order Convention
1. React imports
2. Third-party libraries
3. Internal @/ modules
4. Relative imports
```

---

## Part 8: Risk Assessment and Mitigation

### 8.1 Identified Risks

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| R1 | WASM performance degradation | Medium | High | Lazy loading, progressive enhancement |
| R2 | Cross-modal alignment errors | Medium | High | CLIP fine-tuning, validation layers |
| R3 | Agent coordination complexity | Low | Medium | Message bus with circuit breakers |
| R4 | IndexedDB storage limits | Low | Medium | Tiered storage, compression |
| R5 | Gemini API rate limits | Low | High | Caching, request batching, fallbacks |
| R6 | Browser compatibility issues | Low | Medium | Feature detection, graceful degradation |
| R7 | File System Access API restrictions | Medium | Medium | Fallback to traditional upload |

### 8.2 Contingency Plans

```typescript
// Circuit Breaker Pattern for External Services
class CircuitBreaker {
  private failures: number = 0;
  private lastFailure: Date | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  private readonly threshold: number = 5;
  private readonly timeout: number = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new CircuitOpenError('Service temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

---

## Part 9: Code Patterns and Best Practices

### 9.1 Component Pattern

```typescript
// React Component with i18n and Error Boundary
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { cva } from 'class-variance-authority';

interface ComponentProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const componentStyles = cva(
  'px-4 py-2 rounded-lg transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 hover:bg-blue-700',
        secondary: 'bg-gray-600 hover:bg-gray-700',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export function Component({ children, variant, className }: ComponentProps) {
  const { t } = useTranslation();
  
  return (
    <div className={clsx(componentStyles({ variant }), className)}>
      {children}
    </div>
  );
}
```

### 9.2 Store Pattern (Zustand + Persist)

```typescript
// Persisted Zustand Store
interface StoreState {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'storage-key',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
```

### 9.3 Async Operation with Error Handling

```typescript
// Async operation with retry and circuit breaker
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000 } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new MaxRetriesExceededError(error);
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw new Error('Unexpected error in retry loop');
}
```

---

## Part 10: Testing Strategy

### 10.1 Test Pyramid

```
           ┌─────────────┐
           │   E2E Tests │    10% - Critical user journeys
           └─────────────┘
        ┌───────────────────┐
        │  Integration Tests│    30% - API interactions, store integration
        └───────────────────┘
     ┌─────────────────────────┐
     │      Unit Tests         │    60% - Components, utilities, stores
     └─────────────────────────┘
```

### 10.2 Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/__tests__/**', 'src/**/*.d.ts'],
    },
  },
});
```

### 10.3 Mock Patterns

```typescript
// WebContainer Mock for Tests
const mockWebContainer = {
  boot: vi.fn().mockResolvedValue(undefined),
  mount: vi.fn().mockResolvedValue(undefined),
  spawn: vi.fn().mockImplementation(() => ({
    output: { pipeTo: vi.fn() },
    exit: Promise.resolve(0),
  })),
  fs: {
    readFile: vi.fn().mockResolvedValue('mock content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
};

// IndexedDB Mock
const mockIndexedDB = {
  open: vi.fn().mockImplementation((name, version) => ({
    result: {
      createObjectStore: vi.fn().mockReturnValue({
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      }),
    },
    onupgradeneeded: vi.fn(),
    onsuccess: vi.fn(),
    onerror: vi.fn(),
  })),
};
```

---

## Part 11: Timeline and Milestones

### 11.1 Gantt Chart Summary

```
Week  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
EPIC-32 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
EPIC-33 ░░░░░░░░░░░███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
EPIC-34 ░░░░░░░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░░░░░░
EPIC-35 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░
EPIC-36 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░
EPIC-37 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░███████
```

### 11.2 Milestone Checklist

```markdown
## Milestone 1: RAG Foundation (Week 5)
- [ ] Orama WASM indexing working
- [ ] Hybrid search returning results
- [ ] Embedding pipeline functional
- [ ] Caching layer integrated
- [ ] Unit tests > 80% coverage

## Milestone 2: Agent Coordination (Week 10)
- [ ] Message bus operational
- [ ] All 5 agents registered
- [ ] Task routing functional
- [ ] Tool facades implemented
- [ ] Integration tests passing

## Milestone 3: Multimodal Processing (Week 15)
- [ ] PDF extraction working
- [ ] OCR/CLIP integration complete
- [ ] Audio transcription functional
- [ ] Cross-modal retrieval working
- [ ] Performance benchmarks met

## Milestone 4: Adaptive Learning (Week 20)
- [ ] VARK detection implemented
- [ ] Spaced repetition working
- [ ] Assessment generation functional
- [ ] Analytics dashboard complete
- [ ] Production deployment successful
```

---

## Part 12: Appendices

### 12.1 File Structure Reference

```
src/
├── components/
│   ├── agent/           # Agent configuration and dialogs
│   ├── chat/            # Chat interface components
│   ├── ide/             # IDE components (editor, terminal, etc.)
│   ├── knowledge/       # Knowledge management UI
│   ├── rag/             # RAG interface components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── agent/           # Agent system implementation
│   │   ├── facades/    # Tool facades
│   │   ├── providers/  # AI providers
│   │   ├── tools/      # Agent tools
│   │   └── messageBus.ts
│   ├── rag/             # RAG infrastructure
│   │   ├── orama-index.ts
│   │   ├── embedding-service.ts
│   │   └── hybrid-retriever.ts
│   ├── multimedia/      # Multimodal processing
│   │   ├── pdf-processor.ts
│   │   ├── image-processor.ts
│   │   └── audio-processor.ts
│   ├── pedagogy/        # Learning system
│   │   ├── learning-trace.ts
│   │   └── spaced-repetition.ts
│   └── state/           # Zustand stores
├── routes/              # TanStack Router routes
├── i18n/                # Translations
└── styles/              # Global styles
```

### 12.2 Configuration Reference

```typescript
// Environment Configuration
const CONFIG = {
  // API Keys (loaded from env)
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  
  // Feature Flags
  FEATURES: {
    multimodal: true,
    pedagogical: true,
    analytics: true,
  },
  
  // Performance
  PERFORMANCE: {
    maxConcurrentEmbeddings: 4,
    embeddingBatchSize: 32,
    cacheSizeMB: 100,
  },
  
  // Storage
  STORAGE: {
    maxIndexedDBSize: 500 * 1024 * 1024, // 500MB
    cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
  },
};
```

### 12.3 Glossary

| Term | Definition |
|------|------------|
| A2A | Agent-to-Agent protocol for inter-agent communication |
| CLIP | Contrastive Language-Image Pre-training for cross-modal embeddings |
| HNSW | Hierarchical Navigable Small World - graph-based vector indexing |
| MCP | Model Context Protocol for tool invocation |
| Orama | Client-side full-text and vector search engine |
| RAG | Retrieval-Augmented Generation |
| RRF | Reciprocal Rank Fusion for result fusion |
| SM-2 | Spaced repetition algorithm by SuperMemo |
| VARK | Visual, Auditory, Reading, Kinesthetic learning styles |
| WASM | WebAssembly for client-side computation |
| WebContainer | Browser-based Node.js runtime environment |

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Artifact ID** | FRKS-IMPLEMENTATION-PLAYBOOK-2025-12-31 |
| **Version** | 1.0.0 |
| **Status** | Final - Ready for Implementation |
| **Confidence** | 87% |
| **Created** | 2025-12-31 |
| **Authors** | BMAD V6 Multi-Agent System |
| **Related Artifacts** | 1-6 (all research artifacts) |

## Research Validation

- **Context7 MCP**: Orama documentation, TanStack AI patterns, Dexie.js schema
- **Tavily MCP**: 2025 RAG best practices, multimodal AI processing
- **Deepwiki**: WebContainer integration patterns, xterm.js configuration
- **Repomix**: Existing codebase structure analysis

---

*Generated under BMAD V6 Framework*
*Implementation Playbook - Frontier RAG Knowledge Synthesis Expert System*
*All artifacts available in: _bmad-output/research-artifacts/*
