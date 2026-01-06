# Option B Architecture Design - Proper Architecture Implementation
**Date**: 2026-01-06
**Purpose**: Detailed technical specification for architectural redesign
**Status**: Ready for Implementation

---

## Executive Summary

This document provides a complete technical specification for the "Option B" architectural redesign. It is implementation-ready and addresses all critical gaps identified in the Current State Assessment.

**Core Changes**:
1. Strict route parameterization (ALL workspace routes require `$projectId`)
2. Unified file system abstraction (single source of truth)
3. Cross-workspace event bus (reactive updates)
4. Mobile/desktop fallback strategy (graceful degradation)
5. Project context system (coordinated state management)

**Estimated Effort**: 80 hours (2 weeks with focused development)
**Risk Level**: Medium (requires careful migration planning)
**Impact**: Critical (achieves architectural vision)

---

## 1. Strict Route Parameterization

### 1.1 Route Structure Specification

**Current State** (Inconsistent):
```typescript
/ide                    // Empty state (has picker)
/ide/$projectId         // Parameterized (has loader)
/notes/$projectId       // Parameterized (NO loader, NO empty state)
/knowledge/$projectId   // Parameterized (NO loader, NO empty state)
```

**Target State** (Consistent):
```typescript
/picker                // Centralized project selection
/ide/$projectId         // IDE workspace
/notes/$projectId       // Notes workspace
/knowledge/$projectId   // Knowledge workspace
/study/$projectId       // Study workspace (future)

// Root redirects to picker
/ → redirect to /picker
/ide → redirect to /picker
/notes → redirect to /picker
```

### 1.2 Implementation: Centralized Project Picker

**File**: `src/routes/picker.tsx`
```typescript
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';
import { ProjectPicker } from '@/presentation/components/projects/ProjectPicker';

export const Route = createFileRoute('/picker')({
  component: ProjectPickerRoute,
})

function ProjectPickerRoute() {
  const navigate = useNavigate();
  const search = useSearch<{ from?: string }>();

  // Load all projects
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);

  const handleSelectProject = (projectId: string) => {
    // Determine which workspace to redirect to
    const from = search.from || 'ide';  // Default to IDE

    // Navigate to workspace with projectId
    navigate({
      to: `/$from/$projectId`,
      params: { projectId }
    });
  };

  const handleCreateNewProject = async () => {
    // Create new project logic
    const projectId = await createNewProject();
    handleSelectProject(projectId);
  };

  return (
    <ProjectPicker
      projects={allProjects ?? []}
      onSelectProject={handleSelectProject}
      onCreateNew={handleCreateNew}
    />
  );
}
```

### 1.3 Implementation: Empty State Redirects

**File**: `src/routes/index.tsx`
```typescript
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useProjectStore } from '@/infrastructure/persistence/stores/workspace/useProjectStore';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Check if there's a current project
    const currentProjectId = useProjectStore.getState().currentProjectId;

    if (currentProjectId) {
      // User has active project, go to IDE
      throw redirect({
        to: '/ide/$projectId',
        params: { projectId: currentProjectId }
      });
    } else {
      // No active project, go to picker
      throw redirect({
        to: '/picker'
      });
    }
  }
});
```

### 1.4 Implementation: Workspace Route with Loader

**File**: `src/routes/notes.$projectId.tsx`
```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getProject } from '@/lib/workspace/projects';
import { NotesWorkspace } from '@/presentation/components/notes/NotesWorkspace';
import { useProjectStore } from '@/infrastructure/persistence/stores/workspace/useProjectStore';

export const Route = createFileRoute('/notes/$projectId')({
  // ✅ ADD: Loader to load project before render
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);

    if (!project) {
      // Project doesn't exist, redirect to picker
      throw redirect({
        to: '/picker',
        search: { from: 'notes' }
      });
    }

    return { project };
  },

  component: NotesWorkspaceRoute,
})

function NotesWorkspaceRoute() {
  const { project } = Route.useLoaderData();
  const { projectId } = Route.useParams();
  const navigate = useNavigate();

  // ✅ ADD: Set project context in store
  useProjectStore.getState().setCurrentProject(projectId);

  // ✅ ADD: Handle project removal
  const handleProjectRemoved = () => {
    navigate({ to: '/picker' });
  };

  return (
    <NotesWorkspace
      project={project}
      onProjectRemoved={handleProjectRemoved}
    />
  );
}
```

### 1.5 Implementation: Workspace Empty State (Alternative Approach)

