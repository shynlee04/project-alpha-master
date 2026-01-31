/**
 * @fileoverview Plugin Component Registry - Real plugin components for plugin panels
 * @module presentation/components/layout/plugin-placeholders
 *
 * EPIC-UXUI-04: Plugin Panel System
 * FIXED: Now uses REAL plugin components instead of placeholders.
 * Each plugin is imported from its actual implementation in src/plugins/
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 * @updated 2026-01-30
 */

import React from 'react';
import { Bot } from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';
import type { ProjectContext } from '@/infrastructure/context/project-context';

// ============================================================================
// REAL Plugin Imports
// ============================================================================

// FileTree Plugin - Real implementation
import { fileTreePlugin } from '@/plugins/filetree';

// Monaco Editor Plugin - Real implementation
import { monacoPlugin } from '@/plugins/monaco';

// Notes Plugin - Real implementation
import { notesPlugin } from '@/plugins/notes';

// Terminal Plugin - Real implementation
import { terminalPlugin } from '@/plugins/terminal';

// Preview Plugin - Real implementation
import { previewPlugin } from '@/plugins/preview';

// Chat Plugin - Stub (Phase 2)
import { chatPlugin } from '@/plugins/chat';

// ============================================================================
// Placeholder Styles
// ============================================================================

const placeholderStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '24px',
  textAlign: 'center',
  gap: '16px',
};

const iconStyles: React.CSSProperties = {
  width: '48px',
  height: '48px',
  opacity: 0.5,
};

const titleStyles: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

const descriptionStyles: React.CSSProperties = {
  fontSize: '0.875rem',
  opacity: 0.7,
  margin: 0,
  maxWidth: '280px',
};

// ============================================================================
// REAL Plugin Components
// ============================================================================

/**
 * FileTree Component - REAL implementation
 *
 * Uses the actual FileTreePlugin from src/plugins/filetree/
 * Fully functional file browser with expand/collapse, file selection, etc.
 */
export const FileTreeComponent: React.FC<{ projectContext: ProjectContext }> = ({ projectContext }) => {
  const FileTreeMain = fileTreePlugin.MainComponent;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <FileTreeMain projectContext={projectContext} />
    </div>
  );
};

/**
 * Monaco Component - REAL implementation
 *
 * Uses the actual MonacoPlugin from src/plugins/monaco/
 * Full Monaco code editor with syntax highlighting and IntelliSense.
 */
export const MonacoComponent: React.FC<{ projectContext: ProjectContext }> = ({ projectContext }) => {
  const MonacoMain = monacoPlugin.MainComponent;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <MonacoMain projectContext={projectContext} />
    </div>
  );
};

/**
 * Notes Component - REAL implementation
 *
 * Uses the actual NotesPlugin from src/plugins/notes/
 * BlockNote editor with 16 custom block types and AI features.
 */
export const NotesComponent: React.FC<{ projectContext: ProjectContext }> = ({ projectContext }) => {
  const NotesMain = notesPlugin.MainComponent;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <NotesMain projectContext={projectContext} />
    </div>
  );
};

/**
 * Terminal Component - REAL implementation
 *
 * Uses the actual TerminalPlugin from src/plugins/terminal/
 * WebContainer-based terminal for running commands.
 */
export const TerminalComponent: React.FC<{ projectContext: ProjectContext }> = ({ projectContext }) => {
  const TerminalMain = terminalPlugin.MainComponent;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <TerminalMain projectContext={projectContext} />
    </div>
  );
};

/**
 * Preview Component - REAL implementation
 *
 * Uses the actual PreviewPlugin from src/plugins/preview/
 * Dev server preview for running applications.
 */
export const PreviewComponent: React.FC<{ projectContext: ProjectContext }> = ({ projectContext }) => {
  const PreviewMain = previewPlugin.MainComponent;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <PreviewMain projectContext={projectContext} />
    </div>
  );
};

/**
 * Chat Component - STUB (Phase 2)
 *
 * Uses the stub ChatPlugin from src/plugins/chat/
 * Full implementation scheduled for Phase 2.
 */
export const ChatComponent: React.FC<{ projectContext: ProjectContext }> = ({ projectContext }) => {
  const ChatMain = chatPlugin.MainComponent;
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <ChatMain projectContext={projectContext} />
    </div>
  );
};

/**
 * Agents Component - PLACEHOLDER (Not yet implemented)
 *
 * AI Agents management - scheduled for future implementation.
 */
export const AgentsComponent: React.FC<{ projectContext?: ProjectContext }> = ({ projectContext: _projectContext }) => (
  <div className="plugin-placeholder agents-placeholder" style={placeholderStyles}>
    <Bot style={iconStyles} />
    <h3 style={titleStyles}>AI Agents</h3>
    <p style={descriptionStyles}>
      Manage and configure AI agents for automated tasks, code generation, and workflow automation.
      <br /><br />
      <em>Coming in a future update</em>
    </p>
  </div>
);

// ============================================================================
// Plugin Component Registry
// ============================================================================

/**
 * Plugin component registry
 * Maps plugin IDs to their REAL components
 * FIXED: Now uses actual plugin implementations instead of placeholders
 */
export const PLUGIN_COMPONENTS: Record<PluginId, React.ComponentType<{ projectContext: ProjectContext }>> = {
  filetree: FileTreeComponent,
  monaco: MonacoComponent,
  notes: NotesComponent,
  terminal: TerminalComponent,
  chat: ChatComponent,
  agents: AgentsComponent as React.ComponentType<{ projectContext: ProjectContext }>,
  preview: PreviewComponent,
};

/**
 * Get the component for a plugin ID
 *
 * @param pluginId - The plugin ID
 * @returns React component or null if not found
 */
export function getPluginComponent(pluginId: PluginId): React.ComponentType<{ projectContext: ProjectContext }> | null {
  return PLUGIN_COMPONENTS[pluginId] || null;
}

/**
 * Render a plugin by ID
 *
 * @param pluginId - The plugin ID to render
 * @param projectContext - The project context to pass to the plugin
 * @returns React element or null
 */
export function renderPlugin(pluginId: PluginId | null, projectContext: ProjectContext): React.ReactElement | null {
  if (!pluginId) return null;

  const Component = getPluginComponent(pluginId);
  if (!Component) return null;

  return <Component key={pluginId} projectContext={projectContext} />;
}
