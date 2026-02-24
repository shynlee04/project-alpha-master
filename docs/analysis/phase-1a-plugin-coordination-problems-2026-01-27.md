# Phase 1A Plugin Coordination: Technical Problem Analysis

**Document ID**: ANALYSIS-2026-01-27-001
**Status**: DRAFT - For Architect & PM Review
**Target Audience**: Architects, Product Managers, Engineering Leads
**Related**: [the-3-phase-approach.md](../the-3-phase-approach.md), [new-fundamental-truths.md](../new-fundamental-truths.md)

---

## Executive Summary

Phase 1A requires **4 core plugins** (FileTree, Monaco, Notes, Terminal, Preview) to work as an **integrated system** with multiple valid plugin combinations. The current implementation has individual working plugins, but lacks the **orchestration layer** required for cross-plugin coordination.

**Key Finding**: Plugins are **architecturally isolated**. Each works correctly in isolation, but fails when coordination is required. The EventBus, ProjectContext, and file-event-bus exist, but plugins don't use them for coordination.

**Completion Assessment**: Phase 1A is **~30% complete**, not the previously estimated 60%. The visible progress masks fundamental coordination gaps.

---

## Part 1: The Plugin Matrix Requirements

### 1.1 Valid Plugin Combinations (User Workflows)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PLUGIN COMBINATION MATRIX                            │
├──────────────┬─────────────────────────────────────────────────────────────┤
│ WORKFLOW     │ PLUGINS                    │ EXPECTED BEHAVIOR               │
├──────────────┼─────────────────────────────┼───────────────────────────────┤
│ Full Dev     │ FT + Mon + Term + Prev      │ Build → Run → Preview HMR    │
│ Quick Coding │ FT + Mon + Chat*            │ AI-assisted editing          │
│ Study Mode   │ FT + Notes                  │ Read docs, take notes        │
│ Zen Mode     │ Mon only                    │ Deep focus                    │
│ Debug Mode   │ FT + Mon + Term             │ Run tests, check logs        │
│ Notes Focus  │ FT + Notes + Chat*          │ AI-assisted note-taking      │
├──────────────┴─────────────────────────────┴───────────────────────────────┤
│ * Chat is Phase 2 - listed for completeness but out of Phase 1A scope    │
│ FT = FileTree, Mon = Monaco, Term = Terminal, Prev = Preview             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Current State**: Only the **individual plugins** work. No **combination logic** exists.

### 1.2 Device-Type Capability Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DEVICE-TYPE PLUGIN CAPABILITY MATRIX                    │
├────────────┬────────────────────────────────────────────────────────────────┤
│ PLUGIN      │ Desktop │ Tablet │ Tablet (Large) │ Mobile │ CONSTRAINT        │
├────────────┼─────────┼────────┼───────────────┼────────┼───────────────────┤
│ FileTree    │    ✅   │   ✅   │      ✅       │   ✅   │ Universal         │
│ Monaco      │    ✅   │   ✅   │      ✅       │   ❌   │ FSA required      │
│ Notes       │    ✅   │   ✅   │      ✅       │   ✅   │ Universal         │
│ Terminal    │    ✅   │   ❌   │      ❌       │   ❌   │ FSA + Desktop     │
│ Preview     │    ✅   │   ❌   │      ❌       │   ❌   │ FSA + Desktop     │
│ Chat        │    ✅   │   ✅   │      ✅       │   ✅   │ Phase 2          │
├────────────┼─────────┼────────┼───────────────┼────────┼───────────────────┤
│ MAX ACTIVE  │    5    │   3    │       4       │   2    │ UI constraints    │
├────────────┴─────────┴────────┴───────────────┴────────┴───────────────────┤
│                                                                              │
│ PROBLEM: No systematic enforcement of these constraints                      │
│ - Plugins don't declare device-type requirements                           │
│ - Layout system has hard-coded assumptions                                 │
│ - Mobile shows "Plugin not found" instead of graceful alternatives          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Technical Problem Analysis

