/**
 * @fileoverview Centralized Tool Registry Tests
 * @module infrastructure/tools/__tests__/centralized-tool-registry.test
 *
 * Unit tests for centralized tool registry.
 *
 * @epic 40 - Agent Chat Self-Switching Orchestrator
 * @story 40-01 - Create Centralized Tool Registry
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import {
  CentralizedToolRegistry,
  createRegisteredTool,
  createToolMetadata,
} from '../centralized-tool-registry';
import type { RegisteredTool, AgentMode, WorkspaceType } from '@/domain/tools';

describe('CentralizedToolRegistry', () => {
  let registry: CentralizedToolRegistry;
  let mockTools: RegisteredTool[];

  beforeEach(() => {
    // Reset singleton for each test
    CentralizedToolRegistry.resetInstance();
    registry = CentralizedToolRegistry.getInstance();

    // Create mock tools
    const mockDef1 = toolDefinition({
      name: 'test_tool_1',
      description: 'Test tool 1',
      inputSchema: z.object({ param: z.string() }),
    });

    const mockDef2 = toolDefinition({
      name: 'test_tool_2',
      description: 'Test tool 2',
      inputSchema: z.object({ value: z.number() }),
    });

    mockTools = [
      createRegisteredTool(
        mockDef1,
        createToolMetadata('test_tool_1', 'files', ['coding', 'orchestrator'], ['ide', 'knowledge'], {
          defaultTrustLevel: 'auto',
          riskLevel: 'low',
        })
      ),
      createRegisteredTool(
        mockDef2,
        createToolMetadata('test_tool_2', 'terminal', ['coding'], ['ide'], {
          defaultTrustLevel: 'prompt',
          riskLevel: 'high',
        })
      ),
    ];
  });

  afterEach(() => {
    CentralizedToolRegistry.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CentralizedToolRegistry.getInstance();
      const instance2 = CentralizedToolRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Tool Registration', () => {
    it('should register a single tool', () => {
      registry.register(mockTools[0]);
      expect(registry.count()).toBe(1);
      expect(registry.has('test_tool_1')).toBe(true);
    });

    it('should throw error on duplicate tool ID', () => {
      registry.register(mockTools[0]);
      expect(() => registry.register(mockTools[0])).toThrow(
        /already registered/
      );
    });

    it('should register multiple tools via registerAll', () => {
      registry.registerAll(mockTools);
      expect(registry.count()).toBe(2);
      expect(registry.has('test_tool_1')).toBe(true);
      expect(registry.has('test_tool_2')).toBe(true);
    });
  });

  describe('Tool Retrieval', () => {
    beforeEach(() => {
      registry.registerAll(mockTools);
    });

    it('should get tool by ID', () => {
      const tool = registry.get('test_tool_1');
      expect(tool).toBeDefined();
      expect(tool?.metadata.id).toBe('test_tool_1');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.get('non_existent');
      expect(tool).toBeUndefined();
    });

    it('should check tool existence with has()', () => {
      expect(registry.has('test_tool_1')).toBe(true);
      expect(registry.has('non_existent')).toBe(false);
    });

    it('should get all tools', () => {
      const allTools = registry.getAll();
      expect(allTools).toHaveLength(2);
    });

    it('should return correct count', () => {
      expect(registry.count()).toBe(2);
    });

    it('should get all tool IDs', () => {
      const ids = registry.getToolIds();
      expect(ids).toEqual(expect.arrayContaining(['test_tool_1', 'test_tool_2']));
      expect(ids).toHaveLength(2);
    });
  });

  describe('Tool Filtering', () => {
    beforeEach(() => {
      registry.registerAll(mockTools);
    });

    it('should filter by mode', () => {
      const codingTools = registry.getFilteredTools({ mode: 'coding' as AgentMode });
      expect(codingTools).toHaveLength(2);

      const orchestratorTools = registry.getFilteredTools({ mode: 'orchestrator' as AgentMode });
      expect(orchestratorTools).toHaveLength(1);
      expect(orchestratorTools[0].metadata.id).toBe('test_tool_1');
    });

    it('should filter by workspace type', () => {
      const ideTools = registry.getFilteredTools({ workspaceType: 'ide' as WorkspaceType });
      expect(ideTools).toHaveLength(2);

      const knowledgeTools = registry.getFilteredTools({ workspaceType: 'knowledge' as WorkspaceType });
      expect(knowledgeTools).toHaveLength(1);
      expect(knowledgeTools[0].metadata.id).toBe('test_tool_1');
    });

    it('should filter by category', () => {
      const fileTools = registry.getFilteredTools({ category: 'files' });
      expect(fileTools).toHaveLength(1);
      expect(fileTools[0].metadata.id).toBe('test_tool_1');
    });

    it('should filter by server exposure flag', () => {
      const serverTools = registry.getFilteredTools({ serverExposedOnly: true });
      // Both tools are server exposed by default
      expect(serverTools).toHaveLength(2);
    });

    it('should apply all filters together (AND logic)', () => {
      const filtered = registry.getFilteredTools({
        mode: 'coding' as AgentMode,
        workspaceType: 'ide' as WorkspaceType,
        category: 'terminal',
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].metadata.id).toBe('test_tool_2');
    });

    it('should return empty result when no tools match', () => {
      const filtered = registry.getFilteredTools({
        mode: 'knowledge' as AgentMode,
        workspaceType: 'study' as WorkspaceType,
      });
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getServerExposedTools', () => {
    beforeEach(() => {
      registry.registerAll(mockTools);
    });

    it('should return only server-exposed tools', () => {
      const serverTools = registry.getServerExposedTools();
      // Both tools are server exposed by default
      expect(serverTools).toHaveLength(2);
    });

    it('should apply additional filters', () => {
      const serverTools = registry.getServerExposedTools({
        mode: 'orchestrator' as AgentMode,
      });
      expect(serverTools).toHaveLength(1);
      expect(serverTools[0].metadata.id).toBe('test_tool_1');
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      registry.registerAll(mockTools);
    });

    it('should get tools by category', () => {
      const fileTools = registry.getByCategory('files');
      expect(fileTools).toHaveLength(1);
      expect(fileTools[0].metadata.id).toBe('test_tool_1');
    });

    it('should get tools by mode', () => {
      const codingTools = registry.getByMode('coding' as AgentMode);
      expect(codingTools).toHaveLength(2);
    });

    it('should clear all tools', () => {
      expect(registry.count()).toBe(2);
      registry.clear();
      expect(registry.count()).toBe(0);
    });
  });

  describe('Tool Unregistration', () => {
    beforeEach(() => {
      registry.registerAll(mockTools);
    });

    it('should unregister tool', () => {
      expect(registry.has('test_tool_1')).toBe(true);
      const result = registry.unregister('test_tool_1');
      expect(result).toBe(true);
      expect(registry.has('test_tool_1')).toBe(false);
      expect(registry.count()).toBe(1);
    });

    it('should return false when unregistering non-existent tool', () => {
      const result = registry.unregister('non_existent');
      expect(result).toBe(false);
      expect(registry.count()).toBe(2);
    });
  });
});

describe('createToolMetadata', () => {
  it('should create tool metadata with defaults', () => {
    const metadata = createToolMetadata(
      'test_tool',
      'files',
      ['coding'],
      ['ide']
    );

    expect(metadata.id).toBe('test_tool');
    expect(metadata.category).toBe('files');
    expect(metadata.allowedModes).toEqual(['coding']);
    expect(metadata.allowedWorkspaces).toEqual(['ide']);
    expect(metadata.defaultTrustLevel).toBe('prompt');
    expect(metadata.serverExposed).toBe(true);
    expect(metadata.executionSide).toBe('both');
    expect(metadata.riskLevel).toBe('medium');
  });

  it('should override defaults with options', () => {
    const metadata = createToolMetadata(
      'test_tool',
      'files',
      ['coding'],
      ['ide'],
      {
        defaultTrustLevel: 'auto',
        riskLevel: 'low',
        serverExposed: false,
        executionSide: 'server',
      }
    );

    expect(metadata.defaultTrustLevel).toBe('auto');
    expect(metadata.riskLevel).toBe('low');
    expect(metadata.serverExposed).toBe(false);
    expect(metadata.executionSide).toBe('server');
  });
});

describe('createRegisteredTool', () => {
  it('should create registered tool from definition and metadata', () => {
    const def = toolDefinition({
      name: 'test_tool',
      description: 'Test',
      inputSchema: z.object({}),
    });

    const metadata = createToolMetadata('test_tool', 'files', ['coding'], ['ide']);

    const registered = createRegisteredTool(def, metadata);

    expect(registered.definition).toBe(def);
    expect(registered.metadata).toBe(metadata);
  });
});

/**
 * AC-4: Permission Filtering Works
 * Tests verifying that tools are filtered based on user permission levels
 */
