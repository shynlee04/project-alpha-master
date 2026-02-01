# Roadmap: Project Alpha — Feature-Group Remediation

**Created:** 2026-02-01
**Approach:** Feature-group isolation — fix by feature, not by violation count
**Previous:** Archived to ROADMAP-2026-02-01-ARCHIVE.md

---

## ⚠️ CRITICAL CONTEXT FOR ALL AGENTS

**This roadmap replaces the previous phase-based approach.**

The previous approach (Phase 0-5) failed because:
1. "Fixing violations" without understanding feature dependencies
2. Phases marked complete while 3,900+ violations remained
3. No isolation strategy — fixes in one area broke another
4. No bounce-back governance — gaps at dev level weren't escalated

**New approach:** Fix by **feature group** with clear isolation boundaries.

---

## Executive Summary

| Priority | Phase | Feature Group | Goal | Status |
|----------|-------|---------------|------|--------|
| 1 | **A** | BYOK Foundation | Users can save API keys | 🔴 Not started |
| 2 | **B** | AI Gateway | Single entry point for all AI calls | 🔴 Not started |
| 3 | **C** | Notes AI | AI features work in Notes editor | 🔴 Not started |
| 4 | **D** | Agentic Features | Tool execution with approval | ⏸️ DEFERRED |
| 5 | **E** | RAG System | Search project knowledge | ⏸️ DEFERRED |

**Do NOT touch (working ~70%):** Project CRUD, FileTree, FSA Sync

---

## Phase A: BYOK Foundation

**Goal:** Users can input and persist API keys for Gemini and OpenRouter.

**Why first:** No AI features work without API keys. The vault is 100% stubbed.

### Current State
- `credential-vault.ts` → STUB (returns null)
- `ProviderSettings.tsx` → STUB (shows "Phase 2 - Staged")
- Provider store slices → STUB (no-ops)
- All AI calls fail with "no API key"

### Restore from Archive
| Archive File | Target Location |
|--------------|-----------------|
| `_phase2-archive/lib/agent/providers/credential-vault.ts` | `src/infrastructure/ai/credential-vault.ts` |
| `_phase2-archive/lib/agent/providers/credential-encryption.ts` | `src/infrastructure/ai/credential-encryption.ts` |
| `_phase2-archive/lib/agent/providers/credential-storage.ts` | `src/infrastructure/ai/credential-storage.ts` |

### Deliverables
1. `CredentialVault` class with AES-256-GCM encryption
2. `ProviderSettings` component for API key input
3. Provider store with `hasApiKey` reactivity
4. Keys persist across browser refresh
5. **Model loading with hardcoded fallback** (added 2026-02-02)

### Plans: 5 plans in 4 waves

**Wave 1 (parallel):**
- [x] A-01-PLAN.md — Restore credential vault infrastructure ✅
- [x] A-02-PLAN.md — Restore provider vault slice ✅

**Wave 2 (depends on Wave 1):**
- [x] A-03-PLAN.md — Restore ProviderSettings UI ✅

**Wave 3 (verification):**
- [ ] A-04-PLAN.md — Integration verification (checkpoint)

**Wave 3.5 (gap fix - added 2026-02-02):**
- [ ] A-04B-PLAN.md — Model loading restoration (addresses GAP-A04-001, GAP-A04-002)

### High-Level Design Reference
- **MODEL-STRATEGY.md** — Model loading, fallback, capabilities design
- Must be loaded before planning Phase B or C

### Success Criteria
- [ ] User can input Gemini API key in settings
- [ ] User can input OpenRouter API key in settings
- [ ] Keys persist after browser refresh
- [ ] `credentialVault.getCredentials('gemini')` returns the key
- [ ] **NEW: Models load after key is saved**
- [ ] **NEW: Model dropdown shows available models**

### Isolation Boundary
- **Touches:** `src/infrastructure/ai/`, `src/presentation/components/settings/`
- **Does NOT touch:** FileTree, Project stores, Notes UI

### Schema Changes
None — `ProviderConfig.hasApiKey` and `CredentialStorage` types already exist.

---

## Phase B: AI Gateway

**Goal:** Single entry point for all AI calls using TanStack AI SDK.

**Why second:** Currently 15+ files make direct AI calls with different patterns. Unify before adding features.

### Current State
- `src/routes/api/chat.ts` → Uses TanStack AI SDK ✅
- `src/lib/notes/ai-image-service.ts` → Direct fetch() ❌
- `src/lib/notes/ai-vision-service.ts` → Direct fetch() ❌
- `src/lib/canvas/linkage-ai-enhancer.ts` → Direct @google/genai + HARDCODED KEY ❌
- 10+ other files with fragmented patterns

### Create
| New File | Purpose |
|----------|---------|
| `src/infrastructure/ai/ai-gateway.ts` | Single entry point for all AI calls |
| `src/infrastructure/ai/adapters/gemini-adapter.ts` | Gemini via @tanstack/ai-gemini |
| `src/infrastructure/ai/adapters/openrouter-adapter.ts` | OpenRouter via @tanstack/ai-openai |

### Deliverables
1. `AIGateway` service with `generate()`, `stream()`, `generateImage()` methods
2. Adapters for Gemini and OpenRouter
3. All AI calls routed through gateway
4. Remove hardcoded API key from `linkage-ai-enhancer.ts`

### Success Criteria
- [ ] `AIGateway.generate({ provider: 'gemini', prompt: '...' })` works
- [ ] `AIGateway.stream({ provider: 'openrouter', prompt: '...' })` works
- [ ] No direct fetch() to AI endpoints outside gateway
- [ ] No hardcoded API keys in codebase

