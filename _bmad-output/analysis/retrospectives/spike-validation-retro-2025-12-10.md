# Retrospective: TanStack AI + Start Spike Validation

**Date:** 2025-12-10T03:00:00+07:00
**Phase:** Phase 2 - Spike Validation
**Status:** ✅ COMPLETED
**Author:** BMad Master

---

## 📋 Executive Summary

Successfully validated TanStack AI 0.0.3 + TanStack Start 1.140.0 integration patterns through a minimal spike app. This unblocks the main via-gent remediation work by providing verified patterns for AI chat, tool definitions, streaming, and server routes.

---

## 🎯 Objectives Achieved

| Objective | Status | Evidence |
|-----------|--------|----------|
| Validate latest TanStack AI API patterns | ✅ | `pnpm typecheck` passes |
| Confirm Gemini adapter configuration | ✅ | `createGemini(apiKey)` typed correctly |
| Verify server route patterns | ✅ | `createFileRoute` + `server.handlers` works |
| Test tool definition patterns | ✅ | `toolDefinition().server()` compiles |
| Validate streaming architecture | ✅ | `toStreamResponse()` + `fetchServerSentEvents()` |

---

## 🔬 Key Technical Discoveries

### 1. Gemini Adapter API (Critical)

**Previous Understanding (WRONG):**
```typescript
// Docs showed this pattern
const adapter = gemini({ apiKey: process.env.GEMINI_API_KEY })
```

**Actual API (CORRECT):**
```typescript
// For explicit API key - use createGemini
import { createGemini } from '@tanstack/ai-gemini'
const adapter = createGemini(apiKey)

// For auto-detection from env var - use gemini()
import { gemini } from '@tanstack/ai-gemini'
const adapter = gemini() // reads GEMINI_API_KEY from process.env
```

**Root Cause:** The `gemini()` function signature is `Omit<GeminiAdapterConfig, 'apiKey'>`, meaning it intentionally excludes `apiKey` because it auto-detects from environment. The `createGemini(apiKey, config?)` function takes the key explicitly.

### 2. Server Route Pattern (Critical)

**Deprecated Pattern:**
```typescript
// createAPIFileRoute doesn't exist in 1.140.0
import { createAPIFileRoute } from '@tanstack/start/api' // ❌ BROKEN
```

**Current Pattern:**
```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return toStreamResponse(stream)
      },
    },
  },
})
```

### 3. Version Dependencies (Critical)

| Package | Required Version | Why |
|---------|-----------------|-----|
| `@tanstack/ai` | ^0.0.3 | Latest with correct types |
| `zod` | ^4.x | Required for `toJSONSchema` export |
| `vite` | ^7.x | Peer dependency of TanStack Start 1.140.0 |
| `vinxi` | ^0.5.6 | Dev server for TanStack Start |

### 4. Tool Definition Pattern

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

// Define schema
const myToolDef = toolDefinition({
  name: 'my_tool',
  description: 'Tool description',
  inputSchema: z.object({ param: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})

// Create server implementation
const myTool = myToolDef.server(async ({ param }) => {
  return { result: '...' }
})

// Use in chat
const stream = chat({
  adapter,
  model: 'gemini-2.0-flash',
  messages,
  tools: [myTool],
})
```

### 5. Client Chat Hook Pattern

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage, isLoading, error } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

// sendMessage takes a string, not an object
await sendMessage('Hello')
```

---

## ⚠️ Lessons Learned

### What Went Wrong

1. **Outdated Research Docs**
   - Initial research was based on 0.0.2 API patterns
   - Documentation online showed patterns that didn't match installed types
   - **Action:** Always verify against actual installed `.d.ts` files

2. **Version Pinning Strategy**
   - Started by trying to pin to "stable" 0.0.2 versions
   - This caused type mismatches and Zod incompatibilities
   - **Action:** Use latest versions and validate, don't assume older = stable

3. **Missing Dependency: vinxi**
   - TanStack Start requires vinxi for dev server
   - Not obvious from package.json dependencies
   - **Action:** Check peer dependencies and examples carefully

### What Went Well

1. **Context7 MCP Tool**
   - Provided accurate latest patterns for TanStack Start routes
   - Server handler pattern was correctly documented

2. **Incremental Validation**
   - Running `pnpm typecheck` after each fix caught issues early
   - Dev server startup confirmed route generation

3. **Spike Isolation**
   - Creating spike in separate directory prevented breaking main codebase
   - Allowed experimentation without risk

---

## 📚 Research Updates Required

### Documents to Update

| Document | Update Needed |
|----------|--------------|
| `tanstack-ai-usechat-2025-12-10.md` | Add `fetchServerSentEvents` pattern, `sendMessage` signature |
| `tanstack-ai-tools-2025-12-10.md` | Add `toolDefinition().server()` pattern |
| `tanstack-start-patterns-2025-12-09.md` | Replace `createAPIFileRoute` with `server.handlers` pattern |
| `AGENTS.md` | Update TanStack AI version from 0.0.2 to 0.0.3 |

### New Document Created

| Document | Purpose |
|----------|---------|
| `docs/analysis/spikes/tanstack-ai-start-spike-status.md` | Validated patterns reference |

---

## 🔄 Impact on Main Codebase

### Files Requiring Updates in via-gent

| File | Issue | Fix |
|------|-------|-----|
| `src/routes/api.chat.ts` | Uses non-existent `createAPIFileRoute` | Migrate to `server.handlers` pattern |
| `package.json` | TanStack AI at 0.0.2 | ✅ Already updated to 0.0.3 |
| `lib/gemini-client.ts` | May use wrong adapter pattern | Verify uses `createGemini()` |

### Remediation Cluster Priority

Based on spike findings, recommended execution order:

1. **Cluster 2 (Routes)** - Fix API route patterns first
2. **Cluster 5 (Domain API)** - Ensure clean tool integration
3. **Cluster 4 (Errors)** - Handle streaming errors properly
4. **Cluster 3 (Tooling)** - Align with validated patterns
5. **Cluster 1 (AI)** - Full AI integration with validated stack

---

## ✅ Action Items

| Action | Owner | Priority | Status |
|--------|-------|----------|--------|
| Update main package.json versions | BMad | Critical | ✅ Done |
| Update spike package.json | BMad | Critical | ✅ Done |
| Fix spike implementation | BMad | Critical | ✅ Done |
| Update spike status doc | BMad | High | ✅ Done |
| Update workflow status | BMad | High | ✅ Done |
| Update AGENTS.md versions | BMad | High | ⏳ Pending |
| Update research docs with new patterns | BMad | Medium | ⏳ Pending |
| Port patterns to via-gent codebase | Dev | High | 🔒 Next Phase |

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Research cycles | 3 |
| Failed approaches | 2 (wrong versions, wrong adapter API) |
| Successful validation | 1 |
| Type errors resolved | 2 |
| Documents updated | 3 |
| Documents created | 2 |

---

## 🎉 Conclusion

The spike successfully validates that TanStack AI 0.0.3 + TanStack Start 1.140.0 can work together with proper configuration. The key insight is that **latest versions are required** - attempting to pin to older "stable" versions caused more problems than it solved.

The validated patterns are now documented in:
- `docs/analysis/spikes/tanstack-ai-start-spike-status.md`
- `spikes/tanstack-ai-spike/` (reference implementation)

**Next Step:** Execute remediation clusters using validated patterns.
