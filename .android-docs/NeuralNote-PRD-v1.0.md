# NeuralNote PRD v1.0
## A Local-First Knowledge Operating System for Android

**Document Status:** Production-Ready  
**Version:** 1.0  
**Last Updated:** 2026-01-02  
**Author:** Product Architecture Team  
**Classification:** Internal / Technical Specification  

---

## Executive Summary

**NeuralNote** is an enterprise-grade, **local-first, privacy-centric Knowledge Operating System** for Android 12+. It unifies three distinct paradigms—structured documentation (Notion), networked thought (Obsidian), and grounded synthesis (NotebookLM)—into a single coherent platform where **all intelligence and data remain on the user's device**.

### Market Position & Differentiation

| Aspect | Notion | Obsidian | NotebookLM | NeuralNote |
|--------|--------|----------|------------|-----------|
| **Offline** | ❌ | ✅ | ❌ | ✅ |
| **Mobile-First** | ❌ | ❌ | ❌ | ✅ |
| **Local RAG** | ❌ | ❌ | ❌ | ✅ |
| **Canvas/Graph** | ❌ | ✅ | ❌ | ✅ |
| **No Backend Sync** | ❌ | ✅ | ❌ | ✅ |

**Core Promise:** *"Offline Intelligence + Notion's Power + Obsidian's Graph + NotebookLM's Synthesis = Intellectual Autonomy"*

---

## 1. Vision & Strategic Goals

### 1.1 Product Vision

NeuralNote enables users to:
- **Own their knowledge** (zero data in the cloud)
- **Think in networks** (bidirectional links, graph visualization)
- **Learn deeply** (generate study artifacts without hallucination)
- **Work offline** (true digital independence)

### 1.2 Target User Personas

#### Persona 1: The Academic Researcher
- **Profile:** PhD candidate, researcher, or senior academic
- **Pain Points:** 
  - Need to manage 50+ papers with bidirectional citation tracking
  - Current tools (Zotero, Notion) split knowledge across platforms
  - Privacy concerns about sharing research with cloud services
- **Value Proposition:** Unified local vault + automatic citation graph + synthesis from sources
- **Success Metric:** 80% of research workflow stays in-app; zero papers lost to disorganization

#### Persona 2: The Privacy-Conscious Student
- **Profile:** High school to graduate student
- **Pain Points:**
  - Won't use Notion because it stores personal journals on servers
  - Obsidian lacks mobile support and RAG
  - Needs study aids (flashcards, quizzes, mind maps) generated automatically
- **Value Proposition:** Full offline mobile app + auto-generated study materials + zero surveillance
- **Success Metric:** Completes weekly study sessions in-app; 90% test score improvement

#### Persona 3: The Knowledge Worker
- **Profile:** Software engineer, product manager, consultant
- **Pain Points:**
  - Captures knowledge across Notion, OneNote, Obsidian
  - Can't search across documents quickly (no semantic search)
  - Meetings create scattered notes; needs synthesis
- **Value Proposition:** Unified workspace + instant semantic search + meeting synthesis
- **Success Metric:** Reduces time spent "finding context" by 60%; knowledge reuse increases

### 1.3 Strategic Goals (12-Month Roadmap)

| Phase | Timeline | Goal |
|-------|----------|------|
| **Phase 0: Foundation** | Jan – Feb 2026 | Scaffold BMAD governance; Establish core architecture. |
| **Phase 1: MVP** | Mar – May 2026 | Block editor + Database + Local RAG (synthesis). |
| **Phase 2: Knowledge Graph** | Jun – Jul 2026 | Canvas + Graph visualization + intelligent backlinks. |
| **Phase 3: Agent Layer** | Aug – Sep 2026 | Actionable agents (auto-generate blocks, re-organize). |
| **Phase 4: Sync & Ecosystem** | Oct – Dec 2026 | Local sync, desktop sync, API for integrations. |

---

## 2. Requirements & Acceptance Criteria

### 2.1 Functional Requirements by Domain

#### Domain A: Neural Vault (Block Editor + Database)

**FR-A1: Block-Based Document Editor**
- **Description:** Users can create pages composed of editable blocks (text, lists, images, code, embeds).
- **Acceptance Criteria:**
  - [ ] Support 12+ block types: Heading (H1–H6), Paragraph, Bulleted List, Numbered List, Code Block (with syntax highlighting for 20+ languages), Image, Embed, LaTeX, Table, Database Reference, Divider, Callout.
  - [ ] Block operations (create, move, duplicate, delete, convert) execute with <100ms latency.
  - [ ] Undo/Redo works for up to 50 steps.
  - [ ] **Dark mode** enforced; all text meets WCAG 2.1 AA contrast (4.5:1).

