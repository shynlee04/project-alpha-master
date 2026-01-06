# Current State Assessment - Detailed Gap Analysis
**Date**: 2026-01-06
**Purpose**: Comprehensive technical gap analysis with code examples and migration risks

---

## Executive Summary

**Current Health**: 46.4% (per sprint assessment)
**Target Health**: 95%
**Critical Gaps**: 23 identified
**Blocking Issues**: 5 P0 issues preventing core functionality

**Key Finding**: The codebase has solid individual components (credential vault, Dexie persistence, RAG system) but the **integration architecture is fundamentally misaligned** with the multi-workspace vision.

---

## 1. Route Architecture Assessment

### 1.1 Current Implementation

**File**: `src/routes/ide.tsx`
```typescript
// ✅ GOOD - Has empty state with picker
export const Route = createFileRoute('/ide')({
  component: IDEEmptyState,
})

// ✅ GOOD - Has parameterized route
export const Route = createFileRoute('/ide/$projectId')({
  component: IDEWorkspace,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
})
```

**File**: `src/routes/notes.lazy.tsx`
```typescript
// ❌ BAD - No empty state handling
export const Route = createFileRoute('/notes/$projectId')({
  component: NotesWorkspace,
  // No loader - project loads async after render
  // No empty state route for /notes
})
```

**File**: `src/routes/knowledge.lazy.tsx`
```typescript
// ❌ BAD - No empty state handling
export const Route = createFileRoute('/knowledge/$projectId')({
  component: KnowledgeWorkspace,
  // No loader
  // No empty state route for /knowledge
})
```

### 1.2 Technical Gaps

| Gap | Severity | Impact | Files Affected |
|-----|----------|--------|----------------|
| No empty state routes for Notes/Knowledge | P0 | Users can't access these workspaces without projectId | `notes.lazy.tsx`, `knowledge.lazy.tsx` |
| Missing route loaders | P1 | Hydration flash, async loading after render | All non-IDE routes |
| Manual store manipulation in routes | P0 | Breaks separation of concerns | All route files |
| No redirect logic for root routes | P0 | Ambiguous state, folder selector loops | All workspace routes |

### 1.3 Code Examples of Broken Patterns

**Pattern 1: Manual Store Manipulation (Anti-Pattern)**
```typescript
// Found in: src/routes/ide.$projectId.tsx:42-47
useEffect(() => {
  if (_projectId) {
    useIDEStore.getState().setProjectId(_projectId);
    console.log('[IDERoute] Project ID set in store:', _projectId);
  }
}, [_projectId]);

// Why this is wrong:
// 1. Route shouldn't directly manipulate store
// 2. Should use loader + ProjectProvider pattern
// 3. Breaks SSR compatibility
// 4. Creates race conditions during hydration
```

**Pattern 2: Missing Loader (Hydration Flash)**
```typescript
// Found in: src/routes/notes.$projectId.tsx:18-26
function NotesWorkspace() {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    getProject(_projectId).then(setProject);
  }, [_projectId]);

  if (!project) return <div>Loading...</div>;  // Flash!
  // ...
}

// Why this is wrong:
// 1. Project loads after component renders
// 2. Causes "Loading..." flash on every navigation
// 3. Should use route loader like IDE route
// 4. Breaks user expectation of instant navigation
```

**Pattern 3: No Empty State (Broken UX)**
```typescript
// Found in: src/routes/notes.lazy.tsx
// There is NO route for /notes (without projectId)

// What happens:
// 1. User navigates to /notes
// 2. TanStack Router has no matching route
// 3. Either 404 or falls back to root
// 4. User confused, no way to select project

// What should exist:
export const Route = createFileRoute('/notes')({
  component: NotesEmptyState,  // Like IDE has
})

function NotesEmptyState() {
  const navigate = useNavigate();
  const projects = useLiveQuery(() => db.projects.toArray());

  const handleSelectProject = (projectId: string) => {
    navigate({ to: '/notes/$projectId', params: { projectId } });
  };

  return <ProjectPicker onSelect={handleSelectProject} />;
}
```

