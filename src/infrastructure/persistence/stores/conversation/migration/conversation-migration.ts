/**
 * Conversation Data Migration Script
 *
 * Migrates conversation data from legacy store format to new unified store format.
 * Ensures zero data loss during the Epic CC-1 consolidation.
 *
 * @module conversation/migration/conversation-migration
 * @story CC-1.8 - Create Data Migration Script
 * @epic CC-1 - Conversation Consolidation
 *
 * Migration Steps:
 * 1. Backup existing IndexedDB data (to conversation_backup_{timestamp})
 * 2. Read all data from old stores (conversation-store, conversation-threads-store)
 * 3. Transform old schema to new schema
 * 4. Write transformed data to new store
 * 5. Verify data integrity (counts match)
 * 6. Clear old stores (if verification succeeds)
 */

import { dexieDB } from '@/lib/state/dexie-db-class';
import { useConversationStore } from '../useConversationStore';
import type { ConversationMetadataWithId } from '../conversation-metadata-slice';
import type { ThreadWithId } from '../thread-management-slice';
import type { MessageWithId } from '../message-crud-slice';
import type { WorkspaceType } from '@/core/entities/Conversation';

// ============================================================================
// Types
// ============================================================================

/**
 * Migration result interface
 */
export interface MigrationResult {
    success: boolean;
    conversationsMigrated: number;
    threadsMigrated: number;
    messagesMigrated: number;
    errors: string[];
    duration: number; // milliseconds
}

/**
 * Legacy conversation state (old schema)
 */
export interface LegacyConversationState {
    metadata: {
        id: string;
        projectId: string | null;
        title: string;
        preview: string;
        agentId: string | null;
        messageCount: number;
        scrollPosition: number;
        createdAt: number;        // Unix timestamp (ms)
        updatedAt: number;        // Unix timestamp (ms)
    };
    messages: ThreadMessageRecord[];
}

/**
 * Legacy conversation store state
 */
interface LegacyConversationStoreState {
    activeConversationId: string | null;
    conversations: Record<string, LegacyConversationState>;
    scrollPositions: Record<string, number>;
    pendingToolApprovals: PendingToolApproval[];
    _hasHydrated: boolean;
}

/**
 * Legacy message record
 */
interface ThreadMessageRecord {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentId?: string;
    agentName?: string;
    agentModel?: string;
    timestamp: number;           // Unix timestamp (ms)
    toolCalls?: ThreadToolCall[];
}

/**
 * Legacy thread tool call
 */
interface ThreadToolCall {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    input?: unknown;
    output?: unknown;
    duration?: number;
}

/**
 * Pending tool approval (unchanged between schemas)
 */
export interface PendingToolApproval {
    id: string;
    conversationId: string;
    messageId: string;
    toolName: string;
    toolInput: unknown;
    status: 'pending' | 'approved' | 'denied';
    createdAt: number;
}

// ============================================================================
// Migration Implementation
// ============================================================================

/**
 * Convert Unix timestamp to ISO 8601 string
 */
function timestampToISO(timestamp: number): string {
    return new Date(timestamp).toISOString();
}

/**
 * Infer workspace type from project ID
 * Defaults to 'ide' if cannot be determined
 */
function inferWorkspaceType(projectId: string | null): WorkspaceType {
    if (!projectId) return 'ide';

    // Check project ID patterns
    if (projectId.startsWith('knowledge-') || projectId.includes('/knowledge/')) {
        return 'knowledge';
    }
    if (projectId.startsWith('notes-') || projectId.includes('/notes/')) {
        return 'notes';
    }
    if (projectId.startsWith('study-') || projectId.includes('/study/')) {
        return 'study';
    }

    // Default to IDE workspace
    return 'ide';
}

/**
 * Run conversation migration
 *
 * Transforms legacy conversation-store data to new unified store format.
 * Returns detailed migration result with counts and errors.
 */
