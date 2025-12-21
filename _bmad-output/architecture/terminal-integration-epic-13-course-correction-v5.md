# Terminal Integration (Epic 13 - Course Correction v5)

**Known Issues Addressed:**

| ID | Issue | Root Cause | Fix |
|----|-------|------------|-----|
| BUG-01 | Terminal CWD Mismatch | Shell spawns before mount, no cwd passed | Use `SpawnOptions.cwd` |
| BUG-02 | Auto-Sync Not Triggering | Race condition with WebContainer readiness | Add ready gate |

### Terminal Working Directory

Terminal must spawn with the project path as the Current Working Directory:

```typescript
// src/lib/webcontainer/terminal-adapter.ts

interface TerminalAdapter {
  /**
   * Start an interactive shell with optional project path.
   * Shell spawns AFTER project mount completes.
   * 
   * @param projectPath - Absolute path within WebContainer (e.g., '/project')
   */
  startShell(projectPath?: string): Promise<void>;
}

// Implementation pattern
async startShell(projectPath?: string): Promise<void> {
  // Wait for WebContainer to be ready
  await this.container.ready;
  
  this.shellProcess = await this.container.spawn('jsh', {
    cwd: projectPath || '/',
    terminal: { 
      cols: this.cols, 
      rows: this.rows 
    }
  });
  
  // Pipe to xterm.js
  this.reader = this.shellProcess.output.getReader();
  this.pumpOutput();
}
```

### Sync Behavior

**Design Decisions:**

1. **No Reverse Sync**: WebContainer changes do NOT sync back to local FS (by design)
2. **Local FS is Source of Truth**: All edits happen on local FS, then sync to WebContainer
3. **One-Way Sync Flow**: `Local FS → WebContainer` only

**Sync Exclusions (Hardcoded):**

```typescript
const DEFAULT_EXCLUSIONS = [
  '.git',           // Git internals
  'node_modules',   // Dependencies (installed in WebContainer)
  '.DS_Store',      // macOS metadata
  'dist',           // Build outputs
  '.next',          // Next.js build cache
  '.turbo',         // Turbo build cache
];
```

### Terminal Integration Checklist

- [ ] `TerminalAdapter.startShell()` accepts `projectPath` parameter
- [ ] Project path passed from `WorkspaceContext` through component tree
- [ ] Shell spawn waits for mount completion
- [ ] `ls` command shows project files (not WebContainer root)
- [ ] `npm install` works from project directory

---
