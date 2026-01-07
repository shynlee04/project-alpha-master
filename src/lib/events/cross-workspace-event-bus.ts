/**
 * @fileoverview Cross-Workspace Event Bus
 * @module lib/events/cross-workspace-event-bus
 * @governance WB-8.3
 * @story WB-8.3: Cross-Workspace Event System
 *
 * Broadcasts events across workspace boundaries (IDE, Notes, Study, Knowledge).
 * Fixes critical gap where workspaces operate in isolation without state synchronization.
 *
 * @example
 * ```ts
 * import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus'
 *
 * // Emit file change event
 * crossWorkspaceEventBus.emitFileChange({
 *     workspaceId: 'ide',
 *     projectPath: '/Users/.../project-alpha',
 *     filePath: 'src/App.tsx',
 *     changeType: 'modified'
 * })
 *
 * // Listen to file changes
 * crossWorkspaceEventBus.onFileChange((event) => {
 *     console.log('File changed in another workspace:', event)
 * })
 * ```
 */

import EventEmitter3 from 'eventemitter3';
import type { WorkspaceType } from '@/core/entities/Workspace';

// ============================================================================
// Types
// ============================================================================

/**
 * Workspace identifiers
 */
export type WorkspaceId = WorkspaceType;

/**
 * File change event payload
 */
export interface FileChangeEvent {
    workspaceId: WorkspaceId
    projectPath: string
    filePath: string
    changeType: 'created' | 'modified' | 'deleted'
    timestamp: Date
}

/**
 * Agent configuration change event
 */
export interface AgentConfigChangeEvent {
    workspaceId: WorkspaceId
    agentId: string
    changeType: 'created' | 'updated' | 'deleted'
    timestamp: Date
}

/**
 * Sync status event
 */
export interface SyncStatusEvent {
    workspaceId: WorkspaceId
    projectPath: string
    status: 'syncing' | 'synced' | 'error'
    error?: string
    timestamp: Date
}

/**
 * Project state change event
 */
export interface ProjectStateChangeEvent {
    workspaceId: WorkspaceId
    projectId: string
    changeType: 'opened' | 'closed' | 'bindings-changed'
    timestamp: Date
}

/**
 * Workspace change event
 *
 * Emitted when user switches between workspaces (IDE → Knowledge, etc.)
 * Stores and components can react to workspace transitions (e.g., filter data, update UI).
 */
export interface WorkspaceChangeEvent {
    /** Previous workspace */
    from: WorkspaceId
    /** New workspace */
    to: WorkspaceId
    timestamp: string
}

/**
 * Provider configuration change event
 *
 * Emitted when LLM provider configuration is updated (API key saved, etc.)
 * Other workspaces can refresh their provider models/configuration.
 */
export interface ProviderConfigChangeEvent {
    workspaceId: WorkspaceId
    providerId: string
    changeType: 'credentials_updated' | 'provider_added' | 'provider_removed' | 'config_updated'
    timestamp: Date
}

/**
 * Models updated event
 *
 * Emitted when available models list is refreshed for a provider.
 * Other workspaces can update their model selectors.
 */
export interface ModelsUpdatedEvent {
    workspaceId: WorkspaceId
    providerId: string
    models: any[] // ModelInfo[] but avoiding import
    timestamp: Date
}

/**
 * Chat message sent event
 *
 * Emitted when user sends a message in any workspace.
 * Other workspaces can track activity, update unread counts, or sync state.
 *
 * @story E1-5 - Wire Up Cross-Workspace Event Bus
 */
export interface ChatMessageSentEvent {
    /** Workspace where message was sent */
    workspaceId: WorkspaceId
    /** Project ID (if applicable) */
    projectId: string | null
    /** Agent ID used for chat */
    agentId: string | null
    /** Message content preview (truncated for logging) */
    messagePreview: string
    /** Full message length */
    messageLength: number
    /** Conversation ID (if in a conversation) */
    conversationId: string | null
    /** Timestamp */
    timestamp: Date
}

/**
 * Chat state update event
 *
 * Emitted when conversation state changes in any workspace.
 * Enables real-time sync of chat state across all workspaces.
 *
 * @story E1-7 - Chat State Sharing Between Workspaces
 */
