# Via-gent Deep Research & Knowledge Synthesis Engine - Technical Specification

**Date:** 2025-12-27T03:53:08+07:00  
**Type:** Technical Design Specification  
**Status:** EXTENDED - READY FOR REVIEW  
**Related Epics:** 
- Deep Research Capabilities (New)
- Knowledge Synthesis Station (New - see concept doc)
**Author:** @bmad-core-bmad-master + @bmad-cis-agents-innovation-strategist  
**Related Documents:**
- `docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md`

---

## 1. Executive Summary

### 1.1 Vision Statement

Create a **unified Research & Synthesis Engine** that serves two complementary use cases within Via-gent:

1. **AI Agent Deep Research Tool** - Technical research for development workflows
2. **Knowledge Synthesis Station** - Educational knowledge synthesis for Vietnamese students

Both share the same core infrastructure:
- **Content Acquisition Layer** (web browsing, PDF parsing, URL extraction)
- **Synthesis Engine** (AI-powered analysis, concept extraction, connection mapping)
- **Persistence Layer** (IndexedDB, FSA storage)
- **Output Generation** (summaries, flashcards, quizzes, audio)

### 1.2 Extended Capability Matrix

| Core Capability | Deep Research Tool | Knowledge Synthesis Station |
|-----------------|-------------------|----------------------------|
| **Web Browsing** | ✅ Tech docs, GitHub, npm | ✅ Educational content, articles |
| **URL Content Extraction** | ✅ HTML → Clean text | ✅ HTML → Structured notes |
| **PDF Parsing** | ❌ (codebase only) | ✅ PDFs, textbooks |
| **YouTube Extraction** | ❌ | ✅ Video → Transcript |
| **Audio Processing** | ❌ | ✅ Audio → Text (TTS) |
| **Concept Mapping** | ✅ Pattern analysis | ✅ Visual concept canvas |
| **AI Synthesis** | ✅ Technical synthesis | ✅ Educational synthesis |
| **Output: Summary** | ✅ | ✅ |
| **Output: Flashcards** | ❌ | ✅ |
| **Output: Quizzes** | ❌ | ✅ |
| **Output: Audio Overview** | ❌ | ✅ (TTS) |
| **Codebase Comparison** | ✅ | ❌ |
| **Vietnamese i18n** | ✅ | ✅ (Primary target) |

### 1.3 Strategic Alignment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VIA-GENT PLATFORM VISION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐                  ┌─────────────────────┐         │
│   │    CODE WORKSPACE   │                  │  KNOWLEDGE STATION  │         │
│   │    (IDE Tab)        │                  │  (Knowledge Tab)    │         │
│   │                     │                  │                     │         │
│   │  • Monaco Editor    │                  │  • Source Cards     │         │
│   │  • File Explorer    │                  │  • Knowledge Canvas │         │
│   │  • Terminal         │                  │  • Flashcards       │         │
│   │  • AI Chat + Tools  │                  │  • Quizzes          │         │
│   └──────────┬──────────┘                  └──────────┬──────────┘         │
│              │                                        │                     │
│              └──────────────┬─────────────────────────┘                     │
│                             │                                               │
│                             ▼                                               │
│              ┌─────────────────────────────────────────┐                   │
│              │    SHARED RESEARCH & SYNTHESIS ENGINE   │                   │
│              │                                         │                   │
│              │  • Content Acquisition (Web, PDF, etc.) │                   │
│              │  • AI Synthesis (Gemini/OpenAI)         │                   │
│              │  • Persistence (IndexedDB + FSA)        │                   │
│              │  • Edge Proxy (Cloudflare Workers)      │                   │
│              └─────────────────────────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Overview

