/**
 * @fileoverview Agent System Prompt Architecture
 * @module lib/agent/system-prompt
 *
 * TWO-LAYER ARCHITECTURE:
 *
 * 1. ORCHESTRATOR (meta-level, always active):
 *    - Analyzes 4 context sources for mode selection
 *    - Scores modes based on context
 *    - Responds conversationally about mode choice
 *    - Does NOT execute tools - routes to mode-specific prompt
 *
 * 2. MODE-SPECIFIC PROMPTS (execution layer):
 *    - Specific instructions for that mode
 *    - Tool focus groups (what tools, in what order)
 *    - Behavior style and execution rules
 *    - Executes actions
 *
 * @epic EPIC-40 - Agent Chat Self-Switching & Tool Registry
 * @story 40-07 - Implement Prompt Orchestrator
 */

// =============================================================================
// IMPORTS (Domain Types)
// =============================================================================

import type { AgentMode, WorkspaceType } from '@/domain/tools/tool-definition';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Context sources for mode selection
 */
export interface ModeContext {
   /** What the user just asked */
   initiatingPrompt: string;
   /** Current workspace type */
   workspaceType?: WorkspaceType;
   /** Currently active file */
   activeDocument?: {
      path: string;
      extension: string;
   };
   /** Recent conversation history */
   conversationHistory?: Array<{
      role: string;
      mode?: AgentMode;
      content: string;
   }>;
}

/**
 * Mode scoring result
 */
export interface ModeScore {
   mode: AgentMode;
   score: number;
   reasoning: string;
}

// =============================================================================
// LAYER 1: ORCHESTRATOR SYSTEM PROMPT (Meta-Level)
// =============================================================================

/**
 * ORCHESTRATOR SYSTEM PROMPT
 *
 * This is the DEFAULT prompt that handles mode selection.
 * It does NOT execute tools - it only routes to appropriate mode.
 */
export const ORCHESTRATOR_SYSTEM_PROMPT = `
# You are Via-Gent Agent Orchestrator

Your job is to understand the user's request and switch to the appropriate mode.

## How You Work

You analyze FOUR context sources to decide on mode:

1. **Initiating Prompt** - What the user just asked
2. **Workspace Type** - ide, notes, knowledge, or study
3. **Active Document** - File currently open (extension indicates context)
4. **Conversation History** - Recent modes used

## Available Modes

### coding
- Use for: Writing code, fixing bugs, running commands, technical implementation
- Triggered by: Code files (.ts, .tsx, .py, etc.), build commands, debug requests
- Tools: read_file, write_file, execute_command, search_code

### knowledge
- Use for: Notes, summarization, searching documents, organizing information
- Triggered by: Note files (.md), search requests, summarize commands
- Tools: read_note, write_note, search_notes, summarize

### orchestrator
- Use for: Planning, architecture decisions, analysis, complex multi-step tasks
- Triggered by: Plan/design keywords, ambiguous requests
- Tools: read_file, list_files, search_code (read-only)

## Your First Response

ALWAYS start with a conversational response explaining your mode choice:

"I see you're [context]. Based on your request to [request],
I'm switching to **[MODE]** mode to help you [expected outcome]."

Then SWITCH to that mode's prompt for actual execution.

## Important

- You do NOT execute tools yourself
- You do NOT write code or make changes
- You ONLY analyze, score modes, and explain your choice
- After explaining, the mode-specific prompt takes over
- When conversation shifts, return here to re-evaluate
`;

// =============================================================================
// LAYER 2: MODE-SPECIFIC PROMPTS (Execution Layer)
// =============================================================================

/**
 * CODING MODE PROMPT
 *
 * Specific instructions for code execution in IDE workspace
 */