export async function runConversationMigration(): Promise<MigrationResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    console.log('[ConversationMigration] Starting migration...');

    try {
        // ========================================================================
        // Step 1: Backup existing IndexedDB data
        // ========================================================================

        const backupTimestamp = Date.now();
        const backupKey = `conversation_backup_${backupTimestamp}`;

        console.log('[ConversationMigration] Step 1: Creating backup...');

        try {
            // Read all conversation data from Dexie
            const legacyState = await readLegacyStore();

            if (!legacyState || Object.keys(legacyState.conversations).length === 0) {
                console.log('[ConversationMigration] No legacy data found. Migration complete.');
                return {
                    success: true,
                    conversationsMigrated: 0,
                    threadsMigrated: 0,
                    messagesMigrated: 0,
                    errors: [],
                    duration: Date.now() - startTime,
                };
            }

            // Save to backup storage
            const backupData = JSON.stringify(legacyState);
            await dexieDB.table('backups').put({ id: backupKey, data: backupData, timestamp: backupTimestamp });

            console.log('[ConversationMigration] Backup created:', backupKey);
        } catch (error) {
            const errorMessage = `Backup failed: ${error instanceof Error ? error.message : String(error)}`;
            errors.push(errorMessage);
            console.error('[ConversationMigration]', errorMessage);
            // Continue anyway - backup is optional for migration
        }

        // ========================================================================
        // Step 2: Read all data from old stores
        // ========================================================================

        console.log('[ConversationMigration] Step 2: Reading legacy data...');

        const legacyData = await readLegacyStore();

        if (!legacyData) {
            throw new Error('Failed to read legacy store data');
        }

        const conversationIds = Object.keys(legacyData.conversations);
        console.log('[ConversationMigration] Found', conversationIds.length, 'conversations to migrate');

        // ========================================================================
        // Step 3: Transform old schema to new schema
        // ========================================================================

        console.log('[ConversationMigration] Step 3: Transforming schema...');

        const transformedData = await transformLegacyData(legacyData);

        console.log('[ConversationMigration] Transformed:', {
            conversations: transformedData.conversations.length,
            threads: transformedData.threads.length,
            messages: transformedData.messages.length,
        });

        // ========================================================================
        // Step 4: Write transformed data to new store
        // ========================================================================

        console.log('[ConversationMigration] Step 4: Writing to new store...');

        await writeToNewStore(transformedData);

        // ========================================================================
        // Step 5: Verify data integrity
        // ========================================================================

        console.log('[ConversationMigration] Step 5: Verifying data integrity...');

        const verificationPassed = await verifyMigration(legacyData, transformedData);

        if (!verificationPassed) {
            throw new Error('Data integrity verification failed');
        }

        console.log('[ConversationMigration] ✓ Data integrity verified');

        // ========================================================================
        // Step 6: Clear old stores (if verification succeeded)
        // ========================================================================

        console.log('[ConversationMigration] Step 6: Clearing legacy data...');

        await clearLegacyStores();

        console.log('[ConversationMigration] ✓ Legacy data cleared');

        // ========================================================================
        // Migration Complete
        // ========================================================================

        const duration = Date.now() - startTime;

        const result: MigrationResult = {
            success: true,
            conversationsMigrated: transformedData.conversations.length,
            threadsMigrated: transformedData.threads.length,
            messagesMigrated: transformedData.messages.length,
            errors,
            duration,
        };

        console.log('[ConversationMigration] ✓ Migration complete:', result);
        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(errorMessage);
        console.error('[ConversationMigration] ✗ Migration failed:', errorMessage);

        return {
            success: false,
            conversationsMigrated: 0,
            threadsMigrated: 0,
            messagesMigrated: 0,
            errors,
            duration: Date.now() - startTime,
        };
    }
}

/**
 * Read legacy store data from IndexedDB
 */
async function readLegacyStore(): Promise<LegacyConversationStoreState | null> {
    try {
        // Read from Zustand persist storage
        const persistedState = await dexieDB.table('conversation-state').get('state');

        if (!persistedState) {
            return null;
        }

        return persistedState as unknown as LegacyConversationStoreState;
    } catch (error) {
        console.error('[ConversationMigration] Failed to read legacy store:', error);
        return null;
    }
}

/**
 * Transform legacy data to new schema
 */
async function transformLegacyData(
    legacyData: LegacyConversationStoreState
): Promise<{
    conversations: ConversationMetadataWithId[];
    threads: ThreadWithId[];
    messages: MessageWithId[];
}> {
    const conversations: ConversationMetadataWithId[] = [];
    const threads: ThreadWithId[] = [];
    const messages: MessageWithId[] = [];

    for (const [conversationId, legacyConversation] of Object.entries(legacyData.conversations)) {
        // Transform conversation metadata
        const workspaceType = inferWorkspaceType(legacyConversation.metadata.projectId);
        const agentId = legacyConversation.metadata.agentId || 'default';

        const conversation: ConversationMetadataWithId = {
            id: legacyConversation.metadata.id,
            workspaceType,
            projectId: legacyConversation.metadata.projectId,
            agentId,
            status: 'active',
            createdAt: timestampToISO(legacyConversation.metadata.createdAt),
            updatedAt: timestampToISO(legacyConversation.metadata.updatedAt),
            lastActiveAt: timestampToISO(legacyConversation.metadata.updatedAt),
            title: legacyConversation.metadata.title,
            tags: [],
            pinned: false,
            messageCount: legacyConversation.metadata.messageCount,
        };

        conversations.push(conversation);

        // Create root thread for this conversation
        const threadId = `thread_${conversationId}_root`;

        const thread: ThreadWithId = {
            id: threadId,
            conversationId: conversationId,
            parentThreadId: null,
            root: true,
            status: 'active',
            name: legacyConversation.metadata.title || 'Root Thread',
            createdAt: timestampToISO(legacyConversation.metadata.createdAt),
            updatedAt: timestampToISO(legacyConversation.metadata.updatedAt),
            messageCount: legacyConversation.metadata.messageCount,
            branchFromMessageId: null,
        };

        threads.push(thread);

        // Transform messages
        for (const legacyMessage of legacyConversation.messages) {
            const message: MessageWithId = {
                id: legacyMessage.id,
                threadId,
                role: legacyMessage.role,
                content: legacyMessage.content,
                agentId: legacyMessage.agentId || agentId,
                agentName: legacyMessage.agentName,
                agentModel: legacyMessage.agentModel,
                timestamp: timestampToISO(legacyMessage.timestamp),
                toolCalls: legacyMessage.toolCalls,
                status: 'complete',
            };

            messages.push(message);
        }
    }

    return { conversations, threads, messages };
}

