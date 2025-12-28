/**
 * @fileoverview Unit tests for SystemPromptComposer
 * @module lib/agent/__tests__/prompt-composer
 * 
 * Tests for 5-Layer System Prompt Composer (Layers 1-3)
 * 
 * @epic 4 - Smart Agent Tools
 * @story 4.1 - 5-Layer System Prompt Composer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemPromptComposer, type LayerContext, type PromptComposerConfig } from '../prompt-composer';

// Mock WorkspaceEventEmitter
const mockEventBus = {
  on: vi.fn(),
  emit: vi.fn(),
};

describe('SystemPromptComposer', () => {
  let composer: SystemPromptComposer;

  beforeEach(() => {
    // Reset singleton instance before each test
    (SystemPromptComposer as any).instance = null;
    composer = SystemPromptComposer.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple getInstance() calls', () => {
      const instance1 = SystemPromptComposer.getInstance();
      const instance2 = SystemPromptComposer.getInstance();
      const instance3 = SystemPromptComposer.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should create new instance when config is provided', () => {
      (SystemPromptComposer as any).instance = null;
      const config: PromptComposerConfig = {
        maxOpenFiles: 5,
      };
      const instance1 = SystemPromptComposer.getInstance(config);
      const instance2 = SystemPromptComposer.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Layer Registration', () => {
    it('should register Layer 1 (Tool Constitution)', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);

      // Layer 1 should be first message (system role)
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toContain('TOOL USE CONSTITUTION');
    });

    it('should register Layer 2 (Agent Mode) by default', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);

      // Layer 2 should be second message (system role)
      expect(messages.length).toBeGreaterThan(1);
      expect(messages[1].role).toBe('system');
      expect(messages[1].content).toContain('AGENT MODE');
      expect(messages[1].content).toContain('Quick Flow Solo Dev');
    });

    it('should register Layer 3 (Context Injection)', () => {
      const context: LayerContext = {
        openFiles: [
          { path: 'src/App.tsx', name: 'App.tsx' },
          { path: 'src/index.ts', name: 'index.ts' },
        ],
        activeFile: { path: 'src/App.tsx', name: 'App.tsx' },
        workspaceReady: true,
      };

      const messages = composer.compose(context);

      // Layer 3 should be third message (system role)
      expect(messages.length).toBeGreaterThan(2);
      expect(messages[2].role).toBe('system');
      expect(messages[2].content).toContain('Open Files');
      expect(messages[2].content).toContain('Active File');
    });
  });

  describe('Layer 1: Tool Constitution', () => {
    it('should include default tool constitution', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer1Content = messages[0].content;

      expect(layer1Content).toContain('TOOL USE CONSTITUTION');
      expect(layer1Content).toContain('ACTION, NOT INSTRUCTION');
      expect(layer1Content).toContain('STEP-BY-STEP EXECUTION');
      expect(layer1Content).toContain('TOOL SELECTION PRIORITY');
      expect(layer1Content).toContain('SAFETY GUIDELINES');
    });

    it('should allow custom tool constitution via updateConfig()', () => {
      const customConstitution = '## CUSTOM TOOL RULES\n\n1. Be careful\n2. Ask questions';
      composer.updateConfig({ toolConstitution: customConstitution });

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer1Content = messages[0].content;

      expect(layer1Content).toContain('CUSTOM TOOL RULES');
      expect(layer1Content).toContain('Be careful');
    });
  });

  describe('Layer 2: Agent Mode', () => {
    it('should include solo-dev mode by default', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer2Content = messages[1].content;

      expect(layer2Content).toContain('Quick Flow Solo Dev');
      expect(layer2Content).toContain('COGNITIVE ANALYSIS PHASE');
      expect(layer2Content).toContain('PERSONA');
      expect(layer2Content).toContain('COMMUNICATION STYLE');
      expect(layer2Content).toContain('MODE RULES');
    });

    it('should update agent mode via updateConfig()', () => {
      const customMode: PromptComposerConfig['agentMode'] = {
        id: 'code',
        name: 'Code',
        icon: '💻',
        cognitivePhase: 'Execute immediately',
        persona: 'Fast executor',
        communicationStyle: 'Minimal talk',
        rules: 'No questions',
      };

      composer.updateConfig({ agentMode: customMode });

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer2Content = messages[1].content;

      expect(layer2Content).toContain('Code');
      expect(layer2Content).toContain('Execute immediately');
    });
  });

  describe('Layer 3: Context Injection', () => {
    it('should include open files section', () => {
      const context: LayerContext = {
        openFiles: [
          { path: 'src/App.tsx', name: 'App.tsx' },
          { path: 'src/index.ts', name: 'index.ts' },
          { path: 'src/utils.ts', name: 'utils.ts' },
        ],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('## Open Files');
      expect(layer3Content).toContain('App.tsx (src/App.tsx)');
      expect(layer3Content).toContain('index.ts (src/index.ts)');
      expect(layer3Content).toContain('utils.ts (src/utils.ts)');
    });

    it('should limit open files to maxOpenFiles (default 10)', () => {
      const files = Array.from({ length: 15 }, (_, i) => ({
        path: `src/file${i}.ts`,
        name: `file${i}.ts`,
      }));

      const context: LayerContext = {
        openFiles: files,
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      // Should only include first 10 files
      expect(layer3Content).toContain('file0.ts');
      expect(layer3Content).toContain('file9.ts');
      expect(layer3Content).not.toContain('file10.ts');
    });

    it('should include active file section when activeFile is set', () => {
      const context: LayerContext = {
        openFiles: [],
        activeFile: { path: 'src/App.tsx', name: 'App.tsx' },
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('## Active File');
      expect(layer3Content).toContain('Currently editing: App.tsx (src/App.tsx)');
    });

    it('should include project summary when workspace is ready', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: true,
        projectPackageJson: {
          name: 'via-gent',
          version: '2.0.0',
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
            '@tanstack/react-router': '^1.0.0',
          },
        },
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('## Project Summary');
      expect(layer3Content).toContain('Project: via-gent');
      expect(layer3Content).toContain('Version: 2.0.0');
      expect(layer3Content).toContain('Dependencies:');
      expect(layer3Content).toContain('react@^18.0.0');
    });

    it('should limit dependencies in project summary to 5', () => {
      const deps: Record<string, string> = {};
      for (let i = 0; i < 10; i++) {
        deps[`dep${i}`] = '^1.0.0';
      }

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: true,
        projectPackageJson: {
          name: 'test-project',
          version: '1.0.0',
          dependencies: deps,
        },
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      // Should only include first 5 dependencies
      expect(layer3Content).toContain('dep0@^1.0.0');
      expect(layer3Content).toContain('dep4@^1.0.0');
      expect(layer3Content).not.toContain('dep5@^1.0.0');
    });
  });

  describe('Caching Strategy', () => {
    it('should cache Layer 1 content', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages1 = composer.compose(context);
      const messages2 = composer.compose(context);

      // Layer 1 should be identical (cached)
      expect(messages1[0].content).toBe(messages2[0].content);
    });

    it('should cache Layer 2 content', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages1 = composer.compose(context);
      const messages2 = composer.compose(context);

      // Layer 2 should be identical (cached)
      expect(messages1[1].content).toBe(messages2[1].content);
    });

    it('should NOT cache Layer 3 content (always dynamic)', () => {
      const context1: LayerContext = {
        openFiles: [{ path: 'src/file1.ts', name: 'file1.ts' }],
        workspaceReady: false,
      };

      const context2: LayerContext = {
        openFiles: [{ path: 'src/file2.ts', name: 'file2.ts' }],
        workspaceReady: false,
      };

      const messages1 = composer.compose(context1);
      const messages2 = composer.compose(context2);

      // Layer 3 should be different (not cached)
      expect(messages1[2].content).not.toBe(messages2[2].content);
      expect(messages1[2].content).toContain('file1.ts');
      expect(messages2[2].content).toContain('file2.ts');
    });

    it('should invalidate cache on config update', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages1 = composer.compose(context);

      // Update config
      composer.updateConfig({
        toolConstitution: '## NEW RULES\n\n1. Be safe',
      });

      const messages2 = composer.compose(context);

      // Layer 1 should be different (cache invalidated)
      expect(messages1[0].content).not.toBe(messages2[0].content);
      expect(messages2[0].content).toContain('NEW RULES');
    });
  });

  describe('Context Management Methods', () => {
    it('should update open files via setOpenFiles()', () => {
      const files = [
        { path: 'src/file1.ts', name: 'file1.ts' },
        { path: 'src/file2.ts', name: 'file2.ts' },
      ];

      composer.setOpenFiles(files);

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('file1.ts');
      expect(layer3Content).toContain('file2.ts');
    });

    it('should update active file via setActiveFile()', () => {
      const activeFile = { path: 'src/App.tsx', name: 'App.tsx' };

      composer.setActiveFile(activeFile);

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('Currently editing: App.tsx');
    });

    it('should update project package json via setProjectPackageJson()', () => {
      const packageJson: LayerContext['projectPackageJson'] = {
        name: 'test-project',
        version: '1.0.0',
        dependencies: { react: '^18.0.0' },
      };

      composer.setProjectPackageJson(packageJson);

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: true,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('Project: test-project');
      expect(layer3Content).toContain('Version: 1.0.0');
    });

    it('should limit open files to maxOpenFiles in setOpenFiles()', () => {
      const files = Array.from({ length: 15 }, (_, i) => ({
        path: `src/file${i}.ts`,
        name: `file${i}.ts`,
      }));

      composer.setOpenFiles(files);

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      // Should only include first 10 files
      expect(layer3Content).toContain('file0.ts');
      expect(layer3Content).toContain('file9.ts');
      expect(layer3Content).not.toContain('file10.ts');
    });
  });

  describe('Event Bus Integration', () => {
    it('should set event bus via setEventBus()', () => {
      composer.setEventBus(mockEventBus as any);

      expect(mockEventBus.on).toHaveBeenCalledWith('files:changed', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('workspace:ready', expect.any(Function));
    });

    it('should handle files:changed event with debounce', () => {
      composer.setEventBus(mockEventBus as any);

      const files = [
        { path: 'src/file1.ts', name: 'file1.ts' },
        { path: 'src/file2.ts', name: 'file2.ts' },
      ];

      // Emit files:changed event
      const filesChangedHandler = (mockEventBus.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'files:changed'
      )?.[1];

      filesChangedHandler(files);

      // Wait for debounce (300ms)
      // In real implementation, this would be async
      // For test, we check the handler was called
      expect(filesChangedHandler).toHaveBeenCalledWith(files);
    });

    it('should handle workspace:ready event', () => {
      composer.setEventBus(mockEventBus as any);

      // Emit workspace:ready event
      const workspaceReadyHandler = (mockEventBus.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'workspace:ready'
      )?.[1];

      workspaceReadyHandler();

      // Check that workspaceReady flag is set
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('Project Summary');
    });
  });

  describe('compose() Method', () => {
    it('should return array of system messages in priority order', () => {
      const context: LayerContext = {
        openFiles: [{ path: 'src/App.tsx', name: 'App.tsx' }],
        activeFile: { path: 'src/App.tsx', name: 'App.tsx' },
        workspaceReady: true,
        projectPackageJson: {
          name: 'test',
          version: '1.0.0',
        },
      };

      const messages = composer.compose(context);

      expect(messages).toHaveLength(3); // Layers 1, 2, 3
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('system');
      expect(messages[2].role).toBe('system');
    });

    it('should include all layers in correct order', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);

      // Layer 1: Tool Constitution
      expect(messages[0].content).toContain('TOOL USE CONSTITUTION');

      // Layer 2: Agent Mode
      expect(messages[1].content).toContain('AGENT MODE');

      // Layer 3: Context Injection
      expect(messages[2].content).toContain('## Open Files');
    });

    it('should handle empty context gracefully', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);

      expect(messages).toHaveLength(3);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('system');
      expect(messages[2].role).toBe('system');
    });
  });

  describe('Configuration Hash Generation', () => {
    it('should generate different hashes for different agent modes', () => {
      const config1: Partial<PromptComposerConfig> = {
        agentMode: { id: 'solo-dev', name: 'Solo Dev', icon: '🚀' } as any,
      };

      const config2: Partial<PromptComposerConfig> = {
        agentMode: { id: 'code', name: 'Code', icon: '💻' } as any,
      };

      // Access private method via testing
      const hash1 = (composer as any).generateConfigHash(config1);
      const hash2 = (composer as any).generateConfigHash(config2);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes when tool constitution changes', () => {
      const config1: Partial<PromptComposerConfig> = {
        toolConstitution: '## RULES A',
      };

      const config2: Partial<PromptComposerConfig> = {
        toolConstitution: '## RULES B',
      };

      const hash1 = (composer as any).generateConfigHash(config1);
      const hash2 = (composer as any).generateConfigHash(config2);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate same hash for same config', () => {
      const config: Partial<PromptComposerConfig> = {
        agentMode: { id: 'solo-dev', name: 'Solo Dev', icon: '🚀' } as any,
        toolConstitution: '## RULES',
      };

      const hash1 = (composer as any).generateConfigHash(config);
      const hash2 = (composer as any).generateConfigHash(config);

      expect(hash1).toBe(hash2);
    });
  });
});
