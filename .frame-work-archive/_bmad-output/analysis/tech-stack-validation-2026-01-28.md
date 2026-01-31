# Tech Stack Validation Report
**Date**: 2026-01-28
**Purpose**: Validate technology claims in vision document (`new-fundamental-truths.md`)
**Research Sources**: Context7, Tavily, Exa (MCP servers)

---

## 1. TanStack AI SDK

### Research Findings

**Current Status (January 2026)**: TanStack AI SDK is in **Alpha phase** (announced December 3-4, 2025).

**Key Features Validated**:

| Feature | Status | Evidence |
|---------|--------|----------|
| **Isomorphic Tools** | ✅ REAL | Define once with `toolDefinition()`, implement with `.server()` OR `.client()` |
| **Client-Side Tools** | ✅ REAL | Uses `.client()` method - runs directly in browser, no server roundtrip |
| **Server-Side Tools** | ✅ REAL | Uses `.server()` method - executes securely on backend |
| **Agentic Cycle** | ✅ REAL | LLM repeatedly calls tools, receives results, continues reasoning |
| **Provider Adapters** | ✅ REAL | OpenAI, Anthropic, Gemini, Ollama supported |
| **Type Safety** | ✅ REAL | Full TypeScript inference from Zod schemas |
| **DevTools Integration** | ✅ REAL | Same TanStack DevTools for Query/Router |

**Tool Architecture Pattern** (from Context7):
```typescript
// Define once
const toolDef = toolDefinition({
  name: "tool_name",
  inputSchema: z.object({ ... }),
  outputSchema: z.object({ ... })
});

// Server implementation
const serverTool = toolDef.server(async (input) => { /* db access */ });

// Client implementation  
const clientTool = toolDef.client(async (input) => { /* browser APIs */ });
```

**Agentic Cycle Pattern**: The agentic cycle is the pattern where the LLM repeatedly calls tools, receives results, and continues reasoning until it can provide a final answer. This enables complex multi-step operations.

### Vision Document Claims (Lines 213-256, 483-495)

| Claim | Line | Status |
|-------|------|--------|
| "All LLM calls must use TanStack AI SDK" | 253 | ✅ Valid approach |
| "Client Tools: Browser-only execution" | 298-300 | ✅ VERIFIED |
| "Server Tools: Server/Edge execution" | 299 | ✅ VERIFIED |
| TanStack AI tools guide URL | 485 | ✅ Valid URL |
| Agentic cycle documentation | 490 | ✅ Valid URL |

### Comparison to Vercel AI SDK v6

| Aspect | TanStack AI | Vercel AI SDK v6 |
|--------|-------------|------------------|
| Isomorphic Tools | ✅ Define once, `.server()`/`.client()` | ⚠️ Separate implementations required |
| Framework Support | React, Solid, Vanilla JS, PHP, Python | React (Next.js optimized) |
| Maturity | Alpha (Dec 2025) | Stable v6 |
| Client Tools | ✅ Native support | ⚠️ Limited |
| Bundle Size | Tree-shakeable adapters | Full SDK bundle |

**Key Insight**: Vision document correctly identified TanStack AI's superior client-side tool support as the reason to choose it over Vercel AI SDK.

### Validation Status
✅ **VERIFIED** - TanStack AI SDK claims are accurate. The isomorphic tool architecture, client-side tools, and agentic cycle are all real and documented.

### Recommendations
1. **Track Alpha to Beta**: TanStack AI is in Alpha - monitor for breaking changes
2. **Production Caution**: Vision doc should note Alpha status for production planning
3. **No changes needed**: Technical claims are accurate

---

## 2. LLM Provider Models

### Research Findings

#### OpenAI Models (January 2026)

| Model | Release Date | Status | Notes |
|-------|--------------|--------|-------|
| **GPT-5.2** | Dec 11, 2025 | ✅ CURRENT PRODUCTION | Latest flagship model |
| **GPT-5.2-Codex** | Dec 11, 2025 | ✅ Available | Best for agentic coding |
| **GPT-5.1** | Nov 13, 2025 | ⚠️ PREDECESSOR | Being sunset |
| GPT-5.1-Codex-Max | Nov 2025 | ⚠️ Outdated | Vision doc claims this |

**GPT-5.2 Specifications**:
- Knowledge Cutoff: August 31, 2025
- Context Window: 400,000 tokens
- Max Output: 128,000 tokens
- Variants: GPT-5.2 Instant, GPT-5.2 Thinking, GPT-5.2 Pro

#### Google Gemini Models (January 2026)

| Model | Release Date | Status | Notes |
|-------|--------------|--------|-------|
| **Gemini 3 Pro** | Nov 18, 2025 | ✅ CURRENT | Complex reasoning, multimodal |
| **Gemini 3 Flash** | Dec 17, 2025 | ✅ CURRENT | Speed-optimized |
| Gemini 3.0 variants | - | ⚠️ NAMING | Correct name is "Gemini 3" not "3.0" |

