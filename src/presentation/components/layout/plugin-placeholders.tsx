/**
 * @fileoverview Plugin Placeholder Components - Mock components for plugin panels
 * @module presentation/components/layout/plugin-placeholders
 *
 * EPIC-UXUI-04: Plugin Panel System
 * Placeholder components for testing plugin panels before actual plugins are implemented.
 * Each placeholder represents a plugin that will be implemented in future stories.
 *
 * @story UXUI-04-05
 * @created 2026-01-30
 */

import React from 'react';
import {
  FolderOpen,
  FileText,
  Code,
  Terminal,
  MessageSquare,
  Bot,
  Eye,
} from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';

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
// File Tree Placeholder
// ============================================================================

/**
 * FileTreePlaceholder Component
 *
 * Placeholder for the file tree plugin.
 * Will be replaced with actual file tree implementation.
 */
export const FileTreePlaceholder: React.FC = () => (
  <div className="plugin-placeholder filetree-placeholder" style={placeholderStyles}>
    <FolderOpen style={iconStyles} />
    <h3 style={titleStyles}>File Explorer</h3>
    <p style={descriptionStyles}>
      Browse and manage your project files. Navigate folders, open files, and organize your workspace.
    </p>
  </div>
);

// ============================================================================
// Monaco Editor Placeholder
// ============================================================================

/**
 * MonacoPlaceholder Component
 *
 * Placeholder for the Monaco code editor plugin.
 * Will be replaced with actual Monaco editor implementation.
 */
export const MonacoPlaceholder: React.FC = () => (
  <div className="plugin-placeholder monaco-placeholder" style={placeholderStyles}>
    <Code style={iconStyles} />
    <h3 style={titleStyles}>Code Editor</h3>
    <p style={descriptionStyles}>
      Edit code with syntax highlighting, IntelliSense, and advanced editing features.
    </p>
  </div>
);

// ============================================================================
// Notes Placeholder
// ============================================================================

/**
 * NotesPlaceholder Component
 *
 * Placeholder for the notes plugin.
 * Will be replaced with actual BlockNote editor implementation.
 */
export const NotesPlaceholder: React.FC = () => (
  <div className="plugin-placeholder notes-placeholder" style={placeholderStyles}>
    <FileText style={iconStyles} />
    <h3 style={titleStyles}>Notes</h3>
    <p style={descriptionStyles}>
      Create and edit rich text notes with markdown support. Organize your thoughts and documentation.
    </p>
  </div>
);

// ============================================================================
// Terminal Placeholder
// ============================================================================

/**
 * TerminalPlaceholder Component
 *
 * Placeholder for the terminal plugin.
 * Will be replaced with actual terminal implementation.
 */
export const TerminalPlaceholder: React.FC = () => (
  <div className="plugin-placeholder terminal-placeholder" style={placeholderStyles}>
    <Terminal style={iconStyles} />
    <h3 style={titleStyles}>Terminal</h3>
    <p style={descriptionStyles}>
      Command line interface for running commands, scripts, and managing your development environment.
    </p>
  </div>
);

// ============================================================================
// Chat Placeholder
// ============================================================================

/**
 * ChatPlaceholder Component
 *
 * Placeholder for the chat plugin.
 * Will be replaced with actual AI chat implementation.
 */
export const ChatPlaceholder: React.FC = () => (
  <div className="plugin-placeholder chat-placeholder" style={placeholderStyles}>
    <MessageSquare style={iconStyles} />
    <h3 style={titleStyles}>AI Chat</h3>
    <p style={descriptionStyles}>
      Chat with AI assistants to get help with coding, debugging, and learning new concepts.
    </p>
  </div>
);

// ============================================================================
// Agents Placeholder
// ============================================================================

/**
 * AgentsPlaceholder Component
 *
 * Placeholder for the agents plugin.
 * Will be replaced with actual AI agent management implementation.
 */
export const AgentsPlaceholder: React.FC = () => (
  <div className="plugin-placeholder agents-placeholder" style={placeholderStyles}>
    <Bot style={iconStyles} />
    <h3 style={titleStyles}>AI Agents</h3>
    <p style={descriptionStyles}>
      Manage and configure AI agents for automated tasks, code generation, and workflow automation.
    </p>
  </div>
);

// ============================================================================
// Preview Placeholder
// ============================================================================

/**
 * PreviewPlaceholder Component
 *
 * Placeholder for the preview plugin.
 * Will be replaced with actual preview implementation.
 */
export const PreviewPlaceholder: React.FC = () => (
  <div className="plugin-placeholder preview-placeholder" style={placeholderStyles}>
    <Eye style={iconStyles} />
    <h3 style={titleStyles}>Preview</h3>
    <p style={descriptionStyles}>
      Preview your content, markdown rendering, HTML output, and other visual representations.
    </p>
  </div>
);

// ============================================================================
// Plugin Component Registry
// ============================================================================

/**
 * Plugin component registry
 * Maps plugin IDs to their placeholder components
 */
export const PLUGIN_COMPONENTS: Record<PluginId, React.ComponentType> = {
  filetree: FileTreePlaceholder,
  monaco: MonacoPlaceholder,
  notes: NotesPlaceholder,
  terminal: TerminalPlaceholder,
  chat: ChatPlaceholder,
  agents: AgentsPlaceholder,
  preview: PreviewPlaceholder,
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
