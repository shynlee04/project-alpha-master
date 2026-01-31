# Sprint Change Proposal: Multimodal Chat & UX Foundation

**Date:** 2026-01-09
**Trigger:** Critical UX issues + missing multimodal capabilities
**Severity:** HIGH
**Status:** DRAFT - Pending Approval

---

## Executive Summary

Current sprint validation is producing **false positives**. Stories marked "complete" have:
- 79 TypeScript errors (claimed: 0)
- E2E tests failing (claimed: passing)
- UX that "renders but is trash"

This proposal addresses **root causes** and defines a new sprint focused on **working features** rather than "completed stories."

---

## Part 1: Chat Architecture Analysis

### Current State: TWO Chat Systems

#### System 1: Cross-Workspace Threaded Chat
**Location:** `src/infrastructure/persistence/stores/conversation/`

**Components:**
- `thread-management-slice.ts` - Thread CRUD with hierarchy
- `useConversationStore.ts` - Zustand store for conversation state
- `ChatPanel.tsx` - Threaded chat UI component

**Key Capabilities:**
```typescript
// Thread hierarchy with parent/child relationships
interface ThreadWithId {
  id: string;
  conversationId: string;
  parentThreadId: string | null;
  isRoot: boolean;
  childThreadIds: string[];
  status: 'active' | 'archived' | 'deleted';
}
```

**Features:**
- Thread creation, deletion, hierarchy traversal
- Cross-workspace thread sharing
- Auto-persist to IndexedDB (debounced 500ms)

#### System 2: Agent-Centric Chat (Tool Execution)
**Location:** `src/presentation/components/ide/AgentChatPanel.tsx`

**Components:**
- `AgentChatPanel.tsx` - Main agent chat interface
- `use-agent-chat-with-tools.ts` - TanStack AI integration
- `execute-command-tool.ts` - Tool execution with approval
- Tool facades for file system, terminal operations

**Key Capabilities:**
```typescript
// Agent chat with tools
interface AgentChatPanelProps {
  projectId: string | null;
  projectName?: string;
  workspaceType?: 'ide' | 'notes' | 'knowledge' | 'study';
}
```

**Features:**
- Real TanStack AI streaming (not mock)
- Tool execution with approval flow
- Workspace-specific system prompts
- Active note content injection

### The Problem: DUPLICATE & DISCONNECTED

| Issue | Evidence | Impact |
|-------|----------|--------|
| Two separate chat UIs | `ChatPanel.tsx` vs `AgentChatPanel.tsx` | User confusion |
| Thread management NOT used in agent chat | No thread CRUD in agent flow | Lost conversation context |
| No shared state | Separate stores, no sync | Inconsistent experience |

### Required Fix: Unified Chat Architecture

```yaml
unified_chat:
  single_entry_point: "UnifiedChatPanel.tsx"
  modes:
    - threaded: "Cross-workspace conversations"
    - agent: "Tool-enabled agent chat"
  shared_state:
    - thread_store: "conversation/useConversationStore"
    - message_store: "conversation/message-crud-slice"
  tool_integration:
    - agent_mode: "Adds tool execution to threaded chat"
    - permission_system: "workspace-specific tool access"
```

---

## Part 2: Multimodality Integration (Gemini 2.0 + TanStack AI)

### Research Findings

#### Gemini 2.0 Flash Capabilities (from web search)

| Modality | Input | Output | Status |
|----------|-------|--------|--------|
| Text | ✅ | ✅ | Fully supported |
| Images | ✅ | ✅ | Fully supported |
| Audio | ✅ | ✅ | Live API supports |
| Video | ✅ | ✅ | Live API supports |
| PDF/Documents | ✅ | ❌ | Text extraction only |
| Code | ✅ | ✅ | Syntax aware |

**Token Limits:**
- Input: 1,048,576 tokens (1M context!)
- Output: 8,192 tokens default

#### TanStack AI Multimodal Support

**Current Installation (from package.json):**
```json
"@tanstack/ai": "^0.2.0",
"@tanstack/ai-gemini": "^0.2.0",
"@tanstack/ai-react": "^0.2.0"
```

