---
investigation_id: "COMPONENT-HOOK-01"
created_at: "2026-01-20T12:00:00+07:00"
created_by: "deep-scan-component-investigation"
scope:
  - "Project creation components"
  - "Notes loading components"
  - "Custom hooks and their purposes"
  - "Workspace context providers"
  - "Service integration patterns"

findings:
  - category: "Project Creation Components"
    files:
      - "src/presentation/components/project/ProjectCreationWizard.tsx (546 lines)"
      - "src/presentation/components/project/ProjectsPage.tsx (381 lines)"
      - "src/presentation/components/project/ProjectSelector.tsx (180+ lines)"
      - "src/presentation/components/project/steps/ProjectDetailsStep.tsx"
      - "src/presentation/components/project/steps/WorkspaceSetupStep.tsx"
      - "src/presentation/components/project/steps/AgentSelectionStep.tsx"
      - "src/presentation/components/project/steps/FileSetupStep.tsx"
      - "src/presentation/components/project/steps/ReviewStep.tsx"
      - "src/presentation/components/project/wizard-types.ts"
    purpose:
      - "Multi-step project creation wizard with 5 steps"
      - "Project listing, search, and sorting"
      - "Project selection dropdown for workspace switching"
      - "Workspace configuration during project creation"
      - "Agent selection and permissions"
      - "Initial file setup (README, .gitignore)"
    hierarchy: |
      ProjectsPage
      ├── ProjectCreationWizard (modal dialog)
      │   ├── ProjectDetailsStep (step 1)
      │   ├── WorkspaceSetupStep (step 2, optional)
      │   ├── AgentSelectionStep (step 3, optional)
      │   ├── FileSetupStep (step 4, optional)
      │   └── ReviewStep (step 5)
      └── WorkspaceBindingDialog
          └── ProjectSelector (dropdown)
    lifecycle:
      - "ProjectsPage mounts → fetches projects from Dexie via useLiveQuery"
      - "User clicks 'Create Project' → opens ProjectCreationWizard"
      - "Wizard validates each step before proceeding"
      - "On create → calls useProjectStore.createProject()"
      - "After creation → navigates to workspace (IDE/Notes) based on storageType"
    issues:
      - "PHASE 1 DETACHMENT annotation on ProjectCreationWizard (line 1-18)"
      - "513 lines exceeds 300-line guideline for wizard"
      - "Complex multi-step state managed with useState (not extracted to custom hook)"
      - "Wizard form state not memoized properly - causes unnecessary re-renders"

  - category: "Notes Components"
    files:
      - "src/presentation/components/notes/NotesPage.tsx (975 lines)"
      - "src/presentation/components/notes/NoteSidebar.tsx (338+ lines)"
      - "src/presentation/components/notes/NoteEditor.tsx (609+ lines)"
      - "src/presentation/components/notes/NoteTreeItem.tsx"
      - "src/presentation/components/notes/NotesMobileLayout.tsx"
      - "src/presentation/components/notes/MarkdownImportDialog.tsx"
      - "src/presentation/components/notes/MarkdownExportDialog.tsx"
      - "src/presentation/components/notes/NotesFilePicker.tsx"
      - "src/presentation/components/notes/NotesRAGSearch.tsx"
      - "src/presentation/components/notes/NotesIndexingButton.tsx"
      - "src/presentation/components/notes/SlashCommandsDialog.tsx"
      - "50+ block components in blocks/ directory"
    hierarchy: |
      NotesPage (memoized with React.memo)
      ├── NotesMobileLayout (mobile) OR Desktop Layout
      │   ├── ResizablePanelGroup (horizontal)
      │   │   ├── ResizablePanel (notes-sidebar) → NoteSidebar
      │   │   ├── ResizablePanel (notes-editor) → NoteEditor
      │   │   └── ResizablePanel (notes-chat) → UnifiedChatPanel
      │   └── Mobile: Mobile navigation tabs
      ├── MarkdownImportDialog
      ├── MarkdownExportDialog
      ├── NotesFilePicker (for FSA sync)
      ├── NotesIndexingButton (RAG)
      └── SyncStatusPanel
    lifecycle:
      - "Route /notes/$projectId loads → Route.loader fetches project from Dexie"
      - "NotesWorkspace component renders → wraps with ProjectProvider"
      - "NotesPage mounts → reads project from ProjectContext"
      - "useEffect: loadNotes(projectId) or loadAllNotes() (browser mode)"
      - "useEffect: auto-initialize file sync for FSA projects"
      - "useEffect: auto-import project files when sync service ready"
      - "useEffect: subscribe to cross-workspace events (FILE_SAVED)"
      - "User creates note → calls createNote() from useNoteStore"
      - "User selects note → NoteEditor renders with noteId key"
    issues:
      - "NotesPage is 975 lines - exceeds 300-line guideline (3x over)"
      - "PERF-07 memo added as band-aid, not refactored"
      - "Complex useEffect chains (8+ effects) for initialization"
      - "Multiple refs for preventing infinite loops (autoInitAttemptedRef, hasAutoImportedRef)"
      - "useMemo for noteStoreConfig to prevent infinite loops (line 190-199)"
      - "Inline render functions for mobile view (renderNoteList, renderEditor)"
      - "Mixed mobile/desktop rendering in same component"

  - category: "Custom Hooks"
    hooks:
      - name: "useProjectStore"
        file: "src/infrastructure/persistence/stores/project/useProjectStore.ts"
        purpose: "Unified project store with 5 slices (CRUD, bindings, permissions, layout, utils)"
        lines: 148

      - name: "useActiveProject"
        file: "src/infrastructure/persistence/stores/project/useProjectStore.ts"
        purpose: "Get currently active project"
        lines: 8

      - name: "useAllProjects"
        file: "src/infrastructure/persistence/stores/project/useProjectStore.ts"
        purpose: "Get all projects with useShallow optimization"
        lines: 3

      - name: "useRecentProjects"
        file: "src/infrastructure/persistence/stores/project/useProjectStore.ts"
        purpose: "Get recent projects with limit"
        lines: 3

      - name: "useProjectStats"
        file: "src/infrastructure/persistence/stores/project/useProjectStore.ts"
        purpose: "Get aggregated project statistics"
        lines: 3

      - name: "useProjectStoreHydration"
        file: "src/infrastructure/persistence/stores/project/useProjectStore.ts"
        purpose: "Check if store has hydrated from persistence"
        lines: 3

      - name: "useCornerstoneStores"
        file: "src/infrastructure/persistence/stores/workspace/useCornerstoneStores.ts"
        purpose: "Aggregate 5 Zustand stores (workspace, app, agents, conversations, RAG)"
        lines: ~123

      - name: "useWorkspaceFileSystem"
        file: "src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts"
        purpose: "File system operations (open, sync, close, restore)"
        lines: ~78

      - name: "useWorkspaceSwitching"
        file: "src/infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts"
        purpose: "Workspace switching logic with navigation"
        lines: ~82

      - name: "useUnifiedWorkspaceContext"
        file: "src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts"
        purpose: "Access unified workspace context value"
        lines: 7

      - name: "useWorkspace"
        file: "src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts"
        purpose: "Convenience hook for workspace identity and project info"
        lines: 11

      - name: "useWorkspaceSync"
        file: "src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts"
        purpose: "Convenience hook for sync operations and status"
        lines: 31

      - name: "useWorkspaceAgent"
        file: "src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts"
        purpose: "Convenience hook for agent selection and configuration"
        lines: 10

      - name: "useWorkspaceSwitcher"
        file: "src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts"
        purpose: "Convenience hook for workspace switching"
        lines: 8

      - name: "useProjectContext"
        file: "src/lib/workspace/ProjectContext.tsx"
        purpose: "Access project context (project, workspace, switchWorkspace)"
        lines: 7

      - name: "useProjectContextSafe"
        file: "src/lib/workspace/ProjectContext.tsx"
        purpose: "Safe version that returns null instead of throwing"
        lines: 4

      - name: "useNoteStore"
        file: "src/lib/notes/note-store.ts"
        purpose: "Notes CRUD and state management"
        lines: ~400+

      - name: "useActiveNote"
        file: "src/lib/notes/note-store.ts"
        purpose: "Get currently active note"
        lines: ~5

      - name: "useFileSyncService"
        file: "src/lib/filesync/hooks/use-file-sync-service.ts"
        purpose: "Initialize and manage file sync service"
        lines: ~150

      - name: "useStorageMode"
        file: "src/presentation/hooks/useStorageMode.ts"
        purpose: "Determine storage mode (FSA vs IndexedDB)"
        lines: ~50

      - name: "useMarkdownSyncConflict"
        file: "src/presentation/hooks/useMarkdownSyncConflict.ts"
        purpose: "Handle markdown sync conflict resolution"
        lines: ~100

      - name: "useChatExport"
        file: "src/presentation/hooks/useChatExport.ts"
        purpose: "Export chat conversations"
        lines: ~80

      - name: "useThreadManager"
        file: "src/presentation/hooks/useThreadManager.ts"
        purpose: "Manage chat threads"
        lines: ~120

      - name: "useArtifactPreview"
        file: "src/presentation/hooks/useArtifactPreview.ts"
        purpose: "Preview AI-generated artifacts"
        lines: ~100

      - name: "useIDEStore"
        file: "src/infrastructure/persistence/stores/ide/index.ts"
        purpose: "IDE-specific state (panels, files, layout)"
        lines: ~300+

      - name: "useConversationStore"
        file: "src/infrastructure/persistence/stores/conversation/useConversationStore.ts"
        purpose: "Chat conversation state"
        lines: ~200+

      - name: "useRAGStore"
        file: "src/infrastructure/persistence/stores/rag/index.ts"
        purpose: "RAG indexing and search state"
        lines: ~200+

      - name: "useAppStore"
        file: "src/infrastructure/persistence/stores/index.ts"
        purpose: "App-level state (providers, models, agents)"
        lines: ~500+

    issues:
      - "useNoteStore, useIDEStore, useAppStore exceed 300-line guideline (god stores)"
      - "useCornerstoneStores, useWorkspaceFileSystem, useWorkspaceSwitching are large orchestration hooks"
      - "No hook extraction for ProjectCreationWizard wizard state"
      - "useProjectContext and useUnifiedWorkspaceContext have overlapping responsibilities"

  - category: "Service Integration"
    services:
      - name: "ProjectRegistry"
        file: "src/domain/services/ProjectRegistry.ts (582 lines)"
        purpose: "Singleton service for project lifecycle with conflict detection"
        methods: "createProject, getProject, deleteProject, validateNamespace"

      - name: "FileSyncService"
        file: "src/infrastructure/sync/file-sync-service.ts"
        purpose: "Sync files between FSA/IndexedDB and workspace"
        methods: "sync, importDirectory, exportDirectory"

      - name: "NotesFileSyncService"
        file: "src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts"
        purpose: "Notes-specific file sync with BlockNote integration"
        methods: "importDirectory, exportDirectory, getNoteFiles"

      - name: "WorkspaceTransitionService"
        file: "src/domain/services/workspace-transition-service.ts"
        purpose: "Handle workspace switching transitions"
        methods: "switchWorkspace, prepareTransition, completeTransition"

      - name: "handlePersistenceService"
        file: "src/infrastructure/filesystem/handle-persistence.ts"
        purpose: "Persist FSA handles to IndexedDB"
        methods: "persistHandle, restoreHandle, getHandles"

      - name: "SyncManager"
        file: "src/infrastructure/sync/sync-manager.ts"
        purpose: "Orchestrate file synchronization"
        methods: "syncNow, pauseSync, resumeSync"

      - name: "LocalFSAdapter"
        file: "src/infrastructure/filesystem/local-fs-adapter.ts"
        purpose: "Adapter for local file system operations"
        methods: "readFile, writeFile, listFiles, watchFiles"

      - name: "StorageAdapterFactory"
        file: "src/infrastructure/filesystem/StorageAdapterFactory.ts"
        purpose: "Create appropriate storage adapter based on platform"
        methods: "createAdapter, getAdapter"

      - name: "eventBus"
        file: "src/infrastructure/events/event-bus.ts"
        purpose: "Cross-workspace event emission and subscription"
        methods: "emit, on, off, once"

    patterns:
      - "Component → Hook → Store → Dexie (persistence)"
      - "Component → Hook → Service → Adapter → File System"
      - "Cross-workspace communication via eventBus"
      - "FSA handles persisted via handlePersistenceService"
      - "Route loader → Dexie → ProjectProvider → Component"
      - "useMemo for preventing infinite re-render loops"
      - "useRef for tracking initialization state"

    issues:
      - "File sync service initialization has race conditions (requires multiple refs)"
      - "handlePersistenceService used inconsistently across components"
      - "ProjectRegistry not used in ProjectCreationWizard (direct store calls)"
      - "Event bus subscriptions not always cleaned up (NotesPage does it correctly)"
      - "Storage adapter created in multiple places (factory vs direct import)"