**File**: `src/routes/notes.tsx`
```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';
import { ProjectPicker } from '@/presentation/components/projects/ProjectPicker';

export const Route = createFileRoute('/notes')({
  component: NotesEmptyState,
})

function NotesEmptyState() {
  const navigate = useNavigate();

  // Load projects with Notes binding
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);
  const notesProjects = allProjects?.filter(p => p.workspaceBindings?.notes === true);

  const handleSelectProject = (projectId: string) => {
    navigate({
      to: '/notes/$projectId',
      params: { projectId }
    });
  };

  return (
    <ProjectPicker
      title="Select a Project for Notes Workspace"
      projects={notesProjects ?? []}
      onSelectProject={handleSelectProject}
      filter="notes"
    />
  );
}
```

### 1.6 Migration Plan

**Step 1**: Create centralized picker route (1 hour)
**Step 2**: Update all workspace routes with loaders (2 hours)
**Step 3**: Add empty state redirects (1 hour)
**Step 4**: Update all navigation calls to use new route structure (2 hours)
**Step 5**: Test all navigation flows (1 hour)

**Total Effort**: 7 hours

**Risk**: Breaking existing bookmarks/shared links
**Mitigation**: Implement redirect logic from old routes to new routes

---

## 2. Unified File System Abstraction

### 2.1 Architecture Design

**Goal**: Single source of truth for file operations, abstracting over FSA, Dexie, and WebContainer.

**Interface**:
```typescript
// File: src/lib/workspace/fs/UnifiedFileSystem.ts

interface FileSystemEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  mtime?: number;
}

interface FileReadResult {
  content: string | ArrayBuffer;
  mtime: number;
}

interface FileWriteOptions {
  createParentDirectories?: boolean;
  broadcastEvents?: boolean;  // Default: true
}

export interface UnifiedFileSystem {
  // Core operations
  readFile(path: string): Promise<FileReadResult>;
  writeFile(path: string, content: string | ArrayBuffer, options?: FileWriteOptions): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listDirectory(path: string): Promise<FileSystemEntry[]>;
  exists(path: string): Promise<boolean>;

  // Watching
  watch(callback: (changes: FileChangeEvent[]) => void): () => void;

  // Permissions
  requestPermission(): Promise<boolean>;
  hasPermission(): Promise<boolean>;

  // Metadata
  getProjectHandle(): FileSystemDirectoryHandle | null;

  // Cleanup
  close(): Promise<void>;
}

interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted';
  path: string;
  timestamp: number;
}
```

### 2.2 Implementation: Adapter Pattern

**File**: `src/lib/workspace/fs/adapters/FSAAdapter.ts`
```typescript
export class FSAAdapter implements UnifiedFileSystem {
  private handle: FileSystemDirectoryHandle;
  private eventEmitter = new EventEmitter();
  private watchers = new Map<string, FileSystemWatcher>();

  constructor(handle: FileSystemDirectoryHandle) {
    this.handle = handle;
  }

  async readFile(path: string): Promise<FileReadResult> {
    const fileHandle = await this.getFileHandle(path);
    const file = await fileHandle.getFile();
    const content = await file.arrayBuffer();

    return {
      content,
      mtime: file.lastModified
    };
  }

  async writeFile(path: string, content: string | ArrayBuffer, options?: FileWriteOptions): Promise<void> {
    // Ensure parent directory exists
    if (options?.createParentDirectories) {
      await this.ensureDirectoryExists(path.split('/').slice(0, -1).join('/'));
    }

    // Get or create file handle
    const fileHandle = await this.getFileHandle(path, { create: true });

    // Create writable stream
    const writable = await fileHandle.createWritable();

    // Write content
    await writable.write(content);
    await writable.close();

    // Broadcast event if enabled
    if (options?.broadcastEvents !== false) {
      this.eventEmitter.emit('change', [{
        type: 'modified',
        path,
        timestamp: Date.now()
      }]);
    }
  }

  async listDirectory(path: string): Promise<FileSystemEntry[]> {
    const dirHandle = await this.getDirectoryHandle(path);
    const entries: FileSystemEntry[] = [];

    for await (const entry of dirHandle.values()) {
      entries.push({
        name: entry.name,
        path: `${path}/${entry.name}`,
        type: entry.kind
      });
    }

    return entries;
  }

  watch(callback: (changes: FileChangeEvent[]) => void): () => void {
    const listener = (changes: FileChangeEvent[]) => callback(changes);
    this.eventEmitter.on('change', listener);

    // Return unsubscribe function
    return () => this.eventEmitter.off('change', listener);
  }

  async requestPermission(): Promise<boolean> {
    return await this.handle.requestPermission({ mode: 'readwrite' });
  }

  async hasPermission(): Promise<boolean> {
    return await this.handle.queryPermission({ mode: 'readwrite' }) === 'granted';
  }

  private async getFileHandle(path: string, options?: { create?: boolean }): Promise<FileSystemFileHandle> {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    const dirPath = parts.join('/');

    const dirHandle = await this.getDirectoryHandle(dirPath, options);
    return await dirHandle.getFileHandle(fileName, options);
  }

  private async getDirectoryHandle(path: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle> {
    if (path === '' || path === '/') {
      return this.handle;
    }

    const parts = path.split('/').filter(Boolean);
    let currentHandle = this.handle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, options);
    }

    return currentHandle;
  }
}
```