### 2.1 High-Level Architecture (Extended)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VIA-GENT BROWSER ENVIRONMENT                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                 RESEARCH & KNOWLEDGE SYNTHESIS ENGINE                    │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    CONTENT ACQUISITION LAYER                        │ │   │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────┐│ │   │
│  │  │  │ Web URL   │ │ PDF       │ │ YouTube   │ │ Audio     │ │ Text   ││ │   │
│  │  │  │ Fetcher   │ │ Parser    │ │ Extractor │ │ Processor │ │ Input  ││ │   │
│  │  │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └────┬───┘│ │   │
│  │  │        │             │             │             │            │    │ │   │
│  │  │        └─────────────┴─────────────┴─────────────┴────────────┘    │ │   │
│  │  │                                    │                               │ │   │
│  │  │                                    ▼                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────────┐  │ │   │
│  │  │  │              NORMALIZED CONTENT STORE                        │  │ │   │
│  │  │  │  { id, type, title, content, metadata, extractedConcepts }   │  │ │   │
│  │  │  └──────────────────────────────┬──────────────────────────────┘  │ │   │
│  │  └─────────────────────────────────┼─────────────────────────────────┘ │   │
│  │                                    │                                    │   │
│  │  ┌─────────────────────────────────▼─────────────────────────────────┐ │   │
│  │  │                      SYNTHESIS ENGINE                              │ │   │
│  │  │  ┌────────────────┐ ┌────────────────┐ ┌──────────────────────┐   │ │   │
│  │  │  │ AI Summary     │ │ Concept        │ │ Connection           │   │ │   │
│  │  │  │ Generator      │ │ Extractor      │ │ Mapper               │   │ │   │
│  │  │  └────────────────┘ └────────────────┘ └──────────────────────┘   │ │   │
│  │  │  ┌────────────────┐ ┌────────────────┐ ┌──────────────────────┐   │ │   │
│  │  │  │ Question       │ │ Flashcard      │ │ Quiz                 │   │ │   │
│  │  │  │ Answering      │ │ Generator      │ │ Generator            │   │ │   │
│  │  │  └────────────────┘ └────────────────┘ └──────────────────────┘   │ │   │
│  │  │  ┌────────────────┐ ┌────────────────┐                            │ │   │
│  │  │  │ Audio Overview │ │ Mind Map       │                            │ │   │
│  │  │  │ (TTS)          │ │ Generator      │                            │ │   │
│  │  │  └────────────────┘ └────────────────┘                            │ │   │
│  │  └───────────────────────────────┬───────────────────────────────────┘ │   │
│  │                                  │                                      │   │
│  │  ┌───────────────────────────────▼───────────────────────────────────┐ │   │
│  │  │                    OUTPUT LAYER                                    │ │   │
│  │  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────────┐│ │   │
│  │  │  │ Source Cards  │ │ Knowledge     │ │ Export                    ││ │   │
│  │  │  │ (Visual)      │ │ Canvas (D3)   │ │ (PDF, Markdown, Notion)   ││ │   │
│  │  │  └───────────────┘ └───────────────┘ └───────────────────────────┘│ │   │
│  │  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────────┐│ │   │
│  │  │  │ Flashcard     │ │ Quiz          │ │ Audio                     ││ │   │
│  │  │  │ Deck          │ │ Interface     │ │ Player                    ││ │   │
│  │  │  └───────────────┘ └───────────────┘ └───────────────────────────┘│ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         PERSISTENCE LAYER                                │   │
│  │  ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────────┐  │   │
│  │  │ IndexedDB           │ │ File System Access  │ │ LocalStorage       │  │   │
│  │  │ (Sources, Notebooks)│ │ (File Export)       │ │ (Settings, Cache)  │  │   │
│  │  └─────────────────────┘ └─────────────────────┘ └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                     EDGE PROXY LAYER (Cloudflare Workers)                │   │
│  │  ┌──────────────────────────────────────────────────────────────────────┐│   │
│  │  │ /api/research                                                        ││   │
│  │  │   /fetch      - Fetch URL content (CORS bypass)                      ││   │
│  │  │   /search     - Web search (DuckDuckGo, Google CSE)                  ││   │
│  │  │   /youtube    - YouTube transcript extraction                        ││   │
│  │  │   /pdf        - PDF text extraction                                  ││   │
│  │  │   /tts        - Text-to-speech generation (optional)                 ││   │
│  │  └──────────────────────────────────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Shared Module Architecture

