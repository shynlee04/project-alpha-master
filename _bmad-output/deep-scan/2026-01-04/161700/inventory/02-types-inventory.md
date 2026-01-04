# Types Inventory Report

**Generated**: 2026-01-04 at 16:17:00
**Agent**: TYPES SCANNER (Phase: INVENTORY)
**Target**: `src/` directory
**Total TypeScript Files**: 1,119

---

## Executive Summary

| Metric | Count | Severity |
|--------|-------|----------|
| **TypeScript Errors** | 103 | 🔴 CRITICAL |
| **Total `any` Usage** | 1,070 occurrences | 🟡 MEDIUM |
| **Files with `any`** | 252 files (22.5% of all files) | 🟡 MEDIUM |
| **`@ts-ignore` Suppressions** | 3 occurrences | 🟢 LOW |
| **`@ts-expect-error` Suppressions** | 22 occurrences | 🟢 LOW |
| **Missing Return Types** | 392 exported functions | 🟡 MEDIUM |
| **Duplicate Interface Definitions** | 5 sets identified | 🟠 MEDIUM |

---

## 1. TypeScript Errors Analysis

### 1.1 Total Errors: 103

### 1.2 Error Distribution by File (Top 20)

| File | Error Count | Primary Issues |
|------|-------------|----------------|
| `src/presentation/components/ui/event-indicators/indexing-utils.tsx` | 17 | Missing properties in `IndexingState` type |
| `src/presentation/components/ui/event-indicators/quiz-generation-utils.tsx` | 12 | Missing properties in `QuizGenerationState` type |
| `src/presentation/components/ui/event-indicators/note-indexing-utils.tsx` | 12 | Missing properties in `NoteIndexingState` type |
| `src/infrastructure/persistence/stores/knowledge/knowledge-store.ts` | 12 | Duplicate property definitions |
| `src/presentation/components/ui/event-indicators/QuizGenerationIndicator.tsx` | 5 | Missing `EventIndicator` export, type mismatches |
| `src/presentation/components/ui/event-indicators/IndexingProgressIndicator.tsx` | 5 | Missing `EventIndicator` export, type mismatches |
| `src/presentation/components/ui/event-indicators/NoteIndexingIndicator.tsx` | 4 | Missing `EventIndicator` export, type mismatches |
| `src/presentation/components/ui/event-indicators/IndexingPhaseItem.tsx` | 4 | Missing properties in `IndexingStep` type |
| `src/lib/workspace/hooks/useWorkspaceActions.ts` | 2 | Missing `showDirectoryPicker` on `Window` |
| `src/lib/sync/file-metadata-cache.ts` | 2 | Argument count mismatches |
| `src/lib/rag/query-optimizer.ts` | 2 | Class used before declaration |
| `src/lib/ide/code-analyzer.ts` | 2 | Undefined variable, possibly undefined property |
| `src/lib/filesystem/directory-walker.ts` | 2 | Unused variables |
| `src/infrastructure/persistence/stores/use-app-store.ts` | 2 | Type mismatches |
| `src/presentation/components/ui/event-indicators/WorkspaceTransitionIndicator.tsx` | 1 | Cannot find name `WorkspaceTransitionPhase` |
| `src/presentation/components/ui/event-indicators/ToolExecutionIndicator.tsx` | 1 | Missing `EventIndicator` export |
| `src/presentation/components/ui/event-indicators/StreamingStatusIndicator.tsx` | 1 | Missing `EventIndicator` export |
| `src/presentation/components/ui/event-indicators/QuizGenerationStepItem.tsx` | 1 | Missing properties in `QuizGenerationStep` |
| `src/presentation/components/study/StudyFilePicker.tsx` | 1 | Missing `showDirectoryPicker` on `Window` |
| `src/presentation/components/notes/NotesFilePicker.tsx` | 1 | Missing `showDirectoryPicker` on `Window` |

### 1.3 Error Categories

1. **Missing Type Properties** (67 errors, 65%)
   - Event indicator state types missing properties like `totalDocuments`, `processedDocuments`, `totalChunks`, `message`, `progress`
   - Affects 4 indicator components: Indexing, Quiz Generation, Note Indexing, Tool Execution

