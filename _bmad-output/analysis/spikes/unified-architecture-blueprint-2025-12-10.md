# Unified Architecture Blueprint: Advanced Client-Side Agentic IDE
**Date:** 2025-12-10
**Version:** 1.0.0
**Status:** VALIDATED

## 1. Executive Summary

This blueprint consolidates all research streams (TanStack AI, WebContainers, Git, Routing) into a single cohesion architecture. It specifically resolves the "Split Brain" file system issue and defines the exact data flow for a high-performance, persistent, client-side IDE.

**Core Philosophy:** "The Browser *is* the Local Machine."
We do not treat the browser as a dumb client. We treat it as a runtime environment that mounts the User's Local Disk as its primary storage.

---

## 2. The "Unified File System" Strategy (Solving Split Brain)

Previous failures stemmed from isolating `isomorphic-git` (LightningFS) from `WebContainer` (MemFS).

**The Solution: The "Hub & Spoke" FS Model on Main Thread**

*   **The Hub**: `FileManager` (Singleton Service).
    *   Holds the `FileSystemDirectoryHandle` (The Source of Truth).
    *   Manages the "Sync Loop".

*   **Spoke A: WebContainer (Runtime)**
    *   **Mounting**: On boot, `FileManager` generic tree -> `webContainer.mount()`.
    *   **Updates (Downstream)**: `FileManager` watches Local Handle. On change -> `wc.fs.writeFile()`.
    *   **Updates (Upstream)**: `wc.on('file-change')` -> `FileManager` -> `handle.createWritable()`.

*   **Spoke B: Git Service (Version Control)**
    *   **Adapter**: `LocalGitFSAdapter` implements Node's `fs` API but routes calls to `FileManager`'s handles.
    *   **Execution**: `isomorphic-git` runs in Main Thread (Worker optional but complex). It reads/writes directly to the User's Disk via the Adapter.
    *   *Crucial*: It does NOT use LightningFS interactively. It uses LightningFS ONLY for internal Git indices if raw access is too slow (Performance Optimization), but the *Worktree* is the Local Disk.

---

## 3. TanStack AI Integration (The Agent "Brain")

We use `@tanstack/ai-react` + `useChat` for the Agent Loop, fully typed with Zod.

### 3.1 The "Agent -> Tool -> Terminal" Mechanics

**User Goal:** "Agent, install lodash."

1.  **Chat Loop**:
    *   `useChat` sends prompt to generic backend (OpenAI/Anthropic).
    *   Backend returns JSON stream with `tool_call: run_command("npm install lodash")`.

2.  **Tool Executor (Client-Side)**:
    *   We define `run_command` via `toolDefinition().client()`.
    *   **The Interception**:
        ```typescript
        const runCommand = runCommandDef.client(async ({ command }) => {
           // 1. Echo to Terminal UI (UX)
           ideStore.appendTerminalOutput(`> ${command}\n`);

           // 2. Route Check
           if (command.startsWith('git ')) {
              return await gitService.execute(command); // Main Thread
           } else {
              return await webContainer.spawn(command); // Worker Runtime
           }
        });
        ```

3.  **Persistence (Chat History)**:
    *   `PersistenceLayer` (new component) subscribes to `useChat` updates.
    *   Debounce writes full message history to `idb-keyval` under key `chat_history_${projectId}`.
    *   On Boot: `initialMessages` loaded from IDB.

---

## 4. TanStack Router & State

**URL as State (Truth)**
*   `activeFile`: `/workspace/$projectId?file=src/index.ts`
*   `activeSidebar`: `/workspace/$projectId?panel=explorer`
*   *Validation*: `zodValidator` ensures file paths are safe strings.

**The Store (Ephemeral UI State)**
*   Terminal Output buffer.
*   Tree expansion state.
*   Unsaved file "dirty" flags.

---

## 5. Dependency Verification

We align these package versions with the current via-gent spikes to ensure compatibility:
*   `@tanstack/react-router`: ^1.140.0
*   `@tanstack/react-start`: ^1.140.0
*   `@tanstack/ai-react`: ^0.0.3 (Verified for SSE + Tools)
*   `@webcontainer/api`: ^1.4.0
*   `isomorphic-git`: ^1.27.0
*   `idb-keyval`: ^6.2.1 (Simple Promise-based IDB)

## 6. Implementation Checklist (The "Golden Path")

1.  **Scaffold**: `npm create @tanstack/start` (Baseline).
2.  **Persistence**: `npm install idb-keyval` -> Create `ChatPersistence` service.
3.  **FS Hub**: Implement `FileManager` with `showDirectoryPicker`.
4.  **Runtime**: Boot `WebContainer` and wire `FileManager` sync.
5.  **Git**: Implement `LocalGitFSAdapter` -> wire to `isomorphic-git`.
6.  **Agent**: Wire `useChat` -> `ToolExecutor` -> `FileManager/Git/WC`.

This blueprint supersedes all previous "fragmented" research.
