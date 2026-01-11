/**
 * Thread Folder Tree Component
 *
 * Ralph Loop Cycle 5: Cascade Flow Support
 *
 * Displays conversation threads in a hierarchical tree structure.
 * Supports:
 * - Collapsible folder/parent nodes
 * - Thread metadata display (title, preview, timestamp)
 * - Click to select thread
 * - Visual indicators for active thread
 * - Child thread nesting
 *
 * @component
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import type { ThreadHierarchyNode } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { formatDistanceToNow } from 'date-fns';

export interface ThreadFolderTreeProps {
    /** Thread hierarchy tree */
    hierarchy: ThreadHierarchyNode[];
    /** Thread selection callback */
    onSelectThread: (threadId: string) => void;
    /** Create new child thread callback */
    onCreateChild?: (parentId: string) => void;
}

interface TreeNodeProps {
    node: ThreadHierarchyNode;
    activeThreadId: string | null;
    onSelectThread: (threadId: string) => void;
    onCreateChild?: (parentId: string) => void;
    depth?: number;
}

/**
 * Single tree node component
 */
function TreeNode({ node, activeThreadId, onSelectThread, onCreateChild, depth = 0 }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children.length > 0;
    const isActive = node.thread.id === activeThreadId;

    const handleClick = () => {
        onSelectThread(node.thread.id);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="thread-tree-node">
            {/* Thread row */}
            <div
                className={`
                    thread-row flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                    hover:bg-accent/5 transition-colors
                    ${isActive ? 'bg-accent/10 text-accent-foreground' : 'text-foreground/70'}
                `}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                aria-selected={isActive}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick();
                    }
                }}
            >
                {/* Expand/collapse icon */}
                {hasChildren ? (
                    <button
                        className="p-0.5 hover:bg-accent/10 rounded transition-colors"
                        onClick={handleToggle}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                {/* Thread icon */}
                <MessageSquare className="w-4 h-4 flex-shrink-0" />

                {/* Thread info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{node.thread.title}</span>
                        {node.thread.messageCount > 0 && (
                            <span className="text-xs text-foreground/50">
                                {node.thread.messageCount}
                            </span>
                        )}
                    </div>
                    {node.thread.preview && (
                        <p className="text-xs text-foreground/50 truncate">
                            {node.thread.preview}
                        </p>
                    )}
                </div>

                {/* Timestamp */}
                <time
                    className="text-xs text-foreground/40 flex-shrink-0"
                    dateTime={new Date(node.thread.updatedAt).toISOString()}
                >
                    {formatDistanceToNow(new Date(node.thread.updatedAt), { addSuffix: true })}
                </time>
            </div>

            {/* Child threads */}
            {hasChildren && isExpanded && (
                <div className="children-container">
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.thread.id}
                            node={child}
                            activeThreadId={activeThreadId}
                            onSelectThread={onSelectThread}
                            onCreateChild={onCreateChild}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Thread folder tree component
 */
export function ThreadFolderTree({ hierarchy, onSelectThread, onCreateChild }: ThreadFolderTreeProps) {
    const activeThread = useActiveThread();

    if (hierarchy.length === 0) {
        return (
            <div className="p-4 text-center text-foreground/50">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
            </div>
        );
    }

    return (
        <div className="thread-folder-tree space-y-0.5">
            {hierarchy.map((node) => (
                <TreeNode
                    key={node.thread.id}
                    node={node}
                    activeThreadId={activeThread?.id || null}
                    onSelectThread={onSelectThread}
                    onCreateChild={onCreateChild}
                    depth={0}
                />
            ))}
        </div>
    );
}
