---
date: 2025-12-31
time: 11:30:00+07:00
phase: technical-specification
team: Team-A | Team-B
agent_mode: bmad-bmm-architect
epic: EPIC-38
status: COMPLETE
---

# Technical Specification: EPIC-38 Project Management System Restoration

## Document Information

| Property | Value |
|----------|-------|
| **Epic** | EPIC-38 - Project Management System Restoration |
| **Classification** | Core Infrastructure Enhancement |
| **Priority** | P0 |
| **Estimated Duration** | 3-4 weeks |
| **Version** | 1.0 |
| **Created** | 2025-12-31T11:30:00+07:00 |
| **Stories** | 38-1 through 38-12 |

---

## 1. Executive Summary

### 1.1 Overview

EPIC-38 addresses the comprehensive restoration and enhancement of the synchronization infrastructure in Via-gent. The system facilitates bidirectional data flow between the central hub/workspace and user-local file systems. This epic addresses widespread disruption affecting both backend services and frontend user interfaces, implementing missing reverse sync capabilities and UI integration for sync status.

### 1.2 Problem Statement

The current architecture has a critical unidirectional sync limitation:
- **Local → WebContainer**: Working (files sync from local to sandbox)
- **WebContainer → Local**: Missing (no reverse propagation)

This asymmetry causes data inconsistency when:
- Terminal operations modify files in WebContainer
- `npm install` or build processes generate artifacts
- Agent tools create or modify files programmatically

### 1.3 Solution Approach

Implement a bidirectional sync infrastructure with:
1. **Reverse Sync Infrastructure** (Story 38-1): File watcher + conflict resolution
2. **Sync Event Bus** (Story 38-11): Decoupled communication layer
3. **Frontend Integration**: File tree, properties panel, sync status UI
4. **State Management Cleanup** (Story 38-10): Remove duplicate state issues

### 1.4 Success Criteria

- Bidirectional file sync working in both directions
- Conflict detection and resolution deterministic
- UI components reflect real-time sync state
- Performance: Sync operations < 500ms for files < 1MB
- Test coverage: ≥90% for infrastructure, ≥85% for UI

---

## 2. Architecture Overview

### 2.1 Current State Analysis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT ARCHITECTURE (LIMITED)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Local FS (FSA) ──────► LocalFSAdapter ──────► SyncManager ──► WebContainer│
│        ▲                                                                      │
│        │                                                                      │
│   IndexedDB                                                                │
│   (ProjectStore)                                                           │
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│   PROBLEM: No reverse sync (WebContainer → Local)                          │
│   ══════════════════════════════════════════════════════════════════════   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Current Infrastructure Status:**
- LocalFSAdapter (`src/lib/filesystem/local-fs-adapter.ts`) - Operational
- SyncManager (`src/lib/filesystem/sync-manager.ts`) - Operational (one direction)
- FSA Permissions (`src/lib/filesystem/permission-lifecycle.ts`) - Operational
- Dexie Schema v9 (`src/lib/state/dexie-db.ts`) - Operational
- FileMetadataCache (`src/lib/filesystem/file-metadata-cache.ts`) - Operational

### 2.2 Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROPOSED ARCHITECTURE (BIDIRECTIONAL)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Local FS (FSA) ◄──────► LocalFSAdapter ◄──────► SyncManager ◄──► WebContainer
│        ▲                              ▲                    ▲           │
│        │                              │                    │           │
│   IndexedDB                    Sync Event Bus             │           │
│   (ProjectStore)               (NEW - Story 38-11)       │           │
│                                                         │           │
│   FileMetadataCache            ◄─────────────────────────┘           │
│   (enhanced)                   Reverse Watcher                        │
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│   NEW: Reverse sync with conflict resolution and event-driven updates     │
│   ══════════════════════════════════════════════════════════════════════   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Architecture Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| ReverseSyncManager | `src/lib/filesystem/reverse-sync-manager.ts` | WebContainer → Local propagation |
| SyncEventBus | `src/lib/events/sync-event-bus.ts` | Decoupled event communication |
| ConflictResolver | `src/lib/filesystem/conflict-resolver.ts` | Deterministic conflict resolution |
| SyncStatusStore | `src/lib/state/sync-status-store.ts` | Real-time sync state |
| FileTreeSync | `src/components/ide/file-tree/file-tree-sync.tsx` | UI integration |

---

## 3. Story Specifications

### 3.1 Story 38-1: Reverse Sync Infrastructure

**Priority:** P0 | **Effort:** 3 days | **Team:** Team B

#### 3.1.1 Description

Implement the missing WebContainer → Local file propagation mechanism with file watching, change detection, and conflict resolution.

#### 3.1.2 Technical Implementation

**Interface Definitions:**

