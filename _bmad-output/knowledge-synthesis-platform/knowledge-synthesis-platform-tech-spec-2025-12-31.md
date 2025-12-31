---
date: 2025-12-31
time: 05:22:00
phase: Technical Specification
team: Team-A
agent_mode: bmad-bmm-architect
---

# Knowledge Synthesis Platform - Technical Specification and Use Cases

## Document Overview

This comprehensive technical specification addresses the end-to-end requirements for implementing a Knowledge Synthesis Platform within the Via-gent project (Project Alpha v2.0). The specification bridges existing brownfield system capabilities with novel knowledge synthesis requirements, providing a unified architectural approach that enables heterogeneous learning material processing, semantic embedding generation, intelligent synthesis operations, and dynamic knowledge mapping through AI-augmented interfaces.

The platform targets the Vietnamese education market with a local-first architecture that prioritizes user privacy, offline capability, and seamless integration with existing IDE workflows. Building upon the certified production-ready foundation of Epics 6-9, this specification defines the technical contracts, data models, processing pipelines, and integration points necessary to deliver breakthrough functionality in knowledge discovery and utilization.

---

## Part 1: Executive Summary and Vision Alignment

### 1.1 System Vision and Strategic Context

The modern educational landscape demands sophisticated knowledge management solutions capable of handling heterogeneous learning materials accumulated by students across diverse formats and sources. Students collect vast quantities of notes, reference materials, and research artifacts, yet existing tools fail to provide coherent synthesis and intelligent organization. This gap between raw material accumulation and knowledge integration represents a significant challenge in educational technology that this platform addresses through advanced AI capabilities in multimodal understanding, embedding generation, and semantic analysis.

The emergence of advanced AI capabilities—particularly in multimodal understanding, embedding generation, and semantic analysis—now enables the construction of systems that can transform fragmented information into interconnected knowledge networks. This transformation addresses both legacy brownfield system limitations and novel synthesis requirements, ensuring seamless integration while delivering breakthrough functionality in knowledge discovery and utilization.

The Knowledge Synthesis Platform evolves Via-gent from a browser-based IDE with integrated AI agent capabilities toward a comprehensive Knowledge Synthesis Station. This evolution aligns with the project's long-term vision of merging Google NotebookLM-style AI synthesis with Notion-like knowledge organization, creating a local-first platform that serves Vietnamese education market needs through source ingestion, vector store capabilities, knowledge canvas visualization, and study artifact generation.

### 1.2 Core Requirements Summary

The platform shall support ingestion of multiple file formats including PDF documents, Microsoft Word files (doc, docx), Markdown files, raster images, handwriting screenshots, subject-specific illustrations, and audio recordings. Each document type requires specialized preprocessing pipelines: PDF documents undergo structural parsing and text extraction; images require OCR processing and visual understanding; audio files demand speech-to-text conversion and content analysis. Preprocessed materials generate raw semantic embeddings stored alongside original assets, enabling subsequent retrieval-augmented generation operations.

Following initial processing, documents display synthesis activation controls. Upon user invocation, the system constructs context-aware API requests to the Gemini provider, incorporating document-type-specific instruction prompts. Synthesis operations generate frontmatter summaries, extracted metadata, semantic tags, and preliminary knowledge linkages. Synthesized resources retain associations with source materials and generated artifacts, supporting downstream knowledge recombination operations.

Synthesized knowledge resources enable interactive canvas integration. When users aggregate three or more synthesized pieces within a unified workspace, the AI agent analyzes potential connections and suggests knowledge linkages across multiple engagement types. The system progressively develops neural mapping representations that auto-group materials by subject, calculate relevancy scores, generate branching content recommendations, and present interconnected knowledge structures through clickable, interactive visualizations.

### 1.3 Technology Stack Validation

The technology stack for this platform has been validated through comprehensive research using MCP tools, with particular attention to local-first capabilities and browser-based processing requirements. The vector store utilizes Orama WASM for local-first vector search operations, providing efficient similarity search without server dependencies. LLM orchestration leverages TanStack AI combined with Gemini 2.0/2.5 for query orchestration, enabling sophisticated AI-powered synthesis operations. Embedding generation employs Transformers.js (CLIP) for text and image embeddings, supporting 384-dimensional vector representations with WebGPU acceleration where available.

Audio processing utilizes Whisper WASM for speech-to-text conversion, enabling client-side transcription of lecture recordings and audio study materials. Document processing relies on PDF.js for client-side PDF parsing, supporting both text extraction and structural analysis. This technology selection ensures all processing occurs locally within the browser, preserving user privacy while delivering responsive synthesis operations.

---

## Part 2: System Architecture Specification

### 2.1 High-Level Architecture Overview

The Knowledge Synthesis Platform follows a layered architecture pattern that separates concerns while enabling tight integration between components. The architecture comprises five primary layers: the Presentation Layer handling UI components and user interactions, the Application Layer coordinating synthesis workflows and knowledge operations, the Processing Layer executing document transformations and AI operations, the Storage Layer managing persistence and retrieval, and the Integration Layer connecting with external AI providers and services.

The Presentation Layer encompasses all React components responsible for user interface rendering, including knowledge canvas components, synthesis activation controls, and conversational AI interfaces. These components leverage the existing component architecture patterns established in the Via-gent project, utilizing Radix UI primitives for accessible interactive elements, Tailwind CSS for styling with the project's 8-bit gaming aesthetic, and TanStack Router for navigation management.

The Application Layer contains the core business logic for knowledge synthesis operations, including the Document Processing Coordinator managing parallel preprocessing pipelines, the Synthesis Engine orchestrating AI-powered synthesis operations, the Knowledge Graph Manager maintaining relationships between synthesized resources, and the Vault Organizer handling hierarchical project structure management. These components interact through a well-defined API surface that supports both synchronous and asynchronous operations.

The Processing Layer implements the computational workloads for document transformation and AI operations. This layer includes the Document Parser supporting multiple file formats, the Embedding Generator producing semantic vector representations, the OCR Processor extracting text from images, the Speech-to-Text Converter transcribing audio content, and the Synthesis Prompt Generator constructing type-specific AI requests. The Processing Layer maximizes utilization of Web Workers for background processing, ensuring UI responsiveness during computationally intensive operations.

### 2.2 Data Flow Architecture

Data flows through the system following well-defined patterns that ensure consistent processing and reliable state management. The primary data flow begins with source material ingestion through the Import Pipeline, proceeds through preprocessing operations in the Processing Pipeline, continues to synthesis operations in the Synthesis Pipeline, and culminates in knowledge graph integration through the Linking Pipeline.

The Import Pipeline accepts source materials through multiple ingestion mechanisms. Users may import files through the file system access API, paste content directly into the interface, or specify URLs for remote content retrieval. Each import operation creates a Source Document record in the IndexedDB storage, capturing the original content, import timestamp, source type, and processing status. The Import Pipeline validates file formats against supported types, rejects unsupported formats with clear error messaging, and initiates preprocessing for valid imports.

The Processing Pipeline transforms raw source materials into processable representations. PDF documents undergo structural parsing that identifies headings, paragraphs, embedded figures, and metadata. Image assets pass through OCR processing to extract handwritten or printed text, then to visual understanding models that identify diagrams, equations, and illustrative content. Audio recordings convert to text transcripts through speech-to-text processing, with supplementary embeddings generated for semantic retrieval. The Processing Pipeline tracks progress through the Processing Status record, enabling resume capability for interrupted operations.

