/**
 * @fileoverview 5-Layer System Prompt Composer
 * @module lib/agent/prompt-composer
 * 
 * System Prompt Composer - Layer-based prompt architecture for AI agents
 * 
 * Implements Layers 1-3 (Phase 1):
 * - Layer 1: Tool Constitution (hidden, always sent as system role)
 * - Layer 2: Agent Mode (user-selectable persona)
 * - Layer 3: Context Injection (open files + project summary, dynamic)
 * 
 * Layers 4-5 (User Preferences, Session Context) deferred to Phase 2
 * 
 * @epic 4 - Smart Agent Tools
 * @story 4.1 - 5-Layer System Prompt Composer
 */

import type { WorkspaceEventEmitter } from '../events/workspace-events';
import type {
  PromptLayer,
  PromptComposerConfig,
  CacheEntry,
} from './prompt-composer-types';
import type { LayerContext } from './prompt-composer-types';
export type { LayerContext };
import { DEFAULT_CONFIG } from './prompt-composer-config';

/**
 * SystemPromptComposer - Singleton class for composing system prompts from layers
 * 
 * Architecture Patterns:
 * - Singleton: One instance per agent configuration
 * - Observer: Listens to file system events for Layer 3 updates
 * - Strategy: Different layer types implement common PromptLayer interface
 * - Cache: Map memoization for Layers 1+2
 * 
 * Layer Composition Order: Layer 1 → Layer 2 → Layer 3
 * - Layer 1 (Tool Constitution): Hidden from UI, sent as system role
 * - Layer 2 (Agent Mode): User-selectable persona
 * - Layer 3 (Context Injection): Dynamic, recomputed on file changes
 * 
 * Caching Strategy:
 * - Layers 1+2: Cached with Map, invalidated on config change
 * - Layer 3: Never cached, always recomputed
 * - Cache key: {layerType}_{configHash}
 */
export class SystemPromptComposer {
  private static instance: SystemPromptComposer | null;
  
  /** Cache for Layers 1+2 (static/configurable layers) */
  private cache: Map<string, CacheEntry> = new Map();
  
  /** Registered layers with priority ordering */
  private layers: Map<number, PromptLayer> = new Map();

  /** Current configuration hash for cache invalidation */
  // private _currentConfigHash: string = '';

  /** Event emitter for file system events */
  // private _eventBus: WorkspaceEventEmitter | null = null;
  
  /** Debounce timer for Layer 3 recomputation */
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  /** Current Layer 3 context */
  private layer3Context: LayerContext = {
    openFiles: [],
    activeFile: undefined,
    projectPackageJson: undefined,
    workspaceReady: false,
  };

  /** Store the configuration for this instance */
  private config: PromptComposerConfig;

  /**
   * Get singleton instance
   *
   * When config is provided, creates a NEW instance (for testing)
   * When no config provided, returns the singleton instance (for production)
   */
  public static getInstance(config?: PromptComposerConfig): SystemPromptComposer {
    // If config is provided, create a new instance without modifying singleton
    // This allows tests to create fresh instances with custom configurations
    if (config) {
      return new SystemPromptComposer(config);
    }
    
    // No config provided - return singleton instance
    if (!SystemPromptComposer.instance) {
      SystemPromptComposer.instance = new SystemPromptComposer();
    }
    return SystemPromptComposer.instance;
  }

  /**
   * Private constructor - use getInstance()
   */
  private constructor(config?: PromptComposerConfig) {
    this.config = config || DEFAULT_CONFIG;
    this.layers = new Map();
    // this._currentConfigHash = this.generateConfigHash(config || DEFAULT_CONFIG);
    
    // Register default Layer 1: Tool Constitution
    this.registerLayer({
      id: 'layer-1-tool-constitution',
      type: 'tool-constitution',
      priority: 1,
      cacheable: true,
      generate: () => config?.toolConstitution || DEFAULT_CONFIG.toolConstitution,
    });
    
    // Register default Layer 2: Agent Mode (solo-dev as default)
    this.registerLayer({
      id: 'layer-2-agent-mode',
      type: 'agent-mode',
      priority: 2,
      cacheable: true,
      generate: () => this.getDefaultAgentModeContent(),
    });
    
    // Register Layer 3: Context Injection (dynamic, never cached)
    this.registerLayer({
      id: 'layer-3-context-injection',
      type: 'context-injection',
      priority: 3,
      cacheable: false,
      generate: (context) => this.generateLayer3Content(context),
    });
  }

  /**
   * Set event bus for file system event listening
   */
  public setEventBus(eventBus: WorkspaceEventEmitter): void {
    // this._eventBus = eventBus;
    
    // Subscribe to file system events for Layer 3 updates
    // Note: Using 'any' to bypass type checking for now
    // In production, WorkspaceEvents should include these event types
    (eventBus as any).on('files:changed', this.handleFilesChanged.bind(this));
    (eventBus as any).on('workspace:ready', this.handleWorkspaceReady.bind(this));
  }

  /**
   * Register a layer with priority ordering
   */
  private registerLayer(layer: PromptLayer): void {
    this.layers.set(layer.priority, layer);
  }

