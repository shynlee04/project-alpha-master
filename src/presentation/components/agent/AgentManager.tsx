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

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Check,
  Info,
  Zap,
  Shield,
  Brain,
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import {
  Tooltip,
} from '@/presentation/components/ui/tooltip-react19-compatible'
import { Badge } from '@/presentation/components/ui/badge'
import { UnifiedAgentSelector } from './UnifiedAgentSelector'
import { AgentConfigDialog } from './AgentConfigDialog'
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types'
import type { WorkspaceType } from '@/domain/value-objects/workspace-type'
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store'
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store'
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus'

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
  onSelectAgent?: (agent: AgentData) => void
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
function getCapabilityIndicators(agent: AgentData | null): CapabilityIndicators {
  if (!agent) {
    return { hasTools: false, hasDeepThink: false, hasMemory: false, isDefault: false }
  }

  return {
    hasTools: agent.tools && agent.tools.length > 0,
    hasDeepThink: false, // TODO: Implement deep think flag in Agent entity
    hasMemory: false, // TODO: Implement memory flag in Agent entity
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

  // Get active agent ID from selection store
  const activeAgentId = useAgentSelectionStore((state) => state.activeAgentId)

  // Get all agents from app store
  const agents = useAppStore((state) => state.agents)

  // Derive selected agent
  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === activeAgentId) || null
  }, [agents, activeAgentId])

  // Listen to agent configuration update events
  useEffect(() => {
    // eventBus is a singleton, always available

    console.log('[AgentManager] Setting up event bus listeners');

    /**
     * Handle agent configuration updated event
     * Triggers re-render when agent config changes in another workspace
     */
    const handleAgentConfigUpdated = (event: any) => {
      const { agentId } = event.payload;
      console.log('[AgentManager] AGENT_CONFIG_UPDATED event received:', { agentId, selectedAgentId: selectedAgent?.id });

      // If this is the currently displayed agent, trigger re-render
      // by updating local state (forces component to re-fetch agent data)
      if (agentId === selectedAgent?.id) {
        console.log('[AgentManager] Agent config updated for current agent, forcing re-render');
        // Force re-render by updating config dialog state briefly
        setConfigDialogOpen(false);
      }
    };

    // Register listeners
    const unsubscribeAgentConfigUpdated = eventBus.on(DomainEventType.AGENT_CONFIG_UPDATED, handleAgentConfigUpdated as any);

    console.log('[AgentManager] Event bus listeners registered');

    // Cleanup: remove listeners on unmount
    return () => {
      console.log('[AgentManager] Cleaning up event bus listeners');
      unsubscribeAgentConfigUpdated();
    };
  }, [eventBus, selectedAgent?.id]);

  // Handle agent selection from UnifiedAgentSelector
  const handleSelectAgent = useCallback((agent: AgentData) => {
    // Local state update removed as store handles it via UnifiedAgentSelector
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

  // View agent details (opens config dialog with details tab)
  const handleViewDetails = useCallback(() => {
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
          <Tooltip
            content={`${selectedAgent.tools?.length ?? 0} ${t('agent.manager.toolsActive', 'tools enabled')}`}
            side="top"
          >
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              <Zap className="h-3 w-3 mr-1" />
              {t('agent.manager.tools', 'Tools')}
            </Badge>
          </Tooltip>
        )}

        {capabilities.hasDeepThink && (
          <Tooltip
            content={t('agent.manager.deepThinkEnabled', 'Deep thinking mode enabled')}
            side="top"
          >
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              <Brain className="h-3 w-3 mr-1" />
              {t('agent.manager.deepThink', 'DeepThink')}
            </Badge>
          </Tooltip>
        )}

        {capabilities.hasMemory && (
          <Tooltip
            content={t('agent.manager.memoryEnabled', 'Conversation memory enabled')}
            side="top"
          >
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              <Info className="h-3 w-3 mr-1" />
              {t('agent.manager.memory', 'Memory')}
            </Badge>
          </Tooltip>
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
        <Tooltip
          content={t('agent.manager.quickConfig', 'Configure agent settings')}
          side="top"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleQuickConfig}
            disabled={disabled}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>

        {/* Workspace Binding Toggle (full/compact only) */}
        {variant !== 'minimal' && (
          <Tooltip
            content={capabilities.isDefault
              ? t('agent.manager.defaultAgent', 'Default agent for this workspace')
              : t('agent.manager.makeDefault', 'Set as default agent')}
            side="top"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleToggleWorkspaceBinding}
              disabled={disabled}
            >
              {capabilities.isDefault ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
            </Button>
          </Tooltip>
        )}

        {/* View Details Button (full variant only) */}
        {variant === 'full' && selectedAgent && (
          <Tooltip
            content={t('agent.manager.viewDetails', 'View agent details and configuration')}
            side="top"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleViewDetails}
              disabled={disabled}
            >
              <Info className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
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
