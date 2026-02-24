/**
 * @fileoverview Mode Classifier Implementation
 * @module lib/agent/mode-classifier
 * @governance EPIC-40 MM-02
 *
 * Analyzes context sources to automatically select optimal agent mode.
 * Uses weighted signal aggregation from multiple context sources.
 *
 * @story 40-02: Implement Mode Classifier
 * @created 2026-01-10
 */

import type {
  ContextSources,
  ClassificationResult,
  ModeSignal,
  ModeClassifierConfig,
  KeywordPattern,
  ModeScore,
} from './mode-classifier-types';
import type { AgentMode } from '@/domain/tools/tool-definition';

// Re-export types for convenience
export type { ContextSources, ClassificationResult, ModeClassifierConfig };

/**
 * Default keyword patterns for prompt analysis
 */
const DEFAULT_KEYWORDS: KeywordPattern[] = [
  // Knowledge mode patterns
  {
    keywords: ['create note', 'new note', 'add note', 'write note', 'save note'],
    mode: 'knowledge',
    weight: 0.8,
    category: 'note-creation',
  },
  {
    keywords: ['search notes', 'find notes', 'lookup notes', 'my notes'],
    mode: 'knowledge',
    weight: 0.8,
    category: 'note-search',
  },
  {
    keywords: ['summarize', 'explain', 'what is', 'tell me about', 'describe'],
    mode: 'knowledge',
    weight: 0.6,
    category: 'information-request',
  },
  {
    keywords: ['remember', 'save', 'store information', 'keep track of'],
    mode: 'knowledge',
    weight: 0.7,
    category: 'knowledge-storage',
  },

  // Coding mode patterns
  {
    keywords: ['fix bug', 'debug', 'error in', 'not working', 'broken'],
    mode: 'coding',
    weight: 0.8,
    category: 'debugging',
  },
  {
    keywords: ['implement', 'create component', 'write code', 'add function', 'build'],
    mode: 'coding',
    weight: 0.7,
    category: 'implementation',
  },
  {
    keywords: ['refactor', 'optimize', 'clean up', 'improve code'],
    mode: 'coding',
    weight: 0.7,
    category: 'code-improvement',
  },
  {
    keywords: ['test', 'spec', 'coverage', 'unit test'],
    mode: 'coding',
    weight: 0.6,
    category: 'testing',
  },
  {
    keywords: ['npm', 'install', 'build', 'deploy', 'run', 'script'],
    mode: 'coding',
    weight: 0.7,
    category: 'build-process',
  },

  // Orchestrator mode patterns
  {
    keywords: ['plan', 'design', 'architecture', 'strategy'],
    mode: 'orchestrator',
    weight: 0.7,
    category: 'planning',
  },
  {
    keywords: ['analyze', 'review', 'audit', 'assess'],
    mode: 'orchestrator',
    weight: 0.6,
    category: 'analysis',
  },
];

/**
 * Workspace type to mode mapping
 */
const WORKSPACE_MODE_MAP: Record<string, AgentMode> = {
  notes: 'knowledge',
  knowledge: 'knowledge',
  ide: 'coding',
  code: 'coding',
  study: 'knowledge',
  research: 'knowledge',
};

/**
 * Code file extensions suggesting coding mode
 */
const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mts', 'mjs',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'cs',
  'cpp', 'c', 'h', 'hpp', 'swift', 'dart',
  'json', 'yaml', 'yml', 'toml', 'xml',
]);

/**
 * Knowledge file extensions suggesting knowledge mode
 */
const KNOWLEDGE_EXTENSIONS = new Set([
  'md', 'txt', 'rst', 'adoc',
  'pdf', 'doc', 'docx',
]);

/**
 * Default classifier configuration
 */
const DEFAULT_CONFIG: Required<ModeClassifierConfig> = {
  minConfidence: 0.5,
  workspaceWeight: 0.7,
  promptWeight: 0.8,
  documentWeight: 0.5,
  conversationWeight: 0.3,
  defaultMode: 'orchestrator',
  customKeywords: [],
};

/**
 * Mode Classifier Class
 *
 * Analyzes context sources and selects optimal agent mode using
 * weighted signal aggregation from multiple sources.
 */
export class ModeClassifier {
  private config: Required<ModeClassifierConfig>;
  private keywords: KeywordPattern[];

  constructor(config?: Partial<ModeClassifierConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.keywords = [...DEFAULT_KEYWORDS, ...(config?.customKeywords || [])];
  }

