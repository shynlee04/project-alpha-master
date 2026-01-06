# Architectural Vision Analysis
**Date**: 2026-01-06
**Context**: Multi-Workspace BYOK Agent Platform
**Purpose**: Define the core architectural vision and why it matters

---

## The Vision: Fluid, Intelligent, Local-First Development Environment

### What This System Is Trying to Achieve

**A multi-workspace, AI-powered development environment where:**

1. **Users work with local projects** - All files stored on user's device, client-side only
2. **AI agents work alongside users** - BYOK (Bring Your Own Key) agents with full CRUD permissions
3. **Multiple specialized workspaces** - IDE, Notes, Knowledge, Study - each optimized for different tasks
4. **Seamless cross-workspace flow** - Switch workspaces without losing context or state
5. **Real-time synchronization** - Changes in one workspace instantly reflected in others
6. **Mobile and desktop support** - Same experience across devices with graceful degradation

### The User Journey (The "60% Pass" Benchmark)

**Persona**: Marketing Executive wants to build a full-stack React landing page

```
1. User opens app → Selects local project folder
2. Opens IDE workspace → Sees file tree, terminal, editor
3. Opens Notes workspace → Sees same files as editable notes
4. Switches back to IDE → Changes from Notes are visible
5. Starts AI chat → Grants autonomous tool permissions ("YOLO mode")
6. AI agent brainstorms (Vietnamese) → Generates spec plan
7. AI agent executes → Creates Next.js boilerplate
8. User sees files created in IDE within seconds
9. User switches to Notes → Sees new files, adds documentation
10. Switches back to IDE → Documentation appears in file tree
11. Context window reached → System auto-compacts, prompts user
12. User continues → Agent resumes execution
13. Deployment → Files ready for Vercel deployment
```

**Throughout this journey:**
- ✅ Project ID always visible in URL
- ✅ State persists across workspace switches
- ✅ Changes sync in real-time
- ✅ Agent can read/write files
- ✅ User can pause/cancel any operation
- ✅ Progress indicators show what's happening
- ✅ No errors crash the experience (fallbacks always)

---

## Core Architectural Principles

### 1. Project Context is First-Class Citizen

**Principle**: The project is the fundamental unit of work. Everything else (workspaces, agents, state) is scoped to a project.

**What This Means**:
```typescript
// ✅ CORRECT - Project context is clear
/ide/my-awesome-project
/notes/my-awesome-project
/knowledge/my-awesome-project

// ❌ WRONG - Project context is ambiguous
/ide  // Which project?
/notes  // Which project?
```

**Why It Matters**:
- URL represents current state (shareable, bookmarkable)
- State hydration is deterministic (projectId from URL → load state)
- No ambiguity about what project user is working on
- Cross-workspace coordination is explicit (all workspaces for same projectId)

### 2. Workspaces Are Views Into the Same Project

**Principle**: Workspaces are not isolated applications - they're different perspectives on the same project data.

**What This Means**:
```typescript
interface Project {
  id: string;
  filesystem: UnifiedFileSystem;  // Single source of truth
  metadata: ProjectMetadata;

  // Workspaces provide different views
  ideView(): IDEViewState;
  notesView(): NotesViewState;
  knowledgeView(): KnowledgeViewState;
}
```

**Why It Matters**:
- File created in IDE → instantly visible in Notes
- Note edited in Notes → file updated in filesystem
- Knowledge indexed → uses same files as IDE
- No "sync" needed - it's the same data

### 3. State Must Be Hot-Loadable and Reactive

**Principle**: State should persist across page refreshes and workspace switches without losing context.

**What This Means**:
```typescript
// ✅ CORRECT - State persists and restores
1. User edits file in IDE
2. User switches to Notes (same tab)
3. User switches back to IDE
4. Cursor position, open files, scroll position → all restored

// ❌ WRONG - State lost on workspace switch
1. User edits file in IDE
2. User switches to Notes
3. User switches back to IDE
4. All state gone, back to empty state
```

**Why It Matters**:
- User workflow is not interrupted by workspace switches
- Long-running operations continue in background
- Page refresh doesn't lose work
- Mobile users can close browser and resume later

