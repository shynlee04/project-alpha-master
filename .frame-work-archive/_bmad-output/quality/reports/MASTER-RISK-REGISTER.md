# Master Risk Register
**Date**: 2026-01-07
**Scan Type**: Pragmatic Deep Scan (Direct Code Analysis)
**Total Risks**: 47 (8 Critical, 19 High, 20 Medium)
**Health Score**: 42/100

> **Note**: This scan was performed WITHOUT referencing any project governance documents. All findings are based on direct code analysis of the actual codebase.

---

## 🔴 Critical Priority (P0) - Immediate Action Required

### 1. God Store: use-app-store.ts (367 lines)
- **Location**: `src/infrastructure/persistence/stores/use-app-store.ts`
- **Issue**: Single bounded store exceeds 300-line limit by 22%
- **Impact**: High cognitive load, multiple responsibilities in one file
- **Evidence**: `wc -l` = 367 lines
- **Remediation**: Split into smaller focused slices

### 2. God Store: plugins-store.ts (316 lines)
- **Location**: `src/infrastructure/persistence/stores/plugins-store.ts`
- **Issue**: Store exceeds 300-line limit
- **Impact**: Mixed concerns: plugin registry, marketplace, UI state, filters
- **Evidence**: `wc -l` = 316 lines
- **Remediation**: Extract marketplace and UI state to separate files

### 3. God Store: terminal-store.ts (307 lines)
- **Location**: `src/infrastructure/persistence/stores/terminal-store.ts`
- **Issue**: Store exceeds 300-line limit
- **Impact**: Terminal state, shell history, session management mixed
- **Evidence**: `wc -l` = 307 lines
- **Remediation**: Split into focused slices (shell, session, history)

### 4. God Component: MonacoEditor.tsx (768 lines)
- **Location**: `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx`
- **Issue**: Component 2.6x the 300-line limit
- **Impact**: Editor logic, Monaco integration, diagnostics all mixed
- **Evidence**: `wc -l` = 768 lines
- **Remediation**: Extract Monaco hooks, diagnostics handler, editor config

### 5. God Component: resizable.tsx (745 lines)
- **Location**: `src/presentation/components/ui/resizable.tsx`
- **Issue**: Reusable UI component exceeds 300-line limit by 2.5x
- **Impact**: Complex panel resize logic mixed with drag handling
- **Evidence**: `wc -l` = 745 lines
- **Remediation**: Extract drag handlers, resize logic, keyboard shortcuts

### 6. God Component: NotesPage.tsx (712 lines)
- **Location**: `src/presentation/components/notes/NotesPage.tsx`
- **Issue**: Workspace page exceeds 300-line limit by 2.4x
- **Impact**: Note list, editor, AI chat all in one component
- **Evidence**: `wc -l` = 712 lines
- **Remediation**: Extract NoteList, NoteEditor, AIChatPanel sub-components

### 7. God Component: KnowledgePage.tsx (690 lines)
- **Location**: `src/presentation/components/knowledge/KnowledgePage.tsx`
- **Issue**: Workspace page exceeds 300-line limit by 2.3x
- **Impact**: RAG management, source import, canvas all mixed
- **Evidence**: `wc -l` = 690 lines
- **Remediation**: Extract SourceManager, CanvasPanel, RAGControls

### 8. TypeScript Error Storm: 1363 errors
- **Location**: Entire codebase (production code only)
- **Issue**: Massive TypeScript error count blocks safe refactoring
- **Impact**: High risk of runtime errors, impossible to verify types
- **Evidence**: `pnpm exec tsc --noEmit 2>&1 | grep -v ".test." | wc -l` = 1363
- **Remediation**: Dedicated TypeScript fixing sprint (P0 priority)

---

## 🟠 High Priority (P1) - Next Sprint

### 9. Layer Violations: Presentation → Infrastructure
- **Issue**: 20+ presentation components import directly from infrastructure
- **Impact**: Bypasses application/domain layers, violates 4-layer architecture
- **Evidence**:
  ```
  src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx:
    import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
  src/presentation/components/ide/AgentChatPanel.tsx:
    import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/...';
  ```
- **Remediation**: Create application-layer hooks that wrap infrastructure stores

### 10. Viral Any Types: 234 occurrences
- **Location**: Throughout codebase
- **Issue**: Explicit `: any` type usage bypasses type safety
- **Impact**: Type errors cascade to all consumers, runtime bugs
- **Evidence**: `grep -r ": any" src --include="*.ts" --include="*.tsx" | grep -v ".test." | wc -l` = 234
- **Remediation**: Replace with proper types or `unknown` with type guards