The Synthesis Pipeline transforms processed materials into enriched knowledge artifacts. When users activate synthesis for a document, the Synthesis Pipeline constructs a type-specific prompt incorporating the processed content, relevant context from the vault, and synthesis objectives. The pipeline submits requests to the Gemini provider, receives synthesized outputs, and persists generated artifacts including frontmatter summaries, metadata fields, and semantic tags. The Synthesis Pipeline maintains relationships between synthesized outputs and source documents, enabling traceability and downstream recombination operations.

### 2.3 Component Architecture Specifications

The Document Processor component implements a strategy pattern for handling multiple file formats through a unified interface. The base DocumentProcessor interface defines common operations including canHandle() for format detection, parse() for content extraction, and getMetadata() for document properties. Format-specific implementations handle PDF documents through the PdfDocumentProcessor, images through the ImageDocumentProcessor, audio through the AudioDocumentProcessor, and text documents through the TextDocumentProcessor. The processor factory instantiates appropriate implementations based on detected format, delegating to specialized handlers while maintaining consistent output structure.

The Embedding Generator component produces semantic vector representations for processed content. The EmbeddingGenerator interface defines generate() for text embedding production and generateBatch() for processing multiple documents efficiently. The TransformersJsEmbeddingGenerator implements generation using the CLIP model through Transformers.js, supporting 384-dimensional embeddings with optional normalization. The generator caches embeddings in IndexedDB storage, avoiding redundant computation for unchanged content. Embedding generation occurs asynchronously through Web Workers, preventing UI blocking during computationally intensive operations.

The Synthesis Engine component orchestrates AI-powered synthesis operations through a well-defined workflow. The SynthesisEngine interface defines synthesize() for single-document synthesis, synthesizeBatch() for processing multiple documents, and synthesizeCrossDocument() for generating connections between related materials. The engine constructs type-specific prompts based on document category, incorporating synthesis objectives, vault context, and user preferences. Prompt templates for PDF synthesis emphasize structural summary and key concept extraction; image synthesis prompts focus on visual content description and contextual tagging; audio synthesis prompts prioritize spoken content condensation and action item identification.

---

## Part 3: Document Processing Pipeline Specification

### 3.1 Ingestion and Format Detection

The document processing pipeline begins with format detection and validation. The Ingestion Service receives source materials through multiple mechanisms including file system access, direct paste, and URL specification. Each incoming resource undergoes format detection through MIME type analysis and file signature validation. The system maintains a registry of supported formats mapping MIME types and file extensions to appropriate processor implementations.

Supported file formats include application/pdf for PDF documents, application/vnd.openxmlformats-officedocument.wordprocessingml.document for DOCX files, image/png and image/jpeg for raster images, audio/mpeg, audio/wav, and audio/webm for audio recordings, and text/markdown for Markdown files. The system rejects unsupported formats with informative error messages suggesting conversion approaches for common unsupported types.

The ingestion process creates a SourceDocument record capturing essential metadata including unique identifier, original filename, MIME type, file size, import timestamp, source path, and processing status. The record persists in IndexedDB storage through the SourceDocumentStore, enabling later retrieval and relationship tracking. The Ingestion Service returns a SourceDocument reference to the caller, enabling immediate display of imported materials while background processing proceeds.

### 3.2 PDF Document Processing

PDF documents undergo specialized processing through the PdfDocumentProcessor, which implements structural parsing, text extraction, and metadata retrieval. The processor utilizes PDF.js for client-side PDF parsing, supporting both text-based and image-based PDF documents. Processing proceeds through several phases: document loading, structural analysis, content extraction, and metadata retrieval.

The structural analysis phase examines the PDF document tree to identify document structure including table of contents, section headings, paragraphs, lists, tables, and embedded figures. The analyzer constructs a structural representation that preserves hierarchical relationships, enabling synthesis operations to understand document organization. This structural information supports synthesis objectives by identifying primary concepts, supporting details, and contextual relationships within the document.

Text extraction retrieves textual content from the PDF document through PDF.js text layer rendering. The extractor preserves paragraph boundaries, list item separation, and table cell delineation, producing structured text output suitable for embedding generation and synthesis operations. For image-based PDFs, the extraction process coordinates with the OCR Processor to recognize text within scanned pages.

The metadata retrieval phase extracts document properties including title, author, creation date, modification date, page count, and document language. When available, XMP metadata provides additional information about document provenance and characteristics. The metadata enriches the SourceDocument record, supporting downstream organization and discovery operations.

### 3.3 Image Processing and OCR

Image documents require specialized processing through the ImageDocumentProcessor and OCR Processor, which collaborate to extract textual content and visual understanding from raster images. The processing pipeline supports common image formats including PNG, JPEG, and WebP, with automatic format detection and appropriate preprocessing for optimal OCR results.

The preprocessing phase prepares images for OCR processing through resizing, normalization, and contrast adjustment. Large images are scaled to optimal dimensions for the OCR model while preserving text legibility. Color images are converted to grayscale for processing efficiency, with contrast enhancement applied to improve recognition accuracy for low-quality scans or photographs of handwritten materials.

The OCR phase utilizes Tesseract.js for text recognition within the browser environment. The OCR processor supports multiple languages, with English and Vietnamese language models available for the target market. Recognition proceeds page-by-page for multi-page documents, with progress tracking enabling resume capability for interrupted operations. Confidence scores accompany recognized text, enabling quality assessment and selective re-processing of low-confidence regions.

Following OCR processing, the Visual Understanding phase employs the Transformers.js vision capabilities to analyze non-textual content within images. This phase identifies diagrams, charts, illustrations, and mathematical equations, generating descriptive captions that capture visual content meaning. The visual understanding output complements OCR text extraction, providing comprehensive content representation for synthesis operations.

### 3.4 Audio Processing and Speech-to-Text

Audio documents require transcription through the AudioDocumentProcessor and Speech-to-Text Converter, transforming spoken content into searchable and synthesizable text representations. The processing pipeline supports common audio formats including MP3, WAV, and WebM, with automatic format detection and appropriate preprocessing for optimal transcription results.

The preprocessing phase prepares audio for speech recognition through format conversion, noise reduction, and segmentation. Audio files are decoded through the Web Audio API, with sample rate normalization and channel mixing as necessary. Silence detection identifies natural speech boundaries, segmenting audio into processable chunks that fit within model context limits while preserving utterance coherence.

The transcription phase utilizes Whisper WASM for client-side speech recognition. The model supports multiple languages with automatic language detection, enabling seamless processing of multilingual content common in educational settings. Transcription produces word-level timestamps enabling precise reference to specific content locations within the audio. Confidence scores accompany transcribed text, with low-confidence regions flagged for user review.

The post-processing phase refines transcription output through punctuation restoration, capitalization normalization, and speaker diarization where multiple speakers are detected. The phase identifies lecture segment boundaries, distinguishing between main content, examples, and transitions. This structural information enriches the transcription representation, supporting downstream synthesis operations that benefit from understanding spoken content organization.

---

## Part 4: Knowledge Synthesis Interface Specification

### 4.1 Synthesis Activation Controls

Following document processing, materials display synthesis activation controls within the vault interface. The Synthesis Activation component provides a consistent mechanism for initiating synthesis operations across all processed document types. The component renders as a prominent control element associated with each processed document, displaying synthesis status through visual indicators that communicate current state and available actions.

