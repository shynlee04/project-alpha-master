import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  FileText, 
  Terminal, 
  Settings, 
  Search, 
  RefreshCw, 
  Download,
  Upload,
  Zap,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Quick Actions Menu Component
 * 
 * Provides quick access to common IDE actions.
 * Uses Radix UI Dropdown Menu for accessibility.
 * 
 * @component QuickActionsMenu
 */

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  separator?: boolean;
}

export interface QuickActionsMenuProps {
  actions?: QuickAction[];
  className?: string;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ 
  actions: customActions,
  className 
}) => {
  const { t } = useTranslation();

  // Default quick actions
  const defaultActions: QuickAction[] = [
    {
      id: 'open-file',
      label: t('quickActions.openFile'),
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        // Trigger file open dialog
      },
      shortcut: 'Ctrl+O',
    },
    {
      id: 'toggle-terminal',
      label: t('quickActions.toggleTerminal'),
      icon: <Terminal className="w-4 h-4" />,
      action: () => {
        // Toggle terminal panel
      },
      shortcut: 'Ctrl+`',
    },
    {
      id: 'open-settings',
      label: t('quickActions.openSettings'),
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        // Open settings panel
      },
      shortcut: 'Ctrl+,',
    },
    {
      id: 'search',
      label: t('quickActions.search'),
      icon: <Search className="w-4 h-4" />,
      action: () => {
        // Open search panel
      },
      shortcut: 'Ctrl+Shift+F',
    },
    {
      id: 'separator-1',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'refresh',
      label: t('quickActions.refresh'),
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => {
        // Refresh workspace
      },
    },
    {
      id: 'export',
      label: t('quickActions.export'),
      icon: <Download className="w-4 h-4" />,
      action: () => {
        // Export project
      },
    },
    {
      id: 'import',
      label: t('quickActions.import'),
      icon: <Upload className="w-4 h-4" />,
      action: () => {
        // Import project
      },
    },
    {
      id: 'separator-2',
      label: '',
      icon: null,
      action: () => {},
      separator: true,
    },
    {
      id: 'agent-chat',
      label: t('quickActions.agentChat'),
      icon: <Zap className="w-4 h-4" />,
      action: () => {
        // Open agent chat
      },
    },
    {
      id: 'shortcuts',
      label: t('quickActions.shortcuts'),
      icon: <Keyboard className="w-4 h-4" />,
      action: () => {
        // Show keyboard shortcuts
      },
      shortcut: 'Ctrl+/',
    },
    {
      id: 'help',
      label: t('quickActions.help'),
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        // Open help documentation
      },
    },
  ];

  const actions = customActions || defaultActions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
            "text-muted-foreground",
            className
          )}
          aria-label={t('quickActions.ariaLabel')}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 rounded-lg border border-border bg-card shadow-pixel"
        align="end"
      >
        {actions.map((action) => {
          if (action.separator) {
            return <DropdownMenuSeparator key={action.id} className="bg-border" />;
          }

          return (
            <DropdownMenuItem
              key={action.id}
              onClick={action.action}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-secondary">
                {action.icon}
              </div>
              <span className="flex-1 text-sm">{action.label}</span>
              {action.shortcut && (
                <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium text-secondary-foreground opacity-100">
                  <span className="text-xs">{action.shortcut}</span>
                </kbd>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickActionsMenu;