### 1.4 Migration Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing bookmarks | Medium | Medium | Implement redirect logic |
| State hydration issues | High | High | Use loaders consistently |
| SEO/performance regression | Low | Low | Client-side only app, no SEO impact |

---

## 2. State Management Assessment

### 2.1 Current Store Architecture

**IDE Store** (`src/infrastructure/persistence/stores/ide/`)
```typescript
// ✅ WELL-STRUCTURED - Has proper slices
useIDEStore.ts
├── ide-editor-slice.ts
├── ide-explorer-slice.ts
├── ide-layout-slice.ts
├── ide-terminal-slice.ts
└── ide-project-slice.ts

// Total: 300 lines (within limit)
// Slices: ≤120 lines each (within limit)
```

**RAG Store** (`src/infrastructure/persistence/stores/rag/`)
```typescript
// ⚠️ GOD STORE - 1595 lines (13.3x limit!)
rag-store.ts
├── rag-index-slice.ts
├── rag-retrieval-slice.ts
├── rag-search-slice.ts
├── rag-chunking-slice.ts
└── rag-embeddings-slice.ts

// Problem: Main store is god object
// Slices are poorly organized
```

**Notes Store** (MISSING)
```typescript
// ❌ DOESN'T EXIST
// Notes workspace has no dedicated store
// Uses Dexie directly from components
// No state management layer
```

### 2.2 State Coordination Gaps

**Gap 1: No Cross-Workspace Event System**
```typescript
// Current state: Each workspace is isolated
- IDE updates file → Notes doesn't know
- Notes updates note → IDE doesn't know
- No event bus for communication

// What should exist:
interface CrossWorkspaceEventBus {
  // File changed in IDE
  emit('file-changed', { projectId, path, content });
  // Notes workspace listens
  on('file-changed', (data) => { /* update note */ });

  // Agent executed in IDE
  emit('agent-executed', { projectId, agentId, result });
  // Knowledge workspace listens
  on('agent-executed', (data) => { /* re-index */ });
}
```

**Gap 2: Project ID Duplication**
```typescript
// Found in multiple stores - projectId tracked separately:

// IDE Store
state.projectId: string | null

// RAG Store
state.currentProjectId: string | null

// Knowledge Store
state.activeProjectId: string | null

// Problem: Which is source of truth?
// What if they diverge? (race condition)
// No synchronization mechanism

// Should be: Single source of truth
interface ProjectContext {
  projectId: string;
  // All stores derive from this
}
```

**Gap 3: No Workspace Switching State Preservation**
```typescript
// Current behavior:
1. User has 5 files open in IDE, cursor at line 42
2. User switches to Notes (browser navigation)
3. All IDE state lost (component unmounted)

// What should happen:
1. User has 5 files open in IDE, cursor at line 42
2. User switches to Notes
3. IDE state persists (Dexie)
4. User switches back to IDE
5. State restored (5 files open, cursor at line 42)

// Missing:
interface WorkspaceStatePreservation {
  saveState(workspace: string, state: any): void;
  restoreState(workspace: string): any;
  // Should auto-save on route change
  // Should auto-restore on route return
}
```

### 2.3 Technical Debt Assessment

| Debt | Severity | Effort | Impact of Not Fixing |
|------|----------|--------|---------------------|
| God stores (>300 lines) | P1 | High | Unmaintainable, bug-prone |
| Missing Notes store | P0 | Medium | No state management, scattered logic |
| No cross-workspace events | P0 | High | Workspaces isolated, no reactivity |
| Project ID duplication | P1 | Medium | Race conditions, state divergence |
| No workspace state preservation | P1 | Medium | Poor UX, lost work |

---

## 3. File System Integration Assessment

### 3.1 Current Architecture (Split Brain)

