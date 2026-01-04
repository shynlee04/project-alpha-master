/**
 * @fileoverview Base Storage Adapter - Abstract class for all storage adapters
 * @module infrastructure/sync/adapters/base-adapter
 *
 * Provides common functionality and interface for all storage adapters.
 * Adapters bridge different storage backends (FSA, IndexedDB, WebContainer).
 *
 * **Adapter Pattern:**
 * - All adapters extend BaseStorageAdapter
 * - Each adapter implements the StorageAdapter interface
 * - Shared functionality (path normalization, metadata) is inherited
 */

import type {
  StorageAdapter,
  FileContent,
  FileMetadata,
} from '../core/sync-types';

// Re-export error classes for backwards compatibility
export {
  AdapterError,
  FileNotFoundError,
  PermissionDeniedError,
  QuotaExceededError,
  AdapterNotReadyError,
  isAdapterError,
  isPermissionDeniedError,
  isQuotaExceededError,
} from './adapter-errors.js';

// ============================================================================
// Abstract Base Adapter
// ============================================================================

/**
 * Base storage adapter with common functionality
 * All storage adapters (FSA, IndexedDB, WebContainer) extend this class
 */
export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract readonly name: string;

  protected debugMode = false;
  protected _ready = false;

  constructor() {
    this._ready = true;
  }

  // ========== Abstract Methods (must be implemented by subclasses) ==========

  /**
   * Read file content - must be implemented by subclass
   */
  abstract readFile(path: string): Promise<FileContent>;

  /**
   * Write file content - must be implemented by subclass
   */
  abstract writeFile(path: string, content: Uint8Array): Promise<void>;

  /**
   * Delete file - must be implemented by subclass
   */
  abstract deleteFile(path: string): Promise<void>;

  /**
   * List files - must be implemented by subclass
   */
  abstract listFiles(pattern: string): Promise<string[]>;

  /**
   * Get metadata - must be implemented by subclass
   */
  abstract getMetadata(path: string): Promise<FileMetadata>;

  /**
   * Check if file exists - must be implemented by subclass
   */
  abstract exists(path: string): Promise<boolean>;

  // ========== Common Utility Methods ==========

  /**
   * Check if adapter is available for use
   */
  isAvailable(): boolean {
    return this._ready;
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  // ========== Path Utilities ==========

  /**
   * Normalize file path for consistent handling
   * - Removes leading/trailing slashes
   * - Removes duplicate slashes
   * - Converts backslashes to forward slashes
   */
  protected normalizePath(path: string): string {
    return path
      .replace(/\\/g, '/') // Convert backslashes to forward slashes
      .replace(/\/+/g, '/') // Remove duplicate slashes
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/+$/, ''); // Remove trailing slashes
  }

  /**
   * Join path segments
   */
  protected joinPath(...segments: string[]): string {
    return segments
      .filter(s => s !== null && s !== undefined && s !== '')
      .map(s => s.replace(/(^\/+|\/+$)/g, ''))
      .join('/');
  }

  /**
   * Get file extension from path
   */
  protected getExtension(path: string): string {
    const match = path.match(/\.([^./]+)$/);
    return match ? match[1] : '';
  }

  /**
   * Get parent directory path
   */
  protected getParentPath(path: string): string {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  }

  /**
   * Get basename from path
   */
  protected getBasename(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
  }

  // ========== Metadata Utilities ==========

  /**
   * Create FileMetadata object
   */
  protected createMetadata(
    path: string,
    size: number,
    lastModified: number,
    contentType?: string
  ): FileMetadata {
    return {
      path: this.normalizePath(path),
      size,
      lastModified,
      contentType: contentType || this.guessContentType(path),
    };
  }

  /**
   * Guess content type from file extension
   */
  protected guessContentType(path: string): string | undefined {
    const ext = this.getExtension(path).toLowerCase();
    const contentTypes: Record<string, string> = {
      // Text files
      'ts': 'text/typescript',
      'tsx': 'text/typescript',
      'js': 'text/javascript',
      'jsx': 'text/javascript',
      'mjs': 'text/javascript',
      'cjs': 'text/javascript',
      'json': 'application/json',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'scss': 'text/x-scss',
      'sass': 'text/x-sass',
      'less': 'text/x-less',
      'xml': 'text/xml',
      'svg': 'image/svg+xml',
      'yaml': 'text/x-yaml',
      'yml': 'text/x-yaml',

      // Binary files
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'ico': 'image/x-icon',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',

      // Fonts
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'otf': 'font/otf',
      'eot': 'application/vnd.ms-fontobject',
    };
    return contentTypes[ext];
  }

  // ========== Content Conversion Utilities ==========

  /**
   * Convert Uint8Array to string
   */
  protected uint8ArrayToString(data: Uint8Array): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(data);
  }

  /**
   * Convert string to Uint8Array
   */
  protected stringToUint8Array(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * Create FileContent object from Uint8Array
   */
  protected createFileContent(path: string, data: Uint8Array): FileContent {
    const metadata = this.createMetadata(
      path,
      data.length,
      Date.now(),
      this.guessContentType(path)
    );

    return {
      path: this.normalizePath(path),
      data,
      text: this.uint8ArrayToString(data),
      metadata,
    };
  }

  /**
   * Create FileContent object from string
   */
  protected createFileContentFromText(path: string, text: string): FileContent {
    const data = this.stringToUint8Array(text);
    return this.createFileContent(path, data);
  }

  // ========== Logging Helpers ==========

  /**
   * Log debug message
   */
  protected debug(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`[${this.name}] ${message}`, ...args);
    }
  }

  /**
   * Log warning
   */
  protected warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.name}] ${message}`, ...args);
  }

  /**
   * Log error
   */
  protected error(message: string, ...args: unknown[]): void {
    console.error(`[${this.name}] ${message}`, ...args);
  }
}