**FR-A2: Database Engine (Structured Records)**
- **Description:** Users define "Databases"—a collection of related pages with typed properties (e.g., "Books" with Title, Author, Rating, Read Date).
- **Acceptance Criteria:**
  - [ ] Support property types: Text, Number, Select (single & multi), Checkbox, Date, Relation, Formula.
  - [ ] Formulas execute locally (no external compute); support arithmetic, string concat, date math.
  - [ ] Views: Table, Gallery (cards), Timeline (date-sorted), List.
  - [ ] Filtering & sorting on any property; persistent view state.
  - [ ] **Relation** properties enable many-to-many links between databases.

**FR-A3: Synced Blocks (Content Reuse)**
- **Description:** A block can be "synced" so edits in one location auto-update everywhere.
- **Acceptance Criteria:**
  - [ ] Sync happens instantly on the same page; cross-page sync within <500ms.
  - [ ] Visual indicator shows which blocks are synced.
  - [ ] Unsyncing is atomic (all copies become independent).

---

#### Domain B: Infinite Graph (Canvas + Visualization)

**FR-B1: Infinite Canvas (Obsidian-Style)**
- **Description:** A zoomable, pannable 2D surface where users arrange and connect notes/cards/media.
- **Acceptance Criteria:**
  - [ ] Canvas supports 1000+ nodes at 60fps (no lag on pan/zoom).
  - [ ] Nodes: Text cards, Image cards, Embedded Notes, PDF excerpts, Chat cards.
  - [ ] Manual edges (connections) drawn between nodes; labeled or unlabeled.
  - [ ] Auto-layout option (force-directed) repositions overlapping nodes.
  - [ ] Save multiple canvases per workspace; switch instantly.
  - [ ] Export canvas as image (PNG, SVG).

