/**
 * Plugin Hooks System - Extension Points
 *
 * Provides the extension point registry and event system for plugins.
 * Manages command registration, UI extensions, themes, and hooks.
 *
 * @module plugins/plugin-hooks
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import type { PluginExtension } from './types';

/**
 * Extension point registry
 */
class PluginExtensionRegistry {
  private commands = new Map<string, PluginExtension>();
  private themes = new Map<string, PluginExtension>();
  private languages = new Map<string, PluginExtension>();
  private fileHandlers = new Map<string, PluginExtension>();
  private uiPanels = new Map<string, PluginExtension>();
  private statusBarItems = new Map<string, PluginExtension>();
  private contextMenus = new Map<string, PluginExtension>();
  private hooks = new Map<string, PluginExtension[]>();

  // ========================================================================
  // Command Extensions
  // ========================================================================

  registerCommand(extension: PluginExtension): void {
    if (extension.type !== 'command') return;
    this.commands.set(extension.command.id, extension);
  }

  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  getCommand(commandId: string): PluginExtension | undefined {
    return this.commands.get(commandId);
  }

  getAllCommands(): PluginExtension[] {
    return Array.from(this.commands.values());
  }

  // ========================================================================
  // Theme Extensions
  // ========================================================================

  registerTheme(extension: PluginExtension): void {
    if (extension.type !== 'theme') return;
    this.themes.set(extension.theme.id, extension);
  }

  unregisterTheme(themeId: string): void {
    this.themes.delete(themeId);
  }

  getTheme(themeId: string): PluginExtension | undefined {
    return this.themes.get(themeId);
  }

  getAllThemes(): PluginExtension[] {
    return Array.from(this.themes.values());
  }

  // ========================================================================
  // Language Extensions
  // ========================================================================

  registerLanguage(extension: PluginExtension): void {
    if (extension.type !== 'language') return;
    this.languages.set((extension as any).language.id, extension);
  }

  unregisterLanguage(languageId: string): void {
    this.languages.delete(languageId);
  }

  getLanguage(languageId: string): PluginExtension | undefined {
    return this.languages.get(languageId);
  }

  getLanguageByExtension(ext: string): PluginExtension | undefined {
    return Array.from(this.languages.values()).find(
      lang => (lang as any).language.extensions.includes(ext)
    );
  }

  getAllLanguages(): PluginExtension[] {
    return Array.from(this.languages.values());
  }

  // ========================================================================
  // File Handler Extensions
  // ========================================================================

  registerFileHandler(extension: PluginExtension): void {
    if (extension.type !== 'fileHandler') return;
    for (const ext of extension.handler.extensions) {
      this.fileHandlers.set(ext, extension);
    }
  }

  unregisterFileHandler(extension: string): void {
    // Remove all extensions for this handler
    for (const [key, value] of this.fileHandlers.entries()) {
      if (value.pluginId === extension) {
        this.fileHandlers.delete(key);
      }
    }
  }

  getFileHandler(extension: string): PluginExtension | undefined {
    return this.fileHandlers.get(extension);
  }

  getAllFileHandlers(): PluginExtension[] {
    // Deduplicate by plugin ID
    const unique = new Map<string, PluginExtension>();
    for (const handler of this.fileHandlers.values()) {
      unique.set(handler.pluginId, handler);
    }
    return Array.from(unique.values());
  }

  // ========================================================================
  // UI Panel Extensions
  // ========================================================================

  registerUIPanel(extension: PluginExtension): void {
    if (extension.type !== 'uiPanel') return;
    this.uiPanels.set((extension as any).panel.id, extension);
  }

  unregisterUIPanel(panelId: string): void {
    this.uiPanels.delete(panelId);
  }

  getUIPanel(panelId: string): PluginExtension | undefined {
    return this.uiPanels.get(panelId);
  }

  getUIPanelsByPosition(position: 'sidebar' | 'bottom' | 'right'): PluginExtension[] {
    return Array.from(this.uiPanels.values()).filter(
      panel => (panel as any).panel.position === position
    );
  }

  getAllUIPanels(): PluginExtension[] {
    return Array.from(this.uiPanels.values());
  }

  // ========================================================================
  // Status Bar Extensions
  // ========================================================================

  registerStatusBarItem(extension: PluginExtension): void {
    if (extension.type !== 'statusBar') return;
    this.statusBarItems.set((extension as any).item.id, extension);
  }

