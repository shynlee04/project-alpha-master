# TypeScript Error Fix Implementation Plan

**Created**: 2026-01-25T10:00:00+07:00
**Agent**: architect-ext
**Priority**: P0
**Categories**: C (SDK/Architecture) and D (Missing Properties)
**Total Errors**: 27 errors

---

## Phase 1: Analysis ✅ COMPLETE

### Errors Breakdown

**Category C (7 errors):**
1. markdown-sync-service.ts:545 - Promise<Block[]> assigned to Block[]
2. db-consolidation-service.ts:140 - FlashcardSetRecord to FlashcardRecord
3. use-agent-chat-with-tools.ts:318 - unknown[] to AnyClientTool[]
4. note-formatter.ts:172 - unknown[] to Block[]
5. trace-system.ts:379 - DiagnosticTraceEventRecord to TraceEvent (flow: string vs FlowName)

**Category D (20 errors):**
1. Project.deviceType missing (1 error)
2. KnowledgeSource.keyConcepts missing (1 error)
3. WizardFormData properties missing (7-9 errors)
4. WorkspaceBindings Omit/Access contradiction (2 errors)
5. NoteStoreState.addNote missing (1 error)
6. React Context typing issues (7 errors)
7. SettingsPanel missing variables (2 errors)
8. Project vs ProjectRecord mismatch (1-2 errors)
9. SyncStatistics missing totalMerges (1 error)

### Architectural Context

- ADR-034: Project-Centric Architecture with Platform-First plugin selection
- Device architecture separation: Desktop (FSA) vs Mobile (IndexedDB)
- Platform contracts determine available features
- Type adapter layer needed for SDK integration

---

## Phase 2: Implementation - Category C Errors

### Task 1: Create Adapter Layer

**File**: `src/domain/adapters/index.ts`

Adapters to create:
1. `adaptFlashcardSetToRecords(set: FlashcardSetRecord): FlashcardRecord[]`
2. `adaptToolsToClientTools(tools: unknown[]): AnyClientTool[]`
3. `adaptBlocksFromUnknown(blocks: unknown[]): Block[]`
4. `adaptDiagnosticTraceToEvent(record: DiagnosticTraceEventRecord): TraceEvent`

### Task 2: Fix markdown-sync-service.ts (Line 545)

**File**: `src/infrastructure/filesystem/markdown-sync-service.ts`

**Issue**: `Promise<Block[]>` assigned to `Block[]`

**Solution**: Make function async and await the Promise

```typescript
async markdownToBlocks(markdown: string): Promise<Block[]> {
  return await markdownToBlocks(markdown);
}
```

### Task 3: Fix db-consolidation-service.ts (Line 140)

**File**: `src/infrastructure/persistence/services/db-consolidation-service.ts`

**Issue**: `FlashcardSetRecord` assigned to `FlashcardRecord`

**Solution**: Use `adaptFlashcardSetToRecords()` adapter

### Task 4: Fix use-agent-chat-with-tools.ts (Line 318)

**File**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

**Issue**: `unknown[]` assigned to `AnyClientTool[]`

**Solution**: Use `adaptToolsToClientTools()` adapter with type guard

### Task 5: Fix note-formatter.ts (Line 172)

**File**: `src/lib/notes/format/note-formatter.ts`

**Issue**: `unknown[]` assigned to `Block[]`

**Solution**: Use `adaptBlocksFromUnknown()` adapter

### Task 6: Fix trace-system.ts (Line 379)

**File**: `src/lib/diagnostics/trace-system.ts`

**Issue**: `DiagnosticTraceEventRecord` assigned to `TraceEvent` (flow: string vs FlowName)

**Solution**: Use `adaptDiagnosticTraceToEvent()` adapter with type casting

---

## Phase 3: Implementation - Category D Errors

### Task 7: Add deviceType to Project type

**File**: `src/domain/entities/project.ts`

**Change**: Add optional `deviceType` property

```typescript
export interface Project {
  // ... existing properties
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}
```

### Task 8: Add keyConcepts to KnowledgeSource type

**File**: `src/domain/entities/knowledge.ts`

**Change**: Add optional `keyConcepts` property

```typescript
export interface KnowledgeSource {
  // ... existing properties
  keyConcepts?: string[];
}
```

### Task 9: Complete WizardFormData type

**File**: Find wizard type definition (likely `src/presentation/components/project/wizard-types.ts`)

**Missing properties to add**:
- `workspaceType?: 'webcontainer' | 'local'`
- `selectedAgent?: string`
- `agentPermissions?: Record<string, boolean>`
- `fileSetupEnabled?: boolean`
- `createGitignore?: boolean`