```typescript
// src/lib/filesystem/reverse-sync-manager.ts

interface ReverseSyncConfig {
  pollIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  excludedPatterns: string[];
  conflictResolution: 'local-wins' | 'remote-wins' | 'merge' | 'ask-user';
}

interface FileChangeEvent {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: number;
  content?: Uint8Array;
  checksum: string;
}

interface SyncConflict {
  localPath: string;
  remotePath: string;
  localChecksum: string;
  remoteChecksum: string;
  localModified: number;
  remoteModified: number;
  resolution?: 'local-wins' | 'remote-wins' | 'merged';
}

interface ReverseSyncResult {
  success: boolean;
  changesApplied: number;
  conflicts: SyncConflict[];
  errors: Error[];
  duration: number;
}

class ReverseSyncManager {
  private config: ReverseSyncConfig;
  private webcontainer: WebContainer | null = null;
  private localHandle: FileSystemDirectoryHandle | null = null;
  private watcherInterval: ReturnType<typeof setInterval> | null = null;
  private lastKnownState: Map<string, string> = new Map();
  private eventBus: SyncEventBus;

  constructor(config: ReverseSyncConfig, eventBus: SyncEventBus) {
    this.config = config;
    this.eventBus = eventBus;
  }

  async initialize(
    webcontainer: WebContainer,
    localHandle: FileSystemDirectoryHandle
  ): Promise<void>;

  async start(): Promise<void>;

  async stop(): Promise<void>;

  async syncOnce(): Promise<ReverseSyncResult>;

  async handleFileChange(event: FileChangeEvent): Promise<void>;

  private async detectConflicts(
    localChanges: FileChangeEvent[],
    remoteState: Map<string, string>
  ): Promise<SyncConflict[]>;

  private async resolveConflict(conflict: SyncConflict): Promise<void>;

  private async applyChanges(changes: FileChangeEvent[]): Promise<void>;
}
```

**Conflict Resolution Algorithm:**

```typescript
// src/lib/filesystem/conflict-resolver.ts

interface ConflictResolutionStrategy {
  name: string;
  resolve(conflict: SyncConflict): Promise<ConflictResolutionResult>;
}

class ConflictResolver {
  private strategies: Map<string, ConflictResolutionStrategy>;

  async resolve(conflict: SyncConflict): Promise<ConflictResolutionResult> {
    switch (conflict.resolution) {
      case 'local-wins':
        return this.localWins(conflict);
      case 'remote-wins':
        return this.remoteWins(conflict);
      case 'merge':
        return this.merge(conflict);
      case 'ask-user':
        return this.queueForUser(conflict);
      default:
        return this.autoDetect(conflict);
    }
  }

  private async autoDetect(conflict: SyncConflict): Promise<ConflictResolutionResult> {
    // Deterministic: newer timestamp wins
    if (conflict.localModified > conflict.remoteModified) {
      return this.localWins(conflict);
    } else if (conflict.remoteModified > conflict.localModified) {
      return this.remoteWins(conflict);
    }
    // Same timestamp: content hash determines winner
    if (conflict.localChecksum === conflict.remoteChecksum) {
      return { resolved: true, action: 'skip' };
    }
    // Different content, same timestamp: merge (3-way merge not supported, ask user)
    return this.queueForUser(conflict);
  }

  private async localWins(conflict: SyncConflict): Promise<ConflictResolutionResult> {
    // Push local content to remote
    return { resolved: true, action: 'local-to-remote' };
  }

  private async remoteWins(conflict: SyncConflict): Promise<ConflictResolutionResult> {
    // Pull remote content to local
    return { resolved: true, action: 'remote-to-local' };
  }

  private async merge(conflict: SyncConflict): Promise<ConflictResolutionResult> {
    // Text-based 3-way merge for supported file types
    // Binary files cannot be merged - ask user
    return { resolved: true, action: 'merged' };
  }

  private async queueForUser(conflict: SyncConflict): Promise<ConflictResolutionResult> {
    // Emit conflict event for UI to present resolution dialog
    return { resolved: false, action: 'user-intervention-required' };
  }
}
```

#### 3.1.3 Component Architecture

```
ReverseSyncManager
├── FileWatcher (WebContainer fs.watch + polling fallback)
├── ChangeDetector (checksum comparison)
├── ConflictResolver (deterministic resolution)
├── ChangeApplicator (local FS write operations)
└── SyncEventBus Integration
```

#### 3.1.4 Integration Points

| Dependency | Integration Type | Purpose |
|------------|-----------------|---------|
| WebContainer API | Direct | File watching, read operations |
| LocalFSAdapter | Direct | write_to_file operations to local FS |
| SyncEventBus | Publish/Subscribe | Notify UI of sync events |
| Dexie DB | Persistence | Store sync metadata, conflict history |

#### 3.1.5 Testing Strategy

**Unit Tests Pattern:**

```typescript
// __tests__/reverse-sync-manager.test.ts

describe('ReverseSyncManager', () => {
  describe('syncOnce', () => {
    it('should detect and apply file modifications from WebContainer', async () => {
      // Mock WebContainer with file changes
      // Verify local FS receives changes
    });

    it('should detect and handle file deletions', async () => {
      // Mock deleted file scenario
      // Verify local file is deleted
    });

    it('should detect and resolve conflicts using auto-detect strategy', async () => {
      // Mock conflicting changes
      // Verify deterministic resolution
    });

    it('should respect excluded patterns', async () => {
      // Mock changes to node_modules/.git
      // Verify excluded patterns are skipped
    });
  });

  describe('conflict resolution', () => {
    it('should resolve newer-timestamp conflicts automatically', async () => {
      // Test deterministic behavior
    });

    it('should queue user intervention for unresolvable conflicts', async () => {
      // Test user queue emission
    });
  });
});
```

---

### 3.2 Story 38-2: Project Initialization Workflow