export const MODE_CODING_PROMPT = `
# Coding Mode

You are now in CODING mode. Your focus is on implementing, fixing, and building code.

## Your Tools (in priority order)

1. read_file - Read existing code
2. write_file - Create or modify files
3. execute_command - Run npm, tests, builds
4. search_code - Find code patterns

## How You Work

- Execute changes directly
- Follow project conventions
- Use technical language
- Be precise and direct
- Show code, explain briefly

## Current Project Context

- Framework: React + TypeScript
- Styling: Tailwind CSS (8-bit aesthetic)
- Router: TanStack Router
- State: Zustand
- Storage: Dexie (IndexedDB)

## Rules

- Always read before modifying
- Use relative paths from project root
- Test after changes
- Follow CLAUDE.md conventions
- Keep responses focused on code
`;

/**
 * KNOWLEDGE MODE PROMPT
 *
 * Specific instructions for notes and knowledge management
 */
export const MODE_KNOWLEDGE_PROMPT = `
# Knowledge Mode

You are now in KNOWLEDGE mode. Your focus is on notes, summarization, and information management.

## Your Capabilities

- Read up to 20 pages of context
- Summarize content
- Write to new notes OR append to existing note blocks
- Search indexed documents
- Output insights from retrieved content

## Your Tools (in priority order)

1. read_note - Read existing notes
2. write_note - Create new note or append to block
3. search_notes - Find relevant notes
4. summarize - Condense content

## How You Work

- Read thoroughly before suggesting changes
- Suggest structure (title, tags, sections)
- Find connections between notes
- Cite relevant notes in responses
- Explain organizational rationale

## Rules

- Always read notes before modifying
- Ask before changing existing notes
- Focus on clarity and organization
- Converse in user's input language
`;

/**
 * ORCHESTRATOR SUB-MODE PROMPT
 *
 * For planning and analysis (read-only)
 */
export const MODE_ORCHESTRATOR_SUB_PROMPT = `
# Orchestrator Mode (Planning & Analysis)

You are now in ORCHESTRATOR mode for planning and analysis.

## Your Tools (read-only)

1. read_file - Read existing code
2. list_files - Explore project structure
3. search_code - Find patterns

## How You Work

- Create structured plans
- Identify dependencies
- Communicate trade-offs
- Get confirmation before major changes
- Think systematically

## Rules

- Plan first, execute later
- Identify dependencies clearly
- Explain pros/cons of decisions
- Ask before major changes
`;

// =============================================================================
// MODE DEFINITIONS (for backward compatibility)
// =============================================================================

/**
 * Legacy AgentModeConfig interface for backward compatibility
 * @deprecated Use AgentMode type directly from domain layer
 */
export interface AgentModeConfig {
   id: string;
   name: string;
   icon: string;
   prompt: string;
}

/**
 * Legacy mode definitions
 * @deprecated Use MODE_*_PROMPT constants directly
 */
export const MODE_SOLO_DEV: AgentModeConfig = {
   id: 'solo-dev',
   name: 'Quick Flow Solo Dev',
   icon: '🚀',
   prompt: MODE_CODING_PROMPT,
};

export const MODE_CODE: AgentModeConfig = {
   id: 'code',
   name: 'Code',
   icon: '💻',
   prompt: MODE_CODING_PROMPT,
};

export const MODE_NOTES: AgentModeConfig = {
   id: 'notes',
   name: 'Notes Assistant',
   icon: '📝',
   prompt: MODE_KNOWLEDGE_PROMPT,
};

export const MODE_ORCHESTRATOR: AgentModeConfig = {
   id: 'orchestrator',
   name: 'Orchestrator',
   icon: '🎯',
   prompt: MODE_ORCHESTRATOR_SUB_PROMPT,
};

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

/**
 * Build the complete system prompt
 *
 * @param mode - The mode to use ('orchestrator' for default)
 * @param context - Optional context (workspace, project, etc.)
 * @returns Complete system prompt string
 */
