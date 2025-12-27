# Validated Knowledge: Agentic Execution Loop Implementation

**Document ID:** VK-2025-12-25-AgenticLoop  
**Created:** 2025-12-25T19:30:00+07:00  
**Status:** VALIDATED  
**Purpose:** Single source of truth for AI agents developing agentic features  
**Validity:** Version-matched to TanStack AI v0.x, OpenRouter API 2024

---

## ✅ VALIDATED FACTS

### 1. TanStack AI Tool Execution Model

**Source:** TanStack AI Documentation (Context7 verified)

| API | Purpose | Via-gent Status |
|-----|---------|-----------------|
| `maxIterations(n)` | Limit agentic loop iterations | ✅ Using `maxIterations(3)` |
| `untilFinishReason(['stop'])` | Stop on specific reason | ❌ Not implemented |
| `combineStrategies([...])` | Multi-strategy termination | ❌ Not implemented |
| `.client()` pattern | Client-side tool execution | ✅ In factory.ts |
| `addToolResult(id, output, error?)` | Manual result injection | ❌ Not using |

### 2. Tool Result Error Handling

**Source:** TanStack AI docs, `factory.ts` code review

**Current Implementation:**
```typescript
// factory.ts - All tools return this structure
{ success: false, error: 'Error message' }
{ success: true, data: { ... } }
```

**Verified Behavior:**
- Tool errors ARE returned to TanStack AI
- TanStack AI DOES feed results back to LLM for next iteration
- LLM receives result as structured JSON in conversation

**Gap Identified:**
- LLM may not understand the `{ success, error }` format
- System prompt doesn't instruct on error handling

### 3. Roo Code Patterns (Applicable)

| Pattern | Roo Code | Via-gent | Action |
|---------|----------|----------|--------|
| YOLO mode | Auto-execute all | ❌ Need settings | MVP-5 |
| Error feedback | Appended to conversation | ✅ Via tool result | Verify |
| Retry limit | Max 3 then stop | ❌ Not tracked | Epic 29-4 |
| Parallel reads | Multiple read_file | ✅ maxIterations | ✓ |

### 4. Current MVP Status

| Story | Status | Blocker |
|-------|--------|---------|
| MVP-1 | ✅ Done | - |
| MVP-2 | ✅ Done | - |
| MVP-3 | 🔄 In Progress | E2E verification needed |
| MVP-4 | 📝 Drafted | Depends on MVP-3 |
| MVP-5 | 📋 Backlog | - |
| MVP-6 | 📋 Backlog | - |
| MVP-7 | 📋 Backlog | - |

---

## ❌ CONTEXT POISONING (IGNORE)

The following claims appeared in conversation but are **INACCURATE**:

1. ❌ "Confirmation after each tool" - Roo Code has YOLO mode
2. ❌ "One tool per message" - Multiple reads allowed per turn
3. ❌ "TanStack AI doesn't support error feedback" - It does via tool results
4. ❌ "Agent stuck because no error shown" - Need to verify actual behavior

---

## 🔬 REQUIRES VERIFICATION

### V1: Does LLM receive tool result errors?

**Test:** Add logging to verify tool results in conversation context

```typescript
// Add to use-agent-chat-with-tools.ts
useEffect(() => {
    console.log('[Agent] Messages:', rawMessages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content.slice(0, 100) : 'complex',
        toolCalls: m.toolCalls?.length || 0
    })));
}, [rawMessages]);
```

### V2: Model function calling support

**Current model:** `mistralai/devstral-2512:free`

**Test models with function calling:**
- `openai/gpt-4o-mini` (OpenRouter)
- `anthropic/claude-3-haiku` (OpenRouter)
- `google/gemini-2.0-flash-exp:free` (test)

### V3: Approval overlay trigger

**Requirement:** Verify `pendingApprovals.length > 0` shows overlay

---

## 📋 COURSE CORRECTION STATUS

| ID | Issue | Status | Fix |
|----|-------|--------|-----|
| CC-001 | Path handling bugs | ✅ FIXED | Tool path normalization |
| CC-002 | Agentic execution | ⏳ PENDING | System prompt updated, awaiting E2E |

### CC-002 Fix Applied (Needs E2E Verification):

1. ✅ System prompt updated to enforce tool invocation
2. ✅ Debug logging added to trace tool calls
3. ⏳ E2E test with function-calling model
4. ⏳ Verify approval overlay appears

---

## 📚 REFERENCE DOCUMENTS

### Canonical Sources (Use These):

| Purpose | Document |
|---------|----------|
| Epic scope | `_bmad-output/epics/epic-29-agentic-execution-loop.md` |
| Sprint status | `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml` |
| TanStack AI docs | Context7 MCP `/tanstack/ai` |
| Roo Code patterns | `_bmad-output/research/roo-code-synthesis-2025-12-25.md` |
| File tools analysis | `_bmad-output/architecture/file-tools-edge-case-analysis-2025-12-25.md` |

### Superseded (Do Not Use As Primary):

- Earlier Epic 25/28 stories (consolidated into MVP)
- Pre-2025-12-24 architecture docs

---

## 🎯 NEXT ACTIONS

1. **E2E Verification (User):** Test MVP-3 with function-calling model
2. **Course Correction (SM):** Update sprint status after verification
3. **Sprint Planning (PM):** Re-prioritize based on verification results
4. **Development (Dev):** Implement Epic 29 stories after MVP-7

---

## MCP RESEARCH GUIDANCE

When researching:

```
Context7: /tanstack/ai topic=agentic loop
Deepwiki: TanStack/ai repo questions
```

**Correct package versions:**
- `@tanstack/ai`: latest (v0.x)
- `@tanstack/ai-react`: latest
- `@tanstack/ai-openai`: latest (for OpenRouter)
