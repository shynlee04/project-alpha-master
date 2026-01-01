/**
 * Tool Trust Level Manager - Global Tool Permission Configuration
 *
 * UI for managing global tool trust levels across all agents.
 * Allows users to configure which tools require approval.
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval (safe operations)
 * - 'prompt': Require user approval before execution (risky operations)
 * - 'block': Never execute (dangerous operations)
 *
 * @module presentation/components/agent
 * @governance Ralph Loop Cycle 4, Phase 5
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, ShieldAlert, ShieldX, RotateCcw } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select'
import { PixelBadge } from '@/presentation/components/ui/pixel-badge'
import { toast } from 'sonner'
import type { ToolTrustLevel } from '@/lib/agent/tool-permission-manager'

/**
 * Tool configuration with trust level
 */
interface ToolTrustConfig {
    toolId: string
    toolName: string
    trustLevel: ToolTrustLevel
}

/**
 * Storage key for tool trust levels in localStorage
 */
const TRUST_LEVELS_STORAGE_KEY = 'agent-tool-trust-levels'

/**
 * Default tools with their trust levels
 */
const DEFAULT_TOOLS: ToolTrustConfig[] = [
    { toolId: 'file-read', toolName: 'Read Files', trustLevel: 'auto' },
    { toolId: 'file-write', toolName: 'Write Files', trustLevel: 'prompt' },
    { toolId: 'terminal', toolName: 'Terminal Commands', trustLevel: 'prompt' },
    { toolId: 'web-search', toolName: 'Web Search', trustLevel: 'auto' },
]

/**
 * Trust level descriptions for user guidance
 */
const TRUST_LEVEL_DESCRIPTIONS: Record<ToolTrustLevel, { label: string; color: string; icon: any }> = {
    auto: {
        label: 'Auto-Execute',
        color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        icon: Shield
    },
    prompt: {
        label: 'Require Approval',
        color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        icon: ShieldAlert
    },
    block: {
        label: 'Blocked',
        color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        icon: ShieldX
    }
}

/**
 * ToolTrustLevelManager Component
 *
 * Provides UI for managing global tool trust levels with persistence.
 */
export function ToolTrustLevelManager() {
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
                const toolsWithLevels = DEFAULT_TOOLS.map(tool => ({
                    ...tool,
                    trustLevel: parsed[tool.toolId] || tool.trustLevel
                }))
                setTools(toolsWithLevels)
            } else {
                setTools(DEFAULT_TOOLS)
            }
        } catch (error) {
            console.error('[ToolTrustLevelManager] Failed to load trust levels:', error)
            setTools(DEFAULT_TOOLS)
        }
    }, [])

    /**
     * Handle trust level change for a tool
     */
    const handleTrustLevelChange = useCallback((toolId: string, newLevel: ToolTrustLevel) => {
        setTools(prev => prev.map(tool =>
            tool.toolId === toolId ? { ...tool, trustLevel: newLevel } : tool
        ))
        setHasChanges(true)
    }, [])

    /**
     * Save trust levels to localStorage
     */
    const handleSave = useCallback(() => {
        try {
            const trustLevelsMap: Record<string, ToolTrustLevel> = {}
            tools.forEach(tool => {
                trustLevelsMap[tool.toolId] = tool.trustLevel
            })
            localStorage.setItem(TRUST_LEVELS_STORAGE_KEY, JSON.stringify(trustLevelsMap))
            setHasChanges(false)
            toast.success(t('agents.config.trustLevels.saveSuccess', 'Trust levels saved successfully'))
        } catch (error) {
            console.error('[ToolTrustLevelManager] Failed to save trust levels:', error)
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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-pixel font-bold">
                        {t('agents.config.trustLevels.title', 'Tool Trust Levels')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('agents.config.trustLevels.description', 'Configure global tool execution permissions')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="font-pixel"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('common.reset', 'Reset')}
                    </Button>
                    {hasChanges && (
                        <Button
                            size="sm"
                            onClick={handleSave}
                            className="font-pixel"
                        >
                            {t('common.save', 'Save')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Trust Level Legend */}
            <div className="flex flex-wrap gap-3 text-sm">
                {Object.entries(TRUST_LEVEL_DESCRIPTIONS).map(([level, config]) => {
                    const Icon = config.icon
                    return (
                        <div key={level} className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{config.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Tools Grid */}
            <div className="grid gap-3">
                {tools.map(tool => {
                    const config = TRUST_LEVEL_DESCRIPTIONS[tool.trustLevel]
                    const Icon = config.icon

                    return (
                        <div
                            key={tool.toolId}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{tool.toolName}</span>
                                <PixelBadge className={config.color}>
                                    {config.label}
                                </PixelBadge>
                            </div>

                            <Select
                                value={tool.trustLevel}
                                onValueChange={(value) => handleTrustLevelChange(tool.toolId, value as ToolTrustLevel)}
                            >
                                <SelectTrigger className="w-[160px] font-pixel">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TRUST_LEVEL_DESCRIPTIONS).map(([level, config]) => (
                                        <SelectItem key={level} value={level}>
                                            <div className="flex items-center gap-2">
                                                {level === 'auto' && <Shield className="w-4 h-4 text-green-600" />}
                                                {level === 'prompt' && <ShieldAlert className="w-4 h-4 text-yellow-600" />}
                                                {level === 'block' && <ShieldX className="w-4 h-4 text-red-600" />}
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )
                })}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> These settings apply globally to all agents. Individual agents may have
                    additional workspace-specific tool restrictions configured in the Workspace tab.
                </p>
            </div>
        </div>
    )
}