describe('Permission Filtering (AC-4)', () => {
  let registry: CentralizedToolRegistry;
  let autoTools: RegisteredTool[];
  let promptTools: RegisteredTool[];
  let blockTools: RegisteredTool[];

  beforeEach(() => {
    CentralizedToolRegistry.resetInstance();
    registry = CentralizedToolRegistry.getInstance();

    // Create tools with different trust levels
    const createTool = (
      id: string,
      category: 'files' | 'terminal' | 'knowledge',
      trustLevel: 'auto' | 'prompt' | 'block'
    ): RegisteredTool => {
      const def = toolDefinition({
        name: id,
        description: `${id} description`,
        inputSchema: z.object({}),
      });

      return createRegisteredTool(
        def,
        createToolMetadata(id, category, ['coding'], ['ide'], {
          defaultTrustLevel: trustLevel,
        })
      );
    };

    autoTools = [
      createTool('auto_tool_1', 'files', 'auto'),
      createTool('auto_tool_2', 'knowledge', 'auto'),
    ];

    promptTools = [
      createTool('prompt_tool_1', 'terminal', 'prompt'),
      createTool('prompt_tool_2', 'files', 'prompt'),
    ];

    blockTools = [
      createTool('block_tool_1', 'terminal', 'block'),
      createTool('block_tool_2', 'knowledge', 'block'),
    ];

    registry.registerAll([...autoTools, ...promptTools, ...blockTools]);
  });

  afterEach(() => {
    CentralizedToolRegistry.resetInstance();
  });

  describe('by defaultTrustLevel metadata', () => {
    it('should include tools with auto trust level', () => {
      const tools = registry.getAll().filter(
        (t) => t.metadata.defaultTrustLevel === 'auto'
      );
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.metadata.id)).toEqual(
        expect.arrayContaining(['auto_tool_1', 'auto_tool_2'])
      );
    });

    it('should include tools with prompt trust level', () => {
      const tools = registry.getAll().filter(
        (t) => t.metadata.defaultTrustLevel === 'prompt'
      );
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.metadata.id)).toEqual(
        expect.arrayContaining(['prompt_tool_1', 'prompt_tool_2'])
      );
    });

    it('should include tools with block trust level in registry', () => {
      // Tools with block trust level are registered but should be filtered
      // out at the application layer based on user permissions
      const tools = registry.getAll().filter(
        (t) => t.metadata.defaultTrustLevel === 'block'
      );
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.metadata.id)).toEqual(
        expect.arrayContaining(['block_tool_1', 'block_tool_2'])
      );
    });
  });

  describe('simulating permission-based filtering', () => {
    /**
     * NOTE: Actual permission filtering happens at the application layer
     * where user permissions are available. These tests verify the
     * metadata is correctly set for filtering logic.
     */
    it('should have correct metadata for permission filtering decisions', () => {
      const autoTool = registry.get('auto_tool_1');
      const promptTool = registry.get('prompt_tool_1');
      const blockTool = registry.get('block_tool_1');

      expect(autoTool?.metadata.defaultTrustLevel).toBe('auto');
      expect(autoTool?.metadata.riskLevel).toBe('medium'); // default from options

      expect(promptTool?.metadata.defaultTrustLevel).toBe('prompt');
      expect(promptTool?.metadata.riskLevel).toBe('medium');

      expect(blockTool?.metadata.defaultTrustLevel).toBe('block');
      expect(blockTool?.metadata.riskLevel).toBe('medium');
    });

    it('should allow filtering by trust level via metadata inspection', () => {
      // Simulate filtering tools by user permission level
      const getToolsByTrustLevel = (
        level: 'auto' | 'prompt' | 'block'
      ): RegisteredTool[] => {
        return registry.getAll().filter(
          (t) => t.metadata.defaultTrustLevel === level
        );
      };

      const autoOnly = getToolsByTrustLevel('auto');
      const promptOnly = getToolsByTrustLevel('prompt');
      const blockOnly = getToolsByTrustLevel('block');

      expect(autoOnly).toHaveLength(2);
      expect(promptOnly).toHaveLength(2);
      expect(blockOnly).toHaveLength(2);
    });
  });
});

