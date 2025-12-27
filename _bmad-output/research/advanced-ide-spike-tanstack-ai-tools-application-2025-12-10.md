# Advanced IDE Spike – TanStack AI Tools Application (2025-12-10)

## Purpose

This note connects the TanStack AI research docs to the **Advanced IDE Spike** under `spikes/advanced-ide-spike`, and documents how the validated tool architecture is actually exercised in a real browser-only IDE.

## Context

- **Framework:** TanStack Start ^1.140.0 (React, file-based routes).
- **AI stack:** TanStack AI ^0.0.3 + @tanstack/ai-react + @tanstack/ai-client + @tanstack/ai-gemini.
- **Runtime:** WebContainers + File System Access API via `FileManager`.

The spike is reachable at:

- `spikes/advanced-ide-spike/src/routes/workspace/ide.tsx`
- `spikes/advanced-ide-spike/app/api/chat.ts`
- `spikes/advanced-ide-spike/src/lib/agent/tools.ts`
- `spikes/advanced-ide-spike/src/lib/tools/definitions.ts`

## Validated Tool Set

The spike exercises a concrete TanStack AI tool suite that will be adopted by the brownfield app:

- `read_file`
- `write_file`
- `create_file`
- `delete_file` (planned; still non-destructive in spike)
- `list_files`
- `grep`
- `run_command`

### Implementation Highlights

- **Server-side tool schemas** live in `app/api/chat.ts` via `toolDefinition()` and Zod input/output schemas.
- **Client-side tool implementations** live in `src/lib/agent/tools.ts` using `toolDefinition().client` + `clientTools(...)`.
- **Execution helpers** in `src/lib/tools/definitions.ts` bridge tools to:
  - `FileManager.readFile` / `writeFile` / `listFiles`.
  - WebContainers `fs.readdir/readFile/stat` for `grep`.
  - WebContainers process API + Git service for `run_command`.

Result: TanStack AI tools are **fully wired** end-to-end in a client-only environment.

## Chat Orchestration & Persistence

- `useChat` from `@tanstack/ai-react` is used directly in `workspace/ide.tsx` with:
  - `connection: fetchServerSentEvents('/api/chat')`.
  - `tools: agentTools` from the spike’s client tool registry.
- Chat history is persisted via `PersistenceLayer`:
  - Stored as `ChatMessage` + `ChatMessagePart[]` in IndexedDB.
  - Tool-call (`type: 'tool-call'`) and tool-result (`type: 'tool-result'`) parts are preserved, not flattened.
  - A lightweight **“Restored last chat”** badge in the header surfaces when history is rehydrated.

This provides a **reference implementation** for future brownfield refactors of the main IDE shell.

## Implications for Remediation Clusters

- **Cluster 1 – TanStack AI Integration** should treat the Advanced IDE Spike as the canonical blueprint for:
  - `useChat` usage.
  - Tool schema definitions.
  - Client-side tool execution and persistence.
- **Cluster 2 – Routes** must consider TanStack Start’s route model (`app/` + `src/routes`) and the spike’s `/workspace/ide` route as the target shape.
- **Clusters 3–5** (tests, domain APIs, cleanup) should:
  - Add tests around the new advanced IDE patterns.
  - Enforce domain boundaries while keeping TanStack AI tooling at the edges (agent domain).

This document should be kept in sync with:

- `docs/research/tanstack-ai-tools-2025-12-10.md`
- `docs/analysis/research/technical-via-gent-client-side-agentic-ide-stack-research-2025-12-10.md`
- `docs/bmm-workflow-status.yaml` (Phase 3 advanced_spike section).