### Isolation Boundary
- **Touches:** `src/infrastructure/ai/`, migrate callers in `src/lib/notes/`
- **Does NOT touch:** FileTree, Thread schema, Chat UI

### Schema Changes
None for Phase B.

---

## Phase C: Notes AI

**Goal:** AI features work in Notes editor (summarize, continue, translate, etc.)

**Why third:** User's explicit priority. Notes is isolated from Chat/Thread.

### Current State
- `note-ai-service.ts` → STUB (throws PHASE_1A_DISABLED)
- 20+ BlockNote blocks exist ✅
- AI UI components exist (dialogs, menus) ✅
- `useStreamingAI()` hook exists but calls stubbed service

### Un-stub and Wire
| File | Action |
|------|--------|
| `src/lib/notes/note-ai-service.ts` | Replace stub with AIGateway calls |
| `src/lib/notes/hooks/use-streaming-ai.ts` | Wire to working service |
| `src/presentation/components/notes/AITransformMenu.tsx` | Enable |
| `src/presentation/components/notes/InBlockAIPopup.tsx` | Enable |

### Deliverables
1. `generateNoteContent()` calls AIGateway
2. `generateNoteContentStream()` streams via AIGateway
3. Slash commands work: `/summarize`, `/continue`, `/translate`
4. AI Transform menu works on selected text

### Success Criteria
- [ ] User can type `/summarize` in note and get AI summary
- [ ] User can select text and click "Continue writing"
- [ ] User can translate note content EN↔VI
- [ ] Streaming responses render progressively

### Isolation Boundary
- **Touches:** `src/lib/notes/`, `src/presentation/components/notes/`
- **Does NOT touch:** Chat threads, ThreadMessage schema, FileTree

### Schema Changes
None — Notes uses BlockNote blocks, not ThreadMessage.

---

## Phase D: Agentic Features (DEFERRED)

**Goal:** Tool execution pipeline with approval workflow.

**Status:** ⏸️ DEFERRED until Phases A-C complete

**Why deferred:**
1. Requires ThreadMessage schema update (parts-based content)
2. Requires TOOL_REGISTRY implementation
3. Complex approval workflow
4. Not needed for Notes AI

### When to Start
- After Phase C is verified working
- User explicitly requests agentic features

### Schema Changes Required
- See `.planning/schemas/THREAD-V2-DESIGN.md`
- Add `parts: MessagePart[]` to ThreadMessage (additive)
- Add enhanced ToolCall with approval fields
- Add ToolResult with sideEffects
- Create TOOL_REGISTRY

---

## Phase E: RAG System (DEFERRED)

**Goal:** Orama-based search across project files and threads.

**Status:** ⏸️ DEFERRED until Phase D complete

**Why deferred:**
1. Depends on working AI for embeddings
2. Depends on ThreadMessage parts for proper indexing
3. Lower priority than Notes AI

### When to Start
- After Phase D is verified working
- User explicitly requests RAG features

---

## Governance Rules

### Isolation Enforcement

**Before touching ANY file, check:**
1. Is this file in the current phase's boundary?
2. Does modifying it affect a working feature?
3. If unsure → ASK, don't assume

**Working features (DO NOT BREAK):**
- Project CRUD (~70% working)
- FileTree (~70% working)
- FSA Sync (~60% working)
- Hub Dashboard (working)
- Notes UI (working, just no AI)

### Bounce-Back Protocol

**If during execution you discover:**
1. A schema needs updating → STOP, document in `.planning/schemas/`, escalate
2. A type definition is wrong → STOP, don't patch, escalate
3. Fixing X breaks Y → STOP, don't continue, escalate

**Escalation format:**
```markdown
## ESCALATION: [Issue Title]

**Phase:** [Current phase]
**Discovered:** [What you found]
**Impact:** [What would break]
**Recommendation:** [What architect should decide]
```

### Verification Before "Done"

**NO phase is complete until:**
1. TypeScript errors: 0 new errors introduced
2. Success criteria: ALL checked
3. Working features: Still working (manual verify)
4. Governance: `pnpm governance` passes

---

## Progress Tracking

| Phase | Status | Plans | Verified |
|-------|--------|-------|----------|
| A: BYOK | 🟡 Planned | 0/4 | ❌ |
| B: AI Gateway | 🔴 Not started | 0/? | ❌ |
| C: Notes AI | 🔴 Not started | 0/? | ❌ |
| D: Agentic | ⏸️ Deferred | — | — |
| E: RAG | ⏸️ Deferred | — | — |

---

## Quick Reference

### What's Stubbed (Must Restore)
- `credential-vault.ts` → Restore for Phase A
- `note-ai-service.ts` → Un-stub for Phase C
- `tool-permissions.ts` → Un-stub for Phase D

### What's Fragmented (Must Unify)
- 15+ AI endpoint patterns → Unify in Phase B

### What's Ready
- Provider types (`@/domain/types/llm/`)
- Credential types
- TanStack AI SDK packages installed
- BlockNote editor and 20+ blocks

### What NOT to Touch Yet
- ThreadMessage schema (Phase D)
- Agent entity `workspaceBindings` (never, just aliased)
- Dexie DB schema (legitimate workspaceId)
- 3,900 violations (incremental, not blocking)

---

*Roadmap created: 2026-02-01*
*Replaces: Phase 0-5 approach*
*Authority: SOURCE-OF-TRUTH.md*
