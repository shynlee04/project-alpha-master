/**
 * Agent Workspace Switching Feedback
 *
 * Shows status indicators and agent availability during workspace transitions.
 * Provides visual feedback when switching between workspaces.
 *
 * Features:
 * - Loading indicator during transition
 * - Agent availability summary
 * - Agent reselection notification
 * - Transition progress states
 * - Accessibility: ARIA live regions
 * - 8-bit themed styling
 *
 * @module agent/AgentWorkspaceSwitchingFeedback
 * @story P0-5 - Agent Workspace Switching Feedback
 * @epic UX/UI Modernization
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, AlertCircle, Bot, ArrowRight } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Workspace configuration for display
 */
const WORKSPACE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  ide: { icon: '💻', label: 'IDE', color: 'text-blue-400' },
  knowledge: { icon: '📚', label: 'Knowledge', color: 'text-purple-400' },
  study: { icon: '🎓', label: 'Study', color: 'text-amber-400' },
  notes: { icon: '📝', label: 'Notes', color: 'text-green-400' },
};

/**
 * Props for workspace switching feedback
 */
export interface AgentWorkspaceSwitchingFeedbackProps {
  /** Whether feedback is enabled */
  enabled?: boolean;

  /** Auto-dismiss after transition (ms) */
  autoDismiss?: number;

  /** Position variant */
  variant?: 'floating' | 'inline' | 'banner';

  /** Additional CSS classes */
  className?: string;

  /** Callback on feedback click */
  onClick?: () => void;
}

/**
 * Transition state
 */
interface TransitionState {
  isTransitioning: boolean;
  from: WorkspaceType | null;
  to: WorkspaceType | null;
  availableAgents: AgentData[];
  selectedAgent: AgentData | null;
  phase: 'starting' | 'filtering' | 'selecting' | 'complete' | 'error';
  error: string | null;
}

/**
 * Agent Workspace Switching Feedback Component
 *
 * Shows visual feedback during workspace transitions:
 * - Loading spinner during transition
 * - Agent availability count
 * - Selected agent notification
 * - Transition phase indicators
 *
 * @example
 * ```tsx
 * <AgentWorkspaceSwitchingFeedback
 *   variant="floating"
 *   autoDismiss={3000}
 * />
 * ```
 */