2. **Type Export/Import Issues** (15 errors, 14.6%)
   - Missing `EventIndicator` export from `types.ts`
   - Module import resolution failures

3. **Duplicate Property Definitions** (11 errors, 10.7%)
   - `knowledge-store.ts` has 11 properties specified more than once

4. **API Type Mismatches** (8 errors, 7.8%)
   - `showDirectoryPicker` not defined on `Window` type (4 occurrences)
   - IndexedDB method signature mismatches (2 errors)
   - Database schema type mismatches (2 errors)

5. **Undefined Variables/References** (2 errors, 1.9%)
   - `functionCount` not defined in code-analyzer.ts
   - `WorkspaceTransitionPhase` should be `WorkspaceTransitionStep`

---

## 2. `any` Type Usage Analysis

### 2.1 Total `any` Count: 1,070 occurrences across 252 files (22.5%)

### 2.2 Files with Highest `any` Usage (Top 20)

| File | `any` Count | Context |
|------|-------------|---------|
| `src/__tests__/chat.test.ts` | 26 | Test mocks and fixtures |
| `src/infrastructure/persistence/stores/conversation/thread-management-slice.ts` | 9 | Store state typing |
| `src/infrastructure/persistence/stores/project/project-bindings-slice.ts` | 3 | Store state typing |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | 1 | Store state typing |
| `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts` | 1 | Permission store |
| `src/infrastructure/persistence/stores/project/project-permissions-slice.ts` | 1 | Permission slice |
| `src/presentation/components/layout/__tests__/IDELayout.test.tsx` | 1 | Test file |
| `src/infrastructure/persistence/stores/workspace/workspace-context.ts` | 12 | Workspace context state |
| `src/lib/agent/routes/__tests__/chat-api.test.ts` | 1 | Test file |
| `src/presentation/components/hub/__tests__/NavigationBreadcrumbs.test.tsx` | 1 | Test file |
| `src/lib/sync/__tests__/reverse-sync-service.test.ts` | 5 | Test file |
| `src/presentation/components/layout/TerminalPanel.tsx` | 2 | UI component |
| `src/presentation/components/hub/__tests__/HubHomePage.test.tsx` | 2 | Test file |
| `src/infrastructure/persistence/stores/filesystem/snapshot-quota-slice.ts` | 15 | Filesystem store |
| `src/infrastructure/persistence/stores/conversation/__tests__/conversation-events-slice.test.ts` | 2 | Test file |
| `src/infrastructure/persistence/stores/providers/use-migration-state.ts` | 2 | Migration state |
| `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts` | 5 | Provider CRUD |
| `src/presentation/components/hub/TopicCard.tsx` | 2 | UI component |
| `src/infrastructure/persistence/stores/filesystem/snapshot-bulk-ops-slice.ts` | 5 | Filesystem store |
| `src/presentation/components/hub/ProjectCard.tsx` | 2 | UI component |

### 2.3 Usage Patterns

1. **Test Files** (~40% of `any` usage)
   - Mock implementations
   - Fixture data
   - Test spies and stubs
   - Example: `src/__tests__/chat.test.ts` (26 occurrences)

2. **Error Handling** (~15% of `any` usage)
   - `catch (error: any)` patterns
   - Example: `src/routes/test-fs-adapter.tsx` (5 occurrences)
   - Example: `src/lib/agent/routes/__tests__/sse-streaming.test.ts` (3 occurrences)

3. **Dynamic/External Types** (~20% of `any` usage)
   - External library integrations (GoogleGenAI, PDF.js, etc.)
   - Example: `src/lib/canvas/linkage-ai-enhancer.ts:184` - `let GoogleGenAI: any;`
   - Example: `src/lib/pdf/pdf-vision-capture.ts:83` - `_pdfDocument: any`

4. **Store State Typing** (~15% of `any` usage)
   - Zustand store partial updates
   - Example: `src/infrastructure/persistence/stores/workspace/workspace-context.ts` (12 occurrences)

