# WebContainer <-> Local FS Sync Architecture

**Date:** 2025-12-10
**Status:** Research Findings
**Context:** Proving architectural evidence for "Total browser client-side... to project's persistence".

## 1. The Disconnect

*   **WebContainer (WC)**: A virtualized Node.js environment. It has its own isolated file system (`/tmp`, `/app`). `npm install` runs here.
*   **Local FS**: The user's physical disk.
*   **Problem**: WE CANNOT "mount" the Local FS *directly* as the backing store for WC. WC *imports* files into its virtual store.

## 2. The "Sync Layer" Design

We need a bidirectional sync engine.

### 2.1 Direction: Local -> WebContainer (The "Mount")

When user selects a folder:
1.  **Crawl**: Recursively read `FileSystemDirectoryHandle`.
2.  **Snapshot**: Create a `FileSystemTree` object (in-memory JSON-like structure).
3.  **Boot**: `webContainer.mount(tree)`.

*Challenge*: Initial large repo load.
*solution*: Lazy loading isn't fully supported by `mount`. We might need to mount the root and then use `wc.fs.writeFile` for the rest? Or simpler: Just mount the initial snapshot (excluding `node_modules`).

### 2.2 Direction: WebContainer -> Local (The "Write Back")

When `npm install` runs, or an Agent creates a file in WC:
1.  **Watch**: `webContainer.fs.watch('./', { recursive: true }, (event, filename) => ...)`
2.  **Filter**: Ignore `node_modules` (performance suicide to copy back to Windows).
3.  **Write**: When `filename` changes in WC, read it `wc.fs.readFile` and write to `FileSystemDirectoryHandle`.

### 2.3 Direction: Local -> WebContainer (The "Watch")

When user edits file in VS Code (external change):
1.  **Observe**: Use `FileSystemObserver` (Chrome 129+) on the root handle.
2.  **Event**: When file changes on disk, `observer` fires.
3.  **Sync**: Call `wc.fs.writeFile(path, newContent)`.

### 2.4 "Hybrid" Terminal

The user wants a "Terminal API connected with local git".
*   **Command**: `ls -la`
    *   Executed in **WebContainer** (showing Virtual FS view).
    *   Since Sync Layer is active, Virtual FS *should* match Local FS.
*   **Command**: `git status`
    *   **CRITICAL DISTINCTION**: `isomorphic-git` cannot easily run *inside* the WebContainer process because it can't reach the "Outer" FileSystemHandle.
    *   **Solution**: "Git" commands in the terminal are **intercepted**.
        *   User types `git status` in xterm.
        *   Shell parser detects `git`.
        *   Command is handled by **Main Thread JS** (Isomorphic Git on Handle).
        *   Result is printed to xterm.
        *   *All other commands* (`npm`, `node`, `ls`) are sent to WebContainer spawn.

## 3. The "Permission" Model

1.  **Boot**: Request `mode: 'readwrite'` access to folder.
2.  **Persistence**: `verifyPermission(handle)` on reload.
3.  **Safety**:
    *   **Agent Tools**: When Agent calls `write_file`, it goes to `FileManager`.
    *   `FileManager` checks allowlist/denylist (e.g., prevent overwriting `.git/` manually, prevent writing outside root).
    *   Then writes to both WC and Handle.

## 4. Spike Proof Points

The implementation plan must verify:
1.  **Observer**: Does `FileSystemObserver` work reliably in the target browser? (Use polling fallback if not).
2.  **Interceptor**: Can we cleanly intercept `git` commands in the library-provided xterm/shell interface?
