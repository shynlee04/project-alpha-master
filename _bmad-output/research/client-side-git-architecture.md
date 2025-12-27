# Client-Side Git Architecture: Real "Local Git" in Browser

**Date:** 2025-12-10
**Status:** Research Findings
**Context:** Proving architectural evidence for "real git support" aiding local git to Github account from browser.

## 1. The Challenge

The requirement is not just "browser git" (which usually means `isomorphic-git` + IndexedDB `lightning-fs`). The requirement is "aiding **local git**". This means the browser must read/write the `.git` folder present on the user's **actual hard drive**.

## 2. Technical Components

### 2.1 The Adapter Pattern

`isomorphic-git` core expects a Node.js-style `fs` module (promises version): `readFile`, `writeFile`, `readdir`, `stat`, `unlink`, `mkdir`, `rmdir`.

The browser's `FileSystemDirectoryHandle` (FSA API) does not match this. `browser-fs-access` wraps FSA but simplifies it for "open/save" dialogs, not full `fs` emulation.

**Solution:** We must implement a **Custom FS Adapter** that maps `isomorphic-git` calls to FSA API calls.

```typescript
// Conceptual Adapter
const localGitFS = {
  promises: {
    readFile: async (path) => {
      // 1. Resolve path segments against rootDirectoryHandle
      // 2. handle.getFile() -> file.text()
    },
    writeFile: async (path, data) => {
      // 1. Resolve handle
      // 2. createWritable() -> write()
    },
    // ... stat, readdir, etc.
  }
}

git.init({ fs: localGitFS, dir: '/' })
```

### 2.2 Performance Bottleneck: `.git` Folder

Git operations involve thousands of small reads/writes (refs, objects). FSA API can be slow for sequential deeply nested calls.
*   **Risk**: `git status` might take 10s of seconds on large repos if naive FSA calls are used.
*   **Optimization**: Cache filesystem handles in memory.

## 3. "Real Git" Support

By passing this `localGitFS` to `isomorphic-git`, the browser operates directly on the user's `.git` folder.
*   **Commit**: Writes a new commit object to `C:\Users\Admin\Project\.git\objects\...`
*   **Push**: Reads those objects and allows `git push` to GitHub (using CORS proxy or supported remote).
*   **Status**: Compares `index` against actual files on disk.

## 4. Permissions

*   **Read**: User grants "View" access to folder.
*   **Write**: User grants "Edit" access.
*   **Persistence**: On reload, handle can be re-used (via IndexedDB storage of the handle), but user *might* need to re-verify permission gesture depending on browser security policy (Chrome encourages re-verification).

## 5. Proposed Architecture for Spike

1.  **Mount**: User clicks "Open Local Project".
2.  **Handle Storage**: Store root `FileSystemDirectoryHandle` in IndexedDB.
3.  **Adapter**: Initialize `LocalGuidFS(rootHandle)`.
4.  **Git Client**: `new Git({ fs: LocalGuidFS, dir: '/' })`.
5.  **UI**: "Source Control" panel calls `git.statusMatrix()`.

## 6. Verification in Spike

The spike must prove that running `git commit` in the Browser IDE results in a commit visible to `git log` in the user's external Terminal / VS Code.
