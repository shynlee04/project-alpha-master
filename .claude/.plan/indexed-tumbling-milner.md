# Phase 1.4: File System Access Expansion - Implementation Plan

**Epic**: CW-01 - Abstract File Sync Service
**Story**: CW-1.4 - File System Access Expansion
**Estimated Time**: 14 hours
**Created**: 2026-01-02
**Status**: Ready for Implementation

---

## Executive Summary

This plan expands file system access to Notes and Study workspaces, implements cross-workspace file references, and adds workspace-specific file permission controls. All work follows existing patterns from IDE and Knowledge workspaces, maintains zero breaking changes, and adheres to December 2025 Zustand patterns.

**Key Deliverables**:
1. Notes workspace: Full file system sync (mount + bidirectional)
2. Study workspace: Read-only file import
3. Cross-workspace file reference system
4. Workspace-scoped file permissions in agent config
5. Comprehensive test coverage

---

## Task Breakdown

### Task 1: Add SyncManager to Notes Workspace (4 hours)

**Objective**: Extend NoteFileSyncService from import/export only to full file system sync with mount capability.

**Current State** (`src/lib/notes/note-file-sync.ts`):
- Import/export only (no mount)
- No bidirectional sync
- No file watching
- Wraps FileSyncService without full interface implementation

**Target State**:
- Full FileSyncService interface implementation
- Mount capability via LocalFSAdapter
- Bidirectional sync (notes ↔ files)
- File change watching
- Auto-sync on note changes

#### 1.1 Create NotesFileSyncService Class (1.5 hours)

**File**: `src/lib/filesync/notes-file-sync-service.ts` (NEW)

**Pattern to Follow**: `src/lib/filesync/ide-file-sync-service.ts`

**Key Implementation Details**:
```typescript
export class NotesFileSyncService implements FileSyncService {
    private localAdapter: LocalFSAdapter;
    private noteStore: NotesStore;
    private fileSyncService: FileSyncService;
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;
    private syncInProgress: boolean;

    constructor(config: NotesFileSyncConfig) {
        // Initialize LocalFSAdapter for direct FS access
        // Wrap base FileSyncService for common operations
        // Subscribe to note store changes
    }

    // Implement ALL FileSyncService interface methods
    async readFile(path: string): Promise<string>
    async writeFile(path: string, content: string): Promise<void>
    async deleteFile(path: string): Promise<void>
    async listFiles(path: string, recursive?: boolean): Promise<string[]>
    async getFileMetadata(path: string): Promise<FileMetadata>
    async writeBatch(operations): Promise<SyncResult>
    async mount(source: FileSystemDirectoryHandle): Promise<void>
    async sync(options?: SyncOptions): Promise<SyncResult>
    getSyncStatus(): SyncStatus
    onFileChange(callback): () => void
    async dispose(): Promise<void>

    // Notes-specific methods
    private async noteToFile(note: NoteRecord): Promise<string>
    private async fileToNote(path: string): Promise<NoteRecord>
    private async syncNoteChanges(): Promise<void>
    private setupNoteWatcher(): void
}
```

**Critical Patterns from IDEFileSyncService**:
1. Dispose guard: `checkDisposed()` throws if called after dispose
2. Change listeners: `Set<callback>` with `emitChange()` helper
3. Sync exclusions: `['.DS_Store', 'Thumbs.db']`
4. Mount integration: Store directoryHandle in LocalFSAdapter
5. Error handling: Wrap all operations in try-catch with SyncResult

#### 1.2 Add Bidirectional Sync Logic (1 hour)

**Implementation**:
```typescript
private async syncNoteChanges(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
        // 1. Get changed notes from store
        const changedNotes = this.noteStore.getNotesChangedSince(this.lastSyncTime);

        // 2. Write changed notes to files
        for (const note of changedNotes) {
            const filePath = this.noteToFilePath(note);
            await this.writeFile(filePath, this.noteToMarkdown(note));
        }

        // 3. Read changed files from FS
        const changedFiles = await this.detectChangedFiles();

        // 4. Import changed files as notes
        for (const filePath of changedFiles) {
            const note = await this.fileToNote(filePath);
            await this.noteStore.updateNote(note);
        }

        this.lastSyncTime = Date.now();
    } finally {
        this.syncInProgress = false;
    }
}
```

#### 1.3 Create Notes File Picker Component (1 hour)

**File**: `src/presentation/components/notes/NotesFilePicker.tsx` (NEW)

**Pattern to Follow**: `src/presentation/components/knowledge/SourceImportDialog.tsx`

