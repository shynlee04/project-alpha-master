# ARCHITECT-REPORT: TypeScript Error Analysis - Batch 2

**Created**: 2026-01-25T09:35:00+07:00
**Agent**: dev-ext
**Priority**: P0 (Blocks TypeScript compilation)
**Status**: RESOLVED
**Resolution Date**: 2026-01-25
**Resolution**: Fixed via domain type extensions and proper property definitions. All errors in this batch were resolved by adding missing properties to domain types or using adapter pattern.
**File Group**: Missing Properties on Domain Types

---

## Error Summary

**Error Type**: Category D (Missing Properties on Domain Types)
**Total Errors**: 20

### Project Type (1 error)
| File | Line | Error |
|------|-------|-------|
| `src/plugins/terminal/TerminalPlugin.tsx` | 70 | Property 'deviceType' does not exist on type 'Project' |

### KnowledgeSource Type (1 error)
| File | Line | Error |
|------|-------|-------|
| `src/lib/canvas/linkage-analyzer.ts` | 125 | Property 'keyConcepts' does not exist on type 'KnowledgeSource' |

### WizardFormData Type (9 errors)
| File | Line | Error |
|------|-------|-------|
| `src/presentation/components/project/steps/ReviewStep.tsx` | 228 | Property 'workspaceType' does not exist on type 'WizardFormData' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 255 | Property 'selectedAgent' does not exist on type 'WizardFormData' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 263 | Property 'agentPermissions' does not exist on type 'WizardFormData' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 268 | Property 'agentPermissions' does not exist on type 'WizardFormData' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 273 | Property 'agentPermissions' does not exist on type 'WizardFormData' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 285 | Property 'fileSetupEnabled' does not exist on type 'WizardFormData' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 297 | Property 'createGitignore' does not exist on type 'WizardFormData' |

### NoteStoreState Type (2 errors)
| File | Line | Error |
|------|-------|-------|
| `src/lib/notes/sync/cache-sync.ts` | 189 | Type 'NoteFrontmatter' is not assignable to 'UpdateNoteParams' (missing id) |
| `src/lib/notes/sync/cache-sync.ts` | 197 | Property 'addNote' does not exist on type 'NoteStoreState' |

### WorkspaceBindings Type (2 errors)
| File | Line | Error |
|------|-------|-------|
| `src/presentation/components/project/steps/ReviewStep.tsx` | 186 | Property 'knowledge' does not exist on type 'Omit<WorkspaceBindings, "knowledge" | "study">' |
| `src/presentation/components/project/steps/ReviewStep.tsx` | 196 | Property 'study' does not exist on type 'Omit<WorkspaceBindings, "knowledge" | "study">' |

### ProjectRecord Type (1 error)
| File | Line | Error |
|------|-------|-------|
| `src/lib/workspace/project-repository.ts` | 279 | Type 'Project' is missing properties from 'ProjectRecord': path, workspaceId |

### Other Type Errors (4 errors)
| File | Line | Error |
|------|-------|-------|
| `src/plugins/chat/useChatPlugin.ts` | 82 | Property 'Context' does not exist on type 'FC' |
| `src/plugins/chat/useChatPlugin.ts` | 92-96 | 'context' is of type 'unknown' (5 errors) |
| `src/presentation/components/layout/MobileIDELayout.tsx` | 201 | Property 'syncManagerRef' does not exist in 'UseIDEFileHandlersOptions' |
| `src/presentation/components/ide/SettingsPanel.tsx` | 129-132 | Cannot find name 'showAdvanced', 'setShow', 't' |

---

## Analysis

**Why This Is Architectural:**

These errors indicate incomplete or inconsistent domain type definitions across the codebase. The issues fall into several categories:

### 1. Incomplete Domain Models (Project, KnowledgeSource)
The `Project` and `KnowledgeSource` types are missing properties that consumers expect:
- `Project` lacks `deviceType` (needed for platform detection)
- `KnowledgeSource` lacks `keyConcepts` (needed for canvas linkage)

### 2. Wizard Form State Mismatch
The `WizardFormData` type is missing properties that the ReviewStep component tries to use:
- `workspaceType`, `selectedAgent`, `agentPermissions`, `fileSetupEnabled`, `createGitignore`

This suggests either:
- Wizard form is incomplete (not collecting these values)
- Type definition is outdated
- Properties were removed from form but not from type

### 3. Workspace Binding Confusion
The code uses `Omit<WorkspaceBindings, "knowledge" | "study">` but then tries to access `knowledge` and `study` properties. This is a logical contradiction - you can't omit properties and then access them.

### 4. NoteStore API Incomplete
The `NoteStoreState` interface is missing `addNote` method that cache-sync.ts expects. Either:
- Store API is incomplete
- Store refactored but cache-sync not updated
- Different sync approach is intended

### 5. Project vs ProjectRecord Mismatch
Domain types `Project` and `ProjectRecord` have different shapes but should represent the same entity. `ProjectRecord` has `path` and `workspaceId` that `Project` lacks.

### 6. Context Typing Issues
The `useChatPlugin.ts` expects React Context API (`Context` property) but uses function component (`FC`). This suggests:
- Incorrect API usage (should use `createContext`)
- Wrong type definition for the component

