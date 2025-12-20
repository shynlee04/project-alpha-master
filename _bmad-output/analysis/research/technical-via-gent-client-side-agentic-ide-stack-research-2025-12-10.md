## 7. Current via-gent integration snapshot (as of 2025-12-10)

This section captures the **actual state of the codebase** after the failed remediation attempt, focusing on the core integration points between routing, domains, WebContainers, and TanStack AI.

### 7.1 Chat & agent orchestration

- **Custom chat hook (`src/app/hooks/useAgentChat.ts`)**
  - Manages its own `messages`, `isResponding`, `isExecutingTool`, `currentTool`, `error` state.
  - Builds prompts by optionally injecting **file context** from the IDE:
    - Uses `useIDEAPI()` from `DomainProvider` to pull `activeFile` and its contents.
  - Calls `fetch('/api/chat')` directly and manually consumes the `ReadableStream`:
    - Parses `data: ...` SSE lines as `JSON`, expecting `{ text, tool_call }`-shaped chunks.
    - Updates local message state and `currentTool` flags ad-hoc.
  - Emits domain events via `emitEvent({ type: 'agent.message' | 'agent.error', payload: { version: '1.0.0', ... } })`.
  - **Not** implemented using `@tanstack/ai-react` `useChat` or `@tanstack/ai-client` `createChatClientOptions`.

- **Agent chat UI (`src/components/ide/AgentChatPanel.tsx`)**
  - Maintains its own `messages` state solely for rendering purposes.
  - Relies on an optional `onSendMessage?: (message: string) => Promise<void>` prop.
  - When no handler is provided, falls back to a demo echo response.
  - Knows nothing about TanStack AI message types, tool calls, or streaming; those concerns are hidden in `useAgentChat`.

- **DomainProvider wiring (`src/app/providers/DomainProvider.tsx`)**
  - Exposes domain APIs via hooks:
    - `useIDEAPI(): IDEAPI`
    - `useAgentAPI(): AgentAPI`
    - `useProjectAPI(): ProjectAPI`
    - `useLLMAPI(): LLMAPI`
  - `AgentAPI` and `IDEAPI` are the correct abstraction layers through which tools should talk to the IDE and project state.

### 7.2 Agent tools & domain APIs

- **Legacy domain tool layer (`src/domains/agent/api/AgentAPI.ts`)**
  - Defines `AgentAPI` over `AgentService` + `ToolRegistry`.
  - `createDefaultTools(ideAPI?: IDEAPI)` registers tools that are already wired to domain behavior:
    - `readFile`, `writeFile`, `createFile`, `deleteFile`, `runCommand`, `listFiles`, `openFile`.
  - These tools interact with the IDE through domain APIs (eg `ideAPI.editor.getContent`, `ideAPI.terminals.runCommand`).
  - This layer is independent from TanStack AI and predates the AI remediation.

- **New TanStack AI tool layer (`src/lib/agent-tools.ts`)**
  - Uses `toolDefinition` from `@tanstack/ai` + Zod to define tools:
    - `read_file`, `write_file`, `create_file`, `list_files`, `open_file`, `execute_command`, `propose_diff`, `apply_diff`, `search_files`.
  - Exports `agentTools`, `getServerTools()`, `getToolNames()`, and legacy schemas (`ReadFileSchema`, `WriteFileSchema`, etc.).
  - **Critical gap:** only **definitions** exist; there are no `.client(...)` implementations wired into `IDEAPI`, `AgentAPI`, or `WebContainerManager`.
  - The server implementations are created ad-hoc in `api.chat.ts` and currently only log to the console.

- **Resulting state**
  - There are effectively **two parallel tool systems**:
    1. Legacy **domain tools** (AgentAPI/ToolRegistry) that are actually integrated with the IDE and tests.
    2. New **TanStack-AI-style definitions** that are not connected to domain APIs or WebContainers.
  - This mismatch explains why the first remediation generated many new types and files but did not produce an actually working TanStack AI integration.

### 7.3 WebContainers & IDE shell

- **WebContainers runtime (`src/lib/webcontainer-manager.ts`)**
  - Boots a singleton `WebContainer` with timeout and **offline fallback**.
  - Integrates with IDE store:
    - `setShellStatus('booting' | 'ready')`, `setEnvironmentReady(true)`, `setBootError('Offline mode: ...')`.
  - Provides `boot`, `mount`, and `spawn` APIs that are suitable for routing all terminal/test/command operations through the browser runtime.
  - Matches external best practices: browser-only Node runtime, offline mode, output streaming via `WritableStream`.

- **IDE shell & routing (`src/routes/_workspace/ide/index.tsx`)**
  - Provides the **single-screen IDE layout** used for `/ide`:
    - Left: `FileTree` (explorer).
    - Center: `EditorTabs` + `MonacoEditor`.
    - Bottom: `XTerminal`.
    - Right: `AgentChatPanel` and `PreviewPanel` based on search param `rightPanel`.
  - Currently reads search as `any`:
    ```ts
    const search = Route.useSearch()
    const view = (search as any)?.view || 'code'
    const rightPanel = (search as any)?.rightPanel || 'none'
    const file = (search as any)?.file || ''
    ```
  - Does **not** yet use `ideSearchSchema` with `zodValidator`, and legacy `src/routes/ide/` still exists, violating the “single route tree” constraint.