The synthesis activation interface supports multiple states reflecting document processing status and synthesis completion. The Unprocessed state indicates documents awaiting preprocessing completion, displaying progress indicators during active processing. The Processed state indicates documents ready for synthesis activation, rendering the synthesis button prominently with clear call-to-action styling. The Synthesizing state indicates active synthesis operation in progress, displaying indeterminate progress animation. The Synthesized state indicates completed synthesis, rendering synthesis status indicators and access to generated artifacts.

When users activate synthesis for a document, the system initiates the synthesis workflow through the Synthesis Engine. The activation handler retrieves processed content from storage, constructs type-specific prompts incorporating synthesis objectives and vault context, submits requests to the Gemini provider, and persists generated artifacts upon completion. The handler manages error conditions gracefully, providing clear feedback for retry or cancellation.

### 4.2 Type-Specific Synthesis Prompts

The synthesis system employs type-specific prompt templates optimized for each document category. PDF synthesis prompts emphasize structural summary and key concept extraction, incorporating document organization information to produce coherent summaries that preserve logical flow. The prompt instructs the AI to identify primary arguments, supporting evidence, and conclusions, generating frontmatter content suitable for document introduction.

Image synthesis prompts focus on visual content description and contextual tagging, incorporating OCR text and visual understanding output to produce comprehensive visual descriptions. The prompt instructs the AI to describe visual content, interpret diagrams and illustrations, and extract embedded text meaning. Generated summaries describe the visual content in sufficient detail for understanding without direct visual reference.

Audio synthesis prompts prioritize spoken content condensation and action item identification, incorporating transcription text and structural analysis to produce condensed summaries of lecture or recording content. The prompt instructs the AI to identify main topics, extract key points and explanations, and note action items or follow-up questions. Generated summaries preserve essential spoken content meaning while significantly condensing transcript length.

The prompt template system supports customization through synthesis configuration, enabling users to adjust synthesis objectives, length preferences, and emphasis areas. Configuration options include summary length range (concise, standard, comprehensive), focus areas (concepts, examples, relationships), and output structure (narrative, bulleted, hierarchical). The Synthesis Engine incorporates configuration into prompt construction, producing tailored synthesis outputs aligned with user objectives.

### 4.3 Synthesis Output Structure

Synthesis operations generate structured outputs including frontmatter summaries, metadata fields, semantic tags, and preliminary knowledge linkages. The output structure follows a consistent schema that supports storage, retrieval, and downstream knowledge recombination operations.

Frontmatter summaries provide comprehensive document descriptions ranging from 150 to 300 words depending on source material length and synthesis configuration. Summaries follow academic conventions with clear topic statements, conceptual explanations, and relationship indicators. The summary structure enables quick document comprehension without full content review, supporting efficient knowledge navigation within large vault collections.

Metadata fields capture structured document properties including subject classification, date ranges, source attribution, and content type. Subject classification employs a controlled vocabulary aligned with educational disciplines, enabling filtering and organization by academic area. Date ranges capture document temporal scope, distinguishing historical references from current content. Source attribution documents provenance, linking synthesized outputs to original source materials.

Semantic tags capture extracted concepts, entities, and relationships through named entity recognition and topic modeling. Tags employ a hierarchical taxonomy enabling both broad category assignment and specific concept identification. The tag system supports user-provided tags alongside AI-extracted tags, enabling collaborative knowledge organization. Tag relationships document semantic connections between concepts, supporting downstream knowledge graph construction.

---

## Part 5: Dynamic Knowledge Mapping Specification

### 5.1 Knowledge Linkage Discovery

The knowledge mapping system analyzes synthesized resources to identify potential connections and suggest knowledge linkages. The Linkage Discovery component compares semantic vectors across documents, calculates relevance scores, and generates connection recommendations categorized by engagement type. The system operates both automatically in response to document synthesis completion and on-demand when users request linkage analysis.

The analysis process extracts semantic vectors from each synthesized document's frontmatter, metadata, and tag collections. Comparative embedding analysis identifies thematic overlaps through vector similarity calculations, conceptual connections through shared entity extraction, and knowledge bridges through transitivity analysis across the document collection. The system generates linkage recommendations with confidence scores reflecting the strength of identified relationships.

Linkage categories include Conceptual links highlighting shared mathematical principles, thematic vocabulary, or historical contexts connecting resources. Sequential links identify prerequisite relationships or logical progression paths through material sequences, indicating documents that should be consumed in particular orders. Contrastive links surface opposing viewpoints, alternative methodologies, or complementary perspectives present across resources, enabling comparative analysis and critical thinking.

The linkage recommendation interface renders identified connections within the interactive canvas, displaying links as connectable nodes with hover states revealing connection rationale, shared concept names, and confidence scores. Users may accept, modify, or dismiss proposed linkages, with accepted connections persisting in the knowledge graph structure. The interface supports manual link creation for connections the automated system may miss, enabling user expertise to enhance automated analysis.

### 5.2 Knowledge Graph Architecture

The knowledge graph provides the structural foundation for representing relationships between synthesized resources. The graph architecture employs a property graph model with nodes representing resources, concepts, and entities, and edges representing relationships with typed properties and confidence scores.

Resource nodes represent synthesized documents, capturing metadata, summaries, and references to source materials. Each resource node contains embeddings supporting similarity queries and relationship discovery. Resource nodes link to concept nodes through tagging relationships, enabling concept-centric navigation and aggregation.

Concept nodes represent extracted semantic concepts, entities, and topics appearing across synthesized materials. Concept nodes maintain usage statistics tracking frequency of appearance and recency of reference. Related concepts connect through semantic similarity edges, enabling concept hierarchy traversal and associative discovery.

Edge types include CONTAINS for document-to-section relationships, DISCUSSES for document-to-concept relationships, RELATED_TO for general semantic connections, SEQUENTIAL_FOR for prerequisite relationships, and CONTRASTS_WITH for opposing perspective relationships. Each edge carries a confidence score reflecting relationship strength and an evidence field documenting the basis for relationship identification.

The graph persistence layer stores the knowledge graph within IndexedDB through the KnowledgeGraphStore, supporting efficient queries for traversal, filtering, and similarity operations. Graph operations leverage indexing strategies optimized for common query patterns including neighbor lookup, path finding, and similarity search.

### 5.3 Interactive Visualization

The interactive canvas renders knowledge graph structures through visual representations enabling exploration and manipulation. The Canvas component implements the React Flow pattern for node-based visualization, supporting pan, zoom, node selection, and edge creation operations. The visualization layer renders nodes with consistent styling reflecting node type and status, and edges with styling reflecting relationship type and confidence.

Node rendering displays synthesized document nodes as document cards with title, summary preview, and status indicators. Concept nodes render as smaller circular elements with concept labels. Selected nodes display expanded detail panels with comprehensive information and available actions. The visualization supports node clustering through the AutoLayout component, grouping related materials based on topic similarity or manual assignment.

Edge rendering displays connections between nodes as lines with visual treatments indicating relationship type. Conceptual links render as solid lines; sequential links render as directed arrows; contrastive links render as dashed lines. Edge thickness and opacity reflect confidence scores, with stronger connections displaying more prominently. Hover interactions reveal relationship details including shared concepts, evidence, and suggested exploration paths.

The canvas supports interactive manipulation including node dragging for manual arrangement, edge creation through drag-and-drop operations, and group selection for batch operations. The interface integrates with the knowledge graph updates, reflecting accepted or rejected linkage recommendations and manual modifications. Export functionality enables canvas state persistence and sharing, supporting collaboration and study review workflows.