---

## Potential Solutions

### Solution 1: Update Domain Types (Recommended)

#### For Project type:
```typescript
// src/domain/types/project.ts
export interface Project {
  id: string;
  name: string;
  storageType: 'fsa' | 'indexeddb';
  workspaceBindings: WorkspaceBindings;
  createdAt: string;
  modifiedAt: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet'; // ADD THIS
}
```

#### For KnowledgeSource type:
```typescript
// src/domain/types/knowledge.ts
export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  keyConcepts?: string[]; // ADD THIS
  createdAt: string;
}
```

#### For WizardFormData type:
```typescript
// src/presentation/components/project/wizard-types.ts
export interface WizardFormData {
  projectName: string;
  storageType: 'fsa' | 'indexeddb';
  workspaceType?: 'webcontainer' | 'local'; // ADD THIS
  selectedAgent?: string; // ADD THIS
  agentPermissions?: Record<string, boolean>; // ADD THIS
  fileSetupEnabled?: boolean; // ADD THIS
  createGitignore?: boolean; // ADD THIS
}
```

**Pros**: Complete and consistent type system
**Cons**: Requires careful validation of all consumers

### Solution 2: Fix Omit/Access Contradiction

```typescript
// In ReviewStep.tsx
// WRONG: Omit then try to access
const bindings: Omit<WorkspaceBindings, 'knowledge' | 'study'> = ...;
console.log(bindings.knowledge); // ERROR

// CORRECT: Don't omit if you need the properties
const bindings: WorkspaceBindings = ...;
console.log(bindings.knowledge); // OK
```

**Pros**: Fixes logical contradiction
**Cons**: Need to understand why omit was there originally

### Solution 3: Complete NoteStoreState API

```typescript
// src/infrastructure/persistence/stores/note-store.ts
export interface NoteStoreState {
  notes: Map<string, NoteRecord>;
  activeNoteId: string | null;
  // ADD MISSING METHODS
  addNote: (note: NoteRecord) => Promise<void>;
  updateNote: (params: UpdateNoteParams) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}
```

**Pros**: Completes store API as expected by consumers
**Cons**: May require store refactoring

### Solution 4: Fix React Context Typing

```typescript
// src/plugins/chat/useChatPlugin.ts
// WRONG: Trying to use Context on FC
const ChatProvider = ({ children }: { children: ReactNode }) => {
  const context = ChatProvider.Context; // ERROR

// CORRECT: Use createContext
const ChatContext = createContext<ChatContextType | null>(null);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  const value = { /* ... */ };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
```

**Pros**: Correct React API usage
**Cons**: Requires refactoring context pattern

---

## Impact Assessment

**What breaks if this isn't fixed:**
- TypeScript compilation fails (20+ errors)
- Terminal plugin cannot access device type
- Canvas linkage analysis cannot use key concepts
- Project wizard will crash at runtime (missing properties)
- Note sync will fail (addNote missing)
- Chat plugin will fail to use context properly
- Project repository will fail to create records

**Priority**: P0 - Blocks multiple features and compilation

---

## Recommendation

**Recommended Action**:

1. **Immediate (Batch A - Domain Type Extensions)**:
   - Add `deviceType` to `Project` type
   - Add `keyConcepts` to `KnowledgeSource` type
   - Complete `WizardFormData` with missing properties

2. **Immediate (Batch B - Store API)**:
   - Add `addNote` to `NoteStoreState` interface
   - Implement `addNote` method in note store

3. **Immediate (Batch C - Context Fix)**:
   - Refactor `useChatPlugin.ts` to use proper React Context API
   - Fix `MobileIDELayout.tsx` to not pass `syncManagerRef` if it doesn't exist

4. **Short term**:
   - Review and update ADR-034 if type changes affect architecture
   - Update all type references across codebase

5. **Long term**:
   - Implement type validation tests to prevent incomplete types
   - Add type coverage to CI/CD

**Priority**: P0 (Critical)

**Estimated Effort**:
- Batch A: 2-3 hours
- Batch B: 2-3 hours
- Batch C: 2-3 hours
- Total: 6-9 hours

---

## References

**ADR**: ADR-034 (Project-Centric Architecture)
**Type Definitions**:
- `src/domain/types/project.ts` - Project type
- `src/domain/types/knowledge.ts` - KnowledgeSource type
- `src/domain/types/wizard.ts` - WizardFormData
- `src/infrastructure/persistence/stores/note-store.ts` - NoteStoreState

**Related Errors**:
- Batch 1: SDK type mismatches (markdown-sync, use-agent-chat-with-tools)
- Component errors (SettingsPanel, useIDEFileHandlers)

**File Links**:
- `src/plugins/terminal/TerminalPlugin.tsx` - Uses Project.deviceType
- `src/lib/canvas/linkage-analyzer.ts` - Uses KnowledgeSource.keyConcepts
- `src/presentation/components/project/steps/ReviewStep.tsx` - Uses WizardFormData properties
- `src/lib/notes/sync/cache-sync.ts` - Uses NoteStoreState.addNote
