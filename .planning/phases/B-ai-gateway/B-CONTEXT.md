# Phase B: AI Gateway — Context

**Goal:** Single entry point for all AI calls using TanStack AI SDK.

**Why second:** Currently 15+ files make direct AI calls with different patterns. Unify before adding features.

**Depends on:** Phase A (BYOK Foundation) — needs working credential vault

---

## Current State

### Working (Use as Reference)

| File | SDK | Status |
|------|-----|--------|
| `src/routes/api/chat.ts` | TanStack AI SDK | ✅ Correct pattern |

### Fragmented (Must Migrate)

| File | Current Pattern | Issue |
|------|-----------------|-------|
| `src/lib/notes/ai-image-service.ts` | Direct fetch() | Bypasses gateway |
| `src/lib/notes/ai-vision-service.ts` | Direct fetch() | Bypasses gateway |
| `src/lib/notes/ai-video-service.ts` | Direct fetch() | Bypasses gateway |
| `src/lib/notes/ai-storyboard-service.ts` | Direct fetch() | Bypasses gateway |
| `src/lib/canvas/linkage-ai-enhancer.ts` | Direct @google/genai | **HARDCODED API KEY** |
| `src/lib/rag/embedding-service.ts` | Direct fetch() | Bypasses gateway |
| `src/lib/rag/cloud-embedder.ts` | Direct fetch() | Bypasses gateway |
| `src/presentation/components/notes/blocks/VideoGenerationBlock.tsx` | Direct @google/genai | Bypasses gateway |

### Installed Packages (Ready)

```json
{
  "@tanstack/ai": "^0.2.2",
  "@tanstack/ai-gemini": "^0.3.2",
  "@tanstack/ai-openai": "^0.2.1",
  "@tanstack/ai-anthropic": "0.2.0",
  "@tanstack/ai-react": "^0.2.2"
}
```

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CALLERS                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ NoteAISvc  │  │ ImageSvc   │  │ EmbedSvc   │  ...           │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘                │
└─────────┼───────────────┼───────────────┼───────────────────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AI GATEWAY                                 │
│  src/infrastructure/ai/ai-gateway.ts                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AIGateway                                                │   │
│  │  - generate({ provider, prompt, model }) → Promise<text>  │   │
│  │  - stream({ provider, prompt, model }) → AsyncIterable    │   │
│  │  - generateImage({ provider, prompt }) → Promise<url>     │   │
│  │  - generateEmbedding({ text }) → Promise<float[]>         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│           ┌──────────────┴──────────────┐                       │
│           ▼                              ▼                       │
│  ┌─────────────────┐            ┌─────────────────┐             │
│  │ GeminiAdapter   │            │ OpenRouterAdapter│             │
│  │ @tanstack/ai-   │            │ @tanstack/ai-    │             │
│  │ gemini          │            │ openai           │             │
│  └────────┬────────┘            └────────┬────────┘             │
│           │                              │                       │
│           └──────────────┬───────────────┘                      │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   CredentialVault                         │   │
│  │                   (from Phase A)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target Files

| File | Purpose |
|------|---------|
| `src/infrastructure/ai/ai-gateway.ts` | Main gateway service |
| `src/infrastructure/ai/adapters/gemini-adapter.ts` | Gemini via @tanstack/ai-gemini |
| `src/infrastructure/ai/adapters/openrouter-adapter.ts` | OpenRouter via @tanstack/ai-openai |
| `src/infrastructure/ai/adapters/index.ts` | Barrel export |

---

## Success Criteria

- [ ] `AIGateway.generate({ provider: 'gemini', prompt: '...' })` works
- [ ] `AIGateway.stream({ provider: 'openrouter', prompt: '...' })` works
- [ ] No direct fetch() to AI endpoints outside gateway
- [ ] No hardcoded API keys in codebase (grep returns 0)
- [ ] No direct `@google/genai` imports in active code
- [ ] TypeScript errors: 0 new errors introduced
- [ ] Working features: Project CRUD, FileTree still work

---

## Isolation Boundary

### TOUCHES (allowed to modify)

- `src/infrastructure/ai/` — AI Gateway and adapters
- `src/lib/notes/ai-*.ts` — Migrate to use gateway
- `src/lib/canvas/linkage-ai-enhancer.ts` — Remove hardcoded key, use gateway
- `src/lib/rag/embedding-service.ts` — Migrate to use gateway

### DOES NOT TOUCH (protected)

- `src/plugins/filetree/` — FileTree operator
- `src/domain/schemas/thread.schema.ts` — No schema changes
- `src/infrastructure/persistence/` — Storage layer

---

## Migration Pattern

For each fragmented file:

```typescript
// BEFORE (fragmented)
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/...?key=${apiKey}`,
  { ... }
);

// AFTER (unified)
import { aiGateway } from '@/infrastructure/ai';

const response = await aiGateway.generate({
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  prompt: '...',
});
```

---

## CRITICAL: Remove Hardcoded Key

`src/lib/canvas/linkage-ai-enhancer.ts:320` contains:
```typescript
const API_KEY = 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ';  // SECURITY ISSUE
```

This MUST be removed and replaced with vault lookup.

---

*Context created: 2026-02-01*
*Phase: B — AI Gateway*
*Depends on: Phase A (BYOK Foundation)*