---

## Part 6: Conversational AI Interface Specification

### 6.1 Intent Classification and Routing

The conversational AI interface processes user queries through intent classification to determine appropriate processing pathways. The IntentClassifier component analyzes input text to identify query type, extract entities, and determine required capabilities. Classification results guide routing to optimal processing pathways including retrieval-augmented generation, cross-document synthesis, knowledge graph traversal, or synthesis operation invocation.

Query types include Information Requests seeking specific knowledge from the vault, Synthesis Requests asking for new output generation from selected sources, Exploration Requests expressing interest in discovering related materials, and Action Requests specifying synthesis or organization operations. The classifier employs a combination of pattern matching and semantic analysis to achieve accurate type identification.

Entity extraction identifies references to specific documents, concepts, or topics within user queries. The extractor links extracted entities to corresponding vault items and knowledge graph nodes, enabling focused processing. Ambiguous references trigger clarification interactions, requesting user disambiguation while maintaining conversation context.

Routing logic determines the processing pathway based on classification results. Information requests route to RAG processing, retrieving relevant content through similarity search and generating responses through the AI provider. Synthesis requests route to cross-document synthesis, constructing type-specific prompts incorporating selected sources. Exploration requests route to knowledge graph traversal, identifying related materials and suggesting navigation paths. Action requests route to operation handlers, executing requested synthesis or organization tasks.

### 6.2 Context Maintenance and State

The conversational interface maintains context across interaction sequences, tracking established connections and referenced materials. The ConversationContext component manages state including conversation history, referenced items, and accumulated findings. Subsequent queries may reference prior context without explicit re-specification, enabling natural exploratory dialogue that progressively builds understanding.

Conversation history persists through the ConversationStore, enabling session resumption and reference across browser sessions. Each conversation entry captures user query, system response, referenced items, and discovered connections. The history supports review and reference operations, enabling users to revisit prior conversation points.

Referenced items tracking maintains a set of vault items mentioned or retrieved during the conversation. This tracking enables operations across conversation context, such as "summarize these documents" referencing items mentioned in prior exchanges. The tracking mechanism expires stale references after configurable inactivity periods, preventing accumulation of irrelevant context.

Accumulated findings capture discoveries across conversation turns, enabling progressive knowledge building. When the conversation reveals connections or generates syntheses, findings record these for later reference and synthesis. The findings mechanism supports the conversational pattern of exploration and discovery, where each interaction builds upon prior insights.

### 6.3 Response Generation and Integration

Response generation produces contextually appropriate answers incorporating relevant vault materials. The ResponseGenerator component orchestrates retrieval, synthesis, and formatting operations to generate responses aligned with query intent. Generation follows a pipeline pattern: retrieve relevant content, construct prompt with retrieved context, submit to AI provider, format response with citations.

Retrieval operations identify relevant content through hybrid search combining semantic similarity with keyword matching. The HybridRetriever component queries the Orama vector store for similar documents while applying keyword filters for precision. Retrieved results rank by relevance score, with top results selected for inclusion in the generation context.

Prompt construction incorporates retrieved content, conversation context, and response objectives into a coherent prompt for the AI provider. The PromptBuilder component selects appropriate template based on query type, inserts retrieved content and context, and applies formatting for consistent output. Templates define response structure, citation format, and tone appropriate for educational contexts.

Response formatting integrates generated content with citations linking to source documents and synthesized artifacts. The ResponseFormatter renders responses through the chat interface, displaying text content with inline citations linking to source materials. Interactive elements enable users to access referenced documents directly from the response context, supporting verification and deeper exploration.

---

## Part 7: Project Vault Organization Specification

### 7.1 Hierarchical Vault Structure

The project vault provides hierarchical organization for aggregating learning materials within named collections. The VaultStore manages vault structure persistence, supporting creation, modification, and deletion of vault hierarchies. Each vault maintains metadata including name, description, creation date, and access permissions, enabling organization and discovery of accumulated materials.

Vault structure supports nested folders enabling hierarchical organization by subject, time period, project phase, or any organizational schema the user prefers. The folder hierarchy enables both structured navigation through explicit paths and flexible organization through multiple classification schemes. Materials may appear in multiple folders through reference links, supporting multiple organizational perspectives without content duplication.

Vault views provide different perspectives on vault contents aligned with organizational and access patterns. The Grid View displays materials as cards in responsive layouts supporting visual scanning and comparison. The List View presents materials in compact rows with key metadata columns. The Canvas View renders the knowledge graph visualization with vault materials as nodes. The Timeline View organizes materials chronologically, revealing knowledge accumulation patterns and study session clusters.

Access controls manage vault visibility and modification permissions. Private vaults remain visible only to the creating user. Shared vaults enable collaboration through explicit invitation mechanisms. Public vaults expose contents for broader discovery while maintaining attribution requirements. The access control system integrates with the authentication framework when implemented, providing user-specific permission enforcement.

### 7.2 Auto-Organization Capabilities

The system continuously identifies cross-material connections and proposes novel knowledge formations through auto-organization capabilities. The AutoOrganizer component analyzes vault contents on schedule and on demand, generating organizational recommendations aligned with multiple taxonomies.

Subject domain classification groups materials by academic discipline based on extracted metadata, tags, and content analysis. The classifier employs trained models recognizing patterns characteristic of different subjects, with custom vocabulary support for domain-specific terminology. Classification accuracy improves through user feedback, with corrections training the classification model.

Temporal analysis groups materials by academic period, revealing knowledge accumulation patterns and identifying study session clusters. The analyzer examines creation dates, modification dates, and content temporal references to construct period groupings. Temporal visualization through the Timeline View makes accumulation patterns visible for study planning review.

Relevancy scoring calculates inter-document relationship strengths, identifying strongly connected knowledge clusters and peripheral materials with limited established connections. The scoring algorithm considers citation patterns, content overlap, temporal proximity, and user interaction history. Strongly connected clusters receive priority placement in organizational views, while peripheral materials receive highlighting to encourage synthesis activation or relationship establishment.

### 7.3 Organizational Perspective Management

The vault supports multiple organizational perspectives enabling users to switch between views without data duplication or reconstruction overhead. The PerspectiveManager maintains perspective definitions and coordinates view rendering based on selected perspective.

Available perspectives include the Hierarchical Perspective presenting explicit folder structure, the Conceptual Perspective grouping by subject classification, the Temporal Perspective organizing by time period, the Relevancy Perspective presenting by connection strength, and the Custom Perspective enabling user-defined groupings. Each perspective renders vault contents through appropriate visualization and navigation mechanisms.

Perspective switching transitions smoothly between views while maintaining user context. The transition preserves current selection and scroll position where applicable, enabling users to explore materials through different organizational lenses without losing their place. Perspective preferences persist through local storage, remembering user selections across sessions.

Recommendation generation presents alternative organizational structures aligned with different access patterns. The Recommender analyzes vault composition and usage patterns, proposing organizational improvements including new folder structures, conceptual groupings, and relationship establishment. Each recommendation includes projected navigation efficiency metrics and anticipated user experience improvements.

---

## Part 8: Implementation Guidelines

### 8.1 Development Environment Setup

Development requires specific configuration for WebContainer support and cross-origin isolation headers. The Vite configuration must include COOP and COEP headers for SharedArrayBuffer support essential to WebContainer operation. The headers configuration appears in the Vite configuration file with Cross-Origin-Opener-Policy set to same-origin and Cross-Origin-Embedder-Policy set to require-corp. The crossOriginIsolationPlugin must appear first in the plugins array to ensure proper header application.