---

## 8. Deep Dive Architecture: Local FS, Git, and WebContainer Sync (2025-12-10 Update)

To address the requirement for "real git support" and "total client-side persistence", we have established the following architectural patterns.

### 8.1 The "Sync Layer" Architecture

We effectively have **two file systems** that must be synchronized:
1.  **Local FS (Primary)**: The user's actual disk, accessed via File System Access API (FSA).
2.  **WebContainer FS (Virtual)**: The in-memory Node.js runtime filesystem.

**Synchronization Strategy: "Dual-Write + External Watch"**

*   **Write Operations (IDE -> Disk)**:
    *   User types in Monaco -> `FileManager.writeFile`
    *   Step 1: Write to `FileSystemFileHandle` (Persists to local disk).
    *   Step 2: Write to `webContainerInstance.fs.writeFile` (Updates runtime instantaneously).
    *   *Result*: `npm run` inside WebContainer sees the change immediately.

*   **Read Operations**:
    *   Monaco reads directly from `FileSystemFileHandle` (Single Source of Truth).

*   **Generated Files (WebContainer -> Disk)**:
    *   Agent runs `npm install` or `fs.writeFileSync`.
    *   **Mechanism**: `webContainerInstance.fs.watch('./', { recursive: true })`
    *   **Handler**: On `change` event:
        1.  Check ignore list (specifically `node_modules` - do NOT sync back to Windows for performance).
        2.  Read file from Virtual FS.
        3.  Write to `FileSystemFileHandle`.

*   **External Changes (VS Code -> IDE)**:
    *   User edits file in external VS Code.
    *   **Mechanism**: `FileSystemObserver` (Chrome 129+ Origin Trial) or Polling Fallback.
    *   **Handler**: On external change -> `webContainerInstance.fs.writeFile` to update the runtime.

### 8.2 Client-Side "Real" Git

The requirement is to operate on the **local .git folder**, not a cloned version locally.

**The Adapter Pattern**:
`isomorphic-git` requires a Node.js `fs` interface. The browser provides `FileSystemDirectoryHandle`.
We must implement a **Custom FS Adapter** (`LocalGitFS`) that maps `iso-git` calls to FSA handle operations.

```typescript
// Architectural Diagram
[Terminal "git commit"] 
      |
      v
[Main Thread Interceptor]
      |
      v
[isomorphic-git]
      |
      v
[LocalGitFS Adapter]
      |
      v
[FileSystemDirectoryHandle] -> [User's .git folder]
```

**Performance vs Correctness**:
*   To avoid 10s latency on `git status`, the `LocalGitFS` adapter acts as a caching layer for handle resolution.
*   Operations like `push`/`pull` use standard HTTP CORS proxies or supported remotes, reading packfiles directly from the local disk.

### 8.3 The Permission Model "Re-hydration"

To satisfy "simulating local development permissions":

1.  **Session Start**: User verifies intent via `window.showDirectoryPicker`.
2.  **Request**: App requests `mode: 'readwrite'`.
    *   *Critical*: This must be the **Directory** permission.
3.  **Persistence**:
    *   Store the `FileSystemDirectoryHandle` in IndexedDB.
    *   On page reload: Retrieve handle.
    *   **User Gesture**: Show a "Resume Workspace" toast. User click -> `handle.requestPermission()`.
    *   *Result*: Browser grants access to the *entire tree*.
4.  **Agent Security**:
    *   AI Agents (TanStack AI tools) **DO NOT** access raw handles.
    *   They call `AgentAPI.tools.writeFile`.
    *   `AgentAPI` delegates to `FileManager`.
    *   `FileManager` enforces a "Jail" check (ensure path is within root).
    *   This prevents Agents from exploring `C:\Windows` even if the browser technically could (if the user picked root).

---

## 9. Root causes of previous remediation failures

The failed remediation, as captured in `REMEDIATION-HONEST-REPORT-2025-12-10.md`, can be traced to a combination of **architectural** and **process** issues rather than isolated coding mistakes.

### 8.1 Hybrid, unreconciled tool systems

- Legacy **AgentAPI + ToolRegistry** already provided a coherent, domain-driven tool layer.
- The remediation added a **second tool system** with `toolDefinition` but did not:
  - Bridge it into `AgentAPI` and domain APIs.
  - Wire `execute_command` and other tools to `WebContainerManager`.
  - Maintain a single source of truth for tool schemas and behavior.
- Consequence:
  - TanStack AI tools existed “on paper” but did not actually control the IDE or runtime.
  - Tests and existing workflows still depended on the legacy tools, so integration drift increased.

### 8.2 Custom chat orchestration instead of `useChat`

