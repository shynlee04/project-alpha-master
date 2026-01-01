---
active: true
iteration: 1
max_iterations: 100
completion_promise: "All 4 Workspaces (IDE, Knowledge, Study, Notes) share unified Zustand stores, identical LLM/Agent config, and synchronized file access."
started_at: "2026-01-02T12:00:00+07:00"
module: "grand-unification-refactor"
---

# Context: The "Grand Unification" Refactor
We are pivoting from a fragmented "IDE + Extras" app to a unified **Knowledge Synthesis Platform**. Currently, state is scattered between `useState` (legacy), disparate `Zustand` stores, and `Context` providers.

## Core Mandates (Single Source of Truth)
1.  **Unified LLM Configuration**:
    *   **Goal**: One persistent `LLMStore` (Dexie-backed) for all workspaces.
    *   **Rule**: `providerId` + `apiKey` + `modelList` are stored *once*. No component stores its own keys.
    *   **UI**: Read-only endpoints (hardcoded bases). User only inputs Keys/Custom Headers.
2.  **Unified Agent Vault**:
    *   **Goal**: Agents defined in `AgentStore` are accessible in IDE, Chat, and Canvas.
    *   **Rule**: Agents have `capabilities` (e.g., `canEditFiles`, `canSearchWeb`). Workspaces filter agents by capability, not by arbitrary hardcoding.
3.  **Unified Project & File System**:
    *   **Goal**: "Project" = Local Folder.
    *   **Rule**: The `FileTree` component in IDE must be the *same* data source as the "Source Manager" in Knowledge.
    *   **Sync**: Dragging a PDF into `Knowledge` -> appears in `IDE` filetree. Editing a `.md` in `IDE` -> updates `Knowledge` node content.

## Task: Iteration {iteration}
Review the current codebase state. Pick **ONE** unification target below that is currently broken or fragmented and fix it.

### Target A: LLM & Agent Config Unification
*   **Scan**: Find all instances of `useState` used for API keys or Model selection.
*   **Action**: Migrate them to `useLLMStore` or `useAgentStore`.
*   **Verify**: Changing a key in Settings immediately updates the Chat agent in the IDE workspace without reload.

### Target B: File System Unification
*   **Scan**: Identify `IDELayout` file tree vs `SourceManager` file lists.
*   **Action**: Abstract file access to a single `useFileSystem` hook that reads from the unified OPFS/FSA adapter.
*   **Verify**: A file created in IDE shows up in the Knowledge Source list.

### Target C: Chat & Thread Unification
*   **Scan**: Check `ChatPanel` (IDE) vs `KnowledgeChat` (RAG).
*   **Action**: Refactor into a single `GlobalChatOrchestrator` that accepts a `context` prop (Codebase vs. Vault).
*   **Verify**: Chat history persists when switching tabs.

## Constraints
*   **No "God Components"**: Break files > 300 lines.
*   **Hygiene**: Remove all commented-out legacy code immediately.
*   **Atomic**: Fix one store/component chain per iteration.

## Validation (Run after every change)
```bash
pnpm tsc --noEmit && pnpm test
```

## Completion Signal
If all 4 workspaces share the same `src/lib/state` stores and data flows are proven unified:
<promise>DONE</promise>