The development server launches through `pnpm dev`, starting on port 3000 with required headers. Developers must grant file system permissions when prompted for FSA API access during local development. The development environment supports hot module replacement for rapid iteration, with specific attention to WebWorker module loading configuration.

Testing requires vitest configuration with appropriate environment selection. React component tests use the jsdom environment; library and utility tests use the node environment. Mock implementations for File System Access API enable testing without browser environment dependencies. The testing setup includes mock implementations for IndexedDB operations through fake-indexeddb, enabling comprehensive component testing.

Internationalization configuration requires i18next setup with language detection and translation file management. The i18next-scanner configuration extracts translation keys from source files, outputting to language-specific JSON files. Developers must run `pnpm i18n:extract` after adding new translation keys to update language files. Vietnamese language support requires translation file population following the established structure.

### 8.2 Component Development Patterns

Components follow the established patterns in the Via-gent codebase, utilizing TypeScript interfaces for props, functional components with hooks for state management, and consistent import ordering conventions. The import ordering convention prioritizes React imports, then third-party library imports, then internal module imports with the @/ alias, and finally relative imports.

The component directory structure organizes by feature rather than type, with directories for knowledge, canvas, rag, study, and other feature areas. Each component directory contains barrel exports through index.ts files enabling convenient import aggregation. Components within feature directories may include subdirectories for related utilities, types, and tests.

State management employs Zustand stores for reactive state with clear separation between persisted and ephemeral state. Persisted state through IndexedDB supports offline capability and session resumption. Ephemeral state remains in-memory for performance. Store implementations follow the established pattern with TypeScript typing, selector functions, and action methods.

Error handling wraps critical components with ErrorBoundary implementations that catch and display errors gracefully. The ErrorBoundary component provides consistent error state rendering with recovery options. Error utilities in error-handling.ts provide classification and formatting for error messages. Error tracking through Sentry integration enables production error monitoring.

### 8.3 Testing Requirements

All new features require accompanying tests following the established testing patterns. Component tests use React Testing Library with jest-dom matchers, testing behavior through user interaction simulation. Library tests verify functional correctness through unit tests covering edge cases and error conditions. Integration tests verify component interactions and data flow.

Test files reside in __tests__ directories adjacent to source files, following the naming pattern *.test.ts or *.test.tsx. Tests co-located with source code maintain test coverage as code evolves and provide context for testing decisions. Test utilities and mocks reside within the __tests__ directory, keeping test helpers versioned alongside tested code.

Mock implementations isolate components from external dependencies during testing. File System Access API mocks enable component testing without browser environment. IndexedDB mocks through fake-indexeddb enable store testing without browser storage. AI provider mocks enable synthesis testing without API calls. WebWorker mocks enable embedding generation testing without worker environment.

Coverage tracking ensures adequate test quality with minimum thresholds for line, branch, and function coverage. Coverage reports generate through `pnpm test --coverage`, with CI enforcement of coverage thresholds. Coverage exclusions require documentation explaining why certain code paths cannot or should not be tested.

---

## Part 9: Agent Instructions

### 9.1 Document Processor Agent Instructions

The Document Processor agent handles transformation of raw source materials into processed representations suitable for synthesis operations. The agent operates through the DocumentProcessor interface, implementing format-specific handlers and coordinating preprocessing workflows.

When processing PDF documents, the agent shall utilize PdfDocumentProcessor for structural analysis and text extraction. The agent shall extract document structure including headings, paragraphs, and embedded figures. The agent shall preserve structural relationships in the output representation. The agent shall retrieve metadata including title, author, and creation date where available.

When processing image documents, the agent shall first apply preprocessing for optimal OCR results. The agent shall resize large images while preserving text legibility. The agent shall apply contrast enhancement for low-quality source materials. The agent shall execute OCR through Tesseract.js with appropriate language model selection. The agent shall capture confidence scores for recognized text.

When processing audio documents, the agent shall prepare audio through format normalization and silence detection. The agent shall segment audio at natural speech boundaries. The agent shall execute transcription through Whisper WASM with automatic language detection. The agent shall capture word-level timestamps for precise reference. The agent shall post-process transcripts through punctuation restoration and speaker identification.

The agent shall report progress through the Processing Status record, enabling resume for interrupted operations. The agent shall handle errors gracefully with informative messaging and recovery suggestions. The agent shall persist intermediate results to avoid redundant processing on resume.

### 9.2 Synthesis Engine Agent Instructions

The Synthesis Engine agent orchestrates AI-powered synthesis operations, constructing prompts, submitting requests, and persisting generated artifacts. The agent operates through the SynthesisEngine interface, managing synthesis workflows for individual documents and cross-document operations.

When synthesizing individual documents, the agent shall retrieve processed content from storage. The agent shall construct type-specific prompts incorporating document content, synthesis configuration, and vault context. The agent shall submit requests to the Gemini provider with appropriate model selection and parameter tuning. The agent shall parse responses to extract frontmatter summaries, metadata fields, and semantic tags. The agent shall persist generated artifacts with source document associations.

When synthesizing cross-document content, the agent shall identify relevant documents through similarity search or explicit selection. The agent shall construct comparison or synthesis prompts incorporating multiple source documents. The agent shall generate outputs that transcend individual document boundaries, illuminating relationships and emergent patterns. The agent shall persist generated syntheses with multi-source associations.

The agent shall implement retry logic for transient failures with exponential backoff. The agent shall handle rate limiting through queue management and scheduling. The agent shall provide progress indication for long-running synthesis operations. The agent shall implement timeout handling to prevent indefinite blocking.

### 9.3 Knowledge Graph Agent Instructions

The Knowledge Graph agent maintains relationship structures between synthesized resources, executing discovery, persistence, and query operations. The agent operates through the KnowledgeGraphManager interface, coordinating linkage analysis and graph maintenance.

When discovering linkages, the agent shall extract semantic vectors from synthesized documents. The agent shall calculate similarity scores across document pairs. The agent shall identify conceptual connections through shared entities and topics. The agent shall generate recommendations categorized by relationship type. The agent shall calculate confidence scores reflecting relationship strength.

When persisting relationships, the agent shall create graph nodes for new resources. The agent shall create graph edges for confirmed relationships. The agent shall update node properties reflecting accumulated metadata. The agent shall maintain index structures for query optimization. The agent shall enforce referential integrity through cascade operations.

When querying the graph, the agent shall execute neighbor lookup for direct connections. The agent shall execute path finding for multi-hop relationships. The agent shall execute similarity search for related concepts. The agent shall filter results by relationship type and confidence thresholds. The agent shall return results with supporting evidence and confidence scores.

---

## Part 10: Spec-Driven Use Cases

### 10.1 Use Case 1: Initial Vault Population and Baseline Synthesis

**Preconditions**

The user has created a project vault named "Fall Semester 2024" through the vault creation interface. The vault exists in the user's vault collection with appropriate metadata including name, description, and creation timestamp. The user possesses unorganized learning materials accumulated over the past month, spanning multiple subjects including Mathematics, Physics, and Literature. Materials exist in various formats: scanned PDF lecture notes, photographed handwritten study sheets, typed Markdown assignment drafts, and extracted illustrations from textbook chapters. The vault contains raw, unprocessed assets with no synthesis operations performed. Source document records exist in IndexedDB storage with processing status indicating pending preprocessing.

