# Project Alpha

## What This Is

Project Alpha is a client-side AI-powered development IDE with RAG and agentic features. It runs entirely in the browser, supporting desktop (File System Access API) and mobile/tablet (IndexedDB) platforms. Users can create projects, manage files, chat with AI assistants that have tool-calling capabilities, and leverage RAG for context-aware responses.

## Core Value

**Users can interact with AI that reads, writes, and understands their project files — all client-side with zero data sent to our servers.**

## Requirements

### Validated

<!-- Existing codebase capabilities — identified from brownfield analysis -->

- ✓ Basic Dexie.js persistence layer — existing
- ✓ TanStack Start framework scaffolding — existing
- ✓ Zustand state management setup — existing
- ✓ 8-bit design system foundation — existing

### Active

<!-- Current scope. See REQUIREMENTS.md for full REQ-ID list. -->

- [ ] Eliminate 1,734 workspace/lib violations (CLEAN-01 through CLEAN-05)
- [ ] FileTree operator with project/file CRUD and sync (PLAT-01 through PLAT-05)
- [ ] Chat-Cascade operator with thread management (PLAT-06 through PLAT-10)
- [ ] AI tool execution pipeline with approval workflow (AI-01 through AI-07)
- [ ] Feature modules: Monaco, Notes with AI (MOD-01 through MOD-06)
- [ ] RAG system with Orama integration (RAG-01 through RAG-05)
- [ ] Terminal, Preview, and polish (TERM-01 through TERM-06)

### Out of Scope

- Real-time collaboration — High complexity, not core to solo IDE value
- Native mobile app — Web-first, PWA later
- Self-hosted AI models — BYOK to external providers only
- Video/audio in chat — Text, code, and images only

## Context

**Brownfield refactoring:** This is a major architectural cleanup, not a greenfield build. The codebase has 1,734 violations that create entity confusion (workspace vs project terminology) and import path violations (@/lib/ instead of canonical paths).

**Research completed:** Detailed research in `.planning/research/` covers stack validation, feature landscape, architecture patterns, and domain pitfalls. Key finding: Platform Operators (FileTree, Chat-Cascade) are infrastructure, NOT plugins.

**Architecture authority:** `.planning/SOURCE-OF-TRUTH.md` is the canonical architecture document. All decisions flow from there.

**Elimination targets:** `.planning/KILL-PLAN.md` contains exact violation counts and replacement mappings.

## Constraints

- **Privacy**: 100% client-side execution; no user data to Project Alpha servers
- **Storage**: FSA on desktop, IndexedDB on mobile — never both simultaneously per project
- **Stack**: TanStack Start, Zustand v5, Dexie.js, Orama, TanStack AI SDK — locked
- **File limits**: Max 300 lines for stores, 400 lines for components
- **Design**: 8-bit design system with sharp corners, pixel shadows, stepped animations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Project-centric model (no workspaces) | Eliminate entity confusion; files belong to projects | — Pending |
| Platform Operators vs Feature Modules | FileTree/Chat-Cascade are infrastructure, not optional plugins | — Pending |
| Parts-based ThreadMessage content | Enable multi-modal AI responses (text, code, artifacts, tool calls) | — Pending |
| Gemini + OpenRouter as Tier 1 providers | OpenAI-compatible APIs, cost-effective, user's preference | — Pending |
| Single AI Gateway pattern | Centralized routing, not provider-per-file | — Pending |

---
*Last updated: 2026-02-01 after GSD initialization*
