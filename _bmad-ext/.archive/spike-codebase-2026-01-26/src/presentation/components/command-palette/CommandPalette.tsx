/**
 * Command Palette Component
 *
 * Keyboard-driven command palette with fuzzy search, categories, and shortcuts.
 * Mobile: Full-screen overlay
 * Desktop: Centered modal
 *
 * Accessibility:
 * - Full keyboard navigation (arrows, enter, esc)
 * - ARIA labels and roles
 * - Focus management
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/presentation/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  commandRegistry,
  type Command,
  type CommandCategory,
} from '@/lib/command-palette/command-registry';
import { highlightFuzzy } from '@/lib/command-palette/fuzzy-search';
import {
  Search,
  Settings,
  Sparkles,
  Code,
  Layers,
  Zap,
  Check,
  FileIcon,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategoryGroup {
  category: CommandCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  commands: Command[];
}

const CATEGORIES: Record<CommandCategory, { label: string; icon: any }> = {
  actions: { label: 'Actions', icon: Zap },
  files: { label: 'Files', icon: FileIcon },
  navigation: { label: 'Navigation', icon: Layers },
  settings: { label: 'Settings', icon: Settings },
  plugins: { label: 'Plugins', icon: Sparkles },
  'ai-agent': { label: 'AI Agent', icon: Sparkles },
  editor: { label: 'Editor', icon: Code },
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Search commands
  useEffect(() => {
    if (!open) {
      setGroups([]);
      return;
    }

    const allCommands = commandRegistry.search(query);

    // Group by category
    const grouped = allCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<CommandCategory, Command[]>);

    // Convert to array
    const categoryGroups = Object.entries(grouped).map(([category, commands]) => ({
      category: category as CommandCategory,
      label: CATEGORIES[category as CommandCategory].label,
      icon: CATEGORIES[category as CommandCategory].icon,
      commands,
    }));

    setGroups(categoryGroups);
    setSelectedIndex(0);
  }, [query, open]);

  // Get all commands as flat array
  const allCommands = groups.flatMap((group) => group.commands);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev + 1;
            return next < allCommands.length ? next : prev;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev - 1;
            return next >= 0 ? next : 0;
          });
          break;

        case 'Enter':
          e.preventDefault();
          const selectedCommand = allCommands[selectedIndex];
          if (selectedCommand && !selectedCommand.disabled) {
            executeCommand(selectedCommand);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [allCommands, selectedIndex, onOpenChange]
  );

  // Execute command
  const executeCommand = async (command: Command) => {
    commandRegistry.markAsUsed(command.id);
    onOpenChange(false);
    await command.action();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement instanceof HTMLElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 shadow-pixel border-2 border-border bg-card",
          "max-w-2xl w-full",
          // Mobile: Full-screen
          "max-h-[85dvh]",
          // Desktop: Centered
          "sm:rounded-lg"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('commandPalette.placeholder')}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            aria-label={t('commandPalette.placeholder')}
            role="searchbox"
            autoComplete="off"
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium text-secondary-foreground opacity-100 sm:flex">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        {/* Commands List */}
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[60dvh] px-2 py-2"
          role="listbox"
          aria-label="Commands"
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {t('commandPalette.noResults')}
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.category} className="mb-4 last:mb-0">
                {/* Category Header */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </div>

                {/* Commands */}
                {group.commands.map((command) => {
                  const globalIndex = allCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = command.icon ? command.icon : group.icon;

                  return (
                    <button
                      key={command.id}
                      onClick={() => !command.disabled && executeCommand(command)}
                      disabled={command.disabled}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors",
                        "text-left cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                        isSelected && "bg-accent text-accent-foreground",
                        command.disabled &&
                          "opacity-50 cursor-not-allowed hover:bg-transparent"
                      )}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={command.disabled}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-9 h-9 rounded shrink-0",
                          "bg-secondary text-secondary-foreground",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Label & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {highlightFuzzy(command.label, query)}
                        </div>
                        {command.description && (
                          <div
                            className="text-xs text-muted-foreground truncate"
                            dangerouslySetInnerHTML={{
                              __html: command.description,
                            }}
                          />
                        )}
                      </div>

                      {/* Shortcut */}
                      {command.shortcut && (
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium text-secondary-foreground opacity-100 lg:flex">
                          <span className="text-xs">{command.shortcut.display}</span>
                        </kbd>
                      )}

                      {/* Checkmark for recent */}
                      {commandRegistry.getRecent().some((c) => c.id === command.id) && (
                        <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="pointer-events-none h-4 select-none rounded border border-border bg-secondary px-1 font-mono text-[9px]">
                ↑↓
              </kbd>
              <span>{t('commandPalette.navigate')}</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="pointer-events-none h-4 select-none rounded border border-border bg-secondary px-1 font-mono text-[9px]">
                ↵
              </kbd>
              <span>{t('commandPalette.select')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="pointer-events-none h-4 select-none rounded border border-border bg-secondary px-1 font-mono text-[9px]">
              ESC
            </kbd>
            <span>{t('commandPalette.close')}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