**Trigger**

The user selects the "Fall Semester 2024" vault folder from the vault navigation interface. The user invokes the batch processing function through the interface control, selecting the option to process all unprocessed materials within the vault. The system displays a confirmation dialog showing the count of materials to process and estimated completion time. The user confirms the batch processing operation.

**Main Flow**

The system initiates parallel processing pipelines for all contained assets, distributing work across available compute resources. The Document Processing Coordinator creates processing tasks for each unprocessed source document, queueing tasks for execution through the Processing Pool. The Processing Pool manages concurrent execution, respecting resource constraints while maximizing throughput.

PDF documents proceed through structural parsing, identifying headings, paragraphs, and embedded figures while extracting text content. The PdfDocumentProcessor analyzes document structure, constructing a hierarchical representation. Text extraction retrieves content from text-based PDFs or invokes OCR for scanned documents. Metadata extraction captures document properties including title, author, and creation date. Processed PDF content persists to IndexedDB through the ProcessedContentStore.

Image assets undergo preprocessing for optimal OCR results. Large images resize to manageable dimensions while preserving legibility. Contrast enhancement improves recognition accuracy for photographs of handwritten materials. OCR processing through Tesseract.js extracts handwritten or printed text. Visual understanding through Transformers.js identifies diagrams, equations, and illustrative content. Processed image content persists with extracted text and visual descriptions.

Audio recordings convert to text transcripts through Whisper WASM transcription. Audio preprocessing normalizes format and identifies speech segments. Transcription generates word-level timestamps with confidence scores. Post-processing restores punctuation and identifies speaker changes. Processed audio content persists with transcript text and timing information.

Upon completion of initial preprocessing, the system presents each asset with an associated synthesis activation control. The Synthesis Activation component renders for each processed document with appropriate state indication. The user systematically activates synthesis for individual materials, triggering targeted API requests to the Gemini provider.

Each synthesis request constructs type-specific instruction sets incorporating processed content and synthesis configuration. PDF synthesis prompts emphasize structural summary and key concept extraction, incorporating document organization information. Image synthesis prompts focus on visual content description and contextual tagging, incorporating OCR text and visual descriptions. Audio synthesis prompts prioritize spoken content condensation and action item identification, incorporating transcript and structural analysis.

Synthesized outputs generate frontmatter containing document summaries ranging 150-300 words depending on source length and configuration. Structured metadata fields capture subject classification, date ranges, source attribution, and content type. Semantic tag sets extract concepts, entities, and relationships through named entity recognition and topic modeling. These artifacts persist in the SynthesizedArtifactStore with associations to source documents and embeddings for downstream retrieval operations.

**Postconditions**

The vault contains fully processed assets with associated embeddings and synthesis metadata. Each document displays synthesis status indicators confirming completion. The system has established preliminary subject groupings based on extracted metadata, visible through vault organization views. Users may navigate processed materials, activate synthesis for individual documents, and explore synthesized content through the vault interface.

**System State Changes**

The SourceDocument records update processing status from PENDING to PROCESSED. The ProcessedContent records create for each source document with extracted content. The Embedding records create for processed content with vector representations. The SynthesizedArtifact records create for each synthesized document with generated metadata. The VaultItem records update to reflect processing and synthesis status. The KnowledgeGraph nodes create for synthesized documents with initial empty relationships.

### 10.2 Use Case 2: Interactive Canvas Knowledge Linkage Discovery

**Preconditions**

A project vault contains multiple synthesized knowledge resources resulting from prior processing operations. SynthesizedArtifact records exist for all vault materials with frontmatter summaries, metadata, and semantic tags. The KnowledgeGraph contains document nodes representing synthesized resources. The user has opened the interactive canvas workspace through the canvas view option in the vault interface. The canvas displays the knowledge graph visualization with currently visible nodes. At least three synthesized documents representing related but distinct materials occupy the workspace—for example, a lecture note summary on differential equations, a handwritten problem solution illustration, and a literature passage analysis document. The canvas state includes these documents as selected or visible nodes.

**Trigger**

User activates the knowledge linkage discovery function through canvas toolbar controls while multiple synthesized resources occupy the workspace. The activation control appears as a button labeled "Discover Connections" or equivalent iconographic representation. The system displays a configuration dialog allowing scope selection for linkage analysis (selected nodes only, visible nodes, entire vault). The user confirms the discovery operation with default scope selection.

**Main Flow**

The system analyzes the aggregate set of workspace resources, extracting semantic vectors from each synthesized document's frontmatter, metadata, and tag collections. The Linkage Discovery component queries the EmbeddingStore for document vectors, constructing a similarity matrix through pairwise comparison. The matrix calculation employs cosine similarity for vector comparison, generating scores between zero and one for each document pair.

Comparative embedding analysis identifies thematic overlaps through high-similarity pairs and shared concept extraction through tag intersection. Conceptual connections emerge from shared vocabulary, terminology, and topic intersection across document collections. Knowledge bridges identify transitive relationships where documents connect through intermediate concepts not directly shared.

The AI agent generates linkage recommendations categorized by engagement type. Conceptual links highlight shared mathematical principles, thematic vocabulary, or historical contexts connecting resources. The recommendation generator analyzes content for conceptual alignment, identifying shared concepts and theoretical frameworks. Sequential links identify prerequisite relationships or logical progression paths through material sequences. The recommendation generator examines temporal metadata and content progression for ordering indicators. Contrastive links surface opposing viewpoints, alternative methodologies, or complementary perspectives present across resources. The recommendation generator analyzes content for contradiction, comparison, and alternative perspectives.

For each identified connection, the system renders interactive visualization elements within the canvas. Links display as edges between document nodes with styling reflecting relationship type. Hover states reveal connection rationale, shared concept names, and confidence scores. The interaction handler manages hover events, updating the detail panel with connection information.

Users may accept, modify, or dismiss proposed linkages through the canvas interface. Accepting a link persists the relationship in the KnowledgeGraph with confirmed status. Modifying a link allows adjustment of relationship type or confidence score. Dismissing a link removes the recommendation without persistence. Accepted connections persist in the knowledge graph structure with relationship type, confidence score, and evidence documentation.

Upon accepting linkages forming interconnected clusters of three or more resources, the system proposes knowledge synthesis opportunities. The Synthesis Opportunity Detector identifies clusters meeting size and connectivity thresholds. The detector generates proposals offering to generate integrative summaries transcending individual document boundaries. Each proposal includes description of the proposed synthesis, list of included documents, and estimated complexity. Users may accept proposals to initiate cross-document synthesis or dismiss to decline.

**Postconditions**

The canvas displays a knowledge linkage network with verified connections between related resources. The visualization shows edges between document nodes with appropriate styling for relationship types. The underlying knowledge graph has been updated with new relationship nodes and connection metadata. Accepted connections appear in the KnowledgeGraph with confirmed status. Proposed synthesis opportunities remain available for user consideration through the proposal interface.

**System State Changes**

The KnowledgeGraphEdge records create for each accepted connection with relationship type and confidence score. The LinkageRecommendation records update status from PENDING to ACCEPTED, MODIFIED, or DISMISSED. The SynthesisOpportunity records create for clusters meeting synthesis thresholds. The CanvasState persists with updated node positions and visible edges. User interaction events log for analytics and personalization.

### 10.3 Use Case 3: Conversational Knowledge Exploration Session

**Preconditions**