### 2.1 Problem Category: Shared State Across Plugins

**Requirement**: Multiple plugins need to know "what file is currently active"

**Current Implementation**:
```typescript
// Monaco: Uses local state
const [activePath, setActivePath] = useState<string | null>(null);

// Notes: Uses computed path from project
const noteId = useMemo(() => `${project.folderPath}/notes/note.md`, [project]);

// FileTree: Uses store for selection
const selectedPath = useFileTreeStore((s) => s.selectedPath);
```

**The Problem**: Three separate sources of truth, no coordination.

| Plugin | Active File Source | Updates When | Problem |
|--------|-------------------|--------------|---------|
| Monaco | `activePath` state | FILE_OPENED event | Not shared |
| Notes | Hardcoded `noteId` | Never | Static path |
| FileTree | `selectedPath` in store | User click | Not consumed by others |

**Impact**:
- Opening a file in FileTree → Monaco sees it ✅
- Opening a file in FileTree → Notes doesn't know ❌
- Editing in Monaco → Notes doesn't mirror ❌
- No way to say "open same file in Notes"

**Root Cause**: Missing `ActiveDocument` shared state contract.

---

### 2.2 Problem Category: Monaco ↔ Notes Mirroring

**Requirement**: "Monaco editor - hot load reactive... auto saved and synchronize to file system"

**User Expectation**:
```
1. Click "README.md" in FileTree
2. Monaco opens README.md (raw markdown editing)
3. Toggle Notes plugin ON
4. Notes opens SAME README.md (BlockNote rich editing)
5. Edit in Notes → Monaco reflects changes
6. Edit in Monaco → Notes reflects changes
```

**Current Implementation Analysis**:

```typescript
// MonacoMain.tsx:218-231
useEffect(() => {
  const unsubscribe = eventBus.on(DomainEventType.FILE_OPENED, (event) => {
    setActivePath(event.payload.path);  // ✅ Listens to FileTree
  });
  return () => unsubscribe();
}, []);

// NotesPlugin.tsx:67-77
const noteId = React.useMemo(() => {
  if (project.storageType === 'fsa') {
    return `${project.folderPath}/notes/note.md`;  // ❌ Hardcoded path!
  }
  return project.id;
}, [project]);
```

**The Problems**:

1. **No shared file reference**: Notes doesn't listen to `FILE_OPENED`
2. **No mirroring mechanism**: No coordination layer knows both editors have the same file
3. **No conflict resolution**: What happens when both edit simultaneously?
4. **No sync protocol**: File event bus exists but usage is inconsistent

**File Event Bus Usage**:
```typescript
// Monaco: Subscribes to file:updated
useFileEventBus({
  eventName: 'file:updated',
  handler: (event) => { /* reload if not modified locally */ }
});

// Notes: Also subscribes to file:updated
useFileEventBus({
  eventName: 'file:updated',
  handler: (event) => { /* shows toast, doesn't reload */ }
});
```

**Gap**: Both subscribe, but neither knows the other has the file open. No "writer priority" system.

---

### 2.3 Problem Category: Terminal + WebContainer Integration

**Requirement**: "Terminal and the Webcontainer API to creation of sandboxing environment → terminal can run actual commands"

**Existing Infrastructure** (works correctly):
- ✅ `WebContainerManager` - singleton boots correctly
- ✅ `TerminalAdapter` - binds xterm to jsh shell
- ✅ `WebContainerFSAAdapter` - mounts FSA files to WC virtual FS
- ✅ `fsa-adapter.ts` - has `mountToContainer()` method

**The Missing Link** (Terminal Plugin):

