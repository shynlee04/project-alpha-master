# RAG Integration Fix Plan: Quick Reference

## The Problem (In 30 Seconds)

**User Journey is BROKEN:**
```
User adds Gemini API key ✅
User goes to Knowledge workspace ⚠️
User asks question ❌ GETS FAKE PLACEHOLDER RESPONSE
```

## The 3 Critical Blockers

| # | File | Line | Problem | Fix |
|---|------|------|---------|-----|
| 1 | `rag-chat.ts` | 129-132 | `generateResponse()` returns placeholder | Call actual LLM API |
| 2 | `rag-chat-slice.ts` | 70-81 | `sendMessage()` has TODO | Wire to RAGChat.chat() |
| 3 | `KnowledgePage.tsx` | 351, 361 | RAGChat never created, API key not passed | Instantiate & pass apiKey |

## 5-Minute Fix Sequence

### Step 1: Fix generateResponse() (30 min)

**File**: `src/lib/rag/rag-chat.ts:129-132`

Change FROM:
```typescript
private async generateResponse(_prompt: string, context: RAGContext): Promise<string> {
  // TODO: Integrate with TanStack AI chat endpoint
  return `...placeholder...`;
}
```

Change TO:
```typescript
private async generateResponse(prompt: string, context: RAGContext): Promise<string> {
  // Call LLM API with prompt
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      context: context.chunks,
      provider: 'gemini'
    })
  });
  
  const data = await response.json();
  return data.content;
}
```

---

### Step 2: Wire sendMessage() (30 min)

**File**: `src/infrastructure/persistence/stores/rag/rag-chat-slice.ts:70-81`

Change FROM:
```typescript
sendMessage: async (_content: string, _projectId: string) => {
  get().addChatMessage(message);
  // TODO: Trigger AI response
},
```

Change TO:
```typescript
sendMessage: async (content: string, projectId: string) => {
  const message: ChatMessage = {
    role: 'user',
    content,
    timestamp: Date.now(),
  };

  get().addChatMessage(message);

  // Get RAGChat instance and generate response
  const ragChat = getRAGChat(); // Need to implement this singleton
  const response = await ragChat.chat(content, { projectId });
  
  get().addChatMessage(response);
},
```

---

### Step 3: Instantiate RAGChat in KnowledgePage (1 hour)

**File**: `src/presentation/components/knowledge/KnowledgePage.tsx:351`

Add:
```typescript
// Get API key from vault
const credentials = await credentialVault.getCredential('gemini');
const apiKey = credentials?.apiKey;

// Create embedding service with API key
const embeddingService = await createEmbeddingService(apiKey);

// Create RAGChat instance (store globally or use singleton)
export const ragChat = new RAGChat({
  retriever: hybridRetriever,
  embeddingService,
});
```

---

## Test After Fix

```bash
# 1. Add Gemini API key in Settings
# 2. Go to Knowledge workspace
# 3. Import a document
# 4. Ask: "What is this document about?"
# 5. Verify:
#    - Get real AI response (not placeholder)
#    - Response has citations
#    - Citations are clickable
```

## Files to Modify

1. `src/lib/rag/rag-chat.ts` - Integrate LLM API call
2. `src/infrastructure/persistence/stores/rag/rag-chat-slice.ts` - Wire sendMessage
3. `src/presentation/components/knowledge/KnowledgePage.tsx` - Initialize RAGChat with API key
4. `src/lib/rag/embedding-service.ts` - Ensure apiKey passed correctly

## Estimated Time

- **Basic Fix**: 2-3 hours
- **With Error Handling**: 4-5 hours
- **Full Integration (Notes workspace)**: +4 hours

## Success Criteria

✅ User asks question → Gets real AI response  
✅ Response grounded in indexed documents  
✅ Citations appear and are accurate  
✅ Chat history persists  
✅ Works with/without API key (local fallback)

---

**Created**: 2026-01-07  
**Related Report**: `_bmad-output/validation/skeptical-pm-rag-assessment-2026-01-07.md`