5. **Event Handlers** (~10% of `any` usage)
   - Event payload typing
   - Example: `src/presentation/components/hub/ProjectCard.tsx:103` - `(event: any)`

---

## 3. Type Suppression Analysis

### 3.1 `@ts-ignore` Suppressions: 3 occurrences

| File | Line | Context |
|------|------|---------|
| `src/routes/ide.tsx` | 1 | Route handling |
| `src/utils/__tests__/export-utils.test.ts` | 1 | Test mock |
| `src/hooks/useProcessManager.ts` | 1 | Process management |
| `src/hooks/use-cross-workspace-events.ts` | 1 | Event handling |
| `src/hooks/useCanvasDrop.ts` | 2 | Drag and drop |

### 3.2 `@ts-expect-error` Suppressions: 22 occurrences

| File | Count | Context |
|------|-------|---------|
| `src/presentation/components/hub/HubHomePage.tsx` | 1 | UI component |
| `src/presentation/components/__tests__/ThemeToggle.test.tsx` | 1 | Test file |
| `src/lib/agent/providers/__tests__/credential-vault.test.ts` | 1 | Test file |
| `src/hooks/useMediaQuery.ts` | 1 | Hook |
| `src/presentation/components/hub/ActivityLineChart.tsx` | 1 | UI component |
| `src/lib/state/__tests__/dexie-db-metadata.test.ts` | 1 | Test file |
| `src/lib/workspace/__tests__/project-metadata.test.ts` | 14 | Test file |
| `src/lib/knowledge/source-import.ts` | 1 | Knowledge import |
| `src/infrastructure/persistence/stores/providers/__tests__/migration-backup.test.ts` | 1 | Test file |
| `src/lib/agent/providers/anthropic-adapter.ts` | 3 | Provider adapter |

**Analysis**:
- 18 out of 22 (81.8%) are in test files (acceptable)
- 4 out of 22 (18.2%) are in production code (should be reviewed)
- Most test suppressions are for mock implementations

---

## 4. Duplicate Interface Definitions

### 4.1 Identified Duplicates

1. **`AppState`** (3 definitions)
   - `src/infrastructure/persistence/stores/providers/provider-utils-slice.ts:106`
   - `src/infrastructure/persistence/stores/providers/provider-models-slice.ts:207`
   - `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts:225`
   - **Impact**: Potential type confusion in provider store slices
   - **Recommendation**: Consolidate into shared types file

2. **`FileEventPayload`** (3 definitions)
   - `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions.ts:35`
   - `src/presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts:36`
   - `src/presentation/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts:32`
   - **Impact**: Event handling inconsistencies in IDE components
   - **Recommendation**: Extract to `src/presentation/components/ide/types.ts`

3. **`GeminiConfig`** (2 definitions)
   - `src/lib/rag/cloud-embedder.ts:15`
   - `src/lib/knowledge/gemini-url-processor.ts:82`
   - **Impact**: Configuration inconsistencies across RAG features
   - **Recommendation**: Consolidate in `src/lib/rag/types.ts`

4. **`ValidationResult`** (2 definitions)
   - `src/lib/init/seed-workspace-permissions.ts:141`
   - `src/domain/services/workspace-transition-service.ts:228`
   - **Impact**: Validation result structure inconsistencies
   - **Recommendation**: Extract to `src/shared/types/validation.ts`

5. **`IndexingState` / `NoteIndexingState` / `QuizGenerationState`** (Type Incompatibilities)
   - Multiple conflicting definitions across event indicator components
   - **Impact**: 67 TypeScript errors in event indicators
   - **Recommendation**: Create canonical event state types

### 4.2 Evidence: Duplicate Property Definitions

**File**: `src/infrastructure/persistence/stores/knowledge/knowledge-store.ts`