uncleaned_files:
  - path: "src/presentation/components/project/ProjectCreationWizard.tsx"
    issue: "513 lines exceeds 300-line guideline"
    evidence: "Multi-step wizard state not extracted to custom hook; inline handlers without useCallback"
    recommendation: "Extract wizard state to useProjectCreationWizard hook (100-150 lines)"

  - path: "src/presentation/components/notes/NotesPage.tsx"
    issue: "975 lines - 3x over 300-line guideline"
    evidence: "PERF-07 memo added as band-aid; 8+ useEffect chains; inline render functions"
    recommendation: "Extract mobile layout to NotesMobileLayout; extract file sync logic to useNotesFileSync"

  - path: "src/presentation/components/notes/NoteSidebar.tsx"
    issue: "338+ lines - slightly over guideline"
    evidence: "Multiple inline handlers; complex filtering logic in component body"
    recommendation: "Extract search/filter logic to useNoteFiltering hook"

  - path: "src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts"
    issue: "Large context interface with 10+ slices"
    evidence: "UnifiedWorkspaceContextValue interface has providers, agents, conversations, rag, project, workspaceProject, fileSystem, refs"
    recommendation: "Consider splitting into multiple focused contexts by domain"

  - path: "src/infrastructure/persistence/stores/workspace/useCornerstoneStores.ts"
    issue: "123 lines - large aggregation hook"
    evidence: "Aggregates 5 Zustand stores with complex selection logic"
    recommendation: "Already well-structured; consider extracting each store access to separate hook"

  - path: "src/lib/workspace/ProjectContext.tsx"
    issue: "Duplicate context with UnifiedWorkspaceContext"
    evidence: "ProjectContext provides similar functionality to UnifiedWorkspaceContext.project/workspaceProject"
    recommendation: "Migrate consumers to useUnifiedWorkspaceContext; deprecate ProjectContext"

  - path: "src/infrastructure/persistence/stores/project/project-crud-slice.ts"
    issue: "205 lines for single slice"
    evidence: "createProjectCrudSlice function handles project lifecycle"
    recommendation: "Consider splitting into project-creation-slice and project-deletion-slice"