**Component 1: Dexie Database**
```typescript
// File: src/infrastructure/persistence/dexie-db-class.ts
// Purpose: Store project metadata, FSA handles

interface ProjectMetadata {
  id: string;
  name: string;
  fsaHandle?: FileSystemDirectoryHandle;
  workspaceBindings: {
    ide?: boolean;
    notes?: boolean;
    knowledge?: boolean;
    study?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Good: Clean schema
// ❌ Bad: Only stores metadata, no file operations
```

**Component 2: File System Access (FSA)**
```typescript
// File: src/lib/workspace/adapters/LocalFSAdapter.ts
// Purpose: Direct file system operations

class LocalFSAdapter {
  async readFile(path: string): Promise<{ content: string }>;
  async writeFile(path: string, content: string): Promise<void>;
  async listFiles(path: string): Promise<FileEntry[]>;
}

// ✅ Good: Async file operations
// ❌ Bad: Only works on desktop HTTPS
// ❌ Bad: Throws errors on mobile
```

**Component 3: WebContainer**
```typescript
// File: src/lib/workspace/WebContainer.ts
// Purpose: In-memory file system for IDE

// ✅ Good: Fast file operations
// ❌ Bad: Separate from FSA (can diverge)
// ❌ Bad: No persistence mechanism
```

**Component 4: Note-Folder-Bridge**
```typescript
// File: src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts
// Purpose: Sync markdown files to notes

class NoteFolderBridge {
  async syncFromAdapter(projectId: string, adapter: LocalFSAdapter) {
    // Read .md files from FSA
    // Convert to BlockNote format
    // Save to Dexie (notes table)
  }

  // ❌ MISSING: Reverse sync (notes → files)
  // ❌ MISSING: Real-time file watching
  // ❌ MISSING: Incremental sync
}

// Problem: One-way sync only
// When user edits note: Saved to Dexie only
// When user switches to IDE: File shows old content
```

### 3.2 Technical Gaps

| Gap | Severity | Impact | Files Affected |
|-----|----------|--------|----------------|
| No unified file system abstraction | P0 | Split brain, data loss | All file system code |
| One-way note sync only | P0 | Note edits lost | `note-folder-bridge.ts` |
| No file watching | P1 | No real-time updates | All sync code |
| No mobile fallback | P0 | App crashes on mobile | `HubHomePage.tsx` |
| Permission state scattered | P1 | Complex, error-prone | Multiple files |

### 3.3 Code Examples of Broken Patterns

**Pattern 1: Split Brain (Which System is Truth?)**
```typescript
// Scenario: User edits file in IDE

// Step 1: IDE writes to WebContainer
await webcontainer.writeFile('README.md', newContent);

// Step 2: IDE writes to FSA
await fsaAdapter.writeFile('README.md', newContent);

// Step 3: IDE updates Dexie metadata
await db.projects.update(projectId, { updatedAt: new Date() });

// Problem: Three separate write operations
// What if one fails? (inconsistent state)
// What if user switches to Notes before Step 2? (stale data)
// What if WebContainer and FSA diverge? (which is truth?)

// Should be: Single write operation
await unifiedFS.writeFile('README.md', newContent);
// Unified abstraction handles:
// - WebContainer update
// - FSA update
// - Dexie metadata
// - Event broadcasting (cross-workspace)
```

**Pattern 2: One-Way Note Sync (Data Loss)**
```typescript
// Found in: note-folder-bridge.ts:42-58

async syncFileToNote(
  projectId: string,
  filePath: string,
  content: string,
  mtime: number
) {
  // Parse markdown → BlockNote
  const blocks = parseMarkdownToBlockNote(content);

  // Save to Dexie (notes table)
  await db.notes.put({
    projectId,
    filePath,
    blocks,
    updatedAt: new Date(mtime),
  });
}

// ❌ MISSING: Reverse operation
// When user edits note in Notes workspace:
// 1. Note saved to Dexie
// 2. File on disk NOT updated
// 3. User switches to IDE
// 4. File shows old content (data loss!)

// Should have:
async syncNoteToFile(projectId: string, filePath: string) {
  const note = await db.notes.get([projectId, filePath]);
  const markdown = parseBlockNoteToMarkdown(note.blocks);

  // Write back to file system
  await fsaAdapter.writeFile(filePath, markdown);
}
```