```typescript
// TerminalMain.tsx:47-143
function TerminalMain(_props: PluginMainProps) {
  const { gateway } = useProjectContext();

  // ❌ Missing: WebContainer boot on mount
  // ❌ Missing: FSA → WebContainer mount
  // ❌ Missing: TerminalAdapter connection
  // ❌ Missing: Working directory sync with project

  return (
    <div>
      <TerminalPanel
        cwd={project.folderPath || '/project'}  // ⚠️ Just a string prop
        initialSyncCompleted={true}              // ⚠️ Faked!
      />
    </div>
  );
}
```

**What SHOULD Happen**:
```typescript
// Expected flow (not implemented):
1. Terminal plugin mounts
2. Check if WebContainer booted → if not, boot it
3. Check if FSA files mounted → if not, mount them
4. Create TerminalAdapter connected to WC shell
5. Sync cwd with project path
6. Terminal commands run against mounted files
```

**What ACTUALLY Happens**:
```
1. Terminal plugin mounts
2. Shows UI (xterm terminal)
3. Shell starts in ISOLATED environment (no project files)
4. User types `ls` → sees empty or wrong directory
5. User types `pnpm dev` → "command not found" (no package.json)
```

**Additional Gap**: Terminal has no awareness of project lifecycle changes.
- What if project switches while terminal is running?
- What if FSA handle changes?
- No cleanup or re-mount logic.

---

### 2.4 Problem Category: Preview Plugin Integration

**Requirement**: "Preview → can run preview such as `pnpm dev` to open preview in an embedding window"

**Current Implementation**:
```typescript
// PreviewMain.tsx:83-94
useEffect(() => {
  const handleDevServerReady = (event: CustomEvent<DevServerReadyDetail>) => {
    setPreviewUrl(event.detail.url);  // ✅ Receives URL
  };
  window.addEventListener('dev-server-ready', handleDevServerReady);
  return () => window.removeEventListener('dev-server-ready', handleDevServerReady);
}, []);
```

**The Problems**:

1. **No event source**: Who emits `dev-server-ready`? Currently **nobody**.
2. **No process tracking**: No awareness of what processes are running
3. **No URL detection**: Terminal output parsing for URLs is missing
4. **State when OFF**: No mechanism to queue URLs for when Preview toggles ON

**Expected Flow** (not implemented):
```
1. User activates Terminal + Preview
2. User types `pnpm dev` in Terminal
3. Terminal output parser detects "Local: http://localhost:3000"
4. Emits dev-server-ready event
5. Preview receives and displays iframe
6. File change → HMR updates Preview
```

---

### 2.5 Problem Category: Plugin Lifecycle & State Preservation

**Requirement**: Toggle plugins ON/OFF → state preserved, quick resume

**Current Implementation Analysis**:

```typescript
// PluginLayout.tsx (current)
// When plugin toggled OFF:
activePlugins = activePlugins.filter(id => id !== pluginId);  // Just removes from array

// When plugin toggled ON:
activePlugins = [...activePlugins, pluginId];  // Just adds to array
```

**What Happens**:
```
Plugin OFF → Plugin component unmounts → ALL STATE LOST
Plugin ON  → Plugin component remounts → REINITIALIZES FROM SCRATCH
```

**Specific Impacts**:

| Plugin | State Lost When Toggled | User Impact |
|--------|------------------------|-------------|
| Monaco | Active file, cursor position, unsaved changes (in editor) | Lost work |
| Terminal | Shell session, command history, running processes | Disrupted workflow |
| Preview | Dev server URL, iframe state | Need to re-run command |
| Notes | Current note, cursor position | Lost context |

**What SHOULD Happen**:
```
1. Plugin OFF → Component unmounts, STATE PRESERVED in store
2. Plugin ON  → Component remounts, STATE RESTORED from store
3. Background resources (WebContainer) stay alive
4. Running processes continue (or gracefully pause)
```

---

### 2.6 Problem Category: Graceful Degradation

**Requirement**: Plugins work correctly when other plugins are absent

**Test Scenarios**:

