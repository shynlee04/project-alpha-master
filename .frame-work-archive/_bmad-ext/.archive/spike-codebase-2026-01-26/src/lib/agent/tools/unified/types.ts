/**
 * @fileoverview Unified Tool Types
 * @module lib/agent/tools/unified/types
 *
 * Shared types for unified file operations.
 */

import { z } from 'zod';

/**
 * Content types supported by unified tools
 */
export const ContentTypeSchema = z.enum([
  'text',
  'markdown',
  'code',
  'json',
  'pdf',
  'image',
  'binary',
  'unknown',
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

/**
 * File metadata returned by unified operations
 */
export const FileMetadataSchema = z.object({
  path: z.string(),
  name: z.string(),
  extension: z.string().optional(),
  contentType: ContentTypeSchema,
  size: z.number().optional(),
  lastModified: z.string().optional(),
  mimeType: z.string().optional(),
});
export type FileMetadata = z.infer<typeof FileMetadataSchema>;

/**
 * Unified read result
 */
export const ReadResultSchema = z.object({
  success: z.boolean(),
  content: z.string().optional(),
  metadata: FileMetadataSchema.optional(),
  error: z.string().optional(),
});
export type ReadResult = z.infer<typeof ReadResultSchema>;

/**
 * Unified write result
 */
export const WriteResultSchema = z.object({
  success: z.boolean(),
  path: z.string().optional(),
  metadata: FileMetadataSchema.optional(),
  error: z.string().optional(),
});
export type WriteResult = z.infer<typeof WriteResultSchema>;

/**
 * Unified delete result
 */
export const DeleteResultSchema = z.object({
  success: z.boolean(),
  path: z.string().optional(),
  error: z.string().optional(),
});
export type DeleteResult = z.infer<typeof DeleteResultSchema>;

/**
 * File info for list operations
 */
export const FileInfoSchema = z.object({
  path: z.string(),
  name: z.string(),
  isDirectory: z.boolean(),
  size: z.number().optional(),
  lastModified: z.string().optional(),
  contentType: ContentTypeSchema.optional(),
});
export type FileInfo = z.infer<typeof FileInfoSchema>;

/**
 * Unified list result
 */
export const ListResultSchema = z.object({
  success: z.boolean(),
  files: z.array(FileInfoSchema).optional(),
  error: z.string().optional(),
});
export type ListResult = z.infer<typeof ListResultSchema>;

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
 * Workspace context for unified operations
 */
export interface UnifiedToolContext {
  /** Current workspace type */
  workspaceType: 'ide' | 'notes' | 'knowledge' | 'study';
  /** File system adapter (IDE workspace) */
  fileAdapter?: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    listFiles: (path: string, recursive?: boolean) => Promise<string[]>;
  };
  /** Note service (Notes workspace) */
  noteService?: {
    getNote: (id: string) => Promise<{ id: string; title: string; content: string } | null>;
    createNote: (title: string, content: string, parentId?: string) => Promise<{ id: string }>;
    updateNote: (id: string, updates: { title?: string; content?: string }) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    listNotes: (parentId?: string) => Promise<Array<{ id: string; title: string }>>;
  };
}