  /**
   * Main classification entry point
   */
  classify(context: ContextSources): ClassificationResult {
    const signals: ModeSignal[] = [];

    // Gather signals from all sources
    if (context.workspaceType) {
      signals.push(this.analyzeWorkspace(context.workspaceType));
    }

    signals.push(this.analyzePrompt(context.prompt));

    if (context.activeDocument) {
      signals.push(this.analyzeDocument(context.activeDocument));
    }

    // Always analyze conversation (handles empty case internally)
    if (context.conversationHistory !== undefined) {
      signals.push(this.analyzeConversation(context.conversationHistory));
    }

    // Aggregate signals to determine final mode
    const result = this.aggregateSignals(signals);

    return {
      ...result,
      signals,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze workspace type for mode hint
   */
  private analyzeWorkspace(workspaceType: string): ModeSignal {
    const mode = WORKSPACE_MODE_MAP[workspaceType] || this.config.defaultMode;
    const hasMapping = workspaceType in WORKSPACE_MODE_MAP;

    return {
      source: 'workspace',
      mode,
      weight: hasMapping ? this.config.workspaceWeight : 0.3,
      reason: hasMapping
        ? `Workspace "${workspaceType}" maps to ${mode} mode`
        : `Unknown workspace "${workspaceType}", using default`,
      confidence: hasMapping ? 0.7 : 0.3,
    };
  }

  /**
   * Analyze prompt text for keyword hints
   */
  private analyzePrompt(prompt: string): ModeSignal {
    const lowerPrompt = prompt.toLowerCase();

    // Find matching keyword patterns
    const matches: Array<{ mode: AgentMode; weight: number; category: string }> = [];

    for (const pattern of this.keywords) {
      for (const keyword of pattern.keywords) {
        // Split multi-word keywords and check if all words exist (in order or not)
        const keywordLower = keyword.toLowerCase();
        if (keywordLower.includes(' ')) {
          // Multi-word keyword: check if all words appear in prompt (order-independent)
          const words = keywordLower.split(' ');
          const allWordsPresent = words.every((word) => lowerPrompt.includes(word));
          if (allWordsPresent) {
            matches.push({
              mode: pattern.mode,
              weight: pattern.weight,
              category: pattern.category,
            });
            break; // One match per pattern
          }
        } else if (lowerPrompt.includes(keywordLower)) {
          // Single word keyword: direct substring match
          matches.push({
            mode: pattern.mode,
            weight: pattern.weight,
            category: pattern.category,
          });
          break; // One match per pattern
        }
      }
    }

    if (matches.length === 0) {
      return {
        source: 'prompt',
        mode: this.config.defaultMode,
        weight: 0,
        reason: 'No mode-indicating keywords found in prompt',
        confidence: 0,
      };
    }

    // Aggregate matches by mode
    const modeScores = new Map<AgentMode, number>();
    for (const match of matches) {
      const current = modeScores.get(match.mode) || 0;
      modeScores.set(match.mode, current + match.weight);
    }

    // Find highest scoring mode
    let bestMode: AgentMode = this.config.defaultMode;
    let bestScore = 0;

    for (const [mode, score] of modeScores) {
      if (score > bestScore) {
        bestMode = mode;
        bestScore = score;
      }
    }

    // Normalize confidence - use a baseline since single keyword match is meaningful
    const confidence = bestScore >= 0.6 ? 0.85 : Math.min(bestScore / this.config.promptWeight, 1);

    return {
      source: 'prompt',
      mode: bestMode,
      weight: this.config.promptWeight,
      reason: `Prompt contains ${matches.length} mode-indicating keyword(s)`,
      confidence,
    };
  }

  /**
   * Analyze active document for mode hint
   */
  private analyzeDocument(document: ContextSources['activeDocument']): ModeSignal {
    if (!document) {
      return {
        source: 'document',
        mode: this.config.defaultMode,
        weight: 0,
        reason: 'No active document',
        confidence: 0,
      };
    }

    const ext = document.extension.toLowerCase().replace('.', '');

    if (CODE_EXTENSIONS.has(ext)) {
      return {
        source: 'document',
        mode: 'coding',
        weight: this.config.documentWeight,
        reason: `Active file is code (.${ext})`,
        confidence: 0.7,
      };
    }

    if (KNOWLEDGE_EXTENSIONS.has(ext)) {
      return {
        source: 'document',
        mode: 'knowledge',
        weight: this.config.documentWeight,
        reason: `Active file is document (.${ext})`,
        confidence: 0.6,
      };
    }

    return {
      source: 'document',
      mode: this.config.defaultMode,
      weight: 0.2,
      reason: `Unknown file type (.${ext})`,
      confidence: 0.2,
    };
  }

  /**
   * Analyze conversation history for consistency
   */
  private analyzeConversation(history: ContextSources['conversationHistory']): ModeSignal {
    if (!history || history.length === 0) {
      return {
        source: 'conversation',
        mode: this.config.defaultMode,
        weight: 0,
        reason: 'No conversation history',
        confidence: 0,
      };
    }

    // Look at recent messages (last 5)
    const recent = history.slice(-5).reverse();
    const modeCounts = new Map<AgentMode, number>();

    for (const msg of recent) {
      if (msg.mode) {
        const count = modeCounts.get(msg.mode) || 0;
        modeCounts.set(msg.mode, count + 1);
      }
    }

    if (modeCounts.size === 0) {
      return {
        source: 'conversation',
        mode: this.config.defaultMode,
        weight: 0,
        reason: 'No mode information in conversation history',
        confidence: 0,
      };
    }

    // Find most common recent mode
    let bestMode: AgentMode = this.config.defaultMode;
    let bestCount = 0;

    for (const [mode, count] of modeCounts) {
      if (count > bestCount) {
        bestMode = mode;
        bestCount = count;
      }
    }

    const confidence = Math.min(bestCount / recent.length, 1);

    return {
      source: 'conversation',
      mode: bestMode,
      weight: this.config.conversationWeight,
      reason: `Recent conversation used ${bestMode} mode (${bestCount}/${recent.length} messages)`,
      confidence,
    };
  }

  /**
   * Aggregate signals to determine final mode and confidence
   */
  private aggregateSignals(signals: ModeSignal[]): Omit<ClassificationResult, 'signals' | 'timestamp'> {
    // Score each mode by weighted signal contributions
    const modeScores = new Map<AgentMode, ModeScore>();

    for (const signal of signals) {
      if (signal.weight === 0) continue; // Skip empty signals

      const current = modeScores.get(signal.mode) || {
        mode: signal.mode,
        totalWeight: 0,
        signalCount: 0,
      };

      current.totalWeight += signal.weight * signal.confidence;
      current.signalCount += 1;

      modeScores.set(signal.mode, current);
    }

    // Find best scoring mode
    let bestMode: AgentMode = this.config.defaultMode;
    let bestScore = 0;

    for (const [mode, score] of modeScores) {
      if (score.totalWeight > bestScore) {
        bestMode = mode;
        bestScore = score.totalWeight;
      }
    }

    // Calculate overall confidence
    const maxPossibleScore = signals.reduce((sum, s) => sum + s.weight, 0);
    const confidence = maxPossibleScore > 0 ? Math.min(bestScore / maxPossibleScore, 1) : 0;

    // Generate reasoning
    const reasoning: string[] = [];
    for (const signal of signals) {
      if (signal.weight > 0) {
        reasoning.push(signal.reason);
      }
    }

    // Fall back to default if confidence is too low
    const finalMode = confidence < this.config.minConfidence ? this.config.defaultMode : bestMode;
    const finalConfidence = confidence < this.config.minConfidence ? 1 - confidence : confidence;

    if (finalMode !== bestMode) {
      reasoning.push(`Low confidence (${confidence.toFixed(2)}), using default mode: ${finalMode}`);
    }

    return {
      mode: finalMode,
      confidence: finalConfidence,
      reasoning,
    };
  }

  /**
   * Update classifier configuration
   */
  updateConfig(config: Partial<ModeClassifierConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.customKeywords) {
      this.keywords = [...DEFAULT_KEYWORDS, ...config.customKeywords];
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<ModeClassifierConfig>> {
    return this.config;
  }
}

/**
 * Singleton instance for convenience
 */
let classifierInstance: ModeClassifier | null = null;

/**
 * Get or create the singleton ModeClassifier instance
 */
export function getModeClassifier(config?: Partial<ModeClassifierConfig>): ModeClassifier {
  if (!classifierInstance || config) {
    classifierInstance = new ModeClassifier(config);
  }
  return classifierInstance;
}

/**
 * Quick classification function using singleton
 */
export function classifyMode(context: ContextSources): ClassificationResult {
  return getModeClassifier().classify(context);
}
