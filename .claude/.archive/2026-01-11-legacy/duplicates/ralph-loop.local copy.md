---
active: false
iteration: 31
max_iterations: 500
completion_promise: "KSI MODULE TRULY COMPLETE WITH all use cases proven work end-to-end without any gaps, smells, nor debts"
started_at: "2025-12-31T19:22:10+07:00"
module: "ksi-module"
---
# This is a recursive auto loop -> that's why when giving options, live automate to what best-in-class, respect the constitution of this project, following strict rules - make sure complete logical coverage, facilitate to build a complete system, for maintainability, accessibility, performance, and scalability. All AI-related features must from real-life implementation, using latest Jan 2026 patterns. Most important of the 


- use this for Gemini API key: AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ

- the AI agent development is enforced with MCP servers' tools uses for each cycle of implementation (at least 4 turns tool uses)

# KSI Module Ralph Loop Prompt

Execute Knowledge Synthesis Integration Module course correction.

## Execution Instructions

1. **Read Current State**: Load `_bmad-output/bmb-creations/ksi-module/LOOP_STATE.yaml` for current phase and task
2. **Execute Current Task** using the appropriate workflow from `_bmad-output/bmb-creations/ksi-module/workflows/`
3. **Validate with Build**: Run `pnpm build` after each significant change
4. **Update State**: Update LOOP_STATE.yaml with completion status, notes, and next task
5. **Continue Loop**: Proceed to next task until all Phase 0-7 tasks complete

## Quick Reference

### Module Location
```
_bmad-output/bmb-creations/ksi-module/
├── module.yaml           # Module definition
├── LOOP_STATE.yaml       # Current execution state (READ/UPDATE THIS)
├── agents/               # Agent personas
├── workflows/            # Execution workflows
├── templates/            # Output templates
└── data/
    ├── integration-gaps.yaml  # 6 gaps to fix
    ├── gemini-prompts.yaml    # Gemini API prompts
    └── use-cases.yaml         # 4 use case specs
```

### Phase Summary
| Phase | Name | Focus |
|-------|------|-------|
| 0 | Analysis | Scan implementations, map use cases, identify gaps |
| 1 | Source→RAG | Wire import to Orama indexing |
| 2 | Synthesis UI | Add synthesize button, create service |
| 3 | Chat→RAG | Unified ChatPanel with RAG integration |
| 4 | Canvas Linkage | AI-powered connection discovery |
| 5 | Gemini Multimodal | PDF, image, audio, URL processing |
| 6 | Knowledge Matrix | Auto-organization system |
| 7 | Final Validation | 12-level sweep + demo prep |

### Core Gaps to Fix
1. **GAP-001**: Source Import → Orama Index (6h)
2. **GAP-002**: ChatPanel → Hybrid Retriever (8h)
3. **GAP-003**: Synthesis Button + Service (10h)
4. **GAP-004**: Canvas → Linkage Analyzer (12h)
5. **GAP-005**: CitationSidebar → Chat (6h)
6. **GAP-006**: Knowledge Matrix Auto-Org (16h)

### 4 Use Cases to Validate
1. **Initial Vault Population**: Batch import → process → synthesize → organize
2. **Canvas Linkage Discovery**: Multi-node → AI analysis → connection proposals
3. **Conversational Knowledge Exploration**: Query → RAG → synthesis → citations
4. **Dynamic Knowledge Matrix**: Large vault → analysis → reorganization recommendations

### Validation Reference
- Sweeping Validation: `_bmad-output/validation/sweeping-validation.md`
- 12-Level Framework: `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`

### Completion Criteria

From this use case description of mine addressing the shortcomings, drift and gaps (end-to-end) across both brownfield and the new `knowledge synthesis` and its related interfaces → research thoroughly  and investigate the codebase (making a folder out of this topic to store your research over there) → to make comprehensive tech-spec and documentations to guidelines and agent instruction for building this in our projec > from there develop 4 variant of use cases (only using spec-driven style)

