/**
 * @fileoverview Agent Field Update Hook
 * @module components/agent/hooks/useAgentFieldUpdate
 *
 * Hook for updating agent form fields.
 * Extracted from AgentConfigDialog for better separation of concerns.
 */

import { useCallback } from 'react';

interface FieldUpdateOptions {
    setName: (value: string) => void;
    setDescription: (value: string) => void;
    setProviderId: (value: string) => void;
    setModelId: (value: string) => void;
    setCustomBaseURL: (value: string) => void;
    setCustomModelId: (value: string) => void;
    setCustomHeaders: (value: string) => void;
    setEnableNativeTools: (value: boolean) => void;
}

/**
 * Hook for updating agent form fields
 *
 * @param setters - Object containing all field setter functions
 * @returns handleUpdateField function
 *
 * @example
 * ```tsx
 * const handleUpdateField = useAgentFieldUpdate({
 *   setName,
 *   setDescription,
 *   setProviderId,
 *   // ... other setters
 * });
 *
 * // Usage
 * handleUpdateField('name', 'New Agent Name');
 * handleUpdateField('providerId', 'openrouter');
 * ```
 */
export function useAgentFieldUpdate(setters: FieldUpdateOptions) {
    return useCallback((field: string, value: any) => {
        switch (field) {
            case 'name':
                setters.setName(value);
                break;
            case 'description':
                setters.setDescription(value);
                break;
            case 'providerId':
                setters.setProviderId(value);
                // Note: Model reset logic should be handled by caller
                break;
            case 'modelId':
                setters.setModelId(value);
                break;
            case 'customBaseURL':
                setters.setCustomBaseURL(value);
                break;
            case 'customModelId':
                setters.setCustomModelId(value);
                break;
            case 'customHeaders':
                setters.setCustomHeaders(value);
                break;
            case 'enableNativeTools':
                setters.setEnableNativeTools(value);
                break;
            default:
                console.warn(`Unknown field: ${field}`);
        }
    }, [
        setters.setName,
        setters.setDescription,
        setters.setProviderId,
        setters.setModelId,
        setters.setCustomBaseURL,
        setters.setCustomModelId,
        setters.setCustomHeaders,
        setters.setEnableNativeTools,
    ]);
}
