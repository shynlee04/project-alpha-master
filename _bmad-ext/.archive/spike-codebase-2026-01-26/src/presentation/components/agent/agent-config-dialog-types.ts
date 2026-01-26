/**
 * @fileoverview Agent Config Dialog Types
 * @module presentation/components/agent
 *
 * Type definitions for AgentConfigDialog component.
 *
 * @epic P0.5 - Redesign Agent Configuration Flow
 */

import type { Agent } from '@/core/entities/Agent';

/**
 * Connection status for API key validation
 */
export type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

/**
 * Configuration tab identifier
 */
export type ConfigTab = 'basic' | 'advanced';

/**
 * Form validation errors
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
 * AgentConfigDialog component props
 */
export interface AgentConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (agent: Agent) => void;
    agent?: Agent;
}
