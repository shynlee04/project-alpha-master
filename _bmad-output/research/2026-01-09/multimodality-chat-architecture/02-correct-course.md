# Correct Course: Multimodality & Chat Architecture

**Date:** 2026-01-09
**Workflow:** `/bmad:bmm:workflows:correct-course`
**Input:** Deep research findings
**Output:** Sprint planning proposal

---

## Current Assessment

### What Was Missing in Previous Analysis

The previous conversation analysis was **superficial** and missed critical architectural elements:

1. **Two Unsolicited Chat Systems**: 
   - Cross-workspace chat system exists in `epic-e1-cross-workspace-chat.e2e.test.tsx`
   - Shared thread management via `cross-workspace-event-bus`
   - Chat flow rendering integrated with IDE (not documented)
   - Agents have CRUD capabilities via tool permission system

2. **Multimodal Capabilities**:
   - TanStack AI already supports TTS, transcription, multimodal content
   - Gemini 2026 integration needed (not yet implemented)
   - Voice I/O requires new tools and hooks

3. **Note Blocks**:
   - Uses BlockNote with basic blocks (heading, paragraph, list, quote)
   - **Missing**: Code block rendering (Monaco), Image blocks, Embed blocks
   - Code detection exists for RAG but not rendered

4. **UX/UI Issues**:
   - Draggable panels in `NotesPage.tsx` use `resizable` component
   - Text truncation with tooltips inconsistent
   - Z-index management exists but needs documentation

---

## Root Cause Analysis

### Why the Previous Analysis Was Lacking

| Issue | Cause | Impact |
|-------|-------|--------|
| False conception of chat | Only examined `use-agent-chat-with-tools.ts` | Missed cross-workspace architecture |
| Lacking context | Didn't read E2E test files | Missed full feature set |
| No multimodality research | Assumed text-only | Missed TTS/Transcription support |
| Note blocks misunderstanding | Only read markdown parser | Missed rendering requirements |
| UX/UI issues missed | Only read CSS standards | Missed implementation issues |

### Evidence Found

1. **Cross-Workspace Chat Tests** (E1-1 to E1-11):
```typescript
// src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx
describe('E1-1 & E1-3: Chat State Isolation & Event Bus', () => {
  it('should maintain separate chat conversations per workspace', async () => {
    const conversations = {
      ide: [...],
      notes: [...],
      knowledge: [...],
      study: [...],
    };
  });
});
```

2. **TanStack AI Multimodal Support**:
```typescript
// From @tanstack/ai/docs/guides/text-to-speech.md
const result = await generateSpeech({
  adapter: openaiTTS('tts-1'),
  text: 'Hello, welcome!',
  voice: 'alloy',
  format: 'mp3',
});
```

3. **Note Block Gap**:
```typescript
// note-markdown-parser.ts - Only supports basic blocks
if (line.startsWith('# ')) {
  blocks.push({ type: 'heading', ... });
} else if (line.startsWith('- ')) {
  blocks.push({ type: 'bulletListItem', ... });
}
// No code, image, or embed blocks!
```

---

## Corrected Understanding

### 1. Cross-Workspace Chat Architecture (Complete)

```
┌─────────────────────────────────────────────────────┐
│        Cross-Workspace Event Bus (Implemented)       │
│  Events: workspace:change, agent:tool:*, chat:*      │
└─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │   IDE   │      │  Notes  │      │Knowledge│
   │ Workspace│     │ Workspace│     │Workspace│
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
   ┌─────────────────────────────────────────────┐
   │        useAgentChatWithTools (Shared)        │
   │  - Tool execution with workspace filtering   │
   │  - Pending approval flow                     │
   │  - Multimodal message building               │
   └─────────────────────────────────────────────┘
```

**Key Files:**
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts` (533 lines)
- `src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx` (675 lines)
- `src/infrastructure/events/cross-workspace-event-bus.ts` (reference in tests)

### 2. Agent CRUD System (Complete)

**Implemented Tools:**
| Tool | CRUD | Workspace | Approval |
|------|------|-----------|----------|
| read_file | Read | All | No |
| write_file | Write | IDE, Know, Study | Yes |
| list_files | Read | All | No |
| execute_command | Write | IDE only | Yes |
| process_image | Read | Knowledge | No |
| process_pdf | Read | Knowledge | No |
| process_url | Read | Knowledge | No |
| **MISSING**: speech-to-text | Read | - | - |
| **MISSING**: text-to-speech | Write | - | - |

**Architecture:**
- `AgentOrchestrationService` - Domain service for agent selection
- `WorkspaceBinding` - Per-workspace agent configuration
- `AgentToolBinding` - Per-tool permissions with workspace scope

### 3. Multimodality State (Partial)

**Implemented:**
- Image input via `buildMultimodalMessage()` in `message-builder.ts`
- Process image tool with OCR, description, object detection

**Missing:**
- Voice input (microphone → base64 → transcription)
- Voice output (text → TTS → audio playback)
- Audio file input for multimodal messages
- Video input for multimodal messages

### 4. Note Block System (Partial)

**Implemented Block Types:**
- heading (H1, H2, H3)
- paragraph
- bulletListItem
- numberedListItem
- quote

**Missing Block Types:**
- **code** - No Monaco editor integration
- **image** - No image block rendering
- **embed** - No URL embedding/oEmbed

**Current Pipeline:**
```
Markdown File → note-markdown-parser.ts → Block[] → BlockNote Editor
                                                     ↑
                                      No code/image/embed blocks!