**Pattern 3: No Mobile Fallback (Crash)**
```typescript
// Found in: src/presentation/components/hub/HubHomePage.tsx:112-118

const handleMountFolder = async () => {
  // ❌ No feature detection
  // ❌ No try/catch
  const handle = await window.showDirectoryPicker();  // Throws on mobile!

  const adapter = createLocalFSAdapter(handle);
  // ...
};

// What happens on mobile:
// 1. User clicks "Mount Folder"
// 2. window.showDirectoryPicker throws (not supported on mobile)
// 3. Unhandled promise rejection
// 4. App crashes or shows error toast

// Should be:
const handleMountFolder = async () => {
  // Feature detection
  if (!('showDirectoryPicker' in window)) {
    showInlineMessage('Folder mounting not available on this device. Use Alpha Storage instead.');
    return;
  }

  try {
    const handle = await window.showDirectoryPicker();
    const adapter = createLocalFSAdapter(handle);
    // ...
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      showInlineMessage('Folder access needed for full functionality. Using Alpha Storage instead.');
      // Fallback to Alpha Storage
      const adapter = createAlphaStorageAdapter();
    }
  }
};
```

### 3.4 Migration Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | High | Critical | Backup Dexie before migration |
| Breaking existing FSA handles | Medium | High | Test permission restoration flow |
| Performance regression | Medium | Medium | Benchmark before/after |
| Mobile compatibility | Low | Medium | Extensive mobile testing |

---

## 4. Agent Configuration Assessment

### 4.1 Current Implementation

**Credential Vault** (`src/lib/agent/providers/credential-vault.ts`)
```typescript
// ✅ WELL-DESIGNED
class CredentialVault {
  private encryptKey(key: string): Promise<EncryptedCredential>;
  private decryptKey(encrypted: EncryptedCredential): Promise<string>;
  setCredential(provider: string, apiKey: string): Promise<void>;
  getCredential(provider: string): Promise<string | null>;
}

// Strengths:
// - AES-256-GCM encryption
// - PBKDF2-SHA256 key derivation
// - Secure password hashing
// - Comprehensive error handling

// ✅ This component is production-ready
```

**Model Registry** (`src/lib/agent/providers/model-registry.ts`)
```typescript
// ⚠️ PARTIAL IMPLEMENTATION
class ModelRegistry {
  async fetchModels(provider: ProviderConfig): Promise<Model[]>;
  cacheModels(provider: string, models: Model[], ttl: number);
  getModels(provider: string): Model[];
}

// Problems:
// - Fetching fails silently in production
// - No retry mechanism
// - Cache invalidation unclear
// - Fallback to hardcoded defaults inconsistent
```

**Agent Selection** (`src/lib/agent/stores/agent-selection-store.ts`)
```typescript
// ⚠️ UNCLEAR SCOPE
interface AgentSelectionStore {
  activeAgent: string;  // Is this global or per-workspace?
  setActiveAgent: (agentId: string, workspace?: string) => void;
}

// Problems:
// - Unclear if agent selection is global or workspace-scoped
// - workspace parameter optional (inconsistent)
// - No workspace-specific tool permissions
// - No per-project agent configuration
```

### 4.2 Technical Gaps

| Gap | Severity | Impact | Files Affected |
|-----|----------|--------|----------------|
| Model fetching fails silently | P0 | No models available, agents broken | `model-registry.ts` |
| Unclear agent scope | P1 | Confusion, inconsistent behavior | `agent-selection-store.ts` |
| No workspace tool permissions | P1 | Security risk, agents overprivileged | Agent config |
| No per-project agent config | P2 | Inflexible, can't customize | Agent system |