  unregisterStatusBarItem(itemId: string): void {
    this.statusBarItems.delete(itemId);
  }

  getStatusBarItem(itemId: string): PluginExtension | undefined {
    return this.statusBarItems.get(itemId);
  }

  getStatusBarItemsByPosition(position: 'left' | 'right'): PluginExtension[] {
    return Array.from(this.statusBarItems.values())
      .filter(item => (item as any).item.position === position)
      .sort((a, b) => (a as any).item.order - (b as any).item.order);
  }

  getAllStatusBarItems(): PluginExtension[] {
    return Array.from(this.statusBarItems.values());
  }

  // ========================================================================
  // Context Menu Extensions
  // ========================================================================

  registerContextMenu(extension: PluginExtension): void {
    if (extension.type !== 'contextMenu') return;
    const id = `${extension.pluginId}:${(extension as any).menuItem.id}`;
    this.contextMenus.set(id, extension);
  }

  unregisterContextMenu(pluginId: string, menuItemId: string): void {
    const id = `${pluginId}:${menuItemId}`;
    this.contextMenus.delete(id);
  }

  getContextMenuItems(context: string): PluginExtension[] {
    return Array.from(this.contextMenus.values()).filter(
      menu => (menu as any).menuItem.context.includes(context)
    );
  }

  getAllContextMenuItems(): PluginExtension[] {
    return Array.from(this.contextMenus.values());
  }

  // ========================================================================
  // Hook Extensions
  // ========================================================================

  registerHook(extension: PluginExtension): void {
    if (extension.type !== 'hook') return;

    const event = (extension as any).hook.event;
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }

    this.hooks.get(event)!.push(extension);
  }

  unregisterHook(pluginId: string, event: string): void {
    const hooks = this.hooks.get(event);
    if (!hooks) return;

    const filtered = hooks.filter(h => h.pluginId !== pluginId);
    if (filtered.length === 0) {
      this.hooks.delete(event);
    } else {
      this.hooks.set(event, filtered);
    }
  }

  async executeHook(event: string, ...args: any[]): Promise<void> {
    const hooks = this.hooks.get(event);
    if (!hooks) return;

    for (const hook of hooks) {
      try {
        await (hook as any).hook.handler(...args);
      } catch (error) {
        console.error(`[HookRegistry] Error executing hook for ${event}:`, error);
      }
    }
  }

  getHooks(event: string): PluginExtension[] {
    return this.hooks.get(event) || [];
  }

  // ========================================================================
  // Plugin Cleanup
  // ========================================================================

  /**
   * Unregister all extensions for a plugin
   */
  unregisterAllExtensions(pluginId: string): void {
    // Commands
    for (const [id, cmd] of this.commands.entries()) {
      if (cmd.pluginId === pluginId) {
        this.commands.delete(id);
      }
    }

    // Themes
    for (const [id, theme] of this.themes.entries()) {
      if (theme.pluginId === pluginId) {
        this.themes.delete(id);
      }
    }

    // Languages
    for (const [id, lang] of this.languages.entries()) {
      if (lang.pluginId === pluginId) {
        this.languages.delete(id);
      }
    }

    // File handlers
    this.unregisterFileHandler(pluginId);

    // UI panels
    for (const [id, panel] of this.uiPanels.entries()) {
      if ((panel as any).pluginId === pluginId) {
        this.uiPanels.delete(id);
      }
    }

    // Status bar items
    for (const [id, item] of this.statusBarItems.entries()) {
      if ((item as any).pluginId === pluginId) {
        this.statusBarItems.delete(id);
      }
    }

    // Context menus
    for (const [id, menu] of this.contextMenus.entries()) {
      if ((menu as any).pluginId === pluginId) {
        this.contextMenus.delete(id);
      }
    }

    // Hooks
    for (const [event, hooks] of this.hooks.entries()) {
      const filtered = hooks.filter(h => (h as any).pluginId !== pluginId);
      if (filtered.length === 0) {
        this.hooks.delete(event);
      } else {
        this.hooks.set(event, filtered);
      }
    }

    console.log(`[PluginExtensionRegistry] Unregistered all extensions for ${pluginId}`);
  }
}

// Export singleton instance with a consistent name
export const ExtensionRegistry = new PluginExtensionRegistry();
