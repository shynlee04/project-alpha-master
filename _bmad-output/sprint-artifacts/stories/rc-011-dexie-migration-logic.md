# Story: RC-011 - Dexie Migration Logic

**Story ID:** rc-011-dexie-migration-logic
**Sprint:** 27B
**Priority:** HIGH (HIGH-008)
**Status:** ready-for-dev
**Estimated Points:** 8
**Owner:** Team A

## Issue Description

The Dexie database in `src/lib/state/dexie-db.ts` has empty upgrade functions (version 1 schema is defined but migrations are not implemented). This means:
- Schema changes cannot be deployed safely
- User data from previous versions cannot be migrated
- Downgrade scenarios are not handled

## Root Cause

The Dexie schema was scaffolded during Epic 2 but migration logic was not implemented. The Ralph Loop validation identified this as a HIGH priority gap.

## Acceptance Criteria

1. [ ] Dexie upgrade function v1 implements full schema:
   - `agents` table with indexes (id, name, provider)
   - `conversations` table with indexes (id, agentId, updatedAt)
   - `messages` table with indexes (id, conversationId, createdAt)
   - `credentials` table with encrypted data
   - `syncStatus` table (for RC-005)
2. [ ] Migration v1 handles:
   - Conversion from localStorage to Dexie (legacy data)
   - Renaming of tables if schema evolved
   - Index creation on existing data
3. [ ] Backup before migration (optional, for critical migrations)
4. [ ] Logging of migration progress and errors
5. [ ] Tests cover: schema creation, data migration, index validation (20+ tests)

## Technical Approach

```typescript
// Dexie with migrations
class ProjectDatabase extends Dexie {
  agents!: Table<AgentRecord, string>;
  conversations!: Table<ConversationRecord, string>;
  messages!: Table<MessageRecord, string>;
  credentials!: Table<CredentialRecord, string>;
  syncStatus!: Table<SyncStatusRecord, string>;

  constructor(dbName: string) {
    super(dbName);

    // Version 1 schema with migration
    this.version(1).stores({
      agents: 'id, name, provider, &providerAgentId',
      conversations: 'id, agentId, updatedAt',
      messages: 'id, conversationId, createdAt',
      credentials: 'id, provider', // Encrypted payload
      syncStatus: 'id, filePath, syncStatus, lastSyncedAt',
    });

    // Migration handlers
    this.version(1).upgrade(async (tx) => {
      const log = migrateLogger('Dexie v1 migration');

      try {
        // Migrate agents from localStorage
        const agentsStore = tx.table('agents');
        const legacyAgents = await migrateFromLocalStorage('useAgentsStore');

        for (const agent of legacyAgents) {
          await agentsStore.put({
            ...agent,
            id: agent.id || generateId(),
            createdAt: agent.createdAt || Date.now(),
            updatedAt: Date.now(),
          });
        }

        log.info(`Migrated ${legacyAgents.length} agents`);

        // Similar migration for conversations, messages...

      } catch (error) {
        log.error('Migration failed', error);
        throw error;
      }
    });
  }
}
```

## Dependencies

- `src/lib/state/dexie-db.ts` - Database implementation
- `src/lib/state/sync-status-store.ts` - For syncStatus table
- RC-005 (Dexie migration) - Related store migration

## Files to Modify

- `src/lib/state/dexie-db.ts` - Implement migration logic
- `src/lib/state/__tests__/dexie-db.test.ts` - Add migration tests

## Files to Create

- `src/lib/state/migrations/local-storage-migrator.ts` - Legacy data migration utility

## Test Strategy

1. **Schema Tests**: Tables and indexes created correctly
2. **Migration Tests**: localStorage data converts to Dexie format
3. **Integrity Tests**: Data consistency after migration
4. **Error Tests**: Migration failures handled gracefully
5. **Index Tests**: Queries work correctly on migrated data

## Definition of Done

- [ ] All AC satisfied
- [ ] 20+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with all Dexie stores
- [ ] sprint-status.yaml updated

## Notes

Migration should be idempotent - running it multiple times should produce the same result.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
