/**
 * AgentManager - Comprehensive Agent Management Interface
 *
 * Addresses user feedback about short-sighted dropdown-only selectors.
 * Provides unified agent selection with quick access to:
 * - Agent configuration/editing
 * - Capability indicators
 * - Status display
 * - Workspace binding toggle
 * - Quick settings access
 *
 * @module presentation/components/agent/AgentManager
 * @story Phase 2.3a - Fix agent selector fragmentation
 * @priority HIGH - User explicitly requested comprehensive management UI
 */

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Check,
  X,
  Info,
  Zap,
  Shield,
  Brain,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover'
import { Badge } from '@/presentation/components/ui/badge'
import { UnifiedAgentSelector } from './UnifiedAgentSelector'
import { AgentConfigDialog } from './AgentConfigDialog'
import type { Agent } from '@/core/entities/Agent'
import type { WorkspaceType } from '@/domain/value-objects/workspace-type'

/**
 * Display variants for different contexts
 */
type Variant = 'full' | 'compact' | 'minimal'

interface AgentManagerProps {
  /**
   * Display variant
   * - full: All controls visible (desktop sidebar, settings pages)
   * - compact: Essential controls + tooltips (mobile, tight spaces)
   * - minimal: Just selector + quick config (very tight spaces)
   */
  variant?: Variant

  /**
   * Workspace type (auto-detected if not provided)
   */
  workspaceType?: WorkspaceType

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Disable all interactions
   */
  disabled?: boolean

  /**
   * Callback when agent is selected
   */
  onSelectAgent?: (agent: Agent) => void
}

/**
 * Agent capability indicators
 */
interface CapabilityIndicators {
  hasTools: boolean
  hasDeepThink: boolean
  hasMemory: boolean
  isDefault: boolean
}

/**
 * Extract capability indicators from agent
 */
function getCapabilityIndicators(agent: Agent | null): CapabilityIndicators {
  if (!agent) {
    return { hasTools: false, hasDeepThink: false, hasMemory: false, isDefault: false }
  }

  return {
    hasTools: agent.toolBindings && agent.toolBindings.length > 0,
    hasDeepThink: agent.preferences?.useDeepThink ?? false,
    hasMemory: agent.preferences?.useMemory ?? false,
    isDefault: agent.workspaceBindings.some(b => b.isDefault),
  }
}

export function AgentManager({
  variant = 'full',
  workspaceType: propWorkspaceType,
  className = '',
  disabled = false,
  onSelectAgent,
}: AgentManagerProps) {
  const { t } = useTranslation()
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)

  // Get current agent info from UnifiedAgentSelector's store access
  // We'll use a ref to track the selected agent
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  // Handle agent selection from UnifiedAgentSelector
  const handleSelectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
    onSelectAgent?.(agent)
  }, [onSelectAgent])

  // Toggle workspace binding for current agent
  const handleToggleWorkspaceBinding = useCallback(() => {
    if (!selectedAgent) return

    const workspaceType = propWorkspaceType
    const binding = selectedAgent.workspaceBindings.find(b => b.workspaceType === workspaceType)

    if (binding) {
      // Import useAgentsStore action to update binding
      // This would require access to the store - for now, open config dialog
      setConfigDialogOpen(true)
    }
  }, [selectedAgent, propWorkspaceType])

  // Quick config button handler
  const handleQuickConfig = useCallback(() => {
    setConfigDialogOpen(true)
  }, [])

  // Capability indicators
  const capabilities = useMemo(() => getCapabilityIndicators(selectedAgent), [selectedAgent])

  // Render capability badges (full variant)
  const renderCapabilityBadges = () => {
    if (variant === 'minimal' || !selectedAgent) return null

    return (
      <div className="flex items-center gap-1.5">
        {capabilities.hasTools && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  <Zap className="h-3 w-3 mr-1" />
                  {t('agent.manager.tools', 'Tools')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{selectedAgent.toolBindings?.length ?? 0} {t('agent.manager.toolsActive', 'tools enabled')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {capabilities.hasDeepThink && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  <Brain className="h-3 w-3 mr-1" />
                  {t('agent.manager.deepThink', 'DeepThink')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('agent.manager.deepThinkEnabled', 'Deep thinking mode enabled')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {capabilities.hasMemory && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  <Info className="h-3 w-3 mr-1" />
                  {t('agent.manager.memory', 'Memory')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('agent.manager.memoryEnabled', 'Conversation memory enabled')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  // Render quick actions
  const renderQuickActions = () => {
    if (!selectedAgent) return null

    return (
      <div className="flex items-center gap-1">
        {/* Quick Config Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleQuickConfig}
                disabled={disabled}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('agent.manager.quickConfig', 'Configure agent settings')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Workspace Binding Toggle (full/compact only) */}
        {variant !== 'minimal' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleToggleWorkspaceBinding}
                  disabled={disabled}
                >
                  {capabilities.isDefault ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Shield className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {capabilities.isDefault
                    ? t('agent.manager.defaultAgent', 'Default agent for this workspace')
                    : t('agent.manager.makeDefault', 'Set as default agent')}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Status Popover (full only) */}
        {variant === 'full' && (
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={disabled}
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{selectedAgent.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>

                {selectedAgent.providerId && selectedAgent.modelId && (
                  <div className="text-xs">
                    <span className="font-medium">{t('agent.manager.provider', 'Provider')}:</span>{' '}
                    {selectedAgent.providerId} / {selectedAgent.modelId}
                  </div>
                )}

                <div className="flex flex-wrap gap-1 pt-2">
                  {capabilities.hasTools && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {t('agent.manager.tools', 'Tools')}
                    </Badge>
                  )}
                  {capabilities.hasDeepThink && (
                    <Badge variant="secondary" className="text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      {t('agent.manager.deepThink', 'DeepThink')}
                    </Badge>
                  )}
                  {capabilities.hasMemory && (
                    <Badge variant="secondary" className="text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      {t('agent.manager.memory', 'Memory')}
                    </Badge>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Unified Agent Selector */}
      <UnifiedAgentSelector
        variant={variant}
        workspaceType={propWorkspaceType}
        disabled={disabled}
        onSelectAgent={handleSelectAgent}
      />

      {/* Capability Badges (full/compact) */}
      {renderCapabilityBadges()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Config Dialog */}
      {selectedAgent && (
        <AgentConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          agentId={selectedAgent.id}
          onSuccess={() => {
            setConfigDialogOpen(false)
            // Agent data will be refreshed from store
          }}
        />
      )}
    </div>
  )
}