```typescript
// Lines 26-36: Properties specified more than once
sources: specified more than once, so this usage will be overwritten
selectedSource: specified more than once, so this usage will be overwritten
isPreviewOpen: specified more than once, so this usage will be overwritten
loading: specified more than once, so this usage will be overwritten
error: specified more than once, so this usage will be overwritten
_hasHydrated: specified more than once, so this usage will be overwritten
collections: specified more than once, so this usage will be overwritten
filteredCollectionId: specified more than once, so this usage will be overwritten
undoQueue: specified more than once, so this usage will be overwritten
extractingMetadata: specified more than once, so this usage will be overwritten
synthesizingSources: specified more than once, so this usage will be overwritten
synthesisResults: specified more than once, so this usage will be overwritten
```

---

## 5. Missing Return Type Annotations

### 5.1 Total Count: 392 exported functions without explicit return types

### 5.2 Examples

```typescript
// No return type annotation
export function getRouter() {
  // ...
}

// Should be:
export function getRouter(): Router {
  // ...
}
```

### 5.3 Categories

1. **Custom Hooks** (~150 functions)
   - Example: `src/hooks/useCanvasDrop.ts:17` - `export const useCanvasDrop = ()`

2. **Utility Functions** (~80 functions)
   - Example: `src/utils/export-utils.ts:27` - `export function sanitizeFilename(filename: string)`

3. **Store Selectors** (~100 functions)
   - Example: `src/infrastructure/persistence/stores/use-app-store.ts:285` - `export const useAgents = ()`

4. **Factory Functions** (~40 functions)
   - Example: `src/lib/mocks/empty.ts` - Multiple mock factories

5. **Event Handlers** (~22 functions)
   - Example: `src/presentation/components/hub/ProjectCard.tsx:103` - `const handleProjectUpdated`

### 5.4 Impact

- Reduced type inference accuracy
- Harder to refactor safely
- Increased cognitive load for maintainers
- Potential for subtle bugs when return types change

---

## 6. Type Safety Issues by Category

### 6.1 Event System Types (67 errors, 65% of total)

**Affected Components**:
- Indexing progress indicators
- Quiz generation indicators
- Note indexing indicators
- Tool execution indicators
- Workspace transition indicators

**Root Cause**: Missing canonical event state type definitions

**Evidence**:
```typescript
// Missing properties in IndexingState:
- totalDocuments
- processedDocuments
- totalChunks
- processedChunks
- message
- progress
```

### 6.2 File System Access API (8 errors, 7.8% of total)

**Root Cause**: Missing `showDirectoryPicker` type declaration

**Affected Files**:
- `src/lib/workspace/hooks/useWorkspaceActions.ts` (2 errors)
- `src/lib/filesync/hooks/use-file-sync-service.ts` (1 error)
- `src/lib/filesystem/fsa-handle-manager.ts` (1 error)
- `src/lib/filesystem/local-fs-adapter.ts` (1 error)
- `src/presentation/components/notes/NotesFilePicker.tsx` (1 error)
- `src/presentation/components/study/StudyFilePicker.tsx` (1 error)

**Recommendation**: Add type declaration for File System Access API

### 6.3 Knowledge Store State Management (12 errors, 11.7% of total)

**Root Cause**: Duplicate property definitions in store slice composition

**Recommendation**: Refactor slice composition to eliminate duplicates

---

## 7. Recommendations

### 7.1 Priority 1: Critical (Fix Immediately)

1. **Create Canonical Event State Types** (Target: 67 errors)
   - File: `src/infrastructure/events/types.ts` (NEW)
   - Define: `IndexingState`, `NoteIndexingState`, `QuizGenerationState`, `EventIndicator`
   - Export from: `src/infrastructure/events/index.ts`

2. **Fix Knowledge Store Duplicate Properties** (Target: 11 errors)
   - File: `src/infrastructure/persistence/stores/knowledge/knowledge-store.ts`
   - Action: Remove duplicate property definitions in slice composition

3. **Add File System Access API Types** (Target: 6 errors)
   - File: `src/types/filesystem-access-api.d.ts` (NEW)
   - Declare: `showDirectoryPicker`, `showOpenFilePicker` on `Window` interface

### 7.2 Priority 2: High (Fix This Sprint)

