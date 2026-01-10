# Plan: Phase 2 Knowledge Synthesis Station - Epics & Stories Update

## Overview
Update Phase 2 governance documents with **corrected Gemini 3.0 technical specifications** and **hybrid local/cloud embedding strategy** based on research findings (Dec 2025).

## ⚠️ CRITICAL CORRECTIONS (from Research)

### 1. Embedding Model - WRONG in Original
| What you provided | Research Finding | Action |
|-------------------|------------------|--------|
| `text-embedding-004` | **DEPRECATED** - Shuts down Jan 14, 2026 | Use `gemini-embedding-001` |

### 2. Live API Model - WRONG in Original
| What you provided | Research Finding | Action |
|-------------------|------------------|--------|
| `gemini-live-3.0-flash-preview` | **DOES NOT EXIST** - 3.0 has no Live API yet | Use `gemini-2.5-flash-native-audio-preview-12-2025` |
| `gemini-3.0-flash` | Only text/multimodal, no WebSocket | Use 2.5 for Live, 3.0 for text |

## ✅ CORRECTED Model Hierarchy (Dec 2025)

| Model | Use Case | Status |
|-------|----------|--------|
| `gemini-3.0-flash` | Text/RAG Chat (fast, cheap) | ✅ Live |
| `gemini-3.0-pro` | Deep synthesis (reasoning) | ✅ Live |
| `gemini-embedding-001` | Cloud embeddings | ✅ Live (replaces text-embedding-004) |
| `Xenova/all-MiniLM-L6-v2` | **LOCAL EMBEDDINGS** (Desktop only) | ✅ Transformers.js |
| `gemini-2.5-flash-native-audio-preview-12-2025` | Live Audio (WebSocket) | ✅ Current Live API |

---

## 🔬 NEW: Hybrid Embedding Strategy (Local + Cloud Fallback)

### Research Findings (Dec 2025)
- **Transformers.js** can run embedding models in-browser with WebGPU
- **Desktop**: Full WebGPU support, 100-500MB models OK, 10-50 embedding/sec
- **Mobile**: Limited WebGPU (Android OK, iOS partial), 50-200MB recommended, 2-10 embedding/sec
- **Quantization critical**: Q4 MiniLM (~90MB) works well for browsers

### Recommended Embedding Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Embedding Service                         │
│                    (Story 7.3)                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
           ┌──────────────┴──────────────┐
           │   Auto-detect capability    │
           └──────────────┬──────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
 Desktop              Mobile               Offline
 (WebGPU)            (Limited)            (Cached)
    │                     │                     │
    ├─ Transformers.js    ├─ Cloud API         ├─ Transformers.js
    ├─ MiniLM Q4          │  (gemini-embed)    │─ MiniLM Q4
    ├─ ~90MB model        │                    │
    ├─ 100% offline       │                    │
    │                     │                    │
    ▼                     ▼                    ▼