### 11. TS Suppressions: 162 occurrences
- **Location**: Throughout codebase
- **Issue**: `@ts-ignore` and `@ts-expect-error` hide real errors
- **Impact**: Masked type errors may cause runtime failures
- **Evidence**: `grep -r "@ts-ignore\|@ts-expect-error" src --include="*.ts" --include="*.tsx" | grep -v ".test." | wc -l` = 162
- **Remediation**: Fix underlying type errors, remove suppressions

### 12. God Component: IndexingProgressPanel.tsx (593 lines)
- **Location**: `src/presentation/components/knowledge/IndexingProgressPanel.tsx`
- **Issue**: Component 2x the 300-line limit
- **Impact**: Indexing UI, progress tracking, error handling mixed
- **Remediation**: Extract ProgressIndicator, ErrorDisplay, IndexingStats

### 13. God Component: EnhancedChatInterface.tsx (592 lines)
- **Location**: `src/presentation/components/ide/EnhancedChatInterface.tsx`
- **Issue**: Chat interface component 2x the limit
- **Impact**: Chat rendering, message handling, tool approval mixed
- **Remediation**: Extract MessageList, ToolApprovalBar, ChatInput

### 14. God Component: AgentChatPanel.tsx (527 lines)
- **Location**: `src/presentation/components/ide/AgentChatPanel.tsx`
- **Issue**: Agent chat panel exceeds limit by 76%
- **Impact**: Agent selection, chat, streaming, tools all mixed
- **Remediation**: Extract AgentSelector, StreamingChat, ToolExecutionPanel

### 15. God Component: ChatConversation.tsx (522 lines)
- **Location**: `src/presentation/components/chat/ChatConversation.tsx`
- **Issue**: Chat conversation view exceeds limit by 74%
- **Impact**: Message rendering, streaming, syntax highlighting mixed
- **Remediation**: Extract MessageRenderer, StreamingMessage, CodeHighlighter

### 16. God Component: ProjectCreationWizard.tsx (513 lines)
- **Location**: `src/presentation/components/project/ProjectCreationWizard.tsx`
- **Issue**: Wizard exceeds limit by 71%
- **Impact**: Multi-step form, validation, storage type selection mixed
- **Remediation**: Extract WizardStep components, form validation hooks

### 17. God Component: SkeletonScreen.tsx (508 lines)
- **Location**: `src/presentation/components/ui/SkeletonScreen.tsx`
- **Issue**: Loading component exceeds limit by 69%
- **Impact**: Multiple skeleton patterns in one file
- **Remediation**: Split into focused skeleton components

### 18. God Component: FileAttachmentInput.tsx (492 lines)
- **Location**: `src/presentation/components/chat/FileAttachmentInput.tsx`
- **Issue**: File input exceeds limit by 64%
- **Impact**: File selection, drag-drop, preview, validation mixed
- **Remediation**: Extract FileDropZone, FilePreview, FileValidator

### 19. God Component: TemplateCustomization.tsx (484 lines)
- **Location**: `src/presentation/components/templates/TemplateCustomization.tsx`
- **Issue**: Template editor exceeds limit by 61%
- **Impact**: Template editing, preview, settings mixed
- **Remediation**: Extract TemplateEditor, PreviewPane, SettingsPanel