**Component Structure** (max 120 lines):
```typescript
export function NotesFilePicker() {
    const { t } = useTranslation();
    const fileSyncService = useNotesFileSync();
    const [mountStatus, setMountStatus] = useState<MountStatus>();
    const [syncStatus, setSyncStatus] = useState<SyncStatus>();

    const handleMount = async () => {
        const handle = await window.showDirectoryPicker();
        await fileSyncService.mount(handle);
    };

    return (
        <Dialog>
            <DialogTrigger><MountButton /></DialogTrigger>
            <DialogContent>
                <MountStatus />
                <SyncStatus />
                <AutoSyncToggle />
                <FileList />
            </DialogContent>
        </Dialog>
    );
}
```

#### 1.4 Integrate into Notes Page (0.5 hours)

**File**: `src/presentation/components/notes/NotesPage.tsx` (MODIFY)

**Changes**:
1. Import NotesFilePicker
2. Add file picker button to header (next to AgentManager)
3. Show mount status badge when mounted
4. Display sync errors via toast

---

### Task 2: Add File Picker to Study Workspace (3 hours)

**Objective**: Create StudyFileSyncService with read-only file import capability.

**Key Design Decision**: READ-ONLY ACCESS
- Study workspace should NOT modify files
- Students consume content, don't create it
- Prevents accidental data loss

#### 2.1 Create StudyFileSyncService (1.5 hours)

**File**: `src/lib/filesync/study-file-sync-service.ts` (NEW)

**Implementation**:
```typescript
export class StudyFileSyncService implements FileSyncService {
    // READ-ONLY IMPLEMENTATIONS
    async writeFile(path: string, content: string): Promise<void> {
        throw new Error('Study workspace is read-only. Cannot write files.');
    }

    async deleteFile(path: string): Promise<void> {
        throw new Error('Study workspace is read-only. Cannot delete files.');
    }

    // Study-specific import methods
    async importPDFAsFlashcards(filePath: string): Promise<void>
    async importQuizJSON(filePath: string): Promise<void>
    async importStudyMaterials(directory: string): Promise<ImportResult>
}
```

#### 2.2 Create Study File Picker Component (1 hour)

**File**: `src/presentation/components/study/StudyFilePicker.tsx` (NEW)

**UI Components**:
1. Mount Button: Trigger directory picker
2. File List: Show available study materials (PDFs, JSON quizzes, Markdown)
3. Import Actions: "Import All" button, individual file import buttons
4. Progress Indicators: Import progress bar, success/error toasts

#### 2.3 Integrate into Study Page (0.5 hours)

**File**: `src/presentation/components/study/StudyPage.tsx` (MODIFY)

**Changes**:
1. Import StudyFilePicker
2. Add file picker button to header (next to AgentManager)
3. Show mounted status badge
4. Display import results via toast

---

### Task 3: Shared File References (4 hours)

**Objective**: Design and implement cross-workspace file reference system.

**Use Cases**:
1. Knowledge workspace references Notes (link to note in knowledge graph)
2. Study workspace references Knowledge sources (cite PDF in flashcard)
3. IDE workspace references any file (existing functionality)

**Constraints**:
1. Workspace isolation: Cannot access files without explicit permission
2. Path resolution: Must work across workspace boundaries
3. Broken link detection: Notify users when referenced files are deleted

#### 3.1 Design Cross-Workspace Reference System (1 hour)

**File**: `src/lib/filesync/cross-workspace-file-references.ts` (NEW)

**Data Structures**:
```typescript
export interface CrossWorkspaceFileReference {
    id: string;
    sourceWorkspace: WorkspaceType;
    targetWorkspace: WorkspaceType;
    targetFilePath: string;
    referenceType: 'link' | 'embed' | 'cite';
    createdAt: number;
    metadata?: {
        title?: string;
        description?: string;
        noteId?: string;
        sourceId?: string;
        flashcardId?: string;
    };
}

export interface ResolvedReference {
    reference: CrossWorkspaceFileReference;
    fileContent?: string;
    fileMetadata?: FileMetadata;
    exists: boolean;
    brokenReason?: 'not_found' | 'permission_denied' | 'workspace_not_mounted';
}
```