**Priority:** P0 | **Effort:** 2 days | **Team:** Team A

#### 3.2.1 Description

Implement the complete project initialization flow: directory picker, permission request, sync session setup, and error handling for permission denial scenarios.

#### 3.2.2 Technical Implementation

**Interface Definitions:**

```typescript
// src/lib/workspace/project-initializer.ts

interface ProjectInitializationConfig {
  directoryPickerOptions?: DirectoryPickerOptions;
  permissionRequestOptions?: PermissionRequestOptions;
  autoSync: boolean;
  syncOnInit: boolean;
}

interface InitializationStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: Error;
}

interface InitializationProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: InitializationStep;
  percentComplete: number;
}

interface InitializationResult {
  success: boolean;
  projectId: string;
  projectPath: string;
  workspaceHandle: FileSystemDirectoryHandle;
  syncSessionId: string;
  errors: Error[];
  duration: number;
}

interface PermissionState {
  granted: boolean;
  persisted: boolean;
  expiresAt?: number;
  requestNeeded: boolean;
}

class ProjectInitializer {
  private config: ProjectInitializationConfig;
  private permissionManager: PermissionLifecycleManager;

  async initialize(): Promise<InitializationResult>;

  async selectDirectory(): Promise<FileSystemDirectoryHandle>;

  async requestPermissions(
    handle: FileSystemDirectoryHandle
  ): Promise<PermissionState>;

  async setupSyncSession(
    handle: FileSystemDirectoryHandle
  ): Promise<string>;

  async validateProject(handle: FileSystemDirectoryHandle): Promise<boolean>;

  async cleanupOnFailure(projectId: string): Promise<void>;
}
```

**Initialization Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROJECT INITIALIZATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────┐                                                         │
│   │ Select Dir    │◄─── user click "Open Project"                          │
│   └───────┬───────┘                                                         │
│           │ showDirectoryPicker()                                           │
│           ▼                                                                 │
│   ┌───────────────┐     ┌─────────────────┐                                │
│   │ Handle        │────►│ Validate        │──OK──► Next                    │
│   │ Selected      │     │ Not Empty       │──FAIL──► Show Error            │
│   └───────┬───────┘     └─────────────────┘                                │
│           │                                                                  │
│           ▼                                                                  │
│   ┌───────────────┐     ┌─────────────────┐                                │
│   │ Request       │────►│ FSA Permissions │──Granted──► Next               │
│   │ Permissions   │     │ Request         │──Denied──► Show Retry Dialog    │
│   └───────┬───────┘     └─────────────────┘                                │
│           │                                                                  │
│           │ persistPermission()                                             │
│           ▼                                                                  │
│   ┌───────────────┐     ┌─────────────────┐                                │
│   │ Initialize    │────►│ Sync Session    │──Success──► Next               │
│   │ Workspace     │     │ Setup           │──Fail──► Cleanup                │
│   └───────┬───────┘     └─────────────────┘                                │
│           │                                                                  │
│           ▼                                                                  │
│   ┌───────────────┐     ┌─────────────────┐                                │
│   │ Initial       │────►│ Dexie Schema    │──OK──► Complete                │
│   │ Sync          │     │ Creation        │──FAIL──► Repair                │
│   └───────────────┘     └─────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.2.3 Component Specifications

**ProjectInitDialog Component:**

```tsx
// src/components/workspace/ProjectInitDialog.tsx

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ProjectInitDialogProps {
  isOpen: boolean;
  onComplete: (result: InitializationResult) => void;
  onCancel: () => void;
}

export function ProjectInitDialog({
  isOpen,
  onComplete,
  onCancel
}: ProjectInitDialogProps): JSX.Element {
  const { t } = useTranslation();
  const [step, setStep] = useState<InitializationStep>('select-directory');
  const [progress, setProgress] = useState<InitializationProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleSelectDirectory = useCallback(async () => {
    try {
      setStep({ id: 'select-directory', name: t('project.init.selecting'), status: 'in-progress' });
      const handle = await window.showDirectoryPicker();
      setStep({ id: 'validate', name: t('project.init.validating'), status: 'completed' });
      await requestPermissions(handle);
    } catch (err) {
      setError(err as Error);
      setStep({ id: 'select-directory', name: t('project.init.selecting'), status: 'failed', error: err as Error });
    }
  }, [t]);

  const handleRetry = useCallback(async () => {
    setError(null);
    await handleSelectDirectory();
  }, [handleSelectDirectory]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('project.init.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress Steps */}
          {progress && (
            <ProgressSteps steps={progress.currentStep} />
          )}
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>{t('project.init.error')}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSelectDirectory}>
              {t('project.init.selectDir')}
            </Button>
            {error && (
              <Button variant="secondary" onClick={handleRetry}>
                {t('common.retry')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 3.3 Story 38-3: Space Management Service

**Priority:** P1 | **Effort:** 2 days | **Team:** Team B

#### 3.3.1 Description

Implement disk space management and quota enforcement for project storage, preventing sync failures due to insufficient space.

#### 3.3.2 Technical Implementation

**Interface Definitions:**

```typescript
// src/lib/workspace/space-manager.ts

interface SpaceInfo {
  totalBytes: number;
  availableBytes: number;
  usedBytes: number;
  percentUsed: number;
}

