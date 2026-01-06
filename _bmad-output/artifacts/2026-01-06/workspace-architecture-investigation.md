# Workspace Architecture Investigation Report
**Date**: 2026-01-06
**Session**: Comprehensive Architecture Remediation
**Investigator**: BMAD Explore Agent
**Thoroughness**: Very Thorough

## Executive Summary

This investigation reveals a **hybrid approach with significant architectural inconsistencies** across workspaces. The codebase has evolved from a monolithic IDE workspace to a multi-workspace architecture, but with several broken patterns and gaps that need attention.

**Key Finding**: The system operates with fragmented state management, inconsistent route patterns, and a split-brain file system architecture that prevents the vision of fluid, cross-workspace agent operations.

---

## 1. Route Structure Analysis

### Current Route Architecture

```typescript
// Primary routes with projectId
/ide/$projectId           ✅ Full implementation with loader and ProjectProvider
/notes/$projectId        ✅ Basic implementation, missing Notes store
/knowledge/$projectId   ✅ Placeholder only, incomplete implementation
/study/$projectId       ❌ Not implemented yet

// Routes without projectId (hub/workspace selection)
/ide                    ✅ Empty state with project picker logic
/notes.lazy.tsx         ❌ No empty state handling
/knowledge.lazy.tsx     ❌ No empty state handling
/study.lazy.tsx         ❌ No empty state handling

// Legacy route
/workspace/$projectId   ⚠️  Deprecated but still functional
```

### Critical Findings

1. **Inconsistent Route Patterns**: Only IDE has both parameterized and empty routes
2. **No Unified projectId Management**: Manual store manipulation in routes
3. **Missing Loaders**: Notes/Knowledge routes load projects async after render (hydration flash)

**Example of Anti-Pattern**:
```typescript
// Found in multiple routes - violates separation of concerns
useEffect(() => {
    if (_projectId) {
        useIDEStore.getState().setProjectId(_projectId);
        useRAGStore.getState().setCurrentProjectId(_projectId);
    }
}, [_projectId]);
```

---

## 2. State Management Architecture

### Current Store Structure

```typescript
// IDE Store (Complete)
├── useIDEStore.ts           // Main store with slices
├── ide-editor-slice.ts      // File editing state
├── ide-explorer-slice.ts    // File explorer state
├── ide-layout-slice.ts      // Panel layouts
├── ide-terminal-slice.ts    // Terminal state
└── ide-project-slice.ts     // Project metadata

// RAG Store (Complete)
├── rag-store.ts             // Composed slices
├── rag-index-slice.ts       // Indexing lifecycle
├── rag-search-slice.ts      // Search functionality
├── rag-chunking-slice.ts    // Document chunking
└── rag-chat-slice.ts        // Chat messages

// Knowledge Store (Complete)
├── knowledge-store.ts       // Main store
├── knowledge-source-crud-slice.ts
├── knowledge-collection-slice.ts
└── knowledge-synthesis-slice.ts

// Notes Store (MISSING) ❌
// Study Store (MISSING) ❌
```

### Critical Issues

1. **Store Fragmentation**: Each workspace has isolated store, no coordination
2. **Project ID Duplication**: Tracked separately in each store
3. **Missing Cross-Workspace Event System**: Workspaces operate in isolation
4. **No Workspace Switching State Preservation**: State lost when switching

---

## 3. File System Integration

### Dual System Problem

```typescript
├── Dexie Database (Project Metadata)
│   ├── project-store.ts      // Project metadata, FSA handles
│   └── note-folder-bridge.ts // Markdown → Notes sync
│
├── File System Authority (FSA)
│   ├── LocalFSAdapter.ts     // Direct file system access
│   ├── SyncManager.ts        // WebContainer sync
│   └── permission-lifecycle.ts // Permission restoration
│
└── WebContainer Integration
    ├── Sync to WebContainer
    └── IDE file operations
```

**The Split Brain**:
- **Dexie**: Stores project metadata, handles, sync state
- **FSA**: Manages actual file system operations
- **WebContainer**: In-memory file system for IDE
- **No unified abstraction layer** connecting all three

### Note Folder Bridge Issues

```typescript
// Partial sync solution - only imports, no export
async syncFromAdapter(projectId: string, adapter: LocalFSAdapter): Promise<void> {
    for await (const entry of walkDirectory(adapter, '', { recursive: true })) {
        if (entry.type === 'file' && entry.name.toLowerCase().endsWith('.md')) {
            // Simple markdown parsing → BlockNote conversion
            const result = await adapter.readFile(entry.path);
            await this.syncFileToNote(projectId, entry.path, result.content, Date.now());
        }
    }
    // ❌ No reverse sync (Note → File)
    // ❌ No real-time file watching
    // ❌ No incremental sync
}
```

---

## 4. Agent Configuration Management

### Architecture Assessment

**✅ Well-Designed Security Layer**:
- Proper AES-256-GCM encryption
- Secure key derivation with PBKDF2-SHA256
- Comprehensive error handling

**❌ Cross-Workspace Portability Issues**:
```typescript
// Agent selection is workspace-scoped but credentials are global
const agentSelectionStore = useAgentSelectionStore();

setActiveAgent: (agentId: string) => {
    if (!currentWorkspace) {
        console.warn('[WorkspaceProvider] Cannot set active agent: no current workspace');
        return;
    }
    agentSelectionStore.setActiveAgent(agentId, currentWorkspace);
}
```