### 4.3 Code Examples of Issues

**Pattern 1: Silent Model Fetch Failure**
```typescript
// Found in: model-registry.ts:67-85

async fetchModels(provider: ProviderConfig): Promise<Model[]> {
  try {
    const response = await fetch(provider.modelsUrl);
    const data = await response.json();
    return this.parseModels(data);
  } catch (error) {
    console.error('[ModelRegistry] Failed to fetch models:', error);

    // ❌ FALLBACK: But not always available
    return this.getHardcodedModels(provider.name);
  }
}

// Problem:
// 1. Error logged to console (user doesn't see)
// 2. Fallback to hardcoded models (may be outdated)
// 3. No retry mechanism
// 4. No user notification

// Should be:
async fetchModels(provider: ProviderConfig): Promise<Model[]> {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(provider.modelsUrl);
      const data = await response.json();
      const models = this.parseModels(data);

      // Show success toast
      if (i > 0) {
        toast.success(`Loaded ${models.length} models from ${provider.name}`);
      }

      return this.cacheModels(provider.name, models, CACHE_TTL);
    } catch (error) {
      lastError = error;
      await delay(1000 * Math.pow(2, i));  // Exponential backoff
    }
  }

  // All retries failed
  toast.error(`Failed to load models from ${provider.name}. Using cached models.`);
  return this.getModels(provider.name) || this.getHardcodedModels(provider.name);
}
```

**Pattern 2: Unclear Agent Scope**
```typescript
// Found in: agent-selection-store.ts:23-29

setActiveAgent: (agentId: string, workspace?: string) => {
  if (workspace) {
    // Per-workspace agent
    state.workspaceAgents[workspace] = agentId;
  } else {
    // Global agent?
    state.activeAgent = agentId;
  }
}

// Problem:
// - Unclear what happens when workspace is undefined
// - Are agents global or per-workspace?
// - No documentation
// - Inconsistent usage across codebase

// Should be:
interface AgentSelectionStore {
  // Global default (used when no workspace-specific agent set)
  globalDefaultAgent: string;

  // Per-workspace selection (overrides global)
  workspaceAgents: Record<string, string>;  // workspace → agentId

  // Clear API
  setGlobalDefaultAgent(agentId: string): void;
  setWorkspaceAgent(workspace: string, agentId: string): void;
  getActiveAgent(workspace: string): string;
}
```

---

## 5. Error Handling Assessment

### 5.1 Current State

**File**: Multiple components
**Pattern**: Scattered error handling, inconsistent fallbacks

```typescript
// Example 1: HubHomePage.tsx (NO ERROR HANDLING)
const handleMountFolder = async () => {
  const handle = await window.showDirectoryPicker();  // Throws!
  // No try/catch
};

// Example 2: NoteFolderBridge.ts (SILENT FAILURES)
async syncFromAdapter(projectId: string, adapter: LocalFSAdapter) {
  try {
    // ... sync logic
  } catch (error) {
    console.error('[NoteFolderBridge] Sync failed:', error);
    return null;  // Silent failure
  }
}

// Example 3: ModelRegistry.ts (CONSOLE LOG ONLY)
async fetchModels(provider: ProviderConfig) {
  try {
    // ... fetch logic
  } catch (error) {
    console.error('[ModelRegistry] Failed:', error);
    // User doesn't see this error
  }
}
```

### 5.2 Technical Gaps

| Gap | Severity | Impact | Files Affected |
|-----|----------|--------|----------------|
| No feature detection | P0 | Mobile app crashes | `HubHomePage.tsx` |
| Silent failures | P1 | Bugs go undetected | Multiple files |
| No user feedback | P1 | Poor UX, confusion | All error paths |
| No retry logic | P2 | Transient failures fatal | `model-registry.ts` |
| No graceful degradation | P0 | App unusable on some devices | Mobile paths |

### 5.3 Code Examples of Proper Error Handling

