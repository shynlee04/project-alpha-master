/**
 * @fileoverview Tool Catalog
 * @module infrastructure/tools/tool-catalog
 *
 * Catalog of all existing tools with metadata.
 * Initializes the centralized tool registry.
 *
 * @epic 40 - Agent Chat Self-Switching Orchestrator
 * @story 40-01 - Create Centralized Tool Registry
 */

import type { AgentMode, WorkspaceType } from '@/domain/tools';
import { toolRegistry, createToolMetadata, createRegisteredTool } from './centralized-tool-registry';
import type { ToolCategory } from '@/infrastructure/persistence/stores/permissions/types';

/**
 * Import all tool definitions
 * We import only the definitions (schemas), not implementations
 */
import { readFileDef } from '@/lib/agent/tools/read-file-tool';
import { writeFileDef } from '@/lib/agent/tools/write-file-tool';
import { listFilesDef } from '@/lib/agent/tools/list-files-tool';
import { executeCommandDef } from '@/lib/agent/tools/execute-command-tool';
import { searchNotesDef } from '@/lib/agent/tools/search-notes-tool';
import { synthesizeDef } from '@/lib/agent/tools/synthesize-tool';
import { processPDFDef } from '@/lib/agent/tools/process-pdf-tool';
import { processImageDef } from '@/lib/agent/tools/process-image-tool';
import { processURLDef } from '@/lib/agent/tools/process-url-tool';
import { voiceInputDef } from '@/lib/agent/tools/voice-input-tool';
import { voiceOutputDef } from '@/lib/agent/tools/voice-output-tool';

/**
 * Default agent modes for each tool category
 */
const DEFAULT_MODES: Record<ToolCategory, AgentMode[]> = {
  files: ['coding', 'orchestrator'],
  terminal: ['coding', 'orchestrator'],
  knowledge: ['knowledge', 'orchestrator'],
  vision: ['knowledge', 'orchestrator'],
  search: ['knowledge', 'coding', 'orchestrator'],
  web: ['knowledge', 'coding', 'orchestrator'],
};

/**
 * Default workspace types for each tool category
 */
const DEFAULT_WORKSPACES: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];

/**
 * Tool catalog configuration
 * Maps each tool to its metadata
 */
const TOOL_CATALOG = [
  // File Tools (3)
  {
    definition: readFileDef,
    metadata: createToolMetadata('read_file', 'files', DEFAULT_MODES.files, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'both',
    }),
  },
  {
    definition: writeFileDef,
    metadata: createToolMetadata('write_file', 'files', DEFAULT_MODES.files, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'prompt',
      riskLevel: 'high',
      executionSide: 'both',
    }),
  },
  {
    definition: listFilesDef,
    metadata: createToolMetadata('list_files', 'files', DEFAULT_MODES.files, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'both',
    }),
  },

  // Terminal Tools (1)
  {
    definition: executeCommandDef,
    metadata: createToolMetadata('execute_command', 'terminal', DEFAULT_MODES.terminal, ['ide'], {
      defaultTrustLevel: 'prompt',
      riskLevel: 'high',
      executionSide: 'both',
    }),
  },

  // Search Tools (1)
  {
    definition: searchNotesDef,
    metadata: createToolMetadata('search_notes', 'search', DEFAULT_MODES.knowledge, ['knowledge', 'notes'], {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'server',
    }),
  },

  // Multimodal Tools (4)
  {
    definition: synthesizeDef,
    metadata: createToolMetadata('synthesize', 'vision', DEFAULT_MODES.knowledge, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'server',
    }),
  },
  {
    definition: processPDFDef,
    metadata: createToolMetadata('process_pdf', 'vision', DEFAULT_MODES.knowledge, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'server',
    }),
  },
  {
    definition: processImageDef,
    metadata: createToolMetadata('process_image', 'vision', DEFAULT_MODES.knowledge, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'server',
    }),
  },
  {
    definition: processURLDef,
    metadata: createToolMetadata('process_url', 'web', DEFAULT_MODES.knowledge, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'medium',
      executionSide: 'server',
    }),
  },

  // Voice Tools (2)
  {
    definition: voiceInputDef,
    metadata: createToolMetadata('voice_input', 'vision', DEFAULT_MODES.knowledge, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'client',
    }),
  },
  {
    definition: voiceOutputDef,
    metadata: createToolMetadata('voice_output', 'vision', DEFAULT_MODES.knowledge, DEFAULT_WORKSPACES, {
      defaultTrustLevel: 'auto',
      riskLevel: 'low',
      executionSide: 'client',
    }),
  },
];

/**
 * Get tool counts by category
 */
export function getToolCountsByCategory(): Record<string, number> {
  return {
    files: TOOL_CATALOG.filter((t) => t.metadata.category === 'files').length,
    terminal: TOOL_CATALOG.filter((t) => t.metadata.category === 'terminal').length,
    knowledge: TOOL_CATALOG.filter((t) => t.metadata.category === 'knowledge').length,
    vision: TOOL_CATALOG.filter((t) => t.metadata.category === 'vision').length,
    search: TOOL_CATALOG.filter((t) => t.metadata.category === 'search').length,
    web: TOOL_CATALOG.filter((t) => t.metadata.category === 'web').length,
  };
}

/**
 * Initialize the tool registry with all tools
 * Call this on application startup
 */
export function initializeToolRegistry(): void {
  // Clear any existing tools
  toolRegistry.clear();

  // Register all tools from catalog
  for (const { definition, metadata } of TOOL_CATALOG) {
    toolRegistry.register(createRegisteredTool(definition, metadata));
  }
}

/**
 * Get the tool catalog (read-only)
 */
export function getToolCatalog(): ReadonlyArray<typeof TOOL_CATALOG[number]> {
  return TOOL_CATALOG;
}

/**
 * Re-export the singleton instance
 */
export { toolRegistry };
