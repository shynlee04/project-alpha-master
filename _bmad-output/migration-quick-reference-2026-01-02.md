# Migration Quick Reference Card - Via-gent Project

**Version**: 1.0
**Last Updated**: 2026-01-02
**Purpose**: Quick reference for developers working on TS-001, DB-001, UI-001 migrations

---

## 🚨 CRITICAL COMMANDS

```bash
# TypeScript error check
pnpm tsc --noEmit

# Count errors by file
pnpm tsc --noEmit 2>&1 | awk -F':' '{print $1}' | sort | uniq -c | sort -rn

# Run tests
pnpm test

# Dev server
pnpm dev

# Build
pnpm build
```

---

## 📊 ERROR PATTERNS & FIXES

### Pattern 1: Missing Exported Member
```
❌ ERROR: Module '"./dexie-db-core-types"' has no exported member 'WorkspaceBindings'.

✅ FIX: Add to src/infrastructure/persistence/dexie-db-core-types.ts:
   export interface WorkspaceBindings {
     workspaceId: string
     workspaceType: WorkspaceType
     // ...
   }
```

### Pattern 2: Cannot Find Module
```
❌ ERROR: Cannot find module './rag-store' or its corresponding type declarations.

✅ FIX: Update import in consuming file:
   // OLD: import { useRAGStore } from '@/lib/state/rag-store'
   // NEW: import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store'
```

### Pattern 3: Property Does Not Exist
```
❌ ERROR: Property 'fileSnapshots' does not exist on type 'ViaGentDatabase'.

✅ FIX: Add table to database class in src/infrastructure/persistence/dexie-db-class.ts:
   export class ViaGentDatabase extends Dexie {
     fileSnapshots!: Table<FileSnapshotRecord, string>

     constructor() {
       super('ViaGentDatabase')
       this.version(1).stores({
         fileSnapshots: 'id,createdAt,updatedAt',
         // ...
       })
     }
   }
```

### Pattern 4: Type Mismatch
```
❌ ERROR: Type '"idle"' is not assignable to type '"error" | "online" | "offline" | "busy"'.

✅ FIX: Update consuming code to use correct literal type:
   // OLD: const status: SyncStatus = 'idle'
   // NEW: const status: SyncStatus = 'offline' // or 'error', 'online', 'busy'
```

---

## 🗂️ FILE LOCATIONS

### Database (Dexie)
```
Modern:  src/infrastructure/persistence/dexie-db.ts
Legacy:  src/lib/state/dexie-db.ts (duplicate)

Modern:  src/infrastructure/persistence/dexie-db-class.ts
Legacy:  src/lib/state/dexie-db-class.ts (duplicate)

Modern:  src/infrastructure/persistence/dexie-storage.ts
Legacy:  src/lib/state/dexie-storage.ts (duplicate)

Migrations: src/infrastructure/persistence/dexie-db-migrations.ts
```

### Stores (Zustand)
```
Modern:  src/infrastructure/persistence/stores/
Legacy:  src/lib/state/
Deprecated: src/stores/ (empty)
```

### Agent Components
```
Dialog:        src/presentation/components/agent/AgentConfigDialog.tsx (299 lines)
Hooks:         src/presentation/components/agent/hooks/
Sub-components: src/presentation/components/agent/AgentConfigForm/
```

---

## 📏 SIZE LIMITS

**Components**: <120 lines (strictly enforced for new components)
**Hooks**: <120 lines (strictly enforced)
**Store Slices**: <120 lines (strictly enforced)
**Test Files**: No limit (focus on coverage)

**God Components** (>300 lines) - Need refactoring:
- AgentConfigDialog (299 lines) - UI-001 target
- WorkspacePermissionEditor (482 lines) - Phase 2 target
- ToolPermissionsConfig (402 lines) - Phase 2 target

---

## 🔁 SAFE REFACTORING PATTERNS

### Pattern 1: Facade Export (Zero Breaking Changes)
```typescript
// OLD FILE (deprecated but kept for compatibility)
// src/lib/state/dexie-db.ts

// Re-export from new location (facade pattern)
export {
  db,
  getDb,
  ViaGentDatabase,
  WorkspaceBindings,
  // ... all other exports
} from '@/infrastructure/persistence/dexie-db'

/**
 * @deprecated Use @/infrastructure/persistence/dexie-db instead
 * This file will be removed in v2.1.0
 */
```

