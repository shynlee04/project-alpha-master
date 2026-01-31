/**
 * @fileoverview Prompt Orchestrator Tests
 * @module lib/agent/__tests__/prompt-orchestrator
 *
 * Tests for the PromptOrchestrator class that orchestrates
 * dynamic system prompt generation based on context.
 *
 * @story 40-07 - Implement Prompt Orchestrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PromptOrchestrator,
  buildOrchestratedPrompt,
  getPromptOrchestrator,
  getPromptForMode,
  type PromptContext,
  type OrchestratedPrompt,
} from '../prompt-orchestrator';
import { toolRegistry } from '@/infrastructure/tools/centralized-tool-registry';
import { initializeToolRegistry } from '../../../infrastructure/tools/tool-catalog';

describe('PromptOrchestrator', () => {
  let orchestrator: PromptOrchestrator;

  beforeEach(() => {
    // Initialize tool registry for tests
    initializeToolRegistry();
    orchestrator = new PromptOrchestrator();
  });

  describe('buildPrompt()', () => {
    it('should classify mode from context and build prompt', () => {
      const context: PromptContext = {
        prompt: 'Create a note about TypeScript',
        workspaceType: 'notes',
      };

      const result = orchestrator.buildPrompt(context);

      expect(result).toBeDefined();
      expect(result.mode).toBe('knowledge');
      expect(result.systemPrompt).toContain('Knowledge');
      expect(result.tools).toBeInstanceOf(Array);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should select coding mode for coding-related prompts', () => {
      const context: PromptContext = {
        prompt: 'Fix this bug in the component',
        workspaceType: 'ide',
        activeDocument: {
          path: '/src/components/Button.tsx',
          extension: 'tsx',
        },
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.mode).toBe('coding');
      expect(result.systemPrompt).toContain('CODING');
    });

    it('should select knowledge mode for note-related prompts', () => {
      const context: PromptContext = {
        prompt: 'search notes about machine learning',
        workspaceType: 'knowledge',
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.mode).toBe('knowledge');
      expect(result.systemPrompt).toContain('KNOWLEDGE');
    });

    it('should include classification result', () => {
      const context: PromptContext = {
        prompt: 'create a new note',
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.classification).toBeDefined();
      expect(result.classification.mode).toBe(result.mode);
      expect(result.classification.confidence).toBeGreaterThan(0);
      expect(result.classification.reasoning).toBeInstanceOf(Array);
    });

    it('should include tools filtered by mode', () => {
      const context: PromptContext = {
        prompt: 'create a note',
        workspaceType: 'notes',
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThan(0);

      // All tools should be for knowledge mode
      result.tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.category).toBeDefined();
      });
    });
  });

  describe('buildPrompt() - Context Injection', () => {
    it('should include workspace type in context section', () => {
      const context: PromptContext = {
        prompt: 'help me',
        workspaceType: 'ide',
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.systemPrompt).toContain('ide');
    });

    it('should include active document in context section', () => {
      const context: PromptContext = {
        prompt: 'help me',
        activeDocument: {
          path: '/src/utils/helpers.ts',
          extension: 'ts',
        },
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.systemPrompt).toContain('Active File');
      expect(result.systemPrompt).toContain('helpers.ts');
    });

    it('should include project context when provided', () => {
      const context: PromptContext = {
        prompt: 'help me',
        projectContext: 'React + TypeScript project',
      };

      const result = orchestrator.buildPrompt(context);

      expect(result.systemPrompt).toContain('React + TypeScript project');
    });
  });

  describe('classifyMode()', () => {
    it('should return classification result without building prompt', () => {
      const context: PromptContext = {
        prompt: 'create a note',
      };

      const result = orchestrator.classifyMode(context);

      expect(result.mode).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reasoning).toBeDefined();
      expect(result.signals).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getOrchestratorPrompt()', () => {
    it('should return the orchestrator base prompt', () => {
      const prompt = orchestrator.getOrchestratorPrompt();

      expect(prompt).toContain('Orchestrator');
      expect(prompt).toContain('mode');
      expect(prompt).toContain('switch');
    });
  });

  describe('Configuration', () => {
    it('should respect includeTools configuration', () => {
      const orchestratorNoTools = new PromptOrchestrator({
        includeTools: false,
      });

      const context: PromptContext = {
        prompt: 'create a note',
      };

      const result = orchestratorNoTools.buildPrompt(context);

      expect(result.systemPrompt).not.toContain('Available Tools');
    });

    it('should respect includeReasoning configuration', () => {
      const orchestratorNoReasoning = new PromptOrchestrator({
        includeReasoning: false,
      });

      const context: PromptContext = {
        prompt: 'help me',
      };

      const result = orchestratorNoReasoning.buildPrompt(context);

      expect(result.systemPrompt).not.toContain('Current Request');
    });

    it('should respect maxTools configuration', () => {
      const orchestratorLimitedTools = new PromptOrchestrator({
        maxTools: 2,
      });

      const context: PromptContext = {
        prompt: 'help me',
      };

      const result = orchestratorLimitedTools.buildPrompt(context);

      // Count tool descriptions (each starts with "- **")
      const toolCount = (result.systemPrompt.match(/- \*\*/g) || []).length;
      expect(toolCount).toBeLessThanOrEqual(2);
    });

    it('should update configuration dynamically', () => {
      const context: PromptContext = {
        prompt: 'help me',
      };

      // First call with tools
      let result = orchestrator.buildPrompt(context);
      expect(result.systemPrompt).toContain('Available Tools');

      // Update config
      orchestrator.updateConfig({ includeTools: false });

      // Second call without tools
      result = orchestrator.buildPrompt(context);
      expect(result.systemPrompt).not.toContain('Available Tools');
    });

    it('should get current configuration', () => {
      const config = orchestrator.getConfig();

      expect(config).toBeDefined();
      expect(config.includeTools).toBe(true);
      expect(config.includeReasoning).toBe(true);
      expect(config.maxTools).toBe(20);
    });
  });
});

