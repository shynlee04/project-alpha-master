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
export const FileTreeComponent: React.FC = () => {
  const FileTreeMain = fileTreePlugin.MainComponent;
  return <FileTreeMain width={0} height={0} />;
};

/**
 * Monaco Component - REAL implementation
 *
 * Uses the actual MonacoPlugin from src/plugins/monaco/
 * Full Monaco code editor with syntax highlighting and IntelliSense.
 */
export const MonacoComponent: React.FC = () => {
  const MonacoMain = monacoPlugin.MainComponent;
  return <MonacoMain width={0} height={0} />;
};

/**
 * Notes Component - REAL implementation
 *
 * Uses the actual NotesPlugin from src/plugins/notes/
 * BlockNote editor with 16 custom block types and AI features.
 */
export const NotesComponent: React.FC = () => {
  const NotesMain = notesPlugin.MainComponent;
  return <NotesMain width={0} height={0} />;
};

/**
 * Terminal Component - REAL implementation
 *
 * Uses the actual TerminalPlugin from src/plugins/terminal/
 * WebContainer-based terminal for running commands.
 */
export const TerminalComponent: React.FC = () => {
  const TerminalMain = terminalPlugin.MainComponent;
  return <TerminalMain width={0} height={0} />;
};

/**
 * Preview Component - REAL implementation
 *
 * Uses the actual PreviewPlugin from src/plugins/preview/
 * Dev server preview for running applications.
 */
export const PreviewComponent: React.FC = () => {
  const PreviewMain = previewPlugin.MainComponent;
  return <PreviewMain width={0} height={0} />;
};

/**
 * Chat Component - STUB (Phase 2)
 *
 * Uses the stub ChatPlugin from src/plugins/chat/
 * Full implementation scheduled for Phase 2.
 */
export const ChatComponent: React.FC = () => {
  const ChatMain = chatPlugin.MainComponent;
  return <ChatMain width={0} height={0} />;
};

/**
 * Agents Component - PLACEHOLDER (Not yet implemented)
 *
 * AI Agents management - scheduled for future implementation.
 */
export const AgentsComponent: React.FC = () => (
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
export const PLUGIN_COMPONENTS: Record<PluginId, React.ComponentType> = {
  filetree: FileTreeComponent,
  monaco: MonacoComponent,
  notes: NotesComponent,
  terminal: TerminalComponent,
  chat: ChatComponent,
  agents: AgentsComponent,
  preview: PreviewComponent,
};

/**
 * Get the component for a plugin ID
 *
 * @param pluginId - The plugin ID
 * @returns React component or null if not found
 */
export function getPluginComponent(pluginId: PluginId): React.ComponentType | null {
  return PLUGIN_COMPONENTS[pluginId] || null;
}

/**
 * Render a plugin by ID
 *
 * @param pluginId - The plugin ID to render
 * @returns React element or null
 */
export function renderPlugin(pluginId: PluginId | null): React.ReactElement | null {
  if (!pluginId) return null;

  const Component = getPluginComponent(pluginId);
  if (!Component) return null;

  return <Component key={pluginId} />;
}