- when I access the app on  desktop, as a student I store many notes and these are not even following any naming format(of different formats: PDF, doc, docx, md, images, screenshots of my handwriting, and illustrations from some subjects) and they are from different subjects taken from various periods at school of the last month → as I select the folder and wait for these processed (embedding, chunking and some must even get process by image understanding, pdf parse, or even audio understanding) [after the general parsing, embedding or even run OCR by AI agent  → these documents are still in raw form → as each once pre-processed will raw embedding and synced will have  a little button next to for synthesizing (if user hit this, and base on which document and resource types → they will get api request with injected instruction prompt to gemini provider for frontmatter summary, meta data, tags, and those sorts of things to help creating links, and RAG more efficiently → so when I drag the synthesized knowledge resources into the canvas → with more than 3 pieces → the ai agent can advice for different of knowledge linkages in different engaging types
- These by time will get into a matrix of neural mapping - auto grouping into subjects - create relevancy branching contents etc → clickable and view interactively
- Also I can either chat with my agent (this agent is preconfigured to have prompts injection for different use cases, RAG tool, synthesizing tools and these are used based on users’ input)
- This is also my space for taking note as I can just ad random note into the project vault (which is the folder - as long as I have them synthesize → my knowledge is always sorted, organized and new knowledge can be formed from there)

From this use case description of mine addressing the shortcomings, drift and gaps (end-to-end) across both brownfield and the new `knowledge synthesis` and its related interfaces -> from there develop 4 variant of use cases (only using spec-driven style)

---

The modern educational landscape demands sophisticated knowledge management solutions capable of handling heterogeneous learning materials. Students accumulate vast quantities of notes, reference materials, and research artifacts across diverse formats and sources, yet existing tools fail to provide coherent synthesis and intelligent organization. This gap between raw material accumulation and knowledge integration represents a significant challenge in educational technology. The emergence of advanced AI capabilities—particularly in multimodal understanding, embedding generation, and semantic analysis—now enables the construction of systems that can transform fragmented information into interconnected knowledge networks. This transformation must address both legacy brownfield system limitations and novel synthesis requirements, ensuring seamless integration while delivering breakthrough functionality in knowledge discovery and utilization.

## System Vision

Design and implement an end-to-end knowledge synthesis platform that transforms heterogeneous student learning materials into organized, interconnected knowledge structures. The system must process diverse document formats, generate semantic embeddings, enable intelligent synthesis, and facilitate dynamic knowledge mapping through AI-augmented interfaces.

## Core Requirements

### Document Processing Pipeline

The platform shall support ingestion of multiple file formats including PDF documents, Microsoft Word files (doc, docx), Markdown files, raster images, handwriting screenshots, subject-specific illustrations, and audio recordings. Each document type requires specialized preprocessing pipelines: PDF documents undergo structural parsing and text extraction; images require OCR processing and visual understanding; audio files demand speech-to-text conversion and content analysis. Preprocessed materials generate raw semantic embeddings stored alongside original assets, enabling subsequent retrieval-augmented generation operations.

### Knowledge Synthesis Interface

Following initial processing, documents display synthesis activation controls. Upon user invocation, the system constructs context-aware API requests to the Gemini provider, incorporating document-type-specific instruction prompts. Synthesis operations generate frontmatter summaries, extract metadata, create semantic tags, and establish preliminary knowledge linkages. Synthesized resources retain associations with source materials and generated artifacts, supporting downstream knowledge recombination operations.

### Dynamic Knowledge Mapping

Synthesized knowledge resources enable interactive canvas integration. When users aggregate three or more synthesized pieces within a unified workspace, the AI agent analyzes potential connections and suggests knowledge linkages across multiple engagement types. The system progressively develops neural mapping representations that auto-group materials by subject, calculate relevancy scores, generate branching content recommendations, and present interconnected knowledge structures through clickable, interactive visualizations.

### Conversational AI Interaction

The platform incorporates a preconfigured AI agent capable of interpreting user intentions and dynamically selecting appropriate toolchains. The agent maintains access to specialized prompts for synthesis operations, RAG retrieval, and knowledge transformation, automatically routing user queries to optimal processing pathways based on semantic analysis of input and current workspace context.

### Project Vault Organization

The system provides a hierarchical vault structure where users aggregate learning materials. Synthesized knowledge remains perpetually organized, with the system continuously identifying cross-material connections and proposing novel knowledge formations. The vault supports both structured folder hierarchies and dynamic auto-organized collections, enabling flexible knowledge management workflows.

## Technical Specification Requirements

Develop comprehensive technical specifications documenting architecture, data flow, processing pipelines, and integration points. Create detailed implementation guidelines and agent instruction sets specifying behavior for all system components, including document processors, embedding generators, synthesis engines, knowledge mappers, and conversational interfaces.

## Deliverables

Produce a complete technical specification document suite and four distinct spec-driven use case implementations demonstrating system capabilities across representative scenarios.

---

# Spec-Driven Use Cases

## Use Case 1: Initial Vault Population and Baseline Synthesis

### Preconditions

User has created a project vault named "Fall Semester 2024" and possesses unorganized learning materials accumulated over the past month, spanning multiple subjects including Mathematics, Physics, and Literature. Materials exist in various formats: scanned PDF lecture notes, photographed handwritten study sheets, typed Markdown assignment drafts, and extracted illustrations from textbook chapters. No synthesis operations have been performed, and the vault contains raw, unprocessed assets.

### Trigger

User selects the "Fall Semester 2024" vault folder and invokes the batch processing function through the interface control.

### Main Flow

The system initiates parallel processing pipelines for all contained assets, distributing work across available compute resources. PDF documents proceed through structural parsing, identifying headings, paragraphs, and embedded figures while extracting text content. Image assets undergo OCR processing to extract handwritten or printed text, followed by visual understanding models that identify diagrams, equations, and illustrative content. Audio recordings convert to text transcripts and generate supplementary embeddings for semantic retrieval.

Upon completion of initial preprocessing, the system presents each asset with an associated synthesis activation control. The user systematically activates synthesis for individual materials, triggering targeted API requests to the Gemini provider. Each request incorporates type-specific instruction sets: PDF synthesis prompts emphasize structural summary and key concept extraction; image synthesis prompts focus on visual content description and contextual tagging; audio synthesis prompts prioritize spoken content condensation and action item identification.

Synthesized outputs generate frontmatter containing document summaries ranging 150-300 words, structured metadata fields including subject classification, date ranges, and source attribution, plus semantic tag sets extracted through named entity recognition and topic modeling. These artifacts persist in associated storage, linked to source documents and accessible for downstream knowledge operations.

### Postconditions

The vault contains fully processed assets with associated embeddings and synthesis metadata. Each document displays synthesis status indicators confirming completion. The system has established preliminary subject groupings based on extracted metadata, visible through vault organization views.

---

## Use Case 2: Interactive Canvas Knowledge Linkage Discovery

### Preconditions

A project vault contains multiple synthesized knowledge resources resulting from prior processing operations. The user has opened the interactive canvas workspace and added at least three synthesized documents representing related but distinct materials—for example, a lecture note summary on differential equations, a handwritten problem solution illustration, and a literature passage analysis document.

### Trigger

User activates the knowledge linkage discovery function through canvas toolbar controls while multiple synthesized resources occupy the workspace.

### Main Flow

The system analyzes the aggregate set of workspace resources, extracting semantic vectors from each synthesized document's frontmatter, metadata, and tag collections. Comparative embedding analysis identifies thematic overlaps, conceptual connections, and potential knowledge bridges across the resource collection.

The AI agent generates linkage recommendations categorized by engagement type. Conceptual links highlight shared mathematical principles, thematic vocabulary, or historical contexts connecting resources. Sequential links identify prerequisite relationships or logical progression paths through material sequences. Contrastive links surface opposing viewpoints, alternative methodologies, or complementary perspectives present across resources.

For each identified connection, the system renders interactive visualization elements within the canvas. Links display as connectable nodes with hover states revealing connection rationale, shared concept names, and confidence scores. Users may accept, modify, or dismiss proposed linkages, with accepted connections persisting in the knowledge graph structure.

Upon accepting linkages forming interconnected clusters of three or more resources, the system proposes knowledge synthesis opportunities, offering to generate integrative summaries that transcend individual document boundaries and illuminate emergent relationships within the knowledge cluster.

### Postconditions

The canvas displays a knowledge linkage network with verified connections between related resources. The underlying knowledge graph has been updated with new relationship nodes and connection metadata. Proposed synthesis opportunities remain available for user consideration.

---

## Use Case 3: Conversational Knowledge Exploration Session

### Preconditions

A populated project vault contains synthesized documents organized by subject, with established knowledge linkages and metadata structures. The conversational AI agent maintains access to RAG toolchains, synthesis capabilities, and knowledge graph query interfaces. The user has initiated a chat session through the agent interface without specific task constraints.

### Trigger

User poses an open-ended query such as "Help me understand how the concepts from my calculus notes connect to the physics materials I added last week" or requests a specific synthesis operation like "Create a comparison between the historical perspectives in these three literature documents."

### Main Flow

The conversational agent parses user input through intent classification models, identifying whether the query requires retrieval-augmented generation, cross-document synthesis, knowledge graph traversal, or synthesis operation invocation. For complex queries involving multiple information types, the agent orchestrates sequential toolchain operations.

When processing conceptual connection queries, the agent executes knowledge graph queries identifying resources spanning the specified subject domains, retrieves relevant synthesized content through embedding similarity search, and synthesizes responses that explicitly map connections between concepts across source materials. Responses incorporate citations linking to specific source documents and synthesized artifacts, enabling user verification and deeper exploration.

When processing synthesis requests, the agent constructs targeted Gemini API calls incorporating the specified source documents, instruction prompts aligned with the requested synthesis type (comparison, summary, extraction), and context from related synthesized materials. Generated outputs integrate with the vault structure as new synthesized artifacts, linked to source materials and discoverable through standard knowledge operations.

Throughout the interaction, the agent maintains conversation context, tracking established connections and referenced materials. Subsequent queries may reference prior context without explicit re-specification, enabling natural exploratory对话 that progressively builds understanding across the knowledge collection.

### Postconditions

The user has received a comprehensive response addressing their query, incorporating relevant materials from across the vault. New synthesized artifacts have been created and integrated into the knowledge structure when synthesis operations were requested. Conversation history persists, maintaining context for subsequent interactions.

---

## Use Case 4: Dynamic Knowledge Matrix Evolution and Auto-Organization

### Preconditions

An established project vault has accumulated synthesized materials over multiple usage sessions. The knowledge graph contains documented relationships, subject classifications, and temporal metadata. The user has not performed manual reorganization operations beyond initial vault creation, relying on system auto-organization capabilities.

### Trigger

User invokes the knowledge matrix reorganization function or the system automatically triggers reorganization upon detecting threshold changes in vault composition, such as accumulation of new materials in previously sparse subject areas.

### Main Flow

The system executes knowledge matrix analysis routines, evaluating the complete synthesized corpus against multiple organizational taxonomies. Subject domain classifications undergo refinement as new materials introduce cross-disciplinary concepts requiring either new category creation or existing category expansion. Temporal analysis groups materials by academic period, revealing knowledge accumulation patterns and identifying study session clusters.

Relevancy scoring algorithms calculate inter-document relationship strengths, identifying highly connected knowledge clusters and peripheral materials with limited established connections. Strongly connected clusters receive priority placement in organizational views, while peripheral materials receive highlighting to encourage synthesis activation or relationship establishment.

The system generates proposed reorganization recommendations presenting alternative organizational structures aligned with different access patterns: chronological organization emphasizing knowledge evolution, conceptual organization emphasizing topic clusters, and hybrid approaches balancing multiple access modalities. Each recommendation includes projected navigation efficiency metrics and anticipated user experience improvements.

Upon user selection of a preferred organizational structure, the system transforms vault views and navigation interfaces to reflect the chosen organization while preserving underlying knowledge graph relationships. The transformation supports simultaneous multiple organizational perspectives, enabling users to switch between views without data duplication or reconstruction overhead.

### Postconditions

The vault organizational structure has been updated to reflect the selected organizational perspective. Knowledge cluster visualizations accurately represent current relationship strengths and subject classifications. Navigation interfaces provide optimized access pathways aligned with the chosen organizational model.
