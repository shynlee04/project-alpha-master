import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  Panel,
  Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/infrastructure/persistence/stores';
import { useResponsive } from '@/hooks/useResponsive';
import { nodeTypes } from './nodes/nodeTypes';
import { edgeTypes, defaultEdgeOptions } from './edges/edgeTypes';
import { useCanvasDrop } from '@/hooks/useCanvasDrop';
import { LinkageProposalsPanel } from './LinkageProposalsPanel';
import type { IndexMetadata } from '@/lib/rag/types';

/**
 * Canvas component props
 */
export interface CanvasProps {
    /** Optional RAG index metadata for knowledge graph integration */
    indexMetadata?: IndexMetadata | null;
}

// Default viewport options
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
  const { isMobile } = useResponsive();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-surface/50 backdrop-blur-sm">
      <div className={`mb-4 ${isMobile ? 'text-3xl' : 'text-4xl'} animate-bounce`}>
        📝
      </div>
      <h3 className={`font-bold text-foreground mb-3 ${isMobile ? 'text-base' : 'text-xl'}`}>
        {t('canvas.emptyState.title', 'Drop sources here to start')}
      </h3>
      <p className={`text-muted-foreground max-w-sm mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
        {t('canvas.emptyState.hint', 'Drag and drop sources from the sidebar to create your knowledge map')}
      </p>
    </div>
  );
}

/**
 * Touch gestures help panel for mobile devices
 */
function TouchGesturesPanel() {
  const { t } = useTranslation();

  const gestures = [
    { icon: '👆', desc: t('canvas.gesture.pan', 'Pan canvas') },
    { icon: '🤏', desc: t('canvas.gesture.zoom', 'Pinch to zoom') },
    { icon: '👆👆', desc: t('canvas.gesture.tap', 'Double-tap to reset') },
  ];

  return (
    <Panel position="bottom-right">
      <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded">
        {gestures.map(({ icon, desc }) => (
          <div key={icon} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span>{desc}</span>
          </div>
        ))}
      </div>
    </Panel>
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
 * Main canvas content component
 *
 * @param props - CanvasContent props including optional indexMetadata
 */
function CanvasContent(props?: { indexMetadata?: IndexMetadata | null }) {
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

  // Use memoized edge types from edgeTypes.ts
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  // Drag and drop handlers
  const { handleDragOver, handleDrop } = useCanvasDrop();

  // Handle double-click on nodes to create concept node
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: { type?: string }) => {
      if (isReadOnly) return;

      // Only handle double-clicks on concept nodes
      if (node.type !== 'concept') return;

      // Edit the concept node title (inline editing)
      // This is handled by the node component itself
    },
    [isReadOnly],
  );

  // Handle viewport changes
  const handleViewportChange = useCallback(
    (newViewport: Viewport) => {
      setViewport(newViewport);
    },
    [setViewport],
  );

  // Check if canvas is empty
  const isEmpty = nodes.length === 0;

  return (
    <div
      className={`w-full h-full relative ${isMobile ? 'min-h-[300px]' : 'min-h-[400px]'}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={memoizedEdgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={defaultViewportOptions.minZoom}
        maxZoom={defaultViewportOptions.maxZoom}
        fitView={defaultViewportOptions.fitView}
        fitViewOptions={defaultViewportOptions.fitViewOptions}
        snapToGrid={false}
        snapGrid={[15, 15]}
        onlyRenderVisibleElements={true}
        preventScrolling={!isMobile}
        // Read-only mode for mobile
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
        // Performance optimization
        defaultViewport={{ x: 0, y: 0, zoom: isMobile ? 0.5 : 1 }}
        // Mobile-specific: Pan on scroll (disabled), use touch gestures instead
        panOnScroll={false}
        panOnScrollSpeed={0.5}
        // Attribution position
        attributionPosition="bottom-left"
      >
        {/* Controls - hide on mobile in read-only mode */}
        {!isReadOnly && (
          <Controls
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            position="bottom-left"
          />
        )}

        {/* Background grid */}
        <Background
          color="var(--color-border)"
          gap={20}
          size={1}
        />

        {/* Panels */}
        {isMobile ? <TouchGesturesPanel /> : <KeyboardShortcutsPanel />}
        <LinkageProposalsPanel indexMetadata={props?.indexMetadata} />

        {/* Empty state */}
        {isEmpty && (
          <Panel position="top-center" style={{ top: '50%', transform: 'translateY(-50%)' }}>
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
 *
 * @param props - Canvas props including optional indexMetadata
 */
export function Canvas(props?: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent indexMetadata={props?.indexMetadata} />
    </ReactFlowProvider>
  );
}

export default Canvas;
