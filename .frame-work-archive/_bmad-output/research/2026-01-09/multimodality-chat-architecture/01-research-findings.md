# Multimodality & Cross-Workspace Chat Architecture - Deep Research

**Date:** 2026-01-09
**Output:** `_bmad-output/research/2026-01-09/multimodality-chat-architecture/`
**Research Type:** Architecture & Tech-Spec

---

## Executive Summary

This research addresses critical gaps in the current implementation of:
1. **Cross-workspace chat architecture** with unified thread management
2. **Full multimodal support** (images, documents, voice/audio, video) via Gemini 2026 API
3. **Agent CRUD capabilities** with file system permissions
4. **Note block system** for code, images, and embedded URLs
5. **UX/UI consistency** for draggable panels and responsive layouts

**Key Findings:**
- Cross-workspace chat infrastructure EXISTS but needs unification
- TanStack AI already supports TTS, transcription, and multimodal content
- Note blocks lack code/image/embed rendering (only basic BlockNote blocks)
- UX/UI needs consistency improvements for nested components

---

## 1. Current System Analysis

### 1.1 Cross-Workspace Chat Architecture (E1 Epic)

**Files Examined:**
- `src/routes/api/chat.ts` - Server-side chat API
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts` - Client-side chat hook
- `src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx` - E2E tests

**Existing Implementation:**
```typescript
// Separate chat conversations per workspace
const conversations = {
  ide: [{ id: '1', role: 'user', content: 'Help me code' }],
  notes: [],
  knowledge: [],
  study: [],
};

// Cross-workspace event bus
crossWorkspaceEventBus.emit('workspace:change', { from: 'ide', to: 'notes' });

// Workspace-specific tool filtering
const mockAgent = {
  toolPermissions: {
    'tool-terminal': { ide: true, notes: false, knowledge: true, study: true },
    'tool-read-file': { ide: true, notes: true, knowledge: true, study: true },
  },
};
```

**Architecture Strengths:**
1. ✅ Chat state isolation per workspace
2. ✅ Cross-workspace event bus implemented
3. ✅ Tool permissions per workspace
4. ✅ Chat persistence to IndexedDB
5. ✅ Mobile full-screen overlay (z-50)

**Gaps Identified:**
1. ❌ No unified thread management across workspaces
2. ❌ Chat flow rendering not integrated with IDE (needs architecture doc)
3. ❌ Agent CRUD permissions not fully documented in architecture

---

### 1.2 Agent CRUD Capabilities

**Files Examined:**
- `src/domain/services/agent-orchestration-service.ts`
- `src/lib/agent/tools/process-image-tool.ts`
- `src/lib/agent/facades/file-tools-impl.ts`
- `src/lib/agent/facades/terminal-tools-impl.ts`

**Current Tool System:**
```typescript
// TanStack AI tool definitions
export const processImageDef = toolDefinition({
  name: 'process_image',
  description: 'Process an image file to extract text via OCR...',
  inputSchema: ProcessImageInputSchema,
  needsApproval: false, // Image processing is safe
});

export const readFileDef = toolDefinition({
  name: 'read_file',
  description: 'view_file the contents of a file...',
  inputSchema: z.object({ path: z.string() }),
  needsApproval: true, // File read requires permission
});
```

**Implemented Tools:**
| Tool | Workspace Permissions | Approval Required |
|------|----------------------|-------------------|
| read_file | ide, notes, knowledge, study | No |
| write_file | ide, knowledge, study | Yes |
| list_files | ide, notes, knowledge, study | No |
| execute_command | ide only | Yes |
| process_image | knowledge only | No |
| process_pdf | knowledge only | No |
| process_url | knowledge only | No |
| synthesize | knowledge only | No |

**Gaps:**
1. ❌ No voice/audio input tools (speech-to-text)
2. ❌ No text-to-speech output tools
3. ❌ Agent CRUD permissions need explicit architecture documentation

---

### 1.3 Multimodal Content System

**Files Examined:**
- `src/lib/agent/multimodal/message-builder.ts`
- TanStack AI documentation (`@tanstack/ai`)

**Current Implementation:**
```typescript
// Multimodal message builder
export function buildMultimodalMessage(
  text: string,
  images?: ImageContent[]
): CoreMessage {
  const content: MultimodalContent[] = [
    { type: 'text', text },
    ...images.map(img => ({
      type: 'image',
      source: { type: 'data', value: img.base64 },
      metadata: { mimeType: img.mimeType || 'image/jpeg' },
    })),
  ];
  return { role: 'user', content };
}