### 20. God Component: WorkspacePermissionEditor.tsx (479 lines)
- **Location**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`
- **Issue**: Permission editor exceeds limit by 60%
- **Impact**: Permission grid, tool config, workspace binding mixed
- **Remediation**: Extract PermissionGrid, ToolConfigPanel, WorkspaceBindingPanel

### 21. God Component: WorkflowBuilder.tsx (476 lines)
- **Location**: `src/presentation/components/chat/WorkflowBuilder.tsx`
- **Issue**: Workflow builder exceeds limit by 59%
- **Impact**: Node editor, workflow config, template management mixed
- **Remediation**: Extract NodeEditor, WorkflowConfig, TemplateManager

### 22. God Component: TemplateGallery.tsx (474 lines)
- **Location**: `src/presentation/components/templates/TemplateGallery.tsx`
- **Issue**: Template gallery exceeds limit by 58%
- **Impact**: Template browsing, preview, import mixed
- **Remediation**: Extract TemplateBrowser, TemplatePreview, ImportDialog

### 23. God Component: GitMergeConflictResolver.tsx (473 lines)
- **Location**: `src/presentation/components/git/GitMergeConflictResolver.tsx`
- **Issue**: Merge conflict resolver exceeds limit by 58%
- **Impact**: Diff view, conflict resolution, file management mixed
- **Remediation**: Extract DiffViewer, ConflictResolver, FileManager

### 24. God Component: CodeBlock.tsx (465 lines)
- **Location**: `src/presentation/components/chat/CodeBlock.tsx`
- **Issue**: Code block component exceeds limit by 55%
- **Impact**: Syntax highlighting, copy, language detection mixed
- **Remediation**: Extract SyntaxHighlighter, CodeCopy, LanguageDetector

### 25. God Component: AgentWorkspaceSwitchingFeedback.tsx (458 lines)
- **Location**: `src/presentation/components/agent/AgentWorkspaceSwitchingFeedback.tsx`
- **Issue**: Feedback component exceeds limit by 53%
- **Impact**: Animation, toast, state tracking mixed
- **Remediation**: Extract WorkspaceAnimator, ToastNotifier, StateTracker

### 26. God Component: AnalyticsDashboard.tsx (457 lines)
- **Location**: `src/presentation/components/analytics/AnalyticsDashboard.tsx`
- **Issue**: Analytics dashboard exceeds limit by 52%
- **Impact**: Charts, metrics, filters mixed
- **Remediation**: Extract ChartViews, MetricsPanel, FilterBar

### 27. Store Fragmentation: Multiple store locations
- **Locations**:
  - `src/infrastructure/persistence/stores/` (canonical)
  - `src/lib/` (legacy - 766 lines in workflow-builder-store.test.ts, 724 in note-store.backup.ts)
  - `src/lib/workspace/` (legacy - project-store, threads-store)
  - `src/lib/filesystem/` (legacy - file-snapshot-store)
  - `src/lib/notes/` (legacy - note-store, note-navigation-store)
- **Issue**: Same stores duplicated across multiple directories
- **Impact**: Confusion about which store to use, potential data inconsistency
- **Remediation**: Consolidate all stores to `src/infrastructure/persistence/stores/`

---

## 🟡 Medium Priority (P2) - Technical Debt

### 28. Backup Files Not Cleaned Up
- **Issue**: Multiple `.backup` files left in source tree
- **Evidence**:
  - `agent-selection-store.backup.ts`
  - `workflow-builder-store.backup.ts`
  - `note-store.backup.ts`
  - `git-store.ts.backup`
  - `notification-store.ts.backup`
- **Impact**: Code clutter, confusion about which file is active
- **Remediation**: Remove backup files (they should be in git history only)

### 29. Circular Import Risk in Store Migrations
- **Location**: `src/infrastructure/persistence/stores/`
- **Issue**: Store migration files importing the stores they migrate
- **Evidence**:
  - `migrate-bindings.ts: import { getProjectStoreState } from './useProjectStore'`
  - `conversation-migration.ts: import { useConversationStore } from '../useConversationStore'`
- **Impact**: Potential circular dependency during hydration
- **Remediation**: Pass state as parameter instead of importing store

### 30. Test File as Production Code
- **Location**: `src/lib/workflow/builder/workflow-builder-store.test.ts` (766 lines)
- **Issue**: Test file exceeds 300 lines, nearly as large as production code
- **Impact**: Test maintenance burden, indicates test needs refactoring too
- **Remediation**: Split test file by feature or scenario

---

## Summary Statistics

| Metric | Count | Target | Status |
|--------|-------|--------|--------|
| **God Stores** (>300 lines) | 3 | 0 | 🔴 FAIL |
| **God Components** (>300 lines) | 18+ | 0 | 🔴 FAIL |
| **TypeScript Errors** | 1363 | 0 | 🔴 FAIL |
| **Explicit `any` types** | 234 | 0 | 🔴 FAIL |
| **TS Suppressions** | 162 | 0 | 🔴 FAIL |
| **Layer Violations** | 20+ | 0 | 🔴 FAIL |
| **Source Files** | 1363 | - | - |
| **Health Score** | 42% | 90% | 🔴 CRITICAL |

---

## Remediation Priority Order

1. **P0 (Week 1)**: Fix TypeScript errors - Target: Reduce from 1363 to <100
2. **P0 (Week 1)**: Split 3 god stores into slices <300 lines
3. **P1 (Week 2)**: Split top 5 god components (MonacoEditor, resizable, NotesPage, KnowledgePage, IndexingProgressPanel)
4. **P1 (Week 2)**: Remove viral `any` types - Target: Reduce from 234 to <50
5. **P1 (Week 3)**: Create application-layer hooks for layer violations
6. **P2 (Week 3)**: Clean up backup files and consolidate store locations

---

**Generated by**: Pragmatic Deep Scan (Direct Code Analysis)
**Date**: 2026-01-07
**No governance documents were referenced - findings based purely on code analysis**