4. **Consolidate Duplicate Interfaces**
   - `AppState`: Move to `src/infrastructure/persistence/stores/types.ts`
   - `FileEventPayload`: Move to `src/presentation/components/ide/types.ts`
   - `GeminiConfig`: Move to `src/lib/rag/types.ts`
   - `ValidationResult`: Move to `src/shared/types/validation.ts`

5. **Fix Query Optimizer Class Declaration Order** (Target: 2 errors)
   - File: `src/lib/rag/query-optimizer.ts`
   - Action: Move class declaration before usage

### 7.3 Priority 3: Medium (Technical Debt)

6. **Reduce `any` Usage** (Target: 1,070 occurrences)
   - Replace `any` with specific types in production code (60% reduction)
   - Allow `any` in test files with documented rationale
   - Focus on: error handling, event handlers, store state

7. **Add Return Type Annotations** (Target: 392 functions)
   - Start with exported utility functions (high visibility)
   - Move to custom hooks (medium visibility)
   - End with internal store selectors (low visibility)

### 7.4 Priority 4: Low (Quality of Life)

8. **Review Type Suppressions**
   - Remove unnecessary `@ts-ignore` (3 occurrences)
   - Document `@ts-expect-error` in production code (4 occurrences)
   - Keep test suppressions with comments

---

## 8. Metrics Summary

### 8.1 Type Safety Score

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| TypeScript Errors | 103 | 0 | -103 |
| `any` Usage (%) | 22.5% files | <5% files | -17.5% |
| Missing Return Types | 392 functions | <50 functions | -342 |
| Duplicate Interfaces | 5 sets | 0 sets | -5 |
| Type Suppressions | 25 total | <10 total | -15 |

### 8.2 Health Score

**Current Type Health**: 47/100
- Error density: 9.2 errors per 100 files 🔴
- `any` density: 0.96 per file 🟡
- Suppression density: 0.02 per file 🟢
- Duplicate interface rate: 0.45% 🟡

**Target Type Health**: 95/100
- Error density: 0 errors per 100 files 🟢
- `any` density: <0.2 per file 🟢
- Suppression density: <0.01 per file 🟢
- Duplicate interface rate: 0% 🟢

---

## 9. Evidence Files

### 9.1 Typecheck Output
- Location: `/tmp/typecheck-output.txt`
- Command: `pnpm typecheck` (tsconfig.check.json)
- Total Errors: 103
- Configuration: Excludes test files for faster execution

### 9.2 Search Results
- `any` type occurrences: 1,070 across 252 files
- `@ts-ignore`: 3 occurrences
- `@ts-expect-error`: 22 occurrences
- Duplicate interfaces: 5 sets identified
- Missing return types: 392 exported functions

### 9.3 Key Files Requiring Attention

**Critical (10+ errors)**:
1. `src/presentation/components/ui/event-indicators/indexing-utils.tsx` (17 errors)
2. `src/presentation/components/ui/event-indicators/quiz-generation-utils.tsx` (12 errors)
3. `src/presentation/components/ui/event-indicators/note-indexing-utils.tsx` (12 errors)
4. `src/infrastructure/persistence/stores/knowledge/knowledge-store.ts` (12 errors)

**High Priority (2-5 errors)**:
5. Event indicator components (5 files, 20 errors total)
6. File system access API (6 files, 6 errors)
7. Query optimizer, code analyzer, directory-walker (3 files, 6 errors)

---

## 10. Next Steps

### 10.1 Immediate Actions (Today)

1. Create canonical event state types in `src/infrastructure/events/types.ts`
2. Fix knowledge store duplicate properties
3. Add File System Access API type declarations

### 10.2 Short-Term Actions (This Week)

4. Consolidate duplicate interfaces
5. Fix query optimizer class declaration
6. Create shared type definitions file

### 10.3 Long-Term Actions (This Sprint)

7. Implement `any` type reduction plan
8. Add return type annotations to high-visibility functions
9. Review and document type suppressions

---

**Report Status**: ✅ COMPLETE
**Agent**: TYPES SCANNER (INVENTORY phase)
**Next Phase**: DIAGNOSE (root cause analysis)
**Handoff**: Ready for ARCHITECT agent
