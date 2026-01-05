# Data Models

## Validation Schemas
Derived from **Zod** sources (`src/lib/validation/`).

### Chat Request (`chat-request.ts`)
```typescript
export const chatRequestSchema = z.object({
    messages: z.array(chatMessageSchema)
        .min(1)
        .max(1000),
    providerId: z.string().optional(),
    modelId: z.string().optional(),
    apiKey: z.string().optional(),
    disableTools: z.boolean().optional(),
    context: chatContextSchema.optional(),
    stream: z.boolean().optional(),
});
```

## State Stores
Managed via **Zustand** (`src/stores/`).

### Conversation (`conversation-threads-store.ts`)
- **ConversationThread:** Project-scoped chat history.
- **ThreadMessage:** Individual message with `role`, `content`, `agentId`.
- **Persistence:** LocalStorage + Dexie Sync.

### Agents (`agents-store.ts`)
- Manages active agent configuration and model selection.

### Provider Models (`provider-models-store.ts`)
- Caches available models from AI providers (OpenRouter, etc).

## Database Schema (Dexie)
Inferred from usage and architecture patterns.
- **Threads Store:** IndexedDB table for long-term thread storage.
- **Files Store:** Virtual filesystem persistence (using `idb` or similar).