**Problem**: No clear separation between:
- Global credentials (API keys)
- Workspace-scoped agent selection
- Per-project tool permissions

---

## 5. Major Issues & Gaps

### Critical Problems Summary

1. **Route Architecture Inconsistencies**
   - Only IDE has empty state + picker
   - Missing loaders cause hydration flash
   - Manual projectId manipulation in routes

2. **Missing Workspace Stores**
   - Notes store implementation missing
   - Study store implementation missing
   - Knowledge store exists but routes don't use it

3. **No Cross-Workspace Event System**
   - Workspaces operate in isolation
   - No event bus for workspace communication
   - Sync status not shared across workspaces

4. **File System Complexity**
   - Three overlapping systems (Dexie, FSA, WebContainer)
   - No unified file system abstraction
   - Complex permission restoration logic

5. **Error Handling Without Fallbacks**
   - Mobile devices throw errors on FSA features
   - No graceful degradation
   - User sees crashes instead of helpful UI

### Architectural Vision vs Reality

**Intended Vision**:
```typescript
interface UnifiedWorkspace {
  projectId: string;
  filesystem: UnifiedFileSystem;      // Single source of truth
  state: WorkspaceStore;              // Coordinated state
  agentConfig: WorkspaceAgentConfig;  // Scoped permissions
  sync: CrossWorkspaceSync;           // Reactive updates
}
```

**Current Reality**:
```typescript
interface FragmentedState {
  IDE: {
    store: IDEStore;
    projectId: string;
    filesystem: WebContainer;  // Separate system
  }
  Notes: {
    store: null;  // Missing!
    projectId: string;
    filesystem: Dexie;  // Different system
  }
  // No shared state, no unified abstractions
  // Manual coordination required everywhere
}
```

---

## 6. Why Previous Fixes Failed

### The "Dexie Persistence Fix" - Why It Was a Patch

**What Was Done**:
- Created custom storage adapter for IDE store
- Fixed IndexedDB key path mismatch (`id` vs `projectId`)

**Why It Didn't Solve Root Cause**:
- ✅ Fixed persistence for IDE workspace
- ❌ Didn't address why projectId was null in the first place
- ❌ Didn't unify route parameterization
- ❌ Didn't create cross-workspace state coordination
- ❌ Notes/Knowledge still have same persistence issues

**The Real Problem**: Routes without `$projectId` param create ambiguous state
- User visits `/ide` → no projectId in URL → state unclear
- Then selects folder → projectId set in store but not URL
- Page refresh → URL still `/ide` → no projectId → folder selector appears

**Correct Fix**: ALL workspace routes MUST require `$projectId` parameter

---

## 7. Option B Architecture Requirements

Based on the investigation, here are the requirements for the proper architecture fix:

### B1. Strict Route Parameterization
```typescript
// ALL workspace routes require projectId
/ide/$projectId      → IDE workspace for specific project
/notes/$projectId    → Notes workspace for specific project
/knowledge/$projectId → Knowledge workspace for specific project

// Routes without projectId REDIRECT to picker
/ide → redirect to /picker
/notes → redirect to /picker
```

### B2. Unified Note Systems
```typescript
// Current: Dexie (notes) + FSA (filesystem) = split brain
// Target: Single source of truth

interface UnifiedNoteSystem {
  // Notes ARE files in the project
  // No separation between "notes in Dexie" and "files on disk"
  // FSA is primary, Dexie caches metadata only

  readNote(path: string): Promise<NoteContent>
  writeNote(path: string, content: NoteContent): Promise<void>
  watchNotes(callback: (changes: FileChange[]) => void): () => void
}
```

### B3. Project Hierarchy Support
```typescript
// Support nested projects/folders
interface ProjectHierarchy {
  rootProject: Project;
  subProjects: Project[];
  projectMetadata: {
    path: string;
    parentProject?: string;
    workspaceBindings: WorkspaceBinding[];
  }
}
```

---

## 8. Recommended Implementation Approach

### Phase 1: Foundation (Critical Path)
1. Create unified project context system
2. Implement strict route parameterization
3. Add redirect logic for routes without projectId
4. Update project picker to set URL params

### Phase 2: State Coordination
1. Implement cross-workspace event bus
2. Create unified project state manager
3. Add workspace switching state preservation
4. Implement reactivity across workspaces

### Phase 3: File System Unification
1. Create unified file system abstraction
2. Implement bidirectional note sync
3. Add file watching for real-time updates
4. Consolidate permission handling

### Phase 4: Agent & Configuration
1. Clarify global vs workspace-scoped config
2. Implement workspace-specific agent permissions
3. Add tool permission CRUD UI
4. Centralize credential management

---

## Conclusion

The investigation reveals that while individual components are well-designed (credential vault, Dexie persistence), the **integration architecture is fundamentally misaligned** with the multi-workspace vision.

The "Option B" redesign is not optional - it's necessary to achieve:
- ✅ Clear project context in URLs
- ✅ Consistent state management across workspaces
- ✅ Unified file system abstraction
- ✅ Cross-workspace reactivity
- ✅ Proper error handling with fallbacks

**Without this architectural refactoring, we will continue applying patches that don't address root causes.**

---

**Next Steps**:
1. Architectural Vision Analysis document
2. Current State Gap Analysis
3. Detailed Option B Implementation Plan
4. Epic and Story breakdown