**Reference Manager**:
```typescript
export class CrossWorkspaceReferenceManager {
    async createReference(
        sourceWorkspace: WorkspaceType,
        targetWorkspace: WorkspaceType,
        targetFilePath: string,
        referenceType: 'link' | 'embed' | 'cite',
        metadata?: Record<string, unknown>
    ): Promise<string>;

    async resolveReference(referenceId: string): Promise<ResolvedReference>;

    async validateReference(referenceId: string): Promise<boolean>;

    getReferencesForWorkspace(workspace: WorkspaceType): CrossWorkspaceFileReference[];

    async deleteReference(referenceId: string): Promise<void>;

    async detectBrokenReferences(): Promise<CrossWorkspaceFileReference[]>;
}
```

#### 3.2 Implement Reference Resolution (1.5 hours)

**Key Logic**:
```typescript
async resolveReference(referenceId: string): Promise<ResolvedReference> {
    const reference = this.references.get(referenceId);

    // Check workspace permission
    const hasPermission = await this.checkWorkspacePermission(
        reference.sourceWorkspace,
        reference.targetWorkspace
    );

    if (!hasPermission) {
        return { reference, exists: false, brokenReason: 'permission_denied' };
    }

    // Get file sync service for target workspace
    const fileSyncService = this.fileSyncServices.get(reference.targetWorkspace);

    // Try to read file
    try {
        const content = await fileSyncService.readFile(reference.targetFilePath);
        const metadata = await fileSyncService.getFileMetadata(reference.targetFilePath);

        return { reference, fileContent: content, fileMetadata: metadata, exists: true };
    } catch (error) {
        return { reference, exists: false, brokenReason: 'not_found' };
    }
}
```

#### 3.3 Create Reference UI Component (1 hour)

**File**: `src/presentation/components/common/CrossWorkspaceFileReference.tsx` (NEW)

**Component Features**:
1. Reference Link: Clickable link to referenced file
2. Reference Status Badge: Shows if link is broken
3. Reference Tooltip: Shows file metadata
4. Reference Dialog: View referenced file content

**Component Structure** (max 120 lines):
```typescript
export function CrossWorkspaceFileReferenceButton({ referenceId }: Props) {
    const { t } = useTranslation();
    const [resolved, setResolved] = useState<ResolvedReference | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => { resolveReference(); }, [referenceId]);

    if (!resolved?.exists) {
        return <BrokenReferenceBadge reason={resolved.brokenReason} />;
    }

    return (
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
            <Link size={14} />
            {resolved.reference.metadata?.title || resolved.reference.targetFilePath}
        </Button>
    );
}
```

#### 3.4 Add Permission System (0.5 hours)

**Implementation**: Extend WorkspacePermissionManager

```typescript
public async checkWorkspacePermission(
    sourceWorkspace: WorkspaceType,
    targetWorkspace: WorkspaceType
): Promise<boolean> {
    // Check if source workspace has permission to reference target workspace
    // This is controlled by agent workspace bindings
    // For now: allow all references (can be restricted later)
    return true;
}
```

---

### Task 4: Update Workspace Binding Dialogs (2 hours)

**Objective**: Add file permission settings to agent workspace binding configuration.

#### 4.1 Extend Workspace Permission Types (0.5 hours)

**File**: `src/presentation/components/agent/WorkspacePermissions/types.ts` (MODIFY)

**Add File Permission Types**:
```typescript
export type FileAccessLevel = 'none' | 'read-only' | 'read-write';

export interface WorkspaceFilePermission {
    workspace: WorkspaceType;
    accessLevel: FileAccessLevel;
    mounted: boolean;
    mountPath?: string;
}

export interface WorkspaceBindingWithFilePermissions {
    // Existing fields...
    filePermissions: WorkspaceFilePermission;
}
```

#### 4.2 Add File Permission UI Component (1 hour)

**File**: `src/presentation/components/agent/WorkspacePermissions/FilePermissionRow.tsx` (NEW)

**Pattern to Follow**: `src/presentation/components/agent/WorkspacePermissions/ToolPermissionRow.tsx`

**Component Structure** (max 120 lines):
```typescript
export function FilePermissionRow({
    workspace,
    permission,
    onChange,
}: {
    workspace: WorkspaceType;
    permission: WorkspaceFilePermission;
    onChange: (permission: WorkspaceFilePermission) => void;
}) {
    const { t } = useTranslation();
    const workspaceInfo = WORKSPACES[workspace];

    return (
        <div className="flex items-center justify-between p-3 border">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{workspaceInfo.icon}</span>
                <div>
                    <div className="font-medium">{workspaceInfo.label}</div>
                    <div className="text-sm text-muted-foreground">
                        {permission.mounted ? `Mounted: ${permission.mountPath}` : 'Not mounted'}
                    </div>
                </div>
            </div>

            <AccessLevelSelector
                value={permission.accessLevel}
                onChange={(level) => onChange({ ...permission, accessLevel: level })}
            />
        </div>
    );
}
```

