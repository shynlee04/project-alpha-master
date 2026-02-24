/**
 * @fileoverview System Prompt Composer Types
 * @module lib/agent/prompt-composer-types
 */

/**
 * Layer types for system prompt composition
 */
export type LayerType = 'tool-constitution' | 'agent-mode' | 'context-injection';

/**
 * Interface for a system prompt layer
 * All layers implement this interface for consistency
 */
export interface PromptLayer {
  /** Unique identifier for this layer */
  id: string;

  /** Type of layer (determines caching and update strategy) */
  type: LayerType;

  /** Priority in composition order (lower = earlier in prompt) */
  priority: number;

  /** Whether this layer should be cached (Layers 1+2) */
  cacheable: boolean;

  /** Generate prompt content for this layer */
  generate: (context: LayerContext) => string;
}

/**
 * Context data available to layers for prompt generation
 */
export interface LayerContext {
  /** Currently open files (from IDE state) */
  openFiles: Array<{ path: string; name: string }>;

  /** Currently active file (from IDE state) */
  activeFile?: { path: string; name: string };

  /** Project package.json content */
  projectPackageJson?: {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
  };

  /** Available workspace state */
  workspaceReady: boolean;
}

/**
 * Configuration options for SystemPromptComposer
 */
export interface PromptComposerConfig {
  /** Tool constitution (Layer 1) - safety rules and tool usage guidelines */
  toolConstitution?: string;

  /** Agent mode (Layer 2) - persona configuration */
  agentMode?: {
    id: string;
    name: string;
    icon: string;
    cognitivePhase: string;
    persona: string;
    communicationStyle: string;
    rules: string;
  };

  /** Maximum number of open files to include in Layer 3 */
  maxOpenFiles?: number;
}

/**
 * Cache entry for storing layer content
 */
export interface CacheEntry {
  content: string;
  timestamp: number;
  configHash: string;
}