synthesis: |
  The investigation reveals a complex component and hook ecosystem with three primary layers: Project Creation (ProjectsPage, ProjectCreationWizard, ProjectSelector), Notes Loading (NotesPage with 975 lines, NoteSidebar, NoteEditor), and Workspace Context (UnifiedWorkspaceProvider, ProjectContext). The architecture follows Clean Architecture with components accessing state through hooks (useProjectStore, useNoteStore) that interface with Zustand stores, which persist to Dexie IndexedDB. FSA storage uses handlePersistenceService for handle persistence and StorageAdapterFactory for platform-aware adapter selection.

  Key issues identified include god components (NotesPage at 975 lines, 3x over guideline), duplicated context providers (ProjectContext vs UnifiedWorkspaceContext), and complex initialization patterns requiring multiple useRef guards to prevent infinite loops. The cross-workspace event bus pattern is well-implemented for FILE_SAVED and KNOWLEDGE_SYNTHESIS_EXPORT events, but service integration shows inconsistencies with ProjectRegistry not being used in ProjectCreationWizard and handlePersistenceService called from multiple places.

  Recommendations focus on extracting wizard state to a custom hook (reducing ProjectCreationWizard by ~200 lines), migrating NotesPage to use NotesMobileLayout consistently for both mobile/desktop patterns, consolidating ProjectContext into UnifiedWorkspaceContext, and standardizing service access patterns (use ProjectRegistry consistently, centralize handle persistence).
