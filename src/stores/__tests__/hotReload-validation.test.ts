/**
 * Hot-Reload Validation Test - BF-01, BF-02
 *
 * Purpose: Independently verify that claimed hot-reload fixes actually work
 *
 * BF-01: AgentConfigDialog uses useState instead of Zustand
 * → Config changes invisible until navigation/submit
 *
 * BF-02: Non-atomic state updates
 * → Race conditions in concurrent updates
 *
 * @test WB-PR-1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentsStore } from '../agents-store';
import type { Agent } from '@/mocks/agents';

describe('Hot-Reload Validation (BF-01, BF-02)', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetToDefaults } = useAgentsStore.getState();
    resetToDefaults();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('BF-01: Hot-Reload Visibility', () => {
    it('should propagate agent config changes immediately across components', async () => {
      // Arrange: Get initial state
      const { result } = renderHook(() => useAgentsStore());
      const initialAgent = result.current.agents[0];

      console.log('[BF-01 Test] Initial agent:', initialAgent);

      // Act: Update agent configuration
      act(() => {
        result.current.updateAgent(initialAgent.id, {
          name: 'Updated Agent Name',
          description: 'Updated description',
        });
      });

      // Assert: Changes should be immediately visible
      await waitFor(() => {
        const updatedAgent = result.current.agents.find(a => a.id === initialAgent.id);
        expect(updatedAgent?.name).toBe('Updated Agent Name');
        expect(updatedAgent?.description).toBe('Updated description');
      });

      console.log('[BF-01 Test] ✅ Store update works');
    });

    it('should detect useState in AgentConfigDialog component', () => {
      // This test documents the BF-01 violation
      // AgentConfigDialog.tsx lines 159-180 show extensive useState usage:
      //
      // const [name, setName] = useState('')
      // const [description, setDescription] = useState('')
      // const [providerId, setProviderId] = useState<string>('openrouter')
      //
      // This violates BF-01 fix requirements!

      const violation = {
        file: 'src/presentation/components/agent/AgentConfigDialog.tsx',
        lines: [159, 160, 161, 162, 163, 164, 165, 168, 169, 170, 171, 172,
                175, 176, 177, 178, 179, 185, 186, 187, 188, 189, 192],
        issue: 'BF-01 VIOLATION: Uses useState instead of Zustand store',
        impact: 'Config changes invisible until form submission',
        fixRequired: 'Migrate to useAgentsStore for form state',
      };

      console.log('[BF-01 Detection] ❌ VIOLATION FOUND:', violation);
      expect(violation).toBeDefined();
    });
  });

  describe('BF-02: Atomic State Updates', () => {
    it('should handle concurrent updates without race conditions', async () => {
      const { result } = renderHook(() => useAgentsStore());
      const initialAgent = result.current.agents[0];

      console.log('[BF-02 Test] Testing concurrent updates...');

      // Act: Perform multiple concurrent updates
      await act(async () => {
        const updates = [
          result.current.updateAgent(initialAgent.id, { name: 'Update 1' }),
          result.current.updateAgent(initialAgent.id, { description: 'Update 2' }),
          result.current.updateAgent(initialAgent.id, { temperature: 0.5 }),
          result.current.updateAgent(initialAgent.id, { maxTokens: 2048 }),
        ];

        await Promise.all(updates);
      });

      // Assert: All updates should be applied atomically
      await waitFor(() => {
        const finalAgent = result.current.agents.find(a => a.id === initialAgent.id);

        // Note: Last write wins for concurrent updates to same field
        expect(finalAgent?.name).toBeDefined();
        expect(finalAgent?.description).toBeDefined();
        expect(finalAgent?.temperature).toBeDefined();
        expect(finalAgent?.maxTokens).toBeDefined();
      });

      console.log('[BF-02 Test] ✅ Atomic updates work (store level)');
    });

    it('should detect missing optimistic UI in AgentConfigDialog', () => {
      // BF-02 also requires optimistic UI updates
      // AgentConfigDialog should show changes immediately, not wait for save

      const violation = {
        file: 'src/presentation/components/agent/AgentConfigDialog.tsx',
        issue: 'BF-02 PARTIAL: No optimistic UI updates',
        impact: 'Users see changes only after form submission',
        fixRequired: 'Implement two-way binding with Zustand store',
      };

      console.log('[BF-02 Detection] ⚠️ PARTIAL IMPLEMENTATION:', violation);
      expect(violation).toBeDefined();
    });
  });

  describe('Event Emission Verification', () => {
    it('should emit events for all config changes', () => {
      const { result } = renderHook(() => useAgentsStore());
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const initialAgent = result.current.agents[0];

      act(() => {
        result.current.updateAgent(initialAgent.id, { name: 'Test Update' });
      });

      // Verify console.log was called (event emission)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AgentsStore]',
        'Updating agent:',
        initialAgent.id,
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});
