/**
 * useCommandPalette Hook
 *
 * Provides state management for the command palette.
 * Handles keyboard shortcuts and command registration.
 */

import { useState, useCallback, useEffect } from 'react';
import { commandRegistry } from '@/lib/command-palette/command-registry';
import { router } from '@/router';

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  // Register built-in commands on mount
  useEffect(() => {
    registerBuiltinCommands();
  }, []);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Register built-in commands
 */
function registerBuiltinCommands() {
  const navigate = (path: string) => {
    // ARCH-01-01: Use TanStack Router navigation instead of window.location.href
    router.navigate({ to: path });
  };

  // Navigation Commands
  commandRegistry.registerMany([
    {
      id: 'nav.home',
      label: 'Go to Home',
      description: 'Navigate to the home page',
      category: 'navigation',
      icon: undefined, // Will use category icon
      action: () => navigate('/'),
      shortcut: { key: 'g', ctrl: true, display: 'Ctrl+G then H' },
      priority: 'high',
      keywords: ['home', 'hub', 'dashboard'],
    },
    {
      id: 'nav.ide',
      label: 'Go to IDE',
      description: 'Navigate to the IDE workspace',
      category: 'navigation',
      action: () => navigate('/ide'),
      shortcut: { key: 'g', ctrl: true, display: 'Ctrl+G then I' },
      priority: 'high',
      keywords: ['ide', 'editor', 'workspace'],
    },
    {
      id: 'nav.notes',
      label: 'Go to Notes',
      description: 'Navigate to the notes workspace',
      category: 'navigation',
      action: () => navigate('/notes'),
      shortcut: { key: 'g', ctrl: true, display: 'Ctrl+G then N' },
      priority: 'high',
      keywords: ['notes', 'notepad'],
    },
    {
      id: 'nav.knowledge',
      label: 'Go to Knowledge',
      description: 'Navigate to the knowledge base',
      category: 'navigation',
      action: () => navigate('/knowledge'),
      shortcut: { key: 'g', ctrl: true, display: 'Ctrl+G then K' },
      priority: 'high',
      keywords: ['knowledge', 'rag', 'search'],
    },
    {
      id: 'nav.study',
      label: 'Go to Study',
      description: 'Navigate to the study workspace',
      category: 'navigation',
      action: () => navigate('/study'),
      priority: 'medium',
      keywords: ['study', 'flashcards', 'quiz'],
    },
    {
      id: 'nav.agents',
      label: 'Go to Agents',
      description: 'Navigate to the agents configuration',
      category: 'navigation',
      action: () => navigate('/agents'),
      priority: 'medium',
      keywords: ['agents', 'ai', 'models'],
    },
    {
      id: 'nav.settings',
      label: 'Go to Settings',
      description: 'Navigate to the settings page',
      category: 'settings',
      action: () => navigate('/settings'),
      shortcut: { key: ',', meta: true, display: 'Cmd+,' },
      priority: 'high',
      keywords: ['settings', 'config', 'preferences'],
    },
  ]);

  // Action Commands
  commandRegistry.registerMany([
    {
      id: 'action.create-project',
      label: 'Create New Project',
      description: 'Create a new project',
      category: 'actions',
      action: () => {
        // Trigger project creation wizard
        console.log('Create project triggered');
      },
      priority: 'high',
      keywords: ['create', 'new', 'project', 'add'],
    },
    {
      id: 'action.import-project',
      label: 'Import Project',
      description: 'Import project from git or local',
      category: 'actions',
      action: () => {
        console.log('Import project triggered');
      },
      priority: 'medium',
      keywords: ['import', 'git', 'clone'],
    },
    {
      id: 'action.export-settings',
      label: 'Export Settings',
      description: 'Export settings as JSON',
      category: 'actions',
      action: () => {
        console.log('Export settings triggered');
      },
      priority: 'low',
      keywords: ['export', 'backup', 'settings'],
    },
    {
      id: 'action.import-settings',
      label: 'Import Settings',
      description: 'Import settings from JSON',
      category: 'actions',
      action: () => {
        console.log('Import settings triggered');
      },
      priority: 'low',
      keywords: ['import', 'restore', 'settings'],
    },
    {
      id: 'action.toggle-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      category: 'actions',
      action: () => {
        document.documentElement.classList.toggle('dark');
      },
      priority: 'medium',
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
    {
      id: 'action.clear-cache',
      label: 'Clear Cache',
      description: 'Clear application cache',
      category: 'actions',
      action: () => {
        if (typeof window !== 'undefined' && 'caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      },
      priority: 'low',
      keywords: ['cache', 'clear', 'reset'],
    },
  ]);

  // AI Agent Commands
  commandRegistry.registerMany([
    {
      id: 'ai.start-chat',
      label: 'Start Chat',
      description: 'Open AI agent chat',
      category: 'ai-agent',
      action: () => {
        console.log('Start chat triggered');
      },
      shortcut: { key: 'l', meta: true, display: 'Cmd+L' },
      priority: 'high',
      keywords: ['chat', 'ai', 'agent', 'conversation'],
    },
    {
      id: 'ai.search-code',
      label: 'Search Code',
      description: 'Search codebase with AI',
      category: 'ai-agent',
      action: () => {
        console.log('Search code triggered');
      },
      priority: 'medium',
      keywords: ['search', 'ai', 'code', 'find'],
    },
    {
      id: 'ai.generate-code',
      label: 'Generate Code',
      description: 'Generate code with AI',
      category: 'ai-agent',
      action: () => {
        console.log('Generate code triggered');
      },
      priority: 'medium',
      keywords: ['generate', 'ai', 'code', 'create'],
    },
    {
      id: 'ai.explain-code',
      label: 'Explain Code',
      description: 'Explain selected code',
      category: 'ai-agent',
      action: () => {
        console.log('Explain code triggered');
      },
      priority: 'medium',
      keywords: ['explain', 'ai', 'code', 'understand'],
    },
  ]);

  // Editor Commands
  commandRegistry.registerMany([
    {
      id: 'editor.format-document',
      label: 'Format Document',
      description: 'Format current file',
      category: 'editor',
      action: () => {
        console.log('Format document triggered');
      },
      shortcut: { key: 's', meta: true, shift: true, display: 'Cmd+Shift+S' },
      priority: 'medium',
      keywords: ['format', 'prettier', 'beautify'],
    },
    {
      id: 'editor.find-in-file',
      label: 'Find in File',
      description: 'Search in current file',
      category: 'editor',
      action: () => {
        console.log('Find in file triggered');
      },
      shortcut: { key: 'f', meta: true, display: 'Cmd+F' },
      priority: 'high',
      keywords: ['find', 'search', 'file'],
    },
    {
      id: 'editor.replace-in-file',
      label: 'Replace in File',
      description: 'Find and replace in current file',
      category: 'editor',
      action: () => {
        console.log('Replace in file triggered');
      },
      shortcut: { key: 'h', meta: true, display: 'Cmd+H' },
      priority: 'medium',
      keywords: ['replace', 'find', 'substitute'],
    },
    {
      id: 'editor.toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      category: 'editor',
      action: () => {
        console.log('Toggle sidebar triggered');
      },
      shortcut: { key: 'b', meta: true, display: 'Cmd+B' },
      priority: 'medium',
      keywords: ['sidebar', 'panel', 'toggle'],
    },
  ]);
}

export default useCommandPalette;
