/**
 * @fileoverview PROJECT DATA FLOW DIAGNOSTIC
 * @module routes/$projectId.diagnostic
 * @created 2026-01-26T16:33:00+07:00
 *
 * PURPOSE: Systematic diagnosis of the data pipeline
 * per new-fundamental-truths.md and the-3-phase-approach.md
 *
 * This route shows the EXACT STATE of each layer:
 * 1. Project Record (from Dexie)
 * 2. FSA Handle (from handlePersistenceService)
 * 3. Storage Gateway (from ProjectContext)
 * 4. File Listing (from gateway.list)
 *
 * Run this to see WHERE the pipeline breaks.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import { ProjectContextProvider, useProjectContext } from '@/infrastructure/context/project-context';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

// ============================================================================
// DIAGNOSTIC STATUS TYPES
// ============================================================================

type StatusType = 'pending' | 'loading' | 'success' | 'error' | 'warning';

interface DiagnosticItem {
    id: string;
    label: string;
    status: StatusType;
    details?: string;
    data?: unknown;
}

// ============================================================================
// ROUTE LOADER
// ============================================================================

export const Route = createFileRoute('/$projectId/diagnostic')({
    ssr: false,

    loader: async ({ params }) => {
        const { projectId } = params;
        console.log('[Diagnostic.loader] Loading project:', projectId);

        await waitForHydration();
        const record = await db.projects.get(projectId);

        if (!record) {
            console.error('[Diagnostic.loader] Project not found:', projectId);
            throw redirect({ to: '/hub' });
        }

        const project = fromRecord(record);
        console.log('[Diagnostic.loader] Project loaded:', {
            id: project.id,
            name: project.name,
            storageType: project.storageType,
        });

        return { project };
    },

    component: DiagnosticPage,
});

// ============================================================================
// DIAGNOSTIC PAGE
// ============================================================================

function DiagnosticPage() {
    const { projectId } = Route.useParams();
    const { project } = Route.useLoaderData();

    return (
        <div className="min-h-screen bg-background text-foreground p-6 font-mono">
            <h1 className="text-2xl font-bold mb-2">🔬 Project Data Flow Diagnostic</h1>
            <p className="text-muted-foreground mb-6">
                Project: <span className="text-primary">{project.name}</span> ({project.id})
            </p>

            {/* Wrap in ProjectContextProvider to test context creation */}
            <ProjectContextProvider projectId={projectId}>
                <DiagnosticContent project={project} />
            </ProjectContextProvider>
        </div>
    );
}

// ============================================================================
// DIAGNOSTIC CONTENT (inside ProjectContext)
// ============================================================================

