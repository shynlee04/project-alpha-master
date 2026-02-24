# TypeScript Error Classification Breakdown

**Generated**: 2026-01-25T08:15:00+07:00
**Session**: arch-03-audit-2026-01-25
**Total Errors**: 113
**Governance Reference**: `.opencode/instructions/ts-error-classification.md`

---

## 📊 SUMMARY BY CATEGORY

| Category | Count | Agent Responsible | Description |
|----------|-------|-------------------|-------------|
| **A (Simple Fixes)** | 49 | dev-ext | Missing imports, unused variables, simple type fixes |
| **B (Map/Array)** | 5 | dev-ext | Map using Array methods (filter/find) |
| **C (SDK/Architecture)** | 12 | architect-ext | Type incompatibility, wrong type contracts |
| **D (Missing Properties)** | 20 | architect-ext | Missing properties on domain types |
| **E (Duplicate Exports)** | 8 | dev-ext | Duplicate export declarations |
| **F (Type Safety)** | 4 | dev-ext | Unused @ts-expect-error directives |
| **Unclassified** | 15 | - | Requires investigation |

**Total Fixable by dev-ext**: 66 errors (Category A, B, E, F)
**Total requiring architect-ext**: 32 errors (Category C, D)

---

## 📋 CATEGORY A: SIMPLE FIXES (49 errors)

### Unused Variables/Parameters (40 errors)
- `src/lib/notes/format/note-formatter.ts(300,5)`: 'noteId' is declared but never used
- `src/lib/notes/sync/cache-sync.ts(12,71)`: 'extractNoteId' is declared but never used
- `src/lib/notes/sync/cache-sync.ts(13,1)`: 'FileChangeEvent' is declared but never used
- `src/lib/notes/sync/note-sync-layer.ts(87,13)`: 'adapter' is declared but never used
- `src/lib/workspace/project-repository.ts(31,3)`: 'traceVerifyHandleAccess' is declared but never used
- `src/plugins/monaco/MonacoPlugin.tsx(29,1)`: All imports unused
- `src/plugins/monaco/MonacoPlugin.tsx(94,11)`: 'project' is declared but never used
- `src/plugins/monaco/MonacoPlugin.tsx(94,29)`: 'openFile' is declared but never used
- `src/plugins/monaco/MonacoPlugin.tsx(94,49)`: 'refreshFileTree' is declared but never used
- `src/plugins/monaco/MonacoPlugin.tsx(110,9)`: 'loadFile' is declared but never used
- `src/plugins/monaco/MonacoPlugin.tsx(147,13)`: 'data' is declared but never used
- `src/plugins/monaco/MonacoPlugin.tsx(225,9)`: 'language' is declared but never used
- `src/plugins/monaco/types.ts(15,1)`: 'React' is declared but never used
- `src/presentation/components/ide/SettingsPanel.tsx(36,11)`: All destructured elements unused
- `src/presentation/components/ide/StorageBadge.tsx(20,1)`: 'PlatformContract' is declared but never used
- `src/presentation/components/layout/hooks/useIDEFileHandlers.ts(69,11)`: All destructured elements unused
- `src/presentation/components/sidebar/AgentToolsPanel.tsx(20,1)`: 'React' is declared but never used
- `src/presentation/components/sidebar/AgentToolsPanel.tsx(46,33)`: 'currentProjectId' is declared but never used
- `src/presentation/components/sidebar/ChatThreadList.tsx(20,1)`: 'React' is declared but never used
- `src/presentation/components/sidebar/ChatThreadList.tsx(47,32)`: 'currentProjectId' is declared but never used
- `src/presentation/components/sidebar/ChatThreadList.tsx(48,9)`: 'chatService' is declared but never used
- `src/presentation/components/sidebar/ChatThreadList.tsx(63,9)`: 'handleThreadClick' is declared but never used
- `src/presentation/components/sidebar/ChatThreadList.tsx(63,30)`: 'threadId' is declared but never used
- `src/presentation/components/ui/LayoutPresetPicker.tsx(229,10)`: 'getCurrentProjectId' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(165,35)`: 'options' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(184,16)`: 'step1_BackupCurrentState' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(184,41)`: 'options' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(207,16)`: 'step2_RevertStorageType' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(207,40)`: 'options' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(233,16)`: 'step3_ImportFSAFiles' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(233,37)`: 'options' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(265,16)`: 'step4_ValidateRollback' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(265,39)`: 'options' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(283,16)`: 'ensureBackupDir' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(283,32)`: 'dir' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(290,16)`: 'copyDirectory' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(290,30)`: 'source' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(290,46)`: 'destination' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(297,10)`: 'generateImportReport' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(297,31)`: 'stats' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(297,63)`: 'errors' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(305,10)`: 'validateNoteNoteRecord' is declared but never used
- `src/scripts/rollback-fsa-migration.ts(305,33)`: 'note' is declared but never used