**Multimodal Content Guide:** https://tanstack.com/ai/latest/docs/guides/multimodal-content

### Required Implementation

#### 1. Image Input (User → AI)

```typescript
// TanStack AI multimodal message structure
import { createTool } from '@tanstack/ai';

// User sends image with prompt
const message = {
  role: 'user',
  content: [
    { type: 'text', text: 'What do you see in this image?' },
    { type: 'image', image: new URL(fileURL) }
  ]
};
```

#### 2. Image Generation (AI → User)

**Options:**
- Gemini Imagen (via Gemini API)
- OpenAI DALL-E (via @tanstack/ai-openai)

```typescript
// Image generation tool
const generateImageTool = createTool({
  description: 'Generate an image from a text description',
  parameters: z.object({
    prompt: z.string(),
    style: z.enum('realistic', 'artistic', 'sketch').optional(),
  }),
  execute: async ({ prompt, style }) => {
    // Call Gemini Imagen or DALL-E
    const result = await generateImage({ prompt, style });
    return { imageUrl: result.url };
  }
});
```

#### 3. Audio Input/Output

**Input (Speech-to-Text):**
- Gemini Live API for real-time transcription
- `AudioCaptureHandler` already exists in `src/lib/rag/audio-capture.ts`

**Output (Text-to-Speech):**
- Gemini Live API for audio response
- `AudioPlaybackHandler` already exists in `src/lib/rag/audio-playback.ts`

#### 4. Document Processing (PDF)

**Current state:** `gemini-pdf-processor.ts` exists at `src/lib/knowledge/`

**Gap:** Need to expose PDF upload in chat interface

### Key Vault Integration

**Current Implementation:** `src/lib/agent/providers/credential-vault.ts`

**Required:** Extend vault for each modality
```typescript
interface ModalityConfig {
  name: 'text' | 'image' | 'audio' | 'video' | 'pdf';
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  apiKey: string; // Stored in vault
  enabled: boolean;
}
```

---

## Part 3: RAG + Embedding + Chunking for Notes

### Current Implementation

**Location:** `src/lib/rag/index.ts`

**Existing Components:**
```typescript
// Core RAG services
export { createIndex, indexDocument, searchIndex } from './orama-index';
export { DocumentChunker } from './document-chunker';
export { createEmbeddingService } from './embedding-service';
export { hybridSearch } from './hybrid-retriever';
export { RAGChat } from './rag-chat';

// Chunking strategies
export {
  FixedSizeChunker,
  SemanticChunker,
  RecursiveChunker
} from './chunk-strategies';
```

**Domain Entities:** `src/domain/entities/rag.ts`
```typescript
interface RagCollection {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
}

interface RagDocument {
  id: string;
  collectionId: string;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'indexed' | 'error';
}

interface RagChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  index: number;
}
```

### The Gap: RAG NOT INTEGRATED INTO NOTES

**Current Notes Block System:**
- `CodeFileBlock.tsx` - Code highlighting (custom tokenizer, NOT Monaco!)
- `ImageBlock.tsx` - Image URL embedding
- `FileAttachmentBlock.tsx` - File attachments

**Missing:**
1. Auto-chunking when notes are created/modified
2. Auto-embedding with vector storage
3. RAG retrieval in notes chat
4. Citations linking chat → note blocks

### Required Implementation

```yaml
notes_rag_pipeline:
  on_note_create:
    - detect_content_type: "code, image, text, pdf"
    - chunk_content: "DocumentChunker"
    - generate_embeddings: "createEmbeddingService"
    - store_in_orama: "indexDocument"

  on_chat_query:
    - retrieve_chunks: "hybridSearch"
    - rank_results: "RRFFusion"
    - format_citations: "CitationFormatter"
    - inject_context: "buildPrompt"
```

---

## Part 4: Prompt Engineering & Page Context

### Current System

**Location:** `src/lib/agent/system-prompt.ts`

**Two-Layer Architecture:**
1. **TOOL CONSTITUTION** (hidden) - Rules for tool usage
2. **AGENT MODE** (selectable) - Persona + cognitive phase

**Modes:**
- `solo-dev` - Quick Flow Solo Dev
- `code` - Pure executor
- `notes` - Note-taking assistant

