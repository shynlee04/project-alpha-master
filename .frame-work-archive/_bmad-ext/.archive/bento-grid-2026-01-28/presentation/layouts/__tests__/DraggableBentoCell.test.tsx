// @vitest-environment jsdom

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { DraggableBentoCell } from '../DraggableBentoCell';
import { useBentoGridStore } from '../BentoGridStore';

type DataTransferStub = {
  data: Map<string, string>;
  setData: (type: string, value: string) => void;
  getData: (type: string) => string;
  effectAllowed: string;
  dropEffect: string;
};

const createDataTransfer = (): DataTransferStub => {
  const data = new Map<string, string>();
  return {
    data,
    setData: (type: string, value: string) => {
      data.set(type, value);
    },
    getData: (type: string) => data.get(type) ?? '',
    effectAllowed: 'move',
    dropEffect: 'move',
  };
};

const renderCells = () =>
  render(
    <div>
      <DraggableBentoCell pluginId="chat" gridArea="chat" sizeVariant="large">
        <div>Chat</div>
      </DraggableBentoCell>
      <DraggableBentoCell pluginId="filetree" gridArea="filetree" sizeVariant="medium">
        <div>Filetree</div>
      </DraggableBentoCell>
    </div>
  );

describe('DraggableBentoCell', () => {
  beforeEach(() => {
    useBentoGridStore.persist.clearStorage();
    useBentoGridStore.setState({
      _hasHydrated: true,
      activePlugins: ['chat', 'filetree'],
      pluginOrder: ['chat', 'filetree'],
    });
  });

  test('swaps plugins on drag drop', () => {
    const { getByText } = renderCells();
    const dragSource = getByText('Chat').closest('[data-plugin]') as HTMLElement;
    const dropTarget = getByText('Filetree').closest('[data-plugin]') as HTMLElement;
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(dragSource, { dataTransfer });
    fireEvent.dragOver(dropTarget, { dataTransfer });
    fireEvent.drop(dropTarget, { dataTransfer });

    expect(useBentoGridStore.getState().pluginOrder).toEqual(['filetree', 'chat']);
  });

  test('supports pointer-driven swapping for touch', () => {
    const { getByText } = renderCells();
    const dragSource = getByText('Chat').closest('[data-plugin]') as HTMLElement;
    const dropTarget = getByText('Filetree').closest('[data-plugin]') as HTMLElement;
    const dragHandle = dragSource.querySelector('[data-drag-handle]') as HTMLElement;
    const originalElementFromPoint = document.elementFromPoint;

    if (!originalElementFromPoint) {
      Object.defineProperty(document, 'elementFromPoint', {
        value: () => null,
        configurable: true,
      });
    }

    const elementFromPoint = vi.spyOn(document, 'elementFromPoint');

    elementFromPoint.mockReturnValue(dropTarget);

    fireEvent.pointerDown(dragHandle, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 10,
      clientY: 10,
    });
    fireEvent.pointerMove(dragHandle, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerUp(dragHandle, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 20,
      clientY: 20,
    });

    expect(useBentoGridStore.getState().pluginOrder).toEqual(['filetree', 'chat']);

    elementFromPoint.mockRestore();
    if (!originalElementFromPoint) {
      delete (document as { elementFromPoint?: unknown }).elementFromPoint;
    }
  });
});