**File**: `src/lib/workspace/fs/adapters/InMemoryAdapter.ts`
```typescript
// Fallback for mobile or when FSA not available

export class InMemoryAdapter implements UnifiedFileSystem {
  private files = new Map<string, { content: string | ArrayBuffer; mtime: number }>();
  private eventEmitter = new EventEmitter();

  async readFile(path: string): Promise<FileReadResult> {
    const file = this.files.get(path);

    if (!file) {
      throw new Error(`File not found: ${path}`);
    }

    return {
      content: file.content,
      mtime: file.mtime
    };
  }

  async writeFile(path: string, content: string | ArrayBuffer, options?: FileWriteOptions): Promise<void> {
    this.files.set(path, {
      content,
      mtime: Date.now()
    });

    if (options?.broadcastEvents !== false) {
      this.eventEmitter.emit('change', [{
        type: 'modified',
        path,
        timestamp: Date.now()
      }]);
    }
  }

  async listDirectory(path: string): Promise<FileSystemEntry[]> {
    const entries: FileSystemEntry[] = [];

    for (const [filePath, file] of this.files) {
      if (filePath.startsWith(path)) {
        const relativePath = filePath.slice(path.length + 1);
        const parts = relativePath.split('/');

        if (parts.length === 1) {
          entries.push({
            name: parts[0],
            path: filePath,
            type: 'file'
          });
        }
      }
    }

    return entries;
  }

  // ... other methods

  // No permission needed for in-memory
  async requestPermission(): Promise<boolean> { return true; }
  async hasPermission(): Promise<boolean> { return true; }
}
```

### 2.3 Implementation: Factory Pattern

**File**: `src/lib/workspace/fs/createFileSystem.ts`
```typescript
export async function createFileSystem(project: Project): Promise<UnifiedFileSystem> {
  // 1. Check if project has FSA handle
  if (project.fsaHandle) {
    // 2. Check if we have permission
    const hasPermission = await checkPermission(project.fsaHandle);

    if (hasPermission) {
      return new FSAAdapter(project.fsaHandle);
    } else {
      // Try to request permission
      const granted = await requestPermission(project.fsaHandle);

      if (granted) {
        return new FSAAdapter(project.fsaHandle);
      } else {
        // Fallback to in-memory with helpful message
        showInlineMessage('Using in-memory storage (no file system permission)');
        return new InMemoryAdapter();
      }
    }
  }

  // 3. Mobile or no handle - use in-memory
  if (isMobile() || !('showDirectoryPicker' in window)) {
    return new InMemoryAdapter();
  }

  // 4. Prompt user to mount folder
  showInlineMessage('Please select a project folder to mount');

  try {
    const handle = await window.showDirectoryPicker();
    await db.projects.update(project.id, { fsaHandle: handle });
    return new FSAAdapter(handle);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      showInlineMessage('Using in-memory storage (folder access denied)');
      return new InMemoryAdapter();
    } else {
      throw error;
    }
  }
}
```

### 2.4 Implementation: Note System Integration