describe('Singleton Functions', () => {
  beforeEach(() => {
    // Initialize tool registry for tests
    initializeToolRegistry();
  });

  describe('getPromptOrchestrator()', () => {
    it('should return singleton instance without config', () => {
      const instance1 = getPromptOrchestrator();
      const instance2 = getPromptOrchestrator();

      expect(instance1).toBe(instance2);
    });

    it('should return new instance with config', () => {
      const instance1 = getPromptOrchestrator();
      const instance2 = getPromptOrchestrator({ includeTools: false });

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('buildOrchestratedPrompt()', () => {
    it('should build prompt using singleton', () => {
      const context: PromptContext = {
        prompt: 'create a note',
      };

      const result = buildOrchestratedPrompt(context);

      expect(result).toBeDefined();
      expect(result.mode).toBeDefined();
      expect(result.systemPrompt).toBeDefined();
    });

    it('should build prompt with custom config', () => {
      const context: PromptContext = {
        prompt: 'create a note',
      };

      const result = buildOrchestratedPrompt(context, {
        includeTools: false,
      });

      expect(result.systemPrompt).not.toContain('Available Tools');
    });
  });

  describe('getPromptForMode()', () => {
    it('should return mode-specific prompt', () => {
      const prompt = getPromptForMode('coding');

      expect(prompt).toContain('CODING');
    });

    it('should include context in mode prompt', () => {
      const prompt = getPromptForMode('coding', {
        workspaceType: 'ide',
        projectContext: 'React app',
      });

      expect(prompt).toContain('ide');
      expect(prompt).toContain('React app');
    });
  });
});

describe('Integration with Tool Registry', () => {
  beforeEach(() => {
    initializeToolRegistry();
  });

  it('should get tools for knowledge mode', () => {
    const orchestrator = new PromptOrchestrator();
    const context: PromptContext = {
      prompt: 'create a note',
      workspaceType: 'notes',
    };

    const result = orchestrator.buildPrompt(context);

    expect(result.mode).toBe('knowledge');
    expect(result.tools.length).toBeGreaterThan(0);

    // Knowledge mode should have note tools
    const toolNames = result.tools.map(t => t.name);
    expect(toolNames).toContain('create_note');
    expect(toolNames).toContain('read_note');
  });

  it('should get tools for coding mode', () => {
    const orchestrator = new PromptOrchestrator();
    const context: PromptContext = {
      prompt: 'fix this bug',
      workspaceType: 'ide',
    };

    const result = orchestrator.buildPrompt(context);

    expect(result.mode).toBe('coding');
    expect(result.tools.length).toBeGreaterThan(0);

    // Coding mode should have file tools
    const toolNames = result.tools.map(t => t.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
  });
});

describe('Prompt Format', () => {
  beforeEach(() => {
    initializeToolRegistry();
  });

  it('should produce well-formed prompt with all sections', () => {
    const orchestrator = new PromptOrchestrator();
    const context: PromptContext = {
      prompt: 'Create a note about React hooks',
      workspaceType: 'notes',
      activeDocument: {
        path: '/notes/react.md',
        extension: 'md',
      },
      projectContext: 'Notes workspace',
    };

    const result = orchestrator.buildPrompt(context);

    // Should have mode section
    expect(result.systemPrompt).toBeTruthy();
    expect(result.systemPrompt.length).toBeGreaterThan(100);

    // Should have tool section when tools are available
    if (result.tools.length > 0) {
      expect(result.systemPrompt).toContain('Available Tools');
    }

    // Should have context section
    expect(result.systemPrompt).toContain('Context');
  });
});
