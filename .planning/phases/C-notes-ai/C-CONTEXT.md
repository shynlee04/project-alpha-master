# Phase C: Notes AI — Context

**Goal:** AI features work in Notes editor (summarize, continue, translate, etc.)

**Why third:** User's explicit priority. Notes is isolated from Chat/Thread.

**Depends on:** Phase B (AI Gateway) — needs working gateway to call AI

---

## Current State

### Working (UI Ready)

| Component | Location | Status |
|-----------|----------|--------|
| BlockNote Editor | `src/presentation/components/notes/NoteEditor.tsx` | ✅ Working |
| 20+ Custom Blocks | `src/presentation/components/notes/blocks/` | ✅ Working |
| Slash Commands | `src/presentation/components/notes/SlashCommandManager.tsx` | ✅ UI works |
| AI Transform Menu | `src/presentation/components/notes/AITransformMenu.tsx` | ⚠️ Calls stub |
| In-Block AI Popup | `src/presentation/components/notes/InBlockAIPopup.tsx` | ⚠️ Calls stub |
| AI Prompt Dialog | `src/presentation/components/notes/PromptDialog.tsx` | ⚠️ Calls stub |

### Stubbed (Must Un-stub)

| File | Current Behavior |
|------|------------------|
| `src/lib/notes/note-ai-service.ts` | Throws `PHASE_1A_DISABLED` error |
| `src/lib/notes/hooks/use-streaming-ai.ts` | Calls stubbed service |

### Archived (Reference)

| Archive File | Contains |
|--------------|----------|
| `_phase2-archive/lib/notes/note-ai-service.ts` | Original implementation (may have old patterns) |

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ NoteEditor │  │SlashCommands│ │AITransform │  ...           │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘                │
└─────────┼───────────────┼───────────────┼───────────────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LIB (Application Services)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   NoteAIService                           │   │
│  │  - generateNoteContent(prompt) → Promise<string>          │   │
│  │  - generateNoteContentStream(prompt) → AsyncIterable      │   │
│  │  - summarize(content) → Promise<string>                   │   │
│  │  - continueWriting(content) → Promise<string>             │   │
│  │  - translate(content, lang) → Promise<string>             │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│                               │ uses                             │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      useStreamingAI                       │   │
│  │                   (React hook wrapper)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AI GATEWAY                                 │
│                    (from Phase B)                                │
│  src/infrastructure/ai/ai-gateway.ts                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Features to Enable

### Slash Commands

| Command | Action | Output |
|---------|--------|--------|
| `/summarize` | Summarize entire note | Insert summary block |
| `/continue` | Continue writing from cursor | Insert continuation |
| `/translate` | Translate content | Replace or insert translation |
| `/outline` | Generate outline | Insert outline block |
| `/explain` | Explain like I'm 5 | Insert simplified version |
| `/questions` | Generate study questions | Insert Q&A block |

### Transform Menu (on selection)

| Action | Input | Output |
|--------|-------|--------|
| Summarize | Selected text | Replace with summary |
| Expand | Selected text | Replace with expanded version |
| Simplify | Selected text | Replace with simpler version |
| Translate | Selected text | Replace with translation |

### In-Block AI

| Trigger | Action |
|---------|--------|
| Empty block + focus | Show AI popup with suggestions |
| Type `/` | Show slash command menu |

---

## Implementation Plan

### Step 1: Un-stub NoteAIService

Replace the stub with real implementation:

```typescript
// src/lib/notes/note-ai-service.ts

import { aiGateway } from '@/infrastructure/ai';

export async function generateNoteContent(
  prompt: string,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const result = await aiGateway.generate({
    provider: 'gemini', // or from settings
    model: options?.model ?? 'gemini-2.0-flash',
    prompt,
    temperature: options?.temperature ?? 0.7,
  });
  return result.content;
}

export async function* generateNoteContentStream(
  prompt: string,
  options?: { model?: string }
): AsyncGenerator<{ text: string; done: boolean }> {
  const stream = await aiGateway.stream({
    provider: 'gemini',
    model: options?.model ?? 'gemini-2.0-flash',
    prompt,
  });
  
  for await (const chunk of stream) {
    yield { text: chunk.content, done: false };
  }
  yield { text: '', done: true };
}
```

### Step 2: Wire useStreamingAI Hook

```typescript
// src/lib/notes/hooks/use-streaming-ai.ts

export function useStreamingAI() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<Error | null>(null);
  
  const generate = async (prompt: string) => {
    setIsStreaming(true);
    setContent('');
    setError(null);
    
    try {
      for await (const chunk of generateNoteContentStream(prompt)) {
        setContent(prev => prev + chunk.text);
        if (chunk.done) break;
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsStreaming(false);
    }
  };
  
  return { generate, isStreaming, content, error };
}
```

### Step 3: Enable UI Components

Remove "disabled" states from:
- `AITransformMenu.tsx`
- `InBlockAIPopup.tsx`
- `PromptDialog.tsx`

---

## Success Criteria

- [ ] User can type `/summarize` in note and get AI summary
- [ ] User can select text and click "Continue writing"
- [ ] User can translate note content EN↔VI
- [ ] Streaming responses render progressively (character by character)
- [ ] Error states show user-friendly messages
- [ ] TypeScript errors: 0 new errors introduced
- [ ] Working features: Project CRUD, FileTree, Notes basic editing still work

---

## Isolation Boundary

### TOUCHES (allowed to modify)

- `src/lib/notes/note-ai-service.ts` — Un-stub
- `src/lib/notes/hooks/use-streaming-ai.ts` — Wire to service
- `src/presentation/components/notes/AITransformMenu.tsx` — Enable
- `src/presentation/components/notes/InBlockAIPopup.tsx` — Enable
- `src/presentation/components/notes/PromptDialog.tsx` — Enable

### DOES NOT TOUCH (protected)

- `src/domain/schemas/thread.schema.ts` — Notes doesn't use Thread
- `src/plugins/chat/` — Chat is separate feature
- `src/plugins/filetree/` — FileTree operator
- `src/infrastructure/persistence/` — Storage layer

---

## Key Insight: Notes ≠ Chat

**Notes AI generates text that goes into BlockNote blocks, NOT ThreadMessage.**

This means:
- No ThreadMessage schema changes needed for Phase C
- No ToolCall/ToolResult needed for Phase C
- Notes AI is self-contained in `src/lib/notes/` and `src/presentation/components/notes/`

ThreadMessage schema changes are only needed for **Phase D (Agentic)**.

---

*Context created: 2026-02-01*
*Phase: C — Notes AI*
*Depends on: Phase B (AI Gateway)*
