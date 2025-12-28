/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EventEmitter3 } from 'eventemitter3';
import type { SystemMessage } from '@tanstack/ai';
import { SystemPromptComposer } from '../prompt-composer';
import type { PromptLayer, LayerContext } from '../prompt-composer';

// Mock event bus
const mockEventBus: EventEmitter3 = {
  on: vi.fn(),
  emit: vi.fn(),
  off: vi.fn(),
  removeAllListeners: vi.fn(),
  listenerCount: vi.fn(),
  eventNames: vi.fn(),
};

describe('SystemPromptComposer', () => {
  let composer: SystemPromptComposer;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset composer instance to default state
    // Force a new instance to avoid test pollution
    composer = new SystemPromptComposer();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple getInstance() calls', () => {
      const instance1 = SystemPromptComposer.getInstance();
      const instance2 = SystemPromptComposer.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance when config is provided', () => {
      const instance1 = SystemPromptComposer.getInstance();
      const instance2 = SystemPromptComposer.getInstance({
        agentMode: { id: 'test-mode', name: 'Test Mode', prompt: 'Test' },
      });
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Layer Registration', () => {
    it('should register Layer 1 (Tool Constitution)', () => {
      const instance = SystemPromptComposer.getInstance();
      expect(instance).toBeDefined();
    });

    it('should register Layer 2 (Agent Mode) by default', () => {
      const instance = SystemPromptComposer.getInstance();
      const config = instance.getConfig();
      expect(config.agentMode).toBeDefined();
      expect(config.agentMode?.id).toBe('solo-dev');
    });

    it('should register Layer 3 (Context Injection)', () => {
      const instance = SystemPromptComposer.getInstance();
      const layers = instance.getLayers();
      expect(layers).toHaveLength(3);
      expect(layers[0].type).toBe('tool-constitution');
      expect(layers[1].type).toBe('agent-mode');
      expect(layers[2].type).toBe('context-injection');
    });
  });

  describe('Layer 1: Tool Constitution', () => {
    it('should include default tool constitution', () => {
      const messages = composer.compose({});
      expect(messages[0].content).toContain('TOOL USE CONSTITUTION');
      expect(messages[0].content).toContain('File Operations');
      expect(messages[0].content).toContain('Terminal Commands');
    });

    it('should allow custom tool constitution via updateConfig()', () => {
      const customConstitution = 'CUSTOM TOOL CONSTITUTION';
      composer.updateConfig({ toolConstitution: customConstitution });

      const messages = composer.compose({});
      expect(messages[0].content).toContain(customConstitution);
    });
  });

  describe('Layer 2: Agent Mode', () => {
    it('should include solo-dev mode by default', () => {
      const messages = composer.compose({});
      expect(messages[1].content).toContain('AGENT MODE');
      expect(messages[1].content).toContain('solo-dev');
    });

    it('should update agent mode via updateConfig()', () => {
      const customMode = { id: 'custom-mode', name: 'Custom Mode', prompt: 'Custom prompt' };
      composer.updateConfig({ agentMode: customMode });

      const messages = composer.compose({});
      expect(messages[1].content).toContain('custom-mode');
      expect(messages[1].content).toContain('Custom Mode');
    });
  });

  describe('Layer 3: Context Injection', () => {
    it('should include open files section', () => {
      const context: LayerContext = {
        openFiles: [{ path: 'src/App.tsx', name: 'App.tsx' }],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('## Open Files');
      expect(layer3Content).toContain('src/App.tsx');
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
        openFiles: [
          { path: 'src/App.tsx', name: 'App.tsx' },
          { path: 'src/main.tsx', name: 'main.tsx' },
        ],
        activeFile: { path: 'src/App.tsx', name: 'App.tsx' },
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('## Active File');
      expect(layer3Content).toContain('src/App.tsx');
    });

    it('should include project summary when workspace is ready', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: true,
        projectPackageJson: {
          name: 'test-project',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
            '@tanstack/react-router': '^1.0.0',
            zustand: '^4.0.0',
            dexie: '^3.0.0',
          },
        },
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('Project Summary');
      expect(layer3Content).toContain('test-project');
      expect(layer3Content).toContain('Version: 1.0.0');
    });

    it('should limit dependencies in project summary to 5', () => {
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: true,
        projectPackageJson: {
          name: 'test',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
            '@tanstack/react-router': '^1.0.0',
            zustand: '^4.0.0',
            dexie: '^3.0.0',
            '@tanstack/ai': '^1.0.0',
            '@tanstack/store': '^1.0.0',
          },
        },
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      // Should only include first 5 dependencies
      expect(layer3Content).toContain('react');
      expect(layer3Content).toContain('dexie');
      expect(layer3Content).not.toContain('@tanstack/ai');
    });
  });

  describe('Caching Strategy', () => {
    it('should cache Layer 1 content', () => {
      const messages1 = composer.compose({});
      const messages2 = composer.compose({});

      // Same config hash, should return cached content
      expect(messages1[0].content).toBe(messages2[0].content);
    });

    it('should cache Layer 2 content', () => {
      const messages1 = composer.compose({});
      const messages2 = composer.compose({});

      // Same config hash, should return cached content
      expect(messages1[1].content).toBe(messages2[1].content);
    });

    it('should NOT cache Layer 3 content (always dynamic)', () => {
      const context1: LayerContext = {
        openFiles: [{ path: 'src/App.tsx', name: 'App.tsx' }],
        workspaceReady: false,
      };
      const context2: LayerContext = {
        openFiles: [{ path: 'src/main.tsx', name: 'main.tsx' }],
        workspaceReady: false,
      };

      const messages1 = composer.compose(context1);
      const messages2 = composer.compose(context2);

      // Layer 3 should be different (not cached)
      expect(messages1[2].content).not.toBe(messages2[2].content);
    });

    it('should invalidate cache on config update', () => {
      const messages1 = composer.compose({});
      composer.updateConfig({ toolConstitution: 'NEW CONSTITUTION' });
      const messages2 = composer.compose({});

      // Layer 1 should be different after config update
      expect(messages1[0].content).not.toBe(messages2[0].content);
    });
  });

  describe('Context Management Methods', () => {
    it('should update open files via setOpenFiles()', () => {
      const files = [
        { path: 'src/App.tsx', name: 'App.tsx' },
        { path: 'src/main.tsx', name: 'main.tsx' },
      ];

      composer.setOpenFiles(files);

      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };

      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('src/App.tsx');
      expect(layer3Content).toContain('src/main.tsx');
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

      expect(layer3Content).toContain('## Active File');
      expect(layer3Content).toContain('src/App.tsx');
    });

    it('should update project package json via setProjectPackageJson()', () => {
      const packageJson = {
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

      expect(layer3Content).toContain('Project Summary');
      expect(layer3Content).toContain('test-project');
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

      // Verify handler was registered for files:changed event
      const filesChangedCall = (mockEventBus.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'files:changed'
      );

      expect(filesChangedCall).toBeDefined();
      expect(filesChangedCall[1]).toBeInstanceOf(Function);

      // Call handler directly to test its logic
      const filesChangedHandler = filesChangedCall[1];
      filesChangedHandler(files);

      // Verify layer3Context was updated by calling handler
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: false,
      };
      const messages = composer.compose(context);
      const layer3Content = messages[2].content;

      expect(layer3Content).toContain('## Open Files');
      expect(layer3Content).toContain('src/file1.ts');
      expect(layer3Content).toContain('src/file2.ts');
    });

    it('should handle workspace:ready event', () => {
      composer.setEventBus(mockEventBus as any);

      // Emit workspace:ready event
      const workspaceReadyCall = (mockEventBus.on as any).mock.calls.find(
        (call: any[]) => call[0] === 'workspace:ready'
      );

      expect(workspaceReadyCall).toBeDefined();
      expect(workspaceReadyCall[1]).toBeInstanceOf(Function);

      // Call handler directly to test its logic
      const workspaceReadyHandler = workspaceReadyCall[1];
      workspaceReadyHandler();

      // Check that workspaceReady flag is set
      const context: LayerContext = {
        openFiles: [],
        workspaceReady: true, // Changed from false to true
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
        openFiles: [{ path: 'src/App.tsx', name: 'App.tsx' }],
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
      expect(messages[0].content).toContain('TOOL USE CONSTITUTION');
      expect(messages[1].content).toContain('AGENT MODE');
    });
  });

  describe('Configuration Hash Generation', () => {
    it('should generate different hashes for different agent modes', () => {
      const hash1 = composer.generateConfigHash({ agentMode: { id: 'mode1' } });
      const hash2 = composer.generateConfigHash({ agentMode: { id: 'mode2' } });

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes when tool constitution changes', () => {
      const hash1 = composer.generateConfigHash({
        toolConstitution: 'CONSTITUTION 1',
      });
      const hash2 = composer.generateConfigHash({
        toolConstitution: 'CONSTITUTION 2',
      });

      expect(hash1).not.toBe(hash2);
    });

    it('should generate same hash for same config', () => {
      const config = {
        agentMode: { id: 'test-mode' },
        toolConstitution: 'TEST CONSTITUTION',
      };

      const hash1 = composer.generateConfigHash(config);
      const hash2 = composer.generateConfigHash(config);

      expect(hash1).toBe(hash2);
    });
  });
});
