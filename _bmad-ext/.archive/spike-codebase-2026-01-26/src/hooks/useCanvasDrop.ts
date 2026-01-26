import { useCallback } from 'react';
import { useReactFlow, useStoreApi } from '@xyflow/react';
import { Node } from '@xyflow/react';

/**
 * Drag and drop event types
 */
export interface DragItem {
  type: 'source' | 'concept';
  sourceId?: string;
  data?: Record<string, unknown>;
}

/**
 * Hook for handling drag and drop from sidebar to canvas
 */
export const useCanvasDrop = () => {
  const { screenToFlowPosition, getNodes, setNodes } = useReactFlow();
  const storeApi = useStoreApi();

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Get drag data
      const dragData = event.dataTransfer.getData('application/json');
      if (!dragData) return;

      try {
        const item: DragItem = JSON.parse(dragData);

        // Calculate position on canvas
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Create new node based on type
        const newNode: Node = {
          id: `${item.type}-${Date.now()}`,
          type: item.type,
          position,
          data: {
            ...item.data,
            nodeType: item.type,
            title: item.type === 'source'
              ? (item.data?.title as string) || 'New Source'
              : 'New Concept',
          },
          origin: [0.5, 0.5],
        };

        // Add node to canvas
        const currentNodes = getNodes();
        setNodes([...currentNodes, newNode]);

        // Clear any selection and select new node
        storeApi.setState({
          nodesSelection: null,
        } as any);
      } catch (error) {
        console.error('Failed to parse drag data:', error);
      }
    },
    [screenToFlowPosition, getNodes, setNodes, storeApi]
  );

  return {
    handleDragOver,
    handleDrop,
  };
};

/**
 * Hook for making sidebar items draggable
 */
export const useSidebarDrag = () => {
  const handleDragStart = useCallback(
    (event: React.DragEvent, item: DragItem) => {
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  return { handleDragStart };
};
