/**
 * Tool Trust Levels Hook
 *
 * State management and persistence for tool trust levels.
 *
 * @module ToolTrustLevels/hooks/useToolTrustLevels
 * @layer Presentation
 * @hook useToolTrustLevels
 *
 * December 2025 Patterns:
 * - Custom hooks for business logic
 * - LocalStorage persistence
 * - Callback stability
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ToolTrustLevel } from '@/lib/agent/tool-permission-manager'

const TRUST_LEVELS_STORAGE_KEY = 'agent-tool-trust-levels'

export interface ToolTrustConfig {
    toolId: string
    toolName: string
    trustLevel: ToolTrustLevel
}

const DEFAULT_TOOLS: ToolTrustConfig[] = [
    { toolId: 'file-read', toolName: 'Read Files', trustLevel: 'auto' },
    { toolId: 'file-write', toolName: 'Write Files', trustLevel: 'prompt' },
    { toolId: 'terminal', toolName: 'Terminal Commands', trustLevel: 'prompt' },
    { toolId: 'web-search', toolName: 'Web Search', trustLevel: 'auto' },
]

interface UseToolTrustLevelsReturn {
    tools: ToolTrustConfig[]
    hasChanges: boolean
    handleTrustLevelChange: (toolId: string, newLevel: ToolTrustLevel) => void
    handleSave: () => void
    handleReset: () => void
}

/**
 * Tool Trust Levels Hook
 *
 * Manages tool trust levels with localStorage persistence.
 * Provides handlers for changing, saving, and resetting trust levels.
 */
export function useToolTrustLevels(): UseToolTrustLevelsReturn {
    const { t } = useTranslation()
    const [tools, setTools] = useState<ToolTrustConfig[]>([])
    const [hasChanges, setHasChanges] = useState(false)

    /**
     * Load trust levels from localStorage on mount
     */
    useEffect(() => {
        try {
            const stored = localStorage.getItem(TRUST_LEVELS_STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, ToolTrustLevel>
                const toolsWithLevels = DEFAULT_TOOLS.map((tool) => ({
                    ...tool,
                    trustLevel: parsed[tool.toolId] || tool.trustLevel,
                }))
                setTools(toolsWithLevels)
            } else {
                setTools(DEFAULT_TOOLS)
            }
        } catch (error) {
            console.error('[useToolTrustLevels] Failed to load trust levels:', error)
            setTools(DEFAULT_TOOLS)
        }
    }, [])

    /**
     * Handle trust level change for a tool
     */
    const handleTrustLevelChange = useCallback((toolId: string, newLevel: ToolTrustLevel) => {
        setTools((prev) => prev.map((tool) => (tool.toolId === toolId ? { ...tool, trustLevel: newLevel } : tool)))
        setHasChanges(true)
    }, [])

    /**
     * Save trust levels to localStorage
     */
    const handleSave = useCallback(() => {
        try {
            const trustLevelsMap: Record<string, ToolTrustLevel> = {}
            tools.forEach((tool) => {
                trustLevelsMap[tool.toolId] = tool.trustLevel
            })
            localStorage.setItem(TRUST_LEVELS_STORAGE_KEY, JSON.stringify(trustLevelsMap))
            setHasChanges(false)
            toast.success(t('agents.config.trustLevels.saveSuccess', 'Trust levels saved successfully'))
        } catch (error) {
            console.error('[useToolTrustLevels] Failed to save trust levels:', error)
            toast.error(t('agents.config.trustLevels.saveError', 'Failed to save trust levels'))
        }
    }, [tools, t])

    /**
     * Reset trust levels to defaults
     */
    const handleReset = useCallback(() => {
        setTools(DEFAULT_TOOLS)
        setHasChanges(true)
        toast.info(t('agents.config.trustLevels.resetMessage', 'Trust levels reset to defaults'))
    }, [t])

    return {
        tools,
        hasChanges,
        handleTrustLevelChange,
        handleSave,
        handleReset,
    }
}