#### 4.3 Update WorkspacePermissionEditor (0.5 hours)

**File**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx` (MODIFY)

**Changes**:
1. Import FilePermissionRow
2. Add "File Access" section tab
3. Render FilePermissionRow for each workspace
4. Persist file permissions to agent workspace bindings

---

### Task 5: Test Cross-Workspace File Operations (1 hour)

**Objective**: Comprehensive test coverage for all file sync services.

#### 5.1 Unit Tests for File Sync Services (0.5 hours)

**Test Files**:
1. `src/lib/filesync/__tests__/notes-file-sync-service.test.ts` (NEW)
2. `src/lib/filesync/__tests__/study-file-sync-service.test.ts` (NEW)
3. `src/lib/filesync/__tests__/cross-workspace-file-references.test.ts` (NEW)

**Test Patterns**: Follow `src/lib/filesync/__tests__/ide-file-sync-service.test.ts`

**Key Test Cases**:
- Mount directory handle
- Sync notes to files (Notes)
- Import files as notes (Notes)
- Detect file changes
- Read-only enforcement (Study)
- Import PDF as flashcards (Study)
- Import quiz JSON (Study)
- Create/resolve/delete references
- Detect broken references
- Enforce workspace permissions
- Dispose properly

#### 5.2 Integration Tests (0.5 hours)

**Test File**: `src/lib/filesync/__tests__/cross-workspace-file-operations.integration.test.ts` (NEW)

**Test Scenarios**:
1. Round-trip sync: Note → File → Note (Notes workspace)
2. Import workflow: PDF → Flashcards (Study workspace)
3. Reference resolution: Knowledge → Notes → File content
4. Broken link detection: Delete file, check reference status
5. Permission isolation: Study workspace can't access IDE files

---

## Implementation Order & Dependencies

```
Task 1 (Notes) ────────────────┐
    ├─ 1.1 NotesFileSyncService │
    ├─ 1.2 Bidirectional Sync   │
    ├─ 1.3 NotesFilePicker      │
    └─ 1.4 NotesPage Integration│
                                 │
                                 ├─────> Task 5 (Tests)
                                 │
Task 2 (Study) ────────────────┤
    ├─ 2.1 StudyFileSyncService │
    ├─ 2.2 StudyFilePicker      │
    └─ 2.3 StudyPage Integration│
                                 │
Task 3 (References) ────────────┤
    ├─ 3.1 Design System        │
    ├─ 3.2 Resolution Logic     │
    ├─ 3.3 Reference UI         │
    └─ 3.4 Permissions          │
                                 │
Task 4 (UI Updates) ────────────┘
    ├─ 4.1 Extend Types
    ├─ 4.2 FilePermissionRow
    └─ 4.3 Update Dialogs
```

**Recommended Sequence**:
1. **Hours 1-4**: Task 1 (Notes workspace)
2. **Hours 5-7**: Task 2 (Study workspace)
3. **Hours 8-11**: Task 3 (Cross-workspace references)
4. **Hours 12-13**: Task 4 (UI updates)
5. **Hour 14**: Task 5 (Testing)

---

## Code Patterns to Follow

### 1. FileSyncService Implementation Pattern

**Reference**: `src/lib/filesync/ide-file-sync-service.ts`

**Key Elements**:
1. Implement ALL interface methods (no partial implementations)
2. Dispose guard: `checkDisposed()` throws if service disposed
3. Change listeners: `Set<callback>` with cleanup function
4. Error handling: Wrap operations in try-catch, return SyncResult
5. Sync exclusions: Filter out system files (`.DS_Store`, `Thumbs.db`)
6. Mount integration: Store directoryHandle in adapter
7. File change emission: Call `emitChange()` after write/delete

### 2. Zustand Store Pattern (December 2025)

**Reference**: `src/lib/state/tool-permission-store.ts`

**Key Elements**:
1. Individual selectors: `const trustLevels = useStore(s => s.trustLevels)`
2. Slice pattern: Separate concerns into focused slices
3. Persist middleware: Use `createDexieStorage` for IndexedDB
4. Partialize: Selective field persistence (exclude ephemeral state)
5. Schema versioning: Add `version` field for migrations

**Anti-Patterns to Avoid**:
```typescript
// ❌ WRONG - Causes infinite loops in Zustand v5
const { trustLevels, setTrustLevel } = useToolPermissionStore();

