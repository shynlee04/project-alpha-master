/**
 * @fileoverview Chat Plugin - Main component for AI chat feature
 * @module plugins/chat/ChatPlugin
 *
 * **ARCH-02-08**: Chat/Agent Plugin (POC Simplified)
 *
 * Simplified version for proof of concept.
 * Wraps existing AgentChatPanel from presentation layer.
 * Uses ProjectContext for tool execution and thread persistence.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-08
 * @team Team A
 * @created 2026-01-21
 */

import React from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// AgentChatPanel (facade pattern - keep in original location)
import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';

// ============================================================================
// Main Chat Plugin Component
// ============================================================================

/**
 * Chat Plugin - Main component for AI chat feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns Chat JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Wraps AgentChatPanel with tool execution support.
 * Simplified version for POC - includes agent mode only.
 *
 * Features:
 * - Display AI chat interface with tool execution
 * - Thread persistence via conversation store
 * - Tool integration with ProjectContext
 * - Workspace-aware system prompts
 * - Multi-agent support
 */
function ChatComponent({ width, height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { project } = projectContext;

  // ============================================================================
  // Render States
  // ============================================================================

  // No project error state
  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('ide.openFolderToView')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div
      className="h-full w-full flex flex-col overflow-auto"
    >
      {/* Chat Header */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare size={16} className="text-muted-foreground/70" />
          <span className="font-semibold">{project.name}</span>
        </div>
        <div className="text-xs text-muted-foreground/70">
          {project.storageType === 'fsa' ? 'FSA Mode' : 'IndexedDB Mode'}
        </div>
      </div>

      {/* AgentChatPanel - Facade Pattern */}
      {/* AgentChatPanel handles thread persistence, tool execution, and all chat features */}
      <div className="flex-1 overflow-hidden">
        <AgentChatPanel
          projectId={project.id}
          projectName={project.name}
          workspaceType="ide"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Chat Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Integration Points:
 * - Tool execution: Via ProjectContext.chatService (used by AgentChatPanel)
 * - File operations: Via ProjectContext.openFile/saveFile (used by tool facades)
 * - Thread persistence: Via useConversationStore (used by AgentChatPanel)
 */
export const chatPlugin: FeaturePlugin = {
  // ========================================================================
  // Identity
  // ========================================================================

  id: 'chat',
  name: 'Chat',
  icon: React.createElement(MessageSquare, { size: 16 }),
  description: 'AI-powered chat with tool execution and multi-agent support',

  // ========================================================================
  // Requirements
  // ========================================================================

  requirements: {
    storageType: 'any', // Works with FSA and IndexedDB
    deviceType: 'any', // Works on desktop and mobile
    minWidth: 400, // Minimum 400px width for chat interface
    maxInstances: 1, // Only one chat panel per project
  },

  // ========================================================================
  // Rendering
  // ========================================================================

  MainComponent: ChatComponent,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    console.log('[ChatPlugin] Mounted for project:', context.projectId);
    // AgentChatPanel will load automatically via useProjectContext
  },

  onUnmount: async () => {
    console.log('[ChatPlugin] Unmounted');
    // Cleanup if needed - AgentChatPanel handles its own cleanup
  },

  onProjectChange: async (newProjectId) => {
    console.log('[ChatPlugin] Project changed to:', newProjectId);
    // AgentChatPanel will reload automatically via projectId prop change
  },
};

// ============================================================================
// No additional exports - plugin exported via index.ts
// ============================================================================