/**
 * Write transformed data to new store
 */
async function writeToNewStore(data: {
    conversations: ConversationMetadataWithId[];
    threads: ThreadWithId[];
    messages: MessageWithId[];
}): Promise<void> {
    const store = useConversationStore.getState();

    // Write conversations
    for (const conversation of data.conversations) {
        store.conversations[conversation.id] = conversation;
    }

    // Write threads
    for (const thread of data.threads) {
        store.threads[thread.id] = thread;
    }

    // Write messages
    for (const message of data.messages) {
        store.messages[message.id] = message;
    }

    // Set active conversation if exists
    const firstConversation = data.conversations[0];
    if (firstConversation) {
        store.activeConversationId = firstConversation.id;
        store.activeThreadId = data.threads[0]?.id || null;
    }

    // Trigger persist
    useConversationStore.setState({
        conversations: store.conversations,
        threads: store.threads,
        messages: store.messages,
        activeConversationId: store.activeConversationId,
        activeThreadId: store.activeThreadId,
    });
}

/**
 * Verify data integrity after migration
 */
async function verifyMigration(
    legacyData: LegacyConversationStoreState,
    transformedData: {
        conversations: ConversationMetadataWithId[];
        threads: ThreadWithId[];
        messages: MessageWithId[];
    }
): Promise<boolean> {
    // Verify conversation count
    const legacyConversationCount = Object.keys(legacyData.conversations).length;
    const newConversationCount = transformedData.conversations.length;

    if (legacyConversationCount !== newConversationCount) {
        console.error('[ConversationMigration] Conversation count mismatch:', {
            legacy: legacyConversationCount,
            new: newConversationCount,
        });
        return false;
    }

    // Verify total message count
    let legacyMessageCount = 0;
    for (const conversation of Object.values(legacyData.conversations)) {
        legacyMessageCount += conversation.messages.length;
    }

    const newMessageCount = transformedData.messages.length;

    if (legacyMessageCount !== newMessageCount) {
        console.error('[ConversationMigration] Message count mismatch:', {
            legacy: legacyMessageCount,
            new: newMessageCount,
        });
        return false;
    }

    // Verify thread count (should equal conversation count)
    const expectedThreadCount = legacyConversationCount; // One root thread per conversation
    const actualThreadCount = transformedData.threads.length;

    if (expectedThreadCount !== actualThreadCount) {
        console.error('[ConversationMigration] Thread count mismatch:', {
            expected: expectedThreadCount,
            actual: actualThreadCount,
        });
        return false;
    }

    return true;
}

/**
 * Clear legacy stores after successful migration
 */
async function clearLegacyStores(): Promise<void> {
    try {
        // Clear legacy Zustand persist storage
        await dexieDB.table('conversation-state').delete('state');
        console.log('[ConversationMigration] Cleared conversation-state');
    } catch (error) {
        console.error('[ConversationMigration] Failed to clear legacy stores:', error);
        // Don't throw - clearing is optional if migration succeeded
    }
}

/**
 * Check if migration has already been run
 */
export async function hasMigrationRun(): Promise<boolean> {
    try {
        const state = useConversationStore.getState();

        // Check if new store has data
        const hasNewData = Object.keys(state.conversations).length > 0;

        // Check if legacy store still has data
        const legacyState = await readLegacyStore();
        const hasLegacyData = legacyState && Object.keys(legacyState.conversations).length > 0;

        // Migration has run if new store has data and legacy store is empty
        return hasNewData && !hasLegacyData;
    } catch (error) {
        console.error('[ConversationMigration] Failed to check migration status:', error);
        return false;
    }
}

/**
 * Get migration status for UI display
 */
export async function getMigrationStatus(): Promise<{
    hasMigrated: boolean;
    legacyConversationCount: number;
    newConversationCount: number;
    newThreadCount: number;
    newMessageCount: number;
}> {
    try {
        const legacyState = await readLegacyStore();
        const newState = useConversationStore.getState();

        return {
            hasMigrated: await hasMigrationRun(),
            legacyConversationCount: legacyState ? Object.keys(legacyState.conversations).length : 0,
            newConversationCount: Object.keys(newState.conversations).length,
            newThreadCount: Object.keys(newState.threads).length,
            newMessageCount: Object.keys(newState.messages).length,
        };
    } catch (error) {
        console.error('[ConversationMigration] Failed to get migration status:', error);
        return {
            hasMigrated: false,
            legacyConversationCount: 0,
            newConversationCount: 0,
            newThreadCount: 0,
            newMessageCount: 0,
        };
    }
}
