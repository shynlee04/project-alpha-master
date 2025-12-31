---
date: 2025-12-31
time: 01:45:00
phase: Research & Architecture
team: Team-B
agent_mode: bmad-bmm-architect
---

# Artifact 5: Multimodal Processing Specification

**Frontier RAG Knowledge Synthesis Expert System**

**Document ID:** MMS-2025-12-31-001
**Version:** 1.0.0
**Classification:** Research Artifact

---

## Executive Summary

This specification defines the multimodal processing architecture for the Frontier RAG Knowledge Synthesis Expert System, enabling the system to ingest, process, and synthesize information from multiple input modalities (text, images, audio, video, structured data) while producing diverse output modalities tailored to learner preferences. The architecture leverages client-side processing where possible, utilizing browser APIs and WebAssembly for privacy-preserving, offline-capable multimodal understanding. Integration with the existing RAG infrastructure and multi-agent coordination system enables sophisticated cross-modal synthesis and pedagogical content generation.

**Key Deliverables:**
- Unified multimodal ingestion pipeline supporting 5 input modalities
- Cross-modal embedding generation and retrieval architecture
- Output modality generation system for diverse learning formats
- Integration specifications for existing RAG and agent systems
- 16-week implementation roadmap with phased rollout

**Confidence Level:** 82%
**Implementation Effort:** Large (16-20 weeks)

---

## 1. Introduction and Scope

### 1.1 Purpose

This document provides comprehensive technical specifications for the multimodal processing capabilities of the Frontier RAG Knowledge Synthesis Expert System. It addresses the architectural design, processing pipelines, integration points, and implementation guidance necessary to support diverse content formats in the knowledge synthesis workflow.

The Knowledge Synthesis Station targets the Vietnamese education market, requiring robust support for multiple content types that students and educators commonly encounter: textbooks in PDF format, lecture recordings, educational videos, structured data from learning management systems, and visual content like diagrams and charts. This specification ensures the platform can ingest, process, and synthesize all these modalities while maintaining the local-first, privacy-preserving architecture established in the system architecture.

### 1.2 Scope

**In Scope:**
- Client-side document processing (PDF, images, audio, video, structured data)
- Cross-modal embedding generation using WebAssembly-compatible models
- Integration with Orama WASM vector store for multimodal retrieval
- Output generation for text, visualizations, and audio summaries
- Pedagogical content transformation across modalities
- Unified metadata schema for multimodal content

**Out of Scope:**
- Real-time video conferencing or streaming processing
- Server-side processing infrastructure (beyond API integrations)
- Complex video editing or transformation capabilities
- Hardware-accelerated processing beyond browser capabilities

### 1.3 Relationship to Other Artifacts

This specification builds upon and integrates with several foundational artifacts:

- **[`system-architecture-specification-2025-12-31.md`](system-architecture-specification-2025-12-31.md)**: Defines the 5-layer architecture within which multimodal processing operates, specifically the RAG Infrastructure Layer and Query Orchestration Layer
- **[`rag-pipeline-optimization-report-2025-12-31.md`](rag-pipeline-optimization-report-2025-12-31.md)**: Provides the vector store and embedding pipeline foundation that multimodal processing extends
- **[`agent-interaction-protocols-2025-12-31.md`](agent-interaction-protocols-2025-12-31.md)**: Defines the agent communication protocols that multimodal content will flow through
- **[`pedagogical-framework-design-2025-12-31.md`](pedagogical-framework-design-2025-12-31.md)**: Establishes the learning style accommodation system that multimodal output supports

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| **Modalities** | Different types of data input or output (text, image, audio, video, structured data) |
| **Cross-modal retrieval** | Finding content in one modality using queries from another modality |
| **Multimodal embedding** | Vector representations that capture semantic meaning across different data types |
| **WebAssembly (WASM)** | Binary instruction format for client-side execution with near-native performance |
| **Client-side processing** | Computation performed entirely within the user's browser |
| **Local-first** | Architecture where data processing occurs locally with optional cloud sync |
| **OCR** | Optical Character Recognition - converting images of text to machine-readable text |
| **ASR** | Automatic Speech Recognition - converting audio to text |
| **TTS** | Text-to-Speech - converting text to spoken audio |

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

The multimodal processing system integrates with the existing 5-layer architecture as follows:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  Text Output    │  │ Visual Output   │  │  Audio Output (TTS)             │  │
│  │  Component      │  │  Component      │  │  Component                       │  │
│  └────────┬────────┘  └────────┬────────┘  └───────────────┬─────────────────┘  │
└───────────┼────────────────────┼────────────────────────────┼────────────────────┘
            │                    │                            │
            ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATION LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │              Multimodal Output Generator                                 │    │