### Pattern 2: Zustand Individual Selectors (Prevent Infinite Loops)
```typescript
// ❌ WRONG (causes infinite loops in Zustand v5)
const { providers, removeProvider } = useProviderStore()

// ✅ CORRECT (individual selectors)
const providers = useProviderStore(s => s.providers)
const removeProvider = useProviderStore(s => s.removeProvider)

// ✅ CORRECT (multiple properties with useShallow)
import { useShallow } from 'zustand/shallow'
const { providers, models } = useProviderStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
)
```

### Pattern 3: Cross-Slice Communication (Prevent Circular Dependencies)
```typescript
// ❌ WRONG (direct import causes circular dependency)
import { updateConversation } from './conversation-metadata-slice'

export const createThreadManagementSlice = (set, get) => ({
  createThread: (conversationId) => {
    updateConversation(conversationId, { hasThreads: true }) // Circular!
  }
})

// ✅ CORRECT (use get() for cross-slice calls)
export const createThreadManagementSlice = (set, get) => ({
  createThread: (conversationId) => {
    get().updateConversationMetadata(conversationId, { hasThreads: true })
  }
})
```

---

## 🧪 TESTING CHECKLIST

### Before Committing
- [ ] Run `pnpm tsc --noEmit` - Zero new errors
- [ ] Run `pnpm test` - All tests pass
- [ ] Manual test in browser - If UI change
- [ ] Check error count is reduced (not increased)

### For Database Changes
- [ ] Test migration with backup database
- [ ] Test rollback (downgrade migration)
- [ ] Verify data integrity after migration
- [ ] Test with large datasets (simulate quota)

### For Store Changes
- [ ] Test all store actions (create, read, update, delete)
- [ ] Test persistence (reload browser, verify data)
- [ ] Test hydration (verify store rehydrates correctly)
- [ ] Test cross-store communication (if applicable)

### For Component Changes
- [ ] Test all user flows (create, edit, delete, etc.)
- [ ] Test error states (validation errors, API errors)
- [ ] Test loading states (spinners, skeletons)
- [ ] Test accessibility (keyboard navigation, screen readers)

---

## 🚨 COMMON PITFALLS

### Pitfall 1: Breaking Imports Without Facade
```
❌ WRONG: Rename store without facade (breaks 20+ components)
export const useConversationStore = create<ConversationStore>(...)

✅ CORRECT: Create facade in old file (zero breaking changes)
// File: src/lib/state/conversation-store.ts
export { useConversationStore } from './infrastructure/persistence/stores/conversation'
```

### Pitfall 2: Destructuring Zustand Store (Infinite Loops)
```
❌ WRONG: Destructure entire store (Zustand v5 anti-pattern)
const { agents, providers } = useAppStore()

✅ CORRECT: Use individual selectors
const agents = useAppStore(s => s.agents)
const providers = useAppStore(s => s.providers)
```

### Pitfall 3: Data Loss During Migration
```
❌ WRONG: No backup before migration
await migrateToNewStore()
await deleteOldData() // Data loss if migration fails!

✅ CORRECT: Backup + verify + rollback
await backupIndexedDB('backup-' + Date.now())
try {
  await migrateToNewStore()
  await verifyMigration()
  await deleteOldData()
} catch (error) {
  await restoreBackup()
}
```

---

## 📋 MIGRATION CHECKLISTS

### TS-001 Checklist (6-8 hours)
- [ ] Fix `dexie-db.ts` exports (WorkspaceBindings, default export)
- [ ] Add missing tables to `ViaGentDatabase` (fileSnapshots, fileContentCache)
- [ ] Update 85 import paths to use `infrastructure/persistence`
- [ ] Fix migration result types (add `backupCreated` field)
- [ ] Fix test imports (vitest API)
- [ ] Remove unused `@ts-expect-error` directives
- [ ] Run `pnpm tsc --noEmit` - verify <100 errors