### Task 10: Fix WorkspaceBindings Omit/Access Contradiction

**File**: `src/presentation/components/project/steps/ReviewStep.tsx`

**Issue**: Uses `Omit<WorkspaceBindings, "knowledge" | "study">` but then accesses `knowledge` and `study`

**Solution**: Remove the Omit - use full `WorkspaceBindings` type

### Task 11: Complete NoteStoreState API

**File**: `src/infrastructure/persistence/stores/note-store.ts`

**Change**: Add missing `addNote` method

```typescript
export interface NoteStoreState {
  // ... existing properties
  addNote: (note: NoteRecord) => Promise<void>;
  updateNote: (params: UpdateNoteParams) => Promise<void>;
}
```

### Task 12: Fix React Context Typing in useChatPlugin.ts

**File**: `src/plugins/chat/useChatPlugin.ts`

**Issue**: Expects React Context API but uses function component

**Solution**: Refactor to use proper React Context API with `createContext`

### Task 13: Fix SyncStatistics Type

**File**: Find SyncStatistics type definition (likely in `src/lib/notes/sync/`)

**Change**: Add `totalMerges` property

```typescript
export interface SyncStatistics {
  // ... existing properties
  totalMerges: number;
}
```

---

## Phase 4: Fix Consumer Code

### Task 14: Update all consumers of updated types

Files to verify:
- `src/plugins/terminal/TerminalPlugin.tsx` - Uses Project.deviceType
- `src/lib/canvas/linkage-analyzer.ts` - Uses KnowledgeSource.keyConcepts
- `src/lib/workspace/project-repository.ts` - Project vs ProjectRecord mismatch
- `src/presentation/components/layout/MobileIDELayout.tsx` - UseIDEFileHandlersOptions
- `src/presentation/components/ide/SettingsPanel.tsx` - Missing variables

---

## Phase 5: ADR Updates

### Task 15: Update ADR-034

**Section to add**: Type Transformation and Adapters

**Content**:
- Document adapter layer for SDK integration
- Domain type extensions for device and platform support
- Breaking changes and migration notes

### Task 16: Create new ADR if needed

If significant architectural change:
- ADR-035: Type Adapter Pattern for SDK Integration

---

## Phase 6: Validation

### Task 17: Create validation script

**Script**: `.claude/scripts/validate-ts-fixes.sh`

```bash
#!/bin/bash
echo "Validating TypeScript fixes..."

# Check if TypeScript compiles
pnpm tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi

# Check if tests pass
pnpm vitest run
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ All validations passed"
```

---

## Phase 7: Documentation

### Task 18: Create completion report

**File**: `_bmad-output/sprint-artifacts/TS-DEBT-ARCHITECT-completion.md`

**Content**:
- ADR updates: [list of ADRs modified or created]
- Type definitions updated: [list of files]
- Adapter functions created: [list of files]
- ARCHITECT-REPORTs resolved: [count]
- Resolution summary: [how each Category C/D error was resolved]
- Files modified: [list of files]
- Errors before: 63
- Errors after: 0

### Task 19: Archive ARCHITECT-REPORTs

**Directory**: `_bmad-ext/.archive/architect-reports/2026-01-25/`

**Files to archive**:
- `TS-DEBT-01-batch1-sdk-type-mismatches-2026-01-25.md` (tag as RESOLVED)
- `TS-DEBT-01-batch2-missing-properties-2026-01-25.md` (tag as RESOLVED)

---

## Execution Order

1. ✅ Phase 1: Analysis (COMPLETE)
2. ⏳ Phase 2: Fix Category C (7 errors)
   - Create adapters
   - Fix consumer code
3. ⏳ Phase 3: Fix Category D (20 errors)
   - Update domain types
   - Fix consumer code
4. ⏳ Phase 4: Update all consumers
5. ⏳ Phase 5: Update ADRs
6. ⏳ Phase 6: Create completion report
7. ⏳ Phase 7: Archive reports

---

## Success Criteria

- [ ] All Category C errors resolved (7 errors)
- [ ] All Category D errors resolved (20 errors)
- [ ] No new TypeScript errors introduced
- [ ] pnpm tsc --noEmit shows 0 errors
- [ ] All tests pass (pnpm vitest run)
- [ ] ADR-034 updated or new ADR created
- [ ] ARCHITECT-REPORTs archived as RESOLVED
- [ ] Completion report created

---

## Timebox

- Total estimated: 6 hours
- Phase 2 (Category C): 2 hours
- Phase 3 (Category D): 2 hours
- Phase 4 (Consumers): 1 hour
- Phase 5-7 (Docs/Archive): 1 hour