A populated project vault contains synthesized documents organized by subject, with established knowledge linkages and metadata structures. The vault contains sufficient synthesized content for meaningful exploration—typically more than ten synthesized documents across multiple subjects. The KnowledgeGraph contains relationship edges connecting related documents. The conversational AI agent maintains access to RAG toolchains, synthesis capabilities, and knowledge graph query interfaces. The agent configuration includes appropriate provider credentials for Gemini API access. The user has initiated a chat session through the agent interface without specific task constraints. The ConversationContext initializes with empty history and no referenced items.

**Trigger**

User poses an open-ended query such as "Help me understand how the concepts from my calculus notes connect to the physics materials I added last week" or requests a specific synthesis operation like "Create a comparison between the historical perspectives in these three literature documents." The query enters the conversation through the chat input interface. The system invokes intent classification to determine query type and routing.

**Main Flow**

The conversational agent parses user input through intent classification models, identifying whether the query requires retrieval-augmented generation, cross-document synthesis, knowledge graph traversal, or synthesis operation invocation. The IntentClassifier analyzes query text for type indicators, entity references, and action specifications. Classification results guide routing decisions.

For complex queries involving multiple information types, the agent orchestrates sequential toolchain operations. The Orchestrator manages operation sequence, passing context between steps and accumulating results. Each operation updates the conversation context with discovered information and referenced items.

When processing conceptual connection queries, the agent executes knowledge graph queries identifying resources spanning the specified subject domains. The KnowledgeGraphQuerier traverses the graph from concept nodes matching query entities, collecting related documents through relationship edges. The Querier filters results by subject classification matching query domains.

The agent retrieves relevant synthesized content through embedding similarity search. The HybridRetriever queries the Orama vector store for documents similar to the query embedding, combining semantic similarity with keyword matching. Results rank by relevance score with top results selected for response inclusion.

The agent synthesizes responses that explicitly map connections between concepts across source materials. The ResponseGenerator constructs prompts incorporating retrieved content, conversation context, and query objectives. The generator submits requests to the Gemini provider, receives generated responses, and formats output with citations.

Responses incorporate citations linking to specific source documents and synthesized artifacts. Citation formatting follows the established pattern with inline reference markers linking to source cards. Interactive elements enable users to access referenced documents directly from the response context, supporting verification and deeper exploration.

When processing synthesis requests, the agent constructs targeted Gemini API calls incorporating the specified source documents. The SynthesisRequestBuilder identifies source documents from explicit selection or entity reference resolution. The builder constructs type-specific prompts aligned with the requested synthesis type, incorporating instruction templates for comparison, summary, or extraction operations.

Generated outputs integrate with the vault structure as new synthesized artifacts. The ArtifactPersistence layer creates SynthesizedArtifact records for generated content, linking to source materials and making new artifacts discoverable through standard knowledge operations. The persistence layer updates the KnowledgeGraph with new document nodes for synthesized outputs.

Throughout the interaction, the agent maintains conversation context, tracking established connections and referenced materials. The ContextManager updates conversation state after each turn, recording user queries, system responses, and discovered relationships. Subsequent queries may reference prior context without explicit re-specification, enabling natural exploratory dialogue.

**Postconditions**

The user has received a comprehensive response addressing their query, incorporating relevant materials from across the vault. Response citations enable navigation to source documents for verification and deeper exploration. New synthesized artifacts have been created and integrated into the knowledge structure when synthesis operations were requested. Conversation history persists, maintaining context for subsequent interactions. The conversation context tracks referenced items for cross-turn reference.

**System State Changes**

The ConversationRecord creates or updates with new exchange entries. The ReferencedItem records create for each vault item mentioned in the conversation. The SynthesizedArtifact records create for generated synthesis outputs. The KnowledgeGraphNode records create for new synthesized documents. The CitationRecord records create for each source referenced in responses. The ConversationContext updates with accumulated findings and referenced items.

### 10.4 Use Case 4: Dynamic Knowledge Matrix Evolution and Auto-Organization

**Preconditions**

An established project vault has accumulated synthesized materials over multiple usage sessions. The vault contains more than twenty synthesized documents spanning multiple subjects and time periods. The KnowledgeGraph contains documented relationships, subject classifications, and temporal metadata. The user has performed synthesis operations on at least half of vault materials. The user has not performed manual reorganization operations beyond initial vault creation, relying on system auto-organization capabilities. The AutoOrganization configuration enables automatic reorganization with user confirmation.

**Trigger**

User invokes the knowledge matrix reorganization function through the vault organization interface. The invocation control appears as "Reorganize" or equivalent in the organization panel. Alternatively, the system automatically triggers reorganization upon detecting threshold changes in vault composition, such as accumulation of new materials in previously sparse subject areas. The system displays a reorganization preview dialog showing proposed changes.

**Main Flow**

The system executes knowledge matrix analysis routines, evaluating the complete synthesized corpus against multiple organizational taxonomies. The MatrixAnalyzer iterates through all SynthesizedArtifact records, extracting metadata, tags, and relationship information. The analyzer constructs an organizational matrix capturing document positions across multiple classification dimensions.

Subject domain classifications undergo refinement as new materials introduce cross-disciplinary concepts requiring either new category creation or existing category expansion. The SubjectClassifier analyzes document content and tags against the subject taxonomy. Classification updates occur when documents lack subject assignment or when new documents suggest subject refinement. The classifier proposes new subject categories when documents don't match existing categories with sufficient confidence.

Temporal analysis groups materials by academic period, revealing knowledge accumulation patterns and identifying study session clusters. The TemporalAnalyzer examines document creation dates, synthesis timestamps, and content temporal references. The analyzer constructs period groupings based on temporal clustering algorithms, identifying natural breaks in the knowledge accumulation timeline.

Relevancy scoring algorithms calculate inter-document relationship strengths, identifying highly connected knowledge clusters and peripheral materials with limited established connections. The RelevancyScorer analyzes KnowledgeGraph edges to calculate cluster density and individual document connectivity. Strongly connected clusters receive high relevancy scores; peripheral materials receive lower scores indicating limited established connections.

The system generates proposed reorganization recommendations presenting alternative organizational structures aligned with different access patterns. The Recommender constructs recommendation sets for each organizational perspective. Chronological organization recommendations emphasize knowledge evolution through timeline groupings. Conceptual organization recommendations emphasize topic clusters through subject groupings. Hybrid approaches balance multiple access modalities through combined structures.

Each recommendation includes projected navigation efficiency metrics and anticipated user experience improvements. Efficiency metrics estimate time savings for common access patterns based on organizational structure. User experience indicators reflect recommendation alignment with established interaction patterns and user preferences.

Upon user selection of a preferred organizational structure, the system transforms vault views and navigation interfaces to reflect the chosen organization. The PerspectiveTransformer updates view configurations, reordering navigation elements and restructuring folder hierarchies. The transformation preserves underlying knowledge graph relationships while adjusting organizational presentation.

The transformation supports simultaneous multiple organizational perspectives, enabling users to switch between views without data duplication or reconstruction overhead. The PerspectiveManager maintains active perspective state, coordinating view rendering based on selected perspective. Users may switch perspectives through the interface control, with smooth transitions maintaining context.

**Postconditions**

The vault organizational structure has been updated to reflect the selected organizational perspective. Knowledge cluster visualizations accurately represent current relationship strengths and subject classifications. Navigation interfaces provide optimized access pathways aligned with the chosen organizational model. Multiple perspectives remain available for switching. The organizational change logs for audit and potential rollback.