export interface ChatStateUpdateEvent {
    /** Workspace where state changed */
    workspaceId: WorkspaceId
    /** Project ID (if applicable) */
    projectId: string | null
    /** Conversation ID that was updated */
    conversationId: string
    /** Type of state change */
    updateType: 'message_added' | 'message_updated' | 'thread_created' | 'conversation_updated'
    /** Associated data (message ID, thread ID, etc.) */
    data: {
        messageId?: string
        threadId?: string
        messageContent?: string
    }
    /** Timestamp */
    timestamp: Date
}

// ============================================================================
// Event Bus Class
// ============================================================================

/**
 * Cross-workspace event bus for broadcasting state changes
 *
 * Uses EventEmitter3 for reliable event emission across workspace boundaries.
 * All workspaces subscribe to relevant events and react to changes from other workspaces.
 *
 * @governance WB-8.3
 */
class CrossWorkspaceEventBus extends EventEmitter3 {
    // ========================================================================
    // Event Names
    // ========================================================================

    private static readonly EVENTS = {
        FILE_CHANGE: 'file:change',
        AGENT_CONFIG_CHANGE: 'agent:config:change',
        SYNC_STATUS: 'sync:status',
        PROJECT_STATE_CHANGE: 'project:state:change',
        WORKSPACE_CHANGED: 'workspace:changed',
        PROVIDER_CONFIG_CHANGE: 'provider:config:change',
        MODELS_UPDATED: 'models:updated',
        CHAT_MESSAGE_SENT: 'chat:message:sent',
        CHAT_STATE_UPDATE: 'chat:state:update',
    } as const;

    // ========================================================================
    // File Change Events
    // ========================================================================