**Note**: Vision document says "3.0 Pro / 3.0 Flash" - the actual naming convention is "Gemini 3 Pro" and "Gemini 3 Flash" (no ".0").

#### Anthropic Claude Models (January 2026)

| Model | Release Date | Status | Notes |
|-------|--------------|--------|-------|
| **Claude Opus 4.5** | Nov 24, 2025 | ✅ CURRENT | Most powerful frontier model |
| **Claude Sonnet 4.5** | Jan 2026 | ✅ CURRENT | Best coding model |
| **Claude Haiku 4.5** | 2025 | ✅ CURRENT | Speed/cost optimized |
| Claude Opus 4/4.1 | - | ❌ DEPRECATED | Removed Jan 12, 2026 |

**Claude Opus 4.5 Capabilities**:
- SWE-bench Verified: 80.9%
- 30-minute autonomous coding sessions
- Extended thinking mode
- 76% fewer output tokens at medium effort vs Sonnet

### Vision Document Claims (Lines 224-229)

| Claim | Reality | Status |
|-------|---------|--------|
| "OpenAI GPT-5.1-Codex-Max (Nov 2025)" | GPT-5.2 is latest (Dec 2025) | ⚠️ OUTDATED |
| "Gemini 3.0 Pro / 3.0 Flash (Jan 2026)" | "Gemini 3 Pro/Flash" (no .0) | ⚠️ PARTIAL |
| "Claude Sonnet 4.5, Claude Opus 4.5" | Correct | ✅ VERIFIED |

### Validation Status
⚠️ **PARTIAL** - OpenAI model reference is outdated; Gemini naming convention slightly off

### Recommendations
1. **UPDATE REQUIRED**: Change "GPT-5.1-Codex-Max" to "GPT-5.2-Codex" or "GPT-5.2"
2. **MINOR FIX**: Change "Gemini 3.0" to "Gemini 3" throughout
3. **ADD**: GPT-5.2 reasoning_effort parameter (`none`, `low`, `medium`, `high`, `xhigh`)
4. **ADD**: Claude extended thinking mode for Opus 4.5

---

## 3. File System Access API

### Research Findings

#### Persistent Permissions

| Feature | Chrome Version | Status |
|---------|----------------|--------|
| **Persistent Permissions** | Chrome 122+ | ✅ SHIPPED |
| Three-way permission prompt | Chrome 122+ | ✅ Available |
| Per-file site settings | Chrome 122+ | ✅ Available |
| IndexedDB handle storage | All versions | ✅ Required pattern |

**How Persistent Permissions Work**:
1. Store `FileSystemHandle` in IndexedDB
2. On next visit, call `requestPermission()` on stored handle
3. User sees three options: "Allow this time", "Allow on every visit", "Don't allow"
4. **Installed PWAs**: Permissions persisted by default (three-way prompt skipped)

#### FileSystemObserver API

| Feature | Chrome Version | Status |
|---------|----------------|--------|
| **FileSystemObserver** | Chrome 129+ origin trial | ⚠️ EXPERIMENTAL |
| Origin trial end | Feb 26, 2025 | ❌ ENDED |
| Chrome 133+ | Shipping | ✅ Available in Chrome 133+ |

**Important**: FileSystemObserver is:
- **Non-standard** (not a W3C standard)
- **Experimental** (may change or be removed)
- Chrome-only (no cross-browser support)

### Vision Document Claims (Lines 112-114)

| Claim | Reality | Status |
|-------|---------|--------|
| "Chrome 122+ for persistent permissions" | Correct | ✅ VERIFIED |
| "FileSystemObserver (Chrome 129+)" | Origin trial ended, Chrome 133+ ships | ⚠️ PARTIAL |
| "polling fallback for file watching" | Correct approach | ✅ VERIFIED |

### Validation Status
⚠️ **PARTIAL** - FileSystemObserver version info outdated; persistent permissions correct

### Recommendations
1. **UPDATE**: Change "Chrome 129+" to "Chrome 133+" for FileSystemObserver
2. **ADD WARNING**: Note that FileSystemObserver is non-standard and experimental
3. **KEEP**: Polling fallback strategy is correct and necessary
4. **ADD**: PWA install benefits for persistent permissions

---

## 4. Dexie.js

### Research Findings

**Current Status**: Dexie.js is a mature, high-quality IndexedDB wrapper with:
- Source Reputation: HIGH
- Benchmark Score: 86.8/100
- 3,787 code snippets in Context7

**Key Features for Large Schemas**:

| Feature | Description |
|---------|-------------|
| **Version Management** | Incremental schema migrations with `.upgrade()` |
| **Multiple Tables** | Define all tables in `.stores()` call |
| **Index Optimization** | Don't index large blobs (images, videos) |
| **Compound Indexes** | Support for multi-field indexes |
| **Nested Properties** | Can index `address.city` style paths |

**Schema Best Practices** (from Context7):
```javascript
db.version(1).stores({
  friends: '++id, name, age',           // Auto-increment, 2 indexes
  users: '&username, email, address.city', // Unique key, compound index
  pets: '++id, ownerId, name'
});

// Migration example
db.version(2).stores({
  friends: '++id, name, age, city'  // Add index
}).upgrade(tx => {
  return tx.friends.toCollection().modify(friend => {
    friend.city = friend.address?.city;
  });
});
```

