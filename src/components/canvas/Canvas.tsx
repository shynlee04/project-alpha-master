import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  Viewport,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  Edge,
  Node,
  getRectOfNodes,
  getTransformForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '../../lib/state/canvas-store';
import type { CanvasNodeData, CanvasEdgeData, viewportOptions as vo } from '../../lib/canvas/types';
import { useResponsive } from '../../hooks/useResponsive';

// Default viewport options matching types.ts
const defaultViewportOptions = {
  minZoom: 0.1,
  maxZoom: 4,
  fitView: true,
  fitViewOptions: { padding: 0.8 },
};

/**
 * Empty state component shown when canvas has no nodes
 */
function CanvasEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="mb-4 text-4xl">📝</div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t('canvas.emptyState.title', 'Drop sources here to start')}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('canvas.emptyState.hint', 'Drag and drop sources from the sidebar to create your knowledge map')}
      </p>
    </div>
  );
}

/**
 * Read-only mode overlay for mobile devices
 */
function ReadOnlyOverlay() {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
        {t('canvas.mobileReadOnly', 'Edit on desktop')}
      </div>
    </div>
  );
}

/**
 * Keyboard shortcuts help panel
 */
function KeyboardShortcutsPanel() {
  const { t } = useTranslation();
  const { fitView } = useReactFlow();

  const shortcuts = [
    { key: 'Arrow keys', action: t('canvas.shortcut.pan', 'Pan') },
    { key: '+ / -', action: t('canvas.shortcut.zoom', 'Zoom in/out') },
    { key: 'Home', action: t('canvas.shortcut.fitView', 'Fit view') },
    { key: 'Delete', action: t('canvas.shortcut.delete', 'Delete selected') },
  ];

  return (
    <Panel position="bottom-right">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded">
        {shortcuts.map(({ key, action }) => (
          <div key={key} className="flex gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{key}</kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/**
 * Fit view button panel
 */
function FitViewPanel() {
  const { fitView, getNodes } = useReactFlow();

  const handleFitView = useCallback(() => {
    const nodes = getNodes();
    if (nodes.length > 0) {
      const bounds = getRectOfNodes(nodes);
      const transform = getTransformForBounds(
        bounds,
        bounds.width,
        bounds.height,
        0.8,
        2,
      );
      fitView({ ...transform, duration: 300 });
    } else {
      fitView({ duration: 300 });
    }
  }, [fitView, getNodes]);

  return (
    <Panel position="top-right">
      <button
        onClick={handleFitView}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border border-border rounded hover:bg-muted transition-colors"
        aria-label="Fit view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
        Fit View
      </button>
    </Panel>
  );
}

/**
 * Main canvas content component
 */
function CanvasContent() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  // Get store state and actions
  const {
    nodes,
    edges,
    viewport,
    isReadOnly,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setViewport,
    setReadOnly,
  } = useCanvasStore();

  // Detect mobile and set read-only mode
  useEffect(() => {
    setReadOnly(isMobile);
  }, [isMobile, setReadOnly]);

  // Memoize node and edge types for performance
  const nodeTypes = useMemo(() => ({}), []);
  const edgeTypes = useMemo(() => ({}), []);

  // Handle viewport changes
  const handleViewportChange = useCallback(
    (newViewport: Viewport) => {
      setViewport(newViewport);
    },
    [setViewport],
  );

  // Check if canvas is empty
  const isEmpty = nodes.length === 0;

  // Prose component for node labels
  const prose = {
    nodes: (
      <div className="text-xs">
        {nodes.map((node) => (
          <div key={node.id} className="p-2 bg-card border rounded mb-1">
            {(node.data as CanvasNodeData).title || 'Untitled'}
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <ReactFlow
        nodes={nodes as Node<CanvasNodeData>[]}
        edges={edges as Edge<CanvasEdgeData>[]}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={onConnect as OnConnect}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={defaultViewportOptions.minZoom}
        maxZoom={defaultViewportOptions.maxZoom}
        fitView={defaultViewportOptions.fitView}
        fitViewOptions={defaultViewportOptions.fitViewOptions}
        snapToGrid={false}
        snapGrid={[15, 15]}
        onlyRenderVisibleElements={true}
        preventScrolling={!isMobile}
        prose={prose}
        // Read-only mode for mobile
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
        // Performance optimization
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        // Attribution position
        attributionPosition="bottom-left"
      >
        {/* Controls */}
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="bottom-left"
        />

        {/* Background grid */}
        <Background
          color="var(--color-border)"
          gap={20}
          size={1}
          variant="dots"
        />

        {/* Panels */}
        <FitViewPanel />
        <KeyboardShortcutsPanel />

        {/* Empty state */}
        {isEmpty && (
          <Panel position="center">
            <CanvasEmptyState />
          </Panel>
        )}

        {/* Mobile read-only overlay */}
        {isReadOnly && <ReadOnlyOverlay />}
      </ReactFlow>
    </div>
  );
}

/**
 * Knowledge Canvas component with React Flow integration
 * Supports desktop (full editing) and mobile (read-only) modes
 */
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}

export default Canvas;
