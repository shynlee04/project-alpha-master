/**
 * Command Registry
 *
 * Central registry for all commands in the command palette.
 * Supports hierarchical organization, context filtering, and permissions.
 */

export type CommandCategory =
  | 'actions'
  | 'files'
  | 'navigation'
  | 'settings'
  | 'plugins'
  | 'ai-agent'
  | 'editor';

export type CommandPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CommandShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  display: string;
}

export interface CommandContext {
  route?: string;
  workspace?: string;
  permissions?: string[];
}

export interface Command {
  id: string;
  label: string;
  description: string;
  category: CommandCategory;
  icon?: string;
  action: () => void | Promise<void>;
  shortcut?: CommandShortcut;
  context?: CommandContext;
  priority?: CommandPriority;
  keywords?: string[];
  hidden?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export interface CommandGroup {
  id: string;
  label: string;
  commands: string[]; // Command IDs
  priority?: CommandPriority;
}

class CommandRegistry {
  private commands = new Map<string, Command>();
  private groups = new Map<string, CommandGroup>();
  private recentCommands = new Set<string>();
  private maxRecentCommands = 10;

  /**
   * Register a single command
   */
  register(command: Command): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command ${command.id} is already registered. Overwriting.`);
    }
    this.commands.set(command.id, command);
  }

  /**
   * Register multiple commands
   */
  registerMany(commands: Command[]): void {
    commands.forEach((cmd) => this.register(cmd));
  }

  /**
   * Unregister a command
   */
  unregister(id: string): boolean {
    return this.commands.delete(id);
  }

  /**
   * Get a command by ID
   */
  get(id: string): Command | undefined {
    return this.commands.get(id);
  }

  /**
   * Get all commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values()).filter((cmd) => !cmd.hidden);
  }

  /**
   * Get commands by category
   */
  getByCategory(category: CommandCategory): Command[] {
    return this.getAll()
      .filter((cmd) => cmd.category === category)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (
          priorityOrder[a.priority || 'medium'] -
          priorityOrder[b.priority || 'medium']
        );
      });
  }

  /**
   * Get commands filtered by context
   */
  getByContext(context: CommandContext): Command[] {
    return this.getAll().filter((cmd) => {
      // Check route match
      if (cmd.context?.route && context.route) {
        if (cmd.context.route !== context.route) {
          return false;
        }
      }

      // Check workspace match
      if (cmd.context?.workspace && context.workspace) {
        if (cmd.context.workspace !== context.workspace) {
          return false;
        }
      }

      // Check permissions
      if (cmd.context?.permissions && context.permissions) {
        const hasPermission = cmd.context.permissions.some((perm) =>
          context.permissions?.includes(perm)
        );
        if (!hasPermission) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Mark a command as recently used
   */
  markAsUsed(id: string): void {
    if (!this.commands.has(id)) {
      return;
    }

    // Remove if already exists (to move to end)
    this.recentCommands.delete(id);

    // Add to end
    this.recentCommands.add(id);

    // Trim to max size
    if (this.recentCommands.size > this.maxRecentCommands) {
      const first = this.recentCommands.values().next().value;
      if (first) {
        this.recentCommands.delete(first);
      }
    }

    // Persist to localStorage
    this.saveRecentCommands();
  }

  /**
   * Get recently used commands
   */
  getRecent(): Command[] {
    return Array.from(this.recentCommands)
      .map((id) => this.commands.get(id))
      .filter((cmd): cmd is Command => cmd !== undefined && !cmd.hidden);
  }

  /**
   * Clear recent commands
   */
  clearRecent(): void {
    this.recentCommands.clear();
    localStorage.removeItem('command-palette:recent');
  }

  /**
   * Create a command group
   */
  createGroup(group: CommandGroup): void {
    this.groups.set(group.id, group);
  }

  /**
   * Get commands from a group
   */
  getGroup(groupId: string): Command[] {
    const group = this.groups.get(groupId);
    if (!group) {
      return [];
    }

    return group.commands
      .map((cmdId) => this.commands.get(cmdId))
      .filter((cmd): cmd is Command => cmd !== undefined && !cmd.hidden);
  }

  /**
   * Get all groups
   */
  getAllGroups(): CommandGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * Search commands by query
   */
  search(query: string, context?: CommandContext): Command[] {
    const commands = context ? this.getByContext(context) : this.getAll();
    const lowerQuery = query.toLowerCase();

    if (!query) {
      return commands;
    }

    return commands
      .map((cmd) => {
        let score = 0;
        const lowerLabel = cmd.label.toLowerCase();
        const lowerDesc = cmd.description.toLowerCase();
        const lowerKeywords = (cmd.keywords || []).map((k) => k.toLowerCase());

        // Exact label match (highest score)
        if (lowerLabel === lowerQuery) {
          score += 100;
        }
        // Label starts with query
        else if (lowerLabel.startsWith(lowerQuery)) {
          score += 80;
        }
        // Query in label
        else if (lowerLabel.includes(lowerQuery)) {
          score += 60;
        }

        // Description match
        if (lowerDesc.includes(lowerQuery)) {
          score += 40;
        }

        // Keyword match
        if (lowerKeywords.some((kw) => kw.includes(lowerQuery))) {
          score += 50;
        }

        // Priority bonus
        const priorityBonus = {
          critical: 30,
          high: 20,
          medium: 10,
          low: 0,
        };
        score += priorityBonus[cmd.priority || 'medium'];

        // Recent usage bonus
        if (this.recentCommands.has(cmd.id)) {
          score += 15;
        }

        return { cmd, score };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100) // Limit to 100 results
      .map((result) => result.cmd);
  }

  /**
   * Load recent commands from localStorage
   */
  private loadRecentCommands(): void {
    try {
      const stored = localStorage.getItem('command-palette:recent');
      if (stored) {
        const recent = JSON.parse(stored) as string[];
        this.recentCommands = new Set(recent.slice(0, this.maxRecentCommands));
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error);
    }
  }

  /**
   * Save recent commands to localStorage
   */
  private saveRecentCommands(): void {
    try {
      const recent = Array.from(this.recentCommands);
      localStorage.setItem('command-palette:recent', JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save recent commands:', error);
    }
  }

  /**
   * Initialize the registry
   */
  init(): void {
    this.loadRecentCommands();
  }

  /**
   * Clear all commands (useful for testing)
   */
  clear(): void {
    this.commands.clear();
    this.groups.clear();
    this.clearRecent();
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();

// Auto-initialize
if (typeof window !== 'undefined') {
  commandRegistry.init();
}