| Scenario | Expected Behavior | Current Behavior |
|----------|-------------------|------------------|
| Preview OFF + Terminal runs `pnpm dev` | URL queued, shown when Preview toggled ON | ❌ URL lost |
| Monaco OFF + FileTree file selected | FileTree works, marks selection | ⚠️ Works but Monaco unaware |
| Terminal OFF + Preview active | Preview shows "Run dev server" hint | ❌ No integration |
| Notes OFF + Monaco editing .md | Monaco works normally | ✅ Works (no dependency) |

**Gap**: No "deferred capability" pattern. Plugins can't signal "I can provide X if you toggle me on."

---

## Part 3: Architectural Root Causes

### 3.1 Missing Plugin Contract Interface

**Current `FeaturePlugin` Interface**:
```typescript
// domain/interfaces/feature-plugin.interface.ts
export interface FeaturePlugin {
  id: PluginId;
  name: string;
  icon: ReactNode;
  description: string;
  requirements: {
    storageType: 'any' | 'fsa' | 'indexeddb';
    deviceType: 'any' | 'desktop' | 'mobile';
    minWidth: number;
    maxInstances: number;
  };
  MainComponent: React.ComponentType<PluginMainProps>;
  onMount?: (context: ProjectContext) => Promise<void>;
  onUnmount?: () => Promise<void>;
  onProjectChange?: (newProjectId: string) => Promise<void>;
}
```

**What's Missing**:
```typescript
// NOT in current interface:
export interface FeaturePlugin {
  // ... existing ...

  // MISSING: Capability declarations
  provides?: PluginCapability[];  // What this plugin offers to others

  // MISSING: Dependency declarations
  requires?: {
    plugins?: PluginId[];         // Which other plugins must exist
    services?: ServiceId[];       // Which shared services needed
    resources?: ResourceId[];     // Which resources needed (WebContainer)
  };

  // MISSING: State contracts
  stateSchema?: StateSchema;       // What state this plugin persists

  // MISSING: Event contracts
  emits?: PluginEvent[];           // What events this plugin emits
  consumes?: PluginEvent[];        // What events this plugin responds to

  // MISSING: Lifecycle hooks for toggle
  onEnable?: () => Promise<void>;   // When toggled ON
  onDisable?: () => Promise<void>;  // When toggled OFF (preserve state)
}
```

### 3.2 Missing Shared State Contracts

