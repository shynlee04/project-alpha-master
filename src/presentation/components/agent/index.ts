/**
 * @fileoverview Agent Components Barrel Export
 * @module presentation/components/agent
 *
 * Centralized exports for all agent-related components.
 * Follows December 2025 barrel export pattern for clean imports.
 *
 * @example
 * ```tsx
 * // Instead of:
 * import { AgentConfigDialog } from '@/presentation/components/agent/AgentConfigDialog';
 * import { ApiKeyInputSection } from '@/presentation/components/agent/ApiKeyInputSection';
 *
 * // Use:
 * import { AgentConfigDialog, ApiKeyInputSection } from '@/presentation/components/agent';
 * ```
 */

// Main Configuration Dialogs
export { AgentConfigDialog } from './AgentConfigDialog';
export { ProviderConfigDialog } from './ProviderConfigDialog';

// Configuration Sub-Components
export { ApiKeyInputSection } from './ApiKeyInputSection';
export type { ApiKeyInputSectionProps, ConnectionStatus } from './ApiKeyInputSection';
export { AgentImportExport } from './AgentImportExport';
export type { AgentImportExportProps } from './AgentImportExport';
// Ralph Loop Cycle 17: AgentBasicConfig deleted - use split components from AgentConfigForm/
// export { AgentBasicConfig } from './AgentBasicConfig';
// export type { AgentBasicConfigProps } from './AgentBasicConfig';

// Hooks
export { useAgentFormValidation } from './hooks/useAgentFormValidation';
export type {
    UseAgentFormValidationProps,
    ValidationState,
    AgentFormData,
} from './hooks/useAgentFormValidation';

// Agent Settings Components
export { ProviderSettings } from './ProviderSettings';
export { PreferenceSettings } from './PreferenceSettings';

// Permission and Tool Management
export { ToolPermissionsConfig } from './ToolPermissionsConfig';
export { ToolAvailabilityIndicator } from './ToolAvailabilityIndicator';
export { ToolTrustLevelManager } from './ToolTrustLevelManager';
export { WorkspaceToolPermissionsConfig } from './WorkspaceToolPermissionsConfig';
export { WorkspacePermissionManager } from './WorkspacePermissionManager';
export { WorkspaceAwareAgentSelector } from './WorkspaceAwareAgentSelector';

// Chat and Conversation Components
export { ConversationCard } from './ConversationCard';
export { DeepThinkUI } from './DeepThinkUI';
export { MemorySearch } from './MemorySearch';

// AgentConfigForm Sub-components (if any)
export * from './AgentConfigForm';