**File**: `src/lib/workspace/notes/UnifiedNoteSystem.ts`
```typescript
export class UnifiedNoteSystem {
  constructor(
    private fs: UnifiedFileSystem,
    private projectId: string
  ) {}

  async listNotes(): Promise<Note[]> {
    // List all .md files
    const entries = await this.fs.listDirectory('/');

    const notes = await Promise.all(
      entries
        .filter(e => e.name.endsWith('.md'))
        .map(async entry => {
          const result = await this.fs.readFile(entry.path);
          return {
            id: entry.path,
            title: entry.name.replace('.md', ''),
            content: result.content.toString(),
            mtime: result.mtime
          };
        })
    );

    return notes;
  }

  async readNote(noteId: string): Promise<Note> {
    const result = await this.fs.readFile(noteId);

    return {
      id: noteId,
      title: noteId.split('/').pop()!.replace('.md', ''),
      content: result.content.toString(),
      mtime: result.mtime
    };
  }

  async writeNote(noteId: string, content: string): Promise<void> {
    // ✅ Bidirectional sync - write to file system
    await this.fs.writeFile(noteId, content, {
      broadcastEvents: true  // Notify other workspaces
    });
  }

  async createNote(title: string, content: string = ''): Promise<Note> {
    const noteId = `/${title}.md`;
    await this.writeNote(noteId, content);

    return {
      id: noteId,
      title,
      content,
      mtime: Date.now()
    };
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.fs.deleteFile(noteId);
  }

  watchNotes(callback: (changes: NoteChange[]) => void): () => void {
    return this.fs.watch((changes) => {
      const noteChanges = changes
        .filter(c => c.path.endsWith('.md'))
        .map(c => ({
          ...c,
          noteId: c.path
        }));

      if (noteChanges.length > 0) {
        callback(noteChanges);
      }
    });
  }
}
```

### 2.5 Migration Plan

**Step 1**: Create UnifiedFileSystem interface (1 hour)
**Step 2**: Implement FSAAdapter (3 hours)
**Step 3**: Implement InMemoryAdapter (2 hours)
**Step 4**: Implement createFileSystem factory (2 hours)
**Step 5**: Implement UnifiedNoteSystem (2 hours)
**Step 6**: Update Notes workspace to use unified system (3 hours)
**Step 7**: Update IDE workspace to use unified system (3 hours)
**Step 8**: Comprehensive testing (2 hours)

**Total Effort**: 18 hours

**Risk**: Data loss if file system operations fail
**Mitigation**: Backup existing Dexie data before migration, test all operations extensively

---

## 3. Cross-Workspace Event Bus

### 3.1 Architecture Design

**Goal**: Enable workspaces to react to changes in other workspaces.

**Event Schema**:
```typescript
// File: src/lib/events/WorkspaceEventBus.ts

interface WorkspaceEvent {
  type: EventType;
  projectId: string;
  timestamp: number;
  data: any;
}

type EventType =
  // File events
  | 'file:created'
  | 'file:modified'
  | 'file:deleted'

  // Agent events
  | 'agent:started'
  | 'agent:progress'
  | 'agent:completed'
  | 'agent:failed'

  // State events
  | 'state:changed'

  // Sync events
  | 'sync:started'
  | 'sync:progress'
  | 'sync:completed'
  | 'sync:failed';

interface EventListener {
  (event: WorkspaceEvent): void;
}

export class WorkspaceEventBus {
  private listeners = new Map<EventType, Set<EventListener>>();
  private eventHistory: WorkspaceEvent[] = [];
  private maxHistorySize = 100;

  // Subscribe to events
  on(eventType: EventType, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)!.delete(listener);
    };
  }

  // Emit event to all listeners
  emit(event: WorkspaceEvent): void {
    // Add to history
    this.eventHistory.push(event);

    // Trim history
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }

    // Log for debugging
    console.log(`[EventBus] ${event.type}`, event);
  }

  // Get event history (for replay/debugging)
  getHistory(filter?: { projectId?: string; type?: EventType }): WorkspaceEvent[] {
    let history = this.eventHistory;

    if (filter?.projectId) {
      history = history.filter(e => e.projectId === filter.projectId);
    }

    if (filter?.type) {
      history = history.filter(e => e.type === filter.type);
    }

    return history;
  }

  // Clear history
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Singleton instance
export const workspaceEventBus = new WorkspaceEventBus();
```

### 3.2 Implementation: File System Event Broadcasting

**File**: `src/lib/workspace/fs/adapters/FSAAdapter.ts` (updated)
```typescript
export class FSAAdapter implements UnifiedFileSystem {
  // ...

  async writeFile(path: string, content: string | ArrayBuffer, options?: FileWriteOptions): Promise<void> {
    await this.writeInternal(path, content);

    // ✅ Broadcast event to other workspaces
    if (options?.broadcastEvents !== false) {
      workspaceEventBus.emit({
        type: 'file:modified',
        projectId: this.projectId,
        timestamp: Date.now(),
        data: { path, size: content.byteLength }
      });
    }
  }

  async deleteFile(path: string): Promise<void> {
    await this.deleteInternal(path);

    // ✅ Broadcast event
    workspaceEventBus.emit({
      type: 'file:deleted',
      projectId: this.projectId,
      timestamp: Date.now(),
      data: { path }
    });
  }
}
```