### The Gap: NO PAGE CONTEXT INJECTION

**Current AgentChatPanel.tsx:**
```typescript
// Active note content IS injected (lines 112-142)
const activeNote = workspaceType === 'notes' ? useActiveNote() : null;
// ... adds note content to system prompt
```

**But Missing:**
1. **DOM Context** - What elements are visible?
2. **User Intent** - What is the user trying to accomplish?
3. **Page State** - What panel is active? What file is open?

### Required: Multi-Step Prompt Transformation

**User Request:**
```
"improve this image"
```

**Agent Should Do:**
```
Step 1: Analyze current image context
  - What image is visible?
  - What is the current state?

Step 2: Generate improvement prompt
  - Based on image content
  - Based on user intent

Step 3: Execute image generation
  - Call image generation tool
  - With enhanced prompt

Step 4: Present result
  - Show new image
  - Allow iteration
```

**Required Enhancement:**
```typescript
// Multi-step transformation middleware
async function transformUserPrompt(
  originalPrompt: string,
  pageContext: PageContext,
  conversationHistory: Message[]
): Promise<EnhancedPrompt> {

  // Step 1: Analyze intent
  const intent = await classifyIntent(originalPrompt);

  // Step 2: Extract page context
  const context = await extractPageContext(pageContext);

  // Step 3: Build enhanced prompt
  const enhanced = await buildEnhancedPrompt({
    original: originalPrompt,
    intent,
    context,
    history: conversationHistory.slice(-5)
  });

  return enhanced;
}
```

---

## Part 5: Note Blocks - Current vs Required

### Current State

| Block Type | Implementation | Issue |
|------------|----------------|-------|
| **Code** | `CodeFileBlock.tsx` with custom tokenizer | NOT Monaco! Basic highlighting only |
| **Image** | `ImageBlock.tsx` with URL input | No upload/drag-drop |
| **File** | `FileAttachmentBlock.tsx` | Basic attachment |
| **URL** | None | No embed preview |

### Monaco Editor Integration

**Already Installed:**
```json
"@monaco-editor/react": "^4.7.0",
"monaco-editor": "^0.55.1"
```

**Already Used In:**
- `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx`

**Required:** Port Monaco to NoteEditor

```typescript
// Replace custom tokenizer with Monaco
import Editor from '@monaco-editor/react';

function CodeMonacoBlock({ code, language }) {
  return (
    <Editor
      height="200px"
      language={language}
      value={code}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      }}
    />
  );
}
```

### URL Embedding Required

**Features:**
```typescript
// Detect URLs in note content
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

// Fetch embed preview
async function fetchUrlPreview(url: string) {
  const response = await fetch(`/api/embed/preview?url=${url}`);
  const { title, description, image } = await response.json();
  return { title, description, image };
}

// Render embed card
function UrlEmbedCard({ url, preview }) {
  return (
    <a href={url} className="url-embed-card" target="_blank">
      <img src={preview.image} alt={preview.title} />
      <div>
        <h4>{preview.title}</h4>
        <p>{preview.description}</p>
        <span>{new URL(url).hostname}</span>
      </div>
    </a>
  );
}
```

---

## Part 6: UX/UI Consistency Issues (From Vision Analysis)

### Critical Issues Found

#### 1. Layout & Flex Problems

| Issue | Location | Fix Required |
|-------|----------|-------------|
| Button crushed (`agt_defa...`) | Left panel header | Add `min-width`, `flex-wrap` |
| Input area disconnect | Left bottom (input) vs right (chat) | Move input to right panel or unify |
| Grid misalignment | Headers across 3 columns | Standardize header heights |

#### 2. Resize Behavior

**What Breaks on Panel Resize:**
- Left panel: `agt_defa` button vanishes
- Right panel: `Enhance mimo-v2...` truncates to 1 char
- Sync status overlay: Clips out of bounds

**Required Fix:**
```css
/* Responsive panel headers */
.panel-header {
  display: flex;
  flex-wrap: wrap;
  min-height: 48px;
  align-items: center;
  gap: 8px;
}

.panel-header button {
  min-width: 80px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Truncation with tooltip */
.truncatable {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

.truncatable[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}
```