export function AgentWorkspaceSwitchingFeedback({
  enabled = true,
  autoDismiss = 3000,
  variant = 'floating',
  className,
  onClick,
}: AgentWorkspaceSwitchingFeedbackProps) {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspaceStore();
  // Use individual selectors to avoid infinite re-renders
  const getAgentsForWorkspace = useAppStore(s => s.getAgentsForWorkspace)
  const getActiveAgent = useAgentSelectionStore(s => s.getActiveAgent)

  // Local state for transition feedback
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    from: null,
    to: null,
    availableAgents: [],
    selectedAgent: null,
    phase: 'starting',
    error: null,
  });

  // Auto-dismiss timer
  useEffect(() => {
    if (transitionState.phase === 'complete' && autoDismiss > 0) {
      const timer = setTimeout(() => {
        setTransitionState(prev => ({
          ...prev,
          isTransitioning: false,
        }));
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [transitionState.phase, autoDismiss]);

  // Listen to workspace transition events
  useEffect(() => {
    if (!enabled) return;

    // Subscribe to cross-workspace events
    const handleTransitionStart = (event: any) => {
      console.log('[AgentWorkspaceSwitchingFeedback] Transition started:', event);

      setTransitionState({
        isTransitioning: true,
        from: event.from || currentWorkspace,
        to: event.to,
        availableAgents: [],
        selectedAgent: null,
        phase: 'starting',
        error: null,
      });
    };

    const handleWorkspaceChanged = (event: any) => {
      console.log('[AgentWorkspaceSwitchingFeedback] Workspace changed:', event);

      setTransitionState(prev => ({
        ...prev,
        phase: 'filtering',
        to: event.workspaceType,
      }));

      // Filter agents for new workspace
      const availableAgents = getAgentsForWorkspace(event.workspaceType);
      const activeAgent = getActiveAgent();

      setTransitionState(prev => ({
        ...prev,
        availableAgents,
        selectedAgent: activeAgent,
        phase: activeAgent ? 'complete' : 'selecting',
      }));
    };

    const handleTransitionComplete = (event: any) => {
      console.log('[AgentWorkspaceSwitchingFeedback] Transition complete:', event);

      setTransitionState(prev => ({
        ...prev,
        phase: 'complete',
        from: event.from,
        to: event.to,
      }));
    };

    const handleTransitionError = (error: any) => {
      console.error('[AgentWorkspaceSwitchingFeedback] Transition error:', error);

      setTransitionState(prev => ({
        ...prev,
        phase: 'error',
        error: error.message || 'Transition failed',
      }));
    };

    // Subscribe to cross-workspace event bus
    // Note: These events are emitted by WorkspaceTransitionManager
    const unsubscribers: Array<() => void> = [];

    // Listen for workspace transition events
    window.addEventListener('workspace:transition:start', handleTransitionStart as any);
    window.addEventListener('workspace:changed', handleWorkspaceChanged as any);
    window.addEventListener('workspace:transition:complete', handleTransitionComplete as any);
    window.addEventListener('workspace:transition:error', handleTransitionError as any);

    return () => {
      window.removeEventListener('workspace:transition:start', handleTransitionStart as any);
      window.removeEventListener('workspace:changed', handleWorkspaceChanged as any);
      window.removeEventListener('workspace:transition:complete', handleTransitionComplete as any);
      window.removeEventListener('workspace:transition:error', handleTransitionError as any);

      unsubscribers.forEach(unsub => unsub());
    };
  }, [enabled, currentWorkspace, getAgentsForWorkspace, getActiveAgent]);

  // Guard: Don't render if not enabled or not transitioning
  if (!enabled || !transitionState.isTransitioning) {
    return null;
  }

  const fromConfig = transitionState.from ? WORKSPACE_CONFIG[transitionState.from] : null;
  const toConfig = transitionState.to ? WORKSPACE_CONFIG[transitionState.to] : null;

  // Render variants
  const content = (
    <div
      className={cn(
        'font-mono text-sm',
        variant === 'floating' && 'fixed top-20 right-4 z-50',
        variant === 'banner' && 'w-full',
        className
      )}
      onClick={onClick}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Main Container */}
      <div
        className={cn(
          'bg-background border-2 border-border/60 shadow-pixel',
          'p-4 rounded-sm',
          variant === 'floating' && 'min-w-[320px] max-w-md',
          variant === 'inline' && 'w-full',
          variant === 'banner' && 'w-full'
        )}
      >
        {/* Header: Workspace Transition */}
        {transitionState.phase !== 'error' && (
          <div className="flex items-center gap-3 mb-3">
            {/* Loading Spinner */}
            {transitionState.phase !== 'complete' ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
            )}

            {/* Transition Label */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {t('agent.workspaceSwitching.switchingWorkspace', 'SWITCHING_WORKSPACE')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {fromConfig && (
                  <>
                    <span className={cn('text-base', fromConfig.color)}>{fromConfig.icon}</span>
                    <span className="text-foreground font-medium">{fromConfig.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  </>
                )}
                {toConfig && (
                  <>
                    <span className={cn('text-base', toConfig.color)}>{toConfig.icon}</span>
                    <span className="text-foreground font-medium">{toConfig.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {transitionState.phase === 'error' && (
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-xs text-destructive uppercase tracking-widest">
                {t('agent.workspaceSwitching.transitionFailed', 'TRANSITION_FAILED')}
              </p>
              <p className="text-foreground mt-1">{transitionState.error}</p>
            </div>
          </div>
        )}

        {/* Agent Availability */}
        {transitionState.phase !== 'error' && transitionState.phase !== 'starting' && (
          <div className="space-y-2">
            {/* Available Agents Count */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t('agent.workspaceSwitching.availableAgents', 'AVAILABLE_AGENTS')}
              </span>
              <Badge variant="secondary" className="text-xs">
                {transitionState.availableAgents.length}
              </Badge>
            </div>

            {/* Selected Agent */}
            {transitionState.selectedAgent && transitionState.phase === 'complete' && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded border border-primary/20">
                <Bot className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-xs text-foreground">
                  {transitionState.selectedAgent.name}
                </span>
                <Badge variant="default" className="text-xs ml-auto">
                  {t('agent.workspaceSwitching.active', 'ACTIVE')}
                </Badge>
              </div>
            )}

            {/* No Agents Warning */}
            {transitionState.availableAgents.length === 0 && transitionState.phase === 'complete' && (
              <div className="flex items-center gap-2 p-2 bg-warning/10 rounded border border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning" aria-hidden="true" />
                <span className="text-xs text-warning">
                  {t('agent.workspaceSwitching.noAgentsAvailable', 'NO_AGENTS_AVAILABLE')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Phase Indicators */}
        {transitionState.phase !== 'error' && transitionState.phase !== 'complete' && (
          <div className="mt-3 pt-3 border-t-2 border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              <span>
                {transitionState.phase === 'filtering' &&
                  t('agent.workspaceSwitching.filteringAgents', 'FILTERING_AGENTS')}
                {transitionState.phase === 'selecting' &&
                  t('agent.workspaceSwitching.selectingAgent', 'SELECTING_AGENT')}
                {transitionState.phase === 'starting' &&
                  t('agent.workspaceSwitching.starting', 'STARTING')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

/**
 * Minimal Agent Availability Badge
 *
 * Shows a compact badge with agent availability count.
 * Useful for inline display in headers or status bars.
 *
 * @example
 * ```tsx
 * <AgentAvailabilityBadge workspace="ide" />
 * ```
 */
export interface AgentAvailabilityBadgeProps {
  /** Workspace type to show agents for */
  workspace: WorkspaceType;

  /** Show label */
  showLabel?: boolean;

  /** Additional CSS classes */
  className?: string;
}

export function AgentAvailabilityBadge({
  workspace,
  showLabel = true,
  className,
}: AgentAvailabilityBadgeProps) {
  // Use individual selector to avoid infinite re-renders
  const getAgentsForWorkspace = useAppStore(s => s.getAgentsForWorkspace)
  const agents = getAgentsForWorkspace(workspace);

  const config = WORKSPACE_CONFIG[workspace];

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1.5 font-mono text-xs', className)}
    >
      <Bot className="w-3 h-3" aria-hidden="true" />
      {showLabel && (
        <>
          <span>{config.label}:</span>
          <span className="font-bold">{agents.length}</span>
        </>
      )}
      {!showLabel && <span className="font-bold">{agents.length}</span>}
    </Badge>
  );
}

/**
 * Workspace Agent List Summary
 *
 * Shows a summary of agents available in current workspace.
 *
 * @example
 * ```tsx
 * <WorkspaceAgentListSummary />
 * ```
 */
export interface WorkspaceAgentListSummaryProps {
  /** Maximum agents to show */
  maxAgents?: number;

  /** Additional CSS classes */
  className?: string;
}

export function WorkspaceAgentListSummary({
  maxAgents = 3,
  className,
}: WorkspaceAgentListSummaryProps) {
  const { currentWorkspace } = useWorkspaceStore();
  // Use individual selectors to avoid infinite re-renders
  const getAgentsForWorkspace = useAppStore(s => s.getAgentsForWorkspace)
  const getActiveAgent = useAgentSelectionStore(s => s.getActiveAgent)

  const agents = getAgentsForWorkspace(currentWorkspace);
  const activeAgent = getActiveAgent();
  const displayAgents = agents.slice(0, maxAgents);
  const remainingCount = Math.max(0, agents.length - maxAgents);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {displayAgents.map((agent) => (
        <div
          key={agent.id}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono',
            'border-2 border-border/40',
            activeAgent?.id === agent.id
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-muted/30 text-muted-foreground'
          )}
          title={agent.name}
        >
          <Bot className="w-3 h-3" aria-hidden="true" />
          <span className="max-w-[100px] truncate">{agent.name}</span>
        </div>
      ))}

      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs font-mono">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