    /**
     * Emit file change event to all workspaces
     *
     * Called when a file is created, modified, or deleted in any workspace.
     * Other workspaces can react (e.g., reload file tree, invalidate cache).
     */
    emitFileChange(event: Omit<FileChangeEvent, 'timestamp'>): void {
        const fullEvent: FileChangeEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] File change:', fullEvent);
        this.emit(CrossWorkspaceEventBus.EVENTS.FILE_CHANGE, fullEvent);
    }

    /**
     * Subscribe to file change events
     *
     * Use this to react to file changes from other workspaces.
     *
     * @example
     * ```ts
     * crossWorkspaceEventBus.onFileChange((event) => {
     *     if (event.workspaceId !== 'ide') {
     *         // File changed in another workspace, reload local cache
     *         invalidateFileCache(event.filePath)
     *     }
     * })
     * ```
     */
    onFileChange(listener: (event: FileChangeEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.FILE_CHANGE, listener);
    }

    /**
     * Unsubscribe from file change events
     */
    offFileChange(listener: (event: FileChangeEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.FILE_CHANGE, listener);
    }

    // ========================================================================
    // Agent Configuration Events
    // ========================================================================

    /**
     * Emit agent configuration change event
     *
     * Called when agent config is created, updated, or deleted.
     * Other workspaces can reload their agent lists/selector UIs.
     */
    emitAgentConfigChange(event: Omit<AgentConfigChangeEvent, 'timestamp'>): void {
        const fullEvent: AgentConfigChangeEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Agent config change:', fullEvent);
        this.emit(CrossWorkspaceEventBus.EVENTS.AGENT_CONFIG_CHANGE, fullEvent);
    }

    /**
     * Subscribe to agent configuration changes
     *
     * Use this to reload agent configurations when changed from other workspaces.
     */
    onAgentConfigChange(listener: (event: AgentConfigChangeEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.AGENT_CONFIG_CHANGE, listener);
    }

    /**
     * Unsubscribe from agent configuration changes
     */
    offAgentConfigChange(listener: (event: AgentConfigChangeEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.AGENT_CONFIG_CHANGE, listener);
    }

    // ========================================================================
    // Sync Status Events
    // ========================================================================

    /**
     * Emit sync status event
     *
     * Called when file sync starts, completes, or fails.
     * Other workspaces can show sync progress/status indicators.
     */
    emitSyncStatus(event: Omit<SyncStatusEvent, 'timestamp'>): void {
        const fullEvent: SyncStatusEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Sync status:', fullEvent);
        this.emit(CrossWorkspaceEventBus.EVENTS.SYNC_STATUS, fullEvent);
    }

    /**
     * Subscribe to sync status events
     */
    onSyncStatus(listener: (event: SyncStatusEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.SYNC_STATUS, listener);
    }

    /**
     * Unsubscribe from sync status events
     */
    offSyncStatus(listener: (event: SyncStatusEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.SYNC_STATUS, listener);
    }

    // ========================================================================
    // Project State Events
    // ========================================================================

    /**
     * Emit project state change event
     *
     * Called when project is opened/closed or workspace bindings change.
     * Other workspaces can update their project lists/binding UIs.
     */
    emitProjectStateChange(event: Omit<ProjectStateChangeEvent, 'timestamp'>): void {
        const fullEvent: ProjectStateChangeEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Project state change:', fullEvent);
        this.emit(CrossWorkspaceEventBus.EVENTS.PROJECT_STATE_CHANGE, fullEvent);
    }

    /**
     * Subscribe to project state changes
     */
    onProjectStateChange(listener: (event: ProjectStateChangeEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.PROJECT_STATE_CHANGE, listener);
    }

    /**
     * Unsubscribe from project state changes
     */
    offProjectStateChange(listener: (event: ProjectStateChangeEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.PROJECT_STATE_CHANGE, listener);
    }

    // ========================================================================
    // Workspace Change Events
    // ========================================================================

    /**
     * Emit workspace change event
     *
     * Called when user switches between workspaces (e.g., IDE → Knowledge).
     * Other stores can filter data, update UI state, or reload configurations.
     */
    emitWorkspaceChanged(event: WorkspaceChangeEvent): void {
        console.log('[CrossWorkspaceEventBus] Workspace changed:', event);
        this.emit(CrossWorkspaceEventBus.EVENTS.WORKSPACE_CHANGED, event);
    }

    /**
     * Subscribe to workspace change events
     *
     * Use this to react when the user switches workspaces.
     *
     * @example
     * ```ts
     * crossWorkspaceEventBus.onWorkspaceChanged((event) => {
     *   console.log(`User switched from ${event.from} to ${event.to}`);
     *   // Filter agents for new workspace
     *   // Update active project
     *   // Reload workspace-specific configuration
     * })
     * ```
     */
    onWorkspaceChanged(listener: (event: WorkspaceChangeEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.WORKSPACE_CHANGED, listener);
    }

    /**
     * Unsubscribe from workspace change events
     */
    offWorkspaceChanged(listener: (event: WorkspaceChangeEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.WORKSPACE_CHANGED, listener);
    }

    // ========================================================================
    // Provider Configuration Events
    // ========================================================================

    /**
     * Emit provider configuration change event
     *
     * Called when provider API key is saved or provider config is updated.
     * Other workspaces can refresh their provider models.
     */
    emitProviderConfigChange(event: Omit<ProviderConfigChangeEvent, 'timestamp'>): void {
        const fullEvent: ProviderConfigChangeEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Provider config change:', fullEvent);
        this.emit(CrossWorkspaceEventBus.EVENTS.PROVIDER_CONFIG_CHANGE, fullEvent);
    }

    /**
     * Subscribe to provider configuration changes
     *
     * Use this to refresh provider models when configuration changes in other workspaces.
     */
    onProviderConfigChange(listener: (event: ProviderConfigChangeEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.PROVIDER_CONFIG_CHANGE, listener);
    }

    /**
     * Unsubscribe from provider configuration changes
     */
    offProviderConfigChange(listener: (event: ProviderConfigChangeEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.PROVIDER_CONFIG_CHANGE, listener);
    }

    /**
     * Emit models updated event
     *
     * Called when available models list is fetched/updated for a provider.
     * Other workspaces can update their model selectors.
     */
    emitModelsUpdated(event: Omit<ModelsUpdatedEvent, 'timestamp'>): void {
        const fullEvent: ModelsUpdatedEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Models updated:', fullEvent);
        this.emit(CrossWorkspaceEventBus.EVENTS.MODELS_UPDATED, fullEvent);
    }

    /**
     * Subscribe to models updated events
     *
     * Use this to update model selectors when models are fetched in other workspaces.
     */
    onModelsUpdated(listener: (event: ModelsUpdatedEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.MODELS_UPDATED, listener);
    }

    /**
     * Unsubscribe from models updated events
     */
    offModelsUpdated(listener: (event: ModelsUpdatedEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.MODELS_UPDATED, listener);
    }

    // ========================================================================
    // Chat Message Events
    // ========================================================================

    /**
     * Emit chat message sent event
     *
     * Called when user sends a message in any workspace.
     * Other workspaces can track activity, update unread counts, or sync chat state.
     *
     * @story E1-5 - Wire Up Cross-Workspace Event Bus
     */
    emitChatMessageSent(event: Omit<ChatMessageSentEvent, 'timestamp'>): void {
        const fullEvent: ChatMessageSentEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Chat message sent:', {
            workspaceId: fullEvent.workspaceId,
            agentId: fullEvent.agentId,
            messagePreview: fullEvent.messagePreview,
            messageLength: fullEvent.messageLength,
        });
        this.emit(CrossWorkspaceEventBus.EVENTS.CHAT_MESSAGE_SENT, fullEvent);
    }

    /**
     * Subscribe to chat message sent events
     *
     * Use this to track chat activity from other workspaces.
     *
     * @example
     * ```ts
     * crossWorkspaceEventBus.onChatMessageSent((event) => {
     *     if (event.workspaceId !== currentWorkspace) {
     *         // Message sent in another workspace
     *         updateUnreadCount(event.conversationId)
     *     }
     * })
     * ```
     */
    onChatMessageSent(listener: (event: ChatMessageSentEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.CHAT_MESSAGE_SENT, listener);
    }

    /**
     * Unsubscribe from chat message sent events
     */
    offChatMessageSent(listener: (event: ChatMessageSentEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.CHAT_MESSAGE_SENT, listener);
    }

    // ========================================================================
    // Chat State Update Events
    // ========================================================================

    /**
     * Emit chat state update event
     *
     * Called when conversation state changes (new message, thread created, etc.).
     * Other workspaces can sync their chat state in real-time.
     *
     * @story E1-7 - Chat State Sharing Between Workspaces
     */
    emitChatStateUpdate(event: Omit<ChatStateUpdateEvent, 'timestamp'>): void {
        const fullEvent: ChatStateUpdateEvent = {
            ...event,
            timestamp: new Date(),
        };

        console.log('[CrossWorkspaceEventBus] Chat state update:', {
            workspaceId: fullEvent.workspaceId,
            conversationId: fullEvent.conversationId,
            updateType: fullEvent.updateType,
        });
        this.emit(CrossWorkspaceEventBus.EVENTS.CHAT_STATE_UPDATE, fullEvent);
    }

    /**
     * Subscribe to chat state update events
     *
     * Use this to sync chat state when changes happen in other workspaces.
     *
     * @example
     * ```ts
     * crossWorkspaceEventBus.onChatStateUpdate((event) => {
     *     if (event.conversationId === currentConversationId) {
     *         // Sync message from other workspace
     *         syncMessage(event.data.messageId, event.data.messageContent)
     *     }
     * })
     * ```
     */
    onChatStateUpdate(listener: (event: ChatStateUpdateEvent) => void): void {
        this.on(CrossWorkspaceEventBus.EVENTS.CHAT_STATE_UPDATE, listener);
    }

    /**
     * Unsubscribe from chat state update events
     */
    offChatStateUpdate(listener: (event: ChatStateUpdateEvent) => void): void {
        this.off(CrossWorkspaceEventBus.EVENTS.CHAT_STATE_UPDATE, listener);
    }

    // ========================================================================
    // Utility Methods
    // ========================================================================
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global cross-workspace event bus singleton
 *
 * All workspaces share this single instance for event broadcasting.
 */
export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();

// ============================================================================
// Re-exports
// ============================================================================
// Note: Event types are already exported at their interface definitions above
// No need for duplicate exports here