interface SpaceQuota {
  maxBytes: number;
  warningThreshold: number;
  criticalThreshold: number;
  currentUsage: number;
}

interface SpaceWarning {
  level: 'warning' | 'critical';
  message: string;
  availableBytes: number;
  thresholdBytes: number;
}

interface SpaceManagementResult {
  canProceed: boolean;
  warnings: SpaceWarning[];
  suggestedActions: string[];
}

class SpaceManager {
  private quota: SpaceQuota;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private warningCallbacks: Set<(warning: SpaceWarning) => void> = new Set();

  async getSpaceInfo(projectPath: string): Promise<SpaceInfo>;

  async checkOperation(operationBytes: number): Promise<SpaceManagementResult>;

  async setQuota(quota: SpaceQuota): Promise<void>;

  async getQuota(): Promise<SpaceQuota>;

  subscribeToWarnings(callback: (warning: SpaceWarning) => void): () => void;

  async startMonitoring(projectPath: string): Promise<void>;

  async stopMonitoring(): Promise<void>;
}
```

---

### 3.4 Story 38-4: Terminal Sync Integration

**Priority:** P1 | **Effort:** 1 day | **Team:** Team B

#### 3.4.1 Description

Ensure terminal operations that modify files in WebContainer are synced back to local filesystem.

#### 3.4.2 Technical Implementation

**Terminal Sync Hook:**

```typescript
// src/lib/webcontainer/terminal-sync-adapter.ts

interface TerminalSyncConfig {
  autoSync: boolean;
  syncDelay: number;
  excludePatterns: string[];
}

class TerminalSyncAdapter {
  private reverseSync: ReverseSyncManager;
  private config: TerminalSyncConfig;
  private lastSyncTime: number = 0;
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(reverseSync: ReverseSyncManager, config: TerminalSyncConfig) {
    this.reverseSync = reverseSync;
    this.config = config;
  }

  async onTerminalExit(code: number): Promise<void> {
    if (code === 0 && this.config.autoSync) {
      await this.scheduleSync();
    }
  }

  async onFileModification(path: string): Promise<void> {
    if (this.config.autoSync) {
      await this.scheduleSync();
    }
  }

  private async scheduleSync(): Promise<void> {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(async () => {
      try {
        await this.reverseSync.syncOnce();
        this.lastSyncTime = Date.now();
      } catch (error) {
        console.error('Terminal sync failed:', error);
      }
    }, this.config.syncDelay);
  }
}
```

---

### 3.5 Story 38-5: Editor Auto-Save Integration

**Priority:** P1 | **Effort:** 2 days | **Team:** Team A

#### 3.5.1 Description

Integrate Monaco Editor auto-save with the sync system to ensure editor changes propagate to local filesystem and trigger reverse sync when needed.

#### 3.5.2 Technical Implementation

**Editor Auto-Save Hook:**

```typescript
// src/lib/editor/auto-save-manager.ts

interface AutoSaveConfig {
  enabled: boolean;
  delay: number;
  triggers: ('change' | 'focus-lost' | 'manual')[];
  syncAfterSave: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: number | null;
  pendingChanges: boolean;
}

class EditorAutoSaveManager {
  private config: AutoSaveConfig;
  private state: AutoSaveState;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private localFSAdapter: LocalFSAdapter;
  private reverseSync: ReverseSyncManager | null = null;

  constructor(config: AutoSaveConfig, localFSAdapter: LocalFSAdapter) {
    this.config = config;
    this.state = { isSaving: false, lastSaved: null, pendingChanges: false };
    this.localFSAdapter = localFSAdapter;
  }

  setReverseSync(reverseSync: ReverseSyncManager): void {
    this.reverseSync = reverseSync;
  }

  async onEditorChange(model: editor.ITextModel, content: string): Promise<void> {
    if (!this.config.enabled) return;
    
    this.state.pendingChanges = true;
    this.scheduleSave(model.uri.path, content);
  }

  async onEditorBlur(model: editor.ITextModel): Promise<void> {
    if (this.config.triggers.includes('focus-lost') && this.state.pendingChanges) {
      await this.flushPendingSaves();
    }
  }

