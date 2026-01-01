/**
 * @fileoverview Workspace Execution Context Tests
 * @module lib/agent/__tests__/workspace-execution-context
 *
 * Tests for workspace execution context retrieval and permission checking.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 */

import { getWorkspaceExecutionContext } from '../workspace-execution-context';
import { useWorkspaceStore } from '@/lib/state/workspace-store';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import type { Agent } from '@/core/entities/Agent';

describe('WorkspaceExecutionContext', () => {
  // Mock agent
  const mockAgent: Agent = {
    id: 'test_agent',
    name: 'Test Agent',
    description: 'Test agent for workspace execution context',
    providerId: 'openrouter',
    modelId: 'test-model',
    systemPrompt: 'Test prompt',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    tools: [],
    workspaceBindings: [
      {
        workspaceType: 'ide',
        isAvailable: true,
        uiVariant: 'full',
        isDefault: true,
      },
      {
        workspaceType: 'knowledge',
        isAvailable: false,
        uiVariant: 'compact',
        isDefault: false,
      },
    ],
    status: 'online',
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset workspace store to default state
    const workspaceStore = useWorkspaceStore.getState();
    workspaceStore.setCurrentWorkspace('ide');
    workspaceStore.setCurrentProject(null);

    // Reset agents store
    const agentsStore = useAgentsStore.getState();
    agentsStore.setActiveAgent(mockAgent.id);
  });

  describe('getWorkspaceExecutionContext', () => {
    it('should retrieve current workspace context', () => {
      const context = getWorkspaceExecutionContext();

      expect(context.workspaceType).toBe('ide');
      expect(context.projectId).toBeNull();
      expect(context.agent).toBeNull(); // No agents in store yet
      expect(context.agentAvailable).toBe(false);
    });

    it('should detect agent availability in workspace', () => {
      // Add agent to store
      const agentsStore = useAgentsStore.getState();
      agentsStore.addAgent({
        name: 'Test Agent',
        description: 'Test',
        providerId: 'openrouter',
        modelId: 'test-model',
        systemPrompt: 'Test',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
        tools: [],
        workspaceBindings: [
          {
            workspaceType: 'ide',
            isAvailable: true,
            uiVariant: 'full',
            isDefault: true,
          },
          {
            workspaceType: 'knowledge',
            isAvailable: false,
            uiVariant: 'compact',
            isDefault: false,
          },
        ],
        status: 'online',
        tasksCompleted: 0,
        successRate: 0,
        tokensUsed: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      const context = getWorkspaceExecutionContext();

      expect(context.agent).toBeDefined();
      expect(context.agentAvailable).toBe(true); // Available in IDE
      expect(context.workspaceType).toBe('ide');
    });

    it('should detect agent unavailability in workspace', () => {
      // Add agent to store
      const agentsStore = useAgentsStore.getState();
      const agent = agentsStore.addAgent({
        name: 'Test Agent',
        description: 'Test',
        providerId: 'openrouter',
        modelId: 'test-model',
        systemPrompt: 'Test',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
        tools: [],
        workspaceBindings: [
          {
            workspaceType: 'ide',
            isAvailable: true,
            uiVariant: 'full',
            isDefault: true,
          },
          {
            workspaceType: 'knowledge',
            isAvailable: false,
            uiVariant: 'compact',
            isDefault: false,
          },
        ],
        status: 'online',
        tasksCompleted: 0,
        successRate: 0,
        tokensUsed: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      agentsStore.setActiveAgent(agent.id);

      // Switch to knowledge workspace where agent is not available
      const workspaceStore = useWorkspaceStore.getState();
      workspaceStore.setCurrentWorkspace('knowledge');

      const context = getWorkspaceExecutionContext();

      expect(context.agent).toBeDefined();
      expect(context.agentAvailable).toBe(false); // Not available in knowledge
      expect(context.workspaceType).toBe('knowledge');
    });

    it('should handle missing agent gracefully', () => {
      const agentsStore = useAgentsStore.getState();
      agentsStore.setActiveAgent(null);

      const context = getWorkspaceExecutionContext();

      expect(context.agent).toBeNull();
      expect(context.agentAvailable).toBe(false);
    });
  });

  describe('createWorkspaceDeniedResponse', () => {
    it('should create standardized error response', () => {
      const { createWorkspaceDeniedResponse } = require('../workspace-execution-context');

      const response = createWorkspaceDeniedResponse('read_file', 'knowledge', 'Read File');

      expect(response.success).toBe(false);
      expect(response.blocked).toBe(true);
      expect(response.code).toBe('WORKSPACE_PERMISSION_DENIED');
      expect(response.workspaceType).toBe('knowledge');
      expect(response.error).toContain('Read File');
      expect(response.error).toContain('knowledge');
    });

    it('should use toolId if toolName not provided', () => {
      const { createWorkspaceDeniedResponse } = require('../workspace-execution-context');

      const response = createWorkspaceDeniedResponse('read_file', 'knowledge');

      expect(response.error).toContain('read_file');
    });
  });
});
