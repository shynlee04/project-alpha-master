/**
 * @fileoverview File Watcher Engine
 * @module lib/watcher/file-watcher
 *
 * Provides file system watching with FS events and polling fallback.
 * Debounces rapid changes and respects watch limits.
 *
 * @story S-039 - File Watcher with Auto-Reload and Change Detection
 */

export interface WatchedFile {
  path: string;
  lastModified: number;
  lastSize: number;
  lastHash?: string;
  contentType: 'code' | 'config' | 'asset' | 'binary';
}

export type FileChangeType = 'created' | 'modified' | 'deleted' | 'moved';

export interface FileChangeEvent {
  path: string;
  type: FileChangeType;
  timestamp: number;
  oldPath?: string;
  contentType: 'code' | 'config' | 'asset' | 'binary';
}

export interface FileWatcherOptions {
  /** Debounce delay in milliseconds (default: 500ms) */
  debounceMs?: number;
  /** Polling interval in milliseconds when FS events unavailable (default: 2000ms) */
  pollingInterval?: number;
  /** Maximum number of files to watch (default: 100) */
  maxWatchedFiles?: number;
  /** Glob patterns to include */
  includePatterns?: string[];
  /** Glob patterns to exclude */
  excludePatterns?: string[];
  /** Enable polling mode (fallback when FS events unavailable) */
  enablePolling?: boolean;
}

export interface FileWatcherConfig {
  enabled: boolean;
  autoReload: boolean;
  pollingInterval: number;
  includePatterns: string[];
  excludePatterns: string[];
}

type ChangeListener = (event: FileChangeEvent) => void;

/**
 * Simple debouncing utility
 */
class Debouncer {
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  debounce(key: string, fn: () => void, delay: number): void {
    const existing = this.timeouts.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      fn();
      this.timeouts.delete(key);
    }, delay);

    this.timeouts.set(key, timeout);
  }

  clear(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }

  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

/**
 * Simple glob pattern matcher
 */
