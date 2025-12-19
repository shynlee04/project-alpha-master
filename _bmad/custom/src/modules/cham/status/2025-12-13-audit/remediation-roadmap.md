# Remediation Roadmap - Via-Gent Full-Scale IDE

**Date:** 2025-12-13  
**Audit ID:** CHAM-2025-12-13-ADVANCED  
**Goal:** Enable full-scale IDE with AI agents and local machine sync

---

## Strategic Epic Order (Recommended)

```
Current State → Full-Scale IDE with AI Agents

Phase 1: Foundation Completion (Week 1)
├── Epic 4: Complete dashboard (4-0-1)
└── Epic 5: Finish persistence (5-2 to 5-4)

Phase 2: AI Enablement (Week 2)
├── Epic 10: Event Bus (observability)
├── Epic 12: AI Tool Facades
└── Epic 6: AI Agent Integration

Phase 3: Full Workflow (Week 3)
└── Epic 7: Git Integration

Phase 4: Optimization (Parallel)
└── Epic 11: Code Splitting
```

---

## Phase 1: Foundation Completion

### Epic 4: Complete IDE Components

| Story | Description | Status | Priority |
|-------|-------------|--------|----------|
| 4-0-1 | Dashboard recent projects | Backlog | P0 |

**Deliverable:** Users can see and open recent projects from dashboard

---

### Epic 5: Persistence Layer

| Story | Description | Status | Priority |
|-------|-------------|--------|----------|
| 5-2 | Implement project store | Backlog | P0 |
| 5-3 | Conversation store | Backlog | P1 |
| 5-4 | IDE state store | Backlog | P1 |

**Deliverable:** All IDE state persists across sessions

---

## Phase 2: AI Enablement

### Epic 10: Event Bus Architecture

| Story | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 10-1 | Create EventBus.ts | S | None |
| 10-2 | SyncManager → events | M | 10-1 |
| 10-3 | Manual sync toggle | S | 10-2 |
| 10-4 | Per-file sync status | M | 10-2 |
| 10-5 | Sync exclusion config | S | 10-2 |

**Technical Design:**
```typescript
// Event bus with typed events
interface WorkspaceEvents {
  'file:created': { path: string; source: 'local' | 'editor' | 'agent' };
  'file:modified': { path: string; source: 'local' | 'editor' | 'agent' };
  'sync:completed': { fileCount: number; direction: 'to-wc' | 'to-local' };
  'terminal:output': { line: string; type: 'stdout' | 'stderr' };
  'process:started': { pid: number; command: string };
}
```

---

### Epic 12: AI Tool Interface Layer

| Story | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 12-1 | AgentFileTools facade | M | 10-1 |
| 12-2 | AgentTerminalTools facade | M | 10-1 |
| 12-3 | AgentSyncTools facade | S | 10-2 |
| 12-4 | AgentGitTools stub | S | None |
| 12-5 | Wire to TanStack AI | M | 12-1 to 12-4 |

**Technical Design:**
```typescript
// AI agents call these tools
interface AgentFileTools {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listDirectory(path: string): Promise<FileEntry[]>;
  createFile(path: string, content?: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}

interface AgentTerminalTools {
  runCommand(command: string): Promise<{ stdout: string; exitCode: number }>;
  streamCommand(command: string): Observable<string>;
}
```

---

### Epic 6: AI Agent Integration

| Story | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 6-1 | TanStack AI chat endpoint | M | Epic 12 |
| 6-2 | useAgentChat hook | M | 6-1 |
| 6-3 | Implement file tools | S | 12-1 |
| 6-4 | Implement terminal tool | S | 12-2 |
| 6-5 | Wire tool → UI | M | 6-3, 6-4 |

**Deliverable:** AI agents can read/write files and run commands

---

## Phase 3: Full Workflow

### Epic 7: Git Integration

| Story | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 7-1 | FSA Git adapter | M | Epic 6 |
| 7-2 | Git status display | S | 7-1 |
| 7-3 | Git stage/commit | M | 7-2 |
| 7-4 | Git agent tools | S | 7-3 |

**Deliverable:** Users and AI can commit and sync with Git

---

## Phase 4: Optimization (Parallel Track)

### Epic 11: Code Splitting

| Story | Target File | Effort |
|-------|-------------|--------|
| 11-1 | PathGuard.ts from local-fs-adapter | S |
| 11-2 | DirectoryWalker.ts from local-fs-adapter | S |
| 11-3 | SyncPlanner.ts from sync-manager | M |
| 11-4 | SyncExecutor.ts from sync-manager | M |
| 11-5 | LayoutShell.tsx from IDELayout | M |
| 11-6 | useXTerminal hook from XTerminal | S |
| 11-7 | FileTreeDataSource from FileTree | M |

**Goal:** All files ≤250 lines

---

## Timeline Estimate

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Phase 1 | 3-4 days | Users can resume projects |
| Phase 2 | 5-7 days | AI edits files |
| Phase 3 | 3-4 days | Git workflow complete |
| Phase 4 | 3-5 days | Code quality improved |
| **Total** | **2-3 weeks** | Full-scale IDE |