│  │  • Cross-modal synthesis engine                                         │    │
│  │  • Learning style adapter                                               │    │
│  │  • Output format router                                                 │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   MULTIMODAL PROCESSING LAYER (NEW)                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │   Document    │  │    Image      │  │    Audio      │  │    Video        │  │
│  │  Processor    │  │   Processor   │  │   Processor   │  │   Processor     │  │
│  │  (PDF/DOCX)   │  │   (OCR/CLIP)  │  │   (ASR/WHISPER│  │   (Frame/Track) │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬─────────┘  │
│          │                  │                  │                  │              │
│          └──────────────────┼──────────────────┼──────────────────┘              │
│                             ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │              Cross-Modal Embedding Engine                               │    │
│  │  • Modality-specific encoders (WASM-based)                             │    │
│  │  • Embedding normalization & storage                                   │    │
│  │  • Similarity computation                                              │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    RAG INFRASTRUCTURE LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │              Orama WASM Vector Store                                   │    │
│  │  • Multimodal document index                                           │    │
│  │  • Hybrid search (vector + keyword)                                    │    │
│  │  • Metadata filtering                                                  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      STORAGE & PERSISTENCE LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  IndexedDB      │  │   File System   │  │   Cache (WASM Modules)          │  │
│  │  (Content DB)   │  │   Access API    │  │                                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Processing Pipeline

The multimodal processing pipeline consists of five stages:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MULTIMODAL PIPELINE                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  INGESTION   │───▶│  EXTRACTION  │───▶│  EMBEDDING   │───▶│   INDEXING   │
│              │    │              │    │              │    │              │
│  • File drop │    │ • Text parse │    │ • Modality   │    │ • Orama      │
│  • URL fetch │    │ • OCR        │    │   encoders   │    │   index      │
│  • Clipboard │    │ • ASR        │    │ • Embedding  │    │ • Metadata   │
│  • API import│    │ • Metadata   │    │   storage    │    │   tagging    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                   │
                                                                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   OUTPUT     │◀───│  SYNTHESIS   │◀───│   RETRIEVAL  │◀───│              │
│   MODALITY   │    │   ENGINE     │    │              │    │              │
│              │    │              │    │ • Query      │    │              │
│  • Text      │    │ • Cross-modal│    │   processing │    │              │
│  • Visual    │    │   synthesis  │    │ • Relevance  │    │              │
│  • Audio     │    │ • Pedagogical│    │   scoring    │    │              │
│  • Summary   │    │   adaptation │    │ • Fusion     │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 3. Input Modalities

### 3.1 Text Document Processing

#### 3.1.1 Supported Formats

| Format | Extension | Processing Method | Priority |
|--------|-----------|-------------------|----------|
| **PDF** | `.pdf` | PDF.js + text extraction | P0 |
| **Markdown** | `.md`, `.markdown` | Direct parsing | P0 |
| **Plain Text** | `.txt` | Direct parsing | P0 |
| **Microsoft Word** | `.docx` | Docx-parser library | P1 |
| **Rich Text** | `.rtf` | RTF parser library | P2 |
| **ePub** | `.epub` | EPUB.js library | P2 |

#### 3.1.2 PDF Processing Architecture

The PDF processing pipeline leverages PDF.js for client-side parsing:

```typescript
// src/lib/multimodal/pdf-processor.ts

import * as pdfjsLib from 'pdfjs-dist';

export interface PDFProcessingOptions {
  extractText: boolean;
  extractImages: boolean;
  extractMetadata: boolean;
  maxPages?: number;
  ocrEnabled?: boolean;
}

export interface PDFProcessingResult {
  text: string;
  images: ExtractedImage[];
  metadata: PDFMetadata;
  pageCount: number;
  processingTime: number;
}

export interface ExtractedImage {
  data: ArrayBuffer;
  mimeType: string;
  pageNumber: number;
  width: number;
  height: number;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: Date;
  modificationDate: Date;
  pageCount: number;
}

export class PDFProcessor {
  private worker: pdfjsLib.Worker;

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
  }

  async processFile(file: File, options: PDFProcessingOptions): Promise<PDFProcessingResult> {
    const startTime = performance.now();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const result: PDFProcessingResult = {
      text: '',
      images: [],
      metadata: await this.extractMetadata(pdf),
      pageCount: pdf.numPages,
      processingTime: 0
    };

    const maxPages = options.maxPages || pdf.numPages;
    const pagesToProcess = Math.min(maxPages, pdf.numPages);

    for (let i = 1; i <= pagesToProcess; i++) {
      const page = await pdf.getPage(i);
      
      if (options.extractText) {
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        result.text += pageText + '\n\n';
      }

      if (options.extractImages) {
        const images = await this.extractPageImages(page);
        result.images.push(...images);
      }
    }

    result.processingTime = performance.now() - startTime;
    return result;
  }

  private async extractMetadata(pdf: any): Promise<PDFMetadata> {
    const metadata = await pdf.getMetadata();
    return {
      title: metadata.info.Title || '',
      author: metadata.info.Author || '',
      subject: metadata.info.Subject || '',
      creator: metadata.info.Creator || '',
      producer: metadata.info.Producer || '',
      creationDate: metadata.info.CreationDate 
        ? new Date(metadata.info.CreationDate) 
        : new Date(),
      modificationDate: metadata.info.ModDate 
        ? new Date(metadata.info.ModDate) 
        : new Date(),
      pageCount: pdf.numPages
    };
  }

  private async extractPageImages(page: any): Promise<ExtractedImage[]> {
    const images: ExtractedImage[] = [];
    const ops = await page.getOperatorList();
    
    // Image extraction logic using operator list
    // Maps image operators to extracted image data
    
    return images;
  }
}
```

#### 3.1.3 Text Chunking Strategy

Following the RAG pipeline specification, text is chunked for embedding generation:

```typescript
// src/lib/multimodal/text-chunker.ts

export interface TextChunk {
  id: string;
  content: string;
  startOffset: number;
  endOffset: number;
  sourceId: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  pageNumber?: number;
  section?: string;
  heading?: string;
  language: string;
  tokenCount: number;
}

export class TextChunker {
  private readonly targetChunkSize = 512; // tokens
  private readonly overlapSize = 64; // tokens

  async chunkText(
    text: string, 
    sourceId: string,
    options: ChunkingOptions = {}
  ): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];
    
    // Detect language for proper tokenization
    const language = await this.detectLanguage(text);
    
    // Split into semantic sections (paragraphs, headers)
    const sections = this.splitIntoSections(text, options);
    
    for (const section of sections) {
      const sectionChunks = this.chunkSection(
        section, 
        sourceId, 
        language,
        options
      );
      chunks.push(...sectionChunks);
    }

    return chunks;
  }

  private splitIntoSections(text: string, options: ChunkingOptions): Section[] {
    // Split by headings, paragraphs, or fixed-length segments
    // Preserve structural metadata for retrieval
    
    const sections: Section[] = [];
    // Implementation details...
    return sections;
  }

  private chunkSection(
    section: Section,
    sourceId: string,
    language: string,
    options: ChunkingOptions
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Tokenize and chunk with overlap
    const tokens = this.tokenize(section.content, language);
    
    for (let i = 0; i < tokens.length; i += this.targetChunkSize - this.overlapSize) {
      const chunkTokens = tokens.slice(
        i, 
        i + this.targetChunkSize
      );
      
      const chunk: TextChunk = {
        id: this.generateChunkId(sourceId, i),
        content: this.detokenize(chunkTokens, language),
        startOffset: i,
        endOffset: i + chunkTokens.length,
        sourceId,
        metadata: {
          pageNumber: section.pageNumber,
          section: section.heading,
          language,
          tokenCount: chunkTokens.length
        }
      };
      
      chunks.push(chunk);
    }

    return chunks;
  }
}
```

### 3.2 Image Processing

#### 3.2.1 Supported Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| **JPEG** | `.jpg`, `.jpeg` | Photos, scanned documents |
| **PNG** | `.png`, `.apng` | Diagrams, screenshots |
| **GIF** | `.gif` | Animated content |
| **WebP** | `.webp` | Modern web images |
| **SVG** | `.svg` | Vector graphics |

#### 3.2.2 Image Processing Pipeline

```typescript
// src/lib/multimodal/image-processor.ts

export interface ImageProcessingOptions {
  extractText: boolean;           // OCR for embedded text
  generateDescription: boolean;   // Vision model description
  extractEmbeddedData: boolean;   // EXIF, metadata
  maxDimension?: number;          // Resize for processing
  generateThumbnail?: boolean;
}

export interface ImageProcessingResult {
  imageId: string;
  width: number;
  height: number;
  mimeType: string;
  embeddedText?: string;          // OCR results
  description?: string;           // Vision model description
  tags: string[];
  metadata: ImageMetadata;
  thumbnailDataUrl?: string;
  embedding?: number[];           // CLIP embedding
}

export interface ImageMetadata {
  exif?: Record<string, any>;
  colorProfile?: string;
  fileSize: number;
  aspectRatio: number;
}

export class ImageProcessor {
  private readonly clipModel: CLIPModel; // WASM-based CLIP
  private readonly ocrEngine: TesseractOCR;

  async processImage(
    file: File, 
    options: ImageProcessingOptions
  ): Promise<ImageProcessingResult> {
    const imageId = this.generateImageId(file);
    const imageData = await this.loadImage(file);
    
    const result: ImageProcessingResult = {
      imageId,
      width: imageData.width,
      height: imageData.height,
      mimeType: file.type,
      tags: [],
      metadata: {
        fileSize: file.size,
        aspectRatio: imageData.width / imageData.height
      }
    };

    // Resize if necessary for performance
    const processedImage = await this.resizeIfNeeded(imageData, options.maxDimension);

    // OCR for embedded text
    if (options.extractText) {
      result.embeddedText = await this.performOCR(processedImage);
    }

    // Generate vision model description
    if (options.generateDescription) {
      result.description = await this.generateVisionDescription(processedImage);
    }

    // Generate CLIP embedding
    result.embedding = await this.generateEmbedding(processedImage);

    // Extract tags from description
    if (result.description) {
      result.tags = this.extractTags(result.description);
    }

    // Generate thumbnail
    if (options.generateThumbnail) {
      result.thumbnailDataUrl = await this.generateThumbnail(processedImage);
    }

    return result;
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async generateEmbedding(imageData: HTMLImageElement): Promise<number[]> {
    // Use WASM-based CLIP model for embedding generation
    return this.clipModel.embedImage(imageData);
  }
}
```

#### 3.2.3 CLIP Embedding for Cross-Modal Retrieval

The system uses CLIP (Contrastive Language-Image Pre-training) for generating unified embeddings that enable text-to-image and image-to-image retrieval:

```typescript
// src/lib/multimodal/clip-embeddings.ts

export interface CLIPEmbedding {
  imageEmbedding: number[];
  textEmbedding: number[];
  modality: 'image' | 'text';
}

export class CLIPEmbeddingEngine {
  private model: CLIPModelWASM;
  private embeddingCache: Map<string, CLIPEmbedding> = new Map();

  async embedImage(imageData: HTMLImageElement | ArrayBuffer): Promise<number[]> {
    const cacheKey = this.hashImageData(imageData);
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!.imageEmbedding;
    }

    const embedding = await this.model.embedImage(imageData);
    this.embeddingCache.set(cacheKey, {
      imageEmbedding: embedding,
      textEmbedding: [],
      modality: 'image'
    });

    return embedding;
  }

  async embedText(text: string): Promise<number[]> {
    const cacheKey = `text:${this.hashText(text)}`;
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!.textEmbedding;
    }

    const embedding = await this.model.embedText(text);
    this.embeddingCache.set(cacheKey, {
      imageEmbedding: [],
      textEmbedding: embedding,
      modality: 'text'
    });

    return embedding;
  }

  async computeSimilarity(
    embeddingA: number[], 
    embeddingB: number[]
  ): Promise<number> {
    return this.cosineSimilarity(embeddingA, embeddingB);
  }

  async findSimilarImages(
    queryText: string,
    imageEmbeddings: Map<string, number[]>,
    topK: number = 5
  ): Promise<Array<{ imageId: string; score: number }>> {
    const queryEmbedding = await this.embedText(queryText);
    const results: Array<{ imageId: string; score: number }> = [];

    for (const [imageId, imageEmbedding] of imageEmbeddings) {
      const score = await this.computeSimilarity(queryEmbedding, imageEmbedding);
      results.push({ imageId, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
```

### 3.3 Audio Processing

#### 3.3.1 Supported Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| **MP3** | `.mp3` | Music, podcasts |
| **WAV** | `.wav` | High-quality audio |
| **OGG** | `.ogg`, `.oga` | Open format audio |
| **WebM Audio** | `.webm` | Web audio |
| **M4A** | `.m4a` | iTunes, podcasts |
| **FLAC** | `.flac` | Lossless audio |

#### 3.3.2 Audio Processing Pipeline

```typescript
// src/lib/multimodal/audio-processor.ts

export interface AudioProcessingOptions {
  transcribe: boolean;
  language?: string;              // Auto-detect if not specified
  extractMetadata: boolean;
  generateSummary: boolean;
  speakerDiarization?: boolean;   // P2 feature
}

export interface AudioProcessingResult {
  audioId: string;
  duration: number;
  sampleRate: number;
  channels: number;
  transcription?: TranscriptionResult;
  summary?: string;
  embedding?: number[];           // Audio embedding for retrieval
  metadata: AudioMetadata;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  confidence: number;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker?: string;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  bitrate: number;
  fileSize: number;
}

export class AudioProcessor {
  private audioContext: AudioContext;
  private whisperModel: WhisperWASM; // Whisper model for ASR
  private audioEncoder: AudioEncoder;

  async processAudio(
    file: File,
    options: AudioProcessingOptions
  ): Promise<AudioProcessingResult> {
    const audioId = this.generateAudioId(file);
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.decodeAudio(arrayBuffer);
    
    const result: AudioProcessingResult = {
      audioId,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      metadata: {
        bitrate: await this.estimateBitrate(file, audioBuffer),
        fileSize: file.size
      }
    };

    // Transcribe audio using Whisper
    if (options.transcribe) {
      result.transcription = await this.transcribeAudio(arrayBuffer, options.language);
      
      // Generate summary from transcription
      if (options.generateSummary && result.transcription) {
        result.summary = await this.generateAudioSummary(result.transcription);
      }
    }

    // Generate audio embedding for content-based retrieval
    result.embedding = await this.generateAudioEmbedding(audioBuffer);

    return result;
  }

  private async decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  private async transcribeAudio(
    audioData: ArrayBuffer,
    language?: string
  ): Promise<TranscriptionResult> {
    // Use WASM-based Whisper model for client-side transcription
    const result = await this.whisperModel.transcribe(audioData, {
      language: language || 'auto'
    });

    return {
      text: result.text,
      segments: result.segments.map(s => ({
        id: s.id,
        start: s.start,
        end: s.end,
        text: s.text,
        confidence: s.avgLogProb
      })),
      language: result.language,
      confidence: result.avgLogProb
    };
  }

  private async generateAudioEmbedding(audioBuffer: AudioBuffer): Promise<number[]> {
    // Generate audio embedding using a WASM-based audio encoder
    // Useful for content-based audio retrieval
    return this.audioEncoder.embed(audioBuffer);
  }
}
```

### 3.4 Video Processing

#### 3.4.1 Supported Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| **MP4** | `.mp4` | Standard video |
| **WebM** | `.webm` | Web video |
| **MOV** | `.mov` | Apple video |
| **AVI** | `.avi` | Legacy format |

#### 3.4.2 Video Processing Architecture

```typescript
// src/lib/multimodal/video-processor.ts

export interface VideoProcessingOptions {
  extractFrames: boolean;
  frameInterval: number;          // Seconds between frames
  transcribeAudio: boolean;
  generateKeyframes: boolean;
  maxResolution?: number;
}

export interface VideoProcessingResult {
  videoId: string;
  duration: number;
  width: number;
  height: number;
  frames: ExtractedFrame[];
  audioTrack?: AudioProcessingResult;
  keyframes: Keyframe[];
  metadata: VideoMetadata;
}

export interface ExtractedFrame {
  frameId: string;
  timestamp: number;
  dataUrl: string;
  width: number;
  height: number;
  embedding?: number[];
}

export interface Keyframe {
  frameId: string;
  timestamp: number;
  sceneChange: boolean;
  embedding?: number[];
}

export interface VideoMetadata {
  codec?: string;
  bitrate: number;
  frameRate: number;
  fileSize: number;
  audioCodec?: string;
}

export class VideoProcessor {
  private videoDecoder: VideoDecoder;
  private frameExtractor: FrameExtractor;
  private thumbnailGenerator: ThumbnailGenerator;

  async processVideo(
    file: File,
    options: VideoProcessingOptions
  ): Promise<VideoProcessingResult> {
    const videoId = this.generateVideoId(file);
    
    // Extract video metadata and create video element
    const videoInfo = await this.getVideoInfo(file);
    
    const result: VideoProcessingResult = {
      videoId,
      duration: videoInfo.duration,
      width: videoInfo.width,
      height: videoInfo.height,
      frames: [],
      keyframes: [],
      metadata: {
        codec: videoInfo.codec,
        bitrate: videoInfo.bitrate,
        frameRate: videoInfo.frameRate,
        fileSize: file.size
      }
    };

    // Extract frames at specified interval
    if (options.extractFrames) {
      result.frames = await this.extractFrames(
        file,
        options.frameInterval,
        options.maxResolution
      );
    }

    // Extract keyframes using scene detection
    if (options.generateKeyframes) {
      result.keyframes = await this.extractKeyframes(result.frames);
    }

    // Process audio track separately
    if (options.transcribeAudio) {
      const audioFile = await this.extractAudioTrack(file);
      result.audioTrack = await audioProcessor.processAudio(audioFile, {
        transcribe: true,
        generateSummary: true
      });
    }

    return result;
  }

  private async extractFrames(
    file: File,
    interval: number,
    maxResolution?: number
  ): Promise<ExtractedFrame[]> {
    const frames: ExtractedFrame[] = [];
    const videoElement = await this.createVideoElement(file);
    
    const frameCount = Math.floor(videoElement.duration / interval);
    
    for (let i = 0; i < frameCount; i++) {
      const timestamp = i * interval;
      videoElement.currentTime = timestamp;
      
      await new Promise(resolve => {
        videoElement.onseeked = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = maxResolution 
        ? Math.min(videoElement.videoWidth, maxResolution) 
        : videoElement.videoWidth;
      canvas.height = canvas.width * (videoElement.videoHeight / videoElement.videoWidth);
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      frames.push({
        frameId: this.generateFrameId(),
        timestamp,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        width: canvas.width,
        height: canvas.height
      });
    }

    return frames;
  }
}
```

### 3.5 Structured Data Processing

#### 3.5.1 Supported Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| **JSON** | `.json` | API responses, data structures |
| **CSV** | `.csv` | Tabular data, spreadsheets |
| **XML** | `.xml` | Legacy data formats |
| **YAML** | `.yaml`, `.yml` | Configuration, metadata |
| **Markdown Tables** | `.md` | Document-embedded tables |

#### 3.5.2 Structured Data Processing

```typescript
// src/lib/multimodal/structured-data-processor.ts

export interface StructuredDataProcessingOptions {
  flattenNested: boolean;
  extractHeaders: boolean;
  generateDescription: boolean;
  convertTablesToText: boolean;
}

export interface StructuredDataProcessingResult {
  dataId: string;
  originalFormat: string;
  extractedText: string;
  schema: DataSchema;
  tables?: ExtractedTable[];
  embedding?: number[];
}

export interface DataSchema {
  fields: SchemaField[];
  sampleRow: Record<string, any>;
  rowCount: number;
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  nullable: boolean;
  sampleValues: any[];
}

export interface ExtractedTable {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
}

export class StructuredDataProcessor {
  async processStructuredData(
    file: File,
    options: StructuredDataProcessingOptions
  ): Promise<StructuredDataProcessingResult> {
    const dataId = this.generateDataId(file);
    const content = await this.readFileContent(file);
    
    let parsed: any;
    let format: string;
    
    // Detect and parse format
    if (file.name.endsWith('.json')) {
      format = 'json';
      parsed = JSON.parse(content);
    } else if (file.name.endsWith('.csv') || content.includes(',')) {
      format = 'csv';
      parsed = this.parseCSV(content);
    } else if (file.name.endsWith('.xml')) {
      format = 'xml';
      parsed = this.parseXML(content);
    } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
      format = 'yaml';
      parsed = this.parseYAML(content);
    } else {
      // Try JSON as fallback
      format = 'json';
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Unable to determine structured data format');
      }
    }

    const result: StructuredDataProcessingResult = {
      dataId,
      originalFormat: format,
      extractedText: '',
      schema: this.inferSchema(parsed)
    };

    // Convert to readable text for embedding
    result.extractedText = this.convertToReadableText(parsed, options);

    // Extract tables if present
    if (format === 'csv' || this.hasTableStructure(parsed)) {
      result.tables = this.extractTables(parsed);
    }

    // Generate embedding
    result.embedding = await this.generateTextEmbedding(result.extractedText);

    return result;
  }

  private convertToReadableText(data: any, options: StructuredDataProcessingOptions): string {
    let text = '';
    
    if (Array.isArray(data)) {
      text = `This dataset contains ${data.length} records.\n\n`;
      
      if (data.length > 0 && typeof data[0] === 'object') {
        const schema = this.inferSchema(data);
        text += `Fields: ${schema.fields.map(f => f.name).join(', ')}\n\n`;
        
        // Include sample rows
        const sampleCount = Math.min(5, data.length);
        text += `Sample records:\n`;
        for (let i = 0; i < sampleCount; i++) {
          text += JSON.stringify(data[i], null, 2) + '\n';
        }
      } else {
        text += `Data: ${JSON.stringify(data.slice(0, 10), null, 2)}\n`;
      }
    } else if (typeof data === 'object' && data !== null) {
      text = 'This structured data contains the following information:\n\n';
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
          text += `${key}: ${JSON.stringify(value, null, 2)}\n`;
        } else {
          text += `${key}: ${value}\n`;
        }
      }
    } else {
      text = String(data);
    }

    return text;
  }
}
```

---

## 4. Cross-Modal Embedding Architecture

### 4.1 Unified Embedding Space

The system uses a unified embedding space that allows retrieval across modalities:

```typescript
// src/lib/multimodal/unified-embeddings.ts

export interface UnifiedEmbedding {
  id: string;
  vector: number[];
  modality: 'text' | 'image' | 'audio' | 'video' | 'structured';
  sourceId: string;
  chunkId?: string;
  metadata: EmbeddingMetadata;
}

export interface EmbeddingMetadata {
  contentType: string;     // 'pdf', 'jpg', 'mp3', etc.
  title?: string;
  description?: string;
  language?: string;
  timestamp: number;
  fileSize: number;
}

export class UnifiedEmbeddingEngine {
  private textEncoder: TextEncoderWASM;
  private imageEncoder: CLIPEncoderWASM;
  private audioEncoder: AudioEncoderWASM;
  private embeddingStore: Map<string, UnifiedEmbedding> = new Map();
  private readonly EMBEDDING_DIMENSION = 512;

  async embedContent(content: ContentItem): Promise<UnifiedEmbedding> {
    const embedding = await this.getModalityEncoder(content.modality).encode(content.data);
    
    const unified: UnifiedEmbedding = {
      id: this.generateEmbeddingId(),
      vector: embedding,
      modality: content.modality,
      sourceId: content.sourceId,
      chunkId: content.chunkId,
      metadata: {
        contentType: content.contentType,
        title: content.title,
        description: content.description,
        language: content.language,
        timestamp: Date.now(),
        fileSize: content.fileSize
      }
    };

    this.embeddingStore.set(unified.id, unified);
    return unified;
  }

  private getModalityEncoder(modality: string): ModalityEncoder {
    switch (modality) {
      case 'text':
        return this.textEncoder;
      case 'image':
        return this.imageEncoder;
      case 'audio':
        return this.audioEncoder;
      default:
        throw new Error(`No encoder available for modality: ${modality}`);
    }
  }

  async findSimilar(
    query: string,
    modalities: string[],
    topK: number = 10
  ): Promise<Array<{ embedding: UnifiedEmbedding; score: number }>> {
    const queryEmbedding = await this.textEncoder.encode(query);
    const results: Array<{ embedding: UnifiedEmbedding; score: number }> = [];

    for (const embedding of this.embeddingStore.values()) {
      if (!modalities.includes(embedding.modality)) continue;
      
      const score = this.cosineSimilarity(queryEmbedding, embedding.vector);
      results.push({ embedding, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async crossModalRetrieval(
    queryModality: string,
    queryData: any,
    targetModalities: string[],
    topK: number = 10
  ): Promise<Array<{ embedding: UnifiedEmbedding; score: number }>> {
    // Generate embedding from query in its modality
    const queryEmbedding = await this.getModalityEncoder(queryModality).encode(queryData);
    
    const results: Array<{ embedding: UnifiedEmbedding; score: number }> = [];
    
    for (const embedding of this.embeddingStore.values()) {
      if (!targetModalities.includes(embedding.modality)) continue;
      
      const score = this.cosineSimilarity(queryEmbedding, embedding.vector);
      results.push({ embedding, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
```

### 4.2 Embedding Storage in Orama

The unified embeddings are stored in the Orama WASM vector store with modality filtering:

```typescript
// src/lib/multimodal/embedding-storage.ts

import { create, insert, search } from '@orama/orama';

export interface EmbeddingDocument {
  id: string;
  sourceId: string;
  chunkId?: string;
  modality: 'text' | 'image' | 'audio' | 'video' | 'structured';
  contentType: string;
  title?: string;
  description?: string;
  textContent?: string;           // For hybrid search
  embedding: number[];            // Stored as base64
  language?: string;
  fileSize: number;
  timestamp: number;
  collectionId: string;
}

export class EmbeddingStorage {
  private db: OramaDB;
  private embeddingIndex: string = 'embeddings';

  async initialize(): Promise<void> {
    this.db = await create({
      schema: {
        id: 'string',
        sourceId: 'string',
        chunkId: 'string',
        modality: 'string',
        contentType: 'string',
        title: 'string',
        description: 'string',
        textContent: 'string',
        embedding: 'string[]',
        language: 'string',
        fileSize: 'number',
        timestamp: 'number',
        collectionId: 'string'
      }
    });
  }

  async insertEmbedding(doc: EmbeddingDocument): Promise<void> {
    // Convert embedding array to string array for Orama
    const docWithStringEmbedding: EmbeddingDocument = {
      ...doc,
      embedding: doc.embedding.map(String)
    };
    
    await insert(this.db, this.embeddingIndex, docWithStringEmbedding);
  }

  async search(
    query: number[],
    modalities: string[],
    collectionId?: string,
    topK: number = 10
  ): Promise<Array<{ id: string; score: number; document: EmbeddingDocument }>> {
    const results = await search(this.db, {
      mode: 'hybrid',
      term: '',
      vector: {
        value: query.map(String),
        similarity: 0.7
      },
      where: {
        modality: { in: modalities }
      }
    });

    // Filter by collection if specified
    const filtered = collectionId 
      ? results.hits.filter(h => h.document.collectionId === collectionId)
      : results.hits;

    return filtered.slice(0, topK).map(hit => ({
      id: hit.document.id,
      score: hit.score,
      document: {
        ...hit.document,
        embedding: hit.document.embedding.map(Number)
      }
    }));
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    // Implementation for deleting all embeddings from a source
  }

  async getStats(): Promise<EmbeddingStats> {
    const count = await this.db.count(this.embeddingIndex);
    return {
      totalEmbeddings: count,
      byModality: await this.getModalityCounts(),
      storageSize: await this.estimateStorageSize()
    };
  }
}
```

---

## 5. Output Modalities

### 5.1 Text Output Generation

```typescript
// src/lib/multimodal/output-generators.ts

export interface TextOutputOptions {
  format: 'plain' | 'markdown' | 'html';
  maxLength?: number;
  includeCitations: boolean;
  includeMetadata: boolean;
  targetAudience: 'student' | 'teacher' | 'expert';
}

export class TextOutputGenerator {
  private llmAdapter: LLMAdapter;

  async generateText(
    content: SynthesizedContent,
    options: TextOutputOptions
  ): Promise<GeneratedText> {
    // Transform content based on target audience
    const audienceAdjusted = await this.adjustForAudience(
      content, 
      options.targetAudience
    );

    // Generate formatted text
    let formattedText = await this.formatContent(audienceAdjusted, options.format);

    // Add citations if requested
    if (options.includeCitations) {
      formattedText = await this.addCitations(formattedText, content.sources);
    }

    // Truncate if necessary
    if (options.maxLength && formattedText.length > options.maxLength) {
      formattedText = this.truncateText(formattedText, options.maxLength);
    }

    return {
      text: formattedText,
      wordCount: this.countWords(formattedText),
      readingTime: this.estimateReadingTime(formattedText),
      format: options.format
    };
  }
}
```

### 5.2 Visual Output Generation

```typescript
export interface VisualOutputOptions {
  type: 'infographic' | 'diagram' | 'chart' | 'summary-card';
  style: 'minimal' | 'detailed' | 'educational';
  colorScheme?: string;
  includeIcons: boolean;
  width?: number;
  height?: number;
}

export class VisualOutputGenerator {
  private diagramEngine: MermaidWASM;
  private chartEngine: ChartWASM;

  async generateVisual(
    content: SynthesizedContent,
    options: VisualOutputOptions
  ): Promise<GeneratedVisual> {
    switch (options.type) {
      case 'infographic':
        return this.generateInfographic(content, options);
      case 'diagram':
        return this.generateDiagram(content, options);
      case 'chart':
        return this.generateChart(content, options);
      case 'summary-card':
        return this.generateSummaryCard(content, options);
      default:
        throw new Error(`Unknown visual type: ${options.type}`);
    }
  }

  private async generateSummaryCard(
    content: SynthesizedContent,
    options: VisualOutputOptions
  ): Promise<GeneratedVisual> {
    // Generate summary card with key points, icons, and visual hierarchy
    const cardData = {
      title: content.mainTopic,
      keyPoints: content.keyInsights.slice(0, 5),
      icon: this.selectIconForTopic(content.mainTopic),
      colorScheme: options.colorScheme || 'default'
    };

    const svg = await this.renderSummaryCardSVG(cardData);
    
    return {
      type: 'summary-card',
      format: 'svg',
      data: svg,
      width: 800,
      height: 600
    };
  }
}
```

### 5.3 Audio Output Generation

```typescript
export interface AudioOutputOptions {
  voice: string;
  speed: number;           // 0.5 to 2.0
  pitch: number;           // 0.5 to 2.0
  includePause: boolean;
  format: 'mp3' | 'wav' | 'ogg';
}

export class AudioOutputGenerator {
  private ttsEngine: BrowserTTS;
  private audioEncoder: AudioEncoder;

  async generateAudio(
    content: SynthesizedContent,
    options: AudioOutputOptions
  ): Promise<GeneratedAudio> {
    // Convert text to speech
    const audioBuffer = await this.ttsEngine.synthesize(content.text, {
      voice: options.voice,
      rate: options.speed,
      pitch: options.pitch
    });

    // Add pauses for better comprehension if requested
    let finalBuffer = audioBuffer;
    if (options.includePause) {
      finalBuffer = await this.insertStrategicPauses(audioBuffer, content.structure);
    }

    // Encode to requested format
    const encodedAudio = await this.audioEncoder.encode(finalBuffer, options.format);

    return {
      audio: encodedAudio,
      format: options.format,
      duration: finalBuffer.duration,
      voice: options.voice
    };
  }
}
```

---

## 6. Integration with Existing Architecture

### 6.1 Integration Points

The multimodal processing system integrates with existing components:

| Component | Integration Type | Data Flow |
|-----------|-----------------|-----------|
| **Orama Vector Store** | Direct integration | Bidirectional (store/retrieve embeddings) |
| **RAG Pipeline** | Pipeline extension | Downstream (enhanced retrieval) |
| **Multi-Agent System** | Service calls | Bidirectional (content synthesis) |
| **Knowledge Base** | Storage backend | Write (processed content) |
| **Learning Style Adapter** | Service calls | Output (modality transformation) |

### 6.2 Integration Architecture

```typescript
// src/lib/multimodal/integration.ts

import { EmbeddingStorage } from './embedding-storage';
import { UnifiedEmbeddingEngine } from './unified-embeddings';
import { KnowledgeBase } from '../knowledge/knowledge-base';

export class MultimodalIntegration {
  private embeddingStorage: EmbeddingStorage;
  private embeddingEngine: UnifiedEmbeddingEngine;
  private knowledgeBase: KnowledgeBase;

  async processAndIndex(
    source: ContentSource,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    // 1. Route to appropriate processor based on content type
    const processor = this.getProcessor(source.type);
    
    // 2. Process content
    const processed = await processor.process(source, options);
    
    // 3. Generate embeddings
    const embeddings = await Promise.all(
      processed.chunks.map(chunk => 
        this.embeddingEngine.embedContent(chunk)
      )
    );
    
    // 4. Store in Orama
    for (const embedding of embeddings) {
      await this.embeddingStorage.insertEmbedding({
        ...embedding,
        collectionId: source.collectionId
      });
    }
    
    // 5. Store processed content in knowledge base
    await this.knowledgeBase.storeProcessedContent(source.id, processed);
    
    // 6. Update collection statistics
    await this.updateCollectionStats(source.collectionId);
    
    return {
      sourceId: source.id,
      chunksProcessed: processed.chunks.length,
      embeddingsCreated: embeddings.length,
      processingTime: processed.processingTime
    };
  }

  async multimodalQuery(
    query: MultimodalQuery
  ): Promise<QueryResult> {
    // 1. Generate query embedding in specified modality
    const queryEmbedding = await this.embeddingEngine.embedContent(query.content);
    
    // 2. Search across specified modalities
    const searchResults = await this.embeddingStorage.search(
      queryEmbedding.vector,
      query.targetModalities,
      query.collectionId,
      query.topK
    );
    
    // 3. Fetch source content for results
    const content = await this.knowledgeBase.fetchContent(
      searchResults.map(r => r.document.sourceId)
    );
    
    // 4. Synthesize results based on query type
    const synthesized = await this.synthesizeResults(
      query, 
      searchResults, 
      content
    );
    
    return synthesized;
  }
}
```

### 6.3 Agent Integration

The multimodal system integrates with the multi-agent coordination system defined in the Agent Interaction Protocols:

```typescript
// Integration with Research Specialist Agent
export interface AgentMultimodalIntegration {
  // Research Specialist can request multimodal content processing
  async processAgentRequest(request: AgentRequest): Promise<AgentResponse>;
  
  // Synthesize multimodal findings
  async synthesizeAgentFindings(agentId: string, findings: AgentFinding[]): Promise<SynthesizedContent>;
  
  // Generate agent-specific output formats
  async generateAgentOutput(agentId: string, content: SynthesizedContent): Promise<AgentOutput>;
}

// Usage in agent tool calls
const multimodalTool = {
  name: 'processMultimodal',
  description: 'Process and analyze multimodal content',
  parameters: z.object({
    sourceId: z.string(),
    modalities: z.array(z.enum(['text', 'image', 'audio', 'video'])),
    outputModality: z.enum(['text', 'visual', 'audio']),
    options: z.record(z.any()).optional()
  }),
  handler: async (params) => {
    return multimodalIntegration.processAndIndex(params);
  }
};
```

---

## 7. Performance and Optimization

### 7.1 Processing Performance Targets

| Operation | Target Time | Acceptable Time | Priority |
|-----------|-------------|-----------------|----------|
| **PDF text extraction (10 pages)** | < 2s | < 5s | P0 |
| **Image embedding (1MB)** | < 500ms | < 1s | P0 |
| **Audio transcription (5 min)** | < 10s | < 30s | P1 |
| **Video frame extraction (1 min)** | < 5s | < 15s | P1 |
| **Cross-modal retrieval** | < 100ms | < 200ms | P0 |
| **Embedding storage** | < 50ms | < 100ms | P1 |

### 7.2 Optimization Strategies

```typescript
// src/lib/multimodal/performance.ts

export class PerformanceOptimizer {
  // Web Worker for heavy processing
  private workerPool: WorkerPool;
  
  // WASM module caching
  private wasmCache: Map<string, WebAssembly.Module> = new Map();
  
  // Embedding quantization for storage
  private readonly QUANTIZATION_BITS = 8;

  async initializeWASMModule(url: string): Promise<WebAssembly.Module> {
    if (this.wasmCache.has(url)) {
      return this.wasmCache.get(url)!;
    }

    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    const module = await WebAssembly.compile(bytes);
    
    this.wasmCache.set(url, module);
    return module;
  }

  quantizeEmbedding(embedding: number[]): Uint8Array {
    // Quantize float32 embeddings to int8 for storage efficiency
    const min = Math.min(...embedding);
    const max = Math.max(...embedding);
    const range = max - min;
    
    return new Uint8Array(
      embedding.map(v => 
        Math.round(((v - min) / range) * 255)
      )
    );
  }

  dequantizeEmbedding(quantized: Uint8Array, originalMin: number, originalMax: number): number[] {
    const range = originalMax - originalMin;
    return Array.from(quantized).map(
      v => (v / 255) * range + originalMin
    );
  }

  async runInWorker<T>(
    workerScript: string,
    data: any
  ): Promise<T> {
    return this.workerPool.runTask(workerScript, data);
  }
}
```

### 7.3 Caching Strategy

```typescript
// src/lib/multimodal/cache.ts

export interface CacheEntry {
  key: string;
  data: any;
  expiresAt: number;
  modality: string;
}

export class ProcessingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly MAX_CACHE_SIZE = 100; // MB
  private currentCacheSize = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  async set<T>(key: string, data: T, modality: string, ttlMs: number = 3600000): Promise<void> {
    // Estimate size
    const size = this.estimateSize(data);
    
    // Evict if necessary
    while (this.currentCacheSize + size > this.MAX_CACHE_SIZE) {
      const evicted = this.evictOldest();
      this.currentCacheSize -= evicted?.size || 0;
    }

    this.cache.set(key, {
      key,
      data,
      expiresAt: Date.now() + ttlMs,
      modality
    });
    
    this.currentCacheSize += size;
  }

  private evictOldest(): CacheEntry | null {
    let oldest: CacheEntry | null = null;
    let oldestTime = Infinity;
    
    for (const entry of this.cache.values()) {
      if (entry.expiresAt < oldestTime) {
        oldest = entry;
        oldestTime = entry.expiresAt;
      }
    }
    
    if (oldest) {
      this.cache.delete(oldest.key);
    }
    
    return oldest;
  }
}
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 1-2 | PDF processor implementation with PDF.js | `pdf-processor.ts`, text extraction for PDF |
| 2-3 | Text chunking and embedding generation | `text-chunker.ts`, chunk pipeline |
| 3-4 | Orama integration for text embeddings | `embedding-storage.ts`, text search |
| 4 | Basic UI for document upload | Source import dialog, progress indicator |

**Confidence Score:** 88%
**Dependencies:** None

### Phase 2: Image Processing (Weeks 5-7)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 5 | CLIP WASM integration, image embedding | `clip-embeddings.ts`, image encoder |
| 5-6 | OCR integration (Tesseract.js) | `image-processor.ts`, text extraction from images |
| 6-7 | Image search and retrieval | Image modality in Orama, cross-modal search |
| 7 | Image upload UI with preview | Image import component, gallery view |

**Confidence Score:** 82%
**Dependencies:** Phase 1 completion

### Phase 3: Audio/Video Processing (Weeks 8-11)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 8-9 | Whisper WASM integration, audio transcription | `audio-processor.ts`, transcription |
| 9-10 | Video frame extraction, keyframe detection | `video-processor.ts`, frame extraction |
| 10-11 | Audio/video search integration | Audio/video modalities in Orama |
| 11 | Media upload UI | Audio/video import, playback component |

**Confidence Score:** 75%
**Dependencies:** Phase 1 completion

### Phase 4: Cross-Modal Synthesis (Weeks 12-14)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 12 | Unified embedding space implementation | `unified-embeddings.ts`, cross-modal retrieval |
| 12-13 | Output generation (visual, audio) | `output-generators.ts`, TTS integration |
| 13-14 | Integration with pedagogical framework | Learning style to output modality mapping |
| 14 | Cross-modal search UI | Unified search, result filtering by modality |

**Confidence Score:** 78%
**Dependencies:** Phases 1-3 completion

### Phase 5: Optimization & Polish (Weeks 15-16)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 15 | Performance optimization, caching | WASM caching, embedding quantization |
| 15-16 | Edge case handling, error recovery | Robust error handling, retry logic |
| 16 | Documentation, testing | API docs, integration tests |
| 16 | Final polish, UX refinement | Performance tuning, UI polish |

**Confidence Score:** 80%
**Dependencies:** Phase 4 completion

---

## 9. Technology Recommendations

### 9.1 Processing Libraries

| Component | Library | Justification | Confidence |
|-----------|---------|---------------|------------|
| **PDF Processing** | `pdfjs-dist` | Mozilla-maintained, production-ready, WASM support | 92% |
| **OCR** | `tesseract.js` | WebAssembly-based, supports 100+ languages | 85% |
| **Speech Recognition** | `whisper.cpp` (WASM port) | OpenAI Whisper quality, client-side | 78% |
| **Text-to-Speech** | `browser-speech-api` + `WebSpeech` | Native browser support, no external deps | 88% |
| **Image Embeddings** | `transformers.js` (CLIP) | HuggingFace quality, WASM execution | 82% |
| **Audio Embeddings** | `audiovec-wasm` | Efficient audio feature extraction | 75% |
| **Vector Storage** | `@orama/orama` | WASM-based, already in architecture | 95% |
| **Chart Generation** | `chart.js` + `ssr` | Mermaid alternative, better SSR support | 85% |

### 9.2 Confidence Assessment Summary

| Aspect | Confidence | Rationale |
|--------|------------|-----------|
| **PDF Processing** | 92% | Established library with extensive docs |
| **Text Chunking** | 90% | Based on proven RAG patterns |
| **Image Embeddings** | 82% | Newer WASM models, less mature |
| **Audio Transcription** | 78% | Whisper WASM still maturing |
| **Cross-Modal Retrieval** | 80% | Novel integration, proven algorithms |
| **Output Generation** | 85% | Leverages existing LLM integration |
| **Overall Architecture** | 82% | Comprehensive but complex |

---

## 10. Risk Analysis

### 10.1 Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **WASM Module Size** | High | Medium | Lazy loading, caching |
| **Browser Compatibility** | Medium | Low | Feature detection, fallbacks |
| **Memory Usage** | High | Medium | Streaming processing, chunking |
| **OCR Accuracy** | Medium | Medium | Multiple OCR engines, confidence thresholds |
| **Audio Model Size** | High | Medium | Model quantization, tiered models |
| **Cross-Modal Quality** | Medium | Medium | User feedback loop, continuous improvement |

### 10.2 Mitigation Strategies

1. **Progressive Enhancement**: Start with text processing, add modalities incrementally
2. **Resource Monitoring**: Track memory usage, provide user feedback
3. **Offline Fallback**: Store processed results locally for offline access
4. **Quality Indicators**: Show confidence scores for processed content
5. **User Controls**: Allow users to disable heavy processing features

---

## 11. References

### 11.1 Research Sources

1. **Multimodal AI 2025 Technologies** - Kanerika (https://kanerika.com/blogs/multimodal-ai/)
2. **2025 Breakthrough in Multimodal AI** - Medium (https://medium.com/@gafowler/2025s-breakthrough-in-multimodal-ai-merging-text-voice-image-video-c07d370e6a11)
3. **Multimodal AI Overview 2025** - SuperAnnotate (https://www.superannotate.com/blog/multimodal-ai)
4. **Multimodal AI: Text, Audio and Images** - ARTiBA (https://www.artiba.org/blog/multimodal-ai-how-text-audio-and-images-work-together)
5. **Multimodal AI: Breaking Down Barriers** - AYA Data (https://www.ayadata.ai/multimodal-ai-breaking-down-barriers-between-text-image-audio-and-video/)

### 11.2 Technical Documentation

1. **PDF.js Documentation** - Context7 (/mozilla/pdf.js)
2. **Orama Vector Store** - Existing architecture specification
3. **CLIP Model** - OpenAI research papers
4. **Whisper ASR** - OpenAI Whisper documentation

---

## 12. Tracking and Versioning

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-31 | @bmad-bmm-architect | Initial specification |

### Related Artifacts

- **System Architecture:** [`system-architecture-specification-2025-12-31.md`](system-architecture-specification-2025-12-31.md)
- **RAG Pipeline:** [`rag-pipeline-optimization-report-2025-12-31.md`](rag-pipeline-optimization-report-2025-12-31.md)
- **Agent Protocols:** [`agent-interaction-protocols-2025-12-31.md`](agent-interaction-protocols-2025-12-31.md)
- **Pedagogical Framework:** [`pedagogical-framework-design-2025-12-31.md`](pedagogical-framework-design-2025-12-31.md)

---

## 13. Conclusion

This Multimodal Processing Specification provides the architectural foundation for supporting diverse content modalities in the Frontier RAG Knowledge Synthesis Expert System. The architecture leverages client-side processing with WebAssembly for privacy-preserving, offline-capable multimodal understanding while integrating seamlessly with the existing RAG infrastructure and multi-agent coordination system.

Key implementation priorities are:
1. **Text and PDF processing** (Phase 1) - Foundation for all other modalities
2. **Image processing with CLIP** (Phase 2) - Enables visual content understanding
3. **Audio/Video transcription** (Phase 3) - Unlocks multimedia content
4. **Cross-modal synthesis** (Phase 4) - Unified knowledge representation
5. **Performance optimization** (Phase 5) - Production readiness

The 16-week implementation roadmap provides a structured approach to building these capabilities incrementally, with clear milestones and confidence assessments for each phase.

---

*Document generated under BMAD V6 Framework*
*Artifact ID: MMS-2025-12-31-001*