**System State Changes**

The VaultPerspective records update active perspective configuration. The SubjectCategory records update with refined classifications. The TemporalPeriod records update with refined period groupings. The DocumentCluster records update with calculated relevance scores. The OrganizationLog records capture change history for audit. The ViewConfiguration records update for navigation and visualization.

---

## Part 11: Technical Specifications Reference

### 11.1 Data Models

The SourceDocument model captures imported source materials with the following structure: id (string, UUID), originalFilename (string), mimeType (string), fileSize (number, bytes), importTimestamp (ISO-8601), sourcePath (string, optional), processingStatus (enum: PENDING, PROCESSING, PROCESSED, ERROR), errorMessage (string, optional), and metadata (object).

The ProcessedContent model captures extracted content from source documents: id (string, UUID), sourceDocumentId (string, FK), contentType (enum: TEXT, STRUCTURED_TEXT, TRANSCRIPTION, OCR_TEXT), rawContent (string), structuredContent (object), extractedMetadata (object), processingTimestamp (ISO-8601), and embeddingId (string, optional, FK).

The SynthesizedArtifact model captures AI-generated synthesis outputs: id (string, UUID), sourceDocumentId (string, FK), vaultId (string, FK), summary (string, 150-300 words), metadata (object with subject, dateRange, sourceAttribution, contentType), tags (array of strings), frontmatter (object), synthesisTimestamp (ISO-8601), and configuration (object).

The KnowledgeGraphNode model represents synthesized documents in the knowledge graph: id (string, UUID), artifactId (string, FK), nodeType (enum: DOCUMENT, CONCEPT, ENTITY), properties (object), embedding (array of numbers), createdTimestamp (ISO-8601), and updatedTimestamp (ISO-8601).

The KnowledgeGraphEdge model represents relationships between nodes: id (string, UUID), sourceNodeId (string, FK), targetNodeId (string, FK), relationshipType (enum: CONTAINS, DISCUSSES, RELATED_TO, SEQUENTIAL_FOR, CONTRASTS_WITH), confidenceScore (number, 0-1), evidence (object), createdTimestamp (ISO-8601), and updatedTimestamp (ISO-8601).

### 11.2 API Contracts

The Document Processing API provides endpoints for ingestion and status: POST /api/documents/import accepts multipart form data with file content and returns source document reference. GET /api/documents/:id/status returns processing status and progress percentage. GET /api/documents/:id/content returns processed content when available.

The Synthesis API provides endpoints for synthesis operations: POST /api/synthesis/:documentId triggers synthesis for specified document, returns operation identifier. GET /api/synthesis/:operationId/status returns synthesis progress and status. GET /api/synthesis/:documentId/result returns synthesized artifacts when complete.

The Knowledge Graph API provides endpoints for graph operations: GET /api/knowledge-graph/:vaultId/nodes returns document nodes for vault. POST /api/knowledge-graph/discover triggers linkage discovery for specified documents. POST /api/knowledge-graph/links creates manual relationship between nodes. GET /api/knowledge-graph/traverse traverses graph from specified node with relationship filters.

The Conversation API provides endpoints for chat interactions: POST /api/conversation/query processes user query and returns response. GET /api/conversation/:conversationId/history returns conversation context. DELETE /api/conversation/:conversationId clears conversation history.

### 11.3 Performance Specifications

Document processing targets the following performance characteristics: PDF documents process at rate of 5 pages per second for text-based PDFs, 1 page per second for image-based PDFs. Image processing completes within 2 seconds for standard images (under 2MB). Audio processing achieves 10x real-time transcription (6-minute audio in 36 seconds). Embedding generation completes within 500ms per document for documents under 10KB.

Synthesis operations target: Individual document synthesis completes within 15 seconds for standard documents. Cross-document synthesis completes within 30 seconds for up to 5 documents. Batch synthesis processes up to 10 documents concurrently with 2-minute timeout per document.

Knowledge graph operations target: Linkage discovery completes within 5 seconds for vaults up to 100 documents. Graph traversal returns results within 100ms for single-hop queries. Similarity search completes within 200ms for vault-scale queries.

UI interaction targets: Canvas render completes within 100ms for up to 50 nodes. Synthesis activation control responds within 50ms. Chat response streaming begins within 500ms of query submission.

---

## Part 12: Integration Points and Dependencies

### 12.1 External Service Integration

The platform integrates with Gemini API for synthesis operations. The GeminiProvider adapter implements the ProviderAdapter interface, constructing requests following API specifications and handling responses. The adapter manages authentication through API key retrieval from the CredentialVault, rate limiting through request queuing, and error handling with retry logic.

The platform integrates with Transformers.js for local embedding generation. The TransformersJsEmbeddingGenerator loads model assets through the Transformers.js runtime, executing inference through Web Workers for background processing. Model assets cache in IndexedDB to avoid redundant downloads.

The platform integrates with Tesseract.js for OCR processing. The TesseractProcessor loads language models through the Tesseract.js runtime, executing recognition through Web Workers. Language models cache for reuse across processing operations.

The platform integrates with Whisper WASM for speech-to-text processing. The WhisperProcessor loads model assets through the ONNX Runtime Web, executing transcription through Web Workers. Model assets cache in IndexedDB for performance.

### 12.2 Internal Module Integration

The platform integrates with existing Via-gent infrastructure through defined interfaces. The Agent infrastructure provides the AI orchestration layer through TanStack AI, with the Knowledge Synthesis platform leveraging existing provider adapters and model configurations. The Workspace infrastructure provides project context through the WorkspaceContext, with synthesized artifacts associating with active workspace.

The Canvas infrastructure provides visualization through the Canvas component and related utilities. The Knowledge Synthesis platform extends canvas capabilities with knowledge-specific node types, relationship visualizations, and auto-layout algorithms. Integration occurs through the CanvasStore for state management and the CanvasRenderer for visualization.

The RAG infrastructure provides retrieval through the HybridRetriever and Orama index. The Knowledge Synthesis platform extends RAG capabilities with synthesis-specific embedding generation and cross-document retrieval. Integration occurs through the RAGStore for persistence and the EmbeddingService for vector operations.

### 12.3 Storage Integration

The platform integrates with IndexedDB storage through Dexie for persistent data. The DexieSchema defines tables for source documents, processed content, synthesized artifacts, knowledge graph nodes, and knowledge graph edges. Schema migrations handle version transitions with additive changes only for compatibility.

The platform integrates with localStorage for ephemeral configuration. User preferences, synthesis configuration, and view state persist through localStorage with appropriate serialization. Sensitive credentials persist through the CredentialVault with encryption.

The platform integrates with the File System Access API for import and export operations. Import operations read files through showOpenFilePicker. Export operations write files through showSaveFilePicker. Permission lifecycle management handles persistent permissions across sessions.

---

## Document Metadata and Versioning

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Status | Draft |
| Last Updated | 2025-12-31 |
| Authors | @bmad-bmm-architect |
| Reviewers | @bmad-core-bmad-master |
| Related Documents | implementation-playbook-2025-12-31.md, rag-pipeline-optimization-report-2025-12-31.md, multimodal-processing-specification-2025-12-31.md |

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-31 | Initial specification document | @bmad-bmm-architect |

---

*This document was generated under the BMAD V6 framework as part of the Knowledge Synthesis Platform specification effort. For questions or clarifications, contact the architecture team through established BMAD communication channels.*
