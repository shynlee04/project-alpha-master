import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useCanvasDrop, useSidebarDrag } from '../useCanvasDrop';

// Mock React Flow hooks
const mockScreenToFlowPosition = vi.fn();
const mockGetNodes = vi.fn();
const mockSetNodes = vi.fn();

vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@xyflow/react')>();
  return {
    ...actual,
    useReactFlow: vi.fn(() => ({
      screenToFlowPosition: mockScreenToFlowPosition,
      getNodes: mockGetNodes,
      setNodes: mockSetNodes,
    })),
    useStoreApi: vi.fn(() => ({
      setState: vi.fn(),
    })),
  };
});

describe('useCanvasDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScreenToFlowPosition.mockReturnValue({ x: 100, y: 200 });
    mockGetNodes.mockReturnValue([]);
  });

  describe('handleDragOver', () => {
    it('prevents default event behavior', () => {
      const { result } = renderHook(() => useCanvasDrop());
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.dataTransfer.dropEffect).toBe('move');
    });
  });

  describe('handleDrop', () => {
    it('does nothing when drag data is empty', () => {
      const { result } = renderHook(() => useCanvasDrop());
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: { getData: vi.fn().mockReturnValue('') },
        clientX: 100,
        clientY: 200,
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(event);
      });

      expect(mockSetNodes).not.toHaveBeenCalled();
    });

    it('creates source node when valid source data is dropped', () => {
      const { result } = renderHook(() => useCanvasDrop());
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue(
            JSON.stringify({
              type: 'source',
              sourceId: 'src-1',
              data: { title: 'Test Source', contentType: 'pdf' },
            })
          ),
        },
        clientX: 150,
        clientY: 250,
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(event);
      });

      expect(mockScreenToFlowPosition).toHaveBeenCalledWith({ x: 150, y: 250 });
      expect(mockSetNodes).toHaveBeenCalled();
    });

    it('creates concept node when concept data is dropped', () => {
      const { result } = renderHook(() => useCanvasDrop());
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue(
            JSON.stringify({
              type: 'concept',
              data: { title: 'New Concept' },
            })
          ),
        },
        clientX: 300,
        clientY: 400,
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(event);
      });

      expect(mockSetNodes).toHaveBeenCalled();
    });

    it('logs error when drag data is invalid JSON', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useCanvasDrop());
      const event = {
        preventDefault: vi.fn(),
        dataTransfer: { getData: vi.fn().mockReturnValue('invalid json') },
        clientX: 100,
        clientY: 200,
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(event);
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});

describe('useSidebarDrag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets drag data with JSON stringified item', () => {
    const { result } = renderHook(() => useSidebarDrag());
    const event = {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: '',
      },
    } as unknown as React.DragEvent;
    const item = {
      type: 'source',
      sourceId: 'src-1',
      data: { title: 'Test Source' },
    };

    act(() => {
      result.current.handleDragStart(event, item);
    });

    expect(event.dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify(item)
    );
    expect(event.dataTransfer.effectAllowed).toBe('move');
  });
});