### Type Assignments (5 errors)
- `src/lib/notes/sync/cache-sync.ts(186,47)`: Type 'string | undefined' is not assignable to parameter of type 'string'
- `src/lib/workspace/project-repository.ts(273,9)`: Type 'number' is not assignable to type 'Date'
- `src/lib/notes/sync/cache-sync.ts(193,36)`: Type 'NoteFrontmatter' is not assignable to parameter of type 'UpdateNoteParams'

### Property Access (2 errors)
- `src/lib/notes/sync/cache-sync.ts(201,25)`: Property 'addNote' does not exist on type 'NoteStoreState'
- `src/presentation/components/project/steps/ReviewStep.tsx(228,18)`: Element implicitly has an 'any' type

### Duplicate Identifier (1 error)
- `src/lib/notes/sync/cache-sync.ts(83,13)`: Duplicate identifier 'adapter'

### Implicit Any (1 error)
- `src/lib/notes/sync/cache-sync.ts(189,49)`: Parameter 'n' implicitly has an 'any' type

---

## 📋 CATEGORY B: MAP/ARRAY METHODS (5 errors)

All in `src/lib/notes/sync/cache-sync.ts`:
- Line 189: `Property 'find' does not exist on type 'Map<string, NoteRecord>'`
- Line 262: `Property 'filter' does not exist on type 'Map<string, NoteRecord>'`
- Line 263: `Property 'filter' does not exist on type 'Map<string, NoteRecord>'`
- Line 268: `Property 'filter' does not exist on type 'Map<string, NoteRecord>'`
- Line 269: `Property 'filter' does not exist on type 'Map<string, NoteRecord>'`

**Fix Pattern**: Convert `map.filter/find(...)` to `Array.from(map.values()).filter/find(...)`

---

## 📋 CATEGORY C: SDK/ARCHITECTURE INCOMPATIBILITY (12 errors)