**Pattern 1: Feature Detection + Fallback**
```typescript
// ✅ CORRECT
const handleMountFolder = async () => {
  // 1. Feature detection
  if (!('showDirectoryPicker' in window)) {
    // 2. Helpful message
    showInlineMessage(
      'Folder mounting not available on this device. ' +
      'Using Alpha Storage instead (in-memory).'
    );

    // 3. Fallback
    const adapter = createAlphaStorageAdapter();
    await mountProject(adapter);
    return;
  }

  // 4. Try with error handling
  try {
    const handle = await window.showDirectoryPicker();
    const adapter = createLocalFSAdapter(handle);
    await mountProject(adapter);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User denied - explain why it matters
      showInlineMessage(
        'Folder access is needed for file synchronization. ' +
        'You can grant permission in Settings.',
        { action: 'Go to Settings', onClick: openSettings }
      );

      // Fallback to limited mode
      const adapter = createInMemoryAdapter();
      await mountProject(adapter);
    } else if (error.name === 'NotFoundError') {
      showInlineMessage('Folder not found. Please select a different folder.');
    } else {
      showInlineMessage('An error occurred. Please try again.');
    }
  }
};
```

**Pattern 2: Retry with Exponential Backoff**
```typescript
// ✅ CORRECT
async fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;  // Last attempt failed

      const delay = baseDelay * Math.pow(2, i);  // Exponential backoff
      console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('All retries failed');
}

// Usage:
const models = await fetchWithRetry(
  () => fetch(provider.modelsUrl).then(r => r.json()),
  { maxRetries: 3, baseDelay: 1000 }
);
```

**Pattern 3: User-Facing Error Messages**
```typescript
// ✅ CORRECT
class WorkspaceError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public userAction?: { label: string; onClick: () => void }
  ) {
    super(message);
  }
}

// Usage:
try {
  await mountProject(adapter);
} catch (error) {
  if (error instanceof WorkspaceError) {
    toast.error(error.userMessage, {
      action: error.userAction
    });
  } else {
    toast.error('An unexpected error occurred. Please try again.');
    console.error('[MountProject] Unexpected error:', error);
  }
}
```

---

## 6. Priority Matrix

### 6.1 P0 - Critical (Must Fix Now)

| Issue | Impact | Effort | Why P0 |
|-------|--------|--------|--------|
| No empty state routes for Notes/Knowledge | Blocks workspaces | Medium | Users can't access these workspaces |
| One-way note sync | Data loss | Medium | Note edits lost on workspace switch |
| No mobile fallback | App crashes | Low | Mobile users can't use app |
| Model fetching fails silently | Agents broken | Low | Core feature non-functional |
| Manual store manipulation in routes | Race conditions | Medium | Breaks SSR, hydration issues |

### 6.2 P1 - High (Should Fix Soon)

| Issue | Impact | Effort | Why P1 |
|-------|--------|--------|--------|
| No cross-workspace event system | Workspaces isolated | High | Breaks core vision |
| Project ID duplication | State divergence | Medium | Race conditions |
| God stores (rag-store.ts) | Unmaintainable | High | Technical debt compounding |
| Missing Notes store | Scattered logic | Medium | No state management layer |
| No workspace state preservation | Poor UX | Medium | Lost work on switch |

### 6.3 P2 - Medium (Nice to Have)

| Issue | Impact | Effort | Why P2 |
|-------|--------|--------|--------|
| Unclear agent scope | Confusion | Low | Works but unclear |
| No per-project agent config | Inflexible | Medium | Enhancement |
| No file watching | No real-time updates | Medium | Enhancement |
| Permission state scattered | Complex | Medium | Maintenance burden |

---

## 7. Dependencies and Blockers

### 7.1 Critical Path