### 4. File System is Single Source of Truth

**Principle**: The local file system (via File System Access API) is authoritative. All other systems cache metadata only.

**What This Means**:
```typescript
// ✅ CORRECT - File system is source of truth
interface UnifiedFileSystem {
  readFile(path: string): Promise<FileContent>;
  writeFile(path: string, content: FileContent): Promise<void>;
  watchFiles(callback: (changes: FileChange[]) => void): () => void;

  // Dexie caches metadata only
  // FSA provides actual file operations
  // WebContainer serves as in-memory view
}

// ❌ WRONG - Split brain
interface FragmentedFileSystem {
  dexieFiles: File[];  // Stored in Dexie
  fsaFiles: File[];   // Stored on disk
  webcontainerFiles: File[];  // In-memory
  // Which is truth? All can diverge!
}
```

**Why It Matters**:
- No data loss from sync issues
- No ambiguity about which file is current
- Simple mental model (files = files on disk)
- Real-time updates via file watching

### 5. Agents Are Workspace-Scoped But Credentials Are Global

**Principle**: Agent selection and tool permissions are per-workspace, but API keys are shared across workspaces.

**What This Means**:
```typescript
interface AgentConfiguration {
  // Global (shared across all workspaces)
  credentials: {
    openai: APIKey;  // Stored once
    anthropic: APIKey;  // Stored once
  }

  // Per-workspace
  workspaceAgents: {
    ide: {
      activeAgent: 'code-assistant';
      toolPermissions: ['read', 'write', 'execute'];
    },
    notes: {
      activeAgent: 'creative-writer';
      toolPermissions: ['read', 'write'];
    },
    knowledge: {
      activeAgent: 'researcher';
      toolPermissions: ['read', 'search'];
    }
  }
}
```

**Why It Matters**:
- User enters API key once, uses everywhere
- Different agents for different workspaces (context-appropriate)
- Tool permissions respect workspace purpose (IDE can execute, Notes cannot)
- Clear separation of concerns (credentials vs configuration)

### 6. Error Handling Must Have Absolute Fallbacks

**Principle**: No error should ever crash the experience. There must always be a graceful degradation path.

**What This Means**:
```typescript
// ✅ CORRECT - Fallback chain
async function openProjectFolder() {
  try {
    // Try FSA (desktop, HTTPS)
    const handle = await window.showDirectoryPicker();
    return new FSAAdapter(handle);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User denied - show helpful message
      showInlineMessage('Folder access needed for full functionality');
      return new InMemoryAdapter();  // Fallback to memory-only mode
    }
  }

  // Mobile detection → skip FSA entirely
  if (isMobile()) {
    showInlineMessage('Folder mounting not available on mobile');
    return new AlphaStorageAdapter();  // Mobile-specific fallback
  }
}

// ❌ WRONG - Throws error, crashes UI
async function openProjectFolder() {
  const handle = await window.showDirectoryPicker();
  // If this throws, entire app crashes
}
```

**Why It Matters**:
- Mobile users don't see errors (helpful UI instead)
- Desktop users who deny permission still have functional app
- Progressive enhancement (better experience when features available)
- No "white screen of death"

---

## Why Current Architecture Fails the Vision

### Gap Analysis

| Vision Requirement | Current State | Gap |
|-------------------|--------------|-----|
| **Project context in URL** | Only IDE has empty state, others lack it | Routes without `$projectId` create ambiguous state |
| **Workspaces as views** | Workspaces isolated, no shared state | Note edits don't sync to IDE files |
| **Hot-loadable state** | State lost on workspace switch | Manual store manipulation, no coordination |
| **Single file system source** | Dexie + FSA + WebContainer (split brain) | Note-folder-bridge is partial, one-way sync |
| **Scoped agents, global keys** | Mixed - credentials global, agents unclear | No workspace-specific tool permissions |
| **Absolute fallbacks** | FSA errors crash app | No mobile detection, no graceful degradation |

### Specific Failure Points

#### 1. Route Architecture Breaks Project Context

**Problem**: Routes without `$projectId` parameter
```typescript
// Current state
/ide  // Which project? Store state unclear
/notes/$projectId  // Project context in URL
/knowledge/$projectId  // Project context in URL
```