function DiagnosticContent({ project }: { project: Project }) {
    const projectContext = useProjectContext();
    const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const updateDiagnostic = useCallback((id: string, update: Partial<DiagnosticItem>) => {
        setDiagnostics(prev =>
            prev.map(d => (d.id === id ? { ...d, ...update } : d))
        );
    }, []);

    const runDiagnostics = useCallback(async () => {
        setIsRunning(true);

        // Initialize diagnostic items
        const initialDiagnostics: DiagnosticItem[] = [
            { id: 'project', label: '1. Project Record (Dexie)', status: 'pending' },
            { id: 'storage-type', label: '2. Storage Type Detection', status: 'pending' },
            { id: 'handle', label: '3. FSA Handle Persistence', status: 'pending' },
            { id: 'context', label: '4. ProjectContext Provider', status: 'pending' },
            { id: 'gateway', label: '5. Storage Gateway', status: 'pending' },
            { id: 'list', label: '6. gateway.list(".") Call', status: 'pending' },
            { id: 'files', label: '7. File Count', status: 'pending' },
        ];
        setDiagnostics(initialDiagnostics);

        // === STEP 1: Project Record ===
        try {
            updateDiagnostic('project', { status: 'loading' });
            const record = await db.projects.get(project.id);
            if (record) {
                updateDiagnostic('project', {
                    status: 'success',
                    details: `Found: ${record.name}`,
                    data: { id: record.id, name: record.name, storageType: record.storageType },
                });
            } else {
                updateDiagnostic('project', { status: 'error', details: 'NOT FOUND in Dexie' });
            }
        } catch (err) {
            updateDiagnostic('project', { status: 'error', details: String(err) });
        }

        // === STEP 2: Storage Type ===
        updateDiagnostic('storage-type', {
            status: project.storageType ? 'success' : 'error',
            details: project.storageType || 'UNDEFINED',
            data: { storageType: project.storageType },
        });

        // === STEP 3: FSA Handle ===
        try {
            updateDiagnostic('handle', { status: 'loading' });
            if (project.storageType === 'indexeddb') {
                updateDiagnostic('handle', {
                    status: 'success',
                    details: 'N/A (IndexedDB storage - no FSA handle needed)',
                });
            } else {
                const canSilent = await handlePersistenceService.canSilentRestore(project.id);
                const permissionStatus = await handlePersistenceService.getPermissionStatus(project.id);
                updateDiagnostic('handle', {
                    status: canSilent ? 'success' : 'warning',
                    details: canSilent
                        ? `Can silent restore (permission: ${permissionStatus})`
                        : `Cannot silent restore (permission: ${permissionStatus || 'none'})`,
                    data: { canSilent, permissionStatus },
                });
            }
        } catch (err) {
            updateDiagnostic('handle', { status: 'error', details: String(err) });
        }

        // === STEP 4: ProjectContext ===
        try {
            updateDiagnostic('context', { status: 'loading' });
            if (projectContext) {
                updateDiagnostic('context', {
                    status: 'success',
                    details: `Context exists, project: ${projectContext.project?.name || 'loading...'}`,
                    data: {
                        hasProject: !!projectContext.project,
                        hasGateway: !!projectContext.gateway,
                        isLoading: projectContext.isLoading,
                        error: projectContext.error,
                    },
                });
            } else {
                updateDiagnostic('context', { status: 'error', details: 'Context is NULL' });
            }
        } catch (err) {
            updateDiagnostic('context', { status: 'error', details: String(err) });
        }

        // === STEP 5: Storage Gateway ===
        try {
            updateDiagnostic('gateway', { status: 'loading' });
            const { gateway } = projectContext;
            if (gateway) {
                updateDiagnostic('gateway', {
                    status: 'success',
                    details: 'Gateway exists',
                    data: { type: typeof gateway },
                });
            } else {
                updateDiagnostic('gateway', {
                    status: projectContext.isLoading ? 'loading' : 'error',
                    details: projectContext.isLoading ? 'Loading...' : 'Gateway is NULL',
                });
            }
        } catch (err) {
            updateDiagnostic('gateway', { status: 'error', details: String(err) });
        }

        // === STEP 6: gateway.list('.') ===
        try {
            updateDiagnostic('list', { status: 'loading' });
            const { gateway } = projectContext;
            if (!gateway) {
                updateDiagnostic('list', { status: 'error', details: 'Cannot test - no gateway' });
            } else {
                const entries = await gateway.list('.');
                updateDiagnostic('list', {
                    status: entries.length > 0 ? 'success' : 'warning',
                    details: `Returned ${entries.length} entries`,
                    data: entries.slice(0, 10), // First 10 entries
                });

                // === STEP 7: File Count ===
                const fileCount = entries.filter(e => !e.path.endsWith('/')).length;
                const dirCount = entries.filter(e => e.path.endsWith('/')).length;
                updateDiagnostic('files', {
                    status: entries.length > 0 ? 'success' : 'warning',
                    details: `${fileCount} files, ${dirCount} directories`,
                    data: { fileCount, dirCount },
                });
            }
        } catch (err) {
            updateDiagnostic('list', { status: 'error', details: String(err) });
            updateDiagnostic('files', { status: 'error', details: 'Cannot count - list failed' });
        }

        setIsRunning(false);
    }, [project, projectContext, updateDiagnostic]);

    // Run diagnostics on mount
    useEffect(() => {
        // Wait a bit for context to initialize
        const timer = setTimeout(() => {
            runDiagnostics();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-4">
            {/* Run button */}
            <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Re-run Diagnostics'}
            </button>

            {/* Diagnostic results */}
            <div className="space-y-2">
                {diagnostics.map((item) => (
                    <DiagnosticRow key={item.id} item={item} />
                ))}
            </div>

            {/* Raw context data */}
            <details className="mt-8 p-4 border border-border rounded bg-card">
                <summary className="cursor-pointer font-semibold">Raw ProjectContext Data</summary>
                <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {JSON.stringify(
                        {
                            hasProject: !!projectContext.project,
                            projectId: projectContext.project?.id,
                            projectName: projectContext.project?.name,
                            storageType: projectContext.project?.storageType,
                            hasGateway: !!projectContext.gateway,
                            isLoading: projectContext.isLoading,
                            error: projectContext.error,
                        },
                        null,
                        2
                    )}
                </pre>
            </details>
        </div>
    );
}

// ============================================================================
// DIAGNOSTIC ROW COMPONENT
// ============================================================================

function DiagnosticRow({ item }: { item: DiagnosticItem }) {
    const [expanded, setExpanded] = useState(false);

    const StatusIcon = {
        pending: <AlertCircle className="w-5 h-5 text-muted-foreground" />,
        loading: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
    }[item.status];

    return (
        <div
            className={`p-3 border rounded ${item.status === 'error'
                    ? 'border-red-500/50 bg-red-500/10'
                    : item.status === 'warning'
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : item.status === 'success'
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-border bg-card'
                }`}
        >
            <div className="flex items-center gap-3">
                {StatusIcon}
                <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.details && (
                        <div className="text-sm text-muted-foreground">{item.details}</div>
                    )}
                </div>
                {item.data && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-primary underline"
                    >
                        {expanded ? 'Hide' : 'Show'} data
                    </button>
                )}
            </div>
            {expanded && item.data && (
                <pre className="mt-2 p-2 bg-background text-xs overflow-auto rounded">
                    {JSON.stringify(item.data, null, 2)}
                </pre>
            )}
        </div>
    );
}