- `useAgentChat` implemented a **custom SSE client**:
  - Manual `fetch('/api/chat')` + `ReadableStream` handling.
  - Custom message and tool-call shapes `{ text, tool_call }`.
  - No usage of `useChat`, `createChatClientOptions`, `clientTools`, or `InferChatMessages`.
- This duplicated TanStack AI’s responsibilities:
  - Message typing,
  - Tool call/result streaming,
  - Agent loop management.
- Consequence:
  - Type mismatches between server (`chat()` chunks) and client expectations.
  - No end-to-end type safety across messages/tools.
  - Harder to adopt future TanStack AI improvements.

### 8.3 Cluster ordering and missing validation gates

- Specs (and `docs/bmm-workflow-status.yaml`) clearly define execution order:
  - `Cluster 2 → 5 → 4 → 3 → 1`, with Cluster 1 **last**.
- In practice, Cluster 1 (TanStack AI) was attempted first, while:
  - Route duplication still existed.
  - Domain API boundaries were not enforced.
  - Tests were scattered and brittle.
- Additionally, after each cluster the required gates were not enforced:
  - `pnpm typecheck` (0 errors),
  - `pnpm test` (all tests passing),
  - `pnpm dev` (clean start),
  - Manual smoke checks.
- Consequence:
  - 100+ TypeScript errors and 46 failing tests accumulated.
  - It became impossible to isolate which change caused which failure.

### 8.4 Research that described libraries but not integrations

- The research docs correctly summarized TanStack Start, Router, AI, and WebContainers but:
  - Did not enforce creation of **small working spikes** integrating those libraries with via-gent’s domain layer.
  - Did not define **message contracts** and tool wiring between client and server.
- Consequence:
  - Agents had “surface-level” context (what these libraries are) but not deep, project-specific integration know-how (how they must interact with `AgentAPI`, `IDEAPI`, `WebContainerManager`, and the route tree).

---

## 9. Research-driven recommendations for remediation clusters

These recommendations are **architectural and sequencing constraints** that should inform the actual implementation work governed by the MVP-0 remediation specs (`agent-os/specs/mvp-0-remediation/*.md`).

### 9.1 Cluster 2 – Route Structure Consolidation

- Enforce a **single IDE route tree** under `_workspace`:
  - Delete `src/routes/ide/` entirely.
  - Ensure `/ide` is the public path backed by `_workspace/ide/index.tsx`.
- Centralize IDE search params in `lib/ide-search.ts`:
  - `ideSearchSchema` + helpers.
  - `validateSearch: zodValidator(ideSearchSchema)` in `_workspace.tsx` and `_workspace/ide/index.tsx`.
- Plan for Router middlewares later:
  - `retainSearchParams` to keep core workspace state across internal navigation.
  - `stripSearchParams` to remove defaults from URLs.

### 9.2 Cluster 5 – Cleanup & Hygiene

- Remove **structural noise** that confuses AI agents:
  - Delete obsolete directories (`src/components/storybook/`, `src/data/`, legacy hooks, empty `__tests__` trees).
- Clarify roles of:
  - `lib/coordinator-agent.ts` (high-level orchestration vs TanStack AI agents).
  - `lib/gemini-client.ts` vs `infrastructure/ai/GeminiAdapter.ts` (one should be canonical for provider wiring).
  - `lib/app-store.ts` (migrate or remove to keep domain boundaries clean).

### 9.3 Cluster 4 – Domain API Enforcement

- Treat `domains/*/index.ts` as the **only public surface** for domain logic:
  - RootStore and components must not import from `domains/*/core/*` directly.
- Plan the **bridge** from TanStack AI tools to domain APIs:
  - `.server(...)` implementations in `agent-tools.ts` should call `AgentAPI`, `IDEAPI`, `ProjectAPI`, `LLMAPI` methods rather than duplicating logic.
  - This keeps business rules in the domain layer.

### 9.4 Cluster 3 – Test Consolidation

- Move all tests to `src/__tests__/**` as per `agent-os/standards/testing/test-writing.md`.
- After domain API enforcement, update tests to:
  - Rely on domain/index exports,
  - Use consistent message and event shapes (including required `version` fields),
  - Reset shared state between tests to avoid leakage.

### 9.5 Cluster 1 – TanStack AI Integration (last)

- Replace `useAgentChat` internals with `useChat` from `@tanstack/ai-react`:
  - Configure via `createChatClientOptions` and `clientTools(...)`.
  - Preserve IDE-aware context injection by adding system/user messages, but keep message types compatible with TanStack AI.
- Use `agent-tools.ts` as the canonical source of tool schemas:
  - Implement `.server(...)` functions that delegate to domain APIs and `WebContainerManager`.
  - Implement `.client(...)` for UI-only/local behaviors.
- Keep the agentic cycle explicit:
  - Configure `maxIterations` and respect tool approval patterns for sensitive operations (eg `propose_diff`/`apply_diff`).

Taken together, these recommendations turn the Phase 1 research into a **concrete integration blueprint** that aligns CHAM remediation clusters, Agent-OS product documents, and TanStack’s official patterns. Implementation work in subsequent phases must treat this document as a **governance artifact**, not just a narrative reference.