### 3.3 Implementation: Workspace Event Subscriptions

**File**: `src/presentation/components/notes/NotesWorkspace.tsx` (updated)
```typescript
function NotesWorkspace({ project }: Props) {
  const noteSystem = new UnifiedNoteSystem(project.fs, project.id);

  useEffect(() => {
    // Subscribe to file change events
    const unsubscribe = workspaceEventBus.on('file:modified', (event) => {
      if (event.projectId !== project.id) return;

      // Check if the changed file is a note
      if (event.data.path.endsWith('.md')) {
        // Reload note
        noteSystem.readNote(event.data.path).then(note => {
          // Update UI
          updateNoteInUI(note);
        });
      }
    });

    return () => unsubscribe();
  }, [project.id]);

  // ...
}
```

### 3.4 Migration Plan

**Step 1**: Create WorkspaceEventBus (2 hours)
**Step 2**: Define event types and schema (1 hour)
**Step 3**: Update file system adapters to broadcast events (2 hours)
**Step 4**: Add event subscriptions in workspaces (3 hours)
**Step 5**: Test cross-workspace reactivity (2 hours)

**Total Effort**: 10 hours

**Risk**: Event loops (workspace A emits → workspace B reacts → emits again)
**Mitigation**: Add event deduplication, prevent self-handling

---

## 4. Mobile/Desktop Fallback Strategy

### 4.1 Feature Detection

**File**: `src/lib/detection/featureDetection.ts`
```typescript
export interface Features {
  // File System Access API
  fsa: boolean;
  showDirectoryPicker: boolean;
  showOpenFilePicker: boolean;
  showSaveFilePicker: boolean;

  // WebContainer
  webContainer: boolean;

  // Device type
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;

  // Platform
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
}

export function detectFeatures(): Features {
  const ua = navigator.userAgent;

  return {
    fsa: 'showDirectoryPicker' in window,
    showDirectoryPicker: 'showDirectoryPicker' in window,
    showOpenFilePicker: 'showOpenFilePicker' in window,
    showSaveFilePicker: 'showSaveFilePicker' in window,
    webContainer: 'WebContainer' in window,  // If loaded
    isMobile: /iPhone|iPad|iPod|Android/i.test(ua),
    isDesktop: !/iPhone|iPad|iPod|Android/i.test(ua),
    isTablet: /iPad|Android/i.test(ua) && window.innerWidth >= 768,
    platform: detectPlatform(ua)
  };
}

function detectPlatform(ua: string): Features['platform'] {
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  return 'unknown';
}
```

### 4.2 Graceful Degradation Component

**File**: `src/presentation/components/common/FeatureFallback.tsx`
```typescript
interface FeatureFallbackProps {
  feature: keyof Features;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureFallback({ feature, fallback, children }: FeatureFallbackProps) {
  const features = useFeatures();

  if (!features[feature]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage:
<FeatureFallback
  feature="showDirectoryPicker"
  fallback={
    <div>
      <p>Folder mounting is not available on this device.</p>
      <button onClick={useInMemoryMode}>Use In-Memory Storage</button>
    </div>
  }
>
  <button onClick={mountFolder}>Mount Folder</button>
</FeatureFallback>
```

### 4.3 Inline Message Component

**File**: `src/presentation/components/common/InlineMessage.tsx`
```typescript
type Variant = 'info' | 'warning' | 'error' | 'success';

interface InlineMessageProps {
  variant?: Variant;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export function InlineMessage({
  variant = 'info',
  message,
  action,
  dismissible = true
}: InlineMessageProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`inline-message inline-message--${variant}`}>
      <Icon name={getIcon(variant)} />
      <p>{message}</p>

      {action && (
        <button onClick={action.onClick} className="inline-message__action">
          {action.label}
        </button>
      )}

      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="inline-message__dismiss"
        >
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}

// Usage:
showInlineMessage('Folder access needed for full functionality', {
  action: { label: 'Grant Permission', onClick: requestPermission }
});
```

### 4.4 Implementation: HubHomePage with Fallbacks