```
src/lib/knowledge/
├── core/
│   ├── content-acquisition/          # Unified content fetching
│   │   ├── url-fetcher.ts            # Web URL → Clean text
│   │   ├── pdf-parser.ts             # PDF → Structured text
│   │   ├── youtube-extractor.ts      # YouTube → Transcript
│   │   ├── audio-processor.ts        # Audio → Text (via API)
│   │   └── text-processor.ts         # Raw text normalization
│   │
│   ├── synthesis/                    # AI-powered analysis
│   │   ├── summary-generator.ts      # Generate summaries
│   │   ├── concept-extractor.ts      # Extract key concepts
│   │   ├── connection-mapper.ts      # Map concept relationships
│   │   ├── question-answerer.ts      # Q&A with sources
│   │   └── synthesis-engine.ts       # Orchestrates all synthesis
│   │
│   ├── output/                       # Output generation
│   │   ├── flashcard-generator.ts    # Generate flashcards
│   │   ├── quiz-generator.ts         # Generate quizzes
│   │   ├── audio-overview.ts         # Generate audio (TTS)
│   │   ├── mindmap-generator.ts      # Generate mind maps
│   │   └── export-manager.ts         # PDF, Markdown, Notion
│   │
│   └── persistence/                  # Storage layer
│       ├── source-store.ts           # IndexedDB for sources
│       ├── notebook-store.ts         # IndexedDB for notebooks
│       └── cache-manager.ts          # LocalStorage cache
│
├── agent-tools/                      # AI Agent integration
│   ├── deep-research-tool.ts         # Existing research tool
│   ├── source-ingest-tool.ts         # Ingest source content
│   ├── synthesize-tool.ts            # Synthesize knowledge
│   └── generate-output-tool.ts       # Generate flashcards/quizzes
│
└── ui/                               # UI Components (Knowledge Station)
    ├── SourceCard.tsx
    ├── KnowledgeCanvas.tsx
    ├── FlashcardDeck.tsx
    ├── QuizView.tsx
    └── AudioPlayer.tsx
```

---

## 3. Content Acquisition Layer

### 3.1 Source Types and Schemas

```typescript
/**
 * @fileoverview Source Type Definitions
 * @module lib/knowledge/core/types
 */

import { z } from 'zod';

// ============================================================================
// Source Type Enum
// ============================================================================

export const SourceTypeEnum = z.enum([
  'url',           // Web URL (HTML content)
  'pdf',           // PDF document
  'youtube',       // YouTube video
  'audio',         // Audio file/podcast
  'text',          // Raw text/notes
  'codebase',      // Project codebase (for research tool)
]);

// ============================================================================
// Base Source Schema
// ============================================================================

export const SourceSchema = z.object({
  id: z.string().uuid(),
  type: SourceTypeEnum,
  title: z.string(),
  originalUrl: z.string().optional(),
  content: z.string(),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  language: z.string().default('en'),
  wordCount: z.number(),
  
  // Extracted data
  extractedConcepts: z.array(z.object({
    term: z.string(),
    definition: z.string().optional(),
    importance: z.number().min(0).max(1),
  })).optional(),
  
  // Summary
  summary: z.object({
    brief: z.string(),           // 1-3 sentences
    detailed: z.string(),        // Paragraph
    keyPoints: z.array(z.string()),
  }).optional(),
  
  // Suggested questions
  suggestedQuestions: z.array(z.string()).optional(),
  
  // Tags (auto-generated or user-added)
  tags: z.array(z.string()).default([]),
  
  // Processing status
  status: z.enum(['pending', 'processing', 'ready', 'error']),
  error: z.string().optional(),
});

export type Source = z.infer<typeof SourceSchema>;
export type SourceType = z.infer<typeof SourceTypeEnum>;

// ============================================================================
// Notebook Schema (Collection of Sources)  
// ============================================================================

export const NotebookSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  
  // Sources in this notebook
  sourceIds: z.array(z.string().uuid()),
  
  // Connections between concepts (for canvas)
  connections: z.array(z.object({
    fromConceptId: z.string(),
    toConceptId: z.string(),
    relationship: z.string(),
    strength: z.number().min(0).max(1),
  })),
  
  // Generated outputs
  flashcards: z.array(z.object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
    sourceId: z.string(),
    lastReviewed: z.date().optional(),
    difficulty: z.number().min(0).max(1).default(0.5),
  })).optional(),
  
  quizzes: z.array(z.object({
    id: z.string(),
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctIndex: z.number(),
      explanation: z.string(),
      sourceId: z.string(),
    })),
  })).optional(),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  settings: z.object({
    language: z.enum(['en', 'vi']).default('vi'),
    autoGenerateSummary: z.boolean().default(true),
    autoExtractConcepts: z.boolean().default(true),
  }),
});

export type Notebook = z.infer<typeof NotebookSchema>;
```

