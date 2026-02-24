/**
 * @fileoverview MINIMAL TEST ROUTE - FileTree + Project ONLY
 * @module routes/$projectId.test
 *
 * PURPOSE: Bypass all broken plugin layout infrastructure
 * and render FileTree directly to verify core data mapping works.
 *
 * This proves:
 * 1. ProjectContextProvider provides context correctly
 * 2. FileTree plugin can access gateway and list files
 * 3. Files render in tree structure
 *
 * @created 2026-01-26
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';
import { ProjectContextProvider, useProjectContext } from '@/infrastructure/context/project-context';
import { useEffect, useState, useCallback } from 'react';
import { FolderOpen, FileText, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';

// ============================================================================
// MINIMAL FILETREE COMPONENT - No Plugin System
// ============================================================================

interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: TreeNode[];
    expanded?: boolean;
}

function MinimalFileTree() {
    const projectContext = useProjectContext();
    const { gateway, project } = projectContext;

    const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [selectedPath, setSelectedPath] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load file tree on mount
    const loadFileTree = useCallback(async () => {
        if (!gateway) {
            setError('Storage gateway not available');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('[MinimalFileTree] Loading files from gateway.list(".")');
            const entries = await gateway.list('.');
            console.log('[MinimalFileTree] Loaded entries:', entries);

            // Build tree nodes from flat entries
            const nodes: TreeNode[] = [];
            for (const entry of entries) {
                // Skip dotfiles (except .vscode, .git)
                if (entry.path.startsWith('.') && !['.vscode', '.git'].includes(entry.path)) {
                    continue;
                }

                // Determine if directory (by path ending with /)
                const isDirectory = entry.path.endsWith('/');

                nodes.push({
                    name: entry.path.replace(/\/$/, ''),
                    path: entry.path.replace(/\/$/, ''),
                    type: isDirectory ? 'directory' : 'file',
                });
            }

            console.log('[MinimalFileTree] Built nodes:', nodes);
            setRootNodes(nodes);
        } catch (err) {
            setError(`Failed to load file tree: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('[MinimalFileTree] Error loading file tree:', err);
        } finally {
            setIsLoading(false);
        }
    }, [gateway]);

    useEffect(() => {
        loadFileTree();
    }, [loadFileTree]);

    // Toggle folder expansion
    const handleToggle = useCallback((path: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    // Render a single node
    const renderNode = (node: TreeNode, depth: number = 0) => {
        const isExpanded = expandedPaths.has(node.path);
        const isSelected = selectedPath === node.path;

        return (
            <div key={node.path}>
                <div
                    className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => {
                        setSelectedPath(node.path);
                        if (node.type === 'directory') {
                            handleToggle(node.path);
                        } else {
                            console.log('[MinimalFileTree] Open file:', node.path);
                            projectContext.openFile(node.path);
                        }
                    }}
                >
                    {node.type === 'directory' ? (
                        <>
                            {isExpanded ? (
                                <ChevronDown size={14} className="text-muted-foreground" />
                            ) : (
                                <ChevronRight size={14} className="text-muted-foreground" />
                            )}
                            <FolderOpen size={14} className="text-yellow-500" />
                        </>
                    ) : (
                        <>
                            <span className="w-3.5" />
                            <FileText size={14} className="text-muted-foreground" />
                        </>
                    )}
                    <span className="text-xs truncate">{node.name}</span>
                </div>
                {node.type === 'directory' && isExpanded && node.children && (
                    <div>
                        {node.children.map((child) => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Error state
    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
                <AlertCircle size={32} className="mb-2" />
                <p className="text-sm text-center">{error}</p>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Loading files...</p>
            </div>
        );
    }

    // No files state
    if (rootNodes.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FolderOpen size={48} className="mb-2 text-muted-foreground/70" />
                <p className="text-sm text-center">No files in project</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            {/* Header */}
            <div className="h-8 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                    <FolderOpen size={16} />
                    <span>{project.name}</span>
                </div>
                <span className="text-xs text-muted-foreground/70">
                    {project.storageType === 'fsa' ? 'FSA' : 'IndexedDB'}
                </span>
            </div>

            {/* Tree */}
            <div className="py-1">
                {rootNodes.map((node) => renderNode(node))}
            </div>
        </div>
    );
}

// ============================================================================
// MINIMAL ROUTE - No PluginLayout
// ============================================================================

export const Route = createFileRoute('/$projectId/test')({
    ssr: false,

    loader: async ({ params }) => {
        const { projectId } = params;
        console.log('[TestRoute.loader] Loading project:', projectId);

        await waitForHydration();
        const record = await db.projects.get(projectId);

        if (!record) {
            console.error('[TestRoute.loader] Project not found:', projectId);
            throw redirect({ to: '/' });
        }

        const project = fromRecord(record);
        console.log('[TestRoute.loader] Project found:', { id: project.id, name: project.name });

        return { project };
    },

    component: () => {
        const { projectId } = Route.useParams();

        return (
            <div className="h-full w-full flex">
                {/* Sidebar with FileTree */}
                <div className="w-64 h-full border-r border-border bg-card">
                    <ProjectContextProvider projectId={projectId}>
                        <MinimalFileTree />
                    </ProjectContextProvider>
                </div>

                {/* Main content placeholder */}
                <div className="flex-1 h-full flex items-center justify-center bg-background">
                    <p className="text-muted-foreground text-sm">
                        Select a file to open
                    </p>
                </div>
            </div>
        );
    },
});