```

### Embedding Provider Selection Logic

| Condition | Provider Used | Model |
|-----------|---------------|-------|
| Desktop + WebGPU + Model cached | **Local** | `Xenova/all-MiniLM-L6-v2` |
| Desktop + WebGPU + No cache | **Local** (downloads on first use) | `Xenova/all-MiniLM-L6-v2` |
| Mobile (any) | **Cloud Fallback** | `gemini-embedding-001` |
| Desktop + No WebGPU | **Cloud Fallback** | `gemini-embedding-001` |
| No API key + No WebGPU | **BM25 only** (no embeddings) | - |

### User Experience Flow
1. **First run on Desktop**: Prompts to download local embedding model (~90MB)
2. **User confirms**: Model downloads to IndexedDB, subsequent runs are offline
3. **Mobile or no WebGPU**: Automatically uses cloud API, no download prompt
4. **No API key + no WebGPU**: Shows warning, works with BM25 keyword search only

---

## 📱 Feature Exclusivity Strategy (Desktop vs Mobile)

### Desktop-Only Features (Requires Full Resources)
| Feature | Epic | Reason |
|---------|------|--------|
| Knowledge Canvas editing | Epic 8 | Complex node graphs, heavy DOM manipulation |
| PDF annotation/highlighting | Epic 6 | Requires precise mouse interaction |
| Local embedding model download | Epic 7 | Large download (~90MB), WebGPU required |
| Live Voice Chat (WebSocket) | Epic 10 | Bandwidth + processing requirements |

### Mobile-Optimized Features (Primary Experience)
| Feature | Epic | Notes |
|---------|------|-------|
| Source ingestion (PDF/URL/Text) | Epic 6 | Works with file picker |
| Flashcard study mode | Epic 9 | Touch-friendly, offline-first |
| Audio overview playback | Epic 10 | Background playback works |
| RAG Chat (text) | Epic 10 | Semantic search via cloud fallback |
| Source preview | Epic 6 | Read-only, optimized for mobile |
| Canvas VIEW mode | Epic 8 | Read-only, pan/zoom only |

### Shared Features (Cross-Platform)
| Feature | Implementation |
|---------|----------------|
| Source management (delete/rename) | Both platforms, same UI |
| Collection organization | Both platforms, same UI |
| Search (hybrid BM25 + vector) | Cloud embeddings on mobile |
| Quiz taking | Responsive design |

---

## 📋 Updated Files to Modify

| File | Change |
|------|--------|
| `_bmad-output/epics.md` | Update Stories 7.3, 7.6, 10.1, 10.2, 10.3 with corrected models + hybrid embedding |
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | Add new stories (7.6, 10.1, 10.2) |
| `src/lib/agent/providers/model-registry.ts` | Add `gemini-3.0-flash`, `gemini-embedding-001` |
| `src/lib/agent/providers/gemini-config.ts` | Create/update with 3.0 config + embedding endpoints |
| `src/lib/rag/embedding-service.ts` | **NEW**: Hybrid local/cloud embedding service |
| `src/lib/rag/transformers-loader.ts` | **NEW**: Transformers.js model loader |

---

## 🔧 Story 7.3 - CORRECTED: Embedding Service Integration (Hybrid)

**As a** user wanting semantic search,
**I want** embeddings generated locally on desktop or via cloud on mobile,
**So that** the system works offline on desktop while being accessible everywhere.

**Acceptance Criteria:**

**Given** the app loads,
**When** it detects WebGPU support,
**Then** it checks for cached Transformers.js model in IndexedDB

**Given** a chunk is ready for embedding,
**When** running on Desktop with WebGPU and cached model,
**Then** use **local embeddings** (Transformers.js + MiniLM Q4)
**And** no API calls are made
**And** embedding takes ~10-50ms per chunk

**Given** running on Mobile OR no WebGPU,
**When** embedding is needed,
**Then** use **cloud API** (`gemini-embedding-001`)
**And** progress shows "Generating embeddings via cloud..."
**And** embeddings are stored locally after download

**Given** user has no API key and no WebGPU,
**When** they try semantic search,
**Then** show warning: "Semantic search requires API key or desktop browser with WebGPU"
**And** BM25 keyword search works normally
**And** option to switch to keyword-only mode

**Given** local embedding model not cached,
**When** on Desktop,
**Then** prompt user: "Download local embedding model (~90MB) for offline semantic search?"
**And** if confirmed, download and cache in IndexedDB
**And** if declined, use cloud fallback

**Demo Checkpoint:** 🖥️ Desktop: "Using local embeddings (offline)" → 📱 Mobile: "Using cloud embeddings"

---

## 📋 Story 7.6 - NEW: "Deep Think" Synthesis Block

**As a** researcher,
**I want** to use Gemini 3.0's reasoning capabilities,
**So that** I can get a synthesis of contradicting papers.

**Acceptance Criteria:**
*   **Given** a prompt asking to compare multiple sources,
*   **When** the user holds the "Generate" button (Long Press),
*   **Then** switch the model from `gemini-3.0-flash` to `gemini-3.0-pro`.
*   **And** display a "Deep Thinking" UI state while the model reasons.
*   **And** output a structured Markdown comparison table with citations.

**Platform Note:** Desktop-only feature (high compute requirements)

---

## 🎙️ Story 10.1 - CORRECTED: Live API WebSocket Manager

```typescript
// CORRECT endpoint for Live API (still 2.5-based)
const GEMINI_MODELS = {
  flash: 'gemini-3.0-flash',
  pro: 'gemini-3.0-pro',
  live: 'gemini-2.5-flash-native-audio-preview-12-2025',  // Still 2.5!
  embedding: 'gemini-embedding-001'
};