export function buildSystemPrompt(
   mode: AgentMode = 'orchestrator',
   context?: {
      workspaceType?: WorkspaceType;
      projectContext?: string;
      activeDocument?: string;
   }
): string {
   // Select mode prompt
   const modePrompts: Record<AgentMode, string> = {
      orchestrator: ORCHESTRATOR_SYSTEM_PROMPT,
      coding: MODE_CODING_PROMPT,
      knowledge: MODE_KNOWLEDGE_PROMPT,
   };

   let prompt = modePrompts[mode];

   // Add context if provided
   if (context?.workspaceType) {
      prompt += `

## Workspace
You are in the ${context.workspaceType} workspace.`;
   }

   if (context?.activeDocument) {
      prompt += `

## Active Document
${context.activeDocument}`;
   }

   if (context?.projectContext) {
      prompt += `

## Project Context
${context.projectContext}`;
   }

   return prompt;
}

/**
 * Get the mode-specific prompt directly
 *
 * @param mode - The mode to get prompt for
 * @returns Mode-specific prompt string
 */
export function getModePrompt(mode: AgentMode): string {
   const prompts: Record<AgentMode, string> = {
      orchestrator: ORCHESTRATOR_SYSTEM_PROMPT,
      coding: MODE_CODING_PROMPT,
      knowledge: MODE_KNOWLEDGE_PROMPT,
   };
   return prompts[mode];
}

/**
 * Map ModeClassifier mode strings to full mode config objects
 *
 * ModeClassifier returns: 'coding', 'knowledge', 'orchestrator'
 * This function provides the mapping to AgentModeConfig for the hook.
 *
 * @param classifierMode - Mode string from ModeClassifier
 * @returns Mapped AgentModeConfig with id, name, icon, prompt
 */
export function getAgentModeForClassifier(classifierMode: string): AgentModeConfig {
   const modeMap: Record<AgentMode, AgentModeConfig> = {
      coding: MODE_CODE,
      knowledge: MODE_NOTES,
      orchestrator: MODE_ORCHESTRATOR,
   };

   return modeMap[classifierMode as AgentMode] || MODE_ORCHESTRATOR;
}

/**
 * Convert AgentModeConfig to SystemPromptComposer format
 * Bridges new system-prompt architecture with existing SystemPromptComposer
 *
 * @param modeConfig - AgentModeConfig from getAgentModeForClassifier
 * @returns Agent mode format expected by SystemPromptComposer
 */
export function toComposerFormat(modeConfig: AgentModeConfig): {
   id: string;
   name: string;
   icon: string;
   cognitivePhase: string;
   persona: string;
   communicationStyle: string;
   rules: string;
} {
   // Parse the prompt to extract sections, or provide defaults
   const prompt = modeConfig.prompt;

   return {
      id: modeConfig.id,
      name: modeConfig.name,
      icon: modeConfig.icon,
      cognitivePhase: 'Executing',
      persona: `You are ${modeConfig.name}.`,
      communicationStyle: 'Direct and focused',
      rules: prompt, // Use the full prompt as rules
   };
}

// =============================================================================
// LEGACY EXPORTS (backward compatibility)
// =============================================================================

/**
 * @deprecated Use buildSystemPrompt() for new code
 */
export function getCodingAgentSystemPrompt(projectContext?: string): string {
   return buildSystemPrompt('coding', { projectContext });
}

/**
 * @deprecated Use buildSystemPrompt() for new code
 */
export function getNotesAgentSystemPrompt(projectContext?: string): string {
   return buildSystemPrompt('knowledge', { projectContext });
}

/**
 * @deprecated Use buildSystemPrompt() for new code
 */
export const CODING_AGENT_SYSTEM_PROMPT = buildSystemPrompt('coding');

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

/**
 * Default model configuration
 */
export const DEFAULT_AGENT_CONFIG = {
   provider: 'openrouter',
   model: 'mistralai/devstral-2512:free',
   maxTokens: 4000,
   temperature: 0.3,
};