```
Phase 0 (FOUNDATIONAL)
├── Strict route parameterization
│   ├── Blocks: All workspace access
│   └── Dependencies: None (can start now)
├── Unified note systems
│   ├── Blocks: Data loss fix
│   └── Dependencies: File system unification
└── Mobile fallback strategy
    ├── Blocks: Mobile usability
    └── Dependencies: Feature detection

Phase 1 (STATE COORDINATION)
├── Cross-workspace event bus
│   ├── Blocks: Workspace reactivity
│   └── Dependencies: Route parameterization
├── Workspace state preservation
│   ├── Blocks: UX (lost work)
│   └── Dependencies: Event bus
└── Project context system
    ├── Blocks: State consistency
    └── Dependencies: Event bus

Phase 2 (FILE SYSTEM UNIFICATION)
├── Unified file system abstraction
│   ├── Blocks: Data consistency
│   └── Dependencies: Event bus
├── Bidirectional note sync
│   ├── Blocks: Note edits lost
│   └── Dependencies: File system abstraction
└── File watching system
    ├── Blocks: Real-time updates
    └── Dependencies: File system abstraction
```

### 7.2 Risk Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| Breaking existing functionality | Comprehensive testing before merge |
| Data loss during migration | Full Dexie backup before changes |
| Performance regression | Benchmark before/after, optimize |
| Mobile compatibility | Extensive mobile device testing |
| State hydration issues | Use loaders consistently, test refresh flow |

---

## 8. Recommendations

### 8.1 Immediate Actions (This Week)

1. **Add Empty State Routes**
   - Create `/notes` route with project picker
   - Create `/knowledge` route with project picker
   - Implement redirect logic from `/` to picker
   - **Effort**: 4 hours
   - **Impact**: Users can access all workspaces

2. **Fix Mobile Fallback**
   - Add feature detection for FSA
   - Implement Alpha Storage fallback
   - Add helpful inline messages
   - **Effort**: 2 hours
   - **Impact**: Mobile users can use app

3. **Fix Model Fetching**
   - Add retry logic with exponential backoff
   - Add user-facing error messages
   - Improve caching strategy
   - **Effort**: 3 hours
   - **Impact**: Agents work reliably

### 8.2 Short-Term (Next 2 Weeks)

1. **Implement Cross-Workspace Event Bus**
   - Design event schema
   - Implement event emitter/listener
   - Add cross-workspace subscriptions
   - **Effort**: 8 hours
   - **Impact**: Workspaces become reactive

2. **Create Unified File System Abstraction**
   - Design abstraction layer
   - Implement FSA + Dexie + WebContainer adapter
   - Add comprehensive tests
   - **Effort**: 12 hours
   - **Impact**: Single source of truth

3. **Implement Bidirectional Note Sync**
   - Add note → file write operation
   - Implement file watching
   - Add sync status indicators
   - **Effort**: 8 hours
   - **Impact**: Note edits preserved

### 8.3 Medium-Term (Next Month)

1. **Split God Stores**
   - Refactor rag-store.ts (1595 lines)
   - Organize into focused slices
   - Update all imports
   - **Effort**: 16 hours
   - **Impact**: Maintainable codebase

2. **Implement Workspace State Preservation**
   - Design state schema
   - Add save/restore mechanism
   - Implement auto-save on route change
   - **Effort**: 8 hours
   - **Impact**: No lost work on switch

3. **Create Notes Store**
   - Design store schema
   - Implement slices (CRUD, sync, UI)
   - Add persistence layer
   - **Effort**: 8 hours
   - **Impact**: Proper state management

---

## Conclusion

**Current State**: Fragmented architecture with solid components but poor integration
**Target State**: Unified architecture where workspaces are coordinated views into projects

**Key Finding**: The gaps are not in individual components (credential vault, Dexie, RAG are well-designed) but in the **integration architecture** that connects them.

**Critical Insight**: Patches will continue to fail because they address symptoms without fixing root causes. The "Option B" architectural redesign is required to achieve the multi-workspace vision.

**Next Step**: Phase 3 - Option B Architecture Design (detailed implementation plan)

---

**Status**: Assessment complete
**Next**: Create Option B Architecture Design document
