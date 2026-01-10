/**
 * @fileoverview Prompt Orchestrator
 * @module lib/agent/prompt-orchestrator
 *
 * Orchestrates dynamic system prompt generation based on context.
 * Integrates ModeClassifier, CentralizedToolRegistry, and system-prompt templates.
 *
 * @epic EPIC-40 - Agent Chat Self-Switching & Tool Registry
 * @story 40-07 - Implement Prompt Orchestrator
 */

import { classifyMode, getModeClassifier } from './mode-classifier';
import { toolRegistry } from '@/infrastructure/tools/centralized-tool-registry';
import type { ContextSources, ClassificationResult } from './mode-classifier-types';
import type { AgentMode, WorkspaceType } from '@/domain/tools';
import {
  buildSystemPrompt,
  getModePrompt,
  ORCHESTRATOR_SYSTEM_PROMPT,
  MODE_CODING_PROMPT,
  MODE_KNOWLEDGE_PROMPT,
  MODE_ORCHESTRATOR_SUB_PROMPT,
} from './system-prompt';

/**
 * Tool description for prompt injection
 */
interface ToolDescription {
  name: string;
  description: string;
  category: string;
}

/**
 * Orchestrated prompt result
 */
export interface OrchestratedPrompt {
  /** Complete system prompt string */
  systemPrompt: string;
  /** Selected mode based on context analysis */
  mode: AgentMode;
  /** Classification result with reasoning */
  classification: ClassificationResult;
  /** Tools available for this mode */
  tools: ToolDescription[];
  /** Timestamp when prompt was generated */
  timestamp: number;
}

/**
 * Context for prompt building
 */
export interface PromptContext extends ContextSources {
  /** Optional workspace type override */
  workspaceType?: WorkspaceType;
  /** Optional project context string */
  projectContext?: string;
}

/**
 * Prompt Orchestrator Configuration
 */
export interface PromptOrchestratorConfig {
  /** Whether to include tool descriptions in prompt */
  includeTools?: boolean;
  /** Whether to include classification reasoning */
  includeReasoning?: boolean;
  /** Maximum tools to describe in prompt */
  maxTools?: number;
  /** Custom tool constitution override */
  toolConstitution?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<PromptOrchestratorConfig> = {
  includeTools: true,
  includeReasoning: true,
  maxTools: 20,
  toolConstitution: '',
};

/**
 * Prompt Orchestrator Class
 *
 * Orchestrates the creation of dynamic system prompts by:
 * 1. Using ModeClassifier to determine optimal mode from context
 * 2. Filtering tools from CentralizedToolRegistry based on mode
 * 3. Building prompt with mode-specific template and tool descriptions
 * 4. Injecting context (workspace, project, active document)
 */
export class PromptOrchestrator {
  private config: Required<PromptOrchestratorConfig>;