### 3.2 URL Fetcher (Extended)

```typescript
/**
 * @fileoverview URL Content Fetcher
 * @module lib/knowledge/core/content-acquisition/url-fetcher
 * 
 * Fetches and extracts content from web URLs.
 * Supports: HTML pages, articles, documentation
 */

import { z } from 'zod';

export const FetchUrlInputSchema = z.object({
  url: z.string().url(),
  options: z.object({
    timeout: z.number().default(15000),
    extractContent: z.boolean().default(true),
    extractImages: z.boolean().default(false),
    extractCode: z.boolean().default(true),
    convertToMarkdown: z.boolean().default(true),
  }).optional(),
});

export const FetchUrlOutputSchema = z.object({
  success: z.boolean(),
  url: z.string(),
  content: z.string().optional(),
  
  // Structured extraction
  structured: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    publishedDate: z.string().optional(),
    headings: z.array(z.object({
      level: z.number(),
      text: z.string(),
    })),
    codeBlocks: z.array(z.object({
      language: z.string(),
      code: z.string(),
    })).optional(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string().optional(),
    })).optional(),
  }).optional(),
  
  error: z.string().optional(),
});

export type FetchUrlInput = z.infer<typeof FetchUrlInputSchema>;
export type FetchUrlOutput = z.infer<typeof FetchUrlOutputSchema>;

// Server function implementation (Cloudflare Worker)
export async function fetchUrlContent(input: FetchUrlInput): Promise<FetchUrlOutput> {
  // Implementation in /api/research/fetch
  // Uses edge proxy to bypass CORS
}
```

### 3.3 PDF Parser

```typescript
/**
 * @fileoverview PDF Content Parser
 * @module lib/knowledge/core/content-acquisition/pdf-parser
 * 
 * Parses PDF documents and extracts text content.
 * Runs client-side using pdf.js or via edge function.
 */

import { z } from 'zod';

export const ParsePdfInputSchema = z.object({
  // Either file (for local) or url (for remote)
  file: z.instanceof(File).optional(),
  url: z.string().url().optional(),
  options: z.object({
    extractImages: z.boolean().default(false),
    ocrEnabled: z.boolean().default(false), // Requires API
    language: z.string().default('vi'),
  }).optional(),
});

export const ParsePdfOutputSchema = z.object({
  success: z.boolean(),
  title: z.string().optional(),
  pages: z.array(z.object({
    pageNumber: z.number(),
    content: z.string(),
  })),
  metadata: z.object({
    author: z.string().optional(),
    subject: z.string().optional(),
    pageCount: z.number(),
    creationDate: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export type ParsePdfInput = z.infer<typeof ParsePdfInputSchema>;
export type ParsePdfOutput = z.infer<typeof ParsePdfOutputSchema>;

// Client-side implementation using pdf.js
export async function parsePdfContent(input: ParsePdfInput): Promise<ParsePdfOutput> {
  // Use pdf.js for client-side parsing
  // Or call edge function for complex processing
}
```