**File**: `src/presentation/components/hub/HubHomePage.tsx` (updated)
```typescript
function HubHomePage() {
  const features = useFeatures();
  const navigate = useNavigate();

  const handleMountFolder = async () => {
    // ✅ Feature detection
    if (!features.showDirectoryPicker) {
      showInlineMessage(
        'Folder mounting is not available on this device. Using Alpha Storage instead.',
        { variant: 'info' }
      );

      // Fallback to Alpha Storage (in-memory)
      const project = await createProjectWithAlphaStorage();
      navigate({ to: '/ide/$projectId', params: { projectId: project.id } });
      return;
    }

    // ✅ Try with error handling
    try {
      const handle = await window.showDirectoryPicker();
      const project = await createProjectWithFSA(handle);
      navigate({ to: '/ide/$projectId', params: { projectId: project.id } });
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        showInlineMessage(
          'Folder access was denied. Using Alpha Storage instead (changes will not persist).',
          { variant: 'warning' }
        );

        const project = await createProjectWithAlphaStorage();
        navigate({ to: '/ide/$projectId', params: { projectId: project.id } });
      } else if (error.name === 'NotFoundError') {
        showInlineMessage('Folder not found. Please select a different folder.', { variant: 'error' });
      } else {
        showInlineMessage('An unexpected error occurred. Please try again.', { variant: 'error' });
      }
    }
  };

  return (
    <div>
      <h1>Welcome to Project Alpha</h1>
      <p>Select a workspace to begin</p>

      <div className="workspace-cards">
        <WorkspaceCard
          title="IDE"
          description="Intelligent development environment"
          onClick={() => navigate({ to: '/picker', search: { from: 'ide' } })}
        />

        <WorkspaceCard
          title="Notes"
          description="Enhanced note-taking with AI"
          onClick={() => navigate({ to: '/picker', search: { from: 'notes' } })}
        />

        <WorkspaceCard
          title="Knowledge"
          description="RAG-powered knowledge synthesis"
          onClick={() => navigate({ to: '/picker', search: { from: 'knowledge' } })}
        />
      </div>

      <div className="project-actions">
        <button onClick={handleMountFolder}>
          Mount Project Folder
        </button>

        <button onClick={createNewProject}>
          Create New Project
        </button>
      </div>

      {/* Features display */}
      <FeaturesDisplay features={features} />
    </div>
  );
}
```

### 4.5 Migration Plan

**Step 1**: Create feature detection utilities (1 hour)
**Step 2**: Create InlineMessage component (1 hour)
**Step 3**: Create FeatureFallback component (1 hour)
**Step 4**: Update HubHomePage with fallbacks (2 hours)
**Step 5**: Test on mobile devices (2 hours)

**Total Effort**: 7 hours

**Risk**: None (defensive programming, adds fallbacks)

---

## 5. Project Context System

### 5.1 Architecture Design

**Goal**: Single source of truth for project context across all workspaces.

**Interface**:
```typescript
// File: src/lib/workspace/context/ProjectContext.tsx

interface ProjectContextValue {
  project: Project;
  fs: UnifiedFileSystem;
  noteSystem: UnifiedNoteSystem;
  features: Features;

  // Actions
  updateProject: (updates: Partial<Project>) => Promise<void>;
  closeProject: () => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }

  return context;
}

export function ProjectProvider({ children, projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [fs, setFs] = useState<UnifiedFileSystem | null>(null);
  const [noteSystem, setNoteSystem] = useState<UnifiedNoteSystem | null>(null);
  const features = useFeatures();

  // Load project on mount
  useEffect(() => {
    async function loadProject() {
      const p = await getProject(projectId);

      if (!p) {
        // Project doesn't exist, redirect to picker
        navigate({ to: '/picker' });
        return;
      }

      setProject(p);

      // Create file system
      const fileSystem = await createFileSystem(p);
      setFs(fileSystem);

      // Create note system
      const notes = new UnifiedNoteSystem(fileSystem, p.id);
      setNoteSystem(notes);
    }

    loadProject();
  }, [projectId]);

  // Update project in store
  useEffect(() => {
    if (project) {
      useProjectStore.getState().setCurrentProject(projectId);
    }
  }, [project?.id]);

  if (!project || !fs || !noteSystem) {
    return <LoadingSpinner />;
  }

  const value: ProjectContextValue = {
    project,
    fs,
    noteSystem,
    features,

    updateProject: async (updates) => {
      const updated = await db.projects.update(projectId, updates);
      setProject({ ...project, ...updates, ...updated });
    },

    closeProject: async () => {
      await fs.close();
      navigate({ to: '/picker' });
    }
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
```

### 5.2 Implementation: Workspace Route with Provider

