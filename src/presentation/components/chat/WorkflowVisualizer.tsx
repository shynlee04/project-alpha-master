/**
 * @fileoverview Workflow Visualizer Component
 * @module presentation/components/chat/WorkflowVisualizer
 * @governance EPIC-E4-6
 * @created 2026-01-06
 *
 * Displays workflows as interactive flowcharts with zoom/pan controls.
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Node,
    Edge,
    Position,
    useReactFlow,
    NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowBuilderStore } from '@/lib/workflow/builder/workflow-builder-store';
import type { Workflow, WorkflowStep } from '@/lib/workflow/builder/types';
import { StepType } from '@/lib/workflow/builder/types';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface WorkflowVisualizerProps {
    /** Workflow to visualize */
    workflow: Workflow;
    /** Currently executing step ID (for highlighting) */
    executingStepId?: string;
    /** Callback when node is clicked */
    onNodeClick?: (stepId: string) => void;
    /** Additional CSS classes */
    className?: string;
}

interface StepNodeData extends Record<string, unknown> {
    step: WorkflowStep;
    isExecuting: boolean;
}

function StepNode({ data }: { data: StepNodeData }) {
    const { step, isExecuting } = data;
    const { t } = useTranslation();

    const stepInfo = STEP_INFO[step.type] || STEP_INFO[StepType.SEND_MESSAGE];

    return (
        <div
            className={`px-4 py-2 rounded-lg border-2 shadow-md min-w-[150px]
                ${isExecuting ? 'border-primary bg-primary/10 ring-2 ring-primary/50' : stepInfo.borderColor}
                ${stepInfo.bgColor} transition-all`}
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{stepInfo.icon}</span>
                <span className="text-sm font-medium">{step.name}</span>
            </div>
            {step.description && (
                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
            )}
            {isExecuting && (
                <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    {t('chat.workflow.executing')}
                </div>
            )}
        </div>
    );
}

const STEP_INFO: Record<StepType, { icon: string; borderColor: string; bgColor: string }> = {
    [StepType.SEND_MESSAGE]: {
        icon: '💬',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    [StepType.ROUTE]: {
        icon: '🔀',
        borderColor: 'border-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    [StepType.BRANCH]: {
        icon: '🔀',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    [StepType.DEBATE]: {
        icon: '🗣️',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    [StepType.EXPANSION]: {
        icon: '📋',
        borderColor: 'border-cyan-500',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    },
    [StepType.INPUT]: {
        icon: '📝',
        borderColor: 'border-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    [StepType.END]: {
        icon: '🏁',
        borderColor: 'border-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-950',
    },
};

// ============================================================================
// Zoom Controls
// ============================================================================()

function ZoomControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => zoomIn()}
                className="p-1 rounded hover:bg-muted border"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <button
                onClick={() => zoomOut()}
                className="p-1 rounded hover:bg-muted border"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            <button
                onClick={() => fitView({ padding: 0.2 })}
                className="p-1 rounded hover:bg-muted border"
                title="Fit View"
            >
                <Maximize2 className="w-4 h-4" />
            </button>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================()

const nodeTypes: NodeTypes = {
    step: StepNode,
};

export function WorkflowVisualizer({
    workflow,
    executingStepId,
    onNodeClick,
    className = '',
}: WorkflowVisualizerProps) {
    const { t } = useTranslation();

    // Convert workflow steps to React Flow nodes
    const { nodes, edges } = useMemo(() => {
        const flowNodes: Node[] = [];
        const flowEdges: Edge[] = [];

        // Calculate node positions using a simple tree layout
        const positions = new Map<string, { x: number; y: number }>();
        const levelWidth = 200;
        const levelHeight = 120;

        // Start with start step at top
        const startStep = workflow.steps.find((s) => s.id === workflow.startStepId);
        if (startStep) {
            positions.set(startStep.id, { x: 0, y: 0 });
        }

        // BFS to position remaining nodes
        const visited = new Set<string>();
        const queue: { id: string; level: number; index: number }[] = [];

        if (startStep) {
            queue.push({ id: startStep.id, level: 0, index: 0 });
            visited.add(startStep.id);
        }

        const levelCounts = new Map<number, number>();

        while (queue.length > 0) {
            const { id, level } = queue.shift()!;

            const step = workflow.steps.find((s) => s.id === id);
            if (!step) continue;

            const count = levelCounts.get(level) ?? 0;
            const x = (count - (levelCounts.get(level) ?? 0) / 2) * levelWidth;
            const y = level * levelHeight;
            positions.set(id, { x, y });
            levelCounts.set(level, count + 1);

            // Add children to queue
            step.nextSteps.forEach((nextId, i) => {
                if (!visited.has(nextId)) {
                    visited.add(nextId);
                    queue.push({ id: nextId, level: level + 1, index: i });
                }
            });
        }

        // Create nodes
        for (const step of workflow.steps) {
            const pos = positions.get(step.id) || { x: 0, y: 0 };
            flowNodes.push({
                id: step.id,
                type: 'step',
                position: pos,
                data: {
                    step,
                    isExecuting: step.id === executingStepId,
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });
        }

        // Create edges
        for (const step of workflow.steps) {
            for (const nextId of step.nextSteps) {
                flowEdges.push({
                    id: `${step.id}-${nextId}`,
                    source: step.id,
                    target: nextId,
                    type: 'smoothstep',
                    animated: step.id === executingStepId,
                    style: { stroke: executingStepId && step.id === executingStepId ? 'hsl(var(--primary))' : '#94a3b8' },
                });
            }
        }

        return { nodes: flowNodes, edges: flowEdges };
    }, [workflow, executingStepId]);

    const handleNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            onNodeClick?.(node.id);
        },
        [onNodeClick]
    );

    const handleExport = useCallback(() => {
        // Simple SVG export - in production would use html-to-image
        const svgElement = document.querySelector('.react-flow') as HTMLElement;
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${workflow.name}-flowchart.svg`;
        link.click();
        URL.revokeObjectURL(url);
    }, [workflow.name]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                fitView
                minZoom={0.25}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                }}
            >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        const step = node.data.step as WorkflowStep;
                        const info = STEP_INFO[step.type];
                        return info.borderColor.replace('border-', '');
                    }}
                />
            </ReactFlow>

            {/* Custom zoom controls with export */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-background border rounded-lg p-1">
                <ZoomControls />
                <div className="w-px h-6 bg-border" />
                <button
                    onClick={handleExport}
                    className="p-1 rounded hover:bg-muted"
                    title={t('chat.workflow.exportImage')}
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card border rounded-lg p-3">
                <p className="text-xs font-medium mb-2">{t('chat.workflow.stepTypes')}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {Object.entries(STEP_INFO).map(([type, info]) => (
                        <div key={type} className="flex items-center gap-1">
                            <span>{info.icon}</span>
                            <span className="capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Standalone Viewer Component
// ============================================================================()

export interface WorkflowViewerProps {
    /** Workflow ID to load and display */
    workflowId: string;
    /** Additional CSS classes */
    className?: string;
}

export function WorkflowViewer({ workflowId, className = '' }: WorkflowViewerProps) {
    const savedWorkflows = useWorkflowBuilderStore.getState().getSavedWorkflows();
    const workflow = savedWorkflows.find((w) => w.id === workflowId);

    if (!workflow) {
        return (
            <div className={`p-6 rounded-lg border bg-card ${className}`}>
                <p className="text-center text-muted-foreground">Workflow not found</p>
            </div>
        );
    }

    return <WorkflowVisualizer workflow={workflow} className={className} />;
}
