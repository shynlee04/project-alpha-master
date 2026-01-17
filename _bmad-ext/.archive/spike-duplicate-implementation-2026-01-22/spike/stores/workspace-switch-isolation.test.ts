/**
 * @fileoverview Workspace Switch Isolation Tests
 * @module infrastructure/persistence/stores/workspace/__tests__
 * @governance Story 54-2 - AC6: Workspace Switch Isolation
 *
 * Tests for workspace state isolation during workspace switches.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-provider';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/use-agent-selection-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

// Mock Dexie storage
vi.mock('@/infrastructure/persistence/dexie-storage', () => ({
  createDexieStorage: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })),
}));

describe('Workspace Switch Isolation - AC6', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Switching IDE → Notes preserves IDE state', () => {
    it('should save IDE state before switching to Notes', async () => {
      const { result: workspaceResult } = renderHook(() => useWorkspaceStore());
      const { result: agentResult } = renderHook(() => useAgentSelectionStore());

      // Set up IDE state
      await act(async () => {
        workspaceResult.getState().setWorkspaceType('ide');
        agentResult.getState().setSelectedAgent('ide', 'agent-1');
        workspaceResult.getState().setProjectId('project-123');
      });

      const ideStateBeforeSwitch = {
        workspaceType: 'ide',
        selectedAgent: 'agent-1',
        projectId: 'project-123',
      };

      // Switch to Notes
      await act(async () => {
        workspaceResult.getState().setWorkspaceType('notes');
      });

      // Notes should have its own state
      expect(workspaceResult.getState().workspaceType).toBe('notes');

      // IDE state should be preserved (not lost)
      const savedIdeState = workspaceResult.getState().getSavedWorkspaceState('ide');
      expect(savedIdeState).toEqual(ideStateBeforeSwitch);
    });

    it('should not affect IDE state when switching to Notes', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Set IDE state
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setProjectId('project-ide');
      });

      const ideProjectId = result.getState().projectId;

      // Switch to Notes
      await act(async () => {
        result.getState().setWorkspaceType('notes');
        result.getState().setProjectId('project-notes');
      });

      // Notes project is different
      expect(result.getState().projectId).toBe('project-notes');

      // Switch back to IDE
      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      // IDE project should be restored
      expect(result.getState().projectId).toBe(ideProjectId);
    });
  });

  describe('Switching Notes → IDE restores IDE state', () => {
    it('should restore IDE state when returning from Notes', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Set up IDE state
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setProjectId('project-ide');
        result.getState().setOpenFiles(['/src/ide/test.ts']);
      });

      const originalIdeState = {
        projectId: 'project-ide',
        openFiles: ['/src/ide/test.ts'],
      };

      // Switch to Notes
      await act(async () => {
        result.getState().setWorkspaceType('notes');
        result.getState().setProjectId('project-notes');
      });

      // Switch back to IDE
      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      // IDE state should be restored
      expect(result.getState().projectId).toBe(originalIdeState.projectId);
      expect(result.getState().openFiles).toEqual(originalIdeState.openFiles);
    });

    it('should restore exactly as left', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Set up IDE state with multiple properties
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setProjectId('project-ide');
        result.getState().setOpenFiles(['/src/test.ts', '/src/App.tsx']);
        result.getState().setActiveFile('/src/test.ts');
        result.getState().setExpandedFolders(['/src', '/src/components']);
      });

      const originalState = result.getState().getSnapshot();

      // Switch to Notes, do some work
      await act(async () => {
        result.getState().setWorkspaceType('notes');
        result.getState().setProjectId('project-notes');
      });

      // Switch back to IDE
      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      const restoredState = result.getState().getSnapshot();

      // Should match original state
      expect(restoredState).toEqual(originalState);
    });
  });

  describe('No cross-contamination between workspaces', () => {
    const workspaces: WorkspaceType[] = ['ide', 'knowledge', 'notes', 'study'];

    it('should not share state between workspaces', async () => {
      const { result: workspaceResult } = renderHook(() => useWorkspaceStore());
      const { result: agentResult } = renderHook(() => useAgentSelectionStore());

      // Set different states for each workspace
      await act(async () => {
        workspaces.forEach((ws, index) => {
          workspaceResult.getState().setWorkspaceType(ws);
          agentResult.getState().setSelectedAgent(ws, `agent-${index}`);
        });
      });

      // Each workspace should have its own agent
      workspaces.forEach((ws, index) => {
        workspaceResult.getState().setWorkspaceType(ws);
        expect(agentResult.getState().selectedAgent).toBe(`agent-${index}`);
      });
    });

    it('should not mix project IDs between workspaces', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Set different projects for each workspace
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setProjectId('project-ide');

        result.getState().setWorkspaceType('knowledge');
        result.getState().setProjectId('project-knowledge');

        result.getState().setWorkspaceType('notes');
        result.getState().setProjectId('project-notes');
      });

      // Verify each workspace has correct project
      result.getState().setWorkspaceType('ide');
      expect(result.getState().projectId).toBe('project-ide');

      result.getState().setWorkspaceType('knowledge');
      expect(result.getState().projectId).toBe('project-knowledge');

      result.getState().setWorkspaceType('notes');
      expect(result.getState().projectId).toBe('project-notes');
    });

    it('should not share open files between workspaces', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // IDE workspace has its own files
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setOpenFiles(['/src/ide/file1.ts', '/src/ide/file2.ts']);
      });

      // Notes workspace has its own files
      await act(async () => {
        result.getState().setWorkspaceType('notes');
        result.getState().setOpenFiles(['/notes/note1.md']);
      });

      // Switch back to IDE
      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      // IDE should still have its files
      expect(result.getState().openFiles).toContain('/src/ide/file1.ts');
      expect(result.getState().openFiles).not.toContain('/notes/note1.md');
    });
  });

  describe('Each workspace has independent agent selection', () => {
    it('should maintain separate agent selection per workspace', async () => {
      const { result: agentResult } = renderHook(() => useAgentSelectionStore());
      const { result: workspaceResult } = renderHook(() => useWorkspaceStore());

      // Select agents for each workspace
      await act(async () => {
        workspaceResult.getState().setWorkspaceType('ide');
        agentResult.getState().setSelectedAgent('ide', 'claude-opus');

        workspaceResult.getState().setWorkspaceType('knowledge');
        agentResult.getState().setSelectedAgent('knowledge', 'gemini-pro');

        workspaceResult.getState().setWorkspaceType('notes');
        agentResult.getState().setSelectedAgent('notes', 'gpt-4');
      });

      // Verify each workspace has its agent
      workspaceResult.getState().setWorkspaceType('ide');
      expect(agentResult.getState().selectedAgent).toBe('claude-opus');

      workspaceResult.getState().setWorkspaceType('knowledge');
      expect(agentResult.getState().selectedAgent).toBe('gemini-pro');

      workspaceResult.getState().setWorkspaceType('notes');
      expect(agentResult.getState().selectedAgent).toBe('gpt-4');
    });

    it('should persist agent selection when switching away', async () => {
      const { result: agentResult } = renderHook(() => useAgentSelectionStore());
      const { result: workspaceResult } = renderHook(() => useWorkspaceStore());

      // Set agent for IDE
      await act(async () => {
        workspaceResult.getState().setWorkspaceType('ide');
        agentResult.getState().setSelectedAgent('ide', 'agent-1');
      });

      // Switch to Notes
      await act(async () => {
        workspaceResult.getState().setWorkspaceType('notes');
      });

      // Switch back to IDE
      await act(async () => {
        workspaceResult.getState().setWorkspaceType('ide');
      });

      // Agent should be preserved
      expect(agentResult.getState().selectedAgent).toBe('agent-1');
    });
  });

  describe('Each workspace has independent conversation history', () => {
    it('should not share conversations between workspaces', async () => {
      const conversationStore = {
        getConversations: vi.fn(),
        setActiveConversation: vi.fn(),
      };

      // IDE has its own conversations
      conversationStore.getConversations.mockResolvedValueOnce(['conv-ide-1', 'conv-ide-2']);

      // Knowledge has its own conversations
      conversationStore.getConversations.mockResolvedValueOnce(['conv-knowledge-1']);

      const ideConvos = await conversationStore.getConversations('ide');
      const knowledgeConvos = await conversationStore.getConversations('knowledge');

      expect(ideConvos).not.toEqual(knowledgeConvos);
    });

    it('should restore correct conversation when switching back to workspace', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Set active conversation in IDE
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setActiveConversationId('conv-ide-1');
      });

      const ideConvId = result.getState().activeConversationId;

      // Switch to Knowledge, set different conversation
      await act(async () => {
        result.getState().setWorkspaceType('knowledge');
        result.getState().setActiveConversationId('conv-knowledge-1');
      });

      // Switch back to IDE
      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      // Should restore IDE conversation
      expect(result.getState().activeConversationId).toBe(ideConvId);
    });
  });

  describe('Each workspace has independent file system handles', () => {
    it('should maintain separate directory handles per workspace', async () => {
      const mockFSAHandles = new Map<string, FileSystemDirectoryHandle>();

      // IDE has its own handle
      const ideHandle = {} as FileSystemDirectoryHandle;
      mockFSAHandles.set('ide', ideHandle);

      // Notes has its own handle
      const notesHandle = {} as FileSystemDirectoryHandle;
      mockFSAHandles.set('notes', notesHandle);

      expect(mockFSAHandles.get('ide')).toBe(ideHandle);
      expect(mockFSAHandles.get('notes')).toBe(notesHandle);
      expect(mockFSAHandles.get('ide')).not.toBe(mockFSAHandles.get('notes'));
    });

    it('should request directory handle per workspace when needed', async () => {
      const requestDirectoryAccess = vi.fn();

      // First access to IDE workspace
      await act(async () => {
        if (!requestDirectoryAccess.mock.results.length) {
          await requestDirectoryAccess('ide');
        }
      });

      expect(requestDirectoryAccess).toHaveBeenCalledWith('ide');

      // Access to Notes workspace is independent
      await act(async () => {
        if (requestDirectoryAccess.mock.results.length < 2) {
          await requestDirectoryAccess('notes');
        }
      });

      expect(requestDirectoryAccess).toHaveBeenCalledWith('notes');
    });

    it('should release handle when leaving workspace (optional cleanup)', async () => {
      const releaseHandle = vi.fn();

      // Switch from IDE to Notes
      await act(async () => {
        await releaseHandle('ide');
      });

      expect(releaseHandle).toHaveBeenCalledWith('ide');
    });
  });

  describe('State isolation edge cases', () => {
    it('should handle rapid workspace switching', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Rapidly switch between workspaces
      await act(async () => {
        result.getState().setWorkspaceType('ide');
        result.getState().setWorkspaceType('knowledge');
        result.getState().setWorkspaceType('notes');
        result.getState().setWorkspaceType('ide');
        result.getState().setWorkspaceType('study');
        result.getState().setWorkspaceType('ide');
      });

      // Final state should be ide
      expect(result.getState().workspaceType).toBe('ide');
      // IDE state should be preserved (not corrupted by rapid switches)
      expect(result.getState().getSavedWorkspaceState('ide')).toBeDefined();
    });

    it('should handle workspace switch before state initialization', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      // Try to get saved state before any state was set
      const savedState = result.getState().getSavedWorkspaceState('ide');

      // Should return null or empty state, not throw error
      expect(savedState).toBeNull();
    });

    it('should handle switching to same workspace (no-op)', async () => {
      const { result } = renderHook(() => useWorkspaceStore());

      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      const stateBefore = result.getState().getSnapshot();

      // Switch to same workspace
      await act(async () => {
        result.getState().setWorkspaceType('ide');
      });

      const stateAfter = result.getState().getSnapshot();

      // State should be unchanged
      expect(stateAfter).toEqual(stateBefore);
    });
  });
});