// Image content interface
interface ImageContent {
  base64: string;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}
```

**TanStack AI Multimodal Support (from docs):**

| Provider | Text | Image | Audio | Video | Document |
|----------|------|-------|-------|-------|----------|
| OpenAI (GPT-4o) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Anthropic (Claude 3.5) | ✅ | ✅ | ❌ | ❌ | ✅ (PDF) |
| Gemini 1.5/2.0 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ollama | ✅ | ✅ | ❌ | ❌ | ❌ |

**TanStack AI TTS Support:**
```typescript
// Text-to-Speech
import { generateSpeech } from '@tanstack/ai'
import { openaiTTS } from '@tanstack/ai-openai'

const result = await generateSpeech({
  adapter: openaiTTS('tts-1'),
  text: 'Hello, welcome!',
  voice: 'alloy', // or: echo, fable, onyx, nova, shimmer, ash, ballad, coral, sage, verse
  format: 'mp3', // or: opus, aac, flac, wav, pcm
});

// Transcription (Speech-to-Text)
import { generateTranscription } from '@tanstack/ai'
import { openaiTranscription } from '@tanstack/ai-openai'

const result = await generateTranscription({
  adapter: openaiTranscription('whisper-1'),
  audio: audioFile,
  language: 'en',
  modelOptions: {
    response_format: 'verbose_json',
    include: ['word', 'segment'],
  },
});
```

**Gaps:**
1. ❌ No TTS (text-to-speech) tool implementation
2. ❌ No transcription (speech-to-text) tool implementation
3. ❌ No voice input in chat UI
4. ❌ No audio output in chat UI
5. ❌ Prompt injection techniques not implemented
6. ❌ Sequential image generation workflow not implemented

---

### 1.4 Note Block System

**Files Examined:**
- `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts`
- `src/lib/knowledge/note-chunker.ts`

**Current Implementation:**
```typescript
// Markdown to BlockNote conversion
export function markdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  // Supports: headings (##, ###), lists (-, 1.), quotes (>), paragraphs
  return blocks;
}