  async manualSave(model: editor.ITextModel): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    await this.saveImmediately(model.uri.path, model.getValue());
  }

  private scheduleSave(path: string, content: string): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      await this.saveImmediately(path, content);
    }, this.config.delay);
  }

  private async saveImmediately(path: string, content: string): Promise<void> {
    this.state.isSaving = true;
    try {
      await this.localFSAdapter.writeFile(path, content);
      this.state.lastSaved = Date.now();
      this.state.pendingChanges = false;

      if (this.config.syncAfterSave && this.reverseSync) {
        await this.reverseSync.syncOnce();
      }
    } finally {
      this.state.isSaving = false;
    }
  }

  private async flushPendingSaves(): Promise<void> {
    // Force immediate save of all pending changes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}
```

---

### 3.6 Story 38-6: Sync Status UI Components

**Priority:** P0 | **Effort:** 2 days | **Team:** Team A

#### 3.6.1 Description

Create UI components to display real-time sync status: sync indicator, progress bar, conflict notification, and error display.

#### 3.6.2 Component Specifications

**SyncStatusIndicator Component:**

```tsx
// src/components/sync/sync-status-indicator.tsx

import { useSyncStatusStore } from '@/lib/state/sync-status-store';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type SyncStatus = 'idle' | 'syncing' | 'conflict' | 'error' | 'offline';

export function SyncStatusIndicator(): JSX.Element {
  const { t } = useTranslation();
  const { status, progress, lastSyncTime, error } = useSyncStatusStore();

  const statusConfig = {
    idle: { icon: CheckCircleIcon, color: 'text-success', label: 'sync.status.idle' },
    syncing: { icon: RefreshIcon, color: 'text-primary animate-spin', label: 'sync.status.syncing' },
    conflict: { icon: AlertTriangleIcon, color: 'text-warning', label: 'sync.status.conflict' },
    error: { icon: XCircleIcon, color: 'text-destructive', label: 'sync.status.error' },
    offline: { icon: WifiOffIcon, color: 'text-muted', label: 'sync.status.offline' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', config.color)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{t(config.label)}</span>
      
      {status === 'syncing' && progress !== undefined && (
        <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {lastSyncTime && (
        <span className="text-xs text-muted">
          {formatRelativeTime(lastSyncTime)}
        </span>
      )}
      
      {error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <InfoIcon className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error.message}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
```

**SyncConflictDialog Component:**

```tsx
// src/components/sync/sync-conflict-dialog.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SyncConflictDialogProps {
  conflict: SyncConflict;
  onResolve: (resolution: 'local-wins' | 'remote-wins' | 'merge') => void;
  onDismiss: () => void;
}

export function SyncConflictDialog({
  conflict,
  onResolve,
  onDismiss
}: SyncConflictDialogProps): JSX.Element {
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<'local-wins' | 'remote-wins' | 'merge' | null>(null);

  const handleConfirm = () => {
    if (selectedAction) {
      onResolve(selectedAction);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-warning" />
            {t('sync.conflict.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {t('sync.conflict.description', { path: conflict.localPath })}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('sync.conflict.local')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">
                  {t('sync.conflict.modified', { 
                    time: formatDateTime(conflict.localModified) 
                  })}
                </p>
                <Button 
                  variant={selectedAction === 'local-wins' ? 'default' : 'outline'}
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setSelectedAction('local-wins')}
                >
                  {t('sync.conflict.keepLocal')}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('sync.conflict.remote')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">
                  {t('sync.conflict.modified', { 
                    time: formatDateTime(conflict.remoteModified) 
                  })}
                </p>
                <Button 
                  variant={selectedAction === 'remote-wins' ? 'default' : 'outline'}
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setSelectedAction('remote-wins')}
                >
                  {t('sync.conflict.keepRemote')}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onDismiss}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedAction}
            >
              {t('common.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 3.7 Story 38-7: File Tree Sync Integration

**Priority:** P0 | **Effort:** 3 days | **Team:** Team A

#### 3.7.1 Description

Integrate the File Tree component with the sync system to reflect real-time file changes from both directions.

#### 3.7.2 Technical Implementation

**Sync-Aware File Tree:**

```tsx
// src/components/ide/file-tree/sync-file-tree.tsx

import { useFileTreeStore } from '@/lib/state/file-tree-store';
import { useSyncEventBus } from '@/lib/events/sync-event-bus';
import { useCallback, useEffect } from 'react';

interface SyncFileTreeProps {
  projectId: string;
  onFileSelect: (path: string) => void;
}

export function SyncFileTree({ projectId, onFileSelect }: SyncFileTreeProps) {
  const { nodes, expandNode, collapseNode, refreshTree } = useFileTreeStore();
  const { subscribe, unsubscribe } = useSyncEventBus();

  // Subscribe to sync events
  useEffect(() => {
    const handleFileCreated = (event: FileCreatedEvent) => {
      refreshTree(projectId);
      showNotification('info', 'File created', event.path);
    };

    const handleFileModified = (event: FileModifiedEvent) => {
      refreshTree(projectId);
      showNotification('info', 'File modified', event.path);
    };

    const handleFileDeleted = (event: FileDeletedEvent) => {
      refreshTree(projectId);
      showNotification('warning', 'File deleted', event.path);
    };

    const handleConflictDetected = (event: ConflictDetectedEvent) => {
      showConflictNotification(event.conflict);
    };

    subscribe('file:created', handleFileCreated);
    subscribe('file:modified', handleFileModified);
    subscribe('file:deleted', handleFileDeleted);
    subscribe('sync:conflict', handleConflictDetected);

    return () => {
      unsubscribe('file:created', handleFileCreated);
      unsubscribe('file:modified', handleFileModified);
      unsubscribe('file:deleted', handleFileDeleted);
      unsubscribe('sync:conflict', handleConflictDetected);
    };
  }, [projectId, subscribe, unsubscribe, refreshTree]);

  const handleNodeClick = useCallback((node: FileTreeNode) => {
    if (node.type === 'directory') {
      if (node.expanded) {
        collapseNode(node.path);
      } else {
        expandNode(node.path);
      }
    } else {
      onFileSelect(node.path);
    }
  }, [expandNode, collapseNode, onFileSelect]);

  return (
    <FileTree
      nodes={nodes}
      onNodeClick={handleNodeClick}
      syncIndicators={true}
      showDeletedFiles={true}
      deletedFileStyle="dimmed"
    />
  );
}

// Utility to show notifications
function showNotification(type: 'info' | 'warning' | 'error', title: string, path: string) {
  // Integration with toast notification system
}
```

---

### 3.8 Story 38-8: Properties Panel Component

**Priority:** P1 | **Effort:** 2 days | **Team:** Team A

#### 3.8.1 Description

Create a Properties Panel component to display file metadata including sync status, last modified, file size, and sync history.

#### 3.8.2 Component Specifications

```tsx
// src/components/ide/properties-panel.tsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileMetadata, SyncStatus } from '@/lib/filesystem/types';

interface PropertiesPanelProps {
  selectedPath: string | null;
  onClose: () => void;
}

export function PropertiesPanel({ selectedPath, onClose }: PropertiesPanelProps): JSX.Element {
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([]);

  useEffect(() => {
    if (selectedPath) {
      loadFileProperties(selectedPath);
    }
  }, [selectedPath]);

  const loadFileProperties = async (path: string) => {
    const [meta, status, history] = await Promise.all([
      fileMetadataCache.get(path),
      syncStatusStore.getStatus(path),
      syncHistoryStore.getHistory(path, 10),
    ]);
    setMetadata(meta);
    setSyncStatus(status);
    setSyncHistory(history);
  };

  if (!selectedPath) {
    return (
      <div className="p-4 text-center text-muted">
        <FileIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{t('properties.selectFile')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{t('properties.title')}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* File Info */}
      <div className="space-y-2">
        <PropertyRow label={t('properties.name')} value={basename(selectedPath)} />
        <PropertyRow label={t('properties.path')} value={selectedPath} />
        <PropertyRow 
          label={t('properties.size')} 
          value={metadata ? formatBytes(metadata.size) : '-'} 
        />
        <PropertyRow 
          label={t('properties.modified')} 
          value={metadata ? formatDateTime(metadata.lastModified) : '-'} 
        />
        <PropertyRow 
          label={t('properties.type')} 
          value={metadata?.mimeType || getFileExtension(selectedPath)} 
        />
      </div>

      {/* Sync Status */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">{t('properties.syncStatus')}</h4>
        <SyncStatusBadge status={syncStatus?.state || 'unknown'} />
        {syncStatus?.lastSyncTime && (
          <p className="text-xs text-muted mt-1">
            {t('properties.lastSynced', { time: formatRelativeTime(syncStatus.lastSyncTime) })}
          </p>
        )}
      </div>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">{t('properties.syncHistory')}</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {syncHistory.map((entry, index) => (
              <SyncHistoryRow key={index} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t pt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <RefreshIcon className="h-4 w-4 mr-1" />
          {t('properties.refresh')}
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <HistoryIcon className="h-4 w-4 mr-1" />
          {t('properties.history')}
        </Button>
      </div>
    </div>
  );
}
```

---

### 3.9 Story 38-9: Navigation Sync Enhancements

**Priority:** P2 | **Effort:** 1 day | **Team:** Team A

#### 3.9.1 Description

Enhance the navigation system to maintain sync between editor tabs, file tree selection, and navigation history.

---

### 3.10 Story 38-10: State Management Cleanup

**Priority:** P0 | **Effort:** 1 day | **Team:** Team A

#### 3.10.1 Description

Fix the P0 issue identified in the state management audit: `IDELayout.tsx` duplicates IDE state with local `useState` instead of using `useIDEStore`.

**Target Files:**
- `src/components/layout/IDELayout.tsx`
- `src/lib/state/ide-store.ts`

---

### 3.11 Story 38-11: Sync Event Bus Implementation

**Priority:** P0 | **Effort:** 2 days | **Team:** Team B

#### 3.11.1 Description

Implement a centralized event bus for sync-related events, enabling decoupled communication between sync services and UI components.

#### 3.11.2 Technical Implementation

**SyncEventBus Interface:**

```typescript
// src/lib/events/sync-event-bus.ts

type SyncEventType = 
  | 'sync:started'
  | 'sync:completed'
  | 'sync:failed'
  | 'sync:progress'
  | 'file:created'
  | 'file:modified'
  | 'file:deleted'
  | 'sync:conflict'
  | 'sync:conflict:resolved'
  | 'permission:changed'
  | 'quota:warning'
  | 'quota:exceeded';

interface SyncEventMap {
  'sync:started': { sessionId: string; timestamp: number };
  'sync:completed': { sessionId: string; changesApplied: number; duration: number };
  'sync:failed': { sessionId: string; error: Error };
  'sync:progress': { sessionId: string; percent: number; currentFile: string };
  'file:created': { path: string; source: 'local' | 'remote' };
  'file:modified': { path: string; source: 'local' | 'remote'; checksum: string };
  'file:deleted': { path: string; source: 'local' | 'remote' };
  'sync:conflict': { conflict: SyncConflict };
  'sync:conflict:resolved': { conflictId: string; resolution: string };
  'permission:changed': { path: string; state: PermissionState };
  'quota:warning': { availableBytes: number; thresholdBytes: number };
  'quota:exceeded': { requiredBytes: number; availableBytes: number };
}

interface SyncEventBus {
  publish<K extends SyncEventType>(
    event: K,
    payload: SyncEventMap[K]
  ): void;

  subscribe<K extends SyncEventType>(
    event: K,
    handler: (payload: SyncEventMap[K]) => void
  ): () => void;

  once<K extends SyncEventType>(
    event: K,
    handler: (payload: SyncEventMap[K]) => void
  ): () => void;

  unsubscribeAll(): void;

  getEventHistory(): SyncEvent<keyof SyncEventMap>[];
}

class DefaultSyncEventBus implements SyncEventBus {
  private emitter: EventEmitter3;
  private eventHistory: SyncEvent<keyof SyncEventMap>[] = [];
  private maxHistorySize: number = 100;
  private readonly HISTORY_KEY = 'sync-event-history';

  constructor() {
    this.emitter = new EventEmitter3();
    this.loadHistory();
  }

  publish<K extends SyncEventType>(event: K, payload: SyncEventMap[K]): void {
    this.emitter.emit(event, payload);
    this.addToHistory({ type: event, payload, timestamp: Date.now() });
  }

  subscribe<K extends SyncEventType>(
    event: K,
    handler: (payload: SyncEventMap[K]) => void
  ): () => void {
    this.emitter.on(event, handler as Handler);
    return () => this.emitter.off(event, handler as Handler);
  }

  once<K extends SyncEventType>(
    event: K,
    handler: (payload: SyncEventMap[K]) => void
  ): () => void {
    this.emitter.once(event, handler as Handler);
    return () => this.emitter.off(event, handler as Handler);
  }

  unsubscribeAll(): void {
    this.emitter.removeAllListeners();
  }

  getEventHistory(): SyncEvent<keyof SyncEventMap>[] {
    return this.eventHistory;
  }

  private addToHistory(event: SyncEvent<keyof SyncEventMap>): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    this.saveHistory();
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        this.eventHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load sync event history:', error);
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.eventHistory));
    } catch (error) {
      console.warn('Failed to save sync event history:', error);
    }
  }
}
```

---

### 3.12 Story 38-12: Integration Testing

**Priority:** P1 | **Effort:** 3 days | **Team:** Both

#### 3.12.1 Description

Comprehensive integration testing for all Epic 38 features, including end-to-end sync scenarios, conflict resolution, and UI integration.

**Test Scenarios:**

| Scenario | Description | Coverage |
|----------|-------------|----------|
| Bidirectional Sync | Local → WebContainer → Local roundtrip | Infrastructure + UI |
| Conflict Detection | Simultaneous changes detected and resolved | Core logic |
| Permission Handling | FSA permissions requested and managed | Integration |
| Error Recovery | Sync failures handled gracefully | Resilience |
| Performance | Sync operations meet performance targets | Non-functional |

---

## 4. Interface Definitions

### 4.1 Core TypeScript Interfaces

```typescript
// src/lib/filesystem/types.ts

// ============ Sync Types ============

export interface SyncOperation {
  id: string;
  type: 'forward' | 'reverse';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  source: 'local' | 'remote';
  destination: 'local' | 'remote';
  files: SyncFile[];
  startedAt: number;
  completedAt?: number;
  error?: Error;
}

export interface SyncFile {
  path: string;
  type: 'create' | 'modify' | 'delete';
  checksum: string;
  size: number;
  timestamp: number;
}

export interface SyncSession {
  id: string;
  projectId: string;
  state: 'active' | 'paused' | 'stopped';
  lastSyncTime: number | null;
  nextSyncTime: number | null;
  direction: 'both' | 'forward-only' | 'reverse-only';
}

export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalFilesSynced: number;
  totalBytesSynced: number;
  averageSyncDuration: number;
  lastSyncDuration: number;
}

// ============ Event Types ============

export interface SyncEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface FileChangeEvent {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  content?: Uint8Array;
  checksum: string;
  timestamp: number;
  source: 'local' | 'remote';
}

// ============ Error Types ============

export class SyncError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

export class ConflictError extends Error {
  constructor(
    message: string,
    public conflict: SyncConflict
  ) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public path: string,
    public permission: string
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}
```

---

## 5. Component Specifications

### 5.1 Component Directory Structure

```
src/
├── components/
│   ├── sync/
│   │   ├── sync-status-indicator.tsx
│   │   ├── sync-conflict-dialog.tsx
│   │   ├── sync-progress-bar.tsx
│   │   ├── sync-notification.tsx
│   │   └── index.ts
│   ├── properties/
│   │   ├── properties-panel.tsx
│   │   └── property-row.tsx
│   │   └── index.ts
│   └── ide/
│       └── file-tree/
│           └── sync-file-tree.tsx
└── lib/
    ├── filesystem/
    │   ├── reverse-sync-manager.ts
    │   ├── conflict-resolver.ts
    │   └── space-manager.ts
    ├── events/
    │   ├── sync-event-bus.ts
    │   └── index.ts
    └── editor/
        └── auto-save-manager.ts
```

### 5.2 Component Props Interfaces

```typescript
// All components follow this pattern for props

interface ComponentProps {
  // Required props
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: number;
  
  // Event handlers
  onEvent?: (data: EventData) => void;
  
  // Style overrides
  className?: string;
}
```

---

## 6. Integration Points

### 6.1 Dependency Graph

```
SyncEventBus (38-11)
     │
     ├──► ReverseSyncManager (38-1)
     │        │
     │        ├──► LocalFSAdapter
     │        ├──► WebContainer API
     │        └──► ConflictResolver (38-1)
     │
     ├──► SyncStatusStore (38-6)
     │        │
     │        └──► UI Components (38-6, 38-7, 38-8)
     │
     ├──► FileTree (38-7)
     │
     ├──► PropertiesPanel (38-8)
     │
     └──► TerminalAdapter (38-4)
              │
              └──► EditorAutoSave (38-5)
```

### 6.2 API Contracts

| Consumer | Provider | Contract |
|----------|----------|----------|
| UI Components | SyncEventBus | Subscribe to events, publish events |
| ReverseSyncManager | SyncEventBus | Publish sync events |
| UI Components | SyncStatusStore | read_file sync state |
| ReverseSyncManager | LocalFSAdapter | write_to_file files |
| ReverseSyncManager | WebContainer | read_file/watch files |

---

## 7. Testing Strategy

### 7.1 Test Coverage Targets

| Layer | Target Coverage | Key Tests |
|-------|----------------|-----------|
| Core Logic (ReverseSyncManager, ConflictResolver) | ≥95% | Unit tests with mocks |
| Event Bus | ≥90% | Pub/sub tests |
| UI Components | ≥85% | Render tests, interaction tests |
| Integration | 100% | E2E sync scenarios |

### 7.2 Test Categories

```typescript
// Test organization pattern

__tests__/
├── unit/
│   ├── reverse-sync-manager.test.ts
│   ├── conflict-resolver.test.ts
│   └── sync-event-bus.test.ts
├── integration/
│   ├── bidirectional-sync.test.ts
│   └── conflict-resolution.test.ts
├── e2e/
│   └── project-lifecycle.test.ts
└── fixtures/
    ├── mock-webcontainer.ts
    └── mock-localfs.ts
```

---

## 8. Performance Considerations

### 8.1 Performance Targets

| Operation | Target | Measurement Method |
|-----------|--------|-------------------|
| File sync (<1MB) | < 500ms | Performance.now() |
| Auto-save trigger | < 2s after inactivity | Timer measurement |
| File tree update | < 100ms after sync event | Event to render time |
| UI responsiveness | No blocking | Main thread profiling |
| Memory usage | < 50MB increase | Memory profiler |

### 8.2 Optimization Strategies

```typescript
// Debounced sync operations
class SyncScheduler {
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 100;

  scheduleSync(operation: () => Promise<void>): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    this.syncTimeout = setTimeout(async () => {
      try {
        await operation();
      } catch (error) {
        console.error('Sync operation failed:', error);
      }
    }, this.DEBOUNCE_MS);
  }
}

// Batch file operations
async function batchWrite(
  files: Array<{ path: string; content: Uint8Array }>
): Promise<void> {
  // Group small files, process large files individually
  const batches = chunkBySize(files, 10 * 1024 * 1024); // 10MB batches
  
  for (const batch of batches) {
    await Promise.all(batch.map(f => writeFile(f.path, f.content)));
  }
}
```

---

## 9. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| WebContainer file watching API unstable | High | Low | Polling fallback implementation |
| Large file sync performance | Medium | Medium | Streaming, chunked transfers |
| Conflict resolution user experience | Medium | Medium | Clear UI, smart defaults |
| FSA permissions revocation | High | Low | Permission persistence, graceful degradation |
| Memory usage with event history | Low | Low | Size limits, periodic cleanup |

---

## 10. Implementation Guidelines

### 10.1 Development Order

**Week 1 (P0 stories):**
1. 38-11: Sync Event Bus (foundation for others)
2. 38-1: Reverse Sync Infrastructure
3. 38-10: State Management Cleanup

**Week 2 (UI Integration):**
4. 38-6: Sync Status UI Components
5. 38-7: File Tree Sync Integration
6. 38-2: Project Initialization Workflow

**Week 3 (Feature Completion):**
7. 38-5: Editor Auto-Save Integration
8. 38-8: Properties Panel Component
9. 38-3: Space Management Service
10. 38-4: Terminal Sync Integration
11. 38-9: Navigation Sync Enhancements

**Week 4 (Testing):**
12. 38-12: Integration Testing

### 10.2 Code Review Checklist

- [ ] TypeScript interfaces use `interface` (not `type`)
- [ ] All strings use i18n (`t()` hook)
- [ ] All styles use design tokens (CSS custom properties)
- [ ] Tests cover all branches
- [ ] Error handling is comprehensive
- [ ] Performance targets met
- [ ] Documentation updated

---

## 11. References

### 11.1 Documentation

- Architecture: `_bmad-output/project-planning-artifacts/architecture.md`
- State Management: `_bmad-output/state-management-audit-p1.10-2025-12-26.md`
- Course Correction: `_bmad-output/course-corrections/project-management-system-enhancement-2025-12-31.md`

### 11.2 External Resources

- [WebContainer API](https://developer.stackblitz.com/platform/api/webcontainer-api)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [TanStack Store](https://tanstack.com/store)
- [Dexie.js](https://dexie.org)

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | @bmad-bmm-architect |
| **Created** | 2025-12-31T11:30:00+07:00 |
| **Reviewed** | Not yet |
| **Approved** | Not yet |

---

*End of Technical Specification*