**File**: `src/routes/notes.$projectId.tsx` (updated)
```typescript
export const Route = createFileRoute('/notes/$projectId')({
  component: NotesWorkspaceRoute,
})

function NotesWorkspaceRoute() {
  const { projectId } = Route.useParams();

  return (
    <ProjectProvider projectId={projectId}>
      <NotesWorkspace />
    </ProjectProvider>
  );
}
```

### 5.3 Implementation: Workspace Component with Context

**File**: `src/presentation/components/notes/NotesWorkspace.tsx` (updated)
```typescript
function NotesWorkspace() {
  const { project, fs, noteSystem, features } = useProjectContext();

  // All workspace logic uses context
  const notes = useLiveQuery(() => noteSystem.listNotes());

  const handleEditNote = async (noteId: string, content: string) => {
    await noteSystem.writeNote(noteId, content);
    // ✅ Automatically broadcasts event to other workspaces
  };

  return (
    <div>
      <h1>{project.name}</h1>
      <NotesList notes={notes} onEdit={handleEditNote} />
    </div>
  );
}
```

### 5.4 Migration Plan

**Step 1**: Create ProjectContext (2 hours)
**Step 2**: Update workspace routes to use Provider (2 hours)
**Step 3**: Update workspace components to use context (3 hours)
**Step 4**: Remove manual store manipulation (1 hour)
**Step 5**: Test all workspace flows (2 hours)

**Total Effort**: 10 hours

**Risk**: Breaking components that expect direct store access
**Mitigation: Migrate incrementally, keep backward compatibility temporarily**

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Critical Path) - 24 hours

**Week 1, Days 1-3**
1. ✅ Strict route parameterization (7 hours)
2. ✅ Mobile/desktop fallback strategy (7 hours)
3. ✅ Project context system (10 hours)

**Success Criteria**:
- All workspace routes have `$projectId` parameter
- Mobile users can use app without crashes
- Project context available in all workspaces

### Phase 2: File System Unification - 18 hours

**Week 1, Days 4-5**
1. ✅ Unified file system abstraction (10 hours)
2. ✅ Unified note system integration (8 hours)

**Success Criteria**:
- Single source of truth for file operations
- Notes are files in the project
- Bidirectional sync working

### Phase 3: Cross-Workspace Reactivity - 10 hours

**Week 2, Day 1**
1. ✅ Cross-workspace event bus (10 hours)

**Success Criteria**:
- File changes broadcast to all workspaces
- Workspaces react to changes in real-time
- No event loops or race conditions

### Phase 4: Testing & Validation - 8 hours

**Week 2, Day 2**
1. ✅ Comprehensive testing (8 hours)

**Success Criteria**:
- All workspace flows tested
- Cross-workspace reactivity verified
- Mobile/desktop compatibility confirmed

### Phase 5: Documentation & Cleanup - 10 hours

**Week 2, Days 3-4**
1. ✅ Update AGENTS.md (2 hours)
2. ✅ Create migration guide (2 hours)
3. ✅ Update CLAUDE.md (1 hour)
4. ✅ Create epic and stories (5 hours)

**Success Criteria**:
- Documentation up to date
- Migration guide available
- Epic ready for sprint execution

---

## 7. Risk Mitigation

### 7.1 Data Loss Prevention

**Risk**: Migrating to unified file system could lose data

**Mitigation**:
```typescript
// Before migration: Backup Dexie
async function backupDexie() {
  const allData = await db.export();
  const blob = new Blob([JSON.stringify(allData)], { type: 'application/json' });

  // Download backup
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dexie-backup-${Date.now()}.json`;
  a.click();
}

// After migration: Verify data integrity
async function verifyMigration(projectId: string) {
  const fs = await createFileSystem(await getProject(projectId));
  const dexieFiles = await db.notes.where('projectId').equals(projectId).toArray();

  for (const note of dexieFiles) {
    const exists = await fs.exists(note.filePath);
    if (!exists) {
      console.warn(`Missing file after migration: ${note.filePath}`);
      // Restore from backup
    }
  }
}
```

### 7.2 Breaking Changes

**Risk**: Route changes break existing bookmarks/shared links

**Mitigation**:
```typescript
// Add redirect handlers for old routes
export const Route = createFileRoute('/workspace/$projectId')({
  beforeLoad: async ({ params }) => {
    // Redirect old route to new route
    throw redirect({
      to: '/ide/$projectId',
      params: { projectId: params.projectId }
    });
  }
});
```

### 7.3 Performance Regression

**Risk**: Event broadcasting causes performance issues

**Mitigation**:
```typescript
// Debounce rapid file changes
class DebouncedEventBus extends WorkspaceEventBus {
  private debounceTimers = new Map<EventType, NodeJS.Timeout>();