### 3.4 YouTube Extractor

```typescript
/**
 * @fileoverview YouTube Transcript Extractor
 * @module lib/knowledge/core/content-acquisition/youtube-extractor
 * 
 * Extracts transcripts and metadata from YouTube videos.
 */

import { z } from 'zod';

export const ExtractYouTubeInputSchema = z.object({
  url: z.string().url().refine(url => 
    url.includes('youtube.com') || url.includes('youtu.be'),
    'Must be a YouTube URL'
  ),
  options: z.object({
    preferredLanguage: z.string().default('vi'),
    includeTimestamps: z.boolean().default(true),
  }).optional(),
});

export const ExtractYouTubeOutputSchema = z.object({
  success: z.boolean(),
  videoId: z.string(),
  title: z.string(),
  channel: z.string(),
  duration: z.number(), // seconds
  
  transcript: z.array(z.object({
    text: z.string(),
    start: z.number(),
    duration: z.number(),
  })).optional(),
  
  fullText: z.string().optional(), // Concatenated transcript
  
  metadata: z.object({
    viewCount: z.number().optional(),
    likeCount: z.number().optional(),
    publishedAt: z.string().optional(),
    thumbnailUrl: z.string().optional(),
  }).optional(),
  
  error: z.string().optional(),
});

export type ExtractYouTubeInput = z.infer<typeof ExtractYouTubeInputSchema>;
export type ExtractYouTubeOutput = z.infer<typeof ExtractYouTubeOutputSchema>;

// Edge function implementation
export async function extractYouTubeContent(input: ExtractYouTubeInput): Promise<ExtractYouTubeOutput> {
  // Use YouTube Transcript API or scraping via edge function
}
```

---

## 4. Synthesis Engine

### 4.1 Summary Generator

```typescript
/**
 * @fileoverview AI-Powered Summary Generator
 * @module lib/knowledge/core/synthesis/summary-generator
 */

import { z } from 'zod';

export const GenerateSummaryInputSchema = z.object({
  content: z.string(),
  language: z.enum(['en', 'vi']).default('vi'),
  style: z.enum(['brief', 'detailed', 'bullet-points', 'academic']).default('detailed'),
  maxLength: z.number().optional(), // in words
  context: z.string().optional(), // Additional context
});

export const GenerateSummaryOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  suggestedTitle: z.string(),
  wordCount: z.number(),
  language: z.string(),
});

export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

// Uses existing AI infrastructure (TanStack AI + Gemini)
export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  // Use chat API with specific prompt for summarization
}
```

### 4.2 Concept Extractor

```typescript
/**
 * @fileoverview Key Concept Extractor
 * @module lib/knowledge/core/synthesis/concept-extractor
 */

export const ExtractConceptsInputSchema = z.object({
  content: z.string(),
  language: z.enum(['en', 'vi']).default('vi'),
  maxConcepts: z.number().default(10),
  includeDefinitions: z.boolean().default(true),
});

export const ConceptSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string().optional(),
  importance: z.number().min(0).max(1), // 0 = low, 1 = critical
  category: z.string().optional(),
  relatedTerms: z.array(z.string()).optional(),
  sourcePosition: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
});

export const ExtractConceptsOutputSchema = z.object({
  concepts: z.array(ConceptSchema),
  totalFound: z.number(),
});

export type ExtractConceptsInput = z.infer<typeof ExtractConceptsInputSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type ExtractConceptsOutput = z.infer<typeof ExtractConceptsOutputSchema>;
```

### 4.3 Connection Mapper