**FR-B2: Graph Visualization (Network Overview)**
- **Description:** Visualize the entire vault as a network: nodes = pages, edges = bidirectional links.
- **Acceptance Criteria:**
  - [ ] Render 10,000+ nodes at 60fps (GPU-accelerated via Skia).
  - [ ] Node size/color customizable (by # backlinks, creation date, custom tags).
  - [ ] Click a node to focus its neighborhood; show backlink/outlink counts.
  - [ ] Detect clusters (connected components); highlight or filter by cluster.
  - [ ] Search/filter: show only nodes matching a tag or query.

**FR-B3: Bidirectional Links & Backlinks**
- **Description:** When a user mentions another note's name (e.g., "[[Quantum Computing]]"), a bidirectional link is created. Both pages show each other in their "Backlinks" section.
- **Acceptance Criteria:**
  - [ ] Link syntax: `[[Page Name]]` (case-insensitive matching).
  - [ ] Backlinks shown in a sidebar; click to navigate.
  - [ ] Unlinked references: Show mentions that *could* be links (manual approval).
  - [ ] Link metadata: Track creation date, editor who created the link, context.

---

#### Domain C: Synthesizer (Local RAG + Agent)

**FR-C1: Local Vector Database**
- **Description:** Automatically extract text from all blocks and notes, chunk them, generate embeddings, and store in a queryable index.
- **Acceptance Criteria:**
  - [ ] Chunking strategy: Sliding window (512 tokens, 50% overlap) or recursive chunking (respect block boundaries).
  - [ ] Embedding model: MediaPipe Text Embedder or equivalent (on-device, <50MB).
  - [ ] Storage: `sqlite-vec` extension; support cosine similarity search.
  - [ ] Re-indexing: Incremental (only new/modified blocks).
  - [ ] Indexing latency: <100ms per block for typical phones.
  - [ ] Reachable vectors: All vectors searchable within 500ms for 10k+ blocks.

**FR-C2: Grounded Q&A (Local Chat)**
- **Description:** Users ask a question; the system retrieves relevant blocks, generates an answer **only** using those blocks, and provides citations.
- **Acceptance Criteria:**
  - [ ] Chat interface: Text input → AI response + citations.
  - [ ] Response grounding: Every claim backed by a block reference (e.g., "[1]" in response links to source block).
  - [ ] Source context visible: Click citation → scroll to source block.
  - [ ] Time-to-first-token: <1.5s on Pixel 7 or equivalent.
  - [ ] Model: Llama 3.2 1B Quantized (4-bit) or equivalent (2-3GB max model size).
  - [ ] Hallucination mitigation: System prompt strictly forbids claims not in context.

**FR-C3: Synthesis Artifacts (Study Materials)**
- **Description:** Generate structured learning objects (Briefing Docs, FAQs, Mind Maps, Flashcards) from a set of notes.
- **Acceptance Criteria:**
  - [ ] **Briefing Doc:** Automatically generate a 500–1000-word summary of a topic, with sections and citations.
  - [ ] **FAQ:** Extract common questions and answers from notes; deduplicate; add citations.
  - [ ] **Mind Map:** Generate a hierarchical concept map from a note; root = main topic, leaves = concepts; show relationships.
  - [ ] **Flashcard Set:** Auto-generate 10–20 flashcards from a note or topic; user can edit/rate for Spaced Repetition.
  - [ ] All artifacts are **editable** after generation (not locked).
  - [ ] Artifacts embed source citations; can be exported (PDF, Markdown).

**FR-C4: Actionable Agent Layer**
- **Description:** The AI can perform workspace-modifying actions (create pages, update database properties, reorganize content) with user approval.
- **Acceptance Criteria:**
  - [ ] Agent can propose actions: "Create a page 'Q3 Review' and add it as a relation to all Q3-dated database items."
  - [ ] Preview mode: Show exactly what will change before execution.
  - [ ] Audit trail: Every agent action logged with timestamp, user, and revertability.
  - [ ] Approval workflow: User must confirm actions (no silent modifications).
  - [ ] Rollback: Undo agent actions up to 24 hours back.

---

#### Domain D: Import & Export

**FR-D1: Multi-Format Import**
- **Description:** Users can import existing knowledge from various formats.
- **Acceptance Criteria:**
  - [ ] **Markdown files** → Parse headings, lists, code blocks as NeuralNote blocks.
  - [ ] **PDFs** → Extract text, preserve formatting (bold, italic, tables); support OCR for scanned PDFs.
  - [ ] **Web clips** → Save web pages as notes (title, date, original URL); optional local rendering.
  - [ ] **Obsidian vaults** → Import folder structure, notes, and links.
  - [ ] **Notion exports** → Import databases, pages, and relationships.
  - [ ] Batch import: Handle 100+ files in <5 min.

**FR-D2: Multi-Format Export**
- **Description:** Users can export notes and databases in standard formats.
- **Acceptance Criteria:**
  - [ ] **Single page → PDF/Markdown/HTML**
  - [ ] **Database → CSV/JSON**
  - [ ] **Entire vault → Markdown folder structure** (with links preserved)
  - [ ] **Canvas → SVG/PNG**
  - [ ] All exports include metadata (dates, tags, backlinks).

---

### 2.2 Non-Functional Requirements

#### NFR-1: Performance

| Metric | Target | Justification |
|--------|--------|---------------|
| **Startup Time** | <1.2s to interactive | User expects instant app open. |
| **Block Creation** | <50ms | Smooth typing experience. |
| **Search (10k blocks)** | <500ms | Semantic search on large vault. |
| **Sync Across Workspace** | <100ms | Real-time collaboration feel. |
| **Canvas Pan/Zoom (1k nodes)** | 60fps | Smooth visual interaction. |
| **Graph Render (10k nodes)** | 60fps | GPU-accelerated Skia. |
| **Inference (first token)** | <1.5s | RAG responsiveness. |
| **Memory (baseline)** | <150MB | Doesn't overwhelm 4GB+ phones. |
| **Storage (100k blocks)** | <500MB | Reasonable disk footprint. |

#### NFR-2: Security & Privacy

- [ ] **End-to-End Encryption:** All data at rest encrypted with AES-256-GCM; key stored in Android Keystore.
- [ ] **Zero External Calls During RAG:** Inference, embedding, search happen entirely on-device.
- [ ] **Permissions:** Minimal required (FileSystem, Camera optional for OCR).
- [ ] **No Crash Reporting:** Errors logged locally only.
- [ ] **No Analytics:** Zero telemetry.

#### NFR-3: Reliability & Data Safety

- [ ] **Automatic Backups:** Local backup file created daily (encrypted, stored in app data directory).
- [ ] **ACID Transactions:** All database writes atomic; no partial updates.
- [ ] **Crash Recovery:** App recovers from unexpected termination without data loss.
- [ ] **Data Validation:** All imports validated; corrupted data rejected.

#### NFR-4: Accessibility (WCAG 2.1 AA)

- [ ] **Text Contrast:** All text ≥4.5:1 (normal) or ≥3:1 (large).
- [ ] **Touch Targets:** Minimum 48dp × 48dp.
- [ ] **Screen Reader:** All interactive elements have descriptive labels.
- [ ] **Keyboard Navigation:** Full app navigable without touch.

#### NFR-5: Internationalization (i18n)

- [ ] **Phase 1:** English + Vietnamese (core app strings, UI).
- [ ] **Phase 2:** Add Chinese (Simplified & Traditional), Spanish, French.
- [ ] **Content:** User notes remain in any language (no restrictions).

#### NFR-6: Device Compatibility

- [ ] **Android:** 12.0+ (minimum API level 31).
- [ ] **RAM:** Support graceful degradation for 4GB+ devices.
- [ ] **GPU:** Accelerated Skia (Canvas/Graph) for Adreno 600+ or equivalent.
- [ ] **Storage:** App footprint <300MB; allow users to offload if needed.

---

## 3. Data Model & Schema

### 3.1 Core Entity Definitions

#### Entity: **Workspace**
Represents a user's knowledge space (one-to-one with app instance initially).

```sql
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  encryption_key_id TEXT,  -- Reference to Keystore entry
  UNIQUE(name)
);
```

#### Entity: **Block** (The Atomic Unit)
Any editable content: paragraphs, lists, code, images, embeds, etc.

```sql
CREATE TABLE blocks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  parent_id TEXT,  -- Can be NULL (root) or another block (nested)
  position INTEGER,  -- Order within parent
  type TEXT NOT NULL,  -- "text", "heading", "code", "image", "embed", ...
  content JSONB,  -- Type-specific data: {"text": "...", "level": 1, ...}
  metadata JSONB,  -- Tags, mentions, links, custom properties
  vector BLOB,  -- Embedding (768-dim float32, ~3KB)
  created_at INTEGER,
  updated_at INTEGER,
  created_by TEXT,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (parent_id) REFERENCES blocks(id),
  INDEX idx_workspace_parent (workspace_id, parent_id)
);
```

#### Entity: **Page** (Conceptual)
A root-level block with type="page" that acts as a note or document.

```sql
-- Pages are blocks with type='page' and parent_id=NULL
SELECT * FROM blocks WHERE type='page' AND parent_id IS NULL;
```

#### Entity: **Database** (Structured Record Collection)
A database is a **config** + a set of **record pages** (all with type="database_record").

```sql
CREATE TABLE databases (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  schema JSONB,  -- { "properties": { "title": { "type": "text" }, ... } }
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  UNIQUE(workspace_id, name)
);
```

#### Entity: **Edge** (Relationship)
Represents a link between two blocks (backlinks, manual connections, canvas edges).

```sql
CREATE TABLE edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- "backlink", "manual", "canvas_connection", "relation"
  metadata JSONB,  -- Label, color, custom properties
  created_at INTEGER,
  FOREIGN KEY (source_id) REFERENCES blocks(id),
  FOREIGN KEY (target_id) REFERENCES blocks(id),
  INDEX idx_source (source_id),
  INDEX idx_target (target_id)
);
```

#### Entity: **Conversation** (RAG State)
Tracks a synthesis session: which blocks are in context, the chat history, sources used.

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT,
  context_block_ids JSONB,  -- List of block IDs used for this chat
  context_tags JSONB,  -- Tags/filters used for retrieval
  history JSONB,  -- [{ "role": "user", "content": "..." }, { "role": "assistant", ... }]
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);
```

#### Entity: **ArtifactGeneration** (Synthesis Output)
Tracks generated artifacts (briefs, FAQs, mind maps) for audit and regeneration.

```sql
CREATE TABLE artifact_generations (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  artifact_type TEXT,  -- "brief", "faq", "mind_map", "flashcard_set"
  artifact_content JSONB,  -- The generated content
  source_citation_map JSONB,  -- { "citation_id": "source_block_id", ... }
  created_at INTEGER,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

---

### 3.2 Vector Index Schema (via sqlite-vec)

The `sqlite-vec` extension provides a vector similarity index. At a high level:

```sql
-- Create a virtual table for vector similarity search
CREATE VIRTUAL TABLE blocks_vec USING vec0(
  id TEXT,
  embedding FLOAT[768]
);

-- Insert after generating embeddings:
INSERT INTO blocks_vec(id, embedding) 
VALUES ('block-123', [...768 float values...]);

-- Query:
SELECT id, distance FROM blocks_vec 
WHERE embedding MATCH mips_query(?) 
LIMIT 5;
```

---

## 4. Architectural Overview

### 4.1 System Architecture (Layered)

```
┌─────────────────────────────────────────────────────┐
│         Mobile UI Layer (React Native/Tamagui)      │
│  [Editor] [Canvas] [Graph] [Chat] [Synthesis]      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│    Application Logic & State (Zustand + MMKV)       │
│   [Workspace Store] [Editor Store] [RAG Store]      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      Local Service Layer (Domain Logic)              │
│ [BlockService] [DatabaseService] [RAGService]       │
│ [SynthesisService] [ImportExportService]            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Native/JSI Layer (C++, Performance-Critical)        │
│  [SQLite (op-sqlite)] [Vector Search]               │
│  [LLM Inference (ExecuTorch)] [Skia Rendering]      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│   System Layer (Android OS, Device Hardware)         │
│   [FileSystem] [Encryption] [NPU/GPU]               │
└─────────────────────────────────────────────────────┘
```

### 4.2 Data Flow: The RAG Pipeline

```
1. User Imports Note
   ↓
2. Block Storage (op-sqlite)
   ↓
3. Text Extraction & Chunking (JSI/C++)
   ↓
4. Embedding Generation (MediaPipe, on-device)
   ↓
5. Vector Index (sqlite-vec)
   ↓
6. [USER ASKS QUESTION]
   ↓
7. Query Embedding (same model)
   ↓
8. Vector Similarity Search (Top-K retrieval)
   ↓
9. Re-ranking & Filtering (Optional)
   ↓
10. Context Assembly (Prompt construction)
    ↓
11. LLM Inference (ExecuTorch, Llama 3.2)
    ↓
12. Response + Citation Mapping
    ↓
13. UI Renders Response + Clickable Citations
```

### 4.3 Key Technology Choices & Justification

| Component | Choice | Justification |
|-----------|--------|---------------|
| **Runtime** | Expo (CNG) | Fast iteration; full native module support; Config Plugins. |
| **Language** | TypeScript | Type safety across DB, UI, AI logic. |
| **UI Framework** | Tamagui | Best performance for complex mobile UIs; great animations. |
| **Graphics** | React Native Skia | GPU-accelerated Canvas/Graph; 60fps on mid-range phones. |
| **Database** | op-sqlite | Fastest bridge-less SQLite bindings; no serialization overhead. |
| **Vector Search** | sqlite-vec | Native C++ extension; no separate Vector DB (reduces complexity). |
| **Embeddings** | MediaPipe Text Embedder | <50MB; on-device; Google-maintained. |
| **LLM** | Llama 3.2 1B (4-bit Quantized) | ~2-3GB memory; fast enough for <1.5s TTFT; open-source. |
| **LLM Runtime** | ExecuTorch (Meta) | Optimized for mobile; NPU/GPU support; Pytorch-native. |
| **State Management** | Zustand + MMKV | Reactive updates; synchronous persistence; no complexity of Redux. |
| **Sync** | Local CRDT-ready | Prepares for future multi-device sync without design refactor. |

---

## 5. BMAD Governance & Validation Framework

### 5.1 Project Governance (BMAD v6 Mobile)

**Roles:**

1. **@pmOrchestrator** (Product Manager)
   - Owns PRD, User Stories, Acceptance Criteria.
   - Makes trade-off decisions on scope.
   - Reviews completed stories against AC.

2. **@architectAgent** (Systems Architect)
   - Owns `architecture.md`, database schema, API contracts.
   - Reviews code for architectural violations (layer breaches, performance anti-patterns).
   - Approves changes to core modules.

3. **@mobileDevAgent** (Mobile Development)
   - Implements UI (Tamagui/Skia) and application logic.
   - Writes TDD (test-first) code; maintains code coverage >80%.
   - Enforces naming conventions, max file size (Composable <150 lines, Class <300 lines).

4. **@nativeModuleAgent** (Native/JSI Expert)
   - Owns SQLite, Vector Search, LLM Inference bridges.
   - Ensures zero "Bridge" serialization overhead.
   - Optimizes hot paths (vector indexing, graph layout).

5. **@qaAutomationAgent** (Quality Assurance)
   - Owns `sweeping-validation.md` enforcement.
   - Writes Maestro E2E flows and Jest unit tests.
   - Measures performance (startup time, search latency, memory).

---

### 5.2 The "Sweeping Validation" Checklist (12 Levels, Mobile-Adapted)

Every code review and integration **must** pass these 12 checks. Each level has a "Validator" agent who audits the code.

#### Level 1: State Integrity
- [ ] **All state in Zustand stores** (no useState in Composables for persistence).
- [ ] **MMKV for persistence** (never AsyncStorage).
- [ ] **Single Source of Truth:** No duplicated state across components or stores.
- [ ] **Validator:** @architectAgent

#### Level 2: Hygiene & Complexity
- [ ] **Composables <150 lines** (excluding imports, interface definitions).
- [ ] **Classes <300 lines**.
- [ ] **Functions <50 lines** (single responsibility).
- [ ] **No console.log in production code** (use structured logging to MMKV for debugging).
- [ ] **Validator:** @mobileDevAgent

#### Level 3: Naming & Type Safety
- [ ] **Strict TypeScript** (`noImplicitAny: true`, `strict: true`).
- [ ] **All props have explicit types** (no `any`).
- [ ] **Consistent naming:** `blockId` (not `bid` or `block_id`), `userId`, `workspaceId`.
- [ ] **Enum/Const for magic strings** (no `if (type === "page")`; use enum).
- [ ] **Validator:** @mobileDevAgent + TypeScript compiler

#### Level 4: Dependency Integrity
- [ ] **No circular imports** (linter: ESLint with `no-cycle`).
- [ ] **Imports scoped to module** (no `../../` deep paths; use barrel exports).
- [ ] **Peer dependencies declared explicitly** (no hidden transitive deps).
- [ ] **Validator:** @architectAgent (ESLint)

#### Level 5: Integration & Permissions
- [ ] **All Android permissions gated** (`PermissionsAndroid.check()` before use).
- [ ] **Graceful degradation** (app works if Camera/Microphone denied).
- [ ] **FileSystem access audited** (no access to system directories).
- [ ] **Validator:** @qaAutomationAgent

#### Level 6: Architecture & Layer Boundaries
- [ ] **No UI code in Services** (Services = pure logic, no React imports).
- [ ] **No Database calls in Composables** (use Hooks/Services as bridge).
- [ ] **Unidirectional data flow:** UI → Hooks/Store → Services → DB.
- [ ] **Error handling at service layer** (Composables don't throw, catch, or retry).
- [ ] **Validator:** @architectAgent

#### Level 7: Mobile UX & Responsiveness
- [ ] **Touch targets ≥48dp** (check in Tamagui/theme).
- [ ] **Dark mode supported** (all text readable on dark background).
- [ ] **Respects Safe Area** (notches, status bar, home indicator).
- [ ] **IME (keyboard) doesn't occlude input** (use `FlatList`'s `keyboardShouldPersistTaps`).
- [ ] **Validator:** @qaAutomationAgent (visual inspection + Maestro)

#### Level 8: Internationalization (i18n)
- [ ] **All user-facing strings via `i18n.t()`** (never hardcoded).
- [ ] **Pluralization supported** (e.g., "1 note" vs "5 notes").
- [ ] **Date/number formatting locale-aware** (not "12/25" only).
- [ ] **Validator:** @mobileDevAgent (i18next config audit)

#### Level 9: Performance & Efficiency
- [ ] **Startup time measured <1.2s** (to interactive).
- [ ] **Scrolling lists use `FlashList`** (not `FlatList`).
- [ ] **Memoization used for expensive Composables** (`memo()` or `useMemo()`).
- [ ] **No re-renders of large lists on unrelated state changes**.
- [ ] **Validator:** @nativeModuleAgent (profiling)

#### Level 10: Security & Data Protection
- [ ] **Sensitive data encrypted at rest** (AES-256-GCM via Android Keystore).
- [ ] **No sensitive data in logs** (no passwords, keys, personal info).
- [ ] **External intents checked** (don't blindly open URLs from untrusted sources).
- [ ] **Validator:** @architectAgent (security audit)

#### Level 11: Documentation & Onboarding
- [ ] **README.md** explains architecture, tech stack, setup.
- [ ] **AGENTS.md** defines roles, responsibilities, code ownership.
- [ ] **API contracts documented** (JSI interfaces, Service signatures).
- [ ] **Complex algorithms documented** (e.g., "Force-Directed Layout", "Chunking Strategy").
- [ ] **Validator:** @pmOrchestrator (readability audit)

#### Level 12: Testing & Coverage
- [ ] **Jest unit tests >80% coverage** (critical paths 100%).
- [ ] **Maestro E2E flows** for core user journeys (create note, chat, synthesis).
- [ ] **Performance benchmarks** recorded (startup, search, inference latency).
- [ ] **Regression tests** for previous bugs.
- [ ] **Validator:** @qaAutomationAgent

---

### 5.3 Validation Automation Script

A script `scripts/validate.sh` runs during CI/CD and before each merge:

```bash
#!/bin/bash
set -e

echo "🔍 Level 1: State Integrity"
npx eslint --rule "no-restricted-globals: error" --rule "no-var: error" src/

echo "🔍 Level 2-4: Code Quality"
npx eslint src/
npx tsc --noEmit

echo "🔍 Level 7-8: UI/i18n Lint"
npx i18next-scanner --config i18next-scanner.config.js

echo "🔍 Level 9: Performance Check"
npm run build:analyzer  # Bundle size analysis

echo "🔍 Level 12: Tests"
npm run test -- --coverage --threshold 80

echo "✅ All validations passed!"
```

---

## 6. Work Breakdown Structure (Epics & Stories)

### 6.1 Phase 1: MVP (Mar – May 2026)

#### Epic 1.1: Core Block Editor & Storage
**Goal:** Users can create, edit, and organize notes in a block-based format.

**Stories:**
- **Story 1.1.1:** Implement Block data model and SQLite schema
- **Story 1.1.2:** Create Block Editor Composable (text, heading, list support)
- **Story 1.1.3:** Implement undo/redo (snapshot-based)
- **Story 1.1.4:** Add block operations (move, duplicate, delete, convert type)

#### Epic 1.2: Database Engine
**Goal:** Users can structure knowledge as typed records (e.g., "Books" database).

**Stories:**
- **Story 1.2.1:** Database schema & property type definitions
- **Story 1.2.2:** Table view (rows, columns, inline editing)
- **Story 1.2.3:** Gallery view (cards with customizable fields)
- **Story 1.2.4:** Filtering & sorting

#### Epic 1.3: Local RAG (Synthesis)
**Goal:** Users can ask questions and get grounded answers.

**Stories:**
- **Story 1.3.1:** Text chunking & embedding pipeline (MediaPipe)
- **Story 1.3.2:** SQLite-Vec integration (vector index)
- **Story 1.3.3:** Llama 3.2 model download & caching
- **Story 1.3.4:** Chat UI + response generation + citation mapping
- **Story 1.3.5:** Synthesis artifact generation (Brief, FAQ)

#### Epic 1.4: Import & Export
**Goal:** Users can bring in knowledge from external sources.

**Stories:**
- **Story 1.4.1:** Markdown import (parse structure)
- **Story 1.4.2:** PDF import + OCR
- **Story 1.4.3:** Web clip import
- **Story 1.4.4:** Export to Markdown/PDF/JSON

---

### 6.2 Phase 2: Knowledge Graph (Jun – Jul 2026)

#### Epic 2.1: Bidirectional Links & Backlinks
**Goal:** Notes reference each other; backlinks auto-generated.

**Stories:**
- **Story 2.1.1:** Link syntax parser (`[[Page Name]]`)
- **Story 2.1.2:** Backlinks sidebar (auto-resolve ambiguous references)
- **Story 2.1.3:** Unlinked references detection

#### Epic 2.2: Graph Visualization
**Goal:** Users see entire vault as a network.

**Stories:**
- **Story 2.2.1:** Skia-based graph renderer (10k+ nodes)
- **Story 2.2.2:** Force-directed layout algorithm (GPU-accelerated Worklet)
- **Story 2.2.3:** Clustering & color-coding by density
- **Story 2.2.4:** Search/filter graph by tag or query

#### Epic 2.3: Infinite Canvas
**Goal:** Users arrange notes and ideas spatially.

**Stories:**
- **Story 2.3.1:** Canvas surface (pan, zoom, infinite plane)
- **Story 2.3.2:** Card types (note preview, image, PDF excerpt)
- **Story 2.3.3:** Manual connections (edges) between cards
- **Story 2.3.4:** Auto-layout for overlapping nodes
- **Story 2.3.5:** Save/load multiple canvases

---

### 6.3 Phase 3: Agent Layer (Aug – Sep 2026)

#### Epic 3.1: Actionable Agent
**Goal:** AI can create pages, update databases, reorganize content.

**Stories:**
- **Story 3.1.1:** Agent action proposal interface (preview before execution)
- **Story 3.1.2:** Action execution & transaction log
- **Story 3.1.3:** Rollback functionality
- **Story 3.1.4:** Agent orchestration (prioritize, batch actions)

---

### 6.4 Phase 4: Sync & Ecosystem (Oct – Dec 2026)

#### Epic 4.1: Local Sync (CRDT Foundation)
**Goal:** Prepare architecture for future multi-device sync.

**Stories:**
- **Story 4.1.1:** CRDT operation log (append-only)
- **Story 4.1.2:** Conflict resolution strategy
- **Story 4.1.3:** Desktop app (Electron + same codebase)
- **Story 4.1.4:** Bluetooth sync between devices (local network)

---

## 7. Success Metrics & OKRs

### 7.1 Product OKRs (12-Month Horizon)

**Objective 1: Achieve Product-Market Fit**
- KR1: 500 active monthly users by Q4 2026.
- KR2: 4.5+ star rating on Google Play Store.
- KR3: Zero critical security incidents.

**Objective 2: Establish Local-First Leadership**
- KR1: "NeuralNote" ranks top 10 in App Store for "Knowledge Management" + "Offline Apps".
- KR2: 50+ blog posts/tutorials from community about local RAG features.
- KR3: 10k+ GitHub stars on companion open-source library (local RAG toolkit).

**Objective 3: User Retention & Engagement**
- KR1: 70% 7-day retention rate.
- KR2: Average 5+ blocks created per user per week.
- KR3: 30% of users utilize synthesis features weekly.

---

### 7.2 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Startup Latency** | <1.2s | Device: Pixel 6a, Cold start. |
| **Search Latency (10k blocks)** | <500ms | 90th percentile. |
| **Inference Latency (TTFT)** | <1.5s | Pixel 7, typical prompt. |
| **Memory Footprint** | <150MB | Baseline, no open notes. |
| **Test Coverage** | >80% | All non-UI code. |
| **Crash-Free Rate** | >99.5% | Google Play Console. |

---

## 8. Risk Assessment & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| **LLM Inference Too Slow** | High | Medium | Pre-optimize quantization; benchmark on target devices early. Test on Pixel 5 (2-year-old hardware). |
| **Vector Search Unscalable** | High | Low | `sqlite-vec` proven; prototype 100k blocks early. |
| **Graph Rendering Lag** | Medium | Medium | Use Skia Worklets from day 1; profile on low-end GPU. |
| **User Privacy Concern (still stores data locally)** | Medium | Low | Transparent encryption docs; published security audit by Q3. |
| **Battery Drain (AI inference)** | Medium | Medium | Inference happens only on user request; test power consumption. |
| **Adoption of Offline-First Paradigm** | High | Medium | Education: blog posts, video tutorials, Discord community. |

---

## 9. Appendices

### Appendix A: Glossary

- **Block:** An atomic unit of content (paragraph, list item, image, etc.).
- **Page:** A root-level note (collection of blocks).
- **Database:** A structured collection of records, each being a page with typed properties.
- **Backlink:** An auto-generated reference from Page B → Page A when A mentions B.
- **Canvas:** An infinite 2D space for spatial arrangement of notes.
- **Graph View:** Network visualization of all pages and their relationships.
- **RAG:** Retrieval-Augmented Generation; retrieves context from user's vault before LLM generation.
- **Grounded:** Responses are anchored to retrieved source material (citations provided).
- **Synthesis Artifact:** Auto-generated structured content (Brief, FAQ, Mind Map, Flashcard).

### Appendix B: Competitive Analysis

| Aspect | Notion | Obsidian | NotebookLM | NeuralNote |
|--------|--------|----------|------------|-----------|
| Mobile-First | ❌ | ❌ | ❌ | ✅ |
| Offline | ❌ | ✅ | ❌ | ✅ |
| Local LLM | ❌ | ❌ | ❌ | ✅ |
| Canvas | ❌ | ✅ | ❌ | ✅ |
| Synthesis | ❌ | ❌ | ✅ | ✅ |
| Free | ❌ | ✅ | ❌ | ✅* |

*Free with ads or optional pro tier (post-MVP).

---

## 10. Conclusion & Next Steps

**NeuralNote** reimagines knowledge work for privacy, speed, and offline autonomy. This PRD provides the complete specification for a **production-grade Android Super App** combining Notion's structured power, Obsidian's networked thinking, and NotebookLM's grounded synthesis—all without a backend.

### Next Steps

1. **Establish BMAD Governance** (Week 1)
   - Create `architecture.md`, `AGENTS.md`, `sweeping-validation.md`
   - Set up CI/CD with `scripts/validate.sh`

2. **Prototype Phase (Week 2–4)**
   - Scaffold Expo app; integrate op-sqlite, MediaPipe, ExecuTorch
   - Implement "Hello World" RAG (ingest note → embed → search → LLM response)

3. **Phase 1 Development (12 weeks)**
   - Follow Ralph Wiggum loop discipline
   - Deliver MVP with Block Editor, Database, Chat, Synthesis

4. **Community & Marketing (Concurrent)**
   - Launch blog; publish architecture decisions
   - Open Discord for early adopters

---

**Document Prepared By:** Product Architecture Team  
**Review Date:** 2026-01-15  
**Next Version:** v1.1 (post-MVP feedback loop)