### Type Contract Mismatches (6 errors)
- `src/infrastructure/filesystem/markdown-sync-service.ts(545,5)`: `Promise<Block[]>` assigned to `Block[]` (async/sync mismatch)
- `src/infrastructure/persistence/services/db-consolidation-service.ts(140,34)`: `FlashcardSetRecord` assigned to `FlashcardRecord` (type mismatch)
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts(318,32)`: `unknown[]` assigned to `AnyClientTool[]` (SDK incompatibility)
- `src/lib/notes/format/note-formatter.ts(172,45)`: `unknown[]` assigned to `Block[]` (type mismatch)
- `src/lib/diagnostics/trace-system.ts(379,47)`: `DiagnosticTraceEventRecord` assigned to `TraceEvent` (type mismatch)
- `src/lib/notes/sync/cache-sync.ts(270,7)`: Property 'totalMerges' does not exist in type 'SyncStatistics'

### Implicit Any on Map Iteration (6 errors)
- `src/lib/notes/sync/cache-sync.ts(189,49)`: Parameter 'n' implicitly has an 'any' type
- `src/lib/notes/sync/cache-sync.ts(262,28)`: Parameter 'n' implicitly has an 'any' type
- `src/lib/notes/sync/cache-sync.ts(263,31)`: Parameter 'n' implicitly has an 'any' type
- `src/lib/notes/sync/cache-sync.ts(268,33)`: Parameter 'n' implicitly has an 'any' type
- `src/lib/notes/sync/cache-sync.ts(269,36)`: Parameter 'n' implicitly has an 'any' type

**NOTE**: These are Category C because they require fixing the Map/Array approach and updating type definitions.

---

## 📋 CATEGORY D: MISSING PROPERTIES ON DOMAIN TYPES (20 errors)

### Project Type Missing Properties (1 error)
- `src/plugins/terminal/TerminalPlugin.tsx(70,15)`: Property 'deviceType' does not exist on type 'Project'

### KnowledgeSource Missing Properties (1 error)
- `src/lib/canvas/linkage-analyzer.ts(125,29)`: Property 'keyConcepts' does not exist on type 'KnowledgeSource'

### WizardFormData Missing Properties (11 errors)
All in `src/presentation/components/project/steps/ReviewStep.tsx`:
- Line 228: Property 'workspaceType' does not exist on type 'WizardFormData'
- Line 255: Property 'selectedAgent' does not exist on type 'WizardFormData'
- Line 263: Property 'agentPermissions' does not exist on type 'WizardFormData'
- Line 268: Property 'agentPermissions' does not exist on type 'WizardFormData'
- Line 273: Property 'agentPermissions' does not exist on type 'WizardFormData'
- Line 285: Property 'fileSetupEnabled' does not exist on type 'WizardFormData'
- Line 297: Property 'createGitignore' does not exist on type 'WizardFormData'

### UseChatPlugin Context Issues (7 errors)
All in `src/plugins/chat/useChatPlugin.ts`:
- Line 82: Property 'Context' does not exist on type 'FC<{ projectId: string; children: ReactNode; }>'
- Line 92-96: 'context' is of type 'unknown' (5 errors)

**NOTE**: This requires architect-ext to decide on the correct Context typing approach.

### SettingsPanel Missing Variables (2 errors)
All in `src/presentation/components/ide/SettingsPanel.tsx`:
- Line 129: Cannot find name 'showAdvanced'
- Line 130: Cannot find name 'setShow'
- Line 132: Cannot find name 't'

**NOTE**: This may be destructuring issue, not missing type property.

### Project Type Missing Workspace Binding Properties (2 errors)
All in `src/lib/workspace/project-repository.ts`:
- Line 280: Type 'Project' is missing properties from type 'ProjectRecord': path, workspaceId
- Line 281: Type 'Project' is missing properties from type 'ProjectRecord': path, workspaceId

### WorkspaceBindings Type Mismatch (2 errors)
All in `src/presentation/components/project/steps/ReviewStep.tsx`:
- Line 186: Property 'knowledge' does not exist on type 'Omit<WorkspaceBindings, "knowledge" | "study">'
- Line 196: Property 'study' does not exist on type 'Omit<WorkspaceBindings, "knowledge" | "study">'

### UseIDEFileHandlersOptions Missing Property (1 error)
- `src/presentation/components/layout/MobileIDELayout.tsx(201,9)`: Property 'syncManagerRef' does not exist in type 'UseIDEFileHandlersOptions'

---

## 📋 CATEGORY E: DUPLICATE EXPORTS (8 errors)

All in `src/lib/diagnostics/trace-system.ts`:
- Line 339: Cannot redeclare exported variable 'completeTrace'
- Line 354: Cannot redeclare exported variable 'getRecentTraces'
- Line 390: Cannot redeclare exported variable 'clearTraces'
- Line 407: Cannot redeclare exported variable 'completeTrace'
- Line 407: Export declaration conflicts with exported declaration of 'completeTrace'
- Line 408: Cannot redeclare exported variable 'getRecentTraces'
- Line 408: Export declaration conflicts with exported declaration of 'getRecentTraces'
- Line 409: Cannot redeclare exported variable 'clearTraces'

**NOTE**: These functions appear to be declared twice - need to consolidate.

---

## 📋 CATEGORY F: TYPE SAFETY VIOLATIONS (4 errors)

All in API route files:
- `src/routes/api/provider-test.ts(249,3)`: Unused '@ts-expect-error' directive
- `src/routes/api/providers.$id.execute.ts(108,3)`: Unused '@ts-expect-error' directive
- `src/routes/api/providers.$id.test.ts(129,3)`: Unused '@ts-expect-error' directive
- `src/routes/api/providers.$id.ts(151,3)`: Unused '@ts-expect-error' directive
- `src/routes/api/providers.ts(136,3)`: Unused '@ts-expect-error' directive

**NOTE**: 5 errors, not 4. These are safe to remove.

---

## 📋 UNCLASSIFIED ERRORS (15 errors)

These errors require investigation before categorization:
- [ ] `src/lib/workspace/project-repository.ts(280,29)`: Project not assignable to ProjectRecord
- [ ] `src/lib/workspace/project-repository.ts(281,?)`: Project not assignable to ProjectRecord
- [ ] `src/presentation/components/project/steps/ReviewStep.tsx(186,43)`: Knowledge property issue
- [ ] `src/presentation/components/project/steps/ReviewStep.tsx(196,43)`: Study property issue

**NOTE**: These appear to be Category D (missing properties) but need verification.

---

## 🎯 DELEGATION RECOMMENDATION

### Batch 1: dev-ext (Categories A, B, E, F) - 66 errors
**Estimated Effort**: 3-4 hours
**Priority**: P0 (Blocks TypeScript compilation)

**Files to Fix**:
- `src/lib/notes/sync/cache-sync.ts` (Category B: 5 errors, Category A: 5 errors)
- `src/lib/diagnostics/trace-system.ts` (Category E: 8 errors)
- `src/routes/api/*.ts` (Category F: 5 errors)
- `src/lib/notes/format/note-formatter.ts` (Category A: 2 errors)
- `src/plugins/monaco/MonacoPlugin.tsx` (Category A: 8 errors)
- `src/plugins/chat/useChatPlugin.ts` (Category D: 7 errors - Create ARCHITECT-REPORT)
- [Other Category A files]

**Acceptance Criteria**:
1. Run `pnpm tsc --noEmit` to get current error list
2. Classify each error (A/B/C/D/E/F)
3. Fix only Category A, B, E, F errors
4. Create ARCHITECT-REPORT for each Category C or D error
5. Run `pnpm tsc --noEmit` to verify no new errors
6. Report completion with breakdown

### Batch 2: architect-ext (Categories C, D) - 32 errors
**Estimated Effort**: 4-5 hours
**Priority**: P0 (Blocks TypeScript compilation)

**Required Actions**:
1. Review all ARCHITECT-REPORT artifacts from dev-ext
2. Make architectural decisions for each Category C/D error
3. Update domain types in `src/domain/types/`
4. Update ADR-034 or create new ADRs if needed
5. Verify all consumers updated
6. Archive ARCHITECT-REPORTs as RESOLVED

---

## 📊 TRACKING

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Errors | 113 | 0 | -113 |
| Category A | 49 | 0 | -49 |
| Category B | 5 | 0 | -5 |
| Category C | 12 | 0 | -12 |
| Category D | 20 | 0 | -20 |
| Category E | 8 | 0 | -8 |
| Category F | 4 | 0 | -4 |

---

## 🔗 REFERENCES

- `.opencode/instructions/ts-error-classification.md` - Error classification matrix
- `.opencode/instructions/sprint-manager-ts-delegation-v2.md` - Delegation instructions
- `_bmad-ext/state/LOOP_STATE.yaml` - Current session state
- ADR-034: Project-Centric Architecture

---

**END OF ERROR BREAKDOWN**
