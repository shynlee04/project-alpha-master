import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Command } from 'cmdk';
import { Search, Terminal, Settings, FileText, Zap, HelpCircle, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Command Palette Component
 * 
 * Provides fuzzy search for IDE commands with keyboard navigation.
 * Supports Cmd/Ctrl+K shortcut to open.
 * 
 * @component CommandPalette
 */

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: 'file' | 'edit' | 'view' | 'tools' | 'help';
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Define available commands
  const commands: CommandItem[] = [
    {
      id: 'open-file',
      label: t('commandPalette.openFile'),
      description: t('commandPalette.openFileDesc'),
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        // Trigger file open dialog
        onClose();
      },
      shortcut: 'Ctrl+O',
      category: 'file',
    },
    {
      id: 'toggle-terminal',
      label: t('commandPalette.toggleTerminal'),
      description: t('commandPalette.toggleTerminalDesc'),
      icon: <Terminal className="w-4 h-4" />,
      action: () => {
        // Toggle terminal panel
        onClose();
      },
      shortcut: 'Ctrl+`',
      category: 'view',
    },
    {
      id: 'open-settings',
      label: t('commandPalette.openSettings'),
      description: t('commandPalette.openSettingsDesc'),
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        // Open settings panel
        onClose();
      },
      shortcut: 'Ctrl+,',
      category: 'tools',
    },
    {
      id: 'search-in-files',
      label: t('commandPalette.searchInFiles'),
      description: t('commandPalette.searchInFilesDesc'),
      icon: <Search className="w-4 h-4" />,
      action: () => {
        // Open file search
        onClose();
      },
      shortcut: 'Ctrl+Shift+F',
      category: 'file',
    },
    {
      id: 'show-shortcuts',
      label: t('commandPalette.showShortcuts'),
      description: t('commandPalette.showShortcutsDesc'),
      icon: <Keyboard className="w-4 h-4" />,
      action: () => {
        // Show keyboard shortcuts overlay
        onClose();
      },
      shortcut: 'Ctrl+/',
      category: 'help',
    },
    {
      id: 'show-help',
      label: t('commandPalette.showHelp'),
      description: t('commandPalette.showHelpDesc'),
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        // Open help documentation
        onClose();
      },
      category: 'help',
    },
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    const labelLower = cmd.label.toLowerCase();
    const descLower = cmd.description?.toLowerCase() || '';
    
    // Fuzzy search: check if all search characters appear in order
    let searchIndex = 0;
    let labelIndex = 0;
    
    while (searchIndex < searchLower.length && labelIndex < labelLower.length) {
      if (searchLower[searchIndex] === labelLower[labelIndex]) {
        searchIndex++;
      }
      labelIndex++;
    }
    
    // Also check description
    const matchesDescription = descLower.includes(searchLower);
    
    return searchIndex === searchLower.length || matchesDescription;
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Parent component handles opening
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommandSelect = useCallback((command: CommandItem) => {
    command.action();
  }, []);

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20%]"
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-50 w-full max-w-2xl mx-auto">
        <Command className="rounded-lg border border-border bg-card shadow-pixel overflow-hidden">
          <div className="flex items-center border-b border-border px-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder={t('commandPalette.placeholder')}
              className="flex h-12 w-full rounded-md border-0 bg-transparent px-0 text-sm outline-none placeholder:text-muted-foreground focus:ring-0 focus:ring-offset-0"
            />
          </div>
          <Command.List className="max-h-96 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="mb-2 h-8 w-8" />
                <p className="text-sm">{t('commandPalette.noResults')}</p>
              </div>
            ) : (
              filteredCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={() => handleCommandSelect(command)}
                  className="group relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                      {command.icon}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="font-medium">{command.label}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                    {command.shortcut && (
                      <kbd className="pointer-events-none ml-auto flex h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium text-secondary-foreground opacity-100">
                        <span className="text-xs">{command.shortcut}</span>
                      </kbd>
                    )}
                  </div>
                </Command.Item>
              ))
            )}
          </Command.List>
        </Command>
      </div>
    </Command.Dialog>
  );
};

export default CommandPalette;