**Performance Considerations**:
1. **Never index large data** (images, videos, documents)
2. Store blobs but don't create indexes on them
3. Use compound indexes strategically
4. Version migrations run automatically

**For 40+ Tables**:
- Dexie handles large schemas well
- All tables defined in single `.stores()` call
- Consider table grouping by domain for maintainability
- Use TypeScript for type-safe table access

### Vision Document Claims (Lines 115-127, 425-426)

| Claim | Reality | Status |
|-------|---------|--------|
| "Dexie.js for persistence" | Correct and appropriate | ✅ VERIFIED |
| "Mobile/Tablet IndexedDB" | Correct approach | ✅ VERIFIED |
| No specific version mentioned | Current: Dexie 4.x | ⚠️ ADD VERSION |

### Validation Status
✅ **VERIFIED** - Dexie.js is appropriate for the use case

### Recommendations
1. **ADD**: Specify Dexie version in tech stack (recommend Dexie 4.x)
2. **ADD**: Reference `dexie-react-hooks` for React integration
3. **ADD**: TanStack Dexie DB Collection exists for TanStack DB integration
4. **DOCUMENT**: Table grouping strategy for 40+ tables

---

## Summary Table

| Technology | Vision Claim | Reality (Jan 2026) | Status | Action Required |
|------------|--------------|---------------------|--------|-----------------|
| **TanStack AI SDK** | Client/server tools, agentic cycle | All claims accurate, Alpha status | ✅ VERIFIED | Note Alpha status |
| **OpenAI Models** | GPT-5.1-Codex-Max (Nov 2025) | GPT-5.2 is latest (Dec 2025) | ⚠️ OUTDATED | **Update to GPT-5.2** |
| **Google Gemini** | Gemini 3.0 Pro/Flash | Gemini 3 Pro/Flash (no ".0") | ⚠️ PARTIAL | Minor naming fix |
| **Anthropic Claude** | Claude Sonnet/Opus 4.5 | Correct, Opus 4.5 is current | ✅ VERIFIED | None |
| **FSA Persistent Perms** | Chrome 122+ | Chrome 122+ correct | ✅ VERIFIED | None |
| **FileSystemObserver** | Chrome 129+ | Chrome 133+ (experimental) | ⚠️ PARTIAL | Update version, add warning |
| **Dexie.js** | IndexedDB wrapper | Mature, appropriate choice | ✅ VERIFIED | Add version |

---

## Required Vision Document Updates

### High Priority

1. **Line 228**: Change `GPT-5.1-Codex-Max (Nov 2025)` to `GPT-5.2-Codex (Dec 2025)`

2. **Line 227**: Change `3.0 Pro / 3.0 Flash` to `3 Pro / 3 Flash`

3. **Lines 112-114**: Update FileSystemObserver reference:
   ```markdown
   - Chrome 122+ for persistent permissions
   - FileSystemObserver (Chrome 133+, experimental/non-standard) with polling fallback
   ```

### Medium Priority

4. Add TanStack AI Alpha status disclaimer in implementation notes

5. Add specific Dexie.js version (4.x) to tech stack

6. Add GPT-5.2 parameters:
   - `reasoning_effort`: none, low, medium, high, xhigh
   - Context window: 400K tokens
   - Max output: 128K tokens

### Low Priority

7. Add Claude Opus 4.5 extended thinking mode documentation

8. Add reference to TanStack Dexie DB Collection for future integration

---

## Research Citations

### TanStack AI
- Context7 Library ID: `/tanstack/ai` (1103 snippets, High reputation)
- TanStack Blog: https://tanstack.com/blog (Alpha 2 announcement Dec 2025)
- LogRocket: https://blog.logrocket.com/tanstack-vs-vercel-ai-library-react/

### OpenAI Models
- OpenAI Platform: https://platform.openai.com/docs/models/gpt-5.2
- OpenAI Blog: https://openai.com/index/introducing-gpt-5-2/
- Wikipedia: https://en.wikipedia.org/wiki/GPT-5.2

### Google Gemini
- Google Blog: https://blog.google/products/gemini/gemini-3-flash-gemini-app/
- Google Cloud: https://cloud.google.com/blog/products/ai-machine-learning/gemini-3-flash-for-enterprises/

### Anthropic Claude
- Releasebot: https://releasebot.io/updates/anthropic/claude
- Anthropic Blog: Claude Opus 4.5 launch (Nov 24, 2025)
- Medium: Claude Code 2.1.0 analysis

### File System Access API
- Chrome Developer: https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemObserver

### Dexie.js
- Context7 Library ID: `/websites/dexie` (3787 snippets, High reputation)
- Dexie Docs: https://dexie.org/docs/

---

**Report Generated**: 2026-01-28T[TIME]
**Research Duration**: ~20 minutes
**MCP Tools Used**: Context7, Tavily, Exa