```typescript
/**
 * @fileoverview Concept Connection Mapper
 * @module lib/knowledge/core/synthesis/connection-mapper
 * 
 * Maps relationships between concepts for visual canvas.
 */

export const MapConnectionsInputSchema = z.object({
  concepts: z.array(ConceptSchema),
  sources: z.array(SourceSchema),
  connectionTypes: z.array(z.enum([
    'is-a',           // Hierarchical
    'part-of',        // Compositional
    'related-to',     // General association
    'causes',         // Causal
    'depends-on',     // Dependency
    'contrasts-with', // Opposition
  ])).default(['is-a', 'related-to', 'part-of']),
});

export const ConnectionSchema = z.object({
  id: z.string(),
  fromConceptId: z.string(),
  toConceptId: z.string(),
  relationship: z.string(),
  strength: z.number().min(0).max(1),
  evidence: z.string().optional(), // Quote from source
  sourceId: z.string().optional(),
});

export const MapConnectionsOutputSchema = z.object({
  connections: z.array(ConnectionSchema),
  clusters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    conceptIds: z.array(z.string()),
  })).optional(),
});
```

### 4.4 Flashcard Generator

```typescript
/**
 * @fileoverview Flashcard Generator
 * @module lib/knowledge/core/output/flashcard-generator
 */

export const GenerateFlashcardsInputSchema = z.object({
  sourceId: z.string(),
  content: z.string(),
  concepts: z.array(ConceptSchema).optional(),
  language: z.enum(['en', 'vi']).default('vi'),
  count: z.number().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  types: z.array(z.enum([
    'definition',       // Term → Definition
    'fill-in-blank',    // Complete the sentence
    'concept-compare',  // Compare two concepts
    'application',      // Apply concept to scenario
  ])).default(['definition', 'fill-in-blank']),
});

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  type: z.string(),
  difficulty: z.number().min(0).max(1),
  sourceId: z.string(),
  conceptId: z.string().optional(),
  
  // Spaced repetition data
  interval: z.number().default(1), // days
  easeFactor: z.number().default(2.5),
  repetitions: z.number().default(0),
  nextReviewDate: z.date().optional(),
});

export const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema),
  totalGenerated: z.number(),
});
```

### 4.5 Quiz Generator

```typescript
/**
 * @fileoverview Quiz Generator
 * @module lib/knowledge/core/output/quiz-generator
 */

export const GenerateQuizInputSchema = z.object({
  sourceIds: z.array(z.string()),
  concepts: z.array(ConceptSchema).optional(),
  language: z.enum(['en', 'vi']).default('vi'),
  questionCount: z.number().min(1).max(30).default(10),
  questionTypes: z.array(z.enum([
    'multiple-choice',
    'true-false',
    'short-answer',
    'matching',
  ])).default(['multiple-choice', 'true-false']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(), // For multiple choice
  correctAnswer: z.union([z.string(), z.number()]), // Index or text
  explanation: z.string(),
  difficulty: z.number(),
  sourceId: z.string(),
  conceptId: z.string().optional(),
  points: z.number().default(1),
});

export const GenerateQuizOutputSchema = z.object({
  quizId: z.string(),
  title: z.string(),
  questions: z.array(QuizQuestionSchema),
  totalPoints: z.number(),
  estimatedTime: z.number(), // minutes
});
```

---

## 5. AI Agent Tool Integration

### 5.1 Extended Tool Definitions

```typescript
/**
 * @fileoverview AI Agent Tools for Knowledge Synthesis
 * @module lib/knowledge/agent-tools
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// ============================================================================
// Tool 1: deep_research (Extended from original)
// ============================================================================

// ... (keep existing deep_research tool) ...

// ============================================================================
// Tool 2: ingest_source
// ============================================================================

export const ingestSourceDef = toolDefinition({
  name: 'ingest_source',
  description: `Ingest a new knowledge source (URL, PDF, YouTube, or text) into the current notebook.
This tool:
- Fetches content from the specified source
- Extracts text and metadata
- Generates initial summary
- Extracts key concepts
- Stores in local database

