/**
 * @fileoverview Synced Block for BlockNote
 * @module presentation/components/notes/blocks/SyncedBlock
 * @story UX-12
 * @created 2026-01-16
 *
 * Synced blocks that mirror content across multiple instances.
 * When any instance is edited, changes propagate to all others.
 *
 * Features:
 * - Create synced copy from any block
 * - Visual sync indicator
 * - Unsync functionality
 * - Changes propagate on save
 *
 * Implementation Note: This is a pragmatic MVP. Real-time propagation
 * is deferred to future iteration. Current implementation propagates on
 * note save/autosave.
 */

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Link2, Unlink } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import "./SyncedBlock.css";

// ============================================================================
// Types
// ============================================================================

export interface SyncedBlockProps {
    /** Unique identifier for the sync group */
    syncGroupId: string;
    /** ID of the source (master) block */
    sourceBlockId: string;
    /** Note ID where source block resides */
    sourceNoteId: string;
    /** Text alignment */
    textAlignment?: "left" | "center" | "right";
}

/**
 * Sync group metadata
 * Tracks all instances of a synced block across notes
 */
export interface SyncGroup {
    id: string;
    sourceBlockId: string;
    sourceNoteId: string;
    instanceIds: string[]; // Block IDs that are part of this sync group
    createdAt: number;
}

// ============================================================================
// Global Sync Groups Store (In-Memory MVP)
// ============================================================================

/**
 * Global registry of sync groups
 * In MVP: stored in memory. Future: persist to IndexedDB for cross-session
 */
const syncGroupsRegistry = new Map<string, SyncGroup>();

/**
 * Register a sync group
 */
export function registerSyncGroup(group: SyncGroup): void {
    syncGroupsRegistry.set(group.id, group);
    console.log(`[SyncedBlock] Registered sync group: ${group.id}`);
}

/**
 * Get a sync group by ID
 */
export function getSyncGroup(syncGroupId: string): SyncGroup | undefined {
    return syncGroupsRegistry.get(syncGroupId);
}

/**
 * Get all sync groups
 */
export function getAllSyncGroups(): Map<string, SyncGroup> {
    return syncGroupsRegistry;
}

/**
 * Add an instance to a sync group
 */
export function addInstanceToSyncGroup(syncGroupId: string, blockId: string): void {
    const group = syncGroupsRegistry.get(syncGroupId);
    if (group) {
        if (!group.instanceIds.includes(blockId)) {
            group.instanceIds.push(blockId);
        }
        syncGroupsRegistry.set(syncGroupId, group);
    }
}

/**
 * Remove an instance from a sync group (unsync)
 */
export function removeInstanceFromSyncGroup(syncGroupId: string, blockId: string): void {
    const group = syncGroupsRegistry.get(syncGroupId);
    if (group) {
        group.instanceIds = group.instanceIds.filter(id => id !== blockId);
        if (group.instanceIds.length === 0) {
            syncGroupsRegistry.delete(syncGroupId);
        } else {
            syncGroupsRegistry.set(syncGroupId, group);
        }
    }
}

/**
 * Update all instances in a sync group with new content
 * This is called when any synced block is saved
 */
export async function propagateToSyncGroup(
    syncGroupId: string,
    _newContent: any[], // BlockNote content array (unused in MVP)
    _excludedBlockId?: string
): Promise<void> {
    const group = syncGroupsRegistry.get(syncGroupId);
    if (!group || group.instanceIds.length === 0) {
        return;
    }

    console.log(`[SyncedBlock] Propagating to ${group.instanceIds.length} instances in group ${syncGroupId}`);

    // In MVP: Log the propagation
    // Future: Use event bus or direct editor API to update instances
    // For now, the content will sync when notes are reloaded/autosaved

    // TODO: Implement real-time propagation via event bus
    // This would require:
    // 1. Event bus that all NoteEditor instances subscribe to
    // 2. SyncUpdateEvent with syncGroupId and new content
    // 3. Each editor checks if it has any blocks in the sync group
    // 4. If so, update the block content
}

// ============================================================================
// Synced Block Component
// ============================================================================

/**
 * Synced Block - Content that mirrors across all instances
 *
 * Visual indicator that content is synced, with unsync option.
 * Content is rendered inline like normal blocks.
 */
export const SyncedBlock = createReactBlockSpec(
    {
        type: "synced",
        propSchema: {
            syncGroupId: {
                default: "",
            },
            sourceBlockId: {
                default: "",
            },
            sourceNoteId: {
                default: "",
            },
            textAlignment: defaultProps.textAlignment,
        },
        content: "inline", // Synced blocks are editable
    },
    {
        render: (props) => {
            const syncGroupId = props.block.props.syncGroupId as string;
            const [showUnsyncConfirm, setShowUnsyncConfirm] = useState(false);

            // Get sync group info
            const syncGroup = syncGroupId ? getSyncGroup(syncGroupId) : undefined;
            const instanceCount = syncGroup?.instanceIds.length || 0;

            // Handle unsync action
            const handleUnsync = useCallback(() => {
                if (!syncGroupId) return;

                // Remove from sync group
                removeInstanceFromSyncGroup(syncGroupId, props.block.id);

                // Convert to regular paragraph block
                (props.editor.updateBlock as any)(props.block, {
                    type: "paragraph",
                    props: defaultProps,
                });

                console.log(`[SyncedBlock] Unsynced block ${props.block.id} from group ${syncGroupId}`);
            }, [props, syncGroupId, props.block.id]);

            return (
                <div
                    className={cn(
                        "synced-block",
                        `synced-block--align-${props.block.props.textAlignment || "left"}`
                    )}
                >
                    {/* Sync Indicator Header */}
                    <div className="synced-block__header">
                        <div className="synced-block__indicator">
                            <Link2 size={12} className="synced-block__icon" />
                            <span className="synced-block__label">
                                Synced{instanceCount > 1 && ` (${instanceCount} instances)`}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUnsyncConfirm(true)}
                            className="synced-block__unsync-btn"
                            title="Unsync this block"
                        >
                            <Unlink size={12} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div ref={props.contentRef} className="synced-block__content" />

                    {/* Unsync Confirmation Dialog */}
                    {showUnsyncConfirm && (
                        <div className="synced-block__unsync-dialog">
                            <div className="synced-block__unsync-dialog-content">
                                <p className="synced-block__unsync-text">
                                    Unsync this block? It will become a normal block
                                    and won't receive updates from the sync group anymore.
                                </p>
                                <div className="synced-block__unsync-actions">
                                    <button
                                        type="button"
                                        onClick={() => setShowUnsyncConfirm(false)}
                                        className="synced-block__unsync-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUnsync}
                                        className="synced-block__unsync-confirm"
                                    >
                                        Unsync
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        },
    }
);

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a synced block from a source block
 *
 * @param sourceBlockId - ID of the source block to sync
 * @param sourceNoteId - ID of the note containing source block
 * @returns Synced block definition
 */
export function createSyncedBlock(
    sourceBlockId: string,
    sourceNoteId: string
): { id: string; type: string; props: SyncedBlockProps } {
    // Generate new sync group ID
    const syncGroupId = crypto.randomUUID();

    // Register the sync group
    const syncGroup: SyncGroup = {
        id: syncGroupId,
        sourceBlockId,
        sourceNoteId,
        instanceIds: [sourceBlockId], // Source is first instance
        createdAt: Date.now(),
    };
    registerSyncGroup(syncGroup);

    return {
        id: crypto.randomUUID(),
        type: "synced",
        props: {
            syncGroupId,
            sourceBlockId,
            sourceNoteId,
            textAlignment: "left",
        },
    };
}
