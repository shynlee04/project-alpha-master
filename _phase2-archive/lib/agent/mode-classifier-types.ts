/**
 * @fileoverview Mode Classifier Types
 * @module lib/agent/mode-classifier-types
 * @governance EPIC-40 MM-02
 *
 * Type definitions for automatic agent mode classification.
 * Analyzes context sources to select optimal mode (coding/knowledge/orchestrator).
 *
 * @story 40-02: Implement Mode Classifier
 * @created 2026-01-10
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { AgentMode } from '@/domain/tools/tool-definition';

/**
 * Context sources for mode classification
 */
export interface ContextSources {
  /** User's prompt text */
  prompt: string;

  /** Current workspace type */
  workspaceType?: WorkspaceType;

  /** Active document context */
  activeDocument?: DocumentContext;

  /** Recent conversation messages */
  conversationHistory?: ConversationMessage[];
}

/**
 * Document context from active file
 */
export interface DocumentContext {
  /** File path */
  path: string;

  /** File extension */
  extension: string;

  /** File name */
  name: string;

  /** Language (if code file) */
  language?: string;

  /** First few lines of content for analysis */
  preview?: string;
}

/**
 * Conversation message for history analysis
 */
export interface ConversationMessage {
  /** Message role */
  role: 'user' | 'assistant' | 'system';

  /** Message content */
  content: string;

  /** Timestamp for recency weighting */
  timestamp?: number;

  /** Mode used for this message (if known) */
  mode?: AgentMode;
}

/**
 * Individual signal from a context source
 */
export interface ModeSignal {
  /** Signal source */
  source: 'workspace' | 'prompt' | 'document' | 'conversation';

  /** Suggested mode */
  mode: AgentMode;

  /** Signal weight (0-1) */
  weight: number;

  /** Human-readable reason */
  reason: string;

  /** Raw confidence score */
  confidence: number;
}

/**
 * Classification result with confidence and reasoning
 */
export interface ClassificationResult {
  /** Selected mode */
  mode: AgentMode;

  /** Overall confidence (0-1) */
  confidence: number;

  /** Human-readable explanation */
  reasoning: string[];

  /** Individual signals that contributed to decision */
  signals: ModeSignal[];

  /** Timestamp of classification */
  timestamp: number;
}

/**
 * Keyword patterns for prompt analysis
 */
export interface KeywordPattern {
  /** Keywords that suggest this mode */
  keywords: string[];

  /** Target mode */
  mode: AgentMode;

  /** Base weight for this pattern */
  weight: number;

  /** Category for reasoning */
  category: string;
}

/**
 * Mode classification configuration
 */
export interface ModeClassifierConfig {
  /** Minimum confidence to make a decision (default: 0.5) */
  minConfidence: number;

  /** Weight for workspace signal (default: 0.7) */
  workspaceWeight: number;

  /** Weight for prompt keyword signal (default: 0.8) */
  promptWeight: number;

  /** Weight for document signal (default: 0.5) */
  documentWeight: number;

  /** Weight for conversation history signal (default: 0.3) */
  conversationWeight: number;

  /** Default mode when signals are weak */
  defaultMode: AgentMode;

  /** Custom keyword patterns */
  customKeywords?: KeywordPattern[];
}

/**
 * Mode score for internal aggregation
 */
export interface ModeScore {
  mode: AgentMode;
  totalWeight: number;
  signalCount: number;
}