**What Should Exist** (but doesn't):
```typescript
// infrastructure/context/plugin-coordination.ts (DOESN'T EXIST)

export interface PluginCoordinationContext {
  // Shared "active document" state
  activeDocument: {
    path: string | null;
    editors: PluginId[];  // Which plugins have this file open
    lastWriter: PluginId | null;  // Who made last edit
  };

  // Running processes registry
  processes: {
    terminal: ProcessInfo[];
    devServers: DevServerInfo[];
  };

  // Deferred capabilities (what's available if plugin toggled on)
  deferredCapabilities: {
    previewUrls: string[];  // URLs queued for Preview
    terminalSessions: SessionData[];  // Sessions queued for Terminal
  };

  // Actions
  openDocument(path: string, inPlugin: PluginId): void;
  registerEditor(path: string, plugin: PluginId): void;
  unregisterEditor(path: string, plugin: PluginId): void;
  claimWriteLock(path: string, plugin: PluginId): void;
}
```

### 3.3 Missing Plugin Dependency Resolution

**Current Pattern** (manual in each plugin):
```typescript
// Each plugin checks requirements independently
if (project.deviceType !== 'desktop') {
  return <BlockedMessage />;
}
if (project.storageType !== 'fsa') {
  return <BlockedMessage />;
}
```

**What Should Exist** (centralized):
```typescript
// infrastructure/plugins/plugin-dependency-resolver.ts (DOESN'T EXIST)

export class PluginDependencyResolver {
  // Before enabling a plugin, check dependencies
  canEnable(pluginId: PluginId, activePlugins: PluginId[]): {
    allowed: boolean;
    missing?: PluginId[] | ServiceId[] | ResourceId[];
    reason?: string;
  }

  // Get what needs to happen before plugin can enable
  getPrerequisites(pluginId: PluginId): Prerequisite[];
}

// Example usage:
// User clicks "Terminal" toggle
// → resolver.canEnable('terminal', ['filetree', 'monaco'])
// → { allowed: false, missing: ['webcontainer'] }
// → UI shows: "Terminal requires WebContainer (will boot on enable)"
// → User confirms → WebContainer boots → Terminal enables
```

### 3.4 Missing EventBus Coordination Contracts

**Current EventBus** (exists but under-specified):
```typescript
// infrastructure/events/event-bus.ts
export const eventBus = {
  emit: (type: string, payload: unknown) => void,
  on: (type: string, handler: Handler) => () => void,
};
```

**Missing**: No event contracts, no schemas, no documentation of:
- What events exist?
- What payload shapes?
- Who emits what?
- Who consumes what?
- What's the order of handling?

---

## Part 4: Impact Analysis by User Journey

### 4.1 Journey: "Build and Run a TanStack Project"

**User Steps**:
```
1. Create project from local folder ✅
2. See file tree ✅
3. Open file in Monaco ✅
4. Toggle Terminal ON ⚠️
5. Run `pnpm install` ❌ (Terminal has no files)
6. Run `pnpm dev` ❌ (Terminal has no files)
7. Toggle Preview ON ⚠️
8. See running app ❌ (No URL passed)
```

**Technical Failures**:
- Step 4: Terminal doesn't boot WebContainer
- Step 4: Terminal doesn't mount FSA files
- Step 5: Command runs in empty container
- Step 8: Preview never receives URL

### 4.2 Journey: "Edit README.md in Monaco and Notes"

**User Steps**:
```
1. Open project ✅
2. Click README.md in FileTree ✅
3. Monaco shows README.md ✅
4. Toggle Notes ON ⚠️
5. Notes shows notes/note.md (wrong file!) ❌
6. Edit in Notes ❌ (Monaco doesn't update)
7. Toggle to Monaco ⚠️
8. Edit in Monaco ❌ (Notes doesn't update)
```

**Technical Failures**:
- Step 5: Notes doesn't listen to active document
- Step 6: No mirroring mechanism
- Step 8: No bidirectional sync

---

## Part 5: Summary of Gaps

### 5.1 By Category

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GAP SUMMARY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ SHARED STATE (5 gaps)                                                       │
│   • No shared ActiveDocument state                                         │
│   • No "who has this file open" tracking                                   │
│   • No write-lock mechanism for concurrent editing                         │
│   • No deferred capability queue (URLs, sessions)                          │
│   • No process registry (what's running where)                             │
│                                                                              │
│ PLUGIN DECLARATIONS (4 gaps)                                                │
│   • No capability declarations (what plugin provides)                       │
│   • No dependency declarations (what plugin needs)                         │
│   • No event contracts (emits/consumes)                                    │
│   • No state schema (what persists across toggle)                          │
│                                                                              │
│ LIFECYCLE MANAGEMENT (3 gaps)                                                │
│   • No onEnable/onDisable hooks                                            │
│   • No state preservation across toggle                                    │
│   • No lazy resource booting                                               │
│                                                                              │
│ DEPENDENCY RESOLUTION (2 gaps)                                              │
│   • No dependency checker before enabling                                  │
│   • No prerequisite resolution (boot WebContainer if needed)               │
│                                                                              │
│ EVENT COORDINATION (3 gaps)                                                 │
│   • No event schema contracts                                              │
│   • No event ordering/priority                                             │
│   • No cross-plugin event documentation                                     │
│                                                                              │
│ DEVICE-TYPE HANDLING (2 gaps)                                                │
│   • No systematic device-type capability enforcement                        │
│   • No graceful fallback for unsupported device types                      │
│                                                                              │
│ TOTAL: 19 identified gaps                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 By Plugin

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLUGIN-SPECIFIC GAPS                              │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ PLUGIN       │ GAPS                                                          │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ FileTree     │ • Provides selection but no coordination contract             │
│              │ • No "selected file" state consumed by others                 │
│              │ • Works in isolation only                                    │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Monaco       │ • Has active file state but not shared                       │
│              │ • Subscribes to events but no write coordination               │
│              │ • No awareness of Notes plugin                               │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Notes        │ • Hardcoded noteId (should use ActiveDocument)               │
│              │ • No mirroring with Monaco                                  │
│              │ • No concurrent editing conflict resolution                  │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Terminal     │ • Doesn't boot WebContainer                                 │
│              │ • Doesn't mount FSA files                                  │
│              │ • No process registry integration                           │
│              │ • No dev server URL detection/emission                      │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Preview      │ • Has URL listener but no event source                     │
│              │ • No deferred URL queue when OFF                           │
│              │ • No HMR integration                                      │
├──────────────┴──────────────────────────────────────────────────────────────┤
│                                                                              │
│ CROSS-PLUGIN: No coordination layer exists                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Recommendations for Next Steps

### 6.1 Immediate Architectural Decisions Needed

1. **Plugin Contract Specification**
   - Define `PluginCapability`, `PluginDependency`, `PluginEvent` types
   - Specify state schema for each plugin
   - Document onEnable/onDisable lifecycle

2. **Shared State Layer**
   - Create `PluginCoordinationContext` or equivalent
   - Define `ActiveDocument` state contract
   - Define `ProcessRegistry` for running processes

3. **Event Bus Contracts**
   - Document all event types with payload schemas
   - Define event ownership (who emits, who consumes)
   - Define event ordering/priority rules

4. **Dependency Resolution**
   - Design plugin dependency graph
   - Design prerequisite resolution flow
   - Design user confirmation flow for heavy operations (WebContainer boot)

### 6.2 Implementation Priority

```
P0 (Blocks Phase 1A completion):
├── Shared ActiveDocument state
├── Plugin dependency declarations
├── Terminal WebContainer integration
└── Preview dev-server URL flow

P1 (Important for UX):
├── State preservation across toggle
├── Monaco ↔ Notes mirroring
└── Graceful degradation patterns

P2 (Nice to have):
├── Process registry UI
├── Advanced conflict resolution
└── Device-type capability enforcement
```

---

## Appendix A: File References

**Plugin Main Components**:
- [FileTreePlugin.tsx](../src/plugins/filetree/FileTreePlugin.tsx)
- [MonacoMain.tsx](../src/plugins/monaco/MonacoMain.tsx)
- [NotesPlugin.tsx](../src/plugins/notes/NotesPlugin.tsx)
- [TerminalMain.tsx](../src/plugins/terminal/TerminalMain.tsx)
- [PreviewMain.tsx](../src/plugins/preview/PreviewMain.tsx)

**Coordination Infrastructure**:
- [project-context.tsx](../src/infrastructure/context/project-context.tsx)
- [plugin-registry.ts](../src/infrastructure/plugins/plugin-registry.ts)
- [event-bus.ts](../src/infrastructure/events/event-bus.ts)
- [file-event-bus.ts](../src/infrastructure/events/file-event-bus.ts)

**WebContainer Integration**:
- [manager.ts](../src/lib/webcontainer/manager.ts)
- [terminal-adapter.ts](../src/lib/webcontainer/terminal-adapter.ts)
- [fsa-adapter.ts](../src/infrastructure/webcontainer/fsa-adapter.ts)

---

**End of Analysis**

*This document is intended to provide architects and product managers with a comprehensive technical view of the Phase 1A coordination gaps. For implementation planning, refer to separate Epic specifications.*