```

### 5. UX/UI Issues (Partial)

**Implemented:**
- 8-bit design system with CSS custom properties
- Resizable panels via `src/presentation/components/ui/resizable`
- Z-index scale (z-10 to z-50)

**Issues:**
- Draggable panels cause inner element collapse (from `NotesPage.tsx`)
- Text truncation with "..." inconsistent
- Tooltips not implemented for truncated content
- Mobile visual viewport API partial implementation

---

## Recommended Path Forward

### Phase 1: Foundation (Stories 1-4)

| Story ID | Name | Effort | Files |
|----------|------|--------|-------|
| MM-01 | Voice Input Tool (Speech-to-Text) | Medium | `src/lib/agent/tools/speech-to-text-tool.ts` |
| MM-02 | Voice Output Tool (Text-to-Speech) | Medium | `src/lib/agent/tools/text-to-speech-tool.ts` |
| MM-03 | Note Code Block Renderer | Medium | `src/presentation/components/notes/code-block-renderer.tsx` |
| MM-04 | Note Image Block Renderer | Small | `src/presentation/components/notes/image-block-renderer.tsx` |

### Phase 2: Integration (Stories 5-8)

| Story ID | Name | Effort | Files |
|----------|------|--------|-------|
| MM-05 | Gemini 2026 Multimodal Provider | Medium | `src/lib/agent/multimodal/gemini-provider.ts` |
| MM-06 | Voice Input Hook | Small | `src/lib/agent/hooks/use-voice-input.ts` |
| MM-07 | Voice Output Hook | Small | `src/lib/agent/hooks/use-voice-output.ts` |
| MM-08 | Note Embed Block Renderer | Small | `src/presentation/components/notes/embed-block-renderer.tsx` |

### Phase 3: Enhancement (Stories 9-12)

| Story ID | Name | Effort | Files |
|----------|------|--------|-------|
| MM-09 | Prompt Injection Utilities | Medium | `src/lib/agent/prompt-injection/prompt-engine.ts` |
| MM-10 | Sequential Image Generation | Medium | `src/lib/agent/prompt-injection/sequential-image-gen.ts` |
| MM-11 | UX Panel Consistency Fixes | Small | `src/presentation/components/ui/` |
| MM-12 | Agent CRUD Architecture Doc | Small | `_bmad-output/planning-artifacts/architecture/agent-crud.md` |

---

## Sprint Planning Proposal

### Proposed Sprint: Multimodality & Chat Foundation

**Sprint Duration:** 2 weeks
**Stories:** MM-01 through MM-08
**Total Effort:** ~8 story points (medium effort each)

### Story Breakdown

#### MM-01: Voice Input Tool (Speech-to-Text)
**Acceptance Criteria:**
- [ ] Tool definition for `transcribe_audio` function
- [ ] Input: audio file (base64 or File)
- [ ] Output: transcribed text with timestamps
- [ ] Integration with tool permission system
- [ ] Tests with mock audio data

#### MM-02: Voice Output Tool (Text-to-Speech)
**Acceptance Criteria:**
- [ ] Tool definition for `generate_speech` function
- [ ] Input: text string, voice option
- [ ] Output: base64-encoded audio
- [ ] Integration with tool permission system
- [ ] Browser playback utility function

#### MM-03: Note Code Block Renderer
**Acceptance Criteria:**
- [ ] BlockNote custom block for code
- [ ] Monaco editor integration
- [ ] Language detection from file extension
- [ ] Syntax highlighting
- [ ] Editable in place

#### MM-04: Note Image Block Renderer
**Acceptance Criteria:**
- [ ] BlockNote custom block for images
- [ ] Drag-and-drop image upload
- [ ] Base64 rendering
- [ ] Image metadata display
- [ ] Alt text support

#### MM-05: Gemini 2026 Multimodal Provider
**Acceptance Criteria:**
- [ ] TanStack AI adapter for Gemini 2026
- [ ] Support for text, image, audio, video, document modalities
- [ ] Streaming response handling
- [ ] Provider-specific metadata handling

#### MM-06: Voice Input Hook
**Acceptance Criteria:**
- [ ] `useVoiceInput()` React hook
- [ ] Microphone permission handling
- [ ] Audio recording with visual feedback
- [ ] Integration with `useAgentChatWithTools`

#### MM-07: Voice Output Hook
**Acceptance Criteria:**
- [ ] `useVoiceOutput()` React hook
- [ ] Audio playback control
- [ ] Voice selection UI
- [ ] Integration with chat message display

#### MM-08: Note Embed Block Renderer
**Acceptance Criteria:**
- [ ] BlockNote custom block for embeds
- [ ] URL input and validation
- [ ] oEmbed integration for supported sites
- [ ] Fallback to link display for unsupported URLs

---

## Validation Checklist

Before sprint planning approval, verify:

- [x] Deep research completed and artifacts saved
- [x] All existing implementations identified
- [x] Gaps correctly categorized by priority
- [x] Dependencies mapped between stories
- [x] Acceptance criteria defined for each story
- [x] Codebase diagnostics reviewed (7 errors found in test file)

---

## Next Steps

1. **Approve this Correct Course document**
2. **Generate sprint planning artifact** from the story breakdown
3. **Assign stories to team members**
4. **Begin implementation with MM-01 and MM-02** (voice I/O - highest priority)

---

*Generated: 2026-01-09 | BMAD Core Master Agent*
*Status: Pending Approval for Sprint Planning*