Use this when the user wants to add content to study or research.`,
  inputSchema: z.object({
    type: SourceTypeEnum,
    url: z.string().optional(),
    content: z.string().optional(),
    notebookId: z.string().optional(),
    language: z.enum(['en', 'vi']).default('vi'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    sourceId: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    conceptCount: z.number().optional(),
    error: z.string().optional(),
  }),
  needsApproval: false,
});

// ============================================================================
// Tool 3: synthesize_sources
// ============================================================================

export const synthesizeSourcesDef = toolDefinition({
  name: 'synthesize_sources',
  description: `Synthesize knowledge from multiple sources in a notebook.
This tool:
- Analyzes all sources in the notebook
- Finds connections between concepts
- Generates a comprehensive synthesis
- Creates a unified summary

Use this when the user wants to understand how multiple sources relate.`,
  inputSchema: z.object({
    notebookId: z.string(),
    sourceIds: z.array(z.string()).optional(), // If not specified, use all
    focusQuestion: z.string().optional(),
    language: z.enum(['en', 'vi']).default('vi'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    synthesis: z.string(),
    connections: z.array(ConnectionSchema),
    keyInsights: z.array(z.string()),
    error: z.string().optional(),
  }),
  needsApproval: false,
});

// ============================================================================
// Tool 4: generate_study_materials
// ============================================================================

export const generateStudyMaterialsDef = toolDefinition({
  name: 'generate_study_materials',
  description: `Generate study materials (flashcards, quizzes) from sources.
This tool:
- Creates flashcards for key concepts
- Generates quiz questions
- Supports Vietnamese language
- Adapts to difficulty level

Use this when the user wants to study or test their knowledge.`,
  inputSchema: z.object({
    notebookId: z.string(),
    materialType: z.enum(['flashcards', 'quiz', 'both']),
    count: z.number().min(1).max(30).default(10),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    language: z.enum(['en', 'vi']).default('vi'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    flashcards: z.array(FlashcardSchema).optional(),
    quiz: GenerateQuizOutputSchema.optional(),
    error: z.string().optional(),
  }),
  needsApproval: false,
});

// ============================================================================
// Tool 5: ask_sources
// ============================================================================

export const askSourcesDef = toolDefinition({
  name: 'ask_sources',
  description: `Ask a question and get an answer grounded in the notebook sources.
This tool:
- Searches all sources for relevant information
- Provides answer WITH citations
- Indicates confidence level
- Supports follow-up questions

Use this for Q&A with the user's study materials.`,
  inputSchema: z.object({
    notebookId: z.string(),
    question: z.string(),
    language: z.enum(['en', 'vi']).default('vi'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    answer: z.string(),
    citations: z.array(z.object({
      sourceId: z.string(),
      sourceTitle: z.string(),
      quote: z.string(),
    })),
    confidence: z.number().min(0).max(1),
    suggestedFollowUp: z.array(z.string()).optional(),
    error: z.string().optional(),
  }),
  needsApproval: false,
});
```

---

## 6. Edge Proxy API Extensions

### 6.1 Extended API Routes

```typescript
/**
 * @fileoverview Extended Research & Knowledge API
 * @module routes/api/research
 */

// Existing endpoints
// POST /api/research/fetch - Fetch URL content
// POST /api/research/search - Web search

// New endpoints for Knowledge Synthesis Station

// POST /api/research/youtube - Extract YouTube transcript
export const extractYouTubeTranscript = createServerFn({ method: 'POST' })
  .validator(ExtractYouTubeInputSchema)
  .handler(async ({ data }) => {
    // Use YouTube Transcript API or scraping
  });

// POST /api/research/pdf - Parse PDF content
export const parsePdfDocument = createServerFn({ method: 'POST' })
  .validator(ParsePdfInputSchema)
  .handler(async ({ data }) => {
    // Use PDF.js or server-side pdf-parse
  });

