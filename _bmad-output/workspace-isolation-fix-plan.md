# Workspace Isolation Fix - Implementation Plan

**Story:** PERSIST-S002
**Date:** 2026-01-06
**Severity:** P0 - CRITICAL
**Root Cause:** Database tables lack `workspaceId` field → Cross-workspace data leakage

## Problem Statement

User-reported issue: "File system sync broken across workspaces - when I choose my project folder nothing is loaded into notes"

**Root Cause:** All IndexedDB tables missing `workspaceId` foreign key
- Notes from Project A visible in Project B
- Conversations leak between IDE/Notes/Knowledge workspaces
- File metadata not isolated by workspace

## Workspace Architecture

```typescript
type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

## Solution Strategy

### Phase 1: Schema Changes (Day 1-2)

1. **Add workspaceId to ALL 25 tables**

Tables requiring workspaceId:
- Core: `projects`, `ideState`, `conversations`
- AI: `taskContexts`, `toolExecutions`, `credentials`, `threads`
- Persistence: `providerConfigs`, `agentConfigs`, `conversationState`, `ragState`
- Sync: `syncStatus`, `fileSyncStatus`, `fileMetadata`
- Session: `toolExecutionLogs`, `fsaHandles`, `sessionSnapshots`
- Files: `fileSnapshots`, `fileContentCache`
- Knowledge: `sources`, `collections`, `synthesisResults`, `oramaIndexes`, `embedding_models`, `notes`
- Workflow: `workflows`
- Plugins: `plugins`, `pluginSettings`, `pluginMarketplace`, `pluginStorage`

2. **Type Definition Updates**

For each record type, add:
```typescript
export interface ProjectRecord {
    id: string;
    name: string;
    path: string;
    workspaceId: WorkspaceType; // NEW
    lastOpened: Date;
    createdAt: Date;
    // ... rest
}
```

### Phase 2: Migration Script (Day 2-3)

```typescript
// Migration: Add workspaceId to all tables
// Version: 1 → 2

db.transaction('rw', db.tables, async () => {
  // Default strategy: Assign 'ide' workspace to existing records
  // This is SAFE because workspace switching will update workspaceId

  for (const table of db.tables) {
    const records = await table.toArray();
    for (const record of records) {
      if (!record.workspaceId) {
        await table.update(record.primaryKey, {
          workspaceId: 'ide' // Default workspace
        });
      }
    }
  }
});
```

### Phase 3: Query Updates (Day 3-4)

**Before:**
```typescript
// LEAKY - Returns records from ALL workspaces
const projects = await db.projects.toArray();
```

**After:**
```typescript
// ISOLATED - Returns only current workspace records
const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
const projects = await db.projects
  .where('workspaceId')
  .equals(currentWorkspace)
  .toArray();
```

### Phase 4: Workspace Switching Logic (Day 4)

When user switches workspaces:

1. Update `useWorkspaceStore(s => s.currentWorkspace)` to new workspace
2. **All queries automatically filter by new workspaceId**
3. UI shows only current workspace data

## Implementation Order

### Priority 1: Core Tables (P0)
1. `projects` - Project metadata
2. `conversations` - AI chat history
3. `fileMetadata` - File sync tracking
4. `syncStatus` - Sync state

### Priority 2: Workspace-Specific Tables (P1)
5. `ideState` - IDE workspace only
6. `sources` - Knowledge workspace only
7. `notes` - Notes workspace only

### Priority 3: Shared Tables (P1)
8. `credentials` - Shared across workspaces (user-level)
9. `providerConfigs` - Shared across workspaces (user-level)
10. `agentConfigs` - Workspace-specific

## Risk Mitigation

### Data Loss Prevention
- ✅ Migration adds field with DEFAULT value ('ide')
- ✅ No existing data deleted
- ✅ Backup created before migration

### Breaking Changes
- ⚠️ Requires redeploy of ALL code that queries Dexie
- ⚠️ TypeScript errors until all query sites updated

### Rollback Strategy
```typescript
// If migration fails, rollback:
db.version(1).stores({
  // Revert to schema without workspaceId
});
```

## Validation Checklist

- [ ] All 25 tables have workspaceId field
- [ ] Migration script tested
- [ ] All queries filter by workspaceId
- [ ] TypeScript compiles with 0 errors
- [ ] Cross-workspace leakage verified as FIXED
- [ ] Workspace switching works smoothly
- [ ] Mobile fallback still works (no null workspaceId)

## Estimated Timeline

- Phase 1 (Schema): 2 days
- Phase 2 (Migration): 1 day
- Phase 3 (Query Updates): 2-3 days
- Phase 4 (Testing): 1 day

**Total: 6-7 days**

## Next Actions

1. ✅ Create this plan
2. ⏳ Update type definitions (25 files)
3. ⏳ Write migration script
4. ⏳ Update all query sites (82+ occurrences)
5. ⏳ Test workspace isolation
6. ⏳ Deploy to production

---

**Status:** PLAN COMPLETE, READY FOR EXECUTION
**Created:** 2026-01-06
**Author:** BMAD Master Orchestrator