#### 3. Z-Index Issues

| Element | Current | Issue | Fix |
|---------|---------|-------|-----|
| Sync status overlay | High z-index | Blocks chat messages | Make dismissible toast |
| "Chọn" dropdown | Unknown | May be covered | Ensure z-index: 1000 |

#### 4. Dark Theme Inconsistencies

| Issue | Location | Fix |
|-------|----------|-----|
| Language mixing | Vietnamese + English | Choose ONE language |
| Input field low contrast | Bottom left input | Add border or lighter bg |
| Accent color split | Orange + blue | Use orange only for primary |

---

## Part 7: Validation System Overhaul

### The Root Problem

**Current "Validation" is just checkbox checking:**
1. Agent writes code
2. Agent writes "code review" rubber-stamping itself
3. Agent writes "validation report" with fake checkboxes
4. Story marked "complete"
5. **Reality: Tests fail, TypeScript errors, UX broken**

### Required: Actual Verification

```yaml
governance_v2:
  before_marking_complete:
    typescript:
      command: "pnpm typecheck"
      must_pass: true
      zero_errors_allowed: true

    e2e_tests:
      command: "pnpm exec playwright test e2e/journeys/{story}/"
      must_pass: true

    visual_review:
      requires: "screenshot attachment"
      approved_by: "human OR different agent"

    ux_review:
      check_touch_targets: ">=44px"
      check_text_truncation: "with tooltips"
      check_resize_behavior: "no breakage"
```

---

## Sprint Proposal: EPIC-MM (Multimodal + UX Fix)

### Epic Breakdown

#### MM-01: Fix Validation System (P0, 4h)
- Create actual verification script
- Update workflow to require real test execution
- Retroactively validate all "complete" stories

#### MM-02: Unified Chat Architecture (P0, 8h)
- Merge threaded chat + agent chat
- Shared state management
- Thread persistence in agent mode

#### MM-03: UX Foundation Fixes (P1, 12h)
- Panel header flex fixes
- Text truncation with tooltips
- Resize behavior fixes
- Language consistency (English default)

#### MM-04: Image Input (P1, 8h)
- TanStack AI multimodal integration
- Image upload in chat
- Image analysis by agent

#### MM-05: Image Generation (P1, 8h)
- Gemini Imagen or DALL-E integration
- Tool for image generation
- Iterative image improvement workflow

#### MM-06: Audio I/O (P2, 8h)
- Speech-to-text input
- Text-to-speech output
- Gemini Live API integration

#### MM-07: Monaco in Notes (P1, 6h)
- Replace custom tokenizer
- Full syntax highlighting
- Language auto-detection

#### MM-08: URL Embedding (P2, 4h)
- URL detection in notes
- Embed preview fetch
- Embed card component

#### MM-09: RAG in Notes (P1, 12h)
- Auto-chunking on note save
- Auto-embedding with vector storage
- RAG retrieval in notes chat
- Citation linking

#### MM-10: Page Context Injection (P1, 8h)
- DOM context extraction
- User intent classification
- Multi-step prompt transformation
- Sequential image generation workflow

### Total Effort: ~78 hours (~2 weeks)

---

## Recommendation

**Option Selected:** Create new EPIC-MM sprint

**Rationale:**
1. Current validation is fundamentally broken
2. UX issues damage user trust
3. Multimodal features are table stakes for 2025
4. RAG in notes enables knowledge management

**Next Steps:**
1. Approve this Sprint Change Proposal
2. Run `/bmad:bmm:workflows:sprint-planning` for EPIC-MM
3. Execute with REAL verification (not fake checkboxes)

---

**Sources:**
- Gemini 2.0 Flash docs: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-0-flash
- TanStack AI Multimodal: https://tanstack.com/ai/latest/docs/guides/multimodal-content
- TanStack AI GitHub: https://github.com/TanStack/ai
- Codebase analysis: grep/find/read of 100+ files

**Artifacts Generated:**
- `_bmad-output/research/sprint-change-proposal-multimodal-chat-fix-2026-01-09.md`
