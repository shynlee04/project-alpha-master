/**
 * @fileoverview Mode Classifier Tests
 * @module lib/agent/__tests__/mode-classifier
 * @governance EPIC-40 MM-02
 *
 * Unit tests for ModeClassifier covering all context sources.
 *
 * @story 40-02: Implement Mode Classifier
 * @created 2026-01-10
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModeClassifier, classifyMode, getModeClassifier } from '../mode-classifier';
import type { ContextSources, AgentMode } from '../mode-classifier-types';

describe('ModeClassifier (Story 40-02)', () => {
  let classifier: ModeClassifier;

  beforeEach(() => {
    classifier = new ModeClassifier();
  });

  describe('Workspace Analysis (AC-2)', () => {
    it('should route notes workspace to knowledge mode', () => {
      const result = classifier.classify({
        prompt: '',
        workspaceType: 'notes',
      });

      expect(result.mode).toBe('knowledge');
      expect(result.signals.find((s) => s.source === 'workspace')?.mode).toBe('knowledge');
    });

    it('should route knowledge workspace to knowledge mode', () => {
      const result = classifier.classify({
        prompt: '',
        workspaceType: 'knowledge',
      });

      expect(result.mode).toBe('knowledge');
    });

    it('should route ide workspace to coding mode', () => {
      const result = classifier.classify({
        prompt: '',
        workspaceType: 'ide',
      });

      expect(result.mode).toBe('coding');
    });

    it('should route code workspace to coding mode', () => {
      const result = classifier.classify({
        prompt: '',
        workspaceType: 'code',
      });

      expect(result.mode).toBe('coding');
    });

    it('should use default mode for unknown workspace', () => {
      const result = classifier.classify({
        prompt: '',
        workspaceType: 'unknown' as any,
      });

      expect(result.mode).toBe('orchestrator'); // default
    });
  });

  describe('Prompt Keyword Analysis (AC-3)', () => {
    it('should detect knowledge mode from "create note" keyword', () => {
      const result = classifier.classify({
        prompt: 'I want to create a new note about TypeScript',
      });

      expect(result.mode).toBe('knowledge');
      expect(result.reasoning.some((r) => r.includes('keyword'))).toBe(true);
    });

    it('should detect knowledge mode from "search notes" keyword', () => {
      const result = classifier.classify({
        prompt: 'Can you search my notes for AI?',
      });

      expect(result.mode).toBe('knowledge');
    });

    it('should detect knowledge mode from "summarize" keyword', () => {
      const result = classifier.classify({
        prompt: 'Summarize this document',
      });

      expect(result.mode).toBe('knowledge');
    });

    it('should detect coding mode from "fix bug" keyword', () => {
      const result = classifier.classify({
        prompt: 'Please fix this bug in my code',
      });

      expect(result.mode).toBe('coding');
    });

    it('should detect coding mode from "implement" keyword', () => {
      const result = classifier.classify({
        prompt: 'Implement a new component for the dashboard',
      });

      expect(result.mode).toBe('coding');
    });

    it('should detect coding mode from "npm install" command', () => {
      const result = classifier.classify({
        prompt: 'Run npm install to add the dependency',
      });

      expect(result.mode).toBe('coding');
    });

    it('should detect orchestrator mode from "plan" keyword', () => {
      const result = classifier.classify({
        prompt: 'Plan the architecture for this feature',
      });

      expect(result.mode).toBe('orchestrator');
    });
  });

  describe('Document Analysis', () => {
    it('should detect coding mode from .ts file extension', () => {
      const result = classifier.classify({
        prompt: '',
        activeDocument: {
          path: '/src/components/Button.tsx',
          extension: '.tsx',
          name: 'Button.tsx',
          language: 'typescript',
        },
      });

      expect(result.mode).toBe('coding');
      expect(result.reasoning.some((r) => r.includes('code'))).toBe(true);
    });

    it('should detect coding mode from .py file extension', () => {
      const result = classifier.classify({
        prompt: '',
        activeDocument: {
          path: '/src/utils/helper.py',
          extension: '.py',
          name: 'helper.py',
          language: 'python',
        },
      });

      expect(result.mode).toBe('coding');
    });

    it('should detect knowledge mode from .md file extension', () => {
      const result = classifier.classify({
        prompt: '',
        activeDocument: {
          path: '/docs/README.md',
          extension: '.md',
          name: 'README.md',
        },
      });

      expect(result.mode).toBe('knowledge');
    });

    it('should detect knowledge mode from .pdf file extension', () => {
      const result = classifier.classify({
        prompt: '',
        activeDocument: {
          path: '/docs/spec.pdf',
          extension: '.pdf',
          name: 'spec.pdf',
        },
      });

      expect(result.mode).toBe('knowledge');
    });
  });

  describe('Conversation History Analysis (AC-4)', () => {
    it('should consider recent mode selections', () => {
      const result = classifier.classify({
        prompt: '',
        conversationHistory: [
          { role: 'user', content: 'Hello', mode: 'coding' },
          { role: 'assistant', content: 'Hi', mode: 'coding' },
          { role: 'user', content: 'Help', mode: 'coding' },
        ],
      });

      const conversationSignal = result.signals.find((s) => s.source === 'conversation');
      expect(conversationSignal?.mode).toBe('coding');
    });

    it('should favor most common recent mode', () => {
      const result = classifier.classify({
        prompt: '',
        conversationHistory: [
          { role: 'user', content: 'A', mode: 'knowledge' },
          { role: 'assistant', content: 'B', mode: 'knowledge' },
          { role: 'user', content: 'C', mode: 'coding' },
        ],
      });

      const conversationSignal = result.signals.find((s) => s.source === 'conversation');
      expect(conversationSignal?.mode).toBe('knowledge'); // 2 vs 1
    });

    it('should handle empty conversation history', () => {
      const result = classifier.classify({
        prompt: '',
        conversationHistory: [],
      });

      const conversationSignal = result.signals.find((s) => s.source === 'conversation');
      expect(conversationSignal?.weight).toBe(0);
    });
  });

  describe('Confidence Scoring (AC-5)', () => {
    it('should return high confidence for single dominant signal', () => {
      const result = classifier.classify({
        prompt: 'create a new note',
        workspaceType: 'notes',
      });

      // Both prompt and workspace agree on knowledge mode
      expect(result.mode).toBe('knowledge');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should return medium confidence for aligned signals', () => {
      const result = classifier.classify({
        prompt: 'create a new note',
        workspaceType: 'notes',
        activeDocument: {
          path: '/notes/idea.md',
          extension: '.md',
          name: 'idea.md',
        },
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should return lower confidence for mixed signals', () => {
      const result = classifier.classify({
        prompt: 'create a new note', // knowledge
        workspaceType: 'ide', // coding
      });

      // Mixed signals result in lower confidence
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should include confidence in classification result', () => {
      const result = classifier.classify({
        prompt: 'test',
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Signal Aggregation', () => {
    it('should include all context sources in signals', () => {
      const result = classifier.classify({
        prompt: 'create note',
        workspaceType: 'notes',
        activeDocument: {
          path: '/notes/test.md',
          extension: '.md',
          name: 'test.md',
        },
        conversationHistory: [
          { role: 'user', content: 'Hi', mode: 'knowledge' },
        ],
      });

      expect(result.signals).toHaveLength(4);
      expect(result.signals.map((s) => s.source)).toEqual(
        expect.arrayContaining(['workspace', 'prompt', 'document', 'conversation'])
      );
    });

    it('should provide reasoning for each signal', () => {
      const result = classifier.classify({
        prompt: 'create note',
        workspaceType: 'notes',
      });

      for (const signal of result.signals) {
        if (signal.weight > 0) {
          expect(signal.reason).toBeTruthy();
          expect(signal.reason.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Singleton Function', () => {
    it('should return same instance on subsequent calls', () => {
      const instance1 = getModeClassifier();
      const instance2 = getModeClassifier();

      expect(instance1).toBe(instance2);
    });

    it('should create new instance when config provided', () => {
      const instance1 = getModeClassifier();
      const instance2 = getModeClassifier({ defaultMode: 'coding' });

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Quick Classification Function', () => {
    it('should classify mode using singleton', () => {
      const result = classifyMode({
        prompt: 'create a note',
        workspaceType: 'notes',
      });

      expect(result.mode).toBe('knowledge');
    });
  });

  describe('Configuration', () => {
    it('should allow custom default mode', () => {
      const customClassifier = new ModeClassifier({ defaultMode: 'coding' });
      const result = customClassifier.classify({ prompt: 'unknown request' });

      expect(result.mode).toBe('coding');
    });

    it('should allow custom min confidence', () => {
      const customClassifier = new ModeClassifier({
        minConfidence: 0.9,
        defaultMode: 'orchestrator',
      });

      // Weak signal should trigger default mode
      const result = customClassifier.classify({
        prompt: 'maybe do something',
        workspaceType: 'unknown' as any,
      });

      expect(result.mode).toBe('orchestrator');
    });

    it('should allow custom keyword patterns', () => {
      const customClassifier = new ModeClassifier({
        customKeywords: [
          {
            keywords: ['custom action'],
            mode: 'coding',
            weight: 0.9,
            category: 'custom',
          },
        ],
      });

      const result = customClassifier.classify({
        prompt: 'perform custom action',
      });

      expect(result.mode).toBe('coding');
    });

    it('should update config dynamically', () => {
      classifier.updateConfig({ defaultMode: 'knowledge' });

      const result = classifier.classify({ prompt: 'ambiguous' });

      expect(result.mode).toBe('knowledge');
    });

    it('should return current config', () => {
      const config = classifier.getConfig();

      expect(config.defaultMode).toBe('orchestrator');
      expect(config.minConfidence).toBe(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty context', () => {
      const result = classifier.classify({ prompt: '' });

      expect(result.mode).toBe('orchestrator'); // default
      expect(result.confidence).toBeDefined();
    });

    it('should handle null active document', () => {
      const result = classifier.classify({
        prompt: 'test',
        activeDocument: null as any,
      });

      expect(result.mode).toBeDefined();
    });

    it('should handle undefined workspace type', () => {
      const result = classifier.classify({
        prompt: 'test',
        workspaceType: undefined,
      });

      expect(result.mode).toBeDefined();
    });
  });
});