/**
 * Issue #4: Integration tests for tool catalog
 * Tests verifying that tool catalog initializes correctly
 */
describe('Tool Catalog Integration', () => {
  it('should have all required exports from tool-catalog', () => {
    // Verify tool catalog exports the required functions
    expect(async () => {
      await import('../tool-catalog');
    }).not.toThrow();
  });

  it('should export initializeToolRegistry function', async () => {
    const catalog = await import('../tool-catalog');
    expect(typeof catalog.initializeToolRegistry).toBe('function');
  });

  it('should export TOOL_CATALOG constant', async () => {
    const catalog = await import('../tool-catalog');
    expect(Array.isArray(catalog.TOOL_CATALOG)).toBe(true);
  });

  it('should have TOOL_CATALOG with 16 existing tools (11 + 5 note tools from story 40-05)', async () => {
    const { TOOL_CATALOG } = await import('../tool-catalog');
    expect(TOOL_CATALOG).toHaveLength(16);
  });

  it('should register tools with consistent metadata structure', async () => {
    const { TOOL_CATALOG } = await import('../tool-catalog');

    TOOL_CATALOG.forEach(({ metadata }) => {
      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('category');
      expect(metadata).toHaveProperty('allowedModes');
      expect(metadata).toHaveProperty('allowedWorkspaces');
      expect(metadata).toHaveProperty('defaultTrustLevel');
      expect(metadata).toHaveProperty('serverExposed');
      expect(metadata).toHaveProperty('executionSide');
      expect(metadata).toHaveProperty('riskLevel');
    });
  });
});
