# Advanced IDE Spike: Mechanics & Data Flow Analysis

**Date:** 2025-12-10
**Context:** Deep dive into "User's failed spike" vs "Required Mechanics" for Agent persistence, Tool-Terminal translation, and Sync.
**Status:** Historical analysis of the original spike state + target mechanics. For current routing/config, see the advanced-ide spike spec and unified architecture blueprint.

## 1. The "Broken" State (Current Spike Analysis)

Analysis of the provided `spikes/advanced-ide-spike` files reveals why it is "superficial":

### A. State Persistence Gap
*   **File**: `src/lib/ide/store.ts`
*   **Finding**: `ideStore` initializes with static defaults (`initialState`). There is **no Middlewares**, no `persist`, no `rehydrate`.
*   **Effect**: Refreshing the page wipes the File Tree expansion, Open Files, Terminal History, and explicitly the **Chat History** (which is localized in `ide.tsx` state).

### B. The "Split Brain" Filesystem
*   **Git**: `src/lib/git/operations.ts` uses `new LightningFS('via-gent-fs')`. This creates an IndexedDB sandbox "A".
*   **Runtime**: `src/lib/webcontainer/manager.ts` uses `WebContainer.boot()`. This creates a Memory filesystem sandbox "B".
*   **Effect**: `git clone` writes to "A". `npm install` runs in "B". They cannot see each other. The user's local disk "C" is never touched.

### C. Tool Disconnect
*   **File**: `src/lib/tools/definitions.ts`
*   **Finding**: Tools are defined using Zod schemas, but they are "Ghost Tools". They have no implementation wired to `WebContainer` or `IDEStore`.
*   **Effect**: The agent "thinks" it ran a command, but nothing happened in the generic terminal.

---

## 2. Corrective Mechanics (The "Deep" Design)

To meet the user's requirements for "Agent Persistence" and "Terminal Translation", we implement the following:

### 2.1 Agent State Persistence (The "Brain" Store)

We must move Chat State out of `ide.tsx` and into a persistent `ChatStore` backed by generic storage (IDB).

```typescript
// Mechanics: Chat Persistence
start_session() {
   // 1. Check IDB for 'chat_session_{projectId}'
   // 2. Load into TanStack Store
   // 3. Render Agent UI
}

on_agent_message(msg) {
   // 1. Update Store
   // 2. Write to IDB (debounced)
}
```

### 2.2 Tool -> Terminal Translation

When Agent calls `run_command(cmd="npm install")`:

1.  **Agent Logic**:
    *   LLM yields `tool_call: { name: 'run_command', args: { command: 'npm install' } }`.
2.  **Tool Executor** (Interceptor):
    *   Check: Is this a `git` command?
        *   Yes: Route to `GitService` (Main Thread).
        *   No: Route to `WebContainerManager`.
3.  **Terminal Echo** (Critical for UX):
    *   **Agent** is "typing" into the terminal.
    *   Action: `ideStore.appendTerminalOutput(\`> ${cmd}\n\`)`
    *   Action: `wc.spawn(cmd)`
    *   **Stream Pipe**: `process.output.pipeTo( new WritableStream({ write(data) { ideStore.appendTerminalOutput(data) } }) )`
    *   *Result*: User sees the command output in the UI as if they typed it.

### 2.3 The "Sync Layer" Data Flow

To solve the "Split Brain":

**Scenario: Agent writes `src/App.tsx`**

1.  **Agent**: Calls `write_file('src/App.tsx', content)`.
2.  **FileManager** (The Coordinator):
    *   **Step A (Disk)**:
        *   `handle = await rootHandle.getFileHandle('src/App.tsx')`
        *   `access = await handle.createWritable()`
        *   `await access.write(content)`
    *   **Step B (Runtime)**:
        *   `await webContainer.fs.writeFile('src/App.tsx', content)`
    *   **Step C (Git awareness)**:
        *   `GitService` (using `LocalGitFS`) naturally "sees" change in Step A (because it reads from Disk).

**Scenario: Agent runs `git commit -m "feat: ai"`**

1.  **Agent**: Calls `run_command('git commit ...')`.
2.  **Interceptor**: Detects `git`.
3.  **GitService**:
    *   Uses `isomorphic-git`.
    *   Uses `LocalGitFSAdapter` to read `.git` from Disk.
    *   Writes new commit object to Disk.
4.  **UI Update**:
    *   `ideStore.refreshGitStatus()` triggers re-scan of Disk.

## 3. Implementation Directive

The `usage` of `browser-fs-access` vs `FileSystemAccess` API must be explicit:
*   We target **Chrome/Edge** (Native FSA) for the "Advanced" capabilities.
*   `browser-fs-access` is a fallback for open/save dialogs, but for the **Directory Watcher** and **Sync**, we rely on the native handles obtained via `window.showDirectoryPicker()`.

This design closes the loop between Agent Intent, Runtime execution, and Real-world Persistence.