function matchesGlob(path: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * File Watcher Engine
 *
 * Monitors files for changes using file system events when available,
 * with polling fallback. Debounces rapid changes and respects limits.
 */
export class FileWatcherEngine {
  private watchedFiles = new Map<string, WatchedFile>();
  private listeners = new Set<ChangeListener>();
  private debouncer = new Debouncer();
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  private options: Required<FileWatcherOptions>;

  // Default patterns
  private readonly defaultIncludePatterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'public/**/*.{json,html,css}',
    '*.{json,md,txt,yml,yaml}'
  ];

  private readonly defaultExcludePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '*.log',
    '.DS_Store'
  ];

  // Binary file extensions to skip
  private readonly binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp',
    '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp3', '.mp4', '.avi', '.mov', '.wav'
  ]);

  constructor(options: FileWatcherOptions = {}) {
    this.options = {
      debounceMs: options.debounceMs ?? 500,
      pollingInterval: options.pollingInterval ?? 2000,
      maxWatchedFiles: options.maxWatchedFiles ?? 100,
      includePatterns: options.includePatterns ?? this.defaultIncludePatterns,
      excludePatterns: options.excludePatterns ?? this.defaultExcludePatterns,
      enablePolling: options.enablePolling ?? false
    };
  }

  /**
   * Start watching a file
   */
  async watchFile(path: string): Promise<boolean> {
    // Check if we've hit the limit
    if (this.watchedFiles.size >= this.options.maxWatchedFiles) {
      console.warn('[FileWatcher] Max watched files limit reached:', this.options.maxWatchedFiles);
      return false;
    }

    // Check if file matches include/exclude patterns
    if (!this.shouldWatch(path)) {
      return false;
    }

    // Try to get file metadata
    try {
      const stats = await this.getFileStats(path);
      const contentType = this.detectContentType(path);

      this.watchedFiles.set(path, {
        path,
        lastModified: stats.mtime,
        lastSize: stats.size,
        contentType
      });

      console.log('[FileWatcher] Now watching:', path, contentType);
      return true;
    } catch (error) {
      console.warn('[FileWatcher] Failed to watch file:', path, error);
      return false;
    }
  }

  /**
   * Stop watching a file
   */
  unwatchFile(path: string): void {
    this.watchedFiles.delete(path);
    this.debouncer.clear(path);
    console.log('[FileWatcher] Stopped watching:', path);
  }

  /**
   * Stop watching all files
   */
  unwatchAll(): void {
    this.watchedFiles.clear();
    this.debouncer.clearAll();
    this.stopPolling();
    console.log('[FileWatcher] Stopped watching all files');
  }

  /**
   * Start polling for changes
   */
  startPolling(): void {
    if (this.pollingIntervalId) {
      return; // Already polling
    }

    console.log('[FileWatcher] Starting polling mode');
    this.pollingIntervalId = setInterval(() => {
      this.pollForChanges();
    }, this.options.pollingInterval);
  }

  /**
   * Stop polling for changes
   */
  stopPolling(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
      console.log('[FileWatcher] Stopped polling mode');
    }
  }

  /**
   * Poll for file changes
   */
  private async pollForChanges(): Promise<void> {
    const paths = Array.from(this.watchedFiles.keys());

    for (const path of paths) {
      try {
        const stats = await this.getFileStats(path);
        const watched = this.watchedFiles.get(path);

        if (!watched) continue;

        // Check if file was modified
        if (stats.mtime > watched.lastModified || stats.size !== watched.lastSize) {
          this.handleFileChange(path, 'modified', stats);
        }
      } catch (error) {
        // File might have been deleted
        const watched = this.watchedFiles.get(path);
        if (watched) {
          this.handleFileChange(path, 'deleted');
          this.watchedFiles.delete(path);
        }
      }
    }
  }

  /**
   * Handle detected file change (debounced)
   */
  private handleFileChange(
    path: string,
    type: FileChangeType,
    stats?: { mtime: number; size: number }
  ): void {
    this.debouncer.debounce(path, () => {
      const watched = this.watchedFiles.get(path);
      if (!watched) return;

      // Update watched file info
      if (stats) {
        watched.lastModified = stats.mtime;
        watched.lastSize = stats.size;
      }

      // Emit change event
      const event: FileChangeEvent = {
        path,
        type,
        timestamp: Date.now(),
        contentType: watched.contentType
      };

      this.notifyListeners(event);
    }, this.options.debounceMs);
  }

  /**
   * Notify all listeners of a change event
   */
  private notifyListeners(event: FileChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[FileWatcher] Error in change listener:', error);
      }
    });
  }

  /**
   * Add a change listener
   */
  onChange(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if a file should be watched based on patterns
   */
  private shouldWatch(path: string): boolean {
    // Check exclude patterns first
    for (const pattern of this.options.excludePatterns) {
      if (matchesGlob(path, pattern)) {
        return false;
      }
    }

    // Check include patterns
    for (const pattern of this.options.includePatterns) {
      if (matchesGlob(path, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect content type based on file extension
   */
  private detectContentType(path: string): WatchedFile['contentType'] {
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();

    if (this.binaryExtensions.has(ext)) {
      return 'binary';
    }

    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];
    const configExtensions = ['.json', '.yml', '.yaml', '.toml', '.xml', '.md'];
    const assetExtensions = ['.css', '.scss', '.less', '.html', '.svg'];

    if (codeExtensions.includes(ext)) return 'code';
    if (configExtensions.includes(ext)) return 'config';
    if (assetExtensions.includes(ext)) return 'asset';

    return 'code'; // Default to code
  }

  /**
   * Get file stats (platform-specific)
   *
   * Note: In browser environment, this would use WebContainer API or similar.
   * For now, this is a placeholder that needs to be implemented based on the platform.
   */
  private async getFileStats(_path: string): Promise<{ mtime: number; size: number }> {
    // This is a placeholder. In a real implementation, you would:
    // - Use WebContainer's fs API if in WebContainer environment
    // - Use File System Access API if available
    // - Use polling with HEAD requests if fetching from server

    // For now, return current time and 0 as fallback
    console.warn('[FileWatcher] getFileStats not implemented for this platform');
    return { mtime: Date.now(), size: 0 };
  }

  /**
   * Update watcher configuration
   */
  updateConfig(config: Partial<FileWatcherConfig>): void {
    if (config.autoReload !== undefined) {
      // Auto-reload is handled by the hook, not the engine
    }
    if (config.pollingInterval !== undefined) {
      this.options.pollingInterval = config.pollingInterval;
      // Restart polling if it's running
      if (this.pollingIntervalId) {
        this.stopPolling();
        this.startPolling();
      }
    }
    if (config.includePatterns !== undefined) {
      this.options.includePatterns = config.includePatterns.length > 0
        ? config.includePatterns
        : this.defaultIncludePatterns;
    }
    if (config.excludePatterns !== undefined) {
      this.options.excludePatterns = config.excludePatterns;
    }
  }

  /**
   * Get list of currently watched files
   */
  getWatchedFiles(): WatchedFile[] {
    return Array.from(this.watchedFiles.values());
  }

  /**
   * Get watcher statistics
   */
  getStats() {
    return {
      watchedCount: this.watchedFiles.size,
      maxWatchedFiles: this.options.maxWatchedFiles,
      listenerCount: this.listeners.size,
      isPolling: this.pollingIntervalId !== null
    };
  }

  /**
   * Dispose of the watcher
   */
  dispose(): void {
    this.unwatchAll();
    this.listeners.clear();
  }
}

/**
 * Global file watcher instance
 */
let globalFileWatcher: FileWatcherEngine | null = null;

/**
 * Get or create the global file watcher instance
 */
export function getFileWatcher(options?: FileWatcherOptions): FileWatcherEngine {
  if (!globalFileWatcher) {
    globalFileWatcher = new FileWatcherEngine(options);
  }
  return globalFileWatcher;
}

/**
 * Dispose of the global file watcher
 */
export function disposeFileWatcher(): void {
  if (globalFileWatcher) {
    globalFileWatcher.dispose();
    globalFileWatcher = null;
  }
}
