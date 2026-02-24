/**
 * @fileoverview File CRUD Types
 * @module domain/services/file-crud/file-crud-types
 *
 * Shared types for unified file CRUD operations.
 * Provides consistent result types for both user and agent operations.
 *
 * @epic EPIC-FS - File System & Workspace Architecture
 * @story FS-06 - Unified CRUD interface for users + agents
 */

import { z } from 'zod';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

// ============================================================================
// Operation Source
// ============================================================================

/**
 * Source of the CRUD operation
 * - 'user': Triggered by user through UI
 * - 'agent': Triggered by AI agent through tools
 */
export type OperationSource = 'user' | 'agent';

export const OperationSourceSchema = z.enum(['user', 'agent']);

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standard error codes for CRUD operations
 */
export type CrudErrorCode =
  | 'FILE_NOT_FOUND'
  | 'FILE_EXISTS'
  | 'PERMISSION_DENIED'
  | 'LOCK_TIMEOUT'
  | 'INVALID_PATH'
  | 'READ_ERROR'
  | 'WRITE_ERROR'
  | 'DELETE_ERROR'
  | 'MOVE_ERROR'
  | 'COPY_ERROR'
  | 'LIST_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export const CrudErrorCodeSchema = z.enum([
  'FILE_NOT_FOUND',
  'FILE_EXISTS',
  'PERMISSION_DENIED',
  'LOCK_TIMEOUT',
  'INVALID_PATH',
  'READ_ERROR',
  'WRITE_ERROR',
  'DELETE_ERROR',
  'MOVE_ERROR',
  'COPY_ERROR',
  'LIST_ERROR',
  'VALIDATION_ERROR',
  'UNKNOWN_ERROR',
]);

// ============================================================================
// CRUD Error
// ============================================================================

/**
 * Structured error for CRUD operations
 */
export interface CrudError {
  code: CrudErrorCode;
  message: string;
  details?: unknown;
  path?: string;
}

export const CrudErrorSchema = z.object({
  code: CrudErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
  path: z.string().optional(),
});

// ============================================================================
// CRUD Result
// ============================================================================

/**
 * Unified result type for all CRUD operations
 *
 * @example Success
 * ```typescript
 * const result: CrudResult<string> = {
 *   success: true,
 *   data: 'file contents...'
 * };
 * ```
 *
 * @example Failure
 * ```typescript
 * const result: CrudResult<string> = {
 *   success: false,
 *   error: {
 *     code: 'FILE_NOT_FOUND',
 *     message: 'File does not exist',
 *     path: '/path/to/file.txt'
 *   }
 * };
 * ```
 */
export type CrudResult<T> =
  | { success: true; data: T }
  | { success: false; error: CrudError };

/**
 * Create a successful result
 */
export function success<T>(data: T): CrudResult<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
export function failure<T>(error: CrudError): CrudResult<T> {
  return { success: false, error };
}

/**
 * Create a failure result from code and message
 */
export function failureFrom<T>(
  code: CrudErrorCode,
  message: string,
  path?: string,
  details?: unknown
): CrudResult<T> {
  return { success: false, error: { code, message, path, details } };
}

// ============================================================================
// File Metadata
// ============================================================================

/**
 * Content type for files
 */
export type ContentType =
  | 'text'
  | 'markdown'
  | 'code'
  | 'json'
  | 'pdf'
  | 'image'
  | 'binary'
  | 'unknown';

/**
 * File metadata returned by CRUD operations
 */
export interface FileMetadata {
  path: string;
  name: string;
  extension?: string;
  contentType: ContentType;
  size?: number;
  lastModified?: string;
  mimeType?: string;
}

export const FileMetadataSchema = z.object({
  path: z.string(),
  name: z.string(),
  extension: z.string().optional(),
  contentType: z.enum([
    'text',
    'markdown',
    'code',
    'json',
    'pdf',
    'image',
    'binary',
    'unknown',
  ]),
  size: z.number().optional(),
  lastModified: z.string().optional(),
  mimeType: z.string().optional(),
});

/**
 * File entry for list operations
 */
export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  contentType?: ContentType;
}