  emit(event: WorkspaceEvent): void {
    const existingTimer = this.debounceTimers.get(event.type);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      super.emit(event);
      this.debounceTimers.delete(event.type);
    }, 100);  // 100ms debounce

    this.debounceTimers.set(event.type, timer);
  }
}
```

### 7.4 State Hydration Issues

**Risk**: New route loaders cause hydration flash

**Mitigation**:
```typescript
// Use TanStack Router's loader with proper serialization
export const Route = createFileRoute('/notes/$projectId')({
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);

    // Return serializable data
    return {
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }
    };
  },

  // Deserialize on client
  dehydrate: (data) => ({
    ...data,
    project: {
      ...data.project,
      createdAt: new Date(data.project.createdAt),
      updatedAt: new Date(data.project.updatedAt),
    }
  })
});
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**File System Abstraction**:
```typescript
describe('UnifiedFileSystem', () => {
  it('should read and write files', async () => {
    const fs = new InMemoryAdapter();

    await fs.writeFile('/test.txt', 'Hello, World!');
    const result = await fs.readFile('/test.txt');

    expect(result.content).toBe('Hello, World!');
  });

  it('should broadcast events on write', async () => {
    const fs = new InMemoryAdapter();
    const callback = jest.fn();

    fs.watch(callback);
    await fs.writeFile('/test.txt', 'content');

    expect(callback).toHaveBeenCalledWith([
      { type: 'modified', path: '/test.txt', timestamp: expect.any(Number) }
    ]);
  });
});
```

### 8.2 Integration Tests

**Cross-Workspace Reactivity**:
```typescript
describe('Cross-Workspace Reactivity', () => {
  it('should broadcast file changes to workspaces', async () => {
    const fs = await createFileSystem(mockProject);
    const notesWorkspace = render(<NotesWorkspace project={mockProject} />);
    const ideWorkspace = render (<IDEWorkspace project={mockProject} />);

    // Edit note in Notes workspace
    await act(async () => {
      await notesWorkspace.findByTestId('note-editor').setValue('New content');
      await notesWorkspace.findByText('Save').click();
    });

    // IDE workspace should see the change
    await waitFor(() => {
      expect(ideWorkspace.getByText('New content')).toBeInTheDocument();
    });
  });
});
```

### 8.3 E2E Tests

**Mobile Fallback**:
```typescript
describe('Mobile Fallback', () => {
  it('should use in-memory storage on mobile', async () => {
    // Simulate mobile device
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'iPhone' }
    });

    render(<HubHomePage />);

    // Should show in-memory option, not FSA option
    expect(screen.getByText('Use In-Memory Storage')).toBeInTheDocument();
    expect(screen.queryByText('Mount Folder')).not.toBeInTheDocument();
  });
});
```

---

## 9. Success Criteria

### 9.1 Functional Requirements

- ✅ All workspace routes require `$projectId` parameter
- ✅ Routes without `$projectId` redirect to picker
- ✅ Mobile users can use app without crashes
- ✅ File changes broadcast to all workspaces
- ✅ Notes are files in the project (bidirectional sync)
- ✅ Project context available in all workspaces
- ✅ Graceful degradation for unsupported features

### 9.2 Non-Functional Requirements

- ✅ Page refresh preserves state
- ✅ Workspace switching preserves state
- ✅ No data loss during migration
- ✅ Performance no worse than current state
- ✅ TypeScript compiles without errors
- ✅ All tests pass

### 9.3 User Experience Requirements

- ✅ Clear project context in URL
- ✅ No folder selector loops
- ✅ Helpful error messages
- ✅ Progressive enhancement (better experience with features)
- ✅ Mobile-friendly UI

---

## 10. Conclusion

This Option B Architecture Design provides a complete, implementation-ready specification for the architectural redesign. It addresses all critical gaps identified in the Current State Assessment and aligns the implementation with the architectural vision.

**Key Points**:
1. Strict route parameterization makes project context first-class
2. Unified file system creates single source of truth
3. Cross-workspace event bus enables reactivity
4. Mobile/desktop fallback ensures graceful degradation
5. Project context system coordinates state across workspaces

**Estimated Effort**: 80 hours (2 weeks)
**Risk Level**: Medium (mitigated with careful planning)
**Impact**: Critical (achieves multi-workspace vision)

**Next Step**: Phase 4 - Implementation Roadmap (Epic and Story breakdown)

---

**Status**: Design complete, ready for implementation
**Approval**: Required from user before starting implementation