### DB-001 Checklist (18-22 hours)
- [ ] Create `quota-manager.ts` with unified eviction logic
- [ ] Add priority-based eviction policy (active > recent > old)
- [ ] Update all stores to use `createDexieStorage` with quota checks
- [ ] Add storage usage indicator to status bar
- [ ] Implement warnings at 75%, 90%, 95% capacity
- [ ] Create backup before eviction
- [ ] Add rollback mechanism
- [ ] Test with simulated quota errors (set low quota)
- [ ] Document eviction policy in user guide

### UI-001 Checklist (16-20 hours)
- [ ] Extract `AgentConfigBasicTab.tsx` (<80 lines)
- [ ] Extract `AgentConfigWorkspaceTab.tsx` (<90 lines)
- [ ] Extract `AgentConfigAdvancedTab.tsx` (<100 lines)
- [ ] Create `useAgentConfigDialog` orchestrator hook (<100 lines)
- [ ] Test all agent config flows (create, edit, delete, import, export)
- [ ] Test workspace bindings across all 4 workspaces (IDE, Knowledge, Notes, Study)
- [ ] Verify no behavior changes (compare screenshots, run integration tests)
- [ ] Update component documentation (JSDoc, props, usage examples)

---

## 🔗 USEFUL LINKS

### Documentation
- Project Context: `_bmad-output/project-context-migration-assessment-2026-01-02.md`
- Dependency Graph: `_bmad-output/dependency-graph-analysis-2026-01-02.md`
- Decision Summary: `_bmad-output/migration-decision-making-summary-2026-01-02.md`
- Error Log: `_bmad-output/ts-error-log-sample-2026-01-02.txt`

### External References
- Zustand v5 Docs: https://zustand.docs.pmnd.rs/
- Dexie.js Docs: https://dexie.org/
- TypeScript Docs: https://www.typescriptlang.org/docs/

---

## 💡 TIPS & TRICKS

### Incremental Validation
```bash
# Run TypeScript check after every few changes
pnpm tsc --noEmit 2>&1 | grep "^src" | wc -l  # Count errors by file

# Focus on one file at a time
pnpm tsc --noEmit 2>&1 | grep "dexie-db.ts"  # Show errors for specific file
```

### Safe Imports
```typescript
// Use type-only imports when possible (reduces circular dependency risk)
import type { Agent } from '@/core/entities/Agent'

// Use lazy imports for heavy dependencies
const { HeavyComponent } = await import('./HeavyComponent')
```

### Debugging Zustand
```typescript
// Enable Zustand devtools
import { devtools } from 'zustand/middleware'

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({ ... }),
    { name: 'AppStore' }  // Shows in Redux DevTools
  )
)
```

---

## 🆘 EMERGENCY PROCEDURES

### If TypeScript Errors Increase
1. Revert last change: `git reset --hard HEAD`
2. Check error count: `pnpm tsc --noEmit 2>&1 | grep -c "error TS"`
3. Review change with team
4. Make smaller incremental changes

### If Tests Fail After Refactoring
1. Identify failing tests: `pnpm test --reporter=verbose`
2. Check if test needs update (import path, mock)
3. Check if implementation changed (behavior regression)
4. Fix implementation (not test) if behavior changed unintentionally

### If Data Loss Occurs (IndexedDB)
1. STOP - Don't write any more data
2. Check if backup exists: `indexedDB.databases()`
3. Restore from backup: `_bmad-output/backup/`
4. Investigate root cause (quota error? migration bug?)
5. Fix issue before proceeding

### If Infinite Loop Detected (Zustand)
1. Check for destructuring pattern: `const { x, y } = useStore()`
2. Replace with individual selectors: `const x = useStore(s => s.x)`
3. Check for circular dependencies in slices
4. Use `useShallow` for multiple properties

---

## 📞 CONTACTS

**Tech Lead**: [Insert contact]
**Senior Developer**: [Insert contact]
**QA Engineer**: [Insert contact]

**Emergency Channel**: [Insert Slack/Discord/Teams channel]

---

## 📝 CHANGE LOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-02 | Initial version (TS-001, DB-001, UI-001) |

---

**END OF QUICK REFERENCE**

**Print this document and keep it handy during migration work!**
