# Project Alpha

## What This Is

Project Alpha is a client-side AI-powered development IDE with RAG and agentic features. It runs entirely in the browser, supporting desktop (File System Access API) and mobile/tablet (IndexedDB) platforms. Users can create projects, manage files, chat with AI assistants that have tool-calling capabilities, and leverage RAG for context-aware responses.

## Core Value

**Users can interact with AI that reads, writes, and understands their project files — all client-side with zero data sent to our servers.**

## Feature Groups

### Working (~70%)

These features function despite architectural violations. **DO NOT BREAK.**

- ✓ Project CRUD — create, open, delete projects
- ✓ FileTree — browse, create, edit, delete files
- ✓ FSA Sync — sync to file system on desktop
- ✓ Hub Dashboard — project listing and navigation
- ✓ Notes UI — BlockNote editor with 20+ block types

### Blocked (Stubbed)

These features are stubbed out and non-functional.

- ✗ **BYOK/Vault** — API key storage (credential-vault.ts is stub)
- ✗ **AI Generation** — note-ai-service.ts returns PHASE_1A_DISABLED
- ✗ **Tool Execution** — tool-permissions.ts returns empty
- ✗ **Provider Settings** — UI shows "Phase 2 - Staged"

### Not Built

These features don't exist yet.

- ○ AI Gateway — unified entry point for all AI calls
- ○ RAG System — Orama indexing and search
- ○ Tool Approval — user approves before AI writes files
- ○ Terminal/Preview — WebContainer integration

## Requirements

### Phase A: BYOK Foundation

- [ ] **BYOK-01**: User can input Gemini API key in settings
- [ ] **BYOK-02**: User can input OpenRouter API key in settings
- [ ] **BYOK-03**: API keys persist across browser refresh (encrypted in IndexedDB)
- [ ] **BYOK-04**: Provider settings UI shows key status (stored/not stored)

### Phase B: AI Gateway

- [ ] **GW-01**: AIGateway service routes all AI calls
- [ ] **GW-02**: Gemini adapter uses @tanstack/ai-gemini
- [ ] **GW-03**: OpenRouter adapter uses @tanstack/ai-openai (compatible)
- [ ] **GW-04**: No direct fetch() to AI endpoints outside gateway
- [ ] **GW-05**: No hardcoded API keys in codebase

### Phase C: Notes AI

- [ ] **NAI-01**: Slash command `/summarize` generates summary
- [ ] **NAI-02**: Slash command `/continue` continues writing
- [ ] **NAI-03**: AI Transform menu works on selected text
- [ ] **NAI-04**: Streaming responses render progressively
- [ ] **NAI-05**: In-block AI popup generates content

### Phase D: Agentic (DEFERRED)

- [ ] **AGT-01**: TOOL_REGISTRY defines available tools
- [ ] **AGT-02**: write_file requires user approval
- [ ] **AGT-03**: ToolResult tracks side effects (files created/modified)
- [ ] **AGT-04**: ThreadMessage uses parts-based content

### Phase E: RAG (DEFERRED)

- [ ] **RAG-01**: Per-project Orama index created
- [ ] **RAG-02**: Files can be indexed for search
- [ ] **RAG-03**: search_rag tool returns relevant results

### Out of Scope

- Real-time collaboration — High complexity, not core to solo IDE value
- Native mobile app — Web-first, PWA later
- Self-hosted AI models — BYOK to external providers only
- Video/audio in chat — Text, code, and images only

## Context

**Feature-group remediation (2026-02-01):** Previous phase-based approach (0-5) failed because violations were addressed without understanding feature dependencies. New approach isolates by feature group:
- Phase A: BYOK (nothing works without API keys)
- Phase B: AI Gateway (unify fragmented endpoints)
- Phase C: Notes AI (user priority)
- Phases D-E: Deferred until A-C complete

**What's stubbed:** CredentialVault, NoteAIService, ToolPermissions, ProviderSettings — all return stubs/errors.

**What's fragmented:** 15+ files make direct AI calls with different patterns (fetch, @google/genai, TanStack AI SDK).

**Schema readiness:** Types for A-C exist. Phase D requires additive schema changes (see `.planning/schemas/THREAD-V2-DESIGN.md`).

## Constraints

- **Privacy**: 100% client-side execution; no user data to Project Alpha servers
- **Storage**: FSA on desktop, IndexedDB on mobile — never both simultaneously per project
- **Stack**: TanStack Start, Zustand v5, Dexie.js, Orama, TanStack AI SDK — locked
- **File limits**: Max 300 lines for stores, 400 lines for components
- **Design**: 8-bit design system with sharp corners, pixel shadows, stepped animations
- **AI Providers**: Gemini and OpenRouter (OpenAI-compatible) — Tier 1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Feature-group isolation | Fix by feature, not violation count | — Pending |
| BYOK before AI Gateway | Can't test AI without API keys | — Pending |
| Notes AI before Agentic | User priority, simpler scope | — Pending |
| Schema changes additive | Add `parts` alongside `content`, no breaking changes | — Pending |
| Leave Agent.workspaceBindings | Already aliased to PluginCapability, rename is cosmetic | — Decided |
| TanStack AI SDK for all AI | Consolidate @google/genai, fetch() patterns | — Pending |

---
*Last updated: 2026-02-01 after roadmap restructure*
