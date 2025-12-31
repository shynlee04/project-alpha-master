/**
 * @fileoverview Agent Configuration Types
 * @module presentation/components/agent/agent-config-types
 * @governance Architectural Specification v3.0
 *
 * Type definitions for agent configuration dialog.
 * Integrated with domain layer (entities, value objects).
 */

import type { Agent } from '@/domain/entities/agent';
import type { WorkspaceBinding } from '@/domain/value-objects/workspace-binding';
import type { AgentToolBinding } from '@/domain/value-objects/tool-permission';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Connection status type
 */
export type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

/**
 * Configuration tab type
 */
export type ConfigTab = 'basic' | 'advanced' | 'permissions';

/**
 * Form validation errors type
 */
export type FormErrors = {
  name?: string;
  description?: string;
  provider?: string;
  modelId?: string;
  apiKey?: string;
  customBaseURL?: string;
};

/**
 * Agent configuration dialog props
 * BF-01 FIX: Changed from agent prop to agentId for hot-reload support
 */
export interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (agentId: string) => void; // BF-01 FIX: Return agentId instead of full agent
  agentId: string | null; // BF-01 FIX: Read from store by ID (single source of truth)
}

/**
 * Custom header type for OpenAI Compatible provider
 */
export interface CustomHeader {
  key: string;
  value: string;
}

/**
 * LLM Parameters for fine-tuning model behavior
 */
export interface LLMParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  systemPrompt?: string;
}

/**
 * Workspace binding form data
 * Used for configuring agent availability per workspace
 */
export interface WorkspaceBindingFormData {
  workspaceType: WorkspaceType;
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}

/**
 * Tool permission form data
 * Used for configuring workspace-specific tool access
 */
export interface ToolPermissionFormData {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    canvas: boolean;
  };
}

/**
 * Agent form data interface
 * Integrated with domain layer entities and value objects
 */
export interface AgentFormData {
  name: string;
  description: string;
  providerId: string;
  modelId: string;
  apiKey: string;
  customBaseURL?: string;
  customModelId?: string;
  customHeaders?: CustomHeader[];
  enableNativeTools?: boolean;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  systemPrompt?: string;

  // New fields for workspace bindings and tool permissions
  workspaceBindings?: WorkspaceBindingFormData[];
  toolPermissions?: ToolPermissionFormData[];
}