// ✅ CORRECT - Stable selectors
const trustLevels = useToolPermissionStore(s => s.trustLevels);
const setTrustLevel = useToolPermissionStore(s => s.setTrustLevel);
```

### 3. Component Size Limits

**Constraints**:
- Max 120 lines per component
- Max 3 functions per module (exported functions only)
- Max 5 dependencies per component
- Max 3 nesting levels (if/for/function)

**Enforcement**: Use component composition for complex UI

### 4. Workspace-Scoped Permissions Pattern

**Reference**: `src/lib/agent/workspace-permission-manager.ts`

**Check Order**:
1. Agent available in workspace?
2. Tool enabled for workspace?
3. Tool has trust level permission?

---

## Risk Mitigation

### Risk 1: Breaking Existing Functionality
**Impact**: HIGH
**Probability**: LOW
**Mitigation**:
1. All new code is additive (no modifications to existing services)
2. NoteFileSyncService wraps existing FileSyncService (composition)
3. Backwards compatibility: Import/export still works
4. Test all existing functionality before and after changes

### Risk 2: Permission Leaks Between Workspaces
**Impact**: CRITICAL (security)
**Probability**: MEDIUM
**Mitigation**:
1. Workspace-scoped permission checks at EVERY layer
2. File sync services check workspace permissions before operations
3. Cross-workspace references require explicit permission
4. Unit tests for permission isolation
5. Integration tests for cross-workspace access control

### Risk 3: Infinite Sync Loops
**Impact**: HIGH (performance)
**Probability**: MEDIUM
**Mitigation**:
1. Sync-in-progress flag prevents concurrent syncs
2. Debounced sync (500ms delay)
3. Change detection: Only sync if file actually changed
4. Maximum sync depth limit (prevent circular dependencies)

### Risk 4: Broken File References
**Impact**: MEDIUM (UX)
**Probability**: HIGH
**Mitigation**:
1. Reference validation on every resolve
2. Background job to detect broken references
3. UI shows broken link status badges
4. User notification when reference breaks

---

## Files to Create (17 total)

### Core Services (4 files)
1. `src/lib/filesync/notes-file-sync-service.ts` - Notes file sync implementation
2. `src/lib/filesync/study-file-sync-service.ts` - Study file sync implementation
3. `src/lib/filesync/cross-workspace-file-references.ts` - Reference system
4. `src/domain/services/file-reference-utils.ts` - Domain service for references

### UI Components (6 files)
5. `src/presentation/components/notes/NotesFilePicker.tsx` - Notes mount dialog
6. `src/presentation/components/study/StudyFilePicker.tsx` - Study mount dialog
7. `src/presentation/components/common/CrossWorkspaceFileReference.tsx` - Reference link
8. `src/presentation/components/agent/WorkspacePermissions/FilePermissionRow.tsx` - File permission UI
9. `src/presentation/components/common/ReferenceDialog.tsx` - Reference viewer
10. `src/presentation/components/common/BrokenReferenceBadge.tsx` - Error indicator

### Store & State (2 files)
11. `src/infrastructure/persistence/stores/notes-file-sync-store.ts` - Notes sync state
12. `src/infrastructure/persistence/stores/study-file-sync-store.ts` - Study sync state

### Types (1 file)
13. `src/lib/filesync/file-sync-types.ts` - Shared file sync types

### Tests (4 files)
14. `src/lib/filesync/__tests__/notes-file-sync-service.test.ts`
15. `src/lib/filesync/__tests__/study-file-sync-service.test.ts`
16. `src/lib/filesync/__tests__/cross-workspace-file-references.test.ts`
17. `src/lib/filesync/__tests__/cross-workspace-file-operations.integration.test.ts`

---

## Files to Modify (5 files)

1. `src/presentation/components/notes/NotesPage.tsx` - Add NotesFilePicker
2. `src/presentation/components/study/StudyPage.tsx` - Add StudyFilePicker
3. `src/presentation/components/agent/WorkspacePermissions/types.ts` - Add file permission types
4. `src/presentation/components/agent/WorkspacePermissionEditor.tsx` - Add file permissions section
5. `src/lib/events/workspace-events.ts` - Add file reference events

---

## Success Metrics

1. **Functionality**: All 5 tasks complete, all validation checkpoints pass
2. **Code Quality**: Zero breaking changes, 80%+ test coverage
3. **Performance**: Sync operations < 1s for 100 files
4. **Security**: Zero permission leaks, workspace isolation enforced
5. **UX**: No UI regressions, new features discoverable and intuitive

---

**End of Implementation Plan**
