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

// ============================================================================
// Types
// ============================================================================

/**
 * Workspace identifiers
 */
export type WorkspaceId = 'ide' | 'notes' | 'knowledge' | 'study';

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
    // Utility Methods
    // ========================================================================

    /**
     * Remove all event listeners
     *
     * Use this for cleanup (e.g., when workspace unmounts).
     */
    removeAllListeners(): void {
        this.removeAllListeners();
    }
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

export type {
    FileChangeEvent,
    AgentConfigChangeEvent,
    SyncStatusEvent,
    ProjectStateChangeEvent,
};