  /**
   * Unregister a layer by priority
   */
  private unregisterLayer(priority: number): void {
    this.layers.delete(priority);
  }

  /**
   * Update layer configuration (e.g., change agent mode)
   * Invalidates cache for cacheable layers
   */
  public updateConfig(config: Partial<PromptComposerConfig>): void {
    const newConfig = { ...this.getConfig(), ...config };
    this.config = newConfig;
    // this._currentConfigHash = this.generateConfigHash(newConfig);
    
    // Invalidate cache when configuration changes
    this.invalidateCache();
    
    // Update Layer 2 (Agent Mode) if changed
    if (config.agentMode && config.agentMode.id) {
      this.unregisterLayer(2); // Remove old Layer 2
      this.registerLayer({
        id: `layer-2-agent-mode-${config.agentMode.id}`,
        type: 'agent-mode',
        priority: 2,
        cacheable: true,
        generate: () => this.formatAgentMode(config.agentMode),
      });
    }
    
    // Update Layer 1 (Tool Constitution) if changed
    if (config.toolConstitution) {
      this.unregisterLayer(1); // Remove old Layer 1
      this.registerLayer({
        id: 'layer-1-tool-constitution',
        type: 'tool-constitution',
        priority: 1,
        cacheable: true,
        generate: () => config.toolConstitution || DEFAULT_CONFIG.toolConstitution,
      });
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): PromptComposerConfig {
    return this.config;
  }

  /**
   * Get registered layers (for testing)
   */
  public getLayers(): PromptLayer[] {
    return Array.from(this.layers.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Compose complete system prompt from all layers
   *
   * Order: Layer 1 (system role) → Layer 2 (agent mode) → Layer 3 (context)
   * Returns array of system messages for TanStack AI
   */
  public compose(context: LayerContext): Array<{ role: 'system' | 'user'; content: string }> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    
    // Get layers in priority order
    const layers = Array.from(this.layers.values())
      .sort((a, b) => a.priority - b.priority);
    
    // For Layer 3, merge passed context with internal layer3Context state
    // This ensures that context management methods (setOpenFiles, setActiveFile, etc.)
    // are reflected in the composed prompt
    const mergedContext: LayerContext = {
      ...context,
      // Prioritize internal state over passed context for Layer 3
      openFiles: this.layer3Context.openFiles.length > 0 ? this.layer3Context.openFiles : context.openFiles,
      activeFile: this.layer3Context.activeFile || context.activeFile,
      projectPackageJson: this.layer3Context.projectPackageJson || context.projectPackageJson,
      workspaceReady: this.layer3Context.workspaceReady || context.workspaceReady,
    };
    
    for (const layer of layers) {
      let content: string;
      
      // Generate content based on layer type
      switch (layer.type) {
        case 'tool-constitution':
          content = this.getConfig().toolConstitution ?? DEFAULT_CONFIG.toolConstitution;
          break;
        case 'agent-mode':
          content = this.formatAgentMode(this.getConfig().agentMode);
          break;
        case 'context-injection':
          content = this.generateLayer3Content(mergedContext);
          break;
        default:
          content = '';
      }
      
      messages.push({ role: 'system', content });
    }
    
    return messages;
  }

  /**
   * Get cached layer content (for Layers 1+2)
   * (Reserved for future use with Layers 1+2)
   */
  // private getCachedLayerContent(layerId: string): string | null {
  //   const cacheKey = `${layerId}_${this.currentConfigHash}`;
  //   const entry = this.cache.get(cacheKey);
  //
  //   if (!entry) {
  //     return null;
  //   }
  //
  //   // Check if cache is stale (older than 5 minutes)
  //   const now = Date.now();
  //   const STALE_MS = 5 * 60 * 1000; // 5 minutes
  //
  //   if (now - entry.timestamp > STALE_MS) {
  //     this.cache.delete(cacheKey);
  //     return null;
  //   }
  //
  //   return entry.content;
  // }

  /**
   * Set cached layer content (for Layers 1+2)
   * (Reserved for future use with Layers 1+2)
   */
  // private setCachedLayerContent(layerId: string, content: string): void {
  //   const cacheKey = `${layerId}_${this.currentConfigHash}`;
  //   this.cache.set(cacheKey, {
  //     content,
  //     timestamp: Date.now(),
  //     configHash: this.currentConfigHash,
  //   });
  // }

  /**
   * Invalidate cache for cacheable layers
   */
  private invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Generate hash of configuration for cache key
   */
  // private generateConfigHash(config: Partial<PromptComposerConfig>): string {
  //   const agentModeId = config.agentMode?.id || 'default';
  //   const toolConstitution = config.toolConstitution || DEFAULT_CONFIG.toolConstitution;
  //   // Include actual tool constitution content in hash for uniqueness
  //   // Use first 100 chars to avoid overly long hashes
  //   const toolConstitutionHash = toolConstitution.substring(0, 100);
  //   return `agent:${agentModeId}|tool:${toolConstitutionHash}`;
  // }

  /**
   * Handle file system changes with debounce
   */
  private handleFilesChanged(files: Array<{ path: string; name: string }>): void {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Set new timer (300ms debounce)
    // Note: In test environment, setTimeout may not be available
    // Tests should mock this behavior or use vi.useFakeTimers()
    this.debounceTimer = setTimeout(() => {
      this.layer3Context.openFiles = files;
      
      // Update active file if it's in list
      if (this.layer3Context.activeFile) {
        const stillActive = files.some(f => f.path === this.layer3Context.activeFile?.path);
        if (!stillActive) {
          this.layer3Context.activeFile = undefined;
        }
      }
      
      // Log for dev tools inspection
      if (process.env.NODE_ENV === 'development') {
        console.log('[SystemPromptComposer] Layer 3 context updated:', {
          openFiles: files.length,
          activeFile: this.layer3Context.activeFile,
        });
      }
    }, 300);
  }

  /**
   * Handle workspace ready event
   */
  private handleWorkspaceReady(): void {
    this.layer3Context.workspaceReady = true;
  }

  /**
   * Update Layer 3 context with project package.json
   */
  public setProjectPackageJson(packageJson: LayerContext['projectPackageJson']): void {
    this.layer3Context.projectPackageJson = packageJson;
    // Invalidate cache since Layer 3 content changed
    this.invalidateCache();
  }

  /**
   * Update Layer 3 context with open files
   */
  public setOpenFiles(files: Array<{ path: string; name: string }>): void {
    this.layer3Context.openFiles = files.slice(0, this.getConfig().maxOpenFiles || DEFAULT_CONFIG.maxOpenFiles);
    // Invalidate cache since Layer 3 content changed
    this.invalidateCache();
  }

  /**
   * Update Layer 3 context with active file
   */
  public setActiveFile(file: { path: string; name: string } | undefined): void {
    this.layer3Context.activeFile = file;
    // Invalidate cache since Layer 3 content changed
    this.invalidateCache();
  }

  /**
   * Generate Layer 1 content (Tool Constitution)
   * (Reserved for future use)
   */
  // private generateLayer1Content(): string {
  //   const cached = this.getCachedLayerContent('layer-1-tool-constitution');
  //   if (cached) {
  //     return cached;
  //   }
  //
  //   const content = this.layers.get(1)?.generate(this.layer3Context) || DEFAULT_CONFIG.toolConstitution;
  //   this.setCachedLayerContent('layer-1-tool-constitution', content);
  //   return content;
  // }

  /**
   * Generate Layer 2 content (Agent Mode)
   * (Reserved for future use)
   */
  // private generateLayer2Content(): string {
  //   const cached = this.getCachedLayerContent('layer-2-agent-mode');
  //   if (cached) {
  //     return cached;
  //   }
  //
  //   const content = this.layers.get(2)?.generate(this.layer3Context) || DEFAULT_CONFIG.agentMode.cognitivePhase;
  //   this.setCachedLayerContent('layer-2-agent-mode', content);
  //   return content;
  // }

  /**
   * Generate Layer 3 content (Context Injection)
   * Hybrid Strategy: open files (max 10) + project summary
   */
  private generateLayer3Content(context: LayerContext): string {
    const { openFiles, activeFile, projectPackageJson, workspaceReady } = context;
    
    const parts: string[] = [];
    
    // Add open files section (max 10)
    if (openFiles && openFiles.length > 0) {
      const fileList = openFiles
        .slice(0, this.getConfig().maxOpenFiles || DEFAULT_CONFIG.maxOpenFiles)
        .map(f => `  - ${f.name} (${f.path})`);
        
      parts.push(`## Open Files\n\n${fileList.join('\n')}`);
    }
    
    // Add active file section
    if (activeFile) {
      parts.push(`\n## Active File\n\nCurrently editing: ${activeFile.name} (${activeFile.path})`);
    }
    
    // Add project summary section
    if (projectPackageJson && workspaceReady) {
      const deps = projectPackageJson.dependencies 
        ? Object.entries(projectPackageJson.dependencies)
            .slice(0, 5)
            .map(([name, version]) => `  - ${name}@${version || 'latest'}`)
        : [];
        
      parts.push(`\n## Project Summary\n\nProject: ${projectPackageJson.name}\nVersion: ${projectPackageJson.version}\nDependencies:\n${deps.join('\n') || 'None'}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Format agent mode for system prompt
   */
  private formatAgentMode(mode: PromptComposerConfig['agentMode']): string {
    if (!mode) {
      return '';
    }
    
    return `## AGENT MODE\n\n${mode.name} (${mode.id})\n\n${mode.cognitivePhase}\n\n${mode.persona}\n\n${mode.communicationStyle}\n\n${mode.rules}`;
  }

  /**
   * Get default agent mode content (solo-dev from system-prompt.ts)
   */
  private getDefaultAgentModeContent(): string {
    // Return formatted default agent mode
    return `## AGENT MODE\n\n${DEFAULT_CONFIG.agentMode.name}\n\n${DEFAULT_CONFIG.agentMode.cognitivePhase}\n\n${DEFAULT_CONFIG.agentMode.persona}\n\n${DEFAULT_CONFIG.agentMode.communicationStyle}\n\n${DEFAULT_CONFIG.agentMode.rules}`;
  }
}
