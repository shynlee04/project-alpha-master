/**
 * @fileoverview IDE State Persistence Tests
 * @module infrastructure/persistence/stores/ide/__tests__
 * @governance Story 54-2 - AC5: IDE State Persistence
 *
 * Tests for IDE state persistence to IndexedDB and restoration.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { createIDEStore, useIDEStore } from '../ide-store';

// Mock IndexedDB
vi.mock('@/infrastructure/persistence/dexie-db', () => ({
  db: {
    ideState: {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  },
  createDexieStorage: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })),
}));

// Mock Zustand persist
vi.mock('zustand/middleware', () => ({
  persist: (config: unknown) => config,
}));

describe('IDE State Persistence - AC5', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Open files list saved to IndexedDB', () => {
    it('should save open files when files are opened', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.openFile('/src/components/App.tsx');
      });

      const state = result.current;
      expect(state.openFiles).toContain('/src/test.ts');
      expect(state.openFiles).toContain('/src/components/App.tsx');
      expect(state.openFiles).toHaveLength(2);
    });

    it('should persist open files to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        // Trigger persist
        result.current.persist();
      });

      // Verify IndexedDB put was called
      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          openFiles: expect.arrayContaining(['/src/test.ts']),
        })
      );
    });

    it('should not duplicate files when opening same file twice', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.openFile('/src/test.ts'); // Same file
      });

      expect(result.current.openFiles).toHaveLength(1);
    });
  });

  describe('Active file saved and restored', () => {
    it('should save active file when opening file', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
      });

      expect(result.current.activeFile).toBe('/src/test.ts');
    });

    it('should change active file when switching files', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.openFile('/src/components/App.tsx');
      });

      expect(result.current.activeFile).toBe('/src/components/App.tsx');
    });

    it('should persist active file to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/active.ts');
        result.current.persist();
      });

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          activeFile: '/src/active.ts',
        })
      );
    });

    it('should clear active file when closing all files', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.closeAllFiles();
      });

      expect(result.current.activeFile).toBeNull();
    });
  });

  describe('Expanded folders saved and restored', () => {
    it('should save expanded folders', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.expandFolder('/src');
        result.current.expandFolder('/src/components');
      });

      expect(result.current.expandedFolders).toContain('/src');
      expect(result.current.expandedFolders).toContain('/src/components');
    });

    it('should collapse folder', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.expandFolder('/src');
        result.current.collapseFolder('/src');
      });

      expect(result.current.expandedFolders).not.toContain('/src');
    });

    it('should persist expanded folders to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.expandFolder('/src');
        result.current.persist();
      });

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          expandedFolders: expect.arrayContaining(['/src']),
        })
      );
    });
  });

  describe('Panel layout (ratios) saved and restored', () => {
    it('should save panel layout ratios', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setPanelLayout({
          sidebar: 0.2,
          explorer: 0.25,
          editor: 0.4,
          terminal: 0.15,
        });
      });

      expect(result.current.panelLayout).toEqual({
        sidebar: 0.2,
        explorer: 0.25,
        editor: 0.4,
        terminal: 0.15,
      });
    });

    it('should persist panel layout to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setPanelLayout({
          sidebar: 0.2,
          explorer: 0.25,
          editor: 0.4,
          terminal: 0.15,
        });
        result.current.persist();
      });

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          panelLayout: expect.any(Object),
        })
      );
    });
  });

  describe('Scroll positions saved and restored', () => {
    it('should save scroll position for active file', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.setScrollPosition('/src/test.ts', 250);
      });

      expect(result.current.scrollPositions['/src/test.ts']).toBe(250);
    });

    it('should restore scroll position when reopening file', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.setScrollPosition('/src/test.ts', 500);
        result.current.closeFile('/src/test.ts');
        // Reopen file
        result.current.openFile('/src/test.ts');
      });

      // Should restore scroll position
      const scrollPos = result.current.getScrollPosition('/src/test.ts');
      expect(scrollPos).toBe(500);
    });

    it('should persist scroll positions to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setScrollPosition('/src/test.ts', 300);
        result.current.persist();
      });

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          scrollPositions: expect.any(Object),
        })
      );
    });
  });

  describe('Terminal tab selection saved and restored', () => {
    it('should save active terminal tab', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setTerminalTab('output');
      });

      expect(result.current.terminalTab).toBe('output');
    });

    it('should switch between terminal and output tabs', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setTerminalTab('terminal');
        result.current.setTerminalTab('output');
        result.current.setTerminalTab('problems');
      });

      expect(result.current.terminalTab).toBe('problems');
    });

    it('should persist terminal tab to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setTerminalTab('terminal');
        result.current.persist();
      });

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          terminalTab: 'terminal',
        })
      );
    });
  });

  describe('Chat panel state saved and restored', () => {
    it('should save chat panel visibility', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setChatPanelOpen(true);
      });

      expect(result.current.isChatPanelOpen).toBe(true);
    });

    it('should toggle chat panel', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setChatPanelOpen(true);
        result.current.toggleChatPanel();
      });

      expect(result.current.isChatPanelOpen).toBe(false);
    });

    it('should persist chat panel state to IndexedDB', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.setChatPanelOpen(true);
        result.current.persist();
      });

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          isChatPanelOpen: true,
        })
      );
    });
  });

  describe('Survives browser refresh', () => {
    it('should restore state after browser refresh', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        openFiles: ['/src/test.ts'],
        activeFile: '/src/test.ts',
        expandedFolders: ['/src'],
        panelLayout: { sidebar: 0.2, explorer: 0.25, editor: 0.4, terminal: 0.15 },
        terminalTab: 'terminal',
        isChatPanelOpen: true,
        scrollPositions: { '/src/test.ts': 100 },
      });

      vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.get).mockImplementation(mockGet);

      // Create new store instance (simulates refresh)
      const store = createIDEStore();

      // Hydrate from persisted state
      await act(async () => {
        await store.hydrate();
      });

      const state = store.getState();
      expect(state.openFiles).toContain('/src/test.ts');
      expect(state.activeFile).toBe('/src/test.ts');
    });
  });

  describe('Survives workspace switch', () => {
    it('should save state when switching away from IDE', async () => {
      const { result } = renderHook(() => useIDEStore());

      await act(async () => {
        result.current.openFile('/src/test.ts');
        result.current.expandFolder('/src');
        result.current.setScrollPosition('/src/test.ts', 150);
        // Simulate workspace switch
        result.current.saveForWorkspaceSwitch();
      });

      // State should be saved
      expect(result.current.lastSavedState).toBeDefined();
      expect(result.current.lastSavedState?.openFiles).toContain('/src/test.ts');
    });

    it('should restore state when switching back to IDE', async () => {
      const { result } = renderHook(() => useIDEStore());

      const savedState = {
        openFiles: ['/src/test.ts'],
        activeFile: '/src/test.ts',
        expandedFolders: ['/src'],
        scrollPositions: { '/src/test.ts': 200 },
      };

      await act(async () => {
        result.current.restoreFromWorkspaceSwitch(savedState);
      });

      expect(result.current.openFiles).toEqual(['/src/test.ts']);
      expect(result.current.activeFile).toBe('/src/test.ts');
      expect(result.current.expandedFolders).toContain('/src');
    });
  });

  describe('Multiple projects have independent state', () => {
    it('should store state per project ID', async () => {
      const project1Store = createIDEStore('project-1');
      const project2Store = createIDEStore('project-2');

      await act(async () => {
        project1Store.getState().openFile('/src/project1/test.ts');
        project2Store.getState().openFile('/src/project2/test.ts');
      });

      expect(project1Store.getState().openFiles).toContain('/src/project1/test.ts');
      expect(project2Store.getState().openFiles).toContain('/src/project2/test.ts');

      // Should not mix
      expect(project1Store.getState().openFiles).not.toContain('/src/project2/test.ts');
      expect(project2Store.getState().openFiles).not.toContain('/src/project1/test.ts');
    });

    it('should persist state separately per project', async () => {
      const mockPut = vi.mocked((await import('@/infrastructure/persistence/dexie-db')).db.ideState.put);

      const store1 = createIDEStore('project-1');
      const store2 = createIDEStore('project-2');

      await act(async () => {
        store1.getState().openFile('/src/p1/test.ts');
        store1.getState().persist();
        store2.getState().openFile('/src/p2/test.ts');
        store2.getState().persist();
      });

      // Should have two separate put calls with different keys
      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-1',
        })
      );
      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-2',
        })
      );
    });
  });
});