// POST /api/research/tts - Generate audio overview (optional)
export const generateAudioOverview = createServerFn({ method: 'POST' })
  .validator(z.object({
    text: z.string(),
    language: z.enum(['en', 'vi']).default('vi'),
    voice: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    // Use TTS API (Google Cloud, ElevenLabs, etc.)
    // Requires BYOK
  });
```

---

## 7. Implementation Roadmap (Extended)

### Phase 1: Foundation (Week 1-2)
**Focus:** Core research infrastructure (shared)

- [ ] Edge proxy endpoints (fetch, search)
- [ ] URL content extraction
- [ ] Basic AI synthesis (summary generator)
- [ ] deep_research tool for agent
- [ ] IndexedDB source store

### Phase 2: Knowledge Station MVP (Week 3-4)
**Focus:** Educational use case

- [ ] `/knowledge` route and UI shell
- [ ] SourceCard component
- [ ] PDF parser integration
- [ ] YouTube transcript extraction
- [ ] Source persistence
- [ ] AI chat with sources (ask_sources tool)

### Phase 3: Study Materials (Week 5-6)
**Focus:** Flashcards and quizzes

- [ ] Flashcard generator
- [ ] Quiz generator
- [ ] Study interface (FlashcardDeck, QuizView)
- [ ] Spaced repetition logic
- [ ] generate_study_materials tool

### Phase 4: Visual Canvas (Week 7-8)
**Focus:** Knowledge visualization

- [ ] Concept extraction
- [ ] Connection mapping
- [ ] KnowledgeCanvas component (react-flow or D3)
- [ ] Export functionality (PDF, Markdown)

### Phase 5: Polish & Delight (Week 9+)
**Focus:** Premium experience

- [ ] Audio overview generation (TTS)
- [ ] Study analytics
- [ ] Vietnamese language tuning
- [ ] Performance optimization
- [ ] Mobile responsive design

---

## 8. Success Criteria (Extended)

### Deep Research Tool (Development Use Case)
- [ ] Agent can research libraries before implementing
- [ ] Research completes in <30 seconds
- [ ] Findings are accurate and current
- [ ] Codebase comparison works correctly

### Knowledge Synthesis Station (Educational Use Case)
- [ ] Time to first insight: <60 seconds
- [ ] PDF upload → Summary: Working
- [ ] YouTube → Transcript: Working
- [ ] AI Q&A with sources: Accurate with citations
- [ ] Flashcard generation: Quality Vietnamese content
- [ ] Quiz generation: Valid questions with explanations
- [ ] Works offline (IndexedDB persistence)
- [ ] Vietnamese language: Natural and correct

---

## 9. Risk Analysis (Extended)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| YouTube API changes | Medium | High | Multiple extraction methods, fallback |
| PDF parsing complex layouts | High | Medium | Use PDF.js + fallback to OCR API |
| TTS quality for Vietnamese | Medium | Medium | Test multiple providers, allow BYOK |
| AI hallucination in Q&A | Medium | High | Source grounding, citation requirement |
| Large PDF/video processing | Medium | Medium | Progress indicators, chunking, limits |
| IndexedDB storage limits | Low | Medium | Cleanup policies, storage management |

---

## 10. References

### Project Documents
- Concept Document: `docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md`
- Architecture: `_bmad-output/architecture/architecture.md`
- PRD: `_bmad-output/prd.md`
- Tool Patterns: `src/lib/agent/tools/*.ts`

### Technical References
- TanStack AI: https://tanstack.com/ai
- PDF.js: https://mozilla.github.io/pdf.js/
- YouTube Transcript API
- react-flow: https://reactflow.dev/
- D3.js: https://d3js.org/

### Market Research
- Vietnam EdTech: 25% CAGR growth
- Target personas: Minh (Grade 11), Thảo (University), Cô Lan (Teacher)

---

**Document Status:** EXTENDED - READY FOR REVIEW

**Consolidated Epic Structure:**
1. **Epic: Shared Research & Synthesis Engine** (Foundation)
2. **Epic: Deep Research Tool for AI Agent** (Development use case)
3. **Epic: Knowledge Synthesis Station** (Educational use case, see concept doc)

**Next Steps:**
1. Review and approve extended design
2. Create detailed Epic/Story breakdown
3. Begin Phase 1: Foundation implementation