  constructor(config?: Partial<PromptOrchestratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main entry point - build orchestrated system prompt
   *
   * @param context - Prompt context with user input and environment
   * @returns Orchestrated prompt with mode, classification, and tools
   */
  buildPrompt(context: PromptContext): OrchestratedPrompt {
    const timestamp = Date.now();

    // Step 1: Classify mode from context sources
    const classification = classifyMode(context);

    // Step 2: Filter tools for the classified mode
    const tools = this.getToolsForMode(classification.mode, context.workspaceType);

    // Step 3: Build the system prompt
    const systemPrompt = this.buildSystemPromptInternal(
      classification.mode,
      tools,
      context
    );

    return {
      systemPrompt,
      mode: classification.mode,
      classification,
      tools,
      timestamp,
    };
  }

  /**
   * Build system prompt with mode-specific template and tool descriptions
   */
  private buildSystemPromptInternal(
    mode: AgentMode,
    tools: ToolDescription[],
    context: PromptContext
  ): string {
    // Start with mode-specific base prompt
    const modePrompt = getModePrompt(mode);

    // Build tool descriptions section
    let toolSection = '';
    if (this.config.includeTools && tools.length > 0) {
      toolSection = this.buildToolSection(tools);
    }

    // Build context section
    let contextSection = this.buildContextSection(context);

    // Combine all sections
    let finalPrompt = modePrompt;

    if (toolSection) {
      finalPrompt += `\n\n${toolSection}`;
    }

    if (contextSection) {
      finalPrompt += `\n\n${contextSection}`;
    }

    return finalPrompt;
  }

  /**
   * Build tool descriptions section for prompt
   */
  private buildToolSection(tools: ToolDescription[]): string {
    const limitedTools = tools.slice(0, this.config.maxTools);
    const toolDescriptions = limitedTools
      .map(t => `- **${t.name}**: ${t.description}`)
      .join('\n');

    return `## Available Tools\n\n${toolDescriptions}`;
  }

  /**
   * Build context injection section
   */
  private buildContextSection(context: PromptContext): string {
    const parts: string[] = [];

    if (context.workspaceType) {
      parts.push(`**Workspace**: ${context.workspaceType}`);
    }

    if (context.activeDocument) {
      const { path, extension } = context.activeDocument;
      parts.push(`**Active File**: ${path} (.${extension})`);
    }

    if (context.projectContext) {
      parts.push(`**Project**: ${context.projectContext}`);
    }

    if (this.config.includeReasoning && context.prompt) {
      parts.push(`**Current Request**: ${context.prompt}`);
    }

    if (parts.length === 0) {
      return '';
    }

    return `## Context\n\n${parts.join('\n')}`;
  }

  /**
   * Get tools for a specific mode
   */
  private getToolsForMode(mode: AgentMode, workspaceType?: WorkspaceType): ToolDescription[] {
    // Get filtered tools from registry
    const filteredTools = toolRegistry.getFilteredTools({
      mode,
      workspaceType,
      serverExposedOnly: false, // Get all tools, not just server-exposed
    });

    // Convert to tool descriptions
    return filteredTools.map(tool => ({
      name: tool.definition.name,
      description: tool.definition.description || '',
      category: tool.metadata.category,
    }));
  }

  /**
   * Get just the mode without full prompt (for mode switching logic)
   *
   * @param context - Prompt context
   * @returns Classification result with selected mode
   */
  classifyMode(context: PromptContext): ClassificationResult {
    return classifyMode(context);
  }

  /**
   * Get the orchestrator base prompt (for initial routing)
   */
  getOrchestratorPrompt(): string {
    return ORCHESTRATOR_SYSTEM_PROMPT;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PromptOrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<PromptOrchestratorConfig>> {
    return this.config;
  }
}

/**
 * Singleton instance
 */
let orchestratorInstance: PromptOrchestrator | null = null;

/**
 * Get or create the singleton PromptOrchestrator instance
 */
export function getPromptOrchestrator(
  config?: Partial<PromptOrchestratorConfig>
): PromptOrchestrator {
  if (!orchestratorInstance || config) {
    orchestratorInstance = new PromptOrchestrator(config);
  }
  return orchestratorInstance;
}

/**
 * Quick prompt building function using singleton
 *
 * @param context - Prompt context
 * @param config - Optional config override
 * @returns Orchestrated prompt
 */
export function buildOrchestratedPrompt(
  context: PromptContext,
  config?: Partial<PromptOrchestratorConfig>
): OrchestratedPrompt {
  const orchestrator = config
    ? new PromptOrchestrator(config)
    : getPromptOrchestrator();
  return orchestrator.buildPrompt(context);
}

/**
 * Get the mode-specific prompt directly (for backward compatibility)
 *
 * @param mode - The agent mode
 * @param context - Optional context for prompt building
 * @returns Mode-specific system prompt
 */
export function getPromptForMode(
  mode: AgentMode,
  context?: PromptContext
): string {
  return buildSystemPrompt(mode, {
    workspaceType: context?.workspaceType,
    projectContext: context?.projectContext,
    activeDocument: context?.activeDocument?.path,
  });
}