// RAG chunking with type detection
function detectChunkType(content: string): 'header' | 'paragraph' | 'list' | 'code' {
  if (trimmed.startsWith('```')) return 'code';
  if (/^[\s\t]*[*-]\s/.test(trimmed)) return 'list';
  if (/^#{1,3}\s/.test(trimmed)) return 'header';
  return 'paragraph';
}
```

**Block Types Supported:**
| Block Type | Description | Notes |
|------------|-------------|-------|
| heading | H1, H2, H3 headings | ✅ Supported |
| paragraph | Plain text paragraphs | ✅ Supported |
| bulletListItem | Bullet points | ✅ Supported |
| numberedListItem | Numbered lists | ✅ Supported |
| quote | Block quotes | ✅ Supported |
| code | Code blocks | ⚠️ Detected for RAG, NOT rendered |
| image | Image blocks | ❌ Not implemented |
| embed | Embedded URLs | ❌ Not implemented |

**Gaps:**
1. ❌ Code blocks not rendered (only detected for RAG chunking)
2. ❌ No image block rendering
3. ❌ No embedded URL/oEmbed support
4. ❌ Monaco editor integration for code blocks missing
5. ❌ Image block with syntax highlighting for file content

---

### 1.5 UX/UI Analysis

**Files Examined:**
- `agent-os/standards/frontend/css.md`
- `src/presentation/components/notes/NotesPage.tsx`
- Various mobile layout components

**Current 8-bit Design System:**
```css
:root {
  /* Panel sizes */
  --panel-sidebar-width: 280px;
  --panel-explorer-width: 260px;
  --panel-chat-width: 360px;
  --panel-terminal-height: 200px;

  /* Z-index scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

**Current Flex Layout Patterns:**
```tsx
// From NotesPage.tsx
<div className="h-full flex flex-col">
  <header className="flex-shrink-0 h-14 flex items-center justify-between">
    <div className="flex items-center gap-2">
    </div>
  </header>
  <main className="flex-1 overflow-hidden relative">
  </main>
</div>
```

**Issues Identified:**
1. ❌ Draggable panels can cause inner elements to collapse/mis-shape
2. ❌ Text truncation with "..." needs consistent implementation
3. ❌ Tooltips on hover not consistently implemented
4. ❌ No consistent z-index management for nested components
5. ❌ Mobile: visual viewport API not fully integrated
6. ❌ Tab-content for multiple images not supported

---

## 2. Knowledge Synthesis

### 2.1 Architecture Diagram (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                    Cross-Workspace Event Bus                  │
│  (workspace:change, agent:tool:started, etc.)                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │   IDE    │       │  Notes   │       │Knowledge │
    │ Workspace│       │ Workspace│       │Workspace │
    └──────────┘       └──────────┘       └──────────┘
          │                   │                   │
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ Chat API │       │ Chat API │       │ Chat API │
    │ /api/chat│       │ /api/chat│       │ /api/chat│
    └──────────┘       └──────────┘       └──────────┘
          │                   │                   │
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ File Tools│       │Read Files│       │Process   │
    │Terminal   │       │Search    │       │Image/PDF │
    └──────────┘       └──────────┘       └──────────┘
```

### 2.2 Architecture Diagram (Target)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Unified Thread Management                         │
│  (Shared across IDE, Notes, Knowledge - synchronized via Event Bus) │
└─────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │   IDE    │       │  Notes   │       │Knowledge │
    │Workspace │       │Workspace │       │Workspace │
    └──────────┘       └──────────┘       └──────────┘
          │                   │                   │
    ┌─────────────────────────────────────────────────────────────┐
    │              TanStack AI Adapter (Gemini 2026)               │
    │  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
    │  │   TTS       │ Transcription│  Multimodal │  Image/Video│ │
    │  │ Text→Speech │ Speech→Text │   Content   │  Generation │ │
    │  └─────────────┴─────────────┴─────────────┴─────────────┘ │
    └─────────────────────────────────────────────────────────────┘
          │                   │                   │
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ File CRUD │       │Note Blocks│      │RAG +     │
    │Terminal   │       │Code/Img/ │       │Embedding │
    └──────────┘       │Embed     │       └──────────┘
                       └──────────┘
```

---

## 3. Key Findings Summary

| Area | Current State | Gap | Priority |
|------|---------------|-----|----------|
| **Thread Management** | Separate per workspace | Unified cross-workspace thread | High |
| **Chat Rendering** | Basic hook | Architecture doc for IDE integration | High |
| **Agent CRUD** | File/Terminal tools | Voice I/O, architecture doc | High |
| **Multimodal Input** | Image only | TTS, Transcription, Audio I/O | High |
| **Multimodal Output** | Text only | TTS, Image Gen, Video Gen | Medium |
| **Prompt Injection** | None | Sequential prompts, context analysis | Medium |
| **Note Blocks** | Basic blocks | Code/Image/Embed rendering | High |
| **UX/UI** | 8-bit system | Draggable panels, tooltips | Medium |

---

## 4. Recommendations (Prioritized)

### Critical Priority (Must Do)

#### REC-001: Unified Thread Management Architecture
- **Category:** Architecture
- **Effort:** Large
- **Affected Files:** 
  - `src/lib/events/workspace-events.ts`
  - `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
  - `src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx`
- **Description:** Create architecture document for cross-workspace thread management. Implement unified thread store that syncs via event bus but maintains workspace isolation.
- **Dependencies:** REC-003, REC-005

#### REC-002: Agent CRUD Architecture Documentation
- **Category:** Documentation
- **Effort:** Small
- **Affected Files:**
  - `_bmad-output/planning-artifacts/architecture/agent-crud-architecture.md`
- **Description:** Document the current agent tool permission system with CRUD capabilities. Include workflow diagrams and permission matrix.
- **Output:** Architecture decision document

#### REC-003: Voice I/O Tools (TTS + Transcription)
- **Category:** Implementation
- **Effort:** Medium
- **Affected Files:**
  - `src/lib/agent/tools/speech-to-text-tool.ts`
  - `src/lib/agent/tools/text-to-speech-tool.ts`
  - `src/routes/api/tts.ts`
  - `src/routes/api/transcribe.ts`
- **Description:** Implement speech-to-text (Whisper) and text-to-speech (OpenAI TTS-1/Gemini TTS) tools for agents. Integrate with existing tool permission system.
- **Dependencies:** REC-005

#### REC-004: Note Block Rendering System
- **Category:** Implementation
- **Effort:** Medium
- **Affected Files:**
  - `src/infrastructure/sync/workspace-services/notes/note-block-renderer.tsx`
  - `src/presentation/components/notes/code-block-renderer.tsx`
  - `src/presentation/components/notes/image-block-renderer.tsx`
  - `src/presentation/components/notes/embed-block-renderer.tsx`
- **Description:** Create renderer components for code blocks (with Monaco), images, and embedded URLs. Update note-markdown-parser to handle these block types.
- **Dependencies:** None

### High Priority (Should Do)

#### REC-005: TanStack AI Gemini 2026 Integration
- **Category:** Implementation
- **Effort:** Medium
- **Affected Files:**
  - `src/lib/agent/multimodal/gemini-multimodal-provider.ts`
  - `src/lib/agent/multimodal/voice-input-hook.ts`
  - `src/lib/agent/multimodal/voice-output-hook.ts`
- **Description:** Create provider wrapper for Gemini 2026 multimodal API. Implement hooks for voice input (microphone → base64) and output (text → audio playback).
- **Dependencies:** REC-003

#### REC-006: Prompt Injection & Sequential Generation
- **Category:** Implementation
- **Effort:** Medium
- **Affected Files:**
  - `src/lib/agent/prompt-injection/prompt-engine.ts`
  - `src/lib/agent/prompt-injection/sequential-image-gen.ts`
- **Description:** Implement prompt injection utilities for context-aware suggestions. Create sequential image generation workflow (image → analyze → prompt → generate → repeat).
- **Dependencies:** REC-003, REC-005

#### REC-007: UX/UI Panel Consistency
- **Category:** Refactor
- **Effort:** Small
- **Affected Files:**
  - `src/presentation/components/ui/resizable-panel.tsx`
  - `src/presentation/components/ui/truncate-text.tsx`
  - `src/presentation/components/ui/tooltip-react19-compatible.tsx`
- **Description:** Fix draggable panel behavior to prevent inner element collapse. Implement consistent text truncation with hover tooltips. Update z-index management.
- **Dependencies:** None

### Medium Priority (Could Do)

#### REC-008: Image/Video Generation Integration
- **Category:** Implementation
- **Effort:** Medium
- **Affected Files:**
  - `src/lib/agent/tools/generate-image-tool.ts`
  - `src/lib/agent/tools/generate-video-tool.ts`
- **Description:** Integrate image/video generation using TanStack AI's generateImage/generateVideo functions with appropriate providers.
- **Dependencies:** REC-005

#### REC-009: RAG Chunking Enhancement
- **Category:** Refactor
- **Effort:** Small
- **Affected Files:**
  - `src/lib/knowledge/note-chunker.ts`
- **Description:** Improve chunking strategy for code blocks, images, and embedded content. Add embedding generation for each chunk type.
- **Dependencies:** REC-004

#### REC-010: Mobile Voice UX
- **Category:** Implementation
- **Effort:** Small
- **Affected Files:**
  - `src/presentation/components/chat/voice-input-button.tsx`
  - `src/presentation/components/chat/voice-output-toggle.tsx`
- **Description:** Implement mobile-optimized voice input/output controls with visual feedback. Integrate visual viewport API for keyboard avoidance.
- **Dependencies:** REC-003, REC-005

---

## 5. Action Items

### Immediate (This Sprint)

- [ ] Create architecture document: `agent-crud-architecture.md`
- [ ] Implement `speech-to-text-tool.ts` (Whisper integration)
- [ ] Implement `text-to-speech-tool.ts` (TTS-1 integration)
- [ ] Create `note-block-renderer.tsx` component

### Short-Term (Next 2 Sprints)

- [ ] Implement Gemini 2026 multimodal provider wrapper
- [ ] Create voice input/output hooks
- [ ] Implement prompt injection utilities
- [ ] Fix UX/UI panel consistency issues

### Long-Term (Future Epics)

- [ ] Image/video generation integration
- [ ] RAG chunking enhancement
- [ ] Mobile voice UX optimization
- [ ] Cross-workspace thread unification

---

## 6. References

### TanStack AI Documentation
- Multimodal Content: `@tanstack/ai/docs/guides/multimodal-content.md`
- Text-to-Speech: `@tanstack/ai/docs/guides/text-to-speech.md`
- Transcription: `@tanstack/ai/docs/guides/transcription.md`
- Tool Architecture: `@tanstack/ai/docs/guides/tool-architecture.md`

### Codebase References
- Chat API: `src/routes/api/chat.ts`
- Agent Chat Hook: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- Multimodal Builder: `src/lib/agent/multimodal/message-builder.ts`
- Note Parser: `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts`
- CSS Standards: `agent-os/standards/frontend/css.md`

### External Resources
- TanStack AI Repo: github.com/TanStack/ai
- Gemini API: developers.google.com/gemini-api
- OpenAI TTS: platform.openai.com/docs/tts

---

*Generated: 2026-01-09 | BMAD Core Master Agent*
*Review required before sprint planning*