**Impact**:
- User visits `/ide` → no projectId in URL
- Selects folder → projectId set in store but NOT URL
- Page refresh → URL still `/ide` → state lost
- Folder selector appears again (user confused)

**Why Vision Fails**: Project context is not first-class citizen

#### 2. Note System Split Brain

**Problem**: Notes stored in Dexie, files stored in FSA
```typescript
// Current state
- User edits note in Notes workspace
- Note saved to Dexie (IndexedDB)
- File on disk NOT updated
- User switches to IDE
- File shows old content (confusion!)
```

**Impact**:
- Note edits lost on workspace switch
- No bidirectional sync
- User doesn't know which version is current

**Why Vision Fails**: File system is not single source of truth

#### 3. No Cross-Workspace Reactivity

**Problem**: Workspaces don't communicate
```typescript
// Current state
- User creates file in IDE
- User switches to Notes
- New file doesn't appear (need manual refresh)
- No event bus for cross-workspace updates
```

**Impact**:
- Changes not reflected across workspaces
- User must manually refresh
- Breaks fluid workflow

**Why Vision Fails**: Workspaces are not views into same project

#### 4. State Lost on Workspace Switch

**Problem**: No state preservation mechanism
```typescript
// Current state
- User has 5 files open in IDE, cursor at line 42
- User switches to Notes to check something
- User switches back to IDE
- All files closed, cursor reset (state lost)
```

**Impact**:
- Interrupts user workflow
- User loses place in work
- Frustrating experience

**Why Vision Fails**: State is not hot-loadable and reactive

#### 5. No Mobile Fallbacks

**Problem**: FSA features throw errors on mobile
```typescript
// Current state (HubHomePage.tsx)
const handleMountFolder = async () => {
  const handle = await window.showDirectoryPicker();  // Throws on mobile!
  // No try/catch, no feature detection
  // Mobile users see crash
}
```

**Impact**:
- Mobile users can't use app
- No helpful error messages
- App appears broken

**Why Vision Fails**: No absolute fallbacks

---

## The "Option B" Architecture Solution

Based on the vision analysis, here's why "Option B" (proper architecture) is required:

### Why It's the Only Path Forward

**Option A** (continue patching):
- ✅ Quick fixes for individual symptoms
- ❌ Never addresses root causes
- ❌ Accumulates technical debt
- ❌ Vision remains unachieved

**Option B** (architectural redesign):
- ✅ Addresses root causes
- ✅ Aligns implementation with vision
- ✅ Reduces technical debt
- ✅ Vision becomes achievable

### Option B Core Requirements

1. **Strict Route Parameterization**
   - ALL workspace routes require `$projectId`
   - Routes without `$projectId` redirect to picker
   - URL always represents current state

2. **Unified Note Systems**
   - Notes ARE files in the project
   - Dexie caches metadata only
   - FSA is single source of truth
   - Bidirectional sync (read/write)

3. **Cross-Workspace Event Bus**
   - File change events broadcast to all workspaces
   - Workspace state synchronization
   - Hot-loadable state preservation

4. **Absolute Fallback Strategy**
   - Feature detection before FSA calls
   - Mobile-specific alternatives (Alpha Storage)
   - Helpful inline messages
   - Never throw, always degrade gracefully

---

## Conclusion

The architectural vision is clear: **a fluid, intelligent, local-first development environment where AI agents and users collaborate across multiple specialized workspaces, with project context as the foundation.**

The current architecture fails this vision because:
- Project context is not first-class citizen (routes without projectId)
- Workspaces are not coordinated views (isolated state)
- File system is fragmented (Dexie + FSA + WebContainer)
- No cross-workspace reactivity (changes not reflected)
- No graceful error handling (crashes instead of fallbacks)

**The "Option B" redesign is not optional - it's the only path to achieving the vision.**

Patches will continue to address symptoms while the root causes remain, leading to:
- More technical debt
- More user frustration
- More patches needed
- Vision never achieved

**We must execute Option B to align the implementation with the architectural vision.**

---

**Next**: Phase 2 - Current State Assessment (Detailed Gap Analysis)