const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
```

**Platform Note:** Desktop-only feature (WebSocket bandwidth + processing)

---

## 🎙️ Story 10.2 - NEW: Multimodal Source Vision (Desktop Only)

**As a** student asking about a diagram,
**I want** Gemini to "see" the PDF page I'm looking at,
**So that** it can explain charts and graphs in real-time.

**Acceptance Criteria:**
*   **Given** the user is viewing a specific PDF page,
*   **When** they ask a question via voice (Desktop Live API),
*   **Then** the client captures the current viewport as a base64 JPEG (using `pdf.js`).
*   **And** sends it in the `clientContent` WebSocket frame alongside the audio chunk.
*   **And** the model references the visual content in its audio response.

**Platform Note:** Desktop-only (WebSocket required, high bandwidth)

---

## 🎙️ Story 10.3 - CORRECTED: Audio Overview Generator

**As a** learner,
**I want** a "Deep Dive" audio summary generated,
**So that** I can listen to a podcast-style discussion offline.

**Acceptance Criteria:**
*   **Given** a set of selected notes/PDFs,
*   **When** user clicks "Generate Audio",
*   **Then** call the REST API with model `gemini-3.0-flash`.
*   **And** set config: `response_modalities: ["AUDIO"]` and `speech_config.voice_name: "Aoede"`.
*   **And** use system prompt: *"Create a lively 2-person dialogue debating key points."*
*   **And** save the audio blob to IndexedDB for offline playback.

**Mobile Note:** Works on mobile via cloud API, audio playback is mobile-optimized

---

## 🎨 Epic 8 - CORRECTED: Knowledge Canvas with Platform Notes

### Desktop Features (Full Capability)
- Create/edit nodes and connections
- Drag from sidebar to canvas
- Auto-arrange functionality
- Export to PNG/JSON

### Mobile Features (Read-Only)
- View canvas (pan/zoom)
- View node details on tap
- **Show tooltip**: "Edit on desktop"

---

## 📊 Updated Sprint Calendar

| Sprint | Epic | Platform Focus |
|--------|------|----------------|
| Sprint 7 | Epic 7: RAG | **Hybrid embedding service** (Local + Cloud) |
| Sprint 8 | Epic 8: Canvas | Desktop creation, mobile view |
| Sprint 9 | Epic 9: Study | Mobile-first (flashcards work offline) |
| Sprint 10 | Epic 10: Chat | Desktop voice, mobile text + audio playback |

---

## ⚠️ Deprecation Timeline

| Component | Deadline | Action Required |
|-----------|----------|-----------------|
| `text-embedding-004` | Jan 14, 2026 | Migrate to `gemini-embedding-001` |
| `gemini-2.5-pro-native-audio` | TBD | Monitor for 3.0 availability |

---

## ✅ EXECUTION ACTION SUMMARY

### Phase 2 Governance Documents Update (IN ORDER)

#### Step 1: Update `_bmad-output/epics.md`

| Story | Current State | Action |
|-------|--------------|--------|
| **7.3** (line 1313) | Basic embedding service | REPLACE with hybrid local/cloud embedding criteria |
| **7.4** (line 1344) | Hybrid Retrieval Tool | Keep, add desktop/mobile notes |
| **7.5** (line 1372) | RAG Chat Integration | Keep, add citation deep-link details |
| **7.6** (NEW) | N/A | INSERT after 7.5: "Deep Think" Synthesis Block using `gemini-3.0-pro` |
| **8.1** (line 1422) | React Flow Canvas | ADD platform notes (desktop edit, mobile view) |
| **10.1** (line 1702) | "Multi-Source Synthesis Chat" | REWRITE: Live API WebSocket Manager (Desktop-only) |
| **10.2** (line 1730) | "Source-Grounded Q&A" | REWRITE: Multimodal Source Vision (Desktop-only, WebSocket) |
| **10.3** (line 1758) | Audio Overview Generator | CORRECT: Use `gemini-3.0-flash` not `gemini-3.0-pro` |

#### Step 2: Update `_bmad-output/sprint-artifacts/sprint-status.yaml`

Add new stories:
```yaml
  7-5-rag-chat-integration: done
  7-6-deep-think-synthesis: backlog  # NEW: gemini-3.0-pro reasoning mode
  10-1-live-api-websocket: backlog   # NEW: Desktop-only WebSocket voice
  10-2-multimodal-vision: backlog    # NEW: PDF viewport capture + send
```

#### Step 3: Update Code Files

**Files to CREATE:**
- `src/lib/rag/embedding-service.ts`
- `src/lib/rag/transformers-loader.ts`
- `src/lib/rag/embedding-config.ts`
- `src/lib/providers/local-embedding-provider.ts`
- `src/lib/providers/cloud-embedding-provider.ts`

**Files to UPDATE:**
- `src/lib/agent/providers/model-registry.ts` - Add `gemini-3.0-flash`, `gemini-3.0-pro`, `gemini-embedding-001`
- `src/lib/agent/providers/gemini-config.ts` - Add Live API WebSocket config

---

## 📋 Validation Summary

| Item | Status | Source |
|------|--------|--------|
| `text-embedding-004` deprecation | ✅ Verified | Google docs, shuts down Jan 14, 2026 |
| `gemini-embedding-001` replacement | ✅ Verified | Active, replaces deprecated model |
| Gemini 3.0 Live API existence | ✅ Confirmed | Does NOT exist - use 2.5 for WebSocket |
| Local embeddings feasibility | ✅ Confirmed | Transformers.js + WebGPU works |
| MiniLM model size | ✅ Verified | Q4 quantized ~90MB, 384 dimensions |
| Mobile embedding fallback | ✅ Confirmed | Cloud API works, no local model |

---

**Plan Status:** READY FOR IMPLEMENTATION
**Next Step:** Exit plan mode, begin Step 1 (update epics.md)
