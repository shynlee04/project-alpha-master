# Advanced IDE Spike – Remediation Impact (2025-12-10)

## Purpose

Capture how the **Advanced IDE Spike** affects the MVP-0 remediation plan (`agent-os/specs/mvp-0-remediation`) and the broader brownfield refactor.

## Observed Architecture from Spikes

From `spikes/advanced-ide-spike` and local tree:

- Top-level spike layout:
  - `.serena/` (project config + memories)
  - `advanced-ide-spike/`
    - `app/api/chat.ts` (TanStack AI server endpoint with tools)
    - `src/routes/workspace/ide.tsx` (IDE route using `useChat` + client tools)
    - `src/lib/file-manager.ts` (FSA ↔ WebContainers bridge)
    - `src/lib/agent/tools.ts` (client tool registry)
    - `src/lib/tools/definitions.ts` (shared tool schemas + execution helpers)
    - `src/lib/db/pglite-demo.ts` (PGlite evidence)
  - `tanstack-ai-spike/` (earlier, simpler AI spike)

Key validated patterns:

- **Client-only runtime** with WebContainers and File System Access API.
- **TanStack AI tools** for FS/Git + shell (`read_file`, `write_file`, `list_files`, `grep`, `run_command`).
- **Chat persistence** backed by IndexedDB with a visible restore indicator.
- **PGlite** used as in-browser Postgres for IDE event logging.

## Impact on Remediation Clusters

### Cluster 1 – TanStack AI Integration

- Original spec is framed around refactoring an existing `useAgentChat` hook and agent API.
- **Update:**
  - Treat `spikes/advanced-ide-spike` as the **canonical reference** for:
    - `useChat` integration.
    - Tool schemas & client tools.
    - WebContainers-backed command execution.
  - Implementation work in the main app should **mirror** the spike patterns instead of inventing new ones.

### Cluster 2 – Route Structure Consolidation

- Original focus: cleaning up legacy `src/routes/ide/` vs `_workspace/ide`.
- **Update:**
  - Incorporate TanStack Start’s routing model as seen in the spike.
  - The target IDE route for the production app should align with `advanced-ide-spike/src/routes/workspace/ide.tsx` and its `/workspace/ide` path semantics.

### Cluster 3 – Test Consolidation

- Original target tree still holds, but:
- **Update:**
  - Add explicit test coverage for:
    - TanStack AI tools wiring.
    - FileManager/WebContainers integration.
    - Chat persistence + restore indicator.

### Cluster 4 – Domain API Enforcement

- Original plan enforces domain boundaries for stores and APIs.
- **Update:**
  - Ensure that TanStack AI tooling lives at **domain edges** (agent/IDE domains), while respecting public domain APIs.
  - Advanced IDE spike patterns should inform how agent/IDE domains expose their capabilities.

### Cluster 5 – Cleanup & Hygiene

- Original cleanup list remains valid but incomplete.
- **Update:**
  - Include legacy AI/Gemini artifacts that are superseded by the spike (old agent hooks, Vercel AI SDK, etc.) as candidates for deletion or migration.

## Implications for Specs & Standards

- `agent-os/specs/mvp-0-remediation/README.md` cluster statuses should be read as **pre-spike** and now require re-scoping.
- Cluster specs 1–5 should:
  - Reference the Advanced IDE Spike as architectural evidence.
  - Mark any outdated assumptions (e.g., legacy route structures, non-TanStack Start boot paths).
- `agent-os/standards/global/tech-stack.md` and `agent-os/product/tech-stack.md` have been updated to:
  - Record TanStack AI tools + WebContainers as **validated**.
  - Document chat persistence and restore UX as standard behavior for the IDE.

This document is the bridge between:

- CHAM remediation plans (MVP-0), and
- The new, validated client-side agentic IDE architecture.
