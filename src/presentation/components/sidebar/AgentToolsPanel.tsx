/**
 * @fileoverview AgentToolsPanel - Collapsed agent tools section
 * @module presentation/components/sidebar/AgentToolsPanel
 *
 * **ARCH-03-01**: Create ProjectSidebar Component
 *
 * Displays collapsed section for agent tools.
 * Collapsed by default, can be expanded to show available agents.
 *
 * @remarks
 * Placeholder implementation - full agent functionality will be in future epics.
 * For now, shows collapsed state with hint.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-01
 * @team Team A
 * @created 2026-01-22
 */

import { Bot, ChevronRight } from 'lucide-react';

// ============================================================================
// Props
// ============================================================================

export interface AgentToolsPanelProps {
  /** Current project ID (from context) */
  currentProjectId?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AgentToolsPanel Component
 *
 * Displays agent tools section (collapsed by default).
 * For now, shows placeholder since agents are not yet implemented.
 *
 * @remarks
 * Full implementation will be in future agent-related epics.
 * Will integrate with agent registry and tool execution.
 */
export function AgentToolsPanel({ currentProjectId: _currentProjectId }: AgentToolsPanelProps) {
  const handleExpand = () => {
    console.warn('[AgentToolsPanel] Expand clicked - not implemented yet');
    // TODO: Will expand to show available agents
    // Tools like: code-completion, refactoring, testing, etc.
  };

  return (
    <div className="agent-tools">
      {/* Collapsed Header */}
      <button
        type="button"
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted hover:bg-accent border-b border-border cursor-pointer transition-colors"
        title="Agent tools (coming soon)"
      >
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-foreground" />
          <span className="text-foreground">Agents</span>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </button>

      {/* Placeholder hint */}
      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
        <Bot size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p>AI Agents coming soon</p>
        <p className="text-muted-foreground mt-1">
          Agents for code completion, refactoring, testing, and more
        </p>
      </div>

      {/* Example structure for when agents are implemented:
      <div className="agent-items max-h-64 overflow-y-auto">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => handleAgentClick(agent.id)}
            className="agent-item w-full text-left px-3 py-2 text-sm border-b border-border cursor-pointer bg-card hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <agent.icon size={16} className="text-muted-foreground" />
              <span className="flex-1 truncate">{agent.name}</span>
              {agent.isActive && <span className="text-xs text-green-600">Active</span>}
            </div>
          </button>
        ))}
      </div>
      */}
    </div>
  );
}
