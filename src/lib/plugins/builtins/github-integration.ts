/**
 * GitHub Integration Plugin
 *
 * Built-in plugin for GitHub repository sync.
 *
 * @module plugins/builtins/github-integration
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import type { PluginMain, PluginContext } from '@/lib/plugins/types';

const manifest = {
  name: 'github-integration',
  version: '1.0.0',
  description: 'Sync repositories, issues, and pull requests from GitHub',
  author: 'Built-in',
  license: 'MIT',
  homepage: 'https://github.com',
  main: '',
  permissions: ['network', 'storage'],
};

const plugin: PluginMain = {
  activate: async (context: PluginContext) => {
    console.log('[GitHub Integration] Activating');
    console.log('[GitHub Integration] Permissions:', context.permissions);
    console.log('[GitHub Integration] Storage API available');

    // Store plugin config
    await context.storage.set('github-token', '');
    await context.storage.set('default-branch', 'main');
  },

  deactivate: async () => {
    console.log('[GitHub Integration] Deactivating');
  },
};

export default plugin;
export { manifest };