export const FileEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory']),
  size: z.number().optional(),
  lastModified: z.string().optional(),
  contentType: z.enum([
    'text',
    'markdown',
    'code',
    'json',
    'pdf',
    'image',
    'binary',
    'unknown',
  ]).optional(),
});

// ============================================================================
// Operation Options
// ============================================================================

/**
 * Base options for all CRUD operations
 */
export interface BaseCrudOptions {
  /** Source of the operation (user or agent) */
  source: OperationSource;
  /** Use file lock for this operation (default: true for writes) */
  useLock?: boolean;
  /** Target workspace type */
  workspaceType?: WorkspaceType;
  /** Operation timeout in milliseconds */
  timeout?: number;
}

/**
 * Options for create operation
 */
export interface CreateOptions extends BaseCrudOptions {
  /** Overwrite if file exists (default: false) */
  overwrite?: boolean;
  /** Create parent directories if needed (default: true) */
  createParents?: boolean;
}

/**
 * Options for read operation
 */
export interface ReadOptions extends BaseCrudOptions {
  /** Encoding for text files (default: 'utf-8') */
  encoding?: 'utf-8' | 'binary';
}

/**
 * Options for update operation
 */
export interface UpdateOptions extends BaseCrudOptions {
  /** Create file if it doesn't exist (default: false) */
  createIfMissing?: boolean;
}

/**
 * Options for delete operation
 */
export interface DeleteOptions extends BaseCrudOptions {
  /** Ignore if file doesn't exist (default: false) */
  ignoreNotFound?: boolean;
  /** Delete directory recursively (default: false) */
  recursive?: boolean;
}

/**
 * Options for list operation
 */
export interface ListOptions extends BaseCrudOptions {
  /** List recursively (default: false) */
  recursive?: boolean;
  /** Filter by file extensions */
  extensions?: string[];
  /** Filter by content types */
  contentTypes?: ContentType[];
}

/**
 * Options for move operation
 */
export interface MoveOptions extends BaseCrudOptions {
  /** Overwrite destination if exists (default: false) */
  overwrite?: boolean;
}

/**
 * Options for copy operation
 */
export interface CopyOptions extends BaseCrudOptions {
  /** Overwrite destination if exists (default: false) */
  overwrite?: boolean;
}

// ============================================================================
// Content Type Detection
// ============================================================================

/**
 * Detect content type from file extension
 */
export function detectContentType(path: string): ContentType {
  const ext = path.split('.').pop()?.toLowerCase() || '';

  const codeExtensions = [
    'ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h',
    'css', 'scss', 'less', 'html', 'xml', 'vue', 'svelte', 'astro',
  ];

  const markdownExtensions = ['md', 'mdx', 'markdown'];
  const jsonExtensions = ['json', 'jsonl', 'yaml', 'yml', 'toml'];
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'];

  if (ext === 'pdf') return 'pdf';
  if (imageExtensions.includes(ext)) return 'image';
  if (markdownExtensions.includes(ext)) return 'markdown';
  if (jsonExtensions.includes(ext)) return 'json';
  if (codeExtensions.includes(ext)) return 'code';
  if (ext === 'txt') return 'text';

  return 'unknown';
}

/**
 * Get MIME type from content type
 */
export function getMimeType(contentType: ContentType, extension?: string): string {
  const mimeTypes: Record<ContentType, string> = {
    text: 'text/plain',
    markdown: 'text/markdown',
    code: 'text/plain',
    json: 'application/json',
    pdf: 'application/pdf',
    image: extension === 'svg' ? 'image/svg+xml' : 'image/png',
    binary: 'application/octet-stream',
    unknown: 'application/octet-stream',
  };

  return mimeTypes[contentType];
}

/**
 * Create file metadata from path
 */
export function createFileMetadata(
  path: string,
  options?: { size?: number; lastModified?: string }
): FileMetadata {
  const name = path.split('/').pop() || path;
  const extension = name.includes('.') ? name.split('.').pop() : undefined;
  const contentType = detectContentType(path);

  return {
    path,
    name,
    extension,
    contentType,
    mimeType: getMimeType(contentType, extension),
    size: options?.size,
    lastModified: options?.lastModified,
  };
}
